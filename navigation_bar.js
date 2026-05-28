(function () {
  'use strict';

  var Storage = Lampa.Storage;
  var Lang = Lampa.Lang;
  var Platform = Lampa.Platform;

  Lang.add({
    nav_ext_settings_title: {
      en: 'Navigation Bar',
      ru: 'Навигационная панель'
    }
  });

  var config = {
    version: '1.0.0',
    plugin_name: 'navigation_bar',
    menuButtons: []
  };

  function t(key) {
    return Lang.translate(key) || key;
  }

  function extractMenuButtons() {
    var menuItems = [];
    var menuElement = document.querySelector('.menu__list');

    if (!menuElement) {
      return menuItems;
    }

    var items = menuElement.querySelectorAll('.menu__item[data-action]');

    items.forEach(function (item, index) {
      var action = item.getAttribute('data-action');
      var textElement = item.querySelector('.menu__text');
      var iconElement = item.querySelector('.menu__ico svg use');

      if (action && textElement) {
        var iconHref = iconElement ? iconElement.getAttribute('xlink:href') : null;
        var sprite = iconHref ? iconHref.replace('#sprite-', '') : 'home';

        menuItems.push({
          action: action,
          title: textElement.textContent.trim(),
          sprite: sprite,
          order: index,
          setting_key: 'nav_ext_enable_' + action
        });
      }
    });

    return menuItems;
  }

  function isButtonEnabled(buttonConfig) {
    return Storage.get(buttonConfig.setting_key, false);
  }

  function createButton(buttonConfig) {
    var html = '<div class="navigation-bar__item nav-ext-item" data-action="' + buttonConfig.action + '">';
    html += '    <div class="navigation-bar__icon">';
    html += '        <svg><use xlink:href="#sprite-' + buttonConfig.sprite + '"></use></svg>';
    html += '    </div>';
    html += '    <div class="navigation-bar__label">' + buttonConfig.title + '</div>';
    html += '</div>';
    return html;
  }

  function handleAction(action) {
    var menuItem = document.querySelector('.menu__item[data-action="' + action + '"]');

    if (menuItem) {
      $(menuItem).trigger('hover:enter');
      if (Lampa.Menu && Lampa.Menu.close) {
        Lampa.Menu.close();
      }
    } else {
      console.warn('NavBarExtension', 'Menu item not found for action:', action);
    }
  }

  function removeButtons() {
    var customButtons = document.querySelectorAll('.nav-ext-item');
    customButtons.forEach(function (btn) {
      btn.remove();
    });
  }

  function insertButtons() {
    var Platform = Lampa.Platform;

    if (!Platform.screen('mobile')) {
      return;
    }

    var navigationBar = document.querySelector('.navigation-bar__body');
    if (!navigationBar) return;

    removeButtons();

    if (config.menuButtons.length === 0) {
      config.menuButtons = extractMenuButtons();
      console.log('NavBarExtension', 'Extracted', config.menuButtons.length, 'buttons from menu');
    }

    var backButton = navigationBar.querySelector('[data-action="back"]');
    var searchButton = navigationBar.querySelector('[data-action="search"]');
    var mainButton = navigationBar.querySelector('[data-action="main"]');
    var settingsButton = navigationBar.querySelector('[data-action="settings"]');

    if (backButton) {
      backButton.classList.add('nav-ext-standard');
      backButton.style.order = '1';
    }
    if (searchButton) {
      searchButton.classList.add('nav-ext-standard');
      searchButton.style.order = '2';
    }
    if (mainButton) {
      mainButton.classList.add('nav-ext-standard', 'nav-ext-main');
      mainButton.style.order = '3';
    }

    var menuButtons = config.menuButtons.filter(function (btn) {
      return btn.action !== 'main' && btn.action !== 'settings' && isButtonEnabled(btn);
    }).sort(function (a, b) {
      return a.order - b.order;
    });

    var currentOrder = 4;
    menuButtons.forEach(function (buttonConfig) {
      var buttonElement = createButtonElement(buttonConfig);
      buttonElement.classList.add('nav-ext-custom');
      buttonElement.style.order = currentOrder.toString();
      currentOrder++;
      navigationBar.appendChild(buttonElement);
    });

    if (settingsButton) {
      settingsButton.classList.add('nav-ext-standard', 'nav-ext-settings');
      settingsButton.style.order = currentOrder.toString();
    }

    console.log('NavBarExtension', 'Total buttons:', 4 + menuButtons.length);
  }

  function createButtonElement(buttonConfig) {
    var buttonHtml = createButton(buttonConfig);
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonHtml.trim();
    var buttonElement = tempDiv.firstChild;

    buttonElement.addEventListener('click', function () {
      handleAction(buttonConfig.action);
    });

    return buttonElement;
  }

  function addStyles() {
    var style = document.createElement('style');
    style.id = 'nav-ext-styles';
    style.textContent = `
            .navigation-bar__body {
                display: flex !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 0 !important;
                padding: 0.8em 0.5em !important;
                overflow-x: auto;
            }

            .navigation-bar__item {
                display: flex !important;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: opacity 0.2s ease;
                flex: 1 1 0;
                min-width: 0;
                padding: 0 0.3em;
            }

            .navigation-bar__item:hover,
            .navigation-bar__item:active {
                opacity: 0.7;
            }

            .nav-ext-main {
                font-weight: 500;
            }

            .navigation-bar__icon {
                width: 1.8em !important;
                height: 1.8em !important;
                margin: 0 auto 0.5em !important;
                flex-shrink: 0;
            }

            .navigation-bar__icon svg {
                width: 100%;
                height: 100%;
            }

            .navigation-bar__label {
                font-size: 0.75em !important;
                margin-top: 0 !important;
                text-align: center;
                line-height: 1.2;
                word-wrap: break-word;
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            body.true--mobile.orientation--landscape .navigation-bar__body {
                padding: 0.5em 0.3em !important;
            }

            body.true--mobile.orientation--landscape .navigation-bar__item {
                padding: 0 0.2em;
            }

            body.true--mobile.orientation--landscape .navigation-bar__icon {
                width: 1.5em !important;
                height: 1.5em !important;
                margin-bottom: 0.3em !important;
            }

            body.true--mobile.orientation--landscape .navigation-bar__label {
                font-size: 0.65em !important;
            }

            @media screen and (max-width: 380px) {
                .navigation-bar__body {
                    padding: 0.6em 0.3em !important;
                }

                .navigation-bar__item {
                    padding: 0 0.2em;
                }

                .navigation-bar__icon {
                    width: 1.5em !important;
                    height: 1.5em !important;
                }

                .navigation-bar__label {
                    font-size: 0.65em !important;
                }
            }

            @media screen and (max-width: 320px) {
                .navigation-bar__body {
                    padding: 0.5em 0.2em !important;
                }

                .navigation-bar__item {
                    padding: 0 0.1em;
                }

                .navigation-bar__icon {
                    width: 1.4em !important;
                    height: 1.4em !important;
                }

                .navigation-bar__label {
                    font-size: 0.6em !important;
                }
            }
        `;
    document.head.appendChild(style);
  }

  function addSettings() {
    Lampa.SettingsApi.addComponent({
      component: 'nav_bar_extension',
      name: t('nav_ext_settings_title'),
      icon: '<svg><use xlink:href="#sprite-favorite"></use></svg>'
    });

    setTimeout(function () {
      if (config.menuButtons.length === 0) {
        config.menuButtons = extractMenuButtons();
      }

      config.menuButtons
        .filter(function (btn) {
          return btn.action !== 'main' && btn.action !== 'settings';
        })
        .forEach(function (button) {
          Lampa.SettingsApi.addParam({
            component: 'nav_bar_extension',
            param: {
              name: button.setting_key,
              type: 'trigger',
              default: false
            },
            field: {
              name: button.title
            },
            onRender: function (item) {
              item.on('change', insertButtons);
            }
          });
        });
    }, 1000);
  }

  function waitForElements(selectors, callback, maxAttempts) {
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;

      var elements = selectors.map(function (selector) {
        return document.querySelector(selector);
      });

      var allFound = elements.every(function (el) {
        return el !== null;
      });

      if (allFound) {
        clearInterval(interval);
        callback(elements);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn('NavBarExtension', 'Timeout waiting for elements:', selectors);
      }
    }, 500);
  }

  function init() {
    if (!Platform.screen('mobile')) {
      console.log('NavBarExtension', 'Plugin skipped - not a mobile platform');
      return;
    }

    console.log('NavBarExtension', 'Plugin loaded, version:', config.version);

    addSettings();

    if (!document.getElementById('nav-ext-styles')) {
      addStyles();
    }

    waitForElements(['.navigation-bar__body', '.menu__list'], function (elements) {
      config.menuButtons = extractMenuButtons();
      console.log('NavBarExtension', 'Extracted', config.menuButtons.length, 'menu buttons');
      insertButtons();
    }, 30);

    Lampa.Storage.listener.follow('change', function (e) {
      if (e.name && e.name.indexOf('nav_ext_enable_') === 0) {
        setTimeout(insertButtons, 100);
      }
    });

    Lampa.Listener.follow('menu', function (event) {
      if (event.type === 'end') {
        setTimeout(function () {
          config.menuButtons = extractMenuButtons();
          insertButtons();
        }, 500);
      }
    });

    console.log('NavBarExtension', 'Plugin initialized');
  }

  if (window.appready) {
    init();
  } else {
    Lampa.Listener.follow('app', function (event) {
      if (event.type === 'ready') {
        init();
      }
    });
  }

})();
