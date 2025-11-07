// Polyfill for requestAnimationFrame and cancelAnimationFrame for older browsers or specific platforms
if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 1000 / 60);
  };
  window.cancelAnimationFrame = clearTimeout;
}

// jQuery plugin for particles effect
(function($) {
  $.fn.particles = function(options) {
    var defaults = {
      selector: '.background',
      color: '#DEDCDC',
      maxParticles: 100,
      sizeVariations: 3,
      minSize: 1,
      speed: 0.5,
      connectParticles: false,
      responsive: false,
      duration: 0,
      easing: 'easeInOutQuad'
    };

    options = $.extend({}, defaults, options);

    return this.each(function() {
      var $this = $(this);
      var wrapper = $(options.selector, $this);
      if (!wrapper.length) return;

      var canvas;
      if (options.responsive) {
        canvas = $('<canvas></canvas>').prependTo(wrapper)[0];
        canvas.width = wrapper.width();
        canvas.height = wrapper.height();
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      } else {
        canvas = $('<canvas></canvas>').prependTo($this)[0];
        canvas.width = $this.width();
        canvas.height = $this.height();
      }

      canvas.style.display = 'block';
      canvas.style.position = options.responsive ? 'absolute' : 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = options.responsive ? '1' : '-1';
      if (options.color) canvas.style.background = options.color;

      var ctx = canvas.getContext('2d');
      var particles = [];
      var raf;
      var mouseX, mouseY;

      function Particle() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * options.speed;
        this.vy = (Math.random() - 0.5) * options.speed;
        this.size = Math.random() * options.sizeVariations + options.minSize;
        this.color = options.color;
      }

      Particle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > canvas.width || this.x < 0) this.vx = -this.vx;
        if (this.y > canvas.height || this.y < 0) this.vy = -this.vy;
      };

      Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      };

      function init() {
        for (var i = 0; i < options.maxParticles; i++) {
          particles.push(new Particle());
        }
      }

      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }

        if (options.connectParticles) {
          for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
              var dx = particles[i].x - particles[j].x;
              var dy = particles[i].y - particles[j].y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120) {
                ctx.beginPath();
                ctx.strokeStyle = options.color;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }

        raf = requestAnimationFrame(animate);
      }

      init();
      animate();

      if (options.duration) {
        setTimeout(function() {
          wrapper.fadeOut(options.duration, function() {
            $(this).remove();
            cancelAnimationFrame(raf);
          });
        }, options.duration);
      }

      if (options.connectParticles) {
        $(window).on('mousemove', function(e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          // Possibly update particles based on mouse position, but not evident in obfuscated code
        });
      }
    });
  };
})(jQuery);

// Add setting to Lampa interface
Lampa.Settings.component('interface')
  .group({
    name: 'Particles', // Likely the name, based on context
    type: 'toggle',
    default: true
  })
  .field({
    name: 'Enable particles'
  })
  .onChange(function(value) {
    if (value) {
      $('.interface').particles({
        // Default options as above
      });
    } else {
      // Remove particles
      var particlesWrapper = $('.background', $('.interface'));
      if (particlesWrapper.length) particlesWrapper.remove();
    }
    Lampa.Storage.set('particles_enabled', value); // Assuming storage key
  })
  .onRender(function() {
    if (Lampa.Storage.get('particles_enabled', true)) {
      // Apply if enabled
      setTimeout(function() {
        $('.interface').particles({});
      }, 100);
    }
  });