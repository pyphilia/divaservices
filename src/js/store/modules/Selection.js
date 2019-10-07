// import { BOX_HIGHLIGHTER } from "../../constants/constants";
// import { saveElementsPositionFromCellView } from "../../elements/moveElement";
// import { AREA_SELECTION_ELEMENT } from "../../constants/selectors";

// const div = document.getElementById(AREA_SELECTION_ELEMENT);

// // const AreaSelection = {
// //   data() {
// //     return {
// //       areaSelection: false,
// //       x1: 0,
// //       y1: 0,
// //       x2: 0,
// //       y2: 0
// //     };
// //   },
// //   methods: {
// //     reCalc() {
// //       var x3 = Math.min(state.x1, state.x2);
// //       var x4 = Math.max(state.x1, state.x2);
// //       var y3 = Math.min(state.y1, state.y2);
// //       var y4 = Math.max(state.y1, state.y2);
// //       div.style.left = x3 + "px";
// //       div.style.top = y3 + "px";
// //       div.style.width = x4 - x3 + "px";
// //       div.style.height = y4 - y3 + "px";
// //     },
// //     initAreaSelection(event) {
// //       state.areaSelection = true;
// //       state.x1 = event.clientX;
// //       state.y1 = event.clientY;
// //       state.x2 = event.clientX;
// //       state.y2 = event.clientY;
// //       state.reCalc();
// //       div.hidden = 0;
// //     },
// //     endAreaSelection() {
// //       state.areaSelection = false;

// //       const { x, y, width, height } = div.getBoundingClientRect();
// //       const { x: paperOffsetX, y: paperOffsetY } = paper.clientOffset();
// //       const {
// //         tx: paperTranslateX,
// //         ty: paperTranslateY
// //       } = paper.translate();
// //       const currentScale = paper.scale().sx;

// //       const pointX = (x - paperOffsetX - paperTranslateX) / currentScale;
// //       const pointY = (y - paperOffsetY - paperTranslateY) / currentScale;

// //       const models = graph.findModelsInArea({
// //         x: pointX,
// //         y: pointY,
// //         width: width / currentScale,
// //         height: height / currentScale
// //       });

// //       app.addCellViewsToSelection(
// //         models.map(model => paper.findViewByModel(model))
// //         );
// //         div.hidden = 1;
// //       },
// //       computeAreaSelection() {
// //         if (state.areaSelection) {
// //           state.x2 = event.clientX;
// //           state.y2 = event.clientY;
// //           state.reCalc();
// //         }
// //       }
// //     }
// //   };

//   const Selection = {
//     namespaced: true,
//     state: {
//       // array of selected elements
//       selectedElements: [],

//       // array of copied elements
//       copiedElements: []
//     },
//     mutations: {
//       clearSelection(state) {
//         state.selectedElements = [];
//       },
//       setCopiedElements(state) {
//         state.copiedElements = state.selectedElements;
//       },
//       ADD_ELEMENT_TO_SELECTION(state, cellView) {
//         if (state.selectedElements.indexOf(cellView) == -1) {
//           state.selectedElements.push(cellView);
//         }
//         state.highlightSelection(state, cellView);
//         saveElementsPositionFromCellView(state.selectedElements);
//       },
//       addCellViewToSelection(state, cellView) {
//         if (state.selectedElements.indexOf(cellView) == -1) {
//           state.selectedElements.push(cellView);
//         }
//         state.highlightSelection(state, cellView);
//         saveElementsPositionFromCellView(state.selectedElements);
//       },
//       addCellViewsToSelection(state, cellViews) {
//         for (const cellView of cellViews) {
//           state.highlightSelection(cellView);
//           state.addCellViewToSelection(cellView);
//         }
//         saveElementsPositionFromCellView(state.selectedElements);
//       },
//       removeElementFromSelection(state, cellView, index) {
//         if (!index) {
//           index = state.selectedElements.indexOf(cellView);
//         }
//         state.selectedElements.splice(index, 1);
//         state.unHighlight(cellView);
//       },
//       toggleCellViewInSelection(state, cellView) {
//         const index = state.selectedElements.indexOf(cellView);
//         if (index == -1) {
//           state.addCellViewToSelection(cellView);
//         } else {
//           state.removeElementFromSelection(cellView, index);
//         }
//       },
//       highlightSelection(state, cellView) {
//         if (cellView) {
//           cellView.highlight(null, BOX_HIGHLIGHTER);
//         }
//       },
//       highlightAllSelected(state) {
//         for (const el of state.selectedElements) {
//           state.highlightSelection(el);
//         }
//       },
//       unHighlight(state, cellView) {
//         cellView.unhighlight(null, BOX_HIGHLIGHTER);
//       },
//       unHighlightAllSelected(state) {
//         // do not use unHighlightSelection to remove the array once
//         for (const el of state.selectedElements) {
//           state.unHighlight(el);
//         }
//       },
//       unSelectAll(state) {
//         state.unHighlightAllSelected();
//         state.clearSelection();
//       },
//       resetHighlight(state) {
//         if (state.selectedElements.length) {
//           state.unHighlightAllSelected();
//           state.highlightAllSelected();
//         }
//       }
//     },
//     actions: {
//       // initInterface(context){
//       //   context.commit('INIT_INTERFACE');
//       // }
//     }
//   };
//   export default Selection;
