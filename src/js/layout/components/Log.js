/**
 * Log component
 * report value errors
 * state: in development
 */

import Vue from "vue";
import Paper from "../../classes/Paper";
import { Constants, Validation } from "divaservices-utils";
const { Types } = Constants;

const Log = Vue.component("Log", {
  props: ["elements"],
  data() {
    return {
      activated: false // hacky variable to activate openWorkflow initial push
    };
  },
  computed: {
    //@TODO watch for differences
    messages() {
      const tmp = [];
      for (const { boxId, type: name, defaultParams } of this.elements) {
        for (const paramType of [Types.NUMBER.type, Types.SELECT.type]) {
          Object.entries(defaultParams[paramType]).map(([paramName, v]) => {
            const { value, values } = v;

            try {
              if (!Validation.checkValue(value, paramType, values)) {
                tmp.push({ value, paramName, paramType, name, boxId });
              }
            } catch (e) {
              tmp.push({ value, paramName, paramType, name, boxId });
            }
          });
        }
      }
      return tmp;
    }
  },
  methods: {
    goToBox(name) {
      Paper.centerBoxByBoxId(name);
    }
  },
  template: `
  <div id="log">
    <div v-for="{value, paramName, paramType, name, boxId} in messages">Invalid value <span class="value">{{value}}</span> in <span class="name">{{paramName}}</span> of <span class="boxName" @click="goToBox(boxId)">{{name}}</span></div>
  </div>
  `
});

export default Log;
