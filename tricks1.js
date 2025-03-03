(function(){
    "use strict";

    function startLampaRatingIcon() {
        window.rating_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if(e.type === 'complite'){
                var render = e.object.activity.render();
                console.log('[LAMPA] Event complite, render:', render);
                // Если блок с рейтингом LAMPA еще не вставлен, создаем его
                if($(render).find('.rate--lampa').length === 0){
                    // Создаем элемент с классами для рейтинга LAMPA
                    var lampaIcon = $(
                        '<div class="full-start__rate rate--lampa" style="width:2em;margin-top:1em;margin-right:1em;">' +
                            '<div class="rate-label">LAMPA</div>' +
                            '<div class="rate-value">0.0</div>' +
                        '</div>'
                    );
                    // Если в render есть элемент с классом .info__rate, вставляем после него,
                    // иначе – добавляем в конец render
                    var infoRate = $(render).find('.info__rate');
                    if(infoRate.length){
                        infoRate.after(lampaIcon);
                    } else {
                        $(render).append(lampaIcon);
                    }
                    console.log('[LAMPA] LAMPA icon inserted:', lampaIcon);
                }
            }
        });
    }

    if(!window.rating_plugin) startLampaRatingIcon();
})();
