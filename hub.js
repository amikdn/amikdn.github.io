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
            release_date: item.release_date || item.first_air_date
        });

        item.release_year = ((item.release_date || item.first_air_date || '0000') + '').substr(0, 4);

        function hideElement(elem) {
            if (elem) elem.style.display = 'none';
        }

        this.build = function() {
            this.card = Lampa.Template.js('card');
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};

            this.card.querySelector('.card__title').innerText = item.title;
            this.card.querySelector('.card__age').innerText = item.release_year || '';

            if (episode && episode.air_date) {
                this.card.querySelector('.full-episode__name').innerText = episode.name || Lampa.Lang.translate('episode');
                this.card.querySelector('.full-episode__date').innerText = episode.air_date || '';
                this.card.querySelector('.full-episode__num').innerText = episode.episode_number ? Lampa.Utils.parseTime(episode.episode_number).full : '----';
            }

            if (item.release_year == '0000') hideElement(this.card.querySelector('.card__age'));
        };

        this.image = function() {
            this.img_poster.onerror = () => this.img_poster.src = './img/img_broken.svg';

            if (this.img_episode) {
                this.img_episode.onerror = () => this.img_episode.src = './img/img_broken.svg';
                this.img_episode.onload = () => this.card.querySelector('.full-episode__img')?.classList.add('full-episode__img--loaded');
            }

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

            if (this.img_episode) {
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
            }

            if (this.onVisible) this.onVisible(this.card, item);
        };

        this.create = function() {
            this.build();
            this.image();

            this.card.addEventListener('hover:focus', () => this.onFocus && this.onFocus(this.card, item));
            this.card.addEventListener('hover:enter', () => this.onEnter && this.onEnter(this.card, item));
            this.card.addEventListener('hover:hover', () => this.onHover && this.onHover(this.card, item));
        };

        this.destroy = function() {
            this.img_poster.src = '';
            if (this.img_episode) this.img_episode.src = '';
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        };

        this.render = function(full) {
            return full ? this.card : $(this.card);
        };
    }

    class PersonalHub {
        constructor(base) {
            this.base = base || {};

            this.request = (path, params = {}, success, error = () => {}) => {
                let url = 'https://api.themoviedb.org/3/' + path;

                const apiKey = (Lampa.TMDB && Lampa.TMDB.key && typeof Lampa.TMDB.key === 'function') ? Lampa.TMDB.key() : '4fd2d6e1a1e9e0f0a4d1d0e0a0b0c0d0';
                const language = Lampa.Storage.get('language', 'ru');

                const queryParams = new URLSearchParams({
                    api_key: apiKey,
                    language: language,
                    ...params
                });

                url += '?' + queryParams.toString();

                fetch(url)
                    .then(res => {
                        if (!res.ok) throw new Error('Network error: ' + res.status);
                        return res.json();
                    })
                    .then(data => success(data))
                    .catch(err => {
                        console.log('PersonalHub request error:', path, err);
                        error(err);
                    });
            };
        }

        shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        main(params = {}, onRender, onError) {
            const concurrency = 56;

            const categories = [
                {id: 'now_watch', order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1, active: Lampa.Storage.get('now_watch_remove', 'false') !== 'true'},
                {id: 'upcoming_episodes', order: 2, active: Lampa.Storage.get('upcoming_episodes_remove', 'false') !== 'true'},
                {id: 'trend_day', order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3, active: Lampa.Storage.get('trend_day_remove', 'false') !== 'true'},
                {id: 'trend_day_tv', order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4, active: Lampa.Storage.get('trend_day_tv_remove', 'false') !== 'true'},
                {id: 'trend_day_film', order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) || 5, active: Lampa.Storage.get('trend_day_film_remove', 'false') !== 'true'},
                {id: 'trend_week', order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6, active: Lampa.Storage.get('trend_week_remove', 'false') !== 'true'},
                {id: 'trend_week_tv', order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7, active: Lampa.Storage.get('trend_week_tv_remove', 'false') !== 'true'},
                {id: 'trend_week_film', order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) || 8, active: Lampa.Storage.get('trend_week_film_remove', 'false') !== 'true'},
                {id: 'upcoming', order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9, active: Lampa.Storage.get('upcoming_remove', 'false') !== 'true'},
                {id: 'top_movie', order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 10, active: Lampa.Storage.get('top_movie_remove', 'false') !== 'true'},
                {id: 'top_tv', order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 11, active: Lampa.Storage.get('top_tv_remove', 'false') !== 'true'},
                {id: 'popular_movie', order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) || 12, active: Lampa.Storage.get('popular_movie_remove', 'false') !== 'true'},
                {id: 'popular_tv', order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 13, active: Lampa.Storage.get('popular_tv_remove', 'false') !== 'true'},
                {id: 'netflix', order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14, active: Lampa.Storage.get('netflix_remove', 'false') !== 'true'},
                {id: 'apple_tv', order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15, active: Lampa.Storage.get('apple_tv_remove', 'false') !== 'true'},
                {id: 'prime_video', order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16, active: Lampa.Storage.get('prime_video_remove', 'false') !== 'true'},
                {id: 'hbo', order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 17, active: Lampa.Storage.get('hbo_remove', 'false') !== 'true'},
                {id: 'mgm', order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 18, active: Lampa.Storage.get('mgm_remove', 'false') !== 'true'},
                {id: 'dorams', order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19, active: Lampa.Storage.get('dorams_remove', 'false') !== 'true'},
                {id: 'tur_serials', order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20, active: Lampa.Storage.get('tur_serials_remove', 'false') !== 'true'},
                {id: 'ind_films', order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21, active: Lampa.Storage.get('ind_films_remove', 'false') !== 'true'},
                {id: 'rus_movie', order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22, active: Lampa.Storage.get('rus_movie_remove', 'false') !== 'true'},
                {id: 'rus_tv', order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23, active: Lampa.Storage.get('rus_tv_remove', 'false') !== 'true'},
                {id: 'rus_mult', order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24, active: Lampa.Storage.get('rus_mult_remove', 'false') !== 'true'},
                {id: 'start', order: parseInt(Lampa.Storage.get('number_start'), 10) || 25, active: Lampa.Storage.get('start_remove', 'false') !== 'true'},
                {id: 'premier', order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26, active: Lampa.Storage.get('premier_remove', 'false') !== 'true'},
                {id: 'ivi', order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 27, active: Lampa.Storage.get('ivi_remove', 'false') !== 'true'},
                {id: 'okko', order: parseInt(Lampa.Storage.get('number_okko'), 10) || 28, active: Lampa.Storage.get('okko_remove', 'false') !== 'true'},
                {id: 'kion', order: parseInt(Lampa.Storage.get('number_kion'), 10) || 29, active: Lampa.Storage.get('kion_remove', 'false') !== 'true'},
                {id: 'kinopoisk', order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30, active: Lampa.Storage.get('kinopoisk_remove', 'false') !== 'true'},
                {id: 'wink', order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31, active: Lampa.Storage.get('wink_remove', 'false') !== 'true'},
                {id: 'sts', order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32, active: Lampa.Storage.get('sts_remove', 'false') !== 'true'},
                {id: 'tnt', order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33, active: Lampa.Storage.get('tnt_remove', 'false') !== 'true'},
                {id: 'collections_inter_tv', order: parseInt(Lampa.Storage.get('number_collections_inter_tv'), 10) || 34, active: Lampa.Storage.get('collections_inter_tv_remove', 'false') !== 'true'},
                {id: 'collections_rus_tv', order: parseInt(Lampa.Storage.get('number_collections_rus_tv'), 10) || 35, active: Lampa.Storage.get('collections_rus_tv_remove', 'false') !== 'true'},
                {id: 'collections_inter_movie', order: parseInt(Lampa.Storage.get('number_collections_inter_movie'), 10) || 36, active: Lampa.Storage.get('collections_inter_movie_remove', 'false') !== 'true'},
                {id: 'collections_rus_movie', order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37, active: Lampa.Storage.get('collections_rus_movie_remove', 'false') !== 'true'}
            ];

            const processed = [];
            const requests = [];

            const activeCategories = categories.filter(cat => cat.active).sort((a, b) => a.order - b.order);

            if (activeCategories.length === 0) {
                if (onError) onError('Нет доступных категорий для загрузки.');
                return;
            }

            activeCategories.forEach(cat => {
                if (!processed.includes(cat.id) && typeof this[cat.id] === 'function') {
                    requests.push(this[cat.id].bind(this));
                    processed.push(cat.id);
                }
            });

            if (requests.length > 0) {
                Lampa.Api.parallel(requests, concurrency, onRender, onError);
            }
        }

        now_watch(callback) {
            const lately = Lampa.Activity.lately();
            const data = lately || {results: [], title: 'Сейчас смотрят'};
            callback(data);
        }

        upcoming_episodes(callback) {
            if (typeof Lampa.TimeTable === 'function') {
                const timetable = new Lampa.TimeTable();
                timetable.get(data => {
                    data.title = 'Выход ближайших эпизодов';
                    callback(data);
                }, () => callback({results: [], title: 'Выход ближайших эпизодов'}));
            } else {
                callback({results: [], title: 'Выход ближайших эпизодов'});
            }
        }

        trend_day(callback) {
            this.request('trending/all/day', {}, data => {
                data.title = 'Сегодня в тренде';
                if (Lampa.Storage.get('trend_day_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        trend_day_tv(callback) {
            this.request('trending/tv/day', {}, data => {
                data.title = 'Сегодня в тренде (сериалы)';
                if (Lampa.Storage.get('trend_day_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        trend_day_film(callback) {
            this.request('trending/movie/day', {}, data => {
                data.title = 'Сегодня в тренде (фильмы)';
                if (Lampa.Storage.get('trend_day_film_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        trend_week(callback) {
            this.request('trending/all/week', {}, data => {
                data.title = 'В тренде за неделю';
                if (Lampa.Storage.get('trend_week_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        trend_week_tv(callback) {
            this.request('trending/tv/week', {}, data => {
                data.title = 'В тренде за неделю (сериалы)';
                if (Lampa.Storage.get('trend_week_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        trend_week_film(callback) {
            this.request('trending/movie/week', {}, data => {
                data.title = 'В тренде за неделю (фильмы)';
                if (Lampa.Storage.get('trend_week_film_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        upcoming(callback) {
            this.request('movie/upcoming', {}, data => {
                data.title = 'Смотрите в кинозалах';
                if (Lampa.Storage.get('upcoming_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        top_movie(callback) {
            this.request('movie/top_rated', {}, data => {
                data.title = 'Топ фильмы';
                if (Lampa.Storage.get('top_movie_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        top_tv(callback) {
            this.request('tv/top_rated', {}, data => {
                data.title = 'Топ сериалы';
                if (Lampa.Storage.get('top_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        popular_movie(callback) {
            this.request('movie/popular', {}, data => {
                data.title = 'Популярные фильмы';
                if (Lampa.Storage.get('popular_movie_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        popular_tv(callback) {
            this.request('tv/popular', {}, data => {
                data.title = 'Популярные сериалы';
                if (Lampa.Storage.get('popular_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        netflix(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '213', first_air_date_gte: '2020-01-01', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'Netflix';
                const display = Lampa.Storage.get('netflix_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('netflix_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        apple_tv(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '2552', first_air_date_gte: '2020-01-01', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'Apple TV+';
                const display = Lampa.Storage.get('apple_tv_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('apple_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        prime_video(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '1024', first_air_date_gte: '2020-01-01', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'Prime Video';
                const display = Lampa.Storage.get('prime_video_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('prime_video_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        hbo(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '49', first_air_date_gte: '2020-01-01', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'HBO';
                const display = Lampa.Storage.get('hbo_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('hbo_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        mgm(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '6219', first_air_date_gte: '2020-01-01', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'MGM+';
                const display = Lampa.Storage.get('mgm_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('mgm_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        dorams(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '5806', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'Дорамы';
                const display = Lampa.Storage.get('dorams_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('dorams_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        tur_serials(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {first_air_date_gte: '2020-01-01', without_genres: '16', with_original_language: 'tr', vote_average_gte: 6, vote_average_lte: 10, first_air_date_lte: date}, data => {
                data.title = 'Турецкие сериалы';
                const display = Lampa.Storage.get('tur_serials_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.original_name || i.title; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('tur_serials_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        ind_films(callback) {
            const date = new Date().toISOString().slice(0, 10);
            const lastYear = (new Date().getFullYear() - 1) + '-01-01';
            this.request('discover/movie', {vote_average_gte: 5, vote_average_lte: 9.5, with_original_language: 'hi', sort_by: 'primary_release_date.desc', primary_release_date_lte: date, primary_release_date_gte: lastYear}, data => {
                data.title = 'Индийские фильмы';
                const display = Lampa.Storage.get('ind_films_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('ind_films_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        rus_movie(callback) {
            const date = new Date().toISOString().slice(0, 10);
            const lastYear = (new Date().getFullYear() - 1) + '-01-01';
            this.request('discover/movie', {vote_average_gte: 5, vote_average_lte: 9.5, with_original_language: 'ru', sort_by: 'primary_release_date.desc', primary_release_date_lte: date, primary_release_date_gte: lastYear}, data => {
                data.title = 'Русские фильмы';
                const display = Lampa.Storage.get('rus_movie_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_movie_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        rus_tv(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '2859', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'Русские сериалы';
                const display = Lampa.Storage.get('rus_tv_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        rus_mult(callback) {
            const date = new Date().toISOString().slice(0, 10);
            const lastYear = (new Date().getFullYear() - 1) + '-01-01';
            this.request('discover/movie', {vote_average_gte: 5, vote_average_lte: 9.5, with_genres: '16', with_original_language: 'ru', sort_by: 'primary_release_date.desc', primary_release_date_lte: date, primary_release_date_gte: lastYear}, data => {
                data.title = 'Русские мультфильмы';
                const display = Lampa.Storage.get('rus_mult_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('rus_mult_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        start(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '3923', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'Start';
                const display = Lampa.Storage.get('start_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('start_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        premier(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '2493', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'Premier';
                const display = Lampa.Storage.get('premier_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('premier_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        ivi(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '3871', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'ИВИ';
                const display = Lampa.Storage.get('ivi_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('ivi_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        okko(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '3827', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'OKKO';
                const display = Lampa.Storage.get('okko_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('okko_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        kion(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '4085', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'KION';
                const display = Lampa.Storage.get('kion_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('kion_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        kinopoisk(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '1191', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'КиноПоиск';
                const display = Lampa.Storage.get('kinopoisk_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('kinopoisk_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        wink(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '806', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'Wink';
                const display = Lampa.Storage.get('wink_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('wink_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        sts(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '806', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'СТС';
                const display = Lampa.Storage.get('sts_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('sts_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        tnt(callback) {
            const date = new Date().toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '5806', sort_by: 'first_air_date.desc', air_date_lte: date}, data => {
                data.title = 'ТНТ';
                const display = Lampa.Storage.get('tnt_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('tnt_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        collections_inter_tv(callback) {
            const date = new Date();
            const minDate = new Date(date.getFullYear(), date.getMonth() - 12, date.getDate()).toISOString().slice(0, 10);
            const maxDate = date.toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '213|2552|1024|6219|49', sort_by: 'popularity.desc', air_date_lte: maxDate, first_air_date_gte: minDate}, data => {
                data.title = 'Подборки зарубежных сериалов';
                const display = Lampa.Storage.get('collections_inter_tv_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_inter_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        collections_rus_tv(callback) {
            const date = new Date();
            const minDate = new Date(date.getFullYear(), date.getMonth() - 12, date.getDate()).toISOString().slice(0, 10);
            const maxDate = date.toISOString().slice(0, 10);
            this.request('discover/tv', {with_networks: '2493|2859|4085|3923|3871|3827|5806|806|1191', sort_by: 'popularity.desc', first_air_date_lte: maxDate, first_air_date_gte: minDate}, data => {
                data.title = 'Подборки русских сериалов';
                const display = Lampa.Storage.get('collections_rus_tv_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_rus_tv_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        collections_inter_movie(callback) {
            const date = new Date();
            const minDate = new Date(date.getFullYear(), date.getMonth() - 12, date.getDate()).toISOString().slice(0, 10);
            const maxDate = date.toISOString().slice(0, 10);
            this.request('discover/movie', {vote_average_gte: 5, vote_average_lte: 9.5, sort_by: 'popularity.desc', primary_release_date_lte: maxDate, primary_release_date_gte: minDate}, data => {
                data.title = 'Подборки зарубежных фильмов';
                const display = Lampa.Storage.get('collections_inter_movie_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_inter_movie_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }

        collections_rus_movie(callback) {
            const date = new Date();
            const minDate = new Date(date.getFullYear(), date.getMonth() - 12, date.getDate()).toISOString().slice(0, 10);
            const maxDate = date.toISOString().slice(0, 10);
            this.request('discover/movie', {primary_release_date_gte: minDate, vote_average_gte: 5, vote_average_lte: 9.5, with_original_language: 'ru', sort_by: 'popularity.desc', primary_release_date_lte: maxDate}, data => {
                data.title = 'Подборки русских фильмов';
                const display = Lampa.Storage.get('collections_rus_movie_display', '1');
                if (display === '2') { data.collection = true; data.line_type = 'collection'; }
                if (display === '3') { data.small = true; data.wide = true; data.results.forEach(i => { i.promo = i.overview; i.promo_title = i.title || i.name; }); }
                if (display === '4') data.line_type = 'top';
                if (Lampa.Storage.get('collections_rus_movie_shuffle', 'false') === 'true') this.shuffle(data.results);
                callback(data);
            }, callback);
        }
    }

    const baseSource = Lampa.Api.sources.tmdb || {};
    const personalHubSource = Object.assign({}, baseSource, new PersonalHub(baseSource));
    Lampa.Api.sources.personalhub = personalHubSource;

    if (Lampa.Settings && Lampa.Settings.main && typeof Lampa.Settings.select === 'function') {
        const sourceValues = (Lampa.Settings.main().field && Lampa.Settings.main().field.source && Lampa.Settings.main().field.source.values) || {};
        Lampa.Settings.select('source', Object.assign({}, sourceValues, {personalhub: 'PersonalHub'}), 'tmdb');
    }

    if (Lampa.Storage.get('source') === 'personalhub') {
        const initInterval = setInterval(() => {
            if (Lampa.Controller && typeof Lampa.Controller.toggle === 'function') {
                clearInterval(initInterval);
                Lampa.Controller.toggle('main');
            }
        }, 300);
    }

    if (Lampa.Settings && Lampa.Settings.listener && typeof Lampa.Settings.listener.follow === 'function') {
        Lampa.Settings.listener.follow('open', e => {
            if (e.name === 'more') {
                const render = Lampa.Settings.main && Lampa.Settings.main().render && Lampa.Settings.main().render();
                if (render && render.find('[data-component="bylampa_source"]').length === 0) {
                    if (Lampa.SettingsApi && typeof Lampa.SettingsApi.addComponent === 'function') {
                        Lampa.SettingsApi.addComponent({component: 'bylampa_source', name: 'Источник PersonalHub'});
                    }
                }
                if (Lampa.Settings.main && typeof Lampa.Settings.main().update === 'function') Lampa.Settings.main().update();
                if (render) render.find('div[data-name="source"]').parent().hide();
            }
        });
    }

    if (Lampa.SettingsApi && typeof Lampa.SettingsApi.addComponent === 'function') {
        Lampa.SettingsApi.addComponent({
            component: 'bylampa_source',
            param: {name: 'bylampa_source', type: 'toggle', default: true},
            field: {name: 'Источник PersonalHub', description: 'Настройки главного экрана'},
            onRender: function(item) {
                setTimeout(() => {
                    const sourceParam = $('div[data-name="source"]').parent();
                    if (sourceParam.length) sourceParam.insertAfter(item.parent());
                    if (Lampa.Storage.get('source') !== 'personalhub') {
                        item.hide();
                    } else {
                        item.show();
                    }
                }, 20);

                item.on('hover:enter', () => {
                    Lampa.Settings.open('bylampa_source');
                    const activeController = Lampa.Controller && Lampa.Controller.active && Lampa.Controller.active();
                    if (activeController && activeController.field) {
                        activeController.field.back = () => Lampa.Settings.open('more');
                    }
                });
            }
        });
    }

    if (Lampa.Storage && Lampa.Storage.listener && typeof Lampa.Storage.listener.follow === 'function') {
        Lampa.Storage.listener.follow('change', e => {
            if (e.name === 'source') {
                setTimeout(() => {
                    const items = $('.settings-param > div:contains("Источник PersonalHub")');
                    if (items.length) {
                        if (Lampa.Storage.get('source') !== 'personalhub') {
                            items.parent().hide();
                        } else {
                            items.parent().show();
                        }
                    }
                }, 50);
            }
        });
    }

    function addCategorySettings(id, title, description, shuffleDefault = false, displayDefault = '1', orderDefault = '1') {
        if (Lampa.Settings && Lampa.Settings.listener && typeof Lampa.Settings.listener.follow === 'function') {
            Lampa.Settings.listener.follow('open', e => {
                if (e.name === 'more') {
                    const render = Lampa.Settings.main && Lampa.Settings.main().render && Lampa.Settings.main().render();
                    if (render && render.find(`[data-component="${id}"]`).length === 0) {
                        if (Lampa.SettingsApi && typeof Lampa.SettingsApi.addComponent === 'function') {
                            Lampa.SettingsApi.addComponent({component: id, name: title});
                        }
                    }
                    if (render) render.find('[data-component="bylampa_source"]').addClass('hide');
                }
            });
        }

        if (Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
            Lampa.SettingsApi.addParam({
                component: 'bylampa_source',
                param: {name: id, type: 'toggle', default: true},
                field: {name: title, description: description},
                onRender: function(item) {
                    item.on('hover:enter', () => {
                        Lampa.Settings.open(id);
                        const activeController = Lampa.Controller && Lampa.Controller.active && Lampa.Controller.active();
                        if (activeController && activeController.field) {
                            activeController.field.back = () => {
                                Lampa.Settings.open('bylampa_source');
                                setTimeout(() => {
                                    const index = Array.from(item.parent().children()).indexOf(item[0]) + 1;
                                    const elem = document.querySelector(`#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(${index})`);
                                    if (elem && Lampa.Controller && typeof Lampa.Controller.focus === 'function') Lampa.Controller.focus(elem);
                                }, 50);
                            };
                        }
                    });
                }
            });

            Lampa.SettingsApi.addParam({component: id, param: {name: id + '_shuffle', type: 'toggle', default: shuffleDefault}, field: {name: 'Перемешивать'}});
            Lampa.SettingsApi.addParam({component: id, param: {name: id + '_display', type: 'select', values: {1: 'Стандарт', 2: 'Коллекция', 3: 'Широкие маленькие', 4: 'Top Line'}, default: displayDefault}, field: {name: 'Вид отображения'}});
            Lampa.SettingsApi.addParam({component: id, param: {name: 'number_' + id, type: 'select', values: {
                1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',
                11:'11',12:'12',13:'13',14:'14',15:'15',16:'16',17:'17',18:'18',19:'19',20:'20',
                21:'21',22:'22',23:'23',24:'24',25:'25',26:'26',27:'27',28:'28',29:'29',30:'30',
                31:'31',32:'32',33:'33',34:'34',35:'35',36:'36',37:'37'
            }, default: orderDefault}, field: {name: 'Порядок отображения'}});
            Lampa.SettingsApi.addParam({component: id, param: {name: id + '_remove', type: 'toggle', default: false}, field: {name: 'Убрать с главной страницы'}});
        }
    }

    addCategorySettings('now_watch', 'Сейчас смотрят', 'Нажми для настройки', false, '1', '1');
    addCategorySettings('upcoming_episodes', 'Выход ближайших эпизодов', 'Нажми для настройки', false, '1', '2');
    addCategorySettings('trend_day', 'Сегодня в тренде', 'Нажми для настройки', false, '1', '3');
    addCategorySettings('trend_day_tv', 'Сегодня в тренде (сериалы)', 'Нажми для настройки', true, '1', '4');
    addCategorySettings('trend_day_film', 'Сегодня в тренде (фильмы)', 'Нажми для настройки', true, '1', '5');
    addCategorySettings('trend_week', 'В тренде за неделю', 'Нажми для настройки', false, '1', '6');
    addCategorySettings('trend_week_tv', 'В тренде за неделю (сериалы)', 'Нажми для настройки', true, '1', '7');
    addCategorySettings('trend_week_film', 'В тренде за неделю (фильмы)', 'Нажми для настройки', true, '1', '8');
    addCategorySettings('upcoming', 'Смотрите в кинозалах', 'Нажми для настройки', false, '1', '9');
    addCategorySettings('top_movie', 'Топ фильмы', 'Нажми для настройки', false, '1', '10');
    addCategorySettings('top_tv', 'Топ сериалы', 'Нажми для настройки', false, '1', '11');
    addCategorySettings('popular_movie', 'Популярные фильмы', 'Нажми для настройки', false, '4', '12');
    addCategorySettings('popular_tv', 'Популярные сериалы', 'Нажми для настройки', false, '4', '13');
    addCategorySettings('netflix', 'Netflix', 'Нажми для настройки', true, '1', '14');
    addCategorySettings('apple_tv', 'Apple TV+', 'Нажми для настройки', true, '1', '15');
    addCategorySettings('prime_video', 'Prime Video', 'Нажми для настройки', true, '1', '16');
    addCategorySettings('hbo', 'HBO', 'Нажми для настройки', true, '1', '17');
    addCategorySettings('mgm', 'MGM+', 'Нажми для настройки', true, '1', '18');
    addCategorySettings('dorams', 'Дорамы', 'Нажми для настройки', true, '1', '19');
    addCategorySettings('tur_serials', 'Турецкие сериалы', 'Нажми для настройки', true, '1', '20');
    addCategorySettings('ind_films', 'Индийские фильмы', 'Нажми для настройки', true, '1', '21');
    addCategorySettings('rus_movie', 'Русские фильмы', 'Нажми для настройки', true, '1', '22');
    addCategorySettings('rus_tv', 'Русские сериалы', 'Нажми для настройки', true, '1', '23');
    addCategorySettings('rus_mult', 'Русские мультфильмы', 'Нажми для настройки', true, '1', '24');
    addCategorySettings('start', 'Start', 'Нажми для настройки', true, '1', '25');
    addCategorySettings('premier', 'Premier', 'Нажми для настройки', true, '1', '26');
    addCategorySettings('ivi', 'ИВИ', 'Нажми для настройки', true, '1', '27');
    addCategorySettings('okko', 'OKKO', 'Нажми для настройки', true, '1', '28');
    addCategorySettings('kion', 'KION', 'Нажми для настройки', true, '1', '29');
    addCategorySettings('kinopoisk', 'КиноПоиск', 'Нажми для настройки', true, '1', '30');
    addCategorySettings('wink', 'Wink', 'Нажми для настройки', true, '1', '31');
    addCategorySettings('sts', 'СТС', 'Нажми для настройки', true, '1', '32');
    addCategorySettings('tnt', 'ТНТ', 'Нажми для настройки', true, '1', '33');
    addCategorySettings('collections_inter_tv', 'Подборки зарубежных сериалов', 'Нажми для настройки', true, '1', '34');
    addCategorySettings('collections_rus_tv', 'Подборки русских сериалов', 'Нажми для настройки', true, '1', '35');
    addCategorySettings('collections_inter_movie', 'Подборки зарубежных фильмов', 'Нажми для настройки', true, '1', '36');
    addCategorySettings('collections_rus_movie', 'Подборки русских фильмов', 'Нажми для настройки', true, '1', '37');

    if (window.appready) {
        Lampa.Card = CustomCard;
    } else {
        if (Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
            Lampa.Listener.follow('app', e => {
                if (e.type === 'ready') {
                    Lampa.Card = CustomCard;
                }
            });
        }
    }
})();
