import { getPages } from '../lib/utils.js';
let pageCount;

export function initPagination(elements, callback) {
    // Сохраняем исходный шаблон кнопки страницы из разметки
    const pageTemplateNode = elements.pages ? elements.pages.querySelector('label') : null;

    const applyPagination = (query, state, action) => {
        let limit = state.rowsPerPage;
        let page = state.page;

        if (action) {
            if (action.name === 'filter' || action.name === 'search' || action.name === 'rowsPerPage') {
                page = 1; // Сбрасываем на первую страницу при изменении фильтров, поиска или лимита
            } else if (action.name === 'page') {
                page = parseInt(action.value, 10);
            } else if (action.name === 'first') {
                page = 1;
            } else if (action.name === 'prev') {
                page = Math.max(1, page - 1);
            } else if (action.name === 'next') {
                page = Math.min(pageCount, page + 1);
            } else if (action.name === 'last') {
                page = pageCount;
            }
        }

        return Object.assign({}, query, {
            limit,
            page
        });
    };

    const updatePagination = (total, { page: currentPage, limit }) => {
        pageCount = Math.ceil(total / limit);

        if (!elements.pages) return;

        if (elements.fromRow) {
            elements.fromRow.textContent = total === 0 ? 0 : (currentPage - 1) * limit + 1;
        }
        if (elements.toRow) {
            elements.toRow.textContent = Math.min(currentPage * limit, total);
        }
        if (elements.totalRows) {
            elements.totalRows.textContent = total;
        }

        elements.pages.innerHTML = ''; 

        if (!pageTemplateNode) return;

        const visiblePages = getPages(currentPage, pageCount, 5);

        elements.pages.replaceChildren(...visiblePages.map(pageNumber => {
            const pageNode = pageTemplateNode.cloneNode(true);
            return callback(pageNode, pageNumber, pageNumber === currentPage);
        }));

        if (elements.firstPage) elements.firstPage.disabled = currentPage <= 1;
        if (elements.previousPage) elements.previousPage.disabled = currentPage <= 1;
        if (elements.nextPage) elements.nextPage.disabled = currentPage >= pageCount;
        if (elements.lastPage) elements.lastPage.disabled = currentPage >= pageCount;
    };

    return {
        applyPagination,
        updatePagination
    };
}