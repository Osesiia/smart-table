import { getPages } from '../lib/utils.js';

export function initPagination(elements, createPage) {
    const {
        pages,
        fromRow,
        toRow,
        totalRows,
        firstPage,
        previousPage,
        nextPage,
        lastPage
    } = elements;
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    let pageCount = 0;
    let lastParameters;

    pages.replaceChildren();

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        const parameters = new URLSearchParams({ ...query, limit }).toString();
        let page = state.page;

        // Новые фильтры, поиск, сортировку и размер страницы начинаем с первой страницы.
        if (parameters !== lastParameters) {
            page = 1;
        } else if (action) {
            switch (action.name) {
                case 'prev':
                    page -= 1;
                    break;
                case 'next':
                    page += 1;
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
        }

        page = Math.max(1, Math.min(Math.max(1, pageCount), page));
        lastParameters = parameters;

        return { ...query, limit, page };
    };

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);
        const visiblePages = getPages(page, pageCount, 5);
        const pageButtons = visiblePages.map((pageNumber) => {
            const button = pageTemplate.cloneNode(true);
            return createPage(button, pageNumber, pageNumber === page);
        });

        pages.replaceChildren(...pageButtons);
        fromRow.textContent = total ? (page - 1) * limit + 1 : 0;
        toRow.textContent = Math.min(page * limit, total);

        totalRows.textContent = total;
        firstPage.disabled = page <= 1;
        previousPage.disabled = page <= 1;
        nextPage.disabled = page >= pageCount;
        lastPage.disabled = page >= pageCount;
    };

    return { applyPagination, updatePagination };
}
