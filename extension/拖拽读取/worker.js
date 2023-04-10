importScripts('./minizip-asm.min.js');

const iconv = require('./node_modules/iconv-lite');

onmessage = function (e) {
    const [buffer, password, getExtName] = e.data;
    // @ts-ignore
    const mz = new Minizip(buffer);
    const fileList = mz.list({ encoding: "buffer" });
    const extJsList = fileList.filter(v => iconv.decode(v.filepath, 'GBK').endsWith('extension.js'));
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
        console.log({ qtpath });
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
                postMessage(mz.extract(extJs.filepath, { encoding: "utf8", password }));
            } catch(e) {
                console.error(e);
                throw new Error('密码错误');
            }
        }
    }
}