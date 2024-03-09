import { BaseUsable } from '../../../src'

export default class ControllableUsable extends BaseUsable {
  private static instances: Record<string, ControllableUsable> = {}

  private internalResolve: () => void

  public static finish(id: string): void {
    const instance = this.instances[id]

    if (instance) {
      delete this.instances[id]

      instance.internalResolve()
    }
  }

  public static finishAll(): void {
    Object.values(this.instances).forEach((instance) => {
      this.finish(instance.with.id)
    })
  }

  public async use(): Promise<void> {
    ControllableUsable.instances[this.with.id] = this

    this.pushOutput(`Controllable step with id: ${this.with.id} is running`)

    return new Promise((resolve) => {
      this.internalResolve = resolve
    })
  }

  public async internalStop(): Promise<void> {
    this.pushOutput(`Controllable step with id: ${this.with.id} was stopped`)

    this.internalResolve()
  }
}
