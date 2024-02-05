import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('generates and run several routines grouped based on a single descriptor', async (): Promise<void> => {
    const workflow = new Workflow({
      stepUsableLocation: './tests/__fixtures__/cases',
      target: 'spawn',
      routines: {
        test1: {
          strategy: { matrix: { fruit: ['apple', 'pear'], animal: ['cat', 'dog'] } },
          steps: [
            { name: 'fruit', run: 'echo ${{ strategy.fruit }}' },
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
      status: 'success',
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
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: { fruit: 'apple', animal: 'cat' }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [1]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo apple',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'apple\n',
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  },
                  {
                    command: 'echo dog',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: { fruit: 'apple', animal: 'dog' }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [2]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
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
                    status: 'success',
                    usable: null
                  }
                ],
                variables: { fruit: 'pear', animal: 'cat' }
              },
              {
                endedAt: expect.any(Date),
                error: null,
                measurement: expect.any(Measurement),
                name: 'test1 [3]',
                startedAt: expect.any(Date),
                status: 'success',
                steps: [
                  {
                    command: 'echo pear',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'fruit',
                    output: 'pear\n',
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  },
                  {
                    command: 'echo dog',
                    endedAt: expect.any(Date),
                    error: null,
                    measurement: expect.any(Measurement),
                    name: 'animal',
                    output: 'dog\n',
                    startedAt: expect.any(Date),
                    status: 'success',
                    usable: null
                  }
                ],
                variables: { fruit: 'pear', animal: 'dog' }
              }
            ]
          }
        ]
      ]
    })

    expect(listener).toHaveBeenCalledTimes(35)
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'running', payload: { startedAt: expect.any(Date) } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [0]', strategy: 'test1', strategyIndex: 0 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'apple\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [1]', strategy: 'test1', strategyIndex: 1 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 0, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2, data: 'cat\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [2]', strategy: 'test1', strategyIndex: 2 } }])

    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:running', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 0, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'pear\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:running', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:output', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3, data: 'dog\n' } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'step:success', payload: { index: 1, routine: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'routine:success', payload: { name: 'test1 [3]', strategy: 'test1', strategyIndex: 3 } }])
    expect(listener.mock.calls).toContainEqual([{ event: 'success', measurement: expect.any(Measurement) }])
    expect(listener.mock.calls).toContainEqual([{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }])
  })
})
