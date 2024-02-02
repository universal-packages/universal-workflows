import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Routine } from '../../src'

describe(Routine, (): void => {
  it('uses step working directory then routine working directory', async (): Promise<void> => {
    const routine = new Routine({
      name: 'r-test',
      workingDirectory: './tests',
      steps: [{ run: 'ls' }, { run: 'ls', workingDirectory: './src' }],
      target: { engine: 'spawn' }
    })
    const listener = jest.fn()

    routine.on('**', listener)

    expect(routine.graph).toEqual({
      endedAt: null,
      measurement: null,
      name: 'r-test',
      startedAt: null,
      steps: [],
      status: Status.Idle
    })

    await routine.run()

    expect(routine.status).toEqual(Status.Success)
    expect(routine.graph).toEqual({
      endedAt: expect.any(Date),
      measurement: expect.any(Measurement),
      name: 'r-test',
      startedAt: expect.any(Date),
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
        },
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
      ],
      status: Status.Success
    })

    expect(listener.mock.calls).toEqual([
      [{ event: 'step:running', payload: { index: 0, routine: 'r-test' } }],
      [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
      [
        {
          event: 'step:output',
          payload: {
            data: `BaseUsable.test.ts
Routine
Step
Workflow
__fixtures__
setup.ts\n`,
            index: 0,
            routine: 'r-test'
          }
        }
      ],
      [{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 0, routine: 'r-test' } }],
      [{ event: 'step:running', payload: { index: 1, routine: 'r-test' } }],
      [
        {
          event: 'step:output',
          payload: {
            data: `BaseUsable.ts
BaseUsable.types.ts
Routine.ts
Routine.types.ts
Step.ts
Step.types.ts
Workflow.schema.ts
Workflow.ts
Workflow.types.ts
index.ts\n`,
            index: 1,
            routine: 'r-test'
          }
        }
      ],
      [{ event: 'step:success', measurement: expect.any(Measurement), payload: { index: 1, routine: 'r-test' } }],
      [{ event: 'success', measurement: expect.any(Measurement) }],
      [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
    ])
  })
})
