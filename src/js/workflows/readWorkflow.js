/**
 * Read a workflow from a xml file and open it
 * in the main interface area
 */
import xml2js from "xml2js";
import path from "path";
import { HOST } from "../../config";
import { webservices } from "../constants/globals";
import {
  addElementToGraphFromServiceDescription,
  addLinkFromJSON,
  buildElementFromName
} from "../elements/addElement";
import { Inputs } from "../constants/constants";

export const readWorkflow = async () => {
  const filepath = path.join(HOST, "files/tmp.xml");

  let xml = await fetch(filepath).then(response => response.text());
  const elements = [];

  xml2js.parseString(xml, async (err, json) => {
    let totalWidth = 100;
    const idMap = {}; // we construct new boxes, so the id are different
    const links = [];
    for (const step of json.WorkflowDefinition.Steps[0].Step) {
      const {
        Id: [id],
        Inputs: [inputs],
        Name: [name],
        Service: [service]
      } = step;

      const webserviceObj = webservices.find(
        //@TODO need to read key value --- workflow will keep key in parameters
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
      const position = { x: totalWidth, y: 100 };

      console.log(defaultParams);
      // add element
      const param = buildElementFromName(webserviceObj.name);
      const element = addElementToGraphFromServiceDescription(webserviceObj, {
        ...param,
        information,
        defaultParams,
        boxId: id,
        position
      });

      // update position to avoid overlap
      totalWidth += element.attributes.size.width + 250;

      elements.push(element);

      // map ids and ports
      idMap[step.Id[0]] = {
        id: element.attributes.id,
        ports: element.getPorts()
      };
    }

    // remap all link to correct box and port ids
    for (const link of links) {
      const { source, target } = link;

      const sMapedBox = idMap[source.boxId];
      const tMapedBox = idMap[target.boxId];

      const sPortId = sMapedBox.ports.find(port => port.name == source.portName)
        .id;
      const tPortId = tMapedBox.ports.find(port => port.name == target.portName)
        .id;
      const linkObj = {
        source: { id: sMapedBox.id, port: sPortId },
        target: { id: tMapedBox.id, port: tPortId }
      };

      addLinkFromJSON(linkObj);
    }
  });

  const boxIds = elements.map(element => element.attributes.boxId);
  return { boxIds };
};
