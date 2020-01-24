/**
 * Minimap component
 * navigation, overall view of the graph
 */
import Vue from "vue";
import * as joint from "jointjs";
import {
  MINIMAP_NAVIGATOR_SELECTOR,
  MINIMAP_PAPER_ID,
  MINIMAP_CONTAINER
} from "../utils/selectors";
import { MINIMAP_HEIGHT, MINIMAP_WIDTH } from "../utils/constants";
import { mapState } from "vuex";
import Graph from "../classes/Graph";
import Paper from "../classes/Paper";

const SCALE_CONTENT_PADDING = 10;

const Minimap = Vue.component("Minimap", {
  props: ["movedElements", "scale", "translation"],
  data: function() {
    return {
      mapDragFlag: false,
      defaultPositionx: 0,
      defaultPositiony: 0,
      fitContentPaddingX: 0,
      fitContentPaddingY: 0,
      navigator: null,
      mapScale: 0.5,
      minimapPaper: null
    };
  },
  computed: {
    ...mapState("Interface", ["elements"])
  },
  methods: {
    update() {
      this.minimapPaper.scaleContentToFit({ padding: SCALE_CONTENT_PADDING });
      this.mapScale = this.minimapPaper.scale().sx;

      // keep track of padding : scale content to fit induce some padding from origin (0,0)
      const mbcr = this.minimapPaper.svg.getBoundingClientRect();
      const mCoords = this.minimapPaper.clientToLocalRect({
        x: mbcr.left,
        y: mbcr.top,
        width: mbcr.width,
        height: mbcr.height
      });
      this.fitContentPaddingX = mCoords.x + SCALE_CONTENT_PADDING;
      this.fitContentPaddingY = mCoords.y + SCALE_CONTENT_PADDING;

      const paper = Paper.paper;
      const bcr = paper.svg.getBoundingClientRect();
      const { x, y, width, height } = paper.clientToLocalRect({
        x: bcr.left,
        y: bcr.top,
        width: bcr.width,
        height: bcr.height
      });

      const newLeft = (-this.fitContentPaddingX + x) * this.mapScale;
      const newTop = (-this.fitContentPaddingY + y) * this.mapScale;
      this.navigator.style.top = `${newTop}px`;
      this.navigator.style.left = `${newLeft}px`;
      this.navigator.style.width = `${width * this.mapScale}px`;
      this.navigator.style.height = `${height * this.mapScale}px`;
    }
  },
  watch: {
    translation: {
      deep: true,
      handler() {
        this.update();
      }
    },
    movedElements: {
      deep: true,
      handler() {
        this.update();
      }
    },
    scale: function() {
      this.update();
    },
    elements: function() {
      this.update();
    }
  },
  mounted() {
    // ensure paper and graph are initialized
    this.$nextTick(function() {
      // init minimap with current graph
      this.minimapPaper = new joint.dia.Paper({
        el: document.getElementById(MINIMAP_PAPER_ID),
        model: Graph.graph,
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        gridSize: 1,
        interactive: false
      });

      this.minimapPaper.scaleContentToFit();
      this.mapScale = this.minimapPaper.scale().sx;

      this.navigator = document.getElementById(MINIMAP_NAVIGATOR_SELECTOR);

      // add minimap listeners: move
      this.navigator.addEventListener("mousedown", e => {
        this.mapDragFlag = true;
        const { clientY, clientX } = e;
        const top = parseInt(this.navigator.style.top);
        const left = parseInt(this.navigator.style.left);
        this.defaultPositionx = clientX - left;
        this.defaultPositiony = clientY - top;
      });

      document.addEventListener("mouseup", () => {
        this.mapDragFlag = false;
      });

      document.addEventListener("mousemove", e => {
        if (this.mapDragFlag) {
          const { clientY, clientX } = e;
          const newY = (clientY - this.defaultPositiony) / this.mapScale;
          const newX = (clientX - this.defaultPositionx) / this.mapScale;

          const xScale = newX * this.mapScale;
          const yScale = newY * this.mapScale;
          this.navigator.style.top = `${yScale}px`;
          this.navigator.style.left = `${xScale}px`;

          Paper.translate(
            -this.fitContentPaddingX - newX,
            -this.fitContentPaddingY - newY
          );
        }
      });
    });
  },
  template: `<div id="${MINIMAP_CONTAINER}">
    <div id="${MINIMAP_PAPER_ID}"></div>
    <div id="${MINIMAP_NAVIGATOR_SELECTOR}">
    </div>
</div>`
});

export default Minimap;
