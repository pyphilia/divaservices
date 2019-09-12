import json
import requests
import xml.etree.cElementTree as ET

api_url_base = 'http://divaservices.unifr.ch/api/v2/'
filepath = "api.json"

def get_account_info():

    f= open(filepath,"a+")
    response = requests.get(api_url_base)

    if response.status_code == 200:
        res = json.loads(response.content.decode('utf-8'))
        
        for i in range(len(res)):
          algo = requests.get(res[i]['url'])

          if algo.status_code == 200:
            res[i]['algorithm'] = json.loads(algo.content.decode('utf-8'))
          
        f.write(json.dumps(res))

        f.close()
    else:
        return None


def createAlgoServiceFile():
  servicePath = 'services.xml' 
  services = open(servicePath,"w")

  
  with open(filepath) as f:
    d = json.load(f)
    text = ''
    for index, algo in enumerate(d):
      text +='<Service>'
      text += '<Name>' + algo['name'].replace(" ", "") + '</Name>'
      text += '<Id>' + str(index) + '</Id>'
      text += '</Service>'

  services.write(text)
  services.close()


def create_services_xml():

    response = requests.get(api_url_base)

    root = ET.Element("Services")

    if response.status_code == 200:
        res = json.loads(response.content.decode('utf-8'))
        
        for i in range(len(res)):
          url = res[i]['url']
          algo = requests.get(url)
          service = ET.SubElement(root, "Service")

          if algo.status_code == 200:
            algoJson = json.loads(algo.content.decode('utf-8'))

            # print(algoJson)

            ET.SubElement(service, 'Id').text = str(i)

            general = algoJson['general']
            information = ET.SubElement(service, 'Information')
            ET.SubElement(information, 'Name').text = general['name']

            api = ET.SubElement(service, 'API')
            ET.SubElement(api, 'BaseURL').text = url 



            inputs = ET.SubElement(api, 'Inputs')

            for inp in algoJson['input']:
              # print(inp)
              if 'file' in inp:
                el = ET.SubElement(inputs, 'Data')
                ET.SubElement(el, 'Name').text = inp['file']['name']
                ET.SubElement(el, 'Description').text = inp['file']['description']
                dataType = ET.SubElement(el, 'Type')
                fileEl = ET.SubElement(dataType, 'File')
                mime = ET.SubElement(fileEl, 'MimeTypes')
                
                for mimetypes in inp['file']['options']['mimeTypes']['allowed']:
                  ET.SubElement(mime, 'Allowed').text = mimetypes

              if 'folder' in inp:
                el = ET.SubElement(inputs, 'Data')
                ET.SubElement(el, 'Name').text = inp['folder']['name']
                ET.SubElement(el, 'Description').text = inp['folder']['description']
                dataType = ET.SubElement(el, 'Type')
                fileEl = ET.SubElement(dataType, 'Folder')
                # mime = ET.SubElement(fileEl, 'MimeTypes')
                # for mimetypes in inp['folder']['options']['mimeTypes']['allowed']:
                #   ET.SubElement(mime, 'Allowed').text = mimetypes

              elif 'outputfolder' in inp:
                continue

              elif 'number' in inp:
                # print(inp['number'])
                el = ET.SubElement(inputs, 'Parameter')
                if(not inp['number']['options']['required']):
                  el.attrib['Status'] = 'optional'

                ET.SubElement(el, 'Name').text = inp['number']['name']
                ET.SubElement(el, 'Description').text = inp['number']['description']

                dataType = ET.SubElement(el, 'Type')
                options = inp['number']['options']
                if 'min' in options or 'max' in options or 'steps' in options:
                  stepType = ET.SubElement(dataType, 'StepNumberType')
                  if 'min' in options:
                    ET.SubElement(stepType, 'Min').text = str(options['min'])
                  if 'max' in options:
                    ET.SubElement(stepType, 'Max').text = str(options['max'])
                  if 'steps' in options:
                    ET.SubElement(stepType, 'Step').text = str(options['steps'])
                  ET.SubElement(stepType, 'Default').text = str(options['default'])

              elif 'select' in inp:
                # print(inp['select'])
                el = ET.SubElement(inputs, 'Parameter')
                if(not inp['select']['options']['required']):
                  el.attrib['Status'] = 'optional'

                ET.SubElement(el, 'Name').text = inp['select']['name']
                ET.SubElement(el, 'Description').text = inp['select']['description']

                dataType = ET.SubElement(el, 'Type')
                enumType = ET.SubElement(dataType, 'EnumeratedType')
                options = inp['select']['options']
                for value in options['values']:
                  ET.SubElement(enumType, 'Value').text = str(value)
                ET.SubElement(enumType, 'Default').text = str(options['default'])
            


            outputs = ET.SubElement(api, 'Outputs')

            for out in algoJson['output']:
              if 'file' in out:
                output = ET.SubElement(outputs, 'Output')
                ET.SubElement(output, 'Name').text = out['file']['name']
                ET.SubElement(output, 'Description').text = out['file']['description']
                typeEl = ET.SubElement(output, 'Type')
                mimetypes = ET.SubElement(typeEl, 'MimeTypes')
                for types in out['file']['options']['mimeTypes']['allowed']:
                  ET.SubElement(mimetypes, 'Allowed').text = types

        tree = ET.ElementTree(root)
        tree.write("services.xml")
    else:
        return None

create_services_xml()