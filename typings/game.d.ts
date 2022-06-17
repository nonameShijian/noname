declare var game: Game;
/**
 * 游戏主逻辑相关方法
 */
interface Game extends IDownLoadFun {
    /**
     * 卡牌弃置
     * 创建“cardsDiscard”事件，
     * 该事件逻辑是遍历cards，调用它们的discard舍弃；
     * 
     * 苏版解析:将不属于任何人的卡牌置入弃牌堆
     * @param cards 
     */
    cardsDiscard(cards: Card | Card[]): GameEvent;
    //【1.9.98.2】新增方法 by2020-2-24
    /**
     * 将卡牌送至ui.special
     * 
     * 同样是创建“cardsDiscard”事件，触发“addCardToStorage”时机
     * @param cards 
     * @param bool 默认触发“addCardToStorage”时机，设置值false不触发
     */
    cardsGotoSpecial(cards: Card | Card[], bool?: boolean): GameEvent;
    //20203-5新增
    /**
     * 可以通过指定一个事件而不一定是强制使用当前事件，
     * 在这个事件之后丢弃所有还在处理区未被移动的卡牌
     * 
     * 使用方法：通过将relatedEvent设置为当前事件的parent（即useCard），
     *  在这一事件结束时而不是contentBefore结束时再丢弃所有卡牌。例子：
     * contentBefore:function(){
        ...
        var cards=get.cards(num);
        game.cardsGotoOrdering(cards).relatedEvent=event.getParent();
        ...
        }
     * @param cards 
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
    checkFileList(updates, proceed): void;

    /** 【事件】置换手牌 */
    replaceHandcards(...args): void;
    /** 移除指定名字的卡牌（从lib.card.list，和ui.cardPile卡堆中移除） */
    removeCard(name: string): void;

    //联网相关
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
    broadcast(...args): void;
    broadcast(fun: RestParmFun<void>, ...args): void;
    /** 
     * 向所有客户端通信（包括自己，发出通信后，自己执行一次函数和参数） 
     * 
     * 只能主机使用；
     */
    broadcastAll(...args): void;
    broadcastAll(fun: RestParmFun<void>, ...args): void;
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
     * 【核心】播放声音。
     * 
     * 参数列表：（可以调整顺序，但是建议还是按照正常顺序）
     *  若参数有字符串类型，将按照“/字符串”拼接起来（可以多个字符串参数，按从左到右拼接），
     *      最终拼接：lib.assetURL+'audio'+参数拼接起来的路径+（'.mp3'/'.ogg'/''）；
     *      其中，若参数列表，第二个参数为“video”，则为录像中需要播音，一般不用考虑这个，可以无视；
     *  若参数是方法类型，则是声音类的onerror回调函数，在播放声音出现异常时回调。
     */
    playAudio(...args): HTMLAudioElement;
    /**
     * 播放技能声音
     * （主要解析技能的audio属性寻找对应文件播放）
     * 
     * 当前声音播放格式：
     *  若info.audio是字符串：
     *      1.则主要是播放扩展声音,格式：ext:扩展包的名字:额外参数；
     *      2.直接就是技能名，即继承该技能的播放信息，audioinfo；
     *  若info.audio是数组，则[扩展名,额外参数]；
     *      额外参数：1."true"，则直接播放该名字的声音；2.数字，则是随机选一个该"技能名+1-数字范围"的声音播放；
     *  若info.audio是数字，则直接就是用解析出来的"audioname+1-数字范围";
     * 
     *  若info.audioname存在，且是数组，且方法参数有player，则播放"audioname_玩家名"的声音（即可同一个技能，不同人播放不同声音）
     * @param skill 技能名
     * @param player 是否指定玩家的武将（需要技能有audioname）
     * @param directaudio 没什么用，无视，若技能的direct为true，可以让directaudio为true，跳过技能配置的判断
     */
    trySkillAudio(skill: string, player?: Player, directaudio?: boolean): void;
    /**
     * 播放技能的声音2
     * 注：播放失败时，会重复寻找播放名.ogg,播放名+序号.mp3,播放名+序号.ogg，都不行就没用声音
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

    /* import(
        type: string, 
        content: ExtensionImportFunc | ExtensionInfoConfigData |
            CardImportFunc | importCardConfig |
            CharacterImportFunc | importCharacterConfig |
            ModeImportFunc | ExModeConfigData |
            PlayerImportFunc | ExModeConfigData |
            OtherImportFunc | ExCommonConfig
    ): void; */

    /**
     * 【核心】读取扩展信息
     * @param obj 
     */
    loadExtension(obj: ExtensionImportFunc | ExtensionInfoConfigData): void;
    /**
     * 导入扩展：（25693-25900）
     * 若不存在window.JSZip，则先加载JSZip，加载完后再重新执行一遍game.importExtension。
     * 若存在：后面主要都是生成zip的逻辑。
     * @param data 
     * @param finishLoad 
     * @param exportext 
     * @param pkg 
     */
    importExtension(data, finishLoad, exportext, pkg): void;
    /**
     * 导出：（25091-25932）
     * 如果当前是在移动端，则直接导出到移动端相关的文件夹内。
     * 若是网页版，则生成下载链接，点击下载配置。
     * @param textToWrite 
     * @param name 
     */
    export(textToWrite, name): void;

    //下载相关  用于更新信息
    /** 做些处理，调用game.download下载 */
    multiDownload2(list, onsuccess, onerror, onfinish, process, dev): void;
    /**
     * 下载列表内所有文件
     * 
     * 将文件列表分三分请求下载：
     * 核心下载调用multiDownload2 （game.download）
     * @param list 要下载的文件列表
     * @param onsuccess 下载成功
     * @param onerror 下载失败
     * @param onfinish 所有下载完成
     * @param process 处理将要下载的文件，返回将要使用的路径信息列表(game.download使用)
     * @param dev (game.download使用)
     */
    multiDownload(list, onsuccess, onerror, onfinish, process, dev): void;
    /**
     * 需要当前版本支持：
     * 
     * 主要分Android/ios的本地版FileTransfer（cordova.js），和pc版的nodejs环境
     * @param url 
     * @param folder 
     * @param onsuccess 
     * @param onerror 
     * @param dev 
     * @param onprogress 
     */
    download(url, folder, onsuccess, onerror, dev, onprogress);
    fetch(url, onload, onerror, onprogress): any;

    //录像相关
    playVideo(time, mode): void;
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
    addVideo(type: string, player: Player, content?: any): void;


    //重来
    reload(): void;
    reload2(): void;

    /** 退出游戏 */
    exit(): void;
    /**
     * 打开链接
     * 若是安卓或者ios客户端，则用iframe或者内置流浪器打开；
     * h5端直接跳转该链接
     * @param url 
     */
    open(url): void;
    /** 再战 */
    reloadCurrent(): void;

    //更新与更新相关动画逻辑
    update(func: Function): Function;
    unupdate(func: Function): void;
    stop(): void;
    run(): void;
    draw(func: Function): void;

    /** 震动 */
    vibrate(time: number): void;
    /** h5的prompt，用于显示可提示用户进行输入的对话框 */
    prompt(): void;
    /** 提示框（调用了game.prompt） */
    alert(str: string): void;
    /** 需要打印的信息（打印的信息在 菜单->其他->命令 中打印） */
    print(...args): void;

    /** 动画相关 */
    animate: Animate;


    /**
     * 画线
     * @param path 起始位置的信息
     * @param config 画线的配置,若是字符串，则是颜色：fire，thunder，green，drag
     */
    linexy(path: number[], config?: string | LineConfig, node?: HTMLDivElement): HTMLDivElement;
    /** 画线2  目前项目未发现使用 */
    _linexy(path: number[], config?: string | LineConfig, flag?: boolean): void;

    /** 【核心】创建游戏内触发事件 */
    createTrigger(name: string, skill: string, player: Player, event: GameEvent): void;
    /** 【核心】创建游戏内事件 */
    createEvent(name: string, trigger?: boolean, triggerevent?: GameEvent): GameEvent;

    //用于在onload->proceed2，解析lib.extensions中的数据：
    /** 添加武将（未使用） */
    addCharacter(name: string, info: any): void;
    /** 添加武将包 */
    addCharacterPack(pack: SMap<HeroData>, packagename?: string): void;
    /** 添加卡牌（未使用） */
    addCard(name: string, info: ExCardData, info2?: any): void;
    /** 添加卡包 */
    addCardPack(pack, packagename): void;
    /** 添加技能 */
    addSkill(name: string, info: ExSkillData, translate: string, description: string): void;
    /**
     * 添加玩法mode
     * @param name mode的name
     * @param info mode扩展内容
     * @param info2 mode的config扩展内容
     */
    addMode(name: string, info: ExModeConfigData, info2: ExtensionInfoConfigData): void;

    /**
     * 添加全局技能
     * （该添加的技能，是游戏中添加，而不是配置添加）
     * @param skill 技能名
     * @param player 若有该参数，则添加到lib.skill.globalmap中，目前似乎没怎么使用lib.skill.globalmap，
     */
    addGlobalSkill(skill: string, player?: Player): boolean;
    /**
     * 移除全局技能
     * @param skill 技能名
     */
    removeGlobalSkill(skill): void;
    /** 重置所有玩家的技能 */
    resetSkills(): void;
    /**
     * 移除扩展
     * @param extname 
     * @param keepfile 
     */
    removeExtension(extname: string, keepfile?: boolean): void;
    /**
     * 添加最近使用武将
     * （让其在武将列表的排序上靠前）
     * @param args 任意武将名
     */
    addRecentCharacter(...args: string[]): void;
    /**
     * 创建一张卡牌
     * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
     * @param suit 花色，若没有，先看卡牌信息中有不，否则随机；若值是“black”，则随机黑色的两种花色；若值是“red”，则随机红色的两种花色
     * @param number 数字，若没有，先看卡牌信息中有不，否则随机1~13；
     * @param nature 伤害属性，若没有，则获取卡牌信息的
     */
    createCard(name: string | CardBaseUIData, suit?: string, number?: number, nature?: string): Card;
    /**
     * 创建一张卡牌2
     * 
     * 用法和game.createCard完全一致 只不过生成的卡牌洗牌时不会消失；
     * @param name 卡牌名,也可以是一个带有这4个属性的对象，若是则覆盖这4个属性的值，此时，第二个参数可以是“noclick”
     * @param suit 花色，若没有，先看卡牌信息中有不，否则随机；若值是“black”，则随机黑色的两种花色；若值是“red”，则随机红色的两种花色
     * @param number 数字，若没有，先看卡牌信息中有不，否则随机1~13；
     * @param nature 伤害属性，若没有，则获取卡牌信息的
     */
    createCard2(name: string | CardBaseUIData, suit?: string, number?: number, nature?: string): Card;

    /**
     * 强制结束游戏。
     * 
     * 创建“finish_game”事件，设置content为“forceOver”。
     * @param bool 游戏结果:参考game.over的参数，额外：若值是“noover”，则不执行game.over
     * @param callback 
     */
    forceOver(bool?: boolean | string, callback?: Function): void;
    /**
     * 【核心】游戏结束
     * @param result 值：true战斗胜利，false战斗失败，undefined战斗结束(可以不填)，"平局"（可以直接填字符串）
     */
    over(result?: boolean | string): void;
    /** 【核心】游戏循环（核心） */
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
     * @param event 
     */
    check(event?: GameEvent): boolean;
    /**
     * 取消选中
     * 
     * 其参数若为空，默认取消所有相关的选中，若有指定的类型，则只取消该类型的选中
     * @param type 其类型可以"card","target","button"
     */
    uncheck(type?: string): void;

    //交换
    /**
     * 交换位置
     * @param player1 
     * @param player2 
     * @param prompt 是否打印日志
     * @param behind 是否移至player2座位之后
     * @param noanimate 是否有动画，true有动画
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
     * @param player 
     */
    swapPlayerAuto(player: Player): void;

    /**
     * 获取目标玩家的下一个玩家（按住座位位置player.dataset.position）
     * @param player 
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
    switchMode(name: string, configx: SMap<any>): void;
    /**
     * 读取玩法mode。
     * 创建“loadMode”事件，加载指定mode的js。
     * @param mode 
     */
    loadMode(mode: string): void;
    /**
     * 读取包。
     * 创建“loadPackage”事件，加载读取武将包，卡包
     * @param args 传入多个“路径/文件名”字符串，按照装顺序依次加载
     */
    loadPackage(...args: string[]): void;

    /**
     * 【事件】开始指定玩家的“游戏回合”（phaseLoop）
     * @param player 
     */
    phaseLoop(player: Player): void;
    /**
     * 【事件】开始指定玩家的“游戏开始抽牌事件”（gameDraw）
     * 注：【v1.9.108.6】后续加上（剩下的事件相关最好还是都返回事件比较好）；
     * @param player 默认自己
     * @param num 默认4
     */
    gameDraw(player?: Player, num?: number): GameEvent;
    /** 选择双将 */
    chooseCharacterDouble(...args): void;

    /** 【联机】更新 轮数 与剩余牌数 的ui显示*/
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
     * 检查是否有锁定技，并且执行锁定技，修改一些值和触发一些效果
     * 
     * 其参数列表：
     *  第一个至倒数第3个参数：作为mod锁定技的参数，
     *      注：其中倒数第3个参数（不为对象时），一般作为默认值（mod返回结果为0，false，null...时），最后的结果（非undefined结果）
     *  倒数第2个参数：为mod锁定技名，通过它索引技能配置的mod锁定技
     *  最后一个参数：为触发mod锁定技的玩家，提供该玩家的技能，寻找它拥有的mod锁定技。
     *      注：按照目前代码逻辑来看，如果玩家拥有技能存在多个同名mod，将会触发最终符合条件的结果（也有可能是不断累积结果，看实现）
     * @param args 
     * @return 返回倒数第3个参数
     */
    checkMod(...args): any;
    /**
     * 准备游戏场景:
     * 基本流程：
     *  准备显示历史面板 game.showHistory(false)
     *  创建玩家 ui.create.players(num)
     *  创建自身 ui.create.me()
     *  同步创建卡牌 ui.create.cardsAsync()
     *  卡牌与技能信息解析 game.finishCards()
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
     *  player/players,默认高亮为蓝色文本
     *  card/cards/{name:string},默认高亮为黄色文本
     *  object,即对象为普通对象（json结构），如果携带logvid，则设置logvid
     *  string:开头结尾有【】，则默认高亮为绿色文本；开头有“#b,#y,#g”，则显示蓝，黄，绿文本；否则直接显示该文本
     *  其余类型参数，直接拼接
     */
    log(...args): void;
    /** 
     * 打印日志（历史记录）
     * 【UI】根据logvid打印历史信息
     */
    logv(player, card, targets, event, forced, logvid): HTMLDivElement;

    //保存到数据库中
    putDB(type, id, item, callback): void;
    getDB(type, id, callback): void;
    deleteDB(type, id, callback): void;
    save(key, value, mode): void;

    /** 显示更新信息 */
    showChangeLog(): void;
    /** 显示扩展更新日志（没用上） */
    showExtensionChangeLog(str, extname): void;

    /**
     * 保存配置：（31499-31556）
     * 若存在lib.db，则保存在指定数据库中，若没有则缓存在本地中。
     * 同时，也会保存到内存中，若选择保存本地，则保存在lib.config.mode_config；
     * 若不是则lib.config中。
     * @param key 保存的key
     * @param value 保存的value
     * @param local 是否保存在本地,当local是string时，则key将拼接成：key+='_mode_config_'+local
     * @param callback 执行完保存后的回调
     */
    saveConfig(key: string, value?: any, local?: boolean | string, callback?: () => void): void;
    /** 保存配置（从lib.config读取key的值保存） */
    saveConfigValue(key: string): void;
    /** 保存扩展配置，key的结构为：“extension_扩展名_key” */
    saveExtensionConfig(extension: string, key: string, value?: any): void;
    /** 获取扩展配置 */
    getExtensionConfig(extension: string, key: string): any;
    /** 清除mode玩法的配置 */
    clearModeConfig(mode): void;

    /**
     * 添加玩家
     * @param position 
     * @param character 
     * @param character2 
     */
    addPlayer(position: number, character?: string, character2?: string): Player;
    /**
     * 添加同伴
     * @param position 
     * @param character 
     * @param animation 
     */
    addFellow(position: number, character?: string, animation?: string): Player;
    /**
     * 【事件】进入游戏事件（触发：enterGame进入游戏阶段触发）
     * @param player 
     */
    triggerEnter(player): any;
    /**
     * 还原玩家
     * @param player 
     */
    restorePlayer(player: Player): Player;
    /**
     * 移除玩家
     * @param player 
     */
    removePlayer(player: Player): Player;
    /**
     * 替换玩家的武将
     * @param player 
     * @param character 
     * @param character2 
     */
    replacePlayer(player: Player, character?: string, character2?: string): Player;
    /** 重新排列玩家 */
    arrangePlayers(): void;

    /**
     * 过滤玩家的技能（过滤disabledSkills）
     * @param skills 
     * @param player 
     */
    filterSkills(skills: string[], player: Player): string[];
    /**
     * 解析技能所包含的技能组。
     * 即技能的group属性所记录的技能组
     * @param skills 
     */
    expandSkills(skills): string[];

    /** 添加css (未使用)*/
    css(style: SMap<any>): void;

    //一些常用的过滤
    /**
     * 检测当前是否有符合条件的玩家（不包括out，不包括死亡角色）
     * @param func 过滤条件
     */
    hasPlayer(func?: OneParmFun<Player, boolean>): boolean;
    /**
     * 检测当前是否有符合条件的玩家（不包括out，包括死亡角色）
     * @param func 过滤条件
     */
    hasPlayer(func?: OneParmFun<Player, boolean>): boolean;
    /**
     * 计算符合条件的玩家数（不包括死亡角色）
     * @param func 回调函数，根据条件返回计数，若返回值为false则不计数，返回值为true默认+1，返回值为num，则增加num
     */
    countPlayer(func?: OneParmFun<Player, boolean | number>): number;
    /**
     * 计算符合条件的玩家数(包括死亡角色)
     * @param func 回调函数，根据条件返回计数，若返回值为false则不计数，返回值为true默认+1，返回值为num，则增加num
     */
    countPlayer2(func?: OneParmFun<Player, boolean | number>): number;
    /**
     * 获取过滤后的玩家列表(在场上的玩家)
     * @param func 返回true，则通过
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
     * @param func 
     */
    findPlayer(func?: OneParmFun<Player, boolean>): Player;
    /**
     * 查找玩家(包括已经死亡玩家，即所有玩家)
     * @param func 
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

    //【1.9.98】
    /**
     * 获取本回合内发生过的 不属于任何角色的一些事件
     * (类似于player.getHistory())
     * 
     * 注：目前仅支持cardMove参数（cardsDiscard cardsGotoOrdering cardsGotoSpecial等涉及卡牌位置改变的事件）；
     * 注2：【v1.9.102】所有角色经历的lose事件会同时记录到globalHistory中；
     * @param key 要取出指定的事件的使用记录,若不填，则取出当前玩家回合的所有使用记录
     * @param filter 过滤条件,过滤某一事件记录类型中的指定事件
     * @returns 若两个参数都没有，则返回当前玩家回合的记录，若有key，则获取指定类型的记录
     */
    getGlobalHistory(): GlobalHistoryData;
    getGlobalHistory(key?: keyof GlobalHistoryData, filter?: OneParmFun<GameEvent, boolean>): GameEvent[];

    //【v1.9.105.9~】增加评级系统：评级仅影响战棋君主模式下的武将价格，无其他实际影响；
    /** 获取指定名字的武将的评级 */
    getRarity(name: string): string;
}

//核心成员属性：
interface Game {
    /** 正在游戏中的玩家 */
    players: Player[];
    /** 死亡玩家 */
    dead: Player[];
    /** 暂时未见使用 */
    imported: any[];
    /** 保存当前游戏玩家map，key为玩家id */
    playerMap: SMap<Player>;
    /** 回合数 */
    phaseNumber: number;
    /** 轮数（即从开始玩家开始轮流执行过一次回合后，算一轮） */
    roundNumber: number;
    /** 洗牌次数 */
    shuffleNumber: number;

    /** 当前游戏的“主公（boss）”身份的角色，适用模式：身份局 */
    zhu: Player;
    /** 玩家自己 */
    me: Player;

    /** 服务器 */
    ws: WebSocket;

    //【联机】相关属性
    /**
     * 是否在线
     * 
     * 主机，只有在联机房间时才是true,一旦创建房间后就是false，包括游戏中；
     * 客机，只要是联机模式都保持true；
     */
    online: boolean;
    onlineID: string;
    onlineKey: string;
    ip: string;
    roomId: number;

	documentZoom: number;
}

//由玩法模式自己扩展实现的方法接口：
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
    /** 获取录像命，用于录像，需要重写这个，才会保留录像 */
    getVideoName(): [string, string];
    /** 分数结算，用于game.over */
    addRecord(resultbool: boolean): void;
    /** 显示身份 */
    showIdentity(me: Player): void;
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
     * 作用：phaseDraw事件触发，在步骤“step 2”中，优先使用该方法；
     * @param player 
     * @param num 
     */
    modPhaseDraw(player: Player, num: number): void;
    /**
     * 在chooseToUse/chooseToRespond/chooseToDiscard中，自定义交换玩家操作模式
     * 
     * 作用：
     * 1.chooseToUse/chooseToRespond/chooseToDiscard事件触发，在步骤“step 0”中，非自动，在自己操作面板区域中时，可触发；
     * 2.在game.swapPlayerAuto中，优先使用该自定义方法；
     * @param player 
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
     * loseCardAsync事件，用于多人同时失去牌。
     * 
     * 用于处理失去牌后需要二次操作的情况和需要多名角色同时失去牌的情况的事件。
     * 时机为loseAsyncAfter，用getl获取失去牌，根据需要设置自定义content。【苏婆官方注释】
     * 
     * 补充，该方法只是单纯创建一个“loseAsync”事件，其事件的处理方法content，根据需要，需要在创建事件后.setContent，一些预定义，或者自定义的事件处理方法；
     * @param arg 
     */
    loseAsync(arg?: SMap<any>): BaseLoseEventInfo;
    /** 游戏结束，不提示，继续下一局UI */
    no_continue_game: boolean;
}

/**
 * 录像相关content
 */
interface VideoContent {
    init(players): any;
    newcard(content): any;
    changeLand(player, url): any;
    destroyLand(): any;
    playAudio(str): any;
    playSkillAudio(name): any;
    phaseChange(player): any;
    playerfocus(player, time): any;
    playerfocus2(): any;
    identityText(player, str): any;
    identityColor(player, str): any;
    chessSwap(content): any;
    chessgainmod(player, num): any;
    moveTo(player, pos): any;
    addObstacle(pos): any;
    removeObstacle(pos): any;
    moveObstacle(pos): any;
    colorObstacle(pos): any;
    thrownhighlight1(): any;
    thrownhighlight2(): any;
    chessFocus(player): any;
    removeTreasure(pos): any;
    initobs(obs): any;
    stonePosition(content): any;
    bossSwap(player, name): any;
    stoneSwap(info): any;
    chess_tongshuai(player, content): any;
    chess_tongshuai_skill(player, content): any;
    smoothAvatar(player, vice): any;
    setAvatar(player, content): any;
    setAvatarQueue(player, content): any;
    addSubPlayer(player, content): any;
    arenaNumber(content): any;
    reinit(source, content): any;
    reinit2(source, name): any;
    reinit3(source, content): any;
    skill(player, content): any;
    addFellow(content): any;
    windowzoom1(): any;
    windowzoom2(): any;
    windowzoom3(): any;
    windowzoom4(): any;
    windowzoom5(): any;
    updateActCount(player, content): any;
    setIdentity(player, identity): any;
    showCharacter(player, num): any;
    hidePlayer(player): any;
    deleteHandcards(player): any;
    hideCharacter(player, num): any;
    popup(player, info): any;
    log(str): any;
    draw(player, info): any;
    drawCard(player, info): any;
    throw(player, info): any;
    compare(player, info): any;
    compareMultiple(player, info): any;
    give(player, info): any;
    giveCard(player, info): any;
    gain(player, info): any;
    gainCard(player, info): any;
    gain2(player, cards): any;
    deletenode(player, cards, method): any;
    highlightnode(player, card): any;
    uiClear(): any;
    judge1(player, content): any;
    centernode(content): any;
    judge2(videoId): any;
    unmarkname(player, name): any;
    unmark(player, name): any;
    flame(player, type): any;
    line(player, content): any;
    fullscreenpop(player, content): any;
    damagepop(player, content): any;
    damage(player, source): any;
    diex(player): any;
    tafangMe(player): any;
    deleteChessPlayer(player): any;
    addChessPlayer(content): any;
    die(player): any;
    revive(player): any;
    update(player, info): any;
    phaseJudge(player, card): any;
    directgain(player, cards): any;
    directequip(player, cards): any;
    gain12(player, cards12): any;
    equip(player, card): any;
    addJudge(player, content): any;
    markCharacter(player, content): any;
    changeMarkCharacter(player, content): any;
    mark(player, content): any;
    markSkill(player, content): any;
    unmarkSkill(player, name): any;
    storage(player, content): any;
    markId(player, content): any;
    unmarkId(player, content): any;
    lose(player, info): any;
    loseAfter(player): any;
    link(player, bool): any;
    turnOver(player, bool): any;
    showCards(player, info): any;
    cardDialog(content): any;
    changeSeat(player, info): any;
    dialogCapt(content): any;
    swapSeat(content): any;
    removeTafangPlayer(): any;
    swapControl(player, hs): any;
    onSwapControl(): any;
    swapPlayer(player, hs): any;
    over(str): any;
}

interface Animate {
    window(num): any;
    flame(x, y, duration, type): any;
}

type LineConfig = {
    opacity?: any;
    color?: any;
    dashed?: any;
    duration?: any;
}

/** 全局事件的使用记录 */
type GlobalHistoryData = {
    /** （cardsDiscard cardsGotoOrdering cardsGotoSpecial等涉及卡牌位置改变的事件 */
    cardMove: GameEvent[],
    custom: GameEvent[],
}

/** 保存在game的下载方法 */
interface IDownLoadFun {
    download(url, folder, onsuccess, onerror, dev, onprogress);
    readFile(filename, callback, onerror);
	writeFile(data: string | ArrayBuffer, path: string, name: string, callback: Function);
    removeFile(filename, callback);
    getFileList(dir, callback);
    ensureDirectory(list: string, callback: Function, file?: any);
}