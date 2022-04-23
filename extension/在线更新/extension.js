/// <reference path="../../typings/index.d.ts" />
"use strict";
game.import("extension", function(lib, game, ui, get, ai, _status) {
	
	function canUpdate() {
		if (typeof game.writeFile != 'function') {
			return '此版本无名杀不支持写入文件！';
		}
		
		// if (!navigator.onLine) {
		// 	return '此设备未联网！';
		// }
		
		return true;
	}

	let brokenFileArr = lib.config.extension_在线更新_brokenFile || [];
	brokenFileArr = Array.from(new Set([...brokenFileArr, ...lib.config.brokenFile]));
	
	// 修改lib.config.extension_在线更新_brokenFile，同步修改brokenFileArr
	Object.defineProperty(lib.config, 'extension_在线更新_brokenFile', {
		configurable: true,
		enumerable: true,
		get() { 
            return brokenFileArr;
        },
		set(newValue) { 
            if (Array.isArray(newValue)) brokenFileArr = newValue;
        }
	});

	// 退出应用前，保存config
	window.addEventListener('beforeunload', () => {
		if (brokenFileArr && brokenFileArr.length) {
			for (let i = 0; i < brokenFileArr.length; i++) {
				game.removeFile(brokenFileArr[i]);
			}
		}
		game.saveExtensionConfig('在线更新', 'brokenFile', Array.from(new Set([...brokenFileArr, ...lib.config.brokenFile])));
	});

    /**
     * @description 请求结果分析状态码
     * @param { string } current 
     * @param { Response } response 
     * @returns { Promise<string> | never } response.text() | throw new Error()
     */
	
	const response_then = (current, response) => {
		const ok = response.ok, 
		status = response.status, 
		statusText = response.statusText;
		//const { ok, status, statusText } = response;
		if (!ok) {
			//状态码
			switch(status) {
				case 400 :
					game.print("客户端请求报文中存在语法错误，服务器无法理解");
					throw {current, status, statusText: "客户端请求报文中存在语法错误，服务器无法理解"};
				case 403 :
					game.print("服务器拒绝执行此请求");
					throw {current, status, statusText: "服务器拒绝执行此请求"};
				case 404 :
					game.print("更新内容文件不存在");
					throw {current, status, statusText: "更新内容文件不存在"};
				case 429 :
					game.print("当前请求太多，稍后再试");
					throw {current, status, statusText: "当前请求太多，请稍后再试"};
				default:
					game.print(statusText);
					throw {current, status, statusText};
			}
		} else {
			return response.text();
		}
	};
	
    /**
     * @description 请求错误处理
     * @param { { current: string, status: number, statusText: string } | Error } err 
     */

	const response_catch = err => {
		console.error(err);
		game.print(err);
		if (typeof err  === 'object' && err.constructor != Error) {
			const current = err.current, 
			status = err.status, 
			statusText = err.statusText;
			//const { current, status, statusText } = err;
			if (typeof current == 'undefined' || typeof status == 'undefined' || typeof statusText == 'undefined') {
				const stack = err.stack;
				//const { stack } = err;
				if (!stack) {
					alert( JSON.stringify(err) );
				} else {
					alert( decodeURI(stack) );
				}
			} else {
				alert(`网络请求目标：${current}\n状态码：${status}\n状态消息：${statusText}`);
			}
		} else {
            if (err.message == 'Failed to fetch') {
                alert('网络请求失败');
            } else {
                alert(err);
            }
		}

        if (typeof game.updateErrors == 'number' && game.updateErrors >= 5) {
            alert('检测到获取更新失败次数过多，建议您更换无名杀的更新源');
            game.updateErrors = 0;
        }
	};

    const assetConfigDiv = {};

    const assetConfigFun = function (configName) {
        return function(bool) {
            //game.saveConfig(this._link.config._name, bool);
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
	
	return {
		name: "在线更新",
		editable: false,
		content: function(config, pack) {
            // 如果概念武将开启，则不执行
            if (game.getExtensionConfig('概念武将', 'enable')) {
                return console.log('概念武将开启，不执行覆盖游戏更新操作');
            }
            // 替换无名杀自带的更新功能
            // const { checkForUpdate, checkForAssetUpdate } = this[4].code.config;

            const assetConfigFun = pack.code.config;

            const checkForUpdate = assetConfigFun.checkForUpdate, 
            checkForAssetUpdate = assetConfigFun.checkForAssetUpdate;
            
            const interval = setInterval(() => {
                /*
                const menu = ui ?. menuContainer ?. childNodes ?. [0];
                const help = menu ?. querySelector('.menu-help');
                const liArray = [...(help ?. querySelectorAll('li') || [])];
                if (!menu || !help || !liArray || !liArray.length) return;
                */
                if (typeof game.download != 'function' || typeof game.writeFile != 'function') return clearInterval(interval);
                if (!ui.menuContainer || !ui.menuContainer.firstElementChild) return;
                const menu = ui.menuContainer.firstElementChild;
                const active = menu.querySelectorAll('.active');
                if (active.length < 2) return;
                if (active[0].innerText != '其它' || active[1].innerText != '更新') return;
                const help = menu.querySelector('.menu-help');
                const liArray = Array.from(help.querySelectorAll('li'));
                if (!liArray.length) return;

                let updateButton = null;
                let assetUpdateButton = null;

                try {
                    updateButton = liArray[0].childNodes[1].firstElementChild;
                    assetUpdateButton = liArray[1].childNodes[1].firstElementChild;
                } catch (error) {
                    return console.log("获取按钮异常：", {
                        error,
                        liArray,
                        updateButton,
                        assetUpdateButton
                    });
                }

                if (
                    updateButton && updateButton.innerText == "检查游戏更新"
                    &&
                    assetUpdateButton && assetUpdateButton.innerText == "检查素材更新"
                ) {
                    updateButton.onclick = checkForUpdate.onclick.bind(updateButton);
                    assetUpdateButton.onclick = checkForAssetUpdate.onclick.bind(assetUpdateButton);
                } else {
                    return console.log("获取按钮异常：", {
                        liArray,
                        updateButton,
                        assetUpdateButton
                    });
                }

                // 插入一条修改说明
                const ul = help.querySelector('ul');
                const insertLi = ul.insertBefore(document.createElement('li'), ul.firstElementChild);
                insertLi.innerHTML = "<span class='bluetext'>更新功能已由【在线更新】扩展覆盖</span></br>";
                // a标签跳转到扩展界面
                const jumpToExt = document.createElement('a');
                jumpToExt.href = "javascript:void(0)";
                jumpToExt.onclick = () => ui.click.extensionTab('在线更新');

                if (typeof HTMLDivElement.prototype.css == 'function') {
                    HTMLDivElement.prototype.css.call(jumpToExt, {
                        color: 'white',
                        innerHTML: '点击跳转至扩展界面'
                    });
                } else {
                    jumpToExt.innerHTML = '点击跳转至扩展界面';
                    jumpToExt.style.color = 'white';
                }
                
                insertLi.appendChild(jumpToExt);

				const checkBoxArray = Array.from(liArray[1].childNodes[1].childNodes).filter(item => {
					return item instanceof HTMLInputElement && item.type == 'checkbox';
				});
                
                const addChangeEvt = function (item, configName) {
                    assetConfigDiv[configName + '_bindTarget'] = item;
                    item.checked = game.getExtensionConfig('在线更新', configName);
                    item.onchange = () => {
                        game.saveConfig(configName, item.checked);
                        assetConfigFun[configName].onclick(item.checked);
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
			Object.assign(lib.updateURLS, {
				fastgit: 'https://raw.fastgit.org/libccy/noname',
				xuanwu: 'https://kuangthree.coding.net/p/nonamexwjh/d/nonamexwjh/git/raw'
			});
			
			if (!game.getExtensionConfig('在线更新', 'update_link')) {
				game.saveConfig('update_link', 'coding');
                game.saveExtensionConfig('在线更新', 'update_link', 'coding');
                lib.updateURL = lib.updateURLS['coding'];
			}
			
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

            /**
             * @description 获取最快连接到的更新源
             * @param { object } updateURLS 
             * @param { object } translate 
             * @returns { never | Promise<{ success: Array<{ key: string, finish : number }>; failed: Error | Array<{ key: string, err : Error }>; fastest?: { key: string, finish : number }; } }
             */
            game.getFastestUpdateURL = function (updateURLS, translate) {
                updateURLS = updateURLS || lib.updateURLS;
                if (typeof updateURLS != 'object') throw new TypeError('updateURLS must be an object type');
                translate = translate || {
                    coding: 'Coding',
                    github: 'GitHub',
                    fastgit: 'GitHub镜像',
                    xuanwu: '玄武镜像'
                };
                if (typeof translate != 'object') throw new TypeError('translate must be an object type');
                const promises = [];
                const keys = Object.keys(updateURLS);
                keys.forEach(key => {
                    const url = updateURLS[key];
                    const start = new Date().getTime();
                    promises.push(
                        fetch(`${url}/master/game/update.js`)
                            .then(response => {
                                if (!response.ok) {
                                    return {
                                        key,
                                        err: new Error(`HTTP error! status: ${response.status}`)
                                    };
                                } else {
                                    const finish = new Date().getTime() - start;
                                    return { key, finish };
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

            /**
             * @description 通过@url参数下载文件，并通过onsuccess和onerror回调
             * @param { string } url 
             * @param { VoidFunction } onsuccess
             * @param { VoidFunction } onerror
             */

			game.shijianDownload = (url, onsuccess, onerror) => {
				//是否可以更新，每次都调用的原因是判断网络问题
				let alertStr;
				if( (alertStr = canUpdate()) !== true ) {
					return alert(alertStr);
				}
				
				let downloadUrl = url, path = '', name = url;
				if (url.indexOf('/') != -1) {
					path = url.slice(0, url.lastIndexOf('/'));
					name = url.slice(url.lastIndexOf('/') + 1);
				}
                /*console.log({
                    path, name
                });*/
				
				lib.config.brokenFile.add(url);
				
				if(url.indexOf('http') != 0){
					url = lib.updateURL + '/master/' + url;
				}
				
				function success() {
					lib.config.brokenFile.remove(downloadUrl);
					game.saveConfigValue('brokenFile');
					if(typeof onsuccess == 'function'){
						onsuccess();
					}
				}
				
				function error(e, statusText) {
					if(typeof onerror == 'function'){
						onerror(e, statusText);
					} else console.error(e);
				}
				
				fetch(url)
					.then(response => {
						const ok = response.ok, 
						status = response.status, 
						statusText = response.statusText;
						//const { ok, status, statusText } = response;
						if (!ok) {
							return error(status, statusText);
						} else {
							return response.arrayBuffer();
						}
					})
					.then(arrayBuffer => {
						// 写入文件
						if (!arrayBuffer) return;
						game.ensureDirectory(path, () => {
			                if (lib.node && lib.node.fs) {
			                    lib.node.fs.writeFile(__dirname + '/' + path + '/' + name, Buffer.from(arrayBuffer), null, e => {
			                        if (e) {
			                            error(e, 'writeFile');
			                        } else {
			                            success();
			                        }
			                    });
			                } else if (typeof window.resolveLocalFileSystemURL == 'function') {
			                    window.resolveLocalFileSystemURL(lib.assetURL + path, entry => {
			                        entry.getFile(name, { create: true }, fileEntry => {
			                            fileEntry.createWriter(fileWriter => {
			                                fileWriter.onwriteend = () => {
			                                    success();
			                                };
			                                fileWriter.write(arrayBuffer);
			                            }, e => {
			                                error(e, 'writeFile');
			                            });
			                        });
			                    });
			                }
			            });
						
					})
					.catch(error);
			};
			
			game.shijianDownloadFile = (current, onsuccess, onerror) => {
				//是否可以更新，每次都调用的原因是判断网络问题
				let alertStr;
				if( (alertStr = canUpdate()) !== true ) {
					return alert(alertStr);
				}
				// 重新下载
				let reload = (err, statusText) => {
					onerror(current, statusText);
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
				game.shijianDownload(current, function success() {
					onsuccess(current);
				}, function error(e, statusText) {
					if (typeof e == 'number') {
						//状态码
						switch(e) {
							case 404 :
								game.print("文件不存在，不需要重新下载");
								console.log({current, e, statusText: "文件不存在，不需要重新下载"});
								return onsuccess(current, true);
							case 429 :
								game.print("请求太多，稍后重新下载");
								//console.error({current, e, statusText: "请求太多，稍后重新下载"});
								onerror(current, e, "请求太多，请稍后重新下载");
								break;
							default:
								game.print(e);
								//console.error(current, e);
								onerror(current, e, statusText);
						}
					} else if (statusText === 'writeFile') {
						game.print("写入文件失败");
						//console.error(current, '写入文件失败');
						onerror(current, e, '写入文件失败');
					} else {
						game.print(e);
						//console.error(current, e);
						onerror(current, e, statusText);
					}
					reload(e, statusText);
				});
			};
			
			game.shijianMultiDownload = (list, onsuccess, onerror, onfinish) => {
				//是否可以更新，每次都调用的原因是判断网络问题
				let alertStr;
				if( (alertStr = canUpdate()) !== true ) {
					return alert(alertStr);
				}
				//不修改原数组
				list = list.slice(0);
				let download = () => {
					if (list.length) {
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
						}, (e, statusText) => {
							onerror(current, e, statusText);
						});
			
					} else {
						onfinish();
					}
				};
				download();
			};
			
            // 如果有没下载完就重启的文件
            // 注：lib.config.brokenFile里的文件，将在游戏启动后自动删除
			if (brokenFileArr && brokenFileArr.length) {
                if (confirm(`检测到有未下载成功的文件(${brokenFileArr})，是否进行重新下载?`)) {
                    console.log('未下载成功的文件：', brokenFileArr);
                    game.shijianMultiDownload(brokenFileArr, (current, bool) => {
                        brokenFileArr.remove(current);
                        game.saveExtensionConfig('在线更新', 'brokenFile', brokenFileArr);
                        lib.config.brokenFile.remove(current);
                        game.saveConfigValue('brokenFile');
                        if (bool) {
                            console.error(`${current}不存在，不需要下载`);
                        } else {
                            console.log(`${current}下载成功`);
                        }
                    }, (current, e, statusText) => {
                        console.error(`${current}下载失败`, { e, statusText });
                    }, () => {
                        alert('下载完成，将自动重启');
                        game.reload();
                    });
                } else {
                    console.log('不进行重新下载，已清空失败列表');
                    brokenFileArr = [];
                    lib.config.brokenFile = [];
                    game.saveConfigValue('brokenFile');
                }
			}
		},
		config: {
            show_version: {
                clear: true,
                nopointer: true,
                name: '扩展版本： v1.28',
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
					game.saveConfig('update_link', item);
					game.saveExtensionConfig('在线更新', 'update_link', item);
					lib.updateURL = lib.updateURLS[item] || lib.updateURLS.coding;
				},
			},
            getFastestUpdateURL: {
                clear: true,
                intro: '点击测试最快连接到的更新源',
                name: '<span style="text-decoration: underline;">测试最快连接到的更新源</span>',
                onclick: function () {
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
			checkForUpdate: {
				//检查游戏更新
				clear: true,
				intro: '点击检查游戏更新',
				name: '<button type="button">检查游戏更新</button>',
				onclick: function() {
					//是否可以更新，每次都调用的原因是判断网络问题
					let alertStr;
					if( (alertStr = canUpdate()) !== true ) {
						return alert(alertStr);
					}
                    let button;
                    if (this instanceof HTMLButtonElement) {
                        button = this;
                    } else {
                        button = this.childNodes[0].childNodes[0];
                    }
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
						fetch(`${updateURL}game/update.js`)
							.then(response => {
								return response_then('game/update.js', response);
							})
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
                                //要更新的版本和现有的版本一致
								if (update.version == lib.version) {
									if (!confirm('当前版本已经是最新，是否覆盖更新？')) {
										game.Updating = false;
										button.innerHTML = '检查游戏更新';
										button.disabled = false;
										return;
									}
								} else {
                                    let entries1 = lib.version.split('.').map(item => Number(item) || 0).entries();
                                    let entries2 = update.version.split('.').map(item => Number(item) || 0).entries();
                                    
                                    do {
                                        let next1 = entries1.next();
                                        let next2 = entries2.next();

                                        // 当前游戏版本
                                        let version1 = next1.value ? next1.value[1] : 0;
                                        // 要更新的版本，如果当前游戏版本大于这个版本，则提示用户
                                        let version2 = next2.value ? next2.value[1] : 0;

                                        if (version1 > version2) {
                                            if (!confirm('游戏版本比服务器提供的版本还要高，是否覆盖更新？')) {
                                                game.Updating = false;
                                                button.innerHTML = '检查游戏更新';
                                                button.disabled = false;
                                                return;
                                            } else {
                                                break;
                                            }
                                        } else if (next1.done && next2.done || version1 < version2) {
                                            break;
                                        }
                                    } while (true);
                                }

								let files = null;
								let version = lib.version;

								let goupdate = (files, update) => {
									lib.version = update.version;
									fetch(`${updateURL}game/source.js`)
										.then(response => {
											return response_then('game/source.js', response);
										})
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
															const size = lib.node.fs.statSync(__dirname + '/' + entry).size;
															size == 0 && (err = true);
														}
														!err && updates.splice(i--, 1);
													});
												}
											}

											button.remove();

                                            if (this != button) {
                                                let consoleMenu = document.createElement('button');
                                                consoleMenu.setAttribute('type', 'button');
                                                consoleMenu.innerHTML = '跳转到命令页面';
                                                consoleMenu.onclick = ui.click.consoleMenu;
                                                parentNode.appendChild(consoleMenu);
                                                parentNode.appendChild(document.createElement('br'));
                                            }

											let span = document.createElement('span');
											let n1 = 0;
											let n2 = updates.length;
											span.innerHTML = `正在下载文件（${n1}/${n2}）`;
                                            parentNode.insertBefore(span, parentNode.firstElementChild);

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
											}, (current, e, statusText) => {
												console.error(`${current}下载失败`, {e, statusText});
											}, () => {
												span.innerHTML = `游戏更新完毕（${n1}/${n2}）`;
												setTimeout(() => {
                                                    if (!game.UpdatingForAsset) {
                                                        alert('更新完成');
                                                        if (game.unwantedToUpdateAsset) game.allUpdatesCompleted = true;
													}
													game.Updating = false;
                                                    game.unwantedToUpdate = true;
                                                    typeof consoleMenu != 'undefined' && consoleMenu.remove();
                                                    parentNode.insertBefore(document.createElement('br'), parentNode.firstElementChild);
													let button2 = document.createElement('button');
													button2.innerHTML = '重新启动';
													button2.onclick = game.reload;
													button2.style.marginTop = '8px';
                                                    parentNode.insertBefore(button2, parentNode.firstElementChild);
												}, 1000);
											});
										})
										.catch(err => {
                                            console.log('还原版本');
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
										function(index) {
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
							})
							.catch(err => {
								response_catch(err);
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
			checkForAssetUpdate: {
				//检查素材更新
				clear: true,
				intro: '点击检查素材更新',
				name: '<button type="button">检查素材更新</button>',
				onclick: function() {
					//是否可以更新，每次都调用的原因是判断网络问题
					let alertStr;
					if( (alertStr = canUpdate()) !== true ) {
						return alert(alertStr);
					}
                    let button;
                    if (this instanceof HTMLButtonElement) {
                        button = this;
                    } else {
                        button = this.childNodes[0].childNodes[0];
                    }
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
						fetch(`${updateURL}game/asset.js`)
							.then(response => {
								return response_then('game/asset.js', response);
							})
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
                                    if (this != button) {
                                        let consoleMenu = document.createElement('button');
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
									}, (current, e, statusText) => {
										console.error(`${current}下载失败`, {e, statusText});
									}, () => {
										span.innerHTML = `素材更新完毕（${n1}/${n2}）`;
										setTimeout(() => {
											if(!game.Updating) {
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
											button2.style.marginTop = '8px';
                                            parentNode.insertBefore(button2, parentNode.firstElementChild);
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
		},
		help: {},
		package: {
            intro: "点击按钮即可在线更新，文件下载失败会自动重新下载。</br><span style='color:red'>※请不要在更新时关闭游戏或主动断网，否则后果自负</span></br>最新完整包下载地址：<a target='_self' href='https://hub.fastgit.org/libccy/noname/archive/refs/heads/master.zip'><span style='text-decoration: underline;'>点击下载</span></a>",
			author: "诗笺",
			diskURL: "",
			forumURL: "",
			version: "1.28",
		},
	}
});
