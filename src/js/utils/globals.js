import { getServices } from "../api/requests";
import { DATATEST_TYPE } from "./constants";

export let webservices;
export let dataInputs;

const _initDataInputs = async () => {
  dataInputs = [
    ...new Set( // remove duplicates
      webservices
        .map(service =>
          service.inputs.map(inp =>
            inp.mimeTypes ? inp.mimeTypes.allowed : null
          )
        )
        .flat(2)
        .filter(Boolean) // flat and filter null values
    )
  ].map(mimetype => ({
    name: mimetype,
    category: DATATEST_TYPE,
    outputType: mimetype.split("/")[0],
    mimeType: mimetype
  }));
};

// init webservices from xml file
export const initWebservices = async () => {
  webservices = await getServices();
  await _initDataInputs();
};

export const getWebserviceByName = name => {
  const webservice = webservices.find(service => service.name === name);
  if (!webservice) {
    throw "Cannot find webservice with name " + name;
  }
  return webservice;
};

export const getWebserviceById = id => {
  const webservice = webservices.find(webservice => webservice.id == id);
  if (!webservice) {
    throw "Cannot find webservice with id " + id;
  }
  return webservice;
};

export const getDataInputByName = name => {
  const dataInput = dataInputs.find(inp => inp.name === name);
  if (!dataInput) {
    throw "Cannot find dataInput with name " + name;
  }
  return dataInput;
};
