import { lib, game, ui, get, ai, _status } from '../../noname.js';
game.import("extension", function () {
	/** 解压文件方法 */
	const fs = require("fs");
	const path = require('path');

	const { versions } = process;
	const electronVersion = parseFloat(versions.electron);
	let remote;
	if (electronVersion >= 14) {
		// @ts-ignore
		remote = require('@electron/remote');
	} else {
		// @ts-ignore
		remote = require('electron').remote;
	}
	const { dialog } = remote;
	const { webUtils } = require('electron');
	// const body = document.body;
	let loadCSS = false;

	/**
	 * 显示进度
	 * @param {string} str 初始显示文字
	 */
	function createProgress(str) {
		let div = document.body.appendChild(document.createElement('div'));
		div.id = 'importZip';
		div.css({
			backgroundColor: 'blueviolet',
			textAlign: 'center',
			width: '300px',
			height: '75px',
			left: '35%',
			bottom: '45%',
			zIndex: '100'
		});

		let span = div.appendChild(document.createElement('span'));
		span.innerHTML = str;

		div.appendChild(document.createElement('br'));
		
		let psw = document.createElement('input');
		// psw.type = 'password';
		psw.style.display = 'none';
		psw.style.width = '180px';
		psw.placeholder = '请输入压缩包密码(回车确认)';
		div.appendChild(psw);
		return { div, span, psw };
	}

	/**
	 * 解压zip
	 * @param {string | ArrayBuffer} zipFilePath zip文件地址
	 * @param {string} extractToPath 解压地址
	 * @param {string} password 密码
	 * @param {(i: number | 'finish' | ErrorEvent, max?: number) => void} callback
	 */
	function extractAll(zipFilePath, extractToPath, password, callback) {
		var myWorker = new Worker('./extension/拖拽读取/worker.js');
		myWorker.postMessage([zipFilePath instanceof ArrayBuffer ? zipFilePath : fs.readFileSync(zipFilePath), password]);
		myWorker.onmessage = function (e) {
			if (e.data == 'finish') {
				console.log('解压完成');
				myWorker.terminate();
				// @ts-ignore
				myWorker = null;
				callback('finish');
				return;
			}
			let [index, max, filepath, buffer] = e.data;
			if (!extractToPath.endsWith('/')) extractToPath += '/';
			const dirname = path.dirname(extractToPath + filepath);
			if (!fs.existsSync(dirname)) {
				fs.mkdirSync(dirname, { recursive: true });
			}
			fs.writeFileSync(extractToPath + filepath, buffer);
			callback(index + 1, max);
		};
		myWorker.onerror = function(e) {
			console.log(e);
			if (e.message && e.message.endsWith('require is not defined')) {
				alert('请在应用根目录的main.js中BrowserWindow构造函数中的webPreferences属性添加: nodeIntegrationInWorker: true');
			}
			myWorker.terminate();
			callback(e);
		}
	}

	function extract(zipFilePath, extractToPath, password, span, div, finish) {
		let startTime = new Date().getTime();
		extractAll(zipFilePath, extractToPath, password, (i, max) => {
			if (typeof i == 'number') {
				span.innerText = `正在解压: ${i}/${max}`;
			}
			else if (i == 'finish') {
				span.innerText = '解压完成';
				let endTime = new Date().getTime();
				div.remove();
				setTimeout(() => {
					if (typeof finish == 'function') {
						finish();
					}
					if (confirm(`解压完成, 用时${(endTime - startTime) / 1000}秒, 是否重启？`)) {
						game.reload();
					}
				}, 300);
			} 
			else {
				span.innerText = `解压失败: ${i.message}`;
				setTimeout(() => {
					div.remove();
				}, 3000);
			}
		});
	}

	/**
	 * 
	 * @param { string | ArrayBuffer } zipFilePath 
	 * @param { string } password 
	 * @param { HTMLSpanElement } span 
	 * @param { HTMLDivElement } div 
	 */
	function getExtNameAndExtract(zipFilePath, password, span, div) {
		var myWorker = new Worker('./extension/拖拽读取/worker.js');
		myWorker.postMessage([zipFilePath instanceof ArrayBuffer ? zipFilePath : fs.readFileSync(zipFilePath), password, 'getExtName']);
		myWorker.onmessage = async function (e) {
			// console.log(e.data);
			if (e.data == null) {
				return dialog.showErrorBox("导入失败", "没有extension.js，无法导入");
			} else {
				// e.data为[扩展js字符串, info.json字符串]
				/** 扩展名 */
				let extname;
				/** 是否是模块扩展 */
				let isModuleExtension = false;
				_status.importingExtension = true;
				const tmp = path.join(__dirname, 'extension/拖拽读取/tmp.js');
				const str = e.data[0], infoStr = e.data[1];
				if (typeof infoStr == 'string') {
					try {
						const { name } = JSON.parse(infoStr);
						extname = name;
					} catch {
						console.log('info.json中未解析出扩展名称');
					}
				} else {
					try {
						try {
							await eval(str);
						} catch (error) {
							console.log(error);
							if (
								// 本体已经支持了模块扩展
								// !lib.config.extension_应用配置_newExtApi ||
								(
									error.message != 'Cannot use import statement outside a module' &&
									error.message != 'await is only valid in async functions and the top level bodies of modules'
								)
							) throw error;

							// 模块扩展
							isModuleExtension = true;
							// 创建临时文件
							fs.writeFileSync(tmp, str);
							// 判断文件是否出错, 并赋值给game.importedPack
							game.importedPack = (await import(tmp)).default;
							// 删除文件
							fs.unlinkSync(tmp);
						}
					} catch (e) {
						div.remove();
						dialog.showErrorBox("扩展代码有错误！", `${e}`);
						delete game.importedPack;
						return false;
					} finally {
						_status.importingExtension = false;
					}
				}

				if (!game.importedPack && !extname) {
					div.remove();
					dialog.showErrorBox("导入失败", "此压缩包不是一个扩展！");
					delete game.importedPack;
					return false;
				}

				if (!extname) extname = game.importedPack.name;

				if (lib.config.all.plays.includes(extname)) {
					div.remove();
					dialog.showErrorBox("导入失败", "禁止安装游戏原生扩展");
					delete game.importedPack;
					return false;
				}

				if (!isModuleExtension && lib.config.extensions.includes(extname)) {
					// 卸载之前的扩展（保留文件）
					// @ts-ignore
					game.removeExtension(extname, true);
				}

				extract(zipFilePath, __dirname + '/extension/' + extname, password, span, div, () => {
					//导入后执行的代码
					lib.config.extensions.add(extname);
					game.saveConfig('extensions', lib.config.extensions);
					game.saveConfig('extension_' + extname + '_enable', true);
					if (game.importedPack) {
						for (let i in game.importedPack.config) {
							if (game.importedPack.config[i] && game.importedPack.config[i].hasOwnProperty('init')) {
								game.saveConfig('extension_' + extname + '_' + i, game.importedPack.config[i].init);
							}
						}
						delete game.importedPack;
					}
				});
			}
		};
		myWorker.onerror = function (e) {
			console.log(e);
			if (e.message && e.message.endsWith('require is not defined')) {
				alert('请在应用根目录的main.js中BrowserWindow构造函数中的webPreferences属性添加: nodeIntegrationInWorker: true');
			}
			span.innerText = `解压失败: ${e.message}`;
			myWorker.terminate();
			setTimeout(() => {
				div.remove();
			}, 3000);
		}
	}

	return {
		name: "拖拽读取",
		editable: false,
		onremove: function () {
			// @ts-ignore
			delete window.JSZip3;
		},
		content: function (config, pack) {},
		precontent: function () {
			// @ts-ignore
			if (!window.JSZip3) {
				// @ts-ignore
				window.JSZip3 = require('./extension/拖拽读取/jszip.js');
			}
			
			// 绑定拖拽结束事件
			document.body.addEventListener('drop', async function (e) {
				// 必须要阻止拖拽的默认事件
				e.preventDefault();
				e.stopPropagation();
				if (!e.dataTransfer) return console.warn('e.dataTransfer');
				// 获得拖拽的文件集合
				let files = e.dataTransfer.files;
				// 没有文件，不往下执行
				if (!files.length) return console.warn('files.length');
				// 只处理第一个文件
				let name = files[0].name;

				if (files[0].type.indexOf("zip") == -1) {
					// 支持只导入extension.js
					if (name == "extension.js" && confirm(`检测到extension.js(${webUtils.getPathForFile(files[0])})，是否导入？`)) {

					} else {
						return false;
					}
				}

				let showMessageBox = dialog.showMessageBox(remote.getCurrentWindow(), {
					type: 'info',
					title: '拖拽导入',
					message: `获取到${name}(${webUtils.getPathForFile(files[0])})，是否选择文件类型并导入？`,
					buttons: ['取消', '扩展包', '离线包或完整包', '素材包'],
					// 默认为取消
					defaultId: 0,
					// 关闭对话框的时候，不是通过点击对话框的情况的默认执行索引
					cancelId: 0,
				// @ts-ignore
				}, nextDo);

				if (showMessageBox) showMessageBox.then(result => nextDo(result.response)).catch(e => {
					console.log(e);
					alert(e);
				});

				/**
				 * @param {number} index
				 */
				async function nextDo(index) {
					if (index == 0) return;
					let { div, span, psw } = createProgress(`请等待加载${name}，加载时间和文件大小成正比`);
					psw.style.display = '';
					// 密码输入框获取焦点
					psw.focus();
					span.innerText = `正在导入${name}，没有密码请直接点击回车`;
					psw.addEventListener('keyup', e => {
						if (e.code !== 'Enter') return;
						psw.style.display = 'none';
						switch (index) {
							//扩展
							case 1:
								getExtNameAndExtract(webUtils.getPathForFile(files[0]), psw.value, span, div);
								break;
							// 离线包或完整包
							case 2:
								extract(webUtils.getPathForFile(files[0]), __dirname, psw.value, span, div);
								break;
							// 素材包
							case 3:
								let nextExtract = (result) => {
									if (result === undefined) return;
									if (!Array.isArray(result) && result.canceled) return;
									let filePath;
									if (Array.isArray(result)) filePath = result[0];
									else filePath = result.filePaths[0];
									extract(webUtils.getPathForFile(files[0]), filePath, psw.value, span, div);
								}
								let openDialog = dialog.showOpenDialog(remote.getCurrentWindow(), {
									title: '选择文件夹，以解压到选择的文件夹下',
									properties: ['openDirectory'],
									defaultPath: __dirname
								}, nextExtract);
								if (openDialog) openDialog.then(result => nextExtract(result));
								break;
						}
					});
				}
			});

			// 绑定拖拽文件在容器移动事件
			document.body.addEventListener('dragover', (e) => {
				// 必须要阻止拖拽的默认事件
				e.preventDefault();
				e.stopPropagation();
			});
		},
		config: {
			checkForUpdate: {
				clear: true,
				name: '<span style="text-decoration: underline;">检查更新<span>',
				intro: '检查更新',
				onclick: function () {
					if (typeof fetch != 'function') throw '不支持fetch函数，无法使用此功能';
					if (_status.DragReadUpdate) return alert('请不要重复检查更新');
					_status.DragReadUpdate = true;
					fetch('https://mirror.ghproxy.com/https://raw.githubusercontent.com/nonameShijian/extinsion-DragRead/main/version')
						.then(response => response.text()).then(version => {
							let newVersion = parseFloat(version);
							let nowVersion = NaN;
							if (lib.extensionPack["拖拽读取"]) {
								// @ts-ignore
								nowVersion = parseFloat(lib.extensionPack["拖拽读取"].version);
							}
							if (isNaN(nowVersion) || nowVersion < newVersion) {
								//可更新，展示更新内容
								if (!loadCSS) {
									lib.init.css(lib.assetURL + "extension/拖拽读取", "extension");
									loadCSS = true;
								}
								fetch('https://mirror.ghproxy.com/https://raw.githubusercontent.com/nonameShijian/extinsion-DragRead/main/updateContent')
									.then(response => response.text()).then(txt => {
										let end = false;
										let updateContent = txt.split("\n").filter((str) => {
											if (!str || end) return false;
											if (str.includes("更新内容")) {
												let ver = parseFloat(str.slice(1, str.indexOf("更新内容")));
												if ((isFinite(nowVersion) && ver <= nowVersion) || (isNaN(nowVersion) && str.indexOf(version) != 1)) {
													end = true;
													return false;
												}
											}
											return true;
										}).join("\n\n");
										updateContent += "\n</pre>";
										let layer = ui.create.div(ui.window, '.updateContent');
										let close = ui.create.div(layer, '.updateContentClose', () => {
											layer.remove();
											delete _status.DragReadUpdate;
										});
										let content = ui.create.div(layer, {
											innerHTML: updateContent,
										});
										let download = false;
										let button = ui.create.node('input', layer, function () {
											if (download) return false;
											download = true;
											button.value = '正在下载';
											fetch('https://mirror.ghproxy.com/https://github.com/nonameShijian/extinsion-DragRead/archive/refs/heads/main.zip')
												.then(response => response.arrayBuffer()).then(arrayBuffer => {
													layer.remove();
													let { div, span, psw } = createProgress(`请等待加载拖拽读取(v${version}).zip，加载时间和文件大小成正比`);
													getExtNameAndExtract(arrayBuffer, psw.value, span, div);
												}).catch(err => {
													console.error(err);
													alert(err);
													download = false;
													button.value = '点击下载';
												});
										});
										button.type = 'button';
										button.value = '点击下载';
										button.className = 'updateContentButton menubutton large';
									}).catch(err => {
										console.error("获取更新内容失败", err);
										delete _status.DragReadUpdate;
										alert("获取更新内容失败");
									});
							} else {
								delete _status.DragReadUpdate;
								return alert("扩展已是最新");
							}
						});
				},
			},
			loadUpdateContent: {
				clear: true,
				name: '<span style="text-decoration: underline;">点击显示本扩展更新内容<span>',
				intro: '本扩展历史更新内容',
				onclick: function () {
					if (typeof fetch != 'function') throw '不支持fetch函数，无法使用此功能';
					if (!loadCSS) {
						lib.init.css(lib.assetURL + "extension/拖拽读取", "extension");
						loadCSS = true;
					}
					fetch(__dirname + '/extension/拖拽读取/README.md')
						.then(response => response.text()).then(txt => {
							let layer = ui.create.div(ui.window, '.updateContent');
							let close = ui.create.div(layer, '.updateContentClose', () => {
								layer.remove();
							});
							let content = ui.create.div(layer, {
								innerHTML: txt,
							});
						}).catch(err => {
							console.error("获取更新内容失败", err);
							alert("获取更新内容失败");
						});
				},
			},
			generateZip: {
				clear: true,
				name: '一键生成完整包',
				intro: '一键生成完整包',
				onclick: function () {
					// @ts-ignore
					let span = this.childNodes[0];
					if (span.innerText != "一键生成完整包") return false;
					span.innerText = "正在加载所有文件和目录，请稍候";
					// @ts-ignore
					let zip = new JSZip3();

					function getFileListSync(path, callback) {
						//同步getFileList方法
						let files = [],
							folders = [];
						path = __dirname + '/' + path;
						let result = fs.readdirSync(path);
						for (let i = 0; i < result.length; i++) {
							if (result[i][0] != '.' && result[i][0] != '_') {
								if (fs.statSync(path + '/' + result[i]).isDirectory()) {
									folders.push(result[i]);
								} else {
									files.push(result[i]);
								}
							}
						}
						callback(folders, files);
					}

					let foldersList = ["card", "character", "font", "game", "layout", "mode", "theme", "noname"];
					let filesList = ["app.html", "index.html", "LICENSE", "README.md", "noname.js", "service-worker.js"];

					async function loadFile() {
						for (let i = 0; i < filesList.length; i++) {
							//加载filesList里的四个文件
							let blobData = fs.readFileSync(`${__dirname}/${filesList[i]}`);
							zip.file(filesList[i], blobData);
						}

						function callback(name, folders, files) {
							zip.folder(name);
							for (let i = 0; i < files.length; i++) {
								let blobData = fs.readFileSync(`${__dirname}/${name}/${files[i]}`);
								zip.file(`${name}/${files[i]}`, blobData);
							}
							for (let i = 0; i < folders.length; i++) {
								zip.folder(`${name}/${folders[i]}`);
								getFileListSync(`${name}/${folders[i]}`, (newFolders, newFiles) => {
									callback(`${name}/${folders[i]}`, newFolders, newFiles);
								});
							}
						}

						for (let i = 0; i < foldersList.length; i++) {
							getFileListSync(foldersList[i], (folders, files) => {
								callback(foldersList[i], folders, files);
							});
						}
						//cache文件夹
						callback("cache", [], []);
						//audio文件夹
						callback("audio", ["background", "card", "die", "effect", "skill", "voice"], []);
						//image文件夹, 避免导出image/FC等皮肤包
						callback("image", ["background", "card", "character", "emotion", "mode", /*"skin",*/ "splash"], []);
						//四个原生扩展
						callback("extension", ["boss", "cardpile", "coin", "wuxing"], []);
						//node_modules,电脑开局域网用
						callback("node_modules", ["options", "ultron", "ws"], []);
						span.innerText = "目录和文件数组已生成";
						return zip;
					}

					loadFile().then(zip => {
						span.innerText = "正在转化nodeBuffer数据，请稍候";
						zip.generateAsync({
							type: "nodebuffer"
						}).then(function (nodeBuffer) {
							// console.log(nodeBuffer);
							span.innerText = "nodeBuffer数据转化成功";
							var myWorker = new Worker(__dirname + '/extension/拖拽读取/worker2.js');
							game.prompt('请输入新压缩包的密码(没有直接按取消，带密码压缩的慢)', false, password => {
								if (typeof password == 'string' && password.length > 0) {
									span.innerText = '正在使用密码压缩文件';
									myWorker.postMessage([nodeBuffer, password]);
								} else {
									myWorker.terminate();
									let writeFile = (path) => {
										if (!path) return span.innerText = "一键生成完整包";
										fs.writeFile(path, nodeBuffer, null, (err) => {
											if (err) console.error(err);
											else alert('保存成功');
											span.innerText = "一键生成完整包";
										});
									}
									span.innerText = "等待选择保存地址";
									let chooseDirectory = dialog.showSaveDialog(remote.getCurrentWindow(), {
										title: '选择一个文件夹，以保存到选择的文件夹下',
										properties: ['openDirectory'],
										defaultPath: `v${lib.version}(完整包).zip`,
										dontAddToRecent: true,
									}, writeFile);
									if (chooseDirectory) chooseDirectory.then(result => {
										if (result.canceled) return span.innerText = "一键生成完整包";
										//点了取消
										writeFile(result.filePath);
									});
								}
							});
							myWorker.onmessage = function (e) {
								if (typeof e.data == 'string') {
									return span.innerText = `压缩进度: ${e.data}`;
								}
								let writeFile = (path) => {
									if (!path) return span.innerText = "一键生成完整包";
									fs.writeFile(path, e.data, null, (err) => {
										if (err) console.error(err);
										else alert('保存成功');
										span.innerText = "一键生成完整包";
									});
								}
								span.innerText = "等待选择保存地址";
								let chooseDirectory = dialog.showSaveDialog(remote.getCurrentWindow(), {
									title: '选择一个文件夹，以保存到选择的文件夹下',
									properties: ['openDirectory'],
									defaultPath: `v${lib.version}(完整包).zip`,
									dontAddToRecent: true,
								}, writeFile);
								if (chooseDirectory) chooseDirectory.then(result => {
									if (result.canceled) return span.innerText = "一键生成完整包";
									//点了取消
									writeFile(result.filePath);
								});
							};
							myWorker.onerror = function (e) {
								console.log(e);
								if (e.message && e.message.endsWith('require is not defined')) {
									alert('请在应用根目录的main.js中BrowserWindow构造函数中的webPreferences属性添加: nodeIntegrationInWorker: true');
								}
								alert('压缩失败: ' + e.message)
							}
						});
					}).catch(err => {
						console.error(err);
						span.innerText = "一键生成完整包";
					});
				}
			}
		},
		help: {},
		package: {
			intro: `windows电脑版专属扩展，把zip（离线包，扩展或素材压缩包）拖入到游戏内即可导入，现在可以导入有密码的压缩包了`,
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "3.1",
		},
	};
});