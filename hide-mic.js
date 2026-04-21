(function () {
    'use strict';

    function hideMicButton() {
        if (document.getElementById('hide-mic-button-style')) return;

        var style = document.createElement('style');
        style.id = 'hide-mic-button-style';
        style.textContent = [
            '.selector.simple-keyboard-mic{color:transparent !important;}',
            '.selector.simple-keyboard-mic svg{opacity:0 !important;}',
            '.selector.simple-keyboard-mic svg *{fill:transparent !important;stroke:transparent !important;}'
        ].join('');
        document.head.appendChild(style);
    }

    if (window.appready) hideMicButton();
    else if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') hideMicButton();
    });
    else hideMicButton();
})();
