/**
 * Zoom plugin
 * it handles every zoom operation on the paper
 */
import {
  MIN_SCALE,
  MAX_SCALE,
  DEFAULT_SCALE,
  ZOOM_STEP
} from "../constants/constants";

const computePaperCenterPosition = paper => {
  const bcr = paper.svg.getBoundingClientRect();
  const localRect1 = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const { x, y } = localRect1.center();
  return { x, y };
};

const plugin = {
  install(Vue) {
    Vue.prototype.$zoom = Vue.observable({ scale: DEFAULT_SCALE, x: 0, y: 0 });

    /**
     * zoom out by a certain amount
     */
    Vue.prototype.$zoomOut = paper => {
      const currentScale = Vue.prototype.$zoom.scale;
      const nextScale = currentScale - 2 / ZOOM_STEP;
      const position = computePaperCenterPosition(paper);
      Vue.prototype.$changeZoom(1, position.x, position.y, nextScale);
    };

    /**
     * zoom in by a certain amount
     */
    Vue.prototype.$zoomIn = paper => {
      const currentScale = Vue.prototype.$scale;
      const nextScale = currentScale + 2 / ZOOM_STEP;
      const position = computePaperCenterPosition(paper);
      Vue.prototype.$changeZoom(1, position.x, position.y, nextScale);
    };
    Vue.prototype.$setZoom = (nextScale, paper) => {
      const position = computePaperCenterPosition(paper);
      Vue.prototype.$changeZoom(1, position.x, position.y, nextScale);
    };

    /**
     * zoom by delta, in the direction of delta,
     * centered at thisX, thisY
     */
    // zoom algorithm: https://github.com/clientIO/joint/issues/1027
    Vue.prototype.$changeZoom = (delta, thisX, thisY, stateScale) => {
      const nextScale = !stateScale
        ? Vue.prototype.$zoom.scale + delta / ZOOM_STEP // the current paper scale changed by delta
        : stateScale;

      if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
        Vue.prototype.$zoom.scale = nextScale;
        Vue.prototype.$zoom.x = thisX;
        Vue.prototype.$zoom.y = thisY;
      }
    };

    Vue.prototype.$fitContent = paper => {
      paper.scaleContentToFit({
        minScaleX: MIN_SCALE,
        minScaleY: MIN_SCALE,
        maxScaleX: MAX_SCALE,
        maxScaleY: MAX_SCALE
      });
      Vue.prototype.$zoom.scale = paper.scale().sx;
    };

    /**
     * change scale to currentScale
     */
    Vue.prototype.$changePaperScale = (paper, nextScale, currentScale) => {
      if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
        const zoom = Vue.prototype.$zoom;

        const beta = currentScale / nextScale;

        const ax = zoom.x - zoom.x * beta;
        const ay = zoom.y - zoom.y * beta;

        const translate = paper.translate();

        const nextTx = translate.tx - ax * nextScale;
        const nextTy = translate.ty - ay * nextScale;

        paper.translate(nextTx, nextTy);

        const ctm = paper.matrix();

        ctm.a = nextScale;
        ctm.d = nextScale;

        paper.matrix(ctm);
      }
    };
  }
};
export default plugin;
