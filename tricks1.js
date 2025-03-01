/* 
 * Переделать интервалы на стили для уменьшения нагрузки на ТВ
 * Добавить сканер локалки
 * Добавить диагностику в одно окно
 * Экранная Кнопка Назад - при старте скрыта - для чего добавлять (как и стиль её отображения), если в меня не активна? Сделать условие
 * Правка стиля .hide - нужна ли в теле страницы без активных часов? Сделать условие
 * Приклеить дату к заставке Google путём наложения с отступом через Flex как с часами
 */

(function () {
    'use strict';
    Lampa.Platform.tv();
    
    // Блок Яндекс Метрики удалён по требованию
    /*
    (function(m, e, t, r, i, k, a) {
        m[i] = m[i] || function() {
            (m[i].a = m[i].a || []).push(arguments)
        };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) {
                return;
            }
        }
        k = e.createElement(t), a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a)
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    
    ym(95922620, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true
    });
    
    var METRIKA = '<noscript><div><img src="https://mc.yandex.ru/watch/95922620" style="position:absolute; left:-9999px;" alt="" /></div></noscript>';
    $('body').append(METRIKA);
    */
    
    function add() {
        var a = 's';
        function updateT() {
            if (Lampa.Storage.field('BUTTONS_fix') == true) {
                $(".view--onlines_v1", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg viewBox='0 0 847 847' ...><span>MODS's онлайн</span>");
                $(".view--torrent", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Торренты</span>");
                $(".open--menu", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Смотреть</span>");
                $(".view--trailer", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Трейлеры</span>");
                $(".view--online", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Смотреть</span>");
                $(".view--streamv1", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Смотреть</span>");
                $(".view--bazon", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Bazon</span>");
                $(".view--filmixpva", Lampa.Activity.active().activity.render())
                    .empty()
                    .append("<svg ...><span>Filmix</span>");
            }
        }
        
        /* Скрываем ленту трейлеров на Главной */
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
        
        /* Скрываем часы на заставке */
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
        
        /* Хранитель Экрана */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'CustomScreenSaver',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Свой хранитель экрана',
                description: 'В разработке'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('CustomScreenSaver') == false) {
                    Lampa.Storage.set('screensaver_aerial_items', '');
                }
                if (Lampa.Storage.field('CustomScreenSaver') == true) {
                    Lampa.Storage.set('screensaver_type', 'aerial');
                    Lampa.Storage.set('screensaver_aerial_items', '[{"id":"","accessibilityLabel":"","src":{"H2641080p":"http://lampatv.site/birds-01.mkv"},"name":"","pointsOfInterest":{"0":""},"type":"","timeOfDay":""}, ...]');
                }
            }
        });
        
        /* Скрываем панель навигации */
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
                    
                    var searchReturnButton = '<div id="searchReturnButton" class="head__action head__settings selector searchReturnButton">' +
                        '<svg width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<circle cx="9.9964" cy="9.63489" r="8.43556" stroke="currentColor" stroke-width="2.4"></circle>' +
                        '<path d="M20.7768 20.4334L18.2135 17.8701" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path>' +
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
        
        /* Стилизация кнопок просмотра */
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
        
        /* Восстановление блоков для YouTube, Rutube и Twitch */
        
        /* Стиль в плеере - YouTube */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'YouTubeStyle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизация встроенного плеера YouTube',
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
        
        /* Стиль в плеере - Rutube */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'RutubeStyle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизация встроенного плеера Rutube',
                description: 'Настройки для плеера Rutube'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('RutubeStyle') == false) {
                    $('#RUTUBESTYLE').remove();
                }
                if (Lampa.Storage.field('RutubeStyle') == true) {
                    $('body').append(Lampa.Template.get('RUTUBESTYLE', {}, true));
                }
            },
            onRender: function(item) {
                Lampa.Template.add('RUTUBESTYLE', '<div id="RUTUBESTYLE" class="hide"><style>/* Стили для Rutube */</style></div>');
            }
        });
        
        /* Стиль в плеере - Twitch */
        Lampa.SettingsApi.addParam({
            component: 'Multi_Menu_Component',
            param: {
                name: 'TwitchStyle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Стилизация встроенного плеера Twitch',
                description: 'Настройки для плеера Twitch'
            },
            onChange: function(value) {
                if (Lampa.Storage.field('TwitchStyle') == false) {
                    $('#TWITCHSTYLE').remove();
                }
                if (Lampa.Storage.field('TwitchStyle') == true) {
                    $('body').append(Lampa.Template.get('TWITCHSTYLE', {}, true));
                }
            },
            onRender: function(item) {
                Lampa.Template.add('TWITCHSTYLE', '<div id="TWITCHSTYLE" class="hide"><style>/* Стили для Twitch */</style></div>');
            }
        });
        
        /* Часы в плеере - МЕНЮ */
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
                // Действия при изменении, если требуются
            }
        });
        
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));
        
        // Остальной код продолжается...
    }
    
    add();
    
})();
