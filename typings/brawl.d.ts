// declare var brawl:BrawlMode;
/** 
 * 自己扩展“乱斗”模式：
 * 
 * brawl乱斗模式 
 * 
 * 导入配置，需要设置_status.extensionscene=true;
 */
interface BrawlSceneMode extends ExModeConfigData {

    // 一.通用配置
    /** 该乱斗扩展的名字 */
    name?:string;
    /** 该乱斗模式，事依据当前已有的某个模式前提下进行，指定该模式 */
    mode?:string;
    /** 子模式名称，用于“乱斗”名字显示：mode名-submode子名 */
    submode?:string;
    /** 描述 */
    intro?:string|string[];
    /** 该模式，非“乱斗”开始模式，不显示“斗”开始按钮 */
    nostart?:boolean;
    /** showcase全屏显示 */
    fullshow?:boolean;
    /**
     * 展示 （应该事用于展示场景布局，实际用途后续探讨）
     */
    showcase?(init?:any):void;
    /**
     * mode的init方法
     * 
     * 在乱斗模式时，点击场景后，game.switchMode切换到对应模式后，会执行该mode的init；
     */
    init?(): void;
    
    // 保存于_status.brawl中的部分，提供给其切换的mode，与game.js流程中一些涉及到的部分进行“乱斗”相关的扩展；
    /** 乱斗模式的功能主体(可能大部分时覆盖其对应mode的对应方法，暂未验证，也有可能只是在乱斗模式下，独立增加该方式的执行) */
    content?:{
        //常用的：

        /** 取值为true，则可以无需判断是否要addSetting，即直接不显示“自由选将”面板 */
        noAddSetting?:boolean;
        /** 没有抽牌阶段 */
        noGameDraw?:boolean;
        /** 用于ui.create.cards，为true时，构筑出来的卡堆不会随机洗牌，而是已固定顺序 */
        orderedPile?:boolean;
        /** 设置当前模式最大游戏人数（优先于读取的配置） */
        playerNumber?:number;

        /**
         * 在乱斗模式下，ui.create.cards，处理构筑出的游戏用卡堆，加入该模式的特有卡牌；
         * @param list 
         */
        cardPile?(list:CardBaseData[]):CardBaseData[];
        /**
         * 作用于event.trigger,在gameStart时机时触发，若有该函数，则执行
         */
        gameStart?():void;


        //适用于：identity,guozhan,versus,doudizhu（注：并不是都有使用，懒得列，后续再分开看看）
        /** 用于identity模式，设置该值为_status.mode的值 */
        submode?:string;
        /** 展示身份 */
        identityShown?:boolean;
        /** 是否“固定选取角色”，即不出现更换选取角色的面板 */
        chooseCharacterFixed?:boolean;
        /** 替代“选择角色”这个提示的文本 */
        chooseCharacterStr?:string;
        /** 当前是否是双将模式（优先于配置） */
        doubleCharacter?:boolean;
        /**
         * 在选择武将角色之前
         * 
         * 当前用于与mode：identity，guozhan，versus；
         */
        chooseCharacterBefore?():void;
        /** 用于“identitiy”的选择角色ai，若返回值不是false，则优先强制使用该方法 */
        chooseCharacterAi?(player:Player,list?:string[],list2?:string[],back?:any):void;
        /** 用于“guozhan”的选择角色ai */
        chooseCharacterAi?(player:Player,list?:string[],back?:any):void;
        /** 过滤当前角色列表（优先于chooseCharacter） */
        chooseCharacterFilter?(list:string[],list2:string[],list3:string[]):void;
        /** 选择角色列表 */
        chooseCharacter():boolean;
        /** 过滤选择角色列表，返回false/"nozhu"时，从列表中删除该角色，mode：identity,条件：game.zhu!=game.me */
        chooseCharacter(list:string[],num:number):boolean;
        /** 过滤选择角色列表，返回false/"nozhu"时，从列表中删除该角色，mode：identity,条件：game.zhu==game.me */
        chooseCharacter(list2:string[],list3:string[],num:number):boolean;
        /** 获取可选择角色列表，mode：guozhan，versus */
        chooseCharacter(list:string[],player:Player):string[];
        // chooseCharacter():string; //返回“nozhu”时，从列表中删除该角色
        /** 优先于“identity”的checkResult方法 */
        checkResult():void;


        //在brawl中使用： (非配置)       
        /** 当前乱斗模式得原生配置，即将配置信息，缓存到brawl.content.scene；另一种则，“下一关”，即stage.scenes[level.index]，当前关卡信息，缓存起来*/
        scene?:BrawlSceneMode;
        /** 当前乱斗模式得原生配置，即将配置信息，缓存到brawl.content.stage； */
        stage?:BrawlStageMode;

        //可以继续加入更多对象：
        [key: string]: any;
    }

}


/**
 * 默认“乱斗”模式，使用“乱斗”模式得模板代码：
 * 
 * 用于基于自定义模板的预定义参数；
 * 
 * 注1：默认模式，是以“identity”为模板的；
 * 注2：在内部设置于，中的模式，会被lib.brawl.scene.template中的方法覆盖，不过默认模式也不支持使用其他函数，参数，定义了可能是为了自己扩展其他方法使用，不影响模板方法；
 * 注3：其配置，将保存于对应的lib.brawl[scene_name].content.scene中；
 */
interface DefaultBrawlSceneMode {
    /** 该乱斗扩展的名字 */
    name?:string;
    /** 描述 */
    intro?:string|string[];

    // brawl template 默认配置下得参数：
    /** 貌似是设置默认玩家设置得，又或者说是初始玩家，目前看来是用于scene.template模板方法里面得（即不覆盖那些方法时） */
    players?:BrawlPlayerInfo[];
    // 用于fakecard，用于scene.showcase
    /** 牌堆顶 */
    cardPileTop?:Card[],
    /** 牌堆底 */
    cardPileBottom?:Card[],
    /** 弃牌堆 */
    discardPile?:Card[],
    /** 回合数: [0]为可持续回合数，[1]为持续回合数为0时，game.over(其结果)，结果有："win","lose","tie"(平局) */
    turns?:[number,string][];
    /** 洗牌数: [0]为可洗牌次数，[1]为可洗牌次数0时，game.over(其结果)，结果有："win","lose","tie"(平局) */
    washes?:[number,string][];
    /** 是否完全替换牌堆，设为true则，只使用cardPileTop，cardPileBottom，discardPile */
    replacepile?:boolean;
    /** 是否有抽卡阶段，不设置为true，则设content.noGameDraw为true，没有抽牌阶段 */
    gameDraw?:boolean;

    //可以自己加入更多自定义对象：
    [key: string]: any;
}


/**
 * 乱斗模式设置玩家的信息
 */
type BrawlPlayerInfo = {
    name?:string;
    name2?:string;
    identity?:string;
    position?:number;
    hp?:number;
    maxHp?:number;
    linked?:boolean;
    turnedover?:boolean;
    playercontrol?:boolean;
    handcards?:any[];
    equips?:any[];
    judges?:any[];

    // 后续可以定义任意值
    // [key: string]: any;
}

/**
 * brawl乱斗模式关卡设置：
 * 
 * 导入配置，需要设置_status.extensionstage=true;
 */
interface BrawlStageMode {
    /** 该乱斗扩展关卡的名字 */
    name?:string;
    /** 描述 */
    intro?:string|string[];

    /** 貌似是对应子模式的，暂时不清楚 */
    mode?:string;

    /** 当前关卡数，一般从0开始 */
    level?:number;

    /** 该关卡关联的场景（貌似要求至少两个合理） */
    scenes?:DefaultBrawlSceneMode|BrawlSceneMode[];
}