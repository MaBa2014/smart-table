import { sortCollection, sortMap } from "../lib/sort.js";

export function initSorting(columns) {
  let field = null;
  let order = null;

  return (data, state, action) => {
    if (
      action &&
      action.name === "sort" &&
      action.dataset?.field &&
      action.dataset?.value
    ) {
      action.dataset.value = sortMap[action.dataset.value];

      field = action.dataset.field;
      order = action.dataset.value;

      columns.forEach((col) => {
        if (col !== action) {
          col.dataset.value = "none";
        }
      });
    } else {
      columns.forEach((col) => {
        if (col.dataset.value !== "none") {
          field = col.dataset.field;
          order = col.dataset.value;
        }
      });
    }

    if (!field || order === "none") return data;

    return sortCollection(data, field, order);
  };
}
