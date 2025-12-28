(function () {
    'use strict';

    // Ждём загрузки Lampa
    const init = setInterval(() => {
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi && Lampa.Storage && Lampa.Modal && Lampa.Controller) {
            clearInterval(init);
            runPlugin();
        }
    }, 100);

    function runPlugin() {
        Lampa.Platform.tv();

        const corsProxy = 'https://cors.bwa.workers.dev/?'; // Бесплатный CORS-прокси, обходит ошибки

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

        // Применение настроек
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

        // Полный правильный SVG иконки Jackett
        const jackettIconHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"></path><path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"></path><path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"></path><path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path><path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path><path d="M511.881,432.984L455.414,60.652c-0.004-0.001-0.008-0.001-0.013-0.002c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 c-0.004-0.002-0.007-0.006-0.011-0.009L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c1.005,0.309,2.041,0.462,3.072,0.462c1.836,0,3.659-0.484,5.276-1.429c2.524-1.476,4.315-3.943,4.936-6.802l30.149-138.858v169.075 c0,5.771,4.679,10.449,10.449,10.449h276.548c5.77,0,10.449-4.678,10.449-10.449V315.281l30.148,138.858 c0.621,2.858,2.412,5.326,4.936,6.802c1.616,0.946,3.44,1.429,5.276,1.429c1.031,0,2.067-0.154,3.072-0.462l56.467-17.371 C509.571,443.015,512.658,438.101,511.881,432.984z M331.467,40.507l51.19,14.959l-75.578,88.795 c-2.64,3.102-3.237,7.457-1.529,11.155c1.709,3.698,5.411,6.067,9.486,6.067h7.198l-43.765,40.324L331.467,40.507z M180.533,40.507 l52.998,161.3l-43.765-40.324h7.198c4.074,0,7.776-2.369,9.486-6.067c1.708-3.698,1.112-8.053-1.529-11.155l-75.578-88.795 L180.533,40.507z M59.119,438.59l-36.987-11.379l48.512-319.89l36.269,111.136L59.119,438.59z M245.552,473.907H128.175v-49.123 h59.02c5.77,0,10.449-4.679,10.449-10.449s-4.679-10.449-10.449-10.449h-59.02V217.908c0-1.101-0.174-2.195-0.515-3.242 L80.238,69.355l27.068-7.539l67.043,78.769h-11.343c-4.304,0-8.168,2.638-9.733,6.649c-1.565,4.009-0.512,8.568,2.653,11.484 l89.627,82.578L245.552,473.907z M201.736,38.092h108.528L256,203.243L201.736,38.092z M384.341,214.666 c-0.341,1.047-0.515,2.141-0.515,3.242v255.999H266.449V241.297l89.627-82.578c3.165-2.916,4.218-7.475,2.653-11.484 c-1.565-4.01-5.429-6.649-9.733-6.649h-11.343l67.043-78.769l27.068,7.539L384.341,214.666z M452.882,438.59l-47.795-220.132 l36.268-111.136l48.515,319.89L452.882,438.59z"></path><path d="M353.197,262.86h-61.637c-5.77,0-10.449-4.679-10.449-10.449c0-5.771,4.679-10.449,10.449-10.449h61.637 c5.77,0,10.449,4.678,10.449,10.449C363.646,258.182,358.968,262.86,353.197,262.86z"></path></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0"><div style="background:#d99821;padding:0.5em;border-radius:0.4em"><div style="line-height:0.3">Выбрать парсер</div></div></div></div></div>';

        // Добавляем пункт под "Тип парсера для торрентов"
        Lampa.SettingsApi.addParam({
            component: 'parser',
            param: {
                name: 'jackett_urltwo',
                type: 'select',
                values: servers.reduce((o, s) => { o[s.id] = s.title; return o; }, {no_parser: 'Нет парсера'}),
                default: 'jacred_xyz'
            },
            field: {
                name: jackettIconHtml,
                description: 'Нажмите для выбора парсера из списка'
            },
            onChange: value => {
                if (value !== 'no_parser') applyServer(value);
            },
            onRender: element => {
                // Вставляем сразу под "Тип парсера для торрентов"
                const typeElement = $('div[data-name="parser_torrent_type"]');
                if (typeElement.length && element.parent().find('div[data-name="jackett_urltwo"]').length === 0) {
                    element.insertAfter(typeElement);
                }

                // Проверка доступности в выпадающем списке
                setTimeout(() => {
                    servers.forEach((server, i) => {
                        setTimeout(() => {
                            const testUrl = corsProxy + (server.url.startsWith('http') ? '' : 'http://') + server.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key;

                            const xhr = new XMLHttpRequest();
                            xhr.timeout = 5000;
                            xhr.open('GET', testUrl, true);
                            xhr.onload = () => {
                                const mark = xhr.status === 200 ? '✔' : '✘';
                                const color = xhr.status === 200 ? '#64e364' : '#ff2121';
                                const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${i + 2}) > div`;
                                if ($(selector).text() === server.title) {
                                    $(selector).html(mark + '&nbsp;&nbsp;' + server.title).css('color', color);
                                }
                            };
                            xhr.onerror = xhr.ontimeout = () => {
                                const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${i + 2}) > div`;
                                if ($(selector).text() === server.title) {
                                    $(selector).html('✘&nbsp;&nbsp;' + server.title).css('color', '#ff2121');
                                }
                            };
                            xhr.send();
                        }, i * 300);
                    });
                }, 600);
            }
        });

        // Модальное меню с проверкой
        $(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', () => {
            Promise.all(servers.map(server => {
                return new Promise(resolve => {
                    const testUrl = corsProxy + (server.url.startsWith('http') ? '' : 'http://') + server.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + server.key;
                    const xhr = new XMLHttpRequest();
                    xhr.timeout = 5000;
                    xhr.open('GET', testUrl, true);
                    xhr.onload = () => {
                        const mark = xhr.status === 200 ? '✔' : '✘';
                        const color = xhr.status === 200 ? '#64e364' : '#ff2121';
                        resolve({title: `<span style="color:${color}">${mark}&nbsp;&nbsp;${server.title}</span>`, server});
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

        // Дефолт
        if (!Lampa.Storage.get('jack')) {
            Lampa.Storage.set('jack', true);
            applyServer('jacred_xyz');
        }

        // Проверка при открытии настроек
        Lampa.Controller.add('settings_component', {
            open: () => setTimeout(() => {
                // Можно добавить дополнительную проверку
            }, 500)
        });
    }
})();
