const PROTOCOL = 'nonameSkill';
const { app, BrowserWindow, Menu, ipcMain, session, globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const isWindows = process.platform === 'win32';
const { versions } = process;
const electronVersion = parseFloat(versions.electron);
let remote;
if (electronVersion >= 14) {
	remote = require('@electron/remote/main');
	remote.initialize();
} else {
	remote = require('electron').remote;
}
let win, extensionName, updateURL;

// 获取单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	// 如果获取失败，说明已经有实例在运行了，直接退出
	app.quit();
}

app.setAppUserModelId('无名杀');

//防止32位无名杀的乱码
app.setName('无名杀');

if (!app.isDefaultProtocolClient(PROTOCOL)) {
	const args = [];
	if (!app.isPackaged) {
		// 如果是开发阶段，需要把我们的脚本的绝对路径加入参数中
		args.push(path.resolve(process.argv[1]));
	}
	// 加一个 `--` 以确保后面的参数不被 Electron 处理
	args.push('--');
	
	app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);
	//对应的取消协议:
	//app.removeAsDefaultProtocolClient(protocol)
}

function handleUrl(arr) {
	const result = arr.filter(val => val.startsWith('nonameskill:'));
	if(!result.length) {
		extensionName = null;
		updateURL = null;
		return;
	}
	const url = result[0];
	const urlObj = new URL(url);
	const { searchParams } = urlObj;
	//玄武镜像：https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master
	//链接：nonameSKill:?extensionName=全能搜索
	//步骤：截取链接，跳转到另一个html里下载
	extensionName = searchParams.get('extensionName');
	updateURL = searchParams.get('updateURL');
}

// 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
handleUrl(process.argv);

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on('second-instance', (event, argv) => {
  // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
  if (process.platform === 'win32') {
	handleUrl(argv);
	createWindow();
  }
});

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on('open-url', (event, urlStr) => {
	handleUrl(urlStr);
	createWindow();
});

process.env['ELECTRON_DEFAULT_ERROR_MODE'] = 'true';
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.noDeprecation = true;

function createWindow() {
	let createWin;
	if(extensionName) {
		createWin = createExtensionWindow();
	} else if(updateURL) {
		createWin = createUpdateWindow();
	} else {
		createWin = createMainWindow();
	}
	if(!win) {
		win = createWin;
		//按esc退出全屏模式
		globalShortcut.register('ESC', () => {
			if(win.isDestroyed()) {
				globalShortcut.unregister('ESC');
			} else {
				win.setFullScreen(false);
			}
		});
	}
}

function createMainWindow() {
	let win = new BrowserWindow({
		width: 1000,
		height: 800,
		title: '无名杀',
		icon: path.join(__dirname, 'noname.ico'),
		webPreferences: {
			preload: path.join(__dirname, 'app', 'menu.js'), //页面运行其他脚本之前预先加载指定的脚本
			nodeIntegration: true, //主页面用node
			nodeIntegrationInSubFrames: true, //子页面用node
			contextIsolation: false,//必须为false
			plugins: true, //启用插件
			enableRemoteModule: true, //可以调用Remote
			experimentalFeatures: true, //启用Chromium的实验功能
		}
	});
	win.loadURL(`file://${__dirname}/app.html`);
	if (electronVersion >= 14) {
		remote.enable(win.webContents);
	}
	return win;
}

function createExtensionWindow() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		title: '无名杀-下载扩展',
		icon: path.join(__dirname, 'noname.ico'),
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true, //主页面用node
			contextIsolation: false, //必须为false
			enableRemoteModule: true, //可以调用Remote
		}
	});
	win.loadURL(`file://${__dirname}/downloadExtension.html`);
	//win.webContents.openDevTools();
	win.webContents.executeJavaScript(`window.extensionName = '${extensionName}'`);
	return win;
}

function createUpdateWindow() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		title: '无名杀-更新文件',
		icon: path.join(__dirname, 'noname.ico'),
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true, //主页面用node
			contextIsolation: false, //必须为false
			enableRemoteModule: true, //可以调用Remote
		}
	});
	win.loadURL(`file://${__dirname}/update.html`);
	//win.webContents.openDevTools();
	win.webContents.executeJavaScript(`window.updateURL = '${updateURL}'`);
	return win;
}

function createDir(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	}
}

function setPath(path1, path2) {
	createDir(path2);
	app.setPath(path1, path2);
}

setPath('home', path.join(__dirname, 'Home'));
setPath('appData', path.join(__dirname, 'Home', 'AppData'));
setPath('userData', path.join(__dirname, 'Home', 'UserData'));
setPath('temp', path.join(__dirname, 'Home', 'Temp'));
setPath('cache', path.join(__dirname, 'Home', 'Cache'));
//崩溃转储文件存储的目录
setPath('crashDumps', path.join(__dirname, 'Home', 'crashDumps'));
//日志目录
setPath('logs', path.join(__dirname, 'Home', 'logs'));

app.whenReady().then(() => {
	
	let downloadPath, downloadExtName, extensionWinId, updatePath, updateUrl, updateWinId;
	const downloadUrl = 'https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master/';
	
	ipcMain.on('download-path', function(event, arg) {
		[downloadPath, downloadExtName, extensionWinId] = arg;
		event.returnValue = downloadPath;
	});
	
	ipcMain.on('update-path', function(event, arg) {
		[updatePath, updateUrl, updateWinId] = arg;
		event.returnValue = updatePath;
	});
	
	session.defaultSession.on('will-download', (event, item) => {
		if(!downloadPath || !downloadExtName || !extensionWinId) return;
		const fileUrl = decodeURI(item.getURL()).replace(downloadUrl + downloadExtName + '/', '');
		const savePath = path.join(downloadPath, fileUrl);
		item.setSavePath(savePath);
		const winId = BrowserWindow.fromId(extensionWinId);
		
		item.on('updated', (event, state) => {
			if(winId.isDestroyed()) {
				//窗口被关闭
				downloadPath = downloadExtName = extensionWinId = null;
				item.cancel();
				return;
			}
			if (state === 'interrupted') {
				winId.webContents.send('download-clog', '下载被中断，但可以继续');
			} else if (state === 'progressing') {
				if (item.isPaused()) {
					winId.webContents.send('download-clog', '下载暂停');
				} else {
					const progress = item.getReceivedBytes() / item.getTotalBytes();
					winId.webContents.send('download-progress', progress);
				}
			}
		});
		
		item.once('done', (event, state) => {
			if(winId.isDestroyed()) return;
			winId.webContents.send('download-done', state);
		});
	});
	
	session.defaultSession.on('will-download', (event, item) => {
		if(!updatePath || !updateUrl || !updateWinId) return;
		const fileUrl = decodeURI(item.getURL()).replace(updateUrl + '/', '');
		const savePath = path.join(updatePath, fileUrl);
		item.setSavePath(savePath);
		const winId = BrowserWindow.fromId(updateWinId);
		
		item.on('updated', (event, state) => {
			if(winId.isDestroyed()) {
				//窗口被关闭
				updatePath = updateUrl = updateWinId = null;
				item.cancel();
			}
			if (state === 'interrupted') {
				winId.webContents.send('update-clog', '下载被中断，但可以继续');
			} else if (state === 'progressing') {
				if (item.isPaused()) {
					winId.webContents.send('update-clog', '下载暂停');
				} else {
					const progress = item.getReceivedBytes() / item.getTotalBytes();
					winId.webContents.send('update-progress', progress);
				}
			}
		});
		
		item.once('done', (event, state) => {
			if(winId.isDestroyed()) return;
			winId.webContents.send('update-done', state);
		});
	});
	
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
		// 注销快捷键
		//globalShortcut.unregister('ESC');
		
		// 注销所有快捷键
		globalShortcut.unregisterAll();
	}
});
