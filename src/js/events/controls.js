import {
  MESSAGE_PASTE_SUCCESS,
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_PASTE_ERROR
} from "../constants/messages";
import { fireAlert } from "../utils/alerts";
import { addSelectedElements } from "../elements/addElement";
import {
  selectedElements,
  copiedElements,
  setCopiedElements
} from "../constants/globals";

export const copy = () => {
  if (selectedElements.length) {
    setCopiedElements();
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};

export const paste = async () => {
  if (copiedElements.length) {
    await addSelectedElements();
    fireAlert("success", MESSAGE_PASTE_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_PASTE_ERROR);
  }
};
