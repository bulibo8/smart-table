import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    before.slice().reverse().forEach(templateId => {
      const item = cloneTemplate(templateId);
      root[templateId] = item;
      root.container.prepend(item.container); 
      Object.assign(root.elements, item.elements);
    });
    
    after.slice().forEach(templateId => {
      const item = cloneTemplate(templateId);
      root[templateId] = item;
      root.container.append(item.container);
      Object.assign(root.elements, item.elements);
    });
    
    
    root.container.addEventListener('click', (event) => {
      const action = event.target.closest('button');
      onAction(action);
    });

    root.container.addEventListener('change', () => {
      onAction();
    });

    root.container.addEventListener('reset', () => {
      setTimeout(() => {
        onAction();
      }); 
    });

    root.container.addEventListener('submit', (e) => {
      e.preventDefault();
      onAction(e.submitter);
    });

    const render = (data) => {
        const nextRows = data.map(item => {
          const row = cloneTemplate(rowTemplate);
          Object.keys(item).forEach(key => { 
            if (row.elements[key]) {
              row.elements[key].textContent = item[key];
            }})
          return row.container;
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}