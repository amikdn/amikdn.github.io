// --- PREMIUM USERS ---

(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    

    // === Logo settings + loader (ported from 1_readable.js) ===
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
            param: { name: 'logo_hide_year', type: 'trigger', default: !0 },
            field: {
                name: 'Скрывать год и страну',
                description: 'Скрывать информацию над логотипом (переносит в строку деталей)'
            }
        });

        add({
            component: 'interface',
            param: { name: 'logo_use_text_height', type: 'trigger', default: !1 },
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
                    items: [{ title: 'Да', confirm: !0 }, { title: 'Нет' }],
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
            return !!Lampa.Storage.get('logo_use_text_height', !1);
        }

        fixedHeight() {
            return (Lampa.Storage.get('logo_height', '') || '') + '';
        }

        cacheKey(type, id, lang) {
            return `${LOGO_CACHE_PREFIX}${type}_${id}_${lang}`;
        }

        preload(item) {
            this.getLogoUrl(item, () => { }, { preload: true });
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

            // Сбрасываем к дефолту, управляемому CSS
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

            // очищаем прошлые таймеры
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

            // id для защиты от гонок
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

            // дефолтное состояние
            if (!this.enabled()) {
                if (ctx.wrapper && ctx.wrapper.removeClass) ctx.wrapper.removeClass('ni-hide-head');
                if (headNode) headNode.style.display = '';
                if (movedHeadNode) { movedHeadNode.textContent = ''; movedHeadNode.style.display = 'none'; }
                setDotsNoMoved();
                if (titleEl.textContent !== titleText) titleEl.textContent = titleText;
                return;
            }

            // нужен текст для измерений (logo_use_text_height)
            if (titleEl.textContent !== titleText) titleEl.textContent = titleText;
            const textHeightPx = titleEl.getBoundingClientRect ? Math.round(titleEl.getBoundingClientRect().height) : 0;

            setDotsNoMoved();

            this.getLogoUrl(item, (url) => {
                if (titleEl.__ni_logo_req_id !== requestId) return;
                if (!titleEl.isConnected) return;

                if (!url) {
                    // нет логотипа — текст
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

                const hideHead = !!Lampa.Storage.get('logo_hide_year', !0);
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

        applyToCard(card) {
            if (!card || !card.data || typeof card.render !== 'function') return;

            const jq = card.render(true);
            const root = (jq && jq[0]) ? jq[0] : jq;
            if (!root) return;

            const view = root.querySelector('.card__view') || root;
            const label = root.querySelector('.new-interface-card-title');
            const titleText = ((card.data.title || card.data.name || card.data.original_title || card.data.original_name || '') + '').trim();

            // защита от гонок
            const reqId = (card.__ni_logo_req_id || 0) + 1;
            card.__ni_logo_req_id = reqId;

            const removeLogo = () => {
                const exist = view.querySelector('.new-interface-card-logo');
                if (exist && exist.parentNode) exist.parentNode.removeChild(exist);
                if (label) label.style.display = '';
            };

            if (!this.enabled()) {
                removeLogo();
                return;
            }

            // подложка-обертка
            let wrap = view.querySelector('.new-interface-card-logo');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'new-interface-card-logo';
                view.appendChild(wrap);
            }

            // для измерений по высоте текста (если включено)
            let textHeightPx = 0;
            if (!this.fixedHeight() && this.useTextHeight() && label && label.getBoundingClientRect) {
                const rect = label.getBoundingClientRect();
                textHeightPx = Math.round(rect.height);
                if (!textHeightPx) textHeightPx = 24;
            }

            this.getLogoUrl(card.data, (url) => {
                if (card.__ni_logo_req_id !== reqId) return;
                if (!root.isConnected) return;

                if (!url) {
                    removeLogo();
                    return;
                }

                const img = new Image();
                img.alt = titleText;
                img.src = url;
                this.setImageSizing(img, textHeightPx);

                wrap.innerHTML = '';
                wrap.appendChild(img);

                if (label) label.style.display = 'none';
            });
        }


        getLogoUrlFromLogoJs(item, cb) {
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

                const url = Lampa.TMDB.api(`${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}&language=${lang}`);

                $.get(url, (res) => {
                    let filePath = null;

                    if (res && Array.isArray(res.logos) && res.logos.length) {
                        for (let i = 0; i < res.logos.length; i++) {
                            if (res.logos[i] && res.logos[i].iso_639_1 === lang) { filePath = res.logos[i].file_path; break; }
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

        syncFullHead(container, logoActive) {
            try {
                if (!container || typeof container.find !== 'function') return;

                const headNode = container.find('.full-start-new__head');
                const detailsNode = container.find('.full-start-new__details');

                if (!headNode || !headNode.length || !detailsNode || !detailsNode.length) return;

                const headEl = headNode[0];
                const detailsEl = detailsNode[0];

                if (!headEl || !detailsEl) return;

                const moved = detailsEl.querySelector ? detailsEl.querySelector('.logo-moved-head') : null;
                const movedSep = detailsEl.querySelector ? detailsEl.querySelector('.logo-moved-separator') : null;

                const wantMove = !!logoActive && !!Lampa.Storage.get('logo_hide_year', !0);

                // restore
                if (!wantMove) {
                    if (moved && moved.parentNode) moved.parentNode.removeChild(moved);
                    if (movedSep && movedSep.parentNode) movedSep.parentNode.removeChild(movedSep);

                    headEl.style.display = '';
                    headEl.style.opacity = '';
                    headEl.style.transition = '';
                    return;
                }

                // already moved
                if (moved) {
                    headEl.style.display = 'none';
                    return;
                }

                const html = (headEl.innerHTML || '').trim();
                if (!html) return;

                const headSpan = document.createElement('span');
                headSpan.className = 'logo-moved-head';
                headSpan.innerHTML = html;

                const sep = document.createElement('span');
                sep.className = 'full-start-new__split logo-moved-separator';
                sep.textContent = '●';

                // если уже есть элементы — добавим разделитель
                if (detailsEl.children && detailsEl.children.length > 0) detailsEl.appendChild(sep);
                detailsEl.appendChild(headSpan);

                // скрываем исходный head
                headEl.style.display = 'none';
            } catch (e) {}
        }

        applyToFull(activity, item) {
            try {
                if (!activity || typeof activity.render !== 'function' || !item) return;

                const container = activity.render();
                if (!container || typeof container.find !== 'function') return;

                const titleNode = container.find('.full-start-new__title, .full-start__title');
                if (!titleNode || !titleNode.length) return;

                const titleEl = titleNode[0];
                const titleText = ((item.title || item.name || item.original_title || item.original_name || '') + '').trim() || (titleNode.text() + '');

                // запоминаем исходный текст, чтобы корректно восстановить
                if (!titleEl.__ni_full_title_text) titleEl.__ni_full_title_text = titleText;

                const originalText = titleEl.__ni_full_title_text || titleText;

                // выключено — возвращаем текст
                if (!this.enabled()) {
								this.syncFullHead(container, false);
                    const existImg = titleEl.querySelector && titleEl.querySelector('img.new-interface-full-logo');
                    if (existImg) this.swapContent(titleEl, originalText);
                    else if (titleNode.text() !== originalText) titleNode.text(originalText);
                    return;
                }

                // синхронизация скрытия года/страны в полной карточке
                this.syncFullHead(container, false);

                // нужен текст для измерения высоты (logo_use_text_height)
                if (titleNode.text() !== originalText) titleNode.text(originalText);
                const textHeightPx = titleEl.getBoundingClientRect ? Math.round(titleEl.getBoundingClientRect().height) : 0;

                const requestId = (titleEl.__ni_logo_req_id || 0) + 1;
                titleEl.__ni_logo_req_id = requestId;

                this.getLogoUrlFromLogoJs(item, (url) => {
                    if (titleEl.__ni_logo_req_id !== requestId) return;
                    if (!titleEl.isConnected) return;

                    if (!url) {
                        // логотипа нет — текст
                        this.syncFullHead(container, false);
                        if (titleEl.querySelector && titleEl.querySelector('img.new-interface-full-logo')) this.swapContent(titleEl, originalText);
                        else if (titleNode.text() !== originalText) titleNode.text(originalText);
                        return;
                    }

                    const img = new Image();
                    img.className = 'new-interface-full-logo';
                    img.alt = originalText;
                    img.src = url;

                    this.setImageSizing(img, textHeightPx);

                    this.syncFullHead(container, true);

                    this.swapContent(titleEl, img);
                });
            } catch (e) {}
        }


        cleanupCard(card) {
            try {
                if (!card || typeof card.render !== 'function') return;

                const jq = card.render(true);
                const root = (jq && jq[0]) ? jq[0] : jq;

                if (root) {
                    const wrap = root.querySelector('.new-interface-card-logo');
                    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
                }

                delete card.__ni_logo_req_id;
            } catch (e) {}
        }
}

    const Logo = new LogoEngine();

    initLogoSettings();


    function hookFullTitleLogos() {
        if (window.__ni_full_logo_hooked) return;
        window.__ni_full_logo_hooked = true;

        if (!Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

        Lampa.Listener.follow('full', function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity) return;

                const data = (e.data && (e.data.movie || e.data)) ? (e.data.movie || e.data) : null;
                if (!data) return;

                Logo.applyToFull(e.object.activity, data);
            } catch (err) {}
        });
    }

    hookFullTitleLogos();

    function startPluginV3() {
        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;

        addStyleV3();

        const mainMap = Lampa.Maker.map('Main');

        if (!mainMap || !mainMap.Items || !mainMap.Create) return;

        wrap(mainMap.Items, 'onInit', function (original, args) {
            if (original) original.apply(this, args);
            this.__newInterfaceEnabled = shouldUseNewInterface(this && this.object);
        });

        wrap(mainMap.Create, 'onCreate', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const state = ensureState(this);
            state.attach();
        });

        wrap(mainMap.Create, 'onCreateAndAppend', function (original, args) {
            const element = args && args[0];
            if (this.__newInterfaceEnabled && element) {
                prepareLineData(element);
            }
            return original ? original.apply(this, args) : undefined;
        });

        wrap(mainMap.Items, 'onAppend', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const item = args && args[0];
            const element = args && args[1];
            if (item && element) attachLineHandlers(this, item, element);
        });

        wrap(mainMap.Items, 'onDestroy', function (original, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (original) original.apply(this, args);
        });
    }
 // Premium users
    function shouldUseNewInterface(object) {
        if (!object) return false;
        if (!(object.source === 'tmdb' || object.source === 'cub')) return false;
        if (window.innerWidth < 767) return false;
        if (typeof Lampa.Account !== 'undefined' && typeof Lampa.Account.hasPremium === 'function') {
            if (!Lampa.Account.hasPremium()) return false;
        }

        return true;
    }

    function ensureState(main) {
        if (main.__newInterfaceState) return main.__newInterfaceState;
        const state = createInterfaceState(main);
        main.__newInterfaceState = state;
        return state;
    }

    function createInterfaceState(main) {
        const info = new InterfaceInfo();
        info.create();

        const background = document.createElement('img');
        background.className = 'full-start__background';

        const state = {
            main,
            info,
            background,
            infoElement: null,
            backgroundTimer: null,
            backgroundLast: '',
            attached: false,
            attach() {
                if (this.attached) return;

                const container = main.render(true);
                if (!container) return;

                container.classList.add('new-interface','new-interface-h');

                if (!background.parentElement) {
                    container.insertBefore(background, container.firstChild || null);
                }

                const infoNode = info.render(true);
                this.infoElement = infoNode;

                if (infoNode && infoNode.parentNode !== container) {
                    if (background.parentElement === container) {
                        container.insertBefore(infoNode, background.nextSibling);
                    } else {
                        container.insertBefore(infoNode, container.firstChild || null);
                    }
                }

                main.scroll.minus(infoNode);

                this.attached = true;
            },
            update(data) {
                if (!data) return;
                info.update(data);
                this.updateBackground(data);
            },
            updateBackground(data) {
                const path = data && data.backdrop_path ? Lampa.Api.img(data.backdrop_path, 'w1280') : '';

                if (!path || path === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);

                this.backgroundTimer = setTimeout(() => {
                    background.classList.remove('loaded');

                    background.onload = () => background.classList.add('loaded');
                    background.onerror = () => background.classList.remove('loaded');

                    this.backgroundLast = path;

                    setTimeout(() => {
                        background.src = this.backgroundLast;
                    }, 300);
                }, 1000);
            },
            reset() {
                info.empty();
            },
            destroy() {
                clearTimeout(this.backgroundTimer);
                info.destroy();

                const container = main.render(true);
                if (container) container.classList.remove('new-interface');

                if (this.infoElement && this.infoElement.parentNode) {
                    this.infoElement.parentNode.removeChild(this.infoElement);
                }

                if (background && background.parentNode) {
                    background.parentNode.removeChild(background);
                }

                this.attached = false;
            }
        };

        return state;
    }

    function prepareLineData(element) {
        if (!element) return;

        // Оставляем постеры как в оригинальном interface.js (wide/горизонтальные)
        if (Array.isArray(element.results)) {
            Lampa.Utils.extendItemsParams(element.results, {
                style: { name: 'wide' }
            });
        }
    }
	
	   function updateCardTitle(card) {
        if (!card || typeof card.render !== 'function') return;

        const element = card.render(true);
        if (!element) return;

        if (!element.isConnected) {
            clearTimeout(card.__newInterfaceLabelTimer);
            card.__newInterfaceLabelTimer = setTimeout(() => updateCardTitle(card), 50);
            return;
        }

        clearTimeout(card.__newInterfaceLabelTimer);

        const text = (card.data && (card.data.title || card.data.name || card.data.original_title || card.data.original_name)) ? (card.data.title || card.data.name || card.data.original_title || card.data.original_name).trim() : '';

        const seek = element.querySelector('.new-interface-card-title');

        if (!text) {
            if (seek && seek.parentNode) seek.parentNode.removeChild(seek);
            card.__newInterfaceLabel = null;
            return;
        }

        let label = seek || card.__newInterfaceLabel;

        if (!label) {
            label = document.createElement('div');
            label.className = 'new-interface-card-title';
        }

        label.textContent = text;

        if (!label.parentNode || label.parentNode !== element) {
            if (label.parentNode) label.parentNode.removeChild(label);
            element.appendChild(label);
        }

        card.__newInterfaceLabel = label;
    }

    function decorateCard(state, card) {
        if (!card || card.__newInterfaceCard || typeof card.use !== 'function' || !card.data) return;

        card.__newInterfaceCard = true;

        card.params = card.params || {};
        card.params.style = card.params.style || {};
        if (!card.params.style.name) card.params.style.name = 'wide';
card.use({
            onFocus() {
                state.update(card.data);
            },
            onHover() {
                state.update(card.data);
            },
            onTouch() {
                state.update(card.data);
            },
			    onVisible() {
                updateCardTitle(card);
                Logo.applyToCard(card);
            },
            onUpdate() {
                updateCardTitle(card);
                Logo.applyToCard(card);
            },
            onDestroy() {
                Logo.cleanupCard(card);
                clearTimeout(card.__newInterfaceLabelTimer);
                if (card.__newInterfaceLabel && card.__newInterfaceLabel.parentNode) {
                    card.__newInterfaceLabel.parentNode.removeChild(card.__newInterfaceLabel);
                }
                card.__newInterfaceLabel = null;
                delete card.__newInterfaceCard;
            }
        });
		updateCardTitle(card);
        Logo.applyToCard(card);
    }

    function getCardData(card, element, index = 0) {
        if (card && card.data) return card.data;
        if (element && Array.isArray(element.results)) return element.results[index] || element.results[0];
        return null;
    }

    function getDomCardData(node) {
        if (!node) return null;

        let current = node && node.jquery ? node[0] : node;

        while (current && !current.card_data) {
            current = current.parentNode;
        }

        return current && current.card_data ? current.card_data : null;
    }

    function getFocusedCardData(line) {
        const container = line && typeof line.render === 'function' ? line.render(true) : null;
        if (!container || !container.querySelector) return null;

        const focus = container.querySelector('.selector.focus') || container.querySelector('.focus');

        return getDomCardData(focus);
    }

    function attachLineHandlers(main, line, element) {
        if (line.__newInterfaceLine) return;
        line.__newInterfaceLine = true;

        const state = ensureState(main);
        const applyToCard = (card) => decorateCard(state, card);

        // Предзагрузка логотипов TMDB для первых карточек в линии
        if (element && Array.isArray(element.results)) {
            element.results.slice(0, 5).forEach((item) => {
                state.info.load(item, { preload: true });
                Logo.preload(item);
                });
        }

        line.use({
            onInstance(card) {
                applyToCard(card);
            },
            onActive(card, itemData) {
                const current = getCardData(card, itemData);
                if (current) state.update(current);
            },
            onToggle() {
                setTimeout(() => {
                    const domData = getFocusedCardData(line);
                    if (domData) state.update(domData);
                }, 32);
            },
            onMore() {
                state.reset();
            },
            onDestroy() {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });

        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(applyToCard);
        }

        if (line.last) {
            const lastData = getDomCardData(line.last);
            if (lastData) state.update(lastData);
        }
    }

    function wrap(target, method, handler) {
        if (!target) return;
        const original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function (...args) {
            return handler.call(this, original, args);
        };
    }

    function addStyleV3() {
        if (addStyleV3.added) return;
        addStyleV3.added = true;

        Lampa.Template.add('new_interface_style_v3', `<style>:root{--ni-logo-max-h: clamp(3.6em, 11vh, 7.2em);--ni-card-logo-h: clamp(2.2em, 6vh, 3.8em);}
.new-interface{
    position: relative;
    --ni-info-h: 24em;
}

.new-interface .card.card--wide{
    width: 18.3em;
}

/* Плитка "Ещё" под wide */
.new-interface .card-more__box{
    padding-bottom: 95%;
}
.new-interface .card.card--wide + .card-more .card-more__box{
    padding-bottom: 95%;
}

/* Верхний инфо-блок */
.new-interface-info{
    position: relative;
    padding: 1.5em;
    height: var(--ni-info-h);
    overflow: hidden;
    z-index: 3; /* поверх линий, чтобы текст не перекрывался */
}

/* Общая подложка под текст: слева сильнее, справа мягче (под описание) */
.new-interface-info:before{
    display: none !important;
}

/* Двухколоночная раскладка: слева заголовок, справа описание */
.new-interface-info__body{
    position: relative;
    z-index: 1;
    width: min(96%, 78em);
    padding-top: 1.1em;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, .85fr);
    column-gap: clamp(16px, 3vw, 54px);
    align-items: stretch;
    height: 100%;
    box-sizing: border-box;
}

.new-interface-info__left,
.new-interface-info__right{
    min-width: 0;
    height: 100%;
}


/* Блок "мета + описание" прижимаем вниз вместе */
.new-interface-info__textblock{
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.55em;
    min-height: 0;
}

/* Чуть опускаем описание вниз, чтобы попасть в отмеченную область справа */
.new-interface-info__right{
    padding-top: clamp(0.2em, 2.2vh, 1.6em);
    padding-bottom: clamp(0.8em, 2.4vh, 2.0em);
    display: flex;
    flex-direction: column;
}

.new-interface-info__head{
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1em;
    font-size: 1.3em;
    min-height: 1em;
}

.new-interface-info__head span{
    color: #fff;
}

.new-interface-info__title{
    font-size: clamp(2.6em, 4.0vw, 3.6em);
    font-weight: 600;
    margin-bottom: 0.3em;
    overflow: hidden;
    -o-text-overflow: '.';
    text-overflow: '.';
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-left: -0.03em;
    line-height: 1.25;
}

.new-interface-info__title-logo{
    /* ВАРИАНТ B: увеличенный размер логотипа */
    max-width: 100%;
    /* Важно: ограничиваем высоту логотипа, чтобы он не "съедал" описание */
    max-height: var(--ni-logo-max-h);
    display: block;
    object-fit: contain;
}

.new-interface-info__meta{
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35em;
    min-height: 1em;
}

.new-interface-info__meta-top{
    display: flex;
    align-items: center;
    gap: 0.75em;
    flex-wrap: nowrap;
    min-height: 1.9em;
    min-width: 0;
}

.new-interface-info__rate{
    flex: 0 0 auto;
}

.new-interface-info__genres{
    flex: 1 1 auto;
    min-width: 0;
    font-size: 1.1em;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: '.';
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
}

.new-interface-info__runtime{
    flex: 0 0 auto;
    font-size: 1.05em;
    white-space: nowrap;
}

.new-interface-info__dot{
    flex: 0 0 auto;
    font-size: 0.85em;
    opacity: 0.75;
}

.new-interface-info__pg{
    flex: 0 0 auto;
    white-space: nowrap;
}

.new-interface-info__pg .full-start__pg{
    font-size: 0.95em;
}

/* Описание справа */
.new-interface-info__description{
    font-size: 0.87em;
    font-weight: 300;
    line-height: 1.38;
    color: rgba(255, 255, 255, 0.90);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
    margin-top: 0;
    overflow: hidden;
    -o-text-overflow: '.';
    text-overflow: '.';
    display: -webkit-box;
    -webkit-line-clamp: 7;
    line-clamp: 7;
    -webkit-box-orient: vertical;
    width: auto;
}

/* Фон */
.new-interface .full-start__background{
    height: 108%;
    top: -6em;
}

.new-interface .full-start__rate{
    font-size: 1.3em;
    margin-right: 0;
}

/* Safe-area (обычно 0 на TV/PC). Не двигаем линии вручную,
   чтобы не было «прыжков» и обрезания */
.new-interface .full-start__lines{
    padding-bottom: env(safe-area-inset-bottom, 0px);
}

.new-interface .card__promo{
    display: none;
}

.new-interface .card .card-watched{
    display: none !important;
        }

        
/* Логотип внутри карточки */
.new-interface .card .card__view{position: relative;}
.new-interface .new-interface-card-logo{
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 0.35em 0.45em;
    box-sizing: border-box;
    pointer-events: none;
    background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0));
}
.new-interface .new-interface-card-logo img{
    display: block;
    max-width: 100%;
    max-height: var(--ni-card-logo-h);
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left bottom;
}

/* Логотип в заголовке полной карточки (как logo.js) */
.full-start-new__title img.new-interface-full-logo,
.full-start__title img.new-interface-full-logo{
    display: block;
    max-width: 100%;
    max-height: var(--ni-logo-max-h);
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left bottom;
    margin-top: 0.25em;
}


/* Перенос "год+страна" в детали при логотипе */
.new-interface-info.ni-hide-head .new-interface-info__head{display:none;}
.new-interface-info__moved-head{
    flex: 0 0 auto;
    min-width: 0;
    font-size: 1.1em;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.92;
    display: none;
}
.new-interface-info__dot.dot-rate-head,
.new-interface-info__dot.dot-head-genre{display:none;}
.new-interface-card-title {
            margin-top: 0.6em;
            font-size: 1.05em;
            font-weight: 500;
            color: #fff;
            display: block;
            text-align: center;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            pointer-events: none;
        }

        body.light--version .new-interface-card-title {
            color: #111;
		}

body.light--version .new-interface-info__body{
    width: min(92%, 72em);
    padding-top: 1.5em;
}

@media (max-height: 820px){
    .new-interface-info__right{
        padding-top: clamp(0.15em, 1.8vh, 1.2em);
    }

    .new-interface-info__title{
        font-size: clamp(2.4em, 3.6vw, 3.1em);
    }

    .new-interface-info__description{
        -webkit-line-clamp: 6;
        line-clamp: 6;
        font-size: 0.83em;
        margin-top: 0;
    }
}

body.advanced--animation:not(.no--animation) .new-interface .card.focus .card__view,
body.advanced--animation:not(.no--animation) .new-interface .card--small.focus .card__view{
    animation: animation-card-focus 0.2s;
}

body.advanced--animation:not(.no--animation) .new-interface .card.animate-trigger-enter .card__view,
body.advanced--animation:not(.no--animation) .new-interface .card--small.animate-trigger-enter .card__view{
    animation: animation-trigger-enter 0.2s forwards;
}

/* --- Horizontal cards: move line headers and posters up --- */
.new-interface-h{
  --ni-line-head-shift: -2vh;  /* ≈ 2% of screen height */
  --ni-line-body-shift: -3vh;  /* ≈ 3% of screen height */
}
.new-interface-h .items-line__head{
  position: relative;
  top: var(--ni-line-head-shift);
  z-index: 2;
}
.new-interface-h .items-line__body > .scroll.scroll--horizontal{
  position: relative;
  top: var(--ni-line-body-shift);
  z-index: 1;
}

</style>`);

        $('body').append(Lampa.Template.get('new_interface_style_v3', {}, true));
    }

    class InterfaceInfo {
        constructor() {
            this.html = null;
            this.timer = null;
            this.network = new Lampa.Reguest();
            this.loaded = {};
        }

        create() {
            if (this.html) return;

            this.html = $(`<div class="new-interface-info">
                <div class="new-interface-info__body">
                    <div class="new-interface-info__left">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                    </div>
                    <div class="new-interface-info__right">
                        <div class=\"new-interface-info__textblock\">
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

        load(data, options) {
            if (!data || !data.id) return;

            const source = data.source || 'tmdb';
            if (source !== 'tmdb' && source !== 'cub') return;
            if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;

            const preload = options && options.preload;

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

            // TMDB плашка — перед жанрами
            if (vote > 0) {
                this.html.find('.new-interface-info__rate').html(`<div class="full-start__rate"><div>${vote}</div><div>TMDB</div></div>`);
            } else {
                this.html.find('.new-interface-info__rate').empty();
            }

            this.html.find('.new-interface-info__genres').text(genreText);

            // Длительность — перед PG (в нижней строке)
            this.html.find('.new-interface-info__runtime').text(runtimeText);

            this.html.find('.new-interface-info__pg').html(pg ? `<span class="full-start__pg" style="font-size: 0.9em;">${pg}</span>` : '');

            // Разделители-точки: показываем только если по бокам есть данные
            const dot1 = this.html.find('.dot-rate-genre');
            const dot2 = this.html.find('.dot-genre-runtime');
            const dot3 = this.html.find('.dot-runtime-pg');

            // Прячем пустые элементы, чтобы строка не "ломалась"
            this.html.find('.new-interface-info__genres').toggle(!!genreText);
            this.html.find('.new-interface-info__runtime').toggle(!!runtimeText);
            this.html.find('.new-interface-info__pg').toggle(!!pg);

            dot1.toggle(!!(vote > 0 && genreText));
            // если runtime нет, но PG есть — dot2 станет разделителем между жанрами и PG
            dot2.toggle(!!(genreText && (runtimeText || pg)));
            dot3.toggle(!!(runtimeText && pg));

            // Описание
            this.html.find('.new-interface-info__description').text(movie.overview || Lampa.Lang.translate('full_notext'));

            
            // Логотип (метод загрузки/кеш/настройки как в 1_readable.js)
            const titleNode = this.html.find('.new-interface-info__title');
            const titleText = movie.title || movie.name || '';
            const headText = head.join(', ');

            // дефолт: год/страна сверху
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
if (Lampa.Manifest.app_digital >= 300) {
        startPluginV3();
        return;
    }

    function create() {
      var html;
      var timer;
      var network = new Lampa.Reguest();
      var loaded = {};

      this.create = function () {
        html = $(`<div class="new-interface-info">
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
      };

      this.update = function (data) {
        html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
        html.find('.new-interface-info__rate').empty();
        html.find('.new-interface-info__pg').empty();
        html.find('.new-interface-info__title').text(data.title || data.name || '');
        html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
        Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
        this.load(data);
      };

      this.draw = function (data) {
        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
        var head = [];
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        var pg = Lampa.Api.sources.tmdb.parsePG(data);

        if (create !== '0000') head.push('<span>' + create + '</span>');
        if (countries.length > 0) head.push(countries.join(', '));

        var genreText = data.genres && data.genres.length > 0 ? data.genres.map(function (item) {
          return Lampa.Utils.capitalizeFirstLetter(item.name);
        }).join(' | ') : '';

        var runtimeText = data.runtime ? Lampa.Utils.secondsToTime(data.runtime * 60, true) : '';

        html.find('.new-interface-info__head').empty().append(head.join(', '));

        if (vote > 0) html.find('.new-interface-info__rate').html('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');else html.find('.new-interface-info__rate').empty();

        html.find('.new-interface-info__genres').text(genreText);

        html.find('.new-interface-info__runtime').text(runtimeText);

        html.find('.new-interface-info__pg').html(pg ? '<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>' : '');

        var dot1 = html.find('.dot-rate-genre');
        var dot2 = html.find('.dot-genre-runtime');
        var dot3 = html.find('.dot-runtime-pg');

        html.find('.new-interface-info__genres').toggle(!!genreText);
        html.find('.new-interface-info__runtime').toggle(!!runtimeText);
        html.find('.new-interface-info__pg').toggle(!!pg);

        dot1.toggle(!!(vote > 0 && genreText));
        dot2.toggle(!!(genreText && (runtimeText || pg)));
        dot3.toggle(!!(runtimeText && pg));

        // Логотип (метод загрузки/кеш/настройки как в 1_readable.js)
        var titleNode = html.find('.new-interface-info__title');
        var titleText = (data.title || data.name || '') + '';
        var headText = head.join(', ');

        html.find('.new-interface-info__moved-head').text('').hide();
        html.find('.dot-rate-head').hide();
        html.find('.dot-head-genre').hide();

        titleNode.text(titleText);

        Logo.applyToInfo({
          wrapper: html,
          title: titleNode,
          head: html.find('.new-interface-info__head'),
          moved_head: html.find('.new-interface-info__moved-head'),
          dot_rate_head: html.find('.dot-rate-head'),
          dot_head_genre: html.find('.dot-head-genre'),
          dot_rate_genre: html.find('.dot-rate-genre'),
          head_text: headText,
          has_rate: vote > 0,
          has_genre: !!genreText
        }, data, titleText);
};

      this.load = function (data) {
        var _this = this;

        clearTimeout(timer);
        var url = Lampa.TMDB.api((data.name ? 'tv' : 'movie') + '/' + data.id + '?api_key=' + Lampa.TMDB.key() + '&append_to_response=content_ratings,release_dates&language=' + Lampa.Storage.get('language'));
        if (loaded[url]) return this.draw(loaded[url]);
        timer = setTimeout(function () {
          network.clear();
          network.timeout(5000);
          network.silent(url, function (movie) {
            loaded[url] = movie;

            _this.draw(movie);
          });
        }, 300);
      };

      this.render = function () {
        return html;
      };

      this.empty = function () {};

      this.destroy = function () {
        html.remove();
        loaded = {};
        html = null;
      };
    }

    function component(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true,
        scroll_by_item: true
      });
      var items = [];
      var html = $('<div class="new-interface"><img class="full-start__background"></div>');
      var active = 0;
      var newlampa = Lampa.Manifest.app_digital >= 166;
      var info;
      var lezydata;
      var viewall = Lampa.Storage.field('card_views_type') == 'view' || Lampa.Storage.field('navigation_type') == 'mouse';
      var background_img = html.find('.full-start__background');
      var background_last = '';
      var background_timer;

      this.create = function () {};

      this.empty = function () {
        var button;

        if (object.source == 'tmdb') {
          button = $('<div class="empty__footer"><div class="simple-button selector">' + Lampa.Lang.translate('change_source_on_cub') + '</div></div>');
          button.find('.selector').on('hover:enter', function () {
            Lampa.Storage.set('source', 'cub');
            Lampa.Activity.replace({
              source: 'cub'
            });
          });
        }

        var empty = new Lampa.Empty();
        html.append(empty.render(button));
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
      };

      this.loadNext = function () {
        var _this = this;

        if (this.next && !this.next_wait && items.length) {
          this.next_wait = true;
          this.next(function (new_data) {
            _this.next_wait = false;
            new_data.forEach(_this.append.bind(_this));
            Lampa.Layer.visible(items[active + 1].render(true));
          }, function () {
            _this.next_wait = false;
          });
        }
      };

      this.push = function () {};

      this.build = function (data) {
        var _this2 = this;

        lezydata = data;
        info = new create(object);
        info.create();
        scroll.minus(info.render());
        data.slice(0, viewall ? data.length : 2).forEach(this.append.bind(this));
        html.append(info.render());
        html.append(scroll.render());

        if (newlampa) {
          Lampa.Layer.update(html);
          Lampa.Layer.visible(scroll.render(true));
          scroll.onEnd = this.loadNext.bind(this);

          scroll.onWheel = function (step) {
            if (!Lampa.Controller.own(_this2)) _this2.start();
            if (step > 0) _this2.down();else if (active > 0) _this2.up();
          };
        }

        this.activity.loader(false);
        this.activity.toggle();
      };

      this.background = function (elem) {
        var new_background = Lampa.Api.img(elem.backdrop_path, 'w1280');
        clearTimeout(background_timer);
        if (new_background == background_last) return;
        background_timer = setTimeout(function () {
          background_img.removeClass('loaded');

          background_img[0].onload = function () {
            background_img.addClass('loaded');
          };

          background_img[0].onerror = function () {
            background_img.removeClass('loaded');
          };

          background_last = new_background;
          setTimeout(function () {
            background_img[0].src = background_last;
          }, 300);
        }, 1000);
      };

      this.append = function (element) {
        var _this3 = this;

        if (element.ready) return;
        element.ready = true;
        var item = new Lampa.InteractionLine(element, {
          url: element.url,
          card_small: true,
          cardClass: element.cardClass,
          genres: object.genres,
          object: object,
          card_wide: true,
          nomore: element.nomore
        });
        item.create();
        item.onDown = this.down.bind(this);
        item.onUp = this.up.bind(this);
        item.onBack = this.back.bind(this);

        item.onToggle = function () {
          active = items.indexOf(item);
        };

        if (this.onMore) item.onMore = this.onMore.bind(this);

        item.onFocus = function (elem) {
          info.update(elem);

          _this3.background(elem);
        };

        item.onHover = function (elem) {
          info.update(elem);

          _this3.background(elem);
        };

        item.onFocusMore = info.empty.bind(info);
        scroll.append(item.render());
        items.push(item);
      };

      this.back = function () {
        Lampa.Activity.backward();
      };

      this.down = function () {
        active++;
        active = Math.min(active, items.length - 1);
        if (!viewall) lezydata.slice(0, active + 2).forEach(this.append.bind(this));
        items[active].toggle();
        scroll.update(items[active].render());
      };

      this.up = function () {
        active--;

        if (active < 0) {
          active = 0;
          Lampa.Controller.toggle('head');
        } else {
          items[active].toggle();
          scroll.update(items[active].render());
        }
      };

      this.start = function () {
        var _this4 = this;

        Lampa.Controller.add('content', {
          link: this,
          toggle: function toggle() {
            if (_this4.activity.canRefresh()) return false;

            if (items.length) {
              items[active].toggle();
            }
          },
          update: function update() {},
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            Navigator.move('right');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: this.back
        });
        Lampa.Controller.toggle('content');
      };

      this.refresh = function () {
        this.activity.loader(true);
        this.activity.need_refresh = true;
      };

      this.pause = function () {};

      this.stop = function () {};

      this.render = function () {
        return html;
      };

      this.destroy = function () {
        network.clear();
        Lampa.Arrays.destroy(items);
        scroll.destroy();
        if (info) info.destroy();
        html.remove();
        items = null;
        network = null;
        lezydata = null;
      };
    }

    function startPlugin() {
      window.plugin_interface_ready = true;
      var old_interface = Lampa.InteractionMain;
      var new_interface = component;

      Lampa.InteractionMain = function (object) {
        var use = new_interface;
        if (!(object.source == 'tmdb' || object.source == 'cub')) use = old_interface;
        if (window.innerWidth < 767) use = old_interface;
        // Отключена проверка премиума — оставляем новый интерфейс
        if (Lampa.Manifest.app_digital < 153) use = old_interface;
        return new use(object);
      };

      Lampa.Template.add('new_interface_style', `
        <style>:root{--ni-logo-max-h: clamp(3.6em, 11vh, 7.2em);--ni-card-logo-h: clamp(2.2em, 6vh, 3.8em);}
.new-interface{
    position: relative;
    --ni-info-h: 24em;
}

.new-interface .card--small.card--wide{
    width: 18.3em;
}

.new-interface .card-more__box{
    padding-bottom: 95%;
}
.new-interface .card--small.card--wide + .card-more .card-more__box{
    padding-bottom: 95%;
}

/* Верхний инфо-блок */
.new-interface-info{
    position: relative;
    padding: 1.5em;
    height: var(--ni-info-h);
    overflow: hidden;
    z-index: 3; /* поверх линий, чтобы текст не перекрывался */
}

/* Общая подложка под текст: слева сильнее, справа мягче (под описание) */
.new-interface-info:before{
    display: none !important;
}

/* Двухколоночная раскладка: слева заголовок, справа описание */
.new-interface-info__body{
    position: relative;
    z-index: 1;
    width: min(96%, 78em);
    padding-top: 1.1em;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, .85fr);
    column-gap: clamp(16px, 3vw, 54px);
    align-items: stretch;
    height: 100%;
    box-sizing: border-box;
}

.new-interface-info__left,
.new-interface-info__right{
    min-width: 0;
    height: 100%;
}


/* Блок "мета + описание" прижимаем вниз вместе */
.new-interface-info__textblock{
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.55em;
    min-height: 0;
}

/* Чуть опускаем описание вниз, чтобы попасть в отмеченную область справа */
.new-interface-info__right{
    padding-top: clamp(0.2em, 2.2vh, 1.6em);
    padding-bottom: clamp(0.8em, 2.4vh, 2.0em);
    display: flex;
    flex-direction: column;
}

.new-interface-info__head{
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1em;
    font-size: 1.3em;
    min-height: 1em;
}

.new-interface-info__head span{
    color: #fff;
}

.new-interface-info__title{
    font-size: clamp(2.6em, 4.0vw, 3.6em);
    font-weight: 600;
    margin-bottom: 0.3em;
    overflow: hidden;
    -o-text-overflow: '.';
    text-overflow: '.';
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-left: -0.03em;
    line-height: 1.25;
}

.new-interface-info__title-logo{
    max-width: 100%;
    /* Важно: ограничиваем высоту логотипа, чтобы он не "съедал" описание */
    max-height: var(--ni-logo-max-h);
    display: block;
    object-fit: contain;
}


/* Описание справа */
.new-interface-info__description{
    font-size: 0.87em;
    font-weight: 300;
    line-height: 1.38;
    color: rgba(255, 255, 255, 0.90);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
    margin-top: 0;
    overflow: hidden;
    -o-text-overflow: '.';
    text-overflow: '.';
    display: -webkit-box;
    -webkit-line-clamp: 7;
    line-clamp: 7;
    -webkit-box-orient: vertical;
    width: auto;
}

/* Фон */
.new-interface .full-start__background{
    height: 108%;
    top: -6em;
}

.new-interface .full-start__rate{
    font-size: 1.3em;
    margin-right: 0;
}

/* Safe-area (обычно 0 на TV/PC). Не двигаем линии вручную,
   чтобы не было «прыжков» и обрезания */
.new-interface .full-start__lines{
    padding-bottom: env(safe-area-inset-bottom, 0px);
}

.new-interface .card__promo{
    display: none;
}

.new-interface .card .card-watched{
    display: none !important;
}


/* Логотип внутри карточки */
.new-interface .card .card__view{position: relative;}
.new-interface .new-interface-card-logo{
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: 0.35em 0.45em;
    box-sizing: border-box;
    pointer-events: none;
    background: linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0));
}
.new-interface .new-interface-card-logo img{
    display: block;
    max-width: 100%;
    max-height: var(--ni-card-logo-h);
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left bottom;
}

/* Логотип в заголовке полной карточки (как logo.js) */
.full-start-new__title img.new-interface-full-logo,
.full-start__title img.new-interface-full-logo{
    display: block;
    max-width: 100%;
    max-height: var(--ni-logo-max-h);
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: left bottom;
    margin-top: 0.25em;
}


/* Перенос "год+страна" в детали при логотипе */
.new-interface-info.ni-hide-head .new-interface-info__head{display:none;}
.new-interface-info__moved-head{
    flex: 0 0 auto;
    min-width: 0;
    font-size: 1.1em;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0.92;
    display: none;
}
.new-interface-info__dot.dot-rate-head,
.new-interface-info__dot.dot-head-genre{display:none;}
body.light--version .new-interface-info__body{
    width: min(92%, 72em);
    padding-top: 1.5em;
}

@media (max-height: 820px){
    .new-interface-info__right{
        padding-top: clamp(0.15em, 1.8vh, 1.2em);
    }

    .new-interface-info__title{
        font-size: clamp(2.4em, 3.6vw, 3.1em);
    }

    .new-interface-info__description{
        -webkit-line-clamp: 6;
        line-clamp: 6;
        font-size: 0.83em;
        margin-top: 0;
    }
}

body.advanced--animation:not(.no--animation) .new-interface .card.focus .card__view,
body.advanced--animation:not(.no--animation) .new-interface .card--small.focus .card__view{
    animation: animation-card-focus 0.2s;
}

body.advanced--animation:not(.no--animation) .new-interface .card.animate-trigger-enter .card__view,
body.advanced--animation:not(.no--animation) .new-interface .card--small.animate-trigger-enter .card__view{
    animation: animation-trigger-enter 0.2s forwards;
}

/* --- Horizontal cards: move line headers and posters up --- */
.new-interface-h{
  --ni-line-head-shift: -2vh;  /* ≈ 2% of screen height */
  --ni-line-body-shift: -3vh;  /* ≈ 3% of screen height */
}
.new-interface-h .items-line__head{
  position: relative;
  top: var(--ni-line-head-shift);
  z-index: 2;
}
.new-interface-h .items-line__body > .scroll.scroll--horizontal{
  position: relative;
  top: var(--ni-line-body-shift);
  z-index: 1;
}

</style>
    `);
      $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    if (!window.plugin_interface_ready && !window.plugin_interface_ready_v3) startPlugin();

})();
