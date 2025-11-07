(function() {
  'use strict';
  Lampa.Platform.tv();

  Date.now = Date.now || function() {
    return new Date().getTime();
  };

  (function() {
    var self = this;

    var bubblesPlugin = function(options) {
      options = $.extend({
        color: '#fff',
        minSize: 5,
        maxSize: 20,
        num: 30,
        speed: 5,
        bounce: true,
        canvas: true
      }, options);

      return this.each(function() {
        var $this = $(this);
        var container = $this;

        if (options.canvas) {
          var canvas = $('<canvas>').appendTo(container);
          canvas.attr('width', container.width());
          canvas.attr('height', container.height());
          var ctx = canvas[0].getContext('2d');
        } else {
          // Use divs for bubbles
        }

        var bubbles = [];

        for (var i = 0; i < options.num; i++) {
          var bubble = {
            x: Math.random() * container.width(),
            y: container.height() + Math.random() * 50,
            size: Math.random() * (options.maxSize - options.minSize) + options.minSize,
            speed: Math.random() * options.speed + 1,
            color: options.color
          };
          bubbles.push(bubble);
        }

        function animate() {
          if (options.canvas) {
            ctx.clearRect(0, 0, canvas.width(), canvas.height());
          }

          for (var j = 0; j < bubbles.length; j++) {
            var b = bubbles[j];
            b.y -= b.speed;

            if (b.y < -b.size) {
              b.y = container.height() + b.size;
              b.x = Math.random() * container.width();
            }

            if (options.bounce) {
              // Simple bounce logic
              if (b.x < 0 || b.x > container.width()) {
                b.speed = -b.speed * 0.8;
              }
            }

            if (options.canvas) {
              ctx.beginPath();
              ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
              ctx.fillStyle = b.color;
              ctx.fill();
            } else {
              // Animate div
            }
          }

          requestAnimationFrame(animate);
        }

        animate();
      });
    };

    $.fn.bubbles = bubblesPlugin;
  })();

  // Remove some event listeners if needed
  for (var events = ['resize', 'load'], i = 0; i < events.length; i++) {
    window['on' + events[i]] = window['on' + events[i]];
  }

  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    // Fallback for old iOS
  }

  Lampa.Settings.listener.follow('toggle', function(e) {
    if (e.name === 'bubbles') {
      // Toggle the effect on or off
      if (e.value) {
        $('body').bubbles();
      } else {
        // Stop animation
      }
    }
  });

})();
