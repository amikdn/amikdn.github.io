(function () {
    'use strict';
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;
    var style = document.createElement('style');
    style.textContent = `
    .season-info-label {
        position: absolute;
        color: white;
        padding: 0.25em 0.45em;
        font-size: 1.1em;
        z-index: 10;
        white-space: nowrap;
        line-height: 1;
        box-shadow: none;
    }
    .content-label { position: absolute!important; top: 0!important; left: 0!important; color: white!important; padding: 0.25em 0.45em!important; border-radius: 0.75em 0!important; font-size: 1.1em!important; z-index: 10!important; line-height: 1!important; }
    .serial-label { background-color: rgba(52,152,219,0.8)!important; }
    .movie-label  { background-color: rgba(46,204,113,0.8)!important; }
    body[data-movie-labels="on"] .card--tv .card__type { display: none!important; }
    `;
    document.head.appendChild(style);
    var _seasonListenerActive = false;
    function isSeasonEnabled() {
        var v = Lampa.Storage.get("season_and_episode");
        return !(v === false || v === 'false');
    }
    function addSeasonBadgeToFull(event) {
        if (!isSeasonEnabled()) return;
        if (Lampa.Activity.active().component == "full") {
            if (event.type == "complite") {
                var movie = event.data.movie;
                if (movie.number_of_seasons) {
                    var status = movie.status;
                    var totalSeasons = movie.number_of_seasons || 0;
                    var totalEpisodes = movie.number_of_episodes || 0;
                    var airedSeasons = 0, airedEpisodes = 0;
                    var now = new Date();
                    if (movie.seasons) {
                        movie.seasons.forEach(function(s) {
                            if (s.season_number === 0) return;
                            var seasonAired = s.air_date && new Date(s.air_date) <= now;
                            if (seasonAired) airedSeasons++;
                            if (s.episodes) { s.episodes.forEach(function(ep) { if (ep.air_date && new Date(ep.air_date) <= now) airedEpisodes++; }); }
                            else if (seasonAired && s.episode_count) airedEpisodes += s.episode_count;
                        });
                    } else if (movie.last_episode_to_air) {
                        airedSeasons = movie.last_episode_to_air.season_number || 0;
                        if (movie.seasons) { movie.seasons.forEach(function(s) { if (s.season_number === 0) return; if (s.season_number < movie.last_episode_to_air.season_number) airedEpisodes += s.episode_count || 0; else if (s.season_number === movie.last_episode_to_air.season_number) airedEpisodes += movie.last_episode_to_air.episode_number; }); }
                        else { airedEpisodes = movie.last_episode_to_air.episode_number || 0; }
                    }
                    if (movie.next_episode_to_air && totalEpisodes > 0) {
                        var ne = movie.next_episode_to_air, rem = 0;
                        if (movie.seasons) { movie.seasons.forEach(function(s) { if (s.season_number === ne.season_number) rem += (s.episode_count || 0) - ne.episode_number + 1; else if (s.season_number > ne.season_number) rem += s.episode_count || 0; }); }
                        if (rem > 0) { var calc = totalEpisodes - rem; if (calc >= 0 && calc <= totalEpisodes) airedEpisodes = calc; }
                    }
                    if (!airedSeasons) airedSeasons = totalSeasons;
                    if (!airedEpisodes) airedEpisodes = totalEpisodes;
                    if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;
                    function plural(n, one, two, five) { var m = Math.abs(n) % 100; if (m >= 5 && m <= 20) return five; m %= 10; if (m === 1) return one; if (m >= 2 && m <= 4) return two; return five; }
                    var isCompleted = (status === 'Ended' || status === 'Canceled');
                    var bgColor = isCompleted ? 'rgba(33,150,243,0.8)' : 'rgba(244,67,54,0.8)';
                    var displaySeasons = totalSeasons;
                    var displayEpisodes = totalEpisodes;
                    var seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                    var episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                    var txt = displaySeasons + ' ' + seasonsText + ' ' + displayEpisodes + ' ' + episodesText;
                    if (totalEpisodes > 0 && airedEpisodes < totalEpisodes && airedEpisodes > 0) {
                        txt = displaySeasons + ' ' + seasonsText + ' ' + airedEpisodes + ' ' + episodesText + ' из ' + totalEpisodes;
                    }
                    var info = $('<div class="season-info-label"></div>').text(txt);
                    info.css({
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        borderRadius: '0.75em 0',
                        textAlign: 'right',
                        backgroundColor: bgColor,
                        color: 'white',
                        padding: '0.25em 0.45em',
                        fontSize: '1.1em',
                        zIndex: 10,
                        whiteSpace: 'nowrap',
                        lineHeight: '1',
                        boxShadow: 'none'
                    });
                    setTimeout(function() {
                        var poster = $(event.object.activity.render()).find('.full-start-new__poster, .full-start__poster');
                        if (poster.length) {
                            poster.css('position', 'relative').append(info);
                        }
                    }, 100);
                }
            }
        }
    }
    function changeMovieTypeLabels() {
        $('body').attr('data-movie-labels', true ? 'on' : 'off');
        function addLabel(card) {
            if ($(card).find('.content-label').length) return;
            var view = $(card).find('.card__view');
            if (!view.length) return;
            var meta = {}, tmp;
            try {
                tmp = $(card).attr('data-card');
                if (tmp) meta = JSON.parse(tmp);
                tmp = $(card).data();
                if (tmp && Object.keys(tmp).length) meta = Object.assign(meta, tmp);
                if (Lampa.Card && $(card).attr('id')) {
                    var c = Lampa.Card.get($(card).attr('id'));
                    if (c) meta = Object.assign(meta, c);
                }
                var id = $(card).data('id') || $(card).attr('data-id') || meta.id;
                if (id && Lampa.Storage.cache('card_' + id)) {
                    meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
                }
            } catch (e) {
            }
            var isTV = false;
            if (meta.type === 'tv' || meta.card_type === 'tv' ||
                meta.seasons || meta.number_of_seasons > 0 ||
                meta.episodes || meta.number_of_episodes > 0 ||
                meta.is_series) {
                isTV = true;
            }
            if (!isTV) {
                if ($(card).hasClass('card--tv') || $(card).data('type') === 'tv') isTV = true;
                else if ($(card).find('.card__type, .card__temp').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) isTV = true;
            }
            var lbl = document.createElement('div');
            lbl.className = 'content-label';
            if (isTV) {
                lbl.classList.add('serial-label');
                lbl.textContent = 'Сериал';
                lbl.dataset.type = 'serial';
            } else {
                lbl.classList.add('movie-label');
                lbl.textContent = 'Фильм';
                lbl.dataset.type = 'movie';
            }
            view[0].appendChild(lbl);
        }
        function processAll() {
            document.querySelectorAll('.card').forEach(addLabel);
        }
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' && e.data.movie) {
                var poster = e.object.activity.render().querySelector('.full-start__poster, .full-start-new__poster');
                if (!poster) return;
                var m = e.data.movie;
                var isTV = m.number_of_seasons > 0 || m.seasons || m.type === 'tv';
                poster.querySelectorAll('.content-label').forEach(el => el.remove());
                var lbl = document.createElement('div');
                lbl.className = 'content-label';
                lbl.style.position = 'absolute';
                lbl.style.top = '0';
                lbl.style.left = '0';
                lbl.style.color = 'white';
                lbl.style.padding = '0.25em 0.45em';
                lbl.style.borderRadius = '0.75em 0';
                lbl.style.fontSize = '1.1em';
                lbl.style.zIndex = 10;
                lbl.style.lineHeight = '1';
                if (isTV) {
                    lbl.classList.add('serial-label');
                    lbl.textContent = 'Сериал';
                    lbl.style.backgroundColor = 'rgba(52,152,219,0.8)';
                } else {
                    lbl.classList.add('movie-label');
                    lbl.textContent = 'Фильм';
                    lbl.style.backgroundColor = 'rgba(46,204,113,0.8)';
                }
                poster.style.position = 'relative';
                poster.appendChild(lbl);
            }
        });
        new MutationObserver(function (muts) {
            muts.forEach(function (m) {
                if (m.addedNodes) {
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('card')) addLabel(node);
                        if (node.querySelectorAll) node.querySelectorAll('.card').forEach(addLabel);
                    });
                }
                if (m.type === 'attributes' && ['class', 'data-card', 'data-type'].includes(m.attributeName) && m.target.classList.contains('card')) {
                    addLabel(m.target);
                }
            });
        }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-card', 'data-type'] });
        processAll();
        setInterval(processAll, 2000);
    }
    function applySeasonSetting() {
        if (isSeasonEnabled()) {
            if (!_seasonListenerActive) {
                _seasonListenerActive = true;
                Lampa.Listener.follow("full", addSeasonBadgeToFull);
            }
        } else {
            if (_seasonListenerActive) {
                _seasonListenerActive = false;
                Lampa.Listener.remove("full", addSeasonBadgeToFull);
            }
            $('.season-info-label').remove();
        }
    }
    function initPlugin() {
        Lampa.SettingsApi.addParam({ component: "interface", param: { name: "season_and_episode", type: "trigger", default: true, }, field: { name: "Отображение состояния сериала (сезон/серия)", }, onRender: function (element) { setTimeout(function () { $("div[data-name='season_and_episode']").insertAfter("div[data-name='card_interface_reactions']"); }, 0); }, onChange: function () { applySeasonSetting(); } });
        applySeasonSetting();
        changeMovieTypeLabels();
    }
    if (window.appready) {
        initPlugin();
    }
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    }
    else {
        setTimeout(initPlugin, 5000);
    }
})();
