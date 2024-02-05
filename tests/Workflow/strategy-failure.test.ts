import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('stops all the strategy routines when one fails', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          strategy: { matrix: { seconds: [0.5, 1], multiplier: [1, 2] }, include: [{ seconds: 5, multiplier: 'nop' }] },
          steps: [{ run: '${{ (strategy.seconds * strategy.multiplier) ? `sleep ${strategy.seconds * strategy.multiplier}` : "git clone nonexistent" }}' }]
        }
      }
    })
    const listener = jest.fn()

    workflow.on('**', listener)

    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: null,
      status: Status.Idle,
      routines: []
    })

    await workflow.run()

    expect(workflow.status).toEqual(Status.Failure)
    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      error: 'Workflow failed',
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'failure',
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
                    usable: null
                  }
                ],
                variables: { seconds: 0.5, multiplier: 1 }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
                    usable: null
                  }
                ],
                variables: { seconds: 0.5, multiplier: 2 }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
                    usable: null
                  }
                ],
                variables: { seconds: 1, multiplier: 1 }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 2',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
                    usable: null
                  }
                ],
                variables: { seconds: 1, multiplier: 2 }
              },
              {
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'test1 [4]',
                startedAt: expect.any(Date),
                status: 'failure',
                steps: [
                  {
                    command: 'git clone nonexistent',
                    endedAt: expect.any(Date),
                    error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                    measurement: expect.any(Measurement),
                    name: null,
                    output: "fatal: repository 'nonexistent' does not exist\n",
                    startedAt: expect.any(Date),
                    status: 'failure',
                    usable: null
                  }
                ],
                variables: { seconds: 5, multiplier: 'nop' }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(32)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [4]', data: "fatal: repository 'nonexistent' does not exist\n", strategy: 'test1', strategyIndex: 4 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { index: 0, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { name: 'test1 [4]', strategy: 'test1', strategyIndex: 4 }
      }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'failure', error: new Error('Workflow failed'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow failed'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
