
(function() {
  'use strict';
  Lampa.Platform.tv();

  // Утилита для перемешивания массива (используется для случайного порядка контента в разделах)
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  // Класс Card для рендеринга отдельных элементов (фильмы, сериалы, эпизоды)
  function Card(item, episode) {
    this.item = item || {};
    this.episode = episode || {};
    if (this.item.source === undefined) this.item.source = 'tmdb';
    Lampa.Manifest.logs('bylampa_source', this.item, {
      title: this.item.title,
      original_title: this.item.original_name,
      release_date: this.item.release_date
    });
    this.item.release_year = ((this.item.release_date || '0000') + '').slice(0, 4);

    // Вспомогательная функция для удаления элемента, если он существует
    function removeElement(el) {
      if (el) el.remove();
    }

    // Построение структуры DOM карточки
    this.build = function() {
      this.card = Lampa.Template.js('card');
      this.img_poster = this.card.find('.card__img') || {};
      this.img_episode = this.card.find('.full-episode__img') || {};
      this.card.find('.card__title').innerText = this.item.title;
      this.card.find('.card__age').innerText = this.item.release_year;
      if (this.episode && this.episode.air_date) {
        this.card.find('.full-episode__name').innerText = this.episode.title || Lampa.Lang.translate('noname');
        this.card.find('.full-episode__date').innerText = this.episode.air_date || '';
        this.card.find('.full-episode__num').innerText = this.episode.episode_number ? Lampa.Utils.parseTime(this.episode.episode_number).full : '----';
      }
      if (this.item.release_year === '0000') removeElement(this.card.find('.card__age'));
      this.card.on('hover:focus', this.image.bind(this));
    };

    // Установка обработчиков загрузки/ошибки изображений
    this.imageHandlers = function() {
      this.img_poster.onload = function() {};
      this.img_poster.onerror = function() {
        this.img_poster.src = './img/img_broken.svg';
      };
      this.img_episode.onload = function() {
        this.card.find('.full-episode__img').classList.add('full-episode__img--loaded');
      };
      this.img_episode.onerror = function() {
        this.img_episode.src = './img/img_broken.svg';
      };
    };

    // Создание карточки и прикрепление событий
    this.create = function() {
      this.build();
      this.card.on('hover:focus', () => { if (this.onFocus) this.onFocus(this.card, this.item); });
      this.card.on('hover:hover', () => { if (this.onHover) this.onHover(this.card, this.item); });
      this.card.on('hover:enter', () => { if (this.onEnter) this.onEnter(this.card, this.item); });
      this.imageHandlers();
    };

    // Загрузка изображений для постера и эпизода
    this.image = function() {
      if (this.item.poster_path) this.img_poster.src = Lampa.Api.img(this.item.poster_path);
      else if (this.item.backdrop_path) this.img_poster.src = Lampa.Api.img(this.item.backdrop_path);
      else if (this.item.profile_path) this.img_poster.src = this.item.profile_path;
      else if (this.item.img) this.img_poster.src = this.item.img;
      else this.img_poster.src = './img/img_broken.svg';

      if (this.item.still_path) this.img_episode.src = Lampa.Api.img(this.episode.still_path, 'w300');
      else if (this.item.backdrop_path) this.img_episode.src = Lampa.Api.img(this.item.backdrop_path, 'w300');
      else if (this.episode.img) this.img_episode.src = this.episode.img;
      else if (this.item.img) this.img_episode.src = this.item.img;
      else this.img_episode.src = './img/img_broken.svg';

      if (this.onVisible) this.onVisible(this.card, this.item);
    };

    // Очистка карточки
    this.destroy = function() {
      this.img_poster.onerror = function() {};
      this.img_poster.onload = function() {};
      this.img_episode.onerror = function() {};
      this.img_episode.onload = function() {};
      this.img_poster.src = '';
      this.img_episode.src = '';
      removeElement(this.card);
      this.card = null;
      this.img_poster = null;
      this.img_episode = null;
    };

    // Возврат элемента карточки (HTML или jQuery)
    this.render = function(html) {
      return html ? this.card : $(this.card);
    };
  }

  // Класс PersonalHub для пользовательского контента главного экрана
  function PersonalHub(api) {
    this.timetable = new Lampa.TimeTable();
    this.discovery = false;

    // Основная функция для получения и организации разделов
    this.main = function(params = {}, success, error) {
      var that = this;
      var limit = 56;
      var sections = [
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
        { id: 'collections_rus_movie', order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37, active: !Lampa.Storage.get('collections_rus_movie_remove') }
      ];
      var activeSections = [];
      var calledIds = [];

      // Сортировка активных разделов по порядку
      var orderedSections = sections.filter(s => s.active).sort((a, b) => a.order - b.order);
      if (orderedSections.length === 0) return success();

      // Случайные диапазоны для фильтров дат
      var ranges = [{start: 2023, end: 2025}, {start: 2020, end: 2022}, {start: 2017, end: 2019}, {start: 2014, end: 2016}, {start: 2011, end: 2013}];
      var range1 = ranges[Math.floor(Math.random() * ranges.length)];
      var from1 = range1.start + '-01-01';
      var to1 = range1.end + '-12-31';
      var range2 = ranges[Math.floor(Math.random() * ranges.length)];
      var from2 = range2.start + '-01-01';
      var to2 = range2.end + '-12-31';

      // Случайные варианты сортировки
      var sortOptions = ['vote_count.desc', 'popularity.desc', 'revenue.desc'];
      var sort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      var sortMovie = ['vote_count.desc', 'primary_release_date.desc', 'revenue.desc'];
      var sortMovieIndex = Math.floor(Math.random() * sortMovie.length);
      var sortMovieSelected = sortMovie[sortMovieIndex];

      var today = new Date().toISOString().substr(0, 10);
      var lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      var lastMonthDate = lastMonth.toISOString().substr(0, 10);

      // Обработчики для каждого раздела (получение данных, применение настроек, перемешивание если включено)
      var handlers = {
        now_watch: function(callback) {
          that.get('trending/all/day', params, function(data) {
            data.title = Lampa.Lang.translate('Сейчас смотрят');
            if (Lampa.Storage.get('now_watch_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('now_watch_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('now_watch_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('now_watch_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        upcoming_episodes: function(callback) {
          callback({
            source: 'tmdb',
            results: Lampa.TimeTable.get().slice(0, 20),
            title: Lampa.Lang.translate('Выход ближайших эпизодов'),
            nomore: true,
            cardClass: (item, ep) => new Card(item, ep)
          });
        },
        trend_day: function(callback) {
          that.get('trending/all/week', params, function(data) {
            data.title = Lampa.Lang.translate('title_trend_day');
            if (Lampa.Storage.get('trend_day_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_day_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_day_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_day_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        trend_day_tv: function(callback) {
          that.get('trending/tv/day', params, function(data) {
            data.title = Lampa.Lang.translate('Сегодня в тренде (сериалы)');
            if (Lampa.Storage.get('trend_day_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_day_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_day_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_day_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        trend_day_film: function(callback) {
          that.get('trending/movie/day', params, function(data) {
            data.title = Lampa.Lang.translate('Сегодня в тренде (фильмы)');
            if (Lampa.Storage.get('trend_day_film_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_day_film_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_day_film_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_day_film_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        trend_week: function(callback) {
          that.get('trending/all/week', params, function(data) {
            data.title = Lampa.Lang.translate('В тренде за неделю');
            if (Lampa.Storage.get('trend_week_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_week_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_week_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_week_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        trend_week_tv: function(callback) {
          that.get('trending/tv/week', params, function(data) {
            data.title = Lampa.Lang.translate('В тренде за неделю (сериалы)');
            if (Lampa.Storage.get('trend_week_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_week_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_week_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_week_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        trend_week_film: function(callback) {
          that.get('trending/movie/week', params, function(data) {
            data.title = Lampa.Lang.translate('В тренде за неделю (фильмы)');
            if (Lampa.Storage.get('trend_week_film_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('trend_week_film_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('trend_week_film_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('trend_week_film_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        upcoming: function(callback) {
          that.get('movie/upcoming', params, function(data) {
            data.title = Lampa.Lang.translate('title_upcoming');
            if (Lampa.Storage.get('upcoming_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('upcoming_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('upcoming_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('upcoming_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        popular_movie: function(callback) {
          that.get('movie/popular', params, function(data) {
            data.title = Lampa.Lang.translate('Популярные фильмы');
            if (Lampa.Storage.get('popular_movie_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('popular_movie_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('popular_movie_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('popular_movie_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        popular_tv: function(callback) {
          that.get('trending/tv/week', params, function(data) {
            data.title = Lampa.Lang.translate('Популярные сериалы');
            if (Lampa.Storage.get('popular_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('popular_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('popular_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('popular_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        top_movie: function(callback) {
          that.get('movie/top_rated', params, function(data) {
            data.title = Lampa.Lang.translate('Топ фильмы');
            if (Lampa.Storage.get('top_movie_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('top_movie_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('top_movie_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('top_movie_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        top_tv: function(callback) {
          that.get('tv/top_rated', params, function(data) {
            data.title = Lampa.Lang.translate('Топ сериалы');
            if (Lampa.Storage.get('top_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('top_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('top_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('top_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        netflix: function(callback) {
          that.get('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Netflix');
            if (Lampa.Storage.get('netflix_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('netflix_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('netflix_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('netflix_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        apple_tv: function(callback) {
          that.get('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Apple TV+');
            if (Lampa.Storage.get('apple_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('apple_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('apple_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('apple_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        prime_video: function(callback) {
          that.get('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Prime Video');
            if (Lampa.Storage.get('prime_video_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('prime_video_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('prime_video_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('prime_video_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        mgm: function(callback) {
          that.get('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('MGM+');
            if (Lampa.Storage.get('mgm_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('mgm_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('mgm_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('mgm_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        hbo: function(callback) {
          that.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('HBO');
            if (Lampa.Storage.get('hbo_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('hbo_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('hbo_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('hbo_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        dorams: function(callback) {
          that.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Дорамы');
            if (Lampa.Storage.get('dorams_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('dorams_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('dorams_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('dorams_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        tur_serials: function(callback) {
          that.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Турецкие сериалы');
            if (Lampa.Storage.get('tur_serials_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('tur_serials_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('tur_serials_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('tur_serials_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        ind_films: function(callback) {
          that.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Индийские фильмы');
            if (Lampa.Storage.get('ind_films_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('ind_films_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('ind_films_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('ind_films_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        rus_movie: function(callback) {
          that.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Русские фильмы');
            if (Lampa.Storage.get('rus_movie_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('rus_movie_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('rus_movie_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('rus_movie_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        rus_tv: function(callback) {
          that.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Русские сериалы');
            if (Lampa.Storage.get('rus_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('rus_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('rus_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('rus_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        rus_mult: function(callback) {
          that.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Русские мультфильмы');
            if (Lampa.Storage.get('rus_mult_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('rus_mult_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('rus_mult_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('rus_mult_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        start: function(callback) {
          that.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Start');
            if (Lampa.Storage.get('start_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('start_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('start_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('start_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        premier: function(callback) {
          that.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Premier');
            if (Lampa.Storage.get('premier_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('premier_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('premier_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('premier_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        kion: function(callback) {
          that.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('KION');
            if (Lampa.Storage.get('kion_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('kion_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('kion_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('kion_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        ivi: function(callback) {
          that.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('ИВИ');
            if (Lampa.Storage.get('ivi_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('ivi_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('ivi_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('ivi_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        okko: function(callback) {
          that.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('OKKO');
            if (Lampa.Storage.get('okko_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('okko_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('okko_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('okko_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        kinopoisk: function(callback) {
          that.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('КиноПоиск');
            if (Lampa.Storage.get('kinopoisk_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('kinopoisk_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('kinopoisk_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('kinopoisk_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        wink: function(callback) {
          that.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('Wink');
            if (Lampa.Storage.get('wink_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('wink_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('wink_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('wink_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        sts: function(callback) {
          that.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('СТС');
            if (Lampa.Storage.get('sts_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('sts_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('sts_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('sts_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        tnt: function(callback) {
          that.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(data) {
            data.title = Lampa.Lang.translate('ТНТ');
            if (Lampa.Storage.get('tnt_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('tnt_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('tnt_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('tnt_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        collections_inter_tv: function(callback) {
          that.get('discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' + sort + '&first_air_date.lte=' + to1 + '&first_air_date.gte=' + from1, params, function(data) {
            data.title = Lampa.Lang.translate('Подборки зарубежных сериалов');
            if (Lampa.Storage.get('collections_inter_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('collections_inter_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('collections_inter_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('collections_inter_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        collections_rus_tv: function(callback) {
          that.get('discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + sort + '&air_date.lte=' + to1 + '&first_air_date.gte=' + from1, params, function(data) {
            data.title = Lampa.Lang.translate('Подборки русских сериалов');
            if (Lampa.Storage.get('collections_rus_tv_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('collections_rus_tv_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('collections_rus_tv_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('collections_rus_tv_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        collections_inter_movie: function(callback) {
          that.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=' + sortMovieSelected + '&primary_release_date.lte=' + to2 + '&primary_release_date.gte=' + from2, params, function(data) {
            data.title = Lampa.Lang.translate('Подборки зарубежных фильмов');
            if (Lampa.Storage.get('collections_inter_movie_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('collections_inter_movie_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('collections_inter_movie_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('collections_inter_movie_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        },
        collections_rus_movie: function(callback) {
          that.get('discover/movie?primary_release_date.gte=' + from2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + sortMovieSelected + '&primary_release_date.lte=' + to2, params, function(data) {
            data.title = Lampa.Lang.translate('Подборки русских фильмов');
            if (Lampa.Storage.get('collections_rus_movie_display') == '2') { data.collection = true; data.line_type = 'collection'; }
            if (Lampa.Storage.get('collections_rus_movie_display') == '3') {
              data.small = true; data.wide = true;
              data.results.forEach(item => { item.promo = item.overview; item.promo_title = item.title || item.name; });
            }
            if (Lampa.Storage.get('collections_rus_movie_display') == '4') { data.line_type = 'top'; }
            if (Lampa.Storage.get('collections_rus_movie_shuffle') === true) shuffle(data.results);
            callback(data);
          }, callback);
        }
      };

      // Сбор обработчиков для активных разделов
      orderedSections.forEach(s => {
        if (!calledIds.includes(s.id) && handlers[s.id]) {
          activeSections.push(handlers[s.id]);
          calledIds.push(s.id);
        }
      });

      // Если нет перемешивания главного, добавить коллекции на основе жанров
      if (Lampa.Storage.get('bylampa_source_params') === false) {
        api.genres.forEach(g => {
          if (!calledIds.includes(g.id)) {
            var genreHandler = function(callback) {
              that.get('discover/movie?with_genres=' + g.id, params, function(data) {
                data.title = Lampa.Lang.translate(g.title.replace(/[^a-z_]/g, ''));
                shuffle(data.results);
                callback(data);
              }, callback);
            };
            activeSections.push(genreHandler);
            calledIds.push(g.id);
          }
        });
      }

      // Параллельное получение всех данных
      if (activeSections.length > 0) {
        Lampa.Arrays.getPromises(activeSections, limit, success, error);
      } else {
        console.log('Нет доступных категорий для загрузки.');
      }
    };

    // Обертка для получения API (расширяет оригинальный источник TMDB)
    this.get = function(url, params, success, error) {
      // Логика фактической выборки (используя Lampa.Api.sources.tmdb.get или аналогичное)
      Lampa.Api.sources.tmdb.get.apply(this, arguments);
    };
  }

  // Назначение пользовательского источника
  var customSource = Object.assign({}, Lampa.Api.sources.tmdb, new PersonalHub(Lampa.Api.sources.tmdb));
  Lampa.Api.sources.bylampa_source = customSource;
  Object.assign(Lampa.Api.sources, { PersonalHub: customSource });

  // Добавление в селектор источников
  Lampa.Params.select('source', Object.assign({}, Lampa.Params.sources.source, { PersonalHub: 'PersonalHub' }), 'tmdb');

  // Если выбран как источник, активировать в активности
  if (Lampa.Storage.get('source') === 'PersonalHub') {
    var interval = setInterval(() => {
      var activity = Lampa.Activity.active();
      if (activity) {
        clearInterval(interval);
        Lampa.Activity.push({ source: Lampa.Storage.get('source'), title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase() });
      }
    }, 300);
  }

  // Слушатели настроек и добавления
  Lampa.Settings.listener.follow('open', (e) => {
    if (e.name === 'main') {
      if (Lampa.Settings.main().render().find('[data-component="bylampa_source"]').length === 0) {
        Lampa.SettingsApi.addComponent({ component: 'bylampa_source', name: 'Источник PersonalHub' });
      }
      Lampa.Settings.main().update();
      Lampa.Settings.main().render().find('.settings-param > div:contains("Источник PersonalHub")').toggle('hide');
    }
  });

  // Добавление параметра перемешивания главного
  Lampa.SettingsApi.addParam({
    component: 'bylampa_source',
    param: { name: 'bylampa_source_params', type: 'trigger', default: true },
    field: { name: 'Изменять порядок карточек на главной', description: 'Порядок отображения' },
    onRender: (item) => {
      setTimeout(() => {
        $('div[data-name="source"]').parent().insertAfter($('.settings-param > div:contains("Источник PersonalHub")'));
        if (Lampa.Storage.field('source') !== 'PersonalHub') item.hide();
        else item.show();
      }, 20);
      item.on('hover:enter', () => {
        Lampa.Settings.open('more');
        Lampa.Controller.active().listener.back = () => Lampa.Settings.open('more');
      });
    }
  });

  // Функция для добавления настроек для каждого раздела
  function addSection(id, name, description, shuffleDefault, displayDefault, orderDefault, removeDefault) {
    Lampa.Settings.listener.follow('open', (e) => {
      if (e.name === 'main') {
        if (Lampa.Settings.main().render().find(`[data-component="${id}"]`).length === 0) {
          Lampa.SettingsApi.addComponent({ component: id, name });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find(`[data-component="${id}"]`).addClass('hide');
      }
    });
    Lampa.SettingsApi.addParam({
      component: 'bylampa_source',
      param: { name: id, type: 'trigger', default: removeDefault },
      field: { name, description },
      onRender: (item) => {
        item.on('hover:enter', (e) => {
          var target = e.target, parent = target.parentElement;
          var siblings = Array.from(parent.children), index = siblings.indexOf(target), childIndex = index + 1;
          Lampa.Settings.open(id);
          Lampa.Controller.active().listener.back = () => {
            Lampa.Settings.open(id);
            setTimeout(() => {
              var nextChild = document.querySelector(`#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(${childIndex})`);
              Lampa.Controller.toggle(nextChild);
              Lampa.Activity.toggle('settings_component');
            }, 5);
          };
        });
      }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_remove`, type: 'trigger', default: removeDefault },
      field: { name: 'Убрать с главной страницы' }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_display`, type: 'select', values: {1: 'Стандарт', 2: 'collection', 3: 'Широкие большие', 4: 'Top Line'}, default: displayDefault },
      field: { name: 'Вид отображения' }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `number_${id}`, type: 'select', values: {1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12', 13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20', 21: '21', 22: '22', 23: '23', 24: '24', 25: '25', 26: '26', 27: '27', 28: '28', 29: '29', 30: '30', 31: '31', 32: '32', 33: '33', 34: '34', 35: '35', 36: '36', 37: '37'}, default: orderDefault },
      field: { name: 'Порядок отображения' },
      onChange: (value) => { /* Обработка изменения порядка */ }
    });
    Lampa.SettingsApi.addParam({
      component: id,
      param: { name: `${id}_shuffle`, type: 'trigger', default: shuffleDefault },
      field: { name: 'Изменять порядок карточек на главной' }
    });
  }

  // Добавление всех разделов
  addSection('now_watch', 'Сейчас смотрят', 'Нажми для настройки', false, '1', '1', false);
  addSection('upcoming_episodes', 'Выход ближайших эпизодов', 'Нажми для настройки', false, '1', '2', false);
  addSection('trend_day', 'Сегодня в тренде', 'Нажми для настройки', false, '1', '3', false);
  addSection('trend_day_tv', 'Сегодня в тренде (сериалы)', 'Нажми для настройки', true, '1', '4', false);
  addSection('trend_day_film', 'Сегодня в тренде (фильмы)', 'Нажми для настройки', true, '1', '5', false);
  addSection('trend_week', 'В тренде за неделю', 'Нажми для настройки', false, '1', '6', false);
  addSection('trend_week_tv', 'В тренде за неделю (сериалы)', 'Нажми для настройки', true, '1', '7', false);
  addSection('trend_week_film', 'В тренде за неделю (фильмы)', 'Нажми для настройки', true, '1', '8', false);
  addSection('upcoming', 'Смотрите в кинозалах', 'Нажми для настройки', false, '1', '9', false);
  addSection('popular_movie', 'Популярные фильмы', 'Нажми для настройки', false, '1', '10', false);
  addSection('popular_tv', 'Популярные сериалы', 'Нажми для настройки', false, '1', '11', false);
  addSection('top_movie', 'Топ фильмы', 'Нажми для настройки', false, '4', '12', false);
  addSection('top_tv', 'Топ сериалы', 'Нажми для настройки', false, '4', '13', false);
  addSection('netflix', 'Netflix', 'Нажми для настройки', true, '1', '14', false);
  addSection('apple_tv', 'Apple TV+', 'Нажми для настройки', true, '1', '15', false);
  addSection('prime_video', 'Prime Video', 'Нажми для настройки', true, '1', '16', false);
  addSection('mgm', 'MGM+', 'Нажми для настройки', true, '1', '17', false);
  addSection('hbo', 'HBO', 'Нажми для настройки', true, '1', '18', false);
  addSection('dorams', 'Дорамы', 'Нажми для настройки', true, '1', '19', false);
  addSection('tur_serials', 'Турецкие сериалы', 'Нажми для настройки', true, '1', '20', false);
  addSection('ind_films', 'Индийские фильмы', 'Нажми для настройки', true, '1', '21', false);
  addSection('rus_movie', 'Русские фильмы', 'Нажми для настройки', true, '1', '22', false);
  addSection('rus_tv', 'Русские сериалы', 'Нажми для настройки', true, '1', '23', false);
  addSection('rus_mult', 'Русские мультфильмы', 'Нажми для настройки', true, '1', '24', false);
  addSection('start', 'Start', 'Нажми для настройки', true, '1', '25', false);
  addSection('premier', 'Premier', 'Нажми для настройки', true, '1', '26', false);
  addSection('kion', 'KION', 'Нажми для настройки', true, '1', '27', false);
  addSection('ivi', 'ИВИ', 'Нажми для настройки', true, '1', '28', false);
  addSection('okko', 'OKKO', 'Нажми для настройки', true, '1', '29', false);
  addSection('kinopoisk', 'КиноПоиск', 'Нажми для настройки', true, '1', '30', false);
  addSection('wink', 'Wink', 'Нажми для настройки', true, '1', '31', false);
  addSection('sts', 'СТС', 'Нажми для настройки', true, '1', '32', false);
  addSection('tnt', 'ТНТ', 'Нажми для настройки', true, '1', '33', false);
  addSection('collections_inter_tv', 'Подборки зарубежных сериалов', 'Нажми для настройки', true, '1', '34', false);
  addSection('collections_rus_tv', 'Подборки русских сериалов', 'Нажми для настройки', true, '1', '35', false);
  addSection('collections_inter_movie', 'Подборки зарубежных фильмов', 'Нажми для настройки', true, '1', '36', false);
  addSection('collections_rus_movie', 'Подборки русских фильмов', 'Нажми для настройки', true, '1', '37', false);

  // Слушатель изменения источника
  Lampa.Storage.listener.follow('change', (e) => {
    if (e.name === 'source') {
      setTimeout(() => {
        if (Lampa.Storage.get('source') !== 'PersonalHub') $('.settings-param > div:contains("Источник PersonalHub")').parent().hide();
        else $('.settings-param > div:contains("Источник PersonalHub")').parent().show();
      }, 50);
    }
  });

  // Установка значений по умолчанию при первом запуске
  var checkInterval = setInterval(() => {
    if (typeof Lampa !== 'undefined') {
      clearInterval(checkInterval);
      if (!Lampa.Storage.get('bylampa_source_params', 'true')) setDefaults();
    }
  }, 200);

  // Установка начальных значений по умолчанию
  function setDefaults() {
    Lampa.Storage.set('bylampa_source_params', 'true');
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
    Lampa.Storage.set('bylampa_source_params', 'true');
  }
})();
