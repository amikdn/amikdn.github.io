(function() {
	'use strict';

	Lampa.Platform.tv();

	function _0x4ba1(){var _0x3d5e7c=['jacred.xyz','div[data-children="parser"]','bind','trace','no_parser','viewbox','component','open','title','url','34DPECDY','jac_black','Jac Black','jackett_interview','Свой вариант','color','onload','select','Jacred Pro','disconnect','follow','prototype','listener','jac_lang','send','field','then','ff2121','div[data-name="jackett_urltwo"]','div[data-name="parser_torrent_type"]','jackett','Jacred RU','Storage','64e364','.settings-param__name','addParam','parser','back','observe','hide','https:','html','search','Viewbox','Error:','onerror','body','jacblack.ru:9117','jack','toString','table','return (function() ','getItem','Controller','https://','jac_key','set','jacred_ru','Manifest','error','ontimeout','remove','activity','origin','Меню смены парсера','constructor','toggle','parse_lang','active','/api/v2.0/indexers/status:healthy/results?apikey=','find','torrents','settings_component','insertAfter','healthy','apply','Activity','change','parser_use','timeout','jackett_url','css','http://','777','console','jac_int','parse_in_search','Jacred.xyz','jackett_urltwo','parser_torrent_type','<span style="color: #ff2121;">✘&nbsp;&nbsp;','status','length','jr.maxvol.pro','__proto__','enabled','jacred.viewbox.dev','exception','false','Settings','protocol','GET','</span>','jacred_pro','.empty__title','jac-red.ru','get','all','url_two','Нажмите для выбора парсера из списка','update','ffffff','Select','name','div[data-name="jackett_key"]','push','map','show','history','Jacred Maxvol Pro','jr_maxvol_pro','SettingsApi','✔&nbsp;&nbsp;','Noty','text','log','jackett_key','jacred_xyz'];_0x4ba1=function(){return _0x3d5e7c;};return _0x4ba1();}

function _0x17ce(_0x33037b,_0x831518){var _0x210fe0=_0x4ba1();return _0x17ce=function(_0x5d7ddd,_0xda1cad){_0x5d7ddd=_0x5d7ddd-0x142;var _0x3d2b1=_0x210fe0[_0x5d7ddd];return _0x3d2b1;},_0x17ce(_0x33037b,_0x831518);}

(function(_0x3ca4b4,_0x414211){var _0xa54d2a=_0x17ce,_0x57c970=_0x3ca4b4();while(!![]){try{var _0x2bdd46=parseInt(_0xa54d2a(0x186))/0x1+parseInt(_0xa54d2a(0x1a1))/0x2;if(_0x2bdd46===_0x414211)break;else _0x57c970['push'](_0x57c970['shift']());}catch(_0x117bce){_0x57c970['push'](_0x57c970['shift']());}}})(_0x4ba1,0x12345);

(function(){
	var _0x583357=_0x17ce;
	
	'use strict';
	Lampa.Storage.field('parser', true);
	
	var _0x1d3543 = location.protocol === 'https:' ? 'https://' : 'http://';
	var _0x5e1e8d = ['jacred.xyz','jr.maxvol.pro','jac-red.ru','jacred.viewbox.dev','jacred.pro','jacblack.ru:9117'];
	var _0x56a111 = ['Jacred.xyz','Jacred Maxvol Pro','Jacred RU','Viewbox','Jacred Pro','Jac Black'];

	function checkParser(_0x558e43){
		setTimeout(function(){
			var _0x4261d5=_0x17ce, _0x522237='';
			if(_0x5e1e8d[_0x558e43]=='jacblack.ru:9117') _0x522237='34DPECDY';
			
			var _0x2e842a=_0x558e43+2;
			var _0x89274d='body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child('+_0x2e842a+') > div';
			
			if($('body > div.selectbox > div.selectbox__content.layer--height > div.selectbox__body.layer--wheight > div > div > div > div:nth-child(1) > div').text()!=='Свой вариант') return;
			
			var useProtocol = _0x5e1e8d[_0x558e43]=='jr.maxvol.pro' ? 'https://' : _0x1d3543;
			var _0x5ce41f=useProtocol+_0x5e1e8d[_0x558e43]+'/api/v2.0/indexers/status:healthy/results?apikey='+_0x522237;
			var _0x18fc95=new XMLHttpRequest();
			
			_0x18fc95.timeout=3000;
			_0x18fc95.open('GET',_0x5ce41f,true);
			_0x18fc95.send();
			
			_0x18fc95.onload=function(){
				if(_0x18fc95.status==200){
					if($(_0x89274d).text()==_0x56a111[_0x558e43]){
						$(_0x89274d).html('✔&nbsp;&nbsp;'+_0x56a111[_0x558e43]).css('color','#ffffff');
					}
				} else {
					if($(_0x89274d).text()==_0x56a111[_0x558e43]){
						$(_0x89274d).html('✘&nbsp;&nbsp;'+_0x56a111[_0x558e43]).css('color','#ff2121');
					}
				}
			};
			
			_0x18fc95.onerror=_0x18fc95.ontimeout=function(){
				if($(_0x89274d).text()==_0x56a111[_0x558e43]){
					$(_0x89274d).html('✘&nbsp;&nbsp;'+_0x56a111[_0x558e43]).css('color','#ff2121');
				}
			};
		},1000);
	}

	function checkAllParsers(){
		for(var i=0;i<_0x5e1e8d.length;i++){
			checkParser(i);
		}
	}

	Lampa.Listener.follow('app',function(e){
		if(e.type=='select'){
			setTimeout(checkAllParsers,10);
		}
	});

	function setParserConfig(){
		var selected=Lampa.Storage.get('jackett_urltwo');
		
		if(selected=='no_parser'){
			Lampa.Storage.set('jackett_url','');
			Lampa.Storage.set('jackett_key','');
			Lampa.Storage.set('jackett_interview','false');
			Lampa.Storage.set('parse_in_search',false);
			Lampa.Storage.set('parse_lang','lg');
		}
		if(selected=='jacred_xyz'){
			Lampa.Storage.set('jackett_url','jacred.xyz');
			Lampa.Storage.set('jackett_key','');
			Lampa.Storage.set('jackett_interview','healthy');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','lg');
		}
		if(selected=='jr_maxvol_pro'){
			Lampa.Storage.set('jackett_url','jr.maxvol.pro');
			Lampa.Storage.set('jackett_key','');
			Lampa.Storage.set('jackett_interview','all');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','df');
		}
		if(selected=='jacred_ru'){
			Lampa.Storage.set('jackett_url','jac-red.ru');
			Lampa.Storage.set('jackett_key','');
			Lampa.Storage.set('jackett_interview','false');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','lg');
		}
		if(selected=='jacred_viewbox_dev'){
			Lampa.Storage.set('jackett_url','jacred.viewbox.dev');
			Lampa.Storage.set('jackett_key','777');
			Lampa.Storage.set('jackett_interview','false');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','lg');
		}
		if(selected=='jacred_pro'){
			Lampa.Storage.set('jackett_url','jacred.pro');
			Lampa.Storage.set('jackett_key','');
			Lampa.Storage.set('jackett_interview','all');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','lg');
		}
		if(selected=='jac_black'){
			Lampa.Storage.set('jackett_url','jacblack.ru:9117');
			Lampa.Storage.set('jackett_key','34DPECDY');
			Lampa.Storage.set('jackett_interview','false');
			Lampa.Storage.set('parse_in_search',true);
			Lampa.Storage.set('parse_lang','lg');
		}
	}

	Lampa.Settings.main({
		component:'parser',
		param:{
			name:'jackett_urltwo',
			type:'select',
			values:{
				'no_parser':'Без парсера',
				'jacred_xyz':'Jacred.xyz',
				'jr_maxvol_pro':'Jacred Maxvol Pro',
				'jacred_ru':'Jacred RU',
				'jacred_viewbox_dev':'Viewbox',
				'jacred_pro':'Jacred Pro',
				'jac_black':'Jac Black'
			},
			default:'jacred_xyz'
		},
		field:{
			name:'Меню смены парсера',
			description:'Нажмите для выбора парсера из списка'
		},
		onChange:function(value){
			setParserConfig();
			Lampa.Settings.update();
		},
		onRender:function(html){
			setTimeout(function(){
				if(Lampa.Storage.field('parser_use')=='jackett'){
					html.show();
					$(html.find('.selector')).css('color','#ffffff');
					
					setTimeout(function(){
						if($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length){
							$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
						}
					},500);
				}
			},100);
		}
	});

	$(document).on('hover:enter','div[data-name="jackett_urltwo"]',function(){
		showParserMenu();
	});

	function showParserMenu(){
		var items=[
			{title:'Jacred.xyz',url:'jacred.xyz',url_two:'jacred_xyz',jac_key:'',jac_int:'healthy',jac_lang:'lg'},
			{title:'Jacred Maxvol Pro',url:'jr.maxvol.pro',url_two:'jr_maxvol_pro',jac_key:'',jac_int:'all',jac_lang:'lg'},
			{title:'Jacred RU',url:'jac-red.ru',url_two:'jacred_ru',jac_key:'',jac_int:'false',jac_lang:'lg'},
			{title:'Viewbox',url:'jacred.viewbox.dev',url_two:'jacred_viewbox_dev',jac_key:'777',jac_int:'false',jac_lang:'lg'},
			{title:'Jacred Pro',url:'jacred.pro',url_two:'jacred_pro',jac_key:'',jac_int:'all',jac_lang:'lg'},
			{title:'Jac Black',url:'jacblack.ru:9117',url_two:'jac_black',jac_key:'34DPECDY',jac_int:'false',jac_lang:'lg'}
		];

		Promise.all(items.map(function(item){
			return new Promise(function(resolve){
				var protocol=item.url=='jr.maxvol.pro'?'https://':location.protocol=='https:'?'https://':'http://';
				var url=protocol+item.url+'/api/v2.0/indexers/status:healthy/results?apikey='+item.jac_key;
				var xhr=new XMLHttpRequest();
				xhr.open('GET',url,true);
				xhr.timeout=2000;
				xhr.onload=function(){
					item.title=xhr.status==200?'✔ '+item.title:'✘ '+item.title;
					resolve(item);
				};
				xhr.onerror=xhr.ontimeout=function(){
					item.title='✘ '+item.title;
					resolve(item);
				};
				xhr.send();
			});
		})).then(function(checkedItems){
			Lampa.Select.show({
				title:'Выбрать парсер',
				items:checkedItems,
				onBack:function(){Lampa.Activity.back();},
				onSelect:function(item){
					Lampa.Storage.set('jackett_url',item.url);
					Lampa.Storage.set('jackett_urltwo',item.url_two);
					Lampa.Storage.set('jackett_key',item.jac_key);
					Lampa.Storage.set('jackett_interview',item.jac_int);
					Lampa.Storage.set('parse_lang',item.jac_lang);
					Lampa.Storage.set('parse_in_search',true);
					Lampa.Activity.back();
					setTimeout(function(){window.location.reload();},1000);
				}
			});
		});
	}

	var initInterval=setInterval(function(){
		if(typeof Lampa!='undefined' && Lampa.Storage){
			clearInterval(initInterval);
			if(!Lampa.Storage.get('jack')){
				Lampa.Storage.set('jack','true');
				Lampa.Storage.set('jackett_urltwo','jacred_xyz');
				setParserConfig();
			}
		}
	},100);

	var observer=new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
			if(mutation.type==='childList' && Lampa.Storage.field('parser_use')==='jackett'){
				setTimeout(function(){
					if($('div[data-name="jackett_url"]').length && !$('div[data-name="jackett_urltwo"]').length){
						$('div[data-name="jackett_url"]').after('<div class="settings-param selector" data-name="jackett_urltwo" data-static="true">Выбрать парсер</div>');
					}
				},100);
			}
		});
	});
	observer.observe(document.body,{childList:true,subtree:true});

})();
