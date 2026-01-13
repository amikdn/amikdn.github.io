'use strict';
function _typeof(e) {
    return _typeof = 'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator ? function (e) {
        return typeof e;
    } : function (e) {
        return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? 'symbol' : typeof e;
    }, _typeof(e);
}
!function () {
    function e(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var i = Object.getOwnPropertySymbols(e);
            t && (i = i.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
            }));
            n.push.apply(n, i);
        }
        return n;
    }
    function t(e, t) {
        if (!(e instanceof t)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }
    function n(e, t) {
        for (var n = 0; n < t.length; n++) {
            var i = t[n];
            ;
            ;
            'value' in i && (i.writable = true);
            Object.defineProperty(e, i.key, i);
        }
    }
    function i(e, t, i) {
        return t && n(e.prototype, t), i && n(e, i), Object.defineProperty(e, 'prototype', { writable: false }), e;
    }
    function a(e, t, n) {
        return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: true,
            configurable: true,
            writable: true
        }) : e[t] = n, e;
    }
    var o = function () {
        function e(n) {
            t(this, e);
            this.hash = Lampa.Utils.hash(n.movie.original_title);
            this.field = 'online_selected_voice';
        }
        return i(e, [
            {
                key: 'get',
                value: function () {
                    return Lampa.Storage.get(this.field, '{}')[this.hash] || '';
                }
            },
            {
                key: 'set',
                value: function (e) {
                    var t = Lampa.Storage.get(this.field, '{}');
                    t[this.hash] = e;
                    Lampa.Storage.set(this.field, t);
                }
            }
        ]), e;
    }();
    function r(e) {
        this.data = {};
        this.work = 0;
        this.need = e;
        this.complited = false;
        this.check = function () {
            this.stopped || this.work >= this.need && !this.complited && (this.complited = true, this.onComplite(this.data));
        };
        this.next = function () {
            this.work++;
            this.check();
        };
        this.append = function (e, t) {
            this.work++;
            this.data[e] = t;
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
    var l = {
            cache: {},
            pending: {},
            getCache: function () {
                return window.SEASON_FIX && window.SEASON_FIX.tvmaze_cache ? window.SEASON_FIX.tvmaze_cache : this.cache;
            },
            getSeasonsCount: function (e) {
                var t = this.getCache()[e];
                return t && 'object' === _typeof(t) && Object.keys(t).length > 0 ? Object.keys(t).length : null;
            },
            fetch: function (e, t, n, i) {
                var a = this, o = this.getCache();
                if (o[e] && 'object' === _typeof(o[e])) {
                    i && i(Object.keys(o[e]).length);
                } else {
                    if ('loading' === o[e] || this.pending[e]) {
                        i && (this.pending[e] || (this.pending[e] = []), this.pending[e].push(i));
                    } else {
                        o[e] = 'loading';
                        i && (this.pending[e] = [i]);
                        t || n ? this.fetchFromTvmaze(e, t, n) : this.fetchExternalIds(e, function (t) {
                            t && (t.imdb_id || t.tvdb_id) ? a.fetchFromTvmaze(e, t.imdb_id, t.tvdb_id) : a.finishPending(e, null);
                        });
                    }
                }
            },
            fetchExternalIds: function (e, t) {
                var n = Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : null;
                if (n) {
                    var i = Lampa.TMDB && Lampa.TMDB.api ? Lampa.TMDB.api('tv/' + e + '/external_ids?api_key=' + n) : 'https://api.themoviedb.org/3/tv/' + e + '/external_ids?api_key=' + n;
                    this.request(i, t);
                } else {
                    t(null);
                }
            },
            fetchFromTvmaze: function (e, t, n) {
                var i = this, a = t || n;
                if (a) {
                    var o = 'https://api.tvmaze.com/lookup/shows?' + (t ? 'imdb' : 'thetvdb') + '=' + a;
                    this.request(o, function (t) {
                        if (t && t.id) {
                            var n = 'https://api.tvmaze.com/shows/' + t.id + '/episodes';
                            i.request(n, function (t) {
                                if (t && t.length) {
                                    for (var n = {}, a = 0; a < t.length; a++) {
                                        var o = t[a].season;
                                        n[o] || (n[o] = 0);
                                        n[o]++;
                                    }
                                    var r = i.getCache();
                                    Object.keys(n).length > 0 ? (r[e] = n, i.finishPending(e, Object.keys(n).length)) : (delete r[e], i.finishPending(e, null));
                                } else {
                                    i.finishPending(e, null);
                                }
                            });
                        } else {
                            i.finishPending(e, null);
                        }
                    });
                } else {
                    this.finishPending(e, null);
                }
            },
            finishPending: function (e, t) {
                var n = this.getCache();
                'loading' === n[e] && delete n[e];
                var i = this.pending[e];
                delete this.pending[e];
                i && i.length && i.forEach(function (e) {
                    e(t);
                });
            },
            request: function (e, t) {
                var n = new Lampa.Reguest();
                n.timeout(10000);
                var i = function (e) {
                        t(e);
                    }, a = function () {
                        t(null);
                    };
                -1 !== e.indexOf('themoviedb.org') || -1 !== e.indexOf('apitmdb.') ? n.silent(e, i, a) : n.native(e, i, a);
            }
        }, s = [
            'Анастасия Гайдаржи + Андрей Юрченко',
            'Студии Суверенного Лепрозория',
            'IgVin &amp; Solncekleshka',
            'Студия Пиратского Дубляжа',
            'Gremlin Creative Studio',
            'Alternative Production',
            'Bubble Dubbing Company',
            'HelloMickey Production',
            'Н.Севастьянов seva1988',
            'XDUB Dorama + Колобок',
            'Мобильное телевидение',
            'СПД - Сладкая парочка',
            'BBC Saint-Petersburg',
            'Black Street Records',
            'Intra Communications',
            'Melodic Voice Studio',
            'Selena International',
            'Voice Project Studio',
            'Несмертельное оружие',
            'Петербургский дубляж',
            'Asian Miracle Group',
            'Lizard Cinema Trade',
            'National Geographic',
            'Studio Victory Аsia',
            'True Dubbing Studio',
            'Позитив-Мультимедиа',
            'Премьер Мультимедиа',
            'Уолт Дисней Компани',
            'Family Fan Edition',
            'Paramount Pictures',
            'Parovoz Production',
            'Shadow Dub Project',
            'The Kitchen Russia',
            'Zone Vision Studio',
            'Анастасия Гайдаржи',
            'Иванова и П. Пашут',
            'Малиновский Сергей',
            'Так Треба Продакшн',
            'Back Board Cinema',
            'Paramount Channel',
            'Project Web Mania',
            'RedDiamond Studio',
            'Universal Channel',
            'Zoomvision Studio',
            'НеЗупиняйПродакшн',
            'Селена Интернешнл',
            'Студия \xABСтартрек\xBB',
            'Хихикающий доктор',
            'Четыре в квадрате',
            'Brain Production',
            'Cowabunga Studio',
            'Lucky Production',
            'MC Entertainment',
            'Paramount Comedy',
            'Universal Russia',
            'Анатолий Ашмарин',
            'Андрей Питерский',
            'Васька Куролесов',
            'Екатеринбург Арт',
            'Квадрат Малевича',
            'Первый канал ОРТ',
            'Реальный перевод',
            'Русский Репортаж',
            'Сolumbia Service',
            'Amazing Dubbing',
            'AnimeSpace Team',
            'Cartoon Network',
            'Cinema Prestige',
            'CinemaSET GROUP',
            'DeadLine Studio',
            'DeeAFilm Studio',
            'GreenРай Studio',
            'New Dream Media',
            'Sunshine Studio',
            'Volume-6 Studio',
            'XvidClub Studio',
            'Антонов Николай',
            'Воробьев Сергей',
            'Денис Шадинский',
            'З Ранку До Ночі',
            'Максим Логинофф',
            'Николай Дроздов',
            'Студия Горького',
            'Студийная банда',
            'Ульпаней Эльром',
            'Agatha Studdio',
            'Anything-group',
            'CrazyCatStudio',
            'Creative Sound',
            'DIVA Universal',
            'Garsu Pasaulis',
            'GoodTime Media',
            'Goodtime Media',
            'Hamster Studio',
            'Horizon Studio',
            'Jakob Bellmann',
            'Julia Prosenuk',
            'KosharaSerials',
            'Kulzvuk Studio',
            'Mallorn Studio',
            'Red Head Sound',
            'RedRussian1337',
            'SovetRomantica',
            'SunshineStudio',
            'Syfy Universal',
            'TUMBLER Studio',
            'Viasat History',
            'visanti-vasaer',
            'Анатолий Гусев',
            'Вартан Дохалов',
            'Витя \xABговорун\xBB',
            'Кирдин | Stalk',
            'Л. Володарский',
            'Леша Прапорщик',
            'Максим Жолобов',
            'Медиа-Комплекс',
            'Прайд Продакшн',
            'Русский дубляж',
            'Союзмультфильм',
            'Студия Колобок',
            '5-й канал СПб',
            'ARRU Workshop',
            'Arasi project',
            'Banyan Studio',
            'Bars MacAdams',
            'Bonsai Studio',
            'Byako Records',
            'Dream Records',
            'FiliZa Studio',
            'Filiza Studio',
            'Film Prestige',
            'Flarrow Films',
            'Gezell Studio',
            'Greb&Creative',
            'HamsterStudio',
            'Jetvis Studio',
            'LE-Production',
            'Lizard Cinema',
            'Nazel & Freya',
            'PCB Translate',
            'Rainbow World',
            'Renegade Team',
            'SHIZA Project',
            'Sci-Fi Russia',
            'Amanogawa',
            'The Mike Rec.',
            'VIP Serial HD',
            'VO-Production',
            'VO-production',
            'Victory-Films',
            'ViruseProject',
            'Voice Project',
            'Vulpes Vulpes',
            'АРК-ТВ Studio',
            'Видеопродакшн',
            'Мадлен Дюваль',
            'Мика Бондарик',
            'Наталья Гурзо',
            'Премьер Видео',
            'Семыкина Юлия',
            'Старый Бильбо',
            'Трамвай-фильм',
            'Фортуна-Фильм',
            'Хоррор Мэйкер',
            'Храм Дорам ТВ',
            'Штамп Дмитрий',
            'A. Lazarchuk',
            'AlphaProject',
            'AniLibria.TV',
            'AnimeReactor',
            'Animereactor',
            'BadCatStudio',
            'DreamRecords',
            'General Film',
            'HaseRiLLoPaW',
            'Horror Maker',
            'Ivnet Cinema',
            'Korean Craze',
            'Light Breeze',
            'Mystery Film',
            'Oneinchnales',
            'Profix Media',
            'Psychotronic',
            'RG Paravozik',
            'RG.Paravozik',
            'RussianGuy27',
            'Sony Channel',
            'Train Studio',
            'Trdlo.studio',
            'ViP Premiere',
            'VictoryFilms',
            'VulpesVulpes',
            'Wayland team',
            'sweet couple',
            'Альтера Парс',
            'Видеоимпульс',
            'Гей Кино Гид',
            'Говинда Рага',
            'Деваль Видео',
            'Е. Хрусталёв',
            'К. Поздняков',
            'Кармен Видео',
            'Кинопремьера',
            'Кирилл Сагач',
            'КонтентикOFF',
            'Кубик в Кубе',
            'Кураж-Бамбей',
            'Мьюзик-трейд',
            'Н. Золотухин',
            'Не требуется',
            'Новый Дубляж',
            'Нурмухаметов',
            'Оригинальный',
            'Первый канал',
            'Р. Янкелевич',
            'С. Кузьмичёв',
            'С. Щегольков',
            'Сергей Дидок',
            'Синема Трейд',
            'Синта Рурони',
            'Студия Райдо',
            'Тоникс Медиа',
            'Точка Zрения',
            'Фильмэкспорт',
            'Элегия фильм',
            '1001 cinema',
            'BTI Studios',
            'Cactus Team',
            'CrezaStudio',
            'Crunchyroll',
            'DVD Classic',
            'Description',
            'Eurochannel',
            'FocusStudio',
            'Franek Monk',
            'Gala Voices',
            'Gears Media',
            'GladiolusTV',
            'Gold Cinema',
            'Good People',
            'HiWay Grope',
            'Inter Video',
            'JWA Project',
            'Lazer Video',
            'Max Nabokov',
            'NEON Studio',
            'Neoclassica',
            'New Records',
            'Nickelodeon',
            'Nika Lenina',
            'Oghra-Brown',
            'Paul Bunyan',
            'Rebel Voice',
            'RecentFilms',
            'RiZZ_fisher',
            'Saint Sound',
            'SakuraNight',
            'SnowRecords',
            'Sony Sci-Fi',
            'Sound-Group',
            'StudioFilms',
            'TF-AniGroup',
            'TrainStudio',
            'XDUB Dorama',
            'Zone Studio',
            'Zone Vision',
            'hungry_inri',
            'Варус Видео',
            'Варус-Видео',
            'Видеосервис',
            'Володарский',
            'Г. Либергал',
            'Г. Румянцев',
            'Другое кино',
            'Е. Гаевский',
            'Завгородний',
            'И. Сафронов',
            'И. Степанов',
            'Кенс Матвей',
            'КураСгречей',
            'Лазер Видео',
            'Малиновский',
            'Мастер Тэйп',
            'Неоклассика',
            'Новый Канал',
            'Огородников',
            'Петербуржец',
            'Прямостанов',
            'С. Визгунов',
            'С. Кузнецов',
            'Севастьянов',
            'Студия Трёх',
            'Цікава Ідея',
            'Эй Би Видео',
            'Я. Беллманн',
            '1001cinema',
            '1WinStudio',
            'AXN Sci-Fi',
            'AimaksaLTV',
            'Animegroup',
            'ApofysTeam',
            'AvePremier',
            'BraveSound',
            'CP Digital',
            'CactusTeam',
            'CinemaTone',
            'Contentica',
            'CoralMedia',
            'DniproFilm',
            'ELEKTRI4KA',
            'East Dream',
            'Fox Russia',
            'HiWayGrope',
            'LevshaFilm',
            'MaxMeister',
            'Mega-Anime',
            'MifSnaiper',
            'NewStation',
            'Nice-Media',
            'Pazl Voice',
            'PiratVoice',
            'Postmodern',
            'Rain Death',
            'Reanimedia',
            'Shachiburi',
            'SilverSnow',
            'Sky Voices',
            'SkyeFilmTV',
            'Sony Turbo',
            'Sound Film',
            'StudioBand',
            'TatamiFilm',
            'VGM Studio',
            'VSI Moscow',
            'VoicePower',
            'West Video',
            'W\xB3: voices',
            'eraserhead',
            'Б. Федоров',
            'Бусов Глеб',
            'Ващенко С.',
            'Глуховский',
            'Держиморда',
            'Е. Гранкин',
            'И. Еремеев',
            'Интерфильм',
            'Инфо-фильм',
            'К. Филонов',
            'Карповский',
            'Комедия ТВ',
            'Костюкевич',
            'Мост Видео',
            'Мост-Видео',
            'Н. Антонов',
            'Н. Дроздов',
            'Новый диск',
            'Ох! Студия',
            'Первый ТВЧ',
            'Переводман',
            'С. Казаков',
            'С. Лебедев',
            'С. Макашов',
            'Саня Белый',
            'Союз Видео',
            'Студия NLS',
            'Т.О Друзей',
            'ТВ XXI век',
            'Толстобров',
            'Хуан Рохас',
            'Электричка',
            'Ю. Немахов',
            'диктор CDV',
            '3df voice',
            'AAA-Sound',
            'Andre1288',
            'AniLibria',
            'AniPLague',
            'Astana TV',
            'AveBrasil',
            'AveDorama',
            'BeniAffet',
            'CBS Drama',
            'CLS Media',
            'CasStudio',
            'Discovery',
            'DoubleRec',
            'Epic Team',
            'FanStudio',
            'FilmsClub',
            'Flux-Team',
            'Fox Crime',
            'GREEN TEA',
            'Ghostface',
            'GoodVideo',
            'Gramalant',
            'HighHopes',
            'INTERFILM',
            'JoyStudio',
            'KinoGolos',
            'Kinomania',
            'Kobayashi',
            'LakeFilms',
            'Neo-Sound',
            'NewComers',
            'NewStudio',
            'No-Future',
            'Novamedia',
            'OnisFilms',
            'Persona99',
            'RATTLEBOX',
            'RainDeath',
            'Red Media',
            'SDI Media',
            'SOLDLUCK2',
            'Sawyer888',
            'Sedorelli',
            'Seoul Bay',
            'Sephiroth',
            'ShinkaDan',
            'SmallFilm',
            'SpaceDust',
            'Timecraft',
            'Total DVD',
            'VIZ Media',
            'Video-BIZ',
            'Videogram',
            'fiendover',
            'turok1990',
            'ААА-sound',
            'Амальгама',
            'АрхиТеатр',
            'Васильцев',
            'Весельчак',
            'Видеобаза',
            'Воротилин',
            'Григорьев',
            'Деньщиков',
            'ЕА Синема',
            'Зереницын',
            'Золотухин',
            'И. Клушин',
            'Имидж-Арт',
            'Карапетян',
            'Киномания',
            'Кириллица',
            'Машинский',
            'Мительман',
            'Муравский',
            'Невафильм',
            'Останкино',
            'Причудики',
            'Рыжий пес',
            'С. Дьяков',
            'СВ Студия',
            'СВ-Студия',
            'Самарский',
            'Синема УС',
            'Советский',
            'Солодухин',
            'ТО Друзей',
            'Формат AB',
            'Хрусталев',
            'Шадинский',
            'Ю. Сербин',
            'Ю. Товбин',
            'Янкелевич',
            'AB-Video',
            'ALEKS KV',
            'ANIvoice',
            'AdiSound',
            'AlexFilm',
            'Amalgama',
            'AniMaunt',
            'AniMedia',
            'Animedub',
            'AuraFilm',
            'AzOnFilm',
            'Barin101',
            'ClubFATE',
            'ColdFilm',
            'DeadLine',
            'DexterTV',
            'Extrabit',
            'FilmGate',
            'Fox Life',
            'Foxlight',
            'GetSmart',
            'GoldTeam',
            'GostFilm',
            'Gravi-TV',
            'Hallmark',
            'IdeaFilm',
            'ImageArt',
            'JeFerSon',
            'Jimmy J.',
            'Kerems13',
            'KinoView',
            'Loginoff',
            'LostFilm',
            'MOYGOLOS',
            'Marclail',
            'Milirina',
            'MiraiDub',
            'Murzilka',
            'NovaFilm',
            'OMSKBIRD',
            'Omskbird',
            'Radamant',
            'RealFake',
            'RoxMarty',
            'STEPonee',
            'SorzTeam',
            'Superbit',
            'TurkStar',
            'Ultradox',
            'VashMax2',
            'VendettA',
            'VideoBIZ',
            'WestFilm',
            'XL Media',
            'kubik&ko',
            'metalrus',
            'st.Elrom',
            'Алексеев',
            'Артемьев',
            'АрхиАзия',
            'Бахурани',
            'Бессонов',
            'Васильев',
            'Визгунов',
            'Войсовер',
            'Воронцов',
            'Гаврилов',
            'Гаевский',
            'Горчаков',
            'Дольский',
            'Домашний',
            'Дубровин',
            'Дьяконов',
            'Е. Лурье',
            'Е. Рудой',
            'Журавлев',
            'Заугаров',
            'Индия ТВ',
            'Ист-Вест',
            'Карусель',
            'Кинолюкс',
            'Кузнецов',
            'ЛанселаП',
            'Лексикон',
            'Ленфильм',
            'Либергал',
            'Логинофф',
            'Марченко',
            'Махонько',
            'Медведев',
            'Мельница',
            'Мосфильм',
            'Нарышкин',
            'Оверлорд',
            'Оригинал',
            'Пирамида',
            'С. Рябов',
            'СВ-Дубль',
            'Савченко',
            'Субтитры',
            'Супербит',
            'Тимофеев',
            'Толмачев',
            'Хлопушка',
            'Ю. Живов',
            '5 канал',
            'Amalgam',
            'AniFilm',
            'AniStar',
            'AniWayt',
            'Anifilm',
            'Anistar',
            'AnyFilm',
            'AveTurk',
            'BadBajo',
            'BaibaKo',
            'BukeDub',
            'DeadSno',
            'ELYSIUM',
            'Eladiel',
            'Elysium',
            'F-TRAIN',
            'FireDub',
            'FoxLife',
            'HDrezka',
            'Hamster',
            'Janetta',
            'Jaskier',
            'Kолобок',
            'LeDoyen',
            'Levelin',
            'Liga HQ',
            'Lord32x',
            'MUZOBOZ',
            'Macross',
            'McElroy',
            'MixFilm',
            'NemFilm',
            'Netflix',
            'Octopus',
            'Onibaku',
            'OpenDub',
            'Paradox',
            'PashaUp',
            'RUSCICO',
            'RusFilm',
            'SOFTBOX',
            'Sam2007',
            'SesDizi',
            'ShowJet',
            'SoftBox',
            'SomeWax',
            'TV 1000',
            'TVShows',
            'To4kaTV',
            'Trina_D',
            'Twister',
            'Urasiko',
            'VicTeam',
            'Wakanim',
            'ZM-SHOW',
            'ZM-Show',
            'datynet',
            'lord666',
            'sf@irat',
            'Абдулов',
            'Багичев',
            'Бибиков',
            'Ващенко',
            'Герусов',
            'Данилов',
            'Дасевич',
            'Дохалов',
            'Кипарис',
            'Клюквин',
            'Колобок',
            'Королев',
            'Королёв',
            'Латышев',
            'Люсьена',
            'Матвеев',
            'Михалев',
            'Морозов',
            'Назаров',
            'Немахов',
            'Никитин',
            'Омикрон',
            'Ошурков',
            'Парадиз',
            'Пепелац',
            'Пифагор',
            'Позитив',
            'Пятница',
            'РуФилмс',
            'Рутилов',
            'СВ-Кадр',
            'Синхрон',
            'Смирнов',
            'Сокуров',
            'Сонотек',
            'Сонькин',
            'Сыендук',
            'Филонов',
            'Хихидок',
            'Яковлев',
            'Яроцкий',
            'заКАДРЫ',
            '100 ТВ',
            '4u2ges',
            'Alezan',
            'Amedia',
            'Ancord',
            'AniDUB',
            'Anubis',
            'Azazel',
            'BD CEE',
            'Berial',
            'Boльгa',
            'Cuba77',
            'D.I.M.',
            'DubLik',
            'Dubляж',
            'Elegia',
            'Emslie',
            'FocusX',
            'GalVid',
            'Gemini',
            'Jetvis',
            'JimmyJ',
            'KANSAI',
            'KOleso',
            'Kansai',
            'Kiitos',
            'L0cDoG',
            'LeXiKC',
            'Lisitz',
            'Mikail',
            'Milvus',
            'MrRose',
            'Nastia',
            'NewDub',
            'OSLIKt',
            'Ozz TV',
            'Ozz.tv',
            'Prolix',
            'RedDog',
            'Rumble',
            'SNK-TV',
            'Satkur',
            'Selena',
            'Shaman',
            'Stevie',
            'Suzaku',
            'TV1000',
            'Tycoon',
            'UAFlix',
            'WVoice',
            'WiaDUB',
            'ZEE TV',
            'Zendos',
            'Zerzia',
            'binjak',
            'den904',
            'kiitos',
            'madrid',
            'neko64',
            'АБыГДе',
            'Агапов',
            'Акалит',
            'Акопян',
            'Акцент',
            'Альянс',
            'Анубис',
            'Арк-ТВ',
            'Бойков',
            'Векшин',
            'Вихров',
            'Вольга',
            'Гоблин',
            'Готлиб',
            'Гризли',
            'Гундос',
            'Гуртом',
            'ДиоНиК',
            'Дьяков',
            'Есарев',
            'Живаго',
            'Жучков',
            'Зебуро',
            'Иванов',
            'Карцев',
            'Кашкин',
            'Килька',
            'Киреев',
            'Козлов',
            'Кондор',
            'Котова',
            'Кошкин',
            'Кравец',
            'Курдов',
            'Лагута',
            'Лапшин',
            'Лизард',
            'Миняев',
            'Мудров',
            'Н-Кино',
            'НЕВА 1',
            'НЛО-TV',
            'Набиев',
            'Нева-1',
            'Пронин',
            'Пучков',
            'Ракурс',
            'Россия',
            'С.Р.И.',
            'Санаев',
            'Светла',
            'Сербин',
            'Стасюк',
            'Строев',
            'ТВ СПб',
            'Товбин',
            'Шварко',
            'Швецов',
            'Шуваев',
            'Amber',
            'AniUA',
            'Anika',
            'Arisu',
            'Cmert',
            'D2Lab',
            'D2lab',
            'DeMon',
            'Elrom',
            'IНТЕР',
            'JetiX',
            'Jetix',
            'Kerob',
            'Lupin',
            'Ozeon',
            'PaDet',
            'RinGo',
            'Ryc99',
            'SHIZA',
            'Solod',
            'To4ka',
            'erogg',
            'ko136',
            'seqw0',
            'ssvss',
            'zamez',
            'Акира',
            'АнВад',
            'Белов',
            'Бигыч',
            'ВГТРК',
            'Велес',
            'Ворон',
            'Гланц',
            'Живов',
            'Игмар',
            'Интер',
            'Котов',
            'Лайко',
            'Мишин',
            'Новий',
            'Перец',
            'Попов',
            'Райдо',
            'РенТВ',
            'Рудой',
            'Рукин',
            'Рыбин',
            'Рябов',
            'С.Р.И',
            'ТВЧ 1',
            'Хабар',
            'Чадов',
            'Штамп',
            'Штейн',
            'Andy',
            'CPIG',
            'Dice',
            'ETV+',
            'Gits',
            'ICTV',
            'Jade',
            'KIHO',
            'Laci',
            'RAIM',
            'SGEV',
            'Tori',
            'Troy',
            'Twix',
            'Vano',
            'Voiz',
            'jept',
            'ИДДК',
            'Инис',
            'Ирэн',
            'Нота',
            'ТВ-3',
            'ТВИН',
            'Твин',
            'Чуев',
            '1+1',
            '2+2',
            '2x2',
            '2х2',
            'AMC',
            'AMS',
            'AOS',
            'CDV',
            'DDV',
            'FDV',
            'FOX',
            'ICG',
            'IVI',
            'JAM',
            'LDV',
            'MCA',
            'MGM',
            'MTV',
            'Oni',
            'QTV',
            'TB5',
            'V1R',
            'VHS',
            'АМС',
            'ГКГ',
            'ДТВ',
            'ИГМ',
            'КТК',
            'МИР',
            'НСТ',
            'НТВ',
            'НТН',
            'РТР',
            'СТС',
            'ТВ3',
            'ТВ6',
            'ТВЦ',
            'ТНТ',
            'ТРК',
            'Че!',
            'D1',
            'R5',
            'К9',
            'Закадровый',
            'Многоголосый'
        ];
    s.sort(function (e, t) {
        return t.length - e.length;
    });
    var y = [
        {
            id: 'rezka',
            name: 'rezka',
            enabled: true
        },
        {
            id: 'rc/rhs',
            name: 'rc/rhs',
            enabled: false
        },
        {
            id: 'rhsprem',
            name: 'rhsprem',
            enabled: true
        },
        {
            id: 'kinopub',
            name: 'kinopub',
            enabled: true
        },
        {
            id: 'vokino',
            name: 'vokino',
            enabled: true
        },
        {
            id: 'mirage',
            name: 'mirage',
            enabled: false
        },
        {
            id: 'alloha',
            name: 'alloha',
            enabled: true
        },
        {
            id: 'rc/filmix',
            name: 'rc/filmix',
            enabled: false
        },
        {
            id: 'rc/fxapi',
            name: 'rc/fxapi',
            enabled: false
        },
        {
            id: 'fxapi',
            name: 'fxapi',
            enabled: false
        },
        {
            id: 'filmix',
            name: 'filmix',
            enabled: false
        },
        {
            id: 'filmixtv',
            name: 'filmixtv',
            enabled: false
        },
        {
            id: [
                'videocdn',
                'lumex'
            ],
            name: 'lumex',
            enabled: true
        },
        {
            id: 'kinogo',
            name: 'kinogo',
            enabled: true
        },
        {
            id: 'vkmovie',
            name: 'VK',
            enabled: false
        },
        {
            id: 'rutubemovie',
            name: 'rutube',
            enabled: false
        },
        {
            id: 'videodb',
            name: 'videodb',
            enabled: false
        },
        {
            id: 'collaps',
            name: 'collaps',
            enabled: false
        },
        {
            id: 'collaps-dash',
            name: 'collaps-dash',
            enabled: false
        },
        {
            id: 'hdvb',
            name: 'hdvb',
            enabled: true
        },
        {
            id: 'zetflix',
            name: 'zetflix',
            enabled: false
        },
        {
            id: 'veoveo',
            name: 'veoveo',
            enabled: false
        },
        {
            id: 'kodik',
            name: 'kodik',
            enabled: true
        },
        {
            id: 'ashdi',
            name: 'ashdi',
            enabled: false
        },
        {
            id: 'kinoukr',
            name: 'kinoukr',
            enabled: false
        },
        {
            id: 'kinotochka',
            name: 'kinotochka',
            enabled: false
        },
        {
            id: 'remux',
            name: 'remux',
            enabled: false
        },
        {
            id: 'iframevideo',
            name: 'iframevideo',
            enabled: false
        },
        {
            id: 'cdnmovies',
            name: 'cdnmovies',
            enabled: false
        },
        {
            id: 'anilibria',
            name: 'anilibria',
            enabled: false
        },
        {
            id: 'animedia',
            name: 'animedia',
            enabled: false
        },
        {
            id: 'animego',
            name: 'animego',
            enabled: false
        },
        {
            id: 'animevost',
            name: 'animevost',
            enabled: false
        },
        {
            id: 'animebesst',
            name: 'animebesst',
            enabled: false
        },
        {
            id: 'redheadsound',
            name: 'redheadsound',
            enabled: false
        },
        {
            id: 'animelib',
            name: 'animelib',
            enabled: false
        },
        {
            id: 'moonanime',
            name: 'moonanime',
            enabled: false
        },
        {
            id: 'vibix',
            name: 'vibix',
            enabled: false
        },
        {
            id: 'vdbmovies',
            name: 'vdbmovies',
            enabled: false
        },
        {
            id: 'fancdn',
            name: 'fancdn',
            enabled: false
        },
        {
            id: 'cdnvideohub',
            name: 'cdnvideohub',
            enabled: false
        },
        {
            id: 'vcdn',
            name: 'vcdn',
            enabled: false
        },
        {
            id: 'hydraflix',
            name: 'hydraflix',
            enabled: false
        },
        {
            id: 'videasy',
            name: 'videasy',
            enabled: false
        },
        {
            id: 'vidsrc',
            name: 'vidsrc',
            enabled: false
        },
        {
            id: 'movpi',
            name: 'movpi',
            enabled: false
        },
        {
            id: 'vidlink',
            name: 'vidlink',
            enabled: false
        },
        {
            id: 'twoembed',
            name: 'twoembed',
            enabled: false
        },
        {
            id: 'autoembed',
            name: 'autoembed',
            enabled: false
        },
        {
            id: 'smashystream',
            name: 'smashystream',
            enabled: false
        },
        {
            id: 'rgshows',
            name: 'rgshows',
            enabled: false
        },
        {
            id: 'pidtor',
            name: 'pidtor',
            enabled: false
        },
        {
            id: 'videoseed',
            name: 'videoseed',
            enabled: false
        },
        {
            id: 'iptvonline',
            name: 'iptvonline',
            enabled: false
        },
        {
            id: 'eneyida',
            name: 'eneyida',
            enabled: false
        },
        {
            id: 'kinobase',
            name: 'kinobase',
            enabled: false
        }
    ];
    function b() {
        return y.filter(function (e) {
            return e.enabled;
        }).map(function (e) {
            return Lampa.Arrays.isArray(e.id) ? e.id[0] : e.id;
        });
    }
    function L() {
        var e = Lampa.Storage.get('online_servers', []);
        if ('string' == typeof e) {
            try {
                e = JSON.parse(e);
            } catch (t) {
                e = [];
            }
        }
        return Lampa.Arrays.isArray(e) || (e = []), e;
    }
    function _() {
        var e = L(), t = parseInt(Lampa.Storage.get('online_active_server', 0)) || 0;
        return t >= e.length && (t = 0), t;
    }
    function w(e) {
        Lampa.Storage.set('online_active_server', e);
    }
    function k(e) {
        if (!e) {
            return false;
        }
        var t = L();
        return -1 === t.indexOf(e) && (t.push(e), Lampa.Storage.set('online_servers', t), true);
    }
    function S(e) {
        var t = L();
        return e >= 0 && e < t.length && (t.splice(e, 1), Lampa.Storage.set('online_servers', t), _() >= t.length && w(Math.max(0, t.length - 1)), true);
    }
    function x() {
        var e = L();
        if (0 === e.length) {
            return '';
        }
        var t = e[_()] || '';
        return t && 0 !== (t = t.replace(/\/+$/, '')).indexOf('http://') && 0 !== t.indexOf('https://') && (t = 'http://' + t), t;
    }
    function C(e) {
        return e.replace(/^https?:\/\//, '');
    }
    function A() {
        var e = Lampa.Storage.get('online_sources', []);
        if ('string' == typeof e) {
            try {
                e = JSON.parse(e);
            } catch (t) {
                e = [];
            }
        }
        return Lampa.Arrays.isArray(e) && 0 !== e.length || (e = b()), e.map(function (e) {
            return Lampa.Arrays.isArray(e) ? e[0] : e;
        });
    }
    function T(e) {
        Lampa.Storage.set('online_sources', e);
    }
    function O() {
        return Lampa.Storage.get('online_bwa_code', '');
    }
    function P() {
        return Lampa.Storage.get('online_use_bwa', false);
    }
    function F(e) {
        Lampa.Storage.set('online_use_bwa', e);
    }
    function R() {
        var e = Lampa.Storage.get('online_server_tokens', '{}');
        if ('string' == typeof e) {
            try {
                e = JSON.parse(e);
            } catch (t) {
                e = {};
            }
        }
        return e || {};
    }
    function j(e) {
        return R()[e] || '';
    }
    function D(e, t) {
        var n = R();
        t ? n[e] = t : delete n[e];
        Lampa.Storage.set('online_server_tokens', n);
    }
    var E = {
        lampa: 'Lampa.',
        get stream() {
            if (P()) {
                return 'rc.bwa.to';
            }
            var e = x();
            return e ? e.replace(/^https?:\/\//, '') : '';
        },
        get sources() {
            return A();
        },
        nolite: [],
        filter_ts: [
            'ts',
            'тс',
            'tс',
            'тc',
            'чистый звук'
        ],
        filter_hr: [
            'HDR10',
            'HEVC'
        ],
        filter_db: [
            'Дубляж',
            'Дублированный',
            'Red Head Sound',
            'Мосфильм',
            'Dubляж'
        ],
        filter_tv: [],
        filter_uk: [
            'uk',
            'ukr',
            'укр'
        ],
        filter_du: [
            'Дубляж',
            'Дублированный',
            'Полное дублирование'
        ],
        rename_translate: {
            HDRezka: [
                'HDrezka Studio',
                'RezkaStudio',
                'Rezka Studio',
                'Rezka'
            ],
            StudioBand: [
                'Студийная Банда',
                'StudioBand',
                'Studio Band'
            ],
            'Дубляж': [
                'Дубляж',
                'Дублированный',
                'Полное дублирование'
            ],
            'Оригинал': [
                'Не требуется',
                'Оригинальный'
            ],
            'Закадровый': [
                'Многоголосый',
                'Закадровый'
            ]
        },
        filter_translate: s
    };
    function V(e, t) {
        var n = e.toLowerCase().replace(/ /g, '').split(/\.|\[/)[0], i = t.toLowerCase().replace(/ /g, '').split(/\.|\[/)[0];
        return !(!n || !i) && (n.indexOf(i) > -1 || i.indexOf(n) > -1);
    }
    function q() {
        var e = Lampa.Storage.get('region', '{}');
        return e.code ? e.code : 'ru';
    }
    function I(e) {
        return e.translate || e.name || e.details || e.title || '';
    }
    function B(e) {
        return e.forEach(function (e) {
            [
                'translate',
                'title',
                'details',
                'name'
            ].forEach(function (t) {
                if (e[t]) {
                    if (0 === e[t].indexOf('По умолчанию')) {
                        return;
                    }
                    if (/^\d{3,4}p$/i.test(e[t])) {
                        return void (e[t] = 'По умолчанию');
                    }
                    var l = /\(([^()]+)\)$/, s = 1, c = e[t], u;
                    if (e[t] = ((u = c.match(l)) && u[s] ? u[s] : c), /^\d{3,4}p$/i.test(e[t])) {
                        return void (e[t] = 'По умолчанию');
                    }
                    var n = false;
                    E.filter_translate.forEach(function (i) {
                        e[t].toLowerCase().indexOf(i.toLowerCase()) >= 0 && (e[t] = i, n = true);
                    });
                    var i = function (i) {
                        E.rename_translate[i].forEach(function (a) {
                            e[t].toLowerCase() == a.toLowerCase() && (e[t] = i, n = true);
                        });
                    };
                    for (var a in E.rename_translate)
                        i(a);
                    if (E.filter_du.forEach(function (i) {
                            e[t].toLowerCase().indexOf(i.toLowerCase()) >= 0 && (e[t] = i, n = true);
                        }), !n) {
                        var o = e.maxquality || e.quality || '';
                        if ('object' === _typeof(o)) {
                            var r = Object.keys(o);
                            o = r.length > 0 ? r[r.length - 1] : '';
                        }
                        e[t] = o ? 'По умолчанию (' + o + ')' : 'По умолчанию';
                    }
                }
                var l, s, c, u;
            });
        }), e;
    }
    var M = {
        compareVoice: V,
        region: q,
        voice: I,
        player: function () {
            return Lampa.Platform.is('tizen') || Lampa.Platform.is('webos') ? 'inner' : Lampa.Storage.field('player');
        },
        filterTranslate: function (e) {
            if (!e || !Lampa.Arrays.isArray(e) || 0 === e.length) {
                return [];
            }
            var t = e.filter(function (e) {
                return 0 == E.filter_hr.filter(function (t) {
                    return I(e).toLowerCase().indexOf(t.toLowerCase()) >= 0;
                }).length;
            });
            return t = t.filter(function (e) {
                return 0 == E.filter_ts.filter(function (t) {
                    return I(e).toLowerCase().indexOf(' ' + t.toLowerCase()) >= 0;
                }).length;
            }), 'ru' == q() && (t = t.filter(function (e) {
                return 0 == E.filter_uk.filter(function (t) {
                    return I(e).toLowerCase().indexOf(t.toLowerCase()) >= 0;
                }).length;
            })), B(t), t;
        },
        renameTranslate: B,
        sortDUBTranstale: function (e) {
            e.sort(function (e, t) {
                var n = E.filter_db.filter(function (t) {
                        return I(e).toLowerCase().indexOf(t.toLowerCase()) >= 0;
                    }).length, i = E.filter_db.filter(function (e) {
                        return I(t).toLowerCase().indexOf(e.toLowerCase()) >= 0;
                    }).length;
                return n && !i ? -1 : !n && i ? 1 : 0;
            });
        },
        modalChoiceTranstale: function (e, t) {
            var n = Lampa.Controller.enabled().name, i = $('<div class="connect-broken">\n\t\t\t\t\t\t<div class="connect-broken__icon icon--nofound"></div>\n\t\t\t\t\t\t<div class="connect-broken__title">Вот досада...</div>\n\t\t\t\t\t\t<div class="connect-broken__text">Нет доступных файлов для воспроизведения с выбранным переводом (<b>'.concat(e.from, '</b>). Хотите выбрать другой?</div>\n\t\t\t\t\t\t<div class="connect-broken__footer">\n\t\t\t\t\t\t\t<div class="selector simple-button next">Выбрать другой</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>'));
            i.find('.selector').on('hover:enter', function () {
                Lampa.Modal.close();
                Lampa.Controller.toggle(n);
            });
            i.find('.next').on('hover:enter', function () {
                Lampa.Select.show({
                    title: 'Выберите перевод',
                    items: e.voicelist,
                    onBack: function () {
                        Lampa.Controller.toggle(n);
                        t && t();
                    }
                });
            });
            Lampa.Modal.open({
                title: '',
                html: i,
                onBack: function () {
                    Lampa.Modal.close();
                    Lampa.Controller.toggle(n);
                    t && t();
                }
            });
        },
        unicleTranslations: function (e) {
            var t = [];
            return e.forEach(function (e) {
                t.find(function (t) {
                    return V(I(t), I(e));
                }) || t.push(e);
            }), t;
        },
        selectChoiceTranstale: function (e, t, n) {
            var i = {
                enumerable: i.enumerable || false,
                configurable: true,
                source_name: a,
                quality: {},
                details: e.details || i.details || 'no details',
                translate: e.translate || i.translate || 'no translate',
                on_error_timer: setTimeout(function () {
                    i.getNextVoice(e, o, t);
                }, 2000),
                onSelect: function (t, n) {
                    e.setChoice(n.season);
                    e.selected();
                    Lampa.Controller.toggle('content');
                    e.load();
                },
                onBack: function () {
                    e.start();
                },
                timeline: Lampa.Timeline.view(s),
                time: Lampa.Utils.secondsToTime(60 * i.runtime, true),
                title: i.name || Lampa.Lang.translate('torrent_serial_episode') + ' ' + l,
                quality: m > 0 ? f : '',
                number: l,
                info: c.length ? c.map(function (e) {
                    return '<span>' + e + '</span>';
                }).join('<span class="season-episode-split">\u25CF</span>') : '',
                mark: function () {
                    t = p[0];
                    g(true);
                },
                e: n
            };
            e.forEach(function (e) {
                var t = I(e);
                i[t] || (i[t] = {
                    items: [],
                    sources: [],
                    maxquality: 0
                });
                i[t].items.push(e);
                var n = e.source_name || '';
                n && -1 === i[t].sources.indexOf(n) && i[t].sources.push(n);
                var a = parseInt(e.maxquality) || 0;
                a > i[t].maxquality && (i[t].maxquality = a);
            });
            var a = [];
            for (var o in i) {
                var r = i[o], l = [];
                r.sources.length > 0 && l.push(r.sources.join(', '));
                r.maxquality > 0 && l.push(r.maxquality + 'p');
                a.push({
                    title: o,
                    subtitle: l.join(' \u2022 '),
                    selected: V(o, t),
                    voiceItems: r.items,
                    onSelect: function () {
                        Lampa.Controller.toggle('content');
                        n(this.voiceItems[0]);
                    }
                });
            }
            Lampa.Select.show({
                title: 'Выберите перевод',
                items: a,
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        },
        selectChoiceFlow: function (e, t) {
            Lampa.Select.show({
                title: 'Выберите поток',
                items: e.map(function (e) {
                    return {
                        title: e.quality + (e.label ? '<sub>' + e.label + '</sub>' : ''),
                        selected: e.selected,
                        subtitle: Lampa.Utils.shortText(e.url, 35),
                        onSelect: function () {
                            Lampa.Controller.toggle('content');
                            t(e);
                        }
                    };
                }),
                onBack: function () {
                    Lampa.Controller.toggle('content');
                }
            });
        }
    };
    function N(e) {
        if (e += '', -1 == (e = Lampa.Utils.addUrlComponent(e, 'rjson=true')).indexOf('uid=')) {
            var t = Lampa.Storage.get('lampac_unic_id', '') || 'guest';
            e = Lampa.Utils.addUrlComponent(e, 'uid=' + encodeURIComponent(t));
        }
        if (P()) {
            if (-1 == e.indexOf('account_email=')) {
                var n = Lampa.Storage.get('account_email', '');
                n && (e = Lampa.Utils.addUrlComponent(e, 'account_email=' + encodeURIComponent(n)));
            }
            if (-1 == e.indexOf('token=')) {
                var i = O();
                i && (e = Lampa.Utils.addUrlComponent(e, 'token=' + encodeURIComponent(i)));
            }
            if (-1 == e.indexOf('nws_id=') && window.rch_nws && window.rch_nws[U]) {
                var a = window.rch_nws[U].connectionId || '';
                a && (e = Lampa.Utils.addUrlComponent(e, 'nws_id=' + encodeURIComponent(a)));
            }
            if (-1 == e.indexOf('rchtype=')) {
                var o = window.rch_nws && window.rch_nws[U] && window.rch_nws[U].type || 'web';
                e = Lampa.Utils.addUrlComponent(e, 'rchtype=' + o);
            }
        } else {
            var r = x() ? j(L()[_()] || '') : '';
            if (r) {
                var l = r.split('=')[0];
                l && -1 == e.indexOf(l + '=') && (e = Lampa.Utils.addUrlComponent(e, r));
            }
        }
        return e;
    }
    var U = 'rc.bwa.to'.replace('http://', '').replace('https://', ''), z = false;
    function G(e, t) {
        function n() {
            window.nwsClient && window.nwsClient[U] && window.nwsClient[U]._shouldReconnect ? t && t() : (window.nwsClient || (window.nwsClient = {}), window.nwsClient[U] && window.nwsClient[U].socket && window.nwsClient[U].socket.close(), window.nwsClient[U] = new NativeWsClient(e.nws, { autoReconnect: true }), window.nwsClient[U].on('Connected', function () {
                window.rch_nws[U].Registry(window.nwsClient[U], function () {
                    t && t();
                });
            }), window.nwsClient[U].on('Error', function (e) {
                console.log('BWA NWS Error:', e);
            }), window.nwsClient[U].connect());
        }
        window.rch_nws || (window.rch_nws = {});
        window.rch_nws[U] || (window.rch_nws[U] = {
            type: Lampa.Platform.is('android') ? 'apk' : Lampa.Platform.is('tizen') ? 'cors' : 'web',
            startTypeInvoke: false,
            rchRegistry: false,
            apkVersion: 0
        });
        window.rch_nws[U].Registry = function (e, t) {
            e.invoke('RchRegistry', JSON.stringify({
                version: 151,
                host: location.host,
                rchtype: window.rch_nws[U].type || 'web',
                apkVersion: 0,
                player: Lampa.Storage.field('player'),
                account_email: Lampa.Storage.get('account_email', ''),
                unic_id: Lampa.Storage.get('lampac_unic_id', ''),
                profile_id: Lampa.Storage.get('lampac_profile_id', ''),
                token: ''
            }));
            e._shouldReconnect && window.rch_nws[U].rchRegistry ? t && t() : (window.rch_nws[U].rchRegistry = true, e.on('RchRegistry', function (e) {
                true;
                t && t();
            }), e.on('RchClient', function (t, n, i, a, o) {
                var r = new Lampa.Reguest();
                function l(n) {
                    (Lampa.Arrays.isObject(n) || Lampa.Arrays.isArray(n)) && (n = JSON.stringify(n));
                    (function (n, i) {
                        $.ajax({
                            url: 'http://rc.bwa.to/rch/' + n + '?id=' + t,
                            type: 'POST',
                            data: i,
                            async: true,
                            cache: false,
                            contentType: false,
                            processData: false,
                            success: function () {
                            },
                            error: function () {
                                e.invoke('RchResult', t, '');
                            }
                        });
                    }('result', n));
                }
                'ping' == n ? l('pong') : r.native(n, l, function () {
                    l('');
                }, i, {
                    dataType: 'text',
                    timeout: 8000,
                    headers: a,
                    returnHeaders: o
                });
            }), e.on('Connected', function (e) {
                window.rch_nws[U].connectionId = e;
                true;
            }));
        };
        'undefined' == typeof NativeWsClient ? Lampa.Utils.putScript(['http://rc.bwa.to/js/nws-client-es5.js?v18112025'], function () {
        }, false, function () {
            n();
        }, true) : n();
    }
    function W(e, t) {
        return !(!e || !e.rch) && (G(e, function () {
            setTimeout(function () {
                t && t();
            }, 500);
        }), true);
    }
    var H = function () {
        function n(e) {
            t(this, n);
            this.object = e;
            this.network = new Lampa.Reguest();
            this.voiceSave = new o(e);
        }
        return i(n, [
            {
                key: 'externalids',
                value: function () {
                    var e = this;
                    return new Promise(function (t, n) {
                        if (e.object.movie.imdb_id && e.object.movie.kinopoisk_id) {
                            t();
                        } else {
                            var i = [];
                            i.push('id=' + e.object.movie.id);
                            i.push('serial=' + (e.object.movie.name ? 1 : 0));
                            e.object.movie.imdb_id && i.push('imdb_id=' + (e.object.movie.imdb_id || ''));
                            e.object.movie.kinopoisk_id && i.push('kinopoisk_id=' + (e.object.movie.kinopoisk_id || ''));
                            var a = Lampa.Utils.protocol() + E.stream + '/externalids?' + i.join('&');
                            e.network.timeout(10000);
                            e.network.silent(N(a), function (n) {
                                for (var i in n)
                                    e.object.movie[i] = n[i];
                                t();
                            }, function () {
                                t();
                            });
                        }
                    });
                }
            },
            {
                key: 'requestParams',
                value: function (e) {
                    var t = [], n = this.object, i = n.movie.source || 'tmdb';
                    return t.push('id=' + n.movie.id), n.movie.imdb_id && t.push('imdb_id=' + (n.movie.imdb_id || '')), n.movie.kinopoisk_id && t.push('kinopoisk_id=' + (n.movie.kinopoisk_id || '')), t.push('title=' + encodeURIComponent(n.clarification ? n.search : n.movie.title || n.movie.name)), t.push('original_title=' + encodeURIComponent(n.movie.original_title || n.movie.original_name)), t.push('serial=' + (n.movie.name ? 1 : 0)), t.push('original_language=' + (n.movie.original_language || '')), t.push('year=' + ((n.movie.release_date || n.movie.first_air_date || '0000') + '').slice(0, 4)), t.push('source=' + i), t.push('clarification=' + (n.clarification ? 1 : 0)), t.push('rjson=true'), Lampa.Storage.get('account_email', '') && t.push('cub_id=' + Lampa.Utils.hash(Lampa.Storage.get('account_email', ''))), e + (e.indexOf('?') >= 0 ? '&' : '?') + t.join('&');
                }
            },
            {
                key: 'query',
                value: function (e) {
                    var t = this;
                    return new Promise(function (n, i) {
                        var a, o = [].concat(E.sources), l = new r(o.length), s = false;
                        function c() {
                            s || Lampa.Noty.show('Секундочку...');
                        }
                        c();
                        a = setInterval(c, 2000);
                        ;
                        o.forEach(function (n) {
                            t.source(n, e.season).then(function (e) {
                                if (e.voice && e.data && e.data[0] && e.data[0].quality) {
                                    var t = 0;
                                    for (var i in e.data[0].quality) {
                                        var a = parseInt(i);
                                        a > t && (t = a);
                                    }
                                    t > 0 && e.voice.forEach(function (e) {
                                        (!e.maxquality || parseInt(e.maxquality) < t) && (e.maxquality = t + 'p');
                                    });
                                }
                                e._source_id = n;
                                l.append(n, e);
                            }).catch(function (e) {
                                l.append(n, { error: e });
                            });
                        });
                    });
                }
            },
            {
                key: 'source',
                value: function (e, t) {
                    var n = this;
                    return new Promise(function (i, a) {
                        var o = function (e) {
                                for (var t = 0; t < y.length; t++) {
                                    var n = y[t], i = Lampa.Arrays.isArray(n.id) ? n.id : [n.id];
                                    if (-1 !== i.indexOf(e)) {
                                        return i;
                                    }
                                }
                                return [e];
                            }(e), r = 0, l = function () {
                                if (r >= o.length) {
                                    a(400);
                                } else {
                                    var e = o[r], s = function (o, c) {
                                            var u = o ? '/lite/' : '/', d = Lampa.Utils.protocol() + E.stream + u + e, m = n.requestParams(N(d));
                                            t && (m += '&s=' + t);
                                            n.network.timeout(10000);
                                            n.network.silent(m, function (e) {
                                                var t;
                                                try {
                                                    t = JSON.parse(e);
                                                } catch (e) {
                                                }
                                                t ? t.rch && P() && !c ? W(t, function () {
                                                    s(o, true);
                                                }) : 'disable' === t || t.disable || t.error && !t.data ? (r++, l()) : i(t) : 'disable' === e ? (r++, l()) : a(500);
                                            }, function () {
                                                o ? s(false, c) : (r++, l());
                                            }, false, { dataType: 'text' });
                                        }, c = -1 == E.nolite.indexOf(e);
                                    s(c, false);
                                }
                            };
                        l();
                    });
                }
            },
            {
                key: 'links',
                value: function (e) {
                    var t = this;
                    return new Promise(function (n, i) {
                        var a = [], o = [];
                        e.forEach(function (e) {
                            a = a.concat(e.filter(function (e) {
                                return 'call' == e.method;
                            }));
                            o = o.concat(e.filter(function (e) {
                                return 'play' == e.method;
                            }));
                        });
                        var l = new r(a.length);
                        ;
                        var s = function (e, n) {
                            t.network.timeout(10000);
                            t.network.silent(N(e.url), function (t) {
                                if (t.rch && P() && !n) {
                                    W(t, function () {
                                        s(e, true);
                                    });
                                } else {
                                    var i = t;
                                    if (!i.quality && i.url) {
                                        ;
                                        var a = i.url;
                                        -1 !== a.indexOf(' or ') && (a = a.split(' or ')[0]);
                                        i.quality.auto = i.url;
                                    }
                                    ;
                                    ;
                                    o.push(i);
                                    l.next();
                                }
                            }, l.error.bind(l));
                        };
                        a.forEach(function (e) {
                            s(e, false);
                        });
                        0 == a.length && n(M.renameTranslate(o));
                    });
                }
            },
            {
                key: 'm3u',
                value: function (e) {
                    var t = this;
                    return new Promise(function (n, i) {
                        var a = [], o = Lampa.Storage.field('video_quality_default'), r = function (t) {
                                parseInt(t) <= o && [e.quality[t].url].concat(e.quality[t].reserve).forEach(function (n) {
                                    a.push({
                                        quality: t,
                                        name: e.name,
                                        url: n
                                    });
                                });
                            };
                        for (var l in e.quality)
                            r(l);
                        t.network.silent(Lampa.Utils.protocol() + E.stream + '/m3u/add', function (e) {
                            n(Lampa.Utils.protocol() + E.stream + e.url);
                        }, function (e, t) {
                            i(400);
                        }, { playlist: a });
                    });
                }
            },
            {
                key: 'flows',
                value: function (e) {
                    var t = [], n = Lampa.Storage.field('video_quality_default'), i = function (n) {
                            var i = [e[n].url].concat(e[n].reserve), a = parseInt(n);
                            i.forEach(function (e) {
                                t.push({
                                    int: a,
                                    label: a > 1440 ? '4K' : a >= 1440 ? '2K' : a >= 1080 ? 'FHD' : a >= 720 ? 'HD' : '',
                                    quality: n,
                                    url: e
                                });
                            });
                        };
                    for (var a in e)
                        i(a);
                    var o = t.find(function (e) {
                        return e.int == n;
                    });
                    return o && (o.selected = true), t;
                }
            },
            {
                key: 'movie',
                value: function (e) {
                    var t = this;
                    return new Promise(function (n, i) {
                        t.externalids().then(function () {
                            return t.query(e);
                        }).then(function (e) {
                            var t = [];
                            if (e.forEach(function (e) {
                                    var n = M.filterTranslate(e);
                                    n.length && (t = t.concat(n));
                                }), t.forEach(function (e) {
                                    e.maxquality = e.maxquality || '1080p';
                                    var t = e.translate.match(/\[(.*?)\]/);
                                    t && (t = t[1].split(',').map(function (e) {
                                        return e.trim();
                                    }), e.lang = (t.map(function (e) {
                                        return e.toLowerCase();
                                    }).find(function (e) {
                                        return 'ru' == e || 'uk' == e || 'rus' == e || 'ukr' == e || 'укр' == e;
                                    }) || '').toUpperCase(), e.lang = 'RUS' == e.lang ? 'RU' : 'UKR' == e.lang ? 'UA' : e.lang, 'RU' == e.lang && 'ru' == M.region() && (e.lang = ''), e.translate = t.find(function (e) {
                                        return e.length > 5;
                                    }) || e.translate);
                                }), 0 == t.length) {
                                throw new Error('No data');
                            }
                            M.renameTranslate(t);
                            n({
                                sources: e,
                                translates: t
                            });
                        }).catch(i);
                    });
                }
            },
            {
                key: 'tv',
                value: function (t) {
                    var n = this;
                    return new Promise(function (i, o) {
                        n.externalids().then(function () {
                            n.query(t).then(function (t) {
                                n.voice(t).then(function (n) {
                                    i(function (t) {
                                        for (var n = 1; n < arguments.length; n++) {
                                            var i, o = null !== (i = arguments[n]) && void 0 !== i ? i : {};
                                            n % 2 ? e(Object(o), true).forEach(function (e) {
                                                a(t, e, o[e]);
                                            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(o)) : e(Object(o)).forEach(function (e) {
                                                Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(o, e));
                                            });
                                        }
                                        return t;
                                    }({ sources: t }, n));
                                }).catch(o);
                            }).catch(o);
                        });
                    });
                }
            },
            {
                key: 'voice',
                value: function (e) {
                    var t = this;
                    return new Promise(function (n, i) {
                        var a = t.voiceSave.get(), o = [], l = E.filter_tv, s = [], c = function e(n, i) {
                                return new Promise(function (a, o) {
                                    t.network.timeout(10000);
                                    t.network.silent(N(n.url), function (t) {
                                        var r, l = t;
                                        if ('string' == typeof t) {
                                            if (-1 !== t.indexOf('<div') || -1 !== t.indexOf('data-json')) {
                                                r = { data: [] };
                                                $(t).find('[data-json]').each(function () {
                                                    try {
                                                        var e = $(this).attr('data-json'), t = JSON.parse(e);
                                                        'play' === t.method && t.url && r.data.push(t);
                                                    } catch (e) {
                                                    }
                                                });
                                                l = r;
                                            } else {
                                                try {
                                                    l = JSON.parse(t);
                                                } catch (e) {
                                                    l = {};
                                                }
                                            }
                                        }
                                        if (l.rch && P() && !i) {
                                            W(l, function () {
                                                e(n, true).then(a).catch(o);
                                            });
                                        } else {
                                            if (!l.data || 0 === l.data.length) {
                                                return void o('no data');
                                            }
                                            !function (e, t) {
                                                e.data.forEach(function (e) {
                                                    e.translate_name = t;
                                                });
                                            }(l, M.voice(n));
                                            a(l.data);
                                        }
                                    }, function (e) {
                                        o(e);
                                    }, false, { dataType: 'text' });
                                });
                            };
                        e.forEach(function (e) {
                            if (e.voice && Lampa.Arrays.isArray(e.voice)) {
                                e.voice = M.filterTranslate(e.voice);
                                var t = e.source_name || e.balanser || '';
                                e.voice.forEach(function (e) {
                                    e.source_name = e.source_name || t;
                                });
                                s = s.concat(e.voice.filter(function (e) {
                                    return 0 == l.filter(function (t) {
                                        return M.voice(e).toLowerCase().indexOf(t) >= 0;
                                    }).length;
                                }));
                            }
                        });
                        a || (a = M.voice(s[0]));
                        s.sort(function (e, t) {
                            return M.voice(e).toLowerCase().localeCompare(M.voice(t).toLowerCase());
                        });
                        var u = s.filter(function (e) {
                                return M.compareVoice(e.name, a);
                            }), d = new r(u.length);
                        d.onComplite = function () {
                            if (0 == o.length) {
                                if (!s[0]) {
                                    return void i(700);
                                }
                                c(s[0], false).then(function (e) {
                                    o = o.concat(e);
                                    n({
                                        translates: s,
                                        plays: o
                                    });
                                }).catch(i);
                            } else {
                                n({
                                    translates: s,
                                    plays: o
                                });
                            }
                        };
                        u.forEach(function (e) {
                            c(e, false).then(function (e) {
                                o = o.concat(e);
                                d.next();
                            }).catch(d.error.bind(d));
                        });
                        0 == u.length && d.onComplite();
                    });
                }
            },
            {
                key: 'error',
                value: function (e) {
                    var t = Lampa.Controller.enabled().name, n = $('<div class="connect-broken">\n\t\t\t\t\t\t\t\t\t<div class="connect-broken__title">Вот досада...</div>\n\t\t\t\t\t\t\t\t\t<div class="connect-broken__text">'.concat('К сожалению, не удалось найти видеоконтент для этого фильма. Попробуйте выбрать другой фильм или повторите попытку позже.', '</div>\n\t\t\t\t\t\t\t\t\t<div class="connect-broken__footer">\n\t\t\t\t\t\t\t\t\t\t<div class="selector simple-button">Закрыть</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>'));
                    n.find('.selector').on('hover:enter', function () {
                        Lampa.Controller.back();
                    });
                    Lampa.Modal.open({
                        title: '',
                        html: n,
                        onBack: function () {
                            Lampa.Modal.close();
                            Lampa.Controller.toggle(t);
                        }
                    });
                }
            }
        ]), n;
    }();
    function K(e, t) {
        var n = 0, i = 0;
        e.forEach(function (e, t) {
            !e.quality && e.url && -1 !== e.url.indexOf('.m3u8') && n++;
        });
        0 !== n ? e.forEach(function (a, o) {
            if (!a.quality && a.url && -1 !== a.url.indexOf('.m3u8')) {
                var r = new Lampa.Reguest();
                r.timeout(5000);
                r.native(a.url, function (o) {
                    if ('string' == typeof o && -1 !== o.indexOf('#EXT-X-STREAM-INF')) {
                        var r = function (e, t) {
                            for (var n = {}, i = e.split('\n'), a = null, o = 0; o < i.length; o++) {
                                var r = i[o].trim();
                                if (0 === r.indexOf('#EXT-X-STREAM-INF')) {
                                    var l = r.match(/RESOLUTION=(\d+)x(\d+)/i);
                                    if (l) {
                                        a = parseInt(l[2]);
                                    } else {
                                        var s = r.match(/BANDWIDTH=(\d+)/i);
                                        if (s) {
                                            var c = parseInt(s[1]);
                                            a = c > 4000000 ? 1080 : c > 2000000 ? 720 : c > 1000000 ? 480 : c > 500000 ? 360 : 240;
                                        }
                                    }
                                } else {
                                    if (a && r && 0 !== r.indexOf('#')) {
                                        var u = r;
                                        if (0 !== u.indexOf('http')) {
                                            var d = t.split('/');
                                            d.pop();
                                            u = d.join('/') + '/' + u;
                                        }
                                        var m = a + 'p';
                                        n[m] || (n[m] = u);
                                        a = null;
                                    }
                                }
                            }
                            return n;
                        }(o, a.url);
                        Object.keys(r).length > 0 && (a.quality = r);
                    }
                    ++i >= n && t(e);
                }, function () {
                    ++i >= n && t(e);
                }, false, { dataType: 'text' });
            }
        }) : t(e);
    }
    var J = function () {
            function e(n) {
                var i = this;
                t(this, e);
                this.object = n;
                this.extract = new H(n);
                this.voice = new o(n);
                this.on_error_timer = null;
                Lampa.Player.listener.follow('destroy', function e() {
                    Lampa.Player.listener.remove('close', e);
                    clearTimeout(i.on_error_timer);
                });
            }
            return i(e, [
                {
                    key: 'getQuality',
                    value: function (e) {
                        var t = this, n = {};
                        e.forEach(function (e, i) {
                            var a = e.quality;
                            if (!a || 'object' !== _typeof(a)) {
                                if (!e.url) {
                                    return;
                                }
                                a = { auto: e.url };
                            }
                            var o = function (e) {
                                var i = parseInt(e), o = t.getSplitLinks(a[e]);
                                n[e] ? n[e].reserve = n[e].reserve.concat(o) : n[e] = {
                                    label: i > 1440 ? '4K' : i >= 1440 ? '2K' : i >= 1080 ? 'FHD' : i >= 720 ? 'HD' : '',
                                    url: o[0],
                                    reserve: o.length > 1 ? o.slice(1) : [],
                                    used: [],
                                    error: [],
                                    trigger: function () {
                                        t.setFlowsForQuality(Lampa.Player.playdata());
                                    }
                                };
                            };
                            for (var r in a)
                                o(r);
                        });
                        var i = Lampa.Arrays.getKeys(n), a = { e: n[e] };
                        return i.sort(function (e, t) {
                            var n = parseInt((e + '').replace(/[^0-9]/g, '')) || 0, i = parseInt((t + '').replace(/[^0-9]/g, '')) || 0;
                            return 0 === n && 0 === i ? (e + '').localeCompare(t + '') : 0 === n ? 1 : 0 === i ? -1 : i - n;
                        }), i.forEach(function (e) {
                            var t = parseInt((e + '').replace(/[^0-9]/g, '')) || 0;
                            t > 0 && !n[e].label && (n[e].label = t > 1440 ? '4K' : t >= 1440 ? '2K' : t >= 1080 ? 'FHD' : t >= 720 ? 'HD' : '');
                            ;
                        }), a;
                    }
                },
                {
                    key: 'getSplitLinks',
                    value: function (e) {
                        return 'string' != typeof e ? e && e.url ? [e.url] : [String(e)] : e.split(' or ');
                    }
                },
                {
                    key: 'getSelectedQuality',
                    value: function (e) {
                        var t = null, n = e.url, i = e.quality;
                        if (e.quality_switched) {
                            for (var a in i)
                                if (a == e.quality_switched) {
                                    t = i[a];
                                    break;
                                }
                        } else {
                            for (var a in i) {
                                var o = i[a];
                                if (o.url == n || o.reserve.indexOf(n) >= 0) {
                                    t = o;
                                    break;
                                }
                            }
                        }
                        if (!t) {
                            for (var a in i) {
                                t = i[a];
                                break;
                            }
                        }
                        return t;
                    }
                },
                {
                    key: 'getQualityLevelDown',
                    value: function (e) {
                        var t, n, i = this.getSelectedQuality(e);
                        for (var a in e.quality)
                            if (i == e.quality[a]) {
                                t = a;
                                break;
                            }
                        if (t) {
                            var o = Lampa.Arrays.getKeys(e.quality);
                            o.sort(function (e, t) {
                                return parseInt(t) - parseInt(e);
                            });
                            o.forEach(function (e) {
                                parseInt(e) < parseInt(t) && !n && parseInt(e) > 360 && (n = e);
                            });
                        }
                        return n;
                    }
                },
                {
                    key: 'getReserveQuality',
                    value: function (e) {
                        var t = this.getSelectedQuality(e), n = '';
                        return t && (t.error.push(Lampa.Manifest.app_digital >= 236 ? e.url : t.url), t.reserve.forEach(function (e) {
                            -1 != t.used.indexOf(e) || n || (n = e, t.used.push(e));
                        })), n;
                    }
                },
                {
                    key: 'getPlayData',
                    value: function (e) {
                        var t = Lampa.Utils.hash(e.season ? [
                                e.season,
                                e.season > 10 ? ':' : '',
                                e.episode,
                                this.object.movie.original_title
                            ].join('') : this.object.movie.original_title), n = this.getQuality(e.quality);
                        return {
                            title: this.object.movie.title || this.object.movie.name,
                            url: Lampa.Player.getUrlQuality(n),
                            quality: n,
                            timeline: Lampa.Timeline.view(t),
                            translate_name: e.translate,
                            card: this.object.movie
                        };
                    }
                },
                {
                    key: 'getNextVoice',
                    value: function (e, t, n) {
                        var i = this.getSelectedQuality(e);
                        if (i && (0 == i.reserve.length || i.used.length == i.reserve.length)) {
                            var a = this.getQualityLevelDown(e);
                            a ? (e.quality_switched = a, i = this.getSelectedQuality(e), Lampa.Arrays.remove(i.reserve, i.url), Lampa.Arrays.insert(i.reserve, 0, i.url)) : i = null;
                        }
                        i ? (e.url = this.getReserveQuality(e), n(e.url || 'nofound'), this.setFlowsForQuality(e)) : M.modalChoiceTranstale({
                            from: t.find(function (e) {
                                return e.selected;
                            }).name,
                            voicelist: t
                        });
                    }
                },
                {
                    key: 'setFlowsForQuality',
                    value: function (e) {
                        if (e && e.quality) {
                            var t = Object.keys(e.quality);
                            if (1 !== t.length || 'auto' !== t[0]) {
                                var n = this.getSelectedQuality(e);
                                if (n) {
                                    r = [];
                                    var i = [n.url].concat(n.reserve.filter(function (e) {
                                        return e !== n.url;
                                    })).filter(function (e) {
                                        return -1 == n.error.indexOf(e);
                                    });
                                    i.length > 0 && i.forEach(function (e, t) {
                                        r.push({
                                            title: 'Поток ' + (t + 1),
                                            subtitle: Lampa.Utils.shortText(e, 35),
                                            url: e,
                                            selected: e == n.url
                                        });
                                    });
                                    Lampa.PlayerPanel.setFlows(!!r.length && r);
                                }
                            } else {
                                var a = e.quality.auto, o = a.url || a;
                                if ('string' == typeof o && o) {
                                    var r = [{
                                            title: 'Поток 1',
                                            subtitle: Lampa.Utils.shortText(o, 35),
                                            url: o,
                                            selected: true
                                        }];
                                    Lampa.PlayerPanel.setFlows(r);
                                }
                            }
                        }
                    }
                },
                {
                    key: 'movie',
                    value: function (e) {
                        var t = this, n = M.player();
                        e.translates.sort(function (e, t) {
                            var n = parseInt(e.maxquality) || 0, i = parseInt(t.maxquality) || 0;
                            if (i !== n) {
                                return i - n;
                            }
                            var a = E.filter_db.filter(function (t) {
                                    return e.translate.toLowerCase().indexOf(t.toLowerCase()) >= 0;
                                }).length, o = E.filter_db.filter(function (e) {
                                    return t.translate.toLowerCase().indexOf(e.toLowerCase()) >= 0;
                                }).length;
                            return a && !o ? -1 : !a && o ? 1 : 0;
                        });
                        var i = this.voice.get();
                        i || (i = M.voice(e.translates[0]));
                        var a = e.translates.filter(function (e) {
                                return M.compareVoice(M.voice(e), i);
                            }), o = Lampa.Utils.hash(this.object.movie.original_title);
                        'inner' == n ? this.extract.links([a]).then(function (n) {
                            K(n, function (n) {
                                Lampa.Player.opened() && Lampa.Player.close();
                                var a = [], r = t.getQuality(n), l = n.find(function (e) {
                                        return e.subtitles;
                                    }), s = {};
                                for (var c in (e.translates.forEach(function (e) {
                                        var t = e.translate;
                                        s[t] || (s[t] = {
                                            item: e,
                                            sources: [],
                                            maxquality: 0
                                        });
                                        var n = e.source_name || '';
                                        n && -1 === s[t].sources.indexOf(n) && s[t].sources.push(n);
                                        var i = parseInt(e.maxquality) || 0;
                                        i > s[t].maxquality && (s[t].maxquality = i);
                                    }), s)) {
                                    var u = s[c], d = (u.item, []);
                                    u.sources.length > 0 && d.push(u.sources.join(', '));
                                    u.maxquality > 0 && d.push(u.maxquality + 'p');
                                    a.push({
                                        selected: M.compareVoice(i, c),
                                        name: c,
                                        title: c,
                                        subtitle: d.join(' \u2022 '),
                                        onSelect: function () {
                                            t.voice.set(this.name);
                                            Lampa.Player.loading(true);
                                            t.movie(e);
                                        }
                                    });
                                }
                                a.find(function (e) {
                                    return e.selected;
                                }) || (a[0].selected = true);
                                var m = {
                                    title: t.object.movie.title || t.object.movie.name,
                                    url: n.length ? Lampa.Player.getUrlQuality(r) : 'nofound',
                                    quality: r,
                                    timeline: Lampa.Timeline.view(o),
                                    subtitles: !!l && l.subtitles,
                                    card: t.object.movie,
                                    voiceovers: a,
                                    error: function (e, n) {
                                        t.on_error_timer = setTimeout(function () {
                                            t.getNextVoice(e, a, n);
                                        }, 2000);
                                    }
                                };
                                Lampa.Player.runas('inner');
                                Lampa.Player.play(m);
                                Lampa.Player.playlist([]);
                                t.setFlowsForQuality(m);
                            });
                        }) : M.selectChoiceTranstale(e.translates, i, function (n) {
                            t.voice.set(M.voice(n));
                            t.extract.links([e.translates.filter(function (e) {
                                    return M.compareVoice(M.voice(e), M.voice(n));
                                })]).then(function (e) {
                                if (0 == e.length) {
                                    return Lampa.Bell.push({
                                        text: 'Не удалось найти ссылок, выберите другой перевод',
                                        time: 5000
                                    });
                                }
                                var n = t.getQuality(e), i = e.find(function (e) {
                                        return e.subtitles;
                                    }), a = t.extract.flows(n);
                                M.selectChoiceFlow(a, function (e) {
                                    var n = {
                                        title: t.object.movie.title || t.object.movie.name,
                                        url: e.url,
                                        timeline: Lampa.Timeline.view(o),
                                        subtitles: !!i && i.subtitles
                                    };
                                    Lampa.Player.play(n);
                                });
                            }).catch(function (e) {
                                t.extract.error(e);
                            });
                        });
                    }
                },
                {
                    key: 'tv',
                    value: function (e, t, n) {
                        var i = this, a = [], o = [], r = this.voice.get();
                        Lampa.Controller.toggle('content');
                        M.sortDUBTranstale(e.translates);
                        var l = {
                            onComplite: function (e) {
                                s = true;
                                clearInterval(a);
                                var t = [], r = 700;
                                o.forEach(function (n) {
                                    var i = e[n];
                                    if (i) {
                                        if (i.error) {
                                            r = i.error;
                                        } else {
                                            if (i.accsdb) {
                                                r = 600;
                                            } else {
                                                if ('similar' != i.type && i.data) {
                                                    var a = i.balanser || i._source_id || n;
                                                    i.voice && Lampa.Arrays.isArray(i.voice) && i.voice.forEach(function (e) {
                                                        e.source_name = a;
                                                    });
                                                    i.data && Lampa.Arrays.isArray(i.data) && i.data.forEach(function (e) {
                                                        e.source_name = a;
                                                    });
                                                    ;
                                                    t.push(i.voice ? i : i.data);
                                                }
                                            }
                                        }
                                    }
                                });
                                t.length ? n(t) : i(r);
                            },
                            onComplite: function () {
                                n(M.renameTranslate(o));
                            }
                        };
                        for (var s in (e.translates.forEach(function (e) {
                                var t = e.name;
                                l[t] || (l[t] = {
                                    item: e,
                                    sources: [],
                                    maxquality: 0
                                });
                                var n = e.source_name || '';
                                n && -1 === l[t].sources.indexOf(n) && l[t].sources.push(n);
                                var i = parseInt(e.maxquality) || 0;
                                i > l[t].maxquality && (l[t].maxquality = i);
                            }), l)) {
                            var c = l[s];
                            c.item;
                            !function (a, l, s) {
                                var c = [];
                                l.sources.length > 0 && c.push(l.sources.join(', '));
                                l.maxquality > 0 && c.push(l.maxquality + 'p');
                                o.push({
                                    name: a,
                                    title: a,
                                    subtitle: c.join(' \u2022 '),
                                    selected: M.compareVoice(a, r),
                                    onSelect: function () {
                                        i.voice.set(a);
                                        Lampa.Player.loading(true);
                                        i.extract.voice(e.sources).then(function (a) {
                                            a.sources = e.sources;
                                            i.tv(a, t, n);
                                        }).catch(function (e) {
                                        }).finally(function () {
                                            Lampa.Player.loading(false);
                                        });
                                    }
                                });
                            }(s, c);
                        }
                        o.find(function (e) {
                            return e.selected;
                        }) || (o[0].selected = true);
                        t.forEach(function (t) {
                            if (e.plays.find(function (e) {
                                    return e.e == t.number;
                                })) {
                                var r = {
                                    number: t.number,
                                    title: t.title,
                                    timeline: t.timeline,
                                    launch_player: 'inner',
                                    url: function (n) {
                                        'inner' == M.player() ? (Lampa.Player.loading(true), i.extract.links([e.plays.filter(function (e) {
                                                return e.e == t.number;
                                            })]).then(function (e) {
                                            0 == e.length ? (r.url = 'nofound', n()) : (r.quality = i.getQuality(e), r.url = Lampa.Player.getUrlQuality(r.quality), n(), setTimeout(function () {
                                                i.setFlowsForQuality({
                                                    url: 'string' == typeof r.url ? r.url : '',
                                                    quality: r.quality,
                                                    quality_switched: null
                                                });
                                            }, 100));
                                        }).catch(function () {
                                            r.url = 'nofound';
                                            n();
                                        }).finally(function () {
                                            Lampa.Player.loading(false);
                                        })) : M.selectChoiceTranstale(e.translates, M.voice(o.find(function (e) {
                                            return e.selected;
                                        })), function (n) {
                                            i.voice.set(M.voice(n));
                                            i.extract.voice(e.sources).then(function (e) {
                                                return i.extract.links([e.plays.filter(function (e) {
                                                        return e.e == t.number;
                                                    })]);
                                            }).then(function (e) {
                                                if (0 == e.length) {
                                                    throw new Error(700);
                                                }
                                                var n = i.getQuality(e), a = e.find(function (e) {
                                                        return e.subtitles;
                                                    }), o = i.extract.flows(n);
                                                M.selectChoiceFlow(o, function (e) {
                                                    var n = {
                                                        title: t.title,
                                                        url: e.url,
                                                        timeline: t.timeline,
                                                        subtitles: !!a && a.subtitles
                                                    };
                                                    t.mark();
                                                    Lampa.Player.play(n);
                                                });
                                            }).catch(function (e) {
                                                i.extract.error(e);
                                            });
                                        });
                                    },
                                    card: i.object.movie,
                                    voiceovers: o,
                                    callback: function () {
                                        t.mark();
                                        n = t;
                                    },
                                    error: function (e, t) {
                                        ;
                                    }
                                };
                                a.push(r);
                            }
                        });
                        var u = a.find(function (e) {
                            return e.number == n.number;
                        });
                        if (!u) {
                            return M.modalChoiceTranstale({
                                from: o.find(function (e) {
                                    return e.selected;
                                }).name,
                                voicelist: o
                            });
                        }
                        u.url(function () {
                            Lampa.Player.opened() && Lampa.Player.close();
                            Lampa.Player.runas('inner');
                            Lampa.Player.play(u);
                            Lampa.Player.playlist(a);
                            u.quality && Object.keys(u.quality).length > 0 && i.setFlowsForQuality({
                                url: 'string' == typeof u.url ? u.url : '',
                                quality: u.quality,
                                quality_switched: null
                            });
                        });
                    }
                }
            ]), e;
        }(), Q = function () {
            function e(n) {
                t(this, e);
                var i = this;
                if (this.object = n, P()) {
                    if (!O()) {
                        return void Lampa.Noty.show('BWA код не указан. Укажите его в настройках.');
                    }
                    !function (e) {
                        var t = O();
                        if (t) {
                            if (z) {
                                e && e(true);
                            } else {
                                var n = 'http://rc.bwa.to/online/js/' + t;
                                Lampa.Utils.putScriptAsync([n], function () {
                                    z = true;
                                    e && e(true);
                                });
                            }
                        } else {
                            e && e(false);
                        }
                    }(function (e) {
                        i.startPlay();
                    });
                } else {
                    if (!x()) {
                        return void Lampa.Noty.show('Сервер не указан. Добавьте сервер в настройках.');
                    }
                    this.startPlay();
                }
            }
            return i(e, [
                {
                    key: 'startPlay',
                    value: function () {
                        this.object.movie.name ? this.tv() : this.movie();
                    }
                },
                {
                    key: 'movie',
                    value: function () {
                        var e = this, t = new H(this.object), n = new J(this.object);
                        t.movie({
                            movie: this.object.movie,
                            type: 'movie'
                        }).then(function (t) {
                            Lampa.Favorite.add('history', e.object.movie, 100);
                            n.movie(t);
                        }).catch(function (e) {
                            t.error(e);
                        });
                    }
                },
                {
                    key: 'tv',
                    value: function () {
                        Lampa.Activity.push({
                            url: '',
                            title: '',
                            component: 'episodes',
                            movie: this.object.movie,
                            page: 1
                        });
                    }
                }
            ]), e;
        }();
    function X(e) {
        var t = 1, n = new Lampa.Explorer(e), i = new Lampa.Filter(e), a = new Lampa.Scroll({
                mask: true,
                over: true
            }), r = e.movie.number_of_seasons || 1, s = false, c = false;
        this.create = function () {
            var t = this;
            this.getChoice();
            n.appendFiles(a.render());
            n.appendHead(i.render());
            a.body().addClass('torrent-list mapping--list');
            n.render().find('.filter--search, .filter--sort').remove();
            a.minus(n.render().find('.explorer__files-head'));
            this.activity.loader(true);
            var u = e.movie.id, d = e.movie.imdb_id, m = e.movie.tvdb_id, f = l.getSeasonsCount(u);
            function p() {
                s || Lampa.Api.seasons(e.movie, [1], function (e) {
                    if (!s) {
                        if (e[1] && e[1].seasons_count && e[1].seasons_count > r && (r = e[1].seasons_count), !c) {
                            var n = l.getSeasonsCount(u);
                            n && n > r && (r = n);
                        }
                        s = true;
                        t.filter();
                        t.selected();
                        t.activity.loader(false);
                        e[1] && e[1].episodes && e[1].episodes.length && true ? t.draw(e[1].episodes) : t.load();
                    }
                });
            }
            return f ? (r = f, c = true, p()) : (l.fetch(u, d, m, function (e) {
                c = true;
                e && e > r && (r = e);
                p();
            }), setTimeout(function () {
                s || p();
            }, 3000)), this.activity.toggle(), this.render();
        };
        this.setChoice = function (val) {
            t = val;
            var n = Lampa.Storage.cache('season_choice', '{}', 1000);
            n[e.movie.id] = val;
            Lampa.Storage.set('season_choice', n);
        };
        this.getChoice = function () {
            var stored = Lampa.Storage.get('season_choice', '{}');
            stored[e.movie.id] && (t = Math.max(1, stored[e.movie.id]), s && t > r && (t = r));
        };
        this.filter = function () {
            var e = this;
            i.addButtonBack();
            ;
            ;
        };
        this.selected = function () {
            var selectedSeason = t, e = [], t = [];
            for (var n in o)
                'season' == n && e.push(Lampa.Lang.translate('torrent_serial_season') + ': ' + o[n]);
            for (var a = 0; a < r; a++) {
                var seasonNum = a + 1;
                t.push({
                    title: Lampa.Lang.translate('torrent_serial_season') + ' ' + seasonNum,
                    season: seasonNum,
                    selected: selectedSeason == seasonNum
                });
            }
            i.set('filter', t);
            i.chosen('filter', e);
        };
        this.load = function () {
            var n = this;
            this.activity.loader(true);
            ;
            Lampa.Api.clear();
            Lampa.Api.seasons(e.movie, [1], function (e) {
                t = false;
                a.clear();
                a.reset();
                e[1] && e[1].episodes && e[1].episodes.length ? n.draw(e[1].episodes) : n.empty();
                n.activity.loader(false);
            });
        };
        this.empty = function () {
            var e = Lampa.Template.get('empty_filter'), t = $('<div class="simple-button selector"><span>' + Lampa.Lang.translate('filter_clarify') + '</span></div>');
            t.on('hover:enter', function () {
                i.render().find('.filter--filter').trigger('hover:enter');
            });
            e.find('.empty-filter__title').remove();
            e.find('.empty-filter__buttons').removeClass('hide').append(t);
            a.append(e);
            Lampa.Controller.enable('content');
        };
        this.draw = function (n) {
            n.forEach(function (i, r) {
                var l = i.episode_number || r + 1, s = Lampa.Utils.hash([
                        1,
                        '',
                        l,
                        e.movie.original_title
                    ].join('')), c = [], u = new Date((i.air_date + '').replace(/-/g, '/')), d = Date.now(), m = i.air_date ? Math.round((u.getTime() - d) / 86400000) : 1, f = Lampa.Lang.translate('full_episode_days_left') + ': ' + (i.air_date ? m : '- -');
                ;
                ;
                ;
                ;
                ;
                i.vote_average && c.push(Lampa.Template.get('season_episode_rate', { rate: parseFloat(i.vote_average + '').toFixed(1) }, true));
                i.air_date && c.push(Lampa.Utils.parseTime(i.air_date).full);
                ;
                var p = Lampa.Template.get('season_episode', i), v = p.find('.season-episode__loader'), h = p.find('.season-episode__img'), g = function (e) {
                        p.find('.season-episode__viewed').remove();
                        (Boolean(i.timeline && i.timeline.percent) || e) && p.find('.season-episode__img').append('<div class="season-episode__viewed">' + Lampa.Template.get('icon_viewed', {}, true) + '</div>');
                    };
                ;
                i.timeline && p.find('.season-episode__timeline').append(Lampa.Timeline.render(i.timeline));
                m > 0 ? p.css('opacity', '0.5') : (g(), Boolean(i.timeline && i.timeline.percent) && (t = p[0]), p.on('hover:enter', function () {
                    var r = new H(e), s = new J(e);
                    r.tv({
                        movie: e.movie,
                        season: 1,
                        episode: l,
                        type: 'episode'
                    }).then(function (o) {
                        Lampa.Favorite.add('history', e.movie, 100);
                        s.tv(o, n, i);
                        i.mark();
                        Lampa.Player.callback(function () {
                            a.update($(t), true);
                            Lampa.Controller.toggle('content');
                        });
                    }).catch(function (e) {
                        r.error(e);
                    });
                }));
                p.on('hover:focus', function (e) {
                    t = e.target;
                    a.update($(e.target), true);
                }).on('visible', function () {
                    var e = p.find('img')[0];
                    e.onerror = function () {
                        e.src = './img/img_broken.svg';
                    };
                    e.onload = function () {
                        h.addClass('season-episode__img--loaded');
                        v.remove();
                        h.append('<div class="season-episode__episode-number">' + ('0' + l).slice(-2) + '</div>');
                    };
                    i.still_path ? e.src = Lampa.TMDB.image('t/p/w300' + i.still_path) : i.img ? e.src = i.img : (v.remove(), h.append('<div class="season-episode__episode-number">' + ('0' + l).slice(-2) + '</div>'));
                }).on('hover:hover hover:touch', function (e) {
                    t = e.target;
                    Navigator.focused(t);
                });
                a.append(p);
            });
            t && a.update($(t), true);
            Lampa.Layer.visible(a.render(true));
            Lampa.Controller.enable('content');
        };
        this.start = function () {
            Lampa.Activity.active().activity === this.activity && (Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(e.movie)), Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(a.render(), n.render());
                    Lampa.Controller.collectionFocus(t || false, a.render());
                },
                left: function () {
                    n.toggle();
                },
                right: function () {
                    i.show(Lampa.Lang.translate('title_filter'), 'filter');
                },
                up: function () {
                    Navigator.canmove('up') ? Navigator.move('up') : Lampa.Controller.toggle('head');
                },
                down: function () {
                    Navigator.canmove('down') && Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            }), Lampa.Controller.toggle('content'));
        };
        this.pause = function () {
        };
        this.stop = function () {
        };
        this.render = function () {
            return n.render();
        };
        this.destroy = function () {
            a.destroy();
            i.destroy();
            n.destroy();
            try {
                Lampa.Api.clear();
            } catch (e) {
            }
        };
    }
    function Z(e) {
        Lampa.Input.edit({
            title: 'Адрес сервера',
            value: '',
            placeholder: '192.168.1.1:9118',
            nosave: true,
            free: true,
            nomic: true
        }, function (t) {
            t && k(t) && w(L().length - 1);
            e && e(t);
        });
    }
    function Y(e) {
        var t = P() ? Lampa.Utils.protocol() + 'rc.bwa.to' : x();
        if (t) {
            var n = t + '/lite/events?life=true&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar&original_title=Avatar&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest';
            n = N(n);
            var i, a = 0, o = '', r = [], l = false, s = false;
            u();
            i = setInterval(u, 2000);
            var c = e;
            e = function (e, t) {
                s = true;
                clearInterval(i);
                c(e, t);
            };
            (function i() {
                var s = new Lampa.Reguest();
                s.timeout(5000);
                var c = o ? t + '/lifeevents?memkey=' + o + '&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar&original_title=Avatar&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest' : n;
                c = N(c);
                s.silent(c, function (t) {
                    var n;
                    try {
                        n = 'string' == typeof t ? JSON.parse(t) : t;
                    } catch (e) {
                        n = t;
                    }
                    if (n && n.rch && P() && !l) {
                        return l = true, void W(n, function () {
                            a = 0;
                            o = '';
                            setTimeout(i, 500);
                        });
                    }
                    var s = n && n.online ? n.online : Lampa.Arrays.isArray(n) ? n : [];
                    if (n && n.accsdb) {
                        e(null, 'Доступ запрещён');
                    } else {
                        n && n.memkey && (o = n.memkey);
                        var c = function (e) {
                            var t = [];
                            return e && Lampa.Arrays.isArray(e) ? (e.forEach(function (e) {
                                if (false !== e.show) {
                                    var n = (e.balanser || '').toLowerCase();
                                    if (n) {
                                        for (var i = false, a = 0; a < y.length; a++) {
                                            for (var o = y[a], r = Lampa.Arrays.isArray(o.id) ? o.id : [o.id], l = 0; l < r.length; l++) {
                                                if (r[l].toLowerCase() === n) {
                                                    -1 === t.indexOf(r[0]) && t.push(r[0]);
                                                    i = true;
                                                    break;
                                                }
                                            }
                                            if (i) {
                                                break;
                                            }
                                        }
                                        i || -1 !== t.indexOf(n) || t.push(n);
                                    }
                                }
                            }), t) : t;
                        }(s);
                        c.forEach(function (e) {
                            -1 === r.indexOf(e) && r.push(e);
                        });
                        n && n.ready ? e(r.length > 0 ? r : null, 0 === r.length ? 'Источники не найдены' : null) : Lampa.Arrays.isArray(n) && r.length > 0 ? e(r, null) : ++a >= 20 ? e(r.length > 0 ? r : null, 0 === r.length ? 'Источники не найдены' : null) : setTimeout(i, 1000);
                    }
                }, function (t) {
                    e(null, 'Ошибка соединения');
                }, false, { dataType: 'text' });
            }());
        } else {
            e(null, 'Сервер не указан');
        }
        function u() {
            s || Lampa.Noty.show('Поиск источников...');
        }
    }
    function ee(e) {
        var t = Lampa.Controller.enabled().name, n = A(), i = [];
        i.push({
            title: 'Подобрать автоматически',
            auto: true
        });
        i.push({
            title: 'Выбрать все источники',
            selectAll: true,
            subtitle: 'Может вызвать баги и увеличит задержку при открытии плеера'
        });
        i.push({
            title: 'Сбросить по умолчанию',
            reset: true
        });
        y.forEach(function (e) {
            var t = Lampa.Arrays.isArray(e.id) ? e.id[0] : e.id;
            i.push({
                title: e.name,
                source: t,
                checkbox: true,
                checked: -1 !== n.indexOf(t)
            });
        });
        Lampa.Select.show({
            title: 'Выбор источников',
            items: i,
            onBack: function () {
                var n = i.filter(function (e) {
                    return e.checkbox && e.checked;
                }).map(function (e) {
                    return e.source;
                });
                0 === n.length && (n = b());
                T(n);
                Lampa.Controller.toggle(t);
                e && e();
            },
            onSelect: function (t) {
                if (t.auto) {
                    Y(function (t, n) {
                        n ? Lampa.Noty.show(n) : t && t.length > 0 && (i.forEach(function (e) {
                            e.checkbox && (e.checked = -1 !== t.indexOf(e.source));
                        }), T(t), Lampa.Noty.show('Найдено источников: ' + t.length), Lampa.Select.close(), ee(e));
                    });
                } else {
                    if (t.selectAll) {
                        var n = [];
                        return i.forEach(function (e) {
                            e.checkbox && (e.checked = true, n.push(e.source));
                        }), T(n), Lampa.Noty.show('Выбраны все источники (' + n.length + ')'), Lampa.Select.close(), void ee(e);
                    }
                    if (t.reset) {
                        var a = b();
                        return i.forEach(function (e) {
                            e.checkbox && (e.checked = -1 !== a.indexOf(e.source));
                        }), T(a), Lampa.Noty.show('Источники сброшены'), Lampa.Select.close(), void ee(e);
                    }
                    t.checked = !t.checked;
                }
            }
        });
    }
    function te() {
        var e = Lampa.Controller.enabled().name, t = function () {
                var e = Lampa.Storage.get('online_public_servers_cache', []);
                if ('string' == typeof e) {
                    try {
                        e = JSON.parse(e);
                    } catch (t) {
                        e = [];
                    }
                }
                return Lampa.Arrays.isArray(e) ? e : [];
            }();
        t.length > 0 ? ne(t, e) : ie(e);
    }
    function ne(e, t) {
        var n = [];
        function i(e) {
            return e.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();
        }
        var a = L().map(i);
        n.push({
            title: 'Обновить список',
            refresh: true
        });
        n.push({
            title: 'Публичные серверы',
            separator: true
        });
        e.forEach(function (e) {
            var t = i(e), o = -1 !== a.indexOf(t);
            n.push({
                title: C(e),
                url: e,
                subtitle: o ? 'Уже добавлен' : ''
            });
        });
        Lampa.Select.show({
            title: 'Публичные серверы (' + e.length + ')',
            items: n,
            onBack: function () {
                Lampa.Controller.toggle(t);
            },
            onSelect: function (e) {
                if (!e.separator) {
                    if (e.refresh) {
                        return Lampa.Select.close(), void ie(t, true);
                    }
                    if (k(e.url)) {
                        w(L().length - 1);
                        Lampa.Settings.update();
                    } else {
                        var n = L().indexOf(e.url);
                        -1 !== n && (w(n), Lampa.Settings.update());
                    }
                    Lampa.Controller.toggle(t);
                }
            }
        });
    }
    function ie(e, t) {
        Lampa.Noty.show('Загрузка...');
        var n = new Lampa.Reguest();
        n.timeout(10000);
        n.silent('https://ipavlin98.github.io/lampac-links/working_online_lampa.json', function (t) {
            if (Lampa.Arrays.isArray(t) && 0 !== t.length) {
                var n = [];
                if (t.forEach(function (e) {
                        e.base_url && n.push(e.base_url);
                    }), 0 !== n.length) {
                    var i, a = [], o = 0, r = n.length;
                    l();
                    i = setInterval(l, 2000);
                    n.forEach(function (t) {
                        !function (e, t) {
                            var n = e.replace(/\/+$/, '');
                            0 !== n.indexOf('http://') && 0 !== n.indexOf('https://') && (n = 'http://' + n);
                            var i = n + '/lite/events?life=true&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar: The Way of Water&original_title=Avatar: The Way of Water&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest&device_id=', a = 0, o = '';
                            function r(e) {
                                for (var t = 0; t < e.length; t++) {
                                    var n = e[t], i = (n.balanser || n.name || '').toLowerCase();
                                    if (-1 !== i.indexOf('mirage') || -1 !== i.indexOf('alloha')) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                            !function e() {
                                var l = new Lampa.Reguest();
                                l.timeout(5000);
                                var s = o ? n + '/lifeevents?memkey=' + o + '&id=76600&imdb_id=tt1630029&kinopoisk_id=505898&serial=0&title=Avatar: The Way of Water&original_title=Avatar: The Way of Water&original_language=en&year=2022&source=tmdb&clarification=0&similar=false&rchtype=&uid=guest&device_id=' : i;
                                l.silent(s, function (n) {
                                    var i = n && n.online ? n.online : Lampa.Arrays.isArray(n) ? n : [];
                                    n && n.accsdb ? t(false) : (n && n.memkey && (o = n.memkey), n && n.ready || ++a >= 15 ? t(r(i)) : setTimeout(e, 1000));
                                }, function () {
                                    t(false);
                                });
                            }();
                        }(t, function (n) {
                            if (o++, n && a.push(t), l(), o === r) {
                                if (clearInterval(i), 0 === a.length) {
                                    return void Lampa.Noty.show('Рабочие серверы не найдены');
                                }
                                s = a;
                                Lampa.Storage.set('online_public_servers_cache', s);
                                ne(a, e);
                            }
                            var s;
                        });
                    });
                } else {
                    Lampa.Noty.show('Серверы не найдены');
                }
            } else {
                Lampa.Noty.show('Серверы не найдены');
            }
            function l() {
                Lampa.Noty.show('Проверка серверов ' + o + '/' + r);
            }
        }, function () {
            Lampa.Noty.show('Ошибка загрузки');
        });
    }
    function ae() {
        Lampa.Settings.listener.follow('open', function (e) {
            'main' == e.name && (0 == Lampa.Settings.main().render().find('[data-component="online_settings"]').length && Lampa.SettingsApi.addComponent({
                component: 'online_settings',
                name: 'Онлайн HFix',
                icon: '<svg viewBox="3 6 42 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="8" width="38" height="32" rx="2" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8v32M5 16h8m-8 8h8m-8 8h8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="3" fill="currentColor"/></svg>',
                before: 'interface'
            }), Lampa.Settings.main().update());
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_mode_title',
                type: 'title'
            },
            field: { name: 'Режим работы' }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_use_bwa_toggle',
                type: 'trigger',
                default: false
            },
            field: {
                name: 'Использовать BWA',
                description: 'Переключить между сервером и BWA'
            },
            onChange: function (e) {
                F(e);
            },
            onRender: function (e) {
                e.find('.settings-param__value').text(P() ? 'Да' : 'Нет');
                e.on('hover:enter', function () {
                    F(!P());
                    e.find('.settings-param__value').text(P() ? 'Да' : 'Нет');
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_bwa_code_btn',
                type: 'static'
            },
            field: {
                name: 'BWA код',
                description: 'Введите код от bwa.to (например: abc1xyz)'
            },
            onRender: function (e) {
                var t = O();
                e.find('.settings-param__value').text(t || 'Не указан');
                e.on('hover:enter', function () {
                    var t, n;
                    t = function () {
                        var t = O();
                        e.find('.settings-param__value').text(t || 'Не указан');
                    };
                    n = O();
                    Lampa.Input.edit({
                        title: 'BWA код',
                        value: n,
                        placeholder: 'abc1xyz',
                        nosave: true,
                        free: true,
                        nomic: true
                    }, function (e) {
                        null !== e ? (function (e) {
                            Lampa.Storage.set('online_bwa_code', e);
                        }(e = e.trim()), e && (F(true), Lampa.Noty.show('BWA код сохранён')), t && t()) : t && t();
                    });
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_server_title',
                type: 'title'
            },
            field: { name: 'Свой сервер' }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_add_server_btn',
                type: 'static'
            },
            field: {
                name: 'Добавить сервер',
                description: 'Например: 192.168.1.1:9118'
            },
            onRender: function (e) {
                e.on('hover:enter', function () {
                    Z(function () {
                        Lampa.Settings.update();
                    });
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_load_public_btn',
                type: 'static'
            },
            field: {
                name: 'Загрузить публичные серверы',
                description: 'Загрузить список бесплатных серверов'
            },
            onRender: function (e) {
                e.on('hover:enter', function () {
                    te();
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_sources_title',
                type: 'title'
            },
            field: { name: 'Источники' }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_sources_btn',
                type: 'static'
            },
            field: {
                name: 'Выбор источников',
                description: 'Выбрать балансеры для поиска'
            },
            onRender: function (e) {
                e.on('hover:enter', function () {
                    ee();
                });
            }
        });
        Lampa.SettingsApi.addParam({
            component: 'online_settings',
            param: {
                name: 'online_servers_title',
                type: 'title'
            },
            field: { name: 'Список серверов' }
        });
        Lampa.Settings.listener.follow('open', function (e) {
            'online_settings' == e.name && oe(e.body);
        });
    }
    function oe(e) {
        e.find('.online-server-item').remove();
        var t = L(), n = _(), i = e.find('.settings-param-title').last();
        if (i.length || (i = e.find('.settings-param').last()), t.forEach(function (t, a) {
                var o = a === n, r = !!j(t), l = [];
                o && l.push('Текущий сервер');
                r && l.push('Токен установлен');
                var s = l.join(' \u2022 '), c = $('<div class="settings-param selector online-server-item" data-server-index="' + a + '"><div class="settings-param__name">' + C(t) + '</div><div class="settings-param__value"></div>' + (s ? '<div class="settings-param__descr">' + s + '</div>' : '') + '</div>');
                c.on('hover:enter', function () {
                    re(a, function () {
                        oe(e);
                    });
                });
                i.after(c);
                i = c;
            }), 0 === t.length) {
            var a = $('<div class="settings-param online-server-item"><div class="settings-param__name" style="opacity: 0.5">Не указан</div></div>');
            i.after(a);
        }
        e.find('.online-server-item').on('hover:focus', function () {
            Lampa.Params.listener.send('update_scroll_position');
        });
        Lampa.Params.listener.send('update_scroll');
    }
    function re(e, t, n) {
        var i = L(), a = _(), o = e === a, r = i[e], l = j(r), s = [];
        o || s.push({
            title: 'Выбрать',
            select: true
        });
        n && (s.push({
            title: l ? 'Изменить токен' : 'Добавить токен',
            token: true
        }), l && s.push({
            title: 'Удалить токен',
            removeToken: true
        }));
        s.push({
            title: 'Редактировать',
            edit: true
        });
        s.push({
            title: 'Удалить',
            remove: true
        });
        var u = Lampa.Controller.enabled().name;
        Lampa.Select.show({
            title: C(i[e]),
            items: s,
            onBack: function () {
                Lampa.Controller.toggle(u);
            },
            onSelect: function (n) {
                Lampa.Select.close();
                n.select ? (w(e), t && t(), setTimeout(function () {
                    Lampa.Controller.toggle(u);
                }, 10)) : n.token ? Lampa.Input.edit({
                    title: 'Токен сервера',
                    value: l,
                    placeholder: 'showy_token=abc123 или token=xyz',
                    nosave: true,
                    free: true,
                    nomic: true
                }, function (e) {
                    null !== e && (D(r, e.trim()), e.trim() && Lampa.Noty.show('Токен сохранён'));
                    t && t();
                    setTimeout(function () {
                        Lampa.Controller.toggle(u);
                    }, 10);
                }) : n.removeToken ? (D(r, ''), Lampa.Noty.show('Токен удалён'), t && t(), setTimeout(function () {
                    Lampa.Controller.toggle(u);
                }, 10)) : n.edit ? Lampa.Input.edit({
                    title: 'Адрес сервера',
                    value: i[e],
                    placeholder: '192.168.1.1:9118',
                    nosave: true,
                    free: true,
                    nomic: true
                }, function (n) {
                    if (n && n !== i[e]) {
                        var a = j(i[e]);
                        a && (D(i[e], ''), D(n, a));
                        i[e] = n;
                        Lampa.Storage.set('online_servers', i);
                    }
                    t && t();
                    setTimeout(function () {
                        Lampa.Controller.toggle(u);
                    }, 10);
                }) : n.remove && (D(i[e], ''), S(e), t && t(), setTimeout(function () {
                    Lampa.Controller.toggle(u);
                }, 10));
            },
            onLong: function (n) {
                n.edit && (Lampa.Select.close(), re(e, t, true));
            }
        });
    }
    !function () {
        if (!window.plugin_init) {
            window.plugin_init = true;
            ae();
            Lampa.Component.add('episodes', X);
            Lampa.VPN.region(function () {
            });
            Lampa.Listener.follow('full', function (e) {
                if ('complite' == e.type) {
                    var t = '<div class="full-start__button selector view--online" data-subtitle="' + (P() ? 'BWA: ' + (O() ? O().substring(0, 2) + '****' : 'не указан') : 'Сервер: ' + (C(x()) || 'не указан')) + '">' + '<svg viewBox="3 6 42 36" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="8" width="38" height="32" rx="2" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 8v32M5 16h8m-8 8h8m-8 8h8" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="24" r="3" fill="currentColor"/></svg>' + '<span>Онлайн</span></div>', n = $(Lampa.Lang.translate(t));
                    e.object.activity.render().find('.view--torrent').after(n);
                    n.on('hover:enter', function () {
                        Lampa.Controller.toggle('content');
                        new Q(e.data);
                    });
                }
            });
            $('body').append('\n\t\t\t<style>\n\t\t\t\t.connect-broken {\n\t\t\t\t\ttext-align: center;\n\t\t\t\t\tpadding-bottom: 1em;\n\t\t\t\t}\n\n\t\t\t\t.connect-broken__title {\n\t\t\t\t\tfont-size: 2em;\n\t\t\t\t\tline-height: 1.4;\n\t\t\t\t}\n\n\t\t\t\t.connect-broken__text {\n\t\t\t\t\tfont-size: 1.2em;\n\t\t\t\t\tpadding-top: 1em;\n\t\t\t\t\tline-height: 1.4;\n\t\t\t\t}\n\n\t\t\t\t.connect-broken__footer {\n\t\t\t\t\tdisplay: flex;\n\t\t\t\t\tjustify-content: center;\n\t\t\t\t\tmargin-top: 2em;\n\t\t\t\t}\n\n\t\t\t\t.connect-broken__footer .simple-button {\n\t\t\t\t\tmargin: 0;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr {\n\t\t\t\t\tdisplay: flex;\n\t\t\t\t\talign-items: center;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__left {\n\t\t\t\t\twidth: 33%;\n\t\t\t\t\tflex-shrink: 0;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__right {\n\t\t\t\t\tpadding-left: 2em;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__scan {\n\t\t\t\t\ttext-align: center;\n\t\t\t\t\tpadding: 1em;\n\t\t\t\t\tbackground: #fff;\n\t\t\t\t\tborder-radius: 1em;\n\t\t\t\t\tcolor: #000;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__img {\n\t\t\t\t\tposition: relative;\n\t\t\t\t\twidth: 100%;\n\t\t\t\t\tpadding-bottom: 100%;\n\t\t\t\t\toverflow: hidden;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__img img {\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: 0;\n\t\t\t\t\tleft: 0;\n\t\t\t\t\twidth: 100%;\n\t\t\t\t\theight: 100%;\n\t\t\t\t\topacity: 0;\n\t\t\t\t\ttransition: opacity .2s;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__img img.loaded {\n\t\t\t\t\topacity: 1;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__bot {\n\t\t\t\t\tfont-size: 1.2em;\n\t\t\t\t\tfont-weight: 600;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__text {\n\t\t\t\t\tfont-size: 1.2em;\n\t\t\t\t\tline-height: 1.6;\n\t\t\t\t}\n\n\t\t\t\t.modal-qr__text + .modal-qr__text {\n\t\t\t\t\tmargin-top: 3em;\n\t\t\t\t}\n\t\t\t\t.selectbox-item__subtitle {\n\t\t\t\t\topacity: 0.5;\n\t\t\t\t}\n\t\t\t</style>\n\t\t');
        }
    }();
}();
