(function(){
    'use strict';
    
    // Функция для вставки кастомной панели player-info над панелью плеера
    function insertPlayerInfoPanel() {
        // Ищем элемент панели плеера
        var panel = document.querySelector('.player-panel__position');
        if(!panel) return;
        
        // Определяем родительский контейнер панели
        var parent = panel.parentNode;
        // Если родитель не позиционирован, задаём ему relative, чтобы абсолютное позиционирование работало корректно
        if(getComputedStyle(parent).position === 'static'){
            parent.style.position = 'relative';
        }
        
        // Если панель уже добавлена, удаляем её для предотвращения дублирования
        var oldPanel = document.getElementById('custom_player_info_panel');
        if(oldPanel) oldPanel.remove();
        
        // Формируем HTML-код панели, как вы указали
        var newPanelHTML =
            '<div id="custom_player_info_panel" style="position: absolute; bottom: calc(100% + 10px); left: 0; width: 100%;">' +
                '<div class="player-info info--visible">' +
                    '<div class="player-info__body">' +
                        '<div class="head-backward selector">' +
                            '<div class="head-backward__button">' +
                                '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 492 492" xml:space="preserve">' +
                                    '<path d="M198.608 246.104 382.664 62.04c5.068-5.056 7.856-11.816 7.856-19.024 0-7.212-2.788-13.968-7.856-19.032l-16.128-16.12C361.476 2.792 354.712 0 347.504 0s-13.964 2.792-19.028 7.864L109.328 227.008c-5.084 5.08-7.868 11.868-7.848 19.084-.02 7.248 2.76 14.028 7.848 19.112l218.944 218.932c5.064 5.072 11.82 7.864 19.032 7.864 7.208 0 13.964-2.792 19.032-7.864l16.124-16.12c10.492-10.492 10.492-27.572 0-38.06L198.608 246.104z" fill="currentColor"></path>' +
                                '</svg>' +
                            '</div>' +
                            '<div class="head-backward__title">Полное дублирование (Dubляж)</div>' +
                        '</div>' +
                        '<div class="player-info__line">' +
                            '<div class="player-info__name">Полное дублирование (Dubляж)</div>' +
                            '<div class="player-info__time"><span class="time--clock">23:23</span></div>' +
                        '</div>' +
                        '<div class="player-info__values">' +
                            '<div class="value--size"><span>1920x1038</span></div>' +
                            '<div class="value--stat"><span>Канал 351.83 Мбит/c &nbsp;•&nbsp; Битрейт ~3.78 Мбит/c &nbsp;•&nbsp; Буфер 34 с.</span></div>' +
                            '<div class="value--speed"><span></span></div>' +
                            '<div class="value--pieces"></div>' +
                        '</div>' +
                        '<div class="player-info__error hide"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        
        // Вставляем новый блок непосредственно в родительский контейнер перед панелью плеера
        parent.insertBefore((function(){
            var temp = document.createElement('div');
            temp.innerHTML = newPanelHTML;
            return temp.firstChild;
        })(), panel);
    }
    
    // Функция инициализации плагина: ожидаем появления панели плеера, затем вставляем кастомную панель
    function initPlayerInfoPanel() {
        var intervalID = setInterval(function(){
            if(document.querySelector('.player-panel__position')){
                clearInterval(intervalID);
                insertPlayerInfoPanel();
            }
        }, 500);
    }
    
    // Регистрация параметра в меню настроек Lampa для управления этим плагином
    Lampa.SettingsApi.addParam({
        component: 'Multi_Menu_Component',
        param: {
            name: 'CustomPlayerInfoPanel',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Смещение панели информации плеера',
            description: 'Вставляет кастомную панель player-info info--visible над панелью плеера'
        },
        onChange: function(value) {
            if(value === true){
                initPlayerInfoPanel();
            } else {
                var panel = document.getElementById('custom_player_info_panel');
                if(panel) panel.remove();
            }
        },
        onRender: function(){
            if(Lampa.Storage.field('CustomPlayerInfoPanel') === true){
                initPlayerInfoPanel();
            }
        }
    });
    
})();
