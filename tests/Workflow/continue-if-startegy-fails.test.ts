import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { OnFailureAction, Workflow } from '../../src'

describe(Workflow, (): void => {
  it('continue running routines if a strategy fails if it was expected to', async (): Promise<void> => {
    const workflow = new Workflow({
      maxConcurrentRoutines: 8,
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          steps: [{ name: 'test1', run: 'echo test1' }]
        },
        test2: {
          steps: [{ name: 'test2', run: 'echo test2' }],
          dependsOn: 'test1'
        },
        test3: {
          strategy: { matrix: { seconds: [0.5, 1], multiplier: [1, 2] }, include: [{ seconds: 5, multiplier: 'nop' }] },
          steps: [{ run: '${{ (strategy.seconds * strategy.multiplier) ? `sleep ${strategy.seconds * strategy.multiplier}` : "git clone nonexistent" }}' }],
          dependsOn: 'test1',
          onFailure: OnFailureAction.Continue
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2'
        },
        test5: {
          strategy: { matrix: { seconds: [0.5, 1], multiplier: [1, 2] }, include: [{ seconds: 5, multiplier: 'nop' }] },
          steps: [{ run: '${{ (strategy.seconds * strategy.multiplier) ? `sleep ${strategy.seconds * strategy.multiplier}` : "git clone nonexistent" }}' }],
          dependsOn: ['test3', 'test4'],
          onFailure: OnFailureAction.Continue
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

    expect(workflow.status).toEqual(Status.Success)
    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      error: null,
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: Status.Success,
      routines: [
        [
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test1',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'test1\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test2',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'test2\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          },
          {
            error: null,
            name: 'test3',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test3 [0]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.5,
                  multiplier: 1
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test3 [1]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.5,
                  multiplier: 2
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test3 [2]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 1
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test3 [3]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 2',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 2
                }
              },
              {
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'test3 [4]',
                startedAt: expect.any(Date),
                status: Status.Failure,
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
                  }
                ],
                variables: {
                  seconds: 5,
                  multiplier: 'nop'
                }
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test4',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test3',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3',
                output: 'test3\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          }
        ],
        [
          {
            error: null,
            name: 'test5',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test5 [0]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.5,
                  multiplier: 1
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test5 [1]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.5,
                  multiplier: 2
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test5 [2]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 1
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test5 [3]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: 'sleep 2',
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 2
                }
              },
              {
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'test5 [4]',
                startedAt: expect.any(Date),
                status: Status.Failure,
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
                  }
                ],
                variables: {
                  seconds: 5,
                  multiplier: 'nop'
                }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(76)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test3 [4]', strategy: 'test3', strategyIndex: 4, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [4]', strategy: 'test3', strategyIndex: 4, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test3 [4]', data: "fatal: repository 'nonexistent' does not exist\n", strategy: 'test3', strategyIndex: 4 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { index: 0, routine: 'test3 [4]', strategy: 'test3', strategyIndex: 4, graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { name: 'test3 [4]', strategy: 'test3', strategyIndex: 4, graph: expect.anything() }
      }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3, graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test5 [4]', strategy: 'test5', strategyIndex: 4, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [4]', strategy: 'test5', strategyIndex: 4, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test5 [4]', data: "fatal: repository 'nonexistent' does not exist\n", strategy: 'test5', strategyIndex: 4 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { index: 0, routine: 'test5 [4]', strategy: 'test5', strategyIndex: 4, graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"),
        payload: { name: 'test5 [4]', strategy: 'test5', strategyIndex: 4, graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
