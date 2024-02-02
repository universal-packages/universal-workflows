import { BaseUsable } from '../../../src'

export default class ThrowUsable extends BaseUsable {
  public async use(): Promise<void> {
    this.pushOutput('This is step is about to throw an error')

    throw new Error('Unexpected error')
  }
}
