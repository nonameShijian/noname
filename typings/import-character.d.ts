declare interface importCharacterConfig extends ExCommonConfig {
    /** 
     * 类型：布尔值
     * 
     * 作用：设置该武将包是否可以联机 
     */
    connect?: boolean;

    /** 
     * 类型：字符串数组
     * 
     * 作用：设置联机武将禁用列表 
     * */
    connectBanned?: string[];

    /** 
     * 类型：键值对
     * 
     * 作用：设置武将基本配置信息
     */
    character: SMap<HeroData>;

    /** 
     * 应用于： game.import的第一个参数为"character"。
     * 
     * 类型：键值对
     * 
     * 作用：设置武将介绍 
     * */
    characterIntro?: SMap<string>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置武将标题（用于写称号或注释）
     * */
    characterTitle?: SMap<string>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置技能 
     * */
    skill?: SMap<ExSkillData>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置珠联璧合武将 
     * */
    perfectPair?: SMap<string[]>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置指定武将的过滤方法（传入一个mode，用于过滤玩法模式） 
     * */
    characterFilter?: SMap<OneParmFun<string, boolean>>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置在武将包界面分包
     */
    characterSort?: SMap<SMap<string[]>>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置该武将包独有的卡牌（或者是特殊卡牌） 
     * 
     * */
    card?: SMap<ExCardData>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置自定义卡牌类型的排序用的优先级
     * */
    cardType?: SMap<number>;

    /**
     * 类型：键值对
     * 
     * 作用：设置动态翻译（本地化）【v1.9.105】
     * 
     * 指定lib.dynamicTranslate.xxx为一个函数 即可让技能xxx显示的描述随玩家状态而变化 并实现技能修改等
     * 
     * Player:指技能拥有者
     */
    dynamicTranslate?: SMap<OneParmFun<Player, string>>;

    /** 
     * 类型：键值对
     * 
     * 作用：选择武将时，武将左下角可进行替换的武将配置【v1.9.106.3】 
     * 
     * */
    characterReplace?: SMap<string[]>;

    /**
     * 类型：键值对
     * 
     * 作用：对应lib.element,
     * 若里面是项目内的同名字段，将覆盖原方法
     */
    element?: SMap<any>;

    /**
     * 类型：键值对
     * 
     * 作用：对应ai
     * 若里面是项目内的同名字段，将覆盖原方法
     */
    ai?: SMap<any>;

    /**
     * 类型：键值对
     * 
     * 作用：对应ui
     * 若里面是项目内的同名字段，将覆盖原方法
     */
    ui?: SMap<any>;

    /**
     * 类型：键值对
     * 
     * 作用：对应game
     * 若里面是项目内的同名字段，将覆盖原方法
     */
    game?: SMap<any>;

    /**
     * 类型：键值对
     * 
     * 作用：对应get
     * 若里面是项目内的同名字段，将覆盖原方法
     */
    get?: SMap<any>;

    /**
     * 帮助内容将显示在菜单－选项－帮助中
     * 
     * 游戏编辑器的帮助代码基本示例结构：
     * 
     * "帮助条目":
     * ```jsx
     *  <ul>
     *      <li>列表1-条目1
     *      <li>列表1-条目2
     *  </ul>
     *  <ol>
     *      <li>列表2-条目1
     *      <li>列表2-条目2
     *  </ul>
     * ```
     * (目前可显示帮助信息：mode，extension，card卡包，character武将包)
     */
    help?: SMap<string>;

    /** 扩展中设置武将的名称(id)或技能翻译 */
    translate?: SMap<string>;

    pinyins?: SMap<string[]>;
}