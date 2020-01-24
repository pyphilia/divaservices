import {
  PORT_SELECTOR,
  OUT_PORT_CLASS,
  IN_PORT_CLASS,
  TOOLTIP_CLASS
} from "./selectors";

export const BOX_HIGHLIGHTERS = [
  {
    highlighter: {
      name: "addClass",
      options: {
        className: "highlighted"
      }
    }
  }
];

export const CATEGORY_SERVICE = "CATEGORY_SERVICE";
export const CATEGORY_DATATEST = "CATEGORY_DATATEST";
export const DATATEST_TYPE = "data";

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
  activelearning: "active learning",
  [DATATEST_TYPE]: "data test",
  wordextraction: "word extraction",
  htk: "htk",
  filepicker: "filepicker",
  other: "other"
};
Object.freeze(categoryName);

export const ZOOM_STEP = 75;

export const BOX_MARGIN = 100;

export const MINIMAP_WIDTH = 150;
export const MINIMAP_HEIGHT = 150;

export const DEFAULT_SCALE = 1;
export const MIN_SCALE = 0.4;
export const MAX_SCALE = 1;

export const TOOLTIP_OPTIONS = { html: true, scrollParent: "viewport" };
export const TOOLTIP_BREAK_LINE = "<br>";
export const TOOLTIP_HTML = `<span class="${TOOLTIP_CLASS}" data-toggle="tooltip" data-placement="right"><i class="fas fa-info-circle"></i></span>`;
export const BOX_TITLE_HTML_TAG = "h3";

export const TOOLTIP_COL = "col-1";
export const NAME_COL = "col-5";
export const PARAM_COL = "col-3";
export const RESET_COL = "col-2";

export const ICON_COL = "col-1";
export const TITLE_COL = "col-9";
export const TOOLTIP_BOX_COL = "col-2";

export const MIN_ELEMENT_WIDTH = 150;
export const MIN_ELEMENT_HEIGHT = 100;
export const DEFAULT_BOX_SIZE = {
  width: MIN_ELEMENT_WIDTH,
  height: MIN_ELEMENT_HEIGHT
};

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
    color: "green"
  },
  text: {
    type: "text",
    color: "blue"
  },
  number: {
    type: "number",
    color: "red"
  },
  data: {
    type: "data",
    color: "grey"
  }
};
Object.freeze(MimeTypes);

export const THEMES = {};

export const PORT_MARKUP = [{ tagName: "circle", selector: PORT_SELECTOR }];
export const PORT_LABEL_MARKUP = [{ tagName: "text", selector: "mainText" }];

export const PORT_ATTRS = position => {
  let refX, magnet;
  if (position === IN_PORT_CLASS) {
    magnet = "passive";
    refX = 0;
  } else if (position === OUT_PORT_CLASS) {
    magnet = "active";
    refX = -20;
  }

  return {
    [PORT_SELECTOR]: {
      magnet,
      r: 12,
      fill: "darkblue",
      stroke: "white",
      "stroke-width": "3px"
    },
    "hover-background": {
      ref: "type-hover",
      refWidth: "125%",
      refHeight: "100%",
      refX
    }
  };
};

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
    [IN_PORT_CLASS]: {
      position: { name: "left", args: { dy: 25 } },
      attrs: PORT_ATTRS(IN_PORT_CLASS),
      z: 5,
      label: {
        position: {
          name: "left"
        }
      }
    },
    [OUT_PORT_CLASS]: {
      position: { name: "right", args: { dy: 25 } },
      attrs: PORT_ATTRS(OUT_PORT_CLASS),
      z: 5,
      label: {
        position: {
          name: "right"
        }
      }
    }
  }
};

export const Shortcuts = {
  COPY: {
    ctrl: true,
    key: "c"
  },
  PASTE: {
    ctrl: true,
    key: "v"
  },
  DELETE: {
    key: "Delete"
  },
  UNDO: {
    ctrl: true,
    key: "z"
  },
  REDO: {
    ctrl: true,
    key: "y"
  }
};

export const DRAGGABLE_GROUP_NAME = "files";

export const PRODUCTION_MODE = "production";

export const ICON_DELETE = "fas fa-trash";
export const ICON_DUPLICATE = "fas fa-clone";
export const ICON_UNDO = "fas fa-undo";
export const ICON_REDO = "fas fa-redo";
export const ICON_ZOOM_IN = "fas fa-search-plus";
export const ICON_ZOOM_OUT = "fas fa-search-minus";
export const ICON_RESIZE = "fas fa-expand";
export const ICON_SETTINGS = "fas fa-cog";
export const ICON_SEARCH = "fas fa-search";
export const ICON_SAVE = "fas fa-save";
export const ICON_INSTALL = "fas fa-download";
