(function() {
    'use strict';

    // Определение констант
    var CACHE_DURATION = 24 * 60 * 60 * 1000; // Срок хранения кэша качества
    var CACHE_STORAGE_KEY = 'qualview_quality_cache';
    var PROTOCOL_JACRED = 'https://';
    var DOMAIN_JACRED = 'jacred.xyz';
    var API_KEY_JACRED = ''; // Введите ключ при необходимости

    // Функция преобразования качества
    function convertQuality(resolution) {
        switch(resolution) {
            case 2160: return '4K';
            case 1080: return 'FHD';
            case 720: return 'HD';
            case 'TS': return 'TS';
            default: return resolution >= 720 ? 'HD' : 'SD';
        }
    }

    // Проверка на низкокачественные копии
    var forbiddenTerms = ['camrip', 'камрип', 'ts', 'telecine', 'telesync', 'telesynch', 'upscale', 'tc', 'тс'];
    var forbiddenPatterns = forbiddenTerms.map(term => new RegExp('\\b' + term + '\\b', 'i'));

    function detectLowQuality(title) {
        if (!title) return false;
        var lowercaseTitle = title.toLowerCase();
        return forbiddenPatterns.some(pattern => pattern.test(lowercaseTitle));
    }

    // Определение типа контента
    function determineType(item) {
        var contentType = item.media_type || item.type;
        if (contentType === 'movie' || contentType === 'tv') return contentType;
        return item.name || item.original_name ? 'tv' : 'movie';
    }

    // Запрос лучшего релиза из JacRed
    function fetchOptimalRelease(normalizedItem, itemId, onComplete) {
        var HIGHEST_RES = 2160;
        var detectedForbidden = false;

        function containsText(input) { return /[a-zа-яё]/i.test(input || ''); }
        function isNumericOnly(input) { return /^\d+$/.test(input); }

        // Получение года выпуска
        var releaseYear = '';
        var dateString = normalizedItem.release_date || '';
        if (dateString.length >= 4) releaseYear = dateString.substring(0, 4);
        if (!releaseYear || isNaN(releaseYear)) {
            onComplete(null);
            return;
        }

        var uniqueId = Lampa.Storage.get('lampac_unic_id', '');
        var requestUrl = PROTOCOL_JACRED + DOMAIN_JACRED + '/api/v2.0/indexers/all/results?' +
            'apikey=' + API_KEY_JACRED + '&uid=' + uniqueId + '&year=' + releaseYear;

        var titlePresent = false;
        if (normalizedItem.title && (containsText(normalizedItem.title) || isNumericOnly(normalizedItem.title))) {
            requestUrl += '&title=' + encodeURIComponent(normalizedItem.title.trim());
            titlePresent = true;
        }
        if (normalizedItem.original_title && (containsText(normalizedItem.original_title) || isNumericOnly(normalizedItem.original_title))) {
            requestUrl += '&title_original=' + encodeURIComponent(normalizedItem.original_title.trim());
            titlePresent = true;
        }
        if (!titlePresent) {
            onComplete(null);
            return;
        }

        new Lampa.Reguest().silent(requestUrl, function(responseData) {
            if (!responseData) {
                onComplete(null);
                return;
            }
            try {
                var parsedData = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
                var releases = parsedData.Results || [];
                if (!Array.isArray(releases)) releases = [];
                if (releases.length === 0) {
                    onComplete(null);
                    return;
                }

                var optimalRes = -1;
                var optimalRelease = null;
                var targetYear = parseInt(releaseYear, 10);
                var priorYear = targetYear - 1;

                for (var index = 0; index < releases.length; index++) {
                    var release = releases[index];
                    var details = release.info || release.Info || {};
                    var resValue = details.quality;
                    var yearValue = details.relased;
                    var checkTitle = release.Title || '';

                    if (typeof resValue !== 'number' || resValue === 0) continue;

                    var validYear = false;
                    var extractedYear = 0;
                    if (yearValue && !isNaN(yearValue)) {
                        extractedYear = parseInt(yearValue, 10);
                        if (extractedYear > 1900) validYear = true;
                    }
                    if (!validYear) continue;

                    if (extractedYear !== targetYear && extractedYear !== priorYear) continue;

                    if (detectLowQuality(checkTitle)) {
                        detectedForbidden = true;
                        continue;
                    }

                    if (resValue === HIGHEST_RES) {
                        onComplete({ quality: convertQuality(resValue), title: checkTitle });
                        return;
                    }

                    if (resValue > optimalRes) {
                        optimalRes = resValue;
                        optimalRelease = { title: checkTitle, quality: resValue, year: extractedYear };
                    }
                }

                if (optimalRelease) {
                    var convertedRes = convertQuality(optimalRelease.quality);
                    onComplete({ quality: convertedRes, title: optimalRelease.title });
                } else if (detectedForbidden) {
                    onComplete({ quality: convertQuality('TS'), title: "NOT SAVED" });
                } else {
                    onComplete(null);
                }
            } catch (error) {
                onComplete(null);
            }
        });
    }

    // Управление кэшем качества
    function retrieveQualityCache(entryKey) {
        var storedCache = Lampa.Storage.get(CACHE_STORAGE_KEY) || {};
        var cacheEntry = storedCache[entryKey];
        return cacheEntry && (Date.now() - cacheEntry.timestamp < CACHE_DURATION) ? cacheEntry : null;
    }

    function storeQualityCache(entryKey, entryData) {
        var storedCache = Lampa.Storage.get(CACHE_STORAGE_KEY) || {};
        storedCache[entryKey] = { quality: entryData.quality || null, timestamp: Date.now() };
        Lampa.Storage.set(CACHE_STORAGE_KEY, storedCache);
    }

    // Загрузка качества для детальной карточки
    function loadQualityForDetail(item, viewRenderer) {
        var standardizedItem = {
            id: item.id,
            title: item.title || item.name || '',
            original_title: item.original_title || item.original_name || '',
            release_date: item.release_date || item.first_air_date || '',
            type: determineType(item)
        };
        var itemIdentifier = standardizedItem.id;
        var cacheEntryKey = standardizedItem.type + '_' + standardizedItem.id;

        var cachedQuality = retrieveQualityCache(cacheEntryKey);
        if (cachedQuality) {
            refreshQualityDisplay(cachedQuality.quality, viewRenderer);
        } else {
            displayQualityLoader(viewRenderer);
            fetchOptimalRelease(standardizedItem, itemIdentifier, function(releaseResult) {
                var resQuality = (releaseResult && releaseResult.quality) || null;
                if (resQuality && resQuality !== 'NO') {
                    storeQualityCache(cacheEntryKey, { quality: resQuality });
                    refreshQualityDisplay(resQuality, viewRenderer);
                } else {
                    removeQualityElements(viewRenderer);
                }
            });
        }
    }

    function refreshQualityDisplay(resQuality, viewRenderer) {
        if (!viewRenderer) return;
        var ratingSection = $('.full-start-new__rate-line', viewRenderer);
        if (!ratingSection.length) return;
        var qualityDisplay = $('.full-start__status.qualview-quality', viewRenderer);
        if (qualityDisplay.length) {
            qualityDisplay.text(resQuality).css('opacity', '1');
        } else {
            var newDisplay = $('<div class="full-start__status qualview-quality">' + resQuality + '</div>');
            ratingSection.append(newDisplay);
        }

        var detailsSection = $('.full-start-new__details', viewRenderer);
        if (detailsSection.length) {
            var qualitySpan = detailsSection.find('span:contains("Качество:")');
            if (qualitySpan.length) {
                qualitySpan.text('Качество: ' + resQuality);
            }
        }
    }

    function displayQualityLoader(viewRenderer) {
        if (!viewRenderer) return;
        var ratingSection = $('.full-start-new__rate-line', viewRenderer);
        if (ratingSection.length && !$('.full-start__status.qualview-quality', viewRenderer).length) {
            var loaderElement = $('<div class="full-start__status qualview-quality">...</div>');
            loaderElement.css('opacity', '0.7');
            ratingSection.append(loaderElement);
        }
    }

    function removeQualityElements(viewRenderer) {
        if (viewRenderer) $('.full-start__status.qualview-quality', viewRenderer).remove();
    }

    // Обновление качества на карточках списка
    function refreshListItems(itemsList) {
        for (var idx = 0; idx < itemsList.length; idx++) {
            var itemElement = itemsList[idx];
            if (itemElement.hasAttribute('data-quality-added')) continue;

            var itemInfo = itemElement.card_data;
            if (!itemInfo) continue;

            var standardizedInfo = {
                id: itemInfo.id || '',
                title: itemInfo.title || itemInfo.name || '',
                original_title: itemInfo.original_title || itemInfo.original_name || '',
                release_date: itemInfo.release_date || itemInfo.first_air_date || '',
                type: determineType(itemInfo)
            };

            (function(currElement, stdInfo, entryKey) {
                var cachedEntry = retrieveQualityCache(entryKey);
                if (cachedEntry) {
                    applyQualityToItem(currElement, cachedEntry.quality);
                } else {
                    applyQualityToItem(currElement, '...');
                    fetchOptimalRelease(stdInfo, stdInfo.id, function(releaseData) {
                        var resQuality = (releaseData && releaseData.quality) || null;
                        applyQualityToItem(currElement, resQuality);
                        if (resQuality && resQuality !== 'NO') storeQualityCache(entryKey, { quality: resQuality });
                    });
                }
            })(itemElement, standardizedInfo, standardizedInfo.type + '_' + standardizedInfo.id);
        }
    }

    function applyQualityToItem(itemElement, resQuality) {
        if (!document.body.contains(itemElement)) return;
        itemElement.setAttribute('data-quality-added', 'true');
        var viewSection = itemElement.querySelector('.card__view');
        if (!viewSection) return;

        var existingQuality = viewSection.querySelectorAll('.card__quality');
        Array.from(existingQuality).forEach(el => el.remove());

        if (resQuality && resQuality !== 'NO') {
            var qualityContainer = document.createElement('div');
            qualityContainer.className = 'card__quality';
            var innerContainer = document.createElement('div');
            innerContainer.textContent = resQuality;
            qualityContainer.appendChild(innerContainer);
            viewSection.appendChild(qualityContainer);
        }
    }

    // Наблюдатель изменений DOM
    var domWatcher = new MutationObserver(function(changes) {
        var addedItems = [];
        changes.forEach(function(change) {
            if (change.addedNodes) {
                change.addedNodes.forEach(function(nodeElem) {
                    if (nodeElem.nodeType === 1) {
                        if (nodeElem.classList.contains('card')) addedItems.push(nodeElem);
                        nodeElem.querySelectorAll('.card').forEach(c => addedItems.push(c));
                    }
                });
            }
        });
        if (addedItems.length) refreshListItems(addedItems);
    });

    // Запуск плагина
    function initializePlugin() {
        window.qualviewQualityPlugin = true;

        domWatcher.observe(document.body, { childList: true, subtree: true });

        Lampa.Listener.follow('full', function(event) {
            if (event.type === 'complite') {
                var activeRender = event.object.activity.render();
                loadQualityForDetail(event.data.movie, activeRender);
            }
        });
    }

    if (!window.qualviewQualityPlugin) initializePlugin();
})();
