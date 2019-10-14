import { getElementByBoxId } from "../layout/utils";

const deleteElement = element => {
  element.remove();
};

export const deleteElementByBoxId = boxId => {
  const cell = getElementByBoxId(boxId);
  deleteElement(cell);
};

export const deleteLink = link => {
  if (link) {
    link.remove();
  }
};
