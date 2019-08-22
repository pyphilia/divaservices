// left menu
import $ from "jquery";
import fetch from "node-fetch";
import groupBy from "lodash.groupby";
import { categoryName } from "./constants";

const getWebServices = async () => {
  const data = await fetch("http://divaservices.unifr.ch/api/v2/");
  const json = await data.json();
  return json;
};

const addItem = e => {
  console.log("je suis added", e.target.innerText);
};

export const buildLeftSidebar = async () => {
  const webservices = await getWebServices();
  console.log("TCL: webservices", webservices);

  // get categories => algorithms
  let servicesPerCategory = webservices.map(service => {
    return { type: service.type, name: service.name };
  });
  servicesPerCategory = groupBy(servicesPerCategory, "type");

  for (let service of Object.keys(servicesPerCategory).sort()) {
    // create tab menu
    const menuItem = $(`<a class="nav-link" id="v-pills-${service}-tab" data-toggle="pill" href="#v-pills-${service}" role="tab"
        aria-controls="v-pills-${service}" aria-selected="false"></a>`).text(
      categoryName[service]
    );
    $("#algo-categories").append(menuItem);

    // create tab content and its items
    const currentTab = $(
      `<div class="tab-pane fade" id="v-pills-${service}" role="tabpanel" aria-labelledby="v-pills-${service}-tab"></div>`
    );
    $(`#algo-items`).append(currentTab);

    servicesPerCategory[service].forEach(({ name }) => {
      const algoItem = $('<div class="algo-item"></div>').text(name);
      algoItem.click(addItem);
      currentTab.append(algoItem);
    });
  }
};
