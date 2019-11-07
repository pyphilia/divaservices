import Vue from "vue";
import { cloneDeep } from "lodash";
import { buildElementFromName } from "../../elements/addElement";
import {
  generateUniqueId,
  getElementByBoxId,
  findEmptyPosition
} from "../../layout/utils";
import { Inputs } from "../../constants/constants";
import {
  addElementToElements,
  deleteElement,
  selectElementByBoxId,
  selectedElements,
  selectElement,
  addLinktoLinks,
  removeLinksWithDeletedElements
} from "./utils";
import {
  ADD_ELEMENT,
  DELETE_ELEMENTS,
  ADD_ELEMENTS,
  ADD_ELEMENT_TO_SELECTION,
  ADD_ELEMENTS_TO_SELECTION,
  DELETE_LINK,
  ADD_LINK,
  SET_INPUT_VALUE,
  SET_SELECT_VALUE,
  COPY_SELECTION,
  UNSELECT_ALL_ELEMENTS,
  MOVE_ELEMENTS,
  CLEAR_ELEMENTS,
  RESIZE_ELEMENT,
  OPEN_WORKFLOW,
  UPDATE_DATA_IN_DATA_ELEMENT,
  ADD_UNIQUE_ELEMENT_TO_SELECTION
} from "../mutationsTypes";
import { fireAlert } from "../../utils/alerts";
import { MESSAGE_PASTE_SUCCESS } from "../../constants/messages";
import { buildDataElement } from "../../elements/addDataElement";

const Interface = {
  namespaced: true,
  state: {
    elements: [],
    links: []
  },
  mutations: {
    [ADD_ELEMENT](state, element) {
      addElementToElements(state.elements, element);
    },
    [ADD_ELEMENTS](state, { elements }) {
      for (const el of elements) {
        addElementToElements(state.elements, el);
      }
    },
    [CLEAR_ELEMENTS](state) {
      state.elements = [];
    },
    [DELETE_ELEMENTS](state, { elements }) {
      for (const el of elements) {
        deleteElement(el);
      }

      state.links = removeLinksWithDeletedElements(state.elements, state.links);
    },
    [ADD_ELEMENT_TO_SELECTION](state, { model }) {
      const { boxId } = model.attributes;
      selectElementByBoxId(state.elements, boxId);
    },
    [ADD_UNIQUE_ELEMENT_TO_SELECTION](state, { model }) {
      state.elements.map(el => (el.selected = false));
      const { boxId } = model.attributes;
      selectElementByBoxId(state.elements, boxId);
    },
    [ADD_ELEMENTS_TO_SELECTION](state, { elements }) {
      for (const el of elements) {
        selectElement(el);
      }
    },
    [UNSELECT_ALL_ELEMENTS](state) {
      state.elements.map(el => (el.selected = false));
    },
    [COPY_SELECTION](state) {
      state.elements.forEach(el => (el.copied = el.selected));
    },
    [SET_SELECT_VALUE](state, { element, value, attr }) {
      const el = state.elements.find(
        el => el.boxId == element.attributes.boxId
      );
      Vue.set(el.defaultParams[Inputs.SELECT.type][attr], "value", value);
    },
    [SET_INPUT_VALUE](state, { element, value, attr }) {
      const el = state.elements.find(
        el => el.boxId == element.attributes.boxId
      );
      Vue.set(el.defaultParams[Inputs.NUMBER.type][attr], "value", value);
    },
    [ADD_LINK](state, { link, graph }) {
      addLinktoLinks(state.links, link, graph);
    },
    [DELETE_LINK](state, { link }) {
      state.links = state.links.filter(thisL => thisL.id != link.id);
    },
    [MOVE_ELEMENTS](state, { elements }) {
      for (const el of elements) {
        const { boxId } = el;
        const graphEl = getElementByBoxId(boxId);
        el.position = graphEl.position();
      }
    },
    [RESIZE_ELEMENT](state, { element, size }) {
      element.size = size;
    },
    [OPEN_WORKFLOW](state, { elements, links }) {
      for (const el of elements) {
        addElementToElements(state.elements, el);
      }
      for (const link of links) {
        link.id = generateUniqueId();
        state.links.push(link);
      }
    },
    [UPDATE_DATA_IN_DATA_ELEMENT](state, { boxId, data }) {
      const el = state.elements.find(el => el.boxId == boxId);
      el.data = data;
    }
  },
  actions: {
    addElementByName({ commit }, name) {
      // buils necessary data to build an element afterwards
      const elementPayload = buildElementFromName(name);
      commit(ADD_ELEMENT, elementPayload);
    },
    addDataElement({ commit }, name) {
      const el = buildDataElement(name);
      commit(ADD_ELEMENT, el);
    },
    clearElements({ commit }) {
      commit(CLEAR_ELEMENTS);
    },
    duplicateElements({ commit }, { elements }) {
      const newElements = [];
      for (const el of elements) {
        const fromId = el.boxId; // duplicate case, reference to another element
        newElements.push({
          ...cloneDeep(el),
          fromId,
          position: findEmptyPosition(el.size, { ...el.position }),
          boxId: generateUniqueId()
        });
      }

      commit(ADD_ELEMENTS, {
        elements: newElements
      });
      fireAlert("success", MESSAGE_PASTE_SUCCESS);
    },
    deleteElements({ commit }, { elements }) {
      commit(DELETE_ELEMENTS, {
        elements
      });
    },
    addElementToSelection({ commit }, payload) {
      commit(ADD_ELEMENT_TO_SELECTION, payload);
    },
    addUniqueElementToSelection({ commit }, payload) {
      commit(ADD_UNIQUE_ELEMENT_TO_SELECTION, payload);
    },
    unSelectAllElements({ commit }) {
      commit(UNSELECT_ALL_ELEMENTS);
    },
    selectAllElements({ commit, state }) {
      commit(ADD_ELEMENTS_TO_SELECTION, { elements: state.elements });
    },
    copySelectedElements({ commit }) {
      commit(COPY_SELECTION);
    },
    setSelectValueInElement({ commit }, payload) {
      commit(SET_SELECT_VALUE, payload);
    },
    setInputValueInElement({ commit }, payload) {
      commit(SET_INPUT_VALUE, payload);
    },
    addLink({ commit }, payload) {
      commit(ADD_LINK, payload);
    },
    deleteLink({ commit }, payload) {
      commit(DELETE_LINK, payload);
    },
    moveSelectedElements({ commit, state }) {
      commit(MOVE_ELEMENTS, { elements: selectedElements(state.elements) });
    },
    resizeElement({ commit }, payload) {
      commit(RESIZE_ELEMENT, payload);
    },
    openWorkflow({ commit }, payload) {
      commit(OPEN_WORKFLOW, payload);
    },
    updateDataInDataElement({ commit }, payload) {
      commit(UPDATE_DATA_IN_DATA_ELEMENT, payload);
    }
  }
};

export default Interface;
