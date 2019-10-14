import { AREA_SELECTION_ELEMENT } from "../constants/selectors";
import { app } from "../app";

const div = document.getElementById(AREA_SELECTION_ELEMENT);

const reCalc = (x1, x2, y1, y2) => {
  var x3 = Math.min(x1, x2);
  var x4 = Math.max(x1, x2);
  var y3 = Math.min(y1, y2);
  var y4 = Math.max(y1, y2);
  div.style.left = x3 + "px";
  div.style.top = y3 + "px";
  div.style.width = x4 - x3 + "px";
  div.style.height = y4 - y3 + "px";
};

const plugin = {
  install(Vue) {
    Vue.prototype.$areaSelection = Vue.observable({
      active: false,
      selectedElements: []
    });
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

    Vue.prototype.$initAreaSelection = event => {
      Vue.prototype.$areaSelection.active = true;
      x1 = event.clientX;
      y1 = event.clientY;
      x2 = event.clientX;
      y2 = event.clientY;
      reCalc(x1, x2, y1, y2);
      div.hidden = 0;
    };

    Vue.prototype.$endAreaSelection = paper => {
      Vue.prototype.$areaSelection.active = false;

      const { x, y, width, height } = div.getBoundingClientRect();
      const { x: paperOffsetX, y: paperOffsetY } = paper.clientOffset();
      const { tx: paperTranslateX, ty: paperTranslateY } = paper.translate();
      const currentScale = paper.scale().sx;

      const pointX = (x - paperOffsetX - paperTranslateX) / currentScale;
      const pointY = (y - paperOffsetY - paperTranslateY) / currentScale;

      Vue.prototype.$areaSelection.selectedElements = paper.findViewsInArea({
        x: pointX,
        y: pointY,
        width: width / currentScale,
        height: height / currentScale
      });

      for (const views of Vue.prototype.$areaSelection.selectedElements) {
        app.addElementToSelection(views);
      }

      div.hidden = 1;
    };

    Vue.prototype.$computeAreaSelection = () => {
      if (Vue.prototype.$areaSelection.active) {
        x2 = event.clientX;
        y2 = event.clientY;
        reCalc(x1, x2, y1, y2);
      }
    };
  }
};

export default plugin;
