import {
  MESSAGE_PASTE_SUCCESS,
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_PASTE_ERROR
} from "../constants/messages";
import { fireAlert } from "../utils/alerts";
import { addElementsByCellView } from "../elements/addElement";
import { setCopiedElements } from "../events/selections";
import { deleteElementsByCellView } from "../elements/deleteElement";
import { generateUniqueId } from "../layout/utils";

export const copy = elements => {
  if (elements.length) {
    setCopiedElements();
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};

export const paste = (cellViews, ids) => {
  if (cellViews && cellViews.length) {
    // if not specified, generate new ids for the copied elements
    if (!ids) {
      ids = [];
      for (let i = 0; i < cellViews.length; i++) {
        ids[i] = generateUniqueId();
      }
    }
    const { addedElements, boxIds } = addElementsByCellView(cellViews, ids);
    fireAlert("success", MESSAGE_PASTE_SUCCESS);
    return { addedElements, boxIds };
  } else {
    fireAlert("danger", MESSAGE_PASTE_ERROR);
  }
};

export const undoPaste = async addedElements => {
  deleteElementsByCellView(addedElements);
};
