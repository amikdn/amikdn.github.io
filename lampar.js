(function(){
    'use strict';
    if(window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Стили для рейтинга на постере
    const styles = `
        .card__rating-overlay {
            position: absolute;
            top: 3em; /* Смещение вниз, чтобы не перекрывать метки Фильм/Сериал */
            left: -0.8em;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.4em 0.6em;
            border-radius: 0.3em;
            font-size: 0.8em;
            font-weight: bold;
            z-index: 1001; /* Выше других элементов */
            text-align: center;
            white-space: nowrap;
        }
        .items-cards .card__vote {
            display: none !important; /* Скрываем рейтинг TMDB на главной */
        }
    `;

    // Добавление стилей в документ
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

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

    function fetchLampaRating(ratingKey) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "http://cub.rip/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 5000; // Увеличен таймаут до 5 секунд
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
                                reject(new Error("Неверный формат ответа"));
                            }
                        } catch(e) {
                            console.error("LAMPA Rating: Ошибка парсинга ответа для", ratingKey, ":", e);
                            reject(e);
                        }
                    } else {
                        console.warn("LAMPA Rating: Ошибка запроса, статус:", xhr.status, "для", ratingKey);
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
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
        if ($(card).find('.card__rating-overlay').length) {
            console.log("LAMPA Rating: Рейтинг уже добавлен для карточки", card);
            return;
        }
        var view = $(card).find('.card__view');
        if (!view.length) {
            console.warn("LAMPA Rating: .card__view не найден для карточки", card);
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
            var id = $(card).data('id') || $(card).attr('data-id') || meta.id;
            if (id && Lampa.Storage.cache('card_' + id)) {
                meta = Object.assign(meta, Lampa.Storage.cache('card_' + id));
            }
        } catch (e) {
            console.warn("LAMPA Rating: Ошибка парсинга метаданных карточки:", e, "card:", card);
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

        var method = meta.method || (isTV ? 'tv' : 'movie');
        var id = meta.id || meta.movie?.id || meta.tv?.id;
        if (method && id) {
            var ratingKey = `${method}_${id}`;
            var ratingOverlay = $('<div class="card__rating-overlay">0.0</div>');
            view.css('position', 'relative').append(ratingOverlay);
            console.log("LAMPA Rating: Добавлен временный рейтинг 0.0 для", ratingKey, "card:", card);
            getLampaRating(ratingKey).then(rating => {
                if (rating !== null && rating !== 0) {
                    ratingOverlay.text(rating);
                    console.log("LAMPA Rating: Установлен рейтинг", rating, "для", ratingKey);
                } else {
                    ratingOverlay.text('N/A'); // Если рейтинг отсутствует
                    console.warn("LAMPA Rating: Рейтинг не установлен для", ratingKey, ", rating:", rating);
                }
            });
        } else {
            console.warn("LAMPA Rating: Пропущена карточка, method:", method, "id:", id, "meta:", meta);
        }
    }

    // Обработка всех карточек
    function processAllCards() {
        $('.items-cards .card').each(function () {
            addLampaRatingToCard(this);
        });
    }

    // Обработка динамических изменений DOM
    new MutationObserver(function (muts) {
        muts.forEach(function (m) {
            if (m.addedNodes) {
                $(m.addedNodes).find('.items-cards .card').each(function () {
                    addLampaRatingToCard(this);
                });
            }
            if (m.type === 'attributes' &&
                ['class', 'data-card', 'data-type'].includes(m.attributeName) &&
                $(m.target).hasClass('card')) {
                addLampaRatingToCard(m.target);
            }
        });
    }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-card', 'data-type']
    });

    // Периодическая обработка карточек
    setInterval(processAllCards, 1500);

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
                            $(render).find('.rate--lampa .rate-value').text(rating);
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
