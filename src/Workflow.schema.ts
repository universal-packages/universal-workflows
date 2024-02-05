import { JSONSchema7 } from 'json-schema'

export const workflowSchema: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  additionalProperties: false,
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
        additionalProperties: false,
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
    workingDirectory: {
      type: 'string'
    },
    routines: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        additionalProperties: false,
        properties: {
          strategy: {
            type: 'object',
            additionalProperties: false,
            properties: {
              matrix: {
                oneOf: [
                  {
                    type: 'string'
                  },
                  {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: {
                        type: ['string', 'number', 'boolean']
                      }
                    }
                  }
                ]
              },
              onFailure: {
                type: 'string',
                enum: ['continue', 'fail']
              },
              include: {
                oneOf: [
                  {
                    type: 'string'
                  },
                  {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: {
                        type: ['string', 'number', 'boolean']
                      }
                    }
                  }
                ]
              }
            },
            oneOf: [
              {
                oneOf: [
                  {
                    required: ['matrix']
                  },
                  {
                    required: ['include']
                  }
                ]
              },
              {
                required: ['matrix', 'include']
              }
            ]
          },
          if: {
            type: 'string'
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
          target: {
            type: 'string'
          },
          unless: {
            type: 'string'
          },
          workingDirectory: {
            type: 'string'
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
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
                  type: 'object',
                  additionalProperties: {
                    type: ['string', 'number', 'boolean']
                  }
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
          }
        },
        required: ['steps']
      }
    }
  },
  required: ['routines']
}
