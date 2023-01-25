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
         * 无处理方法，直接触发事件名
         */
        emptyEvent(): void;
        chooseToPlayBeatmap(): void;
        chooseToMove(): void;
        showCharacter(): void;
        removeCharacter(): void;
        chooseUseTarget(): void;
        chooseToDuiben(): void;
        chooseToPSS(): void;
        cardsDiscard(): void;
        orderingDiscard(): void;
        cardsGotoOrdering(): void;
        cardsGotoSpecial(): void;
        chooseToEnable(): void;
        chooseToDisable(): void;
        swapEquip(): void;
        disableEquip(): void;
        enableEquip(): void;
        disableJudge(): void;
        enableJudge(): void;
        phasing(): void;
        toggleSubPlayer(): void;
        exitSubPlayer(): void;
        callSubPlayer(): void;
        addExtraTarget(): void;
        reverseOrder(): void;
        addJudgeCard(): void;
        equipCard(): void;
        gameDraw(): void;
        phaseLoop(): void;
        loadPackage(): void;
        loadMode(): void;
        forceOver(): void;
        arrangeTrigger(): void;
        createTrigger(): void;
        playVideoContent(): void;
        waitForPlayer(): void;
        replaceHandcards(): void;
        replaceHandcardsOL(): void;
        phase(): void;
        phaseJudge(): void;
        phaseDraw(): void;
        phaseUse(): void;
        phaseDiscard(): void;
        chooseToUse(): void;
        chooseToRespond(): void;
        chooseToDiscard(): void;
        /** 【v1.9.117.1】 用于同时多人弃牌（如神甘宁〖魄袭〗和夏侯玄〖清议〗） */
        discardMultiple(): void;
        chooseToCompareLose(): void;
        /** 【v1.9.116.3】 修复一个导致chooseToCompareMultiple事件的AI无法正常结算的严重bug */
        chooseToCompareMultiple(): void;
        chooseToCompare(): void;
        chooseSkill(): void;
        discoverCard(): void;
        chooseButton(): void;
        chooseCardOL(): void;
        chooseButtonOL(): void;
        chooseCard(): void;
        chooseTarget(): void;
        chooseCardTarget(): void;
        chooseControl(): void;
        chooseBool(): void;
        chooseDrawRecover(): void;
        choosePlayerCard(): void;
        discardPlayerCard(): void;
        gainPlayerCard(): void;
        showHandcards(): void;
        showCards(): void;
        viewCards(): void;
        moveCard(): void;
        useCard(): void;
        useSkill(): void;
        draw(): void;
        discard(): void;
        loseToDiscardpile(): void;
        respond(): void;
        swapHandcards(): void;
        swapHandcardsx(): void;
        gainMultiple(): void;
        gain(): void;
        addToExpansion(): void;
        lose(): void;
        damage(): void;
        recover(): void;
        loseHp(): void;
        doubleDraw(): void;
        loseMaxHp(): void;
        gainMaxHp(): void;
        changeHp(): void;
        changeHujia(): void;
        dying(): void;
        die(): void;
        equip(): void;
        addJudge(): void;
        judge(): void;
        turnOver(): void;
        link(): void;
        chooseToGuanxing(): void;

        [key: string]: () => void;
    }
}