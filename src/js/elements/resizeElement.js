import { getElementByBoxId } from "../layout/utils";
import { FOREIGN_CLASS } from "../constants/selectors";

export const resizeElementBox = (
  model,
  foreignObjs,
  { width, height },
  titleHeight = 0
) => {
  model.resize(width, height);
  for (const foreignObj of foreignObjs) {
    foreignObj.setAttribute("height", height + titleHeight);
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

    const titleHeight = model.attributes.titleHeight;

    resizeElementBox(model, foreignObjs, size, titleHeight);
  }
};
