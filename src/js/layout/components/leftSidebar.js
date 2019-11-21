/**
 * Initialize the left sidebar
 */
import Vue from "vue";
import { groupBy } from "lodash"; // we use lodash since it is a dependency of jointjs
import { categoryName, DATATEST_TYPE } from "../../constants/constants";
import { webservices } from "../../constants/globals";
import {
  ALGO_ITEM_CLASS,
  ALGO_ITEM_WRAPPER,
  ALGO_SEARCH_CONTAINER,
  LEFT_SIDEBAR,
  ALGO_ITEMS
} from "../../constants/selectors";
import { mapActions } from "vuex";
import { toggleSplit } from "../split";
import { buildSearchRegex } from "../../utils/utils";

const alphabeticalOrder = (a, b) => {
  const x = a.name.toLowerCase();
  const y = b.name.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

const LeftSidebar = Vue.component("LeftSidebar", {
  data: function() {
    return {
      open: true,
      search: null,
      services: (() => {
        const mapped = webservices.map(service => {
          const { type, name } = service;
          return { type, name };
        });

        const servicesPerCategory = groupBy(mapped, "type");
        const sorted = [];
        for (let category of Object.keys(servicesPerCategory).sort()) {
          sorted.push(...servicesPerCategory[category].sort(alphabeticalOrder));
        }

        return sorted;
      })(),

      categories: (() => {
        const categories = webservices
          .map(algo => algo.type)
          .filter((v, i, a) => a.indexOf(v) === i) // get unique value
          .sort();

        return categories;
      })()
    };
  },
  computed: {
    results() {
      // if search sth
      if (this.search && this.search.length) {
        document.querySelector(`#${ALGO_ITEM_WRAPPER}`).scrollTo(0, 0);

        const searchQuery = this.search.toLowerCase();

        let regex = buildSearchRegex(searchQuery);

        // apply search regex
        return (
          this.services
            .map(s => {
              return { value: s.name.toLowerCase().search(regex), ...s };
            })
            // filter out non matching items, and sort results
            .filter(({ value }) => value != -1)
            .sort((a, b) => a.value - b.value)
        );
      } else {
        return this.services;
      }
    }
  },
  methods: {
    addData(name) {
      this.addDataElement(name);
    },
    toggle() {
      this.open = toggleSplit(this.open);
    },
    resetSearch() {
      this.search = "";
    },
    getCategoryName(c) {
      return categoryName[c];
    },
    boldRegInString(string) {
      if (this.search) {
        // build regex to take into account capital letters
        let regex = "";
        for (const letter of this.search) {
          regex += `[${letter}${letter.toUpperCase()}]`;
        }
        const re = new RegExp(regex);
        const matchedString = string.match(re);
        return string.replace(matchedString, `<b>${matchedString}</b>`);
      } else {
        return string;
      }
    },
    categoryClick(category) {
      this.resetSearch();

      this.$nextTick(function() {
        const searchHeight = document
          .querySelector(`#${ALGO_SEARCH_CONTAINER}`)
          .getBoundingClientRect().height;

        const firstEl = document.querySelector(`#${ALGO_ITEMS} .${category}`);
        // @TODO cross browser solutions https://stackoverflow.com/questions/52276194/window-scrollto-with-options-not-working-on-microsoft-edge
        document.querySelector(`#${ALGO_ITEM_WRAPPER}`).scrollTo({
          top: firstEl.offsetTop - searchHeight,
          left: 0,
          behavior: "smooth"
        });
      });
    },
    ...mapActions("Interface", ["addElementByName", "addDataElement"])
  },
  template: `
  <div id="${LEFT_SIDEBAR}" class="d-flex p-0 flex-nowrap">
    <div class="nav flex-column nav-pills col-3 no-gutters p-0" id="algo-categories" role="tablist" aria-orientation="vertical">
      <div v-for="category in categories" class="category-tab">
        <span :class="category" @click="categoryClick(category)">
          <div class="icon"></div>
          {{getCategoryName(category)}}
        </span>
      </div>
    </div>
    <div class="col pr-0" id="algo-tab">
      <div id="algo-search">
        <input v-model="search" type="search" class="form-control" placeholder="Search for a webservice..." aria-label="Username" aria-describedby="basic-addon1">
      </div>
      <div id="${ALGO_ITEM_WRAPPER}">
        <div id="${ALGO_ITEMS}">
          <div v-for="{type, name} in results" :class="'${ALGO_ITEM_CLASS} ' + type" :name="name" @click="type == '${DATATEST_TYPE}' ? addData(name) : addElementByName(name)">
            <span class="icon"></span><span class="name" v-html="boldRegInString(name)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>`
});

export default LeftSidebar;
