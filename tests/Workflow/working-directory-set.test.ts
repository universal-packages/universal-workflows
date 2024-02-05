import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('runs routines in parallel respecting dependencies', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      workingDirectory: './src',
      target: 'spawn',
      routines: {
        test1: { steps: [{ run: 'ls' }] },
        test2: { steps: [{ run: 'ls' }], workingDirectory: './tests' },
        test3: { steps: [{ run: 'ls', workingDirectory: './tests/__fixtures__' }] }
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
                command: 'ls',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: `BaseUsable.ts
BaseUsable.types.ts
Routine.ts
Routine.types.ts
Step.ts
Step.types.ts
Workflow.schema.ts
Workflow.ts
Workflow.types.ts
index.ts\n`,
                startedAt: expect.any(Date),
                status: Status.Success,
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
            status: Status.Success,
            steps: [
              {
                command: 'ls',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: `BaseUsable.test.ts
Routine
Step
Workflow
__fixtures__
setup.ts\n`,
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          },
          {
            endedAt: expect.any(Date),
            error: null,
            measurement: expect.any(Measurement),
            name: 'test3',
            startedAt: expect.any(Date),
            status: Status.Success,
            steps: [
              {
                command: 'ls',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: `cases
load-error
universal-workflows\n`,
                startedAt: expect.any(Date),
                status: Status.Success,
                usable: null
              }
            ]
          }
        ]
      ]
    })
  })
})
