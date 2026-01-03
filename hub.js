'use strict';

Lampa.Platform.tv();

// Кастомная карточка для сериалов с информацией о следующем эпизоде
(function () {
    window.custom_card = true;

    Lampa.Template.add('card_episode', `
        <div class="full-episode">
            <div class="full-episode__img">
                <img class="img_poster" src="#">
                <img class="img_episode" src="#">
            </div>
            <div class="full-episode__name"></div>
            <div class="full-episode__num"></div>
            <div class="full-episode__date"></div>
        </div>
    `);

    function CustomCard(card) {
        var next = card.next_episode_to_air || {};

        if (card.source === undefined) card.source = 'tmdb';
        Lampa.Storage.set('card_episode', card, {
            title: card.name,
            original_title: card.original_name,
            release_date: card.first_air_date
        });

        card.release_year = (card.first_air_date || '0000').substr(0, 4);

        function hide(el) {
            if (el) el.remove();
        }

        this.html = function () {
            this.template = Lampa.Template.get('card_episode');
            this.poster = this.template.querySelector('.img_poster') || {};
            this.episode_img = this.template.querySelector('.img_episode') || {};

            this.template.querySelector('.card__title').innerText = card.title;
            this.template.querySelector('.card__age').innerText = card.release_year || '';

            if (next && next.air_date) {
                this.template.querySelector('.full-episode__name').innerText = next.name || Lampa.Lang.translate('noname');
                this.template.querySelector('.full-episode__num').innerText = next.episode_number || '';
                this.template.querySelector('.full-episode__date').innerText = next.air_date ? Lampa.Time.parseTime(next.air_date).full : '----';
            }

            if (card.release_year === '0000') hide(this.template.querySelector('.card__age'));

            this.template.addEventListener('visible', this.visible.bind(this));
        };

        this.loading = function () {
            this.poster.onload = function () {};
            this.episode_img.onerror = function () {
                this.poster.src = './img/img_broken.svg';
            };
            this.episode_img.onload = function () {
                this.template.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
            };
            this.episode_img.onerror = function () {
                this.episode_img.src = './img/img_broken.svg';
            };
        };

        this.render = function () {
            this.html();

            this.template.addEventListener('hover:focus', () => {
                if (this.onFocus) this.onFocus(this.template, card);
            });
            this.template.addEventListener('hover:hover', () => {
                if (this.onHover) this.onHover(this.template, card);
            });
            this.template.addEventListener('hover:enter', () => {
                if (this.onEnter) this.onEnter(this.template, card);
            });

            this.loading();
        };

        this.visible = function () {
            if (card.backdrop_path) {
                this.poster.src = Lampa.Utils.img(card.backdrop_path);
            } else if (card.poster_path) {
                this.poster.src = Lampa.Utils.img(card.poster_path);
            } else if (card.poster) {
                this.episode_img.src = card.poster;
            } else if (card.img) {
                this.episode_img.src = card.img;
            } else {
                this.episode_img.src = './img/img_broken.svg';
            }

            if (next.still_path) {
                this.episode_img.src = Lampa.Utils.img(next.still_path, 'w300');
            } else if (card.poster_path) {
                this.episode_img.src = Lampa.Utils.img(card.poster_path, 'w300');
            } else if (next.img) {
                this.episode_img.src = next.img;
            } else if (card.img) {
                this.episode_img.src = card.img;
            } else {
                this.episode_img.src = './img/img_broken.svg';
            }

            if (this.onVisible) this.onVisible(this.template, card);
        };

        this.destroy = function () {
            this.episode_img.onerror = function () {};
            this.episode_img.onload = function () {};
            this.poster.onerror = function () {};
            this.poster.onload = function () {};
            this.episode_img.src = '';
            this.poster.src = '';
            hide(this.template);
            this.template = null;
            this.episode_img = null;
            this.poster = null;
        };

        this.rendered = function (rendered) {
            return rendered ? this.template : $(this.template);
        };
    }

    // Расширение источника tmdb — все подборки на главной странице
    function extendTmdb() {
        function TmdbExtension() {
            this.network = new Lampa.Reguest();

            this.main = function (params = {}, onSuccess, onError) {
                var lines = [
                    // 1. Тренды недели (сериалы)
                    (success) => this.get('trending/tv/week', params, (data) => {
                        data.title = Lampa.Lang.translate('title_trend_week');
                        success(data);
                    }, success),

                    // 2. Недавно просмотренные
                    (success) => success({
                        source: 'tmdb',
                        results: Lampa.Storage.cache('lately', 30, []).slice(0, 14),
                        title: Lampa.Lang.translate('title_now_watch'),
                        nomore: true,
                        cardClass: (card, next) => new CustomCard(card, next)
                    }),

                    // 3. Топ-rated сериалы
                    (success) => this.get('tv/top_rated', params, (data) => {
                        data.title = Lampa.Lang.translate('title_top_tv');
                        success(data);
                    }, success),

                    // 4. Популярные сериалы
                    (success) => this.get('tv/popular', params, (data) => {
                        data.title = Lampa.Lang.translate('title_popular_tv');
                        success(data);
                    }, success),

                    // 5. Тренды дня (фильмы)
                    (success) => this.get('trending/movie/day' + new Date().toISOString().slice(0, 10), params, (data) => {
                        data.title = Lampa.Lang.translate('title_trend_day');
                        success(data);
                    }, success),

                    // 6. Русские сериалы (общий)
                    (success) => this.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc', params, (data) => {
                        data.title = Lampa.Lang.translate('Русские сериалы');
                        data.wide = true;
                        data.small = true;
                        data.results.forEach(item => {
                            item.promo = item.backdrop_path;
                            item.promo_title = item.title || item.name;
                        });
                        success(data);
                    }, success),

                    // 7. Недавно просмотренные (ещё раз)
                    (success) => this.get('lately', params, (data) => {
                        data.title = Lampa.Lang.translate('title_now_watch');
                        success(data);
                    }, success),

                    // 8. Новинки недели (тренды)
                    (success) => this.get('trending/movie/week' + new Date().toISOString().slice(0, 10), params, (data) => {
                        data.title = Lampa.Lang.translate('title_trend_week');
                        data.small = true;
                        data.wide = true;
                        data.results.forEach(item => {
                            item.promo = item.backdrop_path;
                            item.promo_title = item.title || item.name;
                        });
                        success(data);
                    }, success),

                    // 9. Популярные фильмы
                    (success) => this.get('movie/popular', params, (data) => {
                        data.title = Lampa.Lang.translate('title_popular_movie');
                        success(data);
                    }, success),

                    // 10. Топ-rated фильмы
                    (success) => this.get('movie/top_rated', params, (data) => {
                        data.title = Lampa.Lang.translate('title_top_movie');
                        success(data);
                    }, success),

                    // 11. Start
                    (success) => this.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc', params, (data) => {
                        data.title = 'Start';
                        data.wide = true;
                        data.small = true;
                        data.results.forEach(item => {
                            item.promo = item.backdrop_path;
                            item.promo_title = item.title || item.name;
                        });
                        success(data);
                    }, success),

                    // 12. Премьеры
                    (success) => this.get('movie/upcoming', params, (data) => {
                        data.title = Lampa.Lang.translate('Premier');
                        success(data);
                    }, success),

                    // 13. СТС
                    (success) => this.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc', params, (data) => {
                        data.title = Lampa.Lang.translate('СТС');
                        success(data);
                    }, success),

                    // 14. ИВИ
                    (success) => this.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc', params, (data) => {
                        data.title = 'ИВИ';
                        data.wide = true;
                        data.small = true;
                        data.results.forEach(item => {
                            item.promo = item.backdrop_path;
                            item.promo_title = item.title || item.name;
                        });
                        success(data);
                    }, success),

                    // 15. Okko
                    (success) => this.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc', params, (data) => {
                        data.title = Lampa.Lang.translate('Okko');
                        success(data);
                    }, success),

                    // 16. КиноПоиск
                    (success) => this.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc', params, (data) => {
                        data.title = 'КиноПоиск';
                        success(data);
                    }, success),

                    // 17. Wink
                    (success) => this.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc', params, (data) => {
                        data.title = Lampa.Lang.translate('Wink');
                        data.wide = true;
                        success(data);
                    }, success),

                    // 18. Premier (ещё один)
                    (success) => this.get('discover/tv?with_networks=806&sort_by=first_air_date.desc', params, (data) => {
                        data.title = Lampa.Lang.translate('Premier');
                        success(data);
                    }, success),

                    // 19. ТНТ
                    (success) => this.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc', params, (data) => {
                        data.title = 'ТНТ';
                        success(data);
                    }, success),

                    // 20. Лайн с типом line (возможно, топ или другое)
                    (success) => this.get('tv/top_rated', params, (data) => {
                        data.title = Lampa.Lang.translate('title_top_tv');
                        data.line_type = 'line';
                        success(data);
                    }, success)
                ];

                Lampa.Utils.put(lines, 6, Lampa.Api.sources.tmdb.build(lines, params, 'tmdb', lines.length + 1));

                return Lampa.Utils.put(lines, 0, onSuccess);
            };
        }

        Object.assign(Lampa.Api.sources.tmdb.prototype, new TmdbExtension());
    }

    if (window.appready) extendTmdb();
    else Lampa.Listener.on('app', function (e) {
        if (e.type == 'ready') extendTmdb();
    });

    if (!window.custom_card) new CustomCard({});
})();

// Добавление пункта в меню с полным списком категорий и всеми SVG-иконками
(function () {
    var folderHtml = '<div class="settings-folder" style="padding:0!important"><div style="width:2.2em;height:1.7em;padding-right:.5em"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.071 33V15h5.893c3.331 0 6.032 2.707 6.032 6.045s-2.7 6.045-6.032 6.045h-5.893m5.893 0l5.892 5.905m3.073-11.92V28.5a4.5 4.5 0 0 0 4.5 4.5h0a4.5 4.5 0 0 0 4.5-4.5v-7.425m0 7.425V33"/><rect width="37" height="37" x="5.5" y="5.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" rx="4" ry="4"/></svg></div><div style="font-size:1.3em">Русские мультфильмы</div></div>';

    var $folder = $(folderHtml);

    $('.menu .menu__list').eq(0).append($folder);

    $folder.on('hover:enter', function () {
        var items = [
            { title: 'Русские фильмы' },
            { title: 'Русские сериалы' },
            { title: folderHtml }, // Полный HTML с иконкой для "Русские мультфильмы"
            { title: 'Start' },
            { title: 'СТС' },
            { title: 'ИВИ' },
            { title: 'Premier' },
            { title: 'Wink' },
            { title: 'КиноПоиск' },
            { title: 'KION' },
            { title: 'Okko' },
            { title: 'ТНТ' }
        ];

        Lampa.Select.show({
            title: Lampa.Lang.translate('settings_rest_source'),
            items: items,
            onSelect: function (item) {
                if (item.title === 'Русские фильмы') {
                    Lampa.Activity.push({
                        url: 'discover/movie?with_original_language=ru&sort_by=primary_release_date.desc',
                        title: 'Русские фильмы',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'Русские сериалы') {
                    Lampa.Activity.push({
                        url: 'discover/tv?with_original_language=ru&sort_by=first_air_date.desc',
                        title: 'Русские сериалы',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title.indexOf('Русские мультфильмы') !== -1) {
                    Lampa.Activity.push({
                        url: '?cat=movie&airdate=2020-2025&genre=16&language=ru',
                        title: 'Русские мультфильмы',
                        component: 'category_full',
                        source: 'cub',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'Start') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'Start',
                        networks: '2859',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'СТС') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'СТС',
                        networks: '4085',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'ИВИ') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'ИВИ',
                        networks: '2493',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'Premier') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'Premier',
                        networks: '806',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'Wink') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'Wink',
                        networks: '5806',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'КиноПоиск') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'КиноПоиск',
                        networks: '3827',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'KION') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'KION',
                        networks: '3871',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'Okko') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'Okko',
                        networks: '3923',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                } else if (item.title === 'ТНТ') {
                    Lampa.Activity.push({
                        url: 'discover/tv',
                        title: 'ТНТ',
                        networks: '3871',
                        sort_by: 'first_air_date.desc',
                        component: 'category_full',
                        source: 'tmdb',
                        card_type: 'true',
                        page: 1
                    });
                }
            },
            onBack: function () {
                Lampa.Controller.toggle('menu');
            }
        });
    });
})();

// Настройка в разделе "Интерфейс"
Lampa.SettingsApi.addParam({
    component: 'interface',
    param: {
        name: 'rus_movie_main',
        type: 'trigger',
        default: true
    },
    field: {
        name: 'Русские новинки на главной',
        description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить'
    },
    onRender: function (el) {
        setTimeout(function () {
            $('div[data-name="interface_size"]').insertAfter(el);
        }, 0);
    }
});

if (Lampa.Storage.get('rus_movie_main') !== false) {
    if (!window.custom_card) {
        // Инициализация кастомной карточки, если нужно
    }
}
