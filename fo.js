(function () {
	"use strict";

	var STORAGE_KEY_SERVER = "lamponline_server_url";
	var STORAGE_KEY_SERVERS = "lamponline_servers";
	var STORAGE_KEY_ACTIVE_SERVER = "lamponline_active_server";
	var STORAGE_KEY_SERVER_COUNTRIES = "lamponline_server_countries";

	function getServersList() {
		var servers = Lampa.Storage.get(STORAGE_KEY_SERVERS, []);
		if (typeof servers === "string") {
			try {
				servers = JSON.parse(servers);
			} catch (e) {
				servers = [];
			}
		}
		if (!Lampa.Arrays.isArray(servers)) servers = [];
		var oldServer = Lampa.Storage.get(STORAGE_KEY_SERVER, "");
		if (oldServer && servers.indexOf(oldServer) === -1) {
			servers.push(oldServer);
			Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
		}
		return servers;
	}

	function getActiveServerIndex() {
		var servers = getServersList();
		var active = parseInt(Lampa.Storage.get(STORAGE_KEY_ACTIVE_SERVER, 0)) || 0;
		if (active >= servers.length) active = 0;
		return active;
	}

	function setActiveServerIndex(index) {
		Lampa.Storage.set(STORAGE_KEY_ACTIVE_SERVER, index);
	}

	function addServer(url) {
		if (!url) return false;
		var servers = getServersList();
		if (servers.indexOf(url) === -1) {
			servers.push(url);
			Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
			return true;
		}
		return false;
	}

	function removeServer(index) {
		var servers = getServersList();
		if (index >= 0 && index < servers.length) {
			var removedUrl = servers[index];
			servers.splice(index, 1);
			Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
			var oldServer = Lampa.Storage.get(STORAGE_KEY_SERVER, "");
			if (oldServer === removedUrl) {
				Lampa.Storage.set(STORAGE_KEY_SERVER, "");
			}
			var active = getActiveServerIndex();
			if (active >= servers.length) {
				setActiveServerIndex(Math.max(0, servers.length - 1));
			}
			return true;
		}
		return false;
	}

	function getServerCountries() {
		var countries = Lampa.Storage.get(STORAGE_KEY_SERVER_COUNTRIES, {});
		if (typeof countries === "string") {
			try {
				countries = JSON.parse(countries);
			} catch (e) {
				countries = {};
			}
		}
		return countries || {};
	}

	function setServerCountry(url, country) {
		if (!url || !country) return;
		var normalized = url
			.replace(/^https?:\/\//, "")
			.replace(/\/+$/, "")
			.toLowerCase();
		var countries = getServerCountries();
		countries[normalized] = country;
		Lampa.Storage.set(STORAGE_KEY_SERVER_COUNTRIES, countries);
	}

	function getServerCountry(url) {
		if (!url) return "";
		var normalized = url
			.replace(/^https?:\/\//, "")
			.replace(/\/+$/, "")
			.toLowerCase();
		var countries = getServerCountries();
		return countries[normalized] || "";
	}

	function formatServerDisplay(url) {
		var displayName = url.replace(/^https?:\/\//, "");
		var country = getServerCountry(url);
		if (country) {
			return displayName + " (" + country + ")";
		}
		return displayName;
	}

	function getServerUrl() {
		var servers = getServersList();
		if (servers.length === 0) return "";
		var index = getActiveServerIndex();
		var url = servers[index] || "";
		if (url) {
			url = url.replace(/\/+$/, "");
			if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) {
				url = "http://" + url;
			}
		}
		return url;
	}

	function getHostKey() {
		var url = getServerUrl();
		if (!url) return "";
		return url.replace(/^https?:\/\//, "");
	}

	function isServerConfigured() {
		return Boolean(getServerUrl());
	}

	var Config = {
		getHostKey: function () {
			return getHostKey();
		},
		Urls: {
			getLocalhost: function () {
				var url = getServerUrl();
				return url ? url + "/" : "";
			},
			getLampOnline: function () {
				return getServerUrl();
			},
			NwsClientScript:
				"https://honeyxcat.github.io/lampa-link-online/nws-client-es5.js",
			GithubCheck: "https://github.com/",
			CorsCheckPath: "/cors/check"
		},
		Rch: {
			RegistryVersion: 149,
			ClientTimeout: 8000
		},
		StorageKeys: {
			LampacUnicId: "lampac_unic_id",
			LampacProfileId: "lampac_profile_id",
			ClarificationSearch: "clarification_search",
			OnlineLastBalanser: "online_last_balanser",
			OnlineBalanser: "online_balanser",
			ActiveBalanser: "active_balanser",
			OnlineChoicePrefix: "online_choice_",
			OnlineWatchedLast: "online_watched_last",
			OnlineView: "online_view"
		}
	};

	var Defined = {
		getLocalhost: function () {
			return Config.Urls.getLocalhost();
		}
	};

	var balansers_with_search;
	var balansers_with_search_promise;

	function ensureBalansersWithSearch() {
		if (balansers_with_search !== undefined) {
			return Promise.resolve(
				Lampa.Arrays.isArray(balansers_with_search) ? balansers_with_search : []
			);
		}

		if (!isServerConfigured()) {
			return Promise.resolve([]);
		}

		if (balansers_with_search_promise) return balansers_with_search_promise;

		balansers_with_search_promise = new Promise(function (resolve) {
			var net = new Lampa.Reguest();
			net.timeout(10000);
			net.silent(
				account(Defined.getLocalhost() + "lite/withsearch"),
				function (json) {
					balansers_with_search = Lampa.Arrays.isArray(json) ? json : [];
					resolve(balansers_with_search);
				},
				function (e) {
					console.error(e);
					balansers_with_search = [];
					resolve(balansers_with_search);
				}
			);
		});

		return balansers_with_search_promise;
	}

	function getActiveHostKey() {
		return Config.getHostKey();
	}

	if (!window.rch_nws) window.rch_nws = {};

	function ensureRchNws() {
		var hostkey = getActiveHostKey();
		if (!hostkey) return null;
		if (!window.rch_nws[hostkey]) {
			window.rch_nws[hostkey] = {
				type: Lampa.Platform.is("android")
					? "apk"
					: Lampa.Platform.is("tizen")
						? "cors"
						: undefined,
				startTypeInvoke: false,
				rchRegistry: false,
				apkVersion: 0
			};
		}
		return window.rch_nws[hostkey];
	}

	ensureRchNws();

	var _hk1 = getActiveHostKey();
	if (
		typeof (window.rch_nws[_hk1] && window.rch_nws[_hk1].typeInvoke) !==
		"function"
	) {
		var hostkey = _hk1;
		if (hostkey && window.rch_nws[hostkey]) {
			window.rch_nws[hostkey].typeInvoke = function rchtypeInvoke(host, call) {
				var hk = getActiveHostKey();
				if (!window.rch_nws[hk].startTypeInvoke) {
					window.rch_nws[hk].startTypeInvoke = true;
					var check = function check(good) {
						window.rch_nws[hk].type = Lampa.Platform.is("android")
							? "apk"
							: good
								? "cors"
								: "web";

						call();
					};
					if (Lampa.Platform.is("android") || Lampa.Platform.is("tizen"))
						check(true);
					else {
						var net = new Lampa.Reguest();
						net.silent(
							Config.Urls.getLampOnline().indexOf(location.host) >= 0
								? Config.Urls.GithubCheck
								: host + Config.Urls.CorsCheckPath,
							function () {
								check(true);
							},
							function () {
								check(false);
							},
							false,
							{ dataType: "text" }
						);
					}
				} else call();
			};
		}
	}

	var _hk2 = getActiveHostKey();
	if (
		typeof (window.rch_nws[_hk2] && window.rch_nws[_hk2].Registry) !==
		"function"
	) {
		var hostkey = _hk2;
		if (hostkey && window.rch_nws[hostkey]) {
			window.rch_nws[hostkey].Registry = function RchRegistry(
				client,
				startConnection
			) {
				var hk = getActiveHostKey();
				new Promise(function (resolve) {
					window.rch_nws[hk].typeInvoke(Config.Urls.getLampOnline(), resolve);
				})
					.then(function () {
						client.invoke(
							"RchRegistry",
							JSON.stringify({
								version: Config.Rch.RegistryVersion,
								host: location.host,
								rchtype: Lampa.Platform.is("android")
									? "apk"
									: Lampa.Platform.is("tizen")
										? "cors"
										: window.rch_nws[hk].type,
								apkVersion: window.rch_nws[hk].apkVersion,
								player: Lampa.Storage.field("player")
							})
						);

						if (client._shouldReconnect && window.rch_nws[hk].rchRegistry) {
							if (startConnection) startConnection();
							return;
						}
						window.rch_nws[hk].rchRegistry = true;

						client.on("RchRegistry", function (clientIp) {
							if (startConnection) startConnection();
						});

						client.on(
							"RchClient",
							function (rchId, url, data, headers, returnHeaders) {
								var network = new Lampa.Reguest();
								function result(html) {
									if (
										Lampa.Arrays.isObject(html) ||
										Lampa.Arrays.isArray(html)
									) {
										html = JSON.stringify(html);
									}
									client.invoke("RchResult", rchId, html);
								}
								if (url == "eval") {
									result("");
								} else if (url == "ping") result("pong");
								else {
									network["native"](
										url,
										result,
										function () {
											result("");
										},
										data,
										{
											dataType: "text",
											timeout: Config.Rch.ClientTimeout,
											headers: headers,
											returnHeaders: returnHeaders
										}
									);
								}
							}
						);

						client.on("Connected", function (connectionId) {
							window.rch_nws[hk].connectionId = connectionId;
						});
					})
					["catch"](function (e) {
						console.error(e);
						if (startConnection) startConnection();
					});
			};
		}
	}
	if (getActiveHostKey()) {
		window.rch_nws[getActiveHostKey()].typeInvoke(
			Config.Urls.getLampOnline(),
			function () {}
		);
	}

	var domParser = null;

	var lamponline_css_inited = false;

	var Promise = (function () {
		if (typeof window.Promise !== "undefined") return window.Promise;

		function SimplePromise(executor) {
			var state = 0;
			var value = null;
			var queue = [];

			function next(fn) {
				setTimeout(fn, 0);
			}

			function finale() {
				next(function () {
					for (var i = 0; i < queue.length; i++) handle(queue[i]);
					queue = [];
				});
			}

			function resolve(result) {
				try {
					if (result === self)
						throw new TypeError("Promise resolved with itself");
					if (
						result &&
						(typeof result === "object" || typeof result === "function")
					) {
						var then = result.then;
						if (typeof then === "function") {
							return then.call(result, resolve, reject);
						}
					}
					state = 1;
					value = result;
					finale();
				} catch (e) {
					reject(e);
				}
			}

			function reject(error) {
				state = 2;
				value = error;
				finale();
			}

			function handle(handler) {
				if (state === 0) {
					queue.push(handler);
					return;
				}

				var cb = state === 1 ? handler.onFulfilled : handler.onRejected;
				if (!cb) {
					(state === 1 ? handler.resolve : handler.reject)(value);
					return;
				}

				try {
					handler.resolve(cb(value));
				} catch (e) {
					handler.reject(e);
				}
			}

			this.then = function (onFulfilled, onRejected) {
				var selfPromise = this;
				return new SimplePromise(function (resolve, reject) {
					handle({
						onFulfilled: typeof onFulfilled === "function" ? onFulfilled : null,
						onRejected: typeof onRejected === "function" ? onRejected : null,
						resolve: resolve,
						reject: reject
					});
				});
			};

			this["catch"] = function (onRejected) {
				return this.then(null, onRejected);
			};

			var self = this;
			try {
				executor(resolve, reject);
			} catch (e) {
				reject(e);
			}
		}

		SimplePromise.resolve = function (val) {
			return new SimplePromise(function (resolve) {
				resolve(val);
			});
		};

		SimplePromise.reject = function (err) {
			return new SimplePromise(function (resolve, reject) {
				reject(err);
			});
		};

		return SimplePromise;
	})();

	var RchController = (function () {
		var script_promise;

		function getClient() {
			var hostkey = getActiveHostKey();
			return hostkey && window.nwsClient && window.nwsClient[hostkey]
				? window.nwsClient[hostkey]
				: null;
		}

		function loadClientScript() {
			if (typeof NativeWsClient !== "undefined") return Promise.resolve();
			if (script_promise) return script_promise;

			script_promise = new Promise(function (resolve) {
				Lampa.Utils.putScript(
					[Config.Urls.NwsClientScript],
					function () {},
					false,
					resolve,
					true
				);
			});

			return script_promise;
		}

		function connect(json) {
			return loadClientScript().then(function () {
				return new Promise(function (resolve, reject) {
					try {
						var hostkey = getActiveHostKey();
						if (!hostkey) return reject(new Error("Server not configured"));
						ensureRchNws();
						if (
							window.nwsClient &&
							window.nwsClient[hostkey] &&
							window.nwsClient[hostkey]._shouldReconnect
						) {
							return resolve(getClient());
						}
						if (!window.nwsClient) window.nwsClient = {};
						if (window.nwsClient[hostkey] && window.nwsClient[hostkey].socket)
							window.nwsClient[hostkey].socket.close();

						window.nwsClient[hostkey] = new NativeWsClient(json.nws, {
							autoReconnect: false
						});
						window.nwsClient[hostkey].on("Connected", function (connectionId) {
							window.rch_nws[hostkey].Registry(
								window.nwsClient[hostkey],
								function () {
									resolve(getClient());
								}
							);
						});
						window.nwsClient[hostkey].connect();
					} catch (e) {
						console.error(e);
						reject(e);
					}
				});
			});
		}

		function send() {
			var client = getClient();
			if (!client || !client.invoke) return;
			client.invoke.apply(client, arguments);
		}

		function onMessage(event, handler) {
			var client = getClient();
			if (!client || !client.on) return;
			client.on(event, handler);
		}

		return {
			connect: connect,
			send: send,
			onMessage: onMessage,
			getClient: getClient
		};
	})();

	function rchRun(json, call) {
		RchController.connect(json)
			.then(function () {
				call();
			})
			["catch"](function (e) {
				console.error(e);
			});
	}

	function rchInvoke(json, call) {
		rchRun(json, call);
	}

	function buildUrl(url, query) {
		url = url + "";

		if (query && query.length) {
			url = url + (url.indexOf("?") >= 0 ? "&" : "?") + query.join("&");
		}

		if (url.indexOf("uid=") == -1) {
			var visitorId = Lampa.Storage.get("lampac_unic_id", "") || "guest";
			url = Lampa.Utils.addUrlComponent(
				url,
				"uid=" + encodeURIComponent(visitorId)
			);
		}

		return url;
	}

	function account(url) {
		return buildUrl(url);
	}

	function formatCardInfo(info, wrap) {
		if (!info || !info.length) return "";

		var split = '<span class="online-prestige-split">●</span>';
		if (wrap) {
			return info
				.map(function (i) {
					return "<span>" + i + "</span>";
				})
				.join(split);
		}

		return info.join(split);
	}

	var Network = Lampa.Reguest;

	function component(object) {
		var network = new Network();
		var scroll = new Lampa.Scroll({ mask: true, over: true });
		var files = new Lampa.Explorer(object);
		var filter = new Lampa.Filter(object);
		var sources = {};
		var last;
		var source;
		var balanser;
		var initialized;
		var balanser_timer;
		var images = [];
		var number_of_requests = 0;
		var number_of_requests_timer;
		var life_wait_times = 0;
		var life_wait_timer;
		var select_timeout_timer;
		var select_close_timer;
		var destroyed = false;
		var clarification_search_timer;
		var clarification_search_value = null;
		var filter_sources = {};
		var filter_translate = {
			season: Lampa.Lang.translate("torrent_serial_season"),
			voice: Lampa.Lang.translate("torrent_parser_voice"),
			source: Lampa.Lang.translate("settings_rest_source")
		};
		var filter_find = { season: [], voice: [] };

		var NetworkManager = (function () {
			function getRchType() {
				var hostkey = getActiveHostKey();
				return (
					(hostkey && window.rch_nws && window.rch_nws[hostkey]
						? window.rch_nws[hostkey].type
						: window.rch && hostkey && window.rch[hostkey]
							? window.rch[hostkey].type
							: "") || ""
				);
			}

			function buildMovieUrl(url) {
				var query = [];
				var card_source = object.movie.source || "tmdb";
				query.push("id=" + encodeURIComponent(object.movie.id));
				if (object.movie.imdb_id)
					query.push("imdb_id=" + (object.movie.imdb_id || ""));
				if (object.movie.kinopoisk_id)
					query.push("kinopoisk_id=" + (object.movie.kinopoisk_id || ""));
				if (object.movie.tmdb_id)
					query.push("tmdb_id=" + (object.movie.tmdb_id || ""));
				query.push(
					"title=" +
						encodeURIComponent(
							object.clarification
								? object.search
								: object.movie.title || object.movie.name
						)
				);
				query.push(
					"original_title=" +
						encodeURIComponent(
							object.movie.original_title || object.movie.original_name
						)
				);
				query.push("serial=" + (object.movie.name ? 1 : 0));
				query.push(
					"original_language=" + (object.movie.original_language || "")
				);
				query.push(
					"year=" +
						(
							(object.movie.release_date ||
								object.movie.first_air_date ||
								"0000") + ""
						).slice(0, 4)
				);
				query.push("source=" + card_source);
				query.push("clarification=" + (object.clarification ? 1 : 0));
				query.push("similar=" + (object.similar ? true : false));
				query.push("rchtype=" + getRchType());

				return buildUrl(url, query);
			}

			function silentPromise(url, data, options) {
				return new Promise(function (resolve, reject) {
					network.silent(
						url,
						function (json) {
							if (destroyed) return;
							resolve(json);
						},
						function (e) {
							if (destroyed) return;
							reject(e);
						},
						data,
						options
					);
				});
			}

			function nativePromise(url, data, options) {
				return new Promise(function (resolve, reject) {
					network["native"](
						url,
						function (res) {
							if (destroyed) return;
							resolve(res);
						},
						function (e) {
							if (destroyed) return;
							reject(e);
						},
						data,
						options
					);
				});
			}

			return {
				timeout: function (ms) {
					network.timeout(ms);
				},
				clear: function () {
					network.clear();
				},
				getRchType: getRchType,
				buildMovieUrl: buildMovieUrl,
				silentPromise: silentPromise,
				nativePromise: nativePromise
			};
		})();

		var StateManager = (function () {
			var StorageKeys = Config.StorageKeys;

			function getChoice(for_balanser) {
				var data = Lampa.Storage.cache(
					StorageKeys.OnlineChoicePrefix + (for_balanser || balanser),
					3000,
					{}
				);
				var save = data[object.movie.id] || {};
				Lampa.Arrays.extend(save, {
					season: 0,
					voice: 0,
					voice_name: "",
					voice_id: 0,
					episodes_view: {},
					movie_view: ""
				});
				return save;
			}

			function saveChoice(choice, for_balanser) {
				var data = Lampa.Storage.cache(
					StorageKeys.OnlineChoicePrefix + (for_balanser || balanser),
					3000,
					{}
				);
				data[object.movie.id] = choice;
				Lampa.Storage.set(
					StorageKeys.OnlineChoicePrefix + (for_balanser || balanser),
					data
				);
				updateBalanser(for_balanser || balanser);
			}

			function replaceChoice(choice, for_balanser) {
				var to = getChoice(for_balanser);
				Lampa.Arrays.extend(to, choice, true);
				saveChoice(to, for_balanser);
			}

			function updateBalanser(balanser_name) {
				var last_select_balanser = Lampa.Storage.cache(
					StorageKeys.OnlineLastBalanser,
					3000,
					{}
				);
				last_select_balanser[object.movie.id] = balanser_name;
				Lampa.Storage.set(StorageKeys.OnlineLastBalanser, last_select_balanser);
			}

			function watched(set) {
				var file_id = Lampa.Utils.hash(
					object.movie.number_of_seasons
						? object.movie.original_name
						: object.movie.original_title
				);
				var watched = Lampa.Storage.cache(
					StorageKeys.OnlineWatchedLast,
					5000,
					{}
				);
				if (set) {
					if (!watched[file_id]) watched[file_id] = {};
					Lampa.Arrays.extend(watched[file_id], set, true);
					Lampa.Storage.set(StorageKeys.OnlineWatchedLast, watched);
					return true;
				} else {
					return watched[file_id];
				}
			}

			function getLastChoiceBalanser() {
				var last_select_balanser = Lampa.Storage.cache(
					StorageKeys.OnlineLastBalanser,
					3000,
					{}
				);
				if (last_select_balanser[object.movie.id]) {
					return last_select_balanser[object.movie.id];
				} else {
					return Lampa.Storage.get(
						StorageKeys.OnlineBalanser,
						filter_sources.length ? filter_sources[0] : ""
					);
				}
			}

			return {
				getChoice: getChoice,
				saveChoice: saveChoice,
				replaceChoice: replaceChoice,
				updateBalanser: updateBalanser,
				watched: watched,
				getLastChoiceBalanser: getLastChoiceBalanser
			};
		})();

		var UIManager = {
			initTemplates: function () {
				initTemplates();
			}
		};

		var PlayerAdapter = (function () {
			function toPlayElement(file) {
				var play = {
					title: file.title,
					url: file.url,
					quality: file.qualitys,
					timeline: file.timeline,
					subtitles: file.subtitles,
					segments: file.segments,
					callback: file.mark,
					season: file.season,
					episode: file.episode,
					voice_name: file.voice_name
				};
				return play;
			}

			function orUrlReserve(data) {
				if (
					data.url &&
					typeof data.url == "string" &&
					data.url.indexOf(" or ") !== -1
				) {
					var urls = data.url.split(" or ");
					data.url = urls[0];
					data.url_reserve = urls[1];
				}
			}

			function setDefaultQuality(data) {
				if (Lampa.Arrays.getKeys(data.quality).length) {
					for (var q in data.quality) {
						if (parseInt(q) == Lampa.Storage.field("video_quality_default")) {
							data.url = data.quality[q];
							orUrlReserve(data);
						}
						if (data.quality[q].indexOf(" or ") !== -1)
							data.quality[q] = data.quality[q].split(" or ")[0];
					}
				}
			}

			function loadSubtitles(link) {
				network.silent(
					account(link),
					function (subs) {
						Lampa.Player.subtitles(subs);
					},
					function (e) {
						console.error(e);
					}
				);
			}

			return {
				toPlayElement: toPlayElement,
				orUrlReserve: orUrlReserve,
				setDefaultQuality: setDefaultQuality,
				loadSubtitles: loadSubtitles
			};
		})();

		function initTemplates() {
			if (lamponline_css_inited) return;

			Lampa.Template.add(
				"lampac_prestige_full",
				'<div class="online-prestige online-prestige--full selector">\n            <div class="online-prestige__img">\n                <img alt="">\n                <div class="online-prestige__loader"></div>\n            </div>\n            <div class="online-prestige__body">\n                <div class="online-prestige__head">\n                    <div class="online-prestige__title">{title}</div>\n                    <div class="online-prestige__time">{time}</div>\n                </div>\n\n                <div class="online-prestige__timeline"></div>\n\n                <div class="online-prestige__footer">\n                    <div class="online-prestige__info">{info}</div>\n                    <div class="online-prestige__quality">{quality}</div>\n                </div>\n            </div>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_content_loading",
				'<div class="online-empty">\n            <div class="broadcast__scan"><div></div></div>\n\t\t\t\n            <div class="online-empty__templates">\n                <div class="online-empty-template selector">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n            </div>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_does_not_answer",
				'<div class="online-empty">\n            <div class="online-empty__title">\n                #{lampac_balanser_dont_work}\n            </div>\n            <div class="online-empty__time">\n                #{lampac_balanser_timeout}\n            </div>\n            <div class="online-empty__buttons">\n                <div class="online-empty__button selector cancel">#{cancel}</div>\n                <div class="online-empty__button selector change">#{lampac_change_balanser}</div>\n            </div>\n            <div class="online-empty__templates">\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n            </div>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_server_not_configured",
				'<div class="online-empty">\n            <div class="online-empty__title">\n                #{lampac_server_not_set}\n            </div>\n            <div class="online-empty__time">\n                #{lampac_server_not_set_desc}\n            </div>\n            <div class="online-empty__buttons">\n                <div class="online-empty__button selector cancel">#{cancel}</div>\n                <div class="online-empty__button selector enter_server">#{lampac_enter_server}</div>\n            </div>\n            <div class="online-empty__templates">\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n                <div class="online-empty-template">\n                    <div class="online-empty-template__ico"></div>\n                    <div class="online-empty-template__body"></div>\n                </div>\n            </div>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_prestige_rate",
				'<div class="online-prestige-rate">\n            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n                <path d="M8.39409 0.192139L10.99 5.30994L16.7882 6.20387L12.5475 10.4277L13.5819 15.9311L8.39409 13.2425L3.20626 15.9311L4.24065 10.4277L0 6.20387L5.79819 5.30994L8.39409 0.192139Z" fill="#fff"></path>\n            </svg>\n            <span>{rate}</span>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_prestige_folder",
				'<div class="online-prestige online-prestige--folder selector">\n            <div class="online-prestige__folder">\n                <svg viewBox="0 0 128 112" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <rect y="20" width="128" height="92" rx="13" fill="white"></rect>\n                    <path d="M29.9963 8H98.0037C96.0446 3.3021 91.4079 0 86 0H42C36.5921 0 31.9555 3.3021 29.9963 8Z" fill="white" fill-opacity="0.23"></path>\n                    <rect x="11" y="8" width="106" height="76" rx="13" fill="white" fill-opacity="0.51"></rect>\n                </svg>\n            </div>\n            <div class="online-prestige__body">\n                <div class="online-prestige__head">\n                    <div class="online-prestige__title">{title}</div>\n                    <div class="online-prestige__time">{time}</div>\n                </div>\n\n                <div class="online-prestige__footer">\n                    <div class="online-prestige__info">{info}</div>\n                </div>\n            </div>\n        </div>'
			);
			Lampa.Template.add(
				"lampac_prestige_watched",
				'<div class="online-prestige online-prestige-watched selector">\n            <div class="online-prestige-watched__icon">\n                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <circle cx="10.5" cy="10.5" r="9" stroke="currentColor" stroke-width="3"/>\n                    <path d="M14.8477 10.5628L8.20312 14.399L8.20313 6.72656L14.8477 10.5628Z" fill="currentColor"/>\n                </svg>\n            </div>\n            <div class="online-prestige-watched__body">\n                \n            </div>\n        </div>'
			);

			Lampa.Template.add(
				"lampac_css",
				"\n        <style>\n        @charset 'UTF-8';.online-prestige{position:relative;-webkit-border-radius:.3em;border-radius:.3em;background-color:rgba(0,0,0,0.3);display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-prestige__body{padding:1.2em;line-height:1.3;-webkit-box-flex:1;-webkit-flex-grow:1;-moz-box-flex:1;-ms-flex-positive:1;flex-grow:1;position:relative}@media screen and (max-width:480px){.online-prestige__body{padding:.8em 1.2em}}.online-prestige__img{position:relative;width:13em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;min-height:8.2em}.online-prestige__img>img{visibility:hidden;position:absolute;top:0;left:0;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;-webkit-border-radius:.3em;border-radius:.3em;opacity:0;-webkit-transition:opacity .3s;-o-transition:opacity .3s;-moz-transition:opacity .3s;transition:opacity .3s}.online-prestige__img--loaded>img{opacity:1;visibility:visible}@media screen and (max-width:480px){.online-prestige__img{width:7em;min-height:6em}}.online-prestige__folder{padding:1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige__folder>svg{width:4.4em !important;height:4.4em !important}.online-prestige__viewed{position:absolute;top:1em;left:1em;background:rgba(0,0,0,0.45);-webkit-border-radius:100%;border-radius:100%;padding:.25em;font-size:.76em}.online-prestige__viewed>svg{width:1.5em !important;height:1.5em !important}.online-prestige__episode-number{position:absolute;top:0;left:0;right:0;bottom:0;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;font-size:2em}.online-prestige__loader{position:absolute;top:50%;left:50%;width:2em;height:2em;margin-left:-1em;margin-top:-1em;background:url(./img/loader.svg) no-repeat center center;-webkit-background-size:contain;-o-background-size:contain;background-size:contain}.online-prestige__head,.online-prestige__footer{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__timeline{margin:.8em 0}.online-prestige__timeline>.time-line{display:block !important}.online-prestige__title{font-size:1.7em;overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}@media screen and (max-width:480px){.online-prestige__title{font-size:1.4em}}.online-prestige__time{padding-left:2em}.online-prestige__info{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige__info>*{overflow:hidden;-o-text-overflow:ellipsis;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:1;line-clamp:1;-webkit-box-orient:vertical}.online-prestige__quality{padding-left:1em;white-space:nowrap}.online-prestige__scan-file{position:absolute;bottom:0;left:0;right:0}.online-prestige__scan-file .broadcast__scan{margin:0}.online-prestige .online-prestige-split{font-size:.8em;margin:0 1em;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0}.online-prestige.focus::after{content:'';position:absolute;top:-0.6em;left:-0.6em;right:-0.6em;bottom:-0.6em;-webkit-border-radius:.7em;border-radius:.7em;border:solid .3em #fff;z-index:-1;pointer-events:none}.online-prestige+.online-prestige{margin-top:1.5em}.online-prestige--folder .online-prestige__footer{margin-top:.8em}.online-prestige-watched{padding:1em}.online-prestige-watched__icon>svg{width:1.5em;height:1.5em}.online-prestige-watched__body{padding-left:1em;padding-top:.1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.online-prestige-watched__body>span+span::before{content:' ● ';vertical-align:top;display:inline-block;margin:0 .5em}.online-prestige-rate{display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center}.online-prestige-rate>svg{width:1.3em !important;height:1.3em !important}.online-prestige-rate>span{font-weight:600;font-size:1.1em;padding-left:.7em}.online-empty{line-height:1.4}.online-empty__title{font-size:1.8em;margin-bottom:.3em}.online-empty__time{font-size:1.2em;font-weight:300;margin-bottom:1.6em}.online-empty__buttons{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex}.online-empty__buttons>*+*{margin-left:1em}.online-empty__button{background:rgba(0,0,0,0.3);font-size:1.2em;padding:.5em 1.2em;-webkit-border-radius:.2em;border-radius:.2em;margin-bottom:2.4em}.online-empty__button.focus{background:#fff;color:black}.online-empty__templates .online-empty-template:nth-child(2){opacity:.5}.online-empty__templates .online-empty-template:nth-child(3){opacity:.2}.online-empty-template{background-color:rgba(255,255,255,0.3);padding:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template>*{background:rgba(0,0,0,0.3);-webkit-border-radius:.3em;border-radius:.3em}.online-empty-template__ico{width:4em;height:4em;margin-right:2.4em}.online-empty-template__body{height:1.7em;width:70%}.online-empty-template+.online-empty-template{margin-top:1em}.lampac-balanser-loader{display:inline-block;width:1.2em;height:1.2em;margin-top:0;margin-left:0.5em;background:url(./img/loader.svg) no-repeat 50% 50%;background-size:contain}.lampac-similar-img{height:7em;width:7em;border-radius:0.3em;visibility:hidden;}.lampac-dim-opacity{opacity:0.5}\n.lampac-similar-img.loaded { visibility: visible; }\n        </style>\n    "
			);
			$("body").append(Lampa.Template.get("lampac_css", {}, true));
			lamponline_css_inited = true;
		}

		ensureBalansersWithSearch();

		function balanserName(j) {
			var bals = j.balanser;
			var name = j.name.split(" ")[0];
			return (bals || name).toLowerCase();
		}

		function clarificationSearchAdd(value) {
			clarification_search_value = value;
			clearTimeout(clarification_search_timer);
			clarification_search_timer = setTimeout(function () {
				if (destroyed) return;
				var id = Lampa.Utils.hash(
					object.movie.number_of_seasons
						? object.movie.original_name
						: object.movie.original_title
				);
				var all = Lampa.Storage.get(
					Config.StorageKeys.ClarificationSearch,
					"{}"
				);
				all[id] = clarification_search_value;
				Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, all);
				clarification_search_timer = 0;
			}, 500);
		}

		function clarificationSearchDelete() {
			clearTimeout(clarification_search_timer);
			clarification_search_timer = 0;
			clarification_search_value = null;
			var id = Lampa.Utils.hash(
				object.movie.number_of_seasons
					? object.movie.original_name
					: object.movie.original_title
			);
			var all = Lampa.Storage.get(Config.StorageKeys.ClarificationSearch, "{}");
			delete all[id];
			Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, all);
		}

		this.showServerNotConfigured = function () {
			var _this = this;
			var html = Lampa.Template.get("lampac_server_not_configured", {});
			html.find(".cancel").on("hover:enter", function () {
				Lampa.Activity.backward();
			});
			html.find(".enter_server").on("hover:enter", function () {
				openServerInput();
			});
			scroll.clear();
			scroll.append(html);
			this.loading(false);
		};

		this.initialize = function () {
			UIManager.initTemplates();

			var _this = this;

			if (!isServerConfigured()) {
				this.loading(true);
				scroll.body().addClass("torrent-list");
				files.appendFiles(scroll.render());
				Lampa.Controller.enable("content");
				this.showServerNotConfigured();
				return;
			}

			this.loading(true);
			filter.onSearch = function (value) {
				clarificationSearchAdd(value);
				Lampa.Activity.replace({
					search: value,
					clarification: true,
					similar: true
				});
			};
			filter.onBack = function () {
				_this.start();
			};
			filter
				.render()
				.find(".selector")
				.on("hover:enter", function () {
					clearInterval(balanser_timer);
				});
			filter
				.render()
				.find(".filter--search")
				.appendTo(filter.render().find(".torrent-filter"));

			function onFilterReset() {
				clarificationSearchDelete();
				_this.replaceChoice({
					season: 0,
					voice: 0,
					voice_url: "",
					voice_name: ""
				});
				clearTimeout(select_timeout_timer);
				select_timeout_timer = setTimeout(function () {
					if (destroyed) return;
					Lampa.Select.close();
					Lampa.Activity.replace({
						clarification: 0,
						similar: 0
					});
				}, 10);
			}

			function onFilterSelectItem(a, b) {
				var url = filter_find[a.stype][b.index].url;
				var choice = _this.getChoice();
				if (a.stype == "voice") {
					choice.voice_name = filter_find.voice[b.index].title;
					choice.voice_url = url;
				}
				choice[a.stype] = b.index;
				_this.saveChoice(choice);
				_this.reset();
				_this.request(url);
				clearTimeout(select_close_timer);
				select_close_timer = setTimeout(function () {
					if (destroyed) return;
					Lampa.Select.close();
				}, 10);
			}

			function onSortSelect(a) {
				Lampa.Select.close();
				object.lampac_custom_select = a.source;
				_this.changeBalanser(a.source);
			}

			filter.onSelect = function (type, a, b) {
				if (type == "filter") {
					if (a.reset) onFilterReset();
					else onFilterSelectItem(a, b);
				} else if (type == "sort") {
					onSortSelect(a);
				} else if (type == "server") {
					Lampa.Select.close();
					if (a.add) {
						openServerInput(function (new_value) {
							if (new_value) {
								serverBtn
									.find("div")
									.text(
										getServerUrl()
											? formatServerDisplay(getServerUrl())
											: Lampa.Lang.translate("lampac_not_set")
									);
								Lampa.Activity.replace();
							}
						});
					} else {
						setActiveServerIndex(a.index);
						ensureRchNws();
						serverBtn
							.find("div")
							.text(
								getServerUrl()
									? formatServerDisplay(getServerUrl())
									: Lampa.Lang.translate("lampac_not_set")
							);
						Lampa.Activity.replace();
					}
				}
			};
			if (filter.addButtonBack) filter.addButtonBack();
			filter
				.render()
				.find(".filter--sort span")
				.text(Lampa.Lang.translate("lampac_balanser"));

			var serverBtn = $(
				'<div class="simple-button simple-button--filter selector filter--server"><span>' +
					Lampa.Lang.translate("lampac_server_short") +
					"</span><div></div></div>"
			);
			serverBtn
				.find("div")
				.text(
					getServerUrl()
						? formatServerDisplay(getServerUrl())
						: Lampa.Lang.translate("lampac_not_set")
				);
			serverBtn.on("hover:enter", function () {
				openServerMenu(function () {
					serverBtn
						.find("div")
						.text(
							getServerUrl()
								? formatServerDisplay(getServerUrl())
								: Lampa.Lang.translate("lampac_not_set")
						);
				});
			});
			filter.render().find(".filter--sort").before(serverBtn);

			scroll.body().addClass("torrent-list");
			files.appendFiles(scroll.render());
			files.appendHead(filter.render());
			scroll.minus(files.render().find(".explorer__files-head"));
			scroll.body().append(Lampa.Template.get("lampac_content_loading"));
			Lampa.Controller.enable("content");
			this.loading(false);

			if (object.balanser) {
				files.render().find(".filter--search").remove();
				sources = {};
				sources[object.balanser] = { name: object.balanser };
				balanser = object.balanser;
				filter_sources = [];

				var reqUrl = account(object.url.replace("rjson=", "nojson="));

				return network["native"](
					reqUrl,
					function (response) {
						if (destroyed) return;
						this.parse(response);
					}.bind(this),
					function (e) {
						if (destroyed) return;
						files.render().find(".torrent-filter").remove();
						_this.empty();
					},
					false,
					{
						dataType: "text"
					}
				);
			}
			this.externalids()
				.then(function () {
					if (destroyed) return;
					return _this.createSource();
				})
				.then(function (json) {
					if (destroyed) return;
					return ensureBalansersWithSearch().then(function (list) {
						if (destroyed) return;
						var allow_search = false;
						for (var i = 0; i < list.length; i++) {
							var b = list[i];
							if (balanser.slice(0, b.length) == b) {
								allow_search = true;
								break;
							}
						}
						if (!allow_search) {
							filter.render().find(".filter--search").addClass("hide");
						}
						return json;
					});
				})
				.then(function () {
					if (destroyed) return;
					_this.search();
				})
				["catch"](function (e) {
					if (destroyed) return;
					_this.noConnectToServer(e);
				});
		};

		this.rch = function (json, noreset) {
			var _this2 = this;
			rchRun(json, function () {
				if (destroyed) return;
				if (!noreset) _this2.find();
				else noreset();
			});
		};

		this.externalids = function () {
			if (object.movie.imdb_id && object.movie.kinopoisk_id) {
				return Promise.resolve();
			}

			var query = [];
			query.push("id=" + encodeURIComponent(object.movie.id));
			query.push("serial=" + (object.movie.name ? 1 : 0));
			if (object.movie.imdb_id)
				query.push("imdb_id=" + (object.movie.imdb_id || ""));
			if (object.movie.kinopoisk_id)
				query.push("kinopoisk_id=" + (object.movie.kinopoisk_id || ""));
			var url = account(
				Defined.getLocalhost() + "externalids?" + query.join("&")
			);

			NetworkManager.timeout(10000);
			return NetworkManager.silentPromise(url)
				.then(function (json) {
					if (destroyed) return;
					for (var name in json) {
						object.movie[name] = json[name];
					}
				})
				["catch"](function (e) {
					if (destroyed) return;
					console.error(e);
				});
		};

		this.updateBalanser = function (balanser_name) {
			StateManager.updateBalanser(balanser_name);
		};

		this.changeBalanser = function (balanser_name) {
			this.updateBalanser(balanser_name);
			Lampa.Storage.set(Config.StorageKeys.OnlineBalanser, balanser_name);
			var to = this.getChoice(balanser_name);
			var from = this.getChoice();
			if (from.voice_name) to.voice_name = from.voice_name;
			this.saveChoice(to, balanser_name);
			Lampa.Activity.replace();
		};

		this.requestParams = function (url) {
			return NetworkManager.buildMovieUrl(url);
		};

		this.getLastChoiceBalanser = function () {
			return StateManager.getLastChoiceBalanser();
		};

		this.startSource = function (json) {
			json.forEach(function (j) {
				var name = balanserName(j);
				sources[name] = {
					url: j.url,
					name: j.name,
					show: typeof j.show == "undefined" ? true : j.show
				};
			});

			filter_sources = Lampa.Arrays.getKeys(sources);
			if (!filter_sources.length) return Promise.reject();

			var last_select_balanser = Lampa.Storage.cache(
				Config.StorageKeys.OnlineLastBalanser,
				3000,
				{}
			);
			if (last_select_balanser[object.movie.id]) {
				balanser = last_select_balanser[object.movie.id];
			} else {
				balanser = Lampa.Storage.get(
					Config.StorageKeys.OnlineBalanser,
					filter_sources[0]
				);
			}
			if (!sources[balanser]) balanser = filter_sources[0];
			if (!sources[balanser].show && !object.lampac_custom_select)
				balanser = filter_sources[0];
			source = sources[balanser].url;
			Lampa.Storage.set(Config.StorageKeys.ActiveBalanser, balanser);

			return Promise.resolve(json);
		};

		this.lifeSource = function () {
			var _this3 = this;
			return new Promise(function (resolve, reject) {
				var url = _this3.requestParams(
					Defined.getLocalhost() + "lifeevents?memkey=" + (_this3.memkey || "")
				);
				var resolved = false;
				var stopped = false;

				function delayNext() {
					life_wait_timer = setTimeout(function () {
						if (destroyed) return;
						if (!stopped) poll();
					}, 1000);
				}

				function tryResolve(json, any) {
					if (json && json.accsdb) {
						stopped = true;
						reject(json);
						return;
					}

					if (resolved) return;

					var last_balanser = _this3.getLastChoiceBalanser();
					var found = json.online.filter(function (c) {
						return any
							? c.show
							: c.show && c.name.toLowerCase() == last_balanser;
					});

					if (found.length) {
						resolved = true;
						resolve(
							json.online.filter(function (c) {
								return c.show;
							})
						);
					} else if (any) {
						stopped = true;
						reject();
					}
				}

				function poll() {
					NetworkManager.timeout(3000);
					NetworkManager.silentPromise(url)
						.then(function (json) {
							if (destroyed) return;
							life_wait_times++;
							filter_sources = [];
							sources = {};
							json.online.forEach(function (j) {
								var name = balanserName(j);
								sources[name] = {
									url: j.url,
									name: j.name,
									show: typeof j.show == "undefined" ? true : j.show
								};
							});
							filter_sources = Lampa.Arrays.getKeys(sources);
							filter.set(
								"sort",
								filter_sources.map(function (e) {
									return {
										title: sources[e].name,
										source: e,
										selected: e == balanser,
										ghost: !sources[e].show
									};
								})
							);
							filter.chosen("sort", [
								sources[balanser] ? sources[balanser].name : balanser
							]);

							tryResolve(json, false);

							var lastb = _this3.getLastChoiceBalanser();
							if (life_wait_times > 15 || json.ready) {
								stopped = true;
								filter.render().find(".lampac-balanser-loader").remove();
								tryResolve(json, true);
							} else if (!resolved && sources[lastb] && sources[lastb].show) {
								tryResolve(json, true);
								delayNext();
							} else {
								delayNext();
							}
						})
						["catch"](function (e) {
							if (destroyed) return;
							life_wait_times++;
							if (life_wait_times > 15) {
								stopped = true;
								reject(e);
							} else {
								delayNext();
							}
						});
				}

				poll();
			});
		};

		this.createSource = function () {
			var _this4 = this;
			var url = _this4.requestParams(
				Defined.getLocalhost() + "lite/events?life=true"
			);

			NetworkManager.timeout(15000);
			return NetworkManager.silentPromise(url).then(function (json) {
				if (destroyed) return;
				if (json.accsdb) return Promise.reject(json);

				if (json.life) {
					_this4.memkey = json.memkey;
					if (json.title) {
						if (object.movie.name) object.movie.name = json.title;
						if (object.movie.title) object.movie.title = json.title;
					}
					filter
						.render()
						.find(".filter--sort")
						.append('<span class="lampac-balanser-loader"></span>');
					return _this4.lifeSource().then(function (online) {
						if (destroyed) return;
						return _this4.startSource(online);
					});
				}

				return _this4.startSource(json);
			});
		};

		this.create = function () {
			return this.render();
		};

		this.search = function () {
			this.filter(
				{
					source: filter_sources
				},
				this.getChoice()
			);
			this.find();
		};

		this.find = function () {
			this.request(this.requestParams(source));
		};

		this.request = function (url) {
			number_of_requests++;
			var finalUrl = account(url);

			if (number_of_requests < 10) {
				network["native"](
					finalUrl,
					function (response) {
						if (destroyed) return;
						this.parse(response);
					}.bind(this),
					this.doesNotAnswer.bind(this),
					false,
					{
						dataType: "text"
					}
				);
				clearTimeout(number_of_requests_timer);
				number_of_requests_timer = setTimeout(function () {
					if (destroyed) return;
					number_of_requests = 0;
				}, 4000);
			} else this.empty();
		};

		this.parseJsonDate = function (str, name) {
			var elems = [];

			if (typeof str !== "string") {
				return [];
			}

			var root = null;
			try {
				if (!domParser && typeof DOMParser !== "undefined") {
					domParser = new DOMParser();
				}
				if (domParser) {
					var doc = domParser.parseFromString(
						"<div>" + str + "</div>",
						"text/html"
					);
					if (doc && doc.body) root = doc.body;
				}
			} catch (e) {}

			if (!root) {
				try {
					root = document.createElement("div");
					root.innerHTML = str;
				} catch (e) {
					return elems;
				}
			}

			var found = [];
			try {
				found = root.querySelectorAll ? root.querySelectorAll(name) : [];
			} catch (e) {
				found = [];
			}

			for (var i = 0; i < found.length; i++) {
				var item = found[i];
				try {
					var rawJson = item.getAttribute("data-json");
					if (!rawJson) {
						continue;
					}
					var data = JSON.parse(rawJson);
					var season = item.getAttribute("s");
					var episode = item.getAttribute("e");
					var text = item.textContent || item.innerText || "";
					if (!object.movie.name) {
						if (text.match(/\d+p/i)) {
							if (!data.quality) {
								data.quality = {};
								data.quality[text] = data.url;
							}
							text = object.movie.title;
						}
						if (text == "По умолчанию") {
							text = object.movie.title;
						}
					}
					if (episode) data.episode = parseInt(episode);
					if (season) data.season = parseInt(season);
					if (text) data.text = text;
					data.active =
						(" " + (item.className || "") + " ").indexOf(" active ") !== -1;
					elems.push(data);
				} catch (e) {
					console.error(e);
				}
			}

			return elems;
		};

		this.getFileUrl = function (file, call, waiting_rch) {
			var _this = this;
			if (
				Lampa.Storage.field("player") !== "inner" &&
				file.stream &&
				Lampa.Platform.is("apple")
			) {
				var newfile = Lampa.Arrays.clone(file);
				newfile.method = "play";
				newfile.url = file.stream;
				call(newfile, {});
			} else if (file.method == "play") call(file, {});
			else {
				Lampa.Loading.start(function () {
					Lampa.Loading.stop();
					Lampa.Controller.toggle("content");
					network.clear();
				});
				network["native"](
					account(file.url),
					function (json) {
						if (destroyed) return;
						if (json.rch) {
							if (waiting_rch) {
								Lampa.Loading.stop();
								call(false, {});
							} else {
								_this.rch(json, function () {
									if (destroyed) return;
									Lampa.Loading.stop();
									_this.getFileUrl(file, call, true);
								});
							}
						} else {
							Lampa.Loading.stop();
							call(json, json);
						}
					},
					function () {
						if (destroyed) return;
						Lampa.Loading.stop();
						call(false, {});
					}
				);
			}
		};

		this.toPlayElement = function (file) {
			return PlayerAdapter.toPlayElement(file);
		};

		this.orUrlReserve = function (data) {
			PlayerAdapter.orUrlReserve(data);
		};

		this.setDefaultQuality = function (data) {
			PlayerAdapter.setDefaultQuality(data);
		};

		this.display = function (videos) {
			var _this5 = this;
			this.draw(videos, {
				onEnter: function onEnter(item, html) {
					_this5.getFileUrl(
						item,
						function (json, json_call) {
							if (json && json.url) {
								var playlist = [];
								var first = _this5.toPlayElement(item);
								first.url = json.url;
								first.headers = json_call.headers || json.headers;
								first.quality = json_call.quality || item.qualitys;
								first.segments = json_call.segments || item.segments;
								first.hls_manifest_timeout =
									json_call.hls_manifest_timeout || json.hls_manifest_timeout;
								first.subtitles = json.subtitles;
								first.subtitles_call =
									json_call.subtitles_call || json.subtitles_call;
								if (json.vast && json.vast.url) {
									first.vast_url = json.vast.url;
									first.vast_msg = json.vast.msg;
									first.vast_region = json.vast.region;
									first.vast_platform = json.vast.platform;
									first.vast_screen = json.vast.screen;
								}
								_this5.orUrlReserve(first);
								_this5.setDefaultQuality(first);
								if (item.season) {
									videos.forEach(function (elem) {
										var cell = _this5.toPlayElement(elem);
										if (elem == item) cell.url = json.url;
										else {
											if (elem.method == "call") {
												if (Lampa.Storage.field("player") !== "inner") {
													cell.url = elem.stream;
													delete cell.quality;
												} else {
													cell.url = function (call) {
														_this5.getFileUrl(
															elem,
															function (stream, stream_json) {
																if (stream.url) {
																	cell.url = stream.url;
																	cell.quality =
																		stream_json.quality || elem.qualitys;
																	cell.segments =
																		stream_json.segments || elem.segments;
																	cell.subtitles = stream.subtitles;
																	_this5.orUrlReserve(cell);
																	_this5.setDefaultQuality(cell);
																	elem.mark();
																} else {
																	cell.url = "";
																	Lampa.Noty.show(
																		Lampa.Lang.translate("lampac_nolink")
																	);
																}
																call();
															},
															function () {
																cell.url = "";
																call();
															}
														);
													};
												}
											} else {
												cell.url = elem.url;
											}
										}
										_this5.orUrlReserve(cell);
										_this5.setDefaultQuality(cell);
										playlist.push(cell);
									});
								} else {
									playlist.push(first);
								}
								if (playlist.length > 1) first.playlist = playlist;
								if (first.url) {
									var element = first;
									element.isonline = true;
									Lampa.Player.play(element);
									Lampa.Player.playlist(playlist);
									if (element.subtitles_call)
										_this5.loadSubtitles(element.subtitles_call);
									item.mark();
									_this5.updateBalanser(balanser);
								} else {
									Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
								}
							} else Lampa.Noty.show(Lampa.Lang.translate("lampac_nolink"));
						},
						true
					);
				},
				onContextMenu: function onContextMenu(item, html, data, call) {
					_this5.getFileUrl(
						item,
						function (stream) {
							call({
								file: stream.url,
								quality: item.qualitys
							});
						},
						true
					);
				}
			});
			this.filter(
				{
					season: filter_find.season.map(function (s) {
						return s.title;
					}),
					voice: filter_find.voice.map(function (b) {
						return b.title;
					})
				},
				this.getChoice()
			);
		};

		this.loadSubtitles = function (link) {
			PlayerAdapter.loadSubtitles(link);
		};

		this.parse = function (str) {
			if (destroyed) return;
			var json = Lampa.Arrays.decodeJson(str, {});
			if (Lampa.Arrays.isObject(str) && str.rch) json = str;
			if (json.rch) return this.rch(json);

			if (typeof str !== "string") {
			}

			try {
				var items = this.parseJsonDate(str, ".videos__item");
				var buttons = this.parseJsonDate(str, ".videos__button");

				if (
					items.length == 1 &&
					items[0].method == "link" &&
					!items[0].similar
				) {
					filter_find.season = items.map(function (s) {
						return {
							title: s.text,
							url: s.url
						};
					});
					this.replaceChoice({
						season: 0
					});
					this.request(items[0].url);
				} else {
					this.activity.loader(false);
					var videos = items.filter(function (v) {
						return v.method == "play" || v.method == "call";
					});
					var similar = items.filter(function (v) {
						return v.similar;
					});

					if (videos.length) {
						if (buttons.length) {
							filter_find.voice = buttons.map(function (b) {
								return {
									title: b.text,
									url: b.url
								};
							});
							var select_voice_url = this.getChoice(balanser).voice_url;
							var select_voice_name = this.getChoice(balanser).voice_name;
							var find_voice_url = null;
							var find_voice_name = null;
							var find_voice_active = null;
							for (var i = 0; i < buttons.length; i++) {
								var v = buttons[i];
								if (!find_voice_url && v.url == select_voice_url)
									find_voice_url = v;
								if (!find_voice_name && v.text == select_voice_name)
									find_voice_name = v;
								if (!find_voice_active && v.active) find_voice_active = v;
								if (find_voice_url && find_voice_name && find_voice_active)
									break;
							}
							if (find_voice_url && !find_voice_url.active) {
								this.replaceChoice({
									voice: buttons.indexOf(find_voice_url),
									voice_name: find_voice_url.text
								});
								this.request(find_voice_url.url);
							} else if (find_voice_name && !find_voice_name.active) {
								this.replaceChoice({
									voice: buttons.indexOf(find_voice_name),
									voice_name: find_voice_name.text
								});
								this.request(find_voice_name.url);
							} else {
								if (find_voice_active) {
									this.replaceChoice({
										voice: buttons.indexOf(find_voice_active),
										voice_name: find_voice_active.text
									});
								}
								this.display(videos);
							}
						} else {
							this.replaceChoice({
								voice: 0,
								voice_url: "",
								voice_name: ""
							});
							this.display(videos);
						}
					} else if (items.length) {
						if (similar.length) {
							this.similars(similar);
							this.activity.loader(false);
						} else {
							filter_find.season = items.map(function (s) {
								return {
									title: s.text,
									url: s.url
								};
							});
							var select_season = this.getChoice(balanser).season;
							var season = filter_find.season[select_season];
							if (!season) season = filter_find.season[0];
							this.request(season.url);
						}
					} else {
						this.doesNotAnswer(json);
					}
				}
			} catch (e) {
				this.doesNotAnswer(e);
			}
		};

		this.similars = function (json) {
			var _this6 = this;
			var fragment = document.createDocumentFragment();
			json.forEach(function (elem) {
				elem.title = elem.text;
				elem.info = "";
				var info = [];
				var year = (
					(elem.start_date ||
						elem.year ||
						object.movie.release_date ||
						object.movie.first_air_date ||
						"") + ""
				).slice(0, 4);
				if (year) info.push(year);
				if (elem.details) info.push(elem.details);
				var name = elem.title || elem.text;
				elem.title = name;
				elem.time = elem.time || "";
				elem.info = formatCardInfo(info);
				var item = Lampa.Template.get("lampac_prestige_folder", elem);
				if (elem.img) {
					var image = $('<img class="lampac-similar-img"/>');
					var img = image[0];
					item.find(".online-prestige__folder").empty().append(image);
					images.push(img);

					if (elem.img !== undefined) {
						if (elem.img.charAt(0) === "/")
							elem.img = Defined.getLocalhost() + elem.img.substring(1);
						if (elem.img.indexOf("/proxyimg") !== -1)
							elem.img = account(elem.img);
					}

					var tempImg = new Image();
					tempImg.onload = function () {
						if (destroyed) return;
						img.src = tempImg.src;
						if ((" " + img.className + " ").indexOf(" loaded ") == -1)
							img.className =
								(img.className ? img.className + " " : "") + "loaded";
					};
					tempImg.onerror = function () {
						if (destroyed) return;
						img.src = "./img/img_broken.svg";
						if ((" " + img.className + " ").indexOf(" loaded ") == -1)
							img.className =
								(img.className ? img.className + " " : "") + "loaded";
					};
					tempImg.src = elem.img;
					images.push(tempImg);
				}
				item
					.on("hover:enter", function () {
						_this6.reset();
						_this6.request(elem.url);
					})
					.on("hover:focus", function (e) {
						last = e.target;
						scroll.update($(e.target), true);
					});
				if (item && item[0]) fragment.appendChild(item[0]);
			});
			scroll.clear();
			scroll.body()[0].appendChild(fragment);
			this.filter(
				{
					season: filter_find.season.map(function (s) {
						return s.title;
					}),
					voice: filter_find.voice.map(function (b) {
						return b.title;
					})
				},
				this.getChoice()
			);
			Lampa.Controller.enable("content");
		};

		this.getChoice = function (for_balanser) {
			return StateManager.getChoice(for_balanser);
		};

		this.saveChoice = function (choice, for_balanser) {
			StateManager.saveChoice(choice, for_balanser);
		};

		this.replaceChoice = function (choice, for_balanser) {
			StateManager.replaceChoice(choice, for_balanser);
		};

		this.clearImages = function () {
			images.forEach(function (img) {
				if (!img) return;
				try {
					img.onerror = null;
					img.onload = null;
					img.removeAttribute("src");
				} catch (e) {
					console.error(e);
				}
			});
			images = [];
		};

		this.reset = function () {
			last = false;
			clearInterval(balanser_timer);
			clearTimeout(life_wait_timer);
			clearTimeout(number_of_requests_timer);
			clearTimeout(select_timeout_timer);
			clearTimeout(select_close_timer);
			network.clear();
			this.clearImages();
			scroll.render().find(".empty").remove();
			scroll.clear();
			scroll.reset();
			scroll.body().append(Lampa.Template.get("lampac_content_loading"));
		};

		this.loading = function (status) {
			if (status) this.activity.loader(true);
			else {
				this.activity.loader(false);
				this.activity.toggle();
			}
		};

		this.filter = function (filter_items, choice) {
			var _this7 = this;
			var select = [];
			var add = function add(type, title) {
				var need = _this7.getChoice();
				var items = filter_items[type];
				var subitems = [];
				var value = need[type];
				items.forEach(function (name, i) {
					subitems.push({
						title: name,
						selected: value == i,
						index: i
					});
				});
				select.push({
					title: title,
					subtitle: items[value],
					items: subitems,
					stype: type
				});
			};
			filter_items.source = filter_sources;
			select.push({
				title: Lampa.Lang.translate("torrent_parser_reset"),
				reset: true
			});
			this.saveChoice(choice);
			if (filter_items.voice && filter_items.voice.length)
				add("voice", Lampa.Lang.translate("torrent_parser_voice"));
			if (filter_items.season && filter_items.season.length)
				add("season", Lampa.Lang.translate("torrent_serial_season"));
			filter.set("filter", select);
			filter.set(
				"server",
				(function () {
					var servers = getServersList();
					var activeIndex = getActiveServerIndex();
					var items = servers.map(function (server, index) {
						return {
							title: formatServerDisplay(server),
							index: index,
							selected: index === activeIndex
						};
					});
					items.push({
						title: Lampa.Lang.translate("lampac_add_server"),
						add: true
					});
					return items;
				})()
			);
			filter.set(
				"sort",
				filter_sources.map(function (e) {
					return {
						title: sources[e].name,
						source: e,
						selected: e == balanser,
						ghost: !sources[e].show
					};
				})
			);
			filter.chosen("server", [
				getServerUrl()
					? formatServerDisplay(getServerUrl())
					: Lampa.Lang.translate("lampac_not_set")
			]);
			this.selected(filter_items);
		};

		this.selected = function (filter_items) {
			var need = this.getChoice(),
				select = [];
			for (var i in need) {
				if (filter_items[i] && filter_items[i].length) {
					if (i == "voice") {
						select.push(filter_translate[i] + ": " + filter_items[i][need[i]]);
					} else if (i !== "source") {
						if (filter_items.season.length >= 1) {
							select.push(
								filter_translate.season + ": " + filter_items[i][need[i]]
							);
						}
					}
				}
			}
			filter.chosen("filter", select);
			filter.chosen("sort", [sources[balanser].name]);
		};

		this.getEpisodes = function (season, call) {
			var episodes = [];
			var tmdb_id = object.movie.id;
			if (["cub", "tmdb"].indexOf(object.movie.source || "tmdb") == -1)
				tmdb_id = object.movie.tmdb_id;
			if (typeof tmdb_id == "number" && object.movie.name) {
				Lampa.Api.sources.tmdb.get(
					"tv/" + tmdb_id + "/season/" + season,
					{},
					function (data) {
						if (destroyed) return;
						episodes = data.episodes || [];
						call(episodes);
					},
					function () {
						if (destroyed) return;
						call(episodes);
					}
				);
			} else call(episodes);
		};

		this.watched = function (set) {
			if (set) {
				StateManager.watched(set);
				this.updateWatched();
			} else {
				return StateManager.watched();
			}
		};

		this.updateWatched = function () {
			var watched = this.watched();
			var body = scroll
				.body()
				.find(".online-prestige-watched .online-prestige-watched__body")
				.empty();
			if (watched) {
				var line = [];
				if (watched.balanser_name) line.push(watched.balanser_name);
				if (watched.voice_name) line.push(watched.voice_name);
				if (watched.season)
					line.push(
						Lampa.Lang.translate("torrent_serial_season") + " " + watched.season
					);
				if (watched.episode)
					line.push(
						Lampa.Lang.translate("torrent_serial_episode") +
							" " +
							watched.episode
					);
				line.forEach(function (n) {
					body.append("<span>" + n + "</span>");
				});
			} else
				body.append(
					"<span>" + Lampa.Lang.translate("lampac_no_watch_history") + "</span>"
				);
		};

		this.draw = function (items) {
			var _this8 = this;
			var params =
				arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			if (!items.length) return this.empty();
			this.getEpisodes(items[0].season, function (episodes) {
				if (destroyed) return;
				var viewed = Lampa.Storage.cache(
					Config.StorageKeys.OnlineView,
					5000,
					[]
				);
				var serial = object.movie.name ? true : false;
				var choice = _this8.getChoice();
				var fully = window.innerWidth > 480;
				var scroll_to_element = false;
				var scroll_to_mark = false;
				var fragment = document.createDocumentFragment();
				var new_images = [];
				items.forEach(function (element, index) {
					var episode = false;
					if (serial && episodes.length && !params.similars) {
						for (var ei = 0; ei < episodes.length; ei++) {
							if (episodes[ei].episode_number == element.episode) {
								episode = episodes[ei];
								break;
							}
						}
					}
					var episode_num = element.episode || index + 1;
					var episode_last = choice.episodes_view[element.season];
					var voice_name =
						choice.voice_name ||
						(filter_find.voice[0] ? filter_find.voice[0].title : false) ||
						element.voice_name ||
						(serial ? "Неизвестно" : element.text) ||
						"Неизвестно";
					if (element.quality) {
						element.qualitys = element.quality;
						element.quality = Lampa.Arrays.getKeys(element.quality)[0];
					}
					Lampa.Arrays.extend(element, {
						voice_name: voice_name,
						info:
							voice_name.length > 60
								? voice_name.substr(0, 60) + "..."
								: voice_name,
						quality: "",
						time: Lampa.Utils.secondsToTime(
							(episode ? episode.runtime : object.movie.runtime) * 60,
							true
						)
					});
					var hash_timeline = Lampa.Utils.hash(
						element.season
							? [
									element.season,
									element.season > 10 ? ":" : "",
									element.episode,
									object.movie.original_title
								].join("")
							: object.movie.original_title
					);
					var hash_behold = Lampa.Utils.hash(
						element.season
							? [
									element.season,
									element.season > 10 ? ":" : "",
									element.episode,
									object.movie.original_title,
									element.voice_name
								].join("")
							: object.movie.original_title + element.voice_name
					);
					var data = {
						hash_timeline: hash_timeline,
						hash_behold: hash_behold
					};
					var info = [];
					if (element.season) {
						element.translate_episode_end = _this8.getLastEpisode(items);
						element.translate_voice = element.voice_name;
					}
					if (element.text && !episode) element.title = element.text;
					element.timeline = Lampa.Timeline.view(hash_timeline);
					if (episode) {
						element.title = episode.name;
						if (element.info.length < 30 && episode.vote_average)
							info.push(
								Lampa.Template.get(
									"lampac_prestige_rate",
									{
										rate: parseFloat(episode.vote_average + "").toFixed(1)
									},
									true
								)
							);
						if (episode.air_date && fully)
							info.push(Lampa.Utils.parseTime(episode.air_date).full);
					} else if (object.movie.release_date && fully) {
						info.push(Lampa.Utils.parseTime(object.movie.release_date).full);
					}
					if (!serial && object.movie.tagline && element.info.length < 30)
						info.push(object.movie.tagline);
					if (element.info) info.push(element.info);
					if (info.length) element.info = formatCardInfo(info, true);
					var html = Lampa.Template.get("lampac_prestige_full", element);
					var loader = html.find(".online-prestige__loader");
					var image = html.find(".online-prestige__img");
					if (object.balanser) image.hide();
					if (!serial) {
						if (choice.movie_view == hash_behold) scroll_to_element = html;
					} else if (
						typeof episode_last !== "undefined" &&
						episode_last == episode_num
					) {
						scroll_to_element = html;
					}
					if (serial && !episode) {
						image.append(
							'<div class="online-prestige__episode-number">' +
								("0" + (element.episode || index + 1)).slice(-2) +
								"</div>"
						);
						loader.remove();
					} else if (!serial && object.movie.backdrop_path == "undefined")
						loader.remove();
					else {
						var img = html.find("img")[0];
						var tempImg = new Image();
						tempImg.onload = function () {
							if (destroyed) return;
							img.src = tempImg.src;
							image.addClass("online-prestige__img--loaded loaded");
							loader.remove();
							if (serial)
								image.append(
									'<div class="online-prestige__episode-number">' +
										("0" + (element.episode || index + 1)).slice(-2) +
										"</div>"
								);
						};
						tempImg.onerror = function () {
							if (destroyed) return;
							img.src = "./img/img_broken.svg";
							image.addClass("online-prestige__img--loaded loaded");
							loader.remove();
							if (serial)
								image.append(
									'<div class="online-prestige__episode-number">' +
										("0" + (element.episode || index + 1)).slice(-2) +
										"</div>"
								);
						};
						tempImg.src = Lampa.TMDB.image(
							"t/p/w300" +
								(episode ? episode.still_path : object.movie.backdrop_path)
						);
						new_images.push(img);
						new_images.push(tempImg);
					}
					html
						.find(".online-prestige__timeline")
						.append(Lampa.Timeline.render(element.timeline));
					if (viewed.indexOf(hash_behold) !== -1) {
						scroll_to_mark = html;
						html
							.find(".online-prestige__img")
							.append(
								'<div class="online-prestige__viewed">' +
									Lampa.Template.get("icon_viewed", {}, true) +
									"</div>"
							);
					}
					element.mark = function () {
						viewed = Lampa.Storage.cache(
							Config.StorageKeys.OnlineView,
							5000,
							[]
						);
						if (viewed.indexOf(hash_behold) == -1) {
							viewed.push(hash_behold);
							Lampa.Storage.set(Config.StorageKeys.OnlineView, viewed);
							if (html.find(".online-prestige__viewed").length == 0) {
								html
									.find(".online-prestige__img")
									.append(
										'<div class="online-prestige__viewed">' +
											Lampa.Template.get("icon_viewed", {}, true) +
											"</div>"
									);
							}
						}
						choice = _this8.getChoice();
						if (!serial) {
							choice.movie_view = hash_behold;
						} else {
							choice.episodes_view[element.season] = episode_num;
						}
						_this8.saveChoice(choice);
						var voice_name_text =
							choice.voice_name || element.voice_name || element.title;
						if (voice_name_text.length > 30)
							voice_name_text = voice_name_text.slice(0, 30) + "...";
						_this8.watched({
							balanser: balanser,
							balanser_name: Lampa.Utils.capitalizeFirstLetter(
								sources[balanser]
									? sources[balanser].name.split(" ")[0]
									: balanser
							),
							voice_id: choice.voice_id,
							voice_name: voice_name_text,
							episode: element.episode,
							season: element.season
						});
					};
					element.unmark = function () {
						viewed = Lampa.Storage.cache(
							Config.StorageKeys.OnlineView,
							5000,
							[]
						);
						if (viewed.indexOf(hash_behold) !== -1) {
							Lampa.Arrays.remove(viewed, hash_behold);
							Lampa.Storage.set(Config.StorageKeys.OnlineView, viewed);
							Lampa.Storage.remove(Config.StorageKeys.OnlineView, hash_behold);
							html.find(".online-prestige__viewed").remove();
						}
					};
					element.timeclear = function () {
						element.timeline.percent = 0;
						element.timeline.time = 0;
						element.timeline.duration = 0;
						Lampa.Timeline.update(element.timeline);
					};
					html
						.on("hover:enter", function () {
							if (object.movie.id)
								Lampa.Favorite.add("history", object.movie, 100);
							if (params.onEnter) params.onEnter(element, html, data);
						})
						.on("hover:focus", function (e) {
							last = e.target;
							if (params.onFocus) params.onFocus(element, html, data);
							scroll.update($(e.target), true);
						});
					if (params.onRender) params.onRender(element, html, data);
					_this8.contextMenu({
						html: html,
						element: element,
						onFile: function onFile(call) {
							if (params.onContextMenu)
								params.onContextMenu(element, html, data, call);
						},
						onClearAllMark: function onClearAllMark() {
							items.forEach(function (elem) {
								elem.unmark();
							});
						},
						onClearAllTime: function onClearAllTime() {
							items.forEach(function (elem) {
								elem.timeclear();
							});
						}
					});
					if (html && html[0]) fragment.appendChild(html[0]);
				});
				if (serial && episodes.length > items.length && !params.similars) {
					var left = episodes.slice(items.length);
					var days_left_title = Lampa.Lang.translate("full_episode_days_left");
					left.forEach(function (episode) {
						var info = [];
						if (episode.vote_average)
							info.push(
								Lampa.Template.get(
									"lampac_prestige_rate",
									{
										rate: parseFloat(episode.vote_average + "").toFixed(1)
									},
									true
								)
							);
						if (episode.air_date)
							info.push(Lampa.Utils.parseTime(episode.air_date).full);
						var air = new Date((episode.air_date + "").replace(/-/g, "/"));
						var now = Date.now();
						var day = Math.round((air.getTime() - now) / (24 * 60 * 60 * 1000));
						var txt = days_left_title + ": " + day;
						var html = Lampa.Template.get("lampac_prestige_full", {
							time: Lampa.Utils.secondsToTime(
								(episode ? episode.runtime : object.movie.runtime) * 60,
								true
							),
							info: formatCardInfo(info, true),
							title: episode.name,
							quality: day > 0 ? txt : ""
						});
						var loader = html.find(".online-prestige__loader");
						var image = html.find(".online-prestige__img");
						var season = items[0] ? items[0].season : 1;
						html
							.find(".online-prestige__timeline")
							.append(
								Lampa.Timeline.render(
									Lampa.Timeline.view(
										Lampa.Utils.hash(
											[
												season,
												episode.episode_number,
												object.movie.original_title
											].join("")
										)
									)
								)
							);
						var img = html.find("img")[0];
						if (episode.still_path) {
							var tempImg = new Image();
							tempImg.onload = function () {
								if (destroyed) return;
								img.src = tempImg.src;
								image.addClass("online-prestige__img--loaded loaded");
								loader.remove();
								image.append(
									'<div class="online-prestige__episode-number">' +
										("0" + episode.episode_number).slice(-2) +
										"</div>"
								);
							};
							tempImg.onerror = function () {
								if (destroyed) return;
								img.src = "./img/img_broken.svg";
								image.addClass("online-prestige__img--loaded loaded");
								loader.remove();
								image.append(
									'<div class="online-prestige__episode-number">' +
										("0" + episode.episode_number).slice(-2) +
										"</div>"
								);
							};
							tempImg.src = Lampa.TMDB.image("t/p/w300" + episode.still_path);
							new_images.push(img);
							new_images.push(tempImg);
						} else {
							loader.remove();
							image.append(
								'<div class="online-prestige__episode-number">' +
									("0" + episode.episode_number).slice(-2) +
									"</div>"
							);
						}
						html.on("hover:focus", function (e) {
							last = e.target;
							scroll.update($(e.target), true);
						});
						html.addClass("lampac-dim-opacity");
						if (html && html[0]) fragment.appendChild(html[0]);
					});
				}
				scroll.clear();
				_this8.clearImages();

				try {
					if (!object.balanser)
						scroll.append(Lampa.Template.get("lampac_prestige_watched", {}));
				} catch (e) {
					UIManager.initTemplates();
					if (!object.balanser)
						scroll.append(Lampa.Template.get("lampac_prestige_watched", {}));
				}

				_this8.updateWatched();
				scroll.body()[0].appendChild(fragment);
				images = new_images;
				if (scroll_to_element) {
					last = scroll_to_element[0];
				} else if (scroll_to_mark) {
					last = scroll_to_mark[0];
				}
				Lampa.Controller.enable("content");
			});
		};

		this.contextMenu = function (params) {
			params.html
				.on("hover:long", function () {
					function show(extra) {
						var enabled = Lampa.Controller.enabled().name;
						var menu = [];
						if (Lampa.Platform.is("webos")) {
							menu.push({
								title: Lampa.Lang.translate("player_lauch") + " - Webos",
								player: "webos"
							});
						}
						if (Lampa.Platform.is("android")) {
							menu.push({
								title: Lampa.Lang.translate("player_lauch") + " - Android",
								player: "android"
							});
						}
						menu.push({
							title: Lampa.Lang.translate("player_lauch") + " - Lampa",
							player: "lampa"
						});
						menu.push({
							title: Lampa.Lang.translate("lampac_video"),
							separator: true
						});
						menu.push({
							title: Lampa.Lang.translate("torrent_parser_label_title"),
							mark: true
						});
						menu.push({
							title: Lampa.Lang.translate("torrent_parser_label_cancel_title"),
							unmark: true
						});
						menu.push({
							title: Lampa.Lang.translate("time_reset"),
							timeclear: true
						});
						if (extra) {
							menu.push({
								title: Lampa.Lang.translate("copy_link"),
								copylink: true
							});
						}
						if (window.lampac_online_context_menu)
							window.lampac_online_context_menu.push(menu, extra, params);
						menu.push({
							title: Lampa.Lang.translate("more"),
							separator: true
						});
						if (
							Lampa.Account.logged() &&
							params.element &&
							typeof params.element.season !== "undefined" &&
							params.element.translate_voice
						) {
							menu.push({
								title: Lampa.Lang.translate("lampac_voice_subscribe"),
								subscribe: true
							});
						}
						menu.push({
							title: Lampa.Lang.translate("lampac_clear_all_marks"),
							clearallmark: true
						});
						menu.push({
							title: Lampa.Lang.translate("lampac_clear_all_timecodes"),
							timeclearall: true
						});
						Lampa.Select.show({
							title: Lampa.Lang.translate("title_action"),
							items: menu,
							onBack: function onBack() {
								Lampa.Controller.toggle(enabled);
							},
							onSelect: function onSelect(a) {
								if (a.mark) params.element.mark();
								if (a.unmark) params.element.unmark();
								if (a.timeclear) params.element.timeclear();
								if (a.clearallmark) params.onClearAllMark();
								if (a.timeclearall) params.onClearAllTime();
								if (window.lampac_online_context_menu)
									window.lampac_online_context_menu.onSelect(a, params);
								Lampa.Controller.toggle(enabled);
								if (a.player) {
									Lampa.Player.runas(a.player);
									params.html.trigger("hover:enter");
								}
								if (a.copylink) {
									if (extra.quality) {
										var qual = [];
										for (var i in extra.quality) {
											qual.push({
												title: i,
												file: extra.quality[i]
											});
										}
										Lampa.Select.show({
											title: Lampa.Lang.translate("settings_server_links"),
											items: qual,
											onBack: function onBack() {
												Lampa.Controller.toggle(enabled);
											},
											onSelect: function onSelect(b) {
												Lampa.Utils.copyTextToClipboard(
													b.file,
													function () {
														Lampa.Noty.show(
															Lampa.Lang.translate("copy_secuses")
														);
													},
													function () {
														Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
													}
												);
											}
										});
									} else {
										Lampa.Utils.copyTextToClipboard(
											extra.file,
											function () {
												Lampa.Noty.show(Lampa.Lang.translate("copy_secuses"));
											},
											function () {
												Lampa.Noty.show(Lampa.Lang.translate("copy_error"));
											}
										);
									}
								}
								if (a.subscribe) {
									Lampa.Account.subscribeToTranslation(
										{
											card: object.movie,
											season: params.element.season,
											episode: params.element.translate_episode_end,
											voice: params.element.translate_voice
										},
										function () {
											Lampa.Noty.show(
												Lampa.Lang.translate("lampac_voice_success")
											);
										},
										function () {
											Lampa.Noty.show(
												Lampa.Lang.translate("lampac_voice_error")
											);
										}
									);
								}
							}
						});
					}
					params.onFile(show);
				})
				.on("hover:focus", function () {
					if (Lampa.Helper)
						Lampa.Helper.show(
							"online_file",
							Lampa.Lang.translate("helper_online_file"),
							params.html
						);
				});
		};

		this.empty = function () {
			var html = Lampa.Template.get("lampac_does_not_answer", {});
			html.find(".online-empty__buttons").remove();
			html
				.find(".online-empty__title")
				.text(Lampa.Lang.translate("empty_title_two"));
			html.find(".online-empty__time").text(Lampa.Lang.translate("empty_text"));
			scroll.clear();
			scroll.append(html);
			this.loading(false);
		};

		this.noConnectToServer = function (er) {
			if (destroyed) return;
			var html = Lampa.Template.get("lampac_does_not_answer", {});
			html.find(".online-empty__buttons").remove();
			html
				.find(".online-empty__title")
				.text(Lampa.Lang.translate("title_error"));
			var bname = sources[balanser] ? sources[balanser].name : balanser;
			html
				.find(".online-empty__time")
				.text(
					er && er.accsdb
						? er.msg
						: Lampa.Lang.translate("lampac_does_not_answer_text").replace(
								"{balanser}",
								bname
							)
				);
			scroll.clear();
			scroll.append(html);
			this.loading(false);
		};

		this.doesNotAnswer = function (er) {
			if (destroyed) return;
			var _this9 = this;
			this.reset();
			var html = Lampa.Template.get("lampac_does_not_answer", {
				balanser: balanser
			});
			if (er && er.accsdb) html.find(".online-empty__title").html(er.msg);

			var tic = er && er.accsdb ? 10 : 5;
			html.find(".cancel").on("hover:enter", function () {
				clearInterval(balanser_timer);
			});
			html.find(".change").on("hover:enter", function () {
				clearInterval(balanser_timer);
				filter.render().find(".filter--sort").trigger("hover:enter");
			});
			scroll.clear();
			scroll.append(html);
			this.loading(false);
			balanser_timer = setInterval(function () {
				if (destroyed) return;
				tic--;
				html.find(".timeout").text(tic);
				if (tic == 0) {
					clearInterval(balanser_timer);
					var keys = Lampa.Arrays.getKeys(sources);
					var indx = keys.indexOf(balanser);
					var next = keys[indx + 1];
					if (!next) next = keys[0];
					balanser = next;
					if (Lampa.Activity.active().activity == _this9.activity)
						_this9.changeBalanser(balanser);
				}
			}, 1000);
		};

		this.getLastEpisode = function (items) {
			var last_episode = 0;
			items.forEach(function (e) {
				if (typeof e.episode !== "undefined")
					last_episode = Math.max(last_episode, parseInt(e.episode));
			});
			return last_episode;
		};

		function safeLastFocus() {
			if (!last) return false;
			try {
				var render = scroll.render();
				if (
					render &&
					render[0] &&
					render[0].contains &&
					!render[0].contains(last)
				)
					return false;
			} catch (e) {
				console.error(e);
				return false;
			}
			return last;
		}

		this.start = function () {
			if (Lampa.Activity.active().activity !== this.activity) return;
			if (!initialized) {
				initialized = true;
				this.initialize();
			}
			Lampa.Background.immediately(
				Lampa.Utils.cardImgBackgroundBlur(object.movie)
			);
			Lampa.Controller.add("content", {
				toggle: function toggle() {
					Lampa.Controller.collectionSet(scroll.render(), files.render());
					Lampa.Controller.collectionFocus(safeLastFocus(), scroll.render());
				},
				gone: function gone() {
					clearInterval(balanser_timer);
				},
				up: function up() {
					if (Navigator.canmove("up")) {
						Navigator.move("up");
					} else Lampa.Controller.toggle("head");
				},
				down: function down() {
					Navigator.move("down");
				},
				right: function right() {
					if (Navigator.canmove("right")) Navigator.move("right");
					else filter.show(Lampa.Lang.translate("title_filter"), "filter");
				},
				left: function left() {
					if (Navigator.canmove("left")) Navigator.move("left");
					else Lampa.Controller.toggle("menu");
				},
				back: this.back.bind(this)
			});
			Lampa.Controller.toggle("content");
		};

		this.render = function () {
			return files.render();
		};

		this.back = function () {
			Lampa.Activity.backward();
		};

		this.pause = function () {};
		this.stop = function () {};
		this.destroy = function () {
			destroyed = true;
			last = false;
			var need_flush_clarification = clarification_search_timer;
			clearTimeout(clarification_search_timer);
			clarification_search_timer = 0;
			if (need_flush_clarification && clarification_search_value !== null) {
				var id = Lampa.Utils.hash(
					object.movie.number_of_seasons
						? object.movie.original_name
						: object.movie.original_title
				);
				var all = Lampa.Storage.get(
					Config.StorageKeys.ClarificationSearch,
					"{}"
				);
				all[id] = clarification_search_value;
				Lampa.Storage.set(Config.StorageKeys.ClarificationSearch, all);
			}
			network.clear();
			this.clearImages();
			files.destroy();
			scroll.destroy();
			clearInterval(balanser_timer);
			clearTimeout(life_wait_timer);
			clearTimeout(number_of_requests_timer);
			clearTimeout(select_timeout_timer);
			clearTimeout(select_close_timer);
		};
	}

	function addSourceSearch(spiderName, spiderUri) {
		var network = new Lampa.Reguest();

		var source = {
			title: spiderName,
			search: function (params, oncomplite) {
				function searchComplite(links) {
					var keys = Lampa.Arrays.getKeys(links);

					if (keys.length) {
						var status = new Lampa.Status(keys.length);

						status.onComplite = function (result) {
							var rows = [];

							keys.forEach(function (name) {
								var line = result[name];

								if (line && line.data && line.type == "similar") {
									var cards = line.data.map(function (item) {
										item.title = Lampa.Utils.capitalizeFirstLetter(item.title);
										item.release_date = item.year || "0000";
										item.balanser = spiderUri;
										if (item.img !== undefined) {
											if (item.img.charAt(0) === "/")
												item.img =
													Defined.getLocalhost() + item.img.substring(1);
											if (item.img.indexOf("/proxyimg") !== -1)
												item.img = account(item.img);
										}

										return item;
									});

									rows.push({
										title: name,
										results: cards
									});
								}
							});

							oncomplite(rows);
						};

						keys.forEach(function (name) {
							network.silent(
								account(links[name]),
								function (data) {
									status.append(name, data);
								},
								function () {
									status.error();
								}
							);
						});
					} else {
						oncomplite([]);
					}
				}

				network.silent(
					account(
						Defined.getLocalhost() +
							"lite/" +
							spiderUri +
							"?title=" +
							params.query
					),
					function (json) {
						if (json.rch) {
							rchRun(json, function () {
								network.silent(
									account(
										Defined.getLocalhost() +
											"lite/" +
											spiderUri +
											"?title=" +
											params.query
									),
									function (links) {
										searchComplite(links);
									},
									function () {
										oncomplite([]);
									}
								);
							});
						} else {
							searchComplite(json);
						}
					},
					function () {
						oncomplite([]);
					}
				);
			},
			onCancel: function () {
				network.clear();
			},
			params: {
				lazy: true,
				align_left: true,
				card_events: {
					onMenu: function () {}
				}
			},
			onMore: function (params, close) {
				close();
			},
			onSelect: function (params, close) {
				close();

				Lampa.Activity.push({
					url: params.element.url,
					title: "Lampac - " + params.element.title,
					component: "lamponline",
					movie: params.element,
					page: 1,
					search: params.element.title,
					clarification: true,
					balanser: params.element.balanser,
					noinfo: true
				});
			}
		};

		Lampa.Search.addSource(source);
	}

	function startPlugin() {
		window.lamponline_plugin = true;
		var manifst = {
			type: "video",
			version: "1.0.0",
			name: "",
			description: "Просмотр онлайна",
			component: "lamponline",

			onContextLauch: function onContextLauch(object) {
				Lampa.Component.add("lamponline", component);

				var id = Lampa.Utils.hash(
					object.number_of_seasons
						? object.original_name
						: object.original_title
				);
				var all = Lampa.Storage.get(
					Config.StorageKeys.ClarificationSearch,
					"{}"
				);

				Lampa.Activity.push({
					url: "",
					title: Lampa.Lang.translate("title_online"),
					component: "lamponline",
					search: all[id] ? all[id] : object.title,
					search_one: object.title,
					search_two: object.original_title,
					movie: object,
					page: 1,
					clarification: all[id] ? true : false
				});
			}
		};
		addSourceSearch("Онлайн", "spider");

		Lampa.Manifest.plugins = manifst;
		Lampa.Lang.add({
			lampac_watch: {
				ru: "Смотреть онлайн",
				en: "Watch online",
				uk: "Дивитися онлайн",
				zh: "在线观看"
			},
			lampac_video: {
				ru: "Видео",
				en: "Video",
				uk: "Відео",
				zh: "视频"
			},
			lampac_no_watch_history: {
				ru: "Нет истории просмотра",
				en: "No browsing history",
				ua: "Немає історії перегляду",
				zh: "没有浏览历史"
			},
			lampac_nolink: {
				ru: "Не удалось извлечь ссылку",
				uk: "Неможливо отримати посилання",
				en: "Failed to fetch link",
				zh: "获取链接失败"
			},
			lampac_balanser: {
				ru: "Источник",
				uk: "Джерело",
				en: "Source",
				zh: "来源"
			},
			helper_online_file: {
				ru: 'Удерживайте клавишу "ОК" для вызова контекстного меню',
				uk: 'Утримуйте клавішу "ОК" для виклику контекстного меню',
				en: 'Hold the "OK" key to bring up the context menu',
				zh: "按住“确定”键调出上下文菜单"
			},
			title_online: {
				ru: "Онлайн",
				uk: "Онлайн",
				en: "Online",
				zh: "在线的"
			},
			lampac_voice_subscribe: {
				ru: "Подписаться на перевод",
				uk: "Підписатися на переклад",
				en: "Subscribe to translation",
				zh: "订阅翻译"
			},
			lampac_voice_success: {
				ru: "Вы успешно подписались",
				uk: "Ви успішно підписалися",
				en: "You have successfully subscribed",
				zh: "您已成功订阅"
			},
			lampac_voice_error: {
				ru: "Возникла ошибка",
				uk: "Виникла помилка",
				en: "An error has occurred",
				zh: "发生了错误"
			},
			lampac_clear_all_marks: {
				ru: "Очистить все метки",
				uk: "Очистити всі мітки",
				en: "Clear all labels",
				zh: "清除所有标签"
			},
			lampac_clear_all_timecodes: {
				ru: "Очистить все тайм-коды",
				uk: "Очистити всі тайм-коди",
				en: "Clear all timecodes",
				zh: "清除所有时间代码"
			},
			lampac_change_balanser: {
				ru: "Изменить балансер",
				uk: "Змінити балансер",
				en: "Change balancer",
				zh: "更改平衡器"
			},
			lampac_balanser_dont_work: {
				ru: "Поиск не дал результатов",
				uk: "Пошук на ({balanser}) не дав результатів",
				en: "Search on ({balanser}) did not return any results",
				zh: "搜索 ({balanser}) 未返回任何结果"
			},
			lampac_balanser_timeout: {
				ru: 'Источник будет переключен автоматически через <span class="timeout">10</span> секунд.',
				uk: 'Джерело буде автоматично переключено через <span class="timeout">10</span> секунд.',
				en: 'The source will be switched automatically after <span class="timeout">10</span> seconds.',
				zh: '平衡器将在<span class="timeout">10</span>秒内自动切换。'
			},
			lampac_does_not_answer_text: {
				ru: "Поиск не дал результатов",
				uk: "Пошук на ({balanser}) не дав результатів",
				en: "Search on ({balanser}) did not return any results",
				zh: "搜索 ({balanser}) 未返回任何结果"
			},
			lampac_server_not_set: {
				ru: "Сервер не настроен",
				uk: "Сервер не налаштований",
				en: "Server not configured",
				zh: "服务器未配置"
			},
			lampac_server_not_set_desc: {
				ru: "Укажите адрес сервера в настройках для просмотра онлайн",
				uk: "Вкажіть адресу сервера в налаштуваннях для перегляду онлайн",
				en: "Specify the server address in settings to watch online",
				zh: "在设置中指定服务器地址以在线观看"
			},
			lampac_open_settings: {
				ru: "Открыть настройки",
				uk: "Відкрити налаштування",
				en: "Open settings",
				zh: "打开设置"
			},
			lampac_enter_server: {
				ru: "Ввести адрес сервера",
				uk: "Ввести адресу сервера",
				en: "Enter server address",
				zh: "输入服务器地址"
			},
			lampac_server_short: {
				ru: "Сервер",
				uk: "Сервер",
				en: "Server",
				zh: "服务器"
			},
			lampac_not_set: {
				ru: "Не указан",
				uk: "Не вказано",
				en: "Not set",
				zh: "未设置"
			},
			lampac_add_server: {
				ru: "Добавить сервер",
				uk: "Додати сервер",
				en: "Add server",
				zh: "添加服务器"
			},
			lampac_select_server: {
				ru: "Выбор сервера",
				uk: "Вибір сервера",
				en: "Select server",
				zh: "选择服务器"
			},
			lampac_servers_list: {
				ru: "Список серверов",
				uk: "Список серверів",
				en: "Servers list",
				zh: "服务器列表"
			},
			lampac_select_this: {
				ru: "Выбрать",
				uk: "Вибрати",
				en: "Select",
				zh: "选择"
			},
			lampac_delete_server: {
				ru: "Удалить",
				uk: "Видалити",
				en: "Delete",
				zh: "删除"
			},
			lampac_edit_server: {
				ru: "Редактировать",
				uk: "Редагувати",
				en: "Edit",
				zh: "编辑"
			},
			lampac_server_address: {
				ru: "Адрес сервера",
				uk: "Адреса сервера",
				en: "Server address",
				zh: "服务器地址"
			},
			lampac_server_address_desc: {
				ru: "Например: 192.168.1.1:9118 или lampac.site",
				uk: "Наприклад: 192.168.1.1:9118 або lampac.site",
				en: "Example: 192.168.1.1:9118 or lampac.site",
				zh: "例如：192.168.1.1:9118 或 lampac.site"
			},
			lampac_settings_title: {
				ru: "Онлайн",
				uk: "Онлайн",
				en: "Online",
				zh: "在线"
			},
			lampac_load_public_servers: {
				ru: "Загрузить открытые серверы",
				uk: "Завантажити відкриті сервери",
				en: "Load public servers",
				zh: "加载公共服务器"
			},
			lampac_load_public_servers_desc: {
				ru: "Загрузить список бесплатных серверов из интернета",
				uk: "Завантажити список безкоштовних серверів з інтернету",
				en: "Load list of free servers from internet",
				zh: "从互联网加载免费服务器列表"
			},
			lampac_loading: {
				ru: "Загрузка...",
				uk: "Завантаження...",
				en: "Loading...",
				zh: "加载中..."
			},
			lampac_load_error: {
				ru: "Ошибка загрузки серверов",
				uk: "Помилка завантаження серверів",
				en: "Error loading servers",
				zh: "加载服务器错误"
			},
			lampac_no_servers_found: {
				ru: "Серверы не найдены",
				uk: "Сервери не знайдено",
				en: "No servers found",
				zh: "未找到服务器"
			},
			lampac_checking_servers: {
				ru: "Проверка серверов",
				uk: "Перевірка серверів",
				en: "Checking servers",
				zh: "检查服务器"
			},
			lampac_no_working_servers: {
				ru: "Рабочие серверы не найдены",
				uk: "Робочі сервери не знайдено",
				en: "No working servers found",
				zh: "未找到可用服务器"
			},
			lampac_found_working: {
				ru: "Найдено рабочих",
				uk: "Знайдено робочих",
				en: "Found working",
				zh: "找到可用"
			},
			lampac_select_public_server: {
				ru: "Выберите сервер",
				uk: "Виберіть сервер",
				en: "Select server",
				zh: "选择服务器"
			},
			lampac_refresh_servers: {
				ru: "Обновить список",
				uk: "Оновити список",
				en: "Refresh list",
				zh: "刷新列表"
			},
			lampac_server_already_added: {
				ru: "Уже добавлен",
				uk: "Вже додано",
				en: "Already added",
				zh: "已添加"
			},
			lampac_public_servers: {
				ru: "Публичные серверы",
				uk: "Публічні сервери",
				en: "Public servers",
				zh: "公共服务器"
			}
		});

		var button =
			'<div class="full-start__button selector view--online lampac--button" data-subtitle="'.concat(
				manifst.name,
				' ").concat(manifst.version, "">\n         <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">\n<path d="M11.783 10.094c-1.699.998-3.766 1.684-5.678 1.95a1.66 1.66 0 0 1-.684.934c.512 1.093 1.249 2.087 2.139 2.987a7.98 7.98 0 0 0 6.702-3.074l.083-.119c-.244-.914-.648-1.784-1.145-2.644q-.134.038-.261.062c-.143.04-.291.068-.446.068a1.7 1.7 0 0 1-.71-.164M9.051 5.492a18 18 0 0 0-2.004-1.256 1.67 1.67 0 0 1-1.907.985c-.407 1.535-.624 3.162-.511 4.694a1.67 1.67 0 0 1 1.52 1.354c1.695-.279 3.47-.879 4.967-1.738a1.67 1.67 0 0 1-.297-.949c0-.413.156-.786.403-1.078-.654-.736-1.389-1.443-2.171-2.012M4 9.989c-.137-1.634.104-3.392.541-5.032a1.67 1.67 0 0 1-.713-1.369c0-.197.039-.386.104-.562a18 18 0 0 0-1.974-.247c-.089.104-.185.204-.269.314a7.98 7.98 0 0 0-1.23 7.547 9.5 9.5 0 0 0 2.397.666A1.67 1.67 0 0 1 4 9.989m9.928-.3c-.029.037-.064.067-.096.1.433.736.799 1.482 1.053 2.268a7.98 7.98 0 0 0 .832-6.122c-.09.133-.176.267-.271.396-.436.601-.875 1.217-1.354 1.772.045.152.076.311.076.479v.004c.084.374.013.779-.24 1.103M7.164 3.447c.799.414 1.584.898 2.33 1.44.84.611 1.627 1.373 2.324 2.164.207-.092.434-.145.676-.145.5 0 .945.225 1.252.572.404-.492.783-1.022 1.161-1.54.194-.268.372-.543.544-.82A7.96 7.96 0 0 0 7.701.012q-.173.217-.339.439c-.401.552-.739 1.08-1.04 1.637.039.029.064.066.1.1.417.276.697.734.742 1.259m-4.285 8.518a10 10 0 0 1-2.07-.487 7.95 7.95 0 0 0 5.806 4.397 11 11 0 0 1-1.753-2.66 1.675 1.675 0 0 1-1.983-1.25m1.635-9.723a1.32 1.32 0 0 1 1.199-.416C6.025 1.24 6.377.683 6.794.104a7.97 7.97 0 0 0-4.247 2.062c.59.066 1.176.14 1.761.252q.096-.095.206-.176" fill="currentColor"/>\n</svg>\n\n        <span>#{title_online}</span>\n    </div>'
			);

		Lampa.Component.add("lamponline", component);

		function addButton(e) {
			if (e.render.find(".lampac--button").length) return;
			var btn = $(Lampa.Lang.translate(button));
			btn.on("hover:enter", function () {
				Lampa.Component.add("lamponline", component);

				var id = Lampa.Utils.hash(
					e.movie.number_of_seasons
						? e.movie.original_name
						: e.movie.original_title
				);
				var all = Lampa.Storage.get(
					Config.StorageKeys.ClarificationSearch,
					"{}"
				);

				Lampa.Activity.push({
					url: "",
					title: Lampa.Lang.translate("title_online"),
					component: "lamponline",
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
		Lampa.Listener.follow("full", function (e) {
			if (e.type == "complite") {
				addButton({
					render: e.object.activity.render().find(".view--torrent"),
					movie: e.data.movie
				});
			}
		});
		try {
			if (Lampa.Activity.active().component == "full") {
				addButton({
					render: Lampa.Activity.active()
						.activity.render()
						.find(".view--torrent"),
					movie: Lampa.Activity.active().card
				});
			}
		} catch (e) {
			console.error(e);
		}
		if (Lampa.Manifest.app_digital >= 177) {
			var balansers_sync = [
				"filmix",
				"filmixtv",
				"fxapi",
				"rezka",
				"rhsprem",
				"lumex",
				"videodb",
				"collaps",
				"collaps-dash",
				"hdvb",
				"zetflix",
				"kodik",
				"ashdi",
				"kinoukr",
				"kinotochka",
				"remux",
				"iframevideo",
				"cdnmovies",
				"anilibria",
				"animedia",
				"animego",
				"animevost",
				"animebesst",
				"redheadsound",
				"alloha",
				"animelib",
				"moonanime",
				"kinopub",
				"vibix",
				"vdbmovies",
				"fancdn",
				"cdnvideohub",
				"vokino",
				"rc/filmix",
				"rc/fxapi",
				"rc/rhs",
				"vcdn",
				"videocdn",
				"mirage",
				"hydraflix",
				"videasy",
				"vidsrc",
				"movpi",
				"vidlink",
				"twoembed",
				"autoembed",
				"smashystream",
				"autoembed",
				"rgshows",
				"pidtor",
				"videoseed",
				"iptvonline",
				"veoveo"
			];
			balansers_sync.forEach(function (name) {
				Lampa.Storage.sync(
					Config.StorageKeys.OnlineChoicePrefix + name,
					"object_object"
				);
			});
			Lampa.Storage.sync(Config.StorageKeys.OnlineWatchedLast, "object_object");
		}

		Lampa.Settings.listener.follow("open", function (event) {
			if (event.name == "main") {
				if (
					Lampa.Settings.main()
						.render()
						.find('[data-component="lamponline_settings"]').length == 0
				) {
					Lampa.SettingsApi.addComponent({
						component: "lamponline_settings",
						name: Lampa.Lang.translate("lampac_settings_title"),
						icon: '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M11.783 10.094c-1.699.998-3.766 1.684-5.678 1.95a1.66 1.66 0 0 1-.684.934c.512 1.093 1.249 2.087 2.139 2.987a7.98 7.98 0 0 0 6.702-3.074l.083-.119c-.244-.914-.648-1.784-1.145-2.644q-.134.038-.261.062c-.143.04-.291.068-.446.068a1.7 1.7 0 0 1-.71-.164M9.051 5.492a18 18 0 0 0-2.004-1.256 1.67 1.67 0 0 1-1.907.985c-.407 1.535-.624 3.162-.511 4.694a1.67 1.67 0 0 1 1.52 1.354c1.695-.279 3.47-.879 4.967-1.738a1.67 1.67 0 0 1-.297-.949c0-.413.156-.786.403-1.078-.654-.736-1.389-1.443-2.171-2.012M4 9.989c-.137-1.634.104-3.392.541-5.032a1.67 1.67 0 0 1-.713-1.369c0-.197.039-.386.104-.562a18 18 0 0 0-1.974-.247c-.089.104-.185.204-.269.314a7.98 7.98 0 0 0-1.23 7.547 9.5 9.5 0 0 0 2.397.666A1.67 1.67 0 0 1 4 9.989m9.928-.3c-.029.037-.064.067-.096.1.433.736.799 1.482 1.053 2.268a7.98 7.98 0 0 0 .832-6.122c-.09.133-.176.267-.271.396-.436.601-.875 1.217-1.354 1.772.045.152.076.311.076.479v.004c.084.374.013.779-.24 1.103M7.164 3.447c.799.414 1.584.898 2.33 1.44.84.611 1.627 1.373 2.324 2.164.207-.092.434-.145.676-.145.5 0 .945.225 1.252.572.404-.492.783-1.022 1.161-1.54.194-.268.372-.543.544-.82A7.96 7.96 0 0 0 7.701.012q-.173.217-.339.439c-.401.552-.739 1.08-1.04 1.637.039.029.064.066.1.1.417.276.697.734.742 1.259m-4.285 8.518a10 10 0 0 1-2.07-.487 7.95 7.95 0 0 0 5.806 4.397 11 11 0 0 1-1.753-2.66 1.675 1.675 0 0 1-1.983-1.25m1.635-9.723a1.32 1.32 0 0 1 1.199-.416C6.025 1.24 6.377.683 6.794.104a7.97 7.97 0 0 0-4.247 2.062c.59.066 1.176.14 1.761.252q.096-.095.206-.176" fill="currentColor"/></svg>'
					});
				}
				Lampa.Settings.main().update();
			}
		});

		Lampa.Params.select(STORAGE_KEY_SERVER, "", "");

		Lampa.SettingsApi.addParam({
			component: "lamponline_settings",
			param: {
				name: "lamponline_add_server_btn",
				type: "static"
			},
			field: {
				name: Lampa.Lang.translate("lampac_add_server"),
				description: Lampa.Lang.translate("lampac_server_address_desc")
			},
			onRender: function (item) {
				item.on("hover:enter", function () {
					Lampa.Input.edit(
						{
							title: Lampa.Lang.translate("lampac_server_address"),
							value: "",
							placeholder: "192.168.1.1:9118",
							nosave: true,
							free: true,
							nomic: true
						},
						function (new_value) {
							if (new_value && addServer(new_value)) {
								var servers = getServersList();
								setActiveServerIndex(servers.length - 1);
								ensureRchNws();
								Lampa.Settings.update();
							}
						}
					);
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "lamponline_settings",
			param: {
				name: "lamponline_load_public_servers_btn",
				type: "static"
			},
			field: {
				name: Lampa.Lang.translate("lampac_load_public_servers"),
				description: Lampa.Lang.translate("lampac_load_public_servers_desc")
			},
			onRender: function (item) {
				item.on("hover:enter", function () {
					loadPublicServers();
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "lamponline_settings",
			param: {
				name: "lamponline_servers_title",
				type: "title"
			},
			field: {
				name: Lampa.Lang.translate("lampac_servers_list")
			}
		});

		Lampa.Settings.listener.follow("open", function (event) {
			if (event.name == "lamponline_settings") {
				renderServersList(event.body);
			}
		});
	}

	function renderServersList(body) {
		body.find(".lamponline-server-item").remove();

		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var titleElem = body.find(".settings-param-title").last();

		if (!titleElem.length) {
			titleElem = body.find(".settings-param").last();
		}

		servers.forEach(function (server, index) {
			var displayName = formatServerDisplay(server);
			var isActive = index === activeIndex;
			var item = $(
				'<div class="settings-param selector lamponline-server-item" data-server-index="' +
					index +
					'">' +
					'<div class="settings-param__name">' +
					displayName +
					"</div>" +
					'<div class="settings-param__value"></div>' +
					(isActive
						? '<div class="settings-param__descr">Текущий сервер</div>'
						: "") +
					"</div>"
			);

			item.on("hover:enter", function () {
				showServerActions(index, displayName, function () {
					renderServersList(body);
				});
			});

			titleElem.after(item);
			titleElem = item;
		});

		if (servers.length === 0) {
			var emptyItem = $(
				'<div class="settings-param lamponline-server-item">' +
					'<div class="settings-param__name" style="opacity: 0.5">' +
					Lampa.Lang.translate("lampac_not_set") +
					"</div>" +
					"</div>"
			);
			titleElem.after(emptyItem);
		}

		Lampa.Controller.collectionSet(body);
		Lampa.Controller.collectionFocus(false, body);
	}

	function editServer(index, newUrl) {
		var servers = getServersList();
		if (index >= 0 && index < servers.length && newUrl) {
			var oldUrl = servers[index];
			servers[index] = newUrl;
			Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
			var oldServer = Lampa.Storage.get(STORAGE_KEY_SERVER, "");
			if (oldServer === oldUrl) {
				Lampa.Storage.set(STORAGE_KEY_SERVER, newUrl);
			}
			return true;
		}
		return false;
	}

	function showServerActions(index, serverName, callback) {
		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var isActive = index === activeIndex;

		var items = [];

		if (!isActive) {
			items.push({
				title: Lampa.Lang.translate("lampac_select_this"),
				select: true
			});
		}

		items.push({
			title: Lampa.Lang.translate("lampac_edit_server"),
			edit: true
		});

		items.push({
			title: Lampa.Lang.translate("lampac_delete_server"),
			remove: true
		});

		var enabled = Lampa.Controller.enabled().name;

		Lampa.Select.show({
			title: serverName,
			items: items,
			onBack: function () {
				Lampa.Controller.toggle(enabled);
			},
			onSelect: function (item) {
				if (item.select) {
					setActiveServerIndex(index);
					ensureRchNws();
					Lampa.Controller.toggle(enabled);
					if (callback) callback();
				} else if (item.edit) {
					Lampa.Input.edit(
						{
							title: Lampa.Lang.translate("lampac_server_address"),
							value: servers[index],
							placeholder: "192.168.1.1:9118",
							nosave: true,
							free: true,
							nomic: true
						},
						function (new_value) {
							if (new_value && new_value !== servers[index]) {
								editServer(index, new_value);
								ensureRchNws();
							}
							Lampa.Controller.toggle(enabled);
							if (callback) callback();
						}
					);
				} else if (item.remove) {
					removeServer(index);
					Lampa.Controller.toggle(enabled);
					if (callback) callback();
				}
			}
		});
	}

	function openServerInput(callback) {
		Lampa.Input.edit(
			{
				title: Lampa.Lang.translate("lampac_server_address"),
				value: "",
				placeholder: "192.168.1.1:9118",
				nosave: true,
				free: true,
				nomic: true
			},
			function (new_value) {
				if (new_value) {
					addServer(new_value);
					var servers = getServersList();
					setActiveServerIndex(servers.length - 1);
					ensureRchNws();
				}
				if (callback) callback(new_value);
				else if (new_value) {
					Lampa.Activity.replace();
				}
			}
		);
	}

	function openServerSelect(callback) {
		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var items = [];

		servers.forEach(function (server, index) {
			items.push({
				title: formatServerDisplay(server),
				index: index,
				selected: index === activeIndex
			});
		});

		items.push({
			title: Lampa.Lang.translate("lampac_add_server"),
			add: true
		});

		var enabled = Lampa.Controller.enabled().name;

		Lampa.Select.show({
			title: Lampa.Lang.translate("lampac_select_server"),
			items: items,
			onBack: function () {
				Lampa.Controller.toggle(enabled);
			},
			onSelect: function (item) {
				if (item.add) {
					openServerInput(function (new_value) {
						if (callback) callback();
						Lampa.Controller.toggle(enabled);
						if (new_value) Lampa.Activity.replace();
					});
				} else if (item.selected) {
					var displayName = formatServerDisplay(servers[item.index]);
					Lampa.Select.show({
						title: displayName,
						items: [
							{
								title: Lampa.Lang.translate("lampac_edit_server"),
								edit: true
							},
							{
								title: Lampa.Lang.translate("lampac_delete_server"),
								remove: true
							}
						],
						onBack: function () {
							Lampa.Controller.toggle(enabled);
							if (callback) callback();
						},
						onSelect: function (a) {
							if (a.edit) {
								Lampa.Input.edit(
									{
										title: Lampa.Lang.translate("lampac_server_address"),
										value: servers[item.index],
										placeholder: "192.168.1.1:9118",
										nosave: true,
										free: true,
										nomic: true
									},
									function (new_value) {
										if (new_value && new_value !== servers[item.index]) {
											editServer(item.index, new_value);
											ensureRchNws();
										}
										Lampa.Controller.toggle(enabled);
										if (callback) callback();
									}
								);
							} else if (a.remove) {
								removeServer(item.index);
								if (callback) callback();
								Lampa.Controller.toggle(enabled);
								Lampa.Activity.replace();
							}
						}
					});
				} else {
					setActiveServerIndex(item.index);
					ensureRchNws();
					if (callback) callback();
					Lampa.Controller.toggle(enabled);
					Lampa.Activity.replace();
				}
			}
		});
	}

	function openServerMenu(callback) {
		openServerSelect(callback);
	}

	function checkServerAvailability(serverUrl, callback) {
		var baseUrl = serverUrl.replace(/\/+$/, "");
		var checkUrl =
			baseUrl +
			"/lite/events?life=true&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar: The Way of Water&original_title=Avatar: The Way of Water&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest&device_id=";
		var attempts = 0;
		var maxAttempts = 15;
		var memkey = "";

		function checkForMirage(sources) {
			for (var i = 0; i < sources.length; i++) {
				var src = sources[i];
				var name = (src.balanser || src.name || "").toLowerCase();
				if (name.indexOf("mirage") !== -1 || name.indexOf("alloha") !== -1) {
					return true;
				}
			}
			return false;
		}

		function poll() {
			var net = new Lampa.Reguest();
			net.timeout(5000);
			var url = memkey
				? baseUrl +
					"/lifeevents?memkey=" +
					memkey +
					"&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar: The Way of Water&original_title=Avatar: The Way of Water&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest&device_id="
				: checkUrl;
			net.silent(
				url,
				function (json) {
					var sources =
						json && json.online
							? json.online
							: Lampa.Arrays.isArray(json)
								? json
								: [];
					if (json && json.accsdb) {
						callback(false);
						return;
					}
					if (json && json.memkey) {
						memkey = json.memkey;
					}
					if (json && json.ready) {
						callback(checkForMirage(sources));
						return;
					}
					attempts++;
					if (attempts >= maxAttempts) {
						callback(checkForMirage(sources));
					} else {
						setTimeout(poll, 1000);
					}
				},
				function () {
					callback(false);
				}
			);
		}

		poll();
	}

	var STORAGE_KEY_PUBLIC_SERVERS_CACHE = "lamponline_public_servers_cache";

	function getCachedPublicServers() {
		var cached = Lampa.Storage.get(STORAGE_KEY_PUBLIC_SERVERS_CACHE, []);
		if (typeof cached === "string") {
			try {
				cached = JSON.parse(cached);
			} catch (e) {
				cached = [];
			}
		}
		return Lampa.Arrays.isArray(cached) ? cached : [];
	}

	function setCachedPublicServers(servers) {
		Lampa.Storage.set(STORAGE_KEY_PUBLIC_SERVERS_CACHE, servers);
	}

	function showPublicServersMenu(workingServers, enabled) {
		var items = [];
		var userServers = getServersList();

		function normalizeUrl(url) {
			return url
				.replace(/^https?:\/\//, "")
				.replace(/\/+$/, "")
				.toLowerCase();
		}

		var normalizedUserServers = userServers.map(normalizeUrl);

		items.push({
			title: Lampa.Lang.translate("lampac_refresh_servers"),
			refresh: true
		});

		items.push({
			title: Lampa.Lang.translate("lampac_public_servers"),
			separator: true
		});

		workingServers.forEach(function (url) {
			var normalizedUrl = normalizeUrl(url);
			var isAdded = normalizedUserServers.indexOf(normalizedUrl) !== -1;
			items.push({
				title: formatServerDisplay(url),
				url: url,
				subtitle: isAdded
					? Lampa.Lang.translate("lampac_server_already_added")
					: ""
			});
		});

		Lampa.Select.show({
			title:
				Lampa.Lang.translate("lampac_select_public_server") +
				" (" +
				workingServers.length +
				")",
			items: items,
			onBack: function () {
				Lampa.Controller.toggle(enabled);
			},
			onSelect: function (item) {
				if (item.separator) return;

				if (item.refresh) {
					Lampa.Select.close();
					fetchAndCheckPublicServers(enabled, true);
					return;
				}

				if (addServer(item.url)) {
					var servers = getServersList();
					setActiveServerIndex(servers.length - 1);
					ensureRchNws();
					Lampa.Settings.update();
				} else {
					var servers = getServersList();
					var idx = servers.indexOf(item.url);
					if (idx !== -1) {
						setActiveServerIndex(idx);
						ensureRchNws();
						Lampa.Settings.update();
					}
				}
				Lampa.Controller.toggle(enabled);
			}
		});
	}

	function fetchAndCheckPublicServers(enabled, forceRefresh) {
		Lampa.Noty.show(Lampa.Lang.translate("lampac_loading"));

		var network = new Lampa.Reguest();
		network.timeout(10000);
		network.silent(
			"https://ipavlin98.github.io/lampac-links/working_online_lampa.json",
			function (json) {
				if (!Lampa.Arrays.isArray(json) || json.length === 0) {
					Lampa.Noty.show(Lampa.Lang.translate("lampac_no_servers_found"));
					return;
				}

				var serversToCheck = [];
				var serverCountryMap = {};
				json.forEach(function (server) {
					if (server.base_url) {
						serversToCheck.push(server.base_url);
						if (server.country) {
							serverCountryMap[server.base_url] = server.country;
						}
					}
				});

				if (serversToCheck.length === 0) {
					Lampa.Noty.show(Lampa.Lang.translate("lampac_no_servers_found"));
					return;
				}

				var workingServers = [];
				var checked = 0;
				var total = serversToCheck.length;
				var notyInterval;

				function updateNoty() {
					Lampa.Noty.show(
						Lampa.Lang.translate("lampac_checking_servers") +
							" " +
							checked +
							"/" +
							total
					);
				}

				updateNoty();
				notyInterval = setInterval(updateNoty, 2000);

				serversToCheck.forEach(function (serverUrl) {
					checkServerAvailability(serverUrl, function (isWorking) {
						checked++;
						if (isWorking) {
							workingServers.push(serverUrl);
							if (serverCountryMap[serverUrl]) {
								setServerCountry(serverUrl, serverCountryMap[serverUrl]);
							}
						}

						updateNoty();

						if (checked === total) {
							clearInterval(notyInterval);

							if (workingServers.length === 0) {
								Lampa.Noty.show(
									Lampa.Lang.translate("lampac_no_working_servers")
								);
								return;
							}

							setCachedPublicServers(workingServers);
							showPublicServersMenu(workingServers, enabled);
						}
					});
				});
			},
			function (e) {
				console.error(e);
				Lampa.Noty.show(Lampa.Lang.translate("lampac_load_error"));
			}
		);
	}

	function loadPublicServers() {
		var enabled = Lampa.Controller.enabled().name;
		var cached = getCachedPublicServers();

		if (cached.length > 0) {
			showPublicServersMenu(cached, enabled);
		} else {
			fetchAndCheckPublicServers(enabled, false);
		}
	}

	if (!window.lamponline_plugin) startPlugin();

	function initBalanserInFilterMenu() {
		if (window.lamponline_src_filter_plugin) {
			return;
		}

		window.lamponline_src_filter_plugin = true;

		Lampa.Controller.listener.follow("toggle", function (event) {
			if (event.name !== "select") {
				return;
			}

			var active = Lampa.Activity.active();

			if (
				!active ||
				!active.component ||
				active.component.toLowerCase() !== "lamponline"
			) {
				return;
			}

			var $filterTitle = $(".selectbox__title");

			if (
				$filterTitle.length !== 1 ||
				$filterTitle.text() !== Lampa.Lang.translate("title_filter")
			) {
				return;
			}

			var $sourceBtn = $(".simple-button--filter.filter--sort");

			if ($sourceBtn.length !== 1 || $sourceBtn.hasClass("hide")) {
				return;
			}

			if ($(".selectbox-item[data-lamponline-source]").length > 0) {
				return;
			}

			var $serverBtn = $(".simple-button--filter.filter--server");

			var $selectBoxItem = Lampa.Template.get("selectbox_item", {
				title: Lampa.Lang.translate("settings_rest_source"),
				subtitle: $("div", $sourceBtn).text()
			});

			$selectBoxItem.attr("data-lamponline-source", "true");

			$selectBoxItem.on("hover:enter", function () {
				$sourceBtn.trigger("hover:enter");
			});

			$(".selectbox-item").first().after($selectBoxItem);

			if ($serverBtn.length === 1 && !$serverBtn.hasClass("hide")) {
				var $serverSelectBoxItem = Lampa.Template.get("selectbox_item", {
					title: Lampa.Lang.translate("lampac_server_short"),
					subtitle: $("div", $serverBtn).text()
				});

				$serverSelectBoxItem.attr("data-lamponline-server", "true");

				$serverSelectBoxItem.on("hover:enter", function () {
					Lampa.Select.close();
					$serverBtn.trigger("hover:enter");
				});

				$(".selectbox-item").first().after($serverSelectBoxItem);
			}

			Lampa.Controller.collectionSet(
				$("body > .selectbox").find(".scroll__body")
			);
		});
	}

	if (window.appready) {
		initBalanserInFilterMenu();
	} else {
		Lampa.Listener.follow("app", function (event) {
			if (event.type === "ready") {
				initBalanserInFilterMenu();
			}
		});
	}
})();
