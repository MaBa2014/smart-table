import { getPages } from "../lib/utils.js";

export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage
) => {
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  let pageCount = 1;

  const applyPagination = (query, state, action) => {
    const limit = Number(state.rowsPerPage) || 10;
    let page = Number(state.page) || 1;

    if (action) {
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          page = Math.max(1, Math.min(page + 1, pageCount));
          break;
        case "first":
          page = 1;
          break;
        case "last":
          page = pageCount;
          break;
      }
    }
    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    const currentLimit = Number(limit) || 10;
    const currentPage = Number(page) || 1;

    pageCount = Math.max(1, Math.ceil((Number(total) || 0) / currentLimit));

    const visiblePages = getPages(currentPage, pageCount, 5);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === currentPage);
      })
    );

    const from = (currentPage - 1) * currentLimit + 1;
    const to = Math.min(currentPage * currentLimit, Number(total) || 0);

    fromRow.textContent = (Number(total) || 0) === 0 ? 0 : from;
    toRow.textContent = (Number(total) || 0) === 0 ? 0 : to;
    totalRows.textContent = Number(total) || 0;
  };

  return { updatePagination, applyPagination };
};
