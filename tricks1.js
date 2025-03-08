function addMenuButton() {
    const ITEM_TV_SELECTOR = '[data-action="tv"]';

    // Наша иконка (SVG)
    let iconKP = `
      <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor">
        <!-- ... здесь код иконки ... -->
      </svg>
    `;

    // Создаём элемент меню через jQuery
    let field = $(`
      <li class="menu__item selector">
        <div class="menu__ico">${iconKP}</div>
        <div class="menu__text">Кинопоиск</div>
      </li>
    `);

    // Событие при клике (hover:enter)
    field.on('hover:enter', () => {
        Lampa.Activity.push({
            title: 'Кинопоиск',
            component: 'kp_menu_custom', // наша Activity
            page: 1
        });
    });

    // Получаем jQuery-объект меню
    let menu = Lampa.Menu.render();

    // Ищем в меню элемент с data-action="tv"
    let tv_item = menu.find(ITEM_TV_SELECTOR);

    // Если нашли, вставляем нашу кнопку после
    if (tv_item.length) {
        tv_item.after(field);
    }
    else {
        // Если вдруг не нашли, просто добавим в конец
        menu.append(field);
    }
}
