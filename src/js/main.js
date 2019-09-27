import Split from "split.js";
import { buildLeftSidebar } from "./layout/leftSidebar";
import { buildGraph } from "./layout/interface";
import { initWebservices } from "./constants/globals";
import { initTour } from "./utils/walkthrough";
import { LEFT_SIDEBAR, MAIN_INTERFACE } from "./constants/selectors";
// import "@fortawesome/fontawesome-free/js/all"

// main js here
(async () => {
  await initWebservices();
  await buildLeftSidebar();
  await buildGraph(true); //@TODO to change

  Split([LEFT_SIDEBAR, MAIN_INTERFACE], {
    elementStyle: function(dimension, size, gutterSize) {
      return { "flex-basis": "calc(" + size + "% - " + gutterSize + "px)" };
    },
    minSize: [300, 500],
    sizes: [25, 75],
    gutterSize: 6
  });

  initTour();
})();
