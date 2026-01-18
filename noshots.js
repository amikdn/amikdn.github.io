(function () {
    'use strict';

    const origAddComponent = Lampa.Component.add;
    Lampa.Component.add = function (name, comp) {
        if (name.startsWith('shots_')) {
            return;
        }
        return origAddComponent.apply(this, arguments);
    };

    const origContentAdd = Lampa.ContentRows.add;
    Lampa.ContentRows.add = function (obj) {
        if (obj.name === 'shots_main' || (obj.title && obj.title === 'Shots')) {
            return;
        }
        return origContentAdd.apply(this, arguments);
    };

    const origMenuAdd = Lampa.Menu.addButton;
    Lampa.Menu.addButton = function (icon, title, callback) {
        if (title === 'Shots') {
            return;
        }
        return origMenuAdd.apply(this, arguments);
    };

    setTimeout(() => {
        try {
            Lampa.Menu.remove && Lampa.Menu.remove('Shots');
        } catch (e) {}
    }, 1000);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            e.object.activity.render().find('.shots-view-button').remove();

            const observer = new MutationObserver(function () {
                const shotsButton = e.object.activity.render().find('.shots-view-button');
                if (shotsButton.length > 0) {
                    shotsButton.remove();
                }
            });

            observer.observe(e.object.activity.render()[0], {
                childList: true,
                subtree: true
            });
        }
    });
})();
