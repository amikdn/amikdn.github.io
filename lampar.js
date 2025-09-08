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
            display: none !important; /* Скрываем TMDB рейтинг */
        }
        .rate--lampa .rate-value.low { color: red; }
        .rate--lampa .rate-value.medium { color: orange; }
        .rate--lampa .rate-value.good { color: cornflowerblue; }
        .rate--lampa .rate-value.high { color: lawngreen; }
    `;

    // Добавление стилей в документ
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    console.log("LAMPA Rating: Стили добавлены");

    function calculateLampaRating10(reactions) {
        let weightedSum = 0;
        let totalCount = 0;
        reactions.forEach(item => {
            const count = parseInt(item.counter, 10);
            switch (item.type) {
                case "fire":
                    weightedSum += count * 5;
                    totalCount += count;
                    break;
                case "nice":
                    weightedSum += count * 4;
                    totalCount += count;
                    break;
                case "think":
                    weightedSum += count * 3;
                    totalCount += count;
                    break;
                case "bore":
                    weightedSum += count * 2;
                    totalCount += count;
                    break;
                case "shit":
                    weightedSum += count * 1;
                    totalCount += count;
                    break;
                default:
                    break;
            }
        });
        if(totalCount === 0) return 0;
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        return parseFloat(rating10.toFixed(1));
    }

    function fetchLampaRating(ratingKey, retries = 2) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "http://cub.rip/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 5000;
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if(data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating10(data.result);
                                console.log("LAMPA Rating: Успешно получен рейтинг", rating, "для", ratingKey);
                                resolve(rating);
                            } else {
                                console.warn("LAMPA Rating: Неверный формат ответа для", ratingKey, ":", data);
                                if (retries > 0) {
                                    console.log("LAMPA Rating: Повторная попытка для", ratingKey, "осталось попыток:", retries);
                                    setTimeout(() => fetchLampaRating(ratingKey, retries - 1).then(resolve).catch(reject), 1000);
                                } else {
                                    reject(new Error("Неверный формат ответа"));
                                }
                            }
                        } catch(e) {
                            console.error("LAMPA Rating: Ошибка парсинга ответа для", ratingKey, ":", e);
                            if (retries > 0) {
                                console.log("LAMPA Rating: Повторная попытка для", ratingKey, "осталось попыток:", retries);
                                setTimeout(() => fetchLampaRating(ratingKey, retries - 1).then(resolve).catch(reject), 1000);
                            } else {
                                reject(e);
                            }
                        }
                    } else {
                        console.warn("LAMPA Rating: Ошибка запроса, статус:", xhr.status, "для", ratingKey);
                        if (retries > 0) {
                            console.log("LAMPA Rating: Повторная попытка для", ratingKey, "осталось попыток:", retries);
                            setTimeout(() => fetchLampaRating(ratingKey, retries - 1).then(resolve).catch(reject), 1000);
                        } else {
                            reject(new Error("Ошибка запроса, статус: " + xhr.status));
                        }
                    }
                }
            };
            xhr.onerror = function(){
                console.error("LAMPA Rating: XHR ошибка для", ratingKey);
                if (retries > 0) {
                    console.log("LAMPA Rating: Повторная попытка для", ratingKey, "осталось попыток:", retries);
                    setTimeout(() => fetchLampaRating(ratingKey, retries - 1).then(resolve).catch(reject), 1000);
                } else {
                    reject(new Error("XHR ошибка"));
                }
            };
            xhr.ontimeout = function(){
                console.warn("LAMPA Rating: Таймаут запроса для", ratingKey);
                if (retries > 0) {
                    console.log("LAMPA Rating: Повторная попытка для", ratingKey, "осталось попыток:", retries);
                    setTimeout(() => fetchLampaRating(ratingKey, retries - 1).then(resolve).catch(reject), 1000);
                } else {
                    reject(new Error("Таймаут запроса"));
                }
            };
            xhr.send();
        });
    }

    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if(lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)){
            console.log("LAMPA Rating: Используется кэшированный рейтинг для", ratingKey, ":", lampaRatingCache[ratingKey].value);
            return lampaRatingCache[ratingKey].value;
        }
        try {
            let rating = await fetchLampaRating(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            return rating;
        } catch(e) {
            console.error("LAMPA Rating: Ошибка получения рейтинга для", ratingKey, ":", e.message);
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
            console.warn("LAMPA Rating: render отсутствует в полной карточке");
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

    function addLampaRatingToCard(card) {
        console.log("LAMPA Rating: Попытка добавить рейтинг для карточки", card);
        var vote = $(card).find('.card__vote');
        if (!vote.length) {
            console.warn("LAMPA Rating: .card__vote не найден для карточки", card);
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
            var id = $(card).data('id') || $(card).attr('data-id') || meta.id || $(card).attr('data-quality-id')?.replace('card_', '');
            if (id && Lampa.Storage.cache('card_' + id)) {
                meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
            }
        } catch (e) {
            console.warn("LAMPA Rating: Ошибка парсинга метаданных карточки:", e, "card:", card);
        }

        // Усиленная проверка типа контента
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
            else if ($(card).find('.card__title').text().match(/(сезон|серия|эпизод|ТВ|TV)/i)) isTV = true; // Проверка заголовка
        }

        // Проверка на основе URL изображения
        if (!isTV && $(card).find('.card__img').attr('src')) {
            let imgSrc = $(card).find('.card__img').attr('src');
            if (imgSrc.includes('tv')) isTV = true;
        }

        var method = meta.method || (isTV ? 'tv' : 'movie');
        var id = meta.id || meta.movie?.id || meta.tv?.id || $(card).attr('data-quality-id')?.replace('card_', '');
        if (method && id) {
            var ratingKey = `${method}_${id}`;
            console.log("LAMPA Rating: Формирование ratingKey:", ratingKey, "meta:", meta);
            vote.addClass('lampa-rating').text('0.0');
            getLampaRating(ratingKey).then(rating => {
                if (rating !== null && rating !== 0) {
                    vote.text(rating);
                    applyRatingColor(vote, rating);
                    console.log("LAMPA Rating: Установлен рейтинг", rating, "для", ratingKey);
                } else {
                    vote.text('N/A');
                    applyRatingColor(vote, 0);
                    console.warn("LAMPA Rating: Рейтинг не установлен для", ratingKey, ", rating:", rating);
                }
            });
        } else {
            console.warn("LAMPA Rating: Пропущена карточка, method:", method, "id:", id, "meta:", meta);
        }
    }

    // Обработка всех карточек
    function processAllCards() {
        console.log("LAMPA Rating: Запуск обработки всех карточек");
        $('.items-cards .card').each(function () {
            addLampaRatingToCard(this);
        });
    }

    // Обработка динамических изменений DOM
    new MutationObserver(function (muts) {
        console.log("LAMPA Rating: Обнаружены изменения в DOM");
        muts.forEach(function (m) {
            if (m.addedNodes) {
                $(m.addedNodes).find('.items-cards .card').each(function () {
                    console.log("LAMPA Rating: Обнаружена новая карточка", this);
                    addLampaRatingToCard(this);
                });
            }
            if (m.type === 'attributes' &&
                ['class', 'data-card', 'data-type', 'data-quality-id'].includes(m.attributeName) &&
                $(m.target).hasClass('card')) {
                console.log("LAMPA Rating: Изменены атрибуты карточки", m.target);
                addLampaRatingToCard(m.target);
            }
        });
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-card', 'data-type', 'data-quality-id']
    });

    // Периодическая обработка карточек
    setInterval(processAllCards, 1000);

    // Обработчик для полной карточки
    Lampa.Listener.follow('full', function(e){
        if(e.type === 'complite'){
            let render = e.object.activity.render();
            if(render && insertLampaBlock(render)){
                if(e.object.method && e.object.id){
                    let ratingKey = e.object.method + "_" + e.object.id;
                    console.log("LAMPA Rating: Обработка полной карточки с ratingKey:", ratingKey);
                    getLampaRating(ratingKey).then(rating => {
                        if(rating !== null){
                            let rateValue = $(render).find('.rate--lampa .rate-value');
                            rateValue.text(rating);
                            applyRatingColor(rateValue, rating);
                            console.log("LAMPA Rating: Установлен рейтинг", rating, "в полной карточке");
                        }
                    });
                } else {
                    console.warn("LAMPA Rating: Пропущена полная карточка, method:", e.object.method, "id:", e.object.id);
                }
            }
        }
    });

    // Инициализация при старте
    if (window.appready) {
        console.log("LAMPA Rating: Приложение уже готово, запуск обработки карточек");
        processAllCards();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                console.log("LAMPA Rating: Приложение готово, запуск обработки карточек");
                processAllCards();
            }
        });
    }
})();
