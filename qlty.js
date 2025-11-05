(function () {
    'use strict';
    
    var Q_LOGGING = true; // Логгинг качества
    var Q_CACHE_TIME = 24 * 60 * 60 * 1000; // Время кеширования качества
    var QUALITY_CACHE = 'maxsm_ratings_quality_cache';
    var JACRED_PROTOCOL = 'http://'; // Протокол JacRed
    var JACRED_URL = Lampa.Storage.get('jacred.xyz') || 'jacred.xyz'; // Адрес JacRed
    var JACRED_API_KEY = Lampa.Storage.get(''); // api ключ JacRed
    var PROXY_TIMEOUT = 5000; // Таймаут прокси
    var PROXY_LIST = [
        'http://api.allorigins.win/raw?url=',
        'http://cors.bwa.workers.dev/'
    ];

    // Стили для отображения качества - ЧЕРНАЯ подложка, БЕЛЫЙ текст
    var style = "<style id=\"maxsm_ratings_quality\">" +
        ".card__view {position: relative !important;}" +
        ".card__quality { " +
        "   position: absolute !important; " +
        "   bottom: 0.5em !important; " +
        "   left: -0.8em !important; " +
        "   background-color: transparent !important; " +
        "   z-index: 10; " +
        "   width: fit-content !important; " +
        "   max-width: calc(100% - 1em) !important; " +
        "}" +
        ".card__quality div { " +
        "   text-transform: none !important; " +
        "   border: 1px solid #FFFFFF !important; " +
        "   background-color: rgba(0, 0, 0, 0.7) !important; " + // Черная полупрозрачная подложка
        "   color: #FFFFFF !important; " + // Белый текст
        "   font-weight: bold !important; " + // Жирный шрифт
        "   font-style: normal !important; " + // Не курсив
        "   font-size: 1.2em !important; " +
        "   border-radius: 3px !important; " +
        "   padding: 0.2em 0.4em !important; " +
        "}" +
        "</style>";

    Lampa.Template.add('maxsm_ratings_quality_css', style);
    $('body').append(Lampa.Template.get('maxsm_ratings_quality_css', {}, true));

    // Функция для получения типа карточки
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    // Функция для работы с прокси
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url));
                }
                return;
            }
            var proxyUrl = PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", Fetch with proxy: " + proxyUrl);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, PROXY_TIMEOUT);
            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Proxy error: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    console.error("MAXSM-RATINGS", "card: " + cardId + ", Proxy fetch error for " + proxyUrl + ":", error);
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
    }

    // Функция получения качества из JacRed
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        if (!JACRED_URL) {
            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: JACRED_URL is not set.");
            callback(null);
            return;
        }

        function translateQuality(quality) {
            if (typeof quality !== 'number') return quality;
            if (quality >= 2160) return '4K';
            if (quality >= 1080) return 'FHD';
            if (quality >= 720) return 'HD';
            if (quality > 0) return 'SD';
            return null;
        }

        if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: Search initiated.");
        var year = '';
        var dateStr = normalizedCard.release_date || '';
        if (dateStr.length >= 4) {
            year = dateStr.substring(0, 4);
        }
        if (!year || isNaN(year)) {
            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: Missing/invalid year.");
            callback(null);
            return;
        }

        function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            var apiUrl = JACRED_PROTOCOL + JACRED_URL + '/api/v1.0/torrents?search=' +
                encodeURIComponent(searchTitle) +
                '&year=' + searchYear +
                (exactMatch ? '&exact=true' : '') +
                '&uid=' + userId;

            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " URL: " + apiUrl);

            var timeoutId = setTimeout(function() {
                if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " request timed out.");
                apiCallback(null);
            }, PROXY_TIMEOUT * PROXY_LIST.length + 1000);

            fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                clearTimeout(timeoutId);
                if (error) {
                    console.error("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " request failed:", error);
                    apiCallback(null);
                    return;
                }
                if (!responseText) {
                    if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " failed or empty response.");
                    apiCallback(null);
                    return;
                }
                try {
                    var torrents = JSON.parse(responseText);
                    if (!Array.isArray(torrents) || torrents.length === 0) {
                        if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " received no torrents.");
                        apiCallback(null);
                        return;
                    }
                    var bestNumericQuality = -1;
                    var bestFoundTorrent = null;

                    for (var i = 0; i < torrents.length; i++) {
                        var currentTorrent = torrents[i];
                        var currentNumericQuality = currentTorrent.quality;
                        
                        var lowerTitle = (currentTorrent.title || '').toLowerCase();
                        if (/\b(ts|telesync|camrip|cam)\b/i.test(lowerTitle)) {
                           if (currentNumericQuality < 720) continue;
                        }

                        if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                           continue;
                        }

                        if (Q_LOGGING) {
                            console.log("MAXSM-RATINGS", "card: " + cardId + ", Torrent: " + currentTorrent.title + " | Quality: " + currentNumericQuality + "p");
                        }
                        if (currentNumericQuality > bestNumericQuality) {
                            bestNumericQuality = currentNumericQuality;
                            bestFoundTorrent = currentTorrent;
                        }
                    }
                    if (bestFoundTorrent) {
                        if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: Found best torrent: \"" + bestFoundTorrent.title + "\" with quality: " + bestNumericQuality + "p");
                        apiCallback({
                            quality: translateQuality(bestFoundTorrent.quality || bestNumericQuality),
                            title: bestFoundTorrent.title
                        });
                    } else {
                        if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: No suitable torrents found.");
                        apiCallback(null);
                    }
                } catch (e) {
                    console.error("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: " + strategyName + " error parsing response:", e);
                    apiCallback(null);
                }
            });
        }

        var searchStrategies = [];
        if (normalizedCard.original_title && /[a-zа-яё0-9]/i.test(normalizedCard.original_title)) {
            searchStrategies.push({
                title: normalizedCard.original_title.trim(),
                year: year,
                exact: true,
                name: "OriginalTitle Exact Year"
            });
        }
        if (normalizedCard.title && /[a-zа-яё0-9]/i.test(normalizedCard.title)) {
            searchStrategies.push({
                title: normalizedCard.title.trim(),
                year: year,
                exact: true,
                name: "Title Exact Year"
            });
        }

        function executeNextStrategy(index) {
            if (index >= searchStrategies.length) {
                if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: All strategies failed.");
                callback(null);
                return;
            }
            var strategy = searchStrategies[index];
            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: Trying strategy: " + strategy.name);
            searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
                if (result !== null) {
                    if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: Successfully found quality: " + result.quality);
                    callback(result);
                } else {
                    executeNextStrategy(index + 1);
                }
            });
        }

        if (searchStrategies.length > 0) {
            executeNextStrategy(0);
        } else {
            if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + cardId + ", quality: JacRed: No valid search titles.");
            callback(null);
        }
    }

    // Функции для работы с кешем качества
    function getQualityCache(key) {
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < Q_CACHE_TIME) ? item : null;
    }

    function saveQualityCache(key, data, localCurrentCard) {
        if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + localCurrentCard + ", quality: Save quality cache");
        var cache = Lampa.Storage.get(QUALITY_CACHE) || {};
        cache[key] = {
            quality: data.quality || null,
            timestamp: Date.now()
        };
        Lampa.Storage.set(QUALITY_CACHE, cache);
    }

    // Функция применения качества к карточке
    function applyQualityToCard(card, quality, source, qCacheKey) {
        if (!document.body.contains(card)) return;
        
        card.setAttribute('data-quality-added', 'true');
        var cardView = card.querySelector('.card__view');
        if (!cardView) return;

        // Удаляем существующие элементы качества
        var existingQualityElements = cardView.getElementsByClassName('card__quality');
        while(existingQualityElements.length > 0){
            existingQualityElements[0].parentNode.removeChild(existingQualityElements[0]);
        }

        // Сохраняем в кеш если данные от JacRed
        if (source === 'JacRed' && quality && quality !== 'NO') {
            var cardId = card.card_data ? card.card_data.id : 'unknown';
            saveQualityCache(qCacheKey, { quality: quality }, cardId);
        }

        if (quality && quality !== 'NO') {
            var qualityDiv = document.createElement('div');
            qualityDiv.className = 'card__quality';
            var qualityInner = document.createElement('div');
            qualityInner.textContent = quality;
            qualityDiv.appendChild(qualityInner);
            cardView.appendChild(qualityDiv);
        }
    }

    // Основная функция обновления карточек
    function updateCards(cards) {
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (card.hasAttribute('data-quality-added')) continue;
            
            var cardView = card.querySelector('.card__view');
            if (localStorage.getItem('maxsm_ratings_quality_tv') === 'false') {
                if (cardView) {
                    var typeElements = cardView.getElementsByClassName('card__type');
                    if (typeElements.length > 0) continue;
                }
            }

            (function (currentCard) {
                var data = currentCard.card_data;
                if (!data) return;
                
                var normalizedCard = {
                    id: data.id || '',
                    title: data.title || data.name || '',
                    original_title: data.original_title || data.original_name || '',
                    release_date: data.release_date || data.first_air_date || '',
                    type: getCardType(data)
                };
                
                var localCurrentCard = normalizedCard.id;
                var qCacheKey = normalizedCard.type + '_' + normalizedCard.id;
                var cacheQualityData = getQualityCache(qCacheKey);
                
                // Если есть кеш - сразу применяем
                if (cacheQualityData) {
                    if (Q_LOGGING) console.log("MAXSM-RATINGS", "card: " + localCurrentCard + ", quality: Get Quality data from cache");
                    applyQualityToCard(currentCard, cacheQualityData.quality, 'Cache', qCacheKey);
                }
                // Если нет кеша - запрашиваем у JacRed
                else {
                    getBestReleaseFromJacred(normalizedCard, localCurrentCard, function (jrResult) {
                        var quality = (jrResult && jrResult.quality) || null;
                        applyQualityToCard(currentCard, quality, 'JacRed', qCacheKey);
                    });
                }
            })(card);
        }
    }

    // Observer для отслеживания новых карточек
    var observer = new MutationObserver(function (mutations) {
        var newCards = [];
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                    
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                    
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        newCards.push(nestedCards[k]);
                    }
                }
            }
        }
        if (newCards.length) updateCards(newCards);
    });

    // Инициализация плагина
    function startPlugin() {
        console.log("MAXSM-RATINGS-QUALITY", "Plugin started!");
        
        // Настройки по умолчанию
        if (!localStorage.getItem('maxsm_ratings_quality')) {
            localStorage.setItem('maxsm_ratings_quality', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_quality_inlist')) {
            localStorage.setItem('maxsm_ratings_quality_inlist', 'true');
        }
        if (!localStorage.getItem('maxsm_ratings_quality_tv')) {
            localStorage.setItem('maxsm_ratings_quality_tv', 'false');
        }

        // Запуск observer если включено отображение качества в списках
        if (localStorage.getItem('maxsm_ratings_quality_inlist') === 'true') {
            observer.observe(document.body, { childList: true, subtree: true });
            console.log('MAXSM-RATINGS: observer Start');
            
            // Обработка уже существующих карточек
            var existingCards = document.querySelectorAll('.card');
            if (existingCards.length) updateCards(existingCards);
        }
    }

    if (!window.maxsmRatingsQualityPlugin) {
        window.maxsmRatingsQualityPlugin = true;
        startPlugin();
    }
})();
