// require('dotenv').config(); // this loads the defined variables from .env

export const {
  HOST = "/",
  API = "http://divaservices.unifr.ch/api/v2/",
  WEBSERVICES_XML_FILEPATH = "api/services.xml",
  INPUTS_DATA_XML_FILEPATH = "api/inputData.xml"
} = process.env;

// layout options
export const DEFAULT_OPTIONS = {
  showParameters: true,
  showPortDetails: true,
  showPorts: true,
  showTooltips: true
};
