import { Status, TestEngine } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { OnFailureAction, Routine } from '../../src'
import GoodUsable from '../__fixtures__/cases/Good.usable'

describe(Routine, (): void => {
  it('continues if a step fails if it was expected to', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      steps: [{ run: 'failure', onFailure: OnFailureAction.Continue }, { use: 'good' }],
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
          command: 'failure',
          endedAt: expect.any(Date),
          error: 'Process exited with code 1\n\nCommand failed',
          measurement: expect.any(Measurement),
          name: null,
          output: 'Command failed',
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
          output: 'This is a good step, using env: undefined, scope: {"routine":{"name":"r-test"}}, and with: undefined\n',
          startedAt: expect.any(Date),
          status: Status.Success,
          usable: 'good'
        }
      ]
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [{ event: 'step:output', payload: { index: 0, data: 'Command failed' } }],
      [{ event: 'step:failure', error: new Error('Process exited with code 1\n\nCommand failed'), payload: { index: 0, graph: expect.anything() } }],
      [{ event: 'step:running', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'step:output', payload: { data: 'This is a good step, using env: undefined, scope: {"routine":{"name":"r-test"}}, and with: undefined\n', index: 1 } }],
      [{ event: 'step:success', payload: { index: 1, graph: expect.anything() } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
