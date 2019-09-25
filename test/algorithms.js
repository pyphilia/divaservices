const ocropusBinarization = {
  name: "",
  description:
    "Wrapper to the binarization module from OCRopus (developped by Thomas Breuel)",
  label: "Ocropus Binarization",
  params: [
    {
      description: "Enable Skew correction",
      name: "enableSkew",
      type: "select",
      values: ["true", "false"],
      defaultValue: "1"
    },
    {
      description: "skew angle estimation parameter (degree)",
      name: "maxskew",
      type: "number",
      values: {
        min: "1",
        max: "15",
        step: "1"
      },
      defaultValue: "2"
    },
    {
      description: "steps for skew angle estimation (per degree)",
      name: "skewsteps",
      type: "number",
      values: {
        min: "2",
        max: "10",
        step: "1"
      },
      defaultValue: "8"
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
          circle: {
            display: "block"
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
          circle: {
            display: "block"
          },
          text: {
            text: "ocropusBinaryImage\nimage/jpeg,image/png,image/tiff",
            display: "block"
          }
        }
      }
    ]
  },
  category: "binarization"
};

const graphTransformation = {
  name: "",
  description: "Transforms a gxl graph",
  label: "Graph transformation",
  params: [
    {
      description: "Keep existing edges",
      name: "keepEdges",
      type: "select",
      values: ["true", "false"],
      defaultValue: "0"
    },
    {
      description: "Transformation method to apply",
      name: "method",
      type: "select",
      values: ["kspan", "knearest"],
      defaultValue: "1"
    },
    {
      description: "Amount of edges to add per node",
      name: "numberK",
      type: "number",
      values: {
        min: "1",
        max: "10",
        step: "1"
      },
      defaultValue: "2"
    },
    {
      description: "kspan only: how to merge node distances",
      name: "mergeMode",
      type: "select",
      values: ["minimum", "average"],
      defaultValue: "0"
    }
  ],
  ports: {
    items: [
      {
        group: "in",
        name: "inputGraph",
        attrs: {
          portBody: {
            fill: "yellow",
            type: "application",
            typeAllowed: ["application/xml", "application/zip"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "inputGraph\napplication/xml,application/zip",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "transformed",
        attrs: {
          portBody: {
            fill: "yellow",
            type: "application",
            typeAllowed: ["application/xml", "application/zip"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "transformed\napplication/xml,application/zip",
            display: "block"
          }
        }
      }
    ]
  },
  category: "graph"
};

const musicDetector = {
  name: "",
  description: "Music Object Detector with TensorFlow",
  label: "Music Object Detector",
  params: [],
  ports: {
    items: [
      {
        group: "in",
        name: "inputImage",
        attrs: {
          portBody: {
            fill: "orange",
            type: "image",
            typeAllowed: ["image/jpeg", "image/png"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "inputImage\nimage/jpeg,image/png",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "annotationImage",
        attrs: {
          portBody: {
            fill: "orange",
            type: "image",
            typeAllowed: ["image/jpeg"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "annotationImage\nimage/jpeg",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "annotations",
        attrs: {
          portBody: {
            fill: "blue",
            type: "text",
            typeAllowed: ["text/plain"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "annotations\ntext/plain",
            display: "block"
          }
        }
      }
    ]
  },
  category: "objectdetection"
};

const wavelengthSeam = {
  name: "",
  description:
    "Seam carving method specialized for documents with regular layout.",
  label: "Wavelength Seam Carving",
  params: [
    {
      description: "Number of slices (reccomended: 3-5)",
      name: "slices",
      type: "number",
      values: {
        min: "1",
        max: "8",
        step: "1"
      },
      defaultValue: "3"
    },
    {
      description: "smoothing factor",
      name: "smoothing",
      type: "number",
      values: {
        min: "0",
        max: "1",
        step: "1e-05"
      },
      defaultValue: "7e-05"
    },
    {
      description: "sigma of blur to be applied",
      name: "sigma",
      type: "number",
      values: {
        min: "0",
        max: "1",
        step: "0.01"
      },
      defaultValue: "0.12"
    },
    {
      description: "slope parameter",
      name: "slope",
      type: "number",
      values: {
        min: "1",
        max: "120",
        step: "1"
      },
      defaultValue: "1"
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
          circle: {
            display: "block"
          },
          text: {
            text: "inputImage\nimage/jpeg,image/png,image/tiff",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "textlines",
        attrs: {
          portBody: {
            fill: "yellow",
            type: "application",
            typeAllowed: ["application/json"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "textlines\napplication/json",
            display: "block"
          }
        }
      },
      {
        group: "out",
        name: "textlines_csv",
        attrs: {
          portBody: {
            fill: "blue",
            type: "text",
            typeAllowed: ["text/csv"]
          },
          circle: {
            display: "block"
          },
          text: {
            text: "textlines_csv\ntext/csv",
            display: "block"
          }
        }
      }
    ]
  },
  category: "segmentation"
};

const correctAlgorithms = [
  ocropusBinarization,
  graphTransformation,
  musicDetector,
  wavelengthSeam
];
export { correctAlgorithms, ocropusBinarization };
