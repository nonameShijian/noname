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
	for (let extensionName of ['拖拽读取', '在线更新', '应用配置']) {
		if(lib.node.fs.existsSync(path.join(__dirname, 'extension' , extensionName)) && !lib.config.extensions.contains(extensionName)) {
			console.log(`【应用配置】加载并保存了【${extensionName}】内置扩展`);
			lib.config.extensions.add(extensionName);
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
			
			//修改原生alert弹窗
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
			
			/*
			//导入api.js
			lib.cheat.i();
			lib.init.js('extension/应用配置', 'api', () => {
				if (!lib.config.dev) {
					delete window.ui;
					delete window.get;
					delete window.ai;
					delete window.lib;
					delete window._status;
				}
			});
			*/
		},
		config: {
			/*//打开代码编辑器
			openEditor: {
				name: '<span style="text-decoration: underline;">打开VSCode代码编辑器<span>',
				clear: true,
				onclick: () => {
					const createEditorWindow = remote.getGlobal('createEditorWindow');
					if (createEditorWindow) {
						createEditorWindow();
					}
				},
			},*/
			//修改原生alert弹窗
			replaceAlert: {
				init: true,
				name: '修改原生alert弹窗',
				onclick: () => {
					alert('修改选项后重启生效');
				}
			},
			//修改原生confirm弹窗
			replaceConfirm: {
				init: true,
				name: '修改原生confirm弹窗',
				onclick: () => {
					alert('修改选项后重启生效');
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
			version: "1.12",
		}
	}
});