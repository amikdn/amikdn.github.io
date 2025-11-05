(function() {
    'use strict';

    // Константы и настройки
    var Q_LOGGING = false; // Логирование качества
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000; // Время кэша качества (24 часа)
    var QUALITY_CACHE = 'qualview_quality_cache';
    var JACRED_PROTOCOL = 'https://';
    var JACRED_URL = 'jacred.xyz';
    var JACRED_API_KEY = ''; // Укажите ключ, если требуется

    // Перевод качества
    function translateQuality(quality) {
        switch(quality) {
            case 2160: return '4K';
            case 1080: return 'FHD';
            case 720: return 'HD';
            case 'TS': return 'TS';
            default: return quality >= 720 ? 'HD' : 'SD';
        }
    }

    // Проверка на экранку
    var stopWords = ['camrip', 'камрип', 'ts', 'telecine', 'telesync', 'telesynch', 'upscale', 'tc', 'тс'];
    var stopWordsPatterns = stopWords.map(word => new RegExp('\\b' + word + '\\b', 'i'));

    function isScreenCopy(title) {
        if (!title) return false;
        var lower = title.toLowerCase();
        return stopWordsPatterns.some(pattern => pattern.test(lower));
    }

    // Получение типа карточки
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    // Получение качества из JacRed
    function getBestReleaseFromJacred(normalizedCard, localCurrentCard, callback) {
        if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Optimized search");

        var MAX_QUALITY = 2160;
        var findStopWords = false;

        function hasLetters(str) { return /[a-zа-яё]/i.test(str || ''); }
        function onlyDigits(str) { return /^\d+$/.test(str); }

        // Извлечение года
        var year = '';
        var dateStr = normalizedCard.release_date || '';
        if (dateStr.length >= 4) year = dateStr.substring(0, 4);
        if (!year || isNaN(year)) {
            if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Missing/invalid year");
            callback(null);
            return;
        }

        var uid = Lampa.Storage.get('lampac_unic_id', '');
        var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v2.0/indexers/all/results?' +
            'apikey=' + JACRED_API_KEY + '&uid=' + uid + '&year=' + year;

        var hasTitle = false;
        if (normalizedCard.title && (hasLetters(normalizedCard.title) || onlyDigits(normalizedCard.title))) {
            apiUrl += '&title=' + encodeURIComponent(normalizedCard.title.trim());
            hasTitle = true;
        }
        if (normalizedCard.original_title && (hasLetters(normalizedCard.original_title) || onlyDigits(normalizedCard.original_title))) {
            apiUrl += '&title_original=' + encodeURIComponent(normalizedCard.original_title.trim());
            hasTitle = true;
        }
        if (!hasTitle) {
            if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: No valid titles");
            callback(null);
            return;
        }

        if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Unified Request URL: " + apiUrl);

        new Lampa.Reguest().silent(apiUrl, function(response) {
            if (!response) {
                if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Request failed");
                callback(null);
                return;
            }
            try {
                var data = typeof response === 'string' ? JSON.parse(response) : response;
                var torrents = data.Results || [];
                if (!Array.isArray(torrents)) torrents = [];
                if (torrents.length === 0) {
                    if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Empty response");
                    callback(null);
                    return;
                }

                var bestQuality = -1;
                var bestTorrent = null;
                var searchYearNum = parseInt(year, 10);
                var prevYear = searchYearNum - 1;

                for (var i = 0; i < torrents.length; i++) {
                    var t = torrents[i];
                    var info = t.info || t.Info || {};
                    var usedQuality = info.quality;
                    var usedYear = info.relased;
                    var titleForCheck = t.Title || '';

                    if (typeof usedQuality !== 'number' || usedQuality === 0) continue;

                    var yearValid = false;
                    var parsedYear = 0;
                    if (usedYear && !isNaN(usedYear)) {
                        parsedYear = parseInt(usedYear, 10);
                        if (parsedYear > 1900) yearValid = true;
                    }
                    if (!yearValid) continue;

                    if (parsedYear !== searchYearNum && parsedYear !== prevYear) continue;

                    if (isScreenCopy(titleForCheck)) {
                        findStopWords = true;
                        continue;
                    }

                    if (usedQuality === MAX_QUALITY) {
                        if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Found MAX quality: " + usedQuality);
                        callback({ quality: translateQuality(usedQuality), title: titleForCheck });
                        return;
                    }

                    if (usedQuality > bestQuality) {
                        bestQuality = usedQuality;
                        bestTorrent = { title: titleForCheck, quality: usedQuality, year: parsedYear };
                    }
                }

                if (bestTorrent) {
                    var translatedQuality = translateQuality(bestTorrent.quality);
                    if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Found torrent: " + bestTorrent.title + " quality: " + translatedQuality);
                    callback({ quality: translatedQuality, title: bestTorrent.title });
                } else if (findStopWords) {
                    if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Screen copy detected");
                    callback({ quality: translateQuality('TS'), title: "NOT SAVED" });
                } else {
                    if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: No suitable torrents found");
                    callback(null);
                }
            } catch (e) {
                if (Q_LOGGING) console.log("QUALVIEW", "card: " + localCurrentCard + ", JacRed: Processing error: " + e.message);
                callback(null);
            }
        });
    }

    // Кэширование качества
    function getQualityCache(key) {
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < Q_CACHE_TIME) ? item : null;
    }

    function saveQualityCache(key, data) {
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[key] = { quality: data.quality || null, timestamp: Date.now() };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

    // Отображение качества внутри карточки
    function fetchQualityForCard(card, render) {
        var normalizedCard = {
            id: card.id,
            title: card.title || card.name || '',
            original_title: card.original_title || card.original_name || '',
            release_date: card.release_date || card.first_air_date || '',
            type: getCardType(card)
        };
        var localCurrentCard = normalizedCard.id;
        var qCacheKey = normalizedCard.type + '_' + normalizedCard.id;

        if (localStorage.getItem('qualview_quality') !== 'true') return;
        if (localStorage.getItem('qualview_quality_tv') === 'false' && normalizedCard.type === 'tv') return;

        var cacheQualityData = getQualityCache(qCacheKey);
        if (cacheQualityData) {
            updateQualityElement(cacheQualityData.quality, render);
        } else {
            showQualityPlaceholder(render);
            getBestReleaseFromJacred(normalizedCard, localCurrentCard, function(jrResult) {
                var quality = (jrResult && jrResult.quality) || null;
                if (quality && quality !== 'NO') {
                    saveQualityCache(qCacheKey, { quality: quality });
                    updateQualityElement(quality, render);
                } else {
                    clearQualityElements(render);
                }
            });
        }
    }

    function updateQualityElement(quality, render) {
        if (!render) return;
        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;
        var element = $('.full-start__status.qualview-quality', render);
        if (element.length) {
            element.text(quality).css('opacity', '1');
        } else {
            var div = $('<div class="full-start__status qualview-quality">' + quality + '</div>');
            rateLine.append(div);
        }
    }

    function showQualityPlaceholder(render) {
        if (!render) return;
        var rateLine = $('.full-start-new__rate-line', render);
        if (rateLine.length && !$('.full-start__status.qualview-quality', render).length) {
            var placeholder = $('<div class="full-start__status qualview-quality">...</div>');
            placeholder.css('opacity', '0.7');
            rateLine.append(placeholder);
        }
    }

    function clearQualityElements(render) {
        if (render) $('.full-start__status.qualview-quality', render).remove();
    }

    // Отображение качества на карточках в списке
    function updateListCards(cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.hasAttribute('data-quality-added')) continue;

            var data = card.card_data;
            if (!data) continue;

            var normalizedCard = {
                id: data.id || '',
                title: data.title || data.name || '',
                original_title: data.original_title || data.original_name || '',
                release_date: data.release_date || data.first_air_date || '',
                type: getCardType(data)
            };

            var isTvSeries = card.querySelector('.card__type') !== null;
            if (isTvSeries && localStorage.getItem('qualview_quality_tv') === 'false') continue;

            (function(currentCard, normCard, qKey) {
                var cacheData = getQualityCache(qKey);
                if (cacheData) {
                    applyQualityToListCard(currentCard, cacheData.quality);
                } else {
                    applyQualityToListCard(currentCard, '...');
                    getBestReleaseFromJacred(normCard, normCard.id, function(result) {
                        var quality = (result && result.quality) || null;
                        applyQualityToListCard(currentCard, quality);
                        if (quality && quality !== 'NO') saveQualityCache(qKey, { quality: quality });
                    });
                }
            })(card, normalizedCard, normalizedCard.type + '_' + normalizedCard.id);
        }
    }

    function applyQualityToListCard(card, quality) {
        if (!document.body.contains(card)) return;
        card.setAttribute('data-quality-added', 'true');
        var cardView = card.querySelector('.card__view');
        if (!cardView) return;

        var qualityElements = cardView.querySelectorAll('.card__quality');
        Array.from(qualityElements).forEach(el => el.remove());

        if (quality && quality !== 'NO') {
            var qualityDiv = document.createElement('div');
            qualityDiv.className = 'card__quality';
            var inner = document.createElement('div');
            inner.textContent = quality;
            qualityDiv.appendChild(inner);
            cardView.appendChild(qualityDiv);
        }
    }

    // Наблюдатель за DOM
    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('card')) newCards.push(node);
                        node.querySelectorAll('.card').forEach(c => newCards.push(c));
                    }
                });
            }
        });
        if (newCards.length) updateListCards(newCards);
    });

    // Инициализация плагина
    function startQualityPlugin() {
        window.qualviewQualityPlugin = true;

        if (!localStorage.getItem('qualview_quality')) localStorage.setItem('qualview_quality', 'true');
        if (!localStorage.getItem('qualview_quality_inlist')) localStorage.setItem('qualview_quality_inlist', 'true');
        if (!localStorage.getItem('qualview_quality_tv')) localStorage.setItem('qualview_quality_tv', 'true');

        Lampa.SettingsApi.addComponent({ component: "qualview_quality", name: "Качество видео", icon: '<svg>...</svg>' }); // Укажите иконку

        Lampa.SettingsApi.addParam({
            component: "qualview_quality",
            param: { name: "qualview_quality", type: "trigger", default: true },
            field: { name: "Качество внутри карточек", description: '' },
            onChange: function(value) {}
        });

        Lampa.SettingsApi.addParam({
            component: "qualview_quality",
            param: { name: "qualview_quality_inlist", type: "trigger", default: true },
            field: { name: "Качество на карточках в списке", description: '' },
            onChange: function(value) {
                if (value === 'true') {
                    observer.observe(document.body, { childList: true, subtree: true });
                } else {
                    observer.disconnect();
                }
            }
        });

        Lampa.SettingsApi.addParam({
            component: "qualview_quality",
            param: { name: "qualview_quality_tv", type: "trigger", default: true },
            field: { name: "Качество для сериалов", description: '' },
            onChange: function(value) {}
        });

        if (localStorage.getItem('qualview_quality_inlist') === 'true') {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                fetchQualityForCard(e.data.movie, render);
            }
        });
    }

    if (!window.qualviewQualityPlugin) startQualityPlugin();
})();