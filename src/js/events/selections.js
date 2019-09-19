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

export const initSelection = () => {
  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    hideContextMenus();
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
    if (!ctrlDown) {
      unHighlightAllSelected();
    }
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

export const unHighlightSelection = cellView => {
  cellView.unhighlight(null, BOX_HIGHLIGHTER);
  selectedElements.splice(selectedElements.indexOf(cellView), 1);
};

export const resetHighlight = () => {
  if (selectedElements.length) {
    unHighlightAllSelected();
    highlightAllSelected();
  }
};
