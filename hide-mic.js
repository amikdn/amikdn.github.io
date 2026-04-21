(function () {
    'use strict';

    var STYLE_ID = 'hide-mic-button-style';
    var PATCH_FLAG = 'hideMicPatched';

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.simple-keyboard-mic{width:0 !important;min-width:0 !important;max-width:0 !important;margin:0 !important;padding:0 !important;border:0 !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
            '.simple-keyboard-mic svg{width:0 !important;height:0 !important;opacity:0 !important;}',
            '.simple-keyboard-mic svg *{fill:transparent !important;stroke:transparent !important;}',
            '.simple-keyboard-mic:before{content:none !important;}',
            '.search-source,.search-source.selector{margin-left:0 !important;}'
        ].join('');
        document.head.appendChild(style);
    }

    function moveMicToEnd(node) {
        var parent = node.parentElement;
        if (!parent) return;

        if (parent.lastElementChild !== node) parent.appendChild(node);
    }

    function patchMicButton(node) {
        if (!node || node.nodeType !== 1 || node.dataset[PATCH_FLAG]) return;

        node.dataset[PATCH_FLAG] = 'true';
        node.setAttribute('aria-hidden', 'true');
        node.setAttribute('title', '');
        node.style.pointerEvents = 'none';
        node.style.width = '0';
        node.style.minWidth = '0';
        node.style.maxWidth = '0';
        node.style.margin = '0';
        node.style.padding = '0';
        node.style.border = '0';
        node.tabIndex = -1;

        var svg = node.querySelector('svg');
        if (svg) svg.setAttribute('focusable', 'false');

        moveMicToEnd(node);
    }

    function patchAll() {
        ensureStyle();

        var nodes = document.querySelectorAll('.simple-keyboard-mic');
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

                    if (node.matches && node.matches('.simple-keyboard-mic')) patchMicButton(node);

                    if (node.querySelectorAll) {
                        var nested = node.querySelectorAll('.simple-keyboard-mic');
                        for (var k = 0; k < nested.length; k++) patchMicButton(nested[k]);
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    ensureStyle();

    if (window.appready) observeMicButton();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') observeMicButton();
        });
    }
    else observeMicButton();
})();
