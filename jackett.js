(function() {
	'use strict';

	Lampa.Platform.tv();

	var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
	var urls = ['jacred.xyz','jr.maxvol.pro','jac-red.ru','jacred.viewbox.dev','jacred.pro','jacblack.ru:9117'];
	var titles = ['Jacred.xyz','Jacred Maxvol Pro','Jacred RU','Viewbox','Jacred Pro','Jac Black'];

	// Оригинальный HTML с SVG
	var parserMenuHTML = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true" style="cursor:pointer;">' + 
		'<div class="settings-folder" style="padding:0!important">' +
		'<div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="32" width="32" viewBox="0 0 512 512" fill="#000000">' +
		'<polygon fill="#074761" points="187.305,27.642 324.696,27.642 256,236.716"/>' +
		'<polygon fill="#10BAFC" points="187.305,27.642 256,236.716 163.005,151.035 196.964,151.035 110.934,49.96"/>' +
		'<polygon fill="#0084FF" points="66.917,62.218 10.45,434.55 66.917,451.922 117.726,217.908"/>' +
		'<polygon fill="#10BAFC" points="324.696,27.642 256,236.716 348.996,151.035 315.037,151.035 401.067,49.96"/>' +
		'</svg></div>' +
		'<div style="display:inline-block;font-size:1em;margin-left:10px;">' +
		'<div style="background:#d99821;padding:0.3em;border-radius:0.3em;">Выбрать парсер</div>' +
		'</div></div></div>';

	function checkParser(index) {
		setTimeout(function() {
			var apiKey = urls[index] === 'jacblack.ru:9117' ? '34DPECDY' : '';
			var position = index + 2;
			var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + position + ') > div';
			
			if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
			
			var useProtocol = urls[index] === 'jr.maxvol.pro' ? 'https://' : protocol;
			var requestUrl = useProtocol + urls[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.timeout = 3000;
			xhr.open('GET', requestUrl, true);
			xhr.send();
			
			xhr.onload = function() {
				if ($(selector).text() === titles[index]) {
					if (xhr.status === 200) {
						$(selector).html('<span style="color:#64e364;">✔&nbsp;&nbsp;' + titles[index] + '</span>').css('color', '#ffffff');
					} else {
						$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + titles[index] + '</span>').css('color', '#ff2121');
					}
				}
			};
			
			xhr.onerror = xhr.ontimeout = function() {
				if ($(selector).text() === titles[index]) {
					$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + titles[index] + '</span>').css('color', '#ff2121');
				}
			};
		}, 1000);
	}

	function checkAllParsers() {
		for (let i = 0; i < urls.length; i++) {
			checkParser(i);
		}
	}

	Lampa.Listener.follow('app', function(e) {
		if (e.type === 'select') {
			setTimeout(checkAllParsers, 10);
		}
	});

	function setParserConfig(selected) {
		const configs = {
			'no_parser': {url:'', key:'', interview:'false', search:false, lang:'lg'},
			'jacred_xyz': {url:'jacred.xyz', key:'', interview:'healthy', search:true, lang:'lg'},
			'jr_maxvol_pro': {url:'jr.maxvol.pro', key:'', interview:'all', search:true, lang:'df'},
			'jacred_ru': {url:'jac-red.ru', key:'', interview:'false', search:true, lang:'lg'},
			'jacred_viewbox_dev': {url:'jacred.viewbox.dev', key:'777', interview:'false', search:true, lang:'lg'},
			'jacred_pro': {url:'jacred.pro', key:'', interview:'all', search:true, lang:'lg'},
			'jac_black': {url:'jacblack.ru:9117', key:'34DPECDY', interview:'false', search:true, lang:'lg'}
		};
		
		const config = configs[selected] || configs['jacred_xyz'];
		Lampa.Storage.set('jackett_url', config.url);
		Lampa.Storage.set('jackett_key', config.key);
		Lampa.Storage.set('jackett_interview', config.interview);
		Lampa.Storage.set('parse_in_search', config.search);
		Lampa.Storage.set('parse_lang', config.lang);
	}

	// Основная настройка с оригинальной логикой
	Lampa.Settings.main({
		component: 'parser',
		param: {
			name: 'jackett_urltwo',
			type: 'select',
			values: {
				'no_parser': 'Без парсера',
				'jacred_xyz': 'Jacred.xyz',
				'jr_maxvol_pro': 'Jacred Maxvol Pro',
				'jacred_ru': 'Jacred RU',
				'jacred_viewbox_dev': 'Viewbox',
				'jacred_pro': 'Jacred Pro',
				'jac_black': 'Jac Black'
			},
			default: 'jacred_xyz'
		},
		field: {
			name: 'Меню смены парсера',
			description: 'Нажмите для выбора парсера из списка'
		},
		onChange: function(value) {
			setParserConfig(value);
			Lampa.Settings.update();
		},
		onRender: function(html) {
			setTimeout(function() {
				$('.settings-param__name').on('hover:enter', function() {
					Lampa.Settings.main();
				});

				// Показываем только для jackett
				if (Lampa.Storage.field('parser_use') === 'jackett') {
					html.show();
					$(html.find('.selector')).css('color', '#ffffff');
					
					// Добавляем оригинальное SVG меню
					setTimeout(function() {
						if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
							$('div[data-name="jackett_url"]').after(parserMenuHTML);
						}
					}, 300);
				} else {
					html.hide();
				}
			}, 100);
		}
	});

	// ТОЧНЫЙ обработчик как в оригинале
	$(document).on('hover:enter', 'div[data-name="jackett_urltwo"]', function(e) {
		e.preventDefault();
		e.stopPropagation();
		showParserMenu();
		return false;
	});

	// Дополнительный обработчик для settings-folder внутри jackett_urltwo
	$(document).on('hover:enter', 'div[data-name="jackett_urltwo"] .settings-folder', function(e) {
		e.preventDefault();
		e.stopPropagation();
		showParserMenu();
		return false;
	});

	Lampa.Storage.listener.follow('parser_use', function(e) {
		if (e.value === 'jackett') {
			setTimeout(function() {
				if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
					$('div[data-name="jackett_url"]').after(parserMenuHTML);
				}
			}, 1000);
		}
	});

	function showParserMenu() {
		const active = Lampa.Activity.active();
		const items = [
			{title: 'Jacred.xyz', url: 'jacred.xyz', url_two: 'jacred_xyz', jac_key: '', jac_int: 'healthy', jac_lang: 'lg'},
			{title: 'Jacred Maxvol Pro', url: 'jr.maxvol.pro', url_two: 'jr_maxvol_pro', jac_key: '', jac_int: 'all', jac_lang: 'lg'},
			{title: 'Jacred RU', url: 'jac-red.ru', url_two: 'jacred_ru', jac_key: '', jac_int: 'false', jac_lang: 'lg'},
			{title: 'Viewbox', url: 'jacred.viewbox.dev', url_two: 'jacred_viewbox_dev', jac_key: '777', jac_int: 'false', jac_lang: 'lg'},
			{title: 'Jacred Pro', url: 'jacred.pro', url_two: 'jacred_pro', jac_key: '', jac_int: 'all', jac_lang: 'lg'},
			{title: 'Jac Black', url: 'jacblack.ru:9117', url_two: 'jac_black', jac_key: '34DPECDY', jac_int: 'false', jac_lang: 'lg'}
		];

		Promise.all(items.map((item, index) => checkSingleStatus(item, index)))
			.then(checkedItems => {
				Lampa.Select.show({
					title: 'Выбрать парсер',
					items: checkedItems.map(item => ({
						title: item.title,
						url: item.url,
						url_two: item.url_two,
						jac_key: item.jac_key,
						jac_int: item.jac_int,
						jac_lang: item.jac_lang
					})),
					onBack: () => Lampa.Controller.toggle(active.render()),
					onSelect: (item) => {
						Lampa.Storage.set('jackett_url', item.url);
						Lampa.Storage.set('jackett_urltwo', item.url_two);
						Lampa.Storage.set('jackett_key', item.jac_key);
						Lampa.Storage.set('jackett_interview', item.jac_int);
						Lampa.Storage.set('parse_lang', item.jac_lang);
						Lampa.Storage.set('parse_in_search', true);
						
						Lampa.Activity.back(active.render());
						const url = Lampa.Storage.field('url');
						setTimeout(() => window.location.reload(), 1000);
						setTimeout(() => Lampa.Noty.show(url), 2000);
					}
				});
			})
			.catch(e => console.error('Parser check error:', e));
	}

	function checkSingleStatus(item, index) {
		return new Promise(resolve => {
			const useProtocol = item.url === 'jr.maxvol.pro' ? 'https://' : protocol;
			const apiKey = item.jac_key || '';
			const requestUrl = useProtocol + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			const xhr = new XMLHttpRequest();
			xhr.open('GET', requestUrl, true);
			xhr.timeout = 3000;
			
			xhr.onload = () => {
				item.title = xhr.status === 200 ? 
					'<span style="color:#64e364;">✔&nbsp;&nbsp;' + item.title + '</span>' : 
					'<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
				resolve(item);
			};
			
			xhr.onerror = xhr.ontimeout = () => {
				item.title = '<span style="color:#ff2121;">✘&nbsp;&nbsp;' + item.title + '</span>';
				resolve(item);
			};
			
			xhr.send();
		});
	}

	// Инициализация по умолчанию
	setInterval(() => {
		if (typeof Lampa !== 'undefined' && !Lampa.Storage.get('jack')) {
			Lampa.Storage.set('jack', 'true');
			Lampa.Storage.set('jackett_url', 'jacred.xyz');
			Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
			Lampa.Storage.set('jackett_key', '');
			Lampa.Storage.set('jackett_interview', 'healthy');
			Lampa.Storage.set('parse_in_search', true);
			Lampa.Storage.set('parse_lang', 'lg');
		}
	}, 100);

	// MutationObserver как в оригинале
	let observer;
	function initObserver() {
		if (observer) observer.disconnect();
		
		observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === 'childList') {
					if ($('div[data-children="parser"]').length && Lampa.Storage.field('parser_use') === 'jackett') {
						if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
							$('div[data-name="jackett_url"]').after(parserMenuHTML);
						}
					}
				}
			});
		});
		
		observer.observe(document.body, {childList: true, subtree: true});
	}

	Lampa.Storage.listener.follow('parser_use', e => {
		if (e.value === 'jackett') {
			initObserver();
		}
	});

	// Дополнительная проверка каждые 2 секунды
	setInterval(() => {
		if (Lampa.Storage.field('parser_use') === 'jackett') {
			if ($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length) {
				$('div[data-name="jackett_url"]').after(parserMenuHTML);
			}
		}
	}, 2000);

})();
