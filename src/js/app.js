import Vue from "vue";
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
import {
  Inputs,
  CATEGORY_SERVICE,
  CATEGORY_DATATEST
} from "./constants/constants";
import { addElementByName, addLinkFromLink } from "./elements/addElement";
import { deleteElementByBoxId, deleteLink } from "./elements/deleteElement";
import { resizeElements } from "./elements/resizeElement";
import { initKeyboardEvents } from "./events/keyboardEvents";
import { initTour } from "./utils/walkthrough";
import {
  setInputValueInElement,
  setSelectValueInElement
} from "./layout/inputs";
import { equalObjects } from "./utils/utils";
import {
  selectedElements,
  copiedElements,
  deletedElements,
  currentElements,
  currentDataElements
} from "./store/modules/utils";
import { moveElements } from "./elements/moveElement";
import ZoomPlugin from "./plugins/ZoomPlugin";
import AreaSelectionPlugin from "./plugins/AreaSelectionPlugin";
import ResizePlugin from "./plugins/ResizePlugin";
import { addDataBox } from "./elements/addDataElement";
import { initPaper } from "./layout/initPaper";
import { initSplit } from "./layout/split";

export let app;

(async () => {
  await initWebservices();
  Vue.use(ZoomPlugin);
  Vue.use(ResizePlugin);
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
      elementsData() {
        return this.elements;
      },
      currentDataElements() {
        return currentDataElements(this.elementsData);
      },
      currentElements() {
        return currentElements(this.elementsData);
      },
      selectedElements() {
        return selectedElements(this.elementsData);
      },
      copiedElements() {
        return copiedElements(this.elementsData);
      },
      deletedElements() {
        return deletedElements(this.elementsData);
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
      resizedElements() {
        return this.elements.map(({ boxId, size }) => {
          return { boxId, size };
        });
      },
      scale() {
        return this.$zoom.scale;
      },
      dataElements() {
        return this.dataTest;
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
      deleteElementByCellView(cellView) {
        const boxId = cellView.model.attributes.boxId;
        this.deleteElements({
          elements: [this.elements.find(el => el.boxId == boxId)]
        });
      },
      zoomInFromApp() {
        this.$zoomIn(this.paper);
      },
      zoomOutFromApp() {
        this.$zoomOut(this.paper);
      },
      resizeElementByBoxId(boxId, size) {
        const element = this.elements.find(el => el.boxId == boxId);
        this.resizeElement({ element, size });
      },
      ...mapActions("Interface", [
        "unSelectAllElements",
        "clearElements",
        "selectAllElements",
        "addElementToSelection",
        "copySelectedElements",
        "duplicateElements",
        "deleteElements",
        "setSelectValueInElement",
        "setInputValueInElement",
        "addLink",
        "deleteLink",
        "moveSelectedElements",
        "resizeElement",
        "openWorkflow",
        "updateDataInDataElement"
      ])
    },
    watch: {
      currentElements: {
        handler(newValue, oldValue) {
          // if boxId element does not exist in the graph, we add it
          for (const el of newValue.filter(
            ({ boxId }) => !getElementByBoxId(boxId)
          )) {
            const { type, category } = el;
            switch (category) {
              case CATEGORY_SERVICE:
                addElementByName(type, el);
                break;
              case CATEGORY_DATATEST:
                addDataBox(el);
                break;
              default:
                console.log("ERROR ADDING EL");
            }
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
      resizedElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = newValue.filter(el => {
            const v = oldValue.find(e => e.boxId == el.boxId);
            return v && !equalObjects(v.size, el.size);
          });
          resizeElements(difference, this.paper);
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
        this.$changePaperScale(this.paper, nextScale, currentScale);
      }
    },
    mounted() {
      this.paper = initPaper(this.graph);

      this.$nextTick(() => {
        initPaperEvents();
        initKeyboardEvents();
      });

      initSplit();

      console.log(this.paper.svg);
      initTour();
    }
  });
})();
