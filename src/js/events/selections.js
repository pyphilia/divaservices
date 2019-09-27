import { BOX_HIGHLIGHTER } from "../constants/constants";
import { ctrlDown } from "./keyboard";
import { paper } from "../layout/interface";
import { hideContextMenus } from "./contextMenu";
import { saveElementsPositionFromCellView } from "../elements/moveElement";
import { updateSelectionTools } from "../layout/toolsbar";

// array of selected elements
export let selectedElements = [];

// array of copied elements
export let copiedElements = [];

export const clearSelection = () => {
  selectedElements = [];
  updateSelectionTools();
};

export const setCopiedElements = () => {
  copiedElements = selectedElements;
};

export const addCellViewToSelection = cellView => {
  if (selectedElements.indexOf(cellView) == -1) {
    selectedElements.push(cellView);
  }
  highlightSelection(cellView);
  saveElementsPositionFromCellView(selectedElements);
  updateSelectionTools();
};

export const addCellViewsToSelection = cellViews => {
  for (const cellView of cellViews) {
    highlightSelection(cellView);
    addCellViewToSelection(cellView);
  }
  saveElementsPositionFromCellView(selectedElements);
};

export const addModelsToSelection = models => {
  addCellViewsToSelection(models.map(m => paper.findViewByModel(m)));
};

const removeElementFromSelection = (cellView, index) => {
  selectedElements.splice(index, 1);
  unHighlight(cellView);
  updateSelectionTools();
};

const toggleCellViewInSelection = cellView => {
  const index = selectedElements.indexOf(cellView);
  if (index == -1) {
    addCellViewToSelection(cellView);
  } else {
    removeElementFromSelection(cellView, index);
  }
};
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
      unSelectAll();
    }

    toggleCellViewInSelection(cellView);
  });

  // on key up, if it was a translation, it will have
  // different positions values
  paper.on("element:pointerup", () => {
    saveElementsPositionFromCellView(selectedElements);
  });
};

export const highlightSelection = cellView => {
  if (cellView) {
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

const unHighlight = cellView => {
  cellView.unhighlight(null, BOX_HIGHLIGHTER);
};

export const unHighlightAllSelected = () => {
  // do not use unHighlightSelection to remove the array once
  if (selectedElements.length) {
    for (const el of selectedElements) {
      unHighlight(el);
    }
  }
};

export const unSelectAll = () => {
  unHighlightAllSelected();
  clearSelection();
};

export const resetHighlight = () => {
  if (selectedElements.length) {
    unHighlightAllSelected();
    highlightAllSelected();
  }
};
