import "./fonts/ys-display/fonts.css";
import "./style.css";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

const api = initData();

let sampleTable;

function ensureNumber(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  const rowsPerPage = ensureNumber(state.rowsPerPage, 10);
  const page = ensureNumber(state.page ?? 1, 1);
  return { ...state, rowsPerPage, page };
}

function showError(msg) {
  let banner = document.querySelector("#api-error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "api-error-banner";
    banner.style.padding = "12px";
    banner.style.margin = "12px 0";
    banner.style.border = "1px solid #f00";
    banner.style.background = "#ffeaea";
    banner.style.color = "#900";
    banner.style.textAlign = "center";
    banner.style.fontFamily = "ui-sans-serif, system-ui";
    document.querySelector("#app")?.prepend(banner);
  }
  banner.textContent = msg;
}

const appRoot = document.querySelector("#app");
sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["search", "header", "filter"],
    after: ["pagination"],
  },
  (action) => {
    render(action).catch((e) => showError(e.message));
  }
);
appRoot.appendChild(sampleTable.container);

const { applyPagination, updatePagination } = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  }
);

const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter.elements
);

const applySorting = initSorting([
  sampleTable.header.elements.sortByDate,
  sampleTable.header.elements.sortByTotal,
]);

const applySearching = initSearching("search");

async function init() {
  const indexes = await api.getIndexes();

  updateIndexes(sampleTable.filter.elements, {
    seller: indexes.sellers,
    customer: indexes.customers ?? {},
  });
}

async function render(action) {
  const state = collectState();
  let query = {};

  query = applySearching(query, state, action);
  query = applyFiltering(query, state, action);
  query = applySorting(query, state, action);
  query = applyPagination(query, state, action);

  const { total, items } = await api.getRecords(query);

  updatePagination(total, query);
  sampleTable.render(items);
}

init()
  .then(() => render().catch((e) => showError(e.message)))
  .catch((e) => showError(e.message));
