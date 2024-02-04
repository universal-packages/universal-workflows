# Workflows

[![npm version](https://badge.fury.io/js/@universal-packages%2Fworkflows.svg)](https://www.npmjs.com/package/@universal-packages/workflows)
[![Testing](https://github.com/universal-packages/universal-workflows/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-workflows/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-workflows/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-workflows)

Automate, customize, and execute your software development workflows right from your local machine.

## Install

```shell
npm install @universal-packages/workflows
```

## Workflow

The `Workflow` class is the main class of this library. For the sake of simplicity, you will likely never need to instantiate one in a manual way. Instead, you will use the factory static method `Workflow.buildFrom` that uses [universal-plugin-config-loader
](https://github.com/universal-packages/universal-plugin-config-loader) to load workflow descriptors inside the `universal-workflows` directory.

### Static methods

#### **`buildFrom(name: string, [options?: Object])`**

Creates a new `Workflow` instance from a workflow descriptor loaded form the `universal-workflows` directory.

```js
import { Workflow } from '@universal-packages/workflows'

const workflow = Workflow.buildFrom('test-and-deploy')

await workflow.run()
```

##### Options

- **`stepUsableLocation`** `string` `default: ./src`
  Where all the step usable should be loaded from.

- **`workflowsLocation`** `string` `default: ./`
  Where all the workflows should be loaded from and in which a `universal-workflows` directory or file should be found. Take a look at [universal-plugin-config-loader
  ](https://github.com/universal-packages/universal-plugin-config-loader) to learn how we load workflow files. Workflows can even be loaded from a the package.json file.

### Workflows descriptors

The workflow descriptor is a YAML file that describes the routines and steps that should be executed. The file should be located in the `universal-workflows` directory.

```yaml
name: test-and-deploy

routines:
  test:
    steps:
      - run: npm run test:full

  deploy:
    steps:
      - run: npm run build
      - run: npm run deploy
```

#### Schema

- **`name`** `string`
  The name of the workflow.

- **`environment`** `Object`
  The environment variables that should be passed to all the routines and steps.

- **`target`** `string`
  The target that should be used by all the routines and steps.

- **`targets`** `Object`
  Targets to be prepared to use in the routines and steps, A Target basically describes an engine to be passed to the sub process run system see [universal-sub-process](https://github.com/universal-packages/universal-sub-process) to learn more about engines. Engines should be installed in the project for the workflow to find them and configure them.

  - **`engine`** `string` `Required`
    The name of the engine to be configured
  - **`engineOptions`** `Object`
    The options to be passed to the engine.

- **`workingDirectory`** `string`
  The working directory to be used by all the routines and steps.

- **`routines`** `Object`
  The routines that should be executed independent and in parallel unless specified otherwise.

  - **`<routineName>`** `Object`
    Every key in the routines object is the routine name.

    - **`strategy`** `Object`
      A strategy to be used to run multiple routine configurations based in the same routine, a matrix or an include should be specified. This works similar to what [Github Actions](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs#about-matrix-strategies) does with matrix strategies.

      - **`matrix`** `Object` `~Required`
        Define one or more variables followed by an array of values. For example, the following matrix has a variable called version with the value [10, 12, 14] and a variable called os with the value [ubuntu-latest, windows-latest]:

        ```yaml
        routines:
          example_matrix:
            strategy:
              matrix:
                version: [10, 12, 14]
                os: [ubuntu-latest, windows-latest]
        ```

        An strategy will run for each possible combination of the variables. In this example, the workflow will run six jobs, one for each combination of the os and version variables.

      - **`onFailure`** `'continue' | 'fail'` `default: 'fail'`
        The action to be taken when one of the strategy routines fails. For `fail` the workflow will stop the rest of the routines, for `continue` the workflow will continue running the rest.

      - **`include`** `Object` `~Required`
        Expand existing matrix configurations or to add new configurations. The value of include is a list of objects.

        For example, this matrix:

        ```yaml
        strategy:
          matrix:
            fruit: [apple, pear]
            animal: [cat, dog]
            include:
              - color: green
              - color: pink
                animal: cat
              - fruit: apple
                shape: circle
              - fruit: banana
              - fruit: banana
                animal: cat
        ```

        will result in six routines with the following matrix combinations:

        - `{fruit: apple, animal: cat, color: pink, shape: circle}`
        - `{fruit: apple, animal: dog, color: green, shape: circle}`
        - `{fruit: pear, animal: cat, color: pink}`
        - `{fruit: pear, animal: dog, color: green}`
        - `{fruit: banana}`
        - `{fruit: banana, animal: cat}`

        You can access the strategy values in the steps interpolating strategy values within the step.

        ```yaml
        steps:
          - run: echo "The fruit is $<< strategy.fruit >>"
        ```

    - **`if`** `string`
      If this evaluates to `true` the routine will be executed if not it will be skipped.

      ```yaml
      routines:
        example_if:
          if: $<< outputs.test-strategy.exists == 'true' >>
      ```

    - **`dependsOn`** `string | string[]`
      The routine will only run after and if the specified routine(s) completed successfully or was skipped.

      ```yaml
      routines:
        example:
          steps:
            - run: echo "Hello, world!"
        example_depends_on:
          dependsOn: example
      ```

    - **`environment`** `Object`
      The environment variables that should be passed to the steps of the routine.

    - **`onFailure`** `'continue' | 'fail'` `default: 'fail'`
      The action to be taken when the routine fails. For `fail` the workflow will not run the dependent routines, for `continue` the workflow will continue running the dependent routines.

    - **`target`** `string`
      The target that should be used by all the steps of the routine.

    - **`unless`** `string`
      If this evaluates to `false` the routine will be executed if not it will be skipped.

      ```yaml
      routines:
        example_unless:
          unless: $<< outputs.test-strategy.too_many == 'true' >>
      ```

    - **`workingDirectory`** `string`
      The working directory to be used by all the steps of the routine.

    - **`steps`** `Array`
      The steps that should be executed.

      - **`environment`** `Object`
        The environment variables that should be used by the step over the routine and workflow environment.

      - **`if`** `string`
        If this evaluates to `true` the step will be executed if not it will be skipped.

      - **`input`** `string | string[]`
        Input to pass to the process. For example when a process requires any kind of input like a yes/no question.

      - **`name`** `string`
        The step name, named steps can be used to access their outputs in other routines steps though the `outputs` scope.

      - **`onFailure`** `'continue' | 'fail'` `default: 'fail'`
        The action to be taken when the step fails. For `fail` the routine will fail right away, for `continue` the routine will continue running the rest of the steps.

      - **`run`** `string`
        The command to be run by the step.

      - **`unless`** `string`
        If this evaluates to `false` the step will be executed if not it will be skipped.

      - **`use`** `string`
        The name of the usable to be used by the step.

      - **`target`** `string`
        The target that should be used by the step.


`Workflow` will emit events regarding execution status and output.

```js
workflow.on('*', (event) => console.log(event))
workflow.on('running', (event) => console.log(event))
workflow.on('success', (event) => console.log(event))
workflow.on('failure', (event) => console.log(event))
workflow.on('stopping', (event) => console.log(event))
workflow.on('stopped', (event) => console.log(event))
workflow.on('error', (event) => console.log(event))
workflow.on('end', (event) => console.log(event))

workflow.on('routine:running', (event) => console.log(event))
workflow.on('routine:skipped', (event) => console.log(event))
workflow.on('routine:success', (event) => console.log(event))
workflow.on('routine:failure', (event) => console.log(event))
workflow.on('routine:stopping', (event) => console.log(event))
workflow.on('routine:stopped', (event) => console.log(event))
workflow.on('routine:error', (event) => console.log(event))

workflow.on('step:running', (event) => console.log(event))
workflow.on('step:skipped', (event) => console.log(event))
workflow.on('step:success', (event) => console.log(event))
workflow.on('step:failure', (event) => console.log(event))
workflow.on('step:stopping', (event) => console.log(event))
workflow.on('step:stopped', (event) => console.log(event))
workflow.on('step:error', (event) => console.log(event))
workflow.on('step:output', (event) => console.log(event))
```

### BaseUsable

Normally you will run commands in a step by specifying the `run` property, but some times you may want to encapsulate a more complex logic in a reusable way and then specify the `usable` property to run it.

```js
import { BaseUsable } from '@universal-packages/workflows'

export default class PrepareDirectories extends BaseUsable {
  static name = 'prepare-directories'

  async use() {
    const files = await this.runSubProcess('ls')

    if (files.includes('dist')) {
      await this.runSubProcess('rm -rf dist')
    }

    await this.runSubProcess('mkdir dist')

    this.pushOutput('Directories are ready')
  }
}
```

Then in you workflow descriptor you can specify the `usable` property.

```yaml
name: test-and-deploy

steps:
  - use: prepare-directories
```

### Static properties

#### **`name`** `string`

The name of the usable that will be used in the workflow descriptor.

### Instance methods

#### **`use()`** `async`

This is the what the step will do when it is executed.

#### **`runSubProcess(command: string, [options?: Object])`** `async`

Runs a command in a sub process and return the stdout as a string.

##### Options

- **`environment`** `Object` `default: <Step environment>`
  Environment variables to pass to the process.

- **`input`** `string | string[]`
  Input to pass to the process. For example when a process requires any kind of input like a yes/no question.

- **`workingDirectory`** `string` `default: <Step workingDirectory>`
  The working directory to run the command in.

#### **`pushOutput(output: string)`**

Pushes an output to the step output.

#### **`fail([error: Error])`**

Fails the step with an optional error.

#### **`internalStop()`** `async`

If the step has received a stop signal, it will try to stop the step by calling this method. You should try to stop the step as soon as possible.

### Instance properties

#### **`environment`** `Object`

The environment variables passed by the workflow system to the step.

#### **`scope`** `Object`

The scope object that contain useful information about the workflow, like `outputs` from other named steps or the `strategy` values.

#### **`with`** `Object`

The variables described in the `with` part of the step in the workflow descriptor.

#### **`workingDirectory`** `string`

The working directory where the step should run.

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
