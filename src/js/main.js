import xml2js from "xml2js";
import path from "path";
import { HOST } from "./constants";

// import "@fortawesome/fontawesome-free/js/all"
import { buildLeftSidebar } from "./leftSidebar";
import { buildRightSidebar } from "./rightSidebar";
import { buildGraph } from "./interface";
import webservicesDecorator from "./webservicesDecorator";

// import { DIVA_SERVICES_API_URL } from "./constants";
const filepath = path.join(HOST, "api/services.xml");

fetch(filepath)
  .then(response => response.text())
  .then(xml => {
    xml2js.parseString(xml, async (err, data) => {
      const webservices = webservicesDecorator(data);

      // main js here
      buildLeftSidebar(webservices);
      buildRightSidebar(webservices);
      buildGraph(webservices, true); //@TODO to change
    });
  });
