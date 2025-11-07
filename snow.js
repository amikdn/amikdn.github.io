(function($) {
  'use strict';

  Lampa.Platform.tv();

  $.fn.confetti = function(options) {
    // Настройки по умолчанию
    options = $.extend({
      count: 35,          // Количество частиц
      size: 1,            // Размер частиц
      speed: 2,           // Скорость
      life: 5,            // Время жизни
      shape: 'rectangle', // Форма (прямоугольник)
      color: 'random',    // Цвет (случайный)
      gravity: 1,         // Гравитация
      wind: 0,            // Ветер
      fade: true,         // Затухание
      rotate: true        // Вращение
    }, options);

    return this.each(function() {
      var $element = $(this);
      var particles = [];

      // Создаем частицы
      for (var i = 0; i < options.count; i++) {
        particles.push(new Particle($element, options));
      }

      // Анимация
      function animate() {
        particles.forEach(function(particle) {
          particle.update();
        });
        requestAnimationFrame(animate);
      }

      animate();
    });
  };

  // Класс частицы
  function Particle($container, options) {
    this.$container = $container;
    this.options = options;

    // Инициализация позиции и скорости
    this.x = Math.random() * $container.width();
    this.y = Math.random() * -$container.height();
    this.vx = (Math.random() - 0.5) * options.wind;
    this.vy = Math.random() * options.gravity + 1;
    this.size = Math.random() * options.size + 1;
    this.life = Math.random() * options.life + 1;
    this.color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    this.angle = Math.random() * 360;

    // Создаем canvas для частицы
    this.$canvas = $('<canvas>').appendTo($container);
    this.$canvas.css({
      position: options.position || 'absolute',
      left: this.x + 'px',
      top: this.y + 'px',
      width: this.size + 'px',
      height: this.size + 'px',
      zIndex: options.zIndex || 999999
    });

    // Если включено затухание или вращение
    if (options.fade) {
      this.opacity = 1;
    }
    if (options.rotate) {
      this.rotationSpeed = (Math.random() - 0.5) * 10;
    }

    this.update = function() {
      // Обновляем позицию
      this.y += this.vy;
      this.x += this.vx;

      if (options.rotate) {
        this.angle += this.rotationSpeed;
      }

      // Проверяем границы
      if (this.y > $container.height() || this.life <= 0) {
        this.y = Math.random() * -$container.height();
        this.life = Math.random() * options.life + 1;
        if (options.fade) this.opacity = 1;
      }

      // Уменьшаем жизнь
      this.life -= 0.01;
      if (options.fade) {
        this.opacity = this.life / options.life;
      }

      // Рисуем на canvas
      var ctx = this.$canvas[0].getContext('2d');
      ctx.clearRect(0, 0, this.size, this.size);
      ctx.fillStyle = this.color;
      if (options.fade) {
        ctx.globalAlpha = this.opacity;
      }
      if (options.shape === 'rectangle') {
        ctx.fillRect(0, 0, this.size, this.size);
      } // Можно добавить другие формы, например круг

      // Обновляем позицию canvas
      this.$canvas.css({
        left: this.x + 'px',
        top: this.y + 'px'
      });
    };
  }
})(jQuery);
