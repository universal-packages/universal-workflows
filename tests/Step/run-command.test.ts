import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Step } from '../../src'

describe(Step, (): void => {
  describe('running a command (run) step', (): void => {
    it('runs a described step', async (): Promise<void> => {
      const step = new Step({ run: 'echo $variable', environment: { variable: 'This is a variable' }, target: { engine: 'spawn' } })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: 'echo $variable',
        error: null,
        endedAt: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: null
      })

      await step.run()

      expect(step.status).toEqual(Status.Success)
      expect(step.output).toEqual('This is a variable\n')
      expect(step.graph).toEqual({
        command: 'echo $variable',
        error: null,
        endedAt: expect.any(Date),
        measurement: expect.any(Measurement),
        name: null,
        output: 'This is a variable\n',
        startedAt: expect.any(Date),
        status: Status.Success,
        usable: null
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'This is a variable\n' } }],
        [{ event: 'success', measurement: expect.any(Measurement) }],
        [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('runs a described step and uses the scope to evaluate dynamic commands', async (): Promise<void> => {
      const step = new Step({
        run: 'echo $<< outputs.variable >>',
        scope: { outputs: { variable: 'Comes form values generated dynamically while running' } },
        target: { engine: 'spawn' }
      })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: 'echo $<< outputs.variable >>',
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: null
      })

      await step.run()

      expect(step.status).toEqual(Status.Success)
      expect(step.output).toEqual('Comes form values generated dynamically while running\n')
      expect(step.graph).toEqual({
        command: 'echo Comes form values generated dynamically while running',
        endedAt: expect.any(Date),
        error: null,
        measurement: expect.any(Measurement),
        name: null,
        output: 'Comes form values generated dynamically while running\n',
        startedAt: expect.any(Date),
        status: Status.Success,
        usable: null
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'Comes form values generated dynamically while running\n' } }],
        [{ event: 'success', measurement: expect.any(Measurement) }],
        [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('is prepared for when the command fails', async (): Promise<void> => {
      const step = new Step({ run: 'sleep f', target: { engine: 'spawn' } })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: 'sleep f',
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: null
      })

      await step.run()

      expect(step.status).toEqual(Status.Failure)
      expect(step.output).toEqual('usage: sleep seconds\n')
      expect(step.graph).toEqual({
        command: 'sleep f',
        endedAt: expect.any(Date),
        error: 'Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n',
        measurement: expect.any(Measurement),
        name: null,
        output: 'usage: sleep seconds\n',
        startedAt: expect.any(Date),
        status: Status.Failure,
        usable: null
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'usage: sleep seconds\n' } }],
        [{ event: 'failure', error: new Error('Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'), measurement: expect.any(Measurement) }],
        [
          {
            event: 'end',
            error: new Error('Step failed\n\nProcess exited with code 1\n\nusage: sleep seconds\n'),
            measurement: expect.any(Measurement),
            payload: { endedAt: expect.any(Date) }
          }
        ]
      ])
    })

    it('is prepared for when the command is killed', async (): Promise<void> => {
      const step = new Step({ run: 'sleep 10', target: { engine: 'spawn' } })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: 'sleep 10',
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: null
      })

      step.run()

      await step.waitFor(Status.Running)

      expect(step.graph).toEqual({
        command: 'sleep 10',
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: expect.any(Date),
        status: Status.Running,
        usable: null
      })

      step.stop()

      expect(step.graph).toEqual({
        command: 'sleep 10',
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: expect.any(Date),
        status: Status.Stopping,
        usable: null
      })

      await step.stop()

      expect(step.status).toEqual(Status.Stopped)
      expect(step.output).toEqual('')
      expect(step.graph).toEqual({
        command: 'sleep 10',
        endedAt: expect.any(Date),
        error: 'Step stopped',
        measurement: expect.any(Measurement),
        name: null,
        output: null,
        startedAt: expect.any(Date),
        status: Status.Stopped,
        usable: null
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'stopping' }],
        [{ event: 'stopped', error: new Error('Step stopped'), measurement: expect.any(Measurement) }],
        [{ event: 'end', error: new Error('Step stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('complains when no run command is provided', async (): Promise<void> => {
      const step = new Step({ target: { engine: 'spawn' } })
      const listener = jest.fn()

      step.on('*', listener)

      await step.run()

      expect(step.status).toEqual(Status.Error)

      expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('Nothing to run, please provide either a run or use option') }]])
    })
  })
})
