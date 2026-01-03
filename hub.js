(function() {
    'use strict';

    Lampa.Platform.tv();

    function CustomCard(data) {
        const item = data.source || data;
        const episode = data.episode || {};

        if (item.source === undefined) item.source = 'tmdb';

        Lampa.Api.info(item, {
            title: item.title,
            original_title: item.original_name,
            release_date: item.release_date
        });

        item.release_year = ((item.release_date || '0000') + '').substr(0, 4);

        function hideElement(elem) {
            if (elem) elem.style.display = 'none';
        }

        this.build = function() {
            this.card = Lampa.Template.js('card');
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};

            this.card.querySelector('.card__title').innerText = item.title;
            this.card.querySelector('.card__age').innerText = item.release_year;

            if (episode && episode.air_date) {
                this.card.querySelector('.full-episode__name').innerText = episode.name || Lampa.Lang.translate('episode');
                this.card.querySelector('.full-episode__date').innerText = episode.air_date || '';
                this.card.querySelector('.full-episode__num').innerText = episode.episode_number ? Lampa.Utils.parseTime(episode.episode_number).full : '----';
            }

            if (item.release_year == '0000') hideElement(this.card.querySelector('.card__age'));

            this.card.addEventListener('hover:focus', this.image.bind(this));
        };

        this.image = function() {
            this.img_poster.onerror = function() {};
            this.img_poster.onload = function() {};
            this.img_episode.onerror = function() {
                this.img_episode.src = './img/img_broken.svg';
            };
            this.img_episode.onload = function() {
                this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            };

            if (item.poster_path) {
                this.img_poster.src = Lampa.Api.img(item.poster_path);
            } else if (item.backdrop_path) {
                this.img_poster.src = Lampa.Api.img(item.backdrop_path);
            } else if (item.profile_path) {
                this.img_poster.src = item.profile_path;
            } else if (item.img) {
                this.img_poster.src = item.img;
            } else {
                this.img_poster.src = './img/img_broken.svg';
            }

            if (episode.still_path) {
                this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
            } else if (item.still_path) {
                this.img_episode.src = Lampa.Api.img(item.still_path, 'w300');
            } else if (episode.img) {
                this.img_episode.src = episode.img;
            } else if (item.img) {
                this.img_episode.src = item.img;
            } else {
                this.img_episode.src = './img/img_broken.svg';
            }

            if (this.onVisible) this.onVisible(this.card, item);
        };

        this.create = function() {
            this.build();

            this.card.addEventListener('hover:focus', function() {
                if (this.onFocus) this.onFocus(this.card, item);
            }.bind(this));

            this.card.addEventListener('hover:hover', function() {
                if (this.onHover) this.onHover(this.card, item);
            }.bind(this));

            this.card.addEventListener('hover:enter', function() {
                if (this.onEnter) this.onEnter(this.card, item);
            }.bind(this));

            this.image();
        };

        this.destroy = function() {
            this.img_poster.onerror = function() {};
            this.img_poster.onload = function() {};
            this.img_episode.onerror = function() {};
            this.img_episode.onload = function() {};

            this.img_poster.src = '';
            this.img_episode.src = '';

            hideElement(this.card);
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        };

        this.render = function(full) {
            return full ? this.card : $(this.card);
        };
    }

    function PersonalHub(base) {
        this.base = base;
        this.request = base.request.bind(base);
        this.discovery = false;

        this.main = function(params = {}, onRender, onError) {
            const that = this;
            const concurrency = 56;
            const categories = [
                {id: 'now_watch', order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1, active: !Lampa.Storage.get('now_watch_remove')},
                {id: 'upcoming_episodes', order: 2, active: !Lampa.Storage.get('upcoming_episodes_remove')},
                {id: 'trend_day', order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3, active: !Lampa.Storage.get('trend_day_remove')},
                {id: 'trend_day_tv', order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4, active: !Lampa.Storage.get('trend_day_tv_remove')},
                {id: 'trend_day_film', order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) || 5, active: !Lampa.Storage.get('trend_day_film_remove')},
                {id: 'trend_week', order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6, active: !Lampa.Storage.get('trend_week_remove')},
                {id: 'trend_week_tv', order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7, active: !Lampa.Storage.get('trend_week_tv_remove')},
                {id: 'trend_week_film', order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) || 8, active: !Lampa.Storage.get('trend_week_film_remove')},
                {id: 'upcoming', order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9, active: !Lampa.Storage.get('upcoming_remove')},
                {id: 'top_movie', order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 10, active: !Lampa.Storage.get('top_movie_remove')},
                {id: 'top_tv', order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 11, active: !Lampa.Storage.get('top_tv_remove')},
                {id: 'popular_movie', order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) || 12, active: !Lampa.Storage.get('popular_movie_remove')},
                {id: 'popular_tv', order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 13, active: !Lampa.Storage.get('popular_tv_remove')},
                {id: 'netflix', order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14, active: !Lampa.Storage.get('netflix_remove')},
                {id: 'apple_tv', order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15, active: !Lampa.Storage.get('apple_tv_remove')},
                {id: 'prime_video', order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16, active: !Lampa.Storage.get('prime_video_remove')},
                {id: 'hbo', order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 17, active: !Lampa.Storage.get('hbo_remove')},
                {id: 'mgm', order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 18, active: !Lampa.Storage.get('mgm_remove')},
                {id: 'dorams', order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19, active: !Lampa.Storage.get('dorams_remove')},
                {id: 'tur_serials', order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20, active: !Lampa.Storage.get('tur_serials_remove')},
                {id: 'ind_films', order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21, active: !Lampa.Storage.get('ind_films_remove')},
                {id: 'rus_movie', order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22, active: !Lampa.Storage.get('rus_movie_remove')},
                {id: 'rus_tv', order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23, active: !Lampa.Storage.get('rus_tv_remove')},
                {id: 'rus_mult', order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24, active: !Lampa.Storage.get('rus_mult_remove')},
                {id: 'start', order: parseInt(Lampa.Storage.get('number_start'), 10) || 25, active: !Lampa.Storage.get('start_remove')},
                {id: 'premier', order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26, active: !Lampa.Storage.get('premier_remove')},
                {id: 'ivi', order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 27, active: !Lampa.Storage.get('ivi_remove')},
                {id: 'okko', order: parseInt(Lampa.Storage.get('number_okko'), 10) || 28, active: !Lampa.Storage.get('okko_remove')},
                {id: 'kion', order: parseInt(Lampa.Storage.get('number_kion'), 10) || 29, active: !Lampa.Storage.get('kion_remove')},
                {id: 'kinopoisk', order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30, active: !Lampa.Storage.get('kinopoisk_remove')},
                {id: 'wink', order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31, active: !Lampa.Storage.get('wink_remove')},
                {id: 'sts', order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32, active: !Lampa.Storage.get('sts_remove')},
                {id: 'tnt', order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33, active: !Lampa.Storage.get('tnt_remove')},
                {id: 'collections_inter_tv', order: parseInt(Lampa.Storage.get('number_collections_inter_tv'), 10) || 34, active: !Lampa.Storage.get('collections_inter_tv_remove')},
                {id: 'collections_rus_tv', order: parseInt(Lampa.Storage.get('number_collections_rus_tv'), 10) || 35, active: !Lampa.Storage.get('collections_rus_tv_remove')},
                {id: 'collections_inter_movie', order: parseInt(Lampa.Storage.get('number_collections_inter_movie'), 10) || 36, active: !Lampa.Storage.get('collections_inter_movie_remove')},
                {id: 'collections_rus_movie', order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37, active: !Lampa.Storage.get('collections_rus_movie_remove')}
            ];

            const processed = [];

            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            const sort = Lampa.Storage.get('bylampa_source_params', 'popularity.desc');
            const minDate = new Date();
            minDate.setMonth(minDate.getMonth() - 6);
            const maxDate = new Date().toISOString().slice(0, 10);
            const minYear = new Date();
            minYear.setMonth(0);
            minYear.setDate(1);
            minYear.setFullYear(minYear.getFullYear() - 5);
            const genres_cat = Lampa.Storage.get('genres_cat', []);

            const dateNow = new Date().toISOString().slice(0, 10);
            const dateYear = new Date().getFullYear() + '-12-31';
            const dateYearStart = new Date().getFullYear() + '-01-01';
            const dateLastYear = (new Date().getFullYear() - 1) + '-01-01';

            const activeCategories = categories.filter(cat => cat.active).sort((a, b) => a.order - b.order);
            if (activeCategories.length === 0) return onError('Нет доступных категорий для загрузки.');

            const requests = [];
            activeCategories.forEach(cat => {
                if (!processed.includes(cat.id) && that[cat.id]) {
                    requests.push(that[cat.id].bind(that));
                    processed.push(cat.id);
                }
            });

            if (Lampa.Storage.get('genres_shuffle', false) == false && that.base.genres) {
                that.base.genres.forEach(genre => {
                    if (!processed.includes(genre.id)) {
                        const genreReq = function(callback) {
                            that.request('discover/movie?with_genres=' + genre.id + '&primary_release_date.gte=' + dateLastYear + '&primary_release_date.lte=' + dateYear + '&vote_average.gte=5&vote_average.lte=9.5&sort_by=' + sort, {}, data => {
                                data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                                shuffle(data.results);
                                callback(data);
                            }, callback);
                        };
                        requests.push(genreReq);
                        processed.push(genre.id);
                    }
                });
            }

            if (requests.length > 0) {
                Lampa.Api.parallel(requests, concurrency, onRender, onError);
            } else {
                console.log('PersonalHub', 'No requests');
            }

            function render(data) {
                onRender(data);
            }
            render(onRender, onError);
            return render;
        };

        this.now_watch = function(callback) {
            const lately = Lampa.Activity.lately();
            const data = lately ? lately : {results: [], title: Lampa.Lang.translate('now_watch_display')};
            callback(data);
        };

        this.upcoming_episodes = function(callback) {
            const timetable = new Lampa.TimeTable();
            timetable.get((data) => {
                data.title = Lampa.Lang.translate('title_upcoming_episodes');
                callback(data);
            }, callback);
        };

        this.trend_day = function(callback) {
            this.request('trending/all/day', {}, (data) => {
                data.title = Lampa.Lang.translate('title_trend_day');
                if (Lampa.Storage.get('trend_day_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.trend_day_tv = function(callback) {
            this.request('trending/tv/day', {}, (data) => {
                data.title = Lampa.Lang.translate('trend_day_tv');
                if (Lampa.Storage.get('trend_day_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.trend_day_film = function(callback) {
            this.request('trending/movie/day', {}, (data) => {
                data.title = Lampa.Lang.translate('trend_day_film');
                if (Lampa.Storage.get('trend_day_film_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.trend_week = function(callback) {
            this.request('trending/all/week', {}, (data) => {
                data.title = Lampa.Lang.translate('trend_week');
                if (Lampa.Storage.get('trend_week_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.trend_week_tv = function(callback) {
            this.request('trending/tv/week', {}, (data) => {
                data.title = Lampa.Lang.translate('trend_week_tv');
                if (Lampa.Storage.get('trend_week_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.trend_week_film = function(callback) {
            this.request('trending/movie/week', {}, (data) => {
                data.title = Lampa.Lang.translate('trend_week_film');
                if (Lampa.Storage.get('trend_week_film_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.upcoming = function(callback) {
            this.request('movie/upcoming', {}, (data) => {
                data.title = Lampa.Lang.translate('title_upcoming');
                if (Lampa.Storage.get('upcoming_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.top_movie = function(callback) {
            this.request('movie/top_rated', {}, (data) => {
                data.title = Lampa.Lang.translate('top_movie');
                if (Lampa.Storage.get('top_movie_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.top_tv = function(callback) {
            this.request('tv/top_rated', {}, (data) => {
                data.title = Lampa.Lang.translate('top_tv');
                if (Lampa.Storage.get('top_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.popular_movie = function(callback) {
            this.request('movie/popular', {}, (data) => {
                data.title = Lampa.Lang.translate('popular_movie');
                if (Lampa.Storage.get('popular_movie_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.popular_tv = function(callback) {
            this.request('tv/popular', {}, (data) => {
                data.title = Lampa.Lang.translate('popular_tv');
                if (Lampa.Storage.get('popular_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.netflix = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Netflix');
                const display = Lampa.Storage.get('netflix_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('netflix_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.apple_tv = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Apple TV+');
                const display = Lampa.Storage.get('apple_tv_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('apple_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.prime_video = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Prime Video');
                const display = Lampa.Storage.get('prime_video_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('prime_video_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.hbo = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('HBO');
                const display = Lampa.Storage.get('hbo_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('hbo_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.mgm = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('MGM+');
                const display = Lampa.Storage.get('mgm_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('mgm_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.dorams = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Дорамы');
                const display = Lampa.Storage.get('dorams_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('dorams_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.tur_serials = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Турецкие сериалы');
                const display = Lampa.Storage.get('tur_serials_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('tur_serials_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.ind_films = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=hi&sort_by=primary_release_date.desc&primary_release_date.lte=${date}&primary_release_date.gte=${dateLastYear}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Индийские фильмы');
                const display = Lampa.Storage.get('ind_films_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('ind_films_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.rus_movie = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${date}&primary_release_date.gte=${dateLastYear}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Русские фильмы');
                const display = Lampa.Storage.get('rus_movie_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_movie_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.rus_tv = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Русские сериалы');
                const display = Lampa.Storage.get('rus_tv_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.rus_mult = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${date}&primary_release_date.gte=${dateLastYear}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Русские мультфильмы');
                const display = Lampa.Storage.get('rus_mult_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_mult_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.start = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Start');
                const display = Lampa.Storage.get('start_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('start_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.premier = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Premier');
                const display = Lampa.Storage.get('premier_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('premier_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.ivi = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('IVI');
                const display = Lampa.Storage.get('ivi_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('ivi_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.okko = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Okko');
                const display = Lampa.Storage.get('okko_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('okko_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.kion = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('KION');
                const display = Lampa.Storage.get('kion_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('kion_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.kinopoisk = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('КиноПоиск');
                const display = Lampa.Storage.get('kinopoisk_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('kinopoisk_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.wink = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Wink');
                const display = Lampa.Storage.get('wink_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('wink_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.sts = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('СТС');
                const display = Lampa.Storage.get('sts_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('sts_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.tnt = function(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${date}`, {}, (data) => {
                data.title = Lampa.Lang.translate('ТНТ');
                const display = Lampa.Storage.get('tnt_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('tnt_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.collections_inter_tv = function(callback) {
            const sort = Lampa.Storage.get('bylampa_source_params', 'popularity.desc');
            const minDateStr = minDate.toISOString().slice(0, 10);
            const maxDateStr = new Date().toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=213|2552|1024|6219|49&sort_by=${sort}&air_date.lte=${maxDateStr}&first_air_date.gte=${minDateStr}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Подборки зарубежных сериалов');
                const display = Lampa.Storage.get('collections_inter_tv_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_inter_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.collections_rus_tv = function(callback) {
            const sort = Lampa.Storage.get('bylampa_source_params', 'popularity.desc');
            const maxDateStr = new Date().toISOString().slice(0, 10);
            const minDateStr = minDate.toISOString().slice(0, 10);
            this.request(`discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=${sort}&first_air_date.lte=${maxDateStr}&first_air_date.gte=${minDateStr}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Подборки русских сериалов');
                const display = Lampa.Storage.get('collections_rus_tv_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_rus_tv_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.collections_inter_movie = function(callback) {
            const sort = Lampa.Storage.get('bylampa_source_params', 'popularity.desc');
            const minDateStr = minDate.toISOString().slice(0, 10);
            const maxDateStr = new Date().toISOString().slice(0, 10);
            this.request(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=${sort}&primary_release_date.lte=${maxDateStr}&primary_release_date.gte=${minDateStr}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Подборки зарубежных фильмов');
                const display = Lampa.Storage.get('collections_inter_movie_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_inter_movie_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };

        this.collections_rus_movie = function(callback) {
            const sort = Lampa.Storage.get('bylampa_source_params', 'popularity.desc');
            const minDateStr = minDate.toISOString().slice(0, 10);
            const maxDateStr = new Date().toISOString().slice(0, 10);
            this.request(`discover/movie?primary_release_date.gte=${minDateStr}&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${sort}&primary_release_date.lte=${maxDateStr}`, {}, (data) => {
                data.title = Lampa.Lang.translate('Подборки русских фильмов');
                const display = Lampa.Storage.get('collections_rus_movie_display', '1');
                if (display == '2') {
                    data.collection = true;
                    data.line_type = 'collection';
                }
                if (display == '3') {
                    data.small = true;
                    data.wide = true;
                    data.results.forEach(item => {
                        item.promo = item.overview;
                        item.promo_title = item.title || item.name;
                    });
                }
                if (display == '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_rus_movie_shuffle')) shuffle(data.results);
                callback(data);
            }, callback);
        };
    }

    const personalHub = Object.assign({}, Lampa.Api.sources.tmdb, new PersonalHub(Lampa.Api.sources.tmdb));
    Lampa.Api.sources.personalhub = personalHub;
    Object.defineProperty(Lampa.Api.sources, 'PersonalHub', { get: function() { return personalHub; } });

    Lampa.Settings.select('source', Object.assign({}, Lampa.Settings.main().field.source.values, {PersonalHub: 'PersonalHub'}), 'tmdb');

    if (Lampa.Storage.get('source') == 'PersonalHub') {
        const interval = setInterval(() => {
            const controller = Lampa.Controller.active();
            if (controller) {
                clearInterval(interval);
                Lampa.Controller.toggle('main');
                Lampa.Activity.push({source: Lampa.Storage.get('source'), title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase()});
            }
        }, 300);
    }

    Lampa.Settings.listener.follow('open', (e) => {
        if (e.name == 'more') {
            if (Lampa.Settings.main().render().find('[data-component="bylampa_source"]').length == 0) {
                Lampa.SettingsApi.addComponent({component: 'bylampa_source', name: 'Источник PersonalHub'});
            }
            Lampa.Settings.main().update();
            Lampa.Settings.main().render().find('div[data-name="source"]') .hide();
        }
    });

    Lampa.SettingsApi.addComponent({
        component: 'bylampa_source',
        param: {name: 'bylampa_source', type: 'toggle', default: true},
        field: {name: 'Источник PersonalHub', description: 'Настройки главного экрана'},
        onRender: function(item) {
            setTimeout(() => {
                $('div[data-name="source"]').parent().insertAfter($('.settings-param > div:contains("Источник PersonalHub")'));
                if (Lampa.Storage.field('source') !== 'PersonalHub') item.hide();
                else item.show();
            }, 20);
            item.on('hover:enter', () => {
                Lampa.Settings.open('bylampa_source');
                Lampa.Controller.active().field.back = function() {
                    Lampa.Settings.open('more');
                };
            });
        }
    });

    Lampa.Storage.listener.follow('change', (e) => {
        if (e.name == 'source') {
            setTimeout(() => {
                if (Lampa.Storage.get('source') !== 'PersonalHub') {
                    $('.settings-param > div:contains("Источник PersonalHub")').parent().hide();
                } else {
                    $('.settings-param > div:contains("Источник PersonalHub")').parent().show();
                }
            }, 50);
        }
    });

    function addSettings(id, title, description, shuffleDefault, displayDefault, orderDefault, removeDefault) {
        Lampa.Settings.listener.follow('open', (e) => {
            if (e.name === 'more') {
                if (Lampa.Settings.main().render().find('[data-component="' + id + '"]').length === 0) {
                    Lampa.SettingsApi.addComponent({component: id, name: title});
                }
                Lampa.Settings.main().update();
                Lampa.Settings.main().render().find('[data-component="bylampa_source"]').addClass('hide');
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: {name: id, type: 'toggle', default: true},
            field: {name: title, description: description},
            onRender: function(item) {
                item.on('hover:enter', (e) => {
                    const target = e.target;
                    const parent = target.parentElement;
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(target) + 1;
                    Lampa.Settings.open(id);
                    Lampa.Controller.active().field.back = function() {
                        Lampa.Settings.open('bylampa_source');
                        setTimeout(() => {
                            const elem = document.querySelector('#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(' + index + ')');
                            Lampa.Controller.focus(elem);
                            Lampa.Controller.toggle('settings_component');
                        }, 5);
                    };
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: id,
            param: {name: id + '_shuffle', type: 'toggle', default: shuffleDefault},
            field: {name: 'Перемешивать'}
        });

        Lampa.SettingsApi.addParam({
            component: id,
            param: {name: id + '_display', type: 'select', values: {1: 'Стандарт', 2: 'Коллекция', 3: 'Широкие маленькие', 4: 'Широкие большие'}, default: displayDefault},
            field: {name: 'Вид отображения'}
        });

        Lampa.SettingsApi.addParam({
            component: id,
            param: {name: 'number_' + id, type: 'select', values: {
                1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
                11: '11', 12: '12', 13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20',
                21: '21', 22: '22', 23: '23', 24: '24', 25: '25', 26: '26', 27: '27', 28: '28', 29: '29', 30: '30',
                31: '31', 32: '32', 33: '33', 34: '34', 35: '35', 36: '36', 37: '37'
            }, default: orderDefault},
            field: {name: 'Порядок отображения'},
            onChange: function(value) {}
        });

        Lampa.SettingsApi.addParam({
            component: id,
            param: {name: id + '_remove', type: 'toggle', default: removeDefault},
            field: {name: 'Убрать с главной страницы'}
        });
    }

    addSettings('now_watch', 'Сейчас смотрят', 'Нажми для настройки', false, '1', '1', false);
    addSettings('upcoming_episodes', 'Выход ближайших эпизодов', 'Нажми для настройки', false, '1', '2', false);
    addSettings('trend_day', 'Сегодня в тренде', 'Нажми для настройки', false, '1', '3', false);
    addSettings('trend_day_tv', 'Сегодня в тренде (сериалы)', 'Нажми для настройки', true, '1', '4', false);
    addSettings('trend_day_film', 'Сегодня в тренде (фильмы)', 'Нажми для настройки', true, '1', '5', false);
    addSettings('trend_week', 'В тренде за неделю', 'Нажми для настройки', false, '1', '6', false);
    addSettings('trend_week_tv', 'В тренде за неделю (сериалы)', 'Нажми для настройки', true, '1', '7', false);
    addSettings('trend_week_film', 'В тренде за неделю (фильмы)', 'Нажми для настройки', true, '1', '8', false);
    addSettings('upcoming', 'Смотрите в кинозалах', 'Нажми для настройки', false, '1', '9', false);
    addSettings('top_movie', 'Топ фильмы', 'Нажми для настройки', false, '1', '10', false);
    addSettings('top_tv', 'Топ сериалы', 'Нажми для настройки', false, '1', '11', false);
    addSettings('popular_movie', 'Популярные фильмы', 'Нажми для настройки', false, '4', '12', false);
    addSettings('popular_tv', 'Популярные сериалы', 'Нажми для настройки', false, '4', '13', false);
    addSettings('netflix', 'Netflix', 'Нажми для настройки', true, '1', '14', false);
    addSettings('apple_tv', 'Apple TV+', 'Нажми для настройки', true, '1', '15', false);
    addSettings('prime_video', 'Prime Video', 'Нажми для настройки', true, '1', '16', false);
    addSettings('hbo', 'HBO', 'Нажми для настройки', true, '1', '17', false);
    addSettings('mgm', 'MGM+', 'Нажми для настройки', true, '1', '18', false);
    addSettings('dorams', 'Дорамы', 'Нажми для настройки', true, '1', '19', false);
    addSettings('tur_serials', 'Турецкие сериалы', 'Нажми для настройки', true, '1', '20', false);
    addSettings('ind_films', 'Индийские фильмы', 'Нажми для настройки', true, '1', '21', false);
    addSettings('rus_movie', 'Русские фильмы', 'Нажми для настройки', true, '1', '22', false);
    addSettings('rus_tv', 'Русские сериалы', 'Нажми для настройки', true, '1', '23', false);
    addSettings('rus_mult', 'Русские мультфильмы', 'Нажми для настройки', true, '1', '24', false);
    addSettings('start', 'Start', 'Нажми для настройки', true, '1', '25', false);
    addSettings('premier', 'Premier', 'Нажми для настройки', true, '1', '26', false);
    addSettings('ivi', 'ИВИ', 'Нажми для настройки', true, '1', '27', false);
    addSettings('okko', 'OKKO', 'Нажми для настройки', true, '1', '28', false);
    addSettings('kion', 'KION', 'Нажми для настройки', true, '1', '29', false);
    addSettings('kinopoisk', 'КиноПоиск', 'Нажми для настройки', true, '1', '30', false);
    addSettings('wink', 'Wink', 'Нажми для настройки', true, '1', '31', false);
    addSettings('sts', 'СТС', 'Нажми для настройки', true, '1', '32', false);
    addSettings('tnt', 'ТНТ', 'Нажми для настройки', true, '1', '33', false);
    addSettings('collections_inter_tv', 'Подборки зарубежных сериалов', 'Нажми для настройки', true, '1', '34', false);
    addSettings('collections_rus_tv', 'Подборки русских сериалов', 'Нажми для настройки', true, '1', '35', false);
    addSettings('collections_inter_movie', 'Подборки зарубежных фильмов', 'Нажми для настройки', true, '1', '36', false);
    addSettings('collections_rus_movie', 'Подборки русских фильмов', 'Нажми для настройки', true, '1', '37', false);

    Lampa.SettingsApi.addParam({
        component: 'bylampa_source',
        param: {name: 'upcoming_episodes_remove', type: 'toggle', default: false},
        field: {name: 'Убрать с главной страницы', description: 'Порядок отображения'}
    });

    Lampa.SettingsApi.addParam({
        component: 'bylampa_source',
        param: {name: 'genres_shuffle', type: 'toggle', default: true},
        field: {name: 'Изменять порядок карточек на главной'}
    });

    const initInterval = setInterval(() => {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('bylampa_source_params', 'popularity.desc')) initDefaultSettings();
        }
    }, 200);

    function initDefaultSettings() {
        Lampa.Storage.set('bylampa_source_params', 'popularity.desc');
        Lampa.Storage.set('trend_day_remove', 'false');
        Lampa.Storage.set('trend_day_tv_remove', 'false');
        Lampa.Storage.set('trend_day_film_remove', 'false');
        Lampa.Storage.set('trend_week_remove', 'false');
        Lampa.Storage.set('trend_week_tv_remove', 'false');
        Lampa.Storage.set('trend_week_film_remove', 'false');
        Lampa.Storage.set('upcoming_remove', 'false');
        Lampa.Storage.set('top_movie_remove', 'true');
        Lampa.Storage.set('top_tv_remove', 'true');
        Lampa.Storage.set('popular_movie_remove', 'false');
        Lampa.Storage.set('popular_tv_remove', 'false');
        Lampa.Storage.set('netflix_remove', 'false');
        Lampa.Storage.set('apple_tv_remove', 'false');
        Lampa.Storage.set('prime_video_remove', 'false');
        Lampa.Storage.set('hbo_remove', 'false');
        Lampa.Storage.set('mgm_remove', 'false');
        Lampa.Storage.set('dorams_remove', 'false');
        Lampa.Storage.set('tur_serials_remove', 'false');
        Lampa.Storage.set('ind_films_remove', 'false');
        Lampa.Storage.set('rus_movie_remove', 'false');
        Lampa.Storage.set('rus_tv_remove', 'false');
        Lampa.Storage.set('rus_mult_remove', 'false');
        Lampa.Storage.set('start_remove', 'false');
        Lampa.Storage.set('premier_remove', 'false');
        Lampa.Storage.set('ivi_remove', 'false');
        Lampa.Storage.set('okko_remove', 'false');
        Lampa.Storage.set('kion_remove', 'false');
        Lampa.Storage.set('kinopoisk_remove', 'false');
        Lampa.Storage.set('wink_remove', 'false');
        Lampa.Storage.set('sts_remove', 'false');
        Lampa.Storage.set('tnt_remove', 'false');
        Lampa.Storage.set('collections_inter_tv_remove', 'false');
        Lampa.Storage.set('collections_rus_tv_remove', 'false');
        Lampa.Storage.set('collections_inter_movie_remove', 'false');
        Lampa.Storage.set('collections_rus_movie_remove', 'false');
        Lampa.Storage.set('genres_shuffle', 'false');
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', (e) => {
        if (e.type == 'ready') init();
    });

    function init() {
        Lampa.Card = CustomCard;
    }
})();
