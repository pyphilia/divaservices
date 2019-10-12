import cloneDeep from "lodash.clonedeep";
import { equalObjects } from "../../utils/utils";

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
      // console.log(this.history);
      // console.log("HISTORY ->", this.history[this.currentIndex]);
    }
  }

  replaceLastState(state) {
    this.history.splice(-1);
    this.history.push(state);
    // console.log("HISTORY ->", this.history[this.currentIndex]);
  }

  undo() {
    if (this.currentIndex > 0) {
      // base state
      const prevState = this.history[this.currentIndex - 1];
      // take a copy of the history state
      // because it would be changed during store mutations
      // what would corrupt the undo-redo-history
      // (same on redo)
      this.store.replaceState(cloneDeep(prevState));
      this.currentIndex--;
    }
  }

  redo() {
    if (this.currentIndex + 1 < this.history.length) {
      const nextState = this.history[this.currentIndex + 1];
      this.store.replaceState(cloneDeep(nextState));
      this.currentIndex++;
    }
  }
}

export default new UndoRedoHistory();
