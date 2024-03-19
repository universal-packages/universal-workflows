import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('can build a workflow from a plug-in', async (): Promise<void> => {
    const workflow = Workflow.buildFrom('echo-all-the-way', {
      allowDescribedTargetsOnTest: true,
      stepUsableLocation: './tests/__fixtures__/cases',
      workflowsLocation: './tests/__fixtures__'
    })

    await workflow.run()

    expect(workflow.status).toBe(Status.Success)
    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      error: null,
      measurement: expect.any(Measurement),
      name: 'Echo all the way',
      startedAt: expect.any(Date),
      status: Status.Success,
      routines: [
        [
          {
            error: null,
            name: 'echo1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo1 [0]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'echo-fruit',
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
                    name: 'echo-animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'cat',
                  shape: 'circle'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo1 [1]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'echo-fruit',
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
                    name: 'echo-animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'apple',
                  animal: 'dog',
                  shape: 'circle'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo1 [2]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo banana',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'echo-fruit',
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
                    name: 'echo-animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'banana',
                  animal: 'cat',
                  shape: 'square'
                }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo1 [3]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo banana',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'echo-fruit',
                    output: 'banana\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo dog',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'echo-animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: {
                  fruit: 'banana',
                  animal: 'dog',
                  shape: 'square'
                }
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'echo2',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo $FOO',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-foo',
                output: 'bar\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              },
              {
                command: 'echo $NUM',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-num',
                output: '42\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              },
              {
                command: 'echo $BOOL',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-bool',
                output: 'true\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              },
              {
                command: 'echo $ECHO',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-echo',
                output: 'echo2\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              },
              {
                command: 'echo $ECHO_NUM',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-echo-num',
                output: '2\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              },
              {
                command: 'echo $ECHO_BOOL',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'echo-env-echo-bool',
                output: 'true\n',
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
            name: 'git-failure',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'git clone nonexistent',
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'git-failure',
                output: "fatal: repository 'nonexistent' does not exist\n",
                startedAt: expect.any(Date),
                status: Status.Failure,
                usable: null
              }
            ]
          }
        ]
      ]
    })
  })
})
