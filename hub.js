(function () {
    'use strict';

    Lampa.Platform.tv();

    // Протокол
    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    // Сервера и их названия
    const servers = [
        'lampa.app',            // 0 (не используется)
        'bylampa.cc',           // 1 Lampa Jackett
        'jac-red.ru',           // 2 Jacred RU (не в списке, но был)
        'jr.maxvol.pro',        // 3 Jacred Maxvol Pro
        'jacred.viewbox.dev',   // 4 Jacred Viewbox Dev
        'ru.jacred.pro',        // 5 Jacred Pro
        'jacblack.ru:9117',     // 6 Jac Black
        'jacred.xyz'            // 7 Jacred.xyz
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

    // Проверка одного сервера для dropdown в настройках
    function checkServerForDropdown(index) {
        setTimeout(() => {
            let apikey = servers[index] === 'bylampa.cc' ? '5178915kmzeLa' : '';
            let proto = servers[index] === 'jr.maxvol.pro' ? 'https://' : protocol;
            const url = `${proto}${servers[index]}/api/v2.0/indexers/status:healthy/results?apikey=${apikey}`;

            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.send();

            const selector = `body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(${index + 2}) > div`;

            const mark = (color, symbol) => {
                if ($(selector).text() === serverTitles[index]) {
                    $(selector).html(`${symbol}&nbsp;&nbsp;${$(selector).text()}`).css('color', color);
                }
            };

            xhr.ontimeout = xhr.onerror = () => mark('#ff2121', '✘');
            xhr.onload = () => {
                if (xhr.status === 200) mark('#64e364', '✔');
                else if (xhr.status === 401) mark('#ffffff', '✘');
                else mark('#ff2121', '✘');
            };
        }, 1000);
    }

    function checkAllForDropdown() {
        for (let i = 0; i < servers.length; i++) checkServerForDropdown(i);
    }

    // Применение настроек сервера
    function applyServerSettings() {
        const selected = Lampa.Storage.get('jackett_urltwo') || 'jacred_xyz';

        const settings = {
            no_parser: { url: '', key: '', int: 'all', search: false, lang: 'lg' },
            jac_lampa32_ru: { url: '62.60.149.237:8443', key: '', int: 'all', search: true, lang: 'lg' },
            bylampa_jackett: { url: 'bylampa.cc', key: '5178915kmzeLa', int: 'all', search: true, lang: 'df' },
            jacred_xyz: { url: 'jacred.xyz', key: '', int: 'healthy', search: true, lang: 'lg' },
            jr_maxvol_pro: { url: 'jr.maxvol.pro', key: '', int: 'healthy', search: true, lang: 'lg' },
            jac_black: { url: 'jacblack.ru:9117', key: '', int: 'all', search: true, lang: 'lg' },
            jacred_ru: { url: 'jac-red.ru', key: '', int: 'all', search: true, lang: 'lg' },
            jacred_viewbox_dev: { url: 'jacred.viewbox.dev', key: '777', int: 'all', search: true, lang: 'lg' },
            jacred_pro: { url: 'ru.jacred.pro', key: '', int: 'all', search: true, lang: 'lg' }
        };

        const s = settings[selected] || settings.jacred_xyz;

        Lampa.Storage.set('jackett_url', s.url);
        Lampa.Storage.set('jackett_key', s.key);
        Lampa.Storage.set('jackett_interview', s.int);
        Lampa.Storage.set('parse_in_search', s.search);
        Lampa.Storage.set('parse_lang', s.lang);

        Lampa.Settings.update();
    }

    // Добавление параметра в настройки
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
        onChange: applyServerSettings,
        onRender: () => {
            setTimeout(() => {
                checkAllForDropdown();
                if (Lampa.Storage.get('jackett_urltwo') !== 'custom' && localStorage.getItem('parser_torrent_type') !== 'custom') {
                    $('div[data-name="jackett_url"]').hide();
                    $('div[data-name="jackett_key"]').hide();
                }
                if (Lampa.Storage.get('torrents') === 'jackett') {
                    $('div[data-children="parser"]').show();
                }
            }, 100);
        }
    });

    // Первый запуск
    if (!Lampa.Storage.get('jack', 'false')) {
        Lampa.Storage.set('jack', 'true');
        Lampa.Storage.set('jackett_url', 'jacred.xyz');
        Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('jackett_interview', 'healthy');
        Lampa.Storage.set('parse_lang', 'lg');
    }

    // === Модальное меню выбора с проверкой ===
    function checkSingleServerForModal(domain, title, data) {
        return new Promise(resolve => {
            let apikey = domain === 'bylampa.cc' ? '5178915kmzeLa' : (domain === 'jacred.viewbox.dev' ? '777' : '');
            let proto = domain === 'jr.maxvol.pro' ? 'https://' : protocol;
            const url = `${proto}${domain}/api/v2.0/indexers/status:healthy/results?apikey=${apikey}`;

            const xhr = new XMLHttpRequest();
            xhr.timeout = 3000;
            xhr.open('GET', url, true);
            xhr.onload = () => {
                data.title = xhr.status === 200 ? `<span style="color:#64e364;">✔&nbsp;&nbsp;${title}</span>` : `<span style="color:#ff2121;">✘&nbsp;&nbsp;${title}</span>`;
                resolve(data);
            };
            xhr.onerror = xhr.ontimeout = () => {
                data.title = `<span style="color:#ff2121;">✘&nbsp;&nbsp;${title}</span>`;
                resolve(data);
            };
            xhr.send();
        });
    }

    function openParserModal() {
        const list = [
            { title: 'Jacred Lampa32 RU', url: '62.60.149.237:8443', url_two: 'jac_lampa32_ru', key: '', int: 'all', lang: 'lg' },
            { title: 'Lampa Jackett', url: 'bylampa.cc', url_two: 'bylampa_jackett', key: '5178915kmzeLa', int: 'all', lang: 'df' },
            { title: 'Jacred.xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', key: '', int: 'healthy', lang: 'lg' },
            { title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', key: '', int: 'healthy', lang: 'lg' },
            { title: 'Jacred RU', url: 'jac-red.ru', url_two: 'jacred_ru', key: '', int: 'all', lang: 'lg' },
            { title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev', url_two: 'jacred_viewbox_dev', key: '777', int: 'all', lang: 'lg' },
            { title: 'Jacred Pro', url: 'ru.jacred.pro', url_two: 'jacred_pro', key: '', int: 'all', lang: 'lg' },
            { title: 'Jac Black', url: 'jacblack.ru:9117', url_two: 'jac_black', key: '', int: 'all', lang: 'lg' }
        ];

        Promise.all(list.map(item => checkSingleServerForModal(item.url, item.title, item))).then(items => {
            Lampa.Modal.open({
                title: 'Выбрать парсер',
                items: items.map(i => ({ title: i.title, ...i })),
                onSelect: item => {
                    Lampa.Storage.set('jackett_url', item.url);
                    Lampa.Storage.set('jackett_urltwo', item.url_two);
                    Lampa.Storage.set('jackett_key', item.key);
                    Lampa.Storage.set('jackett_interview', item.int);
                    Lampa.Storage.set('parse_lang', item.lang);
                    Lampa.Storage.set('parse_in_search', true);
                    Lampa.Modal.close();
                    setTimeout(() => location.reload(), 500);
                },
                onBack: () => Lampa.Modal.close()
            });
        });
    }

    // Открытие модального меню по нажатию на пункт
    $(document).on('click', 'div[data-name="jackett_urltwo"]', openParserModal);

    // Проверка при открытии настроек
    Lampa.Controller.add('settings_component', { open: checkAllForDropdown });

})();
