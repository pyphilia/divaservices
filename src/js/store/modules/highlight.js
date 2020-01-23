/**
 * This file contains highlight-related functions
 * Highlights appear when a box is selected
 */

import { BOX_HIGHLIGHTERS } from "../../constants/constants";

// const removeHighlightToolsbar = (cellView) => {
//   cellView.el.querySelector(`.${HIGHLIGHT_TOOLSBAR}`).remove();
// }

export function highlightSelection(cellView) {
  if (cellView) {
    for (const highlight of BOX_HIGHLIGHTERS) {
      cellView.highlight(null, highlight);
    }

    // if(!cellView.el.querySelector(`.${HIGHLIGHT_TOOLSBAR}`)) {

    //   appendHighlightToolsbar(cellView)

    // }
  }
}

/**
 * remove highlight on given cellView
 *
 * @param {cellView} cellView
 */
export function unHighlight(cellView) {
  for (const highlight of BOX_HIGHLIGHTERS) {
    cellView.unhighlight(null, highlight);
  }

  // removeHighlightToolsbar(cellView)
}

/**
 * remove highlight for all given elements
 *
 * @param {array} elements
 */
export function unHighlightAllElements(elements) {
  for (const el of elements) {
    unHighlight(el);
  }
}

/**
 * reset highlight on element
 *
 * @param {element} element
 */
export const resetHighlight = element => {
  unHighlight(element);
  highlightSelection(element);
};

/**
 * reset highlight on all elements
 *
 * @param {araay} elements
 */
export function resetHighlightAllElements(elements) {
  for (const el of elements) {
    resetHighlight(el);
  }
}
