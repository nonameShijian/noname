declare namespace Lib {
    /**
     * 作弊（金手指）
     * 
     * 同时也有许多测试用方法；
     * 直接在控制台进行快捷测试；
     */
    interface Cheat {
        /** 将游戏内部的对象暴露到全局中 */
        i(): void;
        /** 让除了“主”之外的自己一个下家立即死亡（die） */
        dy():void;
        x():void;
        cfg():void;
        o():void;
        /**
         * 向牌堆顶添加牌(即创建一些卡牌添加到牌堆里)
         */
        pt(...args:string[]):void;
        q():void;
        /**
         * 替换皮肤
         * @param name 
         * @param i 
         * @param skin 
         */
        p(name, i, skin):void;
        /**
         * 添加测试装备，直接装到目标身上
         * 
         * 参数列表：
         *  itemtype为“player”，则为添加的目标，默认是自己；
         *  其余则使用于game.createCard，创建的卡牌，默认5个装备；
         */
        e(...args):void;
        /** 检测当前游戏开启的武将数，卡堆的数量分布情况 */
        c():void;
        /** 显示场上所有的角色的身份 */
        id():void;
        /** 重新设置当前的选中内容：ui.dialog.buttons[i].link */
        b(...args):void;
        uy(me):void;
        gs(name, act):void;
        gc(name, act):void;
        /** 进入快速自动测试模式，打开历史记录（应该是用于技能快速测试是否出错） */
        a(bool?:boolean):void;
        /** 临时去掉“自动测试模式”，要关闭，需要再执行一次lib.cheat.a */
        as():void;
        /**
         * 默认装备“qilin”，并且下家玩家对你发动“jiedao”
         */
        uj():void;
        /**
         * 下家对你使用一张牌
         * 
         * 参数列表：
         *  itemtype为“player”，重新设置对你使用杀的源玩家，默认是下家；
         *  object对象，{name: , suit: , number: , nature: }
         *  string对象，直接{name:xxx} ，若没设置到卡牌，默认使“sha”
         *  array对象，设置targets,即卡牌的使用目标，默认是自己game.me;
         */
        u():void;
        r(bool):void;
        /**
         * 打印目标玩家的手牌
         * @param player 
         */
        h(player:Player):void;
        /** 
         * 给自己立刻添加手牌：
         * 
         * 格式：
         * 1."card名"；
         * 2."card名1",属性1,"card名2",属性2,... （可用过这种方式一次性创建需要的手牌）
         */
        g(...args):void;
        /** 添加指定类型的牌到手牌（尽量不要用，会添加到不属于当前模式的牌） */
        ga(type):void;
        /** 给所有玩家立刻添加一张指定的牌 */
        gg(...args:string[]):void;
        /**
         * 给目标立即添加一张手牌
         * @param name card的名字
         * @param target 目标玩家，默认是自己
         */
        gx(name:string, target?:Player):void;
        /** 创建一张卡牌（不属于任何地方） */
        gn(name):void;
        /** 创建5张武器，并且立刻添加到目标手牌 */
        ge(target?:Player):void;
        /** 创建几张延时锦囊判定牌加入手中 */
        gj():void;
        gf():void;
        /** 立刻获取牌堆顶n张牌 */
        d(num?:number, target?:Player):void;
        /** 给自己立刻添加技能 */
        s(...args:string[]):void;
        /**
         * 弃置指定位置玩家所有牌
         * @param num 从自己开始算起，自己为0，不填默认所有玩家
         */
        t(num?:number):void;
        /** 除玩家自己以外其他玩家弃置所有牌 */
        to():void;
        /** 弃置玩家所有牌 */
        tm():void;
        /**
         * 指定一个目标，弃置所有牌，血量变1，并且自己获得一张"juedou"
         * @param i 从自己开始算起，自己为0，不填默认1，即自己下家
         */
        k(i?:number):void;
        /** 重新设置当前的主公 */
        z(name:string):void;
    }
}