/**
 * Split.js configuration
 */

import Split from "split.js";
import { LEFT_SIDEBAR, MAIN_INTERFACE } from "./selectors";

const DEFAUL_SPLIT_SIZES = [25, 75];
let split;

export const initSplit = () => {
  split = Split([`#${LEFT_SIDEBAR}`, MAIN_INTERFACE], {
    elementStyle: function(dimension, size, gutterSize) {
      return { "flex-basis": "calc(" + size + "% - " + gutterSize + "px)" };
    },
    minSize: [10, 500],
    sizes: DEFAUL_SPLIT_SIZES,
    gutterSize: 6
  });
};

export const toggleSplit = opened => {
  if (!opened || split.getSizes()[0] < 1) {
    split.setSizes(DEFAUL_SPLIT_SIZES);
    return true;
  } else {
    split.collapse(0);
    return false;
  }
};
