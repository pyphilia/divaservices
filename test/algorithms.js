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

const graphTransformation = {
  description: "Transforms a gxl graph",
  label: "Graph transformation",
  params: [
    {
      type: "select",
      name: "keepEdges",
      description: "Keep existing edges",
      options: {
        required: true,
        values: ["true", "false"],
        default: 0
      },
      userdefined: true
    },
    {
      type: "select",
      name: "method",
      description: "Transformation method to apply",
      options: {
        required: true,
        values: ["kspan", "knearest"],
        default: 1
      },
      userdefined: true
    },
    {
      type: "number",
      name: "numberK",
      description: "Amount of edges to add per node",
      options: {
        required: true,
        default: 2,
        min: 1,
        max: 10,
        steps: 1
      },
      userdefined: true
    },
    {
      type: "select",
      name: "mergeMode",
      description: "kspan only: how to merge node distances",
      options: {
        required: true,
        values: ["minimum", "average"],
        default: 0
      },
      userdefined: true
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
            typeAllowed: ["application/xml", "application/zip"],
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
            typeAllowed: ["application/xml", "application/zip"],
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
  information: {
    name: "Graph transformation",
    description: "Transforms a gxl graph",
    developer: "Marco von Raumer",
    affiliation: "University of Fribourg",
    email: "marco.vonraumer@unifr.ch",
    author: "Marco von Raumer",
    type: "graph",
    expectedRuntime: 2.4242424242424243,
    executions: 33
  },
  category: "graph"
};

const musicDetector = {
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
            typeAllowed: ["image/jpeg", "image/png"],
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
            typeAllowed: ["image/jpeg"],
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
            typeAllowed: ["text/plain"],
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
  information: {
    name: "Music Object Detector",
    description: "Music Object Detector with TensorFlow",
    developer: "Alexander Pacha (1)",
    affiliation: "(1) TU Wien, (2) Univ Rennes",
    email: "alexander.pacha@tuwien.ac.at",
    author:
      "Alexander Pacha(1), Horst Eidenberger (1), Kwon-Young Choi (2), Bertrand Couasnon (2), Yann Ricquebourg (2)",
    website: "https://github.com/apacha/MusicObjectDetector-TF",
    type: "objectdetection",
    license: "Apache2.0",
    ownsCopyright: "1",
    expectedRuntime: 116.75,
    executions: 68
  },
  category: "objectdetection"
};

const wavelengthSeam = {
  description:
    "Seam carving method specialized for documents with regular layout.",
  label: "Wavelength Seam Carving",
  params: [
    {
      type: "number",
      name: "slices",
      description: "Number of slices (reccomended: 3-5)",
      options: {
        required: true,
        default: 3,
        min: 1,
        max: 8,
        steps: 1
      },
      userdefined: true
    },
    {
      type: "number",
      name: "smoothing",
      description: "smoothing factor",
      options: {
        required: true,
        default: 0.00007,
        min: 0,
        max: 1,
        steps: 0.00001
      },
      userdefined: true
    },
    {
      type: "number",
      name: "sigma",
      description: "sigma of blur to be applied",
      options: {
        required: true,
        default: 0.12,
        min: 0,
        max: 1,
        steps: 0.01
      },
      userdefined: true
    },
    {
      type: "number",
      name: "slope",
      description: "slope parameter",
      options: {
        required: true,
        default: 1,
        min: 1,
        max: 120,
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
            typeAllowed: ["image/jpeg", "image/png", "image/tiff"],
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
            typeAllowed: ["application/json"],
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
            typeAllowed: ["text/csv"],
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
  information: {
    name: "Wavelength Seam Carving",
    description:
      "Seam carving method specialized for documents with regular layout.",
    developer: "Mathias Seuret (1), Daniel Stoekl (2)",
    affiliation:
      "(1) University of Fribourg, (2) Ecole Pratique des Hautes Etudes",
    email: "mathias.seuret@unifr.ch",
    author: "Daniel Stoekl",
    type: "segmentation",
    license: "Other",
    ownsCopyright: "1",
    expectedRuntime: 438.9896907216495,
    executions: 97
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
