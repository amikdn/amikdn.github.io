
(function() {
    'use strict';

    // Инициализация платформы для телевизионного режима
    Lampa.Platform.tv();

    // Функция, возвращающая массив строк для расшифровки
    function getStringArray() {
        var strings = [
            'pause', '<span class="full-start__pg" style="font-size: 0.9em;">', 'back', 'render',
            'field', 'visible', 'card_views_type', 'static', 'down', 'Lang', 'cub', 'Отменено',
            'ganr', 'genres', 'Онгоинг', '388077OJarCg', 'insertAfter', '&language=', '.svg',
            'nomore', 'Показывать статус фильма/сериала', 'error', 'get', 'cardClass', 'addClass',
            'interface', '.new-interface-info__description', 'Выпущенный', 'plugin_interface_ready',
            'new_interface_style', 'rat', '4MXbJID', '&append_to_response=content_ratings,release_dates&language=',
            '.new-interface-info__title', '</div><div>TMDB</div></div>', '477063ZNkUNw', 'background',
            'start', 'Стильный интерфейс', 'replace', 'info', 'onFocus', '{}.constructor("return this")( )',
            'clear', '" />', 'change_source_on_cub', 'bind', 'add', '<div class="empty__footer"><div class="simple-button selector">',
            'Arrays', 'Utils', 'map', 'InteractionMain', 'loader', 'follow', 'remove', 'main', 'year_ogr',
            'wide_post', 'log', 'constructor', 'Api', 'min', 'show', 'Platform', 'url', 'language', 'app_digital',
            'warn', 'onWheel', 'onload', 'runtime', 'draw', 'SettingsApi', 'Layer', 'onToggle', 'overview', 'next',
            'logo_card_style', 'src', '</span>', 'canmove', 'Empty', '1732668zuwqei', 'seas', 'toFixed', 'w1280', 'origin',
            '.new-interface-info__head,.new-interface-info__details', 'style_interface', 'innerWidth', 'create', 'logos',
            'parseCountries', '<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="',
            'left', 'returning series', 'TMDB', 'onUp', 'status', 'vote_average', 'Settings', 'append', 'prototype',
            'onMore', 'listener', 'w200', '/images?api_key=', 'build', 'Background', '__proto__', 'search',
            'post production', '.full-start__background', 'table', 'parsePG', 'silent', 'tmdb', 'number_of_episodes',
            'content', 'mobile', 'find', 'Показывать время фильма', 'slice', 'removeClass', ' | ', 'name', 'head',
            '1190835ytflpy', 'InteractionLine', '636325chCSaM', 'eps', 'minus', 'secondsToTime', '<span>', 'timeout',
            '(((.+)+)+)+$', '?api_key=', '1757546nWuzVk', 'next_wait', 'own', 'Закончен', 'Показывать возрастное ограничение',
            'Ошибка', 'http://212.113.103.137:9118/proxyimg/', '.settings-param > div:contains("Стильный интерфейс")', 'hover:enter',
            'html', 'navigation_type', 'Показывать описание', 'apply', 'Manifest', '<span class="new-interface-info__split">&#9679;</span>',
            'full_notext', '4ef0d7355d9ffb5151e987764708ce96', 'destroy', 'hide', 'activity', 'Reguest', '[data-component="style_interface"]',
            '</div></div>', 'addParam', 'backward', 'lampa', 'movie', 'ready', 'push', '.selector', 'return (function() ',
            'vremya', 'translate', '---', '812504ToAqdh', 'empty', 'body', 'trigger', 'change', 'backdrop_path', 'move', 'Storage',
            'stop', 'length', 'exception', 'right', 'onFocusMore', 'text', 'mouse',
            '\n        <style>\n            .new-interface .card--small.card--wide {\n                width: 18.3em;\n            }\n            \n            .new-interface-info {\n                position: relative;\n                padding: 1.5em;\n                height: 26em;\n            }\n            \n            .new-interface-info__body {\n                width: 80%;\n                padding-top: 1.1em;\n            }\n            \n            .new-interface-info__head {\n                color: rgba(255, 255, 255, 0.6);\n                margin-bottom: 1em;\n                font-size: 1.3em;\n                min-height: 1em;\n            }\n            \n            .new-interface-info__head span {\n                color: #fff;\n            }\n            \n            .new-interface-info__title {\n                font-size: 4em;\n                font-weight: 600;\n                margin-bottom: 0.3em;\n                overflow: hidden;\n                -o-text-overflow: \".\";\n                text-overflow: \".\";\n                display: -webkit-box;\n                -webkit-line-clamp: 1;\n                line-clamp: 1;\n                -webkit-box-orient: vertical;\n                margin-left: -0.03em;\n                line-height: 1.3;\n            }\n            \n            .new-interface-info__details {\n                margin-bottom: 1.6em;\n                display: -webkit-box;\n                display: -webkit-flex;\n                display: -moz-box;\n                display: -ms-flexbox;\n                display: flex;\n                -webkit-box-align: center;\n                -webkit-align-items: center;\n                -moz-box-align: center;\n                -ms-flex-align: center;\n                align-items: center;\n                -webkit-flex-wrap: wrap;\n                -ms-flex-wrap: wrap;\n                flex-wrap: wrap;\n                min-height: 1.9em;\n                font-size: 1.3em;\n            }\n            \n            .new-interface-info__split {\n                margin: 0 1em;\n                font-size: 0.7em;\n            }\n            \n            .new-interface-info__description {\n                font-size: 1.4em;\n                font-weight: 310;\n                line-height: 1.3;\n                overflow: hidden;\n                -o-text-overflow: \".\";\n                text-overflow: \".\";\n                display: -webkit-box;\n                -webkit-line-clamp: 3;\n                line-clamp: 3;\n                -webkit-box-orient: vertical;\n                width: 65%;\n            }\n            \n            .new-interface .card-more__box {\n                padding-bottom: 95%;\n            }\n            \n            .new-interface .full-start__background {\n                height: 108%;\n                top: -5em;\n            }\n            \n            .new-interface .full-start__rate {\n                font-size: 1.3em;\n                margin-right: 0;\n            }\n            \n            .new-interface .card__promo {\n                display: none;\n            }\n            \n            .new-interface .card.card--wide + .card-more .card-more__box {\n                padding-bottom: 95%;\n            }\n            \n            .new-interface .card.card--wide.card-watched {\n                display: none !important;\n            }\n            \n            body.light--version .new-interface-info__body {\n                width: 69%;\n                padding-top: 1.5em;\n            }\n            \n            body.light--version .new-interface-info {\n                height: 25.3em;\n            }\n\n            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {\n                animation: animation-card-focus 0.2s\n            }\n            body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {\n                animation: animation-trigger-enter 0.2s forwards\n            }\n        </style>\n    ',
            'toString', 'http://image.tmdb.org/t/p/w500', 'trace', 'Показывать рейтинг фильма', '2dvZnHU',
            'http://212.113.103.137:9118/proxy/', 'onDown', 'Activity', 'menu', 'onerror', 'source',
            'refresh', 'toggle', 'loaded', 'join', 'released', 'desc', 'sources', 'update', 'file_path',
            'Controller', 'load', 'loadNext', 'forEach', 'Template', 'set', 'console'
        ];
        getStringArray = function() {
            return strings;
        };
        return getStringArray();
    }

    // Функция-декодер: принимает индекс, возвращает соответствующую строку из массива
    function decode(index, unused) {
        var arr = getStringArray();
        return (decode = function(i, unused) {
            i = i - 0x1ee;
            return arr[i];
        })(index, unused);
    }

    // Антиотладочный цикл: перемешивает массив до получения нужного числового результата
    (function(arrayFunc, target) {
        var decodeFunc = decode,
            arr = arrayFunc();
        while (true) {
            try {
                var computed = parseInt(decodeFunc(0x1f5)) / 1 * (parseInt(decodeFunc(0x2a6)) / 2)
                    + -parseInt(decodeFunc(0x266)) / 3 + parseInt(decodeFunc(0x205)) / 4 * (parseInt(decodeFunc(0x268)) / 5)
                    + parseInt(decodeFunc(0x239)) / 6 - parseInt(decodeFunc(0x270)) / 7
                    + parseInt(decodeFunc(0x292)) / 8 - parseInt(decodeFunc(0x209)) / 9;
                if (computed === target)
                    break;
                else
                    arr.push(arr.shift());
            } catch (e) {
                arr.push(arr.shift());
            }
        }
    }(getStringArray, 0x31f6d));

    // Далее идёт основной функциональный блок плагина...
    (function() {
        // Дальнейшая деобфускация начинается с определения вспомогательных функций
        // Например, функции для создания элементов интерфейса, работы с API и т.д.

        // Функция, создающая интерфейс информации о фильме/сериале
        function createInfoInterface() {
            var decodeFunc = decode,
                infoContainer,
                timeoutID,
                loader = new Lampa.Api(), // Создаем объект для запросов API
                cache = {};
            
            this.create = function() {
                infoContainer = $('<div class="new-interface-info">\n' +
                    '            <div class="new-interface-info__body">\n' +
                    '                <div class="new-interface-info__head"></div>\n' +
                    '                <div class="new-interface-info__title"></div>\n' +
                    '                <div class="new-interface-info__details"></div>\n' +
                    '                <div class="new-interface-info__description"></div>\n' +
                    '            </div>\n' +
                    '        </div>');
            };

            this.setInfo = function(item) {
                // Устанавливаем заголовок и постер в интерфейс
                infoContainer.find('.new-interface-info__head').html('<span class="full-start__pg" style="font-size: 0.9em;">');
                infoContainer.find('.new-interface-info__title').html(item.title);

                // Если в настройках Lampa включен показ логотипа, выполняем запрос к API TMDB
                if (Lampa.Settings.get('logo_card_style') !== false) {
                    var type = item.name ? 'tv' : 'movie',
                        lang = 'ru-RU',
                        baseUrl = 'https://api.themoviedb.org/3/',
                        append = '&append_to_response=content_ratings,release_dates&language=ru-RU',
                        url = baseUrl + type + '/' + item.id + '?api_key=' + Lampa.Settings.get('tmdb');

                    $.get(url, function(response) {
                        if (response.release_dates && response.release_dates.results[0]) {
                            var poster = response.release_dates.results[0].logo;
                            if (poster !== '')
                                (Lampa.Settings.get('logo_card_style') !== false)
                                    ? infoContainer.find('.new-interface-info__title').html('<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="http://image.tmdb.org/t/p/w500' + poster.toString('.svg', '.png') + '" />')
                                    : infoContainer.find('.new-interface-info__title').append(' <img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em;" src="http://image.tmdb.org/t/p/w500' + poster.toString('.svg', '.png') + '" />');
                        }
                    });
                }

                if (Lampa.Settings.get('static') !== false)
                    infoContainer.find('.new-interface-info__head').html(item.info || Lampa.Utils.getText('Показывать статус фильма/сериала'));

                // Добавляем рейтинговую информацию и другую дополнительную инфу
                Lampa.Api.img(item.poster, 'w200');
                this.setAdditionalInfo(item);
            };

            this.setAdditionalInfo = function(item) {
                var year = ((item.release_date || item.first_air_date || '0000') + '').slice(0, 4),
                    rating = parseFloat((item.vote_average || 0)).toFixed(1),
                    infoParts = [],
                    detailParts = [],
                    genres = Lampa.Api.tmdb.getGenres(item),
                    runtime = Lampa.Utils.formatTime(item.runtime * 60, true);

                if (year !== '0000')
                    infoParts.push('Выпущенный ' + year + '.');

                if (genres.length > 0)
                    infoParts.push(genres.join(', '));

                if (Lampa.Storage.get('rat') !== false) {
                    if (rating > 0)
                        detailParts.push('<div class="full-start__rate"><div>' + rating + ' / 10</div>');
                }

                if (Lampa.Settings.get('vremya') !== false) {
                    if (item.runtime)
                        detailParts.push(Lampa.Utils.secondsToTime(item.runtime * 60, true));
                }

                if (Lampa.Settings.get('seas') !== false) {
                    if (item.number_of_seasons)
                        detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Сезонов ' + item.number_of_seasons + '</span>');
                }

                if (Lampa.Settings.get('eps') !== false) {
                    if (item.number_of_episodes)
                        detailParts.push('<span class="full-start__pg" style="font-size: 0.9em;">Эпизодов ' + item.number_of_episodes + '.</span>');
                }

                if (Lampa.Settings.get('status') !== false) {
                    var statusText = '';
                    if (item.status)
                        switch (item.status.toLowerCase()) {
                            case 'returning series':
                                statusText = 'Онгоинг';
                                break;
                            case 'ended':
                                statusText = 'Закончен';
                                break;
                            case 'in production':
                                statusText = 'В производстве';
                                break;
                            case 'canceled':
                                statusText = 'Отменено';
                                break;
                            case 'upcoming':
                                statusText = 'Скоро';
                                break;
                            default:
                                statusText = item.status;
                                break;
                        }
                    statusText && detailParts.push('<span class="full-start__status" style="font-size: 0.9em;">' + statusText + '.</span>');
                }

                infoContainer.find('.new-interface-info__head').empty().append(infoParts.join(', '));
                infoContainer.find('.new-interface-info__details').html(detailParts.join(' | '));
            };

            this.load = function(item) {
                var url = Lampa.Api.get(item.name ? 'tv' : 'movie') + '/' + item.id +
                    '?api_key=' + Lampa.Api.key() + '&language=ru-RU' + Lampa.Storage.get('tmdb');

                if (cache[url])
                    return this.setAdditionalInfo(cache[url]);

                timeoutID = setTimeout(function() {
                    loader.start();
                    loader.timeout(5000);
                    loader.get(url, function(response) {
                        cache[url] = response;
                        self.setAdditionalInfo(response);
                    });
                }, 300);
            };

            this.render = function() {
                return infoContainer;
            };

            this.destroy = function() {
                infoContainer.remove();
                cache = {};
                infoContainer = null;
            };
        }

        // Далее идет функция, создающая интерфейс списка элементов (фильмов/сериалов)
        function createInterfaceList(dataSource) {
            var decodeFunc = decode,
                scrollManager = new Lampa.Scroll({'mask': true, 'over': true, 'scroll_by_item': true}),
                items = [],
                container = $('<div class="new-interface"><img class="full-start__background"></div>'),
                currentIndex = 0,
                isWide = Lampa.Platform.size() >= 166,
                nextItems,
                background,
                firstItems = dataSource.field('view') == 'view' || Lampa.Settings.get('card_views_type') == 'static',
                loaderElement = container.append('<div class="new-interface__content">'),
                lastImage = '',
                timeoutImage;

            // Метод для обновления отображения интерфейса
            this.init = function() {
                // Если источник данных равен 'torrents', добавляем дополнительный элемент
                if (dataSource.source == 'torrents') {
                    var button = $('<div class="selector">' + Lampa.Settings.get('new_interface_button_text') + '</div>');
                    button.on('hover:enter', function() {
                        Lampa.Storage.set('torrserver_use_link', 'cub');
                        Lampa.Activity.launch({ 'source': 'cub' });
                    });
                    var extraBlock = new Lampa.Component();
                    container.append(extraBlock.render(button));
                    this.activity = extraBlock.activity;
                    extraBlock.activity.hide();
                    this.toggle();
                }
            };

            this.loadNext = function() {
                if (this.next && !this.isLoading && items.length) {
                    this.next_wait = true;
                    this.next(function(item) {
                        currentIndex = 0;
                        item.append(container.find('.new-interface__content').html());
                        Lampa.Api.visible(items[currentIndex].render(true));
                    }, function() {
                        currentIndex = 0;
                    });
                }
            };

            this.addItem = function(item) {
                background = item;
                nextItems = new createInfoInterface(dataSource);
                nextItems.init();
                scrollManager.append(nextItems.render());
                item.slice(0, firstItems ? item.length : 2).forEach(function(itemData) {
                    container.append(nextItems.render(itemData));
                });
                if (isWide) {
                    Lampa.Api.update(container);
                    Lampa.Api.render(scrollManager.render(true));
                    scrollManager.onEnd = this.loadNext.bind(this);
                    scrollManager.onWheel = function(direction) {
                        if (!Lampa.Controller.check(this))
                            this.toggle();
                        if (direction > 0)
                            this.down();
                        else if (currentIndex > 0)
                            this.up();
                    };
                    this.activity.hide();
                    this.activity.toggle();
                }
            };

            this.changeBackground = function(item) {
                var imageUrl = Lampa.Api.img(item.poster, 'w500');
                clearTimeout(timeoutImage);
                if (imageUrl == lastImage)
                    return;
                timeoutImage = setTimeout(function() {
                    loaderElement.addClass('loaded');
                    loaderElement[0].onload = function() {
                        loaderElement.addClass('loaded');
                    };
                    loaderElement[0].onerror = function() {
                        loaderElement.addClass('loaded');
                    };
                    lastImage = imageUrl;
                    setTimeout(function() {
                        loaderElement[0].src = lastImage;
                    }, 50);
                }, 100);
            };

            this.setItem = function(item) {
                if (item.isRender)
                    return;
                item.isRender = true;
                var element = new Lampa.Item(item, {
                    'url': item.url,
                    'card_small': true,
                    'cardClass': item.cardClass,
                    'genres': dataSource.genres,
                    'object': dataSource,
                    'card_wide': Lampa.Settings.get('card_views_type') == 'wide_post',
                    'nomore': item.nomore
                });
                element.init();
                element.onSelect = this.select.bind(this);
                element.onBack = this.up.bind(this);
                element.onHover = function(itemData) {
                    nextItems.setInfo(itemData);
                    self.changeBackground(itemData);
                };
                element.onFocusMore = nextItems.render.bind(nextItems);
                scrollManager.append(element.render());
                items.push(element);
            };

            this.toggle = function() {
                Lampa.Controller.toggle();
            };

            this.down = function() {
                currentIndex++;
                currentIndex = Math.min(currentIndex, items.length - 1);
                if (!firstItems)
                    nextItems.setItem(items.slice(currentIndex, currentIndex + 2).map(function(item) {
                        return item.render();
                    }));
                items[currentIndex].toggle();
                scrollManager.append(items[currentIndex].render());
            };

            this.up = function() {
                currentIndex--;
                if (currentIndex < 0) {
                    currentIndex = 0;
                    Lampa.Controller.toggle('content');
                } else {
                    items[currentIndex].toggle();
                    scrollManager.append(items[currentIndex].render());
                }
            };

            this.controller = function() {
                Lampa.Controller.add('content', {
                    'link': this,
                    'toggle': function() {
                        if (!scrollManager.canRefresh())
                            items[currentIndex].toggle();
                    },
                    'update': function() {},
                    'left': function() {
                        if (Navigator.canmove('left'))
                            Navigator.move('left');
                        else
                            Lampa.Controller.toggle('back');
                    },
                    'right': function() {
                        Navigator.move('right');
                    },
                    'up': function() {
                        if (Navigator.canmove('up'))
                            Navigator.move('up');
                        else
                            Lampa.Controller.toggle('content');
                    },
                    'down': function() {
                        if (Navigator.canmove('down'))
                            Navigator.move('down');
                    },
                    'back': this.back.bind(this)
                });
                Lampa.Controller.toggle('content');
            };

            this.refresh = function() {
                this.activity.need_refresh = true;
                this.activity.show(true);
            };

            this.destroy = function() {
                scrollManager.destroy();
                Lampa.Api.destroy(items);
                scrollManager.destroy();
                if (nextItems)
                    nextItems.destroy();
                container.remove();
                items = null;
                scrollManager = null;
                background = null;
            };

            this.render = function() {
                return container;
            };
        }

        // Функция, перехватывающая создание нового источника данных для Lampa.
        function overrideDataSource() {
            var originalSource = Lampa.Api.source,
                interfaceCreator = createInterfaceList;
            Lampa.Api.source = function(data) {
                var type = data.source == 'torrents' || data.source == 'torrserver'
                    ? interfaceCreator
                    : originalSource;
                if (window.plugin_interface_ready < 0x2ff)
                    type = originalSource;
                if (Lampa.Platform.size() < 153)
                    type = originalSource;
                if (Lampa.Settings.screen('mobile'))
                    type = originalSource;
                return new type(data);
            };

            if (Lampa.Settings.get('wide_post') == true) {
                Lampa.Storage.set('style_interface', 'Стильный интерфейс');
                $('body').append(Lampa.Storage.get('style_interface', {}, true));
            } else {
                Lampa.Storage.add('new_interface_style', '\n            <style>\n                .new-interface .card--small.card--wide {\n                    width: 18.3em;\n                }\n                \n                .new-interface-info {\n                    position: relative;\n                    padding: 1.5em;\n                    height: 20.4em;\n                }\n                \n                .new-interface-info__body {\n                    width: 80%;\n                    padding-top: 0.2em;\n                }\n                \n                .new-interface-info__head {\n                    color: rgba(255, 255, 255, 0.6);\n                    margin-bottom: 0.3em;\n                    font-size: 1.3em;\n                    min-height: 1em;\n                }\n                \n                .new-interface-info__head span {\n                    color: #fff;\n                }\n                \n                .new-interface-info__title {\n                    font-size: 4em;\n                    font-weight: 600;\n                    margin-bottom: 0.2em;\n                    overflow: hidden;\n                    -o-text-overflow: \".\";\n                    text-overflow: \".\";\n                    display: -webkit-box;\n                    -webkit-line-clamp: 1;\n                    line-clamp: 1;\n                    -webkit-box-orient: vertical;\n                    margin-left: -0.03em;\n                    line-height: 1.3;\n                }\n                \n                .new-interface-info__details {\n                    margin-bottom: 1.6em;\n                    display: -webkit-box;\n                    display: -webkit-flex;\n                    display: -moz-box;\n                    display: -ms-flexbox;\n                    display: flex;\n                    -webkit-box-align: center;\n                    -webkit-align-items: center;\n                    -moz-box-align: center;\n                    -ms-flex-align: center;\n                    align-items: center;\n                    -webkit-flex-wrap: wrap;\n                    -ms-flex-wrap: wrap;\n                    flex-wrap: wrap;\n                    min-height: 1.9em;\n                    font-size: 1.3em;\n                }\n                \n                .new-interface-info__split {\n                    margin: 0 1em;\n                    font-size: 0.7em;\n                }\n                \n                .new-interface-info__description {\n                    font-size: 1.4em;\n                    font-weight: 310;\n                    line-height: 1.3;\n                    overflow: hidden;\n                    -o-text-overflow: \".\";\n                    text-overflow: \".\";\n                    display: -webkit-box;\n                    -webkit-line-clamp: 2;\n                    line-clamp: 2;\n                    -webkit-box-orient: vertical;\n                    width: 70%;\n                }\n                \n                .new-interface .card-more__box {\n                    padding-bottom: 150%;\n                }\n                \n                .new-interface .full-start__background {\n                    height: 108%;\n                    top: -5em;\n                }\n                \n                .new-interface .full-start__rate {\n                    font-size: 1.3em;\n                    margin-right: 0;\n                }\n                \n                .new-interface .card__promo {\n                    display: none;\n                }\n                \n                .new-interface .card.card--wide + .card-more .card-more__box {\n                    padding-bottom: 95%;\n                }\n                \n                .new-interface .card.card--wide.card-watched {\n                    display: none !important;\n                }\n                \n                body.light--version .new-interface-info__body {\n                    width: 69%;\n                    padding-top: 1.5em;\n                }\n                \n                body.light--version .new-interface-info {\n                    height: 25.3em;\n                }\n\n                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {\n                    animation: animation-card-focus 0.2s\n                }\n                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {\n                    animation: animation-trigger-enter 0.2s forwards\n                }\n            </style>\n        ');
                $('body').append(Lampa.Storage.get('new_interface_style', {}, true));
            }

            // Регистрация настроек для плагина
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'wide_post',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: 'Широкие постеры'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'logo_card_style',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: 'Логотип вместо названия'
                },
                onRender: function(item) {}
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'status',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: 'Показывать рейтинг фильма'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'seas',
                    type: 'toggle',
                    default: false
                },
                field: {
                    name: 'Показывать количество сезонов'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'eps',
                    type: 'toggle',
                    default: false
                },
                field: {
                    name: 'Показывать количество эпизодов'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'vremya',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: 'Показывать время фильма'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'genre',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: 'Показывать жанр фильма'
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'style_interface',
                param: {
                    name: 'translate',
                    type: 'toggle',
                    default: true
                },
                field: {
                    name: 'Показывать описание'
                }
            });
        }

        // Функция для установки защитных механизмов против отладки и подмены консольных методов
        function antiDebug() {
            var decodeFunc = decode;
            var protect = function(func) {
                var called = true;
                return function() {
                    if (called && func) {
                        var result = func.apply(null, arguments);
                        func = null;
                        return result;
                    }
                };
            };

            protect(function() {
                return Function("return this")();
            })();

            var originalConsole = (function() {
                try {
                    var fn = Function("return this.constructor('return window')()")();
                    return fn.console || {};
                } catch (e) {
                    return window;
                }
            })();

            var methods = ['log', 'warn', 'info', 'error', 'trace', 'assert'];
            for (var i = 0; i < methods.length; i++) {
                var originalMethod = antiDebug.caller;
                originalConsole[methods[i]] = protect(originalMethod);
            }
        }
        antiDebug();

        window.plugin_interface_ready = true;

        // Переопределение конструктора источника данных для Lampa
        var originalInterface = Lampa.Api.source;
        var newInterface = createInterfaceList;
        Lampa.Api.source = function(data) {
            var type = (data.source == 'torrents' || data.source == 'torrserver') ? newInterface : originalInterface;
            if (window.plugin_interface_ready < 0x2ff)
                type = originalInterface;
            if (Lampa.Platform.size() < 153)
                type = originalInterface;
            if (Lampa.Settings.screen('mobile'))
                type = originalInterface;
            return new type(data);
        };

        if (Lampa.Settings.get('wide_post') == true) {
            Lampa.Storage.set('new_interface_style', 'Стильный интерфейс');
            $('body').append(Lampa.Storage.get('new_interface_style', {}, true));
        } else {
            Lampa.Storage.add('new_interface_style', '\n            <style>\n                .new-interface .card--small.card--wide {\n                    width: 18.3em;\n                }\n                \n                .new-interface-info {\n                    position: relative;\n                    padding: 1.5em;\n                    height: 20.4em;\n                }\n                \n                .new-interface-info__body {\n                    width: 80%;\n                    padding-top: 0.2em;\n                }\n                \n                .new-interface-info__head {\n                    color: rgba(255, 255, 255, 0.6);\n                    margin-bottom: 0.3em;\n                    font-size: 1.3em;\n                    min-height: 1em;\n                }\n                \n                .new-interface-info__head span {\n                    color: #fff;\n                }\n                \n                .new-interface-info__title {\n                    font-size: 4em;\n                    font-weight: 600;\n                    margin-bottom: 0.2em;\n                    overflow: hidden;\n                    -o-text-overflow: \".\";\n                    text-overflow: \".\";\n                    display: -webkit-box;\n                    -webkit-line-clamp: 1;\n                    line-clamp: 1;\n                    -webkit-box-orient: vertical;\n                    margin-left: -0.03em;\n                    line-height: 1.3;\n                }\n                \n                .new-interface-info__details {\n                    margin-bottom: 1.6em;\n                    display: -webkit-box;\n                    display: -webkit-flex;\n                    display: -moz-box;\n                    display: -ms-flexbox;\n                    display: flex;\n                    -webkit-box-align: center;\n                    -webkit-align-items: center;\n                    -moz-box-align: center;\n                    -ms-flex-align: center;\n                    align-items: center;\n                    -webkit-flex-wrap: wrap;\n                    -ms-flex-wrap: wrap;\n                    flex-wrap: wrap;\n                    min-height: 1.9em;\n                    font-size: 1.3em;\n                }\n                \n                .new-interface-info__split {\n                    margin: 0 1em;\n                    font-size: 0.7em;\n                }\n                \n                .new-interface-info__description {\n                    font-size: 1.4em;\n                    font-weight: 310;\n                    line-height: 1.3;\n                    overflow: hidden;\n                    -o-text-overflow: \".\";\n                    text-overflow: \".\";\n                    display: -webkit-box;\n                    -webkit-line-clamp: 2;\n                    line-clamp: 2;\n                    -webkit-box-orient: vertical;\n                    width: 70%;\n                }\n                \n                .new-interface .card-more__box {\n                    padding-bottom: 95%;\n                }\n                \n                .new-interface .full-start__background {\n                    height: 108%;\n                    top: -5em;\n                }\n                \n                .new-interface .full-start__rate {\n                    font-size: 1.3em;\n                    margin-right: 0;\n                }\n                \n                .new-interface .card__promo {\n                    display: none;\n                }\n                \n                .new-interface .card.card--wide + .card-more .card-more__box {\n                    padding-bottom: 95%;\n                }\n                \n                .new-interface .card.card--wide.card-watched {\n                    display: none !important;\n                }\n                \n                body.light--version .new-interface-info__body {\n                    width: 69%;\n                    padding-top: 1.5em;\n                }\n                \n                body.light--version .new-interface-info {\n                    height: 25.3em;\n                }\n\n                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {\n                    animation: animation-card-focus 0.2s\n                }\n                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {\n                    animation: animation-trigger-enter 0.2s forwards\n                }\n            </style>\n        ');
            $('body').append(Lampa.Storage.get('new_interface_style', {}, true));
        }

        // Регистрация дополнительных параметров плагина в настройках Lampa
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'wide_post',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Широкие постеры'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'logo_card_style',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Логотип вместо названия'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'status',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Показывать рейтинг фильма'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'seas',
                type: 'toggle',
                default: false
            },
            field: {
                name: 'Показывать количество сезонов'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'eps',
                type: 'toggle',
                default: false
            },
            field: {
                name: 'Показывать количество эпизодов'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'vremya',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Показывать время фильма'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'genre',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Показывать жанр фильма'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'style_interface',
            param: {
                name: 'translate',
                type: 'toggle',
                default: true
            },
            field: {
                name: 'Показывать описание'
            }
        });
    })();
})();
