(function () {
  'use strict';

  Lampa.Platform.tv();

  const htmlCloseApp = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
          </g>
        </svg>
      </div>
      <div style="font-size:1.3em">Закрыть приложение</div>
    </div>`;

  const htmlReboot = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" id="svg4183" version="1.1" fill="currentColor">
          <g id="layer1" transform="rotate(-90 -504.181 526.181)">
            <path style="opacity:1;vector-effect:none;fill:currentColor;fill-opacity:1;stroke:none;stroke-width:4;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:3.20000005;stroke-opacity:.55063291" d="M11 2a9 9 0 0 0-4.676 1.324l1.461 1.461A7 7 0 0 1 11 4a7 7 0 0 1 7 7 7 7 0 0 1-.787 3.213l1.465 1.465A9 9 0 0 0 20 11a9 9 0 0 0-9-9zM3.322 6.322A9 9 0 0 0 2 11a9 9 0 0 0 9 9 9 9 0 0 0 4.676-1.324l-1.461-1.461A7 7 0 0 1 11 18a7 7 0 0 1-7-7 7 7 0 0 1 .787-3.213z" transform="translate(0 1030.362)" id="path840"></path>
            <path style="fill:currentColor;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m7 1034.362 3 3 1-1-3-3z" id="path850"></path>
            <path style="fill:currentColor;fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="m11 1046.362 3 3 1-1-3-3z" id="path850-3"></path>
          </g>
        </svg>
      </div>
      <div style="font-size:1.3em">Перезагрузить</div>
    </div>`;

  const htmlSwitchServer = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75ZM2.75 13V12H1.25V13H2.75ZM2.75 12V11H1.25V12H2.75ZM13 20.25H10V21.75H13V20.25ZM21.25 11V12H22.75V11H21.25ZM1.25 13C1.25 14.8644 1.24841 16.3382 1.40313 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588L3.7019 19.2981C3.27869 18.8749 3.02502 18.2952 2.88976 17.2892C2.75159 16.2615 2.75 14.9068 2.75 13H1.25ZM10 20.25C8.09318 20.25 6.73851 20.2484 5.71085 20.1102C4.70476 19.975 4.12511 19.7213 3.7019 19.2981L2.64124 20.3588C3.38961 21.1071 4.33855 21.4392 5.51098 21.5969C6.66182 21.7516 8.13558 21.75 10 21.75V20.25ZM14 3.75C15.9068 3.75 17.2615 3.75159 18.2892 3.88976C19.2952 4.02502 19.8749 4.27869 20.2981 4.7019L21.3588 3.64124C20.6104 2.89288 19.6614 2.56076 18.489 2.40313C17.3382 2.24841 15.8644 2.25 14 2.25V3.75ZM22.75 11C22.75 9.13558 22.7516 7.66182 22.5969 6.51098C22.4392 5.33855 22.1071 4.38961 21.3588 3.64124L20.2981 4.7019C20.7213 5.12511 20.975 5.70476 21.1102 6.71085C21.2484 7.73851 21.25 9.09318 21.25 11H22.75ZM10 2.25C8.13558 2.25 6.66182 2.24841 5.51098 2.40313C4.33856 2.56076 3.38961 2.89288 2.64124 3.64124L3.7019 4.7019C4.12511 4.27869 4.70476 4.02502 5.71085 3.88976C6.73851 3.75159 8.09318 3.75 10 3.75V2.25ZM2.75 11C2.75 9.09318 2.75159 7.73851 2.88976 6.71085C3.02502 5.70476 3.27869 5.12511 3.7019 4.7019L2.64124 3.64124C1.89288 4.38961 1.56076 5.33855 1.40313 6.51098C1.24841 7.66182 1.25 9.13558 1.25 11H2.75ZM2 12.75H22V11.25H2V12.75ZM21.25 12V13H22.75V12H21.25Z" fill="currentColor"></path>
            <path d="M13.5 7.5L18 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M6 17.5L6 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M6 8.5L6 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M9 17.5L9 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M9 8.5L9 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M15.5841 17.5H14.8341V17.5L15.5841 17.5ZM15.5841 18L15.0964 18.5698C15.3772 18.8101 15.7911 18.8101 16.0718 18.5698L15.5841 18ZM16.656 18.0698C16.9706 17.8004 17.0074 17.327 16.738 17.0123C16.4687 16.6976 15.9952 16.6609 15.6806 16.9302L16.656 18.0698ZM15.4877 16.9302C15.173 16.6609 14.6996 16.6976 14.4302 17.0123C14.1609 17.327 14.1976 17.8004 14.5123 18.0698L15.4877 16.9302ZM20.3892 16.6352C20.6296 16.9726 21.0979 17.0512 21.4352 16.8108C21.7726 16.5704 21.8512 16.1021 21.6108 15.7648L20.3892 16.6352ZM18.5048 14.25C16.5912 14.25 14.8341 15.5999 14.8341 17.5H16.3341C16.3341 16.6387 17.1923 15.75 18.5048 15.75V14.25ZM14.8341 17.5L14.8341 18L16.3341 18L16.3341 17.5L14.8341 17.5ZM16.0718 18.5698L16.656 18.0698L15.6806 16.9302L15.0964 17.4302L16.0718 18.5698ZM16.0718 17.4302L15.4877 16.9302L14.5123 18.0698L15.0964 18.5698L16.0718 17.4302ZM21.6108 15.7648C20.945 14.8304 19.782 14.25 18.5048 14.25V15.75C19.3411 15.75 20.0295 16.1304 20.3892 16.6352L21.6108 15.7648Z" fill="currentColor"></path>
            <path d="M18.4952 21V21.75V21ZM21.4159 18.5H22.1659H21.4159ZM21.4159 18L21.9036 17.4302C21.6228 17.1899 21.2089 17.1899 20.9282 17.4302L21.4159 18ZM20.344 17.9302C20.0294 18.1996 19.9926 18.673 20.262 18.9877C20.5313 19.3024 21.0048 19.3391 21.3194 19.0698L20.344 17.9302ZM21.5123 19.0698C21.827 19.3391 22.3004 19.3024 22.5698 18.9877C22.8391 18.673 22.8024 18.1996 22.4877 17.9302L21.5123 19.0698ZM16.6108 19.3648C16.3704 19.0274 15.9021 18.9488 15.5648 19.1892C15.2274 19.4296 15.1488 19.8979 15.3892 20.2352L16.6108 19.3648ZM18.4952 21.75C20.4088 21.75 22.1659 20.4001 22.1659 18.5H20.6659C20.6659 19.3613 19.8077 20.25 18.4952 20.25V21.75ZM22.1659 18.5V18H20.6659V18.5H22.1659ZM20.9282 17.4302L20.344 17.9302L21.3194 19.0698L21.9036 18.5698L20.9282 17.4302ZM20.9282 18.5698L21.5123 19.0698L22.4877 17.9302L21.9036 17.4302L20.9282 18.5698ZM15.3892 20.2352C16.055 21.1696 17.218 21.75 18.4952 21.75V20.25C17.6589 20.25 16.9705 19.8696 16.6108 19.3648L15.3892 20.2352Z" fill="currentColor"></path>
          </g>
        </svg>
      </div>
      <div style="font-size:1.3em">Сменить сервер</div>
    </div>`;

  const htmlYouTube = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
          <path fill="currentColor" d="M10 2.3C.172 2.3 0 3.174 0 10s.172 7.7 10 7.7s10-.874 10-7.7s-.172-7.7-10-7.7m3.205 8.034l-4.49 2.096c-.393.182-.715-.022-.715-.456V8.026c0-.433.322-.638.715-.456l4.49 2.096c.393.184.393.484 0 .668"/>
        </svg>
      </div>
      <div style="font-size:1.3em">YouTube</div>
    </div>`;

  const htmlRuTube = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg width="256px" height="256px" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" fill="none">
          <g id="SVGRepo_iconCarrier">
            <path fill="#ffffff" d="M128.689 47.57H20.396v116.843h30.141V126.4h57.756l26.352 38.013h33.75l-29.058-38.188c9.025-1.401 15.522-4.73 19.493-9.985 3.97-5.255 5.956-13.664 5.956-24.875v-8.759c0-6.657-.721-11.912-1.985-15.941-1.264-4.029-3.43-7.533-6.498-10.686-3.249-2.978-6.858-5.08-11.19-6.481-4.332-1.226-9.747-1.927-16.424-1.927zm-4.873 53.08H50.537V73.321h73.279c4.15 0 7.038.7 8.482 1.927 1.444 1.226 2.347 3.503 2.347 6.832v9.81c0 3.503-.903 5.78-2.347 7.006s-4.331 1.752-8.482 1.752z" style="display:inline;fill:none;stroke:#ffffff;stroke-width:12;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" transform="translate(1.605 -1.99)"></path>
            <path fill="#ffffff" d="M162.324 45.568c5.52 0 9.998-4.477 9.998-10s-4.478-10-9.998-10c-5.524 0-10.002 4.477-10.002 10s4.478 10 10.002 10z" style="display:inline;fill:#ffffff;fill-opacity:1;stroke:none;stroke-width:10.6667;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:none;stroke-opacity:1" transform="translate(1.605 -1.99)"></path>
          </g>
        </svg>
      </div>
      <div style="font-size:1.3em">RuTube</div>
    </div>`;

  const htmlTwitch = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M3.774 2L2.45 5.452v14.032h4.774V22h2.678l2.548-2.548h3.871l5.226-5.226V2zm15.968 11.323l-3 3h-4.743L9.452 18.87v-2.548H5.42V3.774h14.32zm-2.968-6.097v5.226h-1.775V7.226zm-4.775 0v5.226h-1.774V7.226z"/>
        </svg>
      </div>
      <div style="font-size:1.3em">Twitch</div>
    </div>`;

  const htmlSpeedTest = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M10.45 15.5q.625.625 1.575.588T13.4 15.4L19 7l-8.4 5.6q-.65.45-.712 1.362t.562 1.538M5.1 20q-.55 0-1.012-.238t-.738-.712q-.65-1.175-1-2.437T2 14q0-2.075.788-3.9t2.137-3.175T8.1 4.788T12 4q2.05 0 3.85.775T19 6.888t2.15 3.125t.825 3.837q.025 1.375-.312 2.688t-1.038 2.512q-.275.475-.737.713T18.874 20z"/>
        </svg>
      </div>
      <div style="font-size:1.3em">Speed Test</div>
    </div>`;

  const htmlClearCache = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <path fill="currentColor" d="M26 20h-6v-2h6zm4 8h-6v-2h6zm-2-4h-6v-2h6z"/>
          <path fill="currentColor" d="M17.003 20a4.9 4.9 0 0 0-2.404-4.173L22 3l-1.73-1l-7.577 13.126a5.7 5.7 0 0 0-5.243 1.503C3.706 20.24 3.996 28.682 4.01 29.04a1 1 0 0 0 1 .96h14.991a1 1 0 0 0 .6-1.8c-3.54-2.656-3.598-8.146-3.598-8.2m-5.073-3.003A3.11 3.11 0 0 1 15.004 20c0 .038.002.208.017.469l-5.9-2.624a3.8 3.8 0 0 1 2.809-.848M15.45 28A5.2 5.2 0 0 1 14 25h-2a6.5 6.5 0 0 0 .968 3h-2.223A16.6 16.6 0 0 1 10 24H8a17.3 17.3 0 0 0 .665 4H6c.031-1.836.29-5.892 1.803-8.553l7.533 3.35A13 13 0 0 0 17.596 28Z"/>
        </svg>
      </div>
      <div style="font-size:1.3em">Очистить кэш</div>
    </div>`;

  const htmlDrmPlay = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg fill="#ffffff" width="256px" height="256px" viewBox="0 -6 46 46" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="2.3">
          <g id="SVGRepo_iconCarrier">
            <path id="_24.TV" data-name="24.TV" d="M46,37H2a1,1,0,0,1-1-1V8A1,1,0,0,1,2,7H46a1,1,0,0,1,1,1V36A1,1,0,0,1,46,37ZM45,9H3V35H45ZM21,16a.975.975,0,0,1,.563.2l7.771,4.872a.974.974,0,0,1,.261,1.715l-7.974,4.981A.982.982,0,0,1,21,28a1,1,0,0,1-1-1V17A1,1,0,0,1,21,16ZM15,39H33a1,1,0,0,1,0,2H15a1,1,0,0,1,0-2Z" transform="translate(-1 -7)" fill-rule="evenodd"></path>
          </g>
        </svg>
      </div>
      <div style="font-size:1.3em">DRM Play</div>
    </div>`;

  const htmlForkPlayer = `
    <div class="settings-folder" style="padding:0!important">
      <div style="width:2.2em;height:1.7em;padding-right:.5em">
        <svg width="256px" height="256px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00032">
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
    </div>`;

  // Установка значений по умолчанию при первом запуске
  function setDefaultSettings() {
    Lampa.Storage.set('back_plug', true);
    Lampa.Storage.set('exit', '2');
    Lampa.Storage.set('reboot', '2');
    Lampa.Storage.set('switch_server', '2');
    Lampa.Storage.set('clear_cache', '2');
    Lampa.Storage.set('youtube', '1');
    Lampa.Storage.set('rutube', '1');
    Lampa.Storage.set('drm_play', '1');
    Lampa.Storage.set('twitch', '1');
    Lampa.Storage.set('fork_player', '1');
    Lampa.Storage.set('speedtest', '1');
  }

  const readyInterval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(readyInterval);
      if (!Lampa.Storage.get('back_plug', false)) {
        setDefaultSettings();
      }
      initPlugin();
    }
  }, 200);

  function initPlugin() {
    // Хак для корректного отображения в настройках
    Lampa.Settings.listener.follow('open', (e) => {
      if (e.name === 'main') {
        Lampa.SettingsApi.addComponent({ component: 'back_menu', name: 'BackMenu' });
        setTimeout(() => $('div[data-component="back_menu"]').remove(), 0);
      }
    });

    // Кнопка в разделе "Ещё"
    Lampa.SettingsApi.addParam({
      component: 'more',
      param: { name: 'back_menu', type: 'static', default: true },
      field: { name: 'Меню Выход', description: 'Настройки отображения пунктов меню' },
      onRender: (element) => {
        element.on('hover:enter', () => {
          Lampa.Settings.create('back_menu');
          Lampa.Controller.enabled().controller.back = () => Lampa.Settings.create('more');
        });
      }
    });

    // Параметры видимости пунктов
    const visibilityParams = [
      { key: 'exit', name: 'Закрыть приложение', default: '2' },
      { key: 'reboot', name: 'Перезагрузить', default: '2' },
      { key: 'switch_server', name: 'Сменить сервер', default: '2' },
      { key: 'clear_cache', name: 'Очистить кэш', default: '2' },
      { key: 'youtube', name: 'YouTube', default: '1' },
      { key: 'rutube', name: 'RuTube', default: '1' },
      { key: 'drm_play', name: 'DRM Play', default: '1' },
      { key: 'twitch', name: 'Twitch', default: '1' },
      { key: 'fork_player', name: 'ForkPlayer', default: '1' },
      { key: 'speedtest', name: 'Speed Test', default: '1' },
    ];

    visibilityParams.forEach(item => {
      Lampa.SettingsApi.addParam({
        component: 'back_menu',
        param: {
          name: item.key,
          type: 'select',
          values: { 1: 'Скрыть', 2: 'Отобразить' },
          default: item.default
        },
        field: { name: item.name, description: 'Нажмите для выбора' }
      });
    });

    // Функции действий
    function openSpeedTest() {
      const modalHtml = $('<div style="text-align:right;"><div style="min-height:360px;"><iframe id="speedtest-iframe" width="100%" height="100%" frameborder="0"></iframe></div></div>');
      Lampa.Modal.open({
        title: '',
        html: modalHtml,
        size: 'medium',
        mask: true,
        onBack: () => {
          Lampa.Modal.close();
          Lampa.Controller.toggle('content');
        }
      });
      document.getElementById('speedtest-iframe').src = 'http://speedtest.vokino.tv/?R=3';
    }

    function clearCache() {
      Lampa.Storage.clear();
    }

    const protocol = location.protocol === 'https:' ? 'https://' : 'http://';

    function switchServer() {
      Lampa.Input.edit({
        title: 'Укажите сервер',
        value: '',
        free: true
      }, (server) => {
        if (server !== '') {
          window.location.href = protocol + server;
        } else {
          showExitMenu();
        }
      });
    }

    function exitApp() {
      if (Lampa.Platform.is('apple_tv')) window.location.assign('exit://exit');
      else if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
      else if (Lampa.Platform.is('webos')) window.close();
      else if (Lampa.Platform.is('android')) Lampa.Android.exit();
      else if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
      else if (Lampa.Platform.is('netcast')) window.NetCastBack();
      else if (Lampa.Platform.is('noname') || Lampa.Platform.is('browser')) window.history.back();
      else if (Lampa.Platform.is('nw')) nw.Window.get().close();
      else window.history.back();
    }

    function showExitMenu() {
      const items = [];

      if (localStorage.getItem('exit') !== '1') items.push({ title: htmlCloseApp });
      if (localStorage.getItem('reboot') !== '1') items.push({ title: htmlReboot });
      if (localStorage.getItem('switch_server') !== '1') items.push({ title: htmlSwitchServer });
      if (localStorage.getItem('clear_cache') !== '1') items.push({ title: htmlClearCache });
      if (localStorage.getItem('youtube') !== '1') items.push({ title: htmlYouTube });
      if (localStorage.getItem('rutube') !== '1') items.push({ title: htmlRuTube });
      if (localStorage.getItem('drm_play') !== '1') items.push({ title: htmlDrmPlay });
      if (localStorage.getItem('twitch') !== '1') items.push({ title: htmlTwitch });
      if (localStorage.getItem('fork_player') !== '1') items.push({ title: htmlForkPlayer });
      if (localStorage.getItem('speedtest') !== '1') items.push({ title: htmlSpeedTest });

      Lampa.Select.show({
        title: 'Выход',
        items,
        onBack: () => Lampa.Controller.toggle('content'),
        onSelect: (item) => {
          if (item.title === htmlCloseApp) exitApp();
          else if (item.title === htmlReboot) location.reload();
          else if (item.title === htmlSwitchServer) switchServer();
          else if (item.title === htmlClearCache) clearCache();
          else if (item.title === htmlYouTube) window.location.href = 'https://youtube.com/tv';
          else if (item.title === htmlRuTube) window.location.href = 'https://rutube.ru/tv-release/rutube.server-22.0.0/webos/';
          else if (item.title === htmlDrmPlay) window.location.href = 'https://ott.drm-play.com';
          else if (item.title === htmlTwitch) window.location.href = 'https://webos.tv.twitch.tv';
          else if (item.title === htmlForkPlayer) window.location.href = 'http://browser.appfxml.com';
          else if (item.title === htmlSpeedTest) openSpeedTest();
        }
      });
    }

    // Перехват стандартного меню «Выход»
    Lampa.Controller.listener.follow('toggle', (e) => {
      if (e.name === 'select' && $('.selectbox__title').text() === Lampa.Lang.translate('title_out')) {
        Lampa.Select.hide();
        setTimeout(showExitMenu, 100);
      }
    });
  }

  if (window.appready) {
    initPlugin();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') initPlugin();
    });
  }
})();
