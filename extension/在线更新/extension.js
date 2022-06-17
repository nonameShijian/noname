/// <reference path="./typings/index.d.ts" />
/// <reference path="../../typings/index.d.ts" />
// @ts-check
"use strict";
// @ts-ignore
game.import("extension", function(lib, game, ui, get, ai, _status) {
	if (game.getExtensionConfig('概念武将', 'enable') || game.getExtensionConfig('假装无敌', 'enable')) {
		alert('【在线更新】扩展提示您：\r\n为避免额外的bug，本扩展不与【概念武将】和【假装无敌】扩展兼容');
		throw new Error('为避免额外的bug，本扩展不与【概念武将】和【假装无敌】扩展兼容');
	}

	if (typeof game.writeFile != 'function') {
		alert('【在线更新】扩展不能导入在不能写入文件的无名杀');
		throw new Error('【在线更新】扩展不能导入在不能写入文件的无名杀');
	}

	/**
	 * 判断是否能进行更新 
	 * @returns { Promise<string | void> }
	 */
	async function canUpdate() {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.timeout = 5000;
			xhr.open("GET", "https://www.baidu.com");
			xhr.send();
			xhr.onload = () => {
				if (xhr.status == 200 || xhr.status == 304) {
					resolve();
				} else {
					reject(xhr.status);
				}
			};
			xhr.ontimeout = () => reject('连接超时，请检查网络连接');
			xhr.onerror = () => reject('连接失败，请检查网络连接');
		});
	}

	if (!Array.isArray(lib.config.extension_在线更新_brokenFile)) {
		game.saveExtensionConfig('在线更新', 'brokenFile', []);
	} else {
		game.saveExtensionConfig('在线更新', 'brokenFile', Array.from(new Set([...lib.config.extension_在线更新_brokenFile])));
	}

	// 简单绑定一下游戏自带的更新选项和本扩展的更新选项
    const assetConfigDiv = {};
	/**
	 * 
	 * @param { string } configName 配置名
	 * @returns { (bool: boolean) => void }
	 */
    const assetConfigFun = function (configName) {
        return function(bool) {
            game.saveExtensionConfig('在线更新', configName, bool);
            const div = assetConfigDiv[configName];
            const bindTarget = assetConfigDiv[configName + '_bindTarget'];
            if (this && this._link) {
                !div && (assetConfigDiv[configName] = this);
                bindTarget && (bindTarget.checked = bool);
            } else if (div) {
                div.classList.toggle('on', bool);
            }
        }
    };

	/**
	 * @description 请求错误处理
	 * @param { { url: string, error: number | Error, message: string } | Error } err 
	 */
	const response_catch = err => {
		console.error(err);
		game.print(err);
		if (typeof err === 'object' && !(err instanceof Error)) {
			const { url, error, message } = err;
			if (typeof url !== 'undefined' && typeof error !== 'undefined' && typeof message !== 'undefined') {
				alert(`网络请求目标：${url}\n状态消息：${message}`);
			}
		} else {
			if (err.message == 'Failed to fetch') {
				alert('网络请求失败');
			} else {
				alert(err.message);
			}
		}

		if (typeof game.updateErrors == 'number' && game.updateErrors >= 5) {
			alert('检测到获取更新失败次数过多，建议您更换无名杀的更新源');
			game.updateErrors = 0;
		}
	};

	/**
	* @param { XMLHttpRequest } xhr
	*/
	function createXHRResult(xhr) {
		return new Promise((resolve, reject) => {
			xhr.send();
			xhr.onreadystatechange = () => {
				if (xhr.readyState != 4) return;
				if (xhr.status == 200 || xhr.status == 304) {
					resolve(xhr.response);
				} else if (xhr.status != 0) {
					reject({
						url: xhr.responseURL,
						error: xhr.status,
						message: '其他错误'
					});
				}
			};
			xhr.ontimeout = e => reject({
				url: xhr.responseURL,
				error: e,
				message: '连接超时'
			});
			xhr.onerror = e => reject({
				url: xhr.responseURL,
				error: e,
				message: '连接失败'
			});
		});
	}

	/** @type myResponse */
	class myResponse {
		/** @type XMLHttpRequest */
		xhr;
		used = false;
		/**
		 * @param { XMLHttpRequest } xhr
		 */
		constructor(xhr) {
			this.xhr = xhr;
		}
		/** @returns { Promise<string> } */
		text() {
			if (this.used == true) throw '不能重复设置返回类型';
			this.used = true;
			this.xhr.responseType = 'text';
			return createXHRResult(this.xhr);
		}
		/** @returns { Promise<ArrayBuffer> } */
		arrayBuffer() {
			if (this.used == true) throw '不能重复设置返回类型';
			this.used = true;
			this.xhr.responseType = 'arraybuffer';
			return createXHRResult(this.xhr);
		}
		json() {
			if (this.used == true) throw '不能重复设置返回类型';
			this.used = true;
			this.xhr.responseType = 'json';
			return createXHRResult(this.xhr);
		}
		abort() {
			return this.xhr.abort();
		}
		addEventListener(name, fun, options) {
			return this.xhr.addEventListener(name, fun, options);
		}
	}

	/**
	 * 
	 * @param { string } url 资源请求地址
	 * @param { fetchOptions } options 配置
	 * @returns { Promise<myResponse> }
	 */
	const myFetch = function (url, options = { timeout: game.getExtensionConfig('在线更新', 'timeout') || 3000 }) {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.timeout = options.timeout;
			xhr.open("GET", url);
			resolve(new myResponse(xhr));
		});
	};

	const parseSize = function (limit) {
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
	
	return {
		name: "在线更新",
		editable: false,
		content: function(config, pack) {
            // 替换无名杀自带的更新功能
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

				// 获取复选框
				/** @type HTMLInputElement[] */
				// @ts-ignore
				const checkBoxArray = Array.from(liArray[1].childNodes[1].childNodes).filter(item => {
					return item instanceof HTMLInputElement && item.type == 'checkbox';
				});
				/**
				 * 与本扩展的更新选项绑定
				 * @param { HTMLInputElement } item
				 * @param { string } configName
				 */
                const addChangeEvt = function (item, configName) {
                    assetConfigDiv[configName + '_bindTarget'] = item;
                    item.checked = game.getExtensionConfig('在线更新', configName);
                    item.onchange = () => {
                        game.saveConfig(configName, item.checked);
						assetConfigFun[configName] && assetConfigFun[configName].onclick(item.checked);
					}
                };

                checkBoxArray.forEach((item, index) => {
                    //字体素材
                    if (index == 0) {
                        addChangeEvt(item, 'assetFont');
                    }
                    //音效素材
                    else if (index == 1) {
                        addChangeEvt(item, 'assetAudio');
                    }
                    //皮肤素材
                    else if (index == 2) {
                        addChangeEvt(item, 'assetSkin');
                    }
                    //图片素材精简
                    else if (index == 3) {
                        addChangeEvt(item, 'assetImage');
                    }
                    //图片素材完整
                    else if (index == 4) {
                        addChangeEvt(item, 'assetImageFull');
                    }
                });

                clearInterval(interval);
                console.log("【在线更新】扩展已修改更新界面");
            }, 500);
        },
		precontent: function() {
			// 添加两个更新地址
			Object.assign(lib.updateURLS, {
				fastgit: 'https://raw.fastgit.org/libccy/noname',
				xuanwu: 'https://kuangthree.coding.net/p/nonamexwjh/d/nonamexwjh/git/raw'
			});
			
			// 初始化，更新地址修改回coding
			if (!game.getExtensionConfig('在线更新', 'update_link')) {
				game.saveConfig('update_link', 'coding');
                game.saveExtensionConfig('在线更新', 'update_link', 'coding');
                lib.updateURL = lib.updateURLS['coding'];
			}
			
			// 修改游戏原生更新选项，插入上面的两个更新地址
			if (lib.configMenu.general.config.update_link) {
				lib.configMenu.general.config.update_link = {
					unfrequent: true,
					name:'更新地址',
					//init: (lib.updateURL == lib.updateURLS['coding'] ? 'coding' : 'fastgit'),
                    init: (() => {
                        for (const url in lib.updateURLS) {
                            if (lib.updateURL == lib.updateURLS[url]) {
                                return url;
                            }
                        }
                        game.saveConfig('update_link', 'coding');
                        game.saveExtensionConfig('在线更新', 'update_link', 'coding');
                        lib.updateURL = lib.updateURLS.coding;
                        return 'coding';
                    })(),
					item:{
						coding: 'Coding',
						github: 'GitHub',
						fastgit: 'GitHub镜像',
						xuanwu: '玄武镜像'
					},
					onclick: function(item) {
						game.saveConfig('update_link', item);
						game.saveExtensionConfig('在线更新', 'update_link', item);
						lib.updateURL = lib.updateURLS[item] || lib.updateURLS.coding;
					},
				};
			}
			
			game.getFastestUpdateURL = function (updateURLS = lib.updateURLS, translate = {
				coding: 'Coding',
				github: 'GitHub',
				fastgit: 'GitHub镜像',
				xuanwu: '玄武镜像'
			}) {
                if (typeof updateURLS != 'object') throw new TypeError('updateURLS must be an object type');
                if (typeof translate != 'object') throw new TypeError('translate must be an object type');
                const promises = [];
                const keys = Object.keys(updateURLS);
                keys.forEach(key => {
                    const url = updateURLS[key];
                    const start = new Date().getTime();
                    promises.push(
						myFetch(`${url}/master/game/update.js`)
							.then(async response =>{
								try {
									await response.text();
									const finish = new Date().getTime() - start;
									return { key, finish };
								} catch(e) {
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
				
				lib.config.extension_在线更新_brokenFile.add(url);
				game.saveConfigValue('extension_在线更新_brokenFile');
				
				if(url.indexOf('http') != 0){
					url = lib.updateURL + '/master/' + url;
				}
				
				function success() {
					lib.config.extension_在线更新_brokenFile.remove(downloadUrl);
					game.saveConfigValue('extension_在线更新_brokenFile');
					if(typeof onsuccess == 'function'){
						onsuccess();
					}
				}
				
				function error(e, statusText) {
					if(typeof onerror == 'function'){
						onerror(e, statusText);
					} 
					else console.error(e);
				}
				
				if (window.FileTransfer) {
					let fileTransfer = new FileTransfer();
					fileTransfer.download(encodeURI(url), encodeURI(lib.assetURL + path + '/' + name), success, error);
				} else {
					myFetch(url)
						.then(response => {
							if (typeof onprogress == 'function') {
								response.addEventListener('progress', e => {
									onprogress(e.loaded, e.total);
								});
							}
							return response.arrayBuffer();
						})
						.then(arrayBuffer => {
							// 写入文件
							// 先创建指定文件夹
							game.ensureDirectory(path, () => {
								const fs = require('fs');
								const filePath = __dirname + '/' + path + '/' + name;
								// 如果是个文件夹，就退出
								if (fs.existsSync(filePath)) {
									const stat = fs.statSync(filePath);
									if (stat.isDirectory()) {
										console.error(`${path + '/' + name}是个文件夹`);
										alert(`${path + '/' + name}是个文件夹，不予下载。请将此问题报告给此更新源的管理员。`);
										lib.config.extension_在线更新_brokenFile.remove(path + '/' + name);
										game.saveConfigValue('extension_在线更新_brokenFile');
										return error(path + '/' + name, 'isDirectory');
									}
								}
								fs.writeFile(filePath, Buffer.from(arrayBuffer), null, e => {
									if (e) {
										error(e, 'writeFile');
									} else {
										success();
									}
								});
							});
						})
						.catch(err => {
							error(err.error, err.message);
						});
				}
			};
			
			game.shijianDownloadFile = (current, onsuccess, onerror, onprogress) => {
				// 500ms后重新下载
				let reload = () => {
					setTimeout(() => {
						let str1 = "正在下载：";
						let current3 = current.replace(lib.updateURL, '');
			
						if (current3.indexOf('theme') == 0) {
							game.print(str1 + current3.slice(6));
						} else if (current3.indexOf('image/skin') == 0) {
							game.print(str1 + current3.slice(11));
						} else {
							game.print(str1 + current3.slice(current3.lastIndexOf('/') + 1));
						}
						game.shijianDownloadFile(current, onsuccess, onerror);
					}, 500);
				};
				// 通过url下载文件
				game.shijianDownload(current, () => {
					onsuccess(current);
				}, (e, statusText) => {
					if (typeof e == 'number') {
						//状态码
						switch(e) {
							case 404 :
								game.print(`更新源中${current}文件不存在，不需要重新下载`);
								console.log(`更新源中${current}不存在，不需要重新下载`);
								lib.config.extension_在线更新_brokenFile.remove(current);
								game.saveConfigValue('extension_在线更新_brokenFile');
								return onsuccess(current, true);
							case 429 :
								game.print("当前请求太多，稍后重新下载");
								onerror(current);
								break;
							default:
								game.print(e);
								console.error(current, e);
								onerror(current);
								break;
						}
					} else {
						if ('连接超时' == statusText) {
							game.print(statusText);
							console.log(statusText);
							onerror(current);
						}
						else if (statusText === 'writeFile') {
							game.print("写入文件失败");
							onerror(current);
							if (!confirm(`写入文件失败(${current})，请检查路径是否正确。\n是否重新下载此文件？`)) {
								return onsuccess(current, true);
							}
						} else if (statusText === 'isDirectory') {
							console.log(`${current}是个文件夹，不需要重新下载`);
							return onsuccess(current, true);
							// @ts-ignore
						} else if (typeof e.exception == 'string' && e.exception.startsWith('Unable to resolve host')) {
							console.log('网址解析错误,下载不了');
							return onsuccess(current, true);
							// @ts-ignore
						} else if (e.http_status === null) {
							console.log('http码为null');
							return onsuccess(current, true);
							// @ts-ignore
						} else if (e.http_status == 404 || e.http_status == '404') {
							console.log('指定网址中没有这个文件: ' + current);
							lib.config.extension_在线更新_brokenFile.remove(current);
							game.saveConfigValue('extension_在线更新_brokenFile');
							return onsuccess(current, true);
						} else {
							game.print(e);
							onerror(current);
						}
					}
					reload();
				}, (loaded, total) => {
					if (typeof onprogress == 'function') {
						onprogress(current, loaded, total);
					}
				});
			};
			
			game.shijianMultiDownload = async (list, onsuccess, onerror, onfinish, onprogress) => {
				//是否可以更新，每次都调用的原因是判断网络问题
				try { 
					await canUpdate() 
				} catch(e) { 
					if (typeof e == 'number') {
						return alert(`网络连接失败，HTTP返回码为${e}`);
					} else {
						return alert(e);
					}
				}
				//不修改原数组
				list = list.slice(0);
				let download = () => {
					if (list.length) {
						/** @type string */
						// @ts-ignore
						let current = list.shift();
						let str1 = "正在下载：";
						if (current.indexOf('theme') == 0) {
							game.print(str1 + current.slice(6));
						} else if (current.indexOf('image/skin') == 0) {
							game.print(str1 + current.slice(11));
						} else {
							game.print(str1 + current.slice(current.lastIndexOf('/') + 1));
						}
						game.shijianDownloadFile(current, (current, bool) => {
							onsuccess(current, bool);
							//自调用
							download();
						}, onerror, onprogress);
					} else {
						onfinish();
					}
				};
				download();
			};

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
					borderRadius: '8px'
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
				const index = ui.create.node('span', tip, '', value || '0');
				ui.create.node('span', tip, '', '/');
				const maxSpan =  ui.create.node('span', tip, '', (max + '') || '未知');

				ui.create.node('br', container);

				const progress = ui.create.node('progress', container);
				progress.setAttribute('value', value || '0');
				progress.setAttribute('max', max);

				parent.getTitle = () => caption.innerText;
				parent.setTitle = (title) => caption.innerText = title;
				parent.getFileName = () => file.innerText;
				parent.setFileName = (name) => file.innerText = name;
				parent.getProgressValue = () => progress.value;
				parent.setProgressValue = (value) => progress.value = index.innerText = value;
				parent.getProgressMax = () => progress.max;
				parent.setProgressMax = (max) => progress.max = maxSpan.innerText = max;
				return parent;
			};

			Object.defineProperty(game, 'checkForUpdate', {
				get() {
					return function () {
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
							alert('【在线更新】扩展提示您：\r\n未找到本扩展的更新按钮,自动检查更新失败');
						}
					}
				},
				set(v) {}
			});
			
            // 如果有没下载完就重启的文件
			let brokenFileArr = lib.config.extension_在线更新_brokenFile;
			window.addEventListener('beforeunload', () => {
				game.saveExtensionConfig('在线更新', 'brokenFile', [...new Set(brokenFileArr)]);
			});
			if (brokenFileArr && brokenFileArr.length) {
                if (confirm(`检测到有未下载成功的文件(${brokenFileArr})，是否进行重新下载?`)) {
                    console.log('未下载成功的文件：', brokenFileArr);
					// 复制文件数组，用来和进度绑定
					const copyList = [...brokenFileArr];
					// 当前下载进度
					let index = 0;
					// 创建下载进度div
					const progress = game.shijianCreateProgress('重新下载', copyList.length, copyList[0], index);
					document.body.appendChild(progress);
                    game.shijianMultiDownload(brokenFileArr, (current, bool) => {
						// 更新进度
						progress.setProgressValue(++index);
						progress.setFileName(copyList[index]);

                        brokenFileArr.remove(current);
                        game.saveExtensionConfig('在线更新', 'brokenFile', brokenFileArr);
                        lib.config.extension_在线更新_brokenFile.remove(current);
						game.saveConfigValue('extension_在线更新_brokenFile');
                        if (bool) {
                            console.error(`${current}不存在，不需要下载`);
                        } else {
                            console.log(`${current}下载成功`);
                        }
					}, current => {
						console.log(`${current}下载失败`);
                    }, () => {
						// 更新进度, 下载完成时不执行onsuccess而是onfinish
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
						if (!game.getExtensionConfig('在线更新', 'logProgress')) return false;
						if (total != 0) {
							progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
						} else {
							progress.setFileName(`${current}(已下载${parseSize(loaded)})`);
						}
					});
                } else {
                    console.log('不进行重新下载，已清空失败列表');
					lib.config.extension_在线更新_brokenFile = [];
					game.saveConfigValue('extension_在线更新_brokenFile');
                }
			}
		},
		config: {
            show_version: {
                clear: true,
                nopointer: true,
                name: '扩展版本： v1.33',
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
                    fastgit: 'GitHub镜像',
                    xuanwu: '玄武镜像',
                },
                onclick: function (item) {
                    let str;
                    switch(item) {
                        case 'coding' :
                            str = '目前最主要的更新源，但是这个免费的服务器很容易崩溃，最好不要在版本刚发布时使用此更新源';
                            break;
                        case 'github':
                            str = '国外的更新源，没有vpn或修改host设置的情况下几乎连不上此更新源';
                            break;
                        case 'fastgit':
                            str = 'github的镜像网址，拥有在国内访问的能力，但是偶尔会很卡，推荐使用此更新源';
                            break;
                        case 'xuanwu':
                            str = '由寰宇星城创建的更新源，和coding差不多，不过使用此更新源的人少，不容易崩溃。但是版本的更新需要他在苏婆更新后手动拉代码到服务器上';  
                            break;
                    }
                    typeof str != 'undefined' && alert(str);
                    return false;
                },
            },
			update_link:{
				name:'更新地址',
				//init: (lib.updateURL == lib.updateURLS['coding'] ? 'coding' : 'fastgit'),
                init: (() => {
                    for (const url in lib.updateURLS) {
                        if (lib.updateURL == lib.updateURLS[url]) {
                            return url;
                        }
                    }
                    game.saveConfig('update_link', 'coding');
                    game.saveExtensionConfig('在线更新', 'update_link', 'coding');
                    lib.updateURL = lib.updateURLS.coding;
                    return 'coding';
                })(),
				item:{
					coding: 'Coding',
					github: 'GitHub',
					fastgit: 'GitHub镜像',
					xuanwu: '玄武镜像',
				},
				onclick: function(item) {
					if (item != game.getExtensionConfig('在线更新', 'update_link')) {
						delete window.noname_update;
						game.saveConfig('update_link', item);
						game.saveExtensionConfig('在线更新', 'update_link', item);
						lib.updateURL = lib.updateURLS[item] || lib.updateURLS.coding;
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
				init: 3000,
				name: '网络超时时间（毫秒）',
				input: true,
				onblur: function (e) {
					let time = Number(e.target.innerText);
					if (isNaN(time)) {
						e.target.innerText = '3000';
						time = 3000;
					} else if (time < 300) {
						alert('暂时不允许超时时间小于300毫秒');
						e.target.innerText = '300';
						time = 300;
					}
					game.saveExtensionConfig('在线更新', 'timeout', time);
				},
			},
			logProgress: {
				init: false,
				intro: '下载文件时显示的进度条是否实时显示每个文件的下载进度',
				name: '显示每个文件的下载进度',
				onclick: function (bool) {
					game.saveExtensionConfig('在线更新', 'logProgress', bool);
				}
			},
			auto_check_update: {
				init: (() => {
					return lib.config['auto_check_update'] == true;
				})(),
				intro: '每次开启游戏后，自动跳转到本扩展页面检测更新',
				name: '每次启动自动检测更新',
				onclick: function(bool) {
					game.saveExtensionConfig('在线更新', 'auto_check_update', bool);
					game.saveConfig('auto_check_update', bool);
				}
			},
			checkForUpdate: {
				//检查游戏更新
				clear: true,
				intro: '点击检查游戏更新',
				name: '<button type="button">检查游戏更新</button>',
				onclick: async function() {
					//是否可以更新，每次都调用的原因是判断网络问题
					try {
						await canUpdate()
					} catch (e) {
						if (typeof e == 'number') {
							return alert(`网络连接失败，HTTP返回码为${e}`);
						} else {
							return alert(e);
						}
					}
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
                    if (button instanceof HTMLButtonElement && button.innerHTML == "检查游戏更新") {
                        if (game.Updating) {
                            return alert('正在更新游戏文件，请勿重复点击');
                        }
                        if (game.allUpdatesCompleted) {
                            return alert('游戏文件和素材全部更新完毕');
                        }
                    }
                    if (button.innerText != '检查游戏更新') return;
					game.Updating = true;
                    game.unwantedToUpdate = false;
                    // 获取更新失败超过一定次数提示更换更新源
                    typeof game.updateErrors == 'number' ? game.updateErrors++ : game.updateErrors = 0;
					const updateURL = lib.updateURL + '/master/';
					/** 还原状态 */
					const reduction = () => {
						game.Updating = false;
                        button.innerText = '检查游戏更新';
                        button.disabled = false;
					};
					if (button.disabled) {
						return;
					} else if (!game.download) {
						return alert('此版本不支持游戏内更新，请手动更新');
					} else {
						button.innerHTML = '正在检查更新';
						button.disabled = true;

						/** 有了window.noname_update后执行的代码 */
						function doNext() {
							/** @type { { version: string; update: string; changeLog: string[]; files: string[]; } } */
							// @ts-ignore
							let update = window.noname_update;
							//delete window.noname_update;
							game.saveConfig('check_version', update.version);
							//要更新的版本和现有的版本一致
							if (update.version == lib.version) {
								if (!confirm('当前版本已经是最新，是否覆盖更新？')) {
									game.Updating = false;
									button.innerHTML = '检查游戏更新';
									button.disabled = false;
									return;
								}
							} else {
								let v1 = lib.version.split('.').map(item => Number(item) || 0);
								let v2 = update.version.split('.').map(item => Number(item) || 0);
								for (let i = 0; i < v1.length && i < v2.length; i++) {
									v1[i] = v1[i] || 0;
									v2[i] = v2[i] || 0;
									if (v2[i] > v1[i]) break;
									if (v1[i] > v2[i]) {
										if (!confirm('游戏版本比服务器提供的版本还要高，是否覆盖更新？')) {
											game.Updating = false;
											button.innerHTML = '检查游戏更新';
											button.disabled = false;
											return;
										}
										break;
									}
								}
							}

							let files = null;
							let version = lib.version;

							let goupdate = (files, update) => {
								lib.version = update.version;
								myFetch(`${updateURL}game/source.js`)
									.then(response => response.text())
									.then(text => {
										try {
											eval(text);
										} catch (e) {
											game.Updating = false;
											button.innerHTML = '检查游戏更新';
											button.disabled = false;
											lib.version = version;
											return alert('source.js获取失败，请重试');
										}
										/** @type { string[] } */
										// @ts-ignore
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

										game.shijianMultiDownload(updates, (current, bool) => {
											if (bool) {
												game.print(`${current.slice(current.lastIndexOf('/') + 1)}不存在，不需要下载`);
												console.error(`${current.slice(current.lastIndexOf('/') + 1)}不存在，不需要下载`);
											} else {
												game.print(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
												console.log(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
											}
											n1++;
											span.innerHTML = `正在下载文件（${n1}/${n2}）`;
											// 更新进度
											progress.setProgressValue(n1);
											progress.setFileName(copyList[n1]);
										}, current => {
											console.error(`${current}下载失败`);
										}, () => {
											// 更新进度, 下载完成时不执行onsuccess而是onfinish
											progress.setProgressValue(copyList.length);
											progress.setFileName('下载完成');
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
													//button2.style.marginTop = '8px';
													parentNode.insertBefore(button2, parentNode.firstElementChild);
												}, 750);
											}, 250);
										}, (current, loaded, total) => {
											if (!game.getExtensionConfig('在线更新', 'logProgress')) return false;
											if (total != 0) {
												progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
											} else {
												console.log(current, loaded, parseSize(loaded));
												progress.setFileName(`${current}(已下载${parseSize(loaded)})`);
											}
										});
									})
									.catch(err => {
										//console.log('还原版本');
										// 还原版本
										lib.version = version;
										response_catch(err);
										reduction();
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
						}

						if (window.noname_update) {
							doNext();
						} else {
							myFetch(`${updateURL}game/update.js`)
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
									doNext();
								})
								.catch(err => {
									response_catch(err);
									reduction();
								});
						}
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
			checkForAssetUpdate: {
				//检查素材更新
				clear: true,
				intro: '点击检查素材更新',
				name: '<button type="button">检查素材更新</button>',
				onclick: async function() {
					//是否可以更新，每次都调用的原因是判断网络问题
					try {
						await canUpdate()
					} catch (e) {
						if (typeof e == 'number') {
							return alert(`网络连接失败，HTTP返回码为${e}`);
						} else {
							return alert(e);
						}
					}
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
					game.UpdatingForAsset = true;
                    game.unwantedToUpdateAsset = false;
                    // 获取更新失败超过一定次数提示更换更新源
                    typeof game.updateErrors == 'number' ? game.updateErrors++ : game.updateErrors = 0;
					let updateURL = lib.updateURL + '/master/';
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
						myFetch(`${updateURL}game/asset.js`)
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
								/** @type string[] */
								// @ts-ignore
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

								if (game.getExtensionConfig('在线更新', 'assetSkin')) {
									//如果更新素材
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
										//button.disabled = false;
										return;
									}
									button.remove();
									let consoleMenu;
									// @ts-ignore
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

									// @ts-ignore
                                    if (this == button) {
                                        parentNode.insertBefore(document.createElement('br'), span.nextElementSibling);
                                    }

									// 复制文件数组，用来和进度绑定
									const copyList = [...updates];
									// 创建下载进度div
									const progress = game.shijianCreateProgress('更新游戏素材', copyList.length, copyList[0]);
									// 修改样式，保证不和更新游戏的进度框重复
									progress.style.bottom = 'calc(25% - 75px)';

									game.shijianMultiDownload(updates, (current, bool) => {
										if (bool) {
											game.print(`${current.slice(current.lastIndexOf('/') + 1)}不存在，不需要下载`);
											console.error(`${current.slice(current.lastIndexOf('/') + 1)}不存在，不需要下载`);
										} else {
											game.print(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
											console.log(`${current.slice(current.lastIndexOf('/') + 1)}下载成功`);
										}
										n1++;
										span.innerHTML = `正在下载文件（${n1}/${n2}）`;
										// 更新进度
										progress.setProgressValue(n1);
										progress.setFileName(copyList[n1]);
									}, current => {
										console.error(`${current}下载失败`);
									}, () => {
										// 更新进度, 下载完成时不执行onsuccess而是onfinish
										progress.setProgressValue(copyList.length);
										progress.setFileName('下载完成');
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
												//button2.style.marginTop = '8px';
												parentNode.insertBefore(button2, parentNode.firstElementChild);
											}, 750);
										}, 250);
									}, (current, loaded, total) => {
										if (!game.getExtensionConfig('在线更新', 'logProgress')) return false;
										if (total != 0) {
											progress.setFileName(`${current}(已完成${Math.round((loaded / total) * 100)}%)`);
										} else {
											console.log(current, loaded, parseSize(loaded));
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
							})
							.catch(err => {
								response_catch(err);
								reduction();
							});
					}
				},
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
					最新完整包下载地址1：
					<a target='_self' href='https://hub.fastgit.org/libccy/noname/archive/refs/heads/master.zip'><span style='text-decoration: underline;'>点击下载</span></a></br>
					最新完整包下载地址2：
					<a target='_self' href='https://hub.fastgit.xyz/libccy/noname/archive/refs/heads/master.zip'><span style='text-decoration: underline;'>点击下载</span></a>
					</br>
				`,
			}
		},
		help: {},
		package: {
			intro: `
				<span style='font-weight: bold;'>※本扩展不与【概念武将】和【假装无敌】扩展兼容</span></br>
				安装本扩展后会自动覆盖【自动检测更新】的功能，不论扩展是否开启</br>
				点击按钮即可在线更新，文件下载失败会自动重新下载。目前已经覆盖了游戏自带的更新按钮</br>
				<span style='color:red'>※请不要在更新时关闭游戏或主动断网，否则后果自负</span></br>
			`,
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.33",
		},
	}
});
