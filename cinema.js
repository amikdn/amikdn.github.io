(function () {
  'use strict';

  Lampa.Platform.tv();

  ;(function () {
    function initRussianPlugin() {
      // Убрана проверка на origin — теперь работает в любой сборке Lampa

      // SVG иконка для пункта меню "Русское"
      var russianMenuIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/><path stroke-linecap="round" d="M24 44h20"/></g></svg>';

      var today = new Date().toISOString().substr(0, 10);

      // Список русских категорий для плитки "Русское"
      var russianCategories = [
        {
          title: 'Русские фильмы',
          img: 'https://bylampa.github.io/img/rus_movie.jpg',
          request: 'discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=' + today,
        },
        {
          title: 'Русские сериалы',
          img: 'https://bylampa.github.io/img/rus_tv.jpg',
          request: 'discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=' + today,
        },
        {
          title: 'Русские мультфильмы',
          img: 'https://bylampa.github.io/img/rus_mult.jpg',
          request: 'discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=' + today,
        },
        {
          title: 'Start',
          img: 'https://bylampa.github.io/img/start.jpg',
          request: 'discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'Premier',
          img: 'https://bylampa.github.io/img/premier.jpg',
          request: 'discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'KION',
          img: 'https://bylampa.github.io/img/kion.jpg',
          request: 'discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'ИВИ',
          img: 'https://bylampa.github.io/img/ivi.jpg',
          request: 'discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'Okko',
          img: 'https://bylampa.github.io/img/okko.jpg',
          request: 'discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'КиноПоиск',
          img: 'https://bylampa.github.io/img/kinopoisk.jpg',
          request: 'discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'Wink',
          img: 'https://bylampa.github.io/img/wink.jpg',
          request: 'discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'СТС',
          img: 'https://bylampa.github.io/img/sts.jpg',
          request: 'discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
        {
          title: 'ТНТ',
          img: 'https://bylampa.github.io/img/tnt.jpg',
          request: 'discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today,
        },
      ];

      // Компонент категории "Русское" (плитка с сервисами)
      function russianCategoryComponent(data) {
        var category = Lampa.Maker.make('Category', data);

        category.use({
          onCreate: function () {
            this.body.addClass('mapping--grid');
            this.body.addClass('cols--5');

            setTimeout(() => {
              var results = russianCategories.map(item => ({
                title: item.title,
                img: item.img,
                params: { style: { name: 'collection' } },
                module: Lampa.Maker.module('Card').only('Card', 'Callback', 'Style'),
                data: {
                  url: item.request,
                  title: item.title,
                  component: 'category_full',
                  source: 'tmdb',
                  page: 1,
                },
              }));

              this.build({ results: results });
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

        return category;
      }

      // Манифест плагина
      var pluginManifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Русское',
        description: 'Русские новинки',
        component: 'rus_movie',
      };

      if (!Lampa.Manifest.plugins) {
        Lampa.Manifest.plugins = {};
      }
      Lampa.Manifest.plugins.rus_movie = pluginManifest;

      Lampa.Component.add('rus_movie', russianCategoryComponent);

      // Добавляем пункт в меню
      var menuItem = $(
        '<li class="menu__item selector"><div class="menu__ico">' +
        russianMenuIcon +
        '</div><div class="menu__text">' +
        pluginManifest.name +
        '</div></li>'
      );

      menuItem.on('hover:enter', function () {
        Lampa.Activity.push({
          url: '',
          title: pluginManifest.name,
          component: 'rus_movie',
          page: 1,
        });
      });

      $('.menu .menu__list').eq(0).append(menuItem);

      // Класс карточки для эпизодов (используется в некоторых подборках)
      function EpisodeCard(cardData, episodeData) {
        var card = cardData.card || cardData;
        var episode = episodeData.next_episode_to_air || episodeData.episode || {};

        if (card.source === undefined) {
          card.source = 'tmdb';
        }

        Lampa.Arrays.extend(card, {
          title: card.name,
          original_title: card.original_name,
          release_date: card.first_air_date,
        });

        card.release_year = (card.release_date || '0000').slice(0, 4);

        function removeElement(el) {
          if (el) el.remove();
        }

        this.build = function () {
          this.cardElement = Lampa.Template.js('card_episode');
          this.imgPoster = this.cardElement.querySelector('.card__img') || {};
          this.imgEpisode = this.cardElement.querySelector('.full-episode__img img') || {};

          this.cardElement.querySelector('.card__title').innerText = card.title;
          this.cardElement.querySelector('.full-episode__num').innerText = card.unwatched || '';

          if (episode.air_date) {
            this.cardElement.querySelector('.full-episode__name').innerText = episode.name || Lampa.Lang.translate('noname');
            this.cardElement.querySelector('.full-episode__num').innerText = episode.episode_number || '';
            this.cardElement.querySelector('.full-episode__date').innerText = episode.air_date
              ? Lampa.Utils.parseTime(episode.air_date).full
              : '----';
          }

          if (card.release_year === '0000') {
            removeElement(this.cardElement.querySelector('.card__age'));
          } else {
            this.cardElement.querySelector('.card__age').innerText = card.release_year;
          }

          this.cardElement.addEventListener('visible', this.visible.bind(this));
        };

        this.image = function () {
          this.imgPoster.onload = function () {};
          this.imgPoster.onerror = function () {
            this.src = './img/img_broken.svg';
          };

          this.imgEpisode.onload = function () {
            this.cardElement.querySelector('.full-episode__img').classList.add('full-episode__img--loaded');
          }.bind(this);

          this.imgEpisode.onerror = function () {
            this.src = './img/img_broken.svg';
          };
        };

        this.create = function () {
          this.build();

          this.cardElement.addEventListener('hover:focus', () => {
            if (this.onFocus) this.onFocus(this.cardElement, card);
          });

          this.cardElement.addEventListener('hover:hover', () => {
            if (this.onHover) this.onHover(this.cardElement, card);
          });

          this.cardElement.addEventListener('hover:enter', () => {
            if (this.onEnter) this.onEnter(this.cardElement, card);
          });

          this.image();
        };

        this.visible = function () {
          if (card.poster_path) {
            this.imgPoster.src = Lampa.Api.img(card.poster_path);
          } else if (card.profile_path) {
            this.imgPoster.src = Lampa.Api.img(card.profile_path);
          } else if (card.poster) {
            this.imgPoster.src = card.poster;
          } else if (card.img) {
            this.imgPoster.src = card.img;
          } else {
            this.imgPoster.src = './img/img_broken.svg';
          }

          if (episode.still_path) {
            this.imgEpisode.src = Lampa.Api.img(episode.still_path, 'w300');
          } else if (card.backdrop_path) {
            this.imgEpisode.src = Lampa.Api.img(card.backdrop_path, 'w300');
          } else if (episode.img) {
            this.imgEpisode.src = episode.img;
          } else if (card.img) {
            this.imgEpisode.src = card.img;
          } else {
            this.imgEpisode.src = './img/img_broken.svg';
          }

          if (this.onVisible) this.onVisible(this.cardElement, card);
        };

        this.destroy = function () {
          this.imgPoster.onerror = this.imgPoster.onload = function () {};
          this.imgEpisode.onerror = this.imgEpisode.onload = function () {};
          this.imgPoster.src = '';
          this.imgEpisode.src = '';
          removeElement(this.cardElement);
          this.cardElement = null;
          this.imgPoster = null;
          this.imgEpisode = null;
        };

        this.render = function (jquery) {
          return jquery ? $(this.cardElement) : this.cardElement;
        };
      }

      // Модификация главного экрана TMDB (добавление русских подборок)
      function RussianMainSource() {
        this.network = new Lampa.Reguest();

        this.main = function (params, onSuccess, onError) {
          params = params || {};
          onError = onError || function () {};

          var yearsRanges = [
            { start: 2023, end: 2025 },
            { start: 2020, end: 2022 },
            { start: 2017, end: 2019 },
            { start: 2014, end: 2016 },
            { start: 2011, end: 2013 },
          ];

          var randomYears1 = yearsRanges[Math.floor(Math.random() * yearsRanges.length)];
          var randomYears2 = yearsRanges[Math.floor(Math.random() * yearsRanges.length)];

          var dateFrom1 = randomYears1.start + '-01-01';
          var dateTo1 = randomYears1.end + '-12-31';
          var dateFrom2 = randomYears2.start + '-01-01';
          var dateTo2 = randomYears2.end + '-12-31';

          var sortOptions = ['vote_count.desc', 'vote_average.desc', 'popularity.desc', 'revenue.desc'];
          var randomSort1 = sortOptions[Math.floor(Math.random() * sortOptions.length)];
          var randomSort2 = ['vote_count.desc', 'popularity.desc', 'revenue.desc'][Math.floor(Math.random() * 3)];

          var today = new Date().toISOString().substr(0, 10);

          // SVG иконки для строк
          var nowIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M8.8 11.997c0-.974.789-1.763 1.76-1.763c.972 0 1.76.79 1.76 1.763c0 .974-.788 1.764-1.76 1.764c-.971 0-1.76-.79-1.76-1.764m13.03-2.896l-1.217 2.453l-.788-2.319h-.001a1.144 1.144 0 0 0-2.039-.257c-.526.802-1.05 1.61-1.574 2.414l-.278-1.956a1.145 1.145 0 1 0-2.263.342l.049.328a3.675 3.675 0 0 0-6.332.028l.07-.343a1.108 1.108 0 1 0-2.171-.444l-.476 2.338l-1.752-2.718a1.106 1.106 0 0 0-2.012.374L.023 14.353a1.11 1.11 0 0 0 1.087 1.336c.513.004.976-.358 1.084-.892l.476-2.338q.888 1.383 1.78 2.764a1.108 1.108 0 0 0 1.993-.456l.469-2.302a3.68 3.68 0 0 0 3.648 3.219a3.68 3.68 0 0 0 3.57-2.797l.262 1.759c.074.579.548 1.037 1.141 1.037c.427 0 .776-.245.997-.584l1.885-2.895l.905 2.665c.162.475.58.814 1.096.814c.479 0 .855-.288 1.06-.716l2.403-4.845a1.15 1.15 0 0 0-.512-1.54a1.143 1.143 0 0 0-1.538.52" stroke-width="0.5" stroke="currentColor"/></svg>';

          var upcomingIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M2.185 6.758c-1.495 0-2.193.849-2.193 2.171v1.534c0 1.373.246 1.959 1.235 2.58l.763.474c.618.374.698.651.698 1.453v1.354c0 .393-.18.636-.521.636c-.342 0-.522-.228-.522-.636v-2.125H-.008v2.14c0 1.338.683 2.17 2.159 2.17c1.526 0 2.224-.882 2.224-2.17v-1.666c0-1.272-.326-1.927-1.265-2.529l-.763-.49c-.537-.342-.668-.586-.668-1.469v-1.24c0-.394.18-.637.503-.637c.341 0 .537.247.537.636v2.105h1.656V8.93c0-1.307-.698-2.17-2.19-2.17m2.711.162v1.635h1.17v9.797h1.687V8.555h1.17V6.92zm5.066 0l-.943 11.427h1.672l.23-3.053h1.227l.23 3.053h1.706l-.94-11.427Zm4.985 0v11.427h1.687v-4.78h1.024v3.917c0 .652.276.863.276.863h1.687c.004.004-.272-.207-.272-.863v-2.972c0-.949-.357-1.47-1.22-1.65v-.197c.86-.131 1.3-.768 1.3-1.797V8.929c0-1.257-.747-2.009-2.193-2.009zm5.02 0v1.635h1.169v9.797h1.687V8.555h1.17V6.92zm-8.529 1.55h.2l.399 5.274h-.997zm5.2.004h.437c.522 0 .667.212.667 1.06v1.419c0 .817-.18 1.06-.732 1.06h-.372z"/></svg>';

          var rusIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 36 36"><path fill="#ce2028" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36z"/><path fill="#22408c" d="M0 13h36v10H0z"/><path fill="#eee" d="M32 5H4a4 4 0 0 0-4 4v4h36V9a4 4 0 0 0-4-4"/></svg>';

          var premierIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1000 1000"><circle fill="#FDDD2D" cx="500" cy="500" r="500"/><path d="M388.5,352.7926025V646.458313c0,22.3770142,24.1044312,36.4656372,43.6017151,25.484375l259.3798523-146.0874634c19.8106689-11.1577148,19.8726807-39.6622925,0.1107788-50.9061279l-259.3798218-147.578186C412.7141418,316.2770081,388.5,330.3591003,388.5,352.7926025z"/></svg>';

          var kionIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M23.084 8.47h.373c.347 0 .55.174.55.444c0 .256-.19.463-.533.463h-.114v.357h-.276zm.643.455c0-.132-.1-.202-.243-.202h-.124v.408h.125c.143 0 .242-.074.242-.206m-1.646-.202h-.37v-.252h1.013v.252h-.368v1.01h-.275zm-.827 1.01l-.112-.308h-.472l-.108.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.534h.319l-.16-.44ZM19.04 8.47h.792v.249h-.516v.262h.472v.228h-.472v.276h.516v.248h-.792Zm-1.078.252h-.37V8.47h1.013v.252h-.369v1.01h-.274zm-1.993.38a.64.64 0 0 1 .652-.66c.37 0 .652.277.652.66c0 .382-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.26-.18-.407-.372-.407c-.193 0-.372.148-.372.406c0 .261.18.409.372.409c.191 0 .372-.15.372-.409m-1.768.125h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM12.71 8.47h.263v.848h.001l.581-.848h.266v1.263h-.262v-.859h-.002l-.582.859h-.264zm-.8 1.263l-.475-.601v.6h-.276v-1.26h.276v.592l.472-.592h.324l-.505.623l.515.64zm-1.82-.643h.493v.208h-.493Zm-.852.137h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM6.722 8.47h.263v.848h.001l.581-.848h.266v1.263H7.57v-.859h-.002l-.582.859h-.264zm.564-.114c-.178 0-.326-.09-.326-.305h.194c0 .104.04.16.132.16c.091 0 .132-.057.132-.16h.193c.001.216-.146.305-.325.305M5.953 9.734l-.111-.309H5.37l-.109.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.535h.319l-.16-.44Zm-2.033.303c.15 0 .211-.095.211-.322v-.71h.867v1.263h-.276v-1.01h-.322v.453c0 .402-.139.566-.48.566zm-.841-.274h-.517v.506h-.276V8.47h.276v.506h.517V8.47h.274v1.263H2.57ZM.007 9.102a.64.64 0 0 1 .652-.66a.64.64 0 0 1 .652.66c0 .383-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.259-.181-.406-.372-.406c-.193 0-.373.148-.373.406c0 .261.182.409.373.409s.372-.15.372-.409m6.857 1.66v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074zm-7.841-1.3v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074z"/></svg>';

          var iviIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.863 5.537c-1.205 0-2.296.199-3.043.854c-.988.89-1.366 2.446-1.654 4.891a22 22 0 0 0-.149 2.282c0 1.252.195 2.235.77 2.972c.482.62 1.171.983 1.998 1.252c1.504.469 3.698.586 5.237.586c1.16 0 2.033-.176 2.63-.562c.54-.351.953-.843 1.251-1.521c.138-.293.207-.62.242-.714h-.574l-.161.41c-.482 1.228-1.447 1.825-3.17 1.825c-.666 0-1.516.012-2.48-.082c-2.665-.257-3.86-.643-4.525-1.486c-.678-.878-.816-2.329-.517-4.88c.149-1.322.402-3.709 1.47-4.563c.586-.468 1.378-.714 2.664-.714c.62 0 1.47.047 2.274.129c1.711.175 3.916.433 4.732 1.813c.091.164.137.305.137.305h.586c-.046-.117-.08-.234-.15-.363c-.436-.878-1.17-1.38-2.181-1.732c-.724-.257-1.62-.433-2.917-.562c-.724-.07-1.711-.14-2.47-.14M18.82 8.935c-.734 0-1.193.502-1.239 1.145l-.252 3.528c-.057.876.39 1.378 1.112 1.378s1.158-.526 1.48-1.005l1.547-2.395l-.138 2.021c-.057.818.367 1.379 1.158 1.379c.734 0 1.215-.444 1.261-1.11l.264-3.563c.046-.7-.287-1.378-1.204-1.378c-.504 0-.94.21-1.341.83l-1.605 2.464l.149-1.916c.046-.724-.39-1.378-1.192-1.378m-14.206 0c-.733 0-1.192.502-1.238 1.145l-.252 3.528c-.058.876.39 1.378 1.1 1.378s1.158-.526 1.491-1.005l1.548-2.394l-.138 2.02c-.069.818.367 1.379 1.158 1.379c.734 0 1.215-.444 1.261-1.11l.252-3.563c.058-.7-.275-1.378-1.192-1.378c-.516 0-.929.21-1.341.83l-1.605 2.464l.149-1.916c.046-.724-.401-1.378-1.193-1.378m7.602.047c-1.17 0-1.605.479-1.697 1.799l-.15 2.208c-.102 1.471.31 1.939 1.744 1.939h2.43c1.399 0 2.155-.584 2.155-1.636c0-.818-.607-1.332-1.398-1.448c.745-.152 1.387-.643 1.387-1.449c0-.9-.676-1.413-1.938-1.413zm.653 1.063h.562c.562 0 .894.245.894.665c0 .444-.344.701-.963.701h-.516s.046-.794.023-1.366m-.103 2.394h.62c.538 0 .916.222.916.678c0 .526-.39.76-1.043.76h-.676s.114-.725.183-1.438"/></svg>';

          var okkoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.698 9.692a3.286 3.286 0 0 0-3.293 3.285a3.285 3.285 0 0 0 3.293 3.278c1.824 0 3.302-1.462 3.302-3.278a3.29 3.29 0 0 0-3.302-3.285m-.008 5.191c-1.01 0-1.84-.895-1.84-1.906c0-1.018.83-1.913 1.84-1.913c1.018 0 1.848.895 1.848 1.913c0 1.01-.83 1.906-1.848 1.906m-8.476-5.076h-1.602l-1.897 2.637V7.852H7.26v8.288h1.454v-2.637l2.045 2.637h1.716l-2.521-3.204Zm5.634 0h-1.602l-1.897 2.637V7.852h-1.454v8.288h1.454v-2.637l2.045 2.637h1.717l-2.522-3.204ZM3.294 9.199a.73.73 0 0 0 .722-.73a.73.73 0 0 0-.722-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m1.889 0a.73.73 0 0 0 .723-.73a.73.73 0 0 0-.723-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m-3.778 0a.73.73 0 0 0 .722-.73a.73.73 0 0 0-.722-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m1.889.493A3.286 3.286 0 0 0 0 12.977a3.285 3.285 0 0 0 3.294 3.278c1.823 0 3.301-1.462 3.301-3.278a3.29 3.29 0 0 0-3.301-3.285m0 5.191c-1.01 0-1.84-.895-1.84-1.906c0-1.018.83-1.913 1.84-1.913c1.018 0 1.848.895 1.848 1.913c0 1.01-.83 1.906-1.848 1.906"/></svg>';

          var kinopoiskIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12.049 0C5.45 0 .104 5.373.104 12S5.45 24 12.049 24c3.928 0 7.414-1.904 9.592-4.844l-9.803-5.174l6.256 6.418h-3.559l-4.373-6.086V20.4h-2.89V3.6h2.89v6.095L14.535 3.6h3.559l-6.422 6.627l9.98-5.368C19.476 1.911 15.984 0 12.05 0zm10.924 7.133l-9.994 4.027l10.917-.713a12 12 0 0 0-.923-3.314m-10.065 5.68l10.065 4.054c.458-1.036.774-2.149.923-3.314z"/></svg>';

          var winkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M18.644 24.001L7.931 13.288L18.644 2.575L40.069 24L18.644 45.425L7.931 34.712z"/></svg>';

          var stsIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 1000"><path fill-rule="evenodd" clip-rule="evenodd" fill="#F9CA8C" d="M444.4538879,121.4398499h111.1193542V11.2740288H444.4538879V121.4398499z M444.4538879,319.7213135h111.1193542V209.5554199H444.4538879V319.7213135z M936.3792114,319.4742432c42.7337036,0,52.557373-9.7634277,52.557373-52.1082153V99.1432877H888.9332275v220.3309631H936.3792114z M730.2888184,319.4742432h47.5232544l-0.0823364-220.3309631h-99.9991455v168.2227478C677.7305908,309.7379456,687.578125,319.4742432,730.2888184,319.4742432z M322.2405396,267.3660278c0,42.3447876-9.819519,52.1082153-52.5582581,52.1082153h-47.4400482V99.1432877h99.9983063V267.3660278z M111.1219559,319.4742432H63.6236572c-42.7104836,0-52.5579071-9.7362976-52.5579071-52.1082153V99.1432877h100.0562057V319.4742432z M1000,62.9481392C1000,14.3997927,985.4299316,0,936.4047241,0H730.2888184c-49.0736694,0-63.623291,14.4272175-63.623291,63.0777893v0.2741661c0-48.6505737-14.5224609-63.1051483-63.6241455-63.1051483H396.9577942c-49.0736694,0-63.624176,14.4545746-63.624176,63.0777206v-0.2467384C333.3336182,14.4272175,318.7839661,0,269.7102966,0H63.6236572C14.5526257,0,0,14.4272175,0,63.0777893V267.394043c0,48.6524963,14.5526257,63.0773621,63.6236572,63.0773621h206.0866394c49.0736694,0,63.6233215-14.4248657,63.6233215-63.0773621v0.274231c0,48.6525574,14.5776672,63.0773621,63.624176,63.0773621h206.0835876c49.0736084,0,63.6241455-14.4248047,63.6241455-63.0773621v-0.274231c0,48.6524963,14.5496216,63.0773621,63.623291,63.0773621h206.0903931c48.5922241,0,63.3320923-14.1480713,63.6123047-61.6815186L1000,62.9481392z"/></svg>';

          var tntIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1000 330.745636"><path fill-rule="evenodd" clip-rule="evenodd" fill="#F9CA8C" d="M444.4538879,121.4398499h111.1193542V11.2740288H444.4538879V121.4398499z M444.4538879,319.7213135h111.1193542V209.5554199H444.4538879V319.7213135z M936.3792114,319.4742432c42.7337036,0,52.557373-9.7634277,52.557373-52.1082153V99.1432877H888.9332275v220.3309631H936.3792114z M730.2888184,319.4742432h47.5232544l-0.0823364-220.3309631h-99.9991455v168.2227478C677.7305908,309.7379456,687.578125,319.4742432,730.2888184,319.4742432z M322.2405396,267.3660278c0,42.3447876-9.819519,52.1082153-52.5582581,52.1082153h-47.4400482V99.1432877h99.9983063V267.3660278z M111.1219559,319.4742432H63.6236572c-42.7104836,0-52.5579071-9.7362976-52.5579071-52.1082153V99.1432877h100.0562057V319.4742432z M1000,62.9481392C1000,14.3997927,985.4299316,0,936.4047241,0H730.2888184c-49.0736694,0-63.623291,14.4272175-63.623291,63.0777893v0.2741661c0-48.6505737-14.5224609-63.1051483-63.6241455-63.1051483H396.9577942c-49.0736694,0-63.624176,14.4545746-63.624176,63.0777206v-0.2467384C333.3336182,14.4272175,318.7839661,0,269.7102966,0H63.6236572C14.5526257,0,0,14.4272175,0,63.0777893V267.394043c0,48.6524963,14.5526257,63.0773621,63.6236572,63.0773621h206.0866394c49.0736694,0,63.6233215-14.4248657,63.6233215-63.0773621v0.274231c0,48.6525574,14.5776672,63.0773621,63.624176,63.0773621h206.0835876c49.0736084,0,63.6241455-14.4248047,63.6241455-63.0773621v-0.274231c0,48.6524963,14.5496216,63.0773621,63.623291,63.0773621h206.0903931c48.5922241,0,63.3320923-14.1480713,63.6123047-61.6815186L1000,62.9481392z"/></svg>';

          Lampa.Template.add('now_icon', nowIcon);
          Lampa.Template.add('upcoming_icon', upcomingIcon);
          Lampa.Template.add('rus_icon', rusIcon);
          Lampa.Template.add('premier_icon', premierIcon);
          Lampa.Template.add('kion_icon', kionIcon);
          Lampa.Template.add('ivi_icon', iviIcon);
          Lampa.Template.add('okko_icon', okkoIcon);
          Lampa.Template.add('kinopoisk_icon', kinopoiskIcon);
          Lampa.Template.add('wink_icon', winkIcon);
          Lampa.Template.add('sts_icon', stsIcon);
          Lampa.Template.add('tnt_icon', tntIcon);

          var requests = [
            // Теперь смотрят
            function (callback) {
              Lampa.Api.sources.tmdb.get('movie/now_playing', params, function (data) {
                data.title = Lampa.Lang.translate('title_now_watch');
                data.icon_svg = Lampa.Template.string('now_icon');
                data.icon_bgcolor = '#0f7679';
                data.icon_color = '#fff';
                data.results.forEach(item => { item.params = { style: { name: 'collection' } }; });
                data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Тренд дня
            function (callback) {
              Lampa.Api.sources.tmdb.get('trending/all/day', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_day');
                data.icon_svg = Lampa.Template.string('icon_star');
                data.icon_bgcolor = '#fff';
                data.icon_color = '#212121';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Тренд недели
            function (callback) {
              Lampa.Api.sources.tmdb.get('trending/all/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_trend_week');
                data.icon_svg = Lampa.Template.string('icon_star');
                data.icon_bgcolor = '#fff';
                data.icon_color = '#212121';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Русские фильмы
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские фильмы');
                data.icon_svg = Lampa.Template.string('rus_icon');
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.results.forEach(item => { item.params = { style: { name: 'wide' } }; });
                data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Русские сериалы
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские сериалы');
                data.icon_svg = Lampa.Template.string('rus_icon');
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Скоро в кино
            function (callback) {
              Lampa.Api.sources.tmdb.get('movie/upcoming', params, function (data) {
                data.title = Lampa.Lang.translate('title_upcoming');
                data.icon_svg = Lampa.Template.string('upcoming_icon');
                data.icon_bgcolor = '#25b7d3';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Русские мультфильмы
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Русские мультфильмы');
                data.icon_svg = Lampa.Template.string('rus_icon');
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.results.forEach(item => { item.params = { style: { name: 'collection' } }; });
                data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Популярные фильмы
            function (callback) {
              Lampa.Api.sources.tmdb.get('movie/popular', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_movie');
                data.icon_svg = Lampa.Template.string('icon_fire');
                data.icon_bgcolor = '#fff';
                data.icon_color = '#fd4518';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Популярные сериалы
            function (callback) {
              Lampa.Api.sources.tmdb.get('trending/tv/week', params, function (data) {
                data.title = Lampa.Lang.translate('title_popular_tv');
                data.icon_svg = Lampa.Template.string('icon_fire');
                data.icon_bgcolor = '#fff';
                data.icon_color = '#fd4518';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Подборки русских фильмов
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?primary_release_date.gte=' + dateFrom2 + '&primary_release_date.lte=' + dateTo2 + '&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=' + randomSort2, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских фильмов');
                data.icon_svg = Lampa.Template.string('icon_collection');
                data.icon_color = '#fff';
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Подборки русских сериалов
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?first_air_date.gte=' + dateFrom1 + '&first_air_date.lte=' + dateTo1 + '&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=' + randomSort1, params, function (data) {
                data.title = Lampa.Lang.translate('Подборки русских сериалов');
                data.icon_svg = Lampa.Template.string('icon_collection');
                data.icon_color = '#fff';
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Start
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Start');
                data.icon_svg = Lampa.Template.string('start_icon');
                data.icon_bgcolor = '#ff0019';
                data.icon_color = '#fff';
                data.results.forEach(item => { item.params = { style: { name: 'wide' } }; });
                data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Premier
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Premier');
                data.icon_svg = Lampa.Template.string('premier_icon');
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.icon_color = '#fddd2d';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // KION
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('KION');
                data.icon_svg = Lampa.Template.string('kion_icon');
                data.icon_bgcolor = '#792788';
                data.icon_color = '#fff';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // ИВИ
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('IVI');
                data.icon_svg = Lampa.Template.string('ivi_icon');
                data.icon_bgcolor = '#f2144f';
                data.icon_color = '#fff';
                data.results.forEach(item => { item.params = { style: { name: 'collection' } }; });
                data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // OKKO
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('OKKO');
                data.icon_svg = Lampa.Template.string('okko_icon');
                data.icon_bgcolor = '#380c81';
                data.icon_color = '#fff';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // КиноПоиск
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('КиноПоиск');
                data.icon_svg = Lampa.Template.string('kinopoisk_icon');
                data.icon_bgcolor = 'rgba(255,255,255,0.15)';
                data.icon_color = '#fe5d0f';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Wink
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('Wink');
                data.icon_svg = Lampa.Template.string('wink_icon');
                data.icon_bgcolor = '#fff';
                data.icon_color = '#ff5b22';
                data.results.forEach(item => { item.params = { style: { name: 'wide' } }; });
                data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // СТС
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('СТС');
                data.icon_svg = Lampa.Template.string('sts_icon');
                data.icon_bgcolor = '#fff';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // ТНТ
            function (callback) {
              Lampa.Api.sources.tmdb.get('discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=' + today, params, function (data) {
                data.title = Lampa.Lang.translate('ТНТ');
                data.icon_svg = Lampa.Template.string('tnt_icon');
                data.icon_bgcolor = '#fff';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Топ фильмы
            function (callback) {
              Lampa.Api.sources.tmdb.get('movie/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_movie');
                data.icon_svg = Lampa.Template.string('icon_top');
                data.icon_bgcolor = '#e02129';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },

            // Топ сериалы
            function (callback) {
              Lampa.Api.sources.tmdb.get('tv/top_rated', params, function (data) {
                data.title = Lampa.Lang.translate('title_top_tv');
                data.icon_svg = Lampa.Template.string('icon_top');
                data.icon_bgcolor = '#e02129';
                data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') };
                callback(data);
              }, callback);
            },
          ];

          Lampa.ContentRows.call('main', params, requests);

          var position = requests.length + 1;
          Lampa.Arrays.insert(requests, 0, Lampa.Api.partPersons(requests, 6, 'movie', position));

          params.genres.movie.forEach(function (genre) {
            var genreLoader = function (callback) {
              Lampa.Api.sources.tmdb.get('discover/movie?with_genres=' + genre.id, params, function (data) {
                data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''));
                callback(data);
              }, callback);
            };
            requests.push(genreLoader);
          });

          function loadNext(onSuccess, onError) {
            Lampa.Api.partNext(requests, 6, onSuccess, onError);
          }

          return loadNext;
        };
      }

      // Включаем русские подборки на главной, если параметр включён
      if (Lampa.Storage.get('rus_movie_main') !== false) {
        Object.assign(Lampa.Api.sources.tmdb, new RussianMainSource(Lampa.Api.sources.tmdb));
      }

      // Принудительный перезапуск главной при выборе TMDB (для обновления)
      if (Lampa.Storage.get('source') === 'tmdb') {
        var savedSource = Lampa.Storage.get('source');
        var interval = setInterval(function () {
          var activity = Lampa.Activity.active();
          if (activity && activity.component === 'main') {
            clearInterval(interval);
            Lampa.Activity.replace({
              source: savedSource,
              title: Lampa.Lang.translate('title_main') + ' - ' + Lampa.Storage.field('source').toUpperCase(),
            });
          }
        }, 200);
      }

      // Параметр в настройках для включения русских новинок на главной
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'trigger', default: true },
        field: { name: 'Русские новинки на главной', description: 'Показывать подборки русских новинок на главной странице. После изменения параметра приложение нужно перезапустить (работает только с TMDB)' },
        onRender: function (el) {
          setTimeout(() => {
            $('div[data-name="rus_movie_main"]').insertAfter('div[data-name="interface_size"]');
          }, 0);
        },
      });
    }

    if (window.appready) {
      initRussianPlugin();
    } else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
          initRussianPlugin();
        }
      });
    }
  })();
})();
