export function initSearching(searchField) {
  return (query, state) => {
    const value = state[searchField];
    return value && value.trim().length
      ? Object.assign({}, query, { search: value.trim() })
      : query;
  };
}
