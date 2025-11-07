(function($) {
  'use strict';

  Lampa.Platform.tv();

  $.fn.snow = function(options) {
    // Настройки по умолчанию для снега
    options = $.extend({
      count: 50,          // Количество снежинок
      size: 2,            // Размер (от 1 до указанного)
      speed: 0.5,         // Скорость падения (медленная)
      life: 10,           // Время жизни (дольше для медленного эффекта)
      shape: 'circle',    // Форма: круг (снежинка)
      color: '#FFFFFF',   // Белый цвет
      gravity: 0.3,       // Гравитация (лёгкая)
      wind: 0.2,          // Лёгкий ветер для траектории
      fade: true,         // Затухание (прозрачность)
      rotate: true        // Вращение снежинок
    }, options);

    return this.each(function() {
      var $element = $(this);
      var particles = [];

      // Создаем снежинки
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

  // Класс снежинки
  function Particle($container, options) {
    this.$container = $container;
    this.options = options;

    // Инициализация
    this.x = Math.random() * $container.width();
    this.y = Math.random() * -$container.height();
    this.vx = (Math.random() - 0.5) * options.wind;
    this.vy = Math.random() * options.speed + options.gravity;
    this.size = Math.random() * options.size + 1;
    this.life = Math.random() * options.life + 1;
    this.color = options.color;
    this.angle = Math.random() * 360;
    this.opacity = 1; // Начальная прозрачность
    this.rotationSpeed = (Math.random() - 0.5) * 5; // Скорость вращения

    // Создаем canvas для снежинки
    this.$canvas = $('<canvas>').appendTo($container);
    this.$canvas.css({
      position: 'absolute',
      left: this.x + 'px',
      top: this.y + 'px',
      width: this.size + 'px',
      height: this.size + 'px',
      zIndex: 999999
    });

    this.update = function() {
      // Обновляем позицию
      this.y += this.vy;
      this.x += this.vx;
      this.angle += this.rotationSpeed;

      // Уменьшаем жизнь и прозрачность
      this.life -= 0.01;
      if (options.fade) {
        this.opacity = this.life / options.life;
      }

      // Респавн при выходе за пределы
      if (this.y > $container.height() || this.life <= 0) {
        this.x = Math.random() * $container.width();
        this.y = -this.size;
        this.life = Math.random() * options.life + 1;
        this.opacity = 1;
      }

      // Рисуем снежинку
      var ctx = this.$canvas[0].getContext('2d');
      ctx.clearRect(0, 0, this.size, this.size);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;

      if (options.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(this.size / 2, this.size / 2, this.size / 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Обновляем позицию canvas
      this.$canvas.css({
        left: this.x + 'px',
        top: this.y + 'px'
      });
    };
  }
})(jQuery);
