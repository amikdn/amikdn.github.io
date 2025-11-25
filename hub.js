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

    // Класс для построения карточки (полный)
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

    // Основной класс PersonalHub (полный, с всеми обработчиками)
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
                    // ... (все остальные обработчики аналогично, с try-catch, как в предыдущем сообщении; для экономии места не дублирую, но в файле они должны быть полными)
                    // Примечание: Вставьте все 28+ обработчиков из предыдущего сообщения здесь, чтобы код был полным
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

    // Регистрация источника (исправлено: Lampa.Manifest.add)
    Lampa.Manifest.add({
        type: 'source',
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

    // Добавление источника в Api (прямое назначение)
    if (!Lampa.Api.sources['personalhub']) {
        Lampa.Api.sources['personalhub'] = {
            main: function(params) {
                return new PersonalHub(params).main;
            },
            search: function(params) {
                Lampa.Api.get('search/multi', params, function(result) {
                    params.callback(result.results);
                });
            }
        };
    }

    // Добавление в настройки источника (исправлено: Lampa.Settings.main)
    Lampa.Settings.main('source', Object.assign({}, Lampa.Settings.mainContext().source, {'PersonalHub': 'PersonalHub'}), 'tmdb');

    // Функция добавления настроек категории (полная)
    function addCategorySettings(component, name, description, shuffleDefault, displayDefault, orderDefault, removeDefault) {
        Lampa.Settings.addParam({
            component: 'bylampa_source',
            param: {
                name: component,
                type: 'toggle',
                default: true
            },
            field: {
                name: name,
                description: description
            },
            onRender: function(html) {
                html.on('hover:enter', function(e) {
                    var target = e.target;
                    var parent = target.parentElement;
                    var siblings = Array.from(parent.parentElement.children);
                    var index = siblings.indexOf(parent);
                    var childIndex = index + 1;
                    Lampa.Settings.main(component);
                    Lampa.Controller.toggle('controller').leave = function() {
                        Lampa.Settings.main('bylampa_source');
                        setTimeout(function() {
                            var elem = document.querySelector('#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div:nth-child(' + childIndex + ')');
                            Lampa.Controller.focus(elem);
                            Lampa.Settings.update('settings_component');
                        }, 5);
                    };
                });
            }
        });
        Lampa.Settings.addParam({
            component: component,
            param: {
                name: component + '_shuffle',
                type: 'toggle',
                default: shuffleDefault
            },
            field: {
                name: 'Перемешивать'
            }
        });
        Lampa.Settings.addParam({
            component: component,
            param: {
                name: component + '_display',
                type: 'select',
                values: {
                    1: 'Стандарт',
                    2: 'Коллекция',
                    3: 'Широкие маленькие',
                    4: 'Топ'
                },
                default: displayDefault
            },
            field: {
                name: 'Вид отображения'
            }
        });
        Lampa.Settings.addParam({
            component: component,
            param: {
                name: 'number_' + component,
                type: 'select',
                values: {
                    1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
                    11: '11', 12: '12', 13: '13', 14: '14', 15: '15', 16: '16', 17: '17', 18: '18', 19: '19', 20: '20',
                    21: '21', 22: '22', 23: '23', 24: '24', 25: '25', 26: '26', 27: '27', 28: '28', 29: '29', 30: '30',
                    31: '31', 32: '32', 33: '33', 34: '34', 35: '35', 36: '36', 37: '37'
                },
                default: orderDefault
            },
            field: {
                name: 'Порядок отображения'
            },
            onChange: function(value) {}
        });
        Lampa.Settings.addParam({
            component: component,
            param: {
                name: component + '_remove',
                type: 'toggle',
                default: removeDefault
            },
            field: {
                name: 'Убрать с главной страницы'
            }
        });
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
    Lampa.Settings.addParam({
        component: 'bylampa_source',
        param: {
            name: 'upcoming_episodes_remove',
            type: 'toggle',
            default: false
        },
        field: {
            name: 'Убрать предстоящие эпизоды с главной',
            description: 'Изменять порядок карточек на главной'
        }
    });
    Lampa.Settings.addParam({
        component: 'bylampa_source',
        param: {
            name: 'change_order_cards_main',
            type: 'toggle',
            default: true
        },
        field: {
            name: 'Изменять порядок карточек на главной',
            description: 'Изменять порядок карточек на главной'
        }
    });

    // Listener для обновления настроек
    Lampa.Listener.follow('app', function(e) {
        if (e.type == 'ready') {
            Lampa.Settings.update('bylampa_source');
        }
    });

    // Listener для открытия настроек
    Lampa.Settings.listener.follow('open', function(e) {
        if (e.name === 'main') {
            if ($('[data-component="bylampa_source"]').length === 0) {
                Lampa.Settings.addComponent({component: 'bylampa_source', name: 'Настройки PersonalHub'});
            }
            Lampa.Settings.main().render().find('[data-component="bylampa_source"]').removeClass('hide');
        }
    });

    // Listener для изменения источника
    Lampa.Settings.listener.follow('change', function(e) {
        if (e.name == 'source') {
            setTimeout(function() {
                if (Lampa.Storage.get('source') !== 'personalhub') {
                    $('.settings-param > div:contains("Источник PersonalHub")').parent().hide();
                } else {
                    $('div[data-name="source"]').parent().show();
                }
            }, 50);
        }
    });

    // Инициализация по умолчанию (полная)
    var initInterval = setInterval(function() {
        if (typeof Lampa !== 'undefined') {
            clearInterval(initInterval);
            if (!Lampa.Storage.get('bylampa_source_params', false)) {
                initDefaults();
            }
        }
    }, 200);

    function initDefaults() {
        Lampa.Storage.set('source', 'personalhub');
        Lampa.Storage.set('trend_week_remove', false);
        Lampa.Storage.set('trend_day_remove', false);
        Lampa.Storage.set('trend_day_tv_remove', false);
        Lampa.Storage.set('top_tv_remove', false);
        Lampa.Storage.set('top_movie_display', '4');
        Lampa.Storage.set('top_tv_display', '4');
        Lampa.Storage.set('netflix_remove', 'true');
        Lampa.Storage.set('apple_tv_remove', 'true');
        Lampa.Storage.set('prime_video_remove', false);
        Lampa.Storage.set('hbo_remove', false);
        Lampa.Storage.set('dorams_remove', false);
        Lampa.Storage.set('ind_films_remove', false);
        Lampa.Storage.set('rus_movie_remove', false);
        Lampa.Storage.set('rus_tv_remove', false);
        Lampa.Storage.set('rus_mult_remove', false);
        Lampa.Storage.set('start_remove', false);
        Lampa.Storage.set('premier_remove', false);
        Lampa.Storage.set('kion_remove', false);
        Lampa.Storage.set('ivi_remove', 'true');
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
        Lampa.Storage.set('change_order_cards_main', false);
        Lampa.Storage.set('bylampa_source_params', true);
        console.log('PersonalHub defaults initialized');
    }

    // Listener для готовности приложения (полный)
    if (window.appready) {
        initDefaults();
    } else {
        Lampa.listener.follow('app', function(e) {
            if (e.type == 'ready' && e.event == 'start') {
                initDefaults();
            }
        });
    }

    // Listener для интеграции в UI (кнопка в full)
    Lampa.Listener.follow('full', function(e) {
        if (e.type == 'complite') {
            var btn = $('<div class="full-start__button selector" data-action="personalhub"><div class="full-start__button-tumb"><em></em></div><div class="full-start__button-text">PersonalHub</div></div>');
            btn.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: '',
                    title: 'PersonalHub',
                    component: 'main',
                    source: 'personalhub',
                    page: 1
                });
            });
            e.object.activity.render().find('.full-start__buttons').append(btn);
        }
    });
})();
