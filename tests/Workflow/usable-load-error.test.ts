import { Status } from '@universal-packages/sub-process'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('throws when a usable can not be loaded properly', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/load-error',
      target: 'spawn',
      routines: {
        test1: {
          steps: [{ run: 'echo nop' }]
        }
      }
    })
    const listener = jest.fn()

    workflow.on('**', listener)

    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: null,
      status: Status.Idle,
      routines: []
    })

    await workflow.run()

    expect(workflow.status).toEqual(Status.Error)
    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: null,
      status: Status.Error,
      routines: []
    })

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Load error') }]])
  })
})
