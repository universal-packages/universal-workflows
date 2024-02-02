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
          strategy: { matrix: { seconds: [0.01, 1], multiplier: [0.5, 5] } },
          steps: [{ run: 'sleep $<< (strategy.seconds * strategy.multiplier) || "nop" >>' }]
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

    workflow.run()

    await workflow.waitForStatus(Status.Running)

    expect(workflow.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: 'running',
      routines: [
        [
          {
            name: 'test1',
            strategy: [
              {
                endedAt: null,
                measurement: null,
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: 'running',
                steps: [
                  {
                    command: 'sleep 0.005',
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'running',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 0.5
                }
              },
              {
                endedAt: null,
                measurement: null,
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: 'running',
                steps: [
                  {
                    command: 'sleep 0.05',
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'running',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 5
                }
              },
              {
                endedAt: null,
                measurement: null,
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: 'running',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'running',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 0.5
                }
              },
              {
                endedAt: null,
                measurement: null,
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: 'running',
                steps: [
                  {
                    command: 'sleep 5',
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'running',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 5
                }
              }
            ]
          }
        ]
      ]
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))

    workflow.stop()

    await workflow.waitForStatus(Status.Stopping)

    expect(workflow.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: 'stopping',
      routines: [
        [
          {
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.005',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 0.5
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.05',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 5
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 0.5
                }
              },
              {
                endedAt: null,
                measurement: null,
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: 'stopping',
                steps: [
                  {
                    command: 'sleep 5',
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'stopping',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 5
                }
              }
            ]
          }
        ]
      ]
    })

    await workflow.stop()

    expect(workflow.status).toEqual(Status.Stopped)

    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'stopped',
      routines: [
        [
          {
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.005',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 0.5
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.05',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 0.01,
                  multiplier: 5
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'sleep 0.5',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  seconds: 1,
                  multiplier: 0.5
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: 'stopped',
                steps: [
                  {
                    command: 'sleep 5',
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
                  multiplier: 5
                }
              }
            ]
          }
        ]
      ]
    })

    const measurement = expect.any(Measurement)
    const startedAt = expect.any(Date)
    const endedAt = expect.any(Date)
    const stepStopError = new Error('Step stopped')
    const routineStopError = new Error('Routine stopped')

    expect(listener).toHaveBeenCalledTimes(22)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement, payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement, payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopping' }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: stepStopError, measurement, payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: routineStopError, measurement, payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopped', error: new Error('Workflow stopped'), measurement }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', error: new Error('Workflow stopped'), measurement, payload: { endedAt } }])
  })
})
