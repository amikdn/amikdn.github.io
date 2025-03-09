(function(){
    'use strict';

    /**
     * =====================================
     * 1) СОЗДАЁМ (ИЛИ ПОДКЛЮЧАЕМ) ИСТОЧНИК KP
     * =====================================
     */
    if(!window.KP_PLUGIN){
      window.KP_PLUGIN = (function(){
        // ---------------------------
        // Локальные переменные
        // ---------------------------
        const network = new Lampa.Reguest();
        const cache   = {};
        let total_cnt = 0, proxy_cnt=0, good_cnt=0;
        let genres_map={}, countries_map={}, menu_list=[];
        const CACHE_TIME=1000*60*60, CACHE_SIZE=100;
        const SOURCE_NAME='KP', SOURCE_TITLE='KP';

        // ---------------------------
        // Основной GET (через proxy при 429)
        // ---------------------------
        function get(method,onok,onerr){
          let use_proxy=(total_cnt>=10 && good_cnt>total_cnt/2);
          if(!use_proxy) total_cnt++;

          const prox='https://cors.kp556.workers.dev:8443/';
          let url='https://kinopoiskapiunofficial.tech/'+method;

          network.timeout(15000);
          network.silent(
            (use_proxy?prox:'')+url,
            json=>onok(json),
            (a,c)=>{
              use_proxy=!use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
              if(use_proxy && (a.status===429 || (a.status===0 && a.statusText!=='timeout'))){
                proxy_cnt++;
                network.timeout(15000);
                network.silent(
                  prox+url,
                  json2=>{
                    good_cnt++;
                    onok(json2);
                  },
                  onerr,false,
                  {headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}}
                );
              }
              else onerr(a,c);
            },
            false,
            {headers:{'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}}
          );
        }
        // get + cache
        function getFromCache(method,onok,onerr){
          let c=cache[method];
          if(c){
            let old=Date.now()-CACHE_TIME;
            if(c.timestamp>old){
              setTimeout(()=>onok(c.value,true),10);
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
              let size=Object.keys(cache).length;
              if(size>=CACHE_SIZE){
                let old=Date.now()-CACHE_TIME;
                for(let k in cache){
                  if(cache[k] && cache[k].timestamp<old) delete cache[k];
                }
              }
              cache[method]={timestamp:Date.now(), value:json};
            }
            onok(json,false);
          },onerr);
        }
        function clear(){ network.clear(); }

        // ---------------------------
        // Преобразование ответа KP → формат Lampa
        // ---------------------------
        function convertElem(elem){
          let type=(!elem.type||elem.type==='FILM'||elem.type==='VIDEO')?'movie':'tv';
          let kinopoisk_id = elem.kinopoiskId||elem.filmId||0;
          let kp_rating    = +elem.rating||+elem.ratingKinopoisk||0;
          let title        = elem.nameRu||elem.nameEn||elem.nameOriginal||'';
          let orig_title   = elem.nameOriginal||elem.nameEn||elem.nameRu||'';
          let adult=false;

          let result={
            source:SOURCE_NAME,
            type,
            adult:false,
            id: SOURCE_NAME+'_'+kinopoisk_id,
            title,
            original_title:orig_title,
            overview: elem.description||elem.shortDescription||'',
            img: (elem.posterUrlPreview||elem.posterUrl)||'',
            background_image: elem.coverUrl||elem.posterUrl||elem.posterUrlPreview||'',
            genres: (elem.genres||[]).map(g=>{
              if(g.genre==='для взрослых') adult=true;
              return {id:(genres_map[g.genre]||0), name:g.genre, url:''};
            }),
            production_companies:[],
            production_countries:(elem.countries||[]).map(c=>({name:c.country})),
            vote_average: kp_rating,
            vote_count:   elem.ratingVoteCount||elem.ratingKinopoiskVoteCount||0,
            kinopoisk_id,
            kp_rating: kp_rating,
            imdb_id:   elem.imdbId||'',
            imdb_rating: elem.ratingImdb||0
          };
          result.adult=adult;

          // год
          let first_air_date = (elem.year && elem.year!=='null')? elem.year:'';
          let last_air_date='';
          if(type==='tv'){
            if(elem.startYear && elem.startYear!=='null') first_air_date=elem.startYear;
            if(elem.endYear   && elem.endYear  !=='null') last_air_date=elem.endYear;
          }
          // seasons
          if(elem.seasons_obj){
            let s=(elem.seasons_obj.items||[]).map(s=>{
              let eps=(s.episodes||[]).map(e=>{
                return {
                  season_number:e.seasonNumber,
                  episode_number:e.episodeNumber,
                  name: e.nameRu||e.nameEn||('S'+e.seasonNumber+' / '+Lampa.Lang.translate('torrent_serial_episode')+' '+e.episodeNumber),
                  overview:e.synopsis||'',
                  air_date:e.releaseDate
                };
              });
              return {
                season_number:s.number,
                episode_count:eps.length,
                episodes:eps,
                name:Lampa.Lang.translate('torrent_serial_season')+' '+s.number,
                overview:''
              };
            });
            result.seasons=s;
            result.number_of_seasons=s.length||1;
            let epcount=0; s.forEach(ss=>epcount+=ss.episode_count);
            result.number_of_episodes=epcount;
          }
          // staff
          if(elem.staff_obj){
            let cast=[], crew=[];
            elem.staff_obj.forEach(s=>{
              let p={
                id:s.staffId,
                name:s.nameRu||s.nameEn||'',
                url:'',
                img:s.posterUrl||'',
                character:s.description||'',
                job: Lampa.Utils.capitalizeFirstLetter((s.professionKey||'').toLowerCase())
              };
              if(s.professionKey==='ACTOR') cast.push(p);
              else crew.push(p);
            });
            result.persons={cast,crew};
          }
          // sequels
          if(elem.sequels_obj){
            result.collection={results:(elem.sequels_obj||[]).map(convertElem)};
          }
          // similars
          if(elem.similars_obj){
            result.simular={results:(elem.similars_obj.items||[]).map(convertElem)};
          }
          // tv or movie
          if(type==='tv'){
            result.name=title; result.original_name=orig_title;
            result.first_air_date=first_air_date;
            if(last_air_date) result.last_air_date=last_air_date;
          }
          else result.release_date=first_air_date;

          return result;
        }

        // ---------------------------
        // Загрузка фильтров (жанры/страны)
        // ---------------------------
        function loadFilters(cb){
          if(menu_list.length) cb(menu_list);
          else{
            get('api/v2.2/films/filters',(json)=>{
              if(json.genres){
                json.genres.forEach(g=>{
                  menu_list.push({
                    id:g.id,
                    title:g.genre,
                    hide:(g.genre==='для взрослых'),
                    separator:!g.genre
                  });
                  genres_map[g.genre]=g.id;
                });
              }
              if(json.countries){
                json.countries.forEach(c=>{
                  countries_map[c.country]=c.id;
                });
              }
              cb(menu_list);
            },()=>cb([]));
          }
        }

        // ---------------------------
        // getList
        // ---------------------------
        function getList(method, params, onok, onerr){
          let page=params.page||1;
          let url=method;
          // для поиска
          function kpCleanTitle(str){
            return str.replace(/[\s.,:;’'`!?]+/g,' ').trim()
                      .replace(/^[ \/\\]+/,'')
                      .replace(/[ \/\\]+$/,'')
                      .replace(/\+( *[+\/\\])+/g,'+')
                      .replace(/([+\/\\] *)+\+/g,'+')
                      .replace(/( *[\/\\]+ *)+/g,'+');
          }
          if(params.query){
            let cl=kpCleanTitle(decodeURIComponent(params.query));
            if(!cl){ onerr();return; }
            url=Lampa.Utils.addUrlComponent(url,'keyword='+encodeURIComponent(cl));
          }
          url=Lampa.Utils.addUrlComponent(url,'page='+page);

          getFromCache(url,(json)=>{
            let items=[];
            if(json.items&&json.items.length) items=json.items;
            else if(json.films&&json.films.length) items=json.films;
            else if(json.releases&&json.releases.length) items=json.releases;

            let results=items.map(convertElem).filter(e=>!e.adult);
            let total_pages=json.pagesCount||json.totalPages||1;
            onok({
              results,
              url:method,
              page,
              total_pages,
              total_results:0,
              more:total_pages>page
            });
          }, onerr);
        }

        // ---------------------------
        // API: list, main, full, ...
        // ---------------------------
        function list(params={},onok,onerr){
          let m=params.url||'';
          if(!m && params.genres){
            m='api/v2.2/films?order=NUM_VOTE&genres='+params.genres;
          }
          getList(m, params, onok, onerr);
        }
        function main(params={},onok,onerr){
          let tasks=[
            (cb)=>{
              getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',params,(js)=>{
                js.title=Lampa.Lang.translate('title_now_watch');
                cb(js);
              },cb);
            },
            (cb)=>{
              getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS',params,(js)=>{
                js.title=Lampa.Lang.translate('title_top_movie');
                cb(js);
              },cb);
            }
          ];
          loadFilters(()=>{
            Lampa.Api.partNext(tasks,5,onok,onerr);
          });
        }
        function full(params={},onok,onerr){
          let kid='';
          if(params.card&&params.card.source===SOURCE_NAME){
            if(params.card.kinopoisk_id) kid=params.card.kinopoisk_id;
            else if((params.card.id+'').startsWith(SOURCE_NAME+'_')){
              kid=(params.card.id+'').substring(SOURCE_NAME.length+1);
              params.card.kinopoisk_id=kid;
            }
          }
          if(kid){
            get('api/v2.2/films/'+kid,(film)=>{
              if(film.kinopoiskId){
                let item=convertElem(film);
                let st=new Lampa.Status(4);
                st.onComplite=onok;
                st.append('movie', item);
                st.append('persons', item.persons);
                st.append('collection', item.collection);
                st.append('simular', item.simular);
              }
              else onerr();
            },onerr);
          }
          else onerr();
        }
        function category(p={},c,e){ e(); }
        function person(p={},c){ c({}); }
        function seasons(tv, from, cb){ cb(); }
        function menuCategory(p,c){ c([]); }

        // поиск
        function search(params={},onok){
          let st=new Lampa.Status(1);
          st.onComplite=(data)=>{
            let items=[];
            if(data.query&&data.query.results){
              let all=data.query.results;
              let query=decodeURIComponent(params.query||'').toLowerCase();
              all=all.filter(e=>{
                let t1=(e.title||'').toLowerCase();
                let t2=(e.original_title||'').toLowerCase();
                return (t1.indexOf(query)!==-1 || t2.indexOf(query)!==-1);
              });
              let mov=Object.assign({},data.query);
              mov.results=all.filter(e=>e.type==='movie');
              mov.title=Lampa.Lang.translate('menu_movies');
              if(mov.results.length) items.push(mov);

              let tv=Object.assign({},data.query);
              tv.results=all.filter(e=>e.type==='tv');
              tv.title=Lampa.Lang.translate('menu_tv');
              if(tv.results.length) items.push(tv);
            }
            onok(items);
          };
          getList('api/v2.1/films/search-by-keyword',params,(js)=>{
            st.append('query',js);
          }, st.error.bind(st));
        }
        function discovery(){
          return {
            title:SOURCE_TITLE,
            search,
            params:{align_left:true,object:{source:SOURCE_NAME}},
            onMore:(p)=>{
              Lampa.Activity.push({
                url:'api/v2.1/films/search-by-keyword',
                title:Lampa.Lang.translate('search')+' - '+p.query,
                component:'category_full',
                page:1,
                query:encodeURIComponent(p.query),
                source:SOURCE_NAME
              });
            },
            onCancel: clear
          };
        }

        // Возвращаем
        return {
          SOURCE_NAME,SOURCE_TITLE,
          main,list,full,category,clear,
          person,seasons,menuCategory,
          discovery
        };
      })();
    }

    /**
     * =====================================
     * 2) РЕГИСТРИРУЕМ ИСТОЧНИК KP В LAMPA
     * =====================================
     */
    (function(){
      if(!window.kp_source_plugin){
        window.kp_source_plugin=true;

        function addPlugin(){
          if(Lampa.Api.sources['KP']){
            Lampa.Noty.show('Источник KP уже есть');
            return;
          }
          Lampa.Api.sources['KP']=KP_PLUGIN;
          Object.defineProperty(Lampa.Api.sources,'KP',{get:()=>KP_PLUGIN});

          let src;
          if(Lampa.Params.values && Lampa.Params.values.source){
            src=Object.assign({}, Lampa.Params.values.source);
            src['KP']=KP_PLUGIN.SOURCE_TITLE;
          }
          else{
            src={};
            let arr=[
              {name:'tmdb',title:'TMDB'},
              {name:'cub',title:'CUB'},
              {name:'pub',title:'PUB'},
              {name:'filmix',title:'FILMIX'},
              {name:'KP',title:KP_PLUGIN.SOURCE_TITLE}
            ];
            arr.forEach(x=>{
              if(Lampa.Api.sources[x.name]) src[x.name]=x.title;
            });
          }
          Lampa.Params.select('source',src,'tmdb');
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
     * =====================================
     * 3) КОМПОНЕНТ "kp_categories"
     * =====================================
     */
    Lampa.Component.add('kp_categories',function(){
      let scroll, html;
      let listener=new Lampa.Listener();
      this.listener=listener;

      this.create=function(){
        scroll=new Lampa.Scroll({mask:true,over:true});
        let container=document.createElement('div');
        container.classList.add('kp-categories-container');

        // Список наших категорий
        let categories=[
          {
            title:'Популярные Фильмы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6h-3.17L15.4 3.56C14.79 2.59 13.68 2 12.5 2h-1c-1.18 0-2.29.59-2.9 1.56L6.17 6H3a1 1 0 1 0 0 2h1v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8h1a1 1 0 1 0 0-2zM9.63 6l.87-1.2c.19-.31.52-.5.88-.5h1c.36 0 .69.19.88.5L14.37 6H9.63z"/></svg>`,
            url:'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS'
          },
          {
            title:'Топ Фильмы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L8.59 8H2v2h5.59l3.41 6 3.41-6H22V8h-6.59L12 2zM4 16v2h16v-2H4zm0 4v2h16v-2H4z"/></svg>`,
            url:'api/v2.2/films/top?type=TOP_250_BEST_FILMS'
          },
          {
            title:'Популярные российские фильмы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v4h2V5h18v14H3v-4H1v4c0 1.1.9 2 2 2h3v2h12v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 17l4-4-4-4v8z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'
          },
          {
            title:'Популярные российские сериалы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M21 4H3c-1.1 0-2 .9-2 2v3h2V6h18v12H3v-3H1v3c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7h-2v3H8l4 4 4-4h-3v-3zM8 9h3V6h2v3h3l-4 4-4-4z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=TV_SERIES'
          },
          {
            title:'Популярные российские мини-сериалы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M2 6v2h2v12h16V8h2V6H2zm16 12H6V8h12v10z"/><path d="M8 10h2v4H8zm6 0h2v4h-2z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=MINI_SERIES'
          },
          {
            title:'Популярные Сериалы',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M22 6h-3.17L15.4 3.56A2.99 2.99 0 0 0 12.5 2h-1c-1.07 0-2.04.56-2.6 1.44L6.17 6H3a1 1 0 1 0 0 2h1v10c0 1.1.9 2 2 2h3v2h6v-2h3c1.1 0 2-.9 2-2V8h1a1 1 0 1 0 0-2zM9.63 6l.87-1.2c.19-.31.52-.5.88-.5h1c.36 0 .69.19.88.5L14.37 6H9.63z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SERIES'
          },
          {
            title:'Популярные Телешоу',
            icon:`<svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-2.76 0-5 2.24-5 5v1H4c-1.1 0-2 .9-2 2v6c0 2.21 1.79 4 4 4h3v2h6v-2h3c2.21 0 4-1.79 4-4v-6c0-1.1-.9-2-2-2h-3V7c0-2.76-2.24-5-5-5zm3 6v1H9V8h6zM6 11h12v6c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-6z"/></svg>`,
            url:'api/v2.2/films?order=NUM_VOTE&type=TV_SHOW'
          }
        ];

        categories.forEach(cat=>{
          let item=document.createElement('div');
          item.classList.add('folder','folder--category','selector');

          // Содержимое
          let iconBox = `<div class="folder__icon">${cat.icon}</div>`;
          let textBox = `<div class="folder__name">${cat.title}</div>`;
          item.innerHTML= iconBox + textBox;

          item.addEventListener('hover:enter',()=>{
            Lampa.Activity.push({
              url:cat.url,
              title:cat.title,
              component:'category_full',
              source:'KP',
              card_type:true,
              page:1
            });
          });

          container.appendChild(item);
        });

        scroll.body().appendChild(container);
        html=scroll.render();

        // При нажатии «назад»
        this.listener.follow('back',()=>{
          Lampa.Activity.backward();
        });
      };

      this.start=function(){
        Lampa.Controller.add('content',{
          type:'main',
          control:this,
          back:()=>{
            this.listener.send('back');
          }
        });
        Lampa.Controller.toggle('content');
      };
      this.render=function(){ return html; };
      this.pause=function(){};
      this.stop=function(){};
      this.destroy=function(){
        scroll&&scroll.destroy(); scroll=null; html=null;
      };
    });

    /**
     * =====================================
     * 4) ДОБАВЛЯЕМ КНОПКУ "КИНОПОИСК" В МЕНЮ
     * =====================================
     */
    function moveItemAfter(sel, after){
      setTimeout(()=>{
        $(sel).insertAfter($(after));
      },2000);
    }
    const ITEM_TV_SELECTOR='[data-action="tv"]';

    function addMenuButton(attr, text, icon, onEnter){
      let sel='['+attr+']';
      let field=$(`
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

    let iconKP=`
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
        Lampa.Activity.push({
          title:'Кинопоиск',
          component:'kp_categories'
        });
      }
    );

})();
