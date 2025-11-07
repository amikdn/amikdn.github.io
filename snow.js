(function($) {
  'use strict';

  Lampa.Platform.tv();

  $.fn.snowfall = function(options) {
    // Настройки по умолчанию
    options = $.extend({
      count: 50,        // Количество снежинок
      minSize: 5,       // Минимальный размер
      maxSize: 10,      // Максимальный размер
      minSpeed: 2,      // Минимальная скорость
      maxSpeed: 5,      // Максимальная скорость
      wind: 2           // Сила ветра (для траектории)
    }, options);

    return this.each(function() {
      var $container = $(this);
      var snowflakes = [];

      // Создаём снежинки
      for (var i = 0; i < options.count; i++) {
        var $flake = $('<div class="snowflake"></div>');
        var size = Math.random() * (options.maxSize - options.minSize) + options.minSize;
        var left = Math.random() * $container.width();
        var speed = Math.random() * (options.maxSpeed - options.minSpeed) + options.minSpeed;
        var vx = (Math.random() - 0.5) * options.wind; // Лёгкий ветер

        $flake.css({
          position: 'absolute',
          width: size + 'px',
          height: size + 'px',
          background: '#fff',
          borderRadius: '50%', // Круглая форма снежинки
          left: left + 'px',
          top: '-10px',
          opacity: Math.random() * 0.5 + 0.5 // Полупрозрачность
        });

        $container.append($flake);
        snowflakes.push({ $flake: $flake, vx: vx, speed: speed });
      }

      // Анимация
      function animate() {
        snowflakes.forEach(function(flake) {
          var top = parseFloat(flake.$flake.css('top')) + flake.speed;
          var left = parseFloat(flake.$flake.css('left')) + flake.vx;

          if (top > $container.height()) {
            // Респавн сверху
            top = -10;
            left = Math.random() * $container.width();
            flake.vx = (Math.random() - 0.5) * options.wind; // Новый ветер
          }

          flake.$flake.css({
            top: top + 'px',
            left: left + 'px',
            opacity: 1 - (top / $container.height()) // Затухание внизу
          });
        });

        requestAnimationFrame(animate);
      }

      animate();
    });
  };
})(jQuery);
