import Vue from "vue";
import draggable from "vuedraggable";

const FilesCollection = Vue.component("FilesCollection", {
  props: ["files"],
  data() {
    return {};
  },
  components: {
    draggable
  },
  computed: {
    dragOptions() {
      return {
        // clone content, cannot put new inside
        group: { name: "files", pull: "clone", put: false }
      };
    }
  },
  methods: {
    endCallback({ to }) {
      to.classList.remove("highlight");
    },
    getComponentData() {
      return {
        on: {
          end: this.endCallback
        }
      };
    },
    onMove(event) {
      const { relatedContext, draggedContext, to } = event;

      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;

      const isEmpty = to.querySelector(".file") === null;

      return (
        (!relatedElement || !relatedElement.fixed) &&
        !draggedElement.fixed &&
        isEmpty
      );
    }
  },
  template: `
  <draggable class="list-group" tag="div" v-model="files" :component-data="getComponentData()"
      v-bind="dragOptions" :move="onMove">
      <a v-for="{url, identifier} in files" :href="url" target="_blank"  class="list-group-item" >{{identifier}}</a>
  </draggable>
`
});

export default FilesCollection;
