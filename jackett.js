(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Массив серверов для проверки
    const servers = [
        '62.60.149.237:2601',
        'jacblack.ru:9117',
        '62.60.149.237:8443',
        'jr.maxvol.pro',
        'jac-red.ru',
        'jacred.viewbox.dev',
        'jacred.pro',
        'jacred.xyz'
    ];
    
    // Названия серверов для отображения
    const serverNames = [
        'Lampa32',
        'ByLampa Jackett',
        'Jacred RU',
        'Jacred Maxvol Pro',
        'Jacred Pro',
        'Viewbox',
        'Jacred.xyz',
        'Jac Black'
    ];
    
    // Определение протокола
    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Функция проверки доступности сервера
    function checkServer(index) {
        setTimeout(function() {
            let apiKey = '';
            if (servers[index] === 'jacblack.ru:9117') {
                apiKey = '34DPECDY';
            }
            
            let serverProtocol = protocol;
            if (servers[index] === 'jr.maxvol.pro') {
                serverProtocol = 'https://';
            } else {
                serverProtocol = 'http://';
            }
            
            const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
            
            // Проверяем, что первый элемент - "Свой вариант"
            if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') {
                return;
            }
            
            const url = `${serverProtocol}${servers[index]}/api/v2.0/indexers/status:healthy/results?apikey=${apiKey}`;
            const xhr = new XMLHttpRequest();
            
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.send();
            
            xhr.ontimeout = function() {
                if ($(selector).text() === serverNames[index]) {
                    $(selector).html(`✗&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                }
            };
            
            xhr.onerror = function() {
                if ($(selector).text() === serverNames[index]) {
                    $(selector).html(`✗&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                }
            };
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`✓&nbsp;&nbsp;${$(selector).text()}`).css('color', '#64e364');
                    }
                } else {
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`✗&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ff2121');
                    }
                }
                
                if (xhr.status === 401) {
                    if ($(selector).text() === serverNames[index]) {
                        $(selector).html(`✗&nbsp;&nbsp;${$(selector).text()}`).css('color', '#ffffff');
                    }
                }
            };
        }, 1000);
    }
    
    // Функция проверки всех серверов
    function checkAllServers() {
        for (let i = 0; i < servers.length; i++) {
            checkServer(i);
        }
    }
    
    // Обработчик событий активности приложения
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'parser') {
            setTimeout(checkAllServers, 100);
        }
    });
    
    // Конфигурация серверов
    const serverConfigs = {
        'jac_lampa32_ru': {
            url: '62.60.149.237:2601',
            key: '',
            interview: 'false',
            search: true,
            lang: 'lg'
        },
        'bylampa_jackett': {
            url: 'jacblack.ru:9117',
            key: '34DPECDY',
            interview: 'all',
            search: true,
            lang: 'df'
        },
        'jacred_xyz': {
            url: 'jacred.xyz',
            key: '',
            interview: 'healthy',
            search: true,
            lang: 'lg'
        },
        'jr_maxvol_pro': {
            url: 'jr.maxvol.pro',
            key: '',
            interview: 'healthy',
            search: true,
            lang: 'lg'
        },
        'jacred_ru': {
            url: 'jac-red.ru',
            key: '',
            interview: 'false',
            search: true,
            lang: 'lg'
        },
        'jacred_viewbox_dev': {
            url: 'jacred.viewbox.dev',
            key: '64e364',
            interview: 'false',
            search: true,
            lang: 'lg'
        },
        'jacred_pro': {
            url: 'jacred.pro',
            key: '',
            interview: 'all',
            search: true,
            lang: 'lg'
        },
        'jac_black': {
            url: 'jacblack.ru:9117',
            key: '',
            interview: 'false',
            search: true,
            lang: 'lg'
        }
    };
    
    // Функция установки конфигурации
    function setServerConfig(parserType) {
        if (!parserType || parserType === 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'false');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
            return;
        }
        
        const config = serverConfigs[parserType];
        if (config) {
            Lampa.Storage.set('jackett_url', config.url);
            Lampa.Storage.set('jackett_key', config.key);
            Lampa.Storage.set('jackett_interview', config.interview);
            Lampa.Storage.set('parse_in_search', config.search);
            Lampa.Storage.set('parse_lang', config.lang);
        }
        
        Lampa.Settings.update();
    }
    
    // Добавление настройки выбора парсера
    if (Lampa.Settings && Lampa.Settings.main) {
        Lampa.Settings.main({
            component: 'parser',
            param: {
                name: 'jackett_urltwo',
                type: 'select',
                values: {
                    'no_parser': 'Без парсера',
                    'jac_lampa32_ru': 'Lampa32',
                    'bylampa_jackett': 'ByLampa Jackett',
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
                name: '🔧 Выбор парсера Jackett',
                description: 'Выберите сервер для поиска торрентов'
            },
            onChange: function(value) {
                setServerConfig(value);
            },
            onRender: function(html) {
                setTimeout(function() {
                    // Обработчик клика
                    $(html).on('hover:enter', function() {
                        if (Lampa.Settings.open) {
                            Lampa.Settings.open();
                        }
                    });
                    
                    // Скрытие стандартных полей
                    const currentUrl = Lampa.Storage.get('jackett_url');
                    if (currentUrl && currentUrl !== 'no_parser') {
                        setTimeout(function() {
                            $('div[data-name="jackett_url"], div[data-name="jackett_key"]').hide();
                        }, 100);
                    }
                    
                    // Показываем только для Jackett
                    const torrentType = Lampa.Storage.field('parser_torrent_type');
                    if (torrentType === 'jackett') {
                        html.show();
                        $(html).find('.settings-param__name').css('color', '#ffffff');
                    } else {
                        html.hide();
                    }
                }, 50);
            }
        });
    }
    
    // Отслеживание изменений типа парсера
    if (Lampa.Storage && Lampa.Storage.follow) {
        Lampa.Storage.follow('parser', function(e) {
            const torrentType = Lampa.Storage.field('parser_torrent_type');
            const urlTwoField = $('div[data-name="jackett_urltwo"]');
            
            if (torrentType === 'jackett') {
                urlTwoField.show();
                // Вставляем после поля URL если оно есть
                const urlField = $('div[data-name="jackett_url"]');
                if (urlField.length) {
                    urlTwoField.insertAfter(urlField);
                }
            } else {
                urlTwoField.hide();
            }
        });
    }
    
    // Инициализация по умолчанию
    let initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
            clearInterval(initInterval);
            
            if (!Lampa.Storage.get('jack_init', false)) {
                initializeDefaults();
            }
        }
    }, 100);
    
    function initializeDefaults() {
        Lampa.Storage.set('jack_init', true);
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        setServerConfig('jacred_xyz');
    }
    
    // Функция показа расширенного меню выбора
    function showServerSelectionMenu() {
        const serversList = [
            { id: 'jac_lampa32_ru', title: 'Lampa32', url: '62.60.149.237:2601' },
            { id: 'bylampa_jackett', title: 'ByLampa Jackett', url: 'jacblack.ru:9117' },
            { id: 'jacred_xyz', title: 'Jacred.xyz', url: 'jacred.xyz' },
            { id: 'jr_maxvol_pro', title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro' },
            { id: 'jacred_ru', title: 'Jacred RU', url: 'jac-red.ru' },
            { id: 'jacred_viewbox_dev', title: 'Viewbox', url: 'jacred.viewbox.dev' },
            { id: 'jacred_pro', title: 'Jacred Pro', url: 'jacred.pro' },
            { id: 'jac_black', title: 'Jac Black', url: 'jacblack.ru:9117' }
        ];
        
        // Проверяем статус серверов
        Promise.all(serversList.map(checkServerStatus)).then(function(results) {
            const validServers = results.map((result, index) => ({
                title: result ? `✓ ${serversList[index].title}` : `✗ ${serversList[index].title}`,
                id: serversList[index].id,
                subtitle: result ? 'Доступен' : 'Недоступен',
                status: result ? 'green' : 'red'
            }));
            
            if (Lampa.Select && Lampa.Select.show) {
                Lampa.Select.show({
                    title: 'Выберите Jackett сервер',
                    items: validServers,
                    onBack: function() {
                        Lampa.Activity.back();
                    },
                    onSelect: function(item) {
                        Lampa.Storage.set('jackett_urltwo', item.id);
                        setServerConfig(item.id);
                        
                        if (Lampa.Noty && Lampa.Noty.show) {
                            Lampa.Noty.show(`Выбран сервер: ${item.title}`);
                        }
                        
                        setTimeout(function() {
                            if (window.location.reload) {
                                window.location.reload();
                            }
                        }, 1500);
                    }
                });
            }
        });
    }
    
    // Проверка статуса одного сервера
    function checkServerStatus(server) {
        return new Promise(function(resolve) {
            let apiKey = server.url === 'jacblack.ru:9117' ? '34DPECDY' : '';
            let serverProtocol = server.url === 'jr.maxvol.pro' ? 'https://' : protocol;
            
            const checkUrl = `${serverProtocol}${server.url}/api/v2.0/indexers/status:healthy/results?apikey=${apiKey}`;
            const xhr = new XMLHttpRequest();
            
            xhr.open('GET', checkUrl, true);
            xhr.timeout = 5000;
            
            xhr.onload = function() {
                resolve(xhr.status === 200);
            };
            
            xhr.onerror = xhr.ontimeout = function() {
                resolve(false);
            };
            
            xhr.send();
        });
    }
    
    // MutationObserver для отслеживания изменений
    let observer;
    function setupObserver() {
        if (!window.MutationObserver) return;
        
        const stopObserver = function() {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        };
        
        observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if ($('div[data-children="parser"]').length) {
                    const torrentType = Lampa.Storage.field('parser_torrent_type');
                    if (torrentType === 'jackett') {
                        // Показываем меню выбора через небольшую задержку
                        setTimeout(showServerSelectionMenu, 500);
                        stopObserver();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Запускаем observer после загрузки
    setTimeout(setupObserver, 1000);
    
    // Добавляем обработчик для кнопки выбора парсера
    $(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', function() {
        showServerSelectionMenu();
    });
    
    console.log('Jackett selector loaded successfully');
})();
