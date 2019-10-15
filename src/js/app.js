import Vue from "vue";
import Split from "split.js";
import * as joint from "jointjs";
import { mapActions, mapState } from "vuex";
import Toolsbar from "./layout/components/Toolsbar";
import FileMenu from "./layout/components/FileMenu";
import LeftSidebar from "./layout/components/LeftSidebar";
import ContextMenus from "./layout/components/ContextMenu";
import Minimap from "./layout/components/Minimap";
import store from "./store/store";
import { initWebservices } from "./constants/globals";
import { initPaperEvents } from "./events/paperEvents";
import { getElementByBoxId, getLinkBySourceTarget } from "./layout/utils";
import { highlightSelection, unHighlight } from "./store/modules/highlight";
import { MAX_SCALE, MIN_SCALE, Inputs, THEME } from "./constants/constants";
import { addElementByName, addLinkFromLink } from "./elements/addElement";
import { deleteElementByBoxId, deleteLink } from "./elements/deleteElement";
import { initKeyboardEvents } from "./events/keyboardEvents";
import {
  INTERFACE_ROOT,
  LEFT_SIDEBAR,
  MAIN_INTERFACE
} from "./constants/selectors";
import {
  setInputValueInElement,
  setSelectValueInElement
} from "./layout/inputs";
import { equalObjects } from "./utils/utils";
import { validateConnection } from "./layout/components/utils";
import {
  selectedElements,
  copiedElements,
  deletedElements,
  currentElements
} from "./store/modules/utils";
import { moveElements } from "./elements/moveElement";
import ZoomPlugin from "./plugins/ZoomPlugin";
import AreaSelectionPlugin from "./plugins/AreaSelectionPlugin";

export let app;
export let split;

(async () => {
  await initWebservices();
  Vue.use(ZoomPlugin);
  Vue.use(AreaSelectionPlugin);
  app = new Vue({
    el: "#app",
    store,
    data: {
      graph: new joint.dia.Graph(),
      paper: null,
      translation: { tx: 0, ty: 0 }
    },
    components: {
      LeftSidebar,
      Minimap,
      Toolsbar,
      FileMenu,
      ContextMenus
    },
    computed: {
      // this computed method is necessary since we shouldn't
      // listen to the store directly
      // we should use getters but for some reason (namespace?) it is not working
      currentElements() {
        return currentElements(this.elements);
      },
      selectedElements() {
        return selectedElements(this.elements);
      },
      copiedElements() {
        return copiedElements(this.elements);
      },
      deletedElements() {
        return deletedElements(this.elements);
      },
      defaultParamsElements() {
        return this.elements.map(({ boxId, defaultParams }) => {
          return { boxId, defaultParams };
        });
      },
      movedElements() {
        return this.elements.map(({ boxId, position }) => {
          return { boxId, position };
        });
      },
      scale() {
        return this.$zoom.scale;
      },
      ...mapState("Interface", ["elements", "links"]),
      ...mapState("Keyboard", ["ctrl", "space"])
    },
    methods: {
      addElementToSelection(cellView) {
        this.addElementToSelection(cellView);
      },
      translate(newX, newY) {
        this.paper.translate(newX * this.scale, newY * this.scale);
        this.translation = this.paper.translate();
      },
      addLinkFromApp(payload) {
        this.addLink({ ...payload, graph: this.graph });
      },
      deleteLinkFromApp(payload) {
        this.deleteLink({ ...payload, graph: this.graph });
      },
      zoomInFromApp() {
        this.$zoomIn(this.paper);
      },
      zoomOutFromApp() {
        this.$zoomOut(this.paper);
      },
      ...mapActions("Interface", [
        "unSelectAllElements",
        "selectAllElements",
        "addElementToSelection",
        "copySelectedElements",
        "duplicateElements",
        "deleteElements",
        "setSelectValueInElement",
        "setInputValueInElement",
        "addLink",
        "deleteLink",
        "moveSelectedElements"
      ])
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
            el => !newValue.find(v => v.boxId == el.boxId)
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
      movedElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = newValue.filter(el => {
            const v = oldValue.find(e => e.boxId == el.boxId);
            return v && !equalObjects(v.position, el.position);
          });
          moveElements(difference);
        }
      },
      links(newValue, oldValue) {
        for (const l of newValue) {
          const { source, target } = l;
          const link = getLinkBySourceTarget(source, target);
          if (!link) {
            addLinkFromLink(l);
          }
        }

        // remove links removed from arr
        // cannot use arr.includes because states are deep cloned
        for (const el of oldValue.filter(
          el => newValue.filter(v => equalObjects(v, el)).length == 0
        )) {
          const link = getLinkBySourceTarget(el.source, el.target);
          deleteLink(link);
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
        // highlight current selection
        for (const { boxId } of newValue) {
          const cellView = getElementByBoxId(boxId).findView(this.paper);
          highlightSelection(cellView);
        }
        // remove unselected element if not deleted
        for (const { boxId } of oldValue.filter(el => !newValue.includes(el))) {
          const el = getElementByBoxId(boxId);

          // on delete, these might be still be selected
          if (el) {
            const cellView = el.findView(this.paper);
            unHighlight(cellView);
          }
        }
      },
      scale(nextScale, currentScale) {
        if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
          const beta = currentScale / nextScale;

          const ax = this.$zoom.x - this.$zoom.x * beta;
          const ay = this.$zoom.y - this.$zoom.y * beta;

          const translate = this.paper.translate();

          const nextTx = translate.tx - ax * nextScale;
          const nextTy = translate.ty - ay * nextScale;

          this.paper.translate(nextTx, nextTy);

          const ctm = this.paper.matrix();

          ctm.a = nextScale;
          ctm.d = nextScale;

          this.paper.matrix(ctm);
        }
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
        validateConnection
      });

      this.paper.options.highlighting.magnetAvailability =
        THEME.magnetAvailabilityHighlighter;

      this.$nextTick(() => {
        initPaperEvents();
        initKeyboardEvents();
      });

      split = Split([`#${LEFT_SIDEBAR}`, MAIN_INTERFACE], {
        elementStyle: function(dimension, size, gutterSize) {
          return { "flex-basis": "calc(" + size + "% - " + gutterSize + "px)" };
        },
        minSize: [10, 500],
        sizes: [25, 75],
        gutterSize: 6
      });
    }
  });
})();
