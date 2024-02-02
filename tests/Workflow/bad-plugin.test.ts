import { Workflow } from '../../src'

const scenarios = [
  { name: 'bad-name', errors: ['/name must be string'] },
  { name: 'bad-environment', errors: ['/environment/FOO must be string,number,boolean'] },
  { name: 'bad-targets', errors: ['/targets must be object'] },
  { name: 'bad-targets-2', errors: ['/targets/spawn2 must be object'] },
  { name: 'bad-targets-3', errors: ["/targets/spawn2 must have required property 'engine'"] },
  { name: 'bad-target', errors: ['/target must be string'] },
  { name: 'bad-working-directory', errors: ['/workingDirectory must be string'] },
  { name: 'bad-routines', errors: ['/routines must be object'] },
  { name: 'bad-routine', errors: ["/routines/echo1 must have required property 'steps'"] },
  {
    name: 'bad-strategy',
    errors: [
      "/routines/echo1/strategy must have required property 'matrix'",
      "/routines/echo1/strategy must have required property 'include'",
      '/routines/echo1/strategy must match exactly one schema in oneOf',
      "/routines/echo1/strategy must have required property 'matrix'",
      '/routines/echo1/strategy must match exactly one schema in oneOf'
    ]
  },
  { name: 'bad-strategy-2', errors: ['/routines/echo1/strategy/matrix must be object'] },
  { name: 'bad-strategy-3', errors: ['/routines/echo1/strategy/include must be array'] },
  { name: 'bad-strategy-4', errors: ['/routines/echo1/strategy/matrix/fruit/0 must be string,number,boolean'] },
  { name: 'bad-strategy-5', errors: ['/routines/echo1/strategy/include/0/fruit must be string,number,boolean'] },
  { name: 'bad-strategy-6', errors: ['/routines/echo1/strategy/onFailure must be equal to one of the allowed values ["continue","fail"]'] },
  { name: 'bad-routine-environment', errors: ['/routines/echo1/environment/FOO must be string,number,boolean'] },
  { name: 'bad-routine-if', errors: ['/routines/echo1/if must be string'] },
  { name: 'bad-routine-unless', errors: ['/routines/echo1/unless must be string'] },
  { name: 'bad-routine-target', errors: ['/routines/echo1/target must be string'] },
  { name: 'bad-routine-targets', errors: ['/routines/echo1/targets must be object'] },
  { name: 'bad-routine-targets-2', errors: ['/routines/echo1/targets/spawn2 must be object'] },
  { name: 'bad-routine-targets-3', errors: ["/routines/echo1/targets/spawn2 must have required property 'engine'"] },
  { name: 'bad-routine-working-directory', errors: ['/routines/echo1/workingDirectory must be string'] },
  { name: 'bad-routine-steps', errors: ['/routines/echo1/steps must be array'] },
  {
    name: 'bad-routine-depends-on',
    errors: ['/routines/echo1/dependsOn must be string', '/routines/echo1/dependsOn must be array', '/routines/echo1/dependsOn must match exactly one schema in oneOf']
  },
  {
    name: 'bad-routine-depends-on-2',
    errors: ['/routines/echo1/dependsOn must be string', '/routines/echo1/dependsOn/0 must be string', '/routines/echo1/dependsOn must match exactly one schema in oneOf']
  },
  { name: 'bad-routine-on-failure', errors: ['/routines/echo1/onFailure must be equal to one of the allowed values ["continue","fail"]'] },
  {
    name: 'bad-step',
    errors: [
      "/routines/echo1/steps/0 must have required property 'run'",
      "/routines/echo1/steps/0 must have required property 'use'",
      '/routines/echo1/steps/0 must match exactly one schema in oneOf'
    ]
  },
  { name: 'bad-step-run', errors: ['/routines/echo1/steps/0/run must be string'] },
  { name: 'bad-step-use', errors: ['/routines/echo1/steps/0/use must be string'] },
  { name: 'bad-step-name', errors: ['/routines/echo1/steps/0/name must be string'] },
  { name: 'bad-step-environment', errors: ['/routines/echo1/steps/0/environment/FOO must be string,number,boolean'] },
  { name: 'bad-step-if', errors: ['/routines/echo1/steps/0/if must be string'] },
  { name: 'bad-step-unless', errors: ['/routines/echo1/steps/0/if must be string'] },
  {
    name: 'bad-step-input',
    errors: ['/routines/echo1/steps/0/input must be string', '/routines/echo1/steps/0/input must be array', '/routines/echo1/steps/0/input must match exactly one schema in oneOf']
  },
  {
    name: 'bad-step-input-2',
    errors: [
      '/routines/echo1/steps/0/input must be string',
      '/routines/echo1/steps/0/input/0 must be string',
      '/routines/echo1/steps/0/input must match exactly one schema in oneOf'
    ]
  },
  { name: 'bad-step-on-failure', errors: ['/routines/echo1/steps/0/onFailure must be equal to one of the allowed values ["continue","fail"]'] },
  { name: 'bad-step-target', errors: ['/routines/echo1/steps/0/target must be string'] },
  { name: 'bad-step-with', errors: ['/routines/echo1/steps/0/with/var must be string,number,boolean'] },
  { name: 'bad-step-working-directory', errors: ['/routines/echo1/steps/0/workingDirectory must be string'] }
]

describe(Workflow, (): void => {
  for (const scenario of scenarios) {
    describe(`when the plugin workflow file has ${scenario.name}`, (): void => {
      it(`throws an error indicating the problem`, async (): Promise<void> => {
        let error: Error

        try {
          Workflow.buildFrom(scenario.name, { stepUsableLocation: './tests/__fixtures__/cases', workflowsLocation: './tests/__fixtures__' })
        } catch (err) {
          error = err
        }

        expect(error.message).toBe(`Workflow "${scenario.name}" is invalid:\n\n${scenario.errors.join('\n')}`)
      })
    })
  }
})
