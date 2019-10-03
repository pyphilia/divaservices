import Vue from "vue";
import {
  PARAMETER_SELECTS,
  PARAMETER_INPUTS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS
} from "./constants/selectors";
import { graph } from "./layout/interface";
import {
  computeBoxWidth,
  computeTitleLength,
  computeBoxHeight
} from "./layout/utils";
import { DEFAULT_OPTIONS } from "../config";

const changePortDetails = event => {
  const prop = event.target.checked ? "block" : "none";
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/text/display", prop);
    }
  }
};

const changePorts = event => {
  const prop = event.target.checked ? "block" : "none";
  // show prop details
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/circle/display", prop);
    }
  }
};

const changeTooltips = event => {
  if (event.target.checked) {
    // show prop details
    document.querySelectorAll(`.${TOOLTIP_CLASS}`).forEach(el => {
      el.style.display = "block";
    });
  } else {
    // hide prop details
    document.querySelectorAll(`.${TOOLTIP_CLASS}`).forEach(el => {
      el.style.display = "none";
    });
  }
};

const changeParameters = event => {
  const showParameters = event.target.checked;
  if (showParameters) {
    document
      .querySelectorAll(
        `.${PARAMETER_INPUTS}, .${PARAMETER_SELECTS}, .${NO_PARAMETER_CLASS}`
      )
      .forEach(el => {
        el.style.display = "block";
      });
  } else {
    document
      .querySelectorAll(
        `.${PARAMETER_INPUTS}, .${PARAMETER_SELECTS}, .${NO_PARAMETER_CLASS}`
      )
      .forEach(el => {
        el.style.display = "none";
      });
  }
  for (const e of graph.getElements()) {
    const newWidth = computeBoxWidth(e, showParameters, true);
    const newHeight = computeBoxHeight(e, showParameters, true);
    e.resize(newWidth, newHeight);
    document
      .querySelectorAll(`g[model-id='${e.id}'] foreignObject`)
      .forEach(el => {
        el.setAttribute("width", newWidth);
        el.setAttribute(
          "height",
          newHeight + computeTitleLength(e, true).titleHeight
        );
      });
  }
};

const defaultSettings = {
  showParameters: {
    checked: DEFAULT_OPTIONS.showParameters || false,
    change: changeParameters
  },
  showPortDetails: {
    checked: DEFAULT_OPTIONS.showPortDetails || false,
    change: changePortDetails
  },
  showPorts: {
    checked: DEFAULT_OPTIONS.showPorts || false,
    change: changePorts
  },
  showTooltips: {
    checked: DEFAULT_OPTIONS.showTooltips || false,
    change: changeTooltips
  }
};

export const layoutSettingsApp = new Vue({
  el: "#layoutSettings",
  data: {
    layout: defaultSettings,
    checkedOptions: Object.entries(defaultSettings)
      .filter(x => x[1].checked)
      .map(x => x[0])
  },
  methods: {},
  computed: {},
  template: `<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
      <div class="modal-content">
      <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Settings</h5>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
      </button>
      </div>

      <div class="modal-body"  id="theme-options">
      <span v-for="({change}, key) in layout">
      <input type="checkbox" id="'option-' + key" :value="key" v-model="checkedOptions" @change="change($event)" /> {{key}} <br>
      </span>
      </div>
      
      <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Ok</button>
      </div>
      </div>
      </div>
      </div>`
});
