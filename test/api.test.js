import fetch from "node-fetch";
import Ajv from "ajv";
const ajv = new Ajv();

import { DIVA_SERVICES_API_URL } from "../src/js/constants";

const webservicesObjectSchema = {
  type: "array",
  items: {
    properties: {
      name: { type: "string" },
      url: { type: "string" },
      description: { type: "string" },
      type: { type: "string" }
    },
    required: ["description", "name", "url", "type"]
  }
};

const webserviceDescriptionSchema = {
  type: "object",
  properties: {
    general: {
      properties: {
        affiliation: { type: "string" },
        author: { type: "string" },
        description: { type: "string" },
        developer: { type: "string" },
        email: { type: "string" },
        executions: { type: "number" },
        expectedRuntime: { type: "number" },
        license: { type: "string" },
        name: { type: "string" },
        ownsCopyright: { type: "string" },
        type: { type: "string" }
      },
      required: [
        "affiliation",
        "author",
        "description",
        "developer",
        "email",
        "executions",
        "expectedRuntime",
        "name",
        "type"
      ]
    },
    input: {
      type: "array",
      items: {
        oneOf: [
          {
            properties: {
              outputFolder: {
                properties: {
                  userdefined: { type: "boolean" }
                },
                required: ["userdefined"]
              }
            },
            required: ["outputFolder"]
          },
          {
            properties: {
              folder: {
                properties: {
                  description: { type: "string" },
                  name: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      required: { type: "boolean" }
                    },
                    required: ["required"]
                  },
                  userdefined: { type: "boolean" }
                },
                required: ["description", "name", "options", "userdefined"]
              }
            },
            required: ["folder"]
          },
          {
            properties: {
              file: {
                properties: {
                  description: { type: "string" },
                  name: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      required: { type: "boolean" },
                      mimeTypes: {
                        properties: {
                          allowed: { type: "array", items: { type: "string" } },
                          default: { type: "string" }
                        },
                        required: ["allowed", "default"]
                      }
                    },
                    required: ["required", "mimeTypes"]
                  },
                  userdefined: { type: "boolean" }
                },
                required: ["description", "name", "options", "userdefined"]
              }
            },
            required: ["file"]
          },
          {
            properties: {
              number: {
                properties: {
                  description: { type: "string" },
                  name: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      required: { type: "boolean" },
                      default: { type: "number" },
                      min: { type: "number" },
                      max: { type: "number" },
                      steps: { type: "number" }
                    },
                    required: ["required"]
                  },
                  userdefined: { type: "boolean" }
                },
                required: ["description", "name", "options", "userdefined"]
              }
            },
            required: ["number"]
          },
          {
            properties: {
              select: {
                properties: {
                  description: { type: "string" },
                  name: { type: "string" },
                  options: {
                    type: "object",
                    properties: {
                      required: { type: "boolean" },
                      default: { type: "number" },
                      values: { type: "array", items: { type: "string" } }
                    },
                    required: ["required", "values"]
                  },
                  userdefined: { type: "boolean" }
                },
                required: ["description", "name", "options", "userdefined"]
              }
            },
            required: ["select"]
          },
          {
            properties: {
              highlighter: {
                properties: {
                  type: { type: "string" },
                  userdefined: { type: "boolean" }
                },
                required: ["type", "userdefined"]
              }
            },
            required: ["highlighter"]
          }
        ]
      }
    },
    output: {
      type: "array",
      items: {
        oneOf: [
          {
            properties: {
              file: {
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  options: {
                    properties: {
                      visualization: { type: "boolean" },
                      mimeTypes: {
                        properties: {
                          allowed: { type: "array", items: { type: "string" } },
                          default: { type: "string" }
                        },
                        required: ["allowed", "default"]
                      }
                    },
                    required: ["mimeTypes"]
                  }
                },
                required: ["name", "description", "options"]
              }
            },
            required: ["file"]
          },
          {
            properties: {
              folder: {
                properties: {
                  name: { type: "string" }
                },
                required: ["name"]
              }
            },
            required: ["folder"]
          }
        ]
      }
    }
  },
  required: ["general", "input", "output"]
};

let webservices;

describe("test api whether conform", () => {
  beforeAll(async () => {
    const data = await fetch(DIVA_SERVICES_API_URL);
    webservices = await data.json();
  });

  test("webservices general array schema is conform", async () => {
    const validate = ajv.compile(webservicesObjectSchema);
    const valid = validate(webservices);
    expect(valid).toBeTruthy();
  });

  test("each webservice description schema is conform", async () => {
    const promises = Promise.all(
      webservices.map(async (webservice, i) => {
        const data = await fetch(webservice.url);
        const json = await data.json();
        return ajv.validate(webserviceDescriptionSchema, json);
      })
    );

    expect(promises).resolves.toEqual(expect.not.arrayContaining([false]));
  });
});
