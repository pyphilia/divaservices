// require('dotenv').config(); // this loads the defined variables from .env

export const {
  HOST = "",
  API = "http://divaservices.unifr.ch/api/v2/",
  WEBSERVICES_XML = "api/services.xml"
} = process.env;

// layout options
export const DEFAULT_OPTIONS = {
  showParameters: true,
  showPortDetails: true,
  showPorts: true,
  showTooltips: true
};
