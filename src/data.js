const baseUrl = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    let sellers;
    let customers;
    let indexesPromise;
    let lastQuery;
    let lastResult;

    const fetchJson = async (path) => {
        const response = await fetch(`${baseUrl}${path}`);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        return response.json();
    };

    const getIndexes = async () => {
        if (sellers && customers) {
            return { sellers, customers };
        }

        if (!indexesPromise) {
            indexesPromise = Promise.all([
                fetchJson('/sellers'),
                fetchJson('/customers')
            ]);
        }

        try {
            [sellers, customers] = await indexesPromise;
            return { sellers, customers };
        } catch (error) {
            indexesPromise = undefined;
            throw error;
        }
    };

    const mapRecords = (records) => records.map((record) => ({
        id: record.receipt_id,
        date: record.date,
        seller: sellers[record.seller_id],
        customer: customers[record.customer_id],
        total: record.total_amount
    }));

    const getRecords = async (query = {}, isUpdated = false) => {
        const nextQuery = new URLSearchParams(query).toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        await getIndexes();
        const records = await fetchJson(`/records?${nextQuery}`);

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return { getIndexes, getRecords };
}
