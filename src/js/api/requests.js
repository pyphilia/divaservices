/**
 * This file contains all requests to fetch or send
 * data to DIVA Services
 */

import { Decorators, API } from "divaservices-utils";
import { WEBSERVICES_XML_FILEPATH } from "../../config";
import { webservices } from "../constants/globals";
import { PRODUCTION_MODE } from "../constants/constants";

export const getServices = async () => {
  if (process.env.NODE_ENV === PRODUCTION_MODE) {
    return await API.getServices();
  } else {
    const filepath = WEBSERVICES_XML_FILEPATH;
    const xml = (await import(`!!raw-loader!../../${filepath}`)).default;
    return await Decorators.webservicesDecorator(xml);
  }
};

export const getWorkflowById = async (id, asXml = false) => {
  if (process.env.NODE_ENV === PRODUCTION_MODE) {
    if (asXml) {
      return await API.getWorkflowByIdJSON(id);
    } else {
      return await API.getWorkflowById(id, webservices);
    }
  } else {
    const xml = `<Workflow>
    <Id>116</Id>
    <Information>
        <Name>new rofklow</Name>
        <Author/>
    </Information>
    <Steps>
    <Step> <No>0</No> <Name>FilePickermimetypes</Name> <Service> <Key>47</Key> </Service> <Inputs> <Parameter> <Name>regex</Name> <Value>12345</Value> </Parameter> </Inputs> </Step> <Step> <No>1</No> <Name>OcropusBinarization</Name> <Service> <Key>6</Key> </Service> <Inputs> <Parameter> <Name>enableSkew</Name> <Value>true</Value> </Parameter> </Inputs> </Step> 
    </Steps>
</Workflow>`;
    return asXml ? xml : await Decorators.workflowDecorator(xml, webservices);
  }
};

export const getCollections = async () => {
  if (process.env.NODE_ENV === PRODUCTION_MODE) {
    return await API.getCollections();
  } else {
    // const filepath = "collections.xml";
    // xml = (await import(`raw-loader!./${filepath}`)).default;
    const xml = `<Collections>
    <Collection>
    <Id>134</Id>
    <Url>http://134.21.72.190:8080/collections/qwertz</Url>
    <Author/>
    <Name>qwertz</Name>
    <Files>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299913_0.jpg</Url>
            <Identifier>qwertz/2299913_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299918_0.jpg</Url>
            <Identifier>qwertz/2299918_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299907_0.jpg</Url>
            <Identifier>qwertz/2299907_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2986434_0.jpg</Url>
            <Identifier>qwertz/2986434_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    </Files>
</Collection>
<Collection>
    <Id>134</Id>
    <Url>http://134.21.72.190:8080/collections/qwertz</Url>
    <Author/>
    <Name>qwertz</Name>
    <Files>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299913_0.jpg</Url>
            <Identifier>qwertz/2299913_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299918_0.jpg</Url>
            <Identifier>qwertz/2299918_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299907_0.jpg</Url>
            <Identifier>qwertz/2299907_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2986434_0.jpg</Url>
            <Identifier>qwertz/2986434_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    </Files>
</Collection>
<Collection>
    <Id>134</Id>
    <Url>http://134.21.72.190:8080/collections/qwertz</Url>
    <Author/>
    <Name>qwertz</Name>
    <Files>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299913_0.jpg</Url>
            <Identifier>qwertz/2299913_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299918_0.jpg</Url>
            <Identifier>qwertz/2299918_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299907_0.jpg</Url>
            <Identifier>qwertz/2299907_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2986434_0.jpg</Url>
            <Identifier>qwertz/2986434_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    </Files>
</Collection>
<Collection>
    <Id>134</Id>
    <Url>http://134.21.72.190:8080/collections/qwertz</Url>
    <Author/>
    <Name>qwertz</Name>
    <Files>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299942_0.jpg</Url>
            <Identifier>qwertz/2299942_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299913_0.jpg</Url>
            <Identifier>qwertz/2299913_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299918_0.jpg</Url>
            <Identifier>qwertz/2299918_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
        <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2299907_0.jpg</Url>
            <Identifier>qwertz/2299907_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    <File>
            <Url>http://134.21.72.190:8080/files/qwertz/original/2986434_0.jpg</Url>
            <Identifier>qwertz/2986434_0.jpg</Identifier>
            <Options>
            <Mime-type>image/jpeg</Mime-type>
            </Options>
        </File>
    </Files>
</Collection></Collections>`;
    return await Decorators.collectionsDecorator(xml);
  }
};
