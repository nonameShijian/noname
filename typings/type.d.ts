//这里主要是声明各种游戏内常用的对象的结构
type listeners = {
    [key in keyof HTMLElementEventMap]?: EventListener;
};

type styleObj = {
    [key in keyof CSSStyleDeclaration]?: string;
}

/** key为字符串的map */
interface SMap<V> {
    [key: string]: V
}

/** key为number的map */
interface NMap<V> {
    [key: number]: V
}

//从0个参数到任意参数的方法结构声明
type NoneParmFum<T> = () => T;
type OneParmFun<U, T> = (arg0: U) => T;
type TwoParmFun<U1, U2, T> = (arg0: U1, arg1: U2) => T;
type ThreeParmFun<U1, U2, U3, T> = (arg0: U1, arg1: U2, arg2: U3) => T;
type FourParmFun<U1, U2, U3, U4,T> = (arg0: U1, arg1: U2, arg2: U3,arg3:U4) => T;
type RestParmFun<T> = (...args) => T;
type RestParmFun2<U,T> = (...args:U[]) => T;

//尝试增加的符合类型声明：(后续看看是否要用上)
/** SingleAndArrayType:单体与集合类型 */
type SAAType<T> = T | T[];
/** 再价格可以返回这种类型的方法 */
type SAAFType<T> = T | T[] | RestParmFun<T>;
/** 有name属性的对象 */
type NameType = {name:string};
/** 技能或者卡牌 */
type SkillOrCard = string|NameType|Card;
/** 卡牌或者卡牌集合 */
type CCards = SAAType<Card>;

/**
 * content触发内容：
 * 经过game.createEvent创建事件，设置setContent，
 * 经过lib.init.parse转换，
 * 在game.loop内，传入这些参数调用。
 *  
 *  _status:Status, lib:Lib, game:Game, ui:UI, get:Get, ai:AI这6大对象，不需要在参数列表中
 */
type ContentFunc = ContentFuncByAll | ContentFuncByNormal | ContentFuncByNormal2 | ContentFuncByNormal21 | ContentFuncByNormal3 | ContentFuncByNormal4 | ContentFuncByNormal5 | ContentFuncByNormal6;
type ContentFuncByAll = (event: GameEvent, step: number, source: Player, player: Player, target: Player, targets: Player[], card: Card, cards: Card[], skill: string, forced: boolean, num: number, trigger: GameEvent, result: BaseCommonResultData) => void;
//扩充一些额外得搭配参数(简化参数配置),改成基本参数求event给就行了
//这里只是用于方便些代码的声明，实际上的参数列表，是执行了parse后转换的函数参数，所以不用在意这里的位置关系，只要名字一致就行了
type ContentFuncByNormal = (event: GameEvent, player: Player, trigger: GameEvent, result: BaseCommonResultData)=>void;
type ContentFuncByNormal2 = (event: GameEvent, player: Player, target: Player, num: number, targets: Player[], cards: Card[], trigger: GameEvent, result: BaseCommonResultData)=>void;
type ContentFuncByNormal21 = (event: GameEvent, source: Player, player: Player, target: Player ,trigger: GameEvent,result: BaseCommonResultData)=>void;//todo:暂时兼容
//注1：角色的技能content事件执行的是，你技能的事件，你的技能事件并没有做过过多处理，并没有直接的source,target，一般为cards,targets,player：
//注2：角色的技能content事件，还会携带，target，num，当该技能可以针对多数选择目标进行一一处理时(multitarget不为true时)，target为当前处理的目标，num为处理的目标的下标数
type ContentFuncByNormal3 = (event: GameEvent, player: Player, result: BaseCommonResultData)=>void;
type ContentFuncByNormal4 = (event: GameEvent,  player: Player )=>void;
type ContentFuncByNormal5 = (player: Player, trigger: GameEvent)=>void;
type ContentFuncByNormal6 = (player: Player)=>void;//几乎最简的形式

//一些主要对象简单化，语义化类型名：
/** nogame的card类型 */
type Card = Lib.element.Card;
/** nogame的player类型 */
type Player = Lib.element.Player;
/** nogame的player类型->目标玩家 */
type Target = Lib.element.Player;
/** nogame的player类型->发动源玩家 */
type Source = Lib.element.Player;
/** nogame的player类型->当前操作中的玩家（一般指遍历回调中正在操作的数据） */
type Current = Lib.element.Player;
/** nogame的player类型->一般用于AI相关的方法中，代表视角,一般指代player(玩家自身)或者target(目标)，视角决定效果的正负 */
type Viewer = Lib.element.Player;
/** nogame的button类型 */
type Button = Lib.element.Button;
/** nogame的dialog类型 */
type Dialog = Lib.element.Dialog;
/** nogame的event类型（也指当前回调中的事件） */
type GameEvent = Lib.element.Event;
/** nogame的event类型=>主触发事件 */
type Trigger = Lib.element.Event;
/** nogame的触发名 */
type TriggerName = string;
/** nogame中所使用的技能的名字 */
type Skill = string;
/** nogeme中button的link列表(相关类型：Card|Player|string|CardBaseData) */
type Links = any[];
/** 标记等信息的缓存(Storage 被占用了) */
type GameStorage = Map<string,any>;
/** 指定标记的信息缓存 */
type GameStorageItem = any;

/** 
 * nogame的选择范围类型
 * 下标0：
 * 下标1：选中的数量。-1为所有
 * 或者直接表示，下标0~下标1的范围
 */
type Select = [number,number];
/**
 * div的左距离坐标，上距离坐标
 */
type DivPosition = [number,number,number,number];


/** 
 * 技能动画方法
 * 
 * 该方法的this绑定的player,为技能的使用者
 * @param name 为技能名称 
 * @param popname 为原先发动技能时弹出的文字（绝大多数情况下与name相同） 
 * @param checkShow 为双将模式下技能的来源（vice为主将 其他情况下为副将）
 */
type SkillAnimateType = (name:string,popname:string,checkShow) => void;
/**
 * 卡牌动画方法
 * 
 * this为卡牌的使用/打出者 
 * @param card 为卡牌 
 * @param name  
 * @param nature 为不使用特效的情况下卡牌的文字颜色(metal-使用-黄色，wood-打出-绿色)，可以用来判断卡牌是因使用还是因打出而播放特效
 * @param popname
 */
type CardAnimateType = (this: Player, card: Card, name:string, nature:string, popname:boolean) => void;

// 将字符串数组的所有元素作为类型
type StrArrToUnion<T extends string[]> = T extends Array<infer E> ? E : never;
type nature = StrArrToUnion<["fire", "thunder", "kami", "ice", "stab", "poison"]>;

/*
// 0-N的数字
type GetIntegerUnion<N extends number, R extends number = 0, Arr extends any[] = []>
    = Arr['length'] extends N
    ? R
    : GetIntegerUnion<N, R | Arr['length'], [any, ...Arr]>
*/

type damageArgs = Card[] | Card | number | Player | { name: string } |
    'nocard' | 'nosource' | 'notrigger' | nature;
