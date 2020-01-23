/**
 * Area Selection plugin
 * allows selecting multiple elements from a rectangle selection
 */

import { AREA_SELECTION_ELEMENT } from "../constants/selectors";

const div = document.getElementById(AREA_SELECTION_ELEMENT);

/**
 * draw rectangle selection
 *
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 */
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

/**
 * find elements in given area, defined with x, y, width and height
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
const findViewsInAreaCustom = (elements, { x, y, width, height }) => {
  return elements.filter(el => {
    return !(
      x > el.position.x + el.size.width ||
      x + width < el.position.x ||
      y > el.position.y + el.size.height ||
      y + height < el.position.y
    );
  });
};

const plugin = {
  install(Vue) {
    Vue.prototype.$areaSelection = Vue.observable({
      active: false
    });
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;

    /**
     * begin selection operation
     */
    Vue.prototype.$initAreaSelection = event => {
      Vue.prototype.$areaSelection.active = true;
      x1 = event.clientX;
      y1 = event.clientY;
      x2 = event.clientX;
      y2 = event.clientY;
      reCalc(x1, x2, y1, y2);
      div.hidden = 0;
    };

    /**
     * end selection operation
     */
    Vue.prototype.$endAreaSelection = (
      { x: paperOffsetX, y: paperOffsetY },
      { tx: paperTranslateX, ty: paperTranslateY },
      scale,
      elements
    ) => {
      Vue.prototype.$areaSelection.active = false;

      const { x, y, width, height } = div.getBoundingClientRect();

      const pointX = (x - paperOffsetX - paperTranslateX) / scale;
      const pointY = (y - paperOffsetY - paperTranslateY) / scale;

      const selectedElements = findViewsInAreaCustom(elements, {
        x: pointX,
        y: pointY,
        width: width / scale,
        height: height / scale
      });

      div.hidden = 1;

      return selectedElements;
    };

    /**
     * translate mouse coordinate to paper coordinate to draw selection
     */
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
