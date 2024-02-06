import TerminalPresenter from './src/TerminalPresenter'
import Workflow from './src/Workflow'

async function doIt() {
  const workflow = Workflow.buildFrom('sleep-good')
  const terminalPresenter = new TerminalPresenter(workflow)

  terminalPresenter.present()

  await workflow.run()
}

doIt()
