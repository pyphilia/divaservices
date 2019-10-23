/**
 * Read a workflow build within the main interface area
 * and translates it into a xml file
 */
import xml2js from "xml2js";
import { getWebserviceByName } from "../constants/globals";
import { app } from "../app";
import { CATEGORY_SERVICE, CATEGORY_DATATEST } from "../constants/constants";

// we use the actual graph nodes to get the workflow
// because it contains vital ids (especially ports)
// we make a connection with our store elements
// to retrieve the actual parameters
export const saveWorkflow = jsonGraph => {
  const allPorts = {};

  const Steps = { Step: [] };
  // NODE
  jsonGraph.cells
    .filter(
      cell => cell.type != "standard.Link" && cell.category == CATEGORY_SERVICE
    )
    .forEach((box, i) => {
      const { type, ports, boxId } = box;
      const Name = type.replace(/\s/g, "");
      const No = i;
      const Inputs = { Parameter: [], Data: [] };

      // get actual defaultParams in store
      const defaultParams = app.elements.find(el => el.boxId == boxId)
        .defaultParams;

      for (const [, values] of Object.entries(defaultParams)) {
        for (const [paramName, options] of Object.entries(values)) {
          const { value: Value, defaultValue } = options;
          if (Value != defaultValue.toString()) {
            Inputs.Parameter.push({
              paramName,
              Value
            });
          }
        }
      }

      ports.items.forEach(port => {
        allPorts[port.id] = {
          boxId,
          boxNo: i,
          name: port.name
        };
      });

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
  // LINK
  jsonGraph.cells
    .filter(cell => cell.type == "standard.Link")
    .forEach(link => {
      const {
        source: { port: sourcePortId },
        target: { port: targetPortId }
      } = link;
      const targetPort = allPorts[targetPortId];
      const targetWebservice = Steps.Step.find(
        step => step.Id == targetPort.boxId
      );

      if (allPorts[sourcePortId]) {
        const { boxId: Ref, name: ServiceOutputName } = allPorts[sourcePortId];
        const p = {
          Name: targetPort.name,
          Value: {
            WorkflowStep: {
              Ref,
              ServiceOutputName
            }
          }
        };
        targetWebservice.Inputs.Data.push(p);
      } else if (dataPorts[sourcePortId]) {
        const sourceDataBox = app.currentDataElements.find(
          el => el.boxId == dataPorts[sourcePortId]
        );

        // @TODO get folder when folder type
        let i = 0;
        for (const file of sourceDataBox.data) {
          allFiles.push(file);
          const fileData = {
            [targetWebservice.Name + "_" + targetPort.name + "_" + i++]:
              "SOMENAME/" + file.name
          };
          data.push(fileData);
        }
      }
    });

  console.log(allFiles); //@TODO send to server to upload as zip
  console.log(JSON.stringify(data));

  const Id = 1; // workflow id
  const Information = "";
  const result = { Id, Information, Steps };

  const builder = new xml2js.Builder({ rootName: "WorkflowDefinition" });
  const xml = builder.buildObject(result);

  //@TODO add xml headers
  // var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
  // saveAs(blob, "../../tmp/hello.xml");

  console.log(xml);
};
