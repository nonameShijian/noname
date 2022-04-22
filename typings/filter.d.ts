declare namespace Lib {
    /**
     * 过滤方法
     */
    interface Filter {
        /** 默认过滤所有，只返回true */
        all(): boolean;
        /**
         * 是否不在_status.event.excludeButton（排除按钮）中
         * @param button 
         */
        buttonIncluded(button: Button): boolean;
        /** （无用方法）默认返回true,应该是等待重写覆盖 */
        filterButton(button: Button): boolean;
        /**
         * 过滤触发条件
         * [具体分析在身份局笔记中]
         * @param event 
         * @param player 
         * @param name 
         * @param skill 
         */
        filterTrigger(event: GameEvent, player: Player, name: string, skill: string): boolean;
        /**
         * 判断当前武将是否不能使用
         * 该方法有 双将情况下的禁用
         * @param i 武将名
         * @param libCharacter 
         */
        characterDisabled(i: string, libCharacter?: any): boolean;
        /**
         * 判断当前武将是否不能使用2
         * 该方法，有额外：boss，hiddenboss，minskin，lib.characterFilter判定
         * @param i 武将名
         */
        characterDisabled2(i: string): boolean;
        /**
         * 判断该技能是否不能使用，获得
         * 
         * 主要用于get.gainableSkills,get.gainableSkillsName
         * （不能获得的基本条件：1.非法技能，例如缺少文本描述；
         * 2.没有记录在lib.skill中，
         * 3.技能有unique，temp，sub，fixed，vanish）
         * @param skill 
         */
        skillDisabled(skill: string): boolean;
        /**
         * 判断该卡牌是否可用
         * （即可用，指符合条件下可以用的卡牌，或者当前游戏中可用的卡牌）.
         * 其中检测当前玩家身上的“cardEnabled”锁定技mod
         * @param card 
         * @param player 
         * @param event 若值为“forceEnable”，则强制开始判定能使用；否则，在checkMod后，根据该卡牌的enable，来做最后判定
         */
        cardEnabled(card: {name:string}, player: Player, event?: string|GameEvent): boolean;
        /**
         * 判断该卡牌是否能响应
         * @param card 
         * @param player 
         * @param event 
         */
        cardRespondable(card: {name:string}, player: Player, event?: GameEvent): boolean;
        /**
         * 判断该卡牌是否能使用
         * （即可使用，但是需要符合在回合内使用，次数限制...等可用时的使用条件）。
         * 其中检测当前玩家身上的“cardUsable”锁定技mod,
         * 【v1.9.105.6~】增加，检测当前玩家身上的“cardUsableTarget”锁定技mod,检测玩家是否还能对指定玩家使用的次数；
         * @param card 
         * @param player 
         * @param event 
         */
        cardUsable(card: {name:string}, player: Player, event?: GameEvent): boolean;
        /**
         * 判断该卡牌是否能使用
         * （即可使用，但是需要符合在回合内使用，次数限制...等可用时的使用条件）。
         * 其中检测当前玩家身上的“cardUsable”锁定技mod，
         * 【v1.9.105.6~】即为旧cardUsable的备份；
         * @param card 
         * @param player 
         * @param event 
         */
        cardUsable2(card: {name:string}, player: Player, event?: GameEvent): boolean;
        /**
         * 检查某卡牌是可以弃置。
         * 内部根据是否有锁定技mode有“cardDiscardable”卡牌是否可弃置
         * @param card 
         * @param player 
         * @param event 
         */
        cardDiscardable(card: {name:string}, player: Player, event?: GameEvent): boolean;

        /** 过滤可以被丢弃的牌，通过“canBeDiscarded”mod检测 */
        canBeDiscarded(card: {name:string}, player: Player, target: Player, event?: GameEvent): boolean;
        /** 过滤可以获得的牌，通过“canBeGained”mod检测 */
        canBeGained(card: {name:string}, player: Player, target: Player, event?: GameEvent): boolean;
        /** 判断该牌不在_status.event._aiexclude（排除列表）中 */
        cardAiIncluded(card: {name:string}): boolean;

        /**
         * 判断card是否是可用，可使用(需要满足使用范围，个数，目标玩家等等一系列条件)
         * @param card 
         * @param player 默认当前事件的操作玩家
         * @param event 
         */
        filterCard(card: {name:string}, player?: Player, event?: GameEvent): boolean;
        /**
         * 可指定目标
         * 其中检测当前玩家身上的“playerEnabled”,“targetEnabled”锁定技mod；
         * 主要是额外执行了判断card.filterTarget
         * @param card 
         * @param player 
         * @param target 
         */
        targetEnabled(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 可指定目标2
         * 在执行targetEnabled基础上，若为false，则执行下面：
         * 其中检测当前玩家身上的“playerEnabled”，“targetEnabled”锁定技mod；
         * 主要是额外执行了判断card.modTarget
         * @param card 
         * @param player 
         * @param target 
         */
        targetEnabled2(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 可指定目标3
         * 没有检测当前玩家身上的“playerEnabled”，“targetEnabled”锁定技mod；
         * 只执行了判断card.filterTarget，card.modTarget
         * @param card 
         * @param player 
         * @param target 
         */
        targetEnabled3(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 用于在考虑次数限制的情况下判断目标合法性。
         * 可指定目标4【v1.9.105.10】
         * 优先判定_status.event.addCount_extra是否存在，
         * lib.filter.cardUsable2结果是否为false，
         * 检测玩家身上“cardUsableTarget”锁定技mod，结果是否为false；
         * 若上面结果都不是，则执行lib.filter.targetEnabled判定结果；
         * @param card 
         * @param player 
         * @param target 
         */
        targetEnabledx(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断目标是否在指定玩家距离内。
         * 其中检测当前玩家身上的“targetInRange”锁定技mod
         * @param card 
         * @param player 
         * @param target 
         */
        targetInRange(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家是否有可选择的目标
         * （targetEnabled+targetInRange）
         * @param card 
         * @param player 
         * @param target 
         */
        filterTarget(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家是否有可选择的目标2
         * （targetEnabled2+targetInRange）
         * @param card 
         * @param player 
         * @param target 
         */
        filterTarget2(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家player不是target目标
         * @param card 没有的参数，估计图方便占个位置
         * @param player 
         * @param target 
         */
        notMe(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家player是target目标
         * @param card 没有的参数，估计图方便占个位置
         * @param player 
         * @param target 
         */
        isMe(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家palyer攻击距离是否到达目标
         * @param card 没有的参数，估计图方便占个位置
         * @param player 
         * @param target 
         */
        attackFrom(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断玩家palyer是否到达目标的防御距离
         * @param card 没有的参数，估计图方便占个位置
         * @param player 
         * @param target 
         */
        globalFrom(card: {name:string}, player: Player, target: Player): boolean;
        /** 默认[1,1] */
        selectCard(): [number,number];
        /**
         * 获得当前时间中的玩家的选择目标数
         * 其中检测当前玩家身上的“selectTarget”锁定技mod
         */
        selectTarget(): [number,number];
        /**
         * 判断该牌是否是目标判断区的判定牌
         * @param card 
         * @param player 没有的参数，估计图方便占个位置
         * @param target 
         */
        judge(card: {name:string}, player: Player, target: Player): boolean;
        /**
         * 判断当前没有“sha”（杀）可以响应
         * 注：因为该方法主要是赋予给event执行的，故其this是指向执行的事件。
         */
        autoRespondSha(): boolean;
        /**
         * 判断当前没有“shan”（闪）可以响应
         * 注：因为该方法主要是赋予给event执行的，故其this是指向执行的事件。
         */
        autoRespondShan(): boolean;
        /**
         * 判断当前事件的类型type是否为“wuxie”（无懈），当前游戏现场是否有“wuxie”的UI
         * 若符合要求情况下，当前应该为询问“无懈”阶段中
         * @param event 
         */
        wuxieSwap(event: GameEvent): boolean;

        /**
         * 用于判断一名角色能否使用某张卡牌对另一名濒死角色提供帮助。
         * 
         * 判断该卡牌是否能用于“救人”
         * 
         * 检测玩家身上“cardEnabled2”锁定技mod，若结果有变化，则返回；
         * 检测玩家身上“ccardSavable”锁定技mod，若结果有变化，则返回；
         * 否则，最后，检测卡牌的savable配置，返回该结果；
         * 【v1.9.108.2.1】
         * @param card 
         * @param player 
         * @param target 
         */
        cardSavable(card:Card,player:Player,target:Target):boolean;
    }
}