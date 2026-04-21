(function () {
    'use strict';

    function hideMicButton() {
        if (document.getElementById('hide-mic-button-style')) return;

        var style = document.createElement('style');
        style.id = 'hide-mic-button-style';
        style.textContent = '.selector.simple-keyboard-mic{display:none !important;visibility:hidden !important;pointer-events:none !important;}';
        document.head.appendChild(style);
    }

    if (window.appready) hideMicButton();
    else if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') hideMicButton();
    });
    else hideMicButton();
})();
