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
          steps: [{ name: 'test1', run: 'echo test1' }]
        },
        test2: {
          steps: [{ name: 'test2', run: 'git clone nonexistent' }]
        },
        test3: {
          steps: [{ name: 'test3', run: 'sleep 10' }]
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
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: 'running',
      routines: [
        [
          {
            endedAt: null,
            measurement: null,
            name: 'test1',
            startedAt: expect.any(Date),
            status: 'running',
            steps: [
              {
                command: 'echo test1',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test1',
                output: null,
                startedAt: expect.any(Date),
                status: 'running',
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            measurement: null,
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'running',
            steps: [
              {
                command: 'git clone nonexistent',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test2',
                output: null,
                startedAt: expect.any(Date),
                status: 'running',
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            measurement: null,
            name: 'test3',
            startedAt: expect.any(Date),
            status: 'running',
            steps: [
              {
                command: 'sleep 10',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: 'running',
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
            measurement: null,
            name: 'test4',
            startedAt: null,
            status: 'idle',
            steps: []
          }
        ]
      ]
    })

    await new Promise((resolve) => setTimeout(resolve, 2500))

    workflow.stop()

    await workflow.waitForStatus(Status.Stopping)

    expect(workflow.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: null,
      startedAt: expect.any(Date),
      status: 'stopping',
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
            status: 'failure',
            steps: [
              {
                command: 'git clone nonexistent',
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'test2',
                output: "fatal: repository 'nonexistent' does not exist\n",
                startedAt: expect.any(Date),
                status: 'failure',
                usable: null
              }
            ]
          },
          {
            endedAt: null,
            measurement: null,
            name: 'test3',
            startedAt: expect.any(Date),
            status: 'stopping',
            steps: [
              {
                command: 'sleep 10',
                endedAt: null,
                error: null,
                measurement: null,
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: 'stopping',
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
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
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'stopped',
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
            status: 'failure',
            steps: [
              {
                command: 'git clone nonexistent',
                endedAt: expect.any(Date),
                error: "Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n",
                measurement: expect.any(Measurement),
                name: 'test2',
                output: "fatal: repository 'nonexistent' does not exist\n",
                startedAt: expect.any(Date),
                status: 'failure',
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test3',
            startedAt: expect.any(Date),
            status: 'stopped',
            steps: [
              {
                command: 'sleep 10',
                endedAt: expect.any(Date),
                error: 'Step was stopped',
                measurement: expect.any(Measurement),
                name: 'test3',
                output: null,
                startedAt: expect.any(Date),
                status: 'stopped',
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: null,
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
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: "fatal: repository 'nonexistent' does not exist\n" } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:failure', error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"), payload: { index: 0, routine: 'test2' } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:failure', error: new Error("Process exited with code 128\n\nfatal: repository 'nonexistent' does not exist\n"), payload: { name: 'test2' } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopping' }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopping', payload: { name: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopping', payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:stopped', error: new Error('Step was stopped'), payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:stopped', error: new Error('Routine was stopped'), payload: { name: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'stopped', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow was stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
