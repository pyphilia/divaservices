import { graph, paper } from "../layout/interface";
import { AREA_SELECTION_ELEMENT } from "../constants/selectors";
import { app } from "../main";

const div = document.getElementById(AREA_SELECTION_ELEMENT);

const plugin = {
  install(Vue) {
    Vue.mixin({
      data() {
        return {
          areaSelection: false,
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0
        };
      },
      methods: {
        reCalc() {
          var x3 = Math.min(this.x1, this.x2);
          var x4 = Math.max(this.x1, this.x2);
          var y3 = Math.min(this.y1, this.y2);
          var y4 = Math.max(this.y1, this.y2);
          div.style.left = x3 + "px";
          div.style.top = y3 + "px";
          div.style.width = x4 - x3 + "px";
          div.style.height = y4 - y3 + "px";
        },
        initAreaSelection(event) {
          this.areaSelection = true;
          this.x1 = event.clientX;
          this.y1 = event.clientY;
          this.x2 = event.clientX;
          this.y2 = event.clientY;
          this.reCalc();
          div.hidden = 0;
        },
        endAreaSelection() {
          this.areaSelection = false;

          const { x, y, width, height } = div.getBoundingClientRect();
          const { x: paperOffsetX, y: paperOffsetY } = paper.clientOffset();
          const {
            tx: paperTranslateX,
            ty: paperTranslateY
          } = paper.translate();
          const currentScale = paper.scale().sx;

          const pointX = (x - paperOffsetX - paperTranslateX) / currentScale;
          const pointY = (y - paperOffsetY - paperTranslateY) / currentScale;

          const models = graph.findModelsInArea({
            x: pointX,
            y: pointY,
            width: width / currentScale,
            height: height / currentScale
          });

          app.addCellViewsToSelection(
            models.map(model => paper.findViewByModel(model))
          );
          div.hidden = 1;
        },
        computeAreaSelection() {
          if (this.areaSelection) {
            this.x2 = event.clientX;
            this.y2 = event.clientY;
            this.reCalc();
          }
        }
      }
    });
  }
};

export default plugin;
