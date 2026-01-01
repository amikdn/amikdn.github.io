(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // === Logo settings + loader ===
    const LOGO_CACHE_PREFIX = 'logo_cache_width_based_v1_';

    function applyLogoCssVars() {
        try {
            const h = (Lampa.Storage && typeof Lampa.Storage.get === 'function') ? (Lampa.Storage.get('logo_height', '') || '') : '';
            const root = document.documentElement;

            if (h) {
                root.style.setProperty('--ni-logo-max-h', h);
                root.style.setProperty('--ni-card-logo-h', h);
            } else {
                root.style.removeProperty('--ni-logo-max-h');
                root.style.removeProperty('--ni-card-logo-h');
            }
        } catch (e) {}
    }

    function initLogoSettings() {
        if (window.__ni_logo_settings_ready) return;
        window.__ni_logo_settings_ready = true;

        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam !== 'function') return;

        const add = (cfg) => {
            try { Lampa.SettingsApi.addParam(cfg); } catch (e) {}
        };

        add({
            component: 'interface',
            param: {
                name: 'logo_glav',
                type: 'select',
                values: { 1: 'Скрыть', 0: 'Отображать' },
                default: '0'
            },
            field: {
                name: 'Логотипы вместо названий',
                description: 'Отображает логотипы фильмов вместо текста'
            },
            onChange: applyLogoCssVars
        });

        add({
            component: 'interface',
            param: {
                name: 'logo_lang',
                type: 'select',
                values: {
                    '': 'Как в Lampa',
                    ru: 'Русский',
                    en: 'English',
                    uk: 'Українська',
                    be: 'Беларуская',
                    kz: 'Қазақша',
                    pt: 'Português',
                    es: 'Español',
                    fr: 'Français',
                    de: 'Deutsch',
                    it: 'Italiano'
                },
                default: ''
            },
            field: {
                name: 'Язык логотипа',
                description: 'Приоритетный язык для поиска логотипа'
            }
        });

        add({
            component: 'interface',
            param: {
                name: 'logo_size',
                type: 'select',
                values: { w300: 'w300', w500: 'w500', w780: 'w780', original: 'Оригинал' },
                default: 'original'
            },
            field: {
                name: 'Размер логотипа',
                description: 'Разрешение загружаемого изображения'
            }
        });

        add({
            component: 'interface',
            param: {
                name: 'logo_height',
                type: 'select',
                values: {
                    '': 'Авто (как в теме)',
                    '2.5em': '2.5em',
                    '3em': '3em',
                    '3.5em': '3.5em',
                    '4em': '4em',
                    '5em': '5em',
                    '6em': '6em',
                    '7em': '7em',
                    '8em': '8em',
                    '10vh': '10vh'
                },
                default: ''
            },
            field: {
                name: 'Высота логотипов',
                description: 'Максимальная высота логотипов (в инфо-блоке и в карточках)'
            },
            onChange: applyLogoCssVars
        });

        add({
            component: 'interface',
            param: {
                name: 'logo_animation_type',
                type: 'select',
                values: { js: 'JavaScript', css: 'CSS' },
                default: 'css'
            },
            field: {
                name: 'Тип анимации логотипов',
                description: 'Способ анимации логотипов'
            }
        });

        add({
            component: 'interface',
            param: { name: 'logo_hide_year', type: 'trigger', default: true },
            field: {
                name: 'Скрывать год и страну',
                description: 'Скрывать информацию над логотипом (переносит в строку деталей)'
            }
        });

        add({
            component: 'interface',
            param: { name: 'logo_use_text_height', type: 'trigger', default: false },
            field: {
                name: 'Логотип по высоте текста',
                description: 'Размер логотипа равен высоте текста'
            }
        });

        add({
            component: 'interface',
            param: { name: 'logo_clear_cache', type: 'button' },
            field: {
                name: 'Сбросить кеш логотипов',
                description: 'Нажмите для очистки кеша изображений'
            },
            onChange: function () {
                Lampa.Select.show({
                    title: 'Сбросить кеш?',
                    items: [{ title: 'Да', confirm: true }, { title: 'Нет' }],
                    onSelect: function (e) {
                        if (e.confirm) {
                            const keys = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const k = localStorage.key(i);
                                if (k && k.indexOf(LOGO_CACHE_PREFIX) !== -1) keys.push(k);
                            }
                            keys.forEach((k) => localStorage.removeItem(k));
                            window.location.reload();
                        } else {
                            Lampa.Controller.toggle('settings_component');
                        }
                    },
                    onBack: function () {
                        Lampa.Controller.toggle('settings_component');
                    }
                });
            }
        });

        applyLogoCssVars();
    }

    function animateOpacity(el, from, to, duration, done) {
        if (!el) return done && done();
        let start = null;
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        requestAnimationFrame(function step(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            el.style.opacity = (from + (to - from) * ease(p)).toString();
            if (p < 1) requestAnimationFrame(step);
            else if (done) done();
        });
    }

    class LogoEngine {
        constructor() {
            this.pending = {};
        }

        enabled() {
            return (Lampa.Storage.get('logo_glav', '0') + '') !== '1';
        }

        lang() {
            const forced = (Lampa.Storage.get('logo_lang', '') || '') + '';
            const base = forced || (Lampa.Storage.get('language') || 'en') + '';
            return (base.split('-')[0] || 'en');
        }

        size() {
            return (Lampa.Storage.get('logo_size', 'original') || 'original') + '';
        }

        animationType() {
            return (Lampa.Storage.get('logo_animation_type', 'css') || 'css') + '';
        }

        useTextHeight() {
            return !!Lampa.Storage.get('logo_use_text_height', false);
        }

        fixedHeight() {
            return (Lampa.Storage.get('logo_height', '') || '') + '';
        }

        cacheKey(type, id, lang) {
            return `${LOGO_CACHE_PREFIX}${type}_${id}_${lang}`;
        }

        getLogoUrl(item, cb, options) {
            try {
                if (!item || !item.id) return cb && cb(null);

                const source = item.source || 'tmdb';
                if (source !== 'tmdb' && source !== 'cub') return cb && cb(null);

                if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return cb && cb(null);

                const type = (item.media_type === 'tv' || item.name) ? 'tv' : 'movie';
                const lang = this.lang();
                const key = this.cacheKey(type, item.id, lang);

                const cached = localStorage.getItem(key);

                if (cached) {
                    if (cached === 'none') return cb && cb(null);
                    return cb && cb(cached);
                }

                if (this.pending[key]) {
                    this.pending[key].push(cb);
                    return;
                }

                this.pending[key] = [cb];

                const url = Lampa.TMDB.api(`${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=${lang},en,null`);

                $.get(url, (res) => {
                    let filePath = null;

                    if (res && Array.isArray(res.logos) && res.logos.length) {
                        for (let i = 0; i < res.logos.length; i++) {
                            if (res.logos[i] && res.logos[i].iso_639_1 === lang) { filePath = res.logos[i].file_path; break; }
                        }
                        if (!filePath) {
                            for (let i = 0; i < res.logos.length; i++) {
                                if (res.logos[i] && res.logos[i].iso_639_1 === 'en') { filePath = res.logos[i].file_path; break; }
                            }
                        }
                        if (!filePath) filePath = res.logos[0] && res.logos[0].file_path;
                    }

                    if (filePath) {
                        const size = this.size();
                        const normalized = (filePath + '').replace('.svg', '.png');
                        const logoUrl = Lampa.TMDB.image('/t/p/' + size + normalized);
                        localStorage.setItem(key, logoUrl);
                        this.flush(key, logoUrl);
                    } else {
                        localStorage.setItem(key, 'none');
                        this.flush(key, null);
                    }
                }).fail(() => {
                    localStorage.setItem(key, 'none');
                    this.flush(key, null);
                });
            } catch (e) {
                if (cb) cb(null);
            }
        }

        flush(key, value) {
            const list = this.pending[key] || [];
            delete this.pending[key];
            list.forEach((fn) => { try { if (fn) fn(value); } catch (e) { } });
        }

        setImageSizing(img, heightPx) {
            if (!img) return;

            img.style.height = '';
            img.style.width = '';
            img.style.maxHeight = '';
            img.style.maxWidth = '';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'left bottom';

            const fixed = this.fixedHeight();
            const useText = this.useTextHeight();

            if (!fixed && useText && heightPx && heightPx > 0) {
                img.style.height = `${heightPx}px`;
                img.style.width = 'auto';
                img.style.maxWidth = '100%';
                img.style.maxHeight = 'none';
            }
        }

        swapContent(container, newNode) {
            if (!container) return;
            const type = this.animationType();

            if (container.__ni_logo_timer) {
                clearTimeout(container.__ni_logo_timer);
                container.__ni_logo_timer = null;
            }

            if (type === 'js') {
                container.style.transition = 'none';
                animateOpacity(container, 1, 0, 300, () => {
                    container.innerHTML = '';
                    if (typeof newNode === 'string') container.textContent = newNode;
                    else container.appendChild(newNode);
                    container.style.opacity = '0';
                    animateOpacity(container, 0, 1, 400);
                });
            } else {
                container.style.transition = 'opacity 0.3s ease';
                container.style.opacity = '0';
                container.__ni_logo_timer = setTimeout(() => {
                    container.__ni_logo_timer = null;
                    container.innerHTML = '';
                    if (typeof newNode === 'string') container.textContent = newNode;
                    else container.appendChild(newNode);
                    container.style.transition = 'opacity 0.4s ease';
                    container.style.opacity = '1';
                }, 150);
            }
        }

        applyToInfo(ctx, item, titleText) {
            if (!ctx || !ctx.title || !item) return;

            const titleEl = ctx.title[0] || ctx.title;
            if (!titleEl) return;

            const requestId = (titleEl.__ni_logo_req_id || 0) + 1;
            titleEl.__ni_logo_req_id = requestId;

            const headNode = ctx.head && (ctx.head[0] || ctx.head);
            const movedHeadNode = ctx.moved_head && (ctx.moved_head[0] || ctx.moved_head);
            const dotRateHead = ctx.dot_rate_head && (ctx.dot_rate_head[0] || ctx.dot_rate_head);
            const dotHeadGenre = ctx.dot_head_genre && (ctx.dot_head_genre[0] || ctx.dot_head_genre);
            const dotRateGenre = ctx.dot_rate_genre && (ctx.dot_rate_genre[0] || ctx.dot_rate_genre);

            const hasRate = !!ctx.has_rate;
            const hasGenres = !!ctx.has_genre;

            const setDotsNoMoved = () => {
                if (dotRateHead) dotRateHead.style.display = 'none';
                if (dotHeadGenre) dotHeadGenre.style.display = 'none';
                if (dotRateGenre) dotRateGenre.style.display = (hasRate && hasGenres) ? '' : 'none';
            };

            const setDotsMoved = (hasMoved) => {
                if (!hasMoved) return setDotsNoMoved();
                if (dotRateGenre) dotRateGenre.style.display = 'none';
                if (dotRateHead) dotRateHead.style.display = (hasRate && hasMoved) ? '' : 'none';
                if (dotHeadGenre) dotHeadGenre.style.display = (hasMoved && hasGenres) ? '' : 'none';
            };

            if (!this.enabled()) {
                if (ctx.wrapper && ctx.wrapper.removeClass) ctx.wrapper.removeClass('ni-hide-head');
                if (headNode) headNode.style.display = '';
                if (movedHeadNode) { movedHeadNode.textContent = ''; movedHeadNode.style.display = 'none'; }
                setDotsNoMoved();
                if (titleEl.textContent !== titleText) titleEl.textContent = titleText;
                return;
            }

            if (titleEl.textContent !== titleText) titleEl.textContent = titleText;
            const textHeightPx = titleEl.getBoundingClientRect ? Math.round(titleEl.getBoundingClientRect().height) : 0;

            setDotsNoMoved();

            this.getLogoUrl(item, (url) => {
                if (titleEl.__ni_logo_req_id !== requestId) return;
                if (!titleEl.isConnected) return;

                if (!url) {
                    if (ctx.wrapper && ctx.wrapper.removeClass) ctx.wrapper.removeClass('ni-hide-head');
                    if (headNode) headNode.style.display = '';
                    if (movedHeadNode) { movedHeadNode.textContent = ''; movedHeadNode.style.display = 'none'; }
                    setDotsNoMoved();
                    if (titleEl.querySelector && titleEl.querySelector('img')) this.swapContent(titleEl, titleText);
                    else titleEl.textContent = titleText;
                    return;
                }

                const img = new Image();
                img.className = 'new-interface-info__title-logo';
                img.alt = titleText;
                img.src = url;

                this.setImageSizing(img, textHeightPx);

                const hideHead = !!Lampa.Storage.get('logo_hide_year', true);
                const headText = (ctx.head_text || '') + '';

                if (hideHead && headText) {
                    if (ctx.wrapper && ctx.wrapper.addClass) ctx.wrapper.addClass('ni-hide-head');
                    if (headNode) headNode.style.display = 'none';
                    if (movedHeadNode) { movedHeadNode.textContent = headText; movedHeadNode.style.display = ''; }
                    setDotsMoved(!!headText);
                } else {
                    if (ctx.wrapper && ctx.wrapper.removeClass) ctx.wrapper.removeClass('ni-hide-head');
                    if (headNode) headNode.style.display = '';
                    if (movedHeadNode) { movedHeadNode.textContent = ''; movedHeadNode.style.display = 'none'; }
                    setDotsNoMoved();
                }

                this.swapContent(titleEl, img);
            });
        }

        applyToCard(cardEl, data) {
            if (!cardEl || !data) return;

            const view = cardEl.querySelector('.card__view');
            if (!view) return;

            let wrap = view.querySelector('.new-interface-card-logo');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'new-interface-card-logo';
                view.appendChild(wrap);
            }

            const titleLabel = cardEl.querySelector('.card__title');
            const ageLabel = cardEl.querySelector('.card__age');

            const titleText = (data.title || data.name || '').trim();

            if (!this.enabled()) {
                wrap.innerHTML = '';
                if (titleLabel) titleLabel.style.display = '';
                if (ageLabel) ageLabel.style.display = '';
                return;
            }

            let textHeightPx = 0;
            if (!this.fixedHeight() && this.useTextHeight() && titleLabel && titleLabel.getBoundingClientRect) {
                textHeightPx = Math.round(titleLabel.getBoundingClientRect().height) || 24;
            }

            this.getLogoUrl(data, (url) => {
                if (!cardEl.isConnected) return;

                if (!url) {
                    wrap.innerHTML = '';
                    if (titleLabel) titleLabel.style.display = '';
                    if (ageLabel) ageLabel.style.display = '';
                    return;
                }

                const img = new Image();
                img.src = url;
                img.alt = titleText;
                this.setImageSizing(img, textHeightPx);

                wrap.innerHTML = '';
                wrap.appendChild(img);

                if (titleLabel) titleLabel.style.display = 'none';
                if (ageLabel && Lampa.Storage.get('hide_captions', true)) ageLabel.style.display = 'none';
            });
        }
    }

    const Logo = new LogoEngine();

    function setupCardLogoObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            const cards = [];
                            if (node.classList && node.classList.contains('card')) cards.push(node);
                            if (node.querySelectorAll) {
                                node.querySelectorAll('.card').forEach((c) => cards.push(c));
                            }

                            cards.forEach((cardEl) => {
                                if (cardEl.__ni_card_logo_applied) return;
                                cardEl.__ni_card_logo_applied = true;

                                const data = cardEl.card_data || (cardEl.querySelector('[card_data]') && cardEl.querySelector('[card_data]').card_data);
                                if (data) Logo.applyToCard(cardEl, data);
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    class InfoPanel {
        constructor() {
            this.html = null;
            this.timer = null;
            this.network = new Lampa.Reguest();
            this.loaded = {};
            this.currentUrl = null;
        }

        create() {
            this.html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__left">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                    </div>
                    <div class="new-interface-info__right">
                        <div class="new-interface-info__textblock">
                            <div class="new-interface-info__meta">
                                <div class="new-interface-info__meta-top">
                                    <div class="new-interface-info__rate"></div>
                                    <span class="new-interface-info__dot dot-rate-head">&#9679;</span>
                                    <div class="new-interface-info__moved-head"></div>
                                    <span class="new-interface-info__dot dot-head-genre">&#9679;</span>
                                    <span class="new-interface-info__dot dot-rate-genre">&#9679;</span>
                                    <div class="new-interface-info__genres"></div>
                                    <span class="new-interface-info__dot dot-genre-runtime">&#9679;</span>
                                    <div class="new-interface-info__runtime"></div>
                                    <span class="new-interface-info__dot dot-runtime-pg">&#9679;</span>
                                    <div class="new-interface-info__pg"></div>
                                </div>
                            </div>
                            <div class="new-interface-info__description"></div>
                        </div>
                    </div>
                </div>
            </div>`);
        }

        render(js) {
            if (!this.html) this.create();
            return js ? this.html[0] : this.html;
        }

        update(data) {
            if (!data) return;
            if (!this.html) this.create();

            this.html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
            this.html.find('.new-interface-info__rate').empty();
            this.html.find('.new-interface-info__pg').empty();
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');
            this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));

            Lampa.Background.change(Lampa.Utils.cardImgBackground(data));

            this.load(data);
        }

        load(data, options = {}) {
            if (!data || !data.id) return;

            const source = data.source || 'tmdb';
            if (source !== 'tmdb' && source !== 'cub') return;

            if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;

            const preload = options.preload;

            const type = data.media_type === 'tv' || data.name ? 'tv' : 'movie';
            const language = Lampa.Storage.get('language');
            const url = Lampa.TMDB.api(`${type}/${data.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates&language=${language}`);

            this.currentUrl = url;

            if (this.loaded[url]) {
                if (!preload) this.draw(this.loaded[url]);
                return;
            }

            clearTimeout(this.timer);

            this.timer = setTimeout(() => {
                this.network.clear();
                this.network.timeout(5000);
                this.network.silent(url, (movie) => {
                    this.loaded[url] = movie;
                    if (!preload && this.currentUrl === url) this.draw(movie);
                });
            }, 0);
        }

        draw(movie) {
            if (!movie || !this.html) return;

            const create = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
            const vote = parseFloat((movie.vote_average || 0) + '').toFixed(1);
            const head = [];
            const sources = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb ? Lampa.Api.sources.tmdb : null;
            const countries = sources && typeof sources.parseCountries === 'function' ? sources.parseCountries(movie) : [];
            const pg = sources && typeof sources.parsePG === 'function' ? sources.parsePG(movie) : '';

            if (create !== '0000') head.push(`<span>${create}</span>`);
            if (countries && countries.length) head.push(countries.join(', '));

            const genreText = (Array.isArray(movie.genres) && movie.genres.length)
                ? movie.genres.map((item) => Lampa.Utils.capitalizeFirstLetter(item.name)).join(' | ')
                : '';

            const runtimeText = movie.runtime ? Lampa.Utils.secondsToTime(movie.runtime * 60, true) : '';

            this.html.find('.new-interface-info__head').empty().append(head.join(', '));

            if (vote > 0) {
                this.html.find('.new-interface-info__rate').html(`<div class="full-start__rate"><div>${vote}</div><div>TMDB</div></div>`);
            } else {
                this.html.find('.new-interface-info__rate').empty();
            }

            this.html.find('.new-interface-info__genres').text(genreText);

            this.html.find('.new-interface-info__runtime').text(runtimeText);

            this.html.find('.new-interface-info__pg').html(pg ? `<span class="full-start__pg" style="font-size: 0.9em;">${pg}</span>` : '');

            const dot1 = this.html.find('.dot-rate-genre');
            const dot2 = this.html.find('.dot-genre-runtime');
            const dot3 = this.html.find('.dot-runtime-pg');

            this.html.find('.new-interface-info__genres').toggle(!!genreText);
            this.html.find('.new-interface-info__runtime').toggle(!!runtimeText);
            this.html.find('.new-interface-info__pg').toggle(!!pg);

            dot1.toggle(!!(vote > 0 && genreText));
            dot2.toggle(!!(genreText && (runtimeText || pg)));
            dot3.toggle(!!(runtimeText && pg));

            this.html.find('.new-interface-info__description').text(movie.overview || Lampa.Lang.translate('full_notext'));

            const titleNode = this.html.find('.new-interface-info__title');
            const titleText = movie.title || movie.name || '';
            const headText = head.join(', ');

            this.html.find('.new-interface-info__moved-head').text('').hide();
            this.html.find('.dot-rate-head').hide();
            this.html.find('.dot-head-genre').hide();

            titleNode.text(titleText);

            Logo.applyToInfo({
                wrapper: this.html,
                title: titleNode,
                head: this.html.find('.new-interface-info__head'),
                moved_head: this.html.find('.new-interface-info__moved-head'),
                dot_rate_head: this.html.find('.dot-rate-head'),
                dot_head_genre: this.html.find('.dot-head-genre'),
                dot_rate_genre: this.html.find('.dot-rate-genre'),
                head_text: headText,
                has_rate: vote > 0,
                has_genre: !!genreText
            }, movie, titleText);
        }

        empty() {
            if (!this.html) return;
            this.html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
            this.html.find('.new-interface-info__rate').empty();
        }

        destroy() {
            clearTimeout(this.timer);
            this.network.clear();
            this.loaded = {};
            this.currentUrl = null;

            if (this.html) {
                this.html.remove();
                this.html = null;
            }
        }
    }

    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
        var items = [];
        var html = $('<div class="new-interface"><img class="full-start__background"></div>');
        var active = 0;
        var info;
        var background_img = html.find('.full-start__background');
        var background_last = '';
        var background_timer;

        this.build = function (data) {
            info = new InfoPanel();
            info.create();
            scroll.minus(info.render());

            data.forEach((element) => {
                if (element.ready) return;
                element.ready = true;

                const card = new Lampa.InteractionLine(element, {
                    url: element.url,
                    card_small: true,
                    card_wide: true,
                    nomore: element.nomore
                });
                card.create();

                card.onFocus = (elem) => {
                    info.update(elem);
                    const new_bg = Lampa.Api.img(elem.backdrop_path, 'w1280');
                    clearTimeout(background_timer);
                    if (new_bg === background_last) return;
                    background_timer = setTimeout(() => {
                        background_img[0].src = new_bg;
                        background_last = new_bg;
                    }, 300);
                };

                scroll.append(card.render());
                items.push(card);

                // Логотип в постере сразу при создании
                const rendered = card.render(true);
                if (rendered && rendered[0] && element) {
                    Logo.applyToCard(rendered[0], element);
                }
            });

            html.append(info.render());
            html.append(scroll.render());

            this.activity.toggle();
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            items.forEach(i => i.destroy());
            scroll.destroy();
            if (info) info.destroy();
            html.remove();
        };
    }

    function startPluginV3() {
        initLogoSettings();
        setupCardLogoObserver();

        Lampa.Template.add('new_interface_style', `
            <style>
                :root{
                    --ni-logo-max-h: clamp(5em, 18vh, 12em);
                    --ni-card-logo-h: clamp(3em, 9vh, 5.5em);
                }
                .new-interface{--ni-info-h: 23em;}
                .new-interface-info{
                    padding: 1em;
                    height: var(--ni-info-h);
                }
                .new-interface-info__body{
                    padding-top: 0.5em;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
                }
                .new-interface-info__right{
                    padding-top: 6em; /* детали максимально низко */
                    justify-content: flex-end;
                }
                .new-interface-info__title{
                    font-size: clamp(3.5em, 6vw, 5.2em);
                }
                .new-interface-info__title-logo{
                    max-height: var(--ni-logo-max-h);
                }
                .new-interface-info__description{
                    -webkit-line-clamp: 4;
                }
                .new-interface .new-interface-card-logo{
                    padding: 0.5em;
                    background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                }
                .new-interface .new-interface-card-logo img{
                    max-height: var(--ni-card-logo-h);
                }
                /* остальные стили из предыдущей версии */
            </style>
        `);
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));

        window.plugin_interface_ready_v3 = true;
    }

    function startPlugin() {
        initLogoSettings();
        setupCardLogoObserver();

        const old = Lampa.InteractionMain;
        Lampa.InteractionMain = function (obj) {
            if (obj.source !== 'tmdb' && obj.source !== 'cub') return new old(obj);
            if (window.innerWidth < 767) return new old(obj);
            if (Lampa.Manifest.app_digital < 153) return new old(obj);
            return new component(obj);
        };

        Lampa.Template.add('new_interface_style', `
            <style>
                /* те же стили, что и в v3 */
                :root{
                    --ni-logo-max-h: clamp(5em, 18vh, 12em);
                    --ni-card-logo-h: clamp(3em, 9vh, 5.5em);
                }
                .new-interface-info__right{padding-top: 6em;}
                /* ... */
            </style>
        `);
        $('body').append(Lampa.Template.get('new_interface_style', {}, true));

        window.plugin_interface_ready = true;
    }

    if (Lampa.Manifest.app_digital >= 300) {
        startPluginV3();
    } else {
        startPlugin();
    }
})();
