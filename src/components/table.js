import { cloneTemplate } from '../lib/utils.js';

export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);
    const status = document.createElement('p');

    [...before].reverse().forEach((templateName) => {
        root[templateName] = cloneTemplate(templateName);
        root.container.prepend(root[templateName].container);
    });

    after.forEach((templateName) => {
        root[templateName] = cloneTemplate(templateName);
        root.container.append(root[templateName].container);
    });

    status.className = 'table-status';
    status.setAttribute('role', 'status');
    status.hidden = true;
    root.elements.rows.before(status);

    root.container.addEventListener('input', (event) => {
        if (event.target.matches('input[type="text"]')) {
            onAction(event.target);
        }
    });

    root.container.addEventListener('change', (event) => {
        if (event.target.matches('select, input[type="radio"]')) {
            onAction(event.target);
        }
    });

    root.container.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.target.matches('input[type="text"]')) {
            event.preventDefault();
            onAction(event.target);
        }
    });

    root.container.addEventListener('reset', () => {
        root.container.querySelectorAll('[name="sort"]').forEach((button) => {
            button.dataset.value = 'none';
        });

        // Сначала браузер сбрасывает поля формы, затем собираем новое состояние.
        setTimeout(() => onAction(), 0);
    });

    root.container.addEventListener('submit', (event) => {
        event.preventDefault();
        onAction(event.submitter);
    });

    const render = (records) => {
        const rows = records.map((record) => {
            const row = cloneTemplate(rowTemplate);

            Object.entries(record).forEach(([field, value]) => {
                if (field in row.elements) {
                    row.elements[field].textContent = value;
                }
            });

            return row.container;
        });

        root.elements.rows.replaceChildren(...rows);
    };

    const setStatus = (message) => {
        status.textContent = message;
        status.hidden = !message;
    };

    return { ...root, render, setStatus };
}
