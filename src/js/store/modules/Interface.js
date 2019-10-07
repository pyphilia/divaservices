import { addElementByName } from "../../elements/addElement";
import selectionMutations from "./Selection/mutations";
import areaSelectionMutations from "./AreaSelection/mutations";
import areaSelectionState from "./AreaSelection/state";
import { generateUniqueId } from "../../layout/utils";

const addElementToElements = (elements, element) => {
  elements.push({ ...element, selected: false, deleted: false, copied: false });
};

const deleteElement = element => {
  element.deleted = true;
};

export const selectElementByBoxId = (elements, boxId) => {
  const el = elements.filter(el => el.boxId == boxId)[0];
  el.selected = true;
};

const Interface = {
  namespaced: true,
  state: {
    elements: [],
    ...areaSelectionState
  },
  // getters: {
  //   getPaper: state => {
  //     return state.paper;
  //   }
  // },
  mutations: {
    clearSelection(state) {
      state.selectedElements = [];
    },
    setCopiedElements(state) {
      state.copiedElements = state.selectedElements;
    },

    ADD_ELEMENT(state, { element }) {
      console.log("TCL: ADD_ELEMENT -> element", element);
      addElementToElements(state.elements, element);
    },
    ADD_ELEMENTS(state, { elements }) {
      for (const el of elements) {
        const fromId = el.boxId; // duplicate case, reference to another element
        addElementToElements(state.elements, {
          ...el,
          fromId,
          boxId: generateUniqueId()
        });
      }
    },
    DELETE_ELEMENTS(state, { elements }) {
      for (const el of elements) {
        deleteElement(el);
      }
    },
    ADD_ELEMENT_TO_SELECTION(state, { model }) {
      const { boxId } = model.attributes;
      selectElementByBoxId(state.elements, boxId);
    },
    ADD_ELEMENTS_TO_SELECTION(state, { elements }) {
      for (const { model } of elements) {
        const { boxId } = model.attributes;
        selectElementByBoxId(state.elements, boxId);
      }
    },
    UNSELECT_ALL_ELEMENTS(state) {
      state.elements.map(el => (el.selected = false));
    },
    COPY_SELECTION(state) {
      state.elements
        .filter(el => el.selected)
        .forEach(el => (el.copied = true));
    },
    // setSelectValueInElement(state, { element, value, attr }) {
    // element might not exist in arr yet
    // const el = state.elements.filter(el => el.boxId == element.attributes.boxId)[0]
    // el.defaultParams[attr].value = value;
    // console.log('el', el);
    // },
    ...selectionMutations,
    ...areaSelectionMutations
  },
  actions: {
    addElementByName({ commit }, name) {
      const element = addElementByName(name);
      // boxId, size, position, defaultParams
      commit("ADD_ELEMENT", { element });
    },
    duplicateElements({ commit }, { elements }) {
      console.log("TCL: duplicateElmts");
      commit("ADD_ELEMENTS", {
        elements
      });
    },
    deleteElements({ commit }, { elements }) {
      console.log("TCL: delete selected");
      commit("DELETE_ELEMENTS", {
        elements
      });
    },
    addElementToSelection({ commit }, payload) {
      commit("ADD_ELEMENT_TO_SELECTION", payload);
    },
    unSelectAllElements({ commit }) {
      commit("UNSELECT_ALL_ELEMENTS");
    },
    copySelectedElements({ commit }) {
      commit("COPY_SELECTION");
    }
  },
  getters: {}
};

export default Interface;
