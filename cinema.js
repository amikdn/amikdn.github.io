;(function () {
  'use strict'

  Lampa.Platform.tv()

  ;(function () {
    function initRussianPlugin() {


      const menuIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 48 48">
          <g fill="none" stroke="currentColor" stroke-width="4">
            <path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/>
            <path stroke-linejoin="round" d="M24 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm0 18a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm-9-9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Zm18 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/>
            <path stroke-linecap="round" d="M24 44h20"/>
          </g>
        </svg>
      `

      const today = new Date().toISOString().substr(0, 10)

      const russianCategories = [
        { title: 'Русские фильмы', img: 'https://bylampa.github.io/img/rus_movie.jpg', request: `discover/movie?sort_by=primary_release_date.desc&with_original_language=ru&vote_average.gte=5&vote_average.lte=9.5&primary_release_date.lte=${today}` },
        { title: 'Русские сериалы', img: 'https://bylampa.github.io/img/rus_tv.jpg', request: `discover/tv?sort_by=first_air_date.desc&with_original_language=ru&air_date.lte=${today}` },
        { title: 'Русские мультфильмы', img: 'https://bylampa.github.io/img/rus_mult.jpg', request: `discover/movie?sort_by=primary_release_date.desc&vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&primary_release_date.lte=${today}` },
        { title: 'Start', img: 'https://bylampa.github.io/img/start.jpg', request: `discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Premier', img: 'https://bylampa.github.io/img/premier.jpg', request: `discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'KION', img: 'https://bylampa.github.io/img/kion.jpg', request: `discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'ИВИ', img: 'https://bylampa.github.io/img/ivi.jpg', request: `discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Okko', img: 'https://bylampa.github.io/img/okko.jpg', request: `discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'КиноПоиск', img: 'https://bylampa.github.io/img/kinopoisk.jpg', request: `discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'Wink', img: 'https://bylampa.github.io/img/wink.jpg', request: `discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'СТС', img: 'https://bylampa.github.io/img/sts.jpg', request: `discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}` },
        { title: 'ТНТ', img: 'https://bylampa.github.io/img/tnt.jpg', request: `discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}` },
      ]

      function russianCategoryComponent(data) {
        const category = Lampa.Maker.make('Category', data)

        category.use({
          onCreate() {
            this.body.addClass('mapping--grid').addClass('cols--5')

            setTimeout(() => {
              const results = russianCategories.map(item => ({
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
              }))

              this.build({ results })
              $('.card', this.body).css('text-align', 'center')
            }, 100)
          },

          onInstance(instance, card) {
            instance.use({
              onlyEnter() {
                if (card && card.data) {
                  Lampa.Activity.push(card.data)
                }
              },
            })
          },
        })

        return category
      }

      const pluginManifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Русское',
        description: 'Русские новинки',
        component: 'rus_movie',
      }

      if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = {}
      Lampa.Manifest.plugins.rus_movie = pluginManifest

      Lampa.Component.add('rus_movie', russianCategoryComponent)

      const menuItem = $(`
        <li class="menu__item selector">
          <div class="menu__ico">${menuIconSvg}</div>
          <div class="menu__text">${pluginManifest.name}</div>
        </li>
      `)

      menuItem.on('hover:enter', () => {
        Lampa.Activity.push({
          url: '',
          title: pluginManifest.name,
          component: 'rus_movie',
          page: 1,
        })
      })

      $('.menu .menu__list').eq(0).append(menuItem)

      // SVG-иконки для строк на главной
      Lampa.Template.add('now_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M8.8 11.997c0-.974.789-1.763 1.76-1.763c.972 0 1.76.79 1.76 1.763c0 .974-.788 1.764-1.76 1.764c-.971 0-1.76-.79-1.76-1.764m13.03-2.896l-1.217 2.453l-.788-2.319h-.001a1.144 1.144 0 0 0-2.039-.257c-.526.802-1.05 1.61-1.574 2.414l-.278-1.956a1.145 1.145 0 1 0-2.263.342l.049.328a3.675 3.675 0 0 0-6.332.028l.07-.343a1.108 1.108 0 1 0-2.171-.444l-.476 2.338l-1.752-2.718a1.106 1.106 0 0 0-2.012.374L.023 14.353a1.11 1.11 0 0 0 1.087 1.336c.513.004.976-.358 1.084-.892l.476-2.338q.888 1.383 1.78 2.764a1.108 1.108 0 0 0 1.993-.456l.469-2.302a3.68 3.68 0 0 0 3.648 3.219a3.68 3.68 0 0 0 3.57-2.797l.262 1.759c.074.579.548 1.037 1.141 1.037c.427 0 .776-.245.997-.584l1.885-2.895l.905 2.665c.162.475.58.814 1.096.814c.479 0 .855-.288 1.06-.716l2.403-4.845a1.15 1.15 0 0 0-.512-1.54a1.143 1.143 0 0 0-1.538.52" stroke-width="0.5" stroke="currentColor"/>
        </svg>
      `)

      Lampa.Template.add('upcoming_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 128 128">
          <path fill="#b40e1c" d="m20.71 44.56l-6.52-5.93s-.27-2.95 2.04-3.89c2.63-1.07 5.16.19 5.16.19l3.99 7.68zm85.99.2l-5.64-4.47l3.79-5.54s1.96-1.59 5.35.1c2.59 1.29 3.23 3.79 2.93 4.56c-.29.77-6.43 5.35-6.43 5.35" stroke-width="3" stroke="#b40e1c"/>
          <path fill="#ffb91f" d="m22.75 43.49l-3.15-.85s-.36-1.49.32-2.81c.71-1.37 2.1-1.22 2.1-1.22s-3.35-1.63-1.89-5.62s5.93-3.11 5.93-3.11s-.1-2.53 1.95-4.09c2.04-1.56 3.6-.39 3.6-.39s-1.58-5.05 2.33-7.39c3.34-2 5.64-.1 5.64-.1s1.35-3.38 5.05-3.45c2.77-.05 3.61 1.02 3.61 1.02s.97-1.95 2.53-2.82c1.56-.88 2.49-.75 2.49-.75s-.71-2.42.04-4.4c1.32-3.5 4.96-4.28 7.68-3.6c3.73.93 3.27 3.51 3.27 3.51s1.89-1.27 3.64-1.07c1.75.19 2.67 1.35 2.67 1.35s1.22-3.58 5.3-3.58c4.09 0 5.25 2.43 5.45 4.28s-1.03 4.03-1.03 4.03s.59.23.77 1.63c.14 1.06-.27 2-.27 2s1.88-1.48 5.63 0c6.22 2.45 4.92 9.07 4.92 9.07s1.8-.21 3.16.37c1.56.67 2.28 1.77 2.28 1.77s.35-2.9 3.99-2.92c3.8-.02 6.91 7.1 6.23 9.14s-2.53 2.53-2.53 2.53s1.69.48 2.32 2.53c.75 2.42.13 4.99.13 4.99s-26.38 16.1-26.67 16s-32.98 2.43-32.98 2.43z" stroke-width="3" stroke="#ffb91f"/>
          <path fill="#fce193" d="M34.84 48.47c0-.21.3-1.08.89-1.46c.73-.47 1.82-.52 1.82-.52s-1.2-.57-1.87-2.45c-.44-1.22.1-2.54.1-2.54s-3.17.15-3.9-2.25s.42-2.71.42-2.71s-1.27-6.81 4.06-6.93c7.29-.16 6.04 9.11 6.04 9.11s1.04 0 1.67.57c.62.57.83 1.15.83 1.15s1.36-2.05 4.58-1.56c7.6 1.15 4.06 8.59 4.06 8.59s-1.41-3.85-3.85-4.01c-2.45-.16-5.47 1.51-5.47 1.51s4.63.57 5.88 3.02s1.15 5.78 1.15 5.78s-9.27 2.71-9.48 2.4c-.22-.3-6.93-7.7-6.93-7.7" stroke-width="3" stroke="#fce193"/>
          <path fill="#e17a2c" d="M40.61 40.35c-.67-.29-2.55 1.36-2.59 2.59s1 2.8 2.24 2.91c1.23.11 2.46-1.16 2.46-2.39c0-.62-1.28-2.75-2.11-3.11" stroke-width="3" stroke="#e17a2c"/>
          <path fill="#fce193" d="M46.27 26.55s-4.99-.72-4.89 3.4c.13 5.46 6.28 4.65 6.33 4.94s.3 2.15.3 2.15s2.43-.28 4.78 1.11s3.36 3.02 3.36 3.02s.48-2.25 1.15-3.21s1.39-1.68 1.39-1.68s0-1.2-.34-2.16c-.24-.69-.81-1.05-.81-1.05s5.4-2.56 2.68-6.81c-3.07-4.79-7.96-.34-7.96-.34s-1.92-2.78-4.31-2.11c-2.4.67-1.68 2.74-1.68 2.74m12.27 17.97s-1.44-4.94 1.25-6.33s4.46.19 4.55-.1s4.27-4.75 7.86-4.65c5.32.14 6.54 3.52 6.66 3.88c.59 1.72-.19 4.51-.19 4.51s2.01-3.12 4.89-2.83s3.2 2.59 3.2 2.59s3.18 1.97 3.03 3.84c-.14 1.87-2.16 3.26-2.16 3.26l-4.89 4.79l-5.27-1.82s-.72-2.4-.72-3.88c0-1.49.14-2.68.14-2.68s-1.44.77-2.44 1.05c-1.01.29-3.12.34-3.12.34s-.08-1.21-2.11-2.59c-4.45-3.02-10.68.62-10.68.62" stroke-width="3" stroke="#fce193"/>
          <path fill="#fce193" d="M60.65 51.18s-1.63-5.92 3.07-6.04c5.61-.14 6.42 4.84 6.62 7.62c.19 2.78-7.24 7.05-7.53 6.9c-.29-.14-7.25-4.42-7.25-4.42s-.53-1.54.64-2.91c1.22-1.45 4.45-1.15 4.45-1.15m31.21-2.73s-1.63-1.34-1.15-3.88s2.44-2.68 2.44-2.68s-1.49-2.3-.77-3.79s1.87-1.82 5.56-1.77s5.56 1.05 6.76 2.35c1.08 1.16.38 4.7.38 4.7s-5.46 6.57-6.09 6.42c-.62-.15-7.13-1.35-7.13-1.35m-15.3-17.11s1.92 1.2 2.54 2.11s1.44 2.64 1.44 2.64s.4-4.68 2.33-6.96c2.11-2.49 4.86-2.39 4.91-2.39c.52 0 1.39-3.88-.62-5.94c-2.52-2.58-6.85-1.68-6.81-1.29s1.58 2.25.58 6.57c-.93 3.94-4.37 5.26-4.37 5.26m-13.42.91c.77.39 2.14-.9 3.31-1.44c1.34-.62 3.07-.86 3.12-1.53s-1.87-3.07-4.65-1.73s-2.64 4.27-1.78 4.7m-41.32 2.32c-.24 2.44 2.25 3.2 2.25 3.2s-.31 2.25.58 3.55c.72 1.05 2.21 2.35 2.83 2.21s2.59-2.01 2.59-2.16c0-.14-.11-5.51-1.25-7.43c-1.58-2.7-6.57-3.7-7 .63m8.73-3.23c.67 0 1.34-1.53 1.73-2.11c.38-.58 1.82-1.53 1.82-1.53s-2.21-1.53-3.6-.14c-1.39 1.38-.96 3.78.05 3.78m5.36-4.36s1.34-.14 2.11-.1c.77.05 2.06.29 2.06.29s.19-1.25 1.58-2.16s2.68-.62 2.68-.62s.29-1.73 1.39-2.49c1.1-.77 1.77-.77 1.77-.77s1.02-2.62-.48-3.6c-4.27-2.78-6.46 2.8-7.19 2.92c-.54.09-2.42-1.78-4.48-.34c-3.5 2.46.56 6.87.56 6.87m13.52-6.28s1.15.29 2.01.81s2.16 1.44 2.16 1.44l6.33-.19s1.39-1.82 3.4-2.64c1.64-.67 3.55-.72 3.55-.72s.18-4.68-3.69-5.9c-4.89-1.53-6.52 3.45-6.52 3.45s-1.44-1.62-3.12-1.58c-3.73.1-4.12 5.33-4.12 5.33" stroke-width="3" stroke="#fce193"/>
          <path fill="#e17a2c" d="M56.57 19.02c-.58 0-3.98 2.92-4.07 3.21c-.1.29.81.77.91 1.05c.1.29 6.23-.38 6.57-.62c.33-.24-2.11-3.64-3.41-3.64m-7.66 9.87c.03.57 2.83 4.31 3.69 4.46s3.7-3.02 2.88-3.74c-.38-.34-3.21.05-3.21.05s-.05-2.11-.29-2.44c-.25-.34-3.12.72-3.07 1.67" stroke-width="3" stroke="#e17a2c"/>
          <path fill="#fce193" d="M55.86 12.5c.73.02 1.39-2.68 2.25-3.55s2.92-1.73 2.44-3.07s-4.17-.96-5.37 1.01c-1.33 2.19-.91 5.56.68 5.61m10.21-.72c.15.66 2.01 1.44 2.3 1.77c.29.34 1.63 1.53 1.63 1.53s3.07-.77 4.89-.29s2.68 1.77 3.21 1.44c.53-.34.24-1.77-.05-2.25s-.86-1.39-.86-1.39s2.76-4.28-.1-4.99c-4.07-1.01-4.89 3.12-5.42 3.21s-2.06-1.53-3.74-1.29c-1.67.25-2.06 1.4-1.86 2.26m2.3 12.32c.68 1.51 2.83 1.63 2.83 1.63s1.05 3.36 3.21 3.64c2.16.29 3.58-1.96 4.03-3.83c.58-2.4.59-7.59-4.75-7.53c-4.03.05-5.75 5.13-5.32 6.09m21.18 17.11c.67-.02.22-3.96 2.34-5.56c2.29-1.73 4.08-1.41 6.43-1.25c2.44.16 4.09.92 4.6.24c.64-.84 1.03-6.7-2.3-7.19c-1.97-.29-2.49 1.63-2.49 1.63s-2.01-.43-3.12 1.58c-.76 1.39-.81 2.3-1.15 2.4c-.15.04-5.29-7.9-9.3-3.07c-4.17 5.03 3.45 9.2 3.45 9.2s.25 2.07 1.54 2.02" stroke-width="3" stroke="#fce193"/>
          <path fill="#e17a2c" d="M74.36 18.88c-.27.18-.38 4.84-.14 4.89s3.26 1.68 3.69 1.25s.43-2.64-.34-4.07c-.48-.92-2.25-2.7-3.21-2.07m-6.38-5.85c-.04.49.62 3.07 1.39 3.16c1.28.16 3.64-1.2 3.88-1.68s-.19-1.87-2.11-2.35c-1.9-.47-3.11.2-3.16.87m.48 29.19c.67.72 2.99-1.24 3.83-.86c.96.43 0 2.92 1.05 3.21s3.16-3.12 2.92-4.6c-.1-.62-1.34-1.44-2.68-1.92s-3.16-.81-3.98-.29s-2.34 3.17-1.14 4.46m28.04 3.45s-.1-3.07.72-4.6c.81-1.53 2.88-1.29 3.21-.91s1.49 3.16 1.49 3.16l-2.44 4.17z" stroke-width="3" stroke="#e17a2c"/>
          <path fill="#dfdfdf" d="m63.35 61.35l-9.56-3.74l-.27-.42c-.48-.75-6.78-1.76-6.78-1.76l-.56-.11l-7.85-1.69l-.22-.38c-.49-.83-6.81-3.08-6.81-3.08l-5.94-2.4l-.16-.39c-.53-1.27-4.55-3.47-4.64-3.29l-1.79-.89c.47-.95 1.96-2.52 4.22-1.61c1.97.79 4.22 3.52 4.71 4.6l3.23 1.67c.79-.5 2.28-1 4.32-.29c2.96 1.04 3.74 3.33 4.35 4.28l6.5 1.4c.69-.56 2.15-1.5 4.1-1.18c3.41.56 4.24 2.53 4.95 3.53l7.49.64c.75-1.03 2.66-3.21 5.63-3.62c2.78-.39 4.81.57 5.63 1.53l7.16-2.41c.6-.93 2.67-3.56 5.91-4.15c3.02-.55 5.39.98 6.48 1.67l4.78-2.45c.51-.86 2.16-3.54 4.68-4.31c3.15-.95 5.17 1.04 5.26 1.11l-1.35 1.48c-.04-.04-6.61 3.69-6.63 3.72l-1.41 2.43l-5.52.36l-.5-.4c-.02-.02-10.13 1.81-10.15 1.84l-.19.35l-9.04 3.04l-.44-.47c-.06-.06-9.59 5.39-9.59 5.39" stroke-width="3" stroke="#dfdfdf"/>
          <path fill="#fff" d="M107.72 46.58c-.23.02-2.11-2.62-4.56-1.6c-2.45 1.03-4.79 5.24-4.79 5.24l-7.63 1.2s-1.03-2.08-3.88-1.28s-5.41 4.3-5.47 4.07s-8.4 1.9-8.4 1.9s-1.65-1.84-4.59-1.11c-3.04.76-4.69 4.49-4.69 4.49l-9.47-1.88s-1.62-2.72-4.07-3.06s-4.04 1.26-4.04 1.26l-7.07-1.72s-1.08-2.96-4.16-3.99s-4.56.28-4.56.28l-4.58-3.11s-1.35-2.22-3.92-3.42c-2.56-1.2-3.3.9-3.3.9L34.5 111.9l30.56 12.43l30.17-13.21c.02.01 13.18-64.61 12.49-64.54" stroke-width="3" stroke="#fff"/>
          <path fill="#ed3d23" d="m20.71 44.56l-.02-.07c-.28-1.31-1.01-4.28-2.74-5.63c-2.25-1.75-3.76-.24-3.76-.24l17.35 72.18l4.24 1.62zm11.25 5.42s-.27-4.51-3.83-5.58c-2.83-.85-2.95 2.06-2.95 2.06l14.07 67.39l5.37 2.16zm15.1 5.21s-1.45-4.85-5.14-5.26s-3.32 2.69-3.32 2.69l9.55 64.86l5.37 2.18zm11.73-1.37c-4.05-.51-4.61 3.56-4.61 3.56l4.19 64.26l6.72 2.7l-1.2-65.18s-.85-4.8-5.1-5.34m23.25.25s.21-5.1-4.35-3.81c-4.56 1.28-5.06 5.55-5.06 5.55l-1.14 65.75l5.66-2.51zm16.91-5.47s-.19-4-4.1-3.19c-4.1.84-4.14 4.97-4.14 4.97l-7.19 65.93l5.46-2.41zm10.44-9.58c-3.36 1.61-3.65 5.93-3.65 5.93l-11.45 66.62l5.37-2.38l13.51-69.84c-.01 0-.84-1.74-3.78-.33" stroke-width="3" stroke="#ed3d23"/>
        </svg>
      `)

      Lampa.Template.add('rus_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 36 36">
          <path fill="#ce2028" d="M36 27a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-4h36z" stroke-width="1" stroke="#ce2028"/>
          <path fill="#22408c" d="M0 13h36v10H0z" stroke-width="1" stroke="#22408c"/>
          <path fill="#eee" d="M32 5H4a4 4 0 0 0-4 4v4h36V9a4 4 0 0 0-4-4" stroke-width="1" stroke="#eee"/>
        </svg>
      `)

      Lampa.Template.add('start_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M2.185 6.758c-1.495 0-2.193.849-2.193 2.171v1.534c0 1.373.246 1.959 1.235 2.58l.763.474c.618.374.698.651.698 1.453v1.354c0 .393-.18.636-.521.636c-.342 0-.522-.228-.522-.636v-2.125H-.008v2.14c0 1.338.683 2.17 2.159 2.17c1.526 0 2.224-.882 2.224-2.17v-1.666c0-1.272-.326-1.927-1.265-2.529l-.763-.49c-.537-.342-.668-.586-.668-1.469v-1.24c0-.394.18-.637.503-.637c.341 0 .537.247.537.636v2.105h1.656V8.93c0-1.307-.698-2.17-2.19-2.17m2.711.162v1.635h1.17v9.797h1.687V8.555h1.17V6.92zm5.066 0l-.943 11.427h1.672l.23-3.053h1.227l.23 3.053h1.706l-.94-11.427Zm4.985 0v11.427h1.687v-4.78h1.024v3.917c0 .652.276.863.276.863h1.687c.004.004-.272-.207-.272-.863v-2.972c0-.949-.357-1.47-1.22-1.65v-.197c.86-.131 1.3-.768 1.3-1.797V8.929c0-1.257-.747-2.009-2.193-2.009zm5.02 0v1.635h1.169v9.797h1.687V8.555h1.17V6.92zm-8.529 1.55h.2l.399 5.274h-.997zm5.2.004h.437c.522 0 .667.212.667 1.06v1.419c0 .817-.18 1.06-.732 1.06h-.372z"/>
        </svg>
      `)

      Lampa.Template.add('premier_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1000 1000">
          <circle fill="#FDDD2D" cx="500" cy="500" r="500"/>
          <path d="M388.5,352.7926025V646.458313c0,22.3770142,24.1044312,36.4656372,43.6017151,25.484375l259.3798523-146.0874634c19.8106689-11.1577148,19.8726807-39.6622925,0.1107788-50.9061279l-259.3798218-147.578186C412.7141418,316.2770081,388.5,330.3591003,388.5,352.7926025z"/>
        </svg>
      `)

      Lampa.Template.add('kion_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M23.084 8.47h.373c.347 0 .55.174.55.444c0 .256-.19.463-.533.463h-.114v.357h-.276zm.643.455c0-.132-.1-.202-.243-.202h-.124v.408h.125c.143 0 .242-.074.242-.206m-1.646-.202h-.37v-.252h1.013v.252h-.368v1.01h-.275zm-.827 1.01l-.112-.308h-.472l-.108.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.534h.319l-.16-.44ZM19.04 8.47h.792v.249h-.516v.262h.472v.228h-.472v.276h.516v.248h-.792Zm-1.078.252h-.37V8.47h1.013v.252h-.369v1.01h-.274zm-1.993.38a.64.64 0 0 1 .652-.66c.37 0 .652.277.652.66c0 .382-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.26-.18-.407-.372-.407c-.193 0-.372.148-.372.406c0 .261.18.409.372.409c.191 0 .372-.15.372-.409m-1.768.125h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM12.71 8.47h.263v.848h.001l.581-.848h.266v1.263h-.262v-.859h-.002l-.582.859h-.264zm-.8 1.263l-.475-.601v.6h-.276v-1.26h.276v.592l.472-.592h.324l-.505.623l.515.64zm-1.82-.643h.493v.208h-.493Zm-.852.137h-.516v.506h-.276V8.47h.276v.506h.516V8.47h.274v1.263h-.274ZM6.722 8.47h.263v.848h.001l.581-.848h.266v1.263H7.57v-.859h-.002l-.582.859h-.264zm.564-.114c-.178 0-.326-.09-.326-.305h.194c0 .104.04.16.132.16c.091 0 .132-.057.132-.16h.193c.001.216-.146.305-.325.305M5.953 9.734l-.111-.309H5.37l-.109.309h-.288l.472-1.263h.319l.479 1.263Zm-.508-.535h.319l-.16-.44Zm-2.033.303c.15 0 .211-.095.211-.322v-.71h.867v1.263h-.276v-1.01h-.322v.453c0 .402-.139.566-.48.566zm-.841-.274h-.517v.506h-.276V8.47h.276v.506h.517V8.47h.274v1.263H2.57ZM.007 9.102a.64.64 0 0 1 .652-.66a.64.64 0 0 1 .652.66c0 .383-.281.66-.652.66a.64.64 0 0 1-.652-.66m1.024 0c0-.259-.181-.406-.372-.406c-.193 0-.373.148-.373.406c0 .261.182.409.373.409s.372-.15.372-.409m6.857 1.66v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074zm-7.841-1.3v5.264a.213.213 0 0 1-.213.213H6.303a.213.213 0 0 1-.213-.213v-5.264c0-.117.096-.212.213-.212h1.372c.118 0 .213.095.213.212M5.742 16l-1.599-2.736l1.516-2.466a.159.159 0 0 0-.13-.249l-1.666.003a.16.16 0 0 0-.132.07l-1.177 2.001h-.688v-1.86a.213.213 0 0 0-.212-.213H.282a.213.213 0 0 0-.213.212v5.264c0 .117.096.213.213.213h1.372a.213.213 0 0 0 .213-.213v-1.853h.836l1.17 1.99a.16.16 0 0 0 .136.078h1.598c.124 0 .2-.135.135-.241m17.99.239a.213.213 0 0 0 .212-.213v-5.264a.213.213 0 0 0-.212-.212h-1.323a.213.213 0 0 0-.212.212l.008 2.693l-2.401-2.903h-1.526a.213.213 0 0 0-.212.213v5.264c0 .117.095.212.212.212h1.32a.21.21 0 0 0 .212-.212v-2.696l2.377 2.906zm-6.216-5.455v5.22c0 .13-.105.235-.235.235H8.672a.235.235 0 0 1-.234-.235v-5.22c0-.13.105-.235.234-.235h8.61c.129 0 .234.106.234.235m-1.787 1.278a.075.075 0 0 0-.09-.073c-.93.186-4.223.214-5.327-.001a.074.074 0 0 0-.088.073v2.583c0 .046.04.08.086.074c.916-.136 4.396-.113 5.336.003a.074.074 0 0 0 .083-.074z"/>
        </svg>
      `)

      Lampa.Template.add('ivi_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M4.863 5.537c-1.205 0-2.296.199-3.043.854c-.988.89-1.366 2.446-1.654 4.891a22 22 0 0 0-.149 2.282c0 1.252.195 2.235.77 2.972c.482.62 1.171.983 1.998 1.252c1.504.469 3.698.586 5.237.586c1.16 0 2.033-.176 2.63-.562c.54-.351.953-.843 1.251-1.521c.138-.293.207-.62.242-.714h-.574l-.161.41c-.482 1.228-1.447 1.825-3.17 1.825c-.666 0-1.516.012-2.48-.082c-2.665-.257-3.86-.643-4.525-1.486c-.678-.878-.816-2.329-.517-4.88c.149-1.322.402-3.709 1.47-4.563c.586-.468 1.378-.714 2.664-.714c.62 0 1.47.047 2.274.129c1.711.175 3.916.433 4.732 1.813c.091.164.137.305.137.305h.586c-.046-.117-.08-.234-.15-.363c-.436-.878-1.17-1.38-2.181-1.732c-.724-.257-1.62-.433-2.917-.562c-.724-.07-1.711-.14-2.47-.14M18.82 8.935c-.734 0-1.193.502-1.239 1.145l-.252 3.528c-.057.876.39 1.378 1.112 1.378s1.158-.526 1.48-1.005l1.547-2.395l-.138 2.021c-.057.818.367 1.379 1.158 1.379c.734 0 1.215-.444 1.261-1.11l.264-3.563c.046-.7-.287-1.378-1.204-1.378c-.504 0-.94.21-1.341.83l-1.605 2.464l.149-1.916c.046-.724-.39-1.378-1.192-1.378m-14.206 0c-.733 0-1.192.502-1.238 1.145l-.252 3.528c-.058.876.39 1.378 1.1 1.378s1.158-.526 1.491-1.005l1.548-2.394l-.138 2.02c-.069.818.367 1.379 1.158 1.379c.734 0 1.215-.444 1.261-1.11l.252-3.563c.058-.7-.275-1.378-1.192-1.378c-.516 0-.929.21-1.341.83l-1.605 2.464l.149-1.916c.046-.724-.401-1.378-1.193-1.378m7.602.047c-1.17 0-1.605.479-1.697 1.799l-.15 2.208c-.102 1.471.31 1.939 1.744 1.939h2.43c1.399 0 2.155-.584 2.155-1.636c0-.818-.607-1.332-1.398-1.448c.745-.152 1.387-.643 1.387-1.449c0-.9-.676-1.413-1.938-1.413zm.653 1.063h.562c.562 0 .894.245.894.665c0 .444-.344.701-.963.701h-.516s.046-.794.023-1.366m-.103 2.394h.62c.538 0 .916.222.916.678c0 .526-.39.76-1.043.76h-.676s.114-.725.183-1.438"/>
        </svg>
      `)

      Lampa.Template.add('okko_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M20.698 9.692a3.286 3.286 0 0 0-3.293 3.285a3.285 3.285 0 0 0 3.293 3.278c1.824 0 3.302-1.462 3.302-3.278a3.29 3.29 0 0 0-3.302-3.285m-.008 5.191c-1.01 0-1.84-.895-1.84-1.906c0-1.018.83-1.913 1.84-1.913c1.018 0 1.848.895 1.848 1.913c0 1.01-.83 1.906-1.848 1.906m-8.476-5.076h-1.602l-1.897 2.637V7.852H7.26v8.288h1.454v-2.637l2.045 2.637h1.716l-2.521-3.204Zm5.634 0h-1.602l-1.897 2.637V7.852h-1.454v8.288h1.454v-2.637l2.045 2.637h1.717l-2.522-3.204ZM3.294 9.199a.73.73 0 0 0 .722-.73a.73.73 0 0 0-.722-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m1.889 0a.73.73 0 0 0 .723-.73a.73.73 0 0 0-.723-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m-3.778 0a.73.73 0 0 0 .722-.73a.73.73 0 0 0-.722-.724a.73.73 0 0 0-.731.723c0 .403.328.731.73.731m1.889.493A3.286 3.286 0 0 0 0 12.977a3.285 3.285 0 0 0 3.294 3.278c1.823 0 3.301-1.462 3.301-3.278a3.29 3.29 0 0 0-3.301-3.285m0 5.191c-1.01 0-1.84-.895-1.84-1.906c0-1.018.83-1.913 1.84-1.913c1.018 0 1.848.895 1.848 1.913c0 1.01-.83 1.906-1.848 1.906"/>
        </svg>
      `)

      Lampa.Template.add('kinopoisk_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12.049 0C5.45 0 .104 5.373.104 12S5.45 24 12.049 24c3.928 0 7.414-1.904 9.592-4.844l-9.803-5.174l6.256 6.418h-3.559l-4.373-6.086V20.4h-2.89V3.6h2.89v6.095L14.535 3.6h3.559l-6.422 6.627l9.98-5.368C19.476 1.911 15.984 0 12.05 0zm10.924 7.133l-9.994 4.027l10.917-.713a12 12 0 0 0-.923-3.314m-10.065 5.68l10.065 4.054c.458-1.036.774-2.149.923-3.314z"/>
        </svg>
      `)

      Lampa.Template.add('wink_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M18.644 24.001L7.931 13.288L18.644 2.575L40.069 24L18.644 45.425L7.931 34.712z"/>
        </svg>
      `)

      Lampa.Template.add('sts_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1000 1000">
          <path fill="#FFCB05" d="M621.4789429,315.4877319v88.1034851h-75.1915283v277.1959534h-87.0960388V403.591217h-75.1650696v-88.1034851H621.4789429z M1000.4725342,542.4277954c-18.784668,81.8861694-91.3382568,142.9196167-177.9834595,142.9196167c-100.9359741,0-182.7425537-82.7610474-182.7425537-184.9165955c0.000061-102.1422424,81.8065796-184.9430847,182.7425537-184.9430847c85.2267456,0,156.8258057,59.0847473,177.0288696,138.9823914h-94.7052612c-15.9874268-29.2971191-46.8753662-49.1555481-82.2971191-49.1555481c-51.9128418,0-93.9894409,42.5802612-93.9894409,95.1162415s42.0764771,95.1295471,93.9894409,95.1295471c37.0257568,0,69.0272827-21.6613159,84.3651733-53.1325684H1000.4725342z M361.1984863,542.4277954c-18.784668,81.8861694-91.3381653,142.9196167-177.983429,142.9196167c-100.9226685,0-182.7425232-82.7610474-182.7425232-184.9165955c0-102.1422424,81.8198624-184.9430847,182.7425232-184.9430847c85.2400818,0,156.8390808,59.0847473,177.0421448,138.9823914h-94.7185364c-15.9742432-29.2971191-46.8621521-49.1555481-82.283844-49.1555481c-51.9129333,0-93.9894409,42.5802612-93.9894409,95.1162415s42.0765076,95.1295471,93.9894409,95.1295471c37.0257263,0,69.0272369-21.6613159,84.3651428-53.1325684H361.1984863z"/>
        </svg>
      `)

      Lampa.Template.add('tnt_icon', `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 1000 330.745636">
          <path fill-rule="evenodd" clip-rule="evenodd" fill="#F9CA8C" d="M444.4538879,121.4398499h111.1193542V11.2740288H444.4538879V121.4398499z M444.4538879,319.7213135h111.1193542V209.5554199H444.4538879V319.7213135z M936.3792114,319.4742432c42.7337036,0,52.557373-9.7634277,52.557373-52.1082153V99.1432877H888.9332275v220.3309631H936.3792114z M730.2888184,319.4742432h47.5232544l-0.0823364-220.3309631h-99.9991455v168.2227478C677.7305908,309.7379456,687.578125,319.4742432,730.2888184,319.4742432z M322.2405396,267.3660278c0,42.3447876-9.819519,52.1082153-52.5582581,52.1082153h-47.4400482V99.1432877h99.9983063V267.3660278z M111.1219559,319.4742432H63.6236572c-42.7104836,0-52.5579071-9.7362976-52.5579071-52.1082153V99.1432877h100.0562057V319.4742432z M1000,62.9481392C1000,14.3997927,985.4299316,0,936.4047241,0H730.2888184c-49.0736694,0-63.623291,14.4272175-63.623291,63.0777893v0.2741661c0-48.6505737-14.5224609-63.1051483-63.6241455-63.1051483H396.9577942c-49.0736694,0-63.624176,14.4545746-63.624176,63.0777206v-0.2467384C333.3336182,14.4272175,318.7839661,0,269.7102966,0H63.6236572C14.5526257,0,0,14.4272175,0,63.0777893V267.394043c0,48.6524963,14.5526257,63.0773621,63.6236572,63.0773621h206.0866394c49.0736694,0,63.6233215-14.4248657,63.6233215-63.0773621v0.274231c0,48.6525574,14.5776672,63.0773621,63.624176,63.0773621h206.0835876c49.0736084,0,63.6241455-14.4248047,63.6241455-63.0773621v-0.274231c0,48.6524963,14.5496216,63.0773621,63.623291,63.0773621h206.0903931c48.5922241,0,63.3320923-14.1480713,63.6123047-61.6815186L1000,62.9481392z"/>
        </svg>
      `)

      class RussianTmdbSource {
        constructor(original) {
          this.network = new Lampa.Reguest()
          this.original = original
        }

        get(url, params, success, error) {
          this.original.get(url, params, success, error)
        }

        main(params = {}, onDone, onError) {
          const yearRanges = [
            { start: 2023, end: 2025 },
            { start: 2020, end: 2022 },
            { start: 2017, end: 2019 },
            { start: 2014, end: 2016 },
            { start: 2011, end: 2013 },
          ]

          const randomRange1 = yearRanges[Math.floor(Math.random() * yearRanges.length)]
          const randomRange2 = yearRanges[Math.floor(Math.random() * yearRanges.length)]

          const sortOptionsMovie = ['vote_count.desc', 'vote_average.desc', 'popularity.desc', 'revenue.desc']
          const sortOptionsTv = ['vote_count.desc', 'popularity.desc', 'revenue.desc']

          const randomSortMovie = sortOptionsMovie[Math.floor(Math.random() * sortOptionsMovie.length)]
          const randomSortTv = sortOptionsTv[Math.floor(Math.random() * sortOptionsTv.length)]

          const requests = [
            cb => this.get('movie/now_playing', params, data => {
              data.title = Lampa.Lang.translate('title_now_watch')
              data.icon_svg = Lampa.Template.string('now_icon')
              data.icon_bgcolor = '#0f7679'
              data.icon_color = '#fff'
              data.results.forEach(item => item.params = { style: { name: 'collection' } })
              data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('trending/all/day', params, data => {
              data.title = Lampa.Lang.translate('title_trend_day')
              data.icon_svg = Lampa.Template.string('icon_star')
              data.icon_bgcolor = '#fff'
              data.icon_color = '#212121'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('trending/all/week', params, data => {
              data.title = Lampa.Lang.translate('title_trend_week')
              data.icon_svg = Lampa.Template.string('icon_star')
              data.icon_bgcolor = '#fff'
              data.icon_color = '#212121'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Русские фильмы')
              data.icon_svg = Lampa.Template.string('rus_icon')
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.results.forEach(item => item.params = { style: { name: 'wide' } })
              data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_original_language=ru&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Русские сериалы')
              data.icon_svg = Lampa.Template.string('rus_icon')
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('movie/upcoming', params, data => {
              data.title = Lampa.Lang.translate('title_upcoming')
              data.icon_svg = Lampa.Template.string('upcoming_icon')
              data.icon_bgcolor = '#25b7d3'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/movie?vote_average.gte=5&vote_average.lte=9.5&with_genres=16&with_original_language=ru&sort_by=primary_release_date.desc&primary_release_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Русские мультфильмы')
              data.icon_svg = Lampa.Template.string('rus_icon')
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.results.forEach(item => item.params = { style: { name: 'collection' } })
              data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('movie/popular', params, data => {
              data.title = Lampa.Lang.translate('title_popular_movie')
              data.icon_svg = Lampa.Template.string('icon_fire')
              data.icon_bgcolor = '#fff'
              data.icon_color = '#fd4518'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('trending/tv/week', params, data => {
              data.title = Lampa.Lang.translate('title_popular_tv')
              data.icon_svg = Lampa.Template.string('icon_fire')
              data.icon_bgcolor = '#fff'
              data.icon_color = '#fd4518'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/movie?primary_release_date.gte=${randomRange1.start}-01-01&primary_release_date.lte=${randomRange1.end}-12-31&vote_average.gte=5&vote_average.lte=9.5&with_original_language=ru&sort_by=${randomSortMovie}`, params, data => {
              data.title = Lampa.Lang.translate('Подборки русских фильмов')
              data.icon_svg = Lampa.Template.string('icon_collection')
              data.icon_color = '#fff'
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?first_air_date.gte=${randomRange2.start}-01-01&first_air_date.lte=${randomRange2.end}-12-31&with_networks=2493|2859|4085|3923|3871|3827|5806|806|1191&sort_by=${randomSortTv}`, params, data => {
              data.title = Lampa.Lang.translate('Подборки русских сериалов')
              data.icon_svg = Lampa.Template.string('icon_collection')
              data.icon_color = '#fff'
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=2493&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Start')
              data.icon_svg = Lampa.Template.string('start_icon')
              data.icon_bgcolor = '#ff0019'
              data.icon_color = '#fff'
              data.results.forEach(item => item.params = { style: { name: 'wide' } })
              data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=2859&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Premier')
              data.icon_svg = Lampa.Template.string('premier_icon')
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.icon_color = '#fddd2d'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=4085&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('KION')
              data.icon_svg = Lampa.Template.string('kion_icon')
              data.icon_bgcolor = '#792788'
              data.icon_color = '#fff'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=3923&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('IVI')
              data.icon_svg = Lampa.Template.string('ivi_icon')
              data.icon_bgcolor = '#f2144f'
              data.icon_color = '#fff'
              data.results.forEach(item => item.params = { style: { name: 'collection' } })
              data.params = { items: { view: 4 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=3871&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('OKKO')
              data.icon_svg = Lampa.Template.string('okko_icon')
              data.icon_bgcolor = '#380c81'
              data.icon_color = '#fff'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=3827&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('КиноПоиск')
              data.icon_svg = Lampa.Template.string('kinopoisk_icon')
              data.icon_bgcolor = 'rgba(255,255,255,0.15)'
              data.icon_color = '#fe5d0f'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=5806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('Wink')
              data.icon_svg = Lampa.Template.string('wink_icon')
              data.icon_bgcolor = '#fff'
              data.icon_color = '#ff5b22'
              data.results.forEach(item => item.params = { style: { name: 'wide' } })
              data.params = { items: { view: 3 }, module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=806&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('СТС')
              data.icon_svg = Lampa.Template.string('sts_icon')
              data.icon_bgcolor = '#fff'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get(`discover/tv?with_networks=1191&sort_by=first_air_date.desc&air_date.lte=${today}`, params, data => {
              data.title = Lampa.Lang.translate('ТНТ')
              data.icon_svg = Lampa.Template.string('tnt_icon')
              data.icon_bgcolor = '#fff'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('movie/top_rated', params, data => {
              data.title = Lampa.Lang.translate('title_top_movie')
              data.icon_svg = Lampa.Template.string('icon_top')
              data.icon_bgcolor = '#e02129'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),

            cb => this.get('tv/top_rated', params, data => {
              data.title = Lampa.Lang.translate('title_top_tv')
              data.icon_svg = Lampa.Template.string('icon_top')
              data.icon_bgcolor = '#e02129'
              data.params = { module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Icon') }
              cb(data)
            }, cb),
          ]

          Lampa.ContentRows.call('main', params, requests)

          const totalRows = requests.length + 1
          Lampa.Arrays.insert(requests, 0, Lampa.Api.partPersons(requests, 6, 'movie', totalRows))

          this.original.genres.movie.forEach(genre => {
            requests.push(cb => this.get(`discover/movie?with_genres=${genre.id}`, params, data => {
              data.title = Lampa.Lang.translate(genre.title.replace(/[^a-z_]/g, ''))
              cb(data)
            }, cb))
          })

          function nextPart(offset, total) {
            Lampa.Api.partNext(requests, 6, offset, total)
          }

          return nextPart(onDone, onError), nextPart
        }
      }

      if (Lampa.Storage.get('rus_movie_main') !== false) {
        Object.assign(Lampa.Api.sources.tmdb, new RussianTmdbSource(Lampa.Api.sources.tmdb))
      }

      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { name: 'rus_movie_main', type: 'trigger', default: true },
        field: {
          name: 'Русские новинки на главной',
          description: 'Показывать подборки русских новинок на главной странице. После изменения перезапустите приложение (только с TMDB)',
        },
        onRender(element) {
          setTimeout(() => {
            $('div[data-name="rus_movie_main"]').insertAfter('div[data-name="interface_size"]')
          }, 0)
        },
      })
    }

    if (window.appready) {
      initRussianPlugin()
    } else {
      Lampa.Listener.follow('app', e => {
        if (e.type === 'ready') initRussianPlugin()
      })
    }
  })()
})()
