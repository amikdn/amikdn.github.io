;
(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    "use strict";
    function c() {
      var e = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"><g fill=\"currentColor\"><path d=\"M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3m2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1m2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848z\"/><path d=\"M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5z\"/></g></svg>";
      var f = new Date().toISOString().substr(0, 10);
      var g = [{
        title: "Дорамы",
        img: "https://amikdn.github.io/img/dorams.jpg",
        request: "discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "Турецкие сериалы",
        img: "https://amikdn.github.io/img/tur_serials.jpg",
        request: "discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "Индийские фильмы",
        img: "https://amikdn.github.io/img/ind_films.jpg",
        request: "discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "Netflix",
        img: "https://amikdn.github.io/img/netflix.jpg",
        request: "discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "Apple TV+",
        img: "https://amikdn.github.io/img/apple_tv.jpg",
        request: "discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "Prime Video",
        img: "https://amikdn.github.io/img/prime_video.jpg",
        request: "discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "MGM+",
        img: "https://amikdn.github.io/img/mgm.jpg",
        request: "discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }, {
        title: "HBO",
        img: "https://amikdn.github.io/img/hbo.jpg",
        request: "discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + f
      }];
      function h(a, b, c) {
        var d = {
          collection: true,
          total_pages: 1,
          results: g.map(function (a) {
            return {
              title: a.title,
              img: a.img,
              hpu: a.request
            };
          })
        };
        b(d);
      }
      function i(a, b, c) {
        var d = new Lampa.Reguest();
        var e = Lampa.Utils.protocol() + "api.themoviedb.org/3/" + a.url + "&page=" + (a.page || 1);
        d.native(e, function (c) {
          c.title = a.title;
          b(c);
        }, c);
      }
      function j() {
        network.clear();
      }
      var k = {
        main: h,
        full: i,
        clear: j
      };
      function l(a) {
        var b = new Lampa.InteractionCategory(a);
        b.create = function () {
          k.main(a, this.build.bind(this), this.empty.bind(this));
        };
        b.nextPageReuest = function (a, c, d) {
          k.main(a, c.bind(b), d.bind(b));
        };
        b.cardRender = function (a, b, c) {
          c.onMenu = false;
          c.onEnter = function () {
            Lampa.Activity.push({
              url: b.hpu,
              title: b.title,
              component: "category_full",
              source: "tmdb",
              page: 1
            });
          };
        };
        return b;
      }
      function m(a) {
        var b = new Lampa.InteractionCategory(a);
        b.create = function () {
          k.full(a, this.build.bind(this), this.empty.bind(this));
        };
        b.nextPageReuest = function (a, c, d) {
          k.full(a, c.bind(b), d.bind(b));
        };
        return b;
      }
      var n = {
        type: "video",
        version: "1.0.0",
        name: "Зарубежное",
        description: "Зарубежные подборки",
        component: "inter_movie"
      };
      if (!Lampa.Manifest.plugins) {
        Lampa.Manifest.plugins = {};
      }
      Lampa.Manifest.plugins.inter_movie = n;
      Lampa.Component.add("inter_movie", l);
      Lampa.Storage.listener.follow("change", function (a) {
        if (a.name == "activity") {
          if (Lampa.Activity.active().component !== "inter_movie") {
            // TOLOOK
            setTimeout(function () {
              $(".background").show();
            }, 2000);
          } else {
            $(".background").hide();
          }
        }
      });
      var o = $("<li class=\"menu__item selector\"><div class=\"menu__ico\">" + e + "</div><div class=\"menu__text\">" + n.name + "</div></li>");
      o.on("hover:enter", function () {
        Lampa.Activity.push({
          url: "",
          title: n.name,
          component: "inter_movie",
          page: 1
        });
        $(".card").css("text-align", "center");
      });
      $(".menu .menu__list").eq(0).append(o);
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
