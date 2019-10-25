import { getElementByBoxId } from "../layout/utils";
import { FOREIGN_CLASS } from "../constants/selectors";

export const resizeElementBox = (model, foreignObjs, { width, height }) => {
  model.resize(width, height);
  for (const foreignObj of foreignObjs) {
    foreignObj.setAttribute("height", height);
    foreignObj.setAttribute("width", width);
  }
};

// special function to resize elements from state
export const resizeElements = elements => {
  for (const { boxId, size } of elements) {
    const model = getElementByBoxId(boxId);
    const foreignObjs = document.querySelectorAll(
      `foreignObject.${FOREIGN_CLASS}[boxId='${boxId}']`
    );

    resizeElementBox(model, foreignObjs, size);
  }
};
