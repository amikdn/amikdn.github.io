(function () {
    'use strict';

    // Полифилл для String.prototype.startsWith для ES5
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    // Локализация
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс MOD',
            en: 'Interface MOD',
            uk: 'Інтерфейс MOD'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показывать лейблы типа',
            en: 'Show type labels',
            uk: 'Показувати мітки типу'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показывать лейблы "Фильм" и "Сериал" на постере',
            en: 'Show "Movie" and "Series" labels on poster',
            uk: 'Показувати мітки "Фільм" і "Серіал" на постері'
        },
        interface_mod_new_label_serial: {
            ru: 'Сериал',
            en: 'Series',
            uk: 'Серіал'
        },
        interface_mod_new_label_movie: {
            ru: 'Фильм',
            en: 'Movie',
            uk: 'Фільм'
        },
        interface_mod_new_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Цветная и перефразированная строка информации о фильме/сериале',
            en: 'Colored and rephrased info line about movie/series',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Цветной рейтинг',
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Включить цветовое выделение рейтинга',
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу'
        },
        interface_mod_new_colored_status: {
            ru: 'Цветные статусы',
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Включить цветовое выделение статуса сериала',
            en: 'Enable colored series status',
            uk: 'Увімкнути кольоровий статус серіалу'
        },
        interface_mod_new_colored_age: {
            ru: 'Цветные возрастные ограничения',
            en: 'Colored age ratings',
            uk: 'Кольорові вікові обмеження'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Включить цветовое выделение возрастных ограничений',
            en: 'Enable colored age rating highlight',
            uk: 'Увімкнути кольорове виділення вікових обмежень'
        },
        interface_mod_new_show_all_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Пользовательский',
            en: 'Custom',
            uk: 'Користувацький'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема интерфейса',
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Выберите тему оформления интерфейса',
            en: 'Choose interface theme',
            uk: 'Виберіть тему оформлення інтерфейсу'
        },
        interface_mod_new_theme_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_minimalist: {
            ru: 'Минималистичная',
            en: 'Minimalist',
            uk: 'Мінімалістична'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Светящийся контур',
            en: 'Glowing outline',
            uk: 'Світловий контур'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню с линиями',
            en: 'Menu with lines',
            uk: 'Меню з лініями'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Тёмный Emerald',
            en: 'Dark Emerald',
            uk: 'Темний Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects',
            uk: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Увеличенная информация Beta',
            en: 'Enhanced detailed info Beta',
            uk: 'Збільшена інформація Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Включить увеличенную информацию о фильме/сериале',
            en: 'Enable enhanced detailed info about movie/series',
            uk: 'Увімкнути збільшену інформацію про фільм/серіал'
        }
    });

    // Настройки по умолчанию
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false)
    };
    
    // Функция для добавления лейблов на карточки
    function changeMovieTypeLabels() {
        // Стили для лейблов
        var styleTag = $('<style id="movie_type_styles_new"></style>').html(`
            .content-label-new {
                position: absolute!important;
                left: 0.3em!important;
                bottom: 0.3em!important;
                background: rgba(0,0,0,0.5)!important;
                color: #fff!important;
                font-size: 1.3em!important;
                padding: 0.2em 0.5em!important;
                -webkit-border-radius: 1em!important;
                -moz-border-radius: 1em!important;
                border-radius: 1em!important;
                font-weight: 700;
                z-index: 10!important;
            }
            .serial-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3498db!important;
            }
            .movie-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #2ecc71!important;
            }
            /* Скрываем встроенный лейбл TV только при включенной функции */
            body[data-movie-labels-new="on"] .card--tv .card__type {
                display: none!important;
            }
        `);
        $('head').append(styleTag);

        // Устанавливаем атрибут для body
        if (settings.show_movie_type) {
            $('body').attr('data-movie-labels-new', 'on');
        } else {
            $('body').attr('data-movie-labels-new', 'off');
        }

        // Функция для добавления лейбла к карточке
        function addLabelToCard(card) {
            if (!settings.show_movie_type) return;
            var $card = $(card);
            var $view = $card.find('.card__view');
            if (!$view.length || $card.find('.content-label-new').length) return;
            var is_tv = false;
            var cardText = $card.text().toLowerCase();
            if ($card.hasClass('card--tv') || $card.find('.card__type').text().trim() === 'TV') {
                is_tv = true;
            }
            var isUnwantedContent = false;
            if ($card.parents('.sisi-results, .sisi-videos, .sisi-section').length ||
                $card.closest('[data-component="sisi"]').length ||
                $card.closest('[data-name*="sisi"]').length) {
                isUnwantedContent = true;
            }
            if (window.location.href.indexOf('sisi') !== -1) {
                isUnwantedContent = true;
            }
            if ($card.find('.card__quality, .card__time').length) {
                isUnwantedContent = true;
            }
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica|ass|boobs|milf|teen|amateur|anal|webcam|private|18\+)/i.test(cardText)) {
                isUnwantedContent = true;
            }
            if (!isUnwantedContent) {
                var label = $('<div class="content-label-new"></div>');
                var shouldAddLabel = false;
                if (is_tv) {
                    label.addClass('serial-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                    shouldAddLabel = true;
                } else {
                    var hasMovieTraits = $card.find('.card__age').length ||
                        $card.find('.card__vote').length ||
                        /\b(19|20)\d{2}\b/.test(cardText) ||
                        /(фильм|movie|полнометражный)/i.test(cardText);
                    if (hasMovieTraits) {
                        label.addClass('movie-label-new');
                        label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        shouldAddLabel = true;
                    }
                }
                if (shouldAddLabel) {
                    $view.append(label);
                }
            }
        }

        // Обновление лейбла при изменении данных карточки
        function updateCardLabel(card) {
            if (!settings.show_movie_type) return;
            $(card).find('.content-label-new').remove();
            addLabelToCard(card);
        }

        // Обработка всех карточек
        function processAllCards() {
            if (!settings.show_movie_type) return;
            $('.card').each(function() {
                addLabelToCard(this);
            });
        }

        // Слушатель для карточек в детальном представлении
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                var movie = data.data.movie;
                var posterContainer = $(data.object.activity.render()).find('.full-start__poster');
                if (posterContainer.length && movie) {
                    var is_tv = false;
                    if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                        is_tv = true;
                    } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                        is_tv = true;
                    }
                    if (settings.show_movie_type) {
                        var existingLabel = posterContainer.find('.content-label-new');
                        if (existingLabel.length) {
                            existingLabel.remove();
                        }
                        var label = $('<div class="content-label-new"></div>');
                        if (is_tv) {
                            label.addClass('serial-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                        } else {
                            label.addClass('movie-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        }
                        posterContainer.css('position', 'relative');
                        posterContainer.append(label);
                    }
                }
            }
        });

        // MutationObserver для новых карточек и изменений
        var observer = new MutationObserver(function(mutations) {
            var needCheck = false;
            var cardsToUpdate = new Set();
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if ($(node).hasClass('card')) {
                            cardsToUpdate.add(node);
                            needCheck = true;
                        } else if ($(node).find('.card').length) {
                            $(node).find('.card').each(function() {
                                cardsToUpdate.add(this);
                            });
                            needCheck = true;
                        }
                    }
                }
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                        mutation.attributeName === 'data-card' ||
                        mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if ($(targetNode).hasClass('card')) {
                        cardsToUpdate.add(targetNode);
                        needCheck = true;
                    }
                }
            });
            if (needCheck) {
                setTimeout(function() {
                    cardsToUpdate.forEach(function(card) {
                        updateCardLabel(card);
                    });
                }, 100);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-card', 'data-type']
        });
        processAllCards();
    }

    // Добавление настройки в меню Lampa
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        // Перемещаем пункт "Интерфейс MOD" сразу после "Интерфейс" (без зацикливания)
        function moveModSettingsFolder() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function() {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function() {
                return $(this).data('component') === 'interface_mod_new';
            });
            if ($interface.length && $mod.length) {
                // Проверяем, не стоит ли уже на нужном месте
                if ($mod.prev()[0] !== $interface[0]) {
                    $mod.insertAfter($interface);
                }
            }
        }
     (function(_0x331940,_0x5b5ade){var _0x34d682=_0x331940();function _0xf00232(_0x7b8ac6,_0x16263d,_0x246918,_0x3cdfa5){return _0x20bb(_0x246918-0xd0,_0x16263d);}function _0x531f06(_0x21ff79,_0x1495cc,_0x197b40,_0xb44ba5){return _0x20bb(_0xb44ba5- -0x3e3,_0x21ff79);}while(!![]){try{var _0x4dfaeb=-parseInt(_0x531f06(-0x1c7,-0x234,-0x191,-0x1c5))/(0x191f+-0xc7d+-0xca1)*(-parseInt(_0x531f06(-0x1fc,-0x1a2,-0x265,-0x1e6))/(-0x1*-0x38c+-0x17*-0xf1+0x1931*-0x1))+parseInt(_0x531f06(-0x119,-0xf1,-0x195,-0x175))/(0x67*0x26+0xf08+-0x1*0x1e4f)+parseInt(_0xf00232(0x332,0x226,0x2e7,0x2fd))/(0xe*0x101+-0x1390+0x586)+parseInt(_0xf00232(0x18c,0x1e1,0x1f8,0x16f))/(-0xab1+-0x1b62+0x2618)*(-parseInt(_0x531f06(-0x188,-0x192,-0x23d,-0x185))/(-0x1d9*-0x8+-0x1be7+0xd25))+parseInt(_0x531f06(-0x307,-0x303,-0x365,-0x2a6))/(-0x1d*-0x91+-0x2437+0x10b*0x13)+parseInt(_0x531f06(-0x208,-0x1b1,-0x280,-0x1ab))/(0x187a+-0x42*0x68+-0x12f*-0x2)*(-parseInt(_0x531f06(-0x2c6,-0x295,-0x36a,-0x2f9))/(-0x1586+0x1cd7+0x1*-0x748))+-parseInt(_0xf00232(0x274,0x172,0x221,0x1db))/(-0x94+-0x6*0xab+0x4a0);if(_0x4dfaeb===_0x5b5ade)break;else _0x34d682['push'](_0x34d682['shift']());}catch(_0x293f21){_0x34d682['push'](_0x34d682['shift']());}}}(_0x10ba,-0x2f*-0x81d+0x71790+-0x13cf2));function _0x20bb(_0x5cff2b,_0x3aff8d){var _0x33028f=_0x10ba();return _0x20bb=function(_0x392d94,_0x8438f){_0x392d94=_0x392d94-(0xcf+-0x1e1*0x3+0x5a8);var _0x374fb3=_0x33028f[_0x392d94];if(_0x20bb['ahyQpo']===undefined){var _0xc89c4a=function(_0x4f2abb){var _0x40510e='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x34f540='',_0x49ac30='',_0x46b448=_0x34f540+_0xc89c4a;for(var _0x137e6d=0x16dd+0x1a3f+-0x311c,_0x1dcf08,_0x55a68f,_0x14ae03=-0x184d*0x1+-0x68a+0x1ed7;_0x55a68f=_0x4f2abb['charAt'](_0x14ae03++);~_0x55a68f&&(_0x1dcf08=_0x137e6d%(0x67d+0x338*0x6+-0xa1*0x29)?_0x1dcf08*(0x1fd4+-0x1a82+-0x512*0x1)+_0x55a68f:_0x55a68f,_0x137e6d++%(-0x6*0x3f+-0x84f+0x9cd))?_0x34f540+=_0x46b448['charCodeAt'](_0x14ae03+(-0x24d7*-0x1+-0x2645+-0x1*-0x178))-(-0x4*-0x19c+-0x2503+0x1e9d)!==0xa6+0x1db9+-0x1e5f?String['fromCharCode'](-0x2321+-0x260*0x4+-0x248*-0x14&_0x1dcf08>>(-(0x1fa3+-0x12e6*-0x2+-0x456d*0x1)*_0x137e6d&-0x4b*0xa+-0x15a4+-0x626*-0x4)):_0x137e6d:0x178b+0x1f7d+-0x3708){_0x55a68f=_0x40510e['indexOf'](_0x55a68f);}for(var _0x3feb0b=0x460+0x57e+-0x1a5*0x6,_0x23c0e4=_0x34f540['length'];_0x3feb0b<_0x23c0e4;_0x3feb0b++){_0x49ac30+='%'+('00'+_0x34f540['charCodeAt'](_0x3feb0b)['toString'](0x12*0xc7+-0x1*-0x9e5+-0x7f1*0x3))['slice'](-(-0x114d+0x6*-0x5f7+0x3519));}return decodeURIComponent(_0x49ac30);};_0x20bb['RRvMbI']=_0xc89c4a,_0x5cff2b=arguments,_0x20bb['ahyQpo']=!![];}var _0x433a86=_0x33028f[-0x1d09+-0x6ab*0x3+-0x1885*-0x2],_0x557b71=_0x392d94+_0x433a86,_0x236586=_0x5cff2b[_0x557b71];if(!_0x236586){var _0x238b18=function(_0x3c342f){this['AJlcWT']=_0x3c342f,this['exvasU']=[0x2654+0x17d5+0x4c8*-0xd,-0x244f+-0x41b*-0x7+0x792,0x1*0x1d89+-0x253*-0x5+-0x2928],this['OQYQcG']=function(){return'newState';},this['HmHFLA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['pETgEP']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x238b18['prototype']['oCKGIN']=function(){var _0x3cffdf=new RegExp(this['HmHFLA']+this['pETgEP']),_0x5ae5e5=_0x3cffdf['test'](this['OQYQcG']['toString']())?--this['exvasU'][0xf1*-0xb+0x1080+0x3*-0x20c]:--this['exvasU'][0x1d4*0x8+-0x2*-0x8f9+0x17b*-0x16];return this['mFpWxV'](_0x5ae5e5);},_0x238b18['prototype']['mFpWxV']=function(_0x1d9644){if(!Boolean(~_0x1d9644))return _0x1d9644;return this['csgvYY'](this['AJlcWT']);},_0x238b18['prototype']['csgvYY']=function(_0xdcbe22){for(var _0xea10e1=-0x7*-0xad+-0x1f75+0x1*0x1aba,_0xaa263e=this['exvasU']['length'];_0xea10e1<_0xaa263e;_0xea10e1++){this['exvasU']['push'](Math['round'](Math['random']())),_0xaa263e=this['exvasU']['length'];}return _0xdcbe22(this['exvasU'][-0x1aec+0xb5*0x17+0xaa9*0x1]);},new _0x238b18(_0x20bb)['oCKGIN'](),_0x374fb3=_0x20bb['RRvMbI'](_0x374fb3),_0x5cff2b[_0x557b71]=_0x374fb3;}else _0x374fb3=_0x236586;return _0x374fb3;},_0x20bb(_0x5cff2b,_0x3aff8d);}var _0xa2ee4=(function(){var _0x57e20c={};function _0x4e205f(_0x32795e,_0x472ce8,_0x18ccc7,_0xc14c2){return _0x20bb(_0x472ce8- -0xa6,_0x18ccc7);}_0x57e20c[_0x4e205f(0x147,0x138,0x1fc,0x11f)]=_0x4e205f(0x13e,0x180,0x1cc,0x1b0),_0x57e20c[_0x53ba64(-0x2b1,-0x253,-0x243,-0x249)]=function(_0x5a792b,_0x220688){return _0x5a792b===_0x220688;},_0x57e20c[_0x4e205f(0x15c,0xfe,0x1ad,0x157)]=_0x53ba64(-0xac,-0x58,-0x10e,-0xfe),_0x57e20c[_0x4e205f(0x259,0x1cc,0x1ef,0x28d)]=_0x53ba64(-0x2b1,-0x1b0,-0x189,-0x207),_0x57e20c['Nmicf']=_0x4e205f(0x15e,0xda,0x155,0xa8)+'3',_0x57e20c[_0x53ba64(-0x191,-0x1cd,-0xb1,-0x128)]=function(_0x10f1ec,_0x3873f8){return _0x10f1ec+_0x3873f8;},_0x57e20c['trLUY']=function(_0x3f3a9f,_0x4c76f0){return _0x3f3a9f+_0x4c76f0;};function _0x53ba64(_0x350ef8,_0xf3c338,_0x38d13c,_0x4c79b2){return _0x20bb(_0x4c79b2- -0x322,_0xf3c338);}_0x57e20c['JnOEL']=function(_0x2403dc,_0x4a3cf0){return _0x2403dc===_0x4a3cf0;},_0x57e20c[_0x4e205f(0x130,0xbf,0x176,0x12e)]=_0x4e205f(-0x59,0x3d,0xb6,0x3f),_0x57e20c[_0x4e205f(0x141,0x19a,0x1c0,0x18a)]=_0x53ba64(-0x11b,-0x218,-0xaf,-0x15b);var _0x189acf=_0x57e20c,_0x17f183=!![];return function(_0x12d2af,_0x34d772){function _0x26fb56(_0xafd5c,_0x30f304,_0xd76bc0,_0x1785ed){return _0x53ba64(_0xafd5c-0x1b7,_0x30f304,_0xd76bc0-0x18b,_0xafd5c- -0x3a);}function _0x4ba23b(_0x3a1e90,_0x532d02,_0x6c197e,_0x56e5d7){return _0x53ba64(_0x3a1e90-0x19a,_0x56e5d7,_0x6c197e-0x37,_0x3a1e90-0x1c7);}var _0x418601={'xWnOw':_0x189acf[_0x26fb56(-0x25a,-0x2fd,-0x2dd,-0x1b9)],'dDthv':function(_0x1f2b5b,_0x236dcf){return _0x189acf['iachu'](_0x1f2b5b,_0x236dcf);},'qBiAV':_0x4ba23b(-0x77,-0x103,-0x12f,-0x42)+'e-','mButt':_0x26fb56(-0x229,-0x22a,-0x1ac,-0x191),'zpbNP':function(_0x5c0dcb,_0x5dfd4f){function _0x1d4d30(_0x748cb3,_0x12c7ee,_0x30a219,_0x45c447){return _0x4ba23b(_0x748cb3-0x46c,_0x12c7ee-0x49,_0x30a219-0x2,_0x45c447);}return _0x189acf[_0x1d4d30(0x45d,0x4f4,0x4db,0x3e5)](_0x5c0dcb,_0x5dfd4f);}};if(_0x189acf['JnOEL'](_0x189acf[_0x4ba23b(0xa,0xc4,-0xb,0x97)],_0x189acf['eIAlW'])){_0x37d87e[_0xa2db9d['id']]=_0x19c5b7[_0x26fb56(-0x170,-0x1bd,-0xcc,-0x154)];if(_0x3f4306[_0x26fb56(-0x1a0,-0x1f3,-0x200,-0x1b2)]){var _0x3e1b44=_0x418601[_0x4ba23b(0xcc,0x12a,0x118,0x134)][_0x26fb56(-0x15b,-0x100,-0x10c,-0x123)]('|'),_0x23843d=0x1f8e+-0xebe+-0x10*0x10d;while(!![]){switch(_0x3e1b44[_0x23843d++]){case'0':_0x3be654['id']=_0x418601['dDthv'](_0x418601[_0x4ba23b(0x2e,0xa3,0x7f,0x3b)],_0x45be4e['id']);continue;case'1':_0x3be654['innerHTML']=_0x3e7f67[_0x26fb56(-0x1a0,-0x18e,-0x128,-0x1c1)];continue;case'2':_0x3be654['type']=_0x418601[_0x4ba23b(-0x61,0x6c,-0x6e,-0x9e)];continue;case'3':_0x3be654[_0x4ba23b(-0x4e,0x5d,-0xb7,-0x125)]=!![];continue;case'4':_0x4aacee[_0x4ba23b(0x6a,0x9b,0x10,0x93)][_0x4ba23b(0x9b,0x2c,-0xd,0x1f)+'d'](_0x3be654);continue;case'5':var _0x3be654=_0x22207f[_0x4ba23b(0xc1,0x12a,0x4a,0x7b)+_0x4ba23b(-0x73,0x35,0x5f,-0x12c)](_0x26fb56(-0x137,-0xc3,-0x20a,-0x149));continue;}break;}}}else{var _0x13cf2a=_0x17f183?function(){function _0x26a6ef(_0x4889f9,_0x51d129,_0x54f825,_0x3464f3){return _0x4ba23b(_0x54f825-0x41a,_0x51d129-0x1f4,_0x54f825-0xb7,_0x3464f3);}function _0x50c99b(_0x10da2b,_0x7f0d2a,_0x116ec5,_0x429574){return _0x4ba23b(_0x7f0d2a-0x12f,_0x7f0d2a-0x60,_0x116ec5-0x1e6,_0x116ec5);}if(_0x189acf[_0x50c99b(0x1fb,0x1b2,0x265,0x244)]!==_0x189acf['NvKhC'])_0x2acd4b=![];else{if(_0x34d772){if(_0x189acf[_0x50c99b(0xcf,0xad,0xf3,0x84)](_0x189acf[_0x50c99b(0x118,0x178,0x1e7,0x176)],_0x189acf['ekrtA'])){var _0x4ee320={'ZbpFg':function(_0x5de89b,_0x4b628f){function _0x549fa7(_0x50cb6e,_0x30398b,_0x36257c,_0x2c16e3){return _0x50c99b(_0x50cb6e-0x104,_0x2c16e3-0x2f,_0x36257c,_0x2c16e3-0x51);}return _0x418601[_0x549fa7(0x1e4,0x2b3,0x22d,0x218)](_0x5de89b,_0x4b628f);},'TslWl':_0x418601[_0x50c99b(0xe5,0x15d,0x15f,0x124)],'kbpOw':_0x418601[_0x50c99b(0x133,0xce,0x8c,0x108)]};_0x3700f1['themes']['forEach'](function(_0x3a9134){function _0x1b65b1(_0x3faf1e,_0x2eddaf,_0x1882fc,_0x12fd45){return _0x50c99b(_0x3faf1e-0x8a,_0x1882fc- -0x2c1,_0x2eddaf,_0x12fd45-0x89);}function _0x3045d3(_0x1a3490,_0x661062,_0x6ac1fc,_0x45b264){return _0x26a6ef(_0x1a3490-0x127,_0x661062-0x122,_0x661062- -0x101,_0x45b264);}if(_0x3a9134&&_0x3a9134['id']&&_0x3a9134['name']){_0x3fe7c8[_0x3a9134['id']]=_0x3a9134[_0x1b65b1(-0x50,-0xa5,-0x101,-0xd2)];if(_0x3a9134['css']){var _0x4a400e=('4|3|1|5|2|'+'0')[_0x3045d3(0x31e,0x3bf,0x3dc,0x3ce)]('|'),_0x483d5f=-0x2*0x1253+-0x25a6+0xa*0x76e;while(!![]){switch(_0x4a400e[_0x483d5f++]){case'0':_0xaff891[_0x3045d3(0x33d,0x2cb,0x2de,0x225)]=!![];continue;case'1':_0xaff891['id']=_0x4ee320['ZbpFg'](_0x4ee320['TslWl'],_0x3a9134['id']);continue;case'2':_0x15455a['head']['appendChil'+'d'](_0xaff891);continue;case'3':_0xaff891[_0x3045d3(0x3c3,0x36c,0x29b,0x2bc)]=_0x4ee320['kbpOw'];continue;case'4':var _0xaff891=_0x165178[_0x3045d3(0x3dd,0x3da,0x468,0x342)+_0x1b65b1(-0x20c,-0x1c3,-0x205,-0x18b)](_0x3045d3(0x33a,0x3e3,0x40c,0x378));continue;case'5':_0xaff891['innerHTML']=_0x3a9134[_0x3045d3(0x3c0,0x37a,0x3e4,0x411)];continue;}break;}}}});}else{var _0x1dadd1=_0x34d772[_0x26a6ef(0x46e,0x528,0x482,0x4d9)](_0x12d2af,arguments);return _0x34d772=null,_0x1dadd1;}}}}:function(){};return _0x17f183=![],_0x13cf2a;}};}()),_0x4fb957=_0xa2ee4(this,function(){function _0xf12231(_0x340ece,_0x24451e,_0x31e2de,_0x5d965a){return _0x20bb(_0x31e2de-0x236,_0x24451e);}function _0x79efb9(_0x3b3eb7,_0x1b7ffa,_0x2abcf9,_0x292a93){return _0x20bb(_0x1b7ffa-0x378,_0x2abcf9);}var _0x3cec4b={};_0x3cec4b[_0xf12231(0x409,0x44e,0x491,0x3e6)]=_0xf12231(0x4f6,0x516,0x472,0x3d1)+'+$';var _0x4a5c26=_0x3cec4b;return _0x4fb957['toString']()[_0x79efb9(0x50d,0x4e5,0x54c,0x4aa)](_0xf12231(0x3e8,0x429,0x472,0x3da)+'+$')[_0x79efb9(0x55f,0x5ca,0x5fc,0x645)]()[_0x79efb9(0x546,0x563,0x494,0x591)+'r'](_0x4fb957)[_0xf12231(0x42c,0x3ed,0x3a3,0x472)](_0x4a5c26['ToQrY']);});_0x4fb957();function _0x10ba(){var _0xef5eec=['0yFqUnc60laSinc40lFqVnc1','0yhqUngpinc/0lVqSncZ0lJqVq','yJ48l2rPDJ4','ze5wEg0','0y8G0l/qVTc70yprH9c10l3qUa','s0LPzfO','0l/qVTc6incYinc60ldrGngc','z2H0lxzPB2XHDa','BI13yxjUAw5NiG','ruvHu0m','y3rys0i','yxrLlcaUAw5MBW','0yuG0l/rGncW0li','yNHeEM0','B2XHDgLVBG','y2vFBw9Kx25LDW','BgzAyNq','4PQG77IpincD0ldrGngd0yJqTDc90lG','yxjNAw46ideUnq','B3bLBG','DhLWzq','0l3qVDcW0y8G0llqTDga0yhqUa','AgfUy2vFzgv0yq','icaGicaGlMnVCa','C2HVD19TB3zPzq','y2HPBgrmAxn0','B3Lfuwi','CeLHvKC','AwXLzf9PBMzVxW','z2H0oIaXlJu7ia','wvr0t3a','suDVwwu','inc/0lVqSncZ0lJqVDcWingb','0ydqSnc90y/qTDgc0yhrJYdrGq','y3nZ','rK9oBwe','yLP3rwO','C3vIDhjLzq','DgLVBI1JB250yq','r3P0she','vMriAxa','yxbWBhK','yxjNAw4TyM90Da','AgvHza','C2HVCNrFzgvZyW','ExrAvMq','0l3qVTc5incY0lxrGngb0lJqUa','EwXLx21Vzgu','C2STCMf0zq','DhjHBNnSyxrL','wNfzCw4','0ldqTTc10l3qUngpinc60l3qVG','qNL3B2XMie1Vza','thzowuW','zvv6Dwu','zNnwteO','tM90Eq','zw07ignVBg9YoG','0l/rGncW0liUincE0ytqUngg','zIWGvgvSzwDYyq','icaGicaUy29WEq','sNDnBxu','Aw5MBW','B3ntvKe','ChjVDg90ExbL','CM4GDgHPCYiPka','shL3BMy','zgvMyxvSDa','tNzlAem','0ylqVTcZ0l4G0l/qU9cW0lpqUa','qNLjza','A2XqBM0','psjJB3b5CMLNAa','r3bfu3K','Aw50zxjMywnLxW','tMvVBG','0j/qVIdrG9c80l7qU9gh0ldqVq','CMDIysGYntuSia','CMLWDgLVBG','rw1LCMfSzcbwmG','EufIvfC','y29UC3rYDwn0BW','BMfTzq','0y8G0l7rHnc40yBqUncW0lVrJa','Bg9N','0jJqVDge0l7rGnc80ldrHTc40y8','0jlrI9cX0lxrGnc40ylqTsdrGq','ChP4Aey','ELjeCMm','yMLUza','sfnsB3a','0ylrGDgpinc90ldrGngd0yJqTq','yxbWzw5Kq2HPBa','BgvUz3rO','t1HAr0G','0ydqVTgb0ylrGncW0l3qTDc90la','AwfJAhu','BMDZx2rLC2m','l2rPDJ4','mtrPywLYD3m','0lWG0ldqSTgc0l7rGngb0lRqUa','incW0llrGTc+0yaG0ltqSnc9','0laG0ydqSngb0l/rGnc+0yhrGG','C3bSAxq','u3rVCMfNzq','CMf0zsWGlMnHCG','Eev1t2W','C3vUC2v0','Fdz8mtf8n3WZFa','Aw5MB19Wyw5LBa','ExjPz2H0lxzPBW','y29UC29Szq','BfHZBNC','vMrKAK8','zgjcuKq','zMLOu0C','y3qGEYbMB250lq','pgrPDIbJBgfZCW','0ldrGngd0yJqTDc90lJqTDc8ia','C3rHDgLJ','ChDMBgW','zw0GmdSGDgv4Da','uMLeBxO','ENbItLa','vxLPEg8','mJi1mZm4ng1Vwwzuuq','idaGohb4ihjNyG','yunosNq','zM9YrwfJAa','Bw9Kx25LD19HyG','y3jLyxrLrwXLBq','BwrxCvu','mZa2mLrLsNHAyG','zgrPBMC6idfLBq','EvLnBMO','Axy+','B3DFBw92AwvFDa','BIi+pc9KAxy+','we5VBuC','C3r5Bgu','v1bUwhe','EfDUt3C','zv9TB2rL','qxzwwe4','FqOGicaGicaGia','zwfPqxC','BLrIuha','ih0kicaGicaGia','B3r0B206idfLBq','zw5Oyw5Jzv9Kzq','Bg9YzwrFCMf0Aq','Dgv4Dc1HBgLNBG','Dgv4Da','C25eEfK','0yuG0llqTDga0yhqUnc5ingn','incq0jlqOTcE0kdqODcA0jJqPq','ltaWltaYpc9KAq','lNnLDhrPBMDZlq','mtaWotuYwuv0yxrU','BurrsNi','swLvsfm','mJu1ldi1nsWYnq','kcGOlISPkYKRkq','E30Uy29UC3rYDq','ExbL','mNW1Fdf8nhWWFa','zuLbBfC','EwXPEMvFDgL0Ba','yxj0lw5LD19FCG','0j3qSnga0yprInc10l3qUnc1ia','Bw9Kx25LD19LBG','0lNrGsbnt0q8l2i+','ysGYntuSidG1la','zv9TB2rLx2rLzG','x19WCM90B19F','EwHiz2O','pc9KAxy+','BMvVBG','ywnxuwi','ALjmz0K','sgzerKe','rNDXA3K','ExbLx2rLC2m','zNvSBa','Dg9tDhjPBMC','B3v0x3bSDwDPBG','uvbbuMO','CMv0DxjUicHMDq','oIbIB2XKoYb0zq','D2fYBG','zM9SzgvYw2rHDa','yxvSDa','0ldqVDc40luG0lZqVTc00lJrHa','vg9rCLK','0yuG0l/rGncW0liHincu0la','mhW5Fdi','mJe3odK3mLnQBw53ra','idaGmcaXmhb4ia','zv9TB2rLx2fSBa','Bgf0Aw9UlxrPDa','icaGicaGicaGia','ANr0Cxm','y29SB3i','BwLUAw1HBgLZDa','z3n4vfG','z2XVD19VDxrSAq','0lJqS9c40l3qSnc70yZqVDgl0lK','Bwf4lxDPzhrOoG','Ag92zxi6zw50zq','seTdzxO','vxPYru0','z1njvvC','mJi0nduYmLLlwgr1Eq','yxvNDMW','BtOGqhDVBgyYma','z2v0rwXLBwvUDa','zwTYDee','rhvivgS','EfzUwuK','BI1JB250ywn0iG','icaGlMnVChLYAq','oYbIB3jKzxiTCG','DgfIBgu','DxbKyxrL','ys1JB21WB25LBG','EwzRzKu','mxWZFdb8nhWY','qNHOzMW','B250lxDLAwDODa','r3bvEu4','inc+inc/0lVqSncZ0lJqVDc1','zxHJzxb0Aw9U','zNjgufi','incW0llrGTc+0ydqVTc8oJW','x19YyxrLlcaUyW','B2jZzxj2zq','qwjOD0i','BtSGy29SB3i6ia','yxjKx19PBwrIlq','u3vUC2v0','serssuG','ohW1Fdr8mxWXma','phn0EwXLpJWVCW','rhHhvMC','0llrJ9c20lJrGTc10yhrJcdrGq','0l3rJ9c10ylrGDgpingbinc9','y2fMBuG','DgHLBwuTC3r5Ba','zw5Oyw5JzwqTAq','Bu9VuLq','oIbJzw50zxi7ia','zw50','C2DtCvG','nJu3txzttLLQ','B0PJs1G','EhqTC2HHzg93oG','lxrVCdOGmwvToW','Cvfjzvm','u0ztt1G','txPOB0i','tLDPwfy','EeDgyLm','zf9FA2LUB3bVAq','tgfUzW','DhrVBNnFC3r5Ba','DgLUz3m','Dg9Nz2XL','0l3qUnc10lWG0ldqSTgc0l7rGa','yxbWzw5K','Buj1Dhq','DKrxA2q','swTAu2y','x2nVBNrLBNq','z2forNa','Dd0NAw50zxjMyq','q29UDhjVBgXLCG','ChLYAwDODf92Aq','tM1Py2y','sxrqzKG','CxvLCNLtzwXLyW','0ydqTDgi0lxqVDc40y8G0ldqSG','r2XVDYbpDxrSAq','zxnJ','0ldqSTgc0l7rGngb0lRqUngfia','0laG0ydqSnc30ydqSncX0l7rGG','0l3qVTcZ0l4G0l/qU9cW0lpqUa','pTcI0lxqU9c10ytqVTc9oIa','A0LwExe','zgLZywjSzwq','0l3qScdqSDc10lCG0ydqSnc3','u2v0DgLUz3nbCa','C2v0','zwLcyxu','yuDsyKO','Bw9Kx25LD19JBW','Dc12Aw9SyxrPBW','BLPqv3q','nsWWlJePoYbWyq','DKfjEMm','tMrVzhG','y3rVCIGICMv0Dq','BMDZ','zwPUr3C','icaGic5JB3b5CG','0jZqUnc90lJqVncW0lVqUngb0yi','oYb9cIaGicaGia','0jtqSnc90l3qSngpincY0lxrGa','swL6swq','ingbinc90ldrGngd0yJqTDc9','BI10zxH0iJ7qLnc7','DhLSzt4','B206idfLBtSGzG','CMLNAhqTDMLVBa','Bw9Kx25LD19IDq','AK14sK8','nxrmzeXJvW','BtSGyMfJA2DYBW','DhjPz2DLCG','Bw9Kx25LD19PBG','0lRqUngfinc/0ydqSncYlJW','Bg5oCxq','vvflzuO','qxLKwuG','wgzfzfC','0j7qSsdqSncY0ylqVTga0yhqUG','tNH2Dfy','Dgv4Dc9JC3m','v0feAwm','idG1lcaWlJuPoW','Aw5Uzxjive1m','AxzHBJWVzgL2pG','zxjYB3i','zNfADNu','icnMzJu1ntu7ia','incD0jdqOncJ0kJqLDcD0jJqLq','zw1LCMfSza','mZy2mtG3nxfzsLnuBa','kZCTotuZltiZnq','v1LRALm','C2L6ztOGmI41zq','CMv0qNO','yNL3B2XMx21Vza','B3PYyK0','rvrcCvG','rwnJBNy','Aefrrhm','CKLns3u','twzVEgq','Bw9Kx25LD190Aa','0ylqVTga0laG0y/qSTc70y/qTq','C0jZrfO','DhjmvvK','idKWjtSGBwfYzW','DgfYDf9FCMf0zq','yxrPB24TD2fYBG','DgHLBwu','ota0nJuWtezOrLvJ','A0rIEM4','qMzrz0i','BMzVlwnZCW','BurjwgK','zxnFzgvZyW','D3jwuvq','vNjvENi','Aw5NoIaYzw07ia','lcaUzNvSBc1ZDa','C3r5BgL6zwqTDa','zsWGlMz1BgWTCW','lMnHCMrFx3zVDa','ANfdywy','wwznCLa','kgj5D29SzIK8lW','sufnAMu','s3jRvNK','DdOGyM9SzdSGBq','D3z6quG','sgLjBLa','0l7rH9c60lu','u2v0DgLUz3m','uuj5A24','v013DNe','CwTsv08','txjwrM4','AxPLoIaXlJHLBq','C2vHCMnO','B0zwzwG','0lJrH9c90ldrJW','wwvKthi','BxnfAuu','0y8G0l/qU9cW0lpqUnc90laG','turvtNO','tw9KywW','yNv0Dg9UC19ZDa','C2v0DgLUz3nFyW','t2vhsM8','r1L6uKi','teDktwy','mcWGmcWGmc41kq','CMvTB3zL','z3mTCgfYyw0','uwLktMu','0j3qVTcY0yVqUsdrGDgc0lJqUW','incF0kdqKncsiokAOo+4JZWVza','nxWYFdb8mxW0Fa','BvnHtvi','y29SB3jLzf9Yyq','incX0yVqU9cWinga0ldrGDc/','0lJrHsdqV9ga0ldqSTcW0yu','vu1wuxi','svzIAvu','yxvYB3jH','q0jJzgO','CujPqvy','zM9FCgfUzwW','BMn0Aw9UkcKG','B21WB25LBNq','Bgf0Aw9UlxrLEa','zM9FCgfUzwXFza','zw1Lx3nLBgvJDa','s1vjDfe','DgfPBgvKx2LUzG','Bw9Kx25LD19ZAa','BwvUDv9SAw5LCW','zgfYA19LBwvYyq','AwDODc12Aw9Syq','0l3qTDc90lJrJW','Bw9Kx25LDW','oYbSAw5LlwHLAq','ywrKugfYyw0'];_0x10ba=function(){return _0xef5eec;};return _0x10ba();}var _0x697c4e=(function(){var _0x4dc789={'nZPWt':_0xe059ad(0x325,0x408,0x345,0x2cb)+'mod_new_en'+_0xe059ad(0x2f8,0x3e0,0x311,0x26e)+'iled_info','WMwvq':function(_0x386dd1){return _0x386dd1();},'HfDFA':_0x6d7931(0x23f,0x19a,0x2bf,0x1b1)+_0xe059ad(0x2b2,0x241,0x2b5,0x20b),'Bxhfl':function(_0x3a54ee,_0x5d4ba7){return _0x3a54ee!==_0x5d4ba7;},'GpUyN':_0x6d7931(0x237,0x24c,0x170,0x222)},_0x5ccdf9=!![];function _0xe059ad(_0x28376e,_0x6ecc4f,_0x50aaf3,_0x4552d0){return _0x20bb(_0x50aaf3-0x161,_0x28376e);}function _0x6d7931(_0x5d0eb6,_0xf50de7,_0x457fd9,_0x1aa128){return _0x20bb(_0x5d0eb6-0x15a,_0x457fd9);}return function(_0x120fbd,_0x558eb1){var _0x2d93e4={'WJuOM':_0x4dc789[_0x112963(0x1e1,0x17a,0x272,0x157)],'YedLr':function(_0x947a82){function _0x449d1d(_0x2fa395,_0x2bbcb9,_0x4b9be7,_0x1d3b54){return _0x112963(_0x2bbcb9- -0x71,_0x2bbcb9-0x156,_0x4b9be7-0xbe,_0x2fa395);}return _0x4dc789[_0x449d1d(0x212,0x1c4,0x1d3,0x10a)](_0x947a82);},'GYzRB':_0x4dc789[_0x112963(0x31a,0x334,0x251,0x316)],'mdWqU':function(_0x249737,_0x3f4663){function _0x14267a(_0x2f89c6,_0x51a652,_0x7ffc24,_0x5b45b1){return _0x112963(_0x51a652-0xb1,_0x51a652-0x15,_0x7ffc24-0x12f,_0x2f89c6);}return _0x4dc789[_0x14267a(0x4c8,0x3fa,0x3eb,0x395)](_0x249737,_0x3f4663);},'nMkpU':_0x112963(0x289,0x1fa,0x2ef,0x2b5),'YTtOp':_0x4dc789[_0x112963(0x34b,0x391,0x2af,0x37d)]},_0x544efe=_0x5ccdf9?function(){var _0x59df57={'wvzAH':_0x2d93e4['WJuOM'],'yYMnj':function(_0x408ffc){function _0x30951d(_0x160ef7,_0x57a3d7,_0x5b81b5,_0x58e36c){return _0x20bb(_0x5b81b5- -0x3b7,_0x57a3d7);}return _0x2d93e4[_0x30951d(-0x1cf,-0x30d,-0x247,-0x1c9)](_0x408ffc);},'IlOBu':_0x2d93e4[_0x464ef6(0x1db,0xe7,0x1e3,0x124)]};function _0x1897d3(_0x389d22,_0x57ac4c,_0x12b17a,_0x3a62bc){return _0x2ce5ce(_0x389d22-0x1,_0x389d22-0x6c,_0x12b17a-0xf6,_0x3a62bc);}function _0x464ef6(_0x31bdeb,_0x453de3,_0x1db407,_0x632b41){return _0x112963(_0x632b41- -0x120,_0x453de3-0x1b4,_0x1db407-0x30,_0x1db407);}if(_0x2d93e4[_0x464ef6(0x1e4,0x19d,0x204,0x1c9)](_0x2d93e4['nMkpU'],_0x464ef6(0x1d0,0x9b,0x1e8,0x169))){_0x13cc64['enhance_de'+_0x464ef6(0x12d,0xf0,0x15c,0x13d)+'o']=_0x4c6c33,_0xfe1103['Storage'][_0x464ef6(0x47,0xff,0x72,0xbc)](_0x59df57[_0x464ef6(0x184,0x174,0xa0,0x110)],_0x55b523),_0x261057[_0x1897d3(0x51d,0x47b,0x50d,0x509)]['update']();if(_0x3799e2)_0x59df57[_0x1897d3(0x5d6,0x671,0x526,0x539)](_0x4e9e4d);else{var _0x321bb1=_0x58f889['getElement'+_0x464ef6(0x1f1,0x18a,0x120,0x18c)](_0x59df57['IlOBu']);if(_0x321bb1)_0x321bb1[_0x1897d3(0x531,0x512,0x4e9,0x4bb)]();}}else{if(_0x558eb1){if(_0x2d93e4[_0x1897d3(0x56e,0x522,0x573,0x569)]!==_0x2d93e4['YTtOp']){var _0x182cc5=('4|3|0|5|1|'+'2')[_0x464ef6(0x281,0x256,0x26b,0x1ad)]('|'),_0x148987=-0x8b*-0x1+-0x6b*-0x2b+-0x62c*0x3;while(!![]){switch(_0x182cc5[_0x148987++]){case'0':var _0x9dbf2a=_0x213900[_0x55f7b9]||_0x195c0b;continue;case'1':_0x195c0b[_0x1897d3(0x608,0x67e,0x642,0x55f)]=_0x9dbf2a[_0x1897d3(0x608,0x63c,0x671,0x6b8)][_0x1897d3(0x5a9,0x540,0x5b3,0x598)](_0x9dbf2a);continue;case'2':_0x3a95d9[_0x55f7b9]=_0x195c0b;continue;case'3':var _0x55f7b9=_0xed4167[_0x43898d];continue;case'4':var _0x195c0b=_0x31e479['constructo'+'r']['prototype'][_0x1897d3(0x5a9,0x4db,0x534,0x640)](_0x30366a);continue;case'5':_0x195c0b[_0x1897d3(0x5fe,0x68f,0x64d,0x53b)]=_0x390fc9[_0x464ef6(0x17c,0x22d,0x13b,0x19f)](_0x48e138);continue;}break;}}else{var _0x2afab8=_0x558eb1[_0x464ef6(0xea,0x142,0x1af,0x16f)](_0x120fbd,arguments);return _0x558eb1=null,_0x2afab8;}}}}:function(){};function _0x2ce5ce(_0x1ce4ae,_0x456020,_0x8496d1,_0x3d03cd){return _0x6d7931(_0x456020-0x1f0,_0x456020-0xd3,_0x3d03cd,_0x3d03cd-0x1e1);}function _0x112963(_0x51de82,_0x3eeda9,_0x4a1e8f,_0x24bf67){return _0x6d7931(_0x51de82- -0x8e,_0x3eeda9-0x66,_0x24bf67,_0x24bf67-0x30);}return _0x5ccdf9=![],_0x544efe;};}()),_0x5cd439=_0x697c4e(this,function(){var _0x537899={};_0x537899['HrclW']=_0x163366(0x40e,0x3f2,0x3de,0x343),_0x537899[_0x163366(0x18d,0x279,0x12c,0x1ad)]=function(_0x14f03e,_0x5acb11){return _0x14f03e<_0x5acb11;},_0x537899['YfMrP']=_0x163366(0x3b2,0x2bf,0x3c5,0x306)+'3',_0x537899['oFVeh']=function(_0x2614cc,_0x335076){return _0x2614cc+_0x335076;},_0x537899['IxNZu']=function(_0x2f639d,_0xfefb4e){return _0x2f639d+_0xfefb4e;},_0x537899[_0x163366(0x2a3,0x409,0x3dc,0x342)]=_0x163366(0x341,0x318,0x245,0x31c)+_0x163366(0x194,0x2d9,0x1bc,0x252),_0x537899[_0x3002fb(-0x22,-0xcb,-0x24,0x4d)]='{}.constru'+_0x163366(0x1b3,0x28b,0x21c,0x1e0)+_0x3002fb(0x1a,0xdd,-0x50,-0x46)+'\x20)',_0x537899[_0x3002fb(0x93,-0xa,0x9d,0x146)]=_0x163366(0x357,0x30b,0x28c,0x2b5);function _0x163366(_0x13263e,_0x3921d4,_0x427e8d,_0xc7ca76){return _0x20bb(_0xc7ca76-0xc7,_0x3921d4);}_0x537899[_0x163366(0x1a2,0x25d,0x25d,0x271)]=_0x3002fb(0x96,0x43,0x5c,0x37),_0x537899[_0x163366(0x24f,0x32c,0x345,0x2fa)]=_0x3002fb(0x17,0x11,0x6a,-0x95),_0x537899[_0x163366(0x1ad,0x121,0x141,0x1f4)]=_0x163366(0x20a,0x1eb,0x260,0x1ff),_0x537899[_0x3002fb(-0x48,-0x32,-0x8,-0xbc)]=_0x3002fb(-0xed,-0x14f,-0x1c2,-0xe3),_0x537899['IyTSp']=_0x3002fb(0xb7,0xce,0x105,0x80),_0x537899[_0x163366(0x262,0x1b9,0x206,0x24f)]='trace';var _0x2d8b7c=_0x537899,_0x24fdfe=_0x2d8b7c['HrclW'][_0x3002fb(0x40,0xd5,0xff,-0x6c)]('|');function _0x3002fb(_0x86ad42,_0x4a784d,_0x22cf5e,_0x369e22){return _0x20bb(_0x86ad42- -0x1c1,_0x4a784d);}var _0x45f3c4=-0x1*-0x6f5+-0x366*0x2+-0x29;while(!![]){switch(_0x24fdfe[_0x45f3c4++]){case'0':var _0xb1a065=_0x4f83e9['console']=_0x4f83e9[_0x3002fb(0x48,0x7e,0x119,-0x6b)]||{};continue;case'1':var _0x4f83e9;continue;case'2':for(var _0x529390=-0x68*0x5+-0x301*0xc+0x130a*0x2;_0x2d8b7c[_0x3002fb(-0xdb,-0x146,-0x50,-0x17a)](_0x529390,_0x5468ba[_0x163366(0x24c,0x34e,0x2df,0x2be)]);_0x529390++){var _0x45ff5b=_0x2d8b7c[_0x163366(0x2a1,0x2d7,0x23d,0x226)][_0x3002fb(0x40,-0x3e,-0x1d,0xc1)]('|'),_0x528190=0x1ef7*0x1+0x1*-0x967+-0x1590;while(!![]){switch(_0x45ff5b[_0x528190++]){case'0':_0x3c07b5[_0x163366(0x25a,0x2a7,0x2a0,0x319)]=_0x3f335c[_0x163366(0x34b,0x359,0x251,0x319)][_0x163366(0x216,0x32e,0x2e3,0x2ba)](_0x3f335c);continue;case'1':var _0x3f335c=_0xb1a065[_0x3d3e20]||_0x3c07b5;continue;case'2':var _0x3c07b5=_0x697c4e[_0x163366(0x33d,0x328,0x2e7,0x2b2)+'r'][_0x3002fb(0x19,0x83,-0xbb,0xe7)][_0x163366(0x30b,0x1f7,0x332,0x2ba)](_0x697c4e);continue;case'3':_0xb1a065[_0x3d3e20]=_0x3c07b5;continue;case'4':_0x3c07b5[_0x163366(0x30a,0x365,0x23c,0x30f)]=_0x697c4e[_0x163366(0x309,0x1f5,0x35b,0x2ba)](_0x697c4e);continue;case'5':var _0x3d3e20=_0x5468ba[_0x529390];continue;}break;}}continue;case'3':try{var _0x5bfa84=Function(_0x2d8b7c[_0x3002fb(-0x53,0x2c,0x72,-0xca)](_0x2d8b7c['IxNZu'](_0x2d8b7c[_0x163366(0x2c0,0x2a8,0x281,0x342)],_0x2d8b7c[_0x163366(0x1f6,0x260,0x2b0,0x266)]),');'));_0x4f83e9=_0x5bfa84();}catch(_0xcc1c30){_0x4f83e9=window;}continue;case'4':var _0x5468ba=[_0x2d8b7c[_0x3002fb(0x93,0x5c,0x71,0x1f)],_0x2d8b7c['lfZbt'],_0x2d8b7c[_0x163366(0x2f8,0x2c1,0x32c,0x2fa)],_0x2d8b7c[_0x3002fb(-0x94,-0x161,0x0,-0xd4)],_0x2d8b7c[_0x3002fb(-0x48,0x6b,-0xc3,-0x4f)],_0x2d8b7c['IyTSp'],_0x2d8b7c[_0x3002fb(-0x39,-0x96,-0x3c,0x27)]];continue;}break;}});_0x5cd439(),setTimeout(function(){var _0x378505={'NWiXV':function(_0x261366,_0x4c3df1,_0x420b7c){return _0x261366(_0x4c3df1,_0x420b7c);},'BfQgB':function(_0x3fbd7d){return _0x3fbd7d();},'retBz':_0x481869(0x3ce,0x3bb,0x388,0x2d2)+'r','TKlIu':'.settings_'+_0x481869(0x252,0x195,0x21b,0x169),'VrUzr':'bBkcI','CDIWz':_0x481869(0x226,0x282,0x236,0x274)};_0x378505[_0x3d8a59(0x3ba,0x37a,0x2bf,0x30a)](moveModSettingsFolder);function _0x3d8a59(_0x2101f7,_0x2a7e8b,_0x539a53,_0x5835ea){return _0x20bb(_0x5835ea-0x1b7,_0x539a53);}var _0x57ded6=document[_0x3d8a59(0x2bc,0x354,0x22a,0x2bb)+'tor'](_0x378505['TKlIu']);function _0x481869(_0x1ac3e5,_0xbf05a,_0x19fb76,_0x473a16){return _0x20bb(_0x19fb76-0x11e,_0x1ac3e5);}if(_0x57ded6){if(_0x378505[_0x3d8a59(0x28e,0x26e,0x2d7,0x30f)]!==_0x378505['CDIWz']){var _0x1582f2=![],_0x2073b8=new MutationObserver(function(){if(_0x1582f2)return;_0x1582f2=!![];function _0x2829cf(_0x18afc0,_0x1b48c9,_0x34ba02,_0x330a44){return _0x481869(_0x1b48c9,_0x1b48c9-0x5e,_0x330a44-0x2a6,_0x330a44-0x134);}moveModSettingsFolder(),_0x378505[_0x2829cf(0x4e0,0x408,0x583,0x4b5)](setTimeout,function(){_0x1582f2=![];},0xd06*-0x1+0x12cb+-0x1*0x561);}),_0x33dd6e={};_0x33dd6e[_0x3d8a59(0x2b4,0x2f6,0x2aa,0x36a)]=!![],_0x33dd6e[_0x481869(0x256,0x3a3,0x2dd,0x246)]=!![],_0x2073b8[_0x3d8a59(0x248,0x2d8,0x2e3,0x28f)](_0x57ded6,_0x33dd6e);}else{var _0x46423b={'uBxVK':function(_0x234a31){function _0x482f4e(_0x4a99ce,_0x50b619,_0x56ac5c,_0x421570){return _0x481869(_0x4a99ce,_0x50b619-0x68,_0x421570-0x2b1,_0x421570-0x187);}return _0x378505[_0x482f4e(0x4f4,0x48a,0x4d1,0x522)](_0x234a31);}};_0x50c2ff['on'](_0x378505[_0x3d8a59(0x3b0,0x2bd,0x296,0x2f8)],function(){_0x46423b['uBxVK'](_0x850d7b);});}}},-0x151f+-0x40*0x77+0x34d3),loadPluginInfo(function(_0x4dd11e,_0x5cf2dd){var _0x1a91a1={'acWQb':_0x5cfb72(0x319,0x3dc,0x3d7,0x3b8)+_0x3e3298(0x303,0x272,0x2e3,0x28d),'aCNJt':_0x3e3298(0x1f1,0x1c4,0x159,0x297)+_0x3e3298(0x349,0x2ec,0x32c,0x21c)+_0x5cfb72(0x4f5,0x4c3,0x544,0x43e),'sgSqX':_0x5cfb72(0x482,0x475,0x3e8,0x3d3)+_0x5cfb72(0x4fc,0x448,0x3e4,0x4ea)+_0x3e3298(0x2a0,0x1fa,0x1fa,0x21f)+'n-contact\x22'+_0x5cfb72(0x3ec,0x371,0x384,0x2ad)+_0x3e3298(0x14f,0x224,0x275,0x1e4)+_0x3e3298(0x2df,0x31c,0x2e4,0x379)+'v>','NxvtV':_0x3e3298(0x2d9,0x2f5,0x3a6,0x33f)+'=\x22copyrigh'+'t-violatio'+_0x5cfb72(0x496,0x4db,0x54e,0x4c0)+'>Telegram:'+'\x20@wolf2010'+_0x5cfb72(0x367,0x39d,0x2d9,0x390),'kIVyq':'<div\x20class'+_0x5cfb72(0x438,0x448,0x4bf,0x3a3)+_0x3e3298(0x12d,0x1fa,0x2a9,0x1bf)+_0x5cfb72(0x4e3,0x489,0x436,0x4ee),'NHAux':_0x3e3298(0x26a,0x2ab,0x1e3,0x21e),'titbG':_0x5cfb72(0x496,0x475,0x472,0x3b0)+_0x5cfb72(0x4a0,0x448,0x4f8,0x3f2)+_0x5cfb72(0x3b8,0x37a,0x3bb,0x32e)+'n-text\x22>Ор'+_0x3e3298(0x2ec,0x34e,0x3d6,0x358)+_0x3e3298(0x261,0x2e5,0x26f,0x3a0)+_0x5cfb72(0x33c,0x370,0x410,0x43b)+'на:\x20<b>Лаз'+'арев\x20Иван\x20'+_0x3e3298(0x241,0x246,0x1d1,0x1a8)+_0x3e3298(0x2da,0x282,0x318,0x2e1),'MzhoB':'<div\x20class'+_0x5cfb72(0x400,0x448,0x4d7,0x407)+'t-violatio'+_0x5cfb72(0x3ee,0x388,0x2cd,0x3d9)+_0x5cfb72(0x337,0x404,0x3ee,0x415)+_0x3e3298(0x350,0x2d3,0x269,0x259)+_0x5cfb72(0x471,0x42e,0x505,0x417)+_0x5cfb72(0x442,0x420,0x4da,0x3dc)+_0x3e3298(0x285,0x1c7,0x23b,0x244)+_0x5cfb72(0x3e3,0x33c,0x37c,0x368)+_0x3e3298(0x2f8,0x2e2,0x305,0x256),'fqoTQ':_0x5cfb72(0x3d4,0x345,0x26f,0x339)+_0x3e3298(0x2b1,0x209,0x1a5,0x1f7),'vAIzc':_0x5cfb72(0x504,0x475,0x404,0x3b1)+_0x5cfb72(0x40a,0x448,0x409,0x3fc)+_0x5cfb72(0x435,0x37a,0x41d,0x31b)+'n-contact\x22'+'>OZON\x20Банк'+'\x20(Иван\x20Л.)'+_0x3e3298(0x365,0x330,0x2b2,0x3b3),'eUzue':_0x3e3298(0x2b7,0x2f5,0x310,0x335)+'=\x22copyrigh'+_0x3e3298(0x29e,0x1fa,0x29c,0x12e)+_0x5cfb72(0x3f7,0x408,0x47d,0x48f)+'>Использов'+_0x5cfb72(0x501,0x4c0,0x54e,0x575)+'ицированны'+_0x3e3298(0x349,0x31a,0x3b6,0x3c0)+_0x3e3298(0x201,0x2c5,0x28e,0x24b)+_0x3e3298(0x1f9,0x1f4,0x1a7,0x1c3)+_0x5cfb72(0x2ae,0x36b,0x37b,0x2dd)+_0x3e3298(0x1b5,0x230,0x299,0x1b0)+_0x3e3298(0x252,0x2db,0x230,0x207)+_0x3e3298(0x154,0x1de,0x1c0,0x21c)+'ских\x20прав!'+_0x5cfb72(0x493,0x4b0,0x4b5,0x476),'HSRop':function(_0x3962bb,_0xe39660){return _0x3962bb===_0xe39660;},'NouzP':_0x3e3298(0x1f6,0x259,0x2db,0x236),'SFSOX':'hover:ente'+'r','aGRbJ':_0x3e3298(0x24b,0x2ca,0x298,0x324)+'mod_new_bu'+'ttons_styl'+'e_mode','mDIXi':function(_0x515946,_0x2f837e){return _0x515946(_0x2f837e);},'ZqYqn':function(_0x1a735e,_0x20f4a5){return _0x1a735e+_0x20f4a5;},'ETBqX':'QYqyp','QBykn':_0x5cfb72(0x472,0x3c4,0x3b6,0x34d),'klPnm':_0x5cfb72(0x51d,0x44a,0x3ff,0x4cb)+_0x3e3298(0x233,0x278,0x273,0x266)+_0x3e3298(0x2b7,0x308,0x381,0x355)+'ype','jXypv':function(_0x964a64){return _0x964a64();},'IGoYe':function(_0x5973e7,_0x5c14a5){return _0x5973e7!==_0x5c14a5;},'kDbzn':_0x5cfb72(0x526,0x4a0,0x4a8,0x4b0),'RQxqc':_0x5cfb72(0x348,0x3d0,0x3cf,0x3ba),'xGFbS':'interface_'+'mod_new_in'+'fo_panel','fqZvu':function(_0x33c5bf){return _0x33c5bf();},'pwfll':function(_0x1ee83d){return _0x1ee83d();},'ItPfH':function(_0x9c1c64,_0x169add){return _0x9c1c64(_0x169add);},'eaiAw':'color','osSVA':_0x5cfb72(0x48c,0x44a,0x384,0x4b5)+_0x5cfb72(0x37c,0x3af,0x365,0x2fa)+_0x3e3298(0x2fb,0x275,0x28e,0x31a),'HKCez':function(_0x2ac4aa,_0x385904){return _0x2ac4aa(_0x385904);},'YAVeI':function(_0x2126cf){return _0x2126cf();},'Uyixo':'interface_'+'mod_new_co'+_0x5cfb72(0x567,0x496,0x55f,0x4ec)+'ngs','OeGJo':function(_0x2d0b37,_0x10777b){return _0x2d0b37(_0x10777b);},'WYkjS':_0x3e3298(0x3ac,0x34c,0x35c,0x395),'IizId':_0x3e3298(0x387,0x30b,0x2ad,0x27b),'IVbiU':_0x3e3298(0x15e,0x219,0x299,0x245),'Fwqky':_0x3e3298(0x1ab,0x263,0x19c,0x1b1),'oyEQb':'interface_'+_0x3e3298(0x2cc,0x27d,0x26d,0x251),'bxDzm':'select','EEaSC':_0x3e3298(0x322,0x2ca,0x32a,0x302)+_0x3e3298(0x25a,0x22f,0x258,0x1b1)+_0x5cfb72(0x483,0x3f5,0x45c,0x44c)+'_desc','sBsDZ':function(_0x3fdd9f,_0x3647e7){return _0x3fdd9f(_0x3647e7);},'LFNXD':_0x3e3298(0x2df,0x243,0x188,0x1d4)+_0x3e3298(0x1b5,0x242,0x1c4,0x23e)+_0x5cfb72(0x33b,0x3b4,0x469,0x2f9)+_0x3e3298(0x1bf,0x240,0x216,0x225)+_0x5cfb72(0x419,0x4a8,0x47d,0x41b)+_0x3e3298(0x29a,0x28b,0x263,0x31b)+_0x3e3298(0x17f,0x1bd,0x22d,0x169)+'ard__imdb-'+'rate,\x20.car'+_0x3e3298(0x14f,0x1d9,0x1a8,0x24e)+'sk-rate','LvNYL':_0x3e3298(0x23a,0x2ca,0x2e0,0x20a)+'mod_new_st'+_0x5cfb72(0x414,0x4a7,0x400,0x475)+'es','IkZSf':_0x3e3298(0x41c,0x349,0x385,0x3f0),'qQIeS':function(_0x268bf8){return _0x268bf8();},'pgFsX':'dnMgg','eiBau':'stylized-t'+'itles-css','DuHTk':_0x3e3298(0x370,0x2ca,0x23b,0x242)+_0x3e3298(0x3ac,0x32a,0x386,0x3bf)+_0x5cfb72(0x3f3,0x416,0x48b,0x4be)+'iled_info','UQKeJ':_0x5cfb72(0x3ce,0x34b,0x3c2,0x322)+_0x3e3298(0x1bf,0x23a,0x177,0x1f8),'mDQJr':_0x3e3298(0x2ed,0x291,0x309,0x28c)+'е\x20авторски'+_0x3e3298(0x322,0x342,0x282,0x3f1)+_0x3e3298(0x33f,0x295,0x343,0x219)+_0x3e3298(0x278,0x258,0x20c,0x2e8)+'распростра'+_0x5cfb72(0x2fd,0x348,0x3e2,0x28b)+_0x3e3298(0x2dc,0x2f6,0x2a7,0x35c)+_0x5cfb72(0x317,0x36e,0x3cf,0x40e)+_0x3e3298(0x26f,0x2ba,0x371,0x36c)+'иальный\x20ав'+'тор:\x20bywol'+_0x3e3298(0x350,0x2bb,0x208,0x36d)+_0x3e3298(0x32b,0x356,0x369,0x2f7)+'10ivan','tfVHf':function(_0x45019a,_0x4e6d01){return _0x45019a(_0x4e6d01);},'Hywnf':_0x3e3298(0x35e,0x2ca,0x24c,0x329)+_0x3e3298(0x1cb,0x1f9,0x29b,0x20b)+_0x5cfb72(0x33e,0x367,0x41d,0x327)+_0x3e3298(0x1ef,0x28e,0x21c,0x31e),'hAQDs':_0x3e3298(0x301,0x2f7,0x2e9,0x2b9),'lFjes':_0x3e3298(0x2d9,0x205,0x239,0x1e8)+_0x5cfb72(0x3ba,0x401,0x42f,0x3c1)+_0x3e3298(0x396,0x2e6,0x2e8,0x25f)+_0x3e3298(0x1d0,0x2a1,0x2a4,0x28b)+'\x20нарушение'+_0x3e3298(0x334,0x2e4,0x34e,0x334)+_0x3e3298(0x1bc,0x28c,0x222,0x34c),'fihSG':_0x5cfb72(0x380,0x44a,0x51c,0x41b)+_0x5cfb72(0x496,0x481,0x51b,0x551)+_0x5cfb72(0x4c9,0x4b9,0x54a,0x479),'vDWkd':_0x5cfb72(0x482,0x455,0x4a4,0x507)+_0x5cfb72(0x554,0x4e6,0x5a9,0x496)+',\x20поддержк'+_0x3e3298(0x162,0x1ef,0x138,0x1c8)+_0x3e3298(0x2a3,0x280,0x233,0x22f)+_0x3e3298(0x274,0x27c,0x1bf,0x233),'GztHq':_0x3e3298(0x165,0x210,0x19b,0x20f),'oJcKX':_0x5cfb72(0x4eb,0x44a,0x50b,0x3aa)+_0x5cfb72(0x443,0x3f8,0x4b6,0x33e)+_0x5cfb72(0x47a,0x488,0x47e,0x55a)+_0x3e3298(0x322,0x336,0x326,0x3f9),'xEuOl':_0x5cfb72(0x439,0x44a,0x37b,0x3f1)+_0x3e3298(0x23a,0x211,0x175,0x1a3)+_0x3e3298(0x2ec,0x274,0x32f,0x341)+_0x3e3298(0x130,0x1ed,0x231,0x254),'augvl':'interface_'+_0x5cfb72(0x2de,0x379,0x397,0x34b)+_0x5cfb72(0x53e,0x496,0x440,0x3d1)+_0x3e3298(0x33a,0x2e1,0x39b,0x30e),'gSIUW':_0x5cfb72(0x3ce,0x44a,0x4c8,0x446)+_0x3e3298(0x185,0x20c,0x1fc,0x1c6)+'ttons_styl'+_0x3e3298(0x32e,0x32d,0x2b3,0x370)+_0x3e3298(0x30e,0x33f,0x3ae,0x373),'xVnYI':_0x5cfb72(0x37a,0x44a,0x4ed,0x4e5)+'mod_new_bu'+_0x5cfb72(0x299,0x35b,0x312,0x35c)+_0x5cfb72(0x570,0x4c6,0x474,0x555),'jziDw':_0x3e3298(0x2da,0x264,0x30a,0x316)+'ь','PVPTS':_0x3e3298(0x244,0x2c3,0x2ea,0x2ae),'dbBRD':_0x5cfb72(0x49b,0x456,0x3f7,0x448)+'тиль\x20отобр'+_0x5cfb72(0x402,0x433,0x4e9,0x4ec)+_0x5cfb72(0x3b2,0x406,0x496,0x40b)+_0x5cfb72(0x3e6,0x3cc,0x305,0x36f),'nTbPp':_0x5cfb72(0x40d,0x383,0x31b,0x2c2)+_0x5cfb72(0x32f,0x3d5,0x3b3,0x3de),'JzBLh':_0x3e3298(0x309,0x2b4,0x1fd,0x33d),'dNVxm':_0x3e3298(0x216,0x2b4,0x245,0x26f)+'\x202','WADic':_0x5cfb72(0x3b9,0x44b,0x3a9,0x41a),'AkqyH':_0x3e3298(0x284,0x1c2,0x187,0x1fd),'frFPR':'Emerald\x20V1','gaNFp':_0x3e3298(0x25f,0x2cf,0x32d,0x2bf),'pIaVG':_0x3e3298(0x121,0x1ec,0x1b2,0x196)+'ne'};if(_0x4dd11e||!_0x5cf2dd){Lampa[_0x5cfb72(0x419,0x438,0x47b,0x397)]['show'](_0x1a91a1[_0x5cfb72(0x49f,0x49f,0x493,0x46b)]),_0x1a91a1['tfVHf']($,_0x5cfb72(0x3d2,0x49d,0x531,0x444)+_0x5cfb72(0x437,0x4be,0x450,0x4eb)+_0x3e3298(0x2f4,0x360,0x423,0x422)+_0x3e3298(0x290,0x1e5,0x2a2,0x231)+_0x3e3298(0x2be,0x28f,0x360,0x214)+'\x27]\x20.settin'+_0x5cfb72(0x3bd,0x3e2,0x3d2,0x3b4))[_0x3e3298(0x1ac,0x261,0x27a,0x1c7)](),Lampa[_0x3e3298(0x29a,0x1f5,0x137,0x1e2)+'i'][_0x3e3298(0x1f1,0x27f,0x33d,0x2ce)]({'component':_0x1a91a1['oyEQb'],'param':{'name':_0x1a91a1[_0x3e3298(0x25a,0x2c2,0x38b,0x365)],'type':_0x1a91a1[_0x5cfb72(0x30c,0x3ac,0x314,0x349)]},'field':{'name':_0x5cfb72(0x329,0x397,0x2cd,0x2f1)+_0x5cfb72(0x3b9,0x3ea,0x3de,0x36d),'description':_0x1a91a1['lFjes']},'onRender':function(_0x2601d5){function _0x3bb6f2(_0x337616,_0x4ad17c,_0x4e42c4,_0x259941){return _0x3e3298(_0x337616-0xc7,_0x4ad17c- -0x2fd,_0x4e42c4-0xd2,_0x259941);}function _0x321e7d(_0x3daec0,_0x20b13f,_0x3cd549,_0x5c2aef){return _0x5cfb72(_0x3daec0-0x13e,_0x3daec0- -0x1d,_0x5c2aef,_0x5c2aef-0xb3);}var _0xb2c435={'zRDrc':_0x1a91a1['acWQb'],'DxUyC':_0x1a91a1[_0x321e7d(0x462,0x4be,0x408,0x505)],'fsVLJ':_0x1a91a1[_0x3bb6f2(-0x19d,-0x12e,-0x12f,-0x1f6)],'VddjO':_0x321e7d(0x458,0x485,0x3d6,0x4ee)+_0x321e7d(0x42b,0x392,0x46d,0x47a)+'t-violatio'+'n-title\x22>⚠️'+_0x321e7d(0x384,0x2cc,0x3a8,0x2ca)+_0x3bb6f2(0xe0,0x1e,-0x43,-0x98)+_0x3bb6f2(-0xfc,-0x98,0x37,0x3)+_0x3bb6f2(0x74,0xa,0x3b,0x23),'rggiJ':_0x3bb6f2(-0x6e,0x3a,0x94,0xca),'jyums':_0x1a91a1[_0x3bb6f2(-0x14e,-0xe5,-0xc8,-0x146)],'bXtbb':function(_0x2719f9,_0x29635f){return _0x2719f9(_0x29635f);},'KrkVy':_0x1a91a1[_0x3bb6f2(-0x118,-0x10b,-0xae,-0xc6)],'vEIZq':_0x1a91a1['NHAux'],'pzxhF':_0x1a91a1['titbG'],'Mfoxd':_0x1a91a1[_0x3bb6f2(-0xbe,-0x127,-0x152,-0xac)],'yAbTW':_0x1a91a1['fqoTQ'],'wrVQT':_0x1a91a1[_0x321e7d(0x360,0x2d6,0x2b1,0x3b0)],'RiDmz':'<div\x20class'+_0x3bb6f2(0x1e,-0x35,0x6d,-0xdc)+_0x321e7d(0x35d,0x3c8,0x3ba,0x299)+'n-text\x22>Да'+_0x321e7d(0x3f8,0x3de,0x406,0x39a)+_0x3bb6f2(-0xbd,-0xa5,-0x158,-0xd4)+'<b>Интерфе'+_0x321e7d(0x48e,0x463,0x541,0x3bc)+_0x3bb6f2(-0x107,-0x94,-0x119,-0x14)+_0x3bb6f2(-0x20,-0x1e,-0xaf,-0x85)+_0x321e7d(0x36a,0x3ea,0x33d,0x2ea)+'ием\x20авторс'+_0x3bb6f2(-0x64,-0xeb,-0x190,-0x112)+_0x3bb6f2(0x2f,-0x1b,0xb5,0x8f),'ZaPpg':_0x1a91a1[_0x3bb6f2(0x52,-0x47,0x86,-0x49)]};_0x1a91a1[_0x321e7d(0x43d,0x405,0x438,0x413)](_0x321e7d(0x3bc,0x3d8,0x3c7,0x388),_0x1a91a1['NouzP'])?_0x2601d5['on'](_0x1a91a1[_0x3bb6f2(-0x170,-0x128,-0x1b0,-0xc2)],function(){function _0x4d1e04(_0x3a88ae,_0x138620,_0x3e24d2,_0x20c388){return _0x321e7d(_0x138620- -0x470,_0x138620-0x195,_0x3e24d2-0x1c5,_0x3e24d2);}var _0x586af4=_0xb2c435['DxUyC'][_0x4d1e04(-0xf8,-0x26,0x2c,-0xcf)]('|');function _0x507864(_0x142d89,_0x53bcce,_0x5176dc,_0x504883){return _0x3bb6f2(_0x142d89-0x14d,_0x142d89- -0x12a,_0x5176dc-0x1ea,_0x504883);}var _0x13e183=-0xef*0x5+-0x13*0x1e6+-0x1*-0x28bd;while(!![]){switch(_0x586af4[_0x13e183++]){case'0':_0x17b762[_0x507864(-0x248,-0x25a,-0x1cb,-0x214)](_0xb2c435[_0x4d1e04(0x47,-0x56,-0x72,-0xed)]);continue;case'1':_0x17b762[_0x507864(-0x248,-0x183,-0x2bf,-0x317)](_0xb2c435[_0x4d1e04(-0x83,-0x1c,-0x48,-0x70)]);continue;case'2':Lampa[_0x507864(-0x1cd,-0x122,-0x1cc,-0x1b8)][_0x4d1e04(0x14,-0x7a,-0x94,-0xda)]({'title':_0x507864(-0xfe,-0x8a,-0x1bc,-0x161)+_0x4d1e04(-0xda,-0x11f,-0x8d,-0x1d6)+'прав','html':_0x17b762,'size':_0xb2c435['rggiJ'],'onBack':function(){Lampa[_0x336059(-0xd9,-0xb1,-0x12,-0x10c)]['close']();function _0x336059(_0x1ccb14,_0x2b1252,_0x434c52,_0x5137fd){return _0x4d1e04(_0x1ccb14-0x1ed,_0x2b1252-0x2,_0x1ccb14,_0x5137fd-0x1cc);}function _0x254bc2(_0x237416,_0x4558ed,_0x41a0a8,_0x51cc5a){return _0x4d1e04(_0x237416-0x106,_0x4558ed-0x4d3,_0x237416,_0x51cc5a-0x12);}Lampa[_0x336059(-0x81,-0x125,-0x65,-0x1b3)][_0x336059(-0x1fb,-0x12e,-0xe8,-0x166)](_0xb2c435[_0x254bc2(0x556,0x49e,0x472,0x469)]);}});continue;case'3':_0x17b762[_0x4d1e04(-0x11d,-0x12e,-0xbc,-0xfb)](_0xb2c435['jyums']);continue;case'4':var _0x17b762=_0xb2c435['bXtbb']($,_0xb2c435[_0x507864(-0x1df,-0x141,-0x1cd,-0x1e4)]);continue;case'5':$(_0xb2c435['vEIZq'])['append'](_0xdda115);continue;case'6':_0x17b762['append'](_0xb2c435[_0x4d1e04(-0x58,-0x36,0x95,-0x6b)]);continue;case'7':_0x17b762[_0x4d1e04(-0xf8,-0x12e,-0x1ae,-0x13b)](_0xb2c435[_0x507864(-0x1f9,-0x14f,-0x242,-0x150)]);continue;case'8':var _0xdda115=$(_0xb2c435[_0x507864(-0x157,-0x1c7,-0x21d,-0xb7)])[_0x507864(-0x10f,-0x16e,-0x87,-0x192)]('\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x507864(-0xdf,-0x11f,-0x19a,-0x181)+_0x4d1e04(0x3e,0x3b,0xdd,-0x6)+_0x4d1e04(0x69,0x4f,0x56,0xdb)+_0x4d1e04(0x23,-0x86,-0x111,-0x98)+'ion\x20{\x20padd'+_0x4d1e04(-0xc3,-0xce,-0x177,-0x191)+_0x507864(-0x110,-0x183,-0x196,-0x11c)+_0x507864(-0x25a,-0x202,-0x31c,-0x259)+_0x4d1e04(0xd5,0x42,0xc3,-0x77)+_0x507864(-0x1f4,-0x21a,-0x278,-0x2bc)+'in:\x200\x20auto'+_0x4d1e04(-0x95,-0x109,-0x195,-0xf5)+_0x4d1e04(-0x52,0x3b,-0x25,-0x5a)+_0x507864(-0xdf,-0x98,-0x123,-0x19f)+'\x20\x20\x20\x20\x20\x20.cop'+'yright-vio'+_0x4d1e04(0xbd,0x3a,0x3e,0xd1)+'le\x20{\x20font-'+_0x507864(-0x201,-0x249,-0x18e,-0x1d9)+_0x4d1e04(-0x1c1,-0x14d,-0x111,-0x164)+'#ff0000;\x20m'+_0x4d1e04(-0x132,-0x63,-0x12e,-0xf3)+_0x507864(-0x21d,-0x201,-0x29d,-0x1a1)+_0x507864(-0xc3,-0x172,0xc,-0x184)+_0x507864(-0xeb,-0x57,-0x4c,-0x5d)+_0x507864(-0x255,-0x25d,-0x270,-0x2f7)+_0x4d1e04(-0x87,0x38,-0x6f,-0x36)+_0x4d1e04(0x51,-0x40,0x44,-0xf9)+_0x4d1e04(-0x84,-0xad,-0x150,-0x6d)+_0x4d1e04(-0x11f,-0x109,-0xd5,-0x1ae)+_0x507864(-0xdf,-0x146,-0x1b0,-0x192)+_0x507864(-0xdf,-0x27,-0x136,-0x1aa)+_0x507864(-0x190,-0xe8,-0xbd,-0x153)+_0x507864(-0x139,-0xdc,-0xaf,-0xfd)+_0x507864(-0x1b4,-0x23b,-0x25b,-0x198)+'t\x20{\x20font-s'+_0x4d1e04(-0x91,-0xbb,-0x6d,-0x16b)+';\x20margin-b'+_0x4d1e04(0x67,0x7,0xa0,-0x4d)+_0x507864(-0x1a9,-0x19a,-0x27c,-0xf4)+_0x4d1e04(-0x1b,-0x70,-0x129,-0x3c)+_0x4d1e04(-0x37,0x3,-0x32,0x97)+_0x507864(-0xdf,-0x117,-0x157,-0x13)+_0x507864(-0xdf,-0x190,-0x107,-0x120)+_0x4d1e04(-0x110,-0x10b,-0x9f,-0x177)+_0x4d1e04(0x23,-0x92,-0xf4,-0x119)+_0x4d1e04(-0xe9,-0x67,-0x99,-0x10f)+_0x507864(-0x133,-0x92,-0xf6,-0x138)+'size:\x201.8e'+_0x4d1e04(-0x16e,-0xfe,-0xd2,-0xcf)+'und:\x20rgba('+_0x507864(-0x106,-0x147,-0xb0,-0x13b)+_0x507864(-0x22b,-0x1bc,-0x2b8,-0x2fc)+_0x4d1e04(0x10,-0x8,0x7e,0x97)+_0x4d1e04(0x24,0x50,0x103,0xed)+'adius:\x200.5'+'em;\x20margin'+_0x4d1e04(-0x1d1,-0x13a,-0x172,-0x161)+_0x507864(-0x114,-0x137,-0x7f,-0xa7)+_0x507864(-0xdf,-0xef,-0x111,-0x6a)+_0x4d1e04(0x35,0x3b,0xc3,-0x6e)+_0x507864(-0x16b,-0xb9,-0x1c2,-0x1a8)+_0x4d1e04(-0x138,-0x102,-0x11e,-0x138)+_0x4d1e04(-0x184,-0xd8,-0x174,-0xce)+'ing\x20{\x20font'+'-size:\x202.2'+_0x4d1e04(-0x117,-0x54,-0x105,-0x54)+_0x507864(-0x207,-0x221,-0x139,-0x14d)+'font-weigh'+_0x4d1e04(-0x39,-0xc4,-0x77,-0x16e)+_0x507864(-0x195,-0x161,-0x12d,-0x1ac)+_0x507864(-0x12e,-0x64,-0x77,-0xd2)+'-shadow:\x200'+_0x507864(-0x129,-0x1e2,-0x18d,-0xd5)+_0x4d1e04(0xda,0x1f,0x6e,0x94)+_0x507864(-0x20c,-0x196,-0x2e1,-0x14a)+_0x4d1e04(-0x90,0x6,0x27,0xd4)+_0x507864(-0xdf,-0x14a,-0x9c,-0x5e)+_0x507864(-0xdf,-0x101,-0xc0,-0x5a)+'\x20');continue;case'9':_0x17b762[_0x507864(-0x248,-0x220,-0x288,-0x2c1)](_0xb2c435[_0x4d1e04(-0x188,-0xd0,-0xb3,-0xcc)]);continue;case'10':_0x17b762[_0x507864(-0x248,-0x2c3,-0x1f9,-0x1bf)](_0xb2c435[_0x4d1e04(-0x9b,-0x13,-0x43,0xc2)]);continue;case'11':_0x17b762[_0x4d1e04(-0xd9,-0x12e,-0x180,-0x1f7)](_0xb2c435['ZaPpg']);continue;}break;}}):(_0x90271a[_0x3bb6f2(-0xc4,-0xa3,-0x8,-0x3f)]['close'](),_0x4624f9['Controller'][_0x3bb6f2(-0x78,-0x120,-0x49,-0x1a5)](_0x1a91a1[_0x3bb6f2(-0x2,0x35,-0x21,0x90)]));}});return;}Lampa[_0x3e3298(0x21b,0x1f5,0x274,0x227)+'i']['addParam']({'component':_0x1a91a1[_0x3e3298(0x1f3,0x29a,0x363,0x23d)],'param':{'name':_0x1a91a1[_0x3e3298(0x251,0x2f3,0x29a,0x2ac)],'type':_0x1a91a1[_0x5cfb72(0x455,0x3ac,0x403,0x475)]},'field':{'name':Lampa[_0x3e3298(0x28f,0x1da,0x1ed,0x1a0)][_0x5cfb72(0x46d,0x431,0x3bd,0x3d1)](_0x1a91a1[_0x3e3298(0x22e,0x2f3,0x296,0x342)]),'description':aboutPluginData[_0x5cfb72(0x4b2,0x42c,0x3ea,0x408)+_0x3e3298(0x29e,0x2ce,0x22b,0x2f0)]||_0x1a91a1[_0x3e3298(0x17d,0x1e1,0x26a,0x23c)]},'onRender':function(_0x4cefed){var _0x1d98d9={'msEiE':function(_0x193719,_0x37903a){function _0x2c9045(_0x39506d,_0x1c6ae3,_0x2c78bd,_0x40a5c1){return _0x20bb(_0x39506d-0x1b5,_0x2c78bd);}return _0x1a91a1[_0x2c9045(0x30a,0x260,0x2bf,0x329)](_0x193719,_0x37903a);},'MrVFn':function(_0x163abb,_0x23ee48){function _0x27d565(_0x2f6822,_0x33d7ea,_0x1f1fd8,_0x35d78a){return _0x20bb(_0x33d7ea- -0x27e,_0x2f6822);}return _0x1a91a1[_0x27d565(-0x14b,-0xb2,0x17,-0x84)](_0x163abb,_0x23ee48);},'JwMmu':_0x26d872(0x3db,0x3cf,0x40e,0x3a7)+_0x26d872(0x2df,0x2d7,0x3a6,0x2dd),'UzrEM':_0x1a91a1[_0x26d872(0x209,0x358,0x255,0x296)],'yhHgj':function(_0xbc38ef){return _0xbc38ef();}};function _0x26d872(_0x105fba,_0x526d3c,_0x36afa5,_0x43d618){return _0x5cfb72(_0x105fba-0x18d,_0x43d618- -0x114,_0x36afa5,_0x43d618-0x125);}function _0x1cb014(_0x5dcb0e,_0x1cbf68,_0x114a1a,_0x370171){return _0x3e3298(_0x5dcb0e-0x158,_0x1cbf68- -0x201,_0x114a1a-0x1ef,_0x5dcb0e);}_0x1a91a1[_0x26d872(0x26e,0x33c,0x22a,0x2ba)]===_0x1a91a1[_0x26d872(0x36d,0x2bf,0x258,0x2ba)]?_0x4cefed['on']('hover:ente'+'r',function(){function _0x163e80(_0x1e180b,_0x558e7c,_0x43eb62,_0x1011d7){return _0x1cb014(_0x1011d7,_0x558e7c- -0xcc,_0x43eb62-0x152,_0x1011d7-0x197);}function _0xd27280(_0x2f859b,_0x54f24a,_0x547f18,_0x5b51c0){return _0x1cb014(_0x2f859b,_0x54f24a- -0x74,_0x547f18-0x158,_0x5b51c0-0xd6);}if('Zpzma'===_0x1d98d9[_0x163e80(-0x1a,0x85,0x33,0xa6)]){var _0x11dae2=PCuoye[_0xd27280(0x7f,-0x1e,0x59,-0x85)](_0x59b132,PCuoye[_0x163e80(0x12,-0x7c,-0x48,-0xf2)](PCuoye[_0x163e80(0x8,-0x10,-0x27,0x6)]+(_0xd27280(0x17a,0xae,-0xa,0x7)+_0x163e80(-0x12,-0xce,-0x176,-0xc2)+_0x163e80(-0x8e,-0xc,0x6a,0x89)+'\x20)'),');'));_0x38bd1d=_0x11dae2();}else _0x1d98d9[_0xd27280(0x5d,0xba,0x10b,0xd4)](showAboutPlugin);}):(_0x3d8eb9[_0x26d872(0x2a9,0x39d,0x284,0x2c7)+_0x1cb014(0x57,0xae,0x1c,0xa1)]=_0x400fee,_0x36f3de[_0x1cb014(0x14e,0xe7,0xf3,0x67)][_0x26d872(0x2ac,0x1ce,0x281,0x262)](_0x1a91a1[_0x26d872(0x244,0x280,0x20e,0x264)],_0x35ae0b),_0x1360df[_0x26d872(0x2f2,0x1fc,0x33a,0x2b9)][_0x26d872(0x333,0x3e4,0x465,0x3cb)]());}});var _0x17a28e={};_0x17a28e['name']=_0x3e3298(0x252,0x2ca,0x283,0x292)+_0x3e3298(0x1a2,0x278,0x2cf,0x1c2)+_0x3e3298(0x3de,0x308,0x399,0x331)+'ype',_0x17a28e[_0x3e3298(0x350,0x294,0x271,0x2cd)]=_0x1a91a1['GztHq'],_0x17a28e[_0x5cfb72(0x3fd,0x443,0x443,0x481)]=!![],Lampa[_0x3e3298(0x165,0x1f5,0x15a,0x1f5)+'i'][_0x3e3298(0x326,0x27f,0x26b,0x2f2)]({'component':_0x5cfb72(0x452,0x44a,0x456,0x4c8)+_0x3e3298(0x1f8,0x27d,0x201,0x2bf),'param':_0x17a28e,'field':{'name':Lampa[_0x3e3298(0x23c,0x1da,0x2a9,0x2b1)]['translate'](_0x5cfb72(0x4ea,0x44a,0x516,0x4fc)+_0x3e3298(0x253,0x278,0x30a,0x1d3)+'ow_movie_t'+_0x3e3298(0x3e5,0x324,0x317,0x38a)),'description':Lampa['Lang'][_0x3e3298(0x295,0x2b1,0x306,0x2a4)](_0x1a91a1[_0x5cfb72(0x2c8,0x351,0x3c6,0x3b2)])},'onChange':function(_0x2a2940){settings[_0x11e203(0x41a,0x3f8,0x3f0,0x473)+'_type']=_0x2a2940;function _0x11e203(_0x406b39,_0x380176,_0x14b521,_0x3bd188){return _0x5cfb72(_0x406b39-0x1d4,_0x380176- -0x20,_0x3bd188,_0x3bd188-0x146);}function _0x1cbfc9(_0x2cade0,_0x5c1f1b,_0x49d49a,_0x5382c6){return _0x5cfb72(_0x2cade0-0x14c,_0x2cade0- -0x233,_0x5c1f1b,_0x5382c6-0x166);}Lampa[_0x1cbfc9(0x235,0x1bc,0x2d6,0x24e)][_0x11e203(0x409,0x356,0x3fe,0x3b0)](_0x1a91a1[_0x1cbfc9(0x214,0x1b1,0x1ab,0x1e9)],_0x2a2940),Lampa[_0x11e203(0x2f7,0x3ad,0x2de,0x41f)][_0x11e203(0x57d,0x4bf,0x528,0x444)](),_0x1a91a1['jXypv'](changeMovieTypeLabels);}}),Lampa[_0x3e3298(0x2a2,0x1f5,0x26e,0x1a7)+'i'][_0x3e3298(0x31a,0x27f,0x333,0x27a)]({'component':_0x1a91a1[_0x5cfb72(0x3dc,0x41a,0x368,0x463)],'param':{'name':_0x5cfb72(0x3f0,0x44a,0x383,0x4e2)+_0x3e3298(0x199,0x211,0x2e6,0x151)+_0x3e3298(0x21a,0x270,0x1e9,0x33a),'type':_0x1a91a1[_0x3e3298(0x258,0x2a7,0x2e3,0x353)],'default':!![]},'field':{'name':Lampa[_0x5cfb72(0x332,0x35a,0x3a7,0x406)][_0x3e3298(0x208,0x2b1,0x223,0x258)](_0x1a91a1[_0x3e3298(0x260,0x1d8,0x1fa,0x1cc)]),'description':Lampa[_0x5cfb72(0x3b3,0x35a,0x3e3,0x38a)][_0x5cfb72(0x372,0x431,0x451,0x4af)](_0x1a91a1[_0x5cfb72(0x3ea,0x46a,0x4f2,0x4c0)])},'onChange':function(_0x4b5bdd){function _0x4ec751(_0x50984e,_0x4283bd,_0x29c029,_0x160b03){return _0x5cfb72(_0x50984e-0x19f,_0x160b03-0x12b,_0x50984e,_0x160b03-0x13d);}function _0x3e45b9(_0x419698,_0xece347,_0x19ff8a,_0x22bc15){return _0x5cfb72(_0x419698-0x179,_0x22bc15- -0x45,_0x19ff8a,_0x22bc15-0x1de);}if(_0x1a91a1[_0x3e45b9(0x474,0x384,0x3e9,0x3da)](_0x1a91a1[_0x3e45b9(0x338,0x310,0x3df,0x373)],_0x1a91a1['RQxqc']))settings[_0x4ec751(0x578,0x655,0x5a4,0x598)]=_0x4b5bdd,Lampa[_0x3e45b9(0x4e5,0x4d4,0x38c,0x423)][_0x3e45b9(0x331,0x25a,0x2ad,0x331)](_0x1a91a1['xGFbS'],_0x4b5bdd),Lampa[_0x3e45b9(0x36c,0x2d6,0x407,0x388)][_0x4ec751(0x685,0x56a,0x6a2,0x60a)](),_0x1a91a1[_0x4ec751(0x55a,0x4c8,0x4e2,0x4ca)](newInfoPanel);else{var _0x565e8d=_0x4bc7d1?function(){if(_0x444243){var _0x5797af=_0x1282b0['apply'](_0x86f23a,arguments);return _0x160dc7=null,_0x5797af;}}:function(){};return _0x2f74f7=![],_0x565e8d;}}}),Lampa[_0x3e3298(0x1a2,0x1f5,0x20b,0x17c)+'i'][_0x3e3298(0x31d,0x27f,0x1d2,0x2c4)]({'component':_0x1a91a1['oyEQb'],'param':{'name':_0x1a91a1[_0x5cfb72(0x4c9,0x47c,0x538,0x4b1)],'type':_0x1a91a1[_0x5cfb72(0x45f,0x427,0x412,0x4d1)],'default':!![]},'field':{'name':Lampa['Lang'][_0x3e3298(0x378,0x2b1,0x265,0x2d5)](_0x1a91a1[_0x5cfb72(0x470,0x47c,0x44a,0x3c3)]),'description':Lampa[_0x5cfb72(0x3aa,0x35a,0x399,0x3dd)][_0x5cfb72(0x43a,0x431,0x3b5,0x508)](_0x1a91a1[_0x3e3298(0x3c5,0x355,0x2ec,0x415)])},'onChange':function(_0x379c92){settings[_0xc1d568(-0x109,-0x172,-0x228,-0x10e)+_0x3313cf(0x212,0x162,0x163,0x1b6)]=_0x379c92,Lampa[_0x3313cf(0x314,0x2d9,0x26f,0x295)]['set']('interface_'+_0xc1d568(-0x14b,-0x1e1,-0x10e,-0x1e0)+_0xc1d568(-0x117,-0xc4,-0x143,-0x4f)+_0x3313cf(0x13e,0xfb,0x187,0x16e),_0x379c92);function _0x3313cf(_0x2944a1,_0x41daf8,_0xd44a16,_0x244e98){return _0x5cfb72(_0x2944a1-0x15c,_0xd44a16- -0x1f9,_0x2944a1,_0x244e98-0xf4);}function _0xc1d568(_0x21a6a2,_0x5cead4,_0x2bcc51,_0x4c9003){return _0x3e3298(_0x21a6a2-0x48,_0x5cead4- -0x3da,_0x2bcc51-0x2c,_0x4c9003);}Lampa[_0xc1d568(-0x147,-0x18d,-0x1be,-0x1d6)][_0xc1d568(-0xce,-0x7b,0x3f,-0xee)](),_0x379c92?(updateVoteColors(),_0x1a91a1[_0xc1d568(-0x53,-0xe2,-0x148,-0x78)](setupVoteColorsObserver),setupVoteColorsForDetailPage()):_0x1a91a1[_0xc1d568(-0x1e8,-0x1f1,-0x299,-0x25b)]($,_0xc1d568(-0xca,-0x197,-0x149,-0x245)+_0xc1d568(-0x215,-0x198,-0x25f,-0x128)+_0xc1d568(-0x186,-0x1a6,-0xf9,-0x149)+_0xc1d568(-0x15f,-0x19a,-0x19d,-0x121)+'art-new__r'+_0xc1d568(-0x1d4,-0x14f,-0x10e,-0x8c)+_0x3313cf(0xbb,0x158,0x144,0x1db)+'ard__imdb-'+_0x3313cf(0x202,0x30b,0x270,0x2cd)+'d__kinopoi'+_0x3313cf(0x2d4,0x2c7,0x237,0x1c7))['css'](_0x1a91a1[_0xc1d568(-0x68,-0xc9,-0x37,-0xde)],'');}}),Lampa[_0x5cfb72(0x2a4,0x375,0x34f,0x36f)+'i']['addParam']({'component':'interface_'+_0x5cfb72(0x4c1,0x3fd,0x4a2,0x396),'param':{'name':_0x1a91a1[_0x3e3298(0x1fb,0x1f8,0x23e,0x270)],'type':_0x1a91a1[_0x5cfb72(0x464,0x40d,0x4a9,0x393)],'values':{'default':Lampa[_0x3e3298(0x198,0x1da,0x211,0x118)][_0x5cfb72(0x45d,0x431,0x4a8,0x45d)](_0x1a91a1[_0x3e3298(0x3bf,0x353,0x349,0x370)]),'all':Lampa[_0x3e3298(0x18d,0x1da,0x234,0x10b)][_0x3e3298(0x22a,0x2b1,0x292,0x264)](_0x1a91a1[_0x3e3298(0x347,0x35a,0x3bf,0x2f8)]),'main2':_0x1a91a1['jziDw']},'default':_0x1a91a1['PVPTS']},'field':{'name':Lampa['Lang'][_0x5cfb72(0x41d,0x431,0x47c,0x360)](_0x1a91a1[_0x5cfb72(0x384,0x378,0x31b,0x2d7)]),'description':_0x1a91a1[_0x3e3298(0x2f8,0x2f2,0x22c,0x26e)]},'onChange':function(_0x1c7592){function _0xc41c6a(_0x22e7a4,_0x4f36e6,_0x23b595,_0x31ac93){return _0x3e3298(_0x22e7a4-0xc5,_0x22e7a4-0x14,_0x23b595-0x10c,_0x4f36e6);}function _0x112927(_0x626b56,_0x4f0dfa,_0x201f2,_0x390b56){return _0x3e3298(_0x626b56-0x3a,_0x626b56- -0x3a7,_0x201f2-0x7a,_0x4f0dfa);}if(_0x112927(-0x131,-0x67,-0x90,-0xf2)==='KUItQ')settings['buttons_st'+_0x112927(-0xf8,-0x14d,-0xb4,-0x9d)]=_0x1c7592,Lampa['Storage'][_0x112927(-0x1b1,-0x287,-0x14a,-0x15f)]('interface_'+'mod_new_bu'+_0xc41c6a(0x1ef,0x236,0x1e5,0x20c)+_0xc41c6a(0x322,0x3ae,0x3f4,0x2f9),_0x1c7592),Lampa['Settings'][_0xc41c6a(0x373,0x29e,0x2ae,0x375)]();else{var _0x3fe489=_0x4f1c0f[_0xc41c6a(0x36b,0x356,0x41f,0x426)+_0x112927(-0xe1,-0x179,-0x12,-0xd5)](_0x112927(-0x166,-0x158,-0x21c,-0x154)+'itles-css');if(_0x3fe489)_0x3fe489[_0xc41c6a(0x275,0x310,0x2ac,0x340)]();}}});var _0x4ff38c={};_0x4ff38c[_0x5cfb72(0x3a4,0x443,0x410,0x49c)]=_0x3e3298(0x260,0x2cc,0x2b3,0x376)+'ию',_0x4ff38c[_0x3e3298(0x2a1,0x34b,0x3cf,0x378)]=_0x1a91a1[_0x5cfb72(0x4e8,0x492,0x3f5,0x4a5)],_0x4ff38c[_0x3e3298(0x207,0x228,0x264,0x2fd)]=_0x1a91a1['JzBLh'],_0x4ff38c[_0x5cfb72(0x4aa,0x3f9,0x38e,0x4be)]=_0x1a91a1[_0x5cfb72(0x33f,0x403,0x3c0,0x3c5)],_0x4ff38c[_0x3e3298(0x325,0x331,0x37e,0x3fa)]=_0x1a91a1[_0x5cfb72(0x3d2,0x39a,0x3fb,0x450)],_0x4ff38c[_0x5cfb72(0x498,0x46b,0x39b,0x465)]=_0x1a91a1['AkqyH'],_0x4ff38c[_0x5cfb72(0x334,0x3a2,0x463,0x431)]=_0x1a91a1[_0x5cfb72(0x31b,0x33b,0x2bb,0x371)],_0x4ff38c[_0x3e3298(0x328,0x27a,0x2fd,0x236)+'ld']=_0x1a91a1[_0x3e3298(0x191,0x1e4,0x19e,0x23d)],_0x4ff38c[_0x3e3298(0x29a,0x26d,0x30c,0x314)]='Aurora';function _0x5cfb72(_0x40488a,_0x44c0be,_0x44f503,_0x182206){return _0x20bb(_0x44c0be-0x266,_0x44f503);}_0x4ff38c[_0x3e3298(0x405,0x34d,0x345,0x2bf)+'ne']=_0x1a91a1[_0x3e3298(0x2b6,0x29b,0x278,0x35b)];var _0x4816f8=_0x4ff38c;loadExternalThemes(function(_0x3f5d5f,_0x5b646b){var _0x14f796={'IAMje':function(_0x1762de){return _0x1a91a1['YAVeI'](_0x1762de);},'XfEdW':function(_0x2eec72){return _0x2eec72();},'ozrbM':_0x1a91a1[_0x1d1757(0x187,0x22e,0x1fa,0x119)],'jMxJO':function(_0x1ac673,_0x99aa6){function _0x51e543(_0x462dc1,_0x506b2a,_0x3bd4a0,_0x490acf){return _0x1d1757(_0x3bd4a0- -0x40,_0x506b2a,_0x3bd4a0-0xf5,_0x490acf-0x18c);}return _0x1a91a1[_0x51e543(-0x28,0xd0,0xa8,0x122)](_0x1ac673,_0x99aa6);},'mSaMR':_0x1a91a1[_0x3ff118(0x44d,0x4fb,0x595,0x4fd)],'lXsnw':function(_0x16f737,_0x115a7b){function _0x18ce25(_0x2ae5d0,_0x15ac6c,_0x2ec2e8,_0x1e3b0a){return _0x1d1757(_0x15ac6c- -0x8,_0x1e3b0a,_0x2ec2e8-0x47,_0x1e3b0a-0x42);}return _0x1a91a1[_0x18ce25(0xc3,0x15d,0xe3,0x1aa)](_0x16f737,_0x115a7b);},'VdHip':_0x1a91a1[_0x1d1757(0xb0,0x168,0x165,0x14d)],'AvVXN':'0|4|1|2|5|'+'3','UMVQr':_0x1a91a1[_0x3ff118(0x422,0x42c,0x36b,0x3f2)],'DxGVg':function(_0xa576ba,_0x32bb7e){function _0x200b69(_0x2121db,_0xc0ace4,_0x8f5cbf,_0x5a4dc8){return _0x1d1757(_0x2121db- -0xae,_0x5a4dc8,_0x8f5cbf-0xe0,_0x5a4dc8-0x130);}return _0x1a91a1[_0x200b69(0x8f,0x5a,-0x2c,0x76)](_0xa576ba,_0x32bb7e);},'AydYH':_0x1a91a1[_0x1d1757(0xf7,0x1ca,0x101,0x1c1)]};function _0x1d1757(_0x4222b1,_0x26bc9a,_0x58ac85,_0x23c471){return _0x3e3298(_0x4222b1-0x36,_0x4222b1- -0x175,_0x58ac85-0x8,_0x26bc9a);}function _0x3ff118(_0x5edab5,_0x32a7da,_0x15c9f7,_0x4571d4){return _0x5cfb72(_0x5edab5-0x1ed,_0x4571d4-0x6c,_0x15c9f7,_0x4571d4-0x11d);}if(_0x1a91a1['IGoYe'](_0x1d1757(0xee,0xb6,0x176,0x38),_0x1a91a1[_0x3ff118(0x473,0x46b,0x46d,0x521)]))_0x14f796[_0x3ff118(0x387,0x4a6,0x470,0x433)](_0x182efd),_0x14f796[_0x3ff118(0x380,0x402,0x4f3,0x433)](_0x114f43),_0x14f796['XfEdW'](_0x3c6904);else{var _0x319077=Object['assign']({},_0x4816f8);!_0x3f5d5f&&_0x5b646b&&(_0x5b646b['themes']&&Array['isArray'](_0x5b646b['themes'])&&_0x5b646b['themes'][_0x3ff118(0x57e,0x591,0x43b,0x4ec)](function(_0x3551b3){var _0x27647c={'jRLgI':_0x14f796[_0x53fa9e(0x2c,0x69,0x43,0x9a)],'OXZGH':function(_0x46250a){function _0x250f4d(_0x31fb38,_0x213281,_0x371cbf,_0x16c1c9){return _0x53fa9e(_0x31fb38-0x193,_0x213281-0x125,_0x371cbf,_0x16c1c9-0x17);}return _0x14f796[_0x250f4d(0x1d4,0x17b,0x132,0x1a9)](_0x46250a);},'GpESy':function(_0x1c88eb,_0x5ca768){function _0x2630d0(_0xc7af10,_0x16bfea,_0x30585b,_0xc32f2d){return _0x53fa9e(_0xc7af10-0xe4,_0xc7af10-0x338,_0x16bfea,_0xc32f2d-0x175);}return _0x14f796[_0x2630d0(0x385,0x3c8,0x388,0x401)](_0x1c88eb,_0x5ca768);},'Eccnv':_0x14f796[_0x30d6b9(0x1de,0x21b,0x10e,0x14e)]};function _0x53fa9e(_0x3514f1,_0x573c42,_0x58605b,_0x5d4584){return _0x3ff118(_0x3514f1-0x157,_0x573c42-0x57,_0x58605b,_0x573c42- -0x3ac);}function _0x30d6b9(_0x2b9eec,_0x51b5cc,_0x4f43b0,_0x8be8d6){return _0x1d1757(_0x8be8d6-0x5c,_0x2b9eec,_0x4f43b0-0x1a2,_0x8be8d6-0x116);}if(_0x14f796[_0x53fa9e(0x105,0x130,0x84,0x134)](_0x14f796[_0x53fa9e(0x174,0xe8,0x1c,0xda)],_0x14f796[_0x30d6b9(0x179,0x200,0x135,0x18f)])){if(_0x3551b3&&_0x3551b3['id']&&_0x3551b3[_0x53fa9e(0x18a,0x112,0x16d,0x187)]){_0x319077[_0x3551b3['id']]=_0x3551b3['name'];if(_0x3551b3[_0x53fa9e(0xe8,0xe2,0x49,0xfa)]){var _0x2ec759=_0x14f796[_0x30d6b9(0x1ab,0x18f,0x25b,0x1f6)][_0x30d6b9(0x1ef,0x150,0x171,0x1ce)]('|'),_0x35d87f=0xc7*-0x1f+0x12c9+-0x11*-0x50;while(!![]){switch(_0x2ec759[_0x35d87f++]){case'0':var _0x214283=document[_0x30d6b9(0x151,0x11f,0x17b,0x1e9)+'ent'](_0x14f796[_0x30d6b9(0x19d,0xb3,0xdf,0x152)]);continue;case'1':_0x214283['id']=_0x14f796[_0x30d6b9(0x122,0x68,0xca,0xad)](_0x30d6b9(0x177,0xf8,0x30,0xb1)+'e-',_0x3551b3['id']);continue;case'2':_0x214283[_0x53fa9e(-0x68,0x5c,0xfb,0x3)]=_0x3551b3[_0x53fa9e(0x1b0,0xe2,0x115,0x98)];continue;case'3':_0x214283[_0x53fa9e(0xfc,0x33,0x42,-0x98)]=!![];continue;case'4':_0x214283[_0x30d6b9(0xbe,0x150,0xad,0x17b)]=_0x14f796[_0x30d6b9(0x12c,0x1a0,0x101,0xfc)];continue;case'5':document[_0x30d6b9(0x1be,0x21b,0x1bf,0x192)]['appendChil'+'d'](_0x214283);continue;}break;}}}}else _0x4ee52e[_0x30d6b9(0x133,0xac,0x199,0x14f)+_0x53fa9e(-0x82,0x1c,0x9f,-0x8d)]=_0x4f3ed2,_0x51d14c[_0x53fa9e(0x1a9,0x128,0x18e,0x10c)]['set'](_0x27647c[_0x30d6b9(0x261,0x22f,0x18b,0x21a)],_0x52ae0f),_0x3ea63f[_0x30d6b9(0x1b6,0xc8,0x1ed,0x134)][_0x30d6b9(0x258,0x1e4,0x1e5,0x246)](),_0x1cfcff?(_0x4702c0(),_0x23cf19(),_0x27647c[_0x53fa9e(0x83,0x11e,0x19a,0x1ed)](_0x3a5a6d)):_0x27647c[_0x53fa9e(0x1c3,0x109,0x1c5,0x5f)](_0x27299b,_0x30d6b9(0x1d7,0x99,0x16b,0x12a)+_0x30d6b9(0x1da,0x137,0x18f,0x129)+'tart__rate'+_0x30d6b9(0x1d4,0xb9,0x86,0x127)+_0x30d6b9(0x184,0x1d5,0x23c,0x20f)+'ate,\x20.info'+_0x53fa9e(-0x10,-0x3,-0x83,-0x89)+_0x53fa9e(0xd6,0x1,-0x1d,0xc)+_0x53fa9e(0x198,0x129,0x1eb,0x1e5)+_0x53fa9e(0xe0,0x19,0x9f,-0x47)+_0x53fa9e(0x11f,0xf0,0x179,0x87))[_0x53fa9e(0x80,0xe2,0x1d,0x5c)](_0x27647c[_0x30d6b9(0x7b,0x1c9,0x166,0x112)],'');})),Lampa[_0x1d1757(0x80,0xab,0x25,0x21)+'i'][_0x1d1757(0x10a,0x11b,0xa7,0x11e)]({'component':_0x1a91a1[_0x3ff118(0x541,0x51f,0x3c9,0x486)],'param':{'name':_0x1a91a1[_0x1d1757(0x14a,0x177,0x160,0x14a)],'type':_0x1a91a1['bxDzm'],'values':_0x319077,'default':_0x3ff118(0x45c,0x47a,0x409,0x4af)},'field':{'name':Lampa[_0x3ff118(0x49c,0x3b0,0x3fb,0x3c6)]['translate'](_0x1a91a1[_0x1d1757(0x14a,0x79,0x1e7,0x86)]),'description':Lampa['Lang'][_0x1d1757(0x13c,0x1e1,0xc5,0x7e)](_0x1a91a1[_0x1d1757(0x114,0x1c8,0x1b4,0x113)])},'onChange':function(_0x571d7b){settings[_0x11cdb8(0xdd,0x178,0x175,0x23a)]=_0x571d7b;function _0x11cdb8(_0x429d20,_0x65df4a,_0x5df94b,_0x14aa76){return _0x3ff118(_0x429d20-0x122,_0x65df4a-0x1b1,_0x65df4a,_0x5df94b- -0x2ad);}Lampa[_0x1480a0(0x540,0x5b4,0x545,0x5e1)][_0x1480a0(0x3ff,0x4c2,0x56b,0x4d4)](_0x1a91a1[_0x1480a0(0x59a,0x58b,0x5f6,0x4f0)],_0x571d7b);function _0x1480a0(_0x5df712,_0x393384,_0x58c2f7,_0x2ffba4){return _0x3ff118(_0x5df712-0xe7,_0x393384-0x124,_0x2ffba4,_0x393384-0xe0);}Lampa['Settings'][_0x11cdb8(0x2b0,0x27c,0x29e,0x204)](),_0x1a91a1[_0x1480a0(0x5d6,0x61d,0x594,0x634)](applyTheme,_0x571d7b);}});}}),Lampa['SettingsAp'+'i'][_0x3e3298(0x33e,0x27f,0x2ba,0x32a)]({'component':_0x1a91a1[_0x3e3298(0x302,0x29a,0x35b,0x306)],'param':{'name':_0x1a91a1[_0x5cfb72(0x3d8,0x435,0x49a,0x407)],'type':_0x3e3298(0x168,0x210,0x281,0x2b3),'default':![]},'field':{'name':Lampa[_0x5cfb72(0x33e,0x35a,0x3e3,0x354)][_0x3e3298(0x25d,0x2b1,0x296,0x2d5)](_0x1a91a1[_0x5cfb72(0x4db,0x435,0x424,0x422)]),'description':Lampa[_0x3e3298(0x27c,0x1da,0x258,0x2ae)][_0x5cfb72(0x3b0,0x431,0x3fd,0x41e)](_0x5cfb72(0x51b,0x44a,0x435,0x51c)+'mod_new_st'+_0x5cfb72(0x56e,0x4a7,0x419,0x45e)+_0x3e3298(0x239,0x23c,0x2fe,0x28a))},'onChange':function(_0x3ff521){function _0x4f06a0(_0x205e03,_0x10cd42,_0x481b82,_0x56bd9){return _0x5cfb72(_0x205e03-0x15c,_0x10cd42- -0x507,_0x481b82,_0x56bd9-0x76);}settings['stylize_ti'+'tles']=_0x3ff521,Lampa[_0xa4cf9(0x56d,0x617,0x4d4,0x595)][_0xa4cf9(0x484,0x56a,0x540,0x4a3)](_0x1a91a1[_0xa4cf9(0x57e,0x501,0x55d,0x562)],_0x3ff521),Lampa['Settings'][_0x4f06a0(0x8d,-0x28,-0xc8,0x80)]();function _0xa4cf9(_0x441190,_0x4411f6,_0x198888,_0x2e760f){return _0x5cfb72(_0x441190-0x112,_0x2e760f-0x12d,_0x4411f6,_0x2e760f-0x1f1);}if(_0x3ff521){if(_0x1a91a1[_0x4f06a0(-0x88,-0xad,0x3,0x5)](_0x4f06a0(-0x16d,-0xe3,-0x123,-0x1b7),_0x1a91a1[_0xa4cf9(0x414,0x4b9,0x531,0x48f)])){var _0x2c6073=_0x45de37['apply'](_0x3bdd40,arguments);return _0x165a75=null,_0x2c6073;}else _0x1a91a1[_0xa4cf9(0x3aa,0x4dc,0x430,0x481)](stylizeCollectionTitles);}else{if(_0x1a91a1[_0xa4cf9(0x515,0x52a,0x55f,0x587)](_0x1a91a1['pgFsX'],_0x4f06a0(-0xe5,-0x15a,-0x9c,-0x21a)))_0x1a91a1[_0xa4cf9(0x486,0x5a5,0x47c,0x4de)](_0x2d51ba,_0x1a91a1['LFNXD'])['css'](_0xa4cf9(0x6c2,0x67b,0x553,0x5f7),'');else{var _0x8cc55f=document[_0x4f06a0(-0x2a,-0x30,-0xae,0x3)+_0xa4cf9(0x4d3,0x5e6,0x4cf,0x573)](_0x1a91a1[_0xa4cf9(0x540,0x57a,0x3f2,0x4a4)]);if(_0x8cc55f)_0x8cc55f[_0x4f06a0(-0x119,-0x126,-0x91,-0xcf)]();}}}});function _0x3e3298(_0x45b8be,_0x2e8447,_0x354660,_0x372a15){return _0x20bb(_0x2e8447-0xe6,_0x372a15);}var _0x22d7a7={};_0x22d7a7['name']=_0x1a91a1[_0x3e3298(0x406,0x359,0x3dc,0x2f3)],_0x22d7a7[_0x5cfb72(0x46b,0x414,0x3a2,0x48a)]=_0x1a91a1[_0x5cfb72(0x4fa,0x427,0x44f,0x447)],_0x22d7a7[_0x3e3298(0x312,0x2c3,0x394,0x2f3)]=![],Lampa[_0x5cfb72(0x437,0x375,0x2a8,0x3c4)+'i'][_0x5cfb72(0x49c,0x3ff,0x42f,0x4c6)]({'component':_0x5cfb72(0x519,0x44a,0x3e1,0x441)+_0x3e3298(0x2ff,0x27d,0x33f,0x30a),'param':_0x22d7a7,'field':{'name':Lampa[_0x3e3298(0x122,0x1da,0x232,0x105)][_0x3e3298(0x307,0x2b1,0x1e0,0x1eb)](_0x1a91a1[_0x5cfb72(0x473,0x4d9,0x438,0x4e9)]),'description':Lampa[_0x5cfb72(0x2cf,0x35a,0x3ba,0x3f2)][_0x5cfb72(0x3f2,0x431,0x3b9,0x41a)](_0x5cfb72(0x481,0x44a,0x3ea,0x384)+_0x3e3298(0x361,0x32a,0x3a8,0x356)+_0x3e3298(0x2a5,0x296,0x266,0x2db)+_0x5cfb72(0x4eb,0x41c,0x47d,0x4b8)+'desc')},'onChange':function(_0x27dd21){function _0x4ebd77(_0x2f18a7,_0x368d6f,_0x57bacc,_0xa391f9){return _0x5cfb72(_0x2f18a7-0xc0,_0x2f18a7- -0x2f3,_0xa391f9,_0xa391f9-0xc5);}settings[_0x4ebd77(0x1a2,0x181,0x22a,0xd9)+_0x27062f(0x1e8,0xe8,0x150,0x95)+'o']=_0x27dd21;function _0x27062f(_0x528484,_0x52993f,_0x2ba62d,_0x44daae){return _0x3e3298(_0x528484-0x131,_0x2ba62d- -0x127,_0x2ba62d-0x174,_0x528484);}Lampa[_0x4ebd77(0x175,0xf2,0x1ba,0x19a)]['set'](_0x1a91a1[_0x27062f(0x280,0x242,0x232,0x2c4)],_0x27dd21),Lampa[_0x4ebd77(0xda,0x7b,0x3e,0x68)][_0x27062f(0x170,0x264,0x238,0x18f)]();if(_0x27dd21)enhanceDetailedInfo();else{var _0x44b0f7=document[_0x27062f(0x1d0,0x201,0x230,0x2e5)+_0x27062f(0x173,0x1e3,0x19f,0x1ab)](_0x1a91a1[_0x27062f(0xf5,0x42,0xed,0x1b9)]);if(_0x44b0f7)_0x44b0f7['remove']();}}});});
    }

    // Функция склонения слов
    function plural(number, one, two, five) {
        var n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    // Вспомогательные функции для инфо-панели
    function calculateAverageEpisodeDuration(movie) {
        if (!movie || typeof movie !== 'object') return 0;
        var totalDuration = 0, episodeCount = 0;
        // Фильтруем неадекватные значения (больше 200 минут)
        if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
            var filtered = movie.episode_run_time.filter(function(duration) {
                return duration > 0 && duration <= 200;
            });
            if (filtered.length > 0) {
                filtered.forEach(function(duration) {
                    totalDuration += duration;
                    episodeCount++;
                });
            }
        } else if (movie.seasons && Array.isArray(movie.seasons)) {
            movie.seasons.forEach(function(season) {
                if (season.episodes && Array.isArray(season.episodes)) {
                    season.episodes.forEach(function(episode) {
                        if (episode.runtime && episode.runtime > 0 && episode.runtime <= 200) {
                            totalDuration += episode.runtime;
                            episodeCount++;
                        }
                    });
                }
            });
        }
        if (episodeCount > 0) return Math.round(totalDuration / episodeCount);
        // Если не нашли адекватных значений — пробуем last_episode_to_air.runtime
        if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
            return movie.last_episode_to_air.runtime;
        }
        // Если всё равно ничего — возвращаем 0
        return 0;
    }
    function formatDurationMinutes(minutes) {
        if (!minutes || minutes <= 0) return '';
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        var result = '';
        if (hours > 0) {
            result += hours + ' ' + plural(hours, 'час', 'часа', 'часов');
            if (mins > 0) result += ' ' + mins + ' ' + plural(mins, 'минута', 'минуты', 'минут');
        } else {
            result += mins + ' ' + plural(mins, 'минута', 'минуты', 'минут');
        }
        return result;
    }

    // Основная функция новой инфо-панели
    function newInfoPanel() {
        if (!settings.info_panel) return;
        var colors = {
            seasons: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            episodes: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
            duration: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            next: { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
            genres: {
                'Боевик': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'Приключения': { bg: 'rgba(39, 174, 96, 0.8)', text: 'white' },
                'Мультфильм': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'Комедия': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
                'Криминал': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Документальный': { bg: 'rgba(22, 160, 133, 0.8)', text: 'white' },
                'Драма': { bg: 'rgba(142, 68, 173, 0.8)', text: 'white' },
                'Семейный': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'Фэнтези': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'История': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
                'Ужасы': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Музыка': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'Детектив': { bg: 'rgba(52, 73, 94, 0.8)', text: 'white' },
                'Мелодрама': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
                'Фантастика': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
                'Триллер': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
                'Военный': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' },
                'Вестерн': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
                'Боевик и Приключения': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'Детский': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'Новости': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'Реалити-шоу': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
                'НФ и Фэнтези': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
                'Мыльная опера': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
                'Ток-шоу': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
                'Война и Политика': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' }
            }
        };
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.info_panel) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    var movie = data.data.movie;
                    var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');
                    var originalDetails = details.html();
                    details.empty();
                    var newContainer = $('<div>').css({
                        'display': 'flex',
                        'flex-direction': 'column',
                        'width': '100%',
                        'gap': '0.6em',
                        'margin': '0.6em 0 0.6em 0'
                    });
                    var firstRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var secondRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var thirdRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.4em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var durationElement = null, seasonElements = [], episodeElements = [], nextEpisodeElements = [], genreElements = [];
                    var tempContainer = $('<div>').html(originalDetails);
                    // Удаляем стандартные метки о следующей серии
                    tempContainer.find('span').filter(function() {
                        var t = $(this).text();
                        return t.indexOf('Следующая:') !== -1 || t.indexOf('Осталось дней:') !== -1;
                    }).remove();
                    tempContainer.find('span').each(function() {
                        var $span = $(this);
                        var text = $span.text();
                        if ($span.hasClass('full-start-new__split')) return;
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        // Универсальное перефразирование сезонов
                        var matchSeasons = text.match(/Сезон(?:ы)?:?\s*(\d+)/i);
                        if (matchSeasons) {
                            var n = parseInt(matchSeasons[1], 10);
                            $span.text(n + ' ' + plural(n, 'Сезон', 'Сезона', 'Сезонов'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.seasons.bg, 'color': colors.seasons.text }));
                            seasonElements.push($span.clone());
                            return;
                        }
                        // Универсальное перефразирование серий
                        var matchEpisodes = text.match(/Серии?:?\s*(\d+)/i);
                        if (matchEpisodes) {
                            var n = parseInt(matchEpisodes[1], 10);
                            $span.text(n + ' ' + plural(n, 'Серия', 'Серии', 'Серий'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            episodeElements.push($span.clone());
                            return;
                        }
                        // Обычная обработка (жанры и др.)
                        var genres = text.split(' | ');
                        if (genres.length > 1) {
                            var $genresContainer = $('<div>').css({ 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'center' });
                            for (var i = 0; i < genres.length; i++) {
                                var genre = genres[i].trim();
                                var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                                var $badge = $('<span>').text(genre).css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text, 'margin': '0.2em' }));
                                $genresContainer.append($badge);
                            }
                            genreElements.push($genresContainer);
                        } else {
                            var genre = text.trim();
                            var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                            $span.css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text, 'margin': '0.2em' }));
                            genreElements.push($span.clone());
                        }
                    });
                    // --- КОРРЕКТНЫЙ ВЫВОД СЕРИЙ ДЛЯ СЕРИАЛОВ + МЕТКА О СЛЕДУЮЩЕЙ СЕРИИ ---
                    if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
                        var totalEpisodes = 0;
                        var airedEpisodes = 0;
                        var currentDate = new Date();
                        var hasEpisodes = false;
                        movie.seasons.forEach(function(season) {
                            if (season.season_number === 0) return;
                            if (season.episode_count) totalEpisodes += season.episode_count;
                            if (season.episodes && Array.isArray(season.episodes) && season.episodes.length) {
                                hasEpisodes = true;
                                season.episodes.forEach(function(episode) {
                                    if (episode.air_date) {
                                        var epAirDate = new Date(episode.air_date);
                                        if (epAirDate <= currentDate) airedEpisodes++;
                                    }
                                });
                            } else if (season.air_date) {
                                var airDate = new Date(season.air_date);
                                if (airDate <= currentDate && season.episode_count) airedEpisodes += season.episode_count;
                            }
                        });
                        // ВЫВОД В КОНСОЛЬ для отладки
                        console.log('[interface_mod_new] airedEpisodes:', airedEpisodes, 'totalEpisodes:', totalEpisodes, movie);
                        // Если нет подробных данных по эпизодам, но есть next_episode_to_air
                        if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                            var nextSeason = movie.next_episode_to_air.season_number;
                            var nextEpisode = movie.next_episode_to_air.episode_number;
                            var remainingEpisodes = 0;
                            movie.seasons.forEach(function(season) {
                                if (season.season_number === nextSeason) {
                                    remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                                } else if (season.season_number > nextSeason) {
                                    remainingEpisodes += season.episode_count || 0;
                                }
                            });
                            if (remainingEpisodes > 0 && totalEpisodes > 0) {
                                var calculatedAired = totalEpisodes - remainingEpisodes;
                                if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                                    airedEpisodes = calculatedAired;
                                }
                            }
                        }
                        // Формируем строку для серий
                        var episodesText = '';
                        if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                            episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серия', 'Серии', 'Серий') + ' из ' + totalEpisodes;
                        } else if (totalEpisodes > 0) {
                            episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серия', 'Серии', 'Серий');
                        }
                        // --- Новый порядок строк ---
                        // 1 строка: сезоны и серии
                        firstRow.empty();
                        seasonElements.forEach(function(el) { firstRow.append(el); });
                        // Удаляем все бейджи серий из episodeElements, чтобы не было дублирования
                        // и всегда показываем только наш кастомный бейдж
                        if (episodesText) {
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $badge = $('<span>').text(episodesText).css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            firstRow.append($badge);
                        }
                        // 2 строка: только метка о следующей серии
                        secondRow.empty();
                        if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && airedEpisodes < totalEpisodes) {
                            var nextDate = new Date(movie.next_episode_to_air.air_date);
                            var today = new Date();
                            nextDate.setHours(0,0,0,0);
                            today.setHours(0,0,0,0);
                            var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000*60*60*24));
                            var nextText = '';
                            if (diffDays === 0) nextText = 'Следующая серия уже сегодня';
                            else if (diffDays === 1) nextText = 'Следующая серия уже завтра';
                            else if (diffDays > 1) nextText = 'Следующая серия через ' + diffDays + ' ' + plural(diffDays, 'день', 'дня', 'дней');
                            if (nextText) {
                                var nextStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'background-color': colors.next.bg, 'color': colors.next.text, 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                                var $nextBadge = $('<span>').text(nextText).css(nextStyle);
                                secondRow.append($nextBadge);
                            }
                        }
                        // 3 строка: длительность серии
                        thirdRow.empty();
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Длительность серии ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            thirdRow.append($avgDurationBadge);
                        }
                        // 4 строка: жанры
                        var genresRow = $('<div>').css({'display':'flex','flex-wrap':'wrap','align-items':'center'});
                        genreElements.forEach(function(el) { genresRow.append(el); });
                        // Очищаем и добавляем строки в контейнер
                        newContainer.empty();
                        newContainer.append(firstRow);
                        if (secondRow.children().length) newContainer.append(secondRow);
                        if (thirdRow.children().length) newContainer.append(thirdRow);
                        if (genresRow.children().length) newContainer.append(genresRow);
                        details.append(newContainer);
                        return;
                    }
                    // --- КОНЕЦ БЛОКА О СЛЕДУЮЩЕЙ СЕРИИ ---
                    // --- ДОПОЛНИТЕЛЬНАЯ ОБРАБОТКА ДЛЯ ФИЛЬМОВ ---
                    if (!isTvShow && movie && movie.runtime > 0) {
                        // Удаляем стандартные бейджи с временем (HH:MM) и 'Длительность серии ≈ ...' из tempContainer
                        tempContainer.find('span').filter(function() {
                            var t = $(this).text().trim();
                            return /^\d{2}:\d{2}$/.test(t) || t.indexOf('Длительность серии ≈') === 0;
                        }).remove();
                        // Также удаляем такие бейджи из genreElements (если вдруг попали)
                        genreElements = genreElements.filter(function(el) {
                            var t = $(el).text().trim();
                            return !/^\d{2}:\d{2}$/.test(t);
                        });
                        // Формируем строку длительности
                        var mins = movie.runtime;
                        var hours = Math.floor(mins / 60);
                        var min = mins % 60;
                        var text = 'Длительность фильма: ';
                        if (hours > 0) text += hours + ' ' + plural(hours, 'час', 'часа', 'часов');
                        if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' мин.';
                        var $badge = $('<span>').text(text).css({
                            'border-radius': '0.3em',
                            'border': '0px',
                            'font-size': '1.3em',
                            'padding': '0.2em 0.6em',
                            'display': 'inline-block',
                            'white-space': 'nowrap',
                            'line-height': '1.2em',
                            'background-color': colors.duration.bg,
                            'color': colors.duration.text,
                            'margin': '0.2em',
                            'margin-right': '0.4em',
                            'margin-bottom': '0.2em'
                        });
                        secondRow.empty().append($badge);
                    } else if (isTvShow) {
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Длительность серии ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            secondRow.prepend($avgDurationBadge);
                        }
                    }
                    // --- КОНЕЦ ДОПОЛНИТЕЛЬНОЙ ОБРАБОТКИ ДЛЯ ФИЛЬМОВ ---
                    if (durationElement) firstRow.append(durationElement);
                    seasonElements.forEach(function(el) { firstRow.append(el); });
                    episodeElements.forEach(function(el) { firstRow.append(el); });
                    nextEpisodeElements.forEach(function(el) { firstRow.append(el); });
                    genreElements.forEach(function(el) { thirdRow.append(el); });
                    newContainer.append(firstRow).append(secondRow).append(thirdRow);
                    details.append(newContainer);
                }, 100);
            }
        });
    }

    // === ЦВЕТНЫЕ РЕЙТИНГИ, СТАТУСЫ И ВОЗРАСТНЫЕ ОГРАНИЧЕНИЯ ===
    function updateVoteColors() {
        if (!settings.colored_ratings) return;
        function applyColorByRating(element) {
            var voteText = $(element).text().trim();
            var match = voteText.match(/(\d+(\.\d+)?)/);
            if (!match) return;
            var vote = parseFloat(match[0]);
            if (vote >= 0 && vote <= 3) {
                $(element).css('color', 'red');
            } else if (vote > 3 && vote < 6) {
                $(element).css('color', 'orange');
            } else if (vote >= 6 && vote < 8) {
                $(element).css('color', 'cornflowerblue');
            } else if (vote >= 8 && vote <= 10) {
                $(element).css('color', 'lawngreen');
            }
        }
        $(".card__vote").each(function() { applyColorByRating(this); });
        $(".full-start__rate, .full-start-new__rate").each(function() { applyColorByRating(this); });
        $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function() { applyColorByRating(this); });
    }
    function setupVoteColorsObserver() {
        if (!settings.colored_ratings) return;
        setTimeout(updateVoteColors, 500);
        var observer = new MutationObserver(function() { setTimeout(updateVoteColors, 100); });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    function setupVoteColorsForDetailPage() {
        if (!settings.colored_ratings) return;
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(updateVoteColors, 100);
            }
        });
    }
    function colorizeSeriesStatus() {
        function applyStatusColor(statusElement) {
            var statusText = $(statusElement).text().trim();
            var statusColors = {
                'completed': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'canceled': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'ongoing': { bg: 'rgba(243, 156, 18, 0.8)', text: 'black' },
                'production': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'planned': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'pilot': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
                'released': { bg: 'rgba(26, 188, 156, 0.8)', text: 'white' },
                'rumored': { bg: 'rgba(149, 165, 166, 0.8)', text: 'white' },
                'post': { bg: 'rgba(0, 188, 212, 0.8)', text: 'white' }
            };
            var bgColor = '', textColor = '';
            if (statusText.includes('Заверш') || statusText.includes('Ended')) { bgColor = statusColors.completed.bg; textColor = statusColors.completed.text; }
            else if (statusText.includes('Отмен') || statusText.includes('Canceled')) { bgColor = statusColors.canceled.bg; textColor = statusColors.canceled.text; }
            else if (statusText.includes('Онгоинг') || statusText.includes('Выход') || statusText.includes('В процессе') || statusText.includes('Return')) { bgColor = statusColors.ongoing.bg; textColor = statusColors.ongoing.text; }
            else if (statusText.includes('производстве') || statusText.includes('Production')) { bgColor = statusColors.production.bg; textColor = statusColors.production.text; }
            else if (statusText.includes('Запланировано') || statusText.includes('Planned')) { bgColor = statusColors.planned.bg; textColor = statusColors.planned.text; }
            else if (statusText.includes('Пилотный') || statusText.includes('Pilot')) { bgColor = statusColors.pilot.bg; textColor = statusColors.pilot.text; }
            else if (statusText.includes('Выпущенный') || statusText.includes('Released')) { bgColor = statusColors.released.bg; textColor = statusColors.released.text; }
            else if (statusText.includes('слухам') || statusText.includes('Rumored')) { bgColor = statusColors.rumored.bg; textColor = statusColors.rumored.text; }
            else if (statusText.includes('Скоро') || statusText.includes('Post')) { bgColor = statusColors.post.bg; textColor = statusColors.post.text; }
            if (bgColor) {
                $(statusElement).css({
                    'background-color': bgColor,
                    'color': textColor,
                    'border-radius': '0.3em',
                    'border': '0px',
                    'font-size': '1.3em',
                    'display': 'inline-block'
                });
            }
        }
        $('.full-start__status').each(function() { applyStatusColor(this); });
        var statusObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__status').each(function() { applyStatusColor(this); });
                        if ($(node).hasClass('full-start__status')) { applyStatusColor(node); }
                    }
                }
            });
        });
        statusObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__status').each(function() { applyStatusColor(this); });
                }, 100);
            }
        });
    }
    function colorizeAgeRating() {
        function applyAgeRatingColor(ratingElement) {
            var ratingText = $(ratingElement).text().trim();
            var ageRatings = {
                kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
                children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
                teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
                almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
                adult: ['NC-17', '18+', '18', 'X']
            };
            var colors = {
                kids: { bg: '#2ecc71', text: 'white' },
                children: { bg: '#3498db', text: 'white' },
                teens: { bg: '#f1c40f', text: 'black' },
                almostAdult: { bg: '#e67e22', text: 'white' },
                adult: { bg: '#e74c3c', text: 'white' }
            };
            var group = null;
            for (var groupKey in ageRatings) {
                if (ageRatings[groupKey].includes(ratingText)) { group = groupKey; break; }
                for (var i = 0; i < ageRatings[groupKey].length; i++) {
                    if (ratingText.includes(ageRatings[groupKey][i])) { group = groupKey; break; }
                }
                if (group) break;
            }
            if (group) {
                $(ratingElement).css({
                    'background-color': colors[group].bg,
                    'color': colors[group].text,
                    'border-radius': '0.3em',
                    'font-size': '1.3em',
                    'border': '0px'
                });
            }
        }
        $('.full-start__pg').each(function() { applyAgeRatingColor(this); });
        var ratingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                        if ($(node).hasClass('full-start__pg')) { applyAgeRatingColor(node); }
                    }
                }
            });
        });
        ratingObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                }, 100);
            }
        });
    }
    // === КОНЕЦ ЦВЕТНЫХ ФУНКЦИЙ ===

    // Функция для генерации цвета из строки
    function stringToColor(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    
    // Функция для извлечения иконки из элемента
    function extractProviderIcon(btn) {
        var iconHtml = '';
        
        // Проверяем SVG
        if (btn.find('svg').length) {
            var icon = btn.find('svg').clone();
            // Сохраняем оригинальный viewBox, если он есть
            var originalViewBox = icon.attr('viewBox');
            // Удаляем все атрибуты, кроме xmlns и viewBox
            icon.removeAttr('width height style x y class version xml:space');
            if (!originalViewBox) {
                // Устанавливаем viewBox только если его нет
                icon.attr('viewBox', '0 0 512 512');
            }
            // Устанавливаем фиксированный размер для отображения
            icon.attr({
                width: 32,
                height: 32,
                style: 'width:32px;height:32px;display:block;'
            });
            
            // Проверяем, чтобы внутри были path элементы
            if (icon.find('path').length === 0 && icon.find('g').length === 0) {
                // Если внутри нет path, возможно это просто контейнер, достаём весь HTML
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    btn.find('svg').parent().html() + '</div>';
            } else {
                iconHtml = icon[0].outerHTML;
            }
        }
        // Проверяем изображения
        else if (btn.find('img').length) {
            var imgSrc = btn.find('img').attr('src');
            iconHtml = '<img src="' + imgSrc + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
        }
        // Проверяем элементы с классом ico
        else if (btn.find('.ico').length) {
            var icoElement = btn.find('.ico').clone();
            // Если в ico содержится svg, сохраняем его целиком
            if (icoElement.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    icoElement.html() + '</div>';
            } else {
                icoElement.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = icoElement[0].outerHTML;
            }
        }
        // Проверяем элементы с классом button__ico
        else if (btn.find('.button__ico').length) {
            var buttonIco = btn.find('.button__ico').clone();
            // Если в button__ico содержится svg, сохраняем его целиком
            if (buttonIco.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    buttonIco.html() + '</div>';
            } else {
                buttonIco.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = buttonIco[0].outerHTML;
            }
        }
        // Проверяем элементы с фоновым изображением
        else {
            var elemWithBg = btn.find('[style*="background-image"]');
            if (elemWithBg.length) {
                var bgStyle = elemWithBg.css('background-image');
                if (bgStyle && bgStyle.indexOf('url') !== -1) {
                    iconHtml = '<div style="width:32px;height:32px;display:block;background-image:' + bgStyle + ';background-size:contain;background-position:center;background-repeat:no-repeat;"></div>';
                }
            }
            // Ищем другие возможные иконки
            else {
                var possibleIcons = btn.find('.icon, .logo, [class*="icon"], [class*="logo"]').first();
                if (possibleIcons.length) {
                    // Если в иконке есть svg, сохраняем весь внутренний HTML
                    if (possibleIcons.find('svg').length) {
                        iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                            possibleIcons.html() + '</div>';
                    } else {
                        var possibleIcon = possibleIcons.clone();
                        possibleIcon.attr('style', 'width:32px;height:32px;display:block;');
                        iconHtml = possibleIcon[0].outerHTML;
                    }
                }
                // Проверяем data-атрибуты
                else {
                    var dataIcon = btn.attr('data-icon') || btn.attr('data-logo');
                    if (dataIcon) {
                        if (dataIcon && (dataIcon.indexOf('<svg') === 0 || dataIcon.indexOf('<img') === 0)) {
                            iconHtml = dataIcon;
                        } else if (dataIcon && (dataIcon.indexOf('http') === 0 || dataIcon.indexOf('/') === 0)) {
                            iconHtml = '<img src="' + dataIcon + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
                        }
                    }
                    // Если ничего не найдено, используем первую букву
                    else {
                        var providerName = btn.text().trim();
                        if (providerName) {
                            var firstLetter = providerName.charAt(0).toUpperCase();
                            var backgroundColor = stringToColor(providerName);
                            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background-color:' + backgroundColor + ';color:white;border-radius:50%;font-weight:bold;font-size:18px;">' + firstLetter + '</div>';
                        }
                    }
                }
            }
        }
        return iconHtml;
    }

    // Функция для создания меню кнопки "Ещё"
    function createMoreButtonMenu(otherButtons) {
        return function() {
            var items = [];
            otherButtons.forEach(function(btn) {
                var btnText = btn.text().trim();
                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                var iconHtml = extractProviderIcon(btn);
                
                items.push({
                    title: btnText,
                    icon: iconHtml,
                    subtitle: subtitle,
                    btn: btn
                });
            });
            
            Lampa.Select.show({
                title: 'Дополнительные опции',
                items: items,
                onSelect: function(selected) {
                    if (selected && selected.btn) {
                        selected.btn.trigger('hover:enter');
                    }
                },
                onBack: function() {}
            });
            
            setTimeout(function() {
                $('.selectbox-item').each(function(i) {
                    if (items[i]) {
                        var iconHtml = '';
                        if (items[i].icon) {
                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                        }
                        
                        $(this).css({
                            'position': 'relative',
                            'padding-left': items[i].icon ? '56px' : '16px'
                        }).prepend(iconHtml);
                        
                        // Исправим размер иконок для лучшей видимости
                        $(this).find('.menu__ico svg').css({
                            'width': '100%',
                            'height': '100%',
                            'max-width': '32px',
                            'max-height': '32px'
                        });
                        
                        // Подгоняем размер SVG внутри контейнера
                        $(this).find('.menu__ico svg > *').each(function() {
                            // Если viewBox не задан или некорректен, устанавливаем его
                            var svg = $(this).closest('svg');
                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                // Пробуем определить правильный viewBox по содержимому
                                var paths = svg.find('path');
                                if (paths.length) {
                                    svg.attr('viewBox', '0 0 512 512');
                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                }
                            }
                        });
                        
                        // Добавим анимацию при наведении
                        $(this).on('hover:focus hover:hover', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%) scale(1.1)',
                                'transition': 'all 0.3s'
                            });
                        }).on('hover:blur', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%)',
                                'transition': 'all 0.3s'
                            });
                        });
                    }
                });
            }, 50);
        };
    }

    // === ОТОБРАЖЕНИЕ ВСЕХ КНОПОК ===
    function showAllButtons() {
        // УБИРАЕМ глобальное добавление стиля normalize_svg_icons_style
        // (Больше не добавляем document.head.appendChild(normalizeIconsStyle))
        // ... остальной код ...

        // --- кастомные кнопки для режима main2 ---
        if (!document.getElementById('interface_mod_new_buttons_style')) {
            var buttonStyle = document.createElement('style');
            buttonStyle.id = 'interface_mod_new_buttons_style';
            buttonStyle.innerHTML = `
                .full-start-new__buttons, .full-start__buttons {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 0.7em !important;
                }
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00b2ff; margin: 0.6em; margin-right: 1.1em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 13px #e67e22; }
                
                @media (max-width: 600px) {
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00b2ff; margin: 0.8em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 8px #e67e22; }

                    
                     .full-start__button.focus,
                     .custom-online-btn.focus,
                     .custom-torrent-btn.focus,
                     .main2-more-btn.focus {
                        background: none;
                        background-color: #2f2f2fd1;
                        color: #fff;
                        filter: none;
                    }
                }
            `;
            document.head.appendChild(buttonStyle);
        }

        var originFullCard;
        if (Lampa.FullCard) {
            originFullCard = Lampa.FullCard.build;
            Lampa.FullCard.build = function(data) {
                var card = originFullCard(data);
                card.organizeButtons = function() {
                    var activity = card.activity;
                    if (!activity) return;
                    var element = activity.render();
                    if (!element) return;
                    var targetContainer = element.find('.full-start-new__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.full-start__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.buttons-container');
                    if (!targetContainer.length) return;

                    var allButtons = [];
                    var buttonSelectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button',
                        '.full-start-new__buttons .button',
                        '.full-start__buttons .button'
                    ];
                    buttonSelectors.forEach(function(selector) {
                        element.find(selector).each(function() {
                            allButtons.push(this);
                        });
                    });
                    if (allButtons.length === 0) return;

                    var categories = {
                        online: [],
                        torrent: [],
                        trailer: [],
                        other: []
                    };
                    var addedButtonTexts = {};
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        if (className.includes('online')) {
                            categories.online.push(button);
                        } else if (className.includes('torrent')) {
                            categories.torrent.push(button);
                        } else if (className.includes('trailer')) {
                            categories.trailer.push(button);
                        } else {
                            categories.other.push(button);
                        }
                    });
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    var originalElements = targetContainer.children().detach();
                    targetContainer.css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.7em'
                    });
                    buttonSortOrder.forEach(function(category) {
                        categories[category].forEach(function(button) {
                            targetContainer.append(button);
                        });
                    });
                    // --- кастомные кнопки для режима main2 ---
                    if (settings.buttons_style_mode === 'main2') {
                        // Сохраняем все оригинальные онлайн-кнопки до их скрытия/перемещения (только уникальные)
                        var allOnlineButtons = [];
                        var seenOnlineTexts = {};
                        $(allButtons).each(function() {
                            var btn = $(this);
                            if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                if (!seenOnlineTexts[key]) {
                                    allOnlineButtons.push(btn);
                                    seenOnlineTexts[key] = true;
                                }
                            }
                        });
                        allButtons.forEach(function(btn) { $(btn).hide(); });
                        var origOnline = targetContainer.find('.full-start__button.view--online');
                        var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                        origOnline.hide();
                        origTorrent.hide();
                        targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                        // Кнопка Онлайн (большая) - БЕЗ инлайн-стилей
                        var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                            .text('Онлайн')
                            .attr('data-subtitle', 'Lampac v1.4.8')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        // Меню выбора онлайн-провайдера
                        var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                        function showOnlineMenu() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        // Исправим размер иконок для лучшей видимости
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        // Подгоняем размер SVG внутри контейнера
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            // Если viewBox не задан или некорректен, устанавливаем его
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                // Пробуем определить правильный viewBox по содержимому
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        // Добавим анимацию при наведении
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        }
                        onlineBtn.on('hover:enter', function() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        // Исправим размер иконок для лучшей видимости
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        // Подгоняем размер SVG внутри контейнера
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            // Если viewBox не задан или некорректен, устанавливаем его
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                // Пробуем определить правильный viewBox по содержимому
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        // Добавим анимацию при наведении
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        });
                        // Навигация по меню с пульта
                        onlineMenu.on('keydown', function(e) {
                            if (e.key === 'Back' || e.key === 'Escape') {
                                onlineMenu.hide();
                                onlineBtn.addClass('focus');
                            }
                        });
                        onlineMenu.on('focusout', function() {
                            setTimeout(function() {
                                if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                            }, 100);
                        });
                        // Кнопка Торрент (большая) - БЕЗ инлайн-стилей
                        var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                            .text('Торрент')
                            .attr('data-subtitle', 'Торрент')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); })
                            .on('hover:enter', function() {
                                if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                else Lampa.Noty.show('Нет торрент-провайдера');
                            });
                        // Собираем остальные кнопки
                        var otherButtons = [];
                        // Сохраняем тексты онлайн-кнопок, чтобы избежать дублирования
                        var onlineButtonTexts = {};
                        allOnlineButtons.forEach(function(btn) {
                            var text = $(btn).text().trim();
                            if (text) {
                                onlineButtonTexts[text] = true;
                            }
                        });
                        
                        // Список элементов, которые нужно скрыть из меню "Ещё"
                        var hideButtonTexts = {
                            'Смотреть': true,
                            'Подписаться': true
                        };
                        
                        $(allButtons).each(function() {
                            var btn = $(this);
                            var btnText = btn.text().trim();
                            // Проверяем, что кнопка не является онлайн или торрент, не дублирует онлайн-кнопки и не в списке скрытых
                            if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                otherButtons.push(btn.clone(true, true).removeClass('focus'));
                            }
                        });
                        // Кнопка "Ещё" (большая) - БЕЗ инлайн-стилей
                        var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        
                        // Открытие меню по нажатию кнопки "Ещё"
                        moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                        
                        // Вставляем элементы
                        targetContainer.prepend(moreBtn);
                        targetContainer.prepend(torrentBtn);
                        targetContainer.prepend(onlineBtn);
                        targetContainer.prepend(onlineMenu);
                        // Сброс инлайн-стилей для кастомных кнопок (на всякий случай)
                        setTimeout(function() {
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                this.removeAttribute('style');
                            });
                        }, 10);
                        // Контейнер как controller
                        targetContainer.addClass('controller');
                        Lampa.Controller.enable('full_start');
                        setTimeout(function() {
                            onlineBtn.addClass('focus');
                        }, 100);
                    }
                    // --- конец блока кастомных кнопок main2 ---
                    if (needToggle) {
                        setTimeout(function() {
                            Lampa.Controller.toggle('full_start');
                        }, 100);
                    }
                };
                card.onCreate = function() {
                    if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
                        setTimeout(function() {
                            card.organizeButtons();
                        }, 300);
                    }
                };
                return card;
            };
        }
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object && e.object.activity) {
                if ((settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') && !Lampa.FullCard) {
                    setTimeout(function() {
                        var fullContainer = e.object.activity.render();
                        var targetContainer = fullContainer.find('.full-start-new__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.full-start__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.buttons-container');
                        if (!targetContainer.length) return;
                        targetContainer.css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.7em'
                        });
                        var allButtons = [];
                        var buttonSelectors = [
                            '.buttons--container .full-start__button',
                            '.full-start-new__buttons .full-start__button',
                            '.full-start__buttons .full-start__button',
                            '.buttons-container .button',
                            '.full-start-new__buttons .button',
                            '.full-start__buttons .button'
                        ];
                        buttonSelectors.forEach(function(selector) {
                            fullContainer.find(selector).each(function() {
                                allButtons.push(this);
                            });
                        });
                        if (allButtons.length === 0) return;
                        var categories = {
                            online: [],
                            torrent: [],
                            trailer: [],
                            other: []
                        };
                        var addedButtonTexts = {};
                        $(allButtons).each(function() {
                            var button = this;
                            var buttonText = $(button).text().trim();
                            var className = button.className || '';
                            if (!buttonText || addedButtonTexts[buttonText]) return;
                            addedButtonTexts[buttonText] = true;
                            if (className.includes('online')) {
                                categories.online.push(button);
                            } else if (className.includes('torrent')) {
                                categories.torrent.push(button);
                            } else if (className.includes('trailer')) {
                                categories.trailer.push(button);
                            } else {
                                categories.other.push(button);
                            }
                        });
                        var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                        var needToggle = Lampa.Controller.enabled().name === 'full_start';
                        if (needToggle) Lampa.Controller.toggle('settings_component');
                        var originalElements = targetContainer.children().detach();
                        buttonSortOrder.forEach(function(category) {
                            categories[category].forEach(function(button) {
                                targetContainer.append(button);
                            });
                        });
                        // --- кастомные кнопки для режима main2 ---
                        if (settings.buttons_style_mode === 'main2') {
                            // Сохраняем все оригинальные онлайн-кнопки до их скрытия/перемещения (только уникальные)
                            var allOnlineButtons = [];
                            var seenOnlineTexts = {};
                            $(allButtons).each(function() {
                                var btn = $(this);
                                if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                    var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                    if (!seenOnlineTexts[key]) {
                                        allOnlineButtons.push(btn);
                                        seenOnlineTexts[key] = true;
                                    }
                                }
                            });
                            allButtons.forEach(function(btn) { $(btn).hide(); });
                            var origOnline = targetContainer.find('.full-start__button.view--online');
                            var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                            origOnline.hide();
                            origTorrent.hide();
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                            // Кнопка Онлайн (большая) - БЕЗ инлайн-стилей
                            var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                                .text('Онлайн')
                                .attr('data-subtitle', 'Lampac v1.4.8')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            // Меню выбора онлайн-провайдера
                            var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                            function showOnlineMenu() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                    });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            // Исправим размер иконок для лучшей видимости
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            // Подгоняем размер SVG внутри контейнера
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                // Если viewBox не задан или некорректен, устанавливаем его
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    // Пробуем определить правильный viewBox по содержимому
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            // Добавим анимацию при наведении
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            }
                            onlineBtn.on('hover:enter', function() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            // Исправим размер иконок для лучшей видимости
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            // Подгоняем размер SVG внутри контейнера
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                // Если viewBox не задан или некорректен, устанавливаем его
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    // Пробуем определить правильный viewBox по содержимому
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            // Добавим анимацию при наведении
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            });
                            // Навигация по меню с пульта
                            onlineMenu.on('keydown', function(e) {
                                if (e.key === 'Back' || e.key === 'Escape') {
                                    onlineMenu.hide();
                                    onlineBtn.addClass('focus');
                                }
                            });
                            onlineMenu.on('focusout', function() {
                                setTimeout(function() {
                                    if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                                }, 100);
                            });
                            // Кнопка Торрент (большая) - БЕЗ инлайн-стилей
                            var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                                .text('Торрент')
                                .attr('data-subtitle', 'Торрент')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); })
                                .on('hover:enter', function() {
                                    if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                    else Lampa.Noty.show('Нет торрент-провайдера');
                                });
                            // Собираем остальные кнопки
                            var otherButtons = [];
                            // Сохраняем тексты онлайн-кнопок, чтобы избежать дублирования
                            var onlineButtonTexts = {};
                            allOnlineButtons.forEach(function(btn) {
                                var text = $(btn).text().trim();
                                if (text) {
                                    onlineButtonTexts[text] = true;
                                }
                            });
                            
                            // Список элементов, которые нужно скрыть из меню "Ещё"
                            var hideButtonTexts = {
                                'Смотреть': true,
                                'Подписаться': true
                            };
                            
                            $(allButtons).each(function() {
                                var btn = $(this);
                                var btnText = btn.text().trim();
                                // Проверяем, что кнопка не является онлайн или торрент, не дублирует онлайн-кнопки и не в списке скрытых
                                if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                    !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                    otherButtons.push(btn.clone(true, true).removeClass('focus'));
                                }
                            });
                            // Кнопка "Ещё" (большая) - БЕЗ инлайн-стилей
                            var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            
                            // Открытие меню по нажатию кнопки "Ещё"
                            moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                            
                            // Вставляем элементы
                            targetContainer.prepend(moreBtn);
                            targetContainer.prepend(torrentBtn);
                            targetContainer.prepend(onlineBtn);
                            targetContainer.prepend(onlineMenu);
                            // Сброс инлайн-стилей для кастомных кнопок (на всякий случай)
                            setTimeout(function() {
                                targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                    this.removeAttribute('style');
                                });
                            }, 10);
                            // Контейнер как controller
                            targetContainer.addClass('controller');
                            Lampa.Controller.enable('full_start');
                            setTimeout(function() {
                                onlineBtn.addClass('focus');
                            }, 100);
                        }
                        // --- конец блока кастомных кнопок main2 ---
                        if (needToggle) {
                            setTimeout(function() {
                                Lampa.Controller.toggle('full_start');
                            }, 100);
                        }
                    }, 300);
                }
            }
        });
        var buttonObserver = new MutationObserver(function(mutations) {
            if (settings.buttons_style_mode !== 'all' && settings.buttons_style_mode !== 'main2') return;
            var needReorganize = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' &&
                    (mutation.target.classList.contains('full-start-new__buttons') ||
                        mutation.target.classList.contains('full-start__buttons') ||
                        mutation.target.classList.contains('buttons-container'))) {
                    needReorganize = true;
                }
            });
            if (needReorganize) {
                setTimeout(function() {
                    if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card) {
                        if (typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                            Lampa.Activity.active().activity.card.organizeButtons();
                        }
                    }
                }, 100);
            }
        });
        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Функция для применения тем
    function applyTheme(theme) {
        // Удаляем предыдущие стили темы
        const oldStyle = document.querySelector('#interface_mod_theme');
        if (oldStyle) oldStyle.remove();

        // Если выбрано "По умолчанию", просто удаляем стили
        if (theme === 'default') {
            // Деактивируем все внешние темы
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            return;
        }

        // Проверяем, есть ли внешняя тема
        var externalThemeStyle = document.querySelector('#theme-style-' + theme);
        if (externalThemeStyle) {
            // Деактивируем все внешние темы
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            // Активируем нужную тему
            externalThemeStyle.disabled = false;
            return;
        }

        // Создаем новый стиль для встроенных тем
        const style = document.createElement('style');
        style.id = 'interface_mod_theme';

        // Определяем стили для разных тем
        const themes = {
            neon: `
                body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #ff00ff, #00ffff);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                    border: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff00ff;
                    box-shadow: 0 0 20px #00ffff;
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #ff00ff, #00ffff);
                    box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(1.2) saturate(1.3);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(15, 2, 33, 0.95);
                    border: 1px solid rgba(255, 0, 255, 0.1);
                }
            `,
            sunset: `
                body { background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.3);
                    font-weight: bold;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #ff6e7f;
                    box-shadow: 0 0 15px rgba(255, 110, 127, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #ff6e7f, #bfe9ff);
                    color: #2d1f3d;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.2) contrast(1.1);
                }
            `,
            emerald: `
                body { background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #43cea2, #185a9d);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3);
                    border-radius: 5px;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 3px solid #43cea2;
                    box-shadow: 0 0 20px rgba(67, 206, 162, 0.4);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #43cea2, #185a9d);
                }
                .full-start__background {
                    opacity: 0.85;
                    filter: brightness(1.1) saturate(1.2);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(26, 42, 58, 0.98);
                    border: 1px solid rgba(67, 206, 162, 0.1);
                }
            `,
            aurora: `
                body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(170, 75, 107, 0.3);
                    transform: scale(1.02);
                    transition: all 0.3s ease;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #aa4b6b;
                    box-shadow: 0 0 25px rgba(170, 75, 107, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #aa4b6b, #3b8d99);
                    transform: scale(1.05);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: contrast(1.1) brightness(1.1);
                }
            `,
            bywolf_mod: `
                body { background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%); color: #ffffff; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #fc00ff, #00dbde);
                    color: #fff;
                    box-shadow: 0 0 30px rgba(252, 0, 255, 0.3);
                    animation: cosmic-pulse 2s infinite;
                }
                @keyframes cosmic-pulse {
                    0% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3); }
                    50% { box-shadow: 0 0 30px rgba(0, 219, 222, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3); }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #fc00ff;
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #fc00ff, #00dbde);
                    animation: cosmic-pulse 2s infinite;
                }
                .full-start__background {
                    opacity: 0.8;
                    filter: saturate(1.3) contrast(1.1);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(9, 2, 39, 0.95);
                    border: 1px solid rgba(252, 0, 255, 0.1);
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.1);
                }
            `,
            minimalist: `
                body { background: #121212; color: #e0e0e0; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: #2c2c2c;
                    color: #ffffff;
                    box-shadow: none;
                    border-radius: 3px;
                    border-left: 3px solid #3d3d3d;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 1px solid #3d3d3d;
                    box-shadow: none;
                }
                .head__action.focus, .head__action.hover {
                    background: #2c2c2c;
                }
                .full-start__background {
                    opacity: 0.6;
                    filter: grayscale(0.5) brightness(0.7);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(18, 18, 18, 0.95);
                    border: 1px solid #2c2c2c;
                }
                .selectbox-item + .selectbox-item {
                    border-top: 1px solid #2c2c2c;
                }
                .card__title, .card__vote, .full-start__title, .full-start__rate, .full-start-new__title, .full-start-new__rate {
                    color: #e0e0e0;
                }
            `,
            glow_outline: `
                body { background: #0a0a0a; color: #f5f5f5; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: rgba(40, 40, 40, 0.8);
                    color: #fff;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 1;
                }
                .menu__item.focus::before, .settings-folder.focus::before, .settings-param.focus::before, .selectbox-item.focus::before,
                .custom-online-btn.focus::before, .custom-torrent-btn.focus::before, .main2-more-btn.focus::before, .simple-button.focus::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    z-index: -1;
                    border-radius: 5px;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: glowing 1.5s linear infinite;
                }
                @keyframes glowing {
                    0% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                    50% { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff; }
                    100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: none;
                    box-shadow: 0 0 0 2px #fff, 0 0 10px #0ff, 0 0 15px rgba(0, 255, 255, 0.5);
                    animation: card-glow 1.5s ease-in-out infinite alternate;
                }
                @keyframes card-glow {
                    from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff; }
                    to { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff; }
                }
                .head__action.focus, .head__action.hover {
                    background: #292929;
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.5);
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8) contrast(1.2);
                }
            `,
            menu_lines: `
                body { background: #121212; color: #f5f5f5; }
                .menu__item {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #303030 0%, #404040 100%);
                    color: #fff;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                    border-left: 3px solid #808080;
                    border-bottom: 1px solid #808080;
                }
                .settings-folder, .settings-param {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    margin-bottom: 5px;
                    padding-bottom: 5px;
                }
                .settings-folder + .settings-folder {
                    border-top: none;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #808080;
                    box-shadow: 0 0 10px rgba(128, 128, 128, 0.5);
                }
                .head__action.focus, .head__action.hover {
                    background: #404040;
                    border-left: 3px solid #808080;
                }
                .full-start__background {
                    opacity: 0.7;
                    filter: brightness(0.8);
                }
                .menu__list {
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                }
                .selectbox-item + .selectbox-item {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
            `,
            dark_emerald: `
                body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%); color: #dfdfdf; }
                .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
                .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
                    background: linear-gradient(to right, #1a594d, #0e3652);
                    color: #fff;
                    box-shadow: 0 2px 8px rgba(26, 89, 77, 0.2);
                    border-radius: 3px;
                }
                .card.focus .card__view::after, .card.hover .card__view::after {
                    border: 2px solid #1a594d;
                    box-shadow: 0 0 10px rgba(26, 89, 77, 0.3);
                }
                .head__action.focus, .head__action.hover {
                    background: linear-gradient(45deg, #1a594d, #0e3652);
                }
                .full-start__background {
                    opacity: 0.75;
                    filter: brightness(0.9) saturate(1.1);
                }
                .settings__content, .settings-input__content, .selectbox__content, .modal__content {
                    background: rgba(12, 22, 25, 0.97);
                    border: 1px solid rgba(26, 89, 77, 0.1);
                }
            `
        };

        style.textContent = themes[theme] || '';
        document.head.appendChild(style);
    }

    // Функция для загрузки внешних тем
    function loadExternalThemes(callback) {
        var themeUrl = 'https://bywolf88.github.io/lampa-plugins/theme.json';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', themeUrl, true);
        xhr.timeout = 5000;
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var externalThemes = JSON.parse(xhr.responseText);
                    if (externalThemes && typeof externalThemes === 'object') {
                        callback(null, externalThemes);
                    } else {
                        callback('Invalid themes data format', null);
                    }
                } catch (e) {
                    callback('Error parsing themes data: ' + e.message, null);
                }
            } else {
                callback('HTTP Error: ' + xhr.status, null);
            }
        };
        xhr.onerror = function() {
            callback('Network error', null);
        };
        xhr.ontimeout = function() {
            callback('Request timeout', null);
        };
        xhr.send();
    }

    // Функция для стилизации заголовков подборок
    function stylizeCollectionTitles() {
        if (!settings.stylize_titles) return;
        
        // Удаляем предыдущие стили, если они были
        var oldStyle = document.getElementById('stylized-titles-css');
        if (oldStyle) oldStyle.remove();
        
        // Создаем новый стиль
        var styleElement = document.createElement('style');
        styleElement.id = 'stylized-titles-css';
        
        // CSS для стилизации заголовков
        var css = `
            .items-line__title {
                font-size: 2.4em;
                display: inline-block;
                background: linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient-text 3s ease infinite;
                font-weight: 800;
                text-shadow: 0 1px 3px rgba(0,0,0,0.2);
                position: relative;
                padding: 0 5px;
                z-index: 1;
            }
            
            .items-line__title::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, #784BA0, transparent);
                z-index: -1;
                transform: scaleX(0);
                transform-origin: bottom right;
                transition: transform 0.5s ease-out;
                animation: line-animation 3s ease infinite;
            }
            
            .items-line__title::after {
                content: '';
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: rgba(0,0,0,0.05);
                border-radius: 6px;
                z-index: -2;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .items-line:hover .items-line__title::before {
                transform: scaleX(1);
                transform-origin: bottom left;
            }
            
            .items-line:hover .items-line__title::after {
                opacity: 1;
            }
            
            @keyframes gradient-text {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes line-animation {
                0% { transform: scaleX(0.2); opacity: 0.5; }
                50% { transform: scaleX(1); opacity: 1; }
                100% { transform: scaleX(0.2); opacity: 0.5; }
            }
        `;
        
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        // Добавляем наблюдатель за появлением новых заголовков
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // только элементы
                            var titles = node.querySelectorAll('.items-line__title');
                            if (titles.length) {
                                // Можно добавить дополнительные манипуляции с заголовками, если нужно
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Функция для увеличенной информации
    function enhanceDetailedInfo() {
        if (!settings.enhance_detailed_info) return;
        
        // Если уже добавлен стиль, удаляем
        var oldStyle = document.getElementById('enhanced-info-css');
        if (oldStyle) oldStyle.remove();
        
        // Добавляем CSS для увеличенной информации
        var enhancedInfoStyle = document.createElement('style');
        enhancedInfoStyle.id = 'enhanced-info-css';
        enhancedInfoStyle.textContent = `
             // CSS для увеличения информации
             .full-start-new__details {
                 font-size: 1.9em;
             }
             
             .full-start-new__details > * {
                 font-size: 1.9em;
                 margin: 0.1em;
             }

             .full-start-new__buttons, .full-start__buttons {
                 font-size: 1.4em !important;
             }
             
             .full-start__button {
                 font-size: 1.8em;
             }

             .full-start-new__rate-line {
                 font-size: 1.5em;
                 margin-bottom: 1em;
             }

             .full-start-new__poster {
                 display: none;
             }
             
             .full-start-new__left {
                 display: none;
             }
             
             .full-start-new__right {
                 width: 100%;
             }
             
             .full-descr__text {
                 font-size: 1.8em;
                 line-height: 1.4;
                 font-weight: 600;
                 width: 100%;
             }
             
             .info-unified-line {
                 display: flex;
                 flex-wrap: wrap;
                 align-items: center;
                 gap: 0.5em;
                 margin-bottom: 0.5em;
             }
             
             .info-unified-item {
                 border-radius: 0.3em;
                 border: 0px;
                 font-size: 1.3em;
                 padding: 0.2em 0.6em;
                 display: inline-block;
                 white-space: nowrap;
                 line-height: 1.2em;
             }
             
             /* Увеличиваем описание фильма */
             .full-start-new__title {
                 font-size: 2.2em !important;
             }
             
             .full-start-new__tagline {
                 font-size: 1.4em !important;
             }
             
             .full-start-new__desc {
                 font-size: 1.6em !important;
                 margin-top: 1em !important;
             }
             
             /* Увеличиваем шрифт для информационной панели */
             .full-start-new__info {
                 font-size: 1.4em !important;
             }
             
             /* Адаптация под мобильные устройства */
             @media (max-width: 768px) {
                 .full-start-new__title {
                     font-size: 1.8em !important;
                 }
                 
                 .full-start-new__desc {
                     font-size: 1.4em !important;
                 }
                 
                 .full-start-new__details {
                     font-size: 1.5em;
                 }
                 
                 .full-start-new__details > * {
                     font-size: 1.5em;
                     margin: 0.3em;
                 }
                 
                 .full-descr__text {
                     font-size: 1.5em;
                 }
             }
        `;
        document.head.appendChild(enhancedInfoStyle);
        
        // Добавляем обработчик для объединения информации в одну строку
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.enhance_detailed_info) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    
                    // Ищем информацию о сезонах, сериях и длительности
                    var seasonText = '';
                    var episodeText = '';
                    var durationText = '';
                    
                    // Собираем данные из существующих элементов
                    details.find('span').each(function() {
                        var text = $(this).text().trim();
                        
                        if (text.match(/Сезон(?:ы)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ов)?/i)) {
                            seasonText = text;
                        } else if (text.match(/Серии?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сери(?:я|и|й)/i)) {
                            episodeText = text;
                        } else if (text.match(/Длительность/i) || text.indexOf('≈') !== -1) {
                            durationText = text;
                        }
                    });
                    
                    // Если нашли хотя бы два элемента информации, объединяем их
                    if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                        // Создаем новый контейнер для объединенной строки
                        var unifiedLine = $('<div class="info-unified-line"></div>');
                        
                        // Добавляем информацию о сезонах, если есть
                        if (seasonText) {
                            var seasonItem = $('<span class="info-unified-item"></span>')
                                .text(seasonText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(seasonItem);
                        }
                        
                        // Добавляем информацию о сериях, если есть
                        if (episodeText) {
                            var episodeItem = $('<span class="info-unified-item"></span>')
                                .text(episodeText)
                                .css({
                                    'background-color': 'rgba(46, 204, 113, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(episodeItem);
                        }
                        
                        // Добавляем информацию о длительности, если есть
                        if (durationText) {
                            var durationItem = $('<span class="info-unified-item"></span>')
                                .text(durationText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(durationItem);
                        }
                        
                        // Удаляем старые элементы с этой информацией
                        details.find('span').each(function() {
                            var text = $(this).text().trim();
                            if (text === seasonText || text === episodeText || text === durationText) {
                                $(this).remove();
                            }
                        });
                        
                        // Добавляем объединенную строку в начало деталей
                        details.prepend(unifiedLine);
                    }
                }, 300);
            }
        });
    }

    // Инициализация
    function startPlugin() {
        // Загружаем темы и добавляем настройки
        addSettings();
        changeMovieTypeLabels();
        newInfoPanel();
        if (settings.colored_ratings) {
            updateVoteColors();
            setupVoteColorsObserver();
            setupVoteColorsForDetailPage();
        }
        colorizeSeriesStatus();
        colorizeAgeRating();
        if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
            showAllButtons();
        }
        
        // Применяем выбранную тему
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        // Применяем стилизацию заголовков, если включено
        if (settings.stylize_titles) {
            stylizeCollectionTitles();
        }
        
        // Применяем увеличенную информацию, если включено
        if (settings.enhance_detailed_info) {
            enhanceDetailedInfo();
        }
    }

    // Запуск после готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }
})();
