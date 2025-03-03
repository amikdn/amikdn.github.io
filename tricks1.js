(function(){
    "use strict";

    // Если плагин уже запущен, выходим
    if(window.rating_plugin) return;
    window.rating_plugin = true;

    // Подписываемся на событие "full" с типом "complite"
    Lampa.Listener.follow('full', function(e){
        if(e.type === 'complite'){
            var render = e.object.activity.render();
            // Если в render-контейнере еще не добавлены блоки рейтингов (KP, IMDB, LAMPA)
            if($(render).find('.rate--kp').length === 0 && 
               $(render).find('.rate--imdb').length === 0 &&
               $(render).find('.rate--lampa').length === 0){
                // Добавляем блоки сразу после элемента с классом .info__rate
                $('.info__rate', render).after(
                    '<div class="full-start__rate rate--kp" style="width:2em;margin-top:1em;margin-right:1em;">' +
                        '<div></div>' +
                    '</div>' +
                    '<div class="full-start__rate rate--imdb" style="width:2em;margin-top:1em;margin-right:1em;">' +
                        '<div></div>' +
                    '</div>' +
                    '<div class="full-start__rate rate--lampa" style="width:2em;margin-top:1em;margin-right:1em;">' +
                        '<div class="rate-label">LAMPA</div>' +
                        '<div class="rate-value">0.0</div>' +
                    '</div>'
                );
            }
        }
    });

    console.log('[Rating Plugin] Плагин рейтингов запущен');
})();
