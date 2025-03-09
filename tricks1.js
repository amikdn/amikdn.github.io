(function(){
    'use strict';

    /**
     * ============================
     * 1) РЕГИСТРАЦИЯ ИСТОЧНИКА "KP"
     * ============================
     * Создаём глобальный объект KP_PLUGIN, который умеет работать
     * через kinopoiskapiunofficial.tech (с proxy, если надо).
     */
    if(!window.KP_PLUGIN){
      window.KP_PLUGIN = (function(){
        const network = new Lampa.Reguest();
        const cache   = {};
        let   total_cnt=0, proxy_cnt=0, good_cnt=0;

        const CACHE_TIME = 1000*60*60;  // 1 час
        const CACHE_SIZE = 100;        // максимум 100 запросов в кэше

        const SOURCE_NAME  = 'KP';
        const SOURCE_TITLE = 'KP';

        // Карты жанров / стран (заполняются при загрузке фильтров)
        let genres_map    = {};
        let countries_map = {};
        // Список жанров/стран
        let menu_list     = [];

        // =============================
        // Основной GET-запрос
        // =============================
        function get(method, oncomplite, onerror){
          let use_proxy = (total_cnt>=10 && good_cnt>total_cnt/2);
          if(!use_proxy) total_cnt++;

          const kp_prox = 'https://cors.kp556.workers.dev:8443/';
          let   url     = 'https://kinopoiskapiunofficial.tech/'+method;

          network.timeout(15000);
          network.silent(
            (use_proxy? kp_prox:'') + url,
            (json)=>{
              oncomplite(json);
            },
            (a,c)=>{
              use_proxy = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
              // Если 429 или cors — попробуем повторить через прокси
              if(use_proxy && (a.status===429 || (a.status===0 && a.statusText!=='timeout'))){
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

        // get + кэш
        function getFromCache(method, oncomplite, onerror){
          const cached = cache[method];
          if(cached){
            let old = Date.now() - CACHE_TIME;
            if(cached.timestamp>old){
              // отдаём из кэша
              setTimeout(()=> oncomplite(cached.value,true),10);
              return;
            }
            else{
              // почистим
              for(let k in cache){
                if(cache[k] && cache[k].timestamp<old) delete cache[k];
              }
            }
          }
          // нет в кэше
          get(method,(json)=>{
            if(json){
              // положим в кэш
              let size=Object.keys(cache).length;
              if(size>=CACHE_SIZE){
                let old = Date.now()-CACHE_TIME;
                for(let k in cache){
                  if(cache[k] && cache[k].timestamp<old) delete cache[k];
                }
              }
              cache[method] = { timestamp:Date.now(), value:json };
            }
            oncomplite(json,false);
          }, onerror);
        }

        function clear(){
          network.clear();
        }

        // Преобразовать элемент из ответа kinopoisk → формат Lampa
        function convertElem(elem){
          let type = (!elem.type || elem.type==='FILM'||elem.type==='VIDEO')? 'movie':'tv';
          let kinopoisk_id = elem.kinopoiskId||elem.filmId||0;
          let kp_rating    = +elem.rating || +elem.ratingKinopoisk||0;

          let title          = elem.nameRu||elem.nameEn||elem.nameOriginal||'';
          let original_title = elem.nameOriginal||elem.nameEn||elem.nameRu||'';

          let adult = false; // если жанр "для взрослых" - выставим adult=true
          let result = {
            source: SOURCE_NAME,
            type,
            adult:false,
            id: SOURCE_NAME+'_'+kinopoisk_id,
            title,
            original_title,
            overview: elem.description||elem.shortDescription||'',
            img: (elem.posterUrlPreview||elem.posterUrl)||'',
            background_image: elem.coverUrl||elem.posterUrl||elem.posterUrlPreview||'',
            genres: (elem.genres||[]).map(g=>{
              if(g.genre==='для взрослых') adult=true;
              let gid = genres_map[g.genre]||0;
              return {id:gid, name:g.genre, url:''};
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
          result.adult=adult;

          // Год
          let first_air_date = (elem.year && elem.year!=='null')? elem.year:'';
          let last_air_date  = '';
          if(type==='tv'){
            if(elem.startYear && elem.startYear!=='null') first_air_date=elem.startYear;
            if(elem.endYear   && elem.endYear  !=='null') last_air_date=elem.endYear;
          }
          // если есть distributions
          if(elem.distributions_obj){
            let dists = elem.distributions_obj.items||[];
            let year_ts = Date.parse(first_air_date);
            let min=null;
            dists.forEach(d=>{
              if(d.date && (d.type==='WORLD_PREMIER'||d.type==='ALL')){
                let ts=Date.parse(d.date);
                if(!isNaN(ts)&&(min===null||ts<min)&&(isNaN(year_ts)||ts>=year_ts)){
                  min=ts;
                  first_air_date=d.date;
                }
              }
            });
          }
          if(type==='tv'){
            result.name = title;
            result.original_name = original_title;
            result.first_air_date = first_air_date;
            if(last_air_date) result.last_air_date=last_air_date;
          }
          else{
            result.release_date = first_air_date;
          }

          // seasons
          if(elem.seasons_obj){
            let _seasons = elem.seasons_obj.items||[];
            result.number_of_seasons = elem.seasons_obj.total||_seasons.length||1;
            result.seasons = _seasons.map(s=>{
              let episodes = (s.episodes||[]).map(e=>{
                return {
                  season_number: e.seasonNumber,
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
          if(elem.staff_obj){
            let cast=[], crew=[];
            elem.staff_obj.forEach(s=>{
              let person = {
                id:s.staffId,
                name: s.nameRu||s.nameEn||'',
                url:'',
                img: s.posterUrl||'',
                character: s.description||'',
                job: Lampa.Utils.capitalizeFirstLetter((s.professionKey||'').toLowerCase())
              };
              if(s.professionKey==='ACTOR') cast.push(person);
              else crew.push(person);
            });
            result.persons = {cast,crew};
          }

          // sequels / simular
          if(elem.sequels_obj){
            result.collection = { results:(elem.sequels_obj||[]).map(convertElem) };
          }
          if(elem.similars_obj){
            result.simular = { results:(elem.similars_obj.items||[]).map(convertElem) };
          }

          return result;
        }

        // Загрузка фильтров (жанры/страны)
        function loadFilters(onready){
          if(menu_list.length){
            onready(menu_list);
          }
          else{
            get('api/v2.2/films/filters',(json)=>{
              if(json.genres){
                json.genres.forEach(g=>{
                  menu_list.push({
                    id:g.id, title:g.genre, url:'',
                    hide:(g.genre==='для взрослых'), separator:!g.genre
                  });
                  genres_map[g.genre]=g.id;
                });
              }
              if(json.countries){
                json.countries.forEach(c=>{
                  countries_map[c.country]=c.id;
                });
              }
              onready(menu_list);
            },()=>{
              onready([]);
            });
          }
        }

        // Базовый list
        function getList(method, params, oncomplite, onerror){
          let page = params.page||1;
          let url  = method;

          // для поиска почистим ключевое слово
          function kpCleanTitle(str){
            return str.replace(/[\s.,:;’'`!?]+/g, ' ').trim()
                      .replace(/^[ \/\\]+/,'')
                      .replace(/[ \/\\]+$/,'')
                      .replace(/\+( *[+\/\\])+/g,'+')
                      .replace(/([+\/\\] *)+\+/g,'+')
                      .replace(/( *[\/\\]+ *)+/g,'+');
          }
          if(params.query){
            let clean_title = kpCleanTitle(decodeURIComponent(params.query));
            if(!clean_title){
              onerror();
              return;
            }
            url = Lampa.Utils.addUrlComponent(url,'keyword='+encodeURIComponent(clean_title));
          }
          url = Lampa.Utils.addUrlComponent(url,'page='+page);

          getFromCache(url,(json,cached)=>{
            let items=[];
            if(json.items && json.items.length) items=json.items;
            else if(json.films && json.films.length) items=json.films;
            else if(json.releases && json.releases.length) items=json.releases;

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
          }, onerror);
        }

        // list
        function list(params={}, oncomplite, onerror){
          let method = params.url;
          if(!method && params.genres){
            method='api/v2.2/films?order=NUM_VOTE&genres='+params.genres;
          }
          getList(method, params, oncomplite, onerror);
        }

        // main
        function main(params={}, oncomplite, onerror){
          // для примера несколько подборок
          let parts = [
            (cb)=>{
              getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',params,(json)=>{
                json.title = Lampa.Lang.translate('title_now_watch');
                cb(json);
              },cb);
            },
            (cb)=>{
              getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS',params,(json)=>{
                json.title = Lampa.Lang.translate('title_top_movie');
                cb(json);
              },cb);
            }
          ];
          loadFilters(()=>{
            Lampa.Api.partNext(parts,5,oncomplite,onerror);
          });
        }

        // full
        function full(params={}, oncomplite, onerror){
          let kinopoisk_id='';
          if(params.card && params.card.source===SOURCE_NAME){
            if(params.card.kinopoisk_id) kinopoisk_id=params.card.kinopoisk_id;
            else if((params.card.id+'').startsWith(SOURCE_NAME+'_')){
              kinopoisk_id = (params.card.id+'').substring(SOURCE_NAME.length+1);
              params.card.kinopoisk_id=kinopoisk_id;
            }
          }
          if(kinopoisk_id){
            getById(kinopoisk_id, params, (json)=>{
              let st = new Lampa.Status(4);
              st.onComplite=oncomplite;
              st.append('movie',json);
              st.append('persons',json && json.persons);
              st.append('collection',json && json.collection);
              st.append('simular',json && json.simular);
            },onerror);
          }
          else onerror();
        }

        // stub
        function category(p={}, c, e){ e(); }
        function person(p={}, cb){ cb({}); }
        function seasons(tv, from, cb){ cb(); }
        function menuCategory(p,cb){ cb([]); }

        // getById
        function getById(id, params, oncomplite, onerror){
          loadFilters(()=>{
            let url='api/v2.2/films/'+id;
            let cached=cache[url];
            if(cached){
              setTimeout(()=>{
                oncomplite( convertElem(cached.value) );
              },10);
            }
            else{
              get(url,(json)=>{
                if(json.kinopoiskId) oncomplite(convertElem(json));
                else onerror();
              },onerror);
            }
          });
        }

        // поиск
        function search(params={}, oncomplite){
          let st=new Lampa.Status(1);
          st.onComplite=(data)=>{
            let items=[];
            if(data.query && data.query.results){
              // разобьём на movie/tv
              let all = data.query.results;
              let query = decodeURIComponent(params.query||'').toLowerCase();
              all = all.filter(e=>{
                let t1=(e.title||'').toLowerCase();
                let t2=(e.original_title||'').toLowerCase();
                return (t1.indexOf(query)!==-1 || t2.indexOf(query)!==-1);
              });
              let movie=Object.assign({},data.query);
              movie.results = all.filter(e=> e.type==='movie');
              movie.title   = Lampa.Lang.translate('menu_movies');
              if(movie.results.length) items.push(movie);

              let tv=Object.assign({},data.query);
              tv.results = all.filter(e=> e.type==='tv');
              tv.title   = Lampa.Lang.translate('menu_tv');
              if(tv.results.length) items.push(tv);
            }
            oncomplite(items);
          };
          getList('api/v2.1/films/search-by-keyword',params,(json)=>{
            st.append('query',json);
          }, st.error.bind(st));
        }

        // discovery
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

        // Возвращаем объект источника
        return {
          SOURCE_NAME, SOURCE_TITLE,
          main, list, full, category, clear,
          person, seasons, menuCategory,
          discovery
        };
      })();
    }


    /**
     * ============================
     * 2) ПОДКЛЮЧАЕМ ИСТОЧНИК "KP" В LAMPA
     * ============================
     */
    (function(){
      if(!window.kp_source_plugin){
        window.kp_source_plugin = true;

        function addPlugin(){
          if(Lampa.Api.sources['KP']){
            Lampa.Noty.show('Источник KP уже установлен или конфликтует');
            return;
          }
          Lampa.Api.sources['KP'] = KP_PLUGIN;
          Object.defineProperty(Lampa.Api.sources,'KP',{
            get:()=>KP_PLUGIN
          });
          let sources;
          if(Lampa.Params.values && Lampa.Params.values.source){
            sources = Object.assign({}, Lampa.Params.values.source);
            sources['KP'] = KP_PLUGIN.SOURCE_TITLE;
          }
          else{
            sources={};
            let ALL=[
              {name:'tmdb',title:'TMDB'},
              {name:'cub',  title:'CUB'},
              {name:'pub',  title:'PUB'},
              {name:'filmix',title:'FILMIX'},
              {name:'KP',   title: KP_PLUGIN.SOURCE_TITLE}
            ];
            ALL.forEach(s=>{
              if(Lampa.Api.sources[s.name]) sources[s.name]=s.title;
            });
          }
          Lampa.Params.select('source', sources, 'tmdb');
        }

        if(window.appready) addPlugin();
        else{
          Lampa.Listener.follow('app',(e)=>{
            if(e.type==='ready') addPlugin();
          });
        }
      }
    })();


    /**
     * ============================
     * 3) СОЗДАЁМ СТРАНИЦУ (КОМПОНЕНТ) "kp_categories"
     *    через Lampa.Component.add(...)
     * ============================
     */
    Lampa.Component.add('kp_categories', function(){
      let scroll, html;
      let listener = new Lampa.Listener();

      this.listener = listener;

      this.create = function(){
        scroll = new Lampa.Scroll({mask:true,over:true});
        let wrap = Lampa.Template.js('items_line',{});

        // Список категорий
        let categories = [
          {
            title:'Популярные Фильмы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-3.17L15.4 3.56C14.79 2.59 13.68 2 12.5 2h-1c-1.18 0-2.29.59-2.9 1.56L6.17 6H3a1 1 0 0 0 0 2h1v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8h1a1 1 0 1 0 0-2zm-8-2h1c.36 0 .69.19.88.5L16.34 6H7.66l1.46-1.5c.19-.31.52-.5.88-.5h1zM7 18V8h10v10H7z"/></svg>`,
            url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'
          },
          {
            title:'Топ Фильмы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L8.6 8H2l5.2 4.2L4.8 18 12 14.4 19.2 18l-2.4-5.8L22 8h-6.6L12 2z"/></svg>`,
            url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
          },
          {
            title:'Популярные российские фильмы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-1.31-.85-2.42-2-2.83V8c0-2.21-1.79-4-4-4h-4V3c0-1.66-1.34-3-3-3S6 .34 6 2v2H2C.9 4 0 4.9 0 6v12c0 1.1.9 2 2 2h2v2c0 1.66 1.34 3 3 3s3-1.34 3-3v-1.17c1.15-.41 2-1.52 2-2.83s-.85-2.42-2-2.83V14h4c2.21 0 4-1.79 4-4v-1.17c1.15-.41 2-1.52 2-2.83zM4 18H2V6h2v12zm5 2c0 .55-.45 1-1 1s-1-.45-1-1v-2h2v2zm0-6c0 .55-.45 1-1 1H4V7h4c.55 0 1 .45 1 1v6zm6-2h-4V6h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2zm5-3.17c-.52.06-1 .48-1 1.17 0 .55-.45 1-1 1h-1V8h1c.55 0 1 .45 1 1 0 .69.48 1.11 1 1.17V8.83z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'
          },
          {
            title:'Популярные российские сериалы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3v2h12v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM3 17V5h18v12H3z"/><path d="M8 8h8v2H8z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'
          },
          {
            title:'Популярные российские мини-сериалы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5v14h18V5H3zm4 12H5V7h2v10zm4 0H9V7h2v10zm6 0h-2V7h2v10z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES'
          },
          {
            title:'Популярные Сериалы',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-3.17L15.4 3.56C14.79 2.59 13.68 2 12.5 2h-1c-1.18 0-2.29.59-2.9 1.56L6.17 6H3a1 1 0 0 0 0 2h1v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8h1a1 1 0 1 0 0-2zm-8-2h1c.36 0 .69.19.88.5L16.34 6H7.66l1.46-1.5c.19-.31.52-.5.88-.5h1zM7 18V8h10v10H7z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES'
          },
          {
            title:'Популярные Телешоу',
            icon:`<svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M17.37 2.29c-.49-.39-1.17-.35-1.62.1l-2.42 2.42c-.19.19-.45.29-.71.29H9.38c-.55 0-1 .45-1 1v2.13c0 .26.1.52.29.71l2.42 2.42c.46.46.49 1.13.1 1.62l-1.34 1.34 4.59 4.59c.46.46.49 1.13.1 1.62l-2.42 2.42c-.19.19-.45.29-.71.29H8.62c-.55 0-1-.45-1-1v-2.13c0-.26-.1-.52-.29-.71l-2.42-2.42c-.46-.46-.49-1.13-.1-1.62l1.34-1.34-4.59-4.59c-.46-.46-.49-1.13-.1-1.62l2.42-2.42c.19-.19.45-.29.71-.29h2.13c.26 0 .52-.1.71-.29l2.42-2.42c.46-.46 1.13-.49 1.62-.1l1.34 1.34 4.59-4.59c.46-.46 1.13-.49 1.62-.1l2.42 2.42c.19.19.29.45.29.71v2.13c0 .55.45 1 1 1h2.13c.26 0 .52.1.71.29l2.42 2.42c.46.46.49 1.13.1 1.62l-1.34 1.34-4.59-4.59z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW'
          }
        ];

        // Генерируем элементы
        categories.forEach(cat=>{
          let item = Lampa.Template.js('menu_item',{});
          item.querySelector('.menu__ico').innerHTML = cat.icon;
          item.querySelector('.menu__text').textContent = cat.title;

          item.addEventListener('hover:enter',()=>{
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
        html = scroll.render();

        // При нажатии «назад»
        this.listener.follow('back',()=>{
          Lampa.Activity.backward();
        });
      };

      this.start = function(){
        // Когда Lampa отдаёт фокус на наш компонент
        Lampa.Controller.add('content',{
          type:'main',
          control:this,
          // Переопределим кнопки
          back: ()=>{
            this.listener.send('back');
          }
        });
        Lampa.Controller.toggle('content');
      };

      // Возврат DOM
      this.render = function(){
        return html;
      };

      // Пауза/стоп/уничтожение
      this.pause = function(){};
      this.stop  = function(){};
      this.destroy = function(){
        scroll&&scroll.destroy();
        scroll=null; html=null;
      };
    });


    /**
     * ============================
     * 4) ДОБАВЛЯЕМ КНОПКУ "КИНопоиск" В МЕНЮ
     * ============================
     */
    function moveItemAfter(item, after){
      setTimeout(()=>{
        $(item).insertAfter($(after));
      },2000);
    }
    const ITEM_TV_SELECTOR = '[data-action="tv"]';

    function addMenuButton(attr, text, icon, onEnter){
      let sel   = '['+attr+']';
      let field = $(`
        <li class="menu__item selector" ${attr}>
          <div class="menu__ico">${icon}</div>
          <div class="menu__text">${text}</div>
        </li>
      `);
      field.on('hover:enter', onEnter);

      if(window.appready){
        Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
        moveItemAfter(sel, ITEM_TV_SELECTOR);
      }
      else{
        Lampa.Listener.follow('app',(e)=>{
          if(e.type==='ready'){
            Lampa.Menu.render().find(ITEM_TV_SELECTOR).after(field);
            moveItemAfter(sel, ITEM_TV_SELECTOR);
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
      ()=>{
        // Переходим на наш компонент kp_categories
        Lampa.Activity.push({
          title:'Кинопоиск',
          component:'kp_categories'
        });
      }
    );

})();
