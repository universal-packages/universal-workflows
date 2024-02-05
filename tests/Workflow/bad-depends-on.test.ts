import { Status } from '@universal-packages/sub-process'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('throws if routines have circular dependencies', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          dependsOn: 'test2',
          steps: [{ name: 'test1', run: 'echo test1' }]
        },
        test2: {
          dependsOn: 'test1',
          steps: [{ name: 'test2', run: 'echo test2' }]
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

    expect(workflow.status).toEqual(Status.Error)
    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: null,
      status: Status.Error,
      routines: []
    })

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Routine "test1" has a circular dependency all the way to "test2".') }]])
  })

  it('throws if routines depends on an nonexistent routine', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: { steps: [{ name: 'test1', run: 'echo test1' }] },
        test2: { dependsOn: 'test8', steps: [{ name: 'test2', run: 'echo test2' }] }
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

    expect(workflow.status).toEqual(Status.Error)
    expect(workflow.graph).toEqual({
      endedAt: null,
      error: null,
      measurement: null,
      name: null,
      startedAt: null,
      status: Status.Error,
      routines: []
    })

    expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Routine "test2" depends on "test8" which does not exist.') }]])
  })
})
