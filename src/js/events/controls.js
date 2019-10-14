import {
  MESSAGE_COPY_ERROR,
  MESSAGE_COPY_SUCCESS
} from "../constants/messages";
import { fireAlert } from "../utils/alerts";
import { app } from "../app";

export const copy = elements => {
  if (elements.length) {
    app.copySelectedElements();
    fireAlert("success", MESSAGE_COPY_SUCCESS);
  } else {
    fireAlert("danger", MESSAGE_COPY_ERROR);
  }
};
