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
            var $container = $('div[data-name="interface_menu"]');
            if ($container.length === 0) {
                $container = $(document.body);
            }
            $container.eq(0).append($pluginButton);
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
}());
