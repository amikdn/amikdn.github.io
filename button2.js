(function () {  
    'use strict';	  
    Lampa.Listener.follow('full', function (e) {  
        if (e.type == 'complite') {  
            // Сразу скрываем трейлеры  
            e.object.activity.render().find('.view--trailer').remove();  
              
            // Создаем наблюдатель для кнопки Shots  
            const observer = new MutationObserver(function(mutations) {  
                mutations.forEach(function(mutation) {  
                    // Ищем и удаляем кнопку Shots  
                    const shotsButton = e.object.activity.render().find('.shots-view-button');  
                    if (shotsButton.length > 0) {  
                        shotsButton.remove();  
                    }  
                });  
            });  
              
            // Начинаем наблюдение за изменениями в activity  
            observer.observe(e.object.activity.render()[0], {  
                childList: true,  
                subtree: true  
            });  
              
            // Также пробуем найти сразу  
            e.object.activity.render().find('.shots-view-button').remove();  
        }  
    });  
})();
