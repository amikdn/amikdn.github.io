(function(){
    "use strict";

    const CACHE_TIME = 24 * 60 * 60 * 1000;  // 24 часа
    let lampaRatingCache = {};

    // Функция для логирования отладочной информации
    function logDebug(message, obj){
        console.log("[LampaRating] " + message, obj || '');
    }

    /**
     * Запрашивает рейтинг Lampa с cub.red по сформированному ключу через XMLHttpRequest.
     * @param {string} ratingKey - ключ запроса, сформированный как method + "_" + id.
     * @returns {Promise<number|null>} - рейтинг Lampa или null в случае ошибки.
     */
    function fetchLampaRatingByXHR(ratingKey) {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            // Формируем URL для получения рейтинга
            var ratingUrl = "http://cub.red/api/reactions/get/" + ratingKey;
            logDebug("Запрос рейтинга по URL:", ratingUrl);
            xhr.open("GET", ratingUrl, true);
            xhr.timeout = 2000;
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        try {
                            var data = JSON.parse(xhr.responseText);
                            logDebug("Получены данные с cub.red:", data);
                            // Если API возвращает объект с полем result (массив реакций)
                            if(data && data.result && Array.isArray(data.result)){
                                let positive = 0, negative = 0;
                                data.result.forEach(function(item){
                                    // Положительные реакции: "fire", "think", "nice"
                                    if(item.type === "fire" || item.type === "think" || item.type === "nice"){
                                        positive += parseInt(item.counter);
                                    }
                                    // Отрицательные реакции: "bore", "shit"
                                    if(item.type === "bore" || item.type === "shit"){
                                        negative += parseInt(item.counter);
                                    }
                                });
                                let ratingValue = 0;
                                if((positive + negative) > 0){
                                    ratingValue = (positive / (positive + negative)) * 10;
                                }
                                // Округляем до одного знака после запятой
                                ratingValue = ratingValue.toFixed(1);
                                resolve(parseFloat(ratingValue));
                            } else {
                                reject(new Error("Неверный формат данных"));
                            }
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
     * Обёртка с кэшированием для получения рейтинга Lampa.
     * @param {string} ratingKey - ключ запроса.
     * @returns {Promise<number|null>}
     */
    async function getLampaRating(ratingKey) {
        const now = Date.now();
        if(lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)){
            logDebug("Используем кэшированный рейтинг для ключа " + ratingKey, lampaRatingCache[ratingKey]);
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
     * @param {object} event - объект события, содержащий:
     *   - object.method и object.id для формирования ключа,
     *   - object.activity.render() – функция, возвращающая контейнер для рейтингов.
     */
    async function showLampaRating(event) {
        logDebug("Обработка события для рейтинга Lampa", event);
        if(!event.object || !event.object.method || !event.object.id){
            logDebug("Недостаточно данных в объекте события", event);
            return;
        }
        // Формируем ключ: method + "_" + id
        var ratingKey = event.object.method + "_" + event.object.id;
        logDebug("Сформирован ключ рейтинга", ratingKey);
        const render = event.object.activity.render();
        if(!render){
            logDebug("Не найден render", render);
            return;
        }
        const rating = await getLampaRating(ratingKey);
        if(rating !== null){
            let ratingBlock = $(render).find("div.full-start__rate.rate--lampa");
            // Если блока рейтинга Lampa нет – создаем его
            if(ratingBlock.length === 0){
                ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                // Добавляем подпись "Lampa" и блок для значения рейтинга
                ratingBlock.append($('<div class="rate-label">Lampa</div>'));
                ratingBlock.append($('<div class="rate-value"></div>'));
                // Пробуем вставить блок после .info__rate, если он существует,
                // иначе – добавляем в конец render
                let infoRate = $(render).find(".info__rate");
                if(infoRate.length){
                    infoRate.after(ratingBlock);
                } else {
                    $(render).append(ratingBlock);
                }
                logDebug("Создан новый блок рейтинга", ratingBlock);
            }
            ratingBlock.find(".rate-value").text(rating);
            logDebug("Установлен рейтинг Lampa", rating);
        }
    }

    // Подписываемся на событие "full" с типом "complite"
    Lampa.Listener.follow("full", function(e){
        if(e.type === "complite"){
            const render = e.object.activity.render();
            logDebug("Событие full complite", {render: render, event: e});
            if($(render).find('.rate--lampa').length === 0){
                if($(render).find('.wait_rating').length === 0){
                    $(render).find(".info__rate").after('<div class="wait_rating" style="width:2em;margin-top:1em;margin-right:1em"><div class="broadcast__scan"><div></div></div></div>');
                }
                if(e.data && e.data.movie && e.data.movie.id && e.object.method){
                    showLampaRating(e);
                } else {
                    logDebug("Неверная структура e.data или e.object", e);
                }
            }
        }
    });
})();
