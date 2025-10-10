(function() {
  'use strict';
  Lampa.Platform.tv();

  // Глобальные счетчики для функции get (чтобы сохранялись между вызовами)
  var total_cnt = 0;
  var good_cnt = 0;
  var proxy_cnt = 0;

  // Функция запроса с прокси (адаптирована с использованием Lampa.Reguest вместо network)
  function get(method, oncomplite, onerror) {
    var use_proxy = total_cnt >= 10 && good_cnt > total_cnt / 2;
    if (!use_proxy) total_cnt++;
    var kp_prox = 'https://cors.kp556.workers.dev:8443/';
    var url = 'https://kinopoiskapiunofficial.tech/' + String(method);
    var req = new Lampa.Reguest();  // Фикс: используем Lampa.Reguest вместо network
    req.timeout(15000);
    req.silent((use_proxy ? kp_prox : '') + url, function (json) {
      oncomplite(json);
    }, function (a, c) {
      use_proxy = !use_proxy && (proxy_cnt < 10 || good_cnt > proxy_cnt / 2);
      if (use_proxy && (a.status == 429 || (a.status == 0 && a.statusText !== 'timeout'))) {
        proxy_cnt++;
        var proxy_req = new Lampa.Reguest();  // Новый экземпляр для retry
        proxy_req.timeout(15000);
        proxy_req.silent(kp_prox + url, function (json) {
          good_cnt++;
          oncomplite(json);
        }, onerror, false, {
          headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' }  // Замените на ваш личный токен
        });
      } else {
        onerror(a, c);
      }
    }, false, { headers: { 'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616' } });  // Замените на ваш личный токен
  }

  // Функция поиска родительского элемента, содержащего заданный узел
  function findParentContaining(element, target) {
    let parent = element.parentElement;
    while (parent) {
      if (parent.classList && parent.classList.contains(target)) return parent;
      parent = parent.parentElement;
    }
    return null;
  }

  // Добавление getter/setter для свойства 'build' в прототип Card
  function extendCardPrototype() {
    if (window.lampa_listener_extensions) return;
    window.lampa_listener_extensions = true;
    Object.defineProperty(window.Lampa.Card.prototype, 'build', {
      get: function() {
        return this._build;
      },
      set: function(value) {
        this._build = function() {
          value.apply(this);
          Lampa.Listener.send('card', { type: 'build', object: this });
        }.bind(this);
      }
    });
  }

  // Объект кэширования с истечением срока
  const cacheManager = {
    caches: {},
    get: function(key, subKey) {
      let cache = this.caches[key] || (this.caches[key] = Lampa.Storage.get(key, 500, {}));
      let item = cache[subKey];
      if (!item) return null;
      if (Date.now() - item.timestamp > 18 * 60 * 60 * 1000) {
        delete cache[subKey];
        Lampa.Storage.set(key, cache);
        return null;
      }
      return item;
    },
    set: function(key, subKey, value) {
      if (value.kp === 0 && value.imdb === 0 || value.rating === '0.0') return value;
      let cache = this.caches[key] || (this.caches[key] = Lampa.Storage.get(key, 500, {}));
      value.timestamp = Date.now();
      cache[subKey] = value;
      Lampa.Storage.set(key, cache);
      return value;
    }
  };

  // Нормализация строки для сравнения (удаление пунктуации, нижний регистр, замена 'ё' на 'е')
  const normalizedCache = {};
  function normalizeForCompare(str) {
    if (normalizedCache[str]) return normalizedCache[str];
    let normalized = str.replace(/[\s.,:;''`!?]+/g, ' ').trim().toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-').replace(/ё/g, 'е');
    normalizedCache[str] = normalized;
    return normalized;
  }

  // Нормализация строки без замены дефисов (с фиксом на undefined)
  function normalizeBasic(str) {
    if (typeof str !== 'string' || str == null) return ''; // Фикс: возвращаем пустую строку вместо undefined
    return str.replace(/[\s.,:;''`!?]+/g, ' ').trim();
  }

  // Нормализация для поиска (замена пробелов на '+', с фиксом на undefined)
  function normalizeSearch(str) {
    if (typeof str !== 'string' || str == null) return ''; // Фикс: возвращаем пустую строку вместо undefined
    return normalizeBasic(str).replace(/^[ \/\\]+/, '').replace(/[ \/\\]+$/, '').replace(/\+( *[+\/\\])+/g, '+').replace(/([+\/\\] *)+\+/g, '+').replace(/( *[\/\\]+ *)+/g, '+');
  }

  // Проверка равенства нормализованных строк
  function stringsEqual(a, b) {
    return typeof a === 'string' && typeof b === 'string' && normalizeForCompare(a) === normalizeForCompare(b);
  }

  // Проверка вхождения нормализованной строки
  function stringContains(a, b) {
    return typeof a === 'string' && typeof b === 'string' && normalizeForCompare(a).indexOf(normalizeForCompare(b)) !== -1;
  }

  // Очередь задач для асинхронного выполнения
  let taskQueue = [], isProcessing = false, delay = 300;
  function processQueue() {
    if (isProcessing || !taskQueue.length) return;
    isProcessing = true;
    let task = taskQueue.shift();
    task.execute();
    setTimeout(() => {
      isProcessing = false;
      processQueue();
    }, delay);
  }

  function addToQueue(task) {
    taskQueue.push({ execute: task });
    processQueue();
  }

  // Пул запросов
  let requestPool = [];
  function getRequest() {
    return requestPool.pop() || new Lampa.Reguest();
  }

  function returnRequest(req) {
    req.clear();
    if (requestPool.length < 3) requestPool.push(req);
  }

  // Получение рейтинга из Lampa (реакции пользователей)
  function getLampaRating(movie, callback) {
    let cached = cacheManager.get('lampa_rating', movie.id);
    if (cached && cached.rating !== '0.0') {
      callback(cached.rating);
      return;
    }
    addToQueue(() => {
      let type = 'movie';
      if (movie.number_of_seasons || movie.seasons || movie.last_episode_to_air || movie.first_air_date || movie.start_date || movie.original_name && !movie.title || movie.original_title && !movie.name) type = 'tv';
      let url = 'http://cub.bylampa.online/api/reactions/get/' + type + '_' + movie.id;
      let req = getRequest();
      req.timeout(15000);
      req.silent(url, (data) => {
        let rating = '0.0';
        if (data && data.result) {
          let reactions = data.result, positive = 0, negative = 0;
          reactions.forEach((r) => {
            if (r.type === 'fire' || r.type === 'nice') positive += parseInt(r.counter, 10);
            if (r.type === 'shit' || r.type === 'bore' || r.type === 'think') negative += parseInt(r.counter, 10);
          });
          rating = positive + negative > 0 ? (positive / (positive + negative) * 10).toFixed(1) : '0.0';
        }
        cacheManager.set('lampa_rating', movie.id, { rating, timestamp: Date.now() });
        returnRequest(req);
        callback(rating);
      }, () => {
        returnRequest(req);
        callback('0.0');
      });
    });
  }

  // Получение рейтинга из Kinopoisk/IMDB (с использованием get)
  function getExternalRating(movie, callback) {
    let cached = cacheManager.get('kp_rating', movie.id);
    if (cached) {
      let source = Lampa.Storage.get('rating_source', 'tmdb');
      let rating = source === 'kp' ? cached.kp : cached.imdb;
      if (rating && rating > 0) {
        callback(parseFloat(rating).toFixed(1));
        return;
      }
    }
    addToQueue(() => {
      let name = movie.name || movie.original_name || ''; // Фикс: fallback на пустую строку
      if (!name) {
        callback('0.0'); // Пропускаем поиск, если нет названия
        return;
      }
      let searchQuery = normalizeSearch(name);
      let releaseYear = movie.release_date || movie.first_air_date || movie.last_air_date || '0000';
      let year = parseInt((releaseYear + '').slice(0, 4));
      let origTitle = movie.original_title || movie.orig_title;

      function searchFilms() {
        let searchMethod = 'api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(searchQuery);
        if (movie.imdb_id) searchMethod += '&imdbId=' + encodeURIComponent(movie.imdb_id);
        get(searchMethod, (data) => {
          if (data.searchFilms && data.searchFilms.length) processResults(data.searchFilms);
          else if (data.films && data.films.length) processResults(data.films);
          else processResults([]);
        }, (a, c) => {
          console.error('Search error:', a, c); // Диагностика
          callback('0.0');
        });
      }

      function processResults(results) {
        if (!results || !results.length) {
          callback('0.0');
          return;
        }
        results.forEach((item) => {
          let itemYear = item.year || item.filmId || '0000';
          item.tmp_year = parseInt((itemYear + '').slice(0, 4));
        });
        let filtered = results;
        let exactMatch = false;
        if (origTitle) {
          let exact = filtered.filter((item) => {
            return stringContains(item.nameOriginal || item.nameEn, origTitle) ||
                   stringContains(item.ru_title || item.en_title, origTitle) ||
                   stringContains(item.title || item.nameRu || item.name, origTitle);
          });
          if (exact.length) {
            filtered = exact;
            exactMatch = true;
          }
        }
        if (filtered.length > 1 && year) {
          let yearMatch = filtered.filter((item) => item.tmp_year == year);
          if (!yearMatch.length) yearMatch = filtered.filter((item) => item.tmp_year && item.tmp_year > year - 2 && item.tmp_year < year + 2);
          if (yearMatch.length) filtered = yearMatch;
        }
        if (filtered.length >= 1) {
          let id = filtered[0].kinopoiskId || filtered[0].kinopoisk_id || filtered[0].kp_id || filtered[0].filmId;
          if (id && typeof id === 'number' && id > 0) {
            let ratingMethod = 'api/v2.2/films/' + id + '/ratings';
            get(ratingMethod, (ratingData) => {
              let cachedRating = cacheManager.set('kp_rating', movie.id, {
                kp: ratingData.ratingKinopoisk || 0,
                imdb: ratingData.ratingImdb || 0,
                timestamp: Date.now()
              });
              let source = Lampa.Storage.get('rating_source', 'tmdb');
              let selectedRating = source === 'kp' ? cachedRating.kp : cachedRating.imdb;
              callback(selectedRating ? parseFloat(selectedRating).toFixed(1) : '0.0');
            }, (a, c) => {
              console.error('Ratings error for ID ' + id + ':', a, c); // Диагностика
              callback('0.0');
            });
          } else {
            callback('0.0');
          }
        } else {
          callback('0.0');
        }
      }

      searchFilms();
    });
  }

  // Очередь для обновления карточек
  let cardQueue = [], cardTimer = null;
  function queueCardUpdate(data) {
    cardQueue.push(data);
    if (cardTimer) return;
    cardTimer = setTimeout(() => {
      let unique = cardQueue.splice(0);
      unique.forEach(updateCardRating);
      cardTimer = null;
    }, 16);
  }

  // Создание элемента рейтинга
  function createRatingElement(card) {
    let elem = document.createElement('div');
    elem.className = 'card__vote';
    elem.style.cssText = 'line-height: 1; font-family: "SegoeUI", sans-serif; cursor: pointer; box-sizing: border-box; outline: none; user-select: none; position: absolute; right: 0.3em; bottom: 0.3em; background: rgba(0, 0, 0, 0.5); color: #fff; font-size: 1.3em; font-weight: 700; padding: 0.2em 0.5em; border-radius: 1em;';
    let titleElem = card.querySelector('.card__view');
    (titleElem || card).appendChild(elem);
    return elem;
  }

  // Обновление рейтинга на карточке
  function updateCardRating(data) {
    let card = data.card || data;
    if (!card || !card.querySelector) return;
    let movieData = card.card_data || data.data || {};
    if (!movieData.id) return;
    let source = Lampa.Storage.get('rating_source', 'tmdb');
    let ratingElem = card.querySelector('.card__vote');
    if (!ratingElem) ratingElem = createRatingElement(card);
    if (ratingElem.dataset && ratingElem.dataset.source === source && ratingElem.dataset.movieId === movieData.id.toString()) return;
    if (ratingElem.dataset) {
      ratingElem.dataset.source = source;
      ratingElem.dataset.movieId = movieData.id.toString();
    }
    ratingElem.className = 'card__vote rate--' + source;
    if (source === 'tmdb') {
      let inner = ratingElem.innerHTML.toLowerCase();
      let match = ratingElem.innerHTML.toLowerCase();
      let num = match.match(/^\d+\.?\d*/);
      inner = num ? num[0] : '0.0';
      ratingElem.innerHTML = inner + '<span class="source--name">TMDB</span>';
    } else {
      ratingElem.innerHTML = '';
      if (source === 'lampa') {
        getLampaRating(movieData, (rating) => {
          if (ratingElem.dataset && ratingElem.dataset.movieId === movieData.id.toString()) {
            ratingElem.innerHTML = rating + '<span class="source--name">LAMPA</span>';
          }
        });
      } else if (source === 'kp' || source === 'imdb') {
        getExternalRating(movieData, (rating) => {
          if (ratingElem.dataset && ratingElem.dataset.movieId === movieData.id.toString()) {
            let name = source === 'kp' ? 'KP' : 'IMDB';
            ratingElem.innerHTML = rating + '<span class="source--name">' + name + '</span>';
          }
        });
      }
    }
  }

  // Добавление настройки в интерфейс
  function addSettings() {
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {
        name: 'rating_source',
        type: 'select',
        values: { 'tmdb': 'TMDB', 'lampa': 'Lampa', 'kp': 'КиноПоиск', 'imdb': 'IMDB' },
        default: 'tmdb'
      },
      field: {
        name: 'Источник рейтинга на карточках',
        description: 'Выберите какой рейтинг отображать на карточках'
      },
      onRender: function() {
        setTimeout(() => {
          $('.settings-param > div:contains("Источник рейтинга на карточках")').parent().insertAfter($('div[data-name="interface_size"]'));
        }, 0);
      },
      onChange: function(value) {
        Lampa.Storage.set('rating_source', value);
        let votes = document.querySelectorAll('.card__vote');
        for (let i = 0; i < votes.length; i++) {
          let vote = votes[i];
          let parentCard = findParentContaining(vote, 'card');
          if (parentCard) {
            if (vote.dataset) {
              delete vote.dataset.source;
              delete vote.dataset.movieId;
            }
            let updateData = { card: parentCard, data: parentCard.card_data };
            queueCardUpdate(updateData);
          }
        }
      }
    });
  }

  // Добавление CSS стилей
  function addStyles() {
    let style = document.createElement('style');
    style.type = 'text/css';
    let css = '.card__vote {' +
      '    display: inline-flex !important;' +
      '    align-items: center !important;' +
      '}' +
      '.card__vote .source--name {' +
      '    font-size: 0;' +
      '    color: transparent;' +
      '    display: inline-block;' +
      '    flex-shrink: 0;' +
      '    background-repeat: no-repeat;' +
      '    background-position: center;' +
      '    background-size: contain;' +
      '    margin-left: 4px;' +
      '    width: 16px;' +
      '    height: 16px;' +
      '}' +
      '@media (min-width: 481px) {' +
      '    .card__vote .source--name {' +
      '        margin-left: 6px;' +
      '    }' +
      '}' +
      '.rate--lampa .source--name {' +
      '    background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 150 150\' width=\'150\' height=\'150\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0\' y1=\'0\' x2=\'1\' y2=\'0\'%3E%3Cstop offset=\'0%\' stop-color=\'#90cea1\'/%3E%3Cstop offset=\'56%\' stop-color=\'#3cbec9\'/%3E%3Cstop offset=\'100%\' stop-color=\'#00b3e5\'/%3E%3C/linearGradient%3E%3Cstyle%3E .text-style {   font-weight: bold;   fill: url(#grad);   text-anchor: start;   dominant-baseline: middle;   textLength: 150;   lengthAdjust: spacingAndGlyphs;   font-size: 70px; }%3C/style%3E%3C/defs%3E%3Ctext class=\'text-style\' x=\'0\' y=\'50\' textLength=\'150\' lengthAdjust=\'spacingAndGlyphs\'%3ETM%3C/text%3E%3Ctext class=\'text-style\' x=\'0\' y=\'120\' textLength=\'150\' lengthAdjust=\'spacingAndGlyphs\'%3EDB%3C/text%3E%3C/svg%3E");' +
      '}' +
      '.rate--tmdb .source--name {' +
      '    background-image: url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' viewBox=\'0 0 300 300\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cmask id=\'mask0_1_69\' style=\'mask-type:alpha\' maskUnits=\'userSpaceOnUse\' x=\'0\' y=\'0\' width=\'300\' height=\'300\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'white\'/%3E%3C/mask%3E%3Cg mask=\'url(%23mask0_1_69)\'%3E%3Ccircle cx=\'150\' cy=\'150\' r=\'150\' fill=\'black\'/%3E%3Cpath d=\'M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z\' fill=\'url(%23paint0_radial_1_69)\'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id=\'paint0_radial_1_69\' cx=\'0\' cy=\'0\' r=\'1\' gradientUnits=\'userSpaceOnUse\' gradientTransform=\'translate(89.9999 45) rotate(45) scale(296.985)\'%3E%3Cstop offset=\'0.5\' stop-color=\'#FF5500\'/%3E%3Cstop offset=\'1\' stop-color=\'#BBFF00\'/%3E%3C/radialGradient%3E%3C/defs%3E%3C/svg%3E");' +
      '}' +
      '.rate--imdb .source--name {' +
      '    background-image: url("data:image/svg+xml,%3Csvg fill=\'#ffcc00\' viewBox=\'0 0 32 32\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg id=\'SVGRepo_bgCarrier\' stroke-width=\'0\'%3E%3C/g%3E%3Cg id=\'SVGRepo_tracerCarrier\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3C/g%3E%3Cg id=\'SVGRepo_iconCarrier\'%3E%3Cpath d=\'M 0 7 L 0 25 L 32 25 L 32 7 Z M 2 9 L 30 9 L 30 23 L 2 23 Z M 5 11.6875 L 5 20.3125 L 7 20.3125 L 7 11.6875 Z M 8.09375 11.6875 L 8.09375 20.3125 L 10 20.3125 L 10 15.5 L 10.90625 20.3125 L 12.1875 20.3125 L 13 15.5 L 13 20.3125 L 14.8125 20.3125 L 14.8125 11.6875 L 12 11.6875 L 11.5 15.8125 L 10.8125 11.6875 Z M 15.90625 11.6875 L 15.90625 20.1875 L 18.3125 20.1875 C 19.613281 20.1875 20.101563 19.988281 20.5 19.6875 C 20.898438 19.488281 21.09375 19 21.09375 18.5 L 21.09375 13.3125 C 21.09375 12.710938 20.898438 12.199219 20.5 12 C 20 11.800781 19.8125 11.6875 18.3125 11.6875 Z M 22.09375 11.8125 L 22.09375 20.3125 L 23.90625 20.3125 C 23.90625 20.3125 23.992188 19.710938 24.09375 19.8125 C 24.292969 19.8125 25.101563 20.1875 25.5 20.1875 C 26 20.1875 26.199219 20.195313 26.5 20.09375 C 26.898438 19.894531 27 19.613281 27 19.3125 L 27 14.3125 C 27 13.613281 26.289063 13.09375 25.6875 13.09375 C 25.085938 13.09375 24.511719 13.488281 24.3125 13.6875 L 24.3125 11.8125 Z M 18 13 C 18.398438 13 18.8125 13.007813 18.8125 13.40625 L 18.8125 18.40625 C 18.8125 18.804688 18.300781 18.8125 18 18.8125 Z M 24.59375 14 C 24.695313 14 24.8125 14.105469 24.8125 14.40625 L 24.8125 18.6875 C 24.8125 18.886719 24.792969 19.09375 24.59375 19.09375 C 24.492188 19.09375 24.40625 18.988281 24.40625 18.6875 L 24.40625 14.40625 C 24.40625 14.207031 24.394531 14 24.59375 14 Z\'/%3E%3C/g%3E%3C/svg%3E");' +
      '}' +
      '.rate--kp .source--name {' +
      '    background-image: url("data:image/svg+xml,%3Csvg width=\'110\' height=\'104\' viewBox=\'0 0 110 104\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M81.6744 103.11C98.5682 93.7234 110 75.6967 110 55C110 24.6243 85.3757 0 55 0C24.6243 0 0 24.6243 0 55C0 75.6967 11.4318 93.7234 28.3255 103.11C14.8869 94.3724 6 79.224 6 62C6 34.938 27.938 13 55 13C82.062 13 104 34.938 104 62C104 79.224 95.1131 94.3725 81.6744 103.11Z\' fill=\'white\'/%3E%3Cpath d=\'M92.9546 80.0076C95.5485 74.5501 97 68.4446 97 62C97 38.804 78.196 20 55 20C31.804 20 13 38.804 13 62C13 68.4446 14.4515 74.5501 17.0454 80.0076C16.3618 77.1161 16 74.1003 16 71C16 49.4609 33.4609 32 55 32C76.5391 32 94 49.4609 94 71C94 74.1003 93.6382 77.1161 92.9546 80.0076Z\' fill=\'white\'/%3E%3Cpath d=\'M55 89C69.3594 89 81 77.3594 81 63C81 57.9297 79.5486 53.1983 77.0387 49.1987C82.579 54.7989 86 62.5 86 71C86 88.1208 72.1208 102 55 102C37.8792 102 24 88.1208 24 71C24 62.5 27.421 54.7989 32.9613 49.1987C30.4514 53.1983 29 57.9297 29 63C29 77.3594 40.6406 89 55 89Z\' fill=\'white\'/%3E%3Cpath d=\'M73 63C73 72.9411 64.9411 81 55 81C45.0589 81 37 72.9411 37 63C37 53.0589 45.0589 45 55 45C64.9411 45 73 53.0589 73 63Z\' fill=\'white\'/%3E%3C/svg%3E");' +
      '}';
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
  }

  // Инициализация плагина
  function initPlugin() {
    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;
    addSettings();
    extendCardPrototype();
    addStyles();
    Lampa.Listener.follow('card', (event) => {
      if (event.type === 'build' && event.object.card_data) {
        queueCardUpdate(event.object);
      }
    });
  }

  if (window.appready) initPlugin();
  else Lampa.Listener.follow('app', (event) => {
    if (event.type === 'ready') initPlugin();
  });
})();
