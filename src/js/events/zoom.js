import { MIN_SCALE, MAX_SCALE } from "../constants/constants";
import { paper } from "../layout/interface";
import { updateZoomSlider } from "../layout/components/toolsbar";
import { app } from "../main";

const zoomStep = 75;

export const zoomOut = () => {
  const currentScale = paper.scale().sx;
  const nextScale = currentScale - 2 / zoomStep;
  setZoomToScale(nextScale);
};

export const zoomIn = () => {
  const currentScale = paper.scale().sx;
  const nextScale = currentScale + 2 / zoomStep;
  setZoomToScale(nextScale);
};

export const setZoomToScale = scale => {
  const bcr = paper.svg.getBoundingClientRect();
  const localRect1 = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const { x, y } = localRect1.center();
  changeZoom(1, x, y, scale);
};

// zoom algorithm: https://github.com/clientIO/joint/issues/1027
export const changeZoom = (delta, x, y, scale) => {
  const nextScale = !scale
    ? paper.scale().sx + delta / zoomStep // the current paper scale changed by delta
    : scale;

  if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
    const currentScale = paper.scale().sx;

    const beta = currentScale / nextScale;

    const ax = x - x * beta;
    const ay = y - y * beta;

    const translate = paper.translate();

    const nextTx = translate.tx - ax * nextScale;
    const nextTy = translate.ty - ay * nextScale;

    paper.translate(nextTx, nextTy);

    const ctm = paper.matrix();

    ctm.a = nextScale;
    ctm.d = nextScale;

    paper.matrix(ctm);

    updateZoomSlider(Math.ceil(nextScale * 100));
  }
  app.activity = true;
};
