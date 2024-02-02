import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('is prepared to be stopped', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [{ run: 'sleep 1000' }, { run: 'echo unreachable' }],
      target: { engine: 'spawn' }
    })
    const listener = jest.fn()

    routine.on('**', listener)

    expect(routine.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: 'r-test',
      startedAt: null,
      status: Status.Idle,
      steps: []
    })

    routine.run()

    await routine.waitForStatus(Status.Running)

    expect(routine.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Running,
      steps: [
        {
          command: 'sleep 1000',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: expect.any(Date),
          status: Status.Running,
          usable: null
        },
        {
          command: 'echo unreachable',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Idle,
          usable: null
        }
      ]
    })

    routine.stop()

    expect(routine.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Stopping,
      steps: [
        {
          command: 'sleep 1000',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: expect.any(Date),
          status: Status.Stopping,
          usable: null
        },
        {
          command: 'echo unreachable',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Idle,
          usable: null
        }
      ]
    })

    await routine.stop()

    expect(routine.status).toEqual(Status.Stopped)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Stopped,
      steps: [
        {
          command: 'sleep 1000',
          endedAt: expect.any(Date),
          error: 'Step was stopped',
          measurement: expect.any(Measurement),
          name: null,
          output: null,
          startedAt: expect.any(Date),
          status: Status.Stopped,
          usable: null
        },
        {
          command: 'echo unreachable',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Idle,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0 } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'stopping' }],
      [{ event: 'step:stopping', payload: { index: 0 } }],
      [{ event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0 } }],
      [{ event: 'stopped', error: new Error('Routine was stopped'), measurement: expect.any(Measurement) }],
      [{ event: 'end', error: new Error('Routine was stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
