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

// export const paste = (cellViews, ids) => {
//   if (cellViews && cellViews.length) {
//     // if not specified, generate new ids for the copied elements
//     if (!ids) {
//       ids = [];
//       for (let i = 0; i < cellViews.length; i++) {
//         ids[i] = generateUniqueId();
//       }
//     }
//     const { addedElements, boxIds } = addElementsByCellView(cellViews, ids);
//     fireAlert("success", MESSAGE_PASTE_SUCCESS);
//     return { addedElements, boxIds };
//   } else {
//     fireAlert("danger", MESSAGE_PASTE_ERROR);
//   }
// };

// export const undoPaste = async addedElements => {
//   deleteElementsByCellView(addedElements);
// };
