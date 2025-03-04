(function(){
    'use strict';
    
    // Функция для вставки блока информации рядом с панелью плеера
    function insertCustomInfo() {
        // Находим элемент панели плеера
        var panel = document.querySelector('.player-panel__position');
        if (!panel) return;
        
        // Если блок уже добавлен, удаляем его
        var oldInfo = document.getElementById('custom_player_info');
        if(oldInfo) oldInfo.remove();
        
        // Формируем HTML-блок с информацией и смещением (регулируйте top по необходимости)
        var customHTML = 
            '<div id="custom_player_info" style="position: relative; top: -50px;">' +
                '<div class="player-info__line">' +
                    '<div class="player-info__name"></div>' +
                    '<div class="player-info__time"><span class="time--clock"></span></div>' +
                '</div>' +
            '</div>';
        
        // Вставляем новый блок непосредственно перед панелью плеера
        panel.parentNode.insertBefore(
            (function(){
                var temp = document.createElement('div');
                temp.innerHTML = customHTML;
                return temp.firstChild;
            })(),
            panel
        );
    }
    
    // Функция инициализации плагина с ожиданием загрузки панели плеера
    function initPlugin() {
        var intervalID = setInterval(function(){
            if(document.querySelector('.player-panel__position')){
                clearInterval(intervalID);
                insertCustomInfo();
            }
        }, 500);
    }
    
    // Регистрируем параметр в меню настроек Lampa для управления плагином
    Lampa.SettingsApi.addParam({
        component: 'Multi_Menu_Component',
        param: {
            name: 'CustomInfoShift',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Замена и смещение иконок плеера',
            description: 'Вставляет блок с информацией (player-info__line) непосредственно над панелью плеера'
        },
        onChange: function(value) {
            if(value === true){
                initPlugin();
            } else {
                var info = document.getElementById('custom_player_info');
                if(info) info.remove();
            }
        },
        onRender: function(){
            if(Lampa.Storage.field('CustomInfoShift') === true){
                initPlugin();
            }
        }
    });
    
})();
