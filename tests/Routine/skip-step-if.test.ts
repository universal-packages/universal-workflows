import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('can skip steps if the if attribute evaluates to false', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [
        {
          run: 'echo $TEST_VARIABLE',
          environment: { TEST_VARIABLE: 'This is a variable' },
          if: 'outputs.r-test.step-1'
        },
        {
          run: 'echo $SECOND_TEST_VARIABLE',
          environment: { SECOND_TEST_VARIABLE: 'This is another variable' }
        }
      ],
      target: { engine: 'spawn' },
      scope: { outputs: { 'r-test': { 'step-1': false } } }
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

    await routine.run()

    expect(routine.status).toEqual(Status.Success)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: Status.Success,
      steps: [
        {
          command: 'echo $TEST_VARIABLE',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Skipped,
          usable: null
        },
        {
          command: 'echo $SECOND_TEST_VARIABLE',
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: 'This is another variable\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:skipped', payload: { index: 0, routine: 'r-test' } }],
      [{ event: 'step:running', payload: { index: 1, routine: 'r-test' } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'step:output', payload: { data: 'This is another variable\n', index: 1, routine: 'r-test' } }],
      [{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 1, routine: 'r-test' } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
