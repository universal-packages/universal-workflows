import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

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
          steps: [{ name: 'test2', run: 'echo test2' }]
        },
        test3: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test1'
        },
        test4: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          dependsOn: 'test2'
        },
        test5: {
          steps: [{ name: 'test5', run: 'echo test5' }],
          dependsOn: ['test3', 'test4']
        },
        test6: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          dependsOn: 'test2'
        },
        test7: {
          steps: [{ name: 'test7', run: 'echo test7' }],
          dependsOn: ['test6', 'test2']
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
          },
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
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test3',
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
          },
          {
            name: 'test4',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test4 [0]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'cat'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test4 [1]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'dog'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test4 [2]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'cat'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test4 [3]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'dog'
                }
              }
            ]
          },
          {
            name: 'test6',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test6 [0]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'cat'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test6 [1]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'dog'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test6 [2]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'cat'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test6 [3]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  animal: 'dog'
                }
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test5',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo test5',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test5',
                output: 'test5\n',
                startedAt: expect.any(Date),
                status: 'success',
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test7',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo test7',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test7',
                output: 'test7\n',
                startedAt: expect.any(Date),
                status: 'success',
                usable: null
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(92)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test3' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4 [0]', strategy: 'test4', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4 [1]', strategy: 'test4', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4 [2]', strategy: 'test4', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4 [3]', strategy: 'test4', strategyIndex: 3 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test5', data: 'test5\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test5' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test6 [0]', strategy: 'test6', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test6 [1]', strategy: 'test6', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test6 [2]', strategy: 'test6', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test6 [3]', strategy: 'test6', strategyIndex: 3 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test7' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test7' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test7', data: 'test7\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test7' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test7' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
