(function () {
    'use strict';

    var STYLE_ID = 'hide-mic-button-style';
    var PATCH_FLAG = 'hideMicPatched';
    var OBSERVER_FLAG = 'hideMicObserved';

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

    function isMicFocused(node) {
        return !!node && (
            node.classList.contains('focus') ||
            node.classList.contains('hover') ||
            node.classList.contains('active')
        );
    }

    function findTarget(node) {
        var next = node.nextElementSibling;
        while (next) {
            if (next.classList && next.classList.contains('selector') && !next.classList.contains('simple-keyboard-mic')) return next;
            next = next.nextElementSibling;
        }

        var prev = node.previousElementSibling;
        while (prev) {
            if (prev.classList && prev.classList.contains('selector') && !prev.classList.contains('simple-keyboard-mic')) return prev;
            prev = prev.previousElementSibling;
        }

        var scope = node.parentElement || document;
        return scope.querySelector('.selector:not(.simple-keyboard-mic)');
    }

    function moveFocusFromMic(node) {
        if (!isMicFocused(node)) return;

        var target = findTarget(node);
        if (!target) return;

        node.classList.remove('focus');
        node.classList.remove('hover');
        node.classList.remove('active');

        target.classList.add('focus');
        if (typeof target.focus === 'function') target.focus();
    }

    function observeMicState(node) {
        if (!node || node.nodeType !== 1 || node.dataset[OBSERVER_FLAG]) return;

        node.dataset[OBSERVER_FLAG] = 'true';

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'class') {
                    moveFocusFromMic(node);
                }
            }
        });

        observer.observe(node, {
            attributes: true,
            attributeFilter: ['class']
        });
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

        var svg = node.querySelector('svg');
        if (svg) svg.setAttribute('focusable', 'false');

        observeMicState(node);
        moveFocusFromMic(node);
    }

    function patchAll() {
        ensureStyle();

        var nodes = document.querySelectorAll('.simple-keyboard-mic');
        for (var i = 0; i < nodes.length; i++) patchMicButton(nodes[i]);

        requestAnimationFrame(function () {
            var active = document.querySelector('.simple-keyboard-mic');
            if (active) moveFocusFromMic(active);
        });
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
