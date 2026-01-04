;(function () {
  'use strict';

  Lampa.Platform.tv();

  ;(function () {
    function initRussianPlugin() {
      var russianMenuIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';

      var today = new Date().toISOString().substr(0, 10);

      var russianCategories = [
        { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + today },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', request: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=' + today },
        { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + today },
        { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'ИВИ', img: 'https://bylampa.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today },
        { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today },
      ];

      function russianCategoryComponent(data) {
        var category = Lampa.Maker.make('Category', data);

        category.use({
          onCreate: function () {
            this.body.addClass('mapping--grid');
            this.body.addClass('cols--5');

            setTimeout(() => {
              var results = russianCategories.map(item => ({
                title: item.title,
                img: item.img,
                data: {
                  url: item.request,
                  title: item.title,
                  component: 'category_full',
                  source: 'tmdb',
                  page: 1,
                },
              }));

              this.build({ results: results });
              $('.card', this.body).css('text-align', 'center');
            }, 100);
          },

          onInstance: function (instance, cardData) {
            instance.use({
              onlyEnter: function () {
                if (cardData && cardData.data) {
                  Lampa.Activity.push(cardData.data);
                }
              },
            });
          },
        });

        return category;
      }

      var pluginManifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Русское',
        description: 'Русские новинки',
        component: 'rus_movie',
      };

      if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
      Lampa.Manifest.plugins.rus_movie = pluginManifest;

      Lampa.Component.add('rus_movie', russianCategoryComponent);

      var menuItem = $('<li class="menu__item selector"><div class="menu__ico">' + russianMenuIcon + '</div><div class="menu__text">' + pluginManifest.name + '</div></li>');

      menuItem.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: pluginManifest.name,
          component: 'rus_movie',
          page: 1,
        });
      });

      $('.menu .menu__list').eq(0).append(menuItem);

      function RussianMainSource(baseSource) {
        this.network = new Lampa.Reguest();
        this.base = baseSource;

        this.main = function (params, onSuccess, onError) {
          params = params || {};
          onError = onError || function () {};

          var yearsRanges = [
            { start: 2023, end: 2025 },
            { start: 2020, end: 2022 },
            { start: 2017, end: 2019 },
            { start: 2014, end: 2016 },
            { start: 2011, end: 2013 },
          ];

          var randomYears1 = yearsRanges[Math.floor(Math.random() * yearsRanges.length)];
          var randomYears2 = yearsRanges[Math.floor(Math.random() * yearsRanges.length)];

          var dateFrom1 = randomYears1.start + '-01-01';
          var dateTo1 = randomYears1.end + '-12-31';
          var dateFrom2 = randomYears2.start + '-01-01';
          var dateTo2 = randomYears2.end + '-12-31';

          var sortOptions = ['vote_count.desc', 'vote_average.desc', 'popularity.desc', 'revenue.desc'];
          var randomSort1 = sortOptions[Math.floor(Math.random() * sortOptions.length)];
          var randomSort2 = ['vote_count.desc', 'popularity.desc', 'revenue.desc'][Math.floor(Math.random() * 3)];

          var today = new Date().toISOString().substr(0, 10);

          var requests = [
            // Сейчас смотрят
            function (callback) {
              this.base.get('movie/now_playing', params, function (data) {
                data.title = Lampa.Lang.translate('title_now_watch');
                callback(data);
              }, callback);
            }.bind(this),

            // Тренд дня
            function (callback) {
              this.base.get('trending/all/day', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_day');
                callback(data);
              }, callback);
            }.bind(this),

            // Тренд недели
            function (callback) {
              this.base.get('trending/all/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_week');
                callback(data);
              }, callback);
            }.bind(this),

            // Русские фильмы
            function (callback) {
              this.base.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские фильмы');
                callback(data);
              }, callback);
            }.bind(this),

            // Русские сериалы
            function (callback) {
              this.base.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские сериалы');
                callback(data);
              }, callback);
            }.bind(this),

            // Скоро в кино
            function (callback) {
              this.base.get('movie/upcoming', params, function (data) {
                data.title = Lampa.Lang.translate('title_upcoming');
                callback(data);
              }, callback);
            }.bind(this),

            // Русские мультфильмы
            function (callback) {
              this.base.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские мультфильмы');
                callback(data);
              }, callback);
            }.bind(this),

            // Популярные фильмы
            function (callback) {
              this.base.get('movie/popular', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_movie');
                callback(data);
              }, callback);
            }.bind(this),

            // Популярные сериалы
            function (callback) {
              this.base.get('trending/tv/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_tv');
                callback(data);
              }, callback);
            }.bind(this),

            // Подборки русских фильмов
            function (callback) {
              this.base.get('discover/movie?primary_release_date.gte=' + dateFrom2 + '&primary_release_date.lte=' + dateTo2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomSort2, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских фильмов');
                callback(data);
              }, callback);
            }.bind(this),

            // Подборки русских сериалов
            function (callback) {
              this.base.get('discover/tv?first_air_date.gte=' + dateFrom1 + '&first_air_date.lte=' + dateTo1 + '&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort1, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских сериалов');
                callback(data);
              }, callback);
            }.bind(this),

            // Netflix
            function (callback) {
              this.base.get('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Netflix';
                callback(data);
              }, callback);
            }.bind(this),

            // Apple TV+
            function (callback) {
              this.base.get('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Apple TV+';
                callback(data);
              }, callback);
            }.bind(this),

            // Prime Video
            function (callback) {
              this.base.get('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Prime Video';
                callback(data);
              }, callback);
            }.bind(this),

            // MGM+
            function (callback) {
              this.base.get('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'MGM+';
                callback(data);
              }, callback);
            }.bind(this),

            // HBO
            function (callback) {
              this.base.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'HBO';
                callback(data);
              }, callback);
            }.bind(this),

            // Дорамы
            function (callback) {
              this.base.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Дорамы';
                callback(data);
              }, callback);
            }.bind(this),

            // Турецкие сериалы
            function (callback) {
              this.base.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Турецкие сериалы';
                callback(data);
              }, callback);
            }.bind(this),

            // Индийские фильмы
            function (callback) {
              this.base.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = 'Индийские фильмы';
                callback(data);
              }, callback);
            }.bind(this),

            // Start, Premier, KION, ИВИ, Okko, КиноПоиск, Wink, СТС, ТНТ — уже выше в русских

            // Топ фильмы
            function (callback) {
              this.base.get('movie/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_movie');
                callback(data);
              }, callback);
            }.bind(this),

            // Топ сериалы
            function (callback) {
              this.base.get('tv/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_tv');
                callback(data);
              }, callback);
            }.bind(this),
          ];

          // Добавляем persons в начало
          Lampa.Arrays.insert(requests, 0, Lampa.Api.partPersons(requests, 6, 'movie', requests.length + 1));

          // Добавляем жанры в конец (с защитой от ошибки)
          if (Lampa.Storage.get('genres_cat') != false && params.genres && params.genres.movie) {
            params.genres.movie.forEach(function (genre) {
              requests.push(function (callback) {
                this.base.get('discover/movie?with_genres=' + genre.id, params, function (data) {
                  data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                  callback(data);
                }, callback);
              }.bind(this));
            }.bind(this));
          }

          if (requests.length > 0) {
            Lampa.Api.partNext(requests, 6, onSuccess, onError);
          } else {
            onSuccess();
          }
        };
      }

      if (Lampa.Storage.get('rus_movie_main') !== false) {
        var originalTmdb = Lampa.Api.sources.tmdb;
        var enhancedTmdb = Object.assign({}, originalTmdb, new RussianMainSource(originalTmdb));
        Lampa.Api.sources.tmdb = enhancedTmdb;
      }

      if (Lampa.Storage.get('source') === 'tmdb') {
        var savedSource = Lampa.Storage.get('source');
        var interval = setInterval(function () {
          var activity = Lampa.Activity.active();
          if (activity && activity.component === 'main') {
            clearInterval(interval);
            Lampa.Activity.replace({
              source: savedSource,
              title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase(),
            });
          }
        }, 200);
      }

      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'trigger', default: true },
        field: { name: 'Русские новинки на главной', description: 'Показывать русские подборки на главной странице вместе с оригинальными TMDB (все постеры вертикальные). Перезапустите приложение после изменения.' },
        onRender: function (el) {
          setTimeout(() => {
            $('div[data-name="rus_movie_main"]').insertAfter('div[data-name="interface_size"]');
          }, 0);
        },
      });
    }

    if (window.appready) {
      initRussianPlugin();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          initRussianPlugin();
        }
      });
    }
  })();
})();
