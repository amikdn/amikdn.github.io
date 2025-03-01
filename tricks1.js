(function () {
    'use strict';
    Lampa.Platform.tv(); 
    function add() {
        var a = 's'; 
        function updateT() {
            if (Lampa.Storage.field('BUTTONS_fix') == true) {
                $(".view--onlines_v1", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>MODS's онлайн</span>");
                $(".view--torrent", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48px' height='48px'><path fill='#4caf50' fill-rule='evenodd' d='M23.501,44.125c11.016,0,20-8.984,20-20 c0-11.015-8.984-20-20-20c-11.016,0-20,8.985-20,20C3.501,35.141,12.485,44.125,23.501,44.125z' clip-rule='evenodd'/><path fill='#fff' fill-rule='evenodd' d='M43.252,27.114C39.718,25.992,38.055,19.625,34,11l-7,1.077 c1.615,4.905,8.781,16.872,0.728,18.853C20.825,32.722,17.573,20.519,15,14l-8,2l10.178,27.081c1.991,0.67,4.112,1.044,6.323,1.044 c0.982,0,1.941-0.094,2.885-0.232l-4.443-8.376c6.868,1.552,12.308-0.869,12.962-6.203c1.727,2.29,4.089,3.183,6.734,3.172 C42.419,30.807,42.965,29.006,43.252,27.114z' clip-rule='evenodd'/></svg><span>Торренты</span>");
                $(".open--menu", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--trailer", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#191919'/><path d='m130.77 245.35h-4.49c-24.1 0-46.88-.35-64.17-.88-32.45-1-33.59-2.18-36.09-4.75s-4.54-4.72-4.42-71.52c0-16.69.25-32.56.61-44.68.69-23 1.49-24 3.26-26.29 2.61-3.34 6.09-3.48 14.52-3.83 5.12-.21 12.4-.4 21.63-.55 17.1-.28 40-.44 64.59-.44s47.61.16 64.93.44c32 .52 32.85 1.08 35.18 2.56 4 2.53 4.44 6.86 4.95 14.94 1 16.3 1.11 49.25.87 72.51-.56 53.77-1.68 54.7-5 57.45-2.44 2-4.06 3.36-36.37 4.32-16.06.46-37.23.72-60 .72zm-92.05-18c26.43 2.62 150.17 2.66 176.21.07 1.41-20.23 2-97 .31-118-27.17-1.42-148.84-1.42-176.47 0-1.58 21.46-1.62 98-.05 117.93z' fill='#191919'/></g><g><path d='m31.77 234.14c-3.12-3.22-2.66-128.58 0-132 1.83-2.34 186.58-2.34 190.26 0 3.4 2.16 2.48 129.93 0 132-5.5 4.55-186.38 4-190.26 0z' fill='#e83a2a'/></g><path d='m223.21 123.51c.74-1.1.94-31.2-1-32-5.6-2.46-186.21-2.29-190.8.49-1.74 1-1.88 30.31-1.1 31.55s192.16 1.06 192.9-.04z' fill='#191919'/><path d='m120.37 132.4c-28.37 0-57.78-.1-75.37-.4-4.73-.07-8.4-.15-10.92-.23-4.74-.16-8.17-.27-10.53-4-1.15-1.83-1.85-2.94-1.65-18 .08-6.37.37-14.77 1.29-18.61a9.26 9.26 0 0 1 4.13-6.05c2.23-1.34 3.46-2.08 34.93-2.73 17-.35 39.77-.57 64.21-.62 24.07 0 46.95.08 64.39.36 31.12.49 32.73 1.19 34.58 2a8.75 8.75 0 0 1 4.92 5.88c.32 1.1 1.31 4.43 1.39 19.28.08 15.72-.65 16.83-1.88 18.66-2.42 3.61-5.14 3.68-12.43 3.86-3.69.09-9 .18-15.88.25-12.8.14-30.33.24-50.71.3-9.57.04-19.94.05-30.47.05zm-82.52-16.48c29.32.63 148.34.59 177.85-.05.09-5.19 0-12.37-.26-17.08-27.44-1.5-150.44-1.22-177.2.41-.3 4.63-.43 11.64-.39 16.72z' fill='#191919'/></svg><span>Трейлеры</span>");
                $(".view--online", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--streamv1", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' shape-rendering='geometricPrecision' text-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' clip-rule='evenodd'><circle cx='423' cy='423' r='398' fill='#3498db' class='fill-1fc255'></circle><path d='M642 423 467 322 292 221v404l175-101z' fill='#fff7f7' stroke='#fff7f7' stroke-width='42.33' stroke-linejoin='round' class='fill-fff7f7 stroke-fff7f7'></path></svg><span>Смотреть</span>");
                $(".view--bazon", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg enable-background='new 0 0 64 64' height='64px' id='Layer_1' version='1.1' viewBox='0 0 64 64' width='64px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' fill='#77B3D4' r='32'/><circle cx='32' cy='33.917' fill='#231F20' opacity='0.2' r='13.083'/><circle cx='32' cy='33.083' fill='#4F5D73' r='13.083'/><circle cx='32' cy='32' fill='#4F5D73' r='13.083'/><g opacity='0.2'><path d='M32,12c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,12,32,12z M14.5,30.5 c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.037-2.463,5.5-5.5,5.5C16.962,36,14.5,33.537,14.5,30.5z M24.469,49.5 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C29.969,47.037,27.506,49.5,24.469,49.5z M26.5,21.5 c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,27,26.5,24.538,26.5,21.5z M39.469,49.5 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C44.969,47.037,42.506,49.5,39.469,49.5z M44.042,36 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C49.542,33.537,47.079,36,44.042,36z' fill='#231F20'/><g><path d='M32,10c-12.15,0-22,9.85-22,22s9.85,22,22,22c12.15,0,22-9.85,22-22S44.15,10,32,10z M14.5,28.5 c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C16.962,34,14.5,31.538,14.5,28.5z M24.469,47.5 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C29.969,45.037,27.506,47.5,24.469,47.5z M26.5,19.5 c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5c0,3.038-2.463,5.5-5.5,5.5C28.962,25,26.5,22.538,26.5,19.5z M39.469,47.5 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.038,0,5.5,2.462,5.5,5.5C44.969,45.037,42.506,47.5,39.469,47.5z M44.042,34 c-3.038,0-5.5-2.463-5.5-5.5c0-3.038,2.462-5.5,5.5-5.5c3.037,0,5.5,2.462,5.5,5.5C49.542,31.538,47.079,34,44.042,34z' fill='#FFFFFF'/></g></svg><span>Filmix</span>");
            }
        }
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'NoTrailerMainPage',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Скрыть Трейлеры-новинки',
                description: 'Скрывает баннерную ленту на главной странице'
            },
            onChange: function (value) {
                var intervalID = setInterval(function() {
                    if (Lampa.Storage.field('NoTrailerMainPage') == true) {
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
                    }
                    if (Lampa.Storage.field('NoTrailerMainPage') == false) {
                        $('#NoTrailerMainPage').remove();
                        clearInterval(intervalID);
                    }
                }, 500);
            }
        });	
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'NoTimeNoDate',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Скрыть часы на заставке CUB',
                description: 'Если переживаете за выгорание экрана OLED'
            },
            onChange: function (value) {
                if (Lampa.Storage.field('NoTimeNoDate') == true) {
                    $('#notimedatescreen').remove();
                    Lampa.Template.add('notimedatescreen', '<div id="notimedatescreen"><style>.screensaver__datetime{opacity: 0%!important;display: none;}</style></div>');
                    $('body').append(Lampa.Template.get('notimedatescreen', {}, true));
                }						
                if (Lampa.Storage.field('NoTimeNoDate') == false) {
                    $('#notimedatescreen').remove();
                }
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'NavyBar',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Скрыть панель навигации',
                description: 'Если неправильно определился тип устройства'
            },
            onChange: function (value) {
                if (Lampa.Storage.field('NavyBar') == true) {
                    Lampa.Template.add('no_bar', '<div id="no_bar"><style>.navigation-bar{display: none!important;}</style></div>');
                    $('body').append(Lampa.Template.get('no_bar', {}, true));
                    var searchReturnButton = '<div id="searchReturnButton" class="head__action head__settings selector searchReturnButton">'+
                        '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">'+
                        '<circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>'+
                        '<path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>'+
                        '</svg></div>';
                    $('.open--search').hide();
                    $('#searchReturnButton').remove();
                    $('#app > div.head > div > div.head__actions').append(searchReturnButton);
                    $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() { Lampa.Search.open(); });
                    $('.menu__item').on('click', function () {
                        this.removeClass('focus'); this.addClass('focus');
                    });
                }						
                if (Lampa.Storage.field('NavyBar') == false) {
                    $('.open--search').show();
                    $('#no_bar').remove();
                    $('#searchReturnButton').remove();
                }
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component', 
            param: {
                name: 'KeyboardSwitchOff',
                type: 'select',
                values: {
                    SwitchOff_None: 	'Не отключать',
                    SwitchOff_UA: 		'Українська',
                    SwitchOff_RU: 		'Русский',
                    SwitchOff_EN: 		'English'
                },
                default: 'SwitchOff_None'
            },
            field: {
                name: 'Неиспользуемая клавиатура',
                description: 'Выберите язык для отключения'
            },
            onChange: function (value) {
                if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_UA') {
                    Lampa.Storage.set('keyboard_default_lang', 'default');
                    var elementUA = $('.selectbox-item.selector > div:contains("Українська")');
                    if (elementUA.length > 0) elementUA.parent('div').hide();
                }
                if (Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_RU') {
                    Lampa.Storage.set('keyboard_default_lang', 'uk');
                    var elementRU = $('.selectbox-item.selector > div:contains("Русский")');
                    if (elementRU.length > 0) elementRU.parent('div').hide();
                }
                if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN') && (Lampa.Storage.field('language') == 'uk')) {
                    Lampa.Storage.set('keyboard_default_lang', 'uk');
                    var elementEN = $('.selectbox-item.selector > div:contains("English")');
                    if (elementEN.length > 0) elementEN.parent('div').hide();
                }
                if ((Lampa.Storage.field('KeyboardSwitchOff') == 'SwitchOff_EN') && (Lampa.Storage.field('language') == 'ru')) {
                    Lampa.Storage.set('keyboard_default_lang', 'default');
                    var elementEN = $('.selectbox-item.selector > div:contains("English")');
                    if (elementEN.length > 0) elementEN.parent('div').hide();
                }
            }
        });		
        
        Lampa.SettingsApi.addComponent({
            component: 'Multi_Menu_Component',
            name: 'Приятные мелочи',
            icon: '<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"><path d="M527.579429 186.660571a119.954286 119.954286 0 1 1-67.949715 0V47.542857a33.938286 33.938286 0 0 1 67.949715 0v139.190857z m281.380571 604.598858a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 1 1-67.949714 0v-139.190857z m-698.441143 0a119.954286 119.954286 0 1 1 67.949714 0v139.190857a33.938286 33.938286 0 0 1-67.949714 0v-139.190857zM144.457143 13.531429c18.797714 0 34.011429 15.213714 34.011428 33.938285v410.038857a33.938286 33.938286 0 0 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 33.938286-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m698.514286-722.139428c18.724571 0 33.938286 15.213714 33.938285 33.938285v410.038857a33.938286 33.938286 0 1 1-67.949714 0V47.542857c0-18.724571 15.213714-33.938286 34.011429-33.938286z m0 722.139428a60.269714 60.269714 0 1 0 0-120.466286 60.269714 60.269714 0 0 0 0 120.466286z m-349.403429 228.717714a33.938286 33.938286 0 0 1-33.938286-33.938285V520.411429a33.938286 33.938286 0 0 1 67.949715 0v410.038857a33.938286 33.938286 0 0 1-34.011429 33.938285z m0-722.139428a60.269714 60.269714 0 1 0 0 120.539428 60.269714 60.269714 0 0 0 0-120.539428z" fill="#ffffff"/></g></svg>'
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'TORRENT_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Контрастная рамка на торрентах',
                description: 'Улучшает восприятие при выборе торрента'
            },
            onChange: function(value) {
                var green1 = '<div id="green_style"><style>.torrent-item.selector.focus{box-shadow: 0 0 0 0.5em #1aff00!important;}</style></div>';
                var green2 = '<div id="greenn_style"><style>.torrent-serial.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
                var green3 = '<div id="greennn_style"><style>.torrent-file.selector.focus{box-shadow: 0 0 0 0.3em #1aff00!important;}</style></div>';
                var green4 = '<div id="greennnn_style"><style>.scroll__body{margin: 5px!important;}</style></div>';
                if (Lampa.Storage.field('TORRENT_fix') == true) {
                    $('body').append(green1);
                    $('body').append(green2);
                    $('body').append(green3);
                    $('body').append(green4);
                }
                if (Lampa.Storage.field('TORRENT_fix') == false) {
                    $('#green_style').remove();
                    $('#greenn_style').remove();
                    $('#greennn_style').remove();
                    $('#greennnn_style').remove();
                }
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'ANIME_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Удалить "Аниме" в главном меню',
                description: ''
            },
            onChange: function(value) {
                if (Lampa.Storage.field('ANIME_fix') == true)
                    $("[data-action=anime]").eq(0).hide();
                if (Lampa.Storage.field('ANIME_fix') == false)
                    $("[data-action=anime]").eq(0).show();
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'SISI_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Удалить "Клубника" в главном меню',
                description: ''
            },
            onChange: function(value) {
                if (Lampa.Storage.field('SISI_fix') == false) {
                    $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').show();
                }
                if (Lampa.Storage.field('SISI_fix') == true) {
                    $('#app > div.wrap.layer--height.layer--width > div.wrap__left.layer--height > div > div > div > div > div:nth-child(1) > ul > li:contains("Клубничка")').hide();
                }
            }
        });
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'BUTTONS_fix',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизовать кнопки просмотра',
                description: 'Делает кнопки цветными'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('BUTTONS_fix') == true) {
                    updateT();
                }
                Lampa.Settings.update();
            },
            onRender: function(item) {
                if (Lampa.Storage.field('BUTTONS_fix') == true) {
                    updateT();
                }
            }
        });
        
        if (Lampa.Storage.field('ANIME_fix') == true)
            $("[data-action=anime]").eq(0).hide();
        if (Lampa.Storage.field('SISI_fix') == true)
            $("[data-action=sisi]").eq(0).show();
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'Reloadbutton',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Добавить кнопку перезагрузки',
                description: 'Иконка рядом с часами'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#RELOAD').addClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == true) {
                    $('#RELOAD').removeClass('hide');
                }
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#ExitButton').addClass('hide');
                }				
                if (Lampa.Storage.field('Reloadbutton') == true) {
                    $('#ExitButton').removeClass('hide');
                }
            }
        });
        
        var my_reload = '<div id="RELOAD" class="head__action selector reload-screen hide"><svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48"><g></g><g></g><g><path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_reload);
        
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() {
            location.reload();
        });
        if (Lampa.Storage.field('Reloadbutton') == false) {
            $('#RELOAD').addClass('hide');
        }
        if (Lampa.Storage.field('Reloadbutton') == true) {
            $('#RELOAD').removeClass('hide');
        }
        
        var my_top_exit = '<div id="my_top_exit" class="head__action selector exit-screen hide"><svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g></g><g></g><g><path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" fill="currentColor"></path></g></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_top_exit);
        
        $('#my_top_exit').on('hover:enter hover:click hover:touch', function() {
            Lampa.Activity.out();
            if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
            if (Lampa.Platform.is('webos')) window.close();
            if (Lampa.Platform.is('android')) Lampa.Android.exit();
            if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
        });
        if (Lampa.Storage.field('Reloadbutton') == false) {
            $('#my_top_exit').addClass('hide');
        }
        if (Lampa.Storage.field('Reloadbutton') == true) {
            $('#my_top_exit').removeClass('hide');
        }
        
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'YouTubeStyle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизация встроенного плеера',
                description: 'В стиле YouTube'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('YouTubeStyle') == false) {
                    $('#YOUTUBESTYLE').remove();
                    $('#YOUTUBESTYLE-POSITION').remove();
                    $('#YOUTUBESTYLE-POSITION-focus').remove();
                }
                if (Lampa.Storage.field('YouTubeStyle') == true) {
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION-focus', {}, true));
                }
            },
            onRender: function(item) {
                Lampa.Template.add('YOUTUBESTYLE', '<div id="YOUTUBESTYLE" class="hide"><style>div.player-panel__position{background-color: #f00!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION', '<div id="YOUTUBESTYLE-POSITION" class="hide"><style>div.player-panel__position>div:after{background-color: #f00!important; box-shadow: 0 0 3px 0.2em!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION-focus', '<div id="YOUTUBESTYLE-POSITION-focus" class="hide"><style>body > div.player > div.player-panel.panel--paused > div > div.player-panel__timeline.selector.focus > div.player-panel__position > div:after{box-shadow: 0 0 3px 0.2em!important;}</style></div>');
            }
        });
        
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
            onChange: function(value) {}
        });
        
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up') {	
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
            if (Lampa.Storage.field('ClockInPlayer') == true) {
                if (($('body > div.player > div.player-panel').hasClass("panel--visible") == false) || ($('body > div.player > div.player-info').hasClass("info--visible") == false)) {
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
                    Left_Up: 'Слева сверху ',
                    Left_Down: 'Слева снизу',
                    Right_Up: 'Справа сверху',
                    Right_Down: 'Справа снизу',
                    Center_Up: 'В центре сверху'
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
                
                if (Lampa.Storage.field('ClockInPlayerPosition') == 'Center_Up') {	
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
                if (Lampa.Storage.field('YouTube') == false) {
                    $('#YouTubeButton').addClass('hide');
                }
                if (Lampa.Storage.field('YouTube') == true) {
                    $('#YouTubeButton').removeClass('hide');
                }
            }
        });
    }
})();
