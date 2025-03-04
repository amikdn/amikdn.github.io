(function(){
    'use strict';
    
    // Функция для внедрения кастомного CSS, смещающего панель player-info на 1px вверх
    function applyCustomShift() {
        // Создаем элемент стиля
        var style = document.createElement('style');
        style.id = 'custom_info_shift_css';
        style.innerHTML = `
            /* Сдвигаем панель с информацией на 1 пиксель вверх */
            .player-info.info--visible {
                transform: translateY(-1px) !important;
            }
        `;
        // Добавляем стиль в head, если его еще нет
        if(!document.getElementById('custom_info_shift_css')){
            document.head.appendChild(style);
        }
    }
    
    // Запускаем после полной загрузки плеера
    var intervalID = setInterval(function(){
        if(document.querySelector('.player-info.info--visible') && document.querySelector('.player-panel.panel--visible.panel--paused')){
            clearInterval(intervalID);
            applyCustomShift();
        }
    }, 500);
    
    // Также можно привязаться к событию изменения размера, если динамика меняет позиционирование
    window.addEventListener('resize', applyCustomShift);
    
})();
