(function() {
    'use strict';
    Lampa.Platform.tv();

    // Guard от повторной загрузки
    if (window.personalhub_loaded) return;
    window.personalhub_loaded = true;

    console.log('PersonalHub plugin loaded');

    // Добавление кастомного шаблона карточки
    Lampa.Template.add('personalhub_card', `
        <div class="card">
            <div class="card__img">
                <img src="./img/img_broken.svg" />
            </div>
            <div class="card__title"></div>
            <div class="card__text"></div>
            <div class="card__age"></div>
            <div class="full-episode__img">
                <img src="./img/img_broken.svg" />
            </div>
            <div class="full-episode__name"></div>
            <div class="full-episode__date"></div>
            <div class="full-episode__num"></div>
        </div>
    `);

    // Класс для построения карточки
    function CardBuilder(data, params) {
        var item = data.item || data;
        var episode = data.episode || {};
        if (item.source == undefined) item.source = 'tmdb';
        Lampa.Arrays.extend(item, {
            title: item.name,
            original_title: item.original_name,
            release_date: item.first_air_date
        });
        item.release_year = ((item.first_air_date || '0000') + '').substr(0, 4);

        function hideAge(elem) {
            if (elem) elem.remove();
        }

        this.build = function() {
            this.card = Lampa.Template.get('personalhub_card');
            this.img_poster = this.card.querySelector('.card__img img') || {};
            this.img_episode = this.card.querySelector('.full-episode__img img') || {};
            this.card.querySelector('.card__title').innerText = item.title;
            this.card.querySelector('.card__text').innerText = item.overview || '';
            if (episode && episode.air_date) {
                this.card.querySelector('.full-episode__name').innerText = episode.name || Lampa.Lang.translate('episode');
                this.card.querySelector('.card__text').innerText = episode.overview || '';
                this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).toLocaleDateString() : '----';
            }
            if (item.release_year == '0000') {
                hideAge(this.card.querySelector('.card__age'));
            } else {
                this.card.querySelector('.card__age').innerText = item.release_year;
            }
            this.card.addEventListener('hover:enter', this.onEnter.bind(this));
        };

        this.image = function() {
            var _this = this;
            this.img_poster.onerror = function() {
                _this.img_poster.src = './img/img_broken.svg';
            };
            this.img_poster.onload = function() {
                _this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            };
            this.img_episode.onerror = function() {
                _this.img_episode.src = './img/img_broken.svg';
            };
            this.img_episode.onload = function() {};
        };

        this.create = function() {
            this.build();
            this.card.addEventListener('hover:enter', function() {
                if (this.onEnter) this.onEnter(this.card, item);
            }.bind(this));
            this.card.addEventListener('hover:focus', function() {
                if (this.onHover) this.onHover(this.card, item);
            }.bind(this));
            this.card.addEventListener('focus', function() {
                if (this.onFocus) this.onFocus(this.card, item);
            }.bind(this));
            this.image();
            return this.card;
        };

        this.setImage = function() {
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
            } else if (item.img_episode) {
                this.img_episode.src = Lampa.Api.img(item.img_episode, 'w300');
            } else if (episode.img) {
                this.img_episode.src = episode.img;
            } else if (item.img) {
                this.img_episode.src = item.img;
            } else {
                this.img_episode.src = './img/img_broken.svg';
            }
            if (this.onVisible) this.onVisible(this.card, item);
        };

        this.destroy = function() {
            this.img_poster.onerror = null;
            this.img_poster.onload = null;
            this.img_episode.onerror = null;
            this.img_episode.onload = null;
            this.img_poster.src = '';
            this.img_episode.src = '';
            hideAge(this.card);
            this.card = null;
            this.img_poster = null;
            this.img_episode = null;
        };

        this.toggle = function() {
            return this.card ? $(this.card) : $();
        };
    }

    // Основной класс PersonalHub
    function PersonalHub(params) {
        this.controller = new Lampa.Controller();
        this.discovery = [];
        this.main = function(pl, onComplete, onError) {
            var _this = this;
            var pl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var onComplete = arguments.length > 1 ? arguments[1] : undefined;
            var onError = arguments.length > 2 ? arguments[2] : undefined;
            var count = 56;
            var categories = [
                {id: 'now_watch', order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1, active: !Lampa.Storage.get('now_watch_remove')},
                {id: 'upcoming_episodes', order: 2, active: !Lampa.Storage.get('upcoming_episodes_remove')},
                {id: 'trend_day', order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3, active: !Lampa.Storage.get('trend_day_remove')},
                {id: 'trend_day_tv', order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4, active: !Lampa.Storage.get('trend_day_tv_remove')},
                {id: 'trend_day_film', order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) || 5, active: !Lampa.Storage.get('trend_day_film_remove')},
                {id: 'trend_week', order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6, active: !Lampa.Storage.get('trend_week_remove')},
                {id: 'trend_week_tv', order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7, active: !Lampa.Storage.get('trend_week_tv_remove')},
                {id: 'trend_week_film', order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) || 8, active: !Lampa.Storage.get('trend_week_film_remove')},
                {id: 'upcoming', order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9, active: !Lampa.Storage.get('upcoming_remove')},
                {id: 'popular_movie', order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) || 10, active: !Lampa.Storage.get('popular_movie_remove')},
                {id: 'popular_tv', order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 11, active: !Lampa.Storage.get('popular_tv_remove')},
                {id: 'top_movie', order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 12, active: !Lampa.Storage.get('top_movie_remove')},
                {id: 'top_tv', order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 13, active: !Lampa.Storage.get('top_tv_remove')},
                {id: 'netflix', order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14, active: !Lampa.Storage.get('netflix_remove')},
                {id: 'apple_tv', order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15, active: !Lampa.Storage.get('apple_tv_remove')},
                {id: 'prime_video', order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16, active: !Lampa.Storage.get('prime_video_remove')},
                {id: 'mgm', order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 17, active: !Lampa.Storage.get('mgm_remove')},
                {id: 'hbo', order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 18, active: !Lampa.Storage.get('hbo_remove')},
                {id: 'dorams', order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19, active: !Lampa.Storage.get('dorams_remove')},
                {id: 'tur_serials', order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20, active: !Lampa.Storage.get('tur_serials_remove')},
                {id: 'ind_films', order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21, active: !Lampa.Storage.get('ind_films_remove')},
                {id: 'rus_movie', order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22, active: !Lampa.Storage.get('rus_movie_remove')},
                {id: 'rus_tv', order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23, active: !Lampa.Storage.get('rus_tv_remove')},
                {id: 'rus_mult', order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24, active: !Lampa.Storage.get('rus_mult_remove')},
                {id: 'start', order: parseInt(Lampa.Storage.get('number_start'), 10) || 25, active: !Lampa.Storage.get('start_remove')},
                {id: 'premier', order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26, active: !Lampa.Storage.get('premier_remove')},
                {id: 'kion', order: parseInt(Lampa.Storage.get('number_kion'), 10) || 27, active: !Lampa.Storage.get('kion_remove')},
                {id: 'ivi', order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 28, active: !Lampa.Storage.get('ivi_remove')},
                {id: 'okko', order: parseInt(Lampa.Storage.get('number_okko'), 10) || 29, active: !Lampa.Storage.get('okko_remove')},
                {id: 'kinopoisk', order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30, active: !Lampa.Storage.get('kinopoisk_remove')},
                {id: 'wink', order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31, active: !Lampa.Storage.get('wink_remove')},
                {id: 'sts', order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32, active: !Lampa.Storage.get('sts_remove')},
                {id: 'tnt', order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33, active: !Lampa.Storage.get('tnt_remove')},
                {id: 'collections_inter_tv', order: parseInt(Lampa.Storage.get('number_collections_inter_tv'), 10) || 34, active: !Lampa.Storage.get('collections_inter_tv_remove')},
                {id: 'collections_rus_tv', order: parseInt(Lampa.Storage.get('number_collections_rus_tv'), 10) || 35, active: !Lampa.Storage.get('collections_rus_tv_remove')},
                {id: 'collections_inter_movie', order: parseInt(Lampa.Storage.get('number_collections_inter_movie'), 10) || 36, active: !Lampa.Storage.get('collections_inter_movie_remove')},
                {id: 'collections_rus_movie', order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37, active: !Lampa.Storage.get('collections_rus_movie_remove')}
            ];
            var loadedIds = [];
            var loaded = [];

            function shuffleArray(array) {
                for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            var yearRanges = [
                {start: 2019, end: 2021},
                {start: 2022, end: 2024},
                {start: 2025, end: 2027},
                {start: 2028, end: 2030}
            ];
            var randomRange = yearRanges[Math.floor(Math.random() * yearRanges.length)];
            var startYear = randomRange.start + '-01-01';
            var endYear = randomRange.end + '-12-31';
            var anotherRange = yearRanges[Math.floor(Math.random() * yearRanges.length)];
            var startYear2 = anotherRange.start + '-01-01';
            var endYear2 = anotherRange.end + '-12-31';
            var sortOptions = ['popularity.desc', 'revenue.desc', 'vote_count.desc'];
            var randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
            var movieSortOptions = ['popularity.desc', 'primary_release_date.desc', 'revenue.desc'];
            var randomMovieSort = movieSortOptions[Math.floor(Math.random() * movieSortOptions.length)];
            var currentDate = new Date().toISOString().substr(0, 10);
            var lastMonth = new Date(currentDate);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            var lastMonthDate = lastMonth.toISOString().substr(0, 10);

            function loadCategory(id, onSuccess) {
                var handlers = {
                    'now_watch': function(callback) {
                        try {
                            Lampa.Api.get('personalhub/now_watch', pl, function(result) {
                                result.title = Lampa.Lang.translate('Сейчас смотрят');
                                if (Lampa.Storage.get('now_watch_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('now_watch_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('now_watch_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('now_watch_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'upcoming_episodes': function(callback) {
                        try {
                            callback({
                                source: 'tmdb',
                                results: Lampa.Activity.active().slice(0, 20),
                                title: Lampa.Lang.translate('Выход ближайших эпизодов'),
                                nomore: true,
                                cardClass: function(params, item) {
                                    return new CardBuilder(params, item);
                                }
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_day': function(callback) {
                        try {
                            Lampa.Api.get('trending/all/day', pl, function(result) {
                                result.title = Lampa.Lang.translate('Сегодня в тренде');
                                if (Lampa.Storage.get('trend_day_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_day_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_day_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_day_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_day_tv': function(callback) {
                        try {
                            Lampa.Api.get('trending/tv/day', pl, function(result) {
                                result.title = Lampa.Lang.translate('Сегодня в тренде (сериалы)');
                                if (Lampa.Storage.get('trend_day_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_day_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_day_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_day_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов TV', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_day_film': function(callback) {
                        try {
                            Lampa.Api.get('trending/movie/day', pl, function(result) {
                                result.title = Lampa.Lang.translate('Сегодня в тренде (фильмы)');
                                if (Lampa.Storage.get('trend_day_film_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_day_film_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_day_film_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_day_film_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_week': function(callback) {
                        try {
                            Lampa.Api.get('trending/all/week', pl, function(result) {
                                result.title = Lampa.Lang.translate('В тренде за неделю');
                                if (Lampa.Storage.get('trend_week_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_week_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_week_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_week_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов недели', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_week_tv': function(callback) {
                        try {
                            Lampa.Api.get('trending/tv/week', pl, function(result) {
                                result.title = Lampa.Lang.translate('В тренде за неделю (сериалы)');
                                if (Lampa.Storage.get('trend_week_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_week_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_week_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_week_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов TV недели', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'trend_week_film': function(callback) {
                        try {
                            Lampa.Api.get('trending/movie/week', pl, function(result) {
                                result.title = Lampa.Lang.translate('В тренде за неделю (фильмы)');
                                if (Lampa.Storage.get('trend_week_film_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('trend_week_film_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('trend_week_film_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('trend_week_film_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки трендов фильмов недели', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'upcoming': function(callback) {
                        try {
                            Lampa.Api.get('movie/now_playing', pl, function(result) {
                                result.title = Lampa.Lang.translate('Смотрите в кинотеатрах');
                                if (Lampa.Storage.get('upcoming_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('upcoming_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('upcoming_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('upcoming_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки предстоящих', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'popular_movie': function(callback) {
                        try {
                            Lampa.Api.get('movie/popular', pl, function(result) {
                                result.title = Lampa.Lang.translate('Популярные фильмы');
                                if (Lampa.Storage.get('popular_movie_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('popular_movie_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('popular_movie_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('popular_movie_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки популярных фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'popular_tv': function(callback) {
                        try {
                            Lampa.Api.get('tv/popular', pl, function(result) {
                                result.title = Lampa.Lang.translate('Популярные сериалы');
                                if (Lampa.Storage.get('popular_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('popular_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('popular_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('popular_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки популярных сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'top_movie': function(callback) {
                        try {
                            Lampa.Api.get('movie/top_rated', pl, function(result) {
                                result.title = Lampa.Lang.translate('Топ фильмы');
                                if (Lampa.Storage.get('top_movie_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('top_movie_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('top_movie_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('top_movie_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки топ фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'top_tv': function(callback) {
                        try {
                            Lampa.Api.get('tv/top_rated', pl, function(result) {
                                result.title = Lampa.Lang.translate('Топ сериалы');
                                if (Lampa.Storage.get('top_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('top_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('top_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('top_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки топ сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'netflix': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?with_networks=8&sort_by=' + randomMovieSort + '&primary_release_date.gte=' + startYear + '&primary_release_date.lte=' + endYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('Netflix');
                                if (Lampa.Storage.get('netflix_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('netflix_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('netflix_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('netflix_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Netflix', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'apple_tv': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?with_networks=355&sort_by=' + randomMovieSort + '&primary_release_date.gte=' + startYear + '&primary_release_date.lte=' + endYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('Apple TV+');
                                if (Lampa.Storage.get('apple_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('apple_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('apple_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('apple_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Apple TV', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'prime_video': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?with_networks=9&sort_by=' + randomMovieSort + '&primary_release_date.gte=' + startYear + '&primary_release_date.lte=' + endYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('Prime Video');
                                if (Lampa.Storage.get('prime_video_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('prime_video_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('prime_video_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('prime_video_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Prime Video', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'mgm': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?with_networks=2496&sort_by=' + randomMovieSort + '&primary_release_date.gte=' + startYear + '&primary_release_date.lte=' + endYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('MGM+');
                                if (Lampa.Storage.get('mgm_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('mgm_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('mgm_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('mgm_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки MGM', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'hbo': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('HBO');
                                if (Lampa.Storage.get('hbo_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('hbo_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('hbo_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('hbo_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки HBO', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'dorams': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Дорамы');
                                if (Lampa.Storage.get('dorams_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('dorams_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('dorams_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('dorams_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки дорам', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'tur_serials': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Турецкие сериалы');
                                if (Lampa.Storage.get('tur_serials_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('tur_serials_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('tur_serials_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('tur_serials_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки турецких сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'ind_films': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&primary_release_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Индийские фильмы');
                                if (Lampa.Storage.get('ind_films_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('ind_films_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('ind_films_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('ind_films_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки индийских фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'rus_movie': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomMovieSort + '&primary_release_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Русские фильмы');
                                if (Lampa.Storage.get('rus_movie_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('rus_movie_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('rus_movie_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('rus_movie_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки русских фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'rus_tv': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Русские сериалы');
                                if (Lampa.Storage.get('rus_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('rus_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('rus_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('rus_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки русских сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'rus_mult': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Русские мультфильмы');
                                if (Lampa.Storage.get('rus_mult_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('rus_mult_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('rus_mult_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('rus_mult_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки русских мультфильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'start': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Start');
                                if (Lampa.Storage.get('start_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('start_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('start_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('start_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Start', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'premier': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('Premier');
                                if (Lampa.Storage.get('premier_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('premier_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('premier_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('premier_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Premier', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'kion': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('KION');
                                if (Lampa.Storage.get('kion_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('kion_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('kion_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('kion_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки KION', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'ivi': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('ИВИ');
                                if (Lampa.Storage.get('ivi_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('ivi_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('ivi_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('ivi_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки IVI', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'okko': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('OKKO');
                                if (Lampa.Storage.get('okko_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('okko_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('okko_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('okko_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки OKKO', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'kinopoisk': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('КиноПоиск');
                                if (Lampa.Storage.get('kinopoisk_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('kinopoisk_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('kinopoisk_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('kinopoisk_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки КиноПоиск', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'wink': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = 'Wink';
                                if (Lampa.Storage.get('wink_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('wink_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('wink_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('wink_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки Wink', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'sts': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('СТС');
                                if (Lampa.Storage.get('sts_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('sts_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('sts_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('sts_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки СТС', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'tnt': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + currentDate, pl, function(result) {
                                result.title = Lampa.Lang.translate('ТНТ');
                                if (Lampa.Storage.get('tnt_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('tnt_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('tnt_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('tnt_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки ТНТ', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'collections_inter_tv': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' + randomSort + '&first_air_date.gte=' + startYear + '&first_air_date.lte=' + endYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('Подборки зарубежных сериалов');
                                if (Lampa.Storage.get('collections_inter_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('collections_inter_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('collections_inter_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('collections_inter_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки подборок зарубежных сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'collections_rus_tv': function(callback) {
                        try {
                            Lampa.Api.get('discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort + '&air_date.lte=' + endYear + '&first_air_date.gte=' + startYear, pl, function(result) {
                                result.title = Lampa.Lang.translate('Подборки русских сериалов');
                                if (Lampa.Storage.get('collections_rus_tv_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('collections_rus_tv_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('collections_rus_tv_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('collections_rus_tv_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки подборок русских сериалов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'collections_inter_movie': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?with_genres=&sort_by=' + randomMovieSort + '&primary_release_date.gte=' + startYear2 + '&primary_release_date.lte=' + endYear2, pl, function(result) {
                                result.title = Lampa.Lang.translate('Подборки зарубежных фильмов');
                                if (Lampa.Storage.get('collections_inter_movie_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('collections_inter_movie_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('collections_inter_movie_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('collections_inter_movie_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки подборок зарубежных фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    },
                    'collections_rus_movie': function(callback) {
                        try {
                            Lampa.Api.get('discover/movie?primary_release_date.gte=' + startYear2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomMovieSort + '&primary_release_date.lte=' + endYear2, pl, function(result) {
                                result.title = Lampa.Lang.translate('Подборки русских фильмов');
                                if (Lampa.Storage.get('collections_rus_movie_display') == '2') {
                                    result.collection = true;
                                    result.line_type = 'collection';
                                }
                                if (Lampa.Storage.get('collections_rus_movie_display') == '3') {
                                    result.small = true;
                                    result.wide = true;
                                    result.results.forEach(function(elem) {
                                        elem.promo = elem.overview;
                                        elem.promo_title = elem.title || elem.name;
                                    });
                                }
                                if (Lampa.Storage.get('collections_rus_movie_display') == '4') {
                                    result.line_type = 'top';
                                }
                                if (Lampa.Storage.get('collections_rus_movie_shuffle') == true) {
                                    shuffleArray(result.results);
                                }
                                callback(result);
                            }, function(error) {
                                callback({results: [], title: 'Ошибка загрузки подборок русских фильмов', error: error});
                            });
                        } catch (e) {
                            callback({results: [], title: 'Ошибка: ' + e.message});
                        }
                    }
                };

                var activeCategories = categories.filter(function(cat) { return cat.active; }).sort(function(a, b) { return a.order - b.order; });
                if (activeCategories.length === 0) return onSuccess([]);

                var loaders = [];
                activeCategories.forEach(function(cat) {
                    if (!loadedIds.includes(cat.id) && handlers[cat.id]) {
                        var loader = handlers[cat.id];
                        loaders.push(function(cb) {
                            loader(function(data) {
                                loaded.push(data);
                                cb();
                            });
                        });
                        loadedIds.push(cat.id);
                    }
                });

                if (!Lampa.Storage.get('change_order_cards_main') && pl.genres_cat && Array.isArray(pl.genres_cat) && pl.genres_cat.length > 0) {
                    pl.genres_cat.forEach(function(cat) {
                        if (!loadedIds.includes(cat.id)) {
                            var loader = function(callback) {
                                try {
                                    Lampa.Api.get('discover/tv?with_genres=' + cat.id, pl, function(result) {
                                        result.title = Lampa.Lang.translate(cat.title.replace(/[^a-z_]/g, ''));
                                        shuffleArray(result.results);
                                        callback(result);
                                    }, function(error) {
                                        callback({results: [], title: 'Ошибка жанра: ' + error});
                                    });
                                } catch (e) {
                                    callback({results: [], title: 'Ошибка жанра: ' + e.message});
                                }
                            };
                            loaders.push(loader);
                            loadedIds.push(cat.id);
                        }
                    });
                }

                if (loaders.length > 0) {
                    Lampa.Api.queue(loaders, count, function() {
                        onSuccess(loaded);
                    }, onError || function() {
                        console.warn('PersonalHub: Ошибка очереди');
                    });
                } else {
                    console.warn('PersonalHub: Нет доступных категорий для загрузки.');
                    onSuccess([]);
                }
            }

            function startLoad(onComplete, onError) {
                loadCategory('', onComplete, onError);
            }
            return startLoad(onComplete, onError);
        };
    }

    // Регистрация источника
    Lampa.Manifest.sources.push({
        name: 'PersonalHub',
        url: 'personalhub',
        card: function(params) {
            return new CardBuilder(params, {}).create();
        },
        main: function(params) {
            return new PersonalHub(params).main;
        },
        search: function(params) {
            Lampa.Api.get('search/multi', params, function(result) {
                params.callback(result.results);
            });
        }
    });

    // Добавление в настройки источника
    Lampa.SettingsApi.source.add({
        name: 'PersonalHub',
        type: 'source',
        html: '<div class="settings-folder selector" data-component="personalhub"><div class="settings-folder__icon"><i class="icon-settings"></i></div><div class="settings-folder__name">PersonalHub</div></div>'
    });

    // Добавление параметров настроек
    Lampa.SettingsApi.main.add([
        {
            component: 'personalhub',
            param_name: 'personalhub_enabled',
            type: 'toggle',
            html_arg: 'enabled',
            name: 'Включить PersonalHub',
            default: true
        },
        {
            component: 'personalhub',
            param_name: 'personalhub_shuffle',
            type: 'toggle',
            html_arg: 'shuffle',
            name: 'Перемешивать карточки',
            default: false
        },
        {
            component: 'personalhub',
            param_name: 'personalhub_display',
            type: 'select',
            html_arg: 'display',
            values: {1: 'Стандарт', 2: 'Коллекция', 3: 'Широкие маленькие', 4: 'Топ'},
            name: 'Вид отображения',
            default: 1
        }
    ]);

    // Функция добавления настроек категории (полная)
    function addCategorySettings(component, name, description, shuffleDefault, displayDefault, orderDefault, removeDefault) {
        Lampa.SettingsApi.main.add([
            {
                component: 'personalhub',
                param_name: component + '_enabled',
                type: 'toggle',
                html_arg: 'enabled',
                name: name,
                default: true,
                description: description
            },
            {
                component: 'personalhub',
                param_name: component + '_shuffle',
                type: 'toggle',
                html_arg: 'shuffle',
                name: 'Перемешивать ' + name.toLowerCase(),
                default: shuffleDefault
            },
            {
                component: 'personalhub',
                param_name: component + '_display',
                type: 'select',
                html_arg: 'display',
                values: {1: 'Стандарт', 2: 'Коллекция', 3: 'Широкие маленькие', 4: 'Топ'},
                name: 'Вид отображения ' + name.toLowerCase(),
                default: displayDefault
            },
            {
                component: 'personalhub',
                param_name: 'number_' + component,
                type: 'select',
                html_arg: 'order',
                values: {1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: '11', 12: '12', 13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20', 21: '21', 22: '22', 23: '23', 24: '24', 25: '25', 26: '26', 27: '27', 28: '28', 29: '29', 30: '30', 31: '31', 32: '32', 33: '33', 34: '34', 35: '35', 36: '36', 37: '37'},
                name: 'Порядок отображения ' + name.toLowerCase(),
                default: orderDefault
            },
            {
                component: 'personalhub',
                param_name: component + '_remove',
                type: 'toggle',
                html_arg: 'remove',
                name: 'Убрать ' + name.toLowerCase() + ' с главной',
                default: removeDefault
            }
        ]);
    }

    // Добавление настроек для всех категорий (полное)
    addCategorySettings('now_watch', 'Сейчас смотрят', 'Нажми для настройки', false, '1', '1', false);
    addCategorySettings('upcoming_episodes', 'Выход ближайших эпизодов', 'Нажми для настройки', false, '1', '2', false);
    addCategorySettings('trend_day', 'Сегодня в тренде', 'Нажми для настройки', false, '1', '3', false);
    addCategorySettings('trend_day_tv', 'Сегодня в тренде (сериалы)', 'Нажми для настройки', true, '1', '4', false);
    addCategorySettings('trend_day_film', 'Сегодня в тренде (фильмы)', 'Нажми для настройки', true, '1', '5', false);
    addCategorySettings('trend_week', 'В тренде за неделю', 'Нажми для настройки', false, '1', '6', false);
    addCategorySettings('trend_week_tv', 'В тренде за неделю (сериалы)', 'Нажми для настройки', true, '1', '7', false);
    addCategorySettings('trend_week_film', 'В тренде за неделю (фильмы)', 'Нажми для настройки', true, '1', '8', false);
    addCategorySettings('upcoming', 'Смотрите в кинотеатрах', 'Нажми для настройки', false, '1', '9', false);
    addCategorySettings('popular_movie', 'Популярные фильмы', 'Нажми для настройки', false, '1', '10', false);
    addCategorySettings('popular_tv', 'Популярные сериалы', 'Нажми для настройки', false, '4', '11', false);
    addCategorySettings('top_movie', 'Топ фильмы', 'Нажми для настройки', false, '4', '12', false);
    addCategorySettings('top_tv', 'Топ сериалы', 'Нажми для настройки', false, '4', '13', false);
    addCategorySettings('netflix', 'Netflix', 'Нажми для настройки', true, '1', '14', false);
    addCategorySettings('apple_tv', 'Apple TV+', 'Нажми для настройки', true, '1', '15', false);
    addCategorySettings('prime_video', 'Prime Video', 'Нажми для настройки', true, '1', '16', false);
    addCategorySettings('mgm', 'MGM+', 'Нажми для настройки', true, '1', '17', false);
    addCategorySettings('hbo', 'HBO', 'Нажми для настройки', true, '1', '18', false);
    addCategorySettings('dorams', 'Дорамы', 'Нажми для настройки', true, '1', '19', false);
    addCategorySettings('tur_serials', 'Турецкие сериалы', 'Нажми для настройки', true, '1', '20', false);
    addCategorySettings('ind_films', 'Индийские фильмы', 'Нажми для настройки', true, '1', '21', false);
    addCategorySettings('rus_movie', 'Русские фильмы', 'Нажми для настройки', true, '1', '22', false);
    addCategorySettings('rus_tv', 'Русские сериалы', 'Нажми для настройки', true, '1', '23', false);
    addCategorySettings('rus_mult', 'Русские мультфильмы', 'Нажми для настройки', true, '1', '24', false);
    addCategorySettings('start', 'Start', 'Нажми для настройки', true, '1', '25', false);
    addCategorySettings('premier', 'Premier', 'Нажми для настройки', true, '1', '26', false);
    addCategorySettings('kion', 'KION', 'Нажми для настройки', true, '1', '27', false);
    addCategorySettings('ivi', 'ИВИ', 'Нажми для настройки', true, '1', '28', false);
    addCategorySettings('okko', 'OKKO', 'Нажми для настройки', true, '1', '29', false);
    addCategorySettings('kinopoisk', 'КиноПоиск', 'Нажми для настройки', true, '1', '30', false);
    addCategorySettings('wink', 'Wink', 'Нажми для настройки', true, '1', '31', false);
    addCategorySettings('sts', 'СТС', 'Нажми для настройки', true, '1', '32', false);
    addCategorySettings('tnt', 'ТНТ', 'Нажми для настройки', true, '1', '33', false);
    addCategorySettings('collections_inter_tv', 'Подборки зарубежных сериалов', 'Нажми для настройки', true, '1', '34', false);
    addCategorySettings('collections_rus_tv', 'Подборки русских сериалов', 'Нажми для настройки', true, '1', '35', false);
    addCategorySettings('collections_inter_movie', 'Подборки зарубежных фильмов', 'Нажми для настройки', true, '1', '36', false);
    addCategorySettings('collections_rus_movie', 'Подборки русских фильмов', 'Нажми для настройки', true, '1', '37', false);

    // Дополнительные глобальные настройки
    Lampa.SettingsApi.main.add([
        {
            component: 'personalhub',
            param_name: 'change_order_cards_main',
            type: 'toggle',
            html_arg: 'order',
            name: 'Изменять порядок карточек на главной',
            default: true
        },
        {
            component: 'personalhub',
            param_name: 'upcoming_episodes_remove',
            type: 'toggle',
            html_arg: 'remove',
            name: 'Убрать предстоящие эпизоды с главной',
            default: false
        }
    ]);

    // Listener для обновления настроек
    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'ready') {
            Lampa.SettingsApi.update('personalhub');
        }
    });

    // Инициализация по умолчанию
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi) {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('bylampa_source_params', false)) {
                initDefaults();
            }
        }
    }, 200);

    function initDefaults() {
        Lampa.Storage.set('source', 'personalhub');
        Lampa.Storage.set('trend_day_remove', false);
        Lampa.Storage.set('trend_day_tv_remove', false);
        Lampa.Storage.set('trend_day_film_remove', false);
        Lampa.Storage.set('trend_week_remove', false);
        Lampa.Storage.set('trend_week_tv_remove', false);
        Lampa.Storage.set('trend_week_film_remove', false);
        Lampa.Storage.set('upcoming_remove', false);
        Lampa.Storage.set('popular_movie_remove', false);
        Lampa.Storage.set('popular_tv_remove', false);
        Lampa.Storage.set('top_movie_remove', false);
        Lampa.Storage.set('top_tv_remove', false);
        Lampa.Storage.set('netflix_remove', false);
        Lampa.Storage.set('apple_tv_remove', false);
        Lampa.Storage.set('prime_video_remove', false);
        Lampa.Storage.set('mgm_remove', false);
        Lampa.Storage.set('hbo_remove', false);
        Lampa.Storage.set('dorams_remove', false);
        Lampa.Storage.set('tur_serials_remove', false);
        Lampa.Storage.set('ind_films_remove', false);
        Lampa.Storage.set('rus_movie_remove', false);
        Lampa.Storage.set('rus_tv_remove', false);
        Lampa.Storage.set('rus_mult_remove', false);
        Lampa.Storage.set('start_remove', false);
        Lampa.Storage.set('premier_remove', false);
        Lampa.Storage.set('kion_remove', false);
        Lampa.Storage.set('ivi_remove', false);
        Lampa.Storage.set('okko_remove', false);
        Lampa.Storage.set('kinopoisk_remove', false);
        Lampa.Storage.set('wink_remove', false);
        Lampa.Storage.set('sts_remove', false);
        Lampa.Storage.set('tnt_remove', false);
        Lampa.Storage.set('collections_inter_tv_remove', false);
        Lampa.Storage.set('collections_rus_tv_remove', false);
        Lampa.Storage.set('collections_inter_movie_remove', false);
        Lampa.Storage.set('collections_rus_movie_remove', false);
        Lampa.Storage.set('now_watch_remove', false);
        Lampa.Storage.set('upcoming_episodes_remove', false);
        Lampa.Storage.set('change_order_cards_main', true);
        Lampa.Storage.set('bylampa_source_params', true);
        console.log('PersonalHub defaults initialized');
    }

    // Listener для готовности приложения
    if (window.appready) {
        initDefaults();
    } else {
        Lampa.listener.follow('app', function(e) {
            if (e.type == 'ready' && e.event == 'start') {
                initDefaults();
            }
        });
    }
})();
