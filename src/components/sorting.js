import { sortMap } from '../lib/sort.js';

export function initSorting(columns) {
    return (query, action) => {
        if (action && action.name === 'sort') {
            columns.forEach((column) => {
                column.dataset.value = column === action
                    ? sortMap[column.dataset.value]
                    : 'none';
            });
        }

        const selectedColumn = columns.find((column) => column.dataset.value !== 'none');

        if (!selectedColumn) {
            return query;
        }

        const { field, value: order } = selectedColumn.dataset;
        return { ...query, sort: `${field}:${order}` };
    };
}
