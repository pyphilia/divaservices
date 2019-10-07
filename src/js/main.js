// import Vue from "vue";
// import Split from "split.js";
// import { buildGraph } from "./layout/interface";
// import { initWebservices } from "./constants/globals";
// import { initTour } from "./utils/walkthrough";
// import { LEFT_SIDEBAR, MAIN_INTERFACE } from "./constants/selectors";
// // import "@fortawesome/fontawesome-free/js/all"
// import Toolsbar from "./layout/components/Toolsbar";
// import LeftSidebar from "./layout/components/LeftSidebar";
// import Undo from "./plugins/UndoPlugin";
// import Selection from "./plugins/SelectionPlugin";
// import FileMenu from "./layout/components/FileMenu";
// import Minimap from "./layout/components/Minimap";
// import AreaSelection from "./plugins/AreaSelectionPlugin";
// import Zoom from "./plugins/ZoomPlugin";

// import "./ContextMenu";
// import "./layoutSettings";

// export let app;

// // main js here
// (async () => {
//   // init webservices array
//   await initWebservices();

//   Vue.use(Undo);
//   Vue.use(Selection);
//   Vue.use(AreaSelection);
//   Vue.use(Zoom);

//   app = new Vue({
//     el: "#app",
//     data: {
//       activity: false
//     },
//     methods: {
//       resetActivity() {
//         this.activity = false;
//       }
//     },
//     components: {
//       Toolsbar,
//       LeftSidebar,
//       Minimap,
//       FileMenu
//     },
//     async mounted() {
//       await buildGraph(true); //@TODO to change

//       Split([LEFT_SIDEBAR, MAIN_INTERFACE], {
//         elementStyle: function(dimension, size, gutterSize) {
//           return { "flex-basis": "calc(" + size + "% - " + gutterSize + "px)" };
//         },
//         minSize: [300, 500],
//         sizes: [25, 75],
//         gutterSize: 6
//       });

//       initTour();
//     }
//   });
// })();
