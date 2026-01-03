(function () {
    'use strict';

    Lampa.Platform.tv();

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function applyDisplaySettings(data, categoryId) {
        var display = Lampa.Storage.get(categoryId + '_display', '1');
        if (display === '2') {
            data.collection = true;
            data.line_type = 'collection';
        }
        if (display === '3') {
            data.small = true;
            data.wide = true;
            data.results.forEach(function (item) {
                item.promo = item.overview;
                item.promo_title = item.title || item.name;
            });
        }
        if (display === '4') {
            data.line_type = 'top';
        }
        if (Lampa.Storage.get(categoryId + '_shuffle', 'false') === 'true') {
            shuffle(data.results);
        }
    }

    function CardEpisode(data) {
        var cardData = data.card || data;
        var episodeData = data.next_episode_to_air || data.episode || {};

        if (cardData.source === undefined) {
            cardData.source = 'tmdb';
        }

        Lampa.Arrays.extend(cardData, {
            title: cardData.name,
            original_title: cardData.original_name,
            release_date: cardData.first_air_date,
        });

        cardData.release_year = (cardData.release_date || '0000').slice(0, 4);

        function removeElement(el) {
            if (el) el.remove();
        }

        this.build = function () {
            this.card = Lampa.Template.js('card_episode');
            this.img_poster = this.card.querySelector('.card__img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};

            this.card.querySelector('.card__title').innerText = cardData.title;
            this.card.querySelector('.full-episode__num').innerText = cardData.unwatched || '';

            if (episodeData && episodeData.air_date) {
                this.card.querySelector('.full-episode__name').innerText = episodeData.name || Lampa.Lang.translate('noname');
                this.card.querySelector('.full-episode__num').innerText = episodeData.episode_number || '';
                this.card.querySelector('.full-episode__date').innerText = episodeData.air_date
                    ? Lampa.Utils.parseTime(episodeData.air_date).full
                    : '----';
            }

            if (cardData.release_year === '0000') {
                removeElement(this.card.querySelector('.card__age'));
            } else {
                this.card.querySelector('.card__age').innerText = cardData.release_year;
            }

            this.card.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
            this.img_poster.onload = function () {};
            this.img_poster.onerror = function () {
                this.img_poster.src = './img/img_broken.svg';
            }.bind(this);

            this.img_episode.onload = function () {
                this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            }.bind(this);

            this.img_episode.onerror = function () {
                this.img_episode.src = './img/img_broken.svg';
            }.bind(this);
        };

        this.create = function () {
            this.build();

            this.card.addEventListener('hover:focus', () => {
                if (this.onFocus) this.onFocus(this.card, cardData);
            });

            this.card.addEventListener('hover:hover', () => {
                if (this.onHover) this.onHover(this.card, cardData);
            });

            this.card.addEventListener('hover:enter', () => {
                if (this.onEnter) this.onEnter(this.card, cardData);
            });

            this.image();
        };

        this.visible = function () {
            if (cardData.poster_path) this.img_poster.src = Lampa.Api.img(cardData.poster_path);
            else if (cardData.profile_path) this.img_poster.src = Lampa.Api.img(cardData.profile_path);
            else if (cardData.poster) this.img_poster.src = cardData.poster;
            else if (cardData.img) this.img_poster.src = cardData.img;
            else this.img_poster.src = './img/img_broken.svg';

            if (episodeData.still_path) this.img_episode.src = Lampa.Api.img(episodeData.still_path, 'w300');
            else if (cardData.backdrop_path) this.img_episode.src = Lampa.Api.img(cardData.backdrop_path, 'w300');
            else if (episodeData.img) this.img_episode.src = episodeData.img;
            else if (cardData.img) this.img_episode.src = cardData.img;
            else this.img_episode.src = './img/img_broken.svg';

            if (this.onVisible) this.onVisible(this.card, cardData);
        };

        this.destroy = function () {
            this.img_poster.onerror = this.img_poster.onload = () => {};
            this.img_episode.onerror = this.img_episode.onload = () => {};
            this.img_poster.src = '';
            this.img_episode.src = '';
            removeElement(this.card);
            this.card = this.img_poster = this.img_episode = null;
        };

        this.render = function (useJQuery) {
            return useJQuery ? $(this.card) : this.card;
        };
    }

    Lampa.Api.sources['bylampa'] = function () {
        var network = new Lampa.Reguest();
        var baseUrl = 'https://api.themoviedb.org/3/';
        var apiKey = '4ef0d7355d9f41bba9917982ec96d5a2';
        var today = new Date().toISOString().slice(0, 10);

        function request(url, success, error) {
            network.silent(baseUrl + url + (url.includes('?') ? '&' : '?') + 'api_key=' + apiKey + '&language=ru-RU', success, error);
        }

        return {
            now_watch: function (success, error) {
                request('trending/all/day', function (data) {
                    data.title = 'Сейчас смотрят';
                    applyDisplaySettings(data, 'now_watch');
                    success(data);
                }, error);
            },

            trend_day: function (success, error) {
                request('trending/all/day', function (data) {
                    data.title = 'Сегодня в тренде';
                    applyDisplaySettings(data, 'trend_day');
                    success(data);
                }, error);
            },

            trend_day_tv: function (success, error) {
                request('trending/tv/day', function (data) {
                    data.title = 'Сегодня в тренде (сериалы)';
                    applyDisplaySettings(data, 'trend_day_tv');
                    success(data);
                }, error);
            },

            trend_day_film: function (success, error) {
                request('trending/movie/day', function (data) {
                    data.title = 'Сегодня в тренде (фильмы)';
                    applyDisplaySettings(data, 'trend_day_film');
                    success(data);
                }, error);
            },

            trend_week: function (success, error) {
                request('trending/all/week', function (data) {
                    data.title = 'В тренде за неделю';
                    applyDisplaySettings(data, 'trend_week');
                    success(data);
                }, error);
            },

            trend_week_tv: function (success, error) {
                request('trending/tv/week', function (data) {
                    data.title = 'В тренде за неделю (сериалы)';
                    applyDisplaySettings(data, 'trend_week_tv');
                    success(data);
                }, error);
            },

            trend_week_film: function (success, error) {
                request('trending/movie/week', function (data) {
                    data.title = 'В тренде за неделю (фильмы)';
                    applyDisplaySettings(data, 'trend_week_film');
                    success(data);
                }, error);
            },

            upcoming: function (success, error) {
                request('movie/upcoming', function (data) {
                    data.title = 'Смотрите в кинозалах';
                    applyDisplaySettings(data, 'upcoming');
                    success(data);
                }, error);
            },

            popular_movie: function (success, error) {
                request('movie/popular', function (data) {
                    data.title = 'Популярные фильмы';
                    applyDisplaySettings(data, 'popular_movie');
                    success(data);
                }, error);
            },

            popular_tv: function (success, error) {
                request('tv/popular', function (data) {
                    data.title = 'Популярные сериалы';
                    applyDisplaySettings(data, 'popular_tv');
                    success(data);
                }, error);
            },

            top_movie: function (success, error) {
                request('movie/top_rated', function (data) {
                    data.title = 'Топ фильмы';
                    applyDisplaySettings(data, 'top_movie');
                    success(data);
                }, error);
            },

            top_tv: function (success, error) {
                request('tv/top_rated', function (data) {
                    data.title = 'Топ сериалы';
                    applyDisplaySettings(data, 'top_tv');
                    success(data);
                }, error);
            },

            netflix: function (success, error) {
                request('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Netflix';
                    applyDisplaySettings(data, 'netflix');
                    success(data);
                }, error);
            },

            apple_tv: function (success, error) {
                request('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Apple TV+';
                    applyDisplaySettings(data, 'apple_tv');
                    success(data);
                }, error);
            },

            prime_video: function (success, error) {
                request('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Prime Video';
                    applyDisplaySettings(data, 'prime_video');
                    success(data);
                }, error);
            },

            mgm: function (success, error) {
                request('discover/tv?with_networks=2739&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'MGM+';
                    applyDisplaySettings(data, 'mgm');
                    success(data);
                }, error);
            },

            hbo: function (success, error) {
                request('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'HBO';
                    applyDisplaySettings(data, 'hbo');
                    success(data);
                }, error);
            },

            dorams: function (success, error) {
                request('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Дорамы';
                    applyDisplaySettings(data, 'dorams');
                    success(data);
                }, error);
            },

            tur_serials: function (success, error) {
                request('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Турецкие сериалы';
                    applyDisplaySettings(data, 'tur_serials');
                    success(data);
                }, error);
            },

            ind_films: function (success, error) {
                request('discover/movie?with_original_language=hi&vote_average.gte=6&primary_release_date.lte=' + today, function (data) {
                    data.title = 'Индийские фильмы';
                    applyDisplaySettings(data, 'ind_films');
                    success(data);
                }, error);
            },

            rus_movie: function (success, error) {
                request('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, function (data) {
                    data.title = 'Русские фильмы';
                    applyDisplaySettings(data, 'rus_movie');
                    success(data);
                }, error);
            },

            rus_tv: function (success, error) {
                request('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&first_air_date.lte=' + today, function (data) {
                    data.title = 'Русские сериалы';
                    applyDisplaySettings(data, 'rus_tv');
                    success(data);
                }, error);
            },

            rus_mult: function (success, error) {
                request('discover/movie?with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, function (data) {
                    data.title = 'Русские мультфильмы';
                    applyDisplaySettings(data, 'rus_mult');
                    success(data);
                }, error);
            },

            start: function (success, error) {
                request('discover/tv?with_networks=2739&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Start';
                    applyDisplaySettings(data, 'start');
                    success(data);
                }, error);
            },

            premier: function (success, error) {
                request('discover/tv?with_networks=5806&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Premier';
                    applyDisplaySettings(data, 'premier');
                    success(data);
                }, error);
            },

            kion: function (success, error) {
                request('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'KION';
                    applyDisplaySettings(data, 'kion');
                    success(data);
                }, error);
            },

            ivi: function (success, error) {
                request('discover/tv?with_networks=1191&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'ИВИ';
                    applyDisplaySettings(data, 'ivi');
                    success(data);
                }, error);
            },

            okko: function (success, error) {
                request('discover/tv?with_networks=3871&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Okko';
                    applyDisplaySettings(data, 'okko');
                    success(data);
                }, error);
            },

            wink: function (success, error) {
                request('discover/tv?with_networks=3827&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'Wink';
                    applyDisplaySettings(data, 'wink');
                    success(data);
                }, error);
            },

            sts: function (success, error) {
                request('discover/tv?with_networks=806&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'СТС';
                    applyDisplaySettings(data, 'sts');
                    success(data);
                }, error);
            },

            tnt: function (success, error) {
                request('discover/tv?with_networks=1191&first_air_date.gte=2020-01-01&vote_average.gte=6&first_air_date.lte=' + today, function (data) {
                    data.title = 'ТНТ';
                    applyDisplaySettings(data, 'tnt');
                    success(data);
                }, error);
            },

            collections_inter_tv: function (success, error) {
                request('discover/tv?sort_by=vote_count.desc', function (data) {
                    data.title = 'Подборки зарубежных сериалов';
                    applyDisplaySettings(data, 'collections_inter_tv');
                    success(data);
                }, error);
            },

            collections_rus_tv: function (success, error) {
                request('discover/tv?with_original_language=ru&sort_by=vote_count.desc', function (data) {
                    data.title = 'Подборки русских сериалов';
                    applyDisplaySettings(data, 'collections_rus_tv');
                    success(data);
                }, error);
            },

            collections_inter_movie: function (success, error) {
                request('discover/movie?sort_by=vote_count.desc', function (data) {
                    data.title = 'Подборки зарубежных фильмов';
                    applyDisplaySettings(data, 'collections_inter_movie');
                    success(data);
                }, error);
            },

            collections_rus_movie: function (success, error) {
                request('discover/movie?with_original_language=ru&sort_by=vote_count.desc', function (data) {
                    data.title = 'Подборки русских фильмов';
                    applyDisplaySettings(data, 'collections_rus_movie');
                    success(data);
                }, error);
            },
        };
    };

    function addCategorySettings(id, title, group = '1', order = '1', shuffle = false) {
        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: { name: id + '_remove', type: 'trigger', default: false },
            field: { name: title, description: 'Убрать с главной страницы' },
        });

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: {
                name: id + '_display',
                type: 'select',
                values: { 1: 'Стандарт', 2: 'Широкие маленькие', 3: 'Широкие большие', 4: 'Top Line' },
                default: group,
            },
            field: { name: 'Вид отображения' },
        });

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: {
                name: 'number_' + id,
                type: 'select',
                values: Object.fromEntries(Array.from({ length: 37 }, (_, i) => [i + 1, String(i + 1)])),
                default: order,
            },
            field: { name: 'Порядок отображения' },
        });

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: { name: id + '_shuffle', type: 'trigger', default: shuffle },
            field: { name: 'Изменять порядок карточек на главной' },
        });
    }

    function initPlugin() {
        addCategorySettings('now_watch', 'Сейчас смотрят', '1', '1', false);
        addCategorySettings('trend_day', 'Сегодня в тренде', '1', '3', false);
        addCategorySettings('trend_day_tv', 'Сегодня в тренде (сериалы)', '1', '4', false);
        addCategorySettings('trend_day_film', 'Сегодня в тренде (фильмы)', '1', '5', false);
        addCategorySettings('trend_week', 'В тренде за неделю', '1', '6', false);
        addCategorySettings('trend_week_tv', 'В тренде за неделю (сериалы)', '1', '7', false);
        addCategorySettings('trend_week_film', 'В тренде за неделю (фильмы)', '1', '8', false);
        addCategorySettings('upcoming', 'Смотрите в кинозалах', '1', '9', false);
        addCategorySettings('popular_movie', 'Популярные фильмы', '1', '10', false);
        addCategorySettings('popular_tv', 'Популярные сериалы', '1', '11', false);
        addCategorySettings('top_movie', 'Топ фильмы', '4', '12', false);
        addCategorySettings('top_tv', 'Топ сериалы', '4', '13', false);
        addCategorySettings('netflix', 'Netflix', '1', '14', false);
        addCategorySettings('apple_tv', 'Apple TV+', '1', '15', false);
        addCategorySettings('prime_video', 'Prime Video', '1', '16', false);
        addCategorySettings('mgm', 'MGM+', '1', '17', false);
        addCategorySettings('hbo', 'HBO', '1', '18', false);
        addCategorySettings('dorams', 'Дорамы', '1', '19', false);
        addCategorySettings('tur_serials', 'Турецкие сериалы', '1', '20', false);
        addCategorySettings('ind_films', 'Индийские фильмы', '1', '21', false);
        addCategorySettings('rus_movie', 'Русские фильмы', '1', '22', false);
        addCategorySettings('rus_tv', 'Русские сериалы', '1', '23', false);
        addCategorySettings('rus_mult', 'Русские мультфильмы', '1', '24', false);
        addCategorySettings('start', 'Start', '1', '25', false);
        addCategorySettings('premier', 'Premier', '1', '26', false);
        addCategorySettings('kion', 'KION', '1', '27', false);
        addCategorySettings('ivi', 'ИВИ', '1', '28', false);
        addCategorySettings('okko', 'Okko', '1', '29', false);
        addCategorySettings('kinopoisk', 'КиноПоиск', '1', '30', false);
        addCategorySettings('wink', 'Wink', '1', '31', false);
        addCategorySettings('sts', 'СТС', '1', '32', false);
        addCategorySettings('tnt', 'ТНТ', '1', '33', false);
        addCategorySettings('collections_inter_tv', 'Подборки зарубежных сериалов', '1', '34', false);
        addCategorySettings('collections_rus_tv', 'Подборки русских сериалов', '1', '35', false);
        addCategorySettings('collections_inter_movie', 'Подборки зарубежных фильмов', '1', '36', false);
        addCategorySettings('collections_rus_movie', 'Подборки русских фильмов', '1', '37', false);

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: { name: 'upcoming_episodes_remove', type: 'trigger', default: false },
            field: { name: 'Выход ближайших эпизодов', description: 'Убрать с главной страницы' },
        });

        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: { name: 'genres_cat', type: 'trigger', default: true },
            field: { name: 'Подборки по жанрам', description: 'Убрать с главной страницы' },
        });

        var initInterval = setInterval(function () {
            if (typeof Lampa !== 'undefined') {
                clearInterval(initInterval);
                if (!Lampa.Storage.get('bylampa_source_params', 'false')) {
                    Lampa.Storage.set('bylampa_source_params', 'true');
                    Lampa.Storage.set('top_movie_display', '4');
                    Lampa.Storage.set('top_tv_display', '4');
                    Lampa.Storage.set('trend_day_tv_remove', 'true');
                    Lampa.Storage.set('trend_day_film_remove', 'true');
                    Lampa.Storage.set('trend_week_tv_remove', 'true');
                    Lampa.Storage.set('trend_week_film_remove', 'true');
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
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                initPlugin();
            }
        });
    }
})();
