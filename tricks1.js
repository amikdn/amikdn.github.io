(function () {
  'use strict';

  // =============================
  // Часть 1. Добавление кнопки "Кинопоиск" в меню Lampa
  // =============================
  Lampa.Platform.tv();

  var ITEM_TV_SELECTOR = '[data-action="tv"]';
  var ITEM_MOVE_TIMEOUT = 2000;

  // Функция для перемещения элемента
  var moveItemAfter = function (item, after) {
    return setTimeout(function () {
      $(item).insertAfter($(after));
    }, ITEM_MOVE_TIMEOUT);
  };

  // Функция для добавления кнопки в меню
  function addMenuButton(newItemAttr, newItemText, iconHTML, onEnterHandler) {
    var NEW_ITEM_ATTR = newItemAttr;
    var NEW_ITEM_SELECTOR = '[' + NEW_ITEM_ATTR + ']';
    var field = $(
      `<li class="menu__item selector" ${NEW_ITEM_ATTR}>
         <div class="menu__ico">${iconHTML}</div>
         <div class="menu__text">${newItemText}</div>
       </li>`
    );
    field.on('hover:enter', onEnterHandler);
    if (window.appready) {
      Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
      moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
    } else {
      Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
          Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
          moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
        }
      });
    }
  }

  // Новая SVG-иконка для кнопки "Кинопоиск"
  var iconKP = `
    <svg
  xmlns="http://www.w3.org/2000/svg"
  width="192"
  height="192"
  viewBox="0 0 192 192"
>
  <g fill="none" fill-rule="evenodd">
    <!-- Общая группа иконки -->
    <g fill="currentColor" fill-rule="nonzero">

      <!-- Кольцевая рамка (внешний прямоугольник радиус 16, внутренний радиус 2) -->
      <path
        fill-rule="evenodd"
        d="
          M20,4
          H172
          A16,16 0 0 1 188,20
          V172
          A16,16 0 0 1 172,188
          H20
          A16,16 0 0 1 4,172
          V20
          A16,16 0 0 1 20,4
          Z

          M20,18
          H172
          A2,2 0 0 1 174,20
          V172
          A2,2 0 0 1 172,174
          H20
          A2,2 0 0 1 18,172
          V20
          A2,2 0 0 1 20,18
          Z
        "
      />

      <!-- Буква «K», чуть смещена влево, чтобы по центру -->
      <g transform="translate(-10.63, 0)">
        <path
          d="
            M96.5 20
            L66.1 75.733
            V20
            H40.767
            v152
            H66.1
            v-55.733
            L96.5 172
            h35.467
            C116.767 153.422 95.2 133.578 80 115
            c28.711 16.889 63.789 35.044 92.5 51.933
            v-30.4
            C148.856 126.4 108.644 115.133 85 105
            c23.644 3.378 63.856 7.889 87.5 11.267
            v-30.4
            L85 90
            c27.022-11.822 60.478-22.711 87.5-34.533
            v-30.4
            C143.789 41.956 108.711 63.11 80 80
            L131.967 20
            z
          "
        />
      </g>

    </g>
  </g>
</svg>
  `;

  // Добавляем кнопку "Кинопоиск" в меню
  addMenuButton(
    'data-action="kp"',
    'Кинопоиск',
    iconKP,
    function () {
      Lampa.Activity.push({
        title: 'Кинопоиск',
        component: 'kp_categories',
        page: 1
      });
      console.log("Нажата кнопка Кинопоиск");
    }
  );

  // =============================
  // Часть 2. Новый плагин KP_API (объект KP_PLUGIN)
  // =============================
  if (!window.KP_PLUGIN) {
    window.KP_PLUGIN = (function () {
      'use strict';

      // Локальные переменные и константы
      var network = new Lampa.Reguest();
      var cache = {};
      var total_cnt = 0;
      var proxy_cnt = 0;
      var good_cnt = 0;
      var menu_list = [];
      var genres_map = {};     // ключ: название жанра, значение: id
      var countries_map = {};  // ключ: название страны, значение: id
      var CACHE_SIZE = 100;
      var CACHE_TIME = 1000 * 60 * 60;
      var SOURCE_NAME = 'KP';
      var SOURCE_TITLE = 'KP';

      // Функция запроса
      function get(method, oncomplite, onerror) {
        var use_proxy = total_cnt >= 10 && good_cnt > total_cnt / 2;
        if (!use_proxy) total_cnt++;
        var kp_prox = 'https://cors.kp556.workers.dev:8443/';
        var url = 'https://kinopoiskapiunofficial.tech/' + String(method);
        network.timeout(15000);
        network.silent((use_proxy ? kp_prox : '') + url, function (json) {
          oncomplite(json);
        }, function (a, c) {
          use_proxy = !use_proxy && (proxy_cnt < 10 || good_cnt > proxy_cnt / 2);
          if (use_proxy && (a.status == 429 || (a.status == 0 && a.statusText !== 'timeout'))) {
            proxy_cnt++;
            network.timeout(15000);
            network.silent(kp_prox + url, function (json) {
              good_cnt++;
              oncomplite(json);
            }, onerror, false, {
              headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' }
            });
          } else onerror(a, c);
        }, false, { headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' } });
      }

      function getComplite(method, oncomplite) {
        get(method, oncomplite, function () { oncomplite(null); });
      }

      function getCompliteIf(condition, method, oncomplite) {
        if (condition) getComplite(method, oncomplite);
        else setTimeout(function () { oncomplite(null); }, 10);
      }

      function getCache(key) {
        var res = cache[key];
        if (res) {
          var cache_timestamp = new Date().getTime() - CACHE_TIME;
          if (res.timestamp > cache_timestamp) return res.value;
          for (var ID in cache) {
            var node = cache[ID];
            if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
          }
        }
        return null;
      }

      function setCache(key, value) {
        var timestamp = new Date().getTime();
        var size = Object.keys(cache).length;
        if (size >= CACHE_SIZE) {
          var cache_timestamp = timestamp - CACHE_TIME;
          for (var ID in cache) {
            var node = cache[ID];
            if (!(node && node.timestamp > cache_timestamp)) delete cache[ID];
          }
          size = Object.keys(cache).length;
          if (size >= CACHE_SIZE) {
            var timestamps = [];
            for (var _ID in cache) {
              var _node = cache[_ID];
              timestamps.push(_node && _node.timestamp || 0);
            }
            timestamps.sort(function (a, b) { return a - b; });
            cache_timestamp = timestamps[Math.floor(timestamps.length / 2)];
            for (var _ID2 in cache) {
              var _node2 = cache[_ID2];
              if (!(_node2 && _node2.timestamp > cache_timestamp)) delete cache[_ID2];
            }
          }
        }
        cache[key] = { timestamp: timestamp, value: value };
      }

      function getFromCache(method, oncomplite, onerror) {
        var json = getCache(method);
        if (json) {
          setTimeout(function () { oncomplite(json, true); }, 10);
        } else get(method, oncomplite, onerror);
      }

      function clear() { network.clear(); }

      // Преобразование элемента из KP API в формат Lampa
      function convertElem(elem) {
        var type = (!elem.type || elem.type === 'FILM' || elem.type === 'VIDEO') ? 'movie' : 'tv';
        var kinopoisk_id = elem.kinopoiskId || elem.filmId || 0;
        var kp_rating = +elem.rating || +elem.ratingKinopoisk || 0;
        var title = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
        var original_title = elem.nameOriginal || elem.nameEn || elem.nameRu || '';
        var adult = false;
        var result = {
          source: SOURCE_NAME,
          type: type,
          adult: false,
          id: SOURCE_NAME + '_' + kinopoisk_id,
          title: title,
          original_title: original_title,
          overview: elem.description || elem.shortDescription || '',
          img: elem.posterUrlPreview || elem.posterUrl || '',
          background_image: elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
          genres: (elem.genres || []).map(function (e) {
            if (e.genre === 'для взрослых') { adult = true; }
            return { id: (e.genre && genres_map[e.genre]) || 0, name: e.genre, url: '' };
          }),
          production_companies: [],
          production_countries: (elem.countries || []).map(function (e) { return { name: e.country }; }),
          vote_average: kp_rating,
          vote_count: elem.ratingVoteCount || elem.ratingKinopoiskVoteCount || 0,
          kinopoisk_id: kinopoisk_id,
          kp_rating: kp_rating,
          imdb_id: elem.imdbId || '',
          imdb_rating: elem.ratingImdb || 0
        };
        result.adult = adult;
        var first_air_date = (elem.year && elem.year !== 'null') ? elem.year : '';
        var last_air_date = '';
        if (type === 'tv') {
          if (elem.startYear && elem.startYear !== 'null') first_air_date = elem.startYear;
          if (elem.endYear && elem.endYear !== 'null') last_air_date = elem.endYear;
        } else {
          result.release_date = first_air_date;
        }
        if (elem.distributions_obj) {
          var distributions = elem.distributions_obj.items || [];
          var year_timestamp = Date.parse(first_air_date);
          var min = null;
          distributions.forEach(function (d) {
            if (d.date && (d.type === 'WORLD_PREMIER' || d.type === 'ALL')) {
              var timestamp = Date.parse(d.date);
              if (!isNaN(timestamp) && (min == null || timestamp < min) &&
                  (isNaN(year_timestamp) || timestamp >= year_timestamp)) {
                min = timestamp;
                first_air_date = d.date;
              }
            }
          });
        }
        if (type === 'tv') {
          result.name = title;
          result.original_name = original_title;
          result.first_air_date = first_air_date;
          if (last_air_date) result.last_air_date = last_air_date;
        } else {
          result.release_date = first_air_date;
        }
        if (elem.seasons_obj) {
          var _seasons = elem.seasons_obj.items || [];
          result.number_of_seasons = elem.seasons_obj.total || _seasons.length || 1;
          result.seasons = _seasons.map(convertSeason);
          var number_of_episodes = 0;
          result.seasons.forEach(function (s) { number_of_episodes += s.episode_count; });
          result.number_of_episodes = number_of_episodes;
        }
        if (elem.staff_obj) {
          var cast = [];
          var crew = [];
          elem.staff_obj.forEach(function (s) {
            var person = convertPerson(s);
            if (s.professionKey === 'ACTOR') cast.push(person);
            else crew.push(person);
          });
          result.persons = { cast: cast, crew: crew };
        }
        if (elem.sequels_obj) {
          result.collection = { results: (elem.sequels_obj || []).map(convertElem) };
        }
        if (elem.similars_obj) {
          result.simular = { results: (elem.similars_obj.items || []).map(convertElem) };
        }
        return result;
      }

      function convertSeason(season) {
        var episodes = (season.episodes || []).map(function (e) {
          return {
            season_number: e.seasonNumber,
            episode_number: e.episodeNumber,
            name: e.nameRu || e.nameEn || ('S' + e.seasonNumber + ' / ' + Lampa.Lang.translate('torrent_serial_episode') + ' ' + e.episodeNumber),
            overview: e.synopsis || '',
            air_date: e.releaseDate
          };
        });
        return {
          season_number: season.number,
          episode_count: episodes.length,
          episodes: episodes,
          name: Lampa.Lang.translate('torrent_serial_season') + ' ' + season.number,
          overview: ''
        };
      }

      function convertPerson(person) {
        return {
          id: person.staffId,
          name: person.nameRu || person.nameEn || '',
          url: '',
          img: person.posterUrl || '',
          character: person.description || '',
          job: Lampa.Utils.capitalizeFirstLetter((person.professionKey || '').toLowerCase())
        };
      }

      function cleanTitle(str) {
        return str.replace(/[\s.,:;’'`!?]+/g, ' ').trim();
      }

      function kpCleanTitle(str) {
        return cleanTitle(str)
          .replace(/^[ \/\\]+/, '')
          .replace(/[ \/\\]+$/, '')
          .replace(/\+( *[+\/\\])+/g, '+')
          .replace(/([+\/\\] *)+\+/g, '+')
          .replace(/( *[\/\\]+ *)+/g, '+');
      }

      function normalizeTitle(str) {
        return cleanTitle(str.toLowerCase()
          .replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-')
          .replace(/ё/g, 'е'));
      }

      function containsTitle(str, title) {
        return (typeof str === 'string' && typeof title === 'string' &&
                normalizeTitle(str).indexOf(normalizeTitle(title)) !== -1);
      }

      function getList(method, params = {}, oncomplite, onerror) {
        var url = method;
        if (params.query) {
          var clean_title = params.query && kpCleanTitle(decodeURIComponent(params.query));
          if (!clean_title) {
            onerror();
            return;
          }
          url = Lampa.Utils.addUrlComponent(url, 'keyword=' + encodeURIComponent(clean_title));
        }
        var page = params.page || 1;
        url = Lampa.Utils.addUrlComponent(url, 'page=' + page);
        getFromCache(url, function (json, cached) {
          var items = [];
          if (json.items && json.items.length) items = json.items;
          else if (json.films && json.films.length) items = json.films;
          else if (json.releases && json.releases.length) items = json.releases;
          if (!cached && items.length) setCache(url, json);
          var results = items.map(convertElem).filter(function (elem) { return !elem.adult; });
          var total_pages = json.pagesCount || json.totalPages || 1;
          oncomplite({
            results: results,
            url: method,
            page: page,
            total_pages: total_pages,
            total_results: 0,
            more: total_pages > page
          });
        }, onerror);
      }

      function _getById(id, params, oncomplite, onerror) {
        var url = 'api/v2.2/films/' + id;
        var film = getCache(url);
        if (film) {
          setTimeout(function () { oncomplite(convertElem(film)); }, 10);
        } else {
          get(url, function (film) {
            if (film.kinopoiskId) {
              var type = (!film.type || film.type === 'FILM' || film.type === 'VIDEO') ? 'movie' : 'tv';
              getCompliteIf(type === 'tv', 'api/v2.2/films/' + id + '/seasons', function (seasons) {
                film.seasons_obj = seasons;
                getComplite('api/v2.2/films/' + id + '/distributions', function (distributions) {
                  film.distributions_obj = distributions;
                  getComplite('/api/v1/staff?filmId=' + id, function (staff) {
                    film.staff_obj = staff;
                    getComplite('api/v2.1/films/' + id + '/sequels_and_prequels', function (sequels) {
                      film.sequels_obj = sequels;
                      getComplite('api/v2.2/films/' + id + '/similars', function (similars) {
                        film.similars_obj = similars;
                        setCache(url, film);
                        oncomplite(convertElem(film));
                      });
                    });
                  });
                });
              });
            } else onerror();
          }, onerror);
        }
      }

      function getById(id, params = {}, oncomplite, onerror) {
        // Перед получением деталей убеждаемся, что фильтры загружены (через kpMenu)
        kpMenu({}, function () {
          _getById(id, params, oncomplite, onerror);
        });
      }

      function main(params = {}, oncomplite, onerror) {
        var parts_limit = 5;
        var parts_data = [
          function (call) {
            getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', params, function (json) {
              json.title = Lampa.Lang.translate('title_now_watch');
              call(json);
            }, call);
          },
          function (call) {
            getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS', params, function (json) {
              json.title = Lampa.Lang.translate('title_top_movie');
              call(json);
            }, call);
          },
          function (call) {
            getList('api/v2.2/films?order=NUM_VOTE&type=FILM', params, function (json) {
              json.title = 'Популярные фильмы';
              call(json);
            }, call);
          },
          function (call) {
            getList('api/v2.2/films?order=NUM_VOTE&type=TV_SERIES', params, function (json) {
              json.title = 'Популярные сериалы';
              call(json);
            }, call);
          },
          function (call) {
            getList('api/v2.2/films?order=NUM_VOTE&type=MINI_SERIES', params, function (json) {
              json.title = 'Популярные мини-сериалы';
              call(json);
            }, call);
          },
          function (call) {
            getList('api/v2.2/films?order=NUM_VOTE&type=TV_SHOW', params, function (json) {
              json.title = 'Популярные телешоу';
              call(json);
            }, call);
          }
        ];
        // Добавляем фиксированные русские категории (страна id = 34)
        menu_list.push({ id: '34', title: 'Популярные российские фильмы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM' });
        menu_list.push({ id: '34', title: 'Популярные российские сериалы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES' });
        menu_list.push({ id: '34', title: 'Популярные российские мини-сериалы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES' });

        function loadPart(partLoaded, partEmpty) {
          Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
        }
        kpMenu({}, function () {
          loadPart(oncomplite, onerror);
        });
        return loadPart;
      }

      function category(params = {}, oncomplite, onerror) {
        var show = ['movie', 'tv'].indexOf(params.url) > -1 && !params.genres;
        var books = show ? Lampa.Favorite.continues(params.url) : [];
        books.forEach(function (elem) {
          if (!elem.source) elem.source = 'tmdb';
        });
        books = books.filter(function (elem) {
          return [SOURCE_NAME, 'tmdb', 'cub'].indexOf(elem.source) !== -1;
        });
        var recomend = show ? Lampa.Arrays.shuffle(Lampa.Recomends.get(params.url)).slice(0, 19) : [];
        recomend.forEach(function (elem) {
          if (!elem.source) elem.source = 'tmdb';
        });
        recomend = recomend.filter(function (elem) {
          return [SOURCE_NAME, 'tmdb', 'cub'].indexOf(elem.source) !== -1;
        });
        var parts_limit = 5;
        var parts_data = [
          function (call) {
            call({ results: books, title: (params.url === 'tv') ? Lampa.Lang.translate('title_continue') : Lampa.Lang.translate('title_watched') });
          },
          function (call) {
            call({ results: recomend, title: Lampa.Lang.translate('title_recomend_watch') });
          }
        ];
        function loadPart(partLoaded, partEmpty) {
          Lampa.Api.partNext(parts_data, parts_limit, partLoaded, partEmpty);
        }
        kpMenu({}, function () {
          var priority_list = ['семейный', 'детский', 'короткометражка', 'мультфильм', 'аниме'];
          priority_list.forEach(function (g) {
            var id = genres_map[g];
            if (id) {
              parts_data.push(function (call) {
                getList('api/v2.2/films?order=NUM_VOTE&genres=' + id + '&type=' + (params.url === 'tv' ? 'TV_SERIES' : 'FILM'), params, function (json) {
                  json.title = Lampa.Utils.capitalizeFirstLetter(g);
                  call(json);
                }, call);
              });
            }
          });
          menu_list.forEach(function (g) {
            if (!g.hide && !g.separator && priority_list.indexOf(g.title) === -1) {
              parts_data.push(function (call) {
                getList('api/v2.2/films?order=NUM_VOTE&genres=' + g.id + '&type=' + (params.url === 'tv' ? 'TV_SERIES' : 'FILM'), params, function (json) {
                  json.title = Lampa.Utils.capitalizeFirstLetter(g.title);
                  call(json);
                }, call);
              });
            }
          });
          loadPart(oncomplite, onerror);
        });
        return loadPart;
      }

      function full(params = {}, oncomplite, onerror) {
        var kinopoisk_id = '';
        if (params.card && params.card.source === SOURCE_NAME) {
          if (params.card.kinopoisk_id) {
            kinopoisk_id = params.card.kinopoisk_id;
          } else if ((params.card.id + '').indexOf(SOURCE_NAME + '_') === 0) {
            kinopoisk_id = (params.card.id + '').substring(SOURCE_NAME.length + 1);
            params.card.kinopoisk_id = kinopoisk_id;
          }
        }
        if (kinopoisk_id) {
          getById(kinopoisk_id, params, function (json) {
            var status = new Lampa.Status(4);
            status.onComplite = oncomplite;
            status.append('movie', json);
            status.append('persons', json && json.persons);
            status.append('collection', json && json.collection);
            status.append('simular', json && json.similar);
          }, onerror);
        } else onerror();
      }

      function list(params = {}, oncomplite, onerror) {
        var method = params.url;
        if (method === '' && params.genres) {
          method = 'api/v2.2/films?order=NUM_VOTE&genres=' + params.genres;
        }
        getList(method, params, oncomplite, onerror);
      }

      function search(params = {}, oncomplite) {
        var title = decodeURIComponent(params.query || '');
        var status = new Lampa.Status(1);
        status.onComplite = function (data) {
          var items = [];
          if (data.query && data.query.results) {
            var tmp = data.query.results.filter(function (elem) {
              return containsTitle(elem.title, title) || containsTitle(elem.original_title, title);
            });
            if (tmp.length && tmp.length !== data.query.results.length) {
              data.query.results = tmp;
              data.query.more = true;
            }
            var movie = Object.assign({}, data.query);
            movie.results = data.query.results.filter(function (elem) { return elem.type === 'movie'; });
            movie.title = Lampa.Lang.translate('menu_movies');
            movie.type = 'movie';
            if (movie.results.length) items.push(movie);
            var tv = Object.assign({}, data.query);
            tv.results = data.query.results.filter(function (elem) { return elem.type === 'tv'; });
            tv.title = Lampa.Lang.translate('menu_tv');
            tv.type = 'tv';
            if (tv.results.length) items.push(tv);
          }
          oncomplite(items);
        };
        getList('api/v2.1/films/search-by-keyword', params, function (json) {
          status.append('query', json);
        }, status.error.bind(status));
      }

      function discovery() {
        return {
          title: SOURCE_TITLE,
          search: search,
          params: { align_left: true, object: { source: SOURCE_NAME } },
          onMore: function (params) {
            Lampa.Activity.push({
              url: 'api/v2.1/films/search-by-keyword',
              title: Lampa.Lang.translate('search') + ' - ' + params.query,
              component: 'category_full',
              page: 1,
              query: encodeURIComponent(params.query),
              source: SOURCE_NAME
            });
          },
          onCancel: network.clear.bind(network)
        };
      }

      function person(params = {}, oncomplite) {
        var status = new Lampa.Status(1);
        status.onComplite = function (data) {
          var result = {};
          if (data.query) {
            var p = data.query;
            result.person = {
              id: p.personId,
              name: p.nameRu || p.nameEn || '',
              url: '',
              img: p.posterUrl || '',
              gender: p.sex === 'MALE' ? 2 : p.sex === 'FEMALE' ? 1 : 0,
              birthday: p.birthday,
              place_of_birth: p.birthplace,
              deathday: p.death,
              place_of_death: p.deathplace,
              known_for_department: p.profession || '',
              biography: (p.facts || []).join(' ')
            };
            var director_films = [];
            var director_map = {};
            var actor_films = [];
            var actor_map = {};
            if (p.films) {
              p.films.forEach(function (f) {
                if (f.professionKey === 'DIRECTOR' && !director_map[f.filmId]) {
                  director_map[f.filmId] = true;
                  director_films.push(convertElem(f));
                } else if (f.professionKey === 'ACTOR' && !actor_map[f.filmId]) {
                  actor_map[f.filmId] = true;
                  actor_films.push(convertElem(f));
                }
              });
            }
            var knownFor = [];
            if (director_films.length) {
              director_films.sort(function (a, b) {
                var res = b.vote_average - a.vote_average;
                return res || a.id - b.id;
              });
              knownFor.push({ name: Lampa.Lang.translate('title_producer'), credits: director_films });
            }
            if (actor_films.length) {
              actor_films.sort(function (a, b) {
                var res = b.vote_average - a.vote_average;
                return res || a.id - b.id;
              });
              knownFor.push({ name: Lampa.Lang.translate(p.sex === 'FEMALE' ? 'title_actress' : 'title_actor'), credits: actor_films });
            }
            result.credits = { knownFor: knownFor };
          }
          oncomplite(result);
        };
        var url = 'api/v1/staff/' + params.id;
        getFromCache(url, function (json, cached) {
          if (!cached && json.personId) setCache(url, json);
          status.append('query', json);
        }, status.error.bind(status));
      }

      // Функция загрузки фильтров (переименована в kpMenu)
      function kpMenu(options, oncomplite) {
        if (menu_list.length) {
          oncomplite(menu_list);
        } else {
          get('api/v2.2/films/filters', function (j) {
            if (j.genres) {
              j.genres.forEach(function (g) {
                menu_list.push({
                  id: g.id,
                  title: g.genre,
                  url: '',
                  hide: (g.genre === 'для взрослых'),
                  separator: !g.genre
                });
                genres_map[g.genre] = g.id;
              });
            }
            if (j.countries) {
              j.countries.forEach(function (c) {
                countries_map[c.country] = c.id;
              });
            }
            oncomplite(menu_list);
          }, function () {
            oncomplite([]);
          });
        }
      }

      // Возвращаем объект плагина
      return {
        SOURCE_NAME: SOURCE_NAME,
        SOURCE_TITLE: SOURCE_TITLE,
        main: main,
        menu: kpMenu,
        full: full,
        list: list,
        category: category,
        clear: clear,
        person: person,
        seasons: function (tv, from, oncomplite) {
          var status = new Lampa.Status(from.length);
          status.onComplite = oncomplite;
          from.forEach(function (season) {
            var seasons = tv.seasons || [];
            seasons = seasons.filter(function (s) { return s.season_number === season; });
            if (seasons.length) status.append('' + season, seasons[0]);
            else status.error();
          });
        },
        menuCategory: function (params, oncomplite) { oncomplite([]); },
        discovery: discovery
      };
    })();
  }

  // =============================
  // Интерфейс категорий "Кинопоиск" в виде карточек
  // =============================
  Lampa.Component.add('kp_categories', function KPCategories(object) {
    var scroll = new Lampa.Scroll({ mask: true, over: true });
    var html = document.createElement('div');
    var body = document.createElement('div');
    var items = [];
    var last;
    var active = 0;
    this.create = function () {
      html.classList.add('kp-catalog');
      scroll.append(body);
      html.appendChild(scroll.render(true));
      var categories = [
        { title: 'Популярные Фильмы', url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', icon: '★' },
        { title: 'Топ Фильмы', url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS', icon: '🏆' },
        { title: 'Популярные российские фильмы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM', icon: 'RU' },
        { title: 'Популярные российские сериалы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES', icon: 'RU' },
        { title: 'Популярные российские мини-сериалы', url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES', icon: 'RU' },
        { title: 'Популярные Сериалы', url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES', icon: '★' },
        { title: 'Популярные Телешоу', url: 'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW', icon: '★' }
      ];
      categories.forEach(function (item) {
        var element = { name: item.title };
        var card = new Lampa.Card(element, { object: object, card_category: true });
        card.create();
        card.onFocus = function (target) {
          last = target;
          active = items.indexOf(card);
          scroll.update(card.render(true));
        };
        card.onEnter = function () {
          Lampa.Activity.push({
            url: item.url,
            title: item.title,
            component: 'category_full',
            source: 'KP',
            card_type: true,
            page: 1
          });
        };
        var cardElem = card.render(true);
        var iconsInner = cardElem.querySelector('.card__icons-inner');
        if (iconsInner && item.icon) {
          iconsInner.innerHTML = item.icon;
        }
        items.push(card);
        body.appendChild(cardElem);
      });
      this.activity.loader(false);
      this.activity.toggle();
    };
    this.start = function () {
      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(false, scroll.render(true));
          Lampa.Controller.collectionFocus(last || false, false, scroll.render(true));
        },
        left: function () {
          if (Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu');
        },
        right: function () {
          if (Navigator.canmove('right')) Navigator.move('right');
        },
        up: function () {
          if (Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head');
        },
        down: function () {
          if (Navigator.canmove('down')) Navigator.move('down');
        },
        back: function () {
          Lampa.Activity.backward();
        }
      });
      Lampa.Controller.toggle('content');
    };
    this.pause = function () { };
    this.stop = function () { };
    this.render = function (js) {
      return js ? html : $(html);
    };
    this.destroy = function () {
      scroll.destroy();
      items = [];
      if (html) html.remove();
      if (body) body.remove();
    };
  });

  // =============================
  // Часть 3. Регистрация плагина в Lampa
  // =============================
  (function startPlugin() {
    'use strict';
    window.kp_source_plugin = true;
    function addPlugin() {
      if (Lampa.Api.sources['KP']) {
        Lampa.Noty.show('Установлен плагин несовместимый с kp_source');
        return;
      }
      Lampa.Api.sources['KP'] = KP_PLUGIN;
      Object.defineProperty(Lampa.Api.sources, 'KP', {
        get: function () { return KP_PLUGIN; }
      });
      var sources;
      if (Lampa.Params.values && Lampa.Params.values['source']) {
        sources = Object.assign({}, Lampa.Params.values['source']);
        sources['KP'] = KP_PLUGIN.SOURCE_TITLE;
      } else {
        sources = {};
        var ALL_SOURCES = [
          { name: 'tmdb', title: 'TMDB' },
          { name: 'cub', title: 'CUB' },
          { name: 'pub', title: 'PUB' },
          { name: 'filmix', title: 'FILMIX' },
          { name: 'KP', title: KP_PLUGIN.SOURCE_TITLE }
        ];
        ALL_SOURCES.forEach(function (s) {
          if (Lampa.Api.sources[s.name]) sources[s.name] = s.title;
        });
      }
      Lampa.Params.select('source', sources, 'tmdb');
    }
    if (window.appready) addPlugin();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') addPlugin();
      });
    }
  })();

})();
