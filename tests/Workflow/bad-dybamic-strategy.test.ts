import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('fails if the generated matrix is not an object', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          steps: [{ name: 'strategy', use: 'generate-strategy' }]
        },

        test2: {
          dependsOn: 'test1',
          strategy: { matrix: 'outputs.test1.nop', include: 'outputs.test1.strategy.include' },
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
      status: Status.Failure,
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
                status: Status.Success,
                usable: 'generate-strategy'
              }
            ]
          }
        ],
        [
          {
            name: 'test2',
            error: 'Strategy matrix did not evaluate to an object',
            strategy: []
          }
        ]
      ]
    })
  })

  it('fails if the generated include is not ana array of objects', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          steps: [{ name: 'strategy', use: 'generate-strategy' }]
        },

        test2: {
          dependsOn: 'test1',
          strategy: { matrix: 'outputs.test1.strategy.matrix', include: 'outputs.test1.nop' },
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
      status: Status.Failure,
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
                status: Status.Success,
                usable: 'generate-strategy'
              }
            ]
          }
        ],
        [
          {
            error: 'Strategy include did not evaluate to an array if objects',
            name: 'test2',
            strategy: []
          }
        ]
      ]
    })
  })
})
