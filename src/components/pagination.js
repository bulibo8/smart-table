let pageCount;

export function initPagination(elements, callback) {
    // Если у вас внутри была какая-то логика инициализации кнопок, оставьте её здесь

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // ваш код для @todo: #2.6

        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        // ваш код для @todo: #2.4 и #2.5
    };

    return {
        applyPagination,
        updatePagination
    };
}