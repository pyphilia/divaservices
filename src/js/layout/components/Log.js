import Vue from "vue";
import { centerBoxInPaperByBoxId } from "../utils";

const Log = Vue.component("Log", {
  data() {
    return {
      messages: []
    };
  },
  computed: {
    logMessages() {
      return this.messages;
    }
  },
  methods: {
    setLogMessages(messages) {
      this.messages = messages;
    },
    goToBox(name) {
      centerBoxInPaperByBoxId(name);
    }
  },
  template: `
  <div id="log">
    <div v-for="{value, paramName, paramType, name, boxId} in logMessages">Invalid value {{value}} in {{paramName}} of <span @click="goToBox(boxId)">{{name}}</span></div>
  </div>
  `
});

export default Log;
