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
        top: auto;
        bottom: auto;
        left: -0.8em;
        background-color: rgba(52,152,219,0.8);
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
        top: auto;
        bottom: auto;
        left: -0.8em;
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
        display: flex;
        align-items: center;
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
        position: absolute;
        background: #df1616;
        color: #fff;
        padding: 0.4em 0.6em;
        font-size: 0.8em;
        border-radius: 0.3em;
        text-transform: none;
        font-weight: normal;
        z-index: 999;
        text-align: center;
        white-space: nowrap;
        line-height: 1.2em;
        backdrop-filter: blur(2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
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
        let typeLabel = cardEl.querySelector('.content-label.serial-label');
        let quality = cardEl.querySelector('.card__quality');
        if (typeLabel && badge) {
            let tlHeight = typeLabel.offsetHeight;
            let tlStyle = getComputedStyle(typeLabel);
            let tlTop = parseFloat(tlStyle.top) || 0;
            let tlBottom = parseFloat(tlStyle.bottom) || 0;
            let tlLeft = parseFloat(tlStyle.left) || 0;
            let tlRight = parseFloat(tlStyle.right) || 0;
            if (tlTop > 0) {
                badge.style.top = (tlTop + tlHeight + 2) + 'px';
                badge.style.bottom = '';
            } else if (tlBottom > 0) {
                badge.style.bottom = (tlBottom + tlHeight + 2) + 'px';
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
                let movieData = event.data.movie;
                if (movieData.seasons && movieData.last_episode_to_air && movieData.last_episode_to_air.season_number) {
                    let currentSeason = movieData.last_episode_to_air.season_number;
                    let nextEpisode = movieData.next_episode_to_air;
                    let lastEpisode = nextEpisode && new Date(nextEpisode.air_date) <= Date.now() ? nextEpisode.episode_number : movieData.last_episode_to_air.episode_number;
                    let seasonInfo;
                    let totalEpisodes = movieData.seasons.find((season) => season.season_number == currentSeason).episode_count;
                    let bgColor;
                    let isComplete = !movieData.next_episode_to_air;
                    if (isComplete) {
                        seasonInfo = `${currentSeason} сезон завершён`;
                        bgColor = 'rgba(52,152,219,0.8)';
                    } else {
                        seasonInfo = `Сезон ${currentSeason} Серия ${lastEpisode} из ${totalEpisodes}`;
                        bgColor = 'rgba(244,67,54,0.8)';
                    }
                    if (!$(".card--new_seria", Lampa.Activity.active().activity.render()).length) {
                        var poster = $(".full-start__poster, .full-start-new__poster", Lampa.Activity.active().activity.render());
                        if (poster.length) {
                            var newSeria = $(`<div class='card--new_seria' style='background: ${bgColor};'>${seasonInfo}</div>`);
                            poster.append(newSeria);
                            var contentLabel = poster.find('.content-label.serial-label');
                            if (contentLabel.length) {
                                var clHeight = contentLabel.outerHeight();
                                var clTop = parseFloat(contentLabel.css('top')) || 0;
                                newSeria.css({
                                    top: (clTop + clHeight + 2) + 'px',
                                    left: contentLabel.css('left'),
                                    right: contentLabel.css('right')
                                });
                            } else {
                                newSeria.css({
                                    top: '1.4em',
                                    left: '-0.8em'
                                });
                            }
                        } else if (window.innerWidth <= 585) {
                            if ($(".card--new_seria", Lampa.Activity.active().activity.render()).length) {
                                $(".full-start__tags", Lampa.Activity.active().activity.render()).append(
                                    `<div class="full-start__tag card--new_seria"> <img src="./img/icons/menu/movie.svg" /> <div>${seasonInfo}</div> </div>`
                                );
                            } else {
                                $(".full-start-new__details", Lampa.Activity.active().activity.render()).append(
                                    `<span class="full-start-new__split">●</span> <div class="card--new_seria"> <div>${seasonInfo}</div> </div>`
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
