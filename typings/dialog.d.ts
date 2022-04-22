declare namespace Lib.element {
    /**
     * 会话弹窗
     */
    interface Dialog extends HTMLDivElement {
        /**
         * 添加信息到会话面板中
         * 
         * item类型：
         *  若为字符串类型string,若有“###”，则执行addText显示余下的文本；
         *  若为“div”类型，则将其添加进content中；
         *  若为“cards”类型，则添加生成卡牌列表按钮；
         *  若为“players”类型，则添加生成玩家武将列表按钮；
         *  若不是以上类型，则是[button的item或者list,button的type]数组，添加生成对应的按钮；
         * @param item 添加的信息（有多种类型的信息）
         * @param noclick 是否可点击
         * @param zoom 是否是小型布局“smallzoom”的信息
         * @return 返回item
         */
        add(item: any, noclick?: boolean, zoom?: boolean): any;
        /**
         * 添加文本到会话面板里。
         * 
         * 注：该文本可以是html文档文本，一般用于“说明文本”。
         * @param str 
         * @param center 文本是否居中对齐
         */
        addText(str: string, center?: boolean): Dialog;
        /**
         * 添加“smallzoom”（小型布局）的信息到会话面板中
         * 注：是指就是add的参数zoom默认为true。
         * @param item 添加的信息，具体参考add的参数解析
         * @param noclick 是否可点击
         */
        addSmall(item: any, noclick?: boolean): any;
        /**
         * 根据信息的数量，多于4则执行addSmall，否则执行add
         * @param content 添加的信息，使用该方法，一般是“cards”，“players”，[button的item,button的type]数组类型时调用该方法才有意义
         */
        addAuto(content: any[]): void;
        /**
         * 打开该会话面板
         * 
         * 注：所有的会话面板都会缓存在ui.dialogs中，调用该方法就会是指在ui.dialogs中。
         */
        open(): Dialog;
        /**
         * 关闭该会话面板
         * 
         * 注：并且移除出ui.dialogs中。
         */
        close(): Dialog;
        /**
         * 设置文本到“说明区域”中
         * @param str 
         */
        setCaption(str: string): Dialog;

        [key:string]:any;
    }

    interface Dialog {
        /** 当前面板得按钮列表 */
        buttons:Button[];
    }
}