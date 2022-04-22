declare namespace UI {

    interface Click {
        /** 点击身份icon */
        identitycircle(): void;
        /** 联机约战 */
        connectEvents(): void;
        connectClients(): void;
        //切换皮肤相关
        autoskin(): any;
        skin(avatar, name, callback): any;
        /**
         * 标记自己当前触摸弹出某些面板 的状态
         * @param forced 
         */
        touchpop(forced): any;
        exit(): any;
        shortcut(show): any;
        favouriteCharacter(e): any;
        buttonnameenter(): any;
        buttonnameleave(): any;
        identity(e): any;
        identity2(): any;
        roundmenu(): any;
        pausehistory(): any;
        pauseconfig(): any;
        /** 牌堆信息：轮数，剩余牌数，棋牌堆 */
        cardPileButton(): any;
        chat(): any;
        volumn(): any;
        volumn_background(e): any;
        volumn_audio(e): any;
        hoverpopped(): any;
        hoverpopped_leave(): any;
        leavehoverpopped(): any;
        dierevive(): any;
        dieswap(): any;
        dieswap2(): any;
        checkroundtranslate(translate): any;
        checkdialogtranslate(translate, dialog): any;
        
        //游戏内的核心触摸/点击事件，有关选牌的逻辑，主要就跟这里相关
        touchconfirm(): void;
        windowtouchstart(e:TouchEvent): void;
        windowtouchmove(e:TouchEvent): void;
        windowtouchend(e:TouchEvent): void;
        windowmousewheel(e:MouseEvent): void;
        windowmousemove(e:MouseEvent): void;
        windowmousedown(e:MouseEvent): void;
        cardtouchstart(e:TouchEvent): void;
        cardtouchmove(e:TouchEvent): void;
        windowmouseup(e:MouseEvent): void;
        mousemove(): void;
        mouseenter(): void;
        mouseleave(): void;
        mousedown(): void;
        mouseentercancel(): void;
        
        /** 悬空显示玩家信息 */
        hoverplayer(e): void;
        /** 长按相关 */
        longpressdown(e): void;
        longpresscallback(): void;
        longpresscancel(): void;
        
        window(): any;
        toggle(): any;
        editor(): any;
        switcher(): any;
        choice(): any;
        /**
         * 【核心】点击按钮事件（这里的按钮指的是游戏内操作的,不是其他功能，系统按钮）
         */
        button(e?:TouchEvent|MouseEvent): void;
        touchintro(): any;
        /**
         * 【核心】卡牌的点击事件
         * 
         * 如果主动调用，有唯一参数：'popequip':看起来，好像时强制不执行ui.click.intro;
         * 否则，作为事件方法注册，默认为触摸/点击事件；
         */
        card(e?:TouchEvent|MouseEvent|string): void;
        avatar(): any;
        avatar2(): any;
        /** 点击玩家（与target一致） */
        player(): void;
        /**
         * 【核心】点击玩家事件
         * @param e 触摸或者点击事件
         */
        target(e?:TouchEvent|MouseEvent): void;
        control2(): any;
        /**
         * 【核心】control的选项的点击事件
         */
        control(): void;
        /** 弹出的control/多项选项 */
        dialogcontrol(): void;
        /**
         * 【核心】点击技能事件
         * @param skill 技能的key
         */
        skill(skill:string): void;
        /**
         * 【核心】确认
         * 
         * 用与确认面板的点击，更多可用于ai自动进行点击操作（直接调用），或者其他直接视为ok的操作
         * @param node 如果直接使用，则传入一个操作的面板，视为点了确认关闭面板
         */
        ok(node?:HTMLDivElement|TouchEvent|MouseEvent): void;
        /**
         * 【核心】取消
         * 
         * 用与取消面板的点击，更多可用于ai自动进行取消操作（直接调用），或者其他直接视为cancel的操作
         * @param node 如果直接使用，则传入一个操作的面板，视为点了确认关闭面板
         */
        cancel(node?:HTMLDivElement|TouchEvent|MouseEvent): void;
        logv(e): any;
        logvleave(): any;
        charactercard(name, sourcenode, noedit, resume, avatar): any;
        /** 打开信息阅览面板 */
        intro(e): HTMLDivElement;
        intro2(): void;
        /** 自动托管 */
        auto(): void;
        /** 是否响应无懈 */
        wuxie(): void;
        tempnowuxie(): any;
        /** 暂停场景 */
        pause(): void;
        /** 解除暂停 */
        resume(e:UIEvent): boolean;
        config(): any;
        swap(): any;
        mousewheel(evt): any;
        touchStart(e): any;
        
        //弹出面板dialog拖动相关事件
        dialogtouchStart(e): any;
        touchScroll(e): any;
        dragtouchdialog(e): any;
        
        autoskill(bool, node): any;
        /** 配置中，技能“自动发动”选项中的操作事件 */
        skillbutton(): any;
        autoskill2(e): any;
        rightplayer(e): any;
        right(e): any;
    }
}