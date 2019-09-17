import { addWebservice } from "./addElement";
import {
  deleteElement,
  addSelectedElements,
  deleteAllSelected
} from "./events";

export const history = [
  // {action: ACTION_ADD_ELEMENT, parameters: {}}
];
const future = [
  // {action: ACTION_ADD_ELEMENT, parameters: {}}
];

export const ACTION_ADD_ELEMENT = "addElement";
export const ACTION_ADD_ALL_ELEMENTS = "addAllElements";
export const ACTION_DELETE_ELEMENT = "deleteElement";
export const ACTION_DELETE_ALL_ELEMENTS = "deleteAllElements";

export const addAction = (action, parameters) => {
  console.log("TCL: addAction -> addAction", undoAction);
  history.push({ action, parameters });
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
      deleteElement(id);
    },
    redo: ({ name, defaultParams }) => {
      addWebservice(name, defaultParams);
    }
  },
  [ACTION_ADD_ALL_ELEMENTS]: {
    undo: ({ ids }) => {
      deleteAllSelected(ids);
    },
    redo: ({ elements }) => {
      addSelectedElements(elements);
    }
  },
  [ACTION_DELETE_ELEMENT]: {
    undo: async ({ name, defaultParams }) => {
      console.log("TCL: defaultParams", defaultParams);
      const id = await addWebservice(name, defaultParams, false);
      addFuture(ACTION_DELETE_ELEMENT, { name, defaultParams, id });
    },
    redo: ({ id }) => {
      deleteElement(id);
    }
  },
  [ACTION_DELETE_ALL_ELEMENTS]: {
    undo: async ({ elements }) => {
      console.log("TCL: elements", elements);
      const ids = await addSelectedElements(elements, false);
      addFuture(ACTION_DELETE_ALL_ELEMENTS, { ids, elements });
    },
    redo: ({ ids }) => {
      deleteAllSelected(ids);
    }
  }
};

let undoAction = false;

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
