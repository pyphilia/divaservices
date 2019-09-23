import { MIN_SCALE, MAX_SCALE } from "../constants/constants";
import { updateMinimap } from "../layout/minimap";
import { paper } from "../layout/interface";

export const resetZoom = () => {
  const bcr = paper.svg.getBoundingClientRect();
  const localRect1 = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const { x, y } = localRect1.center();
  changeZoom(1, x, y, true);
};

// zoom algorithm: https://github.com/clientIO/joint/issues/1027
export const changeZoom = (delta, x, y, reset) => {
  const nextScale = !reset
    ? paper.scale().sx + delta / 75 // the current paper scale changed by delta
    : 1;

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
  }
  updateMinimap();
};
