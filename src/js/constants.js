export const categoryName = {
  binarization: "binarization",
  kws: "kws",
  imageprocessing: "image processing",
  evaluation: "evaluation",
  segmentation: "segmentation",
  enhancement: "enhancement",
  graph: "graph",
  ocr: "ocr",
  objectdetection: "object detection",
  activelearning: "active learning"
};

export const getWebServices = async () => {
  const data = await fetch("http://divaservices.unifr.ch/api/v2/");
  const json = await data.json();
  return json;
};

export const TOOLTIP_HTML = `<span>(i)</span>`;

export const THEME = {
  magnetAvailabilityHighlighter: {
    name: "stroke",
    options: {
      padding: 6,
      attrs: {
        "stroke-width": 3,
        stroke: "red"
      }
    }
  },
  body: {
    fill: "lightgray"
  },
  rect: {
    fill: "#2ECC71"
  },
  groups: {
    in: {
      position: { name: "left" },
      attrs: {
        portBody: {
          magnet: "passive",
          r: 12,
          fill: "darkblue",
          stroke: "black"
        }
      },
      z: 5,
      label: {
        position: {
          name: "left"
        }
      }
    },
    out: {
      position: { name: "right" },
      attrs: {
        portBody: {
          magnet: "active",
          r: 12,
          fill: "lightblue",
          stroke: "black"
        }
      },
      z: 5,
      label: {
        position: {
          name: "right",
          fill: "#123456",
          textAnchor: "middle"
        }
      }
    }
  }
};
