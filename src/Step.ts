import { BaseRunner, Status, SubProcess, SubProcessOptions } from '@universal-packages/sub-process'
import { evaluateAndReplace } from '@universal-packages/variable-replacer'
import { camelCase } from 'change-case'

import { BaseUsable } from '.'
import { StepGraph, StepOptions } from './Step.types'

export default class Step extends BaseRunner<StepOptions> {
  public get graph(): StepGraph {
    return {
      command: this.finalRunCommand || this.options.run || null,
      endedAt: this.internalEndedAt ? new Date(this.internalEndedAt) : null,
      error: this.internalError ? this.internalError.message : null,
      measurement: this.measurement || null,
      name: this.options.name || null,
      output: this.internalOutput || null,
      startedAt: this.internalStartedAt ? new Date(this.internalStartedAt) : null,
      status: this.status,
      usable: this.options.use || null
    }
  }

  public get output(): any {
    return this.internalOutput
  }

  private subProcess: SubProcess
  private usable: BaseUsable
  private internalOutput: any
  private finalRunCommand: string

  public constructor(options: StepOptions) {
    super({ usableMap: {}, ...options })
  }

  protected async internalRun(onRunning: () => void): Promise<void> {
    const scope = { ...this.options.scope }

    if (this.options.strategyScope) scope.strategy = this.options.strategyScope
    if (this.options.routineScope) scope.routine = this.options.routineScope

    if (this.options.run) {
      try {
        this.finalRunCommand = evaluateAndReplace(this.options.run, { scope, enclosures: ['${{', '}}'] })
      } catch (error) {
        this.internalStatus = Status.Error
        this.internalError = error
        return
      }

      let finalWorkingDirectory = this.options.workingDirectory

      if (finalWorkingDirectory) {
        try {
          finalWorkingDirectory = evaluateAndReplace(finalWorkingDirectory, { scope, enclosures: ['${{', '}}'] })
        } catch (error) {
          this.internalStatus = Status.Error
          this.internalError = error
          return
        }
      }

      let finalEnvironment = this.options.environment

      try {
        finalEnvironment = this.evaluateObject(scope, this.options.environment)
      } catch (error) {
        this.internalStatus = Status.Error
        this.internalError = error
        return
      }

      const subProcessOptions: SubProcessOptions = {
        command: this.finalRunCommand,
        input: this.options.input,
        env: finalEnvironment,
        workingDirectory: finalWorkingDirectory
      }

      if (this.options.target) subProcessOptions.engine = this.options.target.engine

      this.subProcess = new SubProcess(subProcessOptions)

      this.subProcess.once('running', onRunning)
      this.subProcess.on('stdout', (event) => this.emit('output', { payload: event.payload }))
      this.subProcess.on('stderr', (event) => this.emit('output', { payload: event.payload }))

      try {
        await this.subProcess.run()
      } catch (error) {
        switch (this.subProcess.status) {
          case Status.Failure:
          case Status.Error:
            this.internalStatus = Status.Failure
            this.internalError = error
            break
          case Status.Stopped:
            this.internalStatus = Status.Stopped
            this.internalError = new Error('Step was stopped')
            break
        }
      } finally {
        this.internalOutput = this.subProcess.stderr.length > 0 ? this.subProcess.stderr : this.subProcess.stdout

        this.stopListeningTo(this.subProcess)
        this.subProcess.removeAllListeners()
        this.subProcess = null
      }
    } else if (this.options.use) {
      const usableName = camelCase(this.options.use)

      const UsableStep = this.options.usableMap[usableName]

      if (UsableStep) {
        let finalEnvironment = this.options.environment
        let finalWith = this.options.with

        try {
          finalEnvironment = this.evaluateObject(scope, this.options.environment)
          finalWith = this.evaluateObject(scope, this.options.with)
        } catch (error) {
          this.internalStatus = Status.Error
          this.internalError = error
          return
        }

        this.usable = new UsableStep({
          environment: finalEnvironment,
          scope: this.options.scope,
          target: this.options.target,
          with: finalWith,
          workingDirectory: this.options.workingDirectory
        })

        this.usable.once('running', onRunning)
        this.listenTo(this.usable, 'output')

        try {
          await this.usable.run()

          this.internalStatus = Status.Success
        } catch (error) {
          switch (this.usable.status) {
            case Status.Failure:
            case Status.Error:
              this.internalStatus = Status.Failure
              this.internalError = error
              break
            case Status.Stopped:
              this.internalStatus = Status.Stopped
              this.internalError = new Error('Step was stopped')
              break
          }
        } finally {
          this.internalOutput = this.usable.output

          this.stopListeningTo(this.usable)
          this.usable.removeAllListeners()
          this.usable = null
        }
      } else {
        throw new Error(`No usable step with the name ${this.options.use} found`)
      }
    } else {
      throw new Error('Nothing to run, please provide either a run or use option')
    }
  }

  protected async internalStop(): Promise<void> {
    if (this.subProcess) return this.subProcess.stop()
    if (this.usable) return this.usable.stop()
  }

  private evaluateObject(scope: Record<string, any>, originalObject?: Record<string, any>): Record<string, any> {
    if (originalObject) {
      const withKeys = Object.keys(originalObject)
      const newWith: Record<string, any> = {}

      for (let i = 0; i < withKeys.length; i++) {
        const key = withKeys[i]
        const value = originalObject[key]

        if (typeof value === 'string') {
          newWith[key] = evaluateAndReplace(value, { scope, enclosures: ['${{', '}}'] })
        } else {
          newWith[key] = value
        }
      }

      return newWith
    }

    return originalObject
  }
}
