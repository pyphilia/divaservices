import fetch from "node-fetch";
import { app } from "../app";
import { Decorators } from "divaservices-utils";
import {
  USERNAME,
  PASSWORD,
  SERVICES_API,
  WEBSERVICES_XML_FILEPATH,
  COLLECTIONS_API
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

export const sendWorkflowSteps = xml => {
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

  fetch(
    "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow/save?id=" +
      app.workflowId,
    {
      method: "POST",
      body: xml,
      headers: {
        "Content-Type": "text/xml",
        username: USERNAME,
        password: PASSWORD
      }
    }
  );
};

export const openWorkflowFromId = async id => {
  let xml;
  if (process.env.NODE_ENV === "production") {
    const workflow = await fetch(
      "http://diufvm17.unifr.ch:8080/exist/projects/diae/api/workflow?id=" + id,
      {
        headers: {
          "Content-Type": "text/xml"
        }
      }
    );
    xml = await workflow.text();
  } else {
    const filepath = "api/example.xml";
    xml = (await import(`!!raw-loader!../../${filepath}`)).default;
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
