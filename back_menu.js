'use strict';

Lampa.Platform.tv();

function initBackMenu() {
    // -------------------------------------------------------------------------
    // Константы (заглавия и HTML-элементы)
    // -------------------------------------------------------------------------
    const exitTitle         = 'Закрыть приложение';
    const rebootTitle       = 'Перезагрузить';
    const clearCacheTitle   = 'Очистить кэш';
    const clearCacheHTML    = `
        <div class="settings-folder" style="padding:0!important">
            <div style="width:2.2em;height:1.7em;padding-right:.5em">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <path fill="currentColor" d="M26 20h-6v-2h6zm4 8h-6v-2h6zm-2-4h-6v-2h6z"/>
                    <path fill="currentColor" d="M17.003 20a4.9 4.9 0 0 0-2.404-4.173L22 3l-1.73-1l-7.577 13.126a5.7 5.7 0 0 0-5.243 1.503C3.706 20.24 3.996 28.682 4.01 29.04a1 1 0 0 0 1 .96h14.991a1 1 0 0 0 .6-1.8c-3.54-2.656-3.598-8.146-3.598-8.2m-5.073-3.003A3.11 3.11 0 0 1 15.004 20c0 .038.002.208.017.469l-5.9-2.624a3.8 3.8 0 0 1 2.809-.848M15.45 28A5.2 5.2 0 0 1 14 25h-2a6.5 6.5 0 0 0 .968 3h-2.223A16.6 16.6 0 0 1 10 24H8a17.3 17.3 0 0 0 .665 4H6c.031-1.836.29-5.892 1.803-8.553l7.533 3.35A13 13 0 0 0 17.596 28Z"/>
                </svg>
            </div>
            <div style="font-size:1.3em">Очистить кэш</div>
        </div>`.trim();

    const youtubeTitle = 'YouTube';
    const rutubeTitle  = 'RuTube';

    const drmPlayHTML = `
        <div class="settings-folder" style="padding:0!important">
            <div style="width:2.2em;height:1.7em;padding-right:.5em">
                <svg fill="#ffffff" width="256px" height="256px" viewBox="0 -6 46 46" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="2.3">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path id="24.TV" data-name="24.TV" d="M46,37H2a1,1,0,0,1-1-1V8A1,1,0,0,1,2,7H46a1,1,0,0,1,1,1V36A1,1,0,0,1,46,37ZM45,9H3V35H45ZM21,16a.975.975,0,0,1,.563.2l7.771,4.872a.974.974,0,0,1,.261,1.715l-7.974,4.981A.982.982,0,0,1,21,28a1,1,0,0,1- мероприятия1-1V17A1,1,0,0,1,21,16ZM15,39H33a1,1,0,0,1,0,2H15a1,1,0,0,1,0-2Z" transform="translate(-1 -7)" fill-rule="evenodd"></path>
                    </g>
                </svg>
            </div>
            <div style="font-size:1.3em">DRM Play</div>
        </div>`.trim();

    const switchServerTitle = 'Сменить сервер';

    const forkPlayerHTML = `
        <div class="settings-folder" style="padding:0!important">
            <div style="width:2.2em;height:1.7em;padding-right:.5em">
                <svg width="256px" height="256px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00032">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <g fill="none" fill-rule="evenodd">
                            <path d="m0 0h32v32h-32z"></path>
                            <g fill="#ffffff" fill-rule="nonzero">
                                <path d="m32 16c0-8.83636363-7.1636364-16-16-16-8.83636362 0-16 7.16363638-16 16 0 8.8363636 7.16363638 16 16 16 8.8363636 0 16-7.1636364 16-16zm-30.54545453 0c0-8.03345453 6.512-14.54545453 14.54545453-14.54545453 8.0334545 0 14.5454545 6.512 14.5454545 14.54545453 0 8.0334545-6.512 14.5454545-14.5454545 14.5454545-8.03345453 0-14.54545453-6.512-14.54545453-14.5454545z"></path>
                                <path d="m16.6138182 25.2349091v-9.2349091h3.0472727l.4814545-3.0603636h-3.5287272v-1.5345455c0-.7985455.2618182-1.56072727 1.408-1.56072727h2.2909091v-3.05454547h-3.2523636c-2.7345455 0-3.4807273 1.80072728-3.4807273 4.29672724v1.8516364h-1.8763637v3.0618182h1.8763636v9.2349091z"></path>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>
            <div style="font-size:1.3em">ForkPlayer</div>
        </div>`.trim();

    const speedTestTitle = 'Speed Test';

    // -------------------------------------------------------------------------
    // Плейсхолдеры слушателей
    // -------------------------------------------------------------------------
    Lampa.Listener.follow('main', () => {});

    Lampa.Controller.listener.follow('select', (e) => {
        if (e.name === 'back_menu') {
            Lampa.Settings.addComponent({ component: 'back_menu', name: 'Выход' });
            setTimeout(() => $('div[data-component="back_menu"]').show(), 0);
        }
    });

    // -------------------------------------------------------------------------
    // Параметры настроек
    // -------------------------------------------------------------------------
    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'exit', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: !![] },
        field:     { name: 'Меню Выход', description: 'Настройки отображения пунктов меню' },
        onRender:  (field) => {
            field.on('hover:enter', () => {
                Lampa.Settings.create('back_menu');
                Lampa.Controller.toggle('back_menu').back = () => Lampa.Controller.toggle('main');
            });
        }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'exit', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '2' },
        field:     { name: 'Выход', description: 'Нажмите для выбора' }
    });

    Lampa.SettingsApi.addParam({
        component: 'back_menu',
        param:     { name: 'reboot', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '2' },
        field:     { name: 'Перезагрузить', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'clear_cache', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '2' },
        field:     { name: 'Очистить кэш', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'switch_server', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '2' },
        field:     { name: 'Сменить сервер', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'youtube', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'YouTube', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'rutube', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'RuTube', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'back_plug', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'Закрыть приложение', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'twitch', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'Twitch', description: 'Нажмите для выбора' }
    });

    Lampa.SettingsApi.addParam({
        component: 'back_menu',
        param:     { name: 'drm_play', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'DRM Play', description: 'Нажмите для выбора' }
    });

    Lampa.Settings.addParam({
        component: 'back_menu',
        param:     { name: 'fork_player', type: 'select', values: { 1: 'Скрыть', 2: 'Отобразить' }, default: '1' },
        field:     { name: 'ForkPlayer', description: 'Нажмите для выбора' }
    });

    // -------------------------------------------------------------------------
    // Применение дефолтных настроек один раз
    // -------------------------------------------------------------------------
    const initInterval = setInterval(() => {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('lampa', 'false')) applyDefaults();
        }
    }, 200);

    function applyDefaults() {
        Lampa.Storage.set('lampa', true);
        Lampa.Storage.set('exit',          '2');
        Lampa.Storage.set('reboot',        '2');
        Lampa.Storage.set('clear_cache',   '2');
        Lampa.Storage.set('switch_server', '2');
        Lampa.Storage.set('youtube',       '1');
        Lampa.Storage.set('rutube',        '1');
        Lampa.Storage.set('back_plug',     '1');
        Lampa.Storage.set('twitch',        '1');
        Lampa.Storage.set('drm_play',      '1');
        Lampa.Storage.set('fork_player',   '1');
    }

    // -------------------------------------------------------------------------
    // Вспомогательные функции
    // -------------------------------------------------------------------------
    function openSpeedTest() {
        const html = $(`
            <div style="text-align:right;">
                <div style="min-height:360px;">
                    <iframe id="speedtest-iframe" width="100%" height="100%" frameborder="0"></iframe>
                </div>
            </div>`.trim());

        Lampa.Modal.open({
            title: '',
            html,
            size: 'medium',
            mask: true,
            onBack: () => {
                Lampa.Modal.close();
                Lampa.Controller.toggle('main');
            },
            onSelect: () => {}
        });

        document.getElementById('speedtest-iframe').src = 'http://speedtest.vokino.tv/?R=3';
    }

    function clearCache() {
        Lampa.Storage.clear();
    }

    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    function changeServer() {
        Lampa.Input.edit({
            title: 'Укажите сервер',
            value: '',
            free:  true
        }, (server) => {
            if (server !== '') {
                window.location.href = protocol + server;
            } else {
                buildMenu();
            }
        });
    }

    function exitApp() {
        if (Lampa.Platform.is('netcast') && window.location.href.includes('exit://exit')) {
            window.location.href = 'exit://exit';
        }
        if (Lampa.Platform.is('tizen'))   tizen.application.getCurrentApplication().exit();
        if (Lampa.Platform.is('webos'))   window.close();
        if (Lampa.Platform.is('android')) Lampa.Android.exit();
        if (Lampa.Platform.is('orsay'))   Lampa.Orsay.exit();
        if (Lampa.Platform.is('apple_tv'))window.close();
        if (Lampa.Platform.is('browser')) window.history.back();
        if (Lampa.Platform.is('browser')) window.close();
        if (Lampa.Platform.is('nw'))      nw.Window.get().close();
    }

    function buildMenu() {
        const items = [];

        if (localStorage.getItem('exit')          !== '1') items.push({ title: exitTitle });
        if (localStorage.getItem('reboot')        !== '1') items.push({ title: rebootTitle });
        if (localStorage.getItem('clear_cache')   !== '1') items.push({ title: clearCacheHTML });
        if (localStorage.getItem('switch_server') !== '1') items.push({ title: switchServerTitle });
        if (localStorage.getItem('youtube')       !== '1') items.push({ title: youtubeTitle });
        if (localStorage.getItem('rutube')        !== '1') items.push({ title: rutubeTitle });
        if (localStorage.getItem('drm_play')      !== '1') items.push({ title: drmPlayHTML });
        if (localStorage.getItem('fork_player')   !== '1') items.push({ title: forkPlayerHTML });
        if (localStorage.getItem('speedtest')     !== '1') items.push({ title: speedTestTitle });

        Lampa.Select.show({
            title: 'Выход',
            items,
            onBack: () => Lampa.Controller.toggle('main'),
            onSelect: (item) => {
                if (item.title === exitTitle)                  exitApp();
                if (item.title === rebootTitle)                location.reload();
                if (item.title.includes('Очистить кэш'))       clearCache();
                if (item.title === switchServerTitle)          changeServer();
                if (item.title === youtubeTitle)               window.location.href = 'https://youtube.com/tv';
                if (item.title === rutubeTitle)                window.location.href = 'https://rutube.ru/tv-release/rutube.server-22.0.0/webos/';
                if (item.title === 'DRM Play')                 window.location.href = 'https://ott.drm-play.com';
                if (item.title === 'ForkPlayer')               window.location.href = 'http://browser.appfxml.com';
                if (item.title === speedTestTitle)             openSpeedTest();
            }
        });
    }

    // -------------------------------------------------------------------------
    // Открытие меню при выборе пункта «Выход» в главном селекте
    // -------------------------------------------------------------------------
    Lampa.Controller.listener.follow('select', (e) => {
        if (e.name === 'select' && $('.selectbox__title').text() === Lampa.Lang.translate('title_out')) {
            Lampa.Select.hide();
            setTimeout(buildMenu, 100);
        }
    });
}

// -------------------------------------------------------------------------
// Запуск при готовности приложения
// -------------------------------------------------------------------------
if (window.appready) {
    initBackMenu();
} else {
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') initBackMenu();
    });
}
