(function () {
    'use strict';

    var RefineFilter = {
        name: 'refine_filter',
        version: '1.0.1',
        debug: false,
        settings: {
            enabled: true,
            refine_values: []
        }
    };

    function addRefineFilter() {
        // Ждем загрузки интерфейса фильтров
        Lampa.Listener.follow('filter', function (e) {
            if (e.type === 'open' || e.type === 'render') {
                setTimeout(function () {
                    // Находим элемент "Качество" в меню фильтров
                    var qualityItem = $('.selectbox-item__title').filter(function () {
                        return $(this).text().trim() === 'Качество';
                    }).closest('.selectbox-item.selector');

                    if (!qualityItem.length) {
                        console.warn('[RefineFilter] Элемент "Качество" не найден');
                        return;
                    }

                    // Проверяем, не добавлен ли уже наш фильтр
                    if (qualityItem.next().hasClass('refine-filter')) return;

                    // Создаем новый элемент фильтра "Уточнить"
                    var refineItem = $('<div class="selectbox-item selector refine-filter">' +
                        '<div class="selectbox-item__title">Уточнить</div>' +
                        '<div class="selectbox-item__subtitle">Не выбрано</div>' +
                    '</div>');

                    // Вставляем после "Качество"
                    qualityItem.after(refineItem);

                    // Создаем подменю для "Уточнить"
                    var refineSubmenu = $('<div class="selectbox__content layer--height refine-submenu" style="display: none;">' +
                        '<div class="selectbox__head">' +
                            '<div class="selectbox__title">Уточнить</div>' +
                        '</div>' +
                        '<div class="selectbox__body layer--wheight" style="max-height: unset;">' +
                            '<div class="scroll scroll--mask scroll--over">' +
                                '<div class="scroll__content">' +
                                    '<div class="scroll__body">' +
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

                    // Получаем элементы для взаимодействия
                    var subtitle = refineItem.find('.selectbox-item__subtitle');
                    var submenu = refineItem.find('.refine-submenu');
                    var checkboxes = submenu.find('.selectbox-item--checkbox');
                    var anyOption = submenu.find('.selectbox-item:not(.selectbox-item--checkbox)');

                    // Обработчик открытия подменю
                    refineItem.on('hover:enter', function () {
                        submenu.show();
                        Lampa.Controller.enable('selectbox');
                        submenu.find('.selectbox-item').first().addClass('focus');
                    });

                    // Обработчик выбора "Любое"
                    anyOption.on('hover:enter', function () {
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
                        submenu.hide();
                        Lampa.Controller.toggle('filter');
                    });
                }, 100);
            }
        });
    }

    function applyRefineFilter() {
        if (!RefineFilter.settings.enabled) return;

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
            } else {
                filter.refine = '';
            }

            parser.filter(filter);
            Lampa.Activity.reload();
        } catch (e) {
            console.error('[RefineFilter] Ошибка при применении фильтра:', e);
        }
    }

    // Инициализация плагина
    function startPlugin() {
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
                } else {
                    addRefineFilter();
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
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
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
