import xml2js from "xml2js";
import {
  WEBSERVICES_XML_FILEPATH,
  INPUTS_DATA_XML_FILEPATH
} from "../../config";
import webservicesDecorator from "./webservicesDecorator";
import { dataTestDecorator } from "./dataTestDecorator";

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
  const filepath = WEBSERVICES_XML_FILEPATH;
  const xml = (await import(`!!raw-loader!../../${filepath}`)).default;
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
