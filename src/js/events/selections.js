import { BOX_HIGHLIGHTER } from "../constants/constants";
import { ctrlDown } from "./keyboard";
import { paper } from "../layout/interface";
import { hideContextMenus } from "./contextMenu";
import {
  selectedElements,
  clearSelection,
  addToSelection
} from "../constants/globals";

let allPositions = [];
const saveElementsPositionFromCellView = cellViews => {
  for (const [el, i] of cellViews.map((el, i) => [el.model, i])) {
    allPositions[i] = el.position();
  }
};

export const initSelection = () => {
  paper.on("element:pointerdown", (cellView /*, evt, x, y*/) => {
    hideContextMenus();
    if (!ctrlDown) {
      unHighlightAllSelected();
    }
    highlightSelection(cellView);
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

// currentElement is the element which the user clicked on to move the other ones
export const moveAllSelected = (currentElement, position) => {
  const selectModels = selectedElements.map(el => el.model);
  const currentElementIndex = selectModels.indexOf(currentElement);
  const previousCurrentPosition = allPositions[currentElementIndex];
  for (const [i, el] of selectModels
    .filter(el => el != currentElement)
    .entries()) {
    const { x: previousX, y: previousY } = allPositions[i];
    const deltaTranslation = {
      x: position.x - previousCurrentPosition.x,
      y: position.y - previousCurrentPosition.y
    };
    el.position(
      previousX + deltaTranslation.x,
      previousY + deltaTranslation.y,
      { multitranslate: true }
    );
  }
};
