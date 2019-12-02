// require('dotenv').config(); // this loads the defined variables from .env

export const {
  HOST = "/",
  API = "http://divaservices.unifr.ch/api/v2/",
  WEBSERVICES_XML_FILEPATH = "api/services.xml",
  INPUTS_DATA_XML_FILEPATH = "api/inputData.xml",
  USERNAME = "",
  PASSWORD = "",
  SERVICES_API = "",
  COLLECTIONS_API = "http://134.21.72.190:8080/collections",
  BASE_URL = "http://diufvm17.unifr.ch:8080/exist/projects/diae/"
} = process.env;
