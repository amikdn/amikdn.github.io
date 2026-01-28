(function () {
    'use strict';

    // === 1. Локализация ===
    Lampa.Lang.add({
        interface_mod_new_plugin_name: { ru: 'Интерфейс MOD', en: 'Interface MOD', uk: 'Інтерфейс MOD' },
        interface_mod_new_show_movie_type: { ru: 'Показывать лейблы типа', en: 'Show type labels', uk: 'Показувати мітки типу' },
        interface_mod_new_show_movie_type_desc: { ru: 'Показывать лейблы "Фильм" и "Сериал"', en: 'Show Movie and Series labels', uk: 'Показувати мітки "Фільм" і "Серіал"' },
        interface_mod_new_label_serial: { ru: 'Сериал', en: 'Series', uk: 'Серіал' },
        interface_mod_new_label_movie: { ru: 'Фильм', en: 'Movie', uk: 'Фільм' },
        interface_mod_new_info_panel: { ru: 'Новая инфо-панель', en: 'New info panel', uk: 'Нова інфо-панель' },
        interface_mod_new_info_panel_desc: { ru: 'Красивая инфо-панель с подсчетом серий', en: 'Beautiful info panel with episode count', uk: 'Красива інфо-панель з підрахунком серій' },
        interface_mod_new_colored_ratings: { ru: 'Цветной рейтинг', en: 'Colored rating', uk: 'Кольоровий рейтинг' },
        interface_mod_new_colored_ratings_desc: { ru: 'Выделять рейтинг цветом', en: 'Highlight rating by color', uk: 'Виділяти рейтинг кольором' },
        interface_mod_new_theme_select: { ru: 'Тема интерфейса', en: 'Interface theme', uk: 'Тема інтерфейсу' },
        interface_mod_new_buttons_style_mode: { ru: 'Стиль кнопок', en: 'Button style', uk: 'Стиль кнопок' },
        interface_mod_new_theme_default: { ru: 'По умолчанию', en: 'Default', uk: 'За замовчуванням' },
        interface_mod_new_theme_neon: { ru: 'Неон', en: 'Neon', uk: 'Неон' },
        interface_mod_new_theme_emerald: { ru: 'Изумруд', en: 'Emerald', uk: 'Смарагдовий' },
        interface_mod_new_theme_sunset: { ru: 'Закат', en: 'Sunset', uk: 'Захід' },
        interface_mod_new_theme_aurora: { ru: 'Аврора', en: 'Aurora', uk: 'Аврора' },
        interface_mod_new_theme_bywolf: { ru: 'Cosmic', en: 'Cosmic', uk: 'Космічна' }
    });

    // === 2. Настройки ===
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default')
    };

    // === 3. Вспомогательные функции ===
    function plural(n, one, two, five) {
        n = Math.abs(n);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    function formatDuration(minutes) {
        if (!minutes) return '';
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        var res = '';
        if (h > 0) res += h + ' ' + plural(h, 'час', 'часа', 'часов');
        if (m > 0) res += (res ? ' ' : '') + m + ' ' + plural(m, 'мин', 'мин', 'мин');
        return res;
    }

    function calculateAvgDuration(movie) {
        if (!movie) return 0;
        var total = 0, count = 0;
        if (movie.episode_run_time && Array.isArray(movie.episode_run_time)) {
            for (var i = 0; i < movie.episode_run_time.length; i++) {
                if (movie.episode_run_time[i] > 0 && movie.episode_run_time[i] <= 200) {
                    total += movie.episode_run_time[i]; count++;
                }
            }
        } else if (movie.runtime) {
            return movie.runtime;
        }
        return count > 0 ? Math.round(total / count) : 0;
    }

    // === 4. Функционал: Лейблы "Фильм/Сериал" ===
    function changeMovieTypeLabels() {
        if (!settings.show_movie_type) return;

        if (!document.getElementById('movie_type_styles_new')) {
            var style = document.createElement('style');
            style.id = 'movie_type_styles_new';
            style.innerHTML = `
                .content-label-new {
                    position: absolute !important; left: 0.3em !important; bottom: 0.3em !important;
                    background: rgba(0,0,0,0.7) !important; color: #fff !important;
                    font-size: 1.3em !important; padding: 0.2em 0.5em !important;
                    -webkit-border-radius: 1em !important; border-radius: 1em !important;
                    font-weight: 700; z-index: 10 !important; pointer-events: none;
                }
                .serial-label-new { color: #3498db !important; }
                .movie-label-new { color: #2ecc71 !important; }
            `;
            document.head.appendChild(style);
        }

        function addLabel(card) {
            if (!card || card.querySelector('.content-label-new')) return;
            var text = (card.textContent || '').toLowerCase();
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica)/i.test(text)) return;

            var isTv = card.classList.contains('card--tv');
            if (!isTv) {
                var typeEl = card.querySelector('.card__type');
                if (typeEl && typeEl.textContent.trim() === 'TV') isTv = true;
            }

            var label = document.createElement('div');
            label.className = 'content-label-new ' + (isTv ? 'serial-label-new' : 'movie-label-new');
            label.textContent = isTv ? Lampa.Lang.translate('interface_mod_new_label_serial') : Lampa.Lang.translate('interface_mod_new_label_movie');
            
            var view = card.querySelector('.card__view');
            if (view) view.appendChild(label);
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' && e.data.movie) {
                var m = e.data.movie;
                var poster = $(e.object.activity.render()).find('.full-start__poster');
                if (poster.length) {
                    poster.find('.content-label-new').remove();
                    var isTv = m.number_of_seasons > 0 || (m.seasons && m.seasons.length > 0) || m.type === 'tv' || m.type === 'serial';
                    poster.css('position', 'relative').append(
                        $('<div class="content-label-new ' + (isTv ? 'serial-label-new' : 'movie-label-new') + '"></div>')
                        .text(isTv ? Lampa.Lang.translate('interface_mod_new_label_serial') : Lampa.Lang.translate('interface_mod_new_label_movie'))
                    );
                }
            }
        });

        var observer = new MutationObserver(function (mutations) {
            requestAnimationFrame(function () {
                for (var i = 0; i < mutations.length; i++) {
                    var nodes = mutations[i].addedNodes;
                    for (var j = 0; j < nodes.length; j++) {
                        var node = nodes[j];
                        if (node.nodeType === 1) {
                            if (node.classList && node.classList.contains('card')) addLabel(node);
                            else if (node.querySelectorAll) {
                                var cards = node.querySelectorAll('.card');
                                for (var k = 0; k < cards.length; k++) addLabel(cards[k]);
                            }
                        }
                    }
                }
            });
        });

        setTimeout(function () {
            var target = document.querySelector('.scroll__body') || document.body;
            observer.observe(target, { childList: true, subtree: true });
        }, 500);
    }

    // === 5. Функционал: Умная инфо-панель ===
    function newInfoPanel() {
        if (!settings.info_panel) return;

        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(function () {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;

                    var movie = data.data.movie;
                    var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');
                    var container = $('<div>').css({ 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '0.4em', 'align-items': 'center' });

                    // --- Логика для Сериалов ---
                    if (isTvShow && movie.seasons && Array.isArray(movie.seasons)) {
                        var totalEpisodes = 0;
                        var airedEpisodes = 0;
                        var now = new Date();

                        movie.seasons.forEach(function (s) {
                            if (s.episode_count) totalEpisodes += s.episode_count;
                            if (s.episodes && Array.isArray(s.episodes)) {
                                s.episodes.forEach(function (ep) {
                                    if (ep.air_date && new Date(ep.air_date) <= now) airedEpisodes++;
                                });
                            } else if (s.air_date && new Date(s.air_date) <= now) {
                                airedEpisodes += s.episode_count || 0;
                            }
                        });

                        if (totalEpisodes > 0) {
                            var epText = '';
                            if (airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                                epText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серия', 'Серии', 'Серий') + ' из ' + totalEpisodes;
                            } else {
                                epText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серия', 'Серии', 'Серий');
                            }
                            container.append($('<span>').css({ 'background': 'rgba(46, 204, 113, 0.8)', 'color': '#fff', 'padding': '0.2em 0.6em', 'border-radius': '0.3em', 'font-size': '1.3em' }).text(epText));
                        }

                        // Метка следующей серии
                        if (movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
                            var nextDate = new Date(movie.next_episode_to_air.air_date);
                            var today = new Date(); today.setHours(0,0,0,0); nextDate.setHours(0,0,0,0);
                            var diff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
                            var nextText = '';
                            if (diff === 0) nextText = 'Сегодня новая серия';
                            else if (diff === 1) nextText = 'Завтра новая серия';
                            else if (diff > 1) nextText = 'Через ' + diff + ' ' + plural(diff, 'день', 'дня', 'дней');
                            
                            if (nextText) {
                                container.append($('<span>').css({ 'background': 'rgba(230, 126, 34, 0.8)', 'color': '#fff', 'padding': '0.2em 0.6em', 'border-radius': '0.3em', 'font-size': '1.3em' }).text(nextText));
                            }
                        }

                        // Длительность серии
                        var avg = calculateAvgDuration(movie);
                        if (avg > 0) {
                            container.append($('<span>').css({ 'background': 'rgba(52, 152, 219, 0.8)', 'color': '#fff', 'padding': '0.2em 0.6em', 'border-radius': '0.3em', 'font-size': '1.3em' }).text('~' + formatDuration(avg)));
                        }
                    } 
                    // --- Логика для Фильмов ---
                    else if (!isTvShow && movie.runtime) {
                        container.append($('<span>').css({ 'background': 'rgba(52, 152, 219, 0.8)', 'color': '#fff', 'padding': '0.2em 0.6em', 'border-radius': '0.3em', 'font-size': '1.3em' }).text(formatDuration(movie.runtime)));
                    }

                    // Обновляем DOM
                    details.empty().append(container);
                }, 300);
            }
        });
    }

    // === 6. Функционал: Цветной рейтинг ===
    function updateVoteColors() {
        if (!settings.colored_ratings) return;
        var colorize = function (el) {
            var txt = $(el).text().trim();
            var m = txt.match(/(\d+(\.\d+)?)/);
            if (!m) return;
            var v = parseFloat(m[0]);
            var c = v >= 8 ? '#2ecc71' : (v >= 6 ? '#3498db' : (v >= 4 ? '#f1c40f' : '#e74c3c'));
            $(el).css('color', c);
        };
        $(".card__vote, .full-start__rate, .info__rate").each(function () { colorize(this); });
    }

    if (settings.colored_ratings) {
        var vObserver = new MutationObserver(function () { requestAnimationFrame(updateVoteColors); });
        setTimeout(function(){ var s = document.querySelector('.scroll__body'); if(s) vObserver.observe(s, {childList:true, subtree:true}); }, 1000);
    }
    Lampa.Listener.follow('full', function (e) { if (e.type === 'complite' && settings.colored_ratings) setTimeout(updateVoteColors, 200); });

    // === 7. Функционал: Кнопки (Main2 / Все) ===
    function showAllButtons() {
        if (settings.buttons_style_mode === 'default') return;

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    var target = $('.full-start-new__buttons, .full-start__buttons');
                    if (!target.length) return;

                    // Режим ALL: просто показываем кнопки
                    if (settings.buttons_style_mode === 'all') {
                        target.find('.full-start__button').show().css({ 'display': 'inline-block' });
                    }
                    
                    // Режим Main2: Кастомные большие кнопки
                    if (settings.buttons_style_mode === 'main2') {
                        // Собираем кнопки
                        var onlineBtns = target.find('.view--online');
                        var torrentBtns = target.find('.view--torrent');
                        var others = target.find('.full-start__button').not('.view--online, .view--torrent');
                        
                        // Скрываем оригинальные
                        target.find('.full-start__button').hide();

                        // Создаем кнопки
                        var btnOnline = $('<div class="full-start__button selector custom-online-btn" tabindex="0">Онлайн</div>')
                            .css({ 'background': 'linear-gradient(90deg, #2f2f2fd1, #00b2ff)', 'margin': '0.5em' })
                            .on('hover:enter', function() {
                                if (onlineBtns.length === 1) onlineBtns.eq(0).trigger('hover:enter');
                                else if (onlineBtns.length > 1) {
                                    // Простое меню выбора без сложной логики иконок
                                    var items = [];
                                    onlineBtns.each(function(i){ items.push({ title: $(this).text(), selected: i===0 }); });
                                    Lampa.Select.show({
                                        title: 'Выберите источник',
                                        items: items,
                                        onSelect: function(it){ onlineBtns.eq(it.selected).trigger('hover:enter'); }
                                    });
                                } else Lampa.Noty.show('Нет источников');
                            });

                        var btnTorrent = $('<div class="full-start__button selector custom-torrent-btn" tabindex="0">Торрент</div>')
                            .css({ 'background': 'linear-gradient(90deg, #2f2f2fd1, #00ff40)', 'margin': '0.5em' })
                            .on('hover:enter', function() {
                                if (torrentBtns.length) torrentBtns.eq(0).trigger('hover:enter');
                                else Lampa.Noty.show('Нет торрентов');
                            });
                        
                        var btnMore = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                            .css({ 'background': '#2f2f2fd1', 'margin': '0.5em', 'font-weight':'bold' })
                            .on('hover:enter', function() {
                                var items = [];
                                others.each(function(){
                                    var t = $(this).text().trim();
                                    if(t) items.push({ title: t, elem: this });
                                });
                                if(items.length){
                                    Lampa.Select.show({
                                        title: 'Ещё',
                                        items: items,
                                        onSelect: function(it){ $(it.elem).trigger('hover:enter'); }
                                    });
                                }
                            });

                        target.prepend(btnOnline).prepend(btnTorrent).prepend(btnMore);
                        target.css({ 'display': 'flex', 'flex-wrap': 'wrap' });
                    }
                }, 300);
            }
        });
    }

    // === 8. Функционал: Темы (Полный набор) ===
    function applyTheme(name) {
        var old = document.getElementById('interface_mod_theme');
        if (old) old.remove();
        if (name === 'default') return;

        var css = '';
        if (name === 'neon') {
            css = `body{background:#0d0221}.menu__item.focus,.full-start__button.focus{background:linear-gradient(90deg,#ff00ff,#00ffff)!important;color:#fff;box-shadow:0 0 15px #ff00ff}.card.focus .card__view::after{border-color:#ff00ff;box-shadow:0 0 20px #00ffff}`;
        } else if (name === 'emerald') {
            css = `body{background:#1a2a3a}.menu__item.focus,.full-start__button.focus{background:linear-gradient(90deg,#43cea2,#185a9d)!important;color:#fff}`;
        } else if (name === 'sunset') {
            css = `body{background:linear-gradient(135deg,#2d1f3d,#614385)}.menu__item.focus{background:linear-gradient(90deg,#ff6e7f,#bfe9ff)!important;color:#2d1f3d}`;
        } else if (name === 'aurora') {
            css = `body{background:linear-gradient(135deg,#0f2027,#2c5364)}.menu__item.focus{background:linear-gradient(90deg,#aa4b6b,#3b8d99)!important}`;
        } else if (name === 'bywolf') {
            css = `body{background:linear-gradient(135deg,#090227,#261447)}.menu__item.focus{background:linear-gradient(90deg,#fc00ff,#00dbde)!important;box-shadow:0 0 30px rgba(252,0,255,0.3)}`;
        }

        if (css) {
            var s = document.createElement('style');
            s.id = 'interface_mod_theme';
            s.textContent = css;
            document.head.appendChild(s);
        }
    }

    // === 9. Настройки ===
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"/></svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: { name: 'show_movie_type', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('interface_mod_new_show_movie_type'), description: Lampa.Lang.translate('interface_mod_new_show_movie_type_desc') },
            onChange: function (v) {
                settings.show_movie_type = v; Lampa.Storage.set('interface_mod_new_show_movie_type', v);
                $('.content-label-new').remove(); if(v) changeMovieTypeLabels();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: { name: 'info_panel', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('interface_mod_new_info_panel'), description: Lampa.Lang.translate('interface_mod_new_info_panel_desc') },
            onChange: function (v) { settings.info_panel = v; Lampa.Storage.set('interface_mod_new_info_panel', v); Lampa.Activity.active().reload(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: { name: 'colored_ratings', type: 'trigger', default: true },
            field: { name: Lampa.Lang.translate('interface_mod_new_colored_ratings'), description: L.Theme_mod_new_colored_ratings_desc },
            onChange: function (v) { settings.colored_ratings = v; Lampa.Storage.set('interface_mod_new_colored_ratings', v); updateVoteColors(); }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'buttons_style_mode',
                type: 'select',
                values: { default: Lampa.Lang.translate('interface_mod_new_theme_default'), all: 'Show All', main2: 'Main2' },
                default: 'default'
            },
            field: { name: Lampa.Lang.translate('interface_mod_new_buttons_style_mode') },
            onChange: function (v) { settings.buttons_style_mode = v; Lampa.Storage.set('interface_mod_new_buttons_style_mode', v); }
        });

        Lampa.SettingsApi.addParam({
            component: 'interface_mod_new',
            param: {
                name: 'theme_select',
                type: 'select',
                values: {
                    default: Lampa.Lang.translate('interface_mod_new_theme_default'),
                    neon: Lampa.Lang.translate('interface_mod_new_theme_neon'),
                    emerald: Lampa.Lang.translate('interface_mod_new_theme_emerald'),
                    sunset: Lampa.Lang.translate('interface_mod_new_theme_sunset'),
                    aurora: Lampa.Lang.translate('interface_mod_new_theme_aurora'),
                    bywolf: Lampa.Lang.translate('interface_mod_new_theme_bywolf')
                },
                default: 'default'
            },
            field: { name: Lampa.Lang.translate('interface_mod_new_theme_select') },
            onChange: function (v) { settings.theme = v; Lampa.Storage.set('interface_mod_new_theme_select', v); applyTheme(v); }
        });
    }

    // === 10. Запуск ===
    function start() {
        addSettings();
        if (settings.show_movie_type) changeMovieTypeLabels();
        newInfoPanel();
        if (settings.colored_ratings) updateVoteColors();
        applyTheme(settings.theme);
        showAllButtons();
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });
})();