(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    // Проверка версии Lampa
    if (Lampa.Manifest.version !== 'Lampa32') {
        Lampa.Storage.set('no_parser', true);
        console.log('Lampa version not supported');
        return;
    }
    
    Lampa.Storage.set('parser_use', true);
    
    // Определяем протокол
    var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
    
    // Список доступных парсеров
    var servers = [
        '62.60.149.237:2601',      // Lampa32
        'jacblack.ru:9117',        // ByLampa Jackett / Jac Black
        '62.60.149.237:8443',      // ?
        'jr.maxvol.pro',           // JR Maxvol Pro
        'https://jac-red.ru',      // Jacred RU
        'jacred.viewbox.dev',      // Jacred Viewbox Dev
        'jacred.pro',              // Jacred Pro
        'jacred.xyz'               // Jacred.xyz
    ];
    
    var parserNames = [
        'Lampa32',
        'ByLampa Jackett',
        'Jacred.xyz', 
        'JR Maxvol Pro',
        'Jacred RU',
        'Jacred Viewbox Dev',
        'Jacred Pro',
        'Jac Black'
    ];
    
    var parserConfigs = {
        'jac_lampa32_ru': {
            url: '62.60.149.237:2601',
            key: '',
            interview: 'false',
            lang: 'lg',
            search: true
        },
        'bylampa_jackett': {
            url: 'jacblack.ru:9117',
            key: '34DPECDY',
            interview: 'all',
            lang: 'df',
            search: true
        },
        'jacred_xyz': {
            url: 'jacred.xyz',
            key: '',
            interview: 'healthy',
            lang: 'lg',
            search: true
        },
        'jr_maxvol_pro': {
            url: 'jr.maxvol.pro',
            key: '',
            interview: 'all',
            lang: 'lg',
            search: true
        },
        'jacred_ru': {
            url: 'https://jac-red.ru',
            key: '',
            interview: 'false',
            lang: 'lg',
            search: true
        },
        'jacred_viewbox_dev': {
            url: 'jacred.viewbox.dev',
            key: '64e364',
            interview: 'false',
            lang: 'lg',
            search: true
        },
        'jacred_pro': {
            url: 'jacred.pro',
            key: '',
            interview: 'all',
            lang: 'lg',
            search: true
        },
        'jac_black': {
            url: 'jacblack.ru:9117',
            key: '',
            interview: 'false',
            lang: 'lg',
            search: true
        }
    };
    
    // Функция проверки доступности парсера
    function checkParserAvailability(serverUrl, title, config) {
        return new Promise((resolve) => {
            var checkProtocol = serverUrl.startsWith('https://') ? 'https://' : protocol;
            var apiKey = config.key || '';
            var apiUrl = checkProtocol + serverUrl.replace(/^https?:\/\//, '') + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
            
            var xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', apiUrl, true);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    resolve({ ...config, title: '✔ ' + title, status: 'active' });
                } else {
                    resolve({ ...config, title: '✘ ' + title, status: 'inactive' });
                }
            };
            
            xhr.onerror = xhr.ontimeout = function() {
                resolve({ ...config, title: '✘ ' + title, status: 'inactive' });
            };
            
            xhr.send();
        });
    }
    
    // Настройка параметров парсера
    function setupParserConfig(parserId) {
        if (!parserConfigs[parserId]) return;
        
        var config = parserConfigs[parserId];
        Lampa.Storage.set('jackett_url', config.url);
        Lampa.Storage.set('jackett_key', config.key);
        Lampa.Storage.set('jackett_interview', config.interview);
        Lampa.Storage.set('parse_in_search', config.search);
        Lampa.Storage.set('parse_lang', config.lang);
        Lampa.Storage.set('jackett_urltwo', parserId);
        
        console.log('Parser configured:', parserId, config);
    }
    
    // Инициализация по умолчанию
    function initDefaultParser() {
        if (!Lampa.Storage.get('jack', false)) {
            Lampa.Storage.set('jack', 'true');
            setupParserConfig('jacred_xyz');
            console.log('Default parser initialized: jacred_xyz');
        }
    }
    
    // Создание меню выбора парсера
    function createParserMenu() {
        var items = Object.keys(parserConfigs).map(key => {
            var config = parserConfigs[key];
            return {
                title: config.title || key,
                id: key,
                ...config
            };
        });
        
        // Проверяем доступность парсеров
        Promise.all(
            items.map(item => checkParserAvailability(item.url, item.title || item.id, item))
        ).then(checkedItems => {
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: checkedItems.map(item => ({
                    title: item.title,
                    id: item.id,
                    status: item.status
                })),
                onBack: () => {
                    // Возврат к предыдущему экрану
                },
                onSelect: (item) => {
                    setupParserConfig(item.id);
                    
                    // Перезагрузка настроек
                    setTimeout(() => {
                        if (window.location.reload) {
                            window.location.reload();
                        }
                    }, 1000);
                }
            });
        }).catch(err => {
            console.error('Error checking parsers:', err);
            // Показываем меню без проверки статуса
            Lampa.Select.show({
                title: 'Выбрать парсер',
                items: Object.keys(parserConfigs).map(key => ({
                    title: parserConfigs[key].title || key,
                    id: key
                })),
                onSelect: (item) => setupParserConfig(item.id)
            });
        });
    }
    
    // Основная настройка в Lampa Settings
    if (Lampa.Settings && Lampa.Settings.main) {
        Lampa.Settings.main({
            component: 'parser',
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                'no_parser': 'Без парсера',
                ...Object.fromEntries(
                    Object.keys(parserConfigs).map(key => [key, parserConfigs[key].title || key])
                )
            },
            default: 'jacred_xyz',
            field: {
                name: '🔧 Выбор Jackett парсера',
                description: 'Выберите рабочий парсер для поиска торрентов'
            },
            onChange: (value) => {
                if (value === 'no_parser') {
                    Lampa.Storage.set('jackett_url', '');
                    Lampa.Storage.set('jackett_key', '');
                    Lampa.Storage.set('parse_in_search', false);
                } else {
                    setupParserConfig(value);
                }
                Lampa.Settings.update && Lampa.Settings.update();
            },
            onRender: (html) => {
                setTimeout(() => {
                    // Добавляем кнопку для открытия меню выбора
                    var buttonHtml = `
                        <div class="settings-folder" style="padding:0!important">
                            <div style="width:1.3em;height:1.3em;padding-right:.1em">
                                <!-- SVG иконка -->
                            </div>
                            <div style="font-size:1.0em">
                                <div style="padding:0.3em 0.3em;padding-top:0;">
                                    <div style="background:#d99821;padding:0.5em;border-radius:0.4em;cursor:pointer" onclick="createParserMenu()">
                                        <div style="line-height:0.3;">Выбрать парсер</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Вставляем кнопку после селектора
                    $(html).find('select').after(buttonHtml);
                    
                    // Скрываем стандартные поля если Jackett активен
                    if (Lampa.Storage.field && Lampa.Storage.field('parser_torrent_type') === 'jackett') {
                        $(html).find('[data-name="jackett_url"]').hide();
                        $(html).find('[data-name="jackett_key"]').hide();
                    }
                }, 100);
            }
        });
    }
    
    // Отслеживание изменений
    if (Lampa.Storage && Lampa.Storage.follow) {
        Lampa.Storage.follow('parser', (e) => {
            if (e.name === 'jackett_urltwo' && e.value) {
                setupParserConfig(e.value);
            }
        });
    }
    
    // Инициализация при загрузке
    var initTimer = setInterval(() => {
        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
            clearInterval(initTimer);
            initDefaultParser();
        }
    }, 100);
    
    // Глобальная функция для вызова меню (для кнопки)
    window.createJackettMenu = createParserMenu;
    
    console.log('Jackett parser module loaded');
})();
