(function() {
    'use strict';

    if (window.lampa_rating_plugin) return;
    window.lampa_rating_plugin = true;

    // Кэширование
    function getCache(id) {
        var cache = Lampa.Storage.cache('lampa_rating', 500, {});
        var item = cache[id];
        if (item) {
            var now = new Date().getTime();
            if (now - item.timestamp > 24 * 60 * 60 * 1000) { // 24 часа
                delete cache[id];
                Lampa.Storage.set('lampa_rating', cache);
                return null;
            }
            return item;
        }
        return null;
    }

    function setCache(id, data) {
        var cache = Lampa.Storage.cache('lampa_rating', 500, {});
        data.timestamp = new Date().getTime();
        cache[id] = data;
        Lampa.Storage.set('lampa_rating', cache);
        return data;
    }

    // Получение рейтинга LAMPA
    function getLampaRating(item, callback) {
        var cached = getCache(item.id);
        if (cached) {
            callback(cached.rating);
            return;
        }

        var type = 'movie';
        if (item.seasons || item.last_episode_to_air || item.first_air_date || item.original_name) {
            type = 'tv';
        }
        var url = 'http://cub.bylampa.online/api/reactions/get/' + type + '_' + item.id;

        var req = new Lampa.Reguest();
        req.timeout(15000);
        req.silent(url, function(data) {
            var rating = '0.0';
            if (data && data.result) {
                var likes = 0, dislikes = 0;
                data.result.forEach(function(reaction) {
                    if (reaction.type === 'nice' || reaction.type === 'fire') {
                        likes += parseInt(reaction.counter || 0);
                    } else if (reaction.type === 'think' || reaction.type === 'bore' || reaction.type === 'shit') {
                        dislikes += parseInt(reaction.counter || 0);
                    }
                });
                if (likes + dislikes > 0) {
                    rating = (likes / (likes + dislikes) * 10).toFixed(1);
                }
            }
            setCache(item.id, { rating: rating });
            callback(rating);
        }, function() {
            setCache(item.id, { rating: '0.0' });
            callback('0.0');
        });
    }

    // Создание элемента рейтинга
    function createVoteElement(card) {
        var voteEl = card.querySelector('.card__vote');
        if (!voteEl) {
            voteEl = document.createElement('div');
            voteEl.className = 'card__vote';
            var viewEl = card.querySelector('.card__view') || card;
            viewEl.appendChild(voteEl);
        }
        return voteEl;
    }

    // Обработка карточки
    function handleCard(event) {
        if (event.type !== 'build' || !event.object.card) return;
        var card = event.object.card;
        var data = event.object.activity.card_data || {};
        if (!data.id) return;

        var voteEl = createVoteElement(card);
        getLampaRating(data, function(rating) {
            voteEl.innerHTML = rating;
        });
    }

    // Инициализация
    Lampa.Listener.follow('card', handleCard);
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            // Переопределение для событий (опционально, если нужно)
            if (!window.Lampa.Card._build_original) {
                window.Lampa.Card._build_original = window.Lampa.Card._build;
                window.Lampa.Card._build = function() {
                    window.Lampa.Card._build_original.call(this);
                    Lampa.Listener.send('card', { type: 'build', object: this });
                };
            }
        }
    });

})();
