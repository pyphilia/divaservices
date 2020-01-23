import xml2js from "xml2js";
import { getWebserviceByName } from "../constants/globals";
import { CATEGORY_SERVICE } from "../constants/constants";
import { XMLBuilders, DivaServices, API } from "divaservices-utils";
import { getOrderedElements } from "../elements/orderElement";
import { parameterIsValid } from "../layout/inputs";
import { currentDataElements } from "../store/modules/utils";
import Graph from "../classes/Graph";

/**
 * Read a workflow build within the main interface area
 * and transform as xml data
 *
 * @param {object} jsonGraph
 * @param {boolean} installation if true, send an installation request
 */
export const saveWorkflow = async (
  { elements, links, workflowId },
  installation = false
) => {
  const { elements: orderedElements, isLoop } = getOrderedElements(Graph.graph);

  const serviceOrderedElements = orderedElements.filter(
    ({ attributes: { category } }) => category === CATEGORY_SERVICE
  );

  const currentDataEls = currentDataElements(elements);

  const Steps = { Step: [] };
  const _steps = [];
  // NODE

  for (const [i, { attributes: box }] of serviceOrderedElements.entries()) {
    const { type, boxId } = box;
    const Name = DivaServices.buildServiceNameForRequest(type, boxId);
    const No = i;
    const Inputs = { Parameter: [], Data: [] };

    const _inputs = { parameters: {}, data: [] };

    // get actual defaultParams in store
    const defaultParams = elements.find(el => el.boxId == boxId).defaultParams;

    for (const [paramType, values] of Object.entries(defaultParams)) {
      for (const [paramName, options] of Object.entries(values)) {
        const { value: Value, defaultValue, values } = options;
        if (Value != defaultValue.toString()) {
          Inputs.Parameter.push({
            Name: paramName,
            Value
          });

          let parsedValue;
          try {
            parsedValue = DivaServices.parseParameterValue(Value, paramType);
          } catch (e) {
            console.log(e);
            parsedValue = Value;
          }
          _inputs.parameters[paramName] = parsedValue;
          parameterIsValid(parsedValue, paramType, values, {
            paramName,
            boxId,
            boxName: type
          });
        }
      }
    }

    // key in webservices list
    const currentService = getWebserviceByName(type);
    const { id: Key, method } = currentService;
    const Service = { Key };

    const _step = {
      name: Name,
      type: "regular",
      method,
      inputs: _inputs
    };
    _steps.push(_step);

    const step = { Id: boxId, No, Name, Service, Inputs };
    Steps.Step.push(step);
  }

  links.forEach(link => {
    const {
      source: { boxId: sourceId },
      target: { boxId: targetId }
    } = link;

    // search in steps step because it contains the inputs.data array
    const targetWebservice = Steps.Step.find(el => el.Id == targetId);
    const sourceWebservice = Steps.Step.find(el => el.Id == sourceId);
    const _targetWebservice = _steps.find(
      el => el.name === targetWebservice.Name
    );

    if (sourceWebservice) {
      const { No: Ref, Name: name } = sourceWebservice;
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

      _targetWebservice.inputs.data.push({
        [link.target.portName]: DivaServices.buildInputReferenceName(
          name,
          link.source.portName
        )
      });
    } else {
      const sourceDataBox = currentDataEls.find(el => el.boxId == sourceId);

      // @TODO get folder when folder type
      if (sourceDataBox.data && sourceDataBox.data.length) {
        const file = sourceDataBox.data[0]; // suppose one file
        // allFiles.push(file);
        // const dataName =
        //   DivaServices.buildInputNameForService(
        //     targetWebservice.Name,
        //     link.target.portName
        //   ) +
        //   "_" +
        //   i++;
        // const fileData = {
        //   [dataName]: file.identifier
        // };
        // data.push(fileData);

        targetWebservice.Inputs.Data.push({
          Name: link.target.portName,
          Path: file.identifier
        });
        _targetWebservice.inputs.data.push({
          [link.target.portName]: file.identifier
        });
      }
    }
  });

  // remove Id to match relax validation schema
  for (const step of Steps.Step) {
    delete step.Id;
  }

  // json request
  const request = JSON.stringify(_steps);
  console.log("TCL: request", request);

  // add json request to xml
  const builder = new xml2js.Builder({ rootName: "Steps" });
  const xml = builder.buildObject(Steps);
  const finalXml = XMLBuilders.SaveRequest(xml, request);
  console.log(finalXml);

  const isInstallation = installation && !isLoop;
  await API.saveWorkflow(xml, workflowId, isInstallation);

  if (isInstallation) {
    top.window.location.href = API.getWorkflowExecutionViewUrl(workflowId);
  }
};
