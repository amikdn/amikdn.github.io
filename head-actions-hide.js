/**
 * Плагин Lampa: Скрытие элементов в шапке (head__actions)
 * Динамически сканирует, какие кнопки есть в шапке, и позволяет скрывать выбранные.
 */
(function () {
    'use strict';

    var PLUGIN_NAME = 'head_actions_hide';
    var STORAGE_PREFIX = 'head_actions_hide_';
    var DISCOVERED_KEY = STORAGE_PREFIX + 'discovered';

    // Служебные классы, которые не считаем идентификатором кнопки
    var SKIP_CLASSES = { 'head__action': 1, 'selector': 1, 'active': 1 };

    // Подписи для известных классов (остальные форматируются из имени класса)
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
                if (!SKIP_CLASSES[c] && !seen[c]) {
                    seen[c] = true;
                    list.push(c);
                }
            }
        });
        return list;
    }

    function getDiscoveredList() {
        try {
            var raw = Lampa.Storage.get(DISCOVERED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveDiscoveredList(arr) {
        Lampa.Storage.set(DISCOVERED_KEY, JSON.stringify(arr));
    }

    function getHiddenList() {
        var discovered = getDiscoveredList();
        var list = [];
        discovered.forEach(function (key) {
            if (Lampa.Storage.field(STORAGE_PREFIX + key)) list.push(key);
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
    }

    function buildSettingsBlock() {
        ensureParamsForDiscovered();
        var discovered = getDiscoveredList();
        var wrap = document.createElement('div');
        wrap.className = 'head-actions-hide-settings';
        wrap.style.marginBottom = '1.5rem';

        var title = document.createElement('div');
        title.className = 'selector__title';
        title.style.cssText = 'padding: 0.5rem 0; font-weight: bold;';
        title.textContent = 'Скрыть кнопки в шапке';
        wrap.appendChild(title);

        var hint = document.createElement('div');
        hint.style.cssText = 'font-size: 0.9em; opacity: 0.8; margin-bottom: 0.5rem;';
        hint.textContent = 'Отметьте, какие кнопки в верхней панели скрыть:';
        wrap.appendChild(hint);

        discovered.forEach(function (actionClass) {
            var row = document.createElement('label');
            row.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; cursor: pointer;';
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.dataset.action = actionClass;
            input.checked = !!Lampa.Storage.field(STORAGE_PREFIX + actionClass);
            input.addEventListener('change', function () {
                Lampa.Storage.set(STORAGE_PREFIX + actionClass, input.checked ? '1' : '');
                run();
            });
            var span = document.createElement('span');
            span.textContent = formatLabel(actionClass);
            row.appendChild(input);
            row.appendChild(span);
            wrap.appendChild(row);
        });

        if (discovered.length === 0) {
            var empty = document.createElement('div');
            empty.style.cssText = 'opacity: 0.8; padding: 0.5rem 0;';
            empty.textContent = 'Кнопки пока не найдены. Зайдите на главный экран и снова откройте настройки.';
            wrap.appendChild(empty);
        }
        return wrap;
    }

    function injectSettingsBlock(e) {
        if (e.name !== 'interface') return;
        var container = e.body && (e.body.jquery ? e.body[0] : e.body);
        if (!container) return;
        var existing = container.querySelector('.head-actions-hide-settings');
        if (existing) existing.remove();
        var block = buildSettingsBlock();
        container.insertBefore(block, container.firstChild);
    }

    function startPlugin() {
        if (window[PLUGIN_NAME + '_loaded']) return;
        window[PLUGIN_NAME + '_loaded'] = true;

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
                setTimeout(function () { injectSettingsBlock(e); }, 0);
            }
        });

        var observer = new MutationObserver(function () {
            if (document.querySelector('.head__actions')) {
                ensureParamsForDiscovered();
                run();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(function () {
            ensureParamsForDiscovered();
            run();
        }, 300);
        setTimeout(function () {
            ensureParamsForDiscovered();
            run();
        }, 1500);
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
