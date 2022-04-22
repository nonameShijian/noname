declare namespace Lib.element {

    /** 控制面板：位于玩家操作面板上方位置，主要时提供选项操作 */
    interface Control extends HTMLDivElement {
        /**
         * 打开控制面板
         * 
         * 打开的面板添加到ui.controls中
         */
        open(): Control;
        /**
         * 为控制面板添加一个选项
         * 
         * 为该选项设置点击事件：ui.click.control
         * @param item 主要是字符串类型的选项，该item会被保存在node.link，通过get.translation，设置描述（目前来看只有string类型）
         */
        add(item: string): void;
        /**
         * 关闭控制面板
         * 
         * 关闭的面板从ui.controls移除
         */
        close(): void;
        /**
         * 重新设置面板内容
         * 
         * 其中，item参数列表：可以是任意参数，可以是一个数组（其实就是把任意参数用数组包起来）
         *  function类型：设置control.custom，设置选项点击后的方法；
         *  其他类型（目前来看选项只有string类型）：
         *      使用control.add，设置面板的选项；
         */
        replace(...item): Control;
    }
}