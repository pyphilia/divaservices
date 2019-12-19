/**
 * Read a workflow from a xml file and open it
 * in the main interface area
 */
import xml2js from "xml2js";
import mime from "mime-types";
import { getWebserviceById } from "../constants/globals";
import {
  buildElementFromName,
  buildDefaultParameters
} from "../elements/addElement";
import { app } from "../app";
import { isParamInput, generateUniqueId } from "../layout/utils";
import { getWorkflowById } from "../api/requests";
import { buildDataElement } from "../elements/addDataElement";
import { API } from "divaservices-utils";

export const readWorkflow = async id => {
  const xml = await getWorkflowById(id, true);
  const elements = [];
  const links = [];
  const linksTmp = [];

  xml2js.parseString(xml, async (err, json) => {
    if (!json.Workflow.Steps) {
      return;
    }

    const { Step = [] } = json.Workflow.Steps[0];

    for (const step of Step) {
      const {
        No: [no],
        Inputs: [inputs],
        Name: [name],
        Service: [service]
      } = step;

      const boxId = generateUniqueId();

      const webserviceObj = getWebserviceById(service.Key[0]);
      if (webserviceObj.length) {
        alert("step ", name, " not found");
      }
      //@TODO check defaultParams match with definition
      const { Parameter, Data } = inputs;
      const defaultParams = buildDefaultParameters(
        webserviceObj.inputs.filter(inp => isParamInput(inp))
      );

      if (Parameter) {
        for (const param of Parameter) {
          const {
            Name: [name],
            Value: [value]
          } = param;

          const type = webserviceObj.inputs.find(input => input.name == name)
            .type;

          defaultParams[type][name].value = value;
        }
      }

      if (Data) {
        for (const port of Data) {
          const {
            Value,
            Name: [portName],
            Path
          } = port;
          if (Value) {
            linksTmp.push({
              targetBoxId: boxId,
              source: Value[0].WorkflowStep[0],
              portName
            });
          } else if (Path) {
            // add input box
            const ref = generateUniqueId();
            const mimetype = mime.lookup(Path[0]);
            const identifier = Path[0];
            const dataEl = buildDataElement(mimetype, [
              {
                identifier,
                url: API.buildFileUrlFromIdentifier(identifier),
                options: {
                  "mime-type": mimetype
                }
              }
            ]); // @TODO path is an array of files
            elements.push({ ...dataEl, no: ref });
            linksTmp.push({
              targetBoxId: boxId,
              source: { Ref: [ref], ServiceOutputName: [mimetype] },
              portName
            });
          }
        }
      }

      const information = { boxId };

      // add element
      const param = buildElementFromName(webserviceObj.name);

      const element = {
        no,
        ...param,
        information,
        defaultParams,
        boxId
      };

      elements.push(element);
    }
  });

  for (const link of linksTmp) {
    const {
      targetBoxId,
      source: {
        Ref: [ref],
        ServiceOutputName: [serviceName]
      },
      portName
    } = link;
    // store links

    // find corresponding step with given ref
    const sourceStep = elements.find(({ no }) => no == ref);
    const sourceBoxId = sourceStep.boxId;
    const source = {
      boxId: sourceBoxId,
      portName: serviceName
    };
    const target = { boxId: targetBoxId, portName };
    links.push({
      id: generateUniqueId(),
      source,
      target
    });
  }

  app.openWorkflow({ elements, links });
};
