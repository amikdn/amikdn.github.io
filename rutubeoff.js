(function () {
    'use strict';
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            try {
                var render = e.object.activity.render();
                render.find('.view--rutube_trailer').remove();
                render.find('.view--trailer').remove();
            } catch (err) {}
        }
    });
})();


