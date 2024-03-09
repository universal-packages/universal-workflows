import { gatherAdapters } from '@universal-packages/adapter-resolver'
import { EmittedEvent, EventIn } from '@universal-packages/event-emitter'
import { loadModules } from '@universal-packages/module-loader'
import { loadPluginConfig } from '@universal-packages/plugin-config-loader'
import { BaseRunner, EngineInterfaceClass, ExecEngine, ForkEngine, SpawnEngine, Status, TestEngine } from '@universal-packages/sub-process'
import { evaluate } from '@universal-packages/variable-replacer'
import Ajv from 'ajv'
import { camelCase, pascalCase } from 'change-case'
import os from 'os'

import {
  BuildFromOptions,
  CombinationItem,
  OnFailureAction,
  Routine,
  RoutineOptions,
  RunDescriptor,
  RunDescriptorStatus,
  RunDescriptorStrategyStatus,
  RunDescriptors,
  RunQueueEntry,
  StrategyRunDescriptor,
  WorkflowGraph
} from '.'
import BaseUsable from './BaseUsable'
import { workflowSchema } from './Workflow.schema'
import { Targets, UsableMap, WorkflowOptions } from './Workflow.types'

export default class Workflow extends BaseRunner<WorkflowOptions> {
  public readonly name: string

  public get graph(): WorkflowGraph {
    return {
      endedAt: this.internalEndedAt ? new Date(this.internalEndedAt) : null,
      error: this.internalError ? this.internalError.message : null,
      measurement: this.measurement || null,
      name: this.options.name || null,
      startedAt: this.internalStartedAt ? new Date(this.internalStartedAt) : null,
      status: this.status,
      routines: Object.keys(this.runDescriptors).reduce((accumulation, routineName) => {
        const runDescriptor = this.runDescriptors[routineName]

        while (accumulation.length < runDescriptor.stage) accumulation.push([])

        if (runDescriptor.routine) {
          accumulation[runDescriptor.stage - 1].push(runDescriptor.routine.graph)
        } else {
          const strategyRoutineGraphs = runDescriptor.strategyRunDescriptors.map((strategyRunDescriptor) => {
            return {
              ...strategyRunDescriptor.routine.graph,
              variables: strategyRunDescriptor.variables
            }
          })

          accumulation[runDescriptor.stage - 1].push({
            error: runDescriptor.error || null,
            name: runDescriptor.name,
            strategy: strategyRoutineGraphs
          })
        }

        return accumulation
      }, [])
    }
  }

  private readonly targets: Targets = {}
  private readonly usableMap: UsableMap = {}
  private readonly runDescriptors: RunDescriptors = {}
  private readonly scope: Record<string, any> = {}

  private runQueue: RunQueueEntry[] = []
  private runConcurrency = 0

  private resolveRun: () => void

  public constructor(options?: WorkflowOptions) {
    super({
      stepUsableLocation: './src',
      ...options,
      maxConcurrentRoutines: Math.max(options?.maxConcurrentRoutines || os.cpus().length - 1, 1),
      targets: {
        ...{
          spawn: { engine: 'spawn' },
          exec: { engine: 'exec' },
          fork: { engine: 'fork' },
          test: { engine: 'test' }
        },
        ...options?.targets
      }
    })

    this.name = this.options.name
  }

  public static buildFrom(name: string, options?: BuildFromOptions): Workflow {
    const finalOptions: BuildFromOptions = { stepUsableLocation: './src', workflowsLocation: './', ...options }

    const workflowDescriptors = loadPluginConfig('universal-workflows', { loadFrom: finalOptions.workflowsLocation }) || {}

    const workflowDescriptor = workflowDescriptors[name]

    if (!workflowDescriptor) throw new Error(`Unrecognized workflow: ${name}\n\nAvailable workflows: ${Object.keys(workflowDescriptors).join('\n')}`)

    const ajv = new Ajv({ allowUnionTypes: true })
    const validate = ajv.compile(workflowSchema)

    validate(workflowDescriptor)

    const errors = validate.errors

    if (errors) {
      const baseMessage = `Workflow "${name}" is invalid:\n\n`
      const schemaErrors = errors
        .map((error) => {
          const instancePath = error.instancePath
          const message = error.message
          const allowedValues = error.params.allowedValues ? ` ${JSON.stringify(error.params.allowedValues)}` : ''

          return `${instancePath} ${message}${allowedValues}`.trim()
        })
        .join('\n')
      const message = `${baseMessage}${schemaErrors}`

      throw new Error(message)
    }

    return new Workflow({ stepUsableLocation: finalOptions.stepUsableLocation, ...workflowDescriptor })
  }

  protected async internalPrepare(): Promise<void> {
    await this.loadTargets()
    await this.loadUsableMap()
    this.generateRunDescriptors()
  }

  protected async internalRun(onRunning: () => void): Promise<void> {
    const rootRunDescriptors: RunDescriptor[] = Object.keys(this.runDescriptors)
      .map((routineName) => this.runDescriptors[routineName])
      .filter((runDescriptor) => runDescriptor.stage === 1)

    return new Promise((resolve) => {
      this.resolveRun = resolve

      for (let i = 0; i < rootRunDescriptors.length; i++) {
        const runDescriptor = rootRunDescriptors[i]

        if (runDescriptor.routine) {
          this.runRoutine(runDescriptor, i === 0 ? onRunning : undefined)
        } else {
          this.runStrategy(runDescriptor, i === 0 ? onRunning : undefined)
        }
      }

      this.runNext()
    })
  }

  protected async internalStop(): Promise<void> {
    for (let i = 0; i < this.runQueue.length; i++) {
      this.runQueue[i].runDescriptor.status = RunDescriptorStatus.Canceled
    }

    for (let i = 0; i < Object.keys(this.runDescriptors).length; i++) {
      const runDescriptor = this.runDescriptors[Object.keys(this.runDescriptors)[i]]

      if (runDescriptor.routine) {
        runDescriptor.routine.stop()
      } else {
        for (let j = 0; j < runDescriptor.strategyRunDescriptors.length; j++) {
          const strategyRunDescriptor = runDescriptor.strategyRunDescriptors[j]

          strategyRunDescriptor.routine.stop()
        }
      }
    }
  }

  private runNext(): void {
    if (this.runConcurrency < this.options.maxConcurrentRoutines) {
      const next = this.runQueue.shift()

      if (next) {
        this.runConcurrency++

        next.run().then(() => {
          this.runConcurrency--
          this.runNext()
        })

        this.runNext()
      }
    }
  }

  private async runRoutine(runDescriptor: RunDescriptor, onRunning?: () => void): Promise<void> {
    runDescriptor.status = RunDescriptorStatus.Running

    if (this.shouldSkipRunDescriptor(runDescriptor)) {
      runDescriptor.routine.once(Status.Skipped, () => this.emit(`routine:${Status.Skipped}`, { payload: { name: runDescriptor.name } }))
      runDescriptor.routine.skip()
      runDescriptor.status = RunDescriptorStatus.Skipped

      if (onRunning) onRunning()

      this.handleAfterRunDescriptorFinished(runDescriptor)

      return
    }

    runDescriptor.routine.once(Status.Running, () => {
      this.emit(`routine:${Status.Running}`, { payload: { name: runDescriptor.name } })
      if (onRunning) onRunning()
    })
    runDescriptor.routine.once(Status.Stopping, () => {
      this.emit(`routine:${Status.Stopping}`, { payload: { name: runDescriptor.name } })
    })
    runDescriptor.routine.once(Status.Success, () => {
      runDescriptor.status = RunDescriptorStatus.Success
      this.emit(`routine:${Status.Success}`, { payload: { name: runDescriptor.name } })
    })
    runDescriptor.routine.on('step:*', (event) => {
      const newEvent: EventIn = { payload: { ...event.payload, routine: runDescriptor.name } }
      if (event.error) newEvent.error = event.error
      this.emit(event.event, newEvent)
    })

    this.runQueue.push({
      run: async () => {
        try {
          await runDescriptor.routine.run()
        } catch (error) {
          this.emit(`routine:${runDescriptor.routine.status}`, { error, payload: { name: runDescriptor.name } })

          if (runDescriptor.routineDescriptor.onFailure === OnFailureAction.Continue) {
            runDescriptor.status = RunDescriptorStatus.Success
          } else {
            this.cancelDependents(runDescriptor)

            if (runDescriptor.routine.status === Status.Stopped) {
              runDescriptor.status = RunDescriptorStatus.Stopped
            } else {
              runDescriptor.status = RunDescriptorStatus.Failure
            }
          }
        } finally {
          this.handleAfterRunDescriptorFinished(runDescriptor)

          runDescriptor.routine.removeAllListeners()
        }
      },
      runDescriptor
    })
  }

  private async runStrategy(runDescriptor: RunDescriptor, onRunning?: () => void): Promise<void> {
    runDescriptor.status = RunDescriptorStatus.Running

    if (this.shouldSkipRunDescriptor(runDescriptor)) {
      this.emit(`routine:${Status.Skipped}`, { payload: { name: runDescriptor.name } })
      runDescriptor.strategyRunDescriptors.forEach((strategyRunDescriptor) => strategyRunDescriptor.routine.skip())
      runDescriptor.status = RunDescriptorStatus.Skipped

      if (onRunning) onRunning()

      this.handleAfterRunDescriptorFinished(runDescriptor)

      return
    }

    if (runDescriptor.strategyStatus === RunDescriptorStrategyStatus.Pending) {
      const strategy = runDescriptor.routineDescriptor.strategy
      if (typeof strategy.matrix === 'string') {
        const matrix = this.evaluateExpression(strategy.matrix, { ...this.scope })

        if (typeof matrix === 'object') {
          runDescriptor.routineDescriptor.strategy.matrix = matrix
        } else {
          runDescriptor.status = RunDescriptorStatus.Failure
          runDescriptor.error = 'Strategy matrix did not evaluate to an object'

          this.handleAfterRunDescriptorFinished(runDescriptor)
          return
        }
      }

      if (typeof strategy.include === 'string') {
        const include = this.evaluateExpression(strategy.include, { ...this.scope })

        if (Array.isArray(include) && include.every((includeItem: any) => typeof includeItem === 'object')) {
          runDescriptor.routineDescriptor.strategy.include = include
        } else {
          runDescriptor.status = RunDescriptorStatus.Failure
          runDescriptor.error = 'Strategy include did not evaluate to an array if objects'

          this.handleAfterRunDescriptorFinished(runDescriptor)
          return
        }
      }

      try {
        this.generateStrategy(runDescriptor)
      } catch (error) {
        runDescriptor.status = RunDescriptorStatus.Failure
        runDescriptor.error = error.message

        this.handleAfterRunDescriptorFinished(runDescriptor)
        return
      }

      runDescriptor.strategyStatus = RunDescriptorStrategyStatus.Ready
    }

    const { strategyRunDescriptors } = runDescriptor

    const allStrategyRoutinesFinished = (): boolean => {
      return strategyRunDescriptors.every((strategyRunDescriptor) => {
        return strategyRunDescriptor.routine.status !== Status.Running && strategyRunDescriptor.routine.status !== Status.Stopping
      })
    }

    const allStrategyRoutinesSucceed = (): boolean => {
      return strategyRunDescriptors.every((strategyRunDescriptor) => {
        return strategyRunDescriptor.routine.status === Status.Success
      })
    }

    const anyStrategyRoutinesFailed = (): boolean => {
      return strategyRunDescriptors.some((strategyRunDescriptor) => {
        return strategyRunDescriptor.routine.status === Status.Failure
      })
    }

    for (let i = 0; i < strategyRunDescriptors.length; i++) {
      const strategyRunDescriptor = strategyRunDescriptors[i]

      strategyRunDescriptor.routine.once(Status.Running, () => {
        this.emit(`routine:${Status.Running}`, { payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index } })
        if (onRunning && i == 0) onRunning()
      })
      strategyRunDescriptor.routine.once(Status.Stopping, () => {
        this.emit(`routine:${Status.Stopping}`, { payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index } })
      })

      strategyRunDescriptor.routine.on('step:*', (event) => {
        const newEvent: EventIn = {
          payload: {
            ...event.payload,
            routine: strategyRunDescriptor.routine.name,
            strategy: runDescriptor.name,
            strategyIndex: strategyRunDescriptor.index
          }
        }
        if (event.error) newEvent.error = event.error
        this.emit(event.event, newEvent)
      })

      strategyRunDescriptor.routine.once(Status.Success, () =>
        this.emit(`routine:${Status.Success}`, { payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index } })
      )

      strategyRunDescriptor.routine.once(Status.Failure, (event) =>
        this.emit(`routine:${Status.Failure}`, {
          error: event.error,
          payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index }
        })
      )

      strategyRunDescriptor.routine.once(Status.Stopped, (event) =>
        this.emit(`routine:${Status.Stopped}`, {
          error: event.error,
          payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index }
        })
      )

      strategyRunDescriptor.routine.once(Status.Error, (event) =>
        this.emit(`routine:${Status.Error}`, {
          error: event.error,
          payload: { name: strategyRunDescriptor.routine.name, strategy: runDescriptor.name, strategyIndex: strategyRunDescriptor.index }
        })
      )

      strategyRunDescriptor.routine.once('end', (event: EmittedEvent) => {
        strategyRunDescriptor.routine.removeAllListeners()

        if (event.error && runDescriptor.routineDescriptor.strategy.onFailure !== OnFailureAction.Continue) {
          for (let j = 0; j < strategyRunDescriptors.length; j++) {
            const strategyRunDescriptorToStop = strategyRunDescriptors[j]

            strategyRunDescriptorToStop.routine.stop()
          }
        }

        if (allStrategyRoutinesFinished() && runDescriptor.status === RunDescriptorStatus.Running) {
          if (allStrategyRoutinesSucceed()) {
            runDescriptor.status = RunDescriptorStatus.Success
          } else {
            if (anyStrategyRoutinesFailed()) {
              if (runDescriptor.routineDescriptor.onFailure === OnFailureAction.Continue) {
                runDescriptor.status = RunDescriptorStatus.Success
              } else {
                this.cancelDependents(runDescriptor)

                runDescriptor.status = RunDescriptorStatus.Failure
              }
            } else {
              this.cancelDependents(runDescriptor)

              runDescriptor.status = RunDescriptorStatus.Stopped
            }
          }

          this.handleAfterRunDescriptorFinished(runDescriptor)
        }
      })

      this.runQueue.push({ run: async () => strategyRunDescriptor.routine.run(), runDescriptor })
    }
  }

  private async runDependents(runDescriptor: RunDescriptor): Promise<void> {
    const dependents = runDescriptor.dependents

    for (let i = 0; i < dependents.length; i++) {
      const dependentRunDescriptor = dependents[i]

      dependentRunDescriptor.dependsOnReady[runDescriptor.name] = true

      if (dependentRunDescriptor.status === RunDescriptorStatus.Canceled) continue

      const dependentAllDependenciesReady = Object.keys(dependentRunDescriptor.dependsOnReady).every((routineName) => dependentRunDescriptor.dependsOnReady[routineName])

      if (dependentAllDependenciesReady) {
        if (dependentRunDescriptor.routine) {
          this.runRoutine(dependentRunDescriptor)
        } else {
          this.runStrategy(dependentRunDescriptor)
        }
      }
    }
  }

  private handleAfterRunDescriptorFinished(runDescriptor: RunDescriptor): void {
    if (this.allRunDescriptorsDone()) {
      this.runQueue = []

      if (this.allRunDescriptorsSucceeded()) {
        this.internalStatus = Status.Success
      } else if (this.anyRunDescriptorStopped()) {
        this.internalStatus = Status.Stopped
        this.internalError = new Error('Workflow was stopped')
      } else {
        this.internalStatus = Status.Failure
        this.internalError = new Error(`Workflow failed`)
      }

      this.resolveRun()
    } else if (runDescriptor.status === RunDescriptorStatus.Success || runDescriptor.status === RunDescriptorStatus.Skipped) {
      this.runDependents(runDescriptor)
    }
  }

  private cancelDependents(runDescriptor: RunDescriptor): void {
    const dependents = runDescriptor.dependents

    for (let i = 0; i < dependents.length; i++) {
      const dependentRunDescriptor = dependents[i]

      dependentRunDescriptor.status = RunDescriptorStatus.Canceled

      this.cancelDependents(dependentRunDescriptor)
    }
  }

  private allRunDescriptorsDone(): boolean {
    return Object.keys(this.runDescriptors).every((routineName) => {
      const runDescriptor = this.runDescriptors[routineName]

      return runDescriptor.status !== RunDescriptorStatus.Running && runDescriptor.status !== RunDescriptorStatus.Pending
    })
  }

  private allRunDescriptorsSucceeded(): boolean {
    return Object.keys(this.runDescriptors).every((routineName) => {
      const runDescriptor = this.runDescriptors[routineName]

      return runDescriptor.status === RunDescriptorStatus.Success || runDescriptor.status === RunDescriptorStatus.Skipped
    })
  }

  private anyRunDescriptorStopped(): boolean {
    return Object.keys(this.runDescriptors).some((routineName) => {
      const runDescriptor = this.runDescriptors[routineName]

      return runDescriptor.status === RunDescriptorStatus.Stopped
    })
  }

  private shouldSkipRunDescriptor(runDescriptor: RunDescriptor): boolean {
    if (runDescriptor.routineDescriptor.if) {
      return !this.evaluateExpression(runDescriptor.routineDescriptor.if, { ...this.scope })
    } else if (runDescriptor.routineDescriptor.unless) {
      return !!this.evaluateExpression(runDescriptor.routineDescriptor.unless, { ...this.scope })
    }

    return false
  }

  private evaluateExpression(expression: string, scope: Record<string, any>): any {
    const finalIf = expression.replace(/(\$\{\{\s*|\s*\}\})/g, '')
    return evaluate(finalIf, scope)
  }

  private generateRunDescriptors(): void {
    const { routines: routineDescriptors } = this.options
    const routineNames = Object.keys(routineDescriptors)

    for (let i = 0; i < routineNames.length; i++) {
      const currentRoutineName = routineNames[i]

      this.runDescriptors[currentRoutineName] = {
        dependents: [],
        dependsOnReady: {},
        name: currentRoutineName,
        routine: null,
        routineDescriptor: routineDescriptors[currentRoutineName],
        routineOptions: null,
        stage: 0,
        status: RunDescriptorStatus.Pending,
        strategyRunDescriptors: []
      }
    }

    const processRunDescriptor = (routineName: string, originalRoutineName?: string, childRoutineName?: string) => {
      const runDescriptor = this.runDescriptors[routineName]
      const dependsOn = [].concat(runDescriptor.routineDescriptor.dependsOn || [])

      if (childRoutineName) {
        runDescriptor.dependents.push(this.runDescriptors[childRoutineName])
      }

      if (dependsOn.length) {
        for (let i = 0; i < dependsOn.length; i++) {
          const dependencyRoutineName = dependsOn[i]

          if (routineNames.includes(dependencyRoutineName)) {
            if (dependencyRoutineName === originalRoutineName) {
              for (let i = 0; i < routineNames.length; i++) {
                delete this.runDescriptors[routineNames[i]]
              }

              throw new Error(`Routine "${originalRoutineName}" has a circular dependency all the way to "${routineName}".`)
            }

            runDescriptor.dependsOnReady[dependencyRoutineName] = false
            processRunDescriptor(dependencyRoutineName, originalRoutineName, routineName)
          } else {
            for (let i = 0; i < routineNames.length; i++) {
              delete this.runDescriptors[routineNames[i]]
            }

            throw new Error(`Routine "${routineName}" depends on "${dependencyRoutineName}" which does not exist.`)
          }
        }
      }
    }

    for (let i = 0; i < routineNames.length; i++) {
      const currentRoutineName = routineNames[i]

      processRunDescriptor(currentRoutineName, currentRoutineName)
    }

    for (let i = 0; i < routineNames.length; i++) {
      const currentRoutineName = routineNames[i]
      const currentRunDescriptor = this.runDescriptors[currentRoutineName]

      currentRunDescriptor.dependents = currentRunDescriptor.dependents.filter((value, index, self) => self.indexOf(value) === index)
    }

    const setRunDescriptorState = (runDescriptor: RunDescriptor, stage: number) => {
      if (runDescriptor.stage < stage) runDescriptor.stage = stage

      for (let i = 0; i < runDescriptor.dependents.length; i++) {
        const dependantRunDescriptor = runDescriptor.dependents[i]

        setRunDescriptorState(dependantRunDescriptor, stage + 1)
      }
    }

    for (let i = 0; i < routineNames.length; i++) {
      const currentRoutineName = routineNames[i]
      const currentRunDescriptor = this.runDescriptors[currentRoutineName]

      if (Object.keys(currentRunDescriptor.dependsOnReady).length === 0) setRunDescriptorState(currentRunDescriptor, 1)
    }

    for (let i = 0; i < routineNames.length; i++) {
      const currentRoutineName = routineNames[i]
      const currentRunDescriptor = this.runDescriptors[currentRoutineName]
      const currentRoutineDescriptor = currentRunDescriptor.routineDescriptor

      const { target: descriptorTarget, strategy, ...currentRoutineDescriptorWithoutTarget } = currentRoutineDescriptor

      currentRunDescriptor.routineOptions = {
        name: currentRoutineName,
        scope: this.scope,
        targets: this.targets,
        usableMap: this.usableMap,
        ...currentRoutineDescriptorWithoutTarget
      }
      if (this.options.environment || currentRoutineDescriptorWithoutTarget.environment)
        currentRunDescriptor.routineOptions.environment = { ...this.options.environment, ...currentRoutineDescriptorWithoutTarget.environment }
      if (descriptorTarget) {
        if (this.targets[descriptorTarget]) {
          currentRunDescriptor.routineOptions.target = this.targets[descriptorTarget]
        } else {
          throw new Error(`The target "${descriptorTarget}" was not found in the targets map`)
        }
      } else if (this.options.target) {
        if (this.targets[this.options.target]) {
          currentRunDescriptor.routineOptions.target = this.targets[this.options.target]
        } else {
          throw new Error(`The target "${this.options.target}" was not found in the targets map`)
        }
      }
      if (currentRoutineDescriptorWithoutTarget.workingDirectory) {
        currentRunDescriptor.routineOptions.workingDirectory = currentRunDescriptor.routineOptions.workingDirectory
      } else if (this.options.workingDirectory) {
        currentRunDescriptor.routineOptions.workingDirectory = this.options.workingDirectory
      }

      if (strategy) {
        if (strategy.matrix || strategy.include) {
          if (typeof strategy.matrix === 'string' || typeof strategy.include === 'string') {
            currentRunDescriptor.strategyStatus = RunDescriptorStrategyStatus.Pending
          } else {
            this.generateStrategy(currentRunDescriptor)
          }
        } else {
          throw new Error('Strategy matrix or include must be specified')
        }
      } else {
        currentRunDescriptor.routine = new Routine(currentRunDescriptor.routineOptions)
      }
    }
  }

  private generateStrategy(runDescriptor: RunDescriptor): void {
    const strategy = runDescriptor.routineDescriptor.strategy
    const matrix = (strategy.matrix || {}) as Record<string, string[] | number[] | boolean[]>
    const include = (strategy.include || []) as Record<string, string | number | boolean>[]
    const combinations: CombinationItem[] = []

    const generateBaseCombinations = (keys: string[], index: number, current: Record<string, string | number | boolean>): void => {
      if (index === keys.length) {
        combinations.push({ original: { ...current }, withIncludes: { ...current } })
        return
      }

      const key = keys[index]
      for (let i = 0; i < matrix[key].length; i++) {
        const currentValue = matrix[key][i]

        generateBaseCombinations(keys, index + 1, { ...current, [key]: currentValue })
      }
    }

    if (!!Object.keys(matrix).length) generateBaseCombinations(Object.keys(matrix), 0, {})

    for (let i = 0; i < include.length; i++) {
      let currentInclude = include[i]

      const mergeWithOriginals =
        !!Object.keys(matrix).length &&
        combinations.some((combination) => {
          return Object.keys(currentInclude).every((key) => combination.original !== null && (!(key in combination.original) || combination.original[key] === currentInclude[key]))
        })

      if (mergeWithOriginals) {
        for (let j = 0; j < combinations.length; j++) {
          const currentCombination = combinations[j]

          const canMerge = Object.keys(currentInclude).every((key) => !(key in currentCombination.original) || currentCombination.original[key] === currentInclude[key])

          if (canMerge) currentCombination.withIncludes = { ...currentCombination.withIncludes, ...currentInclude }
        }
      } else {
        combinations.push({ original: null, withIncludes: currentInclude })
      }
    }

    const finalCombinations = combinations.map((combination) => combination.withIncludes)

    for (let i = 0; i < finalCombinations.length; i++) {
      const currentCombination = finalCombinations[i]
      const currentCombinationName = `${runDescriptor.name} [${i}]`
      const currentRoutineOptionsWithStrategyScope: RoutineOptions = {
        ...runDescriptor.routineOptions,
        name: currentCombinationName,
        strategyScope: { ...currentCombination, index: i }
      }

      const strategyRunDescriptor: StrategyRunDescriptor = {
        index: i,
        name: currentCombinationName,
        variables: currentCombination,
        routine: new Routine(currentRoutineOptionsWithStrategyScope)
      }

      runDescriptor.strategyRunDescriptors.push(strategyRunDescriptor)
    }
  }

  private async loadUsableMap(): Promise<void> {
    const localUsableList = await loadModules(this.options.stepUsableLocation, { conventionPrefix: 'usable' })
    const thirdPartyUsableList = await loadModules('./node_modules', { conventionPrefix: 'universal-usable' })
    const finalUsableList = [...thirdPartyUsableList, ...localUsableList]

    for (let i = 0; i < finalUsableList.length; i++) {
      const currentUsable = finalUsableList[i]

      if (currentUsable.error) {
        throw currentUsable.error
      }
    }

    for (let i = 0; i < finalUsableList.length; i++) {
      const currentUsable = finalUsableList[i]
      const UsableClass: typeof BaseUsable = currentUsable.exports
      const usableName = pascalCase(UsableClass.usableName || UsableClass.name).replace(/Usable$/, '')

      this.usableMap[camelCase(usableName)] = UsableClass
    }
  }

  private async loadTargets(): Promise<void> {
    const knownAdapters = { exec: ExecEngine, fork: ForkEngine, spawn: SpawnEngine, test: TestEngine }
    const gatheredAdapters = gatherAdapters({ domain: 'sub-process', type: 'engine' })
    const finalAdapters = { ...knownAdapters, ...gatheredAdapters }
    const targetsKeys = Object.keys(this.options.targets)

    for (let i = 0; i < targetsKeys.length; i++) {
      const currentTargetKey = targetsKeys[i]
      const currentTarget = this.options.targets[currentTargetKey]

      if (typeof currentTarget.engine === 'string') {
        const GatheredAdapter: EngineInterfaceClass = finalAdapters[currentTarget.engine]

        if (GatheredAdapter) {
          const engine = new GatheredAdapter(currentTarget.engineOptions)

          if (engine.prepare) await engine.prepare()

          this.targets[currentTargetKey] = { engine }
        } else {
          throw new Error(`Target ${currentTargetKey} specifies an unknown engine: ${currentTarget.engine}`)
        }
      } else {
        if (currentTarget.engine.prepare) await currentTarget.engine.prepare()

        this.targets[currentTargetKey] = { engine: currentTarget.engine }
      }
    }
  }
}
