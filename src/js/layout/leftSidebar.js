// left menu
import $ from "jquery";
import groupBy from "lodash.groupby";
import { categoryName } from "../constants/constants";
import { addElementByName } from "../elements/addElement";
import { webservices } from "../constants/globals";

export const buildLeftSidebar = async () => {
  // get categories => algorithms
  let servicesPerCategory = webservices.map(service => {
    const { type, name } = service;
    return { type, name };
  });
  servicesPerCategory = groupBy(servicesPerCategory, "type");

  const menuItems = [];
  const tabs = [];
  for (let service of Object.keys(servicesPerCategory).sort()) {
    // create tab menu
    const menuItem = $(`<a class="nav-link ${service}" id="v-pills-${service}-tab" data-toggle="pill" href="#v-pills-${service}" role="tab"
        aria-controls="v-pills-${service}" aria-selected="false"><div class="icon"></div>${categoryName[service]}</a>`);

    menuItems.push(menuItem);

    // create tab content and its items
    const currentTab = $(
      `<div class="tab-pane fade" id="v-pills-${service}" role="tabpanel" aria-labelledby="v-pills-${service}-tab"></div>`
    );
    tabs.push(currentTab);

    const algoItems = [];
    for (const { name } of servicesPerCategory[service]) {
      const algoItem = $(
        `<div class="algo-item ${service}"><span class="icon"></span>${name}</div>`
      );
      algoItem.on("click", function() {
        addElementByName(name);
      });
      algoItems.push(algoItem);
    }
    currentTab.append(algoItems);
  }
  $(`#algo-items`).append(tabs);
  $("#algo-categories").append(menuItems);
};
