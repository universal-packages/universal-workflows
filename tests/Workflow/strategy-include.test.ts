import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('generates and run several routines grouped based on just providing the include descriptor', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      routines: {
        test1: {
          strategy: {
            include: [{ color: 'green' }, { color: 'pink', animal: 'cat' }]
          },
          steps: [
            { name: 'color', run: 'echo ${{ strategy.color }}' },
            { name: 'animal', run: 'echo ${{ strategy.animal }}' }
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
      status: Status.Success,
      routines: [
        [
          {
            error: null,
            name: 'test1',
            strategy: [
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [0]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo green',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'green\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo undefined',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'undefined\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: { color: 'green' }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: Status.Success,
                steps: [
                  {
                    command: 'echo pink',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'color',
                    output: 'pink\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  },
                  {
                    command: 'echo cat',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'cat\n',
                    startedAt: expect.any(Date),
                    status: Status.Success,
                    usable: null
                  }
                ],
                variables: { animal: 'cat', color: 'pink' }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(19)
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'green\n' } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'undefined\n' } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0, graph: expect.anything() } }])

    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'pink\n' } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:running', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([
      { event: 'step:success', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }
    ])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1, graph: expect.anything() } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
