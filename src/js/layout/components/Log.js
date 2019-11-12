import Vue from "vue";
import { centerBoxInPaperByBoxId } from "../utils";

const Log = Vue.component("Log", {
  data() {
    return {
      messages: [],
      activated: false // hacky variable to activate readworkflow initial push
    };
  },
  methods: {
    findMessage(message) {
      return this.messages.findIndex(
        m => m.boxId == message.boxId && m.paramName == message.paramName
      );
    },
    setLogMessages(messages) {
      this.messages = messages;
    },
    addMessage(message) {
      const mId = this.findMessage(message);
      // if the input is not already false
      if (mId < 0) {
        this.messages.push(message);
        this.hacky(message);
      }
      // replace the message
      else {
        this.$set(this.messages[mId], "value", message.value);
      }
    },
    hacky(message) {
      // BUG HACK: add twice the message for first pushed message:
      if (!this.activated) {
        this.messages.push(message);
        this.activated = true;
      }
    },
    removeMessage(message) {
      this.messages.splice(this.findMessage(message), 1);
    },
    goToBox(name) {
      centerBoxInPaperByBoxId(name);
    }
  },
  template: `
  <div id="log">
    <div v-for="{value, paramName, paramType, name, boxId} in messages">Invalid value <span class="value">{{value}}</span> in <span class="name">{{paramName}}</span> of <span class="boxName" @click="goToBox(boxId)">{{name}}</span></div>
  </div>
  `
});

export default Log;
