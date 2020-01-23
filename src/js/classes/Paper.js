import * as joint from "jointjs";
import Vue from "vue";
import {
  THEME,
  BOX_MARGIN,
  DEFAULT_SCALE,
  MIN_SCALE,
  MAX_SCALE,
  ZOOM_STEP
} from "../constants/constants";
import {
  INTERFACE_ROOT,
  PORT_SELECTOR,
  CONTEXT_MENU_ELEMENT,
  CONTEXT_MENU_PAPER
} from "../constants/selectors";
import { validateConnection } from "../layout/utils";

import { spaceDown, ctrlDown } from "../events/keyboardEvents";

import Graph from "./Graph";

class Paper {
  constructor() {
    this._paper = null;
    this._translation = { tx: 0, ty: 0 };
    this._scale = DEFAULT_SCALE;
    this._isElementchangePosition = false;

    this.isPanning = false;
    this.dragStartPosition = undefined;

    this.mouseX = 0;
    this.mouseY = 0;
  }

  get paper() {
    return this._paper;
  }

  get translation() {
    return this._translation;
  }

  get scale() {
    return this._scale;
  }

  set isElementchangePosition(value) {
    this._isElementchangePosition = value;
  }

  initPaper(app) {
    this._paper = new joint.dia.Paper({
      el: document.querySelector(INTERFACE_ROOT),
      model: Graph.graph,
      width: "100%",
      height: 800,
      gridSize: 15,
      drawGrid: {
        name: "dot"
      },
      linkPinning: false,
      snapLinks: true,
      defaultLink: new joint.shapes.standard.Link({ z: 20 }),
      defaultConnector: { name: "smooth" },
      defaultConnectionPoint: { name: "boundary" },
      markAvailable: true,
      validateConnection
    });

    this._paper.options.highlighting.magnetAvailability =
      THEME.magnetAvailabilityHighlighter;

    this.initPaperEvents(app);
  }

  initPaperEvents(app) {
    const contextMenu = app.$refs.contextmenu;

    document.addEventListener("click", function() {
      contextMenu.hideContextMenus();
    });

    // /*------------ZOOM */

    this._paper.on("blank:mousewheel", (evt, x, y, delta) => {
      this.changeZoom(delta, x, y);
    });

    this._paper.on("element:mousewheel", (e, evt, x, y, delta) => {
      this.changeZoom(delta, x, y);
    });

    // /*------------PAN */

    this._paper.on("blank:pointerdown", (event, x, y) => {
      this.dragStartPosition = { x: x, y: y };
      this.isPanning = spaceDown;

      if (!ctrlDown) {
        app.$unSelectAllElements();
      }
      // unfocus inputs when clicks
      const focusedInput = document.querySelector("input:focus");
      if (focusedInput) {
        focusedInput.blur();
      }

      // init area selection
      if (!spaceDown && !app.$resizing) {
        app.$initAreaSelection(event);
      }

      if (!app.$resizing) {
        // remove resizer if exists
        app.$removeResizer();
      }
    });

    this._paper.on("cell:pointerup blank:pointerup", () => {
      this.isPanning = false;

      if (!spaceDown) {
        const selectedElements = app.$endAreaSelection(
          this._paper.clientOffset(),
          this._translation,
          this._scale,
          app.elements
        );

        if (selectedElements) {
          app.$selectElements({ elements: selectedElements });
        }
      }

      if (app.$resizing) {
        const { boxId, size } = Vue.prototype.$endResize(this._paper);
        app.resizeElementByBoxId(boxId, size);
      }
    });

    // /*------------MOVE */

    document
      .querySelector(INTERFACE_ROOT)
      .addEventListener("mousemove", event => {
        if (this.isPanning) {
          const currentScale = this._paper.scale();
          const newX =
            event.offsetX / currentScale.sx - this.dragStartPosition.x;
          const newY =
            event.offsetY / currentScale.sy - this.dragStartPosition.y;
          this.translate(newX, newY);
        }

        // area selection
        if (!spaceDown && app.$areaSelection.active) {
          app.$computeAreaSelection();
        }
      });

    // /*------------LINK EVENTS */

    this._paper.on("link:mouseenter", linkView => {
      const tools = new joint.dia.ToolsView({
        tools: [
          new joint.linkTools.TargetArrowhead(),
          new joint.linkTools.Remove({
            distance: -30,
            action: function() {
              this.model.remove({ ui: true, tool: this.cid });
              app.deleteLinkFromApp({ link: this.model });
            }
          })
        ]
      });
      linkView.addTools(tools);
    });

    this._paper.on("link:mouseleave", linkView => {
      linkView.removeTools();
    });

    this._paper.on("link:connect", linkView => {
      app.addLinkFromApp({ link: linkView.model.attributes });
    });

    this._paper.on(
      "link:connect link:disconnect",
      (linkView, evt, elementView) => {
        const element = elementView.model;
        element.attributes.getInPorts(element).forEach(function(port) {
          const portNode = elementView.findPortNode(port.id, PORT_SELECTOR);
          elementView.unhighlight(portNode, {
            highlighter: THEME.magnetAvailabilityHighlighter
          });
        });
      }
    );

    /**SELECTION*/

    this._paper.on("element:pointerdown", (cellView, e) => {
      if (cellView.model.attributes.class != "resizer") {
        // if control key is not hold, a different
        // the current selection is reset

        if (!ctrlDown) {
          app.$unSelectAllElements();
        }

        app.addElementToSelection(cellView);
      } else {
        app.$initResize(e);
      }
    });

    this._paper.on("element:pointerup", () => {
      if (this._isElementchangePosition) {
        this._isElementchangePosition = false;
        app.$moveSelectedElements({ graph: Graph.graph });
      }
    });

    // /**CONTEXT MENU*/

    this._paper.on("element:contextmenu", (cellView, evt, x, y) => {
      evt.preventDefault();

      // if control key is not hold, a different
      // the current selection is reset
      if (!ctrlDown) {
        app.$unSelectAllElements();
      }

      app.addElementToSelection(cellView);
      contextMenu.setPositionToContextMenu(CONTEXT_MENU_ELEMENT, { x, y });
      return false;
    });

    this._paper.on("blank:contextmenu", (evt, x, y) => {
      evt.preventDefault();

      contextMenu.setPositionToContextMenu(CONTEXT_MENU_PAPER, { x, y });
      return false;
    });
  }

  centerBoxByBoxId(boxId) {
    const el = Graph.getElementByBoxId(boxId);
    const bbox = el.getBBox();
    const {
      left,
      top,
      width,
      height
    } = this._paper.svg.getBoundingClientRect();
    const canvasDimensions = this._paper.clientToLocalRect({
      x: left,
      y: top,
      width,
      height
    });
    this.translate(
      -bbox.x + canvasDimensions.width / 2 - bbox.width / 2,
      -bbox.y + canvasDimensions.height / 2 - bbox.height / 2
    );

    // highlight element
    this.$addUniqueElementToSelection(el.findView(this._paper));
  }

  translate(newX, newY) {
    this._paper.translate(newX * this._scale, newY * this._scale);
    this._translation = this._paper.translate();
  }

  findViewInPaper(el) {
    return el.findView(this._paper);
  }

  // helper function to find an empty position to add
  // an element without overlapping other ones
  // it tries to fill the canvas view first horizontally
  // then vertically
  findEmptyPosition(size, startingPoint) {
    const {
      left,
      top,
      width,
      height
    } = this._paper.svg.getBoundingClientRect();
    const canvasDimensions = this._paper.clientToLocalRect({
      x: left,
      y: top,
      width,
      height
    });

    const { x: canvasX, y: canvasY, width: canvasW } = canvasDimensions;
    const position = startingPoint
      ? startingPoint
      : { x: canvasX + BOX_MARGIN, y: canvasY + BOX_MARGIN };
    const { width: sizeWidth, height: sizeHeight } = size;

    while (
      Graph.graph.findModelsInArea({
        ...position,
        width: sizeWidth + BOX_MARGIN,
        height: sizeHeight + BOX_MARGIN
      }).length
    ) {
      position.x += sizeWidth + BOX_MARGIN;
      if (canvasX + canvasW < position.x + sizeWidth) {
        position.x = canvasX + BOX_MARGIN;
        position.y += sizeHeight + BOX_MARGIN;
      }
    }

    return position;
  }

  computeCenterPosition() {
    const bcr = this._paper.svg.getBoundingClientRect();
    const localRect1 = this._paper.clientToLocalRect({
      x: bcr.left,
      y: bcr.top,
      width: bcr.width,
      height: bcr.height
    });
    const { x, y } = localRect1.center();
    return { x, y };
  }

  /**
   * zoom out by a certain amount
   */
  zoomOut() {
    const nextScale = this._scale - 2 / ZOOM_STEP;
    const position = this.computeCenterPosition();
    this.changeZoom(1, position.x, position.y, nextScale);
  }

  /**
   * zoom in by a certain amount
   */
  zoomIn() {
    const nextScale = this._scale + 2 / ZOOM_STEP;
    const position = this.computeCenterPosition();
    this.changeZoom(1, position.x, position.y, nextScale);
  }

  setZoom(nextScale) {
    const position = this.computeCenterPosition();
    this.changeZoom(1, position.x, position.y, nextScale);
  }

  /**
   * zoom by delta, in the direction of delta,
   * centered at thisX, thisY
   *
   * if stateScale is not defined, the next scale is computed using
   * delta and the current scale value
   */
  changeZoom(delta, thisX, thisY, stateScale) {
    const nextScale = !stateScale
      ? this._scale + delta / ZOOM_STEP // the current paper scale changed by delta
      : stateScale;

    if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
      this._scale = nextScale;
      this.mouseX = thisX;
      this.mouseY = thisY;
    }
  }

  /**
   * change scale to fit content
   *
   */
  fitContent() {
    this._paper.scaleContentToFit({
      minScaleX: MIN_SCALE,
      minScaleY: MIN_SCALE,
      maxScaleX: MAX_SCALE,
      maxScaleY: MAX_SCALE
    });

    // @TODO bounds

    this._scale = this._paper.scale().sx;
  }

  /**
   * change scale to currentScale
   */
  // zoom algorithm: https://github.com/clientIO/joint/issues/1027
  changeScale(nextScale, currentScale) {
    if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
      const beta = currentScale / nextScale;

      const ax = this.mouseX - this.mouseX * beta;
      const ay = this.mouseY - this.mouseY * beta;

      this._translation = this._paper.translate();

      const nextTx = this._translation.tx - ax * nextScale;
      const nextTy = this._translation.ty - ay * nextScale;

      this._paper.translate(nextTx, nextTy);

      const ctm = this._paper.matrix();

      ctm.a = nextScale;
      ctm.d = nextScale;

      this._paper.matrix(ctm);
    }
  }
}

export default new Paper();
