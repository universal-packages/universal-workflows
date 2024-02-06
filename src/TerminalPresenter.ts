import { Measurement } from '@universal-packages/time-measurer'
import ansiEscapes from 'ansi-escapes'
import chalk from 'chalk'

import { RoutineGraph, Status, StepGraph, StrategyGraph, WorkflowGraph } from '.'
import Workflow from './Workflow'

export default class TerminalPresenter {
  private workflow: Workflow
  private resolution = 666
  private interval: NodeJS.Timeout
  private workflowGraph: WorkflowGraph
  private outputs: Record<string, Record<string, string>> = {}

  public constructor(workflow: Workflow) {
    this.workflow = workflow

    this.workflow.on('*:*', () => {
      this.workflowGraph = this.workflow.graph
    })

    this.workflow.on('step:output', (event) => {
      if (!this.outputs[event.payload.routine]) this.outputs[event.payload.routine] = {}
      this.outputs[event.payload.routine][event.payload.index] = event.payload.data
    })

    this.workflow.on('end', () => {
      this.workflowGraph = this.workflow.graph
      this.stop()
    })
  }

  public present(): void {
    this.interval = setInterval(() => {
      this.renderGraph()
    }, this.resolution)
  }

  public stop(): void {
    clearInterval(this.interval)
    this.renderGraph()
    if (this.workflow) this.workflow.removeAllListeners()
  }

  private renderGraph() {
    process.stdout.write(ansiEscapes.clearTerminal)

    this.renderStatus(this.workflowGraph.status)
    this.renderSpace(1)
    this.renderWorkflowName()

    if (this.workflowGraph.measurement) {
      process.stdout.write(` ${this.workflowGraph.measurement.toString()}`)
    }

    process.stdout.write('\n')

    for (let i = 0; i < this.workflowGraph.routines.length; i++) {
      this.renderStageLine()
      process.stdout.write('\n')

      for (let j = 0; j < this.workflowGraph.routines[i].length; j++) {
        const routineGraphOrStrategyGraph = this.workflowGraph.routines[i][j]

        this.renderSubIndication(1)

        if (routineGraphOrStrategyGraph['strategy']) {
          const strategyGraph = routineGraphOrStrategyGraph as StrategyGraph

          this.renderStrategyTag()
          this.renderSpace(1)
          this.renderRoutineName(strategyGraph.name)
          process.stdout.write('\n')
          this.renderEmptySubIndication(2)
          process.stdout.write('\n')

          for (let k = 0; k < strategyGraph.strategy.length; k++) {
            const strategyRoutineGraph = strategyGraph.strategy[k]

            this.renderSubIndication(2)
            this.renderStatus(strategyRoutineGraph.status)
            this.renderSpace(1)
            this.renderRoutineName(strategyRoutineGraph.name)

            if (strategyRoutineGraph.measurement) {
              process.stdout.write(` ${strategyRoutineGraph.measurement.toString()}`)
            } else if (strategyRoutineGraph.startedAt) {
              const diff = Date.now() - strategyRoutineGraph.startedAt.getTime()
              const measurement = new Measurement(BigInt(diff) * 1000000n)

              process.stdout.write(` ${measurement.toString()}`)
            }

            process.stdout.write('\n')

            for (let w = 0; w < strategyRoutineGraph.steps.length; w++) {
              const stepGraph = strategyRoutineGraph.steps[w]

              this.renderSubIndication(3)
              this.renderStatus(stepGraph.status)
              this.renderSpace(1)
              this.renderStepId(stepGraph)

              if (stepGraph.measurement) {
                process.stdout.write(` ${stepGraph.measurement.toString()}`)
              } else if (stepGraph.startedAt) {
                const diff = Date.now() - stepGraph.startedAt.getTime()
                const measurement = new Measurement(BigInt(diff) * 1000000n)

                process.stdout.write(` ${measurement.toString()}`)
              }

              process.stdout.write('\n')

              if (stepGraph.status === Status.Running) {
                if (this.outputs[strategyRoutineGraph.name] && this.outputs[strategyRoutineGraph.name][w]) {
                  // const limitedOutput = this.limitString(this.outputs[strategyRoutineGraph.name][w], process.stdout.columns - 10)
                  const limitedOutput = this.limitString(
                    `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
                    process.stdout.columns - 10
                  )

                  limitedOutput.forEach((output) => {
                    this.renderEmptySubIndication(4)
                    process.stdout.write(output)
                    process.stdout.write('\n')
                  })
                  process.stdout.write('\n')
                }

                break
              }
            }

            process.stdout.write('\n')
          }
        } else {
          const routineGraph = routineGraphOrStrategyGraph as RoutineGraph

          this.renderStatus(routineGraph.status)
          this.renderSpace(1)
          this.renderRoutineName(routineGraph.name)
        }
      }
    }
  }

  private renderStatus(status: Status): void {
    switch (status) {
      case Status.Idle:
        process.stdout.write(chalk.bgRgb(160, 160, 0).bold.rgb(255, 255, 255)('    ~    '))
        break
      case Status.Running:
        process.stdout.write(chalk.bgRgb(170, 171, 0).bold.rgb(11, 10, 1)(' Running '))
        break
      case Status.Success:
        process.stdout.write(chalk.bgRgb(0, 60, 0).bold.rgb(200, 240, 200)(' Success '))
        break
    }
  }

  private renderWorkflowName(): void {
    process.stdout.write(chalk.bgRgb(10, 40, 60).bold.rgb(240, 240, 240)(` ${this.workflowGraph.name} `))
  }

  private renderRoutineName(name): void {
    process.stdout.write(chalk.bgRgb(200, 80, 0).bold.rgb(240, 240, 240)(` ${name} `))
  }

  private renderStageLine(): void {
    process.stdout.write(chalk.rgb(120, 120, 120)('-'.repeat(process.stdout.columns)))
  }

  private renderSubIndication(indentation: number): void {
    process.stdout.write('  '.repeat(indentation))
    process.stdout.write(chalk.rgb(120, 120, 120)('|-'))
  }

  private renderEmptySubIndication(indentation: number): void {
    process.stdout.write('  '.repeat(indentation))
    process.stdout.write(chalk.rgb(120, 120, 120)('|'))
  }

  private renderStrategyTag(): void {
    process.stdout.write(chalk.bold.rgb(0, 90, 200)(' STRATEGY '))
  }

  private renderSpace(amount: number): void {
    process.stdout.write(' '.repeat(amount))
  }

  private renderStepId(stepGraph: StepGraph): void {
    process.stdout.write(chalk.rgb(20, 40, 200)(stepGraph.name || stepGraph.command || stepGraph.usable))
  }

  private limitString(input: string, limit: number): string[] {
    // Split the input string into lines
    const lines = input.split('\n')
    const result: string[] = []

    lines.forEach((line) => {
      // If a line is within the limit, add it directly to the result
      if (line.length <= limit) {
        result.push(line)
      } else {
        // If a line exceeds the limit, break it into smaller chunks
        for (let start = 0; start < line.length; start += limit) {
          const chunk = line.substring(start, start + limit)
          result.push(chunk)
        }
      }
    })

    return result
  }
}
