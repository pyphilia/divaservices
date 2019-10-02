import Vue from "vue";
import Split from "split.js";
import { buildGraph } from "./layout/interface";
import { initWebservices } from "./constants/globals";
import { initTour } from "./utils/walkthrough";
import { LEFT_SIDEBAR, MAIN_INTERFACE } from "./constants/selectors";
// import "@fortawesome/fontawesome-free/js/all"
import Toolsbar from "./layout/components/toolsbar";
import LeftSidebar from "./layout/components/leftSidebar";
import Undo from "./plugins/UndoPlugin";
import Selection from "./plugins/SelectionPlugin";
import FileMenu from "./layout/components/fileMenu";
import Minimap from "./layout/components/minimap";
import ContextMenu from "./plugins/contextMenuPlugin";
import AreaSelection from "./plugins/AreaSelectionPlugin";

import "./layoutSettings";

export let app;

// main js here
(async () => {
  await initWebservices();

  Vue.use(Undo);
  Vue.use(ContextMenu);
  Vue.use(Selection);
  Vue.use(AreaSelection);

  app = new Vue({
    el: "#app",
    data: {
      activity: false
    },
    methods: {
      resetActivity() {
        this.activity = false;
      }
    },
    components: {
      Toolsbar,
      LeftSidebar,
      Minimap,
      FileMenu
    },
    async mounted() {
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
    }
  });
})();
