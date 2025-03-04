(function(){
    'use strict';
    
    // Функция для вставки блока информации над панелью плеера
    function insertCustomInfo() {
        var panel = document.querySelector('.player-panel__position');
        if(!panel) return;
        
        // Получаем родительский элемент панели
        var parent = panel.parentNode;
        // Если родитель не позиционирован, задаём ему relative
        if(getComputedStyle(parent).position === 'static'){
            parent.style.position = 'relative';
        }
        
        // Удаляем предыдущий блок, если он уже был добавлен
        var oldInfo = document.getElementById('custom_player_info');
        if(oldInfo) oldInfo.remove();
        
        // Создаем HTML-блок с абсолютным позиционированием
        // bottom: calc(100% + 10px) поднимает блок на 10px выше панели
        var customHTML = 
            '<div id="custom_player_info" style="position: absolute; bottom: calc(100% + 10px); left: 0; width: 100%;">' +
                '<div class="player-info__line">' +
                    '<div class="player-info__name"></div>' +
                    '<div class="player-info__time"><span class="time--clock"></span></div>' +
                '</div>' +
            '</div>';
        
        // Вставляем блок в родительский элемент перед панелью
        parent.insertBefore((function(){
            var temp = document.createElement('div');
            temp.innerHTML = customHTML;
            return temp.firstChild;
        })(), panel);
    }
    
    // Функция инициализации плагина: ждем появления панели и затем вставляем блок
    function initPlugin() {
        var intervalID = setInterval(function(){
            if(document.querySelector('.player-panel__position')){
                clearInterval(intervalID);
                insertCustomInfo();
            }
        }, 500);
    }
    
    // Регистрация параметра в меню настроек Lampa для управления плагином
    Lampa.SettingsApi.addParam({
        component: 'Multi_Menu_Component',
        param: {
            name: 'CustomInfoShift',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Замена и смещение иконок плеера',
            description: 'Вставляет блок с информацией (player-info__line) над панелью плеера'
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
