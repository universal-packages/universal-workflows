import { BaseRunnerOptions, EngineInterface, Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import BaseUsable from './BaseUsable'
import Routine from './Routine'
import { RoutineGraph, StepDescriptor } from './Routine.types'

export enum OnFailureAction {
  Continue = 'continue',
  Fail = 'fail'
}

export enum RunDescriptorStatus {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Skipped = 'skipped',
  Failure = 'failure',
  Stopped = 'stopped',
  Canceled = 'cancelled'
}

export interface RunOptions {
  stepUsableLocation?: string
  workflowsLocation?: string
}

export interface WorkflowOptions extends BaseRunnerOptions {
  environment?: Record<string, string>
  name?: string
  target?: string
  targets?: Targets
  stepUsableLocation?: string
  routines: RoutineDescriptors
  workingDirectory?: string
}

export interface RoutineDescriptor {
  strategy?: StrategyDescriptor
  dependsOn?: string | string[]
  environment?: Record<string, string>
  if?: string
  onFailure?: OnFailureAction
  steps: StepDescriptor[]
  target?: string
  unless?: string
  workingDirectory?: string
}

export interface StrategyDescriptor {
  matrix?: Record<string, (string | number | boolean)[]>
  onFailure?: OnFailureAction
  include?: Record<string, string | number | boolean>[]
}

export interface RoutineDescriptors {
  [routineName: string]: RoutineDescriptor
}

export interface Targets {
  [targetName: string]: Target
}

export interface Target {
  engine: string | EngineInterface
  engineOptions?: any
}

export interface UsableMap {
  [stepName: string]: typeof BaseUsable
}

export interface RunDescriptors {
  [routineName: string]: RunDescriptor
}

export interface RunDescriptor {
  dependents: RunDescriptor[]
  dependsOnReady: Record<string, boolean>
  name: string
  routine: Routine
  routineDescriptor: RoutineDescriptor
  stage: number
  status: RunDescriptorStatus
  strategyRunDescriptors: StrategyRunDescriptor[]
}

export interface StrategyRunDescriptor {
  index: number
  name: string
  variables: Record<string, string | number | boolean>
  routine: Routine
}

export interface WorkflowGraph {
  endedAt?: Date
  name?: string
  measurement?: Measurement
  startedAt?: Date
  status: Status
  routines: (RoutineGraph | StrategyGraph)[][]
}

export interface StrategyGraph {
  name: string
  routines: StrategyRoutineGraph[]
}

export interface StrategyRoutineGraph extends RoutineGraph {
  variables: Record<string, string | number | boolean>
}

export interface CombinationsMap {
  originals: Record<string, string | number | boolean>[]
}

export interface CombinationItem {
  original: Record<string, string | number | boolean>
  withIncludes: Record<string, string | number | boolean>
}

export interface WorkflowDescriptor {
  environment?: Record<string, string>
  name?: string
  target?: string
  targets?: Targets
  routines: RoutineDescriptors
  workingDirectory?: string
}
