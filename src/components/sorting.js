import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
  let field = null;
  let order = null;

  return (query, state, action) => {
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
        if (col !== action) col.dataset.value = "none";
      });
    } else {
      columns.forEach((col) => {
        if (col.dataset.value !== "none") {
          field = col.dataset.field;
          order = col.dataset.value;
        }
      });
    }
    const valid = field && order && order !== "none";
    const sort = valid ? `${field}:${order}` : null;
    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
