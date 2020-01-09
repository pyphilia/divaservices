import { getElementByBoxId } from "../layout/utils";

/**
 * delete element from joint.js graph
 *
 * @param {element} element
 */
const deleteElement = element => {
  element.remove();
};

/**
 * delete element from graph by boxId
 *
 * @param {*} boxId
 */
export const deleteElementByBoxId = boxId => {
  const cell = getElementByBoxId(boxId);
  deleteElement(cell);
};

/**
 * delete link from graph
 * @param {link} link
 */
export const deleteLink = link => {
  if (link) {
    link.remove();
  }
};
