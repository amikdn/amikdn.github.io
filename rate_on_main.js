(function() {
'use strict';
const CACHE_TIME = 24 * 60 * 60 * 1000;
let lampaRatingCache = {};
function calculateLampaRating10(reactions) {
let weightedSum = 0;
let totalCount = 0;
let reactionCnt = {}; // Счётчики для каждой реакции
// Коэффициенты (как в вашем коде)
const reactionCoef = { fire: 5, nice: 4, think: 3, bore: 2, shit: 1 };
reactions.forEach(item => {
const count = parseInt(item.counter, 10) || 0;
const coef = reactionCoef[item.type] || 0; // Если тип неизвестен, игнорируем
weightedSum += count * coef;
totalCount += count;
reactionCnt[item.type] = (reactionCnt[item.type] || 0) + count;
});
if (totalCount === 0) return { rating: 0, medianReaction: '' };
const avgRating = weightedSum / totalCount;
const rating10 = (avgRating - 1) * 2.5;
const finalRating = rating10 >= 0 ? parseFloat(rating10.toFixed(1)) : 0;
// Расчёт медианной реакции
let medianReaction = '';
const medianIndex = Math.ceil(totalCount / 2.0);
// Сортировка реакций по коэффициентам ascending (от низкого к высокому)
const sortedReactions = Object.entries(reactionCoef)
.sort((a, b) => a[1] - b[1])
.map(r => r[0]);
let cumulativeCount = 0;
while (sortedReactions.length && cumulativeCount < medianIndex) {
medianReaction = sortedReactions.pop(); // Начинаем с наивысшего
cumulativeCount += (reactionCnt[medianReaction] || 0);
}
return { rating: finalRating, medianReaction: medianReaction };
}
async function fetchLampaRating(ratingKey) {
const url = "http://cub.rip/api/reactions/get/" + ratingKey;
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);
try {
const response = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);
if (!response.ok) {
throw new Error(HTTP error! Status: ${response.status});
}
const data = await response.json();
if (data && data.result && Array.isArray(data.result)) {
return calculateLampaRating10(data.result);
} else {
return { rating: 0, medianReaction: '' };
}
} catch (error) {
clearTimeout(timeoutId);
if (error.name !== 'AbortError') {
console.error('Error fetching Lampa rating:', error);
}
return { rating: 0, medianReaction: '' };
}
}
async function getLampaRating(ratingKey) {
let now = Date.now();
if (lampaRatingCache[ratingKey] && (now - lampaRatingCache[ratingKey].timestamp < CACHE_TIME)) {
return lampaRatingCache[ratingKey].value;
}
try {
let result = await fetchLampaRating(ratingKey);
lampaRatingCache[ratingKey] = { value: result, timestamp: now };
return result;
} catch (error) {
console.error('Error in getLampaRating:', error);
return { rating: 0, medianReaction: '' };
}
}
function insertLampaBlock(render) {
if (!render) return false;
let rateLine = $(render).find('.full-start-new__rate-line');
if (rateLine.length === 0) return false;
if (rateLine.find('.rate--lampa').length > 0) return true;
let lampaBlockHtml = '' +
'0.0' +
'' +  // Новый div для иконки
'LAMPA' +
'';
let kpBlock = rateLine.find('.rate--kp');
if (kpBlock.length > 0) {
kpBlock.after(lampaBlockHtml);
} else {
rateLine.append(lampaBlockHtml);
}
return true;
}
function insertCardRating(card, event) {
let voteEl = card.querySelector('.card__vote');
if (!voteEl) {
voteEl = document.createElement('div');
voteEl.className = 'card__vote';
let viewEl = card.querySelector('.card__view') || card;
viewEl.appendChild(voteEl);
voteEl.innerHTML = '0.0';
} else {
voteEl.innerHTML = '';
}
let data = card.dataset || {};
let cardData = event.object.data || {};
let id = cardData.id || data.id || card.getAttribute('data-id') || (card.getAttribute('data-card-id') || '0').replace('movie_', '') || '0';
let type = 'movie';
if (cardData.seasons || cardData.first_air_date || cardData.original_name || data.seasons || data.firstAirDate || data.originalName) {
type = 'tv';
}
let ratingKey = type + "_" + id;
console.log('Inserting LAMPA rating for card. ID:', id, 'Type:', type, 'RatingKey:', ratingKey, 'Card data:', data, 'Event object data:', cardData);  // Добавленный лог для отладки
if (id === '0' || !ratingKey) {
console.log('Invalid ratingKey for card, skipping fetch.');
voteEl.innerHTML = '0.0';
return;
}
getLampaRating(ratingKey).then(result => {
let html = result && result.rating !== null ? result.rating : '0.0';
if (result && result.medianReaction) {
let reactionSrc = 'http://cub.rip/img/reactions/' + result.medianReaction + '.svg';
html += ' <img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">';
}
voteEl.innerHTML = html;
}).catch(error => {
console.error('Error in insertCardRating:', error);
voteEl.innerHTML = '0.0';
});
}
Lampa.Listener.follow('app', function(e) {
if (e.type === 'ready') {
if (!window.Lampa.Card._build_original) {
window.Lampa.Card._build_original = window.Lampa.Card._build;
window.Lampa.Card._build = function() {
let result = window.Lampa.Card._build_original.call(this);
setTimeout(() => Lampa.Listener.send('card', { type: 'build', object: this }), 100);
return result;
};
}
}
});
Lampa.Listener.follow('full', function(e) {
if (e.type === 'complite') {
let render = e.object.activity.render();
if (render && insertLampaBlock(render)) {
if (e.object.method && e.object.id) {
let ratingKey = e.object.method + "_" + e.object.id;
getLampaRating(ratingKey).then(result => {
if (result && result.rating !== null) {
$(render).find('.rate--lampa .rate-value').text(result.rating);
if (result.medianReaction) {
let reactionSrc = 'http://cub.rip/img/reactions/' + result.medianReaction + '.svg';
$(render).find('.rate--lampa .rate-icon').html('<img style="width:1em;height:1em;margin:0 0.2em;" src="' + reactionSrc + '">');
}
}
}).catch(error => {
console.error('Error in full listener:', error);
$(render).find('.rate--lampa .rate-value').text('0.0');
$(render).find('.rate--lampa .rate-icon').html('');
});
}
}
}
});
Lampa.Listener.follow('card', function(e) {
if (e.type === 'build' && e.object.card) {
let card = e.object.card;
insertCardRating(card, e);
}
});
})();
