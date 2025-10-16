'use strict';
(async () => {
    if (!localStorage.getItem('noname_freeTips')) {
    	alert("【无名杀】属于个人开发软件且【完全免费】，如非法倒卖用于牟利将承担法律责任 开发团队将追究到底");
    	localStorage.setItem('noname_freeTips', "true");
    }
	let url = localStorage.getItem('noname_inited');

	if (!url) return;

	if (url === 'nodejs' || location.protocol.startsWith('http')) url = '';

	// 由于在menu.js中有了判断，所以才会赋值为nodejs
	// 所以直接跳转就ok了
	console.log(location.href);
	// location.href = xxx + "noname/index.html";
})();
