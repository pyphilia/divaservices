import { BOX_HIGHLIGHTER } from "../constants/constants";
import { ctrlDown } from "./keyboard";
import { paper } from "../layout/interface";
import { hideContextMenus } from "./contextMenu";
import {
  selectedElements,
  clearSelection,
  addToSelection
} from "../constants/globals";
import { saveElementsPositionFromCellView } from "../elements/moveElement";

/**
 * Initialize the element selection feature
 * It also handles the highlight effect of the elements
 */
export const initSelection = () => {
  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    hideContextMenus();
    // if control key is not hold, a different
    // the current selection is reset
    if (!ctrlDown) {
      unHighlightAllSelected();
    }
    highlightSelection(cellView);
    saveElementsPositionFromCellView(selectedElements);
  });

  // on key up, if it was a translation, it will have
  // different positions values
  paper.on("element:pointerup", () => {
    saveElementsPositionFromCellView(selectedElements);
  });
};

export const highlightSelection = cellView => {
  if (cellView) {
    addToSelection(cellView);
    cellView.highlight(null, BOX_HIGHLIGHTER);
  }
};

export const highlightAllSelected = () => {
  if (selectedElements.length) {
    for (const el of selectedElements) {
      highlightSelection(el);
    }
  }
};

export const unHighlightAllSelected = () => {
  // do not use unHighlightSelection to remove the array once
  if (selectedElements.length) {
    for (const el of selectedElements) {
      el.unhighlight(null, BOX_HIGHLIGHTER);
    }
    clearSelection();
  }
};

export const resetHighlight = () => {
  if (selectedElements.length) {
    unHighlightAllSelected();
    highlightAllSelected();
  }
};
