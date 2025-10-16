(() => {
	const { shell } = require("electron");
	const { versions } = process;
	const electronVersion = parseFloat(versions.electron);
	/** @type { import("@electron/remote") } */
	let remote;
	if (electronVersion >= 14) {
		remote = require("@electron/remote");
	} else {
		// @ts-ignore
		remote = require("electron").remote;
	}
	const { app, BrowserWindow, Menu, dialog, Notification } = remote;
	const path = require("path");
	const thisWindow = remote.getCurrentWindow();
	const contents = thisWindow.webContents;
	const fs = require("fs");

	// 读取/保存核心配置（与现有启动读取逻辑保持一致的key）
	const getConfigKey = () => {
		const prefix = "noname_0.9_";
		const parts = __dirname
			.split("/")
			.map((s) => s && (/[A-Z]|[a-z]/.test(s[0]) ? s[0] : "_"));
		return prefix + parts.join("") + "_" + "config";
	};
	const loadCoreConfig = () => {
		try {
			const key = getConfigKey();
			return JSON.parse(localStorage.getItem(key) || "{}") || {};
		} catch (e) {
			return {};
		}
	};
	const saveCoreConfig = (cfg) => {
		try {
			const key = getConfigKey();
			localStorage.setItem(key, JSON.stringify(cfg || {}));
		} catch (e) {}
	};

	let coreConfig = loadCoreConfig();
	// 兼容两种键名：历史的 hide_menubar 与 新的 hideMenuBar
	let initialHideMenuBar = !!(
		coreConfig.hide_menubar ?? coreConfig.hideMenuBar
	);

	function persistHideMenuBar(hide) {
		try {
			coreConfig = loadCoreConfig();
			coreConfig.hide_menubar = !!hide;
			coreConfig.hideMenuBar = !!hide; // 同步两个键，便于不同版本读取
			saveCoreConfig(coreConfig);
		} catch (e) {}
	}

	function applyMenuBarVisibilityFromHidden(hide) {
		try {
			// 保持菜单已设置，这样 F12 才能切换可见性
			// @ts-ignore
			Menu.setApplicationMenu(Menu.buildFromTemplate(Menus));
			if (hide) {
				thisWindow.setAutoHideMenuBar(true);
				thisWindow.setMenuBarVisibility(false);
			} else {
				thisWindow.setAutoHideMenuBar(false);
				thisWindow.setMenuBarVisibility(true);
			}
		} catch (e) {
			try {
				// @ts-ignore
				Menu.setApplicationMenu(Menu.buildFromTemplate(Menus));
			} catch (_) {}
		}
	}

	// 暴露全局API给渲染端其他模块调用
	// 例如：window.__setHideMenuBar(true)
	// 会同时保存配置并立即生效
	// @ts-ignore
	window.__setHideMenuBar = function (hide) {
		persistHideMenuBar(!!hide);
		applyMenuBarVisibilityFromHidden(!!hide);
	};

	const readJSON = (url) => {
		return new Promise((resolve, reject) => {
			fetch(url)
				.then((response) => {
					if (response.status != 200) {
						console.error(`未找到文件：${url}`);
						return {};
					}
					return response.json();
				})
				.then(resolve);
		});
	};

	async function checkForUpdate(url) {
		//本地json数据
		const localJSON = await readJSON("package.json");
		//本地安装程序版本
		const localInstallerVersion = localJSON.installerVersion || "";
		//服务器json数据
		const serverJSON = await readJSON(url + "/package.json");
		//服务器安装程序版本
		const serverInstallerVersion = serverJSON.installerVersion || "";

		const writeTempFile = (str, callback) => {
			fs.writeFile(`${__dirname}/temp-updateContent.html`, str, (err) => {
				if (err) alert(err);
				else {
					let updateContent = new BrowserWindow({
						width: 800,
						height: 600,
						title: "无名杀-更新内容",
						icon: path.join(__dirname, "..", "noname.ico"),
						autoHideMenuBar: true,
						webPreferences: {
							nodeIntegration: true,
							contextIsolation: false,
							enableRemoteModule: true,
						},
					});
					updateContent.loadURL(
						`file://${__dirname}/temp-updateContent.html`
					);
					//updateContent.webContents.openDevTools();
					updateContent.on("closed", () => {
						updateContent = null;
						fs.unlink(
							`${__dirname}/temp-updateContent.html`,
							(err) => {
								if (err) throw err;
							}
						);
					});
				}
			});
		};

		if (JSON.stringify(serverJSON) == "{}") {
			//服务器json数据获取失败
			if (Notification.isSupported()) {
				return new Notification({
					title: "检查更新失败",
					body: "服务器json数据获取失败",
				}).show();
			} else {
				return dialog.showErrorBox("服务器json数据获取失败", "");
			}
		}

		if (+localInstallerVersion < +serverInstallerVersion) {
			//本地版本小于服务器安装版本
			//nonameSkill:?updateURL=https://mirror.ghproxy.com/https://github.com/nonameShijian/noname/main
			let fileList = [],
				updateStr = `
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
			<body>
		`;
			for (let i = 0; i < serverJSON.installerUpdateContent.length; i++) {
				const { version, updateContent } =
					serverJSON.installerUpdateContent[i];
				if (version <= localInstallerVersion) break;
				updateStr += `
			<span>v${version}更新内容：</span></br>
			<pre>${updateContent.join("\n\n")}</pre></br>
			`;
			}
			updateStr += `
			<button onclick="location.href='nonameSkill:?updateURL=${url}'; setTimeout(window.close, 1000);">更新无名杀</button>
			</body>
		</html>
		`;

			if (Notification.isSupported()) {
				//如果支持桌面通知
				const TITLE = "应用更新提醒";
				const BODY = "点击查看更新内容";
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
					timeoutType: "default",
				});
				updateNotification.addListener("click", () => {
					writeTempFile(updateStr);
				});
				updateNotification.show();
			} else {
				//不支持Notification用dialog
				dialog
					.showMessageBox(thisWindow, {
						message: "查看更新内容",
						type: "info",
						title: "应用更新提醒",
						icon: path.join(__dirname, "..", "noname.ico"),
						buttons: ["确定", "取消"],
						defaultId: 0,
						cancelId: 1,
					})
					.then(({ response }) => {
						if (response == 0) writeTempFile(updateStr);
					});
			}
		} else if (+localInstallerVersion == +serverInstallerVersion) {
			//版本相同
			shell.beep();
			alert("应用已经是最新版");
		} else if (+localInstallerVersion > +serverInstallerVersion) {
			//本地版本大于服务器版本
			console.log("本地版本大于服务器版本");
			alert("本地版本大于服务器版本");
		}
	}

	// localStorage.getItem('autoCheckUpdates') == 'true' && checkForUpdate('https://mirror.ghproxy.com/https://raw.githubusercontent.com/nonameShijian/noname/main');

	// 跳过最开始的下载界面
	if (!localStorage.getItem("noname_inited")) {
		function loop(...args) {
			for (let i = 0; i < args.length; i++) {
				let filePath = path.join(__dirname, "..", args[i]);
				console.log(args[i], fs.existsSync(filePath));
				if (!fs.existsSync(filePath)) return false;
				let stat = fs.statSync(filePath);
				if (stat.size == 0) return false;
			}
			return true;
		}
		let has = loop(
			"noname/game/update.js",
			"noname/game/config.js",
			"noname/game/package.js",
			"noname/game/importmap.js",
			"noname/game/game.js"
		);
		if (has) localStorage.setItem("noname_inited", "nodejs");
	}

	//创建教程页面
	/** @type { import("electron").BrowserWindow? } */
	let win;

	function createIframe() {
		if (win) return;
		win = new BrowserWindow({
			width: 800,
			height: 600,
			autoHideMenuBar: true,
			parent: thisWindow,
			icon: path.join(__dirname, "..", "noname.ico"),
			webPreferences: {
				plugins: true,
			},
		});
		win.loadURL(`file://${__dirname}/../(必看)无名杀全教程10.0.pdf`);
		win.on("closed", () => {
			win = null;
		});
	}

	// 截图 base64 -> blob
	function b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || "image/png";
		sliceSize = sliceSize || 512;
		let byteCharacters = atob(b64Data);
		let byteArrays = [];
		for (
			let offset = 0;
			offset < byteCharacters.length;
			offset += sliceSize
		) {
			let slice = byteCharacters.slice(offset, offset + sliceSize);
			let byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}
			var byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}
		return new Blob(byteArrays, {
			type: contentType,
		});
	}

	// 添加内置扩展
	if (window.indexedDB) {
		let configprefix = "noname_0.9_";
		if (typeof __dirname === "string" && __dirname.length) {
			const dirsplit = __dirname.split("/");
			for (let i = 0; i < dirsplit.length; i++) {
				if (dirsplit[i]) {
					const c = dirsplit[i][0];
					configprefix += /[A-Z]|[a-z]/.test(c) ? c : "_";
				}
			}
			configprefix += "_";
		}

		const request = window.indexedDB.open(configprefix + "data");
		request.onerror = function (e) {
			console.error(e);
		};
		request.onupgradeneeded = function (e) {
			const db = /*e.target.result;*/ this.result;
			if (!db.objectStoreNames.contains("video")) {
				db.createObjectStore("video", { keyPath: "time" });
			}
			if (!db.objectStoreNames.contains("image")) {
				db.createObjectStore("image");
			}
			if (!db.objectStoreNames.contains("audio")) {
				db.createObjectStore("audio");
			}
			if (!db.objectStoreNames.contains("config")) {
				db.createObjectStore("config");
			}
			if (!db.objectStoreNames.contains("data")) {
				db.createObjectStore("data");
			}
		};
		request.onsuccess = function () {
			const db = /*e.target.result;*/ this.result;
			if (!db.objectStoreNames.contains("config")) return;
			const store = db
				.transaction(["config"], "readwrite")
				.objectStore("config");
			store.get("extensions").onsuccess = function (e) {
				/** @type string[] */
				const extensions = /*e.target.result;*/ this.result;
				const config = db
					.transaction(["config"], "readwrite")
					.objectStore("config");
				if (!Array.isArray(extensions) || extensions.length == 0) {
					config.put(
						["应用配置", "拖拽读取" /*, '在线更新'*/],
						"extensions"
					);
				}
			};
		};
	}

	/** @type { (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] } */
	var Menus = [
		{
			label: "操作",
			submenu: [
				{
					label: "屏幕截图",
					accelerator: "ctrl+k", //绑定快捷键
					click: () => {
						contents.capturePage().then((result) => {
							let data = result
								.toDataURL()
								.replace("data:image/png;base64,", "");
							let item = new ClipboardItem({
								"image/png": b64toBlob(data, "image/png", 512),
							});
							navigator.clipboard.write([item]).then(
								function () {
									console.log(
										"截图保存成功！",
										new Date().toLocaleString()
									);
								},
								function (e) {
									dialog.showErrorBox(
										"截图保存失败",
										e.message
									);
								}
							);
						});
					},
				},
				{
					label: "检查应用更新",
					click: () => {
						checkForUpdate(
							"https://mirror.ghproxy.com/https://raw.githubusercontent.com/nonameShijian/noname/main"
						);
					},
				},
				/* {
					label: '自动检查更新',
					type: 'checkbox',
					checked: (() => {
						const bool = localStorage.getItem('autoCheckUpdates') == 'true';
						return bool || false;
					})(),
					click: (menuItem) => {
						localStorage.setItem('autoCheckUpdates', menuItem.checked);
					},
				},*/ 
				{
					type: "separator",
				},
				{
					label: "emoji选取",
					click: () => {
						// @ts-ignore
						window.showEmojiPanel();
					},
				},
				{
					type: "separator",
				},
				{
					label: "创建快捷方式",
					click: () => {
						let lnkPath = dialog.showSaveDialogSync(thisWindow, {
							title: "选择目录保存快捷方式",
							defaultPath: path.join(
								app.getPath("desktop"),
								"无名杀.lnk"
							),
							properties: ["dontAddToRecent"],
						});

						if (!lnkPath) return;

						let result = shell.writeShortcutLink(lnkPath, {
							target: app.getPath("exe"),
							description: "无名杀",
							icon: path.join(__dirname, "..", "noname.ico"),
							iconIndex: 0,
							appUserModelId: "无名杀",
						});
						if (result) {
							dialog.showMessageBoxSync(thisWindow, {
								title: "无名杀",
								message: "快捷方式创建成功",
								icon: path.join(__dirname, "noname.ico"),
								buttons: ["确定"],
								noLink: true,
							});
						} else {
							dialog.showMessageBoxSync(thisWindow, {
								title: "无名杀",
								type: "error",
								message: "快捷方式创建失败",
								icon: path.join(__dirname, "noname.ico"),
								buttons: ["确定"],
								noLink: true,
							});
						}
					},
				},
				{
					type: "separator",
				},
				{
					label: "打开无名杀目录",
					click: () => {
						shell.showItemInFolder(__dirname);
					},
				},
			],
		},
		{
			label: "窗口",
			submenu: [
				{
					label: "重新加载当前窗口",
					role: "reload",
				},
				{
					label: "打开/关闭控制台",
					role: "toggleDevTools",
				},
				{
					label: "隐藏顶部菜单栏",
					type: "checkbox",
					checked: initialHideMenuBar,
					click: (menuItem) => {
						try {
							// @ts-ignore
							window.__setHideMenuBar?.(!!menuItem.checked);
						} catch (_) {}
					},
				},
				{
					type: "separator", //分割线
				},
				{
					label: "全屏模式",
					role: "togglefullscreen",
				},
				{
					label: "最小化",
					role: "minimize",
				},
				{
					type: "separator", //分割线
				},
			],
		},
		{
			label: "帮助",
			submenu: [
				{
					label: "无名杀教程",
					click: () => {
						createIframe();
					},
				},
				{
					label: "JavaScript教程",
					click: () => {
						shell.openExternal(
							"https://developer.mozilla.org/zh-CN/docs/learn/JavaScript"
						);
					},
				},
				{
					label: "Electron教程",
					click: () => {
						shell.openExternal("https://www.electronjs.org/docs");
					},
				},
				// {
				// 	label: "QQ群合集",
				// 	click: () => {
				// 		shell.openExternal(
				// 			"https://mp.weixin.qq.com/s?__biz=MzUwOTMwMjExNQ==&mid=100009245&idx=1&sn=5671f6f4003d4fae44da3fc09630a759&chksm=7916e1114e616807e6aa34dec69c34ab1096d9ea332e6fb88b4b48116f41a948d907ff00f96b&mpshare=1&scene=23&srcid=0803MuuzUbphhaDV6y8C2noF&sharer_sharetime=1627992420112&sharer_shareid=0ebf733c5192798632ac5cf18bae205c#rd"
				// 		);
				// 	},
				// },
				{
					label: "bug反馈",
					click: () => {
						shell.openExternal(
							"https://tieba.baidu.com/p/9117747182?share=9105&fr=sharewise&see_lz=0&share_from=post&sfc=copy&client_type=2&client_version=12.89.1.0&st=1760606425&is_video=false&unique=D3592476B01F3AB202839B267EB67624"
						);
					},
				},
				{
					label: "版权声明",
					click: () => {
						dialog.showMessageBoxSync(thisWindow, {
							message:
								"【无名杀】属于个人（水乎）开发项目且【完全免费】。如非法倒卖用于牟利将承担法律责任 开发团队将追究到底",
							type: "info",
							title: "版权声明",
							icon: path.join(__dirname, "..", "noname.ico"),
						});
					},
				},
			],
		},
		{
			label: "反馈",
			submenu: [
				{
					label: "通过QQ联系本应用作者（诗笺）",
					click: () => {
						shell.openExternal("tencent://message/?uin=2954700422");
					},
				},
				{
					label: "无名杀项目作者： 水乎",
				},
				{
					label: "无名杀现任更新者： 苏婆玛丽奥",
				},
				{
					label: "开发组成员之一：狂神",
					click: () => {
						shell.openExternal("tencent://message/?uin=2832899707");
					},
				},
			],
		},
	];

	// 根据设置决定是否显示菜单栏
	applyMenuBarVisibilityFromHidden(initialHideMenuBar);

	thisWindow.on("leave-full-screen", () => {
		if (!thisWindow.isDestroyed()) {
			contents.closeDevTools();
		} else {
			app.exit(0);
		}
	});

	// @ts-ignore
	window.showEmojiPanel = () => {
		if (!app.isEmojiPanelSupported()) {
			alert("当前操作系统版本不允许使用本机emoji选取器");
		} else {
			app.showEmojiPanel();
		}
	};
})();
