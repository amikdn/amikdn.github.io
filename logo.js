(function () {
    'use strict';

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: { name: "logo_glav", type: "select", values: { 1: "Скрыть", 0: "Отображать" }, default: "0" },
        field: { name: "Логотипы вместо названий", description: "Отображает логотипы фильмов вместо текста" }
    });

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: { name: "logo_size", type: "select", values: { w300: "w300", w500: "w500", w780: "w780", original: "Оригинал" }, default: "w500" },
        field: { name: "Размер логотипа", description: "Разрешение загружаемого изображения" }
    });

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: { name: "logo_hide_year", type: "trigger", default: true },
        field: { name: "Скрывать год и страну над логотипом", description: "Переносит год выпуска и страну под логотип" }
    });

    if (window.logoplugin) return;
    window.logoplugin = true;

    // Мгновенное применение изменений настроек
    Lampa.Storage.listener.follow('change', function (e) {
        if (['logo_glav', 'logo_size', 'logo_hide_year'].includes(e.param)) {
            var activity = Lampa.Activity.active();
            if (activity && activity.component === 'full') {
                setTimeout(function () {
                    activity.reload();
                }, 300);
            }
        }
    });

    Lampa.Listener.follow('full', function (a) {
        if (a.type == 'complite' && "1" != Lampa.Storage.get("logo_glav")) {
            var movie = a.data.movie;
            var type = movie.name ? 'tv' : 'movie';
            var render = a.object.activity.render();

            var title = render.find(".full-start-new__title");
            var head = render.find(".full-start-new__head");
            var details = render.find(".full-start-new__details");
            var tagline = render.find(".full-start-new__tagline");

            if (movie.id == '') return;

            var lang = Lampa.Storage.get("language");
            var size = Lampa.Storage.get("logo_size", "w500");

            var url = Lampa.TMDB.api(type + "/" + movie.id + "/images?api_key=" + Lampa.TMDB.key() + "&include_image_language=" + lang + ",en,null");

            $.get(url, function (response) {
                var logo_path = null;

                if (response.logos && response.logos.length > 0) {
                    // Приоритет: язык приложения → английский → любой
                    for (var i = 0; i < response.logos.length; i++) {
                        if (response.logos[i].iso_639_1 == lang) {
                            logo_path = response.logos[i].file_path;
                            break;
                        }
                    }
                    if (!logo_path) {
                        for (var i = 0; i < response.logos.length; i++) {
                            if (response.logos[i].iso_639_1 == 'en') {
                                logo_path = response.logos[i].file_path;
                                break;
                            }
                        }
                    }
                    if (!logo_path) {
                        logo_path = response.logos[0].file_path;
                    }
                }

                if (logo_path) {
                    var logo_url = Lampa.TMDB.image("/t/p/" + (size === "original" ? "original" : size) + logo_path.replace(".svg", ".png"));

                    // Замена названия на логотип
                    title.html('<img style="margin-top:5px; max-height:125px;" src="' + logo_url + '"/>');

                    // Удаление теглайна
                    tagline.remove();

                    // Перенос года и страны под логотип (если включено)
                    if (Lampa.Storage.get("logo_hide_year", true)) {
                        if (head.length && details.length && details.find(".logo-moved-head").length === 0) {
                            var head_html = head.html().trim();
                            if (head_html) {
                                var separator = details.children().length > 0 ? '<span class="full-start-new__split logo-moved-separator">●</span>' : '';
                                var moved = '<span class="logo-moved-head" style="margin-left:0.6em;">' + head_html + '</span>';
                                details.append(separator + moved);
                                head.remove();
                            }
                        }
                    }
                }
            });
        }
    });
})();
