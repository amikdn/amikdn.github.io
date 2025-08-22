(function () {
    'use strict';

    var RefineFilter = {
        name: 'refine_filter',
        version: '1.0.2',
        debug: true, // Включена отладка для диагностики
        settings: {
            enabled: true,
            refine_values: []
        }
    };

    function log(message) {
        if (RefineFilter.debug) console.log('[RefineFilter] ' + message);
    }

    function addRefineFilter() {
        log('Инициализация фильтра "Уточнить"');
        // Ждем загрузки интерфейса фильтров
        Lampa.Listener.follow('filter', function (e) {
            if (e.type === 'open' || e.type === 'render') {
                log('Событие filter: ' + e.type);
                setTimeout(function () {
                    // Поиск элемента "Качество"
                    var qualityItem = $('.selectbox-item__title').filter(function () {
                        return $(this).text().trim() === 'Качество';
                    }).closest('.selectbox-item.selector');

                    if (!qualityItem.length) {
                        log('Элемент "Качество" не найден, пробуем альтернативный селектор');
                        qualityItem = $('.selectbox-item.selector').has('.selectbox-item__subtitle:contains("Любое")').first();
                    }

                    if (!qualityItem.length) {
                        console.warn('[RefineFilter] Элемент "Качество" не найден в меню фильтров');
                        return;
                    }

                    log('Элемент "Качество" найден');

                    // Проверяем, не добавлен ли уже наш фильтр
                    if (qualityItem.next().hasClass('refine-filter')) {
                        log('Фильтр "Уточнить" уже добавлен');
                        return;
                    }

                    // Создаем новый элемент фильтра "Уточнить"
                    var refineItem = $('<div class="selectbox-item selector refine-filter">' +
                        '<div class="selectbox-item__title">Уточнить</div>' +
                        '<div class="selectbox-item__subtitle">Не выбрано</div>' +
                    '</div>');

                    // Вставляем после "Качество"
                    qualityItem.after(refineItem);
                    log('Элемент "Уточнить" добавлен в DOM');

                    // Создаем подменю для "Уточнить"
                    var refineSubmenu = $('<div class="selectbox__content layer--height refine-submenu" style="display: none; height: 953px;">' +
                        '<div class="selectbox__head">' +
                            '<div class="selectbox__title">Уточнить</div>' +
                        '</div>' +
                        '<div class="selectbox__body layer--wheight" style="max-height: unset; height: 906.453px;">' +
                            '<div class="scroll scroll--mask scroll--over">' +
                                '<div class="scroll__content">' +
                                    '<div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">' +
                                        '<div class="selectbox-item selector">' +
                                            '<div class="selectbox-item__title">Любое</div>' +
                                        '</div>' +
                                        '<div class="selectbox-item selector selectbox-item--checkbox">' +
                                            '<div class="selectbox-item__title">WEB-DL</div>' +
                                            '<div class="selectbox-item__checkbox"></div>' +
                                        '</div>' +
                                        '<div class="selectbox-item selector selectbox-item--checkbox">' +
                                            '<div class="selectbox-item__title">BDRip</div>' +
                                            '<div class="selectbox-item__checkbox"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>');

                    // Добавляем подменю в DOM
                    refineItem.append(refineSubmenu);
                    log('Подменю "Уточнить" добавлено');

                    // Получаем элементы для взаимодействия
                    var subtitle = refineItem.find('.selectbox-item__subtitle');
                    var submenu = refineItem.find('.refine-submenu');
                    var checkboxes = submenu.find('.selectbox-item--checkbox');
                    var anyOption = submenu.find('.selectbox-item:not(.selectbox-item--checkbox)');

                    // Обработчик открытия подменю
                    refineItem.on('hover:enter', function () {
                        log('Открытие подменю "Уточнить"');
                        submenu.show();
                        Lampa.Controller.enable('selectbox');
                        submenu.find('.selectbox-item').first().addClass('focus');
                    });

                    // Обработчик выбора "Любое"
                    anyOption.on('hover:enter', function () {
                        log('Выбрано "Любое"');
                        RefineFilter.settings.refine_values = [];
                        subtitle.text('Не выбрано');
                        Lampa.Storage.set('refine_filter_values', []);
                        applyRefineFilter();
                        submenu.hide();
                        Lampa.Controller.toggle('filter');
                    });

                    // Обработчик выбора чекбоксов
                    checkboxes.each(function () {
                        var checkbox = $(this);
                        var title = checkbox.find('.selectbox-item__title').text();
                        var checkboxEl = checkbox.find('.selectbox-item__checkbox');

                        checkbox.on('hover:enter', function () {
                            log('Выбран формат: ' + title);
                            var isChecked = checkboxEl.hasClass('active');
                            checkboxEl.toggleClass('active', !isChecked);

                            var values = RefineFilter.settings.refine_values;
                            if (!isChecked) {
                                if (!values.includes(title)) values.push(title);
                            } else {
                                values = values.filter(function (v) { return v !== title; });
                                RefineFilter.settings.refine_values = values;
                            }

                            subtitle.text(values.length ? values.join(', ') : 'Не выбрано');
                            Lampa.Storage.set('refine_filter_values', values);
                            applyRefineFilter();
                        });
                    });

                    // Восстанавливаем сохраненные значения
                    var savedValues = Lampa.Storage.get('refine_filter_values', []);
                    if (savedValues.length) {
                        log('Восстановлены значения: ' + savedValues.join(', '));
                        RefineFilter.settings.refine_values = savedValues;
                        subtitle.text(savedValues.join(', '));
                        checkboxes.each(function () {
                            var title = $(this).find('.selectbox-item__title').text();
                            if (savedValues.includes(title)) {
                                $(this).find('.selectbox-item__checkbox').addClass('active');
                            }
                        });
                        applyRefineFilter();
                    }

                    // Закрытие подменю при уходе
                    submenu.on('hover:leave', function () {
                        log('Закрытие подменю "Уточнить"');
                        submenu.hide();
                        Lampa.Controller.toggle('filter');
                    });
                }, 200); // Увеличена задержка для асинхронной загрузки
            }
        });
    }

    function applyRefineFilter() {
        if (!RefineFilter.settings.enabled) {
            log('Фильтр отключен');
            return;
        }

        var parser = Lampa.Parser || window.Lampa.Parser;
        if (!parser) {
            console.warn('[RefineFilter] Lampa.Parser не найден');
            return;
        }

        try {
            var filter = {};
            var values = RefineFilter.settings.refine_values;
            if (values.length) {
                filter.refine = values.join('|').toUpperCase();
                log('Применение фильтра: ' + filter.refine);
            } else {
                filter.refine = '';
                log('Сброс фильтра');
            }

            parser.filter(filter);
            Lampa.Activity.reload();
            log('Фильтр применен, активность перезагружена');
        } catch (e) {
            console.error('[RefineFilter] Ошибка при применении фильтра:', e);
        }
    }

    // Инициализация плагина
    function startPlugin() {
        log('Запуск плагина RefineFilter v' + RefineFilter.version);
        // Сохраняем настройки
        RefineFilter.settings.enabled = Lampa.Storage.get('refine_filter_enabled', true);
        RefineFilter.settings.refine_values = Lampa.Storage.get('refine_filter_values', []);

        // Добавляем настройки в интерфейс
        Lampa.SettingsApi.addComponent({
            component: 'refine_filter',
            name: 'Фильтр уточнения',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6C21 6.55228 20.5523 7 20 7H4C3.44772 7 3 6.55228 3 6V4Z" fill="currentColor"/>' +
                  '<path d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10V12C17 12.5523 16.5523 13 16 13H4C3.44772 13 3 12.55228 3 12V10Z" fill="currentColor"/>' +
                  '<path d="M3 16C3 15.4477 3.44772 15 4 15H12C12.5523 15 13 15.4477 13 16V18C13 18.5523 12.5523 19 12 19H4C3.44772 19 3 18.4477 3 18V16Z" fill="currentColor"/>' +
                  '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'refine_filter',
            param: {
                name: 'refine_filter_enabled',
                type: 'trigger',
                default: true
            },
            field: {
                name: 'Фильтр уточнения',
                description: 'Включить фильтр по формату (BDRip, WEB-DL)'
            },
            onChange: function (value) {
                RefineFilter.settings.enabled = value;
                Lampa.Storage.set('refine_filter_enabled', value);
                if (!value) {
                    $('.refine-filter').remove();
                    applyRefineFilter();
                    log('Фильтр отключен и удален из DOM');
                } else {
                    addRefineFilter();
                    log('Фильтр включен');
                }
                Lampa.Settings.update();
            }
        });

        // Запускаем функционал
        if (RefineFilter.settings.enabled) {
            addRefineFilter();
        }
    }

    // Запуск плагина
    if (window.appready) {
        log('Приложение уже загружено, запуск плагина');
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                log('Приложение загружено, запуск плагина');
                startPlugin();
            }
        });
    }

    // Экспорт в манифест
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || {};
    Lampa.Manifest.plugins[RefineFilter.name] = {
        name: 'Фильтр уточнения',
        version: RefineFilter.version,
        description: 'Добавляет фильтр по формату (BDRip, WEB-DL) в меню парсера'
    };

    window.refine_filter = RefineFilter;
})();
