import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('throws if the workflow name does not appear in the available workflows', async (): Promise<void> => {
    expect(() => {
      Workflow.buildFrom('nonexistent', { stepUsableLocation: './tests/__fixtures__/cases', workflowsLocation: './tests/__fixtures__' })
    }).toThrowError(`Unrecognized workflow: nonexistent

Available workflows: bad-environment
bad-name
bad-routine-depends-on-2
bad-routine-depends-on
bad-routine-environment
bad-routine-if
bad-routine-on-failure
bad-routine-steps
bad-routine-target
bad-routine-unless
bad-routine-working-directory
bad-routine
bad-routines
bad-step-environment
bad-step-if
bad-step-input-2
bad-step-input
bad-step-name
bad-step-on-failure
bad-step-run
bad-step-target
bad-step-unless
bad-step-use
bad-step-with
bad-step-working-directory
bad-step
bad-strategy-2
bad-strategy-3
bad-strategy-4
bad-strategy-5
bad-strategy-6
bad-strategy
bad-target
bad-targets-2
bad-targets-3
bad-targets
bad-working-directory
echo-all-the-way`)
  })
})
