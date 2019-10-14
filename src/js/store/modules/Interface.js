import Vue from "vue";
import cloneDeep from "lodash.clonedeep";
import {
  buildElementFromName,
  findEmptyPosition
} from "../../elements/addElement";
import { generateUniqueId, getElementByBoxId } from "../../layout/utils";
import { Inputs } from "../../constants/constants";
import {
  buildLinkForStore,
  addElementToElements,
  deleteElement,
  selectElementByBoxId,
  selectedElements
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
  MOVE_ELEMENTS
} from "../mutationsTypes";
import { fireAlert } from "../../utils/alerts";
import { MESSAGE_PASTE_SUCCESS } from "../../constants/messages";

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
        const fromId = el.boxId; // duplicate case, reference to another element
        addElementToElements(state.elements, {
          ...cloneDeep(el),
          fromId,
          position: findEmptyPosition(el.size, { ...el.position }),
          boxId: generateUniqueId()
        });
      }
    },
    [DELETE_ELEMENTS](state, { elements }) {
      for (const el of elements) {
        deleteElement(state.elements, el);
      }
    },
    [ADD_ELEMENT_TO_SELECTION](state, { model }) {
      const { boxId } = model.attributes;
      selectElementByBoxId(state.elements, boxId);
    },
    [ADD_ELEMENTS_TO_SELECTION](state, { elements }) {
      for (const { model } of elements) {
        const { boxId } = model.attributes;
        selectElementByBoxId(state.elements, boxId);
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
      const l = buildLinkForStore(graph, link);
      state.links.push(l);
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
    }
  },
  actions: {
    addElementByName({ commit }, name) {
      // buils necessary data to build an element afterwards
      const elementPayload = buildElementFromName(name);
      commit(ADD_ELEMENT, elementPayload);
    },
    duplicateElements({ commit }, { elements }) {
      commit(ADD_ELEMENTS, {
        elements
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
    unSelectAllElements({ commit }) {
      commit(UNSELECT_ALL_ELEMENTS);
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
    }
  }
};

export default Interface;
