/// <reference path="../../typings/index.d.ts" />
"use strict";
game.import("extension", function(lib, game, ui, get, ai, _status) {
	const { versions } = process;
	const electronVersion = parseFloat(versions.electron);
	
	if (isNaN(electronVersion) || electronVersion < 13) {
		throw '此版本应用不适用【应用配置】';
	}
	
	const path = require('path');
	/** @type { import('@electron/remote') } */
	let remote;
	if (electronVersion >= 14) {
		remote = require('@electron/remote');
		lib.node.debug = () => {
			// @ts-ignore
			remote.getCurrentWindow().toggleDevTools();
		};
	} else {
		// @ts-ignore
		remote = require('electron').remote;
	}
	const { dialog } = remote;
	const thisWindow = remote.getCurrentWindow();
	
	//保存扩展
    for (let extensionName of ['应用配置', '拖拽读取', '在线更新']) {
        if (lib.node.fs.existsSync(path.join(__dirname, 'extension', extensionName))) {
            if (!lib.config.extensions.contains(extensionName)) {
                console.log(`【应用配置】加载并保存了【${extensionName}】内置扩展`);
                lib.config.extensions.add(extensionName);
            }
            if (!lib.config[`extension_${extensionName}_enable`]) {
                game.saveExtensionConfig(extensionName, 'enable', true);
            }
        }
	}
	game.saveConfig('extensions', lib.config.extensions);
	
	//避免提示是否下载图片和字体素材
	if(!lib.config.asset_version) {
		game.saveConfig('asset_version','无');
	}
	
	return {
		name: "应用配置",
		editable: false,
		content: function(config, pack) {
			//链接：nonameSKill:?extensionName=全能搜索
			delete lib.extensionMenu.extension_应用配置.delete;
			
			const fullsize = document.createElement('style');
			fullsize.innerText = `
				/* 让无名杀控制台内的文字可选中 */
				.fullsize {
					user-select: text;
					-webkit-user-select: text;
				}
				/* 为hljs设置行号样式 */
				.hljs-ln-numbers {
					-webkit-touch-callout: none;
					-webkit-user-select: none;
					-khtml-user-select: none;
					-moz-user-select: none;
					-ms-user-select: none;
					user-select: none;
					text-align: center;
					color: #ccc;
					border-right: 1px solid #CCC;
					vertical-align: top;
					padding-right: 5px;
				}
				.hljs-ln-code {
					padding-left: 1em;
				}
				/* 防止div样式被无名杀修改 */
				.hljs-ln-n {
					display: block !important;
					position: inherit !important;
					transition: none !important;
				}
				.showErrorCode {
					position: relative;
					z-index: 10;
					width: 80%;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					background: white;
					color: black;
					text-shadow: none;
				}
				.showErrorCode > .txt {
					user-select: text;
					position: relative;
					left: 50%;
					transform: translate(-50%, 0%);
					font-size: 22px;
				}
				.showErrorCode > .close {
					float: right;
					font-size: 22px;
					margin: 5px;
				}
				.errorCodeLine, .errorCodeLine > * {
					color: red !important;
				}
			`;
			document.body.appendChild(fullsize);
		},
		precontent: function() {
			//修改原生alert弹窗
			if(lib.config.extension_应用配置_replaceAlert) {
				window.alert = (message) => {
					dialog.showMessageBoxSync(remote.getCurrentWindow(), {
						title: '无名杀',
						message: message !== undefined ? (message + '') : '',
						icon: path.join(__dirname, 'noname.ico'),
						buttons: ['确定'],
						noLink: true
					});
				}
			}
			
			//修改原生confirm弹窗
			if(lib.config.extension_应用配置_replaceConfirm) {
				window.confirm = (message) => {
					const result = dialog.showMessageBoxSync(remote.getCurrentWindow(), {
						title: '无名杀',
						message: message !== undefined ? (message + '') : '',
						icon: path.join(__dirname, 'noname.ico'),
						buttons: ['确定', '取消'],
						noLink: true,
						cancelId: 1,
						defaultId: 0,
					});
					return result == 0;
				}
			}
			
			//导入因协议下载的扩展
			let extensionName = localStorage.getItem('download-extensionName');
			if(extensionName) {
				if(lib.config.extensions.contains(extensionName)) {
					localStorage.removeItem('download-extensionName');
				} else {
					_status.importingExtension = true;
					try {
						let str = lib.node.fs.readFileSync(__dirname + '/extension/' + extensionName + '/extension.js', {
							encoding: 'utf-8'
						});
						eval(str);
						// @ts-ignore
						if(!game.importedPack) throw '扩展代码格式错误';
						lib.config.extensions.add(extensionName);
						game.saveConfig('extensions', lib.config.extensions);
						game.saveConfig('extension_' + extensionName + '_enable', true);
						// @ts-ignore
						for (let i in game.importedPack.config) {
							// @ts-ignore
							if (game.importedPack.config[i] && game.importedPack.config[i].hasOwnProperty('init')) {
								// @ts-ignore
								game.saveConfig('extension_' + extensionName + '_' + i, game.importedPack.config[i].init);
							}
						}
						alert(`扩展【${extensionName}】导入成功！将为你自动重启`);
						localStorage.removeItem('download-extensionName');
						game.reload();
					} catch (e) {
						localStorage.removeItem('download-extensionName');
						dialog.showErrorBox("扩展代码有错误！", `${e}`);
					} finally {
						_status.importingExtension = false;
					}
				}
			}

			if (false) {
				/**
			 * 寻找错误文件的代码
			 * @param { string | undefined } src 
			 * @param { number } line 
			 * @param { number } column 
			 * @param { Error } err 
			 */
				function findErrorFileCode(src, line, column, err) {
					// @ts-ignore
					if (!window.hljs) return console.warn('hljs is not defind');
					// 暂停游戏
					_status.paused3 = true;

					console.log(_status.event);
					console.dir(err);

					/**
					 * 生成高亮代码
					 * @param { string } code 
					 */
					function createHighlightDom(code) {
						function ready() {
							// @ts-ignore
							hljs.initLineNumbersOnLoad();
							const pre = document.createElement('pre');
							pre.className = 'hljs language-javascript';
							pre.style.userSelect = 'text';
							pre.style.webkitUserSelect = 'text';
							pre.style.margin = '1em 10px';
							pre.innerHTML = code;
							// @ts-ignore
							hljs.highlightElement(pre);
							// @ts-ignore
							hljs.lineNumbersBlock(pre);
							// 通过setTimeout等待hljs.lineNumbersBlock执行完成
							setTimeout(() => {
								// 修改行号
								const trArray = [...pre.querySelectorAll('tr')];
								if (line > 5) {
									trArray.forEach((tr, i) => {
										// @ts-ignore
										tr.childNodes[0].dataset.lineNumber = String(line - 4 + i);
										// @ts-ignore
										tr.childNodes[0].childNodes[0].dataset.lineNumber = String(line - 4 + i);
										// @ts-ignore
										tr.childNodes[0].nextSibling.dataset.lineNumber = String(line - 4 + i);
										if (i == 4) {
											const td = tr.childNodes[1];
											// @ts-ignore
											td.classList.add('errorCodeLine');
										}
									});
								}
							}, 30);
							const path = require('path');
							const div = document.createElement('div');
							div.classList.add('showErrorCode');
							const txt = document.createElement('div');
							txt.classList.add('txt');
							txt.innerHTML = `
							错误信息: <span style="color: red;">${err?.message || 'undefined'}</span><br>
							${src ? ('错误文件: <a onclick="require(\'electron\').shell.openPath(\'' + decodeURI(src) + '\')" href="javascript:void(0);">' + path.relative(__dirname, decodeURI(src).slice(8)) + '</a><br>') : '注意: 此错误来源是经无名杀转译后的函数代码<br>'}
							行号: ${line}<br>
							列号: ${column}
						`;
							div.appendChild(txt);
							const close = document.createElement('button');
							close.innerText = '关闭';
							close.classList.add('close');
							close.addEventListener('click', () => {
								ui.window.removeChild(div);
								setTimeout(() => {
									if (!lib.config.errstop) {
										_status.withError = true;
										_status.paused3 = false;
										game.loop();
									}
								}, 500);
							});
							div.appendChild(close);
							div.appendChild(pre);
							ui.window.appendChild(div);
						}

						// @ts-ignore
						if (typeof hljs.initLineNumbersOnLoad == 'function') {
							ready();
						} else {
							lib.init.js('extension/应用配置', 'highlightjs-line-numbers.min', ready, () => { });
						}
					}

					if (typeof src == 'string') {
						// 协议名须和html一致，且文件是js
						if (!src.startsWith(location.protocol) || !src.endsWith('.js')) return;
						const fs = require('fs');
						// 去掉file:///
						const codes = fs.readFileSync(decodeURI(src).slice(8), 'utf8');
						const lines = codes.split("\n");

						// 设代码片段为10行，出错代码在5行。
						let showCode = '';
						if (lines.length >= 10) {
							if (line > 4) {
								for (let i = line - 5; i < line + 6 && i < lines.length; i++) {
									showCode += (lines[i] + '\n');
								}
							} else {
								for (let i = 0; i < line + 6 && i < lines.length; i++) {
									showCode += (lines[i] + '\n');
								}
							}
						} else {
							showCode = codes.toString();
						}
						createHighlightDom(showCode);
					} else {
						// 解析parsex里的content fun内容(通常是技能content)
						if (!err?.stack?.split('\n')[1].trim().startsWith('at Object.eval [as content]')) return;
						const codes = _status.event.content;
						if (typeof codes != 'function') return;
						/** @type { string[] } */
						const lines = codes.toString().split("\n");

						// 设代码片段为10行，出错代码在5行。
						let showCode = '';
						if (lines.length >= 10) {
							if (line > 4) {
								for (let i = line - 5; i < line + 6 && i < lines.length; i++) {
									showCode += (lines[i] + '\n');
								}
							} else {
								for (let i = 0; i < line + 6 && i < lines.length; i++) {
									showCode += (lines[i] + '\n');
								}
							}
						} else {
							showCode = codes.toString();
						}
						createHighlightDom(showCode);
					}
				};

				// 修改window.onerror
				window.onerror = function (msg, src, line, column, err) {
					let str = `错误文件: ${decodeURI(src) || 'undefined'}\n错误信息: ${msg}`;
					str += '\n' + `行号: ${line}`;
					str += '\n' + `列号: ${column}`;
					const version = lib.version || '';
					const reg = /[^\d\.]/;
					const match = version.match(reg) != null;
					str += '\n' + `${match ? '游戏' : '无名杀'}版本: ${version || '未知版本'}`;
					if (match) str += '\n您使用的游戏代码不是源于libccy/noname无名杀官方仓库，请自行寻找您所使用的游戏版本开发者反馈！';
					if (_status && _status.event) {
						let evt = _status.event;
						str += `\nevent.name: ${evt.name}\nevent.step: ${evt.step}`;
						if (evt.parent) str += `\nevent.parent.name: ${evt.parent.name}\nevent.parent.step: ${evt.parent.step}`;
						if (evt.parent && evt.parent.parent) str += `\nevent.parent.parent.name: ${evt.parent.parent.name}\nevent.parent.parent.step: ${evt.parent.parent.step}`;
						if (evt.player || evt.target || evt.source || evt.skill || evt.card) {
							str += '\n-------------'
						}
						if (evt.player) {
							if (lib.translate[evt.player.name]) str += `\nplayer: ${lib.translate[evt.player.name]}[${evt.player.name}]`;
							else str += '\nplayer: ' + evt.player.name;
							// @ts-ignore
							let distance = get.distance(_status.roundStart, evt.player, 'absolute');
							if (distance != Infinity) {
								str += `\n座位号: ${distance + 1}`;
							}
						}
						if (evt.target) {
							if (lib.translate[evt.target.name]) str += `\ntarget: ${lib.translate[evt.target.name]}[${evt.target.name}]`;
							else str += '\ntarget: ' + evt.target.name;
						}
						if (evt.source) {
							if (lib.translate[evt.source.name]) str += `\nsource: ${lib.translate[evt.source.name]}[${evt.source.name}]`;
							else str += '\nsource: ' + evt.source.name;
						}
						if (evt.skill) {
							if (lib.translate[evt.skill]) str += `\nskill: ${lib.translate[evt.skill]}[${evt.skill}]`;
							else str += '\nskill: ' + evt.skill;
						}
						if (evt.card) {
							if (lib.translate[evt.card.name]) str += `\ncard: ${lib.translate[evt.card.name]}[${evt.card.name}]`;
							else str += '\ncard: ' + evt.card.name;
						}
					}
					if (err && err.stack) str += '\n' + decodeURI(err.stack);
					alert(str);
					window.ea = Array.from(arguments);
					window.em = msg;
					window.el = line;
					window.ec = column;
					window.eo = err;
					game.print(msg);
					game.print(line);
					game.print(column);
					// @ts-ignore
					game.print(decodeURI(err?.stack));
					if (game.getExtensionConfig('应用配置', 'showErrorCode')) {
						// @ts-ignore
						findErrorFileCode(src || undefined, line, column, err);
					} else {
						if (!lib.config.errstop) {
							_status.withError = true;
							game.loop();
						}
					}
				};
			}
			
            if (lib.config.extension_应用配置_newExtApi) {
                //导入api.js
                Object.defineProperty(window, 'newExtensionApi', {
                    enumerable: false,
                    configurable: false,
                    get() {
                        return {
                            lib, game, ui, get, ai, _status
                        }
                    }
                });

                // 设置全局路径
                Object.defineProperty(window, 'newExtApiUrl', {
                    enumerable: false,
                    configurable: false,
                    get() {
                        return path.join(__dirname, 'extension/应用配置/export.js');
                    }
                });

			    lib.init.js('extension/应用配置', 'api');
            }
			
            if (lib.config.extension_应用配置_watchExt) {
                const fs = require('fs');
                fs.watch(__dirname + '/extension', {
                    persistent: true,
                    recursive: true
                }, (event, fileName) => {
                    if (!fileName) return;
                    const extName = fileName.slice(0, fileName.indexOf('\\'));
                    const file = fileName.slice(fileName.indexOf('\\') + 1);
                    // @ts-ignore
                    if (!game.importedPack &&
                        !lib.config.all.plays.includes(extName) && 
                        lib.config.extensions.includes(extName) && 
                        lib.config[`extension_${extName}_enable`] == true &&
                        (extName && file != 'updateContent') &&
                        !(extName == "拖拽读取" && fileName.slice(fileName.indexOf('\\') + 1) == "tmp.js") &&
						extName != '武将界面'
                    ) {
                        console.log(`监听到扩展文件改变，类别: ${event}，扩展名: ${extName}，文件路径: ${fileName} `);
                       // css改变的话，重新append css就行了
						if (fileName.endsWith('.css')) {
							const links = document.getElementsByTagName('link');
							for (const link of links) {
								const href = link.getAttribute('href') || '';
								if (path.join(href) == path.join(lib.assetURL, 'extension', fileName)) {
									link.remove();
									var style = document.createElement("link");
									style.rel = "stylesheet";
									style.href = path.join(lib.assetURL, 'extension', fileName);
									document.head.appendChild(style);
									console.log('style替换完成');
									break;
								}
							}
						} else if (fileName.endsWith('.js')) {
							const thisWindow = remote.getCurrentWindow();
							thisWindow.focus();
							game.reload();
						}
                    }
                });
            }

			if (!sessionStorage.getItem('setAppSize') && [lib.config.extension_应用配置_replaceAppWidth, lib.config.extension_应用配置_replaceAppHeight].every(v => !isNaN(Number(v)))) {
				sessionStorage.setItem('setAppSize', 'true');
				
				thisWindow.setSize(Number(lib.config.extension_应用配置_replaceAppWidth), Number(lib.config.extension_应用配置_replaceAppHeight), false);
				thisWindow.center();
			}
		},
		config: {
			//设置屏幕宽度
			replaceAppWidth: {
				init: '960',
				name: 'APP的宽度',
				input: true,
				onblur: function (e) {
					/**
					 * @type { HTMLDivElement }
					 */
					// @ts-ignore
					let target = e.target;
					let width = Number(target.innerText);
					if (isNaN(width)) {
						target.innerText = '960';
						width = 960;
					} else if (width < 200) {
						alert('暂时不允许将APP的宽度设置未小于200的数字');
						target.innerText = '960';
						width = 960;
					}
					game.saveExtensionConfig('应用配置', 'replaceAppWidth', width);
				},
			},
			//设置屏幕高度
			replaceAppHeight: {
				init: '660',
				name: 'APP的高度',
				input: true,
				onblur: function (e) {
					/**
					 * @type { HTMLDivElement }
					 */
					// @ts-ignore
					let target = e.target;
					let height = Number(target.innerText);
					if (isNaN(height)) {
						target.innerText = '660';
						height = 660;
					} else if (height < 200) {
						alert('暂时不允许将APP的高度设置未小于200的数字');
						target.innerText = '660';
						height = 660;
					}
					game.saveExtensionConfig('应用配置', 'replaceAppHeight', height);
				},
			},
			showErrorCode: {
				init: false,
				name: '报错时显示错误代码',
				intro: '开启此选项后，显示错误代码会阻塞无名杀代码执行',
				onclick: (result) => {
					// @ts-ignore
					if (!window.hljs && !(lib.config.extensions.includes('全能搜索') && game.getExtensionConfig('全能搜索', 'enable'))) {
						alert('此功能需要引入highlightjs才能使用(或者安装扩展"全能搜索"并开启)');
						game.saveExtensionConfig('应用配置', 'showErrorCode', false);
						return false;
					}
					alert('选项修改已生效');
					game.saveExtensionConfig('应用配置', 'showErrorCode', result);
				}
			},
			//修改原生alert弹窗
			replaceAlert: {
				init: true,
				name: '修改原生alert弹窗',
                onclick: (result) => {
					alert('修改选项后重启生效');
                    game.saveExtensionConfig('应用配置', 'replaceAlert', result);
				}
			},
			//修改原生confirm弹窗
			replaceConfirm: {
				init: true,
				name: '修改原生confirm弹窗',
                onclick: (result) => {
					alert('修改选项后重启生效');
                    game.saveExtensionConfig('应用配置', 'replaceConfirm', result);
				}
			},
            //新的扩展导入方式，用模块的方式写扩展
            newExtApi: {
                init: false,
                name: '新的扩展写法',
                onclick: (result) => {
                    alert('修改选项后重启生效');
                    game.saveExtensionConfig('应用配置', 'newExtApi', result);
                }
            },
            //监听扩展文件，改变后重启游戏
            watchExt: {
                init: false,
                name: '扩展文件改变重启',
                intro: '导入扩展时也会导致重启，但是完美兼容【拖拽读取】扩展的导入文件',
                onclick: (result) => {
                    alert('修改选项后重启生效');
                    game.saveExtensionConfig('应用配置', 'watchExt', result);
                }
            },
			//移除协议配置
			removeAsDefaultProtocol: {
				name: '<span style="text-decoration: underline;">卸载游戏前请点击此处移除协议配置<span>',
				clear: true,
				onclick: () => {
					const { app } = remote;
					const result = app.removeAsDefaultProtocolClient('nonameSkill');
					if(result) alert('移除协议配置成功');
					else alert('移除协议配置失败');
				},
			}
		},
		help: {},
		package: {
			intro: "本扩展是为了让此应用添加更多的功能，比如导入通过协议下载的扩展，请不要删除，否则通过协议下载的扩展不能自动在游戏里显示",
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.41",
		}
	}
});