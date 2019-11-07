import xml2js from "xml2js";
import { INPUTS_DATA_XML_FILEPATH } from "../../config";
import webservicesDecorator from "./webservicesDecorator";
import { dataTestDecorator } from "./dataTestDecorator";
import { getServicesAPI } from "../api/requests";

export let webservices;
export let dataInputs;

const createXml2jsPromise = xml => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const _initWebservices = async () => {
  const xml = await getServicesAPI();
  const data = await createXml2jsPromise(xml);
  webservices = webservicesDecorator(data);
};

const _initDataInputs = async () => {
  const inputDataFilePath = INPUTS_DATA_XML_FILEPATH;
  const inputDataXml = (await import(`!!raw-loader!../../${inputDataFilePath}`))
    .default;
  const dataTest = await createXml2jsPromise(inputDataXml);
  dataInputs = dataTestDecorator(dataTest);
};

// init webservices from xml file
export const initWebservices = async () => {
  await _initWebservices();
  await _initDataInputs();
};

export const getWebserviceByName = name => {
  const webservice = webservices.find(service => service.name == name);
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
  const dataInput = dataInputs.find(inp => inp.name == name);
  if (!dataInput) {
    throw "Cannot find dataInput with name " + name;
  }
  return dataInput;
};
