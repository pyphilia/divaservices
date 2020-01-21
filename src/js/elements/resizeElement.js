import { getElementByBoxId } from "../layout/utils";
import { FOREIGN_CLASS } from "../constants/selectors";
import { app } from "../app";

/**
 * resize model and foreignObjects content
 * we resize multiple foreignObjects because of minimap own dom elements
 *
 * @param {model} model joint.js model to resize
 * @param {array} foreignObjs foreignObject objects to apply the new width and height
 * @param {number} width new target width
 * @param {number} height new target height
 */
export const resizeElementBox = (model, foreignObjs, { width, height }) => {
  model.resize(width, height);
  for (const foreignObj of foreignObjs) {
    foreignObj.setAttribute("height", height);
    foreignObj.setAttribute("width", width);
  }
};

/**
 * resize elements from state
 *
 * @param {array} elements
 */
export const resizeElements = elements => {
  const { graph } = app;
  for (const { boxId, size } of elements) {
    const model = getElementByBoxId(graph, boxId);
    const foreignObjs = document.querySelectorAll(
      `foreignObject.${FOREIGN_CLASS}[boxId='${boxId}']`
    );

    resizeElementBox(model, foreignObjs, size);
  }
};
