(function () {
    'use strict';

    if (window.__settings_menu_editor_loaded__) return;
    window.__settings_menu_editor_loaded__ = true;

    var VERSION = '1.0.0';
    var CONFIG_KEY = 'settings_menu_editor_config_v1';
    var ICONS_CACHE_KEY = 'settings_menu_editor_icons_cache_v1';
    var ICONS_URL = 'https://amikdn.github.io/lampa-button-icons.json';
    var ICONS_TTL = 24 * 60 * 60 * 1000;
    var MAX_LABEL = 80;
    var MAX_ICON = 30000;
    var EDITOR_ATTR = 'data-settings-menu-editor';

    var state = null;
    var runtime = {
        container: null,
        items: {},
        nextOriginalIndex: 1
    };
    var iconLib = {
        loaded: false,
        loading: false,
        icons: [],
        error: '',
        callbacks: []
    };
    var applyTimers = [];
    var started = false;
    var mainHookInstalled = false;
    var mainHookTimer = null;
    var bootTimer = null;
    var bootListening = false;

    var PLACEHOLDER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"></rect><circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none"></circle><path d="M21 15.5l-4.8-4.8L5.5 21"></path></svg>';

    var GEAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';

    var PENCIL_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"></path><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>';

    var UP_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12L11 3L20 12"></path></svg>';
    var DOWN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2L11 11L20 2"></path></svg>';

    var CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="none"><rect x="1.8" y="1.8" width="22.4" height="22.4" rx="4" stroke="currentColor" stroke-width="2.4"></rect><path class="sme-check" d="M7.4 13.1l3.7 3.7 7.5-7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

    function has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function log() {
        try {
            if (window.console && console.warn) {
                console.warn.apply(console, ['[settings-menu-editor]'].concat(Array.prototype.slice.call(arguments)));
            }
        } catch (e) {}
    }

    function trim(value) {
        return String(value == null ? '' : value).replace(/^\s+|\s+$/g, '');
    }

    function normalizeSpace(value) {
        return trim(String(value == null ? '' : value).replace(/\s+/g, ' '));
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    function hasClass(el, cls) {
        if (!el || !el.className) return false;
        return (' ' + String(el.className) + ' ').indexOf(' ' + cls + ' ') !== -1;
    }

    function cloneState() {
        try {
            return JSON.parse(JSON.stringify(state));
        } catch (e) {
            return defaultState();
        }
    }

    function defaultState() {
        return {
            version: 1,
            order: [],
            hidden: [],
            labels: {},
            icons: {}
        };
    }

    function cleanSvgAttributes(el) {
        if (!el || !el.attributes) return;

        var attrs = el.attributes;

        for (var i = attrs.length - 1; i >= 0; i--) {
            var attr = attrs[i];
            if (!attr) continue;

            var name = String(attr.name || '').toLowerCase();
            var value = String(attr.value || '');

            if (name.indexOf('on') === 0) {
                el.removeAttribute(attr.name);
                continue;
            }

            if (name === 'href' || name === 'xlink:href' || name === 'src') {
                if (/^\s*(javascript:|https?:|data:)/i.test(value)) {
                    el.removeAttribute(attr.name);
                }
                continue;
            }

            if (name === 'style' && /url\s*\(|expression\s*\(|javascript:|@import/i.test(value)) {
                el.removeAttribute(attr.name);
            }
        }
    }

    function removeUnsafeSvgNodes(root) {
        var names = ['script', 'style', 'foreignObject', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video', 'image'];

        for (var n = 0; n < names.length; n++) {
            var nodes = root.getElementsByTagName(names[n]);
            for (var i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i] && nodes[i].parentNode) {
                    nodes[i].parentNode.removeChild(nodes[i]);
                }
            }
        }
    }

    function sanitizeSvg(raw) {
        if (typeof raw !== 'string') return '';

        raw = trim(raw);

        if (!raw || raw.length > MAX_ICON || raw.indexOf('<svg') === -1) return '';

        var result = '';

        if (window.DOMParser && window.XMLSerializer) {
            try {
                var parser = new DOMParser();
                var doc = parser.parseFromString(raw, 'image/svg+xml');
                var root = doc && doc.documentElement;
                var broken = false;

                if (doc) {
                    var errors = doc.getElementsByTagName('parsererror');
                    if (errors && errors.length) broken = true;
                }

                if (!broken && root && String(root.nodeName || '').toLowerCase() === 'svg') {
                    removeUnsafeSvgNodes(root);

                    var all = root.getElementsByTagName('*');
                    for (var i = all.length - 1; i >= 0; i--) {
                        cleanSvgAttributes(all[i]);
                    }
                    cleanSvgAttributes(root);

                    if (!root.getAttribute('viewBox')) {
                        var w = parseFloat(root.getAttribute('width'));
                        var h = parseFloat(root.getAttribute('height'));
                        if (w > 0 && h > 0) {
                            root.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                        }
                    }

                    if (!root.getAttribute('fill')) {
                        root.setAttribute('fill', 'currentColor');
                    }

                    root.setAttribute('focusable', 'false');
                    root.setAttribute('aria-hidden', 'true');

                    result = new XMLSerializer().serializeToString(root);
                }
            } catch (e) {
                result = '';
            }
        }

        if (!result) {
            var match = raw.match(/<svg[\s\S]*?<\/svg>/i);
            if (!match) return '';

            result = match[0];

            result = result.replace(/<\s*(script|style|foreignObject|iframe|object|embed|audio|video|image)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
            result = result.replace(/<\s*(script|style|foreignObject|iframe|object|embed|audio|video|image)\b[^>]*\/?\s*>/gi, '');
            result = result.replace(/\son[a-z0-9_-]+\s*=\s*"[^"]*"/gi, '');
            result = result.replace(/\son[a-z0-9_-]+\s*=\s*'[^']*'/gi, '');
            result = result.replace(/\son[a-z0-9_-]+\s*=\s*[^\s>]+/gi, '');
            result = result.replace(/(href|xlink:href|src)\s*=\s*["']\s*(javascript:|https?:|data:)[^"']*["']/gi, '$1="#"');
            result = result.replace(/(style\s*=\s*["'][^"']*)(url\s*\(|expression\s*\(|javascript:|@import)([^"']*["'])/gi, '$1$3');

            var openTagMatch = result.match(/<svg\b[^>]*>/i);
            var openTag = openTagMatch ? openTagMatch[0] : '';
            var extra = '';

            if (!/\sfill\s*=/i.test(openTag)) extra += ' fill="currentColor"';

            if (!/\sviewBox\s*=/i.test(openTag)) {
                var wm = openTag.match(/\swidth\s*=\s*["']?([\d.]+)/i);
                var hm = openTag.match(/\sheight\s*=\s*["']?([\d.]+)/i);
                if (wm && hm) {
                    extra += ' viewBox="0 0 ' + parseFloat(wm[1]) + ' ' + parseFloat(hm[1]) + '"';
                }
            }

            result = result.replace(/<svg\b/i, '<svg' + extra + ' focusable="false" aria-hidden="true"');
        }

        return result;
    }

    function svgKey(svg) {
        var s = String(svg || '').replace(/\s+/g, ' ').replace(/>\s+</g, '><');
        var vb = s.match(/viewBox\s*=\s*["']([^"']+)["']/i);
        var paths = s.match(/\bd\s*=\s*["']([^"']+)["']/gi) || [];
        var data = [];

        for (var i = 0; i < paths.length; i++) {
            var m = paths[i].match(/\bd\s*=\s*["']([^"']+)["']/i);
            if (m) data.push(m[1].replace(/\s+/g, ' '));
        }

        if (!data.length) return s;

        data.sort();

        return (vb ? vb[1] : '') + '|' + data.join('|');
    }

    function normalizeState(raw) {
        var result = defaultState();

        if (typeof raw === 'string') {
            try {
                raw = JSON.parse(raw);
            } catch (e) {
                raw = null;
            }
        }

        if (!raw || typeof raw !== 'object') return result;

        if (isArray(raw.order)) {
            for (var i = 0; i < raw.order.length && result.order.length < 200; i++) {
                var orderKey = trim(raw.order[i]);
                if (orderKey && result.order.indexOf(orderKey) === -1) {
                    result.order.push(orderKey);
                }
            }
        }

        if (isArray(raw.hidden)) {
            for (var h = 0; h < raw.hidden.length && result.hidden.length < 200; h++) {
                var hiddenKey = trim(raw.hidden[h]);
                if (hiddenKey && result.hidden.indexOf(hiddenKey) === -1) {
                    result.hidden.push(hiddenKey);
                }
            }
        }

        if (raw.labels && typeof raw.labels === 'object') {
            for (var labelKey in raw.labels) {
                if (!has(raw.labels, labelKey)) continue;

                var label = raw.labels[labelKey];

                if (typeof label !== 'string') continue;

                label = normalizeSpace(label).substring(0, MAX_LABEL);

                if (label) result.labels[labelKey] = label;
            }
        }

        if (raw.icons && typeof raw.icons === 'object') {
            for (var iconKey in raw.icons) {
                if (!has(raw.icons, iconKey)) continue;

                var icon = sanitizeSvg(raw.icons[iconKey]);

                if (icon) result.icons[iconKey] = icon;
            }
        }

        return result;
    }

    function loadState() {
        var raw = null;

        try {
            raw = Lampa.Storage.get(CONFIG_KEY, null);
        } catch (e) {
            log('load state', e);
        }

        state = normalizeState(raw);
    }

    function saveState() {
        if (!state) state = defaultState();

        try {
            Lampa.Storage.set(CONFIG_KEY, {
                version: 1,
                order: state.order.slice(0),
                hidden: state.hidden.slice(0),
                labels: state.labels,
                icons: state.icons
            });
        } catch (e) {
            log('save state', e);
        }
    }

    function isHidden(key) {
        return state && state.hidden.indexOf(key) !== -1;
    }

    function scan(container) {
        if (!container) return;

        if (runtime.container !== container) {
            runtime = {
                container: container,
                items: {},
                nextOriginalIndex: 1
            };
        }

        var used = {};
        var children = container.children;

        for (var i = 0; i < children.length; i++) {
            var el = children[i];

            if (!el || el.nodeType !== 1) continue;
            if (el.getAttribute(EDITOR_ATTR) === '1') continue;
            if (!hasClass(el, 'settings-folder')) continue;

            var key = el.getAttribute('data-se-key');

            if (!key) {
                var component = el.getAttribute('data-component');
                var base = component ? 'c:' + component : 'a:' + i;

                key = base;

                var suffix = 2;
                while (
                    used[key] ||
                    (
                        runtime.items[key] &&
                        runtime.items[key].el !== el &&
                        runtime.items[key].el &&
                        runtime.items[key].el.parentNode === container
                    )
                ) {
                    key = base + '#' + suffix;
                    suffix++;
                }

                el.setAttribute('data-se-key', key);
            } else if (used[key]) {
                var duplicateBase = key;
                var duplicateSuffix = 2;

                while (used[duplicateBase + '#' + duplicateSuffix]) {
                    duplicateSuffix++;
                }

                key = duplicateBase + '#' + duplicateSuffix;
                el.setAttribute('data-se-key', key);
            }

            used[key] = true;

            var existing = runtime.items[key];
            var nameEl = el.querySelector('.settings-folder__name');
            var iconEl = el.querySelector('.settings-folder__icon');
            var label = nameEl ? normalizeSpace(nameEl.textContent) : '';
            var icon = iconEl ? iconEl.innerHTML : '';

            if (!existing) {
                runtime.items[key] = {
                    key: key,
                    el: el,
                    originalLabel: label,
                    originalIcon: icon,
                    originalIndex: runtime.nextOriginalIndex++,
                    stashed: false,
                    appliedLabel: false,
                    appliedIcon: false
                };
            } else if (existing.el !== el) {
                existing.el = el;
                existing.stashed = false;
                existing.appliedLabel = false;
                existing.appliedIcon = false;
            } else {
                existing.stashed = false;
            }
        }

        for (var itemKey in runtime.items) {
            if (!has(runtime.items, itemKey)) continue;

            var item = runtime.items[itemKey];

            if (used[itemKey]) continue;
            if (isHidden(itemKey) || item.stashed) continue;

            if (item.el && item.el.parentNode && item.el.parentNode !== container) {
                continue;
            }

            delete runtime.items[itemKey];
        }
    }

    function getFullOrder() {
        var result = [];
        var seen = {};
        var rest = [];
        var key;

        if (state && isArray(state.order)) {
            for (var i = 0; i < state.order.length; i++) {
                key = state.order[i];

                if (runtime.items[key] && !seen[key]) {
                    seen[key] = true;
                    result.push(key);
                }
            }
        }

        for (key in runtime.items) {
            if (has(runtime.items, key) && !seen[key]) {
                rest.push(runtime.items[key]);
            }
        }

        rest.sort(function (a, b) {
            return a.originalIndex - b.originalIndex;
        });

        for (var j = 0; j < rest.length; j++) {
            result.push(rest[j].key);
        }

        return result;
    }

    function ensureOrderSaved() {
        state.order = getFullOrder();
    }

    function applyItemVisuals() {
        for (var key in runtime.items) {
            if (!has(runtime.items, key)) continue;

            var item = runtime.items[key];
            var label = state.labels[key];
            var customIcon = state.icons[key];
            var nameEl = item.el.querySelector('.settings-folder__name');
            var iconEl = item.el.querySelector('.settings-folder__icon');

            if (nameEl) {
                if (label) {
                    if (nameEl.textContent !== label) {
                        nameEl.textContent = label;
                    }
                    item.appliedLabel = true;
                } else if (item.appliedLabel) {
                    nameEl.textContent = item.originalLabel;
                    item.appliedLabel = false;
                }
            }

            if (iconEl) {
                if (customIcon) {
                    if (iconEl.innerHTML !== customIcon) {
                        iconEl.innerHTML = customIcon;
                    }
                    item.appliedIcon = true;
                } else if (item.appliedIcon) {
                    iconEl.innerHTML = item.originalIcon || '';
                    item.appliedIcon = false;
                }
            }
        }
    }

    function applyOrderAndVisibility(container) {
        var order = getFullOrder();
        var desired = [];
        var visibleItem;

        for (var i = 0; i < order.length; i++) {
            var key = order[i];
            var item = runtime.items[key];

            if (!item) continue;

            if (isHidden(key)) {
                if (item.el.parentNode) {
                    item.el.parentNode.removeChild(item.el);
                }
                item.stashed = true;
                continue;
            }

            if (item.el.parentNode && item.el.parentNode !== container) {
                item.el.parentNode.removeChild(item.el);
            }

            item.stashed = false;
            desired.push(item.el);
        }

        var current = [];

        for (var c = 0; c < container.children.length; c++) {
            var child = container.children[c];

            if (!child || child.nodeType !== 1) continue;
            if (child.getAttribute(EDITOR_ATTR) === '1') continue;
            if (!hasClass(child, 'settings-folder')) continue;

            current.push(child);
        }

        var same = current.length === desired.length;

        if (same) {
            for (var s = 0; s < desired.length; s++) {
                if (current[s] !== desired[s]) {
                    same = false;
                    break;
                }
            }
        }

        if (!same) {
            for (var d = 0; d < desired.length; d++) {
                container.appendChild(desired[d]);
            }
        }

        var editor = ensureEditorEntry(container);
        var last = container.children.length ? container.children[container.children.length - 1] : null;

        if (last !== editor) {
            container.appendChild(editor);
        }
    }

    function applyTo(container) {
        if (!container) return;

        scan(container);
        ensureEditorEntry(container);
        applyItemVisuals();
        applyOrderAndVisibility(container);
    }

    function ensureEditorEntry(container) {
        if (!container) return null;

        var editor = container.querySelector('[' + EDITOR_ATTR + '="1"]');

        if (!editor) {
            var entry = $(
                '<div class="settings-folder selector sme-entry" tabindex="0" ' + EDITOR_ATTR + '="1" data-static="true">' +
                    '<div class="settings-folder__icon">' + GEAR_ICON + '</div>' +
                    '<div class="settings-folder__name">Редактор меню</div>' +
                '</div>'
            );

            container.appendChild(entry[0]);
            editor = entry[0];
        }

        if (editor.parentNode !== container) {
            container.appendChild(editor);
        }

        $(editor)
            .off('hover:enter.smeEditor')
            .on('hover:enter.smeEditor', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                openEditor(null, null);
            });

        return editor;
    }

    function clearApplyTimers() {
        for (var i = 0; i < applyTimers.length; i++) {
            clearTimeout(applyTimers[i]);
        }
        applyTimers = [];
    }

    function scheduleApply(container, delay) {
        applyTimers.push(setTimeout(function () {
            if (!container || !document.body.contains(container)) return;
            if (runtime.container !== container) return;
            applyTo(container);
        }, delay));
    }

    function onSettingsOpen(e) {
        if (!e || e.name !== 'main' || !e.body) return;

        installMainUpdateHook();

        var body = e.body.jquery ? e.body : $(e.body);
        var container = body.find('.scroll__body').children().first()[0];

        if (!container) {
            var firstFolder = body.find('.settings-folder').first();
            if (firstFolder.length) container = firstFolder.parent()[0];
        }

        if (!container) return;

        applyTo(container);

        clearApplyTimers();
        scheduleApply(container, 250);
        scheduleApply(container, 1000);
    }

    function installMainUpdateHook() {
        if (mainHookInstalled) return true;

        if (!window.Lampa || !Lampa.Settings || typeof Lampa.Settings.main !== 'function') {
            return false;
        }

        var main = null;

        try {
            main = Lampa.Settings.main();
        } catch (e) {
            log('get main', e);
        }

        if (!main || typeof main.update !== 'function') return false;

        var originalUpdate = main.update;

        main.update = function () {
            try {
                syncEditorEntryFromMain(main);
            } catch (e) {
                log('main update hook', e);
            }

            return originalUpdate.apply(this, arguments);
        };

        main.__smeOriginalUpdate = originalUpdate;
        mainHookInstalled = true;

        try {
            syncEditorEntryFromMain(main);
        } catch (e) {
            log('initial editor entry', e);
        }

        return true;
    }

    function syncEditorEntryFromMain(main) {
        if (!main || typeof main.render !== 'function') return;

        var scroll = main.render();

        if (!scroll || !scroll.length) return;

        var container = scroll.find('.scroll__body').children().first()[0];

        if (!container) {
            var firstFolder = scroll.find('.settings-folder').first();
            if (firstFolder.length) container = firstFolder.parent()[0];
        }

        if (container) ensureEditorEntry(container);
    }

    function refreshSettingsCollection() {
        if (!runtime.container || !window.Lampa || !Lampa.Controller) return;

        try {
            var enabled = Lampa.Controller.enabled ? Lampa.Controller.enabled() : null;

            if (!enabled || enabled.name !== 'settings') return;

            Lampa.Controller.collectionSet(runtime.container);
            Lampa.Controller.collectionFocus(false, runtime.container);
        } catch (e) {
            log('refresh collection', e);
        }
    }

    function getCachedIcons(allowExpired) {
        var cache = null;

        try {
            cache = Lampa.Storage.get(ICONS_CACHE_KEY, null);
        } catch (e) {
            log('read icon cache', e);
        }

        if (!cache || typeof cache !== 'object' || !isArray(cache.icons) || !cache.icons.length) {
            return null;
        }

        if (!allowExpired && cache.time && (Date.now() - cache.time) > ICONS_TTL) {
            return null;
        }

        var result = [];
        var seen = {};

        for (var i = 0; i < cache.icons.length; i++) {
            var svg = sanitizeSvg(cache.icons[i]);

            if (!svg) continue;

            var key = svgKey(svg);
            if (seen[key]) continue;

            seen[key] = true;
            result.push(svg);
        }

        return result.length ? result : null;
    }

    function saveIconsCache(icons) {
        try {
            Lampa.Storage.set(ICONS_CACHE_KEY, {
                time: Date.now(),
                icons: icons
            });
        } catch (e) {
            log('save icon cache', e);
        }
    }

    function parseIconsText(text) {
        text = String(text || '').replace(/^\uFEFF/, '').replace(/^\s+|\s+$/g, '');

        if (!text) return [];

        var arr = null;
        var cleaned = text
            .replace(/,(\s*)\]/g, '$1]')
            .replace(/,(\s*)\}/g, '$1}');

        try {
            arr = JSON.parse(cleaned);
        } catch (e) {
            arr = null;
        }

        if (arr && !isArray(arr)) {
            if (isArray(arr.icons)) arr = arr.icons;
            else if (isArray(arr.buttons)) arr = arr.buttons;
            else arr = null;
        }

        if (!isArray(arr)) {
            arr = text.match(/<svg[\s\S]*?<\/svg>/gi) || [];
        }

        var result = [];
        var seen = {};

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var html = '';

            if (typeof item === 'string') {
                html = item;
            } else if (item && typeof item.html === 'string') {
                html = item.html;
            } else if (item && typeof item.svg === 'string') {
                html = item.svg;
            }

            var svg = sanitizeSvg(html);

            if (!svg) continue;

            var key = svgKey(svg);
            if (seen[key]) continue;

            seen[key] = true;
            result.push(svg);
        }

        return result;
    }

    function fetchIconsText(force, callback) {
        var xhr = new XMLHttpRequest();
        var url = ICONS_URL;
        var settled = false;

        function done(err, text) {
            if (settled) return;
            settled = true;
            callback(err, text);
        }

        if (force) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + 't=' + Date.now();
        }

        xhr.open('GET', url, true);
        xhr.timeout = 15000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status && xhr.status >= 200 && xhr.status < 300) {
                done(null, xhr.responseText || '');
            } else {
                done('Ошибка загрузки: ' + (xhr.status || 'сеть'));
            }
        };

        xhr.onerror = function () {
            done('Ошибка сети');
        };

        xhr.ontimeout = function () {
            done('Таймаут загрузки иконок');
        };

        try {
            xhr.send();
        } catch (e) {
            done('Ошибка запроса');
        }
    }

    function loadIcons(force, callback) {
        callback = typeof callback === 'function' ? callback : function () {};

        if (!force && iconLib.loaded) {
            callback(iconLib.error || null);
            return;
        }

        if (iconLib.loading) {
            iconLib.callbacks.push(callback);
            return;
        }

        if (!force) {
            var cached = getCachedIcons(false);

            if (cached) {
                iconLib.icons = cached;
                iconLib.loaded = true;
                iconLib.error = '';
                callback(null);
                return;
            }
        }

        iconLib.loading = true;
        iconLib.error = '';
        iconLib.callbacks.push(callback);

        fetchIconsText(force, function (err, text) {
            var icons = [];

            if (!err) {
                icons = parseIconsText(text);

                if (!icons.length) {
                    err = 'Не удалось распознать иконки';
                }
            }

            if (!err) {
                iconLib.icons = icons;
                iconLib.loaded = true;
                iconLib.error = '';
                saveIconsCache(icons);
            } else {
                var fallback = getCachedIcons(true);

                if (fallback) {
                    iconLib.icons = fallback;
                    iconLib.loaded = true;
                    iconLib.error = 'Не удалось обновить, показаны сохранённые иконки';
                } else {
                    iconLib.error = err;
                }
            }

            iconLib.loading = false;

            var callbacks = iconLib.callbacks.slice(0);
            iconLib.callbacks = [];

            for (var i = 0; i < callbacks.length; i++) {
                try {
                    callbacks[i](iconLib.error || null);
                } catch (e) {
                    log('icon callback', e);
                }
            }
        });
    }

    function bindControl(el, handler) {
        el.off('hover:enter.smeControl').on('hover:enter.smeControl', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            handler();
        });
    }

    function isModalOpen() {
        try {
            return !!(window.Lampa && Lampa.Modal && typeof Lampa.Modal.opened === 'function' && Lampa.Modal.opened());
        } catch (e) {
            return false;
        }
    }

    function closeModal() {
        try {
            if (!window.Lampa || !Lampa.Modal) return;
            if (typeof Lampa.Modal.opened === 'function' && !Lampa.Modal.opened()) return;
            Lampa.Modal.close();
        } catch (e) {
            log('close modal', e);
        }
    }

    function openModal(params) {
        try {
            Lampa.Modal.open(params);

            var modal = Lampa.Modal.render();

            if (modal && modal.addClass) {
                modal.addClass('sme-modal');
            }
        } catch (e) {
            log('open modal', e);
        }
    }

    function isNodeAttached(el) {
        return !!(el && el.parentNode && document.body.contains(el));
    }

    function currentLabel(item) {
        var nameEl = item.el.querySelector('.settings-folder__name');

        return state.labels[item.key] || normalizeSpace(nameEl ? nameEl.textContent : item.originalLabel) || 'Без названия';
    }

    function currentIcon(item) {
        var iconEl = item.el.querySelector('.settings-folder__icon');

        return state.icons[item.key] || (iconEl ? iconEl.innerHTML : item.originalIcon) || PLACEHOLDER_ICON;
    }

    function closeToSettings() {
        closeModal();

        setTimeout(function () {
            if (runtime.container) applyTo(runtime.container);

            try {
                if (window.Lampa && Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                    Lampa.Controller.toggle('settings');
                }
            } catch (e) {
                log('back to settings', e);
            }
        }, 60);
    }

    function resetAll(openUi) {
        state = defaultState();
        saveState();

        if (runtime.container) {
            applyTo(runtime.container);
        }

        refreshSettingsCollection();

        closeModal();

        if (openUi) {
            setTimeout(function () {
                openEditor(null, null);
            }, 140);
        }

        try {
            if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Настройки меню сброшены');
        } catch (e) {}
    }

    function updateArrowStates(list) {
        var rows = list.children('.sme-row');

        rows.each(function (index) {
            var row = $(this);

            row.find('.sme-up').toggleClass('sme-disabled', index === 0);
            row.find('.sme-down').toggleClass('sme-disabled', index === rows.length - 1);
        });
    }

    function moveItem(key, direction, row, control, list) {
        var order = getFullOrder();
        var index = order.indexOf(key);
        var next = index + direction;

        if (index === -1 || next < 0 || next >= order.length) return;

        order.splice(index, 1);
        order.splice(next, 0, key);

        state.order = order;
        saveState();

        if (direction < 0) {
            row.prevAll('.sme-row').first().before(row);
        } else {
            row.nextAll('.sme-row').first().after(row);
        }

        updateArrowStates(list);

        if (runtime.container) applyTo(runtime.container);

        try {
            if (Lampa.Controller && typeof Lampa.Controller.focus === 'function') {
                Lampa.Controller.focus(control[0]);
            }
        } catch (e) {}
    }

    function toggleHidden(key, row, control) {
        var hidden = state.hidden.slice(0);
        var index = hidden.indexOf(key);

        if (index === -1) {
            hidden.push(key);
        } else {
            hidden.splice(index, 1);
        }

        state.hidden = hidden;
        ensureOrderSaved();
        saveState();

        var nowHidden = isHidden(key);

        row.toggleClass('sme-row--hidden', nowHidden);
        control.find('.sme-check').attr('opacity', nowHidden ? '0' : '1');

        if (runtime.container) applyTo(runtime.container);

        try {
            if (Lampa.Controller && typeof Lampa.Controller.focus === 'function') {
                Lampa.Controller.focus(control[0]);
            }
        } catch (e) {}
    }

    function openRename(key) {
        var item = runtime.items[key];

        if (!item) return;

        var value = state.labels[key] || item.originalLabel || '';

        closeModal();

        setTimeout(function () {
            function apply(value) {
                value = normalizeSpace(value).substring(0, MAX_LABEL);

                if (!value || value === item.originalLabel) {
                    delete state.labels[key];
                } else {
                    state.labels[key] = value;
                }

                saveState();

                if (runtime.container) applyTo(runtime.container);

                setTimeout(function () {
                    openEditor(key, 'name');
                }, 140);
            }

            try {
                if (window.Lampa && Lampa.Input && typeof Lampa.Input.edit === 'function') {
                    Lampa.Input.edit({
                        title: 'Название пункта',
                        value: value,
                        free: true,
                        nosave: true,
                        nomic: true
                    }, function (newValue) {
                        apply(newValue);
                    });
                } else {
                    var newValue = window.prompt('Название пункта', value);

                    if (newValue !== null) {
                        apply(newValue);
                    } else {
                        openEditor(key, 'name');
                    }
                }
            } catch (e) {
                log('rename', e);
                openEditor(key, 'name');
            }
        }, 180);
    }

    function buildEditor(focusKey, focusType) {
        var wrap = $('<div class="sme-editor"></div>');
        var hint = $(
            '<div class="sme-hint">' +
                'Иконка или название — изменить. Стрелки — порядок. Галочка — показывать пункт. ' +
                'Изменения сохраняются сразу.' +
            '</div>'
        );
        var list = $('<div class="sme-list"></div>');
        var order = getFullOrder();
        var focusTarget = null;

        wrap.append(hint);

        for (var i = 0; i < order.length; i++) {
            (function (key) {
                var item = runtime.items[key];

                if (!item) return;

                var hidden = isHidden(key);
                var row = $('<div class="sme-row"></div>');

                if (hidden) row.addClass('sme-row--hidden');

                var iconBtn = $('<div class="selector sme-btn sme-icon" tabindex="0" title="Выбрать иконку"></div>');
                iconBtn.html(currentIcon(item));

                var nameBtn = $(
                    '<div class="selector sme-name" tabindex="0" title="Переименовать">' +
                        '<span class="sme-name-text"></span>' +
                        '<span class="sme-pencil">' + PENCIL_ICON + '</span>' +
                    '</div>'
                );
                nameBtn.find('.sme-name-text').text(currentLabel(item));

                var upBtn = $('<div class="selector sme-btn sme-up" tabindex="0" title="Выше">' + UP_ICON + '</div>');
                var downBtn = $('<div class="selector sme-btn sme-down" tabindex="0" title="Ниже">' + DOWN_ICON + '</div>');
                var eyeBtn = $('<div class="selector sme-btn sme-eye" tabindex="0" title="Скрыть или показать">' + CHECK_ICON + '</div>');

                eyeBtn.find('.sme-check').attr('opacity', hidden ? '0' : '1');

                bindControl(iconBtn, function () {
                    openIconPicker(key);
                });

                bindControl(nameBtn, function () {
                    openRename(key);
                });

                bindControl(upBtn, function () {
                    moveItem(key, -1, row, upBtn, list);
                });

                bindControl(downBtn, function () {
                    moveItem(key, 1, row, downBtn, list);
                });

                bindControl(eyeBtn, function () {
                    toggleHidden(key, row, eyeBtn);
                });

                row.append(iconBtn);
                row.append(nameBtn);
                row.append(upBtn);
                row.append(downBtn);
                row.append(eyeBtn);

                list.append(row);

                if (key === focusKey) {
                    focusTarget = focusType === 'name' ? nameBtn[0] : iconBtn[0];
                }
            })(order[i]);
        }

        if (!order.length) {
            list.append('<div class="sme-empty">Пункты меню не найдены.</div>');
        }

        wrap.append(list);

        var resetArmed = false;
        var resetTimer = 0;

        var resetBtn = $(
            '<div class="selector sme-footer-btn sme-danger" tabindex="0">' +
                '<span class="sme-btn-label">Сбросить настройки меню</span>' +
            '</div>'
        );

        bindControl(resetBtn, function () {
            if (resetArmed) {
                clearTimeout(resetTimer);
                resetAll(true);
                return;
            }

            resetArmed = true;
            resetBtn.addClass('sme-danger-armed');
            resetBtn.find('.sme-btn-label').text('Нажмите ещё раз для сброса');

            resetTimer = setTimeout(function () {
                resetArmed = false;
                resetBtn.removeClass('sme-danger-armed');
                resetBtn.find('.sme-btn-label').text('Сбросить настройки меню');
            }, 4000);
        });

        var doneBtn = $(
            '<div class="selector sme-footer-btn sme-done" tabindex="0">' +
                '<span class="sme-btn-label">Готово</span>' +
            '</div>'
        );

        bindControl(doneBtn, function () {
            closeToSettings();
        });

        wrap.append(resetBtn);
        wrap.append(doneBtn);

        updateArrowStates(list);

        return {
            html: wrap,
            select: focusTarget
        };
    }

    function openEditor(focusKey, focusType) {
        if (!runtime.container || !document.body.contains(runtime.container)) {
            var tries = 0;

            (function attempt() {
                if (runtime.container && document.body.contains(runtime.container)) {
                    openEditor(focusKey, focusType);
                    return;
                }

                if (tries++ >= 1) {
                    try {
                        if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Откройте настройки и повторите');
                    } catch (e) {}
                    return;
                }

                try {
                    if (window.Lampa && Lampa.Controller) Lampa.Controller.toggle('settings');
                } catch (e) {}

                setTimeout(attempt, 450);
            })();

            return;
        }

        var built = buildEditor(focusKey, focusType);

        closeModal();

        setTimeout(function () {
            openModal({
                title: 'Меню настроек',
                html: built.html,
                size: 'medium',
                scroll_to_center: false,
                select: built.select || undefined,
                onBack: closeToSettings
            });
        }, 40);
    }

    function chooseIcon(key, svg) {
        if (svg === null) {
            delete state.icons[key];
        } else {
            var clean = sanitizeSvg(svg);

            if (!clean) {
                try {
                    if (window.Lampa && Lampa.Noty) Lampa.Noty.show('Не удалось применить иконку');
                } catch (e) {}
                return;
            }

            state.icons[key] = clean;
        }

        saveState();

        if (runtime.container) applyTo(runtime.container);

        closeModal();

        setTimeout(function () {
            openEditor(key, 'icon');
        }, 150);
    }

    function buildIconPicker(key) {
        var item = runtime.items[key];
        var wrap = $('<div class="sme-icons"></div>');
        var hint = $('<div class="sme-hint"></div>');
        var defaultBtn = $(
            '<div class="selector sme-icon-default" tabindex="0">' +
                '<span class="sme-icon-default__preview"></span>' +
                '<span class="sme-btn-label">По умолчанию</span>' +
            '</div>'
        );
        var status = $('<div class="sme-status"></div>');
        var grid = $('<div class="sme-icon-grid"></div>');
        var footer = $('<div class="sme-icons-footer"></div>');
        var refreshBtn = $(
            '<div class="selector sme-footer-btn" tabindex="0">' +
                '<span class="sme-btn-label">Обновить иконки</span>' +
            '</div>'
        );

        hint.text('Иконка для «' + currentLabel(item) + '». Изменения применяются сразу.');
        wrap.append(hint);

        defaultBtn.find('.sme-icon-default__preview').html(item.originalIcon || PLACEHOLDER_ICON);
        wrap.append(defaultBtn);
        wrap.append(status);
        wrap.append(grid);
        footer.append(refreshBtn);
        wrap.append(footer);

        var bindings = [];

        function addBinding(el, handler) {
            bindings.push({ el: el, handler: handler });
            bindControl(el, handler);
        }

        function rebind() {
            for (var i = 0; i < bindings.length; i++) {
                bindControl(bindings[i].el, bindings[i].handler);
            }
        }

        addBinding(defaultBtn, function () {
            chooseIcon(key, null);
        });

        var refreshing = false;
        var refreshHandler = function () {
            if (iconLib.loading || refreshing) return;

            refreshing = true;
            refreshBtn.find('.sme-btn-label').text('Обновление…');
            status.text('Загрузка иконок с сайта…');

            loadIcons(true, function () {
                refreshing = false;

                if (!isNodeAttached(wrap[0])) return;

                render();

                try {
                    Lampa.Modal.update(wrap);
                } catch (e) {
                    log('update icon modal', e);
                }

                rebind();
            });
        };

        addBinding(refreshBtn, refreshHandler);

        function render() {
            var custom = state.icons[key] || '';
            var customKey = custom ? svgKey(custom) : '';
            var cleanBindings = [];

            for (var b = 0; b < bindings.length; b++) {
                if (!$(bindings[b].el).hasClass('sme-icon-cell')) {
                    cleanBindings.push(bindings[b]);
                }
            }

            bindings = cleanBindings;

            defaultBtn.toggleClass('sme-selected', !custom);

            grid.empty();

            if (iconLib.loading) {
                status.text('Загрузка иконок…');
                refreshBtn.find('.sme-btn-label').text('Обновить иконки');
                return;
            }

            if (!iconLib.icons.length) {
                status.text(iconLib.error || (iconLib.loaded ? 'Иконки не загружены' : 'Загрузка иконок…'));
                refreshBtn.find('.sme-btn-label').text('Повторить');
                return;
            }

            status.text((iconLib.error ? iconLib.error + ' · ' : '') + 'Иконок: ' + iconLib.icons.length);
            refreshBtn.find('.sme-btn-label').text('Обновить иконки');

            for (var i = 0; i < iconLib.icons.length; i++) {
                (function (svg) {
                    var cell = $('<div class="selector sme-icon-cell" tabindex="0"></div>');

                    cell.html(svg);

                    if (customKey && svgKey(svg) === customKey) {
                        cell.addClass('sme-selected');
                    }

                    addBinding(cell, function () {
                        chooseIcon(key, svg);
                    });

                    grid.append(cell);
                })(iconLib.icons[i]);
            }
        }

        render();

        return {
            html: wrap,
            render: render,
            rebind: rebind
        };
    }

    function openIconPicker(key) {
        var item = runtime.items[key];

        if (!item) return;

        closeModal();

        setTimeout(function () {
            var built = buildIconPicker(key);

            openModal({
                title: 'Иконка пункта',
                html: built.html,
                size: 'medium',
                scroll_to_center: false,
                onBack: function () {
                    closeModal();

                    setTimeout(function () {
                        openEditor(key, 'icon');
                    }, 140);
                }
            });

            if (!iconLib.loaded) {
                loadIcons(false, function () {
                    if (!isNodeAttached(built.html[0])) return;

                    built.render();

                    try {
                        Lampa.Modal.update(built.html);
                    } catch (e) {
                        log('update icon modal', e);
                    }

                    built.rebind();
                });
            }
        }, 140);
    }

    function exposeApi() {
        window.settingsMenuEditor = {
            version: VERSION,
            iconsUrl: ICONS_URL,
            open: function () {
                openEditor(null, null);
            },
            reset: function () {
                resetAll(false);
            },
            getConfig: function () {
                return cloneState();
            },
            setConfig: function (config) {
                state = normalizeState(config);
                saveState();

                if (runtime.container) {
                    applyTo(runtime.container);
                }

                refreshSettingsCollection();

                return cloneState();
            }
        };
    }

    function injectStyles() {
        if (document.getElementById('settings-menu-editor-style')) return;

        var css = [
            '.settings-folder.sme-entry{padding:1em 2em;opacity:.72}',
            '.settings-folder.sme-entry.focus{opacity:1;background-color:#353535}',
            '.settings-folder.sme-entry .settings-folder__icon{width:1.7em;height:1.7em;margin-right:1.1em}',
            '.settings-folder.sme-entry .settings-folder__icon > *{width:1.7em;height:1.7em}',
            '.settings-folder.sme-entry .settings-folder__name{font-size:1.2em;opacity:.9}',
            '.sme-editor,.sme-icons{color:#fff;font-family:inherit;font-size:inherit;width:100%;box-sizing:border-box}',
            '.sme-hint{opacity:.68;font-size:.92em;line-height:1.35;margin:0 0 .8em 0}',
            '.sme-list{display:flex;flex-direction:column}',
            '.sme-row{display:flex;align-items:center;padding:.55em .65em;margin:0 0 .55em 0;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);box-sizing:border-box}',
            '.sme-row:last-child{margin-bottom:0}',
            '.sme-row > *{margin-right:.35em}',
            '.sme-row > *:last-child{margin-right:0}',
            '.sme-row--hidden{opacity:.48}',
            '.sme-btn,.sme-name{height:2.5em;border-radius:.55em;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);box-sizing:border-box;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none}',
            '.sme-btn{flex:0 0 2.2em;width:2.2em;min-width:2.2em}',
            '.sme-icon{flex:0 0 2.6em;width:2.6em;min-width:2.6em}',
            '.sme-name{flex:1 1 auto;padding:0 .65em;justify-content:space-between;min-width:0}',
            '.sme-name-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:inherit;font-size:inherit}',
            '.sme-pencil{opacity:.45;flex-shrink:0;display:flex;align-items:center;margin-left:.5em}',
            '.sme-pencil svg{width:1em;height:1em;display:block}',
            '.sme-btn svg,.sme-icon svg,.sme-icon img{width:1.35em;height:1.35em;display:block}',
            '.sme-btn.focus,.sme-name.focus{border-color:#fff!important;background:rgba(255,255,255,.16)!important}',
            '.sme-disabled{opacity:.35}',
            '.sme-empty{opacity:.7;padding:.8em 0}',
            '.sme-footer-btn{height:3.1em;margin-top:.7em;border-radius:.7em;display:flex;align-items:center;justify-content:center;box-sizing:border-box;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);cursor:pointer;user-select:none;font-family:inherit;font-size:inherit}',
            '.sme-footer-btn.focus{border-color:#fff!important;background:rgba(255,255,255,.16)!important}',
            '.sme-done{background:rgba(66,133,244,.55)}',
            '.sme-danger{background:rgba(190,70,60,.5)}',
            '.sme-danger-armed{background:rgba(220,60,50,.78)}',
            '.sme-icons-footer{display:flex;flex-direction:column}',
            '.sme-status{opacity:.68;font-size:.9em;min-height:1.3em;margin:.2em 0 .5em 0}',
            '.sme-icon-grid{display:flex;flex-wrap:wrap;margin:0 -.225em}',
            '.sme-icon-cell{flex:1 1 3.3em;max-width:4.6em;height:3.3em;margin:.225em;border-radius:.55em;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;box-sizing:border-box;cursor:pointer;user-select:none}',
            '.sme-icon-cell svg{width:1.7em;height:1.7em;display:block}',
            '.sme-icon-cell.focus{border-color:#fff!important;background:rgba(255,255,255,.16)!important}',
            '.sme-icon-cell.sme-selected,.sme-icon-default.sme-selected{border-color:#2fd6ea!important;box-shadow:inset 0 0 0 1px #2fd6ea}',
            '.sme-icon-default{display:flex;align-items:center;padding:0 .9em;height:3.2em;border-radius:.7em;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);box-sizing:border-box;cursor:pointer;user-select:none;margin-bottom:.15em}',
            '.sme-icon-default.focus{border-color:#fff!important;background:rgba(255,255,255,.14)!important}',
            '.sme-icon-default__preview{width:2.2em;height:2.2em;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:.7em}',
            '.sme-icon-default__preview svg,.sme-icon-default__preview img{width:1.5em;height:1.5em;display:block}',
            '@media (max-width:767px){' +
                '.sme-btn{flex-basis:2em;width:2em;min-width:2em}' +
                '.sme-icon{flex-basis:2.4em;width:2.4em;min-width:2.4em}' +
            '}'
        ].join('');

        var style = document.createElement('style');

        style.id = 'settings-menu-editor-style';
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        (document.head || document.body).appendChild(style);
    }

    function start() {
        if (started) return true;

        if (!window.Lampa || !Lampa.Settings || !Lampa.Settings.listener) {
            return false;
        }

        started = true;

        injectStyles();
        loadState();
        installMainUpdateHook();
        exposeApi();

        if (!mainHookInstalled && !mainHookTimer) {
            var hookTries = 0;

            mainHookTimer = setInterval(function () {
                hookTries++;

                if (installMainUpdateHook() || hookTries > 100) {
                    clearInterval(mainHookTimer);
                    mainHookTimer = null;
                }
            }, 300);
        }

        try {
            Lampa.Settings.listener.follow('open', onSettingsOpen);
        } catch (e) {
            log('settings listener', e);
        }

        return true;
    }

    function boot() {
        if (start()) return;

        if (!bootListening && window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            bootListening = true;

            try {
                Lampa.Listener.follow('app', function (e) {
                    if (e && e.type === 'ready') start();
                });
            } catch (e) {}
        }

        if (!bootTimer) {
            var tries = 0;

            bootTimer = setInterval(function () {
                tries++;

                if (start() || tries > 150) {
                    clearInterval(bootTimer);
                    bootTimer = null;
                }
            }, 400);
        }
    }

    boot();
})();
