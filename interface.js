(function () {
    'use strict';
    // Проверка наличия Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Lampa is not defined. Ensure Lampa library is loaded.');
        return;
    }
    // Установка платформы на ТВ-режим
    Lampa.Platform.tv();
    // Класс для отображения информации о фильме/сериале
    function InterfaceInfo() {
        let $container, timeout, cache = {};
        const request = new Lampa.Reguest();
        // Инициализация контейнера
        this.create = function () {
            $container = $(`
                <div class="new-interface-info">
                    <div class="new-interface-info__body">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__details"></div>
                        <div class="new-interface-info__description"></div>
                    </div>
                </div>
            `);
        };
        // Обновление информации о фильме/сериале
        this.update = function (data) {
            if (!$container) {
                console.error('$container is not initialized. Ensure create() is called before update().');
                return;
            }
            if (typeof $ === 'undefined') {
                console.error('jQuery is not defined. Ensure jQuery is loaded before executing this script.');
                return;
            }
            if (!data || typeof data !== 'object') {
                console.error('Invalid data object provided to update:', data);
                return;
            }
            $container.find('.new-interface-info__head').html(data.overview || Lampa.Utils.full_notext());
            if (Lampa.Storage.get('logo_card_style') !== false) {
                const type = data.name ? 'tv' : 'movie';
                const apiKey = Lampa.TMDB.key();
                const url = Lampa.TMDB.api(`${type}/${data.id}?api_key=${apiKey}&language=${Lampa.Storage.get('language')}`);
                
                $.get(url, (response) => {
                    if (response && response.logos && response.logos[0]) {
                        const logoPath = response.logos[0].file_path;
                        if (logoPath) {
                            if (Lampa.Storage.get('desc') !== false) {
                                $container.find('.new-interface-info__title').html(
                                    `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 1.8em; max-width: 6.8em" src="${Lampa.TMDB.image(`t/p/w500${logoPath.replace('.svg', '.png')}`}"/>`
                                );
                            } else {
                                $container.find('.new-interface-info__title').html(
                                    `<img style="margin-top: 0.3em; margin-bottom: 0.1em; max-height: 2.8em; max-width: 6.8em" src="${Lampa.TMDB.image(`t/p/w500${logoPath.replace('.svg', '.png')}`}"/>`
                                );
                            }
                        } else {
                            console.log('No logo found, using title:', data.title);
                            const titleText = typeof data.title === 'string' && data.title ? data.title : 'Без названия';
                            $container.find('.new-interface-info__title').html(titleText);
                        }
                    } else {
                        console.log('No logos in response, using title:', data.title);
                        const titleText = typeof data.title === 'string' && data.title ? data.title : 'Без названия';
                        $container.find('.new-interface-info__title').html(titleText);
                    }
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.error('Failed to fetch TMDB data:', textStatus, errorThrown);
                    const titleText = typeof data.title === 'string' && data.title ? data.title : 'Без названия';
                    $container.find('.new-interface-info__title').html(titleText);
                });
            } else {
                console.log('logo_card_style is disabled, using title:', data.title);
                const titleText = typeof data.title === 'string' && data.title ? data.title : 'Без названия';
                $container.find('.new-interface-info__title').html(titleText);
            }
            Lampa.Layer.update(data.backdrop_path, 'w200');
            this.draw(data);
        };
        // Отрисовка деталей (год, рейтинг, жанры, продолжительность и т.д.)
        this.draw = function (data) {
            const year = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
            const rating = parseFloat((data.vote_average || 0) + '').toFixed(1);
            const genres = Lampa.Api.genres.translate(data);
            const countries = Lampa.Api.genres.parseCountries(data);
            const details = [];
            const meta = [];
            if (year !== '0000') details.push(`<span class="full-start__pg" style="font-size: 0.9em">${year}</span>`);
            if (genres.length > 0) details.push(genres.join(', '));
            if (Lampa.Storage.get('rat') !== false && rating > 0) {
                meta.push(`<div class="full-start__rate"><div>${rating}</div><div>TMDB</div></div>`);
            }
            if (Lampa.Storage.get('ganr') !== false && data.genres && data.genres.length > 0) {
                meta.push(data.genres.map(genre => Lampa.Utils.capitalizeFirstLetter(genre.name)).join(', '));
            }
            if (Lampa.Storage.get('vremya') !== false && data.runtime) {
                meta.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
            }
            if (Lampa.Storage.get('seas') !== false && data.number_of_seasons) {
                meta.push(`<span class="full-start__pg" style="font-size: 0.9em">Сезонов ${data.number_of_seasons}</span>`);
            }
            if (Lampa.Storage.get('eps') !== false && data.number_of_episodes) {
                meta.push(`<span class="full-start__pg" style="font-size: 0.9em">Эпизодов ${data.number_of_episodes}</span>`);
            }
            if (Lampa.Storage.get('year_ogr') !== false && countries) {
                meta.push(`<span class="full-start__status" style="font-size: 0.9em">${countries}</span>`);
            }
            if (Lampa.Storage.get('status') !== false && data.status) {
                let statusText = '';
                switch (data.status.toLowerCase()) {
                    case 'released': statusText = 'Выпущенный'; break;
                    case 'ended': statusText = 'Закончен'; break;
                    case 'returning series': statusText = 'Онгоинг'; break;
                    case 'canceled': statusText = 'Отменено'; break;
                    case 'in production': statusText = 'В производстве'; break;
                    case 'planned': statusText = 'Запланировано'; break;
                    case 'post production': statusText = 'Скоро'; break;
                    default: statusText = data.status; break;
                }
                if (statusText) meta.push(`<span class="full-start__status" style="font-size: 0.9em">${statusText}</span>`);
            }
            $container.find('.new-interface-info__details').empty().append(details.join(', '));
            $container.find('.new-interface-info__description').html(meta.join('<span class="new-interface-info__split">&#9679;</span>'));
        };
        // Загрузка дополнительных данных
        this.load = function (data) {
            clearTimeout(timeout);
            const type = data.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(`${type}/${data.id}/content_ratings?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates&language=${Lampa.Storage.get('language')}`);
            if (cache[url]) return this.draw(cache[url]);
            timeout = setTimeout(() => {
                request.clear();
                request.timeout(5000);
                request.silent(url, (response) => {
                    cache[url] = response;
                    this.draw(response);
                });
            }, 300);
        };
        this.render = () => $container;
        this.clear = () => {};
        this.destroy = function () {
            $container.remove();
            cache = {};
            $container = null;
        };
    }
    // Класс для управления интерфейсом карточек
    function InterfaceMain(params) {
        const activity = new Lampa.Activity();
        const scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        const $container = $(`<div class="new-interface"><img class="full-start__background"></div>`);
        let items = [], index = 0, timeout, backgroundCache = '';
        const isWide = Lampa.Storage.field('wide_post') === 'true' || Lampa.Storage.field('card_views_type') === 'compact';
        const isModern = Lampa.Manifest.app_digital >= 166;
        const $background = $container.find('.full-start__background');
        let interfaceInfo;
        this.create = () => {};
        this.render = () => $container;
        this.load = function (results) {
            interfaceInfo = new InterfaceInfo(params);
            interfaceInfo.create();
            scroll.minus(interfaceInfo.render());
            results.slice(0, isWide ? results.length : 2).forEach(this.append.bind(this));
            $container.append(interfaceInfo.render());
            $container.append(scroll.render());
            if (isModern) {
                Lampa.Layer.update($container);
                Lampa.Layer.visible(scroll.render(true));
                scroll.onWheel = this.loadNext.bind(this);
                scroll.onFocusMore = (direction) => {
                    if (!Lampa.Controller.enabled(this)) this.start();
                    if (direction > 0) this.down();
                    else if (index > 0) this.up();
                };
            }
            this.activity.toggle(false);
            this.activity.start();
        };
        this.loadNext = function () {
            if (this.next && !this.next_wait && items.length) {
                this.next_wait = true;
                this.next((results) => {
                    this.next_wait = false;
                    results.forEach(this.append.bind(this));
                    Lampa.Layer.visible(items[index + 1].render(true));
                }, () => { this.next_wait = false; });
            }
        };
        this.append = function (item) {
            if (item.ready) return;
            item.ready = true;
            const card = new Lampa.InteractionLine(item, {
                url: item.url,
                card_small: true,
                cardClass: item.cardClass,
                genres: params.genres,
                object: params,
                card_wide: Lampa.Storage.field('wide_post'),
                nomore: item.nomore
            });
            card.create();
            card.onFocus = (data) => {
                interfaceInfo.update(data);
                this.background(data);
            };
            card.onHover = (data) => {
                interfaceInfo.update(data);
                this.background(data);
            };
            card.onMore = this.onMore ? this.onMore.bind(this) : null;
            card.onUp = this.up.bind(this);
            card.onBack = this.onBack.bind(this);
            card.onToggle = () => { index = items.indexOf(card); };
            card.clear = interfaceInfo.clear.bind(interfaceInfo);
            scroll.append(card.render());
            items.push(card);
        };
        this.background = function (data) {
            const path = Lampa.Api.backdrop_path(data.backdrop_path, 'w1280');
            if (path === backgroundCache) return;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                $background.removeClass('loaded');
                $background[0].onload = () => $background.addClass('loaded');
                $background[0].onerror = () => $background.removeClass('loaded');
                backgroundCache = path;
                setTimeout(() => { $background[0].src = path; }, 50);
            }, 100);
        };
        this.start = function () {
            Lampa.Activity.listener('menu', {
                link: this,
                toggle: () => {
                    if (this.activity.canRefresh()) return false;
                    if (items.length) items[index].toggle();
                },
                update: () => {},
                left: () => {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: () => { Navigator.move('right'); },
                up: () => {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('menu');
                },
                down: () => { if (Navigator.canmove('down')) Navigator.move('down'); },
                back: this.onBack
            });
            Lampa.Controller.toggle('menu');
        };
        this.up = function () {
            index--;
            if (index < 0) {
                index = 0;
                Lampa.Controller.toggle('menu');
            } else {
                items[index].toggle();
                scroll.update(items[index].render());
            }
        };
        this.down = function () {
            index++;
            index = Math.min(index, items.length - 1);
            if (!isWide) this.load(params.results.slice(0, index + 2));
            items[index].toggle();
            scroll.update(items[index].render());
        };
        this.onBack = () => { Lampa.Activity.backward(); };
        this.refresh = () => { this.activity.toggle(true); this.activity.need_refresh = true; };
        this.pause = () => {};
        this.stop = () => {};
        this.destroy = function () {
            activity.stop();
            Lampa.Arrays.destroy(items);
            scroll.destroy();
            if (interfaceInfo) interfaceInfo.destroy();
            $container.remove();
            items = null;
            activity = null;
        };
    }
    // Определение, какой класс использовать для интерфейса
    const defaultInteraction = Lampa.InteractionMain;
    Lampa.InteractionMain = function (params) {
        let interaction = defaultInteraction;
        if (window.innerWidth < 767 || Lampa.Manifest.app_digital < 153 || Lampa.Platform.screen('mobile') || params.name === 'main') {
            interaction = defaultInteraction;
        }
        return new interaction(params);
    };
    // Добавление стилей для нового интерфейса
    if (Lampa.Storage.get('wide_post') === true) {
        Lampa.Template.add('new_interface_style', `
            <style>
                .new-interface .card--small.card--wide { width: 18.3em; }
                .new-interface-info { position: relative; padding: 1.5em; height: 26em; }
                .new-interface-info__body { width: 80%; padding-top: 1.1em; }
                .new-interface-info__head { color: rgba(255, 255, 255, 0.6); margin-bottom: 1em; font-size: 1.3em; min-height: 1em; }
                .new-interface-info__head span { color: #fff; }
                .new-interface-info__title { font-size: 4em; font-weight: 600; margin-bottom: 0.3em; overflow: hidden; text-overflow: "."; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; margin-left: -0.03em; line-height: 1.3; }
                .new-interface-info__details { margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; min-height: 1.9em; font-size: 1.3em; }
                .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
                .new-interface-info__description { font-size: 1.4em; font-weight: 310; line-height: 1.3; overflow: hidden; text-overflow: "."; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; width: 65%; }
                .new-interface .card-more__box { padding-bottom: 95%; }
                .new-interface .full-start__background { height: 108%; top: -5em; }
                .new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }
                .new-interface .card__promo { display: none; }
                .new-interface .card.card--wide+.card-more .card-more__box { padding-bottom: 95%; }
                .new-interface .card.card--wide .card-watched { display: none !important; }
                body.light--version .new-interface-info__body { width: 69%; padding-top: 1.5em; }
                body.light--version .new-interface-info { height: 25.3em; }
                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            </style>
        `);
        $('[data-component="style_interface"]').append(Lampa.Template.get('new_interface_style', {}, true));
    } else {
        Lampa.Template.add('new_interface_style', `
            <style>
                .new-interface .card--small.card--wide { width: 18.3em; }
                .new-interface-info { position: relative; padding: 1.5em; height: 20.4em; }
                .new-interface-info__body { width: 80%; padding-top: 0.2em; }
                .new-interface-info__head { color: rgba(255, 255, 255, 0.6); margin-bottom: 0.3em; font-size: 1.3em; min-height: 1em; }
                .new-interface-info__head span { color: #fff; }
                .new-interface-info__title { font-size: 4em; font-weight: 600; margin-bottom: 0.2em; overflow: hidden; text-overflow: "."; display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; margin-left: -0.03em; line-height: 1.3; }
                .new-interface-info__details { margin-bottom: 1.6em; display: flex; align-items: center; flex-wrap: wrap; min-height: 1.9em; font-size: 1.3em; }
                .new-interface-info__split { margin: 0 1em; font-size: 0.7em; }
                .new-interface-info__description { font-size: 1.4em; font-weight: 310; line-height: 1.3; overflow: hidden; text-overflow: "."; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; width: 70%; }
                .new-interface .card-more__box { padding-bottom: 150%; }
                .new-interface .full-start__background { height: 108%; top: -5em; }
                .new-interface .full-start__rate { font-size: 1.3em; margin-right: 0; }
                .new-interface .card__promo { display: none; }
                .new-interface .card.card--wide+.card-more .card-more__box { padding-bottom: 95%; }
                .new-interface .card.card--wide .card-watched { display: none !important; }
                body.light--version .new-interface-info__body { width: 69%; padding-top: 1.5em; }
                body.light--version .new-interface-info { height: 25.3em; }
                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view { animation: animation-card-focus 0.2s; }
                body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view { animation: animation-trigger-enter 0.2s forwards; }
            </style>
        `);
        $('[data-component="style_interface"]').append(Lampa.Template.get('new_interface_style', {}, true));
    }
    // Настройки интерфейса
    Lampa.Settings.listener.follow('open', (e) => {
        if (e.name === 'main') {
            if (Lampa.Settings.main().render().find('.selector').length === 0) {
                Lampa.SettingsApi.addComponent({
                    component: 'style_interface',
                    name: 'Настройки элементов'
                });
            }
            Lampa.Settings.main().update();
            Lampa.Settings.main().render().find('.selector').removeClass('hide');
        }
    });
    // Добавление параметров настроек
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'new_interface_style', type: 'trigger', default: true },
        field: { name: 'Стильный интерфейс', description: 'Стильный интерфейс' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'wide_post', type: 'trigger', default: true },
        field: { name: 'Широкие постеры' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'logo_card_style', type: 'trigger', default: true },
        field: { name: 'Логотип вместо названия' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'desc', type: 'trigger', default: true },
        field: { name: 'Показывать описание' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'status', type: 'trigger', default: true },
        field: { name: 'Показывать статус фильма/сериала' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'seas', type: 'trigger', default: false },
        field: { name: 'Показывать количество сезонов' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'eps', type: 'trigger', default: false },
        field: { name: 'Показывать количество эпизодов' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'year_ogr', type: 'trigger', default: true },
        field: { name: 'Показывать возрастное ограничение' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'vremya', type: 'trigger', default: true },
        field: { name: 'Показывать время фильма' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'ganr', type: 'trigger', default: true },
        field: { name: 'Показывать жанр фильма' }
    });
    Lampa.SettingsApi.addParam({
        component: 'style_interface',
        param: { name: 'rat', type: 'trigger', default: true },
        field: { name: 'Показывать рейтинг фильма' }
    });
    // Инициализация настроек по умолчанию
    const initSettings = () => {
        Lampa.Storage.set('int_plug', 'true');
        Lampa.Storage.set('wide_post', 'true');
        Lampa.Storage.set('logo_card_style', 'true');
        Lampa.Storage.set('desc', 'true');
        Lampa.Storage.set('status', 'true');
        Lampa.Storage.set('seas', 'false');
        Lampa.Storage.set('eps', 'false');
        Lampa.Storage.set('year_ogr', 'true');
        Lampa.Storage.set('vremya', 'true');
        Lampa.Storage.set('ganr', 'true');
        Lampa.Storage.set('rat', 'true');
    };
    // Проверка готовности платформы Lampa и запуск настроек
    const interval = setInterval(() => {
        if (typeof Lampa !== 'undefined') {
            clearInterval(interval);
            if (Lampa.Storage.get('int_plug', 'false') !== 'false') {
                initSettings();
            }
        }
    }, 200);
    // Установка флага плагина
    if (!window.plugin_interface_ready) {
        window.plugin_interface_ready = true;
    }
})();
