(function () {
  'use strict';

  Lampa.Platform.tv();

  (function () {
    function initCustomSource() {
      // Класс карточки для ближайших эпизодов
      function EpisodeCard(cardData, episodeData) {
        var card = cardData.card || cardData;
        var episode = episodeData.next_episode_to_air || episodeData.episode || {};

        if (card.source === undefined) {
          card.source = 'tmdb';
        }

        Lampa.Arrays.extend(card, {
          title: card.name,
          original_title: card.original_name,
          release_date: card.first_air_date,
        });

        card.release_year = (card.release_date || '0000' + '').slice(0, 4);

        function removeElement(el) {
          if (el) el.remove();
        }

        this.build = function () {
          this.cardElement = Lampa.Template.js('card_episode');
          this.imgPoster = this.cardElement.querySelector('.card__img') || {};
          this.imgEpisode = this.cardElement.querySelector('.full-episode__img img') || {};

          this.cardElement.querySelector('.card__title').innerText = card.title;
          this.cardElement.querySelector('.full-episode__num').innerText = card.unwatched || '';

          if (episode.air_date) {
            this.cardElement.querySelector('.full-episode__name').innerText = episode.name || Lampa.Lang.translate('noname');
            this.cardElement.querySelector('.full-episode__num').innerText = episode.episode_number || '';
            this.cardElement.querySelector('.full-episode__date').innerText = episode.air_date
              ? Lampa.Utils.parseTime(episode.air_date).full
              : '----';
          }

          if (card.release_year === '0000') {
            removeElement(this.cardElement.querySelector('.card__age'));
          } else {
            this.cardElement.querySelector('.card__age').innerText = card.release_year;
          }

          this.cardElement.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
          this.imgPoster.onload = function () {};
          this.imgPoster.onerror = function () {
            this.src = './img/img_broken.svg';
          };

          this.imgEpisode.onload = function () {
            this.cardElement.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
          }.bind(this);

          this.imgEpisode.onerror = function () {
            this.src = './img/img_broken.svg';
          };
        };

        this.create = function () {
          this.build();

          this.cardElement.addEventListener('hover:focus', () => {
            if (this.onFocus) this.onFocus(this.cardElement, card);
          });

          this.cardElement.addEventListener('hover:hover', () => {
            if (this.onHover) this.onHover(this.cardElement, card);
          });

          this.cardElement.addEventListener('hover:enter', () => {
            if (this.onEnter) this.onEnter(this.cardElement, card);
          });

          this.image();
        };

        this.visible = function () {
          if (card.poster_path) {
            this.imgPoster.src = Lampa.Api.img(card.poster_path);
          } else if (card.profile_path) {
            this.imgPoster.src = Lampa.Api.img(card.profile_path);
          } else if (card.poster) {
            this.imgPoster.src = card.poster;
          } else if (card.img) {
            this.imgPoster.src = card.img;
          } else {
            this.imgPoster.src = './img/img_broken.svg';
          }

          if (episode.still_path) {
            this.imgEpisode.src = Lampa.Api.img(episode.still_path, 'w300');
          } else if (card.backdrop_path) {
            this.imgEpisode.src = Lampa.Api.img(card.backdrop_path, 'w300');
          } else if (episode.img) {
            this.imgEpisode.src = episode.img;
          } else if (card.img) {
            this.imgEpisode.src = card.img;
          } else {
            this.imgEpisode.src = './img/img_broken.svg';
          }

          if (this.onVisible) this.onVisible(this.cardElement, card);
        };

        this.destroy = function () {
          this.imgPoster.onerror = this.imgPoster.onload = function () {};
          this.imgEpisode.onerror = this.imgEpisode.onload = function () {};
          this.imgPoster.src = '';
          this.imgEpisode.src = '';
          removeElement(this.cardElement);
          this.cardElement = null;
          this.imgPoster = null;
          this.imgEpisode = null;
        };

        this.render = function (jquery) {
          return jquery ? $(this.cardElement) : this.cardElement;
        };
      }

      function CustomSource() {
        this.network = new Lampa.Reguest();

        this.main = function (params, onSuccess, onError) {
          params = params || {};
          onError = onError || function () {};

          var categories = [
            { id: 'now_watch', order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1, active: !Lampa.Storage.get('now_watch_remove') },
            { id: 'upcoming_episodes', order: 2, active: !Lampa.Storage.get('upcoming_episodes_remove') },
            { id: 'trend_day', order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3, active: !Lampa.Storage.get('trend_day_remove') },
            { id: 'trend_day_tv', order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4, active: !Lampa.Storage.get('trend_day_tv_remove') },
            { id: 'trend_day_film', order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) || 5, active: !Lampa.Storage.get('trend_day_film_remove') },
            { id: 'trend_week', order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6, active: !Lampa.Storage.get('trend_week_remove') },
            { id: 'trend_week_tv', order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7, active: !Lampa.Storage.get('trend_week_tv_remove') },
            { id: 'trend_week_film', order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) || 8, active: !Lampa.Storage.get('trend_week_film_remove') },
            { id: 'upcoming', order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9, active: !Lampa.Storage.get('upcoming_remove') },
            { id: 'popular_movie', order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) || 10, active: !Lampa.Storage.get('popular_movie_remove') },
            { id: 'popular_tv', order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 11, active: !Lampa.Storage.get('popular_tv_remove') },
            { id: 'top_movie', order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 12, active: !Lampa.Storage.get('top_movie_remove') },
            { id: 'top_tv', order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 13, active: !Lampa.Storage.get('top_tv_remove') },
            { id: 'netflix', order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14, active: !Lampa.Storage.get('netflix_remove') },
            { id: 'apple_tv', order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15, active: !Lampa.Storage.get('apple_tv_remove') },
            { id: 'prime_video', order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16, active: !Lampa.Storage.get('prime_video_remove') },
            { id: 'mgm', order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 17, active: !Lampa.Storage.get('mgm_remove') },
            { id: 'hbo', order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 18, active: !Lampa.Storage.get('hbo_remove') },
            { id: 'dorams', order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19, active: !Lampa.Storage.get('dorams_remove') },
            { id: 'tur_serials', order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20, active: !Lampa.Storage.get('tur_serials_remove') },
            { id: 'ind_films', order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21, active: !Lampa.Storage.get('ind_films_remove') },
            { id: 'rus_movie', order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22, active: !Lampa.Storage.get('rus_movie_remove') },
            { id: 'rus_tv', order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23, active: !Lampa.Storage.get('rus_tv_remove') },
            { id: 'rus_mult', order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24, active: !Lampa.Storage.get('rus_mult_remove') },
            { id: 'start', order: parseInt(Lampa.Storage.get('number_start'), 10) || 25, active: !Lampa.Storage.get('start_remove') },
            { id: 'premier', order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26, active: !Lampa.Storage.get('premier_remove') },
            { id: 'kion', order: parseInt(Lampa.Storage.get('number_kion'), 10) || 27, active: !Lampa.Storage.get('kion_remove') },
            { id: 'ivi', order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 28, active: !Lampa.Storage.get('ivi_remove') },
            { id: 'okko', order: parseInt(Lampa.Storage.get('number_okko'), 10) || 29, active: !Lampa.Storage.get('okko_remove') },
            { id: 'kinopoisk', order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30, active: !Lampa.Storage.get('kinopoisk_remove') },
            { id: 'wink', order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31, active: !Lampa.Storage.get('wink_remove') },
            { id: 'sts', order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32, active: !Lampa.Storage.get('sts_remove') },
            { id: 'tnt', order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33, active: !Lampa.Storage.get('tnt_remove') },
            { id: 'collections_inter_tv', order: parseInt(Lampa.Storage.get('number_collections_inter_tv'), 10) || 34, active: !Lampa.Storage.get('collections_inter_tv_remove') },
            { id: 'collections_rus_tv', order: parseInt(Lampa.Storage.get('number_collections_rus_tv'), 10) || 35, active: !Lampa.Storage.get('collections_rus_tv_remove') },
            { id: 'collections_inter_movie', order: parseInt(Lampa.Storage.get('number_collections_inter_movie'), 10) || 36, active: !Lampa.Storage.get('collections_inter_movie_remove') },
            { id: 'collections_rus_movie', order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37, active: !Lampa.Storage.get('collections_rus_movie_remove') },
          ];

          function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var temp = array[i];
              array[i] = array[j];
              array[j] = temp;
            }
          }

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

          var sortOptions = ['vote_count.desc', 'popularity.desc', 'revenue.desc'];
          var randomSort1 = sortOptions[Math.floor(Math.random() * sortOptions.length)];
          var randomSort2 = sortOptions[Math.floor(Math.random() * sortOptions.length)];

          var today = new Date().toISOString().substr(0, 10);

          var usedIds = [];
          var requests = [];

          function processCategory(id, loader) {
            if (!usedIds.includes(id)) {
              requests.push(loader);
              usedIds.push(id);
            }
          }

          var loaders = {
            now_watch: function (callback) {
              Lampa.Api.sources.tmdb.get('movie/now_playing', params, function (data) {
                data.title = Lampa.Lang.translate('title_now_watch');
                if (Lampa.Storage.get('now_watch_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('now_watch_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('now_watch_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('now_watch_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            upcoming_episodes: function (callback) {
              callback({
                source: 'tmdb',
                results: Lampa.TimeTable.lately().slice(0, 20),
                title: Lampa.Lang.translate('title_upcoming_episodes'),
                nomore: true,
                cardClass: function (card, episode) { return new EpisodeCard(card, episode); }
              });
            },

            trend_day: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/all/day', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_day');
                if (Lampa.Storage.get('trend_day_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_day_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_day_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_day_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            trend_day_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/tv/day', params, function (data) {
                data.title = Lampa.Lang.translate('Сегодня в тренде (сериалы)');
                if (Lampa.Storage.get('trend_day_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_day_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_day_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_day_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            trend_day_film: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/movie/day', params, function (data) {
                data.title = Lampa.Lang.translate('Сегодня в тренде (фильмы)');
                if (Lampa.Storage.get('trend_day_film_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_day_film_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_day_film_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_day_film_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            trend_week: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/all/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_week');
                if (Lampa.Storage.get('trend_week_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_week_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_week_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_week_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            trend_week_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/tv/week', params, function (data) {
                data.title = Lampa.Lang.translate('В тренде за неделю (сериалы)');
                if (Lampa.Storage.get('trend_week_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_week_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_week_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_week_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            trend_week_film: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/movie/week', params, function (data) {
                data.title = Lampa.Lang.translate('В тренде за неделю (фильмы)');
                if (Lampa.Storage.get('trend_week_film_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('trend_week_film_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('trend_week_film_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('trend_week_film_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            upcoming: function (callback) {
              Lampa.Api.sources.tmdb.get('movie/upcoming', params, function (data) {
                data.title = Lampa.Lang.translate('title_upcoming');
                if (Lampa.Storage.get('upcoming_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('upcoming_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('upcoming_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('upcoming_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            popular_movie: function (callback) {
              Lampa.Api.sources.tmdb.get('movie/popular', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_movie');
                if (Lampa.Storage.get('popular_movie_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('popular_movie_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('popular_movie_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('popular_movie_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            popular_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('trending/tv/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_tv');
                if (Lampa.Storage.get('popular_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('popular_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('popular_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('popular_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            top_movie: function (callback) {
              Lampa.Api.sources.tmdb.get('movie/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_movie');
                if (Lampa.Storage.get('top_movie_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('top_movie_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('top_movie_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('top_movie_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            top_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('tv/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_tv');
                if (Lampa.Storage.get('top_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('top_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('top_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('top_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            netflix: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Netflix');
                if (Lampa.Storage.get('netflix_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('netflix_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('netflix_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('netflix_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            apple_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Apple TV+');
                if (Lampa.Storage.get('apple_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('apple_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('apple_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('apple_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            prime_video: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Prime Video');
                if (Lampa.Storage.get('prime_video_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('prime_video_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('prime_video_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('prime_video_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            mgm: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('MGM+');
                if (Lampa.Storage.get('mgm_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('mgm_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('mgm_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('mgm_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            hbo: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('HBO');
                if (Lampa.Storage.get('hbo_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('hbo_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('hbo_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('hbo_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            dorams: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Дорамы');
                if (Lampa.Storage.get('dorams_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('dorams_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('dorams_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('dorams_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            tur_serials: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Турецкие сериалы');
                if (Lampa.Storage.get('tur_serials_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('tur_serials_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('tur_serials_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('tur_serials_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            ind_films: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Индийские фильмы');
                if (Lampa.Storage.get('ind_films_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('ind_films_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('ind_films_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('ind_films_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            rus_movie: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские фильмы');
                if (Lampa.Storage.get('rus_movie_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('rus_movie_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('rus_movie_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('rus_movie_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            rus_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские сериалы');
                if (Lampa.Storage.get('rus_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('rus_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('rus_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('rus_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            rus_mult: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские мультфильмы');
                if (Lampa.Storage.get('rus_mult_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('rus_mult_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('rus_mult_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('rus_mult_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            start: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Start');
                if (Lampa.Storage.get('start_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('start_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('start_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('start_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            premier: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Premier');
                if (Lampa.Storage.get('premier_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('premier_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('premier_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('premier_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            kion: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('KION');
                if (Lampa.Storage.get('kion_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('kion_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('kion_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('kion_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            ivi: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('IVI');
                if (Lampa.Storage.get('ivi_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('ivi_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('ivi_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('ivi_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            okko: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('OKKO');
                if (Lampa.Storage.get('okko_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('okko_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('okko_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('okko_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            kinopoisk: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('КиноПоиск');
                if (Lampa.Storage.get('kinopoisk_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('kinopoisk_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('kinopoisk_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('kinopoisk_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            wink: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Wink');
                if (Lampa.Storage.get('wink_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('wink_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('wink_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('wink_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            sts: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('СТС');
                if (Lampa.Storage.get('sts_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('sts_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('sts_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('sts_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            tnt: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('ТНТ');
                if (Lampa.Storage.get('tnt_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('tnt_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('tnt_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('tnt_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            collections_inter_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' + randomSort1 + '&first_air_date.gte=' + dateFrom1 + '&first_air_date.lte=' + dateTo1, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки зарубежных сериалов');
                if (Lampa.Storage.get('collections_inter_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('collections_inter_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('collections_inter_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('collections_inter_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            collections_rus_tv: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort1 + '&air_date.lte=' + dateTo1 + '&first_air_date.gte=' + dateFrom1, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских сериалов');
                if (Lampa.Storage.get('collections_rus_tv_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('collections_rus_tv_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('collections_rus_tv_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('collections_rus_tv_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            collections_inter_movie: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=' + randomSort2 + '&primary_release_date.gte=' + dateFrom2 + '&primary_release_date.lte=' + dateTo2, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки зарубежных фильмов');
                if (Lampa.Storage.get('collections_inter_movie_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('collections_inter_movie_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('collections_inter_movie_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('collections_inter_movie_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            },

            collections_rus_movie: function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?primary_release_date.gte=' + dateFrom2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomSort2 + '&primary_release_date.lte=' + dateTo2, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских фильмов');
                if (Lampa.Storage.get('collections_rus_movie_display') === '2') { data.collection = true; data.line_type = 'collection'; }
                if (Lampa.Storage.get('collections_rus_movie_display') === '3') { data.small = true; data.wide = true; data.results.forEach(function (item) { item.promo = item.overview; item.promo_title = item.title || item.name; }); }
                if (Lampa.Storage.get('collections_rus_movie_display') === '4') { data.line_type = 'top'; }
                if (Lampa.Storage.get('collections_rus_movie_shuffle') === true) { shuffleArray(data.results); }
                callback(data);
              }, callback);
            }
          };

          var activeCategories = categories.filter(function (cat) { return cat.active; }).sort(function (a, b) { return a.order - b.order; });

          activeCategories.forEach(function (cat) {
            if (loaders[cat.id]) {
              processCategory(cat.id, loaders[cat.id]);
            }
          });

          // Добавлена защита от ошибки: проверка наличия params.genres и params.genres.movie
          if (Lampa.Storage.get('genres_cat') != false && params.genres && params.genres.movie && params.genres.movie.length > 0) {
            params.genres.movie.forEach(function (genre) {
              if (!usedIds.includes(genre.id)) {
                var genreLoader = function (callback) {
                  Lampa.Api.sources.tmdb.get('discover/movie?with_genres=' + genre.id, params, function (data) {
                    data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                    shuffleArray(data.results);
                    callback(data);
                  }, callback);
                };
                requests.push(genreLoader);
                usedIds.push(genre.id);
              }
            });
          }

          if (requests.length > 0) {
            Lampa.Api.partNext(requests, 56, onSuccess, onError);
          } else {
            onSuccess();
          }
        };
      }

      var customSource = Object.assign({}, Lampa.Api.sources.tmdb, new CustomSource());

      Lampa.Api.sources.custom_main = customSource;

      Lampa.Params.select('source', Object.assign({}, Lampa.Params.values.source, { custom_main: 'Кастомный главный' }), 'tmdb');

      if (Lampa.Storage.get('source') === 'custom_main') {
        var savedSource = Lampa.Storage.get('source');
        var replaceInterval = setInterval(function () {
          var activity = Lampa.Activity.active();
          if (activity) {
            clearInterval(replaceInterval);
            Lampa.Activity.replace({
              source: savedSource,
              title: Lampa.Lang.translate('title_main') + ' - Кастом'
            });
          }
        }, 300);
      }

      Lampa.Settings.listener.follow('open', function (e) {
        if (e.name === 'main') {
          if (Lampa.Settings.main().render().find('[data-component="custom_source"]').length === 0) {
            Lampa.SettingsApi.addComponent({
              component: 'custom_source',
              name: 'Кастомный главный экран'
            });
          }
          Lampa.Settings.main().update();
          Lampa.Settings.main().render().find('[data-component="custom_source"]').addClass('hide');
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'more',
        param: { name: 'custom_source', type: 'static', default: true },
        field: { name: 'Кастомный главный экран', description: 'Настройки главного экрана' },
        onRender: function (el) {
          setTimeout(function () {
            $('.settings-param > div:contains("Кастомный главный экран")').parent().insertAfter($('div[data-name="source"]'));
            Lampa.Storage.field('source') !== 'custom_main' ? el.hide() : el.show();
          }, 20);

          el.on('hover:enter', function () {
            Lampa.Settings.create('custom_source');
            Lampa.Controller.enabled().controller.back = function () {
              Lampa.Settings.create('more');
            };
          });
        }
      });

      Lampa.Storage.listener.follow('change', function (e) {
        if (e.name === 'source') {
          setTimeout(function () {
            var paramEl = $('.settings-param > div:contains("Кастомный главный экран")').parent();
            Lampa.Storage.get('source') !== 'custom_main' ? paramEl.hide() : paramEl.show();
          }, 50);
        }
      });

      function addCategorySettings(componentId, title, removeDefault, displayDefault, orderDefault, shuffleDefault) {
        Lampa.Settings.listener.follow('open', function (e) {
          if (e.name === 'main') {
            if (Lampa.Settings.main().render().find('[data-component="' + componentId + '"]').length === 0) {
              Lampa.SettingsApi.addComponent({ component: componentId, name: title });
            }
            Lampa.Settings.main().update();
            Lampa.Settings.main().render().find('[data-component="' + componentId + '"]').addClass('hide');
          }
        });

        Lampa.SettingsApi.addParam({
          component: 'custom_source',
          param: { name: componentId, type: 'static', default: true },
          field: { name: title, description: 'Нажми для настройки' },
          onRender: function (el) {
            el.on('hover:enter', function () {
              var parent = el.parent().parent();
              var siblings = Array.from(parent.children());
              var index = siblings.indexOf(el.parent());
              var position = index + 1;

              Lampa.Settings.create(componentId);

              Lampa.Controller.enabled().controller.back = function () {
                Lampa.Settings.create('custom_source');
                setTimeout(function () {
                  var item = document.querySelector('#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(' + position + ')');
                  if (item) Lampa.Controller.focus(item);
                  Lampa.Controller.toggle('settings_component');
                }, 5);
              };
            });
          }
        });

        Lampa.SettingsApi.addParam({
          component: componentId,
          param: { name: componentId + '_remove', type: 'trigger', default: removeDefault },
          field: { name: 'Убрать с главной страницы' }
        });

        Lampa.SettingsApi.addParam({
          component: componentId,
          param: {
            name: componentId + '_display',
            type: 'select',
            values: { 1: 'Стандарт', 2: 'Широкие маленькие', 3: 'Широкие большие', 4: 'Top Line' },
            default: displayDefault
          },
          field: { name: 'Вид отображения' }
        });

        Lampa.SettingsApi.addParam({
          component: componentId,
          param: {
            name: 'number_' + componentId,
            type: 'select',
            values: {
              1: '1',2: '2',3: '3',4: '4',5: '5',6: '6',7: '7',8: '8',9: '9',10: '10',
              11: '11',12: '12',13: '13',14: '14',15: '15',16: '16',17: '17',18: '18',19: '19',20: '20',
              21: '21',22: '22',23: '23',24: '24',25: '25',26: '26',27: '27',28: '28',29: '29',30: '30',
              31: '31',32: '32',33: '33',34: '34',35: '35',36: '36',37: '37'
            },
            default: orderDefault
          },
          field: { name: 'Порядок отображения' }
        });

        Lampa.SettingsApi.addParam({
          component: componentId,
          param: { name: componentId + '_shuffle', type: 'trigger', default: shuffleDefault },
          field: { name: 'Изменять порядок карточек на главной' }
        });
      }

      addCategorySettings('now_watch', 'Сейчас смотрят', false, '1', '1', false);
      addCategorySettings('trend_day', 'Сегодня в тренде', false, '1', '3', false);
      addCategorySettings('trend_day_tv', 'Сегодня в тренде (сериалы)', true, '1', '4', false);
      addCategorySettings('trend_day_film', 'Сегодня в тренде (фильмы)', true, '1', '5', false);
      addCategorySettings('trend_week', 'В тренде за неделю', false, '1', '6', false);
      addCategorySettings('trend_week_tv', 'В тренде за неделю (сериалы)', true, '1', '7', false);
      addCategorySettings('trend_week_film', 'В тренде за неделю (фильмы)', true, '1', '8', false);
      addCategorySettings('upcoming', 'Смотрите в кинозалах', false, '1', '9', false);
      addCategorySettings('popular_movie', 'Популярные фильмы', false, '1', '10', false);
      addCategorySettings('popular_tv', 'Популярные сериалы', false, '1', '11', false);
      addCategorySettings('top_movie', 'Топ фильмы', false, '4', '12', false);
      addCategorySettings('top_tv', 'Топ сериалы', false, '4', '13', false);
      addCategorySettings('netflix', 'Netflix', true, '1', '14', false);
      addCategorySettings('apple_tv', 'Apple TV+', true, '1', '15', false);
      addCategorySettings('prime_video', 'Prime Video', true, '1', '16', false);
      addCategorySettings('mgm', 'MGM+', true, '1', '17', false);
      addCategorySettings('hbo', 'HBO', true, '1', '18', false);
      addCategorySettings('dorams', 'Дорамы', true, '1', '19', false);
      addCategorySettings('tur_serials', 'Турецкие сериалы', true, '1', '20', false);
      addCategorySettings('ind_films', 'Индийские фильмы', true, '1', '21', false);
      addCategorySettings('rus_movie', 'Русские фильмы', true, '1', '22', false);
      addCategorySettings('rus_tv', 'Русские сериалы', true, '1', '23', false);
      addCategorySettings('rus_mult', 'Русские мультфильмы', true, '1', '24', false);
      addCategorySettings('start', 'Start', true, '1', '25', false);
      addCategorySettings('premier', 'Premier', true, '1', '26', false);
      addCategorySettings('kion', 'KION', true, '1', '27', false);
      addCategorySettings('ivi', 'ИВИ', true, '1', '28', false);
      addCategorySettings('okko', 'Okko', true, '1', '29', false);
      addCategorySettings('kinopoisk', 'КиноПоиск', true, '1', '30', false);
      addCategorySettings('wink', 'Wink', true, '1', '31', false);
      addCategorySettings('sts', 'СТС', true, '1', '32', false);
      addCategorySettings('tnt', 'ТНТ', true, '1', '33', false);
      addCategorySettings('collections_inter_tv', 'Подборки зарубежных сериалов', true, '1', '34', false);
      addCategorySettings('collections_rus_tv', 'Подборки русских сериалов', true, '1', '35', false);
      addCategorySettings('collections_inter_movie', 'Подборки зарубежных фильмов', true, '1', '36', false);
      addCategorySettings('collections_rus_movie', 'Подборки русских фильмов', true, '1', '37', false);

      Lampa.SettingsApi.addParam({
        component: 'custom_source',
        param: { name: 'upcoming_episodes_remove', type: 'trigger', default: false },
        field: { name: 'Выход ближайших эпизодов', description: 'Убрать с главной страницы' }
      });

      Lampa.SettingsApi.addParam({
        component: 'custom_source',
        param: { name: 'genres_cat', type: 'trigger', default: true },
        field: { name: 'Подборки по жанрам', description: 'Убрать с главной страницы' }
      });

      var initInterval = setInterval(function () {
        if (typeof Lampa !== 'undefined') {
          clearInterval(initInterval);
          if (!Lampa.Storage.get('custom_source_params', 'false')) {
            Lampa.Storage.set('custom_source_params', 'true');
            Lampa.Storage.set('trend_day_tv_remove', 'true');
            Lampa.Storage.set('trend_day_film_remove', 'true');
            Lampa.Storage.set('trend_week_tv_remove', 'true');
            Lampa.Storage.set('trend_week_film_remove', 'true');
            Lampa.Storage.set('top_movie_display', '4');
            Lampa.Storage.set('top_tv_display', '4');
            Lampa.Storage.set('netflix_remove', 'true');
            Lampa.Storage.set('apple_tv_remove', 'true');
            Lampa.Storage.set('prime_video_remove', 'true');
            Lampa.Storage.set('mgm_remove', 'true');
            Lampa.Storage.set('hbo_remove', 'true');
            Lampa.Storage.set('dorams_remove', 'true');
            Lampa.Storage.set('tur_serials_remove', 'true');
            Lampa.Storage.set('ind_films_remove', 'true');
            Lampa.Storage.set('rus_movie_remove', 'true');
            Lampa.Storage.set('rus_tv_remove', 'true');
            Lampa.Storage.set('rus_mult_remove', 'true');
            Lampa.Storage.set('start_remove', 'true');
            Lampa.Storage.set('premier_remove', 'true');
            Lampa.Storage.set('kion_remove', 'true');
            Lampa.Storage.set('ivi_remove', 'true');
            Lampa.Storage.set('okko_remove', 'true');
            Lampa.Storage.set('kinopoisk_remove', 'true');
            Lampa.Storage.set('wink_remove', 'true');
            Lampa.Storage.set('sts_remove', 'true');
            Lampa.Storage.set('tnt_remove', 'true');
            Lampa.Storage.set('collections_inter_tv_remove', 'true');
            Lampa.Storage.set('collections_rus_tv_remove', 'true');
            Lampa.Storage.set('collections_inter_movie_remove', 'true');
            Lampa.Storage.set('collections_rus_movie_remove', 'true');
            Lampa.Storage.set('genres_cat', 'true');
          }
        }
      }, 200);
    }

    if (window.appready) {
      initCustomSource();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          initCustomSource();
        }
      });
    }
  })();
})();
