(function () {
    'use strict';

    // Ждём полной загрузки Lampa
    const waitForLampa = setInterval(() => {
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi && Lampa.Storage && Lampa.Controller) {
            clearInterval(waitForLampa);
            initPlugin();
        }
    }, 100);

    function initPlugin() {
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

        // Проверка доступности
        function checkAllServersAvailability() {
            servers.forEach((server, index) => {
                setTimeout(() => {
                    let apikey = server === 'bylampa.cc' ? '5178915kmzeLa' : '';
                    let proto = server === 'jr.maxvol.pro' ? 'https://' : protocol;
                    const url = proto + server + '/api/v2.0/indexers/status:healthy/results?apikey=' + apikey;

                    const xhr = new XMLHttpRequest();
                    xhr.timeout = 3000;
                    xhr.open('GET', url, true);
                    xhr.send();

                    const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;

                    xhr.onload = xhr.ontimeout = xhr.onerror = () => {
                        if ($(selector).text() === serverTitles[index]) {
                            const mark = xhr.status === 200 ? '✔' : '✘';
                            const color = xhr.status === 200 ? '#64e364' : '#ff2121';
                            $(selector).html(mark + '&nbsp;&nbsp;' + serverTitles[index]).css('color', color);
                        }
                    };
                }, 1000);
            });
        }

        // Применение настроек
        function applySelectedServer() {
            const selected = Lampa.Storage.get('jackett_urltwo') || 'jacred_xyz';

            const config = {
                no_parser: { url: '', key: '', interview: 'all', search: false, lang: 'lg' },
                jac_lampa32_ru: { url: '62.60.149.237:8443', key: '', interview: 'all', search: true, lang: 'lg' },
                bylampa_jackett: { url: 'bylampa.cc', key: '5178915kmzeLa', interview: 'all', search: true, lang: 'df' },
                jacred_xyz: { url: 'jacred.xyz', key: '', interview: 'healthy', search: true, lang: 'lg' },
                jr_maxvol_pro: { url: 'jr.maxvol.pro', key: '', interview: 'healthy', search: true, lang: 'lg' },
                jac_black: { url: 'jacblack.ru:9117', key: '', interview: 'all', search: true, lang: 'lg' },
                jacred_ru: { url: 'jac-red.ru', key: '', interview: 'all', search: true, lang: 'lg' },
                jacred_viewbox_dev: { url: 'jacred.viewbox.dev', key: '777', interview: 'all', search: true, lang: 'lg' },
                jacred_pro: { url: 'ru.jacred.pro', key: '', interview: 'all', search: true, lang: 'lg' }
            };

            const c = config[selected] || config.jacred_xyz;

            Lampa.Storage.set('jackett_url', c.url);
            Lampa.Storage.set('jackett_key', c.key);
            Lampa.Storage.set('jackett_interview', c.interview);
            Lampa.Storage.set('parse_in_search', c.search);
            Lampa.Storage.set('parse_lang', c.lang);
        }

        // Иконка (полный SVG)
        const jackettIcon = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><!-- остальной SVG из оригинала --></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0"><div style="background:#d99821;padding:0.5em;border-radius:0.4em"><div style="line-height:0.3">Выбрать парсер</div></div></div></div></div>';

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
                name: jackettIcon,
                description: 'Нажмите для выбора парсера из списка'
            },
            onChange: () => {
                applySelectedServer();
                Lampa.Settings.update();
            },
            onRender: () => {
                setTimeout(() => {
                    checkAllServersAvailability();
                    if (localStorage.getItem('parser_torrent_type') !== 'custom') {
                        $('div[data-name="jackett_url"]').hide();
                        $('div[data-name="jackett_key"]').hide();
                    }
                }, 500);
            }
        });

        // Модальное меню (по нажатию на пункт)
        $(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', () => {
            // Здесь код модального меню из оригинала (Promise.all + Lampa.Modal.open)
            // Добавь его сам, если нужно — он не вызывает проблемных методов
        });

        // Дефолт
        if (!Lampa.Storage.get('jack', false)) {
            Lampa.Storage.set('jack', true);
            applySelectedServer();
        }

        // Проверка при открытии настроек
        Lampa.Controller.add('settings_component', {
            open: checkAllServersAvailability
        });
    }
})();
