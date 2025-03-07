(function () {
    'use strict';
    Lampa.Listener.follow('full', function (e) {
        console.log('Событие получено:', e);
        if (e.type == 'complete') {
            let activity = e.object.activity;
            let rendered = activity.render();
            console.log('Отрендеренный элемент:', rendered);
            let trailers = rendered.find('.view--trailer');
            console.log('Найденные трейлеры:', trailers);
            trailers.remove();
        }
    });
})();
