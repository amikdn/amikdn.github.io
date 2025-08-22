(function () {
    'use strict';

    var RefineFilter = {
        name: 'refine_filter',
        version: '1.0.0',
        debug: false,
        settings: {
            enabled: true,
            refine_value: ''
        }
    };

    function addRefineFilter() {
        // Ждем загрузки интерфейса фильтров
        Lampa.Listener.follow('filter', function (e) {
            if (e.type === 'open' || e.type === 'render') {
                setTimeout(function () {
                    // Находим элемент "Качество" в меню фильтра
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
                        '<div class="refine-input" style="display: none; padding: 10px;">' +
                            '<input type="text" name="refine" placeholder="Например BDRip, WEB-DL" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">' +
                        '</div>' +
                    '</div>');

                    // Вставляем после "Качество"
                    qualityItem.after(refineItem);

                    // Получаем элементы для взаимодействия
                    var subtitle = refineItem.find('.selectbox-item__subtitle');
                    var inputContainer = refineItem.find('.refine-input');
                    var input = refineItem.find('input[name="refine"]');

                    // Обработчик клика для показа/скрытия поля ввода
                    refineItem.on('hover:enter', function () {
                        inputContainer.toggle();
                        if (inputContainer.is(':visible')) {
                            input.focus();
                        }
                    });

                    // Обработчик ввода в поле
                    input.on('input', function () {
                        var value = input.val().trim().toUpperCase();
                        RefineFilter.settings.refine_value = value;
                        subtitle.text(value || 'Не выбрано');
                        Lampa.Storage.set('refine_filter_value', value);

                        // Применяем фильтр
                        applyRefineFilter(value);
                    });

                    // Восстанавливаем сохраненное значение
                    var savedValue = Lampa.Storage.get('refine_filter_value', '');
                    if (savedValue) {
                        input.val(savedValue);
                        subtitle.text(savedValue);
                        applyRefineFilter(savedValue);
                    }

                    // Закрытие поля ввода при потере фокуса
                    input.on('blur', function () {
                        setTimeout(function () {
                            inputContainer.hide();
                        }, 200);
                    });
                }, 100);
            }
        });
    }

    function applyRefineFilter(value) {
        if (!RefineFilter.settings.enabled) return;

        // Получаем текущие данные парсера
        var parser = Lampa.Parser || window.Lampa.Parser;
        if (!parser) {
            console.warn('[RefineFilter] Lampa.Parser не найден');
            return;
        }

        // Фильтрация результатов
        try {
            var filter = {};
            if (value) {
                var formats = value.split(',').map(function (v) { return v.trim().toUpperCase(); }).filter(function (v) { return v; });
                filter.refine = formats.join('|');
            } else {
                filter.refine = '';
            }

            // Применяем фильтр через API Lampa
            parser.filter(filter);
            Lampa.Activity.reload(); // Перезагружаем активность для обновления результатов
        } catch (e) {
            console.error('[RefineFilter] Ошибка при применении фильтра:', e);
        }
    }

    // Инициализация плагина
    function startPlugin() {
        // Сохраняем настройки
        RefineFilter.settings.enabled = Lampa.Storage.get('refine_filter_enabled', true);
        RefineFilter.settings.refine_value = Lampa.Storage.get('refine_filter_value', '');

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
                    applyRefineFilter(''); // Сбрасываем фильтр
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
