import Vue from "vue";
import { mapActions, mapState } from "vuex";
import plugins from "./plugins";

import Graph from "./classes/Graph";
import Paper from "./classes/Paper";

import components from "./layout/components";
import store from "./store/store";
import { DivaServices } from "divaservices-utils";
import { initWebservices } from "./constants/globals";
import { highlightSelection, unHighlight } from "./store/modules/highlight";
import { CATEGORY_SERVICE, CATEGORY_DATATEST } from "./constants/constants";
import { addElementFromName, addLinkFromLink } from "./elements/addElement";
import { deleteElementByBoxId, deleteLink } from "./elements/deleteElement";
import { resizeElements } from "./elements/resizeElement";
import {
  equalObjects,
  findDifferenceBy,
  getDeletedElements
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
import { initSplit } from "./layout/split";
import { initKeyboardEvents } from "./events/keyboardEvents";
import { initTour } from "./utils/walkthrough";
import { openWorkflow } from "./workflows/openWorkflow";
import UndoRedoHistory from "./store/plugins/UndoRedoHistory";
import { fireAlert } from "./utils/alerts";
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_COPY_ERROR
} from "./constants/messages";
import { saveWorkflow } from "./workflows/saveWorkflow";

export let app;

(async () => {
  await initWebservices();

  plugins.forEach(x => Vue.use(x));

  app = new Vue({
    el: "#app",
    store,
    components,
    data: {
      paper: Paper, // in order to watch translation
      workflowId: undefined
    },
    computed: {
      translation() {
        return Paper.translation;
      },
      scale() {
        return Paper.scale;
      },
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
      dataElements() {
        return this.dataTest;
      },
      ...mapState("Interface", ["elements", "links"]),
      ...mapState("Keyboard", ["ctrl", "space"])
    },
    methods: {
      copy() {
        if (selectedElements.length) {
          this.$copySelectedElements();
          fireAlert("success", MESSAGE_COPY_SUCCESS);
        } else {
          fireAlert("danger", MESSAGE_COPY_ERROR);
        }
      },
      saveWorkflow(installation = true) {
        // @TODO receive response and fire correct alert
        saveWorkflow(
          {
            elements: this.currentElements,
            links: this.links,
            workflowId: this.workflowId
          },
          this.$refs.log.messages,
          installation
        ); // WARNING: promise

        fireAlert("success", MESSAGE_SAVE_SUCCESS);
      },
      canUndo() {
        return UndoRedoHistory.canUndo();
      },
      canRedo() {
        return UndoRedoHistory.canRedo();
      },
      redo() {
        UndoRedoHistory.redo();
      },
      undo() {
        UndoRedoHistory.undo();
      },

      addElementToSelection(cellView) {
        this.$addElementToSelection(cellView);
      },
      addLinkFromApp(payload) {
        this.$addLink({ ...payload });
      },
      deleteLinkFromApp(payload) {
        this.$deleteLink({ ...payload });
      },
      deleteElementByCellView(cellView) {
        const boxId = cellView.model.attributes.boxId;
        this.$deleteElements({
          elements: [this.elements.find(el => el.boxId === boxId)]
        });
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
          for (const el of Graph.getNewElements(newValue)) {
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
          for (const el of difference) {
            console.log(el);
            // const { boxId, defaultParams } = el;
            // @TODO: suppose one image
            // updateImgPreview(this.id, data);
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
        for (const l of Graph.getNewLinks(newValue)) {
          addLinkFromLink(l);
        }

        // remove links removed from arr
        // cannot use arr.includes because states are deep cloned
        for (const el of oldValue.filter(
          el => newValue.filter(v => equalObjects(v, el)).length === 0
        )) {
          const link = Graph.getLinkBySourceTarget(el.source, el.target);
          deleteLink(link);
        }
      },
      /**
       * watches deleted elements
       */
      deletedElements(newValue) {
        // if element is not in elements but exist in graph, delete it
        // @TODO: optimize ?
        for (const element of Graph.getElementsInGraph(newValue)) {
          deleteElementByBoxId(element.boxId);
        }
      },
      /**
       * watches selected elements
       */
      selectedElements(newValue, oldValue) {
        // highlight current selection
        for (const { boxId } of newValue) {
          const cellView = Paper.findViewInPaper(
            Graph.getElementByBoxId(boxId)
          );
          highlightSelection(cellView);
        }
        // remove unselected element if not deleted
        for (const { boxId } of oldValue.filter(el => !newValue.includes(el))) {
          const el = Graph.getElementByBoxId(boxId);

          // on delete, these might be still be selected
          if (el) {
            const cellView = Paper.findViewInPaper(el);
            unHighlight(cellView);
          }
        }
      },
      /**
       * watches paper scale
       */
      scale(nextScale, currentScale) {
        Paper.changeScale(nextScale, currentScale);
      }
    },
    async mounted() {
      Paper.initPaper(this, Graph.graph);

      initKeyboardEvents(this); // WARNiNG promise

      // retrieve workflow id
      const id = DivaServices.getUrlParameters().id;
      if (!isNaN(id)) {
        this.workflowId = id;
        const workflow = await openWorkflow(id);
        this.$openWorkflow(workflow);
      } else {
        throw "Error with id " + id;
      }

      // initialize rezisable split
      initSplit();

      // init tutorial tour
      initTour();
    }
  });
})();
