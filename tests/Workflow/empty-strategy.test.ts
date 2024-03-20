import { Status } from '@universal-packages/sub-process'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('throws if a strategy is specified without the valid necessary descriptors', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          strategy: {
            matrix: {},
            include: []
          },
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
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: []
          }
        ]
      ]
    })

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Strategy matrix or include must be specified') }]])
  })
})
