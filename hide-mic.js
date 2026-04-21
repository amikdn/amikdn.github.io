(function () {
    'use strict';

    var STYLE_ID = 'hide-mic-button-style';
    var PATCH_FLAG = 'hideMicPatched';
    var redirectTimer = null;

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.simple-keyboard-mic{width:0 !important;min-width:0 !important;max-width:0 !important;margin:0 !important;padding:0 !important;border:0 !important;overflow:hidden !important;opacity:0 !important;pointer-events:none !important;}',
            '.simple-keyboard-mic svg{width:0 !important;height:0 !important;opacity:0 !important;}',
            '.simple-keyboard-mic svg *{fill:transparent !important;stroke:transparent !important;}',
            '.simple-keyboard-mic:before{content:none !important;}',
            '.search-source.selector,.search-source{margin-left:0 !important;}'
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
        node.style.width = '0';
        node.style.minWidth = '0';
        node.style.maxWidth = '0';
        node.style.margin = '0';
        node.style.padding = '0';
        node.style.border = '0';
        node.tabIndex = -1;

        var svg = node.querySelector('svg');
        if (svg) svg.setAttribute('focusable', 'false');
    }

    function redirectFocusFromMic() {
        var active = document.querySelector('.simple-keyboard-mic.focus, .simple-keyboard-mic.hover, .simple-keyboard-mic.active');
        if (!active) return;

        var keyboard = active.parentElement || document;
        var target = keyboard.querySelector('.selector:not(.simple-keyboard-mic)');
        if (!target) return;

        active.classList.remove('focus');
        active.classList.remove('hover');
        active.classList.remove('active');

        target.classList.add('focus');
        if (typeof target.focus === 'function') target.focus();
    }

    function scheduleRedirectFocus() {
        if (redirectTimer) clearTimeout(redirectTimer);

        var attempts = 8;

        function run() {
            redirectFocusFromMic();
            attempts -= 1;
            if (attempts > 0) redirectTimer = setTimeout(run, 60);
            else redirectTimer = null;
        }

        run();
    }

    function patchAll() {
        ensureStyle();

        var nodes = document.querySelectorAll('.simple-keyboard-mic');
        for (var i = 0; i < nodes.length; i++) patchMicButton(nodes[i]);

        scheduleRedirectFocus();
    }

    function observeMicButton() {
        patchAll();

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;

                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (!node || node.nodeType !== 1) continue;

                    if (node.matches && node.matches('.simple-keyboard-mic')) {
                        patchMicButton(node);
                        scheduleRedirectFocus();
                    }

                    if (node.querySelectorAll) {
                        var nested = node.querySelectorAll('.simple-keyboard-mic');
                        for (var k = 0; k < nested.length; k++) patchMicButton(nested[k]);
                        if (nested.length) scheduleRedirectFocus();
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        document.addEventListener('click', function (event) {
            var button = event.target && event.target.closest ? event.target.closest('.simple-keyboard-mic') : null;
            if (!button) return;

            event.preventDefault();
            event.stopPropagation();
        }, true);
    }

    ensureStyle();

    if (window.appready) observeMicButton();
    else if (window.Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') observeMicButton();
    });
    else observeMicButton();
})();
