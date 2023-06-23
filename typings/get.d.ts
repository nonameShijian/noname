declare var get:Get;
/**
 * 封装获取数据的方法
 */
interface Get {
    /** 获取当前血量（xx/xxx左边部分 或者自身） */
    infoHp(hp: HeroHp):number;
    /** 获取当前最大血量（xx/xxx右边部分 或者自身） */
    infoMaxHp(hp: HeroHp):number;
	/** 获取当前护甲值（xx/xx/xx右边部分） */
	infoHujia(hpinfo: HeroHp):number;

    /** 一些常用的条件判断 */
    is:Is;
    
    /**
     * 获取（牌堆底部的）牌
     * @param num 
     */
    bottomCards(num:number):Card[];
    /** 获取弃牌区的所有牌列表 */
    discarded():Card[];

    /** 卡牌UI的offset偏移量 */
    cardOffset():number;
    /**
     * 解析字符串，若有：#r,#p,#b,#g开头，则返回一个显示颜色的html，span标签片段
     * @param str 
     */
    colorspan(str:string):string;
    /**
     * 设置事件的prompt
     * @param next 要设置prompt/prompt2的事件
     * @param str 可以是"###+prompt+###+prompt2"格式字符串,以”###“分割开
     */
    evtprompt(next:GameEvent,str:string):void;
    /**
     * 自动视为指定牌。
	 * 
	 * 有autoViewAs: 返回重新整合后的视为牌（即强制自动变成该视为牌）
	 * 
	 * 没有: 
	 *     
	 * &nbsp;&nbsp;&nbsp;&nbsp;若对象有isCard为true,或者是一个真实卡牌，则返回带isCard=true，的卡牌结构信息
	 * 
	 * &nbsp;&nbsp;&nbsp;&nbsp;若只是信息对象，无cards参数,否则则返回带cards的card对象的副本
	 * 
	 * &nbsp;&nbsp;&nbsp;&nbsp;都不是，则按原来输出
	 * 
	 * 在【v1.9.114.1】修复获取卡牌点数错误的bug
	 * 
     * @param card 指定视为牌
     * @param cards 待操作的卡牌集合，一般是指真实使用的卡牌,取值为false时，卡牌有autoViewAs，则返回不携带的cards的card;
     */
    autoViewAs(card:CardBaseUIData|Card,cards:Card[]|boolean):CardBaseUIData;
    /**
     * 获取这些数据中“最大”的一个
     * @param list 目标列表
     * @param func 主要是排序用的方法
     * @param type 主要类型：list，item，默认空
     */
    max(list:any[],func:string|OneParmFun<any,number>,type?:string):any;
    /** 获取这些数据中“最小”的一个 */
    min(list:any[],func:string|OneParmFun<any,number>,type?:string):any;
    /**
     * 获取武将信息
     * @param name 武将名
     * @param num 指定获取武将的信息：0："性别",1："势力",2：体力,3：["技能"],4：[额外信息];若不填，则返回武将信息
     */
    character(name:string,num?:number):any|HeroData;
    /** 获取武将介绍 */
    characterIntro(name:string):string;
    /**
     * 获取势力的classname
     * @param group 
     * @param method 是否显示原来的名字，字符串“raw”，则原生返回；若不填，则返回名字+“mm”
     */
    groupnature(group:string,method?:string):string;
    /**
     * 获取数字的符号(以-1负，0，1正表示)
     * 也可以表示，是否是负数-1，0，正数1
     * @param num 
     */
    sgn(num:number):number;
    /**
     * 随机获取一个数字
     * @param num 
     * @param num2 若指定该参数，则是取[num~num2]之间的数字 
     */
    rand(num:number,num2?:number):number;

    /** 指定排序方式排序【当前项目内没有使用，是个冗余方法】 */
    sort(arr:any[],method:string):any[];
    sortSeat(arr:any[],target):any[];

    /** 生成zip压缩包（回调传入一个JSZip对象） */
    zip(callback:OneParmFun<any,void>):any;
    /**
     * 计算当前延迟x秒
     * 根据lib.config.game_speed，会获得当前模式的延迟值
     * @param num 延迟的时间，默认为1
     * @param max 最大值，默认为Infinity
     */
    delayx(num?:number,max?:number):number;
    /**
     * 获取用于会话框提取文本
     * （“是否对......”，“是否发动xxxx?”）
     * @param skill  技能名
     * @param target 目标玩家
     * @param player 源玩家
     */
    prompt(skill:string,target?:Player,player?:Player):string;
    /** 在get.prompt基础上拼接“技能名_info”的信息 */
    prompt2(skill:string,target?:Player,player?:Player):string;
    /** 获取更新地址 */
    url(master):void;
    /**
     * 获取四舍五入后放大10的倍数的数值
     * @param num 目标数
     * @param f 10的倍数
     */
    round(num:number,f:number):number;
    /**
     * 获取游戏配置“player_number”的最大玩家人数（若没有默认是2）
     */
    playerNumber():number;

    benchmark(func1,func2,iteration,arg):any;

    /**
     * 序列化对象（将对象变成字符串）
     * @param obj 指定序列化对象
     * @param level 格式化空格倍数（不需要填，用于内部建立格式化字符串的）
     */
    stringify(obj:Object,level?:number):string;
    /**
     * 深复制对象
     * （对象结构过于复杂，可能会很慢）
     * @param obj 
     */
    copy(obj:any):any;
    /**
     * 获取牌堆(lib.inpile)里所有指定类型的牌
     * @param type 牌的类型（详情请看get.type）
     */
    inpilefull(type:string):CardBaseUIData[];
    /**
     * 获取牌堆(lib.inpile)里所有指定类型的牌
     * @param type 若是字符串，则是类型type,子类型subtype；若是方法，则是自定义过滤条件
     * @param filter 若是字符串“trick”，则采用将“delay”视为“trick”锦囊牌类型过滤；若是方法，则是自定义过滤条件
     * @return 返回牌的名字的数组
     */
    inpile(type:string|OneParmFun<any,boolean>,filter?:string|OneParmFun<any,boolean>):string[];
    /** 默认filter参数为“trick”的get.inpile (即用于get.type，“delay”视为“trick”锦囊牌) */
    inpile2(type:string|OneParmFun<any,boolean>):string[];
    /**
     * 获取卡牌配置信息（lib.card）中指定类型的卡牌
     * 注：排除掉不是当前指定模式玩法的卡牌，有destroy配置，filter不通过的，没有“技能名_info”对应翻译...卡牌配置
     * @param type 指定类型，type,或者subtype
     * @param filter 自定义过滤条件
     * @return 返回卡牌配置列表
     */
    typeCard(type:string,filter?:OneParmFun<any,boolean>):string[];
    /**
     * 获取卡牌配置信息（lib.card）中，可用的卡牌
     * 注：排除掉不是当前指定模式玩法的卡牌，有destroy配置，filter不通过的，没有“技能名_info”对应翻译...卡牌配置;
     * 以外，还排除禁用列表（lib.config.bannedcards）的卡牌
     * @param filter 自定义过滤条件
     */
    libCard(filter:TwoParmFun<any,string,boolean>):ExCardData[];
    /** 获取ipv4 网络ip（只有在nodejs环境下才行） */
    ip():string;
    /** 获取玩法mode的翻译 */
    modetrans(config:any,server?:boolean):string;
    /**
     * 【联机】获取ol（联网模式）下武将列表
     * 注：排除掉禁用列表，lib.filter.characterDisabled，自定义过滤条件func
     * @param func 自定义过滤条件
     */
    charactersOL(func?:OneParmFun<any,boolean>):HeroData[];

    /** 获取ip部分(去掉端口)字符串 */
    trimip(str:string):string;
    /** 获取当前玩法模式 */
    mode():string;
    /** 获取当前（ui.dialogs）指定id的会话面板 */
    idDialog(id:number):Dialog;
    /** 获取当前游戏状况信息（联机模式下） */
    arenaState():AreanStateInfo;
    /** 【联机】获取当前游戏skill状态信息（主要用于联机通信同步下），返回玩家一部分数据 */
    skillState(player?:Player):SkillStateData;
    /** 随机获取一个id */
    id():string;
    /**
     * 获取拥有指定技能skill是“zhu”的玩家
     * 注：不同玩法，“zhu”的定义不一样
     * 
     * 【v1.9.118】修复get.zhu()函数存在的bug，以及因此衍生的国战君主所在势力出现野心家的bug
     * @param player 
     * @param skill 
     * @param unseen 
     */
    zhu(skill?:string,unseen?:boolean):Player;
    zhu(player:Player,skill?:string,unseen?:boolean):Player;
    /**
     * 获取指定玩法模式的指定config配置项
     * @param item config的配置项
     * @param mode 玩法模式，默认是当前的玩法模式：lib.config.mode
     */
    config(item:string,mode?:string):any;

    /** 金币的倍数（系数） */
    coinCoeff(list):number;
    /**
     * 武将排行（多用于ai，用排行确定优先度）
     * @param name 
     * @param num 
     */
    rank(name:string|{name:string},num:boolean|number):number|string;
    /**
     * 技能排行(多用于ai，获取使用技能准确的优先度)
     * @param skill 
     * @param type 排行的类型：in（用于触发阶段判断）,out（用于触发伤血，流血，卖血技等等判断）,item（或者说空，则是不判断in,out）
     * @param grouped 
     */
    skillRank(skill:string,type:string,grouped?:boolean):number;

    /**
     * 获取所有目标的位置
     * @param targets 
     * @return 虽然是字符串数组，实际是座位号数组
     */
    targetsInfo(targets:Player[]):string[];
    /**
     * 通过玩家的id集合，获取对应的玩家目标
     * @param info 
     */
    infoTargets(info:string[]):Player[];
    /**
     * 获取card对象上的基础信息
     * @param card 卡牌对象（UI上的卡牌）
     * @return 返回[....]结构的卡牌信息 
     */
    cardInfo(card:Card):CardBaseData;
    /**
     * 获取cards列表上的对象的基础信息
     * @param cards card列表
     * @return 返回[....]结构的卡牌信息列表 
     */
    cardsInfo(cards: Card[]):CardBaseData[];
    /**
     * 根据info中的基础信息创建card
     * @param info [...]结构的卡牌信息
     * @return 返回创建的卡牌对象
     */
    infoCard(info: CardBaseUIData):Card;
    /**
     * 根据info中的基础信息列表创建cards
     * @param info [...]结构的卡牌信息列表
     * @return 返回创建的卡牌对象列表
     */
    infoCards(info:CardBaseUIData[]):Card[];


    //联网模式下的信息获取，稍后统一研究
    //作用：打包信息广播出去;接收信息，解析接收到的信息;
    //基本不需要自己调用，send,onmessage都已经做好做好自己这种编码，解码的操作了；
    cardInfoOL(card):any;
    infoCardOL(info):any;
    cardsInfoOL(cards):any;
    infoCardsOL(info):any;
    playerInfoOL(player):any;
    infoPlayerOL(info):any;
    playersInfoOL(players):any;
    infoPlayersOL(info):any;
    funcInfoOL(func):any;
    infoFuncOL(info):any;
    /**
     * 【v1.9.116.2】 将get.stringifiedResult的默认层数由5改为8，并由此解决部分联机模式的bug（如陆凯〖卜筮〗无法在联机模式下正常发动的bug）
     * 【v1.9.120.3】 添加nomore参数，当item为'event'时且nomore为false返回空字符串
     */
    stringifiedResult(item: Function | Object | Array, level = 8, nomore?: boolean):any;
    /**
     * 当且仅当item的值为Infinity时才能使用这个重载
     */
    stringifiedResult(item: Number = Infinity, level = 8): '_noname_infinity';
    parsedResult(item: string | Array | Object):any;

    /** 输出垂直显示字符串 */
    verticalStr(str:string, sp?:boolean):string;
    /**
     * 获取数字显示字符串
     * @param num 若值是Infinity
     * @param method 若num是Infinity，“card”，“target”，分布获得的结果是是它们的最大值，否则是“∞”
     */
    numStr(num:number,method?:string):string;
    /** 获取去掉特殊前缀（SP，☆SP，手杀... ...）的原名 */
    rawName(str:string):string;
    rawName2(str: string): string;//无用
     /** 获取去掉特殊前缀（SP，☆SP，手杀... ...）的名字，将其垂直输出 */
    slimName(str:string):string;

    /** 游戏经历时间（当前时间 - 初始UI加载完成后的开始时间 - lib.status.dateDelayed游戏因ui操作延迟的时间） */
    time():number;
    /** 获取当前时间（UTC） */
    utc():number;

    //【UI】直接和h5原生事件相关，计算当前的位置
    evtDistance(e1: Element, e2: Element):number;
    xyDistance(from: [number, number], to: [number, number]): number;

    /**
     * 获取对象归属类型：
     * 
     * 若对象是字符串，长度<=3,其中包含“h,j,e”中一个，则返回类型:position（位置）；
     * 
     * 若对象是字符串，其值属于lib.nature，则返回类型：nature（伤害属性）；
     * 
     * 若对象是集合，其集合所有元素都是“player”类型，则返回类型：players；（player列表）
     * 
     * 若对象是集合，其集合所有元素都是“card”类型，则返回类型：cards；（card列表）
     * 
     * 若对象是集合，其长度为2，即[num1,num2]，其num1<=num2，则返回类型：select（选择范围）；
     * 
     * 若对象是集合，其长度为4都是number，即[num1,num2,num3,num4]，则返回类型：divposition（设置div的位置，采用calc()方法运算）；
     * 
     * 若对象是类型是“div”，则：
     * 
     *      若class列表有“button”，则返回类型：button（按钮）；
     * 
     *      若class列表有“card”，则返回类型：card（卡牌）；
     * 
     *      若class列表有“player”，则返回类型：player（玩家，玩家ui）；
     * 
     *      若class列表有“dialog”，则返回类型：dialog（对话框，包括提示，弹出框...）；
     * @param obj 
     */
    itemtype(obj:any): string | void;
    /**
     * 获取装备的类型（1-5）
     * 逻辑和get.equiptype基本一致（算是冗余的方法）
     * @param card 
     */
    equipNum(card:CardBaseUIData):number;
    /**
     * 获取对象的类型：
     * 当前可分辨类型：array，object，div，table，tr，td
     * @param obj 
     */
    objtype(obj:any):string;

    //游戏内核心获取卡牌信息的方法：尽量优先使用这些方法获取一张牌的信息，因为内部有队友checkMod，能获取适用于游戏内的信息。
    //【v1.9.98.7】新版本中 get.name, info, suit, color, type等函数可以通过添加参数，判断一张牌在一名角色手牌区时的牌面信息
    //例子：
    /*
        例：假设card是一张红桃闪
        get.name(card,player);
        如果是player这种普通人 返回的依然是shan
        但如果player是神关羽 返回的就是sha了
        player不填时默认视为卡牌的拥有者 填false时不做判断
    */
    /**
     * 获取卡牌的类型
     * 返回卡牌的type属性，
     * 基本有：basic（基本牌），trick（锦囊牌），delay（延时锦囊牌），equip（装备牌），chess（战棋模式的战棋）
     * @param obj 可以是卡牌的名字，也可以是带有name属性的对象
     * @param method 若传入“trick”，则type为“delay”（延时锦囊牌），也视为“锦囊牌”，结果返回“trick”
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
    type(obj:string | CardBaseUIData | Card,method?:string,player?:Player|boolean):string;
    /**
     * 获取卡牌的类型2（上面方法的简略版，把延时锦囊“delay”，视为锦囊“trick”返回）
     * @param card 可以是卡牌的名字，也可以是带有name属性的对象
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
	type2(card: string | CardBaseUIData | Card,player?:Player|boolean):string;
    /**
     * 获取卡牌第二类型（子类型）
     * 返回卡牌的subtype属性
     * 例:equip装备的子类型：equip1武器，equip2防具，equip3防御马，equip4进攻马，equip5宝物（常规外的额外装备）
     * @param obj 可以是卡牌的名字，也可以是带有name属性的对象
     */
	subtype(obj: string | CardBaseUIData | Card):string;
    /**
     * 获取装备的类型（1-5）
     * 当前类型分别为：1武器，2防具，3防御马，4进攻马，5宝物（常规外的额外装备）
     * @param card 可以是卡牌的名字，也可以是带有name属性的对象
     */
	equiptype(card: string | CardBaseUIData | Card):number;
    /**
     * 获取卡牌的花色suit
     * 
     * 花色：spade黑桃，heart红桃，club梅花，diamond方块，none
	 * 
     * 若该卡牌是玩家拥有的，则检查mod锁定技存在（game.checkMod），获取返回的花色；否则，获取该卡牌花色suit；
	 * 
     * 特殊情况：
	 * 
     * 若card的类型是“cards”，若所有卡牌花色都相同，则返回第一张的卡牌花色suit，若有一张不同，则返回“none”；
	 * 
     * 若card有cards属性，该card.cards的类型为“cards”，且该card不是“muniu”，则按上面“cards”方式返回花色；
     * @param card 卡牌
     * @param player 一张牌在一名角色手牌区时的牌面信息:
	 * 
	 * player不填时默认视为卡牌的拥有者;
	 * 
	 * 填false时不做判断
     */
	suit(card: CardBaseUIData | Card | Card[],player?:Player|boolean):string;
    /**
     * 获取卡牌颜色color
     * 卡牌颜色：black黑色，red红色，none
     * 其逻辑与get.suit一致，实质也是调用get.suit
     * @param card 
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
	color(card: CardBaseUIData | Card | Card[],player?:Player|boolean):string;
    /**
     * 获取卡牌的点数number (多卡牌转换获取结果为null)
     * 
     * 在【v1.9.113.5】中已实现读取卡牌拥有者身上的mod
     *
     * 在【v1.9.115】 调整get.number函数的结算逻辑
	 * 
	 * 代码示例：(所有卡牌视为K)
	 * ```
	 * mod: {
	 *     cardnumber: function(card, player, number) {
	 *         return 13;
	 *     },
	 * }
	 * ```
	 * 
     * @param card 卡牌
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
	number(card: CardBaseUIData | Card | { cards: CardBaseUIData[], [key: string]: any }, player?: Player | boolean): number | null;
    /**
     * 获取卡牌的名字
     * @param card 
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
	name(card: CardBaseUIData | Card,player?:Player|boolean): string;
    //  * @param mod 若不为false，则使用“cardname”mod检测；若为false（取值必须为false），则直接返回名字
    // name(card: Card, mod?: boolean): string;//【该用player】
    /**
     * 获取卡牌的nature（伤害属性）
     * nature：fire火，thunder雷，poison毒
     * @param card 
     * @param player 一张牌在一名角色手牌区时的牌面信息:player不填时默认视为卡牌的拥有者;填false时不做判断
     */
	nature(card: CardBaseUIData | Card,player?:Player|boolean):string;
    // * @param mod 若不为false，则使用“cardnature”mod检测；若为false（取值必须为false），则直接返回伤害属性
    // nature(card:Card,mod?:boolean):string;
    /**
     * 获取（牌堆顶的）牌
     * @param num 获取指定数量的牌，填了就返回数组
     */
    cards(num: number = 1): Card[];
    /**
     * 获取卡牌的judge（判定牌的判断条件）
     * 若该卡牌有viewAs（视为牌），则返回视为牌的judge；
     * 否则，直接返回该牌的judge
     * @param card 
     */
    judge(card:Card):OneParmFun<Card,number>;
    /**
     * 获得玩家from到to之间的距离
	 * 
	 * 【v1.9.112.1】 修改效果，计算与其他角色的距离时至少为1
	 * 
     * 具体距离类型，到时详细研究代码分析：
	 * 
     * raw，原始距离；
	 * 
     * pure，直线距离；
	 * 
     * absolute，绝对距离；
	 * 
     * attack，攻击距离；
	 * 
     * 除以上情况，其他值（默认）为防御距离
	 * 
     * @param from 源玩家
     * @param to 目标玩家
     * @param method 获取距离的类型：raw，pure，absolute，attack，默认防御距离
     */
    distance(from:Player,to:Player,method?:string):number;
    /**
     * 获取item的信息
     * @param item 若传入的参数是字符串，则返回lib.skill[item]；若传入的参数是一个对象（拥有name属性），则返回lib.card[item.name]；
     */
    info(item:string, player: Player | false):ExSkillData;
    info(item: { name: string }, player: Player | false):ExCardData;
    /**
     * 获取当前可选择的目标数，范围
     * （具具体而定，不同配置指定的两个数字意义不一致，后面具体分析）。
     * 若没有默认返回[1,1]
     * @param select 
     * @return [number,number] 具具体而定(数组第一个目标数（可选目标数），数组第二个值为进攻范围)/(指定范围区），若为-1，则无距离限制/能选的必须选，即南蛮之类
     */
    select(select:number|Select|NoneParmFum<number|Select>):Select;
    /**
     * 获得当前事件中处理的卡牌
     * 根据
     * _status.event.skill存在， 当前事件中的技能若有viewAs，则返回选中牌；
     * _status.event._get_card存在，则返回_status.event._get_card；
     * ui.selected.cards[0] ，若original为true，则直接返回该第一张牌；若不是则返回处理过card；
     * @param original 
     */
    card(original?:boolean):Card;
    /**
     * 获取当前event的玩家player
     * 返回_status.event.player 
     */
    player():Player;
    /**
     * 获取当前游戏内所有玩家
     * 
     * 根据以下参数条件剔除添加玩家
     * @param sort 若为false，则不排序；若为function，则用该function排序，若不是则默认lib.sort.seat排序
     * @param dead 是否获取死亡的角色（默认只获取正在游戏中角色），true则加入死亡角色
     * @param out 是否剔除已经退出游戏的角色（isOut），true则保留，false则剔除
     */
    players(sort?:Function|boolean,dead?:boolean,out?:boolean):Player[];
    /**
     * 获取卡牌所在的位置：
     * 位置：e装备区，j判定区，h手牌，c抽牌区，d弃牌区，s特殊区（special）,o处理区
     * 
     * 【1.9.98】为方便兼容旧扩展 使用get.position(card)方法读取处理区的卡牌，
     *  默认得到的仍然是弃牌堆（'d'）；
     * 使用get.position(card,true) 才会得到处理区（'o'）的结果
     * @param card 若是卡牌，则返回卡牌的位置；若是玩家，则返回玩家的位置
     * @param ordering 是否检测o处理区
     */
    position(card:Card ,ordering?:boolean):string;
    position(card: Player):number;

    /**
     * 获取技能的翻译名
     * @param str 技能名，若名字有“re”属于（界）；名字有“xin”属于（新）
     * @param player 指定玩家
     */
    skillTranslation(str:string,player:Player):string;
    /**
     * 获取技能的描述
     * （“技能名_info”）
     * @param name 技能名
     */
    skillInfoTranslation(name: string): string;
    /**
     * 获取翻译（本地化）
     * 
     * 若是对象，且有name/_tempTranslate属性，则：
     *  1.若有“_tempTranslate”，即临时翻译名，直接返回这个名字；
     *  2.若arg为“viewAs”，则获取该视为牌的翻译，否则获取原牌的翻译(obj.name，一般指卡牌名，玩家名)；
     * 若该对象是“card”卡牌，输出：【花色+数字】+（卡牌名字）;
     * 若是数组，则返回集合中每个元素get.translation后用“、”拼接；
     * 若arg为“skill”，则
     *  1.有“xxxx_ab”的ib.translate翻译，则输出lib.translate[str+'_ab']；
     *  2.否则返回lib.translate[str]中的前两个字，这部分，应该是为了快捷输出技能的类型：觉醒技，限定技......；
     * 若arg为“info”，则返回lib.translate[str+'_info'],若不存在，可以搜索以下几种方式：
     *  1.去掉末尾最后一个字符；
     *  2.获取“_”前面部分；
     *  3.去掉末尾2个字符部分，直接获取翻译，或者若是技能名，获取技能的prompt；
     * 其他，若有翻译，则直接获取lib.translate[str]；
     * 字符串，直接输出；
     * 其余非undefined，可以的话就用toString输出；
     * 都没有则输出自身；
     * 
     * 注：由于显示文本是以innerHTML设置，可以设置复杂的h5显示文本的翻译；
     * @param str  
     * @param arg 类型：viewAs，skill，info
     */
    translation(str: any, arg?:string): string;
    /**
     * 将阿拉伯数字转成中文数字显示
     * @param num 原数字
     * @param two 是否显示“二”，还是显示“两”
     */
    cnNumber(num:number,two?:boolean):string;

    /**
     * 获取当前对话面板已选中的按钮
     * 
     * 当前事件的对面面板对象的按钮组：_status.event.dialog.buttons;
     * @param sort 排序的方法
     */
    selectableButtons(sort:Function):Button[];
    /**
     * 获取当前对话面板已选中的卡牌
     * 
     * 当前事件的玩家已选中的卡牌：_status.event.player.getCards('hej');
     * @param sort 排序的方法
     */
    selectableCards(sort: Function):Card[];
    /**
     * 获取ui上的技能列表
     * （ui.skills，ui.skills2，ui.skills3） 具体还不明了，后面研究
     */
    skills():any;
    /**
     * 返回能获取的（武将）技能的技能列表
     * @param func 
     * @param player 需要获取技能的玩家
     */
    gainableSkills(func?:ThreeParmFun<any,string,string,boolean>,player?:Player):string[];
    /**
     * 根据（武将）名字返回能获取的（武将）技能的技能列表
     * @param name 
     * @param func 过滤方法
     */
    gainableSkillsName(name:string, func?:ThreeParmFun<any,string,string,boolean>):string[];
    /**
     * 返回能获取的武将列表
     * @param func 过滤方法
     */
    gainableCharacters(func?:TwoParmFun<any,string,boolean>):string[];
    /**
     * 获取当前已选中的（目标）玩家
     * @param sort 排序的方法
     */
    selectableTargets(sort: Function):Player[];
    /**
     * 返回一个过滤用高阶方法。
     * 传入一个过滤列表，生成一个以该过滤列表为基准的过滤函数，该函数传入一个值，判断该值是否处于该列表内，属于则返回false，没有则返回true；
     * @param filter 传入一个过滤列表
     * @param i 指定过滤方法的过滤目标是第i个参数
     */
    filter(filter:Function|object|string,i?:number):Function;
    /**
     * 获取玩家当前回合的卡牌的使用次数
     * @param card 若是true，则获取player的当前回合卡牌使用次数；若是对象，字符串，则获取指定牌的当前回合使用次数
     * @param player 要获取的玩家，默认是当前处理中的玩家_status.event.player
     */
    cardCount(card:boolean|string|{name:string},player?:Player):number;
    /**
     * 获取玩家当前回合技能的使用次数
     * @param skill 技能名
     * @param player 要获取的玩家，默认是当前处理中的玩家_status.event.player
     */
    skillCount(skill:string,player?:Player):number;
    /**
     * 获取该card的所有者（拥有者）
     * 
     * 这里拥有的牌定义:玩家的手牌，玩家的装备，玩家的判定区，玩家的判定牌(player.juding)，玩家当前使用中的牌(player.using)
     * @param card 指定card
     * @param method 目前没什么太大用途，值为“judge”排除掉判定的牌
     */
    owner(card:Card,method?:string):Player;
    /**
     * 是否当前没有可选择的目标
     */
    noSelected():boolean;
    /**
     * 获取当前正在游戏中（还活着）的（身份）人数
     * @param identity 指定身份，不填默认获取当前所有玩家数（正在游戏+已死亡）
     */
    population(identity?:number | string):number;
    /**
     * 获取当前游戏中（活着+死亡）的（身份）人数
     * @param identity 指定身份，不填默认获取当前所有玩家数（正在游戏+已死亡）
     */
    totalPopulation(identity?:number):number;
    /**
     * 获取ai.tag对应的key有没有存在
     * @param item 技能名/卡牌名
     * @param tag 配置中，ai.tag的key
     * @param item2 若返回结果是方法，则把该参数作为该方法的入参:result(item,item2)
     */
    tag(item: string | { name: string }, tag: string, item2?: string, bool?: Player | false):number;
    /**
     * 获取排序卡牌的方法
     * @param sort 指定排序方法：type_sort，suit_sort，number_sort
     */
    sortCard(sort:string):Function;
    /**
     * 获取难度级别：easy1，normal2，hard3
     */
    difficulty():number;
    /**
     * 获取某区域的指定卡牌（一张）
     * @param name 获取卡牌的名字，获取判定卡牌的方法
     * @param create 指定获取卡牌的地方：'cardPile'抽卡区,'discardPile'弃卡区,'field'玩家场地（玩家的装备，判定牌区），若都不是，则创建一张该名字的卡牌
     */
    cardPile(name: string | OneParmFun<Card, boolean>, create:string):Card;
    /**
     * 获取抽卡区里指定名字的卡牌（一张）
     * @param name 获取卡牌的名字，获取判定卡牌的方法
     */
    cardPile2(name: string | OneParmFun<Card,boolean>): Card;
    /**
     * 获取弃卡去里指定名字的卡牌（一张）
     * @param name 获取卡牌的名字，获取判定卡牌的方法
     */
    discardPile(name: string | OneParmFun<Card, boolean>): Card;

    //获取各种描述信息，用于ui显示上
    /** 获取指定武将的技能信息描述 */
    skillintro(name: string, learn?: boolean, learn2?: boolean):string;
    /** 获取指定武将的信息描述 */
    intro(name:string):string;
    /** 获取缓存的信息 */
    storageintro(type, content, player, dialog, skill): any;
    /** 获取设置node节点的信息 */
    nodeintro(node,simple,evt):Dialog;
    /** 获取横置（连环）的信息 */
    linkintro(dialog,content,player):void;

    /** 获取游戏中的势力标记列表 */
    groups():string[];
    /** 获取lib.card中所有（不重复，延迟锦囊算作锦囊trick）类型type */
    types():string[];
    /** 获取按钮的link */
    links(buttons:Button[]):any[];
    
    /** 获取当前传入的武将名的原替换配置的武将名（lib.characterReplace）【v1.9.106.3】 */
    sourceCharacter(str:string):string;

    //卡牌标记cardtag（与模式——应变模式相关）【v1.9.107】
    cardtag(item:Card,tag:string):boolean;

    /** 
     * 返回数字的扑克牌用的字符串形式；
     * 
     * 若num为1/11/12/13 则返回A/J/Q/K;
     * 否则返回num.toString()
     * 【v1.9.108.6~】
     */
    strNumber(num:number):string;

    //ai相关的操作（使用里面的【常用】就行，其他一般都是在内部算的）
    /** 获取ai的态度 */
    aiStrategy():number;
    /**
     * 【常用】嘲讽值检测
     * @param target 目标
     * @param player 默认当前事件中的玩家
     * @param hp 是否检测血量（与手牌数）
     */
    threaten(target:Target,player?:Player,hp?:boolean):number;
    /**
     * 玩家状态健康程度检测
     * 
     * 健康程度：血量，手牌数，装备数
     * @param player 
     */
    condition(player:Player):number;
    /**
     * 【常用】态度值检测
     * 
     * 检测玩家1对玩家2的态度值
     * 态度值，主要和玩家的身份相关，正数态度好，反之态度差；
     * 注：需要mode实现get.rawAttitude
     * @param from 
     * @param to 
     */
    attitude(from?:Player,to?:Player):number;
    /** attitude,from默认为当前事件的player，作为player.chooseTarget，player.chooseCardTarget默认检测ai */
    attitude2(to:Player):number;
    /** 返回该[态度值检测]，最终结果是否是：负数-1，0，正数1 */
    sgnAttitude(from?:Player,to?:Player):number;
    /**
     * 【常用】回合外留牌的价值
     * 
     * 即弃牌阶段按useful顺序选
     * @param card 
     */
    useful(card:Card):number;
    /**
     * 回合外弃牌的价值
     * 
     * 与useful相反
     * 
     * 作为player.chooseToDiscard，的默认检测ai
     * @param card 
     */
    unuseful(card:Card):number;
    /** unuseful2，作为player.chooseCard，的默认检测ai */
    unuseful2(card:Card):number;
    /** unuseful3,若是“du”,则返回20，作为player.chooseToRespond，的默认检测ai */
    unuseful3(card:Card):number;
    /**
     * 【常用】牌的使用价值
     * 
     * 注：五谷按value顺序选；
     * 
     * 例：
	 * ```
	 * return 8 - get.value(card); 
	 * ```
     * 选取价值小于8的牌。数字越大，会选用的牌范围越广，8以上甚至会选用桃发动技能，一般为6-ai.get.value(card); 
	 * 
	 * 在【v1.9.113.4】修复判断空数组价值时返回Infinity的bug
	 * 
     * @param card 
     * @param player 
     * @param method 取值“raw”，目前在代码里看，貌似没用，可能是写错了；
     */
    value(card:CCards,player?:Player,method?:string):number;
    /**
     * 获取目标在当前事件中装备卡牌的“收益”值
     * @param player 暂时无用
     * @param target 目标
     * @param name 指定卡牌名
     */
    equipResult(player:Player,target:Target,name?:string):number;
    /**
     * 【常用】获取【装备】卡牌的价值
     * 
     * 即info.ai.equipValue
     * @param card 
     * @param player 优先默认，当前card的拥有者，若没有则指定为当前事件的player
     */
    equipValue(card:Card,player?:Player):number;
    /** equipValue2，注：equipValue则无视，算是个多余的方法 */
    equipValueNumber(card:Card):number;
    /**
     * 牌的无使用价值
     * 
     * 与value相反
     * @param card 
     * @param player 
     */
    disvalue(card:CCards,player:Player):number;
    /** disvalue2，默认设置了“raw”参数 */
    disvalue2(card:CCards,player:Player):number;
    /**
     * 获取技能的嘲讽值
     * 
     * ai.threaten
     * @param skill 
     * @param player 
     * @param target 
     */
    skillthreaten(skill:string,player:Player,target?:Target):number;
    /**
     * 【常用】获取技能/卡牌的优先级order
     * 
     * 获取ai.order,或者ai.basic.order
     * @param item 
     */
    order(item:SkillOrCard):number;
    /** 获取技能/卡牌的收益值result（game.effect内部使用） */
    result(item:SkillOrCard,skill?:string):Object;
    /**
     * 【常用】效果值检测
     * 
     * 检测牌/技能对目标角色的效果值
     * (比较重要的方法，由于代码过多，骚后研究)
     * 
     * 简洁化流程：
     * get.result：获取卡牌本身收益；
     * 玩家技能的效果：【player】ai.effect.player，即玩家的牌对目标的影响；
     * 若有目标，目标技能的效果：【target】ai.effect.target，即目标受到玩家卡牌的影响；
     *      获取嘲讽度threaten；
     * get.attitude：获取玩家与目标之间的态度；
     * 当前目标处于"连锁"状态，对该状态所有目标进行效果检测；
     * 获取最终结果；
     * 
     * 用于获取直接收益，例：比如说加目标 桃子全场多开就完事了；
     * @param target 目标
     * @param card 技能/卡牌
     * @param player 默认指当前事件中的玩家
     * @param player2 视角，一般填target/player，例如我方杀敌方满血『曹丕』,对我方来说是负效果,但对敌方是正效果,视角决定效果的正负。
     * @param isLink 是否要对"连锁"这种情况处理，默认处理，取值true，不处理；
     */
    effect(target:Target,card:string|NameType,player:Player,player2?:Viewer,isLink?:boolean):number;
    /**
     * 【常用】效果值检测2(v1.9.105)
     * 
     * 用于获取直接收益，例：需要考虑【桃】的存留等问题；
     * 注：目前，作为一些方法得默认ai，例如：chooseToUse，ai2；chooseUseTarget中，chooseTarget，ai；(既然不清楚，就列为不常用)
     * @param target 目标
     * @param card 技能/卡牌
     * @param player 默认指当前事件中的玩家
     * @param player2 视角，一般填target/player，例如我方杀敌方满血『曹丕』,对我方来说是负效果,但对敌方是正效果,视角决定效果的正负。
     * @param isLink 是否要对"连锁"这种情况处理，默认处理，取值true，不处理；
     */
    effect_use(target:Target,card:string|NameType,player:Player,player2?:Viewer,isLink?:boolean):number;
    /**
     * 【常用】检测伤害效果
     * 
     * 检测的是[target玩家对player玩家]的伤害效果
     * @param target 
     * @param player 
     * @param viewer 视角
     * @param nature 伤害属性
     */
    damageEffect(target:Target,player:Player,viewer?:Viewer,nature?:string):number;
    /**
     * 【常用】检测回复效果
     * 
     * 检测的是[target玩家对player玩家]的回复效果
     * 
     * 注：一般带viewer参数时：
     * viewei默认为玩家player,公式为:
     * 总效果=对使用者的收益值*使用者对自己的att+对目标的收益值*使用者对目标的att; 
     * 假如viewer不为player,公式为:
     * 总效果=对使用者的收益值*使用者对自己的att+对目标的收益值*viewer对目标的att;
     * @param target 
     * @param player 
     * @param viewer 视角
     */
    recoverEffect(target:Target,player:Player,viewer?:Viewer):number;
    /**
     * 【常用】检测卡牌选项（其实就是卡牌）的价值
     * 
     * 操作选项：手牌，装备区，判定区......卡牌选项
     * @param button 
     */
    buttonValue(button: Button): number;
    /**
     * 【v1.9.120.3】 添加nomore参数
     */
    eventInfoOL(item: object, level: any, nomore?: boolean): string;
    /**
     * 【v1.9.122】获取技能标签(中文)
     * @param skill 技能id
     * @param player 对应的玩家
     */
    skillCategoriesOf(skill: ExSkillData, player: Player): string[];
}

//由玩法模式自己扩展实现的方法接口：
interface Get {
    /**
     * 【AI】玩法模式下的态度值检测
     * 
     * 作用：get.attitude内；
     * 注：当前该方法没做健壮性处理，为必须实现；
     * @param from 
     * @param to 
     */
    rawAttitude(from?:Player,to?:Player):number;
}

/**
 * 一些条件判断
 */
interface Is {
    /**
     * 判断是非转化牌，包括“视为使用”的虚拟牌
     * 
     * 返回true则是；
     */
    converted(event: Event): boolean;
    /** 是否是safari浏览器 */
    safari(): boolean;
    /** 判断这些牌中，有没有不在h，e，j区域中，若都不在，则为true */
    freePosition(cards:Card[]): boolean;
    /** 判断是否有菜单 */
    nomenu(name:string, item): boolean;
    altered(skill): boolean;//无用，无能，这里，就此消失！

    /** 判断当前对象是html文档节点 */
    node(obj:Object): boolean;
    /** 判断当前对象是div节点 */
    div(obj: Object): boolean;
    /** 判断当前对象是Map（es6） */
    map(obj: Object): boolean;
    /** 判断当前对象是Set（es6） */
    set(obj: Object): boolean;
    /** 判断当前对象是对象 */
    object(obj: Object): boolean;

    /** 是否是只有一个目标（单目标） */
    singleSelect(func: number | Select | NoneParmFum<number | Select>): boolean;
    /** 是否是“君主” */
    jun(name?:string|Player): boolean;
    /** 是否是对决模式 */
    versus(): boolean;
    /** 判断自己当前是否是mobile（手机） */
    mobileMe(player): boolean;
    /** 判断game.layout不是“default” */
    newLayout(): boolean;
    /** 判断当前是手机布局 */
    phoneLayout(): boolean;
    singleHandcard(): boolean;
    /** 是否使用“linked2”样式的连环 */
    linked2(player:Player): boolean;
    /** 是否是空对象 */
    empty(obj:any): boolean;
    /** 判断该当前字符串是否只是有“h,e,j”构成 */
    pos(str:string): boolean;
    /** 判断该技能是否是强制触发的（强制触发：locked，trigger&&forced，mod） */
    locked(skill:string): boolean;

    /** 用于判断是否开启了【幸运星模式】的选项 */
    isLuckyStar():boolean;

    //新增的国战专用函数：(直接查阅苏大佬的文档，到时候给各个不同model的玩法，另外分开新的描述文档......)
    guozhanRank();
    guozhanReverse(xxx,yyy);

    /** 是否有表情【v1.9.106.4】 */
    emoji(substring:string):boolean;

    //卡牌标记cardtag（与模式——应变模式相关）【v1.9.107】
    /** 用于判断一张牌能否被应变 */
    yingbian(node:HTMLDivElement|Card):boolean;

    /** 
     * 【国战】是否是双势力/获取双势力武将
     * @param name 只有一个参数：判定是否是双势力武将；
     * @param array 第二个参数为true：则获取该名字武将的势力；
     */
    double(name:string):boolean;
    double(name:string,array:boolean):string[];
}

/** get.skillState方法的返回数据 */
interface SkillStateData {
    /** 全局技能 */
    global:ExSkillData[];

    /** 获取lib.playerOL所有玩家技能相关信息保存 */
    [key:string]:{
        skills:ExSkillData[];
        invisibleSkills: ExSkillData[];
        hiddenSkills:ExSkillData[];
        additionalSkills:ExSkillData[];
        disabledSkills:ExSkillData[];
        tempSkills:ExSkillData[];
        storage:SMap<any>;
    }|any;

    /** 所有带chooseButton，且enable为true的技能（主动发动） */
    skillinfo:{
        [key:string]:ChooseButtonConfigData;
    };

    /** 若传入玩家参数，则获取该玩家的player.getStat */
    stat:PlayerStateInfo;
}