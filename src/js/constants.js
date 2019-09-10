import { PORT_SELECTOR } from "./selectors";

export const HOST = "";

export const DIVA_SERVICES_API_URL = "http://divaservices.unifr.ch/api/v2/";

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

export const Inputs = {
  SELECT: { tag: "select", type: "select" },
  NUMBER: { tag: "input", type: "number" },
  FILE: { type: "file" },
  FOLDER: { type: "folder" }
};
Object.freeze(Inputs);

export const MIN_SCALE = 0.4;
export const MAX_SCALE = 1;

export const TOOLTIP_OPTIONS = { html: true };
export const TOOLTIP_BREAK_LINE = "<br>";
export const TOOLTIP_HTML = `<span><i class="fas fa-info-circle"></i></span>`;
export const BOX_TITLE_HTML_TAG = "h3";

export const TOOLTIP_COL = "col-1";
export const NAME_COL = "col-5";
export const PARAM_COL = "col-4";
export const RESET_COL = "col-2";

export const ICON_COL = "col-1";
export const TITLE_COL = "col-9";
export const TOOLTIP_BOX_COL = "col-2";

export const MimeTypes = {
  folder: {
    type: "folder",
    color: "lightblue"
  },
  image: {
    type: "image",
    color: "orange"
  },
  application: {
    type: "application",
    color: "yellow"
  },
  text: {
    type: "text",
    color: "blue"
  }
};
Object.freeze(MimeTypes);

export const THEMES = {};

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
    fill: "#eeeeee"
  },
  groups: {
    in: {
      position: { name: "left" },
      attrs: {
        [PORT_SELECTOR]: {
          magnet: "passive",
          r: 12,
          fill: "darkblue",
          stroke: "black"
        },
        text: {}
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
        [PORT_SELECTOR]: {
          magnet: "active",
          r: 12,
          fill: "lightblue",
          stroke: "black"
        }
      },
      z: 5,
      label: {
        position: {
          name: "right"
        }
      }
    }
  }
};

export const DEFAULT_OPTIONS = {
  showParameters: true,
  showPortDetails: true,
  showPorts: true,
  showTooltips: true
};
