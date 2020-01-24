/**
 * Area Selection plugin
 * allows selecting multiple elements from a rectangle selection
 */

import { AREA_SELECTION_ELEMENT } from "../utils/selectors";

class AreaSelection {
  constructor(commit) {
    this.areaSelectionElement = document.getElementById(AREA_SELECTION_ELEMENT);
    this.active = false;

    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.commit = commit;
  }

  get isActive() {
    return this.active;
  }

  /**
   * draw rectangle selection
   *
   * @param {number} x1
   * @param {number} x2
   * @param {number} y1
   * @param {number} y2
   */
  reCalc(x1, x2, y1, y2) {
    const x3 = Math.min(x1, x2);
    const x4 = Math.max(x1, x2);
    const y3 = Math.min(y1, y2);
    const y4 = Math.max(y1, y2);
    this.areaSelectionElement.style.left = x3 + "px";
    this.areaSelectionElement.style.top = y3 + "px";
    this.areaSelectionElement.style.width = x4 - x3 + "px";
    this.areaSelectionElement.style.height = y4 - y3 + "px";
  }

  /**
   * find elements in given area, defined with x, y, width and height
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  findViewsInAreaCustom(elements, { x, y, width, height }) {
    return elements.filter(el => {
      return !(
        x > el.position.x + el.size.width ||
        x + width < el.position.x ||
        y > el.position.y + el.size.height ||
        y + height < el.position.y
      );
    });
  }

  /**
   * begin selection operation
   */
  init(event) {
    this.active = true;
    this.x1 = event.clientX;
    this.y1 = event.clientY;
    this.x2 = event.clientX;
    this.y2 = event.clientY;
    this.reCalc(this.x1, this.x2, this.y1, this.y2);
    this.areaSelectionElement.hidden = 0;
  }

  /**
   * end selection operation
   */
  end(
    { x: paperOffsetX, y: paperOffsetY },
    { tx: paperTranslateX, ty: paperTranslateY },
    scale,
    elements
  ) {
    this.active = false;

    const {
      x,
      y,
      width,
      height
    } = this.areaSelectionElement.getBoundingClientRect();

    const pointX = (x - paperOffsetX - paperTranslateX) / scale;
    const pointY = (y - paperOffsetY - paperTranslateY) / scale;

    const selectedElements = this.findViewsInAreaCustom(elements, {
      x: pointX,
      y: pointY,
      width: width / scale,
      height: height / scale
    });

    this.areaSelectionElement.hidden = 1;

    if (selectedElements.length) {
      this.commit({ elements: selectedElements });
    }
  }

  /**
   * translate mouse coordinate to paper coordinate to draw selection
   */
  compute() {
    if (this.active) {
      this.x2 = event.clientX;
      this.y2 = event.clientY;
      this.reCalc(this.x1, this.x2, this.y1, this.y2);
    }
  }
}

export default AreaSelection;
