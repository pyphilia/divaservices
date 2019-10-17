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
    source: { boxId: sourceBoxId, portname: sPortName },
    target: { boxId: targetBoxId, portname: tPortName }
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

export const selectElementByBoxId = (elements, boxId) => {
  const el = elements.find(el => el.boxId == boxId);
  if (el) {
    el.selected = true;
  } else {
    console.log("ERROR");
  }
};

export const selectElement = element => {
  element.selected = true;
};

export const currentElements = elements => {
  return elements.filter(el => !el.deleted);
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
