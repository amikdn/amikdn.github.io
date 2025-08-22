(function () {
    'use strict';

    // Ждем полной загрузки приложения Lampa
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            console.log('[webdl.js] Приложение готово, добавляем кнопку WEB-DL в меню');

            // Добавляем кнопку с подменю в главное меню
            Lampa.Menu.add('filter_webdl', {
                title: 'Фильтр WEB-DL',
                icon: 'filter',
                submenu: [
                    {
                        title: 'Все качества',
                        action: function () {
                            filterWebDLResults();
                        }
                    },
                    {
                        title: '1080p+',
                        action: function () {
                            filterWebDLResults(1080);
                        }
                    },
                    {
                        title: '2160p',
                        action: function () {
                            filterWebDLResults(2160);
                        }
                    }
                ]
            });

            console.log('[webdl.js] Кнопка и подменю WEB-DL добавлены в меню');
        }
    });

    // Функция для фильтрации результатов по WEB-DL
    function filterWebDLResults(minQuality) {
        try {
            // Получаем данные из хранилища Lampa или выполняем API-запрос
            let results = Lampa.Storage.get('torrents_data', '[]');
            if (typeof results === 'string') {
                results = JSON.parse(results);
            }

            if (!results || !Array.isArray(results)) {
                console.error('[webdl.js] Нет данных для фильтрации или данные некорректны');
                Lampa.Notice.show('Нет данных для фильтрации WEB-DL');
                return;
            }

            // Фильтруем результаты по WEB-DL и, при необходимости, по качеству
            const webDLResults = results.filter(result => {
                const isWebDL = result.Title && (
                    result.Title.toLowerCase().includes('web-dl') || 
                    result.Title.toLowerCase().includes('webdl-rip')
                );
                const meetsQuality = !minQuality || (result.info && result.info.quality >= minQuality);
                return isWebDL && meetsQuality;
            });

            console.log('[webdl.js] Отфильтрованные WEB-DL результаты:', webDLResults);

            // Проверяем, есть ли результаты
            if (webDLResults.length === 0) {
                Lampa.Notice.show('Не найдено WEB-DL результатов для отображения');
                return;
            }

            // Отображаем результаты в интерфейсе Lampa
            if (typeof Lampa.Torrents.render === 'function') {
                Lampa.Torrents.render(webDLResults);
            } else {
                console.error('[webdl.js] Метод Lampa.Torrents.render не найден');
                Lampa.Notice.show('Ошибка отображения результатов');
                // Альтернативный рендеринг, если метод неизвестен
                renderResultsFallback(webDLResults);
            }
        } catch (error) {
            console.error('[webdl.js] Ошибка при фильтрации:', error);
            Lampa.Notice.show('Ошибка при фильтрации WEB-DL');
        }
    }

    // Альтернативная функция рендеринга результатов (если Lampa.Torrents.render недоступен)
    function renderResultsFallback(results) {
        const container = document.querySelector('.torrent-list') || document.createElement('div');
        if (!container.classList.contains('torrent-list')) {
            container.className = 'torrent-list';
            document.body.appendChild(container);
        }

        container.innerHTML = ''; // Очищаем контейнер

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'torrent-item';
            item.innerHTML = `
                <h3>${result.Title || 'Без названия'}</h3>
                <p>Качество: ${result.info && result.info.quality ? result.info.quality + 'p' : 'Неизвестно'}</p>
                <p>Размер: ${result.info && result.info.sizeName ? result.info.sizeName : 'Неизвестно'}</p>
                <p>Сиды: ${result.Seeders || 0}, Пиры: ${result.Peers || 0}</p>
                ${result.MagnetUri ? `<a href="${result.MagnetUri}" target="_blank">Скачать</a>` : ''}
            `;
            container.appendChild(item);
        });

        // Базовые стили для отображения
        const style = document.createElement('style');
        style.textContent = `
            .torrent-list { padding: 20px; }
            .torrent-item { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
            .torrent-item h3 { margin: 0; font-size: 16px; }
            .torrent-item p { margin: 5px 0; }
            .torrent-item a { color: #007bff; text-decoration: none; }
            .torrent-item a:hover { text-decoration: underline; }
        `;
        document.head.appendChild(style);
    }

    // Проверка загрузки данных, если они еще не сохранены
    Lampa.Listener.follow('torrents_data', function (e) {
        if (e.type === 'update') {
            console.log('[webdl.js] Данные torrents_data обновлены:', e.data);
        }
    });

    // Добавляем CSS для видимости кнопки в меню
    const style = document.createElement('style');
    style.textContent = `
        .menu__item.filter_webdl {
            display: block !important;
            visibility: visible !important;
            padding: 10px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    console.log('[webdl.js] Плагин инициализирован');
})();
