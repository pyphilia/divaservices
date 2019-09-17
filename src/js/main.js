// import "@fortawesome/fontawesome-free/js/all"
import { buildLeftSidebar } from "./leftSidebar";
import { buildRightSidebar } from "./rightSidebar";
import { buildGraph } from "./interface";

// import { DIVA_SERVICES_API_URL } from "./constants";
import { initWebservices, webservices } from "./globals";

// fetch(filepath)
//   .then(response => response.text())
//   .then(xml => {
//     xml2js.parseString(xml, async (err, data) => {
//       const webservices = webservicesDecorator(data);

//       // main js here
//       buildLeftSidebar(webservices);
//       buildRightSidebar(webservices);
//       buildGraph(webservices, true); //@TODO to change
//     });
//   });

// main js here
(async () => {
  await initWebservices();
  console.log("wiejsfkdm", webservices);
  buildLeftSidebar();
  buildRightSidebar();
  buildGraph(true); //@TODO to change
})();
