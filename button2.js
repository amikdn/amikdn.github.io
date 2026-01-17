(function () {
    'use strict';
    
    // Функция для удаления items-line с Shots
    function removeShotsItemsLine() {
        $('.items-line').each(function() {
            var $itemsLine = $(this);
            var $shotsPerson = $itemsLine.find('.full-person__name');
            if ($shotsPerson.length && $shotsPerson.text().trim() === 'Shots') {
                $itemsLine.remove();
            }
        });
    }
    
    // Удаление кнопки шотсов на странице full (по аналогии с трейлерами)
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var render = e.object.activity.render();
            // Удаляем full-person элемент с Shots (кнопку шотсов)
            render.find('.full-person__name').each(function() {
                if (this.textContent.trim() === 'Shots') {
                    $(this).closest('.full-person').remove();
                }
            });
        }
    });
    
    // Удаление блока шотсов на главной странице
    Lampa.Listener.follow('main', function (e) {
        if (e.type == 'complite' || e.type == 'ready') {
            removeShotsItemsLine();
        }
    });
    
    // Удаление при динамическом добавлении элементов (для предотвращения застревания)
    var removeShotsObserver = new MutationObserver(function() {
        removeShotsItemsLine();
    });
    
    // Начинаем наблюдение после загрузки
    if (document.body) {
        removeShotsObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        // Первоначальная проверка
        setTimeout(removeShotsItemsLine, 100);
    }
})();
