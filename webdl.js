(function () {
    'use strict';

    // Объект плагина
    var TorrentQuality = {
        name: 'torrent_quality',
        version: '1.0.8',
        debug: true, // Включаем отладку
        settings: {
            enabled: true,
            quality_filter: 'any' // По умолчанию "Любое"
        }
    };

    // Функция для получения данных текущего фильма
    function getCurrentMovie() {
        try {
            // Проверяем активную активность в Lampa
            const active = Lampa.Activity?.active?.() || {};
            const movieData = active.data || {};
            
            // Извлекаем данные из DOM, если доступно
            const titleElement = document.querySelector('.card__title') || document.querySelector('.torrent-item__title');
            const title = movieData.title || (titleElement ? titleElement.textContent.trim() : '');
            const title_original = movieData.title_original || movieData.original_title || title;
            const year = movieData.year || (document.querySelector('.card__year') ? document.querySelector('.card__year').textContent.trim() : '');
            const genres = movieData.genres ? movieData.genres.join(',') : 'боевик,приключения,триллер'; // Фallback жанры
            
            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Данные текущего фильма:', { title, title_original, year, genres });
            }

            if (!title || !year) {
                console.error('[torrent_quality.js] Не удалось определить данные фильма');
                return null;
            }

            return { title, title_original, year, genres };
        } catch (error) {
            console.error('[torrent_quality.js] Ошибка при получении данных фильма:', error);
            return null;
        }
    }

    // Функция для получения данных из API
    async function fetchTorrentsData() {
        const movie = getCurrentMovie();
        if (!movie) {
            console.error('[torrent_quality.js] Не удалось загрузить данные торрентов: информация о фильме отсутствует');
            Lampa.Utils.message?.('Не удалось определить текущий фильм') || alert('Не удалось определить текущий фильм');
            return [];
        }

        const { title, title_original, year, genres } = movie;
        const encodedTitle = encodeURIComponent(title);
        const encodedTitleOriginal = encodeURIComponent(title_original);
        const encodedGenres = encodeURIComponent(genres);
        const apiUrl = `http://jacred.xyz/api/v2.0/indexers/all/results?apikey=&Query=${encodedTitleOriginal}&title=${encodedTitle}&title_original=${encodedTitleOriginal}&year=${year}&is_serial=0&genres=${encodedGenres}&Category[]=2000`;

        if (TorrentQuality.debug) {
            console.log('[torrent_quality.js] Формируем URL API:', apiUrl);
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Origin': 'http://lampa.mx',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Данные из API:', data);
            }
            return data.Results || [];
        } catch (error) {
            console.error('[torrent_quality.js] Ошибка при получении данных из API:', error);
            Lampa.Utils.message?.('Ошибка загрузки данных торрентов из API') || alert('Ошибка загрузки данных торрентов из API');
            return [];
        }
    }

    // Функция форматирования даты
    function formatDate(dateString) {
        if (!dateString) return 'Неизвестно';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция форматирования битрейта
    function formatBitrate(size, duration) {
        if (!size || !duration) return 'Неизвестно';
        try {
            const durationSeconds = parseDuration(duration);
            if (!durationSeconds) return 'Неизвестно';
            const bitrate = (size * 8) / durationSeconds / 1000000; // Мбит/с
            return `${bitrate.toFixed(2)} Мбит/с`;
        } catch (e) {
            return 'Неизвестно';
        }
    }

    // Функция парсинга длительности
    function parseDuration(duration) {
        if (!duration) return 0;
        const parts = duration.split(':');
        if (parts.length < 3) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseFloat(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    // Функция инициализации плагина
    function startPlugin() {
        // Добавляем компонент настроек
        Lampa.SettingsApi.addComponent({
            component: 'torrent_quality',
            name: 'Качество Торрентов',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>' +
                  '<path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79-4-4-4z" fill="currentColor"/>' +
                  '</svg>'
        });

        // Добавляем параметр "Качество Торрентов"
        Lampa.SettingsApi.addParam({
            component: 'torrent_quality',
            param: {
                name: 'quality_filter',
                type: 'select',
                values: {
                    any: 'Любое',
                    'web-dl': 'WEB-DL',
                    'web-dlrip': 'WEB-DLRip',
                    bdrip: 'BDRip'
                },
                default: 'any'
            },
            field: {
                name: 'Качество Торрентов',
                description: 'Выберите качество для фильтрации торрентов'
            },
            onRender: function (element) {
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] onRender вызван, element:', element);
                }

                // Проверяем, что element является DOM-элементом
                if (!(element instanceof HTMLElement)) {
                    console.error('[torrent_quality.js] element не является DOM-элементом:', element);
                    return;
                }

                // Находим контейнер настроек
                var container = element.closest('.settings-param') || element.closest('.settings__content') || element.parentElement;
                if (!container) {
                    console.error('[torrent_quality.js] Контейнер (.settings-param, .settings__content или parentElement) не найден для element:', element);
                    return;
                }
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Найден контейнер:', container);
                }

                // Проверяем, не добавлено ли уже подменю
                if (container.querySelector('.selectbox__content.torrent-quality-submenu')) {
                    if (TorrentQuality.debug) {
                        console.log('[torrent_quality.js] Подменю уже добавлено, пропускаем');
                    }
                    return;
                }

                // Создаем подменю
                var submenu = document.createElement('div');
                submenu.className = 'selectbox__content layer--height torrent-quality-submenu';
                submenu.style.height = '945px';
                submenu.style.display = 'none';
                submenu.innerHTML = `
                    <div class="selectbox__head">
                        <div class="selectbox__title">Качество</div>
                    </div>
                    <div class="selectbox__body layer--wheight" style="max-height: unset; height: 899.109px;">
                        <div class="scroll scroll--mask scroll--over">
                            <div class="scroll__content">
                                <div class="scroll__body" style="transform: translate3d(0px, 0px, 0px);">
                                    <div class="selectbox-item selector">
                                        <div class="selectbox-item__title">Сброс</div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dl">
                                        <div class="selectbox-item__title">WEB-DL</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="web-dlrip">
                                        <div class="selectbox-item__title">WEB-DLRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                    <div class="selectbox-item selector selectbox-item--checkbox" data-value="bdrip">
                                        <div class="selectbox-item__title">BDRip</div>
                                        <div class="selectbox-item__checkbox"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Вставляем подменю
                try {
                    container.appendChild(submenu);
                    if (TorrentQuality.debug) {
                        console.log('[torrent_quality.js] Подменю успешно добавлено в контейнер');
                    }
                } catch (e) {
                    console.error('[torrent_quality.js] Ошибка при добавлении подменю:', e);
                    return;
                }

                // Находим заголовок параметра
                var title = container.querySelector('.settings-param__name') || element.querySelector('.settings-param__name') || element.querySelector('span') || element;
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Найден заголовок:', title);
                }

                // Обработчик клика на заголовок параметра
                if (title) {
                    title.addEventListener('click', function () {
                        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
                        // Скрываем другие подменю
                        var settingsContent = container.closest('.settings__content') || document.querySelector('.settings__content');
                        if (settingsContent) {
                            settingsContent.querySelectorAll('.selectbox__content').forEach(content => {
                                if (content !== submenu) content.style.display = 'none';
                            });
                        }
                        console.log('[torrent_quality.js] Подменю "Качество":', submenu.style.display);
                    });
                } else {
                    console.error('[torrent_quality.js] Не удалось найти заголовок для привязки события клика');
                }

                // Обработчики для пунктов подменю
                submenu.querySelectorAll('.selectbox-item').forEach(item => {
                    item.addEventListener('click', function () {
                        var value = item.dataset.value || item.querySelector('.selectbox-item__title').textContent.trim();
                        value = value === 'Сброс' ? 'any' : value.toLowerCase();
                        var subtitle = container.querySelector('.settings-param__value') || element.querySelector('.settings-param__value');
                        if (subtitle) {
                            subtitle.textContent = value === 'any' ? 'Любое' : value.toUpperCase();
                        } else {
                            console.warn('[torrent_quality.js] Не найден .settings-param__value для обновления текста');
                        }

                        // Переключаем состояние чекбокса
                        if (value !== 'any') {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.toggle('selected', el.dataset.value === value);
                            });
                        } else {
                            submenu.querySelectorAll('.selectbox-item--checkbox').forEach(el => {
                                el.classList.remove('selected');
                            });
                        }

                        // Сохраняем выбранное значение
                        TorrentQuality.settings.quality_filter = value;
                        Lampa.Storage.set('torrent_quality_filter', value);
                        filterTorrents(value);
                        submenu.style.display = 'none';
                        console.log('[torrent_quality.js] Выбран фильтр:', value);
                    });
                });
            },
            onChange: function (value) {
                TorrentQuality.settings.quality_filter = value;
                Lampa.Storage.set('torrent_quality_filter', value);
                filterTorrents(value);
                console.log('[torrent_quality.js] Изменено качество через настройки:', value);
            }
        });

        // Загружаем сохраненное значение
        TorrentQuality.settings.quality_filter = Lampa.Storage.get('torrent_quality_filter', 'any');

        // Применяем фильтр при загрузке
        if (TorrentQuality.settings.enabled && TorrentQuality.settings.quality_filter !== 'any') {
            filterTorrents(TorrentQuality.settings.quality_filter);
        }
    }

    // Функция фильтрации торрентов
    async function filterTorrents(filterValue) {
        try {
            // Проверяем, активен ли раздел торрентов
            const isTorrentsPage = document.querySelector('.menu__item[data-action="mytorrents"].active') ||
                                   document.querySelector('.activity--active .torrent-list');
            if (!isTorrentsPage) {
                console.log('[torrent_quality.js] Фильтрация не выполняется: раздел торрентов не активен');
                return;
            }

            // Получаем данные из хранилища Lampa
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                try {
                    results = JSON.parse(results);
                } catch (e) {
                    console.error('[torrent_quality.js] Ошибка парсинга torrents_data:', e);
                    results = [];
                }
            }

            // Если данные отсутствуют или не соответствуют текущему фильму, загружаем из API
            const movie = getCurrentMovie();
            if (!results || !Array.isArray(results) || results.length === 0 || !results.some(r => r.Title && r.Title.includes(movie?.title || ''))) {
                console.warn('[torrent_quality.js] torrents_data пустой или не соответствует текущему фильму:', results);
                results = await fetchTorrentsData();
                if (results.length === 0) {
                    console.error('[torrent_quality.js] Не удалось загрузить данные из API');
                    Lampa.Utils.message?.('Нет данных для фильтрации торрентов. Проверьте подключение к API или настройки Lampa.') ||
                        alert('Нет данных для фильтрации торрентов. Проверьте подключение к API или настройки Lampa.');
                    return;
                }
                // Сохраняем данные в хранилище
                Lampa.Storage.set('torrents_data', JSON.stringify(results));
                if (TorrentQuality.debug) {
                    console.log('[torrent_quality.js] Данные сохранены в torrents_data:', results);
                }
            }

            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Исходные данные torrents_data:', results);
                // Проверяем наличие поля Title или альтернативных полей
                results.forEach((item, index) => {
                    console.log(`[torrent_quality.js] Элемент ${index}:`, {
                        Title: item.Title,
                        title: item.title,
                        Name: item.Name,
                        name: item.name,
                        HasTitle: !!item.Title || !!item.title || !!item.Name || !!item.name,
                        TitleType: typeof (item.Title || item.title || item.Name || item.name),
                        PublishDate: item.PublishDate,
                        Tracker: item.Tracker,
                        Size: item.Size,
                        Seeders: item.Seeders,
                        Peers: item.Peers
                    });
                });
            }

            // Фильтруем результаты
            let filteredResults = results;
            if (filterValue && filterValue !== 'any') {
                const filterLower = filterValue.toLowerCase();
                filteredResults = results.filter(result => {
                    // Проверяем возможные поля для заголовка
                    const title = result.Title || result.title || result.Name || result.name || '';
                    if (!title || typeof title !== 'string') {
                        console.warn('[torrent_quality.js] Пропущен элемент без заголовка или с некорректным заголовком:', result);
                        return false;
                    }
                    const titleLower = title.toLowerCase().replace(/[- ]/g, ''); // Удаляем дефисы и пробелы
                    // Учитываем все возможные вариации написания
                    return (
                        (filterLower === 'web-dl' && (titleLower.includes('webdl') || titleLower.includes('web dl'))) ||
                        (filterLower === 'web-dlrip' && (titleLower.includes('webdlrip') || titleLower.includes('web dlrip') || titleLower.includes('webdl rip'))) ||
                        (filterLower === 'bdrip' && (titleLower.includes('bdrip') || titleLower.includes('bd rip')))
                    );
                });
            }

            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Отфильтрованные результаты:', filteredResults);
                console.log('[torrent_quality.js] Количество отфильтрованных результатов:', filteredResults.length);
            }

            if (filteredResults.length === 0) {
                console.warn('[torrent_quality.js] Не найдено торрентов для фильтра:', filterValue);
                console.log('[torrent_quality.js] Проверьте, содержат ли элементы torrents_data поле Title с ожидаемыми значениями (WEB-DL, WEB-DLRip, BDRip)');
                Lampa.Utils.message?.(`Не найдено торрентов для фильтра: ${filterValue}. Проверьте данные торрентов или сбросьте другие фильтры.`) ||
                    alert(`Не найдено торрентов для фильтра: ${filterValue}. Проверьте данные торрентов или сбросьте другие фильтры.`);
                return;
            }

            // Отображаем результаты
            renderResultsFallback(filteredResults);
            if (TorrentQuality.debug) {
                console.log('[torrent_quality.js] Результаты отрендерены через renderResultsFallback:', filteredResults.length);
            }
        } catch (error) {
            console.error('[torrent_quality.js] Ошибка при фильтрации:', error);
            Lampa.Utils.message?.('Ошибка при фильтрации торрентов') || alert('Ошибка при фильтрации торрентов');
        }
    }

    // Альтернативная функция рендеринга
    function renderResultsFallback(results) {
        const container = document.querySelector('.torrent-list') || document.createElement('div');
        if (!container.classList.contains('torrent-list')) {
            container.className = 'torrent-list';
            document.querySelector('.activity--active')?.appendChild(container);
        }

        container.innerHTML = '';

        results.forEach(result => {
            const title = result.Title || result.title || result.Name || result.name || 'Без названия';
            const resolution = result.ffprobe?.find(f => f.codec_type === 'video')?.width && result.ffprobe?.find(f => f.codec_type === 'video')?.height
                ? `${result.ffprobe.find(f => f.codec_type === 'video').width}x${result.ffprobe.find(f => f.codec_type === 'video').height}`
                : 'Неизвестно';
            const audio = result.ffprobe?.find(f => f.codec_type === 'audio')?.channel_layout || 'Неизвестно';
            const trackers = result.Tracker || 'Неизвестно';
            const publishDate = formatDate(result.PublishDate);
            const sizeName = result.info?.sizeName || (result.Size ? (result.Size / 1024 / 1024 / 1024).toFixed(2) + ' ГБ' : 'Неизвестно');
            const bitrate = result.ffprobe?.find(f => f.codec_type === 'video')?.bit_rate && result.ffprobe?.find(f => f.codec_type === 'audio')?.duration
                ? formatBitrate(result.Size, result.ffprobe.find(f => f.codec_type === 'audio').duration)
                : 'Неизвестно';
            const voices = result.languages?.join(', ') || result.info?.voices?.join(', ') || 'Неизвестно';

            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <div class="torrent-item__title">${title}</div>
                <div class="torrent-item__ffprobe">
                    <div class="m-video">${resolution}</div>
                    <div class="m-audio">${audio}</div>
                    <div class="m-voices">${voices}</div>
                </div>
                <div>${publishDate}</div>
                <div>${trackers}</div>
                <div>Битрейт: ${bitrate}</div>
                <div>Раздают: ${result.Seeders || 0}</div>
                <div>Качают: ${result.Peers || 0}</div>
                <div>${sizeName}</div>
                ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
            `;
            container.appendChild(item);
        });

        if (TorrentQuality.debug) {
            console.log('[torrent_quality.js] Результаты отрендерены через renderResultsFallback:', results.length);
        }
    }

    // Ждем готовности приложения
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }

    // Манифест плагина
    Lampa.Manifest.plugins = {
        name: 'Качество Торрентов',
        version: '1.0.8',
        description: 'Фильтрация торрентов по качеству (WEB-DL, WEB-DLRip, BDRip) для текущего фильма'
    };
    window.torrent_quality = TorrentQuality;

})();
