 (function () {
  'use strict'
  Lampa.Platform.tv()

  const REACTIONS_BASE_URL = 'https://amikdn.github.io/img'
  const REACTION_IMAGE_PATHS = {
    shit: REACTIONS_BASE_URL + '/reaction-shit.gif',
    think: REACTIONS_BASE_URL + '/reaction-think.gif',
    bore: REACTIONS_BASE_URL + '/reaction-bore.gif',
    fire: REACTIONS_BASE_URL + '/reaction-fire.gif',
    nice: REACTIONS_BASE_URL + '/reaction-nice.gif',
  }

  const REACTION_CONFIGS = [
    { selector: '.reaction--shit', url: REACTION_IMAGE_PATHS.shit },
    { selector: '.reaction--think', url: REACTION_IMAGE_PATHS.think },
    { selector: '.reaction--bore', url: REACTION_IMAGE_PATHS.bore },
    { selector: '.reaction--fire', url: REACTION_IMAGE_PATHS.fire },
    { selector: '.reaction--nice', url: REACTION_IMAGE_PATHS.nice },
  ]

  function reaction() {
    try {
      if (Lampa.Activity.active().component !== 'full') return

      function preloadReactionImage(reactionIndex) {
        if (reactionIndex >= REACTION_CONFIGS.length) return

        const config = REACTION_CONFIGS[reactionIndex]
        const activityBlock = document.querySelector('.activity--active')
        const reactionIconElement = activityBlock
          ? activityBlock.querySelector(config.selector + ' img')
          : null

        if (!reactionIconElement) {
          preloadReactionImage(reactionIndex + 1)
          return
        }

        const preloadImage = new Image()
        preloadImage.onload = preloadImage.onerror = function () {
          reactionIconElement.src = config.url
          reactionIconElement.style.opacity = '1'
          preloadReactionImage(reactionIndex + 1)
        }
        preloadImage.src = config.url
        reactionIconElement.style.opacity = '1'
      }

      preloadReactionImage(0)
      $('.reaction__icon').css('width', '2.5em')
      $('.reaction__icon').css('height', '2.5em')
      if (Lampa.Platform.screen('mobile')) {
        $('.full-start-new__reactions > div').css('padding', '0em')
      }
    } catch (err) {}
  }

  function bell(notificationMessage) {
    if (notificationMessage) Lampa.Bell.push({ text: notificationMessage })
  }
  Lampa.Storage.listener.follow('change', function (storageChangeEvent) {
    if (storageChangeEvent.name === 'activity') reaction()
    if (storageChangeEvent.name === 'mine_reactions') {
      setTimeout(reaction, 200)
    }
  })

  Lampa.Listener.follow('full', function (fullScreenEvent) {
    if (fullScreenEvent.type === 'complite') reaction()
  })
})()
