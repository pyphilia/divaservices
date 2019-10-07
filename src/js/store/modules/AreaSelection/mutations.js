import { AREA_SELECTION_ELEMENT } from "../../../constants/selectors";
import { selectElementByBoxId } from "../Interface";

const div = document.getElementById(AREA_SELECTION_ELEMENT);

function reCalc(state) {
  var x3 = Math.min(state.areaSelection.x1, state.areaSelection.x2);
  var x4 = Math.max(state.areaSelection.x1, state.areaSelection.x2);
  var y3 = Math.min(state.areaSelection.y1, state.areaSelection.y2);
  var y4 = Math.max(state.areaSelection.y1, state.areaSelection.y2);
  div.style.left = x3 + "px";
  div.style.top = y3 + "px";
  div.style.width = x4 - x3 + "px";
  div.style.height = y4 - y3 + "px";
}

export default {
  initAreaSelection(state, event) {
    state.areaSelection.active = true;
    state.areaSelection.x1 = event.clientX;
    state.areaSelection.y1 = event.clientY;
    state.areaSelection.x2 = event.clientX;
    state.areaSelection.y2 = event.clientY;
    reCalc(state);
    div.hidden = 0;
  },

  endAreaSelection(state, { paper, graph }) {
    state.areaSelection.active = false;

    const { x, y, width, height } = div.getBoundingClientRect();
    const { x: paperOffsetX, y: paperOffsetY } = paper.clientOffset();
    const { tx: paperTranslateX, ty: paperTranslateY } = paper.translate();
    const currentScale = paper.scale().sx;

    const pointX = (x - paperOffsetX - paperTranslateX) / currentScale;
    const pointY = (y - paperOffsetY - paperTranslateY) / currentScale;

    const models = graph.findModelsInArea({
      x: pointX,
      y: pointY,
      width: width / currentScale,
      height: height / currentScale
    });

    for (const model of models) {
      const { boxId } = model.attributes;
      selectElementByBoxId(state.elements, boxId);
    }

    div.hidden = 1;
  },

  computeAreaSelection(state) {
    if (state.areaSelection.active) {
      state.areaSelection.x2 = event.clientX;
      state.areaSelection.y2 = event.clientY;
      reCalc(state);
    }
  }
};
