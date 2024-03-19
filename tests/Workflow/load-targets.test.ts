import { Status } from '@universal-packages/sub-process'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('trows when a target specifies an unknown engine', async (): Promise<void> => {
    const workflow = new Workflow({
      allowDescribedTargetsOnTest: true,
      stepUsableLocation: './tests/__fixtures__/cases',
      targets: { unknown: { engine: 'unknown' } },
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

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Target unknown specifies an unknown engine: unknown') }]])
  })

  it('uses already loaded target engines', async (): Promise<void> => {
    const engine = { prepare: jest.fn() } as any

    const workflow = new Workflow({
      allowDescribedTargetsOnTest: true,
      stepUsableLocation: './tests/__fixtures__/load-error',
      targets: { mock: { engine } },
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

    expect(engine.prepare).toHaveBeenCalled()
  })
})
