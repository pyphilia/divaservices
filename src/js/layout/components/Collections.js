import Vue from "vue";
import * as $ from "jquery";
import draggable from "vuedraggable";
import { getCollectionsAPI } from "../../api/requests";
import { app } from "../../app";
import { updateImgPreview } from "../../elements/addDataElement";
import { DRAGGABLE_GROUP_NAME } from "../../constants/constants";

const Collections = Vue.component("Collections", {
  data() {
    return {
      collections: [],
      files: {},
      id: null
    };
  },
  components: {
    draggable
  },
  computed: {
    dragOptions() {
      return {
        group: DRAGGABLE_GROUP_NAME,
        ghostClass: "ghost"
      };
    }
  },
  watch: {
    // id(newValue) {
    //   // if doesnt exist in obj, add it
    //   if (!(newValue in this.files)) {
    //     this.$set(this.files, newValue, []);
    //   }
    // }
  },
  methods: {
    openCollectionModel(boxId) {
      this.id = boxId;

      // if doesnt exist in obj, add it
      if (!(boxId in this.files)) {
        const data = app.elementsData.find(
          ({ boxId: thisBoxId }) => thisBoxId == boxId
        ).data;
        const definedData = data ? [data[0]] : [];
        this.$set(this.files, boxId, definedData);
      }
      $("#collections").modal("show");
    },
    updateDataFile() {
      console.log("update");
      const data = this.files[this.id];
      app.updateDataInDataElement({ boxId: this.id, data });
      // @TODO: suppose one image
      if (data[0].options["mime-type"].includes("image")) {
        updateImgPreview(this.id, data);
      }

      // close modal
      $("#collections").modal("hide");
    },
    deleteFile(file) {
      this.files[this.id].splice(file, 1);
    },
    // Vue draggable
    onMove(event) {
      const { relatedContext, draggedContext } = event;
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    }
  },
  async mounted() {
    this.collections = await getCollectionsAPI();
  },
  template: `
  <div id="collections"  class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
  <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Choose a file</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

    <div v-if="collections.length == 0" >Loading...</div>

    <div id="collections-wrapper">

      <div v-for="({files, name, url, statusMessage, error, loaded}, idx) in collections" class="collection accordion">

        <!-- @click="loadCollection(idx)" -->
        <div class="card-header" :id="'heading'+idx" data-toggle="collapse" :data-target="'#collapse-'+idx" aria-expanded="true" :aria-controls="'collapse-'+idx">
            
          <strong v-if="!error">{{name}} ({{files.length}})</strong>
          <strong v-else style="color:red">{{name}}</strong>

        </div>

        <div :id="'collapse-'+idx" class="collapse" :aria-labelledby="'heading'+idx" data-parent="#collections">
      
        <files-collection :files="files"></files-collection>

      </div>
    </div>

  </div>

  
<draggable v-if="Object.keys(files).length" class="input-files" tag="div" v-model="files[id]" :name="id" :id="id"
:move="onMove" v-bind="dragOptions" :class="{hint: !files[id].length}">
  
  <div v-for="file in files[id]" >
    <div class="file">
      <img v-if="file.options && file.options['mime-type'].includes('image')" :src="file.url" :alt="file.identifier" class="img-thumbnail" :title="file.identifier"/>
      <span v-else class="list-group-item">
        <a :href="file.url" target="_blank">
          {{file.identifier}}
        </a>
      </span>
      <div class="delete-button">
        <span @click="deleteFile(name, file)" title="delete">x</span>
      </div>
    </div>

  </div>
    
</draggable>

  <div class="modal-footer">
  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
  <button type="button" class="btn btn-primary" @click="updateDataFile()">OK</button>
</div>

  </div>
</div>
  </div>
  `
});

export default Collections;
