import { paper, graph } from "../layout/interface";
import { getElementByBoxId } from "../layout/utils";
import { app } from "../main";

const deleteElement = (element, cellView) => {
  if (!cellView) {
    cellView = paper.findViewByModel(element);
  }
  app.removeElementFromSelection(cellView);

  const copy = element.clone();
  element.remove();
  return copy;
};

export const deleteElementById = (id, cellView) => {
  const cell = graph.getCell(id);
  return deleteElement(cell, cellView);
};

export const deleteElementByBoxId = boxId => {
  const cell = getElementByBoxId(boxId);
  return deleteElement(cell);
};

export const deleteElementsById = ids => {
  const restoredElements = [];
  for (const id of ids) {
    const copy = deleteElementById(id);
    restoredElements.push(copy);
  }
  return { restoredElements };
};

export const deleteElementsByBoxId = (boxIds, cellViews) => {
  const restoredElements = [];
  for (let i = 0; i < boxIds.length; i++) {
    const copy = deleteElementByBoxId(boxIds[i], cellViews[i]);
    restoredElements.push(copy);
  }

  return { restoredElements };
};

export const deleteElementByCellView = cellView => {
  const id = cellView.model.attributes.id || cellView.attributes.id;
  return deleteElementById(id, cellView);
};

export const deleteElementsByCellView = cellViews => {
  if (cellViews) {
    const boxIds = cellViews.map(
      cellView => cellView.attributes.boxId || cellView.model.attributes.boxId
    );
    return deleteElementsByBoxId(boxIds, cellViews);
  }
};

export const deleteLink = link => {
  if (link) {
    link.remove();
  }
};
