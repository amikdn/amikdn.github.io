!function() {
    "use strict";
    
    var PLUGIN_NAME = "maxsm_novinki";
    var JSON_URL = "http://lampa.azharkov.ru//maxsm/recentTitles.json";
    var CACHE_TIME = 1000 * 60 * 30;
    var CACHE_KEY = "maxsm_novinki_cache_v6";
    var ICON_SVG = '<svg height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="35" height="27" rx="1.5" stroke="currentColor" stroke-width="3"></rect><path d="M18.105 22H15.2936V16H9.8114V22H7V8H9.8114V13.6731H15.2936V8H18.105V22Z" fill="currentColor"></path><path d="M20.5697 22V8H24.7681C25.9676 8 27.039 8.27885 27.9824 8.83654C28.9321 9.38782 29.6724 10.1763 30.2034 11.2019C30.7345 12.2212 31 13.3814 31 14.6827V15.3269C31 16.6282 30.7376 17.7853 30.2128 18.7981C29.6943 19.8109 28.9602 20.5962 28.0105 21.1538C27.0609 21.7115 25.9895 21.9936 24.7962 22H20.5697ZM23.3811 10.3365V19.6827H24.7399C25.8395 19.6827 26.6798 19.3141 27.2608 18.5769C27.8419 17.8397 28.1386 16.7853 28.1511 15.4135V14.6731C28.1511 13.25 27.8637 12.1731 27.289 11.4423C26.7142 10.7051 25.8739 10.3365 24.7681 10.3365H23.3811Z" fill="currentColor"></path></svg>';
    
    // Размер страницы и количество предзагружаемых страниц
    var PAGE_SIZE = 20;
    var PRELOAD_PAGES = 1;
    
    // Инициализация кэша
    function initCache() {
        if (!localStorage[CACHE_KEY]) {
            localStorage[CACHE_KEY] = JSON.stringify({
                data: [],
                timestamp: Date.now(),
                version: "v6",
                total_results: 0
            });
        }
    }
    
    // Получение данных из кэша
    function getCache() {
        return null;
        try {
            var cache = JSON.parse(localStorage[CACHE_KEY] || "{}");
            if (cache.version !== "v6") return null;
            
            var cacheAge = Date.now() - cache.timestamp;
            if (cacheAge < CACHE_TIME && cache.data && cache.data.length > 0) {
                return {
                    items: cache.data,
                    total_results: cache.total_results
                }; 
            }
        } catch (e) {
            console.error("Cache parse error", e);
        }
        return null;
    }
    
    // Сохранение данных в кэш
    function setCache(items, totalResults) {
        localStorage[CACHE_KEY] = JSON.stringify({
            data: items,
            timestamp: Date.now(),
            version: "v6",
            total_results: totalResults
        });
    }
    
    // Принудительная очистка кэша
    function clearCache() {
        localStorage.removeItem(CACHE_KEY);
        initCache();
        return true;
    }
    
    Lampa.Lang.add({
        maxsm_novinki_title: {
            ru: "Новинки Трекеров",
            en: "In Quality",
            uk: "У якості",
            be: "У якасці",
            pt: "Com Qualidade",
            zh: "高质量",
            he: "באיכות",
            cs: "V kvalitě",
            bg: "В качество"
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
    
    function NovinkiService() {
        var self = this;
        var network = new Lampa.Reguest();
        var allItems = [];
        var normalizedItems = [];
        
        // Оптимизированная нормализация данных
        function normalizeData(items) {
            // Кешируем нормализованные данные
            if (normalizedItems.length > 0) return normalizedItems;
            
            var startTime = Date.now();
            
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
                        
            normalizedItems = items.map(function(item) {
                var isTV = item.media_type === "tv";
                var card = {
                    id: item.id,
                    title: isTV ? (item.name || item.title || "") : (item.title || item.name || ""),
                    poster_path: item.poster_path || "",
                    overview: item.overview || "",
                    vote_average: item.vote_average || 0,
                    release_date: isTV ? (item.first_air_date || item.release_date || "") : (item.release_date || item.first_air_date || ""),
                    type: isTV ? "tv" : "movie",
                    source: PLUGIN_NAME,
                    quality: translateQuality(item.release_quality) || "",
                    original_title: item.original_title || item.title || "",
                    original_name: item.original_name || item.name || ""
                };
                
                // Только самые необходимые поля для сериалов
                if (isTV) {
                    card.number_of_seasons = item.number_of_seasons || 
                        (item.seasons ? Object.keys(item.seasons).length : 1);
                }
                
                return card;
            });
            
            console.log("Normalization time:", Date.now() - startTime, "ms");
            return normalizedItems;
        }
        
        // Загрузка данных с кешированием
        self.loadData = function(onComplete, onError) {
            var cached = getCache();
            if (cached) {
                allItems = cached.items;
                onComplete();
                return;
            }
            
            network.silent(JSON_URL, function(json) {
                if (!json || !json.results || !Array.isArray(json.results)) {
                    onError(new Error("Invalid JSON format"));
                    return;
                }
                
                allItems = normalizeData(json.results);
                // setCache(allItems, allItems.length);
                onComplete();
            }, function(error) {
                onError(error || new Error("Network error"));
            });
        };
        
        // Метод для компонента category_full с оптимизацией
        self.list = function(params, onComplete, onError) {
            var page = parseInt(params.page) || 1;
            
            if (allItems.length === 0) {
                self.loadData(function() {
                    sendPage(page, onComplete);
                }, onError);
            } else {
                sendPage(page, onComplete);
            }
        };
        
        function sendPage(page, onComplete) {
            var startIndex = (page - 1) * PAGE_SIZE;
            var endIndex = startIndex + PAGE_SIZE;
            var pageItems = allItems.slice(startIndex, endIndex);
            
            // Запрос на предзагрузку следующих страниц
            if (PRELOAD_PAGES > 0) {
                var nextPage = page + 1;
                var preloadIndex = nextPage * PAGE_SIZE;
                if (preloadIndex < allItems.length) {
                    // Асинхронная предзагрузка
                    setTimeout(function() {
                        var preloadItems = allItems.slice(preloadIndex, preloadIndex + PAGE_SIZE * PRELOAD_PAGES);
                        // Просто вызываем срез, чтобы данные были в памяти
                    }, 1000);
                }
            }
            
            onComplete({
                results: pageItems,
                page: page,
                total_pages: Math.ceil(allItems.length / PAGE_SIZE),
                total_results: allItems.length
            });
        }
        
        // Упрощенный метод для full
        self.full = function(params, onSuccess, onError) {
            if (!params.card) return onError(new Error("Card data missing"));
            
            Lampa.Api.sources.tmdb.full({
                id: params.card.id,
                method: params.card.type,
                card: params.card
            }, onSuccess, onError);
        };
    }

    function startPlugin() {
        // initCache();
        
        var novinkiService = new NovinkiService();
        Lampa.Api.sources[PLUGIN_NAME] = novinkiService;
        
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('maxsm_novinki_title') + '</div>' +
            '</li>'
        );
        
        menuItem.on("hover:enter", function() {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('maxsm_novinki_title'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });
        
        $(".menu .menu__list").eq(0).append(menuItem);
        
        // Пункт для очистки кэша
        var clearCacheItem = $(
            '<li class="menu__item selector" data-action="maxsm_clear_novinki_cache">' +
                '<div class="menu__ico"><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="currentColor" d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg></div>' +
                '<div class="menu__text">' + Lampa.Lang.translate('clear_cache') + '</div>' +
            '</li>'
        );
        
        clearCacheItem.on("hover:enter", function() {
            if (clearCache()) {
                Lampa.Noty.show(Lampa.Lang.translate('cache_cleared'));
            }
        });
        
        // $(".menu .menu__list").eq(0).append(clearCacheItem);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') startPlugin();
    });
}();