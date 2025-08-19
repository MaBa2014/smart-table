function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function initFiltering(elementsRoot) {
  function findField(elementsObj, name) {
    const direct = elementsObj[name];
    if (direct) return direct;
    const alt1 = elementsObj[`searchBy${cap(name)}`];
    if (alt1) return alt1;
    const alt2 = elementsObj[`filterBy${cap(name)}`];
    if (alt2) return alt2;

    return document.querySelector(`[name="${name}"]`);
  }

  const updateIndexes = (_elementsRef, byName) => {
    Object.entries(byName).forEach(([name, map]) => {
      const el = findField(_elementsRef, name);
      if (!el || !map) return;

      const first =
        el.firstElementChild && el.firstElementChild.value === ""
          ? el.firstElementChild
          : null;
      el.replaceChildren();
      if (first) el.append(first);
      Object.values(map).forEach((label) => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        el.append(option);
      });
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === "clear" && action.dataset?.field) {
      const input = action.closest("label")?.querySelector("[name]");
      if (input) input.value = "";
      state[action.dataset.field] = "";
    }

    const filter = {};

    const container = elementsRoot.container || elementsRoot.root || document;
    container.querySelectorAll("[name]").forEach((el) => {
      const name = el.getAttribute("name");

      if (["date", "customer", "seller", "total"].includes(name) && el.value) {
        filter[`filter[${name}]`] = el.value;
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return { updateIndexes, applyFiltering };
}
