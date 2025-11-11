(function() {
  'use strict';

  Lampa.Platform.tv();

  function main() {
    var selectedTheme = localStorage.getItem('selectedTheme');

    if (selectedTheme) {
      var link = $('<link rel="stylesheet" href="' + selectedTheme + '">');
      $('head').append(link);
    }

    Lampa.SettingsApi.addParam({
      component: 'my_themes',
      param: {
        name: 'my_themes',
        type: 'static'
      },
      field: {
        name: 'Мои темы',
        description: 'Измени палитру элементов приложения'
      },
      onRender: function(item) {
        setTimeout(function() {
          $('.settings-folder').parent().insertAfter($('.settings-param > div:contains("Мои темы")'));

          item.on('hover:enter', function() {
            setTimeout(function() {
              if ($('#stantion_filtr').length || $('div[data-name="interface_size"]').length) window.app.back();
            }, 50);

            setTimeout(function() {
              var active = Lampa.Storage.get('themesCurrent');
              var call;

              if (active !== '') {
                call = JSON.parse(JSON.stringify(active));
              } else {
                call = {
                  'url': 'https://bylampa.github.io/themes/categories/color_gallery.json',
                  'title': 'Color Gallery',
                  'component': 'my_themes',
                  'page': 1
                };
              }

              Lampa.Activity.push(call);
              Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
            }, 100);
          });
        }, 0);
      }
    });

    function MyThemes(params) {
      var self = this;
      var request = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true,
        step: 250
      });
      var items = [];
      var html = $('<div></div>');
      var body = $('<div class="my_themes category-full"></div>');
      var info;
      var last;
      var categories = [
        {
          title: 'Color Gallery',
          url: 'https://bylampa.github.io/themes/categories/color_gallery.json'
        },
        {
          title: 'Gradient Style',
          url: 'https://bylampa.github.io/themes/categories/gradient_style.json'
        },
        {
          title: 'Stroke',
          url: 'https://bylampa.github.io/themes/categories/stroke.json'
        }
      ];

      this.build = function() {
        self.activity.loader(true);

        request.silent(params.url, self.append.bind(self), function() {
          var empty = new Lampa.Empty();
          html.append(empty.render());
          self.start = empty.render;
          self.activity.loader(false);
          self.activity.toggle();
        });

        self.render();
      };

      this.append = function(data) {
        data.forEach(function(element) {
          var card = Lampa.Template.get('card', {
            title: element.title,
            release_year: ''
          });

          card.addClass('card--collection');
          card.find('.card__img').css({
            'cursor': 'pointer',
            'background-color': '#353535a6'
          });
          card.css({
            'text-align': 'center'
          });

          var img = card.find('.card__img')[0];
          img.onload = function() {
            card.addClass('card--loaded');
          };
          img.onerror = function(e) {
            img.src = './img/img_broken.svg';
          };
          img.src = element.logo;

          $('.info__title').remove();

          function addQuality() {
            var elem = document.createElement('div');
            elem.innerText = 'Установлена';
            elem.classList.add('card__quality');
            card.find('.card__view').append(elem);
            $(elem).css({
              'position': 'absolute',
              'left': '-3%',
              'bottom': '70%',
              'padding': '0.8em',
              'background': '#ffe216',
              'color': '#000',
              'fontSize': '0.8em',
              'WebkitBorderRadius': '0.3em',
              'MozBorderRadius': '0.3em',
              'borderRadius': '0.3em',
              'textTransform': 'uppercase'
            });
          }

          var selectedTheme = localStorage.getItem('selectedTheme');
          if (selectedTheme && element.css === selectedTheme) {
            addQuality();
          }

          card.on('hover:focus', function() {
            last = card[0];
            scroll.update(card, true);
            info.find('.info__title').text(element.title);
          });

          var css = element.css;

          card.on('hover:enter hover:click', function(e) {
            var status = Lampa.Controller.enabled().name;
            var menu = [];
            menu.push({ title: 'Установить' });
            menu.push({ title: 'Удалить' });

            Lampa.Select.show({
              title: '',
              items: menu,
              onBack: function() {
                Lampa.Controller.toggle('content');
              },
              onSelect: function(item) {
                if (item.title == 'Установить') {
                  $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                  var link = $('<link rel="stylesheet" href="' + css + '">');
                  $('head').append(link);
                  localStorage.setItem('selectedTheme', css);
                  console.log('Тема установлена:', css);
                  if ($('#stantion_filtr').length > 0) $('#stantion_filtr').remove();
                  addQuality();

                  if (Lampa.Storage.get('myBackground') == true) {
                    var my = Lampa.Storage.get('myBackground');
                    Lampa.Storage.set('background', my);
                    Lampa.Storage.set('myBackground', false);
                  }

                  if (Lampa.Storage.get('glass_style') == true) {
                    var my = Lampa.Storage.get('myGlassStyle');
                    Lampa.Storage.set('glass_style', my);
                    Lampa.Storage.set('glass_style', false);
                  }

                  if (Lampa.Storage.get('black_style') == true) {
                    var my = Lampa.Storage.get('myBlackStyle');
                    Lampa.Storage.set('black_style', my);
                    Lampa.Storage.set('black_style', false);
                  }

                  Lampa.Controller.toggle('interface');
                } else if (item.title == 'Удалить') {
                  $('link[rel="stylesheet"][href^="https://bylampa.github.io/themes/css/"]').remove();
                  localStorage.removeItem('selectedTheme');
                  $('.card__quality').remove();

                  if (localStorage.getItem('div[data-name="interface_size"]')) {
                    Lampa.Storage.set('background', Lampa.Storage.get('div[data-name="interface_size"]'));
                  }
                  localStorage.removeItem('div[data-name="interface_size"]');

                  if (localStorage.getItem('myGlassStyle')) {
                    Lampa.Storage.set('glass_style', Lampa.Storage.get('myGlassStyle'));
                  }
                  localStorage.removeItem('myGlassStyle');

                  if (localStorage.getItem('myBlackStyle')) {
                    Lampa.Storage.set('black_style', Lampa.Storage.get('myBlackStyle'));
                  }
                  localStorage.removeItem('myBlackStyle');

                  Lampa.Controller.toggle('interface');
                }
              }
            });
          });

          body.append(card);
          items.push(card);
        });
      };

      this.render = function(data) {
        Lampa.Background.change('');
        Lampa.Manifest.add('silent', '');
        Lampa.Manifest.add('info_tvtv', '<div class="info layer--width"><div class="info__left"><div class="info__title"></div><div class="info__title-original"></div><div class="info__create"></div></div><div class="info__right">  <div id="stantion_filtr"></div></div></div>');

        var button = Lampa.Template.get('button_category');
        info = Lampa.Template.get('info');
        info.find('.view--category').append(button);
        info.find('hover:enter hover:click').on('hover:enter', function() {
          self.selectGroup();
        });

        scroll.render().addClass('layer--wheight').data('mheight', info);
        html.append(info.append());
        html.append(scroll.render());
        self.append(data);
        scroll.append(body);

        var spacer = '<div id="spacer" style="height: 25em;"></div>';
        $('.my_themes').append(spacer);

        self.activity.loader(false);
        self.activity.toggle();
      };

      this.selectGroup = function() {
        Lampa.Select.show({
          title: 'Категории тем',
          items: categories,
          onSelect: function(item) {
            Lampa.Activity.push({
              url: item.url,
              title: item.title,
              component: 'my_themes',
              page: 1
            });
            Lampa.Storage.set('themesCurrent', JSON.stringify(Lampa.Activity.active()));
          },
          onBack: function() {
            Lampa.Controller.toggle('interface');
          }
        });
      };

      this.start = function() {
        Lampa.Controller.add('content', {
          toggle: function() {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          left: function() {
            if (Navigator.canmove('left')) Navigator.move('left');
            else Lampa.Controller.toggle('menu');
          },
          right: function() {
            if (Navigator.canmove('right')) Navigator.move('right');
            else self.selectGroup();
          },
          up: function() {
            if (Navigator.canmove('up')) Navigator.move('up');
            else {
              if (!info.find('.view--category').hasClass('focus')) {
                Lampa.Controller.collectionSet(info);
                Navigator.move('right');
              } else Lampa.Controller.toggle('enabled');
            }
          },
          down: function() {
            if (Navigator.canmove('down')) Navigator.move('down');
            else info.find('.view--category').hasClass('focus') && Lampa.Controller.toggle('content');
          },
          back: function() {
            Lampa.Activity.backward();
          }
        });

        Lampa.Controller.toggle('content');
      };

      this.pause = function() {};
      this.stop = function() {};

      this.render = function() {
        return html;
      };

      this.destroy = function() {
        request.clear();
        scroll.destroy();
        if (info) info.remove();
        html.remove();
        body.remove();
        request = null;
        items = null;
        html = null;
        body = null;
        info = null;
      };
    }

    Lampa.Component.add('my_themes', MyThemes);

    Lampa.Listener.follow('appready', function(e) {
      if (e.type == 'appready') {
        $('#button_category').remove();
      }
    });
  }

  if (window.appready) main();
  else Lampa.Listener.follow('app', function(e) {
    if (e.type == 'ready') main();
  });
})();