const PROTOCOL = 'nonameSkill';
const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const isWindows = process.platform === 'win32';
let win, extensionName, updateURL;

// 获取单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	// 如果获取失败，说明已经有实例在运行了，直接退出
	app.quit();
}

app.setAppUserModelId('无名杀');

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

function handleUrl(urlStr) {
	const urlObj = new URL(urlStr);
	const { searchParams } = urlObj;
	
	//玄武镜像：https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master
	//链接：nonameSKill:?extensionName=全能搜索
	//步骤：截取链接，跳转到另一个html里下载
	//无名杀里再内置一个扩展，类似xwtool，下载完成后重启加载扩展信息
	//内置的扩展应该有取消协议的选项，保证卸载无名杀前可以删除协议设置
	extensionName = searchParams.get('extensionName');
	updateURL = searchParams.get('updateURL');
}

// 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
handleUrl(process.argv[process.argv.length - 1]);

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on('second-instance', (event, argv) => {
  // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
  if (process.platform === 'win32') {
	if(argv[argv.length - 1] === '--allow-file-access-from-files') return;
	handleUrl(argv[argv.length - 1]);
	if(extensionName) {
		createExtensionWindow();
	} else if(updateURL) {
		createUpdateWindow();
	} else {
		createMainWindow();
	}
  }
});

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on('open-url', (event, urlStr) => {
	if(urlStr[urlStr.length - 1] === '--allow-file-access-from-files') return;
	handleUrl(urlStr[urlStr.length - 1]);
	if(extensionName) {
		createExtensionWindow();
	} else if(updateURL) {
		createUpdateWindow();
	} else {
		createMainWindow();
	}
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.noDeprecation = true;

function createWindow() {
	if(extensionName) {
		win = win || createExtensionWindow();
	} else if(updateURL) {
		win = win || createUpdateWindow();
	} else {
		win = win || createMainWindow();
	}
}

function createMainWindow() {
	let win = new BrowserWindow({
		width: 1000,
		height: 800,
		title: '无名杀',
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
	return win;
}

function createExtensionWindow() {
	let win = new BrowserWindow({
		width: 800,
		height: 600,
		title: '无名杀-下载扩展',
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

app.setPath('home', path.join(__dirname, 'Home'));
app.setPath('appData', path.join(__dirname, 'Home', 'AppData'));
app.setPath('userData', path.join(__dirname, 'Home', 'UserData'));
app.setPath('temp', path.join(__dirname, 'Home', 'Temp'));
app.setPath('cache', path.join(__dirname, 'Home', 'Cache'));
app.setPath('crashDumps', path.join(__dirname, 'Home', 'crashDumps'));//崩溃转储文件存储的目录
app.setPath('logs', path.join(__dirname, 'Home', 'logs'));//日志目录

app.setName('无名杀');//防止32位无名杀的乱码

app.whenReady().then(() => {
	
	let downloadPath, extensionName, extensionWinId, updatePath, updateUrl, updateWinId;
	const downloadUrl = 'https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master/';
	
	ipcMain.on('download-path', function(event, arg) {
		[downloadPath, extensionName, extensionWinId] = arg;
		event.returnValue = downloadPath;
	});
	
	ipcMain.on('update-path', function(event, arg) {
		[updatePath, updateUrl, updateWinId] = arg;
		event.returnValue = updatePath;
	});
	
	session.defaultSession.on('will-download', (event, item) => {
		if(!downloadPath || !extensionName || !extensionWinId) return;
		const fileUrl = decodeURI(item.getURL()).replace(downloadUrl + extensionName + '/', '');
		const savePath = path.join(downloadPath, fileUrl);
		item.setSavePath(savePath);
		const winId = BrowserWindow.fromId(extensionWinId);
		
		item.on('updated', (event, state) => {
			if(winId.isDestroyed()) {
				//窗口被关闭
				downloadPath = extensionName = extensionWinId = null;
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
	}
});
