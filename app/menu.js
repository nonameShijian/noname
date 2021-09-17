const { remote, shell } = require('electron');
const { BrowserWindow, Menu, dialog } = remote;
const path = require('path');
const contents = remote.getCurrentWindow().webContents;
const fs = require('fs');

//跳过最开始的下载界面
if(!localStorage.getItem('noname_inited')){
	function loop(...args){
		for (let i = 0; i < args.length; i++) {
			let filePath = path.join(__dirname, args[i]);
			console.log(args[i], fs.existsSync(filePath) );
			if( !fs.existsSync(filePath) ) return false;
			let stat = fs.statSync(filePath);
			if (stat.size == 0) return false;
		}
		return true;
	}
	let has = loop('game/update.js', 'game/config.js', 'game/package.js', 'game/game.js');
	if(has) localStorage.setItem('noname_inited', 'nodejs');
}

let win;

function createIframe() {
	if (win) return;
	win = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		parent: remote.getCurrentWindow(),
		webPreferences: {
			plugins: true
		},
	})
	win.loadURL(`file://${__dirname}/../(必看)无名杀全教程9.5.pdf`);
	win.on('closed', () => {
		win = null
	});
}

function b64toBlob(b64Data, contentType = null, sliceSize = null) {
	contentType = contentType || 'image/png'
	sliceSize = sliceSize || 512
	let byteCharacters = atob(b64Data);
	let byteArrays = [];
	for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		let slice = byteCharacters.slice(offset, offset + sliceSize)
		let byteNumbers = new Array(slice.length);
		for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}
	return new Blob(byteArrays, {
		type: contentType
	})
}

var Menus = [{
	label: '操作',
	submenu: [{
		label: '屏幕截图',
		accelerator: 'ctrl+k', //绑定快捷键
		click: () => {
			contents.capturePage().then(result => {
				let data = result.toDataURL().replace('data:image/png;base64,', '');
				let item = new ClipboardItem({
					"image/png": b64toBlob(data, 'image/png', 512)
				});
				navigator.clipboard.write([item]).then(function() {
					console.log('截图保存成功！', new Date().toLocaleString())
				}, 
				function(e) {
					dialog.showErrorBox("截图保存失败", e.message);
				});
			});
		}
	}]
}, {
	label: '窗口',
	submenu: [{
		label: '重新加载当前窗口',
		role: 'reload',
	}, {
		label: '打开/关闭控制台',
		role: 'toggleDevTools',
	}, {
		type: 'separator' //分割线
	}, {
		label: '全屏模式',
		role: 'togglefullscreen',
	}, {
		label: '最小化',
		role: 'minimize',
	}, {
		type: 'separator' //分割线
	}]
}, {
	label: '帮助',
	submenu: [{
		label: '无名杀教程',
		click: () => {
			createIframe();
		}
	}, {
		label: 'JavaScript教程',
		click: () => {
			shell.openExternal('https://developer.mozilla.org/zh-CN/docs/learn/JavaScript');
		}
	}, {
		label: 'Electron教程',
		click: () => {
			shell.openExternal('https://www.electronjs.org/docs');
		}
	}, {
		label: 'QQ群合集',
		click: () => {
			shell.openExternal('https://mp.weixin.qq.com/s?__biz=MzUwOTMwMjExNQ==&mid=100009245&idx=1&sn=5671f6f4003d4fae44da3fc09630a759&chksm=7916e1114e616807e6aa34dec69c34ab1096d9ea332e6fb88b4b48116f41a948d907ff00f96b&mpshare=1&scene=23&srcid=0803MuuzUbphhaDV6y8C2noF&sharer_sharetime=1627992420112&sharer_shareid=0ebf733c5192798632ac5cf18bae205c#rd');
		}
	}, {
		label: 'bug反馈',
		click: () => {
			shell.openExternal(
				'http://tieba.baidu.com/p/6198964821?share=9105&fr=share&see_lz=0&share_from=post&sfc=copy&client_type=2&client_version=12.7.0.1&st=1626539518&unique=144C0C6A06380E116328219CAC1C9174'
			);
		}
	}, {
		label: '版权声明',
		click: () => {
			dialog.showMessageBoxSync(remote.getCurrentWindow(), {
				message: '无名杀作者为水乎。无名杀为开源免费游戏，谨防受骗！！！游戏开源，仅供个人学习，研究之用，请勿用于商业用途',
				type: 'info',
				title: '版权声明',
				icon: 'noname.ico'
			});
		}
	}]
}];

Menu.setApplicationMenu(Menu.buildFromTemplate(Menus));
