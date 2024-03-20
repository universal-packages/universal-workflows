import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('is prepared to stop routines', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      maxConcurrentRoutines: 3,
      routines: {
        test1: {
          steps: [{ name: 'test1', run: 'echo test1' }]
        },
        test2: {
          steps: [{ name: 'test2', run: 'failure' }]
        },
        test3: {
          steps: [{ name: 'test3', run: 'sleep 1000' }]
        },
        test4: {
          steps: [{ name: 'test4', run: 'echo test3' }],
          dependsOn: ['test1', 'test2']
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
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test1',
            startedAt: expect.any(Date),
            status: Status.Running,
            steps: [
              {
                command: 'echo test1',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1',
                output: null,
                startedAt: expect.any(Date),
                status: Status.Running,
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test2',
            startedAt: expect.any(Date),
            status: Status.Running,
            steps: [
              {
                command: 'failure',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test2',
                output: null,
                startedAt: expect.any(Date),
                status: Status.Running,
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test3',
            startedAt: expect.any(Date),
            status: Status.Running,
            steps: [
              {
                command: 'sleep 1000',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: Status.Running,
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test4',
            startedAt: null,
            status: 'idle',
            steps: []
          }
        ]
      ]
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

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
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test1',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'test1\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: 'Process exited with code 1\n\nCommand failed',
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: Status.Failure,
            steps: [
              {
                command: 'failure',
                endedAt: expect.any(Date),
                error: 'Process exited with code 1\n\nCommand failed',
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'Command failed',
                startedAt: expect.any(Date),
                status: Status.Failure,
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test3',
            startedAt: expect.any(Date),
            status: Status.Stopping,
            steps: [
              {
                command: 'sleep 1000',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: Status.Stopping,
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test4',
            startedAt: null,
            status: 'idle',
            steps: []
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
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test1',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'test1\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: 'Process exited with code 1\n\nCommand failed',
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: Status.Failure,
            steps: [
              {
                command: 'failure',
                endedAt: expect.any(Date),
                error: 'Process exited with code 1\n\nCommand failed',
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'Command failed',
                startedAt: expect.any(Date),
                status: Status.Failure,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: 'Routine was stopped',
            measurement: expect.any(Measurement),
            name: 'test3',
            startedAt: expect.any(Date),
            status: Status.Stopped,
            steps: [
              {
                command: 'sleep 1000',
                endedAt: expect.any(Date),
                error: 'Step was stopped',
                measurement: expect.any(Measurement),
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: Status.Stopped,
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
            error: null,
            measurement: null,
            name: 'test4',
            startedAt: null,
            status: 'idle',
            steps: []
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(20)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'Command failed' } }])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { index: 0, routine: 'test2', graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { name: 'test2', graph: expect.anything() }
      }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopping' }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopped', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
