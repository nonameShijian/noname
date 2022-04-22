declare interface importCardConfig {
    /** 卡牌包名 */
    name: string;
    /** 
     * 类型：布尔值
     * 
     * 作用：设置该卡包是否可以联机 
     * */
    connect?: boolean;

    /** 
     * 类型：键值对
     * 
     * 作用：设置卡牌
     * */
    card: SMap<ExCardData>;

    /** 
     * 类型：键值对
     * 
     * 作用：设置卡牌技能 
     * 
     * @type {SMap<ExSkillData>}
     * */
    skill: SMap<ExSkillData>;
    /** 
     * 类型：数组
     * 
     * 作用：设置从牌堆添加指定卡牌
     * */
    list: CardBaseData[];

    /** 卡牌翻译 */
    translate: SMap<string> | string;

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
}