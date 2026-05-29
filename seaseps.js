(function () {
    'use strict';
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;
    var CONFIG = {
        tmdbApiKey: '4ef0d7355d9ffb5151e987764708ce96',
        cacheTime: 24 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk'
    };
    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0;
        background-color: rgba(33,150,243,0.8);
        z-index: 1;
        border-radius: 0 0.75em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        text-align: left;
        white-space: nowrap;
        line-height: 1;
    }
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0;
        background-color: rgba(244,67,54,0.8);
        z-index: 1;
        border-radius: 0 0.75em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        text-align: left;
        white-space: nowrap;
        line-height: 1;
    }
    .card--season-complete div,
    .card--season-progress div {
        color: #ffffff;
        font-size: 1.1em;
        padding: 0.25em 0.45em;
        white-space: nowrap;
        line-height: 1;
    }
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
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
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Пожалуйста, вставьте корректный TMDB API ключ'));
            }
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);
                    cache[tmdbId] = {
                        data: data,
                        timestamp: Date.now()
                    };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    resolve(data);
                })
                .catch(reject);
        });
    }
    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.find(s =>
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
        if (!currentSeason) return false;
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }
    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        badge.className = badgeClass + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }
    function adjustBadgePosition(cardEl, badge) {
        if (!badge) return;
        var quality = cardEl.querySelector('.card__quality');
        if (quality) {
            var qHeight = quality.offsetHeight;
            var qBottom = parseFloat(getComputedStyle(quality).bottom) || 0;
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else {
            badge.style.bottom = '';
        }
    }
    function updateBadgePositions(cardEl) {
        var badges = cardEl.querySelectorAll('.card--season-complete, .card--season-progress');
        badges.forEach(function(badge) {
            adjustBadgePosition(cardEl, badge);
        });
    }
    var qualityObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.classList && (node.classList.contains('card__quality') || node.classList.contains('content-label'))) {
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
            mutation.removedNodes?.forEach(function(node) {
                if (node.classList && (node.classList.contains('card__quality') || node.classList.contains('content-label'))) {
                    var cardEl = node.closest('.card');
                    if (cardEl) {
                        setTimeout(() => {
                            updateBadgePositions(cardEl);
                        }, 100);
                    }
                }
            });
        });
    });
    function addSeasonBadgeToCard(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadgeToCard(cardEl));
            return;
        }
        var data = cardEl.card_data;
        if (getMediaType(data) !== 'tv') return;
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        oldBadges.forEach(function(badge) {
            badge.remove();
        });
        var badge = createBadge('...', false, true);
        view.appendChild(badge);
        adjustBadgePosition(cardEl, badge);
        try {
            qualityObserver.observe(view, {
                childList: true,
                subtree: true
            });
        } catch (e) {
        }
        cardEl.setAttribute('data-season-processed', 'loading');
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                var progressInfo = getSeasonProgress(tmdbData);
                if (progressInfo) {
                    var content = '';
                    var isComplete = progressInfo.isComplete;
                    if (isComplete) {
                        content = `${progressInfo.seasonNumber} сезон завершён`;
                    } else {
                        content = `Сезон ${progressInfo.seasonNumber} Серия ${progressInfo.airedEpisodes} из ${progressInfo.totalEpisodes}`;
                    }
                    badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${content}</div>`;
                    adjustBadgePosition(cardEl, badge);
                    setTimeout(() => {
                        badge.classList.add('show');
                        adjustBadgePosition(cardEl, badge);
                    }, 50);
                    cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                } else {
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'error');
                }
            })
            .catch(function(error) {
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }
    function addSeasonBadgeToFull(event) {
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
                    function getStatusText(st) { if (st === 'Ended') return 'Завершён'; if (st === 'Canceled') return 'Отменён'; if (st === 'Returning Series') return 'Онгоинг'; if (st === 'In Production') return 'В производстве'; return st || 'Неизвестно'; }
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
                        top: '0',
                        right: '0',
                        borderRadius: '0 0.75em',
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
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.nodeType !== 1) return;
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadgeToCard(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadgeToCard);
                }
            });
        });
    });
    window.addEventListener('resize', function() {
        var allBadges = document.querySelectorAll('.card--season-complete, .card--season-progress');
        allBadges.forEach(function(badge) {
            var cardEl = badge.closest('.card');
            if (cardEl) {
                adjustBadgePosition(cardEl, badge);
            }
        });
    });
    function initPlugin() {
        Lampa.SettingsApi.addParam({ component: "interface", param: { name: "season_and_episode", type: "trigger", default: true, }, field: { name: "Отображение состояния сериала (сезон/серия)", }, onRender: function (element) { setTimeout(function () { $("div[data-name='season_and_episode']").insertAfter("div[data-name='card_interface_reactions']"); }, 0); }, });
        if (Lampa.Storage.get("season_and_episode") !== false) {
            Lampa.Listener.follow("full", addSeasonBadgeToFull);
            var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
            if (containers.length > 0) {
                containers.forEach(container => {
                    try {
                        observer.observe(container, {
                            childList: true,
                            subtree: true
                        });
                    } catch (e) {
                    }
                });
            } else {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
            document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
                setTimeout(() => addSeasonBadgeToCard(card), index * 300);
            });
            setInterval(function() {
                document.querySelectorAll('.card:not([data-season-processed])').forEach(addSeasonBadgeToCard);
            }, 1000);
        }
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
