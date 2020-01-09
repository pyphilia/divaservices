import { getElementByBoxId } from "../layout/utils";

/**
 * move elements
 * applied on undo-redo operations
 *
 * @param {array} elements
 */
export const moveElements = elements => {
  for (const { boxId, position } of elements) {
    const el = getElementByBoxId(boxId);
    const { x, y } = position;
    el.position(x, y, { stopPropagation: true });
  }
};

/**
 * move multiple elements
 * the move operation is initiated by a single element,
 * the other elements are moved accordingly by hand
 *
 * @param {array} elements elements to move
 * @param {object} deltaPosition difference of position of reference element
 */
export const moveAllElements = (elements, deltaPosition) => {
  for (const el of elements) {
    const cellView = getElementByBoxId(el.boxId);
    const { x: previousX, y: previousY } = el.position;
    cellView.position(
      previousX + deltaPosition.x,
      previousY + deltaPosition.y,
      {
        stopPropagation: true
      }
    );
  }
};
