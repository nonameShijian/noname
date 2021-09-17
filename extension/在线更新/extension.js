"use strict";
game.import("extension", function(lib, game, ui, get, ai, _status) {
	return {
		name: "在线更新",
		editable: false,
		content: function(config, pack) {
			lib.updateURLS.github = 'https://raw.fastgit.org/libccy/noname';
			//lib.updateURL = 'https://raw.fastgit.org/libccy/noname';
		},
		precontent: function() {},
		config: {
			checkForUpdate: {
				//检查游戏更新
				clear: true,
				intro: '点击检查游戏更新',
				name: '<button type="button">检查游戏更新</button>',
				onclick: function() {
					if (game.Updating) return;
					game.Updating = true;
					let updateURL = lib.updateURL + '/master/';
					let reduction = () => {
						game.Updating = false;
						this.childNodes[0].innerHTML = '<button type="button">检查游戏更新</button>';
					};
					let button = this.childNodes[0].childNodes[0];

					let DownloadingFiles = null;

					window.addEventListener('beforeunload', () => {
						if (DownloadingFiles) game.removeFile(DownloadingFiles.replace(updateURL, ''))
					});

					if (button.disabled) {
						return;
					} else if (!game.download) {
						return alert('此版本不支持游戏内更新，请手动更新');
					} else {
						button.innerHTML = '正在检查更新';
						button.disabled = true;
						fetch(`${updateURL}game/update.js`)
							.then(response => response.text())
							.then(text => {
								//赋值window.noname_update
								try {
									eval(text);
								} catch (e) {
									game.Updating = false;
									button.innerHTML = '检查游戏更新';
									button.disabled = false;
									return alert('更新内容获取失败，请重试');
								}
								let update = window.noname_update;
								delete window.noname_update;
								game.saveConfig('check_version', update.version);
								if (update.version == lib.version) {
									//要更新的版本和现有的版本一致
									if (!confirm('当前版本已经是最新，是否继续更新？')) {
										game.Updating = false;
										button.innerHTML = '检查游戏更新';
										button.disabled = false;
										return;
									}
								}
								let files = null;
								let version = lib.version;

								let goupdate = (files, update) => {
									lib.version = update.version;
									fetch(`${updateURL}game/source.js`)
										.then(response => response.text())
										.then(text => {
											try {
												eval(text);
											} catch (e) {
												game.Updating = false;
												button.innerHTML = '检查游戏更新';
												button.disabled = false;
												return alert('source.js获取失败，请重试');
											}
											let updates = window.noname_source_list;
											delete window.noname_source_list;

											if (!game.getExtensionConfig('在线更新', 'updateAll') && Array.isArray(files)) {
												files.add('game/update.js');
												let files2 = [];
												for (let i = 0; i < files.length; i++) {
													let str = files[i].indexOf('*');
													if (str != -1) {
														str = files[i].slice(0, str);
														files.splice(i--, 1);
														for (let j = 0; j < updates.length; j++) {
															if (updates[j].indexOf(str) == 0) {
																files2.push(updates[j]);
															}
														}
													}
												}
												updates = files.concat(files2);
											}

											for (let i = 0; i < updates.length; i++) {
												if (updates[i].indexOf('node_modules/') == 0 /*&& !update.node*/ ) {
													//只有电脑端用，没有nodejs环境跳过
													if (!lib.node || !lib.node.fs) {
														updates.splice(i--, 1);
														continue;
													};
													let entry = updates[i];
													lib.node.fs.access(__dirname + '/' + entry, function(err) {
														if (!err) {
															let stat = lib.node.fs.statSync(__dirname + '/' + entry);
															if (stat.size == 0) {
																err = true;
															}
														}
														if (!err) {
															updates.splice(i--, 1);
														}
													});
												}
											}

											button.remove();

											let consoleMenu = document.createElement('button');
											consoleMenu.setAttribute('type', 'button');
											consoleMenu.innerHTML = '跳转到命令页面';
											consoleMenu.onclick = ui.click.consoleMenu;
											this.childNodes[0].appendChild(consoleMenu);

											this.childNodes[0].appendChild(document.createElement('br'));

											let span = document.createElement('span');
											let n1 = 0;
											let n2 = updates.length;
											span.innerHTML = `正在下载文件（${n1}/${n2}）`;
											this.childNodes[0].appendChild(span);

											let downloadFile = (current, current2, onsuccess, onerror) => {
												game.removeFile(current);
												let reload = (err) => {
													typeof err != 'undefined' && typeof err != 'boolean' && console.error(err);
													typeof onerror == "function" && onerror(current, !!err);
													setTimeout(() => {
														let str1 = "正在下载：";
														let current3 = current.replace(updateURL, '');

														if (current3.indexOf('theme') == 0) {
															game.print(str1 + current3.slice(6));
														} else if (current3.indexOf('image/skin') == 0) {
															game.print(str1 + current3.slice(11));
														} else {
															game.print(str1 + current3.slice(current3.lastIndexOf('/') + 1));
														}

														DownloadingFiles = current;
														downloadFile(current, current2, onsuccess, onerror);
													}, 500);
												};
												let contrast = () => {
													if (lib.node && lib.node.fs) {
														game.readFile(current, (result) => {
															if ("Too Many Requests" === result.toString()) {
																reload();
															} else {
																typeof onsuccess == "function" && onsuccess(current);
															}
														}, reload);
													} else if (window.cordova) {
														window.resolveLocalFileSystemURL(lib.assetURL, function(entry) {
															entry.getFile(current, {}, function(fileEntry) {
																fileEntry.file(function(fileToLoad) {
																	var fileReader = new FileReader();
																	fileReader.onload = function(e) {
																		let str = e.target.result;
																		if ("Too Many Requests" === str) {
																			reload();
																		} else {
																			typeof onsuccess == "function" && onsuccess(current);
																		}
																	};
																	fileReader.readAsText(fileToLoad, "UTF-8");
																}, reload);
															}, reload);
														}, reload);
													}
												}
												try {
													game.download(current, current2, () => {
														contrast();
													}, reload, false);
												} catch (e) {
													reload(e);
												}
											};

											let multiDownload = (list, onsuccess, onerror, onfinish) => {
												list = list.slice(0);
												let download = () => {
													if (list.length) {
														let current = list.shift();
														let current2 = current;
														let str1 = "正在下载：";

														if (current.indexOf('theme') == 0) {
															game.print(str1 + current.slice(6));
														} else if (current.indexOf('image/skin') == 0) {
															game.print(str1 + current.slice(11));
														} else {
															game.print(str1 + current.slice(current.lastIndexOf('/') + 1));
														}

														DownloadingFiles = current;

														downloadFile(current, current2, () => {
															typeof onsuccess == "function" && onsuccess(current);
															download();
														}, onerror);

													} else {
														typeof onfinish == "function" && onfinish();
													}
												};
												download();
											};

											multiDownload(updates, (current) => {
												game.print(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
												n1++;
												span.innerHTML = `正在下载文件（${n1}/${n2}）`;
											}, (current, requests) => {
												let str;
												if (requests) {
													str = `下载${current}失败(请求太多)，尝试重新下载`;
												} else {
													str = `下载${current}失败，尝试重新下载`;
												}
												game.print(str);
												console.error(str);
											}, () => {
												span.innerHTML = `游戏更新完毕（${n1}/${n2}）`;
												setTimeout(() => {
													alert('更新完成');
													consoleMenu.remove();
													DownloadingFiles = null;
													this.childNodes[0].appendChild(document.createElement('br'));
													let button2 = document.createElement('button');
													button2.innerHTML = '重新启动';
													button2.onclick = game.reload;
													button2.style.marginTop = '8px';
													this.childNodes[0].appendChild(button2);
												}, 1000);
											});
										})
										.catch(err => {
											console.error(err);
											game.print(err);
											reduction();
										});
								};

								if (Array.isArray(update.files) && update.update) {
									let version1 = version.split('.');
									//当前游戏版本
									let version2 = update.update.split('.');
									//update里要更新的版本，如果当前游戏版本是这个版本，就只更新update.files里的内容
									for (let i = 0; i < version1.length && i < version2.length; i++) {
										if (version2[i] > version1[i]) {
											files = false;
											break;
										} else if (version1[i] > version2[i]) {
											files = update.files.slice(0);
											break;
										}
									}
									if (files === null) {
										if (version1.length >= version2.length) {
											files = update.files.slice(0);
										}
									}
								}
								let str = '有新版本' + update.version + '可用，是否下载？';
								if (navigator.notification && navigator.notification.confirm) {
									let str2 = update.changeLog[0];
									for (let i = 1; i < update.changeLog.length; i++) {
										if (update.changeLog[i].indexOf('://') == -1) {
											str2 += '；' + update.changeLog[i];
										}
									}
									navigator.notification.confirm(
										str2,
										function(index) {
											if (index == 1) {
												goupdate(files, update);
											} else {
												game.Updating = false;
												button.innerHTML = '检查游戏更新';
												button.disabled = false;
											}
										},
										str,
										['确定', '取消']
									);
								} else {
									if (confirm(str)) {
										goupdate(files, update);
									} else {
										game.Updating = false;
										button.innerHTML = '检查游戏更新';
										button.disabled = false;
									}
								}
							})
							.catch(err => {
								console.error(err);
								game.print(err);
								reduction();
							});
					}
				},
			},
			updateAll: {
				init: false,
				intro: '更新游戏时，下载所有主要文件（不包括素材），如果你自行修改了无名杀本体的theme等文件夹下的素材，建议不要开启此选项',
				name: '强制更新所有主文件',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'updateAll', bool);
				}
			},
			br: {
				clear: true,
				nopointer: true,
				name: '</br>--------------------',
			},
			checkForAssetUpdate: {
				//检查素材更新
				clear: true,
				intro: '点击检查素材更新',
				name: '<button type="button">检查素材更新</button>',
				onclick: function() {
					if (game.UpdatingForAsset) return;
					game.UpdatingForAsset = true;
					let updateURL = lib.updateURL + '/master/';
					let reduction = () => {
						game.UpdatingForAsset = false;
						this.childNodes[0].innerHTML = '<button type="button">检查素材更新</button>';
					};
					let button = this.childNodes[0].childNodes[0];

					let DownloadingFiles = null;

					window.addEventListener('beforeunload', () => {
						if (DownloadingFiles) game.removeFile(DownloadingFiles.replace(updateURL, ''))
					});

					if (button.disabled) {
						return;
					} else if (!game.download) {
						return alert('此版本不支持游戏内更新，请手动更新');
					} else {
						button.innerHTML = '正在检查更新';
						button.disabled = true;
						fetch(`${updateURL}game/asset.js`)
							.then(response => response.text())
							.then(text => {
								//赋值window.noname_asset_list
								//和window.noname_skin_list
								try {
									eval(text);
								} catch (e) {
									game.UpdatingForAsset = false;
									button.innerHTML = '检查素材更新';
									button.disabled = false;
									return alert('更新内容获取失败，请重试');
								}

								let updates = window.noname_asset_list;
								delete window.noname_asset_list;
								let skins = window.noname_skin_list;
								delete window.noname_skin_list;
								let asset_version = updates.shift();
								let skipcharacter = []
								let skipcard = []; //['tiesuo_mark'];
								//如果没选择【检查图片素材】（全部）
								if (!game.getExtensionConfig('在线更新', 'assetImageFull')) {
									for (let i = 0; i < lib.config.all.sgscharacters.length; i++) {
										let pack = lib.characterPack[lib.config.all.sgscharacters[i]];
										for (let j in pack) {
											skipcharacter.add(j);
										}
									}
									for (let i = 0; i < lib.config.all.sgscards.length; i++) {
										let pack = lib.cardPack[lib.config.all.sgscards[i]];
										if (pack) {
											skipcard = skipcard.concat(pack);
										}
									}
								}

								for (let i = 0; i < updates.length; i++) {
									switch (updates[i].slice(0, 5)) {
										case 'image':
											//如果没选择检查图片更新（全部）
											if (!game.getExtensionConfig('在线更新', 'assetImageFull')) {
												//如果没选择检查图片更新（部分）
												if (!game.getExtensionConfig('在线更新', 'assetImage')) {
													//跳过
													updates.splice(i--, 1);
												} else {
													//更新部分素材
													if (updates[i].indexOf('image/character') == 0) {
														if (updates[i].indexOf('jun_') != 16 && updates[i].indexOf('gz_') != 16 && !skipcharacter.contains(
																updates[i].slice(16, updates[i].lastIndexOf('.')))) {
															updates.splice(i--, 1);
														}
													} else if (updates[i].indexOf('image/card') == 0) {
														if (updates[i].indexOf('qiaosi_card') != 11 && !skipcard.contains(updates[i].slice(11, updates[i].lastIndexOf(
																'.')))) {
															updates.splice(i--, 1);
														}
													} else if (updates[i].indexOf('image/mode/stone') == 0) {
														updates.splice(i--, 1);
													}
												}
											}
											break;
										case 'audio':
											if (!game.getExtensionConfig('在线更新', 'assetAudio')) {
												updates.splice(i--, 1);
											}
											break;

										case 'font/':
											if (!game.getExtensionConfig('在线更新', 'assetFont')) {
												updates.splice(i--, 1);
											}

									}
								}

								if (game.getExtensionConfig('在线更新', 'assetSkin')) {
									//如果更新素材
									for (let i in skins) {
										for (let j = 1; j <= skins[i]; j++) {
											updates.push('image/skin/' + i + '/' + j + '.jpg');
										}
									}
								}

								let downloadFile = (current, current2, onsuccess, onerror) => {
									game.removeFile(current);
									let reload = (err) => {
										typeof err != 'undefined' && typeof err != 'boolean' && console.error(err);
										typeof onerror == "function" && onerror(current, !!err);
										setTimeout(() => {
											let str1 = "正在下载：";
											let current3 = current.replace(updateURL, '');

											if (current3.indexOf('theme') == 0) {
												game.print(str1 + current3.slice(6));
											} else if (current3.indexOf('image/skin') == 0) {
												game.print(str1 + current3.slice(11));
											} else {
												game.print(str1 + current3.slice(current3.lastIndexOf('/') + 1));
											}

											DownloadingFiles = current;
											downloadFile(current, current2, onsuccess, onerror);
										}, 500);
									};
									let contrast = () => {
										if (lib.node && lib.node.fs) {
											game.readFile(current, (result) => {
												if ("Too Many Requests" === result.toString()) {
													reload();
												} else {
													typeof onsuccess == "function" && onsuccess(current);
												}
											}, reload);
										} else if (window.cordova) {
											window.resolveLocalFileSystemURL(lib.assetURL, function(entry) {
												entry.getFile(current, {}, function(fileEntry) {
													fileEntry.file(function(fileToLoad) {
														var fileReader = new FileReader();
														fileReader.onload = function(e) {
															let str = e.target.result;
															if ("Too Many Requests" === str) {
																reload();
															} else {
																typeof onsuccess == "function" && onsuccess(current);
															}
														};
														fileReader.readAsText(fileToLoad, "UTF-8");
													}, reload);
												}, reload);
											}, reload);
										}
									}
									try {
										game.download(current, current2, () => {
											contrast();
										}, reload, false);
									} catch (e) {
										reload(e);
									}
								};

								let multiDownload = (list, onsuccess, onerror, onfinish) => {
									list = list.slice(0);
									let download = () => {
										if (list.length) {
											let current = list.shift();
											let current2 = current;
											let str1 = "正在下载：";

											if (current.indexOf('theme') == 0) {
												game.print(str1 + current.slice(6));
											} else if (current.indexOf('image/skin') == 0) {
												game.print(str1 + current.slice(11));
											} else {
												game.print(str1 + current.slice(current.lastIndexOf('/') + 1));
											}

											DownloadingFiles = current;

											downloadFile(current, current2, () => {
												typeof onsuccess == "function" && onsuccess(current);
												download();
											}, onerror);

										} else {
											typeof onfinish == "function" && onfinish();
										}
									};
									download();
								};

								let proceed = () => {
									if (updates.length == 0) {
										game.saveConfig('asset_version', asset_version);
										alert('素材已是最新');
										game.UpdatingForAsset = false;
										button.innerHTML = '正在检查更新';
										button.disabled = false;
										return;
									}
									button.remove();
									let consoleMenu = document.createElement('button');
									consoleMenu.setAttribute('type', 'button');
									consoleMenu.innerHTML = '跳转到命令页面';
									consoleMenu.onclick = ui.click.consoleMenu;
									this.childNodes[0].appendChild(consoleMenu);
									this.childNodes[0].appendChild(document.createElement('br'));
									let span = document.createElement('span');
									span.style.whiteSpace = 'nowrap';
									let n1 = 0;
									let n2 = updates.length;
									span.innerHTML = `正在下载素材（${n1}/${n2}）`;
									this.childNodes[0].appendChild(span);

									multiDownload(updates, (current) => {
										game.print(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
										n1++;
										span.innerHTML = `正在下载文件（${n1}/${n2}）`;
									}, (current, requests) => {
										let str;
										if (requests) {
											str = `下载${current}失败(请求太多)，尝试重新下载`;
										} else {
											str = `下载${current}失败，尝试重新下载`;
										}
										game.print(str);
										console.error(str);
									}, () => {
										span.innerHTML = `素材更新完毕（${n1}/${n2}）`;
										setTimeout(() => {
											alert('更新完成');
											DownloadingFiles = null;
											consoleMenu.remove();
											this.childNodes[0].appendChild(document.createElement('br'));
											let button2 = document.createElement('button');
											button2.innerHTML = '重新启动';
											button2.onclick = game.reload;
											button2.style.marginTop = '8px';
											this.childNodes[0].appendChild(button2);
										}, 1000);
									});
								};

								let checkFileList = (updates, proceed) => {
									let n = updates.length;
									if (!n) {
										proceed(n);
									}
									for (let i = 0; i < updates.length; i++) {
										if (lib.node && lib.node.fs) {
											let err = false;
											let entry = updates[i];
											if (lib.node.fs.existsSync(__dirname + '/' + entry)) {
												//如果有文件/文件夹，判断大小
												let stat = lib.node.fs.statSync(__dirname + '/' + entry);
												if (stat.size == 0) {
													err = true;
												}
											} else {
												//没有文件/文件夹
												err = true;
											}
											if (err) {
												n--;
												if (n == 0) {
													proceed();
												}
											} else {
												n--;
												updates.remove(entry);
												if (n == 0) {
													proceed();
												}
											}
										} else {
											window.resolveLocalFileSystemURL(lib.assetURL + updates[i], (name => {
												return (entry) => {
													n--;
													updates.remove(name);
													if (n == 0) {
														proceed();
													}
												}
											})(updates[i]), () => {
												n--;
												if (n == 0) {
													proceed();
												}
											});
										}
									}
								};

								checkFileList(updates, proceed);
							})
							.catch(err => {
								console.error(err);
								game.print(err);
								reduction();
							});
					}
				},
			},
			assetFont: {
				init: true,
				intro: '检查更新时，检查字体文件',
				name: '检查字体素材',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'assetFont', bool);
				}
			},
			assetAudio: {
				init: true,
				intro: '检查更新时，检查音频文件',
				name: '检查音频素材',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'assetAudio', bool);
				}
			},
			assetSkin: {
				init: false,
				intro: '检查更新时，检查皮肤文件',
				name: '检查皮肤素材',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'assetSkin', bool);
				}
			},
			assetImage: {
				init: true,
				intro: '检查更新时，检查图片文件(部分)',
				name: '检查图片素材(部分)',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'assetImage', bool);
				}
			},
			assetImageFull: {
				init: true,
				intro: '检查更新时，检查图片文件(全部)',
				name: '检查图片素材(全部)',
				onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'assetImageFull', bool);
				}
			},
			br2: {
				//为了和最下面的删除扩展区分开
				clear: true,
				nopointer: true,
				name: '</br>--------------------',
			},
		},
		help: {},
		package: {
			character: {
				character: {},
				translate: {},
			},
			card: {
				card: {},
				translate: {},
				list: [],
			},
			skill: {
				skill: {},
				translate: {},
			},
			intro: "点击按钮即可在线更新，文件下载失败会自动重新下载。</br>点击按钮后若短时间内没反应可以重启游戏，请不要重复点击以免bug",
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.1",
		},
		files: {
			"character": [],
			"card": [],
			"skill": []
		}
	}
});
