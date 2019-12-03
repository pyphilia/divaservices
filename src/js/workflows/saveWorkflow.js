/**
 * Read a workflow build within the main interface area
 * and translates it into a xml file
 */
import xml2js from "xml2js";
import { getWebserviceByName } from "../constants/globals";
import { app } from "../app";
import { CATEGORY_DATATEST } from "../constants/constants";
import { Validation } from "divaservices-utils";
import { sendWorkflowSteps } from "../api/requests";

// we use the actual graph nodes to get the workflow
// because it contains vital ids (especially ports)
// we make a connection with our store elements
// to retrieve the actual parameters
export const saveWorkflow = jsonGraph => {
  const log = [];
  const Steps = { Step: [] };
  // NODE
  app.currentElements
    .filter(({ category }) => category != CATEGORY_DATATEST)
    .forEach((box, i) => {
      const { type, boxId } = box;
      const Name = type.replace(/\s/g, "");
      const No = i;
      const Inputs = { Parameter: [], Data: [] };

      // get actual defaultParams in store
      const defaultParams = app.elements.find(el => el.boxId == boxId)
        .defaultParams;

      for (const [paramType, values] of Object.entries(defaultParams)) {
        for (const [paramName, options] of Object.entries(values)) {
          const { value: Value, defaultValue, values } = options;
          if (Value != defaultValue.toString()) {
            Inputs.Parameter.push({
              Name: paramName,
              Value
            });
          }
          const validity = Validation.checkValue(Value, paramType, values);
          if (!validity) {
            log.push({
              value: Value,
              Name: paramName,
              paramType,
              name: type,
              boxId
            });
          }
        }
      }

      // ports.items.forEach(port => {
      //   console.log(port);
      //   allPorts[port.id] = {
      //     boxId,
      //     boxNo: i,
      //     name: port.name
      //   };
      // });

      // key in webservices list
      const Key = getWebserviceByName(type).id;
      const Service = { Key };

      const step = { Id: boxId, No, Name, Service, Inputs };
      Steps.Step.push(step);
    });

  // save data elements
  const dataPorts = {};
  const dataElements = jsonGraph.cells.filter(
    cell => cell.type != "standard.Link" && cell.category == CATEGORY_DATATEST
  );
  for (const el of dataElements) {
    for (const port of el.ports.items) {
      dataPorts[port.id] = el.boxId;
    }
  }

  const data = [];
  const allFiles = [];
  app.links.forEach(link => {
    const {
      source: { boxId: sourceId },
      target: { boxId: targetId }
    } = link;

    // search in steps step because it contains the inputs.data array
    const targetWebservice = Steps.Step.find(el => el.Id == targetId);
    const sourceWebservice = Steps.Step.find(el => el.Id == sourceId);

    if (sourceWebservice) {
      const { No: Ref } = sourceWebservice;
      const p = {
        Name: link.target.portName,
        Value: {
          WorkflowStep: {
            Ref,
            ServiceOutputName: link.source.portName
          }
        }
      };
      targetWebservice.Inputs.Data.push(p);
    } else {
      const sourceDataBox = app.currentDataElements.find(
        el => el.boxId == sourceId
      );

      // @TODO get folder when folder type
      let i = 0;
      const file = sourceDataBox.data[0]; // suppose one file
      allFiles.push(file);
      const dataName =
        targetWebservice.Name + "_" + link.target.portName + "_" + i++;
      const fileData = {
        [dataName]: file.identifier
      };
      data.push(fileData);

      targetWebservice.Inputs.Data.push({
        Name: dataName,
        Path: file.identifier
      });
    }
  });

  console.log(allFiles); //@TODO send to server to upload as zip
  console.log(JSON.stringify(data));

  // remove Id to match relax validation schema
  for (const step of Steps.Step) {
    console.log("TCL: step", step);
    delete step.Id;
  }

  const builder = new xml2js.Builder({ rootName: "Steps" });
  const xml = builder.buildObject(Steps);
  console.log("TCL: xml", xml);

  app.$refs.log.setLogMessages(log);

  //@TODO add xml headers
  // var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
  // saveAs(blob, "../../tmp/hello.xml");

  sendWorkflowSteps(xml);
};
