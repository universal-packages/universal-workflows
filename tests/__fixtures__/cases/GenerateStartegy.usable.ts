import { BaseUsable } from '../../../src'

export default class GenerateStrategy extends BaseUsable {
  public async use(): Promise<void> {
    this.pushOutput(`Generating strategy`)

    this.setOutput({ matrix: { fruit: ['apple', 'pear'], number: [1, 2] }, include: [{ shape: 'circle' }] })
  }
}
