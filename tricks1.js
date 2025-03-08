function addMenuButton(){
    // Пример иконки (SVG)
    let iconKP = `
      <svg width="32" height="32" viewBox="0 0 192 192" fill="currentColor">
        <!-- ... код иконки ... -->
      </svg>
    `;

    // Создаём пункт меню через jQuery
    let field = $(`
       <li class="menu__item selector">
         <div class="menu__ico">${iconKP}</div>
         <div class="menu__text">Кинопоиск</div>
       </li>
    `);

    // Событие при нажатии
    field.on('hover:enter', ()=>{
        // К примеру, открываем категорию (или любое Activity)
        Lampa.Activity.push({
            url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',
            title: 'Популярные фильмы',
            component: 'category_full',
            source: 'KP',
            card_type: true,
            page: 1
        });
    });

    // Получаем jQuery-объект меню
    let menu = Lampa.Menu.render();

    // Ищем в меню элемент с data-action="tv"
    let tv_item = menu.find('[data-action="tv"]');

    // Если такой элемент есть, вставляем нашу кнопку после него
    if(tv_item.length) {
        tv_item.after(field);
    }
    else {
        // Если вдруг "tv" не нашёлся, добавим кнопку в конец меню
        menu.append(field);
    }
}
