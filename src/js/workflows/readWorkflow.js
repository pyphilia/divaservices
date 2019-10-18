/**
 * Read a workflow from a xml file and open it
 * in the main interface area
 */
import xml2js from "xml2js";
import path from "path";
import { HOST } from "../../config";
import { webservices } from "../constants/globals";
import { buildElementFromName } from "../elements/addElement";
import { Inputs } from "../constants/constants";
import { app } from "../app";

export const readWorkflow = async () => {
  const filepath = path.join(HOST, "files/tmp.xml");

  let xml = await fetch(filepath).then(response => response.text());
  const elements = [];
  const links = [];

  xml2js.parseString(xml, async (err, json) => {
    for (const step of json.WorkflowDefinition.Steps[0].Step) {
      const {
        Id: [id], // from saveWorkflow, id  is defined with the boxId
        Inputs: [inputs],
        Name: [name],
        Service: [service]
      } = step;

      const webserviceObj = webservices.find(
        webservice => webservice.id == service.Key[0]
      );
      if (webserviceObj.length) {
        alert("step ", name, " not found");
      }

      //@TODO check defaultParams match with definition
      const { Parameter, Data } = inputs;
      const defaultParams = {
        [Inputs.SELECT.type]: {},
        [Inputs.NUMBER.type]: {}
      };

      if (Parameter) {
        for (const param of Parameter) {
          const {
            paramName: [name],
            Value: [value]
          } = param;

          const type = webserviceObj.inputs.find(input => input.name == name)
            .type;

          defaultParams[type][name] = value;
        }
      }

      // store links
      if (Data) {
        for (const port of Data) {
          const {
            Value: [value],
            Name: [portName]
          } = port;
          const {
            Ref: [ref],
            ServiceOutputName: [serviceName]
          } = value.WorkflowStep[0];

          const source = {
            boxId: ref,
            portName: serviceName
          };
          const target = { boxId: id, portName };
          links.push({
            source,
            target
          });
        }
      }

      const information = { id };

      // add element
      const param = buildElementFromName(webserviceObj.name);

      const element = {
        ...param,
        information,
        defaultParams,
        boxId: id
      };

      elements.push(element);
    }
  });

  app.openWorkflow({ elements, links });
};
