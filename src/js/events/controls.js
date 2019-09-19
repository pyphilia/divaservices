import {
  MESSAGE_PASTE_SUCCESS,
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_PASTE_ERROR
} from "../constants/messages";
import { fireAlert } from "../utils/alerts";
import { addElementsByCellView } from "../elements/addElement";
import { setCopiedElements } from "../constants/globals";
import { deleteElementsByCellView } from "../elements/deleteElement";

export const copy = elements => {
  if (elements.length) {
    setCopiedElements();
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};

export const paste = (cellViews, ids) => {
  if (cellViews.length) {
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
