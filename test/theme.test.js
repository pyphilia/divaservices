import * as joint from "jointjs";
import * as theme from "../src/js/theme";

let graph;

const position = {
  x: 0,
  y: 0
};

const ocropusBinarization = {
  description:
    "Wrapper to the binarization module from OCRopus (developped by Thomas Breuel)",
  label: "Ocropus Binarization",
  params: [
    {
      type: "select",
      name: "enableSkew",
      description: "Enable Skew correction",
      options: {
        required: false,
        values: ["true", "false"],
        default: 1
      },
      userdefined: true
    },
    {
      type: "number",
      name: "maxskew",
      description: "skew angle estimation parameter (degree)",
      options: {
        required: false,
        default: 2,
        min: 1,
        max: 15,
        steps: 1
      },
      userdefined: true
    },
    {
      type: "number",
      name: "skewsteps",
      description: "steps for skew angle estimation (per degree)",
      options: {
        required: false,
        default: 8,
        min: 2,
        max: 10,
        steps: 1
      },
      userdefined: true
    }
  ],
  ports: {
    items: [
      {
        group: "in",
        name: "inputImage",
        attrs: {
          portBody: {
            fill: "orange",
            type: "image",
            typeAllowed: ["image/jpeg", "image/png", "image/tiff"]
          },
          text: {
            text: "inputImage\nimage/jpeg,image/png,image/tiff",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "ocropusBinaryImage",
        attrs: {
          portBody: {
            fill: "orange",
            type: "image",
            typeAllowed: ["image/jpeg", "image/png", "image/tiff"]
          },
          text: {
            text: "ocropusBinaryImage\nimage/jpeg,image/png,image/tiff",
            display: "block"
          }
        }
      }
    ]
  },
  information: {
    name: "Ocropus Binarization",
    description:
      "Wrapper to the binarization module from OCRopus (developped by Thomas Breuel)",
    developer: "Marcel Würsch",
    affiliation: "University of Fribourg",
    email: "marcel.wuersch@unifr.ch",
    author: "Marcel Würsch",
    website: "https://github.com/tmbdev/ocropy",
    DOI: "10.1117/12.783598",
    type: "binarization",
    license: "Other",
    ownsCopyright: "1",
    expectedRuntime: 6.793939393939394,
    executions: 165
  },
  category: "binarization"
};

describe("test theme", () => {
  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML = '<div id="root"></div>';

    graph = new joint.dia.Graph();
  });

  test.each([{}])("no box is created on incorrect element", e => {
    expect(theme.addElement(e, position, graph)).toBeFalsy();
  });

  test.each([ocropusBinarization])(
    "one box is created with correct elements",
    e => {
      expect(theme.addElement(e, position, graph)).toBeTruthy();
    }
  );
});
