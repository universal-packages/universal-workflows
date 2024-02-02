import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Step } from '../../src'
import FailureUsable from '../__fixtures__/cases/Failure.usable'
import GoodUsable from '../__fixtures__/cases/Good.usable'
import SeveralSubsUsable from '../__fixtures__/cases/SeveralSubs.usable'
import ThrowUsable from '../__fixtures__/cases/Throw.usable'

describe(Step, (): void => {
  describe('running a usable step (use)', (): void => {
    it('runs a described step', async (): Promise<void> => {
      const step = new Step({
        use: 'Good',
        with: { good: true },
        environment: { variable: 'This is a variable' },
        scope: { good: 'Other output' },
        usableMap: { good: GoodUsable }
      })
      const listener = jest.fn()

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: 'Good'
      })

      step.on('*', listener)

      await step.run()

      expect(step.status).toEqual(Status.Success)
      expect(step.output).toEqual('This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\n')
      expect(step.graph).toEqual({
        command: null,
        endedAt: expect.any(Date),
        error: null,
        measurement: expect.any(Measurement),
        name: null,
        output: 'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\n',
        startedAt: expect.any(Date),
        status: Status.Success,
        usable: 'Good'
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [
          {
            event: 'output',
            payload: { data: 'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\n' }
          }
        ],
        [{ event: 'success', measurement: expect.any(Measurement) }],
        [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('is prepared for when the step usable is failed purposely', async (): Promise<void> => {
      const step = new Step({ use: 'failure', usableMap: { failure: FailureUsable } })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: 'failure'
      })

      await step.run()

      expect(step.status).toEqual(Status.Failure)
      expect(step.output).toEqual('This is step is about to fail\n')
      expect(step.graph).toEqual({
        command: null,
        endedAt: expect.any(Date),
        error: 'This Step was failed purposely',
        measurement: expect.any(Measurement),
        name: null,
        output: 'This is step is about to fail\n',
        startedAt: expect.any(Date),
        status: Status.Failure,
        usable: 'failure'
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'This is step is about to fail\n' } }],
        [{ event: 'failure', error: new Error('This Step was failed purposely'), measurement: expect.any(Measurement) }],
        [{ event: 'end', error: new Error('This Step was failed purposely'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('is prepared for when the step usable throws an error', async (): Promise<void> => {
      const step = new Step({ use: 'throw', usableMap: { throw: ThrowUsable } })
      const listener = jest.fn()

      step.on('*', listener)

      await step.run()

      expect(step.status).toEqual(Status.Failure)
      expect(step.output).toEqual('This is step is about to throw an error\n')

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'This is step is about to throw an error\n' } }],
        [{ event: 'failure', error: new Error('Unexpected error'), measurement: expect.any(Measurement) }],
        [{ event: 'end', error: new Error('Unexpected error'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('is prepared for when the step usable is stopped', async (): Promise<void> => {
      const step = new Step({
        use: 'good',
        usableMap: { good: GoodUsable },
        with: { good: true },
        environment: { variable: 'This is a variable' },
        scope: { good: 'Other output' }
      })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: 'good'
      })

      step.run()

      await step.waitFor(Status.Running)

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: expect.any(Date),
        status: Status.Running,
        usable: 'good'
      })

      step.stop()

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: expect.any(Date),
        status: Status.Stopping,
        usable: 'good'
      })

      await step.stop()

      expect(step.status).toEqual(Status.Stopped)
      expect(step.output).toEqual(
        'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\nThe good step was stopped before it could finish\n'
      )
      expect(step.graph).toEqual({
        command: null,
        endedAt: expect.any(Date),
        error: 'Step was stopped',
        measurement: expect.any(Measurement),
        name: null,
        output:
          'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\nThe good step was stopped before it could finish\n',
        startedAt: expect.any(Date),
        status: Status.Stopped,
        usable: 'good'
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [
          {
            event: 'output',
            payload: { data: 'This is a good step, using env: {"variable":"This is a variable"}, scope: {"good":"Other output"}, and with: {"good":true}\n' }
          }
        ],
        [{ event: 'stopping' }],
        [{ event: 'output', payload: { data: 'The good step was stopped before it could finish\n' } }],
        [{ event: 'stopped', error: new Error('Step was stopped'), measurement: expect.any(Measurement) }],
        [{ event: 'end', error: new Error('Step was stopped'), measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })

    it('complains when no an invalid use name is provided', async (): Promise<void> => {
      const step = new Step({ use: 'nonexistent' })
      const listener = jest.fn()

      step.on('*', listener)

      await step.run()

      expect(step.status).toEqual(Status.Error)

      expect(listener.mock.calls).toEqual([[{ event: 'error', error: new Error('No usable step with the name nonexistent found') }]])
    })

    it('is able to execute sub processes withing the usable', async (): Promise<void> => {
      const step = new Step({ use: 'several', usableMap: { several: SeveralSubsUsable }, target: { engine: 'spawn' } })
      const listener = jest.fn()

      step.on('*', listener)

      expect(step.graph).toEqual({
        command: null,
        endedAt: null,
        error: null,
        measurement: null,
        name: null,
        output: null,
        startedAt: null,
        status: Status.Idle,
        usable: 'several'
      })

      await step.run()

      expect(step.status).toEqual(Status.Success)
      expect(step.output).toMatch(
        new RegExp(`this is a variable
CODE-OF-CONDUCT.md
CONTRIBUTING.md
LICENSE.md
README.md(\ncoverage)?
node_modules
package-lock.json
package.json
src
tests
tsconfig.dis.json
tsconfig.json\n`)
      )
      expect(step.graph).toEqual({
        command: null,
        endedAt: expect.any(Date),
        error: null,
        measurement: expect.any(Measurement),
        name: null,
        output: expect.stringMatching(
          new RegExp(`this is a variable
CODE-OF-CONDUCT.md
CONTRIBUTING.md
LICENSE.md
README.md(\ncoverage)?
node_modules
package-lock.json
package.json
src
tests
tsconfig.dis.json
tsconfig.json\n`)
        ),
        startedAt: expect.any(Date),
        status: Status.Success,
        usable: 'several'
      })

      expect(listener.mock.calls).toEqual([
        [{ event: 'running', payload: { startedAt: expect.any(Date) } }],
        [{ event: 'output', payload: { data: 'this is a variable\n' } }],
        [
          {
            event: 'output',
            payload: {
              data: expect.stringMatching(
                new RegExp(`CODE-OF-CONDUCT.md
CONTRIBUTING.md
LICENSE.md
README.md(\ncoverage)?
node_modules
package-lock.json
package.json
src
tests
tsconfig.dis.json
tsconfig.json\n`)
              )
            }
          }
        ],
        [{ event: 'success', measurement: expect.any(Measurement) }],
        [{ event: 'end', measurement: expect.any(Measurement), payload: { endedAt: expect.any(Date) } }]
      ])
    })
  })
})
