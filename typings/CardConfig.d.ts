/**
 * 卡包配置信息（import:card）
 */
interface CardHolderConfigData extends ExCommonConfig {
    /** 该卡包是否可以联机 */
    connect?: boolean;
    /** 卡牌 */
    card: SMap<ExCardData>;
    /** 卡牌技能 */
    skill?: SMap<ExSkillData>;
    /** 牌堆添加 */
    list: CardBaseData[];
    /** 扩展中设置卡牌的名称(id)翻译 */
    translate?: SMap<string>
}

/**
 * 卡牌信息配置
 */
interface ExCardData {

    //UI方面的:
    /** 
     * 指定独立设置该卡牌的背景（卡面）
     * 可指定设置成其他卡牌的卡面（这样游戏会优先使用指定卡片名的image，默认使用当前卡片名的image）
     */
    cardimage?: string;
    /** 
     * 卡牌的卡面
     * 
     * 注：需要fullskin为true
     * 
     * 带“ext:”前缀的，其文件夹路径：extension/卡牌的image。没有则路径是：卡牌的image
     * 
     * 若值为“background”：则调用setBackground，设置对应类型的卡面；
     * 
     * 若值为“card”：..........
     * 
     * 注：判断比较复杂，有优先级顺序，之后在独立详细讨论
     */
    image?: string;
    /** 核心属性，似乎大多都有，为true，具体时什么待后再研究 （目前来看，fullskin添加得图片后缀是png） */
    fullskin?: boolean;
    /** 添加class：fullimage （目前来看，fullimage添加得图片后缀是jpg）----》应该指铺满的图片 */
    fullimage?: string;
    /**
     * 设置边框
     * 其值：gold，silver
     */
    fullborder?: string;
    /*
     * 指定mode玩法时显示的图片
     * 注：没有指定到image
     * 若有，路径：'image/mode/'+该卡牌modeimage+'/card/'+卡牌名+'.png'；
     * 否则，路径：'image/card/'+卡牌名'.png'
     */
    modeimage?: string;
    /** 是否不显示名字，true为不显示 */
    noname?: boolean;
    /** 设置卡牌背景颜色 */
    color?: string;
    /** 设置阴影，例：'black 0 0 2px' */
    textShadow?: string;
    /** 设置信息，名字的透明度 */
    opacity?: number;
    /**
     * 自定义info（显示花色，数字部分），没有则默认“花色 数字”
     * 注：设置的是html片段
     */
    modinfo?: string;
    /** 
     * 增加额外显示的info
     * 注：设置的是html片段，若没有则删除该区域（去区域是卡片的右下角，原用于显示范围，若有会和这部分抢位置）
     */
    addinfo?: string;
    //有这些属性，便添加对应标签（估计是给炉石用的）
    /** 史诗 */
    epic?: boolean;
    /** 创奇 */
    legend?: boolean;
    /** 黄金 */
    gold?: boolean;
    /** 唯一（可以表示品质，也可以作为“专属”，“特殊”装备的标记） */
    unique?: boolean;

    //一般是再创建卡牌时使用，指定该卡牌应该拥有什么属性
    /** 指定卡牌颜色：'heart','diamond','club','spade'，'black'，'red'  */
    cardcolor?: string;
    /** 
     * 指定卡牌的伤害属性
     * 【目前个人框架扩展也使用到这个属性，联盟杀的情况下，还会额外参与游戏逻辑】 
     */
    cardnature?: string;
    /** 【个人框架扩展】指定卡牌构建的优先顺序，默认0最低 */
    cardOrder?: number;
    /** 【个人框架扩展】指定卡牌花色 */
    cardcolor2?: string[];
    /** 【个人框架扩展】指定卡牌的数字 */
    cardnum?: number[];
    /** 【个人框架扩展】自动生成，无需配置，该name即为该card配置的key */
    _name?: string;

    //功能上（也影响UI）
    /** 类型 */
    type?: string;
    /** 子类型 */
    subtype?: string;

    /**
     * 全局技能
     * 该卡牌的技能属于全局技能
     * 若有，则执行game.addGlobalSkill，添加进去
     */
    global?: string | string[];
    /**
     * 卡牌初始化方法
     * 注：先执行完lib.element.card.inits列表的方法，再执行该方法
     */
    init?(): void;

    /**
     * 是否能使用
     * 
     * （优先级上，应该是enable高于usable，待日后具体观察代码）
     * 主要在player.canUse中使用；
     * 在lib.filiter.cardEnabled中实现，先“cardEnabled”mod检测，再到该属性；
     * 
     * 注：当前type为“equip”或者“delay”，不设置该属性则默认true。
     */
    enable?: boolean | ThreeParmFun<Card, Player, GameEvent, boolean>;
    /**
     * 可使用次数（每回合）
     * 
     * 主要再player.getCardUsable,player.cardUsable中使用，主要是获取次数后，再通过“cardUsable”mod检测
     */
    usable?: number | TwoParmFun<Card, Player, number>;
    /** 
     * 是对自己使用?（可能不是这个意思，而是是否来自自己？玩家自己是否能使用？）
     * 
     * 主要再player.filterCard中使用（暂时屏蔽，无用）；
     * 该值不存在时，默认为true（貌似设不设置true，设置false，则不会自动设置为true）
     */
    toself?: boolean;
    /**
     * 是否指定目标
     * 
     * 在lib.filter.targetEnabled/targetEnabled3使用，“playerEnabled”mod检测优先于该检测;
     * 而targetEnabled主要在lib.filter.filterCard,player.canUse中使用；
     * lib.filter.filterCard是player.chooseToUse的默认过滤条件;
     * player.chooseToUse在主代码中主要在player.phaseUse出牌阶段中使用，用于选择一张牌/技能触发,
     * 其中触发game.check()检测可以高亮的对象；
     * 
     * 注1：该过滤作为技能发动的先决条件，触发该检测时，一般为询问技能发动，但技能仍在确认是否发动
     * 注2：若当前type为“equip”，该属性不存在，则设置一个目标为自己的过滤方法；
     *      若当前type为“delay”，该属性不存在，则默认设置为lib.filter.judge。
     */
    filterTarget?: boolean | ThreeParmFun<Card, Player, Target, boolean>;
    /**
     * 这个应该是指先指定A再指定B的动作（和铁索不同）
     * 
     * 目前只有【借刀杀人】，【隔岸观火】，【声东击西】有这个属性
     * 
     * 于【v1.9.113.4】修改实现，董允的舍宴可以为有这个属性的卡牌添加目标
     */
    singleCard?: boolean;

    /**
     * 需要选择多少个目标才能发动
     * 选择的目标数：
     * 为-1时，选择全部人（或者不进行主动选择目标）
     * 为数组时，这个数组就是选择目标数的区间
     * 
     * 在chooseUseTarget ，选择使用目标事件中
     * 在player.selectTarget,要经过“selectTarget”mod检测
     * 
     * 注：当前filterTarget，该属性不存在，则默认设置1；
     *     若当前type为“equip”，且filterTarget与该属性都不存在，则设置为-1。
     */
    selectTarget?: number | [number, number] | TwoParmFun<Card, Player, boolean>;
    /**
     * 是否需要指定目标
     * true为不需要（即无需选择目标，对所有玩家？ 又或者是，该卡牌不是对玩家使用的）
     */
    notarget?: boolean;
    /**
     * 是否可以多目标
     * （值为：1，true）
     */
    multitarget?: number | boolean;
    /** 是否可以连环多个目标 */
    multiline?: boolean;

    //疑惑中，使用率超高，但是具体意思不明确：1.是否是强制不死亡？2.是否是死亡时可以强制使用的技能，卡牌
    //不为true时（默认不标记该标记时），标记event.forceDie为true；
    noForceDie?: boolean;
    //为true时
    forceDie?: boolean;

    // targetDelay?:boolean;//没有用上
    // nodelay?: boolean;  //基本没用上
    /** 
     * 过滤是否有不能确定的目标
     * 在useCard  step9  即将准备构造该卡牌的事件前使用。
     */
    ignoreTarget?(card: Card, player: Player, target: Target): boolean;

    /**
     * 多目标检测？(用的较少)
     * 在player.canUse中执行，该方法结果为false，则canUse返回false
     * @param card 
     * @param player 
     */
    multicheck?(card: Card, player: Player): boolean;

    /**
     * 是否能成为该牌的目标？
     * 
     * （目前不是很确定,正常情况下默认为true，或者设置一个过滤方法）
     * 在targetEnabled2，targetEnabled3中使用
     * 
     * 注：type为“equip”，正常情况下，该值未设置，会默认为true。
     */
    modTarget?: boolean | ThreeParmFun<Card, Player, Target, boolean>;

    /**
     * 该卡牌是否为“复杂”目标
     * （例如：铁索，借刀这类不是单纯自己指定玩家发动，而是选择多个目标之间发动？目前为止时这样理解，日后详细解答）
     * 在game.check钟使用，若为true，则先跳过当前event.filterTarget判断
     */
    complexTarget?: boolean;
    /**
     * 允许多目标？
     * 
     * 注：若type为“equip”或“delay”，若没有，则默认false。
     */
    allowMultiple?: boolean;

    /**
     * 过滤是否能发出创建“装备上该卡牌”事件：“'equip_'+card.name”（暂时没用上）
     * 在equip  step5  过滤是否创建事件
     * @param card 
     * @param player 
     */
    filterEquip?(card: Card, player: Player): boolean;
    /**
     * 装备上该卡牌的content（可以触发同一名字事件多次，但是目前没有这样使用）
     */
    onEquip?: ContentFunc | ContentFunc[];
    /** 动画相关，延时用的，其值指定时false，非false无效（作用不大，后续观察） */
    equipDelay?: boolean;
    /** 
     * 在removeEquipTrigger中使用，
     * 其值为true时，在移除后，若该属性为true且onLose存在，则创建“lose_卡牌名”事件，设置onLose为content
     */
    clearLose?: boolean;

    /** 
     * 自动视为该指定牌
     * 
     * 主要在get.autoViewAs中使用,【这个才是卡牌专用得？该卡牌不会视为转换牌】
     */
    autoViewAs?: string;

    /** 只可在以下指定mode使用（不指定应该是都可用） */
    mode?: string[];
    /** 禁止列表，但是貌似没用上 */
    forbid?: string[];
    /** 隐藏该卡牌，是否添加到lib.CardPack中 */
    hidden?: boolean;

    /**
     * 卡牌所拥有的技能列表。
     * 
     * 在player.addEquipTrigger执行，将这些技能全部player.addSkillTrigger加入到技能触发中
     * 其触发的地方还有：$equip，removeEquipTrigger
     */
    skills?: string[];

    /**
     * 应该是在执行该卡牌content之前执行的事件content
     */
    contentBefore?(player: Player, targets: Target[]): ContentFunc;
    /**
     * 核心：触发内容
     * 
     * 注：若type为“equip”，若没设置，则默认使用lib.element.content.equipCard（装备该卡牌）；
     *      若type为“delay”，若没设置，则默认使用lib.element.content.addJudgeCard（为目标设置判定牌）
     */
    content?: ContentFunc;
    /**
     * 应该是在执行该卡牌content之后执行的事件content
     */
    contentAfter?(): ContentFunc;

    /** 不知有什么用，在useCard使用，需要在versus对决模式中 */
    reverseOrder?: boolean;

    /**
     * 是否能救人
     * 
     * 在之前，需要进行“cardSavable”mod检测，若通过，可以进行救人
     * 若是方法，其中，第三个参数为当前_save，濒死求桃的濒死玩家
     * 注：该参数主要使用在_save，濒死求桃阶段
     * 注：【v1.9.108.2.1】中，统合过滤条件到lib.filter.cardSavable中判断；
     */
    savable?: boolean | ThreeParmFun<Card, Player, Target, boolean>;

    /**
     * 是否能“重铸”
     * 
     * 在“_chongzhu”中使用
     */
    chongzhu?: boolean | TwoParmFun<GameEvent, Player, boolean>;

    /**
     * 判断是否通过判断条件（判定牌）
     * @param card 
     */
    judge?: OneParmFun<Card, number>;
    /** 
     * 判断卡牌（判断失败后）的效果
     * 
     * 在phaseJudge（判断阶段）的step2中，当前事件非取消，正常情况下，创建该判定卡牌事件，content为effect，
     * 设置当前事件的_result为新事件的_result（一般情况下result.bool==false失败时触发效果）
     */
    effect?: ContentFunc;
    /** 
     * 当前判断牌事件被取消 
     * 
     * 创建 “卡牌名”+“Cancel” 事件，设置content为该cancel
     */
    cancel?: ContentFunc;

    /** 范围（主要用于非武器牌范围：基础，锦囊，延时锦囊...） */
    range?: RangeData;
    /** 超出范围？ */
    outrange?: RangeData;
    /** 范围(主要用于武器) */
    distance?: DistanceData;

    /**
     * 移除标记（很少使用）
     * 
     * 在lose中使用，一般标记一个技能名
     * 若存在则设置在卡牌的destroyed（不会被循环利用，会被移除出游戏外）
     * 注：是一个特殊标记，标记上该属性，就不能被重铸，也不能被typeCard索引，
     *  一般是作为技能的标记，技能衍生出来的特殊牌（例如装备），被lose时，会触发该属性上记录的技能；
     *  并且拥有该属性的特殊卡牌，一旦失去，不会进入弃牌堆中，直接永久移除。
     */
    destroy?: string;
    /**
     * 在该卡牌lose时候
     * 在lose中调用
     * 用于创建“lose_+name”事件的content，即丢失某牌事件;
     * 同时还需要满足下面的filterLose过滤条件
     * 注：代码内，其实可以创建多个onLose的事件
     */
    onLose?: ContentFunc;//ContentFunc
    /**
     * 过滤是否需要触发onLose
     * 在lose中调用
     * @param card 
     * @param player 
     */
    filterLose?(card: Card, player: Player): boolean;
    /**
     * 是否执行失去该牌的动画
     * 
     * lose中使用
     * 值为false时，不popup失去的卡牌，不启用延时，不设置或者其他，走正常逻辑
     */
    loseDelay?: boolean;

    /**
     * 使用该卡牌时，是否改变选中的目标
     * 
     * （类似于过滤，目前看来，大多用于添加新目标）
     * 在useSkill，useCard创建事件中调用，在get.effect_use中使用；
     */
    changeTarget?(player: Player, targets: Target[]): void;

    /**
     * 播放的音频
     * 
     * 若卡牌为“sha”（杀）时，根据该杀的属性独立播放对应“sha”的语言；
     * 其他，若有值为字符串，则看是否有“ext:”,有则播放扩展里的声音；
     * 否则正常播放audio指定的声音；
     * 若不填，则默认播放该卡牌名字的音频；
     * 若值为true，则默认设置为：“ext:扩展名”；
     */
    audio?: string | boolean;

    /** 一次性卡牌，只能使用一次，使用完，移除出卡牌外（不置入弃牌堆中的） */
    vanish?: boolean;

    /** 
     * 卡牌的基础伤害数值，不填时默认为1 
     * 
     * 在useCard事件中使用，在event中传递
     */
    baseDamage?: number;

    /** 
     * 添加updateUsable:'phaseUse'机制，用于区分【出牌阶段限一次】和【每回合限一次】的卡牌 ；
     * 注：目前就固定一个值，phaseUse【出牌阶段限一次】；
     * 注：当一张牌的updateUsable为'phaseUse'时，会在出牌阶段结束时，而不是回合结束时更新使用数据，比如杀是出牌阶段限一次，酒是每回合限一次；
     */
    updateUsable?: string;

    /**
     * 强制加载该card配置，
     * 例如，一些原本不用于contect模式得卡，设置该值可强制加载该card
     */
    forceLoad?: boolean;

    /**
     * 是否，触发game.logv，取值不为false时触发；
     */
    logv?: boolean;

    //ai部分
    ai?: ExAIData,
    postAi?(targets: Target[]): boolean;
    //一般用于createCard时，为其添加一些动态ai值
    /** 用于get.useful,优先度较高 */
    _modUseful?(): number;
    /** 用于get.value,优先度最高 */
    _modValue?(player?: Player, method?: any): number;


    //以下部分貌似都是是用于显示信息的：
    addinfomenu?: string;
    //来源
    derivation?: string;
    derivationpack?: string;

    //似乎没有用上，不知有什么用
    source?: string | string[];

    /**
     * 【应变模式相关】
     */
    defaultYingbianEffect?: string;

    judge2?(result: JudgeResultData): boolean;

    nature: string[];

    //日后还有很多属性要添加的
    [key: string]: any;
}

/** 卡牌点数 */
type CardBaseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** 卡牌花色 */
type CardBaseSuit = 'heart' | 'diamond' | 'club' | 'spade' | 'none';

/**
 * 卡牌基础配置信息(记录与牌堆list中基本结构)：
 * 
 * 0：花色
 * 
 * 1：点数
 * 
 * 2：名字
 * 
 * 3：伤害属性
 * 
 * 4........暂时没看见，有也是额外扩展
 * 
 * 用于显示的简单卡牌结构2
 * 
 * [suit花色, number数字, name卡牌名, nature伤害类型，......[tag列表]]
 */
type CardBaseData = [CardBaseSuit, CardBaseNumber, string, string, any[] | undefined];

/**
 * 联网模式下卡牌基础配置信息
 * 
 * 0: 卡牌的唯一id
 * 
 * 其余和上面的CardBaseData一致
 */
type CardBaseOLData = [string, string, CardBaseNumber, string, string];

/**
 * 用于显示的简单卡牌结构(基本卡牌信息，作为基本的参数结构)
 * （其实质就是Card对象分离的一部分，用力简单明了的显示，实际直接用card传参也行）
 * 
 * 再度区分：该结构使一个卡牌的信息结构，并不代表当前场上的card有这些属性，
 * 要获取这些属性需要get.xxxx系列方法；
 */
interface CardBaseUIData {
    //基本结构（UI一般会有的结构）
    name?: string;
    suit?: string;
    number?: CardBaseNumber;
    nature?: string;

    //用于某些方法，用于过滤卡牌的额外结构
    type?: string;
    subtype?: string;
    color?: string;

    /** 
     * 是否时视为牌 
     * 
     * 是本来的卡牌，则为true,作为视为牌则为false/undefined
     * 在useCard使用时，作为视为牌，会把next.cards,设置为card.cards;
     * 
     */
    isCard?: boolean;

    /** 真实使用的卡牌 */
    cards?: Card[];
    storage?: SMap<any>;
}

/** 范围信息 */
type RangeData = {
    /** 进攻距离 */
    attack?: number;
    /** 防御距离 */
    global?: number;

}

/** 范围信息2（目前先分开，到时看需要是否统一） */
type DistanceData = {
    /** （进攻马）进攻距离：值为负数值（子类型为equip4） */
    globalFrom?: number;
    /** （防御马）防御距离：值为正数值（子类型为equip3） */
    globalTo?: number;
    /** （武器）攻击范围：值为负数值（不填，为equip1时，默认显示“范围：1”） */
    attackFrom?: number;
}

/** 新增一个game.addCard的info2类型 */
interface CardConfigInfo {
    /** 来源扩展 */
    extension?: string;
    /** 是否有卡牌音效 */
    audio?: boolean;
    /** 是否有卡牌图片 */
    fullskin?: boolean;
    /** 是否有卡牌图片 */
    fullimage?: boolean;
    /** 卡牌中文名 */
    translate: string;
    /** 卡牌效果描述 */
    description: string;
    /** 卡牌点数 */
    number?: CardBaseNumber;
    /** 卡牌颜色 */
    color?: 'red' | 'black';
}

/** 新增卡包类型 */
interface CardPackConfigInfo {
    mode?: any;
    forbid?: any;
    /**
     * [花色, 点数, 卡牌名, 属性, 其他标签]
     */
    list: [CardBaseSuit, CardBaseNumber, string, string | null | undefined, string[]][];
    card?: {
        [key: string]: CardConfigInfo;
    },
    skill?: {
        [key: string]: ExSkillData;
    },
    /** 其他属性覆盖lib同属性内容 */
    [key: string]: object | undefined;
}