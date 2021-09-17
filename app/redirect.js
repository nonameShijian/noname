'use strict';
(function() {
	if (!localStorage.getItem('noname_freeTips')) {
		alert("无名杀本体内容无收费项目，请勿上当受骗！");
		localStorage.setItem('noname_freeTips', true);
	}
	var url = localStorage.getItem('noname_inited');
	var loadFailed = function() {
		localStorage.removeItem('noname_inited');
		localStorage.removeItem('noname_freeTips');
		window.location.reload();
	}
	var loadFailed2 = function() {
		localStorage.removeItem('noname_inited');
		localStorage.removeItem('noname_freeTips');
	}
	var load = function(src, onload, onerror) {
		var script = document.createElement('script');
		script.src = url + 'game/' + src + '.js';
		script.onload = onload;
		script.onerror = onerror;
		document.head.appendChild(script);
	}
	var fail = url ? loadFailed : loadFailed2;
	if (url === 'nodejs' || !url) url = '';
	if(!url) localStorage.setItem('noname_inited', 'nodejs');
	load('update', function() {
		load('config', function() {
			load('package', function() {
				load('game', null, fail);
			},fail);
		},fail);
	},fail);
	window.cordovaLoadTimeout = setTimeout(loadFailed, 5000);
}());