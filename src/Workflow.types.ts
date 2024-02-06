import { BaseRunnerOptions, EngineInterface, Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import BaseUsable from './BaseUsable'
import Routine from './Routine'
import { RoutineGraph, RoutineOptions, StepDescriptor } from './Routine.types'

export enum OnFailureAction {
  Continue = 'continue',
  Fail = 'fail'
}

export enum RunDescriptorStrategyStatus {
  Pending = 'pending',
  Ready = 'ready'
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

export interface BuildFromOptions {
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
  dependsOn?: string | string[]
  environment?: Record<string, string>
  if?: string
  onFailure?: OnFailureAction
  steps: StepDescriptor[]
  strategy?: StrategyDescriptor
  target?: string
  unless?: string
  workingDirectory?: string
}

export interface StrategyDescriptor {
  matrix?: Record<string, (string | number | boolean)[]> | string
  onFailure?: OnFailureAction
  include?: Record<string, string | number | boolean>[] | string
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
  error?: string
  name: string
  routine: Routine
  routineDescriptor: RoutineDescriptor
  routineOptions: RoutineOptions
  stage: number
  status: RunDescriptorStatus
  strategyRunDescriptors: StrategyRunDescriptor[]
  strategyStatus?: RunDescriptorStrategyStatus
}

export interface StrategyRunDescriptor {
  index: number
  name: string
  variables: Record<string, string | number | boolean>
  routine: Routine
}

export interface WorkflowGraph {
  endedAt?: Date
  error?: string
  name?: string
  measurement?: Measurement
  startedAt?: Date
  status: Status
  routines: (RoutineGraph | StrategyGraph)[][]
}

export interface StrategyGraph {
  error?: string
  name: string
  strategy: StrategyRoutineGraph[]
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
