/**
 * 游戏主逻辑相关方法
 */
interface Game extends IDownLoadFun {
    /**
     * 卡牌弃置
     * 创建“cardsDiscard”事件，
     * 该事件逻辑是遍历cards，调用它们的discard舍弃；
     * 
     * 苏版解析: 将不属于任何人的卡牌置入弃牌堆
     */
    cardsDiscard(cards: Card | Card[]): GameEvent;
    /**
	 * 【1.9.98.2】新增方法 by2020-2-24
	 * 
     * 将卡牌送至ui.special
     * 
     * 同样是创建“cardsDiscard”事件，触发“addCardToStorage”时机
     * @param cards 
     * @param bool 设置值false不触发“addCardToStorage”时机。设置为'toRenku'改为放置到仁库
     */
	cardsGotoSpecial(cards: Card | Card[], bool?: boolean | 'toRenku'): GameEvent;
    /**
	 * 20203-5新增
	 * 
     * 可以通过指定一个事件而不一定是强制使用当前事件，
     * 在这个事件之后丢弃所有还在处理区未被移动的卡牌
     * 
     * 使用方法：通过将relatedEvent设置为当前事件的parent（即useCard），
     *  在这一事件结束时而不是contentBefore结束时再丢弃所有卡牌。例子：
	 * ```js
		contentBefore:function(){
		...
		var cards=get.cards(num);
		game.cardsGotoOrdering(cards).relatedEvent = event.getParent();
		...
		}
	 *	```
     */
    cardsGotoOrdering(cards: Card | Card[]): GameEvent;
    /**
     * 显示历史信息UI
     * @param pause 是否显示“已暂停”
     */
    showHistory(pause?: boolean): void;
    /** 创建背景 */
    createBackground(src: string, blur: boolean): HTMLElement;
    /** 改变场地（特殊卡牌，特殊玩法的功能） */
    changeLand(url: string, player: Player): void;
    /** 检查文件更新 */
    checkFileList(updates: string[], proceed: (n: number) => void): void;
	/** 用dialog显示技能描述 */
	createSkillInfo(skill: string, dialog: Dialog): void;

    /** 【事件】置换手牌 */
    replaceHandcards(...args): void;
    /** 移除指定名字的卡牌（从lib.card.list和ui.cardPile卡堆中移除） */
    removeCard(name: string): void;

    /** 联网相关 */
    randomMapOL(type): void;

    /** 关闭菜单 */
    closeMenu(): void;
    closeConnectMenu(): void;
    closePopped(): void;


    //【联机】联机核心相关（重点）
    /** 
     * 向所有连接中的客户端发送通信（不包括自己），参数：第一个是回调方法，后面是对应方法的参数 
     * 
     * 只能主机使用；
     */
    broadcast(name: string, ...args): void;
	broadcast<T>(fun: (...args: T) => void, ...args: T): void;
    /** 
     * 向所有客户端通信（包括自己，发出通信后，自己执行一次函数和参数） 
     * 
     * 只能主机使用；
     */
	broadcastAll(name: string, ...args): void;
	broadcastAll<T>(fun: (...args: T) => void, ...args: T): void;
    /** 同步state状态 */
    syncState(): void;
    updateWaiting(): void;
    /** 等待玩家加入 */
    waitForPlayer(func): void;
    /** 倒计时 */
    countDown(time: number, onEnd: Function): void;
    /** 选择计时 */
    countChoose(clear?): void;
    /** 停止选择计时 */
    stopCountChoose(): void;
    /** 连接服务器 */
    connect(ip: string, callback: OneParmFun<boolean, void>): void;
    /** 发送信息到服务器中 */
    send(...args): void;
    /** 发送信息到指定ip */
    sendTo(id: string, message: any): void;
    /** 创建服务器（创建房间） */
    createServer(): void;

    //播放声音
	/**
	 * 【核心】播放指定音频
	 * 
	 * 注: 由于参数列表是随意的，在这里我准备限制一下这个函数的参数顺序
	 * 
	 * 注2: 如果是回放录像且```arguments[1]不为'video'```时此函数不会执行
	 * 
	 * @param paths 音频路径，从无名杀根目录的audio目录开始拼接paths参数。
	 * 
	 * 以播放我的扩展中我的语音.mp3为例:
	 * 
	 *  ```js
	 * game.playAudio('..', 'extension', '我的扩展', '我的语音.mp3');
	 * ```
	 * 
	 * 最终会解析成 lib.assetURL + 'audio/../extension/我的扩展/我的语音.mp3'。
	 * 
	 * 而且你也可以```简写```: 
	 * ```js
	 * game.playAudio('../extension/我的扩展/我的语音');
	 * ```
	 * 
	 * 解析结果和上面一样(不带后缀名自动解析为mp3，且```音频必须为mp3或ogg```)
	 * 
	 * @param onerror 音频播放错误回调
	 * 
	 * 注：onerror不是你想象的如下代码！
	 * ```js
	 * audio.addEventListener('error', onerror);
	 * ```
	 * 而是经过处理后的代码:
	 * ```js
	 * audio.addEventListener('error', () => {
	 * 	if (!错误处理) { 错误处理 = true; 音频改为ogg形式播放; }
	 * 	else onerror();
	 * });
	 * ```
	 */
	playAudio(...paths: string, onerror?: Function): HTMLAudioElement;
	playAudio(...paths: (string | number)[]): HTMLAudioElement;
    /**
     * 播放技能语音
     * （主要解析技能的audio属性寻找对应文件播放）
     * 
     * 设info是lib.skill[skill]，若info.audio是字符串：
	 * 
     * 1.则主要是播放扩展声音,格式：ext:扩展包的名字:额外路径参数；
	 * 
     * 2.直接就是技能名，即继承该技能的播放信息，audioinfo；
	 * 
     * 若info.audio是数组，则[ 扩展名, 额外路径参数 ]；
	 * 
     * 额外参数：
	 * 
	 * 1."true"：直接播放该名字的声音
	 * 
	 * 2.数字：随机选一个该"技能名+1-数字范围"的声音播放；
	 * 
     * 若info.audio是数字，就是用解析出来的"audioname + (1 ~ 数字范围)";
     * 
     * 若info.audioname存在，且是数组，且方法参数有player，则播放"audioname_玩家名"的声音（即可同一个技能，不同人播放不同声音）
	 * 
     * @param skill 技能名
     * @param player 是否指定玩家的武将（需要技能有audioname）
     * @param directaudio 没什么用，无视，若技能的direct为true，可以让directaudio为true，跳过技能配置的判断
     */
    trySkillAudio(skill: string, player?: Player, directaudio?: boolean): void;
    /**
     * 播放技能的声音2
     * 注：播放失败时，会重复寻找播放名.ogg, 播放名+序号.mp3, 播放名+序号.ogg，都不行就没用声音
     * @param name 播放的名字
     * @param index 序号
     */
    playSkillAudio(name: string, index?: number): void;
    /**
     * 播放背景音
     * 注：主要播放的是配置里的背景音。
     */
    playBackgroundMusic(): void;

    /**
     * 【核心】导入扩展
     * @param type 导入扩展的类型
     * @param content 导入扩展的内容
     */
    import(type: 'extension', content: ExtensionImportFunc | ExtensionInfoConfigData ): void;

    import(type: 'card', content: CardImportFunc | importCardConfig): void;

    import(type: 'character', content: CharacterImportFunc | importCharacterConfig): void;

    import(type: 'mode', content: ModeImportFunc | ExModeConfigData): void;

    import(type: 'player', content: PlayerImportFunc | ExModeConfigData): void;

    import(type: 'libDescription', content: OtherImportFunc | ExCommonConfig): void;

    /*import(
        type: string, 
        content: ExtensionImportFunc | ExtensionInfoConfigData |
            CardImportFunc | importCardConfig |
            CharacterImportFunc | importCharacterConfig |
            ModeImportFunc | ExModeConfigData |
            PlayerImportFunc | ExModeConfigData |
            OtherImportFunc | ExCommonConfig
    ): void;
	*/

    /**
     * 【核心】读取扩展信息
     * @param obj 
     */
    loadExtension(obj: ExtensionImportFunc | ExtensionInfoConfigData): void;
    /**
     * 导入/导出扩展 
	 * 
     * 若不存在window.JSZip，则先加载JSZip，加载完后再重新执行一遍game.importExtension。
	 * 
	 * 注: 个人提示，请不要用此函数(等同于游戏内自带的导入扩展功能)导入很大的压缩包，耗费时间很长且没有进度提示
	 * 
     * @param data 
	 * 
	 * 当data为一个object，```且参数exportext为true```时执行```导出扩展```逻辑。
	 * 
	 * 这时data的结构为: 
	 * ```js
	 * {
	 * 		'文件名': '文件内容字符串'
	 * }
	 * ```
	 * 
	 * 当data为一个ArrayBuffer时，执行```导入扩展```逻辑
	 * 
     * @param finishLoad 导入/导出扩展成功后触发的函数
     * @param exportext 执行导出扩展逻辑
     * @param pkg 导出扩展时为传入的pkg对象写入扩展的部分信息
     */
    importExtension(data: object | ArrayBuffer, finishLoad?: VoidFunction, exportext?: boolean, pkg?: object): void | false;
    /**
     * 导出扩展
	 * 
     * 如果当前是在移动端，则直接导出到移动端相关的文件夹内。
	 * 
     * 若是网页版，则生成下载链接，点击下载配置。
	 * 
     * @param textToWrite 保存的文件内容
     * @param name 保存的文件名
     */
    export(textToWrite: string, name = 'noname'): void;

    //下载相关  用于更新信息
    /** 做些处理，调用game.download下载 */
	multiDownload2(list: string[], onsuccess?: (num: any) => void, onerror?: (num: any) => void, onfinish?: VoidFunction, process?: (current: string) => void, dev: boolean): void;
    /**
     * 下载列表内所有文件
     * 
     * 将文件列表分三分请求下载：
     * 核心下载调用multiDownload2 （game.download）
	 * 
     * @param list 要下载的文件列表
     * @param onsuccess 下载成功
     * @param onerror 下载失败
     * @param onfinish 所有下载完成
     * @param process 处理将要下载的文件，返回将要使用的路径信息列表(game.download使用)
     * @param dev (game.download使用)
     */
	multiDownload(list: string[], onsuccess?: (num: number) => void, onerror?: (num: number) => void, onfinish?: VoidFunction, process?: (current: string) => void, dev: boolean): void;
    /**
     * 需要当前版本支持：
     * 
     * 主要分Android/ios的本地版FileTransfer（cordova.js），和pc版的nodejs环境
     */
    download(url, folder, onsuccess, onerror, dev, onprogress?: Function);
	/**
	 * 调用download, 下载url文件，读取后删除
	 */
    fetch(url: string, onload: (data: ArrayBuffer) => void, onerror?: (e: Error) => void, onprogress?: Function): void;

    //录像相关
	/**
	 * 保存video，重启以播放
	 * @param time 录像id
	 * 见于:
	 * ```js
	 * document.querySelector('.videonode.active').link.time
	 * ```
	 * @param mode 模式id
	 */
    playVideo(time: number, mode: String): void;
	/**
	 * 回放一个已经保存的录像
	 * 见于:
	 * document.querySelector('.videonode.active').link.video
	 * ```
	 */
    playVideoContent(video): void;
    /** 录像的content方法 */
    videoContent: VideoContent;
    /**
     * 添加进录像里
     * 添加操作进lib.video中，当局游戏的操作，都会记录在里面（需要手动调用添加操作）；
     * 在game.over（游戏结束）中，将该lib.video设置到newvid.video中保存到.lib.videos；
     * （目前未知lib.video是在什么时候清理，或者就是这样保存所有的操作）
     * @param type 
     * @param player 
     * @param content 
     */
    addVideo(type: string, player?: Player, content?: any): void;

    //重来
	/** 重启游戏(不显示初始的选择模式页面) */
    reload(): void;
	/** 重启游戏并处理lib.ondb2 */
    reload2(): void;

    /** 
	 * 退出游戏
	 * 
	 * ios端: 重启游戏
	 * 
	 * Android端: 退出游戏
	 * 
	 * 电脑端/浏览器: 无效果
	 */
    exit(): void;
    /**
     * 打开链接
	 * 
     * 若是安卓或者ios客户端，则用iframe或者内置浏览器打开；
	 * 
     * h5端直接跳转该链接
     */
    open(url: string): void;
    /** 再战 */
    reloadCurrent(): void;

    //更新与更新相关动画逻辑
	/**
	 * 在lib.updates中push传入的func。然后如果lib.updates的长度为1，执行game.run
	 */
    update(func: Function): Function;
	/**
	 * lib.updates中移除func
	 */
    unupdate(func: Function): void;
	/**
	 * 调用如下代码:
	 * ```js
	 * cancelAnimationFrame(lib.status.frameId);
	 * ```
	 */
    stop(): void;
	/**
	 * 根据lib.updates执行动画
	 */
    run(): void;
	/**
	 * lib.canvasUpdates中push传入的func。然后如果没有lib.status.canvas，则执行一次
	 * ```js 
	 * game.update(lib.updateCanvas);
	 * ```
	 */
    draw(func: Function): void;

    /** 震动(手机设备要开启震动才行) */
    vibrate(time: number): void;
    /** 
	 * 模仿h5的prompt，用于显示可提示用户进行输入的对话框
	 * 
	 * 注: 由于参数列表是随意的，在这里我准备限制一下这个函数的参数顺序
	 * 
	 * @param title 设置prompt标题与input内容。格式如下:
	 * ```js
	 * // 只设置标题(但是input的初始值就变成了undefined)
	 * game.prompt('###prompt标题', value => console.log(value));
	 * // 设置标题和input初始内容
	 * game.prompt('###prompt标题###input初始内容', value => console.log(value));
	 * ```
	 * @param callback 回调函数，将input的值作为函数参数返回
	 */
    prompt(title: string, callback: (value: string) => void): void;
	/**
	* 模仿h5的prompt，用于显示可提示用户进行输入的对话框
	* 
	* 注: 由于参数列表是随意的，在这里我准备限制一下这个函数的参数顺序
	* 
	* @param title 设置prompt标题与input内容。格式如下:
	* ```js
	* // 只设置标题(但是input的初始值就变成了'undefined')
	* game.prompt('###prompt标题', value => console.log(value));
	* // 设置标题和input初始内容
	* game.prompt('###prompt标题###input初始内容', value => console.log(value));
	* ```
	* @param forced 为true的话将没有"取消按钮"
	* @param callback 回调函数，将input的值作为函数参数返回
	*/
	prompt(title: string, forced: boolean, callback: (value: string) => void): void;
	/**
	* 模仿h5的alert
	* 
	* 注: 由于参数列表是随意的，在这里我准备限制一下这个函数的参数顺序
	* 
	* @param title 设置prompt标题。格式如下:
	* ```js
	* game.prompt('alert', 'prompt标题');
	* ```
	* @param forced 默认为true。如果设置为false将有"取消按钮"
	*/
	prompt(isAlert: 'alert', title: string, forced?: boolean): void;
    /** 
	 * 模仿alert提示框
	 * 
	 * 调用如下代码:
	 * ```js
	 * game.prompt(str, 'alert');
	 * ```
	 */
    alert(str: string): void;
    /** 
	 * 需要打印的信息（打印的信息在 菜单->其他->命令 中打印） 
	 * 
	 * 注: 千万不要过多使用此函数！会导致游戏卡顿！
	 */
    print(...args): void;

    /** 动画相关 */
    animate: Animate;

    /**
     * 画线
     * @param path 起始位置的信息(x, y坐标)
     * @param duration 让过渡效果持续 duration 毫秒
     */
	linexy(path: [number, number, number, number], duration: number): HTMLDivElement;
	/**
	 * 画线
	 * @param path 起始位置的信息(x, y坐标)
	 * @param color 画线样式
	 */
	linexy(path: [number, number, number, number], color: 'fire' | 'thunder' | 'green' | 'drag'): HTMLDivElement;
	/**
	 * 画线
	 * @param path 起始位置的信息(x, y坐标)
	 * @param config 画线配置
	 */
	linexy(path: [number, number, number, number], config: LineConfig): HTMLDivElement;
	/**
	 * 画线
	 * @param path 起始位置的信息(x, y坐标)
	 * @param parentNode 指定画线父元素
	 */
	linexy(path: [number, number, number, number], parentNode: HTMLDivElement): HTMLDivElement;
	/**
	 * 画线2  目前项目未发现使用
	 * @param path 起始位置的信息(x, y坐标)
	 * @param duration 让过渡效果持续 duration 毫秒
	 * @param draw2 战旗模式下且此参数为true时将调用game.draw2, 否则只调用game.draw
	 */
	_linexy(path: [number, number, number, number], duration: number, draw2?: boolean): HTMLDivElement;
	/**
	 * 画线2  目前项目未发现使用
	 * @param path 起始位置的信息(x, y坐标)
	 * @param color 画线样式
	 * @param draw2 战旗模式下且此参数为true时将调用game.draw2, 否则只调用game.draw
	 */
	_linexy(path: [number, number, number, number], color: 'fire' | 'thunder' | 'green', draw2?: boolean): HTMLDivElement;
	/** 
	 * 画线2  目前项目未发现使用
	 * @param path 起始位置的信息(x, y坐标)
	 * @param config 画线配置
	 * @param draw2 战旗模式下且此参数为true时将调用game.draw2, 否则只调用game.draw
	 */
	_linexy(path: [number, number, number, number], config?: LineConfig, draw2?: boolean): void;

    /** 【核心】创建游戏内触发事件 */
    createTrigger(name: string, skill: string, player: Player, event: GameEvent): void;
    /** 【核心】创建游戏内事件 */
    createEvent(name: string, trigger?: boolean, triggerevent?: GameEvent): GameEvent;

    //用于在onload->proceed2，解析lib.extensions中的数据：
    /** 添加武将 */
	addCharacter(name: string, info: CharacterConfigInfo): void;
    /** 添加武将包 */
    addCharacterPack(pack: SMap<HeroData>, packagename?: string): void;
    /** 添加卡牌（未使用） */
	addCard(name: string, info: ExCardData, info2: CardConfigInfo): void;
    /**
	 * 添加卡包
	 * @param pack 卡包信息
	 * @param packagename 卡包名
	 */
	addCardPack(pack: CardPackConfigInfo, packagename: string): void;
    /** 添加技能 */
    addSkill(name: string, info: ExSkillData, translate: string, description: string): void;
    /**
     * 添加玩法mode
     * @param name 模式名
     * @param info 模式内容
     * @param info2 模式的config扩展内容
     */
    addMode(name: string, info: ExModeConfigData, info2: {
		extension: string,
		translate: string,
		config: SMap<SelectConfigData>,
	}): void;

    /**
     * 添加全局技能
	 * 
     * 看起来，如果不是在extension.js里定义的全局技能需要手动调用一次game.addGlobalSkill函数添加
	 * 
     * @param skill 技能名
     * @param player 若有该参数，则添加到lib.skill.globalmap中，目前似乎没怎么使用lib.skill.globalmap，
     */
    addGlobalSkill(skill: string, player?: Player): boolean;
    /**
     * 移除全局技能
     * @param skill 技能名
     */
    removeGlobalSkill(skill): void;
    /** 
	 * 重置所有玩家的技能(移除tempSkills，把处于out状态的角色拉回来)
	 */
    resetSkills(): void;
    /**
     * 移除扩展
     * @param extname 扩展名
     * @param keepfile 是否保存文件
     */
    removeExtension(extname: string, keepfile?: boolean): void;
    /**
     * 添加最近使用武将
     * （让其在武将列表的排序上靠前）
     * @param args 任意武将名
     */
    addRecentCharacter(...args: string[]): void;
	/**
	 * 创建一张杀
	 */
	createCard(): Card;
    /**
     * 创建一张卡牌
     * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
     * @param suit 花色或颜色。若没有指定，则先寻找卡牌信息，如果也没有就随机；若值是“black”，则随机黑色的两种花色；若值是“red”，则随机红色的两种花色
     * @param number 卡牌点数，若没有则先寻找卡牌信息，如果也没有就随机1~13；
     * @param nature 卡牌伤害属性，若没有，则使用卡牌信息指定的属性
     */
	createCard(name: string | CardBaseUIData, suit?: CardBaseSuit | 'red' | 'black', number?: CardBaseNumber | string, nature?: string): Card;
	/**
	 * 创建一张不可点击的卡牌
	 * 
	 * 应该是用于展示卡牌，指定点数和属性应该没什么用
	 * 
	 * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
	 * @param noclick 字符串 'noclick'
	 * @param number 卡牌点数，若没有则先寻找卡牌信息，如果也没有就随机1~13；
	 * @param nature 卡牌伤害属性，若没有，则使用卡牌信息指定的属性
	 */
	createCard(name: string | CardBaseUIData, noclick?: 'noclick', number?: CardBaseNumber | string, nature?: string): Card;
	/**
	 * 创建一张杀
	 * 
	 * 用法和game.createCard完全一致 只不过生成的卡牌洗牌时不会消失；
	 */
	createCard2(): Card;
	 /**
     * 创建一张卡牌
	 * 用法和game.createCard完全一致 只不过生成的卡牌洗牌时不会消失；
     * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
     * @param suit 花色或颜色。若没有指定，则先寻找卡牌信息，如果也没有就随机；若值是“black”，则随机黑色的两种花色；若值是“red”，则随机红色的两种花色
     * @param number 卡牌点数，若没有则先寻找卡牌信息，如果也没有就随机1~13；
     * @param nature 卡牌伤害属性，若没有，则使用卡牌信息指定的属性
     */
	createCard2(name: string | CardBaseUIData, suit?: CardBaseSuit | 'red' | 'black', number?: CardBaseNumber | string, nature?: string): Card;
	/**
	 * 创建一张不可点击的卡牌
	 * 
	 * 应该是用于展示卡牌，指定点数和属性应该没什么用
	 * 
	 * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
	 * @param noclick 字符串 'noclick'
	 * @param number 卡牌点数，若没有则先寻找卡牌信息，如果也没有就随机1~13；
	 * @param nature 卡牌伤害属性，若没有，则使用卡牌信息指定的属性
	 */
	createCard2(name: string | CardBaseUIData, noclick?: 'noclick', number?: CardBaseNumber | string, nature?: string): Card;

    /**
     * 强制结束游戏。
     * 
     * 创建“finish_game”事件，设置content为“forceOver”。
     * @param bool 游戏结果:参考game.over的参数，额外：若值是“noover”，则不执行game.over
     * @param callback 回调函数
     */
    forceOver(bool?: boolean | string, callback?: Function): void;
    /**
     * 【核心】游戏结束
     * @param result 
	 * true战斗胜利
	 * 
	 * false战斗失败
	 * 
	 * undefined战斗结束(可以不填)
	 * 
	 * "平局"（可以直接填字符串）
     */
    over(result?: boolean | string): void;
    /** 
	 * 【核心】游戏循环（核心)
	 * 
	 * 【v1.9.117.2】修改逻辑，将自调用改为while(true)，减少了爆栈的可能性
	 */
    loop(): void;
    /**
     * 暂停游戏循环
     */
    pause(): void;
    /**
     * 暂停游戏循环2（联机模式下无效）
     */
    pause2(): void;
    /** 
     * 游戏继续
     * 设置pause为false，重新loop
     */
    resume(): void;
    /** 
     * 游戏继续2（联机模式下无效）
     * 设置pause2为false，重新loop
     */
	resume2(): void;
	/**
	 * 【v1.9.121】game.delay的事件版本。参数同game.delay
	 */
	delaye(...args: any): GameEvent;
	/**
	 * 【v1.9.121】game.delayx的事件版本。参数同game.delayx
	 */
	delayex(...args: any): GameEvent;
    /**
     * 游戏延迟
     * 延迟结束后继续游戏(先暂停游戏循环loop，待x秒后resume继续游戏)
     * @param time 延迟时间（lib.config.duration）倍率
     * @param time2 额外增加的延时时间（不参与倍率计算）
     */
    delay(time?: number, time2?: number): void;
    /**
     * 游戏延迟2
     * 根据lib.config.game_speed（游戏的流程速度）：vslow，slow，fast，vfast，vvfast，调整游戏延迟时间的倍率；
     * @param time 延迟的时间
     * @param time2 额外增加的延时时间（不参与倍率计算）
     */
    delayx(time?: number, time2?: number): void;
    /**
     * 检测当前需要选中，并且在ui上做出选中处理
     * 
     * 主要是根据event的数据作为依据，若没有，则默认使用_status.event
     */
    check(event?: GameEvent): boolean;
    /**
     * 取消选中
     * 
     * 其参数若为空，默认取消所有相关的选中，若有指定的类型，则只取消该类型的选中
     * @param types 其类型可以为"card", "target", "button"
     */
	uncheck(...types?: ('card' | 'target' | 'button')[]): void;

    //交换
    /**
     * 交换位置
     * @param prompt 是否打印日志
     * @param behind 是否移至player2座位之后
     * @param noanimate 为true没有动画
     */
    swapSeat(player1: Player, player2: Player, prompt?: boolean, behind?: boolean, noanimate?: boolean): void;
    /**
     * 交换玩家
     * @param player 
     * @param player2 
     */
    swapPlayer(player: Player, player2?: Player): void;
    /**
     * 交换control（控制权，控制UI）
     * @param player 
     */
    swapControl(player: Player): void;
    /**
     * 自动选择交换玩家的方式?
     * 
     * 实质上是，如果有game.modeSwapPlayer（mode玩法内自己实现）实现，则使用该方法，否则默认使用game.swapPlayer
     */
    swapPlayerAuto(player: Player): void;

    /**
     * 获取目标玩家的下一个玩家（按住座位位置player.dataset.position）
     */
    findNext(player: Player): Player;


    /**
     * 同步读取mode玩法
     * @param name 
     * @param callback 必须，加载完mode玩法js后回调执行
     */
    loadModeAsync(name: string, callback: OneParmFun<ExModeConfigData, void>): void;
    /**
     * 切换玩法mode
     * @param name 
     * @param configx 
     */
    switchMode(name: string, configx?: SMap<any>): void;
    /**
     * 读取玩法mode。
     * 创建“loadMode”事件，加载指定mode的js。
     * @param mode 
     */
    loadMode(mode: string): void;
    /**
     * 读取包。
     * 创建“loadPackage”事件，加载读取武将包，卡包
     * @param paths 传入多个“路径/文件名”字符串，按照装顺序依次加载
     */
    loadPackage(...paths: string[]): void;

    /**
     * 【事件】开始指定玩家的“游戏回合”（phaseLoop）
     * @param player 
     */
    phaseLoop(player: Player): void;
    /**
     * 【事件】开始指定玩家的“游戏开始抽牌事件”（gameDraw）
	 * 
     * 注：【v1.9.108.6】后续加上（剩下的事件相关最好还是都返回事件比较好）；
     * @param player 默认自己
     * @param num 默认4
     */
    gameDraw(player?: Player, num?: number): GameEvent;
    /** 
	 * 选择双将
	 * 
	 * 参数解析:
	 * 
	 * number类型: 先后赋值width, num, ratio
	 * 
	 * function类型: 先后赋值func, update
	 * 
	 * Array类型: 赋值list
	 * 
	 * object类型: 赋值config
	 */
    chooseCharacterDouble(...args: (number | Function | object | Array)[]): void;
	/** 更新仁库 */
	updateRenku(): void;
    /** 
	 * 【联机】更新 轮数 与剩余牌数 的ui显示
	 * 
	 * 【v1.9.115.2】代码机制调整：现在从牌堆中获得牌/装备牌/将牌置入装备区会自动触发updateRoundNumber
	 */
    updateRoundNumber(): void;
    /**
     * 多个玩家同时抽牌
     * @param players 要抽牌的玩家列表
     * @param num 如果是一个number，则同时抽x张牌；若是数组，则对应每个玩家抽对应数组里的数目；若是方法，则根据玩家返回要抽的牌；
     * @param drawDeck 从牌堆中获取x张牌，需要玩法mode实现了player.getDeckCards
     * @param bottom 是否从牌堆底抽牌
     */
    asyncDraw(players: Player[], num: number | number[] | OneParmFun<Player, number>, drawDeck?: { drawDeck: number }, bottom?: boolean): void;
    /** 多个玩家同时抽牌2（冗余方法，并没有什么卵用） */
    asyncDrawAuto(players: Player[], num: number | number[] | OneParmFun<Player, number>, drawDeck?: { drawDeck: number }): void;

    /**
     * 解析技能
     * @param i 
     * @param sub 是否是子技能，true则为是（如果是子技能，则不解析subSkill）
     */
    finishSkill(i: string, sub?: boolean): void;
    /**
     * 解析技能与卡牌（实质是解析lib.card，lib.skill）
     */
    finishCards(): void;
	/**
	 * 对于无法用触发技能实现的一些效果，我们使用mod技能实现。这个函数使mod技能生效。
	 * 
	 * @param result 经过mod执行前，它的值一般是'unchanged'。每进行一次mod判断，都将根据函数结果改变这个值
	 * @param modName 要实现的mod名称
	 * @param skills mod判断的技能列表(或是从player身上获取技能)，外加所有全局技能里写入的mod效果
	 * @return 返回mod技能对这个效果的处理结果。```部分```没有改变的结果返回'unchanged'
	 */

	checkMod(card: Card, player: Player, range: Select, modName: 'selectTarget', skills: Player | string[]): Select;

	checkMod(player: Player, judgeResult: BaseResultData, modName: 'judge', skills: Player | string[]): BaseResultData;

	checkMod(from: Player, to: Player, result: 'unchanged' | boolean, modName: 'inRange' | 'inRangeOf', skills: Player | string[]): boolean | 'unchanged';
	
	checkMod(from: Player, to: Player, distance: number, modName: 'globalFrom' | 'globalTo' | 'attackFrom' | 'attackTo', skills: Player | string[]): number;

	checkMod(card: Card, player: Player, target: Player, result: 'unchanged' | boolean, modName: 'targetEnabled', skills: Player | string[]): boolean | 'unchanged';

	checkMod(card: Card, player: Player, num: number, modName: 'cardUsable', skills: Player | string[]): number;

	checkMod(player: Player, result: 'unchanged' | number, modName: 'attackRangeBase', skills: Player | string[]): number | 'unchanged';

	checkMod(player: Player, rangeOrnum: number, modName: 'attackRange' | 'maxHandcardBase' | 'maxHandcard' | 'maxHandcardFinal', skills: Player | string[]): number;

	checkMod(card: Card, player: Player, bool: boolean, modName: 'ignoredHandcard', skills: Player | string[]): boolean;
	
	checkMod(card: Card, player: Player, result: 'unchanged' | boolean, modName: 'cardEnabled' | 'cardEnabled2' | 'cardRespondable' | 'cardChongzhuable', skills: Player | string[]): boolean | 'unchanged';

	checkMod(card: Card, player: Player, target: Player, bool: boolean, modName: 'cardUsableTarget', skills: Player | string[]): boolean;

	checkMod(card: Card, player: Player, target: Player, result: 'unchanged' | boolean, modName: 'cardSavable' | 'cardUsableTarget' | 'playerEnabled' | 'targetEnabled' | 'targetInRange', skills: Player | string[]): boolean | 'unchanged';

	checkMod(card: Card, player: Player, eventName: string, result: 'unchanged' | boolean, modName: 'cardDiscardable', skills: Player | string[]): boolean | 'unchanged';

	checkMod(card: Card, player: Player, target: Player, event: GameEvent, result: 'unchanged' | boolean, modName: 'canBeDiscarded' | 'canBeGained', skills: Player | string[]): boolean | 'unchanged';

	checkMod(card: Card, player: Player, name: string, modName: 'cardname', skills: Player | string[]): string;

	checkMod(card: Card, suit: CardBaseSuit, modName: 'suit', skills: Player | string[]): CardBaseSuit;

	checkMod(card: Card, owner: Player, number: CardBaseNumber, modName: 'cardnumber', skills: Player | string[]): CardBaseNumber;

	checkMod(card: Card, owner: Player, nature: string | false | undefined, modName: 'cardnature', skills: Player | string[]): string | false | void;

	checkMod(player: Player, card: Card, result: number, modName: 'aiUseful' | 'aiValue' | 'aiOrder', skills: Player | string[]): number;
	
    /**
     * 准备游戏场景:
	 * 
     * 基本流程：
	 * 
     *  准备显示历史面板 game.showHistory(false)
	 * 
     *  创建玩家 ui.create.players(num)
	 * 
     *  创建自身 ui.create.me()
	 * 
     *  同步创建卡牌 ui.create.cardsAsync()
	 * 
     *  卡牌与技能信息解析 game.finishCards()
	 * 
     * @param num 玩家人数
     */
    prepareArena(num?: number): void;
    /** 清除游戏场景 */
    clearArena(): void;
    /** 【联机】清除连接 */
    clearConnect(): any;
    /**
     * 打印日志（游戏界面显示的记录）
     * 
     * 参数列表类型：
	 * 
     *  player/players,默认高亮为蓝色文本
	 * 
     *  card/cards/{name:string},默认高亮为黄色文本
	 * 
     *  object,即对象为普通对象（json结构），如果携带logvid，则设置logvid
	 * 
     *  string:开头结尾有【】，则默认高亮为绿色文本；开头有“#b,#y,#g”，则显示蓝，黄，绿文本；否则直接显示该文本
	 * 
     *  其余类型参数，直接拼接
	 * 
	 * 代码示例: 
	 * ```js
	 * game.log(player, '摸了两张牌');
	 * ```
     */
    log(...args): void;
    /**
     * 将信息打印至“出牌记录栏”
     *
     * 【UI】根据logvid打印历史信息
     *
     * 如果参数 player 是字符串， 则遍历子元素，为 logvid 等同于 player 的元素的 added 属性添加 card 参数(也就是说card也是字符串)，然后不会返回任何值
     *
     * @param player 要记录的玩家，或通过logvid追加显示内容
     * @param card
     *  若 player 参数为字符串，那这个参数也为字符串，作用是通过logvid追加显示内容。
     *  否则这个参数是一个数组，第一个元素为卡牌信息，第二个参数为一个卡牌数组
     * @param targets
     *  如果 card 参数为字符串'die',那targets就是一个玩家（作为来源）
     *  如果 card 参数为数组，那targets就是一个玩家数组，且该数组的长度为1时在改记录上显示目标玩家。否则只能点击该记录后才可查看所有目标角色
     * @param event 当前事件
     * @param forced lib.skill[card].logv为false时且该参数不为true时不显示该记录
     * @param logvid 设置指定的logvid
     * @return 创建的该条记录，其带有logvid, skill, node cards added 等属性
     */
    logv(player?: string | Player, card?: string | [Card, Card[]], targets?: Player | Player[], event?: GameEvent, forced?: boolean, logvid?: string): logv;
    /**
     * 将指定的文本追加到已经生成的记录中
     * @param logvid 要追加的记录的logvid
     * @param text 要追加的文本
     */
    logv(logvid: string, text: string): void;
    /**
     * 将 player 使用的技能信息打印至“出牌记录栏”
     * @param player 使用技能的角色
     * @param skill 技能名 若是技能没有对应翻译则不记录(大多是全局技能)。 若 lib.skill[skill].logv 为false也不记录
     * @param targets 技能目标(没有默认传入false)
     */
    logv(player: Player, skill: string, targets: false | Player[]): void;

    //保存到数据库中
	/**
	 * 把数据保存到indexDB中
	 * @param type 表名
	 * @param id 键名
	 * @param item 键对应的值
	 * @param callback 回调函数
	 */
	putDB(type: DataDbIds, id: string, item: any, callback?: Function): void;
	/**
	 * 获取indexDB中的数据
	 * @param type 表名
	 * @param id 键名
	 * @param callback 回调函数
	 */
	getDB(type: DataDbIds, id: string, callback?: Function): void;
	/**
	 * 删除indexDB中的数据
	 * @param type 表名
	 * @param id 键名
	 * @param callback 回调函数
	 */
	deleteDB(type: DataDbIds, id?: string, callback?: Function): void;
	/**
	 * 如果有indexDB，就把数据存储到indexDB的data表中。
	 * 
	 * 如果没有，存储到localStorage
	 * 
	 * 如下方式存储:
	 * ```js
	 * // indexdb -> data表：
	 * 键名: mode
	 * 键值: {
	 *  ...
	 * 	[key]: value
	 *  ...
	 * }
	 * ```
	 * 
	 * @param key 键名
	 * @param value 键值
	 * @param mode 模式名
	 */
	save(key: string, value: any | undefined, mode: string): void;

    /** 
	 * 显示更新信息 
	 * 
	 * 将在不同的情况显示不同的内容: 
	 * 
	 * 1. 无名杀更新后 (`lib.version`不等于`lib.config.version`) , 将显示无名杀版本更新内容
	 * 
	 * 2. `_status.extensionChangeLog`存在时, 将展示扩展更新内容
	 * 
	 * 加入扩展更新内容示例: 
	 * ```js
	 * _status.extensionChangeLog = { 
	 * 	'扩展名': '我的扩展', 
	 * 	'版本号': 'v1.23',
	 * 	'更新内容': 'xxx' 
	 * };
	 * ```
	 */
    showChangeLog(): void;
    /** 
	 * 显示扩展的更新日志
	 * 
	 * 注: 使用此函数不会立即显示更新日志提示
	 * 
	 * 如果`extname`扩展存在且开启，且`lib.config['extension_' + extname + '_changelog']`不等于当前扩展版本,
	 * 
	 * 将会在`游戏界面加载完成后`显示扩展更新内容(根据`_status.extensionChangeLog`显示)
	 * 
	 * @param str 更新内容
	 * @param extname 扩展名
	 */
    showExtensionChangeLog(str: string, extname: string): void;

    /**
     * 保存配置
	 * 
     * 若存在lib.db，则保存在指定数据库中，若没有则缓存在本地中
	 * 
     * 同时，也会保存到内存中，若选择保存本地，则保存在lib.config.mode_config
	 * 
     * 若不是则lib.config中。
	 * 
     * @param key 保存的键
     * @param value 保存的值(应是原始类型)
     * @param local 是否保存在本地,当local是string时，则key将拼接成：key += '_mode_config_' + local
     * @param callback 执行完保存后的回调
     */
    saveConfig(key: string, value?: any, local?: boolean | string, callback?: () => void): void;
    /** 保存配置（从lib.config读取key对应的值保存） */
    saveConfigValue(key: string): void;
    /** 保存扩展配置，key的结构为："extension_扩展名_key" */
    saveExtensionConfig(extension: string, key: string, value?: any): void;
    /** 获取扩展配置 */
    getExtensionConfig(extension: string, key: string): any;
    /** 清除mode玩法的配置 */
    clearModeConfig(mode): void;

    /**
     * 添加玩家
     * @param position 位置
     * @param character 主将名
     * @param character2 副将名
     */
    addPlayer(position: number, character?: string, character2?: string): Player;
    /**
     * 添加同伴(随从)
     * @param position 设置随从的`player.dataset.position`
     * @param character 随从主将名
     * @param animation 调用`player.animate`，默认值为'start'(透明度从0到1的动画)
     */
	addFellow(position: number, character?: string, animation?: string = 'start'): Player;
    /**
     * 【事件】进入游戏事件（触发：enterGame进入游戏阶段触发）
     * @param player 触发enterGame时机的玩家
     */
    triggerEnter(player: Player): void;
    /**
     * 将一个不在场上的玩家，添加到游戏中(可能对应的是game.removePlayer)
	 * 
	 * `注: player不在game.players且不在game.dead中生效`
     */
    restorePlayer(player: Player): Player;
    /**
     * 移除玩家
     */
    removePlayer(player: Player): Player;
    /**
     * 将player替换为一个全新的player(可破部分抗性武将)
	 * 
	 * 注: 这和替换武将牌不同
	 * 
     * @param player 要被替换的角色
     * @param character 主将名
     * @param character2 副将名
     */
    replacePlayer(player: Player, character?: string, character2?: string): Player;
    /** 重新排列玩家 */
    arrangePlayers(): void;

    /**
     * 从传入的skills过滤玩家被禁用/封印的技能，且get.is.blocked('技能名')返回值为true的技能也会被过滤掉
     * @param skills 要过滤的技能数组
     * @param player 要进行判断的玩家
	 * @param exclude 强制不被过滤的技能数组(不能在player.disabledSkills中出现)
     */
	filterSkills(skills: string[], player: Player, exclude?: string[]): string[];
    /**
     * 解析技能所包含的技能组
	 * 
     * 即技能的group属性所记录的技能组
	 * 
     * 注: 此函数会改变传入的skills参数
     */
	expandSkills(skills: string[]): string[];

    /** 添加css */
	css<T extends keyof CSSStyleDeclaration>(style: {
		[key in T]?: string
	}): void;

    //一些常用的过滤
    /**
     * 检测当前是否有符合条件的玩家（不包括out, 不包括死亡角色）
     * @param func 过滤条件
     */
    hasPlayer(func?: OneParmFun<Player, boolean>): boolean;
    /**
     * 检测当前是否有符合条件的玩家（不包括out, 包括死亡角色）
     * @param func 过滤条件
     */
    hasPlayer2(func?: OneParmFun<Player, boolean>): boolean;
    /**
     * 计算符合条件的玩家数（不包括死亡角色）
     * @param func 回调函数，根据条件返回计数，若返回值为false则不计数，返回值为true默认+1，返回值为num，则增加num
     */
    countPlayer(func?: OneParmFun<Player, boolean | number>): number;
    /**
     * 计算符合条件的玩家数(不包括out, 包括死亡角色)
     * @param func 回调函数，根据条件返回计数，若返回值为false则不计数，返回值为true默认+1，返回值为num，则增加num
     */
    countPlayer2(func?: OneParmFun<Player, boolean | number>): number;
    /**
     * 获取过滤后的玩家列表(在场上的玩家)
     * @param func 函数返回true，则通过
     * @param list 可以传入一个玩家列表数组，继续添加结果到里面，默认生成一个新的空数组
     */
    filterPlayer(func?: OneParmFun<Player, boolean>, list?: Player[]): Player[];
    /**
     * 获取过滤后的玩家列表(包括已经死亡玩家，即所有玩家)
     * @param func 返回true，则通过
     * @param list 可以传入一个玩家列表数组，继续添加结果到里面，默认生成一个新的空数组
     */
    filterPlayer2(func?: OneParmFun<Player, boolean>, list?: Player[]): Player[];
    /**
     * 查找玩家(在场上的玩家)
     */
    findPlayer(func?: OneParmFun<Player, boolean>): Player;
    /**
     * 查找玩家(包括已经死亡玩家，即所有玩家)
     */
    findPlayer2(func?: OneParmFun<Player, boolean>): Player;
    /**
     * 查找卡牌
     * @param func 
     * @param all 是否查找所有卡牌，若为true，则是查找所有；若为false或者默认不填，则是只查找自己当前使用卡堆里有的牌
     */
    findCards(func?: TwoParmFun<string, ExCardData, boolean>, all?: boolean): string[];
    /**
     * 获取当前游戏中存在的势力数（种类）
     */
    countGroup(): number;

    /**
	 * 【v1.9.98】
	 * 
     * 获取本回合内发生过的 不属于任何角色的一些事件
	 * 
     * (类似于player.getHistory())
     * 
     * 注：目前仅支持cardMove参数（cardsDiscard cardsGotoOrdering cardsGotoSpecial等涉及卡牌位置改变的事件）；
	 * 
     * 注2：【v1.9.102】所有角色经历的lose事件会同时记录到globalHistory中；
	 * 
     * @param key 要取出指定的事件的使用记录,若不填，则取出当前玩家回合的所有使用记录
     * @param filter 过滤条件,过滤某一事件记录类型中的指定事件
     * @returns 若两个参数都没有，则返回当前玩家回合的记录，若有key，则获取指定类型的记录
     */
    getGlobalHistory(): GlobalHistoryData;
    getGlobalHistory(key: keyof GlobalHistoryData, filter?: OneParmFun<GameEvent, boolean>): GameEvent[];

    /** 
	 * 【v1.9.105.9~】增加评级系统：评级仅影响战棋君主模式下的武将价格，无其他实际影响；
	 * 
	 * 获取指定名字的武将的评级
	 */
    getRarity(name: string): string;

	/**
	 * 【v1.9.118】 用法同player.getAllHistory()
	 */
	getAllGlobalHistory(): GlobalHistoryData;
	getAllGlobalHistory(key: keyof ActionHistoryData, filter?: OneParmFun<GameEvent, boolean>): GameEvent[];

	importedPack?: ExtensionInfoConfigData;
}

// Game的核心成员属性
interface Game {
    /** 正在游戏中的玩家 */
    players: Player[];
    /** 死亡玩家 */
    dead: Player[];
    /** 暂时未见使用，可能是全部替换成了game.importedPack */
    imported: any[];
    /** 保存当前游戏玩家map，key为玩家id */
    playerMap: SMap<Player>;
    /** 回合数 */
    phaseNumber: number;
    /** 轮数（即从开始玩家开始轮流执行过一次回合后，算一轮） */
    roundNumber: number;
    /** 洗牌次数 */
    shuffleNumber: number;

    /** 
	 * 身份局的主公
	 * 
	 * 单挑模式下的先手角色
	 */
    zhu: Player;
    /** 玩家自己 */
    me: Player;
	/** 单挑模式下的后手角色 */
	fan: Player;
	/** 挑战模式下的boss */
	boss: Player;

    /** 服务器 */
    ws: WebSocket;

    //【联机】相关属性
    /**
     * 是否在线
     * 
     * 主机，只有在联机房间时才是true,一旦创建房间后就是false，包括游戏中；
	 * 
     * 客机，只要是联机模式都保持true；
     */
    online: boolean;
    onlineID?: string;
    onlineKey?: string;
    ip: string;
    roomId: number;
	deviceZoom: number;
	documentZoom: number;
	minskin?: any;
	layout: string;
}

// 由玩法模式自己扩展实现的Game方法接口
interface Game {
    /**
     * 【联机】获取场上playerOL的状态信息；
     * 
     * 用于：1.服务器发送“reinit”信息；2.同步场上的游戏的状态，例如game.syncState;
     */
    getState(): any;
    /**
     * 获取指定玩家可用身份列表
     * 
     * 用于：ui.click.identity;
     */
    getIdentityList(player: Player): SMap<string>;
    /**
     * 用于在特定模式下，重置身份列表的对应的名字
     * 
     * 用于：ui.click.identity;
     */
    getIdentityList2(list: SMap<string>): void;
    /**
     * 【联机】更新state
     * 
     * 一般，处理更新来自getState中的信息；
     */
    updateState(state: any): void;
    /**
     * 【联机】显示房间信息
     * 
     * 用于：ui.click.roomInfo，打开显示相关的房间信息；
     */
    getRoomInfo(div: HTMLDivElement): void;
    /** 获取录像名，用于录像，需要重写这个，才会保留录像 */
    getVideoName(): [string, string];
    /** 添加胜负场次结算(见于菜单-其他-战绩) */
    addRecord(resultbool: boolean): void;
    /** 所有角色显示身份 */
	showIdentity(me?: boolean): void;
    /**
     * 【联机】检查最终结果
     * 
     * 用于：game.over
     * @param players 所有玩家：包括活着，死亡；
     */
    checkOnlineResult(players: Player[]): boolean;
    /** 选择角色 */
    chooseCharacter(): void;
    /** 【联机】选择角色 */
    chooseCharacterOL(): void;

    /**
     * 自定义回合抽牌操作
     * 
     * 作用：phaseDraw事件触发，在步骤“step 2”中，优先使用该方法
     */
    modPhaseDraw(player: Player, num: number): void;
    /**
     * 在chooseToUse/chooseToRespond/chooseToDiscard中，自定义交换玩家操作模式
     * 
     * 作用：
	 * 
     * 1.chooseToUse/chooseToRespond/chooseToDiscard事件触发，在步骤“step 0”中，非自动，在自己操作面板区域中时，可触发
     * 
	 * 2.在game.swapPlayerAuto中，优先使用该自定义方法
     */
    modeSwapPlayer(player: Player): void;

    /**
     * 点击暂停游戏时的处理方法
     * 
     * 作用：在ui.click.pause中使用
     */
    onpause(): void;
    /**
     * 点击继续游戏时的处理方法
     * 
     * 作用：在ui.click.onresume中使用
     */
    onresume(): void;

    /** 自定义洗牌方法 */
    onwash(): string;
    /** 自定义game.over游戏结束时的处理方法 */
    onover(): string;

    /** 自定义金币显示接口 */
    changeCoin(num: number): void;

    /** 暂时不明白有什么用，boss,stone玩法有设置到这值，该值为true时，die死亡时，不清除mark标记 */
    reserveDead: boolean;

    /** 强制指定启用当行手牌显示？ */
    singleHandcard: boolean;

    //【v1.9.108.6】
    /**
	 * 【v1.9.108.6】
	 * 
     * loseCardAsync事件，用于多人同时失去牌。
     * 
     * 用于处理失去牌后需要二次操作的情况和需要多名角色同时失去牌的情况的事件。
	 * 
     * 时机为loseAsyncAfter，用getl获取失去牌，根据需要设置自定义content。【苏婆官方注释】
     * 
     * 补充，该方法只是单纯创建一个“loseAsync”事件，其事件的处理方法content，根据需要，需要在创建事件后使用event.setContent，一些预定义，或者自定义的事件处理方法；
     * 
	 * 【v1.9.118】 添加了一个gainMultiple的loseAsync流程，添加和getl()相对应的getg()。
     */
    loseAsync(arg?: SMap<any>): BaseLoseEventInfo;

    /** 游戏结束后，不提示"再战" */
    no_continue_game: boolean;

	/** 【国战】判断(亮将后)游戏是否应该结束 */
	tryResult(): void;
}

/** 回放录像的模式中用此信息初始化一个player */
type VideoPlayerInfo = { name: string, name2?: string, identity: string };

/** 回放录像的模式中用此信息初始化一个player(炉石模式) */
type VideoStonePlayerInfo = { 
	name: string, 
	name2?: string, 
	me: boolean,
	position: any,
	actcount: any,
};

/** 回放录像的模式中用此信息初始化一个card */
type VideoCardInfo = {
	/** 卡牌名翻译 */ 
	translate: string;
	/** 卡牌效果 */
	info: string;
	/** 应该是卡牌id */
	name: string, 
	/** 赋值给card.cardimage，不过只应该是个卡牌id */
	card: string, 
	/** 赋值给card.legend */
	legend: boolean; 
	/** 赋值给card.epic */
	epic: boolean;
	/** 赋值给card.unique */
	unique: boolean;
};

/**
 * 录像相关content
 */
interface VideoContent {
	/**
	 * 把content内容覆盖到lib里
	 * @param content 二维字符串数组
	 */
	arrangeLib(content: string[][]): void;
	/** 添加/删除 酒的特效 */
	jiuNode(player: Player, bool?: boolean): void;
	/** 初始化场景，并根据一个对象信息初始化武将 */
	init(players: VideoPlayerInfo[]): void;
	newcard(content: VideoCardInfo[]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * game.changeLand(url, player);
	 * ```
	 */
	changeLand(player: Player, url: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.land?.destroy();
	 * ```
	 */
	destroyLand(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * game.playAudio(str,'video');
	 * ```
	 */
	playAudio(str: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * game.playSkillAudio(name,'video');
	 * ```
	 */
	playSkillAudio(name: string): void;
	/**
	 * 其他角色移除样式 ".glow_phase"
	 * 
	 * 自己添加样式 ".glow_phase"
	 */
	phaseChange(player: Player): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player?.playerfocus?.(time);
	 * ```
	 */
	playerfocus(player: Player, time: number): void;
	/**
	 * ui.arena暂时添加样式 ".playerfocus", 1.5s后移除
	 */
	playerfocus2(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.node.identity.firstChild.innerHTML = str;
	 * ```
	 */
	identityText(player: Player, str: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.node.identity.dataset.color = str;
	 * ```
	 */
	identityColor(player: Player, str: string): void;
	/**
	 * 应该是战旗模式的替换"正在行动角色"的样式
	 * 
	 * 调用如下代码: 
	 * ```js
	 * game.playerMap[content[0]].classList.remove('current_action');
	 * game.playerMap[content[1]].classList.add('current_action');
	 * ```
	 * 
	 * @param content 里面是两个数字的数组，都代表着一个角色的id
	 */
	chessSwap(content: [number, number]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * infos = get.infoCards(infos);
	 * player?.$gainmod?.(infos);
	 * ```
	 */
	chessgainmod(player: Player, infos: any[][]): void;
	/**
	 * pos类型还没有查清楚
	 * 
	 * 调用如下代码: 
	 * ```js
	 * player?.moveTo?.(pos[0],pos[1]);
	 * ```
	 */
	moveTo(player: Player, pos: [any, any]): void;
	/**
	 * pos类型还没有查清楚
	 * 
	 * 调用如下代码: 
	 * ```js
	 * game.addObstacle?.(pos[0],pos[1]);
	 * ```
	 */
	addObstacle(pos): void;
	/**
	 * pos类型还没有查清楚
	 * 
	 * 调用如下代码: 
	 * ```js
	 * game.removeObstacle(pos);
	 * ```
	 */
	removeObstacle(pos: any[]): void;
	/**
	 * pos类型还没有查清楚
	 * 
	 * 调用如下代码: 
	 * ```js
	 * game.moveObstacle(pos[0], pos[1], pos[2]);
	 * ```
	 */
	moveObstacle(pos: any[]): void;
	/**
	 * pos类型还没有查清楚
	 * 
	 * 调用如下代码: 
	 * ```js
	 * game.colorObstacle(pos[0], pos[1], pos[2]);
	 * ```
	 */
	colorObstacle(pos: any[]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.arena.classList.add('thrownhighlight');
	 * ```
	 */
	thrownhighlight1(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.arena.classList.remove('thrownhighlight');
	 * ```
	 */
	thrownhighlight2(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.chessFocus();
	 * ```
	 */
    chessFocus(player: Player): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * game.playerMap[pos].delete();
	 * delete game.playerMap[pos];
	 * ```
	 */
	removeTreasure(pos: number): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * obs.forEach(ob => game.addObstacle(ob));
	 * ```
	 */
	initobs(obs: any[]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * let player = game.playerMap[content[0]];
     * if(player){
     * 	delete game.playerMap[content[0]];
     * 	player.dataset.position = content[1];
     * 	game.playerMap[content[1]] = player;
     * }
	 * ```
	 */
	stonePosition(content: [number, number]): void;
	/**
	 * 应该是增加boss / 随从
	 * @param name 如果开头是'_'则为随从
	 */
	bossSwap(player: Player, name: string): void;
	/**
	 * 根据info创建一个新玩家(别的作用不太清楚)
	 */
	stoneSwap(info: VideoStonePlayerInfo): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.storage.tongshuai.owned = content;
	 * ```
	 */
	chess_tongshuai(player: Player, content): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.marks.tongshuai.firstChild?.remove();
	 * player.marks.tongshuai.setBackground(content[0], 'character');
	 * player.additionalSkills.tongshuai = content[1];
	 * ```
	 */
	chess_tongshuai_skill(player: Player, content: [any, any]): void;
	/**
	 * 暂时显示另外武将皮肤的函数(参考左慈点击后暂时显示现在化身的武将)
	 * @param vice 是否是副将
	 */
	smoothAvatar(player: Player, vice: boolean): void;
	/**
	 * 武将更换皮肤
	 * ```js
	 * // 即 player.setAvatar(name, name2);
	 * player.setAvatar(content[0], content[1]);
	 * ```
	 */
	setAvatar(playerr: Player, content: [string, string | undefined]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * // 即 player.setAvatarQueue(name, list);
	 * player.setAvatarQueue(content[0], content[1]);
	 * ```
	 */
	setAvatarQueue(playerr: Player, content: [string, string | undefined]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * var skill = content[0];
	 * lib.skill[skill] = content[1];
	 * lib.character[skill] = content[2];
	 * lib.translate[skill] = content[3];
	 * player.storage[skill] = content[4];
	 * ```
	 */
	addSubPlayer(player: Player, content: [string, ExSkillData, HeroData, string, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.arena.dataset.number = content;
	 * ```
	 */
	arenaNumber(content: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * source.uninit();
	 * source.init(content[0]);
	 * source.node.identity.dataset.color = content[1];
	 * ```
	 */
	reinit(source: Player, content: [string, string]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * source.init(name);
	 * ```
	 */
	reinit2(source: Player, name: string): void;
	/** 想知道的自己看源码吧 */
	reinit3(source: Player, content: {
		from: string,
		to: string,
		avatar2: boolean,
		hp: number,
	}): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * if (typeof content == 'string') lib.skill[content]?.video(player);
	 * else if(Array.isArray(content)) lib.skill[content[0]]?.video(player, content[1]);
	 * ```
	 */
	skill(player: Player, content: string | [string, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * const player = game.addFellow(content[0], content[1], content[2]);
	 * game.playerMap[player.dataset.position] = player;
	 * ```
	 */
	addFellow(content: [any, any, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.window.style.transition='all 0.5s';
	 * ui.window.classList.add('zoomout3');
	 * ui.window.hide();
	 * ```
	 */
	windowzoom1(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.window.style.transition='all 0s';
	 * ui.refresh(ui.window);
	 * ```
	 */
	windowzoom2(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.window.classList.remove('zoomout3');
	 * ui.window.classList.add('zoomin3');
	 * ```
	 */
	windowzoom3(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.window.style.transition='all 0.5s';
	 * ui.refresh(ui.window);
	 * ui.window.show();
	 * ui.window.classList.remove('zoomin3');
	 * ```
	 */
	windowzoom4(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * ui.window.style.transition='';
	 * ```
	 */
	windowzoom5(): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.updateActCount(content[0], content[1], content[2]);
	 * ```
	 */
	updateActCount(player: Player, content: [any, any, any]): void;
	setIdentity(player: Player, identity: string): void;
	showCharacter(player: Player, num: 0 | 1 | 2): void;
	hidePlayer(player: Player): void;
	deleteHandcards(player: Player): void;
	hideCharacter(player: Player, num: 0 | 1 | 2): void;
	popup(player: Player, info: [any, any]): void;
	/** 等同于只有一个参数的game.log */
	log(str: any): void;
	draw(player: Player, info: any[][]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$draw(get.infoCards(info));
	 * ```
	 */
	drawCard(player: Player, info: any[][]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$throw(get.infoCards(info[0]) ,info[1], null, info[2]);
	 * ```
	 */
	throw(player: Player, info: [any, any, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$compare(get.infoCard(info[0]), game.playerMap[info[1]], get.infoCard(info[2]));
	 * ```
	 */
	compare(player: Player, info: [any[][], number, any[][]]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$compareMultiple(get.infoCard(info[0]), get.infoTargets(info[1]), get.infoCards(info[2]));
	 * ```
	 */
	compareMultiple(player: Player, info): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$give(info[0], game.playerMap[info[1]]);
	 * ```
	 */
	give(player: Player, info: [Player, number]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$give(get.infoCards(info[0]), game.playerMap[info[1]]);
	 * ```
	 */
	giveCard(player: Player, info: [any[][], number]): void;
	gain(player: Player, info): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$gain(get.infoCards(info));
	 * ```
	 */
	gainCard(player: Player, info): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * const nodes = [...document.querySelectorAll('#arena>.card,#chess>.card')];
	 * // 经过一些条件后
	 * player.$draw(get.infoCards(cards));
	 * ```
	 */
	gain2(player: Player, cards: Card[]): void;
	deletenode(player: Player, cards: Card[], method?: 'zoom'): void;
	/** 部分符合的node.classList.add('thrownhighlight'); */
	highlightnode(player: Player, cards: Card[]): void;
	uiClear(): void;
	judge1(player: Player, content: [any, any, any]): void;
	centernode(content): void;
	/** ui.dialogs中寻找videoId相同的关闭 */
	judge2(videoId: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.unmark(name);
	 * ```
	 */
	unmarkname(player: Player, name: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.marks[name].delete();
	 * player.marks[name].style.transform += ' scale(0.2)';
	 * delete player.marks[name];
	 * ui.updatem(this);
	 * ```
	 */
	unmark(player: Player, name: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player['$' + type]();
	 * ```
	 */
	flame(player: Player, type: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$throwEmotion(game.playerMap[content[0]], content[1]);
	 * ```
	 */
	throwEmotion(player: Player, content: [string, any]): void;
	addGaintag(player: Player, content: [any, any]): void;
	removeGaintag(player: Player, content): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.line(game.playerMap[content[0]], content[1]);
	 * ```
	 */
	line(player: Player, content: [number, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$fullscreenpop(content[0], content[1], content[2]);
	 * ```
	 */
	fullscreenpop(player: Player, content: [any, any, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.$damagepop(content[0], content[1], content[2]);
	 * ```
	 */
	damagepop(player: Player, content: [any, any, any]): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 *  player.$damage(game.playerMap[source]);
	 * ```
	 */
	damage(player: Player, source: number): void;
	/** player阵亡代码，炉石模式还会自动移除 */
	diex(player: Player): void;
	/** 初始化player */
	tafangMe(player: Player): void;
	deleteChessPlayer(player: Player): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * game.addChessPlayer.apply(this,content);
	 * ```
	 */
	addChessPlayer(content): void;
	/** 阵亡代码，战旗模式做了特殊处理 */
	die(player: Player): void;
	revive(player: Player): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.hp=info[1];
	 * player.maxHp=info[2];
	 * player.hujia=info[3];
	 * player.update(info[0]);
	 * ```
	 */
	update(player: Player, info: [any, number, number, number]): void;
	
	/** 空函数 */
	phaseJudge(player, card): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.directgain(get.infoCards(cards));
	 * ```
	 */
	directgain(player: Player, cards): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * player.directequip(get.infoCards(cards));
	 * ```
	 */
	directequip(player: Player, cards): void;
	gain12(player: Player, cards12: [any ,any, any]): void;
	equip(player: Player, card): void;
	addJudge(player: Player, content: [any, any]): void;
	markCharacter(player: Player, content: {
		id: string,
		target: number
	}): void;
	changeMarkCharacter(player: Player, content: {
		id: string,
		name: string,
		target: number
		content: any
	}): void;
	mark(player: Player, content: {
		id: string,
	}): void;
	markSkill(player: Player, content: [any, any]): void;
	unmarkSkill(player: Player, name: string): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * if(content[2]){
	 * 	switch(content[2]){
	 * 		case 'cards': content[1] = get.infoCards(content[1]); break;
	 * 		case 'card': content[1] = get.infoCard(content[1]); break;
	 * 	}
	 * }
	 * player.storage[content[0]] = content[1];
	 * ```
	 */
	storage(player: Player, content: [string, any, 'cards' | 'card' | undefined]): void;
	markId(player: Player, content: [any, any]): void;
	unmarkId(player: Player, content: [any, any]): void;
	lose(player: Player, info: [any, any, any, any]): void;
	/** 空函数 */
	loseAfter(player): void;
	link(player: Player, bool: boolean): void;
	turnOver(player: Player, bool: boolean): void;
	/**
	 * 调用如下代码: 
	 * ```js
	 * var dialog = ui.create.dialog(info[0], get.infoCards(info[1]));
	 * setTimeout(() => dialog.close()),1000);
	 * ```
	 */
	showCards(player: Player, info: [any, any]): void;
	cardDialog(content: [any, any, any] | number): void;
	changeSeat(player: Player, info): void;
	dialogCapt(content: [any, any]): void;
	swapSeat(content: [number, number]): void;
	removeTafangPlayer(): void;
	swapControl(player: Player, hs): void;
	onSwapControl(): void;
	swapPlayer(player: Player, hs): void;
	over(str: string): void;
}

/** 动画类型 */
type AnimateType = 'thunder' | 'fire' | 'coin' | 'dust' | 'legend' | 'epic' | 'rare' | 'recover';

interface Animate {
	/**
	 * 注: 此函数不要在选将完成前使用，会导致游戏报错
	 * 
	 * @param num 为1时，把窗口里的内容全部缩小到消失的动画。为2时反过来
	 */
    window(num: 1 | 2): void;
	/**
	 * 播放指定特效动画
	 * @param x 动画x坐标
	 * @param y 动画y坐标
	 * @param duration 动画时长
	 * @param type 动画类别(默认为一个火焰动画)
	 */
	flame(x: number, y: number, duration: number, type?: AnimateType): void;
}

type LineConfig = {
	/** 透明度 */
    opacity?: number;
	/** 颜色(RGB) */
	color?: [number, number, number];
	/** 
	 * 在game.linexy中未用到，而在game._linexy用到
	 * 
	 * 控制canvas的lineCap属性，设置或返回线条末端线帽的样式。
	 */
    dashed?: boolean;
	/** 持续时长 */
    duration?: number;
}

/** 无名杀的技能mod名称汇总 */
type ModName = 'selectTarget' | 'judge' | 'inRange' | 'inRangeOf' | 'globalFrom' | 'globalTo' | 'attackFrom' | 
	'attackTo' | 'targetEnabled' | 'cardUsable' | 'attackRangeBase' | 'attackRange' | 'maxHandcardBase' | 
	'maxHandcard' | 'maxHandcardFinal' | 'ignoredHandcard' | 'cardEnabled2' | 'cardSavable' | 'cardEnabled' | 
	'cardRespondable' | 'cardUsableTarget' | 'cardDiscardable' | 'canBeDiscarded' | 'canBeGained' | 
	'playerEnabled' | 'targetInRange' | 'cardChongzhuable' | 'cardname' | 'suit' | 'cardnumber' | 
	'cardnature' | 'aiUseful' | 'aiValue' | 'aiOrder';

/** indexDB数据库的表名 */
type DataDbIds = 'audio' | 'config' | 'data' | 'image' | 'video';

/** 全局事件的使用记录 */
type GlobalHistoryData = {
    /** （cardsDiscard cardsGotoOrdering cardsGotoSpecial等涉及卡牌位置改变的事件 */
    cardMove: GameEvent[],
    custom: GameEvent[],
	useCard: GameEvent[],
	/** if (event.parent._roundStart) == true时，isRound为true */
	isRound?: boolean,
}

// 定义类型为-1到1000的类型NumberRange，保留以后可能用得到
/*
type Range<From extends number, To extends number> = From extends To ? readonly [To] : [From, ...Range<From extends keyof any ? From + 1 : never, To >];
type NumberRange = Range<-1, 1000>[number];
*/

/** 保存在game的下载方法 */
interface IDownLoadFun {
	/** 检查更新(最好不要使用此方法，可能会导致游戏崩溃) */
	checkForUpdate: Function;
	/**
	 * 创建文件夹
	 */
	createDir(dir: string, success?: Function, error?: (err: Error) => void): void;
	/**
	 * 下载url的文件(不适用于下载非无名杀官方资源)
	 * 
	 * @param url 下载地址, 如果不是http开头则在前面自动加上无名杀更新源
	 * @param folder 一般与url参数相同，不过不是网址，而是从无名杀根目录算起的地址
	 * @param onsuccess 下载成功回调
	 * @param onerror 下载失败回调
	 * @param dev url不是一个网址时，执行get.url(dev)作为下载地址的前缀
	 * @param onprogress 下载进度回调
	 */
	download(url: string, folder: string, onsuccess: Function, onerror: Function, dev?= 'nodev', onprogress?: Function): void;
    /**
	 * 读取本地文件
	 * @param filename 文件相对于无名杀根目录的地址
	 * @param callback 回调函数
	 * @param onerror 失败回调
	 */
	readFile(filename: string, callback: (data: Buffer | ArrayBuffer) => void, onerror: (err: Error) => void): void;
	/**
	 * 【v1.9.122】以文本格式读取本地文件
	 * @param filename 文件相对于无名杀根目录的地址
	 * @param callback 回调函数
	 * @param onerror 失败回调
	 */
	readFileAsText(filename: string, callback: (data: string) => void, onerror: (err: Error) => void): void;
	/**
	 * 将数据写入本地文件
	 * 
	 * 【v1.9.122】修复异步未等待文件夹创建完成的问题
	 * @param data 数据内容
	 * @param path 目标地址文件的父文件夹
	 * @param name 目标地址的文件名
	 * @param callback 回调函数
	 */
	writeFile(data: string | ArrayBuffer | File, path: string, name: string, callback: (err: NodeJS.ErrnoException | null) => void): void;
    /**
	 * 删除本地文件
	 * @param filename 目标地址相对于无名杀根目录的文件地址
	 * @param callback 回调函数
	 */
	removeFile(filename: string, callback: (err: NodeJS.ErrnoException | null) => void): void;
	/**
	 * 获取一个文件夹内所有文件和文件夹
	 * 
	 * `注: 电脑端传入的dir不存在时可能会引起报错`
	 * 
	 * @param dir 目标地址文件夹
	 * @param callback 回调函数
	 */
	getFileList(dir: string, callback: (folders: string[], files: string[]) => void): void;
	/**
	 * 按照给定路径依次创建对应文件夹
	 * ```js
	 * // 路径不包含文件名: 
	 * game.ensureDirectory("dir1/dir2", () => {}, false);
	 * // 路径包含文件名: 
	 * game.ensureDirectory("dir1/dir2/1.js", () => {}, true);
	 * ```
	 * @param list 要创建的目录/目录列表
	 * @param callback 回调函数，即创建完文件夹之后做什么
	 * @param file 路径list中是否包含文件名
	 */
	ensureDirectory(list: string | string[], callback: Function, file?: boolean): void;
}

/** game.logv创建的div */
interface logv extends HTMLDivElement {
    /** 里面的内容和game.log输出的差不多 */
    added: string[];
    /** 此次事件涉及的卡牌 */
    cards?: Card[];
    /** 当且仅当game.logv的card参数为字符串'die'时才有这个属性 */
    dead?: true;
    /** 当且仅当game.logv的card参数为字符串'die'时才有这个属性 */
    player?: Player;
    /** id */
    logvid: string;
    /** 关联其子元素 */
    node: SMap<HTMLDivElement>;
    /** 此次事件涉及的技能名 */
    skill?: string;
    /** 此次事件涉及的目标角色 */
    targets?: Player[];
    /** 当且仅当game.logv的target参数不为player参数且存在时才有这个属性 */
    source?: Player;

    players?: Player[];
}

declare var game: Game;