import cloneDeep from "lodash.clonedeep";

class UndoRedoHistory {
  constructor() {
    this.store = null;
    this.history = [];
    this.currentIndex = -1;
  }

  init(store) {
    this.store = store;
  }

  addState(state) {
    // may be we have to remove redo steps
    if (this.currentIndex + 1 < this.history.length) {
      this.history.splice(this.currentIndex + 1);
    }
    this.history.push(state);
    this.currentIndex++;
    console.log("HISTORY ->", this.history[this.currentIndex]);
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
      console.log("HISTORY ->", this.history[this.currentIndex]);
    }
  }

  redo() {
    if (this.currentIndex + 1 < this.history.length) {
      const nextState = this.history[this.currentIndex + 1];
      console.log(nextState);
      this.store.replaceState(cloneDeep(nextState));
      this.currentIndex++;
    }
  }
}

export default new UndoRedoHistory();
