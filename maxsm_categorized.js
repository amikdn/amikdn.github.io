!function() {
    "use strict";
    
    var PLUGIN_NAME = "maxsm_categorized";
    var JSON_URL = "http://lampa.azharkov.ru//maxsm/recentTitlesByCategory.json";
    var CACHE_TIME = 1000 * 60 * 30;
    var CACHE_KEY = "maxsm_categorized_cache_v1";
    var ICON_SVG = '<svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"></rect><path d="M18.105 22H15.2936V16H9.8114V22H7V8H9.8114V13.6731H15.2936V8H18.105V22Z" fill="currentColor"></path><path d="M20.5697 22V8H24.7681C25.9676 8 27.039 8.27885 27.9824 8.83654C28.9321 9.38782 29.6724 10.1763 30.2034 11.2019C30.7345 12.2212 31 13.3814 31 14.6827V15.3269C31 16.6282 30.7376 17.7853 30.2128 18.7981C29.6943 19.8109 28.9602 20.5962 28.0105 21.1538C27.0609 21.7115 25.9895 21.9936 24.7962 22H20.5697ZM23.3811 10.3365V19.6827H24.7399C25.8395 19.6827 26.6798 19.3141 27.2608 18.5769C27.8419 17.8397 28.1386 16.7853 28.1511 15.4135V14.6731C28.1511 13.25 27.8637 12.1731 27.289 11.4423C26.7142 10.7051 25.8739 10.3365 24.7681 10.3365H23.3811Z" fill="currentColor"></path></svg>';
    
    Lampa.Lang.add({
        maxsm_categorized_title: {
            ru: "Кинозал.тв",
            en: "Kinozal.tv",
            uk: "Kinozal.tv",
            be: "Kinozal.tv",
            pt: "Kinozal.tv",
            zh: "Kinozal.tv",
            he: "Kinozal.tv",
            cs: "Kinozal.tv",
            bg: "Kinozal.tv",
        },
        maxsm_clear_cache: {
            ru: "Очистить кэш",
            en: "Clear cache",
            uk: "Очистити кеш"
        },
        maxsm_cache_cleared: {
            ru: "Кэш очищен",
            en: "Cache cleared",
            uk: "Кеш очищено"
        }
    });
    
    // Функция перевода качества
    var translateQuality = function(q) {
        if (!q) return ''; 
        if (q === '4K') return '4K';
        if (q === '4k') return '4K';
        if (q === '2160p') return '4K';
        if (q === '1080p') return 'FHD';
        if (q === '720p') return 'HD';
        return 'SD'; 
    };
    
    // Инициализация кэша
    function initCache() {
        if (!localStorage[CACHE_KEY]) {
            localStorage[CACHE_KEY] = JSON.stringify({
                data: {},
                timestamp: Date.now(),
                version: "v1"
            });
        }
    }
    
    // Получение данных из кэша
    function getCache() {
        return null;
        try {
            return JSON.parse(localStorage[CACHE_KEY] || null);
        } catch (e) {
            return null;
        }
    }
    
    // Сохранение данных в кэш
    function setCache(data) {
        localStorage[CACHE_KEY] = JSON.stringify({
            data: data,
            timestamp: Date.now(),
            version: "v1"
        });
    }
    
    // Принудительная очистка кэша
    function clearCache() {
        localStorage.removeItem(CACHE_KEY);
        initCache();
        return true;
    }
    
    function CategorizedService() {
        var self = this;
        var network = new Lampa.Reguest();
        var categoriesData = {};
        
        // Загрузка данных
        self.loadData = function(onComplete, onError) {
            var cached = getCache();
            if (cached && cached.version === "v1" && Date.now() - cached.timestamp < CACHE_TIME) {
                categoriesData = cached.data;
                onComplete();
                return;
            }
            
            network.silent(JSON_URL, function(json) {
                if (!json || !json.categories || !Array.isArray(json.categories)) {
                    onError(new Error("Invalid JSON format"));
                    return;
                }
                
                // Преобразуем в нужный формат
                var normalizedData = {};
                for (var i = 0; i < json.categories.length; i++) {
                    var category = json.categories[i];
                    normalizedData[category.id] = {
                        title: category.title,
                        items: category.items.map(normalizeItem)
                    };
                }
                
                categoriesData = normalizedData;
                setCache(normalizedData);
                onComplete();
            }, function(error) {
                onError(error || new Error("Network error"));
            });
        };
        
        // Нормализация элемента
        function normalizeItem(item) {
            var isTV = item.media_type === "tv";
            return {
                id: item.id,
                title: isTV ? (item.name || "") : (item.title || ""),
                name: isTV ? (item.name || "") : (item.title || ""),
                poster_path: item.poster_path || "",
                overview: item.overview || "",
                vote_average: item.vote_average || 0,
                //release_date: isTV ? (item.first_air_date || "") : (item.release_date || ""),
                release_date: isTV ? (item.first_air_date || item.release_date || "") : (item.release_date || item.first_air_date || ""),
                first_air_date: isTV ? (item.first_air_date || "") : "",
                type: item.media_type || "movie",
                source: PLUGIN_NAME,
                original_title: item.original_title || item.title || "",
                quality: translateQuality(item.release_quality) || "",
                original_name: item.original_name || item.name || ""
            };
        }
        
        // Метод для получения данных категории
        self.list = function(params, onComplete, onError) {
            var parts = (params.url || "").split('__');
            var categoryId = parts[1];
            var page = parseInt(params.page) || 1;
            var pageSize = 20;
            
            if (!categoriesData[categoryId]) {
                self.loadData(function() {
                    sendCategoryPage(categoryId, page, pageSize, onComplete);
                }, onError);
            } else {
                sendCategoryPage(categoryId, page, pageSize, onComplete);
            }
        };
        
        function sendCategoryPage(categoryId, page, pageSize, onComplete) {
            var category = categoriesData[categoryId] || { items: [] };
            var startIndex = (page - 1) * pageSize;
            var endIndex = startIndex + pageSize;
            var items = category.items.slice(startIndex, endIndex);
            
            onComplete({
                results: items,
                page: page,
                total_pages: Math.ceil(category.items.length / pageSize),
                total_results: category.items.length
            });
        }
        
        // Метод для построения главной страницы
        self.category = function(params, onSuccess, onError) {
            self.loadData(function() {
                var sections = [];
                
                // Создаем разделы для всех категорий из JSON
                for (var categoryId in categoriesData) {
                    if (categoriesData.hasOwnProperty(categoryId)) {
                        var category = categoriesData[categoryId];
                        var categoryItems = category.items || [];
                        
                        sections.push({
                            url: PLUGIN_NAME + '__' + categoryId,
                            title: category.title,
                            page: 1,
                            total_results: categoryItems.length,
                            total_pages: Math.ceil(categoryItems.length / 20),
                            results: categoryItems.slice(0, 20),
                            source: PLUGIN_NAME,
                            more: categoryItems.length > 20
                        });
                    }
                }
                
                onSuccess(sections);
            }, onError);
        };
        
        // Остальные методы API
        self.full = function(params, onSuccess, onError) {
            if (!params.card) return onError(new Error("Card data missing"));
            
            Lampa.Api.sources.tmdb.full({
                id: params.card.id,
                method: params.card.type === "tv" ? "tv" : "movie",
                card: params.card
            }, onSuccess, onError);
        };
        
        self.clear = function() {};
        self.person = Lampa.Api.sources.tmdb.person;
        self.seasons = Lampa.Api.sources.tmdb.seasons;
    }

    function startPlugin() {
        initCache();
        
        // Добавляем кнопку очистки кэша
        Lampa.SettingsApi.addParam({
            component: "main",
            param: {
                name: "maxsm_clear_cache",
                type: "trigger",
                default: false
            },
            field: {
                name: Lampa.Lang.translate('maxsm_clear_cache'),
                description: Lampa.Lang.translate('maxsm_cache_cleared')
            },
            onChange: function() {
                clearCache();
                Lampa.Noty.show(Lampa.Lang.translate('maxsm_cache_cleared'));
            }
        });
        
        var service = new CategorizedService();
        Lampa.Api.sources[PLUGIN_NAME] = service;
        
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('maxsm_categorized_title') + '</div>' +
            '</li>'
        );
        
        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({
                title: Lampa.Lang.translate('maxsm_categorized_title'),
                component: "category",
                source: PLUGIN_NAME,
                page: 1
            });
        });
        
        $(".menu .menu__list").eq(0).append(menuItem);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') startPlugin();
    });
}();