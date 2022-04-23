const { lib, game, ui, get, ai, _status } = await import(window.newExtApiUrl);

export default {
    name: '测试',
    intro: '扩展描述',
    author: '扩展作者',
    version: '1.0',
    changeLog: [
        '<li>创建新扩展',
        //'players://[""]',
        //'cards://[""]',
    ],
    config: {},
    content: function(config, pack) {

    },
    precontent: function(data) {

    },
    package: {
        character: {
            character: {
            },
            translate: {
            },
        },
        card: {
            card: {
            },
            translate: {
            },
            list: [],
        },
        skill: {
            skill: {
            },
            translate: {
            },
        },
    }
};