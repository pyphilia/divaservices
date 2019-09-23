import { graph, paper } from "../layout/interface";
import { addCellViewsToSelection } from "./selections";
import { AREA_SELECTION_ELEMENT } from "../constants/selectors";

const div = document.getElementById(AREA_SELECTION_ELEMENT);
let areaSelection = false;
let x1 = 0,
  y1 = 0,
  x2 = 0,
  y2 = 0;

const reCalc = () => {
  var x3 = Math.min(x1, x2);
  var x4 = Math.max(x1, x2);
  var y3 = Math.min(y1, y2);
  var y4 = Math.max(y1, y2);
  div.style.left = x3 + "px";
  div.style.top = y3 + "px";
  div.style.width = x4 - x3 + "px";
  div.style.height = y4 - y3 + "px";
};

export const initAreaSelection = () => {
  areaSelection = true;
  x1 = event.clientX;
  y1 = event.clientY;
  x2 = event.clientX;
  y2 = event.clientY;
  reCalc();
  div.hidden = 0;
};

export const endAreaSelection = () => {
  areaSelection = false;

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

  addCellViewsToSelection(models.map(model => paper.findViewByModel(model)));
  div.hidden = 1;
};

export const computeAreaSelection = () => {
  if (areaSelection) {
    x2 = event.clientX;
    y2 = event.clientY;
    reCalc();
  }
};
