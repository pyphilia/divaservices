import fetch from "node-fetch";
import { app } from "../app";
import {
  USERNAME,
  PASSWORD,
  SERVICES_API,
  WEBSERVICES_XML_FILEPATH
} from "../../config";

export const getServicesAPI = async () => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const xmlApi = await fetch(SERVICES_API);
    xml = await xmlApi.text();
  } else {
    const filepath = WEBSERVICES_XML_FILEPATH;
    xml = (await import(`!!raw-loader!../../${filepath}`)).default;
  }
  return xml;
};

export const sendWorkflowSteps = xml => {
  // const xhr = new XMLHttpRequest();
  // xhr.open(
  //   "POST",
  //   "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow/save?id=" +
  //     app.workflowId,
  //   true
  // );
  // xhr.setRequestHeader("Content-Type", "text/xml");
  // xhr.setRequestHeader("username", USERNAME);
  // xhr.setRequestHeader("password", PASSWORD);
  // xhr.send(xml);

  fetch(
    "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow/save?id=" +
      app.workflowId,
    {
      method: "POST",
      body: xml,
      headers: {
        "Content-Type": "text/xml",
        username: USERNAME,
        password: PASSWORD
      }
    }
  );
};

export const openWorkflowFromId = async id => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const workflow = await fetch(
      "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow?id=" + id,
      {
        headers: {
          "Content-Type": "text/xml"
        }
      }
    );
    xml = await workflow.text();
  } else {
    const filepath = "api/example.xml";
    xml = (await import(`!!raw-loader!../../${filepath}`)).default;
  }
  return xml;
};
