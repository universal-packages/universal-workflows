import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('uses step env then routine env', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      environment: { TEST_VARIABLE: 'This is a routine variable', SECOND_TEST_VARIABLE: '2+2=${{ 2 + 2 }}' },
      steps: [
        {
          run: 'echo $TEST_VARIABLE',
          environment: { TEST_VARIABLE: 'This is a variable' }
        },
        {
          run: 'echo $SECOND_TEST_VARIABLE'
        }
      ],
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
          command: 'echo $TEST_VARIABLE',
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: 'This is a variable\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          strategy: null,
          usable: null
        },
        {
          command: 'echo $SECOND_TEST_VARIABLE',
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: '2+2=4\n',
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
      [{ event: 'step:output', payload: { data: 'This is a variable\n', index: 0 } }],
      [{ event: 'step:success', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'step:running', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'step:output', payload: { data: '2+2=4\n', index: 1 } }],
      [{ event: 'step:success', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })

  it('fails if env can not be evaluated', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      environment: { TEST_VARIABLE: 'This is a routine variable', SECOND_TEST_VARIABLE: '2+2=${{ throw new Error("HeHe") }}' },
      steps: [
        {
          run: 'echo $TEST_VARIABLE',
          environment: { TEST_VARIABLE: 'This is a variable' }
        },
        {
          run: 'echo $SECOND_TEST_VARIABLE'
        }
      ],
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
      error: 'HeHe',
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: 'failure',
      steps: [
        {
          command: 'echo $TEST_VARIABLE',
          endedAt: expect.any(Date),
          error: 'HeHe',
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: 'error',
          strategy: null,
          usable: null
        },
        {
          command: 'echo $SECOND_TEST_VARIABLE',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: 'idle',
          strategy: null,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:error', error: new Error('HeHe'), payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'failure', error: new Error('HeHe'), measurement: expect.any(Measurement) }],
      [{ event: 'end', error: new Error('HeHe'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
