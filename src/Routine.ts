import { EmittedEvent } from '@universal-packages/event-emitter'
import { BaseRunner, Status } from '@universal-packages/sub-process'
import { evaluateAndReplace } from '@universal-packages/variable-replacer'

import { OnFailureAction, Step, StepOptions } from '.'
import { RoutineGraph, RoutineOptions } from './Routine.types'

export default class Routine extends BaseRunner<RoutineOptions> {
  public readonly name: string

  public get graph(): RoutineGraph {
    return {
      endedAt: this.internalEndedAt ? new Date(this.internalEndedAt) : null,
      measurement: this.measurement || null,
      name: this.options.name || null,
      startedAt: this.internalStartedAt ? new Date(this.internalStartedAt) : null,
      status: this.status,
      steps: this.steps.map((step) => step.graph)
    }
  }

  private currentStep: Step
  private readonly steps: Step[] = []

  public constructor(options: RoutineOptions) {
    super({ steps: [], usableMap: {}, ...options })

    this.name = this.options.name
  }

  public async internalRun(onRunning: () => void): Promise<void> {
    let onRunningRan = false

    for (let i = 0; i < this.steps.length; i++) {
      this.currentStep = this.steps[i]

      const currentStepDescriptor = this.options.steps[i]
      const scope = this.options.strategyScope ? { ...this.options.scope, strategy: this.options.strategyScope } : { ...this.options.scope }

      this.currentStep.once(Status.Skipped, () => this.emit(`step:${Status.Skipped}`, { payload: { index: i } }))

      if (currentStepDescriptor.if) {
        const finalIf = `$<<${currentStepDescriptor.if.replace(/(\$<<\s*|\s*>>)/g, '')}>>`
        const evaluatedIf = evaluateAndReplace(finalIf, { scope, enclosures: ['$<<', '>>'] })

        if (!JSON.parse(evaluatedIf)) this.currentStep.skip()
      } else if (currentStepDescriptor.unless) {
        const finalUnless = `$<<${currentStepDescriptor.unless.replace(/(\$<<\s*|\s*>>)/g, '')}>>`
        const evaluatedUnless = evaluateAndReplace(finalUnless, { scope, enclosures: ['$<<', '>>'] })

        if (JSON.parse(evaluatedUnless)) this.currentStep.skip()
      }

      if (this.currentStep.status === Status.Skipped) continue

      this.currentStep.once(Status.Running, () => this.emit(`step:${Status.Running}`, { payload: { index: i } }))
      this.currentStep.once(Status.Stopping, () => this.emit(`step:${Status.Stopping}`, { payload: { index: i } }))
      this.currentStep.on('output', (event: EmittedEvent) => this.emit('step:output', { payload: { index: i, data: event.payload.data } }))

      if (!onRunningRan) {
        this.currentStep.once(Status.Running, () => {
          onRunningRan = true
          onRunning()
        })
      }

      let notContinue = false

      try {
        await this.currentStep.run()

        this.emit(`step:${Status.Success}`, { payload: { index: i } })

        if (i === this.steps.length - 1) this.internalStatus = Status.Success
      } catch (error) {
        this.emit(`step:${this.currentStep.status}`, { error, payload: { index: i } })

        switch (this.currentStep.status) {
          case Status.Error:
            if (!onRunningRan) onRunning()

          case Status.Failure:
            if (currentStepDescriptor.onFailure === OnFailureAction.Continue) {
              break
            } else {
              this.internalStatus = Status.Failure
              this.internalError = error
              notContinue = true

              break
            }
          case Status.Stopped:
            this.internalStatus = Status.Stopped
            this.internalError = new Error('Routine was stopped')
            notContinue = true

            break
        }
      } finally {
        this.currentStep.removeAllListeners()

        if (currentStepDescriptor.name) {
          if (!this.options.scope.outputs) this.options.scope.outputs = {}
          if (!this.options.scope.outputs[this.name]) this.options.scope.outputs[this.name] = {}

          this.options.scope.outputs[this.name][currentStepDescriptor.name] = this.currentStep.output
        }
      }

      if (notContinue) break
    }

    // If no steps were run, run the onRunning callback to just follow procedure
    if (this.internalStatus === Status.Idle && !onRunningRan) onRunning()
  }

  public async internalStop(): Promise<void> {
    return this.currentStep.stop()
  }

  protected async internalPrepare(): Promise<void> {
    const { steps: stepDescriptors } = this.options

    for (let i = 0; i < stepDescriptors.length; i++) {
      const currentStepDescriptor = stepDescriptors[i]
      const { target: descriptorTarget, ...currentStepDescriptorWithoutTarget } = currentStepDescriptor

      const currentStepOptions: StepOptions = { ...currentStepDescriptorWithoutTarget }

      if (this.options.environment || currentStepDescriptor.environment) currentStepOptions.environment = { ...this.options.environment, ...currentStepDescriptor.environment }
      if (this.options.scope) currentStepOptions.scope = this.options.scope
      if (this.options.strategyScope) currentStepOptions.strategyScope = this.options.strategyScope
      if (descriptorTarget) {
        if (this.options.targets[descriptorTarget]) {
          currentStepOptions.target = this.options.targets[descriptorTarget]
        } else {
          throw new Error(`The target "${descriptorTarget}" was not found in the targets map.`)
        }
      } else if (this.options.target) {
        currentStepOptions.target = this.options.target
      }
      if (this.options.usableMap) currentStepOptions.usableMap = this.options.usableMap
      if (currentStepDescriptor.workingDirectory) {
        currentStepOptions.workingDirectory = currentStepDescriptor.workingDirectory
      } else if (this.options.workingDirectory) {
        currentStepOptions.workingDirectory = this.options.workingDirectory
      }

      this.steps.push(new Step(currentStepOptions))
    }
  }
}
