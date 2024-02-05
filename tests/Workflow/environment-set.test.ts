import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('Uses step env then routine and finally the workflow one', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      environment: { VARIABLE: 'from workflow' },
      target: 'spawn',
      routines: {
        test1: { steps: [{ run: 'echo $VARIABLE' }] },
        test2: { steps: [{ run: 'echo $VARIABLE' }], environment: { VARIABLE: 'from routine' } },
        test3: { steps: [{ run: 'echo $VARIABLE', environment: { VARIABLE: 'from step' } }] }
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
                command: 'echo $VARIABLE',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: 'from workflow\n',
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
                command: 'echo $VARIABLE',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: 'from routine\n',
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
                command: 'echo $VARIABLE',
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: null,
                output: 'from step\n',
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
