import Vue from "vue";
import { mapActions, mapState } from "vuex";

import Graph from "./classes/Graph";
import Paper from "./classes/Paper";

import components from "./components";
import store from "./store/store";
import { DivaServices } from "divaservices-utils";
import { initWebservices } from "./utils/globals";
import {
  selectedElements,
  copiedElements,
  currentElements,
  currentDataElements
} from "./store/modules/utils";
import { initSplit } from "./utils/split";
import { initTour } from "./utils/walkthrough";
import { openWorkflow } from "./workflows/openWorkflow";
import UndoRedoHistory from "./store/plugins/UndoRedoHistory";
import { fireAlert } from "./utils/alerts";
import {
  MESSAGE_SAVE_SUCCESS,
  MESSAGE_COPY_SUCCESS,
  MESSAGE_COPY_ERROR
} from "./utils/messages";
import { saveWorkflow } from "./workflows/saveWorkflow";
import { initKeyboardEvents } from "./events/keyboardEvents";

export let app;

(async () => {
  await initWebservices();

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
      movedElements() {
        return this.currentElements.map(({ boxId, position }) => {
          return { boxId, position };
        });
      },
      dataElements() {
        return this.dataTest;
      },
      logElements() {
        return this.currentElements.map(({ boxId, type, defaultParams }) => ({
          boxId,
          type,
          defaultParams
        }));
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
      addLink(payload) {
        this.$addLink({ ...payload });
      },
      deleteLink(payload) {
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
