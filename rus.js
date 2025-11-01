(function () {
'use strict';
const PLUGIN_NAME = 'torrent_quality';
const VERSION = '5.1.0';
let originalTorrents = [];
let allTorrents = [];
let currentMovieTitle = null;
let lastUrl = window.location.search;
let intervalId = null;
// === Получение торрентов ===
function getTorrentsData() {
const items = document.querySelectorAll('.torrent-item');
return Array.from(items).map(item => {
const titleEl = item.querySelector('.torrent-item__title');
const magnetEl = item.querySelector('a[href*="magnet:"]');
return {
Title: (titleEl ? titleEl.textContent.trim() : 'Без названия'),
MagnetUri: (magnetEl ? magnetEl.href : '')
};
});
}
// === Сброс ===
function resetFilter() {
allTorrents = [...originalTorrents];
if (!allTorrents.length) {
allTorrents = getTorrentsData();
originalTorrents = [...allTorrents];
}
Lampa.Storage.set('tq_webdl_filter', 'any');
}
// === Очистка ===
function clearTorrents() {
originalTorrents = [];
allTorrents = [];
}
// === Фильтрация ===
function filterTorrents(value) {
try {
if (!originalTorrents.length) {
originalTorrents = getTorrentsData();
allTorrents = [...originalTorrents];
}
let filtered = allTorrents;
if (value && value !== 'any') {
const lower = value.toLowerCase();
filtered = allTorrents.filter(result => {
const title = (result.Title ? result.Title.toLowerCase().replace(/[- ]/g, '') : '');
if (lower === 'web-dl') {
return (title.includes('webdl') || title.includes('web-dl')) && !title.includes('webdlrip') && !title.includes('web-dlrip');
} else if (lower === 'web-dlrip') {
return title.includes('webdlrip') || title.includes('web-dlrip');
} else if (lower === 'openmatte') {
return title.includes('openmatte') || title.includes('open-matte');
}
return false;
});
}
if (!filtered.length && value !== 'any') {
if (Lampa.Utils.message) {
Lampa.Utils.message(Не найдено торрентов для фильтра: ${value});
} else {
alert(Не найдено торрентов для фильтра: ${value});
}
}
renderResults(filtered);
} catch (error) {
if (Lampa.Utils.message) {
Lampa.Utils.message('Ошибка при фильтрации торрентов');
} else {
alert('Ошибка при фильтрации торрентов');
}
}
}
// === Рендер ===
function renderResults(results) {
const items = document.querySelectorAll('.torrent-item');
const titles = results.map(r => r.Title.toLowerCase());
items.forEach(item => {
const titleEl = item.querySelector('.torrent-item__title');
const title = (titleEl ? titleEl.textContent.toLowerCase() : '');
item.style.display = titles.includes(title) ? 'block' : 'none';
});
}
// === Модальное окно ===
function openWebDLModal() {
const options = [
{ title: 'Любое', value: 'any' },
{ title: 'WEB-DL', value: 'web-dl' },
{ title: 'WEB-DLRip', value: 'web-dlrip' },
{ title: 'Open Matte', value: 'openmatte' }
];
Lampa.Select.show({
title: 'WEB-DL',
items: options,
onSelect: (item) => {
Lampa.Storage.set('tq_webdl_filter', item.value);
filterTorrents(item.value);
updateSubtitle(item.title);
},
onBack: () => {
Lampa.Modal.close();
}
});
}
// === Обновление подзаголовка ===
function updateSubtitle(text) {
const item = document.querySelector('.tq-webdl-main .selectbox-item__subtitle');
if (item) item.textContent = text;
}
// === Вставка в меню ===
function tryInjectWebDLFilter() {
const titleEl = document.querySelector('.selectbox__title');
if (!titleEl || titleEl.textContent !== 'Фильтр') return;
const scrollBody = titleEl.closest('.selectbox__content')?.querySelector('.scroll__body');
if (!scrollBody || scrollBody.querySelector('.tq-webdl-main')) return;
const insertBefore = Array.from(scrollBody.children).find(el =>
el.querySelector('.selectbox-item__title')?.textContent === 'Субтитры'
) || null;
const mainItem = document.createElement('div');
mainItem.className = 'selectbox-item selector tq-webdl-main';
mainItem.dataset.type = 'selectbox';
mainItem.dataset.name = 'webdl';
mainItem.dataset.action = 'select';
mainItem.innerHTML = `
            WEB-DL
            Любое
        `;
mainItem.addEventListener('click', (e) => {
e.stopPropagation();
openWebDLModal();
});
scrollBody.insertBefore(mainItem, insertBefore);
const saved = Lampa.Storage.get('tq_webdl_filter', 'any');
const titles = { 'any': 'Любое', 'web-dl': 'WEB-DL', 'web-dlrip': 'WEB-DLRip', 'openmatte': 'Open Matte' };
updateSubtitle(titles[saved]);
const resetBtn = Array.from(scrollBody.children).find(el =>
el.querySelector('.selectbox-item__title')?.textContent === 'Сбросить фильтр'
);
if (resetBtn && !resetBtn.dataset.tqHooked) {
const old = resetBtn.onclick;
resetBtn.onclick = function () {
if (old) old.apply(this, arguments);
updateSubtitle('Любое');
Lampa.Storage.set('tq_webdl_filter', 'any');
filterTorrents('any');
};
resetBtn.dataset.tqHooked = '1';
}
}
// === Отслеживание открытия меню ===
function startMenuMonitoring() {
if (intervalId) return;
intervalId = setInterval(() => {
if (document.querySelector('.selectbox__content')) {
tryInjectWebDLFilter();
}
}, 500);
}
// === URL смена ===
function setupUrlChange() {
const origPush = history.pushState;
const origReplace = history.replaceState;
history.pushState = function (...args) {
origPush.apply(this, args);
handleUrlChange();
};
history.replaceState = function (...args) {
origReplace.apply(this, args);
handleUrlChange();
};
window.addEventListener('popstate', handleUrlChange);
function handleUrlChange() {
const url = window.location.search;
if (url !== lastUrl) {
const newTitle = document.querySelector('.full-start-new__title')?.textContent.trim() || url;
if (newTitle && newTitle !== currentMovieTitle) {
clearTorrents();
currentMovieTitle = newTitle;
lastUrl = url;
applyFilterOnLoad();
}
}
}
}
// === Применение при загрузке ===
function applyFilterOnLoad() {
clearTorrents();
const torrents = getTorrentsData();
if (torrents.length) {
filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
} else {
const container = document.querySelector('.torrent-list');
if (container) {
const obs = new MutationObserver((mutations, obs) => {
if (document.querySelectorAll('.torrent-item').length) {
obs.disconnect();
filterTorrents(Lampa.Storage.get('tq_webdl_filter', 'any'));
}
});
obs.observe(container, { childList: true, subtree: true });
setTimeout(() => obs.disconnect(), 5000);
}
}
}
// === Запуск ===
function startPlugin() {
setupUrlChange();
startMenuMonitoring();
applyFilterOnLoad();
}
if (window.appready) {
startPlugin();
} else {
Lampa.Listener.follow('app', e => {
if (e.type === 'ready') startPlugin();
});
}
})();
