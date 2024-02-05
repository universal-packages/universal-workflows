import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('generates and run several routines grouped based on a single descriptor', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          strategy: {
            matrix: {
              fruit: ['apple', 'pear'],
              animal: ['cat', 'dog']
            },
            include: [
              {
                color: 'green'
              },
              {
                color: 'pink',
                animal: 'cat'
              },
              {
                fruit: 'apple',
                shape: 'circle'
              },
              {
                fruit: 'banana'
              },
              {
                fruit: 'banana',
                animal: 'cat'
              }
            ]
          },
          steps: [
            { name: 'color', run: 'echo ${{ strategy.color }}' },
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' },
            { name: 'shape', run: 'echo ${{ strategy.shape }}' }
          ]
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
                    command: 'echo pink',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'pink\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo cat',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo circle',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'circle\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'cat',
                  color: 'pink',
                  shape: 'circle'
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
                    command: 'echo green',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'green\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo dog',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo circle',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'circle\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'dog',
                  color: 'green',
                  shape: 'circle'
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
                    command: 'echo pink',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'pink\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo cat',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'cat',
                  color: 'pink'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo green',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'green\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo dog',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'dog',
                  color: 'green'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [4]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo banana',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'banana\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'banana'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [5]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo banana',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'banana\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo cat',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'shape',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'banana',
                  animal: 'cat'
                }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(87)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'pink\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'circle\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'green\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'circle\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'pink\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'green\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4, data: 'banana\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [4]', strategy: 'test1', strategyIndex: 4 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5, data: 'banana\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 2, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 2, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 2, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 3, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 3, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 3, routine: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [5]', strategy: 'test1', strategyIndex: 5 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
