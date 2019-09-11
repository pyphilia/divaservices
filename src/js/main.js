// import "@fortawesome/fontawesome-free/js/all"
import { buildLeftSidebar } from "./leftSidebar";
import { buildRightSidebar } from "./rightSidebar";
import { buildGraph } from "./interface";

import { DIVA_SERVICES_API_URL } from "./constants";

fetch(DIVA_SERVICES_API_URL).then(async data => {
  const webservices = await data.json();

  // main js here
  buildLeftSidebar(webservices);
  buildRightSidebar(webservices);
  buildGraph(webservices, true); //@TODO to change
});
