declare var ui: UI;
interface UI {
    updates: any[];
    thrown: any[];
    touchlines: any[];
    todiscard: SMap<any>;
    /** 
     * 刷新node样式
     * 用于当node.style值改变时，下面需要立刻感应到该变化，可以使用该方法立刻主动刷新，立即生效
     */
    refresh(node: HTMLElement): void;
    create: UI.Create,
    click: UI.Click,
    /** 选中的ui */
    selected: {
        /** 选中的按钮列表（技能，操作） */
        buttons: any[],
        /** 选中的卡牌列表 */
        cards: any[],
        /** 选中的玩家目标列表 */
        targets: any[]
    },
    /** 主动清除游戏中“thrown”的节点 */
    clear(): void;
    /** 更新control的显示 */
    updatec(): void;
    /** 
     * 综合更新:
     * 1.执行ui.update；
     * 2.执行ui.updatehl；
     * 3.执行当前保存了的lib.onresize；
     * 4.执行ui.updated；
     * 5.执行ui.updatez；
     */
    updatex(): void;
    /** 以500ms延迟执行updatex */
    updatexr(): void;
    /** 用于更新判定区/标记区 */
    updatejm(player: Player, nodes: HTMLElement[], start?: number, inv?: boolean): void;
    /** 更新标记区，不设值，更新所有 */
    updatem(player?: Player): void;
    /** 更新玩家的判定区，不设值，更新所有 */
    updatej(player?: Player): void;
    /** 更新手牌列表 */
    updatehl(): void;
    //手牌整理相关，目前updateh，updatehx好像没看见怎么使用
    updateh(compute): void;
    updatehx(node): void;
    /** 更新game.deviceZoom，缩放比例 */
    updated(): void;
    /** 更新document.body（根据game.documentZoom） */
    updatez(): void;
    /**
     * 更新：
     * 1.执行ui.updates中保存的ui方法更新；
     * 2.更新ui.dialog相关；
     */
    update(): void;
    recycle(node, key): void;

    //联机的UI：
    /** 创建服务器 */
    connectRoom: HTMLDivElement;
    /** 约战 */
    connectEvents: HTMLDivElement;
    /** 在线 */
    connectClients: HTMLDivElement;

    /**
     * 【核心】保持游戏内创建的新样式的缓存
     * 
     * 更新样式的方式，通过，对之前的样式.remove(),移除，掉，替换新的样式，就替换了样式，例如：
     * 1.替换全新样式，先样式.remove(),然后lib.init.sheet创建新样式；
     * 2.样式.sheet.insertRule(),为当前样式，添加新的规则；
     * 3.样式.href=需要切换得目标css路径；
     */
    css: SMap<HTMLStyleElement>;

    //【核心】ui的的区域：
    /** 卡堆区（抽牌区） */
    cardPile: HTMLDivElement;
    /** 弃牌区 */
    discardPile: HTMLDivElement;
    /** 特殊区（放置与武将牌上，旁区域） */
    special: HTMLDivElement;
    /** 处理区 */
    ordering: HTMLDivElement;

    //玩家身上的区域
    /** 装备区 */
    equips: HTMLDivElement;
    /** 判定区 */
    judges: HTMLDivElement;
    /** 手牌区 */
    handcards: HTMLDivElement;

    arena: HTMLDivElement;
    /** 托管按钮 */
    auto: HTMLDivElement;
}