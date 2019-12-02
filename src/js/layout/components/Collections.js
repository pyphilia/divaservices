import Vue from "vue";
import * as $ from "jquery";
import draggable from "vuedraggable";
import { getCollectionsAPI } from "../../api/requests";
import { app } from "../../app";
import { updateImgPreview } from "../../elements/addDataElement";
// import { FilesExtensions } from "./constants";

// const MAX_FILES_LOADED = 5;

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
        group: "files",
        ghostClass: "ghost"
      };
    }
  },
  watch: {
    id(newValue) {
      // if doesnt exist in obj, add it
      if (!(newValue in this.files)) {
        this.$set(this.files, newValue, []);
      }
    }
  },
  methods: {
    openCollectionModel(boxId) {
      this.id = boxId;
      $("#collections").modal("show");
    },
    updateDataFile() {
      console.log("update");
      const data = this.files[this.id];
      app.updateDataInDataElement({ boxId: this.id, data });
      updateImgPreview(this.id, data);

      // close modal
      $("#collections").modal("hide");
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
    // getFileFormat(url) {
    //   const reg = new RegExp(
    //     "^https?://(?:[a-z0-9-]+.)+[a-z]{2,6}(?:/[^/#?]+)+.(?:jpe?g|gif|png)$"
    //   );
    //   if (url.match(reg)) {
    //     return FilesExtensions.IMAGE.type;
    //   } else {
    //     return "UNKNOWN FORMAT : " + url;
    //   }
    // },

    // @FIX fired on open and on close
    // loadCollection(idx) {
    //   const { files, maxLoaded } = this.collections[idx];

    //   if (maxLoaded < files.length) {
    //     const container = document.querySelector("#collapse-" + idx);

    //     // take portion of files
    //     for (const file of files.slice(
    //       maxLoaded,
    //       maxLoaded + MAX_FILES_LOADED
    //     )) {
    //       const format = file.options ? file.options.type : "none";
    //       switch (format) {
    //         case FilesExtensions.IMAGE.type: {
    //           const child = document.createElement("img");
    //           child.src = file.url;
    //           child.alt = file.identifier;
    //           container.appendChild(child);
    //           break;
    //         }
    //         default: {
    //           const child = document.createElement("span");
    //           child.innerText = file.identifier;
    //           container.appendChild(child);
    //         }
    //       }
    //     }
    //     this.collections[idx].maxLoaded += MAX_FILES_LOADED;
    //   }
    // }
  },
  async mounted() {
    const originalCollections = await getCollectionsAPI();
    // add maxLoaded to manage huge collections
    this.collections = originalCollections.map(c => ({ ...c, maxLoaded: 0 }));

    // this.$nextTick(function () {
    //   for(const collapsible of document.querySelectorAll('card-header')){

    //   }
    // })
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
        <span @click="deleteFile(service.name, name, file)" title="delete">x</span>
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
