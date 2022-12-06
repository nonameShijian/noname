/// <reference path="../../typings/index.d.ts" />
"use strict";
game.import("extension", function(lib, game, ui, get, ai, _status) {
	const { versions } = process;
	const electronVersion = parseFloat(versions.electron);
	
	if (isNaN(electronVersion) || electronVersion < 13) {
		throw '此版本应用不适用【应用配置】';
	}
	
	const path = require('path');
	let remote;
	if (electronVersion >= 14) {
		remote =  require('@electron/remote');
		lib.node.debug = () => {
			remote.getCurrentWindow().toggleDevTools();
		};
	} else {
		remote = require('electron').remote;
	}
	const { dialog } = remote;
	
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
			
			//让无名杀控制台内的文字可选中
			const fullsize = document.createElement('style');
			fullsize.innerText = `
			/* 让无名杀控制台内的文字可选中 */
			.fullsize {
				user-select: text;
				-webkit-user-select: text;
			}`;
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
						if(!game.importedPack) throw '扩展代码格式错误';
						lib.config.extensions.add(extensionName);
						game.saveConfig('extensions', lib.config.extensions);
						game.saveConfig('extension_' + extensionName + '_enable', true);
						for (let i in game.importedPack.config) {
							if (game.importedPack.config[i] && game.importedPack.config[i].hasOwnProperty('init')) {
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

            // 修改window.onerror
            window.onerror = function (msg, src, line, column, err) {
                let str = `错误文件: ${ decodeURI(src) || 'undefined' }\n错误信息: ${msg}`;
                str += '\n' + `行号: ${line}`;
                str += '\n' + `列号: ${column}`;
				let print = false;
                if (window._status && _status.event) {
                    let evt = _status.event;
                    str += `\nevent.name: ${evt.name}\nevent.step: ${evt.step}`;
                    if (evt.parent) str += `\nevent.parent.name: ${evt.parent.name}\nevent.parent.step: ${evt.parent.step}`;
                    if (evt.parent && evt.parent.parent) str += `\nevent.parent.parent.name: ${evt.parent.parent.name}\nevent.parent.parent.step: ${evt.parent.parent.step}`;
                    if (evt.player || evt.target || evt.source || evt.skill || evt.card) {
                        str += '\n-------------'
                    }
					if (evt.player && lib.translate[evt.player.name]) {
                        str += `\nplayer: ${lib.translate[evt.player.name]}[${evt.player.name}]`;
                        let distance = get.distance(_status.roundStart, evt.player, 'absolute');
                        if (distance != Infinity) {
                            str += `\n座位号: ${distance + 1}`;
                        }
						print = true;
                    }
					if (evt.target && lib.translate[evt.target.name]) {
                        str += `\ntarget: ${lib.translate[evt.target.name]}[${evt.target.name}]`;
						print = true;
                    }
					if (evt.source && lib.translate[evt.source.name]) {
                        str += `\nsource: ${lib.translate[evt.source.name]}[${evt.source.name}]`;
						print = true;
                    }
					if (evt.skill && lib.translate[evt.skill]) {
                        str += `\nskill: ${lib.translate[evt.skill]}[${evt.skill}]`;
						print = true;
                    }
					if (evt.card && lib.translate[evt.card.name]) {
                        str += `\ncard: ${lib.translate[evt.card.name]}[${evt.card.name}]`;
						print = true;
                    }
                }
				if (!print) {
					str += '\n-------------';
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
                game.print(decodeURI(err.stack));
                if (!lib.config.errstop) {
                    _status.withError = true;
                    game.loop();
                }
            };
			
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
                    
                    if (!game.importedPack && 
                        !lib.config.all.plays.includes(extName) && 
                        lib.config.extensions.includes(extName) && 
                        lib.config[`extension_${extName}_enable`] == true &&
                        (extName && file != 'updateContent') &&
                        !(extName == "拖拽读取" && fileName.slice(fileName.indexOf('\\') + 1) == "tmp.js")
                    ) {
                        console.log(`监听到扩展文件改变，类别: ${event}，扩展名: ${extName}，文件路径: ${fileName} `);
                        // 符合条件，重启游戏
                        const thisWindow = remote.getCurrentWindow();
                        thisWindow.focus();
                        game.reload();
                    }
                });
            }

			if (!sessionStorage.getItem('setAppSize') && [lib.config.extension_应用配置_replaceAppWidth, lib.config.extension_应用配置_replaceAppHeight].every(v => !isNaN(Number(v)))) {
				sessionStorage.setItem('setAppSize', 'true');
				const thisWindow = remote.getCurrentWindow();
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
			version: "1.22",
		}
	}
});