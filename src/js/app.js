import Vue from "vue";
import * as joint from "jointjs";
import { mapActions, mapState } from "vuex";
import plugins from "./plugins";
import components from "./layout/components";
import store from "./store/store";
import { DivaServices } from "divaservices-utils";
import { initWebservices } from "./constants/globals";
import { initPaperEvents } from "./events/paperEvents";
import { getElementByBoxId, getLinkBySourceTarget } from "./layout/utils";
import { highlightSelection, unHighlight } from "./store/modules/highlight";
import { CATEGORY_SERVICE, CATEGORY_DATATEST } from "./constants/constants";
import { addElementFromName, addLinkFromLink } from "./elements/addElement";
import { deleteElementByBoxId, deleteLink } from "./elements/deleteElement";
import { resizeElements } from "./elements/resizeElement";
import {
  setInputValueInElement,
  setSelectValueInElement
} from "./layout/inputs";
import {
  equalObjects,
  findDifferenceBy,
  getNewElements,
  getDeletedElements,
  getNewLinks,
  getElementsInGraph
} from "./utils/utils";
import {
  selectedElements,
  copiedElements,
  deletedElements,
  currentElements,
  currentDataElements
} from "./store/modules/utils";
import { moveElements } from "./elements/moveElement";
import { addDataBox } from "./elements/addDataElement";
import { initPaper } from "./layout/initPaper";
import { initSplit } from "./layout/split";
import { initKeyboardEvents } from "./events/keyboardEvents";
import { initTour } from "./utils/walkthrough";
import { readWorkflow } from "./workflows/readWorkflow";

export let app;

(async () => {
  await initWebservices();

  plugins.forEach(x => Vue.use(x));

  app = new Vue({
    el: "#app",
    store,
    data: {
      graph: new joint.dia.Graph(),
      paper: null,
      translation: { tx: 0, ty: 0 },
      workflowId: undefined
    },
    components,
    computed: {
      // this computed method is necessary since we shouldn't
      // listen to the store directly
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
        this.$addElementToSelection(cellView);
      },
      translate(newX, newY) {
        this.paper.translate(newX * this.scale, newY * this.scale);
        this.translation = this.paper.translate();
      },
      addLinkFromApp(payload) {
        this.$addLink({ ...payload, graph: this.graph });
      },
      deleteLinkFromApp(payload) {
        this.$deleteLink({ ...payload, graph: this.graph });
      },
      deleteElementByCellView(cellView) {
        const boxId = cellView.model.attributes.boxId;
        this.$deleteElements({
          elements: [this.elements.find(el => el.boxId === boxId)]
        });
      },

      /**
       * zoom call
       */
      zoomInFromApp() {
        this.$zoomIn(this.paper);
      },
      zoomOutFromApp() {
        this.$zoomOut(this.paper);
      },

      resizeElementByBoxId(boxId, size) {
        const element = this.elements.find(el => el.boxId === boxId);
        this.$resizeElement({ element, size });
      },
      ...mapActions("Interface", [
        "$unSelectAllElements",
        "$clearElements",
        "$selectAllElements",
        "$addElementToSelection",
        "$addUniqueElementToSelection",
        "$copySelectedElements",
        "$duplicateElements",
        "$deleteElements",
        "$setSelectValueInElement",
        "$setInputValueInElement",
        "$setTextValueInElement",
        "$addLink",
        "$deleteLink",
        "$moveSelectedElements",
        "$resizeElement",
        "$openWorkflow",
        "$updateDataInDataElement",
        "$selectElements"
      ])
    },
    watch: {
      /**
       * watches current elements
       * add new elements, remove deleted elements
       */
      currentElements: {
        handler(newValue, oldValue) {
          // if boxId element does not exist in the graph, we add it
          for (const el of getNewElements(newValue)) {
            const { type, category } = el;
            switch (category) {
              case CATEGORY_SERVICE:
                addElementFromName(type, el);
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
          for (const el of getDeletedElements(oldValue, newValue)) {
            deleteElementByBoxId(el.boxId);
          }
        }
      },

      /**
       * watches current data elements
       * current state: debug
       */
      currentDataElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = findDifferenceBy(newValue, oldValue, "boxId");
          console.log("TCL: handler -> difference", difference);
          // for (const { boxId, defaultParams } of difference) {
          //   setSelectValueInElement(...);
          //   setInputValueInElement(...);
          // }
        }
      },
      /**
       * watch parameters of elements
       * on direct changes, nothing changes (mechanic operation)
       * only apply changes on undo-redo
       */
      defaultParamsElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = findDifferenceBy(
            newValue,
            oldValue,
            "defaultParams"
          );
          for (const box of difference) {
            setSelectValueInElement(box);
            setInputValueInElement(box);
          }
        }
      },
      /**
       * watch moved elements
       * on direct move operation, nothing changes (mechanic operation)
       * only apply changes on undo-redo
       */
      movedElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = findDifferenceBy(newValue, oldValue, "position");
          moveElements(difference);
        }
      },
      /**
       * watch moved elements
       * on direct resize operation, nothing changes (mechanic operation)
       * only apply changes on undo-redo
       */
      resizedElements: {
        deep: true,
        handler(newValue, oldValue) {
          const difference = findDifferenceBy(newValue, oldValue, "size");
          resizeElements(difference);
        }
      },
      /**
       * watch links
       * on direct operation, nothing changes (mechanic operation)
       * on start, add parsed links
       * apply changes on undo-redo
       */
      links(newValue, oldValue) {
        for (const l of getNewLinks(newValue)) {
          addLinkFromLink(l);
        }

        // remove links removed from arr
        // cannot use arr.includes because states are deep cloned
        for (const el of oldValue.filter(
          el => newValue.filter(v => equalObjects(v, el)).length === 0
        )) {
          const link = getLinkBySourceTarget(el.source, el.target);
          deleteLink(link);
        }
      },
      /**
       * watches deleted elements
       */
      deletedElements(newValue) {
        // if element is not in elements but exist in graph, delete it
        // @TODO: optimize ?
        for (const element of getElementsInGraph(newValue)) {
          deleteElementByBoxId(element.boxId);
        }
      },
      /**
       * watches selected elements
       */
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
      /**
       * watches paper scale
       */
      scale(nextScale, currentScale) {
        this.$changePaperScale(this.paper, nextScale, currentScale);
      }
    },
    mounted() {
      this.paper = initPaper(this.graph);

      this.$nextTick(() => {
        // init events
        initPaperEvents();
        initKeyboardEvents(); // WARNiNG promise

        // retrieve workflow id
        const id = DivaServices.getUrlParameters().id;
        if (!isNaN(id)) {
          this.workflowId = id;
          readWorkflow(id);
        } else {
          throw "Error with id " + id;
        }
      });

      // initialize rezisable split
      initSplit();

      // init tutorial tour
      initTour();
    }
  });
})();
