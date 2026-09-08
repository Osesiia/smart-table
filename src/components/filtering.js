export function initFiltering(elements) {
    const updateIndexes = (indexes) => {
        Object.entries(indexes).forEach(([elementName, names]) => {
            const select = elements[elementName];
            const selectedValue = select.value;
            const emptyOption = select.options[0];
            const options = Object.values(names).map((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                return option;
            });

            select.replaceChildren(emptyOption, ...options);
            select.value = selectedValue;
        });
    };

    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const input = action.parentElement.querySelector(`[name="${field}"]`);

            input.value = '';
            state[field] = '';
        }

        const filters = {};

        Object.values(elements).forEach((element) => {
            if (['INPUT', 'SELECT'].includes(element.tagName)) {
                const value = element.value.trim();

                if (value) {
                    filters[`filter[${element.name}]`] = value;
                }
            }
        });

        return { ...query, ...filters };
    };

    return { updateIndexes, applyFiltering };
}
