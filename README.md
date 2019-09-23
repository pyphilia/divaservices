# DivaServices Workflow Interface

DivaServices is a project whose goal is to make Document Image Analysis (DIA)
methods accessible over the web. Their REST API proposes various documentanalysis
algorithms (also referred as web services), from binarization to complex
active learning methods, as well as image processing and feature extraction
algorithms.

Though one can easily run these algorithms separately, it is not an easy task to
build complete and logical series of them. Indeed, one should be careful about
inputs and parameters, which are very specific for every algorithm. Additionally, it
is not always convenient to define such series without a global and graphic view of
the result.

In order to solve these issues, we implement a user interface, where a whole
workflow (a logical succession of algorithms) can be created and edited. This
workflow will then be saved and installed on the DIVA platform and be run from
there.

## Installation

Once the repository is cloned, run `yarn` to install the dependencies.

To run the platform on development mode, run the command `yarn dev`. It will start the webpack server, build the source files and run the platform in out default browser. 

To build the final files, run `yarn build` or `yarn dist` for a compressed version. The resulting files will be saved in the `public` folder.  


## Implemented features
### Interface
- Zoom (in the mouse direction). A button allows the zoom to be reset.
- Pan
- Clear (reset the current workflow)
- Fit Content: allow the user to have an overview of the whole workflow.
- Context menu on right click. It provides the **Paste** and **Clear** operations. 
- Keyboard shortcut controls: 
  - copy
  - paste
  - delete
  - undo and redo: pasting, deleting, moving and adding elements, adding links are undo-redoable operations. 
- Layout custom options (Settings): show tooltips, show parameters, show ports, show port details

### Elements (Webservice box) and Links
- Add elements (from a corresponding button and with copy/paste). An algorithm is applied to avoid collision and overlapping (to be improve)
- Remove elements (from context menu or trash)
- Edit element's parameters (inputs and select). Each comes with a tooltip and a reset button.
- Moveable elements
- Linkeable elements. Only port whose types are matching can be linked.   
- Context menu on right click. It provides the **Copy**, **Delete** and **Duplicate** operations.
- Selection : Multiple elements can be selected. Selection is highlighted.

### Workflows
- Open an XML file and reconstruction of a workflow
- Save a workflow into an XML file

## Design
- Each algorithm category has an icon and a defined color (yet random and temporary).
- Each port format type has a defined colors (yet random and temporary) 
