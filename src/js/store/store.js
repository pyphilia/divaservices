import Vue from "vue";
import Vuex from "vuex";

import Interface from "./modules/Interface";
import Zoom from "./modules/Zoom";

import undoRedoPlugin from "./plugins/UndoRedoPlugin";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    Interface,
    Zoom
  },
  plugins: [undoRedoPlugin]
});

export default store;
