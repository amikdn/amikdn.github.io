(function(){
    "use strict";
    
    // Проверяем наличие объекта Lampa
    if(typeof Lampa === "undefined"){
        console.error("Lampa не определён");
        return;
    } else {
        console.log("Lampa определён");
    }
    
    // Проверяем наличие Lampa.Listener и его метода follow
    if(!Lampa.Listener || typeof Lampa.Listener.follow !== "function"){
        console.error("Lampa.Listener.follow недоступен");
        return;
    } else {
        console.log("Lampa.Listener.follow доступен");
    }
    
    // Подписываемся на несколько возможных событий для отладки
    const events = ["full", "card:render", "appready", "complite"];
    events.forEach(function(eventName){
        Lampa.Listener.follow(eventName, function(e){
            console.log("[Отладка] Событие '" + eventName + "' получено:", e);
        });
    });
    
    console.log("Отладочные подписки на события установлены");
})();
