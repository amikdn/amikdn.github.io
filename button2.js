(function () {
    'use strict';
    
    // Функция для перемещения items-line с Shots в самый низ страницы
    function moveShotsItemsLineToBottom() {
        $('.items-line').each(function() {
            var $itemsLine = $(this);
            var $shotsPerson = $itemsLine.find('.full-person__name');
            
            var isShots = false;
            // Проверяем по тексту Shots
            if ($shotsPerson.length && $shotsPerson.text().trim() === 'Shots') {
                isShots = true;
            }
            
            // Проверяем по наличию sprite-shots внутри items-line (через нативный querySelector)
            if (!isShots && $itemsLine[0]) {
                var shotsSprite = $itemsLine[0].querySelector('use[xlink\\:href="#sprite-shots"]');
                if (shotsSprite) {
                    isShots = true;
                }
            }
            
            if (isShots) {
                // Находим родительский контейнер всех items-line (обычно это main или body)
                var $parentContainer = $itemsLine.closest('main, .main, body');
                if ($parentContainer.length) {
                    // Перемещаем в самый низ родительского контейнера
                    $parentContainer.append($itemsLine);
                } else {
                    // Если не нашли родителя, перемещаем в конец body
                    $('body').append($itemsLine);
                }
            }
        });
    }
    
    // Удаление кнопки шотсов на странице full (по аналогии с button2.js)
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var render = e.object.activity.render();
            // Удаляем full-person с Shots, проверяя по тексту и по sprite-shots
            render.find('.full-person').each(function() {
                var $this = $(this);
                var $shotsPerson = $this.find('.full-person__name');
                var hasShotsText = $shotsPerson.length && $shotsPerson.text().trim() === 'Shots';
                var hasShotsSprite = this.querySelector('use[xlink\\:href="#sprite-shots"]') !== null;
                
                if (hasShotsText || hasShotsSprite) {
                    $this.remove();
                }
            });
        }
    });
    
    // Перемещение блока шотсов на главной странице (по аналогии с cuboff.js)
    function moveShotsOnToggle() {
        Lampa.Controller.listener.follow('toggle', function (event) {
            if (event.name === 'select') {
                setTimeout(function() {
                    moveShotsItemsLineToBottom();
                }, 150);
            }
        });
    }
    
    // Инициализация при готовности приложения
    function initializeApp() {
        // Перемещаем элементы shots в самый низ страницы
        setTimeout(function() {
            moveShotsItemsLineToBottom();
        }, 1000);
    }
    
    if (window.appready) {
        initializeApp();
        moveShotsOnToggle();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initializeApp();
                moveShotsOnToggle();
            }
        });
    }
    
    // Дополнительная проверка при изменении DOM
    var moveShotsObserver = new MutationObserver(function(mutations) {
        var shouldCheck = false;
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            setTimeout(moveShotsItemsLineToBottom, 100);
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
