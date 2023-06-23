declare namespace Lib.element {
    /**
     * 游戏内自定义的content
     * 
     * 所有content的参数列表都是：
     * 
     * event, step, source, player, target, targets, card, cards, skill, forced, num, trigger, result, _status, lib, game, ui, get, ai
     * 
     * 当前使用任意参数的方式
     * 
     * 来源：lib.element.content
     * 
     * 注：当前游戏内自定义的content，大部分
     */
    interface Content {
        /**
         * 【v1.9.121】议事 (议笨)
         */
        chooseToDebate: ContentFuncByAll;
        /**
         * 无处理方法，直接触发事件名
         */
        emptyEvent: ContentFuncByAll;
        /**
         * 【v1.9.121】游戏暂停也有evt了
         */
        delay: ContentFuncByAll;
        /**
         * 【v1.9.120.1】协力
         */
        chooseCooperationFor: ContentFuncByAll;
        chooseToPlayBeatmap: ContentFuncByAll;
        chooseToMove: ContentFuncByAll;
        showCharacter: ContentFuncByAll;
        removeCharacter: ContentFuncByAll;
        chooseUseTarget: ContentFuncByAll;
        chooseToDuiben: ContentFuncByAll;
        chooseToPSS: ContentFuncByAll;
        cardsDiscard: ContentFuncByAll;
        orderingDiscard: ContentFuncByAll;
        cardsGotoOrdering: ContentFuncByAll;
        cardsGotoSpecial: ContentFuncByAll;
        chooseToEnable: ContentFuncByAll;
        chooseToDisable: ContentFuncByAll;
        swapEquip: ContentFuncByAll;
        disableEquip: ContentFuncByAll;
        enableEquip: ContentFuncByAll;
        disableJudge: ContentFuncByAll;
        enableJudge: ContentFuncByAll;
        phasing: ContentFuncByAll;
        toggleSubPlayer: ContentFuncByAll;
        exitSubPlayer: ContentFuncByAll;
        callSubPlayer: ContentFuncByAll;
        addExtraTarget: ContentFuncByAll;
        reverseOrder: ContentFuncByAll;
        addJudgeCard: ContentFuncByAll;
        equipCard: ContentFuncByAll;
        gameDraw: ContentFuncByAll;
        phaseLoop: ContentFuncByAll;
        loadPackage: ContentFuncByAll;
        loadMode: ContentFuncByAll;
        forceOver: ContentFuncByAll;
        arrangeTrigger: ContentFuncByAll;
        createTrigger: ContentFuncByAll;
        playVideoContent: ContentFuncByAll;
        waitForPlayer: ContentFuncByAll;
        replaceHandcards: ContentFuncByAll;
        replaceHandcardsOL: ContentFuncByAll;
        phase: ContentFuncByAll;
        phaseJudge: ContentFuncByAll;
        phaseDraw: ContentFuncByAll;
        phaseUse: ContentFuncByAll;
        phaseDiscard: ContentFuncByAll;
        chooseToUse: ContentFuncByAll;
        chooseToRespond: ContentFuncByAll;
        chooseToDiscard: ContentFuncByAll;
        /** 【v1.9.117.1】 用于同时多人弃牌（如神甘宁〖魄袭〗和夏侯玄〖清议〗） */
        discardMultiple: ContentFuncByAll;
        chooseToCompareLose: ContentFuncByAll;
        /** 【v1.9.116.3】 修复一个导致chooseToCompareMultiple事件的AI无法正常结算的严重bug */
        chooseToCompareMultiple: ContentFuncByAll;
        chooseToCompare: ContentFuncByAll;
        chooseSkill: ContentFuncByAll;
        discoverCard: ContentFuncByAll;
        chooseButton: ContentFuncByAll;
        chooseCardOL: ContentFuncByAll;
        chooseButtonOL: ContentFuncByAll;
        chooseCard: ContentFuncByAll;
        chooseTarget: ContentFuncByAll;
        chooseCardTarget: ContentFuncByAll;
        chooseControl: ContentFuncByAll;
        chooseBool: ContentFuncByAll;
        chooseDrawRecover: ContentFuncByAll;
        choosePlayerCard: ContentFuncByAll;
        discardPlayerCard: ContentFuncByAll;
        gainPlayerCard: ContentFuncByAll;
        showHandcards: ContentFuncByAll;
        showCards: ContentFuncByAll;
        viewCards: ContentFuncByAll;
        moveCard: ContentFuncByAll;
        useCard: ContentFuncByAll;
        useSkill: ContentFuncByAll;
        draw: ContentFuncByAll;
        discard: ContentFuncByAll;
        loseToDiscardpile: ContentFuncByAll;
        respond: ContentFuncByAll;
        swapHandcards: ContentFuncByAll;
        swapHandcardsx: ContentFuncByAll;
        gainMultiple: ContentFuncByAll;
        gain: ContentFuncByAll;
        addToExpansion: ContentFuncByAll;
        lose: ContentFuncByAll;
        damage: ContentFuncByAll;
        recover: ContentFuncByAll;
        loseHp: ContentFuncByAll;
        doubleDraw: ContentFuncByAll;
        loseMaxHp: ContentFuncByAll;
        gainMaxHp: ContentFuncByAll;
        changeHp: ContentFuncByAll;
        changeHujia: ContentFuncByAll;
        dying: ContentFuncByAll;
        die: ContentFuncByAll;
        equip: ContentFuncByAll;
        addJudge: ContentFuncByAll;
        judge: ContentFuncByAll;
        turnOver: ContentFuncByAll;
        link: ContentFuncByAll;
        chooseToGuanxing: ContentFuncByAll;

        [key: string]: ContentFuncByAll;
    }
}