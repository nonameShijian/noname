importScripts('./minizip-asm.min.js');

if (globalThis.__dirname.includes('electron.asar')) {
    const path = require('path');
    globalThis.__dirname = path.join(path.resolve(), 'resources/app/extension/拖拽读取');
    const oldData = Object.entries(globalThis.require);
    // @ts-ignore
    globalThis.require = function (moduleId) {
        try {
            return module.require(moduleId);
        } catch {
            return module.require(path.join(globalThis.__dirname, moduleId));
        }
    };
    oldData.forEach(([key, value]) => {
        globalThis.require[key] = value;
    });
}

const iconv = require('iconv-lite');

onmessage = function (e) {
    const [buffer, password, getExtName] = e.data;
    // @ts-ignore
    const mz = new Minizip(buffer);
    const fileList = mz.list({ encoding: "buffer" });
    const extJsList = fileList.filter(v => iconv.decode(v.filepath, 'GBK').endsWith('extension.js'));
    const infoJsonList = fileList.filter(v => iconv.decode(v.filepath, 'GBK').endsWith('info.json'));
    if (!getExtName) {
        // 取最短的js路径，防止文件夹嵌套
        let qtpath = '';
        if (extJsList.length > 0) {
            let lens = extJsList.map(item => item.filepath.length);
            let minLen = Math.min.apply(null, lens);
            let extJs = extJsList[lens.indexOf(minLen)];
            let filepath = iconv.decode(extJs.filepath, 'GBK');
            qtpath = filepath.replace('extension.js', '');
        }
        // console.log({ qtpath });
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            try {
                const fileBuffer = mz.extract(file.filepath, { password });
                file.filepath = iconv.decode(file.filepath, 'GBK');
                postMessage([i, fileList.length, file.filepath.replace(qtpath, ''), fileBuffer]);
            } catch (e) {
                console.error(e);
                throw new Error('密码错误');
            }
        }
        postMessage('finish');
        close();
    } else {
        if (extJsList.length == 0) {
            postMessage(null);
        } else {
            // 取最短的js路径，防止文件夹嵌套
            let lens = extJsList.map(item => iconv.decode(item.filepath, 'GBK').length);
            let minLen = Math.min.apply(null, lens);
            let extJs = extJsList[lens.indexOf(minLen)];
            try {
                const sendMessage = [];
                sendMessage.push(mz.extract(extJs.filepath, { encoding: "utf8", password }));
                if (infoJsonList.length > 0) {
                    if (infoJsonList.length == 1) sendMessage.push(mz.extract(infoJsonList[0].filepath, { encoding: "utf8", password }));
                    else {
                        let lens = infoJsonList.map(item => iconv.decode(item.filepath, 'GBK').length);
                        let minLen = Math.min.apply(null, lens);
                        let infoJson = infoJsonList[lens.indexOf(minLen)];
                        sendMessage.push(mz.extract(infoJson.filepath, { encoding: "utf8", password }));
                    }
                }
                postMessage(sendMessage);
            } catch(e) {
                console.error(e);
                throw new Error('密码错误');
            }
        }
    }
}