declare var ai:AI;
interface AI {
    basic:AIBasic;
    get:Get;
}

/** 项目预定义的ai原生操作方法 */
interface AIBasic {
    /** ai选择按钮 */
    chooseButton(check:AICheckFun):boolean;  
    /** ai选择牌 */
    chooseCard(check:AICheckFun):any;        
    /** ai选择目标 */
    chooseTarget(check:AICheckFun):any;
}

/**
 * ai的check方法，即event.ai的方法类型
 */
type AICheckFun = RestParmFun<number>;
/**
 * 
 */
type AICheckFun1 = OneParmFun<Button,number>;
/**
 * 
 */
type AICheckFun2 = OneParmFun<Card,number>;
/**
 * 
 */
type AICheckFun3 = OneParmFun<Player,number>;
/**
 * chooseControl,返回值是
 * chooseBool
 * 
 */
type AICheckFun4 = TwoParmFun<GameEvent,Player,number>;

