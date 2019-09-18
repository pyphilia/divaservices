import { MESSAGE_DELETE_CONFIRM } from "../constants/messages";
import { graph } from "../layout/interface";

export const deleteElementById = id => {
  const cell = graph.getCell(id);
  const copy = cell.clone();
  cell.remove();
  return copy;
};

export const deleteElementsById = ids => {
  const restoredElements = [];
  if (ids.length) {
    if (confirm(MESSAGE_DELETE_CONFIRM)) {
      for (const id of ids) {
        const copy = deleteElementById(id, false);
        restoredElements.push(copy);
      }
    } else {
      // @TODO replace where it was before moving
    }
  }
  return { restoredElements };
};

export const deleteElementByCellView = cellView => {
  const id = cellView.model.attributes.id;
  return deleteElementById(id);
};

export const deleteElementsByCellView = cellViews => {
  const ids = cellViews.map(
    cellView => cellView.attributes.id || cellView.model.attributes.id
  );
  return deleteElementsById(ids);
};
