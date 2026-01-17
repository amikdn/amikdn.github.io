(function () {
    'use strict';
    
    // Функция для удаления shots элементов
    function removeShotsElements() {
        // Удаляем все элементы с sprite-shots
        var shotsElements = document.querySelectorAll('use[xlink\\:href="#sprite-shots"]');
        shotsElements.forEach(function(el) {
            var svg = el.closest('svg');
            if (svg) svg.remove();
        });
        
        // Удаляем items-line блоки, содержащие Shots
        var itemsLines = document.querySelectorAll('.items-line');
        itemsLines.forEach(function(itemsLine) {
            var shotsPerson = itemsLine.querySelector('.full-person__name');
            if (shotsPerson && shotsPerson.textContent.trim() === 'Shots') {
                itemsLine.remove();
            }
        });
    }
    
    // Удаление shots элементов на странице full
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var render = e.object.activity.render();
            // Удаляем элементы с sprite-shots в рендере
            render.find('use[xlink\\:href="#sprite-shots"]').closest('svg').remove();
            // Также выполняем общую очистку
            removeShotsElements();
        }
    });
    
    // Удаление shots элементов на главной странице
    Lampa.Listener.follow('main', function (e) {
        if (e.type == 'complite' || e.type == 'ready') {
            removeShotsElements();
        }
    });
    
    // Дополнительная проверка при динамическом обновлении страницы
    var observer = new MutationObserver(function(mutations) {
        removeShotsElements();
    });
    
    // Начинаем наблюдение за изменениями DOM
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }
    
    // Первоначальная очистка
    removeShotsElements();
})();

