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
          .append("<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'>" +
                    "<circle cx='423' cy='423' r='398' fill='#3498db'></circle>" +
                    "<path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round'></path>" +
                  "</svg><span>MODS's онлайн</span>");
        $(".view--torrent", Lampa.Activity.active().activity.render())
          .empty()
          .append("<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' width='48px' height='48px'>" +
                    "<path fill='#4caf50' d='M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20 c-11.016,0-20,8.985-20,20 C3.501,35.141,12.485,44.125,23.501,44.125z'/>" +
                    "<path fill='#fff' d='M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853 C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081 c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376 c6.868,1.552,12.308-0.869,12.962-6.203 c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z'/>" +
                  "</svg><span>Торренты</span>");
        $(".open--menu", Lampa.Activity.active().activity.render())
          .empty()
          .append("<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' clip-rule='evenodd'>" +
                    "<circle cx='423' cy='423' r='398' fill='#3498db'></circle>" +
                    "<path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round'></path>" +
                  "</svg><span>Смотреть</span>");
        $(".view--trailer", Lampa.Activity.active().activity.render())
          .empty()
          .append("<svg id="Capa_1" enable-background="new 0 0 512 512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g><g><path d="m492.417 331.442.006.007c5.588-20.536 8.577-42.142 8.577-64.449 0-135.31-109.69-245-245-245s-245 109.69-245 245c0 64.147 24.665 122.523 65.013 166.197z" fill="#ef45b2"></path></g><g><path d="m376 406h60v-391c0-8.28-6.72-15-15-15h-330c-8.28 0-15 6.72-15 15v418.2c17.334 18.771 37.578 34.807 60.002 47.431h239.997c.001 0 .001-.001.002-.001v-74.63z" fill="#3c5082"></path></g><g><path d="m186 0h-95c-8.28 0-15 6.72-15 15v418.2c17.334 18.771 37.578 34.807 60.002 47.431h49.998v-180.631c-8.284 0-15-6.716-15-15s6.716-15 15-15v-240c-8.284 0-15-6.716-15-15s6.716-15 15-15z" fill="#2d3c6b"></path></g><g><path d="m376 113.759v-73.759c0-5.523-4.477-10-10-10h-220c-5.523 0-10 4.477-10 10v118.041l120 44.459z" fill="#4fabf7"></path></g><g><path d="m176 40c0-5.523 4.477-10 10-10h-40c-5.523 0-10 4.477-10 10v118.041l40 14.82z" fill="#2e8be6"></path></g><g><path d="m376 310c0-5.523-4.477-10-10-10h-220c-5.523 0-10 4.477-10 10v170.631c35.468 19.965 76.399 31.369 120 31.369s84.532-11.404 120-31.369z" fill="#4fabf7"></path></g><g><path d="m176 310c0-5.523 4.477-10 10-10h-40c-5.523 0-10 4.477-10 10v170.631c12.677 7.136 26.055 13.172 40 17.99z" fill="#2e8be6"></path></g><g><path d="m406 30c5.523 0 10 4.477 10 10v17.5c0 5.523-4.477 10-10 10-5.523 0-10-4.477-10-10v-17.5c0-5.523 4.477-10 10-10z" fill="#2d3c6b"></path></g><g><path d="m406 97.5c5.523 0 10 4.477 10 10v17.5c0 5.523-4.477 10-10 10-5.523 0-10-4.477-10-10v-17.5c0-5.523 4.477-10 10-10z" fill="#2d3c6b"></path></g><g><path d="m406 165c5.523 0 10 4.477 10 10v17.5c0 5.523-4.477 10-10 10-5.523 0-10-4.477-10-10v-17.5c0-5.523 4.477-10 10-10z" fill="#2d3c6b"></path></g><g><path d="m406 232.5c5.523 0 10 4.477 10 10v17.5c0 5.523-4.477 10-10 10-5.523 0-10-4.477-10-10v-17.5c0-5.523 4.477-10 10-10z" fill="#2d3c6b"></path></g><g><path d="m106 30c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 97.5c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 165c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 232.5c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 300c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 367.5c-5.523 0-10 4.477-10 10v17.5c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10v-17.5c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m106 435c-5.523 0-10 4.477-10 10v7.525c6.388 5.512 13.062 10.701 20 15.538v-23.063c0-5.523-4.477-10-10-10z" fill="#222d5b"></path></g><g><path d="m340.142 77.901c-7.81-7.811-20.474-7.811-28.284 0l-104.123 104.123 140.224 87.976h18.041c5.523 0 10-4.477 10-10v-146.241z" fill="#2e8be6"></path></g><g><path d="m311.858 77.901-104.123 104.123 140.224 87.976c57.695-94.272-94.055-123.854-36.101-192.099z" fill="#157dd1"></path></g><g><path d="m136 158.041v101.959c0 5.523 4.477 10 10 10h201.959l-147.817-147.817c-7.81-7.81-20.474-7.81-28.284 0z" fill="#2e8be6"></path></g><g><path d="m176 119.459-.42-.184c-1.322.809-2.578 1.765-3.722 2.908l-35.858 35.858v101.959c0 5.523 4.477 10 10 10h201.959c-38.531-33.694-252.174-67.108-171.959-150.541z" fill="#157dd1"></path></g><g><circle cx="232.375" cy="82.327" fill="#2e8be6" r="20"></circle></g><g><path d="m232.375 82.327c0-7.402 4.024-13.859 10-17.318-2.942-1.703-6.356-2.682-10-2.682-11.046 0-20 8.954-20 20s8.954 20 20 20c3.644 0 7.058-.979 10-2.682-5.976-3.459-10-9.917-10-17.318z" fill="#157dd1"></path></g><g><path d="m376 480.631v-.014l-105.858-105.858c-7.81-7.81-20.474-7.81-28.284 0l-105.858 105.858v.014c35.468 19.965 76.399 31.369 120 31.369s84.532-11.404 120-31.369z" fill="#2e8be6"></path></g><g><path d="m136 480.617v.014c35.468 19.965 76.399 31.369 120 31.369 15.21 0 30.094-1.392 44.536-4.047-47.757-19.274-89.542-102.33-58.678-133.194z" fill="#157dd1"></path></g><g><path d="m376 240.631c-66.274 0-120 53.726-120 120s53.726 120 120 120c56.458-31.782 99.04-85.289 116.417-149.189-13.038-52.167-60.211-90.811-116.417-90.811z" fill="#ff4155"></path></g><g><path d="m396 242.299c-6.505-1.091-13.185-1.668-20-1.668-66.274 0-120 53.726-120 120s53.726 120 120 120c2.557-1.44 5.091-2.915 7.591-4.443-50.528-14.141-87.591-60.515-87.591-115.557 0-59.459 43.247-108.809 100-118.332z" fill="#e80054"></path></g><g><g><path d="m361.75 303.369 67.332 42.258c11.063 6.943 11.063 23.063 0 30.006l-67.332 42.258c-11.797 7.404-27.129-1.076-27.129-15.003v-84.517c0-13.926 15.332-22.406 27.129-15.002z" fill="#e9efff"></path></g></g><g><path d="m364.621 305.171-2.871-1.802c-11.797-7.404-27.129 1.076-27.129 15.003v84.517c0 13.927 15.333 22.407 27.129 15.003l2.871-1.802z" fill="#dae2fe"></path></g></g></svg><span>Трейлеры</span>");
      }
    }
;

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
