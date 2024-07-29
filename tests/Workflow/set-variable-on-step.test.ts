import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('continue running routines if one fails if it was expected to fail', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          steps: [
            {
              name: 'test1',
              run: 'echo test1',
              setVariable: { name: 'my-variable', value: 'output.includes("1") ? "Yes" : "No"' }
            }
          ]
        },
        test2: {
          steps: [
            {
              name: 'test2',
              run: 'echo ${{ variables.my-variable }}'
            }
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
            endedAt: expect.any(Date),
            error: null,
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
                strategy: null,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo Yes',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'Yes\n',
                startedAt: expect.any(Date),
                status: 'success',
                strategy: null,
                usable: null
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(13)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1', graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'Yes\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })

  it('errors if expression can not be evaluated', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          steps: [
            {
              name: 'test1',
              run: 'echo test1',
              setVariable: { name: 'my-variable', value: 'output.someFunction()' }
            }
          ]
        },
        test2: {
          steps: [
            {
              name: 'test2',
              run: 'echo ${{ variables.my-variable }}'
            }
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
      status: 'failure',
      routines: [
        [
          {
            endedAt: expect.any(Date),
            error: 'output.someFunction is not a function',
            measurement: expect.any(Measurement),
            name: 'test1',
            startedAt: expect.any(Date),
            status: 'failure',
            steps: [
              {
                command: 'echo test1',
                endedAt: expect.any(Date),
                error: 'output.someFunction is not a function',
                measurement: expect.any(Measurement),
                name: 'test1',
                output: 'test1\n',
                startedAt: expect.any(Date),
                status: 'error',
                strategy: null,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test2',
            startedAt: expect.any(Date),
            status: 'success',
            steps: [
              {
                command: 'echo undefined',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test2',
                output: 'undefined\n',
                startedAt: expect.any(Date),
                status: 'success',
                strategy: null,
                usable: null
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toBeCalledTimes(13)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1', data: 'test1\n' } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:error', error: new Error('output.someFunction is not a function'), payload: { index: 0, routine: 'test1', graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'routine:failure', error: new Error('output.someFunction is not a function'), payload: { name: 'test1', graph: expect.anything() } }
    ])

    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test2', data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test2', graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'failure', error: new Error('Workflow failed'), measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'end', error: new Error('Workflow failed'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }
    ])
  })
})
