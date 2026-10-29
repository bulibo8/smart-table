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

        elements.pages.innerHTML = ''; // Очищаем старые страницы

        const fragment = document.createDocumentFragment();
        const addPageButton = (i) => {
            const pageNode = pageTemplateNode 
                ? pageTemplateNode.cloneNode(true) 
                : document.createElement('label');
            const filledNode = callback(pageNode, i, i === currentPage);
            fragment.appendChild(filledNode);
        };

        const addEllipsis = () => {
            const span = document.createElement('span');
            span.textContent = '...';
            span.className = 'pagination-ellipsis';
            fragment.appendChild(span);
        };

        // Логика «окна»: показываем первую, последнюю и соседей текущей страницы
        const delta = 1; // Сколько страниц показывать слева и справа от текущей
        let rangeLeft = Math.max(2, currentPage - delta);
        let rangeRight = Math.min(pageCount - 1, currentPage + delta);

        if (currentPage - delta > 2) {
            rangeLeft = currentPage - delta;
        } else {
            rangeRight = Math.min(pageCount - 1, 1 + delta * 2);
        }

        if (currentPage + delta < pageCount - 1) {
            rangeRight = currentPage + delta;
        } else {
            rangeLeft = Math.max(2, pageCount - delta * 2);
        }

        if (pageCount > 0) {
            addPageButton(1);
        }

        for (let i = rangeLeft; i <= rangeRight; i++) {
            if (i > 1 && i < pageCount) {
                addPageButton(i);
            }
        }

        if (pageCount > 1) {
            addPageButton(pageCount);
        }

        elements.pages.appendChild(fragment);

        // Управляем доступностью кнопок навигации (теперь они всегда видны)
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