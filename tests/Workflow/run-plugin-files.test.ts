import { Status } from '@universal-packages/sub-process'
import { Measurement } from '@universal-packages/time-measurer'

import { Workflow } from '../../src'

describe(Workflow, (): void => {
  it('runs routines in parallel respecting dependencies', async (): Promise<void> => {
    const workflow = await Workflow.buildFrom('echo-all-the-way', { stepUsableLocation: './tests/__fixtures__/cases', workflowsLocation: './tests/__fixtures__' })

    await workflow.run()

    expect(workflow.status).toBe(Status.Success)
  })
})
