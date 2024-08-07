import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { OnFailureAction, Workflow } from '../../src'

describe(Workflow, (): void => {
  it('continue running routines if one fails if it was expected to fail', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          steps: [{ name: 'test1', run: 'echo test1' }]
        },
        test2: {
          steps: [{ name: 'test2', run: 'echo test2' }],
          dependsOn: 'test1'
        },
        test3: {
          steps: [{ name: 'test3', run: 'failure' }],
          dependsOn: 'test1',
          onFailure: OnFailureAction.Continue
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2'
        },
        test5: {
          steps: [{ name: 'test5', run: 'failure' }],
          dependsOn: ['test3', 'test4'],
          onFailure: OnFailureAction.Continue
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
                strategy: null,
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
            name: 'test2',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'echo test2',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'test2\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                strategy: null,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: 'Process exited with code 1\n\nCommand failed',
            measurement: expect.any(Measurement),
            name: 'test3',
            startedAt: expect.any(Date),
            status: Status.Failure,
            steps: [
              {
                command: 'failure',
                endedAt: expect.any(Date),
                error: 'Process exited with code 1\n\nCommand failed',
                measurement: expect.any(Measurement),
                name: 'test3',
                output: 'Command failed',
                startedAt: expect.any(Date),
                status: Status.Failure,
                strategy: null,
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
            status: Status.Success,
            steps: [
              {
                command: 'echo test3',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test3',
                output: 'test3\n',
                startedAt: expect.any(Date),
                status: Status.Success,
                strategy: null,
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
            error: 'Process exited with code 1\n\nCommand failed',
            measurement: expect.any(Measurement),
            name: 'test5',
            startedAt: expect.any(Date),
            status: Status.Failure,
            steps: [
              {
                command: 'failure',
                endedAt: expect.any(Date),
                error: 'Process exited with code 1\n\nCommand failed',
                measurement: expect.any(Measurement),
                name: 'test5',
                output: 'Command failed',
                startedAt: expect.any(Date),
                status: Status.Failure,
                strategy: null,
                usable: null
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(28)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3', data: 'Command failed' } }])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { index: 0, routine: 'test3', graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { name: 'test3', graph: expect.anything() }
      }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test4', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test4', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test5', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test5', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test5', data: 'Command failed' } }])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { index: 0, routine: 'test5', graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Process exited with code 1\n\nCommand failed'),
        payload: { name: 'test5', graph: expect.anything() }
      }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
