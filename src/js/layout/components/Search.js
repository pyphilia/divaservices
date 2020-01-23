/**
 * Elements search component
 */
import Vue from "vue";
import { buildSearchRegex } from "../../utils/utils";
import { SEARCH_ELEMENTS_ID } from "../../constants/selectors";

import Paper from "../../classes/Paper";
import { mapState } from "vuex";

const Search = Vue.component("SearchElements", {
  data() {
    return {
      open: false,
      query: "",
      candidates: [],
      currentId: 0
    };
  },
  computed: {
    ...mapState("Interface", ["elements"])
  },
  methods: {
    /**
     * open search bar
     */
    openSearch() {
      this.open = true;
    },
    searchForElements() {
      this.query = document.getElementById(SEARCH_ELEMENTS_ID).value;

      // @TODO: check on searchStr
      const regex = buildSearchRegex(this.query);

      // apply search regex
      this.candidates = this.elements
        .map(el => {
          return { value: el.type.toLowerCase().search(regex), ...el };
        })
        // filter out non matching items, and sort results
        .filter(({ value }) => value != -1)
        .sort((a, b) => a.value - b.value);

      this.currentId = 0;

      if (this.candidates.length) {
        Paper.centerBoxByBoxId(this.candidates[this.currentId].boxId);
      }
    },
    nextCandidate() {
      // if is last element, return to first element
      if (++this.currentId >= this.candidates.length) {
        this.currentId = 0;
      }
      // go to next element
      else if (this.currentId < 0) {
        this.currentId = this.candidates.length - 1;
      }
      // move paper to center box
      Paper.centerBoxByBoxId(this.candidates[this.currentId].boxId);
    }
  },
  template: `
    <div v-if="open" id="search-component">
            <input id="${SEARCH_ELEMENTS_ID}" type="text" placeholder="Search for an element..." />
            {{candidates.length ? currentId+1 : 0}} / {{candidates.length}}
            <button type="button" @click="searchForElements()">Search</button>
            <button type="button" @click="nextCandidate()" :disabled="!candidates.length">Next</button>
    </div>
  `
});

export default Search;
