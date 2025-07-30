import { createComparison, defaultRules } from "../lib/compare.js";

export function initFiltering(elements, indexes) {
  Object.keys(indexes).forEach((elementName) => {
    elements[elementName].append(
      ...Object.values(indexes[elementName]).map((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        return option;
      })
    );
  });

  return (data, state, action) => {
    if (action && action.name === "clear" && action.dataset?.field) {
      const input = action.closest("label")?.querySelector("[name]");
      if (input) input.value = "";
      state[action.dataset.field] = "";
    }

    const compare = createComparison(defaultRules);

    return data.filter((row) => compare(row, state));
  };
}
