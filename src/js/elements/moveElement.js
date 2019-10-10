import { getElementByBoxId } from "../layout/utils";

export const moveElementsByBoxId = (elementBoxIds, positions) => {
  for (const id of elementBoxIds) {
    const el = getElementByBoxId(id);
    const { x, y } = positions[id];
    el.position(x, y, { multitranslate: true });
  }
};

export const moveElements = elements => {
  for (const { boxId, position } of elements) {
    const el = getElementByBoxId(boxId);
    const { x, y } = position;
    el.position(x, y, { multitranslate: true });
  }
};

// // currentElement is the element which the user clicked on to move the other ones
export const moveAllElements = (elements, deltaPosition) => {
  for (const el of elements) {
    const graphEl = getElementByBoxId(el.boxId);
    const { x: previousX, y: previousY } = el.position;
    graphEl.position(previousX + deltaPosition.x, previousY + deltaPosition.y, {
      multitranslate: true
    });
  }
};
