
(function () {
  'use strict';

  Lampa.Platform.tv();

  var v1 = "http://88.218.62.180:9118";
  var v2 = {
    api: "lampac",
    localhost: v1 + "/",
    apn: ""
  };
  var v3 = ["leproduction", "fxapi", "mirage", "vidsrc", "movpi", "rezka", "kinogo", "videoseed", "kinopub", "spectre", "uafilm", "kinoflix", "smashystream", "videasy", "vidlink", "geosaitebi"];
  function fn1(v8) {
    var v9 = v8;
    if (v8 && typeof v8 === "object") {
      v9 = v8.balanser || (v8.name ? String(v8.name).split(" ")[0] : "");
    }
    return String(v9 || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  }
  function fn2(v10) {
    var v11 = fn1(v10);
    if (!v11) {
      return false;
    }
    return v3.some(function (v12) {
      return v11 === v12 || v11.indexOf(v12 + "-") === 0 || v11.indexOf(v12 + "_") === 0 || v11.indexOf("lme" + v12) === 0 || v11.indexOf(v12) === 0;
    });
  }
  function fn3(v13) {
    if (!v13 || typeof v13.filter !== "function") {
      return v13;
    }
    return v13.filter(function (v14) {
      return !fn2(v14);
    });
  }
  var v4;
  var v5 = Lampa.Storage.get("lampac_unic_id", "");
  if (!v5) {
    v5 = Lampa.Utils.uid(8).toLowerCase();
    Lampa.Storage.set("lampac_unic_id", v5);
  }
  function fn4() {
    if (Lampa.Platform.is("android")) {
      try {
        var v15 = AndroidJS.appVersion().split("-");
        return parseInt(v15.pop());
      } catch (v16) {
        return 0;
      }
    } else {
      return 0;
    }
  }
  var v6 = v1.replace("http://", "").replace("https://", "");
  if (!window.rch_nws || !window.rch_nws[v6]) {
    if (!window.rch_nws) {
      window.rch_nws = {};
    }
    window.rch_nws[v6] = {
      type: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : undefined,
      startTypeInvoke: false,
      rchRegistry: false,
      apkVersion: fn4()
    };
  }
  window.rch_nws[v6].typeInvoke = function fn13(v17, v18) {
    if (!window.rch_nws[v6].startTypeInvoke) {
      window.rch_nws[v6].startTypeInvoke = true;
      var fn14 = function fn15(v20) {
        window.rch_nws[v6].type = Lampa.Platform.is("android") ? "apk" : v20 ? "cors" : "web";
        v18();
      };
      if (Lampa.Platform.is("android") || Lampa.Platform.is("tizen")) {
        fn14(true);
      } else {
        var v19 = new Lampa.Reguest();
        v19.silent(v1.indexOf(location.host) >= 0 ? "https://github.com/" : v17 + "/cors/check", function () {
          fn14(true);
        }, function () {
          fn14(false);
        }, false, {
          dataType: "text"
        });
      }
    } else {
      v18();
    }
  };
  window.rch_nws[v6].Registry = function fn16(v21, v22) {
    window.rch_nws[v6].typeInvoke(v1, function () {
      v21.invoke("RchRegistry", {
        host: location.host,
        rchtype: Lampa.Platform.is("android") ? "apk" : Lampa.Platform.is("tizen") ? "cors" : window.rch_nws[v6].type || "web",
        apkVersion: Lampa.Platform.is("android") ? window.rch_nws[v6].apkVersion || 0 : 0,
        player: Lampa.Storage.field("player")
      });
      if (window.rch_nws[v6].rchRegistry) {
        return;
      }
      window.rch_nws[v6].rchRegistry = true;
      var v23 = false;
      v21.on("RchRegistry", function (v24, v25, v26) {
        if (v22 && !v23) {
          v23 = true;
          v22();
        }
      });
      v21.on("RchClient", function (v27, v28, v29, v30, v31) {
        var v32 = new Lampa.Reguest();
        function fn17(v33, v34) {
          $.ajax({
            url: v1 + "/rch/" + v33 + "?id=" + v27,
            type: "POST",
            data: v34,
            async: true,
            cache: false,
            contentType: false,
            processData: false,
            success: function (v35) {},
            error: function () {
              v21.invoke("RchResult", v27, "");
            }
          });
        }
        function fn18(v36) {
          if (Lampa.Arrays.isObject(v36) || Lampa.Arrays.isArray(v36)) {
            v36 = JSON.stringify(v36);
          }
          if (typeof CompressionStream !== "undefined" && v36 && v36.length > 1000) {
            var v37 = new CompressionStream("gzip");
            var v38 = new TextEncoder();
            var v39 = new ReadableStream({
              start: function (v41) {
                v41.enqueue(v38.encode(v36));
                v41.close();
              }
            });
            var v40 = v39.pipeThrough(v37);
            new Response(v40).arrayBuffer().then(function (v42) {
              var v43 = new Uint8Array(v42);
              if (v43.length > v36.length) {
                fn17("result", v36);
              } else {
                fn17("gzresult", v43);
              }
            }).catch(function () {
              fn17("result", v36);
            });
          } else {
            fn17("result", v36);
          }
        }
        if (v28 == "eval") {
          console.log("RCH", v28, v29);
          fn18(eval(v29));
        } else if (v28 == "evalrun") {
          console.log("RCH", v28, v29);
          eval(v29);
        } else if (v28 == "ping") {
          fn18("pong");
        } else {
          console.log("RCH", v28);
          v32.native(v28, fn18, function (v44) {
            console.log("RCH", "result empty, " + v44.status);
            fn18("");
          }, v29, {
            dataType: "text",
            timeout: 8000,
            headers: v30,
            returnHeaders: v31
          });
        }
      });
      v21.on("Connected", function (v45) {
        console.log("RCH", "ConnectionId: " + v45);
        window.rch_nws[v6].connectionId = v45;
      });
      v21.on("Closed", function () {
        console.log("RCH", "Connection closed");
      });
      v21.on("Error", function (v46) {
        console.log("RCH", "error:", v46);
      });
    });
  };
  window.rch_nws[v6].typeInvoke(v1, function () {});
  function fn5(v47, v48) {
    if (!window.nwsClient) {
      window.nwsClient = {};
    }
    var v49 = window.nwsClient[v6];
    if (v49 && v49.connectionId != null) {
      v48();
    } else if (v49) {
      console.log("RCH", "Reconnecting...");
      v49.reconnect(function () {
        v48();
      });
    } else {
      window.nwsClient[v6] = new NativeWsClient(v47.nws, {
        autoReconnect: true
      });
      window.nwsClient[v6].on("Connected", function (v50) {
        window.rch_nws[v6].Registry(window.nwsClient[v6], function () {
          v48();
        });
      });
      window.nwsClient[v6].connect();
    }
  }
  function fn6(v51, v52) {
    if (typeof NativeWsClient == "undefined") {
      Lampa.Utils.putScript([v1 + "/js/nws-client-es5.js?v21042026"], function () {}, false, function () {
        fn5(v51, v52);
      }, true);
    } else {
      fn5(v51, v52);
    }
  }
  function fn7(v53) {
    v53 = v53 + "";
    if (v53.indexOf("account_email=") == -1) {
      var v54 = Lampa.Storage.get("account_email");
      if (v54) {
        v53 = Lampa.Utils.addUrlComponent(v53, "account_email=" + encodeURIComponent(v54));
      }
    }
    if (v53.indexOf("uid=") == -1) {
      var v55 = Lampa.Storage.get("lampac_unic_id", "");
      if (v55) {
        v53 = Lampa.Utils.addUrlComponent(v53, "uid=" + encodeURIComponent(v55));
      }
    }
    if (v53.indexOf("token=") == -1) {
      var v56 = "";
      if (v56 != "") {
        v53 = Lampa.Utils.addUrlComponent(v53, "token=");
      }
    }
    if (v53.indexOf("nws_id=") == -1) {
      var v57 = Lampa.Storage.get("lampac_nws_id", "");
      if (v57) {
        v53 = Lampa.Utils.addUrlComponent(v53, "nws_id=" + encodeURIComponent(v57));
      }
    }
    return v53;
  }
  function fn8() {
    var v58 = Lampa.Storage.get("kit_aesgcmkey", "");
    if (v58) {
      return {
        "X-Kit-AesGcm": Lampa.Storage.get("kit_aesgcmkey", "")
      };
    }
    return {};
  }
  function fn9(v59) {
    return (v59 < 10 ? "0" : "") + v59;
  }
  var v7 = Lampa.Reguest;
  function fn10(v60) {
    var v61 = new v7();
    var v62 = new Lampa.Scroll({
      mask: true,
      over: true
    });
    var v63 = new Lampa.Explorer(v60);
    var v64 = new Lampa.Filter(v60);
    var v65 = {};
    var v66;
    var v67;
    var v68;
    var v69;
    var v70;
    var v71 = [];
    var v72 = 0;
    var v73;
    var v74 = 0;
    var v75;
    var v76 = {};
    var v77 = {
      season: Lampa.Lang.translate("torrent_serial_season"),
      voice: Lampa.Lang.translate("torrent_parser_voice"),
      source: Lampa.Lang.translate("settings_rest_source")
    };
    var v78 = {
      season: [],
      voice: []
    };
    if (v4 == undefined) {
      v61.timeout(10000);
      v61.silent(fn7(v1 + "/lite/withsearch"), function (v79) {
        v4 = fn3(v79);
      }, function () {
        v4 = [];
      });
    }
    function fn19(v80) {
      var v81 = v80.balanser;
      var v82 = v80.name.split(" ")[0];
      return (v81 || v82).toLowerCase();
    }
    function fn20(v83) {
      var v84 = Lampa.Utils.hash(v60.movie.number_of_seasons ? v60.movie.original_name : v60.movie.original_title);
      var v85 = Lampa.Storage.get("clarification_search", "{}");
      v85[v84] = v83;
      Lampa.Storage.set("clarification_search", v85);
    }
    function fn21() {
      var v86 = Lampa.Utils.hash(v60.movie.number_of_seasons ? v60.movie.original_name : v60.movie.original_title);
      var v87 = Lampa.Storage.get("clarification_search", "{}");
      delete v87[v86];
      Lampa.Storage.set("clarification_search", v87);
    }
    function fn22() {
      var v88 = Lampa.Utils.hash(v60.movie.number_of_seasons ? v60.movie.original_name : v60.movie.original_title);
      var v89 = Lampa.Storage.get("clarification_search", "{}");
      return v89[v88];
    }
    this.initialize = function () {
      var v90 = this;
      this.loading(true);
      v64.onSearch = function (v91) {
        fn20(v91);
        Lampa.Activity.replace({
          search: v91,
          clarification: true,
          similar: true
        });
      };
      v64.onBack = function () {
        v90.start();
      };
      v64.render().find(".selector").on("hover:enter", function () {
        clearInterval(v70);
      });
      v64.render().find(".filter--search").appendTo(v64.render().find(".torrent-filter"));
      v64.onSelect = function (v92, v93, v94) {
        if (v92 == "filter") {
          if (v93.reset) {
            fn21();
            v90.replaceChoice({
              season: 0,
              voice: 0,
              voice_url: "",
              voice_name: ""
            });
            setTimeout(function () {
              Lampa.Select.close();
              Lampa.Activity.replace({
                clarification: 0,
                similar: 0
              });
            }, 10);
          } else {
            var v95 = v78[v93.stype][v94.index].url;
            var v96 = v90.getChoice();
            if (v93.stype == "voice") {
              v96.voice_name = v78.voice[v94.index].title;
              v96.voice_url = v95;
            }
            v96[v93.stype] = v94.index;
            v90.saveChoice(v96);
            v90.reset();
            v90.request(v95);
            setTimeout(Lampa.Select.close, 10);
          }
        } else if (v92 == "sort") {
          Lampa.Select.close();
          v60.lampac_custom_select = v93.source;
          v90.changeBalanser(v93.source);
        }
      };
      if (v64.addButtonBack) {
        v64.addButtonBack();
      }
      v64.render().find(".filter--sort span").text(Lampa.Lang.translate("lampac_balanser"));
      v62.body().addClass("torrent-list");
      v63.appendFiles(v62.render());
      v63.appendHead(v64.render());
      v62.minus(v63.render().find(".explorer__files-head"));
      v62.body().append(Lampa.Template.get("lampac_content_loading"));
      Lampa.Controller.enable("content");
      this.loading(false);
      if (v60.balanser) {
        v63.render().find(".filter--search").remove();
        v65 = {};
        v65[v60.balanser] = {
          name: v60.balanser
        };
        v68 = v60.balanser;
        v76 = [];
        return v61.native(fn7(v60.url.replace("rjson=", "nojson=")), this.parse.bind(this), function () {
          v63.render().find(".torrent-filter").remove();
          v90.empty();
        }, false, {
          dataType: "text",
          headers: fn8()
        });
      }
      this.externalids().then(function () {
        return v90.createSource();
      }).then(function (v97) {
        if (!v4.find(function (v98) {
          return v68.slice(0, v98.length) == v98;
        })) {
          v64.render().find(".filter--search").addClass("hide");
        }
        v90.search();
      }).catch(function (v99) {
        v90.noConnectToServer(v99);
      });
    };
    this.rch = function (v100, v101) {
      var v102 = this;
      fn6(v100, function () {
        if (!v101) {
          v102.find();
        } else {
          v101();
        }
      });
    };
    this.externalids = function () {
      return new Promise(function (v103, v104) {
        if (!v60.movie.imdb_id || !v60.movie.kinopoisk_id) {
          var v105 = [];
          v105.push("id=" + encodeURIComponent(v60.movie.id));
          v105.push("serial=" + (v60.movie.name ? 1 : 0));
          if (v60.movie.imdb_id) {
            v105.push("imdb_id=" + (v60.movie.imdb_id || ""));
          }
          if (v60.movie.kinopoisk_id) {
            v105.push("kinopoisk_id=" + (v60.movie.kinopoisk_id || ""));
          }
          var v106 = v2.localhost + "externalids?" + v105.join("&");
          v61.timeout(10000);
          v61.silent(fn7(v106), function (v107) {
            for (var v108 in v107) {
              v60.movie[v108] = v107[v108];
            }
            v103();
          }, function () {
            v103();
          }, false, {
            headers: fn8()
          });
        } else {
          v103();
        }
      });
    };
    this.updateBalanser = function (v109) {
      var v110 = Lampa.Storage.cache("online_last_balanser", 3000, {});
      v110[v60.movie.id] = v109;
      Lampa.Storage.set("online_last_balanser", v110);
    };
    this.changeBalanser = function (v111) {
      this.updateBalanser(v111);
      Lampa.Storage.set("online_balanser", v111);
      var v112 = this.getChoice(v111);
      var v113 = this.getChoice();
      if (v113.voice_name) {
        v112.voice_name = v113.voice_name;
      }
      this.saveChoice(v112, v111);
      Lampa.Activity.replace();
    };
    this.requestParams = function (v114) {
      var v115 = [];
      var v116 = v60.movie.source || "tmdb";
      v115.push("id=" + encodeURIComponent(v60.movie.id));
      if (v60.movie.imdb_id) {
        v115.push("imdb_id=" + (v60.movie.imdb_id || ""));
      }
      if (v60.movie.kinopoisk_id) {
        v115.push("kinopoisk_id=" + (v60.movie.kinopoisk_id || ""));
      }
      if (v60.movie.tmdb_id) {
        v115.push("tmdb_id=" + (v60.movie.tmdb_id || ""));
      }
      if (v60.movie.keywords && v60.movie.keywords.results) {
        for (var v117 = 0, v118 = v60.movie.keywords.results; v117 < v118.length; v117++) {
          if (v118[v117].name == "anime") {
            v115.push("anime=1");
            break;
          }
        }
      }
      v115.push("title=" + encodeURIComponent(v60.clarification ? v60.search : v60.movie.title || v60.movie.name));
      v115.push("original_title=" + encodeURIComponent(v60.movie.original_title || v60.movie.original_name));
      v115.push("serial=" + (v60.movie.name ? 1 : 0));
      v115.push("original_language=" + (v60.movie.original_language || ""));
      v115.push("year=" + ((v60.movie.release_date || v60.movie.first_air_date || "0000") + "").slice(0, 4));
      v115.push("source=" + v116);
      v115.push("clarification=" + (v60.clarification ? 1 : 0));
      v115.push("similar=" + (v60.similar ? true : false));
      v115.push("rchtype=" + ((window.rch_nws && window.rch_nws[v6] ? window.rch_nws[v6].type : window.rch && window.rch[v6] ? window.rch[v6].type : "") || ""));
      if (Lampa.Storage.get("account_email", "")) {
        v115.push("cub_id=" + Lampa.Utils.hash(Lampa.Storage.get("account_email", "")));
      }
      return v114 + (v114.indexOf("?") >= 0 ? "&" : "?") + v115.join("&");
    };
    this.getLastChoiceBalanser = function () {
      var v119 = Lampa.Storage.cache("online_last_balanser", 3000, {});
      if (v119[v60.movie.id]) {
        return v119[v60.movie.id];
      } else {
        return Lampa.Storage.get("online_balanser", v76.length ? v76[0] : "");
      }
    };
    this.startSource = function (v120) {
      return new Promise(function (v121, v122) {
        fn3(v120).forEach(function (v124) {
          var v125 = fn19(v124);
          if (fn2(v125)) {
            return;
          }
          v65[v125] = {
            url: v124.url,
            name: v124.name,
            show: typeof v124.show == "undefined" ? true : v124.show
          };
        });
        v76 = Lampa.Arrays.getKeys(v65);
        if (v76.length) {
          var v123 = Lampa.Storage.cache("online_last_balanser", 3000, {});
          if (v123[v60.movie.id]) {
            v68 = v123[v60.movie.id];
          } else {
            v68 = Lampa.Storage.get("online_balanser", v76[0]);
          }
          if (!v65[v68]) {
            v68 = v76[0];
          }
          if (!v65[v68].show && !v60.lampac_custom_select) {
            v68 = v76[0];
          }
          v67 = v65[v68].url;
          Lampa.Storage.set("active_balanser", v68);
          v121(v120);
        } else {
          v122();
        }
      });
    };
    this.lifeSource = function () {
      var v126 = this;
      return new Promise(function (v127, v128) {
        var v129 = v126.requestParams(v2.localhost + "lifeevents?memkey=" + (v126.memkey || ""));
        var v130 = false;
        var fn23 = function fn25(v131, v132) {
          if (v131.accsdb) {
            return v128(v131);
          }
          var v133 = v126.getLastChoiceBalanser();
          var v134 = fn3(v131.online || []);
          if (!v130) {
            var v135 = v134.filter(function (v136) {
              if (v132) {
                return v136.show;
              } else {
                return v136.show && v136.name.toLowerCase() == v133;
              }
            });
            if (v135.length) {
              v130 = true;
              v127(v134.filter(function (v137) {
                return v137.show;
              }));
            } else if (v132) {
              v128();
            }
          }
        };
        var fn24 = function fn26(v138) {
          v61.timeout(3000);
          v61.silent(fn7(v129), function (v139) {
            v74++;
            v76 = [];
            v65 = {};
            fn3(v139.online || []).forEach(function (v141) {
              var v142 = fn19(v141);
              if (fn2(v142)) {
                return;
              }
              v65[v142] = {
                url: v141.url,
                name: v141.name,
                show: typeof v141.show == "undefined" ? true : v141.show
              };
            });
            v76 = Lampa.Arrays.getKeys(v65);
            v64.set("sort", v76.map(function (v143) {
              return {
                title: v65[v143].name,
                source: v143,
                selected: v143 == v68,
                ghost: !v65[v143].show
              };
            }));
            v64.chosen("sort", [v65[v68] ? v65[v68].name : v68]);
            fn23(v139);
            var v140 = v126.getLastChoiceBalanser();
            if (v74 > 15 || v139.ready) {
              v64.render().find(".lampac-balanser-loader").remove();
              fn23(v139, true);
            } else if (!v130 && v65[v140] && v65[v140].show) {
              fn23(v139, true);
              v75 = setTimeout(fn26, 1000);
            } else {
              v75 = setTimeout(fn26, 1000);
            }
          }, function () {
            v74++;
            if (v74 > 15) {
              v128();
            } else {
              v75 = setTimeout(fn26, 1000);
            }
          }, false, {
            headers: fn8()
          });
        };
        fn24();
      });
    };
    this.createSource = function () {
      var v144 = this;
      return new Promise(function (v145, v146) {
        var v147 = v144.requestParams(v2.localhost + "lite/events?life=true");
        v61.timeout(15000);
        v61.silent(fn7(v147), function (v148) {
          if (v148.accsdb) {
            return v146(v148);
          }
          if (v148.life) {
            v144.memkey = v148.memkey;
            if (v148.title) {
              if (v60.movie.name) {
                v60.movie.name = v148.title;
              }
              if (v60.movie.title) {
                v60.movie.title = v148.title;
              }
            }
            v64.render().find(".filter--sort").append("<span class=\"lampac-balanser-loader\" style=\"width: 1.2em; height: 1.2em; margin-top: 0; background: url(./img/loader.svg) no-repeat 50% 50%; background-size: contain; margin-left: 0.5em\"></span>");
            v144.lifeSource().then(v144.startSource).then(v145).catch(v146);
          } else {
            v144.startSource(v148).then(v145).catch(v146);
          }
        }, v146, false, {
          headers: fn8()
        });
      });
    };
    this.create = function () {
      return this.render();
    };
    this.search = function () {
      this.filter({
        source: v76
      }, this.getChoice());
      this.find();
    };
    this.find = function () {
      this.request(this.requestParams(v67));
    };
    this.request = function (v149) {
      v72++;
      if (v72 < 10) {
        v61.native(fn7(v149), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
          dataType: "text",
          headers: fn8()
        });
        clearTimeout(v73);
        v73 = setTimeout(function () {
          v72 = 0;
        }, 4000);
      } else {
        this.empty();
      }
    };
    this.parseJsonDate = function (v150, v151) {
      try {
        var v152 = $("<div>" + v150 + "</div>");
        var v153 = [];
        v152.find(v151).each(function () {
          var v154 = $(this);
          var v155 = JSON.parse(v154.attr("data-json"));
          var v156 = v154.attr("s");
          var v157 = v154.attr("e");
          var v158 = v154.text();
          if (!v60.movie.name) {
            if (v158.match(/\d+p/i)) {
              if (!v155.quality) {
                v155.quality = {};
                v155.quality[v158] = v155.url;
              }
              v158 = v60.movie.title;
            }
            if (v158 == "По умолчанию") {
              v158 = v60.movie.title;
            }
          }
          if (v157) {
            v155.episode = parseInt(v157);
          }
          if (v156) {
            v155.season = parseInt(v156);
          }
          if (v158) {
            v155.text = v158;
          }
          v155.active = v154.hasClass("active");
          v153.push(v155);
        });
        return v153;
      } catch (v159) {
        return [];
      }
    };
    this.getFileUrl = function (v160, v161, v162) {
      var v163 = this;
      if (Lampa.Storage.field("player") !== "inner" && v160.stream && Lampa.Platform.is("apple")) {
        var v164 = Lampa.Arrays.clone(v160);
        v164.method = "play";
        v164.url = v160.stream;
        v161(v164, {});
      } else if (v160.method == "play") {
        v161(v160, {});
      } else {
        Lampa.Loading.start(function () {
          Lampa.Loading.stop();
          Lampa.Controller.toggle("content");
          v61.clear();
        });
        v61.native(fn7(v160.url), function (v165) {
          if (v165.rch) {
            if (v162) {
              v162 = false;
              Lampa.Loading.stop();
              v161(false, {});
            } else {
              v163.rch(v165, function () {
                Lampa.Loading.stop();
                v163.getFileUrl(v160, v161, true);
              });
            }
          } else {
            Lampa.Loading.stop();
            v161(v165, v165);
          }
        }, function () {
          Lampa.Loading.stop();
          v161(false, {});
        }, false, {
          headers: fn8()
        });
      }
    };
    this.toPlayElement = function (v166) {
      var v167 = {
        title: v166.title,
        url: v166.url,
        quality: v166.qualitys,
        timeline: v166.timeline,
        subtitles: v166.subtitles,
        segments: v166.segments,
        callback: v166.mark,
        season: v166.season,
        episode: v166.episode,
        voice_name: v166.voice_name,
        thumbnail: v166.thumbnail
      };
      return v167;
    };
    this.orUrlReserve = function (v168) {
      if (v168.url && typeof v168.url == "string" && v168.url.indexOf(" or ") !== -1) {
        var v169 = v168.url.split(" or ");
        v168.url = v169[0];
        v168.url_reserve = v169[1];
      }
    };
    this.setDefaultQuality = function (v170) {
      if (Lampa.Arrays.getKeys(v170.quality).length) {
        for (var v171 in v170.quality) {
          if (parseInt(v171) == Lampa.Storage.field("video_quality_default")) {
            v170.url = v170.quality[v171];
            this.orUrlReserve(v170);
          }
          if (v170.quality[v171].indexOf(" or ") !== -1) {
            v170.quality[v171] = v170.quality[v171].split(" or ")[0];
          }
        }
      }
    };
    this.display = function (v172) {
      var v173 = this;
      this.draw(v172, {
        onEnter: function fn27(v174, v175) {
          v173.getFileUrl(v174, function (v176, v177) {
            if (v176 && v176.url) {
              var v178 = [];
              var v179 = v173.toPlayElement(v174);
              v179.url = v176.url;
              v179.headers = v177.headers || v176.headers;
              v179.quality = v177.quality || v174.qualitys;
              v179.segments = v177.segments || v174.segments;
              v179.hls_manifest_timeout = v177.hls_manifest_timeout || v176.hls_manifest_timeout;
              v179.subtitles = v176.subtitles;
              v179.subtitles_call = v177.subtitles_call || v176.subtitles_call;
              if (v176.vast && v176.vast.url) {
                v179.vast_url = v176.vast.url;
                v179.vast_msg = v176.vast.msg;
                v179.vast_region = v176.vast.region;
                v179.vast_platform = v176.vast.platform;
                v179.vast_screen = v176.vast.screen;
              }
              v173.orUrlReserve(v179);
              v173.setDefaultQuality(v179);
              if (v174.season) {
                v172.forEach(function (v181) {
                  var v182 = v173.toPlayElement(v181);
                  if (v181 == v174) {
                    v182.url = v176.url;
                  } else if (v181.method == "call") {
                    if (Lampa.Storage.field("player") !== "inner") {
                      v182.url = v181.stream;
                      delete v182.quality;
                    } else {
                      v182.url = function (v183) {
                        v173.getFileUrl(v181, function (v184, v185) {
                          if (v184.url) {
                            v182.url = v184.url;
                            v182.quality = v185.quality || v181.qualitys;
                            v182.segments = v185.segments || v181.segments;
                            v182.subtitles = v184.subtitles;
                            v173.orUrlReserve(v182);
                            v173.setDefaultQuality(v182);
                            v181.mark();
                          } else {
                            v182.url = "";
                            Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
                          }
                          v183();
                        }, function () {
                          v182.url = "";
                          v183();
                        });
                      };
                    }
                  } else {
                    v182.url = v181.url;
                  }
                  v173.orUrlReserve(v182);
                  v173.setDefaultQuality(v182);
                  v178.push(v182);
                });
              } else {
                v178.push(v179);
              }
              if (v178.length > 1) {
                v179.playlist = v178;
              }
              if (v179.url) {
                var v180 = v179;
                v180.isonline = true;
                Lampa.Player.play(v180);
                Lampa.Player.playlist(v178);
                if (v180.subtitles_call) {
                  v173.loadSubtitles(v180.subtitles_call);
                }
                v174.mark();
                v173.updateBalanser(v68);
              } else {
                Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
              }
            } else {
              Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
            }
          }, true);
        },
        onContextMenu: function fn28(v186, v187, v188, v189) {
          v173.getFileUrl(v186, function (v190) {
            v189({
              file: v190.url,
              quality: v186.qualitys
            });
          }, true);
        }
      });
      this.filter({
        season: v78.season.map(function (v191) {
          return v191.title;
        }),
        voice: v78.voice.map(function (v192) {
          return v192.title;
        })
      }, this.getChoice());
    };
    this.loadSubtitles = function (v193) {
      v61.silent(fn7(v193), function (v194) {
        Lampa.Player.subtitles(v194);
      }, function () {}, false, {
        headers: fn8()
      });
    };
    this.parse = function (v195) {
      var v196 = Lampa.Arrays.decodeJson(v195, {});
      if (Lampa.Arrays.isObject(v195) && v195.rch) {
        v196 = v195;
      }
      if (v196.rch) {
        return this.rch(v196);
      }
      try {
        var v197 = this.parseJsonDate(v195, ".videos__item");
        var v198 = this.parseJsonDate(v195, ".videos__button");
        if (v197.length == 1 && v197[0].method == "link" && !v197[0].similar) {
          v78.season = v197.map(function (v208) {
            return {
              title: v208.text,
              url: v208.url
            };
          });
          this.replaceChoice({
            season: 0
          });
          this.request(v197[0].url);
        } else {
          this.activity.loader(false);
          var v199 = v197.filter(function (v209) {
            return v209.method == "play" || v209.method == "call";
          });
          var v200 = v197.filter(function (v210) {
            return v210.similar;
          });
          if (v199.length) {
            if (v198.length) {
              v78.voice = v198.map(function (v211) {
                return {
                  title: v211.text,
                  url: v211.url
                };
              });
              var v201 = this.getChoice(v68).voice_url;
              var v202 = this.getChoice(v68).voice_name;
              var v203 = v198.find(function (v212) {
                return v212.url == v201;
              });
              var v204 = v198.find(function (v213) {
                return v213.text == v202;
              });
              var v205 = v198.find(function (v214) {
                return v214.active;
              });
              if (v203 && !v203.active) {
                this.replaceChoice({
                  voice: v198.indexOf(v203),
                  voice_name: v203.text
                });
                this.request(v203.url);
              } else if (v204 && !v204.active) {
                this.replaceChoice({
                  voice: v198.indexOf(v204),
                  voice_name: v204.text
                });
                this.request(v204.url);
              } else {
                if (v205) {
                  this.replaceChoice({
                    voice: v198.indexOf(v205),
                    voice_name: v205.text
                  });
                }
                this.display(v199);
              }
            } else {
              this.replaceChoice({
                voice: 0,
                voice_url: "",
                voice_name: ""
              });
              this.display(v199);
            }
          } else if (v197.length) {
            if (v200.length) {
              this.similars(v200);
              this.activity.loader(false);
            } else {
              v78.season = v197.map(function (v215) {
                return {
                  title: v215.text,
                  url: v215.url
                };
              });
              var v206 = this.getChoice(v68).season;
              var v207 = v78.season[v206];
              if (!v207) {
                v207 = v78.season[0];
              }
              this.request(v207.url);
            }
          } else {
            this.doesNotAnswer(v196);
          }
        }
      } catch (v216) {
        this.doesNotAnswer(v216);
      }
    };
    this.similars = function (v217) {
      var v218 = this;
      v62.clear();
      v217.forEach(function (v219) {
        v219.title = v219.text;
        v219.info = "";
        var v220 = [];
        var v221 = ((v219.start_date || v219.year || v60.movie.release_date || v60.movie.first_air_date || "") + "").slice(0, 4);
        if (v221) {
          v220.push(v221);
        }
        if (v219.details) {
          v220.push(v219.details);
        }
        var v222 = v219.title || v219.text;
        v219.title = v222;
        v219.time = v219.time || "";
        v219.info = v220.join("<span class=\"online-prestige-split\">?</span>");
        var v223 = Lampa.Template.get("lampac_prestige_folder", v219);
        if (v219.img) {
          var v224 = $("<img style=\"height: 7em; width: 7em; border-radius: 0.3em;\"/>");
          v223.find(".online-prestige__folder").empty().append(v224);
          if (v219.img !== undefined) {
            if (v219.img.charAt(0) === "/") {
              v219.img = v2.localhost + v219.img.substring(1);
            }
            if (v219.img.indexOf("/proxyimg") !== -1) {
              v219.img = fn7(v219.img);
            }
          }
          Lampa.Utils.imgLoad(v224, v219.img);
        }
        v223.on("hover:enter", function () {
          v218.reset();
          v218.request(v219.url);
        }).on("hover:focus", function (v225) {
          v66 = v225.target;
          v62.update($(v225.target), true);
        });
        v62.append(v223);
      });
      this.filter({
        season: v78.season.map(function (v226) {
          return v226.title;
        }),
        voice: v78.voice.map(function (v227) {
          return v227.title;
        })
      }, this.getChoice());
      Lampa.Controller.enable("content");
    };
    this.getChoice = function (v228) {
      var v229 = Lampa.Storage.cache("online_choice_" + (v228 || v68), 3000, {});
      var v230 = v229[v60.movie.id] || {};
      Lampa.Arrays.extend(v230, {
        season: 0,
        voice: 0,
        voice_name: "",
        voice_id: 0,
        episodes_view: {},
        movie_view: ""
      });
      return v230;
    };
    this.saveChoice = function (v231, v232) {
      var v233 = Lampa.Storage.cache("online_choice_" + (v232 || v68), 3000, {});
      v233[v60.movie.id] = v231;
      Lampa.Storage.set("online_choice_" + (v232 || v68), v233);
      this.updateBalanser(v232 || v68);
    };
    this.replaceChoice = function (v234, v235) {
      var v236 = this.getChoice(v235);
      Lampa.Arrays.extend(v236, v234, true);
      this.saveChoice(v236, v235);
    };
    this.clearImages = function () {
      v71.forEach(function (v237) {
        v237.onerror = function () {};
        v237.onload = function () {};
        v237.src = "";
      });
      v71 = [];
    };
    this.reset = function () {
      v66 = false;
      clearInterval(v70);
      v61.clear();
      this.clearImages();
      v62.render().find(".empty").remove();
      v62.clear();
      v62.reset();
      v62.body().append(Lampa.Template.get("lampac_content_loading"));
    };
    this.loading = function (v238) {
      if (v238) {
        this.activity.loader(true);
      } else {
        this.activity.loader(false);
        this.activity.toggle();
      }
    };
    this.filter = function (v239, v240) {
      var v241 = this;
      var v242 = [];
      var fn29 = function fn30(v243, v244) {
        var v245 = v241.getChoice();
        var v246 = v239[v243];
        var v247 = [];
        var v248 = v245[v243];
        v246.forEach(function (v249, v250) {
          v247.push({
            title: v249,
            selected: v248 == v250,
            index: v250
          });
        });
        v242.push({
          title: v244,
          subtitle: v246[v248],
          items: v247,
          stype: v243
        });
      };
      v239.source = v76;
      v242.push({
        title: Lampa.Lang.translate("torrent_parser_reset"),
        reset: true
      });
      this.saveChoice(v240);
      if (v239.voice && v239.voice.length) {
        fn29("voice", Lampa.Lang.translate("torrent_parser_voice"));
      }
      if (v239.season && v239.season.length) {
        fn29("season", Lampa.Lang.translate("torrent_serial_season"));
      }
      v64.set("filter", v242);
      v64.set("sort", v76.map(function (v251) {
        return {
          title: v65[v251].name,
          source: v251,
          selected: v251 == v68,
          ghost: !v65[v251].show
        };
      }));
      this.selected(v239);
    };
    this.selected = function (v252) {
      var v253 = this.getChoice();
      var v254 = [];
      for (var v255 in v253) {
        if (v252[v255] && v252[v255].length) {
          if (v255 == "voice") {
            v254.push(v77[v255] + ": " + v252[v255][v253[v255]]);
          } else if (v255 !== "source") {
            if (v252.season.length >= 1) {
              v254.push(v77.season + ": " + v252[v255][v253[v255]]);
            }
          }
        }
      }
      v64.chosen("filter", v254);
      v64.chosen("sort", [v65[v68].name]);
    };
    this.getEpisodes = function (v256, v257) {
      var v258 = [];
      var v259 = v60.movie.id;
      if (["cub", "tmdb"].indexOf(v60.movie.source || "tmdb") == -1) {
        v259 = v60.movie.tmdb_id;
      }
      if (typeof v259 == "number" && v60.movie.name) {
        Lampa.Api.sources.tmdb.get("tv/" + v259 + "/season/" + v256, {}, function (v260) {
          v258 = v260.episodes || [];
          v257(v258);
        }, function () {
          v257(v258);
        });
      } else {
        v257(v258);
      }
    };
    this.watched = function (v261) {
      var v262 = Lampa.Utils.hash(v60.movie.number_of_seasons ? v60.movie.original_name : v60.movie.original_title);
      var v263 = Lampa.Storage.cache("online_watched_last", 5000, {});
      if (v261) {
        if (!v263[v262]) {
          v263[v262] = {};
        }
        Lampa.Arrays.extend(v263[v262], v261, true);
        Lampa.Storage.set("online_watched_last", v263);
        this.updateWatched();
      } else {
        return v263[v262];
      }
    };
    this.updateWatched = function () {
      var v264 = this.watched();
      var v265 = v62.body().find(".online-prestige-watched .online-prestige-watched__body").empty();
      if (v264) {
        var v266 = [];
        if (v264.balanser_name) {
          v266.push(v264.balanser_name);
        }
        if (v264.voice_name) {
          v266.push(v264.voice_name);
        }
        if (v264.season) {
          v266.push(Lampa.Lang.translate("torrent_serial_season") + " " + v264.season);
        }
        if (v264.episode) {
          v266.push(Lampa.Lang.translate("torrent_serial_episode") + " " + v264.episode);
        }
        v266.forEach(function (v267) {
          v265.append("<span>" + v267 + "</span>");
        });
      } else {
        v265.append("<span>" + Lampa.Lang.translate("lampac_no_watch_history") + "</span>");
      }
    };
    this.draw = function (v268) {
      var v269 = this;
      var v270 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!v268.length) {
        return this.empty();
      }
      v62.clear();
      if (!v60.balanser) {
        v62.append(Lampa.Template.get("lampac_prestige_watched", {}));
      }
      this.updateWatched();
      this.getEpisodes(v268[0].season, function (v271) {
        var v272 = Lampa.Storage.cache("online_view", 5000, []);
        var v273 = v60.movie.name ? true : false;
        var v274 = v269.getChoice();
        var v275 = window.innerWidth > 480;
        var v276 = false;
        var v277 = false;
        v268.forEach(function (v279, v280) {
          var v281 = v273 && v271.length && !v270.similars ? v271.find(function (v293) {
            return v293.episode_number == v279.episode;
          }) : false;
          var v282 = v279.episode || v280 + 1;
          var v283 = v274.episodes_view[v279.season];
          var v284 = v274.voice_name || (v78.voice[0] ? v78.voice[0].title : false) || v279.voice_name || (v273 ? "Неизвестно" : v279.text) || "Неизвестно";
          if (v279.quality) {
            v279.qualitys = v279.quality;
            v279.quality = Lampa.Arrays.getKeys(v279.quality)[0];
          }
          Lampa.Arrays.extend(v279, {
            voice_name: v284,
            info: v284.length > 60 ? v284.substr(0, 60) + "..." : v284,
            quality: "",
            time: Lampa.Utils.secondsToTime((v281 ? v281.runtime : v60.movie.runtime) * 60, true)
          });
          var v285 = Lampa.Utils.hash(v279.season ? [v279.season, v279.season > 10 ? ":" : "", v279.episode, v60.movie.original_title].join("") : v60.movie.original_title);
          var v286 = Lampa.Utils.hash(v279.season ? [v279.season, v279.season > 10 ? ":" : "", v279.episode, v60.movie.original_title, v279.voice_name].join("") : v60.movie.original_title + v279.voice_name);
          var v287 = {
            hash_timeline: v285,
            hash_behold: v286
          };
          var v288 = [];
          if (v279.season) {
            v279.translate_episode_end = v269.getLastEpisode(v268);
            v279.translate_voice = v279.voice_name;
          }
          if (v279.text && !v281) {
            v279.title = v279.text;
          }
          v279.timeline = Lampa.Timeline.view(v285);
          if (v281) {
            v279.title = v281.name;
            if (v279.info.length < 30 && v281.vote_average) {
              v288.push(Lampa.Template.get("lampac_prestige_rate", {
                rate: parseFloat(v281.vote_average + "").toFixed(1)
              }, true));
            }
            if (v281.air_date && v275) {
              v288.push(Lampa.Utils.parseTime(v281.air_date).full);
            }
          } else if (v60.movie.release_date && v275) {
            v288.push(Lampa.Utils.parseTime(v60.movie.release_date).full);
          }
          if (!v273 && v60.movie.tagline && v279.info.length < 30) {
            v288.push(v60.movie.tagline);
          }
          if (v279.info) {
            v288.push(v279.info);
          }
          if (v288.length) {
            v279.info = v288.map(function (v294) {
              return "<span>" + v294 + "</span>";
            }).join("<span class=\"online-prestige-split\">?</span>");
          }
          var v289 = Lampa.Template.get("lampac_prestige_full", v279);
          var v290 = v289.find(".online-prestige__loader");
          var v291 = v289.find(".online-prestige__img");
          if (v60.balanser) {
            v291.hide();
          }
          if (!v273) {
            if (v274.movie_view == v286) {
              v276 = v289;
            }
          } else if (typeof v283 !== "undefined" && v283 == v282) {
            v276 = v289;
          }
          if (v273 && !v281) {
            v291.append("<div class=\"online-prestige__episode-number\">" + fn9(v279.episode || v280 + 1) + "</div>");
            v290.remove();
          } else if (!v273 && v60.movie.backdrop_path == "undefined") {
            v290.remove();
          } else {
            var v292 = v289.find("img")[0];
            v292.onerror = function () {
              v292.src = "./img/img_broken.svg";
            };
            v292.onload = function () {
              v291.addClass("online-prestige__img--loaded");
              v290.remove();
              if (v273) {
                v291.append("<div class=\"online-prestige__episode-number\">" + fn9(v279.episode || v280 + 1) + "</div>");
              }
            };
            v292.src = Lampa.TMDB.image("t/p/w300" + (v281 ? v281.still_path : v60.movie.backdrop_path));
            v71.push(v292);
            v279.thumbnail = v292.src;
          }
          v289.find(".online-prestige__timeline").append(Lampa.Timeline.render(v279.timeline));
          if (v272.indexOf(v286) !== -1) {
            v277 = v289;
            v289.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
          }
          v279.mark = function () {
            v272 = Lampa.Storage.cache("online_view", 5000, []);
            if (v272.indexOf(v286) == -1) {
              v272.push(v286);
              Lampa.Storage.set("online_view", v272);
              if (v289.find(".online-prestige__viewed").length == 0) {
                v289.find(".online-prestige__img").append("<div class=\"online-prestige__viewed\">" + Lampa.Template.get("icon_viewed", {}, true) + "</div>");
              }
            }
            v274 = v269.getChoice();
            if (!v273) {
              v274.movie_view = v286;
            } else {
              v274.episodes_view[v279.season] = v282;
            }
            v269.saveChoice(v274);
            var v295 = v274.voice_name || v279.voice_name || v279.title;
            if (v295.length > 30) {
              v295 = v295.slice(0, 30) + "...";
            }
            v269.watched({
              balanser: v68,
              balanser_name: Lampa.Utils.capitalizeFirstLetter(v65[v68] ? v65[v68].name.split(" ")[0] : v68),
              voice_id: v274.voice_id,
              voice_name: v295,
              episode: v279.episode,
              season: v279.season
            });
          };
          v279.unmark = function () {
            v272 = Lampa.Storage.cache("online_view", 5000, []);
            if (v272.indexOf(v286) !== -1) {
              Lampa.Arrays.remove(v272, v286);
              Lampa.Storage.set("online_view", v272);
              Lampa.Storage.remove("online_view", v286);
              v289.find(".online-prestige__viewed").remove();
            }
          };
          v279.timeclear = function () {
            v279.timeline.percent = 0;
            v279.timeline.time = 0;
            v279.timeline.duration = 0;
            Lampa.Timeline.update(v279.timeline);
          };
          v289.on("hover:enter", function () {
            if (v60.movie.id) {
              Lampa.Favorite.add("history", v60.movie, 100);
            }
            if (v270.onEnter) {
              v270.onEnter(v279, v289, v287);
            }
          }).on("hover:focus", function (v296) {
            v66 = v296.target;
            if (v270.onFocus) {
              v270.onFocus(v279, v289, v287);
            }
            v62.update($(v296.target), true);
          });
          if (v270.onRender) {
            v270.onRender(v279, v289, v287);
          }
          v269.contextMenu({
            html: v289,
            element: v279,
            onFile: function fn31(v297) {
              if (v270.onContextMenu) {
                v270.onContextMenu(v279, v289, v287, v297);
              }
            },
            onClearAllMark: function fn32() {
              v268.forEach(function (v298) {
                v298.unmark();
              });
            },
            onClearAllTime: function fn33() {
              v268.forEach(function (v299) {
                v299.timeclear();
              });
            }
          });
          v62.append(v289);
        });
        if (v273 && v271.length > v268.length && !v270.similars) {
          var v278 = v271.slice(v268.length);
          v278.forEach(function (v300) {
            var v301 = [];
            if (v300.vote_average) {
              v301.push(Lampa.Template.get("lampac_prestige_rate", {
                rate: parseFloat(v300.vote_average + "").toFixed(1)
              }, true));
            }
            if (v300.air_date) {
              v301.push(Lampa.Utils.parseTime(v300.air_date).full);
            }
            var v302 = new Date((v300.air_date + "").replace(/-/g, "/"));
            var v303 = Date.now();
            var v304 = Math.round((v302.getTime() - v303) / 86400000);
            var v305 = Lampa.Lang.translate("full_episode_days_left") + ": " + v304;
            var v306 = Lampa.Template.get("lampac_prestige_full", {
              time: Lampa.Utils.secondsToTime((v300 ? v300.runtime : v60.movie.runtime) * 60, true),
              info: v301.length ? v301.map(function (v311) {
                return "<span>" + v311 + "</span>";
              }).join("<span class=\"online-prestige-split\">?</span>") : "",
              title: v300.name,
              quality: v304 > 0 ? v305 : ""
            });
            var v307 = v306.find(".online-prestige__loader");
            var v308 = v306.find(".online-prestige__img");
            var v309 = v268[0] ? v268[0].season : 1;
            v306.find(".online-prestige__timeline").append(Lampa.Timeline.render(Lampa.Timeline.view(Lampa.Utils.hash([v309, v300.episode_number, v60.movie.original_title].join("")))));
            var v310 = v306.find("img")[0];
            if (v300.still_path) {
              v310.onerror = function () {
                v310.src = "./img/img_broken.svg";
              };
              v310.onload = function () {
                v308.addClass("online-prestige__img--loaded");
                v307.remove();
                v308.append("<div class=\"online-prestige__episode-number\">" + fn9(v300.episode_number) + "</div>");
              };
              v310.src = Lampa.TMDB.image("t/p/w300" + v300.still_path);
              v71.push(v310);
            } else {
              v307.remove();
              v308.append("<div class=\"online-prestige__episode-number\">" + fn9(v300.episode_number) + "</div>");
            }
            v306.on("hover:focus", function (v312) {
              v66 = v312.target;
              v62.update($(v312.target), true);
            });
            v306.css("opacity", "0.5");
            v62.append(v306);
          });
        }
        if (v276) {
          v66 = v276[0];
        } else if (v277) {
          v66 = v277[0];
        }
        Lampa.Controller.enable("content");
      });
    };
    this.contextMenu = function (v313) {
      v313.html.on("hover:long", function () {
        function fn34(v314) {
          var v315 = Lampa.Controller.enabled().name;
          var v316 = [];
          if (Lampa.Platform.is("webos")) {
            v316.push({
              title: Lampa.Lang.translate("player_lauch") + " - Webos",
              player: "webos"
            });
          }
          if (Lampa.Platform.is("android")) {
            v316.push({
              title: Lampa.Lang.translate("player_lauch") + " - Android",
              player: "android"
            });
          }
          v316.push({
            title: Lampa.Lang.translate("player_lauch") + " - Lampa",
            player: "lampa"
          });
          v316.push({
            title: Lampa.Lang.translate("lampac_video"),
            separator: true
          });
          v316.push({
            title: Lampa.Lang.translate("torrent_parser_label_title"),
            mark: true
          });
          v316.push({
            title: Lampa.Lang.translate("torrent_parser_label_cancel_title"),
            unmark: true
          });
          v316.push({
            title: Lampa.Lang.translate("time_reset"),
            timeclear: true
          });
          if (v314) {
            v316.push({
              title: Lampa.Lang.translate("copy_link"),
              copylink: true
            });
          }
          if (window.lampac_online_context_menu) {
            window.lampac_online_context_menu.push(v316, v314, v313);
          }
          v316.push({
            title: Lampa.Lang.translate("more"),
            separator: true
          });
          if (Lampa.Account.logged() && v313.element && typeof v313.element.season !== "undefined" && v313.element.translate_voice) {
            v316.push({
              title: Lampa.Lang.translate("lampac_voice_subscribe"),
              subscribe: true
            });
          }
          v316.push({
            title: Lampa.Lang.translate("lampac_clear_all_marks"),
            clearallmark: true
          });
          v316.push({
            title: Lampa.Lang.translate("lampac_clear_all_timecodes"),
            timeclearall: true
          });
          Lampa.Select.show({
            title: Lampa.Lang.translate("title_action"),
            items: v316,
            onBack: function fn35() {
              Lampa.Controller.toggle(v315);
            },
            onSelect: function fn36(v317) {
              if (v317.mark) {
                v313.element.mark();
              }
              if (v317.unmark) {
                v313.element.unmark();
              }
              if (v317.timeclear) {
                v313.element.timeclear();
              }
              if (v317.clearallmark) {
                v313.onClearAllMark();
              }
              if (v317.timeclearall) {
                v313.onClearAllTime();
              }
              if (window.lampac_online_context_menu) {
                window.lampac_online_context_menu.onSelect(v317, v313);
              }
              Lampa.Controller.toggle(v315);
              if (v317.player) {
                Lampa.Player.runas(v317.player);
                v313.html.trigger("hover:enter");
              }
              if (v317.copylink) {
                if (v314.quality) {
                  var v318 = [];
                  for (var v319 in v314.quality) {
                    v318.push({
                      title: v319,
                      file: v314.quality[v319]
                    });
                  }
                  Lampa.Select.show({
                    title: Lampa.Lang.translate("settings_server_links"),
                    items: v318,
                    onBack: function fn37() {
                      Lampa.Controller.toggle(v315);
                    },
                    onSelect: function fn38(v320) {
                      Lampa.Utils.copyTextToClipboard(v320.file, function () {
                        Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                      }, function () {
                        Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
                      });
                    }
                  });
                } else {
                  Lampa.Utils.copyTextToClipboard(v314.file, function () {
                    Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
                  }, function () {
                    Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
                  });
                }
              }
              if (v317.subscribe) {
                Lampa.Account.subscribeToTranslation({
                  card: v60.movie,
                  season: v313.element.season,
                  episode: v313.element.translate_episode_end,
                  voice: v313.element.translate_voice
                }, function () {
                  Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_success"));
                }, function () {
                  Lampa.Noty.show(Lampa.Lang.translate("lampac_voice_error"));
                });
              }
            }
          });
        }
        v313.onFile(fn34);
      }).on("hover:focus", function () {
        if (Lampa.Helper) {
          Lampa.Helper.show("online_file", Lampa.Lang.translate("helper_online_file"), v313.html);
        }
      });
    };
    this.empty = function () {
      var v321 = Lampa.Template.get("lampac_does_not_answer", {});
      v321.find(".online-empty__buttons").remove();
      v321.find(".online-empty__title").text(Lampa.Lang.translate("empty_title_two"));
      v321.find(".online-empty__time").text(Lampa.Lang.translate("empty_text"));
      v62.clear();
      v62.append(v321);
      this.loading(false);
    };
    this.noConnectToServer = function (v322) {
      var v323 = Lampa.Template.get("lampac_does_not_answer", {});
      v323.find(".online-empty__buttons").remove();
      v323.find(".online-empty__title").text(Lampa.Lang.translate("title_error"));
      v323.find(".online-empty__time").text(v322 && v322.accsdb ? v322.msg : Lampa.Lang.translate("lampac_does_not_answer_text").replace("{balanser}", v68[v68].name));
      v62.clear();
      v62.append(v323);
      this.loading(false);
    };
    this.doesNotAnswer = function (v324) {
      var v325 = this;
      this.reset();
      var v326 = Lampa.Template.get("lampac_does_not_answer", {
        balanser: v68
      });
      if (v324 && v324.accsdb) {
        v326.find(".online-empty__title").html(v324.msg);
      }
      var v327 = v324 && v324.accsdb ? 10 : 5;
      v326.find(".cancel").on("hover:enter", function () {
        clearInterval(v70);
      });
      v326.find(".change").on("hover:enter", function () {
        clearInterval(v70);
        v64.render().find(".filter--sort").trigger("hover:enter");
      });
      v62.clear();
      v62.append(v326);
      this.loading(false);
      v70 = setInterval(function () {
        v327--;
        v326.find(".timeout").text(v327);
        if (v327 == 0) {
          clearInterval(v70);
          var v328 = Lampa.Arrays.getKeys(v65);
          var v329 = v328.indexOf(v68);
          var v330 = v328[v329 + 1];
          if (!v330) {
            v330 = v328[0];
          }
          v68 = v330;
          if (Lampa.Activity.active().activity == v325.activity) {
            v325.changeBalanser(v68);
          }
        }
      }, 1000);
    };
    this.getLastEpisode = function (v331) {
      var v332 = 0;
      v331.forEach(function (v333) {
        if (typeof v333.episode !== "undefined") {
          v332 = Math.max(v332, parseInt(v333.episode));
        }
      });
      return v332;
    };
    this.start = function () {
      if (Lampa.Activity.active().activity !== this.activity) {
        return;
      }
      if (!v69) {
        v69 = true;
        this.initialize();
      }
      Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(v60.movie));
      Lampa.Controller.add("content", {
        toggle: function fn39() {
          Lampa.Controller.collectionSet(v62.render(), v63.render());
          Lampa.Controller.collectionFocus(v66 || false, v62.render());
        },
        gone: function fn40() {
          clearTimeout(v70);
        },
        up: function fn41() {
          if (Navigator.canmove("up")) {
            Navigator.move("up");
          } else {
            Lampa.Controller.toggle("head");
          }
        },
        down: function fn42() {
          Navigator.move("down");
        },
        right: function fn43() {
          if (Navigator.canmove("right")) {
            Navigator.move("right");
          } else {
            v64.show(Lampa.Lang.translate("title_filter"), "filter");
          }
        },
        left: function fn44() {
          if (Navigator.canmove("left")) {
            Navigator.move("left");
          } else {
            Lampa.Controller.toggle("menu");
          }
        },
        back: this.back.bind(this)
      });
      Lampa.Controller.toggle("content");
    };
    this.render = function () {
      return v63.render();
    };
    this.back = function () {
      Lampa.Activity.backward();
    };
    this.pause = function () {};
    this.stop = function () {};
    this.destroy = function () {
      v61.clear();
      this.clearImages();
      v63.destroy();
      v62.destroy();
      clearInterval(v70);
      clearTimeout(v75);
    };
  }
  function fn11(v334, v335) {
    var v336 = new Lampa.Reguest();
    var v337 = {
      title: v334,
      search: function (v338, v339) {
        function fn45(v340) {
          var v341 = fn3(Lampa.Arrays.getKeys(v340));
          if (v341.length) {
            var v342 = new Lampa.Status(v341.length);
            v342.onComplite = function (v343) {
              var v344 = [];
              v341.forEach(function (v345) {
                var v346 = v343[v345];
                if (v346 && v346.data && v346.type == "similar") {
                  var v347 = v346.data.map(function (v348) {
                    v348.title = Lampa.Utils.capitalizeFirstLetter(v348.title);
                    v348.release_date = v348.year || "0000";
                    v348.balanser = v335;
                    if (v348.img !== undefined) {
                      if (v348.img.charAt(0) === "/") {
                        v348.img = v2.localhost + v348.img.substring(1);
                      }
                      if (v348.img.indexOf("/proxyimg") !== -1) {
                        v348.img = fn7(v348.img);
                      }
                    }
                    return v348;
                  });
                  v344.push({
                    title: v345,
                    results: v347
                  });
                }
              });
              v339(v344);
            };
            v341.forEach(function (v349) {
              v336.silent(fn7(v340[v349]), function (v350) {
                v342.append(v349, v350);
              }, function () {
                v342.error();
              }, false, {
                headers: fn8()
              });
            });
          } else {
            v339([]);
          }
        }
        v336.silent(fn7(v2.localhost + "lite/" + v335 + "?title=" + v338.query), function (v351) {
          if (v351.rch) {
            fn6(v351, function () {
              v336.silent(fn7(v2.localhost + "lite/" + v335 + "?title=" + v338.query), function (v352) {
                fn45(v352);
              }, function () {
                v339([]);
              }, false, {
                headers: fn8()
              });
            });
          } else {
            fn45(v351);
          }
        }, function () {
          v339([]);
        }, false, {
          headers: fn8()
        });
      },
      onCancel: function () {
        v336.clear();
      },
      params: {
        lazy: true,
        align_left: true,
        card_events: {
          onMenu: function () {}
        }
      },
      onMore: function (v353, v354) {
        v354();
      },
      onSelect: function (v355, v356) {
        v356();
        Lampa.Activity.push({
          url: v355.element.url,
          title: "Lampac - " + v355.element.title,
          component: "lampac",
          movie: v355.element,
          page: 1,
          search: v355.element.title,
          clarification: true,
          balanser: v355.element.balanser,
          noinfo: true
        });
      }
    };
    Lampa.Search.addSource(v337);
  }
  function fn12() {
    if (Lampa.Manifest.origin !== "bylampa") {
      Lampa.Noty.show("Ошибка доступа");
      return;
    }
    window.lampac_plugin = true;
    var v357 = {
      type: "video",
      version: "7.7.7",
      name: "Cinema",
      description: "Плагин для просмотра онлайн сериалов и фильмов",
      component: "cinema_online",
      onContextMenu: function fn48(v360) {
        return {
          name: Lampa.Lang.translate("lampac_watch"),
          description: ""
        };
      },
      onContextLauch: function fn49(v361) {
        fn46();
        Lampa.Component.add("cinema_online", fn10);
        var v362 = Lampa.Utils.hash(v361.number_of_seasons ? v361.original_name : v361.original_title);
        var v363 = Lampa.Storage.get("clarification_search", "{}");
        Lampa.Activity.push({
          url: "",
          title: Lampa.Lang.translate("title_online"),
          component: "cinema_online",
          search: v363[v362] ? v363[v362] : v361.title,
          search_one: v361.title,
          search_two: v361.original_title,
          movie: v361,
          page: 1,
          clarification: v363[v362] ? true : false
        });
      }
    };
    fn11("Cinema", "spider");
    fn11("Cinema - Anime", "spider/anime");
    Lampa.Manifest.plugins = v357;
    Lampa.Lang.add({
      lampac_watch: {
        ru: "Смотреть онлайн",
        en: "Watch online",
        uk: "Дивитися онлайн",
        zh: "????"
      },
      lampac_video: {
        ru: "Видео",
        en: "Video",
        uk: "Відео",
        zh: "??"
      },
      lampac_no_watch_history: {
        ru: "Нет истории просмотра",
        en: "No browsing history",
        ua: "Немає історії перегляду",
        zh: "??????"
      },
      lampac_nolink: {
        ru: "Не удалось извлечь ссылку",
        uk: "Неможливо отримати посилання",
        en: "Failed to fetch link",
        zh: "??????"
      },
      lampac_balanser: {
        ru: "Источник",
        uk: "Джерело",
        en: "Source",
        zh: "??"
      },
      helper_online_file: {
        ru: "Удерживайте клавишу \"ОК\" для вызова контекстного меню",
        uk: "Утримуйте клавішу \"ОК\" для виклику контекстного меню",
        en: "Hold the \"OK\" key to bring up the context menu",
        zh: "??\"??\"????????"
      },
      title_online: {
        ru: "Онлайн",
        uk: "Онлайн",
        en: "Online",
        zh: "???"
      },
      lampac_voice_subscribe: {
        ru: "Подписаться на перевод",
        uk: "Підписатися на переклад",
        en: "Subscribe to translation",
        zh: "????"
      },
      lampac_voice_success: {
        ru: "Вы успешно подписались",
        uk: "Ви успішно підписалися",
        en: "You have successfully subscribed",
        zh: "??????"
      },
      lampac_voice_error: {
        ru: "Возникла ошибка",
        uk: "Виникла помилка",
        en: "An error has occurred",
        zh: "?????"
      },
      lampac_clear_all_marks: {
        ru: "Очистить все метки",
        uk: "Очистити всі мітки",
        en: "Clear all labels",
        zh: "??????"
      },
      lampac_clear_all_timecodes: {
        ru: "Очистить все тайм-коды",
        uk: "Очистити всі тайм-коди",
        en: "Clear all timecodes",
        zh: "????????"
      },
      lampac_change_balanser: {
        ru: "Изменить балансер",
        uk: "Змінити балансер",
        en: "Change balancer",
        zh: "?????"
      },
      lampac_balanser_dont_work: {
        ru: "Поиск на ({balanser}) не дал результатов",
        uk: "Пошук на ({balanser}) не дав результатів",
        en: "Search on ({balanser}) did not return any results",
        zh: "?? ({balanser}) ???????"
      },
      lampac_balanser_timeout: {
        ru: "Источник будет переключен автоматически через <span class=\"timeout\">10</span> секунд.",
        uk: "Джерело буде автоматично переключено через <span class=\"timeout\">10</span> секунд.",
        en: "The source will be switched automatically after <span class=\"timeout\">10</span> seconds.",
        zh: "?????<span class=\"timeout\">10</span>???????"
      },
      lampac_does_not_answer_text: {
        ru: "Поиск на ({balanser}) не дал результатов",
        uk: "Пошук на ({balanser}) не дав результатів",
        en: "Search on ({balanser}) did not return any results",
        zh: "?? ({balanser}) ???????"
      }
    });
    Lampa.Template.add("lampac_css", "\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ? ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}\n        </style>\n    ");
    $("body").append(Lampa.Template.get("lampac_css", {}, true));
    function fn46() {
      Lampa.Template.add("lampac_prestige_full", "<div class=\"online-prestige online-prestige--full selector\">\n            <div class=\"online-prestige__img\">\n                <img alt=\"\">\n                <div class=\"online-prestige__loader\"></div>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__timeline\"></div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                    <div class=\"online-prestige__quality\">{quality}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("lampac_content_loading", "<div class=\"online-empty\">\n            <div class=\"broadcast__scan\"><div></div></div>\n\t\t\t\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template selector\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("lampac_does_not_answer", "<div class=\"online-empty\">\n            <div class=\"online-empty__title\">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class=\"online-empty__time\">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class=\"online-empty__buttons\">\n                <div class=\"online-empty__button selector cancel\">#{cancel}</div>\n                <div class=\"online-empty__button selector change\">#{lampac_change_balanser}</div>\n            </div>\n            <div class=\"online-empty__templates\">\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n                <div class=\"online-empty-template\">\n                    <div class=\"online-empty-template__ico\"></div>\n                    <div class=\"online-empty-template__body\"></div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("lampac_prestige_rate", "<div class=\"online-prestige-rate\">\n            <svg width=\"17\" height=\"16\" viewBox=\"0 0 17 16\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                <path d=\"M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z\" fill=\"#fff\"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>");
      Lampa.Template.add("lampac_prestige_folder", "<div class=\"online-prestige online-prestige--folder selector\">\n            <div class=\"online-prestige__folder\">\n                <svg viewBox=\"0 0 128 112\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <rect y=\"20\" width=\"128\" height=\"92\" rx=\"13\" fill=\"white\"></rect>\n                    <path d=\"M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z\" fill=\"white\" fill-opacity=\"0.23\"></path>\n                    <rect x=\"11\" y=\"8\" width=\"106\" height=\"76\" rx=\"13\" fill=\"white\" fill-opacity=\"0.51\"></rect>\n                </svg>\n            </div>\n            <div class=\"online-prestige__body\">\n                <div class=\"online-prestige__head\">\n                    <div class=\"online-prestige__title\">{title}</div>\n                    <div class=\"online-prestige__time\">{time}</div>\n                </div>\n\n                <div class=\"online-prestige__footer\">\n                    <div class=\"online-prestige__info\">{info}</div>\n                </div>\n            </div>\n        </div>");
      Lampa.Template.add("lampac_prestige_watched", "<div class=\"online-prestige online-prestige-watched selector\">\n            <div class=\"online-prestige-watched__icon\">\n                <svg width=\"21\" height=\"21\" viewBox=\"0 0 21 21\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <circle cx=\"10.5\" cy=\"10.5\" r=\"9\" stroke=\"currentColor\" stroke-width=\"3\"/>\n                    <path d=\"M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z\" fill=\"currentColor\"/>\n                </svg>\n            </div>\n            <div class=\"online-prestige-watched__body\">\n                \n            </div>\n        </div>");
    }
    var v358 = `<div class="full-start__button selector cinema--online lampac--button" data-subtitle="${v357.name} v${v357.version}">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 24 24"><path fill="currentColor" d="M11.585.031c-.342.087-.603.22-.94.478c-.354.273-.644.582-1.038 1.11c-.748 1.01-1.475 2.337-2.332 4.265c-.105.236-.198.43-.205.43a10 10 0 0 1-.211-.655c-.442-1.47-.77-2.426-1.095-3.196C5.254 1.25 4.793.638 4.234.43a1.25 1.25 0 0 0-.795.007c-.565.23-.985.838-1.318 1.914c-.522 1.676-.96 4.53-1.472 9.6c-.478 4.69-.675 7.526-.646 9.257c.012.835.045 1.181.15 1.62c.187.792.622 1.206 1.225 1.163c.159-.013.216-.03.392-.134c.173-.102.247-.17.434-.391c.504-.602.976-1.62 1.952-4.22c.364-.967 1.967-5.397 1.967-5.434c0-.026-.703-2.417-.822-2.8l-.04-.123l-.034.076c-.064.143-.72 1.934-1.448 3.952c-1 2.772-1.577 4.32-1.884 5.06l-.097.239l.012-.267c.01-.146.026-.495.038-.773c.086-1.766.33-4.554.703-8.068c.375-3.536.708-5.842 1.043-7.227c.1-.414.26-.959.294-1.004c.024-.027.233.424.404.871c.356.934.636 1.816 1.515 4.774c1.083 3.651 1.627 5.265 2.325 6.901c.61 1.436 1.104 2.305 1.72 3.036c.432.512.84.835 1.294 1.029a2.03 2.03 0 0 0 1.626.017c1.385-.557 2.565-2.553 3.971-6.719c.378-1.122.691-2.122 1.35-4.32c.911-3.045 1.313-4.251 1.7-5.128a7 7 0 0 1 .211-.447l.057-.098l.038.11c.33.916.663 2.636.971 5.02c.333 2.552.81 7.354.988 9.89c.057.818.12 1.976.117 2.192v.155l-.074-.169c-.235-.534-.779-1.999-1.9-5.102c-.869-2.404-1.484-4.076-1.515-4.113c-.011-.013-.029.014-.043.057c-.574 1.9-.836 2.777-.836 2.81c0 .04.976 2.756 1.686 4.69c.606 1.647 1.152 3.041 1.416 3.618c.349.764.605 1.206.888 1.543c.164.194.242.264.413.365c.376.213.704.16.97.007c.84-.495.985-1.903.66-6.39c-.164-2.229-.523-5.94-.834-8.602c-.494-4.228-1.017-6.645-1.66-7.671c-.254-.408-.601-.7-.938-.793a1.44 1.44 0 0 0-.668.017c-.876.298-1.548 1.546-2.557 4.75c-.136.434-.262.836-.276.892c-.016.059-.038.107-.045.107c-.01 0-.073-.13-.145-.29C15.516 3.2 14.494 1.523 13.542.677c-.278-.247-.729-.52-.995-.604c-.245-.076-.739-.098-.962-.04zm.682 2.15c.726.38 1.918 2.452 3.322 5.778l.44 1.04l-.345 1.099c-.639 2.046-1.05 3.227-1.534 4.382c-.672 1.605-1.316 2.657-1.812 2.958a.73.73 0 0 1-.615.042c-.798-.335-1.798-2.198-2.881-5.375a77 77 0 0 1-.805-2.51l-.135-.442l.346-.837c1.344-3.239 2.541-5.417 3.297-6.008c.273-.213.484-.25.722-.126Z"/></svg>

        <span>#{title_online}</span>
    </div>`;
    Lampa.Component.add("cinema_online", fn10);
    fn46();
    function fn47(v364) {
      if (v364.render.find(".lampac--button").length) {
        return;
      }
      var v365 = $(Lampa.Lang.translate(v358));
      v365.on("hover:enter", function () {
        fn46();
        Lampa.Component.add("cinema_online", fn10);
        var v366 = Lampa.Utils.hash(v364.movie.number_of_seasons ? v364.movie.original_name : v364.movie.original_title);
        var v367 = Lampa.Storage.get("clarification_search", "{}");
        Lampa.Activity.push({
          url: "",
          title: Lampa.Lang.translate("title_online"),
          component: "cinema_online",
          search: v367[v366] ? v367[v366] : v364.movie.title,
          search_one: v364.movie.title,
          search_two: v364.movie.original_title,
          movie: v364.movie,
          page: 1,
          clarification: v367[v366] ? true : false
        });
      });
      v364.render.after(v365);
    }
    Lampa.Listener.follow("full", function (v368) {
      if (v368.type == "complite") {
        fn47({
          render: v368.object.activity.render().find(".view--torrent"),
          movie: v368.data.movie
        });
      }
    });
    try {
      if (Lampa.Activity.active().component == "full") {
        fn47({
          render: Lampa.Activity.active().activity.render().find(".view--torrent"),
          movie: Lampa.Activity.active().card
        });
      }
    } catch (v369) {}
    if (Lampa.Manifest.app_digital >= 177) {
      var v359 = ["filmix", "filmixtv", "fxapi", "rezka", "pizdatoehd", "getstv", "kinopub", "zetflixdb", "collaps", "hdvb", "kodik", "bamboo", "eneyida", "kinoukr", "uafilm", "uakino", "kinotochka", "remux", "anilibria", "animedia", "animego", "animevost", "animebesst", "alloha", "mirage", "phantom", "animelib", "moonanime", "vibix", "fancdn", "cdnvideohub", "vokino", "hydraflix", "videasy", "vidsrc", "movpi", "vidlink", "smashystream", "autoembed", "pidtor", "videoseed", "iptvonline", "veoveo", "kinoflix", "leproduction", "vkmovie", "videoseed", "veoveo", "kinogo", "kinobase", "fancdn", "asiage", "geosaitebi", "mikai", "dreamerscast"];
      v359.forEach(function (v370) {
        Lampa.Storage.sync("online_choice_" + v370, "object_object");
      });
      Lampa.Storage.sync("online_watched_last", "object_object");
    }
  }
  if (!window.lampac_plugin) {
    fn12();
  }
})();
