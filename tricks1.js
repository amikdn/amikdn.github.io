(function(){
    "use strict";

    const CACHE_TIME = 24 * 60 * 60 * 1000;  // 24 часа
    let lampaRatingCache = {};

    /**
     * Запрашивает рейтинг Lampa с cub.red по сформированному ключу.
     * @param {string} ratingKey - ключ запроса, сформированный как method + "_" + id.
     * @returns {Promise<number|null>} - рейтинг Lampa (число) или null в случае ошибки.
     */
    function fetchLampaRatingByXHR(ratingKey) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            // Формируем URL для получения рейтинга
            var ratingUrl = "http://cub.red/api/reactions/get/" + ratingKey;
            xhr.open("GET", ratingUrl, true);
            xhr.timeout = 2000;
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        try {
                            var data = JSON.parse(xhr.responseText);
                            // Предполагаем, что data – массив реакций,
                            // где каждая реакция имеет поля: type и value.
                            var positive = 0, negative = 0;
                            data.forEach(function(item){
                                if(item.type === "like" || item.type === "plus"){
                                    positive += parseInt(item.value);
                                }
                                if(item.type === "dislike" || item.type === "minus" || item.type === "shit"){
                                    negative += parseInt(item.value);
                                }
                            });
                            // Вычисляем рейтинг: positive / (positive + negative) * 10
                            let ratingValue = 0;
                            if((positive + negative) > 0){
                                ratingValue = (positive / (positive + negative)) * 10;
                            }
                            // Округляем до одного знака после запятой
                            ratingValue = ratingValue.toFixed(1);
                            resolve(parseFloat(ratingValue));
                        } catch(e){
                            reject(e);
                        }
                    } else {
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function(){ reject(new Error("Ошибка XHR")); };
            xhr.ontimeout = function(){ reject(new Error("Таймаут запроса")); };
            xhr.send();
        });
    }

    /**
     * Обертка с кэшированием для получения рейтинга Lampa.
     * @param {string} ratingKey - ключ запроса.
     * @returns {Promise<number|null>}
     */
    async function getLampaRating(ratingKey) {
        const now = Date.now();
        if(lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)){
            return lampaRatingCache[ratingKey].value;
        }
        try {
            const rating = await fetchLampaRatingByXHR(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            return rating;
        } catch(e) {
            console.error("Ошибка получения рейтинга Lampa:", e);
            return null;
        }
    }

    /**
     * Отображает рейтинг Lampa в интерфейсе.
     * Использует объект события для формирования ключа запроса.
     * @param {object} event - объект события, содержащий:
     *   - object.method и object.id для формирования ключа,
     *   - object.activity.render() – функцию, возвращающую контейнер для рейтингов.
     */
    async function showLampaRating(event) {
        // Формируем ключ: method + "_" + id
        var ratingKey = event.object.method + "_" + event.object.id;
        const render = event.object.activity.render();
        const rating = await getLampaRating(ratingKey);
        if(rating !== null){
            let ratingBlock = $(render).find("div.full-start__rate.rate--lampa");
            // Если блока рейтинга Lampa нет – создаем его
            if(ratingBlock.length === 0){
                ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                // Добавляем подпись "Lampa" и блок для значения рейтинга
                ratingBlock.append($('<div class="rate-label">Lampa</div>'));
                ratingBlock.append($('<div class="rate-value"></div>'));
                // Размещаем блок рядом с другими рейтингами (например, после .info__rate)
                $(render).find(".info__rate").after(ratingBlock);
            }
            ratingBlock.find(".rate-value").text(rating);
        }
    }

    // Подписываемся на событие "full" с типом "complite"
    Lampa.Listener.follow("full", function(e){
        if(e.type === "complite"){
            const render = e.object.activity.render();
            // Если блок рейтинга Lampa отсутствует и индикатор ожидания не добавлен
            if($(render).find('.rate--lampa').length === 0){
                if($(render).find('.wait_rating').length === 0){
                    $(render).find(".info__rate").after('<div class="wait_rating" style="width:2em;margin-top:1em;margin-right:1em"><div class="broadcast__scan"><div></div></div></div>');
                }
                // Проверяем наличие данных для формирования ключа
                if(e.data && e.data.movie && e.data.movie.id && e.object.method){
                    showLampaRating(e);
                } else {
                    console.warn("Недостаточно данных для получения рейтинга Lampa.");
                }
            }
        }
    });
})();
