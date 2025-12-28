// --- PREMIUM USERS ---

(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;


markSmartTV();

function markSmartTV(){
    try{
        var ua = (navigator && navigator.userAgent) ? navigator.userAgent : '';
        var isTv = false;

        if (typeof Lampa !== 'undefined' && Lampa.Platform) {
            try{
                if (typeof Lampa.Platform.is === 'function') {
                    isTv = isTv || Lampa.Platform.is('tv') || Lampa.Platform.is('smarttv') || Lampa.Platform.is('tizen') || Lampa.Platform.is('webos') || Lampa.Platform.is('netcast');
                }
                if (typeof Lampa.Platform.tv === 'function') {
                    isTv = isTv || !!Lampa.Platform.tv();
                }
                if (typeof Lampa.Platform.device === 'string') {
                    isTv = isTv || /tv|tizen|webos|netcast|smart/i.test(Lampa.Platform.device);
                }
            }catch(e){}
        }

        if (!isTv) {
            isTv = /(SMART-TV|SmartTV|HbbTV|NetCast|Tizen|Web0S|WebOS|Viera|BRAVIA|Android TV|AFTB|AFTT|AFTM|Fire TV)/i.test(ua);
        }

        if (isTv && document && document.documentElement) {
            document.documentElement.classList.add('is-smarttv');
        }
    }catch(e){}
}
   
    const LOGO_CACHE_PREFIX = 'logo_cache_width_based_v1_';

    function applyLogoCssVars() {
        try {
            const h = (Lampa.Storage && typeof Lampa.Storage.get === 'function') ? (Lampa.Storage.get('logo_height', '') || '') : '';
            const root = document.documentElement;

            if (h) root.style.setProperty('--ni-logo-max-h', h);
            else root.style.removeProperty('--ni-logo-max-h');
        } catch (e) { }
    }

    function applyCaptionsClass(container) {
        try {
            if (!container) return;
            const show = !!Lampa.Storage.get('ni_card_captions', true);
            container.classList.toggle('ni-hide-captions', !show);
        } catch (e) { }
    }

    function applyCaptionsToAll() {
        try {
            document.querySelectorAll('.new-interface').forEach((el) => applyCaptionsClass(el));
        } catch (e) { }
    }

    function initInterface2Settings() {
        if (window.__ni_interface2_settings_ready) return;
        window.__ni_interface2_settings_ready = true;

        if (!Lampa.SettingsApi || typeof Lampa.SettingsApi.addParam !== 'function') return;

        const add = (cfg) => { try { Lampa.SettingsApi.addParam(cfg); } catch (e) { } };

        // from 1_readable.js (safe to re-add; duplicates are ignored by try/catch)
        add({
            component: 'interface',
            param: { name: 'logo_glav', type: 'select', values: { 1: 'Скрыть', 0: 'Отображать' }, default: '0' },
            field: { name: 'Логотипы вместо названий', description: 'Отображает логотипы фильмов вместо текста' },
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
            field: { name: 'Язык логотипа', description: 'Приоритетный язык для поиска логотипа' }
        });

        add({
            component: 'interface',
            param: { name: 'logo_size', type: 'select', values: { w300: 'w300', w500: 'w500', w780: 'w780', original: 'Оригинал' }, default: 'original' },
            field: { name: 'Размер логотипа', description: 'Разрешение загружаемого изображения' }
        });

        // real visual height control (added ранее)
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
            field: { name: 'Высота логотипов', description: 'Максимальная высота логотипов (в инфо-блоке и в полной карточке)' },
            onChange: applyLogoCssVars
        });

        add({
            component: 'interface',
            param: { name: 'logo_animation_type', type: 'select', values: { js: 'JavaScript', css: 'CSS' }, default: 'css' },
            field: { name: 'Тип анимации логотипов', description: 'Способ анимации логотипов' }
        });

        add({
            component: 'interface',
            param: { name: 'logo_hide_year', type: 'trigger', default: !0 },
            field: { name: 'Скрывать год и страну', description: 'Скрывать информацию над логотипом' }
        });

        add({
            component: 'interface',
            param: { name: 'logo_use_text_height', type: 'trigger', default: !1 },
            field: { name: 'Логотип по высоте текста', description: 'Размер логотипа равен высоте текста' }
        });

        add({
            component: 'interface',
            param: { name: 'logo_clear_cache', type: 'button' },
            field: { name: 'Сбросить кеш логотипов', description: 'Нажмите для очистки кеша изображений' },
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

        // NEW: captions under cards (bottom labels)
        add({
            component: 'interface',
            param: { name: 'ni_card_captions', type: 'trigger', default: true },
            field: { name: 'Подписи под карточками', description: 'Показывать / скрывать названия (и год) под постерами в линиях' },
            onChange: function () {
                applyCaptionsToAll();
            }
        });

        applyLogoCssVars();
        applyCaptionsToAll();
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

        cacheKey(type, id, lang) {
            return `${LOGO_CACHE_PREFIX}${type}_${id}_${lang}`;
        }

        flush(key, value) {
            const list = this.pending[key] || [];
            delete this.pending[key];
            list.forEach((fn) => { try { if (fn) fn(value); } catch (e) { } });
        }

        // resolve logo from already loaded movie.details (append_to_response=images)
        resolveFromImages(item, lang) {
            try {
                if (!item || !item.images || !Array.isArray(item.images.logos) || !item.images.logos.length) return null;

                const logos = item.images.logos.slice();
                const pick = (iso) => {
                    for (let i = 0; i < logos.length; i++) {
                        if (logos[i] && logos[i].iso_639_1 === iso) return logos[i].file_path;
                    }
                    return null;
                };

                return pick(lang) || pick('en') || (logos[0] && logos[0].file_path) || null;
            } catch (e) {
                return null;
            }
        }

        // main logo url getter with caching; if item has images.logos -> no extra request
        getLogoUrl(item, cb) {
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

                const fromDetails = this.resolveFromImages(item, lang);
                if (fromDetails) {
                    const size = this.size();
                    const normalized = (fromDetails + '').replace('.svg', '.png');
                    const logoUrl = Lampa.TMDB.image('/t/p/' + size + normalized);
                    localStorage.setItem(key, logoUrl);
                    return cb && cb(logoUrl);
                }

                if (this.pending[key]) {
                    this.pending[key].push(cb);
                    return;
                }

                this.pending[key] = [cb];

                if (typeof $ === 'undefined' || !$.get) {
                    localStorage.setItem(key, 'none');
                    this.flush(key, null);
                    return;
                }

                const url = Lampa.TMDB.api(`${type}/${item.id}/images?api_key=${Lampa.TMDB.key()}&include_image_language=${lang},en,null`);

                $.get(url, (res) => {
                    let filePath = null;

                    if (res && Array.isArray(res.logos) && res.logos.length) {
                        // приоритет: выбранный язык -> en -> первый доступный
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

        setImageSizing(img, heightPx) {
            if (!img) return;

            img.style.height = '';
            img.style.width = '';
            img.style.maxHeight = '';
            img.style.maxWidth = '';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'left bottom';

            if (this.useTextHeight() && heightPx && heightPx > 0 && !(Lampa.Storage.get('logo_height', '') || '')) {
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

        // keep "hide year/country" behavior for full card (.full-start-new__head -> .full-start-new__details)
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

                if (!wantMove) {
                    if (moved && moved.parentNode) moved.parentNode.removeChild(moved);
                    if (movedSep && movedSep.parentNode) movedSep.parentNode.removeChild(movedSep);

                    headEl.style.display = '';
                    headEl.style.opacity = '';
                    headEl.style.transition = '';
                    return;
                }

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

                if (detailsEl.children && detailsEl.children.length > 0) detailsEl.appendChild(sep);
                detailsEl.appendChild(headSpan);

                headEl.style.display = 'none';
            } catch (e) { }
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

                if (!titleEl.__ni_full_title_text) titleEl.__ni_full_title_text = titleText;
                const originalText = titleEl.__ni_full_title_text || titleText;

                if (!this.enabled()) {
                    this.syncFullHead(container, false);
                    const existImg = titleEl.querySelector && titleEl.querySelector('img.new-interface-full-logo');
                    if (existImg) this.swapContent(titleEl, originalText);
                    else if (titleNode.text() !== originalText) titleNode.text(originalText);
                    return;
                }

                // prepare measurement
                if (titleNode.text() !== originalText) titleNode.text(originalText);
                const textHeightPx = titleEl.getBoundingClientRect ? Math.round(titleEl.getBoundingClientRect().height) : 0;

                const requestId = (titleEl.__ni_logo_req_id || 0) + 1;
                titleEl.__ni_logo_req_id = requestId;

                this.getLogoUrl(item, (url) => {
                    if (titleEl.__ni_logo_req_id !== requestId) return;
                    if (!titleEl.isConnected) return;

                    if (!url) {
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

              // === НОВОЕ: скрываем слоган (tagline) под логотипом ===
                    const taglineNode = container.find('.full-start-new__tagline, .full--tagline');
                    if (taglineNode && taglineNode.length) {
                        taglineNode.css('display', 'none');
                    }
                });
            } catch (e) { }
        }
    }

    const Logo = new LogoEngine();
    initInterface2Settings();

    function applyInfoTitleLogo(wrapper, titleNode, headNode, movie, titleText) {
        try {
            if (!titleNode || !titleNode.length) return;
            const titleEl = titleNode[0];
            if (!titleEl) return;

            const reqId = (titleEl.__ni_logo_req_id || 0) + 1;
            titleEl.__ni_logo_req_id = reqId;

            // default text
            if (!Logo.enabled()) {
                if (headNode && headNode.length) headNode.css('display', '');
                if (wrapper && wrapper.removeClass) wrapper.removeClass('ni-hide-head');
                if (titleEl.querySelector && titleEl.querySelector('img')) Logo.swapContent(titleEl, titleText);
                else titleNode.text(titleText);
                return;
            }

            // measure text height
            titleNode.text(titleText);
            const textHeightPx = titleEl.getBoundingClientRect ? Math.round(titleEl.getBoundingClientRect().height) : 0;

            Logo.getLogoUrl(movie, (url) => {
                if (titleEl.__ni_logo_req_id !== reqId) return;
                if (!titleEl.isConnected) return;

                if (!url) {
                    if (headNode && headNode.length) headNode.css('display', '');
                    if (wrapper && wrapper.removeClass) wrapper.removeClass('ni-hide-head');
                    if (titleEl.querySelector && titleEl.querySelector('img')) Logo.swapContent(titleEl, titleText);
                    else titleNode.text(titleText);
                    return;
                }

                const img = new Image();
                img.className = 'new-interface-info__title-logo';
                img.alt = titleText;
                img.src = url;

                Logo.setImageSizing(img, textHeightPx);

                const hideHead = !!Lampa.Storage.get('logo_hide_year', !0);
                if (hideHead && headNode && headNode.length) headNode.css('display', 'none');
                else if (headNode && headNode.length) headNode.css('display', '');

                Logo.swapContent(titleEl, img);
            });
        } catch (e) { }
    }

    function hookFullTitleLogos() {
        if (window.__ni_interface2_full_logo_hooked) return;
        window.__ni_interface2_full_logo_hooked = true;

        if (!Lampa.Listener || typeof Lampa.Listener.follow !== 'function') return;

        Lampa.Listener.follow('full', function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity) return;

                const data = (e.data && (e.data.movie || e.data)) ? (e.data.movie || e.data) : null;
                if (!data) return;

                Logo.applyToFull(e.object.activity, data);
            } catch (err) { }
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

    // Проверка на премиум удалена — интерфейс доступен всем
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

                container.classList.add('new-interface');

                applyCaptionsClass(container);

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
        // Оставляем стандартный стиль карточек (вертикальные постеры),
        // поэтому ничего не переопределяем.
        return;
    }

    function decorateCard(state, card) {
        if (!card || card.__newInterfaceCard || typeof card.use !== 'function' || !card.data) return;

        card.__newInterfaceCard = true;

        card.params = card.params || {};
        card.params.style = card.params.style || {};
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
            onDestroy() {
                delete card.__newInterfaceCard;
            }
        });
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

        Lampa.Template.add('new_interface_style_v3', `<style>
.new-interface{
    position: relative;
    /* На SMART-TV используем стандартные размеры постеров (без принудительного card-w) */
    --ni-info-h: clamp(15em, 34vh, 24em);
}
html:not(.is-smarttv) .new-interface{
    --ni-card-w: clamp(120px, 7.6vw, 170px);
}

/* Размер карточек и плитки "Ещё" */
html:not(.is-smarttv) .new-interface .card--small,
html:not(.is-smarttv) .new-interface .card-more{
    width: var(--ni-card-w) !important;
}

/* Вертикальные постеры: используем стандартный стиль Lampa.
   Подправляем только плитку "Ещё", чтобы была вертикальной */
html:not(.is-smarttv) .new-interface .card-more__box{
    padding-bottom: 150%;
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
    align-items: start;
}

.new-interface-info__left,
.new-interface-info__right{
    min-width: 0;
}

/* Чуть опускаем описание вниз, чтобы попасть в отмеченную область справа */
.new-interface-info__right{
    padding-top: clamp(0.2em, 2.2vh, 1.6em);
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
    max-height: var(--ni-logo-max-h, clamp(2.4em, 7vh, 4.2em));
    display: block;
    object-fit: contain;
}

.new-interface-info__meta{
    margin-bottom: 0.55em;
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


/* Логотип в полной карточке (full) */
.new-interface-full-logo{
    max-height: var(--ni-logo-max-h, 125px);
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
}

/* Скрытие подписей под карточками (в линиях) */
.new-interface.ni-hide-captions .card__view ~ .card__title,
.new-interface.ni-hide-captions .card__view ~ .card__name,
.new-interface.ni-hide-captions .card__view ~ .card__text,
.new-interface.ni-hide-captions .card__view ~ .card__details,
.new-interface.ni-hide-captions .card__view ~ .card__description,
.new-interface.ni-hide-captions .card__view ~ .card__subtitle,
.new-interface.ni-hide-captions .card__view ~ .card__year,
.new-interface.ni-hide-captions .card__bottom,
.new-interface.ni-hide-captions .card__caption{
    display: none !important;
}

/* Гарантированно скрывать подписи/год (в т.ч. если класс отличается) */
.new-interface.ni-hide-captions .card > *:not(.card__view):not(.card__promo){
    display: none !important;
}


/* Описание справа */
.new-interface-info__description{
    font-size: 0.87em;
    font-weight: 300;
    line-height: 1.38;
    color: rgba(255, 255, 255, 0.90);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
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

/* Поднять заголовки линий ("Сейчас смотрят", "Продолжить просмотр" и т.п.) */
.new-interface .items-line__head{
    position: relative;
    z-index: 5;
}
html:not(.is-smarttv) .new-interface .items-line__head{
    transform: translateY(-2vh);
}



/* Поднять ленты постеров на 3% выше (3vh). Двигаем только саму ленту карточек, заголовок строки не трогаем. */
.new-interface{
    --ni-lines-up: 0vh;
}
html:not(.is-smarttv) .new-interface{
    --ni-lines-up: 3vh;
}
.new-interface .items-line__body > .scroll.scroll--horizontal,
.new-interface .items-line__body .scroll.scroll--horizontal{
    position: relative;
    top: calc(var(--ni-lines-up) * -1);
}


.new-interface .card__promo{
    display: none;
}

.new-interface .card .card-watched{
    display: none !important;
}

body.light--version .new-interface-info__body{
    width: min(92%, 72em);
    padding-top: 1.5em;
}

@media (max-height: 820px){
    .new-interface{
        --ni-info-h: clamp(13em, 30vh, 20em);
    }
    html:not(.is-smarttv) .new-interface{
        --ni-card-w: clamp(110px, 7.2vw, 160px);
    }

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
                        <div class="new-interface-info__meta">
                            <div class="new-interface-info__meta-top">
                                <div class="new-interface-info__rate"></div>
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
            this.html.find('.new-interface-info__title').empty();
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
            const shortLang = (language || 'en').split('-')[0];
            const url = Lampa.TMDB.api(`${type}/${data.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates,images&include_image_language=${shortLang},en,null&language=${language}`);

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

            const titleNode = this.html.find('.new-interface-info__title');
            const headNode = this.html.find('.new-interface-info__head');
            const titleText = movie.title || movie.name || '';

            // Не устанавливаем текст, если логотипы включены — оставляем пусто до подгрузки изображения
            if (Logo.enabled()) {
                titleNode.empty();
            } else {
                titleNode.text(titleText);
            }

            applyInfoTitleLogo(this.html, titleNode, headNode, movie, titleText);
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
                        html = $("<div class=\"new-interface-info\">\n            <div class=\"new-interface-info__body\">\n                <div class=\"new-interface-info__left\">\n                    <div class=\"new-interface-info__head\"></div>\n                    <div class=\"new-interface-info__title\"></div>\n                </div>\n                <div class=\"new-interface-info__right\">\n                    <div class=\"new-interface-info__meta\">\n                        <div class=\"new-interface-info__meta-top\">\n                            <div class=\"new-interface-info__rate\"></div>\n                            <span class=\"new-interface-info__dot dot-rate-genre\">&#9679;</span>\n                            <div class=\"new-interface-info__genres\"></div>\n                            <span class=\"new-interface-info__dot dot-genre-runtime\">&#9679;</span>\n                            <div class=\"new-interface-info__runtime\"></div>\n                            <span class=\"new-interface-info__dot dot-runtime-pg\">&#9679;</span>\n                            <div class=\"new-interface-info__pg\"></div>\n                        </div>\n                    </div>\n                    <div class=\"new-interface-info__description\"></div>\n                </div>\n            </div>\n        </div>");
      };

      this.update = function (data) {
        html.find('.new-interface-info__head,.new-interface-info__genres,.new-interface-info__runtime').text('---');
        html.find('.new-interface-info__rate').empty();
        html.find('.new-interface-info__pg').empty();
        html.find('.new-interface-info__title').text(data.title);
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

        var titleNode = html.find('.new-interface-info__title');
        var headNode = html.find('.new-interface-info__head');
        var titleText = (data.title || data.name || '') + '';
        titleNode.text(titleText);
        applyInfoTitleLogo(html, titleNode, headNode, data, titleText);
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

      applyCaptionsClass(html[0]);
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
          card_wide: false,
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
        <style>
.new-interface{
    position: relative;
    /* На SMART-TV используем стандартные размеры постеров (без принудительного card-w) */
    --ni-info-h: clamp(15em, 34vh, 24em);
}
html:not(.is-smarttv) .new-interface{
    --ni-card-w: clamp(120px, 7.6vw, 170px);
}

/* Размер карточек и плитки "Ещё" */
html:not(.is-smarttv) .new-interface .card--small,
html:not(.is-smarttv) .new-interface .card-more{
    width: var(--ni-card-w) !important;
}

/* Вертикальные постеры: используем стандартный стиль Lampa.
   Подправляем только плитку "Ещё", чтобы была вертикальной */
html:not(.is-smarttv) .new-interface .card-more__box{
    padding-bottom: 150%;
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
    align-items: start;
}

.new-interface-info__left,
.new-interface-info__right{
    min-width: 0;
}

/* Чуть опускаем описание вниз, чтобы попасть в отмеченную область справа */
.new-interface-info__right{
    padding-top: clamp(0.2em, 2.2vh, 1.6em);
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
    max-height: var(--ni-logo-max-h, clamp(2.4em, 7vh, 4.2em));
    display: block;
    object-fit: contain;
}



/* Логотип в полной карточке (full) */
.new-interface-full-logo{
    max-height: var(--ni-logo-max-h, 125px);
    width: auto;
    max-width: 100%;
    object-fit: contain;
    display: block;
}

/* Скрытие подписей под карточками (в линиях) */
.new-interface.ni-hide-captions .card__view ~ .card__title,
.new-interface.ni-hide-captions .card__view ~ .card__name,
.new-interface.ni-hide-captions .card__view ~ .card__text,
.new-interface.ni-hide-captions .card__view ~ .card__details,
.new-interface.ni-hide-captions .card__view ~ .card__description,
.new-interface.ni-hide-captions .card__view ~ .card__subtitle,
.new-interface.ni-hide-captions .card__view ~ .card__year,
.new-interface.ni-hide-captions .card__bottom,
.new-interface.ni-hide-captions .card__caption{
    display: none !important;
}

/* Гарантированно скрывать подписи/год (в т.ч. если класс отличается) */
.new-interface.ni-hide-captions .card > *:not(.card__view):not(.card__promo){
    display: none !important;
}


/* Описание справа */
.new-interface-info__description{
    font-size: 0.87em;
    font-weight: 300;
    line-height: 1.38;
    color: rgba(255, 255, 255, 0.90);
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
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



/* Поднять ленты постеров на 3% выше (3vh). Двигаем только саму ленту карточек, заголовок строки не трогаем. */
.new-interface{
    --ni-lines-up: 0vh;
}
html:not(.is-smarttv) .new-interface{
    --ni-lines-up: 3vh;
}
.new-interface .items-line__body > .scroll.scroll--horizontal,
.new-interface .items-line__body .scroll.scroll--horizontal{
    position: relative;
    top: calc(var(--ni-lines-up) * -1);
}


.new-interface .card__promo{
    display: none;
}

.new-interface .card .card-watched{
    display: none !important;
}

body.light--version .new-interface-info__body{
    width: min(92%, 72em);
    padding-top: 1.5em;
}

@media (max-height: 820px){
    .new-interface{
        --ni-info-h: clamp(13em, 30vh, 20em);
    }
    html:not(.is-smarttv) .new-interface{
        --ni-card-w: clamp(110px, 7.2vw, 160px);
    }

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
</style>
    `);
      $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }

    if (!window.plugin_interface_ready && !window.plugin_interface_ready_v3) startPlugin();

})();
