declare namespace Lib.element {
    /**
     * 卡牌card
     * 
     * 游戏内使用的卡牌
     */
    export interface Card {
        /**
         * 初始化card
         * @param card 
         */
        init(card: CardBaseUIData | CardBaseData): Card;
        /**
         * 将当前card，添加到排除列表event._aiexclude中
         */
        aiexclude(): void;
        
        //暂时没用上，暂不知其具体是什么功能
        getSource(name: string): boolean;
        
        //card的UI，动画操作
        updateTransform(bool: boolean, delay: number): void;
        moveDelete(player: Player): void;
        moveTo(player: Player): Card;
        
        /** 
         * 复制一个当前卡牌节点（即复制当前卡牌的副本） 
         * 
         * 参数列表：
         *  string类型：为card的css，class类型（以后慢慢总结出来）；
         *  objtype类型：为div，则为position，要添加进去的区域；
         *  boolean类型：设置clone为true，将会添加到当前复制对象的clone属性上
         * 
         * 注：该复制卡牌节点基础属性：[name,suit,number,node,moveTo(),moveDelete()];
         */
        copy(...args): Card;
        copy(isClone?:boolean):Card;

        /**
         * 设置当前card为“uncheck”（不可检测的时机）
         * @param skill 将指定skill加入_uncheck列表
         */
        uncheck(skill?: string): void;
        /**
         * 移除当前card的“uncheck” 
         * @param skill 将指定skill移除出_uncheck列表
         */
        recheck(skill?: string): void;
        /**
         * 卡牌弃置，
         * 默认弃置到弃牌堆里
         * 若bool为true时，则将其加入牌组中随机位置；
         * 否则设置将该card加入到_status.discarded中
         * @param bool 是否将其弃置回牌组中
         */
        discard(bool: boolean): void;
        /**
         * 检测当前card是否有指定tag
         * @param tag 
         */
        hasTag(tag: string): boolean;
        /**
         * 判断该牌，是否在h（手牌），e（装备），j（判定）区域中
         */
        hasPosition(): boolean;
        /** 判断当前card是否在“c”（抽卡堆），“d”（弃牌堆）里 */
        isInPile(): boolean;

        //卡牌标记cardtag（与模式——应变模式相关）【v1.9.107】
        hasTag(tag:string):boolean;

        //添加手牌标记（gaintag）机制，用于对玩家的特定手牌进行标记 【v1.9.108.3】
        /**
         * 添加手牌标记
         * @param gaintag 
         */
        addGaintag(gaintag:string):void;
        /**
         * 删除手牌标记(单独当前卡牌移除)
         * @param gaintag 若取值为true，则移除当前card所有gaintag；若存在该gaintag,则移除；
         */
        removeGaintag(tag:string):void;
        removeGaintag(tag:boolean):void;
        /**
         * 检测card上是否有指定手牌标记
         * @param tag 
         */
        hasGaintag(tag:boolean):boolean;
    }

    export interface Card extends HTMLDivElement,IButtonLink,CardBaseUIData {
        /** 卡牌id */
        cardid:string;
        /** 卡牌名 */
        name:string;
        /** 卡牌花色 */
        suit:string;
        /** 卡牌数值 */
        number:number;
        /** 伤害属性 */
        nature:string;

        //【1.9.98】
        /** 失去的卡牌来源,e装备,j判定,h手牌，非以上3个区域，则为null（只在lose事件链中存在） */
        original:string;
        
        //【1.9.98.2】新增方法 by2020-3-5
        /**
         *  这张牌是否为【转化】的卡牌(视为牌)
         * 
         * 最终确定：是非转化牌，包括“视为使用”的虚拟牌；
         * 
         * 
         * 注1：
         * 在get.autoViewAs中，非autoViewAs：
         *  isCard为true，或者是card的情况下，返回一个card信息，其isCard默认为true，没有cards，自身为cards；
         *  若不是，只是普通的map对象，无cards参数，且当前存在cards情况下，返回携带该cards的card信息；
         *  都不是，则按原来输出；
         * 
         * 注2：
         * 在useCard中，if(cards.length&&!card.isCard) 下，视为则显示出其使用cards牌文本；
         * 否则，不是作为视为，不显示对应cards文本；
         * 故，该标记，在一些“直接视为使用了xxxx牌”的技能内，也使用isCard:true，是因为，这些技能都没有使用到任何卡牌，不需要显示则设置；
         * 即，为了不显示使用牌的文本时，可设置isCard（作为不显示标记）；
         * 
         * 上面说法错了，应该是，虚拟牌可以设置不是转化，使用了isCard为true，即不是转化牌，即{name:'xxx',isCard:true};【具体操作在useCard中】
         */
        isCard:boolean;

        /** 
         * card的dataset:储存数据
         * 其实质是html节点自带DOMStringMap，用于存储携带数据信息
         */
        dataset:{
            /**
             * 是否可对多个目标使用
             * 其值：“1”，“0”
             */
            cardMultitarget: string;
            /** 卡牌名 */
            cardName: string;
            /** 卡牌子类型 */
            cardSubype: string;
            /** 卡牌类型 */
            cardType: string;

            [name: string]: string | undefined;
        };
        
        /** 当前card上主要挂载的UI节点（node主要是作为保存引用的map） */
        node:{
            /** 名字（左上角） */
            name:HTMLDivElement;
            /** 不显示，记录卡牌的信息文本（例如：花色，数字，进攻，防御距离......） */
            name2:HTMLDivElement;
            /** 右上角信息（默认花色 数字） */
            info:HTMLDivElement;
            /** 卡面 */
            image:HTMLDivElement;
            /** 背景 */
            background:HTMLDivElement;
            /** 化身 */
            avatar:HTMLDivElement;
            /** 边框背景（边框） */
            framebg:HTMLDivElement;
            /** 额外添加信息（右下角） */
            addinfo:HTMLDivElement;
            /** 不明 */
            intro:HTMLDivElement;
            /** 范围，卡牌是装备类型时，右下角显示距离（正常情况下和addinfo冲突） */
            range:HTMLDivElement;
            /** 手牌标记【v1.9.108.3】 */
            gaintag:HTMLDivElement;
        };
        
        link:Card;

        /** 缓存的当前卡牌的复制卡牌 */
        clone:Card;

        //添加手牌标记（gaintag）机制，用于对玩家的特定手牌进行标记 【v1.9.108.3】
        /** 手牌标记 */
        gaintag:string[];

        [key:string]:any;
    }
}