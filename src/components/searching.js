export function initSearching(searchField) {
    return (query, state) => {
        const search = state[searchField].trim();

        return search ? { ...query, search } : query;
    };
}
