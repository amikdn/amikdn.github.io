(function(){
    "use strict";

    // Подписываемся на событие "full" с типом "complite"
    Lampa.Listener.follow("full", function(e){
        if(e.type === "complite"){
            // Получаем контейнер, в котором происходит рендер карточки
            var render = e.object.activity.render();
            console.log("[LAMPA] Событие full complite, render:", render);
            // Проверяем, существует ли уже блок с LAMPA
            if($(render).find('.rate--lampa').length === 0){
                // Если нет, создаем его
                var ratingBlock = $('<div class="full-start__rate rate--lampa"></div>');
                // Добавляем подпись "LAMPA" и элемент для значения рейтинга
                ratingBlock.append($('<div class="rate-label">LAMPA</div>'));
                ratingBlock.append($('<div class="rate-value">0.0</div>'));
                // Если существует элемент с классом .info__rate, вставляем блок после него,
                // иначе – добавляем в конец render
                if($(render).find(".info__rate").length){
                    $(render).find(".info__rate").after(ratingBlock);
                } else {
                    $(render).append(ratingBlock);
                }
                console.log("[LAMPA] Вставлен блок рейтинга:", ratingBlock);
            }
        }
    });
})();
