/**
 * History stack
 */

import { cloneDeep } from "lodash";
import {
  equalObjects,
  findDifferenceBy,
  getDeletedElements
} from "../../utils/utils";
import {
  setSelectValueInElement,
  setInputValueInElement
} from "../../layout/inputs";
import { moveElements } from "../../elements/moveElement";
import { resizeElements } from "../../elements/resizeElement";
import { deleteElementByBoxId, deleteLink } from "../../elements/deleteElement";
import Graph from "../../classes/Graph";

class UndoRedoHistory {
  constructor() {
    this.store = null;
    this.history = [];
    this.currentIndex = -1;
  }

  init(store) {
    this.store = store;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex + 1 < this.history.length;
  }

  addState(state) {
    // maybe we have to remove redo steps
    if (this.currentIndex + 1 < this.history.length) {
      this.history.splice(this.currentIndex + 1);
    }
    if (!equalObjects(state, this.history[this.currentIndex])) {
      this.history.push(state);
      this.currentIndex++;
    }
  }

  replaceLastState(state) {
    this.history.splice(-1);
    this.history.push(state);
  }

  undo() {
    if (this.currentIndex > 0) {
      // base state
      const prevState = this.history[this.currentIndex - 1];
      // take a copy of the history state
      // because it would be changed during store mutations
      // what would corrupt the undo-redo-history
      // (same on redo)
      this.reportChanges(this.store.state, this.history[this.currentIndex - 1]);

      this.store.replaceState(cloneDeep(prevState));
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex + 1 < this.history.length) {
      const nextState = this.history[this.currentIndex + 1];

      this.reportChanges(this.history[this.currentIndex], nextState);

      this.store.replaceState(cloneDeep(nextState));
      this.currentIndex++;
    }
  }

  reportChanges(prevState, nextState) {
    const { elements: prevElements, links: prevLinks } = prevState.Interface;
    const { elements: nextElements, links: nextLinks } = nextState.Interface;

    /**
     * watch parameters of elements
     * on direct changes, nothing changes (mechanic operation)
     * only apply changes on undo-redo
     */
    // check params diff
    const paramsDifference = findDifferenceBy(
      nextElements,
      prevElements,
      "defaultParams"
    );

    for (const box of paramsDifference) {
      setSelectValueInElement(box);
      setInputValueInElement(box);
    }

    /**
     * watch moved elements
     * on direct move operation, nothing changes (mechanic operation)
     * only apply changes on undo-redo
     */
    const moveDifference = findDifferenceBy(
      nextElements,
      prevElements,
      "position"
    );
    moveElements(moveDifference);

    /**
     * watch moved elements
     * on direct resize operation, nothing changes (mechanic operation)
     * only apply changes on undo-redo
     */
    const resizeDifference = findDifferenceBy(
      nextElements,
      prevElements,
      "size"
    );
    resizeElements(resizeDifference);

    // remove links removed from arr
    // cannot use arr.includes because states are deep cloned
    for (const el of prevLinks.filter(
      el => nextLinks.filter(v => equalObjects(v, el)).length === 0
    )) {
      const link = Graph.getLinkBySourceTarget(el.source, el.target);
      deleteLink(link);
    }

    // remove element removed from arr
    // cannot use arr.includes because states are deep cloned
    for (const el of getDeletedElements(prevElements, nextElements)) {
      deleteElementByBoxId(el.boxId);
    }
  }
}

export default new UndoRedoHistory();
