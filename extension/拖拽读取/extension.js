game.import("extension", function(lib, game, ui, get, ai, _status) {
	/*
	可以通过下面的网址访问项目网址
	https://hub.fastgit.org/nonameShijian/extinsion-DragRead
	*/
	if (typeof require != 'function') {
		game.removeExtension("拖拽读取", false);
		throw '没有nodejs环境，无法导入此扩展';
	}

    //导入7z
    let SevenZip;
    const { div: SevenZip_div, span: SevenZip_span } = createProgress('开始解压7z文件');
    let SevenZip_startTime, SevenZip_filePath;
    const reg = /Global[\s]+Time =[\S\s]+100%/;
    SevenZip_div.id = 'SevenZip_div';
    SevenZip_div.hide();

    function print(str) {
        //console.log(str);
        if (reg.test(str)) {
            SevenZip_span.innerText = '解压完成';
            SevenZip_div.hide();
            const endTime = new Date().getTime();
            setTimeout(() => {
                SevenZip_span.innerText = '开始解压7z文件';
                if (fs.existsSync(SevenZip_filePath)) {
                    fs.unlinkSync(SevenZip_filePath);
                }
                if (confirm(`解压完成(耗时${(endTime - SevenZip_startTime) / 1000}秒)，是否重启？`)) {
                    game.reload();
                }
            }, 500);
        } else {
            SevenZip_span.innerText = str;
        }
    }

    require('./extension/拖拽读取/node_modules/7z-wasm')({
        print,
        printErr: print
    }).then(result => {
        SevenZip = result;
    });
    
	const fs = require("fs");
	const { versions } = process;
	const electronVersion = parseFloat(versions.electron);
	let remote;
	if (electronVersion >= 14) {
		remote = require('@electron/remote');
	} else {
		remote = require('electron').remote;
	}
	const { dialog } = remote;
	const path = require('path');
	const body = document.body;
	let loadCSS = false;

	/*解压方法*/
	function loadZip(obj, event, src, fileName) {
		return new Promise((resolve, reject) => {
			let startTime, div = document.getElementById('importZip'),
				span = div.childNodes[0],
				zip, prefix;

			if (obj !== null && typeof obj === 'object') {
				//导入扩展之前执行过
				startTime = obj.startTime;
				zip = obj.zip3;
				prefix = obj.prefix;
			}
			if (!startTime) {
				startTime = new Date().getTime();
			}
			if (!prefix) {
				prefix = '';
			}

			function implement() {
				let replace = src.replace(__dirname + '\\', '') + '/';
				let filelist = [];
				//文件列表
				for (let i in zip.files) {
					if (zip.files[i].dir || !i.startsWith(prefix)) continue;
					i = i.slice(prefix.length);
					if (i[0] != '.' && i[0] != '_') {
						filelist.push(i);
					}
				}

				let i = 0,
					max = filelist.length;

				game.ensureDirectory(replace, function() {
					function UHP(err, errFileName) {
						reject(`解压时遇到错误： 
						${err}
						at ${fileName}/${errFileName}`);
					};
					let Letgo = async (name, zipdir) => {
						let nodeBuffer = await zip.file(zipdir).async('nodeBuffer');
						fs.writeFile(src + "/" + name, nodeBuffer, null, (err) => {
							writeFile(err, name);
						});
					};
					let writeFile = function(err, errFileName) {
						if (err) UHP(err, errFileName);

						if (filelist.length) {
							let filename = filelist.shift();
							let zipdir = filename;
							filename = filename.split("/");
							let name = filename.pop();

							span.innerText = `${fileName}
						解压进度 ： (${++i}/${max})`;
							game.print(`正在解压 ：${name.split("/").pop()} (${i}/${max})`);

							if (filename.length) {
								game.createDir(replace + filename.join("/"), function() {
									//这里需要个创文件夹的函数
									Letgo(filename.join("/") + "/" + name, zipdir);
								}, UHP);
							} else {
								Letgo(name, zipdir);
							}
						} else {
							let endTime = new Date().getTime();
							setTimeout(() => {
                                resolve();
								div.remove();
								if (confirm(`${fileName}导入完成(耗时${(endTime - startTime) / 1000}秒)，是否重启？`)) game.reload();
							}, 300);
						}
					}
					writeFile();
				});
			}

			if (zip) implement();
			else {
				zip = new JSZip3();
				zip.loadAsync(event.target.result).then(zip => implement());
			}
		});
	}

    /*显示进度*/
	function createProgress(str) {
		let fileReader = new FileReader();
		let div = document.body.appendChild(document.createElement('div'));
		div.id = 'importZip';
        div.css({
            'background-color': 'blueviolet',
            textAlign: 'center',
            width: '300px',
            height: '55px',
            left: '35%',
            bottom: '45%',
            zIndex: 100
        });
		let span = div.appendChild(document.createElement('span'));
		span.innerHTML = str;
		let startTime = new Date().getTime();

		fileReader.onabort = function(e) {
			let str = "压缩包加载中断";
			console.error(str);
			div.remove();
			alert(str);
		};

		fileReader.onerror = function(e) {
			let str = "压缩包加载失败！" + this.error.name + ": " + this.error.message;
			console.error(e);
			div.remove();
			alert(str);
		};
		return { div, span, fileReader, startTime };
	}

	return {
		name: "拖拽读取",
		editable: false,
		onremove: function() {
			delete window.JSZip3;
		},
		content: function(config, pack) {},
		precontent: function() {
			if (!window.JSZip3) {
                window.JSZip3 = require('./extension/拖拽读取/jszip.js');
			}
            //绑定拖拽结束事件
            body.addEventListener('drop', async function (e) {
                //必须要阻止拖拽的默认事件
                e.preventDefault();
                e.stopPropagation();

                //获得拖拽的文件集合
                let files = e.dataTransfer.files;
                //没有文件，不往下执行
                if (!files.length) return;
                //只处理第一个文件
                let name = files[0].name;

                //如果文件不是zip或者7z压缩包
                if (files[0].type.indexOf("zip") == -1 && !name.endsWith('.7z')) {
                    // 支持只导入extension.js
                    if (name == "extension.js" && confirm(`检测到extension.js(${files[0].path})，是否导入？`)) {
                        let success = true;
                        //修改game.import以获得扩展名
                        let importFunction = game.import;
                        game.import = (type, content) => {
                            return content;
                        };
                        let str = fs.readFileSync(files[0].path, 'utf-8');
                        try {
                            _status.importingExtension = true;
                            /** 是否是模块扩展 */
                            let isModuleExtension = false;
                            /** 扩展数据 */
                            let extension;
                            // 对于导入模块扩展的判断
                            try {
                                extension = eval(str)();
                            } catch (error) {
                                if (
                                    !lib.config.extension_应用配置_newExtApi ||
                                    (
                                        error.message != 'Cannot use import statement outside a module' &&
                                        error.message != 'await is only valid in async functions and the top level bodies of modules'
                                    )
                                ) throw error;
                                
                                // 开启了【应用配置】扩展的模块扩展的选项
                                isModuleExtension = true;
                                extension = (await import(files[0].path)).default;
                            }
                            let { name } = extension;
                            let extensionPath = path.join(__dirname, 'extension', name, 'extension.js');
                            let extensionDir = path.dirname(extensionPath);

                            if (lib.config.all.plays.contains(name)) {
                                dialog.showErrorBox("导入失败", "禁止安装游戏原生扩展");
                                success = false;
                            } else {
                                if (!fs.existsSync(extensionDir)) {
                                    fs.mkdirSync(extensionDir);
                                }
                                fs.writeFileSync(extensionPath, str);
                                // 如果是正常扩展
                                if (!isModuleExtension) {
                                    //如果扩展列表里有这个扩展，那么只覆盖文件即可，不需要加载，否则需要初始化配置
                                    if (!lib.config.extensions.includes(name)) {
                                        lib.config.extensions.add(name);
                                        game.saveConfigValue('extensions');
                                        game.saveConfig('extension_' + name + '_enable', true);
                                        for (let i in extension.config) {
                                            if (extension.config[i] && extension.config[i].hasOwnProperty('init')) {
                                                game.saveConfig('extension_' + name + '_' + i, extension.config[i].init);
                                            }
                                        }
                                    }
                                } else {
                                    if (!lib.config.moduleExtensions.includes(name)) {
                                        lib.config.moduleExtensions.add(name);
                                        game.saveConfigValue('moduleExtensions');
                                        game.saveConfig('extension_' + name + '_enable', true);
                                        for (let i in extension.config) {
                                            if (extension.config[i] && extension.config[i].hasOwnProperty('init')) {
                                                game.saveConfig('extension_' + name + '_' + i, extension.config[i].init);
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            alert('extension.js代码有错误，无法导入！');
                            success = false;
                            console.log(e);
                        } finally {
                            _status.importingExtension = false;
                        }
                        //还原game.import
                        game.import = importFunction;
                        if (success && confirm('导入完成，是否重启？')) game.reload();
                    }
                    return false;
                }

                function nextDo(index) {
                    if (index == 0) return;
                    let { div, fileReader, startTime } = createProgress(`请等待加载${name}，加载时间和文件大小成正比`);

                    if (index == 1) { //扩展
                        fileReader.onload = function (fileLoadedEvent) {
                            let data = fileLoadedEvent.target.result;
                            let zip3 = new JSZip3();
                            zip3.loadAsync(data).then(zip3 => {
                                /** 扩展名 */
                                let extname;
                                /** 是否是模块扩展 */
                                let isModuleExtension = false;
                                //导入扩展前的判断
                                let pathlib = {
                                    split: function (str) {
                                        let i = str.lastIndexOf('/')
                                        return [str.substring(0, i + 1), str.substring(i + 1)]
                                    },
                                }
                                let candidates = zip3.file(/\bextension.js$/);
                                if (!candidates.length) {
                                    div.remove();
                                    return dialog.showErrorBox("导入失败", "没有extension.js，无法导入");
                                }
                                let source = candidates.reduce((a, b) => a.name.length < b.name.length ? a : b);
                                let prefix = pathlib.split(source.name)[0];
                                if (!candidates.every(f => f.name.startsWith(prefix))) {
                                    div.remove();
                                    return dialog.showErrorBox("导入失败", "你导入的不是扩展！请选择正确的文件");
                                }
                                zip3 = zip3.folder(prefix);

                                zip3.file('extension.js').async('text').then(async str => {
                                    _status.importingExtension = true;
                                    const path = require("path");
                                    const tmp = path.join(__dirname, 'extension/拖拽读取/tmp.js');
                                    try {
                                        try {
                                            eval(str);
                                        } catch (error) {
                                            if (
                                                !lib.config.extension_应用配置_newExtApi ||
                                                (
                                                    error.message != 'Cannot use import statement outside a module' &&
                                                    error.message != 'await is only valid in async functions and the top level bodies of modules'
                                                )
                                            ) throw error;

                                            // 开启了【应用配置】扩展的模块扩展的选项
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

                                    if (!game.importedPack) {
                                        div.remove();
                                        dialog.showErrorBox("导入失败", "此压缩包不是一个扩展！");
                                        delete game.importedPack;
                                        return false;
                                    }

                                    extname = game.importedPack.name;

                                    if (lib.config.all.plays.contains(extname)) {
                                        div.remove();
                                        dialog.showErrorBox("导入失败", "禁止安装游戏原生扩展");
                                        delete game.importedPack;
                                        return false;
                                    }

                                    if (!isModuleExtension && lib.config.extensions.contains(extname)) {
                                        //卸载之前的扩展（保留文件）
                                        game.removeExtension(extname, true);
                                    }

                                    loadZip({ zip3, startTime, prefix }, fileLoadedEvent, path.join(__dirname, 'extension', extname), name)
                                        .finally(() => {
                                            //导入后执行的代码
                                            if (!isModuleExtension) {
                                                lib.config.extensions.add(extname);
                                                game.saveConfig('extensions', lib.config.extensions);
                                            } else {
                                                lib.config.moduleExtensions.add(name);
                                                game.saveConfigValue('moduleExtensions');
                                            }
                                            game.saveConfig('extension_' + extname + '_enable', true);
                                            for (let i in game.importedPack.config) {
                                                if (game.importedPack.config[i] && game.importedPack.config[i].hasOwnProperty('init')) {
                                                    game.saveConfig('extension_' + extname + '_' + i, game.importedPack.config[i].init);
                                                }
                                            }
                                            delete game.importedPack;
                                        }).catch(errStr => alert(errStr));
                                });
                            });
                        };
                    } else if (index == 2) { //离线包
                        fileReader.onload = function (fileLoadedEvent) {
                            loadZip({ startTime }, fileLoadedEvent, __dirname, name).catch(errStr => alert(errStr));
                        };
                    } else if (index == 3) { //素材包
                        let nextDo = (result) => {
                            if (result === undefined) return;
                            if (!Array.isArray(result) && result.canceled) return;
                            startTime = new Date().getTime(); //选择文件夹的时间排除
                            let filePath;
                            if (Array.isArray(result)) filePath = result[0];
                            else filePath = result.filePaths[0];

                            let loaded = function () {
                                loadZip({ startTime }, { target: fileReader }, filePath, name).catch(errStr => alert(errStr));
                            };
                            if (fileReader.readyState == 2) {
                                //已经加载完
                                loaded();
                            } else {
                                fileReader.onload = loaded;
                            }
                        };
                        let openDialog = dialog.showOpenDialog(remote.getCurrentWindow(), {
                            title: '选择文件夹，以解压到选择的文件夹下',
                            properties: ['openDirectory'],
                            defaultPath: __dirname
                        }, nextDo);
                        if (openDialog) openDialog.then(result => nextDo(result));
                    }

                    fileReader.readAsArrayBuffer(files[0], "UTF-8");
                };

                async function nextDo_7z(index) {
                    //window.SevenZip = SevenZip;
                    if (index == 0) return;
                    if (index == 1) {
                        throw '还不支持读取7z格式的扩展。\r\n导入7z格式的扩展请参考万能导入法\r\n然后选择素材包，解压缩到指定扩展目录';
                    }
                    const typedArray = new Uint8Array(await files[0].arrayBuffer())
                    const cwd = process.cwd();
                    const hostRoot = path.parse(cwd).root;
                    const mountRoot = "/nodefs";
                    SevenZip.FS.mkdir(mountRoot);
                    let outDir;
                    //离线包
                    if (index == 2) {
                        outDir = __dirname;
                    }
                    //素材包
                    if (index == 3) {
                        let selectPath = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
                            title: '选择文件夹，以解压到选择的文件夹下',
                            properties: ['openDirectory'],
                            defaultPath: __dirname
                        });
                        if (!selectPath) return;
                        outDir = selectPath[0];
                    }

                    //const hostDir = path.relative(hostRoot, cwd).split(path.sep).join("/");

                    SevenZip_filePath = path.join(outDir, name);
                    SevenZip_startTime = new Date().getTime();
                    SevenZip_div.show();

                    SevenZip.FS.mount(SevenZip.NODEFS, { root: hostRoot }, mountRoot);
                    SevenZip.FS.chdir(mountRoot + "/" + outDir.split(path.sep).join("/").slice(3));

                    const stream = SevenZip.FS.open(name, "w+");
                    SevenZip.FS.write(stream, typedArray, 0, typedArray.length);
                    SevenZip.FS.close(stream);

                    SevenZip.callMain(["x", name, '-y', '-bd', '-bt']);
                }

                let showMessageBox = dialog.showMessageBox(remote.getCurrentWindow(), {
                    type: 'info',
                    title: '拖拽导入',
                    message: `获取到${name}(${files[0].path})，是否选择文件类型并导入？`,
                    buttons: ['取消', '扩展包', '离线包', '素材包'],
                    defaultId: 0, //默认为取消
                    cancelId: 0, //关闭对话框的时候，不是通过点击对话框的情况的默认执行索引
                }, name.endsWith('.zip') ? nextDo : nextDo_7z);

                if (showMessageBox) showMessageBox.then(result => (name.endsWith('.zip') ? nextDo : nextDo_7z)(result.response)).catch(e => alert(e));
            });

            //绑定拖拽文件在容器移动事件
            body.addEventListener('dragover', (e) => {
                //必须要阻止拖拽的默认事件
                e.preventDefault();
                e.stopPropagation();
            });
		},
		config: {
			checkForUpdate: {
				clear: true,
				name: '<span style="text-decoration: underline;">检查更新<span>',
				intro: '检查更新',
				onclick: function() {
					if (typeof fetch != 'function') throw '不支持fetch函数，无法使用此功能';
					if (_status.DragReadUpdate) return alert('请不要重复检查更新');
					_status.DragReadUpdate = true;
					fetch('https://raw.fastgit.org/nonameShijian/extinsion-DragRead/main/version')
						.then(response => response.text()).then(version => {
							let newVersion = parseFloat(version);
							let nowVersion = NaN;
							if (lib.extensionPack["拖拽读取"]) {
								nowVersion = parseFloat(lib.extensionPack["拖拽读取"].version);
							}
							if (isNaN(nowVersion) || nowVersion < newVersion) {
								//可更新，展示更新内容
								if (!loadCSS) {
									lib.init.css(lib.assetURL + "extension/拖拽读取", "extension");
									loadCSS = true;
								}
								fetch('https://raw.fastgit.org/nonameShijian/extinsion-DragRead/main/updateContent')
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
										let button = ui.create.node('input', layer, function() {
											if (download) return false;
											download = true;
											button.value = '正在下载';
											fetch('https://hub.fastgit.org/nonameShijian/extinsion-DragRead/archive/refs/heads/main.zip')
												.then(response => response.arrayBuffer()).then(arrayBuffer => {
													layer.remove();
													let {
														div,
														fileReader,
														startTime
													} = createProgress(`请等待加载拖拽读取(v${version}).zip，加载时间和文件大小成正比`);
													let zip3 = new JSZip3();
													zip3.loadAsync(arrayBuffer).then(zip3 => {
														let extname = '拖拽读取';
														let prefix = Object.keys(zip3.files)[0];
														zip3 = zip3.folder(prefix);
														//下载的扩展压缩包自带一个文件夹
														zip3.file('extension.js').async('text').then(str => {
															_status.importingExtension = true;
															try {
																eval(str);
															} catch (e) {
																dialog.showErrorBox("扩展代码有错误！", `${e}`);
															} finally {
																_status.importingExtension = false;
															}

															if (!game.importedPack) {
																dialog.showErrorBox("导入失败", "此压缩包不是一个扩展！");
																delete _status.DragReadUpdate;
																delete game.importedPack;
																return false;
															}

															if (lib.config.extensions.contains(extname)) {
																//卸载之前的扩展（保留文件）
																game.removeExtension(extname, true);
															}

															loadZip({
																	zip3,
																	startTime,
																	prefix
																}, null, path.join(__dirname, 'extension', extname), `拖拽读取(v${version}).zip`)
																.finally(
																	() => {
																		//导入后执行的代码
																		delete _status.DragReadUpdate;
																		lib.config.extensions.add(extname);
																		game.saveConfig('extensions', lib.config.extensions);
																		game.saveConfig('extension_' + extname + '_enable', true);
																		for (var i in game.importedPack.config) {
																			if (game.importedPack.config[i] && game.importedPack.config[i].hasOwnProperty('init')) {
																				game.saveConfig('extension_' + extname + '_' + i, game.importedPack.config[i].init);
																			}
																		}
																		delete game.importedPack;
																	}).catch(errStr => alert(errStr));
														});
													});
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
				onclick: function() {
					if (typeof fetch != 'function') throw '不支持fetch函数，无法使用此功能';
					if (!loadCSS) {
						lib.init.css(lib.assetURL + "extension/拖拽读取", "extension");
						loadCSS = true;
					}
					fetch(__dirname + '/extension/拖拽读取/updateContent')
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
				onclick: function() {
					let span = this.childNodes[0];
					if (span.innerText != "一键生成完整包") return false;
					span.innerText = "正在加载所有文件和目录，请稍候";
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

					let foldersList = ["card", "character", "font", "game", "layout", "mode", "theme"];
					let filesList = ["app.html", "index.html", "LICENSE", "README.md"];

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

						callback("cache", [], []);
						//cache文件夹
						callback("audio", ["background", "card", "die", "effect", "skill", "voice"], []);
						//audio文件夹
						callback("image", ["background", "card", "character", "emotion", "mode", /*"skin",*/ "splash"], []);
						//image文件夹, 避免导出image/FC等皮肤包
						callback("extension", ["boss", "cardpile", "coin", "wuxing"], []);
						//四个原生扩展
						callback("node_modules", ["options", "ultron", "ws"], []);
						//node_modules,电脑开局域网用
						span.innerText = "目录和文件数组已生成";
						return zip;
					}
					loadFile().then((zip) => {
						span.innerText = "正在转化nodeBuffer数据，请稍候";
						zip.generateAsync({
							type: "nodebuffer"
						}).then(function(nodeBuffer) {
							span.innerText = "nodeBuffer数据转化成功";
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
						});
					}).catch(err => {
						console.error(err);
						span.innerText = "一键生成完整包";
					});
				},
			},
		},
		help: {},
		package: {
			intro: `windows电脑版专属扩展，把zip或7z文件（离线包，扩展或素材压缩包）拖入到游戏内即可导入`,
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.8",
		},
	}
})
