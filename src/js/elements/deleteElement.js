import {
  ACTION_DELETE_ELEMENT,
  ACTION_DELETE_ALL_ELEMENTS,
  addAction
} from "../utils/undo";
import { MESSAGE_DELETE_CONFIRM } from "../constants/messages";
import { graph } from "../layout/interface";

export const deleteElementById = (id, setHistory = true) => {
  const cell = graph.getCell(id);
  console.log("TCL: cell", cell);
  const name = cell.attributes.type;
  const defaultParams = cell.attributes.params;
  cell.remove();
  const cellInfo = { name, defaultParams, id };
  if (setHistory) {
    addAction(ACTION_DELETE_ELEMENT, cellInfo);
  }
  return cellInfo;
};

export const deleteElementsById = ids => {
  const elements = [];
  if (ids.length) {
    if (confirm(MESSAGE_DELETE_CONFIRM)) {
      for (const id of ids) {
        const info = deleteElementById(id, false);
        elements.push(info);
      }
      // if (!ids.length) {
      //   ids = [];
      // }
      addAction(ACTION_DELETE_ALL_ELEMENTS, { elements, ids });
    } else {
      // @TODO replace where it was before moving
    }
  }
};
