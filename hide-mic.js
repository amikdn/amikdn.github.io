(function () {
    'use strict';

    var STYLE_ID = 'hide-mic-button-style';
    var PATCH_FLAG = 'hideMicPatched';

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.simple-keyboard-mic{position:relative !important;overflow:hidden !important;}',
            '.simple-keyboard-mic svg{opacity:0 !important;}',
            '.simple-keyboard-mic svg *{fill:transparent !important;stroke:transparent !important;}',
            '.simple-keyboard-mic:before{content:"";display:block;width:100%;height:100%;}'
        ].join('');
        document.head.appendChild(style);
    }

    function patchMicButton(node) {
        if (!node || node.nodeType !== 1 || node.dataset[PATCH_FLAG]) return;

        node.dataset[PATCH_FLAG] = 'true';
        node.classList.remove('selector');
        node.setAttribute('aria-hidden', 'true');
        node.setAttribute('title', '');
        node.setAttribute('data-action', '');
        node.style.pointerEvents = 'none';

        var svg = node.querySelector('svg');
        if (svg) svg.setAttribute('focusable', 'false');
    }

    function patchAll() {
        ensureStyle();

        var nodes = document.querySelectorAll('.selector.simple-keyboard-mic');
        for (var i = 0; i < nodes.length; i++) patchMicButton(nodes[i]);
    }

    function observeMicButton() {
        patchAll();

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;

                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (!node || node.nodeType !== 1) continue;

                    if (node.matches && node.matches('.selector.simple-keyboard-mic')) patchMicButton(node);

                    if (node.querySelectorAll) {
                        var nested = node.querySelectorAll('.selector.simple-keyboard-mic');
                        for (var k = 0; k < nested.length; k++) patchMicButton(nested[k]);
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        document.addEventListener('click', function (event) {
            var button = event.target && event.target.closest ? event.target.closest('.selector.simple-keyboard-mic') : null;
            if (!button) return;

            event.preventDefault();
            event.stopPropagation();
        }, true);
    }

    if (window.appready) observeMicButton();
    else if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') observeMicButton();
    });
    else observeMicButton();
})();
