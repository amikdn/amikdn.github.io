(function () {
    'use strict';
    Lampa.Platform.tv(); 
    function add() {
        var a = 's'; 
        function updateT() {
            // Обновление стилей кнопок просмотра
            if(Lampa.Storage.field('BUTTONS_fix') == true) {
                $(".view--onlines_v1", Lampa.Activity.active().activity.render())
                    .empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>MODS's онлайн</span>");
                $(".view--torrent", Lampa.Activity.active().activity.render())
                    .empty().append("<svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 48 48' width='48px' height='48px'><path fill='#4caf50' fill-rule='evenodd' d='M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z' clip-rule='evenodd'/><path fill='#fff' fill-rule='evenodd' d='M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z' clip-rule='evenodd'/></svg><span>Торренты</span>");
                $(".open--menu", Lampa.Activity.active().activity.render())
                    .empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--trailer", Lampa.Activity.active().activity.render())
                    .empty().append("<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#191919'/><path d='m130.77 245.35h-4.49c-24.1 0-46.88-.35-64.17-.88-32.45-1-33.59-2.18-36.09-4.75s-4.54-4.72-4.42-71.52c0-16.69.25-32.56.61-44.68.69-23 1.49-24 3.26-26.29 2.61-3.34 6.09-3.48 14.52-3.83 5.12-.21 12.4-.4 21.63-.55 17.1-.28 40-.44 64.59-.44s47.61.16 64.93.44c32 .52 32.85 1.08 35.18 2.56 4 2.53 4.44 6.86 4.95 14.94 1 16.3 1.11 49.25.87 72.51-.56 53.77-1.68 54.7-5 57.45-2.44 2-4.06 3.36-36.37 4.32-16.06.46-37.23.72-60 .72zm-92.05-18c26.43 2.62 150.17 2.66 176.21.07 1.41-20.23 2-97 .31-118-27.17-1.42-148.84-1.42-176.47 0-1.58 21.46-1.62 98-.05 117.93z' fill='#191919'/></g><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#e83a2a'/></g><path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z' fill='#191919'/><path d='m120.37 132.4c-28.37 0-57.78-.1-75.37-.4-4.73-.07-8.4-.15-10.92-.23-4.74-.16-8.17-.27-10.53-4-1.15-1.83-1.85-2.94-1.65-18 .08-6.37.37-14.77 1.29-18.61a9.26 9.26 0 0 1 4.13-6.05c2.23-1.34 3.46-2.08 34.93-2.73 17-.35 39.77-.57 64.21-.62 24.07 0 46.95.08 64.39.36 31.12.49 32.73 1.19 34.58 2a8.75 8.75 0 0 1 4.92 5.88c.32 1.1 1.31 4.43 1.39 19.28.08 15.72-.65 16.83-1.88 18.66-2.42 3.61-5.14 3.68-12.43 3.86-3.69.09-9 .18-15.88.25-12.8.14-30.33.24-50.71.3-9.57.04-19.94.05-30.47.05zm-82.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08-27.44-1.5-150.44-1.22-177.2.41-.3 4.63-.43 11.64-.39 16.72z' fill='#191919'/><path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z' fill='#fff'/></svg><span>Трейлеры</span>");
                $(".view--online", Lampa.Activity.active().activity.render())
                    .empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--streamv1", Lampa.Activity.active().activity.render())
                    .empty().append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--bazon", Lampa.Activity.active().activity.render())
                    .empty().append("<svg enable-background='new 0 0 64 64' height='64px' id='Layer_1' version='1.1' viewBox='0 0 64 64' width='64px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><circle cx='32' cy='32' fill='#77B3D4' r='32'/><circle cx='32' cy='33.917' fill='#231F20' opacity='0.2' r='13.083'/><circle cx='32' cy='33.083' fill='#4F5D73' r='13.083'/><circle cx='32' cy='32' fill='#4F5D73' r='13.083'/><g opacity='0.2'><path d='M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.037-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z    M26.5,21.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z    M39.469,49.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5   C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z' fill='#231F20'/></g><g><path d='M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5   c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5   c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z    M26.5,19.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z    M39.469,47.5c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5   C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5   c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z' fill='#FFFFFF'/></g></svg><span>Filmix</span>");
                setTimeout(function() {
                    $(".full-start__icons > .icon--book", Lampa.Activity.active().activity.render())
                        .empty().append("<svg fill='none' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path d='M5 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 18V4Z' fill='#0fbcf9' class='fill-4a5568'></path></svg>");
                    $(".full-start__icons > .icon--like", Lampa.Activity.active().activity.render())
                        .empty().append("<svg viewBox='0 0 24 24' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'><path d='M22.231 12.518c2.355-2.414 2.354-6.325 0-8.738a5.942 5.942 0 0 0-4.365-1.81c-2.206.038-5.844 3.029-5.844 3.029s-3.74-3.033-6-3.03A5.933 5.933 0 0 0 1.769 3.78c-2.354 2.413-2.355 6.324 0 8.738L12 23l10.231-10.482z' fill='#f53b57' class='fill-000000'></path></svg>");
                    $(".full-start__icons > .icon--wath", Lampa.Activity.active().activity.render())
                        .empty().append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M23 12c0 6.075-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11z' fill='#3f5a75' class='fill-34495e'></path><path d='M12 1C5.373 1 0 6.373 0 13h2C2 7.477 6.477 3 12 3s10 4.477 10 10h2c0-6.627-5.373-12-12-12z' fill='#39546e' class='fill-2c3e50'></path><path d='M13 11v2h7a1 1 0 0 0 0-2h-7zM12 5c-.552 0-1 .4-1 1v5h2V6c0-.6-.448-1-1-1z' fill='#ecf0f1' class='fill-bdc3c7'></path><path fill='#f53b57' d='m6.017 17.305 4.95-4.95.707.707-4.95 4.95z' class='fill-c0392b'></path><path d='M12 10c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zm0 1c.552 0 1 .4 1 1 0 .5-.448 1-1 1s-1-.5-1-1c0-.6.448-1 1-1z' fill='#ecf0f1' class='fill-bdc3c7'></path><path d='M12 0C5.373 0 0 5.3 0 12c0 6.6 5.373 12 12 12s12-5.4 12-12c0-6.7-5.373-12-12-12zm0 2c5.523 0 10 4.4 10 10 0 5.5-4.477 10-10 10S2 17.5 2 12C2 6.4 6.477 2 12 2z' fill='#a5cfd9' class='fill-95a5a6'></path><path d='M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' fill='#39546e' class='fill-2c3e50'></path><path d='M13.73 11c.17.3.281.6.281 1 0 .3-.111.7-.281 1H13.73z' fill='#a5cfd9' class='fill-95a5a6'></path></svg>");
                }, 10);
            }
        }
    
        /* Часы во встроенном плеере */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'ClockInPlayer',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Часы во встроенном плеере',
                description: 'Через 5 секунд после включения плеера'
            },
            onChange: function(value) {
                // Действие при переключении (если необходимо)
            }
        });
    
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up'){  
            $('#clockstyle').remove();
            Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle" class="head__time-now time--clock hide"><style>#MyClockDiv{position: absolute!important; display: flex !important; z-index: 51!important; top: 2%;left: 49%;transform: translate(-50%, -50%);}</style></div>');
            $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        }
    
        function updateClock() {
            var MyTime = document.querySelector("[class='head__time-now time--clock']").innerHTML;
            $("#MyClockDiv").remove();
            $("#MyLogoDiv").remove();
            var MyDiv = '<div id="MyClockDiv" class="head__time-now time--clock hide" ></div>';
            $('.player').append(MyDiv);
            if(Lampa.Storage.field('ClockInPlayer') == true) {
                if (!$('body > div.player > div.player-panel').hasClass("panel--visible") || !$('body > div.player > div.player-info').hasClass("info--visible")) {
                    $('#MyClockDiv').removeClass('hide');
                }
            }
            $("#MyClockDiv").text(MyTime);
        }
    
        Lampa.Template.add('clockcenter', '<style>.hide{visibility: hidden!important;}</style>');
        $('body').append(Lampa.Template.get('clockcenter', {}, true));
        setInterval(updateClock, 200);
    
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component', 
            param: {
                name: 'ClockInPlayerPosition',
                type: 'select',
                values: {
                    Left_Up:     'Слева сверху',
                    Left_Down:   'Слева снизу',
                    Right_Up:    'Справа сверху',
                    Right_Down:  'Справа снизу',
                    Center_Up:   'В центре сверху'
                },
                default: 'Left_Up'
            },
            field: {
                name: 'Положение часов на экране',
                description: 'Выберите угол экрана'
            },
            onChange: function (value) {
                document.querySelector("#clockstyle").remove();
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Left_Up')
                    Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 90%!important');
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Left_Down')
                    Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 90%!important');
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Right_Up')
                    Lampa.Storage.set('Clock_coordinates', 'bottom: 90%!important; right: 12%!important');
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Right_Down')
                    Lampa.Storage.set('Clock_coordinates', 'bottom: 10%!important; right: 5%!important');
    
                Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
                $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
    
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up'){  
                    $('#clockstyle').remove();
                    Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle" class="head__time-now time--clock hide"><style>#MyClockDiv{position: absolute!important; display: flex !important; z-index: 51!important; top: 2%;left: 49%;transform: translate(-50%, -50%);}</style></div>');
                    $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
                }
            }
        });
    
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'YouTube',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел YouTube',
                description: 'Добавляет YouTube в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('YouTube') == false) {
                    $('#YouTubeButton').addClass('hide');
                }
                if(Lampa.Storage.field('YouTube') == true) {
                    $('#YouTubeButton').removeClass('hide');
                }
            }
        });
    
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'RuTube',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел RuTube',
                description: 'Добавляет RuTube в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('RuTube') == false) {
                    $('#RuTubeButton').addClass('hide');
                }
                if(Lampa.Storage.field('RuTube') == true) {
                    $('#RuTubeButton').removeClass('hide');
                }
            }
        });
    
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'Twitch',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Раздел Twitch',
                description: 'Добавляет Twitch в главном меню'
            },
            onChange: function(value) {
                if(Lampa.Storage.field('Twitch') == false) {
                    $('#TwitchButton').addClass('hide');
                }
                if(Lampa.Storage.field('Twitch') == true) {
                    $('#TwitchButton').removeClass('hide');
                }
            }
        });
    
        /* Переименовываем раздел плагина и создаём новое меню */
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component',
            name: 'Приятные мелочи',
            icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"><path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m698.514286-722.139428c18.724571 0 33.938286 15.213714 33.938285 33.938285v410.038857a33.938286 33.938286 0 1 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 34.011429-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m-349.403429 228.717714a33.938286 33.938286 0 0 1-33.938286-33.938285V520.411429a33.938286 33.938286 0 0 1 67.949715 0v410.038857a33.938286 33.938286 0 0 1-34.011429 33.938285z m0-722.139428a60.269714 60.269714 0 1 0 0 120.539428 60.269714 60.269714 0 0 0 0-120.539428z" fill="#ffffff"/></g></svg>'
        });
    
        /* Остальной код плагина */
    
        /* Скрываем баннер Трейлеров на Главной */
        if (Lampa.Storage.field('NoTrailerMainPage') == true) {
            var intervalID;
            setTimeout(function() {
                intervalID = setInterval(function() {
                    if (Lampa.Activity.active().component == 'main' && Lampa.Activity.active().source == 'cub') {
                        $('#NoTrailerMainPage').remove();
                        var banner = 'div.activity__body > div > div > div > div > div:nth-child(1)';
                        Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0%!important;display: none;}</style></div>');
                        $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
                    } 
                    if (Lampa.Activity.active().component !== 'main') {
                        $('#NoTrailerMainPage').remove();
                    }
                    if (Lampa.Activity.active().component == 'category' && Lampa.Activity.active().url == 'movie' && Lampa.Activity.active().source == 'cub') {
                        $('#NoTrailerMainPage').remove();
                        var banner = 'div.activity__body > div > div > div > div > div:nth-child(2)';
                        Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0%!important;display: none;}</style></div>');
                        $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
                    }
                    if (Lampa.Storage.field('NoTrailerMainPage') == false) {
                        clearInterval(intervalID);
                    }           
                }, 500);
            }, 1000);
        }
    
        /* Скрываем часы на заставке */
        if (Lampa.Storage.field('NoTimeNoDate') == true) {
            Lampa.Template.add('notimedatescreen', '<div id="notimedatescreen"><style>.screensaver__datetime{opacity: 0%!important;display: none;}</style></div>');
            $('body').append(Lampa.Template.get('notimedatescreen', {}, true));
            var notimedatescreenInterval = setInterval(function() {
                var elementScreenSaver = $('.screensaver-chrome');
                if (elementScreenSaver.length > 0){
                    // При необходимости можно добавить дополнительные действия для Chromecast
                }
            }, 1000);
        }
    
        /* Скрываем панель навигации */
        if (Lampa.Storage.field('NavyBar') == true) {
            $('.menu__item').on('click', function () {
                this.removeClass('focus'); this.addClass('focus');
            });
            Lampa.Template.add('no_bar', '<div id="no_bar"><style>.navigation-bar{display: none!important;}</style></div>');
            $('body').append(Lampa.Template.get('no_bar', {}, true));
    
            var searchReturnButton = '<div id="searchReturnButton" class="head__action head__settings selector searchReturnButton">\n' +
                '        <svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                '            <circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>\n' +
                '            <path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>\n' +
                '        </svg>\n' +
                '    </div>\n';
            $('#app > div.head > div > div.head__actions').append(searchReturnButton);
            $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {Lampa.Search.open();});
        }
    
        /* Добавляем кнопку возврата на экране */
        $('body').append('<div id="backit" class="elem-mobile-back hide"><svg width="131" height="262" viewBox="0 0 131 262" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M131 0C58.6507 0 0 58.6507 0 131C0 203.349 58.6507 262 131 262V0Z" fill="white"/><path d="M50.4953 125.318C50.9443 124.878 51.4313 124.506 51.9437 124.183L86.2229 90.4663C89.5671 87.1784 94.9926 87.1769 98.3384 90.4679C101.684 93.7573 101.684 99.0926 98.3384 102.385L68.8168 131.424L98.4907 160.614C101.836 163.904 101.836 169.237 98.4907 172.531C96.817 174.179 94.623 175 92.4338 175C90.2445 175 88.0489 174.179 86.3768 172.531L51.9437 138.658C51.4313 138.335 50.9411 137.964 50.4953 137.524C48.7852 135.842 47.9602 133.626 48.0015 131.421C47.96 129.216 48.7852 127.002 50.4953 125.318Z" fill="black"/></svg></div>');
        Lampa.Template.add('butt_style', '<style>.elem-mobile-back{right: 0;position: fixed;z-index:49;top: 50%;width: 3em;height: 6em;background-repeat: no-repeat;background-position: 100% 50%;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: contain;margin-top: -3em;font-size: .72em;display: block}</style>');
        $('body').append(Lampa.Template.get('butt_style', {}, true));
        $(".elem-mobile-back").on("click", function () {
            Lampa.Activity.back();
        });
        if (Lampa.Storage.field('BackButton') == true) {
            $('#backit').removeClass('hide');
        }
    
        /* Кнопка перезагрузки и консоли в верхнем баре */
        setInterval(function() {
            var exitSVG = '<div id="ExitButton" class="button selector" data-controller="player_panel"><svg viewBox="0 0 24 24" fill="#ffffff"  xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="#000000" stroke-width="2"></path> <path d="M9 9L15 15M15 9L9 15" stroke="#000000" stroke-width="2" stroke-linecap="round"></path> </g></svg></div>';
            $('#ExitButton').remove();
            if (Lampa.Storage.field('BackButton') == true) {
                $('.player-panel__right').append(exitSVG);
                $('#ExitButton').css("padding","0.05em");
                $('#ExitButton').on('hover:enter hover:click hover:touch', function() {
                    $('#ExitButton').remove();
                    $('.player').remove();
                });
            }
        }, 3000);
    }
    
    if(window.appready) add();
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') {
                add();
            }
        });
    }
})();
