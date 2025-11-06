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
        bottom: 0.50em;
        background-color: rgba(33,150,243,0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.3em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        text-align: center;
        white-space: nowrap;
        backdrop-filter: blur(2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(244,67,54,0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0.3em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        text-align: center;
        white-space: nowrap;
        backdrop-filter: blur(2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .card--season-complete div,
    .card--season-progress div {
        text-transform: none;
        font-family: inherit;
        font-weight: normal;
        font-size: 0.8em;
        padding: 0.4em 0.6em;
        white-space: nowrap;
        display: block;
        line-height: 1.2em;
    }
    .card--season-complete div {
        color: #ffffff;
    }
    .card--season-progress div {
        color: #ffffff;
    }
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
    @media (max-width: 768px) {
        .card--season-complete div,
        .card--season-progress div {
            font-size: 0.8em;
            padding: 0.4em 0.6em;
        }
    }
    .card--new_seria {
        background: #df1616;
        color: #fff;
        padding: 0.4em 0.6em;
        font-size: 0.8em;
        border-radius: 0.3em;
        text-transform: none;
        font-weight: normal;
    }
    .full-start__tag.card--new_seria {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }
    .full-start-new__details .card--new_seria {
        display: inline-block;
    }
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
    function plural(n, one, two, five) {
        var m = Math.abs(n) % 100;
        if (m >= 5 && m <= 20) return five;
        m %= 10;
        if (m === 1) return one;
        if (m >= 2 && m <= 4) return two;
        return five;
    }
    function getStatusText(st) {
        if (st === 'Ended') return 'Завершён';
        if (st === 'Canceled') return 'Отменён';
        if (st === 'Returning Series') return 'Выходит';
        if (st === 'In Production') return 'В производстве';
        return st || 'Неизвестно';
    }
    function getSeriesProgress(tmdbData) {
        if (!tmdbData) return false;
        var status = tmdbData.status;
        var totalSeasons = tmdbData.number_of_seasons || 0;
        var totalEpisodes = tmdbData.number_of_episodes || 0;
        var airedSeasons = 0, airedEpisodes = 0;
        var now = new Date();
        if (tmdbData.seasons) {
            tmdbData.seasons.forEach(function (s) {
                if (s.season_number === 0) return;
                var seasonAired = s.air_date && new Date(s.air_date) <= now;
                if (seasonAired) airedSeasons++;
                if (s.episodes) {
                    s.episodes.forEach(function (ep) {
                        if (ep.air_date && new Date(ep.air_date) <= now) airedEpisodes++;
                    });
                } else if (seasonAired && s.episode_count) {
                    airedEpisodes += s.episode_count;
                }
            });
        } else if (tmdbData.last_episode_to_air) {
            airedSeasons = tmdbData.last_episode_to_air.season_number || 0;
            airedEpisodes = tmdbData.last_episode_to_air.episode_number || 0;
            if (tmdbData.seasons) {
                tmdbData.seasons.forEach(function (s) {
                    if (s.season_number === 0) return;
                    if (s.season_number < airedSeasons) airedEpisodes += s.episode_count || 0;
                });
            }
        }
        if (tmdbData.next_episode_to_air && totalEpisodes > 0) {
            var ne = tmdbData.next_episode_to_air;
            var rem = 0;
            if (tmdbData.seasons) {
                tmdbData.seasons.forEach(function (s) {
                    if (s.season_number === ne.season_number) {
                        rem += (s.episode_count || 0) - ne.episode_number + 1;
                    } else if (s.season_number > ne.season_number) {
                        rem += s.episode_count || 0;
                    }
                });
            }
            if (rem > 0) airedEpisodes = totalEpisodes - rem;
        }
        if (!airedSeasons) airedSeasons = totalSeasons;
        if (!airedEpisodes) airedEpisodes = totalEpisodes;
        if (totalEpisodes > 0 && airedEpisodes > totalEpisodes) airedEpisodes = totalEpisodes;
        var isCompleted = (status === 'Ended' || status === 'Canceled');
        return {
            airedSeasons,
            airedEpisodes,
            totalSeasons,
            totalEpisodes,
            isCompleted,
            status
        };
    }
    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        badge.className = badgeClass + (loading ? ' loading' : '');
        badge.innerHTML = content;
        return badge;
    }
    function adjustBadgePosition(cardEl, badge) {
        let typeLabel = cardEl.querySelector('.content-label.serial-label');
        let quality = cardEl.querySelector('.card__quality');
        if (typeLabel && badge) {
            let tlHeight = typeLabel.offsetHeight;
            let tlStyle = getComputedStyle(typeLabel);
            let tlTop = parseFloat(tlStyle.top) || 0;
            let tlBottom = parseFloat(tlStyle.bottom) || 0;
            let tlLeft = parseFloat(tlStyle.left) || 0;
            let tlRight = parseFloat(tlStyle.right) || 0;
            badge.style.width = typeLabel.offsetWidth + 'px';
            badge.style.whiteSpace = 'normal';
            if (tlTop > 0) {
                badge.style.top = (tlTop + tlHeight) + 'px';
                badge.style.bottom = '';
            } else if (tlBottom > 0) {
                badge.style.bottom = (tlBottom + tlHeight) + 'px';
                badge.style.top = '';
            }
            if (tlLeft > 0) {
                badge.style.left = tlLeft + 'px';
                badge.style.right = '';
            } else if (tlRight > 0) {
                badge.style.right = tlRight + 'px';
                badge.style.left = '';
            }
        } else if (quality && badge) {
            let qHeight = quality.offsetHeight;
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0;
            badge.style.bottom = (qHeight + qBottom) + 'px';
            badge.style.top = '';
        } else if (badge) {
            badge.style.bottom = '0.50em';
            badge.style.top = '';
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
                var progressInfo = getSeriesProgress(tmdbData);
                if (progressInfo) {
                    var displaySeasons = progressInfo.airedSeasons;
                    var displayEpisodes = progressInfo.airedEpisodes;
                    var seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                    var episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                    var content = '';
                    var isComplete = progressInfo.isCompleted;
                    if (isComplete) {
                        content = `<div>${displaySeasons} ${seasonsText} ${displayEpisodes} ${episodesText} ${getStatusText(progressInfo.status)}</div>`;
                    } else {
                        var txt = `${displaySeasons} ${seasonsText} ${displayEpisodes} ${episodesText}`;
                        if (progressInfo.totalEpisodes > 0 && progressInfo.airedEpisodes < progressInfo.totalEpisodes && progressInfo.airedEpisodes > 0) {
                            txt = `${displaySeasons} ${seasonsText} ${progressInfo.airedEpisodes} ${episodesText} из ${progressInfo.totalEpisodes}`;
                        }
                        content = `<div>${txt}</div>`;
                    }
                    badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = content;
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
                let movieData = event.data.movie;
                if (movieData.number_of_seasons) {
                    let progressInfo = getSeriesProgress(movieData);
                    if (progressInfo) {
                        let displaySeasons = progressInfo.airedSeasons;
                        let displayEpisodes = progressInfo.airedEpisodes;
                        let seasonsText = plural(displaySeasons, 'сезон', 'сезона', 'сезонов');
                        let episodesText = plural(displayEpisodes, 'серия', 'серии', 'серий');
                        let seasonInfo = '';
                        let isCompleted = progressInfo.isCompleted;
                        let bgColor = isCompleted ? 'rgba(33,150,243,0.8)' : 'rgba(244,67,54,0.8)';
                        if (isCompleted) {
                            seasonInfo = `<div>${displaySeasons} ${seasonsText} ${displayEpisodes} ${episodesText}</div><div>${getStatusText(progressInfo.status)}</div>`;
                        } else {
                            let txt = `${displaySeasons} ${seasonsText} ${displayEpisodes} ${episodesText}`;
                            if (progressInfo.totalEpisodes > 0 && progressInfo.airedEpisodes < progressInfo.totalEpisodes && progressInfo.airedEpisodes > 0) {
                                txt = `${displaySeasons} ${seasonsText} ${progressInfo.airedEpisodes} ${episodesText} из ${progressInfo.totalEpisodes}`;
                            }
                            seasonInfo = `<div>${txt}</div>`;
                        }
                        if (!$(".card--new_seria", Lampa.Activity.active().activity.render()).length) {
                            if (window.innerWidth > 585) {
                                $(".full-start__poster,.full-start-new__poster", Lampa.Activity.active().activity.render()).append(
                                    `<div class='card--new_seria' style=' right: -0.6em!important; position: absolute; background: ${bgColor}; color: #fff; bottom: .6em!important; padding: 0.4em 0.6em; font-size: 0.8em; border-radius: 0.3em;'> ${seasonInfo} </div>`
                                );
                            } else {
                                $(".full-start-new__details", Lampa.Activity.active().activity.render()).append(
                                    `<span class="full-start-new__split">●</span> <div class="card--new_seria" style='background: ${bgColor};'> ${seasonInfo} </div>`
                                );
                            }
                        }
                    }
                }
            }
        }
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
        if (!CONFIG.enabled) return;
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
        setTimeout(initPlugin, 2000);
    }
})();
