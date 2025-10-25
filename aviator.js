
(function () {
  'use strict';

  var _0x4687f1 = [{
    'id': "vote_count.desc",
    'title': "Много голосов"
  }, {
    'id': "vote_average.desc",
    'title': "Высокий рейтинг"
  }, {
    'id': "first_air_date.desc",
    'title': "Новинки"
  }, {
    'id': "popularity.desc",
    'title': "Популярные"
  }, {
    'id': "revenue.desc",
    'title': "Интерес зрителей"
  }];
  var _0x310eb8 = [{
    'id': 0x1c,
    'title': "боевики"
  }, {
    'id': 0x23,
    'title': "комедии"
  }, {
    'id': 0x12,
    'title': "драмы"
  }, {
    'id': 0x29fd,
    'title': "мелодрамы"
  }, {
    'id': 0x10,
    'title': "мультфильмы"
  }, {
    'id': 0x2a0a,
    'title': "детское"
  }, {
    'id': 0xc,
    'title': "приключения"
  }, {
    'id': 0x50,
    'title': "криминал"
  }, {
    'id': 0x25b0,
    'title': "детективы"
  }, {
    'id': 0x36e,
    'title': "фантастика"
  }, {
    'id': 0x2a00,
    'title': "военные"
  }, {
    'id': 0x25,
    'title': "вестерны"
  }, {
    'id': 0x35,
    'title': "триллеры"
  }, {
    'id': 0x29ff,
    'title': "семейные"
  }, {
    'id': 0xe,
    'title': "фэнтези"
  }, {
    'id': 0x2a0c,
    'title': "реалити-шоу"
  }, {
    'id': 0x2a07,
    'title': "боевики и приключения"
  }, {
    'id': 0x2a0e,
    'title': "мыльные оперы"
  }, {
    'id': 0x2a0f,
    'title': "ток-шоу"
  }];
  var _0x3137f9 = [{
    'id': 0x31,
    'title': "HBO"
  }, {
    'id': 0x4d,
    'title': "SyFy"
  }, {
    'id': 0x9f8,
    'title': "Apple TV+"
  }, {
    'id': 0x1c5,
    'title': "Hulu"
  }, {
    'id': 0x400,
    'title': "Amazon Prime"
  }, {
    'id': 0xd5,
    'title': "Netflix"
  }, {
    'id': 0xc72,
    'title': "HBO Max"
  }, {
    'id': 0x81c,
    'title': "Paramount+"
  }, {
    'id': 0xd19,
    'title': "Peacock"
  }, {
    'id': 0xab3,
    'title': "Disney+"
  }, {
    'id': 0x2,
    'title': "ABC"
  }, {
    'id': 0x6,
    'title': "NBC"
  }, {
    'id': 0x10,
    'title': "CBS"
  }, {
    'id': 0x13e,
    'title': "Starz"
  }, {
    'id': 0xae,
    'title': "BBC"
  }, {
    'id': 0x13,
    'title': "FOX"
  }, {
    'id': 0x704,
    'title': "Discovery+"
  }, {
    'id': 0x76b,
    'title': "Max"
  }];
  var _0x577bf6 = [{
    'id': 0x9bd,
    'title': "Start"
  }, {
    'id': 0xb2b,
    'title': "Premier"
  }, {
    'id': 0xff5,
    'title': "KION"
  }, {
    'id': 0xf53,
    'title': "ИВИ"
  }, {
    'id': 0x19c,
    'title': "Россия 1"
  }, {
    'id': 0x22e,
    'title': "Первый канал"
  }, {
    'id': 0xf1f,
    'title': "Okko"
  }, {
    'id': 0xef3,
    'title': "Кинопоиск"
  }, {
    'id': 0x16ae,
    'title': "Wink"
  }, {
    'id': 0x326,
    'title': "СТС"
  }, {
    'id': 0x4a7,
    'title': "ТНТ"
  }, {
    'id': 0x45f,
    'title': "НТВ"
  }];
  function _0x1a40c5() {
    var _0x2a1f11 = Lampa.Storage.get("lampac_profile_id", '') || "default";
    var _0x450ffd = Lampa.Storage.get("surs_settings") || {};
    if (!_0x450ffd.hasOwnProperty(_0x2a1f11)) {
      _0x450ffd[_0x2a1f11] = {};
      _0x3c7db5(_0x450ffd);
    }
    return _0x450ffd[_0x2a1f11];
  }
  function _0x3c7db5(_0x2ca634) {
    Lampa.Storage.set("surs_settings", _0x2ca634);
  }
  function _0x490c3e(_0x126401, _0x7847a5) {
    var _0x17ef7d = _0x1a40c5();
    return _0x17ef7d.hasOwnProperty(_0x126401) ? _0x17ef7d[_0x126401] : _0x7847a5;
  }
  function _0x59bf81(_0x1d6788, _0x3f336b) {
    var _0xc4c0ec = Lampa.Storage.get("surs_settings") || {};
    var _0xb9c804 = Lampa.Storage.get("lampac_profile_id", '') || "default";
    if (!_0xc4c0ec.hasOwnProperty(_0xb9c804)) {
      _0xc4c0ec[_0xb9c804] = {};
    }
    _0xc4c0ec[_0xb9c804][_0x1d6788] = _0x3f336b;
    _0x3c7db5(_0xc4c0ec);
  }
  function _0x4276a1(_0x536c00, _0x536d62) {
    var _0x12fe94 = [];
    for (var _0x2b2c2e = 0; _0x2b2c2e < _0x536c00.length; _0x2b2c2e++) {
      if (_0x490c3e(_0x536d62 + _0x536c00[_0x2b2c2e].id, true)) {
        _0x12fe94.push(_0x536c00[_0x2b2c2e]);
      }
    }
    return _0x12fe94;
  }
  function _0x4cbab4() {
    window.plugin_tmdb_mod_ready = true;
    var _0x450ff0 = function (_0x4b924d) {
      var _0x5461a5 = _0x4b924d.card || _0x4b924d;
      var _0x1412b1 = _0x4b924d.next_episode_to_air || _0x4b924d.episode || {};
      if (_0x5461a5.source == undefined) {
        _0x5461a5.source = "tmdb";
      }
      Lampa.Arrays.extend(_0x5461a5, {
        'title': _0x5461a5.name,
        'original_title': _0x5461a5.original_name,
        'release_date': _0x5461a5.first_air_date
      });
      _0x5461a5.release_year = ((_0x5461a5.release_date || "0000") + '').slice(0, 4);
      function _0x66a336(_0x54d259) {
        if (_0x54d259) {
          _0x54d259.remove();
        }
      }
      this.build = function () {
        this.card = Lampa.Template.js("card_episode");
        this.img_poster = this.card.querySelector(".card__img") || {};
        this.img_episode = this.card.querySelector(".full-episode__img img") || {};
        this.card.querySelector(".card__title").innerText = _0x5461a5.title;
        this.card.querySelector(".full-episode__num").innerText = _0x5461a5.unwatched || '';
        if (_0x1412b1 && _0x1412b1.air_date) {
          this.card.querySelector(".full-episode__name").innerText = 's' + (_0x1412b1.season_number || '?') + 'e' + (_0x1412b1.episode_number || '?') + ". " + (_0x1412b1.name || Lampa.Lang.translate("noname"));
          this.card.querySelector(".full-episode__date").innerText = _0x1412b1.air_date ? Lampa.Utils.parseTime(_0x1412b1.air_date).full : "----";
        }
        if (_0x5461a5.release_year == "0000") {
          _0x66a336(this.card.querySelector(".card__age"));
        } else {
          this.card.querySelector(".card__age").innerText = _0x5461a5.release_year;
        }
        this.card.addEventListener("visible", this.visible.bind(this));
      };
      this.image = function () {
        var _0x5094b9 = this;
        this.img_poster.onload = function () {};
        this.img_poster.onerror = function () {
          _0x5094b9.img_poster.src = "./img/img_broken.svg";
        };
        this.img_episode.onload = function () {
          _0x5094b9.card.querySelector(".full-episode__img").classList.add("full-episode__img--loaded");
        };
        this.img_episode.onerror = function () {
          _0x5094b9.img_episode.src = "./img/img_broken.svg";
        };
      };
      this.create = function () {
        var _0x5341ed = this;
        this.build();
        this.card.addEventListener("hover:focus", function () {
          if (_0x5341ed.onFocus) {
            _0x5341ed.onFocus(_0x5341ed.card, _0x5461a5);
          }
        });
        this.card.addEventListener("hover:hover", function () {
          if (_0x5341ed.onHover) {
            _0x5341ed.onHover(_0x5341ed.card, _0x5461a5);
          }
        });
        this.card.addEventListener("hover:enter", function () {
          if (_0x5341ed.onEnter) {
            _0x5341ed.onEnter(_0x5341ed.card, _0x5461a5);
          }
        });
        this.image();
      };
      this.visible = function () {
        if (_0x5461a5.poster_path) {
          this.img_poster.src = Lampa.Api.img(_0x5461a5.poster_path);
        } else {
          if (_0x5461a5.profile_path) {
            this.img_poster.src = Lampa.Api.img(_0x5461a5.profile_path);
          } else {
            if (_0x5461a5.poster) {
              this.img_poster.src = _0x5461a5.poster;
            } else {
              if (_0x5461a5.img) {
                this.img_poster.src = _0x5461a5.img;
              } else {
                this.img_poster.src = "./img/img_broken.svg";
              }
            }
          }
        }
        if (_0x5461a5.still_path) {
          this.img_episode.src = Lampa.Api.img(_0x1412b1.still_path, "w300");
        } else {
          if (_0x5461a5.backdrop_path) {
            this.img_episode.src = Lampa.Api.img(_0x5461a5.backdrop_path, "w300");
          } else {
            if (_0x1412b1.img) {
              this.img_episode.src = _0x1412b1.img;
            } else {
              if (_0x5461a5.img) {
                this.img_episode.src = _0x5461a5.img;
              } else {
                this.img_episode.src = "./img/img_broken.svg";
              }
            }
          }
        }
        if (this.onVisible) {
          this.onVisible(this.card, _0x5461a5);
        }
      };
      this.destroy = function () {
        this.img_poster.onerror = function () {};
        this.img_poster.onload = function () {};
        this.img_episode.onerror = function () {};
        this.img_episode.onload = function () {};
        this.img_poster.src = '';
        this.img_episode.src = '';
        _0x66a336(this.card);
        this.card = null;
        this.img_poster = null;
        this.img_episode = null;
      };
      this.render = function (_0x58a74c) {
        return _0x58a74c ? this.card : $(this.card);
      };
    };
    var _0x3fedbf = function (_0x5e2ce3) {
      this.network = new Lampa.Reguest();
      this.discovery = false;
      this.main = function (_0x4ecf36 = {}, _0x4c508f = () => {}, _0xa6f809 = () => {}) {
        var _0x4a1e0e = this;
        function _0x35329b(_0x5975e6) {
          var _0x180de7 = _0x490c3e("cirillic");
          var _0x182e64 = _0x180de7 === '1' || _0x180de7 === null || _0x180de7 === undefined || _0x180de7 === '';
          if (!_0x182e64) {
            return _0x5975e6;
          }
          function _0x1ca577(_0x59014a) {
            if (typeof _0x59014a === "string") {
              return /[а-яА-ЯёЁ]/.test(_0x59014a);
            } else {
              if (typeof _0x59014a === "object" && _0x59014a !== null) {
                var _0x5b5dd4 = Object.keys(_0x59014a);
                for (var _0x52cf11 = 0; _0x52cf11 < _0x5b5dd4.length; _0x52cf11++) {
                  if (_0x1ca577(_0x59014a[_0x5b5dd4[_0x52cf11]])) {
                    return true;
                  }
                }
              }
            }
            return false;
          }
          var _0x34ed67 = _0x5975e6.filter(function (_0x171c0c) {
            return _0x1ca577(_0x171c0c);
          });
          return _0x34ed67;
        }
        function _0x557dec(_0x365865) {
          _0x365865 = _0x35329b(_0x365865);
          return _0x365865;
        }
        function _0x220e83(_0x4e1721) {
          var _0x5716ac = _0x490c3e("minVotes");
          _0x5716ac = parseInt(_0x5716ac, 10);
          if (isNaN(_0x5716ac)) {
            _0x5716ac = 10;
          }
          if (_0x5716ac > 0) {
            _0x4e1721 += "&vote_count.gte=" + _0x5716ac;
          }
          return _0x4e1721;
        }
        function _0x24da43(_0x558341) {
          var _0x1e1ff7 = _0x490c3e("ageRestrictions");
          if (_0x1e1ff7 && String(_0x1e1ff7).trim() !== '') {
            var _0x1b5747 = {
              '0+': '0+',
              '6+': '6+',
              '12+': "12+",
              '16+': "16+",
              '18+': "18+"
            };
            if (_0x1b5747.hasOwnProperty(_0x1e1ff7)) {
              _0x558341 += "&certification_country=RU&certification=" + encodeURIComponent(_0x1b5747[_0x1e1ff7]);
            }
          }
          return _0x558341;
        }
        function _0x5bb6e6(_0xaaa50a) {
          var _0x5cf852 = _0x490c3e("withoutKeywords");
          var _0x479466 = ["346488", "158718", "41278"];
          if (!_0x5cf852 || _0x5cf852 == '1') {
            _0x479466.push("13141", "345822", "315535", "290667", "323477", "290609");
          }
          if (_0x5cf852 == '2') {
            _0x479466.push("210024", "13141", "345822", "315535", "290667", "323477", "290609");
          }
          _0xaaa50a += "&without_keywords=" + encodeURIComponent(_0x479466.join(','));
          return _0xaaa50a;
        }
        function _0xb79fb6(_0x201518) {
          _0x201518 = _0x220e83(_0x201518);
          _0x201518 = _0x24da43(_0x201518);
          _0x201518 = _0x5bb6e6(_0x201518);
          return _0x201518;
        }
        function _0x121b0b(_0x154bc6) {
          for (var _0x34ab4c = _0x154bc6.length - 1; _0x34ab4c > 0; _0x34ab4c--) {
            var _0x1b0593 = Math.floor(Math.random() * (_0x34ab4c + 1));
            var _0x767de8 = _0x154bc6[_0x34ab4c];
            _0x154bc6[_0x34ab4c] = _0x154bc6[_0x1b0593];
            _0x154bc6[_0x1b0593] = _0x767de8;
          }
        }
        function _0x32be78(_0x3029b9) {
          if (_0x3029b9.id === "first_air_date.desc") {
            _0x3029b9 = {
              'id': "release_date.desc",
              'title': "Новинки"
            };
          }
          if (_0x3029b9.id === "release_date.desc") {
            var _0x3b306f = new Date().toISOString().split('T')[0];
            var _0x2668df = new Date();
            _0x2668df.setFullYear(_0x2668df.getFullYear() - 1);
            _0x2668df = _0x2668df.toISOString().split('T')[0];
            _0x3029b9.extraParams = "&release_date.gte=" + _0x2668df + "&release_date.lte=" + _0x3b306f;
          }
          return _0x3029b9;
        }
        var _0x34d8b2 = [function (_0x18f906) {
          var _0x557f26 = "trending/movie/week";
          _0x557f26 = _0x24da43(_0x557f26);
          _0x4a1e0e.get(_0x557f26, _0x4ecf36, function (_0x56d20a) {
            if (_0x56d20a.results) {
              _0x56d20a.results = _0x56d20a.results.filter(function (_0x5e5767) {
                var _0x4e2782 = ['KR', 'CN', 'JP'];
                return !_0x5e5767.origin_country || !_0x5e5767.origin_country.some(function (_0x2a8329) {
                  return _0x4e2782.includes(_0x2a8329);
                });
              });
            }
            _0x56d20a.title = Lampa.Lang.translate("Популярные фильмы");
            _0x18f906(_0x56d20a);
          }, _0x18f906);
        }, function (_0x51923d) {
          var _0x21bfea = "trending/tv/week";
          _0x21bfea = _0x24da43(_0x21bfea);
          _0x4a1e0e.get(_0x21bfea, _0x4ecf36, function (_0x57d128) {
            if (_0x57d128.results) {
              _0x57d128.results = _0x557dec(_0x57d128.results);
              _0x57d128.results = _0x57d128.results.filter(function (_0x21084f) {
                var _0x4ba060 = ['KR', 'CN', 'JP'];
                return !_0x21084f.origin_country || !_0x21084f.origin_country.some(function (_0x4c7d0f) {
                  return _0x4ba060.includes(_0x4c7d0f);
                });
              });
            }
            _0x57d128.title = Lampa.Lang.translate("Популярные сериалы");
            _0x51923d(_0x57d128);
          }, _0x51923d);
        }];
        var _0x5ce2cd = [];
        var _0x3af302 = function (_0x193700) {
          _0x193700({
            'source': "tmdb",
            'results': Lampa.TimeTable.lately().slice(0, 20),
            'title': Lampa.Lang.translate("title_upcoming_episodes"),
            'nomore': true,
            'cardClass': function (_0x375688, _0x10810d) {
              return new _0x450ff0(_0x375688, _0x10810d);
            }
          });
        };
        function _0x1ddd73(_0x3a8a22, _0x6332d1, _0x32b47e) {
          return function (_0x15cfdd) {
            var _0x4fd98b = _0x4276a1(_0x4687f1, "sort_");
            var _0x2e2587 = _0x4276a1(_0x310eb8, "genre_");
            var _0x303fb8 = _0x4fd98b[Math.floor(Math.random() * _0x4fd98b.length)];
            var _0x58f379 = _0x2e2587[Math.floor(Math.random() * _0x2e2587.length)];
            var _0x329133 = "discover/tv?with_networks=" + _0x6332d1 + "&with_genres=" + _0x58f379.id + "&sort_by=" + _0x303fb8.id;
            if (_0x32b47e) {
              _0x329133 = _0x24da43(_0x329133);
              _0x329133 = _0x5bb6e6(_0x329133);
            } else {
              _0x329133 = _0xb79fb6(_0x329133);
            }
            _0x4a1e0e.get(_0x329133, _0x4ecf36, function (_0x39a70e) {
              if (_0x39a70e.results) {
                _0x39a70e.results = _0x557dec(_0x39a70e.results);
              }
              _0x39a70e.title = Lampa.Lang.translate(_0x303fb8.title + " (" + _0x58f379.title + ") на " + _0x3a8a22);
              _0x15cfdd(_0x39a70e);
            }, _0x15cfdd);
          };
        }
        function _0x1f2d03(_0x136aa9, _0x42d575, _0x317734) {
          return function (_0x54b5b5) {
            var _0x7bdd0 = _0x4276a1(_0x4687f1, "sort_");
            var _0x55d053 = _0x7bdd0[Math.floor(Math.random() * _0x7bdd0.length)];
            var _0x4b7987 = "discover/tv?with_networks=" + _0x42d575 + "&sort_by=" + _0x55d053.id;
            if (_0x317734) {
              _0x4b7987 = _0x24da43(_0x4b7987);
              _0x4b7987 = _0x5bb6e6(_0x4b7987);
            } else {
              _0x4b7987 = _0xb79fb6(_0x4b7987);
            }
            _0x4a1e0e.get(_0x4b7987, _0x4ecf36, function (_0x3f3907) {
              if (_0x3f3907.results) {
                _0x3f3907.results = _0x557dec(_0x3f3907.results);
              }
              _0x3f3907.title = Lampa.Lang.translate(_0x55d053.title + " на " + _0x136aa9);
              _0x54b5b5(_0x3f3907);
            }, _0x54b5b5);
          };
        }
        function _0x1ae2cc() {
          var _0x251536 = _0x490c3e("getStreamingServices", true);
          var _0x20ca06 = _0x490c3e("getStreamingServicesRUS", true);
          var _0xf4f59c = _0x4276a1(_0x3137f9, "streaming_");
          var _0x1c5588 = _0x4276a1(_0x577bf6, "streaming_rus_");
          if (_0x251536 && _0x20ca06) {
            return _0xf4f59c.concat(_0x1c5588);
          } else {
            if (_0x251536) {
              return _0xf4f59c;
            } else {
              if (_0x20ca06) {
                return _0x1c5588;
              }
            }
          }
          return [];
        }
        var _0x30068a = _0x1ae2cc();
        _0x30068a.forEach(function (_0x2c6ae6) {
          var _0x28113b = _0x4276a1(_0x577bf6, "streaming_rus_").some(_0x54377a => _0x54377a.id === _0x2c6ae6.id);
          _0x5ce2cd.push(_0x1ddd73(_0x2c6ae6.title, _0x2c6ae6.id, _0x28113b));
        });
        _0x30068a.forEach(function (_0x58cc55) {
          var _0x34a594 = _0x4276a1(_0x577bf6, "streaming_rus_").some(_0x1859a0 => _0x1859a0.id === _0x58cc55.id);
          _0x5ce2cd.push(_0x1f2d03(_0x58cc55.title, _0x58cc55.id, _0x34a594));
        });
        function _0x793980(_0x5b516a, _0x5aebb3) {
          _0x5aebb3 = _0x5aebb3 || {};
          return function (_0x1c2a5c) {
            var _0x143a7c = _0x4276a1(_0x4687f1, "sort_");
            var _0x2ee0c9 = _0x32be78(_0x143a7c[Math.floor(Math.random() * _0x143a7c.length)]);
            var _0x557a57 = "discover/movie?with_genres=" + _0x5b516a.id + "&sort_by=" + _0x2ee0c9.id;
            if (_0x5aebb3.russian) {
              _0x557a57 += "&with_original_language=ru";
            }
            if (_0x2ee0c9.id === "release_date.desc") {
              var _0x5c5acb = new Date().toISOString().split('T')[0];
              _0x557a57 += "&release_date.lte=" + _0x5c5acb;
              if (_0x5aebb3.russian) {
                _0x557a57 += "&region=RU";
              }
            }
            if (_0x2ee0c9.extraParams) {
              _0x557a57 += _0x2ee0c9.extraParams;
            }
            var _0x13f147 = [];
            var _0x572434 = 1;
            var _0x1e9990 = 0;
            var _0x495979 = 1;
            function _0x354c46() {
              var _0x58eaca = _0x5aebb3.russian ? " - российские" : '';
              var _0x2fae2a = {
                'results': _0x13f147,
                'title': Lampa.Lang.translate(_0x2ee0c9.title + _0x58eaca + " (" + _0x5b516a.title + ')')
              };
              _0x1c2a5c(_0x2fae2a);
            }
            function _0x47c1a3() {
              var _0x2f61b6 = _0x557a57 + "&page=" + _0x495979;
              _0x2f61b6 = _0xb79fb6(_0x2f61b6);
              _0x4a1e0e.get(_0x2f61b6, _0x4ecf36, function (_0x20662e) {
                if (_0x20662e && _0x20662e.results) {
                  _0x13f147 = _0x13f147.concat(_0x20662e.results);
                }
                _0x495979++;
                if (_0x495979 > _0x572434) {
                  if (!_0x5aebb3.russian) {
                    _0x13f147 = _0x557dec(_0x13f147);
                  }
                  if (_0x13f147.length < 10 && _0x1e9990 < 5) {
                    _0x1e9990++;
                    _0x572434++;
                    _0x47c1a3();
                  } else {
                    _0x354c46();
                  }
                } else {
                  setTimeout(_0x47c1a3, 100);
                }
              }, function () {
                _0x495979++;
                if (_0x495979 > _0x572434) {
                  if (!_0x5aebb3.russian) {
                    _0x13f147 = _0x557dec(_0x13f147);
                  }
                  if (_0x13f147.length < 10 && _0x1e9990 < 5) {
                    _0x1e9990++;
                    _0x572434++;
                    _0x47c1a3();
                  } else {
                    _0x354c46();
                  }
                } else {
                  setTimeout(_0x47c1a3, 100);
                }
              });
            }
            _0x47c1a3();
          };
        }
        function _0x181425(_0x58a6d2, _0x4cea7e) {
          _0x4cea7e = _0x4cea7e || {};
          return function (_0x148cb2) {
            var _0x36265c = _0x4276a1(_0x4687f1, "sort_");
            var _0x48eb67 = _0x36265c[Math.floor(Math.random() * _0x36265c.length)];
            var _0x107f05 = "discover/tv?with_genres=" + _0x58a6d2.id + "&sort_by=" + _0x48eb67.id;
            if (_0x4cea7e.russian) {
              _0x107f05 += "&with_origin_country=RU";
            }
            if (_0x4cea7e.korean) {
              _0x107f05 += "&with_origin_country=KR";
            }
            var _0x193fd9 = 1;
            var _0x1422f2 = 0;
            var _0x17cd6b = [];
            var _0x1e273f = 1;
            function _0x1e3f22() {
              var _0x469ad5 = _0x4cea7e.russian ? " - российские" : _0x4cea7e.korean ? " - южнокорейские" : '';
              var _0xbdea8e = {
                'results': _0x17cd6b,
                'title': Lampa.Lang.translate(_0x48eb67.title + _0x469ad5 + " сериалы (" + _0x58a6d2.title + ')')
              };
              _0x148cb2(_0xbdea8e);
            }
            function _0x3fc11a() {
              var _0x20f176 = _0x107f05 + "&page=" + _0x1e273f;
              _0x20f176 = _0xb79fb6(_0x20f176);
              _0x4a1e0e.get(_0x20f176, _0x4ecf36, function (_0x1ede12) {
                if (_0x1ede12 && _0x1ede12.results) {
                  _0x17cd6b = _0x17cd6b.concat(_0x1ede12.results);
                }
                _0x1e273f++;
                if (_0x1e273f > _0x193fd9) {
                  if (!_0x4cea7e.russian) {
                    _0x17cd6b = _0x557dec(_0x17cd6b);
                  }
                  if (_0x17cd6b.length < 10 && _0x1422f2 < 5) {
                    _0x1422f2++;
                    _0x193fd9++;
                    _0x3fc11a();
                  } else {
                    _0x1e3f22();
                  }
                } else {
                  setTimeout(_0x3fc11a, 100);
                }
              }, function () {
                _0x1e273f++;
                if (_0x1e273f > _0x193fd9) {
                  if (!_0x4cea7e.russian) {
                    _0x17cd6b = _0x557dec(_0x17cd6b);
                  }
                  if (_0x17cd6b.length < 10 && _0x1422f2 < 5) {
                    _0x1422f2++;
                    _0x193fd9++;
                    _0x3fc11a();
                  } else {
                    _0x1e3f22();
                  }
                } else {
                  setTimeout(_0x3fc11a, 100);
                }
              });
            }
            _0x3fc11a();
          };
        }
        var _0x32e04b = _0x4276a1(_0x310eb8, "genre_");
        var _0x1f1965 = _0x490c3e("getMoviesByGenreGlobal", true);
        var _0x283c26 = _0x490c3e("getMoviesByGenreRus", true);
        var _0x5b4655 = _0x490c3e("getTVShowsByGenreGlobal", true);
        var _0x44d0b6 = _0x490c3e("getTVShowsByGenreRus", true);
        var _0x42b7f4 = _0x490c3e("getTVShowsByGenreKOR", true);
        _0x32e04b.forEach(function (_0x178945) {
          if (_0x1f1965) {
            _0x5ce2cd.push(_0x793980(_0x178945));
          }
          if (_0x283c26) {
            _0x5ce2cd.push(_0x793980(_0x178945, {
              'russian': true
            }));
          }
        });
        _0x32e04b.forEach(function (_0x479881) {
          if (_0x5b4655) {
            _0x5ce2cd.push(_0x181425(_0x479881));
          }
          if (_0x44d0b6) {
            _0x5ce2cd.push(_0x181425(_0x479881, {
              'russian': true
            }));
          }
          if (_0x42b7f4) {
            _0x5ce2cd.push(_0x181425(_0x479881, {
              'korean': true
            }));
          }
        });
        function _0x25144f(_0x2e52f6, _0x3ff749) {
          return function (_0x4b49ee) {
            var _0x3b2f68 = "discover/" + _0x3ff749 + "?with_genres=" + _0x2e52f6.id + "&sort_by=vote_average.desc" + "&vote_count.gte=500";
            _0x3b2f68 = _0x24da43(_0x3b2f68);
            _0x3b2f68 = _0x5bb6e6(_0x3b2f68);
            _0x4a1e0e.get(_0x3b2f68, _0x4ecf36, function (_0x31269f) {
              if (_0x31269f.results) {
                _0x31269f.results = _0x35329b(_0x31269f.results);
              }
              _0x31269f.title = Lampa.Lang.translate(_0x3ff749 === "movie" ? "Топ фильмы (" + _0x2e52f6.title + ')' : "Топ сериалы (" + _0x2e52f6.title + ')');
              _0x4b49ee(_0x31269f);
            }, _0x4b49ee);
          };
        }
        _0x32e04b.forEach(function (_0x35479c) {
          var _0x5c92cf = _0x490c3e("getBestContentByGenreMovie", true);
          var _0x315afe = _0x490c3e("getBestContentByGenreTV", true);
          if (_0x5c92cf) {
            _0x5ce2cd.push(_0x25144f(_0x35479c, "movie"));
          }
          if (_0x315afe) {
            _0x5ce2cd.push(_0x25144f(_0x35479c, 'tv'));
          }
        });
        function _0x5db03b(_0x2bb027, _0x514eba, _0x5d64fa, _0x330de0) {
          return function (_0x491117) {
            var _0x591a4d = "discover/" + _0x2bb027 + "?with_genres=" + _0x514eba.id + "&sort_by=vote_average.desc" + "&vote_count.gte=500" + '&' + (_0x2bb027 === "movie" ? "primary_release_date" : "first_air_date") + ".gte=" + _0x5d64fa + "-01-01" + '&' + (_0x2bb027 === "movie" ? "primary_release_date" : "first_air_date") + ".lte=" + _0x330de0 + "-12-31";
            _0x591a4d = _0x24da43(_0x591a4d);
            _0x591a4d = _0x5bb6e6(_0x591a4d);
            _0x4a1e0e.get(_0x591a4d, _0x4ecf36, function (_0x5e6e79) {
              if (_0x5e6e79.results) {
                _0x5e6e79.results = _0x557dec(_0x5e6e79.results).filter(function (_0x5c8581) {
                  var _0x3c19fb = _0x2bb027 === "movie" ? "release_date" : "first_air_date";
                  return _0x5c8581[_0x3c19fb] && parseInt(_0x5c8581[_0x3c19fb].substring(0, 4)) >= _0x5d64fa && parseInt(_0x5c8581[_0x3c19fb].substring(0, 4)) <= _0x330de0;
                });
              }
              _0x5e6e79.title = Lampa.Lang.translate("Топ " + (_0x2bb027 === "movie" ? "фильмы" : "сериалы") + " (" + _0x514eba.title + ") за " + _0x5d64fa + '-' + _0x330de0);
              _0x491117(_0x5e6e79);
            }, _0x491117);
          };
        }
        var _0x30cca7 = [{
          'start': 0x7c1,
          'end': 0x7c5
        }, {
          'start': 0x7c6,
          'end': 0x7d4
        }, {
          'start': 0x7cb,
          'end': 0x7cf
        }, {
          'start': 0x7d0,
          'end': 0x7d4
        }, {
          'start': 0x7d5,
          'end': 0x7d9
        }, {
          'start': 0x7da,
          'end': 0x7de
        }, {
          'start': 0x7df,
          'end': 0x7e3
        }, {
          'start': 0x7e4,
          'end': 0x7e9
        }];
        function _0x568346() {
          var _0x1a947d = Math.floor(Math.random() * _0x30cca7.length);
          return _0x30cca7[_0x1a947d];
        }
        _0x32e04b.forEach(function (_0x29fbb1) {
          var _0x36622a = _0x490c3e("getBestContentByGenreAndPeriod_movie", true);
          var _0x464f04 = _0x490c3e("getBestContentByGenreAndPeriod_tv", true);
          var _0x410c9c = _0x568346();
          if (_0x36622a) {
            _0x5ce2cd.push(_0x5db03b("movie", _0x29fbb1, _0x410c9c.start, _0x410c9c.end));
          }
          if (_0x464f04) {
            _0x5ce2cd.push(_0x5db03b('tv', _0x29fbb1, _0x410c9c.start, _0x410c9c.end));
          }
        });
        function _0x575447(_0x2ebd98) {
          return function (_0x18c228) {
            _0x2ebd98(function (_0x1e0529) {
              if (Math.random() < 0.2) {
                _0x1e0529.small = true;
                _0x1e0529.wide = true;
                if (Array.isArray(_0x1e0529.results)) {
                  _0x1e0529.results.forEach(function (_0x5f0b29) {
                    _0x5f0b29.promo = _0x5f0b29.overview;
                    _0x5f0b29.promo_title = _0x5f0b29.title || _0x5f0b29.name;
                  });
                }
              }
              _0x18c228(_0x1e0529);
            });
          };
        }
        _0x5ce2cd = _0x5ce2cd.map(_0x575447);
        _0x34d8b2.splice(3, 0, Lampa.Api.partPersons(_0x34d8b2, _0x34d8b2.length - 4, "movie"));
        _0x5ce2cd.splice(10, 0, Lampa.Api.partPersons(_0x5ce2cd, _0x5ce2cd.length - 5, 'tv'));
        _0x121b0b(_0x5ce2cd);
        _0x5ce2cd.splice(4, 0, _0x3af302);
        var _0x2b9dff = _0x34d8b2.concat(_0x5ce2cd);
        function _0x522737(_0x371318, _0x3e344a) {
          Lampa.Api.partNext(_0x2b9dff, 7, _0x371318, _0x3e344a);
        }
        _0x522737(_0x4c508f, _0xa6f809);
        return _0x522737;
      };
    };
    var _0x212ad4 = function (_0x5551d2) {
      this.network = new Lampa.Reguest();
      this.discovery = false;
      this.main = function () {
        var _0x366951 = this;
        var _0x666e66 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var _0x2bdd9f = arguments.length > 1 ? arguments[1] : undefined;
        var _0x3f1562 = arguments.length > 2 ? arguments[2] : undefined;
        var _0x5177f1 = [{
          'key': "vote_count.desc",
          'title': "Много голосов"
        }, {
          'key': "vote_average.desc",
          'title': "Высокий рейтинг"
        }, {
          'key': "first_air_date.desc",
          'title': "Новинки"
        }, {
          'key': "popularity.desc",
          'title': "Популярные"
        }, {
          'key': "revenue.desc",
          'title': "Интерес зрителей"
        }];
        var _0x442ba4 = [{
          'id': 0x1c,
          'title': "боевики"
        }, {
          'id': 0x23,
          'title': "комедии"
        }, {
          'id': 0x10,
          'title': "мультфильмы"
        }, {
          'id': 0x2a0a,
          'title': "детское"
        }, {
          'id': 0xc,
          'title': "приключения"
        }, {
          'id': 0x36e,
          'title': "фантастика"
        }, {
          'id': 0x29ff,
          'title': "семейные"
        }, {
          'id': 0xe,
          'title': "фэнтези"
        }];
        var _0x53dfe1 = [{
          'id': 0x31,
          'title': "HBO"
        }, {
          'id': 0x4d,
          'title': "SyFy"
        }, {
          'id': 0x9f8,
          'title': "Apple TV+"
        }, {
          'id': 0x1c5,
          'title': "Hulu"
        }, {
          'id': 0x400,
          'title': "Amazon Prime"
        }, {
          'id': 0xd5,
          'title': "Netflix"
        }, {
          'id': 0xc72,
          'title': "HBO Max"
        }, {
          'id': 0x81c,
          'title': "Paramount+"
        }, {
          'id': 0xd19,
          'title': "Peacock"
        }, {
          'id': 0xab3,
          'title': "Disney+"
        }, {
          'id': 0x2,
          'title': "ABC"
        }, {
          'id': 0x6,
          'title': "NBC"
        }, {
          'id': 0x10,
          'title': "CBS"
        }, {
          'id': 0x13e,
          'title': "Starz"
        }, {
          'id': 0xae,
          'title': "BBC"
        }];
        var _0x322009 = [{
          'id': 0x9bd,
          'title': "Start"
        }, {
          'id': 0xb2b,
          'title': "Premier"
        }, {
          'id': 0xff5,
          'title': "KION"
        }, {
          'id': 0xf53,
          'title': "ИВИ"
        }, {
          'id': 0x19c,
          'title': "Россия 1"
        }, {
          'id': 0x22e,
          'title': "Первый канал"
        }, {
          'id': 0xef3,
          'title': "Кинопоиск"
        }, {
          'id': 0x16ae,
          'title': "Wink"
        }];
        function _0x348ef1(_0x3f16a3) {
          function _0x4b02c9(_0x301d22) {
            if (typeof _0x301d22 === "string") {
              return /[а-яА-ЯёЁ]/.test(_0x301d22);
            } else {
              if (typeof _0x301d22 === "object" && _0x301d22 !== null) {
                for (const _0x2bf232 of Object.values(_0x301d22)) {
                  if (_0x4b02c9(_0x2bf232)) {
                    return true;
                  }
                }
              }
            }
            return false;
          }
          return _0x3f16a3.filter(function (_0x415186) {
            return _0x4b02c9(_0x415186);
          });
        }
        function _0x4d9101(_0x1ae02a) {
          _0x1ae02a += "&vote_count.gte=5";
          return _0x1ae02a;
        }
        function _0x3704a9(_0x3c010d) {
          _0x3c010d += "&certification_country=RU&certification=" + encodeURIComponent('6+');
          return _0x3c010d;
        }
        function _0x26ed5(_0x43e5cf) {
          var _0x454bd9 = ["346488", "158718", "41278", "13141", "345822", "315535", "290667", "323477", "290609"];
          _0x43e5cf += "&without_keywords=" + encodeURIComponent(_0x454bd9.join(','));
          return _0x43e5cf;
        }
        function _0x529ca2(_0x2fad9a) {
          _0x2fad9a = _0x4d9101(_0x2fad9a);
          _0x2fad9a = _0x3704a9(_0x2fad9a);
          _0x2fad9a = _0x26ed5(_0x2fad9a);
          return _0x2fad9a;
        }
        function _0x39105d(_0x1f82f8) {
          for (var _0x331188 = _0x1f82f8.length - 1; _0x331188 > 0; _0x331188--) {
            var _0x3629d8 = Math.floor(Math.random() * (_0x331188 + 1));
            var _0x17e8d8 = _0x1f82f8[_0x331188];
            _0x1f82f8[_0x331188] = _0x1f82f8[_0x3629d8];
            _0x1f82f8[_0x3629d8] = _0x17e8d8;
          }
        }
        function _0x5a38c4(_0x436e15) {
          if (_0x436e15.key === "first_air_date.desc") {
            _0x436e15 = {
              'key': "release_date.desc",
              'title': "Новинки"
            };
          }
          if (_0x436e15.key === "release_date.desc") {
            var _0x399bf5 = new Date().toISOString().split('T')[0];
            var _0x4fb304 = new Date();
            _0x4fb304.setFullYear(_0x4fb304.getFullYear() - 1);
            _0x4fb304 = _0x4fb304.toISOString().split('T')[0];
            _0x436e15.extraParams = "&release_date.gte=" + _0x4fb304 + "&release_date.lte=" + _0x399bf5;
          }
          return _0x436e15;
        }
        var _0x2a190a = [function (_0x47e8d3) {
          var _0x2aebbb = "movie/now_playing";
          _0x2aebbb = _0x3704a9(_0x2aebbb);
          _0x366951.get(_0x2aebbb, _0x666e66, function (_0xeafda9) {
            _0xeafda9.title = Lampa.Lang.translate("Сейчас смотрят");
            _0x47e8d3(_0xeafda9);
          }, _0x47e8d3);
        }, function (_0x3dad64) {
          var _0x464a60 = "trending/movie/week";
          _0x464a60 = _0x3704a9(_0x464a60);
          _0x366951.get(_0x464a60, _0x666e66, function (_0xc778de) {
            _0xc778de.title = Lampa.Lang.translate("Популярные фильмы");
            _0x3dad64(_0xc778de);
          }, _0x3dad64);
        }, function (_0x297e20) {
          var _0x109a6f = "trending/tv/week";
          _0x109a6f = _0x3704a9(_0x109a6f);
          _0x366951.get(_0x109a6f, _0x666e66, function (_0x3f1702) {
            _0x3f1702.title = Lampa.Lang.translate("Популярные сериалы");
            _0x297e20(_0x3f1702);
          }, _0x297e20);
        }];
        var _0x162bbb = function (_0x4df9b8) {
          _0x4df9b8({
            'source': "tmdb",
            'results': Lampa.TimeTable.lately().slice(0, 20),
            'title': Lampa.Lang.translate("title_upcoming_episodes"),
            'nomore': true,
            'cardClass': function (_0x35c678, _0x41a399) {
              return new _0x450ff0(_0x35c678, _0x41a399);
            }
          });
        };
        function _0x205eb1(_0x4dd7f0, _0x100282) {
          return function (_0x559a6d) {
            var _0x3126fc = _0x5177f1[Math.floor(Math.random() * _0x5177f1.length)];
            var _0x16d174 = _0x442ba4[Math.floor(Math.random() * _0x442ba4.length)];
            var _0x95b906 = _0x529ca2("discover/tv?with_networks=" + _0x100282 + "&with_genres=" + _0x16d174.id + "&sort_by=" + _0x3126fc.key + "&air_date.lte=" + new Date().toISOString().substr(0, 10));
            _0x366951.get(_0x95b906, _0x666e66, function (_0x454496) {
              if (_0x454496.results) {
                _0x454496.results = _0x348ef1(_0x454496.results);
              }
              _0x454496.title = Lampa.Lang.translate(_0x3126fc.title + " (" + _0x16d174.title + ") на " + _0x4dd7f0);
              _0x559a6d(_0x454496);
            }, _0x559a6d);
          };
        }
        function _0x2fb844(_0x2c293d, _0xf83a90) {
          return function (_0x21b53c) {
            var _0xb3489e = _0x5177f1[Math.floor(Math.random() * _0x5177f1.length)];
            var _0x513227 = _0x529ca2("discover/tv?with_networks=" + _0xf83a90 + "&sort_by=" + _0xb3489e.key + "&air_date.lte=" + new Date().toISOString().substr(0, 10));
            _0x366951.get(_0x513227, _0x666e66, function (_0x2d6a80) {
              if (_0x2d6a80.results) {
                _0x2d6a80.results = _0x348ef1(_0x2d6a80.results);
              }
              _0x2d6a80.title = Lampa.Lang.translate(_0xb3489e.title + " на " + _0x2c293d);
              _0x21b53c(_0x2d6a80);
            }, _0x21b53c);
          };
        }
        var _0x474fc1 = _0x53dfe1.concat(_0x322009);
        _0x474fc1.forEach(function (_0x195ecd) {
          _0x2a190a.push(_0x205eb1(_0x195ecd.title, _0x195ecd.id));
          _0x2a190a.push(_0x2fb844(_0x195ecd.title, _0x195ecd.id));
        });
        function _0x3f18b3(_0x20539b, _0x41cc9b = {}) {
          return function (_0x16c670) {
            var _0x295d4d = _0x5a38c4(_0x5177f1[Math.floor(Math.random() * _0x5177f1.length)]);
            var _0x449b66 = "discover/movie?with_genres=" + _0x20539b.id + "&sort_by=" + _0x295d4d.key;
            if (_0x41cc9b.russian) {
              _0x449b66 += "&with_original_language=ru";
            }
            if (_0x295d4d.key === "release_date.desc") {
              var _0x2d0fe1 = new Date().toISOString().split('T')[0];
              _0x449b66 += "&release_date.lte=" + _0x2d0fe1;
              if (_0x41cc9b.russian) {
                _0x449b66 += "&region=RU";
              }
            }
            if (_0x295d4d.extraParams) {
              _0x449b66 += _0x295d4d.extraParams;
            }
            _0x449b66 = _0x529ca2(_0x449b66);
            _0x366951.get(_0x449b66, _0x666e66, function (_0x5ca77d) {
              if (!_0x41cc9b.russian && _0x5ca77d.results) {
                _0x5ca77d.results = _0x348ef1(_0x5ca77d.results);
              }
              var _0x5210b9 = _0x41cc9b.russian ? " - российские" : '';
              _0x5ca77d.title = Lampa.Lang.translate(_0x295d4d.title + _0x5210b9 + " (" + _0x20539b.title + ')');
              _0x16c670(_0x5ca77d);
            }, _0x16c670);
          };
        }
        _0x442ba4.forEach(function (_0x28a3f5) {
          _0x2a190a.push(_0x3f18b3(_0x28a3f5));
          _0x2a190a.push(_0x3f18b3(_0x28a3f5, {
            'russian': true
          }));
        });
        function _0x4bca06(_0x3b6668, _0x4d002d = {}) {
          return function (_0x1d6a99) {
            var _0x1b3214 = _0x5177f1[Math.floor(Math.random() * _0x5177f1.length)];
            var _0x4b3bfe = "discover/tv?with_genres=" + _0x3b6668.id + "&sort_by=" + _0x1b3214.key;
            if (_0x4d002d.russian) {
              _0x4b3bfe += "&with_origin_country=RU";
            }
            _0x4b3bfe = _0x529ca2(_0x4b3bfe);
            _0x366951.get(_0x4b3bfe, _0x666e66, function (_0x271303) {
              if (!_0x4d002d.russian && _0x271303.results) {
                _0x271303.results = _0x348ef1(_0x271303.results);
              }
              var _0x3874a1 = _0x4d002d.russian ? " - российские" : '';
              _0x271303.title = Lampa.Lang.translate(_0x1b3214.title + _0x3874a1 + " сериалы (" + _0x3b6668.title + ')');
              _0x1d6a99(_0x271303);
            }, _0x1d6a99);
          };
        }
        _0x442ba4.forEach(function (_0x1ae530) {
          _0x2a190a.push(_0x4bca06(_0x1ae530));
          _0x2a190a.push(_0x4bca06(_0x1ae530, {
            'russian': true
          }));
        });
        function _0x566bba(_0x3ad7b4) {
          return function (_0x4db40e) {
            var _0x50a799 = ['16', "10751"];
            for (var _0x5be018 = 0; _0x5be018 < _0x5177f1.length; _0x5be018++) {
              var _0x4d1b53 = _0x5177f1[_0x5be018];
              var _0x35cc3a = _0x5a38c4(_0x4d1b53);
              var _0x3b4655 = "discover/movie?with_genres=" + _0x50a799.join(',') + "&sort_by=" + _0x35cc3a.key;
              if (_0x3ad7b4 && _0x3ad7b4.russian) {
                _0x3b4655 += "&with_original_language=ru";
              }
              if (_0x35cc3a.key === "release_date.desc") {
                var _0x20cc04 = new Date().toISOString().split('T')[0];
                _0x3b4655 += "&release_date.lte=" + _0x20cc04;
                if (_0x3ad7b4 && _0x3ad7b4.russian) {
                  _0x3b4655 += "&region=RU";
                }
              }
              if (_0x35cc3a.extraParams) {
                _0x3b4655 += _0x35cc3a.extraParams;
              }
              _0x3b4655 = _0x529ca2(_0x3b4655);
              _0x366951.get(_0x3b4655, _0x666e66, function (_0x58eda8) {
                return function (_0x5c374e) {
                  if (_0x5c374e.results) {
                    _0x5c374e.results = _0x348ef1(_0x5c374e.results);
                  }
                  var _0x398e96 = _0x3ad7b4 && _0x3ad7b4.russian ? " - российские" : '';
                  _0x5c374e.title = Lampa.Lang.translate(_0x58eda8.title + _0x398e96 + " (Мультфильмы, Детское)");
                  _0x4db40e(_0x5c374e);
                };
              }(_0x4d1b53), _0x4db40e);
            }
          };
        }
        for (var _0x2b47a7 = 0; _0x2b47a7 < _0x5177f1.length; _0x2b47a7++) {
          _0x2a190a.push(_0x566bba());
          _0x2a190a.push(_0x566bba({
            'russian': true
          }));
        }
        function _0x53d906(_0x10a505, _0x3aedca) {
          return function (_0x39d3f4) {
            var _0x1a2985 = "discover/" + _0x3aedca + "?with_genres=" + _0x10a505.id + "&sort_by=vote_average.desc" + "&vote_count.gte=200";
            var _0x11909d = _0x1a2985 + "&with_origin_country=RU";
            _0x1a2985 = _0x3704a9(_0x1a2985);
            _0x1a2985 = _0x26ed5(_0x1a2985);
            _0x11909d = _0x3704a9(_0x11909d);
            _0x11909d = _0x26ed5(_0x11909d);
            _0x366951.get(_0x1a2985, _0x666e66, function (_0x2b142a) {
              if (_0x2b142a.results) {
                _0x2b142a.results = _0x348ef1(_0x2b142a.results);
              }
              _0x2b142a.title = Lampa.Lang.translate(_0x3aedca === "movie" ? "Топ фильмы (" + _0x10a505.title + ')' : "Топ сериалы (" + _0x10a505.title + ')');
              _0x39d3f4(_0x2b142a);
            }, _0x39d3f4);
            _0x366951.get(_0x11909d, _0x666e66, function (_0x3b6031) {
              if (_0x3b6031.results) {
                _0x3b6031.results = _0x348ef1(_0x3b6031.results);
              }
              _0x3b6031.title = Lampa.Lang.translate(_0x3aedca === "movie" ? "Лучшие российские фильмы (" + _0x10a505.title + ')' : "Лучшие российские сериалы (" + _0x10a505.title + ')');
              _0x39d3f4(_0x3b6031);
            }, _0x39d3f4);
          };
        }
        _0x442ba4.forEach(function (_0x434280) {
          _0x2a190a.push(_0x53d906(_0x434280, "movie"));
          _0x2a190a.push(_0x53d906(_0x434280, 'tv'));
        });
        function _0x478e53(_0xa9deac, _0x4e1c2b, _0x168c5a, _0x489273) {
          return function (_0x2b3d7c) {
            var _0x5afd90 = "discover/" + _0xa9deac + "?with_genres=" + _0x4e1c2b.id + "&sort_by=vote_average.desc" + "&vote_count.gte=100" + '&' + (_0xa9deac === "movie" ? "primary_release_date" : "first_air_date") + ".gte=" + _0x168c5a + "-01-01" + '&' + (_0xa9deac === "movie" ? "primary_release_date" : "first_air_date") + ".lte=" + _0x489273 + "-12-31";
            _0x5afd90 = _0x3704a9(_0x5afd90);
            _0x5afd90 = _0x26ed5(_0x5afd90);
            _0x366951.get(_0x5afd90, _0x666e66, function (_0x51233b) {
              if (_0x51233b.results) {
                _0x51233b.results = _0x348ef1(_0x51233b.results).filter(function (_0x54e35c) {
                  var _0x3c6d86 = _0xa9deac === "movie" ? "release_date" : "first_air_date";
                  return _0x54e35c[_0x3c6d86] && parseInt(_0x54e35c[_0x3c6d86].substring(0, 4)) >= _0x168c5a && parseInt(_0x54e35c[_0x3c6d86].substring(0, 4)) <= _0x489273;
                });
              }
              _0x51233b.title = Lampa.Lang.translate("Топ " + (_0xa9deac === "movie" ? "фильмы" : "сериалы") + " (" + _0x4e1c2b.title + ") за " + _0x168c5a + '-' + _0x489273);
              _0x2b3d7c(_0x51233b);
            }, _0x2b3d7c);
          };
        }
        var _0x28e15a = [{
          'start': 0x7c1,
          'end': 0x7c5
        }, {
          'start': 0x7c6,
          'end': 0x7d4
        }, {
          'start': 0x7cb,
          'end': 0x7cf
        }, {
          'start': 0x7d0,
          'end': 0x7d4
        }, {
          'start': 0x7d5,
          'end': 0x7d9
        }, {
          'start': 0x7da,
          'end': 0x7de
        }, {
          'start': 0x7df,
          'end': 0x7e3
        }, {
          'start': 0x7e4,
          'end': 0x7e9
        }];
        function _0x407356() {
          var _0x63eb2b = Math.floor(Math.random() * _0x28e15a.length);
          return _0x28e15a[_0x63eb2b];
        }
        _0x442ba4.forEach(function (_0x4e2a8c) {
          var _0x2cfa59 = _0x407356();
          _0x2a190a.push(_0x478e53("movie", _0x4e2a8c, _0x2cfa59.start, _0x2cfa59.end));
          _0x2a190a.push(_0x478e53('tv', _0x4e2a8c, _0x2cfa59.start, _0x2cfa59.end));
        });
        var _0x59c89e = [{
          'id': 0x1,
          'title': "Спанч Боб"
        }, {
          'id': 0x2,
          'title': "Губка Боб"
        }, {
          'id': 0x3,
          'title': "Teenage Mutant Ninja Turtles"
        }, {
          'id': 0x4,
          'title': "Черепашки-ниндзя"
        }, {
          'id': 0x5,
          'title': "Fairly OddParents"
        }, {
          'id': 0x6,
          'title': "Джимми Нейтрон"
        }, {
          'id': 0x8,
          'title': "Аватар: Легенда об Аанге"
        }, {
          'id': 0x9,
          'title': "Аватар: Легенда о Корре"
        }, {
          'id': 0x65,
          'title': "Lego"
        }, {
          'id': 0x66,
          'title': "Том и Джерри"
        }, {
          'id': 0x67,
          'title': "Микки Маус"
        }, {
          'id': 0x68,
          'title': "Гуфи"
        }, {
          'id': 0x69,
          'title': "Снупи"
        }, {
          'id': 0x6a,
          'title': "Простоквашино"
        }, {
          'id': 0x6b,
          'title': "Ну, погоди!"
        }, {
          'id': 0x6c,
          'title': "Чип и Дейл"
        }, {
          'id': 0x6d,
          'title': "DuckTales"
        }, {
          'id': 0x6e,
          'title': "Looney Tunes"
        }, {
          'id': 0x6f,
          'title': "Покемон"
        }, {
          'id': 0x70,
          'title': "Даша-путешественница"
        }, {
          'id': 0x71,
          'title': "Свинка Пеппа"
        }, {
          'id': 0x72,
          'title': "Барбоскины"
        }, {
          'id': 0x73,
          'title': "Смешарики"
        }, {
          'id': 0x74,
          'title': "Фиксики"
        }, {
          'id': 0x78,
          'title': "Гравити Фолз"
        }, {
          'id': 0x79,
          'title': "Чудеса на виражах"
        }, {
          'id': 0x7a,
          'title': "Пингвины из Мадагаскара"
        }, {
          'id': 0x7b,
          'title': "Король Лев"
        }, {
          'id': 0x7c,
          'title': "Холодное сердце"
        }, {
          'id': 0x7e,
          'title': "Как приручить дракона"
        }, {
          'id': 0x7f,
          'title': "Зверополис"
        }, {
          'id': 0x80,
          'title': "Миньоны"
        }, {
          'id': 0x81,
          'title': "Шрэк"
        }, {
          'id': 0xce,
          'title': "Маша и Медведь"
        }, {
          'id': 0xcf,
          'title': "Котенок по имени Гав"
        }, {
          'id': 0xd0,
          'title': "Чебурашка"
        }, {
          'id': 0xd1,
          'title': "Малыш и Карлсон"
        }, {
          'id': 0xd2,
          'title': "Лунтик"
        }, {
          'id': 0xd3,
          'title': "Три богатыря"
        }, {
          'id': 0xd4,
          'title': "Иван Царевич и Серый Волк"
        }, {
          'id': 0xd5,
          'title': "Кот Леопольд"
        }, {
          'id': 0xd7,
          'title': "Варежка"
        }, {
          'id': 0xd9,
          'title': "Каникулы Бонифация"
        }, {
          'id': 0xdb,
          'title': "Сказка о царе Салтане"
        }, {
          'id': 0xdc,
          'title': "Алеша Попович"
        }, {
          'id': 0xfb,
          'title': "Илья муромец"
        }, {
          'id': 0xe9,
          'title': "Оранжевая корова"
        }, {
          'id': 0xde,
          'title': "Малышарики"
        }, {
          'id': 0xdf,
          'title': "Winnie-the-Pooh"
        }, {
          'id': 0xe1,
          'title': "Щенячий патруль"
        }, {
          'id': 0xe2,
          'title': "Tiny Toon"
        }, {
          'id': 0xe3,
          'title': "Обезьянки"
        }, {
          'id': 0xe5,
          'title': "Буратино"
        }];
        function _0x961353(_0x42dc3a) {
          return function (_0x20d17a) {
            var _0x30086c = "search/movie?query=" + encodeURIComponent(_0x42dc3a.title);
            var _0x21f8e2 = "search/tv?query=" + encodeURIComponent(_0x42dc3a.title);
            _0x30086c = _0x529ca2(_0x30086c);
            _0x21f8e2 = _0x529ca2(_0x21f8e2);
            var _0x519069 = null;
            var _0x50a4d9 = null;
            function _0x3cc87d() {
              if (_0x519069 !== null && _0x50a4d9 !== null) {
                var _0x160105 = _0x519069.concat(_0x50a4d9);
                _0x160105 = _0x348ef1(_0x160105);
                _0x160105 = _0x160105.filter(function (_0xea9230) {
                  return (_0xea9230.vote_average || 0) >= 6.1;
                });
                _0x160105.sort(function (_0x53566c, _0x4f69f4) {
                  return (_0x4f69f4.vote_average || 0) - (_0x53566c.vote_average || 0);
                });
                var _0x244a70 = {
                  'results': _0x160105,
                  'title': Lampa.Lang.translate(_0x42dc3a.title)
                };
                _0x20d17a(_0x244a70);
              }
            }
            _0x366951.get(_0x30086c, {}, function (_0x7f5eca) {
              _0x519069 = _0x7f5eca.results || [];
              _0x3cc87d();
            }, function () {
              _0x519069 = [];
              _0x3cc87d();
            });
            _0x366951.get(_0x21f8e2, {}, function (_0x8f4bfb) {
              _0x50a4d9 = _0x8f4bfb.results || [];
              _0x3cc87d();
            }, function () {
              _0x50a4d9 = [];
              _0x3cc87d();
            });
          };
        }
        _0x59c89e.forEach(function (_0x4c05af) {
          _0x2a190a.push(_0x961353(_0x4c05af));
        });
        var _0x3db0d7 = [{
          'id': 0x2,
          'title': "Disney"
        }, {
          'id': 0x3,
          'title': "Pixar"
        }, {
          'id': 0x1d4d,
          'title': "Союзмультфильм(РФ)"
        }, {
          'id': 0x3907,
          'title': "Союзмультфильм(СССР)"
        }, {
          'id': 0x209,
          'title': "DreamWorks Animation"
        }, {
          'id': 0x24a7,
          'title': "Blue Sky Studios"
        }, {
          'id': 0x1a30,
          'title': "Illumination Entertainment"
        }, {
          'id': 0x8cb,
          'title': "Sony Pictures Animation"
        }, {
          'id': 0x2866,
          'title': "Studio Ghibli"
        }];
        function _0x33476f(_0x453b3a) {
          return function (_0x55fb00) {
            var _0x36da11 = "discover/movie?with_companies=" + _0x453b3a.id + "&sort_by=vote_average.desc";
            _0x36da11 = _0x26ed5(_0x36da11);
            _0x366951.get(_0x36da11, {}, function (_0x40952b) {
              var _0x15c339 = _0x348ef1(_0x40952b.results || []);
              var _0xd3f6ce = {
                'results': _0x15c339,
                'title': Lampa.Lang.translate("Фильмы от студии - " + _0x453b3a.title)
              };
              _0x55fb00(_0xd3f6ce);
            }, function () {
              _0x55fb00({
                'results': [],
                'title': Lampa.Lang.translate("Фильмы от студии - " + _0x453b3a.title)
              });
            });
          };
        }
        function _0x34b895(_0x175037) {
          return function (_0x49b0b1) {
            var _0x25b295 = "discover/tv?with_companies=" + _0x175037.id + "&sort_by=vote_average.desc";
            _0x25b295 = _0x26ed5(_0x25b295);
            _0x366951.get(_0x25b295, {}, function (_0x1d3161) {
              var _0x2a0704 = _0x348ef1(_0x1d3161.results || []);
              var _0x5ce8a5 = {
                'results': _0x2a0704,
                'title': Lampa.Lang.translate("Сериалы от студии - " + _0x175037.title)
              };
              _0x49b0b1(_0x5ce8a5);
            }, function () {
              _0x49b0b1({
                'results': [],
                'title': Lampa.Lang.translate("Сериалы от студии - " + _0x175037.title)
              });
            });
          };
        }
        _0x3db0d7.forEach(function (_0xecd854) {
          _0x2a190a.push(_0x33476f(_0xecd854));
          _0x2a190a.push(_0x34b895(_0xecd854));
        });
        function _0x1c5251() {
          return function (_0x3b1ff7) {
            var _0x58a129 = "discover/movie?with_companies=4";
            var _0xa244ed = "discover/tv?with_networks=13";
            _0x58a129 = _0x529ca2(_0x58a129);
            _0xa244ed = _0x529ca2(_0xa244ed);
            var _0x3a4b66 = null;
            var _0x39c51b = null;
            function _0x597ace() {
              if (_0x3a4b66 !== null && _0x39c51b !== null) {
                var _0x387e99 = _0x3a4b66.concat(_0x39c51b);
                _0x387e99 = _0x348ef1(_0x387e99);
                _0x387e99.sort((_0x21fef7, _0x494dec) => (_0x494dec.vote_average || 0) - (_0x21fef7.vote_average || 0));
                var _0x1acfe2 = {
                  'results': _0x387e99,
                  'title': Lampa.Lang.translate("Nickelodeon")
                };
                _0x3b1ff7(_0x1acfe2);
              }
            }
            _0x366951.get(_0x58a129, {}, function (_0x31a5f1) {
              _0x3a4b66 = _0x31a5f1.results || [];
              _0x597ace();
            }, function () {
              _0x3a4b66 = [];
              _0x597ace();
            });
            _0x366951.get(_0xa244ed, {}, function (_0x5f1aba) {
              _0x39c51b = _0x5f1aba.results || [];
              _0x597ace();
            }, function () {
              _0x39c51b = [];
              _0x597ace();
            });
          };
        }
        _0x2a190a.push(_0x1c5251());
        function _0x5f47f9(_0x1a8098) {
          return function (_0x753dda) {
            _0x1a8098(function (_0x5a6ec9) {
              if (Math.random() < 0.2) {
                _0x5a6ec9.small = true;
                _0x5a6ec9.wide = true;
                if (Array.isArray(_0x5a6ec9.results)) {
                  _0x5a6ec9.results.forEach(function (_0x14f9b6) {
                    _0x14f9b6.promo = _0x14f9b6.overview;
                    _0x14f9b6.promo_title = _0x14f9b6.title || _0x14f9b6.name;
                  });
                }
              }
              _0x753dda(_0x5a6ec9);
            });
          };
        }
        _0x2a190a = _0x2a190a.map(_0x5f47f9);
        _0x39105d(_0x2a190a);
        _0x2a190a.splice(3, 0, Lampa.Api.partPersons(_0x2a190a, _0x2a190a.length - 1, "movie"));
        _0x2a190a.splice(4, 0, _0x162bbb);
        function _0x726b8b(_0x157d12, _0x2333e7) {
          Lampa.Api.partNext(_0x2a190a, 7, _0x157d12, _0x2333e7);
        }
        _0x726b8b(_0x2bdd9f, _0x3f1562);
        return _0x726b8b;
      };
    };
    var _0x49114c = function (_0x3e9e48) {
      this.network = new Lampa.Reguest();
      this.discovery = false;
      this.main = function () {
        var _0x2cf7d9 = this;
        var _0x40b809 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var _0x407109 = arguments.length > 1 ? arguments[1] : undefined;
        var _0x298bfb = arguments.length > 2 ? arguments[2] : undefined;
        var _0x1fe88e = [{
          'key': "vote_count.desc",
          'title': "Много голосов"
        }, {
          'key': "vote_average.desc",
          'title': "Высокий рейтинг"
        }, {
          'key': "first_air_date.desc",
          'title': "Новинки"
        }, {
          'key': "popularity.desc",
          'title': "Популярные"
        }, {
          'key': "revenue.desc",
          'title': "Интерес зрителей"
        }];
        var _0x38ca51 = [{
          'id': 0x1c,
          'title': "боевики"
        }, {
          'id': 0x23,
          'title': "комедии"
        }, {
          'id': 0x12,
          'title': "драмы"
        }, {
          'id': 0x29fd,
          'title': "мелодрамы"
        }, {
          'id': 0x10,
          'title': "мультфильмы"
        }, {
          'id': 0x2a0a,
          'title': "детское"
        }, {
          'id': 0xc,
          'title': "приключения"
        }, {
          'id': 0x50,
          'title': "криминал"
        }, {
          'id': 0x25b0,
          'title': "детективы"
        }, {
          'id': 0x36e,
          'title': "фантастика"
        }, {
          'id': 0x2a00,
          'title': "военные"
        }, {
          'id': 0x25,
          'title': "вестерны"
        }, {
          'id': 0x35,
          'title': "триллеры"
        }, {
          'id': 0x29ff,
          'title': "семейные"
        }, {
          'id': 0xe,
          'title': "фэнтези"
        }];
        var _0x1987ab = [{
          'id': 0x9bd,
          'title': "Start"
        }, {
          'id': 0xb2b,
          'title': "Premier"
        }, {
          'id': 0xff5,
          'title': "KION"
        }, {
          'id': 0xf53,
          'title': "ИВИ"
        }, {
          'id': 0x19c,
          'title': "Россия 1"
        }, {
          'id': 0x22e,
          'title': "Первый канал"
        }, {
          'id': 0xf1f,
          'title': "Okko"
        }, {
          'id': 0xef3,
          'title': "Кинопоиск"
        }, {
          'id': 0x16ae,
          'title': "Wink"
        }, {
          'id': 0x326,
          'title': "СТС"
        }, {
          'id': 0x4a7,
          'title': "ТНТ"
        }, {
          'id': 0x45f,
          'title': "НТВ"
        }];
        function _0x270bc2(_0x179399) {
          function _0x339b0a(_0x167573) {
            if (typeof _0x167573 === "string") {
              return /[а-яА-ЯёЁ]/.test(_0x167573);
            } else {
              if (typeof _0x167573 === "object" && _0x167573 !== null) {
                for (const _0x4b937e of Object.values(_0x167573)) {
                  if (_0x339b0a(_0x4b937e)) {
                    return true;
                  }
                }
              }
            }
            return false;
          }
          return _0x179399.filter(function (_0x24fa08) {
            return _0x339b0a(_0x24fa08);
          });
        }
        function _0xc6fca2(_0x11a25f) {
          _0x11a25f = _0x270bc2(_0x11a25f);
          return _0x11a25f;
        }
        function _0x35290d(_0x2000b5) {
          _0x2000b5 += "&vote_count.gte=10";
          return _0x2000b5;
        }
        function _0x4abfe9(_0x5578f0) {
          var _0x37fcdd = ["346488", "158718", "41278"];
          _0x5578f0 += "&without_keywords=" + encodeURIComponent(_0x37fcdd.join(','));
          return _0x5578f0;
        }
        function _0xbfc76c(_0x96eadc) {
          _0x96eadc = _0x35290d(_0x96eadc);
          _0x96eadc = _0x2420b7;
          _0x96eadc = _0x4abfe9(_0x96eadc);
          return _0x96eadc;
        }
        function _0x2295e2(_0x3c88e6) {
          for (var _0x4ac995 = _0x3c88e6.length - 1; _0x4ac995 > 0; _0x4ac995--) {
            var _0x67a438 = Math.floor(Math.random() * (_0x4ac995 + 1));
            var _0x4e329a = _0x3c88e6[_0x4ac995];
            _0x3c88e6[_0x4ac995] = _0x3c88e6[_0x67a438];
            _0x3c88e6[_0x67a438] = _0x4e329a;
          }
        }
        function _0x221c19(_0xd4e71f) {
          if (_0xd4e71f.key === "first_air_date.desc") {
            _0xd4e71f = {
              'key': "release_date.desc",
              'title': "Новинки"
            };
          }
          if (_0xd4e71f.key === "release_date.desc") {
            var _0x1e4268 = new Date().toISOString().split('T')[0];
            var _0x16f6b3 = new Date();
            _0x16f6b3.setFullYear(_0x16f6b3.getFullYear() - 1);
            _0x16f6b3 = _0x16f6b3.toISOString().split('T')[0];
            _0xd4e71f.extraParams = "&release_date.gte=" + _0x16f6b3 + "&release_date.lte=" + _0x1e4268;
          }
          return _0xd4e71f;
        }
        var _0x380451 = [function (_0x11484e) {
          var _0x3a9e38 = "movie/now_playing";
          _0x3a9e38 = _0x2420b7;
          _0x2cf7d9.get(_0x3a9e38, _0x40b809, function (_0x1e1308) {
            _0x1e1308.title = Lampa.Lang.translate("Сейчас смотрят");
            _0x11484e(_0x1e1308);
          }, _0x11484e);
        }, function (_0x4a2e24) {
          var _0xd80152 = "trending/movie/week";
          _0xd80152 = _0x2420b7;
          _0x2cf7d9.get(_0xd80152, _0x40b809, function (_0x5e986a) {
            _0x5e986a.title = Lampa.Lang.translate("Популярные фильмы");
            _0x4a2e24(_0x5e986a);
          }, _0x4a2e24);
        }, function (_0x58d0c6) {
          var _0x1db12e = "trending/tv/week";
          _0x1db12e = _0x2420b7;
          _0x2cf7d9.get(_0x1db12e, _0x40b809, function (_0x19a825) {
            _0x19a825.title = Lampa.Lang.translate("Популярные сериалы");
            _0x58d0c6(_0x19a825);
          }, _0x58d0c6);
        }];
        var _0x5a6bef = function (_0x3cd55c) {
          _0x3cd55c({
            'source': "tmdb",
            'results': Lampa.TimeTable.lately().slice(0, 20),
            'title': Lampa.Lang.translate("title_upcoming_episodes"),
            'nomore': true,
            'cardClass': function (_0x540227, _0x5071fd) {
              return new _0x450ff0(_0x540227, _0x5071fd);
            }
          });
        };
        function _0x4aaef4(_0x6ea257, _0x44486e) {
          return function (_0x2ef84c) {
            var _0x46b866 = _0x1fe88e[Math.floor(Math.random() * _0x1fe88e.length)];
            var _0x533233 = _0x38ca51[Math.floor(Math.random() * _0x38ca51.length)];
            var _0xe3b6b8 = _0xbfc76c("discover/tv?with_networks=" + _0x44486e + "&with_genres=" + _0x533233.id + "&sort_by=" + _0x46b866.key + "&air_date.lte=" + new Date().toISOString().substr(0, 10));
            _0x2cf7d9.get(_0xe3b6b8, _0x40b809, function (_0x43be31) {
              if (_0x43be31.results) {
                _0x43be31.results = _0xc6fca2(_0x43be31.results);
              }
              _0x43be31.title = Lampa.Lang.translate(_0x46b866.title + " (" + _0x533233.title + ") на " + _0x6ea257);
              _0x2ef84c(_0x43be31);
            }, _0x2ef84c);
          };
        }
        function _0x5bc134(_0x1b48b8, _0xf9d68a) {
          return function (_0xe6bd71) {
            var _0x373f8a = _0x1fe88e[Math.floor(Math.random() * _0x1fe88e.length)];
            var _0x4a178f = _0xbfc76c("discover/tv?with_networks=" + _0xf9d68a + "&sort_by=" + _0x373f8a.key + "&air_date.lte=" + new Date().toISOString().substr(0, 10));
            _0x2cf7d9.get(_0x4a178f, _0x40b809, function (_0x29a661) {
              if (_0x29a661.results) {
                _0x29a661.results = _0xc6fca2(_0x29a661.results);
              }
              _0x29a661.title = Lampa.Lang.translate(_0x373f8a.title + " на " + _0x1b48b8);
              _0xe6bd71(_0x29a661);
            }, _0xe6bd71);
          };
        }
        _0x1987ab.forEach(function (_0x10f3fc) {
          _0x380451.push(_0x4aaef4(_0x10f3fc.title, _0x10f3fc.id));
        });
        _0x1987ab.forEach(function (_0x4eaa70) {
          _0x380451.push(_0x5bc134(_0x4eaa70.title, _0x4eaa70.id));
        });
        function _0x89ddc3(_0x22ebd1) {
          return function (_0x5c0797) {
            var _0x18812d = _0x221c19(_0x1fe88e[Math.floor(Math.random() * _0x1fe88e.length)]);
            var _0x5a73ef = "discover/movie?with_genres=" + _0x22ebd1.id + "&sort_by=" + _0x18812d.key;
            _0x5a73ef += "&with_original_language=ru&region=RU";
            if (_0x18812d.key === "release_date.desc") {
              var _0x5c7caa = new Date().toISOString().split('T')[0];
              _0x5a73ef += "&release_date.lte=" + _0x5c7caa;
            }
            if (_0x18812d.extraParams) {
              _0x5a73ef += _0x18812d.extraParams;
            }
            _0x5a73ef = _0xbfc76c(_0x5a73ef);
            _0x2cf7d9.get(_0x5a73ef, _0x40b809, function (_0x5cf043) {
              _0x5cf043.title = Lampa.Lang.translate(_0x18812d.title + " - российские" + " (" + _0x22ebd1.title + ')');
              _0x5c0797(_0x5cf043);
            }, _0x5c0797);
          };
        }
        _0x38ca51.forEach(function (_0x23c499) {
          _0x380451.push(_0x89ddc3(_0x23c499));
        });
        function _0xa57564(_0x41cdf9) {
          return function (_0x3588be) {
            var _0x4c2939 = _0x1fe88e[Math.floor(Math.random() * _0x1fe88e.length)];
            var _0x39da33 = "discover/tv?with_genres=" + _0x41cdf9.id + "&sort_by=" + _0x4c2939.key + "&with_origin_country=RU";
            _0x39da33 = _0xbfc76c(_0x39da33);
            _0x2cf7d9.get(_0x39da33, _0x40b809, function (_0x353348) {
              _0x353348.title = Lampa.Lang.translate(_0x4c2939.title + " - российские сериалы (" + _0x41cdf9.title + ')');
              _0x3588be(_0x353348);
            }, _0x3588be);
          };
        }
        _0x38ca51.forEach(function (_0x1b5d13) {
          _0x380451.push(_0xa57564(_0x1b5d13));
        });
        function _0x41d627(_0x2b22a3, _0x2b5d8d) {
          return function (_0x500ffd) {
            var _0x36a61c = "discover/" + _0x2b5d8d + "?with_genres=" + _0x2b22a3.id + "&sort_by=vote_average.desc" + "&vote_count.gte=50" + "&with_origin_country=RU";
            _0x36a61c = _0x4abfe9(_0x36a61c);
            _0x2cf7d9.get(_0x36a61c, _0x40b809, function (_0x2f44bd) {
              _0x2f44bd.title = Lampa.Lang.translate(_0x2b5d8d === "movie" ? "Топ российские фильмы (" + _0x2b22a3.title + ')' : "Топ российские сериалы (" + _0x2b22a3.title + ')');
              _0x500ffd(_0x2f44bd);
            }, _0x500ffd);
          };
        }
        _0x38ca51.forEach(function (_0x376e08) {
          _0x380451.push(_0x41d627(_0x376e08, "movie"));
          _0x380451.push(_0x41d627(_0x376e08, 'tv'));
        });
        function _0x1a09e8(_0x22e7ae, _0x27b9e7, _0x26bee6, _0x58351a) {
          return function (_0x24fa95) {
            var _0x34e9c5 = "discover/" + _0x22e7ae + "?with_genres=" + _0x27b9e7.id + "&sort_by=vote_average.desc" + "&vote_count.gte=10" + "&with_origin_country=RU" + '&' + (_0x22e7ae === "movie" ? "primary_release_date" : "first_air_date") + ".gte=" + _0x26bee6 + "-01-01" + '&' + (_0x22e7ae === "movie" ? "primary_release_date" : "first_air_date") + ".lte=" + _0x58351a + "-12-31";
            _0x34e9c5 = _0x2420b7;
            _0x34e9c5 = _0x4abfe9(_0x34e9c5);
            _0x2cf7d9.get(_0x34e9c5, _0x40b809, function (_0xd82d14) {
              _0xd82d14.title = Lampa.Lang.translate("Топ российские " + (_0x22e7ae === "movie" ? "фильмы" : "сериалы") + " (" + _0x27b9e7.title + ") за " + _0x26bee6 + '-' + _0x58351a);
              _0x24fa95(_0xd82d14);
            }, _0x24fa95);
          };
        }
        var _0x3aa15b = [{
          'start': 0x7b7,
          'end': 0x7bb
        }, {
          'start': 0x7bc,
          'end': 0x7c0
        }, {
          'start': 0x7c1,
          'end': 0x7c5
        }, {
          'start': 0x7c6,
          'end': 0x7ca
        }, {
          'start': 0x7cb,
          'end': 0x7cf
        }, {
          'start': 0x7d0,
          'end': 0x7d4
        }, {
          'start': 0x7d5,
          'end': 0x7d9
        }, {
          'start': 0x7da,
          'end': 0x7de
        }, {
          'start': 0x7df,
          'end': 0x7e3
        }, {
          'start': 0x7e4,
          'end': 0x7e9
        }];
        _0x38ca51.forEach(function (_0x48c463) {
          var _0x5e4ade = _0x3aa15b[Math.floor(Math.random() * _0x3aa15b.length)];
          _0x380451.push(_0x1a09e8("movie", _0x48c463, _0x5e4ade.start, _0x5e4ade.end));
          _0x380451.push(_0x1a09e8('tv', _0x48c463, _0x5e4ade.start, _0x5e4ade.end));
        });
        function _0x321cef(_0x131709) {
          return function (_0x2a6ad2) {
            _0x131709(function (_0x550d49) {
              if (Math.random() < 0.2) {
                _0x550d49.small = true;
                _0x550d49.wide = true;
                if (Array.isArray(_0x550d49.results)) {
                  _0x550d49.results.forEach(function (_0x120211) {
                    _0x120211.promo = _0x120211.overview;
                    _0x120211.promo_title = _0x120211.title || _0x120211.name;
                  });
                }
              }
              _0x2a6ad2(_0x550d49);
            });
          };
        }
        _0x380451 = _0x380451.map(_0x321cef);
        _0x2295e2(_0x380451);
        _0x380451.splice(4, 0, _0x5a6bef);
        function _0x190605(_0x350371, _0xb6d2d7) {
          Lampa.Api.partNext(_0x380451, 7, _0x350371, _0xb6d2d7);
        }
        _0x190605(_0x407109, _0x298bfb);
        return _0x190605;
      };
    };
    function _0x6b35f7() {
      var _0x290c07 = Lampa.Storage.get("surs_name") || "AVIAMOVIE";
      var _0x3649db = _0x290c07 + " KIDS";
      var _0x24964e = _0x290c07 + " RUS";
      var _0x3e571e = Object.assign({}, Lampa.Api.sources.tmdb, new _0x3fedbf(Lampa.Api.sources.tmdb));
      var _0x99c8f5 = Object.assign({}, Lampa.Api.sources.tmdb, new _0x212ad4(Lampa.Api.sources.tmdb));
      var _0x1f8871 = Object.assign({}, Lampa.Api.sources.tmdb, new _0x49114c(Lampa.Api.sources.tmdb));
      Lampa.Api.sources.tmdb_mod = _0x3e571e;
      Lampa.Api.sources.tmdb_mod_kids = _0x99c8f5;
      Lampa.Api.sources.tmdb_mod_rus = _0x1f8871;
      Object.defineProperty(Lampa.Api.sources, _0x290c07, {
        'get': function () {
          return _0x3e571e;
        }
      });
      Object.defineProperty(Lampa.Api.sources, _0x3649db, {
        'get': function () {
          return _0x99c8f5;
        }
      });
      Object.defineProperty(Lampa.Api.sources, _0x24964e, {
        'get': function () {
          return _0x1f8871;
        }
      });
      Lampa.Params.select("source", Object.assign({}, Lampa.Params.values.source, {
        [_0x290c07]: _0x290c07,
        [_0x3649db]: _0x3649db,
        [_0x24964e]: _0x24964e
      }), "tmdb");
    }
    function _0x65e718() {
      var _0x2f69f8 = Lampa.Storage.get("surs_name") || "AVIAMOVIE";
      var _0x5173be = _0x2f69f8 + " KIDS";
      var _0x483844 = _0x2f69f8 + " RUS";
      Lampa.Listener.follow("profile", function (_0x5360b1) {
        if (_0x5360b1.type !== "changed") {
          return;
        }
        if (!_0x5360b1.params.surs) {
          return;
        }
        if (_0x5360b1.params.forKids) {
          _0x3af8bf(_0x5173be, true);
        } else if (_0x5360b1.params.onlyRus) {
          _0x3af8bf(_0x483844, true);
        } else {
          _0x3af8bf(_0x2f69f8, true);
        }
      });
      Lampa.Storage.listener.follow("change", function (_0x388b79) {
        if (_0x388b79.name === "source" && !_0x3f3539) {
          if (_0x388b79.value === _0x2f69f8 || _0x388b79.value === _0x5173be || _0x388b79.value === _0x483844) {
            _0x4827cb(_0x388b79.value, true);
          }
        }
      });
      var _0x361c18 = Lampa.Storage.get("source");
      if (_0x361c18 === _0x2f69f8 || _0x361c18 === _0x5173be || _0x361c18 === _0x483844) {
        setTimeout(function () {
          if (!Lampa.Storage.get("start_page") || Lampa.Storage.get("start_page") === "main") {
            _0x4827cb(_0x361c18, false);
          }
        }, 300);
      }
    }
    var _0x3f3539 = false;
    function _0x3af8bf(_0x1a106d, _0x281f38) {
      if (typeof _0x281f38 === "undefined") {
        _0x281f38 = false;
      }
      var _0x1b151a = Lampa.Storage.get("source");
      if (_0x1b151a !== _0x1a106d) {
        _0x3f3539 = true;
        Lampa.Storage.set("source", _0x1a106d);
        setTimeout(function () {
          _0x4827cb(_0x1a106d, false);
          _0x3f3539 = false;
        }, 10);
      }
    }
    function _0x4827cb(_0x2f6b65, _0x57b29f) {
      Lampa.Activity.push({
        'title': "Главная - " + _0x2f6b65.toUpperCase(),
        'component': "main",
        'source': _0x2f6b65
      });
      if (_0x57b29f) {
        setTimeout(function () {
          Lampa.Controller.toggle("settings");
        }, 100);
      }
    }
    Lampa.Settings.listener.follow("open", function (_0x299fd0) {
      if (_0x299fd0.name === "surs") {
        setTimeout(function () {
          var _0x2393fb = Lampa.Storage.get("source");
          var _0x4f2f6b = Lampa.Storage.get("surs_name") || "AVIAMOVIE";
          var _0x4652bc = _0x4f2f6b + " KIDS";
          var _0x4fa1d7 = _0x4f2f6b + " RUS";
          var _0x4bcd83 = ["surs_cirillic", "surs_minVotes", "surs_ageRestrictions", "surs_withoutKeywords", "surs_getMoviesByGenre", "surs_getTVShowsByGenre", "surs_streaming", "surs_getBestContentByGenre", "surs_getBestContentByGenreAndPeriod", "surs_filter_menu", "surs_best_content"];
          var _0x21b453 = _0x2393fb === _0x4652bc || _0x2393fb === _0x4fa1d7;
          _0x4bcd83.forEach(function (_0x2d3c2a) {
            var _0x31544c = $("div[data-name=\"" + _0x2d3c2a + "\"]");
            if (_0x21b453) {
              _0x31544c.hide();
            } else {
              _0x31544c.show();
            }
          });
          if (_0x21b453) {
            $("div.settings-param-title span").each(function () {
              var _0x4e98c9 = $(this).text().trim();
              if (_0x4e98c9 === "Настройка фильтров" || _0x4e98c9 === "Настройка подборок") {
                $(this).closest("div.settings-param-title").remove();
              }
            });
          }
        }, 1);
      }
    });
    function _0x3ad9cb() {
      var _0x56bcd5 = Lampa.Storage.get("source");
      var _0x3c9c59 = Lampa.Storage.get("surs_name") || "AVIAMOVIE";
      var _0x57bd2c = _0x3c9c59 + " KIDS";
      var _0x53104a = _0x3c9c59 + " RUS";
      Lampa.SettingsApi.addComponent({
        'component': "surs",
        'name': Lampa.Lang.translate("Подборки " + _0x3c9c59),
        'icon': "\n <svg height=\"200px\" width=\"200px\" version=\"1.1\" id=\"_x32_\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 512 512\" xml:space=\"preserve\" fill=\"#000000\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"> <style type=\"text/css\"> .st0{fill:#ffffff;} </style> <g> <path class=\"st0\" d=\"M443.724,166.599c27.038-2.293,47.087-26.07,44.786-53.125c-2.292-27.038-26.078-47.087-53.115-44.795 c-27.038,2.301-47.078,26.088-44.776,53.124C392.91,148.85,416.677,168.9,443.724,166.599z\"></path> <path class=\"st0\" d=\"M431.752,346.544l30.541-114.485c5.068-19.305-6.466-39.075-25.78-44.144 c-19.304-5.077-39.075,6.448-44.152,25.771v-0.018L365.052,315.64l-78.755-13.276c-17.218-4.304-34.696,5.786-39.578,22.864 l-33.317,133.445c-3.82,13.342,3.913,27.28,17.274,31.1c13.37,3.81,27.298-3.923,31.128-17.283l39.392-98.638l61.286,16.155 C398.863,400.125,421.633,382.927,431.752,346.544z\"></path> <path class=\"st0\" d=\"M388.177,462.949l-0.121-0.01c-0.018,0-0.028,0-0.047,0L388.177,462.949z\"></path> <path class=\"st0\" d=\"M498.349,286.311c-10.1-2.999-20.721,2.749-23.722,12.858l-27.876,93.848 c-2.096,6.606-4.536,11.777-7.146,15.746c-3.987,5.944-8.002,9.373-13.854,12.093c-5.842,2.664-14.031,4.379-25.416,4.37 c-3.009,0.008-6.215-0.113-9.634-0.355l-54.009-3.363c-10.519-0.661-19.575,7.341-20.227,17.861 c-0.662,10.518,7.342,19.574,17.86,20.226l53.73,3.345c4.211,0.298,8.31,0.448,12.28,0.456c10.072-0.009,19.5-0.988,28.369-3.289 c13.268-3.392,25.315-10.127,34.501-19.892c9.251-9.736,15.531-21.885,19.91-35.609l0.074-0.214l28.015-94.362 C514.206,299.923,508.447,289.302,498.349,286.311z\"></path> <path class=\"st0\" d=\"M248.974,81.219L0,21.256v15.14v281.228l248.974-59.962V81.219z M225.123,238.87L23.851,287.355V51.536 l201.272,48.466V238.87z\"></path> <polygon class=\"st0\" points=\"204.989,115.189 47.991,84.937 47.991,253.953 204.989,223.692 \"></polygon> </g> </g></svg>"
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': '',
          'type': "title"
        },
        'field': {
          'name': "Подборки от " + _0x3c9c59,
          'description': "После изменения настроек обновите главную страницу, нажав на её иконку в боковом меню."
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_empty1",
          'type': "title"
        },
        'field': {
          'name': "Настройка интерфейса",
          'description': ''
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_setSource",
          'type': "select",
          'values': {
            [_0x3c9c59]: _0x3c9c59,
            [_0x57bd2c]: _0x57bd2c,
            [_0x53104a]: _0x53104a
          },
          'default': [_0x3c9c59]
        },
        'field': {
          'name': Lampa.Lang.translate("Установить в качестве источника"),
          'description': Lampa.Lang.translate("Влияет на отображение контента на главной странице")
        },
        'onChange': function (_0x3eb3ff) {
          console.log("[DEBUG] Выбранный источник:", _0x3eb3ff);
          Lampa.Storage.set("source", _0x3eb3ff);
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_setButtons",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Добавить подборки в боковое меню"),
          'description': Lampa.Lang.translate("Выберите, какие подборки добавить в боковое меню")
        },
        'onChange': function () {
          var _0x13435b = Lampa.Controller.enabled().name;
          _0x2b2f4a(_0x13435b);
        }
      });
      function _0x2b2f4a(_0x174928) {
        var _0x4b09f4 = [{
          'title': _0x3c9c59,
          'id': "Button_sourceName"
        }, {
          'title': _0x57bd2c,
          'id': "Button_sourceNameKids"
        }, {
          'title': _0x53104a,
          'id': "Button_sourceNameRus"
        }];
        var _0xb4fa46 = _0x4b09f4.map(function (_0x4d60a8) {
          var _0x29000a = _0x490c3e(_0x4d60a8.id, false);
          return {
            'title': _0x4d60a8.title,
            'id': _0x4d60a8.id,
            'checkbox': true,
            'checked': _0x29000a
          };
        });
        Lampa.Select.show({
          'title': "Выбор источников для бокового меню",
          'items': _0xb4fa46,
          'onBack': function () {
            Lampa.Controller.toggle(_0x174928 || "settings");
          },
          'onCheck': function (_0x44c726) {
            var _0x39f50d = _0x44c726.id;
            var _0x52d4fe = _0x490c3e(_0x39f50d, false);
            _0x59bf81(_0x39f50d, !_0x52d4fe);
            _0x44c726.checked = !_0x52d4fe;
            _0x18ad9a();
          }
        });
      }
      function _0x494013(_0x188ae6, _0x23cd04, _0x2c4ed7, _0x300d64) {
        var _0x348bbf = $("<li class=\"menu__item selector\" data-action=\"" + _0x23cd04 + "\">        <div class=\"menu__ico\">" + _0x2c4ed7 + "</div>        <div class=\"menu__text\">" + _0x188ae6 + "</div>    </li>");
        _0x348bbf.on("hover:enter", _0x300d64);
        $(".menu .menu__list").eq(0).append(_0x348bbf);
      }
      function _0x18ad9a() {
        $(".menu__item[data-action=\"custom-source\"]").remove();
        var _0x189749 = _0x490c3e("Button_sourceName", false);
        var _0x59a54c = _0x490c3e("Button_sourceNameKids", false);
        var _0x4b0794 = _0x490c3e("Button_sourceNameRus", false);
        if (_0x189749) {
          _0x494013(_0x3c9c59, "custom-source", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2.2em\" height=\"2.2em\" viewBox=\"0 0 48 48\">    <circle cx=\"24\" cy=\"24\" r=\"20\" fill=\"white\"/></svg>", function () {
            Lampa.Activity.push({
              'source': _0x3c9c59,
              'title': _0x3c9c59,
              'component': "main",
              'page': 0x1
            });
          });
        }
        if (_0x59a54c) {
          _0x494013(_0x57bd2c, "custom-source", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2.2em\" height=\"2.2em\" viewBox=\"0 0 48 48\">    <circle cx=\"24\" cy=\"24\" r=\"20\" fill=\"white\"/></svg>", function () {
            Lampa.Activity.push({
              'source': _0x57bd2c,
              'title': _0x57bd2c,
              'component': "main",
              'page': 0x1
            });
          });
        }
        if (_0x4b0794) {
          _0x494013(_0x53104a, "custom-source", "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2.2em\" height=\"2.2em\" viewBox=\"0 0 48 48\">    <circle cx=\"24\" cy=\"24\" r=\"20\" fill=\"white\"/></svg>", function () {
            Lampa.Activity.push({
              'source': _0x53104a,
              'title': _0x53104a,
              'component': "main",
              'page': 0x1
            });
          });
        }
      }
      setTimeout(_0x18ad9a, 50);
      Lampa.Listener.follow("profile", function (_0x41400e) {
        if (_0x41400e.type != "changed") {
          return;
        }
        _0x18ad9a();
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': '',
          'type': "title"
        },
        'field': {
          'name': "Настройка фильтров",
          'description': ''
        }
      });
      function _0x3582fc(_0x261591, _0x27b8c2, _0x985986, _0x320a82 = 'id', _0x14990b) {
        var _0x289961 = _0x27b8c2.map(function (_0x2bf1fa) {
          var _0xd53ba2 = _0x2bf1fa[_0x320a82];
          var _0x244170 = _0x490c3e(_0x985986 + _0xd53ba2, true);
          return {
            'title': _0x2bf1fa.title,
            'id': _0xd53ba2,
            'checkbox': true,
            'checked': _0x244170
          };
        });
        Lampa.Select.show({
          'title': _0x261591,
          'items': _0x289961,
          'onBack': function () {
            _0x5d6cb3(_0x14990b);
          },
          'onCheck': function (_0x562934) {
            var _0x5ca53a = _0x985986 + _0x562934.id;
            var _0x243dbf = _0x490c3e(_0x5ca53a, true);
            _0x59bf81(_0x5ca53a, !_0x243dbf);
            _0x562934.checked = !_0x243dbf;
          }
        });
      }
      function _0x5d6cb3(_0x581b6a) {
        var _0x1e0314 = Lampa.Controller.enabled().name;
        _0x581b6a = _0x581b6a || _0x1e0314;
        Lampa.Select.show({
          'title': "Глобальный фильтр",
          'items': [{
            'title': "Жанры",
            'action': function () {
              _0x3582fc("Выбор жанров", _0x310eb8, "genre_", 'id', _0x581b6a);
            }
          }, {
            'title': "Варианты сортировки",
            'action': function () {
              _0x3582fc("Выбор сортировки", _0x4687f1, "sort_", 'id', _0x581b6a);
            }
          }, {
            'title': "Стриминги",
            'action': function () {
              _0x3582fc("Выбор стримингов", _0x3137f9, "streaming_", 'id', _0x581b6a);
            }
          }, {
            'title': "Российские стриминги",
            'action': function () {
              _0x3582fc("Выбор российских стримингов", _0x577bf6, "streaming_rus_", 'id', _0x581b6a);
            }
          }],
          'onSelect': function (_0x155952) {
            if (_0x155952.action) {
              _0x155952.action();
            }
          },
          'onBack': function () {
            Lampa.Controller.toggle(_0x581b6a);
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_filter_menu",
          'type': "button"
        },
        'field': {
          'name': "Глобальный фильтр",
          'description': "Выбор жанров, вариантов сортировки и стриминговых сервисов."
        },
        'onChange': function () {
          _0x5d6cb3();
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_cirillic",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Кириллица в карточке контента"),
          'description': Lampa.Lang.translate("Фильтрует контент, оставляя только те материалы, у которых есть перевод названия или описание на киррилице.")
        },
        'onChange': function () {
          var _0xfb7b67 = Lampa.Controller.enabled().name;
          _0x38d3ae(_0xfb7b67);
        }
      });
      function _0x38d3ae(_0x500170) {
        var _0x5d974e = _0x490c3e("cirillic", '1');
        var _0x4b0d15 = [{
          'title': "Включен",
          'value': '1'
        }, {
          'title': "Выключен",
          'value': '0'
        }];
        var _0xb7a10c = _0x4b0d15.map(function (_0x124309) {
          return {
            'title': _0x124309.title,
            'value': _0x124309.value,
            'checkbox': true,
            'checked': _0x5d974e === _0x124309.value
          };
        });
        Lampa.Select.show({
          'title': "Русский язык",
          'items': _0xb7a10c,
          'onBack': function () {
            Lampa.Controller.toggle(_0x500170 || "settings");
          },
          'onCheck': function (_0x4d263a) {
            _0x59bf81("cirillic", _0x4d263a.value);
            _0x38d3ae(_0x500170);
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_minVotes",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Валидация рейтинга"),
          'description': Lampa.Lang.translate("Валидация рейтинга позволяет исключить контент с случайно завышенной оценкой. Однако он может также исключить новые фильмы или те, у которых ещё нет рейтинга или мало голосов.")
        },
        'onChange': function () {
          var _0x56d9ba = Lampa.Controller.enabled().name;
          _0x4f7e0b(_0x56d9ba);
        }
      });
      function _0x4f7e0b(_0x83255b) {
        var _0x2a8965 = _0x490c3e("minVotes", '10');
        var _0x14f6eb = [{
          'title': "Выключено",
          'value': '0'
        }, {
          'title': "Стандартная",
          'value': '10'
        }, {
          'title': "Усиленная",
          'value': '50'
        }, {
          'title': "Максимальная",
          'value': "150"
        }, {
          'title': "Фаталити",
          'value': "300"
        }];
        var _0x25d3b3 = _0x14f6eb.map(function (_0x2896d5) {
          return {
            'title': _0x2896d5.title,
            'value': _0x2896d5.value,
            'checkbox': true,
            'checked': _0x2a8965 === _0x2896d5.value
          };
        });
        Lampa.Select.show({
          'title': "Валидация ретинга",
          'items': _0x25d3b3,
          'onBack': function () {
            Lampa.Controller.toggle(_0x83255b || "settings");
          },
          'onCheck': function (_0x43f149) {
            _0x59bf81("minVotes", _0x43f149.value);
            _0x4f7e0b(_0x83255b);
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_ageRestrictions",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Возрастное ограничение"),
          'description': Lampa.Lang.translate("Формировать подборки, которые соответствуют указанному возрастному рейтингу.")
        },
        'onChange': function () {
          var _0x49ebcd = Lampa.Controller.enabled().name;
          _0x1f1c6c(_0x49ebcd);
        }
      });
      function _0x1f1c6c(_0x411869) {
        var _0x53e9f2 = _0x490c3e("ageRestrictions", '');
        var _0x15dc26 = [{
          'title': "Для самых маленьких",
          'value': '0+'
        }, {
          'title': "Для детей не старше 6 лет",
          'value': '6+'
        }, {
          'title': "Для детей не старше 12 лет",
          'value': "12+"
        }, {
          'title': "Без ограничений",
          'value': ''
        }];
        var _0xfd6fdd = _0x15dc26.map(function (_0x401ac3) {
          return {
            'title': _0x401ac3.title,
            'value': _0x401ac3.value,
            'checkbox': true,
            'checked': _0x53e9f2 === _0x401ac3.value
          };
        });
        Lampa.Select.show({
          'title': "Возрастное ограничение",
          'items': _0xfd6fdd,
          'onBack': function () {
            Lampa.Controller.toggle(_0x411869 || "settings");
          },
          'onCheck': function (_0x1de626) {
            _0x59bf81("ageRestrictions", _0x1de626.value);
            _0x1f1c6c(_0x411869);
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_withoutKeywords",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Исключение азиатских жанров"),
          'description': Lampa.Lang.translate("Фильтр исключает контент по разным уровням: Мягко - манга, маньхва, донхуа. Сильно - добавляет исключение жанра аниме полностью.")
        },
        'onChange': function () {
          var _0x4f5e9e = Lampa.Controller.enabled().name;
          _0x9633a5(_0x4f5e9e);
        }
      });
      function _0x9633a5(_0x23ec89) {
        var _0x5b7760 = _0x490c3e("withoutKeywords", '1');
        var _0x562089 = [{
          'title': "Выключено",
          'value': '0'
        }, {
          'title': "Мягко",
          'value': '1'
        }, {
          'title': "Сильно",
          'value': '2'
        }];
        var _0x21a1cc = _0x562089.map(function (_0x146275) {
          return {
            'title': _0x146275.title,
            'value': _0x146275.value,
            'checkbox': true,
            'checked': _0x5b7760 === _0x146275.value
          };
        });
        Lampa.Select.show({
          'title': "Уровень фильтрации",
          'items': _0x21a1cc,
          'onBack': function () {
            Lampa.Controller.toggle(_0x23ec89 || "settings");
          },
          'onCheck': function (_0x2c931e) {
            _0x59bf81("withoutKeywords", _0x2c931e.value);
            _0x9633a5(_0x23ec89);
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': '',
          'type': "title"
        },
        'field': {
          'name': "Настройка подборок",
          'description': ''
        }
      });
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_streaming",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Подборки по стримингам"),
          'description': Lampa.Lang.translate("Выберите регион")
        },
        'onChange': function () {
          var _0xcd374d = Lampa.Controller.enabled().name;
          _0x1c4972(_0xcd374d);
        }
      });
      function _0x1c4972(_0x273476) {
        var _0x51b7c9 = [{
          'title': "Глобальные",
          'id': "getStreamingServices"
        }, {
          'title': "Российские",
          'id': "getStreamingServicesRUS"
        }];
        var _0x3e5460 = _0x51b7c9.map(function (_0x15379e) {
          var _0x47cabc = _0x490c3e(_0x15379e.id, true);
          return {
            'title': _0x15379e.title,
            'id': _0x15379e.id,
            'checkbox': true,
            'checked': _0x47cabc
          };
        });
        Lampa.Select.show({
          'title': "Выбор стриминговых подборок",
          'items': _0x3e5460,
          'onBack': function () {
            Lampa.Controller.toggle(_0x273476 || "settings");
          },
          'onCheck': function (_0x1f30d1) {
            var _0x1a0abe = _0x1f30d1.id;
            var _0x4ec115 = _0x490c3e(_0x1a0abe, true);
            _0x59bf81(_0x1a0abe, !_0x4ec115);
            _0x1f30d1.checked = !_0x4ec115;
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_getMoviesByGenre",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Подборки фильмов"),
          'description': Lampa.Lang.translate("Выберите регион.")
        },
        'onChange': function () {
          var _0x2af824 = Lampa.Controller.enabled().name;
          _0x27cb2b(_0x2af824);
        }
      });
      function _0x27cb2b(_0x411019) {
        var _0x25c94d = [{
          'title': "Глобальные",
          'id': "getMoviesByGenreGlobal"
        }, {
          'title': "Российские",
          'id': "getMoviesByGenreRus"
        }];
        var _0x44508f = _0x25c94d.map(function (_0x3fae65) {
          var _0x5565de = _0x490c3e(_0x3fae65.id, true);
          return {
            'title': _0x3fae65.title,
            'id': _0x3fae65.id,
            'checkbox': true,
            'checked': _0x5565de
          };
        });
        Lampa.Select.show({
          'title': "Подборки фильмов",
          'items': _0x44508f,
          'onBack': function () {
            Lampa.Controller.toggle(_0x411019 || "settings");
          },
          'onCheck': function (_0x33aea5) {
            var _0x1c8cb3 = _0x33aea5.id;
            var _0x5b53a9 = _0x490c3e(_0x1c8cb3, true);
            _0x59bf81(_0x1c8cb3, !_0x5b53a9);
            _0x33aea5.checked = !_0x5b53a9;
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_getTVShowsByGenre",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Подборки сериалов"),
          'description': Lampa.Lang.translate("Выберите регион.")
        },
        'onChange': function () {
          var _0x3a6605 = Lampa.Controller.enabled().name;
          _0x45400a(_0x3a6605);
        }
      });
      function _0x45400a(_0x20032b) {
        var _0x32517c = [{
          'title': "Глобальные",
          'id': "getTVShowsByGenreGlobal"
        }, {
          'title': "Российские",
          'id': "getTVShowsByGenreRus"
        }, {
          'title': "Южнокорейские",
          'id': "getTVShowsByGenreKOR"
        }];
        var _0x26f833 = _0x32517c.map(function (_0x34fd69) {
          var _0x1836ab = _0x490c3e(_0x34fd69.id, true);
          return {
            'title': _0x34fd69.title,
            'id': _0x34fd69.id,
            'checkbox': true,
            'checked': _0x1836ab
          };
        });
        Lampa.Select.show({
          'title': "Подборки сериалов",
          'items': _0x26f833,
          'onBack': function () {
            Lampa.Controller.toggle(_0x20032b || "settings");
          },
          'onCheck': function (_0x3cea83) {
            var _0x44c849 = _0x3cea83.id;
            var _0x5f46cd = _0x490c3e(_0x44c849, true);
            _0x59bf81(_0x44c849, !_0x5f46cd);
            _0x3cea83.checked = !_0x5f46cd;
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_getBestContentByGenre",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Подборки топ фильмов и сериалов"),
          'description': Lampa.Lang.translate("Подборки лучшего контента за все время")
        },
        'onChange': function () {
          var _0x1c6ef = Lampa.Controller.enabled().name;
          _0x52ee76(_0x1c6ef);
        }
      });
      function _0x52ee76(_0x4ccab2) {
        var _0x25d1a8 = [{
          'title': "Фильмы",
          'id': "getBestContentByGenreMovie"
        }, {
          'title': "Сериалы",
          'id': "getBestContentByGenreTV"
        }];
        var _0x4d3edb = _0x25d1a8.map(function (_0x1eb2f2) {
          var _0x5d0444 = _0x490c3e(_0x1eb2f2.id, true);
          return {
            'title': _0x1eb2f2.title,
            'id': _0x1eb2f2.id,
            'checkbox': true,
            'checked': _0x5d0444
          };
        });
        Lampa.Select.show({
          'title': "Подборки топ контента",
          'items': _0x4d3edb,
          'onBack': function () {
            Lampa.Controller.toggle(_0x4ccab2 || "settings");
          },
          'onCheck': function (_0x1ca7bc) {
            var _0x2a0279 = _0x1ca7bc.id;
            var _0x5614dd = _0x490c3e(_0x2a0279, true);
            _0x59bf81(_0x2a0279, !_0x5614dd);
            _0x1ca7bc.checked = !_0x5614dd;
          }
        });
      }
      Lampa.SettingsApi.addParam({
        'component': "surs",
        'param': {
          'name': "surs_best_content",
          'type': "button"
        },
        'field': {
          'name': Lampa.Lang.translate("Топ подборки за 5 лет"),
          'description': Lampa.Lang.translate("Подборки лучших фильмов и сериалов за случайные 5 лет")
        },
        'onChange': function () {
          var _0xb803ff = Lampa.Controller.enabled().name;
          _0x1a5a9e(_0xb803ff);
        }
      });
      function _0x1a5a9e(_0xcf255e) {
        var _0x80df4e = [{
          'title': "Фильмы",
          'id': "getBestContentByGenreAndPeriod_movie"
        }, {
          'title': "Сериалы",
          'id': "getBestContentByGenreAndPeriod_tv"
        }];
        var _0x31c67d = _0x80df4e.map(function (_0x2681e4) {
          var _0x343050 = _0x490c3e(_0x2681e4.id, true);
          return {
            'title': _0x2681e4.title,
            'id': _0x2681e4.id,
            'checkbox': true,
            'checked': _0x343050
          };
        });
        Lampa.Select.show({
          'title': "Топ подборки за 5 лет",
          'items': _0x31c67d,
          'onBack': function () {
            Lampa.Controller.toggle(_0xcf255e || "settings");
          },
          'onCheck': function (_0x35bbde) {
            var _0x5ee5db = _0x35bbde.id;
            var _0x574c73 = _0x490c3e(_0x5ee5db, true);
            _0x59bf81(_0x5ee5db, !_0x574c73);
            _0x35bbde.checked = !_0x574c73;
          }
        });
      }
      if (!Lampa.Storage.get("surs_disableCustomName")) {
        Lampa.SettingsApi.addParam({
          'component': "surs",
          'param': {
            'name': '',
            'type': "title"
          },
          'field': {
            'name': "Название",
            'description': ''
          }
        });
        Lampa.SettingsApi.addParam({
          'component': "surs",
          'param': {
            'name': "surs_setName",
            'type': "button",
            'default': "Ввести название"
          },
          'field': {
            'name': Lampa.Lang.translate("Переименование подборок"),
            'description': Lampa.Lang.translate("Введите свое название вместо " + _0x56bcd5)
          },
          'onChange': function () {
            Lampa.Input.edit({
              'free': true,
              'title': Lampa.Lang.translate("Введите новое название"),
              'nosave': true,
              'value': ''
            }, function (_0x28024d) {
              if (_0x28024d) {
                Lampa.Storage.set("surs_name", _0x28024d);
                Lampa.Noty.show(Lampa.Lang.translate("Название сохранено. Обновление..."));
                setTimeout(function () {
                  Lampa.Controller.toggle("settings");
                }, 100);
                setTimeout(function () {
                  var _0x5c0b5a = Lampa.Storage.get("surs_name");
                  _0x4827cb(_0x5c0b5a, false);
                }, 1500);
                setTimeout(function () {
                  window.location.reload();
                }, 2000);
              } else {
                Lampa.Noty.show(Lampa.Lang.translate("Название не введено."));
              }
            });
          }
        });
      }
    }
    if (window.appready) {
      _0x6b35f7();
      _0x65e718();
      if (!Lampa.Storage.get("surs_disableMenu")) {
        _0x3ad9cb();
      }
    } else {
      Lampa.Listener.follow("app", function (_0x4c4549) {
        if (_0x4c4549.type == "ready") {
          _0x6b35f7();
          _0x65e718();
          if (!Lampa.Storage.get("surs_disableMenu")) {
            _0x3ad9cb();
          }
        }
      });
    }
  }
  if (!window.plugin_tmdb_mod_ready) {
    _0x4cbab4();
  }
})();