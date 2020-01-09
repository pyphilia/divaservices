import Vue from "vue";
import {
  PARAMETER_SELECTS,
  PARAMETER_INPUTS,
  TOOLTIP_CLASS,
  NO_PARAMETER_CLASS,
  DATA_BOX_FOREIGNOBJECT_CLASS,
  DATA_INPUT_CONTENT_CLASS
} from "./constants/selectors";
import { app } from "./app";

const changePortDetails = event => {
  const prop = event.target.checked ? "block" : "none";
  const { graph } = app;
  for (const el of graph.getElements()) {
    for (const { id } of el.getPorts()) {
      el.portProp(id, "attrs/text/display", prop);
    }
  }
};

const changePorts = event => {
  const prop = event.target.checked ? "block" : "none";
  const { graph } = app;
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
  const displayValue = showParameters ? "block" : "none";
  const els = document.querySelectorAll(
    `.${PARAMETER_INPUTS}, .${PARAMETER_SELECTS}, .${NO_PARAMETER_CLASS}, .${DATA_BOX_FOREIGNOBJECT_CLASS} .${DATA_INPUT_CONTENT_CLASS}`
  );
  els.forEach(el => {
    el.style.display = displayValue;
  });
};

const defaultSettings = {
  showParameters: {
    name: "showParameters",
    text: "Show Box Parameters",
    checked: true,
    change: changeParameters
  },
  showPortDetails: {
    name: "showPortDetails",
    text: "Show Port Details",
    checked: true,
    change: changePortDetails
  },
  showPorts: {
    name: "showPorts",
    text: "Show ports",
    checked: true,
    change: changePorts
  },
  showTooltips: {
    name: "showTooltips",
    text: "Show tooltips",
    checked: true,
    change: changeTooltips
  }
};

export const layoutSettingsApp = new Vue({
  el: "#layoutSettings",
  data: {
    layout: defaultSettings,
    checkedOptions: Object.entries(defaultSettings)
      .filter(x => x[1].checked)
      .map(x => x[1].name)
  },
  methods: {
    isShowParametersChecked() {
      return this.isChecked(this.layout.showParameters.name);
    },
    isShowPortsChecked() {
      return this.isChecked(this.layout.showPorts.name);
    },
    isShowPortsDetailsChecked() {
      return this.isChecked(this.layout.showPortDetails.name);
    },
    isShowTooltipsChecked() {
      return this.isChecked(this.layout.showTooltips.name);
    },
    isChecked(name) {
      return this.checkedOptions.indexOf(name) != -1;
    }
  },
  computed: {},
  template: `
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="layoutModal" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="layoutModal">Settings</h5>
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
