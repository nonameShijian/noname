declare namespace Lib.element {
    /**
     * 游戏内自定义的content
     * 所有content的参数列表都是：
     * event, step, source, player, target, targets, card, cards, skill, forced, num, trigger, result, _status, lib, game, ui, get, ai
     * 当前使用任意参数的方式
     * 来源：lib.element.content
     * 注：当前游戏内自定义的content，大部分
     */
    interface Content {
        /**
         * 无处理方法，直接触发事件名
         */
        emptyEvent():void
        chooseToDuiben(): any;
        chooseToPSS(): any;
        cardsDiscard(): any;
        chooseToEnable(): any;
        chooseToDisable(): any;
        swapEquip(): any;
        disableEquip(): any;
        enableEquip(): any;
        disableJudge(): any;
        /*----分界线----*/
        phasing(): any;
        toggleSubPlayer(): any;
        exitSubPlayer(): any;
        callSubPlayer(): any;
        reverseOrder(): any;
        addJudgeCard(): any;
        equipCard(): any;
        /**
         * 游戏抽牌
         * （抽牌阶段）
         */
        gameDraw(): any;
        /**
         * 阶段循环
         */
        phaseLoop(): any;
        loadPackage(): any;
        loadMode(): any;
        forceOver(): any;
        /**
         * 并排多个同阶段触发的技能
         */
        arrangeTrigger(): any;
        /**
         * 创建触发的技能的事件：“技能名”s
         */
        createTrigger(): any;
        playVideoContent(): any;
        /**
         * 等待玩家
         */
        waitForPlayer(): any;
        replaceHandcards(): any;
        replaceHandcardsOL(): any;
        phase(): any;
        phaseJudge(): any;
        phaseDraw(): any;
        phaseUse(): any;
        phaseDiscard(): any;
        chooseToUse(): any;
        chooseToRespond(): any;
        /**
         * 选择弃牌
         */
        chooseToDiscard(): any;
        chooseToCompareMultiple(): any;
        chooseToCompare(): any;
        chooseSkill(): any;
        discoverCard(): any;
        chooseButton(): any;
        chooseCardOL(): any;
        chooseButtonOL(): any;
        chooseCard(): any;
        chooseTarget(): any;
        chooseCardTarget(): any;
        chooseControl(): any;
        chooseBool(): any;
        chooseDrawRecover(): any;
        choosePlayerCard(): any;
        discardPlayerCard(): any;
        gainPlayerCard(): any;
        showHandcards(): any;
        showCards(): any;
        viewCards(): any;
        moveCard(): any;
        useCard(): any;
        useSkill(): any;
        draw(): any;
        discard(): any;
        respond(): any;
        swapHandcards(): any;
        gainMultiple(): any;
        gain(): any;
        lose(): any;
        damage(): any;
        recover(): any;
        loseHp(): any;
        doubleDraw(): any;
        loseMaxHp(): any;
        gainMaxHp(): any;
        changeHp(): any;
        changeHujia(): any;
        dying(): any;
        die(): any;
        equip(): any;
        addJudge(): any;
        judge(): any;
        turnOver(): any;
        link(): any;

        [key:string]:any;
    }
}