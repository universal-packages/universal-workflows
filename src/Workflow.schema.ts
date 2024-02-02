import Ajv from 'ajv'
import { JSONSchema7 } from 'json-schema'

const ajv = new Ajv()

export const workflowSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    environment: {
      type: 'object',
      additionalProperties: {
        type: ['string', 'number', 'boolean']
      }
    },
    name: {
      type: 'string'
    },
    target: {
      type: 'string'
    },
    targets: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          engine: {
            type: 'string'
          },
          engineOptions: {
            type: 'object'
          }
        },
        required: ['engine']
      }
    },
    routines: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          strategy: {
            type: 'object',
            properties: {
              matrix: {
                type: 'object',
                additionalProperties: {
                  type: 'array',
                  items: {
                    type: ['string', 'number', 'boolean']
                  }
                }
              },
              onFailure: {
                type: 'string',
                enum: ['continue', 'fail']
              },
              include: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: {
                    type: ['string', 'number', 'boolean']
                  }
                }
              }
            }
          },
          dependsOn: {
            oneOf: [
              {
                type: 'string'
              },
              {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            ]
          },
          environment: {
            type: 'object',
            additionalProperties: {
              type: ['string', 'number', 'boolean']
            }
          },
          onFailure: {
            type: 'string',
            enum: ['continue', 'fail']
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                environment: {
                  type: 'object',
                  additionalProperties: {
                    type: ['string', 'number', 'boolean']
                  }
                },
                if: {
                  type: 'string'
                },
                input: {
                  oneOf: [
                    {
                      type: 'string'
                    },
                    {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  ]
                },
                name: {
                  type: 'string'
                },
                onFailure: {
                  type: 'string',
                  enum: ['continue', 'fail']
                },
                run: {
                  type: 'string'
                },
                unless: {
                  type: 'string'
                },
                use: {
                  type: 'string'
                },
                target: {
                  type: 'string'
                },
                with: {
                  type: 'object'
                },
                workingDirectory: {
                  type: 'string'
                }
              },
              oneOf: [
                {
                  required: ['run']
                },
                {
                  required: ['use']
                }
              ]
            }
          },
          target: {
            type: 'string'
          },
          workingDirectory: {
            type: 'string'
          }
        },
        required: ['steps']
      }
    },
    workingDirectory: {
      type: 'string'
    }
  },
  required: ['routines']
}
