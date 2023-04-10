declare var _status:Status;

interface Status {
    /** 暂停游戏game.loop循环，由game.pause控制 */
    paused:boolean;
    /** 暂停游戏game.loop循环2，由game.pause2控制 */
    paused2:boolean;
    paused3:boolean;
    /** 当前你已经游戏结束了（为true的话） */
    over:boolean;
    /** 当前是否能点击操作 */
    clicked:boolean;
    /**
     * 当前是否为自动操作（即托管）
     */
    auto:boolean;

    /** 【核心】游戏当前事件 */
    event:GameEvent;
    
    /** 用来存放一些临时全局使用的ai相关参数，方法 */
    ai:{
        /** 临时用户自定义态度检测方法[identity身份局模式] */
        customAttitude:TwoParmFun<Player,Player,number>[];

        [key:string]:any;
    };

    lastdragchange:any[];
    /**
     * 已经播放过的技能语音
     * 
     * 若lib.config.repeat_audio为false时，会在播放语音时，判断播放过，不播放；
     * 注：目前设置为，只保存1秒，只会自动删除，即是用来防止短时间内频繁播放同一语音；
     */
    skillaudio:string[];
    /**
     * 死亡时，需要关闭的窗口
     * 
     * 在game.loop中，若当前事件中的玩家是dead死亡状态时，关闭记录在这里的窗口；
     */
    dieClose:Dialog[];
    dragline:any[];

    /** 当前处于濒死状态的，濒死玩家列表 */
    dying:Player[];

    /** 当前可以点击按钮选择 */
    imchoosing:boolean;

    /** 当前是否可选择多个目标，用于UI处理，选择完一个目标时，继续触发game.ckeck检测剩余目标 */
    multitarget:boolean;


    /** 当前是否播放录像中 */
    video:boolean;
    /** delay延时游戏的setTimeout标记 */
    timeout:number;

    /** 当前播放的音乐 */
    currentMusic:string;

    /** 等待window.location.reload执行，在reload2中重置该标记 */
    waitingToReload:boolean;

    /** 当前的回合阶段的玩家 */
    currentPhase:Player;

    /** 当前是否联机模式 */
    connectMode:boolean;

    /** 
     * 当轮的第一个玩家（会随玩家死亡进度刷新） 
     * 
     * 若该玩家翻面状态，会在_turnover中进行特殊结算；
	 * 
	 * 于【v1.9.113.4】废弃
	 * 
	 * @deprecated 在已生成座位号的场合，不再通过_status.firstAct来判断“一轮游戏”的开始，而是按“当前回合角色的座位号是否大于上一回合的角色”判断
     */
    roundStart?:Player;

    /** 
     * 牌堆顶的一张牌 
     * 
     * 随game.updateRoundNumber()函数的运行实时更新
     */
    pileTop:Card;

    /**
     * 全局事件的使用记录
     * 
     * 目前只记录：卡牌移动事件；
     * 当前游戏，获取，操作该参数的方法：game.getGlobalHistory 和 game.getAllGlobalHistory
     */
    globalHistory: GlobalHistoryData[];

    /** 没有倒计时显示 */
    noclearcountdown:boolean;

    /**
     * 卡牌标记
     * 
     * 每个标记独立保存card.cardid
     * 
     * 【v1.9.107】
     */
    cardtag:SMap<string[]>;

    /** 适用于“乱斗”（brawl）模式，扩展，在这里保存的对应name，可以打开对应的扩展设置 */
    extensionmade:string[];

	/**
	 * 于【v1.9.113.4】废弃
	 * 
	 * @deprecated 有座位号的局不以此作为判断标准了。在已生成座位号的场合，不再通过_status.firstAct来判断“一轮游戏”的开始，而是按“当前回合角色的座位号是否大于上一回合的角色”判断
	 */
	firstAct?: Player;

	/** 仁库，为张仲景（游戏中叫张机）一个人添加的属性（一个特殊的区域） */
	renku: CardBaseUIData[]; 

	/** 游戏是否已经开始 */
	gameStarted: boolean;

	/** 应该是许劭左慈等人要从“剩余武将牌”里获取的武将名数组 */
	characterlist: string[];

	/**
	 * 扩展设置的扩展更新内容，由无名杀自动解析显示(由`game.showChangeLog`调用)
	 * 
	 * 注: extensionChangeLog的键对应的值将被解析成HTML字符串，所以使用'\n'是无效的。请使用\<br\>换行
	 * 
	 * 示例:
	 * ```jsx
	 * _status.extensionChangeLog = { 
	 * 	'扩展名': '我的扩展', 
	 * 	'版本号': 'v1.23', 
	 * 	'更新内容': 'xxx'
	 * };
	 * ```
	 */
	extensionChangeLog: SMap<string>;

    mode: string;

    discarded: Card[];
    
    /*  扩展成员  */
    [key:string]:any;
}