(function ({ lib, game, ui, get, ai, _status }) {

    const path = window ?. require ?. ('path') || {
        join(...paths) {
            return paths.map(item => {
                return item.replaceAll('\\', '/');
            }).join('/');
        }
    };

    lib.moduleExtensions = {};

    //执行模块js
    lib.init.moduleJs = (path, file, onload, onerror) => {
        if (path && path[path.length - 1] == '/') {
            path = path.slice(0, path.length - 1);
        }
        if (Array.isArray(file)) {
            for (let i = 0; i < file.length; i++) {
                lib.init.moduleJs(path, file[i], onload, onerror);
            }
        } else {
            let script = document.createElement('script');
            script.type = 'module';
            if (path && !file) {
                script.src = path;
            }
            else if (path && file) {
                script.src = path + '/' + file + ".js";
            }
            if (path && path.indexOf('http') == 0) {
                script.src += '?rand=' + get.id();
                script.addEventListener('load', function () {
                    script.remove();
                });
            }
            document.head.appendChild(script);
            if (typeof onload == 'function') {
                script.addEventListener('load', onload);
                script.addEventListener('error', onerror);
            }
            return script;
        }
    };

    lib.init.moduleJs('extension/应用配置', 'export');

    //导入新框架扩展
    //经过测试，也可导入原框架的扩展
    game.importModuleExtension = async (extName) => {
        const extPath = path.join(window ?. __dirname ?? lib.assetURL, 'extension', extName, 'extension.js');
        const { default: extension } = await import(extPath);
        if (!extension) return false;
        //将extension转换为无名杀的形式
        const { name, intro, author, version, changeLog, changeApi, config, content, precontent, package, onremove } = extension;
        //修改或创建游戏api
        if (typeof changeApi == 'object') {
            const apiArr = ['lib', 'game', 'ui', 'get', 'ai', '_status'];
            const cleanChangeApi = Object.entries(changeApi).filter(item => apiArr.includes(item[0]));

            function getValue(array) {
                return array.reduce((previous, current) => {
                    return previous ?. [current];
                }, window.newExtensionApi);
            }

            function changeToSource(key, value, key_loop_list) {
                const oldValue = getValue(key_loop_list);
                const source = getValue(key_loop_list.slice(0, key_loop_list.length - 1));
                if (typeof value == 'function') {
                    //source[key] = value.bind(source, oldValue);
                    source[key] = function(...args) {
                        return value.apply(this, [oldValue, ...args]);
                    };
                    console.log(`【${name}】扩展${oldValue ? '修改' : '创建'}了${key_loop_list.join('.')}`);
                } else {
                    source[key] = value;
                    console.log(`【${name}】扩展${oldValue ? '修改' : '创建'}了${key_loop_list.join('.')}, 值为：`, value);
                }
            }

            function loop_changeApi(object, key_loop_list = []) {
                for (let [key_name, key_value] of object) {
                    const source = getValue(key_loop_list);
                    if (typeof key_value == 'object' && source[key_name]) {
                        loop_changeApi(Object.entries(key_value), key_loop_list.concat(key_name));
                    } else {
                        changeToSource(key_name, key_value, key_loop_list.concat(key_name));
                    }
                }
            }

            loop_changeApi(cleanChangeApi);
        }
        lib.moduleExtensions[name] = { name, intro, author, version, changeLog, changeApi, config, content, precontent, package, onremove };
        //然后导入
        game.loadExtension({
            name, config, content, precontent,
            package: {
                ...package,
                intro, author, version
            },
            onremove: () => {
                //extension ?. onremove ?. ();
                lib.moduleExtensions[name] ?. onremove ?. ();
                lib.config.moduleExtensions.remove(name);
                game.saveConfigValue('moduleExtensions');
            },
        });

        // 扩展更新提示
        if (lib.config?.[`extension_${extName}_enable`] === true && Array.isArray(changeLog) && lib.config?.[`extension_${extName}_version`] != version) {
            lib.arenaReady.push(function() {
                let ul = document.createElement('ul');
                ul.style.textAlign = 'left';
                let players = null,
                    cards = null;
                for (let i = 0; i < changeLog.length; i++) {
                    if (changeLog[i].indexOf('players://') == 0) {
                        try {
                            players = JSON.parse(changeLog[i].slice(10));
                        } catch (e) {
                            players = null;
                        }
                    } else if (changeLog[i].indexOf('cards://') == 0) {
                        try {
                            cards = JSON.parse(changeLog[i].slice(8));
                        } catch (e) {
                            cards = null;
                        }
                    } else {
                        let li = document.createElement('li');
                        li.innerHTML = changeLog[i];
                        ul.appendChild(li);
                    };
                };
                let dialog = ui.create.dialog(`【${extName}】扩展更新内容<br>version: ${version}`, 'hidden');
                dialog.content.appendChild(ul);
                if (players) {
                    dialog.addSmall([players, 'character']);
                };
                if (cards) {
                    for (let i = 0; i < cards.length; i++) {
                        cards[i] = [get.translation(get.type(cards[i])), '', cards[i]]
                    };
                    dialog.addSmall([cards, 'vcard']);
                };
                dialog.open();
                let hidden = false;
                if (!ui.auto.classList.contains('hidden')) {
                    ui.auto.hide();
                    hidden = true;
                };
                game.pause();
                let control = ui.create.control('确定', function () {
                    dialog.close();
                    control.close();
                    if (hidden) ui.auto.show();
                    game.resume();
                });
            });
        }

        //保存扩展版本
        game.saveConfig(`extension_${extName}_version`, version);
    };

    lib.config.moduleExtensions ??= [];
    for (let extension of lib.config.moduleExtensions) {
        game.importModuleExtension(extension);
    }

})(window.newExtensionApi);