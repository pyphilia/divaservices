import xml2js from "xml2js";
import path from "path";
import { HOST } from "../constants/constants";
import { webservices } from "../constants/globals";
import {
  addElementToGraphFromServiceDescription,
  addLinkFromJSON
} from "../elements/addElement";

export const readWorkflow = async () => {
  const filepath = path.join(HOST, "files/tmp.xml");

  let xml = await fetch(filepath).then(response => response.text());

  xml2js.parseString(xml, async (err, json) => {
    let totalWidth = 100;
    const idMap = {}; // we construct new boxes, so the id are different
    const elements = [];
    const links = [];
    for (const step of json.WorkflowDefinition.Steps[0].Step) {
      const {
        Id: [id],
        Inputs: [inputs],
        Name: [name],
        Service: [service]
      } = step;

      const webserviceObj = webservices.filter(
        //@TODO need to read key value --- workflow will keep key in parameters
        webservice => webservice.id == service.Key[0]
      )[0];
      if (webserviceObj.length) {
        alert("step ", name, " not found");
      }

      const { type: category } = webserviceObj;

      //@TODO check params match with definition
      const { Parameter, Data } = inputs;
      const params = {};
      if (Parameter) {
        for (const param of Parameter) {
          const {
            Name: [name],
            Value: [value]
          } = param;
          params[name] = value;
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

      // add element
      const element = addElementToGraphFromServiceDescription(
        webserviceObj,
        category,
        {
          information,
          params,
          position
        }
      );

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

      const sPortId = sMapedBox.ports.filter(
        port => port.name == source.portName
      )[0].id;
      const tPortId = tMapedBox.ports.filter(
        port => port.name == target.portName
      )[0].id;
      const linkObj = {
        source: { id: sMapedBox.id, port: sPortId },
        target: { id: tMapedBox.id, port: tPortId }
      };

      addLinkFromJSON(linkObj);
    }
  });
};
