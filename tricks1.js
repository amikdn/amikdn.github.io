(function(){
    "use strict";

    const CACHE_TIME = 24 * 60 * 60 * 1000;  // 24 часа
    let lampaRatingCache = {};

    /**
     * Запрашивает с cub.red данные о реакциях для конкретного контента.
     * Ожидается, что API вернёт JSON с полями: like, plus, dislike, minus, shit.
     * @param {string|number} itemId – уникальный идентификатор фильма/сериала.
     * @returns {Promise<number|null>} – рейтинг Lampa или null в случае ошибки.
     */
    async function fetchLampaRating(itemId) {
        try {
            const response = await fetch(`http://cub.red/ratings?item_id=${itemId}`);
            if (!response.ok) throw new Error("Ошибка получения рейтинга Lampa");
            const data = await response.json();
            // Подсчитываем положительные и отрицательные реакции
            const positive = (data.like || 0) + (data.plus || 0);
            const negative = (data.dislike || 0) + (data.minus || 0) + (data.shit || 0);
            let ratingValue = 0;
            if (positive + negative > 0) {
                ratingValue = (positive / (positive + negative)) * 10;
            }
            // Округляем до одного знака после запятой
            ratingValue = ratingValue.toFixed(1);
            return parseFloat(ratingValue);
        } catch (err) {
            console.error("Ошибка получения рейтинга Lampa:", err);
            return null;
        }
    }

    /**
     * Обёртка над fetchLampaRating с кэшированием.
     * @param {string|number} itemId – уникальный идентификатор.
     * @returns {Promise<number|null>}
     */
    async function getLampaRating(itemId) {
        const now = Date.now();
        if (lampaRatingCache[itemId] && (now - lampaRatingCache[itemId].timestamp < CACHE_TIME)) {
            return lampaRatingCache[itemId].value;
        }
        const rating = await fetchLampaRating(itemId);
        if (rating !== null) {
            lampaRatingCache[itemId] = { value: rating, timestamp: now };
        }
        return rating;
    }

    /**
     * Отображает рейтинг Lampa в UI.
     * @param {string|number} itemId – идентификатор контента.
     * @param {HTMLElement} render – контейнер, в который нужно вставить рейтинг.
     */
    async function showLampaRating(itemId, render) {
        const rating = await getLampaRating(itemId);
        if (rating !== null) {
            let ratingBlock = $(render).find("div.full-start__rate.rate--lampa");
            // Если блок рейтинга отсутствует – создаём его
            if (ratingBlock.length === 0) {
                ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                // Добавляем подпись с надписью Lampa и элемент для значения рейтинга
                ratingBlock.append($('<div class="rate-label">Lampa</div>'));
                ratingBlock.append($('<div class="rate-value"></div>'));
                // Размещаем блок рейтинга рядом с другими рейтингами (например, после .info__rate)
                $(render).find(".info__rate").after(ratingBlock);
            }
            ratingBlock.find(".rate-value").text(rating);
        }
    }

    /**
     * Интеграция в систему Lampa.
     * Подписываемся на событие "full" с типом "complite".
     * Когда карточка полностью отрендерена, если рейтинговый блок для Lampa ещё не добавлен,
     * добавляем индикатор загрузки и запускаем функцию получения рейтинга.
     */
    Lampa.Listener.follow("full", function(e) {
        if (e.type === "complite") {
            const render = e.object.activity.render();
            // Если блок рейтинга Lampa ещё не добавлен и отсутствует индикатор ожидания
            if ($('.rate--lampa', render).length === 0) {
                if (!$('.wait_rating', render).length) {
                    // Добавляем индикатор ожидания (аналогично существующему для KP/IMDb)
                    $('.info__rate', render).after('<div class="wait_rating" style="width:2em;margin-top:1em;margin-right:1em"><div class="broadcast__scan"><div></div></div></div>');
                }
                // Предполагается, что объект фильма находится в e.data.movie и имеет поле id
                if(e.data && e.data.movie && e.data.movie.id){
                    showLampaRating(e.data.movie.id, render);
                } else {
                    console.warn("Не найден объект фильма или его id для рейтинга Lampa.");
                }
            }
        }
    });
})();
