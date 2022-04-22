declare namespace Lib {

    /**
     * 游戏内一些预定义好的sort排序使用的方法
     */
    interface Sort {
        /** 武将排序 */
        character(a: string, b: string): number;
        /** 卡牌排序 */
        card(a: any, b: any): number;
        /** 获取随机数（0-0.5） */
        random(): number;
        /** 玩家排序（优先根据absolute绝对距离排序） */
        seat(a: any, b: any): number;
        /** 玩家排序（根据dataset.position位置排序） */
        position(a: any, b: any): number;
        /** 根据技能/卡牌的priority优先度排序 */
        priority(a: any, b: any): number;
        /** 根据卡牌数字升序排序 */
        number(a: any, b: any): number;
        /** 根据卡牌数字降序排序 */
        number2(a: any, b: any): number;
        /** 根据“_”后名字部分进行字符串排序 */
        capt(a: any, b: any): number;
        /** 根据名字字符串排序 */
        name(a: any, b: any): number;
    }
}