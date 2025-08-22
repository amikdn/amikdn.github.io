(function () {
    'use strict';

    function initFilter() {
        // Перехватываем рендеринг меню фильтров
        Lampa.Listener.follow('menu', function (e) {
            if (e.type === 'render' && e.name === 'torrents') {
                const element = e.element instanceof jQuery ? e.element[0] : e.element;
                const selectbox = element.querySelector('.selectbox__content');
                if (!selectbox) return;

                // Добавляем пункт "Качество" в меню, если его нет
                if (!selectbox.querySelector('.selectbox-item__title[data-quality]')) {
                    const qualityItem = document.createElement('div');
                    qualityItem.className = 'selectbox-item selector';
                    qualityItem.innerHTML = '<div class="selectbox-item__title" data-quality="true">Качество</div><div class="selectbox-item__subtitle">Любое</div>';
                    selectbox.querySelector('.scroll__body').insertBefore(qualityItem, selectbox.querySelector('.scroll__body').children[1]);

                    // Обработчик клика по пункту "Качество"
                    qualityItem.addEventListener('click', function () {
                        Lampa.Select.show({
                            title: 'Качество',
                            items: [
                                { title: 'Любое', subtitle: 'any' },
                                { title: 'WEB-DLRip', subtitle: 'web-dlrip' },
                                { title: 'WEB-DL', subtitle: 'web-dl' },
                                { title: 'BDRip', subtitle: 'bdrip' }
                            ],
                            onSelect: function (item) {
                                const subtitle = qualityItem.querySelector('.selectbox-item__subtitle');
                                subtitle.textContent = item.title;
                                applyFilter(item.subtitle);
                            },
                            onBack: function () {
                                Lampa.Select.close();
                            }
                        });
                    });
                }
            }
        });
    }

    function resetFilter() {
        // Сбрасываем текущий фильтр, показывая все элементы
        const items = document.querySelectorAll('.torrent-item');
        items.forEach(item => {
            item.style.display = '';
        });
    }

    function applyFilter(quality) {
        // Проверяем, активен ли раздел торрентов
        if (!Lampa.Menu.isActive('torrents')) return;

        // Сначала сбрасываем фильтр
        resetFilter();

        // Если выбрано "Любое", ничего не фильтруем
        if (quality === 'any') return;

        // Получаем все элементы торрентов
        const items = document.querySelectorAll('.torrent-item');
        items.forEach(item => {
            const titleElement = item.querySelector('.torrent-item__title');
            if (!titleElement) return;

            const title = titleElement.textContent.toLowerCase();
            let shouldShow = false;

            // Точная проверка качества
            if (quality === 'web-dlrip' && title.includes('web-dlrip')) {
                shouldShow = true;
            } else if (quality === 'web-dl' && title.includes('web-dl') && !title.includes('web-dlrip')) {
                shouldShow = true;
            } else if (quality === 'bdrip' && title.includes('bdrip')) {
                shouldShow = true;
            }

            // Скрываем элемент, если он не соответствует выбранному качеству
            if (!shouldShow) {
                item.style.display = 'none';
            }
        });
    }

    // Инициализация фильтра при загрузке плагина
    initFilter();

    // Перехватываем выбор "Сбросить фильтр"
    Lampa.Listener.follow('selectbox', function (e) {
        if (e.type === 'select' && e.item.querySelector('.selectbox-item__title').textContent === 'Сбросить фильтр') {
            const qualityItem = document.querySelector('.selectbox-item__title[data-quality]');
            if (qualityItem) {
                qualityItem.nextElementSibling.textContent = 'Любое';
                resetFilter();
            }
        }
    });

    // Исправление Canvas для производительности
    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'canvas') {
            const originalGetContext = element.getContext;
            element.getContext = function (contextType, attributes) {
                const attrs = attributes || {};
                attrs.willReadFrequently = true;
                return originalGetContext.call(this, contextType, attrs);
            };
        }
        return element;
    };
})();
