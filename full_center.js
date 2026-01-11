(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    "use strict";
    function c() {
      Lampa.Listener.follow("full", function (a) {
        if (a.type == "complite" && window.innerWidth < 585) {
          if (Lampa.Storage.get("card_interfice_type") === "new") {
            $(".full-start-new__right").css({
              display: "flex",
              "flex-direction": "column",
              "justify-content": "center",
              "align-items": "center"
            });
            $(".full-start-new__buttons, .full-start-new__rate-line").css({
              "justify-content": "center",
              "align-items": "center",
              display: "flex",
              "flex-direction": "row",
              gap: "0.5em",
              "flex-wrap": "wrap"
            });
            $(".full-start-new__details").css({
              "justify-content": "center",
              "align-items": "center",
              display: "flex",
              "flex-direction": "row",
              "flex-wrap": "wrap"
            });
            $(".items-line__head").children().filter(function () {
              var a = $(this).text().trim();
              return a && (a === "Подробно" || a === "Актеры" || a === "Режиссер" || a === "Рекомендации" || a === "Похожие" || a.includes("Сезон") || a === "Коллекция");
            }).css({
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
              width: "100%"
            });
            $(".full-descr__details, .full-descr__tags").css({
              display: "flex",
              "flex-direction": "row",
              "justify-content": "center",
              "align-items": "center"
            });
            $(".full-descr__text, .full-start-new__title, .full-start-new__tagline, .full-start-new__head").css("text-align", "center");
          } else {
            $(".full-start__left").css({
              display: "flex",
              "flex-direction": "column",
              "justify-content": "center",
              "align-items": "center"
            });
            $(".full-start__buttons, .full-start__deta").css({
              "justify-content": "center",
              "align-items": "center",
              display: "flex",
              "flex-direction": "row",
              gap: "0.5em",
              "flex-wrap": "wrap"
            });
            $(".full-start__tags").css({
              "justify-content": "center",
              "align-items": "center",
              display: "flex",
              "flex-direction": "row",
              "flex-wrap": "wrap"
            });
            $(".items-line__head").children().filter(function () {
              var a = $(this).text().trim();
              return a && (a === "Подробно" || a === "Актеры" || a === "Режиссер" || a === "Рекомендации" || a === "Похожие" || a.includes("Сезон") || a === "Коллекция");
            }).css({
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
              width: "100%"
            });
            $(".full-descr__details, .full-descr__tags").css({
              display: "flex",
              "flex-direction": "row",
              "justify-content": "center",
              "align-items": "center"
            });
            $(".full-descr__text, .full-start__title, .full-start__title-original").css("text-align", "center");
          }
        }
      });
    }
    if (window.appready) {
      c();
    } else {
      Lampa.Listener.follow("app", function (a) {
        if (a.type == "ready") {
          c();
        }
      });
    }
  })();
})();
