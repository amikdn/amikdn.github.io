(function () {
    'use strict';
    if (typeof Lampa === 'undefined') return;
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
    function shouldUseNewInterface(object) {
        if (!object) return false;
        if (!(object.source === 'tmdb' || object.source === 'cub')) return false;
        if (window.innerWidth < 767) return false;
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
        if (Array.isArray(element.results)) {
            Lampa.Utils.extendItemsParams(element.results, {
                style: {
                    name: 'wide'
                }
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
            },
            onUpdate() {
                updateCardTitle(card);
            },
            onDestroy() {
                clearTimeout(card.__newInterfaceLabelTimer);
                if (card.__newInterfaceLabel && card.__newInterfaceLabel.parentNode) {
                    card.__newInterfaceLabel.parentNode.removeChild(card.__newInterfaceLabel);
                }
                card.__newInterfaceLabel = null;
                delete card.__newInterfaceCard;
            }
        });
        updateCardTitle(card);
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
        .new-interface {
            position: relative;
        }
        .new-interface .card.card--wide {
            width: 18.3em;
        }
        .new-interface-info {
            position: relative;
            padding: 1.5em;
            height: 24em;
        }
        .new-interface-info__body {
            width: 80%;
            padding-top: 1.1em;
        }
        .new-interface-info__head {
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 1em;
            font-size: 1.3em;
            min-height: 1em;
        }
        .new-interface-info__head span {
            color: #fff;
        }
        .new-interface-info__title {
            font-size: 4em;
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
            line-height: 1.3;
        }
        .new-interface-info__details {
            margin-bottom: 1.6em;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            min-height: 1.9em;
            font-size: 1.1em;
        }
        .new-interface-info__split {
            margin: 0 1em;
            font-size: 0.7em;
        }
        .new-interface-info__description {
            font-size: 1.2em;
            font-weight: 300;
            line-height: 1.5;
            overflow: hidden;
            -o-text-overflow: '.';
            text-overflow: '.';
            display: -webkit-box;
            -webkit-line-clamp: 4;
            line-clamp: 4;
            -webkit-box-orient: vertical;
            width: 70%;
        }
        .new-interface .card-more__box {
            padding-bottom: 95%;
        }
        .new-interface .full-start__background {
            height: 108%;
            top: -6em;
        }
        .new-interface .full-start__rate {
            font-size: 1.3em;
            margin-right: 0;
        }
        .new-interface .card__promo {
            display: none;
        }
        .new-interface .card.card--wide + .card-more .card-more__box {
            padding-bottom: 95%;
        }
        .new-interface .card.card--wide .card-watched {
            display: none !important;
        }
        .new-interface-card-title {
            margin-top: 0.6em;
            font-size: 1.05em;
            font-weight: 500;
            color: #fff;
            display: block;
            text-align: left;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            pointer-events: none;
        }
        body.light--version .new-interface-card-title {
            color: #111;
        }
        body.light--version .new-interface-info__body {
            width: 69%;
            padding-top: 1.5em;
        }
        body.light--version .new-interface-info {
            height: 25.3em;
        }
        body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.focus .card__view {
            animation: animation-card-focus 0.2s;
        }
        body.advanced--animation:not(.no--animation) .new-interface .card.card--wide.animate-trigger-enter .card__view {
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
                    <div class="new-interface-info__head"></div>
                    <div class="new-interface-info__title"></div>
                    <div class="new-interface-info__details"></div>
                    <div class="new-interface-info__description"></div>
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
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');
            this.html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
            Lampa.Background.change(Lampa.Utils.cardImgBackground(data));
            this.load(data);
        }
        load(data) {
            if (!data || !data.id) return;
            const source = data.source || 'tmdb';
            if (source !== 'tmdb' && source !== 'cub') return;
            if (!Lampa.TMDB || typeof Lampa.TMDB.api !== 'function' || typeof Lampa.TMDB.key !== 'function') return;
            const type = data.media_type === 'tv' || data.name ? 'tv' : 'movie';
            const language = Lampa.Storage.get('language');
            const url = Lampa.TMDB.api(`${type}/${data.id}?api_key=${Lampa.TMDB.key()}&append_to_response=content_ratings,release_dates&language=${language}`);
            this.currentUrl = url;
            if (this.loaded[url]) {
                this.draw(this.loaded[url]);
                return;
            }
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.network.clear();
                this.network.timeout(5000);
                this.network.silent(url, (movie) => {
                    this.loaded[url] = movie;
                    if (this.currentUrl === url) this.draw(movie);
                });
            }, 300);
        }
        draw(movie) {
            if (!movie || !this.html) return;
            const create = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
            const vote = parseFloat((movie.vote_average || 0) + '').toFixed(1);
            const head = [];
            const details = [];
            const sources = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb ? Lampa.Api.sources.tmdb : null;
            const countries = sources && typeof sources.parseCountries === 'function' ? sources.parseCountries(movie) : [];
            const pg = sources && typeof sources.parsePG === 'function' ? sources.parsePG(movie) : '';
            if (create !== '0000') head.push(`<span>${create}</span>`);
            if (countries && countries.length) head.push(countries.join(', '));
            if (vote > 0) {
                details.push(`<div class="full-start__rate"><div>${vote}</div><div>TMDB</div></div>`);
            }
            if (Array.isArray(movie.genres) && movie.genres.length) {
                details.push(movie.genres.map((item) => Lampa.Utils.capitalizeFirstLetter(item.name)).join(' | '));
            }
            if (movie.runtime) details.push(Lampa.Utils.secondsToTime(movie.runtime * 60, true));
            if (pg) details.push(`<span class="full-start__pg" style="font-size: 0.9em;">${pg}</span>`);
            this.html.find('.new-interface-info__head').empty().append(head.join(', '));
            this.html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
        }
        empty() {
            if (!this.html) return;
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
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
        html = $("<div class=\"new-interface-info\">\n <div class=\"new-interface-info__body\">\n <div class=\"new-interface-info__head\"></div>\n <div class=\"new-interface-info__title\"></div>\n <div class=\"new-interface-info__details\"></div>\n <div class=\"new-interface-info__description\"></div>\n </div>\n </div>");
      };
      this.update = function (data) {
        html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        html.find('.new-interface-info__title').text(data.title);
        html.find('.new-interface-info__description').text(data.overview || Lampa.Lang.translate('full_notext'));
        Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
        this.load(data);
      };
      this.draw = function (data) {
        var create = ((data.release_date || data.first_air_date || '0000') + '').slice(0, 4);
        var vote = parseFloat((data.vote_average || 0) + '').toFixed(1);
        var head = [];
        var details = [];
        var countries = Lampa.Api.sources.tmdb.parseCountries(data);
        var pg = Lampa.Api.sources.tmdb.parsePG(data);
        if (create !== '0000') head.push('<span>' + create + '</span>');
        if (countries.length > 0) head.push(countries.join(', '));
        if (vote > 0) details.push('<div class="full-start__rate"><div>' + vote + '</div><div>TMDB</div></div>');
        if (data.genres && data.genres.length > 0) details.push(data.genres.map(function (item) {
          return Lampa.Utils.capitalizeFirstLetter(item.name);
        }).join(' | '));
        if (data.runtime) details.push(Lampa.Utils.secondsToTime(data.runtime * 60, true));
        if (pg) details.push('<span class="full-start__pg" style="font-size: 0.9em;">' + pg + '</span>');
        html.find('.new-interface-info__head').empty().append(head.join(', '));
        html.find('.new-interface-info__details').html(details.join('<span class="new-interface-info__split">&#9679;</span>'));
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
        if (Lampa.Manifest.app_digital < 153) use = old_interface;
        return new use(object);
      };
      Lampa.Template.add('new_interface_style', "\n <style>\n .new-interface .card--small.card--wide {\n width: 18.3em;\n }\n \n .new-interface-info {\n position: relative;\n padding: 1.5em;\n height: 24em;\n }\n \n .new-interface-info__body {\n width: 80%;\n padding-top: 1.1em;\n }\n \n .new-interface-info__head {\n color: rgba(255, 255, 255, 0.6);\n margin-bottom: 1em;\n font-size: 1.3em;\n min-height: 1em;\n }\n \n .new-interface-info__head span {\n color: #fff;\n }\n \n .new-interface-info__title {\n font-size: 4em;\n font-weight: 600;\n margin-bottom: 0.3em;\n overflow: hidden;\n -o-text-overflow: \".\";\n text-overflow: \".\";\n display: -webkit-box;\n -webkit-line-clamp: 1;\n line-clamp: 1;\n -webkit-box-orient: vertical;\n margin-left: -0.03em;\n line-height: 1.3;\n }\n \n .new-interface-info__details {\n margin-bottom: 1.6em;\n display: -webkit-box;\n display: -webkit-flex;\n display: -moz-box;\n display: -ms-flexbox;\n display: flex;\n -webkit-box-align: center;\n -webkit-align-items: center;\n -moz-box-align: center;\n -ms-flex-align: center;\n align-items: center;\n -webkit-flex-wrap: wrap;\n -ms-flex-wrap: wrap;\n flex-wrap: wrap;\n min-height: 1.9em;\n font-size: 1.1em;\n }\n \n .new-interface-info__split {\n margin: 0 1em;\n font-size: 0.7em;\n }\n \n .new-interface-info__description {\n font-size: 1.2em;\n font-weight: 300;\n line-height: 1.5;\n overflow: hidden;\n -o-text-overflow: \".\";\n text-overflow: \".\";\n display: -webkit-box;\n -webkit-line-clamp: 4;\n line-clamp: 4;\n -webkit-box-orient: vertical;\n width: 70%;\n }\n \n .new-interface .card-more__box {\n padding-bottom: 95%;\n }\n \n .new-interface .full-start__background {\n height: 108%;\n top: -6em;\n }\n \n .new-interface .full-start__rate {\n font-size: 1.3em;\n margin-right: 0;\n }\n \n .new-interface .card__promo {\n display: none;\n }\n \n .new-interface .card.card--wide+.card-more .card-more__box {\n padding-bottom: 95%;\n }\n \n .new-interface .card.card--wide .card-watched {\n display: none !important;\n }\n \n body.light--version .new-interface-info__body {\n width: 69%;\n padding-top: 1.5em;\n }\n \n body.light--version .new-interface-info {\n height: 25.3em;\n }\n\n body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view{\n animation: animation-card-focus 0.2s\n }\n body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view{\n animation: animation-trigger-enter 0.2s forwards\n }\n </style>\n ");
      $('body').append(Lampa.Template.get('new_interface_style', {}, true));
    }
    if (!window.plugin_interface_ready) startPlugin();
})();