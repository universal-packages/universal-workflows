import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('can skip steps if the unless attribute evaluates to true', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [
        {
          run: 'echo $SECOND_TEST_VARIABLE',
          environment: { SECOND_TEST_VARIABLE: 'This is another variable' },
          unless: '$<<outputs.r-test.step-1>>'
        }
      ],
      target: { engine: 'spawn' },
      scope: { outputs: { 'r-test': { 'step-1': true } } }
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
          command: 'echo $SECOND_TEST_VARIABLE',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Skipped,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:skipped', payload: { index: 0 } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
