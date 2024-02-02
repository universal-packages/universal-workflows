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
          steps: [{ name: 'test2', run: 'echo test2' }],
          dependsOn: 'test1'
        },
        test3: {
          steps: [{ name: 'test3', run: 'sleep nop' }],
          dependsOn: 'test1'
        },
        test4: {
          steps: [{ name: 'test3', run: 'echo test3' }],
          dependsOn: 'test2'
        },
        test5: {
          steps: [{ name: 'test5', run: 'echo test5' }],
          dependsOn: ['test3', 'test4']
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

    expect(workflow.status).toEqual(Status.Failure)
    expect(workflow.graph).toEqual({
      endedAt: expect.any(Date),
      measurement: expect.any(Measurement),
      name: null,
      startedAt: expect.any(Date),
      status: 'failure',
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
          }
        ],
        [
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
          },
          {
            endedAt: expect.any(Date),
            measurement: expect.any(Measurement),
            name: 'test3',
            startedAt: expect.any(Date),
            status: 'failure',
            steps: [
              {
                command: 'sleep nop',
                endedAt: expect.any(Date),
                error: 'Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n',
                measurement: expect.any(Measurement),
                name: 'test3',
                output: 'usage: sleep seconds\n',
                startedAt: expect.any(Date),
                status: 'failure',
                usable: null
              }
            ]
          }
        ],
        [
          {
            endedAt: expect.any(Date),
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
            endedAt: null,
            measurement: null,
            name: 'test5',
            startedAt: null,
            status: 'idle',
            steps: []
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(23)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 0, routine: 'test1' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement: expect.any(Measurement), payload: { name: 'test1' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'test2\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 0, routine: 'test2' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement: expect.any(Measurement), payload: { name: 'test2' } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test3' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test3', data: 'usage: sleep seconds\n' } }])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'step:failure',
        error: new Error('Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement: expect.any(Measurement),
        payload: { index: 0, routine: 'test3' }
      }
    ])
    expect(listener.mock.calls).toContainEqual([
      {
        event: 'routine:failure',
        error: new Error('Routine failed\n\nStep failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
        measurement: expect.any(Measurement),
        payload: { name: 'test3' }
      }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test4', data: 'test3\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 0, routine: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', measurement: expect.any(Measurement), payload: { name: 'test4' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'failure', error: new Error('Workflow failed'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow failed'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
