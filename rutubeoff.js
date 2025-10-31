(function () {
    'use strict';
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            try {
                var render = e.object.activity.render();
                render.find('.view--rutube_trailer').remove();
                render.find('.view--trailer').remove();
                render.find('.online-prestige-watched').remove();
                render.find('.watched-history').remove();
            } catch (err) {}
        }
    });
})();

