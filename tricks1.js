(function () {
  'use strict';

  Lampa.Platform.tv();

  function onAppReady(callback) {
    if (window.appready) {
      callback();
    } else if (Lampa.Listener && typeof Lampa.Listener.on === 'function') {
      Lampa.Listener.on('appready', function (event) {
        if (event.status === 'ready') {
          callback();
        }
      });
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        callback();
      });
    }
  }

  // Модуль добавления пункта меню "Русское"
  (function initPluginModule() {
    function addMenuItem() {
      var $menuItem = $(
        '<li class="menu__item selector" data-action="rus">' +
          '<div class="menu__ico">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 16 16">' +
              '<g fill="currentColor">' +
                '<path d="M3.577 8.9v.03h1.828V5.898h-.062a47 47 0 0 0-1.766 3.001z"/>' +
                '<path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm2.372 3.715l.435-.714h1.71v3.93h.733v.957h-.733V11H5.405V9.888H2.5v-.971c.574-1.077 1.225-2.142 1.872-3.202m7.73-.714h1.306l-2.14 2.584L13.5 11h-1.428l-1.679-2.624l-.615.7V11H8.59V5.001h1.187v2.686h.057L12.102 5z"/>' +
              '</g>' +
            '</svg>' +
          '</div>' +
          '<div class="menu__text">Русское</div>' +
        '</li>'
      );
      $menuItem.on('hover:enter', function () {
        var activity = {
          url: '/movie/russian',
          title: 'Русское',
          component: 'category_full',
          source: 'tmdb',
          card_type: 'true',
          page: 1
        };
        Lampa.Activity.push(activity);
      });
      var $container = $('.menu .menu__list').eq(0);
      if ($container.length === 0) {
        $container = $(document.body);
      }
      $container.append($menuItem);
    }

    if (window.appready) {
      addMenuItem();
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          addMenuItem();
        }
      });
    }
  }());

  // Модуль работы с карточками
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
        this.cardElement.addEventListener('focus', function () {});
        this.cardElement.addEventListener('mouseenter', function () {});
        this.destroy = function () {
          this.cardElement.innerHTML = '';
        };
        this.getElement = function (asJQuery) {
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
        onRender: function () {
          setTimeout(function () {
            $('div[data-name="interface_size"]').addClass('custom-class');
          }, 0);
        }
      });
      if (Lampa.Storage.get('plugin_tmdb_mod_ready') !== true) {
        if (!window.appready) initializeCards();
      }
    }
    onAppReady(initializeCards);
  }());

  // Модуль работы с API
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
        this.main = function () {
          var handlers = [
            function (callback) {
              this.get('movie/popular', options, function (response) {
                response.title = Lampa.Lang.translate('Популярное');
                callback(response);
              }.bind(this), callback);
            }.bind(this),
            function (callback) {
              callback({
                source: 'tmdb',
                results: Lampa.Api.getResults().slice(0, 20),
                title: Lampa.Lang.translate('Новые поступления'),
                nomore: true,
                cardClass: function (data, extra) {
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
