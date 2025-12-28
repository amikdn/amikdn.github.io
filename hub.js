(function () {
    'use strict';

    // Полная иконка Jackett из оригинального кода
    const jackettIcon = '<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#000000"><g><polygon style="fill:#074761;" points="187.305,27.642 324.696,27.642 256,236.716"></polygon><polygon style="fill:#10BAFC;" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"></polygon><g><polygon style="fill:#0084FF;" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"></polygon><polygon style="fill:#0084FF;" points="163.005,151.035 196.964,151.035 110.934,49.96 66.917,62.218 117.726,217.908 117.726,484.356 256,484.356 256,236.716"></polygon></g><polygon style="fill:#10BAFC;" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"></polygon><g><polygon style="fill:#0084FF;" points="445.084,62.218 501.551,434.55 445.084,451.922 394.275,217.908"></polygon><polygon style="fill:#0084FF;" points="348.996,151.035 315.037,151.035 401.067,49.96 445.084,62.218 394.275,217.908 394.275,484.356 256,484.356 256,236.716"></polygon></g><path d="M291.559,308.803c-7.49,0-13.584-6.094-13.584-13.584c0-7.49,6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 C305.143,302.71,299.049,308.803,291.559,308.803z"></path><path d="M291.559,427.919c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,427.919,291.559,427.919z"></path><path d="M291.559,368.405c-7.49,0-13.584-6.094-13.584-13.584s6.094-13.584,13.584-13.584s13.584,6.094,13.584,13.584 S299.049,368.405,291.559,368.405z"></path><path d="M225.677,424.785h-4.678c-5.77,0-10.449-4.679-10.449-10.449s4.679-10.449,10.449-10.449h4.678 c5.771,0,10.449,4.679,10.449,10.449S231.448,424.785,225.677,424.785z"></path><path d="M384.063,220.125c8.948-1.219,5.008,7.842,10.646,6.617c5.637-1.225,8.551-16.691,9.775-11.052"></path><path d="M511.881,432.984L455.414,60.652c-0.178-1.166-0.541-2.306-1.109-3.367 c-1.346-2.513-3.66-4.367-6.407-5.131L327.627,17.613c-0.976-0.284-1.961-0.416-2.931-0.416c0-0.001-137.391-0.001-137.391-0.001 c-0.97,0.001-1.955,0.132-2.931,0.417L64.114,52.152c-2.747,0.766-5.061,2.619-6.407,5.131c-0.569,1.064-0.933,2.208-1.11,3.377 L0.119,432.984c-0.776,5.117,2.311,10.032,7.258,11.553l56.467,17.371 c4.936,6.802,30.149-138.858z"></path></g></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0;"><div style="background:#d99821;padding:0.5em;border-radius:0.4em;"><div style="line-height:0.3;">Выбрать парсер</div></div></div></div></div>';

    // Список серверов
    const servers = [
        {title: 'Jacred Lampa32 RU', url: '62.60.149.237:8443', key: '', int: 'all', lang: 'lg', id: 'jac_lampa32_ru'},
        {title: 'Lampa Jackett', url: 'bylampa.cc', key: '5178915kmzeLa', int: 'all', lang: 'df', id: 'bylampa_jackett'},
        {title: 'Jacred.xyz', url: 'jacred.xyz', key: '', int: 'healthy', lang: 'lg', id: 'jacred_xyz'},
        {title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', key: '', int: 'healthy', lang: 'lg', id: 'jr_maxvol_pro'},
        {title: 'Jacred RU', url: 'jac-red.ru', key: '', int: 'all', lang: 'lg', id: 'jacred_ru'},
        {title: 'Jacred Viewbox Dev', url: 'jacred.viewbox.dev', key: '777', int: 'all', lang: 'lg', id: 'jacred_viewbox_dev'},
        {title: 'Jacred Pro', url: 'ru.jacred.pro', key: '', int: 'all', lang: 'lg', id: 'jacred_pro'},
        {title: 'Jac Black', url: 'jacblack.ru:9117', key: '', int: 'all', lang: 'lg', id: 'jac_black'}
    ];

    // Проверка доступности для модального меню и dropdown
    function checkServer(url, key = '', title, proto = location.protocol === 'https:' ? 'https://' : 'http://') {
        return new Promise(resolve => {
            if (url.includes('jr.maxvol.pro')) proto = 'https://';
            const testUrl = `${proto}${url}/api/v2.0/indexers/status:healthy/results?apikey=${key}`;
            const xhr = new XMLHttpRequest();
            xhr.timeout = 4000;
            xhr.open('GET', testUrl, true);
            xhr.onload = () => resolve({title, status: xhr.status === 200 ? '✔' : '✘', color: xhr.status === 200 ? '#64e364' : '#ff2121'});
            xhr.onerror = xhr.ontimeout = () => resolve({title, status: '✘', color: '#ff2121'});
            xhr.send();
        });
    }

    // Применение настроек
    function applySettings(id) {
        const server = servers.find(s => s.id === id) || servers[2]; // дефолт jacred.xyz
        Lampa.Storage.set('jackett_url', server.url);
        Lampa.Storage.set('jackett_key', server.key);
        Lampa.Storage.set('jackett_interview', server.int);
        Lampa.Storage.set('parse_in_search', true);
        Lampa.Storage.set('parse_lang', server.lang);
        Lampa.Storage.set('jackett_urltwo', id);
    }

    // Добавление пункта в настройки
    Lampa.SettingsApi.addParam({
        component: 'parser',
        param: {name: 'jackett_urltwo', type: 'select', values: {}, default: 'jacred_xyz'},
        field: {name: jackettIcon + '<div style="margin-left:0.5em">Меню смены парсера</div>', description: 'Нажмите для выбора парсера из списка'},
        onChange: value => applySettings(value),
        onRender: () => {
            // Заполняем values динамически
            const values = {'no_parser': 'Нет парсера'};
            servers.forEach(s => values[s.id] = s.title);
            Lampa.SettingsApi.getParam('jackett_urltwo').values = values;

            // Скрываем стандартные поля
            if (Lampa.Storage.get('jackett_urltwo') && Lampa.Storage.get('jackett_urltwo') !== 'no_parser') {
                $('div[data-name="jackett_url"]').hide();
                $('div[data-name="jackett_key"]').hide();
            }
        }
    });

    // Модальное меню
    $('div[data-name="jackett_urltwo"]').on('hover:enter', () => {
        Promise.all(servers.map(s => checkServer(s.url, s.key, s.title))).then(results => {
            Lampa.Modal.open({
                title: 'Выбрать парсер',
                items: results.map((r, i) => ({title: `<span style="color:${r.color}">${r.status}&nbsp;&nbsp;${r.title}</span>`, server: servers[i]})),
                onSelect: item => {
                    applySettings(item.server.id);
                    Lampa.Modal.close();
                    Lampa.Settings.update();
                    setTimeout(() => location.reload(), 500);
                },
                onBack: () => Lampa.Modal.close()
            });
        });
    });

    // Первый запуск
    if (!Lampa.Storage.get('jack', false)) {
        Lampa.Storage.set('jack', true);
        applySettings('jacred_xyz');
    }

    // Показ/скрытие при смене типа парсера
    Lampa.Storage.onChange('torrents', value => {
        if (value === 'jackett') $('div[data-children="parser"]').show();
        else $('div[data-children="parser"]').hide();
    });

})();
