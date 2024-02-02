import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('make steps output available if steps are named', async (): Promise<void> => {
    const scope = {}
    const routine = new Routine({
      name: 'r-test',
      steps: [
        {
          name: 'step-1',
          run: 'echo $TEST_VARIABLE',
          environment: { TEST_VARIABLE: 'This is a variable' }
        },
        {
          run: 'echo $SECOND_TEST_VARIABLE',
          environment: { SECOND_TEST_VARIABLE: 'This is another variable' }
        }
      ],
      target: { engine: 'spawn' },
      scope: scope
    })

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
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: 'step-1',
          output: 'This is a variable\n',
          startedAt: expect.any(Date),
          status: Status.Success,
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

    expect(scope).toEqual({ outputs: { 'r-test': { 'step-1': 'This is a variable\n' } } })
  })
})
