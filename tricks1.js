(function(){
    "use strict";

    /**
     * Функция вставляет блок рейтинга LAMPA в переданный контейнер render.
     * Если в контейнере уже существует блок с классом .rate--lampa, ничего не делает.
     * @param {HTMLElement} render - контейнер карточки, куда вставлять блок.
     * @returns {boolean} - true, если блок вставлен или уже существует, иначе false.
     */
    function insertLampaBlock(render) {
        if (!render) return false;
        if ($(render).find('.rate--lampa').length > 0) {
            console.log('[LAMPA] Блок LAMPA уже существует');
            return true;
        }
        var html = 
            '<div class="full-start__rate rate--lampa" style="width:2em;margin-top:1em;margin-right:1em;">' +
                '<div class="rate-label">LAMPA</div>' +
                '<div class="rate-value">0.0</div>' +
            '</div>';
        if ($(render).find('.info__rate').length) {
            $(render).find('.info__rate').after(html);
        } else {
            $(render).append(html);
        }
        console.log('[LAMPA] Блок LAMPA добавлен');
        return true;
    }

    // Обработчик события "full" (тип "complite")
    Lampa.Listener.follow('full', function(e) {
        console.log('[LAMPA DEBUG] Событие "full" получено:', e);
        var render = null;
        if (e && e.object && typeof e.object.activity.render === 'function') {
            render = e.object.activity.render();
            console.log('[LAMPA DEBUG] render получен через событие:', render);
            insertLampaBlock(render);
        } else {
            console.log('[LAMPA DEBUG] render не найден через событие');
        }
    });

    // Проводим polling каждые 1 секунду в течение 10 секунд, если блок не вставлен
    var attempts = 0;
    var pollInterval = setInterval(function(){
        attempts++;
        var render = (Lampa.Activity.active() && Lampa.Activity.active().activity && typeof Lampa.Activity.active().activity.render === 'function')
                        ? Lampa.Activity.active().activity.render() : null;
        console.log('[LAMPA DEBUG] polling, render:', render);
        if (render && insertLampaBlock(render)) {
            clearInterval(pollInterval);
        }
        if (attempts >= 10) clearInterval(pollInterval);
    }, 1000);

    console.log('[LAMPA] Плагин LAMPA запущен');
})();
