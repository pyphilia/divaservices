/**
 * Read a workflow from a xml file and open it
 * in the main interface area
 */
import xml2js from "xml2js";
import { getWebserviceById } from "../constants/globals";
import {
  buildElementFromName,
  buildDefaultParameters
} from "../elements/addElement";
import { app } from "../app";
import { isParamInput, generateUniqueId } from "../layout/utils";
import { openWorkflowFromId } from "../api/requests";

export const readWorkflow = async id => {
  const xml = await openWorkflowFromId(id);

  const elements = [];
  const links = [];
  const linksTmp = [];

  xml2js.parseString(xml, async (err, json) => {
    if (!json.WorkflowDefinition.Steps) {
      return;
    }

    const { Step = [] } = json.WorkflowDefinition.Steps[0];

    for (const step of Step) {
      const {
        // Id: [id], // from saveWorkflow, id  is defined with the boxId
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
            Value: [value],
            Name: [portName]
          } = port;
          linksTmp.push({ targetBoxId: boxId, value, portName });
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
    const { targetBoxId, value, portName } = link;

    // store links
    const {
      Ref: [ref],
      ServiceOutputName: [serviceName]
    } = value.WorkflowStep[0];

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
