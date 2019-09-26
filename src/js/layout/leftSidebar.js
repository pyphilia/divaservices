/**
 * Initialize the left sidebar
 */
import $ from "jquery";
import groupBy from "lodash.groupby";
import { categoryName } from "../constants/constants";
import { webservices } from "../constants/globals";
import { addAction } from "../utils/undo";
import { ACTION_ADD_ELEMENT } from "../constants/actions";
import {
  ALGO_ITEM_CLASS,
  ALGO_ITEM_WRAPPER,
  ALGO_ITEMS,
  ALGO_SEARCH_CONTAINER
} from "../constants/selectors";

const alphabeticalOrder = (a, b) => {
  const x = a.name.toLowerCase();
  const y = b.name.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

const boldRegInString = (re, string) => {
  const matchedString = string.match(re);
  return string.replace(matchedString, `<b>${matchedString}</b>`);
};

const initItems = services => {
  $(ALGO_ITEMS).html("");
  const servicesPerCategory = groupBy(services, "type");
  for (let category of Object.keys(servicesPerCategory).sort()) {
    createAlgoItems(servicesPerCategory[category].sort(alphabeticalOrder));
  }
};

const createAlgoItems = items => {
  const elements = items.map(({ name, type, text }) => {
    // sorted by name
    const algoItem = $(
      `<div class="${ALGO_ITEM_CLASS} ${type}" name="${name}"><span class="icon"></span><span class="name">${
        text ? text : name
      }</span></div>`
    );
    algoItem.click(function() {
      addAction(ACTION_ADD_ELEMENT, { name });
    });
    return algoItem;
  });

  $(ALGO_ITEMS).append(elements);
};

const initWebservicesSearch = services => {
  const itemsContainer = $(ALGO_ITEMS);

  document
    .querySelector(`${ALGO_SEARCH_CONTAINER} input`)
    .addEventListener("input", event => {
      document.querySelector(ALGO_ITEM_WRAPPER).scrollTo(0, 0); // back to top to see results

      const searchQuery = event.target.value.toLowerCase();

      // if search sth
      if (searchQuery.length) {
        // build regex to take into account capital letters
        let regex = "";
        for (const letter of searchQuery) {
          regex += `[${letter}${letter.toUpperCase()}]`;
        }
        const re = new RegExp(regex);

        // apply search regex
        const searchResult = [];
        for (const item of services) {
          const value = item.name.toLowerCase().search(re);
          searchResult.push({ value, ...item });
        }

        // filter out non matching items, and sort results
        let results = searchResult
          .filter(({ value }) => value != -1)
          .sort((a, b) => a.value - b.value);

        // apply bold on matched string
        for (const item of results) {
          item.text = boldRegInString(re, item.name);
        }

        // create new items from results
        if (results.length) {
          itemsContainer.html("");
          createAlgoItems(results);
        }
      } else {
        initItems(services);
      }
    });
};

const resetSearch = services => {
  document.querySelector(ALGO_SEARCH_CONTAINER + " input").value = "";
  initItems(services);
};

export const buildLeftSidebar = async () => {
  // get categories => algorithms
  const services = webservices.map(service => {
    const { type, name } = service;
    return { type, name };
  });

  const searchHeight = document
    .querySelector(ALGO_SEARCH_CONTAINER)
    .getBoundingClientRect().height;

  const menuItems = [];
  for (let category of services
    .map(algo => algo.type)
    .filter((v, i, a) => a.indexOf(v) === i) // get unique value
    .sort()) {
    // create category tab
    const menuItem = $(
      `<a class="category-tab ${category}"><div class="icon"></div>${categoryName[category]}</a>`
    );
    menuItem.on("click", function() {
      resetSearch(services);

      const firstEl = document.querySelector(`#algo-items .${category}`);
      // @TODO cross browser solutions https://stackoverflow.com/questions/52276194/window-scrollto-with-options-not-working-on-microsoft-edge
      document.querySelector(ALGO_ITEM_WRAPPER).scrollTo({
        top: firstEl.offsetTop - searchHeight,
        left: 0,
        behavior: "smooth"
      });
    });

    menuItems.push(menuItem);
  }
  $("#algo-categories").append(menuItems);

  initItems(services);

  // init search
  initWebservicesSearch(services);
};
