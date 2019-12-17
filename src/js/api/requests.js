import fetch from "node-fetch";
import { app } from "../app";
import { Decorators } from "divaservices-utils";
import {
  SERVICES_API,
  WEBSERVICES_XML_FILEPATH,
  COLLECTIONS_API,
  WORKFLOWS_API
} from "../../config";

export const getServicesAPI = async () => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const xmlApi = await fetch(SERVICES_API);
    xml = await xmlApi.text();
  } else {
    const filepath = WEBSERVICES_XML_FILEPATH;
    xml = (await import(`!!raw-loader!../../${filepath}`)).default;
  }
  return xml;
};

export const sendWorkflowSteps = async (xml, installation = false) => {
  // const xhr = new XMLHttpRequest();
  // xhr.open(
  //   "POST",
  //   "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow/save?id=" +
  //     app.workflowId,
  //   true
  // );
  // xhr.setRequestHeader("Content-Type", "text/xml");
  // xhr.setRequestHeader("username", USERNAME);
  // xhr.setRequestHeader("password", PASSWORD);
  // xhr.send(xml);

  const install = installation ? "install=true&" : "";

  return await fetch(`${WORKFLOWS_API}/save?${install}id=${app.workflowId}`, {
    method: "POST",
    body: xml,
    headers: {
      "Content-Type": "text/xml"
    }
  });
};

export const openWorkflowFromId = async id => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const workflow = await fetch(`${WORKFLOWS_API}?id=${id}`, {
      headers: {
        "Content-Type": "text/xml"
      }
    });
    xml = await workflow.text();
  } else {
    xml = `<Workflow>
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
  }
  return xml;
};

export const getCollectionsAPI = async () => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const xmlApi = await fetch(COLLECTIONS_API);
    xml = await xmlApi.text();
  } else {
    // const filepath = "collections.xml";
    // xml = (await import(`raw-loader!./${filepath}`)).default;
    xml = `<Collections>
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
  }

  return await Decorators.collectionsDecorator(xml);
};
