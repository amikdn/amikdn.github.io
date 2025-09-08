(function(){
    'use strict';
    if(window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Стили для рейтинга на постере и скрытия TMDB рейтинга только на карточках
    const styles = `
        .card__rating-overlay {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            z-index: 10;
        }
        .items-cards .card__vote {
            display: none !important; /* Скрываем рейтинг TMDB только на карточках в списках */
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
            xhr.timeout = 2000;
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if(data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating10(data.result);
                                resolve(rating);
                            } else {
                                console.warn("LAMPA Rating: Неверный формат ответа для ratingKey:", ratingKey);
                                reject(new Error("Неверный формат ответа"));
                            }
                        } catch(e) {
                            console.error("LAMPA Rating: Ошибка парсинга ответа:", e);
                            reject(e);
                        }
                    } else {
                        console.warn("LAMPA Rating: Ошибка запроса, статус:", xhr.status, "для ratingKey:", ratingKey);
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function(){
                console.error("LAMPA Rating: XHR ошибка для ratingKey:", ratingKey);
                reject(new Error("XHR ошибка"));
            };
            xhr.ontimeout = function(){
                console.warn("LAMPA Rating: Таймаут запроса для ratingKey:", ratingKey);
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
            console.log("LAMPA Rating: Получен новый рейтинг для", ratingKey, ":", rating);
            return rating;
        } catch(e) {
            console.error("LAMPA Rating: Ошибка получения рейтинга для", ratingKey, ":", e.message);
            return null;
        }
    }

    function insertLampaBlock(render) {
        if(!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if(rateLine.length === 0) return false;
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
        return true;
    }

    function insertRatingOnPoster(card, rating) {
        const cardView = card.querySelector('.card__view');
        if (cardView && rating !== null && rating !== 0) {
            let ratingOverlay = cardView.querySelector('.card__rating-overlay');
            if (!ratingOverlay) {
                ratingOverlay = document.createElement('div');
                ratingOverlay.className = 'card__rating-overlay';
                cardView.appendChild(ratingOverlay);
            }
            ratingOverlay.textContent = rating;
            console.log("LAMPA Rating: Добавлен рейтинг", rating, "на карточку:", card);
        } else {
            console.warn("LAMPA Rating: Не добавлен рейтинг на карточку, rating:", rating, "cardView:", !!cardView);
        }
    }

    // Обработка карточек в списках
    Lampa.Listener.follow('view', function(e) {
        if (e.type === 'view_cards') {
            console.log("LAMPA Rating: Обработка события view_cards, найдено карточек:", e.cards.length);
            const cards = e.cards;
            cards.forEach(card => {
                const data = card.data || {};
                const method = data.method || (data.movie ? 'movie' : 'tv');
                const id = data.id || data.movie?.id;
                if (method && id) {
                    const ratingKey = `${method}_${id}`;
                    console.log("LAMPA Rating: Обрабатывается карточка с ratingKey:", ratingKey);
                    getLampaRating(ratingKey).then(rating => {
                        insertRatingOnPoster(card.element[0], rating);
                    });
                } else {
                    console.warn("LAMPA Rating: Пропущена карточка, method:", method, "id:", id);
                }
            });
        }
    });

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
})();
