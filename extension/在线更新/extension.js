/// <reference path="./typings/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />
// @ts-check
game.import("extension", function (lib, game, ui, get, ai, _status) {

	if (!game.getExtensionConfig('在线更新', 'incompatibleExtension') && game.getExtensionConfig('假装无敌', 'enable')) {
		alert('【在线更新】扩展提示您：\r\n【假装无敌】扩展也覆盖了游戏内的检查更新按钮，使用时请注意避免出现bug。');
		game.saveExtensionConfig('在线更新', 'incompatibleExtension', true);
	}

	/**
	 * 创建fetch连接
	 * @param { string } url 资源请求地址
	 * @param { fetchOptions } options 配置
	 * @returns { Promise<Response> }
	 */
	function myFetch(url, options = { timeout: typeof game.getExtensionConfig('在线更新', 'timeout') == 'number' ? game.getExtensionConfig('在线更新', 'timeout') : 5000 }) {
		return new Promise((resolve, reject) => {
			/** @type { AbortController | undefined } */
			let myAbortController;
			/** @type { AbortSignal | undefined } */
			let signal = undefined;

			if (typeof window.AbortController == 'function') {
				if (options.timeout > 0) {
					myAbortController = new AbortController();
					signal = myAbortController.signal;
					// @ts-ignore
					setTimeout(() => myAbortController.abort(), options.timeout);
				}
			} else {
				console.warn('设备不支持AbortController');
			}

			fetch(url, { signal }).then(response => {
				if (response.redirected) {
					console.warn(`${url}\n请求已被重定向为:\n${response.url}`);
				}
				if (!response.ok) {
					return reject(response);
				}
				resolve(response);
			}).catch(reject);
		});
	};

	/**
	 * 判断是否能进行更新(即是否能连接上百度)
	 * @returns { Promise<number | void> }
	 */
	function canUpdate() {
		return new Promise((resolve, reject) => {
			myFetch(`https://www.baidu.com?date=${(new Date()).getTime()}`).then(response => {
				// 304: 自上次访问以来，请求的资源未被修改
				if (response.status == 200 || response.status == 304) {
					console.log('连接百度成功，状态码: ' + response.status);
					resolve();
				} else {
					reject(response.status);
				}
			}).catch(err => reject(err));
		});
	}

	/**
	 * 字节转kb,mb等
	 * @param { number } limit 
	 */
	function parseSize(limit) {
		let size = "";
		if (limit < 1 * 1024) {
			// 小于1KB，则转化成B
			size = limit.toFixed(2) + "B"
		} else if (limit < 1 * 1024 * 1024) {
			// 小于1MB，则转化成KB
			size = (limit / 1024).toFixed(2) + "KB"
		} else if (limit < 1 * 1024 * 1024 * 1024) {
			// 小于1GB，则转化成MB
			size = (limit / (1024 * 1024)).toFixed(2) + "MB"
		} else {
			// 其他转化成GB
			size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
		}

		// 转成字符串
		let sizeStr = size + "";
		// 获取小数点处的索引
		let index = sizeStr.indexOf(".");
		// 获取小数点后两位的值
		let dou = sizeStr.slice(index + 1, 2);
		// 判断后两位是否为00，如果是则删除00
		if (dou == "00") {
			return sizeStr.slice(0, index) + sizeStr.slice(index + 3, 2);
		}
		return size;
	};

	const assetConfigFun = function (configName) {
		return function (bool) {
			game.saveExtensionConfig('在线更新', configName, bool);
		}
	};

	/**
	 * @description 请求错误处理
	 * @param { { url: string, error: number | Error, message: string } | Error | String } err 
	 */
	const response_catch = err => {
		console.error(err);
		game.print(err);
		if (typeof err === 'object' && !(err instanceof Error)) {
			const { url, error, message } = err;
			if (typeof url !== 'undefined' && typeof error !== 'undefined' && typeof message !== 'undefined') {
				const translate = {
					coding: 'Coding',
					github: 'GitHub',
					fastgit: 'GitHub镜像',
					// xuanwu: '玄武镜像'
					URC: 'URC'
				};
				let url_in_updateURLS;
				for (const updateURL in lib.updateURLS) {
					if (url.startsWith(lib.updateURLS[updateURL])) {
						url_in_updateURLS = translate[updateURL];
						break;
					}
				}
				if (url_in_updateURLS) {
					alert(`更新源:${url_in_updateURLS}\n网络请求目标：${url.replace(lib.updateURL + '/master/', '')}\n${error instanceof window.ProgressEvent ? '' : ('状态消息或状态码：' + error + '\n')}提示:${message}`);
				} else {
					alert(`网络请求目标：${url}\n${error instanceof window.ProgressEvent ? '' : ('状态消息或状态码：' + error + '\n')}提示:${message}`);
				}
			}
		} else if (err instanceof Error) {
			if (err.name === 'AbortError') {
				alert('网络连接超时');
			} else if (err.message == 'Failed to fetch') {
				alert('网络请求失败');
			} else {
				alert(err.message);
			}
		} else if (typeof err == 'string') {
			alert(err);
		}
		if (++game.updateErrors > 5) {
			alert('检测到获取更新失败次数过多，建议您更换无名杀的更新源');
			game.updateErrors = 0;
		}
	};

	return {
		name: "在线更新",
		editable: false,
		onremove: function () {
			// 删除本扩展后，更新源改回coding
			lib.updateURL = lib.updateURLS.coding;
			game.saveConfig('update_link', 'coding');
			// 取消监听
			window.removeEventListener('beforeunload', window.saveBrokenFile);
		},
		content: function (config, pack) {
			if (game.getExtensionConfig('在线更新', 'rewriteUpdateButton')) {
				// 替换无名杀自带的更新功能
				// 取消复选框和扩展的绑定
				const { checkForUpdate, checkForAssetUpdate } = this[4].code.config;

				/** @type HTMLButtonElement */
				let updateButton;
				/** @type HTMLButtonElement */
				let assetUpdateButton;

				const interval = setInterval(() => {
					if (typeof game.download != 'function' || typeof game.writeFile != 'function') return clearInterval(interval);
					if (!ui.menuContainer || !ui.menuContainer.firstElementChild) return;
					const menu = ui.menuContainer.firstElementChild;
					/** @type HTMLDivElement[] */
					// @ts-ignore
					const active = [...menu.querySelectorAll('.active')];
					if (active.length < 2) return;
					if (active[0].innerText != '其它' || active[1].innerText != '更新') return;
					/** @type Element */
					// @ts-ignore
					const help = menu.querySelector('.menu-help');
					const liArray = Array.from(help.querySelectorAll('li'));
					if (!liArray.length) return;

					try {
						// @ts-ignore
						updateButton = liArray[0].childNodes[1].firstElementChild;
						// @ts-ignore
						assetUpdateButton = liArray[1].childNodes[1].firstElementChild;
					} catch (error) {
						console.log("获取按钮异常：", {
							error,
							liArray,
							updateButton,
							assetUpdateButton
						});
						clearInterval(interval);
						return alert('【在线更新】扩展提示您：\r\n获取按钮异常,覆盖游戏更新操作失败');
					}

					if (
						updateButton && updateButton.innerText == "检查游戏更新"
						&&
						assetUpdateButton && assetUpdateButton.innerText == "检查素材更新"
					) {
						updateButton.onclick = checkForUpdate.onclick.bind(updateButton);
						assetUpdateButton.onclick = checkForAssetUpdate.onclick.bind(assetUpdateButton);
					} else {
						console.log("获取按钮异常：", {
							liArray,
							updateButton,
							assetUpdateButton
						});
						clearInterval(interval);
						return alert('【在线更新】扩展提示您：\r\n获取按钮异常,覆盖游戏更新操作失败');
					}

					// 插入一条修改说明
					const ul = help.querySelector('ul');
					/** @type HTMLUListElement  */
					// @ts-ignore
					const insertLi = ul.insertBefore(document.createElement('li'), ul.firstElementChild);
					insertLi.innerHTML = "<span class='bluetext'>更新功能已由【在线更新】扩展覆盖</span></br>";
					// a标签跳转到扩展界面
					const jumpToExt = document.createElement('a');
					jumpToExt.href = "javascript:void(0)";
					jumpToExt.onclick = () => ui.click.extensionTab('在线更新');

					HTMLDivElement.prototype.css.call(jumpToExt, {
						color: 'white',
						innerHTML: '点击跳转至扩展界面'
					});

					insertLi.appendChild(jumpToExt);

					clearInterval(interval);
					console.log("【在线更新】扩展已修改更新界面");
				}, 500);
			}

			// 重启前下载失败的文件名(去除重复的)
			if (!Array.isArray(lib.config.extension_在线更新_brokenFile)) {
				game.saveExtensionConfig('在线更新', 'brokenFile', []);
			} else {
				game.saveExtensionConfig('在线更新', 'brokenFile', Array.from(new Set([...lib.config.extension_在线更新_brokenFile])));
			}

			// 如果有没下载完就重启的文件
			let brokenFileArr = lib.config.extension_在线更新_brokenFile;
			window.saveBrokenFile = () => {
				game.saveExtensionConfig('在线更新', 'brokenFile', [...new Set(brokenFileArr)]);
			};
			window.addEventListener('beforeunload', window.saveBrokenFile);
			if (brokenFileArr && brokenFileArr.length) {
				// 改为用setTimeout，因为刚开启时候的网络请求不会成功
				setTimeout(() => {
					if (confirm(`检测到有未下载成功的文件(${brokenFileArr})，是否进行重新下载?`)) {
						console.log('未下载成功的文件：', brokenFileArr);
						// 复制文件数组，用来和进度绑定
						const copyList = [...brokenFileArr];
						// 当前下载进度
						let index = 0;
						// 创建下载进度div
						const progress = game.shijianCreateProgress('重新下载', copyList.length, copyList[0], index);
						document.body.appendChild(progress);
						// 下载之前保留下载列表
						brokenFileArr.forEach(v => lib.config.extension_在线更新_brokenFile.add(v));
						game.saveConfigValue('extension_在线更新_brokenFile');
						game.shijianMultiDownload(brokenFileArr, (fileNameList) => {
							// 下载成功，更新进度
							progress.setProgressValue(++index);
							progress.autoSetFileNameFromArray(fileNameList);
						}, (err, message) => {
							// 下载失败
							if (message == '用户未登录') {
								// 移除进度条
								progress.remove();
								// 延时提示
								setTimeout(() => {
									alert('错误: 用户未登录(用coding和玄武镜像可能会出现此问题)\n请更换成其他更新源');
								}, 100);
							}
						}, () => {
							// 下载完成 不执行onsuccess而是onfinish
							progress.setProgressValue(copyList.length);
							progress.setFileName('下载完成');
							setTimeout(() => {
								// 移除进度条
								progress.remove();
								// 延时提示
								setTimeout(() => {
									alert('下载完成，将自动重启');
									game.reload();
								}, 100);
							}, 200);
						}, (current, loaded, total) => {
							if (total != 0) {
								progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
							} else {
								progress.setFileName(`${current}(已下载${parseSize(loaded)})`);
							}
						});
					} else {
						console.log('不进行重新下载，已清空失败列表');
						brokenFileArr.length = 0;
						game.saveConfigValue('extension_在线更新_brokenFile');
					}
				}, 2500);
			}

			// 切换回应用，清除app通知
			if (game.shijianHasLocalNotification()) {
				document.addEventListener('visibilitychange', () => {
					if (!document.hidden) {
						// 检查更新
						cordova.plugins.notification.local.clear(1);
						// 游戏版本更新完成
						cordova.plugins.notification.local.clear(4);
						// 游戏素材更新完成
						cordova.plugins.notification.local.clear(5);
					}
				});
			}

			// 自动检测更新
			function checkUpdate() {
				game.shijianGetUpdateFiles().then(({ update }) => {
					console.log('获取到更新', update);
					if (!lib.version) lib.version = "1.9";
					if (update.version == lib.version) {
						return;
					} else {
						const result = game.shijianCheckVersion(lib.version, update.version);
						// 游戏版本比服务器提供的版本还要高
						if (result == 1) return;
					}

					function goupdate() {
						ui.menuContainer.show();
						ui.click.extensionTab('在线更新');
						/** @type { HTMLButtonElement[] } */
						// @ts-ignore
						const buttonList = ui.menuContainer.querySelectorAll('.config>span>button');
						const updateButton = buttonList[0];
						const assetUpdateButton = buttonList[1];
						if (updateButton && assetUpdateButton) {
							updateButton.click();
							assetUpdateButton.click();
						} else {
							alert('【在线更新】扩展提示您：\r\n未找到本扩展的更新按钮，请手动点击检查游戏更新和素材更新');
						}
					}

					// 获取到更新，进行提示
					let str = '有新版本' + update.version + '可用，是否前往【在线更新】扩展界面下载？';

					// 处于后台时，发送通知
					if (game.shijianHasLocalNotification()) {
						if (document.hidden) {
							let str2 = update.changeLog[0];
							for (let i = 1; i < update.changeLog.length; i++) {
								if (update.changeLog[i].indexOf('://') == -1) {
									str2 += '；' + update.changeLog[i];
								}
							}
							cordova.plugins.notification.local.schedule({
								id: 1,
								title: '更新提醒',
								text: str + '\n' + str2,
							});
						}
					}

					if (navigator.notification && navigator.notification.confirm) {
						let str2 = update.changeLog[0];
						for (let i = 1; i < update.changeLog.length; i++) {
							if (update.changeLog[i].indexOf('://') == -1) {
								str2 += '；' + update.changeLog[i];
							}
						}
						navigator.notification.confirm(str2, index => {
							if (index == 1) goupdate();
						},
							str,
							['确定', '取消']
						);
					} else {
						if (confirm(str)) {
							goupdate();
						}
					}

				}).catch(console.error);
			}
			
			// 刚开启时候的网络请求不会成功
			if (game.getExtensionConfig('在线更新', 'auto_check_update')) {
				setTimeout(() => {
					checkUpdate();
					setInterval(() => {
						if (game.getExtensionConfig('在线更新', 'auto_check_update')) checkUpdate();
					}, 1000 * 60 * 10);
				}, 10000);
			}
		},
		precontent: function () {
			// 添加两个更新地址
			Object.assign(lib.updateURLS, {
				fastgit: 'https://raw.fgit.ml/libccy/noname',
				// xuanwu: 'https://kuangthree.coding.net/p/nonamexwjh/d/nonamexwjh/git/raw',
				URC: 'https://unitedrhythmized.club/libccy/noname'
			});

			// 初始化，更新地址修改为URC
			if (!game.getExtensionConfig('在线更新', 'update_link')) {
				game.saveConfig('update_link', 'URC');
				game.saveExtensionConfig('在线更新', 'update_link', 'URC');
				lib.updateURL = lib.updateURLS['URC'];
			} else {
				game.saveConfig('update_link', game.getExtensionConfig('在线更新', 'update_link'));
			}

			// 修改游戏原生更新选项，插入上面的更新地址
			if (lib.configMenu.general.config.update_link) {
				lib.configMenu.general.config.update_link = {
					unfrequent: true,
					name: '更新地址',
					init: (() => {
						for (const url in lib.updateURLS) {
							if (lib.updateURL == lib.updateURLS[url]) {
								return url;
							}
						}
						game.saveConfig('update_link', 'URC');
						game.saveExtensionConfig('在线更新', 'update_link', 'URC');
						lib.updateURL = lib.updateURLS.URC;
						return 'URC';
					})(),
					item: {
						coding: 'Coding',
						github: 'GitHub',
						// fastgit: 'GitHub镜像',
						// xuanwu: '玄武镜像',
						URC: 'URC'
					},
					onclick: function (item) {
						if (lib.updateURLS[item]) {
							game.saveConfig('update_link', item);
							game.saveExtensionConfig('在线更新', 'update_link', item);
							lib.updateURL = lib.updateURLS[item];
						} else {
							alert(`选择的更新源(${ item })不存在`);
							return false;
						}
					},
				};
			}

			/** 检测最快连接到的更新源  */
			// @ts-ignore
			game.getFastestUpdateURL = function (updateURLS = lib.updateURLS, translate = {
				coding: 'Coding',
				github: 'GitHub',
				fastgit: 'GitHub镜像',
				// xuanwu: '玄武镜像',
				URC: 'URC'
			}) {
				if (typeof updateURLS != 'object') throw new TypeError('updateURLS must be an object type');
				if (typeof translate != 'object') throw new TypeError('translate must be an object type');
				const promises = [];
				const keys = Object.keys(updateURLS);
				keys.forEach(key => {
					const url = updateURLS[key];
					const start = new Date().getTime();
					promises.push(
						myFetch(`${url}/master/game/update.js?date=${(new Date()).getTime()}`)
							.then(async response => {
								try {
									await response.text();
									const finish = new Date().getTime() - start;
									return { key, finish };
								} catch (e) {
									return {
										key,
										err: new Error(e.message)
									};
								}
							})
					);
				});

				/* Promise.allSettled */
				function allSettled(array) {
					return new Promise(resolve => {
						let args = Array.prototype.slice.call(array);
						if (args.length === 0) return resolve([]);
						let arrCount = args.length;

						function resolvePromise(index, value) {
							if (typeof value === 'object') {
								let then = value.then;
								if (typeof then === 'function') {
									then.call(
										value,
										function (val) {
											args[index] = { status: 'fulfilled', value: val };
											if (--arrCount === 0) {
												resolve(args);
											}
										},
										function (e) {
											args[index] = { status: 'rejected', reason: e };
											if (--arrCount === 0) {
												resolve(args);
											}
										}
									);
								}
							}
						}

						for (let i = 0; i < args.length; i++) {
							resolvePromise(i, args[i]);
						}
					});
				}

				return allSettled(promises)
					.then(values => {
						const array = values.filter(i => i && !i.reason && !i.value.err);
						const errArray = values.filter(i => i && (i.reason || i.value.err));
						if (array.length == 0) {
							alert('更新源连接全部出错');
							return {
								success: [],
								failed: errArray.map(_ => _.value || _.reason)
							}
						}
						const fastest = array.reduce((previous, next) => {
							const a = previous.value.finish;
							const b = next.value.finish;
							return a > b ? next : previous;
						});
						function getTranslate(_) {
							const index = values.findIndex(item => item == _);
							return translate[keys[index]];
						}
						alert(`最快连接到的更新源是：${getTranslate(fastest) || fastest.value.key}, 用时${fastest.value.finish / 1000}秒${errArray.length > 0 ? '\n连接不上的更新源有：' + errArray.map(getTranslate) : ''}`);
						return {
							fastest: fastest.value,
							success: array.map(_ => _.value),
							failed: errArray.map(_ => _.value || _.reason)
						}
					});
			}

			game.shijianDownload = (url, onsuccess, onerror, onprogress) => {
				let downloadUrl = url, path = '', name = url;
				if (url.indexOf('/') != -1) {
					path = url.slice(0, url.lastIndexOf('/'));
					name = url.slice(url.lastIndexOf('/') + 1);
				}

				if (url.indexOf('http') != 0) {
					url = lib.updateURL + '/master/' + url;
				}

				lib.config.extension_在线更新_brokenFile.add(downloadUrl);
				game.saveConfigValue('extension_在线更新_brokenFile');

				/**
				 * 下载成功
				 * @param { FileEntry } [FileEntry] 文件系统
				 * @param { boolean } [skipDownload] 是否跳过下载
				 */
				function success(FileEntry, skipDownload) {
					if (FileEntry && !skipDownload && ['config', 'xuanwu'].includes(lib.config.update_link)) {
						FileEntry.file(file => {
							const fileReader = new FileReader();
							fileReader.onload = e => {
								/** @type { string } */
								// @ts-ignore
								const text = e.target.result;
								try {
									/** @type { notLogin } */
									const data = JSON.parse(text);
									if (data.msg.user_not_login == '用户未登录') {
										error(new Error(data.msg.user_not_login), data.msg.user_not_login);
									}
								} catch (err) {
									if (typeof onsuccess == 'function') onsuccess();
								}
							}
							fileReader.readAsText(file, "UTF-8");
						});
					} else {
						lib.config.extension_在线更新_brokenFile.remove(downloadUrl);
						game.saveConfigValue('extension_在线更新_brokenFile');
						if (typeof onsuccess == 'function') {
							if (skipDownload === true) {
								onsuccess(skipDownload);
							} else {
								onsuccess();
							}
						}
					}
				}

				/**
				 * 错误处理
				 * @param { FileTransferError | Error } e 错误对象
				 * @param { string } [message] 错误信息
				 */
				function error(e, message) {
					// 手机端下载的错误
					// 如果下载的是文件夹(xx/game/)会报400，如果是xx/game的形式在github会报404
					// Show-K的服务器下载文件夹也是404，不用管
					if (window.FileTransferError && e instanceof window.FileTransferError) {
						const errorCode = {
							1: 'FILE_NOT_FOUND_ERR',
							2: 'INVALID_URL_ERR',
							3: 'CONNECTION_ERR',
							4: 'ABORT_ERR',
							5: 'NOT_MODIFIED_ERR'
						};
						console.error({
							message: e.body,
							source: e.source,
							status: e.http_status,
							target: e.target,
							error: errorCode[e.code]
						});
						switch(e.http_status) {
							case 404: 
								game.print(`更新源中不存在${path}/${name}`);
								console.log(`更新源中不存在${path}/${name}`);
								success(undefined, true);
								break;
							case 402:
								// git镜像中这个资源无法下载，那就跳过
								if (lib.updateURL === lib.updateURLS.fastgit) {
									if (!sessionStorage.getItem('在线更新_fastgit_402')) {
										alert('这个资源在git镜像更新源内无法下载，请在下载操作全部完成后切换更新源下载！');
										sessionStorage.setItem('在线更新_fastgit_402', 'true');
									}
									success(undefined, true);
								} else if (typeof onerror == 'function') {
									onerror(e, e.body);
								}
								break;
							default:
								if (typeof onerror == 'function') {
									onerror(e, e.body);
								}
						}
						
					} else {
						// 电脑端下载的错误
						console.error(e, message);
						if (message == 'Not Found') {
							game.print(`更新源中不存在${path}/${name}`);
							console.log(`更新源中不存在${path}/${name}`);
							success(undefined, true);
						}
						// git镜像中这个资源无法下载，那就跳过
						// @ts-ignore
						else if (e.message == '402' && lib.updateURL === lib.updateURLS.fastgit) {
							if (!sessionStorage.getItem('在线更新_fastgit_402')) {
								alert('这个资源在git镜像更新源内无法下载，请在下载操作全部完成后切换更新源下载！');
								sessionStorage.setItem('在线更新_fastgit_402', 'true');
							}
							success(undefined, true);
						}
						else if (typeof onerror == 'function') {
							onerror(e, message);
						}
					}
				}

				if (window.FileTransfer) {
					// 判断是不是文件夹，不是才下载
					function download() {
						let fileTransfer = new FileTransfer();
						fileTransfer.download(encodeURI(`${url}?date=${(new Date()).getTime()}`), encodeURI(lib.assetURL + path + '/' + name), success, error);
					}
					window.resolveLocalFileSystemURL(lib.assetURL,
						/**
						 * @param { DirectoryEntry } DirectoryEntry 
						 */
						DirectoryEntry => {
							DirectoryEntry.getDirectory(path, { create: false }, dir => {
								dir.getDirectory(name, { create: false }, () => {
									console.log(`${path}/${name}是文件夹`);
									// 跳过下载
									success(undefined, true);
								}, download);
							}, download);
						}, download);
				} else if (typeof window.require == 'function'){
					const fetch = myFetch(`${url}?date=${(new Date()).getTime()}`);

					// if (typeof onprogress == 'function') {

					// 	/** @type { number } 资源总长度 */
					// 	let contentLength;
					// 	/** @type { number } 当前接收到了这么多字节 */
					// 	let receivedLength = 0;

					// 	fetch.then(response => {
					// 		if (response.headers instanceof Headers) {
					// 			contentLength = Number(response.headers.get('Content-Length'));
					// 		}
					// 		if (response.body instanceof ReadableStream) {
					// 			return response.body;
					// 		} else {
					// 			return Promise.reject('ReadableStream');
					// 		}
					// 	})
					// 		.then(body => {
					// 			const reader = body.getReader();
					// 			return new ReadableStream({
					// 				start(controller) {
					// 					function pump() {
					// 						return reader.read().then(({ done, value }) => {
					// 							// 读不到更多数据就关闭流
					// 							if (done) {
					// 								controller.close();
					// 								return;
					// 							}
					// 							receivedLength += value.length;
					// 							// @ts-ignore
					// 							onprogress(receivedLength, contentLength);
					// 							// 将下一个数据块置入流中
					// 							controller.enqueue(value);
					// 							return pump();
					// 						});
					// 					}
					// 					return pump();
					// 				}
					// 			});
					// 		})
					// 		.then(stream => new Response(stream))
					// }

					fetch.then(response => response.arrayBuffer())
						.then(arrayBuffer => {
							const fs = require('fs');
							const p = require('path');
							const filePath = p.join(__dirname, path, name);
							const dirPath = p.dirname(filePath);
							function writeFile() {
								fs.writeFile(filePath, Buffer.from(arrayBuffer), null, e => {
									if (e) error(e, 'writeFile');
									else success();
								});
							}
							if (!fs.existsSync(dirPath)) {
								fs.mkdir(dirPath, { recursive: true }, e => {
									if (e) error(e, '文件夹创建失败');
									writeFile();
								});
							} else if (fs.existsSync(filePath)) {
								const stat = fs.statSync(filePath);
								if (stat.isDirectory()) {
									console.error(`${path + '/' + name}是个文件夹`);
									alert(`${path + '/' + name}是个文件夹，不予下载。请将此问题报告给此更新源的管理者。`);
									lib.config.extension_在线更新_brokenFile.remove(path + '/' + name);
									game.saveConfigValue('extension_在线更新_brokenFile');
									return success(undefined, true);
								} else {
									writeFile();
								}
							} else {
								writeFile();
							}
						})
						.catch(
							/** @param { Response } response */
							response => {
								console.log(response);
								error(new Error(String(response.status)), response.statusText);
						})
				}
			};

			game.shijianMultiDownload = (list, onsuccess, onerror, onfinish, onprogress) => {
				// 不修改原数组
				let list2 = list.slice(0);
				// 正在并发下载的文件名数组
				let list3 = [];
				// 已经下载的数量
				let length = 0;
				// 最大并发量
				let max = game.getExtensionConfig('在线更新', 'maxFetchNum') || 5;
				/**
				 * 下载文件，失败后300ms重新下载
				 * @param { string } current 文件名 
				 */
				let reload = current => {
					game.shijianDownload(current, skipDownload => {
						if (skipDownload === true) {
							game.print(`跳过下载: ${current}`);
							console.log(`跳过下载: ${current}`);
						} else {
							// game.print(`下载成功: ${current}`);
							console.log(`下载成功: ${current}`);
						}
						length++;
						list3.remove(current);
						onsuccess(list3);
						//自调用
						download();
					}, (e, message) => {
						console.log(`下载失败: ${message}`);
						console.dir(e);
						onerror(e, message);
						if (message !== '用户未登录') {
							setTimeout(() => reload(current), 300);
						}
					}/*, (loaded, total) => {
						if (!game.getExtensionConfig('在线更新', 'logProgress')) return;
						if (typeof onprogress == 'function') {
							onprogress(current, loaded, total);
						}
					}*/);
				};
				
				let download = () => {
					if (length < list.length) {
						let num_copy = list3.length;
						for (let i = 1; i <= max - num_copy; i++) {
							/** 正在下载的文件名 */
							let current = list2.shift();
							if (current) {
								// console.log('正在下载:' + current + ` (${list.indexOf(current) + 1}/${list.length}) (${i}/${max - num_copy})`);
								list3.push(current);
								reload(current);
							} else {
								break;
							}
						}
					} else if (!list3.length) {
						onfinish();
					}
				};
				download();
			};

			// 下载进度
			game.shijianCreateProgress = (title, max, fileName, value) => {
				/** @type { progress } */
				// @ts-ignore
				const parent = ui.create.div(ui.window, {
					textAlign: 'center',
					width: '300px',
					height: '150px',
					left: 'calc(50% - 150px)',
					top: 'auto',
					bottom: 'calc(50% - 75px)',
					zIndex: '10',
					boxShadow: 'rgb(0 0 0 / 40 %) 0 0 0 1px, rgb(0 0 0 / 20 %) 0 3px 10px',
					backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))',
					borderRadius: '8px',
					overflow: 'hidden scroll'
				});

				// 可拖动
				parent.className = 'dialog';

				const container = ui.create.div(parent, {
					position: 'absolute',
					top: '0',
					left: '0',
					width: '100%',
					height: '100%'
				});

				container.ontouchstart = ui.click.dialogtouchStart;
				container.ontouchmove = ui.click.touchScroll;
				// @ts-ignore
				container.style.WebkitOverflowScrolling = 'touch';
				parent.ontouchstart = ui.click.dragtouchdialog;

				const caption = ui.create.div(container, '', title, {
					position: 'relative',
					paddingTop: '8px',
					fontSize: '20px'
				});

				ui.create.node('br', container);

				const tip = ui.create.div(container, {
					position: 'relative',
					paddingTop: '8px',
					fontSize: '20px',
					width: '100%'
				});

				const file = ui.create.node('span', tip, '', fileName);
				file.style.width = file.style.maxWidth = '100%';
				ui.create.node('br', tip);
				const index = ui.create.node('span', tip, '', String(value || '0'));
				ui.create.node('span', tip, '', '/');
				const maxSpan = ui.create.node('span', tip, '', String(max || '未知'));

				ui.create.node('br', container);

				const progress = ui.create.node('progress.zxgxProgress', container);
				progress.setAttribute('value', value || '0');
				progress.setAttribute('max', max);

				parent.getTitle = () => caption.innerText;
				parent.setTitle = title => caption.innerHTML = title;
				parent.getFileName = () => file.innerText;
				parent.setFileName = name => file.innerHTML = name;
				parent.getProgressValue = () => progress.value;
				parent.setProgressValue = value => progress.value = index.innerHTML = value;
				parent.getProgressMax = () => progress.max;
				parent.setProgressMax = max => progress.max = maxSpan.innerHTML = max;
				parent.autoSetFileNameFromArray = fileNameList => {
					if (fileNameList.length > 2) {
						parent.setFileName(fileNameList.slice(0, 2).concat(`......等${fileNameList.length - 2}个文件`).join('<br/>'));
					} else if (fileNameList.length == 2) {
						parent.setFileName(fileNameList.join('<br/>'));
					} else if (fileNameList.length == 1) {
						parent.setFileName(fileNameList[0]);
					} else {
						parent.setFileName('当前没有正在下载的文件');
					}
				};
				return parent;
			};

			// 获取更新文件
			game.shijianGetUpdateFiles = () => {
				/** 获取noname_update */
				function getNonameUpdate() {
					/** 更新源地址 */
					const updateURL = lib.updateURL + '/master/';
					if (typeof window.noname_update == 'object') {
						return Promise.resolve(window.noname_update);
					} else {
						return myFetch(`${updateURL}game/update.js?date=${(new Date()).getTime()}`)
							.then(response => response.text())
							.then(text => {
								// 赋值window.noname_update
								try {
									const data = JSON.parse(text);
									if (data.msg.user_not_login == '用户未登录') {
										alert('错误: 用户未登录(用coding和玄武镜像可能会出现此问题)\n请更换成其他更新源');
										return Promise.reject('user_not_login');
									} else {
										eval(text);
										if (typeof window.noname_update != 'object') {
											return Promise.reject('更新内容获取失败(game/update.js)，请重试');
										}
									}
								} catch (e) {
									try { eval(text) } catch (error) { console.log(error) }
									if (typeof window.noname_update != 'object') {
										return Promise.reject('更新内容获取失败(game/update.js)，请重试');
									}
								}
								return window.noname_update;
							});
					}
				}
				/** 获取noname_source_list */
				function getSourceList() {
					/** 更新源地址 */
					const updateURL = lib.updateURL + '/master/';
					if (typeof window.noname_source_list == 'object') {
						return Promise.resolve(window.noname_source_list);
					} else {
						return myFetch(`${updateURL}game/source.js?date=${(new Date()).getTime()}`)
							.then(response => response.text())
							.then(text => {
								//赋值window.noname_source_list
								try {
									const data = JSON.parse(text);
									if (data.msg.user_not_login == '用户未登录') {
										alert('错误: 用户未登录(用coding和玄武镜像可能会出现此问题)\n请更换成其他更新源');
										return Promise.reject('user_not_login');
									} else {
										eval(text);
										if (typeof window.noname_source_list != 'object') {
											return Promise.reject('更新内容获取失败(game/source.js)，请重试');
										}
									}
								} catch (e) {
									try { eval(text) } catch (error) { console.log(error) }
									if (typeof window.noname_source_list != 'object') {
										return Promise.reject('更新内容获取失败(game/source.js)，请重试');
									}
								}
								return window.noname_source_list;
							});
					}
				}

				return new Promise(async (resolve, reject) => {
					if (!game.download) {
						reject(new Error('此版本不支持游戏内更新，请手动更新'));
					}
					if (window.noname_update && window.noname_source_list) {
						resolve({
							update: window.noname_update,
							source_list: window.noname_source_list
						});
					} else {
						// 设置最大重试次数为5次
						let i = 0;
						while (!(window.noname_update && window.noname_source_list) && i < 5) {
							try {
								await getNonameUpdate().then(() => getSourceList()).then(() => {
									resolve({
										// @ts-ignore
										update: window.noname_update,
										// @ts-ignore
										source_list: window.noname_source_list
									});
								});
							} catch (e) {
								console.log(e);
								i++;
								if (e == 'user_not_login') return reject(e);
							}
						}
						if (i == 5 && !(window.noname_update && window.noname_source_list)) {
							reject('自动请求5次全部失败, 请重试');
						} else if (window.noname_update && window.noname_source_list) {
							resolve({
								// @ts-ignore
								update: window.noname_update,
								// @ts-ignore
								source_list: window.noname_source_list
							});
						} else {
							reject('遇到其他错误, 请重试');
						}
					}
				});
			};

			// 获取更新素材
			game.shijianGetUpdateAssets = () => {
				/** 获取noname_asset_list */
				function getNonameAssets() {
					/** 更新源地址 */
					const updateURL = lib.updateURL + '/master/';
					if (typeof window.noname_asset_list == 'object') {
						return Promise.resolve(window.noname_asset_list);
					} else {
						return myFetch(`${updateURL}game/asset.js?date=${(new Date()).getTime()}`)
							.then(response => response.text())
							.then(text => {
								// 赋值window.noname_asset_list
								try {
									const data = JSON.parse(text);
									if (data.msg.user_not_login == '用户未登录') {
										alert('错误: 用户未登录(用coding和玄武镜像可能会出现此问题)\n请更换成其他更新源');
										return Promise.reject('user_not_login');
									} else {
										eval(text);
										if (typeof window.noname_asset_list != 'object') {
											return Promise.reject('更新内容获取失败(game/asset.js)，请重试');
										}
									}
								} catch (e) {
									try { eval(text) } catch (error) { console.log(error) }
									if (typeof window.noname_asset_list != 'object') {
										return Promise.reject('更新内容获取失败(game/asset.js)，请重试');
									}
								}
								return window.noname_asset_list;
							});
					}
				}

				return new Promise(async (resolve, reject) => {
					if (!game.download) {
						reject(new Error('此版本不支持游戏内更新，请手动更新'));
					}
					if (window.noname_asset_list) {
						resolve({
							assets: window.noname_asset_list,
							// @ts-ignore
							skins: window.noname_skin_list,
						});
					} else {
						// 设置最大重试次数为5次
						let i = 0;
						while (typeof window.noname_asset_list != 'object' && i < 5) {
							try {
								await getNonameAssets().then(() => {
									resolve({
										// @ts-ignore
										assets: window.noname_asset_list,
										// @ts-ignore
										skins: window.noname_skin_list
									});
								});
							} catch (e) {
								console.log(e);
								i++;
								if (e == 'user_not_login') return reject(e);
							}
						}
						if (i == 5 && !window.noname_asset_list) {
							reject('自动请求5次全部失败, 请重试');
						} else if (window.noname_asset_list) {
							resolve({
								// @ts-ignore
								assets: window.noname_asset_list,
								// @ts-ignore
								skins: window.noname_skin_list
							});
						} else {
							reject('遇到其他错误, 请重试');
						}
					}
				});
			}

			game.shijianHasLocalNotification = () => {
				return !!(window.cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local);
			}

			game.updateErrors = 0;

			game.shijianCheckVersion = (ver1, ver2) => {
				if (typeof ver1 != 'string') ver1 = '';
				if (typeof ver2 != 'string') ver2 = '';
				/**
				 * @param {string} str
				 */
				function* walk(str) {
					let part = '';
					let terminals = ['.', '-'];
					for (let i = 0; i < str.length; i++) {
						if (terminals.includes(str[i])) {
							yield Number(part);
							part = '';
						} else {
							part += str[i];
						}
					}
					if (part) yield Number(part);
				}

				const iterator1 = walk(ver1), iterator2 = walk(ver2);
				let item1 = iterator1.next(), item2 = iterator2.next();

				function iterNext() {
					item1 = iterator1.next();
					item2 = iterator2.next();
				}

				function iterReturn() {
					iterator1.return();
					iterator2.return();
				}

				while (!item1.done && !item2.done) {
					if (item1.value === item2.value || isNaN(item1.value) || isNaN(item2.value)) {
						iterNext();
					} else if (item1.value > item2.value) {
						iterReturn();
						return 1;
					} else if (item1.value < item2.value) {
						iterReturn();
						return -1;
					}
				}

				if (item1.done && !item2.done) {
					iterReturn();
					return -1;
				} else if (!item1.done && item2.done) {
					iterReturn();
					return 1;
				}
				/* else if (item1.done && item2.done) {
					return 0;
				}*/
				else return 0;
			};

			// 禁用自动检查更新
			(window.Reflect || Object).defineProperty(game, 'checkForUpdate', {
				enumerable: true,
				get() {
					return function () {
						if (!sessionStorage.getItem('在线更新_checkForUpdate')) {
							alert('无名杀自带的自动检查更新已被在线更新扩展禁用，请使用在线更新扩展内的自动检查更新功能');
							sessionStorage.setItem('在线更新_checkForUpdate', '1');
						}
						game.saveConfig('auto_check_update', false);
					};
				},
				set(v) {}
			});
			
			if (!Array.isArray(lib.updateReady)) lib.updateReady = [];
			if (!Array.isArray(lib.updateAssetReady)) lib.updateAssetReady = [];

			/**
			 * @param { DirectoryEntry } [entry] 
			 * @param { string } [name] 
			 * @return { Promise<DirectoryEntry | FileEntry> }
			 */
			function getEntry(entry, name) {
				return new Promise((resolve, reject) => {
					if (!entry) {
						window.resolveLocalFileSystemURL(lib.assetURL,
							/** @param { DirectoryEntry } entry */
							entry => resolve(entry)
						);
					} else if (typeof name == 'string') {
						entry.getFile(name, { create: true }, e => resolve(e), e => reject(e));
					} else {
						resolve(entry);
					}
				});
			}
			/**
			 * 
			 * @param { FileEntry } entry 
			 * @returns { Promise<ArrayBuffer> }
			 */
			function readFile(entry) {
				return new Promise((resolve, reject) => {
					entry.file(file => {
						let fileReader = new FileReader();
						// @ts-ignore
						fileReader.onload = e => resolve(e.target.result);
						fileReader.onerror = reject;
						fileReader.readAsArrayBuffer(file);
					}, reject);
				});
			}
			/**
			 * 
			 * @param { FileEntry } entry 
			 * @param { ArrayBuffer } arrayBuffer 
			 * @returns 
			 */
			function writeToFile(entry, arrayBuffer) {
				return new Promise((resolve, reject) => {
					entry.createWriter(writer => {
						writer.onwriteend = () => resolve(null);
						writer.onerror = e => reject(e);
						writer.write(arrayBuffer);
					});
				});
			}

			/**
			 * @param {{ [key: string]: string; }[]} arr
			 */
			async function rewrite(arr) {
				for (let obj of arr) {
					for (const [from, to] of Object.entries(obj)) {
						if (typeof window.require == 'function') {
							const fs = require('fs').promises;
							const buffer = await fs.readFile(__dirname + `/${from}`);
							await fs.writeFile(__dirname + `/${to}`, buffer);
						} else if (window.cordova) {
							/** @type { DirectoryEntry } */
							// @ts-ignore
							const root = await getEntry();
							/** @type { FileEntry } */
							// @ts-ignore
							const file = await getEntry(root, from);
							/** @type { FileEntry } */
							// @ts-ignore
							const targetFile = await getEntry(root, to);
							await writeToFile(targetFile, await readFile(file));
						}
					}
				}
			}

			let unwantedToUpdate = false;
			(window.Reflect || Object).defineProperty(game, 'unwantedToUpdate', {
				enumerable: true,
				get() {
					return unwantedToUpdate;
				},
				set(newVal) {
					unwantedToUpdate = newVal;
					if (newVal === true) {
						rewrite(lib.updateReady);
					}
				}
			});

			let unwantedToUpdateAsset = false;
			(window.Reflect || Object).defineProperty(game, 'unwantedToUpdateAsset', {
				enumerable: true,
				get() {
					return unwantedToUpdateAsset;
				},
				set(newVal) {
					unwantedToUpdateAsset = newVal;
					if (newVal === true) {
						rewrite(lib.updateAssetReady);
					}
				}
			});

			lib.init.css(lib.assetURL + 'extension/在线更新', 'extension');
		},
		config: {
			show_version: {
				clear: true,
				nopointer: true,
				name: '扩展版本： v1.62',
			},
			update_link_explain: {
				clear: true,
				nopointer: true,
				name: `更新地址说明：`,
				init: '无',
				item: {
					无: '无',
					coding: 'Coding',
					github: 'GitHub',
					// fastgit: 'GitHub镜像',
					// xuanwu: '玄武镜像',
					URC: 'URC',
				},
				onclick: function (item) {
					let str;
					switch (item) {
						case 'coding':
							// str = '目前最主要的更新源，但也是崩的最彻底的一个';
							str = '目前最主要的更新源。从v1.9.115.3以后(不包括)，coding更新源更换为了另一个可用网址(好像现在也不能用了)';
							break;
						case 'github':
							str = '国外的更新源，没有vpn或修改host设置的情况下几乎连不上此更新源';
							break;
						case 'fastgit':
							str = 'github的镜像网址，拥有在国内访问的能力，但是偶尔会很卡，推荐使用此更新源';
							break;
						case 'xuanwu':
							str = '由寰宇星城创建的更新源，和coding差不多，版本的更新需要他在苏婆更新后手动拉代码到服务器上。目前因coding网址的政策已废弃';
							break;
						case 'URC':
							str = '由Show-K大佬提供，名字取自United Rhythmized Club，推荐使用此更新源。此更新源能否连接取决于服务器是否还有剩余流量';
					}
					typeof str != 'undefined' && alert(str);
					return false;
				},
			},
			update_link: {
				name: '更新地址',
				//init: (lib.updateURL == lib.updateURLS['coding'] ? 'coding' : 'fastgit'),
				init: (() => {
					for (const url in lib.updateURLS) {
						if (lib.updateURL == lib.updateURLS[url]) {
							return url;
						}
					}
					game.saveConfig('update_link', 'URC');
					game.saveExtensionConfig('在线更新', 'update_link', 'URC');
					lib.updateURL = lib.updateURLS['URC'];
					return 'URC';
				})(),
				item: {
					coding: 'Coding',
					github: 'GitHub',
					fastgit: 'GitHub镜像',
					// xuanwu: '玄武镜像',
					URC: 'URC'
				},
				onclick: function (item) {
					if (item != game.getExtensionConfig('在线更新', 'update_link')) {
						if (['xuanwu'].includes(item)) {
							alert('此更新源已弃用，请不要再使用此更新源');
							return false;
						}
						delete window.noname_update;
						delete window.noname_asset_list;
						delete window.noname_skin_list;
						if (lib.updateURLS[item]) {
							game.saveConfig('update_link', item);
							game.saveExtensionConfig('在线更新', 'update_link', item);
							lib.updateURL = lib.updateURLS[item];
						} else {
							alert(`选择的更新源(${item})不存在`);
							return false;
						}
					}
				},
			},
			getFastestUpdateURL: {
				clear: true,
				intro: '点击测试最快连接到的更新源',
				name: '<span style="text-decoration: underline;">测试最快连接到的更新源</span>',
				onclick: function () {
					/** 
					 * @type { HTMLSpanElement } span
					 **/
					// @ts-ignore
					const span = this.childNodes[0].childNodes[0];
					if (span.innerText == '测试最快连接到的更新源') {
						span.innerText = '测试中...';
						game.getFastestUpdateURL().then(result => {
							console.log(result);
							span.innerText = '测试最快连接到的更新源';
						});
					}
				}
			},
			timeout: {
				init: '5000',
				name: '网络超时时间（毫秒）',
				input: true,
				onblur: function (e) {
					/**
					 * @type { HTMLDivElement }
					 */
					// @ts-ignore
					let target = e.target;
					let time = Number(target.innerText);
					if (isNaN(time)) {
						target.innerText = '3000';
						time = 3000;
					} else if (time == 0) {
						target.innerText = '0';
						time = 0;
						alert('设置为0时将没有超时时间');
					} else if (time < 300) {
						alert('暂时不允许超时时间小于300毫秒');
						target.innerText = '300';
						time = 300;
					}
					game.saveExtensionConfig('在线更新', 'timeout', time);

					if (typeof window.AbortController !== 'function') {
						alert('您的设备不支持设置超时时间');
					}
				},
			},
			/*logProgress: {
				init: false,
				intro: '下载文件时显示的进度条是否实时显示每个文件的下载进度',
				name: '显示每个文件的下载进度',
				onclick: function (bool) {
					game.saveExtensionConfig('在线更新', 'logProgress', bool);
				}
			},*/
			maxFetchNum: {
				init: 5,
				name: '下载多个文件的最大并发数',
				input: true,
				onblur: function (e) {
					/**
					 * @type { HTMLDivElement }
					 */
					// @ts-ignore
					let target = e.target;
					let num = Number(target.innerText);
					if (isNaN(num)) {
						target.innerText = '5';
						num = 5;
					} else if (num < 1) {
						alert('并发数最小为1');
						target.innerText = '1';
						num = 1;
					} else {
						num = Math.floor(num);
					}
					game.saveExtensionConfig('在线更新', 'maxFetchNum', num);
				},
			},
			rewriteUpdateButton: {
				init: true,
				name: '覆盖更新按钮',
				intro: '覆盖无名杀自带的更新按钮',
				onclick: assetConfigFun('rewriteUpdateButton'),
			},
			auto_check_update: {
				init: (() => {
					return lib.config['auto_check_update'] == true;
				})(),
				intro: '每次开启游戏后，每10分钟检查无名杀是否有更新',
				name: '每10分钟自动检测更新',
				onclick: function (bool) {
					game.saveExtensionConfig('在线更新', 'auto_check_update', bool);
					game.saveConfig('auto_check_update', false);
				}
			},
			checkForUpdate: {
				// 检查游戏更新
				clear: true,
				intro: '点击检查游戏更新',
				name: '<button type="button">检查游戏更新</button>',
				/** @this {HTMLDivElement | HTMLButtonElement} */
				onclick: async function () {
					/**
					 * 下载按钮
					 * @type { HTMLButtonElement } button
					 **/
					let button;
					if (this instanceof HTMLButtonElement) {
						button = this;
					} else {
						// @ts-ignore
						button = this.childNodes[0].childNodes[0];
					}

					/** @type ParentNode */
					// @ts-ignore
					let parentNode = button.parentNode;
					if (button instanceof HTMLButtonElement && button.innerHTML == "检查游戏更新") {
						if (game.Updating) return alert('正在更新游戏文件，请勿重复点击');
						if (game.allUpdatesCompleted) return alert('游戏文件和素材全部更新完毕');
					}
					if (button.innerText != '检查游戏更新') return;
					// 是否可以更新，每次都调用的原因是判断网络问题
					try {
						await canUpdate();
					} catch (e) {
						return response_catch(e);
					}
					game.Updating = true;
					game.unwantedToUpdate = false;

					/** 按钮还原状态 */
					const reduction = () => {
						game.Updating = false;
						button.innerText = '检查游戏更新';
						button.disabled = false;
					};

					if (button.disabled) return;
					else if (!game.download) return alert('此版本不支持游戏内更新，请手动更新');
					else {
						button.innerHTML = '正在检查更新';
						button.disabled = true;

						game.shijianGetUpdateFiles().then(({ update, source_list: updates }) => {
							game.saveConfig('check_version', update.version);
							if (!lib.version) lib.version = "1.9";
							//要更新的版本和现有的版本一致
							if (update.version == lib.version) {
								if (!confirm('当前版本已经是最新，是否覆盖更新？')) {
									game.Updating = false;
									button.innerHTML = '检查游戏更新';
									button.disabled = false;
									return;
								}
							} else {
								const result = game.shijianCheckVersion(lib.version, update.version);
								if (result == 1) {
									if (!confirm('游戏版本比服务器提供的版本还要高，是否覆盖更新？')) {
										game.Updating = false;
										button.innerHTML = '检查游戏更新';
										button.disabled = false;
										return;
									}
								}
							}

							let files = null;
							/** 原来的版本号 */
							let version = lib.version;

							let goupdate = (files, update) => {
								lib.version = update.version;
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
									if (updates[i].indexOf('node_modules/') == 0 /*&& !update.node*/) {
										//只有电脑端用，没有nodejs环境跳过
										if (!lib.node || !lib.node.fs) {
											updates.splice(i--, 1);
											continue;
										};
										let entry = updates[i];
										const fs = require('fs');
										fs.access(__dirname + '/' + entry, function (err) {
											if (!err) {
												const size = fs.statSync(__dirname + '/' + entry).size;
												// @ts-ignore
												size == 0 && (err = true);
											}
											!err && updates.splice(i--, 1);
										});
									}
								}

								button.remove();

								let span = document.createElement('span');
								let n1 = 0;
								let n2 = updates.length;
								span.innerHTML = `正在下载文件（${n1}/${n2}）`;
								parentNode.insertBefore(span, parentNode.firstElementChild);

								let consoleMenu;
								if (this != button) {
									consoleMenu = document.createElement('button');
									consoleMenu.setAttribute('type', 'button');
									consoleMenu.innerHTML = '跳转到命令页面';
									consoleMenu.onclick = ui.click.consoleMenu;
									parentNode.appendChild(document.createElement('br'));
									parentNode.appendChild(consoleMenu);
								}

								// 复制文件数组，用来和进度绑定
								const copyList = [...updates];
								// 创建下载进度div
								const progress = game.shijianCreateProgress('更新游戏', copyList.length, copyList[0]);
								// app创建通知
								if (game.shijianHasLocalNotification()) {
									cordova.plugins.notification.local.schedule({
										id: 2,
										title: '游戏版本更新',
										text: `正在下载文件（${n1}/${n2}）`,
										// 进度
										progressBar: { value: 0 }
									});
								}
								// 下载之前保留下载列表
								updates.forEach(v => lib.config.extension_在线更新_brokenFile.add(v));
								game.saveConfigValue('extension_在线更新_brokenFile');
								
								game.shijianMultiDownload(updates, (fileNameList) => {
									n1++;
									span.innerHTML = `正在下载文件（${n1}/${n2}）`;
									// 更新进度
									progress.setProgressValue(n1);
									progress.autoSetFileNameFromArray(fileNameList);
									if (game.shijianHasLocalNotification()) {
										cordova.plugins.notification.local.update({
											id: 2,
											text: `正在下载文件（${n1}/${n2}）`,
											progressBar: { value: (n1 / n2 * 100).toFixed(0) }
										});
									}
								},
									// 下载失败
									e => {},
									// 下载完成
									() => {
										// 更新进度, 下载完成时不执行onsuccess而是onfinish
										progress.setProgressValue(copyList.length);
										progress.setFileName('下载完成');
										if (game.shijianHasLocalNotification()) {
											cordova.plugins.notification.local.clear(2);
											if (document.hidden) {
												cordova.plugins.notification.local.schedule({
													id: 4,
													title: '游戏版本更新',
													text: `游戏版本更新完啦，点击进入无名杀`,
												});
											}
										}
										setTimeout(() => {
											// 移除进度条
											progress.remove();
											// 删除window.noname_update
											delete window.noname_update;
											span.innerHTML = `游戏更新完毕（${n1}/${n2}）`;
											setTimeout(() => {
												if (!game.UpdatingForAsset) {
													if (game.unwantedToUpdateAsset) game.allUpdatesCompleted = true;
													alert('游戏更新完毕');
												}
												game.Updating = false;
												game.unwantedToUpdate = true;
												typeof consoleMenu != 'undefined' && consoleMenu.remove();
												parentNode.insertBefore(document.createElement('br'), parentNode.firstElementChild);
												let button2 = document.createElement('button');
												button2.innerHTML = '重新启动';
												button2.onclick = game.reload;
												// button2.style.marginTop = '8px';
												parentNode.insertBefore(button2, parentNode.firstElementChild);
											}, 750);
										}, 250);
									},
									(current, loaded, total) => {
										if (total != 0) {
											progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
										} else {
											progress.setFileName(`${current}(已下载${parseSize(loaded)})`);
										}
									});
							};

							if (Array.isArray(update.files) && update.update) {
								// 当前游戏版本
								let version1 = version.split('.');
								// update里要更新的版本，如果当前游戏版本是这个版本，就只更新update.files里的内容
								let version2 = update.update.split('.');

								for (let i = 0; i < version1.length && i < version2.length; i++) {
									if (+version2[i] > +version1[i]) {
										files = false;
										break;
									} else if (+version1[i] > +version2[i]) {
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
									function (index) {
										if (index == 1) {
											goupdate(files, update);
										} else {
											// 还原版本
											lib.version = version;
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
									// 还原版本
									lib.version = version;
									game.Updating = false;
									button.innerHTML = '检查游戏更新';
									button.disabled = false;
								}
							}
						}).catch(err => {
							game.Updating = false;
							button.innerHTML = '检查游戏更新';
							button.disabled = false;
							response_catch(err);
							reduction();
						});
					}
				}
			},
			updateAll: {
				init: false,
				intro: '更新游戏时，下载所有主要文件（不包括素材），如果你自行修改了无名杀本体的theme等文件夹下的素材，建议不要开启此选项',
				name: '强制更新所有主文件',
				/*onclick: (bool) => {
					game.saveExtensionConfig('在线更新', 'updateAll', bool);
				}*/
				onclick: assetConfigFun('updateAll'),
			},
			checkForAssetUpdate: {
				// 检查素材更新
				clear: true,
				intro: '点击检查素材更新',
				name: '<button type="button">检查素材更新</button>',
				/** @this {HTMLDivElement | HTMLButtonElement} */
				onclick: async function () {
					/**
					 * @type { HTMLButtonElement } button
					 **/
					let button;
					if (this instanceof HTMLButtonElement) {
						button = this;
					} else {
						// @ts-ignore
						button = this.childNodes[0].childNodes[0];
					}
					/** @type ParentNode */
					// @ts-ignore
					let parentNode = button.parentNode;
					if (button instanceof HTMLButtonElement && button.innerHTML == "检查素材更新") {
						if (game.UpdatingForAsset) {
							return alert('正在更新游戏素材，请勿重复点击');
						}
						if (game.allUpdatesCompleted) {
							return alert('游戏文件和素材全部更新完毕');
						}
						if (game.unwantedToUpdateAsset) {
							return alert('素材已是最新');
						}
					}
					if (button.innerText != '检查素材更新') return;
					// 是否可以更新，每次都调用的原因是判断网络问题
					try {
						await canUpdate();
					} catch (e) {
						return response_catch(e);
					}
					game.UpdatingForAsset = true;
					game.unwantedToUpdateAsset = false;

					/** 还原状态 */
					let reduction = () => {
						game.UpdatingForAsset = false;
						button.innerText = '检查素材更新';
						button.disabled = false;
					};
					if (button.disabled) {
						return;
					} else if (!game.download) {
						return alert('此版本不支持游戏内更新，请手动更新');
					} else {
						button.innerHTML = '正在检查更新';
						button.disabled = true;
						game.shijianGetUpdateAssets().then(({ assets: updates, skins }) => {
							delete window.noname_asset_list;
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
													if (updates[i].indexOf('jun_') != 16 && updates[i].indexOf('gz_') != 16 && !skipcharacter.contains(updates[i].slice(16, updates[i].lastIndexOf('.')))) {
														updates.splice(i--, 1);
													}
												} else if (updates[i].indexOf('image/card') == 0) {
													if (updates[i].indexOf('qiaosi_card') != 11 && !skipcard.contains(updates[i].slice(11, updates[i].lastIndexOf('.')))) {
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

							// 如果更新皮肤
							if (game.getExtensionConfig('在线更新', 'assetSkin') && typeof skins == 'object') {
								for (let i in skins) {
									for (let j = 1; j <= skins[i]; j++) {
										updates.push('image/skin/' + i + '/' + j + '.jpg');
									}
								}
							}

							let proceed = () => {
								if (updates.length == 0) {
									game.saveConfig('asset_version', asset_version);
									alert('素材已是最新');
									game.UpdatingForAsset = false;
									game.unwantedToUpdateAsset = true;
									button.innerHTML = '素材已是最新';
									// button.disabled = false;
									return;
								}
								button.remove();
								let consoleMenu;
								if (this != button) {
									consoleMenu = document.createElement('button');
									consoleMenu.setAttribute('type', 'button');
									consoleMenu.innerHTML = '跳转到命令页面';
									consoleMenu.onclick = ui.click.consoleMenu;
									parentNode.appendChild(consoleMenu);
									parentNode.appendChild(document.createElement('br'));
								}
								let span = document.createElement('span');
								span.style.whiteSpace = 'nowrap';
								let n1 = 0;
								let n2 = updates.length;
								span.innerHTML = `正在下载素材（${n1}/${n2}）`;
								parentNode.insertBefore(span, parentNode.firstElementChild);

								if (this == button) {
									parentNode.insertBefore(document.createElement('br'), span.nextElementSibling);
								}

								// 复制文件数组，用来和进度绑定
								const copyList = [...updates];
								// 创建下载进度div
								const progress = game.shijianCreateProgress('更新游戏素材', copyList.length, copyList[0]);
								// 修改样式，保证不和更新游戏的进度框重复
								progress.style.bottom = 'calc(25% - 75px)';

								// app创建通知
								if (game.shijianHasLocalNotification()) {
									cordova.plugins.notification.local.schedule({
										id: 3,
										title: '游戏素材更新',
										text: `正在下载文件（${n1}/${n2}）`,
										// 进度
										progressBar: { value: 0 }
									});
								}

								// 下载之前保留下载列表
								updates.forEach(v => lib.config.extension_在线更新_brokenFile.add(v));
								game.saveConfigValue('extension_在线更新_brokenFile');

								game.shijianMultiDownload(updates, (fileNameList) => {
									n1++;
									span.innerHTML = `正在下载文件（${n1}/${n2}）`;
									// 更新进度
									progress.setProgressValue(n1);
									progress.autoSetFileNameFromArray(fileNameList);
									// app创建通知
									if (game.shijianHasLocalNotification()) {
										cordova.plugins.notification.local.update({
											id: 3,
											text: `正在下载文件（${n1}/${n2}）`,
											// 进度
											progressBar: { value: (n1 / n2 * 100).toFixed(0) }
										});
									}
								}, error => {
									console.log('error', error);
								}, () => {
									// 更新进度, 下载完成时不执行onsuccess而是onfinish
									progress.setProgressValue(copyList.length);
									progress.setFileName('下载完成');
									// app创建通知
									if (game.shijianHasLocalNotification()) {
										cordova.plugins.notification.local.clear(3);
										if (document.hidden) {
											cordova.plugins.notification.local.schedule({
												id: 5,
												title: '游戏素材更新',
												text: `游戏素材更新完啦，点击进入无名杀`,
											});
										}
									}
									setTimeout(() => {
										// 移除进度条
										progress.remove();
										span.innerHTML = `素材更新完毕（${n1}/${n2}）`;
										setTimeout(() => {
											if (!game.Updating) {
												alert('更新完成');
												if (game.unwantedToUpdate) game.allUpdatesCompleted = true;
											}
											game.UpdatingForAsset = false;
											game.unwantedToUpdateAsset = true;
											typeof consoleMenu != 'undefined' && consoleMenu.remove();
											parentNode.insertBefore(document.createElement('br'), parentNode.firstElementChild);
											let button2 = document.createElement('button');
											button2.innerHTML = '重新启动';
											button2.onclick = game.reload;
											// button2.style.marginTop = '8px';
											parentNode.insertBefore(button2, parentNode.firstElementChild);
										}, 750);
									}, 250);
								}, (current, loaded, total) => {
									if (total != 0) {
										progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
									} else {
										progress.setFileName(`${current}(已下载${parseSize(loaded)})`);
									}
								});
							};

							/**
							 * 
							 * @param { string[] } updates 
							 * @param { VoidFunction } proceed 
							 */
							let checkFileList = (updates, proceed) => {
								let n = updates.length;
								if (!n) {
									proceed();
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
											i--;
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

						}).catch(e => {
							game.UpdatingForAsset = false;
							button.innerHTML = '检查素材更新';
							button.disabled = false;
							response_catch(e);
							reduction();
						});
					}
				}
			},
			assetFont: {
				init: true,
				intro: '检查更新时，检查字体文件',
				name: '检查字体素材',
				onclick: assetConfigFun('assetFont')
			},
			assetAudio: {
				init: true,
				intro: '检查更新时，检查音频文件',
				name: '检查音频素材',
				onclick: assetConfigFun('assetAudio')
			},
			assetSkin: {
				init: false,
				intro: '检查更新时，检查皮肤文件',
				name: '检查皮肤素材',
				onclick: assetConfigFun('assetSkin')
			},
			assetImage: {
				init: true,
				intro: '检查更新时，检查图片文件(部分)',
				name: '检查图片素材(部分)',
				onclick: assetConfigFun('assetImage')
			},
			assetImageFull: {
				init: true,
				intro: '检查更新时，检查图片文件(全部)',
				name: '检查图片素材(全部)',
				onclick: assetConfigFun('assetImageFull')
			},
			address: {
				clear: true,
				nopointer: true,
				name: `</br>
					最新完整包下载地址：
					<a target='_self' href='https://hub.fgit.ml/libccy/noname/archive/refs/heads/master.zip'><span style='text-decoration: underline;'>点击下载</span></a></br>
					</br>
				`,
			}
		},
		help: {},
		package: {
			intro: `
				<span style='font-weight: bold;'>※【假装无敌】扩展也覆盖了游戏内的检查更新按钮，使用时请注意避免出现bug。</span></br>
				安装本扩展后会自动覆盖【自动检测更新】的功能，不论扩展是否开启</br>
				点击按钮即可在线更新，文件下载失败会自动重新下载。目前已经覆盖了游戏自带的更新按钮</br>
				<span style='color:red'>※请不要在更新时关闭游戏或主动断网，否则后果自负</span></br>
			`,
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.62",
		},
		files: { "character": [], "card": [], "skill": [] }
	}
});