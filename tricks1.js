(function(){
    'use strict';
    
    // Функция для смещения панели информации на 1px вверх
    function shiftPlayerInfo() {
        var info = document.querySelector('.player-info.info--visible');
        if(info){
            // Принудительно устанавливаем относительное позиционирование
            info.style.position = 'relative';
            // Сдвигаем на 1px вверх
            info.style.top = '-1px';
        }
    }
    
    // Ждем, когда панель появится, и применяем смещение
    var intervalID = setInterval(function(){
        if(document.querySelector('.player-info.info--visible') && document.querySelector('.player-panel.panel--visible.panel--paused')){
            clearInterval(intervalID);
            shiftPlayerInfo();
        }
    }, 300);
    
    // Если панель может динамически меняться, можно наблюдать за изменениями и постоянно применять смещение
    var infoNode = document.querySelector('.player-info.info--visible');
    if(infoNode){
        var observer = new MutationObserver(function(mutations){
            shiftPlayerInfo();
        });
        observer.observe(infoNode, {attributes: true, childList: true, subtree: true});
    }
})();
