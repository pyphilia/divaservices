import { BOX_HIGHLIGHTER } from "../constants/constants";
import { saveElementsPositionFromCellView } from "../elements/moveElement";

const plugin = {
  install(Vue) {
    Vue.mixin({
      data() {
        return {
          // array of selected elements
          selectedElements: [],

          // array of copied elements
          copiedElements: []
        };
      },
      methods: {
        clearSelection() {
          this.selectedElements = [];
        },
        setCopiedElements() {
          this.copiedElements = this.selectedElements;
        },
        addCellViewToSelection(cellView) {
          if (this.selectedElements.indexOf(cellView) == -1) {
            this.selectedElements.push(cellView);
          }
          this.highlightSelection(cellView);
          saveElementsPositionFromCellView(this.selectedElements);
        },
        addCellViewsToSelection(cellViews) {
          for (const cellView of cellViews) {
            this.highlightSelection(cellView);
            this.addCellViewToSelection(cellView);
          }
          saveElementsPositionFromCellView(this.selectedElements);
        },
        removeElementFromSelection(cellView, index) {
          if (!index) {
            index = this.selectedElements.indexOf(cellView);
          }
          this.selectedElements.splice(index, 1);
          this.unHighlight(cellView);
        },
        toggleCellViewInSelection(cellView) {
          const index = this.selectedElements.indexOf(cellView);
          if (index == -1) {
            this.addCellViewToSelection(cellView);
          } else {
            this.removeElementFromSelection(cellView, index);
          }
        },
        highlightSelection(cellView) {
          if (cellView) {
            cellView.highlight(null, BOX_HIGHLIGHTER);
          }
        },
        highlightAllSelected() {
          for (const el of this.selectedElements) {
            this.highlightSelection(el);
          }
        },
        unHighlight(cellView) {
          cellView.unhighlight(null, BOX_HIGHLIGHTER);
        },
        unHighlightAllSelected() {
          // do not use unHighlightSelection to remove the array once
          for (const el of this.selectedElements) {
            this.unHighlight(el);
          }
        },
        unSelectAll() {
          this.unHighlightAllSelected();
          this.clearSelection();
        },
        resetHighlight() {
          if (this.selectedElements.length) {
            this.unHighlightAllSelected();
            this.highlightAllSelected();
          }
        }
      }
    });
  }
};

export default plugin;
