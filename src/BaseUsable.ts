import { BaseRunner, Status, SubProcess, SubProcessOptions } from '@universal-packages/sub-process'

import { BaseUsableOptions, RunSubProcessOptions } from './BaseUsable.types'

export default class BaseUsable<W extends Record<string, any> = any> extends BaseRunner<BaseUsableOptions<W>> {
  public static readonly usableName: string

  public get output(): string {
    return this.internalOutput
  }

  protected readonly environment: Record<string, string>
  protected readonly scope: Record<string, any>
  protected readonly with: W
  protected internalOutput: string

  public constructor(options: BaseUsableOptions<W>) {
    super({ environment: {}, scope: {}, with: {} as any, ...options })

    this.environment = this.options.environment
    this.scope = this.options.scope
    this.with = this.options.with
  }

  protected async internalRun(onRunning: () => void): Promise<void> {
    onRunning()

    return this.use()
  }

  public async use(): Promise<void> {
    throw new Error('Not implemented')
  }

  protected async runSubProcess(command: string, options?: RunSubProcessOptions): Promise<string> {
    const subProcessOptions: SubProcessOptions = { command, input: options?.input, env: options?.environment, workingDirectory: options?.workingDirectory }

    if (this.options.target) subProcessOptions.engine = this.options.target.engine

    const subProcess = new SubProcess(subProcessOptions)

    await subProcess.run()

    return subProcess.stdout
  }

  protected pushOutput(output: string | Buffer): void {
    const processedOutput = (output instanceof Buffer ? output.toString() : output).replace(/\n+$/, '') + '\n'

    this.emit('output', { payload: { data: processedOutput } })

    this.internalOutput = (this.internalOutput || '') + processedOutput
  }

  protected fail(error?: Error) {
    this.internalStatus = Status.Failure

    throw error
  }
}
