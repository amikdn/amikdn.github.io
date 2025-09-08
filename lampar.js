(function(){
    'use strict';
    if(window.lampa_rating_plugin) {
        console.log("LAMPA Rating: Плагин уже загружен, пропуск");
        return;
    }
    window.lampa_rating_plugin = true;
    console.log("LAMPA Rating: Плагин инициализирован");

    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Стили для цветного рейтинга LAMPA
    const styles = `
        .card__vote.lampa-rating {
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.4em 0.6em;
            border-radius: 0.3em;
            font-weight: bold;
            z-index: 1001;
        }
        .card__vote.lampa-rating.low { color: red; }
        .card__vote.lampa-rating.medium { color: orange; }
        .card__vote.lampa-rating.good { color: cornflowerblue; }
        .card__vote.lampa-rating.high { color: lawngreen; }
        .card__vote:not(.lampa-rating) {
            display: none !important;
        }
        .rate--lampa .rate-value.low { color: red; }
        .rate--lampa .rate-value.medium { color: orange; }
        .rate--lampa .rate-value.good { color: cornflowerblue; }
        .rate--lampa .rate-value.high { color: lawngreen; }
    `;

    // Добавление стилей
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    console.log("LAMPA Rating: Стили добавлены");

    function normalizeTitle(title) {
        if (!title) return '';
        return title.toLowerCase()
            .replace(/[\s.,:;''`!?]+/g, ' ')
            .replace(/^[ \/\\]+/, '')
            .replace(/[ \/\\]+$/, '')
            .replace(/ё/g, 'е')
            .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
            .trim();
    }

    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        reactions.forEach(item => {
            const count = parseInt(item.counter, 10);
            switch (item.type) {
                case "fire": weightedSum += count * 5; totalCount += count; break;
                case "nice": weightedSum += count * 4; totalCount += count; break;
                case "think": weightedSum += count * 3; totalCount += count; break;
                case "bore": weightedSum += count * 2; totalCount += count; break;
                case "shit": weightedSum += count * 1; totalCount += count; break;
            }
        });
        if(totalCount === 0) return 0;
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        return parseFloat(rating10.toFixed(1));
    }

    function fetchLampaRating(ratingKey) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "https://cub.rip/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 5000;
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if(data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating10(data.result);
                                console.log("LAMPA Rating: Получен рейтинг", rating, "для", ratingKey);
                                resolve(rating);
                            } else {
                                console.warn("LAMPA Rating: Неверный формат ответа для", ratingKey);
                                reject(new Error("Неверный формат ответа"));
                            }
                        } catch(e) {
                            console.error("LAMPA Rating: Ошибка парсинга для", ratingKey, e);
                            reject(e);
                        }
                    } else {
                        console.warn("LAMPA Rating: Ошибка запроса, статус:", xhr.status, "для", ratingKey);
                        reject(new Error("Ошибка запроса: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function(){
                console.error("LAMPA Rating: XHR ошибка для", ratingKey);
                reject(new Error("XHR ошибка"));
            };
            xhr.ontimeout = function(){
                console.warn("LAMPA Rating: Таймаут запроса для", ratingKey);
                reject(new Error("Таймаут запроса"));
            };
            xhr.send();
        });
    }

    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if(lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)){
            console.log("LAMPA Rating: Кэшированный рейтинг для", ratingKey, ":", lampaRatingCache[ratingKey].value);
            return lampaRatingCache[ratingKey].value;
        }
        try {
            let rating = await fetchLampaRating(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            return rating;
        } catch(e) {
            console.error("LAMPA Rating: Ошибка получения рейтинга для", ratingKey, e.message);
            return null;
        }
    }

    function applyRatingColor(element, rating) {
        if (rating === null || rating === 0) return;
        element.removeClass('low medium good high');
        if (rating <= 3) element.addClass('low');
        else if (rating < 6) element.addClass('medium');
        else if (rating < 8) element.addClass('good');
        else element.addClass('high');
    }

    function insertLampaBlock(render) {
        if(!render) {
            console.warn("LAMPA Rating: render отсутствует");
            return false;
        }
        let rateLine = $(render).find('.full-start-new__rate-line');
        if(rateLine.length === 0) {
            console.warn("LAMPA Rating: .full-start-new__rate-line не найден");
            return false;
        }
        if(rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa">' +
                '<div class="rate-value">0.0</div>' +
                '<div class="source--name">LAMPA</div>' +
            '</div>';
        let kpBlock = rateLine.find('.rate--kp');
        if(kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        console.log("LAMPA Rating: Вставлен блок LAMPA в полную карточку");
        return true;
    }

    function extractMethodAndIdFromUrl(url) {
        if (!url) return { method: null, id: null };
        const match = url.match(/card\/tmdb\/(movie|tv)\/(\d+)-/);
        if (match) {
            return { method: match[1], id: match[2] };
        }
        return { method: null, id: null };
    }

    function addLampaRatingToCard(card) {
        console.log("LAMPA Rating: Обработка карточки");
        var vote = $(card).find('.card__vote');
        if (!vote.length) {
            console.warn("LAMPA Rating: .card__vote не найден");
            return;
        }

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
        } catch (e) {
            console.warn("LAMPA Rating: Ошибка парсинга метаданных:", e);
        }

        var title = normalizeTitle(meta.title || meta.name || meta.original_title || meta.original_name || $(card).find('.card__title').text());
        var year = meta.release_date?.slice(0, 4) || meta.first_air_date?.slice(0, 4) || meta.year || '';
        var cacheKey = `lampa_rating_key_${title}_${year}`;
        var cachedData = Lampa.Storage.cache(cacheKey, 0x1f4, {});
        if (cachedData.ratingKey && (Date.now() - cachedData.timestamp < CACHE_TIME)) {
            console.log("LAMPA Rating: Кэшированный ratingKey:", cachedData.ratingKey, "title:", title, "year:", year);
            var ratingKey = cachedData.ratingKey;
            vote.addClass('lampa-rating').text('0.0');
            getLampaRating(ratingKey).then(rating => {
                if (rating !== null && rating !== 0) {
                    vote.text(rating);
                    applyRatingColor(vote, rating);
                    console.log("LAMPA Rating: Установлен рейтинг", rating, "для", ratingKey);
                } else {
                    vote.text('N/A');
                    console.warn("LAMPA Rating: Рейтинг не найден для", ratingKey);
                }
            });
            return;
        }

        var url = meta.url || $(card).find('a').attr('href') || '';
        var { method, id } = extractMethodAndIdFromUrl(url);
        if (!method || !id) {
            var isTV = meta.type === 'tv' || meta.card_type === 'tv' ||
                       meta.seasons || meta.number_of_seasons > 0 ||
                       meta.first_air_date || meta.is_series;
            method = meta.method || (isTV ? 'tv' : 'movie');
            id = meta.id || meta.movie?.id || meta.tv?.id;
            if (!id) {
                console.warn("LAMPA Rating: Не удалось определить id, title:", title, "year:", year);
                return;
            }
        }

        var ratingKey = `${method}_${id}`;
        console.log("LAMPA Rating: Новый ratingKey:", ratingKey, "title:", title, "year:", year, "url:", url);
        Lampa.Storage.set(cacheKey, { ratingKey: ratingKey, timestamp: Date.now() });
        vote.addClass('lampa-rating').text('0.0');
        getLampaRating(ratingKey).then(rating => {
            if (rating !== null && rating !== 0) {
                vote.text(rating);
                applyRatingColor(vote, rating);
                console.log("LAMPA Rating: Установлен рейтинг", rating, "для", ratingKey);
            } else {
                vote.text('N/A');
                console.warn("LAMPA Rating: Рейтинг не найден для", ratingKey);
            }
        });
    }

    function processAllCards() {
        console.log("LAMPA Rating: Обработка всех карточек");
        $('.card').each(function () {
            addLampaRatingToCard(this);
        });
    }

    new MutationObserver(function (muts) {
        console.log("LAMPA Rating: Изменения в DOM");
        muts.forEach(function (m) {
            if (m.addedNodes) {
                $(m.addedNodes).find('.card').each(function () {
                    addLampaRatingToCard(this);
                });
            }
            if (m.type === 'attributes' && $(m.target).hasClass('card')) {
                addLampaRatingToCard(m.target);
            }
        });
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-card']
    });

    setInterval(processAllCards, 1000);

    Lampa.Listener.follow('full', function(e){
        if(e.type === 'complite'){
            let render = e.object.activity.render();
            if(render && insertLampaBlock(render)){
                if(e.object.method && e.object.id){
                    let ratingKey = e.object.method + "_" + e.object.id;
                    console.log("LAMPA Rating: Полная карточка, ratingKey:", ratingKey);
                    getLampaRating(ratingKey).then(rating => {
                        if(rating !== null){
                            let rateValue = $(render).find('.rate--lampa .rate-value');
                            rateValue.text(rating);
                            applyRatingColor(rateValue, rating);
                            console.log("LAMPA Rating: Установлен рейтинг", rating, "в полной карточке");
                            let title = normalizeTitle(e.object.title || e.object.name || e.object.original_title || e.object.original_name);
                            let year = e.object.release_date?.slice(0, 4) || e.object.first_air_date?.slice(0, 4) || e.object.year || '';
                            Lampa.Storage.set(`lampa_rating_key_${title}_${year}`, { ratingKey: ratingKey, timestamp: Date.now() });
                        }
                    });
                } else {
                    console.warn("LAMPA Rating: Пропущена полная карточка, method:", e.object.method, "id:", e.object.id);
                }
            }
        }
    });

    if (window.appready) {
        console.log("LAMPA Rating: Приложение готово, запуск обработки");
        processAllCards();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log("LAMPA Rating: Приложение готово, запуск обработки");
                processAllCards();
            }
        });
    }
})();
