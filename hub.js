(function () {
    'use strict';
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    var CONFIG = {
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96',
        cacheTime: 24 * 60 * 60 * 1000,
        language: 'uk'
    };

    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        bottom: 0.5em;
        left: 0.5em;
        background-color: rgba(52,152,219,0.9);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.4em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 0.75em;
        backdrop-filter: blur(3px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .card--season-progress {
        position: absolute;
        bottom: 0.5em;
        left: 0.5em;
        background-color: rgba(244,67,54,0.9);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.4em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 0.75em;
        backdrop-filter: blur(3px);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .card--season-complete div,
    .card--season-progress div {
        padding: 0.35em 0.55em;
        color: #fff;
        white-space: nowrap;
    }
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
    @media (max-width: 768px) {
        .card--season-complete,
        .card--season-progress {
            bottom: 0.4em !important;
            left: 0.4em !important;
            font-size: 0.7em !important;
        }
        .card--season-complete div,
        .card--season-progress div {
            padding: 0.3em 0.5em !important;
        }
    }
    .content-label {
        position: absolute !important;
        top: 1.4em !important;
        left: -0.8em !important;
        color: white !important;
        padding: 0.4em 0.4em !important;
        border-radius: 0.3em !important;
        font-size: 0.8em !important;
        z-index: 10 !important;
    }
    .serial-label { background-color: #3498db !important; }
    .movie-label { background-color: #2ecc71 !important; }
    body[data-movie-labels="on"] .card--tv .card__type { display: none !important; }
    `;
    document.head.appendChild(style);

    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date || cardData.number_of_seasons > 0 || cardData.is_series) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');

    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            fetch(url)
                .then(r => r.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);
                    cache[tmdbId] = { data: data, timestamp: Date.now() };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    resolve(data);
                })
                .catch(reject);
        });
    }

    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        var last = tmdbData.last_episode_to_air;
        var season = tmdbData.seasons.find(s => s.season_number === last.season_number && s.season_number > 0);
        if (!season) return false;
        return {
            seasonNumber: last.season_number,
            aired: last.episode_number || 0,
            total: season.episode_count || 0,
            complete: (last.episode_number || 0) >= (season.episode_count || 0)
        };
    }

    function createBadge(content, complete) {
        var badge = document.createElement('div');
        badge.className = complete ? 'card--season-complete' : 'card--season-progress';
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    function addTypeLabel(cardEl) {
        if (!cardEl || cardEl.querySelector('.content-label')) return;
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        var data = cardEl.card_data || {};
        var isTV = getMediaType(data) === 'tv';
        var lbl = document.createElement('div');
        lbl.className = 'content-label';
        if (isTV) {
            lbl.classList.add('serial-label');
            lbl.textContent = 'Сериал';
        } else {
            lbl.classList.add('movie-label');
            lbl.textContent = 'Фильм';
        }
        view.appendChild(lbl);
    }

    function addSeasonBadgeToCard(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadgeToCard(cardEl));
            return;
        }
        addTypeLabel(cardEl); // метка типа

        var data = cardEl.card_data;
        if (getMediaType(data) !== 'tv') return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        view.querySelectorAll('.card--season-complete, .card--season-progress').forEach(b => b.remove());

        var badge = createBadge('Загрузка...', false);
        view.appendChild(badge);
        cardEl.setAttribute('data-season-processed', 'loading');

        fetchSeriesData(data.id)
            .then(tmdbData => {
                var info = getSeasonProgress(tmdbData);
                if (info) {
                    var text = info.complete
                        ? `${info.seasonNumber} сезон завершён`
                        : `Сезон ${info.seasonNumber} • ${info.aired}/${info.total}`;
                    badge.className = info.complete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${text}</div>`;
                    setTimeout(() => badge.classList.add('show'), 50);
                    cardEl.setAttribute('data-season-processed', 'done');
                } else {
                    badge.remove();
                }
            })
            .catch(() => badge.remove());
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            m.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;
                if (node.classList?.contains('card')) addSeasonBadgeToCard(node);
                node.querySelectorAll?.('.card').forEach(addSeasonBadgeToCard);
            });
        });
    });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && e.data.movie) {
            var poster = e.object.activity.render().querySelector('.full-start__poster, .full-start-new__poster');
            if (!poster) return;
            poster.querySelectorAll('.content-label').forEach(el => el.remove());
            var m = e.data.movie;
            var isTV = m.number_of_seasons > 0 || m.seasons || m.type === 'tv';
            var lbl = document.createElement('div');
            lbl.className = 'content-label';
            lbl.style.position = 'absolute';
            lbl.style.top = '1.4em';
            lbl.style.left = '-0.8em';
            lbl.style.color = 'white';
            lbl.style.padding = '0.4em';
            lbl.style.borderRadius = '0.3em';
            lbl.style.fontSize = '0.8em';
            lbl.style.zIndex = 10;
            if (isTV) {
                lbl.classList.add('serial-label');
                lbl.textContent = 'Сериал';
                lbl.style.backgroundColor = '#3498db';
            } else {
                lbl.classList.add('movie-label');
                lbl.textContent = 'Фильм';
                lbl.style.backgroundColor = '#2ecc71';
            }
            poster.style.position = 'relative';
            poster.appendChild(lbl);
        }
    });

    function initPlugin() {
        Lampa.SettingsApi.addParam({
            component: "interface",
            param: { name: "season_and_episode", type: "trigger", default: true },
            field: { name: "Отображение состояния сериала (сезон/серия) + метки Сериал/Фильм" },
            onRender: el => setTimeout(() => $("div[data-name='season_and_episode']").insertAfter("div[data-name='card_interface_reactions']"), 0)
        });

        if (Lampa.Storage.get("season_and_episode") !== false) {
            observer.observe(document.body, { childList: true, subtree: true });
            document.querySelectorAll('.card:not([data-season-processed])').forEach(addSeasonBadgeToCard);
        }
    }

    if (window.appready) initPlugin();
    else if (Lampa?.Listener) {
        Lampa.Listener.follow('app', e => { if (e.type === 'ready') initPlugin(); });
    } else {
        setTimeout(initPlugin, 5000);
    }
})();
