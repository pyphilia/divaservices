/**
 *
 * This Undo-redo manager is based on the Command pattern
 * which receives actions and stores them in an history
 *
 */

import {
  restoreElements,
  addElementByName,
  addLinkBySourceTarget
} from "../elements/addElement";
import {
  deleteElementsByCellView,
  deleteElementByBoxId,
  deleteLink,
  deleteElementsByBoxId
} from "../elements/deleteElement";
import { paste, undoPaste } from "../events/controls";
import { moveElementsByBoxId } from "../elements/moveElement";
import {
  ACTION_MOVE_ELEMENT,
  ACTION_ADD_ELEMENT,
  ACTION_ADD_LINK,
  ACTION_DELETE_ELEMENT,
  ACTION_DELETE_LINK,
  ACTION_PASTE,
  ACTION_OPEN_WORKFLOW
} from "../constants/actions";
import { updateMinimap } from "../layout/minimap";
import { readWorkflow } from "../workflows/readWorkflow";
import { updateZoomTools } from "../layout/toolsbar";

const history = [];
const future = [];

export const getHistory = () => {
  return [...history];
};

export const getFuture = () => {
  return [...future];
};

export const isHistoryEmpty = () => {
  return history.length == 0;
};

export const isFutureEmpty = () => {
  return future.length == 0;
};

export const clearHistory = () => {
  history.length = 0;
};

export let undoAction = false;

const updateInterface = () => {
  updateMinimap();
  updateZoomTools();
};

// this function is fired only through user action,
// it will erase stored undone actions
// execute parameter determine whether to execute the redo function
// (particularly useful for actions saved from events)
export const addAction = async (action, parameters = {}, execute = true) => {
  const returnValues = execute ? await ACTIONS[action].redo(parameters) : {};
  history.push({ action, parameters: { ...parameters, ...returnValues } });
  future.length = 0;
  console.log(getHistory());
  updateInterface();
};

const ACTIONS = {
  [ACTION_ADD_ELEMENT]: {
    undo: ({ boxId }) => {
      return deleteElementByBoxId(boxId);
    },
    redo: ({ name, boxId, position }) => {
      // retrieve previously pasted boxId, to use it again
      // and not lose further related history
      return addElementByName(name, { boxId, position }); //id
    }
  },
  [ACTION_PASTE]: {
    undo: ({ addedElements }) => {
      undoPaste(addedElements);
    },
    redo: ({ elements, boxIds }) => {
      return paste(elements, boxIds);
    }
  },
  [ACTION_DELETE_ELEMENT]: {
    undo: ({ restoredElements }) => {
      restoreElements(restoredElements);
      console.log("TCL: restoredElements", restoredElements);
      return { elements: restoredElements };
    },
    redo: ({ elements }) => {
      console.log("TCL: elements", elements);
      return deleteElementsByCellView(elements);
    }
  },
  [ACTION_MOVE_ELEMENT]: {
    undo: ({ elementBoxIds, currentPositions }) => {
      moveElementsByBoxId(elementBoxIds, currentPositions);
    },
    redo: ({ elementBoxIds, newPositions }) => {
      moveElementsByBoxId(elementBoxIds, newPositions);
    }
  },
  [ACTION_ADD_LINK]: {
    undo: ({ linkView }) => {
      deleteLink(linkView);
    },
    redo: ({ linkView }) => {
      return addLinkBySourceTarget(linkView);
    }
  },
  [ACTION_DELETE_LINK]: {
    undo: ({ linkView }) => {
      return addLinkBySourceTarget(linkView);
    },
    redo: ({ linkView }) => {
      deleteLink(linkView);
    }
  },
  [ACTION_OPEN_WORKFLOW]: {
    undo: ({ boxIds }) => {
      return deleteElementsByBoxId(boxIds);
    },
    redo: async () => {
      return await readWorkflow();
    }
  }
  // []: {
  //   undo: () => {

  //   },
  //   redo: () => {

  //   }
  // },
};

export const undo = () => {
  if (history.length) {
    undoAction = true;
    const { action, parameters } = history.pop();
    const returnValues = ACTIONS[action].undo(parameters);
    future.push({ action, parameters: { ...parameters, ...returnValues } });
  }
  updateInterface();
};

export const redo = () => {
  if (future.length) {
    const { action, parameters } = future.pop();
    const returnValues = ACTIONS[action].redo(parameters);

    history.push({ action, parameters: { ...parameters, ...returnValues } });
  }
  updateInterface();
};
