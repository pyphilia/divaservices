import Vue from "vue";
import Vuex from "vuex";

import Interface from "./modules/Interface";
import plugins from "./plugins";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    Interface
  },
  plugins
});

export default store;
