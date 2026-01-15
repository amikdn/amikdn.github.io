(function () {
	"use strict";

	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);
		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);
			if (enumerableOnly) {
				symbols = symbols.filter(function (sym) {
					return Object.getOwnPropertyDescriptor(object, sym).enumerable;
				});
			}
			keys.push.apply(keys, symbols);
		}
		return keys;
	}

	function objectSpread(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i] ?? {};
			if (i % 2) {
				ownKeys(Object(source), true).forEach(function (key) {
					defineProperty(target, key, source[key]);
				});
			} else if (Object.getOwnPropertyDescriptors) {
				Object.defineProperties(
					target,
					Object.getOwnPropertyDescriptors(source)
				);
			} else {
				ownKeys(Object(source)).forEach(function (key) {
					Object.defineProperty(
						target,
						key,
						Object.getOwnPropertyDescriptor(source, key)
					);
				});
			}
		}
		return target;
	}

	function classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) {
				descriptor.writable = true;
			}
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function createClass(Constructor, protoProps, staticProps) {
		if (protoProps) {
			defineProperties(Constructor.prototype, protoProps);
		}
		if (staticProps) {
			defineProperties(Constructor, staticProps);
		}
		Object.defineProperty(Constructor, "prototype", {
			writable: false
		});
		return Constructor;
	}

	function defineProperty(obj, key, value) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
		} else {
			obj[key] = value;
		}
		return obj;
	}

	var VoiceStorage = (function () {
		function VoiceStorage(data) {
			classCallCheck(this, VoiceStorage);
			this.hash = Lampa.Utils.hash(data.movie.original_title);
			this.field = "online_selected_voice";
		}
		createClass(VoiceStorage, [
			{
				key: "get",
				value: function get() {
					return Lampa.Storage.get(this.field, "{}")[this.hash] || "";
				}
			},
			{
				key: "set",
				value: function set(voiceName) {
					var storage = Lampa.Storage.get(this.field, "{}");
					storage[this.hash] = voiceName;
					Lampa.Storage.set(this.field, storage);
				}
			}
		]);
		return VoiceStorage;
	})();

	function AsyncWorker(totalNeeded) {
		this.data = {};
		this.work = 0;
		this.need = totalNeeded;
		this.complited = false;
		this.check = function () {
			if (this.stopped) {
				return;
			}
			if (this.work >= this.need && !this.complited) {
				this.complited = true;
				this.onComplite(this.data);
			}
		};
		this.next = function () {
			this.work++;
			this.check();
		};
		this.append = function (key, value) {
			this.work++;
			this.data[key] = value;
			this.check();
		};
		this.error = function () {
			this.work++;
			this.check();
		};
		this.stop = function () {
			this.stopped = true;
		};
	}

	var TvmazeHelper = {
		cache: {},
		pending: {},

		getCache: function () {
			if (window.SEASON_FIX && window.SEASON_FIX.tvmaze_cache) {
				return window.SEASON_FIX.tvmaze_cache;
			}
			return this.cache;
		},

		getSeasonsCount: function (tvId) {
			var cache = this.getCache();
			var data = cache[tvId];
			if (data && typeof data === "object" && Object.keys(data).length > 0) {
				return Object.keys(data).length;
			}
			return null;
		},

		fetch: function (tvId, imdbId, tvdbId, callback) {
			var _this = this;
			var cache = this.getCache();

			if (cache[tvId] && typeof cache[tvId] === "object") {
				if (callback) callback(Object.keys(cache[tvId]).length);
				return;
			}

			if (cache[tvId] === "loading" || this.pending[tvId]) {
				if (callback) {
					if (!this.pending[tvId]) this.pending[tvId] = [];
					this.pending[tvId].push(callback);
				}
				return;
			}

			cache[tvId] = "loading";
			if (callback) {
				this.pending[tvId] = [callback];
			}

			var lookupId = imdbId || tvdbId;
			var lookupType = imdbId ? "imdb" : "thetvdb";

			if (!lookupId) {
				this.fetchExternalIds(tvId, function (ids) {
					if (ids && (ids.imdb_id || ids.tvdb_id)) {
						_this.fetchFromTvmaze(tvId, ids.imdb_id, ids.tvdb_id);
					} else {
						_this.finishPending(tvId, null);
					}
				});
			} else {
				this.fetchFromTvmaze(tvId, imdbId, tvdbId);
			}
		},

		fetchExternalIds: function (tvId, callback) {
			var apiKey = Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : null;
			if (!apiKey) {
				callback(null);
				return;
			}

			var url =
				Lampa.TMDB && Lampa.TMDB.api
					? Lampa.TMDB.api("tv/" + tvId + "/external_ids?api_key=" + apiKey)
					: "https://api.themoviedb.org/3/tv/" +
						tvId +
						"/external_ids?api_key=" +
						apiKey;

			this.request(url, callback);
		},

		fetchFromTvmaze: function (tvId, imdbId, tvdbId) {
			var _this = this;
			var lookupId = imdbId || tvdbId;
			var lookupType = imdbId ? "imdb" : "thetvdb";

			if (!lookupId) {
				this.finishPending(tvId, null);
				return;
			}

			var lookupUrl =
				"https://api.tvmaze.com/lookup/shows?" + lookupType + "=" + lookupId;

			this.request(lookupUrl, function (showData) {
				if (!showData || !showData.id) {
					_this.finishPending(tvId, null);
					return;
				}

				var episodesUrl =
					"https://api.tvmaze.com/shows/" + showData.id + "/episodes";

				_this.request(episodesUrl, function (episodes) {
					if (!episodes || !episodes.length) {
						_this.finishPending(tvId, null);
						return;
					}

					var map = {};
					for (var i = 0; i < episodes.length; i++) {
						var s = episodes[i].season;
						if (!map[s]) map[s] = 0;
						map[s]++;
					}

					var cache = _this.getCache();
					if (Object.keys(map).length > 0) {
						cache[tvId] = map;
						_this.finishPending(tvId, Object.keys(map).length);
					} else {
						delete cache[tvId];
						_this.finishPending(tvId, null);
					}
				});
			});
		},

		finishPending: function (tvId, count) {
			var cache = this.getCache();
			if (cache[tvId] === "loading") {
				delete cache[tvId];
			}

			var callbacks = this.pending[tvId];
			delete this.pending[tvId];

			if (callbacks && callbacks.length) {
				callbacks.forEach(function (cb) {
					cb(count);
				});
			}
		},

		request: function (url, callback) {
			var network = new Lampa.Reguest();
			network.timeout(10000);

			var isTmdb =
				url.indexOf("themoviedb.org") !== -1 || url.indexOf("apitmdb.") !== -1;

			var success = function (data) {
				callback(data);
			};

			var error = function () {
				callback(null);
			};

			if (isTmdb) {
				network.silent(url, success, error);
			} else {
				network["native"](url, success, error);
			}
		}
	};

	var voiceList = [
		"Анастасия Гайдаржи + Андрей Юрченко",
		"Студии Суверенного Лепрозория",
		"IgVin &amp; Solncekleshka",
		"Студия Пиратского Дубляжа",
		"Gremlin Creative Studio",
		"Alternative Production",
		"Bubble Dubbing Company",
		"HelloMickey Production",
		"Н.Севастьянов seva1988",
		"XDUB Dorama + Колобок",
		"Мобильное телевидение",
		"СПД - Сладкая парочка",
		"BBC Saint-Petersburg",
		"Black Street Records",
		"Intra Communications",
		"Melodic Voice Studio",
		"Selena International",
		"Voice Project Studio",
		"Несмертельное оружие",
		"Петербургский дубляж",
		"Asian Miracle Group",
		"Lizard Cinema Trade",
		"National Geographic",
		"Studio Victory Аsia",
		"True Dubbing Studio",
		"Позитив-Мультимедиа",
		"Премьер Мультимедиа",
		"Уолт Дисней Компани",
		"Family Fan Edition",
		"Paramount Pictures",
		"Parovoz Production",
		"Shadow Dub Project",
		"The Kitchen Russia",
		"Zone Vision Studio",
		"Анастасия Гайдаржи",
		"Иванова и П. Пашут",
		"Малиновский Сергей",
		"Так Треба Продакшн",
		"Back Board Cinema",
		"Paramount Channel",
		"Project Web Mania",
		"RedDiamond Studio",
		"Universal Channel",
		"Zoomvision Studio",
		"НеЗупиняйПродакшн",
		"Селена Интернешнл",
		"Студия «Стартрек»",
		"Хихикающий доктор",
		"Четыре в квадрате",
		"Brain Production",
		"Cowabunga Studio",
		"Lucky Production",
		"MC Entertainment",
		"Paramount Comedy",
		"Universal Russia",
		"Анатолий Ашмарин",
		"Андрей Питерский",
		"Васька Куролесов",
		"Екатеринбург Арт",
		"Квадрат Малевича",
		"Первый канал ОРТ",
		"Реальный перевод",
		"Русский Репортаж",
		"Сolumbia Service",
		"Amazing Dubbing",
		"AnimeSpace Team",
		"Cartoon Network",
		"Cinema Prestige",
		"CinemaSET GROUP",
		"DeadLine Studio",
		"DeeAFilm Studio",
		"GreenРай Studio",
		"New Dream Media",
		"Sunshine Studio",
		"Volume-6 Studio",
		"XvidClub Studio",
		"Антонов Николай",
		"Воробьев Сергей",
		"Денис Шадинский",
		"З Ранку До Ночі",
		"Максим Логинофф",
		"Николай Дроздов",
		"Студия Горького",
		"Студийная банда",
		"Ульпаней Эльром",
		"Agatha Studdio",
		"Anything-group",
		"CrazyCatStudio",
		"Creative Sound",
		"DIVA Universal",
		"Garsu Pasaulis",
		"GoodTime Media",
		"Goodtime Media",
		"Hamster Studio",
		"Horizon Studio",
		"Jakob Bellmann",
		"Julia Prosenuk",
		"KosharaSerials",
		"Kulzvuk Studio",
		"Mallorn Studio",
		"Red Head Sound",
		"RedRussian1337",
		"SovetRomantica",
		"SunshineStudio",
		"Syfy Universal",
		"TUMBLER Studio",
		"Viasat History",
		"visanti-vasaer",
		"Анатолий Гусев",
		"Вартан Дохалов",
		"Витя «говорун»",
		"Кирдин | Stalk",
		"Л. Володарский",
		"Леша Прапорщик",
		"Максим Жолобов",
		"Медиа-Комплекс",
		"Прайд Продакшн",
		"Русский дубляж",
		"Союзмультфильм",
		"Студия Колобок",
		"5-й канал СПб",
		"ARRU Workshop",
		"Arasi project",
		"Banyan Studio",
		"Bars MacAdams",
		"Bonsai Studio",
		"Byako Records",
		"Dream Records",
		"FiliZa Studio",
		"Filiza Studio",
		"Film Prestige",
		"Flarrow Films",
		"Gezell Studio",
		"Greb&Creative",
		"HamsterStudio",
		"Jetvis Studio",
		"LE-Production",
		"Lizard Cinema",
		"Nazel & Freya",
		"PCB Translate",
		"Rainbow World",
		"Renegade Team",
		"SHIZA Project",
		"Sci-Fi Russia",
		"Amanogawa",
		"The Mike Rec.",
		"VIP Serial HD",
		"VO-Production",
		"VO-production",
		"Victory-Films",
		"ViruseProject",
		"Voice Project",
		"Vulpes Vulpes",
		"АРК-ТВ Studio",
		"Видеопродакшн",
		"Мадлен Дюваль",
		"Мика Бондарик",
		"Наталья Гурзо",
		"Премьер Видео",
		"Семыкина Юлия",
		"Старый Бильбо",
		"Трамвай-фильм",
		"Фортуна-Фильм",
		"Хоррор Мэйкер",
		"Храм Дорам ТВ",
		"Штамп Дмитрий",
		"A. Lazarchuk",
		"AlphaProject",
		"AniLibria.TV",
		"AnimeReactor",
		"Animereactor",
		"BadCatStudio",
		"DreamRecords",
		"General Film",
		"HaseRiLLoPaW",
		"Horror Maker",
		"Ivnet Cinema",
		"Korean Craze",
		"Light Breeze",
		"Mystery Film",
		"Oneinchnales",
		"Profix Media",
		"Psychotronic",
		"RG Paravozik",
		"RG.Paravozik",
		"RussianGuy27",
		"Sony Channel",
		"Train Studio",
		"Trdlo.studio",
		"ViP Premiere",
		"VictoryFilms",
		"VulpesVulpes",
		"Wayland team",
		"sweet couple",
		"Альтера Парс",
		"Видеоимпульс",
		"Гей Кино Гид",
		"Говинда Рага",
		"Деваль Видео",
		"Е. Хрусталёв",
		"К. Поздняков",
		"Кармен Видео",
		"Кинопремьера",
		"Кирилл Сагач",
		"КонтентикOFF",
		"Кубик в Кубе",
		"Кураж-Бамбей",
		"Мьюзик-трейд",
		"Н. Золотухин",
		"Не требуется",
		"Новый Дубляж",
		"Нурмухаметов",
		"Оригинальный",
		"Первый канал",
		"Р. Янкелевич",
		"С. Кузьмичёв",
		"С. Щегольков",
		"Сергей Дидок",
		"Синема Трейд",
		"Синта Рурони",
		"Студия Райдо",
		"Тоникс Медиа",
		"Точка Zрения",
		"Фильмэкспорт",
		"Элегия фильм",
		"1001 cinema",
		"BTI Studios",
		"Cactus Team",
		"CrezaStudio",
		"Crunchyroll",
		"DVD Classic",
		"Description",
		"Eurochannel",
		"FocusStudio",
		"Franek Monk",
		"Gala Voices",
		"Gears Media",
		"GladiolusTV",
		"Gold Cinema",
		"Good People",
		"HiWay Grope",
		"Inter Video",
		"JWA Project",
		"Lazer Video",
		"Max Nabokov",
		"NEON Studio",
		"Neoclassica",
		"New Records",
		"Nickelodeon",
		"Nika Lenina",
		"Oghra-Brown",
		"Paul Bunyan",
		"Rebel Voice",
		"RecentFilms",
		"RiZZ_fisher",
		"Saint Sound",
		"SakuraNight",
		"SnowRecords",
		"Sony Sci-Fi",
		"Sound-Group",
		"StudioFilms",
		"TF-AniGroup",
		"TrainStudio",
		"XDUB Dorama",
		"Zone Studio",
		"Zone Vision",
		"hungry_inri",
		"Варус Видео",
		"Варус-Видео",
		"Видеосервис",
		"Володарский",
		"Г. Либергал",
		"Г. Румянцев",
		"Другое кино",
		"Е. Гаевский",
		"Завгородний",
		"И. Сафронов",
		"И. Степанов",
		"Кенс Матвей",
		"КураСгречей",
		"Лазер Видео",
		"Малиновский",
		"Мастер Тэйп",
		"Неоклассика",
		"Новый Канал",
		"Огородников",
		"Петербуржец",
		"Прямостанов",
		"С. Визгунов",
		"С. Кузнецов",
		"Севастьянов",
		"Студия Трёх",
		"Цікава Ідея",
		"Эй Би Видео",
		"Я. Беллманн",
		"1001cinema",
		"1WinStudio",
		"AXN Sci-Fi",
		"AimaksaLTV",
		"Animegroup",
		"ApofysTeam",
		"AvePremier",
		"BraveSound",
		"CP Digital",
		"CactusTeam",
		"CinemaTone",
		"Contentica",
		"CoralMedia",
		"DniproFilm",
		"ELEKTRI4KA",
		"East Dream",
		"Fox Russia",
		"HiWayGrope",
		"LevshaFilm",
		"MaxMeister",
		"Mega-Anime",
		"MifSnaiper",
		"NewStation",
		"Nice-Media",
		"Pazl Voice",
		"PiratVoice",
		"Postmodern",
		"Rain Death",
		"Reanimedia",
		"Shachiburi",
		"SilverSnow",
		"Sky Voices",
		"SkyeFilmTV",
		"Sony Turbo",
		"Sound Film",
		"StudioBand",
		"TatamiFilm",
		"VGM Studio",
		"VSI Moscow",
		"VoicePower",
		"West Video",
		"W³: voices",
		"eraserhead",
		"Б. Федоров",
		"Бусов Глеб",
		"Ващенко С.",
		"Глуховский",
		"Держиморда",
		"Е. Гранкин",
		"И. Еремеев",
		"Интерфильм",
		"Инфо-фильм",
		"К. Филонов",
		"Карповский",
		"Комедия ТВ",
		"Костюкевич",
		"Мост Видео",
		"Мост-Видео",
		"Н. Антонов",
		"Н. Дроздов",
		"Новый диск",
		"Ох! Студия",
		"Первый ТВЧ",
		"Переводман",
		"С. Казаков",
		"С. Лебедев",
		"С. Макашов",
		"Саня Белый",
		"Союз Видео",
		"Студия NLS",
		"Т.О Друзей",
		"ТВ XXI век",
		"Толстобров",
		"Хуан Рохас",
		"Электричка",
		"Ю. Немахов",
		"диктор CDV",
		"3df voice",
		"AAA-Sound",
		"Andre1288",
		"AniLibria",
		"AniPLague",
		"Astana TV",
		"AveBrasil",
		"AveDorama",
		"BeniAffet",
		"CBS Drama",
		"CLS Media",
		"CasStudio",
		"Discovery",
		"DoubleRec",
		"Epic Team",
		"FanStudio",
		"FilmsClub",
		"Flux-Team",
		"Fox Crime",
		"GREEN TEA",
		"Ghostface",
		"GoodVideo",
		"Gramalant",
		"HighHopes",
		"INTERFILM",
		"JoyStudio",
		"KinoGolos",
		"Kinomania",
		"Kobayashi",
		"LakeFilms",
		"Neo-Sound",
		"NewComers",
		"NewStudio",
		"No-Future",
		"Novamedia",
		"OnisFilms",
		"Persona99",
		"RATTLEBOX",
		"RainDeath",
		"Red Media",
		"SDI Media",
		"SOLDLUCK2",
		"Sawyer888",
		"Sedorelli",
		"Seoul Bay",
		"Sephiroth",
		"ShinkaDan",
		"SmallFilm",
		"SpaceDust",
		"Timecraft",
		"Total DVD",
		"VIZ Media",
		"Video-BIZ",
		"Videogram",
		"fiendover",
		"turok1990",
		"ААА-sound",
		"Амальгама",
		"АрхиТеатр",
		"Васильцев",
		"Весельчак",
		"Видеобаза",
		"Воротилин",
		"Григорьев",
		"Деньщиков",
		"ЕА Синема",
		"Зереницын",
		"Золотухин",
		"И. Клушин",
		"Имидж-Арт",
		"Карапетян",
		"Киномания",
		"Кириллица",
		"Машинский",
		"Мительман",
		"Муравский",
		"Невафильм",
		"Останкино",
		"Причудики",
		"Рыжий пес",
		"С. Дьяков",
		"СВ Студия",
		"СВ-Студия",
		"Самарский",
		"Синема УС",
		"Советский",
		"Солодухин",
		"ТО Друзей",
		"Формат AB",
		"Хрусталев",
		"Шадинский",
		"Ю. Сербин",
		"Ю. Товбин",
		"Янкелевич",
		"AB-Video",
		"ALEKS KV",
		"ANIvoice",
		"AdiSound",
		"AlexFilm",
		"Amalgama",
		"AniMaunt",
		"AniMedia",
		"Animedub",
		"AuraFilm",
		"AzOnFilm",
		"Barin101",
		"ClubFATE",
		"ColdFilm",
		"DeadLine",
		"DexterTV",
		"Extrabit",
		"FilmGate",
		"Fox Life",
		"Foxlight",
		"GetSmart",
		"GoldTeam",
		"GostFilm",
		"Gravi-TV",
		"Hallmark",
		"IdeaFilm",
		"ImageArt",
		"JeFerSon",
		"Jimmy J.",
		"Kerems13",
		"KinoView",
		"Loginoff",
		"LostFilm",
		"MOYGOLOS",
		"Marclail",
		"Milirina",
		"MiraiDub",
		"Murzilka",
		"NovaFilm",
		"OMSKBIRD",
		"Omskbird",
		"Radamant",
		"RealFake",
		"RoxMarty",
		"STEPonee",
		"SorzTeam",
		"Superbit",
		"TurkStar",
		"Ultradox",
		"VashMax2",
		"VendettA",
		"VideoBIZ",
		"WestFilm",
		"XL Media",
		"kubik&ko",
		"metalrus",
		"st.Elrom",
		"Алексеев",
		"Артемьев",
		"АрхиАзия",
		"Бахурани",
		"Бессонов",
		"Васильев",
		"Визгунов",
		"Войсовер",
		"Воронцов",
		"Гаврилов",
		"Гаевский",
		"Горчаков",
		"Дольский",
		"Домашний",
		"Дубровин",
		"Дьяконов",
		"Е. Лурье",
		"Е. Рудой",
		"Журавлев",
		"Заугаров",
		"Индия ТВ",
		"Ист-Вест",
		"Карусель",
		"Кинолюкс",
		"Кузнецов",
		"ЛанселаП",
		"Лексикон",
		"Ленфильм",
		"Либергал",
		"Логинофф",
		"Марченко",
		"Махонько",
		"Медведев",
		"Мельница",
		"Мосфильм",
		"Нарышкин",
		"Оверлорд",
		"Оригинал",
		"Пирамида",
		"С. Рябов",
		"СВ-Дубль",
		"Савченко",
		"Субтитры",
		"Супербит",
		"Тимофеев",
		"Толмачев",
		"Хлопушка",
		"Ю. Живов",
		"5 канал",
		"Amalgam",
		"AniFilm",
		"AniStar",
		"AniWayt",
		"Anifilm",
		"Anistar",
		"AnyFilm",
		"AveTurk",
		"BadBajo",
		"BaibaKo",
		"BukeDub",
		"DeadSno",
		"ELYSIUM",
		"Eladiel",
		"Elysium",
		"F-TRAIN",
		"FireDub",
		"FoxLife",
		"HDrezka",
		"Hamster",
		"Janetta",
		"Jaskier",
		"Kолобок",
		"LeDoyen",
		"Levelin",
		"Liga HQ",
		"Lord32x",
		"MUZOBOZ",
		"Macross",
		"McElroy",
		"MixFilm",
		"NemFilm",
		"Netflix",
		"Octopus",
		"Onibaku",
		"OpenDub",
		"Paradox",
		"PashaUp",
		"RUSCICO",
		"RusFilm",
		"SOFTBOX",
		"Sam2007",
		"SesDizi",
		"ShowJet",
		"SoftBox",
		"SomeWax",
		"TV 1000",
		"TVShows",
		"To4kaTV",
		"Trina_D",
		"Twister",
		"Urasiko",
		"VicTeam",
		"Wakanim",
		"ZM-SHOW",
		"ZM-Show",
		"datynet",
		"lord666",
		"sf@irat",
		"Абдулов",
		"Багичев",
		"Бибиков",
		"Ващенко",
		"Герусов",
		"Данилов",
		"Дасевич",
		"Дохалов",
		"Кипарис",
		"Клюквин",
		"Колобок",
		"Королев",
		"Королёв",
		"Латышев",
		"Люсьена",
		"Матвеев",
		"Михалев",
		"Морозов",
		"Назаров",
		"Немахов",
		"Никитин",
		"Омикрон",
		"Ошурков",
		"Парадиз",
		"Пепелац",
		"Пифагор",
		"Позитив",
		"Пятница",
		"РуФилмс",
		"Рутилов",
		"СВ-Кадр",
		"Синхрон",
		"Смирнов",
		"Сокуров",
		"Сонотек",
		"Сонькин",
		"Сыендук",
		"Филонов",
		"Хихидок",
		"Яковлев",
		"Яроцкий",
		"заКАДРЫ",
		"100 ТВ",
		"4u2ges",
		"Alezan",
		"Amedia",
		"Ancord",
		"AniDUB",
		"Anubis",
		"Azazel",
		"BD CEE",
		"Berial",
		"Boльгa",
		"Cuba77",
		"D.I.M.",
		"DubLik",
		"Dubляж",
		"Elegia",
		"Emslie",
		"FocusX",
		"GalVid",
		"Gemini",
		"Jetvis",
		"JimmyJ",
		"KANSAI",
		"KOleso",
		"Kansai",
		"Kiitos",
		"L0cDoG",
		"LeXiKC",
		"Lisitz",
		"Mikail",
		"Milvus",
		"MrRose",
		"Nastia",
		"NewDub",
		"OSLIKt",
		"Ozz TV",
		"Ozz.tv",
		"Prolix",
		"RedDog",
		"Rumble",
		"SNK-TV",
		"Satkur",
		"Selena",
		"Shaman",
		"Stevie",
		"Suzaku",
		"TV1000",
		"Tycoon",
		"UAFlix",
		"WVoice",
		"WiaDUB",
		"ZEE TV",
		"Zendos",
		"Zerzia",
		"binjak",
		"den904",
		"kiitos",
		"madrid",
		"neko64",
		"АБыГДе",
		"Агапов",
		"Акалит",
		"Акопян",
		"Акцент",
		"Альянс",
		"Анубис",
		"Арк-ТВ",
		"Бойков",
		"Векшин",
		"Вихров",
		"Вольга",
		"Гоблин",
		"Готлиб",
		"Гризли",
		"Гундос",
		"Гуртом",
		"ДиоНиК",
		"Дьяков",
		"Есарев",
		"Живаго",
		"Жучков",
		"Зебуро",
		"Иванов",
		"Карцев",
		"Кашкин",
		"Килька",
		"Киреев",
		"Козлов",
		"Кондор",
		"Котова",
		"Кошкин",
		"Кравец",
		"Курдов",
		"Лагута",
		"Лапшин",
		"Лизард",
		"Миняев",
		"Мудров",
		"Н-Кино",
		"НЕВА 1",
		"НЛО-TV",
		"Набиев",
		"Нева-1",
		"Пронин",
		"Пучков",
		"Ракурс",
		"Россия",
		"С.Р.И.",
		"Санаев",
		"Светла",
		"Сербин",
		"Стасюк",
		"Строев",
		"ТВ СПб",
		"Товбин",
		"Шварко",
		"Швецов",
		"Шуваев",
		"Amber",
		"AniUA",
		"Anika",
		"Arisu",
		"Cmert",
		"D2Lab",
		"D2lab",
		"DeMon",
		"Elrom",
		"IНТЕР",
		"JetiX",
		"Jetix",
		"Kerob",
		"Lupin",
		"Ozeon",
		"PaDet",
		"RinGo",
		"Ryc99",
		"SHIZA",
		"Solod",
		"To4ka",
		"erogg",
		"ko136",
		"seqw0",
		"ssvss",
		"zamez",
		"Акира",
		"АнВад",
		"Белов",
		"Бигыч",
		"ВГТРК",
		"Велес",
		"Ворон",
		"Гланц",
		"Живов",
		"Игмар",
		"Интер",
		"Котов",
		"Лайко",
		"Мишин",
		"Новий",
		"Перец",
		"Попов",
		"Райдо",
		"РенТВ",
		"Рудой",
		"Рукин",
		"Рыбин",
		"Рябов",
		"С.Р.И",
		"ТВЧ 1",
		"Хабар",
		"Чадов",
		"Штамп",
		"Штейн",
		"Andy",
		"CPIG",
		"Dice",
		"ETV+",
		"Gits",
		"ICTV",
		"Jade",
		"KIHO",
		"Laci",
		"RAIM",
		"SGEV",
		"Tori",
		"Troy",
		"Twix",
		"Vano",
		"Voiz",
		"jept",
		"ИДДК",
		"Инис",
		"Ирэн",
		"Нота",
		"ТВ-3",
		"ТВИН",
		"Твин",
		"Чуев",
		"1+1",
		"2+2",
		"2x2",
		"2х2",
		"AMC",
		"AMS",
		"AOS",
		"CDV",
		"DDV",
		"FDV",
		"FOX",
		"ICG",
		"IVI",
		"JAM",
		"LDV",
		"MCA",
		"MGM",
		"MTV",
		"Oni",
		"QTV",
		"TB5",
		"V1R",
		"VHS",
		"АМС",
		"ГКГ",
		"ДТВ",
		"ИГМ",
		"КТК",
		"МИР",
		"НСТ",
		"НТВ",
		"НТН",
		"РТР",
		"СТС",
		"ТВ3",
		"ТВ6",
		"ТВЦ",
		"ТНТ",
		"ТРК",
		"Че!",
		"D1",
		"R5",
		"К9",
		"Закадровый",
		"Многоголосый"
	];

	voiceList.sort(function (a, b) {
		return b.length - a.length;
	});

	var STORAGE_KEY_SERVERS = "online_servers";
	var STORAGE_KEY_ACTIVE_SERVER = "online_active_server";
	var STORAGE_KEY_SOURCES = "online_sources";
	var STORAGE_KEY_PUBLIC_SERVERS_CACHE = "online_public_servers_cache";
	var STORAGE_KEY_BWA_CODE = "online_bwa_code";
	var STORAGE_KEY_USE_BWA = "online_use_bwa";
	var STORAGE_KEY_SERVER_TOKENS = "online_server_tokens";
	var BWA_HOST = "rc.bwa.to";

	var ONLINE_ICON =
		'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z" fill="currentColor"/><rect x="3" y="3" width="4" height="18" rx="1" fill="currentColor"/><rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/></svg>';

	var DEFAULT_SOURCES = [
		{ id: "rezka", name: "rezka", enabled: true },
		{ id: "rc/rhs", name: "rc/rhs", enabled: false },
		{ id: "rhsprem", name: "rhsprem", enabled: true },
		{ id: "kinopub", name: "kinopub", enabled: true },
		{ id: "vokino", name: "vokino", enabled: true },
		{ id: "mirage", name: "mirage", enabled: false },
		{ id: "alloha", name: "alloha", enabled: true },
		{ id: "rc/filmix", name: "rc/filmix", enabled: false },
		{ id: "rc/fxapi", name: "rc/fxapi", enabled: false },
		{ id: "fxapi", name: "fxapi", enabled: false },
		{ id: "filmix", name: "filmix", enabled: false },
		{ id: "filmixtv", name: "filmixtv", enabled: false },
		{ id: ["videocdn", "lumex"], name: "lumex", enabled: true },
		{ id: "kinogo", name: "kinogo", enabled: true },
		{ id: "vkmovie", name: "VK", enabled: false },
		{ id: "rutubemovie", name: "rutube", enabled: false },
		{ id: "videodb", name: "videodb", enabled: false },
		{ id: "collaps", name: "collaps", enabled: false },
		{ id: "collaps-dash", name: "collaps-dash", enabled: false },
		{ id: "hdvb", name: "hdvb", enabled: true },
		{ id: "zetflix", name: "zetflix", enabled: false },
		{ id: "veoveo", name: "veoveo", enabled: false },
		{ id: "kodik", name: "kodik", enabled: true },
		{ id: "ashdi", name: "ashdi", enabled: false },
		{ id: "kinoukr", name: "kinoukr", enabled: false },
		{ id: "kinotochka", name: "kinotochka", enabled: false },
		{ id: "remux", name: "remux", enabled: false },
		{ id: "iframevideo", name: "iframevideo", enabled: false },
		{ id: "cdnmovies", name: "cdnmovies", enabled: false },
		{ id: "anilibria", name: "anilibria", enabled: false },
		{ id: "animedia", name: "animedia", enabled: false },
		{ id: "animego", name: "animego", enabled: false },
		{ id: "animevost", name: "animevost", enabled: false },
		{ id: "animebesst", name: "animebesst", enabled: false },
		{ id: "redheadsound", name: "redheadsound", enabled: false },
		{ id: "animelib", name: "animelib", enabled: false },
		{ id: "moonanime", name: "moonanime", enabled: false },
		{ id: "vibix", name: "vibix", enabled: false },
		{ id: "vdbmovies", name: "vdbmovies", enabled: false },
		{ id: "fancdn", name: "fancdn", enabled: false },
		{ id: "cdnvideohub", name: "cdnvideohub", enabled: false },
		{ id: "vcdn", name: "vcdn", enabled: false },
		{ id: "hydraflix", name: "hydraflix", enabled: false },
		{ id: "videasy", name: "videasy", enabled: false },
		{ id: "vidsrc", name: "vidsrc", enabled: false },
		{ id: "movpi", name: "movpi", enabled: false },
		{ id: "vidlink", name: "vidlink", enabled: false },
		{ id: "twoembed", name: "twoembed", enabled: false },
		{ id: "autoembed", name: "autoembed", enabled: false },
		{ id: "smashystream", name: "smashystream", enabled: false },
		{ id: "rgshows", name: "rgshows", enabled: false },
		{ id: "pidtor", name: "pidtor", enabled: false },
		{ id: "videoseed", name: "videoseed", enabled: false },
		{ id: "iptvonline", name: "iptvonline", enabled: false },
		{ id: "eneyida", name: "eneyida", enabled: false },
		{ id: "kinobase", name: "kinobase", enabled: false }
	];

	function getDefaultEnabledSources() {
		return DEFAULT_SOURCES.filter(function (s) {
			return s.enabled;
		}).map(function (s) {
			return Lampa.Arrays.isArray(s.id) ? s.id[0] : s.id;
		});
	}

	function getSourceIds(sourceId) {
		for (var i = 0; i < DEFAULT_SOURCES.length; i++) {
			var src = DEFAULT_SOURCES[i];
			var ids = Lampa.Arrays.isArray(src.id) ? src.id : [src.id];
			if (ids.indexOf(sourceId) !== -1) {
				return ids;
			}
		}
		return [sourceId];
	}

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
			servers.splice(index, 1);
			Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
			var active = getActiveServerIndex();
			if (active >= servers.length) {
				setActiveServerIndex(Math.max(0, servers.length - 1));
			}
			return true;
		}
		return false;
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

	function formatServerDisplay(url) {
		return url.replace(/^https?:\/\//, "");
	}

	function getSelectedSources() {
		var sources = Lampa.Storage.get(STORAGE_KEY_SOURCES, []);
		if (typeof sources === "string") {
			try {
				sources = JSON.parse(sources);
			} catch (e) {
				sources = [];
			}
		}
		if (!Lampa.Arrays.isArray(sources) || sources.length === 0) {
			sources = getDefaultEnabledSources();
		}
		return sources.map(function (s) {
			return Lampa.Arrays.isArray(s) ? s[0] : s;
		});
	}

	function setSelectedSources(sources) {
		Lampa.Storage.set(STORAGE_KEY_SOURCES, sources);
	}

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

	function getBwaCode() {
		return Lampa.Storage.get(STORAGE_KEY_BWA_CODE, "");
	}

	function setBwaCode(code) {
		Lampa.Storage.set(STORAGE_KEY_BWA_CODE, code);
	}

	function isUsingBwa() {
		return Lampa.Storage.get(STORAGE_KEY_USE_BWA, false);
	}

	function setUseBwa(use) {
		Lampa.Storage.set(STORAGE_KEY_USE_BWA, use);
	}

	function getServerTokens() {
		var tokens = Lampa.Storage.get(STORAGE_KEY_SERVER_TOKENS, "{}");
		if (typeof tokens === "string") {
			try {
				tokens = JSON.parse(tokens);
			} catch (e) {
				tokens = {};
			}
		}
		return tokens || {};
	}

	function getServerToken(serverUrl) {
		var tokens = getServerTokens();
		return tokens[serverUrl] || "";
	}

	function setServerToken(serverUrl, token) {
		var tokens = getServerTokens();
		if (token) {
			tokens[serverUrl] = token;
		} else {
			delete tokens[serverUrl];
		}
		Lampa.Storage.set(STORAGE_KEY_SERVER_TOKENS, tokens);
	}

	function getCurrentServerToken() {
		var serverUrl = getServerUrl();
		if (!serverUrl) return "";
		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var originalUrl = servers[activeIndex] || "";
		return getServerToken(originalUrl);
	}

	var Config = {
		lampa: "Lampa.",
		get stream() {
			if (isUsingBwa()) {
				return BWA_HOST;
			}
			var url = getServerUrl();
			return url ? url.replace(/^https?:\/\//, "") : "";
		},
		get sources() {
			return getSelectedSources();
		},
		nolite: [],
		filter_ts: ["ts", "тс", "tс", "тc", "чистый звук"],
		filter_hr: ["HDR10", "HEVC"],
		filter_db: [
			"Дубляж",
			"Дублированный",
			"Red Head Sound",
			"Мосфильм",
			"Dubляж"
		],
		filter_tv: [],
		filter_uk: ["uk", "ukr", "укр"],
		filter_du: ["Дубляж", "Дублированный", "Полное дублирование"],
		rename_translate: {
			HDRezka: ["HDrezka Studio", "RezkaStudio", "Rezka Studio", "Rezka"],
			StudioBand: ["Студийная Банда", "StudioBand", "Studio Band"],
			Дубляж: ["Дубляж", "Дублированный", "Полное дублирование"],
			Оригинал: ["Не требуется", "Оригинальный"],
			Закадровый: ["Многоголосый", "Закадровый"]
		},
		filter_translate: voiceList
	};

	function compareVoiceNames(voice1, voice2) {
		var v1 = voice1.toLowerCase().replace(/ /g, "").split(/\.|\[/)[0];
		var v2 = voice2.toLowerCase().replace(/ /g, "").split(/\.|\[/)[0];
		if (!v1 || !v2) {
			return false;
		}
		if (v1.indexOf(v2) > -1) {
			return true;
		} else if (v2.indexOf(v1) > -1) {
			return true;
		} else {
			return false;
		}
	}

	function getRegion() {
		var region = Lampa.Storage.get("region", "{}");
		if (region.code) {
			return region.code;
		}
		return "ru";
	}

	function getVoiceName(item) {
		return item.translate || item.name || item.details || item.title || "";
	}

	function filterTranslations(items) {
		if (!items || !Lampa.Arrays.isArray(items) || items.length === 0) {
			return [];
		}
		var result = items.filter(function (item) {
			return (
				Config.filter_hr.filter(function (filter) {
					return (
						getVoiceName(item).toLowerCase().indexOf(filter.toLowerCase()) >= 0
					);
				}).length == 0
			);
		});
		result = result.filter(function (item) {
			return (
				Config.filter_ts.filter(function (filter) {
					return (
						getVoiceName(item)
							.toLowerCase()
							.indexOf(" " + filter.toLowerCase()) >= 0
					);
				}).length == 0
			);
		});
		if (getRegion() == "ru") {
			result = result.filter(function (item) {
				return (
					Config.filter_uk.filter(function (filter) {
						return (
							getVoiceName(item).toLowerCase().indexOf(filter.toLowerCase()) >=
							0
						);
					}).length == 0
				);
			});
		}

		normalizeVoiceNames(result);
		return result;
	}

	function regexMatch(regex, groupIndex, string) {
		var match = string.match(regex);
		if (match && match[groupIndex]) {
			return match[groupIndex];
		}
		return string;
	}

	function normalizeVoiceNames(items) {
		items.forEach(function (item) {
			["translate", "title", "details", "name"].forEach(function (key) {
				if (item[key]) {
					if (item[key].indexOf("По умолчанию") === 0) {
						return;
					}
					if (/^\d{3,4}p$/i.test(item[key])) {
						item[key] = "По умолчанию";
						return;
					}
					item[key] = regexMatch(/\(([^()]+)\)$/, 1, item[key]);
					if (/^\d{3,4}p$/i.test(item[key])) {
						item[key] = "По умолчанию";
						return;
					}
					var foundInList = false;
					Config.filter_translate.forEach(function (filter) {
						if (item[key].toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
							item[key] = filter;
							foundInList = true;
						}
					});
					var rename = function rename(keyName) {
						var list = Config.rename_translate[keyName];
						list.forEach(function (val) {
							if (item[key].toLowerCase() == val.toLowerCase()) {
								item[key] = keyName;
								foundInList = true;
							}
						});
					};
					for (var keyName in Config.rename_translate) {
						rename(keyName);
					}
					Config.filter_du.forEach(function (filter) {
						if (item[key].toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
							item[key] = filter;
							foundInList = true;
						}
					});
					if (!foundInList) {
						var quality = item.maxquality || item.quality || "";
						if (typeof quality === "object") {
							var keys = Object.keys(quality);
							quality = keys.length > 0 ? keys[keys.length - 1] : "";
						}
						item[key] = quality
							? "По умолчанию (" + quality + ")"
							: "По умолчанию";
					}
				}
			});
		});
		return items;
	}

	function uniqueTranslations(items) {
		var result = [];
		items.forEach(function (item) {
			if (
				!result.find(function (res) {
					return compareVoiceNames(getVoiceName(res), getVoiceName(item));
				})
			) {
				result.push(item);
			}
		});
		return result;
	}

	function sortTranslations(items) {
		items.sort(function (a, b) {
			var isDubA = Config.filter_db.filter(function (filter) {
				return getVoiceName(a).toLowerCase().indexOf(filter.toLowerCase()) >= 0;
			}).length;
			var isDubB = Config.filter_db.filter(function (filter) {
				return getVoiceName(b).toLowerCase().indexOf(filter.toLowerCase()) >= 0;
			}).length;
			if (isDubA && !isDubB) {
				return -1;
			}
			if (!isDubA && isDubB) {
				return 1;
			}
			return 0;
		});
	}

	function modalChoiceTranslation(current, onBackCallback) {
		var controllerName = Lampa.Controller.enabled().name;
		var html = $(`<div class="connect-broken">
						<div class="connect-broken__icon icon--nofound"></div>
						<div class="connect-broken__title">Вот досада...</div>
						<div class="connect-broken__text">Нет доступных файлов для воспроизведения с выбранным переводом (<b>${current.from}</b>). Хотите выбрать другой?</div>
						<div class="connect-broken__footer">
							<div class="selector simple-button next">Выбрать другой</div>
						</div>
					</div>`);
		html.find(".selector").on("hover:enter", function () {
			Lampa.Modal.close();
			Lampa.Controller.toggle(controllerName);
		});
		html.find(".next").on("hover:enter", function () {
			Lampa.Select.show({
				title: "Выберите перевод",
				items: current.voicelist,
				onBack: function onBack() {
					Lampa.Controller.toggle(controllerName);
					if (onBackCallback) {
						onBackCallback();
					}
				}
			});
		});
		Lampa.Modal.open({
			title: "",
			html: html,
			onBack: function onBack() {
				Lampa.Modal.close();
				Lampa.Controller.toggle(controllerName);
				if (onBackCallback) {
					onBackCallback();
				}
			}
		});
	}

	function selectTranslation(items, current, onSelectCallback) {
		var grouped = {};
		items.forEach(function (item) {
			var voiceName = getVoiceName(item);
			if (!grouped[voiceName]) {
				grouped[voiceName] = { items: [], sources: [], maxquality: 0 };
			}
			grouped[voiceName].items.push(item);
			var srcName = item.source_name || "";
			if (srcName && grouped[voiceName].sources.indexOf(srcName) === -1) {
				grouped[voiceName].sources.push(srcName);
			}
			var itemQuality = parseInt(item.maxquality) || 0;
			if (itemQuality > grouped[voiceName].maxquality) {
				grouped[voiceName].maxquality = itemQuality;
			}
		});

		var menuItems = [];
		for (var voiceName in grouped) {
			var group = grouped[voiceName];
			var subtitleParts = [];
			if (group.sources.length > 0)
				subtitleParts.push(group.sources.join(", "));
			if (group.maxquality > 0) subtitleParts.push(group.maxquality + "p");
			menuItems.push({
				title: voiceName,
				subtitle: subtitleParts.join(" • "),
				selected: compareVoiceNames(voiceName, current),
				voiceItems: group.items,
				onSelect: function onSelect() {
					Lampa.Controller.toggle("content");
					onSelectCallback(this.voiceItems[0]);
				}
			});
		}

		Lampa.Select.show({
			title: "Выберите перевод",
			items: menuItems,
			onBack: function onBack() {
				Lampa.Controller.toggle("content");
			}
		});
	}

	function selectFlow(items, onSelectCallback) {
		Lampa.Select.show({
			title: "Выберите поток",
			items: items.map(function (item) {
				return {
					title:
						item.quality + (item.label ? "<sub>" + item.label + "</sub>" : ""),
					selected: item.selected,
					subtitle: Lampa.Utils.shortText(item.url, 35),
					onSelect: function onSelect() {
						Lampa.Controller.toggle("content");
						onSelectCallback(item);
					}
				};
			}),
			onBack: function onBack() {
				Lampa.Controller.toggle("content");
			}
		});
	}

	function getPlayerType() {
		if (Lampa.Platform.is("tizen") || Lampa.Platform.is("webos")) {
			return "inner";
		} else {
			return Lampa.Storage.field("player");
		}
	}

	var Utils = {
		compareVoice: compareVoiceNames,
		region: getRegion,
		voice: getVoiceName,
		player: getPlayerType,
		filterTranslate: filterTranslations,
		renameTranslate: normalizeVoiceNames,
		sortDUBTranstale: sortTranslations,
		modalChoiceTranstale: modalChoiceTranslation,
		unicleTranslations: uniqueTranslations,
		selectChoiceTranstale: selectTranslation,
		selectChoiceFlow: selectFlow
	};

	function addAuthParams(url) {
		url = url + "";
		url = Lampa.Utils.addUrlComponent(url, "rjson=true");
		if (url.indexOf("uid=") == -1) {
			var visitorId = Lampa.Storage.get("lampac_unic_id", "") || "guest";
			url = Lampa.Utils.addUrlComponent(
				url,
				"uid=" + encodeURIComponent(visitorId)
			);
		}
		if (isUsingBwa()) {
			if (url.indexOf("account_email=") == -1) {
				var email = Lampa.Storage.get("account_email", "");
				if (email)
					url = Lampa.Utils.addUrlComponent(
						url,
						"account_email=" + encodeURIComponent(email)
					);
			}
			if (url.indexOf("token=") == -1) {
				var bwaCode = getBwaCode();
				if (bwaCode)
					url = Lampa.Utils.addUrlComponent(
						url,
						"token=" + encodeURIComponent(bwaCode)
					);
			}
			if (
				url.indexOf("nws_id=") == -1 &&
				window.rch_nws &&
				window.rch_nws[bwaHostKey]
			) {
				var nws_id = window.rch_nws[bwaHostKey].connectionId || "";
				if (nws_id)
					url = Lampa.Utils.addUrlComponent(
						url,
						"nws_id=" + encodeURIComponent(nws_id)
					);
			}
			if (url.indexOf("rchtype=") == -1) {
				var rchtype =
					(window.rch_nws &&
						window.rch_nws[bwaHostKey] &&
						window.rch_nws[bwaHostKey].type) ||
					"web";
				url = Lampa.Utils.addUrlComponent(url, "rchtype=" + rchtype);
			}
		} else {
			var serverToken = getCurrentServerToken();
			if (serverToken) {
				var tokenParts = serverToken.split("=");
				var tokenKey = tokenParts[0];
				if (tokenKey && url.indexOf(tokenKey + "=") == -1) {
					url = Lampa.Utils.addUrlComponent(url, serverToken);
				}
			}
		}
		return url;
	}

	function loadBwaUserSources(bwaCode, callback) {
		var network = new Lampa.Reguest();
		network.timeout(10000);
		var url = "http://" + BWA_HOST + "/online/js/" + bwaCode;
		network.silent(
			url,
			function (response) {
				if (callback) callback(true);
			},
			function () {
				if (callback) callback(false);
			},
			false,
			{ dataType: "text" }
		);
	}

	var bwaRchConnected = false;
	var bwaHostKey = BWA_HOST.replace("http://", "").replace("https://", "");
	var bwaInitialized = false;

	function initBwaUserScript(callback) {
		var bwaCode = getBwaCode();
		if (!bwaCode) {
			if (callback) callback(false);
			return;
		}
		if (bwaInitialized) {
			if (callback) callback(true);
			return;
		}
		var url = "http://" + BWA_HOST + "/online/js/" + bwaCode;
		Lampa.Utils.putScriptAsync([url], function () {
			bwaInitialized = true;
			if (callback) callback(true);
		});
	}

	function initBwaRch(json, callback) {
		if (!window.rch_nws) window.rch_nws = {};

		if (!window.rch_nws[bwaHostKey]) {
			window.rch_nws[bwaHostKey] = {
				type: Lampa.Platform.is("android")
					? "apk"
					: Lampa.Platform.is("tizen")
						? "cors"
						: "web",
				startTypeInvoke: false,
				rchRegistry: false,
				apkVersion: 0
			};
		}

		window.rch_nws[bwaHostKey].Registry = function (client, startConnection) {
			client.invoke(
				"RchRegistry",
				JSON.stringify({
					version: 151,
					host: location.host,
					rchtype: window.rch_nws[bwaHostKey].type || "web",
					apkVersion: 0,
					player: Lampa.Storage.field("player"),
					account_email: Lampa.Storage.get("account_email", ""),
					unic_id: Lampa.Storage.get("lampac_unic_id", ""),
					profile_id: Lampa.Storage.get("lampac_profile_id", ""),
					token: ""
				})
			);

			if (client._shouldReconnect && window.rch_nws[bwaHostKey].rchRegistry) {
				if (startConnection) startConnection();
				return;
			}

			window.rch_nws[bwaHostKey].rchRegistry = true;

			client.on("RchRegistry", function (clientIp) {
				bwaRchConnected = true;
				if (startConnection) startConnection();
			});

			client.on(
				"RchClient",
				function (rchId, url, data, headers, returnHeaders) {
					var network = new Lampa.Reguest();

					function sendResult(uri, html) {
						$.ajax({
							url: "http://" + BWA_HOST + "/rch/" + uri + "?id=" + rchId,
							type: "POST",
							data: html,
							async: true,
							cache: false,
							contentType: false,
							processData: false,
							success: function () {},
							error: function () {
								client.invoke("RchResult", rchId, "");
							}
						});
					}

					function result(html) {
						if (Lampa.Arrays.isObject(html) || Lampa.Arrays.isArray(html)) {
							html = JSON.stringify(html);
						}
						sendResult("result", html);
					}

					// if (url == 'eval') {
					// 	result('');
					// } else
					if (url == "ping") {
						result("pong");
					} else {
						network["native"](
							url,
							result,
							function () {
								result("");
							},
							data,
							{
								dataType: "text",
								timeout: 8000,
								headers: headers,
								returnHeaders: returnHeaders
							}
						);
					}
				}
			);

			client.on("Connected", function (connectionId) {
				window.rch_nws[bwaHostKey].connectionId = connectionId;
				bwaRchConnected = true;
			});
		};

		function connectNws() {
			if (typeof NativeWsClient == "undefined") {
				Lampa.Utils.putScript(
					["http://" + BWA_HOST + "/js/nws-client-es5.js?v18112025"],
					function () {},
					false,
					function () {
						startNwsClient();
					},
					true
				);
			} else {
				startNwsClient();
			}
		}

		function startNwsClient() {
			if (
				window.nwsClient &&
				window.nwsClient[bwaHostKey] &&
				window.nwsClient[bwaHostKey]._shouldReconnect
			) {
				if (callback) callback();
				return;
			}
			if (!window.nwsClient) window.nwsClient = {};
			if (window.nwsClient[bwaHostKey] && window.nwsClient[bwaHostKey].socket) {
				window.nwsClient[bwaHostKey].socket.close();
			}
			window.nwsClient[bwaHostKey] = new NativeWsClient(json.nws, {
				autoReconnect: true
			});
			window.nwsClient[bwaHostKey].on("Connected", function () {
				window.rch_nws[bwaHostKey].Registry(
					window.nwsClient[bwaHostKey],
					function () {
						if (callback) callback();
					}
				);
			});
			window.nwsClient[bwaHostKey].on("Error", function (err) {
				console.log("BWA NWS Error:", err);
			});
			window.nwsClient[bwaHostKey].connect();
		}

		connectNws();
	}

	function handleBwaRch(json, retryCallback) {
		if (json && json.rch) {
			initBwaRch(json, function () {
				setTimeout(function () {
					if (retryCallback) retryCallback();
				}, 500);
			});
			return true;
		}
		return false;
	}

	var ApiExtractor = (function () {
		function ApiExtractor(object) {
			classCallCheck(this, ApiExtractor);
			this.object = object;
			this.network = new Lampa.Reguest();
			this.voiceSave = new VoiceStorage(object);
		}
		createClass(ApiExtractor, [
			{
				key: "externalids",
				value: function externalids() {
					var _this = this;
					return new Promise(function (resolve, reject) {
						if (
							!_this.object.movie.imdb_id ||
							!_this.object.movie.kinopoisk_id
						) {
							var params = [];
							params.push("id=" + _this.object.movie.id);
							params.push("serial=" + (_this.object.movie.name ? 1 : 0));
							if (_this.object.movie.imdb_id) {
								params.push("imdb_id=" + (_this.object.movie.imdb_id || ""));
							}
							if (_this.object.movie.kinopoisk_id) {
								params.push(
									"kinopoisk_id=" + (_this.object.movie.kinopoisk_id || "")
								);
							}
							var url =
								Lampa.Utils.protocol() +
								Config.stream +
								"/externalids?" +
								params.join("&");
							_this.network.timeout(10000);
							_this.network.silent(
								addAuthParams(url),
								function (response) {
									for (var key in response) {
										_this.object.movie[key] = response[key];
									}
									resolve();
								},
								function () {
									resolve();
								}
							);
						} else {
							resolve();
						}
					});
				}
			},
			{
				key: "requestParams",
				value: function requestParams(url) {
					var params = [];
					var object = this.object;
					var source = object.movie.source || "tmdb";
					params.push("id=" + object.movie.id);
					if (object.movie.imdb_id) {
						params.push("imdb_id=" + (object.movie.imdb_id || ""));
					}
					if (object.movie.kinopoisk_id) {
						params.push("kinopoisk_id=" + (object.movie.kinopoisk_id || ""));
					}
					params.push(
						"title=" +
							encodeURIComponent(
								object.clarification
									? object.search
									: object.movie.title || object.movie.name
							)
					);
					params.push(
						"original_title=" +
							encodeURIComponent(
								object.movie.original_title || object.movie.original_name
							)
					);
					params.push("serial=" + (object.movie.name ? 1 : 0));
					params.push(
						"original_language=" + (object.movie.original_language || "")
					);
					params.push(
						"year=" +
							(
								(object.movie.release_date ||
									object.movie.first_air_date ||
									"0000") + ""
							).slice(0, 4)
					);
					params.push("source=" + source);
					params.push("clarification=" + (object.clarification ? 1 : 0));
					params.push("rjson=true");
					if (Lampa.Storage.get("account_email", "")) {
						params.push(
							"cub_id=" +
								Lampa.Utils.hash(Lampa.Storage.get("account_email", ""))
						);
					}
					return url + (url.indexOf("?") >= 0 ? "&" : "?") + params.join("&");
				}
			},
			{
				key: "query",
				value: function query(params) {
					var _this2 = this;
					return new Promise(function (resolve, reject) {
						var sources = [].concat(Config.sources);
						var worker = new AsyncWorker(sources.length);
						var notyInterval;
						var searchCompleted = false;

						function updateSearchNoty() {
							if (!searchCompleted) {
								Lampa.Noty.show("Секундочку...");
							}
						}

						updateSearchNoty();
						notyInterval = setInterval(updateSearchNoty, 2000);

						worker.onComplite = function (results) {
							searchCompleted = true;
							clearInterval(notyInterval);
							var successResults = [];
							var errorType = 700;
							sources.forEach(function (source) {
								var result = results[source];
								if (!result) return;
								if (result.error) {
									errorType = result.error;
									return;
								}
								if (result.accsdb) {
									errorType = 600;
									return;
								}
								if (result.type == "similar" || !result.data) return;
								var srcName = result.balanser || result._source_id || source;
								if (result.voice && Lampa.Arrays.isArray(result.voice)) {
									result.voice.forEach(function (v) {
										v.source_name = srcName;
									});
								}
								if (result.data && Lampa.Arrays.isArray(result.data)) {
									result.data.forEach(function (d) {
										d.source_name = srcName;
									});
								}
								result.source_name = srcName;
								successResults.push(result.voice ? result : result.data);
							});
							if (successResults.length) {
								resolve(successResults);
							} else {
								reject(errorType);
							}
						};
						sources.forEach(function (source) {
							_this2
								.source(source, params.season)
								.then(function (result) {
									if (
										result.voice &&
										result.data &&
										result.data[0] &&
										result.data[0].quality
									) {
										var maxQ = 0;
										for (var q in result.data[0].quality) {
											var qInt = parseInt(q);
											if (qInt > maxQ) maxQ = qInt;
										}
										if (maxQ > 0) {
											result.voice.forEach(function (v) {
												if (!v.maxquality || parseInt(v.maxquality) < maxQ) {
													v.maxquality = maxQ + "p";
												}
											});
										}
									}
									result._source_id = source;
									worker.append(source, result);
								})
								.catch(function (error) {
									worker.append(source, {
										error: error
									});
								});
						});
					});
				}
			},
			{
				key: "source",
				value: function source(name, season) {
					var _this3 = this;
					return new Promise(function (resolve, reject) {
						var sourceIds = getSourceIds(name);
						var currentIdIndex = 0;

						var tryNextSource = function () {
							if (currentIdIndex >= sourceIds.length) {
								reject(400);
								return;
							}
							var currentName = sourceIds[currentIdIndex];
							var tryRequest = function (useLite, isRetry) {
								var path = useLite ? "/lite/" : "/";
								var baseUrl =
									Lampa.Utils.protocol() + Config.stream + path + currentName;
								var url = _this3.requestParams(addAuthParams(baseUrl));
								if (season) {
									url += "&s=" + season;
								}
								_this3.network.timeout(10000);
								_this3.network.silent(
									url,
									function (response) {
										var json;
										try {
											json = JSON.parse(response);
										} catch (e) {}
										if (json) {
											if (json.rch && isUsingBwa() && !isRetry) {
												handleBwaRch(json, function () {
													tryRequest(useLite, true);
												});
											} else if (
												json === "disable" ||
												json.disable ||
												(json.error && !json.data)
											) {
												currentIdIndex++;
												tryNextSource();
											} else {
												resolve(json);
											}
										} else if (response === "disable") {
											currentIdIndex++;
											tryNextSource();
										} else {
											reject(500);
										}
									},
									function () {
										if (useLite) {
											tryRequest(false, isRetry);
										} else {
											currentIdIndex++;
											tryNextSource();
										}
									},
									false,
									{
										dataType: "text"
									}
								);
							};
							var useLite = Config.nolite.indexOf(currentName) == -1;
							tryRequest(useLite, false);
						};

						tryNextSource();
					});
				}
			},
			{
				key: "links",
				value: function links(items) {
					var _this4 = this;
					return new Promise(function (resolve, reject) {
						var calls = [];
						var plays = [];
						items.forEach(function (item) {
							calls = calls.concat(
								item.filter(function (i) {
									return i.method == "call";
								})
							);
							plays = plays.concat(
								item.filter(function (i) {
									return i.method == "play";
								})
							);
						});
						var worker = new AsyncWorker(calls.length);
						worker.onComplite = function () {
							resolve(Utils.renameTranslate(plays));
						};
						var processCall = function (call, isRetry) {
							_this4.network.timeout(10000);
							_this4.network.silent(
								addAuthParams(call.url),
								function (response) {
									if (response.rch && isUsingBwa() && !isRetry) {
										handleBwaRch(response, function () {
											processCall(call, true);
										});
									} else {
										var playItem = response;
										if (!playItem.quality && playItem.url) {
											playItem.quality = {};
											var urlStr = playItem.url;
											if (urlStr.indexOf(" or ") !== -1) {
												urlStr = urlStr.split(" or ")[0];
											}
											playItem.quality["auto"] = playItem.url;
										}
										if (call.source_name && !playItem.source_name) {
											playItem.source_name = call.source_name;
										}
										playItem.details =
											call.details || playItem.details || "no details";
										playItem.translate =
											call.translate || playItem.translate || "no translate";
										plays.push(playItem);
										worker.next();
									}
								},
								worker.error.bind(worker)
							);
						};
						calls.forEach(function (call) {
							processCall(call, false);
						});
						if (calls.length == 0) {
							resolve(Utils.renameTranslate(plays));
						}
					});
				}
			},
			{
				key: "m3u",
				value: function m3u(data) {
					var _this5 = this;
					return new Promise(function (resolve, reject) {
						var playlist = [];
						var defaultQuality = Lampa.Storage.field("video_quality_default");
						var processQuality = function processQuality(quality) {
							if (parseInt(quality) <= defaultQuality) {
								var urls = [data.quality[quality].url].concat(
									data.quality[quality].reserve
								);
								urls.forEach(function (url) {
									playlist.push({
										quality: quality,
										name: data.name,
										url: url
									});
								});
							}
						};
						for (var q in data.quality) {
							processQuality(q);
						}
						_this5.network.silent(
							Lampa.Utils.protocol() + Config.stream + "/m3u/add",
							function (response) {
								resolve(Lampa.Utils.protocol() + Config.stream + response.url);
							},
							function (error, status) {
								reject(400);
							},
							{
								playlist: playlist
							}
						);
					});
				}
			},
			{
				key: "flows",
				value: function flows(qualities) {
					var result = [];
					var defaultQuality = Lampa.Storage.field("video_quality_default");
					var process = function process(q) {
						var urls = [qualities[q].url].concat(qualities[q].reserve);
						var qualityInt = parseInt(q);
						urls.forEach(function (url) {
							result.push({
								int: qualityInt,
								label:
									qualityInt > 1440
										? "4K"
										: qualityInt >= 1440
											? "2K"
											: qualityInt >= 1080
												? "FHD"
												: qualityInt >= 720
													? "HD"
													: "",
								quality: q,
								url: url
							});
						});
					};
					for (var q in qualities) {
						process(q);
					}
					var selected = result.find(function (item) {
						return item.int == defaultQuality;
					});
					if (selected) {
						selected.selected = true;
					}
					return result;
				}
			},
			{
				key: "movie",
				value: function movie(params) {
					var _this6 = this;
					return new Promise(function (resolve, reject) {
						_this6
							.externalids()
							.then(function () {
								return _this6.query(params);
							})
							.then(function (results) {
								var translates = [];
								results.forEach(function (item) {
									var filtered = Utils.filterTranslate(item);
									if (filtered.length) {
										translates = translates.concat(filtered);
									}
								});
								translates.forEach(function (item) {
									item.maxquality = item.maxquality || "1080p";
									var match = item.translate.match(/\[(.*?)\]/);
									if (match) {
										match = match[1].split(",").map(function (m) {
											return m.trim();
										});
										item.lang = (
											match
												.map(function (m) {
													return m.toLowerCase();
												})
												.find(function (m) {
													return (
														m == "ru" ||
														m == "uk" ||
														m == "rus" ||
														m == "ukr" ||
														m == "укр"
													);
												}) || ""
										).toUpperCase();
										item.lang =
											item.lang == "RUS"
												? "RU"
												: item.lang == "UKR"
													? "UA"
													: item.lang;
										if (item.lang == "RU" && Utils.region() == "ru") {
											item.lang = "";
										}
										item.translate =
											match.find(function (m) {
												return m.length > 5;
											}) || item.translate;
									}
								});
								if (translates.length == 0) {
									throw new Error("No data");
								}
								Utils.renameTranslate(translates);
								resolve({
									sources: results,
									translates: translates
								});
							})
							.catch(reject);
					});
				}
			},
			{
				key: "tv",
				value: function tv(params) {
					var _this7 = this;
					return new Promise(function (resolve, reject) {
						_this7.externalids().then(function () {
							_this7
								.query(params)
								.then(function (results) {
									_this7
										.voice(results)
										.then(function (voiceData) {
											resolve(
												objectSpread(
													{
														sources: results
													},
													voiceData
												)
											);
										})
										.catch(reject);
								})
								.catch(reject);
						});
					});
				}
			},
			{
				key: "voice",
				value: function voice(sources) {
					var _this8 = this;
					return new Promise(function (resolve, reject) {
						var savedVoice = _this8.voiceSave.get();
						var plays = [];
						var filterTV = Config.filter_tv;
						var allTranslates = [];
						var decorateData = function decorateData(response, voiceName) {
							response.data.forEach(function (item) {
								item.translate_name = voiceName;
							});
						};
						var parseHtmlResponse = function (html) {
							var result = { data: [] };
							var $html = $(html);
							$html.find("[data-json]").each(function () {
								try {
									var jsonStr = $(this).attr("data-json");
									var item = JSON.parse(jsonStr);
									if (item.method === "play" && item.url) {
										result.data.push(item);
									}
								} catch (e) {}
							});
							return result;
						};

						var fetchUrl = function fetchUrl(item, isRetry) {
							return new Promise(function (res, rej) {
								_this8.network.timeout(10000);
								_this8.network.silent(
									addAuthParams(item.url),
									function (response) {
										var json = response;
										if (typeof response === "string") {
											if (
												response.indexOf("<div") !== -1 ||
												response.indexOf("data-json") !== -1
											) {
												json = parseHtmlResponse(response);
											} else {
												try {
													json = JSON.parse(response);
												} catch (e) {
													json = {};
												}
											}
										}
										if (json.rch && isUsingBwa() && !isRetry) {
											handleBwaRch(json, function () {
												fetchUrl(item, true).then(res).catch(rej);
											});
										} else {
											if (!json.data || json.data.length === 0) {
												rej("no data");
												return;
											}
											decorateData(json, Utils.voice(item));
											res(json.data);
										}
									},
									function (err) {
										rej(err);
									},
									false,
									{ dataType: "text" }
								);
							});
						};
						sources.forEach(function (source) {
							if (!source.voice || !Lampa.Arrays.isArray(source.voice)) {
								return;
							}
							source.voice = Utils.filterTranslate(source.voice);
							var sourceName = source.source_name || source.balanser || "";
							source.voice.forEach(function (v) {
								v.source_name = v.source_name || sourceName;
							});
							allTranslates = allTranslates.concat(
								source.voice.filter(function (v) {
									return (
										filterTV.filter(function (f) {
											return Utils.voice(v).toLowerCase().indexOf(f) >= 0;
										}).length == 0
									);
								})
							);
						});
						if (!savedVoice) {
							savedVoice = Utils.voice(allTranslates[0]);
						}
						allTranslates.sort(function (a, b) {
							return Utils.voice(a)
								.toLowerCase()
								.localeCompare(Utils.voice(b).toLowerCase());
						});
						var neededTranslates = allTranslates.filter(function (item) {
							return Utils.compareVoice(item.name, savedVoice);
						});
						var worker = new AsyncWorker(neededTranslates.length);
						worker.onComplite = function () {
							if (plays.length == 0) {
								if (!allTranslates[0]) {
									reject(700);
									return;
								}
								fetchUrl(allTranslates[0], false)
									.then(function (data) {
										plays = plays.concat(data);
										resolve({
											translates: allTranslates,
											plays: plays
										});
									})
									.catch(reject);
							} else {
								resolve({
									translates: allTranslates,
									plays: plays
								});
							}
						};
						neededTranslates.forEach(function (item) {
							fetchUrl(item, false)
								.then(function (data) {
									plays = plays.concat(data);
									worker.next();
								})
								.catch(worker.error.bind(worker));
						});
						if (neededTranslates.length == 0) {
							worker.onComplite();
						}
					});
				}
			},
			{
				key: "error",
				value: function error(code) {
					var controllerName = Lampa.Controller.enabled().name;
					var text =
						"К сожалению, не удалось найти видеоконтент для этого фильма. Попробуйте выбрать другой фильм или повторите попытку позже.";
					var html = $(`<div class="connect-broken">
									<div class="connect-broken__title">Вот досада...</div>
									<div class="connect-broken__text">${text}</div>
									<div class="connect-broken__footer">
										<div class="selector simple-button">Закрыть</div>
									</div>
								</div>`);
					html.find(".selector").on("hover:enter", function () {
						Lampa.Controller.back();
					});
					Lampa.Modal.open({
						title: "",
						html: html,
						onBack: function onBack() {
							Lampa.Modal.close();
							Lampa.Controller.toggle(controllerName);
						}
					});
				}
			}
		]);
		return ApiExtractor;
	})();

	function parseM3u8Qualities(m3u8Content, baseUrl) {
		var qualities = {};
		var lines = m3u8Content.split("\n");
		var currentResolution = null;

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i].trim();

			if (line.indexOf("#EXT-X-STREAM-INF") === 0) {
				var resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/i);
				if (resMatch) {
					currentResolution = parseInt(resMatch[2]);
				} else {
					var bwMatch = line.match(/BANDWIDTH=(\d+)/i);
					if (bwMatch) {
						var bw = parseInt(bwMatch[1]);
						if (bw > 4000000) currentResolution = 1080;
						else if (bw > 2000000) currentResolution = 720;
						else if (bw > 1000000) currentResolution = 480;
						else if (bw > 500000) currentResolution = 360;
						else currentResolution = 240;
					}
				}
			} else if (currentResolution && line && line.indexOf("#") !== 0) {
				var streamUrl = line;
				if (streamUrl.indexOf("http") !== 0) {
					var baseParts = baseUrl.split("/");
					baseParts.pop();
					streamUrl = baseParts.join("/") + "/" + streamUrl;
				}
				var qualityKey = currentResolution + "p";
				if (!qualities[qualityKey]) {
					qualities[qualityKey] = streamUrl;
				}
				currentResolution = null;
			}
		}

		return qualities;
	}

	function preprocessLinksWithM3u8(links, callback) {
		var pending = 0;
		var processed = 0;

		links.forEach(function (item, idx) {
			if (!item.quality && item.url && item.url.indexOf(".m3u8") !== -1) {
				pending++;
			}
		});

		if (pending === 0) {
			callback(links);
			return;
		}

		links.forEach(function (item, idx) {
			if (!item.quality && item.url && item.url.indexOf(".m3u8") !== -1) {
				var network = new Lampa.Reguest();
				network.timeout(5000);
				network["native"](
					item.url,
					function (content) {
						if (
							typeof content === "string" &&
							content.indexOf("#EXT-X-STREAM-INF") !== -1
						) {
							var qualities = parseM3u8Qualities(content, item.url);
							if (Object.keys(qualities).length > 0) {
								item.quality = qualities;
							}
						}
						processed++;
						if (processed >= pending) callback(links);
					},
					function () {
						processed++;
						if (processed >= pending) callback(links);
					},
					false,
					{ dataType: "text" }
				);
			}
		});
	}

	var PlayerController = (function () {
		function PlayerController(object) {
			var _this9 = this;
			classCallCheck(this, PlayerController);
			this.object = object;
			this.extract = new ApiExtractor(object);
			this.voice = new VoiceStorage(object);
			this.on_error_timer = null;
			var destroyListener = function destroyListener() {
				Lampa.Player.listener.remove("close", destroyListener);
				clearTimeout(_this9.on_error_timer);
			};
			Lampa.Player.listener.follow("destroy", destroyListener);
		}
		createClass(PlayerController, [
			{
				key: "getQuality",
				value: function getQuality(data) {
					var _this10 = this;
					var qualities = {};
					data.forEach(function (item, idx) {
						var itemQuality = item.quality;
						if (!itemQuality || typeof itemQuality !== "object") {
							if (item.url) {
								itemQuality = { auto: item.url };
							} else {
								return;
							}
						}
						var itemSourceName = item.source_name || "";
						var process = function process(q) {
							var qualityInt = parseInt(q);
							var links = _this10.getSplitLinks(itemQuality[q]);
							if (!qualities[q]) {
								qualities[q] = {
									label:
										qualityInt > 1440
											? "4K"
											: qualityInt >= 1440
												? "2K"
												: qualityInt >= 1080
													? "FHD"
													: qualityInt >= 720
														? "HD"
														: "",
									url: links[0],
									reserve: links.length > 1 ? links.slice(1) : [],
									used: [],
									error: [],
									urlSources: {},
									trigger: function trigger() {
										_this10.setFlowsForQuality(Lampa.Player.playdata());
									}
								};
								if (links[0]) {
									qualities[q].urlSources[links[0]] = itemSourceName;
								}
								if (links.length > 1) {
									for (var i = 1; i < links.length; i++) {
										qualities[q].urlSources[links[i]] = itemSourceName;
									}
								}
							} else {
								qualities[q].reserve = qualities[q].reserve.concat(links);
								for (var i = 0; i < links.length; i++) {
									if (links[i] && !qualities[q].urlSources[links[i]]) {
										qualities[q].urlSources[links[i]] = itemSourceName;
									}
								}
							}
						};
						for (var q in itemQuality) {
							process(q);
						}
					});
					var keys = Lampa.Arrays.getKeys(qualities);
					var sortedQualities = {};
					keys.sort(function (a, b) {
						var numA = parseInt((a + "").replace(/[^0-9]/g, "")) || 0;
						var numB = parseInt((b + "").replace(/[^0-9]/g, "")) || 0;
						if (numA === 0 && numB === 0) return (a + "").localeCompare(b + "");
						if (numA === 0) return 1;
						if (numB === 0) return -1;
						return numB - numA;
					});
					keys.forEach(function (key) {
						var qualityInt = parseInt((key + "").replace(/[^0-9]/g, "")) || 0;
						if (qualityInt > 0 && !qualities[key].label) {
							qualities[key].label =
								qualityInt > 1440
									? "4K"
									: qualityInt >= 1440
										? "2K"
										: qualityInt >= 1080
											? "FHD"
											: qualityInt >= 720
												? "HD"
												: "";
						}
						sortedQualities[key] = qualities[key];
					});
					return sortedQualities;
				}
			},
			{
				key: "getSplitLinks",
				value: function getSplitLinks(str) {
					if (typeof str !== "string") {
						if (str && str.url) return [str.url];
						return [String(str)];
					}
					return str.split(" or ");
				}
			},
			{
				key: "getSelectedQuality",
				value: function getSelectedQuality(playData) {
					var selected = null;
					var currentUrl = playData.url;
					var qualities = playData.quality;
					if (playData.quality_switched) {
						for (var q in qualities) {
							if (q == playData.quality_switched) {
								selected = qualities[q];
								break;
							}
						}
					} else {
						for (var q in qualities) {
							var qualityItem = qualities[q];
							if (
								qualityItem.url == currentUrl ||
								qualityItem.reserve.indexOf(currentUrl) >= 0
							) {
								selected = qualityItem;
								break;
							}
						}
					}
					if (!selected) {
						for (var q in qualities) {
							selected = qualities[q];
							break;
						}
					}
					return selected;
				}
			},
			{
				key: "getQualityLevelDown",
				value: function getQualityLevelDown(playData) {
					var selected = this.getSelectedQuality(playData);
					var currentLevel;
					var nextLevel;
					for (var q in playData.quality) {
						if (selected == playData.quality[q]) {
							currentLevel = q;
							break;
						}
					}
					if (currentLevel) {
						var levels = Lampa.Arrays.getKeys(playData.quality);
						levels.sort(function (a, b) {
							return parseInt(b) - parseInt(a);
						});
						levels.forEach(function (lvl) {
							if (
								parseInt(lvl) < parseInt(currentLevel) &&
								!nextLevel &&
								parseInt(lvl) > 360
							) {
								nextLevel = lvl;
							}
						});
					}
					return nextLevel;
				}
			},
			{
				key: "getReserveQuality",
				value: function getReserveQuality(playData) {
					var selected = this.getSelectedQuality(playData);
					var reserveUrl = "";
					if (selected) {
						selected.error.push(
							Lampa.Manifest.app_digital >= 236 ? playData.url : selected.url
						);
						selected.reserve.forEach(function (url) {
							if (selected.used.indexOf(url) == -1 && !reserveUrl) {
								reserveUrl = url;
								selected.used.push(url);
							}
						});
					}
					return reserveUrl;
				}
			},
			{
				key: "getPlayData",
				value: function getPlayData(item) {
					var hash = Lampa.Utils.hash(
						item.season
							? [
									item.season,
									item.season > 10 ? ":" : "",
									item.episode,
									this.object.movie.original_title
								].join("")
							: this.object.movie.original_title
					);
					var quality = this.getQuality(item.quality);
					var data = {
						title: this.object.movie.title || this.object.movie.name,
						url: Lampa.Player.getUrlQuality(quality),
						quality: quality,
						timeline: Lampa.Timeline.view(hash),
						translate_name: item.translate,
						card: this.object.movie
					};
					return data;
				}
			},
			{
				key: "getNextVoice",
				value: function getNextVoice(playData, voiceList, callback) {
					var selectedQuality = this.getSelectedQuality(playData);
					if (selectedQuality) {
						if (
							selectedQuality.reserve.length == 0 ||
							selectedQuality.used.length == selectedQuality.reserve.length
						) {
							var levelDown = this.getQualityLevelDown(playData);
							if (levelDown) {
								playData.quality_switched = levelDown;
								selectedQuality = this.getSelectedQuality(playData);
								Lampa.Arrays.remove(
									selectedQuality.reserve,
									selectedQuality.url
								);
								Lampa.Arrays.insert(
									selectedQuality.reserve,
									0,
									selectedQuality.url
								);
							} else {
								selectedQuality = null;
							}
						}
					}
					if (!selectedQuality) {
						Utils.modalChoiceTranstale({
							from: voiceList.find(function (v) {
								return v.selected;
							}).name,
							voicelist: voiceList
						});
					} else {
						playData.url = this.getReserveQuality(playData);
						callback(playData.url || "nofound");
						this.setFlowsForQuality(playData);
					}
				}
			},
			{
				key: "setFlowsForQuality",
				value: function setFlowsForQuality(playData) {
					if (!playData || !playData.quality) {
						return;
					}

					var qualityKeys = Object.keys(playData.quality);

					if (qualityKeys.length === 1 && qualityKeys[0] === "auto") {
						var autoQuality = playData.quality["auto"];
						var autoUrl = autoQuality.url || autoQuality;
						if (typeof autoUrl === "string" && autoUrl) {
							var sourceName = (autoQuality.urlSources && autoQuality.urlSources[autoUrl]) || "";
							var subtitle = sourceName 
								? sourceName + " • " + Lampa.Utils.shortText(autoUrl, 30)
								: Lampa.Utils.shortText(autoUrl, 35);
							var flows = [
								{
									title: "Поток 1",
									subtitle: subtitle,
									url: autoUrl,
									selected: true
								}
							];
							Lampa.PlayerPanel.setFlows(flows);
						}
						return;
					}

					var selectedQuality = this.getSelectedQuality(playData);

					if (selectedQuality) {
						var flows = [];
						var urlSources = selectedQuality.urlSources || {};
						var urls = [selectedQuality.url]
							.concat(
								selectedQuality.reserve.filter(function (u) {
									return u !== selectedQuality.url;
								})
							)
							.filter(function (u) {
								return selectedQuality.error.indexOf(u) == -1;
							});
						if (urls.length > 0) {
							urls.forEach(function (url, index) {
								var sourceName = urlSources[url] || "";
								var subtitle = sourceName 
									? sourceName + " • " + Lampa.Utils.shortText(url, 30)
									: Lampa.Utils.shortText(url, 35);
								flows.push({
									title: "Поток " + (index + 1),
									subtitle: subtitle,
									url: url,
									selected: url == selectedQuality.url
								});
							});
						}
						Lampa.PlayerPanel.setFlows(flows.length ? flows : false);
					}
				}
			},
			{
				key: "movie",
				value: function movie(data) {
					var _this11 = this;
					var playerType = Utils.player();
					data.translates.sort(function (a, b) {
						var qA = parseInt(a.maxquality) || 0;
						var qB = parseInt(b.maxquality) || 0;
						if (qB !== qA) return qB - qA;
						var isDubA = Config.filter_db.filter(function (f) {
							return a.translate.toLowerCase().indexOf(f.toLowerCase()) >= 0;
						}).length;
						var isDubB = Config.filter_db.filter(function (f) {
							return b.translate.toLowerCase().indexOf(f.toLowerCase()) >= 0;
						}).length;
						if (isDubA && !isDubB) return -1;
						if (!isDubA && isDubB) return 1;
						return 0;
					});
					var savedVoice = this.voice.get();
					if (!savedVoice) {
						savedVoice = Utils.voice(data.translates[0]);
					}
					var currentTranslates = data.translates.filter(function (t) {
						return Utils.compareVoice(Utils.voice(t), savedVoice);
					});
					var hash = Lampa.Utils.hash(this.object.movie.original_title);
					if (playerType == "inner") {
						this.extract.links([currentTranslates]).then(function (links) {
							preprocessLinksWithM3u8(links, function (processedLinks) {
								if (Lampa.Player.opened()) {
									Lampa.Player.close();
								}
								var voiceovers = [];
								var quality = _this11.getQuality(processedLinks);
								var subtitleItem = processedLinks.find(function (i) {
									return i.subtitles;
								});
								var grouped = {};
								data.translates.forEach(function (item) {
									var voiceName = item.translate;
									if (!grouped[voiceName]) {
										grouped[voiceName] = {
											item: item,
											sources: [],
											maxquality: 0
										};
									}
									var srcName = item.source_name || "";
									if (
										srcName &&
										grouped[voiceName].sources.indexOf(srcName) === -1
									) {
										grouped[voiceName].sources.push(srcName);
									}
									var itemQuality = parseInt(item.maxquality) || 0;
									if (itemQuality > grouped[voiceName].maxquality) {
										grouped[voiceName].maxquality = itemQuality;
									}
								});
								for (var voiceName in grouped) {
									var group = grouped[voiceName];
									var item = group.item;
									var subtitleParts = [];
									if (group.sources.length > 0)
										subtitleParts.push(group.sources.join(", "));
									if (group.maxquality > 0)
										subtitleParts.push(group.maxquality + "p");
									voiceovers.push({
										selected: Utils.compareVoice(savedVoice, voiceName),
										name: voiceName,
										title: voiceName,
										subtitle: subtitleParts.join(" • "),
										onSelect: function onSelect() {
											_this11.voice.set(this.name);
											Lampa.Player.loading(true);
											_this11.movie(data);
										}
									});
								}
								if (
									!voiceovers.find(function (v) {
										return v.selected;
									})
								) {
									voiceovers[0].selected = true;
								}
								var playData = {
									title:
										_this11.object.movie.title || _this11.object.movie.name,
									url: processedLinks.length
										? Lampa.Player.getUrlQuality(quality)
										: "nofound",
									quality: quality,
									timeline: Lampa.Timeline.view(hash),
									subtitles: subtitleItem ? subtitleItem.subtitles : false,
									card: _this11.object.movie,
									voiceovers: voiceovers,
									error: function error(e, callback) {
										_this11.on_error_timer = setTimeout(function () {
											_this11.getNextVoice(e, voiceovers, callback);
										}, 2000);
									}
								};
								Lampa.Player.runas("inner");
								Lampa.Player.play(playData);
								Lampa.Player.playlist([]);
								_this11.setFlowsForQuality(playData);
							});
						});
					} else {
						Utils.selectChoiceTranstale(
							data.translates,
							savedVoice,
							function (selected) {
								_this11.voice.set(Utils.voice(selected));
								_this11.extract
									.links([
										data.translates.filter(function (t) {
											return Utils.compareVoice(
												Utils.voice(t),
												Utils.voice(selected)
											);
										})
									])
									.then(function (links) {
										if (links.length == 0) {
											return Lampa.Bell.push({
												text: "Не удалось найти ссылок, выберите другой перевод",
												time: 5000
											});
										}
										var quality = _this11.getQuality(links);
										var subtitleItem = links.find(function (i) {
											return i.subtitles;
										});
										var flows = _this11.extract.flows(quality);
										Utils.selectChoiceFlow(flows, function (flow) {
											var playData = {
												title:
													_this11.object.movie.title ||
													_this11.object.movie.name,
												url: flow.url,
												timeline: Lampa.Timeline.view(hash),
												subtitles: subtitleItem ? subtitleItem.subtitles : false
											};
											Lampa.Player.play(playData);
										});
									})
									.catch(function (e) {
										_this11.extract.error(e);
									});
							}
						);
					}
				}
			},
			{
				key: "tv",
				value: function tv(data, allEpisodes, currentEpisode) {
					var _this12 = this;
					var playlist = [];
					var voiceovers = [];
					var savedVoice = this.voice.get();
					Lampa.Controller.toggle("content");
					Utils.sortDUBTranstale(data.translates);
					var grouped = {};
					data.translates.forEach(function (item) {
						var voiceName = item.name;
						if (!grouped[voiceName]) {
							grouped[voiceName] = { item: item, sources: [], maxquality: 0 };
						}
						var srcName = item.source_name || "";
						if (srcName && grouped[voiceName].sources.indexOf(srcName) === -1) {
							grouped[voiceName].sources.push(srcName);
						}
						var itemQuality = parseInt(item.maxquality) || 0;
						if (itemQuality > grouped[voiceName].maxquality) {
							grouped[voiceName].maxquality = itemQuality;
						}
					});
					for (var voiceName in grouped) {
						var group = grouped[voiceName];
						var item = group.item;
						(function (vName, grp, itm) {
							var subtitleParts = [];
							if (grp.sources.length > 0)
								subtitleParts.push(grp.sources.join(", "));
							if (grp.maxquality > 0) subtitleParts.push(grp.maxquality + "p");
							voiceovers.push({
								name: vName,
								title: vName,
								subtitle: subtitleParts.join(" • "),
								selected: Utils.compareVoice(vName, savedVoice),
								onSelect: function onSelect() {
									_this12.voice.set(vName);
									Lampa.Player.loading(true);
									_this12.extract
										.voice(data.sources)
										.then(function (newData) {
											newData.sources = data.sources;
											_this12.tv(newData, allEpisodes, currentEpisode);
										})
										.catch(function (e) {})
										.finally(function () {
											Lampa.Player.loading(false);
										});
								}
							});
						})(voiceName, group, item);
					}
					if (
						!voiceovers.find(function (v) {
							return v.selected;
						})
					) {
						voiceovers[0].selected = true;
					}
					allEpisodes.forEach(function (episode) {
						var playItem = data.plays.find(function (p) {
							return p.e == episode.number;
						});
						if (playItem) {
							var playlistItem = {
								number: episode.number,
								title: episode.title,
								timeline: episode.timeline,
								launch_player: "inner",
								url: function url(callback) {
									var playerType = Utils.player();
									if (playerType == "inner") {
										Lampa.Player.loading(true);
										_this12.extract
											.links([
												data.plays.filter(function (p) {
													return p.e == episode.number;
												})
											])
											.then(function (links) {
												if (links.length == 0) {
													playlistItem.url = "nofound";
													callback();
												} else {
													playlistItem.quality = _this12.getQuality(links);
													playlistItem.url = Lampa.Player.getUrlQuality(
														playlistItem.quality
													);
													callback();
													setTimeout(function () {
														_this12.setFlowsForQuality({
															url:
																typeof playlistItem.url === "string"
																	? playlistItem.url
																	: "",
															quality: playlistItem.quality,
															quality_switched: null
														});
													}, 100);
												}
											})
											.catch(function () {
												playlistItem.url = "nofound";
												callback();
											})
											.finally(function () {
												Lampa.Player.loading(false);
											});
									} else {
										Utils.selectChoiceTranstale(
											data.translates,
											Utils.voice(
												voiceovers.find(function (v) {
													return v.selected;
												})
											),
											function (selected) {
												_this12.voice.set(Utils.voice(selected));
												_this12.extract
													.voice(data.sources)
													.then(function (newData) {
														return _this12.extract.links([
															newData.plays.filter(function (p) {
																return p.e == episode.number;
															})
														]);
													})
													.then(function (links) {
														if (links.length == 0) {
															throw new Error(700);
														}
														var quality = _this12.getQuality(links);
														var subtitleItem = links.find(function (i) {
															return i.subtitles;
														});
														var flows = _this12.extract.flows(quality);
														Utils.selectChoiceFlow(flows, function (flow) {
															var playData = {
																title: episode.title,
																url: flow.url,
																timeline: episode.timeline,
																subtitles: subtitleItem
																	? subtitleItem.subtitles
																	: false
															};
															episode.mark();
															Lampa.Player.play(playData);
														});
													})
													.catch(function (e) {
														_this12.extract.error(e);
													});
											}
										);
									}
								},
								card: _this12.object.movie,
								voiceovers: voiceovers,
								callback: function callback() {
									episode.mark();
									currentEpisode = episode;
								},
								error: function error(e, callback) {
									_this12.on_error_timer = setTimeout(function () {
										_this12.getNextVoice(e, voiceovers, callback);
									}, 2000);
								}
							};
							playlist.push(playlistItem);
						}
					});
					var startEpisode = playlist.find(function (p) {
						return p.number == currentEpisode.number;
					});
					if (!startEpisode) {
						return Utils.modalChoiceTranstale({
							from: voiceovers.find(function (v) {
								return v.selected;
							}).name,
							voicelist: voiceovers
						});
					}
					startEpisode.url(function () {
						if (Lampa.Player.opened()) {
							Lampa.Player.close();
						}
						Lampa.Player.runas("inner");
						Lampa.Player.play(startEpisode);
						Lampa.Player.playlist(playlist);

						if (
							startEpisode.quality &&
							Object.keys(startEpisode.quality).length > 0
						) {
							_this12.setFlowsForQuality({
								url:
									typeof startEpisode.url === "string" ? startEpisode.url : "",
								quality: startEpisode.quality,
								quality_switched: null
							});
						}
					});
				}
			}
		]);
		return PlayerController;
	})();

	var OnlineStart = (function () {
		function OnlineStart(object) {
			classCallCheck(this, OnlineStart);
			var _this = this;
			this.object = object;

			if (isUsingBwa()) {
				var bwaCode = getBwaCode();
				if (!bwaCode) {
					Lampa.Noty.show("BWA код не указан. Укажите его в настройках.");
					return;
				}
				initBwaUserScript(function (success) {
					_this.startPlay();
				});
			} else {
				var serverUrl = getServerUrl();
				if (!serverUrl) {
					Lampa.Noty.show("Сервер не указан. Добавьте сервер в настройках.");
					return;
				}
				this.startPlay();
			}
		}
		createClass(OnlineStart, [
			{
				key: "startPlay",
				value: function startPlay() {
					if (this.object.movie.name) {
						this.tv();
					} else {
						this.movie();
					}
				}
			},
			{
				key: "movie",
				value: function movie() {
					var _this13 = this;
					var extractor = new ApiExtractor(this.object);
					var controller = new PlayerController(this.object);
					extractor
						.movie({
							movie: this.object.movie,
							type: "movie"
						})
						.then(function (result) {
							Lampa.Favorite.add("history", _this13.object.movie, 100);
							controller.movie(result);
						})
						.catch(function (error) {
							extractor.error(error);
						});
				}
			},
			{
				key: "tv",
				value: function tv() {
					Lampa.Activity.push({
						url: "",
						title: "",
						component: "episodes",
						movie: this.object.movie,
						page: 1
					});
				}
			}
		]);
		return OnlineStart;
	})();

	function EpisodeSelector(object) {
		var explorer = new Lampa.Explorer(object);
		var filter = new Lampa.Filter(object);
		var scroll = new Lampa.Scroll({
			mask: true,
			over: true
		});
		var lastFocused;
		var choice = {
			season: 1
		};
		var realSeasonsCount = object.movie.number_of_seasons || 1;
		var seasonsLoaded = false;
		var tvmazeChecked = false;

		this.create = function () {
			var _this_create = this;
			this.getChoice();
			explorer.appendFiles(scroll.render());
			explorer.appendHead(filter.render());
			scroll.body().addClass("torrent-list mapping--list");
			explorer.render().find(".filter--search, .filter--sort").remove();
			scroll.minus(explorer.render().find(".explorer__files-head"));
			this.activity.loader(true);

			var tvId = object.movie.id;
			var imdbId = object.movie.imdb_id;
			var tvdbId = object.movie.tvdb_id;

			var tvmazeCount = TvmazeHelper.getSeasonsCount(tvId);
			if (tvmazeCount) {
				realSeasonsCount = tvmazeCount;
				tvmazeChecked = true;
				loadFirstSeason();
			} else {
				TvmazeHelper.fetch(tvId, imdbId, tvdbId, function (count) {
					tvmazeChecked = true;
					if (count && count > realSeasonsCount) {
						realSeasonsCount = count;
					}
					loadFirstSeason();
				});

				setTimeout(function () {
					if (!seasonsLoaded) {
						loadFirstSeason();
					}
				}, 3000);
			}

			function loadFirstSeason() {
				if (seasonsLoaded) return;

				Lampa.Api.seasons(object.movie, [1], function (result) {
					if (seasonsLoaded) return;

					if (
						result[1] &&
						result[1].seasons_count &&
						result[1].seasons_count > realSeasonsCount
					) {
						realSeasonsCount = result[1].seasons_count;
					}

					if (!tvmazeChecked) {
						var tvmazeCount = TvmazeHelper.getSeasonsCount(tvId);
						if (tvmazeCount && tvmazeCount > realSeasonsCount) {
							realSeasonsCount = tvmazeCount;
						}
					}

					seasonsLoaded = true;
					_this_create.filter();
					_this_create.selected();
					_this_create.activity.loader(false);

					if (
						result[1] &&
						result[1].episodes &&
						result[1].episodes.length &&
						choice.season === 1
					) {
						_this_create.draw(result[1].episodes);
					} else {
						_this_create.load();
					}
				});
			}

			this.activity.toggle();
			return this.render();
		};
		this.setChoice = function (season) {
			choice.season = season;
			var cache = Lampa.Storage.cache("season_choice", "{}", 1000);
			cache[object.movie.id] = season;
			Lampa.Storage.set("season_choice", cache);
		};
		this.getChoice = function () {
			var cache = Lampa.Storage.get("season_choice", "{}");
			if (cache[object.movie.id]) {
				choice.season = Math.max(1, cache[object.movie.id]);
				if (seasonsLoaded && choice.season > realSeasonsCount) {
					choice.season = realSeasonsCount;
				}
			}
		};
		this.filter = function () {
			var _this14 = this;
			filter.addButtonBack();
			filter.onSelect = function (item, selected) {
				_this14.setChoice(selected.season);
				_this14.selected();
				Lampa.Controller.toggle("content");
				_this14.load();
			};
			filter.onBack = function () {
				_this14.start();
			};
		};
		this.selected = function () {
			var title = [];
			var items = [];
			for (var key in choice) {
				if (key == "season") {
					title.push(
						Lampa.Lang.translate("torrent_serial_season") + ": " + choice[key]
					);
				}
			}
			for (var i = 0; i < realSeasonsCount; i++) {
				items.push({
					title: Lampa.Lang.translate("torrent_serial_season") + " " + (i + 1),
					season: i + 1,
					selected: choice.season == i + 1
				});
			}
			filter.set("filter", items);
			filter.chosen("filter", title);
		};
		this.load = function () {
			var _this15 = this;
			this.activity.loader(true);
			var season = choice.season;
			Lampa.Api.clear();
			Lampa.Api.seasons(object.movie, [season], function (result) {
				lastFocused = false;
				scroll.clear();
				scroll.reset();
				if (
					result[season] &&
					result[season].episodes &&
					result[season].episodes.length
				) {
					_this15.draw(result[season].episodes);
				} else {
					_this15.empty();
				}
				_this15.activity.loader(false);
			});
		};
		this.empty = function () {
			var template = Lampa.Template.get("empty_filter");
			var button = $(
				'<div class="simple-button selector"><span>' +
					Lampa.Lang.translate("filter_clarify") +
					"</span></div>"
			);
			button.on("hover:enter", function () {
				filter.render().find(".filter--filter").trigger("hover:enter");
			});
			template.find(".empty-filter__title").remove();
			template
				.find(".empty-filter__buttons")
				.removeClass("hide")
				.append(button);
			scroll.append(template);
			Lampa.Controller.enable("content");
		};
		this.draw = function (episodes) {
			episodes.forEach(function (episode, index) {
				var number = episode.episode_number || index + 1;
				var hash = Lampa.Utils.hash(
					[
						choice.season,
						choice.season > 10 ? ":" : "",
						number,
						object.movie.original_title
					].join("")
				);
				var info = [];
				var date = new Date((episode.air_date + "").replace(/-/g, "/"));
				var now = Date.now();
				var daysLeft = episode.air_date
					? Math.round((date.getTime() - now) / 86400000)
					: 1;
				var releaseDate =
					Lampa.Lang.translate("full_episode_days_left") +
					": " +
					(episode.air_date ? daysLeft : "- -");
				episode.timeline = Lampa.Timeline.view(hash);
				episode.time = Lampa.Utils.secondsToTime(episode.runtime * 60, true);
				episode.title =
					episode.name ||
					Lampa.Lang.translate("torrent_serial_episode") + " " + number;
				episode.quality = daysLeft > 0 ? releaseDate : "";
				episode.number = number;
				if (episode.vote_average) {
					info.push(
						Lampa.Template.get(
							"season_episode_rate",
							{
								rate: parseFloat(episode.vote_average + "").toFixed(1)
							},
							true
						)
					);
				}
				if (episode.air_date) {
					info.push(Lampa.Utils.parseTime(episode.air_date).full);
				}
				episode.info = info.length
					? info
							.map(function (i) {
								return "<span>" + i + "</span>";
							})
							.join('<span class="season-episode-split">●</span>')
					: "";
				var item = Lampa.Template.get("season_episode", episode);
				var loader = item.find(".season-episode__loader");
				var img = item.find(".season-episode__img");
				var updateViewed = function updateViewed(force) {
					item.find(".season-episode__viewed").remove();
					if (Boolean(episode.timeline.percent) || force) {
						item
							.find(".season-episode__img")
							.append(
								'<div class="season-episode__viewed">' +
									Lampa.Template.get("icon_viewed", {}, true) +
									"</div>"
							);
					}
				};
				episode.mark = function () {
					lastFocused = item[0];
					updateViewed(true);
				};
				item
					.find(".season-episode__timeline")
					.append(Lampa.Timeline.render(episode.timeline));
				if (daysLeft > 0) {
					item.css("opacity", "0.5");
				} else {
					updateViewed();
					if (Boolean(episode.timeline.percent)) {
						lastFocused = item[0];
					}
					item.on("hover:enter", function () {
						var extractor = new ApiExtractor(object);
						var controller = new PlayerController(object);
						extractor
							.tv({
								movie: object.movie,
								season: choice.season,
								episode: number,
								type: "episode"
							})
							.then(function (result) {
								Lampa.Favorite.add("history", object.movie, 100);
								controller.tv(result, episodes, episode);
								episode.mark();
								Lampa.Player.callback(function () {
									scroll.update($(lastFocused), true);
									Lampa.Controller.toggle("content");
								});
							})
							.catch(function (error) {
								extractor.error(error);
							});
					});
				}
				item
					.on("hover:focus", function (e) {
						lastFocused = e.target;
						scroll.update($(e.target), true);
					})
					.on("visible", function () {
						var image = item.find("img")[0];
						image.onerror = function () {
							image.src = "./img/img_broken.svg";
						};
						image.onload = function () {
							img.addClass("season-episode__img--loaded");
							loader.remove();
							img.append(
								'<div class="season-episode__episode-number">' +
									("0" + number).slice(-2) +
									"</div>"
							);
						};
						if (episode.still_path) {
							image.src = Lampa.TMDB.image("t/p/w300" + episode.still_path);
						} else if (episode.img) {
							image.src = episode.img;
						} else {
							loader.remove();
							img.append(
								'<div class="season-episode__episode-number">' +
									("0" + number).slice(-2) +
									"</div>"
							);
						}
					})
					.on("hover:hover hover:touch", function (e) {
						lastFocused = e.target;
						Navigator.focused(lastFocused);
					});
				scroll.append(item);
			});
			if (lastFocused) {
				scroll.update($(lastFocused), true);
			}
			Lampa.Layer.visible(scroll.render(true));
			Lampa.Controller.enable("content");
		};
		this.start = function () {
			if (Lampa.Activity.active().activity !== this.activity) {
				return;
			}
			Lampa.Background.immediately(
				Lampa.Utils.cardImgBackgroundBlur(object.movie)
			);
			Lampa.Controller.add("content", {
				toggle: function toggle() {
					Lampa.Controller.collectionSet(scroll.render(), explorer.render());
					Lampa.Controller.collectionFocus(
						lastFocused || false,
						scroll.render()
					);
				},
				left: function left() {
					explorer.toggle();
				},
				right: function right() {
					filter.show(Lampa.Lang.translate("title_filter"), "filter");
				},
				up: function up() {
					if (Navigator.canmove("up")) {
						Navigator.move("up");
					} else {
						Lampa.Controller.toggle("head");
					}
				},
				down: function down() {
					if (Navigator.canmove("down")) {
						Navigator.move("down");
					}
				},
				back: function back() {
					Lampa.Activity.backward();
				}
			});
			Lampa.Controller.toggle("content");
		};
		this.pause = function () {};
		this.stop = function () {};
		this.render = function () {
			return explorer.render();
		};
		this.destroy = function () {
			scroll.destroy();
			filter.destroy();
			explorer.destroy();
			try {
				Lampa.Api.clear();
			} catch (e) {}
		};
	}

	function checkServerAvailability(serverUrl, callback) {
		var baseUrl = serverUrl.replace(/\/+$/, "");
		if (baseUrl.indexOf("http://") !== 0 && baseUrl.indexOf("https://") !== 0) {
			baseUrl = "http://" + baseUrl;
		}
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
					if (json && json.memkey) memkey = json.memkey;
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

	function openServerInput(callback) {
		Lampa.Input.edit(
			{
				title: "Адрес сервера",
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
				}
				if (callback) callback(new_value);
			}
		);
	}

	function openServerMenu(callback) {
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

		items.push({ title: "Добавить сервер", add: true });

		var enabled = Lampa.Controller.enabled().name;

		Lampa.Select.show({
			title: "Выбор сервера",
			items: items,
			onBack: function () {
				Lampa.Controller.toggle(enabled);
			},
			onSelect: function (item) {
				if (item.add) {
					openServerInput(function () {
						Lampa.Controller.toggle(enabled);
						if (callback) callback();
					});
				} else if (item.selected) {
					Lampa.Select.show({
						title: formatServerDisplay(servers[item.index]),
						items: [
							{ title: "Редактировать", edit: true },
							{ title: "Удалить", remove: true }
						],
						onBack: function () {
							Lampa.Controller.toggle(enabled);
							if (callback) callback();
						},
						onSelect: function (a) {
							if (a.edit) {
								Lampa.Input.edit(
									{
										title: "Адрес сервера",
										value: servers[item.index],
										placeholder: "192.168.1.1:9118",
										nosave: true,
										free: true,
										nomic: true
									},
									function (new_value) {
										if (new_value && new_value !== servers[item.index]) {
											servers[item.index] = new_value;
											Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
										}
										Lampa.Controller.toggle(enabled);
										if (callback) callback();
									}
								);
							} else if (a.remove) {
								removeServer(item.index);
								Lampa.Controller.toggle(enabled);
								if (callback) callback();
							}
						}
					});
				} else {
					setActiveServerIndex(item.index);
					Lampa.Controller.toggle(enabled);
					if (callback) callback();
				}
			}
		});
	}

	function detectAvailableSources(callback) {
		var baseUrl = isUsingBwa()
			? Lampa.Utils.protocol() + BWA_HOST
			: getServerUrl();

		if (!baseUrl) {
			callback(null, "Сервер не указан");
			return;
		}

		var checkUrl =
			baseUrl +
			"/lite/events?life=true&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar&original_title=Avatar&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest";
		checkUrl = addAuthParams(checkUrl);

		var attempts = 0;
		var maxAttempts = 20;
		var memkey = "";
		var foundSources = [];
		var rchInitialized = false;
		var notyInterval;
		var searchDone = false;

		function updateNoty() {
			if (!searchDone) {
				Lampa.Noty.show("Поиск источников...");
			}
		}

		updateNoty();
		notyInterval = setInterval(updateNoty, 2000);

		var originalCallback = callback;
		callback = function (sources, error) {
			searchDone = true;
			clearInterval(notyInterval);
			originalCallback(sources, error);
		};

		function extractSources(sources) {
			var result = [];
			if (!sources || !Lampa.Arrays.isArray(sources)) return result;

			sources.forEach(function (src) {
				if (src.show === false) return;

				var balanser = (src.balanser || "").toLowerCase();
				if (!balanser) return;

				var found = false;
				for (var i = 0; i < DEFAULT_SOURCES.length; i++) {
					var defSrc = DEFAULT_SOURCES[i];
					var ids = Lampa.Arrays.isArray(defSrc.id) ? defSrc.id : [defSrc.id];

					for (var j = 0; j < ids.length; j++) {
						if (ids[j].toLowerCase() === balanser) {
							if (result.indexOf(ids[0]) === -1) {
								result.push(ids[0]);
							}
							found = true;
							break;
						}
					}
					if (found) break;
				}

				if (!found && result.indexOf(balanser) === -1) {
					result.push(balanser);
				}
			});
			return result;
		}

		function poll() {
			var net = new Lampa.Reguest();
			net.timeout(5000);
			var url = memkey
				? baseUrl +
					"/lifeevents?memkey=" +
					memkey +
					"&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar&original_title=Avatar&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest"
				: checkUrl;
			url = addAuthParams(url);

			net.silent(
				url,
				function (response) {
					var json;
					try {
						json =
							typeof response === "string" ? JSON.parse(response) : response;
					} catch (e) {
						json = response;
					}

					if (json && json.rch && isUsingBwa() && !rchInitialized) {
						rchInitialized = true;
						handleBwaRch(json, function () {
							attempts = 0;
							memkey = "";
							setTimeout(poll, 500);
						});
						return;
					}

					var sources =
						json && json.online
							? json.online
							: Lampa.Arrays.isArray(json)
								? json
								: [];

					if (json && json.accsdb) {
						callback(null, "Доступ запрещён");
						return;
					}
					if (json && json.memkey) memkey = json.memkey;

					var newSources = extractSources(sources);

					newSources.forEach(function (s) {
						if (foundSources.indexOf(s) === -1) foundSources.push(s);
					});

					if (json && json.ready) {
						callback(
							foundSources.length > 0 ? foundSources : null,
							foundSources.length === 0 ? "Источники не найдены" : null
						);
						return;
					}

					if (Lampa.Arrays.isArray(json) && foundSources.length > 0) {
						callback(foundSources, null);
						return;
					}

					attempts++;
					if (attempts >= maxAttempts) {
						callback(
							foundSources.length > 0 ? foundSources : null,
							foundSources.length === 0 ? "Источники не найдены" : null
						);
					} else {
						setTimeout(poll, 1000);
					}
				},
				function (error) {
					callback(null, "Ошибка соединения");
				},
				false,
				{ dataType: "text" }
			);
		}
		poll();
	}

	function openSourcesMenu(callback) {
		var enabled = Lampa.Controller.enabled().name;
		var selected = getSelectedSources();

		var items = [];

		items.push({
			title: "Подобрать автоматически",
			auto: true
		});

		items.push({
			title: "Выбрать все источники",
			selectAll: true,
			subtitle: "Может вызвать баги и увеличит задержку при открытии плеера"
		});

		items.push({
			title: "Сбросить по умолчанию",
			reset: true
		});

		DEFAULT_SOURCES.forEach(function (src) {
			var firstId = Lampa.Arrays.isArray(src.id) ? src.id[0] : src.id;
			items.push({
				title: src.name,
				source: firstId,
				checkbox: true,
				checked: selected.indexOf(firstId) !== -1
			});
		});

		Lampa.Select.show({
			title: "Выбор источников",
			items: items,
			onBack: function () {
				var newSources = items
					.filter(function (i) {
						return i.checkbox && i.checked;
					})
					.map(function (i) {
						return i.source;
					});
				if (newSources.length === 0) newSources = getDefaultEnabledSources();
				setSelectedSources(newSources);
				Lampa.Controller.toggle(enabled);
				if (callback) callback();
			},
			onSelect: function (item) {
				if (item.auto) {
					detectAvailableSources(function (sources, error) {
						if (error) {
							Lampa.Noty.show(error);
							return;
						}
						if (sources && sources.length > 0) {
							items.forEach(function (i) {
								if (i.checkbox) {
									i.checked = sources.indexOf(i.source) !== -1;
								}
							});
							setSelectedSources(sources);
							Lampa.Noty.show("Найдено источников: " + sources.length);
							Lampa.Select.close();
							openSourcesMenu(callback);
						}
					});
					return;
				}
				if (item.selectAll) {
					var allSources = [];
					items.forEach(function (i) {
						if (i.checkbox) {
							i.checked = true;
							allSources.push(i.source);
						}
					});
					setSelectedSources(allSources);
					Lampa.Noty.show("Выбраны все источники (" + allSources.length + ")");
					Lampa.Select.close();
					openSourcesMenu(callback);
					return;
				}
				if (item.reset) {
					var defaultSources = getDefaultEnabledSources();
					items.forEach(function (i) {
						if (i.checkbox) {
							i.checked = defaultSources.indexOf(i.source) !== -1;
						}
					});
					setSelectedSources(defaultSources);
					Lampa.Noty.show("Источники сброшены");
					Lampa.Select.close();
					openSourcesMenu(callback);
					return;
				}
				item.checked = !item.checked;
			}
		});
	}

	function loadPublicServers() {
		var enabled = Lampa.Controller.enabled().name;
		var cached = getCachedPublicServers();

		if (cached.length > 0) {
			showPublicServersMenu(cached, enabled);
		} else {
			fetchAndCheckPublicServers(enabled);
		}
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

		items.push({ title: "Обновить список", refresh: true });
		items.push({ title: "Публичные серверы", separator: true });

		workingServers.forEach(function (url) {
			var normalizedUrl = normalizeUrl(url);
			var isAdded = normalizedUserServers.indexOf(normalizedUrl) !== -1;
			items.push({
				title: formatServerDisplay(url),
				url: url,
				subtitle: isAdded ? "Уже добавлен" : ""
			});
		});

		Lampa.Select.show({
			title: "Публичные серверы (" + workingServers.length + ")",
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
					Lampa.Settings.update();
				} else {
					var servers = getServersList();
					var idx = servers.indexOf(item.url);
					if (idx !== -1) {
						setActiveServerIndex(idx);
						Lampa.Settings.update();
					}
				}
				Lampa.Controller.toggle(enabled);
			}
		});
	}

	function fetchAndCheckPublicServers(enabled, forceRefresh) {
		Lampa.Noty.show("Загрузка...");

		var network = new Lampa.Reguest();
		network.timeout(10000);
		network.silent(
			"https://amik22.github.io/j/work.json",
			function (json) {
				if (!Lampa.Arrays.isArray(json) || json.length === 0) {
					Lampa.Noty.show("Серверы не найдены");
					return;
				}

				var serversToCheck = [];
				json.forEach(function (server) {
					if (server.base_url) serversToCheck.push(server.base_url);
				});

				if (serversToCheck.length === 0) {
					Lampa.Noty.show("Серверы не найдены");
					return;
				}

				var workingServers = [];
				var checked = 0;
				var total = serversToCheck.length;
				var notyInterval;

				function updateNoty() {
					Lampa.Noty.show("Проверка серверов " + checked + "/" + total);
				}

				updateNoty();
				notyInterval = setInterval(updateNoty, 2000);

				serversToCheck.forEach(function (serverUrl) {
					checkServerAvailability(serverUrl, function (isWorking) {
						checked++;
						if (isWorking) workingServers.push(serverUrl);

						updateNoty();

						if (checked === total) {
							clearInterval(notyInterval);

							if (workingServers.length === 0) {
								Lampa.Noty.show("Рабочие серверы не найдены");
								return;
							}

							setCachedPublicServers(workingServers);
							showPublicServersMenu(workingServers, enabled);
						}
					});
				});
			},
			function () {
				Lampa.Noty.show("Ошибка загрузки");
			}
		);
	}

	function initSettings() {
		Lampa.Settings.listener.follow("open", function (event) {
			if (event.name == "main") {
				if (
					Lampa.Settings.main()
						.render()
						.find('[data-component="online_settings"]').length == 0
				) {
					Lampa.SettingsApi.addComponent({
						component: "online_settings",
						name: "Онлайн HFix",
						icon: ONLINE_ICON,
						before: "interface"
					});
				}
				Lampa.Settings.main().update();
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_mode_title", type: "title" },
			field: { name: "Режим работы" }
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_use_bwa_toggle", type: "trigger", default: false },
			field: {
				name: "Использовать BWA",
				description: "Переключить между сервером и BWA"
			},
			onChange: function (value) {
				setUseBwa(value);
			},
			onRender: function (item) {
				item.find(".settings-param__value").text(isUsingBwa() ? "Да" : "Нет");
				item.on("hover:enter", function () {
					setUseBwa(!isUsingBwa());
					item.find(".settings-param__value").text(isUsingBwa() ? "Да" : "Нет");
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_bwa_code_btn", type: "static" },
			field: {
				name: "BWA код",
				description: "Введите код от bwa.to (например: abc1xyz)"
			},
			onRender: function (item) {
				var code = getBwaCode();
				item.find(".settings-param__value").text(code || "Не указан");
				item.on("hover:enter", function () {
					openBwaCodeInput(function () {
						var newCode = getBwaCode();
						item.find(".settings-param__value").text(newCode || "Не указан");
					});
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_server_title", type: "title" },
			field: { name: "Свой сервер" }
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_add_server_btn", type: "static" },
			field: {
				name: "Добавить сервер",
				description: "Например: 192.168.1.1:9118"
			},
			onRender: function (item) {
				item.on("hover:enter", function () {
					openServerInput(function () {
						Lampa.Settings.update();
					});
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_load_public_btn", type: "static" },
			field: {
				name: "Загрузить публичные серверы",
				description: "Загрузить список бесплатных серверов"
			},
			onRender: function (item) {
				item.on("hover:enter", function () {
					loadPublicServers();
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_sources_title", type: "title" },
			field: { name: "Источники" }
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_sources_btn", type: "static" },
			field: {
				name: "Выбор источников",
				description: "Выбрать балансеры для поиска"
			},
			onRender: function (item) {
				item.on("hover:enter", function () {
					openSourcesMenu();
				});
			}
		});

		Lampa.SettingsApi.addParam({
			component: "online_settings",
			param: { name: "online_servers_title", type: "title" },
			field: { name: "Список серверов" }
		});

		Lampa.Settings.listener.follow("open", function (event) {
			if (event.name == "online_settings") {
				renderServersList(event.body);
			}
		});
	}

	function openBwaCodeInput(callback) {
		var currentCode = getBwaCode();
		Lampa.Input.edit(
			{
				title: "BWA код",
				value: currentCode,
				placeholder: "abc1xyz",
				nosave: true,
				free: true,
				nomic: true
			},
			function (new_value) {
				if (new_value !== null) {
					new_value = new_value.trim();
					setBwaCode(new_value);
					if (new_value) {
						setUseBwa(true);
						Lampa.Noty.show("BWA код сохранён");
					}
					if (callback) callback();
				} else {
					if (callback) callback();
				}
			}
		);
	}

	function renderServersList(body) {
		body.find(".online-server-item").remove();

		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var titleElem = body.find(".settings-param-title").last();

		if (!titleElem.length) titleElem = body.find(".settings-param").last();

		servers.forEach(function (server, index) {
			var isActive = index === activeIndex;
			var hasToken = !!getServerToken(server);
			var statusParts = [];
			if (isActive) statusParts.push("Текущий сервер");
			if (hasToken) statusParts.push("Токен установлен");
			var statusText = statusParts.join(" • ");

			var item = $(
				'<div class="settings-param selector online-server-item" data-server-index="' +
					index +
					'">' +
					'<div class="settings-param__name">' +
					formatServerDisplay(server) +
					"</div>" +
					'<div class="settings-param__value"></div>' +
					(statusText
						? '<div class="settings-param__descr">' + statusText + "</div>"
						: "") +
					"</div>"
			);

			item.on("hover:enter", function () {
				showServerActions(index, function () {
					renderServersList(body);
				});
			});

			titleElem.after(item);
			titleElem = item;
		});

		if (servers.length === 0) {
			var emptyItem = $(
				'<div class="settings-param online-server-item"><div class="settings-param__name" style="opacity: 0.5">Не указан</div></div>'
			);
			titleElem.after(emptyItem);
		}

		body.find(".online-server-item").on("hover:focus", function () {
			Lampa.Params.listener.send("update_scroll_position");
		});

		Lampa.Params.listener.send("update_scroll");
	}

	function showServerActions(index, callback, showTokenMenu) {
		var servers = getServersList();
		var activeIndex = getActiveServerIndex();
		var isActive = index === activeIndex;
		var serverUrl = servers[index];
		var currentToken = getServerToken(serverUrl);
		var items = [];

		if (!isActive) items.push({ title: "Выбрать", select: true });
		if (showTokenMenu) {
			items.push({
				title: currentToken ? "Изменить токен" : "Добавить токен",
				token: true
			});
			if (currentToken)
				items.push({ title: "Удалить токен", removeToken: true });
		}
		items.push({ title: "Редактировать", edit: true });
		items.push({ title: "Удалить", remove: true });

		var enabled = Lampa.Controller.enabled().name;

		Lampa.Select.show({
			title: formatServerDisplay(servers[index]),
			items: items,
			onBack: function () {
				Lampa.Controller.toggle(enabled);
			},
			onSelect: function (item) {
				Lampa.Select.close();

				if (item.select) {
					setActiveServerIndex(index);
					if (callback) callback();
					setTimeout(function () {
						Lampa.Controller.toggle(enabled);
					}, 10);
				} else if (item.token) {
					Lampa.Input.edit(
						{
							title: "Токен сервера",
							value: currentToken,
							nosave: true,
							free: true,
							nomic: true
						},
						function (new_value) {
							if (new_value !== null) {
								setServerToken(serverUrl, new_value.trim());
								if (new_value.trim()) {
									Lampa.Noty.show("Токен сохранён");
								}
							}
							if (callback) callback();
							setTimeout(function () {
								Lampa.Controller.toggle(enabled);
							}, 10);
						}
					);
				} else if (item.removeToken) {
					setServerToken(serverUrl, "");
					Lampa.Noty.show("Токен удалён");
					if (callback) callback();
					setTimeout(function () {
						Lampa.Controller.toggle(enabled);
					}, 10);
				} else if (item.edit) {
					Lampa.Input.edit(
						{
							title: "Адрес сервера",
							value: servers[index],
							placeholder: "192.168.1.1:9118",
							nosave: true,
							free: true,
							nomic: true
						},
						function (new_value) {
							if (new_value && new_value !== servers[index]) {
								var oldToken = getServerToken(servers[index]);
								if (oldToken) {
									setServerToken(servers[index], "");
									setServerToken(new_value, oldToken);
								}
								servers[index] = new_value;
								Lampa.Storage.set(STORAGE_KEY_SERVERS, servers);
							}
							if (callback) callback();
							setTimeout(function () {
								Lampa.Controller.toggle(enabled);
							}, 10);
						}
					);
				} else if (item.remove) {
					setServerToken(servers[index], "");
					removeServer(index);
					if (callback) callback();
					setTimeout(function () {
						Lampa.Controller.toggle(enabled);
					}, 10);
				}
			},
			onLong: function (item) {
				if (item.edit) {
					Lampa.Select.close();
					showServerActions(index, callback, true);
				}
			}
		});
	}

	function initPlugin() {
		if (window.plugin_init) {
			return;
		}
		window.plugin_init = true;
		initSettings();
		Lampa.Component.add("episodes", EpisodeSelector);
		Lampa.VPN.region(function () {});
		Lampa.Listener.follow("full", function (e) {
			if (e.type == "complite") {
				var subtitle = isUsingBwa()
					? "BWA: " +
						(getBwaCode() ? getBwaCode().substring(0, 2) + "****" : "не указан")
					: "Сервер: " + (formatServerDisplay(getServerUrl()) || "не указан");
				var html =
					'<div class="full-start__button selector view--online" data-subtitle="' +
					subtitle +
					'">' +
					ONLINE_ICON +
					"<span>Онлайн</span></div>";
				var button = $(Lampa.Lang.translate(html));
				e.object.activity.render().find(".view--torrent").after(button);
				button.on("hover:enter", function () {
					Lampa.Controller.toggle("content");
					new OnlineStart(e.data);
				});
			}
		});
		var css = `
			<style>
				.connect-broken {
					text-align: center;
					padding-bottom: 1em;
				}

				.connect-broken__title {
					font-size: 2em;
					line-height: 1.4;
				}

				.connect-broken__text {
					font-size: 1.2em;
					padding-top: 1em;
					line-height: 1.4;
				}

				.connect-broken__footer {
					display: flex;
					justify-content: center;
					margin-top: 2em;
				}

				.connect-broken__footer .simple-button {
					margin: 0;
				}

				.modal-qr {
					display: flex;
					align-items: center;
				}

				.modal-qr__left {
					width: 33%;
					flex-shrink: 0;
				}

				.modal-qr__right {
					padding-left: 2em;
				}

				.modal-qr__scan {
					text-align: center;
					padding: 1em;
					background: #fff;
					border-radius: 1em;
					color: #000;
				}

				.modal-qr__img {
					position: relative;
					width: 100%;
					padding-bottom: 100%;
					overflow: hidden;
				}

				.modal-qr__img img {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					opacity: 0;
					transition: opacity .2s;
				}

				.modal-qr__img img.loaded {
					opacity: 1;
				}

				.modal-qr__bot {
					font-size: 1.2em;
					font-weight: 600;
				}

				.modal-qr__text {
					font-size: 1.2em;
					line-height: 1.6;
				}

				.modal-qr__text + .modal-qr__text {
					margin-top: 3em;
				}
				.selectbox-item__subtitle {
					opacity: 0.5;
				}
			</style>
		`;
		$("body").append(css);
	}
	initPlugin();
})();
