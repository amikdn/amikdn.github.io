(function(){
  'use strict';

  
  Lampa.Platform.tv();

  
  function addHeaderButtons(){
    try {
      var headerActions = document.querySelector('#app .head__actions');
      if(!headerActions) return;

      // Кнопка перезагрузки (RELOAD)
      var reloadHTML = '<div id="RELOAD" class="head__action selector" tabindex="0">' +
                         '<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="0.48">' +
                           '<g id="SVGRepo_bgCarrier" stroke-width="0"></g>' +
                           '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>' +
                           '<g id="SVGRepo_iconCarrier">' +
                             '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path>' +
                           '</g>' +
                         '</svg>' +
                       '</div>';

      // Кнопка выхода (EXIT)
      var exitHTML = '<div id="EXIT" class="head__action selector exit-screen" tabindex="0">' +
          '<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="2" y="2" width="20" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" stroke-width="2"/>' +
            '<line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" stroke-width="2"/>' +
          '</svg>' +
        '</div>';

      headerActions.insertAdjacentHTML('beforeend', reloadHTML + exitHTML);

      if(Lampa.Storage.field('Reloadbutton') !== true){
        document.getElementById('RELOAD').classList.add('hide');
        document.getElementById('EXIT').classList.add('hide');
      }

      var reloadBtn = document.getElementById('RELOAD');
      var exitBtn   = document.getElementById('EXIT');

      if(reloadBtn){
        reloadBtn.addEventListener('click', function(){
          console.log("Перезагрузка Lamp...");
          location.reload();
        });
        reloadBtn.addEventListener('keydown', function(e){
          if(e.keyCode === 13 || e.keyCode === 32){
            console.log("Перезагрузка Lamp...");
            location.reload();
          }
        });
      }
      if(exitBtn){
        exitBtn.addEventListener('click', function(){ exitLamp(); });
        exitBtn.addEventListener('keydown', function(e){
          if(e.keyCode === 13 || e.keyCode === 32){ exitLamp(); }
        });
      }
    } catch(e){
      console.error(e);
    }
  }

  // Функция выхода из приложения Lampa
  function exitLamp(){
    try { if(Lampa && Lampa.Activity) Lampa.Activity.out(); } catch(e){}
    if(Lampa && Lampa.Platform){
      if(Lampa.Platform.is('tizen')){
        tizen.application.getCurrentApplication().exit();
      } else if(Lampa.Platform.is('webos')){
        window.close();
      } else if(Lampa.Platform.is('android')){
        Lampa.Android.exit();
      } else if(Lampa.Platform.is('orsay')){
        Lampa.Orsay.exit();
      } else {
        location.reload();
      }
    } else {
      location.reload();
    }
  }

  // Основная функция плагина
  function add(){
    var a = 's';

    // 1. Скрыть трейлеры-новинки
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'NoTrailerMainPage', type: 'trigger', default: false },
      field: { name: 'Скрыть Трейлеры-новинки', description: 'Скрывает баннерную ленту на главной странице' },
      onChange: function (value){
        var intervalID = setInterval(function(){
          if(Lampa.Storage.field('NoTrailerMainPage') === true){
            if(Lampa.Activity.active().component === 'main' && Lampa.Activity.active().source === 'cub'){
              $('#NoTrailerMainPage').remove();
              var banner = 'div.activity__body > div > div > div > div > div:nth-child(1)';
              Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0!important;display: none;}</style></div>');
              $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
            }
            if(Lampa.Activity.active().component !== 'main'){
              $('#NoTrailerMainPage').remove();
            }
            if(Lampa.Activity.active().component === 'category' &&
               Lampa.Activity.active().url === 'movie' &&
               Lampa.Activity.active().source === 'cub'){
              $('#NoTrailerMainPage').remove();
              var banner = 'div.activity__body > div > div > div > div > div:nth-child(2)';
              Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0!important;display: none;}</style></div>');
              $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
            }
          }
          if(Lampa.Storage.field('NoTrailerMainPage') === false){
            $('#NoTrailerMainPage').remove();
            clearInterval(intervalID);
          }
        }, 500);
      }
    });

    // 2. Скрыть часы на заставке CUB
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'NoTimeNoDate', type: 'trigger', default: false },
      field: { name: 'Скрыть часы на заставке CUB', description: 'Если переживаете за выгорание экрана OLED' },
      onChange: function (value){
        if(Lampa.Storage.field('NoTimeNoDate') === true){
          $('#notimedatescreen').remove();
          Lampa.Template.add('notimedatescreen', '<div id="notimedatescreen"><style>.screensaver__datetime{opacity: 0!important;display: none;}</style></div>');
          $('body').append(Lampa.Template.get('notimedatescreen', {}, true));
        } else {
          $('#notimedatescreen').remove();
        }
      }
    });

    // 3. Скрыть панель навигации
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'NavyBar', type: 'trigger', default: false },
      field: { name: 'Скрыть панель навигации', description: 'Если неправильно определился тип устройства' },
      onChange: function (value){
        if(Lampa.Storage.field('NavyBar') === true){
          Lampa.Template.add('no_bar', '<div id="no_bar"><style>.navigation-bar{display: none!important;}</style></div>');
          $('body').append(Lampa.Template.get('no_bar', {}, true));
          var searchReturnButton = '<div id="searchReturnButton" class="head__action head__settings selector searchReturnButton">' +
                                      '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                                        '<circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>' +
                                        '<path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>' +
                                      '</svg>' +
                                    '</div>';
          $('.open--search').hide();
          $('#searchReturnButton').remove();
          $('#app > div.head > div > div.head__actions').append(searchReturnButton);
          $('#searchReturnButton').on('hover:enter hover:click hover:touch', function(){ Lampa.Search.open(); });
          $('.menu__item').on('click', function(){ $(this).addClass('focus').siblings().removeClass('focus'); });
        } else {
          $('.open--search').show();
          $('#no_bar').remove();
          $('#searchReturnButton').remove();
        }
      }
    });

    // 4. Неиспользуемая клавиатура
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: {
        name: 'KeyboardSwitchOff',
        type: 'select',
        values: {
          SwitchOff_None: 'Не отключать',
          SwitchOff_UA: 'Українська',
          SwitchOff_RU: 'Русский',
          SwitchOff_EN: 'English'
        },
        default: 'SwitchOff_None'
      },
      field: { name: 'Неиспользуемая клавиатура', description: 'Выберите язык для отключения' },
      onChange: function (value){
        if(Lampa.Storage.field('KeyboardSwitchOff') === 'SwitchOff_UA'){
          Lampa.Storage.set('keyboard_default_lang', 'default');
          var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
          if(elementUA.length) elementUA.parent('div').hide();
        }
        if(Lampa.Storage.field('KeyboardSwitchOff') === 'SwitchOff_RU'){
          Lampa.Storage.set('keyboard_default_lang', 'uk');
          var elementRU = $('.selectbox-item.selector > div:contains("Русский")');
          if(elementRU.length) elementRU.parent('div').hide();
        }
        if(Lampa.Storage.field('KeyboardSwitchOff') === 'SwitchOff_EN' && Lampa.Storage.field('language') === 'uk'){
          Lampa.Storage.set('keyboard_default_lang', 'uk');
          var elementEN = $('.selectbox-item.selector > div:contains("English")');
          if(elementEN.length) elementEN.parent('div').hide();
        }
        if(Lampa.Storage.field('KeyboardSwitchOff') === 'SwitchOff_EN' && Lampa.Storage.field('language') === 'ru'){
          Lampa.Storage.set('keyboard_default_lang', 'default');
          var elementEN = $('.selectbox-item.selector > div:contains("English")');
          if(elementEN.length) elementEN.parent('div').hide();
        }
      }
    });

    // 5. Контрастная рамка на торрентах
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'TORRENT_fix', type: 'trigger', default: false },
      field: { name: 'Контрастная рамка на торрентах', description: 'Улучшает восприятие при выборе торрента' },
      onChange: function(value){
        var green1 = '<div id="green_style"><style>.torrent-item.selector.focus{box-shadow: 0 0 0 0.5em #1aff00!important;}</style></div>';
        var green2 = '<div id="greenn_style"><style>.torrent-serial.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
        var green3 = '<div id="greennn_style"><style>.torrent-file.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
        var green4 = '<div id="greennnn_style"><style>.scroll__body{margin: 5px!important;}</style></div>';
        if(Lampa.Storage.field('TORRENT_fix') === true){
          $('body').append(green1, green2, green3, green4);
        } else {
          $('#green_style, #greenn_style, #greennn_style, #greennnn_style').remove();
        }
      }
    });

    // 6. Удалить "Аниме" в главном меню
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'ANIME_fix', type: 'trigger', default: false },
      field: { name: 'Удалить "Аниме" в главном меню', description: '' },
      onChange: function(value){
        if(Lampa.Storage.field('ANIME_fix') === true)
          $("[data-action=anime]").eq(0).hide();
        else
          $("[data-action=anime]").eq(0).show();
      }
    });

    // 7. Удалить "Клубничка" в главном меню
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'SISI_fix', type: 'trigger', default: false },
      field: { name: 'Удалить "Клубничка" в главном меню', description: '' },
      onChange: function(value){
        if(Lampa.Storage.field('SISI_fix') === true)
          $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').hide();
        else
          $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > li:contains("Клубничка")').show();
      }
    });

    // 8. Стилизовать кнопки просмотра
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'BUTTONS_fix', type: 'trigger', default: false },
      field: { name: 'Стилизовать кнопки просмотра', description: 'Делает кнопки цветными' },
      onChange: function(value){
        if(Lampa.Storage.field('BUTTONS_fix') === true){
          updateT();
        }
        Lampa.Settings.update();
      },
      onRender: function(item){
        if(Lampa.Storage.field('BUTTONS_fix') === true){
          updateT();
        }
      }
    });

    // 9. Добавить кнопку перезагрузки и кнопки выхода
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'Reloadbutton', type: 'trigger', default: false },
      field: { name: 'Добавить кнопку перезагрузки', description: 'Отображать кнопки перезагрузки и выхода в шапке' },
      onChange: function(value){
        if(Lampa.Storage.field('Reloadbutton') === true){
          $('#RELOAD').removeClass('hide');
          $('#EXIT').removeClass('hide');
        } else {
          $('#RELOAD').addClass('hide');
          $('#EXIT').addClass('hide');
        }
      }
    });

    // 10. Часы во встроенном плеере
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'ClockInPlayer', type: 'trigger', default: false },
      field: { name: 'Часы во встроенном плеере', description: 'Через 5 секунд после включения плеера' },
      onChange: function(value){}
    });

    // 11. Положение часов на экране
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: {
        name: 'ClockInPlayerPosition',
        type: 'select',
        values: {
          Left_Up: 'Слева сверху ',
          Left_Down: 'Слева снизу',
          Right_Up: 'Справа сверху',
          Right_Down: 'Справа снизу',
          Center_Up: 'В центре сверху'
        },
        default: 'Left_Up'
      },
      field: { name: 'Положение часов на экране', description: 'Выберите угол экрана' },
      onChange: function(value){
        document.querySelector("#clockstyle").remove();
        if(Lampa.Storage.field('ClockInPlayerPosition') === 'Left_Up')
          Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 90%!important');
        if(Lampa.Storage.field('ClockInPlayerPosition') === 'Left_Down')
          Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 90%!important');
        if(Lampa.Storage.field('ClockInPlayerPosition') === 'Right_Up')
          Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 12%!important');
        if(Lampa.Storage.field('ClockInPlayerPosition') === 'Right_Down')
          Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 5%!important');
					
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' +
           Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
					
        if(Lampa.Storage.field('ClockInPlayerPosition') === 'Center_Up'){
          $('#clockstyle').remove();
          Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle" class="head__time-now time--clock hide">' +
            '<style>#MyClockDiv{position: absolute!important; display: flex !important; z-index: 51!important; ' +
            'top: 2%;left: 49%;transform: translate(-50%, -50%);}</style></div>');
          $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        }
      }
    });

    // 12. Раздел YouTube
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'YouTube', type: 'trigger', default: false },
      field: { name: 'Раздел YouTube', description: 'Добавляет YouTube в главном меню' },
      onChange: function(value){
        if(Lampa.Storage.field('YouTube') === true){
          $('#YouTubeButton').removeClass('hide');
        } else {
          $('#YouTubeButton').addClass('hide');
        }
      }
    });

    // 13. Раздел RuTube
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'RuTube', type: 'trigger', default: false },
      field: { name: 'Раздел RuTube', description: 'Добавляет RuTube в главном меню' },
      onChange: function(value){
        if(Lampa.Storage.field('RuTube') === true){
          $('#RuTubeButton').removeClass('hide');
        } else {
          $('#RuTubeButton').addClass('hide');
        }
      }
    });

    // 14. Раздел Twitch
    Lampa.SettingsApi.addParam({
      component: 'Multi_Menu_Component',
      param: { name: 'Twitch', type: 'trigger', default: false },
      field: { name: 'Раздел Twitch', description: 'Добавляет Twitch в главном меню' },
      onChange: function(value){
        if(Lampa.Storage.field('Twitch') === true){
          $('#TwitchButton').removeClass('hide');
        } else {
          $('#TwitchButton').addClass('hide');
        }
      }
    });

    

    function updateClock(){
      var MyTime = document.querySelector("[class='head__time-now time--clock']").innerHTML;
      $("#MyClockDiv").remove();
      var MyDiv = '<div id="MyClockDiv" class="head__time-now time--clock hide"></div>';
      $('.player').append(MyDiv);
      if(Lampa.Storage.field('ClockInPlayer') === true){
        if( !$('body > div.player > div.player-panel').hasClass("panel--visible") ||
            !$('body > div.player > div.player-info').hasClass("info--visible")){
          $('#MyClockDiv').removeClass('hide');
        }
      }
      $("#MyClockDiv").text(MyTime);
    }
    setInterval(updateClock, 200);


    // Разделы YouTube, RuTube, Twitch – создание кнопок в главном меню
    var TubeSVG = '<svg width="256px" height="256px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff">' +
          '<path d="M45.1,12.8a5.5,5.5,0,0,0-3.9-3.9C37.8,8,24,8,24,8S10.2,8,6.8,8.9a5.5,5.5,0,0,0-3.9,3.9C2,16.2,2,23.4,2,23.4 s0,7.2.9,10.6a5.5,5.5,0,0,0,3.9,3.9c3.4.9,17.2.9,17.2.9s13.8,0,17.2-.9A5.5,5.5,0,0,0,45.1,34 c.9-3.4.9-10.6.9-10.6S46,16.2,45.1,12.8Z"/>' +
          '<path d="M19.6,30V16.8L31,23.4Z"/>' +
        '</svg>';
    var tubemenu = $('<li id="YouTubeButton" class="menu__item selector hide"><div class="menu__ico">' + TubeSVG + '</div><div class="menu__text">YouTube</div></li>');
    $('.menu .menu__list').eq(0).append(tubemenu);
    if(Lampa.Storage.field('YouTube') === true){
      $('#YouTubeButton').removeClass('hide');
    }
    tubemenu.on('hover:enter', function(){
      if(Lampa.Platform.is('webos')){
        webOS.service.request("luna://com.webos.applicationManager", {
          method: "launch",
          parameters: { "id": "youtube.leanback.v4" },
          onSuccess: function(inResponse){ console.log("YouTube запущен"); },
          onFailure: function(inError){ console.log("Ошибка запуска YouTube ["+inError.errorCode+"]: "+inError.errorText); }
        });
      }
      if(Lampa.Platform.is('android')){
        Lampa.Android.openYoutube('TeUQrJrfrkk');
      } else {
        window.location.href = 'https://youtube.com/tv';
      }
    });

    var RuTubeSVG = '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<rect width="511.998" height="511.998" rx="108.623" fill="#0B1D38"/>' +
          '<circle cx="419.52" cy="110" r="32.3481" fill="#F41240"/>' +
        '</svg>';
    var rutubemenu = $('<li id="RuTubeButton" class="menu__item selector hide"><div class="menu__ico">' + RuTubeSVG + '</div><div class="menu__text">RuTube</div></li>');
    $('.menu .menu__list').eq(0).append(rutubemenu);
    if(Lampa.Storage.field('RuTube') === true){
      $('#RuTubeButton').removeClass('hide');
    }
    rutubemenu.on('hover:enter', function(){
      if(Lampa.Platform.is('webos')){
        window.location.href = 'https://bit.ly/3DnLr2O';
      }
      if(Lampa.Platform.is('tizen')){
        var rutubeurl = 'https://bit.ly/3RcgRPq';
        var e = new tizen.ApplicationControl("https://tizen.org/appcontrol/operation/view", rutubeurl);
        tizen.application.launchAppControl(e, null, function(){}, function(e){ Lampa.Noty.show(e); });
      }
      if(Lampa.Platform.is('android')){
        Android.openYoutube();
      } else {
        window.open('https://bit.ly/3DnLr2O', '_blank');
      }
    });

    var TwitchSVG = '<svg width="256px" height="256px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff">' +
          '<path d="M2.7 2L2 4.6v11.8h3.2V18H7l1.8-1.6h2.9l5.7-5.2V2H2.7zM16 10.5l-2.5 2.3h-4l-2.2 2v-2H4.2V3.3H16v7.2zm-2.5-4.6h-1.4v3.9h1.4V5.9zm-4 0H8.1v3.9h1.4V5.9z"></path>' +
        '</svg>';
    var twitchmenu = $('<li id="TwitchButton" class="menu__item selector hide"><div class="menu__ico">' + TwitchSVG + '</div><div class="menu__text">Twitch</div></li>');
    $('.menu .menu__list').eq(0).append(twitchmenu);
    if(Lampa.Storage.field('Twitch') === true){
      $('#TwitchButton').removeClass('hide');
    }
    twitchmenu.on('hover:enter', function(){
      if(Lampa.Platform.is('webos')){
        window.open('https://webos.tv.twitch.tv', '_blank');
      }
      if(Lampa.Platform.is('orsay')){
        window.open('https://fgl27.github.io/SmartTwitchTV/release/index.html', '_blank');
      }
      if(Lampa.Platform.is('tizen')){
        window.open('https://tizen.tv.twitch.tv', '_blank');
      }
      if(Lampa.Platform.is('android')){
        window.open('https://android.tv.twitch.tv', '_blank');
      }
      if(Lampa.Platform.is('browser')){
        window.open('https://twitch.tv', '_blank');
      }
      if(Lampa.Platform.is('vidaa')){
        window.open('https://tv.twitch.tv', '_blank');
      }
    });

    // Функция обновления отображения кнопок просмотра для торрентов
function updateT(){
  if(Lampa.Storage.field('BUTTONS_fix') === true){
    $(".view--onlines_v1", Lampa.Activity.active().activity.render())
      .empty()
      .append(
        "<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'>" +
          "<circle cx='423' cy='423' r='398' fill='#3498db'></circle>" +
          "<path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round'></path>" +
        "</svg><span>MODS's онлайн</span>"
      );

    $(".view--torrent", Lampa.Activity.active().activity.render())
      .empty()
      .append(
        "<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px'>" +
          "<path fill='#4caf50' d='M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20 c-11.016,0-20,8.985-20,20 C3.501,35.141,12.485,44.125,23.501,44.125z'/>" +
          "<path fill='#fff' d='M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853 C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081 c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376 c6.868,1.552,12.308-0.869,12.962-6.203 c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z'/>" +
        "</svg><span>Торренты</span>"
      );

    $(".open--menu", Lampa.Activity.active().activity.render())
      .empty()
      .append(
        "<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'>" +
          "<g>" +
            "<path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 " +
            "c3.4 2.16 2.48 129.93 0 132 " +
            "c-5.5 4.55-186.38 4-190.26 0z' fill='#191919'></path>" +
            "<path d='m130.77 245.35h-4.49c-24.1 0-46.88-.35-64.17-.88-32.45-1-33.59-2.18-36.09-4.75 " +
            "s-4.54-4.72-4.42-71.52c0-16.69.25-32.56.61-44.68.69-23 1.49-24 3.26-26.29 " +
            "2.61-3.34 6.09-3.48 14.52-3.83 5.12-.21 12.4-.4 21.63-.55 17.1-.28 40-.44 64.59-.44 " +
            "s47.61.16 64.93.44c32 .52 32.85 1.08 35.18 2.56 4 2.53 4.44 6.86 4.95 14.94 1 16.3 " +
            "1.11 49.25.87 72.51-.56 53.77-1.68 54.7-5 57.45-2.44 2-4.06 3.36-36.37 4.32-16.06.46-37.23.72-60 .72" +
            "zm-92.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08-27.44-1.5-150.44-1.22-177.2.41" +
            "-.3 4.63-.43 11.64-.39 16.72z' fill='#191919'></path>" +
          "</g>" +
          "<g>" +
            "<path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 " +
            "c3.4 2.16 2.48 129.93 0 132 " +
            "c-5.5 4.55-186.38 4-190.26 0z' fill='#e83a2a'></path>" +
          "</g>" +
          "<path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55" +
          "s192.16 1.06 192.9-.04z' fill='#191919'></path>" +
          "<path d='m120.37 132.4c-28.37 0-57.78-.1-75.37-.4-4.73-.07-8.4-.15-10.92-.23-4.74-.16-8.17-.27-10.53-4" +
          "-1.15-1.83-1.85-2.94-1.65-18 .08-6.37.37-14.77 1.29-18.61a9.26 9.26 0 0 1 4.13-6.05" +
          "c2.23-1.34 3.46-2.08 34.93-2.73 17-.35 39.77-.57 64.21-.62 24.07 0 46.95.08 64.39.36" +
          "31.12.49 32.73 1.19 34.58 2a8.75 8.75 0 0 1 4.92 5.88" +
          "c.32 1.1 1.31 4.43 1.39 19.28.08 15.72-.65 16.83-1.88 18.66-2.42 3.61-5.14 3.68-12.43 3.86" +
          "-3.69.09-9 .18-15.88.25-12.8.14-30.33.24-50.71.3-9.57.04-19.94.05-30.47.05" +
          "zm-82.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08" +
          "-27.44-1.5-150.44-1.22-177.2.41-.3 4.63-.43 11.64-.39 16.72z' fill='#191919'></path>" +
        "</svg><span>Трейлеры</span>"
      );
}


    // Функция обновления кнопок просмотра для торрентов (при BUTTONS_fix)
    function updateTWrapper(){
      updateT();
    }
    var timerId = setInterval(updateTWrapper, 1000);
  } // end of add()

  // Регистрируем компонент плагина с названием "Приятные мелочи" и белой иконкой
  Lampa.SettingsApi.addComponent({
    component: 'Multi_Menu_Component',
    name: 'Приятные мелочи',
    icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff">' +
            '<g id="SVGRepo_bgCarrier" stroke-width="0"/>' +
            '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>' +
            '<g id="SVGRepo_iconCarrier">' +
              '<path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z"/>' +
            '</g>' +
          '</svg>',
    onSelect: function(){
         alert('Plugin launched!');
    }
  });
  
  // Инициализация плагина: ждем готовности приложения и запускаем основной функционал
  if(window.appready){
    add();
    addHeaderButtons();
  } else if(typeof Lampa !== 'undefined' && Lampa.Listener){
    Lampa.Listener.follow('app', function(e){
      if(e.type === 'ready'){
        add();
        addHeaderButtons();
      }
    });
  } else {
    window.addEventListener('load', function(){
      add();
      addHeaderButtons();
    });
  }
})();
