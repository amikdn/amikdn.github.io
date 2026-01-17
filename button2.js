(function () {
    'use strict';
    
    // Функция для удаления items-line с Shots
    function removeShotsItemsLine() {
        var itemsLines = document.querySelectorAll('.items-line');
        for (var i = 0; i < itemsLines.length; i++) {
            var itemsLine = itemsLines[i];
            
            // Проверяем по тексту Shots
            var shotsPerson = itemsLine.querySelector('.full-person__name');
            if (shotsPerson && shotsPerson.textContent.trim() === 'Shots') {
                itemsLine.remove();
                continue;
            }
            
            // Проверяем по наличию sprite-shots внутри items-line
            var shotsSprite = itemsLine.querySelector('use[xlink\\:href="#sprite-shots"], use[*|href="#sprite-shots"]');
            if (shotsSprite) {
                itemsLine.remove();
            }
        }
    }
    
    // Удаление кнопки шотсов на странице full (по аналогии с трейлерами)
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var render = e.object.activity.render();
            // Ищем full-person элементы, содержащие sprite-shots или с текстом Shots
            render.find('.full-person').each(function() {
                var $fullPerson = $(this);
                var hasShotsSprite = $fullPerson.find('use[xlink\\:href="#sprite-shots"], use[*|href="#sprite-shots"]').length > 0;
                var hasShotsText = $fullPerson.find('.full-person__name').text().trim() === 'Shots';
                
                if (hasShotsSprite || hasShotsText) {
                    $fullPerson.remove();
                }
            });
        }
    });
    
    // Удаление блока шотсов на главной странице
    Lampa.Listener.follow('main', function (e) {
        if (e.type == 'complite' || e.type == 'ready') {
            removeShotsItemsLine();
        }
    });
    
    // Постоянная проверка для удаления динамически добавляемых элементов
    var removeShotsObserver = new MutationObserver(function() {
        removeShotsItemsLine();
    });
    
    // Запускаем проверку периодически
    var checkInterval = setInterval(removeShotsItemsLine, 200);
    
    // Начинаем наблюдение после загрузки
    if (document.body) {
        removeShotsObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            removeShotsObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    // Первоначальные проверки
    setTimeout(removeShotsItemsLine, 50);
    setTimeout(removeShotsItemsLine, 200);
    setTimeout(removeShotsItemsLine, 500);
})();
