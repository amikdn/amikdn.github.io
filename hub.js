
(function () {
    'use strict'
    Lampa.Platform.tv();
    (function () {
        var _0x3d1659 = (function () {
                var _0x324be1 = true
                return function (_0x539b99, _0x1fef9e) {
                    var _0x4323f9 = _0x324be1 ?
                        function () {
                            if (_0x1fef9e) {
                                var _0x1a63a9 = _0x1fef9e.apply(_0x539b99, arguments)
                                return (_0x1fef9e = null), _0x1a63a9
                            }
                        } :
                        function () {}
                    return (_0x324be1 = true), _0x4323f9
                }
            })(),
            _0x4f397f = (function () {
                var _0x671bbb = true
                return function (_0x11591a, _0x4252c7) {
                    var _0x43402c = _0x671bbb ?
                        function () {
                            if (_0x4252c7) {
                                var _0x1bf35b = _0x4252c7.apply(_0x11591a, arguments)
                                return (_0x4252c7 = null), _0x1bf35b
                            }
                        } :
                        function () {}
                    return (_0x671bbb = true), _0x43402c
                }
            })();
        ('use strict')
        function _0x559ec2() {
            var _0x175cd0 = function (_0x2d965e) {
                    var _0x287088 = _0x2d965e.card || _0x2d965e,
                        _0x17f5e9 = _0x2d965e.next_episode_to_air || _0x2d965e.episode || {}
                    if (_0x287088.source == undefined) {
                        _0x287088.source = 'tmdb'
                    }
                    Lampa.Arrays.extend(_0x287088, {
                        title: _0x287088.name,
                        original_title: _0x287088.original_name,
                        release_date: _0x287088.first_air_date,
                    })
                    _0x287088.release_year = (
                        (_0x287088.release_date || '0000') + ''
                    ).slice(0, 4)
                    function _0x5294fa(_0x109ea4) {
                        if (_0x109ea4) {
                            _0x109ea4.remove()
                        }
                    }
                    this.build = function () {
                        this.card = Lampa.Template.js('card_episode')
                        this.img_poster = this.card.querySelector('.card__img') || {}
                        this.img_episode =
                            this.card.querySelector('.full-episode__img img') || {}
                        this.card.querySelector('.card__title').innerText = _0x287088.title
                        this.card.querySelector('.full-episode__num').innerText =
                            _0x287088.unwatched || ''
                        _0x17f5e9 &&
                            _0x17f5e9.air_date &&
                            ((this.card.querySelector('.full-episode__name').innerText =
                                    _0x17f5e9.name || Lang.translate('noname')),
                                (this.card.querySelector('.full-episode__num').innerText =
                                    _0x17f5e9.episode_number || ''),
                                (this.card.querySelector('.full-episode__date').innerText =
                                    _0x17f5e9.air_date ?
                                    Lampa.Utils.parseTime(_0x17f5e9.air_date).full :
                                    '----'))
                        _0x287088.release_year == '0000' ?
                            _0x5294fa(this.card.querySelector('.card__age')) :
                            (this.card.querySelector('.card__age').innerText =
                                _0x287088.release_year)
                        this.card.addEventListener('visible', this.visible.bind(this))
                    }
                    this.image = function () {
                        var _0x246912 = this
                        this.img_poster.onload = function () {}
                        this.img_poster.onerror = function () {
                            _0x246912.img_poster.src = './img/img_broken.svg'
                        }
                        this.img_episode.onload = function () {
                            _0x246912.card
                                .querySelector('.full-episode__img')
                                .classList.add('full-episode__img--loaded')
                        }
                        this.img_episode.onerror = function () {
                            _0x246912.img_episode.src = './img/img_broken.svg'
                        }
                    }
                    this.create = function () {
                        var _0x4c97b6 = this
                        this.build()
                        this.card.addEventListener('hover:focus', function () {
                            if (_0x4c97b6.onFocus) {
                                _0x4c97b6.onFocus(_0x4c97b6.card, _0x287088)
                            }
                        })
                        this.card.addEventListener('hover:hover', function () {
                            if (_0x4c97b6.onHover) {
                                _0x4c97b6.onHover(_0x4c97b6.card, _0x287088)
                            }
                        })
                        this.card.addEventListener('hover:enter', function () {
                            if (_0x4c97b6.onEnter) {
                                _0x4c97b6.onEnter(_0x4c97b6.card, _0x287088)
                            }
                        })
                        this.image()
                    }
                    this.visible = function () {
                        if (_0x287088.poster_path) {
                            this.img_poster.src = Lampa.Api.img(_0x287088.poster_path)
                        } else {
                            if (_0x287088.profile_path) {
                                this.img_poster.src = Lampa.Api.img(_0x287088.profile_path)
                            } else {
                                if (_0x287088.poster) {
                                    this.img_poster.src = _0x287088.poster
                                } else {
                                    if (_0x287088.img) {
                                        this.img_poster.src = _0x287088.img
                                    } else {
                                        this.img_poster.src = './img/img_broken.svg'
                                    }
                                }
                            }
                        }
                        if (_0x287088.still_path) {
                            this.img_episode.src = Lampa.Api.img(_0x17f5e9.still_path, 'w300')
                        } else {
                            if (_0x287088.backdrop_path) {
                                this.img_episode.src = Lampa.Api.img(
                                    _0x287088.backdrop_path,
                                    'w300'
                                )
                            } else {
                                if (_0x17f5e9.img) {
                                    this.img_episode.src = _0x17f5e9.img
                                } else {
                                    if (_0x287088.img) {
                                        this.img_episode.src = _0x287088.img
                                    } else {
                                        this.img_episode.src = './img/img_broken.svg'
                                    }
                                }
                            }
                        }
                        if (this.onVisible) {
                            this.onVisible(this.card, _0x287088)
                        }
                    }
                    this.destroy = function () {
                        this.img_poster.onerror = function () {}
                        this.img_poster.onload = function () {}
                        this.img_episode.onerror = function () {}
                        this.img_episode.onload = function () {}
                        this.img_poster.src = ''
                        this.img_episode.src = ''
                        _0x5294fa(this.card)
                        this.card = null
                        this.img_poster = null
                        this.img_episode = null
                    }
                    this.render = function (_0x4fd9cc) {
                        return _0x4fd9cc ? this.card : $(this.card)
                    }
                },
                _0x35171b = function (_0x2719a3) {
                    this.network = new Lampa.Reguest()
                    this.discovery = true
                    this.main = function () {
                        var _0x35b9a9 = this,
                            _0x4d6097 =
                            arguments.length > 0 && arguments[0] !== undefined ?
                            arguments[0] : {},
                            _0x29b254 = arguments.length > 1 ? arguments[1] : undefined,
                            _0x652bd2 = arguments.length > 2 ? arguments[2] : undefined,
                            _0x31a0df = [{
                                    id: 'now_watch',
                                    order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1,
                                    active: !Lampa.Storage.get('now_watch_remove'),
                                },
                                {
                                    id: 'upcoming_episodes',
                                    order: 2,
                                    active: !Lampa.Storage.get('upcoming_episodes_remove'),
                                },
                                {
                                    id: 'trend_day',
                                    order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3,
                                    active: !Lampa.Storage.get('trend_day_remove'),
                                },
                                {
                                    id: 'trend_day_tv',
                                    order: parseInt(Lampa.Storage.get('number_trend_day_tv'), 10) || 4,
                                    active: !Lampa.Storage.get('trend_day_tv_remove'),
                                },
                                {
                                    id: 'trend_day_film',
                                    order: parseInt(Lampa.Storage.get('number_trend_day_film'), 10) ||
                                        5,
                                    active: !Lampa.Storage.get('trend_day_film_remove'),
                                },
                                {
                                    id: 'trend_week',
                                    order: parseInt(Lampa.Storage.get('number_trend_week'), 10) || 6,
                                    active: !Lampa.Storage.get('trend_week_remove'),
                                },
                                {
                                    id: 'trend_week_tv',
                                    order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) ||
                                        7,
                                    active: !Lampa.Storage.get('trend_week_tv_remove'),
                                },
                                {
                                    id: 'trend_week_film',
                                    order: parseInt(Lampa.Storage.get('number_trend_week_film'), 10) ||
                                        8,
                                    active: !Lampa.Storage.get('trend_week_film_remove'),
                                },
                                {
                                    id: 'upcoming',
                                    order: parseInt(Lampa.Storage.get('number_upcoming'), 10) || 9,
                                    active: !Lampa.Storage.get('upcoming_remove'),
                                },
                                {
                                    id: 'popular_movie',
                                    order: parseInt(Lampa.Storage.get('number_popular_movie'), 10) ||
                                        10,
                                    active: !Lampa.Storage.get('popular_movie_remove'),
                                },
                                {
                                    id: 'popular_tv',
                                    order: parseInt(Lampa.Storage.get('number_popular_tv'), 10) || 11,
                                    active: !Lampa.Storage.get('popular_tv_remove'),
                                },
                                {
                                    id: 'top_movie',
                                    order: parseInt(Lampa.Storage.get('number_top_movie'), 10) || 12,
                                    active: !Lampa.Storage.get('top_movie_remove'),
                                },
                                {
                                    id: 'top_tv',
                                    order: parseInt(Lampa.Storage.get('number_top_tv'), 10) || 13,
                                    active: !Lampa.Storage.get('top_tv_remove'),
                                },
                                {
                                    id: 'netflix',
                                    order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14,
                                    active: !Lampa.Storage.get('netflix_remove'),
                                },
                                {
                                    id: 'apple_tv',
                                    order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15,
                                    active: !Lampa.Storage.get('apple_tv_remove'),
                                },
                                {
                                    id: 'prime_video',
                                    order: parseInt(Lampa.Storage.get('number_prime_video'), 10) || 16,
                                    active: !Lampa.Storage.get('prime_video_remove'),
                                },
                                {
                                    id: 'mgm',
                                    order: parseInt(Lampa.Storage.get('number_mgm'), 10) || 17,
                                    active: !Lampa.Storage.get('mgm_remove'),
                                },
                                {
                                    id: 'hbo',
                                    order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 18,
                                    active: !Lampa.Storage.get('hbo_remove'),
                                },
                                {
                                    id: 'dorams',
                                    order: parseInt(Lampa.Storage.get('number_dorams'), 10) || 19,
                                    active: !Lampa.Storage.get('dorams_remove'),
                                },
                                {
                                    id: 'tur_serials',
                                    order: parseInt(Lampa.Storage.get('number_tur_serials'), 10) || 20,
                                    active: !Lampa.Storage.get('tur_serials_remove'),
                                },
                                {
                                    id: 'ind_films',
                                    order: parseInt(Lampa.Storage.get('number_ind_films'), 10) || 21,
                                    active: !Lampa.Storage.get('ind_films_remove'),
                                },
                                {
                                    id: 'rus_movie',
                                    order: parseInt(Lampa.Storage.get('number_rus_movie'), 10) || 22,
                                    active: !Lampa.Storage.get('rus_movie_remove'),
                                },
                                {
                                    id: 'rus_tv',
                                    order: parseInt(Lampa.Storage.get('number_rus_tv'), 10) || 23,
                                    active: !Lampa.Storage.get('rus_tv_remove'),
                                },
                                {
                                    id: 'rus_mult',
                                    order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24,
                                    active: !Lampa.Storage.get('rus_mult_remove'),
                                },
                                {
                                    id: 'start',
                                    order: parseInt(Lampa.Storage.get('number_start'), 10) || 25,
                                    active: !Lampa.Storage.get('start_remove'),
                                },
                                {
                                    id: 'premier',
                                    order: parseInt(Lampa.Storage.get('number_premier'), 10) || 26,
                                    active: !Lampa.Storage.get('premier_remove'),
                                },
                                {
                                    id: 'kion',
                                    order: parseInt(Lampa.Storage.get('number_kion'), 10) || 27,
                                    active: !Lampa.Storage.get('kion_remove'),
                                },
                                {
                                    id: 'ivi',
                                    order: parseInt(Lampa.Storage.get('number_ivi'), 10) || 28,
                                    active: !Lampa.Storage.get('ivi_remove'),
                                },
                                {
                                    id: 'okko',
                                    order: parseInt(Lampa.Storage.get('number_okko'), 10) || 29,
                                    active: !Lampa.Storage.get('okko_remove'),
                                },
                                {
                                    id: 'kinopoisk',
                                    order: parseInt(Lampa.Storage.get('number_kinopoisk'), 10) || 30,
                                    active: !Lampa.Storage.get('kinopoisk_remove'),
                                },
                                {
                                    id: 'wink',
                                    order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31,
                                    active: !Lampa.Storage.get('wink_remove'),
                                },
                                {
                                    id: 'sts',
                                    order: parseInt(Lampa.Storage.get('number_sts'), 10) || 32,
                                    active: !Lampa.Storage.get('sts_remove'),
                                },
                                {
                                    id: 'tnt',
                                    order: parseInt(Lampa.Storage.get('number_tnt'), 10) || 33,
                                    active: !Lampa.Storage.get('tnt_remove'),
                                },
                                {
                                    id: 'collections_inter_tv',
                                    order: parseInt(
                                        Lampa.Storage.get('number_collections_inter_tv'),
                                        10
                                    ) || 34,
                                    active: !Lampa.Storage.get('collections_inter_tv_remove'),
                                },
                                {
                                    id: 'collections_rus_tv',
                                    order: parseInt(
                                        Lampa.Storage.get('number_collections_rus_tv'),
                                        10
                                    ) || 35,
                                    active: !Lampa.Storage.get('collections_rus_tv_remove'),
                                },
                                {
                                    id: 'collections_inter_movie',
                                    order: parseInt(
                                        Lampa.Storage.get('number_collections_inter_movie'),
                                        10
                                    ) || 36,
                                    active: !Lampa.Storage.get('collections_inter_movie_remove'),
                                },
                                {
                                    id: 'collections_rus_movie',
                                    order: parseInt(
                                        Lampa.Storage.get('number_collections_rus_movie'),
                                        10
                                    ) || 37,
                                    active: !Lampa.Storage.get('collections_rus_movie_remove'),
                                },
                            ],
                            _0x430e36 = []
                        function _0x32641f(_0x315295) {
                            for (
                                var _0x20042f = _0x315295.length - 1; _0x20042f > 0; _0x20042f--
                            ) {
                                var _0x21806d = Math.floor(Math.random() * (_0x20042f + 1)),
                                    _0x26f58e = _0x315295[_0x20042f]
                                _0x315295[_0x20042f] = _0x315295[_0x21806d]
                                _0x315295[_0x21806d] = _0x26f58e
                            }
                        }
                        var _0x3c9a4e = [{
                                    start: 2023,
                                    end: 2025,
                                },
                                {
                                    start: 2020,
                                    end: 2022,
                                },
                                {
                                    start: 2017,
                                    end: 2019,
                                },
                                {
                                    start: 2014,
                                    end: 2016,
                                },
                                {
                                    start: 2011,
                                    end: 2013,
                                },
                            ],
                            _0x23c0e2 =
                            _0x3c9a4e[Math.floor(Math.random() * _0x3c9a4e.length)],
                            _0x4286e1 = _0x23c0e2.start + '-01-01',
                            _0x2e9161 = _0x23c0e2.end + '-12-31',
                            _0x4098a9 =
                            _0x3c9a4e[Math.floor(Math.random() * _0x3c9a4e.length)],
                            _0xad85fd = _0x4098a9.start + '-01-01',
                            _0x327e18 = _0x4098a9.end + '-12-31',
                            _0x34e9d8 = [
                                'vote_count.desc',
                                'popularity.desc',
                                'revenue.desc',
                            ],
                            _0x483e39 = Math.floor(Math.random() * _0x34e9d8.length),
                            _0x59d435 = _0x34e9d8[_0x483e39],
                            _0x20e36a = [
                                'vote_count.desc',
                                'popularity.desc',
                                'revenue.desc',
                            ],
                            _0x4b1744 = Math.floor(Math.random() * _0x20e36a.length),
                            _0x1eec27 = _0x20e36a[_0x4b1744],
                            _0x8b9af7 = new Date().toISOString().substr(0, 10),
                            _0x495bd6 = new Date(_0x8b9af7)
                        _0x495bd6.setMonth(_0x495bd6.getMonth() - 1)
                        var _0x213a14 = _0x495bd6.toISOString().substr(0, 10)
                        function _0x41d373(_0x487474, _0x36ea97) {
                            var _0x347081 = {
                                    now_watch: function (_0xcd2bdd) {
                                        _0x35b9a9.get(
                                            'movie/now_playing',
                                            _0x4d6097,
                                            function (_0x35ef48) {
                                                _0x35ef48.title =
                                                    Lampa.Lang.translate('title_now_watch')
                                                Lampa.Storage.get('now_watch_display') == '2' &&
                                                    ((_0x35ef48.collection = true),
                                                        (_0x35ef48.line_type = 'collection'))
                                                Lampa.Storage.get('now_watch_display') == '3' &&
                                                    ((_0x35ef48.small = true),
                                                        (_0x35ef48.wide = true),
                                                        _0x35ef48.results.forEach(function (_0x3333d7) {
                                                            _0x3333d7.promo = _0x3333d7.overview
                                                            _0x3333d7.promo_title =
                                                                _0x3333d7.title || _0x3333d7.name
                                                        }))
                                                Lampa.Storage.get('now_watch_display') == '4' &&
                                                    (_0x35ef48.line_type = 'top')
                                                Lampa.Storage.get('now_watch_shuffle') == true &&
                                                    _0x32641f(_0x35ef48.results)
                                                _0xcd2bdd(_0x35ef48)
                                            },
                                            _0xcd2bdd
                                        )
                                    },
                                    upcoming_episodes: function (_0xa7095b) {
                                        _0xa7095b({
                                            source: 'tmdb',
                                            results: Lampa.TimeTable.lately().slice(0, 20),
                                            title: Lampa.Lang.translate('title_upcoming_episodes'),
                                            nomore: true,
                                            cardClass: function _0x1367f8(_0x2b4a83, _0x26ea2c) {
                                                return new _0x175cd0(_0x2b4a83, _0x26ea2c)
                                            },
                                        })
                                    },
                                    trend_day: function (_0x2628e8) {
                                        _0x35b9a9.get(
                                            'trending/all/day',
                                            _0x4d6097,
                                            function (_0x381ff7) {
                                                _0x381ff7.title =
                                                    Lampa.Lang.translate('title_trend_day')
                                                Lampa.Storage.get('trend_day_display') == '2' &&
                                                    ((_0x381ff7.collection = true),
                                                        (_0x381ff7.line_type = 'collection'))
                                                Lampa.Storage.get('trend_day_display') == '3' &&
                                                    ((_0x381ff7.small = true),
                                                        (_0x381ff7.wide = true),
                                                        _0x381ff7.results.forEach(function (_0x2b0bb2) {
                                                            _0x2b0bb2.promo = _0x2b0bb2.overview
                                                            _0x2b0bb2.promo_title =
                                                                _0x2b0bb2.title || _0x2b0bb2.name
                                                        }))
                                                Lampa.Storage.get('trend_day_display') == '4' &&
                                                    (_0x381ff7.line_type = 'top')
                                                Lampa.Storage.get('trend_day_shuffle') == true &&
                                                    _0x32641f(_0x381ff7.results)
                                                _0x2628e8(_0x381ff7)
                                            },
                                            _0x2628e8
                                        )
                                    },
                                    trend_day_tv: function (_0x3d1a7d) {
                                        _0x35b9a9.get(
                                            'trending/tv/day',
                                            _0x4d6097,
                                            function (_0x295943) {
                                                _0x295943.title = Lampa.Lang.translate(
                                                    'Сегодня в тренде (сериалы)'
                                                )
                                                Lampa.Storage.get('trend_day_tv_display') == '2' &&
                                                    ((_0x295943.collection = true),
                                                        (_0x295943.line_type = 'collection'))
                                                Lampa.Storage.get('trend_day_tv_display') == '3' &&
                                                    ((_0x295943.small = true),
                                                        (_0x295943.wide = true),
                                                        _0x295943.results.forEach(function (_0xb944a3) {
                                                            _0xb944a3.promo = _0xb944a3.overview
                                                            _0xb944a3.promo_title =
                                                                _0xb944a3.title || _0xb944a3.name
                                                        }))
                                                Lampa.Storage.get('trend_day_tv_display') == '4' &&
                                                    (_0x295943.line_type = 'top')
                                                Lampa.Storage.get('trend_day_tv_shuffle') == true &&
                                                    _0x32641f(_0x295943.results)
                                                _0x3d1a7d(_0x295943)
                                            },
                                            _0x3d1a7d
                                        )
                                    },
                                    trend_day_film: function (_0x1a4351) {
                                        _0x35b9a9.get(
                                            'trending/movie/day',
                                            _0x4d6097,
                                            function (_0x431f21) {
                                                _0x431f21.title = Lampa.Lang.translate(
                                                    'Сегодня в тренде (фильмы)'
                                                )
                                                Lampa.Storage.get('trend_day_film_display') == '2' &&
                                                    ((_0x431f21.collection = true),
                                                        (_0x431f21.line_type = 'collection'))
                                                Lampa.Storage.get('trend_day_film_display') == '3' &&
                                                    ((_0x431f21.small = true),
                                                        (_0x431f21.wide = true),
                                                        _0x431f21.results.forEach(function (_0x18a32f) {
                                                            _0x18a32f.promo = _0x18a32f.overview
                                                            _0x18a32f.promo_title =
                                                                _0x18a32f.title || _0x18a32f.name
                                                        }))
                                                Lampa.Storage.get('trend_day_film_display') == '4' &&
                                                    (_0x431f21.line_type = 'top')
                                                Lampa.Storage.get('trend_day_film_shuffle') == true &&
                                                    _0x32641f(_0x431f21.results)
                                                _0x1a4351(_0x431f21)
                                            },
                                            _0x1a4351
                                        )
                                    },
                                    trend_week: function (_0x5d60ee) {
                                        _0x35b9a9.get(
                                            'trending/all/week',
                                            _0x4d6097,
                                            function (_0x4db6bc) {
                                                _0x4db6bc.title =
                                                    Lampa.Lang.translate('title_trend_week')
                                                Lampa.Storage.get('trend_week_display') == '2' &&
                                                    ((_0x4db6bc.collection = true),
                                                        (_0x4db6bc.line_type = 'collection'))
                                                Lampa.Storage.get('trend_week_display') == '3' &&
                                                    ((_0x4db6bc.small = true),
                                                        (_0x4db6bc.wide = true),
                                                        _0x4db6bc.results.forEach(function (_0x286140) {
                                                            _0x286140.promo = _0x286140.overview
                                                            _0x286140.promo_title =
                                                                _0x286140.title || _0x286140.name
                                                        }))
                                                Lampa.Storage.get('trend_week_display') == '4' &&
                                                    (_0x4db6bc.line_type = 'top')
                                                Lampa.Storage.get('trend_week_shuffle') == true &&
                                                    _0x32641f(_0x4db6bc.results)
                                                _0x5d60ee(_0x4db6bc)
                                            },
                                            _0x5d60ee
                                        )
                                    },
                                    trend_week_tv: function (_0x50b0a2) {
                                        _0x35b9a9.get(
                                            'trending/tv/week',
                                            _0x4d6097,
                                            function (_0xc090b) {
                                                _0xc090b.title = Lampa.Lang.translate(
                                                    'В тренде за неделю (сериалы)'
                                                )
                                                Lampa.Storage.get('trend_week_tv_display') == '2' &&
                                                    ((_0xc090b.collection = true),
                                                        (_0xc090b.line_type = 'collection'))
                                                Lampa.Storage.get('trend_week_tv_display') == '3' &&
                                                    ((_0xc090b.small = true),
                                                        (_0xc090b.wide = true),
                                                        _0xc090b.results.forEach(function (_0x363495) {
                                                            _0x363495.promo = _0x363495.overview
                                                            _0x363495.promo_title =
                                                                _0x363495.title || _0x363495.name
                                                        }))
                                                Lampa.Storage.get('trend_week_tv_display') == '4' &&
                                                    (_0xc090b.line_type = 'top')
                                                Lampa.Storage.get('trend_week_tv_shuffle') == true &&
                                                    _0x32641f(_0xc090b.results)
                                                _0x50b0a2(_0xc090b)
                                            },
                                            _0x50b0a2
                                        )
                                    },
                                    trend_week_film: function (_0x33d26c) {
                                        _0x35b9a9.get(
                                            'trending/movie/week',
                                            _0x4d6097,
                                            function (_0x4a67f8) {
                                                _0x4a67f8.title = Lampa.Lang.translate(
                                                    'В тренде за неделю (фильмы)'
                                                )
                                                Lampa.Storage.get('trend_week_film_display') == '2' &&
                                                    ((_0x4a67f8.collection = true),
                                                        (_0x4a67f8.line_type = 'collection'))
                                                Lampa.Storage.get('trend_week_film_display') == '3' &&
                                                    ((_0x4a67f8.small = true),
                                                        (_0x4a67f8.wide = true),
                                                        _0x4a67f8.results.forEach(function (_0x2d6505) {
                                                            _0x2d6505.promo = _0x2d6505.overview
                                                            _0x2d6505.promo_title =
                                                                _0x2d6505.title || _0x2d6505.name
                                                        }))
                                                Lampa.Storage.get('trend_week_film_display') == '4' &&
                                                    (_0x4a67f8.line_type = 'top')
                                                Lampa.Storage.get('trend_week_film_shuffle') == true &&
                                                    _0x32641f(_0x4a67f8.results)
                                                _0x33d26c(_0x4a67f8)
                                            },
                                            _0x33d26c
                                        )
                                    },
                                    upcoming: function (_0x58d175) {
                                        _0x35b9a9.get(
                                            'movie/upcoming',
                                            _0x4d6097,
                                            function (_0x5e0652) {
                                                _0x5e0652.title = Lampa.Lang.translate('title_upcoming')
                                                Lampa.Storage.get('upcoming_display') == '2' &&
                                                    ((_0x5e0652.collection = true),
                                                        (_0x5e0652.line_type = 'collection'))
                                                Lampa.Storage.get('upcoming_display') == '3' &&
                                                    ((_0x5e0652.small = true),
                                                        (_0x5e0652.wide = true),
                                                        _0x5e0652.results.forEach(function (_0x186126) {
                                                            _0x186126.promo = _0x186126.overview
                                                            _0x186126.promo_title =
                                                                _0x186126.title || _0x186126.name
                                                        }))
                                                Lampa.Storage.get('upcoming_display') == '4' &&
                                                    (_0x5e0652.line_type = 'top')
                                                Lampa.Storage.get('upcoming_shuffle') == true &&
                                                    _0x32641f(_0x5e0652.results)
                                                _0x58d175(_0x5e0652)
                                            },
                                            _0x58d175
                                        )
                                    },
                                    popular_movie: function (_0x28f884) {
                                        _0x35b9a9.get(
                                            'movie/popular',
                                            _0x4d6097,
                                            function (_0x4d63df) {
                                                _0x4d63df.title = Lampa.Lang.translate(
                                                    'title_popular_movie'
                                                )
                                                Lampa.Storage.get('popular_movie_display') == '2' &&
                                                    ((_0x4d63df.collection = true),
                                                        (_0x4d63df.line_type = 'collection'))
                                                Lampa.Storage.get('popular_movie_display') == '3' &&
                                                    ((_0x4d63df.small = true),
                                                        (_0x4d63df.wide = true),
                                                        _0x4d63df.results.forEach(function (_0x5c5da2) {
                                                            _0x5c5da2.promo = _0x5c5da2.overview
                                                            _0x5c5da2.promo_title =
                                                                _0x5c5da2.title || _0x5c5da2.name
                                                        }))
                                                Lampa.Storage.get('popular_movie_display') == '4' &&
                                                    (_0x4d63df.line_type = 'top')
                                                Lampa.Storage.get('popular_movie_shuffle') == true &&
                                                    _0x32641f(_0x4d63df.results)
                                                _0x28f884(_0x4d63df)
                                            },
                                            _0x28f884
                                        )
                                    },
                                    popular_tv: function (_0x51d294) {
                                        _0x35b9a9.get(
                                            'trending/tv/week',
                                            _0x4d6097,
                                            function (_0x2afefb) {
                                                _0x2afefb.title =
                                                    Lampa.Lang.translate('title_popular_tv')
                                                Lampa.Storage.get('popular_tv_display') == '2' &&
                                                    ((_0x2afefb.collection = true),
                                                        (_0x2afefb.line_type = 'collection'))
                                                Lampa.Storage.get('popular_tv_display') == '3' &&
                                                    ((_0x2afefb.small = true),
                                                        (_0x2afefb.wide = true),
                                                        _0x2afefb.results.forEach(function (_0x12dd2d) {
                                                            _0x12dd2d.promo = _0x12dd2d.overview
                                                            _0x12dd2d.promo_title =
                                                                _0x12dd2d.title || _0x12dd2d.name
                                                        }))
                                                Lampa.Storage.get('popular_tv_display') == '4' &&
                                                    (_0x2afefb.line_type = 'top')
                                                Lampa.Storage.get('popular_tv_shuffle') == true &&
                                                    _0x32641f(_0x2afefb.results)
                                                _0x51d294(_0x2afefb)
                                            },
                                            _0x51d294
                                        )
                                    },
                                    top_movie: function (_0x4beb46) {
                                        _0x35b9a9.get(
                                            'movie/top_rated',
                                            _0x4d6097,
                                            function (_0x2eb24b) {
                                                _0x2eb24b.title =
                                                    Lampa.Lang.translate('title_top_movie')
                                                Lampa.Storage.get('top_movie_display') == '2' &&
                                                    ((_0x2eb24b.collection = true),
                                                        (_0x2eb24b.line_type = 'collection'))
                                                Lampa.Storage.get('top_movie_display') == '3' &&
                                                    ((_0x2eb24b.small = true),
                                                        (_0x2eb24b.wide = true),
                                                        _0x2eb24b.results.forEach(function (_0x183c7c) {
                                                            _0x183c7c.promo = _0x183c7c.overview
                                                            _0x183c7c.promo_title =
                                                                _0x183c7c.title || _0x183c7c.name
                                                        }))
                                                Lampa.Storage.get('top_movie_display') == '4' &&
                                                    (_0x2eb24b.line_type = 'top')
                                                Lampa.Storage.get('top_movie_shuffle') == true &&
                                                    _0x32641f(_0x2eb24b.results)
                                                _0x4beb46(_0x2eb24b)
                                            },
                                            _0x4beb46
                                        )
                                    },
                                    top_tv: function (_0x13464e) {
                                        _0x35b9a9.get(
                                            'tv/top_rated',
                                            _0x4d6097,
                                            function (_0xd37f46) {
                                                _0xd37f46.title = Lampa.Lang.translate('title_top_tv')
                                                Lampa.Storage.get('top_tv_display') == '2' &&
                                                    ((_0xd37f46.collection = true),
                                                        (_0xd37f46.line_type = 'collection'))
                                                Lampa.Storage.get('top_tv_display') == '3' &&
                                                    ((_0xd37f46.small = true),
                                                        (_0xd37f46.wide = true),
                                                        _0xd37f46.results.forEach(function (_0x111dd7) {
                                                            _0x111dd7.promo = _0x111dd7.overview
                                                            _0x111dd7.promo_title =
                                                                _0x111dd7.title || _0x111dd7.name
                                                        }))
                                                Lampa.Storage.get('top_tv_display') == '4' &&
                                                    (_0xd37f46.line_type = 'top')
                                                Lampa.Storage.get('top_tv_shuffle') == true &&
                                                    _0x32641f(_0xd37f46.results)
                                                _0x13464e(_0xd37f46)
                                            },
                                            _0x13464e
                                        )
                                    },
                                    netflix: function (_0x5862d6) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=213&first_air_date.gte=2018&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x4d985d) {
                                                _0x4d985d.title = Lampa.Lang.translate('Netflix')
                                                Lampa.Storage.get('netflix_display') == '2' &&
                                                    ((_0x4d985d.collection = true),
                                                        (_0x4d985d.line_type = 'collection'))
                                                Lampa.Storage.get('netflix_display') == '3' &&
                                                    ((_0x4d985d.small = true),
                                                        (_0x4d985d.wide = true),
                                                        _0x4d985d.results.forEach(function (_0x5dd34b) {
                                                            _0x5dd34b.promo = _0x5dd34b.overview
                                                            _0x5dd34b.promo_title =
                                                                _0x5dd34b.title || _0x5dd34b.name
                                                        }))
                                                Lampa.Storage.get('netflix_display') == '4' &&
                                                    (_0x4d985d.line_type = 'top')
                                                Lampa.Storage.get('netflix_shuffle') == true &&
                                                    _0x32641f(_0x4d985d.results)
                                                _0x5862d6(_0x4d985d)
                                            },
                                            _0x5862d6
                                        )
                                    },
                                    apple_tv: function (_0x225bd5) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=2552&first_air_date.gte=2018&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x162bee) {
                                                _0x162bee.title = Lampa.Lang.translate('Apple TV+')
                                                Lampa.Storage.get('apple_tv_display') == '2' &&
                                                    ((_0x162bee.collection = true),
                                                        (_0x162bee.line_type = 'collection'))
                                                Lampa.Storage.get('apple_tv_display') == '3' &&
                                                    ((_0x162bee.small = true),
                                                        (_0x162bee.wide = true),
                                                        _0x162bee.results.forEach(function (_0x3c471a) {
                                                            _0x3c471a.promo = _0x3c471a.overview
                                                            _0x3c471a.promo_title =
                                                                _0x3c471a.title || _0x3c471a.name
                                                        }))
                                                Lampa.Storage.get('apple_tv_display') == '4' &&
                                                    (_0x162bee.line_type = 'top')
                                                Lampa.Storage.get('apple_tv_shuffle') == true &&
                                                    _0x32641f(_0x162bee.results)
                                                _0x225bd5(_0x162bee)
                                            },
                                            _0x225bd5
                                        )
                                    },
                                    prime_video: function (_0x9c5322) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=1024&first_air_date.gte=2018&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x35f4d0) {
                                                _0x35f4d0.title = Lampa.Lang.translate('Prime Video')
                                                Lampa.Storage.get('prime_video_display') == '2' &&
                                                    ((_0x35f4d0.collection = true),
                                                        (_0x35f4d0.line_type = 'collection'))
                                                Lampa.Storage.get('prime_video_display') == '3' &&
                                                    ((_0x35f4d0.small = true),
                                                        (_0x35f4d0.wide = true),
                                                        _0x35f4d0.results.forEach(function (_0xdb3b37) {
                                                            _0xdb3b37.promo = _0xdb3b37.overview
                                                            _0xdb3b37.promo_title =
                                                                _0xdb3b37.title || _0xdb3b37.name
                                                        }))
                                                Lampa.Storage.get('prime_video_display') == '4' &&
                                                    (_0x35f4d0.line_type = 'top')
                                                Lampa.Storage.get('prime_video_shuffle') == true &&
                                                    _0x32641f(_0x35f4d0.results)
                                                _0x9c5322(_0x35f4d0)
                                            },
                                            _0x9c5322
                                        )
                                    },
                                    mgm: function (_0x6321b1) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=6219&first_air_date.gte=2018&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0xde6cd7) {
                                                _0xde6cd7.title = Lampa.Lang.translate('MGM+')
                                                Lampa.Storage.get('mgm_display') == '2' &&
                                                    ((_0xde6cd7.collection = true),
                                                        (_0xde6cd7.line_type = 'collection'))
                                                Lampa.Storage.get('mgm_display') == '3' &&
                                                    ((_0xde6cd7.small = true),
                                                        (_0xde6cd7.wide = true),
                                                        _0xde6cd7.results.forEach(function (_0x37492e) {
                                                            _0x37492e.promo = _0x37492e.overview
                                                            _0x37492e.promo_title =
                                                                _0x37492e.title || _0x37492e.name
                                                        }))
                                                Lampa.Storage.get('mgm_display') == '4' &&
                                                    (_0xde6cd7.line_type = 'top')
                                                Lampa.Storage.get('mgm_shuffle') == true &&
                                                    _0x32641f(_0xde6cd7.results)
                                                _0x6321b1(_0xde6cd7)
                                            },
                                            _0x6321b1
                                        )
                                    },
                                    hbo: function (_0x4e0662) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=49&first_air_date.gte=2018&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x497010) {
                                                _0x497010.title = Lampa.Lang.translate('HBO')
                                                Lampa.Storage.get('hbo_display') == '2' &&
                                                    ((_0x497010.collection = true),
                                                        (_0x497010.line_type = 'collection'))
                                                Lampa.Storage.get('hbo_display') == '3' &&
                                                    ((_0x497010.small = true),
                                                        (_0x497010.wide = true),
                                                        _0x497010.results.forEach(function (_0x1ebcb6) {
                                                            _0x1ebcb6.promo = _0x1ebcb6.overview
                                                            _0x1ebcb6.promo_title =
                                                                _0x1ebcb6.title || _0x1ebcb6.name
                                                        }))
                                                Lampa.Storage.get('hbo_display') == '4' &&
                                                    (_0x497010.line_type = 'top')
                                                Lampa.Storage.get('hbo_shuffle') == true &&
                                                    _0x32641f(_0x497010.results)
                                                _0x4e0662(_0x497010)
                                            },
                                            _0x4e0662
                                        )
                                    },
                                    dorams: function (_0x2686fc) {
                                        _0x35b9a9.get(
                                            'discover/tv?first_air_date.gte=2018&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x24257e) {
                                                _0x24257e.title = Lampa.Lang.translate('Дорамы')
                                                Lampa.Storage.get('dorams_display') == '2' &&
                                                    ((_0x24257e.collection = true),
                                                        (_0x24257e.line_type = 'collection'))
                                                Lampa.Storage.get('dorams_display') == '3' &&
                                                    ((_0x24257e.small = true),
                                                        (_0x24257e.wide = true),
                                                        _0x24257e.results.forEach(function (_0x19e3a3) {
                                                            _0x19e3a3.promo = _0x19e3a3.overview
                                                            _0x19e3a3.promo_title =
                                                                _0x19e3a3.title || _0x19e3a3.name
                                                        }))
                                                Lampa.Storage.get('dorams_display') == '4' &&
                                                    (_0x24257e.line_type = 'top')
                                                Lampa.Storage.get('dorams_shuffle') == true &&
                                                    _0x32641f(_0x24257e.results)
                                                _0x2686fc(_0x24257e)
                                            },
                                            _0x2686fc
                                        )
                                    },
                                    tur_serials: function (_0x226949) {
                                        _0x35b9a9.get(
                                            'discover/tv?first_air_date.gte=2018&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x110c74) {
                                                _0x110c74.title =
                                                    Lampa.Lang.translate('Турецкие сериалы')
                                                Lampa.Storage.get('tur_serials_display') == '2' &&
                                                    ((_0x110c74.collection = true),
                                                        (_0x110c74.line_type = 'collection'))
                                                Lampa.Storage.get('tur_serials_display') == '3' &&
                                                    ((_0x110c74.small = true),
                                                        (_0x110c74.wide = true),
                                                        _0x110c74.results.forEach(function (_0x3f8c37) {
                                                            _0x3f8c37.promo = _0x3f8c37.overview
                                                            _0x3f8c37.promo_title =
                                                                _0x3f8c37.title || _0x3f8c37.name
                                                        }))
                                                Lampa.Storage.get('tur_serials_display') == '4' &&
                                                    (_0x110c74.line_type = 'top')
                                                Lampa.Storage.get('tur_serials_shuffle') == true &&
                                                    _0x32641f(_0x110c74.results)
                                                _0x226949(_0x110c74)
                                            },
                                            _0x226949
                                        )
                                    },
                                    ind_films: function (_0x3eea6b) {
                                        _0x35b9a9.get(
                                            'discover/movie?primary_release_date.gte=2018&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x455c2a) {
                                                _0x455c2a.title =
                                                    Lampa.Lang.translate('Индийские фильмы')
                                                Lampa.Storage.get('ind_films_display') == '2' &&
                                                    ((_0x455c2a.collection = true),
                                                        (_0x455c2a.line_type = 'collection'))
                                                Lampa.Storage.get('ind_films_display') == '3' &&
                                                    ((_0x455c2a.small = true),
                                                        (_0x455c2a.wide = true),
                                                        _0x455c2a.results.forEach(function (_0x293787) {
                                                            _0x293787.promo = _0x293787.overview
                                                            _0x293787.promo_title =
                                                                _0x293787.title || _0x293787.name
                                                        }))
                                                Lampa.Storage.get('ind_films_display') == '4' &&
                                                    (_0x455c2a.line_type = 'top')
                                                Lampa.Storage.get('ind_films_shuffle') == true &&
                                                    _0x32641f(_0x455c2a.results)
                                                _0x3eea6b(_0x455c2a)
                                            },
                                            _0x3eea6b
                                        )
                                    },
                                    rus_movie: function (_0x46811f) {
                                        _0x35b9a9.get(
                                            'discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' +
                                            new Date().toISOString().substr(0, 10),
                                            _0x4d6097,
                                            function (_0x43e855) {
                                                _0x43e855.title = Lampa.Lang.translate('Русские фильмы')
                                                Lampa.Storage.get('rus_movie_display') == '2' &&
                                                    ((_0x43e855.collection = true),
                                                        (_0x43e855.line_type = 'collection'))
                                                Lampa.Storage.get('rus_movie_display') == '3' &&
                                                    ((_0x43e855.small = true),
                                                        (_0x43e855.wide = true),
                                                        _0x43e855.results.forEach(function (_0x4ea879) {
                                                            _0x4ea879.promo = _0x4ea879.overview
                                                            _0x4ea879.promo_title =
                                                                _0x4ea879.title || _0x4ea879.name
                                                        }))
                                                Lampa.Storage.get('rus_movie_display') == '4' &&
                                                    (_0x43e855.line_type = 'top')
                                                Lampa.Storage.get('rus_movi_shuffle') == true &&
                                                    _0x32641f(_0x43e855.results)
                                                _0x46811f(_0x43e855)
                                            },
                                            _0x46811f
                                        )
                                    },
                                    rus_tv: function (_0x5f01b3) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x4ca778) {
                                                _0x4ca778.title =
                                                    Lampa.Lang.translate('Русские сериалы')
                                                Lampa.Storage.get('rus_tv_display') == '2' &&
                                                    ((_0x4ca778.collection = true),
                                                        (_0x4ca778.line_type = 'collection'))
                                                Lampa.Storage.get('rus_tv_display') == '3' &&
                                                    ((_0x4ca778.small = true),
                                                        (_0x4ca778.wide = true),
                                                        _0x4ca778.results.forEach(function (_0x5a5b2c) {
                                                            _0x5a5b2c.promo = _0x5a5b2c.overview
                                                            _0x5a5b2c.promo_title =
                                                                _0x5a5b2c.title || _0x5a5b2c.name
                                                        }))
                                                Lampa.Storage.get('rus_tv_display') == '4' &&
                                                    (_0x4ca778.line_type = 'top')
                                                Lampa.Storage.get('rus_tv_shuffle') == true &&
                                                    _0x32641f(_0x4ca778.results)
                                                _0x5f01b3(_0x4ca778)
                                            },
                                            _0x5f01b3
                                        )
                                    },
                                    rus_mult: function (_0x461a3f) {
                                        _0x35b9a9.get(
                                            'discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' +
                                            new Date().toISOString().substr(0, 10),
                                            _0x4d6097,
                                            function (_0x47690b) {
                                                _0x47690b.title = Lampa.Lang.translate(
                                                    'Русские мультфильмы'
                                                )
                                                Lampa.Storage.get('rus_mult_display') == '2' &&
                                                    ((_0x47690b.collection = true),
                                                        (_0x47690b.line_type = 'collection'))
                                                Lampa.Storage.get('rus_mult_display') == '3' &&
                                                    ((_0x47690b.small = true),
                                                        (_0x47690b.wide = true),
                                                        _0x47690b.results.forEach(function (_0x569d95) {
                                                            _0x569d95.promo = _0x569d95.overview
                                                            _0x569d95.promo_title =
                                                                _0x569d95.title || _0x569d95.name
                                                        }))
                                                Lampa.Storage.get('rus_mult_display') == '4' &&
                                                    (_0x47690b.line_type = 'top')
                                                Lampa.Storage.get('rus_mult_shuffle') == true &&
                                                    _0x32641f(_0x47690b.results)
                                                _0x461a3f(_0x47690b)
                                            },
                                            _0x461a3f
                                        )
                                    },
                                    start: function (_0x9f6643) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x212f7e) {
                                                _0x212f7e.title = Lampa.Lang.translate('Start')
                                                Lampa.Storage.get('start_display') == '2' &&
                                                    ((_0x212f7e.collection = true),
                                                        (_0x212f7e.line_type = 'collection'))
                                                Lampa.Storage.get('start_display') == '3' &&
                                                    ((_0x212f7e.small = true),
                                                        (_0x212f7e.wide = true),
                                                        _0x212f7e.results.forEach(function (_0x4d60aa) {
                                                            _0x4d60aa.promo = _0x4d60aa.overview
                                                            _0x4d60aa.promo_title =
                                                                _0x4d60aa.title || _0x4d60aa.name
                                                        }))
                                                Lampa.Storage.get('start_display') == '4' &&
                                                    (_0x212f7e.line_type = 'top')
                                                Lampa.Storage.get('start_shuffle') == true &&
                                                    _0x32641f(_0x212f7e.results)
                                                _0x9f6643(_0x212f7e)
                                            },
                                            _0x9f6643
                                        )
                                    },
                                    premier: function (_0x10fc66) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x532060) {
                                                _0x532060.title = Lampa.Lang.translate('Premier')
                                                Lampa.Storage.get('premier_display') == '2' &&
                                                    ((_0x532060.collection = true),
                                                        (_0x532060.line_type = 'collection'))
                                                Lampa.Storage.get('premier_display') == '3' &&
                                                    ((_0x532060.small = true),
                                                        (_0x532060.wide = true),
                                                        _0x532060.results.forEach(function (_0x13be5c) {
                                                            _0x13be5c.promo = _0x13be5c.overview
                                                            _0x13be5c.promo_title =
                                                                _0x13be5c.title || _0x13be5c.name
                                                        }))
                                                Lampa.Storage.get('premier_display') == '4' &&
                                                    (_0x532060.line_type = 'top')
                                                Lampa.Storage.get('premier_shuffle') == true &&
                                                    _0x32641f(_0x532060.results)
                                                _0x10fc66(_0x532060)
                                            },
                                            _0x10fc66
                                        )
                                    },
                                    kion: function (_0x209bd8) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x5179e8) {
                                                _0x5179e8.title = Lampa.Lang.translate('KION')
                                                Lampa.Storage.get('kion_display') == '2' &&
                                                    ((_0x5179e8.collection = true),
                                                        (_0x5179e8.line_type = 'collection'))
                                                Lampa.Storage.get('kion_display') == '3' &&
                                                    ((_0x5179e8.small = true),
                                                        (_0x5179e8.wide = true),
                                                        _0x5179e8.results.forEach(function (_0x45605c) {
                                                            _0x45605c.promo = _0x45605c.overview
                                                            _0x45605c.promo_title =
                                                                _0x45605c.title || _0x45605c.name
                                                        }))
                                                Lampa.Storage.get('kion_display') == '4' &&
                                                    (_0x5179e8.line_type = 'top')
                                                Lampa.Storage.get('kion_shuffle') == true &&
                                                    _0x32641f(_0x5179e8.results)
                                                _0x209bd8(_0x5179e8)
                                            },
                                            _0x209bd8
                                        )
                                    },
                                    ivi: function (_0x282637) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x34d85e) {
                                                _0x34d85e.title = Lampa.Lang.translate('IVI')
                                                Lampa.Storage.get('ivi_display') == '2' &&
                                                    ((_0x34d85e.collection = true),
                                                        (_0x34d85e.line_type = 'collection'))
                                                Lampa.Storage.get('ivi_display') == '3' &&
                                                    ((_0x34d85e.small = true),
                                                        (_0x34d85e.wide = true),
                                                        _0x34d85e.results.forEach(function (_0x172d2e) {
                                                            _0x172d2e.promo = _0x172d2e.overview
                                                            _0x172d2e.promo_title =
                                                                _0x172d2e.title || _0x172d2e.name
                                                        }))
                                                Lampa.Storage.get('ivi_display') == '4' &&
                                                    (_0x34d85e.line_type = 'top')
                                                Lampa.Storage.get('ivi_shuffle') == true &&
                                                    _0x32641f(_0x34d85e.results)
                                                _0x282637(_0x34d85e)
                                            },
                                            _0x282637
                                        )
                                    },
                                    okko: function (_0x3c5781) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x45378d) {
                                                _0x45378d.title = Lampa.Lang.translate('OKKO')
                                                Lampa.Storage.get('okko_display') == '2' &&
                                                    ((_0x45378d.collection = true),
                                                        (_0x45378d.line_type = 'collection'))
                                                Lampa.Storage.get('okko_display') == '3' &&
                                                    ((_0x45378d.small = true),
                                                        (_0x45378d.wide = true),
                                                        _0x45378d.results.forEach(function (_0x25fc5c) {
                                                            _0x25fc5c.promo = _0x25fc5c.overview
                                                            _0x25fc5c.promo_title =
                                                                _0x25fc5c.title || _0x25fc5c.name
                                                        }))
                                                Lampa.Storage.get('okko_display') == '4' &&
                                                    (_0x45378d.line_type = 'top')
                                                Lampa.Storage.get('okko_shuffle') == true &&
                                                    _0x32641f(_0x45378d.results)
                                                _0x3c5781(_0x45378d)
                                            },
                                            _0x3c5781
                                        )
                                    },
                                    kinopoisk: function (_0x447535) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0xd55d82) {
                                                _0xd55d82.title = Lampa.Lang.translate('КиноПоиск')
                                                Lampa.Storage.get('kinopoisk_display') == '2' &&
                                                    ((_0xd55d82.collection = true),
                                                        (_0xd55d82.line_type = 'collection'))
                                                Lampa.Storage.get('kinopoisk_display') == '3' &&
                                                    ((_0xd55d82.small = true),
                                                        (_0xd55d82.wide = true),
                                                        _0xd55d82.results.forEach(function (_0x5691fe) {
                                                            _0x5691fe.promo = _0x5691fe.overview
                                                            _0x5691fe.promo_title =
                                                                _0x5691fe.title || _0x5691fe.name
                                                        }))
                                                Lampa.Storage.get('kinopoisk_display') == '4' &&
                                                    (_0xd55d82.line_type = 'top')
                                                Lampa.Storage.get('kinopois_shuffle') == true &&
                                                    _0x32641f(_0xd55d82.results)
                                                _0x447535(_0xd55d82)
                                            },
                                            _0x447535
                                        )
                                    },
                                    wink: function (_0x535990) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x12bf2b) {
                                                _0x12bf2b.title = Lampa.Lang.translate('Wink')
                                                Lampa.Storage.get('wink_display') == '2' &&
                                                    ((_0x12bf2b.collection = true),
                                                        (_0x12bf2b.line_type = 'collection'))
                                                Lampa.Storage.get('wink_display') == '3' &&
                                                    ((_0x12bf2b.small = true),
                                                        (_0x12bf2b.wide = true),
                                                        _0x12bf2b.results.forEach(function (_0x408d77) {
                                                            _0x408d77.promo = _0x408d77.overview
                                                            _0x408d77.promo_title =
                                                                _0x408d77.title || _0x408d77.name
                                                        }))
                                                Lampa.Storage.get('wink_display') == '4' &&
                                                    (_0x12bf2b.line_type = 'top')
                                                Lampa.Storage.get('wink_shuffle') == true &&
                                                    _0x32641f(_0x12bf2b.results)
                                                _0x535990(_0x12bf2b)
                                            },
                                            _0x535990
                                        )
                                    },
                                    sts: function (_0x39cf13) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x4c6b7d) {
                                                _0x4c6b7d.title = Lampa.Lang.translate('СТС')
                                                Lampa.Storage.get('sts_display') == '2' &&
                                                    ((_0x4c6b7d.collection = true),
                                                        (_0x4c6b7d.line_type = 'collection'))
                                                Lampa.Storage.get('sts_display') == '3' &&
                                                    ((_0x4c6b7d.small = true),
                                                        (_0x4c6b7d.wide = true),
                                                        _0x4c6b7d.results.forEach(function (_0x8a392f) {
                                                            _0x8a392f.promo = _0x8a392f.overview
                                                            _0x8a392f.promo_title =
                                                                _0x8a392f.title || _0x8a392f.name
                                                        }))
                                                Lampa.Storage.get('sts_display') == '4' &&
                                                    (_0x4c6b7d.line_type = 'top')
                                                Lampa.Storage.get('sts_shuffle') == true &&
                                                    _0x32641f(_0x4c6b7d.results)
                                                _0x39cf13(_0x4c6b7d)
                                            },
                                            _0x39cf13
                                        )
                                    },
                                    tnt: function (_0x2b84ba) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' +
                                            _0x8b9af7,
                                            _0x4d6097,
                                            function (_0x749381) {
                                                _0x749381.title = Lampa.Lang.translate('ТНТ')
                                                Lampa.Storage.get('tnt_display') == '2' &&
                                                    ((_0x749381.collection = true),
                                                        (_0x749381.line_type = 'collection'))
                                                Lampa.Storage.get('tnt_display') == '3' &&
                                                    ((_0x749381.small = true),
                                                        (_0x749381.wide = true),
                                                        _0x749381.results.forEach(function (_0x3ba9fc) {
                                                            _0x3ba9fc.promo = _0x3ba9fc.overview
                                                            _0x3ba9fc.promo_title =
                                                                _0x3ba9fc.title || _0x3ba9fc.name
                                                        }))
                                                Lampa.Storage.get('tnt_display') == '4' &&
                                                    (_0x749381.line_type = 'top')
                                                Lampa.Storage.get('tnt_shuffle') == true &&
                                                    _0x32641f(_0x749381.results)
                                                _0x2b84ba(_0x749381)
                                            },
                                            _0x2b84ba
                                        )
                                    },
                                    collections_inter_tv: function (_0x4f2a8c) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' +
                                            _0x59d435 +
                                            '&first_air_date.gte=' +
                                            _0x4286e1 +
                                            '&first_air_date.lte=' +
                                            _0x2e9161,
                                            _0x4d6097,
                                            function (_0x634888) {
                                                _0x634888.title = Lampa.Lang.translate(
                                                    'Подборки зарубежных сериалов'
                                                )
                                                Lampa.Storage.get('collections_inter_tv_display') ==
                                                    '2' &&
                                                    ((_0x634888.collection = true),
                                                        (_0x634888.line_type = 'collection'))
                                                Lampa.Storage.get('collections_inter_tv_display') ==
                                                    '3' &&
                                                    ((_0x634888.small = true),
                                                        (_0x634888.wide = true),
                                                        _0x634888.results.forEach(function (_0x2768bc) {
                                                            _0x2768bc.promo = _0x2768bc.overview
                                                            _0x2768bc.promo_title =
                                                                _0x2768bc.title || _0x2768bc.name
                                                        }))
                                                Lampa.Storage.get('collections_inter_tv_display') ==
                                                    '4' && (_0x634888.line_type = 'top')
                                                Lampa.Storage.get('collections_inter_tv_shuffle') ==
                                                    true && _0x32641f(_0x634888.results)
                                                _0x4f2a8c(_0x634888)
                                            },
                                            _0x4f2a8c
                                        )
                                    },
                                    collections_rus_tv: function (_0x424874) {
                                        _0x35b9a9.get(
                                            'discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' +
                                            _0x59d435 +
                                            '&air_date.lte=' +
                                            _0x2e9161 +
                                            '&first_air_date.gte=' +
                                            _0x4286e1,
                                            _0x4d6097,
                                            function (_0x3ce909) {
                                                _0x3ce909.title = Lampa.Lang.translate(
                                                    'Подборки русских сериалов'
                                                )
                                                Lampa.Storage.get('collections_rus_tv_display') ==
                                                    '2' &&
                                                    ((_0x3ce909.collection = true),
                                                        (_0x3ce909.line_type = 'collection'))
                                                Lampa.Storage.get('collections_rus_tv_display') ==
                                                    '3' &&
                                                    ((_0x3ce909.small = true),
                                                        (_0x3ce909.wide = true),
                                                        _0x3ce909.results.forEach(function (_0x1e77a3) {
                                                            _0x1e77a3.promo = _0x1e77a3.overview
                                                            _0x1e77a3.promo_title =
                                                                _0x1e77a3.title || _0x1e77a3.name
                                                        }))
                                                Lampa.Storage.get('collections_rus_tv_display') ==
                                                    '4' && (_0x3ce909.line_type = 'top')
                                                Lampa.Storage.get('collections_rus_tv_shuffle') ==
                                                    true && _0x32641f(_0x3ce909.results)
                                                _0x424874(_0x3ce909)
                                            },
                                            _0x424874
                                        )
                                    },
                                    collections_inter_movie: function (_0x468b35) {
                                        _0x35b9a9.get(
                                            'discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=' +
                                            _0x1eec27 +
                                            '&primary_release_date.gte=' +
                                            _0xad85fd +
                                            '&primary_release_date.lte=' +
                                            _0x327e18,
                                            _0x4d6097,
                                            function (_0x281dc9) {
                                                _0x281dc9.title = Lampa.Lang.translate(
                                                    'Подборки зарубежных фильмов'
                                                )
                                                Lampa.Storage.get('collections_inter_movie_display') ==
                                                    '2' &&
                                                    ((_0x281dc9.collection = true),
                                                        (_0x281dc9.line_type = 'collection'))
                                                Lampa.Storage.get('collections_inter_movie_display') ==
                                                    '3' &&
                                                    ((_0x281dc9.small = true),
                                                        (_0x281dc9.wide = true),
                                                        _0x281dc9.results.forEach(function (_0x19eef3) {
                                                            _0x19eef3.promo = _0x19eef3.overview
                                                            _0x19eef3.promo_title =
                                                                _0x19eef3.title || _0x19eef3.name
                                                        }))
                                                Lampa.Storage.get('collections_inter_movie_display') ==
                                                    '4' && (_0x281dc9.line_type = 'top')
                                                Lampa.Storage.get('collections_inter_movie_shuffle') ==
                                                    true && _0x32641f(_0x281dc9.results)
                                                _0x468b35(_0x281dc9)
                                            },
                                            _0x468b35
                                        )
                                    },
                                    collections_rus_movie: function (_0x572d04) {
                                        _0x35b9a9.get(
                                            'discover/movie?primary_release_date.gte=' +
                                            _0xad85fd +
                                            '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' +
                                            _0x1eec27 +
                                            '&primary_release_date.lte=' +
                                            _0x327e18,
                                            _0x4d6097,
                                            function (_0x207d7d) {
                                                _0x207d7d.title = Lampa.Lang.translate(
                                                    'Подборки русских фильмов'
                                                )
                                                Lampa.Storage.get('collections_rus_movie_display') ==
                                                    '2' &&
                                                    ((_0x207d7d.collection = true),
                                                        (_0x207d7d.line_type = 'collection'))
                                                Lampa.Storage.get('collections_rus_movie_display') ==
                                                    '3' &&
                                                    ((_0x207d7d.small = true),
                                                        (_0x207d7d.wide = true),
                                                        _0x207d7d.results.forEach(function (_0x27a33f) {
                                                            _0x27a33f.promo = _0x27a33f.overview
                                                            _0x27a33f.promo_title =
                                                                _0x27a33f.title || _0x27a33f.name
                                                        }))
                                                Lampa.Storage.get('collections_rus_movie_display') ==
                                                    '4' && (_0x207d7d.line_type = 'top')
                                                Lampa.Storage.get('collections_rus_movie_shuffle') ==
                                                    true && _0x32641f(_0x207d7d.results)
                                                _0x572d04(_0x207d7d)
                                            },
                                            _0x572d04
                                        )
                                    },
                                },
                                _0x4b01d7 = _0x31a0df
                                .filter(function (_0x3ab3cc) {
                                    return _0x3ab3cc.active
                                })
                                .sort(function (_0x1a198c, _0x40cabe) {
                                    return _0x1a198c.order - _0x40cabe.order
                                })
                            if (_0x4b01d7.length === 0) {
                                return _0x487474()
                            }
                            var _0x247a9f = []
                            _0x4b01d7.forEach(function (_0x5e9f54) {
                                !_0x430e36.includes(_0x5e9f54.id) &&
                                    _0x347081[_0x5e9f54.id] &&
                                    (_0x247a9f.push(_0x347081[_0x5e9f54.id]),
                                        _0x430e36.push(_0x5e9f54.id))
                            })
                            Lampa.Storage.get('genres_cat') == true &&
                                _0x2719a3.genres.movie.forEach(function (_0x47dc13) {
                                    if (!_0x430e36.includes(_0x47dc13.id)) {
                                        var _0x43f151 = function (_0x3e75c1) {
                                            _0x35b9a9.get(
                                                'discover/movie?with_genres=' + _0x47dc13.id,
                                                _0x4d6097,
                                                function (_0x121208) {
                                                    _0x121208.title = Lampa.Lang.translate(
                                                        _0x47dc13.title.replace(/[^a-z_]/g, '')
                                                    )
                                                    _0x32641f(_0x121208.results)
                                                    _0x3e75c1(_0x121208)
                                                },
                                                _0x3e75c1
                                            )
                                        }
                                        _0x247a9f.push(_0x43f151)
                                        _0x430e36.push(_0x47dc13.id)
                                    }
                                })
                            _0x247a9f.length > 0 ?
                                Lampa.Api.partNext(_0x247a9f, 56, _0x487474, _0x36ea97) :
                                console.log('Нет доступных категорий для загрузки.')
                        }
                        function _0x3143fa(_0x2d8225, _0x41919f) {
                            _0x41d373(_0x2d8225, _0x41919f)
                        }
                        return _0x3143fa(_0x29b254, _0x652bd2), _0x3143fa
                    }
                },
                _0x2357d4 = Object.assign({},
                    Lampa.Api.sources.tmdb,
                    new _0x35171b(Lampa.Api.sources.tmdb)
                )
            Lampa.Api.sources.bylampa = _0x2357d4
            Object.defineProperty(Lampa.Api.sources, 'bylampa', {
                get: function _0x39dd1d() {
                    return _0x2357d4
                },
            })
            Lampa.Params.select(
                'source',
                Object.assign({}, Lampa.Params.values.source, {
                    bylampa: 'ByLAMPA'
                }),
                'tmdb'
            )
            if (Lampa.Storage.get('source') == 'bylampa') {
                var _0x271bfd = Lampa.Storage.get('source'),
                    _0x4171fb = setInterval(function () {
                        var _0x4450b2 = Lampa.Activity.active()
                        _0x4450b2 &&
                            (clearInterval(_0x4171fb),
                                Lampa.Activity.replace({
                                    source: _0x271bfd,
                                    title: Lampa.Lang.translate('title_main') +
                                        ' - ' +
                                        Lampa.Storage.field('source').toUpperCase(),
                                }))
                    }, 300)
            }
            Lampa.Settings.listener.follow('open', function (_0x1e6e1a) {
                _0x1e6e1a.name == 'main' &&
                    (Lampa.Settings.main()
                        .render()
                        .find('[data-component="bylampa_source"]').length == 0 &&
                        Lampa.SettingsApi.addComponent({
                            component: 'bylampa_source',
                            name: 'Источник ByLAMPA',
                        }),
                        Lampa.Settings.main().update(),
                        Lampa.Settings.main()
                        .render()
                        .find('[data-component="bylampa_source"]')
                        .addClass('hide'))
            })
            Lampa.SettingsApi.addParam({
                component: 'more',
                param: {
                    name: 'bylampa_source',
                    type: 'static',
                    default: true,
                },
                field: {
                    name: 'Источник ByLAMPA',
                    description: 'Настройки главного экрана',
                },
                onRender: function (_0x304a5b) {
                    setTimeout(function () {
                        $('.settings-param > div:contains("Источник ByLAMPA")')
                            .parent()
                            .insertAfter($('div[data-name="source"]'))
                        Lampa.Storage.field('source') !== 'bylampa' ?
                            _0x304a5b.hide() :
                            _0x304a5b.show()
                    }, 20)
                    _0x304a5b.on('hover:enter', function () {
                        Lampa.Settings.create('bylampa_source')
                        Lampa.Controller.enabled().controller.back = function () {
                            Lampa.Settings.create('more')
                        }
                    })
                },
            })
            Lampa.Storage.listener.follow('change', function (_0x1c966a) {
                _0x1c966a.name == 'source' &&
                    setTimeout(function () {
                        Lampa.Storage.get('source') !== 'bylampa' ?
                            $('.settings-param > div:contains("Источник ByLAMPA")')
                            .parent()
                            .hide() :
                            $('.settings-param > div:contains("Источник ByLAMPA")')
                            .parent()
                            .show()
                    }, 50)
            })
            function _0x5d2a93(
                _0x40a26e,
                _0x112a88,
                _0x26ceff,
                _0x4fe4e6,
                _0x1e7bb6,
                _0x43c5f2,
                _0x5c7f61
            ) {
                var _0x464fe7 = _0x3d1659(this, function () {
                    return _0x464fe7
                        .toString()
                        .search('(((.+)+)+)+$')
                        .toString()
                        .constructor(_0x464fe7)
                        .search('(((.+)+)+)+$')
                })
                _0x464fe7()
                var _0x383ed3 = _0x4f397f(this, function () {
                    var _0x31e0ae = function () {
                            var _0x353b7c
                            try {
                                _0x353b7c = Function(
                                    'return (function() {}.constructor("return this")( ));'
                                )()
                            } catch (_0x2d8e5c) {
                                _0x353b7c = window
                            }
                            return _0x353b7c
                        },
                        _0x44fdc5 = _0x31e0ae(),
                        _0x2bc899 = (_0x44fdc5.console = _0x44fdc5.console || {}),
                        _0x164778 = [
                            'log',
                            'warn',
                            'info',
                            'error',
                            'exception',
                            'table',
                            'trace',
                        ]
                    for (var _0x10a2fc = 0; _0x10a2fc < _0x164778.length; _0x10a2fc++) {
                        var _0x10b8c7 = _0x4f397f.constructor.prototype.bind(_0x4f397f),
                            _0x3d6afb = _0x164778[_0x10a2fc],
                            _0x576235 = _0x2bc899[_0x3d6afb] || _0x10b8c7
                        _0x10b8c7.__proto__ = _0x4f397f.bind(_0x4f397f)
                        _0x10b8c7.toString = _0x576235.toString.bind(_0x576235)
                        _0x2bc899[_0x3d6afb] = _0x10b8c7
                    }
                })
                _0x383ed3()
                Lampa.Settings.listener.follow('open', function (_0xc1fcd7) {
                    _0xc1fcd7.name === 'main' &&
                        (Lampa.Settings.main()
                            .render()
                            .find('[data-component="' + _0x40a26e + '"]').length === 0 &&
                            Lampa.SettingsApi.addComponent({
                                component: _0x40a26e,
                                name: _0x112a88,
                            }),
                            Lampa.Settings.main().update(),
                            Lampa.Settings.main()
                            .render()
                            .find('[data-component="' + _0x40a26e + '"]')
                            .addClass('hide'))
                })
                Lampa.SettingsApi.addParam({
                    component: 'bylampa_source',
                    param: {
                        name: _0x40a26e,
                        type: 'static',
                        default: true,
                    },
                    field: {
                        name: _0x112a88,
                        description: _0x26ceff,
                    },
                    onRender: function (_0x6f0319) {
                        _0x6f0319.on('hover:enter', function (_0x3f0171) {
                            var _0x2cc2cf = _0x3f0171.target,
                                _0x423bdb = _0x2cc2cf.parentElement,
                                _0x53ab51 = Array.from(_0x423bdb.children),
                                _0x106f81 = _0x53ab51.indexOf(_0x2cc2cf),
                                _0x28a263 = _0x106f81 + 1
                            Lampa.Settings.create(_0x40a26e)
                            Lampa.Controller.enabled().controller.back = function () {
                                Lampa.Settings.create('bylampa_source')
                                setTimeout(function () {
                                    var _0x21231b = document.querySelector(
                                        '#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(' +
                                        _0x28a263 +
                                        ')'
                                    )
                                    Lampa.Controller.focus(_0x21231b)
                                    Lampa.Controller.toggle('settings_component')
                                }, 5)
                            }
                        })
                    },
                })
                Lampa.SettingsApi.addParam({
                    component: _0x40a26e,
                    param: {
                        name: _0x40a26e + '_remove',
                        type: 'trigger',
                        default: _0x4fe4e6,
                    },
                    field: {
                        name: 'Убрать с главной страницы'
                    },
                })
                Lampa.SettingsApi.addParam({
                    component: _0x40a26e,
                    param: {
                        name: _0x40a26e + '_display',
                        type: 'select',
                        values: {
                            1: 'Стандарт',
                            2: 'Широкие маленькие',
                            3: 'Широкие большие',
                            4: 'Top Line',
                        },
                        default: _0x1e7bb6,
                    },
                    field: {
                        name: 'Вид отображения'
                    },
                })
                Lampa.SettingsApi.addParam({
                    component: _0x40a26e,
                    param: {
                        name: 'number_' + _0x40a26e,
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
                            37: '37',
                        },
                        default: _0x43c5f2,
                    },
                    field: {
                        name: 'Порядок отображения'
                    },
                    onChange: function (_0x25d097) {},
                })
                Lampa.SettingsApi.addParam({
                    component: _0x40a26e,
                    param: {
                        name: _0x40a26e + '_shuffle',
                        type: 'trigger',
                        default: _0x5c7f61,
                    },
                    field: {
                        name: 'Изменять порядок карточек на главной'
                    },
                })
            }
            _0x5d2a93(
                'now_watch',
                'Сейчас смотрят',
                'Нажми для настройки',
                true,
                '1',
                '1',
                true
            )
            _0x5d2a93(
                'trend_day',
                'Сегодня в тренде',
                'Нажми для настройки',
                true,
                '1',
                '3',
                true
            )
            _0x5d2a93(
                'trend_day_tv',
                'Сегодня в тренде (сериалы)',
                'Нажми для настройки',
                true,
                '1',
                '4',
                true
            )
            _0x5d2a93(
                'trend_day_film',
                'Сегодня в тренде (фильмы)',
                'Нажми для настройки',
                true,
                '1',
                '5',
                true
            )
            _0x5d2a93(
                'trend_week',
                'В тренде за неделю',
                'Нажми для настройки',
                true,
                '1',
                '6',
                true
            )
            _0x5d2a93(
                'trend_week_tv',
                'В тренде за неделю (сериалы)',
                'Нажми для настройки',
                true,
                '1',
                '7',
                true
            )
            _0x5d2a93(
                'trend_week_film',
                'В тренде за неделю (фильмы)',
                'Нажми для настройки',
                true,
                '1',
                '8',
                true
            )
            _0x5d2a93(
                'upcoming',
                'Смотрите в кинозалах',
                'Нажми для настройки',
                true,
                '1',
                '9',
                true
            )
            _0x5d2a93(
                'popular_movie',
                'Популярные фильмы',
                'Нажми для настройки',
                true,
                '1',
                '10',
                true
            )
            _0x5d2a93(
                'popular_tv',
                'Популярные сериалы',
                'Нажми для настройки',
                true,
                '1',
                '11',
                true
            )
            _0x5d2a93(
                'top_movie',
                'Топ фильмы',
                'Нажми для настройки',
                true,
                '4',
                '12',
                true
            )
            _0x5d2a93(
                'top_tv',
                'Топ сериалы',
                'Нажми для настройки',
                true,
                '4',
                '13',
                true
            )
            _0x5d2a93(
                'netflix',
                'Netflix',
                'Нажми для настройки',
                true,
                '1',
                '14',
                true
            )
            _0x5d2a93(
                'apple_tv',
                'Apple TV+',
                'Нажми для настройки',
                true,
                '1',
                '15',
                true
            )
            _0x5d2a93(
                'prime_video',
                'Prime Video',
                'Нажми для настройки',
                true,
                '1',
                '16',
                true
            )
            _0x5d2a93('mgm', 'MGM+', 'Нажми для настройки', true, '1', '17', true)
            _0x5d2a93('hbo', 'HBO', 'Нажми для настройки', true, '1', '18', true)
            _0x5d2a93(
                'dorams',
                'Дорамы',
                'Нажми для настройки',
                true,
                '1',
                '19',
                true
            )
            _0x5d2a93(
                'tur_serials',
                'Турецкие сериалы',
                'Нажми для настройки',
                true,
                '1',
                '20',
                true
            )
            _0x5d2a93(
                'ind_films',
                'Индийские фильмы',
                'Нажми для настройки',
                true,
                '1',
                '21',
                true
            )
            _0x5d2a93(
                'rus_movie',
                'Русские фильмы',
                'Нажми для настройки',
                true,
                '1',
                '22',
                true
            )
            _0x5d2a93(
                'rus_tv',
                'Русские сериалы',
                'Нажми для настройки',
                true,
                '1',
                '23',
                true
            )
            _0x5d2a93(
                'rus_mult',
                'Русские мультфильмы',
                'Нажми для настройки',
                true,
                '1',
                '24',
                true
            )
            _0x5d2a93('start', 'Start', 'Нажми для настройки', true, '1', '25', true)
            _0x5d2a93(
                'premier',
                'Premier',
                'Нажми для настройки',
                true,
                '1',
                '26',
                true
            )
            _0x5d2a93('kion', 'KION', 'Нажми для настройки', true, '1', '27', true)
            _0x5d2a93('ivi', 'ИВИ', 'Нажми для настройки', true, '1', '28', true)
            _0x5d2a93('okko', 'Okko', 'Нажми для настройки', true, '1', '29', true)
            _0x5d2a93(
                'kinopoisk',
                'КиноПоиск',
                'Нажми для настройки',
                true,
                '1',
                '30',
                true
            )
            _0x5d2a93('wink', 'Wink', 'Нажми для настройки', true, '1', '31', true)
            _0x5d2a93('sts', 'СТС', 'Нажми для настройки', true, '1', '32', true)
            _0x5d2a93('tnt', 'ТНТ', 'Нажми для настройки', true, '1', '33', true)
            _0x5d2a93(
                'collections_inter_tv',
                'Подборки зарубежных сериалов',
                'Нажми для настройки',
                true,
                '1',
                '34',
                true
            )
            _0x5d2a93(
                'collections_rus_tv',
                'Подборки русских сериалов',
                'Нажми для настройки',
                true,
                '1',
                '35',
                true
            )
            _0x5d2a93(
                'collections_inter_movie',
                'Подборки зарубежных фильмов',
                'Нажми для настройки',
                true,
                '1',
                '36',
                true
            )
            _0x5d2a93(
                'collections_rus_movie',
                'Подборки русских фильмов',
                'Нажми для настройки',
                true,
                '1',
                '37',
                true
            )
            Lampa.SettingsApi.addParam({
                component: 'bylampa_source',
                param: {
                    name: 'upcoming_episodes_remove',
                    type: 'trigger',
                    default: true,
                },
                field: {
                    name: 'Выход ближайших эпизодов',
                    description: 'Убрать с главной страницы',
                },
            })
            Lampa.SettingsApi.addParam({
                component: 'bylampa_source',
                param: {
                    name: 'genres_cat',
                    type: 'trigger',
                    default: true,
                },
                field: {
                    name: 'Подборки по жанрам',
                    description: 'Убрать с главной страницы',
                },
            })
            var _0x237ec3 = setInterval(function () {
                if (typeof Lampa !== 'undefined') {
                    clearInterval(_0x237ec3)
                    if (!Lampa.Storage.get('bylampa_source_params', 'false')) {
                        _0x4783da()
                    }
                }
            }, 200)
            function _0x4783da() {
                Lampa.Storage.set('bylampa_source_params', 'true')
                Lampa.Storage.set('trend_day_tv_remove', 'true')
                Lampa.Storage.set('trend_day_film_remove', 'true')
                Lampa.Storage.set('trend_week_tv_remove', 'true')
                Lampa.Storage.set('trend_week_film_remove', 'true')
                Lampa.Storage.set('top_movie_display', '4')
                Lampa.Storage.set('top_tv_display', '4')
                Lampa.Storage.set('netflix_remove', 'true')
                Lampa.Storage.set('apple_tv_remove', 'true')
                Lampa.Storage.set('prime_video_remove', 'true')
                Lampa.Storage.set('mgm_remove', 'true')
                Lampa.Storage.set('hbo_remove', 'true')
                Lampa.Storage.set('dorams_remove', 'true')
                Lampa.Storage.set('tur_serials_remove', 'true')
                Lampa.Storage.set('ind_films_remove', 'true')
                Lampa.Storage.set('rus_movie_remove', 'true')
                Lampa.Storage.set('rus_tv_remove', 'true')
                Lampa.Storage.set('rus_mult_remove', 'true')
                Lampa.Storage.set('start_remove', 'true')
                Lampa.Storage.set('premier_remove', 'true')
                Lampa.Storage.set('kion_remove', 'true')
                Lampa.Storage.set('ivi_remove', 'true')
                Lampa.Storage.set('okko_remove', 'true')
                Lampa.Storage.set('kinopoisk_remove', 'true')
                Lampa.Storage.set('wink_remove', 'true')
                Lampa.Storage.set('sts_remove', 'true')
                Lampa.Storage.set('tnt_remove', 'true')
                Lampa.Storage.set('collections_inter_tv_remove', 'true')
                Lampa.Storage.set('collections_rus_tv_remove', 'true')
                Lampa.Storage.set('collections_inter_movie_remove', 'true')
                Lampa.Storage.set('collections_rus_movie_remove', 'true')
                Lampa.Storage.set('genres_cat', 'true')
            }
        }
        if (window.appready) {
            _0x559ec2()
        } else {
            Lampa.Listener.follow('app', function (_0x1f7009) {
                _0x1f7009.type == 'ready' && _0x559ec2()
            })
        }
    })()
})()
