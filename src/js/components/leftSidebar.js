/**
 * Left sidebar component
 */
import Vue from "vue";
import { groupBy } from "lodash"; // we use lodash since it is a dependency of jointjs
import { categoryName, DATATEST_TYPE } from "../utils/constants";
import { webservices, dataInputs } from "../utils/globals";
import {
  ALGO_ITEM_CLASS,
  ALGO_ITEM_WRAPPER,
  ALGO_SEARCH_CONTAINER,
  LEFT_SIDEBAR,
  ALGO_ITEMS
} from "../utils/selectors";
import { mapActions } from "vuex";
import { toggleSplit } from "../utils/split";
import { buildSearchRegex } from "../utils/utils";

/**
 * utility function to order alphabetically
 *
 * @param {object} a must contain an attribute name
 * @param {object} b must contain an attribute name
 */
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
      // group services per category, and sort them alphabetically
      services: (() => {
        const mapped = webservices
          .map(service => {
            const { category, name } = service;
            return { category, name };
          })
          .concat(dataInputs); // add data inputs category

        const servicesPerCategory = groupBy(mapped, "category");
        const sorted = [];
        for (let category of Object.keys(servicesPerCategory).sort()) {
          sorted.push(...servicesPerCategory[category].sort(alphabeticalOrder));
        }

        return sorted;
      })(),

      categories: (() => {
        const categories = webservices
          .map(algo => algo.category)
          .filter((v, i, a) => a.indexOf(v) === i) // get unique value
          .sort();
        categories.push(DATATEST_TYPE); // add data inputs category name

        return categories;
      })()
    };
  },
  computed: {
    results() {
      // on search
      if (this.search && this.search.length) {
        document.getElementById(ALGO_ITEM_WRAPPER).scrollTo(0, 0);

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
      }
      // by default, display all services
      else {
        return this.services;
      }
    }
  },
  methods: {
    /**
     * toggle left sidebar
     */
    toggle() {
      this.open = toggleSplit(this.open);
    },
    /**
     * reset search query
     */
    resetSearch() {
      this.search = "";
    },
    getCategoryName(c) {
      return categoryName[c];
    },
    /**
     * emphasize search query in service names
     *
     * @param {string} string
     */
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
    /**
     * category click callback
     * scroll to the first element of the category
     *
     * @param {string} category
     */
    categoryClick(category) {
      this.resetSearch();

      this.$nextTick(function() {
        const searchHeight = document
          .getElementById(ALGO_SEARCH_CONTAINER)
          .getBoundingClientRect().height;

        const firstEl = document.querySelector(`#${ALGO_ITEMS} .${category}`);
        // @TODO cross browser solutions https://stackoverflow.com/questions/52276194/window-scrollto-with-options-not-working-on-microsoft-edge
        document.getElementById(ALGO_ITEM_WRAPPER).scrollTo({
          top: firstEl.offsetTop - searchHeight,
          left: 0,
          behavior: "smooth"
        });
      });
    },
    ...mapActions("Interface", ["$addElementByName", "$addDataElement"])
  },
  template: `
  <div id="${LEFT_SIDEBAR}" class="d-flex p-0 flex-nowrap">
    <div class="nav flex-column nav-pills col-3 no-gutters p-0" id="algo-categories" role="tablist" aria-orientation="vertical">
      <div v-for="category in categories" class="category-tab">
        <div :class="category + ' category'" @click="categoryClick(category)">
          <div class="icon"></div>
          {{getCategoryName(category)}}
        </div>
      </div>
    </div>
    <div class="col pr-0" id="algo-tab">
      <div id="algo-search">
        <input v-model="search" type="search" class="form-control" placeholder="Search for a webservice..." aria-label="Username" aria-describedby="basic-addon1">
      </div>
      <div id="${ALGO_ITEM_WRAPPER}">
        <div id="${ALGO_ITEMS}">
          <div v-for="{category, name} in results" :class="'${ALGO_ITEM_CLASS} ' + category" :data-name="name" @click="category === '${DATATEST_TYPE}' ? $addDataElement(name) : $addElementByName(name)">
            <span class="icon"></span><span class="name" v-html="boldRegInString(name)"></span>
          </div>
        </div>
      </div>
    </div>
  </div>`
});

export default LeftSidebar;
