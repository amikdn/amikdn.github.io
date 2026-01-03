(function () {
  "use strict";
  Lampa.Platform.tv();

  (function () {
    // ===================================
    // Класс карточки для "ближайших эпизодов"
    // ===================================
    class EpisodeCard {
      constructor(data) {
        this.cardData = data.card || data;
        this.nextEpisode = data.next_episode_to_air || data.episode || {};

        if (this.cardData.source === undefined) {
          this.cardData.source = "tmdb";
        }

        Lampa.Arrays.extend(this.cardData, {
          title: this.cardData.name,
          original_title: this.cardData.original_name,
          release_date: this.cardData.first_air_date
        });

        this.cardData.release_year = (this.cardData.release_date || "0000").slice(0, 4);
      }

      build() {
        this.card = Lampa.Template.js("card_episode");
        this.posterImg = this.card.querySelector(".card__img") || {};
        this.episodeImg = this.card.querySelector(".full-episode__img img") || {};

        this.card.querySelector(".card__title").innerText = this.cardData.title;
        this.card.querySelector(".full-episode__num").innerText = this.cardData.unwatched || "";

        if (this.nextEpisode && this.nextEpisode.air_date) {
          this.card.querySelector(".full-episode__name").innerText = this.nextEpisode.name || Lampa.Lang.translate("noname");
          this.card.querySelector(".full-episode__num").innerText = this.nextEpisode.episode_number || "";
          this.card.querySelector(".full-episode__date").innerText = this.nextEpisode.air_date
            ? Lampa.Utils.parseTime(this.nextEpisode.air_date).full
            : "----";
        }

        const yearElement = this.card.querySelector(".card__age");
        if (this.cardData.release_year === "0000") {
          yearElement && yearElement.remove();
        } else {
          yearElement.innerText = this.cardData.release_year;
        }

        this.card.addEventListener("visible", this.onVisible.bind(this));
      }

      setupImages() {
        this.posterImg.onload = () => {};
        this.posterImg.onerror = () => {
          this.posterImg.src = "./img/img_broken.svg";
        };

        this.episodeImg.onload = () => {
          this.card.querySelector(".full-episode__img").classList.add("full-episode__img--loaded");
        };
        this.episodeImg.onerror = () => {
          this.episodeImg.src = "./img/img_broken.svg";
        };
      }

      create() {
        this.build();
        this.setupImages();

        this.card.addEventListener("hover:focus", () => {
          this.onFocus && this.onFocus(this.card, this.cardData);
        });
        this.card.addEventListener("hover:hover", () => {
          this.onHover && this.onHover(this.card, this.cardData);
        });
        this.card.addEventListener("hover:enter", () => {
          this.onEnter && this.onEnter(this.card, this.cardData);
        });
      }

      onVisible() {
        if (this.cardData.poster_path) {
          this.posterImg.src = Lampa.Api.img(this.cardData.poster_path);
        } else if (this.cardData.profile_path) {
          this.posterImg.src = Lampa.Api.img(this.cardData.profile_path);
        } else if (this.cardData.poster) {
          this.posterImg.src = this.cardData.poster;
        } else if (this.cardData.img) {
          this.posterImg.src = this.cardData.img;
        } else {
          this.posterImg.src = "./img/img_broken.svg";
        }

        if (this.nextEpisode.still_path) {
          this.episodeImg.src = Lampa.Api.img(this.nextEpisode.still_path, "w300");
        } else if (this.cardData.backdrop_path) {
          this.episodeImg.src = Lampa.Api.img(this.cardData.backdrop_path, "w300");
        } else if (this.nextEpisode.img) {
          this.episodeImg.src = this.nextEpisode.img;
        } else if (this.cardData.img) {
          this.episodeImg.src = this.cardData.img;
        } else {
          this.episodeImg.src = "./img/img_broken.svg";
        }

        this.onVisibleCallback && this.onVisibleCallback(this.card, this.cardData);
      }

      destroy() {
        this.posterImg.onerror = this.posterImg.onload = () => {};
        this.episodeImg.onerror = this.episodeImg.onload = () => {};
        this.posterImg.src = "";
        this.episodeImg.src = "";
        this.card && this.card.remove();
        this.card = this.posterImg = this.episodeImg = null;
      }

      render(jquery = false) {
        return jquery ? $(this.card) : this.card;
      }
    }

    // ===================================
    // Основной класс источника HUB
    // ===================================
    class HubSource {
      constructor(baseTmdb) {
        this.network = new Lampa.Reguest();
        this.baseTmdb = baseTmdb;
        this.discovery = false;
      }

      main(params = {}, onComplete, onError) {
        const categoriesConfig = [
          { id: "now_watch", order: parseInt(Lampa.Storage.get("number_now_watch"), 10) || 1, active: !Lampa.Storage.get("now_watch_remove") },
          { id: "upcoming_episodes", order: 2, active: !Lampa.Storage.get("upcoming_episodes_remove") },
          { id: "trend_day", order: parseInt(Lampa.Storage.get("number_trend_day"), 10) || 3, active: !Lampa.Storage.get("trend_day_remove") },
          { id: "trend_day_tv", order: parseInt(Lampa.Storage.get("number_trend_day_tv"), 10) || 4, active: !Lampa.Storage.get("trend_day_tv_remove") },
          { id: "trend_day_film", order: parseInt(Lampa.Storage.get("number_trend_day_film"), 10) || 5, active: !Lampa.Storage.get("trend_day_film_remove") },
          { id: "trend_week", order: parseInt(Lampa.Storage.get("number_trend_week"), 10) || 6, active: !Lampa.Storage.get("trend_week_remove") },
          { id: "trend_week_tv", order: parseInt(Lampa.Storage.get("number_trend_week_tv"), 10) || 7, active: !Lampa.Storage.get("trend_week_tv_remove") },
          { id: "trend_week_film", order: parseInt(Lampa.Storage.get("number_trend_week_film"), 10) || 8, active: !Lampa.Storage.get("trend_week_film_remove") },
          { id: "upcoming", order: parseInt(Lampa.Storage.get("number_upcoming"), 10) || 9, active: !Lampa.Storage.get("upcoming_remove") },
          { id: "popular_movie", order: parseInt(Lampa.Storage.get("number_popular_movie"), 10) || 10, active: !Lampa.Storage.get("popular_movie_remove") },
          { id: "popular_tv", order: parseInt(Lampa.Storage.get("number_popular_tv"), 10) || 11, active: !Lampa.Storage.get("popular_tv_remove") },
          { id: "top_movie", order: parseInt(Lampa.Storage.get("number_top_movie"), 10) || 12, active: !Lampa.Storage.get("top_movie_remove") },
          { id: "top_tv", order: parseInt(Lampa.Storage.get("number_top_tv"), 10) || 13, active: !Lampa.Storage.get("top_tv_remove") },
          { id: "netflix", order: parseInt(Lampa.Storage.get("number_netflix"), 10) || 14, active: !Lampa.Storage.get("netflix_remove") },
          { id: "apple_tv", order: parseInt(Lampa.Storage.get("number_apple_tv"), 10) || 15, active: !Lampa.Storage.get("apple_tv_remove") },
          { id: "prime_video", order: parseInt(Lampa.Storage.get("number_prime_video"), 10) || 16, active: !Lampa.Storage.get("prime_video_remove") },
          { id: "mgm", order: parseInt(Lampa.Storage.get("number_mgm"), 10) || 17, active: !Lampa.Storage.get("mgm_remove") },
          { id: "hbo", order: parseInt(Lampa.Storage.get("number_hbo"), 10) || 18, active: !Lampa.Storage.get("hbo_remove") },
          { id: "dorams", order: parseInt(Lampa.Storage.get("number_dorams"), 10) || 19, active: !Lampa.Storage.get("dorams_remove") },
          { id: "tur_serials", order: parseInt(Lampa.Storage.get("number_tur_serials"), 10) || 20, active: !Lampa.Storage.get("tur_serials_remove") },
          { id: "ind_films", order: parseInt(Lampa.Storage.get("number_ind_films"), 10) || 21, active: !Lampa.Storage.get("ind_films_remove") },
          { id: "rus_movie", order: parseInt(Lampa.Storage.get("number_rus_movie"), 10) || 22, active: !Lampa.Storage.get("rus_movie_remove") },
          { id: "rus_tv", order: parseInt(Lampa.Storage.get("number_rus_tv"), 10) || 23, active: !Lampa.Storage.get("rus_tv_remove") },
          { id: "rus_mult", order: parseInt(Lampa.Storage.get("number_rus_mult"), 10) || 24, active: !Lampa.Storage.get("rus_mult_remove") },
          { id: "start", order: parseInt(Lampa.Storage.get("number_start"), 10) || 25, active: !Lampa.Storage.get("start_remove") },
          { id: "premier", order: parseInt(Lampa.Storage.get("number_premier"), 10) || 26, active: !Lampa.Storage.get("premier_remove") },
          { id: "kion", order: parseInt(Lampa.Storage.get("number_kion"), 10) || 27, active: !Lampa.Storage.get("kion_remove") },
          { id: "ivi", order: parseInt(Lampa.Storage.get("number_ivi"), 10) || 28, active: !Lampa.Storage.get("ivi_remove") },
          { id: "okko", order: parseInt(Lampa.Storage.get("number_okko"), 10) || 29, active: !Lampa.Storage.get("okko_remove") },
          { id: "kinopoisk", order: parseInt(Lampa.Storage.get("number_kinopoisk"), 10) || 30, active: !Lampa.Storage.get("kinopoisk_remove") },
          { id: "wink", order: parseInt(Lampa.Storage.get("number_wink"), 10) || 31, active: !Lampa.Storage.get("wink_remove") },
          { id: "sts", order: parseInt(Lampa.Storage.get("number_sts"), 10) || 32, active: !Lampa.Storage.get("sts_remove") },
          { id: "tnt", order: parseInt(Lampa.Storage.get("number_tnt"), 10) || 33, active: !Lampa.Storage.get("tnt_remove") },
          { id: "collections_inter_tv", order: parseInt(Lampa.Storage.get("number_collections_inter_tv"), 10) || 34, active: !Lampa.Storage.get("collections_inter_tv_remove") },
          { id: "collections_rus_tv", order: parseInt(Lampa.Storage.get("number_collections_rus_tv"), 10) || 35, active: !Lampa.Storage.get("collections_rus_tv_remove") },
          { id: "collections_inter_movie", order: parseInt(Lampa.Storage.get("number_collections_inter_movie"), 10) || 36, active: !Lampa.Storage.get("collections_inter_movie_remove") },
          { id: "collections_rus_movie", order: parseInt(Lampa.Storage.get("number_collections_rus_movie"), 10) || 37, active: !Lampa.Storage.get("collections_rus_movie_remove") }
        ];

        const loadedIds = [];

        const shuffleArray = (arr) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        };

        const yearRanges = [
          { start: 2023, end: 2025 },
          { start: 2020, end: 2022 },
          { start: 2017, end: 2019 },
          { start: 2014, end: 2016 },
          { start: 2011, end: 2013 }
        ];

        const randomYearRange1 = yearRanges[Math.floor(Math.random() * yearRanges.length)];
        const randomYearRange2 = yearRanges[Math.floor(Math.random() * yearRanges.length)];

        const sortOptions = ["vote_count.desc", "popularity.desc", "revenue.desc"];
        const randomSort1 = sortOptions[Math.floor(Math.random() * sortOptions.length)];
        const randomSort2 = sortOptions[Math.floor(Math.random() * sortOptions.length)];

        const today = new Date().toISOString().substr(0, 10);

        const categoryHandlers = {
          now_watch: (callback) => {
            this.baseTmdb.get("movie/now_playing", params, (data) => {
              data.title = Lampa.Lang.translate("title_now_watch");
              this.applyDisplaySettings(data, "now_watch");
              if (Lampa.Storage.get("now_watch_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          upcoming_episodes: (callback) => {
            callback({
              source: "tmdb",
              results: Lampa.TimeTable.lately().slice(0, 20),
              title: Lampa.Lang.translate("title_upcoming_episodes"),
              nomore: true,
              cardClass: (item) => new EpisodeCard(item)
            });
          },

          trend_day: (callback) => {
            this.baseTmdb.get("trending/all/day", params, (data) => {
              data.title = Lampa.Lang.translate("title_trend_day");
              this.applyDisplaySettings(data, "trend_day");
              if (Lampa.Storage.get("trend_day_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          trend_day_tv: (callback) => {
            this.baseTmdb.get("trending/tv/day", params, (data) => {
              data.title = Lampa.Lang.translate("Сегодня в тренде (сериалы)");
              this.applyDisplaySettings(data, "trend_day_tv");
              if (Lampa.Storage.get("trend_day_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          trend_day_film: (callback) => {
            this.baseTmdb.get("trending/movie/day", params, (data) => {
              data.title = Lampa.Lang.translate("Сегодня в тренде (фильмы)");
              this.applyDisplaySettings(data, "trend_day_film");
              if (Lampa.Storage.get("trend_day_film_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          trend_week: (callback) => {
            this.baseTmdb.get("trending/all/week", params, (data) => {
              data.title = Lampa.Lang.translate("title_trend_week");
              this.applyDisplaySettings(data, "trend_week");
              if (Lampa.Storage.get("trend_week_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          trend_week_tv: (callback) => {
            this.baseTmdb.get("trending/tv/week", params, (data) => {
              data.title = Lampa.Lang.translate("В тренде за неделю (сериалы)");
              this.applyDisplaySettings(data, "trend_week_tv");
              if (Lampa.Storage.get("trend_week_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          trend_week_film: (callback) => {
            this.baseTmdb.get("trending/movie/week", params, (data) => {
              data.title = Lampa.Lang.translate("В тренде за неделю (фильмы)");
              this.applyDisplaySettings(data, "trend_week_film");
              if (Lampa.Storage.get("trend_week_film_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          upcoming: (callback) => {
            this.baseTmdb.get("movie/upcoming", params, (data) => {
              data.title = Lampa.Lang.translate("title_upcoming");
              this.applyDisplaySettings(data, "upcoming");
              if (Lampa.Storage.get("upcoming_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          popular_movie: (callback) => {
            this.baseTmdb.get("movie/popular", params, (data) => {
              data.title = Lampa.Lang.translate("title_popular_movie");
              this.applyDisplaySettings(data, "popular_movie");
              if (Lampa.Storage.get("popular_movie_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          popular_tv: (callback) => {
            this.baseTmdb.get("trending/tv/week", params, (data) => {
              data.title = Lampa.Lang.translate("title_popular_tv");
              this.applyDisplaySettings(data, "popular_tv");
              if (Lampa.Storage.get("popular_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          top_movie: (callback) => {
            this.baseTmdb.get("movie/top_rated", params, (data) => {
              data.title = Lampa.Lang.translate("title_top_movie");
              this.applyDisplaySettings(data, "top_movie");
              if (Lampa.Storage.get("top_movie_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          top_tv: (callback) => {
            this.baseTmdb.get("tv/top_rated", params, (data) => {
              data.title = Lampa.Lang.translate("title_top_tv");
              this.applyDisplaySettings(data, "top_tv");
              if (Lampa.Storage.get("top_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          netflix: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Netflix");
              this.applyDisplaySettings(data, "netflix");
              if (Lampa.Storage.get("netflix_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          apple_tv: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Apple TV+");
              this.applyDisplaySettings(data, "apple_tv");
              if (Lampa.Storage.get("apple_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          prime_video: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Prime Video");
              this.applyDisplaySettings(data, "prime_video");
              if (Lampa.Storage.get("prime_video_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          mgm: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("MGM+");
              this.applyDisplaySettings(data, "mgm");
              if (Lampa.Storage.get("mgm_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          hbo: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("HBO");
              this.applyDisplaySettings(data, "hbo");
              if (Lampa.Storage.get("hbo_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          dorams: (callback) => {
            this.baseTmdb.get(`discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Дорамы");
              this.applyDisplaySettings(data, "dorams");
              if (Lampa.Storage.get("dorams_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          tur_serials: (callback) => {
            this.baseTmdb.get(`discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Турецкие сериалы");
              this.applyDisplaySettings(data, "tur_serials");
              if (Lampa.Storage.get("tur_serials_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          ind_films: (callback) => {
            this.baseTmdb.get(`discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Индийские фильмы");
              this.applyDisplaySettings(data, "ind_films");
              if (Lampa.Storage.get("ind_films_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          rus_movie: (callback) => {
            this.baseTmdb.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Русские фильмы");
              this.applyDisplaySettings(data, "rus_movie");
              if (Lampa.Storage.get("rus_movie_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          rus_tv: (callback) => {
            this.baseTmdb.get(`discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Русские сериалы");
              this.applyDisplaySettings(data, "rus_tv");
              if (Lampa.Storage.get("rus_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          rus_mult: (callback) => {
            this.baseTmdb.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Русские мультфильмы");
              this.applyDisplaySettings(data, "rus_mult");
              if (Lampa.Storage.get("rus_mult_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          start: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Start");
              this.applyDisplaySettings(data, "start");
              if (Lampa.Storage.get("start_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          premier: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Premier");
              this.applyDisplaySettings(data, "premier");
              if (Lampa.Storage.get("premier_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          kion: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("KION");
              this.applyDisplaySettings(data, "kion");
              if (Lampa.Storage.get("kion_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          ivi: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("IVI");
              this.applyDisplaySettings(data, "ivi");
              if (Lampa.Storage.get("ivi_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          okko: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("OKKO");
              this.applyDisplaySettings(data, "okko");
              if (Lampa.Storage.get("okko_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          kinopoisk: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("КиноПоиск");
              this.applyDisplaySettings(data, "kinopoisk");
              if (Lampa.Storage.get("kinopoisk_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          wink: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("Wink");
              this.applyDisplaySettings(data, "wink");
              if (Lampa.Storage.get("wink_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          sts: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("СТС");
              this.applyDisplaySettings(data, "sts");
              if (Lampa.Storage.get("sts_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          tnt: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}`, params, (data) => {
              data.title = Lampa.Lang.translate("ТНТ");
              this.applyDisplaySettings(data, "tnt");
              if (Lampa.Storage.get("tnt_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          collections_inter_tv: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=213|2552|1024|6219|49&sort_by=${randomSort1}&first_air_date.gte=${randomYearRange1.start}-01-01&first_air_date.lte=${randomYearRange1.end}-12-31`, params, (data) => {
              data.title = Lampa.Lang.translate("Подборки зарубежных сериалов");
              this.applyDisplaySettings(data, "collections_inter_tv");
              if (Lampa.Storage.get("collections_inter_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          collections_rus_tv: (callback) => {
            this.baseTmdb.get(`discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=${randomSort1}&air_date.lte=${randomYearRange1.end}-12-31&first_air_date.gte=${randomYearRange1.start}-01-01`, params, (data) => {
              data.title = Lampa.Lang.translate("Подборки русских сериалов");
              this.applyDisplaySettings(data, "collections_rus_tv");
              if (Lampa.Storage.get("collections_rus_tv_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          collections_inter_movie: (callback) => {
            this.baseTmdb.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=${randomSort2}&primary_release_date.gte=${randomYearRange2.start}-01-01&primary_release_date.lte=${randomYearRange2.end}-12-31`, params, (data) => {
              data.title = Lampa.Lang.translate("Подборки зарубежных фильмов");
              this.applyDisplaySettings(data, "collections_inter_movie");
              if (Lampa.Storage.get("collections_inter_movie_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          },

          collections_rus_movie: (callback) => {
            this.baseTmdb.get(`discover/movie?primary_release_date.gte=${randomYearRange2.start}-01-01&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${randomSort2}&primary_release_date.lte=${randomYearRange2.end}-12-31`, params, (data) => {
              data.title = Lampa.Lang.translate("Подборки русских фильмов");
              this.applyDisplaySettings(data, "collections_rus_movie");
              if (Lampa.Storage.get("collections_rus_movie_shuffle") === true) shuffleArray(data.results);
              callback(data);
            }, callback);
          }
        };

        this.applyDisplaySettings = (data, prefix) => {
          const display = Lampa.Storage.get(prefix + "_display");
          if (display === "2") {
            data.collection = true;
            data.line_type = "collection";
          }
          if (display === "3") {
            data.small = true;
            data.wide = true;
            data.results.forEach(item => {
              item.promo = item.overview;
              item.promo_title = item.title || item.name;
            });
          }
          if (display === "4") {
            data.line_type = "top";
          }
        };

        const activeCategories = categoriesConfig
          .filter(cat => cat.active)
          .sort((a, b) => a.order - b.order);

        const loadFunctions = [];

        activeCategories.forEach(cat => {
          if (!loadedIds.includes(cat.id) && categoryHandlers[cat.id]) {
            loadFunctions.push(categoryHandlers[cat.id]);
            loadedIds.push(cat.id);
          }
        });

        if (Lampa.Storage.get("genres_cat") !== false) {
          // Жанры включены по умолчанию — ничего не добавляем дополнительно
        } else {
          // Если отключены — добавляем жанровые подборки (но в оригинале это наоборот: если false — добавляем жанры)
          // В оригинальном коде: if (Lampa.Storage.get("genres_cat") == false) — добавляет жанры
          Lampa.Api.sources.tmdb.genres.movie.forEach(genre => {
            if (!loadedIds.includes(genre.id)) {
              loadFunctions.push((callback) => {
                this.baseTmdb.get(`discover/movie?with_genres=${genre.id}`, params, (data) => {
                  data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ""));
                  shuffleArray(data.results);
                  callback(data);
                }, callback);
              });
              loadedIds.push(genre.id);
            }
          });
        }

        if (loadFunctions.length > 0) {
          Lampa.Api.partNext(loadFunctions, 56, onComplete, params);
        }
      }

      get(endpoint, params, success, error) {
        this.baseTmdb.get(endpoint, params, success, error);
      }
    }

    // ===================================
    // Регистрация источника HUB
    // ===================================
    const hubSource = Object.assign({}, Lampa.Api.sources.tmdb, new HubSource(Lampa.Api.sources.tmdb));
    Lampa.Api.sources.hub = hubSource;

    Object.defineProperty(Lampa.Api.sources, "hub", {
      get: () => hubSource
    });

    Lampa.Params.select("source", Object.assign({}, Lampa.Params.values.source, { hub: "HUB" }), "tmdb");

    if (Lampa.Storage.get("source") === "hub") {
      const savedSource = Lampa.Storage.get("source");
      const interval = setInterval(() => {
        const activity = Lampa.Activity.active();
        if (activity) {
          clearInterval(interval);
          Lampa.Activity.replace({
            source: savedSource,
            title: Lampa.Lang.translate("title_main") + " - " + Lampa.Storage.field("source").toUpperCase()
          });
        }
      }, 300);
    }

    // ===================================
    // Настройки HUB
    // ===================================
    Lampa.Settings.listener.follow("open", (e) => {
      if (e.name === "main") {
        if (Lampa.Settings.main().render().find('[data-component="hub_source"]').length === 0) {
          Lampa.SettingsApi.addComponent({ component: "hub_source", name: "Источник HUB" });
        }
        Lampa.Settings.main().update();
        Lampa.Settings.main().render().find('[data-component="hub_source"]').addClass("hide");
      }
    });

    Lampa.SettingsApi.addParam({
      component: "more",
      param: { name: "hub_source", type: "static", default: true },
      field: { name: "Источник HUB", description: "Настройки главного экрана" },
      onRender: (element) => {
        setTimeout(() => {
          $('.settings-param > div:contains("Источник HUB")').parent().insertAfter($('div[data-name="source"]'));
          if (Lampa.Storage.field("source") !== "hub") {
            element.hide();
          } else {
            element.show();
          }
        }, 20);

        element.on("hover:enter", () => {
          Lampa.Settings.create("hub_source");
          Lampa.Controller.enabled().controller.back = () => {
            Lampa.Settings.create("more");
          };
        });
      }
    });

    Lampa.Storage.listener.follow("change", (e) => {
      if (e.name === "source") {
        setTimeout(() => {
          if (Lampa.Storage.get("source") !== "hub") {
            $('.settings-param > div:contains("Источник HUB")').parent().hide();
          } else {
            $('.settings-param > div:contains("Источник HUB")').parent().show();
          }
        }, 50);
      }
    });

    function addCategorySettings(component, name, description, removeDefault, displayDefault, orderDefault, shuffleDefault) {
      Lampa.Settings.listener.follow("open", (e) => {
        if (e.name === "main") {
          if (Lampa.Settings.main().render().find(`[data-component="${component}"]`).length === 0) {
            Lampa.SettingsApi.addComponent({ component, name });
          }
          Lampa.Settings.main().render().find(`[data-component="${component}"]`).addClass("hide");
        }
      });

      Lampa.SettingsApi.addParam({
        component: "hub_source",
        param: { name: component, type: "static", default: true },
        field: { name, description },
        onRender: (el) => {
          el.on("hover:enter", () => {
            Lampa.Settings.create(component);
          });
        }
      });

      Lampa.SettingsApi.addParam({
        component,
        param: { name: component + "_remove", type: "trigger", default: removeDefault },
        field: { name: "Убрать с главной страницы" }
      });

      Lampa.SettingsApi.addParam({
        component,
        param: { name: component + "_display", type: "select", values: { 1: "Стандарт", 2: "Широкие маленькие", 3: "Широкие большие", 4: "Top Line" }, default: displayDefault },
        field: { name: "Вид отображения" }
      });

      Lampa.SettingsApi.addParam({
        component,
        param: { name: "number_" + component, type: "select", values: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13", 14: "14", 15: "15", 16: "16", 17: "17", 18: "18", 19: "19", 20: "20", 21: "21", 22: "22", 23: "23", 24: "24", 25: "25", 26: "26", 27: "27", 28: "28", 29: "29", 30: "30", 31: "31", 32: "32", 33: "33", 34: "34", 35: "35", 36: "36", 37: "37" }, default: orderDefault },
        field: { name: "Порядок отображения" }
      });

      Lampa.SettingsApi.addParam({
        component,
        param: { name: component + "_shuffle", type: "trigger", default: shuffleDefault },
        field: { name: "Изменять порядок карточек на главной" }
      });
    }

    addCategorySettings("now_watch", "Сейчас смотрят", "Нажми для настройки", false, "1", "1", false);
    addCategorySettings("trend_day", "Сегодня в тренде", "Нажми для настройки", false, "1", "3", false);
    addCategorySettings("trend_day_tv", "Сегодня в тренде (сериалы)", "Нажми для настройки", true, "1", "4", false);
    addCategorySettings("trend_day_film", "Сегодня в тренде (фильмы)", "Нажми для настройки", true, "1", "5", false);
    addCategorySettings("trend_week", "В тренде за неделю", "Нажми для настройки", false, "1", "6", false);
    addCategorySettings("trend_week_tv", "В тренде за неделю (сериалы)", "Нажми для настройки", true, "1", "7", false);
    addCategorySettings("trend_week_film", "В тренде за неделю (фильмы)", "Нажми для настройки", true, "1", "8", false);
    addCategorySettings("upcoming", "Смотрите в кинозалах", "Нажми для настройки", false, "1", "9", false);
    addCategorySettings("popular_movie", "Популярные фильмы", "Нажми для настройки", false, "1", "10", false);
    addCategorySettings("popular_tv", "Популярные сериалы", "Нажми для настройки", false, "1", "11", false);
    addCategorySettings("top_movie", "Топ фильмы", "Нажми для настройки", false, "4", "12", false);
    addCategorySettings("top_tv", "Топ сериалы", "Нажми для настройки", false, "4", "13", false);
    addCategorySettings("netflix", "Netflix", "Нажми для настройки", true, "1", "14", false);
    addCategorySettings("apple_tv", "Apple TV+", "Нажми для настройки", true, "1", "15", false);
    addCategorySettings("prime_video", "Prime Video", "Нажми для настройки", true, "1", "16", false);
    addCategorySettings("mgm", "MGM+", "Нажми для настройки", true, "1", "17", false);
    addCategorySettings("hbo", "HBO", "Нажми для настройки", true, "1", "18", false);
    addCategorySettings("dorams", "Дорамы", "Нажми для настройки", true, "1", "19", false);
    addCategorySettings("tur_serials", "Турецкие сериалы", "Нажми для настройки", true, "1", "20", false);
    addCategorySettings("ind_films", "Индийские фильмы", "Нажми для настройки", true, "1", "21", false);
    addCategorySettings("rus_movie", "Русские фильмы", "Нажми для настройки", true, "1", "22", false);
    addCategorySettings("rus_tv", "Русские сериалы", "Нажми для настройки", true, "1", "23", false);
    addCategorySettings("rus_mult", "Русские мультфильмы", "Нажми для настройки", true, "1", "24", false);
    addCategorySettings("start", "Start", "Нажми для настройки", true, "1", "25", false);
    addCategorySettings("premier", "Premier", "Нажми для настройки", true, "1", "26", false);
    addCategorySettings("kion", "KION", "Нажми для настройки", true, "1", "27", false);
    addCategorySettings("ivi", "ИВИ", "Нажми для настройки", true, "1", "28", false);
    addCategorySettings("okko", "Okko", "Нажми для настройки", true, "1", "29", false);
    addCategorySettings("kinopoisk", "КиноПоиск", "Нажми для настройки", true, "1", "30", false);
    addCategorySettings("wink", "Wink", "Нажми для настройки", true, "1", "31", false);
    addCategorySettings("sts", "СТС", "Нажми для настройки", true, "1", "32", false);
    addCategorySettings("tnt", "ТНТ", "Нажми для настройки", true, "1", "33", false);
    addCategorySettings("collections_inter_tv", "Подборки зарубежных сериалов", "Нажми для настройки", true, "1", "34", false);
    addCategorySettings("collections_rus_tv", "Подборки русских сериалов", "Нажми для настройки", true, "1", "35", false);
    addCategorySettings("collections_inter_movie", "Подборки зарубежных фильмов", "Нажми для настройки", true, "1", "36", false);
    addCategorySettings("collections_rus_movie", "Подборки русских фильмов", "Нажми для настройки", true, "1", "37", false);

    Lampa.SettingsApi.addParam({
      component: "hub_source",
      param: { name: "upcoming_episodes_remove", type: "trigger", default: false },
      field: { name: "Выход ближайших эпизодов", description: "Убрать с главной страницы" }
    });

    Lampa.SettingsApi.addParam({
      component: "hub_source",
      param: { name: "genres_cat", type: "trigger", default: true },
      field: { name: "Подборки по жанрам", description: "Убрать с главной страницы" }
    });

    // Настройки по умолчанию при первом запуске
    const initInterval = setInterval(() => {
      if (typeof Lampa !== "undefined") {
        clearInterval(initInterval);
        if (!Lampa.Storage.get("hub_source_params", "false")) {
          Lampa.Storage.set("hub_source_params", "true");

          Lampa.Storage.set("trend_day_tv_remove", "true");
          Lampa.Storage.set("trend_day_film_remove", "true");
          Lampa.Storage.set("trend_week_tv_remove", "true");
          Lampa.Storage.set("trend_week_film_remove", "true");
          Lampa.Storage.set("top_movie_display", "4");
          Lampa.Storage.set("top_tv_display", "4");
          Lampa.Storage.set("netflix_remove", "true");
          Lampa.Storage.set("apple_tv_remove", "true");
          Lampa.Storage.set("prime_video_remove", "true");
          Lampa.Storage.set("mgm_remove", "true");
          Lampa.Storage.set("hbo_remove", "true");
          Lampa.Storage.set("dorams_remove", "true");
          Lampa.Storage.set("tur_serials_remove", "true");
          Lampa.Storage.set("ind_films_remove", "true");
          Lampa.Storage.set("rus_movie_remove", "true");
          Lampa.Storage.set("rus_tv_remove", "true");
          Lampa.Storage.set("rus_mult_remove", "true");
          Lampa.Storage.set("start_remove", "true");
          Lampa.Storage.set("premier_remove", "true");
          Lampa.Storage.set("kion_remove", "true");
          Lampa.Storage.set("ivi_remove", "true");
          Lampa.Storage.set("okko_remove", "true");
          Lampa.Storage.set("kinopoisk_remove", "true");
          Lampa.Storage.set("wink_remove", "true");
          Lampa.Storage.set("sts_remove", "true");
          Lampa.Storage.set("tnt_remove", "true");
          Lampa.Storage.set("collections_inter_tv_remove", "true");
          Lampa.Storage.set("collections_rus_tv_remove", "true");
          Lampa.Storage.set("collections_inter_movie_remove", "true");
          Lampa.Storage.set("collections_rus_movie_remove", "true");
          Lampa.Storage.set("genres_cat", "true");
        }
      }
    }, 200);

    if (window.appready) {
      // Инициализация при готовности
    } else {
      Lampa.Listener.follow("app", (e) => {
        if (e.type === "ready") {
          // Инициализация при готовности
        }
      });
    }
  })();
})();
