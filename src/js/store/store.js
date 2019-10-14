import Vue from "vue";
import Vuex from "vuex";

import Interface from "./modules/Interface";
import undoRedoPlugin from "./plugins/UndoRedoPlugin";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    Interface
  },
  plugins: [undoRedoPlugin]
});

export default store;
