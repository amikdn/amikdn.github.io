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
