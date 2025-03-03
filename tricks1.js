(function(){
    'use strict';

    // Если плагин уже запущен, выходим
    if(window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 часа
    let lampaRatingCache = {};

    /**
     * Вычисляет рейтинг LAMPA по массиву реакций.
     * Положительные: "fire", "think"
     * Отрицательные: "bore", "shit"
     * @param {Array} reactions - массив объектов с полями type и counter.
     * @returns {number} - рейтинг, округленный до одного знака.
     */
    function calculateLampaRating(reactions) {
        let positive = 0, negative = 0;
        reactions.forEach(item => {
            if(item.type === "fire" || item.type === "think"){
                positive += parseInt(item.counter, 10);
            }
            if(item.type === "bore" || item.type === "shit"){
                negative += parseInt(item.counter, 10);
            }
        });
        let rating = 0;
        if((positive + negative) > 0){
            rating = (positive / (positive + negative)) * 10;
        }
        return parseFloat(rating.toFixed(1));
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
     * Находит контейнер с классом ".full-start-new__rate-line" и вставляет новый блок
     * сразу после блока KP. Если блок KP отсутствует, вставляет в конец панели.
     * Блок LAMPA имеет размеры 67.41×23.05px и оформлен так, что сначала выводится значение рейтинга,
     * а справа – надпись "LAMPA". При этом вставка блока сдвигает вправо остальные элементы панели.
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
        // Формируем HTML для блока LAMPA:
        // Блок имеет размеры 67.41px x 23.05px, используется inline-flex для выравнивания по центру.
        let lampaBlockHtml =
            '<div class="full-start__rate rate--lampa" style="width:67.41px; height:23.05px; display:inline-flex; align-items:center; vertical-align:middle; margin-left:5px;">' +
                '<div class="rate-value" style="line-height:23.05px;">0.0</div>' +
                '<div class="source--name" style="line-height:23.05px; margin-left:4px;">LAMPA</div>' +
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
