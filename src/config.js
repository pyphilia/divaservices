// require('dotenv').config(); // this loads the defined variables from .env

export const {
  HOST = "/",
  WEBSERVICES_XML_FILEPATH = "api/services.xml",
  SERVICES_API = "",
  COLLECTIONS_API_ENDPOINT = "api/collections",
  WORKFLOWS_API_ENDPOINT = "workflows",
  WORKFLOWS_EXECUTION_ENDPOINT = "exec",
  BASE_URL = "http://diufvm17.unifr.ch:8080/exist/projects/diae"
} = process.env;

export const WORKFLOWS_EXECUTION = `${BASE_URL}/${WORKFLOWS_EXECUTION_ENDPOINT}`;
export const COLLECTIONS_API = `${BASE_URL}/${COLLECTIONS_API_ENDPOINT}`;
export const WORKFLOWS_API = `${BASE_URL}/${WORKFLOWS_API_ENDPOINT}`;
