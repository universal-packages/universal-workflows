import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('is prepared for when the routine errors', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [{ if: 'variables.not.existent', run: 'echo no' }]
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
      endedAt: expect.any(Date),
      error: 'variables is not defined',
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
      status: 'error',
      steps: [
        {
          command: 'echo no',
          endedAt: null,
          error: null,
          measurement: null,
          name: null,
          output: null,
          startedAt: null,
          status: Status.Idle,
          strategy: null,
          usable: null
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'error', error: new Error('variables is not defined'), measurement: expect.any(Measurement) }],
      [{ event: 'end', error: new Error('variables is not defined'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
