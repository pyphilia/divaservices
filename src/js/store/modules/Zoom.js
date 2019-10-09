// import Vue from 'vue';
import { MIN_SCALE, MAX_SCALE, DEFAULT_SCALE } from "../../constants/constants";

const zoomStep = 75;

const computePaperCenterPosition = paper => {
  const bcr = paper.svg.getBoundingClientRect();
  const localRect1 = paper.clientToLocalRect({
    x: bcr.left,
    y: bcr.top,
    width: bcr.width,
    height: bcr.height
  });
  const { x, y } = localRect1.center();
  return { x, y };
};

const Zoom = {
  namespaced: true,
  state: {
    scale: DEFAULT_SCALE,
    x: 0,
    y: 0
  },
  mutations: {
    // setZoomToScale(state, scale) {
    //   const bcr = state.paper.svg.getBoundingClientRect();
    //   const localRect1 = state.paper.clientToLocalRect({
    //     x: bcr.left,
    //     y: bcr.top,
    //     width: bcr.width,
    //     height: bcr.height
    //   });
    //   const { x, y } = localRect1.center();
    //   state.CHANGE_ZOOM({default: 1, x, y, scale});
    // },

    // zoom algorithm: https://github.com/clientIO/joint/issues/1027
    CHANGE_ZOOM(state, { delta, x, y, stateScale }) {
      const nextScale = !stateScale
        ? state.scale + delta / zoomStep // the current paper scale changed by delta
        : stateScale;

      if (nextScale >= MIN_SCALE && nextScale <= MAX_SCALE) {
        state.scale = nextScale;
        state.x = x;
        state.y = y;
      }
    }
  },
  actions: {
    changeZoom({ commit }, payload) {
      commit("CHANGE_ZOOM", payload);
    },
    zoomOut({ commit, state }, { paper }) {
      const nextScale = state.scale - 2 / zoomStep;
      const position = computePaperCenterPosition(paper);
      commit("CHANGE_ZOOM", { stateScale: nextScale, delta: 1, ...position });
    },
    zoomIn({ commit, state }, { paper }) {
      const nextScale = state.scale + 2 / zoomStep;
      const position = computePaperCenterPosition(paper);
      commit("CHANGE_ZOOM", { stateScale: nextScale, delta: 1, ...position });
    },
    setZoom({ commit }, { nextScale, paper }) {
      const position = computePaperCenterPosition(paper);
      commit("CHANGE_ZOOM", { stateScale: nextScale, delta: 1, ...position });
    }
  }
};
export default Zoom;
