import mime from "mime-types";
import {
  createElementObjectFromName,
  buildDefaultParameters
} from "../elements/addElement";
import { app } from "../app";
import { isParamInput, generateUniqueId } from "../layout/utils";
import { getWorkflowById } from "../api/requests";
import { buildDataElement } from "../elements/addDataElement";
import { API, Constants } from "divaservices-utils";

/**
 * Read a workflow from a xml file and display it
 * in the main interface area
 *
 * @param {number} id workflow id to read
 */
export const openWorkflow = async id => {
  const workflow = await getWorkflowById(id);

  const elements = [];
  const links = [];
  const linksTmp = [];

  if (!workflow.services) {
    return;
  }

  for (const step of workflow.services) {
    const boxId = generateUniqueId();

    // handle file and folder defined inputs -> data elements
    const definedFilesAndFolders = step.inputs.filter(
      ({ type, definedValue }) =>
        type === Constants.Types.FILE.type && definedValue !== undefined
    );

    for (const {
      name: portName,
      definedValue: { path, ref, serviceOutputName }
    } of definedFilesAndFolders) {
      // defined collection file
      if (ref !== undefined) {
        linksTmp.push({
          targetBoxId: boxId,
          source: { ref, serviceName: serviceOutputName },
          portName
        });
      }
      // defined data input
      else if (path !== undefined) {
        // add input box
        const ref = generateUniqueId();
        const mimetype = mime.lookup(path);
        const identifier = path;
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
          source: { ref, serviceName: mimetype },
          portName
        });
      }
    }

    // add element
    const param = createElementObjectFromName(step.name);

    const element = {
      no: step.no,
      ...param,
      information: { boxId },
      defaultParams: buildDefaultParameters(
        step.inputs.filter(inp => isParamInput(inp))
      ),
      boxId
    };

    elements.push(element);
  }

  // store links
  for (const link of linksTmp) {
    const {
      targetBoxId,
      source: { ref, serviceName },
      portName
    } = link;

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

  console.log(elements);
  console.log(links);

  app.$openWorkflow({ elements, links });
};
