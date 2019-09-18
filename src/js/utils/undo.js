import {
  addWebserviceByName,
  addSelectedElements
} from "../elements/addElement";
import {
  deleteElementById,
  deleteElementsById
} from "../elements/deleteElement";

export const ACTION_ADD_ELEMENT = "addElement";
export const ACTION_ADD_ALL_ELEMENTS = "addAllElements";
export const ACTION_DELETE_ELEMENT = "deleteElement";
export const ACTION_DELETE_ALL_ELEMENTS = "deleteAllElements";

export const history = [];
const future = [];

export let undoAction = false;

export const addAction = (action, parameters) => {
  history.push({ action, parameters });
  console.log(history);
  if (!undoAction) {
    future.length = 0;
    console.log(future);
  }
  undoAction = false;
};

const addFuture = (action, parameters) => {
  future.push({ action, parameters });
};

const ACTIONS = {
  [ACTION_ADD_ELEMENT]: {
    undo: ({ id }) => {
      deleteElementById(id);
    },
    redo: ({ name, defaultParams }) => {
      addWebserviceByName(name, defaultParams);
    }
  },
  [ACTION_ADD_ALL_ELEMENTS]: {
    undo: ({ ids }) => {
      deleteElementsById(ids);
    },
    redo: ({ elements }) => {
      addSelectedElements(elements);
    }
  },
  [ACTION_DELETE_ELEMENT]: {
    undo: async ({ name, defaultParams }) => {
      const id = await addWebserviceByName(name, defaultParams, false);
      addFuture(ACTION_DELETE_ELEMENT, { name, defaultParams, id });
    },
    redo: ({ id }) => {
      deleteElementById(id);
    }
  },
  [ACTION_DELETE_ALL_ELEMENTS]: {
    undo: async ({ elements }) => {
      console.log("TCL: elements", elements);
      const ids = await addSelectedElements(elements, false);
      addFuture(ACTION_DELETE_ALL_ELEMENTS, { ids, elements });
    },
    redo: ({ ids }) => {
      deleteElementsById(ids);
    }
  }
};

export const undo = () => {
  console.log("TCL: undo -> history", history);
  if (history.length) {
    undoAction = true;
    const lastAction = history.pop();
    ACTIONS[lastAction.action].undo(lastAction.parameters);
    future.push(lastAction);
  }
};

export const redo = () => {
  if (future.length) {
    const nextAction = future.pop();
    console.log("TCL: redo -> nextAction", nextAction);
    ACTIONS[nextAction.action].redo(nextAction.parameters);
  }
};
