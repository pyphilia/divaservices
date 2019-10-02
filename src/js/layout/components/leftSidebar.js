/**
 * Initialize the left sidebar
 */
import Vue from "vue";
import groupBy from "lodash.groupby";
import { categoryName } from "../../constants/constants";
import { webservices } from "../../constants/globals";
import { ACTION_ADD_ELEMENT } from "../../constants/actions";
import {
  ALGO_ITEM_CLASS,
  ALGO_ITEM_WRAPPER,
  ALGO_SEARCH_CONTAINER
} from "../../constants/selectors";

const alphabeticalOrder = (a, b) => {
  const x = a.name.toLowerCase();
  const y = b.name.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

const LeftSidebar = Vue.component("LeftSidebar", {
  props: ["addActionFunc"],
  data: function() {
    return {
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

      search: null,

      categories: webservices
        .map(algo => algo.type)
        .filter((v, i, a) => a.indexOf(v) === i) // get unique value
        .sort(),

      resetSearch: () => {
        this.search = "";
      },
      getCategoryName: c => {
        return categoryName[c];
      },
      boldRegInString: string => {
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
      addElement: name => {
        this.addActionFunc(ACTION_ADD_ELEMENT, { name });
      },
      categoryClick: category => {
        this.resetSearch();

        this.$nextTick(function() {
          const searchHeight = document
            .querySelector(ALGO_SEARCH_CONTAINER)
            .getBoundingClientRect().height;

          const firstEl = document.querySelector(`#algo-items .${category}`);
          // @TODO cross browser solutions https://stackoverflow.com/questions/52276194/window-scrollto-with-options-not-working-on-microsoft-edge
          document.querySelector(ALGO_ITEM_WRAPPER).scrollTo({
            top: firstEl.offsetTop - searchHeight,
            left: 0,
            behavior: "smooth"
          });
        });
      }
    };
  },
  computed: {
    results() {
      // if search sth
      if (this.search && this.search.length) {
        document.querySelector(ALGO_ITEM_WRAPPER).scrollTo(0, 0);

        const searchQuery = this.search.toLowerCase();

        // build regex to take into account capital letters
        let regex = "";
        for (const letter of searchQuery) {
          regex += `[${letter}${letter.toUpperCase()}]`;
        }
        const re = new RegExp(regex);

        // apply search regex
        const searchResult = [];
        for (const item of this.services) {
          const value = item.name.toLowerCase().search(re);
          searchResult.push({ value, ...item });
        }

        // filter out non matching items, and sort results
        return searchResult
          .filter(({ value }) => value != -1)
          .sort((a, b) => a.value - b.value);
      } else {
        return this.services;
      }
    }
  },
  template: `<div id="left-sidebar" class="col-3">
  <div class="row  h-100">
  <div class="nav flex-column nav-pills col-3 no-gutters p-0" id="algo-categories" role="tablist" aria-orientation="vertical">
  <a v-for="category in categories" :class="'category-tab ' + category" @click="categoryClick(category)"><div class="icon"></div>{{getCategoryName(category)}}</a>
  </div>
  
  <div  class="col pr-0" id="algo-tab">
  <div id="algo-search">
  <input v-model="search" type="search" class="form-control" placeholder="Search for a webservice..." aria-label="Username" aria-describedby="basic-addon1">
  </div>
  <div id="algo-items-wrapper">
  <div id="algo-items">
  <div v-for="{type, name} in results" :class="'${ALGO_ITEM_CLASS} ' + type" :name="name" @click="addElement(name)"><span class="icon"></span><span class="name" v-html="boldRegInString(name)"></span></div>
  </div>
  </div>
  </div>
  
  </div>
  </div>`
});

export default LeftSidebar;
