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

    Vue.prototype.$zoomOut = paper => {
      const currentScale = Vue.prototype.$zoom.scale;
      const nextScale = currentScale - 2 / ZOOM_STEP;
      const position = computePaperCenterPosition(paper);
      Vue.prototype.$changeZoom(1, position.x, position.y, nextScale);
    };
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
        minmaxScaleX: MAX_SCALE,
        minmaxScaleY: MAX_SCALE
      });
      Vue.prototype.$zoom.scale = paper.scale().sx;
    };
  }
};
export default plugin;
