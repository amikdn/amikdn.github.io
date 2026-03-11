/**
 * Плагин Lampa: Скрытие элементов в шапке (head__actions)
 * Динамически сканирует кнопки в шапке и добавляет переключатели через официальный API настроек.
 */
(function () {
    'use strict';

    var PLUGIN_NAME = 'head_actions_hide';
    var STORAGE_PREFIX = 'head_actions_hide_';
    var DISCOVERED_KEY = STORAGE_PREFIX + 'discovered';

    var SKIP_CLASSES = { 'head__action': 1, 'selector': 1, 'active': 1 };

    var KNOWN_LABELS = {
        'open--search': { ru: 'Поиск', en: 'Search', uk: 'Пошук' },
        'open--broadcast': { ru: 'Трансляция', en: 'Broadcast', uk: 'Трансляція' },
        'notice--icon': { ru: 'Уведомления', en: 'Notifications', uk: 'Сповіщення' },
        'open--settings': { ru: 'Настройки', en: 'Settings', uk: 'Налаштування' },
        'open--profile': { ru: 'Профиль', en: 'Profile', uk: 'Профіль' },
        'full--screen': { ru: 'Полный экран', en: 'Fullscreen', uk: 'Повний екран' }
    };

    function formatLabel(actionClass) {
        if (KNOWN_LABELS[actionClass]) {
            var lang = (Lampa.Lang && Lampa.Lang.current) ? Lampa.Lang.current() : 'ru';
            return KNOWN_LABELS[actionClass][lang] || KNOWN_LABELS[actionClass].ru || actionClass;
        }
        return actionClass.replace(/--/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function scanActionClasses() {
        var container = document.querySelector('.head__actions');
        if (!container) return [];
        var seen = {};
        var list = [];
        var nodes = container.querySelectorAll('.head__action');
        nodes.forEach(function (el) {
            var classes = el.classList;
            for (var i = 0; i < classes.length; i++) {
                var c = classes[i];
                if (!SKIP_CLASSES[c] && !seen[c]) { seen[c] = true; list.push(c); }
            }
        });
        return list;
    }

    function getDiscoveredList() {
        try {
            var raw = Lampa.Storage.get(DISCOVERED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function saveDiscoveredList(arr) {
        Lampa.Storage.set(DISCOVERED_KEY, JSON.stringify(arr));
    }

    function getHiddenList() {
        var discovered = getDiscoveredList();
        var list = [];
        discovered.forEach(function (key) {
            var val = Lampa.Storage.field(STORAGE_PREFIX + key);
            if (val === 'true' || val === true) list.push(key);
        });
        return list;
    }

    function applyVisibility() {
        var hidden = getHiddenList();
        if (hidden.length === 0) return;
        var container = document.querySelector('.head__actions');
        if (!container) return;
        var actions = container.querySelectorAll('.head__action');
        actions.forEach(function (el) {
            var hide = false;
            hidden.forEach(function (cls) {
                if (el.classList.contains(cls)) hide = true;
            });
            el.style.display = hide ? 'none' : '';
        });
    }

    function injectStyle() {
        var hidden = getHiddenList();
        if (hidden.length === 0) return;
        var id = 'head_actions_hide_style';
        var style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }
        var rules = hidden.map(function (cls) {
            return '.head__actions .head__action.' + cls + ' { display: none !important; }';
        });
        style.textContent = rules.join('\n');
    }

    function run() {
        injectStyle();
        applyVisibility();
    }

    var titleAdded = false;
    var addedParams = {};

    function ensureParamsForDiscovered() {
        var current = scanActionClasses();
        var discovered = getDiscoveredList();
        if (current.length > 0) {
            var added = false;
            current.forEach(function (actionClass) {
                if (discovered.indexOf(actionClass) === -1) {
                    discovered.push(actionClass);
                    added = true;
                }
            });
            if (added) saveDiscoveredList(discovered);
        } else if (discovered.length === 0) {
            discovered = Object.keys(KNOWN_LABELS);
            saveDiscoveredList(discovered);
        }

        if (!titleAdded) {
            titleAdded = true;
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: { name: 'head_actions_hide_title', type: 'title' },
                field: { name: 'Скрыть кнопки в шапке' }
            });
        }

        discovered.forEach(function (actionClass) {
            if (addedParams[actionClass]) return;
            addedParams[actionClass] = true;
            var paramName = STORAGE_PREFIX + actionClass;
            Lampa.SettingsApi.addParam({
                component: 'interface',
                param: {
                    name: paramName,
                    type: 'trigger',
                    'default': false
                },
                field: { name: formatLabel(actionClass) },
                onChange: function () { run(); }
            });
        });
    }

    function moveOurBlockToTop(e) {
        if (e.name !== 'interface') return;
        var body = e.body;
        if (!body || !body.find) return;
        var our = body.find('[data-name^="head_actions_hide"]');
        if (our.length === 0) return;
        var firstItem = body.find('.selector__item').first();
        if (firstItem.length === 0) return;
        our.detach();
        var arr = our.toArray();
        for (var i = arr.length - 1; i >= 0; i--) {
            firstItem.before(arr[i]);
        }
    }

    function startPlugin() {
        if (window[PLUGIN_NAME + '_loaded']) return;
        window[PLUGIN_NAME + '_loaded'] = true;

        getDiscoveredList().forEach(function (c) { addedParams[c] = true; });
        ensureParamsForDiscovered();
        run();

        var layerUpdate = Lampa.Layer.update;
        if (layerUpdate) {
            Lampa.Layer.update = function (where) {
                layerUpdate.apply(this, arguments);
                setTimeout(function () {
                    ensureParamsForDiscovered();
                    run();
                }, 50);
            };
        }

        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'interface') {
                ensureParamsForDiscovered();
                setTimeout(function () { moveOurBlockToTop(e); }, 50);
            }
        });

        var observer = new MutationObserver(function () {
            if (document.querySelector('.head__actions')) {
                ensureParamsForDiscovered();
                run();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(function () { ensureParamsForDiscovered(); run(); }, 300);
        setTimeout(function () { ensureParamsForDiscovered(); run(); }, 1500);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
