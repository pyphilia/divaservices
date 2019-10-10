import Vue from "vue";
import Split from "split.js";
import * as joint from "jointjs";
import { mapMutations, mapActions, mapState } from "vuex";
import Toolsbar from "./layout/components/Toolsbar";
import FileMenu from "./layout/components/FileMenu";
import LeftSidebar from "./layout/components/LeftSidebar";
import ContextMenus from "./layout/components/ContextMenu";
import Minimap from "./layout/components/Minimap";
import store from "./store/store";
import { initWebservices } from "./constants/globals";
import { initPaperEvents } from "./events/paperEvents";
import { getElementByBoxId } from "./layout/utils";
import {
  highlightSelection,
  unHighlight
} from "./store/modules/Selection/mutations";
import { MAX_SCALE, MIN_SCALE, Inputs, THEME } from "./constants/constants";
import { addElementByName } from "./elements/addElement";
import { deleteElementByBoxId } from "./elements/deleteElement";
import { initKeyboardEvents } from "./events/keyboardEvents";
import {
  INTERFACE_ROOT,
  IN_PORT_CLASS,
  ATTR_TYPE,
  ATTR_TYPE_ALLOWED,
  LEFT_SIDEBAR,
  MAIN_INTERFACE
} from "./constants/selectors";
import {
  setInputValueInElement,
  setSelectValueInElement
} from "./layout/inputs";
import { equalObjects } from "./utils/utils";

// matching algorithm for ports to be linked and highlighted
/* eslint-disable-next-line no-unused-vars */
const validateConnection = (vS, mS, vT, mT, end, lV) => {
  if (!mT) {
    return false;
  }
  if (vS === vT) {
    return false;
  }
  if (mT.getAttribute("port-group") !== IN_PORT_CLASS) {
    return false;
  }

  // input accept only one source
  const usedInPorts = vT.model.attributes.getUsedInPorts();
  const matchId = usedInPorts.find(({ id }) => id === mT.getAttribute("port"));
  if (matchId) {
    return false;
  }

  // allow only same input-output type
  if (
    mT.getAttribute(ATTR_TYPE) === undefined ||
    mS.getAttribute(ATTR_TYPE) === undefined
  ) {
    return false;
  }

  // check allowed type
  const allowedS = mS.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const allowedT = mT.getAttribute(ATTR_TYPE_ALLOWED).split(",");
  const commonType = allowedS.filter(value => -1 !== allowedT.indexOf(value));
  if (commonType.length == 0) {
    return false;
  }

  return true;
};

export let app;

(async () => {
  await initWebservices();
  app = new Vue({
    el: "#app",
    store,
    data: {
      graph: new joint.dia.Graph(),
      paper: null,
      translation: { tx: 0, ty: 0 }
    },
    computed: {
      ...mapState("Interface", ["elements", "areaSelection"]),
      ...mapState("Zoom", ["scale", "x", "y"]),
      ...mapState("Keyboard", ["ctrl", "space"]),
      currentElements() {
        return this.elements.filter(el => !el.deleted);
      },
      selectedElements() {
        return this.elements.filter(el => el.selected && !el.deleted);
      },
      copiedElements() {
        return this.elements.filter(el => el.copied);
      },
      deletedElements() {
        return this.elements.filter(el => el.deleted);
      },
      defaultParamsElements() {
        return this.elements.map(({ boxId, defaultParams }) => {
          return { boxId, defaultParams };
        });
      }
    },
    components: {
      LeftSidebar,
      Minimap,
      Toolsbar,
      FileMenu,
      ContextMenus
    },
    methods: {
      unSelectAllElements() {
        this.unSelectAllElements();
      },
      addElementToSelection(cellView) {
        this.addElementToSelection(cellView);
      },
      translate(newX, newY) {
        this.paper.translate(newX * this.scale, newY * this.scale);
        this.translation = this.paper.translate();
      },
      zoomInFromApp() {
        this.zoomIn({ paper: this.paper });
      },

      zoomOutFromApp() {
        this.zoomOut({ paper: this.paper });
      },
      ...mapActions("Interface", [
        "unSelectAllElements",
        "addElementToSelection",
        "copySelectedElements",
        "duplicateElements",
        "deleteElements",
        "setSelectValueInElement",
        "setInputValueInElement"
      ]),
      ...mapActions("Zoom", ["zoomIn", "zoomOut"]),
      ...mapMutations("Interface", [
        "initAreaSelection",
        "endAreaSelection",
        "computeAreaSelection"
      ]),
      ...mapMutations("Zoom", ["CHANGE_ZOOM"])
    },
    watch: {
      currentElements: {
        handler(newValue, oldValue) {
          // if boxId element does not exist in the graph, we add it
          for (const el of newValue.filter(
            ({ boxId }) => !getElementByBoxId(boxId)
          )) {
            const { type } = el;
            addElementByName(type, el);
          }

          // remove element removed from arr
          // cannot use arr.includes because states are deep cloned
          for (const el of oldValue.filter(
            el => newValue.filter(v => v.boxId == el.boxId).length == 0
          )) {
            deleteElementByBoxId(el.boxId);
          }
        }
      },
      defaultParamsElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = newValue.filter(el => {
            const v = oldValue.find(e => e.boxId == el.boxId);
            return v && !equalObjects(v.defaultParams, el.defaultParams);
          });
          for (const param of difference) {
            setSelectValueInElement(
              param.boxId,
              param.defaultParams[Inputs.SELECT.type]
            );
            setInputValueInElement(
              param.boxId,
              param.defaultParams[Inputs.NUMBER.type]
            );
          }
        }
      },
      deletedElements(newValue) {
        // if element is not in elements but exist in graph, delete it
        for (const element of newValue.filter(el =>
          getElementByBoxId(el.boxId)
        )) {
          deleteElementByBoxId(element.boxId);
        }
      },
      selectedElements(newValue, oldValue) {
        //@TODO optimize
        const cellViews = newValue.map(({ boxId, selected }) => [
          getElementByBoxId(boxId).findView(this.paper),
          selected
        ]);
        for (const [cellView, selected] of cellViews) {
          if (selected) {
            highlightSelection(cellView);
          }
        }
        // remove unselected element if not deleted
        for (const { boxId } of oldValue.filter(el => !newValue.includes(el))) {
          const el = getElementByBoxId(boxId);
          if (el) {
            const cellView = el.findView(this.paper);
            unHighlight(cellView);
          }
        }
      },
      scale(nextScale, currentScale) {
        if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
          const beta = currentScale / nextScale;

          const ax = this.x - this.x * beta;
          const ay = this.y - this.y * beta;

          const translate = this.paper.translate();

          const nextTx = translate.tx - ax * nextScale;
          const nextTy = translate.ty - ay * nextScale;

          this.paper.translate(nextTx, nextTy);

          const ctm = this.paper.matrix();

          ctm.a = nextScale;
          ctm.d = nextScale;

          this.paper.matrix(ctm);
        }
        // app.activity = true;
      }
    },
    mounted() {
      this.paper = new joint.dia.Paper({
        el: document.querySelector(INTERFACE_ROOT),
        model: this.graph,
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
        /*eslint no-unused-vars: ["error", { "args": "none" }]*/
        validateConnection
      });

      this.paper.options.highlighting.magnetAvailability =
        THEME.magnetAvailabilityHighlighter;

      this.$nextTick(() => {
        initPaperEvents();
        initKeyboardEvents();
        console.log(this);
      });

      Split([LEFT_SIDEBAR, MAIN_INTERFACE], {
        elementStyle: function(dimension, size, gutterSize) {
          return { "flex-basis": "calc(" + size + "% - " + gutterSize + "px)" };
        },
        minSize: [300, 500],
        sizes: [25, 75],
        gutterSize: 6
      });
    }
  });
})();
