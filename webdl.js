(function () {
    'use strict';

    let torrentsData = [];
    let filteredResults = [];

    // Метод для получения данных из DOM (парсер)
    function extractTorrentsFromDOM() {
        const torrents = [];
        const items = document.querySelectorAll('.torrent-item');
        items.forEach(item => {
            const titleElement = item.querySelector('.torrent-title');
            const title = titleElement ? titleElement.textContent.trim() : '';
            if (title) {
                const torrent = {
                    Title: title,
                    HasTitle: true,
                    ffprobe: item.ffprobe || { video: {}, audio: {} },
                    Size: parseFloat(item.dataset.size) || 0,
                    Seeders: parseInt(item.dataset.seeders) || 0,
                    Peers: parseInt(item.dataset.peers) || 0,
                    Tracker: item.dataset.tracker || '',
                    PublishDate: item.dataset.date || 'Invalid Date',
                    languages: item.dataset.languages ? item.dataset.languages.split(',') : [],
                    subtitles: item.dataset.subtitles ? item.dataset.subtitles.split(',') : []
                };
                torrents.push(torrent);
            }
        });
        return torrents;
    }

    // Функция фильтрации торрентов
    function filterTorrents(quality) {
        torrentsData = extractTorrentsFromDOM();
        filteredResults = torrentsData;

        if (quality && quality !== 'any') {
            filteredResults = torrentsData.filter(torrent => {
                const titleLower = torrent.Title.toLowerCase();
                if (quality === 'web-dl') {
                    return titleLower.includes('web-dl') && !titleLower.includes('web-dlrip');
                } else if (quality === 'web-dlrip') {
                    return titleLower.includes('web-dlrip');
                } else if (quality === 'bdrip') {
                    return titleLower.includes('bdrip');
                }
                return true;
            });
        }

        renderResults(filteredResults);
    }

    // Функция рендеринга результатов
    function renderResults(results) {
        const container = document.querySelector('.torrent-list');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div>Торренты не найдены</div>';
            return;
        }

        results.forEach(torrent => {
            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <div class="torrent-title">${torrent.Title}</div>
                <div class="torrent-details">
                    <span>Size: ${(torrent.Size / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                    <span>Seeders: ${torrent.Seeders}</span>
                    <span>Peers: ${torrent.Peers}</span>
                    <span>Tracker: ${torrent.Tracker}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // Оптимизация Canvas2D
    function optimizeCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        return ctx;
    }

    // Инициализация фильтра
    function initFilter() {
        const qualitySelect = document.createElement('select');
        qualitySelect.innerHTML = `
            <option value="any">Все</option>
            <option value="web-dl">WEB-DL</option>
            <option value="web-dlrip">WEB-DLRip</option>
            <option value="bdrip">BDRip</option>
        `;
        qualitySelect.addEventListener('change', (e) => {
            filterTorrents(e.target.value);
        });

        const settings = document.querySelector('.settings');
        if (settings) {
            settings.appendChild(qualitySelect);
        }

        // Инициализация с отображением всех торрентов
        filterTorrents('any');
    }

    // Интеграция с Lampa
    if (window.Lampa) {
        Lampa.Listener.follow('component', (e) => {
            if (e.name === 'torrents' && e.state === 'render') {
                initFilter();
            }
        });
    }

    // Оптимизация Canvas при загрузке
    optimizeCanvas();
})();
