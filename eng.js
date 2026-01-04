(function () {
  'use strict';

  Lampa.Platform.tv();

  function initForeignCollections() {
    const menuIconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <g fill="currentColor">
          <path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3m2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1m2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848z"/>
          <path d="M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5z"/>
        </g>
      </svg>`;

    const today = new Date().toISOString().substr(0, 10);

    const collections = [
      {
        title: 'Дорамы',
        img: 'https://amikdn.github.io/img/dorams.jpg',
        request: `discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=ko&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'Турецкие сериалы',
        img: 'https://amikdn.github.io/img/tur_serials.jpg',
        request: `discover/tv?first_air_date.gte=2020-01-01&without_genres=16&with_original_language=tr&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'Индийские фильмы',
        img: 'https://amikdn.github.io/img/ind_films.jpg',
        request: `discover/movie?primary_release_date.gte=2020-01-01&without_genres=16&with_original_language=hi&vote_average.gte=6&vote_average.lte=10&primary_release_date.lte=${today}`,
      },
      {
        title: 'Netflix',
        img: 'https://amikdn.github.io/img/netflix.jpg',
        request: `discover/tv?with_networks=213&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'Apple TV+',
        img: 'https://amikdn.github.io/img/apple_tv.jpg',
        request: `discover/tv?with_networks=2552&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'Prime Video',
        img: 'https://amikdn.github.io/img/prime_video.jpg',
        request: `discover/tv?with_networks=1024&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'MGM+',
        img: 'https://amikdn.github.io/img/mgm.jpg',
        request: `discover/tv?with_networks=6219&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
      {
        title: 'HBO',
        img: 'https://amikdn.github.io/img/hbo.jpg',
        request: `discover/tv?with_networks=49&first_air_date.gte=2020-01-01&vote_average.gte=6&vote_average.lte=10&first_air_date.lte=${today}`,
      },
    ];

    // Компонент для отображения подборок
    function foreignCollectionsComponent(params) {
      const component = Lampa.Maker.make('Category', params);

      component.use({
        onCreate: function () {
          this.body.addClass('mapping--grid cols--5');

          setTimeout(() => {
            const data = {
              results: collections.map(item => ({
                title: item.title,
                img: item.img,
                params: {
                  style: { name: 'collection' },
                  module: Lampa.Maker.module('Card').only('Card', 'Callback', 'Style'),
                },
                data: {
                  url: item.request,
                  title: item.title,
                  component: 'category_full',
                  source: 'tmdb',
                  page: 1,
                },
              })),
            };

            this.build(data);
            $('.card', this.body).css('text-align', 'center');
          }, 100);
        },
        onInstance: function (instance, cardData) {
          instance.use({
            onlyEnter: function () {
              if (cardData && cardData.data) {
                Lampa.Activity.push(cardData.data);
              }
            },
          });
        },
      });

      return component;
    }

    // Манифест плагина
    const pluginManifest = {
      type: 'video',
      version: '1.0.0',
      name: 'Зарубежное',
      description: 'Зарубежные подборки',
      component: 'inter_movie',
    };

    if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {};
    Lampa.Manifest.plugins.inter_movie = pluginManifest;

    Lampa.Component.add('inter_movie', foreignCollectionsComponent);

    // Добавление пункта в главное меню
    const menuItem = $(`
      <li class="menu__item selector">
        <div class="menu__ico">${menuIconSvg}</div>
        <div class="menu__text">${pluginManifest.name}</div>
      </li>
    `);

    menuItem.on('hover:enter', () => {
      Lampa.Activity.push({
        url: '',
        title: pluginManifest.name,
        component: 'inter_movie',
        page: 1,
      });
    });

    $('.menu .menu__list').eq(0).append(menuItem);
  }

  if (window.appready) {
    initForeignCollections();
  } else {
    Lampa.Listener.follow('app', (e) => {
      if (e.type === 'ready') {
        initForeignCollections();
      }
    });
  }
})();
