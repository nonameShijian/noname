declare namespace Lib {

    /**
     * 游戏内一些预定义好的sort排序使用的方法
     */
    interface Sort {
        /** 武将排序 */
        character(a: string, b: string): number;
        /** 卡牌排序 */
        card(a: Card, b: Card): number;
        /** 获取随机数（0-0.5） */
        random(): number;
        /** 玩家排序（优先根据absolute绝对距离排序） */
        seat(a: Player, b: Player): number;
        /** 玩家排序（根据dataset.position位置排序） */
        position(a: Player, b: Player): number;
        /** 根据技能/卡牌的priority优先度排序 */
        priority(a: ExSkillData, b: ExSkillData): number;
        /** 根据卡牌数字升序排序 */
        number(a: Card, b: Card): number;
        /** 根据卡牌数字降序排序 */
        number2(a: Card, b: Card): number;
        /** 根据“_”后名字部分进行字符串排序 */
        capt(a: string, b: string): number;
        /** 根据名字字符串排序 */
        name(a: string, b: string): number;
    }
}