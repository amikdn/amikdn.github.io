(function () {
    'use strict';

    Lampa.Platform.tv();

    // Определяем протокол (http или https)
    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    // Список доменов серверов
    const servers = [
        'lampa.app',
        'bylampa.cc',           // bylampa_jackett
        'jac-red.ru',           // jacred_ru
        'jr.maxvol.pro',        // jr_maxvol_pro
        'jacred.viewbox.dev',   // jacred_viewbox_dev
        'ru.jacred.pro',        // jacred_pro
        'jacblack.ru:9117',     // jac_black
        'jacred.xyz'            // jacred_xyz (основной)
    ];

    // Названия пунктов в меню выбора
    const serverTitles = [
        'LampaApp',
        'Lampa Jackett',
        'Jacred.xyz',
        'Jacred Maxvol Pro',
        'Jacred RU',
        'Viewbox',
        'Jacred Pro',
        'Jac Black'
    ];

    // Проверка доступности сервера и окрашивание пункта в зелёный/красный
    function checkServer(index) {
        setTimeout(() => {
            let apikey = '';
            if (servers[index] === 'bylampa.cc') apikey = '5178915kmzeLa';

            let fullProtocol = servers[index] === 'jr.maxvol.pro' ? 'https://' : 'http://';
            const checkUrl = `${fullProtocol}${servers[index]}/api/v2.0/indexers/status:healthy/results?apikey=${apikey}`;

            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', checkUrl, true);
            xhr.send();

            const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;

            xhr.ontimeout = xhr.onerror = () => {
                if ($(selector).text() === serverTitles[index]) {
                    $(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    if ($(selector).text() === serverTitles[index]) {
                        $(selector).html('✔&nbsp;&nbsp;' + $(selector).text()).css('color', '#64e364');
                    }
                } else if (xhr.status === 401) {
                    if ($(selector).text() === serverTitles[index]) {
                        $(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ffffff');
                    }
                } else {
                    if ($(selector).text() === serverTitles[index]) {
                        $(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
                    }
                }
            };
        }, 1000);
    }

    function checkAllServers() {
        for (let i = 0; i < servers.length; i++) {
            checkServer(i);
        }
    }

    // При открытии настроек парсера — проверяем доступность серверов
    Lampa.Settings.listen('settings_component', function (e) {
        if (e.name === 'parser') {
            setTimeout(checkAllServers, 10);
        }
    });

    // Автоматическая настройка параметров в зависимости от выбранного сервера
    function applyServerSettings() {
        const selected = Lampa.Storage.get('parser_torrent_type');

        if (selected === 'no_parser') {
            Lampa.Storage.set('jackett_url', '');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', false);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (selected === 'jac_lampa32_ru') {
            Lampa.Storage.set('jackett_url', '62.60.149.237:8443');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (Lampa.Storage.get('jackett_urltwo') === 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (selected === 'jacred_xyz') {
            Lampa.Storage.set('jackett_url', 'jacred.xyz');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (selected === 'jr_maxvol_pro') {
            Lampa.Storage.set('jackett_url', 'jr.maxvol.pro');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'healthy');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }

        if (selected === 'jac_black') {
            Lampa.Storage.set('jackett_url', 'jacblack.ru:9117');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (selected === 'jacred_ru') {
            Lampa.Storage.set('jackett_url', 'jac-red.ru');
            Lampa.Storage.set('jackett_key', '');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (selected === 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', '777');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }

        if (Lampa.Storage.get('jackett_urltwo') === 'bylampa_jackett') {
            Lampa.Storage.set('jackett_url', 'bylampa.cc');
            Lampa.Storage.set('jackett_key', '5178915kmzeLa');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }
    }

    // Добавляем в настройки новый пункт "Выбрать парсер"
    Lampa.SettingsApi.addParam({
        component: 'parser',
        param: {
            name: 'jackett_urltwo',
            type: 'select',
            values: {
                no_parser: 'Нет парсера',
                jac_lampa32_ru: 'Jacred Lampa32 RU',
                bylampa_jackett: 'Lampa Jackett',
                jacred_xyz: 'Jacred.xyz',
                jr_maxvol_pro: 'Jacred Maxvol Pro',
                jacred_ru: 'Jacred RU',
                jacred_viewbox_dev: 'Jacred Viewbox Dev',
                jacred_pro: 'Jacred Pro',
                jac_black: 'Jac Black'
            },
            default: 'jacred_xyz'
        },
        field: {
            name: 'Меню смены парсера',
            description: 'Нажмите для выбора парсера из списка'
        },
        onChange: () => {
            applyServerSettings();
            Lampa.Settings.update();
        },
        onRender: () => {
            setTimeout(() => {
                // По нажатию Enter на пункте — открываем меню выбора
                $('div[data-name="jackett_urltwo"]').on('hover:enter', () => {
                    Lampa.Settings.update();
                });

                // Если уже выбран не "Свой вариант" — скрываем стандартные поля
                if (localStorage.getItem('parser_torrent_type') !== 'custom') {
                    $('div[data-name="jackett_url"]').hide();
                    $('div[data-name="jackett_key"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }

                // Если включён Jackett — показываем наш пункт
                if (Lampa.Storage.get('parser') && Lampa.Storage.get('torrents') === 'jackett') {
                    _0xdaa4b7.show();
                    $('.settings-param__name', _0xdaa4b7).css('color', '#ffffff');
                    $('div[data-children="parser"]').insertAfter(
                        '<div class="settings-folder" style="padding:0!important">...' // SVG-иконка и стили (в оригинале здесь длинный SVG)
                    );
                } else {
                    _0xdaa4b7.hide();
                }
            }, 5);
        }
    });

    // Скрытие/показ других полей при смене типа парсера
    Lampa.Settings.listen('timeout', function (e) {
        if (e.name === 'settings_component') {
            e.activity.find('[data-name="jackett_url2"]').hide();
            e.activity.find('div[data-name="parser_torrent_type"]').hide();
        }
    });

    Lampa.Storage.follow('parser', function (e) {
        if (Lampa.Storage.get('torrents') !== 'jackett') {
            $('div[data-children="parser"]').hide();
        } else {
            $('div[data-children="parser"]').show();
            $('div[data-name="jackett_urltwo"]').insertAfter('<div class="settings-folder">...');
        }
    });

    // При первом запуске — устанавливаем дефолтные значения
    let initInterval = setInterval(() => {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', 'false')) {
                firstRunSetup();
            }
        }
    }, 100);

    function firstRunSetup() {
        Lampa.Storage.set('jack', 'true');
        Lampa.Storage.set('jackett_url', 'jacred.xyz');
        Lampa.Storage.set('parser_torrent_type', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_key', '');
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
    }

    // === Меню выбора парсера (альтернативное красивое меню) ===
    function buildParserMenu() {
        const currentActivity = Lampa.Activity.active().name;
        const serversList = [
            { title: 'Jacred Lampa32 RU', url: '62.60.149.237:8443', url_two: 'jac_lampa32_ru', jac_key: '', jac_int: 'all', jac_lang: 'lg' },
            { title: 'Lampa Jackett',      url: 'bylampa.cc',          url_two: 'bylampa_jackett', jac_key: '5178915kmzeLa', jac_int: 'all', jac_lang: 'df' },
            { title: 'Jacred.xyz',         url: 'jacred.xyz',          url_two: 'jacred_xyz',      jac_key: '', jac_int: 'healthy', jac_lang: 'lg' },
            { title: 'Jacred Maxvol Pro',  url: 'jr.maxvol.pro',       url_two: 'jr_maxvol_pro',   jac_key: '', jac_int: 'healthy', jac_lang: 'lg' },
            { title: 'Jacred RU',          url: 'jac-red.ru',          url_two: 'jacred_ru',       jac_key: '', jac_int: 'all', jac_lang: 'lg' },
            { title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev',  url_two: 'jacred_viewbox_dev', jac_key: '777', jac_int: 'all', jac_lang: 'lg' },
            { title: 'Jacred Pro',         url: 'ru.jacred.pro',       url_two: 'jacred_pro',      jac_key: '', jac_int: 'all', jac_lang: 'lg' },
            { title: 'Jac Black',          url: 'jacblack.ru:9117',    url_two: 'jac_black',       jac_key: '', jac_int: 'all', jac_lang: 'lg' }
        ];

        checkServersAvailability(serversList).then(items => {
            Lampa.Modal.show({
                title: 'Выбрать парсер',
                items: items.map(item => ({ title: item.title, ...item })),
                onBack: () => Lampa.Controller.toggle(currentActivity),
                onSelect: selected => {
                    Lampa.Storage.set('jackett_url', selected.url);
                    Lampa.Storage.set('jackett_urltwo', selected.url_two);
                    Lampa.Storage.set('jackett_key', selected.jac_key);
                    Lampa.Storage.set('jackett_interview', selected.jac_int);
                    Lampa.Storage.set('parse_lang', selected.jac_lang);
                    Lampa.Storage.set('parse_in_search', true);
                    Lampa.Controller.toggle(currentActivity);

                    const component = Lampa.Storage.get('settings_component');
                    setTimeout(() => window.location.reload(), 1000);
                    setTimeout(() => Lampa.Activity.push(component), 2000);
                }
            });
        }).catch(err => console.error('Error:', err));
    }

    // Проверка доступности каждого сервера для отображения галочки/крестиков в модальном меню
    function checkServersAvailability(list) {
        const checks = [];

        for (const server of list) {
            checks.push(checkSingleServer(server.url, server.title, server));
        }

        return Promise.all(checks);
    }

    function checkSingleServer(domain, title, data) {
        return new Promise((resolve) => {
            let proto = location.protocol === 'https:' ? 'https://' : 'http://';
            let apikey = domain === 'bylampa.cc' ? '5178915kmzeLa' : '';
            if (domain === 'jr.maxvol.pro') proto = 'https://';

            const url = `${proto}${domain}/api/v2.0/indexers/status:healthy/results?apikey=${apikey}`;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.timeout = 3000;
            xhr.onload = () => {
                if (xhr.status === 200) {
                    data.title = '<span style="color:#64e364;">✔&nbsp;&nbsp;' + title + '</span>';
                } else {
                    data.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                }
                resolve(data);
            };
            xhr.onerror = xhr.ontimeout = () => {
                data.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(data);
            };
            xhr.send();
        });
    }

    // Отслеживание открытия настроек и добавление альтернативного меню
    let observer;
    Lampa.Storage.follow('parser', function (e) {
        if (e.name === 'settings_component' && Lampa.Activity.active().name === 'settings') {
            buildParserMenuIfNeeded();
        }
    });

    function buildParserMenuIfNeeded() {
        buildParserMenu();
        stopObserver();
        const body = document.body;
        const config = { childList: true, subtree: true };
        observer = new MutationObserver(mutations => {
            mutations.forEach(() => {
                if ($('.empty__title').length && Lampa.Storage.field('torrents') === 'jackett') {
                    buildParserMenu();
                    stopObserver();
                }
            });
        });
        observer.observe(body, config);
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
})();
