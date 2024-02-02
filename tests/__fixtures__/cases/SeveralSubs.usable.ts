import { BaseUsable } from '../../../src'

export default class SeveralSubsUsable extends BaseUsable {
  public async use(): Promise<void> {
    this.pushOutput(await this.runSubProcess('echo $variable', { environment: { variable: 'this is a variable' } }))
    this.pushOutput(await this.runSubProcess('ls'))
  }
}
