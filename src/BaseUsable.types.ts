import { Target } from './Workflow.types'

export interface BaseUsableOptions<W extends Record<string, any> = Record<string, any>> {
  environment?: Record<string, string>
  scope?: Record<string, any>
  target?: Target
  with?: W
}

export interface RunSubProcessOptions {
  environment?: Record<string, string>
  input?: string | string[]
  workingDirectory?: string
}
