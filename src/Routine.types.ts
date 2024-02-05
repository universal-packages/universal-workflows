import { BaseRunnerOptions, Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { StepGraph } from './Step.types'
import { OnFailureAction, Target, Targets, UsableMap } from './Workflow.types'

export interface RoutineOptions extends BaseRunnerOptions {
  environment?: Record<string, string>
  name: string
  scope?: Record<string, any>
  steps?: StepDescriptor[]
  strategyScope?: Record<string, any>
  target?: Target
  targets?: Targets
  usableMap?: UsableMap
  workingDirectory?: string
}

export interface StepDescriptor {
  environment?: Record<string, string>
  if?: string
  input?: string | string[]
  name?: string
  onFailure?: OnFailureAction
  run?: string
  unless?: string
  use?: string
  target?: string
  with?: Record<string, string | number | boolean>
  workingDirectory?: string
}

export interface RoutineGraph {
  endedAt?: Date
  error?: string
  name?: string
  measurement?: Measurement
  startedAt?: Date
  status: Status
  steps: StepGraph[]
}
