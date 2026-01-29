(function () {
    'use strict';

    if (typeof Lampa === 'undefined') return;
    if (!Lampa.Manifest || Lampa.Manifest.app_digital < 300) return;

    const DefaultConfig = {
        enableInterface: true,
        enableGlow: true,
        cardBorderColor: '#FFFF00',
        cardBorderWidth: '0.3em',
        cardGlowColor: '#F5F5F5',
        cardGlowBlur: '10px',
        cardGlowSpread: '5px',
        cardImageBorderGap: '0.2em',
        cardCornersRadius: '0.1em',
        folderCornersRadius: '0em',
        itemsLineTitleItalic: true,
        interfaceTitleItalic: true,
        interfaceDescriptionItalic: true,
        mainSourceItalic: true,
        showRating: true,
        showRatingPrefix: true,
        voteBorderColor: '#FFFF00',
        voteTextColor: '#FFFF00',
        voteFontSize: '1.1em',
        cardScale: 1.06,
        
        // Управление элементами интерфейса
        showLogo: true,
        showMenuIcon: true,
        showNotifications: true,
        showProfile: true,
        showBackButton: true,
        formatTitle: true,
        removeAds: true
    };

    let StyleConfig = { ...DefaultConfig };

    function loadSettings() {
        try {
            const saved = localStorage.getItem('lampa_interface_v3_settings');
            if (saved) {
                StyleConfig = { ...DefaultConfig, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('lampa_interface_v3_settings', JSON.stringify(StyleConfig));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    function addStyles() {
        const oldStyles = document.getElementById('interface-v3-styles');
        if (oldStyles) oldStyles.remove();

        if (!StyleConfig.enableInterface) {
            document.querySelectorAll('.new-interface').forEach(el => {
                el.classList.remove('new-interface');
            });
            return;
        }

        const borderStyles = StyleConfig.enableGlow ? `
.card.focus .card__view::after,
.card.hover .card__view::after {
    content: "";
    position: absolute;
    top: ${StyleConfig.cardImageBorderGap};
    left: ${StyleConfig.cardImageBorderGap};
    right: ${StyleConfig.cardImageBorderGap};
    bottom: ${StyleConfig.cardImageBorderGap};
    border: ${StyleConfig.cardBorderWidth} solid ${StyleConfig.cardBorderColor} !important;
    border-radius: 0em !important;
    box-shadow: 0 0 ${StyleConfig.cardGlowBlur} ${StyleConfig.cardGlowSpread} ${StyleConfig.cardGlowColor} !important;
    pointer-events: none;
}
` : `
.card.focus .card__view::after,
.card.hover .card__view::after {
    content: none !important;
}

.new-interface .card.focus .card__view,
.new-interface .card.hover .card__view {
    border: ${StyleConfig.cardBorderWidth} solid ${StyleConfig.cardBorderColor} !important;
    border-radius: ${StyleConfig.cardCornersRadius} !important;
    -webkit-border-radius: ${StyleConfig.cardCornersRadius} !important;
    -moz-border-radius: ${StyleConfig.cardCornersRadius} !important;
}
`;

        const ratingStyles = StyleConfig.showRating ? `
/* Стили для рейтинга - только оформление, не трогаем содержимое */
.new-interface .card__vote {
    position: absolute !important;
    right: 0.2em !important;
    bottom: 0.4em !important;
    background: rgba(0, 0, 0, 0.5) !important;
    padding: 0.15em 0.3em !important;
    border-radius: 0.0em !important;
    border: 0.5px solid ${StyleConfig.voteBorderColor} !important;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5) !important;
    z-index: 2;
    pointer-events: none;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1;
}

/* Цвет текста рейтинга применяем ко всем элементам внутри */
.new-interface .card__vote,
.new-interface .card__vote * {
    color: ${StyleConfig.voteTextColor} !important;
}

/* Размер шрифта для основного текста рейтинга */
.new-interface .card__vote {
    font-size: ${StyleConfig.voteFontSize} !important;
    font-weight: 400 !important;
}

/* Добавляем префикс TMDB */
.new-interface .card__vote::before {
    content: "${StyleConfig.showRatingPrefix ? 'TMDB' : ''}";
    font-size: 0.7em;
    margin-bottom: 0.1em;
    display: block;
}
` : `
.card__vote {
    display: none !important;
}
`;

        const interfaceStyles = `
<style id="interface-v3-styles">
.new-interface .card.card--wide {
    width: 18.5em !important;
    min-width: 18.5em !important;
    max-width: 18.5em !important;
    flex: 0 0 18.5em !important;
}

.new-interface .card.card--small.history-card {
    width: 10.5em !important;
    min-width: 10.5em !important;
    max-width: 10.5em !important;
    flex: 0 0 10.5em !important;
}

.new-interface .card.card--small.history-card .card__view {
    padding-bottom: 150% !important;
}

.new-interface .items-line {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
}

.new-interface .items-line__body {
    margin-top: 0.5em !important;
    margin-bottom: 1.5em !important;
}

.new-interface-info {
    position: relative;
    padding: 0em 1.5em 0 1.5em;
}

.new-interface-info__body {
    width: 95%;
    padding-top: 1.1em;
}

.new-interface-info__head {
    display: none !important;
}

.new-interface-info__title {
    font-size: 4em;
    font-weight: 600;
    margin-bottom: 0.5em;
    overflow: hidden;
    -o-text-overflow: ".";
    text-overflow: ".";
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-left: -0.03em;
    line-height: 1;
    ${StyleConfig.interfaceTitleItalic ? 'font-style: italic !important;' : ''}
}

.new-interface-info__details {
    margin-bottom: 0.1em;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    min-height: 1.9em;
    font-size: 1.2em;
    gap: 0.0em;
}

.new-interface-info__block {
    border: 1px solid rgba(255, 255, 255, 1);
    padding: 0.3em 0.5em;
    border-radius: 0.0em;
    display: flex;
    align-items: center;
    white-space: nowrap;
    box-sizing: border-box;
}

.new-interface-info__block span {
    font-size: 0.95em;
    line-height: 1.2;
    white-space: nowrap;
}

.new-interface-info__separator {
    margin: 0 0.0em;
    font-size: 1.5em;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.new-interface-info__description {
    display: none !important;
    ${StyleConfig.interfaceDescriptionItalic ? 'font-style: italic !important;' : ''}
}

.new-interface .card-more__box {
    padding-bottom: 60%;
}

.new-interface .full-start__background {
    height: 108%;
    top: -6em;
}

.new-interface .full-start__rate {
    font-size: 1.3em;
    margin-right: 0;
    display: none;
}

.new-interface-info__pg {
    font-size: 1em;
    border: none;
    outline: none;
    background: transparent;
    padding: 0;
    margin: 0;
    display: inline-block;
    line-height: 1;
}

.new-interface .card__promo {
    display: none;
}

.new-interface .card.card--wide .card-watched {
    display: none !important;
}

.new-interface .card.card--wide + .card-more .card-more__box {
    padding-bottom: 60%;
}

body.light--version .new-interface-info__body {
    width: 69%;
    padding-top: 1.5em;
}

body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.focus .card__view {
    animation: animation-card-focus 0.2s;
}
body.advanced--animation:not(.no--animation) .new-interface .card--small.card--wide.animate-trigger-enter .card__view {
    animation: animation-trigger-enter 0.2s forwards;
}

.card__img {
    border-radius: ${StyleConfig.cardCornersRadius} !important;
    -webkit-border-radius: ${StyleConfig.cardCornersRadius} !important;
    -moz-border-radius: ${StyleConfig.cardCornersRadius} !important;
    display: block;
}

${borderStyles}

.bookmarks-folder__layer {
    border-radius: ${StyleConfig.folderCornersRadius} !important;
    -webkit-border-radius: ${StyleConfig.folderCornersRadius} !important;
    -moz-border-radius: ${StyleConfig.folderCornersRadius} !important;
}

.items-line__title {
    font-size: 1.8em !important;
    font-weight: 300 !important;
    ${StyleConfig.itemsLineTitleItalic ? 'font-style: italic !important;' : ''}
}

.head__title {
    ${StyleConfig.mainSourceItalic ? 'font-style: italic !important; padding-right: 5px !important;' : ''}
}

.new-interface-info__title {
    text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.7) !important;
    ${StyleConfig.interfaceTitleItalic ? 'font-style: italic !important;' : ''}
}

.card__type {
    display: none !important;
}

${ratingStyles}

.card__view {
    position: relative;
}

.card.focus, .card.hover {
    transform: scale(${StyleConfig.cardScale});
    transition: transform 0.2s ease-in-out;
    z-index: 2;
}

/* Стили для управления элементами интерфейса */
${!StyleConfig.showLogo ? '.head__logo-icon { display: none !important; }' : ''}
${!StyleConfig.showMenuIcon ? '.head__menu-icon { display: none !important; }' : ''}
${!StyleConfig.showNotifications ? '.head__action.open--notice.notice--icon, .head__action.notice--icon, .head__action[data-action="notice"], .head__action.open--feed, .head__action[data-action="feed"], .menu__item[data-action="feed"] { display: none !important; }' : ''}
${!StyleConfig.showProfile ? '.head__action.open--profile, .head__action[data-action="profile"] { display: none !important; }' : ''}
${!StyleConfig.showBackButton ? '.head__backward { display: none !important; }' : ''}
${StyleConfig.removeAds ? '.myBot, .ad-server__text, .ad-server__label, .ad-server__qr, img[src*="api.qrserver.com"] { display: none !important; visibility: hidden !important; }' : ''}
</style>`;

        document.head.insertAdjacentHTML('beforeend', interfaceStyles);
    }

    function applyInterfaceFixes() {
        if (!StyleConfig.enableInterface) return;
        
        // Форматирование заголовка (Раздел : ИСТОЧНИК)
        if (StyleConfig.formatTitle) {
            const titleEl = document.querySelector('.head__title');
            if (titleEl && titleEl.textContent.indexOf(' - ') !== -1 && titleEl.innerHTML.indexOf('<b') === -1) {
                const parts = titleEl.textContent.split(' - ');
                if (parts.length === 2) {
                    titleEl.innerHTML = parts[0].trim() + ' : <b style="font-weight:900; margin-left:5px; color:#ffffff;">' + parts[1].trim().toUpperCase() + '</b>';
                }
            }
        }
    }

    function startInterfaceObserver() {
        if (!StyleConfig.enableInterface) return;
        
        applyInterfaceFixes();
        
        const observer = new MutationObserver(function(mutations) {
            applyInterfaceFixes();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        return observer;
    }

    function addSettingsToLampa() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addParam) {
            setTimeout(addSettingsToLampa, 1000);
            return;
        }

        if (!window.interface_v3_add_param_ready) {
            window.interface_v3_add_param_ready = true;
            Lampa.SettingsApi.addComponent({
                component: 'interface_v3',
                name: 'Стильный интерфейс',
                icon: '<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M4 11c0-4 3-7 8-7 3.5 0 6 2.2 6 4.8 0 1.3-.7 2.2-1.8 2.2h-1.4c-1 0-1.8.8-1.8 1.8 0 1.1.2 1.7.2 1.7 0 1.7-1.4 3.1-3.1 3.1-3 0-6.1-2.5-6.1-6.6z"/><circle cx="9" cy="9" r="0.8" fill="currentColor"/><circle cx="12" cy="7" r="0.8" fill="currentColor"/><circle cx="15" cy="9" r="0.8" fill="currentColor"/></svg>'
            });
        }

        // Основная настройка включения/выключения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_enable",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.enableInterface ? "1" : "0"
            },
            field: {
                name: "Стильный интерфейс",
                description: "Включить или выключить стильный интерфейс V3"
            },
            onChange: function(value) {
                StyleConfig.enableInterface = value === "1";
                saveSettings();
                addStyles();
                if (Lampa.Noty) {
                    Lampa.Noty.show("Для применения изменений перезагрузите страницу", 3000);
                }
            }
        });

        // Заголовок раздела
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_interface_settings",
                type: "title"
            },
            field: {
                name: "───── Элементы интерфейса ─────",
                description: "Управление отображением элементов интерфейса"
            }
        });

        // Логотип
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_logo",
                type: "select",
                values: {
                    "1": "Показать",
                    "0": "Скрыть"
                },
                default: StyleConfig.showLogo ? "1" : "0"
            },
            field: {
                name: "Логотип",
                description: "Показать или скрыть логотип в шапке"
            },
            onChange: function(value) {
                StyleConfig.showLogo = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Иконка меню
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_menu",
                type: "select",
                values: {
                    "1": "Показать",
                    "0": "Скрыть"
                },
                default: StyleConfig.showMenuIcon ? "1" : "0"
            },
            field: {
                name: "Иконка меню",
                description: "Показать или скрыть иконку меню в шапке"
            },
            onChange: function(value) {
                StyleConfig.showMenuIcon = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Уведомления
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_notifications",
                type: "select",
                values: {
                    "1": "Показать",
                    "0": "Скрыть"
                },
                default: StyleConfig.showNotifications ? "1" : "0"
            },
            field: {
                name: "Уведомления",
                description: "Показывать или скрыть иконку уведомлений"
            },
            onChange: function(value) {
                StyleConfig.showNotifications = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Профиль
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_profile",
                type: "select",
                values: {
                    "1": "Показать",
                    "0": "Скрыть"
                },
                default: StyleConfig.showProfile ? "1" : "0"
            },
            field: {
                name: "Профиль",
                description: "Показывать или скрыть иконку профиля"
            },
            onChange: function(value) {
                StyleConfig.showProfile = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Кнопка Назад
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_back",
                type: "select",
                values: {
                    "1": "Показать",
                    "0": "Скрыть"
                },
                default: StyleConfig.showBackButton ? "1" : "0"
            },
            field: {
                name: "Кнопка 'Назад'",
                description: "Показывать или скрыть кнопку 'Назад' в шапке"
            },
            onChange: function(value) {
                StyleConfig.showBackButton = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Форматирование заголовка
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_format_title",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.formatTitle ? "1" : "0"
            },
            field: {
                name: "Форматирование заголовка",
                description: "Форматировать заголовок 'Раздел - Источник' в 'Раздел : ИСТОЧНИК'"
            },
            onChange: function(value) {
                StyleConfig.formatTitle = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Убрать рекламу
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_remove_ads",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.removeAds ? "1" : "0"
            },
            field: {
                name: "Убрать рекламу",
                description: "Скрывать рекламные элементы"
            },
            onChange: function(value) {
                StyleConfig.removeAds = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела рамки
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_border_settings",
                type: "title"
            },
            field: {
                name: "───── Рамка карточки ─────",
                description: "Настройки оформления рамки"
            }
        });

        // Цвет рамки
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_border_color",
                type: "select",
                values: {
                    "#FFFF00": "Желтый",
                    "#FF0000": "Красный",
                    "#00FF00": "Зеленый",
                    "#0000FF": "Синий",
                    "#FFFFFF": "Белый",
                    "#FFA500": "Оранжевый",
                    "#FF00FF": "Пурпурный",
                    "#00FFFF": "Голубой",
                    "#FFD700": "Золотой",
                    "#C0C0C0": "Серебряный"
                },
                default: StyleConfig.cardBorderColor
            },
            field: {
                name: "Цвет рамки",
                description: "Цвет рамки при фокусе/наведении"
            },
            onChange: function(value) {
                StyleConfig.cardBorderColor = value;
                saveSettings();
                addStyles();
            }
        });

        // Толщина рамки
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_border_width",
                type: "select",
                values: {
                    "0.1em": "Тонкая (0.1em)",
                    "0.2em": "Средняя (0.2em)",
                    "0.3em": "Толстая (0.3em)",
                    "0.4em": "Очень толстая (0.4em)",
                    "0.5em": "Максимальная (0.5em)"
                },
                default: StyleConfig.cardBorderWidth
            },
            field: {
                name: "Толщина рамки",
                description: "Толщина рамки карточки"
            },
            onChange: function(value) {
                StyleConfig.cardBorderWidth = value;
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела свечения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_glow_settings",
                type: "title"
            },
            field: {
                name: "───── Свечение ─────",
                description: "Настройки свечения вокруг рамки"
            }
        });

        // Включение свечения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_glow_enable",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.enableGlow ? "1" : "0"
            },
            field: {
                name: "Свечение рамки",
                description: "Включить или выключить свечение вокруг рамки карточки"
            },
            onChange: function(value) {
                StyleConfig.enableGlow = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Цвет свечения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_glow_color",
                type: "select",
                values: {
                    "#F5F5F5": "Белый",
                    "#FFFF00": "Желтый",
                    "#FF0000": "Красный",
                    "#00FF00": "Зеленый",
                    "#0000FF": "Синий",
                    "#FFA500": "Оранжевый",
                    "#FF00FF": "Пурпурный",
                    "#00FFFF": "Голубой",
                    "#FF69B4": "Розовый",
                    "#7CFC00": "Салатовый"
                },
                default: StyleConfig.cardGlowColor
            },
            field: {
                name: "Цвет свечения",
                description: "Цвет свечения вокруг рамки"
            },
            onChange: function(value) {
                StyleConfig.cardGlowColor = value;
                saveSettings();
                addStyles();
            }
        });

        // Размытие свечения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_glow_blur",
                type: "select",
                values: {
                    "5px": "Слабое (5px)",
                    "10px": "Среднее (10px)",
                    "15px": "Сильное (15px)",
                    "20px": "Очень сильное (20px)",
                    "25px": "Максимальное (25px)"
                },
                default: StyleConfig.cardGlowBlur
            },
            field: {
                name: "Размытие свечения",
                description: "Интенсивность свечения вокруг рамки"
            },
            onChange: function(value) {
                StyleConfig.cardGlowBlur = value;
                saveSettings();
                addStyles();
            }
        });

        // Распространение свечения
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_glow_spread",
                type: "select",
                values: {
                    "1px": "Минимальное (1px)",
                    "2px": "Слабое (2px)",
                    "3px": "Среднее (3px)",
                    "5px": "Сильное (5px)",
                    "8px": "Максимальное (8px)"
                },
                default: StyleConfig.cardGlowSpread
            },
            field: {
                name: "Распространение свечения",
                description: "Насколько далеко распространяется свечение"
            },
            onChange: function(value) {
                StyleConfig.cardGlowSpread = value;
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела внешнего вида
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_appearance_settings",
                type: "title"
            },
            field: {
                name: "───── Внешний вид ─────",
                description: "Общие настройки внешнего вида"
            }
        });

        // Скругление углов
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_corners_radius",
                type: "select",
                values: {
                    "0em": "Без скругления",
                    "0.1em": "Минимальное (0.1em)",
                    "0.3em": "Маленькое (0.3em)",
                    "0.5em": "Среднее (0.5em)",
                    "1em": "Большое (1em)"
                },
                default: StyleConfig.cardCornersRadius
            },
            field: {
                name: "Скругление углов",
                description: "Радиус скругления углов постеров"
            },
            onChange: function(value) {
                StyleConfig.cardCornersRadius = value;
                saveSettings();
                addStyles();
            }
        });

        // Увеличение карточки
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_card_scale",
                type: "select",
                values: {
                    "1.02": "Минимальное (1.02x)",
                    "1.04": "Маленькое (1.04x)",
                    "1.06": "Среднее (1.06x)",
                    "1.08": "Большое (1.08x)",
                    "1.10": "Максимальное (1.10x)"
                },
                default: StyleConfig.cardScale.toString()
            },
            field: {
                name: "Увеличение карточки",
                description: "Масштаб карточки при фокусе/наведении"
            },
            onChange: function(value) {
                StyleConfig.cardScale = parseFloat(value);
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела рейтинга
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_rating_settings",
                type: "title"
            },
            field: {
                name: "───── Рейтинг ─────",
                description: "Настройки отображения рейтинга"
            }
        });

        // Показывать рейтинг
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_rating",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.showRating ? "1" : "0"
            },
            field: {
                name: "Показывать рейтинг",
                description: "Показывать или скрывать рейтинг на карточках"
            },
            onChange: function(value) {
                StyleConfig.showRating = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Показывать префикс TMDB
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_show_rating_prefix",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.showRatingPrefix ? "1" : "0"
            },
            field: {
                name: "Префикс TMDB",
                description: "Показывать префикс TMDB над рейтингом"
            },
            onChange: function(value) {
                StyleConfig.showRatingPrefix = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Размер рейтинга
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_vote_size",
                type: "select",
                values: {
                    "0.9em": "Маленький (0.9em)",
                    "1.0em": "Стандартный (1.0em)",
                    "1.1em": "Средний (1.1em)",
                    "1.2em": "Крупный (1.2em)",
                    "1.3em": "Очень крупный (1.3em)"
                },
                default: StyleConfig.voteFontSize
            },
            field: {
                name: "Размер рейтинга",
                description: "Размер шрифта для отображения рейтинга"
            },
            onChange: function(value) {
                StyleConfig.voteFontSize = value;
                saveSettings();
                addStyles();
            }
        });

        // Цвет текста рейтинга
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_vote_text_color",
                type: "select",
                values: {
                    "#FFFF00": "Желтый",
                    "#FF0000": "Красный",
                    "#00FF00": "Зеленый",
                    "#0000FF": "Синий",
                    "#FFFFFF": "Белый",
                    "#FFA500": "Оранжевый",
                    "#FF00FF": "Пурпурный",
                    "#00FFFF": "Голубой",
                    "#FFD700": "Золотой"
                },
                default: StyleConfig.voteTextColor
            },
            field: {
                name: "Цвет текста рейтинга",
                description: "Цвет цифр рейтинга на карточках"
            },
            onChange: function(value) {
                StyleConfig.voteTextColor = value;
                saveSettings();
                addStyles();
            }
        });

        // Цвет рамки рейтинга
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_vote_border_color",
                type: "select",
                values: {
                    "#FFFF00": "Желтый",
                    "#FF0000": "Красный",
                    "#00FF00": "Зеленый",
                    "#0000FF": "Синий",
                    "#FFFFFF": "Белый",
                    "#FFA500": "Оранжевый",
                    "#FFD700": "Золотой"
                },
                default: StyleConfig.voteBorderColor
            },
            field: {
                name: "Цвет рамки рейтинга",
                description: "Цвет рамки вокруг рейтинга"
            },
            onChange: function(value) {
                StyleConfig.voteBorderColor = value;
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела шрифтов
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_fonts_settings",
                type: "title"
            },
            field: {
                name: "───── Шрифты и текст ─────",
                description: "Настройки шрифтов и текстового оформления"
            }
        });

        // Курсив заголовков блоков
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_titles_italic",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.itemsLineTitleItalic ? "1" : "0"
            },
            field: {
                name: "Курсив заголовков блоков",
                description: "Курсивное начертание заголовков блоков (Новинки, Популярное и т.д.)"
            },
            onChange: function(value) {
                StyleConfig.itemsLineTitleItalic = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Курсив заголовков интерфейса
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_header_italic",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.interfaceTitleItalic ? "1" : "0"
            },
            field: {
                name: "Курсив заголовков интерфейса",
                description: "Курсивное начертание заголовков в интерфейсе фильма"
            },
            onChange: function(value) {
                StyleConfig.interfaceTitleItalic = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Курсив 'Главная: источник'
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_source_italic",
                type: "select",
                values: {
                    "1": "Включить",
                    "0": "Выключить"
                },
                default: StyleConfig.mainSourceItalic ? "1" : "0"
            },
            field: {
                name: "Курсив 'Главная: источник'",
                description: "Курсивное начертание текста 'Главная : источник' в шапке"
            },
            onChange: function(value) {
                StyleConfig.mainSourceItalic = value === "1";
                saveSettings();
                addStyles();
            }
        });

        // Заголовок раздела управления
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_v3_manage_settings",
                type: "title"
            },
            field: {
                name: "───── Управление ─────",
                description: "Управление настройками интерфейса"
            }
        });

        // Сброс настроек
        Lampa.SettingsApi.addParam({
            component: "interface_v3",
            param: {
                name: "interface_reset_settings",
                type: "button"
            },
            field: {
                name: "Сбросить все настройки",
                description: "Вернуть все настройки к значениям по умолчанию"
            },
            onChange: function() {
                Lampa.Select.show({
                    title: "Сбросить настройки интерфейса?",
                    items: [
                        {title: "Да, сбросить", confirm: true},
                        {title: "Отмена"}
                    ],
                    onSelect: function(e) {
                        if (e.confirm) {
                            StyleConfig = { ...DefaultConfig };
                            saveSettings();
                            addStyles();
                            
                            if (Lampa.Noty) {
                                Lampa.Noty.show("Настройки интерфейса сброшены", 3000);
                            }
                        }
                        Lampa.Controller.toggle("settings_component");
                    },
                    onBack: function() {
                        Lampa.Controller.toggle("settings_component");
                    }
                });
            }
        });
    }

    class InterfaceInfo {
        constructor() {
            this.html = null;
            this.timer = null;
            this.network = new Lampa.Reguest();
            this.loaded = {};
        }

        create() {
            if (this.html) return;

            this.html = $(
                `<div class="new-interface-info">
                    <div class="new-interface-info__body">
                        <div class="new-interface-info__head"></div>
                        <div class="new-interface-info__title"></div>
                        <div class="new-interface-info__details"></div>
                        <div class="new-interface-info__description"></div>
                    </div>
                </div>`
            );
        }

        render(js) {
            if (!this.html) this.create();
            return js ? this.html[0] : this.html;
        }

        update(data) {
            if (!data) return;
            if (!this.html) this.create();

            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
            this.html.find('.new-interface-info__title').text(data.title || data.name || '');

            if (data.backdrop_path) {
                Lampa.Background.change(Lampa.Api.img(data.backdrop_path, 'w200'));
            }

            this.load(data);
        }

        draw(movie) {
            if (!this.html || !movie) return;

            const html = this.html;
            const createYear = ((movie.release_date || movie.first_air_date || '0000') + '').slice(0, 4);
            const countries = Lampa.Api.sources.tmdb.parseCountries(movie);

            let pg_rating = null;
            if (typeof window.getInternationalPG === 'function') {
                pg_rating = window.getInternationalPG(movie);
            } else {
                pg_rating = Lampa.Api.sources.tmdb.parsePG(movie);
            }

            const details_blocks = [];

            const year_country_content = [];
            if (createYear !== '0000') year_country_content.push(createYear);
            if (countries.length > 0) year_country_content.push(countries.join(', '));
            if (year_country_content.length > 0) {
                details_blocks.push(
                    '<div class="new-interface-info__block"><span>' +
                    year_country_content.join(', ') +
                    '</span></div>'
                );
            }

            if (movie.genres && movie.genres.length > 0) {
                const genres_content = movie.genres
                    .map(function (item) {
                        return Lampa.Utils.capitalizeFirstLetter(item.name);
                    })
                    .join(' | ');
                details_blocks.push(
                    '<div class="new-interface-info__block"><span>' +
                    genres_content +
                    '</span></div>'
                );
            }

            if (pg_rating) {
                details_blocks.push(
                    '<div class="new-interface-info__block"><span class="new-interface-info__pg">' +
                    pg_rating +
                    '</span></div>'
                );
            }

            html.find('.new-interface-info__head').empty();
            html.find('.new-interface-info__details').html(
                details_blocks.join('<span class="new-interface-info__separator">&#65049;</span>')
            );
        }

        load(data) {
            if (!data || !data.id) return;

            const _this = this;
            clearTimeout(this.timer);

            const type = data.name ? 'tv' : 'movie';
            const url = Lampa.TMDB.api(
                type +
                '/' +
                data.id +
                '?api_key=' +
                Lampa.TMDB.key() +
                '&append_to_response=content_ratings,release_dates&language=' +
                Lampa.Storage.get('language')
            );

            if (this.loaded[url]) {
                this.draw(this.loaded[url]);
                return;
            }

            this.timer = setTimeout(function () {
                _this.network.clear();
                _this.network.timeout(5000);
                _this.network.silent(url, function (movie) {
                    _this.loaded[url] = movie;
                    _this.draw(movie);
                });
            }, 300);
        }

        empty() {
            if (!this.html) return;
            this.html.find('.new-interface-info__head,.new-interface-info__details').text('---');
        }

        destroy() {
            clearTimeout(this.timer);
            this.network.clear();
            this.loaded = {};
            if (this.html) {
                this.html.remove();
                this.html = null;
            }
        }
    }

    function wrap(target, method, handler) {
        if (!target) return;
        const original = typeof target[method] === 'function' ? target[method] : null;
        target[method] = function (...args) {
            return handler.call(this, original, args);
        };
    }

    function shouldUseNewInterface(object) {
        if (!object || !StyleConfig.enableInterface) return false;
        if (window.innerWidth < 767) return false;

        var context = (object.url + '|' + object.source + '|' + object.intent + '|' + object.component).toLowerCase();
        var stopWords = [
            'favorite', 'bookmarks', 'book', 'history', 
            'избранное', 'закладки', 'история',
            'wath', 'like', 'queue'
        ];

        var isLibrary = stopWords.some(function(word) {
            return context.indexOf(word) !== -1;
        });

        if (isLibrary) return false;
        return true;
    }

    function createInterfaceState(main) {
        const info = new InterfaceInfo();
        info.create();

        const background = document.createElement('img');
        background.className = 'full-start__background';

        const state = {
            main,
            info,
            background,
            backgroundTimer: null,
            backgroundLast: '',
            attached: false,

            attach() {
                if (this.attached) return;

                const container = main.render(true);
                if (!container) return;

                container.classList.add('new-interface');

                if (!background.parentElement) {
                    container.insertBefore(background, container.firstChild || null);
                }

                const infoNode = info.render(true);
                if (infoNode && infoNode.parentNode !== container) {
                    if (background.parentElement === container) {
                        container.insertBefore(infoNode, background.nextSibling);
                    } else {
                        container.insertBefore(infoNode, container.firstChild || null);
                    }
                }

                if (main.scroll && typeof main.scroll.minus === 'function') {
                    main.scroll.minus(infoNode);
                }

                this.attached = true;
            },

            update(data) {
                if (!data) return;
                info.update(data);
                this.updateBackground(data);
            },

            updateBackground(data) {
                const path = data && data.backdrop_path
                    ? Lampa.Api.img(data.backdrop_path, 'w1280')
                    : '';

                if (!path || path === this.backgroundLast) return;

                clearTimeout(this.backgroundTimer);

                this.backgroundTimer = setTimeout(() => {
                    background.classList.remove('loaded');

                    background.onload = () => background.classList.add('loaded');
                    background.onerror = () => background.classList.remove('loaded');

                    this.backgroundLast = path;

                    setTimeout(() => {
                        background.src = this.backgroundLast;
                    }, 300);
                }, 1000);
            },

            reset() {
                info.empty();
            },

            destroy() {
                clearTimeout(this.backgroundTimer);
                info.destroy();

                const container = main.render(true);
                if (container) container.classList.remove('new-interface');

                if (background && background.parentNode) {
                    background.parentNode.removeChild(background);
                }

                this.attached = false;
            }
        };

        return state;
    }

    function ensureState(main) {
        if (main.__newInterfaceState) return main.__newInterfaceState;
        const state = createInterfaceState(main);
        main.__newInterfaceState = state;
        return state;
    }

    function prepareLineData(element) {
        if (!element || !StyleConfig.enableInterface) return;
        
        const isHistoryLine = element.title && (
            element.title.toLowerCase().includes('вы смотр') ||
            element.title.toLowerCase().includes('continue') ||
            element.title.toLowerCase().includes('продолжить') ||
            element.title.toLowerCase().includes('history') ||
            element.title.toLowerCase().includes('watching')
        );
        
        if (Array.isArray(element.results)) {
            Lampa.Utils.extendItemsParams(element.results, {
                style: { 
                    name: isHistoryLine ? 'small' : 'wide'
                }
            });
            
            if (isHistoryLine) {
                element.results.forEach(item => {
                    item.className = (item.className || '') + ' history-card';
                });
            }
        }
    }

    function updateCardTitle(card) {
        if (!card || typeof card.render !== 'function') return;

        const element = card.render(true);
        if (!element) return;

        if (!element.isConnected) {
            clearTimeout(card.__newInterfaceLabelTimer);
            card.__newInterfaceLabelTimer = setTimeout(() => updateCardTitle(card), 50);
            return;
        }

        clearTimeout(card.__newInterfaceLabelTimer);

        const seek = element.querySelector('.new-interface-card-title');
        if (seek && seek.parentNode) {
            seek.style.display = 'block';
            seek.style.height = '2.5em';
            seek.style.overflow = 'hidden';
            seek.style.textOverflow = 'ellipsis';
            seek.style.display = '-webkit-box';
            seek.style.webkitLineClamp = '2';
            seek.style.webkitBoxOrient = 'vertical';
            seek.style.fontSize = '1em';
            seek.style.lineHeight = '1.25';
            seek.style.marginTop = '0.5em';
            seek.style.color = '#fff';
        }
        card.__newInterfaceLabel = null;
    }

    function decorateCard(state, card) {
        if (!card || card.__newInterfaceCard || typeof card.use !== 'function' || !card.data || !StyleConfig.enableInterface)
            return;

        card.__newInterfaceCard = true;

        card.params = card.params || {};
        card.params.style = card.params.style || {};
        
        const isHistoryCard = card.data.className && card.data.className.includes('history-card');
        
        if (!card.params.style.name) {
            card.params.style.name = isHistoryCard ? 'small' : 'wide';
        }

        card.use({
            onFocus() {
                state.update(card.data);
            },
            onHover() {
                state.update(card.data);
            },
            onTouch() {
                state.update(card.data);
            },
            onVisible() {
                updateCardTitle(card);
            },
            onUpdate() {
                updateCardTitle(card);
            },
            onDestroy() {
                clearTimeout(card.__newInterfaceLabelTimer);
                if (card.__newInterfaceLabel && card.__newInterfaceLabel.parentNode) {
                    card.__newInterfaceLabel.parentNode.removeChild(card.__newInterfaceLabel);
                }
                card.__newInterfaceLabel = null;
                delete card.__newInterfaceCard;
            }
        });

        updateCardTitle(card);
    }

    function getCardData(card, element, index = 0) {
        if (card && card.data) return card.data;
        if (element && Array.isArray(element.results))
            return element.results[index] || element.results[0];
        return null;
    }

    function getDomCardData(node) {
        if (!node) return null;

        let current = node && node.jquery ? node[0] : node;

        while (current && !current.card_data) {
            current = current.parentNode;
        }

        return current && current.card_data ? current.card_data : null;
    }

    function getFocusedCardData(line) {
        const container = line && typeof line.render === 'function' ? line.render(true) : null;
        if (!container || !container.querySelector) return null;

        const focus = container.querySelector('.selector.focus') || container.querySelector('.focus');
        return getDomCardData(focus);
    }

    function attachLineHandlers(main, line, element) {
        if (line.__newInterfaceLine || !StyleConfig.enableInterface) return;
        line.__newInterfaceLine = true;

        const state = ensureState(main);
        const applyToCard = (card) => decorateCard(state, card);

        line.use({
            onInstance(card) {
                applyToCard(card);
            },
            onActive(card, itemData) {
                const current = getCardData(card, itemData);
                if (current) state.update(current);
            },
            onToggle() {
                setTimeout(() => {
                    const domData = getFocusedCardData(line);
                    if (domData) state.update(domData);
                }, 32);
            },
            onMore() {
                state.reset();
            },
            onDestroy() {
                state.reset();
                delete line.__newInterfaceLine;
            }
        });

        if (Array.isArray(line.items) && line.items.length) {
            line.items.forEach(applyToCard);
        }

        if (line.last) {
            const lastData = getDomCardData(line.last);
            if (lastData) state.update(lastData);
        }
    }

    let interfaceObserver = null;

    function startPluginV3() {
        if (!Lampa.Maker || !Lampa.Maker.map || !Lampa.Utils) return;
        if (window.plugin_interface_ready_v3) return;
        window.plugin_interface_ready_v3 = true;

        loadSettings();
        addStyles();
        
        setTimeout(addSettingsToLampa, 2000);

        if (!StyleConfig.enableInterface) {
            return;
        }

        if (interfaceObserver) {
            interfaceObserver.disconnect();
        }
        interfaceObserver = startInterfaceObserver();

        const mainMap = Lampa.Maker.map('Main');
        if (!mainMap || !mainMap.Items || !mainMap.Create) return;

        wrap(mainMap.Items, 'onInit', function (original, args) {
            if (original) original.apply(this, args);
            this.__newInterfaceEnabled = shouldUseNewInterface(this && this.object);
        });

        wrap(mainMap.Create, 'onCreate', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const state = ensureState(this);
            state.attach();
        });

        wrap(mainMap.Create, 'onCreateAndAppend', function (original, args) {
            const element = args && args[0];
            if (this.__newInterfaceEnabled && element) {
                prepareLineData(element);
            }
            return original ? original.apply(this, args) : undefined;
        });

        wrap(mainMap.Items, 'onAppend', function (original, args) {
            if (original) original.apply(this, args);
            if (!this.__newInterfaceEnabled) return;
            const item = args && args[0];
            const element = args && args[1];
            if (item && element) attachLineHandlers(this, item, element);
        });

        wrap(mainMap.Items, 'onDestroy', function (original, args) {
            if (this.__newInterfaceState) {
                this.__newInterfaceState.destroy();
                delete this.__newInterfaceState;
            }
            delete this.__newInterfaceEnabled;
            if (original) original.apply(this, args);
        });
    }

    startPluginV3();
})();

