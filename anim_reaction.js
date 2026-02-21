(function () {
  'use strict'
  Lampa.Platform.tv()

  var REACTIONS_BASE_URL = 'https://amikdn.github.io/img'
  var REACTION_IMAGE_PATHS = {
    shit: REACTIONS_BASE_URL + '/reaction-shit.gif',
    think: REACTIONS_BASE_URL + '/reaction-think.gif',
    bore: REACTIONS_BASE_URL + '/reaction-bore.gif',
    fire: REACTIONS_BASE_URL + '/reaction-fire.gif',
    nice: REACTIONS_BASE_URL + '/reaction-nice.gif',
  }
  var REACTION_TYPES = ['fire', 'nice', 'think', 'bore', 'shit']

  var REACTION_CONFIGS = [
    { selector: '.reaction--shit', url: REACTION_IMAGE_PATHS.shit, type: 'shit' },
    { selector: '.reaction--think', url: REACTION_IMAGE_PATHS.think, type: 'think' },
    { selector: '.reaction--bore', url: REACTION_IMAGE_PATHS.bore, type: 'bore' },
    { selector: '.reaction--fire', url: REACTION_IMAGE_PATHS.fire, type: 'fire' },
    { selector: '.reaction--nice', url: REACTION_IMAGE_PATHS.nice, type: 'nice' },
  ]

  function isAnimatedReactionsInPlayerEnabled() {
    return Lampa.Storage.get('animated_reactions_in_player', true)
  }

  function getReactionTypeFromSrc(src) {
    if (!src) return null
    for (var i = 0; i < REACTION_TYPES.length; i++) {
      if (src.indexOf(REACTION_TYPES[i]) !== -1) return REACTION_TYPES[i]
    }
    return null
  }

  function resetReactionStylesToDefault() {
    try {
      $('.reaction__icon').css({ width: '', height: '' })
      $('.full-start-new__reactions > div').css('padding', '')
    } catch (err) {}
  }

  function restoreOriginalReactions() {
    try {
      REACTION_CONFIGS.forEach(function (config) {
        document.querySelectorAll(config.selector + ' img').forEach(function (el) {
          if (el.dataset.originalSrc) {
            el.src = el.dataset.originalSrc
            delete el.dataset.originalSrc
          }
        })
      })
      document.querySelectorAll('.selectbox-item__icon img[data-original-src]').forEach(function (el) {
        el.src = el.dataset.originalSrc
        delete el.dataset.originalSrc
      })
      resetReactionStylesToDefault()
    } catch (err) {}
  }

  function applyReactionsToSelectbox() {
    try {
      var useAnimated = isAnimatedReactionsInPlayerEnabled()
      document.querySelectorAll('.selectbox-item__icon img').forEach(function (img) {
        var type = getReactionTypeFromSrc(img.src)
        if (!type || !REACTION_IMAGE_PATHS[type]) return
        if (useAnimated) {
          if (!img.dataset.originalSrc && img.src.indexOf(REACTIONS_BASE_URL) === -1) {
            img.dataset.originalSrc = img.src
          }
          img.src = REACTION_IMAGE_PATHS[type]
        } else if (img.dataset.originalSrc) {
          img.src = img.dataset.originalSrc
          delete img.dataset.originalSrc
        }
      })
    } catch (err) {}
  }

  function reaction() {
    try {
      if (Lampa.Activity.active().component !== 'full') return
      if (!isAnimatedReactionsInPlayerEnabled()) {
        restoreOriginalReactions()
        applyReactionsToSelectbox()
        return
      }

      function preloadReactionImage(reactionIndex) {
        if (reactionIndex >= REACTION_CONFIGS.length) return

        var config = REACTION_CONFIGS[reactionIndex]
        var activityBlock = document.querySelector('.activity--active')
        var reactionIconElement = activityBlock
          ? activityBlock.querySelector(config.selector + ' img')
          : null

        if (!reactionIconElement) {
          preloadReactionImage(reactionIndex + 1)
          return
        }

        if (!reactionIconElement.dataset.originalSrc) {
          reactionIconElement.dataset.originalSrc = reactionIconElement.src
        }
        var preloadImage = new Image()
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
      applyReactionsToSelectbox()
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
    if (storageChangeEvent.name === 'animated_reactions_in_player') {
      if (!isAnimatedReactionsInPlayerEnabled()) {
        restoreOriginalReactions()
        applyReactionsToSelectbox()
        setTimeout(restoreOriginalReactions, 150)
        setTimeout(applyReactionsToSelectbox, 150)
        setTimeout(restoreOriginalReactions, 400)
        setTimeout(applyReactionsToSelectbox, 400)
      }
      setTimeout(reaction, 100)
    }
  })

  Lampa.Listener.follow('full', function (fullScreenEvent) {
    if (fullScreenEvent.type === 'complite') reaction()
  })

  (function observeSelectbox() {
    var observer = new MutationObserver(function () {
      if (document.querySelector('.selectbox-item__icon img')) {
        applyReactionsToSelectbox()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })()

  if (Lampa.SettingsApi) {
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { name: 'animated_reactions_in_player', type: 'trigger', default: true },
      field: { name: 'Анимированные реакции' },
      onChange: function () {
        if (!isAnimatedReactionsInPlayerEnabled()) {
          restoreOriginalReactions()
          applyReactionsToSelectbox()
          setTimeout(restoreOriginalReactions, 150)
          setTimeout(applyReactionsToSelectbox, 150)
          setTimeout(restoreOriginalReactions, 400)
          setTimeout(applyReactionsToSelectbox, 400)
        }
        setTimeout(reaction, 100)
      },
      onRender: function (element) {
        setTimeout(function () {
          var anchor = $('div[data-name="interface_size"]')
          if (anchor.length) anchor.after(element)
        }, 0)
      }
    })
  }
})()
