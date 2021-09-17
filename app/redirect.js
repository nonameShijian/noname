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
		script.onerror = function() {
			alert('在载入' + 'game/' + src + '.js时发生错误，请检查文件是否损坏或不存在');
			onerror();
		};
		document.head.appendChild(script);
	}
	var fail = url ? loadFailed : loadFailed2;
	if (url === 'nodejs' || !url) url = '';
	load('update', function() {
		load('config', function() {
			load('package', function() {
				load('game', function() {
					if (!localStorage.getItem('noname_inited')) {
						localStorage.setItem('noname_inited', 'nodejs');
						window.location.reload();
					}
				}, fail);
			},fail);
		},fail);
	},fail);
	//window.cordovaLoadTimeout = setTimeout(loadFailed, 5000);
}());