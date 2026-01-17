'use strict';

// Фикс количества дней (премиум)
window.Lampa.Utils.countDays = new Proxy(window.Lampa.Utils.countDays, {
  apply() {
    return 99;
  }
});

// Отключение нежелательных функций
if (window.lampa_settings) {
  if (!window.lampa_settings.disable_features) {
    window.lampa_settings.disable_features = {};
  }
  window.lampa_settings.disable_features.ads = true;
  window.lampa_settings.disable_features.blacklist = true;
  window.lampa_settings.disable_features.persons = true;
  window.lampa_settings.disable_features.install_proxy = false;
}

// Установка региона UK
$(document).ready(function () {
  const now = new Date().getTime();
  localStorage.setItem('region', `{"code":"uk","time":${now}}`);
});

// Блокировка русского языка
window.Lampa.Lang.selected = new Proxy(window.Lampa.Lang.selected, {
  apply(target, thisArg, args) {
    if (args[0]?.includes('ru')) {
      console.log('Lang.selected for ru, returning false');
      return false;
    }
    return Reflect.apply(target, thisArg, args);
  }
});

// Принудительный регион UK в VPN
function patchVPNRegion() {
  if (window.Lampa.VPN) {
    window.Lampa.VPN.region = new Proxy(window.Lampa.VPN.region || (() => {}), {
      apply(target, thisArg, args) {
        console.log('VPN.region called, returning uk');
        args[0]('uk');
      }
    });
  }
}
patchVPNRegion();
setTimeout(patchVPNRegion, 100);

// Инициализация TMDBProxy при вызове VPN.task
function patchVPNTask() {
  if (window.Lampa.VPN?.task) {
    window.Lampa.VPN.task = new Proxy(window.Lampa.VPN.task, {
      apply(target, thisArg, args) {
        console.log('VPN.task called, ensuring TMDBProxy.init');
        if (window.Lampa.TMDBProxy?.init && !window.lampa_settings.disable_features.install_proxy) {
          console.log('Calling TMDBProxy.init');
          window.Lampa.TMDBProxy.init();
        }
        args[0]();
      }
    });
  }
}
patchVPNTask();
setTimeout(patchVPNTask, 100);

// Отключение рекламы через AdVast
function patchAdVast() {
  if (window.Lampa.AdVast?.get) {
    window.Lampa.AdVast.get = new Proxy(window.Lampa.AdVast.get, {
      apply(target, thisArg, args) {
        console.log('AdVast.get called, resolving empty');
        args[0]();
        return Promise.resolve();
      }
    });
  }
}
patchAdVast();
setTimeout(patchAdVast, 100);

// Блокировка запросов рекламы и чёрного списка
const originalAjax = $.ajax;
$.ajax = function (options) {
  if (
    options.url?.includes('/api/ad/all') ||
    options.url?.includes('/api/plugins/blacklist') ||
    options.url?.includes('plugins_black_list.json')
  ) {
    console.log('Blocking request:', options.url);
    options.error?.();
    return;
  }
  return originalAjax.apply(this, arguments);
};

// Скрытие элементов интерфейса (фэйк премиум + удаление рекламы)
function updateDOM() {
  const container = window.Lampa?.Activity?.active?.()?.body || $(document);
  if (container.find) {
    container.find('.settings--account-user').toggleClass('hide', true);
    container.find('.settings--account-premium').toggleClass('selectbox-item--checked', true);
    container.find('.settings-param__label').toggleClass('hide', true);
    container.find('.ad-server').remove();
  } else {
    setTimeout(updateDOM, 100);
  }
}
updateDOM();

// Удаление ad-server при открытии настроек сервера
Lampa.Settings.listener.follow('open', function (e) {
  if (e.name === 'server') {
    $('.ad-server').remove();
  }
});
