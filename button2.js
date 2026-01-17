(function () {
    'use strict';
    
    // Функция для удаления items-line с Shots
    function removeShotsItemsLine() {
        $('.items-line').each(function() {
            var $itemsLine = $(this);
            var $shotsPerson = $itemsLine.find('.full-person__name');
            
            // Проверяем по тексту Shots
            if ($shotsPerson.length && $shotsPerson.text().trim() === 'Shots') {
                $itemsLine.remove();
                return;
            }
            
            // Проверяем по наличию sprite-shots внутри items-line
            var $shotsSprite = $itemsLine.find('use[xlink\\:href="#sprite-shots"], use[*|href="#sprite-shots"]');
            if ($shotsSprite.length) {
                $itemsLine.remove();
            }
        });
    }
    
    // Удаление кнопки шотсов на странице full (по аналогии с ads_full.js)
    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'complite') return;
        var container = e.object.activity.render();
        // Удаляем full-person с Shots напрямую, как в ads_full удаляются кнопки
        container.find('.full-person').filter(function() {
            var $this = $(this);
            var hasShotsSprite = $this.find('use[xlink\\:href="#sprite-shots"], use[*|href="#sprite-shots"]').length > 0;
            var hasShotsText = $this.find('.full-person__name').text().trim() === 'Shots';
            return hasShotsSprite || hasShotsText;
        }).remove();
    });
    
    // Удаление блока шотсов на главной странице (по аналогии с cuboff.js)
    function removeShotsOnToggle() {
        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name === 'select') {
                setTimeout(function() {
                    removeShotsItemsLine();
                }, 150);
            }
        });
    }
    
    // Инициализация при готовности приложения
    function initializeApp() {
        // Добавляем CSS для скрытия элементов shots
        var style = document.createElement('style');
        style.innerHTML = '.items-line:has(.full-person__name:contains("Shots")), .items-line:has(use[xlink\\:href="#sprite-shots"]) { display: none !important; }';
        document.head.appendChild(style);
        
        // Удаляем элементы shots
        setTimeout(function() {
            removeShotsItemsLine();
        }, 1000);
    }
    
    if (window.appready) {
        initializeApp();
        removeShotsOnToggle();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initializeApp();
                removeShotsOnToggle();
            }
        });
    }
    
    // Дополнительная проверка при изменении DOM
    var removeShotsObserver = new MutationObserver(function(mutations) {
        var shouldCheck = false;
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            setTimeout(removeShotsItemsLine, 100);
        }
    });
    
    // Начинаем наблюдение после загрузки
    if (document.body) {
        removeShotsObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
