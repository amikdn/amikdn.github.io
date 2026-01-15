(function () {
    'use strict';
    const ratingCache = {
        caches: {},
        get(source, key) {
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            const data = cache[key];
            if (!data) return null;
            if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
                delete cache[key];
                Lampa.Storage.set(source, cache);
                return null;
            }
            return data;
        },
        set(source, key, value) {
            if (value.rating === 0 || value.rating === '0.0') return value;
            const cache = this.caches[source] || (this.caches[source] = Lampa.Storage.cache(source, 500, {}));
            value.timestamp = Date.now();
            cache[key] = value;
            Lampa.Storage.set(source, cache);
            return value;
        }
    };
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let taskQueue = [];
    let isProcessing = false;
    const taskInterval = 100; // Уменьшен интервал для более быстрой обработки
    let requestPool = [];
    let pendingRequests = new Map(); // Отслеживаем активные запросы, чтобы не дублировать
    function getRequest() {
        return requestPool.pop() || new Lampa.Reguest();
    }
    function releaseRequest(request) {
        request.clear();
        if (requestPool.length < 3) requestPool.push(request);
    }
    function processQueue() {
        if (isProcessing || !taskQueue.length) return;
        isProcessing = true;
        const task = taskQueue.shift();
        try {
            task.execute();
        } catch(e) {
            console.error('Error in task queue:', e);
        } finally {
            if (task.key) {
                pendingRequests.delete(task.key);
            }
            setTimeout(() => {
                isProcessing = false;
                processQueue();
            }, taskInterval);
        }
    }
    function addToQueue(task, key = null) {
        // Если указан ключ и запрос уже выполняется, не добавляем дубликат
        if (key && pendingRequests.has(key)) {
            return;
        }
        if (key) {
            pendingRequests.set(key, true);
        }
        taskQueue.push({ execute: task, key: key });
        processQueue();
    }
    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        let reactionCnt = {};
        const reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };
        reactions.forEach(item => {
            const count = parseInt(item.counter, 10) || 0;
            const coef = reactionCoef[item.type] || 0;
            weightedSum += count * coef;
            totalCount += count;
            reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
        });
        if (totalCount === 0) return { rating: 0, medianReaction: '' };
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        const finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
        let medianReaction = '';
        const medianIndex = Math.ceil(totalCount / 2.0);
        const sortedReactions = Object.entries(reactionCoef)
            .sort((a, b) => a[1] - b[1])
            .map(r => r[0]);
        let cumulativeCount = 0;
        while (sortedReactions.length && cumulativeCount < medianIndex) {
            medianReaction = sortedReactions.pop();
            cumulativeCount += (reactionCnt[medianReaction] || 0);
        }
        return { rating: finalRating, medianReaction: medianReaction };
    }
    function fetchLampaRating(ratingKey) {
        return new Promise((resolve) => {
            const request = getRequest();
            let url = "https://cubnotrip.top/api/reactions/get/" + ratingKey;
            request.timeout(10000);
            request.silent(url, (data) => {
                try {
                    if (data && data.result && Array.isArray(data.result)) {
                        let result = calculateLampaRating10(data.result);
                        resolve(result);
                    } else {
                        resolve({ rating: 0, medianReaction: '' });
                    }
                } catch {
                    resolve({ rating: 0, medianReaction: '' });
                } finally {
                    releaseRequest(request);
                }
            }, () => {
                releaseRequest(request);
                resolve({ rating: 0, medianReaction: '' });
            }, false);
        });
    }
    async function getLampaRating(ratingKey) {
        const cached = ratingCache.get('lampa_rating', ratingKey);
        if (cached) return cached;
        try {
            let result = await fetchLampaRating(ratingKey);
            return ratingCache.set('lampa_rating', ratingKey, result);
        } catch {
            return { rating: 0, medianReaction: '' };
        }
    }
    function getRatingPositionStyles(existingElement = null, card = null) {
        // Сначала проверяем существующие элементы рейтинга на странице для определения позиции
        let position = null; // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
        let existingRating = null;
        
        // Если передан существующий элемент, используем его
        if (existingElement) {
            existingRating = existingElement;
        } else {
            // Ищем любой элемент рейтинга на карточке
            if (card) {
                existingRating = card.querySelector('.card__vote:not(.rate--lampa)');
            }
            // Если не найден на карточке, ищем на странице
            if (!existingRating) {
                existingRating = document.querySelector('.card__vote:not(.rate--lampa), .rate--kp, .card__vote.rate--kp');
            }
        }
        
        // Если найден существующий элемент рейтинга, определяем его позицию
        if (existingRating) {
            let computedStyle = window.getComputedStyle(existingRating);
            let topValue = computedStyle.getPropertyValue('top');
            let rightValue = computedStyle.getPropertyValue('right');
            let bottomValue = computedStyle.getPropertyValue('bottom');
            let leftValue = computedStyle.getPropertyValue('left');
            
            // Определяем угол по значениям
            let top = topValue && topValue !== 'auto' && parseFloat(topValue) < 10;
            let bottom = bottomValue && bottomValue !== 'auto';
            let left = leftValue && leftValue !== 'auto' && parseFloat(leftValue) < 10;
            let right = rightValue && rightValue !== 'auto' && parseFloat(rightValue) < 10;
            
            if (top && left) {
                position = 'top-left';
            } else if (top && right) {
                position = 'top-right';
            } else if (bottom && left) {
                position = 'bottom-left';
            } else if (bottom && right) {
                position = 'bottom-right';
            } else if (top) {
                position = 'top-right'; // По умолчанию для top
            } else if (bottom) {
                position = 'bottom-right'; // По умолчанию для bottom
            }
            
            // Если позиция определена из существующего элемента, используем её стили
            if (position) {
                let borderRadius = computedStyle.getPropertyValue('border-radius') || '';
                let result = {
                    top: topValue || 'auto',
                    right: rightValue || 'auto',
                    bottom: bottomValue || 'auto',
                    left: leftValue || 'auto',
                    borderRadius: borderRadius
                };
                
                // Определяем правильный border-radius в зависимости от угла
                if (!borderRadius || borderRadius === '0px' || borderRadius.includes('1em')) {
                    if (position === 'top-left') {
                        result.borderRadius = '0 0 1em 0'; // Скругление только справа снизу
                    } else if (position === 'top-right') {
                        result.borderRadius = '0 0 0 1em'; // Скругление только слева снизу
                    } else if (position === 'bottom-left') {
                        result.borderRadius = '0 1em 0 0'; // Скругление только сверху справа
                    } else if (position === 'bottom-right') {
                        result.borderRadius = '1em 0 0 0'; // Скругление только сверху слева
                    }
                }
                
                return result;
            }
        }
        
        // Если позиция не определена, пробуем определить из темы
        let body = document.body;
        let html = document.documentElement;
        let themePosition = null;
        
        // Проверяем data-атрибуты и классы
        if (body && body.getAttribute('data-theme')) {
            let dataTheme = body.getAttribute('data-theme');
            if (dataTheme.includes('top-left') || dataTheme.includes('rating-top-left')) {
                position = 'top-left';
            } else if (dataTheme.includes('top-right') || dataTheme.includes('rating-top-right') || dataTheme.includes('top')) {
                position = 'top-right';
            } else if (dataTheme.includes('bottom-left') || dataTheme.includes('rating-bottom-left')) {
                position = 'bottom-left';
            } else if (dataTheme.includes('bottom-right') || dataTheme.includes('rating-bottom-right') || dataTheme.includes('bottom')) {
                position = 'bottom-right';
            }
        }
        
        // Проверяем data-rating-position
        if (!position && body && body.getAttribute('data-rating-position')) {
            let ratingPos = body.getAttribute('data-rating-position');
            if (ratingPos.includes('top-left')) {
                position = 'top-left';
            } else if (ratingPos.includes('top-right') || ratingPos.includes('top')) {
                position = 'top-right';
            } else if (ratingPos.includes('bottom-left')) {
                position = 'bottom-left';
            } else if (ratingPos.includes('bottom-right') || ratingPos.includes('bottom')) {
                position = 'bottom-right';
            }
        }
        
        // Применяем стили в зависимости от позиции
        if (position === 'top-left') {
            return {
                top: '0',
                right: 'auto',
                bottom: 'auto',
                left: '0',
                borderRadius: '0 0 1em 0' // Скругление только справа снизу
            };
        } else if (position === 'top-right') {
            return {
                top: '0',
                right: '0',
                bottom: 'auto',
                left: 'auto',
                borderRadius: '0 0 0 1em' // Скругление только слева снизу
            };
        } else if (position === 'bottom-left') {
            return {
                top: 'auto',
                right: 'auto',
                bottom: '0',
                left: '0',
                borderRadius: '0 1em 0 0' // Скругление только сверху справа
            };
        } else {
            // По умолчанию - нижний правый угол
            return {
                top: 'auto',
                right: '0',
                bottom: '0',
                left: 'auto',
                borderRadius: '1em 0 0 0' // Скругление только сверху слева
            };
        }
    }
    function getDefaultRating(card, event) {
        let defaultRating = null;
        let data = card ? (card.dataset || {}) : {};
        let cardData = event && event.object ? (event.object.data || {}) : {};
        
        // Сначала пробуем получить рейтинг TMDB (vote_average) - это дефолтный рейтинг в Lampa
        if (cardData.vote_average !== undefined && cardData.vote_average !== null) {
            defaultRating = parseFloat(cardData.vote_average);
        } else if (data.vote_average !== undefined && data.vote_average !== null) {
            defaultRating = parseFloat(data.vote_average);
        } else if (cardData.voteAverage !== undefined && cardData.voteAverage !== null) {
            defaultRating = parseFloat(cardData.voteAverage);
        } else if (data.voteAverage !== undefined && data.voteAverage !== null) {
            defaultRating = parseFloat(data.voteAverage);
        }
        
        // Если не нашли TMDB, пробуем получить из card_data
        if (!defaultRating && card && card.card_data) {
            let cardDataObj = card.card_data;
            if (cardDataObj.vote_average !== undefined && cardDataObj.vote_average !== null) {
                defaultRating = parseFloat(cardDataObj.vote_average);
            } else if (cardDataObj.voteAverage !== undefined && cardDataObj.voteAverage !== null) {
                defaultRating = parseFloat(cardDataObj.voteAverage);
            }
        }
        
        // Если все еще нет, пробуем получить рейтинг КП из данных карточки
        if (!defaultRating) {
            if (cardData.kp || cardData.rating_kp || cardData.rating) {
                defaultRating = cardData.kp || cardData.rating_kp || cardData.rating;
            } else if (data.kp || data.rating_kp || data.rating) {
                defaultRating = data.kp || data.rating_kp || data.rating;
            }
        }
        
        // Если не нашли в данных, пробуем получить из DOM элемента КП
        if (!defaultRating && card) {
            let kpElement = card.querySelector('.rate--kp .rate-value, .card__vote.rate--kp');
            if (kpElement) {
                let kpText = kpElement.textContent || kpElement.innerText;
                let kpMatch = kpText.match(/[\d.]+/);
                if (kpMatch) {
                    defaultRating = parseFloat(kpMatch[0]);
                }
            }
        }
        
        // Если все еще нет, пробуем получить из card_data (КП)
        if (!defaultRating && card && card.card_data) {
            let cardDataObj = card.card_data;
            if (!cardDataObj.vote_average && !cardDataObj.voteAverage) {
                defaultRating = cardDataObj.kp || cardDataObj.rating_kp || cardDataObj.rating;
            }
        }
        
        return defaultRating && defaultRating > 0 ? defaultRating : null;
    }
    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        
        // Не создаем блок заранее - он будет создан только если есть рейтинг Lampa > 0
        // Блок будет создан в обработчике события 'full' после получения рейтинга
        return false;
    }
    function insertCardRating(card, event) {
        // Ищем все элементы рейтинга на карточке
        let allVoteElements = card.querySelectorAll('.card__vote');
        let voteEl = null;
        
        // Сначала ищем наш элемент
        for (let el of allVoteElements) {
            if (el.classList.contains('rate--lampa')) {
                voteEl = el;
                break;
            }
        }
        
        // Если нет нашего элемента, ищем любой дефолтный элемент рейтинга для замены
        if (!voteEl && allVoteElements.length > 0) {
            voteEl = allVoteElements[0];
        }
        
        let data = card.dataset || {};
        let cardData = event.object.data || {};
        let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
        let type = 'movie';
        if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
            type = 'tv';
        }
        let ratingKey = type + "_" + id;
        
        const cached = ratingCache.get('lampa_rating', ratingKey);
        let defaultRating = getDefaultRating(card, event);
        
        // Если есть кэшированный рейтинг
        if (cached) {
            let ratingToShow = null;
            let showIcon = false;
            
            // Если рейтинг Lampa > 0, показываем его
            if (cached.rating !== 0 && cached.rating !== '0.0') {
                ratingToShow = cached.rating;
                showIcon = !!cached.medianReaction;
            } else if (defaultRating && defaultRating > 0) {
                // Если рейтинг Lampa = 0, показываем TMDB рейтинг
                ratingToShow = defaultRating.toFixed(1);
                showIcon = false;
            }
            
            // Если есть что показать, заменяем содержимое существующего элемента или создаем новый
            if (ratingToShow) {
                // Удаляем все дубликаты элементов рейтинга, оставляя только один
                let allVoteElements = card.querySelectorAll('.card__vote');
                if (allVoteElements.length > 1) {
                    // Оставляем первый найденный, остальные удаляем
                    for (let i = 1; i < allVoteElements.length; i++) {
                        allVoteElements[i].remove();
                    }
                    voteEl = allVoteElements[0];
                }
                
                if (!voteEl || !voteEl.parentNode) {
                    voteEl = document.createElement('div');
                    voteEl.className = 'card__vote rate--lampa';
                    
                    // Получаем стили позиционирования в зависимости от темы
                    let positionStyles = getRatingPositionStyles(null, card);
                    
                    voteEl.style.cssText = `
                        line-height: 1;
                        font-family: "SegoeUI", sans-serif;
                        cursor: pointer;
                        box-sizing: border-box;
                        outline: none;
                        user-select: none;
                        position: absolute;
                        top: ${positionStyles.top};
                        right: ${positionStyles.right};
                        bottom: ${positionStyles.bottom};
                        left: ${positionStyles.left};
                        background: rgba(0, 0, 0, 0.5);
                        color: #fff;
                        padding: 0.2em 0.5em;
                        border-radius: ${positionStyles.borderRadius};
                        display: flex;
                        align-items: center;
                        height: auto !important;
                        max-height: fit-content !important;
                        flex-shrink: 0 !important;
                        align-self: flex-start !important;
                        overflow: hidden;
                    `;
                    const parent = card.querySelector('.card__view') || card;
                    parent.appendChild(voteEl);
                } else {
                    // Заменяем класс и стили, если это был дефолтный элемент
                    if (!voteEl.classList.contains('rate--lampa')) {
                        // Удаляем все старые классы и добавляем наш
                        voteEl.className = 'card__vote rate--lampa';
                    // Применяем стили позиционирования, сохраняя существующую позицию если она задана
                    let positionStyles = getRatingPositionStyles(voteEl, card);
                        voteEl.style.top = positionStyles.top;
                        voteEl.style.right = positionStyles.right;
                        voteEl.style.bottom = positionStyles.bottom;
                        voteEl.style.left = positionStyles.left;
                        voteEl.style.borderRadius = positionStyles.borderRadius;
                        voteEl.style.padding = '0.2em 0.5em';
                        voteEl.style.fontSize = '';
                    }
                }
                
                voteEl.dataset.movieId = id.toString();
                let html = ratingToShow;
                if (showIcon && cached.medianReaction) {
                    let reactionSrc = 'https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg';
                    html += `<img style="width:1em;height:1em;margin:0 0.2em;vertical-align:middle;" src="${reactionSrc}">`;
                }
                // Обновляем содержимое и добавляем стили для иконки, чтобы она не выходила за пределы
                voteEl.innerHTML = html;
                // Убеждаемся, что иконка внутри окантовки
                let icon = voteEl.querySelector('img');
                if (icon) {
                    icon.style.maxWidth = '1em';
                    icon.style.maxHeight = '1em';
                    icon.style.display = 'inline-block';
                    icon.style.verticalAlign = 'middle';
                }
                voteEl.style.display = '';
            } else {
                // Если нечего показывать, удаляем только наш элемент
                if (voteEl && voteEl.classList.contains('rate--lampa')) {
                    voteEl.remove();
                }
            }
            return;
        }
        
        // Получаем рейтинг асинхронно сразу, используя ключ для предотвращения дубликатов
        addToQueue(() => {
            getLampaRating(ratingKey).then(result => {
                // Обновляем ссылку на элемент, так как он мог измениться
                let allVoteElements = card.querySelectorAll('.card__vote');
                let currentVoteEl = null;
                
                // Сначала ищем наш элемент
                for (let el of allVoteElements) {
                    if (el.classList.contains('rate--lampa')) {
                        currentVoteEl = el;
                        break;
                    }
                }
                
                // Если нет нашего элемента, ищем любой дефолтный элемент рейтинга для замены
                if (!currentVoteEl && allVoteElements.length > 0) {
                    currentVoteEl = allVoteElements[0];
                }
                
                let ratingToShow = null;
                let showIcon = false;
                
                // Если рейтинг Lampa > 0, показываем его
                if (result.rating !== 0 && result.rating !== '0.0' && result.rating !== null) {
                    ratingToShow = result.rating;
                    showIcon = !!result.medianReaction;
                } else if (defaultRating && defaultRating > 0) {
                    // Если рейтинг Lampa = 0, показываем TMDB рейтинг
                    ratingToShow = defaultRating.toFixed(1);
                    showIcon = false;
                }
                
                // Если есть что показать, заменяем содержимое существующего элемента или создаем новый
                if (ratingToShow) {
                    // Удаляем все дубликаты элементов рейтинга, оставляя только один
                    let allVoteElementsCheck = card.querySelectorAll('.card__vote');
                    if (allVoteElementsCheck.length > 1) {
                        // Оставляем первый найденный, остальные удаляем
                        for (let i = 1; i < allVoteElementsCheck.length; i++) {
                            allVoteElementsCheck[i].remove();
                        }
                        currentVoteEl = allVoteElementsCheck[0];
                    }
                    
                    if (!currentVoteEl || !currentVoteEl.parentNode) {
                        currentVoteEl = document.createElement('div');
                        currentVoteEl.className = 'card__vote rate--lampa';
                        
                        // Получаем стили позиционирования в зависимости от темы
                        let positionStyles = getRatingPositionStyles(null, card);
                        
                        currentVoteEl.style.cssText = `
                            line-height: 1;
                            font-family: "SegoeUI", sans-serif;
                            cursor: pointer;
                            box-sizing: border-box;
                            outline: none;
                            user-select: none;
                            position: absolute;
                            top: ${positionStyles.top};
                            right: ${positionStyles.right};
                            bottom: ${positionStyles.bottom};
                            left: ${positionStyles.left};
                            background: rgba(0, 0, 0, 0.5);
                            color: #fff;
                            padding: 0.2em 0.5em;
                            border-radius: ${positionStyles.borderRadius};
                            display: flex;
                            align-items: center;
                            height: auto !important;
                            max-height: fit-content !important;
                            flex-shrink: 0 !important;
                            align-self: flex-start !important;
                            overflow: hidden;
                        `;
                        const parent = card.querySelector('.card__view') || card;
                        parent.appendChild(currentVoteEl);
                    } else {
                        // Заменяем класс и стили, если это был дефолтный элемент
                        if (!currentVoteEl.classList.contains('rate--lampa')) {
                            // Удаляем все старые классы и добавляем наш
                            currentVoteEl.className = 'card__vote rate--lampa';
                            // Применяем стили позиционирования, сохраняя существующую позицию если она задана
                            let positionStyles = getRatingPositionStyles(currentVoteEl, card);
                            currentVoteEl.style.top = positionStyles.top;
                            currentVoteEl.style.right = positionStyles.right;
                            currentVoteEl.style.bottom = positionStyles.bottom;
                            currentVoteEl.style.left = positionStyles.left;
                            currentVoteEl.style.borderRadius = positionStyles.borderRadius;
                            currentVoteEl.style.padding = '0.2em 0.5em';
                            currentVoteEl.style.fontSize = '';
                            currentVoteEl.style.overflow = 'hidden';
                        }
                    }
                    
                    if (currentVoteEl.dataset.movieId !== id.toString()) {
                        currentVoteEl.dataset.movieId = id.toString();
                    }
                    
                    let html = ratingToShow;
                    if (showIcon && result.medianReaction) {
                        let reactionSrc = 'https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg';
                        html += `<img style="width:1em;height:1em;margin:0 0.2em;vertical-align:middle;max-width:1em;max-height:1em;display:inline-block;" src="${reactionSrc}">`;
                    }
                    currentVoteEl.innerHTML = html;
                    currentVoteEl.style.display = '';
                    currentVoteEl.style.overflow = 'hidden';
                } else {
                    // Если нечего показывать, удаляем только наш элемент
                    if (currentVoteEl && currentVoteEl.classList.contains('rate--lampa') && currentVoteEl.dataset.movieId === id.toString()) {
                        currentVoteEl.remove();
                    }
                }
            });
        });
    }
    function updateRatingPosition(ratingElement) {
        if (!ratingElement) return;
        // Сохраняем существующую позицию, если она уже задана темой
        let card = ratingElement.closest('.card');
        let positionStyles = getRatingPositionStyles(ratingElement, card);
        ratingElement.style.top = positionStyles.top;
        ratingElement.style.right = positionStyles.right;
        ratingElement.style.bottom = positionStyles.bottom;
        ratingElement.style.left = positionStyles.left;
        ratingElement.style.borderRadius = positionStyles.borderRadius;
        ratingElement.style.overflow = 'hidden';
    }
    function pollCards() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const data = card.card_data;
            if (data && data.id) {
                const ratingElement = card.querySelector('.card__vote.rate--lampa');
                if (!ratingElement || ratingElement.dataset.movieId !== data.id.toString()) {
                    insertCardRating(card, { object: { data } });
                } else {
                    // Обновляем позицию в соответствии с темой
                    updateRatingPosition(ratingElement);
                    
                    const ratingKey = (data.seasons || data.first_air_date || data.original_name) ? `tv_${data.id}` : `movie_${data.id}`;
                    const cached = ratingCache.get('lampa_rating', ratingKey);
                    let defaultRating = getDefaultRating(card, { object: { data } });
                    
                    if (cached) {
                        let ratingToShow = null;
                        let showIcon = false;
                        
                        // Если рейтинг Lampa > 0, показываем его
                        if (cached.rating !== 0 && cached.rating !== '0.0') {
                            ratingToShow = cached.rating;
                            showIcon = !!cached.medianReaction;
                        } else if (defaultRating && defaultRating > 0) {
                            // Если рейтинг Lampa = 0, показываем TMDB рейтинг
                            ratingToShow = defaultRating.toFixed(1);
                            showIcon = false;
                        }
                        
                        if (ratingToShow && ratingElement.innerHTML === '') {
                            let html = ratingToShow;
                            if (showIcon && cached.medianReaction) {
                                let reactionSrc = 'https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg';
                                html += `<img style="width:1em;height:1em;margin:0 0.2em;vertical-align:middle;" src="${reactionSrc}">`;
                            }
                            ratingElement.innerHTML = html;
                            ratingElement.style.display = '';
                        } else if (!ratingToShow) {
                            // Если нечего показывать, удаляем элемент
                            ratingElement.remove();
                        }
                    }
                }
            }
        });
        setTimeout(pollCards, 500);
    }
    function setupCardListener() {
        if (window.lampa_listener_extensions) return;
        window.lampa_listener_extensions = true;
        Object.defineProperty(window.Lampa.Card.prototype, 'build', {
            get() { return this._build; },
            set(func) {
                this._build = () => {
                    func.apply(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                };
            }
        });
    }
    function initPlugin() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = `
            .card__vote {
                display: flex !important;
                align-items: center !important;
                height: auto !important;
                max-height: fit-content !important;
                flex-shrink: 0 !important;
                align-self: flex-start !important;
            }
            .card__vote {
                overflow: hidden !important;
            }
            .card__vote img {
                vertical-align: middle !important;
                max-width: 1em !important;
                max-height: 1em !important;
                display: inline-block !important;
            }
            /* Стили для темы с рейтингом в верхнем углу */
            [data-theme*="top"] .card__vote.rate--lampa,
            .theme-top .card__vote.rate--lampa,
            .rating-top .card__vote.rate--lampa,
            body[data-rating-position="top"] .card__vote.rate--lampa {
                top: 0 !important;
                right: 0 !important;
                bottom: auto !important;
                left: auto !important;
                border-radius: 0 0 0 1em !important;
            }
            /* Стили для темы с рейтингом в нижнем углу (по умолчанию) */
            [data-theme*="bottom"] .card__vote.rate--lampa,
            .theme-bottom .card__vote.rate--lampa,
            .rating-bottom .card__vote.rate--lampa,
            body[data-rating-position="bottom"] .card__vote.rate--lampa {
                top: auto !important;
                right: 0.3em !important;
                bottom: 0.3em !important;
                left: auto !important;
                border-radius: 1em !important;
            }
            .full-start__rate.rate--lampa {
                display: flex !important;
                align-items: center !important;
                gap: 0.1em !important;
            }
            .full-start__rate.rate--lampa .rate-icon img {
                margin: 0 !important;
                vertical-align: middle !important;
            }
            @media (max-width: 480px) and (orientation: portrait) {
                .full-start__rate.rate--lampa {
                    min-width: 80px;
                }
            }
        `;
        document.head.appendChild(style);
        setupCardListener();
        pollCards();
        
        // Слушаем изменения темы и обновляем позицию рейтинга
        let lastTheme = null;
        function checkThemeChange() {
            let currentTheme = document.body.getAttribute('data-theme') || 
                             document.documentElement.getAttribute('data-theme') || 
                             (document.body.classList.contains('theme-top') ? 'top' : 'bottom');
            if (currentTheme !== lastTheme) {
                lastTheme = currentTheme;
                // Обновляем позицию всех элементов рейтинга
                document.querySelectorAll('.card__vote.rate--lampa').forEach(updateRatingPosition);
            }
        }
        
        // Проверяем изменения темы периодически
        setInterval(checkThemeChange, 1000);
        
        // Также слушаем изменения через MutationObserver
        if (window.MutationObserver) {
            let observer = new MutationObserver(() => {
                checkThemeChange();
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'class'] });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
        }
        
        Lampa.Listener.follow('card', (e) => {
            if (e.type === 'build' && e.object.card) {
                insertCardRating(e.object.card, e);
            }
        });
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                let render = e.object.activity.render();
                if (!render || !e.object.method || !e.object.id) return;
                
                let rateLine = $(render).find('.full-start-new__rate-line');
                if (rateLine.length === 0) return;
                
                // Удаляем существующий блок, если есть
                $(render).find('.rate--lampa').remove();
                
                let ratingKey = e.object.method + "_" + e.object.id;
                const cached = ratingCache.get('lampa_rating', ratingKey);
                
                // Если есть кэшированный рейтинг и он > 0
                if (cached && cached.rating !== 0 && cached.rating !== '0.0') {
                            let kpBlock = rateLine.find('.rate--kp');
                            let lampaBlockHtml = '<div class="full-start__rate rate--lampa">' +
                                '<div class="rate-value">' + cached.rating + '</div>' +
                                '<div class="rate-icon">' + (cached.medianReaction ? '<img style="width:1em;height:1em;margin:0 0.2em;vertical-align:middle;" src="https://cubnotrip.top/img/reactions/' + cached.medianReaction + '.svg">' : '') + '</div>' +
                                '<div class="source--name">LAMPA</div>' +
                                '</div>';
                    if (kpBlock.length > 0) {
                        kpBlock.after(lampaBlockHtml);
                    } else {
                        rateLine.append(lampaBlockHtml);
                    }
                    return;
                }
                
        // Получаем рейтинг асинхронно сразу, используя ключ для предотвращения дубликатов
        addToQueue(() => {
            getLampaRating(ratingKey).then(result => {
                        // Если рейтинг Lampa равен 0, НЕ показываем блок вообще
                        if (result.rating === 0 || result.rating === '0.0' || result.rating === null) {
                            $(render).find('.rate--lampa').remove();
                            return;
                        }
                        
                        // Если рейтинг > 0, создаем и показываем блок
                        if (result.rating !== null && result.rating > 0) {
                            let rateLine = $(render).find('.full-start-new__rate-line');
                            if (rateLine.length === 0) return;
                            
                            // Удаляем существующий блок, если есть
                            $(render).find('.rate--lampa').remove();
                            
                            let kpBlock = rateLine.find('.rate--kp');
                            let lampaBlockHtml = '<div class="full-start__rate rate--lampa">' +
                                '<div class="rate-value">' + result.rating + '</div>' +
                                '<div class="rate-icon">' + (result.medianReaction ? '<img style="width:1em;height:1em;margin:0 0.2em;vertical-align:middle;" src="https://cubnotrip.top/img/reactions/' + result.medianReaction + '.svg">' : '') + '</div>' +
                                '<div class="source--name">LAMPA</div>' +
                                '</div>';
                            if (kpBlock.length > 0) {
                                kpBlock.after(lampaBlockHtml);
                            } else {
                                rateLine.append(lampaBlockHtml);
                            }
                        } else {
                            // Если рейтинга нет (равен 0), удаляем блок
                            $(render).find('.rate--lampa').remove();
                        }
                    });
                });
            }
        });
    }
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') initPlugin();
        });
    }
})();
