import { buildLeftSidebar } from "./layout/leftSidebar";
import { buildRightSidebar } from "./layout/rightSidebar";
import { buildGraph } from "./layout/interface";
import { initWebservices } from "./constants/globals";
// import "@fortawesome/fontawesome-free/js/all"

// main js here
(async () => {
  await initWebservices();
  buildLeftSidebar();
  buildRightSidebar();
  buildGraph(true); //@TODO to change
})();
