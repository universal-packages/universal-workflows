import { BaseUsable } from '../src'

describe(BaseUsable, (): void => {
  it('throws if use not implemented', async (): Promise<void> => {
    const stepUsable = new BaseUsable({})
    let error: Error

    try {
      await stepUsable.use()
    } catch (err) {
      error = err
    }

    expect(error).toEqual(new Error('Not implemented'))
  })
})
