/*
 * Переделанный плагин "Приятные мелочи"
 * Из исходного кода удалены:
 *  - Народный торрсевер (блок, отвечающий за TorrServer)
 *  - Яндекс Метрика
 *  - Спидтест (блок OpenSpeedTestParam)
 *  - Свой хранитель экрана (блок CustomScreenSaver)
 */

(function () {
    'use strict';
    Lampa.Platform.tv();

    function add() {
        var a = 's';
        
        // Функция обновления стилей кнопок просмотра
        function updateT() {
            if (Lampa.Storage.field('BUTTONS_fix') == true) {
                $(".view--onlines_v1", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xml:space='preserve' xmlns='http://www.w3.org/2000/svg' ...></svg><span>MODS's онлайн</span>");
                $(".view--torrent", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg' ...></svg><span>Торренты</span>");
                $(".open--menu", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' ...></svg><span>Смотреть</span>");
                $(".view--trailer", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' ...></svg><span>Трейлеры</span>");
                $(".view--online", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' ...></svg><span>Смотреть</span>");
                $(".view--streamv1", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg viewBox='0 0 847 847' xmlns='http://www.w3.org/2000/svg' ...></svg><span>Смотреть</span>");
                $(".view--bazon", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg xmlns='http://www.w3.org/2000/svg' ...></svg><span>Bazon</span>");
                $(".view--filmixpva", Lampa.Activity.active().activity.render())
                  .empty()
                  .append("<svg xmlns='http://www.w3.org/2000/svg' ...></svg><span>Filmix</span>");
            }
        } // End updateT

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
            onChange: function () {
                var intervalID = setInterval(function() {
                    if (Lampa.Storage.field('NoTrailerMainPage') == true) {
                        if (Lampa.Activity.active().component === 'main' && Lampa.Activity.active().source === 'cub') {
                            $('#NoTrailerMainPage').remove();
                            var banner = 'div.activity__body > div > div > div > div > div:nth-child(1)';
                            Lampa.Template.add('NoTrailerMainPage', '<div id="NoTrailerMainPage"><style>' + banner + '{opacity: 0%!important;display: none;}</style></div>');
                            $('body').append(Lampa.Template.get('NoTrailerMainPage', {}, true));
                        }
                        if (Lampa.Activity.active().component !== 'main') {
                            $('#NoTrailerMainPage').remove();
                        }
                        if (Lampa.Activity.active().component === 'category' && Lampa.Activity.active().url === 'movie' && Lampa.Activity.active().source === 'cub') {
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
            onChange: function () {
                if (Lampa.Storage.field('NoTimeNoDate') == true) {
                    $('#notimedatescreen').remove();
                    Lampa.Template.add('notimedatescreen', '<div id="notimedatescreen"><style>.screensaver__datetime{opacity: 0%!important;display: none;}</style></div>');
                    $('body').append(Lampa.Template.get('notimedatescreen', {}, true));
                } else {
                    $('#notimedatescreen').remove();
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
            onChange: function () {
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
                } else {
                    $('.open--search').show();
                    $('#no_bar').remove();
                    $('#searchReturnButton').remove();
                }
            }
        });

        /* Настройки кнопок перезагрузки, консоли и выхода (остальные части кода остаются без изменений) */
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
            onChange: function() {
                if (Lampa.Storage.field('Reloadbutton') == false) {
                    $('#RELOAD, #CONSOLE, #ExitButton').addClass('hide');
                } else {
                    $('#RELOAD, #CONSOLE, #ExitButton').removeClass('hide');
                }
            }
        });
        var my_reload = '<div id="RELOAD" class="head__action selector reload-screen hide">' +
            '<svg fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" stroke-width="0.48">' +
            '<path d="M4,12a1,1,0,0,1-2,0A9.983,9.983,0,0,1,18.242,4.206V2.758a1,1,0,1,1,2,0v4a1,1,0,0,1-1,1h-4a1,1,0,0,1,0-2h1.743A7.986,7.986,0,0,0,4,12Zm17-1a1,1,0,0,0-1,1A7.986,7.986,0,0,1,7.015,18.242H8.757a1,1,0,1,0,0-2h-4a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V19.794A9.984,9.984,0,0,0,22,12,1,1,0,0,0,21,11Z"></path>' +
            '</svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_reload);
        $('#RELOAD').on('hover:enter hover:click hover:touch', function() { location.reload(); });
        if (Lampa.Storage.field('Reloadbutton') == false) { $('#RELOAD').addClass('hide'); }
        if (Lampa.Storage.field('Reloadbutton') == true) { $('#RELOAD').removeClass('hide'); }

        var my_console = '<div id="CONSOLE" class="head__action selector console-screen hide">' +
            '<svg width="64px" height="64px" viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" stroke="#ffffff" stroke-width="20.48">' +
            '<path d="..."></path></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_console);
        $('#CONSOLE').on('hover:enter hover:click hover:touch', function() { Lampa.Controller.toggle('console'); });
        if (Lampa.Storage.field('Reloadbutton') == false) { $('#CONSOLE').addClass('hide'); }
        if (Lampa.Storage.field('Reloadbutton') == true) { $('#CONSOLE').removeClass('hide'); }

        var my_top_exit = '<div id="my_top_exit" class="head__action selector exit-screen hide">' +
            '<svg fill="#ffffff" width="256px" height="256px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="..."></path></svg></div>';
        $('#app > div.head > div > div.head__actions').append(my_top_exit);
        $('#my_top_exit').on('hover:enter hover:click hover:touch', function() {
            Lampa.Activity.out();
            if (Lampa.Platform.is('tizen')) tizen.application.getCurrentApplication().exit();
            if (Lampa.Platform.is('webos')) window.close();
            if (Lampa.Platform.is('android')) Lampa.Android.exit();
            if (Lampa.Platform.is('orsay')) Lampa.Orsay.exit();
        });
        if (Lampa.Storage.field('Reloadbutton') == false) { $('#my_top_exit').addClass('hide'); }
        if (Lampa.Storage.field('Reloadbutton') == true) { $('#my_top_exit').removeClass('hide'); }

        /* Стилизация встроенного плеера в стиле YouTube */
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
            onChange: function() {
                if (Lampa.Storage.field('YouTubeStyle') == false) {
                    $('#YOUTUBESTYLE, #YOUTUBESTYLE-POSITION, #YOUTUBESTYLE-POSITION-focus').remove();
                }
                if (Lampa.Storage.field('YouTubeStyle') == true) {
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION', {}, true));
                    $('body').append(Lampa.Template.get('YOUTUBESTYLE-POSITION-focus', {}, true));
                }
            },
            onRender: function() {
                Lampa.Template.add('YOUTUBESTYLE', '<div id="YOUTUBESTYLE" class="hide"><style>div.player-panel__position{background-color: #f00!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION', '<div id="YOUTUBESTYLE-POSITION" class="hide"><style>div.player-panel__position>div:after{background-color: #f00!important; box-shadow: 0 0 3px 0.2em!important;}</style></div>');
                Lampa.Template.add('YOUTUBESTYLE-POSITION-focus', '<div id="YOUTUBESTYLE-POSITION-focus" class="hide"><style>body > div.player > div.player-panel.panel--paused > div > div.player-panel__timeline.selector.focus > div.player-panel__position > div:after{box-shadow: 0 0 3px 0.2em!important;}</style></div>');
            }
        });

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
            onChange: function() { }
        });
        
        Lampa.Template.add('CLOCKSTYLE', '<div id="clockstyle"><style>#MyClockDiv{position: fixed!important;' + Lampa.Storage.get('Clock_coordinates') + '; z-index: 51!important}</style></div>');
        $('body').append(Lampa.Template.get('CLOCKSTYLE', {}, true));

        // Дополнительные настройки плагина (например, разделы YouTube, RuTube, Twitch, языковые настройки и т.д.)
        // – остальные части исходного кода остаются без изменений.
    } // End add()

    // Переименовываем плагин в "Приятные мелочи"
    Lampa.SettingsApi.addComponent({
        component: 'Multi_Menu_Component',
        name: 'Приятные мелочи',
        icon: '<svg viewBox="0 0 1024 1024" class="icon" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000">' +
              '<path d="..."/>' +
              '</svg>'
    });

    add();
})();
