import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { OnFailureAction, Workflow } from '../../src'

describe(Workflow, (): void => {
  it('runs routines in parallel respecting dependencies', async (): Promise<void> => {
    const workflow = new Workflow({
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
          steps: [{ run: 'sleep $<< (strategy.seconds * strategy.multiplier) || "nop" >>' }],
          dependsOn: 'test1',
          onFailure: OnFailureAction.Continue
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2'
        },
        test5: {
          strategy: { matrix: { seconds: [0.5, 1], multiplier: [1, 2] }, include: [{ seconds: 5, multiplier: 'nop' }] },
          steps: [{ run: 'sleep $<< (strategy.seconds * strategy.multiplier) || "nop" >>' }],
          dependsOn: ['test3', 'test4'],
          onFailure: OnFailureAction.Continue
        }
      }
    })
    const listener = jest.fn()

    workflow.on('**', listener)

    expect(workflow.graph).toEqual({
      endedAt: null,
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
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'success',
      routines: [
        [
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo test1',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'test1\n',
                startedAt: expect.any(Date),
                status: 'success',
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo test2',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'test2\n',
                startedAt: expect.any(Date),
                status: 'success',
                usable: null
              }
            ]
          },
          {
            name: 'test3',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test3 [0]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test3 [1]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test3 [2]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test3 [3]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 2',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test3 [4]',
                startedAt: expect.any(Date),
                status: 'failure',
                steps: [
                  {
                    command: 'sleep nop',
                    endedAt: expect.any(Date),
                    error: 'Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'usage: sleep seconds\n',
                    startedAt: expect.any(Date),
                    status: 'failure',
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
            measurement: expect.any(Measurement),
            name: 'test4',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo test3',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3',
                output: 'test3\n',
                startedAt: expect.any(Date),
                status: 'success',
                usable: null
              }
            ]
          }
        ],
        [
          {
            name: 'test5',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test5 [0]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test5 [1]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test5 [2]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 1',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test5 [3]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 2',
                    endedAt: expect.any(Date),
                    error: 'Step stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopped',
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
                measurement: expect.any(Measurement),
                name: 'test5 [4]',
                startedAt: expect.any(Date),
                status: 'failure',
                steps: [
                  {
                    command: 'sleep nop',
                    endedAt: expect.any(Date),
                    error: 'Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'usage: sleep seconds\n',
                    startedAt: expect.any(Date),
                    status: 'failure',
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

    const measurement = expect.any(Measurement)
    const startedAt = expect.any(Date)
    const endedAt = expect.any(Date)
    const stepStopError = new Error('Step stopped')
    const routineStopError = new Error('Routine stopped')

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test1' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test2' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [4]', strategy: 'test3', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [4]', strategy: 'test3', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test3 [4]', data: 'usage: sleep seconds\n', strategy: 'test3', strategyIndex: 4 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement,
        payload: { index: 0, routine: 'test3 [4]', strategy: 'test3', strategyIndex: 4 }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Routine failed\n\nStep failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement,
        payload: { name: 'test3 [4]', strategy: 'test3', strategyIndex: 4 }
      }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test4' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test5 [0]', strategy: 'test5', strategyIndex: 0 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test5 [1]', strategy: 'test5', strategyIndex: 1 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test5 [2]', strategy: 'test5', strategyIndex: 2 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test5 [3]', strategy: 'test5', strategyIndex: 3 } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5 [4]', strategy: 'test5', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5 [4]', strategy: 'test5', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test5 [4]', data: 'usage: sleep seconds\n', strategy: 'test5', strategyIndex: 4 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement,
        payload: { index: 0, routine: 'test5 [4]', strategy: 'test5', strategyIndex: 4 }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Routine failed\n\nStep failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement,
        payload: { name: 'test5 [4]', strategy: 'test5', strategyIndex: 4 }
      }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
