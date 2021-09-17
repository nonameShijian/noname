const PROTOCOL = 'nonameSkill';
const { app, BrowserWindow, Menu, ipcMain, session } = require('electron');
const path = require('path');
const isWindows = process.platform === 'win32';
let win, extensionName;

// 获取单实例锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	// 如果获取失败，说明已经有实例在运行了，直接退出
	app.quit();
}

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
	//app.removeAsDefaultProtocolClient(protocol[, path, args])
}

function handleArgv(argv) {
	const prefix = `${PROTOCOL}:`;
	// 开发阶段，跳过前两个参数（`electron.exe .`）
	// 打包后，跳过第一个参数（`myapp.exe`）
	const offset = app.isPackaged ? 1 : 2;
	const url = argv.find((arg, index) => index >= offset && arg.startsWith(prefix));
	if (url) handleUrl(url);
}

function handleUrl(urlStr) {
	const urlObj = new URL(urlStr);
	const { searchParams } = urlObj;
	if(!searchParams.get('extensionName')) return;
	
	//玄武镜像：https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master
	//链接：nonameSKill:?extensionName=全能搜索
	//步骤：截取链接，跳转到另一个html里下载
	//无名杀里再内置一个扩展，类似xwtool，下载完成后重启加载扩展信息
	//内置的扩展应该有取消协议的选项，保证卸载无名杀前可以删除协议设置
	extensionName = searchParams.get('extensionName');
}

// 如果打开协议时，没有其他实例，则当前实例当做主实例，处理参数
//handleArgv(process.argv);

handleUrl(process.argv[process.argv.length - 1]);

// 其他实例启动时，主实例会通过 second-instance 事件接收其他实例的启动参数 `argv`
app.on('second-instance', (event, argv) => {
  // Windows 下通过协议URL启动时，URL会作为参数，所以需要在这个事件里处理
  if (process.platform === 'win32') {
    handleArgv(argv);
  }
});

// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
app.on('open-url', (event, urlStr) => {
  handleUrl(urlStr);
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.noDeprecation = true;

function createWindow() {
	if(extensionName) {
		win = new BrowserWindow({
			width: 800,
			height: 600,
			title: '无名杀-下载扩展',
			webPreferences: {
				nodeIntegration: true, //主页面用node
				contextIsolation: false,//必须为false
				enableRemoteModule: true, //可以调用Remote
			}
		});
		win.loadURL(`file://${__dirname}/downloadExtension.html`);
		win.webContents.openDevTools();
		Menu.setApplicationMenu(null);
		win.webContents.executeJavaScript(`window.extensionName = '${extensionName}'`);
	} else {
		win = new BrowserWindow({
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
	}
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
	
	let downloadPath, extensionName;
	const url = 'https://kuangthree.coding.net/p/noname-extensionxwjh/d/noname-extensionxwjh/git/raw/master/';
	
	ipcMain.on('download-path', function(event, arg) {
		[downloadPath, extensionName] = arg;
		event.returnValue = downloadPath;
	});
	
	session.defaultSession.on('will-download', (event, item) => {
		if(!downloadPath || !extensionName) return;
		const fileUrl = decodeURI(item.getURL()).replace(url + extensionName + '/', '');
		const savePath = path.join(downloadPath, fileUrl);
		item.setSavePath(savePath);
		
		item.on('updated', (event, state) => {
			if (state === 'interrupted') {
				win.webContents.send('download-clog', '下载被中断，但可以继续');
			} else if (state === 'progressing') {
				if (item.isPaused()) {
					win.webContents.send('download-clog', '下载暂停');
				} else {
					const progress = item.getReceivedBytes() / item.getTotalBytes();
					win.webContents.send('download-progress', progress);
				}
			}
		});
		
		item.once('done', (event, state) => {
			win.webContents.send('download-done', state);
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
