(function() {
    'use strict';

    Lampa.Platform.tv();

    // Установка флага использования парсера
    Lampa.Storage.set('parser_use', true);

    // Массивы парсеров (без lampa32 и bylampa)
    const parsers = [
        { key: 'jacred_xyz', title: 'Jacred.xyz', url: 'jacred.pro', apiKey: '', status: 'healthy', lang: 'lg' },
        { key: 'jr_maxvol_pro', title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', apiKey: '', status: 'all', lang: 'df' },
        { key: 'jacred_ru', title: 'Jacred RU', url: 'jac-red.ru', apiKey: '', status: 'false', lang: 'lg' },
        { key: 'jacred_viewbox_dev', title: 'Viewbox', url: 'jacred.viewbox.dev', apiKey: '000', status: 'false', lang: 'lg' },
        { key: 'jacred_pro', title: 'Jacred Pro', url: 'jacred.pro', apiKey: '', status: 'all', lang: 'lg' },
        { key: 'jac_black', title: 'Jac Black', url: 'jacblack.ru:9117', apiKey: '777', status: 'false', lang: 'lg' }
    ];

    // Функция проверки доступности парсера
    function checkParserAvailability(parser, index) {
        return new Promise((resolve) => {
            const protocol = location.protocol === 'https:' ? 'https://' : 'http://';
            let apiUrl = protocol + parser.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + parser.apiKey;
            
            if (parser.url === 'jr.maxvol.pro') {
                apiUrl = 'https://' + parser.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + parser.apiKey;
            }

            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', apiUrl, true);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    parser.title = '✔&nbsp;&nbsp;' + parser.title;
                    parser.available = true;
                } else {
                    parser.title = '✘&nbsp;&nbsp;' + parser.title;
                    parser.available = false;
                }
                resolve(parser);
            };
            
            xhr.onerror = xhr.ontimeout = function() {
                parser.title = '✘&nbsp;&nbsp;' + parser.title;
                parser.available = false;
                resolve(parser);
            };
            
            xhr.send();
        });
    }

    // Функция настройки значений при выборе парсера
    function setupParserSettings(parserKey) {
        const parser = parsers.find(p => p.key === parserKey);
        if (!parser) return;

        Lampa.Storage.set('jackett_url', parser.url);
        Lampa.Storage.set('jackett_urltwo', parser.key);
        Lampa.Storage.set('jackett_key', parser.apiKey);
        Lampa.Storage.set('jackett_interview', parser.status);
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('parse_lang', parser.lang);
    }

    // Функция обработки выбора парсера
    function showParserMenu() {
        const activeActivity = Lampa.Activity.active().activity.name;
        
        // Проверяем доступность всех парсеров
        Promise.all(parsers.map((parser, index) => checkParserAvailability({...parser}, index)))
            .then(checkedParsers => {
                Lampa.Select.show({
                    title: 'Меню смены парсера',
                    items: checkedParsers.map(parser => ({
                        title: parser.title,
                        url: parser.url,
                        url_two: parser.key,
                        jac_key: parser.apiKey,
                        jac_int: parser.status,
                        jac_lang: parser.lang,
                        available: parser.available
                    })),
                    onBack: () => {
                        Lampa.Controller.toggle(activeActivity);
                    },
                    onSelect: (item) => {
                        setupParserSettings(item.url_two);
                        Lampa.Activity.toggle(activeActivity);
                        
                        // Перезагрузка для применения настроек
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                });
            })
            .catch(error => {
                console.error('Ошибка проверки парсеров:', error);
                // Показываем меню без проверки доступности
                Lampa.Select.show({
                    title: 'Меню смены парсера',
                    items: parsers.map(parser => ({
                        title: parser.title,
                        url: parser.url,
                        url_two: parser.key,
                        jac_key: parser.apiKey,
                        jac_int: parser.status,
                        jac_lang: parser.lang
                    })),
                    onBack: () => Lampa.Controller.toggle(activeActivity),
                    onSelect: (item) => {
                        setupParserSettings(item.url_two);
                        Lampa.Activity.toggle(activeActivity);
                        setTimeout(() => window.location.reload(), 1000);
                    }
                });
            });
    }

    // Функция инициализации по умолчанию
    function initDefaultParser() {
        if (!Lampa.Storage.get('jack', false)) {
            Lampa.Storage.set('jack', 'true');
            setupParserSettings('jacred_xyz'); // Jacred.xyz по умолчанию
        }
    }

    // Основные настройки в интерфейсе
    Lampa.Settings.main({
        component: 'parser',
        param: {
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                'no_parser': 'Без парсера',
                'jacred_xyz': 'Jacred.xyz',
                'jr_maxvol_pro': 'Jacred Maxvol Pro',
                'jacred_ru': 'Jacred RU',
                'jacred_viewbox_dev': 'Viewbox',
                'jacred_pro': 'Jacred Pro',
                'jac_black': 'Jac Black'
            },
            default: 'jacred_xyz'
        },
        field: {
            name: 'Выбор парсера Jackett',
            description: 'Выберите парсер торрентов'
        },
        onChange: (value) => {
            if (value === 'no_parser') {
                Lampa.Storage.set('jackett_url', '');
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'false');
                Lampa.Storage.set('parse_in_search', false);
                Lampa.Storage.set('parse_lang', 'lg');
            } else {
                setupParserSettings(value);
            }
            Lampa.Settings.update();
        },
        onRender: (p) => {
            setTimeout(() => {
                // Показываем/скрываем в зависимости от типа парсера
                if (Lampa.Storage.field('parser_use') && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                    p.show();
                } else {
                    p.hide();
                }

                // Обработчик клика для открытия меню выбора
                $('div[data-children="parser"]').on('hover:enter', () => {
                    showParserMenu();
                });
            }, 100);
        }
    });

    // Отслеживание изменений типа парсера
    if (Lampa.Storage.listener) {
        Lampa.Storage.listener.follow('change', (e) => {
            if (e.name === 'parser_torrent_type') {
                const showJackett = Lampa.Storage.get('parser_torrent_type') === 'jackett';
                const $jackettField = $('div[data-name="jackett_urltwo"]');
                if (showJackett) {
                    $jackettField.show();
                } else {
                    $jackettField.hide();
                }
            }
        });
    }

    // Инициализация при загрузке
    const initInterval = setInterval(() => {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
            clearInterval(initInterval);
            initDefaultParser();
        }
    }, 100);

    // MutationObserver для отслеживания изменений DOM
    let observer;
    function startObserver() {
        if (observer) observer.disconnect();
        
        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if ($('div[data-children="parser"]').length && 
                    Lampa.Storage.field && 
                    Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                    // Показываем меню выбора при необходимости
                    showParserMenu();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запуск observer при определенных событиях
    Lampa.Listener.follow('app', (e) => {
        if (e.name === 'parser' || e.name === 'history') {
            setTimeout(startObserver, 500);
        }
    });

})();
