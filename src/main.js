import './fonts/ys-display/fonts.css';
import './style.css';

import { initData } from './data.js';
import { processFormData } from './lib/utils.js';
import { initTable } from './components/table.js';
import { initPagination } from './components/pagination.js';
import { initSorting } from './components/sorting.js';
import { initFiltering } from './components/filtering.js';
import { initSearching } from './components/searching.js';

const api = initData();
let renderId = 0;
let isInitialized = false;

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (element, page, isCurrent) => {
        const input = element.querySelector('input');
        const label = element.querySelector('span');

        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        element.setAttribute('aria-label', `Go to page ${page}`);

        if (isCurrent) {
            element.setAttribute('aria-current', 'page');
        }

        return element;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);
const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);
const applySearching = initSearching('search');
const appRoot = document.querySelector('#app');

function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    return {
        ...state,
        rowsPerPage: Number.parseInt(state.rowsPerPage, 10),
        page: Number.parseInt(state.page ?? '1', 10)
    };
}

async function init() {
    const indexes = await api.getIndexes();

    if (!isInitialized) {
        updateIndexes({ searchBySeller: indexes.sellers });
        isInitialized = true;
    }
}

async function render(action) {
    const currentRenderId = ++renderId;
    const state = collectState();
    let query = {};

    query = applySearching(query, state);
    query = applyFiltering(query, state, action);
    query = applySorting(query, action);
    query = applyPagination(query, state, action);

    sampleTable.container.setAttribute('aria-busy', 'true');
    sampleTable.setStatus('Loading data...');

    try {
        if (!isInitialized) {
            await init();
        }

        let result = await api.getRecords(query);

        // Запоздалый ответ не должен заменять результат более свежего запроса.
        if (currentRenderId !== renderId) {
            return;
        }

        const lastPage = Math.max(1, Math.ceil(result.total / query.limit));

        // Если записи удалили на сервере, запрашиваем существующую страницу.
        if (query.page > lastPage) {
            query = { ...query, page: lastPage };
            result = await api.getRecords(query);
        }

        if (currentRenderId !== renderId) {
            return;
        }

        updatePagination(result.total, query);
        sampleTable.render(result.items);
        sampleTable.setStatus(result.total ? '' : 'No matching records.');
    } catch {
        if (currentRenderId === renderId) {
            sampleTable.render([]);
            updatePagination(0, { page: 1, limit: query.limit });
            sampleTable.setStatus('Unable to load data. Check your connection and try again.');
        }
    } finally {
        if (currentRenderId === renderId) {
            sampleTable.container.setAttribute('aria-busy', 'false');
        }
    }
}

appRoot.appendChild(sampleTable.container);
updatePagination(0, { page: 1, limit: collectState().rowsPerPage });
render();
