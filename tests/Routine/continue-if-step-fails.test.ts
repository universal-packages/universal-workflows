import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { OnFailureAction, Routine } from '../../src'
import GoodUsable from '../__fixtures__/cases/Good.usable'

describe(Routine, (): void => {
  it('continues if a step fails if it was expected to', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [{ run: 'git clone nonexistent', onFailure: OnFailureAction.Continue }, { use: 'good' }],
      usableMap: { good: GoodUsable },
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
          command: 'git clone nonexistent',
          endedAt: expect.any(Date),
          error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
          measurement: expect.any(Measurement),
          name: null,
          output: "fatal: repository 'nonexistent' does not exist\n",
          startedAt: expect.any(Date),
          status: Status.Failure,
          usable: null
        },
        {
          command: null,
          endedAt: expect.any(Date),
          error: null,
          measurement: expect.any(Measurement),
          name: null,
          output: 'This is a good step, using env: undefined, scope: undefined, and with: undefined\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          usable: 'good'
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0 } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'step:output', payload: { index: 0, data: "fatal: repository 'nonexistent' does not exist\n" } }],
      [
        {
          event: 'step:failure',
          error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
          payload: { index: 0 }
        }
      ],
      [{ event: 'step:running', payload: { index: 1 } }],
      [{ event: 'step:output', payload: { data: 'This is a good step, using env: undefined, scope: undefined, and with: undefined\n', index: 1 } }],
      [{ event: 'step:success', payload: { index: 1 } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
