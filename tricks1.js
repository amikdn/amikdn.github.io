
(function () {
    'use strict';
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complete') {
            e.object.activity.render().find('.view--trailer').remove();
        }
    });
})();
