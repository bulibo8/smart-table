import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initSorting} from "./components/sorting.js";
import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";

// Исходные данные используемые в render()
const API = initData(sourceData);
const {data} = API;

// 1. Инициализируем таблицу
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']  
}, render);

// 2. Инициализируем сортировку
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// 3. Инициализируем пагинацию
const { applyPagination, updatePagination } = initPagination(
    sampleTable.elements, // передаём элементы пагинации
    (el, page, isCurrent) => { // колбэк для заполнения кнопок страниц
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySearching = initSearching('search');

// Объявляем переменные для фильтрации
let applyFiltering, updateIndexes;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // здесь будут формироваться параметры запроса

    // Применяем модули фильтрации, поиска, сортировки и пагинации
    if (applyFiltering) {
        query = applyFiltering(query, state, action);
    }
    query = applyPagination(query, state, action);
    query = applySearching(query, state, action);
    query = applySorting(query, state, action);

    const { total, items } = await API.getRecords(query); // запрашиваем данные с собранными параметрами

    updatePagination(total, query); // перерисовываем пагинатор
    sampleTable.render(items);
} 

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

async function init() {
    const indexes = await API.getIndexes();

    // Инициализируем фильтрацию и получаем методы
    const filtering = initFiltering(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers // передаем массив продавцов для селекта
    });

    applyFiltering = filtering.applyFiltering;
    updateIndexes = filtering.updateIndexes;

    if (updateIndexes) {
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
    }
}

init().then(render);