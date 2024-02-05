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
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          if: 'false'
        },
        test2: {
          steps: [{ name: 'test2', run: 'echo test2' }],
          dependsOn: 'test1',
          if: '1 === 1'
        },
        test3: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          if: 'false'
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2',
          if: '1 === 1'
        },
        test5: {
          steps: [{ name: 'test5', run: 'echo test5' }],
          dependsOn: ['test3', 'test4'],
          if: '1 === 1'
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
      status: 'success',
      routines: [
        [
          {
            name: 'test1',
            strategy: [
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [0]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [1]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'dog'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [2]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'pear',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1 [3]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'pear',
                  animal: 'dog'
                }
              }
            ]
          },
          {
            name: 'test3',
            strategy: [
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3 [0]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3 [1]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'dog'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3 [2]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'pear',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3 [3]',
                startedAt: null,
                status: 'skipped',
                steps: [],
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
            error: null,
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
            error: null,
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
            endedAt: expect.any(Date),
            error: null,
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
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(20)
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:skipped', payload: { name: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'routine:skipped', payload: { name: 'test3' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test5', data: 'test5\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })

  it('stops all the strategy routines when one fails', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ]
        },
        test2: {
          steps: [{ name: 'test2', run: 'echo test2' }],
          dependsOn: 'test1'
        },
        test3: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          if: '2 + 2 === 4'
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2'
        },
        test5: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
          ],
          dependsOn: ['test3', 'test4'],
          if: 'false'
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
      status: 'success',
      routines: [
        [
          {
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
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
            name: 'test3',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3 [0]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3 [1]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3 [2]',
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
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3 [3]',
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
            error: null,
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
            error: null,
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
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test5 [0]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test5 [1]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'apple',
                  animal: 'dog'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test5 [2]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'pear',
                  animal: 'cat'
                }
              },
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test5 [3]',
                startedAt: null,
                status: 'skipped',
                steps: [],
                variables: {
                  fruit: 'pear',
                  animal: 'dog'
                }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(78)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test3 [0]', strategy: 'test3', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test3 [1]', strategy: 'test3', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test3 [2]', strategy: 'test3', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test3 [3]', strategy: 'test3', strategyIndex: 3 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'routine:skipped', payload: { name: 'test5' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
