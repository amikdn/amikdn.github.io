
(function() {
    'use strict';

    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';
    
    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order', 'button--folder'];
    
    // Функция перевода
    function getTranslation(key) {
        var translated = Lampa.Lang.translate(key);
        return translated && translated !== key ? translated : key.replace('buttons_plugin_', '');
    }
    
    // Добавляем переводы для UI элементов плагина
    Lampa.Lang.add({
        buttons_plugin_button_order: {
            uk: 'Порядок кнопок',
            ru: 'Порядок кнопок',
            en: 'Buttons order',
            be: 'Парадак кнопак',
            zh: '按钮顺序'
        },
        buttons_plugin_reset_default: {
            uk: 'Скинути за замовчуванням',
            ru: 'Сбросить по умолчанию',
            en: 'Reset to default',
            be: 'Скінуць па змаўчанні',
            zh: '重置为默认'
        },
        buttons_plugin_button_editor: {
            uk: 'Редактор кнопок',
            ru: 'Редактор кнопок',
            en: 'Buttons editor',
            be: 'Рэдактар кнопак',
            zh: '按钮编辑器'
        },
        buttons_plugin_button_editor_enabled: {
            uk: 'Редактор кнопок включено',
            ru: 'Редактор кнопок включен',
            en: 'Buttons editor enabled',
            be: 'Рэдактар кнопак уключаны',
            zh: '按钮编辑器已启用'
        },
        buttons_plugin_button_editor_disabled: {
            uk: 'Редактор кнопок вимкнено',
            ru: 'Редактор кнопок выключен',
            en: 'Buttons editor disabled',
            be: 'Рэдактар кнопак адключаны',
            zh: '按钮编辑器已禁用'
        },
        buttons_plugin_button_unknown: {
            uk: 'Кнопка',
            ru: 'Кнопка',
            en: 'Button',
            be: 'Кнопка',
            zh: '按钮'
        },
        buttons_plugin_folder_name: {
            uk: 'Назва папки',
            ru: 'Название папки',
            en: 'Folder name',
            be: 'Назва папкі',
            zh: '文件夹名称'
        },
        buttons_plugin_folder_created: {
            uk: 'Папку створено',
            ru: 'Папка создана',
            en: 'Folder created',
            be: 'Папка створана',
            zh: '文件夹已创建'
        },
        buttons_plugin_folder_deleted: {
            uk: 'Папку видалено',
            ru: 'Папка удалена',
            en: 'Folder deleted',
            be: 'Папка выдалена',
            zh: '文件夹已删除'
        },
        buttons_plugin_folder_order: {
            uk: 'Порядок кнопок в папці',
            ru: 'Порядок кнопок в папке',
            en: 'Buttons order in folder',
            be: 'Парадак кнопак у папцы',
            zh: '文件夹中的按钮顺序'
        },
        buttons_plugin_create_folder: {
            uk: 'Створити папку',
            ru: 'Создать папку',
            en: 'Create folder',
            be: 'Стварыць папку',
            zh: '创建文件夹'
        },
        buttons_plugin_select_buttons: {
            uk: 'Виберіть кнопки для папки',
            ru: 'Выберите кнопки для папки',
            en: 'Select buttons for folder',
            be: 'Выберыце кнопкі для папкі',
            zh: '选择文件夹的按钮'
        },
        buttons_plugin_min_2_buttons: {
            uk: 'Виберіть мінімум 2 кнопки',
            ru: 'Выберите минимум 2 кнопки',
            en: 'Select at least 2 buttons',
            be: 'Выберыце мінімум 2 кнопкі',
            zh: '至少选择2个按钮'
        },
        buttons_plugin_edit_order: {
            uk: 'Змінити порядок',
            ru: 'Изменить порядок',
            en: 'Edit order',
            be: 'Змяніць парадак',
            zh: '编辑顺序'
        },
        buttons_plugin_settings_reset: {
            uk: 'Налаштування скинуто',
            ru: 'Настройки сброшены',
            en: 'Settings reset',
            be: 'Налады скінуты',
            zh: '设置已重置'
        },
        buttons_plugin_viewmode_default: {
            uk: 'Стандартний',
            ru: 'Стандартный',
            en: 'Default',
            be: 'Стандартны',
            zh: '默认'
        },
        buttons_plugin_viewmode_icons: {
            uk: 'Тільки іконки',
            ru: 'Только иконки',
            en: 'Icons only',
            be: 'Толькі іконкі',
            zh: '仅图标'
        },
        buttons_plugin_viewmode_always: {
            uk: 'З текстом',
            ru: 'С текстом',
            en: 'With text',
            be: 'З тэкстам',
            zh: '带文本'
        },
        buttons_plugin_viewmode_label: {
            uk: 'Вид кнопок',
            ru: 'Вид кнопок',
            en: 'Buttons view',
            be: 'Выгляд кнопак',
            zh: '按钮视图'
        },
        buttons_plugin_watch_folder: {
            uk: 'Дивитися',
            ru: 'Смотреть',
            en: 'Watch',
            be: 'Глядзець',
            zh: '观看'
        }
    });
    
    var DEFAULT_GROUPS = [
        { name: 'online', patterns: ['online', 'lampac', 'modss', 'showy'] },
        { name: 'torrent', patterns: ['torrent'] },
        { name: 'trailer', patterns: ['trailer', 'rutube'] },
        { name: 'shots', patterns: ['shots'] },
        { name: 'book', patterns: ['book'] },
        { name: 'reaction', patterns: ['reaction'] },
        { name: 'subscribe', patterns: ['subscribe'] }
    ];

    var currentButtons = [];
    var allButtonsCache = [];
    var allButtonsOriginal = [];
    var currentContainer = null;

    // Вспомогательная функция для поиска кнопки
    function findButton(btnId) {
        var btn = allButtonsOriginal.find(function(b) { return getBtnIdentifier(b) === btnId; });
        if (!btn) {
            btn = allButtonsCache.find(function(b) { return getBtnIdentifier(b) === btnId; });
        }
        return btn;
    }

    // Вспомогательная функция для получения всех ID кнопок в папках
    function getButtonsInFolders() {
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        return buttonsInFolders;
    }

    function getCustomOrder() {
        return Lampa.Storage.get('button_custom_order', []);
    }

    function setCustomOrder(order) {
        Lampa.Storage.set('button_custom_order', order);
    }

    function getItemOrder() {
        return Lampa.Storage.get('button_item_order', []);
    }

    function setItemOrder(order) {
        Lampa.Storage.set('button_item_order', order);
    }

    function getHiddenButtons() {
        return Lampa.Storage.get('button_hidden', []);
    }

    function setHiddenButtons(hidden) {
        Lampa.Storage.set('button_hidden', hidden);
    }

    function getFolders() {
        return Lampa.Storage.get('button_folders', []);
    }

    function setFolders(folders) {
        Lampa.Storage.set('button_folders', folders);
    }

    function getWatchFolder() {
        var folders = getFolders();
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        return folders.find(function(f) { return f.name === watchFolderName || f.name === 'Смотреть'; });
    }

    function ensureWatchFolder() {
        var folders = getFolders();
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        var watchFolder = folders.find(function(f) { return f.name === watchFolderName || f.name === 'Смотреть'; });
        
        if (!watchFolder) {
            watchFolder = {
                id: 'folder_watch_' + Date.now(),
                name: getTranslation('buttons_plugin_watch_folder'),
                buttons: []
            };
            folders.push(watchFolder);
            setFolders(folders);
            
            // Добавляем папку в itemOrder, если она пустая
            var itemOrder = getItemOrder();
            if (itemOrder.length === 0) {
                itemOrder.push({
                    type: 'folder',
                    id: watchFolder.id
                });
                setItemOrder(itemOrder);
            } else {
                // Проверяем, есть ли папка "Смотреть" в itemOrder
                var exists = itemOrder.some(function(item) {
                    return item.type === 'folder' && item.id === watchFolder.id;
                });
                if (!exists) {
                    // Добавляем в начало
                    itemOrder.unshift({
                        type: 'folder',
                        id: watchFolder.id
                    });
                    setItemOrder(itemOrder);
                }
            }
        }
        
        return watchFolder;
    }

    function shouldMoveToWatchFolder(btn) {
        var btnId = getBtnIdentifier(btn);
        var category = detectBtnCategory(btn);
        var text = btn.find('span').text().trim().toLowerCase();
        var classes = btn.attr('class') || '';
        
        // Не перемещаем book, reaction, subscribe
        if (category === 'book' || category === 'reaction' || category === 'subscribe') {
            return false;
        }
        
        // Не перемещаем кнопку редактирования
        if (btnId === 'button--edit-order' || btn.hasClass('button--edit-order')) {
            return false;
        }
        
        // Не перемещаем кнопку Options
        if (text === 'options' || text.indexOf('options') !== -1 || classes.indexOf('options') !== -1) {
            return false;
        }
        
        return true;
    }

    function getBtnIdentifier(button) {
        var classes = button.attr('class') || '';
        var text = button.find('span').text().trim().replace(/\s+/g, '_');
        var subtitle = button.attr('data-subtitle') || '';
        
        if (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1 || text.indexOf('MOD') !== -1) {
            return 'modss_online_button';
        }
        
        if (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1) {
            return 'showy_online_button';
        }
        
        var viewClasses = classes.split(' ').filter(function(c) { 
            return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; 
        }).join('_');
        
        if (!viewClasses && !text) {
            return 'button_unknown';
        }
        
        var id = viewClasses + '_' + text;
        
        if (subtitle) {
            id = id + '_' + subtitle.replace(/\s+/g, '_').substring(0, 30);
        }
        
        return id;
    }

    function detectBtnCategory(button) {
        var classes = button.attr('class') || '';
        
        // Специальная проверка для Shots - должна быть первой!
        if (classes.indexOf('shots-view-button') !== -1 || classes.indexOf('shots') !== -1) {
            return 'shots';
        }
        
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

    function shouldSkipBtn(button) {
        var classes = button.attr('class') || '';
        for (var i = 0; i < EXCLUDED_CLASSES.length; i++) {
            if (classes.indexOf(EXCLUDED_CLASSES[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function groupBtnsByType(container) {
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--folder, .button--play');
        
        var categories = {
            online: [],
            torrent: [],
            trailer: [],
            shots: [],
            book: [],
            reaction: [],
            subscribe: [],
            other: []
        };

        allButtons.each(function() {
            var $btn = $(this);
            
            // Пропускаем кнопки из .person-start__bottom (info, subscribe)
            if ($btn.closest('.person-start__bottom').length) {
                return;
            }
            
            if (shouldSkipBtn($btn)) return;

            var type = detectBtnCategory($btn);
            
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

    function arrangeBtnsByOrder(buttons) {
        var customOrder = getCustomOrder();
        
        var priority = [];
        var regular = [];
        
        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            if (id === 'modss_online_button' || id === 'showy_online_button') {
                priority.push(btn);
            } else {
                regular.push(btn);
            }
        });
        
        priority.sort(function(a, b) {
            var idA = getBtnIdentifier(a);
            var idB = getBtnIdentifier(b);
            if (idA === 'modss_online_button') return -1;
            if (idB === 'modss_online_button') return 1;
            if (idA === 'showy_online_button') return -1;
            if (idB === 'showy_online_button') return 1;
            return 0;
        });
        
        if (!customOrder.length) {
            regular.sort(function(a, b) {
                var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                var typeA = detectBtnCategory(a);
                var typeB = detectBtnCategory(b);
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
                if (getBtnIdentifier(remaining[i]) === id) {
                    sorted.push(remaining[i]);
                    remaining.splice(i, 1);
                    break;
                }
            }
        });

        return priority.concat(sorted).concat(remaining);
    }

    function applyBtnVisibility(buttons) {
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            var id = getBtnIdentifier(btn);
            if (hidden.indexOf(id) !== -1) {
                btn.addClass('hidden');
            } else {
                btn.removeClass('hidden');
            }
        });
    }

    function animateBtnFadeIn(buttons) {
        buttons.forEach(function(btn, index) {
            btn.css({
                'opacity': '0',
                'animation': 'button-fade-in 0.4s ease forwards',
                'animation-delay': (index * 0.08) + 's'
            });
        });
    }

    function buildEditorBtn() {
        var btn = $('<div class="full-start__button selector button--edit-order" style="order: 9999;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 29" fill="none"><use xlink:href="#sprite-edit"></use></svg>' +
            '</div>');

        btn.on('hover:enter', function() {
            openEditDialog();
        });

        // Проверяем настройку и скрываем кнопку если редактор выключен
        if (Lampa.Storage.get('buttons_editor_enabled') === false) {
            btn.hide();
        }

        return btn;
    }

    function saveOrder() {
        var order = [];
        currentButtons.forEach(function(btn) {
            order.push(getBtnIdentifier(btn));
        });
        setCustomOrder(order);
    }

    function ensureWatchFolderFirst() {
        var itemOrder = getItemOrder();
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        var folders = getFolders();
        var watchFolder = folders.find(function(f) { 
            return f.name === watchFolderName || f.name === 'Смотреть'; 
        });
        
        if (watchFolder) {
            // Находим папку "Смотреть" в itemOrder
            var watchIndex = -1;
            for (var i = 0; i < itemOrder.length; i++) {
                if (itemOrder[i].type === 'folder' && itemOrder[i].id === watchFolder.id) {
                    watchIndex = i;
                    break;
                }
            }
            
            // Если папка найдена и не первая, перемещаем её в начало
            if (watchIndex > 0) {
                var watchItem = itemOrder.splice(watchIndex, 1)[0];
                itemOrder.unshift(watchItem);
                setItemOrder(itemOrder);
            } else if (watchIndex === -1) {
                // Если папки нет в itemOrder, добавляем в начало
                itemOrder.unshift({
                    type: 'folder',
                    id: watchFolder.id
                });
                setItemOrder(itemOrder);
            }
        }
    }

    function saveItemOrder() {
        var order = [];
        var items = $('.menu-edit-list .menu-edit-list__item').not('.menu-edit-list__create-folder');
        
        items.each(function() {
            var $item = $(this);
            var itemType = $item.data('itemType');
            
            if (itemType === 'folder') {
                order.push({
                    type: 'folder',
                    id: $item.data('folderId')
                });
            } else if (itemType === 'button') {
                order.push({
                    type: 'button',
                    id: $item.data('buttonId')
                });
            }
        });
        
        setItemOrder(order);
        ensureWatchFolderFirst();
    }

    function applyChanges() {
        if (!currentContainer) return;
        
        var categories = groupBtnsByType(currentContainer);
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.shots)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.subscribe)
            .concat(categories.other);
        
        allButtons = arrangeBtnsByOrder(allButtons);
        allButtonsCache = allButtons;
        
        // Обеспечиваем наличие папки "Смотреть"
        var watchFolder = ensureWatchFolder();
        var folders = getFolders();
        var foldersUpdated = false;
        
        // Автоматически перемещаем новые кнопки в папку "Смотреть"
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });
        
        // Проверяем itemOrder - если кнопка там есть, не перемещаем её в папку
        var itemOrder = getItemOrder();
        var buttonsInItemOrder = [];
        itemOrder.forEach(function(item) {
            if (item.type === 'button') {
                buttonsInItemOrder.push(item.id);
            }
        });
        
        allButtons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);
            
            // Пропускаем кнопки, которые уже в папках
            if (buttonsInFolders.indexOf(btnId) !== -1) {
                return;
            }
            
            // Пропускаем кнопки, которые уже в itemOrder (они на главной странице)
            if (buttonsInItemOrder.indexOf(btnId) !== -1) {
                return;
            }
            
            // Пропускаем кнопки, которые не должны быть в папке "Смотреть"
            if (!shouldMoveToWatchFolder(btn)) {
                return;
            }
            
            // Добавляем кнопку в папку "Смотреть", если её там ещё нет
            if (watchFolder.buttons.indexOf(btnId) === -1) {
                watchFolder.buttons.push(btnId);
                foldersUpdated = true;
            }
        });
        
        if (foldersUpdated) {
            // Обновляем папку в хранилище
            for (var i = 0; i < folders.length; i++) {
                if (folders[i].id === watchFolder.id) {
                    folders[i] = watchFolder;
                    break;
                }
            }
            setFolders(folders);
            
            // Обновляем список кнопок в папках
            buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });
        }
        
        folders.forEach(function(folder) {
            var updatedButtons = [];
            var usedButtons = [];
            
            folder.buttons.forEach(function(oldBtnId) {
                var found = false;
                
                for (var i = 0; i < allButtons.length; i++) {
                    var btn = allButtons[i];
                    var newBtnId = getBtnIdentifier(btn);
                    
                    if (usedButtons.indexOf(newBtnId) !== -1) continue;
                    
                    if (newBtnId === oldBtnId) {
                        updatedButtons.push(newBtnId);
                        usedButtons.push(newBtnId);
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    for (var i = 0; i < allButtons.length; i++) {
                        var btn = allButtons[i];
                        var newBtnId = getBtnIdentifier(btn);
                        
                        if (usedButtons.indexOf(newBtnId) !== -1) continue;
                        
                        var text = btn.find('span').text().trim();
                        var classes = btn.attr('class') || '';
                        
                        if ((oldBtnId.indexOf('modss') !== -1 || oldBtnId.indexOf('MODS') !== -1) &&
                            (classes.indexOf('modss') !== -1 || text.indexOf('MODS') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        } else if ((oldBtnId.indexOf('showy') !== -1 || oldBtnId.indexOf('Showy') !== -1) &&
                                   (classes.indexOf('showy') !== -1 || text.indexOf('Showy') !== -1)) {
                            updatedButtons.push(newBtnId);
                            usedButtons.push(newBtnId);
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found) {
                    updatedButtons.push(oldBtnId);
                }
            });
            
            if (updatedButtons.length !== folder.buttons.length || 
                updatedButtons.some(function(id, i) { return id !== folder.buttons[i]; })) {
                folder.buttons = updatedButtons;
                foldersUpdated = true;
            }
        });
        
        if (foldersUpdated) {
            setFolders(folders);
            
            // Обновляем список кнопок в папках после обновления
            buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });
        } else {
            // Если папки не обновлялись, все равно обновляем список
            buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });
        }
        
        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
        });
        
        currentButtons = filteredButtons;
        applyBtnVisibility(filteredButtons);
        
        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;

        targetContainer.find('.full-start__button').not('.button--edit-order').detach();
        
        // Применяем режим отображения
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');
        
        var itemOrder = getItemOrder();
        var visibleButtons = [];
        
        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];
            
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    var btnId = item.id;
                    // Если кнопка в itemOrder, она должна быть на главной странице
                    // Находим кнопку среди всех кнопок
                    var allButtonsList = allButtonsCache.length > 0 ? allButtonsCache : allButtons;
                    var btn = allButtonsList.find(function(b) { return getBtnIdentifier(b) === btnId; });
                    if (btn && !btn.hasClass('hidden')) {
                        // Проверяем, не находится ли кнопка уже в контейнере
                        var existingBtn = targetContainer.find('.full-start__button').filter(function() {
                            return getBtnIdentifier($(this)) === btnId;
                        });
                        if (!existingBtn.length) {
                            // Клонируем кнопку из оригинальных кнопок
                            var originalBtn = allButtonsOriginal.find(function(b) { 
                                return getBtnIdentifier(b) === btnId; 
                            });
                            if (originalBtn) {
                                var clonedBtn = originalBtn.clone(true, true);
                                clonedBtn.css({ 'opacity': '1', 'animation': 'none' });
                                clonedBtn.removeClass('hidden');
                                targetContainer.append(clonedBtn);
                                visibleButtons.push(clonedBtn);
                            } else {
                                var clonedBtn = btn.clone(true, true);
                                clonedBtn.css({ 'opacity': '1', 'animation': 'none' });
                                clonedBtn.removeClass('hidden');
                                targetContainer.append(clonedBtn);
                                visibleButtons.push(clonedBtn);
                            }
                        } else {
                            visibleButtons.push(existingBtn);
                        }
                        addedButtons.push(btnId);
                    }
                }
            });
            
            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden') && buttonsInFolders.indexOf(btnId) === -1) {
                    var insertBefore = null;
                    var btnType = detectBtnCategory(btn);
                    var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                    var btnTypeIndex = typeOrder.indexOf(btnType);
                    if (btnTypeIndex === -1) btnTypeIndex = 999;
                    
                    if (btnId === 'modss_online_button' || btnId === 'showy_online_button') {
                        var firstNonPriority = targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').filter(function() {
                            var id = getBtnIdentifier($(this));
                            return id !== 'modss_online_button' && id !== 'showy_online_button';
                        }).first();
                        
                        if (firstNonPriority.length) {
                            insertBefore = firstNonPriority;
                        }
                        
                        if (btnId === 'showy_online_button') {
                            var modsBtn = targetContainer.find('.full-start__button').filter(function() {
                                return getBtnIdentifier($(this)) === 'modss_online_button';
                            });
                            if (modsBtn.length) {
                                insertBefore = modsBtn.next();
                                if (!insertBefore.length || insertBefore.hasClass('button--edit-order')) {
                                    insertBefore = null;
                                }
                            }
                        }
                    } else {
                        targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').each(function() {
                            var existingBtn = $(this);
                            var existingId = getBtnIdentifier(existingBtn);
                            
                            if (existingId === 'modss_online_button' || existingId === 'showy_online_button') {
                                return true;
                            }
                            
                            var existingType = detectBtnCategory(existingBtn);
                            var existingTypeIndex = typeOrder.indexOf(existingType);
                            if (existingTypeIndex === -1) existingTypeIndex = 999;
                            
                            if (btnTypeIndex < existingTypeIndex) {
                                insertBefore = existingBtn;
                                return false;
                            }
                        });
                    }
                    
                    if (insertBefore && insertBefore.length) {
                        btn.insertBefore(insertBefore);
                    } else {
                        var editBtn = targetContainer.find('.button--edit-order');
                        if (editBtn.length) {
                            btn.insertBefore(editBtn);
                        } else {
                            targetContainer.append(btn);
                        }
                    }
                    visibleButtons.push(btn);
                }
            });
            
            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (!btn.hasClass('hidden') && buttonsInFolders.indexOf(btnId) === -1) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
            
            folders.forEach(function(folder) {
                var folderBtn = createFolderButton(folder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            });
        }

        animateBtnFadeIn(visibleButtons);

        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        }

        saveOrder();
        ensureWatchFolderFirst();
        
        setTimeout(function() {
            if (currentContainer) {
                setupButtonNavigation(currentContainer);
            }
        }, 100);
    }

    function capitalizeText(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getBtnDisplayText(btn, allButtons) {
        var text = btn.find('span').text().trim();
        var classes = btn.attr('class') || '';
        var subtitle = btn.attr('data-subtitle') || '';
        
        if (!text) {
            var viewClass = classes.split(' ').find(function(c) { 
                return c.indexOf('view--') === 0 || c.indexOf('button--') === 0; 
            });
            if (viewClass) {
                text = viewClass.replace('view--', '').replace('button--', '').replace(/_/g, ' ');
                text = capitalizeText(text);
            } else {
                text = getTranslation('buttons_plugin_button_unknown');
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
            
            var viewClass = classes.split(' ').find(function(c) { 
                return c.indexOf('view--') === 0; 
            });
            if (viewClass) {
                var identifier = viewClass.replace('view--', '').replace(/_/g, ' ');
                identifier = capitalizeText(identifier);
                return text + ' <span style="opacity:0.5">(' + identifier + ')</span>';
            }
        }
        
        return text;
    }

    function createFolderButton(folder) {
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        var isWatchFolder = folder.name === watchFolderName || folder.name === 'Смотреть';
        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
            '</svg>';
        
        if (isWatchFolder) {
            // Для папки "Смотреть" используем иконку Play
            icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M8 5v14l11-7z"/>' +
            '</svg>';
        } else {
            // Для других папок используем первую кнопку
            var firstBtnId = folder.buttons[0];
            var firstBtn = findButton(firstBtnId);
            if (firstBtn) {
                var btnIcon = firstBtn.find('svg').first();
                if (btnIcon.length) {
                    icon = btnIcon.prop('outerHTML');
                }
            }
        }
        
        var btn = $('<div class="full-start__button selector button--folder" data-folder-id="' + folder.id + '">' +
            icon +
            '<span>' + folder.name + '</span>' +
        '</div>');

        btn.on('hover:enter', function() {
            openFolderMenu(folder);
        });

        return btn;
    }

    function openFolderMenu(folder) {
        var items = [];
        var hidden = getHiddenButtons();
        
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                // Пропускаем скрытые кнопки
                if (hidden.indexOf(btnId) !== -1) {
                    return;
                }
                
                var displayName = getBtnDisplayText(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.prop('outerHTML') : '';
                var subtitle = btn.attr('data-subtitle') || '';
                
                var item = {
                    title: displayName.replace(/<[^>]*>/g, ''),
                    button: btn,
                    btnId: btnId
                };
                
                if (icon) {
                    item.template = 'selectbox_icon';
                    item.icon = icon;
                }
                
                if (subtitle) {
                    item.subtitle = subtitle;
                }
                
                items.push(item);
            }
        });

        items.push({
            title: getTranslation('buttons_plugin_edit_order'),
            edit: true
        });

        Lampa.Select.show({
            title: folder.name,
            items: items,
            onSelect: function(item) {
                if (item.edit) {
                    openFolderEditDialog(folder);
                } else {
                    item.button.trigger('hover:enter');
                }
            },
            onBack: function() {
                Lampa.Controller.toggle('full_start');
            }
        });
    }

    function openFolderEditDialog(folder) {
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        
        // Сортируем кнопки: трейлеры всегда первые
        var trailerButtons = [];
        var otherButtons = [];
        
        folder.buttons.forEach(function(btnId) {
            var btn = findButton(btnId);
            var category = btn ? detectBtnCategory(btn) : '';
            if (category === 'trailer') {
                trailerButtons.push(btnId);
            } else {
                otherButtons.push(btnId);
            }
        });
        
        var sortedButtons = trailerButtons.concat(otherButtons);
        
        sortedButtons.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var displayName = getBtnDisplayText(btn, allButtonsOriginal);
                var iconElement = btn.find('svg').first();
                var icon = iconElement.length ? iconElement.clone() : $('<svg></svg>');
                var isHidden = hidden.indexOf(btnId) !== -1;

                var watchFolderName = getTranslation('buttons_plugin_watch_folder');
                var isWatchFolder = folder.name === watchFolderName || folder.name === 'Смотреть';
                
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
                    (isWatchFolder ? '<div class="menu-edit-list__move-out selector" title="Переместить на главную">' +
                        '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<path d="M11 2L11 20M2 11L20 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>' : '') +
                '</div>');

                item.find('.menu-edit-list__icon').append(icon);
                item.data('btnId', btnId);
                item.toggleClass('menu-edit-list__item-hidden', isHidden);

                item.find('.move-up').on('hover:enter', function() {
                    var prev = item.prev();
                    if (prev.length) {
                        item.insertBefore(prev);
                        saveFolderButtonOrder(folder, list);
                        ensureWatchFolderFirst();
                    }
                });

                item.find('.move-down').on('hover:enter', function() {
                    var next = item.next();
                    if (next.length) {
                        item.insertAfter(next);
                        saveFolderButtonOrder(folder, list);
                        ensureWatchFolderFirst();
                    }
                });
                
                // Добавляем кнопку для перемещения из папки на главную страницу
                if (isWatchFolder) {
                    item.find('.menu-edit-list__move-out').on('hover:enter', function() {
                        // Удаляем кнопку из папки "Смотреть"
                        var folders = getFolders();
                        var watchFolder = folders.find(function(f) { 
                            return f.name === watchFolderName || f.name === 'Смотреть'; 
                        });
                        
                        if (watchFolder) {
                            var btnIndex = watchFolder.buttons.indexOf(btnId);
                            if (btnIndex !== -1) {
                                // Удаляем кнопку из папки
                                watchFolder.buttons.splice(btnIndex, 1);
                                
                                // Обновляем папку в хранилище
                                for (var i = 0; i < folders.length; i++) {
                                    if (folders[i].id === watchFolder.id) {
                                        folders[i] = watchFolder;
                                        break;
                                    }
                                }
                                setFolders(folders);
                                
                                // Обновляем itemOrder - добавляем кнопку на главную страницу
                                var itemOrder = getItemOrder();
                                var watchFolderItemIndex = -1;
                                for (var i = 0; i < itemOrder.length; i++) {
                                    if (itemOrder[i].type === 'folder' && itemOrder[i].id === watchFolder.id) {
                                        watchFolderItemIndex = i;
                                        break;
                                    }
                                }
                                
                                // Проверяем, нет ли уже этой кнопки в itemOrder
                                var btnExistsInOrder = itemOrder.some(function(item) {
                                    return item.type === 'button' && item.id === btnId;
                                });
                                
                                // Добавляем кнопку после папки "Смотреть", если её там еще нет
                                if (!btnExistsInOrder) {
                                    if (watchFolderItemIndex !== -1) {
                                        itemOrder.splice(watchFolderItemIndex + 1, 0, {
                                            type: 'button',
                                            id: btnId
                                        });
                                    } else {
                                        itemOrder.push({
                                            type: 'button',
                                            id: btnId
                                        });
                                    }
                                    setItemOrder(itemOrder);
                                }
                                
                                ensureWatchFolderFirst();
                                
                                // Удаляем элемент из списка в диалоге
                                item.remove();
                                
                                Lampa.Noty.show('Кнопка перемещена на главную страницу');
                                
                                // Применяем изменения к главной странице (без переключения контроллера)
                                if (currentContainer) {
                                    currentContainer.data('buttons-processed', false);
                                    applyChanges();
                                }
                                
                                // Не закрываем диалог и не переключаем контроллер - остаемся в диалоге
                            }
                        }
                    });
                }

                list.append(item);
            }
        });

        Lampa.Modal.open({
            title: getTranslation('buttons_plugin_folder_order'),
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                updateFolderIcon(folder);
                openFolderMenu(folder);
            }
        });
    }

    function saveFolderButtonOrder(folder, list) {
        var newOrder = [];
        list.find('.menu-edit-list__item').each(function() {
            var btnId = $(this).data('btnId');
            if (btnId) {
                newOrder.push(btnId);
            }
        });
        
        // Трейлеры всегда первые в папке "Смотреть"
        var trailerButtons = [];
        var otherButtons = [];
        
        newOrder.forEach(function(btnId) {
            var btn = findButton(btnId);
            var category = btn ? detectBtnCategory(btn) : '';
            if (category === 'trailer') {
                trailerButtons.push(btnId);
            } else {
                otherButtons.push(btnId);
            }
        });
        
        newOrder = trailerButtons.concat(otherButtons);
        
        folder.buttons = newOrder;
        
        var folders = getFolders();
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].id === folder.id) {
                folders[i].buttons = newOrder;
                break;
            }
        }
        setFolders(folders);
        
        updateFolderIcon(folder);
        ensureWatchFolderFirst();
        
        // Применяем изменения сразу (без переключения контроллера)
        if (currentContainer) {
            applyChanges();
        }
        
        // Не переключаем контроллер - остаемся в диалоге
    }

    function updateFolderIcon(folder) {
        if (!folder.buttons || folder.buttons.length === 0) return;
        
        var folderBtn = currentContainer.find('.button--folder[data-folder-id="' + folder.id + '"]');
        if (folderBtn.length) {
            var watchFolderName = getTranslation('buttons_plugin_watch_folder');
            var isWatchFolder = folder.name === watchFolderName || folder.name === 'Смотреть';
            var icon = null;
            
            if (isWatchFolder) {
                // Для папки "Смотреть" всегда используем иконку Play
                icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">' +
                    '<path d="M8 5v14l11-7z"/>' +
                '</svg>';
            } else {
                // Для других папок используем первую кнопку
                var iconBtn = findButton(folder.buttons[0]);
                if (iconBtn) {
                    var iconElement = iconBtn.find('svg').first();
                    if (iconElement.length) {
                        icon = iconElement.clone();
                    }
                }
            }
            
            if (icon) {
                folderBtn.find('svg').replaceWith(icon);
            } else {
                var defaultIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                '</svg>';
                folderBtn.find('svg').replaceWith(defaultIcon);
            }
        }
    }

    function deleteFolder(folderId) {
        var folders = getFolders();
        folders = folders.filter(function(f) { return f.id !== folderId; });
        setFolders(folders);
    }

    function openEditDialog() {
        if (currentContainer) {
            var categories = groupBtnsByType(currentContainer);
            var allButtons = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.shots)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.subscribe)
                .concat(categories.other);
            
            allButtons = arrangeBtnsByOrder(allButtons);
            allButtonsCache = allButtons;
            
            // Обеспечиваем наличие папки "Смотреть"
            ensureWatchFolder();
            
            var folders = getFolders();
            var buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });
            
            var filteredButtons = allButtons.filter(function(btn) {
                return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
            });
            
            currentButtons = filteredButtons;
        }
        
        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        
        // Обеспечиваем наличие папки "Смотреть"
        ensureWatchFolder();
        
        var folders = getFolders();
        var itemOrder = getItemOrder();

        // Кнопка настройки отображения кнопок
        var modes = ['default', 'icons', 'always'];
        var labels = {
            default: getTranslation('buttons_plugin_viewmode_default'),
            icons: getTranslation('buttons_plugin_viewmode_icons'),
            always: getTranslation('buttons_plugin_viewmode_always')
        };
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');
        var modeBtn = $('<div class="selector viewmode-switch">' +
            '<div style="text-align: center; padding: 1em;">' + getTranslation('buttons_plugin_viewmode_label') + ': ' + labels[currentMode] + '</div>' +
            '</div>');
        modeBtn.on('hover:enter', function() {
            var idx = modes.indexOf(currentMode);
            idx = (idx + 1) % modes.length;
            currentMode = modes[idx];
            Lampa.Storage.set('buttons_viewmode', currentMode);
            $(this).find('div').text(getTranslation('buttons_plugin_viewmode_label') + ': ' + labels[currentMode]);
            if (currentContainer) {
                var target = currentContainer.find('.full-start-new__buttons');
                target.removeClass('icons-only always-text');
                if (currentMode === 'icons') target.addClass('icons-only');
                if (currentMode === 'always') target.addClass('always-text');
            }
        });
        list.append(modeBtn);

        function createFolderItem(folder) {
            var watchFolderName = getTranslation('buttons_plugin_watch_folder');
            var isWatchFolder = folder.name === watchFolderName || folder.name === 'Смотреть';
            
            var item = $('<div class="menu-edit-list__item folder-item">' +
                '<div class="menu-edit-list__icon">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                        '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu-edit-list__title">' + folder.name + ' <span style="opacity:0.5">(' + folder.buttons.length + ')</span></div>' +
                (isWatchFolder ? '' : (
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
                    '<div class="menu-edit-list__delete selector">' +
                        '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                            '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                            '<path d="M9.5 9.5L16.5 16.5M16.5 9.5L9.5 16.5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                        '</svg>' +
                    '</div>'
                )) +
            '</div>');

            item.data('folderId', folder.id);
            item.data('itemType', 'folder');

            if (!isWatchFolder) {
            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('viewmode-switch') || prev.hasClass('menu-edit-list__create-folder'))) {
                    prev = prev.prev();
                }
                if (prev.length && !prev.hasClass('viewmode-switch') && !prev.hasClass('menu-edit-list__create-folder')) {
                    item.insertBefore(prev);
                    saveItemOrder();
                    ensureWatchFolderFirst();
                    // Применяем изменения сразу
                    if (currentContainer) {
                        applyChanges();
                    }
                }
            });

            item.find('.move-down').on('hover:enter', function() {
                var next = item.next();
                while (next.length && next.hasClass('folder-reset-button')) {
                    next = next.next();
                }
                if (next.length && !next.hasClass('folder-reset-button')) {
                    item.insertAfter(next);
                    saveItemOrder();
                    ensureWatchFolderFirst();
                    // Применяем изменения сразу
                    if (currentContainer) {
                        applyChanges();
                    }
                }
            });

                item.find('.menu-edit-list__delete').on('hover:enter', function() {
                    var folderId = folder.id;
                    var folderButtons = folder.buttons.slice();
                    
                    deleteFolder(folderId);
                    
                    var itemOrder = getItemOrder();
                    var newItemOrder = [];
                    
                    for (var i = 0; i < itemOrder.length; i++) {
                        if (itemOrder[i].type === 'folder' && itemOrder[i].id === folderId) {
                            continue;
                        }
                        if (itemOrder[i].type === 'button') {
                            var isInFolder = false;
                            for (var j = 0; j < folderButtons.length; j++) {
                                if (itemOrder[i].id === folderButtons[j]) {
                                    isInFolder = true;
                                    break;
                                }
                            }
                            if (isInFolder) {
                                continue;
                            }
                        }
                        newItemOrder.push(itemOrder[i]);
                    }
                    
                    setItemOrder(newItemOrder);
                    
                    var customOrder = getCustomOrder();
                    var newCustomOrder = [];
                    for (var i = 0; i < customOrder.length; i++) {
                        var found = false;
                        for (var j = 0; j < folderButtons.length; j++) {
                            if (customOrder[i] === folderButtons[j]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            newCustomOrder.push(customOrder[i]);
                        }
                    }
                    setCustomOrder(newCustomOrder);
                    
                    item.remove();
                    Lampa.Noty.show(getTranslation('buttons_plugin_folder_deleted'));
                    
                    setTimeout(function() {
                        if (currentContainer) {
                            currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                            currentContainer.data('buttons-processed', false);
                            
                            var targetContainer = currentContainer.find('.full-start-new__buttons');
                            var existingButtons = targetContainer.find('.full-start__button').toArray();
                            
                            allButtonsOriginal.forEach(function(originalBtn) {
                                var btnId = getBtnIdentifier(originalBtn);
                                var exists = false;
                                
                                for (var i = 0; i < existingButtons.length; i++) {
                                    if (getBtnIdentifier($(existingButtons[i])) === btnId) {
                                        exists = true;
                                        break;
                                    }
                                }
                                
                                if (!exists) {
                                    var clonedBtn = originalBtn.clone(true, true);
                                    clonedBtn.css({
                                        'opacity': '1',
                                        'animation': 'none'
                                    });
                                    targetContainer.append(clonedBtn);
                                }
                            });
                            
                            reorderButtons(currentContainer);
                            
                            setTimeout(function() {
                                var updatedItemOrder = [];
                                targetContainer.find('.full-start__button').not('.button--edit-order').each(function() {
                                    var $btn = $(this);
                                    if ($btn.hasClass('button--folder')) {
                                        var fId = $btn.attr('data-folder-id');
                                        updatedItemOrder.push({
                                            type: 'folder',
                                            id: fId
                                        });
                                    } else {
                                        var btnId = getBtnIdentifier($btn);
                                        updatedItemOrder.push({
                                            type: 'button',
                                            id: btnId
                                        });
                                    }
                                });
                                setItemOrder(updatedItemOrder);
                                
                                var categories = groupBtnsByType(currentContainer);
                                var allButtons = []
                                    .concat(categories.online)
                                    .concat(categories.torrent)
                                    .concat(categories.trailer)
                                    .concat(categories.shots)
                                    .concat(categories.book)
                                    .concat(categories.reaction)
                                    .concat(categories.subscribe)
                                    .concat(categories.other);
                                
                                allButtons = arrangeBtnsByOrder(allButtons);
                                allButtonsCache = allButtons;
                                
                                var folders = getFolders();
                                var buttonsInFolders = [];
                                folders.forEach(function(folder) {
                                    buttonsInFolders = buttonsInFolders.concat(folder.buttons);
                                });
                                
                                var filteredButtons = allButtons.filter(function(btn) {
                                    return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
                                });
                                
                                currentButtons = filteredButtons;
                                
                                folderButtons.forEach(function(btnId) {
                                    var btn = allButtons.find(function(b) { return getBtnIdentifier(b) === btnId; });
                                    if (btn) {
                                        var btnItem = createButtonItem(btn);
                                        
                                        var inserted = false;
                                        list.find('.menu-edit-list__item').not('.menu-edit-list__create-folder, .folder-reset-button').each(function() {
                                            var $existingItem = $(this);
                                            var existingType = $existingItem.data('itemType');
                                            
                                            if (existingType === 'button') {
                                                var existingBtnId = $existingItem.data('buttonId');
                                                var existingIndex = updatedItemOrder.findIndex(function(item) {
                                                    return item.type === 'button' && item.id === existingBtnId;
                                                });
                                                var newIndex = updatedItemOrder.findIndex(function(item) {
                                                    return item.type === 'button' && item.id === btnId;
                                                });
                                                
                                                if (newIndex !== -1 && existingIndex !== -1 && newIndex < existingIndex) {
                                                    btnItem.insertBefore($existingItem);
                                                    inserted = true;
                                                    return false;
                                                }
                                            }
                                        });
                                        
                                        if (!inserted) {
                                            var resetButton = list.find('.folder-reset-button');
                                            if (resetButton.length) {
                                                btnItem.insertBefore(resetButton);
                                            } else {
                                                list.append(btnItem);
                                            }
                                        }
                                    }
                                });
                                
                                setTimeout(function() {
                                    try {
                                        Lampa.Controller.toggle('modal');
                                    } catch(e) {}
                                }, 100);
                            }, 100);
                        }
                    }, 50);
                });
            }
            
            return item;
        }

        function createButtonItem(btn) {
            var displayName = getBtnDisplayText(btn, currentButtons);
            var icon = btn.find('svg').clone();
            var btnId = getBtnIdentifier(btn);
            var isHidden = hidden.indexOf(btnId) !== -1;

            var watchFolderName = getTranslation('buttons_plugin_watch_folder');
            var watchFolder = folders.find(function(f) { 
                return f.name === watchFolderName || f.name === 'Смотреть'; 
            });
            var isInWatchFolder = watchFolder && watchFolder.buttons.indexOf(btnId) !== -1;
            
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
                (!isInWatchFolder && watchFolder ? '<div class="menu-edit-list__move-in selector" title="Переместить в папку Смотреть">' +
                    '<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M11 2L11 20M2 11L20 11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                    '</svg>' +
                '</div>' : '') +
            '</div>');

            item.find('.menu-edit-list__icon').append(icon);
            item.data('button', btn);
            item.data('buttonId', btnId);
            item.data('itemType', 'button');
            
            // Добавляем класс для скрытых кнопок
            if (isHidden) {
                item.addClass('menu-edit-list__item-hidden');
            }

            item.find('.move-up').on('hover:enter', function() {
                var prev = item.prev();
                while (prev.length && (prev.hasClass('viewmode-switch') || prev.hasClass('menu-edit-list__create-folder'))) {
                    prev = prev.prev();
                }
                if (prev.length && !prev.hasClass('viewmode-switch') && !prev.hasClass('menu-edit-list__create-folder')) {
                    item.insertBefore(prev);
                    var btnIndex = currentButtons.indexOf(btn);
                    if (btnIndex > 0) {
                        currentButtons.splice(btnIndex, 1);
                        currentButtons.splice(btnIndex - 1, 0, btn);
                    }
                    saveItemOrder();
                    ensureWatchFolderFirst();
                    // Применяем изменения сразу
                    if (currentContainer) {
                        applyChanges();
                    }
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
                    saveItemOrder();
                    ensureWatchFolderFirst();
                    // Применяем изменения сразу
                    if (currentContainer) {
                        applyChanges();
                    }
                }
            });

            item.find('.toggle').on('hover:enter', function() {
                var hidden = getHiddenButtons();
                var index = hidden.indexOf(btnId);
                
                if (index !== -1) {
                    hidden.splice(index, 1);
                    btn.removeClass('hidden');
                    item.find('.dot').attr('opacity', '1');
                    item.removeClass('menu-edit-list__item-hidden');
                } else {
                    hidden.push(btnId);
                    btn.addClass('hidden');
                    item.find('.dot').attr('opacity', '0');
                    item.addClass('menu-edit-list__item-hidden');
                }
                
                setHiddenButtons(hidden);
                
                // Применяем изменения сразу для кнопок из папки "Смотреть"
                if (currentContainer) {
                    applyChanges();
                }
            });
            
            // Добавляем кнопку для перемещения с главной страницы в папку "Смотреть"
            if (!isInWatchFolder && watchFolder) {
                item.find('.menu-edit-list__move-in').on('hover:enter', function() {
                    // Добавляем кнопку в папку "Смотреть"
                    if (watchFolder.buttons.indexOf(btnId) === -1) {
                        watchFolder.buttons.push(btnId);
                        
                        // Обновляем папку в хранилище
                        var folders = getFolders();
                        for (var i = 0; i < folders.length; i++) {
                            if (folders[i].id === watchFolder.id) {
                                folders[i] = watchFolder;
                                break;
                            }
                        }
                        setFolders(folders);
                        
                        // Удаляем кнопку из itemOrder (если она там есть)
                        var itemOrder = getItemOrder();
                        var newItemOrder = [];
                        for (var i = 0; i < itemOrder.length; i++) {
                            if (itemOrder[i].type === 'button' && itemOrder[i].id === btnId) {
                                continue; // Пропускаем эту кнопку
                            }
                            newItemOrder.push(itemOrder[i]);
                        }
                        setItemOrder(newItemOrder);
                        ensureWatchFolderFirst();
                        
                        Lampa.Modal.close();
                        Lampa.Noty.show('Кнопка перемещена в папку "Смотреть"');
                        
                        if (currentContainer) {
                            currentContainer.data('buttons-processed', false);
                            reorderButtons(currentContainer);
                        }
                        refreshController();
                    }
                });
            }
            
            return item;
        }
        
        // Получаем кнопки из папки "Смотреть" для возможности их скрытия
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        var watchFolder = folders.find(function(f) { 
            return f.name === watchFolderName || f.name === 'Смотреть'; 
        });
        var watchFolderButtons = [];
        if (watchFolder) {
            watchFolder.buttons.forEach(function(btnId) {
                var btn = findButton(btnId);
                if (btn) {
                    watchFolderButtons.push(btn);
                }
            });
        }
        
        // Сортируем папки: "Смотреть" всегда первая
        folders.sort(function(a, b) {
            var aIsWatch = a.name === watchFolderName || a.name === 'Смотреть';
            var bIsWatch = b.name === watchFolderName || b.name === 'Смотреть';
            if (aIsWatch && !bIsWatch) return -1;
            if (!aIsWatch && bIsWatch) return 1;
            return 0;
        });
        
        // Сортируем itemOrder: папка "Смотреть" всегда первая
        if (itemOrder.length > 0) {
            if (watchFolder) {
                itemOrder.sort(function(a, b) {
                    var aIsWatch = a.type === 'folder' && a.id === watchFolder.id;
                    var bIsWatch = b.type === 'folder' && b.id === watchFolder.id;
                    if (aIsWatch && !bIsWatch) return -1;
                    if (!aIsWatch && bIsWatch) return 1;
                    return 0;
                });
            }
            
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        list.append(createFolderItem(folder));
                    }
                } else if (item.type === 'button') {
                    var btn = currentButtons.find(function(b) { return getBtnIdentifier(b) === item.id; });
                    if (btn) {
                        list.append(createButtonItem(btn));
                    }
                }
            });
            
            currentButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                var found = itemOrder.some(function(item) {
                    return item.type === 'button' && item.id === btnId;
                });
                if (!found) {
                    list.append(createButtonItem(btn));
                }
            });
            
            // Добавляем кнопки из папки "Смотреть" для возможности их скрытия
            watchFolderButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                var found = itemOrder.some(function(item) {
                    return item.type === 'button' && item.id === btnId;
                });
                if (!found) {
                    list.append(createButtonItem(btn));
                }
            });
            
            folders.forEach(function(folder) {
                var found = itemOrder.some(function(item) {
                    return item.type === 'folder' && item.id === folder.id;
                });
                if (!found) {
                    list.append(createFolderItem(folder));
                }
            });
        } else {
            // Папка "Смотреть" всегда первая
            if (watchFolder) {
                list.append(createFolderItem(watchFolder));
            }
            
            folders.forEach(function(folder) {
                if (folder.id !== watchFolder.id) {
                    list.append(createFolderItem(folder));
                }
            });
            
            currentButtons.forEach(function(btn) {
                list.append(createButtonItem(btn));
            });
            
            // Добавляем кнопки из папки "Смотреть" для возможности их скрытия
            watchFolderButtons.forEach(function(btn) {
                list.append(createButtonItem(btn));
            });
        }

        var resetBtn = $('<div class="selector folder-reset-button">' +
            '<div style="text-align: center; padding: 1em;">' + getTranslation('buttons_plugin_reset_default') + '</div>' +
        '</div>');
        
        resetBtn.on('hover:enter', function() {
            var folders = getFolders();
            
            Lampa.Storage.set('button_custom_order', []);
            Lampa.Storage.set('button_hidden', []);
            Lampa.Storage.set('button_folders', []);
            Lampa.Storage.set('button_item_order', []);
            Lampa.Modal.close();
            Lampa.Noty.show(getTranslation('buttons_plugin_settings_reset'));
            
            setTimeout(function() {
                if (currentContainer) {
                    currentContainer.find('.button--play, .button--edit-order, .button--folder').remove();
                    currentContainer.data('buttons-processed', false);
                    
                    var targetContainer = currentContainer.find('.full-start-new__buttons');
                    var existingButtons = targetContainer.find('.full-start__button').toArray();
                    
                    allButtonsOriginal.forEach(function(originalBtn) {
                        var btnId = getBtnIdentifier(originalBtn);
                        var exists = false;
                        
                        for (var i = 0; i < existingButtons.length; i++) {
                            if (getBtnIdentifier($(existingButtons[i])) === btnId) {
                                exists = true;
                                break;
                            }
                        }
                        
                        if (!exists) {
                            var clonedBtn = originalBtn.clone(true, true);
                            clonedBtn.css({
                                'opacity': '1',
                                'animation': 'none'
                            });
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
            title: getTranslation('buttons_plugin_button_order'),
            html: list,
            size: 'small',
            scroll_to_center: true,
            onBack: function() {
                Lampa.Modal.close();
                ensureWatchFolderFirst();
                applyChanges();
                // Не переключаем контроллер, оставляем фокус в окне настроек
            }
        });
    }

    function reorderButtons(container) {
        var targetContainer = container.find('.full-start-new__buttons');
        if (!targetContainer.length) return false;

        currentContainer = container;
        container.find('.button--play, .button--edit-order, .button--folder').remove();

        var categories = groupBtnsByType(container);
        
        var allButtons = []
            .concat(categories.online)
            .concat(categories.torrent)
            .concat(categories.trailer)
            .concat(categories.shots)
            .concat(categories.book)
            .concat(categories.reaction)
            .concat(categories.subscribe)
            .concat(categories.other);

        allButtons = arrangeBtnsByOrder(allButtons);
        allButtonsCache = allButtons;
        
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }

        // Обеспечиваем наличие папки "Смотреть"
        var watchFolder = ensureWatchFolder();
        var folders = getFolders();
        var buttonsInFolders = [];
        folders.forEach(function(folder) {
            buttonsInFolders = buttonsInFolders.concat(folder.buttons);
        });

        // Проверяем itemOrder - если кнопка там есть, не перемещаем её в папку
        var itemOrder = getItemOrder();
        var buttonsInItemOrder = [];
        itemOrder.forEach(function(item) {
            if (item.type === 'button') {
                buttonsInItemOrder.push(item.id);
            }
        });
        
        // Автоматически перемещаем новые кнопки в папку "Смотреть"
        var watchFolderUpdated = false;
        allButtons.forEach(function(btn) {
            var btnId = getBtnIdentifier(btn);
            
            // Пропускаем кнопки, которые уже в папках
            if (buttonsInFolders.indexOf(btnId) !== -1) {
                return;
            }
            
            // Пропускаем кнопки, которые уже в itemOrder (они на главной странице)
            if (buttonsInItemOrder.indexOf(btnId) !== -1) {
                return;
            }
            
            // Пропускаем кнопки, которые не должны быть в папке "Смотреть"
            if (!shouldMoveToWatchFolder(btn)) {
                return;
            }
            
            // Добавляем кнопку в папку "Смотреть", если её там ещё нет
            if (watchFolder.buttons.indexOf(btnId) === -1) {
                watchFolder.buttons.push(btnId);
                watchFolderUpdated = true;
            }
        });
        
        if (watchFolderUpdated) {
            // Обновляем папку в хранилище
            for (var i = 0; i < folders.length; i++) {
                if (folders[i].id === watchFolder.id) {
                    folders[i] = watchFolder;
                    break;
                }
            }
            setFolders(folders);
            
            // Обновляем список кнопок в папках
            buttonsInFolders = [];
            folders.forEach(function(folder) {
                buttonsInFolders = buttonsInFolders.concat(folder.buttons);
            });
        }

        var filteredButtons = allButtons.filter(function(btn) {
            return buttonsInFolders.indexOf(getBtnIdentifier(btn)) === -1;
        });

        currentButtons = filteredButtons;
        applyBtnVisibility(filteredButtons);

        targetContainer.children().detach();
        
        // Сортируем папки: "Смотреть" всегда первая
        var watchFolderName = getTranslation('buttons_plugin_watch_folder');
        folders.sort(function(a, b) {
            var aIsWatch = a.name === watchFolderName || a.name === 'Смотреть';
            var bIsWatch = b.name === watchFolderName || b.name === 'Смотреть';
            if (aIsWatch && !bIsWatch) return -1;
            if (!aIsWatch && bIsWatch) return 1;
            return 0;
        });
        
        var visibleButtons = [];
        var itemOrder = getItemOrder();
        
        // Сортируем itemOrder: папка "Смотреть" всегда первая
        if (itemOrder.length > 0) {
            var watchFolder = folders.find(function(f) { 
                return f.name === watchFolderName || f.name === 'Смотреть'; 
            });
            if (watchFolder) {
                itemOrder.sort(function(a, b) {
                    var aIsWatch = a.type === 'folder' && a.id === watchFolder.id;
                    var bIsWatch = b.type === 'folder' && b.id === watchFolder.id;
                    if (aIsWatch && !bIsWatch) return -1;
                    if (!aIsWatch && bIsWatch) return 1;
                    return 0;
                });
            }
        }
        
        if (itemOrder.length > 0) {
            var addedFolders = [];
            var addedButtons = [];
            
            itemOrder.forEach(function(item) {
                if (item.type === 'folder') {
                    var folder = folders.find(function(f) { return f.id === item.id; });
                    if (folder) {
                        var folderBtn = createFolderButton(folder);
                        targetContainer.append(folderBtn);
                        visibleButtons.push(folderBtn);
                        addedFolders.push(folder.id);
                    }
                } else if (item.type === 'button') {
                    // Если кнопка в itemOrder, она должна быть на главной странице
                    // Ищем кнопку среди всех кнопок, а не только среди filteredButtons
                    var btn = filteredButtons.find(function(b) { return getBtnIdentifier(b) === item.id; });
                    if (!btn) {
                        // Если кнопка не в filteredButtons, ищем в allButtons (она может быть в папке)
                        btn = allButtons.find(function(b) { return getBtnIdentifier(b) === item.id; });
                        if (btn) {
                            // Клонируем кнопку из оригинальных кнопок
                            var originalBtn = allButtonsOriginal.find(function(b) { 
                                return getBtnIdentifier(b) === item.id; 
                            });
                            if (originalBtn) {
                                btn = originalBtn.clone(true, true);
                                btn.css({ 'opacity': '1', 'animation': 'none' });
                                btn.removeClass('hidden');
                            } else {
                                btn = btn.clone(true, true);
                                btn.css({ 'opacity': '1', 'animation': 'none' });
                                btn.removeClass('hidden');
                            }
                        }
                    }
                    if (btn && !btn.hasClass('hidden')) {
                        targetContainer.append(btn);
                        visibleButtons.push(btn);
                        addedButtons.push(getBtnIdentifier(btn));
                    }
                }
            });
            
            filteredButtons.forEach(function(btn) {
                var btnId = getBtnIdentifier(btn);
                if (addedButtons.indexOf(btnId) === -1 && !btn.hasClass('hidden')) {
                    var insertBefore = null;
                    var btnType = detectBtnCategory(btn);
                    var typeOrder = ['online', 'torrent', 'trailer', 'shots', 'book', 'reaction', 'subscribe', 'other'];
                    var btnTypeIndex = typeOrder.indexOf(btnType);
                    if (btnTypeIndex === -1) btnTypeIndex = 999;
                    
                    if (btnId === 'modss_online_button' || btnId === 'showy_online_button') {
                        var firstNonPriority = targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').filter(function() {
                            var id = getBtnIdentifier($(this));
                            return id !== 'modss_online_button' && id !== 'showy_online_button';
                        }).first();
                        
                        if (firstNonPriority.length) {
                            insertBefore = firstNonPriority;
                        }
                        
                        if (btnId === 'showy_online_button') {
                            var modsBtn = targetContainer.find('.full-start__button').filter(function() {
                                return getBtnIdentifier($(this)) === 'modss_online_button';
                            });
                            if (modsBtn.length) {
                                insertBefore = modsBtn.next();
                                if (!insertBefore.length || insertBefore.hasClass('button--edit-order')) {
                                    insertBefore = null;
                                }
                            }
                        }
                    } else {
                        targetContainer.find('.full-start__button').not('.button--edit-order, .button--folder').each(function() {
                            var existingBtn = $(this);
                            var existingId = getBtnIdentifier(existingBtn);
                            
                            if (existingId === 'modss_online_button' || existingId === 'showy_online_button') {
                                return true;
                            }
                            
                            var existingType = detectBtnCategory(existingBtn);
                            var existingTypeIndex = typeOrder.indexOf(existingType);
                            if (existingTypeIndex === -1) existingTypeIndex = 999;
                            
                            if (btnTypeIndex < existingTypeIndex) {
                                insertBefore = existingBtn;
                                return false;
                            }
                        });
                    }
                    
                    if (insertBefore && insertBefore.length) {
                        btn.insertBefore(insertBefore);
                    } else {
                        targetContainer.append(btn);
                    }
                    visibleButtons.push(btn);
                }
            });
            
            // Добавляем папки, которых нет в itemOrder, но "Смотреть" всегда первая
            var watchFolder = folders.find(function(f) { 
                var watchFolderName = getTranslation('buttons_plugin_watch_folder');
                return f.name === watchFolderName || f.name === 'Смотреть'; 
            });
            if (watchFolder && addedFolders.indexOf(watchFolder.id) === -1) {
                var folderBtn = createFolderButton(watchFolder);
                var firstButton = targetContainer.find('.full-start__button').not('.button--edit-order').first();
                if (firstButton.length) {
                    folderBtn.insertBefore(firstButton);
                } else {
                    targetContainer.prepend(folderBtn);
                }
                visibleButtons.push(folderBtn);
                addedFolders.push(watchFolder.id);
            }
            
            folders.forEach(function(folder) {
                if (addedFolders.indexOf(folder.id) === -1) {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
        } else {
            // Если itemOrder пустой, сначала отображаем папку "Смотреть", потом остальные папки, потом кнопки
            var watchFolder = folders.find(function(f) { 
                var watchFolderName = getTranslation('buttons_plugin_watch_folder');
                return f.name === watchFolderName || f.name === 'Смотреть'; 
            });
            if (watchFolder) {
                var folderBtn = createFolderButton(watchFolder);
                targetContainer.append(folderBtn);
                visibleButtons.push(folderBtn);
            }
            
            folders.forEach(function(folder) {
                var watchFolderName = getTranslation('buttons_plugin_watch_folder');
                if (folder.name !== watchFolderName && folder.name !== 'Смотреть') {
                    var folderBtn = createFolderButton(folder);
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            });
            
            filteredButtons.forEach(function(btn) {
                if (!btn.hasClass('hidden')) {
                    targetContainer.append(btn);
                    visibleButtons.push(btn);
                }
            });
            
            // Если папка "Смотреть" создана, но её нет в itemOrder, добавляем
            var watchFolderName = getTranslation('buttons_plugin_watch_folder');
            var watchFolder = folders.find(function(f) { return f.name === watchFolderName || f.name === 'Смотреть'; });
            if (watchFolder && watchFolder.buttons.length > 0) {
                var existsInOrder = itemOrder.some(function(item) {
                    return item.type === 'folder' && item.id === watchFolder.id;
                });
                if (!existsInOrder) {
                    itemOrder.push({
                        type: 'folder',
                        id: watchFolder.id
                    });
                    setItemOrder(itemOrder);
                }
            }
        }

        var editButton = buildEditorBtn();
        targetContainer.append(editButton);
        visibleButtons.push(editButton);

        // Применяем режим отображения
        var viewmode = Lampa.Storage.get('buttons_viewmode', 'default');
        targetContainer.removeClass('icons-only always-text');
        if (viewmode === 'icons') targetContainer.addClass('icons-only');
        if (viewmode === 'always') targetContainer.addClass('always-text');

        animateBtnFadeIn(visibleButtons);
        
        setTimeout(function() {
            setupButtonNavigation(container);
        }, 100);

        return true;
    }

    function setupButtonNavigation(container) {
        // Lampa автоматически обрабатывает навигацию для flex-wrap: wrap
        // Не переключаем контроллер, чтобы не уходить из диалога настроек
        // Просто обновляем навигацию если нужно
    }

    function refreshController() {
        if (!Lampa.Controller || typeof Lampa.Controller.toggle !== 'function') return;
        
        // Не переключаем контроллер, чтобы не уходить из диалога настроек
        // Просто обновляем навигацию если нужно
        if (currentContainer) {
            setTimeout(function() {
                setupButtonNavigation(currentContainer);
            }, 100);
        }
    }

    function init() {
        var style = $('<style>' +
            '@keyframes button-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }' +
            '.full-start-new__buttons .full-start__button { opacity: 0; }' +
            '.full-start__button.hidden { display: none !important; }' +
            '.button--folder { cursor: pointer; }' +
            '.full-start-new__buttons { ' +
                'display: flex !important; ' +
                'flex-direction: row !important; ' +
                'flex-wrap: wrap !important; ' +
                'gap: 0.5em !important; ' +
            '}' +
            '.full-start-new__buttons.buttons-loading .full-start__button { visibility: hidden !important; }' +
            '.menu-edit-list__create-folder { background: rgba(100,200,100,0.2); }' +
            '.menu-edit-list__create-folder.focus { background: rgba(100,200,100,0.3); border: 3px solid rgba(255,255,255,0.8); }' +
            '.full-start-new__buttons.icons-only .full-start__button span { display: none; }' +
            '.full-start-new__buttons.always-text .full-start__button span { display: block !important; }' +
            '.viewmode-switch { background: rgba(100,100,255,0.3); margin: 0.5em 0 1em 0; border-radius: 0.3em; }' +
            '.viewmode-switch.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__item-hidden { opacity: 0.4 !important; }' +
            '.menu-edit-list__item.hidden { display: block !important; opacity: 0.4 !important; }' +
            '.menu-edit-list__delete { width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; cursor: pointer; }' +
            '.menu-edit-list__delete svg { width: 1.2em !important; height: 1.2em !important; }' +
            '.menu-edit-list__delete.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.folder-item .menu-edit-list__move { margin-right: 0; }' +
            '.folder-create-confirm { background: rgba(100,200,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-create-confirm.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.folder-reset-button { background: rgba(200,100,100,0.3); margin-top: 1em; border-radius: 0.3em; }' +
            '.folder-reset-button.focus { border: 3px solid rgba(255,255,255,0.8); }' +
            '.menu-edit-list__toggle.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
            '.menu-edit-list__move-out, .menu-edit-list__move-in { width: 2.4em; height: 2.4em; display: flex; align-items: center; justify-content: center; cursor: pointer; margin-left: 0.5em; }' +
            '.menu-edit-list__move-out svg, .menu-edit-list__move-in svg { width: 1.2em !important; height: 1.2em !important; }' +
            '.menu-edit-list__move-out.focus, .menu-edit-list__move-in.focus { border: 2px solid rgba(255,255,255,0.8); border-radius: 0.3em; }' +
        '</style>');
        $('body').append(style);

        // Обеспечиваем наличие папки "Смотреть" при инициализации
        ensureWatchFolder();

        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;

            var container = e.object.activity.render();
            var targetContainer = container.find('.full-start-new__buttons');
            if (targetContainer.length) {
                targetContainer.addClass('buttons-loading');
            }

            setTimeout(function() {
                try {
                    if (!container.data('buttons-processed')) {
                        container.data('buttons-processed', true);
                        // Обеспечиваем наличие папки "Смотреть" перед обработкой
                        ensureWatchFolder();
                        if (reorderButtons(container)) {
                            if (targetContainer.length) {
                                targetContainer.removeClass('buttons-loading');
                            }
                            refreshController();
                            
                            // Устанавливаем фокус на кнопку "Смотреть"
                            setTimeout(function() {
                                var watchFolderName = getTranslation('buttons_plugin_watch_folder');
                                var folders = getFolders();
                                var watchFolder = folders.find(function(f) { 
                                    return f.name === watchFolderName || f.name === 'Смотреть'; 
                                });
                                
                                if (watchFolder) {
                                    var watchFolderBtn = targetContainer.find('.button--folder[data-folder-id="' + watchFolder.id + '"]');
                                    if (watchFolderBtn.length && watchFolderBtn.hasClass('selector')) {
                                        try {
                                            // Устанавливаем фокус на кнопку "Смотреть"
                                            // Сначала пытаемся через нативный focus
                                            watchFolderBtn[0].focus();
                                            
                                            // Затем через Lampa Controller если доступно
                                            if (Lampa.Controller) {
                                                if (typeof Lampa.Controller.active === 'function') {
                                                    Lampa.Controller.active(watchFolderBtn[0]);
                                                } else if (typeof Lampa.Controller.toggle === 'function') {
                                                    // Переключаем контроллер и устанавливаем фокус
                                                    Lampa.Controller.toggle('full_start');
                                                    setTimeout(function() {
                                                        watchFolderBtn[0].focus();
                                                    }, 50);
                                                }
                                            }
                                        } catch(e) {
                                            // Игнорируем ошибки фокуса
                                        }
                                    }
                                }
                            }, 200);
                        }
                    }
                } catch(err) {
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, 400);
        });
    }

    // Добавляем настройку в раздел "Интерфейс"
    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addParam({
            component: 'interface',
            param: {
                name: 'buttons_editor_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: getTranslation('buttons_plugin_button_editor')
            },
            onChange: function(value) {
                setTimeout(function() {
                    var currentValue = Lampa.Storage.get('buttons_editor_enabled', true);
                    if (currentValue) {
                        $('.button--edit-order').show();
                        Lampa.Noty.show(getTranslation('buttons_plugin_button_editor_enabled'));
                    } else {
                        $('.button--edit-order').hide();
                        Lampa.Noty.show(getTranslation('buttons_plugin_button_editor_disabled'));
                    }
                }, 100);
            },
            onRender: function(element) {
                setTimeout(function() {
                    // Вставляем после "Показать реакции" в разделе "Карточка"
                    var reactionsParam = $('div[data-name="card_interfice_reactions"]');
                    if (reactionsParam.length) {
                        reactionsParam.after(element);
                    } else {
                        // Fallback: вставляем после "Размер интерфейса" как в buttons2
                        $('div[data-name="interface_size"]').after(element);
                    }
                }, 0);
            }
        });
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
