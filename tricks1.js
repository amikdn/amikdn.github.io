(function(){
  'use strict';

  /**
   * === Часть 1. Источник «KP» ===
   * Простейший вариант, как в ваших примерах, 
   * регистрируем Lampa.Api.sources['KP'].
   * При переключении «Источник → KP» лампа будет 
   * стучаться на kinopoiskapiunofficial.tech через getList / full / search.
   */
  if(!window.KP_SOURCE){
    window.KP_SOURCE = (function(){
      const network     = new Lampa.Reguest();
      const cache       = {};
      const CACHE_TIME  = 1000 * 60 * 60;
      const CACHE_SIZE  = 100;
      const SOURCE_NAME = 'KP';
      const SOURCE_TITLE= 'КиноПоиск';

      let total_cnt = 0, proxy_cnt = 0, good_cnt = 0;
      let genres_map = {};
      let menu_list  = [];

      // очистка network
      function clear(){
        network.clear();
      }

      // базовый get
      function get(method, oncomplete, onerror){
        // ...
        const kp_prox = 'https://cors.kp556.workers.dev:8443/';
        let use_proxy = total_cnt >= 10 && good_cnt > total_cnt/2;
        if(!use_proxy) total_cnt++;

        const url_main = 'https://kinopoiskapiunofficial.tech/' + method;
        network.timeout(15000);

        // первая попытка без прокси
        network.silent((use_proxy ? kp_prox : '')+url_main, 
          (json)=>{ oncomplete(json); },
          (a,c)=>{
            // если ошибка (429), попробуем с прокси
            use_proxy = !use_proxy && (proxy_cnt<10 || good_cnt>proxy_cnt/2);
            if(use_proxy && (a.status===429 || (a.status===0 && a.statusText!=='timeout'))){
              proxy_cnt++;
              network.timeout(15000);
              network.silent(kp_prox+url_main,(json2)=>{
                good_cnt++;
                oncomplete(json2);
              },onerror,false,{ headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'}});
            }
            else onerror(a,c);
          },
          false,
          { headers:{ 'X-API-KEY':'2a4a0808-81a3-40ae-b0d3-e11335ede616'} }
        );
      }

      // кэш
      function getCache(key){
        const v = cache[key];
        if(v){
          const expired = Date.now() - CACHE_TIME;
          if(v.timestamp > expired){
            return v.value;
          }
          // очистка
          for(let k in cache){
            if(cache[k].timestamp < expired) delete cache[k];
          }
        }
        return null;
      }
      function setCache(key, val){
        const now = Date.now();
        // если кэша слишком много, чистим
        if(Object.keys(cache).length >= CACHE_SIZE){
          const expired = now - CACHE_TIME;
          for(let k in cache){
            if(cache[k].timestamp<expired) delete cache[k];
          }
        }
        cache[key] = { timestamp: now, value: val };
      }

      // упрощённое convert
      function convertElem(elem){
        // elem.type === 'FILM'|'TV_SERIES'...
        // соберём поля Lampa
        let type = (elem.type==='FILM'||elem.type==='VIDEO') ? 'movie' : 'tv';
        let title = elem.nameRu||elem.nameEn||elem.nameOriginal||'';
        let kinopoisk_id = elem.kinopoiskId||elem.filmId||0;
        let rating = +elem.rating||+elem.ratingKinopoisk||0;
        // ...
        return {
          source: SOURCE_NAME,
          type: type,
          title: title,
          original_title: elem.nameOriginal||'',
          id: SOURCE_NAME+'_'+kinopoisk_id,
          img: elem.posterUrlPreview||'',
          vote_average: rating,
          // ...
        };
      }

      function getList(method, params={}, oncomplete, onerror){
        let url = method;
        let page = params.page||1;
        url = Lampa.Utils.addUrlComponent(url, 'page='+page);

        // попробуем взять из кэша
        const fromC = getCache(url);
        if(fromC){
          oncomplete(fromC,true);
          return;
        }

        get(url,(json)=>{
          if(!json) { oncomplete({ results:[] }); return; }

          // items
          let items = [];
          if(json.items) items=json.items;
          else if(json.films) items=json.films;

          let results = items.map(convertElem);
          let pages = json.pagesCount||json.totalPages||1;

          let data = {
            results: results,
            url: method,
            page: page,
            total_pages: pages,
            total_results: 0,
            more: (page<pages)
          };
          setCache(url, data);
          oncomplete(data);
        },(e)=>{
          onerror(e);
        });
      }

      function main(params={}, oncomplete, onerror){
        // несколько подборок
        const parts = [
          // популярные
          (cb)=>{ getList('api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',params,(json)=>{ json.title='Популярные'; cb(json);},cb); },
          // топ
          (cb)=>{ getList('api/v2.2/films/top?type=TOP_250_BEST_FILMS',params,(json)=>{ json.title='Топ фильмы'; cb(json);},cb); },
        ];
        Lampa.Api.partNext(parts,5,oncomplete,onerror);
      }

      function list(params={}, oncomplete, onerror){
        let method = params.url;
        getList(method, params, oncomplete, onerror);
      }

      function full(params={}, oncomplete, onerror){
        // ...
        onerror();
      }

      function search(params={}, oncomplete){
        // ...
        oncomplete([]); // упрощённо
      }

      function kpMenu(opts, done){
        if(menu_list.length){
          done(menu_list);
        }
        else{
          // загружаем список жанров, стран ...
          get('api/v2.2/films/filters',(j)=>{
            // ...
            menu_list.push({id:'34',title:'Российские фильмы',url:'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM'});
            done(menu_list);
          },()=>{
            done([]);
          });
        }
      }

      function category(params={},oncomplete,onerror){
        oncomplete({ results:[] });
      }

      return {
        SOURCE_NAME: SOURCE_NAME,
        SOURCE_TITLE: SOURCE_TITLE,
        main: main,
        list: list,
        full: full,
        search: search,
        menu: kpMenu,
        category: category,
        clear: clear,
        discovery: function(){
          return {
            title: SOURCE_TITLE,
            search: search,
            onCancel: clear
          };
        }
      };
    })();
  }

  // Регистрируем в Lampa.Api.sources['KP'], если ещё не
  (function(){
    if(!Lampa.Api.sources['KP']){
      Lampa.Api.sources['KP'] = KP_SOURCE;
      // добавим в список «источников»
      const old = Lampa.Params.values.source || {};
      old['KP'] = KP_SOURCE.SOURCE_TITLE;
      Lampa.Params.select('source', old, 'tmdb');
    }
  })();


  /**
   * === Часть 2. Компонент «kp_categories» ===
   * Показывает список категорий в виде «карточек» (grid).
   */
  Lampa.Component.add('kp_categories',function(){
    let scroll, html;

    const categories = [
      {
        title: 'Популярные Фильмы',
        url: 'api/v2.2/films/top?type=TOP_100_POPULAR_FILMS',
        icon: '<svg width="60" height="60" ...>...</svg>',
      },
      {
        title: 'Топ Фильмы',
        url: 'api/v2.2/films/top?type=TOP_250_BEST_FILMS',
        icon: '<svg ...>...</svg>',
      },
      {
        title: 'Российские фильмы',
        url: 'api/v2.2/films?order=NUM_VOTE&countries=34&type=FILM',
        icon: '<svg ...>...</svg>',
      },
    ];

    this.create = ()=>{
      // создаём прокручиваемую область
      scroll = new Lampa.Scroll({mask:true,over:true});
      html   = scroll.render();

      // создадим контейнер под карточки
      let cards_box = document.createElement('div');
      cards_box.classList.add('items-cards');

      // генерируем карточки
      categories.forEach(cat=>{
        let card = document.createElement('div');
        card.classList.add('card','selector','card--category');

        // наполнение вручную
        card.innerHTML = `
          <div class="card__view">
            <img src="./img/icon_star.svg" class="card__img" />
            <div class="card__icons">
              <div class="card__icons-inner"></div>
            </div>
            <div class="card__vote">KP</div>
          </div>
          <div class="card__title">${cat.title}</div>
          <div class="card__age">2023</div>
        `;

        // клик
        card.addEventListener('hover:enter',()=>{
          Lampa.Activity.push({
            url: cat.url,
            title: cat.title,
            component: 'category_full',
            source: 'KP',
            card_type: true,
            page: 1
          });
        });

        cards_box.appendChild(card);
      });

      // добавим в scroll
      scroll.body().append(cards_box);

      // Обработка «назад»
      this.listener.follow('back',()=>{
        Lampa.Activity.backward();
      });
    };

    this.start = ()=>{
      // Регистрируем «content», чтобы работали фокус / enter
      Lampa.Controller.add('content',{
        type:'content',
        control: this,
        back: ()=>{
          this.listener.send('back');
        }
      });
      // переключаем фокус
      Lampa.Controller.toggle('content');
    };

    this.render = ()=>{
      return html;
    };

    this.pause   = ()=>{};
    this.stop    = ()=>{};
    this.destroy = ()=>{
      scroll && scroll.destroy();
      scroll=null; html=null;
    };
  });


  /**
   * === Часть 3. Кнопка «Кинопоиск» в меню ===
   */
  (function(){
    const ITEM_TV_SELECTOR = '[data-action="tv"]';

    function addKpMenuButton(){
      let iconKP = `<svg ...>...</svg>`;
      let attr   = 'data-action="kp_menu_custom"';
      let sel    = '['+attr+']';

      let field = $(`
        <li class="menu__item selector" ${attr}>
          <div class="menu__ico">${iconKP}</div>
          <div class="menu__text">Кинопоиск</div>
        </li>
      `);

      field.on('hover:enter',()=>{
        Lampa.Activity.push({
          title: 'Кинопоиск',
          component: 'kp_categories'
        });
      });

      function moveItemAfter(itemSel, afterSel){
        setTimeout(()=>{
          $(itemSel).insertAfter($(afterSel));
        },1500);
      }

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

    addKpMenuButton();
  })();

})();
