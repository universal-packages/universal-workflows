import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('uses the routine target for all steps', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [
        { run: 'echo yes', target: 'test' },
        { run: 'echo maybe', target: 'test' }
      ],
      targets: { test: { engine: 'test' } }
    })
    const listener = jest.fn()

    routine.on('**', listener)

    expect(routine.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: 'r-test',
      startedAt: null,
      status: Status.Idle,
      steps: []
    })

    await routine.run()

    expect(routine.status).toEqual(Status.Success)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      error: null,
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Success,
      steps: [
        {
          command: 'echo yes',
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: 'yes\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          strategy: null,
          usable: null
        },
        {
          command: 'echo maybe',
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: 'maybe\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          strategy: null,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'step:output', payload: { data: 'yes\n', index: 0 } }],
      [{ event: 'step:success', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'step:running', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'step:output', payload: { data: 'maybe\n', index: 1 } }],
      [{ event: 'step:success', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })

  it('fails if the target in the descriptor is not valid', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [
        { run: 'echo yes', target: 'some-target' },
        { run: 'echo maybe', target: 'spawn' }
      ],
      targets: { spawn: { engine: 'spawn' } }
    })
    const listener = jest.fn()

    routine.on('**', listener)

    expect(routine.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: 'r-test',
      startedAt: null,
      status: Status.Idle,
      steps: []
    })

    await routine.run()

    expect(routine.status).toEqual(Status.Error)
    expect(routine.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: 'r-test',
      startedAt: null,
      status: Status.Error,
      steps: []
    })

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('The target "some-target" was not found in the targets map.') }]])
  })
})
