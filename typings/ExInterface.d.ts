//实现一些书写代码常用的结构

/** 
 * 抽离一部分参数实现game.check中event使用到的属性（暂时只记录常用的，看起来有用的）
 * 
 * 这部分用于参数声明
 */
interface CheckEventData {
    /**
     * 选择的牌需要满足的条件
     * 可以使用键值对的简便写法
     * 也可以使用函数返回值（推荐）
     * 
     * 用于参数时，某些特殊choose类方法，可以根据你传入得object，采用get.filter生成过滤方法；
     * 既通过get.filter处理成事件的filterCard的方法；
     */
    filterCard?: boolean | CardBaseUIData | TwoParmFun<Card,Player, boolean>;
    /**
     * 选择的目标需要满足的条件
     */
    filterTarget?(card: Card, player: Player, target: Target): boolean;
    /**
     * 需要选择多少张牌才能发动
     * 选择的牌数
     * -1时，选择所有牌,否则就是指定数量的牌
     * 数组时，这个数组就是选择牌数的区间,其中任意（至少一张）：[1,Infinity]
     * 为变量时（具体情况具体分析），例：()=>number
     */
    selectCard?: number | Select | OneParmFun<Card, number>;
    /**
     * 需要选择多少个目标才能发动
     * 选择的目标数：
     * 为-1时，选择全部人
     * 为数组时，这个数组就是选择目标数的区间
     */
    selectTarget?: number | Select;

    /** 过滤不可选择按钮 */
    filterButton?(button: Button, player: Player): boolean;
    /** 按钮的可选数量，大多数情况下，默认1 */
    selectButton?: number | Select | NoneParmFum<number | Select>;

    /** 
     * 指定获取卡牌的位置：
     * 'h'：手牌区, 'e'：装备区, 'j'：判定区 
     */
    position?: string;

    /**
     * 是否强制标记，取值为true时，game.check的返回值，会变false（一般情况下）需要手动执行；返回值为true则自动确认
     */
    forced?: boolean;

    //ai相关
    /** 一般作为chooseCard相关ai */
    ai1?: Function;
    /** 一般作为chooseTarget相关ai */
    ai2?: Function;

    //显示提示相关：
    /** 显示的提示文本 */
    prompt?: string;
    /** 显示的提示文本2(下面一行的文本) */
    prompt2?: string;

    complexSelect?:boolean;
    complexCard?:boolean;
    complexTarget?:boolean;
}

/** game.check中event使用到的属性
 * 
 * 用于event的数据结构 
 */
interface CheckEventResultData {
    /**
     * 选择的牌需要满足的条件
     * 可以使用键值对的简便写法
     * 也可以使用函数返回值（推荐）
     * 
     * 用于参数时，某些特殊choose类方法，可以根据你传入得object，采用get.filter生成过滤方法；
     * 既通过get.filter处理成事件的filterCard的方法；
     * 
     * 注1：该event参数，目前只有在过滤技能时，是viewAs视为技的情况下，才投入该过滤与参数
     * 注2：这种的方法，player指代的是当前执行事件中的玩家，card是当前指定区域处理中的card
     */
    filterCard?(card: Card|CardBaseUIData, player: Player ,event?:Trigger):boolean;
    /**
     * 需要选择多少张牌才能发动
     * 选择的牌数
     * -1时，选择所有牌,否则就是指定数量的牌
     * 数组时，这个数组就是选择牌数的区间,其中任意（至少一张）：[1,Infinity]
     * 为变量时（具体情况具体分析），例：()=>number
     */
    selectCard?:OneParmFun<Card, number>;

    /**
     * 选择的目标需要满足的条件
     */
    filterTarget?(card: Card|CardBaseUIData, player: Player, target: Target): boolean;
    /**
     * 需要选择多少个目标才能发动
     * 选择的目标数：
     * 为-1时，选择全部人
     * 为数组时，这个数组就是选择目标数的区间
     */
    selectTarget?:Select;

    /** 
     * 过滤不可选择按钮
     * 
     * 注：这种的方法，player指代的是当前执行事件中的玩家，button是当前面板处理中的button
     */
    filterButton?(button: Button, player?: Player): boolean;
    /** 按钮的可选数量，大多数情况下，默认1 */
    selectButton?:Select;

    /** 
     * 指定获取卡牌的位置：
     * 'h'：手牌区, 'e'：装备区, 'j'：判定区 
     */
    position?: string;

    /**
     * 是否强制标记，取值为true时，game.check的返回值，会变false（一般情况下）需要手动执行；返回值为true则自动确认
     */
    forced?: boolean;

    //ai相关
    /** 作为事件的ai */
    ai?: Function;
    /** 一般作为chooseCard相关ai */
    ai1?: Function;
    /** 一般作为chooseTarget相关ai */
    ai2?: Function;

    //显示提示相关：
    /** 显示的提示文本 */
    prompt?: string;
    /** 显示的提示文本2(下面一行的文本) */
    prompt2?: string;

    complexSelect?:boolean;
    complexCard?:boolean;
    complexTarget?:boolean;
}

//为了方便使用，可能需要给结果也搞个类型

/**
 * 当前游戏状况信息（一般用于联机模式下保存数据用的结构）
 */
interface AreanStateInfo {
    number: number,
    players: NMap<any>,
    mode: string,
    dying: any[],
    servermode: string,
    roomId: any,
    over: boolean
}

/** 录像数据 */
interface VideoData {
    type: string;
    /** 坐位号 */
    player: string;
    delay: number;
    content: any;
}

/** 
 * 判定方法的基本声明 
 * 
 * 其判定的结果值，
 * 大于0，则result.bool=true，结果为”洗具“；
 * 小于0，则result.bool=false，结果为”杯具“;
 * 等于0，则result.bool=null，当前无结果;
 */
type JudgeFun = (jResult: JudgeResultData) => number;




//result的结构：
/**
 * 基础result结构
 * 
 * （基本通用，应该也有例外，暂无视）
 *  修订：将改成涉及主逻辑相关操作都会记录在这里。(暂时还是分离开，在代码中声明类型)
 */
interface BaseResultData {
    /**
     * 最终结果
     * 
     * 大多代表该事件到达这一步骤过程中的结果;
     * 一般用来标记当前事件是否按预定执行的，即执行成功
     * 
     * 大部分事件间接接触game.check，一般最终结果不变，大多数是这种
     * 
     * 其实主要是ok方法会有直接的bool，主要涉及game.check;
     */
    bool?:boolean;
    
    [key:string]:any;
}

/**
 * 一般用于带操作的事件的最终结果:
 * choose系列基本架构，数据大多在game.check，的ui.click.ok进行设置；
 * 
 * 为了方便，将control系，ok系的结果结构放进去
 * 
 * 大部分事件间接接触game.check，一般最终结果不变，大多数是这种
 */
interface BaseCommonResultData extends BaseResultData {
    //choose系
    /** 记录返回当前事件操作过程中的卡牌 */
    cards:Card[];
    /** 记录返回当前事件操作过程中的目标 */
    targets:Player[];
    /** 记录返回当前事件操作过程中的按钮 */
    buttons:Button[];
    /** 记录buttons内所有button.link(即该按钮的类型，link的类型很多，参考按钮的item) */
    links:any[];

    //control系(直接control系列没有result.bool)
    /** control操作面板的选中结果，即该按钮的link，即名字 */
    control:string;
    /** 既control的下标 */
    index:number;

    //ok系
    /** 记录返回当前事件操作过程中，面板按钮的确定ok取消cancel */
    confirm:string;
    /** 一般为触发的“视为”技能 */
    skill:string;
    /**
     *  当前事件操作的“视为”牌，
     * 当前有“视为”操作，该card参数特供给视为牌，不需要cards[0]获取视为牌 ；
     * 判断是否为视为牌：card.isCard，false为视为牌
     */
    card:Card;
}


/** 判断阶段的事件reslut */
interface JudgeResultData extends BaseResultData {
    /** 成功为true,失败为false */
    bool:boolean;
    /**
     * 用于该次判定结果的牌
     */
    card: Card;
    /** 
     * 判定结果牌的名字
     * （有该属性，可以视为card,直接使用get.卡牌相关方法） 
     */
    name:string;
    /** 判定的卡牌点数 */
    number: number;
    /** 4中基本花色：♠，♥，♣，♦ */
    suit: string;
    /** 2大花色：红黑 */
    color: string;
    /**
     * 用于抛出显示的判定牌（貌似是副本,非game.online）
     */
    node: Card;

    /** 
     * 判定的结果值
     * （event.judge中处理的event.result没有该结果，是在处理完后才设置该结果）
     * 
     * 大于0，则result.bool=true，结果为”洗具“；
     * 小于0，则result.bool=false，结果为”杯具“;
     * 等于0，则result.bool=null，当前无结果;
     * 注：在获得最终结果之前有一个“judge”的mod检测。
     */
    judge: number;
}

/** 
 * 拼点事件的result
 * 
 * 用于chooseToCompare
 * 示例：
 * result.bool==true;//6>1
    result.tie==false;//不是平局
    result.player  //你的拼点牌
    result.target  //目标的拼点牌
    result.num1==6   //你的点数为6
    result.num2==1   //目标的点数为1
 */
interface PingDianResultData extends BaseResultData {
    /** 赢为true,平手/输为false */
    bool:boolean;
    /** 是否平局 */
    tie:boolean;
    /** 你的拼点牌 */
    player:Card;
    /** 目标的拼点牌 */
    target:Card;
    /** 你的点数 */
    num1:number;
    /** 目标的点数 */
    num2:number;

    /** 当前拼点的胜利者，赢了是player,输了是target,平则没有 */
    winner:Player

}

/**
 * 多人拼点事件的result
 * 
 * 用于chooseToCompareMultiple
 */
interface PingDianMultipleResultData extends BaseResultData {
    //这个可能没有bool，有点迷
    /** 你的拼点牌 */
    player:Card;
    /** 目标的拼点牌 */
    targets:Card[];
    /** 你的点数 */
    num1:number[];
    /** 目标的点数 */
    num2:number[];

}
