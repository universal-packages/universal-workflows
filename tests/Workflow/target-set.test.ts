import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('sets the target specified in the routine descriptor', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          target: 'exec',
          steps: [{ run: 'echo yep' }]
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

    expect(workflow.status).toEqual(Status.Success)
    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      error: null,
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: Status.Success,
      routines: [
        [
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo yep',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: 'yep\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          }
        ]
      ]
    })
  })

  it('trows when a routine target specifies an unknown engine', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          target: 'unknown',
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

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('The target "unknown" was not found in the targets map') }]])
  })

  it('trows when a routine target specifies an unknown engine', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'unknown',
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

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('The target "unknown" was not found in the targets map') }]])
  })
})
