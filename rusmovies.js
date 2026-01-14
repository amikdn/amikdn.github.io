(function () {
  'use strict';

  Lampa.Platform.tv();
  (function () {
    "use strict";
    function c() {
      var c = new Date().toISOString().substr(0, 10);
      var d = [{
        title: "Русские фильмы",
        img: "https://amikdn.github.io/img/rus_movie.jpg",
        request: "discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=" + c
      }, {
        title: "Русские сериалы",
        img: "https://amikdn.github.io/img/rus_tv.jpg",
        request: "discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=" + c
      }, {
        title: "Русские мультфильмы",
        img: "https://amikdn.github.io/img/rus_mult.jpg",
        request: "discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=" + c
      }, {
        title: "Start",
        img: "https://amikdn.github.io/img/start.jpg",
        request: "discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "Premier",
        img: "https://amikdn.github.io/img/premier.jpg",
        request: "discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "KION",
        img: "https://amikdn.github.io/img/kion.jpg",
        request: "discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "ИВИ",
        img: "https://amikdn.github.io/img/ivi.jpg",
        request: "discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "Okko",
        img: "https://amikdn.github.io/img/okko.jpg",
        request: "discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "КиноПоиск",
        img: "https://amikdn.github.io/img/kinopoisk.jpg",
        request: "discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "Wink",
        img: "https://amikdn.github.io/img/wink.jpg",
        request: "discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "СТС",
        img: "https://amikdn.github.io/img/sts.jpg",
        request: "discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=" + c
      }, {
        title: "ТНТ",
        img: "https://amikdn.github.io/img/tnt.jpg",
        request: "discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=" + c
      }];
      function e(a, b, c) {
        var e = {
          collection: true,
          total_pages: 1,
          results: d.map(function (a) {
            return {
              title: a.title,
              img: a.img,
              hpu: a.request
            };
          })
        };
        b(e);
      }
      function f(a, b, c) {
        var d = new Lampa.Reguest();
        var e = Lampa.Utils.protocol() + "api.themoviedb.org/3/" + a.url + "&page=" + (a.page || 1);
        d.native(e, function (c) {
          c.title = a.title;
          b(c);
        }, c);
      }
      function g() {
        network.clear();
      }
      var h = {
        main: e,
        full: f,
        clear: g
      };
      function i(a) {
        var b = new Lampa.InteractionCategory(a);
        b.create = function () {
          h.main(a, this.build.bind(this), this.empty.bind(this));
        };
        b.nextPageReuest = function (a, c, d) {
          h.main(a, c.bind(b), d.bind(b));
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
      function j(a) {
        var b = new Lampa.InteractionCategory(a);
        b.create = function () {
          h.full(a, this.build.bind(this), this.empty.bind(this));
        };
        b.nextPageReuest = function (a, c, d) {
          h.full(a, c.bind(b), d.bind(b));
        };
        return b;
      }
      var k = {
        type: "video",
        version: "1.0.0",
        name: "Русское",
        description: "Русские новинки",
        component: "rus_movie"
      };
      if (!Lampa.Manifest.plugins) {
        Lampa.Manifest.plugins = {};
      }
      Lampa.Manifest.plugins.rus_movie = k;
      Lampa.Component.add("rus_movie", i);
      Lampa.Storage.listener.follow("change", function (a) {
        if (a.name == "activity") {
          if (Lampa.Activity.active().component !== "rus_movie") {
            // TOLOOK
            setTimeout(function () {
              $(".background").show();
            }, 2000);
          } else {
            $(".background").hide();
          }
        }
      });
      var l = $("<li class=\"menu__item selector\"><div class=\"menu__ico\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1.2em\" height=\"1.2em\" viewBox=\"0 0 48 48\"><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\"><path stroke-linejoin=\"round\" d=\"M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z\"/><path stroke-linejoin=\"round\" d=\"M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z\"/><path stroke-linecap=\"round\" d=\"M24 44h20\"/></g></svg></div><div class=\"menu__text\">" + k.name + "</div></li>");
      l.on("hover:enter", function () {
        Lampa.Activity.push({
          url: "",
          title: k.name,
          component: "rus_movie",
          page: 1
        });
        $(".card").css("text-align", "center");
      });
      $(".menu .menu__list").eq(0).append(l);
      function m(a) {
        var b = a.card || a;
        var c = a.next_episode_to_air || a.episode || {};
        if (b.source == undefined) {
          b.source = "tmdb";
        }
        Lampa.Arrays.extend(b, {
          title: b.name,
          original_title: b.original_name,
          release_date: b.first_air_date
        });
        b.release_year = ((b.release_date || "0000") + "").slice(0, 4);
        function d(a) {
          if (a) {
            a.remove();
          }
        }
        this.build = function () {
          this.card = Lampa.Template.js("card_episode");
          this.img_poster = this.card.querySelector(".card__img") || {};
          this.img_episode = this.card.querySelector(".full-episode__img img") || {};
          this.card.querySelector(".card__title").innerText = b.title;
          this.card.querySelector(".full-episode__num").innerText = b.unwatched || "";
          if (c && c.air_date) {
            this.card.querySelector(".full-episode__name").innerText = c.name || Lang.translate("noname");
            this.card.querySelector(".full-episode__num").innerText = c.episode_number || "";
            this.card.querySelector(".full-episode__date").innerText = c.air_date ? Lampa.Utils.parseTime(c.air_date).full : "----";
          }
          if (b.release_year == "0000") {
            d(this.card.querySelector(".card__age"));
          } else {
            this.card.querySelector(".card__age").innerText = b.release_year;
          }
          this.card.addEventListener("visible", this.visible.bind(this));
        };
        this.image = function () {
          var a = this;
          this.img_poster.onload = function () {};
          this.img_poster.onerror = function () {
            a.img_poster.src = "./img/img_broken.svg";
          };
          this.img_episode.onload = function () {
            a.card.querySelector(".full-episode__img").classList.add("full-episode__img--loaded");
          };
          this.img_episode.onerror = function () {
            a.img_episode.src = "./img/img_broken.svg";
          };
        };
        this.create = function () {
          var a = this;
          this.build();
          this.card.addEventListener("hover:focus", function () {
            if (a.onFocus) {
              a.onFocus(a.card, b);
            }
          });
          this.card.addEventListener("hover:hover", function () {
            if (a.onHover) {
              a.onHover(a.card, b);
            }
          });
          this.card.addEventListener("hover:enter", function () {
            if (a.onEnter) {
              a.onEnter(a.card, b);
            }
          });
          this.image();
        };
        this.visible = function () {
          if (b.poster_path) {
            this.img_poster.src = Lampa.Api.img(b.poster_path);
          } else if (b.profile_path) {
            this.img_poster.src = Lampa.Api.img(b.profile_path);
          } else if (b.poster) {
            this.img_poster.src = b.poster;
          } else if (b.img) {
            this.img_poster.src = b.img;
          } else {
            this.img_poster.src = "./img/img_broken.svg";
          }
          if (b.still_path) {
            this.img_episode.src = Lampa.Api.img(c.still_path, "w300");
          } else if (b.backdrop_path) {
            this.img_episode.src = Lampa.Api.img(b.backdrop_path, "w300");
          } else if (c.img) {
            this.img_episode.src = c.img;
          } else if (b.img) {
            this.img_episode.src = b.img;
          } else {
            this.img_episode.src = "./img/img_broken.svg";
          }
          if (this.onVisible) {
            this.onVisible(this.card, b);
          }
        };
        this.destroy = function () {
          this.img_poster.onerror = function () {};
          this.img_poster.onload = function () {};
          this.img_episode.onerror = function () {};
          this.img_episode.onload = function () {};
          this.img_poster.src = "";
          this.img_episode.src = "";
          d(this.card);
          this.card = null;
          this.img_poster = null;
          this.img_episode = null;
        };
        this.render = function (a) {
          if (a) {
            return this.card;
          } else {
            return $(this.card);
          }
        };
      }
      function n(a) {
        this.network = new Lampa.Reguest();
        this.main = function () {
          var b = [{
            start: 2023,
            end: 2025
          }, {
            start: 2020,
            end: 2022
          }, {
            start: 2017,
            end: 2019
          }, {
            start: 2014,
            end: 2016
          }, {
            start: 2011,
            end: 2013
          }];
          var c = b[Math.floor(Math.random() * b.length)];
          var d = c.start + "-01-01";
          var e = c.end + "-12-31";
          var f = b[Math.floor(Math.random() * b.length)];
          var g = f.start + "-01-01";
          var h = f.end + "-12-31";
          var i = ["vote_count.desc", "vote_average.desc", "popularity.desc", "revenue.desc"];
          var j = Math.floor(Math.random() * i.length);
          var k = i[j];
          var l = ["vote_count.desc", "popularity.desc", "revenue.desc"];
          var n = Math.floor(Math.random() * l.length);
          var o = l[n];
          var p = new Date().toISOString().substr(0, 10);
          var q = this;
          var r = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var s = arguments.length > 1 ? arguments[1] : undefined;
          var t = arguments.length > 2 ? arguments[2] : undefined;
          var u = [function (a) {
            q.get("movie/now_playing", r, function (b) {
              b.title = Lampa.Lang.translate("title_now_watch");
              b.collection = true;
              b.line_type = "collection";
              a(b);
            }, a);
          }, function (a) {
            a({
              source: "tmdb",
              results: Lampa.TimeTable.lately().slice(0, 20),
              title: Lampa.Lang.translate("title_upcoming_episodes"),
              nomore: true,
              cardClass: function c(a, b) {
                return new m(a, b);
              }
            });
          }, function (a) {
            q.get("trending/all/day", r, function (b) {
              b.title = Lampa.Lang.translate("title_trend_day");
              a(b);
            }, a);
          }, function (a) {
            q.get("trending/all/week", r, function (b) {
              b.title = Lampa.Lang.translate("title_trend_week");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=" + new Date().toISOString().substr(0, 10), r, function (b) {
              b.title = Lampa.Lang.translate("Русские фильмы");
              b.small = true;
              b.wide = true;
              b.results.forEach(function (a) {
                a.promo = a.overview;
                a.promo_title = a.title || a.name;
              });
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("Русские сериалы");
              a(b);
            }, a);
          }, function (a) {
            q.get("movie/upcoming", r, function (b) {
              b.title = Lampa.Lang.translate("title_upcoming");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=" + new Date().toISOString().substr(0, 10), r, function (b) {
              b.title = Lampa.Lang.translate("Русские мультфильмы");
              b.collection = true;
              b.line_type = "collection";
              a(b);
            }, a);
          }, function (a) {
            q.get("movie/popular", r, function (b) {
              b.title = Lampa.Lang.translate("title_popular_movie");
              a(b);
            }, a);
          }, function (a) {
            q.get("trending/tv/week", r, function (b) {
              b.title = Lampa.Lang.translate("title_popular_tv");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/movie?primary_release_date.gte=" + g + "&primary_release_date.lte=" + h + "&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=" + o, r, function (b) {
              b.title = Lampa.Lang.translate("Подборки русских фильмов");
              b.line_type = "top";
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?first_air_date.gte=" + d + "&first_air_date.lte=" + e + "&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=" + k, r, function (b) {
              b.title = Lampa.Lang.translate("Подборки русских сериалов");
              b.line_type = "top";
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("Start");
              b.small = true;
              b.wide = true;
              b.results.forEach(function (a) {
                a.promo = a.overview;
                a.promo_title = a.title || a.name;
              });
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("Premier");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("KION");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("IVI");
              b.collection = true;
              b.line_type = "collection";
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("OKKO");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("КиноПоиск");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("Wink");
              b.small = true;
              b.wide = true;
              b.results.forEach(function (a) {
                a.promo = a.overview;
                a.promo_title = a.title || a.name;
              });
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("СТС");
              a(b);
            }, a);
          }, function (a) {
            q.get("discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=" + p, r, function (b) {
              b.title = Lampa.Lang.translate("ТНТ");
              a(b);
            }, a);
          }, function (a) {
            q.get("movie/top_rated", r, function (b) {
              b.title = Lampa.Lang.translate("title_top_movie");
              b.line_type = "top";
              a(b);
            }, a);
          }, function (a) {
            q.get("tv/top_rated", r, function (b) {
              b.title = Lampa.Lang.translate("title_top_tv");
              b.line_type = "top";
              a(b);
            }, a);
          }];
          var v = u.length + 1;
          Lampa.Arrays.insert(u, 0, Lampa.Api.partPersons(u, 6, "movie", v));
          a.genres.movie.forEach(function (a) {
            var b = function c(b) {
              q.get("discover/movie?with_genres=" + a.id, r, function (c) {
                c.title = Lampa.Lang.translate(a.title.replace(/[^a-z_]/g, ""));
                b(c);
              }, b);
            };
            u.push(b);
          });
          function w(a, b) {
            Lampa.Api.partNext(u, 6, a, b);
          }
          w(s, t);
          return w;
        };
      }
      if (Lampa.Storage.get("rus_movie_main") !== false) {
        Object.assign(Lampa.Api.sources.tmdb, new n(Lampa.Api.sources.tmdb));
        o();
      }
      function o() {
        if (Lampa.Storage.get("source") == "tmdb") {
          var e = Lampa.Storage.get("source");
          var f = // TOLOOK
          setInterval(function () {
            var a = Lampa.Activity.active();
            var b = $("#app > div.settings > div.settings__content.layer--height > div.settings__body > div");
            if (a && a.component === "main" && !b.length > 0) {
              clearInterval(f);
              Lampa.Activity.replace({
                source: e,
                title: Lampa.Lang.translate("title_main") + " - " + Lampa.Storage.field("source").toUpperCase()
              });
            }
          }, 200);
        }
      }
      Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
          name: "rus_movie_main",
          type: "trigger",
          default: true
        },
        field: {
          name: "Русские новинки на главной",
          description: "Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)"
        },
        onRender: function (a) {
          // TOLOOK
          setTimeout(function () {
            $("div[data-name=\"rus_movie_main\"]").insertAfter("div[data-name=\"interface_size\"]");
          }, 0);
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
