(function() {
  'use strict';

  // Манифест плагина
  var manifst = {
    type: 'other',
    version: '1.1',
    name: 'Скрыть историю в Lampac и Торрентах',
    description: 'Скрывает блок с информацией о предыдущем просмотре (балансер, голос, сезон, эпизод) в плагине Lampac (онлайн) и в торрент-просмотре в Lampa. Добавлено скрытие дополнительных классов для надежности.'
  };

  Lampa.Manifest.plugins = manifst;

  // Функция запуска плагина
  function startPlugin() {
    // Добавляем шаблон с CSS для скрытия блоков
    Lampa.Template.add('hide_lampa_history_css', `
      <style>
        .online-prestige-watched,
        .torrent-prestige-watched,
        .prestige-watched {
          display: none !important;
        }
      </style>
    `);

    // Вставляем CSS в тело страницы
    $('body').append(Lampa.Template.get('hide_lampa_history_css', {}, true));
  }

  // Запускаем плагин, если он ещё не запущен
  if (!window.hide_lampa_history) {
    window.hide_lampa_history = true;
    startPlugin();
  }
})();
