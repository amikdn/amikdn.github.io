(function(){
    "use strict";
    
    // Если плагин уже запущен, выходим
    if(window.rating_plugin) return;
    window.rating_plugin = true;
    
    // Отладочные подписки для диагностики: выводим все события, полученные по каналам 'full' и 'card:open'
    Lampa.Listener.follow('full', function(e){
         console.log('[Rating Plugin] full event:', e);
    });
    Lampa.Listener.follow('card:open', function(e){
         console.log('[Rating Plugin] card:open event:', e);
    });
    
    // Функция вставки блока рейтинга LAMPA в render-контейнер
    function insertLampaBlock(render) {
        if(!render) return false;
        if($(render).find('.rate--lampa').length > 0){
            console.log('[Rating Plugin] Блок LAMPA уже существует');
            return true;
        }
        // Формируем HTML блока рейтинга LAMPA
        var html = 
            '<div class="full-start__rate rate--lampa" style="width:2em;margin-top:1em;margin-right:1em;">' +
                '<div class="rate-label">LAMPA</div>' +
                '<div class="rate-value">0.0</div>' +
            '</div>';
        // Если в render найден элемент .info__rate, вставляем блок после него, иначе – в конец render
        if($(render).find('.info__rate').length){
            $(render).find('.info__rate').after(html);
        } else {
            $(render).append(html);
        }
        console.log('[Rating Plugin] LAMPA block inserted');
        return true;
    }
    
    // Подписываемся на событие 'card:open'
    Lampa.Listener.follow('card:open', function(e){
         if(e.type === 'open'){
             var render = (e.object && typeof e.object.activity.render === 'function') 
                         ? e.object.activity.render() : null;
             console.log('[Rating Plugin] card:open, render:', render);
             if(render){
                 insertLampaBlock(render);
             } else {
                 console.log('[Rating Plugin] render не найден в card:open');
             }
         }
    });
    
    // Подписываемся на событие 'full' с типом 'complite'
    Lampa.Listener.follow('full', function(e){
         if(e.type === 'complite'){
             var render = (e.object && typeof e.object.activity.render === 'function') 
                         ? e.object.activity.render() : null;
             console.log('[Rating Plugin] full complite, render:', render);
             if(render){
                 insertLampaBlock(render);
             } else {
                 console.log('[Rating Plugin] render не найден в full complite');
             }
         }
    });
    
    console.log('[Rating Plugin] Плагин рейтингов запущен');
})();
