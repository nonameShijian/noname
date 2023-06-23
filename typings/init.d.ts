declare namespace Lib {
    /** 游戏初始化相关的一些方法 */
    interface Init {
        /** 游戏初始化 */
        init(): void;
        /** 游戏重置 */
        reset(): void;
        /** 主要时游戏UI的加载，和是否直接进入默认玩法模式，还是进入开始界面 */
        onload(): void;
        
        /** 
         * 一般在模块初始化start中调用，执行保存在lib.onfree中的一些方法，
         * 目前看来，这些方法都是UI的等待处理，估计是为了预加载之类，具体暂时不太明了 
         */
        onfree(): void;

        //网络相关
        startOnline(): void;
        connection(ws: any): void;
        req(str: any, onload: any, onerror: any, master: any): void;
        json(url: any, onload: any, onerror: any): void;

        /**
         * 创建<style>元素定义的样式表
         * @param args 样式字符串
         */
        sheet(...args): HTMLStyleElement;
        /**
         * 创建<link>元素加载的样式表
         * @param path 文件路径
         * @param file css文件名
         * @param before 若是方法，则注册“load”事件，设置before作为回调；若是元素，则将生成的style插入到"head"的该元素之后
         */
        css(path: string, file: string, before?: Function|HTMLElement): HTMLLinkElement;
        css(): HTMLLinkElement;
        /**
         * 读取外部加载js (动态加载js扩展)
         * 
         * 【v1.9.122】增加检测加密扩展js的内容
         * @param path 路径
         * @param file 文件名，数组的话，就是读取一些列该路径下的文件
         * @param onload 加载成功回调
         * @param onerror 加载失败回调
         */
        js(path: string, file: string, onload: () => void, onerror: () => void): HTMLScriptElement;
        js(path: string, file: string[], onload: () => void, onerror: () => void): void;
        js(path: string, file: string): HTMLScriptElement;
        js(path: string, file: string[]): void;
		/**
		 * 读取外部加载模块js
		 * @param path 路径
		 * @param file 文件名，数组的话，就是读取一些列该路径下的文件
		 * @param onload 加载成功回调
		 * @param onerror 加载失败回调
		 */
		moduleJs(path: string, file: string, onload?: () => void, onerror?: () => void): HTMLScriptElement;
        moduleJs(path: string, file: string[], onload?: () => void, onerror?: () => void): void;
        moduleJs(path: string, file: string): HTMLScriptElement;
        moduleJs(path: string, file: string[]): void;
        //初始化UI的样式
        cssstyles(): void;
        layout(layout: any, nosave?: any): void;
        background(): void;

        /** 转换content方法（即内部带有step的方法），返回转换后的函数的方法 */
        parsex(func: Function): Function;
        /** 
         * @deprecated 转换content方法（即内部带有step的方法）,返回转换后的方法
         **/
        parse(func: Function): ContentFunc;
        /** 使用eval立即执行该传入参数（若参数是方法，则使用原生eval立即执行；若参数是一个对象，则遍历调用eval；若都不是则返回参数本身） */
        eval(func: Function|Object): any;
        /**  base-64编码 */
        encode(strUni: string): string;
        /**  base-64解码 */
        decode(str: string): string;

        //项目内没用上
        /** 将（json）对象转换成json字符串 */
        stringify(obj: Object): string;
        /** 将（json）对象转换成json字符串2（带换行，应该是用于将配置格式化字符串输出） */
        stringifySkill(obj: Object): string;


        /** cordova库，用于移动端 */
        cordovaReady?:any;
    }

}