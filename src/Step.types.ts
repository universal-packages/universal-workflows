import { BaseRunnerOptions, Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Target, UsableMap } from './Workflow.types'

export interface StepOptions extends BaseRunnerOptions {
  environment?: Record<string, string>
  input?: string | string[]
  name?: string
  run?: string
  usableMap?: UsableMap
  routineScope?: Record<string, any>
  scope?: Record<string, any>
  setVariable?: SetVariable
  strategyScope?: Record<string, any>
  target?: Target
  use?: string
  with?: Record<string, any>
  workingDirectory?: string
}

export interface StepGraph {
  command?: string
  endedAt?: Date
  error?: string
  name?: string
  measurement?: Measurement
  output?: string
  startedAt?: Date
  status: Status
  usable?: string
}

export interface SetVariable {
  name: string
  value: string
}
