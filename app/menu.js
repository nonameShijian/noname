const { remote, shell } = require('electron');
const { BrowserWindow, Menu, dialog, Notification } = remote;
const path = require('path');
const contents = remote.getCurrentWindow().webContents;
const fs = require('fs');

const readJSON = (url) => {
	return new Promise((resolve, reject) => {
		fetch(url).then(response => {
			if (response.status != 200) {
				console.error(`未找到文件：${url}`);
				return {};
			}
			return response.json();
		}).then(resolve);
	});
};
	
async function checkForUpdate(url) {
	//本地json数据
	const localJSON = await readJSON('package.json');
	//本地安装程序版本
	const localInstallerVersion = localJSON.installerVersion || "";
	//服务器json数据
	const serverJSON = await readJSON(url + '/package.json');
	//服务器安装程序版本
	const serverInstallerVersion = serverJSON.installerVersion || "";
	
	const writeTempFile = (str, callback) => {
		fs.writeFile(`${__dirname}/temp-updateContent.html`, str, err => {
			if(err) alert(err);
			else {
				let updateContent = new BrowserWindow({
					width: 800,
					height: 600,
					title: '无名杀-更新内容',
					icon: path.join(__dirname, '..' ,'noname.ico'),
					autoHideMenuBar: true,
					webPreferences: {
						nodeIntegration: true,
						contextIsolation: false,
						enableRemoteModule: true,
					},
				});
				updateContent.loadURL(`file://${__dirname}/temp-updateContent.html`);
				//updateContent.webContents.openDevTools();
				updateContent.on('closed', () => {
					updateContent = null;
					fs.unlink(`${__dirname}/temp-updateContent.html`, (err) => {
					  if (err) throw err;
					});
				});
			}
		});
	}
	
	if(JSON.stringify(serverJSON) == "{}") {
		//服务器json数据获取失败
		if(Notification.isSupported()){
			return new Notification({
				title: '检查更新失败', 
				body: '服务器json数据获取失败',
			}).show();
		} else {
			return dialog.showErrorBox('服务器json数据获取失败', '');
		}
	}
	
	if(+localInstallerVersion < +serverInstallerVersion) {
		//本地版本小于服务器安装版本
		//nonameSkill:?updateURL=https://raw.fastgit.org/nonameShijian/noname/main
		let fileList = [], updateStr = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8">
				<title>无名杀-更新内容</title>
			</head>
			<style>
			span {
				color: red;
				font-size: 23px;
			}
			pre {
				font-size: 20px;
			}
			</style>
			<script type="text/javascript">
				const { remote } = require('electron');
			</script>
			<body>
		`;
		for(let i = 0; i < serverJSON.installerUpdateContent.length; i++) {
			const {version, updateContent} = serverJSON.installerUpdateContent[i];
			if(version <= localInstallerVersion) break;
			updateStr += `
			<span>v${version}更新内容：</span></br>
			<pre>${updateContent.join('\n')}</pre></br>
			`;
		}
		updateStr += `
			<button onclick="location.href='nonameSkill:?updateURL=${url}'; setTimeout(remote.getCurrentWindow().close, 1000);">更新无名杀</button>
			</body>
		</html>
		`;
		
		if(Notification.isSupported()){
			//如果支持桌面通知
			const TITLE = '应用更新提醒';
			const BODY = '点击查看更新内容';
			// 实例化不会进行通知
			const updateNotification = new Notification({
				// 通知的标题, 将在通知窗口的顶部显示
				title: TITLE, 
				// 通知的正文文本, 将显示在标题或副标题下面
				body: BODY,
				// false有声音，true没声音
				silent: false,
				// 通知的超时持续时间 'default' or 'never'
				//never显示关闭按钮，关闭也触发click
				timeoutType: 'default',
			});
			updateNotification.addListener('click', () => {
				writeTempFile(updateStr);
			});
			updateNotification.show();
		} else {
			//不支持Notification用dialog
			dialog.showMessageBox(remote.getCurrentWindow(), {
				message: '查看更新内容',
				type: 'info',
				title: '应用更新提醒',
				icon: path.join(__dirname, '..', 'noname.ico'),
				buttons: ['确定', '取消'],
				defaultId: 0,
				cancelId: 1,
			}).then(({response}) => {
				if(response == 0) writeTempFile(updateStr);
			});
		}
	} else if(+localInstallerVersion == +serverInstallerVersion){
		//版本相同
		shell.beep();
		alert('应用已经是最新版');
	} else if(+localInstallerVersion > +serverInstallerVersion) {
		//本地版本大于服务器版本
		console.log('本地版本大于服务器版本');
	}
}

localStorage.getItem('autoCheckUpdates') == 'true' && checkForUpdate('https://raw.fastgit.org/nonameShijian/noname/main');

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
		icon: path.join(__dirname, '..', 'noname.ico'),
		webPreferences: {
			plugins: true
		},
	});
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
	}, {
		label: '检查应用更新',
		click: () => {
			checkForUpdate('https://raw.fastgit.org/nonameShijian/noname/main');
		},
	}, {
		label: '自动检查更新',
		type: 'checkbox',
		checked: (() => {
			const bool = localStorage.getItem('autoCheckUpdates') == 'true';
			return bool || false;
		})(),
		click: (menuItem) => {
			localStorage.setItem('autoCheckUpdates', menuItem.checked);
		},
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
				icon: path.join(__dirname, '..', 'noname.ico'),
			});
		}
	}]
}];

Menu.setApplicationMenu(Menu.buildFromTemplate(Menus));
