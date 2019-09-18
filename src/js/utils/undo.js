import { restoreElements, addElementByName } from "../elements/addElement";
import {
  deleteElementsByCellView,
  deleteElementById
} from "../elements/deleteElement";
import { paste, undoPaste } from "../events/controls";

export const ACTION_ADD = "add";
export const ACTION_PASTE = "paste";
export const ACTION_DELETE = "delete";

const history = [];
const future = [];

export let undoAction = false;

// this function is fired only through user action,
// it will erase stored undone actions
export const addAction = (action, parameters) => {
  const returnValues = ACTIONS[action].redo(parameters);
  history.push({ action, parameters: { ...returnValues, ...parameters } });
  future.length = 0;
};

const ACTIONS = {
  [ACTION_ADD]: {
    undo: ({ id }) => {
      deleteElementById(id);
    },
    redo: ({ name }) => {
      return addElementByName(name);
    }
  },
  [ACTION_PASTE]: {
    undo: ({ addedElements }) => {
      undoPaste(addedElements);
    },
    redo: ({ elements }) => {
      return paste(elements);
    }
  },
  [ACTION_DELETE]: {
    undo: ({ restoredElements }) => {
      return restoreElements(restoredElements);
    },
    redo: ({ elements }) => {
      return deleteElementsByCellView(elements);
    }
  }
};

export const undo = () => {
  if (history.length) {
    undoAction = true;
    const lastAction = history.pop();
    ACTIONS[lastAction.action].undo(lastAction.parameters);
    future.push(lastAction);
  }
};

export const redo = () => {
  if (future.length) {
    const { action, parameters } = future.pop();
    const returnValues = ACTIONS[action].redo(parameters);
    history.push({ action, parameters: { ...parameters, ...returnValues } });
  }
};
