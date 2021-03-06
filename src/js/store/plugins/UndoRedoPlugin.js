/**
 * Undo-Redo Plugin
 */

import { cloneDeep } from "lodash";
import UndoRedoHistory from "./UndoRedoHistory";

// operations which can be undo/redo
// @TODO messages constants
const savedOperations = [
  "Interface/INIT_GRAPH",
  "Interface/INIT_PAPER",
  "Interface/ADD_ELEMENT",
  "Interface/ADD_ELEMENTS",
  "Interface/DELETE_ELEMENTS",
  "Interface/SET_INPUT_VALUE",
  "Interface/SET_SELECT_VALUE",
  "Interface/ADD_LINK",
  "Interface/DELETE_LINK",
  "Interface/RESIZE_ELEMENT",
  "Interface/MOVE_ELEMENTS",
  "Interface/OPEN_WORKFLOW"
];

const undoRedoPlugin = store => {
  // initialize and save the starting stage
  UndoRedoHistory.init(store);
  let firstState = cloneDeep(store.state);
  UndoRedoHistory.addState(firstState);

  store.subscribe((mutation, state) => {
    // save state after defined mutations
    if (savedOperations.includes(mutation.type)) {
      UndoRedoHistory.addState(cloneDeep(state));
    }
  });
};

export default undoRedoPlugin;
