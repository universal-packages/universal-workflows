import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('generates the startegy getting it from the outputs', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          steps: [{ name: 'strategy', use: 'generate-strategy' }]
        },

        test2: {
          dependsOn: 'test1',
          strategy: { matrix: 'outputs.test1.strategy.matrix', include: 'outputs.test1.strategy.include' },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
            { name: 'number', run: 'echo ${{ strategy.number }}' },
            { name: 'shape', run: 'echo ${{ strategy.shape }}' }
          ]
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
                command: null,
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'strategy',
                output: {
                  matrix: {
                    fruit: ['apple', 'pear'],
                    number: [1, 2]
                  },
                  include: [
                    {
                      shape: 'circle'
                    }
                  ]
                },
                startedAt: expect.any(Date),
                status: 'success',
                usable: 'generate-strategy'
              }
            ]
          }
        ],
        [
          {
            name: 'test2',
            strategy: [
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [0]',
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
                    command: 'echo 1',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '1\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  '0': 'e',
                  fruit: 'apple',
                  number: 1
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [1]',
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
                    command: 'echo 2',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '2\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  '0': 'e',
                  fruit: 'apple',
                  number: 2
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [2]',
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
                    command: 'echo 1',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '1\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  '0': 'e',
                  fruit: 'pear',
                  number: 1
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [3]',
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
                    command: 'echo 2',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '2\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  '0': 'e',
                  fruit: 'pear',
                  number: 2
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [0]',
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
                    command: 'echo 1',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '1\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  number: 1,
                  shape: 'circle'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [1]',
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
                    command: 'echo 2',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '2\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  number: 2,
                  shape: 'circle'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [2]',
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
                    command: 'echo 1',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '1\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  number: 1,
                  shape: 'circle'
                }
              },
              {
                endedAt: expect.any(Date),
                measurement: expect.any(Measurement),
                name: 'test2 [3]',
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
                    command: 'echo 2',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'number',
                    output: '2\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'pear',
                  number: 2,
                  shape: 'circle'
                }
              }
            ]
          }
        ]
      ]
    })
  })
})
