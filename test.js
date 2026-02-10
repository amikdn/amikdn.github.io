//(function() {
//    'use strict';
//
//    const fixedUnicId = 'raxmind';
   // const fixedLampaUid = 'xgGax1Fs';

//    Lampa.Listener.follow('app', function(e) {
//        if (e.type === 'ready') {
//            Lampa.Storage.set('lampac_unic_id', fixedUnicId);
      //      Lampa.Storage.set('lampa_uid', fixedLampaUid);
      //      Lampa.Storage.set('platform', 'browser');
      //      console.log('ID и platform установлены:', fixedUnicId, fixedLampaUid, 'browser');
//        }
//    });

//})();

(function() {
    'use strict';

    // Polyfills
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            if (arguments.length > 1) T = thisArg;
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype.filter = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var res = [];
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O) {
                    var kValue = O[k];
                    if (callback.call(T, kValue, k, O)) res.push(kValue);
                }
                k++;
            }
            return res;
        };
    }

    if (!Array.prototype.find) {
        Array.prototype.find = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                var kValue = O[k];
                if (callback.call(T, kValue, k, O)) return kValue;
                k++;
            }
            return undefined;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype.some = function(callback, thisArg) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            var T = thisArg;
            var k = 0;
            while (k < len) {
                if (k in O && callback.call(T, O[k], k, O)) return true;
                k++;
            }
            return false;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {
            if (this == null) throw new TypeError('this is null or not defined');
            var O = Object(this);
            var len = O.length >>> 0;
            if (len === 0) return -1;
            var n = fromIndex | 0;
            if (n >= len) return -1;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in O && O[k] === searchElement) return k;
                k++;
            }
            return -1;
        };
    }

    // Иконки
    var LAMPAC_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"></path></svg>';
    var FOLDER_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>';
    var FOLDER_OPEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>';
    var EXCLUDED_CLASSES = ['button--play', 'button--edit-order'];
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

    // --- Работа с папками ---
    function getFolders() {
        return Lampa.Storage.get('button_folders', []);
    }

    function setFolders(folders) {
        Lampa.Storage.set('button_folders', folders);
    }

    function isFolder(id) {
        return id && id.toString().indexOf('folder_') === 0;
    }

    function getFolder(id) {
        var folders = getFolders();
        return folders.find(function(f) { return f.id === id; });
    }

    function createFolder(name) {
        var folders = getFolders();
        var newFolder = {
            id: 'folder_' + Date.now(),
            name: name || 'Новая папка',
            items: []
        };
        folders.push(newFolder);
        setFolders(folders);
        
        // Добавляем папку в конец общего порядка
        var order = getCustomOrder();
        order.push(newFolder.id);
        setCustomOrder(order);
        
        return newFolder;
    }

    function addButtonsToFolder(folderId, btnIds) {
        var folders = getFolders();
        var folder = folders.find(function(f) { return f.id === folderId; });
        if (folder) {
            btnIds.forEach(function(id) {
                if (folder.items.indexOf(id) === -1) {
                    folder.items.push(id);
                }
            });
            setFolders(folders);
            // Удаляем из общего порядка, если были там
            var order = getCustomOrder();
            var newOrder = order.filter(function(id) { return btnIds.indexOf(id) === -1; });
            setCustomOrder(newOrder);
        }
    }

    function removeButtonFromFolder(folderId, btnId) {
        var folders = getFolders();
        var folder = folders.find(function(f) { return f.id === folderId; });
        if (folder) {
            folder.items = folder.items.filter(function(id) { return id !== btnId; });
            setFolders(folders);
            // Возвращаем в конец общего порядка
            var order = getCustomOrder();
            if (order.indexOf(btnId) === -1) {
                order.push(btnId);
                setCustomOrder(order);
            }
        }
    }

    function deleteFolder(folderId) {
        var folders = getFolders();
        var folder = folders.find(function(f) { return f.id === folderId; });
        if (folder) {
            // Возвращаем все кнопки на место
            if (folder.items && folder.items.length) {
                var order = getCustomOrder();
                folder.items.forEach(function(id) {
                    if (order.indexOf(id) === -1) order.push(id);
                });
                setCustomOrder(order);
            }
            // Удаляем папку из списка и порядка
            var newFolders = folders.filter(function(f) { return f.id !== folderId; });
            setFolders(newFolders);
            var newOrder = getCustomOrder().filter(function(id) { return id !== folderId; });
            setCustomOrder(newOrder);
        }
    }
    // -----------------------------

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
        var allButtons = container.find('.full-start__button').not('.button--edit-order, .button--play');
        var categories = { online: [], torrent: [], trailer: [], favorite: [], subscribe: [], book: [], reaction: [], other: [] };
        var processedIds = {};
        allButtons.each(function() {
            var $btn = $(this);
            if (isExcluded($btn)) return;
            var btnId = getButtonId($btn);
            if (processedIds[btnId]) return;
            processedIds[btnId] = true;
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
            if (!$btn.hasClass('selector')) {
                $btn.addClass('selector');
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
            if (id === 'modss_online_button') {
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
            // Пропускаем папки при сортировке обычных кнопок
            if (isFolder(id)) return; 
            
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

    function applyHiddenButtons(buttons) {
        var hidden = getHiddenButtons();
        buttons.forEach(function(btn) {
            var id = getButtonId(btn);
            btn.toggleClass('hidden', hidden.indexOf(id) !== -1);
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
        // Сохраняем только ID, не объекты папок
        currentButtons.forEach(function(item) {
            if (typeof item === 'string') {
                order.push(item);
            } else if (item.jquery) {
                order.push(getButtonId(item));
            }
        });
        setCustomOrder(order);
    }

    // --- Открытие содержимого папки на главном экране ---
    function openFolderView(folderId) {
        var folder = getFolder(folderId);
        if (!folder) return;

        var html = $('<div class="folder-view-modal"></div>');
        var title = $('<div style="font-size: 1.4em; padding: 1em; text-align: center;">' + FOLDER_ICON + ' ' + folder.name + '</div>');
        var list = $('<div class="simple-list"></div>');
        
        list.css({
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '0.5em'
        });

        // Собираем кнопки из папки
        var folderBtns = [];
        folder.items.forEach(function(btnId) {
            var btn = findButton(btnId);
            if (btn) {
                var clone = btn.clone(true, true);
                clone.removeClass('hidden');
                clone.css({'order': 'initial', 'opacity': '1', 'animation': 'none'});
                clone.css('margin', '0');
                folderBtns.push(clone);
            }
        });

        var sortedFolderBtns = [];
        folder.items.forEach(function(id) {
            var b = folderBtns.find(function(cb) { return getButtonId(cb) === id; });
            if (b) sortedFolderBtns.push(b);
        });

        sortedFolderBtns.forEach(function(b) {
            list.append(b);
        });

        if (sortedFolderBtns.length === 0) {
            list.append('<div style="text-align:center; padding: 2em; color: #777;">Папка пуста</div>');
        }

        html.append(title);
        html.append(list);

        Lampa.Modal.open({
            title: '',
            html: html,
            size: 'medium',
            onBack: function() {
                Lampa.Modal.close();
            }
        });
    }

    function applyChanges() {
        if (!currentContainer) return;
        
        var displayItems = [];
        var folders = getFolders();
        var customOrder = getCustomOrder();

        var idsInFolders = [];
        folders.forEach(function(f) {
            idsInFolders = idsInFolders.concat(f.items);
        });

        customOrder.forEach(function(id) {
            if (isFolder(id)) {
                displayItems.push(id); 
            } else if (idsInFolders.indexOf(id) === -1) {
                var btn = findButton(id);
                if (btn) displayItems.push(btn);
            }
        });

        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allRealButtons = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);

            allRealButtons.forEach(function(btn) {
                var id = getButtonId(btn);
                if (displayItems.indexOf(btn) === -1 && idsInFolders.indexOf(id) === -1) {
                     var exists = displayItems.some(function(item) {
                         return !isFolder(item) && getButtonId(item) === id;
                     });
                     if (!exists) displayItems.push(btn);
                }
            });
        }

        allButtonsCache = displayItems.filter(function(i) { return !isFolder(i); }); 
        currentButtons = displayItems; 

        var targetContainer = currentContainer.find('.full-start-new__buttons');
        if (!targetContainer.length) return;
        
        targetContainer.find('.full-start__button').not('.button--edit-order').detach();
        
        var visibleButtons = [];

        currentButtons.forEach(function(item) {
            if (isFolder(item)) {
                var folder = getFolder(item);
                if (folder) {
                    var folderBtn = $('<div class="full-start__button selector button-folder">' + 
                        '<div class="full-start__button__icon">' + FOLDER_ICON + '</div>' +
                        '<span>' + folder.name + '</span>' +
                    '</div>');
                    folderBtn.on('hover:enter', function() {
                        openFolderView(item);
                    });
                    targetContainer.append(folderBtn);
                    visibleButtons.push(folderBtn);
                }
            } else {
                targetContainer.append(item);
                if (!item.hasClass('hidden')) visibleButtons.push(item);
            }
        });

        applyButtonAnimation(visibleButtons);
        
        // --- ИСПРАВЛЕНИЕ: Создание кнопки редактора ---
        var editBtn = targetContainer.find('.button--edit-order');
        if (editBtn.length) {
            editBtn.detach();
            targetContainer.append(editBtn);
        } else {
            // Если кнопки нет, создаем её
            editBtn = createEditButton();
            targetContainer.append(editBtn);
        }
        visibleButtons.push(editBtn); // Добавляем в навигацию
        // ------------------------------------------------

        applyHiddenButtons(allButtonsCache); 
        
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
            if (typeof otherBtn !== 'string' && otherBtn.find('span').text().trim() === text) {
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

    function openFolderEditModal(folderId) {
        var folder = getFolder(folderId);
        if (!folder) return;

        var list = $('<div class="menu-edit-list"></div>');
        var header = $('<div style="text-align:center; padding:1em; font-weight:bold;">' + folder.name + ' <span style="opacity:0.7; font-weight:normal; font-size:0.8em">(Сортировка)</span></div>');
        list.append(header);

        var folderItemsBtns = [];
        folder.items.forEach(function(id) {
            var btn = findButton(id);
            if (btn) folderItemsBtns.push(btn);
        });

        function createSubItem(btn) {
            var displayName = getButtonDisplayName(btn, folderItemsBtns);
            var icon = btn.find('svg').clone();
            var btnId = getButtonId(btn);
            
            var item = $('<div class="menu-edit-list__item">' +
                '<div class="menu-edit-list__icon"></div>' +
                '<div class="menu-edit-list__title">' + displayName + '</div>' +
                '<div class="menu-edit-list__move move-up selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
                '</div>' +
                '<div class="menu-edit-list__move move-down selector">' +
                '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
                '</div>' +
                '<div class="menu-edit-list__action remove-from-folder selector" style="color: #ff6b6b">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
                '</div>' +
                '</div>');
            
            item.find('.menu-edit-list__icon').append(icon);
            item.data('buttonId', btnId);

            item.find('.move-up').on('hover:enter', function() {
                var idx = folder.items.indexOf(btnId);
                if (idx > 0) {
                    folder.items.splice(idx, 1);
                    folder.items.splice(idx - 1, 0, btnId);
                    setFolders(getFolders()); 
                    Lampa.Modal.close(); 
                    openFolderEditModal(folderId);
                }
            });

            item.find('.move-down').on('hover:enter', function() {
                var idx = folder.items.indexOf(btnId);
                if (idx < folder.items.length - 1) {
                    folder.items.splice(idx, 1);
                    folder.items.splice(idx + 1, 0, btnId);
                    setFolders(getFolders());
                    Lampa.Modal.close();
                    openFolderEditModal(folderId);
                }
            });

            item.find('.remove-from-folder').on('hover:enter', function() {
                removeButtonFromFolder(folderId, btnId);
                Lampa.Modal.close();
                openFolderEditModal(folderId);
            });

            return item;
        }

        folderItemsBtns.forEach(function(btn) {
            list.append(createSubItem(btn));
        });
        
        if (folderItemsBtns.length === 0) {
             list.append('<div style="text-align:center; padding:1em; opacity:0.5">Пусто</div>');
        }

        Lampa.Modal.open({
            title: '',
            html: list,
            size: 'small',
            onBack: function() {
                Lampa.Modal.close();
                openEditDialog(); 
            }
        });
    }

    function openEditDialog() {
        var folders = getFolders();
        var idsInFolders = [];
        folders.forEach(function(f) { idsInFolders = idsInFolders.concat(f.items); });
        
        if (currentContainer) {
            var categories = categorizeButtons(currentContainer);
            var allRealButtons = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);
            
            var uniqueRealButtons = [];
            var seen = {};
            allRealButtons.forEach(function(b) {
                var id = getButtonId(b);
                if(!seen[id]) { seen[id]=true; uniqueRealButtons.push(b); }
            });

            var displayList = [];
            var customOrder = getCustomOrder();

            customOrder.forEach(function(id) {
                if (isFolder(id)) {
                    displayList.push(id);
                } else if (idsInFolders.indexOf(id) === -1) {
                    var btn = uniqueRealButtons.find(function(b) { return getButtonId(b) === id; });
                    if (btn) displayList.push(btn);
                }
            });

            uniqueRealButtons.forEach(function(btn) {
                var id = getButtonId(btn);
                if (displayList.indexOf(btn) === -1 && idsInFolders.indexOf(id) === -1) {
                     var exists = displayList.some(function(i) { return !isFolder(i) && getButtonId(i) === id; });
                     if (!exists) displayList.push(btn);
                }
            });
            
            allButtonsCache = displayList.filter(function(i){return !isFolder(i);});
            currentButtons = displayList;
        }

        var list = $('<div class="menu-edit-list"></div>');
        var hidden = getHiddenButtons();
        var modes = ['default', 'icons', 'always'];
        var labels = {default: 'Стандартный', icons: 'Только иконки', always: 'С текстом'};
        var currentMode = Lampa.Storage.get('buttons_viewmode', 'default');

        var createFolderBtn = $('<div class="selector" style="background: rgba(100, 200, 100, 0.3); padding: 1em; text-align: center; margin-bottom: 0.5em; border-radius: 0.3em;">+ Создать папку</div>');
        createFolderBtn.on('hover:enter', function() {
            Lampa.Input.edit({
                value: '',
                title: 'Название папки'
            }, function(new_name) {
                if (new_name) {
                    createFolder(new_name);
                    Lampa.Modal.close();
                    setTimeout(openEditDialog, 100);
                }
            });
        });
        list.append(createFolderBtn);

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

        function createButtonItem(item) {
            var isItFolder = isFolder(item);
            var displayName, icon, itemEl;

            if (isItFolder) {
                var folder = getFolder(item);
                displayName = folder.name;
                icon = $(FOLDER_OPEN_ICON);
                var count = folder.items ? folder.items.length : 0;
                displayName += ' <span style="opacity:0.5; font-size:0.8em">(' + count + ')</span>';
            } else {
                displayName = getButtonDisplayName(item, currentButtons.filter(function(i){return !isFolder(i);}));
                icon = item.find('svg').clone();
            }

            var itemHtml = '<div class="menu-edit-list__icon"></div><div class="menu-edit-list__title">' + displayName + '</div>';
            
            var controls = '';
            
            if (isItFolder) {
                 controls += '<div class="menu-edit-list__action delete-folder selector" style="color: #ff6b6b">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
                    '</div>';
                 controls += '<div class="menu-edit-list__action enter-folder selector" style="color: #4dabf7">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>' +
                    '</div>';
            } else {
                var btnId = getButtonId(item);
                var isHidden = hidden.indexOf(btnId) !== -1;
                
                controls += '<div class="menu-edit-list__move move-up selector">' +
                    '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
                    '</div>' +
                    '<div class="menu-edit-list__move move-down selector">' +
                    '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
                    '</div>' +
                    '<div class="menu-edit-list__toggle toggle selector">' +
                    '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<rect x="1.89111" y="1.78369" width="21.793" height="21.793" rx="3.5" stroke="currentColor" stroke-width="3"/>' +
                    '<path d="M7.44873 12.9658L10.8179 16.3349L18.1269 9.02588" stroke="currentColor" stroke-width="3" class="dot" opacity="' + (isHidden ? '0' : '1') + '" stroke-linecap="round"/>' +
                    '</svg>' +
                    '</div>';
                
                controls += '<div class="menu-edit-list__action move-to-folder selector" title="Переместить в папку">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>' +
                    '</div>';
            }

            itemEl = $('<div class="menu-edit-list__item">' + itemHtml + controls + '</div>');
            itemEl.find('.menu-edit-list__icon').append(icon);
            
            if (isItFolder) {
                itemEl.data('folderId', item);
                
                itemEl.find('.delete-folder').on('hover:enter', function() {
                    Lampa.Confirm.show('Удалить папку?', 'Все кнопки из папки вернутся в общий список.', function(){
                        deleteFolder(item);
                        Lampa.Modal.close();
                        setTimeout(openEditDialog, 100);
                    });
                });

                itemEl.on('hover:enter', function(e) {
                    if ($(e.target).closest('.delete-folder').length) return;
                    Lampa.Modal.close();
                    setTimeout(function(){
                        openFolderEditModal(item);
                    }, 100);
                });
                itemEl.find('.enter-folder').on('hover:enter', function(e) {
                     e.stopPropagation();
                     Lampa.Modal.close();
                     setTimeout(function(){
                        openFolderEditModal(item);
                    }, 100);
                });

            } else {
                itemEl.data('button', item);
                var btnId = getButtonId(item);
                itemEl.toggleClass('menu-edit-list__item-hidden', hidden.indexOf(btnId) !== -1);

                itemEl.find('.move-up').on('hover:enter', function() {
                    var prev = itemEl.prev();
                    while (prev.length && (prev.hasClass('viewmode-switch') || prev.hasClass('folder-create-btn') || prev.find('.delete-folder').length)) {
                        prev = prev.prev();
                    }
                    if (prev.length && !prev.hasClass('viewmode-switch') && !prev.hasClass('folder-create-btn')) {
                        itemEl.insertBefore(prev);
                        var btnIndex = currentButtons.indexOf(item);
                        if (btnIndex > 0) {
                            currentButtons.splice(btnIndex, 1);
                            currentButtons.splice(btnIndex - 1, 0, item);
                        }
                        saveOrder();
                    }
                });
                
                itemEl.find('.move-down').on('hover:enter', function() {
                    var next = itemEl.next();
                    while (next.length && next.hasClass('folder-reset-button')) {
                        next = next.next();
                    }
                    if (next.length && !next.hasClass('folder-reset-button')) {
                        itemEl.insertAfter(next);
                        var btnIndex = currentButtons.indexOf(item);
                        if (btnIndex < currentButtons.length - 1) {
                            currentButtons.splice(btnIndex, 1);
                            currentButtons.splice(btnIndex + 1, 0, item);
                        }
                        saveOrder();
                    }
                });

                itemEl.find('.toggle').on('hover:enter', function() {
                    var isNowHidden = !itemEl.hasClass('menu-edit-list__item-hidden');
                    itemEl.toggleClass('menu-edit-list__item-hidden', isNowHidden);
                    item.toggleClass('hidden', isNowHidden);
                    itemEl.find('.dot').attr('opacity', isNowHidden ? '0' : '1');
                    var hiddenList = getHiddenButtons();
                    var index = hiddenList.indexOf(btnId);
                    if (isNowHidden && index === -1) {
                        hiddenList.push(btnId);
                    } else if (!isNowHidden && index !== -1) {
                        hiddenList.splice(index, 1);
                    }
                    setHiddenButtons(hiddenList);
                });

                itemEl.find('.move-to-folder').on('hover:enter', function() {
                    var folders = getFolders();
                    if (folders.length === 0) {
                        Lampa.Noty.show('Сначала создайте папку');
                        return;
                    }

                    var folderList = $('<div class="simple-list"></div>');
                    
                    var rootItem = $('<div class="selector" style="padding:1em; border-bottom:1px solid #333;">На главную (в корень)</div>');
                    rootItem.on('hover:enter', function() {
                        var currentFolders = getFolders();
                        var foundIn = false;
                        currentFolders.forEach(function(f) {
                            if (f.items.indexOf(btnId) !== -1) {
                                removeButtonFromFolder(f.id, btnId);
                                foundIn = true;
                            }
                        });
                        if(!foundIn) {
                        }
                        Lampa.Modal.close();
                        setTimeout(openEditDialog, 100);
                    });
                    folderList.append(rootItem);

                    folders.forEach(function(f) {
                        var fItem = $('<div class="selector" style="padding:1em; display:flex; align-items:center;">' + 
                            '<span style="margin-right:10px">' + FOLDER_ICON + '</span>' + 
                            f.name + 
                        '</div>');
                        fItem.on('hover:enter', function() {
                            addButtonsToFolder(f.id, [btnId]);
                            Lampa.Modal.close();
                            setTimeout(openEditDialog, 100);
                        });
                        folderList.append(fItem);
                    });

                    Lampa.Modal.open({
                        title: 'Выберите папку',
                        html: folderList,
                        size: 'small',
                        onBack: function() { Lampa.Modal.close(); }
                    });
                });
            }
            return itemEl;
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
            Lampa.Storage.set('button_folders', []); 
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
        container.find('.button--play, .button--edit-order').remove();
        var categories = categorizeButtons(container);
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
        if (allButtonsOriginal.length === 0) {
            allButtons.forEach(function(btn) {
                allButtonsOriginal.push(btn.clone(true, true));
            });
        }
        
        currentButtons = allButtons; 
        
        var existingButtons = targetContainer.find('.full-start__button').not('.button--edit-order').toArray();
        var missingButtons = [];
        existingButtons.forEach(function(existingBtn) {
            var $existingBtn = $(existingBtn);
            if (isExcluded($existingBtn)) return;
            var existingId = getButtonId($existingBtn);
            var found = false;
            for (var i = 0; i < allButtons.length; i++) {
                if (getButtonId(allButtons[i]) === existingId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                missingButtons.push($existingBtn);
            }
        });
        if (missingButtons.length > 0) {
            var seenIds = {};
            allButtons.forEach(function(btn) {
                seenIds[getButtonId(btn)] = true;
            });
            missingButtons.forEach(function($btn) {
                var btnId = getButtonId($btn);
                if (seenIds[btnId]) return;
                seenIds[btnId] = true;
                var type = getButtonType($btn);
                if (categories[type]) {
                    categories[type].push($btn);
                } else {
                    categories.other.push($btn);
                }
                if (!$btn.hasClass('selector')) {
                    $btn.addClass('selector');
                }
            });
            var uniqueButtons = [];
            seenIds = {};
            var allButtonsNew = []
                .concat(categories.online)
                .concat(categories.torrent)
                .concat(categories.trailer)
                .concat(categories.favorite)
                .concat(categories.subscribe)
                .concat(categories.book)
                .concat(categories.reaction)
                .concat(categories.other);
            allButtonsNew.forEach(function(btn) {
                var btnId = getButtonId(btn);
                if (!seenIds[btnId]) {
                    seenIds[btnId] = true;
                    uniqueButtons.push(btn);
                }
            });
            allButtons = sortByCustomOrder(uniqueButtons);
            currentButtons = allButtons;
        }
        
        applyChanges(); 
        
        return true;
    }

    window.reorderButtons = reorderButtons;

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
            '.full-start__button.button-folder { flex-direction: column; justify-content: center; background: rgba(255,255,255,0.1); min-width: 80px; }' +
            '.full-start__button.button-folder .full-start__button__icon { margin-bottom: 5px; }' +
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
            '.menu-edit-list__action { padding: 0.5em; display: flex; align-items: center; }' +
            '.menu-edit-list__action svg { fill: currentColor; }' +
            '</style>');
        $('body').append(style);

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
                        if (reorderButtons(container)) {
                            if (targetContainer.length) {
                                targetContainer.removeClass('buttons-loading');
                            }
                            refreshController();
                        }
                    } else {
                        setTimeout(function() {
                            if (container.data('buttons-processed')) {
                                var newButtons = targetContainer.find('.full-start__button').not('.button--edit-order, .button--play, .button-folder');
                                var hasNewButtons = false;
                                newButtons.each(function() {
                                    var $btn = $(this);
                                    if (isExcluded($btn)) return;
                                    var found = false;
                                    for (var i = 0; i < currentButtons.length; i++) {
                                        if (typeof currentButtons[i] !== 'string' && getButtonId(currentButtons[i]) === getButtonId($btn)) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        hasNewButtons = true;
                                    }
                                });
                                if (hasNewButtons) {
                                    reorderButtons(container);
                                }
                            }
                        }, 600);
                    }
                } catch(err) {
                    if (targetContainer.length) {
                        targetContainer.removeClass('buttons-loading');
                    }
                }
            }, 400);
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
    }

    init();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {};
    }
})();
