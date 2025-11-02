(function() {
  'use strict';
  Lampa.Platform.tv();

  function main() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';
    const today = new Date().toISOString().substr(0, 10);
    const categories = [
      { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + today },
      { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', request: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg', request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + today },
      { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'IVI', img: 'https://bylampa.github.io/img/ivi.jpg', request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today },
      { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today }
    ];

    function collectionMain(params, oncompl, onerr) {
      const data = { collection: true, total_pages: 1, results: categories.map(cat => ({ title: cat.title, img: cat.img, hpu: cat.request })) };
      oncompl(data);
    }

    function collectionFull(params, oncompl, onerr) {
      const network = new Lampa.Reguest();
      const url = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + params.url + '&page=' + (params.page || 1);
      network.get(url, (data) => { data.title = params.title; oncompl(data); }, onerr);
    }

    function clearNetwork() {
      network.clear();
    }

    const apiMethods = { main: collectionMain, full: collectionFull, clear: clearNetwork };

    function RusMovieComponent(params) {
      const component = new Lampa.Component(params);
      component.start = function() {
        apiMethods.main(params, this.append.bind(this), this.empty.bind(this));
      };
      component.extend = function(elem, oncompl, onerr) {
        apiMethods.full(elem, oncompl.bind(component), onerr.bind(component));
      };
      component.render = function(elem, data, card) {
        card.onEnter = false;
        card.onVisible = function() {
          Lampa.Activity.push({ url: data.hpu, title: data.title, component: 'rus_movie', source: 'main', page: 1 });
        };
      };
      return component;
    }

    const plugin = { type: 'movie', version: '1.0.0', name: 'Русское', description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)', component: 'rus_movie' };
    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.rus_movie = plugin;
    Lampa.Component.add('rus_movie', RusMovieComponent);

    Lampa.Activity.listener('push', (act) => {
      if (act.name == 'main') {
      }
    });

    const menuItem = $('<li class="menu__item selector"><div class="menu__ico">' + svg + '</div><div class="menu__text">' + plugin.name + '</div></li>');
    menuItem.on('hover:enter', () => {
      Lampa.Activity.push({ url: '', title: plugin.name, component: 'rus_movie', page: 1 });
      $('.menu .menu__list').addClass('lampa noname');
    });
    $('.menu .menu__list').eq(0).append(menuItem);

    function Card(item) {
      const data = item.episode || item;
      const episode = item.next_episode_to_air || item;
      Lampa.Arrays.extend(data, { title: data.name, original_title: data.original_name, release_date: data.first_air_date });
      data.release_year = ((data.release_date || '0000') + '').substr(0, 4);

      this.build = function() {
        this.card = Lampa.Template.js('card_episode');
        this.img_poster = this.card.querySelector('.full-episode__img img');
        this.img_episode = this.card.querySelector('.full-episode__img');
        this.card.querySelector('.full-episode__name').innerText = data.title;
        this.card.querySelector('.full-episode__num').innerText = episode.episode_number || '';
        this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : '----';
        if (data.release_year == '0000') this.card.querySelector('.card__age').remove();
        else this.card.querySelector('.card__age').innerText = data.release_year;
        this.card.addEventListener('hover:enter', this.onEnter.bind(this));
      };

      this.image = function() {
        this.img_poster.onload = () => {};
        this.img_poster.onerror = () => { this.img_poster.src = './img/img_broken.svg'; };
        this.img_episode.onload = () => { this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded'); };
        this.img_episode.onerror = () => { this.img_episode.src = './img/img_broken.svg'; };
      };

      this.ready = function() {
        this.build();
        this.card.addEventListener('hover:focus', () => { if (this.onFocus) this.onFocus(this.card, data); });
        this.card.addEventListener('hover:hover', () => { if (this.onHover) this.onHover(this.card, data); });
        this.card.addEventListener('hover:enter', () => { if (this.onEnter) this.onEnter(this.card, data); });
        this.image();
      };

      this.visible = function() {
        if (data.backdrop_path) this.img_poster.src = Lampa.Api.img(data.backdrop_path);
        else if (data.poster_path) this.img_poster.src = Lampa.Api.img(data.poster_path);
        else if (data.poster) this.img_poster.src = data.poster;
        else if (data.img) this.img_poster.src = data.img;
        else this.img_poster.src = './img/img_broken.svg';
        if (episode.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
        else if (data.profile_path) this.img_episode.src = Lampa.Api.img(data.profile_path, 'w300');
        else if (episode.img) this.img_episode.src = episode.img;
        else if (data.img) this.img_episode.src = data.img;
        else this.img_episode.src = './img/img_broken.svg';
        if (this.onVisible) this.onVisible(this.card, data);
      };

      this.destroy = function() {
        this.img_poster.onerror = () => {};
        this.img_poster.onload = () => {};
        this.img_episode.onerror = () => {};
        this.img_episode.onload = () => {};
        this.img_poster.src = '';
        this.img_episode.src = '';
        this.card.remove();
        this.card = null;
        this.img_poster = null;
        this.img_episode = null;
      };

      this.render = function(full) { return full ? this.card : $(this.card); };
    }

    function RusTmdb(api) {
      this.network = new Lampa.Reguest();
      this.main = function() {
        const randomRanges = [{start:2023,end:2025},{start:2020,end:2022},{start:2017,end:2019},{start:2014,end:2016},{start:2011,end:2013}];
        const range1 = randomRanges[Math.floor(Math.random() * randomRanges.length)];
        const from1 = range1.start + '-01-01';
        const to1 = range1.end + '-12-31';
        const range2 = randomRanges[Math.floor(Math.random() * randomRanges.length)];
        const from2 = range2.start + '-01-01';
        const to2 = range2.end + '-12-31';
        const movieSorts = ['popularity.desc', 'vote_average.desc', 'vote_count.desc', 'revenue.desc'];
        const movieSort = movieSorts[Math.floor(Math.random() * movieSorts.length)];
        const tvSorts = ['popularity.desc', 'vote_count.desc', 'vote_average.desc'];
        const tvSort = tvSorts[Math.floor(Math.random() * tvSorts.length)];
        const today = new Date().toISOString().substr(0, 10);
        const params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        const oncompl = arguments[1];
        const onerr = arguments[2];
        const parallelCount = 6;
        const loaders = [
          (cb) => { this.get('trending/all/day', params, (data) => { data.title = Lampa.Lang.translate('title_trend_day'); data.wide = true; data.line_type = 'wide'; cb(data); }, cb); },
          (cb) => { cb({ source: 'main', results: Lampa.TimeTable.lately().slice(0, 20), title: Lampa.Lang.translate('title_now_watch'), nomore: true, cardClass: (item, episode) => new Card(item, episode) }); },
          (cb) => { this.get('trending/all/week', params, (data) => { data.title = Lampa.Lang.translate('title_trend_week'); cb(data); }, cb); },
          (cb) => { this.get('movie/popular', params, (data) => { data.title = Lampa.Lang.translate('title_popular_movie'); cb(data); }, cb); },
          (cb) => { this.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Русские фильмы'); data.small = true; data.line_type = 'small'; data.results.forEach(r => { r.promo = r.overview; r.promo_title = r.title || r.name; }); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Русские сериалы'); cb(data); }, cb); },
          (cb) => { this.get('tv/popular', params, (data) => { data.title = Lampa.Lang.translate('title_popular_tv'); cb(data); }, cb); },
          (cb) => { this.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Русские мультфильмы'); data.wide = true; data.line_type = 'wide'; cb(data); }, cb); },
          (cb) => { this.get('movie/now_playing', params, (data) => { data.title = Lampa.Lang.translate('title_upcoming'); cb(data); }, cb); },
          (cb) => { this.get('movie/upcoming', params, (data) => { data.title = Lampa.Lang.translate('title_upcoming'); cb(data); }, cb); },
          (cb) => { this.get(`discover/movie?primary_release_date.gte=${from2}&primary_release_date.lte=${to2}&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${tvSort}`, params, (data) => { data.title = Lampa.Lang.translate('Подборки русских фильмов'); data.line_type = 'top'; cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?first_air_date.gte=${from1}&first_air_date.lte=${to1}&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=`, params, (data) => { data.title = Lampa.Lang.translate('Подборки русских сериалов'); data.line_type = 'center'; cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('СТС'); data.collection = true; data.line_type = true; data.results.forEach(r => { r.promo = r.overview; r.promo_title = r.title || r.name; }); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('ТНТ'); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('KION'); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Premier'); data.collection = true; data.line_type = 'wide'; cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Okko'); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('КиноПоиск'); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Wink'); data.small = true; data.line_type = true; data.results.forEach(r => { r.promo = r.overview; r.promo_title = r.title || r.name; }); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('Start'); cb(data); }, cb); },
          (cb) => { this.get(`discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => { data.title = Lampa.Lang.translate('IVI'); cb(data); }, cb); },
          (cb) => { this.get('movie/top_rated', params, (data) => { data.title = Lampa.Lang.translate('title_top_movie'); data.line_type = 'center'; cb(data); }, cb); },
          (cb) => { this.get('tv/top_rated', params, (data) => { data.title = Lampa.Lang.translate('title_top_tv'); data.line_type = 'center'; cb(data); }, cb); }
        ];
        loaders.length += 1;
        Lampa.Arrays.apply(loaders, 0, Lampa.Api.arraysLoad(loaders, parallelCount, 'movie', loaders.length));
        api.genres.forEach(genre => {
          loaders.push((cb) => {
            this.get(`discover/movie?with_genres=${genre.id}`, params, (data) => {
              data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
              cb(data);
            }, cb);
          });
        });

        function loadParallel(oncompl, onerr) {
          Lampa.Api.arraysLoad(loaders, parallelCount, oncompl, onerr);
        }
        return loadParallel(oncompl, onerr);
      };
    }

    if (Lampa.Storage.get('rus_movie_main') !== false) {
      Object.assign(Lampa.Api.sources.tmdb, new RusTmdb(Lampa.Api.sources.tmdb));
    }

    if (Lampa.Storage.get('rus_movie_main') == 'main') {
      const source = Lampa.Storage.get('rus_movie_main');
      const interval = setInterval(() => {
        const act = Lampa.Activity.active();
        const menuList = $('.menu .menu__list');
        if (act && act.component === 'main' && !(menuList.length > 0)) {
          clearInterval(interval);
          Lampa.Activity.push({ source, title: Lampa.Lang.translate('Русские новинки') + ' - ' + Lampa.Storage.field('rus_movie_main').toUpperCase() });
        }
      }, 200);
    }

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { name: 'rus_movie_main', type: 'select', default: true },
      field: { name: 'Русские новинки на главной', description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)' },
      onRender: (item) => { setTimeout(() => { $('div[data-name="interface_size"]').insertAfter(item); }, 0); }
    });
  }

  if (window.appready) main();
  else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') main(); });
})();
