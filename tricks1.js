(function(){
    const CACHE_TIME = 24 * 60 * 60 * 1000;  // кэшируем на 24 часа (миллисекунды)
    let lampaRatingCache = {};

    // Функция получения рейтинга Lampa для указанного itemId
    async function fetchLampaRating(itemId) {
        try {
            const response = await fetch(`http://cub.red/ratings?item_id=${itemId}`);
            if (!response.ok) throw new Error("Failed to fetch Lampa rating");
            const data = await response.json();
            // Вычисляем сумму положительных и отрицательных реакций
            const positive = (data.like || 0) + (data.plus || 0);
            const negative = (data.dislike || 0) + (data.minus || 0) + (data.shit || 0);
            // Вычисляем рейтинг по формуле
            let ratingValue = 0;
            if ((positive + negative) > 0) {
                ratingValue = (positive / (positive + negative) * 10);
            }
            // Округляем до одного знака после запятой
            ratingValue = ratingValue.toFixed(1);
            return parseFloat(ratingValue);
        } catch (err) {
            console.error("Ошибка получения рейтинга Lampa:", err);
            return null;
        }
    }

    // Функция для получения (из кэша или с сервера) рейтинга Lampa
    async function getLampaRating(itemId) {
        const now = Date.now();
        // Проверяем кэш
        if (lampaRatingCache[itemId] && (now - lampaRatingCache[itemId].timestamp < CACHE_TIME)) {
            return lampaRatingCache[itemId].value;
        }
        // Если нет в кэше или устарело – запрашиваем заново
        const rating = await fetchLampaRating(itemId);
        if (rating !== null) {
            lampaRatingCache[itemId] = { value: rating, timestamp: Date.now() };
        }
        return rating;
    }

    // Функция для отображения рейтинга в UI (предполагается вызов при рендеринге карточки)
    async function showLampaRating(itemId, containerElement) {
        const rating = await getLampaRating(itemId);
        if (rating !== null) {
            // Создаем элемент для рейтинга Lampa
            const ratingEl = document.createElement('div');
            ratingEl.className = 'rating-item';  // класс по аналогии с другими рейтингами
            ratingEl.innerText = `Lampa: ${rating}`;
            // Вставляем в контейнер (например, рядом с IMDb/КиноПоиск рейтингами)
            containerElement.appendChild(ratingEl);
        }
    }

    // Пример интеграции: при открытии карточки фильма вызываем showLampaRating.
    Lampa.Listener.follow('card:open', function(event) {
        const item = event.item;         // объект фильма/сериала
        const itemId = item.id;          // уникальный ID (например, TMDB id или внутренний)
        const ratingsContainer = document.querySelector('.ratings-container'); // контейнер для рейтингов
        if (ratingsContainer) {
            showLampaRating(itemId, ratingsContainer);
        }
    });
})();
