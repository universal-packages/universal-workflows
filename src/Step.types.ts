import { BaseRunnerOptions, Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Target, UsableMap } from './Workflow.types'

export interface StepOptions extends BaseRunnerOptions {
  environment?: Record<string, string>
  input?: string | string[]
  name?: string
  run?: string
  usableMap?: UsableMap
  scope?: Record<string, any>
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
