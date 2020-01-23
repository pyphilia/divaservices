import { CATEGORY_DATATEST } from "../../constants/constants";
import Graph from "../../classes/Graph";

/**
 * find in elements the element with given boxId
 *
 * @param {array} elements
 * @param {string} boxId
 */
export const findElementByBoxId = (elements, boxId) => {
  return elements.find(el => el.boxId == boxId);
};

/**
 * convert a link to a storable link
 *
 * @param {graph} graph
 * @param {link} link
 */
export const buildLinkForStore = link => {
  const source = link.source;
  const target = link.target;

  const sourceCell = Graph.graph.getCell(source.id);
  const sourceBoxId = sourceCell.attributes.boxId;
  const sPortId = source.port;
  const sPortName = sourceCell.getPort(sPortId).name;

  const targetCell = Graph.graph.getCell(target.id);
  const targetBoxId = targetCell.attributes.boxId;
  const tPortId = target.port;
  const tPortName = targetCell.getPort(tPortId).name;

  return {
    id: link.id,
    source: { boxId: sourceBoxId, portName: sPortName },
    target: { boxId: targetBoxId, portName: tPortName }
  };
};

/**
 * add element to elements array in store
 * it adds status booleans for graphical purpose
 *
 * @param {array} elements
 * @param {object} element
 */
export const addElementToElements = (elements, element) => {
  elements.push({
    ...element,
    selected: false,
    deleted: false,
    copied: false
  });
};

/**
 * set element as deleted in store
 *
 * @param {*} element
 */
export const deleteElement = element => {
  //we use a deleted flag, in order to be able to paste deleted copied elements
  element.deleted = true;
};

/**
 * delete link in links array
 *
 * @param {array} links
 * @param {object} link
 */
export const deleteLink = (links, link) => {
  links = links.filter(thisL => thisL.id != link.id);
};

/**
 * add link to links array in store
 *
 * @param {array} links
 * @param {object} link
 * @param {graph} graph
 */
export const addLinktoLinks = (links, link) => {
  links.push(link);
};

/**
 * set element as selected in store by boxId
 *
 * @param {array} elements
 * @param {string} boxId
 */
export const selectElementByBoxId = (elements, boxId) => {
  const el = elements.find(el => el.boxId == boxId);
  if (el) {
    el.selected = true;
  } else {
    console.log("ERROR");
  }
};

/**
 * set element as selected in store
 * @param {object} element
 */
export const selectElement = element => {
  element.selected = true;
};

/**
 * unselect all elements
 *
 * @param {array} elements
 */
export const unSelectAllElements = elements => {
  elements.map(el => (el.selected = false));
};

/**
 * remove links linked to deleted elements
 *
 * @param {array} elements
 * @param {array} links
 */
export const removeLinksWithDeletedElements = (elements, links) => {
  return links.filter(
    link =>
      !elements.find(el => el.boxId === link.source.boxId).deleted &&
      !elements.find(el => el.boxId === link.target.boxId).deleted
  );
};

/**
 * return visible elements
 *
 * @param {array} elements
 */
export const currentElements = elements => {
  return elements.filter(el => !el.deleted);
};

/**
 * return visible data elements
 *
 * @param {array} elements
 */
export const currentDataElements = elements => {
  return elements.filter(
    el => el.category === CATEGORY_DATATEST && !el.deleted
  );
};

/**
 * return copied elements
 *
 * @param {array} elements
 */
export const copiedElements = elements => {
  return elements.filter(el => el.copied);
};

/**
 * return selected elements
 *
 * @param {array} elements
 */
export const selectedElements = elements => {
  return elements.filter(el => el.selected && !el.deleted);
};

/**
 * return deleted elements
 *
 * @param {array} elements
 */
export const deletedElements = elements => {
  return elements.filter(el => el.deleted);
};
