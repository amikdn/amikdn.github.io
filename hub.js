(function () {
    'use strict';

    Lampa.Platform.tv();

    Lampa.Storage.set('parser', true);

    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    const servers = [
        'lampa.app',
        'bylampa.cc',
        'jac-red.ru',
        'jr.maxvol.pro',
        'jacred.viewbox.dev',
        'ru.jacred.pro',
        'jacblack.ru:9117',
        'jacred.xyz'
    ];

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

    function checkServer(index) {
        setTimeout(function () {
            let apikey = '';
            if (servers[index] === 'bylampa.cc') apikey = '5178915kmzeLa';

            let proto = servers[index] === 'jr.maxvol.pro' ? 'https://' : protocol;
            const url = proto + servers[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apikey;

            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.send();

            const selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + (index + 2) + ') > div';

            xhr.ontimeout = xhr.onerror = function () {
                if ($(selector).text() === serverTitles[index]) {
                    $(selector).html('✘&nbsp;&nbsp;' + $(selector).text()).css('color', '#ff2121');
                }
            };

            xhr.onload = function () {
                if (xhr.status === 200) {
                    if ($(selector).text() === serverTitles[index]) {
                        $(selector).html('✔&nbsp;&nbsp;' + $(selector).text()).css('color', '#64e364');
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

    Lampa.Settings.listen('settings_component', function (e) {
        if (e.name === 'parser') {
            setTimeout(checkAllServers, 10);
        }
    });

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

        if (Lampa.Storage.get('jackett_urltwo') === 'bylampa_jackett') {
            Lampa.Storage.set('jackett_url', 'bylampa.cc');
            Lampa.Storage.set('jackett_key', '5178915kmzeLa');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'df');
        }

        if (Lampa.Storage.get('jackett_urltwo') === 'jacred_viewbox_dev') {
            Lampa.Storage.set('jackett_url', 'jacred.viewbox.dev');
            Lampa.Storage.set('jackett_key', '777');
            Lampa.Storage.set('jackett_interview', 'all');
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', 'lg');
        }
    }

    const jackettSvgHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"></path><path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"></path><path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"></path><path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path><path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path><path d="M511.881,432.984L455.414,60.652c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c4.936,6.802,30.149-138.858z"></path><path d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"></path></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0"><div style="background:#d99821;padding:0.5em;border-radius:0.4em"><div style="line-height:0.3">Выбрать парсер</div></div></div></div></div>';

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
            name: jackettSvgHtml,
            description: 'Нажмите для выбора парсера из списка'
        },
        onChange: function () {
            applyServerSettings();
            Lampa.Settings.update();
        },
        onRender: function (element) {
            setTimeout(function () {
                $('div[data-name="jackett_urltwo"]').on('hover:enter', function () {
                    Lampa.Settings.update();
                });

                if (localStorage.getItem('parser_torrent_type') !== 'custom') {
                    $('div[data-name="jackett_url"]').hide();
                    $('div[data-name="jackett_key"]').hide();
                    Lampa.Controller.toggle('settings_component');
                }

                if (Lampa.Storage.get('parser') && Lampa.Storage.get('torrents') === 'jackett') {
                    element.show();
                    $('.settings-param__name', element).css('color', '#ffffff');
                    $('div[data-children="parser"]').insertAfter(jackettSvgHtml);
                } else {
                    element.hide();
                }
            }, 5);
        }
    });

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
            $('div[data-name="jackett_urltwo"]').insertAfter(jackettSvgHtml);
        }
    });

    const initInterval = setInterval(function () {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('jack', 'false')) {
                Lampa.Storage.set('jack', 'true');
                Lampa.Storage.set('jackett_url', 'jacred.xyz');
                Lampa.Storage.set('parser_torrent_type', 'jacred_xyz');
                Lampa.Storage.set('parse_in_search', true);
                Lampa.Storage.set('jackett_key', '');
                Lampa.Storage.set('jackett_interview', 'healthy');
                Lampa.Storage.set('parse_lang', 'lg');
            }
        }
    }, 100);

    function checkServerForModal(domain, key, title, data) {
        return new Promise(function (resolve) {
            let proto = location.protocol === 'https:' ? 'https://' : 'http://';
            if (domain === 'jr.maxvol.pro') proto = 'https://';
            const url = proto + domain + '/api/v2.0/indexers/status:healthy/results?apikey=' + (key || '');
            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.onload = function () {
                data.title = xhr.status === 200 ? '<span style="color:#64e364;">✔&nbsp;&nbsp;' + title + '</span>' : '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(data);
            };
            xhr.onerror = xhr.ontimeout = function () {
                data.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + title + '</span>';
                resolve(data);
            };
            xhr.send();
        });
    }

    function openParserModal() {
        const currentActivity = Lampa.Activity.active().name;

        const list = [
            {title: 'Jacred Lampa32 RU', url: '62.60.149.237:8443', url_two: 'jac_lampa32_ru', key: '', int: 'all', lang: 'lg'},
            {title: 'Lampa Jackett', url: 'bylampa.cc', url_two: 'bylampa_jackett', key: '5178915kmzeLa', int: 'all', lang: 'df'},
            {title: 'Jacred.xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', key: '', int: 'healthy', lang: 'lg'},
            {title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', key: '', int: 'healthy', lang: 'lg'},
            {title: 'Jacred RU', url: 'jac-red.ru', url_two: 'jacred_ru', key: '', int: 'all', lang: 'lg'},
            {title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev', url_two: 'jacred_viewbox_dev', key: '777', int: 'all', lang: 'lg'},
            {title: 'Jacred Pro', url: 'ru.jacred.pro', url_two: 'jacred_pro', key: '', int: 'all', lang: 'lg'},
            {title: 'Jac Black', url: 'jacblack.ru:9117', url_two: 'jac_black', key: '', int: 'all', lang: 'lg'}
        ];

        Promise.all(list.map(function (item) {
            return checkServerForModal(item.url, item.key, item.title, item);
        })).then(function (items) {
            Lampa.Modal.open({
                title: 'Выбрать парсер',
                items: items.map(function (i) {
                    return {title: i.title, url: i.url, url_two: i.url_two, key: i.key, int: i.int, lang: i.lang};
                }),
                onBack: function () {
                    Lampa.Controller.toggle(currentActivity);
                },
                onSelect: function (selected) {
                    Lampa.Storage.set('jackett_url', selected.url);
                    Lampa.Storage.set('jackett_urltwo', selected.url_two);
                    Lampa.Storage.set('jackett_key', selected.key);
                    Lampa.Storage.set('jackett_interview', selected.int);
                    Lampa.Storage.set('parse_lang', selected.lang);
                    Lampa.Storage.set('parse_in_search', true);
                    Lampa.Controller.toggle(currentActivity);
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                }
            });
        });
    }

    // Открытие модального меню по нажатию на пункт в настройках
    $(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', openParserModal);

    // Дополнительные подписки (как в оригинале)
    let observer;
    Lampa.Storage.follow('parser', function (e) {
        if (e.name === 'settings_component' && Lampa.Activity.active().name === 'settings') {
            openParserModal();
        }
    });

})();
