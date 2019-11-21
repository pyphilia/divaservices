/**
 * Initialize toolsbar
 */
import Vue from "vue";
import { app } from "../../app";
import { buildSearchRegex } from "../../utils/utils";
import { centerBoxInPaperByBoxId } from "../utils";

const Search = Vue.component("SearchElements", {
  props: ["selectedElements", "paper", "scale"],
  data() {
    return {
      open: false,
      query: "",
      candidates: [],
      currentId: 0
    };
  },
  methods: {
    openSearch() {
      console.log("open");
      this.open = true;
    },
    searchForElements() {
      this.query = document.getElementById("search-elements").value;

      // @TODO: check on searchStr
      const regex = buildSearchRegex(this.query);

      // apply search regex
      this.candidates = app.elements
        .map(el => {
          return { value: el.type.toLowerCase().search(regex), ...el };
        })
        // filter out non matching items, and sort results
        .filter(({ value }) => value != -1)
        .sort((a, b) => a.value - b.value);

      this.currentId = 0;

      if (this.candidates.length) {
        centerBoxInPaperByBoxId(this.candidates[this.currentId].boxId);
      }
    },
    nextCandidate() {
      if (++this.currentId >= this.candidates.length) {
        this.currentId = 0;
      } else if (this.currentId < 0) {
        this.currentId = this.candidates.length - 1;
      }
      centerBoxInPaperByBoxId(this.candidates[this.currentId].boxId);
    }
  },
  // @TODO search done twice because of a
  template: `
    <div v-if="open" id="search-component">
            <input id="search-elements" type="text" placeholder="Search for an element..." />
            {{candidates.length ? currentId+1 : 0}} / {{candidates.length}}
            <button type="button" @click="searchForElements()">Search</button>
            <button type="button" @click="nextCandidate()" :disabled="!candidates.length">Next</button>
    </div>
  `
});

export default Search;
