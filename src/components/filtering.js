export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            if (elements[elementName]) {
                elements[elementName].innerHTML = '<option value="">Все</option>';
                Object.values(indexes[elementName]).forEach(name => {
                    const el = document.createElement('option');
                    el.textContent = name;
                    el.value = name;
                    elements[elementName].append(el);
                });
            }
        });
    };

    const applyFiltering = (query, state, action) => {
        // Если пользователь нажал на кнопку очистки конкретного фильтра
        if (action && action.name === 'clear') {
            const field = action.dataset.field; // например, 'date' или 'customer'
            // Ищем соответствующий инпут по имени поля
            Object.keys(elements).forEach(key => {
                const element = elements[key];
                if (element && element.name === field) {
                    element.value = ''; // очищаем значение инпута
                }
            });
        }

        const filter = {};
        
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element && ['INPUT', 'SELECT'].includes(element.tagName)) {
                if (element.value) {
                    filter[`filter[${element.name}]`] = element.value;
                }
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}