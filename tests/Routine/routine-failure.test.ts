import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'
import GoodUsable from '../__fixtures__/cases/Good.usable'

describe(Routine, (): void => {
  it('is prepared for when a step fails', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      scope: { good: 'Other output' },
      steps: [{ use: 'good', with: { good: true }, environment: { variable: 'This is a variable' } }, { run: 'failure' }],
      usableMap: { good: GoodUsable }
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

    expect(routine.status).toEqual(Status.Failure)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      error: 'Process exited with code 1\n\nCommand failed',
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Failure,
      steps: [
        {
          command: null,
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output:
            'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output","routine":{"name":"r-test","outputs":{}}}, and with: {"good":true}\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          strategy: null,
          usable: 'good'
        },
        {
          command: 'failure',
          endedAt: expect.any(Date),
          error: 'Process exited with code 1\n\nCommand failed',
          measurement: expect.any(Measurement),
          name: null,
          output: 'Command failed',
          startedAt: expect.any(Date),
          status: Status.Failure,
          strategy: null,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [
        {
          event: 'step:output',
          payload: {
            index: 0,
            data: 'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output","routine":{"name":"r-test","outputs":{}}}, and with: {"good":true}\n'
          }
        }
      ],
      [{ event: 'step:success', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'step:running', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'step:output', payload: { index: 1, data: 'Command failed' } }],
      [
        {
          event: 'step:failure',
          error: new Error('Process exited with code 1\n\nCommand failed'),
          payload: { index: 1, graph: expect.anything() }
        }
      ],
      [{ event: 'failure', error: new Error('Process exited with code 1\n\nCommand failed'), measurement: expect.any(Measurement) }],
      [
        {
          event: 'end',
          error: new Error('Process exited with code 1\n\nCommand failed'),
          measurement: expect.any(Measurement),
          payload: { endedAt: expect.any(Date) }
        }
      ]
    ])
  })

  it('is prepared for when a step errors', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [{ run: 'sleep ${{ throw new Error("Ups") }}' }],
      target: { engine: 'spawn' }
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

    expect(routine.status).toEqual(Status.Failure)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      error: 'Ups',
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Failure,
      steps: [
        {
          command: 'sleep ${{ throw new Error("Ups") }}',
          endedAt: expect.any(Date),
          error: 'Ups',
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Error,
          strategy: null,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:error', error: new Error('Ups'), payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'failure', error: new Error('Ups'), measurement: expect.any(Measurement) }],
      [{ event: 'end', error: new Error('Ups'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
