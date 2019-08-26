// left menu
import $ from "jquery";
import groupBy from "lodash.groupby";
import { categoryName } from "./constants";
import { getWebServices } from "./utils";
import { addElementToGraph } from "./interface";

const addWebservice = async (webservices, name) => {
  const algo = webservices.filter(service => service.name == name);
  if (algo.length) {
    const url = algo[0].url;
    await addElementToGraph(url);
  } else {
    console.error(`${name} doesnt exist`);
  }
};

export const buildLeftSidebar = async () => {
  const webservices = await getWebServices();

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
      algoItem.on("click", function() {
        addWebservice(webservices, name);
      });
      currentTab.append(algoItem);
    });
  }
};
