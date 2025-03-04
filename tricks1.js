
(function(){
    'use strict';
    
    // Функция для вставки кастомных элементов в плеер Lampa
    function insertCustomIcons() {
        // Проверяем, что плеер загружен
        var playerPanel = document.querySelector('.player-panel__position');
        if(!playerPanel) return;
        
        // Удаляем старую версию, если она уже добавлена
        var oldBlock = document.getElementById('custom_player_icons');
        if(oldBlock) oldBlock.remove();
        
        // HTML с новыми элементами
        var customHTML = '' +
            '<div id="custom_player_icons">' +
                '<div class="player-info__line">' +
                    '<div class="player-info__name">Полное дублирование (Dubляж)</div>' +
                    '<div class="player-info__time"><span class="time--clock">22:58</span></div>' +
                '</div>' +
                '<div class="player-info__values">' +
                    '<div class="value--size"><span>1920x1038</span></div>' +
                    '<div class="value--stat"><span>Канал 41.71 Мбит/c &nbsp;•&nbsp; Битрейт ~3.67 Мбит/c &nbsp;•&nbsp; Буфер 32 с.</span></div>' +
                    '<div class="value--speed"><span></span></div>' +
                    '<div class="value--pieces"></div>' +
                '</div>' +
            '</div>';
        
        // Вставляем новый блок перед элементом с классом player-panel__position
        playerPanel.parentNode.insertBefore(
            (function(){
                var container = document.createElement('div');
                container.innerHTML = customHTML;
                return container.firstChild;
            })(), 
            playerPanel
        );
    }
    
    // Инициализация плагина – ожидание загрузки плеера и вставка кастомных элементов
    function initPlugin() {
        var checkInterval = setInterval(function(){
            if(document.querySelector('.player-panel__position')){
                clearInterval(checkInterval);
                insertCustomIcons();
            }
        }, 500);
    }
    
    // Регистрируем параметр в меню настроек Lampa для управления плагином
    Lampa.SettingsApi.addParam({
        component: 'Multi_Menu_Component',
        param: {
            name: 'CustomPlayerIcons',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Замена и смещение иконок плеера',
            description: 'Добавляет новые элементы с информацией и сдвигает их чуть выше стандартного элемента плеера'
        },
        onChange: function(value) {
            if(value === true){
                initPlugin();
            } else {
                var oldBlock = document.getElementById('custom_player_icons');
                if(oldBlock) oldBlock.remove();
            }
        },
        onRender: function(){
            if(Lampa.Storage.field('CustomPlayerIcons') === true){
                initPlugin();
            }
        }
    });
    
})();
