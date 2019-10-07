// /**
//  *
//  * state Undo-redo manager is based on the Command pattern
//  * which receives actions and stores them in an history
//  *
//  */

// import {
//   restoreElements,
//   addElementByName,
//   addLinkBySourceTarget
// } from "../../elements/addElement";
// import {
//   deleteElementsByCellView,
//   deleteElementByBoxId,
//   deleteLink,
//   deleteElementsByBoxId
// } from "../../elements/deleteElement";
// import { paste, undoPaste } from "../../events/controls";
// import { moveElementsByBoxId } from "../../elements/moveElement";
// import {
//   ACTION_MOVE_ELEMENT,
//   ACTION_ADD_ELEMENT,
//   ACTION_ADD_LINK,
//   ACTION_DELETE_ELEMENTS,
//   ACTION_DELETE_LINK,
//   ACTION_ADD_ELEMENTS,
//   ACTION_OPEN_WORKFLOW
// } from "../../constants/actions";
// import { readWorkflow } from "../../workflows/readWorkflow";

// const ACTIONS = {
//   [ACTION_ADD_ELEMENT]: {
//     undo: ({ boxId }) => {
//       return deleteElementByBoxId(boxId);
//     },
//     redo: ({ name, boxId, position }) => {
//       // retrieve previously pasted boxId, to use it again
//       // and not lose further related history
//       return addElementByName(name, { boxId, position }); //id
//     }
//   },
//   [ACTION_ADD_ELEMENTS]: {
//     undo: ({ addedElements }) => {
//       undoPaste(addedElements);
//     },
//     redo: ({ elements, boxIds }) => {
//       return paste(elements, boxIds);
//     }
//   },
//   [ACTION_DELETE_ELEMENTS]: {
//     undo: ({ restoredElements }) => {
//       restoreElements(restoredElements);
//       console.log("TCL: restoredElements", restoredElements);
//       return { elements: restoredElements };
//     },
//     redo: ({ elements }) => {
//       console.log("TCL: elements", elements);
//       return deleteElementsByCellView(elements);
//     }
//   },
//   [ACTION_MOVE_ELEMENT]: {
//     undo: ({ elementBoxIds, currentPositions }) => {
//       moveElementsByBoxId(elementBoxIds, currentPositions);
//     },
//     redo: ({ elementBoxIds, newPositions }) => {
//       moveElementsByBoxId(elementBoxIds, newPositions);
//     }
//   },
//   [ACTION_ADD_LINK]: {
//     undo: ({ linkView }) => {
//       deleteLink(linkView);
//     },
//     redo: ({ linkView }) => {
//       return addLinkBySourceTarget(linkView);
//     }
//   },
//   [ACTION_DELETE_LINK]: {
//     undo: ({ linkView }) => {
//       return addLinkBySourceTarget(linkView);
//     },
//     redo: ({ linkView }) => {
//       deleteLink(linkView);
//     }
//   },
//   [ACTION_OPEN_WORKFLOW]: {
//     undo: ({ boxIds }) => {
//       return deleteElementsByBoxId(boxIds);
//     },
//     redo: async () => {
//       return await readWorkflow();
//     }
//   }
// };

// const Undo = {
//   namespaced: true,
//   state: {
//     history: [],
//     future: []
//   },
//   mutations: {
//     redo() {
//       if (state.future.length) {
//         const { action, parameters } = state.future.pop();
//         const returnValues = ACTIONS[action].redo(parameters);

//         state.history.push({
//           action,
//           parameters: { ...parameters, ...returnValues }
//         });
//       }
//     },
//     undo() {
//       if (state.history.length) {
//         const { action, parameters } = state.history.pop();
//         const returnValues = ACTIONS[action].undo(parameters);
//         state.future.push({
//           action,
//           parameters: { ...parameters, ...returnValues }
//         });
//       }
//     },
//     clearHistory() {
//       state.history = [];
//     },
//     // state function is fired only through user action,
//     // it will erase stored undone actions
//     // execute parameter determine whether to execute the redo function
//     // (particularly useful for actions saved from events)
//     ADD_ACTION(state, { action, data }) {
//       state.history.push({
//         action,
//         data
//       });
//       state.future = [];
//       console.log([...state.history]);
//     }
//     // async addAction(action, parameters = {}, execute = true) {
//     //   const returnValues = execute
//     //   ? await ACTIONS[action].redo(parameters)
//     //   : {};
//     //   state.history.push({
//     //     action,
//     //     parameters: { ...parameters, ...returnValues }
//     //   });
//     //   state.future = [];
//     //   console.log([...state.history]);
//     // }
//   },
//   actions: {}
// };

// export default Undo;
