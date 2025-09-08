(function() {
    'use strict';
    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;
    const CACHE_TIME = 24 * 60 * 60 * 1000;
    let lampaRatingCache = {};

    // Расчет рейтинга Lampa на шкале от 0 до 10
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
        if (totalCount === 0) return 0;
        const avgRating = weightedSum / totalCount;
        const rating10 = (avgRating - 1) * 2.5;
        return parseFloat(rating10.toFixed(1));
    }

    // Запрос рейтинга Lampa через API
    function fetchLampaRating(ratingKey) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "http://cub.rip/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 2000;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if (data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating10(data.result);
                                resolve(rating);
                            } else {
                                reject(new Error("Неверный формат ответа"));
                            }
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function() { reject(new Error("XHR ошибка")); };
            xhr.ontimeout = function() { reject(new Error("Таймаут запроса")); };
            xhr.send();
        });
    }

    // Получение рейтинга с учетом кэша
    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
            return lampaRatingCache[ratingKey].value;
        }
        try {
            let rating = await fetchLampaRating(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            return rating;
        } catch (e) {
            return null;
        }
    }

    // Вставка блока рейтинга Lampa на страницу детального просмотра
    function insertLampaBlock(render) {
        if (!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if (rateLine.length === 0) return false;
        if (rateLine.find('.rate--lampa').length > 0) return true;
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa">' +
                '<div class="rate-value">0.0</div>' +
                '<div class="source--name">LAMPA</div>' +
            '</div>';
        let kpBlock = rateLine.find('.rate--kp');
        if (kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
        } else {
            rateLine.append(lampaBlockHtml);
        }
        return true;
    }

    // Вставка блока рейтинга Lampa в постеры на главной странице
    function insertLampaPosterRating(card) {
        if (!card || !card.querySelector) return false;
        if (card.querySelector('.rate--lampa')) return true; // Уже добавлено
        const cardData = card.card_data || {};
        if (!cardData.id || !cardData.method) return false;

        const lampaBlockHtml =
            '<div class="card__vote rate--lampa">' +
                '<span class="rate-value">0.0</span>' +
                '<span class="source--name">LAMPA</span>' +
            '</div>';
        const cardContent = card.querySelector('.card__content') || card;
        cardContent.insertAdjacentHTML('beforeend', lampaBlockHtml);

        const ratingKey = cardData.method + "_" + cardData.id;
        getLampaRating(ratingKey).then(rating => {
            if (rating !== null) {
                card.querySelector('.rate--lampa .rate-value').textContent = rating;
            }
        });
        return true;
    }

    // Добавление стилей для рейтинга в постерах
    function addStyles() {
        const styleElement = document.createElement('style');
        const css = `
            .card__vote.rate--lampa {
                display: inline-flex;
                align-items: center;
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 14px;
                color: #fff;
            }
            .card__vote.rate--lampa .rate-value {
                font-weight: bold;
                margin-right: 4px;
            }
            .card__vote.rate--lampa .source--name {
                font-size: 12px;
                color: #ffcc00; /* Желтый цвет для надписи LAMPA */
            }
        `;
        styleElement.styleSheet ? styleElement.styleSheet.cssText = css : styleElement.appendChild(document.createTextNode(css));
        document.head.appendChild(styleElement);
    }

    // Подписка на событие полной загрузки страницы (для детального просмотра)
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            let render = e.object.activity.render();
            if (render && insertLampaBlock(render)) {
                if (e.object.method && e.object.id) {
                    let ratingKey = e.object.method + "_" + e.object.id;
                    getLampaRating(ratingKey).then(rating => {
                        if (rating !== null) {
                            $(render).find('.rate--lampa .rate-value').text(rating);
                        }
                    });
                }
            }
        }
    });

    // Подписка на событие построения карточек на главной странице
    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'build' && e.object.card) {
            insertLampaPosterRating(e.object.card);
        }
    });

    // Инициализация стилей при загрузке плагина
    addStyles();
})();