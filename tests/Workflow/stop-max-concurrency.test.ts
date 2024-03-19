import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('runs routines in parallel', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      maxConcurrentRoutines: 2,
      routines: {
        test1: {
          steps: [{ name: 'test1', use: 'Controllable', with: { id: 'test1' } }]
        },
        test2: {
          steps: [{ name: 'test2', use: 'Controllable', with: { id: 'test2' } }]
        },
        test3: {
          steps: [{ name: 'test3', use: 'Controllable', with: { id: 'test3' } }]
        },
        test4: {
          strategy: {
            matrix: {
              fruit: ['apple', 'pear'],
              animal: ['cat', 'dog']
            }
          },
          steps: [
            { name: 'fruit', use: 'Controllable', with: { id: '${{ strategy.fruit }}-${{ strategy.index }}' } },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
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

    workflow.run()

    await workflow.waitFor(Status.Running)

    expect(workflow.status).toEqual(Status.Running)
    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: 'running',
      routines: [
        [
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test1',
            startedAt: expect.any(Date),
            status: 'running',
            steps: [
              {
                command: null,
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1',
                output: null,
                startedAt: expect.any(Date),
                status: 'running',
                usable: 'Controllable'
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'running',
            steps: [
              {
                command: null,
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test2',
                output: null,
                startedAt: expect.any(Date),
                status: 'running',
                usable: 'Controllable'
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test3',
            startedAt: null,
            status: 'idle',
            steps: []
          },
          {
            error: null,
            name: 'test4',
            strategy: [
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test4 [0]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [1]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [2]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [3]',
                startedAt: null,
                status: 'idle',
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

    workflow.stop()

    await new Promise((resolve) => setTimeout(resolve, 500))

    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      error: 'Workflow was stopped',
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'stopped',
      routines: [
        [
          {
            endedAt: expect.any(Date),
            error: 'Routine was stopped',
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: 'stopped',
            steps: [
              {
                command: null,
                endedAt: expect.any(Date),
                error: 'Step was stopped',
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'Controllable step with id: test1 is running\nControllable step with id: test1 was stopped\n',
                startedAt: expect.any(Date),
                status: 'stopped',
                usable: 'Controllable'
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: 'Routine was stopped',
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'stopped',
            steps: [
              {
                command: null,
                endedAt: expect.any(Date),
                error: 'Step was stopped',
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'Controllable step with id: test2 is running\nControllable step with id: test2 was stopped\n',
                startedAt: expect.any(Date),
                status: 'stopped',
                usable: 'Controllable'
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test3',
            startedAt: null,
            status: 'idle',
            steps: []
          },
          {
            error: null,
            name: 'test4',
            strategy: [
              {
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test4 [0]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [1]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [2]',
                startedAt: null,
                status: 'idle',
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
                name: 'test4 [3]',
                startedAt: null,
                status: 'idle',
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
  })
})
