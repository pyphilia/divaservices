import Vue from "vue";
import { buildElementFromName } from "../../elements/addElement";
import selectionMutations from "./Selection/mutations";
import areaSelectionMutations from "./AreaSelection/mutations";
import areaSelectionState from "./AreaSelection/state";
import { generateUniqueId } from "../../layout/utils";
import { Inputs } from "../../constants/constants";

const addElementToElements = (elements, element) => {
  elements.push({
    ...element,
    selected: false,
    deleted: false,
    copied: false,
    paramsChanged: false
  });
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

    ADD_ELEMENT(state, element) {
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
    SET_SELECT_VALUE(state, { element, value, attr }) {
      const el = state.elements.find(
        el => el.boxId == element.attributes.boxId
      );
      Vue.set(el.defaultParams, Inputs.SELECT.type, {
        ...el.defaultParams[Inputs.SELECT.type],
        [attr]: { value }
      });
    },
    SET_INPUT_VALUE(state, { element, value, attr }) {
      const el = state.elements.find(
        el => el.boxId == element.attributes.boxId
      );
      Vue.set(el.defaultParams, Inputs.NUMBER.type, {
        ...el.defaultParams[Inputs.NUMBER.type],
        [attr]: { value }
      });
    },
    ...selectionMutations,
    ...areaSelectionMutations
  },
  actions: {
    addElementByName({ commit }, name) {
      // buils necessary data to build an element afterwards
      const elementPayload = buildElementFromName(name);
      commit("ADD_ELEMENT", elementPayload);
    },
    duplicateElements({ commit }, { elements }) {
      commit("ADD_ELEMENTS", {
        elements
      });
    },
    deleteElements({ commit }, { elements }) {
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
    },
    setSelectValueInElement({ commit }, payload) {
      commit("SET_SELECT_VALUE", payload);
    },
    setInputValueInElement({ commit }, payload) {
      commit("SET_INPUT_VALUE", payload);
    }
  }
};

export default Interface;
