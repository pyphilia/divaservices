import xml2js from "xml2js";
import { WEBSERVICES_XML_FILEPATH } from "../../config";
import webservicesDecorator from "./webservicesDecorator";

export let webservices;

// init webservices from xml file
export const initWebservices = async () => {
  const filepath = WEBSERVICES_XML_FILEPATH;
  const xml = (await import(`!!raw-loader!../../${filepath}`)).default;

  const xml2jsPromise = new Promise((resolve, reject) => {
    xml2js.parseString(xml, async (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  const data = await xml2jsPromise;

  console.log("---- webservices initialized");

  webservices = webservicesDecorator(data);
};
