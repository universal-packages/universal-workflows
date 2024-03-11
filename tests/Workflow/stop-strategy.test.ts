import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'
import ControllableUsable from '../__fixtures__/cases/Controllable.usable'

describe(Workflow, (): void => {
  it('is prepared to stop an strategy', async (): Promise<void> => {
    const workflow = new Workflow({
      maxConcurrentRoutines: 4,
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          strategy: { matrix: { fruit: ['apple', 'banana'], color: ['red', 'yellow'] } },
          steps: [{ use: 'Controllable', with: { id: '${{ strategy.fruit }}-${{ strategy.color }}' } }]
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

    workflow.run()

    await workflow.waitForStatus(Status.Running)

    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: Status.Running,
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: [
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: Status.Running,
                steps: [
                  {
                    command: null,
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Running,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'red'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: Status.Running,
                steps: [
                  {
                    command: null,
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Running,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'yellow'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: Status.Running,
                steps: [
                  {
                    command: null,
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Running,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'red'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: Status.Running,
                steps: [
                  {
                    command: null,
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Running,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'yellow'
                }
              }
            ]
          }
        ]
      ]
    })

    ControllableUsable.finish('apple-red')
    ControllableUsable.finish('apple-yellow')
    ControllableUsable.finish('banana-red')

    await new Promise((resolve) => setTimeout(resolve, 200))

    workflow.stop()

    await workflow.waitForStatus(Status.Stopping)

    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: Status.Stopping,
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: apple-red is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'red'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: apple-yellow is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'yellow'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: banana-red is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'red'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: Status.Stopping,
                steps: [
                  {
                    command: null,
                    endedAt: null,
                    error: null,
                    measurement: null,
                    name: null,
                    output: null,
                    startedAt: expect.any(Date),
                    status: Status.Stopping,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'yellow'
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
      error: 'Workflow was stopped',
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: Status.Stopped,
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: apple-red is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'red'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: apple-yellow is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'apple',
                  color: 'yellow'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: banana-red is running\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'red'
                }
              },
              {
                endedAt: expect.any(Date),
                error: 'Routine was stopped',
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: Status.Stopped,
                steps: [
                  {
                    command: null,
                    endedAt: expect.any(Date),
                    error: 'Step was stopped',
                    measurement: expect.any(Measurement),
                    name: null,
                    output: 'Controllable step with id: banana-yellow is running\nControllable step with id: banana-yellow was stopped\n',
                    startedAt: expect.any(Date),
                    status: Status.Stopped,
                    usable: 'Controllable'
                  }
                ],
                variables: {
                  fruit: 'banana',
                  color: 'yellow'
                }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(27)
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'Controllable step with id: apple-red is running\n' } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'Controllable step with id: apple-yellow is running\n' } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'Controllable step with id: banana-red is running\n' } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2, graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'Controllable step with id: banana-yellow is running\n' } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:output', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'Controllable step with id: banana-yellow was stopped\n' } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopping' }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopping', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopped', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
