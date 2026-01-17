(function() {
    'use strict';
    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';
    var EXCLUDED_CLASSES = ['button--edit-order']; // Убираем button--play, чтобы она обрабатывалась
    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'], label: 'Онлайн' },
        { name: 'torrent', patterns: ['torrent'], label: 'Торренты' },
        { name: 'trailer', patterns: ['trailer', 'rutube'], label: 'Трейлеры' },
        { name: 'favorite', patterns: ['favorite'], label: 'Избранное' },
        { name: 'subscribe', patterns: ['subscribe'], label: 'Подписка' },
        { name: 'book', patterns: ['book'], label: 'Закладки' },
        { name: 'reaction', patterns: ['reaction'], label: 'Реакции' }
    ];
    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    function findButton(btnId) {
        var btn = allButtonsOriginal.find(function(b) { return getButtonId(b) === btnId; });
        if (!btn) {
            btn = allButtonsCache.find(function(b) { return getButtonId(b) === btnId; });
        }
        return btn;
    }

    function getCustomOrder() {
        return Lampa.Storage.get('button_custom_order', []);
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order);
    }

    function getHiddenButtons() {
        return Lampa.Storage.get('button_hidden', []);
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set('button_hidden', hidden);
    }

    function getButtonId(button) {
        var classes = button.attr('class') || '';
        var text = button.find('span').text().trim().replace(/\s+/g, '_');
        var subtitle = button.attr('data-subtitle') || '';
        if (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1 || text.indexOf('MOD') !== -1) {
            return 'modss_online_button';
        }
        if (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1) {
            return 'showy_online_button';
        }
        var viewClasses = classes.split(' ').filter(function(c) { return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; }).join('_');
        if (!viewClasses && !text) {
            return 'button_unknown';
        }
        var id = viewClasses + '_' + text;
        if (subtitle) {
            id = id + '_' + subtitle.replace(/\s+/g, '_').substring(0, 30);
        }
        return id;
    }

    function getButtonType(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < DEFAULT_GROUPS.length; i++) {
            var group = DEFAULT_GROUPS[i];
            for (var j = 0; j < group.patterns.length; j++) {
                if (classes.indexOf(group.patterns[j]) !== -1) {
                    return group.name;
                }
            }
        }
        return 'other';
    }

    function isExcluded(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < EXCLUDED_CLASSES.length; i++) {
            if (classes.indexOf(EXCLUDED_CLASSES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function categorizeButtons(container) {
        // Собираем ВСЕ кнопки, включая "Смотреть" - как в interface_mod.js
        var allButtons = container.find('.full-start__button').not('.button--edit-order');
        var categories = { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], play: [], other: [] };
        allButtons.each(function() {
            var $btn = $(this);
            
            // Проверяем, является ли это кнопкой "Смотреть" ПЕРЕД isExcluded
            var classes = $btn.attr('class') || '';
            if (classes.indexOf('button--play') !== -1) {
                categories.play.push($btn);
                return;
            }
            
            // Исключаем только карандаш (button--edit-order), кнопку "Смотреть" уже обработали
            if (isExcluded($btn)) return;
            
            var type = getButtonType($btn);
            if (type === 'online' && $btn.hasClass('lampac--button') && !$btn.hasClass('modss--button') && !$btn.hasClass('showy--button')) {
                var svgElement = $btn.find('svg').first();
                if (svgElement.length && !svgElement.hasClass('modss-online-icon')) {
                    svgElement.replaceWith(LAMPAC_ICON);
                }
            }
            if (categories[type]) {
                categories[type].push($btn);
            } else {
                categories.other.push($btn);
            }
        });
        return categories;
    }

    function sortByCustomOrder(buttons) {
        var customOrder = getCustomOrder();
        var priority = [];
        var regular = [];
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            if (id === 'modss_online_button' || id === 'showy_online_button') {
                priority.push(btn);
            } else {
                regular.push(btn);
            }
        });
        priority.sort(function(a, b) {
            var idA = getButtonId(a);
            var idB = getButtonId(b);
            if (idA === 'modss_online_button') return -1;
            if (idB === 'modss_online_button') return 1;
            if (idA === 'showy_online_button') return -1;
            if (idB === 'showy_online_button') return 1;
            return 0;
        });
        if (!customOrder.length) {
            regular.sort(function(a, b) {
                var typeOrder = ['online', 'torrent', 'trailer', 'favorite', 'subscribe', 'book', 'reaction', 'other'];
                var typeA = getButtonType(a);
                var typeB = getButtonType(b);
                var indexA = typeOrder.indexOf(typeA);
                var indexB = typeOrder.indexOf(typeB);
                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;
                return indexA - indexB;
            });
            return priority.concat(regular);
        }
        var sorted = [];
        var remaining = regular.slice();
        customOrder.forEach(function(id) {
            for (var i = 0; i < remaining.length; i++) {
                if (getButtonId(remaining[i]) === id) {
                    sorted.push(remaining[i]);
                    remaining.splice(i, 1);
                    break;
                }
            }
        });
        return priority.concat(sorted).concat(remaining);
    }

    function getDefaultVisibleButtonClasses() {
        // Стандартные кнопки, которые должны быть видны по умолчанию (включая "Смотреть")
        return ['button--play', 'button--book', 'button--reaction', 'button--options'];
    }

    function applyHiddenButtons(buttons) {
        var hidden = getHiddenButtons();
        var showAllButtons = Lampa.Storage.get('show_all_buttons_enabled', false);
        var defaultVisibleClasses = getDefaultVisibleButtonClasses();
        
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            var classes = btn.attr('class') || '';
            var isInHiddenList = hidden.indexOf(id) !== -1;
            
            // Определяем, является ли кнопка стандартной видимой
            var isDefaultVisible = false;
            for (var i = 0; i < defaultVisibleClasses.length; i++) {
                if (classes.indexOf(defaultVisibleClasses[i]) !== -1) {
                    isDefaultVisible = true;
                    break;
                }
            }
            
            if (showAllButtons) {
                // Если настройка включена - показываем ВСЕ кнопки (убираем все классы скрытия)
                btn.removeClass('hidden').removeClass('hide');
            } else {
                // Если настройка выключена - показываем только стандартные кнопки
                // Исключение: если кнопка в списке скрытых редактора - скрываем её
                if (isInHiddenList) {
                    // Кнопка явно скрыта через редактор
                    btn.addClass('hidden');
                } else if (isDefaultVisible) {
                    // Стандартная кнопка - показываем
                    btn.removeClass('hidden').removeClass('hide');
                } else {
                    // Нестандартная кнопка - скрываем
                    btn.addClass('hidden');
                }
            }
        });
    }

    function applyButtonAnimation(buttons) {
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': 'button-fade-in 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
        });
    }

    function createEditButton() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');
        btn.on('hover:enter', function() {
            openEditDialog();
        });
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        }
        return btn;
    }

    function saveOrder() {
        var order = [];
        currentButtons.forEach(function(btn) {
            order.push(getButtonId(btn));
        });
        setCustomOrder(order);
    }

    function applyChanges() {
        if (!currentContainer) return;
        var showAllButtons = Lampa.Storage.get('show_all_buttons_enabled', false);
        var categories = categorizeButtons(currentContainer);
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.favorite)
            .concat(categories.subscribe)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.other);
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        currentButtons = allButtons;
        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;
        // Сохраняем кнопку "Смотреть"
        var playButton = targetContainer.find('.button--play');
        targetContainer.find('.full-start__button').not('.button--edit-order, .button--play').detach();
        var visibleButtons = [];
        
        // Применяем логику скрытия/показа
        applyHiddenButtons(currentButtons);
        
        currentButtons.forEach(function(btn) {
            // Если настройка включена - убираем класс hide
            if (showAllButtons) {
                btn.removeClass('hide');
            }
            targetContainer.append(btn);
            if (!btn.hasClass('hidden')) visibleButtons.push(btn);
        });
        applyButtonAnimation(visibleButtons);
        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }
        // Кнопка "Смотреть" должна оставаться на месте
        if (playButton.length) {
            playButton.detach();
            targetContainer.prepend(playButton);
        }
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        saveOrder();
        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
        }, 100);
    }

    function capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getButtonDisplayName(btn, allButtons) {
        var text = btn.find('span').text().trim();
        var classes = btn.attr('class') || '';
        var subtitle = btn.attr('data-subtitle') || '';
        if (!text) {
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; });
            if (viewClass) {
                text = viewClass.replace('view--', '').replace('button--', '').replace(/_/g, ' ');
                text = capitalize(text);
            } else {
                text = 'Кнопка';
            }
            return text;
        }
        var sameTextCount = 0;
        allButtons.forEach(function(otherBtn) {
            if (otherBtn.find('span').text().trim() === text) {
                sameTextCount++;
            }
        });
        if (sameTextCount > 1) {
            if (subtitle) {
                return text + ' <span style="opacity:0.5">(' + subtitle.substring(0, 30) + ')</span>';
            }
            var viewClass = classes.split(' ').find(function(c) { return c.indexOf('view--') === 0; });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalize(identifier);
                return text + ' <span style="opacity:0.5">(' + identifier + ')</span>';
            }
        }
        return text;
    }

    function openEditDialog() {
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allButtons = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);
            allButtons = sortByCustomOrder(allButtons);
            allButtonsCache = allButtons;
            currentButtons = allButtons;
        }
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var modes = ['default', 'icons', 'always'];
        var labels = {default: 'Стандартный', icons: 'Только иконки', always: 'С текстом'};
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');
        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div style="text-align: center; padding: 1em;">Вид кнопок: ' + labels[currentMode] + '</div>' +
            '</div>');
        modeBtn.on('hover:enter', function() {
            var idx = modes.indexOf(currentMode);
            idx = (idx + 1) % modes.length;
            currentMode = modes[idx];
            Lampa.Storage.set('buttons_viewmode', currentMode);
            $(this).find('div').text('Вид кнопок: ' + labels[currentMode]);
            if (currentContainer) {
                var target = currentContainer.find('.full-start-new__buttons');
                target.removeClass('icons-only always-text');
                if (currentMode === 'icons') target.addClass('icons-only');
                if (currentMode === 'always') target.addClass('always-text');
            }
        });
        list.append(modeBtn);

        function createButtonItem(btn) {
            var displayName = getButtonDisplayName(btn, currentButtons);
            var icon = btn.find('svg').clone();
            var btnId = getButtonId(btn);
            var isHidden = hidden.indexOf(btnId) !== -1;
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__move move-up selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-down selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__toggle toggle selector">' +
                '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/>' +
                '</svg>' +
                '</div>' +
                '</div>');
            item.toggleClass('menu-edit-list__item-hidden', isHidden);
            item.find('.menu-edit-list__icon').append(icon);
            item.data('button', btn);
            item.data('buttonId', btnId);
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && prev.hasClass('viewmode-switch')) {
                    prev = prev.prev();
                }
                if (prev.length && !prev.hasClass('viewmode-switch')) {
                    item.insertBefore(prev);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex > 0) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex - 1, 0, btn);
                    }
                    saveOrder();
                }
            });
            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && next.hasClass('folder-reset-button')) {
                    next = next.next();
                }
                if (next.length && !next.hasClass('folder-reset-button')) {
                    item.insertAfter(next);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex < currentButtons.length - 1) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex + 1, 0, btn);
                    }
                    saveOrder();
                }
            });
            item.find('.toggle').on('hover:enter', function() {
                var isNowHidden = !item.hasClass('menu-edit-list__item-hidden');
                item.toggleClass('menu-edit-list__item-hidden', isNowHidden);
                btn.toggleClass('hidden', isNowHidden);
                item.find('.dot').attr('opacity', isNowHidden ? '0' : '1');
                var hiddenList = getHiddenButtons();
                var index = hiddenList.indexOf(btnId);
                if (isNowHidden && index === -1) {
                    hiddenList.push(btnId);
                } else if (!isNowHidden && index !== -1) {
                    hiddenList.splice(index, 1);
                }
                setHiddenButtons(hiddenList);
            });
            return item;
        }

        currentButtons.forEach(function(btn) {
            list.append(createButtonItem(btn));
        });

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">Сбросить по умолчанию</div>' +
            '</div>');
        resetBtn.on('hover:enter', function() {
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('buttons_viewmode', 'default');
            Lampa.Modal.close();
            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order').remove();
                    currentContainer.data('buttons-processed', false);
                    var targetContainer = currentContainer.find('.full-start-new__buttons');
                    var existingButtons = targetContainer.find('.full-start__button').toArray();
                    allButtonsOriginal.forEach(function(originalBtn) {
                        var btnId = getButtonId(originalBtn);
                        var exists = false;
                        for (var i = 0; i < existingButtons.length; i++) {
                            if (getButtonId($(existingButtons[i])) === btnId) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            var clonedBtn = originalBtn.clone(true, true);
                            clonedBtn.css({ 'opacity': '1', 'animation': 'none' });
                            targetContainer.append(clonedBtn);
                        }
                    });
                    reorderButtons(currentContainer);
                    refreshController();
                }
            }, 100);
        });
        list.append(resetBtn);

        Lampa.Modal.open({
            title: 'Порядок кнопок',
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                applyChanges();
                Lampa.Controller.toggle('full_start');
            }
        });
    }

    function reorderButtons(container) {
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;
        currentContainer = container;
        var showAllButtons = Lampa.Storage.get('show_all_buttons_enabled', false);
        
        var categories = categorizeButtons(container);
        // Кнопка "Смотреть" должна быть первой - как в interface_mod.js
        var allButtons = []
            .concat(categories.play)  // Кнопка "Смотреть" первой
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.favorite)
            .concat(categories.subscribe)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.other);
        allButtons = sortByCustomOrder(allButtons);
        allButtonsCache = allButtons;
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }
        currentButtons = allButtons;
        
        // Удаляем только кнопку редактирования (карандаш) - как в interface_mod.js
        container.find('.button--edit-order').remove();
        
        // Удаляем ВСЕ дочерние элементы контейнера (как в interface_mod.js cont.children().detach())
        // Кнопка "Смотреть" будет добавлена обратно вместе с остальными
        targetContainer.children().detach();
        
        // Применяем логику скрытия/показа до добавления в контейнер
        applyHiddenButtons(currentButtons);
        
        var visibleButtons = [];
        currentButtons.forEach(function(btn) {
            // Добавляем кнопку в контейнер
            targetContainer.append(btn);
            // Проверяем видимость кнопки (не должна быть hidden)
            // Класс hide обрабатывается через CSS, но при включенной настройке убираем его
            if (!btn.hasClass('hidden')) {
                visibleButtons.push(btn);
            }
        });
        
        var editButton = createEditButton();
        targetContainer.append(editButton);
        visibleButtons.push(editButton);
        
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        applyButtonAnimation(visibleButtons);
        setTimeout(function() {
            setupButtonNavigation(container);
        }, 100);
        return true;
    }

    function setupButtonNavigation(container) {
        if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
            try {
                Lampa.Controller.toggle('full_start');
            } catch(e) {}
        }
    }

    function refreshController() {
        if (!Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;
        setTimeout(function() {
            try {
                Lampa.Controller.toggle('full_start');
                if (currentContainer) {
                    setTimeout(function() {
                        setupButtonNavigation(currentContainer);
                    }, 100);
                }
            } catch(e) {}
        }, 50);
    }

    function init() {
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.full-start__button.hide { display: none !important; }' +
            '.full-start-new__buttons { ' +
            'display: flex !important; ' +
            'flex-direction: row !important; ' +
            'flex-wrap: wrap !important; ' +
            'gap: 0.5em !important; ' +
            '}' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.folder-reset-button { background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-reset-button.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__toggle.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { background: rgba(100,100,255,0.3); margin: 0.5em 0 1em 0; border-radius: 0.3em; }' +
            '.viewmode-switch.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.5; }' +
            '</style>');
        $('body').append(style);

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;
            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }
            // Увеличиваем задержку, чтобы кнопка "Смотреть" успела создаться системой
            setTimeout(function() {
                try {
                    if (!container.data('buttons-processed')) {
                        // Проверяем наличие кнопки "Смотреть" перед обработкой
                        var playButton = targetContainer.find('.button--play').first();
                        if (!playButton.length) {
                            // Если кнопки нет, ждём ещё немного
                            setTimeout(function() {
                                container.data('buttons-processed', true);
                                if (reorderButtons(container)) {
                                    if (targetContainer.length) {
                                        targetContainer.removeClass('buttons-loading');
                                    }
                                    refreshController();
                                }
                            }, 200);
                        } else {
                            container.data('buttons-processed', true);
                            if (reorderButtons(container)) {
                                if (targetContainer.length) {
                                    targetContainer.removeClass('buttons-loading');
                                }
                                refreshController();
                            }
                        }
                    }
                } catch(err) {
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, 500);
        });
    }

    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'buttons_editor_enabled', type: 'trigger', default: true },
            field: { name: 'Редактор кнопок' },
            onChange: function(value) {
                setTimeout(function() {
                    var currentValue = Lampa.Storage.get('buttons_editor_enabled', true);
                    if (currentValue) {
                        $('.button--edit-order').show();
                    } else {
                        $('.button--edit-order').hide();
                    }
                }, 100);
            },
            onRender: function(element) {
                setTimeout(function() {
                    $('div[data-name="interface_size"]').after(element);
                }, 0);
            }
        });

        // Настройка "Отображать все кнопки"
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: { name: 'show_all_buttons_enabled', type: 'trigger', default: false },
            field: { name: 'Отображать все кнопки', description: 'Показывать все кнопки, включая скрытые по умолчанию' },
            onChange: function(value) {
                Lampa.Storage.set('show_all_buttons_enabled', value);
                // Просто обновляем видимость кнопок без перезагрузки и провала в карточку
                setTimeout(function() {
                    var targetContainers = $('.full-start-new__buttons');
                    if (targetContainers.length) {
                        targetContainers.find('.full-start__button').each(function() {
                            var btn = $(this);
                            var classes = btn.attr('class') || '';
                            
                            // Не трогаем кнопку "Смотреть" и карандаш
                            if (classes.indexOf('button--play') !== -1 || classes.indexOf('button--edit-order') !== -1) {
                                return;
                            }
                            
                            if (value) {
                                // Если включено - убираем класс hide и hidden со всех кнопок
                                btn.removeClass('hide').removeClass('hidden');
                            } else {
                                // Если выключено - применяем логику скрытия
                                var btnId = getButtonId(btn);
                                var hidden = getHiddenButtons();
                                var isInHiddenList = hidden.indexOf(btnId) !== -1;
                                var defaultVisibleClasses = getDefaultVisibleButtonClasses();
                                
                                // Определяем, является ли кнопка стандартной видимой
                                var isDefaultVisible = false;
                                for (var i = 0; i < defaultVisibleClasses.length; i++) {
                                    if (classes.indexOf(defaultVisibleClasses[i]) !== -1) {
                                        isDefaultVisible = true;
                                        break;
                                    }
                                }
                                
                                // Если кнопка в списке скрытых - скрываем её
                                if (isInHiddenList) {
                                    btn.addClass('hidden');
                                } else if (hidden.length === 0) {
                                    // Первый запуск - показываем только стандартные кнопки
                                    if (!isDefaultVisible) {
                                        btn.addClass('hidden');
                                    } else {
                                        btn.removeClass('hidden');
                                    }
                                } else {
                                    // Пользователь уже настраивал - показываем все кроме скрытых
                                    btn.removeClass('hidden');
                                }
                                // Возвращаем класс hide кнопкам, которые должны быть скрыты по умолчанию
                                if (classes.indexOf('button--subscribe') !== -1) {
                                    btn.addClass('hide');
                                }
                            }
                        });
                    }
                }, 100);
            },
            onRender: function(element) {
                setTimeout(function() {
                    // Добавляем после "Редактор кнопок"
                    $('div[data-name="buttons_editor_enabled"]').after(element);
                }, 0);
            }
        });
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
