(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    const wait = setInterval(() => {
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi && Lampa.Storage && Lampa.Modal && Lampa.Controller) {
            clearInterval(wait);
            startPlugin();
        }
    }, 100);

    function startPlugin() {
        Lampa.Platform.tv();

        const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

        const servers = [
            {id: 'jac_lampa32_ru', title: 'Jacred Lampa32 RU', url: '62.60.149.237:8443', key: '', int: 'all', lang: 'lg'},
            {id: 'bylampa_jackett', title: 'Lampa Jackett', url: 'bylampa.cc', key: '5178915kmzeLa', int: 'all', lang: 'df'},
            {id: 'jacred_xyz', title: 'Jacred.xyz', url: 'jacred.xyz', key: '', int: 'healthy', lang: 'lg'},
            {id: 'jr_maxvol_pro', title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', key: '', int: 'healthy', lang: 'lg'},
            {id: 'jacred_ru', title: 'Jacred RU', url: 'jac-red.ru', key: '', int: 'all', lang: 'lg'},
            {id: 'jacred_viewbox_dev', title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev', key: '777', int: 'all', lang: 'lg'},
            {id: 'jacred_pro', title: 'Jacred Pro', url: 'ru.jacred.pro', key: '', int: 'all', lang: 'lg'},
            {id: 'jac_black', title: 'Jac Black', url: 'jacblack.ru:9117', key: '', int: 'all', lang: 'lg'}
        ];

        // Применение настроек сервера
        function applyServer(id) {
            const server = servers.find(s => s.id === id) || servers.find(s => s.id === 'jacred_xyz');
            Lampa.Storage.set('jackett_url', server.url);
            Lampa.Storage.set('jackett_key', server.key);
            Lampa.Storage.set('jackett_interview', server.int);
            Lampa.Storage.set('parse_in_search', true);
            Lampa.Storage.set('parse_lang', server.lang);
            Lampa.Storage.set('jackett_urltwo', server.id);

            // Скрываем стандартные поля
            $('div[data-name="jackett_url"]').hide();
            $('div[data-name="jackett_key"]').hide();

            Lampa.Settings.update();
        }

        // Проверка доступности для выпадающего списка
        function updateDropdownStatus() {
            servers.forEach((server, index) => {
                setTimeout(() => {
                    let proto = server.url.includes('jr.maxvol.pro') ? 'https://' : protocol;
                    const testUrl = proto + server.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key;

                    const xhr = new XMLHttpRequest();
                    xhr.timeout = 4000;
                    xhr.open('GET', testUrl, true);
                    xhr.onload = () => {
                        const mark = xhr.status === 200 ? '✔' : '✘';
                        const color = xhr.status === 200 ? '#64e364' : '#ff2121';
                        const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
                        if ($(selector).text().includes(server.title)) {
                            $(selector).html(mark + '&nbsp;&nbsp;' + server.title).css('color', color);
                        }
                    };
                    xhr.onerror = xhr.ontimeout = () => {
                        const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;
                        if ($(selector).text().includes(server.title)) {
                            $(selector).html('✘&nbsp;&nbsp;' + server.title).css('color', '#ff2121');
                        }
                    };
                    xhr.send();
                }, index * 300);
            });
        }

        // Иконка Jackett (полный SVG из оригинала)
        const jackettIcon = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"></path><path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"></path><path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"></path><path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path><path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path><path d="M511.881,432.984L455.414,60.652c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c4.936,6.802,30.149-138.858z"></path><path d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"></path></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0"><div style="background:#d99821;padding:0.5em;border-radius:0.4em"><div style="line-height:0.3">Выбрать парсер</div></div></div></div></div>';

        // Добавляем пункт в настройки
        Lampa.SettingsApi.addParam({
            component: 'parser',
            param: {
                name: 'jackett_urltwo',
                type: 'select',
                values: servers.reduce((obj, s) => { obj[s.id] = s.title; return obj; }, {no_parser: 'Нет парсера'}),
                default: 'jacred_xyz'
            },
            field: {
                name: jackettIcon,
                description: 'Нажмите для выбора парсера из списка'
            },
            onChange: (value) => {
                if (value !== 'no_parser') applyServer(value);
                Lampa.Settings.update();
            },
            onRender: () => {
                setTimeout(updateDropdownStatus, 500);
            }
        });

        // Модальное меню с проверкой доступности
        $(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', () => {
            Promise.all(servers.map(server => {
                return new Promise(resolve => {
                    let proto = server.url.includes('jr.maxvol.pro') ? 'https://' : protocol;
                    const testUrl = proto + server.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key;
                    const xhr = new XMLHttpRequest();
                    xhr.timeout = 4000;
                    xhr.open('GET', testUrl, true);
                    xhr.onload = () => {
                        const status = xhr.status === 200 ? '✔' : '✘';
                        const color = xhr.status === 200 ? '#64e364' : '#ff2121';
                        resolve({title: `<span style="color:${color}">${status}&nbsp;&nbsp;${server.title}</span>`, server});
                    };
                    xhr.onerror = xhr.ontimeout = () => resolve({title: `<span style="color:#ff2121">✘&nbsp;&nbsp;${server.title}</span>`, server});
                    xhr.send();
                });
            })).then(results => {
                Lampa.Modal.open({
                    title: 'Выбрать парсер',
                    items: results.map(r => ({title: r.title, server: r.server})),
                    onSelect: item => {
                        applyServer(item.server.id);
                        Lampa.Modal.close();
                        setTimeout(() => location.reload(), 500);
                    },
                    onBack: () => Lampa.Modal.close()
                });
            });
        });

        // Проверка при открытии настроек
        Lampa.Controller.add('settings_component', {
            open: updateDropdownStatus
        });

        // Дефолтные настройки при первом запуске
        if (!Lampa.Storage.get('jack')) {
            Lampa.Storage.set('jack', true);
            applyServer('jacred_xyz');
        }

        // Показ раздела парсера при выборе Jackett
        Lampa.Storage.onChange?.('torrents', value => {
            if (value === 'jackett') $('div[data-children="parser"]').show();
            else $('div[data-children="parser"]').hide();
        });
    }
})();
