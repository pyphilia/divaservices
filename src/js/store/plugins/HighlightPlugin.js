/**
 * This file contains highlight-related functions
 * Highlights appear when a box is selected
 */

import { BOX_HIGHLIGHTERS } from "../../constants/constants";
import Paper from "../../classes/Paper";

const HighlightPlugin = store => {
  store.subscribe(({ type }, { Interface }) => {
    // @TODO optimize with only changed values
    switch (type) {
      case "Interface/ADD_ELEMENT_TO_SELECTION":
      case "Interface/UNSELECT_ALL_ELEMENTS":
      case "Interface/ADD_UNIQUE_ELEMENT_TO_SELECTION":
      case "Interface/ADD_ELEMENTS_TO_SELECTION": {
        for (const element of Interface.elements.filter(
          ({ deleted }) => !deleted
        )) {
          const cellView = Paper.getViewFromBoxId(element.boxId);
          if (element.selected) {
            highlightSelection(cellView);
          } else {
            unHighlight(cellView);
          }
        }
        break;
      }
      default:
        break;
    }
  });
};

export default HighlightPlugin;

function highlightSelection(cellView) {
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
function unHighlight(cellView) {
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
// function unHighlightAllElements(elements) {
//   for (const el of elements) {
//     unHighlight(el);
//   }
// }

/**
 * reset highlight on element
 *
 * @param {element} element
 */
// const resetHighlight = element => {
//   unHighlight(element);
//   highlightSelection(element);
// };

/**
 * reset highlight on all elements
 *
 * @param {araay} elements
 */
// function resetHighlightAllElements(elements) {
//   for (const el of elements) {
//     resetHighlight(el);
//   }
// }
