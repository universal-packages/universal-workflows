import { BaseUsable } from '../../../src'

export default class GoodUsable extends BaseUsable {
  private internalResolve: () => void
  private internalTimeout: NodeJS.Timeout

  public async use(): Promise<void> {
    this.pushOutput(`This is a good step, using env: ${JSON.stringify(this.environment)}, scope: ${JSON.stringify(this.scope)}, and with: ${JSON.stringify(this.with)}`)

    return new Promise((resolve) => {
      this.internalResolve = resolve
      this.internalTimeout = setTimeout(resolve, 1000)
    })
  }

  public async internalStop(): Promise<void> {
    clearTimeout(this.internalTimeout)

    this.pushOutput('The good step was stopped before it could finish')

    this.internalResolve()
  }
}
