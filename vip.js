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
				var last_select_balanser = Lampa.St

