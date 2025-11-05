(function() {
    'use strict';
    Lampa.Platform.tv();

   // (function() {
    //    'use strict';

        function CardEpisode(data) {
            var object = data.item || data,
                episode = data.episode || {};

            if (object.source == undefined) object.source = 'bylampa_source';
            Lampa.TimeTable.add(object, {
                'title': object.title,
                'original_title': object.original_name,
                'release_date': object.release_date
            });
            object.release_year = ((object.release_year || '0000') + '').slice(0, 4);

            function hideElement(elem) {
                if (elem) elem.remove();
            }

            this.build = function() {
                this.card = Lampa.Template.js('card_episode');
                this.img_poster = this.card.find('.card__img') || {};
                this.img_episode = this.card.find('.full-episode__img img') || {};
                this.card.find('.card__title').innerText = object.title;
                this.card.find('.card__age').innerText = object.release_year || '';
                episode && episode.air_date && (this.card.find('.full-episode__name').innerText = episode.name || Lang.translate('noname'),
                    this.card.find('.full-episode__date').innerText = episode.air_date || '',
                    this.card.find('.full-episode__num').innerText = episode.episode_number ? Lampa.Utils.parseTime(episode.episode_number).short : '----');
                object.release_year == '0000' ? hideElement(this.card.find('.card__age')) : this.card.find('.card__age').innerText = object.release_year;
                this.card.addEventListener('hover:enter', this.onEnter.bind(this));
            };

            this.image = function() {
                var _this = this;

                this.img_poster.onload = function() {};
                this.img_poster.onerror = function() {
                    _this.img_poster.src = './img/img_broken.svg';
                };

                this.img_episode.onload = function() {
                    _this.card.find('.full-episode__img').classList.add('full-episode__img--loaded');
                };
                this.img_episode.onerror = function() {
                    _this.img_episode.src = './img/img_broken.svg';
                };
            };

            this.create = function() {
                this.build();
                this.card.addEventListener('hover:focus', function() {
                    if (_this.onFocus) _this.onFocus(_this.card, object);
                });
                this.card.addEventListener('hover:hover', function() {
                    if (_this.onHover) _this.onHover(_this.card, object);
                });
                this.card.addEventListener('hover:enter', function() {
                    if (_this.onEnter) _this.onEnter(_this.card, object);
                });
                this.image();
            };

            this.onEnter = function() {
                if (object.poster_path) this.img_poster.src = Lampa.Api.img(object.poster_path);
                else {
                    if (object.backdrop_path) this.img_poster.src = Lampa.Api.img(object.backdrop_path);
                    else {
                        if (object.profile_path) this.img_poster.src = object.profile_path;
                        else {
                            if (object.img) this.img_poster.src = object.img;
                            else this.img_poster.src = './img/img_broken.svg';
                        }
                    }
                }

                if (object.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
                else {
                    if (object.backdrop_path) this.img_episode.src = Lampa.Api.img(object.backdrop_path, 'w300');
                    else {
                        if (episode.img_episode) this.img_episode.src = episode.img_episode;
                        else {
                            if (object.img) this.img_episode.src = object.img;
                            else this.img_episode.src = './img/img_broken.svg';
                        }
                    }
                }

                if (this.onVisible) this.onVisible(this.card, object);
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

            this.render = function(html) {
                return html ? this.card : $(this.card);
            };
        }

        function PersonalHub(api) {
            this.timeTable = new Lampa.TimeTable();
            this.discovery = false;

            this.main = function(params, on_create, on_ready) {
                var _this = this,
                    page_size = 56,
                    items = [{
                        id: 'now_watch',
                        order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1,
                        active: !Lampa.Storage.get('now_watch_remove')
                    }, {
                        id: 'upcoming_episodes',
                        order: 2,
                        active: !Lampa.Storage.get('upcoming_episodes_remove')
                    }, {
                        id: 'trend_day',
                        order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3,
                        active: !Lampa.Storage.get('trend_day_remove')
                    }, {
                        id: 'trend_day_tv',
                        order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4,
                        active: !Lampa.Storage.get('trend_day_tv_remove')
                    }, {
                        id: 'trend_day_film',
                        order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) || 5,
                        active: !Lampa.Storage.get('trend_day_film_remove')
                    }, {
                        id: 'trend_week',
                        order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6,
                        active: !Lampa.Storage.get('trend_week_remove')
                    }, {
                        id: 'trend_week_tv',
                        order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7,
                        active: !Lampa.Storage.get('trend_week_tv_remove')
                    }, {
                        id: 'trend_week_film',
                        order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) || 8,
                        active: !Lampa.Storage.get('trend_week_film_remove')
                    }, {
                        id: 'upcoming',
                        order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9,
                        active: !Lampa.Storage.get('upcoming_remove')
                    }, {
                        id: 'popular_movie',
                        order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) || 10,
                        active: !Lampa.Storage.get('popular_movie_remove')
                    }, {
                        id: 'popular_tv',
                        order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 11,
                        active: !Lampa.Storage.get('popular_tv_remove')
                    }, {
                        id: 'top_movie',
                        order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 12,
                        active: !Lampa.Storage.get('top_movie_remove')
                    }, {
                        id: 'top_tv',
                        order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 13,
                        active: !Lampa.Storage.get('top_tv_remove')
                    }, {
                        id: 'netflix',
                        order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14,
                        active: !Lampa.Storage.get('netflix_remove')
                    }, {
                        id: 'apple_tv',
                        order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15,
                        active: !Lampa.Storage.get('apple_tv_remove')
                    }, {
                        id: 'prime_video',
                        order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16,
                        active: !Lampa.Storage.get('prime_video_remove')
                    }, {
                        id: 'mgm',
                        order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 17,
                        active: !Lampa.Storage.get('mgm_remove')
                    }, {
                        id: 'hbo',
                        order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 18,
                        active: !Lampa.Storage.get('hbo_remove')
                    }, {
                        id: 'dorams',
                        order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19,
                        active: !Lampa.Storage.get('dorams_remove')
                    }, {
                        id: 'tur_serials',
                        order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20,
                        active: !Lampa.Storage.get('tur_serials_remove')
                    }, {
                        id: 'ind_films',
                        order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21,
                        active: !Lampa.Storage.get('ind_films_remove')
                    }, {
                        id: 'rus_movie',
                        order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22,
                        active: !Lampa.Storage.get('rus_movie_remove')
                    }, {
                        id: 'rus_tv',
                        order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23,
                        active: !Lampa.Storage.get('rus_tv_remove')
                    }, {
                        id: 'rus_mult',
                        order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24,
                        active: !Lampa.Storage.get('rus_mult_remove')
                    }, {
                        id: 'start',
                        order: parseInt(Lampa.Storage.get('number_start'), 10) || 25,
                        active: !Lampa.Storage.get('start_remove')
                    }, {
                        id: 'premier',
                        order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26,
                        active: !Lampa.Storage.get('premier_remove')
                    }, {
                        id: 'kion',
                        order: parseInt(Lampa.Storage.get('number_kion'), 10) || 27,
                        active: !Lampa.Storage.get('kion_remove')
                    }, {
                        id: 'ivi',
                        order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 28,
                        active: !Lampa.Storage.get('ivi_remove')
                    }, {
                        id: 'okko',
                        order: parseInt(Lampa.Storage.get('number_okko'), 10) || 29,
                        active: !Lampa.Storage.get('okko_remove')
                    }, {
                        id: 'kinopoisk',
                        order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30,
                        active: !Lampa.Storage.get('kinopoisk_remove')
                    }, {
                        id: 'wink',
                        order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31,
                        active: !Lampa.Storage.get('wink_remove')
                    }, {
                        id: 'sts',
                        order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32,
                        active: !Lampa.Storage.get('sts_remove')
                    }, {
                        id: 'tnt',
                        order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33,
                        active: !Lampa.Storage.get('tnt_remove')
                    }, {
                        id: 'collections_inter_tv',
                        order: parseInt(Lampa.Storage.get('number_collections_inter_tv'), 10) || 34,
                        active: !Lampa.Storage.get('collections_inter_tv_remove')
                    }, {
                        id: 'collections_rus_tv',
                        order: parseInt(Lampa.Storage.get('number_collections_rus_tv'), 10) || 35,
                        active: !Lampa.Storage.get('collections_rus_tv_remove')
                    }, {
                        id: 'collections_inter_movie',
                        order: parseInt(Lampa.Storage.get('number_collections_inter_movie'), 10) || 36,
                        active: !Lampa.Storage.get('collections_inter_movie_remove')
                    }, {
                        id: 'collections_rus_movie',
                        order: parseInt(Lampa.Storage.get('number_collections_rus_movie'), 10) || 37,
                        active: !Lampa.Storage.get('collections_rus_movie_remove')
                    }],
                    loaded = [];

                function shuffle(array) {
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                }

                var ranges = [{
                    start: 2023,
                    end: 2025
                }, {
                    start: 2020,
                    end: 2022
                }, {
                    start: 2017,
                    end: 2019
                }, {
                    start: 2014,
                    end: 2016
                }, {
                    start: 2011,
                    end: 2013
                }],
                    random_range1 = ranges[Math.floor(Math.random() * ranges.length)],
                    gte1 = random_range1.start + '-01-01',
                    lte1 = random_range1.end + '-12-31',
                    random_range2 = ranges[Math.floor(Math.random() * ranges.length)],
                    gte2 = random_range2.start + '-01-01',
                    lte2 = random_range2.end + '-12-31',
                    sort_options_tv = ['vote_count.desc', 'popularity.desc', 'revenue.desc'],
                    random_sort_tv_index = Math.floor(Math.random() * sort_options_tv.length),
                    sort_tv = sort_options_tv[random_sort_tv_index],
                    sort_options_movie = ['vote_count.desc', 'popularity.desc', 'revenue.desc'],
                    random_sort_movie_index = Math.floor(Math.random() * sort_options_movie.length),
                    sort_movie = sort_options_movie[random_sort_movie_index],
                    current_date = new Date().toISOString().substr(0, 10),
                    last_month = new Date(current_date);
                last_month.setMonth(last_month.getMonth() - 1);
                var last_month_date = last_month.toISOString().substr(0, 10);

                var fetchers = {
                    'now_watch': function(callback) {
                        _this.get('movie/now_playing', params, function(data) {
                            data.title = Lampa.Lang.translate('title_now_watch');
                            if (Lampa.Storage.get('now_watch_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('now_watch_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('now_watch_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('now_watch_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'upcoming_episodes': function(callback) {
                        callback({
                            'source': 'bylampa_source',
                            'results': Lampa.Activity.lately().slice(0, 20),
                            'title': Lampa.Lang.translate('title_upcoming_episodes'),
                            'nomore': true,
                            'cardClass': function(item, episode) {
                                return new CardEpisode(item, episode);
                            }
                        });
                    },
                    'trend_day': function(callback) {
                        _this.get('trending/all/day', params, function(data) {
                            data.title = Lampa.Lang.translate('title_trend_day');
                            if (Lampa.Storage.get('trend_day_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_day_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_day_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_day_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'trend_day_tv': function(callback) {
                        _this.get('trending/tv/day', params, function(data) {
                            data.title = Lampa.Lang.translate('Сегодня\x20в\x20тренде\x20(сериалы)');
                            if (Lampa.Storage.get('trend_day_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_day_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_day_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_day_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'trend_day_film': function(callback) {
                        _this.get('trending/movie/day', params, function(data) {
                            data.title = Lampa.Lang.translate('Сегодня\x20в\x20тренде\x20(фильмы)');
                            if (Lampa.Storage.get('trend_day_film_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_day_film_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_day_film_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_day_film_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'trend_week': function(callback) {
                        _this.get('trending/all/week', params, function(data) {
                            data.title = Lampa.Lang.translate('В\x20тренде\x20за\x20неделю');
                            if (Lampa.Storage.get('trend_week_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_week_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_week_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_week_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'trend_week_tv': function(callback) {
                        _this.get('trending/tv/week', params, function(data) {
                            data.title = Lampa.Lang.translate('В\x20тренде\x20за\x20неделю\x20(сериалы)');
                            if (Lampa.Storage.get('trend_week_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_week_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_week_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_week_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'trend_week_film': function(callback) {
                        _this.get('trending/movie/week', params, function(data) {
                            data.title = Lampa.Lang.translate('В\x20тренде\x20за\x20неделю\x20(фильмы)');
                            if (Lampa.Storage.get('trend_week_film_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('trend_week_film_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('trend_week_film_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('trend_week_film_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'upcoming': function(callback) {
                        _this.get('movie/upcoming', params, function(data) {
                            data.title = Lampa.Lang.translate('title_upcoming');
                            if (Lampa.Storage.get('upcoming_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('upcoming_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('upcoming_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('upcoming_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'popular_movie': function(callback) {
                        _this.get('movie/popular', params, function(data) {
                            data.title = Lampa.Lang.translate('Популярные\x20фильмы');
                            if (Lampa.Storage.get('popular_movie_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('popular_movie_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('popular_movie_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('popular_movie_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'popular_tv': function(callback) {
                        _this.get('trending/tv/week', params, function(data) {
                            data.title = Lampa.Lang.translate('Популярные\x20сериалы');
                            if (Lampa.Storage.get('popular_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('popular_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('popular_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('popular_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'top_movie': function(callback) {
                        _this.get('movie/top_rated', params, function(data) {
                            data.title = Lampa.Lang.translate('Топ\x20фильмы');
                            if (Lampa.Storage.get('top_movie_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('top_movie_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('top_movie_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('top_movie_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'top_tv': function(callback) {
                        _this.get('tv/top_rated', params, function(data) {
                            data.title = Lampa.Lang.translate('Топ\x20сериалы');
                            if (Lampa.Storage.get('top_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('top_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('top_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('top_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'netflix': function(callback) {
                        _this.get('discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Netflix');
                            if (Lampa.Storage.get('netflix_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('netflix_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('netflix_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('netflix_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'apple_tv': function(callback) {
                        _this.get('discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Apple\x20TV+');
                            if (Lampa.Storage.get('apple_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('apple_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('apple_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('apple_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'prime_video': function(callback) {
                        _this.get('discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Prime\x20Video');
                            if (Lampa.Storage.get('prime_video_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('prime_video_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('prime_video_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('prime_video_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'mgm': function(callback) {
                        _this.get('discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('MGM+');
                            if (Lampa.Storage.get('mgm_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('mgm_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('mgm_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('mgm_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'hbo': function(callback) {
                        _this.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('HBO');
                            if (Lampa.Storage.get('hbo_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('hbo_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('hbo_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('hbo_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'dorams': function(callback) {
                        _this.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Дорамы');
                            if (Lampa.Storage.get('dorams_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('dorams_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('dorams_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('dorams_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'tur_serials': function(callback) {
                        _this.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Турецкие\x20сериалы');
                            if (Lampa.Storage.get('tur_serials_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('tur_serials_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('tur_serials_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('tur_serials_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'ind_films': function(callback) {
                        _this.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Индийские\x20фильмы');
                            if (Lampa.Storage.get('ind_films_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('ind_films_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('ind_films_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('ind_films_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'rus_movie': function(callback) {
                        _this.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + new Date().toISOString().substr(0, 10), params, function(data) {
                            data.title = Lampa.Lang.translate('Русские\x20фильмы');
                            if (Lampa.Storage.get('rus_movie_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('rus_movie_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('rus_movie_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('rus_movi_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'rus_tv': function(callback) {
                        _this.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Русские\x20сериалы');
                            if (Lampa.Storage.get('rus_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('rus_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('rus_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('rus_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'rus_mult': function(callback) {
                        _this.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + new Date().toISOString().substr(0, 10), params, function(data) {
                            data.title = Lampa.Lang.translate('Русские\x20мультфильмы');
                            if (Lampa.Storage.get('rus_mult_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('rus_mult_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('rus_mult_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('rus_mult_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'start': function(callback) {
                        _this.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Start');
                            if (Lampa.Storage.get('start_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('start_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('start_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('start_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'premier': function(callback) {
                        _this.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Premier');
                            if (Lampa.Storage.get('premier_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('premier_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('premier_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('premier_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'kion': function(callback) {
                        _this.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('KION');
                            if (Lampa.Storage.get('kion_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('kion_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('kion_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('kion_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'ivi': function(callback) {
                        _this.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('ИВИ');
                            if (Lampa.Storage.get('ivi_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('ivi_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('ivi_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('ivi_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'okko': function(callback) {
                        _this.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('OKKO');
                            if (Lampa.Storage.get('okko_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('okko_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('okko_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('okko_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'kinopoisk': function(callback) {
                        _this.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('КиноПоиск');
                            if (Lampa.Storage.get('kinopoisk_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('kinopoisk_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('kinopoisk_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('kinopois_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'wink': function(callback) {
                        _this.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('Wink');
                            if (Lampa.Storage.get('wink_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('wink_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('wink_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('wink_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'sts': function(callback) {
                        _this.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('СТС');
                            if (Lampa.Storage.get('sts_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('sts_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('sts_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('sts_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'tnt': function(callback) {
                        _this.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + current_date, params, function(data) {
                            data.title = Lampa.Lang.translate('ТНТ');
                            if (Lampa.Storage.get('tnt_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('tnt_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('tnt_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('tnt_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'collections_inter_tv': function(callback) {
                        _this.get('discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' + sort_tv + '&first_air_date.lte=' + lte1 + '&first_air_date.gte=' + gte1, params, function(data) {
                            data.title = Lampa.Lang.translate('Подборки\x20зарубежных\x20сериалов');
                            if (Lampa.Storage.get('collections_inter_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('collections_inter_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('collections_inter_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('collections_inter_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'collections_rus_tv': function(callback) {
                        _this.get('discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + sort_tv + '&air_date.lte=' + lte1 + '&first_air_date.gte=' + gte1, params, function(data) {
                            data.title = Lampa.Lang.translate('Подборки\x20русских\x20сериалов');
                            if (Lampa.Storage.get('collections_rus_tv_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('collections_rus_tv_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('collections_rus_tv_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('collections_rus_tv_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'collections_inter_movie': function(callback) {
                        _this.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=' + sort_movie + '&primary_release_date.lte=' + lte2 + '&primary_release_date.gte=' + gte2, params, function(data) {
                            data.title = Lampa.Lang.translate('Подборки\x20зарубежных\x20фильмов');
                            if (Lampa.Storage.get('collections_inter_movie_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('collections_inter_movie_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('collections_inter_movie_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('collections_inter_movie_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    },
                    'collections_rus_movie': function(callback) {
                        _this.get('discover/movie?primary_release_date.gte=' + gte2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + sort_movie + '&primary_release_date.lte=' + lte2, params, function(data) {
                            data.title = Lampa.Lang.translate('Подборки\x20русских\x20фильмов');
                            if (Lampa.Storage.get('collections_rus_movie_display') == '2') {
                                data.collection = true;
                                data.line_type = 'collection';
                            }
                            if (Lampa.Storage.get('collections_rus_movie_display') == '3') {
                                data.small = true;
                                data.wide = true;
                                data.results.forEach(function(item) {
                                    item.promo = item.overview;
                                    item.promo_title = item.title || item.name;
                                });
                            }
                            if (Lampa.Storage.get('collections_rus_movie_display') == '4') {
                                data.line_type = 'top';
                            }
                            if (Lampa.Storage.get('collections_rus_movie_shuffle') == true) shuffle(data.results);
                            callback(data);
                        }, callback);
                    }
                };

                var active_items = items.filter(function(item) {
                    return item.active;
                }).sort(function(a, b) {
                    return a.order - b.order;
                });

                if (active_items.length === 0) return on_create();

                var fetch_list = [];

                active_items.forEach(function(item) {
                    if (!loaded.includes(item.id) && fetchers[item.id]) {
                        fetch_list.push(fetchers[item.id]);
                        loaded.push(item.id);
                    }
                });

                if (Lampa.Storage.get('bylampa_source_params') == false) api.genres_cat.forEach(function(cat) {
                    if (!loaded.includes(cat.id)) {
                        var fetch_genre = function(callback) {
                            _this.get('discover/movie?with_genres=' + cat.id, params, function(data) {
                                data.title = Lampa.Lang.translate(cat.title.replace(/[^a-z_]/g, ''));
                                shuffle(data.results);
                                callback(data);
                            }, callback);
                        };
                        fetch_list.push(fetch_genre);
                        loaded.push(cat.id);
                    }
                });

                if (fetch_list.length > 0) {
                    Lampa.Arrays.partNext(fetch_list, page_size, on_create, on_ready);
                } else {
                    console.log('Нет\x20доступных\x20категорий\x20для\x20загрузки.');
                }

                function render(data) {
                    on_create(data);
                }
            };
        }

        var bylampa_source = Object.assign({}, Lampa.Api.sources.tmdb, new PersonalHub(Lampa.Api.sources.tmdb));
        Lampa.Api.sources.bylampa_source = bylampa_source;
        Object.defineProperty(Lampa.Api.sources, 'bylampa_source', {
            get: function() {
                return bylampa_source;
            }
        });
        Lampa.SettingsApi.select('source', Object.assign({}, Lampa.SettingsApi.sources('source'), {
            'PersonalHub': 'PersonalHub'
        }), 'tmdb');

        if (Lampa.Storage.get('source') == 'PersonalHub') {
            var source = Lampa.Storage.get('source'),
                interval = setInterval(function() {
                    var manifest = Lampa.Manifest.app;
                    if (manifest) {
                        clearInterval(interval);
                        Lampa.Manifest.app = Object.assign({}, Lampa.Manifest.app, {
                            'source': source,
                            'title': Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase()
                        });
                    }
                }, 300);
        }

        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'settings') {
                Lampa.Settings.main().render().find('[data-component="bylampa_source"]').length == 0 && Lampa.SettingsApi.addComponent({
                    component: 'bylampa_source',
                    name: 'div[data-name="source"]'
                });
                Lampa.Settings.main().update();
                Lampa.Settings.main().render().find('.settings-param > div:contains("Источник\x20PersonalHub")').toggle('hide');
            }
        });

        Lampa.SettingsApi.addComponent({
            component: 'bylampa_source',
            param: {
                name: 'bylampa_source',
                type: 'static',
                default: true
            },
            field: {
                name: 'Источник\x20PersonalHub',
                description: 'Настройки\x20главного\x20экрана'
            },
            onRender: function(item) {
                setTimeout(function() {
                    $('.settings-param > div:contains("Источник\x20PersonalHub")').parent().insertAfter($('div[data-name="source"]'));
                    if (Lampa.Storage.field('source') !== 'PersonalHub') item.hide();
                    else item.show();
                }, 20);
                item.on('hover:enter', function() {
                    Lampa.Settings.update('bylampa_source');
                    Lampa.Controller.collection().listener.onBack = function() {
                        Lampa.Settings.update('more');
                    };
                });
            }
        });

        Lampa.Storage.listener.follow('change', function(e) {
            if (e.name == 'source') setTimeout(function() {
                if (Lampa.Storage.get('source') !== 'PersonalHub') $('.settings-param > div:contains("Источник\x20PersonalHub")').parent().hide();
                else $('.settings-param > div:contains("Источник\x20PersonalHub")').parent().show();
            }, 50);
        });

        function addSetting(component, name, description, default_value, type, values) {
            Lampa.Settings.listener.follow('open', function(e) {
                if (e.name === 'settings') {
                    Lampa.Settings.main().render().find('[data-component="' + component + '"]').length === 0 && Lampa.SettingsApi.addComponent({
                        component: component,
                        name: name
                    });
                    Lampa.Settings.main().update();
                    Lampa.Settings.main().render().find('#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(' + component + ')').addClass('hide');
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'bylampa_source',
                param: {
                    name: component,
                    type: type,
                    default: default_value
                },
                field: {
                    name: name,
                    description: description
                },
                onRender: function(item) {
                    item.on('hover:enter', function(e) {
                        var target = e.target,
                            parent = target.parentElement,
                            siblings = Array.from(parent.children),
                            index = siblings.indexOf(target),
                            order = index + 1;
                        Lampa.Settings.update(component);
                        Lampa.Controller.collection().listener.onBack = function() {
                            Lampa.Settings.update('bylampa_source');
                            setTimeout(function() {
                                var elem = document.querySelector('#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(' + order + ')');
                                Lampa.Controller.focus(elem);
                                Lampa.Controller.toggle('settings_component');
                            }, 5);
                        };
                    });
                }
            });
            Lampa.SettingsApi.addParam({
                component: component,
                param: {
                    name: component + '_remove',
                    type: 'trigger',
                    default: default_value
                },
                field: {
                    name: 'Убрать\x20с\x20главной\x20страницы'
                }
            });
            Lampa.SettingsApi.addParam({
                component: component,
                param: {
                    name: component + '_display',
                    type: 'select',
                    values: {
                        1: 'Стандарт',
                        2: 'Подборки\x20по\x20жанрам',
                        3: 'Широкие\x20маленькие',
                        4: 'Top\x20Line'
                    },
                    default: values.display
                },
                field: {
                    name: 'Вид\x20отображения'
                }
            });
            Lampa.SettingsApi.addParam({
                component: component,
                param: {
                    name: 'number_' + component,
                    type: 'select',
                    values: {
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                        6: '6',
                        7: '7',
                        8: '8',
                        9: '9',
                        10: '10',
                        11: '11',
                        12: '12',
                        13: '13',
                        14: '14',
                        15: '15',
                        16: '16',
                        17: '17',
                        18: '18',
                        19: '19',
                        20: '20',
                        21: '21',
                        22: '22',
                        23: '23',
                        24: '24',
                        25: '25',
                        26: '26',
                        27: '27',
                        28: '28',
                        29: '29',
                        30: '30',
                        31: '31',
                        32: '32',
                        33: '33',
                        34: '34',
                        35: '35',
                        36: '36',
                        37: '37'
                    },
                    default: values.order
                },
                field: {
                    name: 'Порядок\x20отображения'
                },
                onChange: function(value) {}
            });
            Lampa.SettingsApi.addParam({
                component: component,
                param: {
                    name: component + '_shuffle',
                    type: 'trigger',
                    default: values.shuffle
                },
                field: {
                    name: 'Изменять\x20порядок\x20карточек\x20на\x20главной'
                }
            });
        }

        addSetting('now_watch', 'Сейчас\x20смотрят', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '1', order: '1', shuffle: false });
        addSetting('trend_day', 'Сегодня\x20в\x20тренде', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '1', order: '3', shuffle: false });
        addSetting('trend_day_tv', 'Сегодня\x20в\x20тренде\x20(сериалы)', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '4', shuffle: false });
        addSetting('trend_day_film', 'Сегодня\x20в\x20тренде\x20(фильмы)', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '5', shuffle: false });
        addSetting('trend_week', 'В\x20тренде\x20за\x20неделю', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '1', order: '6', shuffle: false });
        addSetting('trend_week_tv', 'В\x20тренде\x20за\x20неделю\x20(сериалы)', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '7', shuffle: false });
        addSetting('trend_week_film', 'В\x20тренде\x20за\x20неделю\x20(фильмы)', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '8', shuffle: false });
        addSetting('upcoming', 'Смотрите\x20в\x20кинозалах', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '1', order: '9', shuffle: false });
        addSetting('popular_movie', 'Популярные\x20фильмы', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '1', order: '10', shuffle: false });
        addSetting('popular_tv', 'Популярные\x20сериалы', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '4', order: '11', shuffle: false });
        addSetting('top_movie', 'Топ\x20фильмы', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '4', order: '12', shuffle: false });
        addSetting('top_tv', 'Топ\x20сериалы', 'Нажми\x20для\x20настройки', false, 'trigger', { display: '4', order: '13', shuffle: false });
        addSetting('netflix', 'Netflix', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '14', shuffle: false });
        addSetting('apple_tv', 'Apple\x20TV+', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '15', shuffle: false });
        addSetting('prime_video', 'Prime\x20Video', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '16', shuffle: false });
        addSetting('mgm', 'MGM+', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '17', shuffle: false });
        addSetting('hbo', 'HBO', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '18', shuffle: false });
        addSetting('dorams', 'Дорамы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '19', shuffle: false });
        addSetting('tur_serials', 'Турецкие\x20сериалы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '20', shuffle: false });
        addSetting('ind_films', 'Индийские\x20фильмы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '21', shuffle: false });
        addSetting('rus_movie', 'Русские\x20фильмы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '22', shuffle: false });
        addSetting('rus_tv', 'Русские\x20сериалы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '23', shuffle: false });
        addSetting('rus_mult', 'Русские\x20мультфильмы', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '24', shuffle: false });
        addSetting('start', 'Start', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '25', shuffle: false });
        addSetting('premier', 'Premier', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '26', shuffle: false });
        addSetting('kion', 'KION', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '27', shuffle: false });
        addSetting('ivi', 'IVI', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '28', shuffle: false });
        addSetting('okko', 'Okko', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '29', shuffle: false });
        addSetting('kinopoisk', 'КиноПоиск', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '30', shuffle: false });
        addSetting('wink', 'Wink', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '31', shuffle: false });
        addSetting('sts', 'СТС', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '32', shuffle: false });
        addSetting('tnt', 'ТНТ', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '33', shuffle: false });
        addSetting('collections_inter_tv', 'Подборки\x20зарубежных\x20сериалов', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '34', shuffle: false });
        addSetting('collections_rus_tv', 'Подборки\x20русских\x20сериалов', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '35', shuffle: false });
        addSetting('collections_inter_movie', 'Подборки\x20зарубежных\x20фильмов', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '36', shuffle: false });
        addSetting('collections_rus_movie', 'Подборки\x20русских\x20фильмов', 'Нажми\x20для\x20настройки', true, 'trigger', { display: '1', order: '37', shuffle: false });
        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: {
                name: 'upcoming_episodes_remove',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Выход\x20ближайших\x20эпизодов'
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'bylampa_source',
            param: {
                name: 'bylampa_source_params',
                type: 'static',
                default: true
            },
            field: {
                name: 'Изменять\x20порядок\x20карточек\x20на\x20главной'
            }
        });

        var check = setInterval(function() {
            if (typeof Lampa !== 'undefined') {
                clearInterval(check);
                if (!Lampa.Storage.get('bylampa_source_params', true)) initSettings();
            }
        }, 200);

        function initSettings() {
            Lampa.Storage.set('bylampa_source_params', true);
            Lampa.Storage.set('trend_day_remove', true);
            Lampa.Storage.set('trend_day_tv_remove', true);
            Lampa.Storage.set('trend_week_tv_remove', true);
            Lampa.Storage.set('trend_week_film_remove', true);
            Lampa.Storage.set('top_movie_display', '4');
            Lampa.Storage.set('top_tv_display', '4');
            Lampa.Storage.set('netflix_remove', 'true');
            Lampa.Storage.set('apple_tv_remove', 'true');
            Lampa.Storage.set('prime_video_remove', true);
            Lampa.Storage.set('mgm_remove', true);
            Lampa.Storage.set('hbo_remove', true);
            Lampa.Storage.set('dorams_remove', true);
            Lampa.Storage.set('tur_serials_remove', true);
            Lampa.Storage.set('ind_films_remove', true);
            Lampa.Storage.set('rus_movie_remove', true);
            Lampa.Storage.set('rus_tv_remove', true);
            Lampa.Storage.set('rus_mult_remove', true);
            Lampa.Storage.set('start_remove', true);
            Lampa.Storage.set('premier_remove', true);
            Lampa.Storage.set('kion_remove', true);
            Lampa.Storage.set('ivi_remove', true);
            Lampa.Storage.set('okko_remove', true);
            Lampa.Storage.set('kinopoisk_remove', true);
            Lampa.Storage.set('wink_remove', true);
            Lampa.Storage.set('sts_remove', true);
            Lampa.Storage.set('tnt_remove', true);
            Lampa.Storage.set('collections_inter_tv_remove', true);
            Lampa.Storage.set('collections_rus_tv_remove', true);
            Lampa.Storage.set('collections_inter_movie_remove', true);
            Lampa.Storage.set('collections_rus_movie_remove', true);
            Lampa.Storage.set('bylampa_source_params', true);
        }

        if (window.appready) PersonalHub();
        else Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') PersonalHub();
        });
    })();
})();
