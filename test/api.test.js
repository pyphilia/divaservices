import fetch from 'node-fetch';
import { matchers } from 'jest-json-schema';
expect.extend(matchers);

import {DIVA_SERVICES_API_URL} from '../src/js/constants';

const webservicesObjectSchema = {    
  properties: {
    name: { type: 'string' },
    url: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string' },
  },
  required: ['description', 'name', 'url', 'type'],
}


let webservices;

describe('test api whether conform', () => {
  
  beforeAll(async () => {
    const data = await fetch(DIVA_SERVICES_API_URL);
    webservices = await data.json();
  })
  
  test('webservices general array schema is conform',  async () => { 
    webservices.forEach(webservice => {
      expect(webservice).toMatchSchema(webservicesObjectSchema);
    })
  });
  
  
  // test('test 1', () => {
  //   console.log('test for describe outer');
  //   expect(true).toEqual(true);
  // });
});