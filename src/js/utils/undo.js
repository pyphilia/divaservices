import { restoreElements } from "../elements/addElement";
import { deleteElementsByCellView } from "../elements/deleteElement";
import { paste, undoPaste } from "../events/controls";

export const ACTION_PASTE = "paste";
export const ACTION_DELETE = "delete";

export const history = [];
const future = [];

export let undoAction = false;

export const addAction = (action, parameters) => {
  const returnValues = ACTIONS[action].redo(parameters);
  history.push({ action, parameters: { ...returnValues, ...parameters } });
};

const ACTIONS = {
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
