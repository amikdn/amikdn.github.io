(function(){
  "use strict";
  // Определения с зашифрованными URL (Base64)
  var _d = {
    api: "lampac",
    localhost: atob("aHR0cHM6Ly9sYW0uYWt0ZXItYmxhY2suY29tLy"),
    apn: "10"
  };
  var uid = Lampa.Storage.get("lampac_unic_id", "");
  if(!uid){
    uid = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set("lampac_unic_id", uid);
  }
  // Загружаем внешний скрипт с зашифрованным адресом
  if(!window.rch){
    Lampa.Utils.putScript([atob("aHR0cHM6Ly9hYm1zeC50ZWNoL2ludmMtcmNoLmpz")], function(){}, false, function(){
      if(!window.rch.startTypeInvoke)
        window.rch.typeInvoke(atob("aHR0cHM6Ly9hYm1zeC50ZWNo"), function(){});
    }, true);
  }
  // Конструктор BlazorNet (для работы с .NET методами)
  function BlazorNet(){
    this.net = new Lampa.Reguest();
    this.timeout = function(t){ this.net.timeout(t); };
    this.req = function(type, url, suc, err, post, params){
      params = params !== undefined ? params : {};
      var parts = url.split(_d.localhost).pop().split("?");
      if(parts[0].indexOf("http") >= 0)
        return this.net[type](url, suc, err, post, params);
      DotNet.invokeMethodAsync("JinEnergy", parts[0], parts[1]).then(function(res){
        params.dataType === "text" ? suc(res) : suc(Lampa.Arrays.decodeJson(res, {}));
      })["catch"](function(e){
        console.log("Blazor","error:", e);
        err(e);
      });
    };
    this.silent = function(u, suc, err, post, params){
      params = params !== undefined ? params : {};
      this.req("silent", u, suc, err, post, params);
    };
    this["native"] = function(u, suc, err, post, params){
      params = params !== undefined ? params : {};
      this.req("native", u, suc, err, post, params);
    };
    this.clear = function(){ this.net.clear(); };
  }
  // Используем стандартный регистр запросов
  var Network = Lampa.Reguest;
  // Функция компонента (обработка списка файлов, фильтра и запросов)
  function component(obj){
    var net = new Network(),
        scroll = new Lampa.Scroll({ mask:true, over:true }),
        files = new Lampa.Explorer(obj),
        filter = new Lampa.Filter(obj),
        sources = {},
        last,
        srcUrl,
        bal, init, balTimer,
        imgs = [],
        reqCount = 0, reqTimer,
        lifeWait = 0, lifeTimer,
        hubConn, hubTimer,
        fltSrc = {},
        fltTr = {
          season: Lampa.Lang.translate("torrent_serial_season"),
          voice: Lampa.Lang.translate("torrent_parser_voice"),
          source: Lampa.Lang.translate("settings_rest_source")
        },
        fltFind = { season: [], voice: [] },
        balWithSearch = ["kinotochka","kinopub","lumex","filmix","filmixtv","redheadsound","animevost","animego","animedia","animebesst","anilibria","rezka","rhsprem","kodik","remux","animelib","kinoukr","rc/filmix","rc/fxapi","rc/kinopub","rc/rhs","vcdn"];

    function account(u){
      u = u + "";
      if(u.indexOf("account_email=") === -1){
        var em = Lampa.Storage.get("account_email");
        if(em)
          u = Lampa.Utils.addUrlComponent(u, "account_email=" + encodeURIComponent(em));
      }
      if(u.indexOf("uid=") === -1){
        var id = Lampa.Storage.get("lampac_unic_id", "");
        if(id)
          u = Lampa.Utils.addUrlComponent(u, "uid=" + encodeURIComponent(id));
      }
      if(u.indexOf("token=") === -1){
        var t = "";
        if(t !== "")
          u = Lampa.Utils.addUrlComponent(u, "token=");
      }
      return Lampa.Utils.addUrlComponent(u, "ab_token=" + Lampa.Storage.get("token"));
    }
    function balName(j){ var b = j.balanser, n = j.name.split(" ")[0]; return (b || n).toLowerCase(); }
    function clarAdd(val){
      var id = Lampa.Utils.hash(obj.movie.number_of_seasons ? obj.movie.original_name : obj.movie.original_title);
      var all = Lampa.Storage.get("clarification_search", "{}");
      all[id] = val;
      Lampa.Storage.set("clarification_search", all);
    }
    function clarDel(){
      var id = Lampa.Utils.hash(obj.movie.number_of_seasons ? obj.movie.original_name : obj.movie.original_title);
      var all = Lampa.Storage.get("clarification_search", "{}");
      delete all[id];
      Lampa.Storage.set("clarification_search", all);
    }
    function clarGet(){
      var id = Lampa.Utils.hash(obj.movie.number_of_seasons ? obj.movie.original_name : obj.movie.original_title);
      var all = Lampa.Storage.get("clarification_search", "{}");
      return all[id];
    }
    this.initialize = function(){
      var _this = this;
      this.loading(true);
      filter.onSearch = function(v){ clarAdd(v); Lampa.Activity.replace({ search:v, clarification:true }); };
      filter.onBack = function(){ _this.start(); };
      filter.render().find(".selector").on("hover:enter", function(){ clearInterval(balTimer); });
      filter.render().find(".filter--search").appendTo(filter.render().find(".torrent-filter"));
      filter.onSelect = function(type, a, b){
        if(type === "filter"){
          if(a.reset){
            clarDel();
            _this.replaceChoice({ season:0, voice:0, voice_url:"", voice_name:"" });
            setTimeout(function(){ Lampa.Select.close(); Lampa.Activity.replace({ clarification:0 }); }, 10);
          } else {
            var u = fltFind[a.stype][b.index].url;
            var choice = _this.getChoice();
            if(a.stype === "voice"){
              choice.voice_name = fltFind.voice[b.index].title;
              choice.voice_url = u;
            }
            choice[a.stype] = b.index;
            _this.saveChoice(choice);
            _this.reset();
            _this.request(u);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if(type === "sort"){
          Lampa.Select.close();
          obj.lampac_custom_select = a.source;
          _this.changeBalanser(a.source);
        }
      };
      if(filter.addButtonBack) filter.addButtonBack();
      filter.render().find(".filter--sort span").text(Lampa.Lang.translate("lampac_balanser"));
      scroll.body().addClass("torrent-list");
      files.appendFiles(scroll.render());
      files.appendHead(filter.render());
      scroll.minus(files.render().find(".explorer__files-head"));
      scroll.body().append(Lampa.Template.get("lampac_content_loading"));
      Lampa.Controller.enable("content");
      this.loading(false);
      this.externalids().then(function(){ return _this.createSource(); })
      .then(function(json){
        if(!balWithSearch.find(function(b){ return bal.slice(0,b.length) === b; }))
          filter.render().find(".filter--search").addClass("hide");
        _this.search();
      })["catch"](function(e){ _this.noConnectToServer(e); });
    };
    this.rch = function(json, noreset){
      var _this2 = this;
      var load = function(){
        if(hubConn){ clearTimeout(hubTimer); hubConn.stop(); hubConn = null; console.log("RCH", "hubConnection stop"); }
        hubConn = new signalR.HubConnectionBuilder().withUrl(json.ws).build();
        hubConn.start().then(function(){
          window.rch.Registry(atob("aHR0cHM6Ly9hYm1zeC50ZWNo"), hubConn, function(){
            console.log("RCH", "hubConnection start");
            if(!noreset) _this2.find();
            else noreset();
          });
        })["catch"](function(err){ console.log("RCH", err.toString()); console.error(err.toString()); });
        if(json.keepalive > 0){
          hubTimer = setTimeout(function(){ hubConn.stop(); hubConn = null; }, 1000 * json.keepalive);
        }
      };
      if(typeof signalR == "undefined"){
        Lampa.Utils.putScript([atob("aHR0cHM6Ly9hYm1zeC50ZWNoL3NpZ25hbHItNi4wLjI1X2VzNQ==")], function(){}, false, function(){ load(); }, true);
      } else load();
    };
    this.externalids = function(){
      return new Promise(function(resolve, reject){
        if(!obj.movie.imdb_id || !obj.movie.kinopoisk_id){
          var q = [];
          q.push("id=" + obj.movie.id);
          q.push("serial=" + (obj.movie.name ? 1 : 0));
          if(obj.movie.imdb_id) q.push("imdb_id=" + (obj.movie.imdb_id || ""));
          if(obj.movie.kinopoisk_id) q.push("kinopoisk_id=" + (obj.movie.kinopoisk_id || ""));
          var u = _d.localhost + "externalids?" + q.join("&");
          net.timeout(10000);
          net.silent(account(u), function(json){
            for(var n in json) obj.movie[n] = json[n];
            resolve();
          }, function(){ resolve(); });
        } else resolve();
      });
    };
    this.updateBalanser = function(bn){ var ls = Lampa.Storage.cache("online_last_balanser", 2000, {}); ls[obj.movie.id] = bn; Lampa.Storage.set("online_last_balanser", ls); };
    this.changeBalanser = function(bn){
      this.updateBalanser(bn);
      Lampa.Storage.set("online_balanser", bn);
      var to = this.getChoice(bn), from = this.getChoice();
      if(from.voice_name) to.voice_name = from.voice_name;
      this.saveChoice(to, bn);
      Lampa.Activity.replace();
    };
    this.requestParams = function(u){
      if(bal && bal.toLowerCase() === "filmixtv")
        u = "http://rc.bwa.to/rc/fxapi";
      else if(bal && bal.toLowerCase() === "fancdn")
        u = "http://vcdn2.skaz.tv/lite/fancdn";
      var q = [];
      var cs = obj.movie.source || "tmdb";
      q.push("id=" + obj.movie.id);
      if(obj.movie.imdb_id) q.push("imdb_id=" + (obj.movie.imdb_id || ""));
      if(obj.movie.kinopoisk_id) q.push("kinopoisk_id=" + (obj.movie.kinopoisk_id || ""));
      q.push("title=" + encodeURIComponent(obj.clarification ? obj.search : obj.movie.title || obj.movie.name));
      q.push("original_title=" + encodeURIComponent(obj.movie.original_title || obj.movie.original_name));
      q.push("serial=" + (obj.movie.name ? 1 : 0));
      q.push("original_language=" + (obj.movie.original_language || ""));
      q.push("year=" + ((obj.movie.release_date || obj.movie.first_air_date || "0000") + "").slice(0,4));
      q.push("source=" + cs);
      q.push("rchtype=" + (window.rch ? window.rch.type : ""));
      q.push("clarification=" + (obj.clarification ? 1 : 0));
      if(Lampa.Storage.get("account_email", "")) q.push("cub_id=" + Lampa.Utils.hash(Lampa.Storage.get("account_email", "")));
      return u + (u.indexOf("?") >= 0 ? "&" : "?") + q.join("&");
    };
    this.getLastChoiceBalanser = function(){
      var ls = Lampa.Storage.cache("online_last_balanser", 3000, {});
      return ls[obj.movie.id] ? ls[obj.movie.id] : Lampa.Storage.get("online_balanser", fltSrc.length ? fltSrc[0] : "");
    };
    this.startSource = function(json){
      return new Promise(function(resolve, reject){
        json.forEach(function(j){
          var n = balName(j);
          if(n === "filmixtv") j.name = "Filmix - 720p";
          if(n === "pidtor") j.name = "Torrent - 2160";
          sources[n] = { url: j.url, name: j.name, show: typeof j.show === "undefined" ? true : j.show };
        });
        fltSrc = Lampa.Arrays.getKeys(sources);
        var lowPriority = [];
        fltSrc.sort(function(a, b){
          if(a === "") return -1;
          if(b === "") return 1;
          var aLow = lowPriority.indexOf(a) !== -1,
              bLow = lowPriority.indexOf(b) !== -1;
          if(aLow && !bLow) return 1;
          if(bLow && !aLow) return -1;
          return 0;
        });
        if(fltSrc.length){
          var ls = Lampa.Storage.cache("online_last_balanser", 3000, {});
          bal = ls[obj.movie.id] ? ls[obj.movie.id] : Lampa.Storage.get("online_balanser", fltSrc[0]);
          if(lowPriority.indexOf(bal) !== -1 && fltSrc.some(function(item){ return lowPriority.indexOf(item) === -1; }))
            bal = fltSrc.find(function(item){ return lowPriority.indexOf(item) === -1; });
          if(!sources[bal]) bal = fltSrc[0];
          if(!sources[bal].show && !obj.lampac_custom_select) bal = fltSrc[0];
          srcUrl = sources[bal].url;
          resolve(json);
        } else { reject(); }
      });
    };
    this.lifeSource = function(){
      var _this3 = this;
      return new Promise(function(resolve, reject){
        var u = _this3.requestParams(_d.localhost + "lifeevents?memkey=" + (_this3.memkey || ""));
        var red = false;
        var f = function(g, any){
          if(g.accsdb) return reject(g);
          var lb = _this3.getLastChoiceBalanser();
          if(!red){
            var f2 = g.online.filter(function(c){ return any ? c.show : c.show && c.name.toLowerCase() === lb; });
            if(f2.length){ red = true; resolve(g.online.filter(function(c){ return c.show; })); }
            else if(any) reject();
          }
        };
        var fin = function(){
          net.timeout(3000);
          net.silent(account(u), function(g){
            lifeWait++;
            fltSrc = [];
            sources = {};
            g.online.forEach(function(j){
              var n = balName(j);
              if(n === "filmixtv") j.name = "Filmix - 720p";
              if(n === "pidtor") j.name = "Torrent - 2160";
              sources[n] = { url: j.url, name: j.name, show: typeof j.show === "undefined" ? true : j.show };
            });
            fltSrc = Lampa.Arrays.getKeys(sources);
            filter.set("sort", fltSrc.map(function(e){ return { title: sources[e].name, source: e, selected: e === bal, ghost: !sources[e].show }; }));
            filter.chosen("sort", [sources[bal] ? sources[bal].name : bal]);
            f(g);
            var lb = _this3.getLastChoiceBalanser();
            if(lifeWait > 15 || g.ready){
              filter.render().find(".lampac-balanser-loader").remove();
              f(g, true);
            } else if(!red && sources[lb] && sources[lb].show){
              f(g, true);
              lifeWaitTimer = setTimeout(fin, 1000);
            } else { lifeWaitTimer = setTimeout(fin, 1000); }
          }, function(){
            lifeWait++;
            if(lifeWait > 15) reject();
            else { lifeWaitTimer = setTimeout(fin, 1000); }
          });
        };
        fin();
      });
    };
    this.createSource = function(){
      var _this4 = this;
      return new Promise(function(resolve, reject){
        var u = _this4.requestParams(_d.localhost + "lite/events?life=true");
        net.timeout(15000);
        net.silent(account(u), function(g){
          if(g.accsdb) return reject(g);
          if(g.life){
            _this4.memkey = g.memkey;
            filter.render().find(".filter--sort").append('<span class="lampac-balanser-loader" style="width:1.2em;height:1.2em;margin-top:0;background:url(./img/loader.svg) no-repeat 50%50%;background-size:contain;margin-left:0.5em"></span>');
            _this4.lifeSource().then(_this4.startSource).then(resolve)["catch"](reject);
          } else { _this4.startSource(g).then(resolve)["catch"](reject); }
        }, reject);
      });
    };
    this.create = function(){ return this.render(); };
    this.search = function(){ this.filter({ source:fltSrc }, this.getChoice()); this.find(); };
    this.find = function(){ this.request(this.requestParams(srcUrl)); };
    this.request = function(u){
      reqCount++;
      if(reqCount < 10){
        net["native"](account(u), this.parse.bind(this), this.doesNotAnswer.bind(this), false, { dataType:"text" });
        clearTimeout(reqTimer);
        reqTimer = setTimeout(function(){ reqCount = 0; }, 4000);
      } else this.empty();
    };
    this.parseJsonDate = function(s, name){
      try{
        var h = $("<div>" + s + "</div>"), a = [];
        h.find(name).each(function(){
          var i = $(this), d = JSON.parse(i.attr("data-json")), se = i.attr("s"), ep = i.attr("e"), t = i.text();
          if(!obj.movie.name){
            if(t.match(/\d+p/i)){
              if(!d.quality){ d.quality = {}; d.quality[t] = d.url; }
              t = obj.movie.title;
            }
            if(t === "По умолчанию") t = obj.movie.title;
          }
          if(ep) d.episode = parseInt(ep);
          if(se) d.season = parseInt(se);
          if(t) d.text = t;
          d.active = i.hasClass("active");
          a.push(d);
        });
        return a;
      } catch(e){ return []; }
    };
    this.getFileUrl = function(f, call){
      var _this = this;
      function addT(str){ return str + "&ab_token=" + Lampa.Storage.get("token"); }
      if(f.stream && f.stream.indexOf("alloha") >= 0)
         f.stream = addT(f.stream);
      if(f.url && f.url.indexOf("alloha") >= 0)
         f.url = addT(f.url);
      if(Lampa.Storage.field("player") !== "inner" && f.stream && Lampa.Platform.is("apple")){
         var nf = Lampa.Arrays.clone(f);
         nf.method = "play"; nf.url = f.stream;
         call(nf, {});
      } else if(f.method === "play") call(f, {});
      else {
         Lampa.Loading.start(function(){ Lampa.Loading.stop(); Lampa.Controller.toggle("content"); net.clear(); });
         net["native"](account(f.url), function(j){
           if(j.rch){
             _this.rch(j, function(){ Lampa.Loading.stop(); _this.getFileUrl(f, call); });
           } else { Lampa.Loading.stop(); call(j, j); }
         }, function(){ Lampa.Loading.stop(); call(false, {}); });
      }
    };
    this.toPlayElement = function(f){ return { title: f.title, url: f.url, quality: f.qualitys, timeline: f.timeline, subtitles: f.subtitles, callback: f.mark }; };
    this.appendAPN = function(d){
      if(_d.api.indexOf("pwa")===0 && _d.apn.length && d.url && typeof d.url==="string" && d.url.indexOf(_d.apn)===-1)
         d.url_reserve = _d.apn + d.url;
    };
    this.setDefaultQuality = function(d){
      var keys = Lampa.Arrays.getKeys(d.quality);
      if(keys.length){
        for(var q in d.quality){
          if(parseInt(q) === Lampa.Storage.field("video_quality_default")){
            d.url = d.quality[q];
            this.appendAPN(d);
            break;
          }
        }
      }
    };
    this.display = function(videos){
      var _this5 = this;
      this.draw(videos, {
        onEnter: function(item, html){
          _this5.getFileUrl(item, function(j, jc){
            if(j && j.url){
              var pl = [];
              var first = _this5.toPlayElement(item);
              first.url = j.url;
              first.headers = j.headers;
              first.quality = jc.quality || item.qualitys;
              first.subtitles = j.subtitles;
              first.vast_url = j.vast_url;
              first.vast_msg = j.vast_msg;
              _this5.appendAPN(first);
              _this5.setDefaultQuality(first);
              if(item.season){
                videos.forEach(function(e){
                  var c = _this5.toPlayElement(e);
                  if(e === item) c.url = j.url;
                  else {
                    if(e.method === "call"){
                      if(Lampa.Storage.field("player") !== "inner"){
                        c.url = e.stream; delete c.quality;
                      } else {
                        c.url = function(call){
                          _this5.getFileUrl(e, function(s, sc){
                            if(s.url){ c.url = s.url; c.quality = sc.quality || e.qualitys; c.subtitles = s.subtitles; _this5.appendAPN(c); _this5.setDefaultQuality(c); e.mark(); }
                            else { c.url = ""; Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink")); }
                            call();
                          }, function(){ c.url = ""; call(); });
                        };
                      }
                    } else c.url = e.url;
                  }
                  _this5.appendAPN(c);
                  _this5.setDefaultQuality(c);
                  pl.push(c);
                });
              } else { pl.push(first); }
              if(pl.length > 1) first.playlist = pl;
              if(first.url){
                Lampa.Player.play(first);
                Lampa.Player.playlist(pl);
                item.mark();
                _this5.updateBalanser(bal);
              } else {
                Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
              }
            } else Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
          }, true);
        },
        onContextMenu: function(item, html, data, call){
          _this5.getFileUrl(item, function(stream){
            call({ file: stream.url, quality: item.qualitys });
          }, true);
        }
      });
      this.filter({
        season: fltFind.s.map(function(s){ return s.title; }),
        voice: fltFind.voice.map(function(b){ return b.title; })
      }, this.getChoice());
    };
    this.parse = function(s){
      var json = Lampa.Arrays.decodeJson(s, {});
      if(json && json.accsdb && json.msg && json.msg.indexOf("@Abcinema_bot") !== -1){
        json.msg = "";
        json.accsdb = false;
      }
      if(Lampa.Arrays.isObject(s) && s.rch) json = s;
      if(json.rch) return this.rch(json);
      try{
        var items = this.parseJsonDate(s, ".videos__item"),
            buttons = this.parseJsonDate(s, ".videos__button");
        if(items.length === 1 && items[0].method === "link" && !items[0].similar){
          fltFind.s = items.map(function(s){ return { title: s.text, url: s.url }; });
          this.replaceChoice({ season:0 });
          this.request(items[0].url);
        } else {
          this.activity.loader(false);
          var vids = items.filter(function(v){ return v.method === "play" || v.method === "call"; }),
              similar = items.filter(function(v){ return v.similar; });
          if(vids.length){
            if(buttons.length){
              fltFind.voice = buttons.map(function(b){ return { title: b.text, url: b.url }; });
              var sv = this.getChoice(bal).voice_url,
                  sn = this.getChoice(bal).voice_name,
                  fvu = buttons.find(function(v){ return v.url === sv; }),
                  fvn = buttons.find(function(v){ return v.text === sn; }),
                  fva = buttons.find(function(v){ return v.active; });
              if(fvu && !fvu.active){
                console.log("Lampac", "go to voice", fvu);
                this.replaceChoice({ voice: buttons.indexOf(fvu), voice_name: fvu.text });
                this.request(fvu.url);
              } else if(fvn && !fvn.active){
                console.log("Lampac", "go to voice", fvn);
                this.replaceChoice({ voice: buttons.indexOf(fvn), voice_name: fvn.text });
                this.request(fvn.url);
              } else {
                if(fva) this.replaceChoice({ voice: buttons.indexOf(fva), voice_name: fva.text });
                this.display(vids);
              }
            } else {
              this.replaceChoice({ voice:0, voice_url:"", voice_name:"" });
              this.display(vids);
            }
          } else if(items.length){
            if(similar.length){
              this.similars(similar);
              this.activity.loader(false);
            } else {
              fltFind.s = items.map(function(s){ return { title: s.text, url: s.url }; });
              var ss = this.getChoice(bal).season,
                  s0 = fltFind.s[ss];
              if(!s0) s0 = fltFind.s[0];
              console.log("Lampac", "go to season", s0);
              this.request(s0.url);
            }
          } else {
            this.doesNotAnswer(json);
          }
        }
      } catch(e){
        this.doesNotAnswer(e);
      }
    };
    this.similars = function(json){
      var _this6 = this;
      scroll.clear();
      json.forEach(function(elem){
        elem.title = elem.text;
        elem.info = "";
        var info = [];
        var yr = ((elem.start_date || elem.year || obj.movie.release_date || obj.movie.first_air_date || "") + "").slice(0,4);
        if(yr) info.push(yr);
        if(elem.details) info.push(elem.details);
        elem.title = elem.title || elem.text;
        elem.time = elem.time || "";
        elem.info = info.join('<span class="online-prestige-split">●</span>');
        var it = Lampa.Template.get("lampac_prestige_folder", elem);
        it.on("hover:enter", function(){ _this6.reset(); _this6.request(elem.url); })
          .on("hover:focus", function(e){ last = e.target; scroll.update($(e.target), true); });
        scroll.append(it);
      });
      this.filter({ season: fltFind.s.map(function(s){ return s.title; }), voice: fltFind.voice.map(function(b){ return b.title; }) }, this.getChoice());
      Lampa.Controller.enable("content");
    };
    this.getChoice = function(fb){
      var d = Lampa.Storage.cache("online_choice_" + (fb || bal), 3000, {}),
          c = d[obj.movie.id] || {};
      Lampa.Arrays.extend(c, { season:0, voice:0, voice_name:"", voice_id:0, episodes_view:{}, movie_view:"" });
      return c;
    };
    this.saveChoice = function(choice, fb){
      var d = Lampa.Storage.cache("online_choice_" + (fb || bal), 3000, {});
      d[obj.movie.id] = choice;
      Lampa.Storage.set("online_choice_" + (fb || bal), d);
      this.updateBalanser(fb || bal);
    };
    this.replaceChoice = function(choice, fb){
      var to = this.getChoice(fb);
      Lampa.Arrays.extend(to, choice, true);
      this.saveChoice(to, fb);
    };
    this.clearImages = function(){
      imgs.forEach(function(img){
        img.onerror = function(){};
        img.onload = function(){};
        img.src = "";
      });
      imgs = [];
    };
    this.reset = function(){
      last = false;
      clearInterval(balTimer);
      net.clear();
      this.clearImages();
      scroll.render().find(".empty").remove();
      scroll.clear();
      scroll.reset();
      scroll.body().append(Lampa.Template.get("lampac_content_loading"));
    };
    this.loading = function(s){
      s ? this.activity.loader(true) : (this.activity.loader(false), this.activity.toggle());
    };
    this.filter = function(fi, choice){
      var _this7 = this, sel = [];
      function add(type, title){
        var need = _this7.getChoice();
        var items = fi[type], sub = [];
        var val = need[type];
        items.forEach(function(n, i){ sub.push({ title: n, selected: val === i, index: i }); });
        sel.push({ title: title, subtitle: items[val], items: sub, stype: type });
      }
      fi.source = fltSrc;
      sel.push({ title: Lampa.Lang.translate("torrent_parser_reset"), reset: true });
      this.saveChoice(choice);
      if(fi.voice && fi.voice.length) add("voice", Lampa.Lang.translate("torrent_parser_voice"));
      if(fi.season && fi.season.length) add("season", Lampa.Lang.translate("torrent_serial_season"));
      filter.set("filter", sel);
      filter.set("sort", fltSrc.map(function(e){ return { title: sources[e].name, source: e, selected: e === bal, ghost: !sources[e].show }; }));
      this.selected(fi);
    };
    this.selected = function(fi){
      var need = this.getChoice(), sel = [];
      for(var i in need){
        if(fi[i] && fi[i].length){
          if(i === "voice") sel.push(fltTr[i] + ": " + fi[i][need[i]]);
          else if(i !== "source"){
            if(fi.season.length >= 1) sel.push(fltTr.season + ": " + fi[i][need[i]]);
          }
        }
      }
      filter.chosen("filter", sel);
      filter.chosen("sort", [sources[bal].name]);
    };
    this.getEpisodes = function(season, call){
      var eps = [];
      if(["cub","tmdb"].indexOf(obj.movie.source || "tmdb") === -1) return call(eps);
      if(typeof obj.movie.id === "number" && obj.movie.name){
        var url = "tv/" + obj.movie.id + "/season/" + season + "?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language", "ru"),
            apiUrl = Lampa.TMDB.api(url);
        net.timeout(10000);
        net["native"](apiUrl, function(data){ eps = data.episodes || []; call(eps); }, function(a,c){ call(eps); });
      } else call(eps);
    };
    this.watched = function(set){
      var id = Lampa.Utils.hash(obj.movie.number_of_seasons ? obj.movie.original_name : obj.movie.original_title);
      var w = Lampa.Storage.cache("online_watched_last", 5000, {});
      if(set){
        if(!w[id]) w[id] = {};
        Lampa.Arrays.extend(w[id], set, true);
        Lampa.Storage.set("online_watched_last", w);
        this.updateWatched();
      } else return w[id];
    };
    this.updateWatched = function(){
      var w = this.watched();
      var body = scroll.body().find(".online-prestige-watched .online-prestige-watched__body").empty();
      if(w){
        var line = [];
        if(w.balanser_name) line.push(w.balanser_name);
        if(w.voice_name) line.push(w.voice_name);
        if(w.season) line.push(Lampa.Lang.translate("torrent_serial_season") + " " + w.season);
        if(w.episode) line.push(Lampa.Lang.translate("torrent_serial_episode") + " " + w.episode);
        line.forEach(function(n){ body.append("<span>" + n + "</span>"); });
      } else body.append("<span>" + Lampa.Lang.translate("lampac_no_watch_history") + "</span>");
    };
    this.draw = function(items){
      var _this8 = this,
          params = arguments.length > 1 ? arguments[1] : {};
      if(!items.length) return this.empty();
      scroll.clear();
      scroll.append(Lampa.Template.get("lampac_prestige_watched", {}));
      this.updateWatched();
      this.getEpisodes(items[0].season, function(eps){
        var viewed = Lampa.Storage.cache("online_view", 5000, []),
            ser = obj.movie.name ? true : false,
            cho = _this8.getChoice(),
            full = window.innerWidth > 480,
            scrollToEl = false, scrollToMark = false;
        items.forEach(function(el, ind){
          var ep = ser && eps.length && !params.similars ? eps.find(function(e){ return e.episode_number == el.episode; }) : false,
              epn = el.episode || ind+1,
              lastEp = cho.episodes_view[el.season],
              vname = cho.voice_name || (fltFind.voice[0] ? fltFind.voice[0].title : false) || el.voice_name || (ser ? "Неизвестно" : el.text) || "Неизвестно";
          if(el.quality){
            el.qualitys = el.quality;
            el.quality = Lampa.Arrays.getKeys(el.quality)[0];
          }
          Lampa.Arrays.extend(el, { 
            voice_name: vname,
            info: vname.length > 60 ? vname.substr(0,60) + "..." : vname,
            quality: "",
            time: Lampa.Utils.secondsToTime((ep ? ep.runtime : obj.movie.runtime)*60, true)
          });
          var ht = Lampa.Utils.hash(el.season ? [el.season, el.season > 10 ? ":" : "", el.episode, obj.movie.original_title].join("") : obj.movie.original_title),
              hb = Lampa.Utils.hash(el.season ? [el.season, el.season > 10 ? ":" : "", el.episode, obj.movie.original_title, el.voice_name].join("") : obj.movie.original_title + el.voice_name),
              data = { hash_timeline: ht, hash_behold: hb },
              info = [];
          if(el.season){ el.translate_episode_end = _this8.getLastEpisode(items); el.translate_voice = el.voice_name; }
          if(el.text && !ep) el.title = el.text;
          el.timeline = Lampa.Timeline.view(ht);
          if(ep){
            el.title = ep.name;
            if(el.info.length < 30 && ep.vote_average)
              info.push(Lampa.Template.get("lampac_prestige_rate", { rate: parseFloat(ep.vote_average+"").toFixed(1) }, true));
            if(ep.air_date && full)
              info.push(Lampa.Utils.parseTime(ep.air_date).full);
          } else if(obj.movie.release_date && full){
            info.push(Lampa.Utils.parseTime(obj.movie.release_date).full);
          }
          if(!ser && obj.movie.tagline && el.info.length < 30)
            info.push(obj.movie.tagline);
          if(el.info) info.push(el.info);
          if(info.length) el.info = info.map(function(i){ return "<span>" + i + "</span>"; }).join('<span class="online-prestige-split">●</span>');
          var html = Lampa.Template.get("lampac_prestige_full", el),
              loader = html.find(".online-prestige__loader"),
              image = html.find(".online-prestige__img");
          if(!ser){
            if(cho.movie_view === hb) scrollToEl = html;
          } else if(typeof lastEp !== "undefined" && lastEp == epn){
            scrollToEl = html;
          }
          if(ser && !ep){
            image.append('<div class="online-prestige__episode-number">' + ("0" + (el.episode || ind+1)).slice(-2) + "</div>");
            loader.remove();
          } else if(!ser && ["cub","tmdb"].indexOf(obj.movie.source || "tmdb") === -1)
            loader.remove();
          else {
            var img = html.find("img")[0];
            img.onerror = function(){ img.src = "./img/img_broken.svg"; };
            img.onload = function(){ image.addClass("online-prestige__img--loaded"); loader.remove(); if(ser) image.append('<div class="online-prestige__episode-number">' + ("0" + (el.episode || ind+1)).slice(-2) + "</div>"); };
            img.src = Lampa.TMDB.image("t/p/w300" + (ep ? ep.still_path : obj.movie.backdrop_path));
            imgs.push(img);
          }
          html.find(".online-prestige__timeline").append(Lampa.Timeline.render(el.timeline));
          if(viewed.indexOf(hb) !== -1){
            scrollToMark = html;
            html.find(".online-prestige__img").append('<div class="online-prestige__viewed">' + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
          }
          el.mark = function(){
            viewed = Lampa.Storage.cache("online_view", 5000, []);
            if(viewed.indexOf(hb) === -1){
              viewed.push(hb);
              Lampa.Storage.set("online_view", viewed);
              if(html.find(".online-prestige__viewed").length === 0)
                html.find(".online-prestige__img").append('<div class="online-prestige__viewed">' + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
            }
            cho = _this8.getChoice();
            if(!ser){ cho.movie_view = hb; }
            else { cho.episodes_view[el.season] = epn; }
            _this8.saveChoice(cho);
            var vn = cho.voice_name || el.voice_name || el.title;
            if(vn.length > 30) vn = vn.slice(0,30) + "...";
            _this8.watched({ balanser: bal, balanser_name: Lampa.Utils.capitalizeFirstLetter(sources[bal].name.split(" ")[0]), voice_id: cho.voice_id, voice_name: vn, episode: el.episode, season: el.season });
          };
          el.unmark = function(){
            viewed = Lampa.Storage.cache("online_view", 5000, []);
            if(viewed.indexOf(hb) !== -1){
              Lampa.Arrays.remove(viewed, hb);
              Lampa.Storage.set("online_view", viewed);
              Lampa.Storage.remove("online_view", hb);
              html.find(".online-prestige__viewed").remove();
            }
          };
          el.timeclear = function(){
            el.timeline.percent = 0;
            el.timeline.time = 0;
            el.timeline.duration = 0;
            Lampa.Timeline.update(el.timeline);
          };
          html.on("hover:enter", function(){
            if(obj.movie.id){
              Lampa.Favorite.add("history", obj.movie, 100);
              var user = Lampa.Storage.get("ab_account");
              if(obj && obj.movie && user){
                try{
                  $.ajax("//tracker.abmsx.tech/track", {
                    method:"post",
                    type:"POST",
                    contentType:"application/json",
                    data: JSON.stringify({
                      "balancer": bal,
                      "id": obj.movie.id,
                      "token": user.token,
                      "userId": user.id,
                      "name": obj.search,
                      "season": el.season || 0,
                      "episode": el.episode || 0
                    }),
                    error: function(e){ console.log("track error request", e); }
                  });
                } catch(e){ console.log("track error", e); }
              }
            }
            if(params.onEnter) params.onEnter(el, html, data);
          }).on("hover:focus", function(e){
            last = e.target;
            if(params.onFocus) params.onFocus(el, html, data);
            scroll.update($(e.target), true);
          });
          if(params.onRender) params.onRender(el, html, data);
          _this8.contextMenu({ html: html, element: el, onFile: function(call){ if(params.onContextMenu) params.onContextMenu(el, html, data, call); }, onClearAllMark: function(){ items.forEach(function(e){ e.unmark(); }); }, onClearAllTime: function(){ items.forEach(function(e){ e.timeclear(); }); } });
          scroll.append(html);
        });
        if(ser && eps.length > items.length && !params.similars){
          var left = eps.slice(items.length);
          left.forEach(function(ep){
            var inf = [];
            if(ep.vote_average) inf.push(Lampa.Template.get("lampac_prestige_rate", { rate: parseFloat(ep.vote_average+"").toFixed(1) }, true));
            if(ep.air_date) inf.push(Lampa.Utils.parseTime(ep.air_date).full);
            var air = new Date((ep.air_date+"").replace(/-/g,"/")),
                now = Date.now(),
                day = Math.round((air.getTime()-now)/(24*60*60*1000)),
                txt = Lampa.Lang.translate("full_episode_days_left") + ": " + day,
                hhtml = Lampa.Template.get("lampac_prestige_full", { time: Lampa.Utils.secondsToTime((ep ? ep.runtime : obj.movie.runtime)*60, true), info: inf.length ? inf.map(function(i){ return "<span>" + i + "</span>"; }).join('<span class="online-prestige-split">●</span>') : "", title: ep.name, quality: day>0 ? txt : "" }),
                ldr = hhtml.find(".online-prestige__loader"),
                img = hhtml.find(".online-prestige__img"),
                s = items[0] ? items[0].season : 1;
            hhtml.find(".online-prestige__timeline").append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([s, ep.episode_number, obj.movie.original_title].join("")))));
            var iimg = hhtml.find("img")[0];
            if(ep.still_path){
              iimg.onerror = function(){ iimg.src = "./img/img_broken.svg"; };
              iimg.onload = function(){ img.addClass("online-prestige__img--loaded"); ldr.remove(); img.append('<div class="online-prestige__episode-number">' + ("0" + ep.episode_number).slice(-2) + "</div>"); };
              iimg.src = Lampa.TMDB.image("t/p/w300" + ep.still_path);
              imgs.push(iimg);
            } else { ldr.remove(); img.append('<div class="online-prestige__episode-number">' + ("0" + ep.episode_number).slice(-2) + "</div>"); }
            hhtml.on("hover:focus", function(e){ last = e.target; scroll.update($(e.target), true); });
            hhtml.css("opacity", "0.5");
            scroll.append(hhtml);
          });
        }
        if(scrollToEl) last = scrollToEl[0];
        else if(scrollToMark) last = scrollToMark[0];
        Lampa.Controller.enable("content");
      });
    };
    this.contextMenu = function(params){
      params.html.on("hover:long", function(){
        function show(extra){
          var en = Lampa.Controller.enabled().name, menu = [];
          if(Lampa.Platform.is("webos")) menu.push({ title: Lampa.Lang.translate("player_lauch") + " - Webos", player:"webos" });
          if(Lampa.Platform.is("android")) menu.push({ title: Lampa.Lang.translate("player_lauch") + " - Android", player:"android" });
          menu.push({ title: Lampa.Lang.translate("player_lauch") + " - Lampa", player:"lampa" });
          menu.push({ title: Lampa.Lang.translate("lampac_video"), separator:true });
          menu.push({ title: Lampa.Lang.translate("torrent_parser_label_title"), mark:true });
          menu.push({ title: Lampa.Lang.translate("torrent_parser_label_cancel_title"), unmark:true });
          menu.push({ title: Lampa.Lang.translate("time_reset"), timeclear:true });
          if(extra) menu.push({ title: Lampa.Lang.translate("copy_link"), copylink:true });
          menu.push({ title: Lampa.Lang.translate("more"), separator:true });
          if(Lampa.Account.logged() && params.element && typeof params.element.season !== "undefined" && params.element.translate_voice)
            menu.push({ title: Lampa.Lang.translate("lampac_voice_subscribe"), subscribe:true });
          menu.push({ title: Lampa.Lang.translate("lampac_clear_all_marks"), clearallmark:true });
          menu.push({ title: Lampa.Lang.translate("lampac_clear_all_timecodes"), timeclearall:true });
          Lampa.Select.show({
            title: Lampa.Lang.translate("title_action"),
            items: menu,
            onBack: function(){ Lampa.Controller.toggle(en); },
            onSelect: function(a){
              if(a.mark) params.element.mark();
              if(a.unmark) params.element.unmark();
              if(a.timeclear) params.element.timeclear();
              if(a.clearallmark) params.onClearAllMark();
              if(a.timeclearall) params.onClearAllTime();
              Lampa.Controller.toggle(en);
              if(a.player){ Lampa.Player.runas(a.player); params.html.trigger("hover:enter"); }
              if(a.copylink){
                if(extra.quality){
                  var q = [];
                  for(var i in extra.quality) q.push({ title: i, file: extra.quality[i] });
                  Lampa.Select.show({
                    title: Lampa.Lang.translate("settings_server_links"),
                    items: q,
                    onBack: function(){ Lampa.Controller.toggle(en); },
                    onSelect: function(b){
                      Lampa.Utils.copyTextToClipboard(b.file, function(){ Lampa.Noty.show(Lampa.Lang.translate("copy_secuses")); }, function(){ Lampa.Noty.show(Lampa.Lang.translate("copy_error")); });
                    }
                  });
                } else {
                  Lampa.Utils.copyTextToClipboard(extra.file, function(){ Lampa.Noty.show(Lampa.Lang.translate("copy_secuses")); }, function(){ Lampa.Noty.show(Lampa.Lang.translate("copy_error")); });
                }
              }
              if(a.subscribe){
                Lampa.Account.subscribeToTranslation({
                  card: obj.movie,
                  season: params.element.season,
                  episode: params.element.translate_episode_end,
                  voice: params.element.translate_voice
                }, function(){ Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_success")); }, function(){ Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_error")); });
              }
            }
          });
        }
        params.onFile(show);
      }).on("hover:focus", function(){ if(Lampa.Helper) Lampa.Helper.show("online_file", Lampa.Lang.translate("helper_online_file"), params.html); });
    };
    this.empty = function(){
      var h = Lampa.Template.get("lampac_does_not_answer", {});
      h.find(".online-empty__buttons").remove();
      h.find(".online-empty__title").text(Lampa.Lang.translate("empty_title_two"));
      h.find(".online-empty__time").text(Lampa.Lang.translate("empty_text"));
      scroll.clear();
      scroll.append(h);
      this.loading(false);
    };
    this.noConnectToServer = function(er){
      var h = Lampa.Template.get("lampac_does_not_answer", {});
      h.find(".online-empty__buttons").remove();
      h.find(".online-empty__title").text(Lampa.Lang.translate("title_error"));
      h.find(".online-empty__time").text(er && er.accsdb ? er.msg : Lampa.Lang.translate("lampac_does_not_answer_text").replace("{balanser}", sources[bal].name));
      scroll.clear();
      scroll.append(h);
      this.loading(false);
    };
    this.doesNotAnswer = function(er){
      var _this9 = this;
      this.reset();
      var h = Lampa.Template.get("lampac_does_not_answer", { balanser: bal });
      if(er && er.accsdb) h.find(".online-empty__title").html(er.msg);
      var tic = er && er.accsdb ? 10 : 5;
      h.find(".cancel").on("hover:enter", function(){ clearInterval(balTimer); });
      h.find(".change").on("hover:enter", function(){ clearInterval(balTimer); filter.render().find(".filter--sort").trigger("hover:enter"); });
      scroll.clear();
      scroll.append(h);
      this.loading(false);
      balTimer = setInterval(function(){
        tic--;
        h.find(".timeout").text(tic);
        if(tic === 0){
          clearInterval(balTimer);
          var keys = Lampa.Arrays.getKeys(sources),
              indx = keys.indexOf(bal),
              next = keys[indx + 1] || keys[0];
          bal = next;
          if(Lampa.Activity.active().activity === _this9.activity)
            _this9.changeBalanser(bal);
        }
      }, 1000);
    };
    this.getLastEpisode = function(items){
      var le = 0;
      items.forEach(function(e){ if(typeof e.episode !== "undefined") le = Math.max(le, parseInt(e.episode)); });
      return le;
    };
    this.start = function(){
      if(Lampa.Activity.active().activity !== this.activity) return;
      if(!init){ init = true; this.initialize(); }
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(obj.movie));
      Lampa.Controller.add("content", {
        toggle: function(){ Lampa.Controller.collectionSet(scroll.render(), exp.render()); Lampa.Controller.collectionFocus(last || false, scroll.render()); },
        gone: function(){ clearTimeout(balTimer); },
        up: function(){ Navigator.canmove("up") ? Navigator.move("up") : Lampa.Controller.toggle("head"); },
        down: function(){ Navigator.move("down"); },
        right: function(){ Navigator.canmove("right") ? Navigator.move("right") : filter.show(Lampa.Lang.translate("title_filter"), "filter"); },
        left: function(){ Navigator.canmove("left") ? Navigator.move("left") : Lampa.Controller.toggle("menu"); },
        back: this.back.bind(this)
      });
      Lampa.Controller.toggle("content");
    };
    this.render = function(){ return exp.render(); };
    this.back = function(){ Lampa.Activity.backward(); };
    this.pause = function(){};
    this.stop = function(){};
    this.destroy = function(){
      net.clear();
      this.clearImages();
      exp.destroy();
      scroll.destroy();
      clearInterval(balTimer);
      clearTimeout(lifeTimer);
      clearTimeout(hubTimer);
      if(hubConn){ hubConn.stop(); hubConn = null; }
    };
  }
  function startPlugin(){
    window.lampac_plugin = true;
    var manifst = {
      type: "video",
      version: "2",
      name: "4m1K",
      description: "Плагин для просмотра онлайн сериалов и фильмов",
      component: "lampac",
      onContextMenu: function(obj){ return { name: Lampa.Lang.translate("lampac_watch"), description: "Плагин для просмотра онлайн сериалов и фильмов" }; },
      onContextLauch: function(obj){
        resetTemplates();
        Lampa.Component.add("lampac", component);
        var id = Lampa.Utils.hash(obj.number_of_seasons ? obj.original_name : obj.original_title);
        var all = Lampa.Storage.get("clarification_search", "{}");
        Lampa.Activity.push({
          url: "",
          title: Lampa.Lang.translate("title_online"),
          component: "lampac",
          search: all[id] ? all[id] : obj.title,
          search_one: obj.title,
          search_two: obj.original_title,
          movie: obj,
          page: 1,
          clarification: all[id] ? true : false
        });
      }
    };
    Lampa.Manifest.plugins = manifst;
    Lampa.Lang.add({
      lampac_watch: { ru: "Онлайн", en: "Online", uk: "Онлайн", zh: "在线观看" },
      lampac_video: { ru: "Видео", en: "Video", uk: "Відео", zh: "视频" },
      lampac_no_watch_history: { ru: "Нет истории просмотра", en: "No browsing history", ua: "Немає історії перегляду", zh: "没有浏览历史" },
      lampac_nolink: { ru: "Не удалось извлечь ссылку", uk: "Неможливо отримати посилання", en: "Failed to fetch link", zh: "获取链接失败" },
      lampac_balanser: { ru: "Источник", uk: "Джерело", en: "Source", zh: "来源" },
      helper_online_file: { ru: "Удерживайте клавишу \"ОК\" для вызова контекстного меню", uk: "Утримуйте клавішу \"ОК\" для виклику контекстного меню", en: "Hold the \"OK\" key to bring up the context menu", zh: "按住“确定”键调出上下文菜单" },
      title_online: { ru: "Онлайн", uk: "Онлайн", en: "Online", zh: "在线" },
      lampac_voice_subscribe: { ru: "Подписаться на перевод", uk: "Підписатися на переклад", en: "Subscribe to translation", zh: "订阅翻译" },
      lampac_voice_success: { ru: "Вы успешно подписались", uk: "Ви успішно підписалися", en: "You have successfully subscribed", zh: "您已成功订阅" },
      lampac_voice_error: { ru: "Возникла ошибка", uk: "Виникла помилка", en: "An error has occurred", zh: "发生了错误" },
      lampac_clear_all_marks: { ru: "Очистить все метки", uk: "Очистити всі мітки", en: "Clear all labels", zh: "清除所有标签" },
      lampac_clear_all_timecodes: { ru: "Очистить все тайм-коды", uk: "Очистити всі тайм-коды", en: "Clear all timecodes", zh: "清除所有时间代码" },
      lampac_change_balanser: { ru: "Изменить балансер", uk: "Змінити балансер", en: "Change balancer", zh: "更改平衡器" },
      lampac_balanser_dont_work: { ru: "Поиск на ({balanser}) не дал результатов", uk: "Пошук на ({balanser}) не дав результатів", en: "Search on ({balanser}) did not return any results", zh: "搜索 ({balanser}) 未返回任何结果" },
      lampac_balanser_timeout: { ru: "Источник будет переключен автоматически через <span class=\"timeout\">10</span> секунд.", uk: "Джерело буде автоматично переключено через <span class=\"timeout\">10</span> секунд.", en: "The source will be switched automatically after <span class=\"timeout\">10</span> seconds.", zh: "平衡器将在<span class=\"timeout\">10</span>秒内自动切换。" },
      lampac_does_not_answer_text: { ru: "Поиск на ({balanser}) не дал результатов", uk: "Пошук на ({balanser}) не дав результатів", en: "Search on ({balanser}) did not return any results", zh: "搜索 ({balanser}) 未返回任何结果" }
    });
    Lampa.Template.add("lampac_css", "\n<style>\n/* CSS стили для компонентов */\n.online-prestige{position:relative;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:flex}\n/* ... дополнительные стили ... */\n</style>\n");
    $("body").append(Lampa.Template.get("lampac_css", {}, true));
    function resetTemplates(){
      Lampa.Template.add("lampac_prestige_full", "<div class=\"online-prestige online-prestige--full selector\"><div class=\"online-prestige__img\"><img alt=\"\"><div class=\"online-prestige__loader\"></div></div><div class=\"online-prestige__body\"><div class=\"online-prestige__head\"><div class=\"online-prestige__title\">{title}</div><div class=\"online-prestige__time\">{time}</div></div><div class=\"online-prestige__timeline\"></div><div class=\"online-prestige__footer\"><div class=\"online-prestige__info\">{info}</div><div class=\"online-prestige__quality\">{quality}</div></div></div></div>");
      Lampa.Template.add("lampac_content_loading", "<div class=\"online-empty\"><div class=\"broadcast__scan\"><div></div></div><div class=\"online-empty__templates\"><div class=\"online-empty-template selector\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div><div class=\"online-empty-template\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div><div class=\"online-empty-template\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div></div></div>");
      Lampa.Template.add("lampac_does_not_answer", "<div class=\"online-empty\"><div class=\"online-empty__title\">#{lampac_balanser_dont_work}</div><div class=\"online-empty__time\">#{lampac_balanser_timeout}</div><div class=\"online-empty__buttons\"><div class=\"online-empty__button selector cancel\">#{cancel}</div><div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div></div><div class=\"online-empty__templates\"><div class=\"online-empty-template\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div><div class=\"online-empty-template\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div><div class=\"online-empty-template\"><div class=\"online-empty-template__ico\"></div><div class=\"online-empty-template__body\"></div></div></div>");
      Lampa.Template.add("lampac_prestige_rate", "<div class=\"online-prestige-rate\"><svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path></svg><span>{rate}</span></div>");
      Lampa.Template.add("lampac_prestige_folder", "<div class=\"online-prestige online-prestige--folder selector\"><div class=\"online-prestige__folder\"><svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect><path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path><rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect></svg></div><div class=\"online-prestige__body\"><div class=\"online-prestige__head\"><div class=\"online-prestige__title\">{title}</div><div class=\"online-prestige__time\">{time}</div></div><div class=\"online-prestige__footer\"><div class=\"online-prestige__info\">{info}</div></div></div></div>");
      Lampa.Template.add("lampac_prestige_watched", "<div class=\"online-prestige online-prestige-watched selector\"><div class=\"online-prestige-watched__icon\"><svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/><path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/></svg></div><div class=\"online-prestige-watched__body\"></div></div>");
    }
    // Добавляем кнопку старта с зашифрованным адресом (при необходимости)
    var btnCode = "<div class=\"full-start__button selector view--online4 4m1K--button\" data-subtitle=\"" + manifst.name + " " + manifst.version + "\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 392.697 392.697\"><path d=\"M21.837,83.419l36.496,16.678L227.72,19.886c1.229-0.592,2.002-1.846,1.98-3.209c-0.021-1.365-0.834-2.592-2.082-3.145L197.766,0.3c-0.903-0.4-1.933-0.4-2.837,0L21.873,77.036c-1.259,0.559-2.073,1.803-2.081,3.18C19.784,81.593,20.584,82.847,21.837,83.419z\" fill=\"currentColor\"></path><path d=\"M185.689,177.261l-64.988-30.01v91.617c0,0.856-0.44,1.655-1.167,2.114c-0.406,0.257-0.869,0.386-1.333,0.386c-0.368,0-0.736-0.082-1.079-0.244l-68.874-32.625c-0.869-0.416-1.421-1.293-1.421-2.256v-92.229L6.804,95.5c-1.083-0.496-2.344-0.406-3.347,0.238c-1.002,0.645-1.608,1.754-1.608,2.944v208.744c0,1.371,0.799,2.615,2.045,3.185l178.886,81.768c0.464,0.211,0.96,0.315,1.455,0.315c0.661,0,1.318-0.188,1.892-0.555c1.002-0.645,1.608-1.754,1.608-2.945V180.445C187.735,179.076,186.936,177.831,185.689,177.261z\" fill=\"currentColor\"></path><path d=\"M389.24,95.74c-1.002-0.644-2.264-0.732-3.347-0.238l-178.876,81.76c-1.246,0.57-2.045,1.814-2.045,3.185v208.751c0,1.191,0.606,2.302,1.608,2.945c0.572,0.367,1.23,0.555,1.892,0.555c0.495,0,0.991-0.104,1.455-0.315l178.876-81.768c1.246-0.568,2.045-1.813,2.045-3.185V98.685C390.849,97.494,390.242,96.384,389.24,95.74z\" fill=\"currentColor\"></path><path d=\"M372.915,80.216c-0.009-1.377-0.823-2.621-2.082-3.18l-60.182-26.681c-0.938-0.418-2.013-0.399-2.938,0.045l-173.755,82.992l60.933,29.117c0.462,0.211,0.958,0.316,1.455,0.316s0.993-0.105,1.455-0.316l173.066-79.092C372.122,82.847,372.923,81.593,372.915,80.216z\" fill=\"currentColor\"></path></svg><span>#{title_online}</span></div>";
    Lampa.Component.add("lampac", component);
    resetTemplates();
    function addButton(e){
      if(e.render.find(".4m1K--button").length) return;
      var btn = $(Lampa.Lang.translate(btnCode));
      btn.on("hover:enter", function(){
        resetTemplates();
        Lampa.Component.add("lampac", component);
        var id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
        var all = Lampa.Storage.get("clarification_search", "{}");
        Lampa.Activity.push({
          url: "",
          title: Lampa.Lang.translate("title_online"),
          component: "lampac",
          search: all[id] ? all[id] : e.movie.title,
          search_one: e.movie.title,
          search_two: e.movie.original_title,
          movie: e.movie,
          page: 1,
          clarification: all[id] ? true : false
        });
      });
      e.render.before(btn);
    }
    Lampa.Listener.follow("full", function(e){
      if(e.type === "complite"){
        setTimeout(function(){
          $(".view--online4", Lampa.Activity.active().activity.render()).empty().append('<svg id="Icons" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g><path fill="currentColor" d="M16,0C7.163,0,0,7.163,0,16s7.163,16,16,16s16-7.163,16-16S24.837,0,16,0z M16,30C8.268,30,2,23.732,2,16S8.268,2,16,2 s14,6.268,14,14S23.732,30,16,30z"/><polygon fill="currentColor" points="14,10 14,22 22,16"/></g></svg>&nbsp&nbsp4m1K');
        }, 5);
        if(Lampa.Storage.get("card_interfice_type") === "new"){
          addButton({ render: e.object.activity.render().find(".button--play"), movie: e.data.movie });
        } else {
          addButton({ render: e.object.activity.render().find(".view--torrent"), movie: e.data.movie });
        }
      }
    });
    try {
      if(Lampa.Activity.active().component === "full"){
        addButton({ render: Lampa.Activity.active().activity.render().find(".view--torrent"), movie: Lampa.Activity.active().card });
      }
    } catch(e){}
    if(Lampa.Manifest.app_digital >= 177){
      var bs = ["filmix","filmixtv","fxapi","rezka","rhsprem","lumex","videodb","collaps","hdvb","zetflix","kodik","ashdi","kinoukr","kinotochka","remux","iframevideo","cdnmovies","anilibria","animedia","animego","animevost","animebesst","redheadsound","alloha","animelib","moonanime","kinopub","vibix","vdbmovies","fancdn","cdnvideohub","vokino","rc/filmix","rc/fxapi","rc/kinopub","rc/rhs","vcdn"];
      bs.forEach(function(n){ Lampa.Storage.sync("online_choice_" + n, "object_object"); });
      Lampa.Storage.sync("online_watched_last", "object_object");
    }
  }
  if(!window.lampac_plugin) startPlugin();
})();
