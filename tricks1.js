(function() {
    'use strict';
    
    Lampa.Platform.tv();
    
    function onAppReady(callback) {
        if (window.appready) {
            callback();
        } else if (Lampa.Listener && typeof Lampa.Listener.on === 'function') {
            Lampa.Listener.on('appready', function(event) {
                if (event.status === 'ready') {
                    callback();
                }
            });
        } else {
            document.addEventListener('DOMContentLoaded', function(){
                callback();
            });
        }
    }
    
    (function initPluginModule() {
        function setupPlugin() {
            var $pluginButton = $('<div class="settings-folder" style="padding:0!important">' +
                '<div style="width:2.2em;height:1.7em;padding-right:.5em">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">' +
                '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.071 33V15h5.893c3.331 0 6.032 2.707 6.032 6.045s-2.7 6.045-6.032 6.045h-5.893m5.893 0l5.892 5.905m3.073-11.92V28.5a4.5 4.5 0 0 0 4.5 4.5h0a4.5 4.5 0 0 0 4.5-4.5v-7.425m0 7.425V33"/>' +
                '<rect width="37" height="37" x="5.5" y="5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" rx="4" ry="4"/>' +
                '</svg></div>' +
                '<div style="font-size:1.3em">Русское</div>' +
                '</div>');
            $pluginButton.on('hover:enter', function() {
                var menuItems = [
                    { title: 'Русские новинки' },
                    { title: 'Популярное' },
                    { title: 'Русское' }
                ];
                Lampa.Activity.show({
                    title: Lampa.Lang.translate('settings_rest_source'),
                    items: menuItems,
                    onSelect: function(selectedItem) {
                        if (selectedItem.title === 'Русские новинки') {
                            Lampa.Activity.push({
                                url: '/movie/russian/new',
                                title: 'Русские новинки',
                                component: 'category_full',
                                source: 'tmdb',
                                card_type: 'true',
                                page: 1
                            });
                        } else if (selectedItem.title === 'Популярное') {
                            Lampa.Activity.push({
                                url: '/movie/russian/trending',
                                title: 'Популярное',
                                component: 'category_full',
                                source: 'tmdb',
                                card_type: 'true',
                                page: 1,
                                sort_by: 'first_air_date.desc'
                            });
                        } else if (selectedItem.title === 'Русское') {
                            Lampa.Activity.push({
                                url: '/movie/russian',
                                title: 'Русское',
                                component: 'category_full',
                                source: 'tmdb',
                                card_type: 'true',
                                page: 1
                            });
                        }
                    },
                    onBack: function() {
                        Lampa.Controller.back('settings');
                    }
                });
            });
            $('div[data-name="interface_menu"]').eq(0).append($pluginButton);
        }
        onAppReady(setupPlugin);
    }());
    
    (function initCardsModule() {
        function initializeCards() {
            window.appready = true;
            function processCard(cardData) {
                var card = cardData.card || cardData;
                var nextEpisode = cardData.next_episode_to_air || cardData.episode || {};
                if (card.source === undefined) {
                    card.source = 'tmdb';
                }
                Lampa.Utils.processCard(card, {
                    title: card.name,
                    original_title: card.original_name,
                    release_date: card.release_date
                });
                card.year = (card.date || 'tmdb').toString().substr(0, 4);
            }
            function Card() {
                this.cardElement = document.createElement('div');
                this.cardElement.classList.add('card');
                this.cardElement.addEventListener('focus', function() {});
                this.cardElement.addEventListener('mouseenter', function() {});
                this.destroy = function() {
                    this.cardElement.innerHTML = '';
                };
                this.getElement = function(asJQuery) {
                    return asJQuery ? this.cardElement : $(this.cardElement);
                };
            }
            Lampa.Api.add({
                component: 'plugin_tmdb_mod_ready',
                param: {
                    name: 'Русские новинки на главной',
                    type: 'boolean',
                    default: true
                },
                field: {
                    name: 'Настройки плагина',
                    description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить'
                },
                onRender: function() {
                    setTimeout(function() {
                        $('div[data-name="interface_size"]').addClass('custom-class');
                    }, 0);
                }
            });
            if (Lampa.Storage.get('plugin_tmdb_mod_ready') !== true) {
                if (!window.appready)
                    initializeCards();
            }
        }
        onAppReady(initializeCards);
    }());
    
    (function initApiModule() {
        function initializeApi() {
            window.apiModuleReady = true;
            function processApiCard(cardData) {
                if (cardData.poster_path)
                    cardData.img_poster = Lampa.Api.getImage(cardData.poster_path);
                else if (cardData.backdrop_path)
                    cardData.img_poster = Lampa.Api.getImage(cardData.backdrop_path);
                else
                    cardData.img_poster = './img/img_broken.svg';
                if (typeof cardData.air_date === 'string')
                    cardData.air_date = new Date(cardData.air_date).toISOString();
            }
            function ApiHandler(options) {
                this.network = new Lampa.Request();
                this.main = function() {
                    var handlers = [
                        function(callback) {
                            this.get('movie/popular', options, function(response) {
                                response.title = Lampa.Lang.translate('Популярное');
                                callback(response);
                            }.bind(this), callback);
                        }.bind(this),
                        function(callback) {
                            callback({
                                source: 'tmdb',
                                results: Lampa.Api.getResults().slice(0, 20),
                                title: Lampa.Lang.translate('Новые поступления'),
                                nomore: true,
                                cardClass: function(data, extra) {
                                    return new Card(data, extra);
                                }
                            });
                        }
                    ];
                    var totalHandlers = handlers.length + 1;
                    Lampa.Api.processHandlers(handlers, 6, 'all', totalHandlers);
                };
            }
            var apiHandlerInstance = new ApiHandler(Lampa.Api.getParams());
            Object.assign(Lampa.Api.modules.tmdb, apiHandlerInstance);
        }
        onAppReady(initializeApi);
    }());
    
    function getObfuscatedStrings() {
        return [
            'appready',
            'addParam',
            'СТС',
            'cub',
            'plugin_tmdb_mod_ready',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.863 5.537..."/></svg></div><div style="font-size:1.3em">ИВИ</div></div>',
            '.full-episode__img img',
            'Arrays',
            '1191',
            '389664iZImni',
            'Premier',
            'Wink',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M23.084 8.47h.373c.347 0 .55.174.55.444c0 .256-.19.463-.533.463h-.114v.357h-.276zm.643.455c0-.132-.1-.202-.243-.202h-.124v.408h.125c.143 0 .242-.074.242-.206m-1.646-.202h-.37v-.252h1.013v.252h-.368v1.01h-.275zm-.827 1.01l-.112-.308h-.472l-.108.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.534h.319l-.16-.44ZM19.04 8.47h.792v.249h-.516v.262h.472v.228h-.472v.276h.516v.248h-.792Zm-1.078.252h-.37V8.47h1.013v.252h-.369v1.01h-.274zm-1.993.38a.64.64 0 0 1 .652-.66c.37 0 .652.277.652.66c0 .382-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.26-.18-.407-.372-.407c-.193 0-.372.148-.372.406c0 .261.18.409.372.409c.191 0 .372-.15.372-.409m-1.768.125h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM12.71 8.47h.263v.848h.001l.581-.848h.266v1.263h-.262v-.859h-.002l-.582.859h-.264zm-.8 1.263l-.475-.601v.6h-.276v-1.26h.276v.592l.472-.592h.324l-.505.623l.515.64zm-1.82-.643h.493v.208h-.493Zm-.852.137h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM6.722 8.47h.263v.848h.001l.581-.848h.266v1.263H7.57v-.859h-.002l-.582.859h-.264zm.564-.114c-.178 0-.326-.09-.326-.305h.194c0 .104.04.16.132.16c.091 0 .132-.057.132-.16h.193c.001.216-.146.305-.325.305M5.953 9.734l-.111-.309H5.37l-.109.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.535h.319l-.16-.44Zm-2.033.303c.15 0 .211-.095.211-.322v-.71h.867v1.263h-.276v-1.01h-.322v.453c0 .402-.139.566-.48.566zm-.841-.274h-.517v.506h-.276V8.47h.276v.506h.517V8.47h.274v1.263H2.57ZM.007 9.102a.64.64 0 0 1 .652-.66a.64.64 0 0 1 .652.66c0 .383-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.259-.181-.406-.372-.406c-.193 0-.373.148-.373.406c0 .261.182.409.373.409s.372-.15.372-.409m6.857 1.66v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074zm-7.841-1.3v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074z',
            'Manifest',
            'image',
            'search',
            'bind',
            'exception',
            '3923',
            'card_episode',
            'category_full',
            'title_trend_week',
            'trace',
            '(((.+)+)+)+$',
            'trigger',
            'onerror',
            'Utils',
            'discover/tv?with_networks=2493&sort_by=first_air_date.desc',
            'app',
            '</div><div class="menu__text">Русское</div></li>',
            'console',
            'slice',
            'show',
            'forEach',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12.049 0C5.45 0 .104 5.373.104 12S5.45 24 12.049 24c3.928 0 7.414-1.904 9.592-4.844l-9.803-5.174l6.256 6.418h-3.559l-4.373-6.086V20.4h-2.89V3.6h2.89v6.095L14.535 3.6h3.559l-6.422 6.627l9.98-5.368C19.476 1.911 15.984 0 12.05 0zm10.924 7.133l-9.994 4.027l10.917-.713a12 12 0 0 0-.923-3.314m-10.065 5.68l10.065 4.054c.458-1.036.774-2.149.923-3.314z',
            '.full-episode__img',
            'onload',
            'innerText',
            '.card__title',
            'wide',
            'line_type',
            'title',
            'title_trend_day',
            'first_air_date.desc',
            'get',
            'substr',
            'error',
            'sources',
            'translate',
            'TimeTable',
            'discover/tv?with_networks=3827&sort_by=first_air_date.desc',
            '.card__img',
            'Русские мультфильмы',
            'top',
            'name',
            '0000',
            'onEnter',
            'original_name',
            'Controller',
            'insertAfter',
            'lately',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-button-tv" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>1020</title><defs></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M14.338,3.045 L9.008,4.047 L3.647,3.045 C2.195,3.045 1.016,4.373 1.016,6.011 L1.016,11.034 C1.016,12.672 2.195,14 3.647,14 L9.008,12.969 L14.338,14 C15.79,14 16.969,12.672 16.969,11.034 L16.969,6.011 C16.969,4.373 15.79,3.045 14.338,3.045 L14.338,3.045 Z M8.024,7.016 L6.026,7.016 L6.026,11.047 L4.964,11.047 L4.964,7.016 L2.984,7.016 L2.984,6 L8.024,6 L8.024,7.016 L8.024,7.016 Z M13.086,11.033 L11.959,11.033 L9.962,5.965 L11.262,5.965 L12.53,9.631 L13.761,5.965 L15.055,5.965 L13.086,11.033 L13.086,11.033 Z" fill="#ffffff" class="si-glyph-fill"></path></g></g></svg></div><div style="font-size:1.3em">СТС</div></div>',
            '.full-episode__num',
            'KION',
            'genres',
            'hover:focus',
            'discover/tv?with_networks=3871&sort_by=first_air_date.desc',
            'toISOString',
            'promo',
            'discover/tv?with_original_language=ru&sort_by=first_air_date.desc',
            'prototype',
            'onFocus',
            'Listener',
            'true',
            'addEventListener',
            'classList',
            'discover/tv',
            'trending/movie/day',
            'extend',
            'discover/tv?with_networks=806&sort_by=first_air_date.desc',
            'img_episode',
            'ready',
            'hover:hover',
            'title_upcoming',
            'partPersons',
            'discover/tv?with_networks=5806&sort_by=first_air_date.desc',
            'discover/tv?with_networks=1191&sort_by=first_air_date.desc',
            'onHover',
            'img',
            'Activity',
            'OKKO',
            'trending/movie/week',
            '4676462pxihnT',
            'toggle',
            'interface',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M2.185 6.758c-1.495 0-2.193.849-2.193 2.171v1.534c0 1.373.246 1.959 1.235 2.58l.763.474c.618.374.698.651.698 1.453v1.354c0 .393-.18.636-.521.636c-.342 0-.522-.228-.522-.636v-2.125H-.008v2.14c0 1.338.683 2.17 2.159 2.17c1.526 0 2.224-.882 2.224-2.17v-1.666c0-1.272-.326-1.927-1.265-2.529l-.763-.49c-.537-.342-.668-.586-.668-1.469v-1.24c0-.394.18-.637.503-.637c.341 0 .537.247.537.636v2.105h1.656V8.93c0-1.307-.698-2.17-2.19-2.17m2.711.162v1.635h1.17v9.797h1.687V8.555h1.17V6.92zm5.066 0l-.943 11.427h1.672l.23-3.053h1.227l.23 3.053h1.706l-.94-11.427Zm4.985 0v11.427h1.687v-4.78h1.024v3.917c0 .652.276.863.276.863h1.687c.004.004-.272-.207-.272-.863v-2.972c0-.949-.357-1.47-1.22-1.65v-.197c.86-.131 1.3-.768 1.3-1.797V8.929c0-1.257-.747-2.009-2.193-2.009zm5.02 0v1.635h1.169v9.797h1.687V8.555h1.17V6.92zm-8.529 1.55h.2l.399 5.274h-.997zm5.2.004h.437c.522 0 .667.212.667 1.06v1.419c0 .817-.18 1.06-.732 1.06h-.372z',
            '?cat=movie&airdate=2023-2025&without_genres=16&language=ru',
            'visible',
            '?cat=movie&airdate=2020-2025&genre=16&language=ru',
            'warn',
            'hover:enter',
            '.menu .menu__list',
            'w300',
            'release_date',
            '19981768gXjiTI',
            'SettingsApi',
            'small',
            'Select',
            'toString',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M10.63 11.11a1.16 1.16 0 0 1-.81.77A4 4 0 0 1 8.2 12c-.11 0-.15 0-.15-.16V9.4c0-.09 0-.17.12-.17q.712-.01 1.42.07a1.3 1.3 0 0 1 1.04 1.81"/></svg></div><div style="font-size:1.3em">Premier</div></div>',
            'source',
            'build',
            '<li class="menu__item selector" data-action="ru_movie"><div class="menu__ico">',
            'Noty',
            'discover/movie?with_genres=',
            '2493',
            'insert',
            'Русские фильмы',
            'add',
            'discover/movie?vote_average.gte=5&vote_average.lte=9&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=',
            'push',
            '4659100MYqKNX',
            '{}.constructor("return this")( )',
            'profile_path',
            'onVisible',
            'discover/tv?&with_original_language=ru',
            'rus_movie_main',
            'info',
            'title_upcoming_episodes',
            'discover/tv?with_networks=3923&sort_by=first_air_date.desc',
            'log',
            'release_year',
            '.full-episode__name',
            'discover/tv?with_networks=2859&sort_by=first_air_date.desc',
            'title_popular_movie',
            '----',
            '__proto__',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.698 9.692a3.286 3.286 0 0 0-3.293 3.285a3.285 3.285 0 0 0 3.293 3.278c1.824 0 3.302-1.462 3.302-3.278a3.29 3.29 0 0 0-3.302-3.285m-.008 5.191c-1.01 0-1.84-.895-1.84-1.906c0-1.018.83-1.913 1.84-1.913c1.018 0 1.848.895 1.848 1.913c0 1.01-.83 1.906-1.848 1.906',
            'Lang',
            'follow',
            '440852anfiFh',
            'menu',
            'unwatched',
            'title_top_movie',
            'promo_title',
            'poster',
            'movie',
            'apply',
            '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.071 33V15h5.893c3.331 0 6.032 2.707 6.032 6.045s-2.7 6.045-6.032 6.045h-5.893m5.893 0l5.892 5.905m3.073-11.92V28.5a4.5 4.5 0 0 0 4.5 4.5h0a4.5 4.5 0 0 0 4.5-4.5v-7.425m0 7.425V33"/>' +
            '<rect width="37" height="37" x="5.5" y="5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" rx="4" ry="4"/>' +
            '</svg></div><div style="font-size:1.3em">Русские фильмы</div></div>',
            'still_path',
            'remove',
            '36aYBIGS'
        ];
    }
}());
