import { CATEGORY_DATATEST } from "../../constants/constants";

export const buildLinkForStore = (graph, link) => {
  const source = link.source;
  const target = link.target;

  const sourceCell = graph.getCell(source.id);
  const sourceBoxId = sourceCell.attributes.boxId;
  const sPortId = source.port;
  const sPortName = sourceCell.getPort(sPortId).name;

  const targetCell = graph.getCell(target.id);
  const targetBoxId = targetCell.attributes.boxId;
  const tPortId = target.port;
  const tPortName = targetCell.getPort(tPortId).name;

  return {
    id: link.id,
    source: { boxId: sourceBoxId, portName: sPortName },
    target: { boxId: targetBoxId, portName: tPortName }
  };
};

export const addElementToElements = (elements, element) => {
  elements.push({
    ...element,
    selected: false,
    deleted: false,
    copied: false
  });
};

// we use a deleted flag, in order to be able to paste deleted copied
// elements
export const deleteElement = element => {
  element.deleted = true;
};

export const deleteLink = (links, link) => {
  links = links.filter(thisL => thisL.id != link.id);
};

export const addLinktoLinks = (links, link, graph) => {
  const l = buildLinkForStore(graph, link);
  links.push(l);
};

export const selectElementByBoxId = (elements, boxId) => {
  const el = elements.find(el => el.boxId == boxId);
  if (el) {
    el.selected = true;
  } else {
    console.log("ERROR");
  }
};

export const removeLinksWithDeletedElements = (elements, links) => {
  return links.filter(
    link =>
      !elements.find(el => el.boxId == link.source.boxId).deleted &&
      !elements.find(el => el.boxId == link.target.boxId).deleted
  );
};

export const selectElement = element => {
  element.selected = true;
};

export const currentElements = elements => {
  return elements.filter(el => !el.deleted);
};

export const currentDataElements = elements => {
  return elements.filter(el => el.category == CATEGORY_DATATEST && !el.deleted);
};

export const copiedElements = elements => {
  return elements.filter(el => el.copied);
};

export const selectedElements = elements => {
  return elements.filter(el => el.selected && !el.deleted);
};

export const deletedElements = elements => {
  return elements.filter(el => el.deleted);
};
