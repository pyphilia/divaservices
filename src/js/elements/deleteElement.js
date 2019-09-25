import { graph } from "../layout/interface";
import { getElementByBoxId } from "../layout/utils";

const deleteElement = element => {
  const copy = element.clone();
  element.remove();
  return copy;
};

export const deleteElementById = id => {
  const cell = graph.getCell(id);
  return deleteElement(cell);
};

export const deleteElementByBoxId = boxId => {
  const cell = getElementByBoxId(boxId);
  return deleteElement(cell);
};

export const deleteElementsById = ids => {
  const restoredElements = [];
  for (const id of ids) {
    const copy = deleteElementById(id, false);
    restoredElements.push(copy);
  }
  return { restoredElements };
};

export const deleteElementsByBoxId = boxIds => {
  const restoredElements = [];
  for (const boxId of boxIds) {
    const copy = deleteElementByBoxId(boxId, false);
    restoredElements.push(copy);
  }

  return { restoredElements };
};

export const deleteElementByCellView = cellView => {
  const id = cellView.model.attributes.id || cellView.attributes.id;
  return deleteElementById(id);
};

export const deleteElementsByCellView = cellViews => {
  if (cellViews) {
    const boxIds = cellViews.map(
      cellView => cellView.attributes.boxId || cellView.model.attributes.boxId
    );
    return deleteElementsByBoxId(boxIds);
  }
};

export const deleteLink = link => {
  if (link) {
    link.remove();
  }
};
