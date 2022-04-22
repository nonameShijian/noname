declare namespace UI {

    interface Create {
        /**
         * 创建一个div
         * 
         * 其参数列表：
         *  若为div，table，tr，td，body等这些类型html节点对象，则设置为position，即创建div即将插入到的父节点；
         *  若为number类型，则设置为position2，即将创建的div插入到position的第n个子节点之前；
         *  若为“divposition”类型，则设置为divposition，即设置div的坐标位置；
         *  若为“object”类型（即json格式对象），则设置为style，即设置div的style；
         *  若为“function”类型，则设置为listen，即设置该div的“点击/触摸”事件的回调方法；
         */
        div(...args): HTMLDivElement;
        filediv(): any;
        node(): any;
        /** 创建iframe */
        iframe(src:string): void;
        identitycircle(list, target): void;
        //联机相关（联机房间）
        chat(): void;
        exit(): void;
        connecting(bool): void;
        roomInfo(): void;
        templayer(time): void;
        /** 创建select */
        selectlist(list, init, position, onchange): HTMLSelectElement;
        /**
         * 【核心】创建游戏菜单
         * （内部过于复杂，似乎时8000多行代码的一个方法，暂时UI方面看不懂）
         * @param connectMenu 
         */
        menu(connectMenu:SelectConfigData): void;
        /** 创建table */
        table(): HTMLTableElement;
        /** 投降的system选项 */
        giveup(): void;
        /** 势力选择控制面板（配合武将选择面板使用） */
        groupControl(dialog:Lib.element.Dialog): Lib.element.Control;
        //卡牌选则面板（stone玩法里面有使用）
        cardDialog(): Lib.element.Dialog;
        //武将选则面板（就是游戏开始的那个选将面板）
        characterDialog2(filter): Lib.element.Dialog;
        characterDialog(): Lib.element.Dialog;
        /**
         * 创建弹出面板
         * 
         * item参数列表：
         *  boolean类型：设置dialog.static；
         *  特殊string类型：
         *      'hidden'：设置创建该面板不open，而是隐藏起来，默认是直接执行open；
         *      'notouchscroll'：设置该面板不可拖动（现在面板默认是可以随意拖动的）；
         *      'forcebutton'：非常核心的一个设置，暂时不清楚具体作用，字面上是强制选项？
         *  非以上类型，则参考Dialog的add方法的item参数列表：有string，div,cards,players,和自由配置的混合数组生成按钮；
         */
        dialog(...item): Lib.element.Dialog;
        //应该是和config配置相关的
        line2(): HTMLDivElement;
        line(): HTMLDivElement;
        switcher(name, current, current2): HTMLDivElement;
        /**
         * 生成一个显示html文档的div（html文档格式的说明文本）
         * @param str 
         * @param position 要添加进去的目标位置
         */
        caption(str:string, position:HTMLElement): HTMLDivElement;
        /**
         * 创建控制面板
         * 
         * 创建一个新的控制面板，保存在ui.controls；
         * 其中，item参数列表：可以是任意参数，可以是一个数组（其实就是把任意参数用数组包起来）
         *  function类型：设置control.custom，设置选项点击后的方法；
         *  特定的string类型：
         *      'nozoom'：暂时没有
         *      'stayleft'：显示到左边，否则，默认显示在中间；
         *  其他类型（目前来看选项只有string类型）：
         *      使用control.add，设置面板的选项；
         */
        control(...item): Lib.element.Control;
        /**
         * 创建确认/取消控制面板
         * 
         * 重设或者创建ui.confirm
         * @param str 设置按钮：'o'：只有“ok”选项，'oc'/'co'：有“ok”和“cancel”选项，'c'：只有“cancel”选项
         * @param func 设置按钮设置点击后的方法
         */
        confirm(str:string, func:(link:any,node:Lib.element.Control)=>void): void;
        //创建技能的控制面板
        skills(skills):  Lib.element.Control;
        skills2(skills): Lib.element.Control;
        skills3(skills):  Lib.element.Control;
        /** 创建游戏场景arena （核心UI）*/
        arena(): void;
        /** 创建游戏的system区域 */
        system(str, func, right, before): HTMLDivElement;
        /** 创建显示“已暂停”背景区域 */
        pause(): HTMLDivElement;
        /**
         * 创建预加载按钮（还没完全确定）
         * 先预先创建好node节点，将其保存在_status.prebutton中，保存到lib.onfree,在后面activate激活按钮
         * @param item 
         * @param type 
         * @param position 
         * @param noclick 
         */
        prebutton(item:any, type:string, position:HTMLDivElement, noclick?:boolean): HTMLDivElement;
        /**
         * 创建按钮
         * 
         * type类型与item内容：
         *  blank：对应item为card，效果：不显示卡面，显示背面；
         *  card：对应item为card，效果：展示卡牌；
         *  vcard：对应item为string,则是卡牌名；否则类型为CardBaseUIData或者CardBaseUIData2，效果：展示虚构卡牌（非卡堆里的）；
         *  character：对应item为string,则是武将名，效果：展示武将并附带一个功能按钮；
         *  characterx: 对应item为string,则是武将名，效果：展示同名武将，切换同名武将，同名武将配置：lib.characterReplace【v1.9.106.3】；
         *  player：对应的item为Player，则是玩家，效果：展示玩家的武将；
         *  text：对应的item为“html文档文本”，则是html文档的显示，效果：展示这段文档；
         *  textButton：对应的item为“html文档文本”，则是html文档的显示，效果：应该是按钮功能的文本，例如链接，暂不明确，待后期观察
         * @param item 按钮保存的信息内容（根据type不同对应的item也不同）
         * @param type 按钮类型：blank，card，vcard，character，player，text，textButton
         * @param position 位置,即生成的按钮父节点
         * @param noclick 
         * @param node 可以是已经存在的或者创建好的按钮节点（用途不大，有点多余）
         */
        button(item:any, type:string, position:HTMLElement, noclick?:boolean, node?:HTMLDivElement): Button;
        /**
         * 创建按钮（多个）
         * @param list 要创建的按钮的信息列表（建议同类型集合，为了对应type）
         * @param type 按钮类型：参考button方法，额外，可以增加“pre”前缀，创建prebutton按钮
         * @param position 与button一致
         * @param noclick 语button一致
         * @param zoom 没用到，无用参数
         */
        buttons(list:any[], type:string, position:HTMLElement, noclick?:boolean, zoom?:any): Button[];
        player(position, noclick): any;
        connectPlayers(ip): any;
        players(num): any;
        me(hasme): any;
        card(position, info, noclick): any;
        cardsAsync(): any;
        cards(ordered): any;

        //【v1.9.105.9~】增加评级系统：
        /** 为当前显示选项，添加评级相关UI */
        rarity(button:Button):void;
    }


    /**
     * 由ui.create.arena创建的场景；
     * 目前列出一些场景的常规操作，
     * 便于后面可直接使用
     */
    // interface arena extends HTMLDivElement {
    //     /** 设置显示人数 */
    //     setNumber(num);
    // }
}