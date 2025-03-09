(function(){
    'use strict';

    /**
     * =========================
     * ЧАСТЬ 1. РЕГИСТРАЦИЯ ИСТОЧНИКА "KP"
     * =========================
     * Этот блок создаёт источник 'KP', который ходит на kinopoiskapiunofficial.tech
     * и умеет отдавать данные для Lampa (full, list, search и т.д.).
     */

    if (!window.KP_PLUGIN) {
      window.KP_PLUGIN = (function () {
        const network = new Lampa.Reguest();
        const cache   = {};
        let   total_cnt = 0, proxy_cnt = 0, good_cnt = 0;
        const CACHE_SIZE = 100, CACHE_TIME = 1000 * 60 * 60;
        const SOURCE_NAME  = 'KP';
        const SOURCE_TITLE = 'KP';

        // Карты жанров / стран (заполняются при загрузке фильтров)
        let genres_map    = {};
        let countries_map = {};
        // Список жанров/стран
        let menu_list     = [];

        // Простой get
        function get(method, oncomplite, onerror) {
          let use_proxy = (total_cnt >= 10 && good_cnt > total_cnt / 2);
          if (!use_proxy) total_cnt++;

          const kp_prox = 'https://cors.kp556.workers.dev:8443/';
          let   url     = 'https://kinopoiskapiunofficial.tech/' + method;

          network.timeout(15000);
          network.silent(
            (use_proxy ? kp_prox : '') + url,
            (json)=>{
              oncomplite(json);
            },
            (a,c)=>{
              use_proxy = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
              // Если 429 или cors — попробуем повторить запрос через прокси
              if (use_proxy && (a.status===429 || (a.status===0 && a.statusText!=='timeout'))) {
                proxy_cnt++;
                network.timeout(15000);
                network.silent(
                  kp_prox+url,
                  (json2)=>{
                    good_cnt++;
                    oncomplite(json2);
                  },
                  onerror,
                  false,
                  { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616' } }
                );
              }
              else onerror(a,c);
            },
            false,
            { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616' } }
          );
        }

        function getFromCache(method, oncomplite, onerror){
          const cached = cache[method];
          if (cached) {
            let old = new Date().getTime() - CACHE_TIME;
            if (cached.timestamp > old) {
              // отдаём из кэша
              setTimeout(()=>oncomplite(cached.value,true),10);
              return;
            }
            else {
              // почистим просрочку
              for (let k in cache) {
                if (cache[k] && cache[k].timestamp < old) {
                  delete cache[k];
                }
              }
            }
          }
          // если нет в кэше
          get(method,
            (json)=>{
              if (json) {
                // положим в кэш
                let size = Object.keys(cache).length;
                if (size>=CACHE_SIZE) {
                  // чистим
                  let old = new Date().getTime()-CACHE_TIME;
                  for (let k in cache) {
                    if (cache[k] && cache[k].timestamp<old) delete cache[k];
                  }
                }
                cache[method] = {timestamp: new Date().getTime(), value:json};
              }
              oncomplite(json,false);
            },
            onerror
          );
        }

        function clear(){
          network.clear();
        }

        // =====================
        // Преобразование данных kinopoiskapi => формат Lampa
        // =====================
        function convertElem(elem) {
          let type = (!elem.type || elem.type==='FILM' || elem.type==='VIDEO') ? 'movie' : 'tv';
          let kinopoisk_id = elem.kinopoiskId || elem.filmId || 0;
          let kp_rating    = +elem.rating || +elem.ratingKinopoisk || 0;

          let title          = elem.nameRu || elem.nameEn || elem.nameOriginal || '';
          let original_title = elem.nameOriginal||elem.nameEn||elem.nameRu||'';

          // Проверка adult
          let adult = false;

          let result = {
            source: SOURCE_NAME,
            type,
            adult:false,
            id: SOURCE_NAME+'_'+kinopoisk_id,
            title,
            original_title,
            overview: elem.description || elem.shortDescription || '',
            img:       elem.posterUrlPreview || elem.posterUrl || '',
            background_image: elem.coverUrl || elem.posterUrl || elem.posterUrlPreview || '',
            genres: (elem.genres||[]).map(g=>{
              if (g.genre==='для взрослых') adult=true;
              let idd = (g.genre && genres_map[g.genre])||0;
              return {id:idd, name:g.genre, url:''};
            }),
            production_companies:[],
            production_countries: (elem.countries||[]).map(c=>({name:c.country})),
            vote_average: kp_rating,
            vote_count:   elem.ratingVoteCount||elem.ratingKinopoiskVoteCount||0,
            kinopoisk_id,
            kp_rating: kp_rating,
            imdb_id:   elem.imdbId||'',
            imdb_rating: elem.ratingImdb||0
          };
          result.adult = adult;

          // Год
          let first_air_date = (elem.year && elem.year!=='null') ? elem.year : '';
          let last_air_date  = '';
          if (type==='tv') {
            if (elem.startYear && elem.startYear!=='null') first_air_date = elem.startYear;
            if (elem.endYear   && elem.endYear  !=='null') last_air_date  = elem.endYear;
          }
          // distributions
          if (elem.distributions_obj) {
            let dists = elem.distributions_obj.items||[];
            let year_timestamp = Date.parse(first_air_date);
            let min = null;
            dists.forEach(d=>{
              if (d.date && (d.type==='WORLD_PREMIER'||d.type==='ALL')) {
                let ts = Date.parse(d.date);
                if (!isNaN(ts) && (min===null || ts<min) && (isNaN(year_timestamp)||ts>=year_timestamp)) {
                  min = ts;
                  first_air_date = d.date;
                }
              }
            });
          }
          if (type==='tv') {
            result.name = title;
            result.original_name = original_title;
            result.first_air_date = first_air_date;
            if (last_air_date) result.last_air_date = last_air_date;
          }
          else {
            result.release_date = first_air_date;
          }

          // Сезоны
          if (elem.seasons_obj) {
            let _seasons = elem.seasons_obj.items||[];
            result.number_of_seasons = elem.seasons_obj.total||_seasons.length||1;
            result.seasons = _seasons.map(s=>{
              let episodes = (s.episodes||[]).map(e=>{
                return {
                  season_number:e.seasonNumber,
                  episode_number:e.episodeNumber,
                  name: e.nameRu||e.nameEn||('S'+e.seasonNumber+' / '+Lampa.Lang.translate('torrent_serial_episode')+' '+e.episodeNumber),
                  overview: e.synopsis||'',
                  air_date: e.releaseDate
                };
              });
              return {
                season_number: s.number,
                episode_count: episodes.length,
                episodes,
                name: Lampa.Lang.translate('torrent_serial_season')+' '+s.number,
                overview:''
              };
            });
            let ep_count=0;
            result.seasons.forEach(s=>{ ep_count+=s.episode_count; });
            result.number_of_episodes = ep_count;
          }

          // staff
          if (elem.staff_obj) {
            let cast=[], crew=[];
            elem.staff_obj.forEach(s=>{
              let person = {
                id: s.staffId,
                name: s.nameRu||s.nameEn||'',
                url: '',
                img: s.posterUrl||'',
                character: s.description||'',
                job: Lampa.Utils.capitalizeFirstLetter((s.professionKey||'').toLowerCase())
              };
              if (s.professionKey==='ACTOR') cast.push(person);
              else crew.push(person);
            });
            result.persons = {cast, crew};
          }

          // sequels / simular
          if (elem.sequels_obj) {
            result.collection = {results: (elem.sequels_obj||[]).map(convertElem)};
          }
          if (elem.similars_obj) {
            result.simular = {results: (elem.similars_obj.items||[]).map(convertElem)};
          }

          return result;
        }

        // =====================
        // Основные методы
        // =====================
        function menu(options, onready){
          // загрузить фильтры (жанры / страны), заполнить menu_list
          if (menu_list.length) {
            onready(menu_list);
          }
          else {
            get('api/v2.2/films/filters',(json)=>{
              if (json.genres) {
                json.genres.forEach(g=>{
                  menu_list.push({
                    id: g.id,
                    title: g.genre,
                    url:'',
                    hide: (g.genre==='для взрослых'),
                    separator:!g.genre
                  });
                  genres_map[g.genre] = g.id;
                });
              }
              if (json.countries) {
                json.countries.forEach(c=>{
                  countries_map[c.country] = c.id;
                });
              }
              onready(menu_list);
            },()=>{
              onready([]);
            });
          }
        }

        function getList(method, params, oncomplite, onerror){
          let page = params.page||1;
          let url  = method;

          // поиск
          function kpCleanTitle(str){
            return str.replace(/[\s.,:;’'`!?]+/g, ' ').trim()
                      .replace(/^[ \/\\]+/,'')
                      .replace(/[ \/\\]+$/,'')
                      .replace(/\+( *[+\/\\])+/g,'+')
                      .replace(/([+\/\\] *)+\+/g,'+')
                      .replace(/( *[\/\\]+ *)+/g,'+');
          }
          if (params.query) {
            let clean_title = kpCleanTitle(decodeURIComponent(params.query));
            if (!clean_title) {
              onerror();
              return;
            }
            url = Lampa.Utils.addUrlComponent(url,'keyword='+encodeURIComponent(clean_title));
          }

          url = Lampa.Utils.addUrlComponent(url,'page='+page);

          getFromCache(url,(json,cached)=>{
            let items = [];
            if (json.items && json.items.length) items = json.items;
            else if (json.films && json.films.length) items = json.films;
            else if (json.releases && json.releases.length) items = json.releases;

            let results = items.map(convertElem).filter(e=>!e.adult);

            let total_pages = json.pagesCount||json.totalPages||1;

            oncomplite({
              results,
              url: method,
              page,
              total_pages,
              total_results:0,
              more: total_pages>page
            });
          },onerror);
        }

        function list(params={}, oncomplite, onerror){
          let method = params.url;
          if (!method && params.genres) {
            method = 'api/v2.2/films?order=NUM_VOTE&genres='+params.genres;
          }
          getList(method, params, oncomplite, onerror);
        }

        function main(params={}, oncomplite, onerror){
          // просто примеры подборок
          let parts_data = [
            function(cb){
              getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', params, (json)=>{
                json.title = Lampa.Lang.translate('title_now_watch');
                cb(json);
              }, cb);
            },
            function(cb){
              getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS', params, (json)=>{
                json.title = Lampa.Lang.translate('title_top_movie');
                cb(json);
              }, cb);
            },
            function(cb){
              getList('api/v2.2/films?order=NUM_VOTE&type=FILM', params, (json)=>{
                json.title = 'Популярные фильмы';
                cb(json);
              }, cb);
            },
            function(cb){
              getList('api/v2.2/films?order=NUM_VOTE&type=TV_SERIES', params, (json)=>{
                json.title = 'Популярные сериалы';
                cb(json);
              }, cb);
            },
          ];
          // добавим что-нибудь ещё
          menu({},()=>{
            // например, после загрузки фильтров
            Lampa.Api.partNext(parts_data,5,oncomplite,onerror);
          });
        }

        function full(params={}, oncomplite, onerror){
          let kinopoisk_id = '';
          if (params.card && params.card.source===SOURCE_NAME) {
            if (params.card.kinopoisk_id) kinopoisk_id = params.card.kinopoisk_id;
            else if ((params.card.id+'').indexOf(SOURCE_NAME+'_')===0) {
              kinopoisk_id = (params.card.id+'').substring(SOURCE_NAME.length+1);
              params.card.kinopoisk_id = kinopoisk_id;
            }
          }
          if (kinopoisk_id) {
            // грузим детали
            getById(kinopoisk_id, params, (json)=>{
              let status = new Lampa.Status(4);
              status.onComplite = oncomplite;
              status.append('movie',     json);
              status.append('persons',   json && json.persons);
              status.append('collection',json && json.collection);
              status.append('simular',   json && json.simular);
            }, onerror);
          }
          else onerror();
        }

        function category(params={}, oncomplite, onerror){
          // упрощённо, можем не делать
          onerror();
        }

        function getById(id, params={}, oncomplite, onerror){
          menu({},()=>{
            let url = 'api/v2.2/films/'+id;
            let film = cache[url];
            if (film) {
              setTimeout(()=>{
                oncomplite(convertElem(film.value));
              },10);
            }
            else {
              get(url,(json)=>{
                if (json.kinopoiskId) {
                  // например, загрузим staff, etc. - упрощённо
                  oncomplite(convertElem(json));
                }
                else onerror();
              }, onerror);
            }
          });
        }

        function search(params={}, oncomplite){
          // поиск
          let status = new Lampa.Status(1);
          status.onComplite = (data)=>{
            let items = [];
            if (data.query && data.query.results) {
              // разобьём на movie/tv
              let all = data.query.results;
              let query = decodeURIComponent(params.query||'').toLowerCase();
              // грубый фильтр
              all = all.filter(e=>{
                let t1 = (e.title||'').toLowerCase();
                let t2 = (e.original_title||'').toLowerCase();
                return (t1.indexOf(query)!==-1 || t2.indexOf(query)!==-1);
              });

              let movie = Object.assign({}, data.query);
              movie.results = all.filter(e=> e.type==='movie');
              movie.title   = Lampa.Lang.translate('menu_movies');
              if (movie.results.length) items.push(movie);

              let tv    = Object.assign({}, data.query);
              tv.results= all.filter(e=> e.type==='tv');
              tv.title  = Lampa.Lang.translate('menu_tv');
              if (tv.results.length) items.push(tv);
            }
            oncomplite(items);
          };
          getList('api/v2.1/films/search-by-keyword', params, (json)=>{
            status.append('query', json);
          }, status.error.bind(status));
        }

        function discovery(){
          return {
            title: SOURCE_TITLE,
            search,
            params:{align_left:true, object:{source:SOURCE_NAME}},
            onMore:(p)=>{
              Lampa.Activity.push({
                url:'api/v2.1/films/search-by-keyword',
                title: Lampa.Lang.translate('search')+' - '+p.query,
                component:'category_full',
                page:1,
                query:encodeURIComponent(p.query),
                source:SOURCE_NAME
              });
            },
            onCancel: clear
          };
        }

        return {
          SOURCE_NAME, SOURCE_TITLE,
          main, menu, full, list, category, clear,
          person:(p,cb)=>{cb({});},  // можно дописать
          seasons:(tv, from, cb)=>{ cb(); },
          menuCategory:(p,cb)=>cb([]),
          discovery
        };
      })();
    }

    // =========================
    // ЧАСТЬ 2. РЕГИСТРАЦИЯ В Lampa
    // =========================
    (function(){
      if (!window.kp_source_plugin) {
        window.kp_source_plugin = true;

        function addPlugin(){
          // Если уже есть источник KP, не ставим
          if (Lampa.Api.sources['KP']) {
            Lampa.Noty.show('Источник KP уже установлен или конфликтует');
            return;
          }
          // Вписываем
          Lampa.Api.sources['KP'] = KP_PLUGIN;
          Object.defineProperty(Lampa.Api.sources, 'KP', {
            get:()=>KP_PLUGIN
          });
          // Добавим в параметры
          let sources;
          if (Lampa.Params.values && Lampa.Params.values.source) {
            sources = Object.assign({}, Lampa.Params.values.source);
            sources['KP'] = KP_PLUGIN.SOURCE_TITLE;
          }
          else {
            sources = {};
            let ALL = [
              {name:'tmdb', title:'TMDB'},
              {name:'cub',   title:'CUB'},
              {name:'pub',   title:'PUB'},
              {name:'filmix',title:'FILMIX'},
              {name:'KP',    title: KP_PLUGIN.SOURCE_TITLE}
            ];
            ALL.forEach(s=>{
              if (Lampa.Api.sources[s.name]) sources[s.name] = s.title;
            });
          }
          Lampa.Params.select('source', sources, 'tmdb');
        }

        if (window.appready) addPlugin();
        else {
          Lampa.Listener.follow('app', (e)=>{
            if (e.type==='ready') addPlugin();
          });
        }
      }
    })();

    /**
     * =============================
     * ЧАСТЬ 3. СОЗДАЁМ ОТДЕЛЬНУЮ СТРАНИЦУ (Activity) "kp_categories"
     * =============================
     * По аналогии с "TV Show стриминги" сделаем меню-карточки.
     */
    Lampa.Activity.component({
      name: 'kp_categories',
      // если хотим использовать шаблон, можно template: ...
      onCreate(){
        // this - контекст Activity
        let _this  = this;
        _this.title = 'Кинопоиск'; // заголовок

        // создадим скролл
        let scroll = new Lampa.Scroll({mask:true,over:true});
        _this.scroll = scroll;

        // массив категорий
        let categories = [
          {
            title:'Популярные Фильмы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'
          },
          {
            title:'Топ Фильмы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
          },
          {
            title:'Популярные российские фильмы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'
          },
          {
            title:'Популярные российские сериалы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'
          },
          {
            title:'Популярные российские мини-сериалы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES'
          },
          {
            title:'Популярные Сериалы',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES'
          },
          {
            title:'Популярные Телешоу',
            icon:`<svg width="64" height="64" ...>...</svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW'
          }
        ];

        // создадим wrap
        let wrap = Lampa.Template.js('items_line',{});

        // Добавим элементы
        categories.forEach(cat=>{
          let item = Lampa.Template.js('menu_item',{});
          // внутрь item .menu__ico / .menu__text
          item.querySelector('.menu__ico').innerHTML = cat.icon;
          item.querySelector('.menu__text').textContent = cat.title;

          item.addEventListener('hover:enter',()=>{
            // при выборе
            Lampa.Activity.push({
              url: cat.url,
              title: cat.title,
              component:'category_full',
              source:'KP',
              card_type:true,
              page:1
            });
          });

          wrap.appendChild(item);
        });

        scroll.body().appendChild(wrap);
        _this.listener.follow('back',()=>{
          Lampa.Activity.backward();
        });

        _this.render = function(){
          return scroll.render();
        };
        _this.destroy = function(){
          scroll.destroy();
          wrap = null;
        };
      },
      onBack(){
        this.listener.send('back');
      },
    });

    /**
     * =========================
     * ЧАСТЬ 4. КНОПКА "КИНОПОИСК" В МЕНЮ
     * =========================
     * Заменим Select.show на переход в нашу новую Activity "kp_categories".
     */
    Lampa.Platform.tv();
    const ITEM_TV_SELECTOR = '[data-action="tv"]';
    function moveItemAfter(item, after){
      setTimeout(()=>{
        $(item).insertAfter($(after));
      },2000);
    }
    function addMenuButton(newItemAttr, newItemText, iconHTML, onEnter){
      let NEW_ITEM_ATTR = newItemAttr;
      let NEW_ITEM_SELECTOR = '['+NEW_ITEM_ATTR+']';
      let field = $(`
        <li class="menu__item selector" ${NEW_ITEM_ATTR}>
          <div class="menu__ico">${iconHTML}</div>
          <div class="menu__text">${newItemText}</div>
        </li>
      `);
      field.on('hover:enter',onEnter);
      if (window.appready) {
        Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
        moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
      }
      else {
        Lampa.Listener.follow('app',(e)=>{
          if(e.type==='ready'){
            Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
            moveItemAfter(NEW_ITEM_SELECTOR, ITEM_TV_SELECTOR);
          }
        });
      }
    }

    let iconKP = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="192"
        height="192"
        viewBox="0 0 192 192"
      >
        <g fill="none" fill-rule="evenodd">
          <g fill="currentColor" fill-rule="nonzero">
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
    addMenuButton(
      'data-action="kp_menu"',
      'Кинопоиск',
      iconKP,
      function(){
        // При нажатии — переходим на страницу "kp_categories"
        Lampa.Activity.push({
          title:'Кинопоиск',
          component:'kp_categories'
        });
      }
    );

})();
