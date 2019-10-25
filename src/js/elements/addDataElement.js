import * as joint from "jointjs";
import { app } from "../app";
import { getDataInputByName } from "../constants/globals";
import {
  THEME,
  CATEGORY_DATATEST,
  MimeTypes,
  PORT_MARKUP
} from "../constants/constants";
import {
  generateUniqueId,
  buildPortAttrs,
  findEmptyPosition
} from "../layout/utils";
import {
  OUT_PORT_CLASS,
  DATA_BOX_FOREIGNOBJECT_CLASS,
  INTERFACE_ROOT,
  DATA_INPUT_CONTENT_CLASS
} from "../constants/selectors";
import { layoutSettingsApp } from "../layoutSettings";

const buildDataMarkup = ({ boxId, size }) => {
  const markup = `<g class="scalable"><rect></rect></g>
  <foreignObject class="${DATA_BOX_FOREIGNOBJECT_CLASS}" boxId="${boxId}" 
  x="0" y="-7" width="${size.width}" height="${size.height}" style="">
  <body xmlns="http://www.w3.org/1999/xhtml">
  </body>
  </foreignObject>`;
  return markup;
};

const buildBasicDataRect = ({
  name,
  size,
  ports,
  boxId,
  mimeType,
  outputType
}) => {
  const position = findEmptyPosition(size);
  const rect = joint.shapes.basic.Rect.define(name, {
    markup: buildDataMarkup({ outputType, mimeType, size, boxId }),
    category: CATEGORY_DATATEST,
    position,
    size,
    boxId,
    attrs: {
      root: {
        magnet: false
      },
      body: THEME.body,
      rect: { ...THEME.rect, ...size }
    },
    ports,
    portMarkup: PORT_MARKUP
  });
  return new rect();
};

const createNumberInput = () => {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.classList.add("form-control");
  input.setAttribute("name", "datatest");
  return input;
};

const createFolderInput = boxId => {
  const input = document.createElement("input");
  input.classList.add("btn");
  input.setAttribute("type", "file");
  input.multiple = true;
  input.directory = true;
  input.webkitdirectory = true;
  input.mozdirectory = true;
  input.msdirectory = true;
  input.odirectory = true;
  input.addEventListener("change", function() {
    const data = [...this.files];
    app.updateDataInDataElement({ boxId, data });
  });
  return input;
};

const createFileInput = ({ mimeType, boxId }) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.classList.add("btn");
  input.setAttribute("accept", mimeType);
  input.addEventListener("change", function() {
    const data = [...this.files];
    app.updateDataInDataElement({ boxId, data });
  });
  return input;
};

const createImgPreview = input => {
  const preview = document.createElement("div");
  preview.classList.add("preview");

  input.addEventListener("change", function() {
    var reader = new FileReader();
    const data = this.files[0]; // suppose only one file
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}"/> <span>${data.name}</span>`;
    };
    reader.readAsDataURL(data);
  });
  return preview;
};

const createContentBox = () => {
  const content = document.createElement("div");
  content.classList.add(DATA_INPUT_CONTENT_CLASS);
  content.style.display = layoutSettingsApp.isShowParametersChecked()
    ? "display"
    : "none";
  return content;
};

const addContent = ({ mimeType, outputType, boxId }) => {
  let content = createContentBox();
  switch (outputType) {
    case MimeTypes.number.type: {
      const input = createNumberInput(content);
      content.appendChild(input);
      break;
    }
    case MimeTypes.folder.type: {
      const input = createFolderInput(boxId);
      content.appendChild(input);
      break;
    }
    case MimeTypes.image.type: {
      const input = createFileInput({ mimeType, boxId });
      content.appendChild(input);

      // @TODO only if size okay
      // image preview
      const preview = createImgPreview(input, boxId);
      content.appendChild(preview);
      break;
    }
    default: {
      console.log("default for type : " + outputType);
      const input = createFileInput({ mimeType, boxId });
      content.appendChild(input);
    }
  }
  const foreignObj = document.querySelector(
    `${INTERFACE_ROOT} foreignObject[boxId="${boxId}"] body`
  );
  foreignObj.appendChild(content);
};

export const addDataBox = data => {
  const rectangle = buildBasicDataRect(data);
  rectangle.addTo(app.graph);
  addContent(data);
};

export const buildDataElement = elName => {
  const { name, mimeType, outputType } = getDataInputByName(elName);

  const size = {
    width: 300,
    height: 140
  };

  // handle ports
  const ports = {
    groups: THEME.groups,
    items: [
      {
        group: OUT_PORT_CLASS,
        name,
        attrs: buildPortAttrs(name, outputType, mimeType)
      }
    ]
  };

  const boxId = generateUniqueId();

  const position = position ? position : findEmptyPosition(size);

  return {
    category: CATEGORY_DATATEST,
    boxId,
    size,
    position,
    type: name,
    ports,
    outputType,
    mimeType,
    data: null
  };
};
