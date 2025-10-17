(function() {
	'use strict';

	Lampa.Platform.tv();

	// Восстановленные строки из оригинала
	var STRINGS = {
		'jacred_xyz': 'Jacred.xyz',
		'jac_black': 'Jac Black',
		'ByLampa Jackett': 'ByLampa Jackett',
		'jackett_interview': 'jackett_interview',
		'Свой вариант': 'Свой вариант',
		'no_parser': 'no_parser',
		'viewbox': 'Viewbox',
		'component': 'component',
		'open': 'open',
		'title': 'title',
		'url': 'url',
		'34DPECDY': '34DPECDY',
		'<div class="settings-folder" style="padding:0!important"><div style="width:1.3em;height:1.3em;padding-right:.1em"><svg height="256px" width="256px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><!-- SVG content here --></svg></div><div style="font-size:1.0em"><div style="padding:0.3em 0.3em;padding-top:0;"><div style="background: #d99821;padding:0.5em;border-radius:0.4em;"><div style="line-height:0.3;">Выбрать парсер</div></div></div></div></div>': 'parser_html',
		'jac_black': 'jac_black',
		'jac_lang': 'jac_lang',
		'send': 'send',
		'field': 'field',
		'then': 'then',
		'ff2121': '#ff2121',
		'div[data-name="jackett_urltwo"]': 'div[data-name="jackett_urltwo"]',
		'div[data-name="parser_torrent_type"]': 'div[data-name="parser_torrent_type"]',
		'jackett': 'jackett',
		'Jacred RU': 'Jacred RU',
		'Storage': 'Storage',
		'.settings-param__name': '.settings-param__name',
		'addParam': 'addParam',
		'parser': 'parser',
		'back': 'back',
		'observe': 'observe',
		'hide': 'hide',
		'https:': 'https:',
		'html': 'html',
		'search': 'search',
		'Viewbox': 'Viewbox',
		'Error:': 'Error:',
		'onerror': 'onerror',
		'body': 'body',
		'jacblack.ru:9117': 'jacblack.ru:9117',
		'jack': 'jack',
		'toString': 'toString',
		'table': 'table',
		'return (function() ': 'return (function() ',
		'getItem': 'getItem',
		'Controller': 'Controller',
		'https://': 'https://',
		'jac_key': 'jac_key',
		'set': 'set',
		'jacred_ru': 'jacred_ru',
		'Manifest': 'Manifest',
		'error': 'error',
		'ontimeout': 'ontimeout',
		'remove': 'remove',
		'activity': 'activity',
		'origin': 'origin',
		'Меню смены парсера': 'Меню смены парсера',
		'constructor': 'constructor',
		'toggle': 'toggle',
		'parse_lang': 'parse_lang',
		'active': 'active',
		'/api/v2.0/indexers/status:healthy/results?apikey=': '/api/v2.0/indexers/status:healthy/results?apikey=',
		'find': 'find',
		'torrents': 'torrents',
		'settings_component': 'settings_component',
		'insertAfter': 'insertAfter',
		'healthy': 'healthy',
		'apply': 'apply',
		'Activity': 'Activity',
		'change': 'change',
		'parser_use': 'parser_use',
		'timeout': 'timeout',
		'62.60.149.237:8443': '62.60.149.237:8443',
		'jackett_url': 'jackett_url',
		'css': 'css',
		'http://': 'http://',
		'777': '777',
		'console': 'console',
		'jac_int': 'jac_int',
		'parse_in_search': 'parse_in_search',
		'Jacred.xyz': 'Jacred.xyz',
		'jackett_urltwo': 'jackett_urltwo',
		'parser_torrent_type': 'parser_torrent_type',
		'<span style="color: #ff2121;">✘&nbsp;&nbsp;': '<span style="color: #ff2121;">✘&nbsp;&nbsp;',
		'status': 'status',
		'length': 'length',
		'jr.maxvol.pro': 'jr.maxvol.pro',
		'__proto__': '__proto__',
		'enabled': 'enabled',
		'jacred.viewbox.dev': 'jacred.viewbox.dev',
		'[data-name="jackett_url_two"]': '[data-name="jackett_url_two"]',
		'exception': 'exception',
		'false': 'false',
		'Settings': 'Settings',
		'protocol': 'protocol',
		'GET': 'GET',
		'</span>': '</span>',
		'jacred.pro': 'jacred.pro',
		'get': 'get',
		'all': 'all',
		'url_two': 'url_two',
		'Нажмите для выбора парсера из списка': 'Нажмите для выбора парсера из списка',
		'update': 'update',
		'ffffff': '#ffffff',
		'Select': 'Select',
		'name': 'name',
		'div[data-name="jackett_key"]': 'div[data-name="jackett_key"]',
		'000': '000',
		'push': 'push',
		'map': 'map',
		'show': 'show',
		'history': 'history',
		'Jacred Maxvol Pro': 'Jacred Maxvol Pro',
		'jr_maxvol_pro': 'jr_maxvol_pro',
		'SettingsApi': 'SettingsApi',
		'✘&nbsp;&nbsp;': '✘&nbsp;&nbsp;',
		'Noty': 'Noty',
		'text': 'text',
		'log': 'log',
		'jackett_key': 'jackett_key',
		'✔&nbsp;&nbsp;': '✔&nbsp;&nbsp;',
		'onload': 'onload',
		'select': 'select',
		'Jacred Pro': 'Jacred Pro',
		'disconnect': 'disconnect',
		'follow': 'follow',
		'prototype': 'prototype',
		'listener': 'listener'
	};

	Lampa.Storage.field('parser', false);
	Lampa.Storage.set('parser_use', true);

	var protocol = location.protocol === 'https:' ? 'https://' : 'http://';
	var urls_list = ['62.60.149.237:2601', 'jacred.xyz', '62.60.149.237:8443', 'jr.maxvol.pro', 'jac-red.ru', 'jacred.viewbox.dev', 'jacred.pro', 'jacblack.ru:9117'];
	var titles_list = ['Lampa32', 'ByLampa Jackett', 'Jacred.xyz', 'Jacred Maxvol Pro', 'Jacred RU', 'Viewbox', 'Jacred Pro', 'Jac Black'];

	// Удаляем lampa32 и bylampa
	urls_list = urls_list.filter((_, index) => index !== 0 && index !== 1);
	titles_list = titles_list.filter((_, index) => index !== 0 && index !== 1);

	function checkParserStatus(index) {
		setTimeout(function() {
			var apiKey = '';
			if (urls_list[index] == 'jacblack.ru:9117') apiKey = '34DPECDY';
			
			var position = index + 2;
			var selector = 'body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(' + position + ') > div';
			
			if ($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text() !== 'Свой вариант') return;
			
			var useProtocol = urls_list[index] == 'jr.maxvol.pro' ? 'https://' : protocol;
			var requestUrl = useProtocol + urls_list[index] + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.timeout = 3000;
			xhr.open('GET', requestUrl, true);
			xhr.send();
			
			xhr.ontimeout = function() {
				if ($(selector).text() == titles_list[index]) {
					$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
				}
			};
			
			xhr.onerror = function() {
				if ($(selector).text() == titles_list[index]) {
					$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
				}
			};
			
			xhr.onload = function() {
				if (xhr.status == 200) {
					if ($(selector).text() == titles_list[index]) {
						$(selector).html('<span style="color:#64e364;">✔&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ffffff');
					}
				} else {
					if ($(selector).text() == titles_list[index]) {
						$(selector).html('<span style="color:#ff2121;">✘&nbsp;&nbsp;' + $(selector).text() + '</span>').css('color', '#ff2121');
					}
				}
			};
		}, 1000);
	}

	function checkAllParsers() {
		for (var i = 0; i < urls_list.length; i++) {
			checkParserStatus(i);
		}
	}

	Lampa.Listener.follow('app', function(e) {
		if (e.type == 'select') {
			setTimeout(checkAllParsers, 10);
		}
	});

	// Настройки парсера
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
			setParserSettings(value);
			Lampa.Settings.update();
		},
		onRender: function(html) {
			setTimeout(function() {
				$('.settings-param__name').on('hover:enter', function() {
					Lampa.Settings.open();
				});

				if (Lampa.Storage.field('parser_use') == 'jackett') {
					html.show();
					$(html.find('.selector')).css('color', '#ffffff');
					var parserSelect = '<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>';
					$('div[data-name="jackett_url"]').after(parserSelect);
				}
			}, 100);
		}
	});

	function setParserSettings(selected) {
		var settings = {
			'no_parser': {
				url: '', key: '', interview: 'false', search: false, lang: 'lg'
			},
			'jacred_xyz': {
				url: 'jacred.xyz', key: '', interview: 'healthy', search: true, lang: 'lg'
			},
			'jr_maxvol_pro': {
				url: 'jr.maxvol.pro', key: '', interview: 'all', search: true, lang: 'df'
			},
			'jacred_ru': {
				url: 'jac-red.ru', key: '', interview: 'false', search: true, lang: 'lg'
			},
			'jacred_viewbox_dev': {
				url: 'jacred.viewbox.dev', key: '777', interview: 'false', search: true, lang: 'lg'
			},
			'jacred_pro': {
				url: 'jacred.pro', key: '', interview: 'all', search: true, lang: 'lg'
			},
			'jac_black': {
				url: 'jacblack.ru:9117', key: '', interview: 'false', search: true, lang: 'lg'
			}
		};

		var config = settings[selected] || settings['jacred_xyz'];
		
		Lampa.Storage.set('jackett_url', config.url);
		Lampa.Storage.set('jackett_key', config.key);
		Lampa.Storage.set('jackett_interview', config.interview);
		Lampa.Storage.set('parse_in_search', config.search);
		Lampa.Storage.set('parse_lang', config.lang);
	}

	// Обработчик клика по выбору парсера
	$(document).on('hover:enter', 'div[data-name="jackett_urltwo"], .settings-param[data-name="jackett_urltwo"]', function() {
		showParserSelectionMenu();
	});

	function showParserSelectionMenu() {
		var items = [];
		
		items.push({
			title: 'Jacred.xyz',
			url: 'jacred.xyz',
			url_two: 'jacred_xyz',
			jac_key: '',
			jac_int: 'healthy',
			jac_lang: 'lg'
		}, {
			title: 'Jacred Maxvol Pro',
			url: 'jr.maxvol.pro',
			url_two: 'jr_maxvol_pro',
			jac_key: '',
			jac_int: 'all',
			jac_lang: 'lg'
		}, {
			title: 'Jacred RU',
			url: 'jac-red.ru',
			url_two: 'jacred_ru',
			jac_key: '',
			jac_int: 'false',
			jac_lang: 'lg'
		}, {
			title: 'Viewbox',
			url: 'jacred.viewbox.dev',
			url_two: 'jacred_viewbox_dev',
			jac_key: '777',
			jac_int: 'false',
			jac_lang: 'lg'
		}, {
			title: 'Jacred Pro',
			url: 'jacred.pro',
			url_two: 'jacred_pro',
			jac_key: '',
			jac_int: 'all',
			jac_lang: 'lg'
		}, {
			title: 'Jac Black',
			url: 'jacblack.ru:9117',
			url_two: 'jac_black',
			jac_key: '',
			jac_int: 'false',
			jac_lang: 'lg'
		});

		// Проверка статусов
		Promise.all(items.map((item, index) => checkSingleParserStatus(item, index)))
			.then(statusItems => {
				Lampa.Select.show({
					title: 'Выбрать парсер',
					items: statusItems,
					onBack: function() {
						Lampa.Controller.toggle('settings_component');
					},
					onSelect: function(item) {
						Lampa.Storage.set('jackett_url', item.url);
						Lampa.Storage.set('jackett_urltwo', item.url_two);
						Lampa.Storage.set('jackett_key', item.jac_key);
						Lampa.Storage.set('jackett_interview', item.jac_int);
						Lampa.Storage.set('parse_lang', item.jac_lang);
						Lampa.Storage.set('parse_in_search', true);
						
						Lampa.Activity.back();
						setTimeout(() => window.location.reload(), 1000);
					}
				});
			});
	}

	function checkSingleParserStatus(item, index) {
		return new Promise(resolve => {
			var useProtocol = item.url === 'jr.maxvol.pro' ? 'https://' : protocol;
			var apiKey = item.jac_key || '';
			var requestUrl = useProtocol + item.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + apiKey;
			
			var xhr = new XMLHttpRequest();
			xhr.open('GET', requestUrl, true);
			xhr.timeout = 3000;
			
			xhr.onload = () => {
				if (xhr.status === 200) {
					item.title = '✔ ' + item.title;
				} else {
					item.title = '✘ ' + item.title;
				}
				resolve(item);
			};
			
			xhr.onerror = xhr.ontimeout = () => {
				item.title = '✘ ' + item.title;
				resolve(item);
			};
			
			xhr.send();
		});
	}

	// Observer для динамических изменений
	var observer;
	function startObserver() {
		if (observer) observer.disconnect();
		
		observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				if (mutation.type === 'childList') {
					if ($('div[data-children="parser"]').length && Lampa.Storage.field('parser_use') === 'jackett') {
						setTimeout(() => {
							if (!$('div[data-name="jackett_urltwo"]').length) {
								$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
							}
						}, 100);
					}
				}
			});
		});
		
		observer.observe(document.body, { childList: true, subtree: true });
	}

	Lampa.Storage.listener.follow('parser_use', e => {
		if (e.value === 'jackett') {
			startObserver();
			setTimeout(() => {
				if (!$('div[data-name="jackett_urltwo"]').length) {
					$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
				}
			}, 500);
		}
	});

	// Инициализация по умолчанию
	setTimeout(() => {
		if (!Lampa.Storage.get('jack')) {
			Lampa.Storage.set('jack', 'true');
			Lampa.Storage.set('jackett_urltwo', 'jacred_xyz');
			setParserSettings('jacred_xyz');
		}
	}, 1000);

	// Добавление в контекст торрентов
	Lampa.Settings.main_context({
		component: 'torrents',
		param: {
			name: 'parser_torrent_type',
			html: '<div class="settings-folder" style="padding:0!important"><div>Выбрать парсер</div></div>',
			onSelect: false,
			onBack: false
		}
	});

})();
