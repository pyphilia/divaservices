import Graph from "../classes/Graph";

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
  const cell = Graph.getElementByBoxId(boxId);
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
