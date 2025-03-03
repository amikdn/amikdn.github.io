(function(){
    'use strict';

    /**
     * Функция добавления блоков рейтингов в карточку.
     * Вставляет блоки для KP, IMDB и LAMPA.
     * Если в render-контейнере есть элемент с классом .info__rate, вставка производится после него,
     * иначе блоки добавляются в конец render.
     *
     * @param {object} card - объект фильма (передается для совместимости с оригинальным кодом)
     */
    function addRatingBlocks(card) {
        // Получаем контейнер карточки через активное окно
        var render = Lampa.Activity.active().activity.render();

        // HTML-разметка для блоков рейтингов
        var html = 
            '<div class="full-start__rate rate--kp" style="width:2em;margin-top:1em;margin-right:1em;">' +
                '<div></div>' +
            '</div>' +
            '<div class="full-start__rate rate--imdb" style="width:2em;margin-top:1em;margin-right:1em;">' +
                '<div></div>' +
            '</div>' +
            '<div class="full-start__rate rate--lampa" style="width:2em;margin-top:1em;margin-right:1em;">' +
                '<div class="rate-label">LAMPA</div>' +
                '<div class="rate-value">0.0</div>' +
            '</div>';

        // Если в render-контейнере есть элемент .info__rate, вставляем сразу после него,
        // иначе – добавляем в конец render
        if($(render).find('.info__rate').length) {
            $(render).find('.info__rate').after(html);
        } else {
            $(render).append(html);
        }
        console.log('[Rating Plugin] Рейтинговые блоки добавлены');
    }

    /**
     * Функция инициализации плагина рейтингов.
     * Подписывается на событие "full" с типом "complite" и добавляет блоки, если они ещё не вставлены.
     */
    function startPlugin() {
        window.rating_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if(e.type === 'complite'){
                var render = e.object.activity.render();
                // Проверяем, что блоки для KP, IMDB и LAMPA ещё не добавлены
                if($(render).find('.rate--kp').length === 0 &&
                   $(render).find('.rate--imdb').length === 0 &&
                   $(render).find('.rate--lampa').length === 0) {
                    addRatingBlocks(e.data.movie);
                }
            }
        });
    }

    // Если плагин ещё не запущен, запускаем его
    if(!window.rating_plugin) startPlugin();

    console.log('[Rating Plugin] Плагин рейтингов запущен');
})();
