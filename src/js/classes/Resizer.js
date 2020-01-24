/**
 * Resize plugin
 */

import * as joint from "jointjs";
import { resizeElementBox } from "../elements/resizeElement";
import { MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH } from "../utils/constants";

class Resizer {
  constructor(elementState, cellView, graph, commit) {
    this.commit = commit;

    // select dom element
    this.currentElement = cellView.model;
    this.boxId = this.currentElement.attributes.boxId;
    this.currentState = elementState;
    this.currentForeignObjs = document.querySelectorAll(
      `foreignObject[boxId='${this.boxId}']`
    );

    // create resizer
    this.resizer = new joint.shapes.standard.Rectangle();
    this.resizer.attributes.class = "resizer";
    this.resizer.resize(15, 15);
    this.resizer.attr("body/fill", "red");
    this.resizer.attr("body/stroke", "none");
    this.resizer.addTo(graph);

    var bbox = this.currentElement.getBBox();
    this.resizer.position(bbox.x + bbox.width, bbox.y + bbox.height);

    // when resizer is moved, resize
    this.resizer.on("change:position", (el, newPosition) => {
      const clientPosition = newPosition;
      this.resize(clientPosition);
    });

    this.resizing = false;
    this.startingResizerPos = {};
    this.startingElementPos = undefined;
  }

  get isResizing() {
    return this.resizing;
  }

  init() {
    this.resizing = true;

    const { position, size } = this.currentState;

    // init from resizer's, foreignobject's and cellview's position
    this.startingResizerPos = this.resizer.attributes.position;
    this.startingElementPos = { ...position, ...size };
  }

  end() {
    this.resizing = false;
    this.commit(this.boxId, this.currentElement.attributes.size);
  }

  /**
   * remove resizer element
   */
  remove() {
    // remove resizer if exists
    if (this.resizer && !this.resizing) {
      this.resizer.remove();
      this.resizer = null;
    }
  }

  /**
   * resize operation
   */
  resize({ x, y }) {
    const deltaX = -this.startingResizerPos.x + x;
    const deltaY = -this.startingResizerPos.y + y;
    // @TODO: constrain to min - max value
    const height = Math.max(
      this.startingElementPos.height + deltaY,
      MIN_ELEMENT_HEIGHT
    );
    const width = Math.max(
      this.startingElementPos.width + deltaX,
      MIN_ELEMENT_WIDTH
    );

    resizeElementBox(this.currentElement, this.currentForeignObjs, {
      height,
      width
    });
  }
}
export default Resizer;
