(function() {
  'use strict';

  Lampa.Platform.tv();
  (function() {

    'use strict';

    function init() {
      var EpisodeCard = function(data3) {
          var
            card = data3.card || data3,
            episode = data3.next_episode_to_air || data3.episode || {};
          if (card.source == undefined) card.source = "tmdb";
          Lampa.Arrays.extend(card, {
            title: card.name,
            original_title: card.original_name,
            release_date: card.first_air_date
          }), card.release_year = ((card.release_date || '0000') + '').slice(0, 4);

          function removeElement(element) {
            if (element) element.remove();
          }
          this.build = function() {
            this.card = Lampa.Template.js("card_episode"), this.img_poster = this.card.querySelector('.card__img') || {}, this.img_episode = this.card.querySelector(".full-episode__img img") || {}, this.card.querySelector('.card__title').innerText = card.title, this.card.querySelector(".full-episode__num").innerText = card.unwatched || '', episode && episode.air_date && (this.card.querySelector(".full-episode__name").innerText = episode.name || Lang.translate("noname"), this.card.querySelector(".full-episode__num").innerText = episode.episode_number || '', this.card.querySelector(".full-episode__date").innerText = episode.air_date ? Lampa.Utils.parseTime(episode.air_date).full : "----"), card.release_year == "0000" ? removeElement(this.card.querySelector('.card__age')) : this.card.querySelector(".card__age").innerText = card.release_year, this.card.addEventListener("visible", this.visible.bind(this));
          }, this.image = function() {
            var
              self = this;
            this.img_poster.onload = function() {}, this.img_poster.onerror = function() {
              self.img_poster.src = './img/img_broken.svg';
            }, this.img_episode.onload = function() {
              self.card.querySelector(".full-episode__img").classList.add('full-episode__img--loaded');
            }, this.img_episode.onerror = function() {
              self.img_episode.src = "./img/img_broken.svg";
            };
          }, this.create = function() {
            var
              self5 = this;
            this.build(), this.card.addEventListener("hover:focus", function() {
              if (self5.onFocus) self5.onFocus(self5.card, card);
            }), this.card.addEventListener("hover:hover", function() {
              if (self5.onHover) self5.onHover(self5.card, card);
            }), this.card.addEventListener("hover:enter", function() {
              if (self5.onEnter) self5.onEnter(self5.card, card);
            }), this.image();
          }, this.visible = function() {
            if (card.poster_path) this.img_poster.src = Lampa.Api.img(card.poster_path);
            else {
              if (card.profile_path) this.img_poster.src = Lampa.Api.img(card.profile_path);
              else {
                if (card.poster) this.img_poster.src = card.poster;
                else {
                  if (card.img) this.img_poster.src = card.img;
                  else this.img_poster.src = './img/img_broken.svg';
                }
              }
            }
            if (card.still_path) this.img_episode.src = Lampa.Api.img(episode.still_path, 'w300');
            else {
              if (card.backdrop_path) this.img_episode.src = Lampa.Api.img(card.backdrop_path, "w300");
              else {
                if (episode.img) this.img_episode.src = episode.img;
                else {
                  if (card.img) this.img_episode.src = card.img;
                  else this.img_episode.src = "./img/img_broken.svg";
                }
              }
            }
            if (this.onVisible) this.onVisible(this.card, card);
          }, this.destroy = function() {
            this.img_poster.onerror = function() {}, this.img_poster.onload = function() {}, this.img_episode.onerror = function() {}, this.img_episode.onload = function() {}, this.img_poster.src = '', this.img_episode.src = '', removeElement(this.card), this.card = null, this.img_poster = null, this.img_episode = null;
          }, this.render = function(raw) {
            return raw ? this.card : $(this.card);
          };
        },
        PersonalSource = function(baseSource) {
          this.network = new Lampa[("Reguest")](), this.discovery = false, this.main = function() {
            var
              self3 = this,
              params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              onComplete = arguments.length > 1 ? arguments[1] : undefined,
              onError5 = arguments.length > 2 ? arguments[2] : undefined,
              partSize = 56,
              categoryList = [{
                id: "now_watch",
                order: parseInt(Lampa.Storage.get('number_now_watch'), 10) || 1,
                active: !Lampa.Storage.get("now_watch_remove")
              }, {
                id: 'upcoming_episodes',
                order: 2,
                active: !Lampa.Storage.get("upcoming_episodes_remove")
              }, {
                id: "trend_day",
                order: parseInt(Lampa.Storage.get('number_trend_day'), 10) || 3,
                active: !Lampa.Storage.get("trend_day_remove")
              }, {
                id: "trend_day_tv",
                order: parseInt(Lampa.Storage.get("number_trend_day_tv"), 10) || 4,
                active: !Lampa.Storage.get("trend_day_tv_remove")
              }, {
                id: "trend_day_film",
                order: parseInt(Lampa.Storage.get("number_trend_day_film"), 10) || 5,
                active: !Lampa.Storage.get("trend_day_film_remove")
              }, {
                id: 'trend_week',
                order: parseInt(Lampa.Storage.get("number_trend_week"), 10) || 6,
                active: !Lampa.Storage.get('trend_week_remove')
              }, {
                id: "trend_week_tv",
                order: parseInt(Lampa.Storage.get('number_trend_week_tv'), 10) || 7,
                active: !Lampa.Storage.get("trend_week_tv_remove")
              }, {
                id: "trend_week_film",
                order: parseInt(Lampa.Storage.get("number_trend_week_film"), 10) || 8,
                active: !Lampa.Storage.get("trend_week_film_remove")
              }, {
                id: 'upcoming',
                order: parseInt(Lampa.Storage.get("number_upcoming"), 10) || 9,
                active: !Lampa.Storage.get("upcoming_remove")
              }, {
                id: "popular_movie",
                order: parseInt(Lampa.Storage.get("number_popular_movie"), 10) || 10,
                active: !Lampa.Storage.get("popular_movie_remove")
              }, {
                id: 'popular_tv',
                order: parseInt(Lampa.Storage.get("number_popular_tv"), 10) || 11,
                active: !Lampa.Storage.get("popular_tv_remove")
              }, {
                id: "top_movie",
                order: parseInt(Lampa.Storage.get("number_top_movie"), 10) || 12,
                active: !Lampa.Storage.get("top_movie_remove")
              }, {
                id: "top_tv",
                order: parseInt(Lampa.Storage.get("number_top_tv"), 10) || 13,
                active: !Lampa.Storage.get("top_tv_remove")
              }, {
                id: "netflix",
                order: parseInt(Lampa.Storage.get('number_netflix'), 10) || 14,
                active: !Lampa.Storage.get("netflix_remove")
              }, {
                id: "apple_tv",
                order: parseInt(Lampa.Storage.get('number_apple_tv'), 10) || 15,
                active: !Lampa.Storage.get("apple_tv_remove")
              }, {
                id: "prime_video",
                order: parseInt(Lampa.Storage.get("number_prime_video"), 10) || 16,
                active: !Lampa.Storage.get('prime_video_remove')
              }, {
                id: "mgm",
                order: parseInt(Lampa.Storage.get("number_mgm"), 10) || 17,
                active: !Lampa.Storage.get("mgm_remove")
              }, {
                id: "hbo",
                order: parseInt(Lampa.Storage.get('number_hbo'), 10) || 18,
                active: !Lampa.Storage.get('hbo_remove')
              }, {
                id: "dorams",
                order: parseInt(Lampa.Storage.get("number_dorams"), 10) || 19,
                active: !Lampa.Storage.get('dorams_remove')
              }, {
                id: "tur_serials",
                order: parseInt(Lampa.Storage.get("number_tur_serials"), 10) || 20,
                active: !Lampa.Storage.get("tur_serials_remove")
              }, {
                id: 'ind_films',
                order: parseInt(Lampa.Storage.get("number_ind_films"), 10) || 21,
                active: !Lampa.Storage.get("ind_films_remove")
              }, {
                id: 'rus_movie',
                order: parseInt(Lampa.Storage.get("number_rus_movie"), 10) || 22,
                active: !Lampa.Storage.get("rus_movie_remove")
              }, {
                id: "rus_tv",
                order: parseInt(Lampa.Storage.get("number_rus_tv"), 10) || 23,
                active: !Lampa.Storage.get("rus_tv_remove")
              }, {
                id: "rus_mult",
                order: parseInt(Lampa.Storage.get('number_rus_mult'), 10) || 24,
                active: !Lampa.Storage.get("rus_mult_remove")
              }, {
                id: "start",
                order: parseInt(Lampa.Storage.get("number_start"), 10) || 25,
                active: !Lampa.Storage.get("start_remove")
              }, {
                id: "premier",
                order: parseInt(Lampa.Storage.get("number_premier"), 10) || 26,
                active: !Lampa.Storage.get("premier_remove")
              }, {
                id: "kion",
                order: parseInt(Lampa.Storage.get("number_kion"), 10) || 27,
                active: !Lampa.Storage.get("kion_remove")
              }, {
                id: "ivi",
                order: parseInt(Lampa.Storage.get("number_ivi"), 10) || 28,
                active: !Lampa.Storage.get("ivi_remove")
              }, {
                id: "okko",
                order: parseInt(Lampa.Storage.get('number_okko'), 10) || 29,
                active: !Lampa.Storage.get('okko_remove')
              }, {
                id: 'kinopoisk',
                order: parseInt(Lampa.Storage.get("number_kinopoisk"), 10) || 30,
                active: !Lampa.Storage.get("kinopoisk_remove")
              }, {
                id: "wink",
                order: parseInt(Lampa.Storage.get('number_wink'), 10) || 31,
                active: !Lampa.Storage.get("wink_remove")
              }, {
                id: "sts",
                order: parseInt(Lampa.Storage.get("number_sts"), 10) || 32,
                active: !Lampa.Storage.get('sts_remove')
              }, {
                id: "tnt",
                order: parseInt(Lampa.Storage.get("number_tnt"), 10) || 33,
                active: !Lampa.Storage.get("tnt_remove")
              }, {
                id: "collections_inter_tv",
                order: parseInt(Lampa.Storage.get("number_collections_inter_tv"), 10) || 34,
                active: !Lampa.Storage.get('collections_inter_tv_remove')
              }, {
                id: "collections_rus_tv",
                order: parseInt(Lampa.Storage.get("number_collections_rus_tv"), 10) || 35,
                active: !Lampa.Storage.get("collections_rus_tv_remove")
              }, {
                id: "collections_inter_movie",
                order: parseInt(Lampa.Storage.get("number_collections_inter_movie"), 10) || 36,
                active: !Lampa.Storage.get("collections_inter_movie_remove")
              }, {
                id: "collections_rus_movie",
                order: parseInt(Lampa.Storage.get("number_collections_rus_movie"), 10) || 37,
                active: !Lampa.Storage.get("collections_rus_movie_remove")
              }],
              usedIds = [];

            function shuffle(array) {
              for (var i = array.length - 1; i > 0; i--) {
                var randomIndex = Math.floor(Math.random() * (i + 1)),
                  temp = array[i];
                array[i] = array[randomIndex], array[randomIndex] = temp;
              }
            }
            var yearRanges = [{
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
              }],
              tvYearRange = yearRanges[Math.floor(Math.random() * yearRanges.length)],
              tvDateFrom = tvYearRange.start + "-01-01",
              tvDateTo = tvYearRange.end + "-12-31",
              movieYearRange = yearRanges[Math.floor(Math.random() * yearRanges.length)],
              movieDateFrom = movieYearRange.start + "-01-01",
              movieDateTo = movieYearRange.end + "-12-31",
              sortOptionsTv = ["vote_count.desc", 'popularity.desc', "revenue.desc"],
              sortIndexTv = Math.floor(Math.random() * sortOptionsTv.length),
              sortTv = sortOptionsTv[sortIndexTv],
              sortOptionsMovie = ["vote_count.desc", "popularity.desc", "revenue.desc"],
              sortIndexMovie = Math.floor(Math.random() * sortOptionsMovie.length),
              sortMovie = sortOptionsMovie[sortIndexMovie],
              today = new Date().toISOString().substr(0, 10),
              lastMonthDate = new Date(today);
            lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
            var lastMonth = lastMonthDate.toISOString().substr(0, 10);

            function loadHome(onComplete5, onError) {
              var
                loaders = {
                  now_watch: function(onNowWatch) {
                    self3.get("movie/now_playing", params, function(nowWatchLine) {
                      nowWatchLine.title = Lampa.Lang.translate("title_now_watch"), Lampa.Storage.get("now_watch_display") == '2' && (nowWatchLine.collection = true, nowWatchLine.line_type = "collection"), Lampa.Storage.get('now_watch_display') == '3' && (nowWatchLine.small = true, nowWatchLine.wide = true, nowWatchLine.results.forEach(function(item37) {
                        item37.promo = item37.overview, item37.promo_title = item37.title || item37.name;
                      })), Lampa.Storage.get("now_watch_display") == '4' && (nowWatchLine.line_type = "top"), Lampa.Storage.get('now_watch_shuffle') == true && shuffle(nowWatchLine.results), onNowWatch(nowWatchLine);
                    }, onNowWatch);
                  },
                  upcoming_episodes: function(onUpcomingEpisodes) {
                    onUpcomingEpisodes({
                      source: "tmdb",
                      results: Lampa.TimeTable.lately().slice(0, 20),
                      title: Lampa.Lang.translate("title_upcoming_episodes"),
                      nomore: true,
                      cardClass: function createCard(data, options) {
                        return new EpisodeCard(data, options);
                      }
                    });
                  },
                  trend_day: function(onTrendDay) {
                    self3.get("trending/all/day", params, function(trendDayLine) {
                      trendDayLine.title = Lampa.Lang.translate('title_trend_day'), Lampa.Storage.get("trend_day_display") == '2' && (trendDayLine.collection = true, trendDayLine.line_type = 'collection'), Lampa.Storage.get("trend_day_display") == '3' && (trendDayLine.small = true, trendDayLine.wide = true, trendDayLine.results.forEach(function(item33) {
                        item33.promo = item33.overview, item33.promo_title = item33.title || item33.name;
                      })), Lampa.Storage.get("trend_day_display") == '4' && (trendDayLine.line_type = 'top'), Lampa.Storage.get("trend_day_shuffle") == true && shuffle(trendDayLine.results), onTrendDay(trendDayLine);
                    }, onTrendDay);
                  },
                  trend_day_tv: function(onTrendDayTv) {
                    self3.get("trending/tv/day", params, function(trendDayTvLine) {
                      trendDayTvLine.title = Lampa.Lang.translate("Сегодня в тренде (сериалы)"), Lampa.Storage.get("trend_day_tv_display") == '2' && (trendDayTvLine.collection = true, trendDayTvLine.line_type = "collection"), Lampa.Storage.get("trend_day_tv_display") == '3' && (trendDayTvLine.small = true, trendDayTvLine.wide = true, trendDayTvLine.results.forEach(function(item69) {
                        item69.promo = item69.overview, item69.promo_title = item69.title || item69.name;
                      })), Lampa.Storage.get("trend_day_tv_display") == '4' && (trendDayTvLine.line_type = "top"), Lampa.Storage.get('trend_day_tv_shuffle') == true && shuffle(trendDayTvLine.results), onTrendDayTv(trendDayTvLine);
                    }, onTrendDayTv);
                  },
                  trend_day_film: function(onTrendDayFilm) {
                    self3.get("trending/movie/day", params, function(trendDayFilmLine) {
                      trendDayFilmLine.title = Lampa.Lang.translate("Сегодня в тренде (фильмы)"), Lampa.Storage.get("trend_day_film_display") == '2' && (trendDayFilmLine.collection = true, trendDayFilmLine.line_type = "collection"), Lampa.Storage.get("trend_day_film_display") == '3' && (trendDayFilmLine.small = true, trendDayFilmLine.wide = true, trendDayFilmLine.results.forEach(function(item13) {
                        item13.promo = item13.overview, item13.promo_title = item13.title || item13.name;
                      })), Lampa.Storage.get("trend_day_film_display") == '4' && (trendDayFilmLine.line_type = "top"), Lampa.Storage.get("trend_day_film_shuffle") == true && shuffle(trendDayFilmLine.results), onTrendDayFilm(trendDayFilmLine);
                    }, onTrendDayFilm);
                  },
                  trend_week: function(onTrendWeek) {
                    self3.get("trending/all/week", params, function(trendWeekLine) {
                      trendWeekLine.title = Lampa.Lang.translate("title_trend_week"), Lampa.Storage.get("trend_week_display") == '2' && (trendWeekLine.collection = true, trendWeekLine.line_type = 'collection'), Lampa.Storage.get('trend_week_display') == '3' && (trendWeekLine.small = true, trendWeekLine.wide = true, trendWeekLine.results.forEach(function(item29) {
                        item29.promo = item29.overview, item29.promo_title = item29.title || item29.name;
                      })), Lampa.Storage.get("trend_week_display") == '4' && (trendWeekLine.line_type = "top"), Lampa.Storage.get("trend_week_shuffle") == true && shuffle(trendWeekLine.results), onTrendWeek(trendWeekLine);
                    }, onTrendWeek);
                  },
                  trend_week_tv: function(onTrendWeekTv) {
                    self3.get("trending/tv/week", params, function(trendWeekTvLine) {
                      trendWeekTvLine.title = Lampa.Lang.translate("В тренде за неделю (сериалы)"), Lampa.Storage.get('trend_week_tv_display') == '2' && (trendWeekTvLine.collection = true, trendWeekTvLine.line_type = "collection"), Lampa.Storage.get('trend_week_tv_display') == '3' && (trendWeekTvLine.small = true, trendWeekTvLine.wide = true, trendWeekTvLine.results.forEach(function(item39) {
                        item39.promo = item39.overview, item39.promo_title = item39.title || item39.name;
                      })), Lampa.Storage.get("trend_week_tv_display") == '4' && (trendWeekTvLine.line_type = 'top'), Lampa.Storage.get("trend_week_tv_shuffle") == true && shuffle(trendWeekTvLine.results), onTrendWeekTv(trendWeekTvLine);
                    }, onTrendWeekTv);
                  },
                  trend_week_film: function(onTrendWeekFilm) {
                    self3.get("trending/movie/week", params, function(trendWeekFilmLine) {
                      trendWeekFilmLine.title = Lampa.Lang.translate('В тренде за неделю (фильмы)'), Lampa.Storage.get('trend_week_film_display') == '2' && (trendWeekFilmLine.collection = true, trendWeekFilmLine.line_type = "collection"), Lampa.Storage.get('trend_week_film_display') == '3' && (trendWeekFilmLine.small = true, trendWeekFilmLine.wide = true, trendWeekFilmLine.results.forEach(function(item35) {
                        item35.promo = item35.overview, item35.promo_title = item35.title || item35.name;
                      })), Lampa.Storage.get("trend_week_film_display") == '4' && (trendWeekFilmLine.line_type = 'top'), Lampa.Storage.get("trend_week_film_shuffle") == true && shuffle(trendWeekFilmLine.results), onTrendWeekFilm(trendWeekFilmLine);
                    }, onTrendWeekFilm);
                  },
                  upcoming: function(onUpcoming) {
                    self3.get("movie/upcoming", params, function(upcomingLine) {
                      upcomingLine.title = Lampa.Lang.translate("title_upcoming"), Lampa.Storage.get("upcoming_display") == '2' && (upcomingLine.collection = true, upcomingLine.line_type = "collection"), Lampa.Storage.get('upcoming_display') == '3' && (upcomingLine.small = true, upcomingLine.wide = true, upcomingLine.results.forEach(function(item11) {
                        item11.promo = item11.overview, item11.promo_title = item11.title || item11.name;
                      })), Lampa.Storage.get("upcoming_display") == '4' && (upcomingLine.line_type = "top"), Lampa.Storage.get("upcoming_shuffle") == true && shuffle(upcomingLine.results), onUpcoming(upcomingLine);
                    }, onUpcoming);
                  },
                  popular_movie: function(onPopularMovie) {
                    self3.get("movie/popular", params, function(popularMovieLine) {
                      popularMovieLine.title = Lampa.Lang.translate("title_popular_movie"), Lampa.Storage.get("popular_movie_display") == '2' && (popularMovieLine.collection = true, popularMovieLine.line_type = "collection"), Lampa.Storage.get("popular_movie_display") == '3' && (popularMovieLine.small = true, popularMovieLine.wide = true, popularMovieLine.results.forEach(function(item63) {
                        item63.promo = item63.overview, item63.promo_title = item63.title || item63.name;
                      })), Lampa.Storage.get("popular_movie_display") == '4' && (popularMovieLine.line_type = 'top'), Lampa.Storage.get("popular_movie_shuffle") == true && shuffle(popularMovieLine.results), onPopularMovie(popularMovieLine);
                    }, onPopularMovie);
                  },
                  popular_tv: function(onPopularTv) {
                    self3.get('trending/tv/week', params, function(popularTvLine) {
                      popularTvLine.title = Lampa.Lang.translate('title_popular_tv'), Lampa.Storage.get("popular_tv_display") == '2' && (popularTvLine.collection = true, popularTvLine.line_type = 'collection'), Lampa.Storage.get("popular_tv_display") == '3' && (popularTvLine.small = true, popularTvLine.wide = true, popularTvLine.results.forEach(function(item3) {
                        item3.promo = item3.overview, item3.promo_title = item3.title || item3.name;
                      })), Lampa.Storage.get("popular_tv_display") == '4' && (popularTvLine.line_type = "top"), Lampa.Storage.get("popular_tv_shuffle") == true && shuffle(popularTvLine.results), onPopularTv(popularTvLine);
                    }, onPopularTv);
                  },
                  top_movie: function(onTopMovie) {
                    self3.get('movie/top_rated', params, function(topMovieLine) {
                      topMovieLine.title = Lampa.Lang.translate("title_top_movie"), Lampa.Storage.get("top_movie_display") == '2' && (topMovieLine.collection = true, topMovieLine.line_type = 'collection'), Lampa.Storage.get('top_movie_display') == '3' && (topMovieLine.small = true, topMovieLine.wide = true, topMovieLine.results.forEach(function(item9) {
                        item9.promo = item9.overview, item9.promo_title = item9.title || item9.name;
                      })), Lampa.Storage.get("top_movie_display") == '4' && (topMovieLine.line_type = 'top'), Lampa.Storage.get("top_movie_shuffle") == true && shuffle(topMovieLine.results), onTopMovie(topMovieLine);
                    }, onTopMovie);
                  },
                  top_tv: function(onTopTv) {
                    self3.get("tv/top_rated", params, function(topTvLine) {
                      topTvLine.title = Lampa.Lang.translate("title_top_tv"), Lampa.Storage.get("top_tv_display") == '2' && (topTvLine.collection = true, topTvLine.line_type = "collection"), Lampa.Storage.get("top_tv_display") == '3' && (topTvLine.small = true, topTvLine.wide = true, topTvLine.results.forEach(function(item) {
                        item.promo = item.overview, item.promo_title = item.title || item.name;
                      })), Lampa.Storage.get('top_tv_display') == '4' && (topTvLine.line_type = "top"), Lampa.Storage.get("top_tv_shuffle") == true && shuffle(topTvLine.results), onTopTv(topTvLine);
                    }, onTopTv);
                  },
                  netflix: function(onNetflix) {
                    self3.get("discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + today, params, function(netflixLine) {
                      netflixLine.title = Lampa.Lang.translate("Netflix"), Lampa.Storage.get("netflix_display") == '2' && (netflixLine.collection = true, netflixLine.line_type = "collection"), Lampa.Storage.get("netflix_display") == '3' && (netflixLine.small = true, netflixLine.wide = true, netflixLine.results.forEach(function(item65) {
                        item65.promo = item65.overview, item65.promo_title = item65.title || item65.name;
                      })), Lampa.Storage.get("netflix_display") == '4' && (netflixLine.line_type = "top"), Lampa.Storage.get("netflix_shuffle") == true && shuffle(netflixLine.results), onNetflix(netflixLine);
                    }, onNetflix);
                  },
                  apple_tv: function(onAppleTv) {
                    self3.get("discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + today, params, function(appleTvLine) {
                      appleTvLine.title = Lampa.Lang.translate("Apple TV+"), Lampa.Storage.get("apple_tv_display") == '2' && (appleTvLine.collection = true, appleTvLine.line_type = "collection"), Lampa.Storage.get("apple_tv_display") == '3' && (appleTvLine.small = true, appleTvLine.wide = true, appleTvLine.results.forEach(function(item45) {
                        item45.promo = item45.overview, item45.promo_title = item45.title || item45.name;
                      })), Lampa.Storage.get("apple_tv_display") == '4' && (appleTvLine.line_type = "top"), Lampa.Storage.get("apple_tv_shuffle") == true && shuffle(appleTvLine.results), onAppleTv(appleTvLine);
                    }, onAppleTv);
                  },
                  prime_video: function(onPrimeVideo) {
                    self3.get("discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + today, params, function(primeVideoLine) {
                      primeVideoLine.title = Lampa.Lang.translate("Prime Video"), Lampa.Storage.get('prime_video_display') == '2' && (primeVideoLine.collection = true, primeVideoLine.line_type = "collection"), Lampa.Storage.get("prime_video_display") == '3' && (primeVideoLine.small = true, primeVideoLine.wide = true, primeVideoLine.results.forEach(function(item71) {
                        item71.promo = item71.overview, item71.promo_title = item71.title || item71.name;
                      })), Lampa.Storage.get("prime_video_display") == '4' && (primeVideoLine.line_type = "top"), Lampa.Storage.get("prime_video_shuffle") == true && shuffle(primeVideoLine.results), onPrimeVideo(primeVideoLine);
                    }, onPrimeVideo);
                  },
                  mgm: function(onMgm) {
                    self3.get("discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + today, params, function(mgmLine) {
                      mgmLine.title = Lampa.Lang.translate("MGM+"), Lampa.Storage.get("mgm_display") == '2' && (mgmLine.collection = true, mgmLine.line_type = 'collection'), Lampa.Storage.get("mgm_display") == '3' && (mgmLine.small = true, mgmLine.wide = true, mgmLine.results.forEach(function(item41) {
                        item41.promo = item41.overview, item41.promo_title = item41.title || item41.name;
                      })), Lampa.Storage.get('mgm_display') == '4' && (mgmLine.line_type = "top"), Lampa.Storage.get("mgm_shuffle") == true && shuffle(mgmLine.results), onMgm(mgmLine);
                    }, onMgm);
                  },
                  hbo: function(onHbo) {
                    self3.get('discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(hboLine) {
                      hboLine.title = Lampa.Lang.translate('HBO'), Lampa.Storage.get("hbo_display") == '2' && (hboLine.collection = true, hboLine.line_type = 'collection'), Lampa.Storage.get("hbo_display") == '3' && (hboLine.small = true, hboLine.wide = true, hboLine.results.forEach(function(item21) {
                        item21.promo = item21.overview, item21.promo_title = item21.title || item21.name;
                      })), Lampa.Storage.get("hbo_display") == '4' && (hboLine.line_type = "top"), Lampa.Storage.get("hbo_shuffle") == true && shuffle(hboLine.results), onHbo(hboLine);
                    }, onHbo);
                  },
                  dorams: function(onDorams) {
                    self3.get('discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(doramsLine) {
                      doramsLine.title = Lampa.Lang.translate("Дорамы"), Lampa.Storage.get('dorams_display') == '2' && (doramsLine.collection = true, doramsLine.line_type = "collection"), Lampa.Storage.get("dorams_display") == '3' && (doramsLine.small = true, doramsLine.wide = true, doramsLine.results.forEach(function(item15) {
                        item15.promo = item15.overview, item15.promo_title = item15.title || item15.name;
                      })), Lampa.Storage.get("dorams_display") == '4' && (doramsLine.line_type = "top"), Lampa.Storage.get('dorams_shuffle') == true && shuffle(doramsLine.results), onDorams(doramsLine);
                    }, onDorams);
                  },
                  tur_serials: function(onTurSerials) {
                    self3.get("discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=" + today, params, function(turSerialsLine) {
                      turSerialsLine.title = Lampa.Lang.translate("Турецкие сериалы"), Lampa.Storage.get('tur_serials_display') == '2' && (turSerialsLine.collection = true, turSerialsLine.line_type = "collection"), Lampa.Storage.get("tur_serials_display") == '3' && (turSerialsLine.small = true, turSerialsLine.wide = true, turSerialsLine.results.forEach(function(item47) {
                        item47.promo = item47.overview, item47.promo_title = item47.title || item47.name;
                      })), Lampa.Storage.get("tur_serials_display") == '4' && (turSerialsLine.line_type = 'top'), Lampa.Storage.get('tur_serials_shuffle') == true && shuffle(turSerialsLine.results), onTurSerials(turSerialsLine);
                    }, onTurSerials);
                  },
                  ind_films: function(onIndFilms) {
                    self3.get('discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=' + today, params, function(indFilmsLine) {
                      indFilmsLine.title = Lampa.Lang.translate("Индийские фильмы"), Lampa.Storage.get("ind_films_display") == '2' && (indFilmsLine.collection = true, indFilmsLine.line_type = "collection"), Lampa.Storage.get("ind_films_display") == '3' && (indFilmsLine.small = true, indFilmsLine.wide = true, indFilmsLine.results.forEach(function(item31) {
                        item31.promo = item31.overview, item31.promo_title = item31.title || item31.name;
                      })), Lampa.Storage.get("ind_films_display") == '4' && (indFilmsLine.line_type = "top"), Lampa.Storage.get('ind_films_shuffle') == true && shuffle(indFilmsLine.results), onIndFilms(indFilmsLine);
                    }, onIndFilms);
                  },
                  rus_movie: function(onRusMovie) {
                    self3.get("discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=" + new Date().toISOString().substr(0, 10), params, function(rusMovieLine) {
                      rusMovieLine.title = Lampa.Lang.translate('Русские фильмы'), Lampa.Storage.get("rus_movie_display") == '2' && (rusMovieLine.collection = true, rusMovieLine.line_type = "collection"), Lampa.Storage.get("rus_movie_display") == '3' && (rusMovieLine.small = true, rusMovieLine.wide = true, rusMovieLine.results.forEach(function(item55) {
                        item55.promo = item55.overview, item55.promo_title = item55.title || item55.name;
                      })), Lampa.Storage.get("rus_movie_display") == '4' && (rusMovieLine.line_type = "top"), Lampa.Storage.get("rus_movi_shuffle") == true && shuffle(rusMovieLine.results), onRusMovie(rusMovieLine);
                    }, onRusMovie);
                  },
                  rus_tv: function(onRusTv) {
                    self3.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(rusTvLine) {
                      rusTvLine.title = Lampa.Lang.translate("Русские сериалы"), Lampa.Storage.get("rus_tv_display") == '2' && (rusTvLine.collection = true, rusTvLine.line_type = "collection"), Lampa.Storage.get("rus_tv_display") == '3' && (rusTvLine.small = true, rusTvLine.wide = true, rusTvLine.results.forEach(function(item61) {
                        item61.promo = item61.overview, item61.promo_title = item61.title || item61.name;
                      })), Lampa.Storage.get('rus_tv_display') == '4' && (rusTvLine.line_type = "top"), Lampa.Storage.get("rus_tv_shuffle") == true && shuffle(rusTvLine.results), onRusTv(rusTvLine);
                    }, onRusTv);
                  },
                  rus_mult: function(onRusMult) {
                    self3.get("discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=" + new Date().toISOString().substr(0, 10), params, function(rusMultLine) {
                      rusMultLine.title = Lampa.Lang.translate("Русские мультфильмы"), Lampa.Storage.get("rus_mult_display") == '2' && (rusMultLine.collection = true, rusMultLine.line_type = "collection"), Lampa.Storage.get("rus_mult_display") == '3' && (rusMultLine.small = true, rusMultLine.wide = true, rusMultLine.results.forEach(function(item59) {
                        item59.promo = item59.overview, item59.promo_title = item59.title || item59.name;
                      })), Lampa.Storage.get("rus_mult_display") == '4' && (rusMultLine.line_type = "top"), Lampa.Storage.get("rus_mult_shuffle") == true && shuffle(rusMultLine.results), onRusMult(rusMultLine);
                    }, onRusMult);
                  },
                  start: function(onStart) {
                    self3.get("discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(startLine) {
                      startLine.title = Lampa.Lang.translate("Start"), Lampa.Storage.get("start_display") == '2' && (startLine.collection = true, startLine.line_type = "collection"), Lampa.Storage.get("start_display") == '3' && (startLine.small = true, startLine.wide = true, startLine.results.forEach(function(item53) {
                        item53.promo = item53.overview, item53.promo_title = item53.title || item53.name;
                      })), Lampa.Storage.get('start_display') == '4' && (startLine.line_type = "top"), Lampa.Storage.get('start_shuffle') == true && shuffle(startLine.results), onStart(startLine);
                    }, onStart);
                  },
                  premier: function(onPremier) {
                    self3.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(premierLine) {
                      premierLine.title = Lampa.Lang.translate("Premier"), Lampa.Storage.get("premier_display") == '2' && (premierLine.collection = true, premierLine.line_type = "collection"), Lampa.Storage.get('premier_display') == '3' && (premierLine.small = true, premierLine.wide = true, premierLine.results.forEach(function(item5) {
                        item5.promo = item5.overview, item5.promo_title = item5.title || item5.name;
                      })), Lampa.Storage.get("premier_display") == '4' && (premierLine.line_type = 'top'), Lampa.Storage.get("premier_shuffle") == true && shuffle(premierLine.results), onPremier(premierLine);
                    }, onPremier);
                  },
                  kion: function(onKion) {
                    self3.get("discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(kionLine) {
                      kionLine.title = Lampa.Lang.translate("KION"), Lampa.Storage.get("kion_display") == '2' && (kionLine.collection = true, kionLine.line_type = "collection"), Lampa.Storage.get('kion_display') == '3' && (kionLine.small = true, kionLine.wide = true, kionLine.results.forEach(function(item51) {
                        item51.promo = item51.overview, item51.promo_title = item51.title || item51.name;
                      })), Lampa.Storage.get('kion_display') == '4' && (kionLine.line_type = "top"), Lampa.Storage.get('kion_shuffle') == true && shuffle(kionLine.results), onKion(kionLine);
                    }, onKion);
                  },
                  ivi: function(onIvi) {
                    self3.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(iviLine) {
                      iviLine.title = Lampa.Lang.translate("IVI"), Lampa.Storage.get("ivi_display") == '2' && (iviLine.collection = true, iviLine.line_type = 'collection'), Lampa.Storage.get('ivi_display') == '3' && (iviLine.small = true, iviLine.wide = true, iviLine.results.forEach(function(item7) {
                        item7.promo = item7.overview, item7.promo_title = item7.title || item7.name;
                      })), Lampa.Storage.get("ivi_display") == '4' && (iviLine.line_type = "top"), Lampa.Storage.get("ivi_shuffle") == true && shuffle(iviLine.results), onIvi(iviLine);
                    }, onIvi);
                  },
                  okko: function(onOkko) {
                    self3.get("discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(okkoLine) {
                      okkoLine.title = Lampa.Lang.translate("OKKO"), Lampa.Storage.get("okko_display") == '2' && (okkoLine.collection = true, okkoLine.line_type = "collection"), Lampa.Storage.get("okko_display") == '3' && (okkoLine.small = true, okkoLine.wide = true, okkoLine.results.forEach(function(item23) {
                        item23.promo = item23.overview, item23.promo_title = item23.title || item23.name;
                      })), Lampa.Storage.get("okko_display") == '4' && (okkoLine.line_type = "top"), Lampa.Storage.get('okko_shuffle') == true && shuffle(okkoLine.results), onOkko(okkoLine);
                    }, onOkko);
                  },
                  kinopoisk: function(onKinopoisk) {
                    self3.get("discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(kinopoiskLine) {
                      kinopoiskLine.title = Lampa.Lang.translate('КиноПоиск'), Lampa.Storage.get("kinopoisk_display") == '2' && (kinopoiskLine.collection = true, kinopoiskLine.line_type = "collection"), Lampa.Storage.get("kinopoisk_display") == '3' && (kinopoiskLine.small = true, kinopoiskLine.wide = true, kinopoiskLine.results.forEach(function(item57) {
                        item57.promo = item57.overview, item57.promo_title = item57.title || item57.name;
                      })), Lampa.Storage.get("kinopoisk_display") == '4' && (kinopoiskLine.line_type = "top"), Lampa.Storage.get("kinopois_shuffle") == true && shuffle(kinopoiskLine.results), onKinopoisk(kinopoiskLine);
                    }, onKinopoisk);
                  },
                  wink: function(onWink) {
                    self3.get("discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(winkLine) {
                      winkLine.title = Lampa.Lang.translate('Wink'), Lampa.Storage.get("wink_display") == '2' && (winkLine.collection = true, winkLine.line_type = "collection"), Lampa.Storage.get('wink_display') == '3' && (winkLine.small = true, winkLine.wide = true, winkLine.results.forEach(function(item49) {
                        item49.promo = item49.overview, item49.promo_title = item49.title || item49.name;
                      })), Lampa.Storage.get("wink_display") == '4' && (winkLine.line_type = 'top'), Lampa.Storage.get("wink_shuffle") == true && shuffle(winkLine.results), onWink(winkLine);
                    }, onWink);
                  },
                  sts: function(onSts) {
                    self3.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function(stsLine) {
                      stsLine.title = Lampa.Lang.translate("СТС"), Lampa.Storage.get("sts_display") == '2' && (stsLine.collection = true, stsLine.line_type = "collection"), Lampa.Storage.get('sts_display') == '3' && (stsLine.small = true, stsLine.wide = true, stsLine.results.forEach(function(item67) {
                        item67.promo = item67.overview, item67.promo_title = item67.title || item67.name;
                      })), Lampa.Storage.get('sts_display') == '4' && (stsLine.line_type = "top"), Lampa.Storage.get("sts_shuffle") == true && shuffle(stsLine.results), onSts(stsLine);
                    }, onSts);
                  },
                  tnt: function(onTnt) {
                    self3.get("discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=" + today, params, function(tntLine) {
                      tntLine.title = Lampa.Lang.translate("ТНТ"), Lampa.Storage.get("tnt_display") == '2' && (tntLine.collection = true, tntLine.line_type = "collection"), Lampa.Storage.get("tnt_display") == '3' && (tntLine.small = true, tntLine.wide = true, tntLine.results.forEach(function(item43) {
                        item43.promo = item43.overview, item43.promo_title = item43.title || item43.name;
                      })), Lampa.Storage.get("tnt_display") == '4' && (tntLine.line_type = 'top'), Lampa.Storage.get("tnt_shuffle") == true && shuffle(tntLine.results), onTnt(tntLine);
                    }, onTnt);
                  },
                  collections_inter_tv: function(onCollectionsInterTv) {
                    self3.get('discover/tv?with_networks=213|2552|1024|6219|49&sort_by=' + sortTv + "&first_air_date.gte=" + tvDateFrom + "&first_air_date.lte=" + tvDateTo, params, function(collectionsInterTvLine) {
                      collectionsInterTvLine.title = Lampa.Lang.translate('Подборки зарубежных сериалов'), Lampa.Storage.get("collections_inter_tv_display") == '2' && (collectionsInterTvLine.collection = true, collectionsInterTvLine.line_type = "collection"), Lampa.Storage.get("collections_inter_tv_display") == '3' && (collectionsInterTvLine.small = true, collectionsInterTvLine.wide = true, collectionsInterTvLine.results.forEach(function(item25) {
                        item25.promo = item25.overview, item25.promo_title = item25.title || item25.name;
                      })), Lampa.Storage.get("collections_inter_tv_display") == '4' && (collectionsInterTvLine.line_type = "top"), Lampa.Storage.get('collections_inter_tv_shuffle') == true && shuffle(collectionsInterTvLine.results), onCollectionsInterTv(collectionsInterTvLine);
                    }, onCollectionsInterTv);
                  },
                  collections_rus_tv: function(onCollectionsRusTv) {
                    self3.get('discover/tv?with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + sortTv + "&air_date.lte=" + tvDateTo + "&first_air_date.gte=" + tvDateFrom, params, function(collectionsRusTvLine) {
                      collectionsRusTvLine.title = Lampa.Lang.translate("Подборки русских сериалов"), Lampa.Storage.get("collections_rus_tv_display") == '2' && (collectionsRusTvLine.collection = true, collectionsRusTvLine.line_type = "collection"), Lampa.Storage.get('collections_rus_tv_display') == '3' && (collectionsRusTvLine.small = true, collectionsRusTvLine.wide = true, collectionsRusTvLine.results.forEach(function(item19) {
                        item19.promo = item19.overview, item19.promo_title = item19.title || item19.name;
                      })), Lampa.Storage.get("collections_rus_tv_display") == '4' && (collectionsRusTvLine.line_type = "top"), Lampa.Storage.get("collections_rus_tv_shuffle") == true && shuffle(collectionsRusTvLine.results), onCollectionsRusTv(collectionsRusTvLine);
                    }, onCollectionsRusTv);
                  },
                  collections_inter_movie: function(onCollectionsInterMovie) {
                    self3.get("discover/movie?vote_average.gte=5&vote_average.lte=9.5&sort_by=" + sortMovie + "&primary_release_date.gte=" + movieDateFrom + "&primary_release_date.lte=" + movieDateTo, params, function(collectionsInterMovieLine) {
                      collectionsInterMovieLine.title = Lampa.Lang.translate("Подборки зарубежных фильмов"), Lampa.Storage.get("collections_inter_movie_display") == '2' && (collectionsInterMovieLine.collection = true, collectionsInterMovieLine.line_type = 'collection'), Lampa.Storage.get('collections_inter_movie_display') == '3' && (collectionsInterMovieLine.small = true, collectionsInterMovieLine.wide = true, collectionsInterMovieLine.results.forEach(function(item17) {
                        item17.promo = item17.overview, item17.promo_title = item17.title || item17.name;
                      })), Lampa.Storage.get("collections_inter_movie_display") == '4' && (collectionsInterMovieLine.line_type = 'top'), Lampa.Storage.get('collections_inter_movie_shuffle') == true && shuffle(collectionsInterMovieLine.results), onCollectionsInterMovie(collectionsInterMovieLine);
                    }, onCollectionsInterMovie);
                  },
                  collections_rus_movie: function(onCollectionsRusMovie) {
                    self3.get('discover/movie?primary_release_date.gte=' + movieDateFrom + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + sortMovie + "&primary_release_date.lte=" + movieDateTo, params, function(collectionsRusMovieLine) {
                      collectionsRusMovieLine.title = Lampa.Lang.translate("Подборки русских фильмов"), Lampa.Storage.get("collections_rus_movie_display") == '2' && (collectionsRusMovieLine.collection = true, collectionsRusMovieLine.line_type = "collection"), Lampa.Storage.get('collections_rus_movie_display') == '3' && (collectionsRusMovieLine.small = true, collectionsRusMovieLine.wide = true, collectionsRusMovieLine.results.forEach(function(item27) {
                        item27.promo = item27.overview, item27.promo_title = item27.title || item27.name;
                      })), Lampa.Storage.get('collections_rus_movie_display') == '4' && (collectionsRusMovieLine.line_type = "top"), Lampa.Storage.get("collections_rus_movie_shuffle") == true && shuffle(collectionsRusMovieLine.results), onCollectionsRusMovie(collectionsRusMovieLine);
                    }, onCollectionsRusMovie);
                  }
                },
                activeCategories = categoryList.filter(function(category) {
                  return category.active;
                }).sort(function(a2, b) {
                  return a2.order - b.order;
                });
              if (activeCategories.length === 0) return onComplete5();
              var tasks = [];
              activeCategories.forEach(function(category3) {
                !usedIds.includes(category3.id) && loaders[category3.id] && (tasks.push(loaders[category3.id]), usedIds.push(category3.id));
              }), Lampa.Storage.get("genres_cat") == false && baseSource.genres.movie.forEach(function(genre) {
                if (!usedIds.includes(genre.id)) {
                  var loadGenre = function(onGenre) {
                    self3.get("discover/movie?with_genres=" + genre.id, params, function(genreLine) {
                      genreLine.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, '')), shuffle(genreLine.results), onGenre(genreLine);
                    }, onGenre);
                  };
                  tasks.push(loadGenre), usedIds.push(genre.id);
                }
              }), tasks.length > 0 ? Lampa.Api.partNext(tasks, partSize, onComplete5, onError) : console.log("Нет доступных категорий для загрузки.");
            }

            function load(onComplete3, onError3) {
              loadHome(onComplete3, onError3);
            }
            return load(onComplete, onError5), load;
          };
        },
        personalSource = Object.assign({}, Lampa.Api.sources.tmdb, new PersonalSource(Lampa.Api.sources.tmdb));
      Lampa.Api.sources.personal = personalSource, Object.defineProperty(Lampa.Api.sources, "personal", {
        get: function getSource() {
          return personalSource;
        }
      }), Lampa.Params.select("source", Object.assign({}, Lampa.Params.values.source, {
        personal: 'Personal'
      }), "tmdb");
      if (Lampa.Storage.get("source") == "personal") var sourceValue = Lampa.Storage.get("source"),
        interval = setInterval(function() {
          var
            activity = Lampa.Activity.active();
          activity && (clearInterval(interval), Lampa.Activity.replace({
            source: sourceValue,
            title: Lampa.Lang.translate("title_main") + ' - ' + Lampa.Storage.field("source").toUpperCase()
          }));
        }, 300);
      Lampa.Settings.listener.follow('open', function(event3) {
        event3.name == "main" && (Lampa.Settings.main().render().find('[data-component="personal_source"]').length == 0 && Lampa.SettingsApi.addComponent({
          component: "personal_source",
          name: "Источник Personal"
        }), Lampa.Settings.main().update(), Lampa.Settings.main().render().find("[data-component=\"personal_source\"]").addClass('hide'));
      }), Lampa.SettingsApi.addParam({
        component: "more",
        param: {
          name: 'personal_source',
          type: "static",
          default: true
        },
        field: {
          name: 'Источник Personal',
          description: 'Настройки главного экрана'
        },
        onRender: function(element5) {
          setTimeout(function() {
            $(".settings-param > div:contains(\"Источник Personal\")").parent().insertAfter($("div[data-name=\"source\"]")), Lampa.Storage.field('source') !== 'personal' ? element5.hide() : element5.show();
          }, 20), element5.on('hover:enter', function() {
            Lampa.Settings.create("personal_source"), Lampa.Controller.enabled().controller.back = function() {
              Lampa.Settings.create('more');
            };
          });
        }
      }), Lampa.Storage.listener.follow('change', function(event) {
        event.name == "source" && setTimeout(function() {
          Lampa.Storage.get("source") !== "personal" ? $('.settings-param > div:contains("Источник Personal")').parent().hide() : $(".settings-param > div:contains(\"Источник Personal\")").parent().show();
        }, 50);
      });

      var personalRefreshTimer = 0,
        personalRefreshWatch = 0;

      function personalReplaceMain() {
        if (Lampa.Storage.get('source') != 'personal') return;
        var activity = Lampa.Activity.active();
        if (activity && activity.component == 'main') Lampa.Activity.replace({
          source: 'personal',
          title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase()
        });
      }

      function personalStartRefresh() {
        clearInterval(personalRefreshWatch);
        var tries = 0;
        personalRefreshWatch = setInterval(function() {
          tries++;
          if (Lampa.Storage.get('source') != 'personal' || tries > 1200) {
            clearInterval(personalRefreshWatch);
            personalRefreshWatch = 0;
            return;
          }
          var busy = $('body').hasClass('settings--open') || $('body').hasClass('selectbox--open');
          var activity = Lampa.Activity.active();
          if (!busy && activity && activity.component == 'main') {
            clearInterval(personalRefreshWatch);
            personalRefreshWatch = 0;
            personalReplaceMain();
          }
        }, 250);
      }

      function personalScheduleRefresh() {
        clearTimeout(personalRefreshTimer);
        personalRefreshTimer = setTimeout(personalStartRefresh, 300);
      }

      Lampa.Storage.listener.follow('change', function(event) {
        var name = event && event.name ? event.name : '';
        if (name == "source" || name == "genres_cat" || name.indexOf("number_") == 0 || /_(remove|display|shuffle)$/.test(name)) personalScheduleRefresh();
      });

      function addSetting(component2, title2, description2, removeDefault, displayDefault, orderDefault, shuffleDefault) {

        Lampa.Settings.listener.follow('open', function(event7) {
          event7.name === "main" && (Lampa.Settings.main().render().find('[data-component="' + component2 + '"]').length === 0 && Lampa.SettingsApi.addComponent({
            component: component2,
            name: title2
          }), Lampa.Settings.main().update(), Lampa.Settings.main().render().find("[data-component=\"" + component2 + '"]').addClass("hide"));
        }), Lampa.SettingsApi.addParam({
          component: "personal_source",
          param: {
            name: component2,
            type: "static",
            default: true
          },
          field: {
            name: title2,
            description: description2
          },
          onRender: function(element7) {
            element7.on("hover:enter", function(line) {
              var target = line.target,
                parent = target.parentElement,
                children = Array.from(parent.children),
                index = children.indexOf(target),
                nextIndex = index + 1;
              Lampa.Settings.create(component2), Lampa.Controller.enabled().controller.back = function() {
                Lampa.Settings.create("personal_source"), setTimeout(function() {
                  var element3 = document.querySelector("#app > div.settings.animate > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(" + nextIndex + ')');
                  if (element3) {
                    Lampa.Controller.focus(element3);
                    Lampa.Controller.toggle('settings_component');
                  }
                }, 5);
              };
            });
          }
        }), Lampa.SettingsApi.addParam({
          component: component2,
          param: {
            name: component2 + "_remove",
            type: "trigger",
            default: removeDefault
          },
          field: {
            name: "Убрать с главной страницы"
          },
          onChange: personalScheduleRefresh
        }), Lampa.SettingsApi.addParam({
          component: component2,
          param: {
            name: component2 + '_display',
            type: "select",
            values: {
              1: "Стандарт",
              2: "Широкие маленькие",
              3: "Широкие большие",
              4: "Top Line"
            },
            default: displayDefault
          },
          field: {
            name: "Вид отображения"
          },
          onChange: personalScheduleRefresh
        }), Lampa.SettingsApi.addParam({
          component: component2,
          param: {
            name: "number_" + component2,
            type: "select",
            values: {
              1: '1',
              2: '2',
              3: '3',
              4: '4',
              5: '5',
              6: '6',
              7: '7',
              8: '8',
              9: '9',
              10: '10',
              11: '11',
              12: '12',
              13: '13',
              14: '14',
              15: '15',
              16: '16',
              17: '17',
              18: '18',
              19: '19',
              20: '20',
              21: '21',
              22: '22',
              23: '23',
              24: '24',
              25: '25',
              26: '26',
              27: '27',
              28: '28',
              29: '29',
              30: '30',
              31: '31',
              32: '32',
              33: '33',
              34: '34',
              35: '35',
              36: '36',
              37: '37'
            },
            default: orderDefault
          },
          field: {
            name: "Порядок отображения"
          },
          onChange: personalScheduleRefresh
        }), Lampa.SettingsApi.addParam({
          component: component2,
          param: {
            name: component2 + "_shuffle",
            type: "trigger",
            default: shuffleDefault
          },
          field: {
            name: "Изменять порядок карточек на главной"
          },
          onChange: personalScheduleRefresh
        });
      }
      addSetting('now_watch', "Сейчас смотрят", "Нажми для настройки", false, '1', '1', false), addSetting("trend_day", 'Сегодня в тренде', 'Нажми для настройки', false, '1', '3', false), addSetting("trend_day_tv", "Сегодня в тренде (сериалы)", "Нажми для настройки", false, '1', '4', false), addSetting('trend_day_film', 'Сегодня в тренде (фильмы)', "Нажми для настройки", false, '1', '5', false), addSetting('trend_week', "В тренде за неделю", "Нажми для настройки", false, '1', '6', false), addSetting("trend_week_tv", "В тренде за неделю (сериалы)", "Нажми для настройки", false, '1', '7', false), addSetting("trend_week_film", "В тренде за неделю (фильмы)", "Нажми для настройки", false, '1', '8', false), addSetting('upcoming', 'Смотрите в кинозалах', "Нажми для настройки", false, '1', '9', false), addSetting("popular_movie", "Популярные фильмы", "Нажми для настройки", false, '1', '10', false), addSetting("popular_tv", "Популярные сериалы", 'Нажми для настройки', false, '1', '11', false), addSetting("top_movie", "Топ фильмы", "Нажми для настройки", false, '4', '12', false), addSetting("top_tv", "Топ сериалы", "Нажми для настройки", false, '4', '13', false), addSetting("netflix", "Netflix", 'Нажми для настройки', false, '1', '14', false), addSetting("apple_tv", "Apple TV+", "Нажми для настройки", false, '1', '15', false), addSetting("prime_video", "Prime Video", "Нажми для настройки", false, '1', '16', false), addSetting("mgm", "MGM+", "Нажми для настройки", false, '1', '17', false), addSetting("hbo", "HBO", "Нажми для настройки", false, '1', '18', false), addSetting("dorams", "Дорамы", 'Нажми для настройки', false, '1', '19', false), addSetting("tur_serials", 'Турецкие сериалы', "Нажми для настройки", false, '1', '20', false), addSetting("ind_films", "Индийские фильмы", "Нажми для настройки", false, '1', '21', false), addSetting("rus_movie", "Русские фильмы", "Нажми для настройки", false, '1', '22', false), addSetting("rus_tv", "Русские сериалы", "Нажми для настройки", false, '1', '23', false), addSetting("rus_mult", "Русские мультфильмы", 'Нажми для настройки', false, '1', '24', false), addSetting('start', "Start", "Нажми для настройки", false, '1', '25', false), addSetting("premier", "Premier", "Нажми для настройки", false, '1', '26', false), addSetting("kion", "KION", "Нажми для настройки", false, '1', '27', false), addSetting("ivi", "ИВИ", 'Нажми для настройки', false, '1', '28', false), addSetting("okko", "Okko", "Нажми для настройки", false, '1', '29', false), addSetting("kinopoisk", "КиноПоиск", "Нажми для настройки", false, '1', '30', false), addSetting('wink', 'Wink', "Нажми для настройки", false, '1', '31', false), addSetting('sts', 'СТС', "Нажми для настройки", false, '1', '32', false), addSetting("tnt", "ТНТ", "Нажми для настройки", false, '1', '33', false), addSetting('collections_inter_tv', 'Подборки зарубежных сериалов', "Нажми для настройки", false, '1', '34', false), addSetting('collections_rus_tv', "Подборки русских сериалов", 'Нажми для настройки', false, '1', '35', false), addSetting("collections_inter_movie", 'Подборки зарубежных фильмов', "Нажми для настройки", false, '1', '36', false), addSetting("collections_rus_movie", 'Подборки русских фильмов', "Нажми для настройки", false, '1', '37', false), Lampa.SettingsApi.addParam({
        component: "personal_source",
        param: {
          name: "upcoming_episodes_remove",
          type: "trigger",
          default: false
        },
        field: {
          name: "Выход ближайших эпизодов",
          description: "Убрать с главной страницы"
        }
      }), Lampa.SettingsApi.addParam({
        component: 'personal_source',
        param: {
          name: "genres_cat",
          type: "trigger",
          default: false
        },
        field: {
          name: "Подборки по жанрам",
          description: "Убрать с главной страницы"
        }
      });
      var bootInterval = setInterval(function() {
        if (typeof Lampa !== "undefined") {
          clearInterval(bootInterval);
          if (Lampa.Storage.get('personal_source_params') != "v2") initDefaults();
        }
      }, 200);

      function initDefaults() {
        Lampa.Storage.set("personal_source_params", "v2");
        ['trend_day_tv', 'trend_day_film', 'trend_week_tv', 'trend_week_film', 'netflix', 'apple_tv', 'prime_video', 'mgm', 'hbo', 'dorams', 'tur_serials', 'ind_films', 'rus_movie', 'rus_tv', 'rus_mult', 'start', 'premier', 'kion', 'ivi', 'okko', 'kinopoisk', 'wink', 'sts', 'tnt', 'collections_inter_tv', 'collections_rus_tv', 'collections_inter_movie', 'collections_rus_movie'].forEach(function(id) {
          Lampa.Storage.set(id + "_remove", false);
        });
        Lampa.Storage.set("genres_cat", false);
      }
    }
    if (window.appready) init();
    else Lampa.Listener.follow("app", function(event5) {
      event5.type == "ready" && init();
    });
  }());
})();
