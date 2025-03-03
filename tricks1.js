(function(){
    "use strict";

    /**
     * Функция получения рейтинга Lampa с cub.red.
     * @param {object} card - объект фильма, должен содержать id и method (например, "movie")
     */
    function rating_lampa(card) {
        var network = new Lampa.Reguest();
        // Если в card отсутствует метод – задаем значение по умолчанию
        card.method = card.method || "movie";
        // Формируем ключ для запроса рейтинга: method + "_" + id
        var ratingKey = card.method + "_" + card.id;
        var ratingUrl = "http://cub.red/api/reactions/get/" + ratingKey;
        
        network.clear();
        network.timeout(2000);
        network.silent(ratingUrl, function(json) {
            // Проверяем, что получены данные в нужном формате
            if(json && json.secuses && json.result && Array.isArray(json.result)){
                var positive = 0, negative = 0;
                json.result.forEach(function(item){
                    // Положительные реакции: fire, think, nice
                    if(item.type === "fire" || item.type === "think" || item.type === "nice"){
                        positive += parseInt(item.counter);
                    }
                    // Отрицательные реакции: bore, shit
                    if(item.type === "bore" || item.type === "shit"){
                        negative += parseInt(item.counter);
                    }
                });
                // Вычисляем рейтинг по формуле
                var rating = (positive + negative > 0) ? (positive / (positive + negative) * 10) : 0;
                rating = rating.toFixed(1);
                _showRating(rating);
            } else {
                _showRating(0);
            }
        }, function(a, c) {
            console.error("Ошибка запроса рейтинга Lampa:", a, c);
            _showRating(0);
        }, false, {
            headers: {} // если нужны заголовки, можно добавить их сюда
        });
    }

    /**
     * Функция отображения полученного рейтинга в блоке LAMPA.
     * Ищет активный render, убирает индикатор ожидания и вставляет значение рейтинга.
     * @param {number} rating - рассчитанный рейтинг
     */
    function _showRating(rating) {
        var render = Lampa.Activity.active().activity.render();
        // Удаляем индикатор ожидания
        $('.wait_rating', render).remove();
        // Отображаем значение в блоке с рейтингом LAMPA
        $('.rate--lampa', render).removeClass('hide').find('> div').eq(0).text(rating);
    }

    /**
     * Инициализация плагина.
     * Подписываемся на событие "full" с типом "complite" и, если блок LAMPA не добавлен, вставляем его.
     */
    function startPlugin() {
        window.rating_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if(e.type === 'complite'){
                var render = e.object.activity.render();
                // Если блок для LAMPA ещё не добавлен
                if( $('.rate--lampa', render).length === 0 ){
                    // Добавляем индикатор ожидания после блока с информацией о рейтингах
                    $('.info__rate', render).after('<div style="width:2em;margin-top:1em;margin-right:1em" class="wait_rating"><div class="broadcast__scan"><div></div></div></div>');
                    // Вставляем блок для рейтинга LAMPA, если его еще нет
                    var ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                    // Вставляем два вложенных div: первый для отображения числа рейтинга
                    // (здесь по аналогии с KP/IMDb, можно настроить разметку)
                    ratingBlock.append($('<div></div>'));
                    // Вставляем блок рядом с другими рейтингами (после .info__rate)
                    $('.info__rate', render).after(ratingBlock);
                    
                    // Если объект фильма передан через e.data.movie, вызываем функцию получения рейтинга
                    if(e.data && e.data.movie && e.data.movie.id){
                        rating_lampa(e.data.movie);
                    } else {
                        console.warn("Объект фильма не найден в e.data.movie");
                    }
                }
            }
        });
    }

    if(!window.rating_plugin) startPlugin();
})();
