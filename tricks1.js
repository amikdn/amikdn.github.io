(function(){
    'use strict';

    // Если плагин уже запущен, выходим
    if(window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 часа
    let lampaRatingCache = {};

function calculateLampaRating10(reactions) {
    let weightedSum = 0;
    let totalCount = 0;

    reactions.forEach(item => {
        const count = parseInt(item.counter, 10);
        switch (item.type) {
            case "fire":   // оценка 5
                weightedSum += count * 5;
                totalCount += count;
                break;
            case "nice":   // оценка 4
                weightedSum += count * 4;
                totalCount += count;
                break;
            case "think":  // оценка 3
                weightedSum += count * 3;
                totalCount += count;
                break;
            case "bore":   // оценка 2
                weightedSum += count * 2;
                totalCount += count;
                break;
            case "shit":   // оценка 1
                weightedSum += count * 1;
                totalCount += count;
                break;
            default:
                break;
        }
    });

    if(totalCount === 0) return 0;

    // Средняя оценка по шкале 1-5:
    const avgRating = weightedSum / totalCount;
    // Преобразование в шкалу 0-10:
    const rating10 = (avgRating - 1) * 2.5;
    return parseFloat(rating10.toFixed(1));
}


    /**
     * Запрашивает рейтинг LAMPA с cub.red по ключу (например, "movie_939243").
     * @param {string} ratingKey
     * @returns {Promise<number|null>}
     */
    function fetchLampaRating(ratingKey) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            let url = "http://cub.red/api/reactions/get/" + ratingKey;
            xhr.open("GET", url, true);
            xhr.timeout = 2000;
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        try {
                            let data = JSON.parse(xhr.responseText);
                            if(data && data.result && Array.isArray(data.result)) {
                                let rating = calculateLampaRating(data.result);
                                resolve(rating);
                            } else {
                                reject(new Error("Неверный формат ответа"));
                            }
                        } catch(e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error("Ошибка запроса, статус: " + xhr.status));
                    }
                }
            };
            xhr.onerror = function(){ reject(new Error("XHR ошибка")); };
            xhr.ontimeout = function(){ reject(new Error("Таймаут запроса")); };
            xhr.send();
        });
    }

    /**
     * Обёртка с кэшированием для получения рейтинга LAMPA.
     * @param {string} ratingKey
     * @returns {Promise<number|null>}
     */
    async function getLampaRating(ratingKey) {
        let now = Date.now();
        if(lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)){
            return lampaRatingCache[ratingKey].value;
        }
        try {
            let rating = await fetchLampaRating(ratingKey);
            lampaRatingCache[ratingKey] = { value: rating, timestamp: now };
            return rating;
        } catch(e) {
            console.error("Ошибка получения рейтинга LAMPA:", e);
            return null;
        }
    }

    /**
     * Вставляет блок LAMPA в панель рейтингов.
     * Ищет контейнер с классом ".full-start-new__rate-line" и вставляет новый блок
     * сразу после блока KP. Новый блок создается без жестко заданных inline-стилей,
     * чтобы его размеры определялись общими стилями интерфейса, как и для других блоков.
     * Структура блока:
     *   <div class="full-start__rate rate--lampa">
     *       <div>0.0</div>
     *       <div class="source--name">LAMPA</div>
     *   </div>
     * @param {HTMLElement} render - контейнер карточки.
     * @returns {boolean} - true, если блок вставлен или уже существует.
     */
    function insertLampaBlock(render) {
        if(!render) return false;
        let rateLine = $(render).find('.full-start-new__rate-line');
        if(rateLine.length === 0) {
            console.log("[LAMPA] Контейнер .full-start-new__rate-line не найден");
            return false;
        }
        // Если блок LAMPA уже существует, ничего не делаем
        if(rateLine.find('.rate--lampa').length > 0) {
            return true;
        }
        // Формируем HTML для блока LAMPA без жестких inline-стилей,
        // чтобы он наследовал размеры и стили, как остальные блоки.
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa">' +
                '<div class="rate-value">0.0</div>' +
                '<div class="source--name">LAMPA</div>' +
            '</div>';
        // Находим блок KP и вставляем новый блок после него
        let kpBlock = rateLine.find('.rate--kp');
        if(kpBlock.length > 0) {
            kpBlock.after(lampaBlockHtml);
            console.log("[LAMPA] Блок LAMPA вставлен после блока KP");
        } else {
            // Если блок KP не найден, вставляем в конец панели
            rateLine.append(lampaBlockHtml);
            console.log("[LAMPA] Блок LAMPA вставлен в конец панели");
        }
        return true;
    }

    // Подписываемся на событие "full" с типом "complite" (как в оригинальном плагине)
    Lampa.Listener.follow('full', function(e){
        if(e.type === 'complite'){
            let render = e.object.activity.render();
            console.log("[LAMPA] full complite event, render:", render);
            if(render && insertLampaBlock(render)){
                // Формируем ключ рейтинга: method + "_" + id
                if(e.object.method && e.object.id){
                    let ratingKey = e.object.method + "_" + e.object.id;
                    console.log("[LAMPA] ratingKey:", ratingKey);
                    getLampaRating(ratingKey).then(rating => {
                        if(rating !== null){
                            // Обновляем значение рейтинга в блоке LAMPA (элемент с классом .rate-value)
                            $(render).find('.rate--lampa .rate-value').text(rating);
                            console.log("[LAMPA] Рейтинг LAMPA обновлен:", rating);
                        }
                    });
                } else {
                    console.log("[LAMPA] Недостаточно данных для формирования ratingKey", e.object);
                }
            }
        }
    });

    console.log("[LAMPA] Плагин LAMPA запущен");
})();
