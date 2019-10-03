// import Vue from 'vue';
import { MIN_SCALE, MAX_SCALE, DEFAULT_SCALE } from "../constants/constants";
import { paper } from "../layout/interface";

const zoomStep = 75;

const plugin = {
  install(Vue) {
    Vue.mixin({
      data() {
        return {
          scale: DEFAULT_SCALE
        };
      },
      methods: {
        zoomOut() {
          const currentScale = paper.scale().sx;
          const nextScale = currentScale - 2 / zoomStep;
          this.setZoomToScale(nextScale);
        },
        zoomIn() {
          const currentScale = paper.scale().sx;
          const nextScale = currentScale + 2 / zoomStep;
          this.setZoomToScale(nextScale);
        },
        setZoomToScale(thisScale) {
          const bcr = paper.svg.getBoundingClientRect();
          const localRect1 = paper.clientToLocalRect({
            x: bcr.left,
            y: bcr.top,
            width: bcr.width,
            height: bcr.height
          });
          const { x, y } = localRect1.center();
          this.changeZoom(1, x, y, thisScale);
        },
        // zoom algorithm: https://github.com/clientIO/joint/issues/1027
        changeZoom(delta, x, y, thisScale) {
          const nextScale = !thisScale
            ? paper.scale().sx + delta / zoomStep // the current paper scale changed by delta
            : thisScale;

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

            this.scale = nextScale;
          }
          // app.activity = true;
        }
      }
    });
  }
};
export default plugin;
