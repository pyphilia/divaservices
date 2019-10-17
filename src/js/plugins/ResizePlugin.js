import { app } from "../app";
import * as joint from "jointjs";
import { resizeElementBox } from "../elements/resizeElement";
import { MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH } from "../constants/constants";

let startingResizerPos = {};
let startingElementPos;
let currentElement;
let currentState;
let titleHeight;
let currentForeignObjs;
let boxId = null;
let resizer = null;

const plugin = {
  install(Vue) {
    Vue.prototype.$resizing = false;

    Vue.prototype.$removeResizer = () => {
      if (resizer) {
        resizer.remove();
        resizer = null;
      }
    };

    Vue.prototype.$endResize = () => {
      Vue.prototype.$resizing = false;
      app.resizeElementByBoxId(boxId, currentElement.attributes.size);
    };

    Vue.prototype.$initResize = () => {
      Vue.prototype.$resizing = true;

      const { position, size } = currentState;

      // init from resizer's, foreignobject's and cellview's position
      startingResizerPos = resizer.attributes.position;
      startingElementPos = { ...position, ...size };
    };

    Vue.prototype.$createResizer = cellView => {
      const { graph } = app;

      currentElement = cellView.model;
      boxId = currentElement.attributes.boxId;
      currentState = app.elements.find(el => el.boxId == boxId);
      currentForeignObjs = document.querySelectorAll(
        `foreignObject[boxId='${boxId}']`
      );
      titleHeight = currentElement.attributes.titleHeight;

      resizer = new joint.shapes.standard.Rectangle();
      resizer.attributes.class = "resizer";
      resizer.resize(15, 15);
      resizer.attr("body/fill", "red");
      resizer.attr("body/stroke", "none");
      resizer.addTo(graph);

      var bbox = currentElement.getBBox();
      resizer.position(bbox.x + bbox.width, bbox.y + bbox.height);

      // when resizer is moved, resize
      resizer.on("change:position", (el, newPosition) => {
        const clientPosition = newPosition;
        Vue.prototype.$resize(clientPosition);
      });
    };

    Vue.prototype.$resize = ({ x, y }) => {
      const deltaX = -startingResizerPos.x + x;
      const deltaY = -startingResizerPos.y + y;
      // @TODO min - max
      const height = Math.max(
        startingElementPos.height + deltaY,
        MIN_ELEMENT_HEIGHT
      );
      const width = Math.max(
        startingElementPos.width + deltaX,
        MIN_ELEMENT_WIDTH
      );

      resizeElementBox(
        currentElement,
        currentForeignObjs,
        { height, width },
        titleHeight
      );
    };
  }
};
export default plugin;
