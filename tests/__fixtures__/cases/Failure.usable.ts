import { BaseUsable } from '../../../src'

export default class FailureUsable extends BaseUsable {
  public async use(): Promise<void> {
    this.pushOutput('This is step is about to fail')

    this.fail(new Error('This Step was failed purposely'))
  }
}
