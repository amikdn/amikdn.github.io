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

      // Плитка "Русское" — горизонтальные карточки (wide)
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
                params: { style: { name: 'wide' } }, // Горизонтальные (wide)
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

      // Основной источник с русскими подборками на главной (все постеры вертикальные)
      function EnhancedTmdbSource(baseSource) {
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

          var randomSort1 = ['vote_count.desc', 'vote_average.desc', 'popularity.desc', 'revenue.desc'][Math.floor(Math.random() * 4)];
          var randomSort2 = ['vote_count.desc', 'popularity.desc', 'revenue.desc'][Math.floor(Math.random() * 3)];

          var today = new Date().toISOString().substr(0, 10);

          var requests = [
            // Оригинальные TMDB подборки (все вертикальные, без специальных стилей)
            function (callback) { this.base.get('movie/now_playing', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('trending/all/day', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('trending/all/week', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('movie/upcoming', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('movie/popular', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('trending/tv/week', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('movie/top_rated', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('tv/top_rated', params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),
            function (callback) { this.base.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, callback, callback); }.bind(this),

            // Русские подборки (вертикальные)
            function (callback) {
              this.base.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = 'Русские фильмы';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'Русские сериалы';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = 'Русские мультфильмы';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/movie?primary_release_date.gte=' + dateFrom2 + '&primary_release_date.lte=' + dateTo2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomSort2, params, function (data) {
                data.title = 'Подборки русских фильмов';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?first_air_date.gte=' + dateFrom1 + '&first_air_date.lte=' + dateTo1 + '&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort1, params, function (data) {
                data.title = 'Подборки русских сериалов';
                callback(data);
              }, callback);
            }.bind(this),

            // Сервисы (Start, Premier и т.д.) — как отдельные строки
            function (callback) {
              this.base.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'Start';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'Premier';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'KION';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'ИВИ';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'Okko';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'КиноПоиск';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'Wink';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'СТС';
                callback(data);
              }, callback);
            }.bind(this),

            function (callback) {
              this.base.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = 'ТНТ';
                callback(data);
              }, callback);
            }.bind(this),
          ];

          // Persons и жанры из оригинального TMDB
          Lampa.Arrays.insert(requests, 0, Lampa.Api.partPersons(requests, 6, 'movie', requests.length + 1));

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

          Lampa.Api.partNext(requests, 6, onSuccess, onError);
        };
      }

      // Включаем русские подборки на главной только если параметр включён
      if (Lampa.Storage.get('rus_movie_main', true)) {
        var originalTmdb = Lampa.Api.sources.tmdb;
        Lampa.Api.sources.tmdb = Object.assign({}, originalTmdb, new EnhancedTmdbSource(originalTmdb));
      }

      // Перезапуск главной при смене источника или параметра
      Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'rus_movie_main' || e.name === 'source') {
          if (Lampa.Storage.get('source') === 'tmdb') {
            Lampa.Activity.replace();
          }
        }
      });

      if (Lampa.Storage.get('source') === 'tmdb') {
        var interval = setInterval(function () {
          var activity = Lampa.Activity.active();
          if (activity && activity.component === 'main') {
            clearInterval(interval);
            Lampa.Activity.replace();
          }
        }, 200);
      }

      // Параметр включения/отключения русских подборок на главной
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'trigger', default: true },
        field: { name: 'Русские новинки на главной', description: 'Включить русские подборки на главной странице TMDB (все постеры вертикальные). Перезапустите приложение после изменения.' },
        onRender: function (el) {
          setTimeout(() => {
            $('div[data-name="rus_movie_main"]').insertAfter('div[data-name="interface_size"]');
          }, 0);
        },
        onChange: function () {
          Lampa.Activity.replace(); // Перезагрузка главной при изменении
        }
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
