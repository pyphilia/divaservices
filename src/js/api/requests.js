import { Decorators, API } from "divaservices-utils";
import { WEBSERVICES_XML_FILEPATH } from "../../config";
import { webservices } from "../constants/globals";

export const getServices = async () => {
  if (process.env.NODE_ENV === "production") {
    return await API.getServices();
  } else {
    const filepath = WEBSERVICES_XML_FILEPATH;
    const xml = (await import(`!!raw-loader!../../${filepath}`)).default;
    return await Decorators.webservicesDecorator(xml);
  }
};

export const getWorkflowById = async (id, asXml = false) => {
  if (process.env.NODE_ENV === "production") {
    if (asXml) {
      return await API.getWorkflowByIdJSON(id);
    } else {
      return await API.getWorkflowById(id);
    }
  } else {
    const xml = `<Workflow>
    <Id>116</Id>
    <Information>
        <Name>new rofklow</Name>
        <Author/>
    </Information>
    <Steps>
  <Step>
    <No>0</No>
    <Name>OcropusBinarization</Name>
    <Service>
      <Key>6</Key>
    </Service>
    <Inputs>
      <Data>
        <Name>inputImage</Name>
        <Path>qwertz/2299942_0.jpg</Path>
      </Data>
    </Inputs>
  </Step>
  <Step>
    <No>1</No>
    <Name>OtsuBinarization</Name>
    <Service>
      <Key>0</Key>
    </Service>
    <Inputs>
      <Data>
        <Name>inputImage</Name>
        <Value>
          <WorkflowStep>
            <Ref>0</Ref>
            <ServiceOutputName>ocropusBinaryImage</ServiceOutputName>
          </WorkflowStep>
        </Value>
      </Data>
    </Inputs>
  </Step>
</Steps>
</Workflow>`;
    return asXml ? xml : await Decorators.workflowDecorator(xml, webservices);
  }
};

export const getCollections = async () => {
  if (process.env.NODE_ENV === "production") {
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
