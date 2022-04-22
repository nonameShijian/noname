/**
 * 游戏内菜单数据配置一览
 */
interface LocalGameConfigMenuData {
    /** 通用 */
    general: {
        name: string,
        config: {
            /** 流畅模式 */
            low_performance: SelectConfigData,
            /** 兼容模式 */
            compatiblemode: SelectConfigData,
            /** 确认退出 */
            confirm_exit: SelectConfigData,
            /** 屏幕常亮 */
            keep_awake: SelectConfigData,
            /** 自动确认 */
            auto_confirm: SelectConfigData,
            /** 不无懈自己 */
            wuxie_self: SelectConfigData,
            /** 不对敌方出桃 */
            tao_enemy: SelectConfigData,
            /** 启用拖拽 */
            enable_drag: SelectConfigData,
            /** 拖拽指示线 */
            enable_dragline: SelectConfigData,
            /** 拖拽指示线 */
            enable_touchdragline: SelectConfigData,
            /** 触屏模式 */
            touchscreen: SelectConfigData,
            /** 滑动手势 */
            swipe: SelectConfigData,
            /** 下划操作 */
            swipe_down: SelectConfigData,
            /** 上划操作 */
            swipe_up: SelectConfigData,
            /** 左划操作 */
            swipe_left: SelectConfigData,
            /** 右划操作 */
            swipe_right: SelectConfigData,
            /** 触屏按钮操作 */
            round_menu_func: SelectConfigData,
            /** 显示开始界面 */
            show_splash: SelectConfigData,
            /** 游戏速度 */
            game_speed: SelectConfigData,
            /** 限制结算速度 */
            sync_speed: SelectConfigData,
            /** 开启震动 */
            enable_vibrate: SelectConfigData,
            /** 右键操作 */
            right_click: SelectConfigData,
            /** 长按显示信息 */
            longpress_info: SelectConfigData,
            /** 右键显示信息 */
            right_info: SelectConfigData,
            /** 悬停显示信息 */
            hover_all: SelectConfigData,
            /** 悬停手牌显示信息 */
            hover_handcard: SelectConfigData,
            /** 悬停菜单弹出时间 */
            hoveration: SelectConfigData,
            /** 双击显示武将资料 */
            doubleclick_intro: SelectConfigData,
            /** 保存录像 */
            video: SelectConfigData,
            /** 最长载入时间 */
            max_loadtime: SelectConfigData,
            /** 滚轮控制手牌 */
            mousewheel: SelectConfigData,
            /** 自动检查游戏更新 */
            auto_check_update: SelectConfigData,
            /** 开发者模式 */
            dev: SelectConfigData,
            /** 出错时停止游戏 */
            errstop: SelectConfigData,
            update(config: any, map: any): any;
        }
    };
    /** 外观 */
    appearence: {
        name: string,
        config: {
            /** 主题 */
            theme: SelectConfigData,
            /** 布局 */
            layout: SelectConfigData,
            /** 角色高度 long */
            player_height: SelectConfigData,
            /** 角色高度 short */
            player_height_nova: SelectConfigData,
            /** 界面缩放 */
            ui_zoom: SelectConfigData,
            /** 游戏背景 */
            image_background: SelectConfigData,
            /** 随机背景 */
            image_background_random: SelectConfigData,
            /** 背景模糊 */
            image_background_blur: SelectConfigData,
            /** 触屏布局 */
            phonelayout: SelectConfigData,
            /** 开启换肤 */
            change_skin: SelectConfigData,
            /** 自动换肤 */
            change_skin_auto: SelectConfigData,
            /** 卡牌样式 */
            card_style: SelectConfigData,
            /** 卡背样式 */
            cardback_style: SelectConfigData,
            /** 体力条样式 */
            hp_style: SelectConfigData,
            /** 角色背景 */
            player_style: SelectConfigData,
            /** 角色边框 */
            border_style: SelectConfigData,
            /** 边框升级方式 */
            autoborder_count: SelectConfigData,
            /** 基础边框颜色 */
            autoborder_start: SelectConfigData,
            /** 边框宽度 */
            player_border: SelectConfigData,
            /** 菜单背景 */
            menu_style: SelectConfigData,
            /** 按钮背景 */
            control_style: SelectConfigData,
            /** 菜单上部高度 */
            custom_button_system_top: SelectConfigData,
            /** 菜单下部高度 */
            custom_button_system_bottom: SelectConfigData,
            /** 技能上部高度 */
            custom_button_control_top: SelectConfigData,
            /** 技能下部高度 */
            custom_button_control_bottom: SelectConfigData,
            /** 圆角大小 */
            radius_size: SelectConfigData,
            /** 当前回合角色高亮 */
            glow_phase: SelectConfigData,
            /** 折叠手牌 */
            fold_card: SelectConfigData,
            /** 折叠模式菜单 */
            fold_mode: SelectConfigData,
            /** 分离选项条 */
            seperate_control: SelectConfigData,
            /** 模糊效果 */
            blur_ui: SelectConfigData,
            /** 玻璃主题 */
            glass_ui: SelectConfigData,
            /** 伤害抖动 */
            damage_shake: SelectConfigData,
            /** 按钮效果 */
            button_press: SelectConfigData,
            /** 喝酒效果 */
            jiu_effect: SelectConfigData,
            /** 游戏特效 */
            animation: SelectConfigData,
            /** 技能特效 */
            skill_animation_type: SelectConfigData,
            /** 阵亡效果 */
            die_move: SelectConfigData,
            /** 目标效果 */
            target_shake: SelectConfigData,
            /** 翻面文字 */
            turned_style: SelectConfigData,
            /** 横置样式 */
            link_style2: SelectConfigData,
            /** 手牌显示 */
            cardshape: SelectConfigData,
            /** 装备显示 */
            textequip: SelectConfigData,
            /** 选将样式 */
            buttoncharacter_style: SelectConfigData,
            /** 鼠标指针 */
            cursor_style: SelectConfigData,
            /** 人名字体 */
            name_font: SelectConfigData,
            /** 身份字体 */
            identity_font: SelectConfigData,
            /** 卡牌字体 */
            cardtext_font: SelectConfigData,
            /** 界面字体 */
            global_font: SelectConfigData,
            update(config: any, map: any): any;
        }
    },
    /** 显示 */
    view: {
        name: string,
        config: {
            /** 出牌记录栏 */
            show_history: SelectConfigData,
            /** 自动弹出记录 */
            pop_logv: SelectConfigData,
            /** 历史记录栏 */
            show_log: SelectConfigData,
            /** 自动清除历史记录 */
            clear_log: SelectConfigData,
            /** 历史记录高亮 */
            log_highlight: SelectConfigData,
            /** 显示时间（在屏幕顶部显示当前时间） */
            show_time: SelectConfigData,
            /** 显示时间（在触屏按钮处显示当前时间） */
            show_time2: SelectConfigData,
            /** 表盘样式 */
            watchface: SelectConfigData,
            /** 显示游戏时间 */
            show_time3: SelectConfigData,
            /** 显示状态栏(安卓) */
            show_statusbar_android: SelectConfigData,
            /** 显示状态栏（ios） */
            show_statusbar_ios: SelectConfigData,
            /** 显示出牌信息 */
            show_card_prompt: SelectConfigData,
            /** 隐藏基本牌信息 */
            hide_card_prompt_basic: SelectConfigData,
            /** 隐藏装备牌信息 */
            hide_card_prompt_equip: SelectConfigData,
            /** 显示阶段信息 */
            show_phase_prompt: SelectConfigData,
            /** 出牌阶段提示 */
            show_phaseuse_prompt: SelectConfigData,
            /** 自动弹出选项 */
            auto_popped_config: SelectConfigData,
            /** 自动弹出历史 */
            auto_popped_history: SelectConfigData,
            /** 显示触屏按钮 */
            show_round_menu: SelectConfigData,
            /** 记住按钮位置 */
            remember_round_button: SelectConfigData,
            /** 记住对话框位置 */
            remember_dialog: SelectConfigData,
            /** 标记身份操作 */
            mark_identity_style: SelectConfigData,
            /** 自由选将显示 */
            character_dialog_tool: SelectConfigData,
            /** 最近使用武将 */
            recent_character_number: SelectConfigData,
            /** 触屏装备选择 */
            popequip: SelectConfigData,
            /** 触屏筛选按钮 */
            filternode_button: SelectConfigData,
            /** 显示武将资料 */
            show_charactercard: SelectConfigData,
            /** 显示添加收藏 */
            show_favourite: SelectConfigData,
            /** 显示模式收藏 */
            show_favmode: SelectConfigData,
            /** 显示收藏菜单 */
            show_favourite_menu: SelectConfigData,
            /** 显示禁将菜单 */
            show_ban_menu: SelectConfigData,
            /** 显示距离信息 */
            right_range: SelectConfigData,
            /** 隐藏卡牌背景 */
            hide_card_image: SelectConfigData,
            /** 显示角色名称 */
            show_name: SelectConfigData,
            /** 显示重来按钮 */
            show_replay: SelectConfigData,
            /** 显示身份按钮 */
            show_playerids: SelectConfigData,
            /** 显示暂停按钮 */
            show_pause: SelectConfigData,
            /** 显示托管按钮 */
            show_auto: SelectConfigData,
            /** 显示音量按钮 */
            show_volumn: SelectConfigData,
            /** 显示牌堆按钮 */
            show_cardpile: SelectConfigData,
            /** 显示剩余牌数 */
            show_cardpile_number: SelectConfigData,
            /** 显示手牌按钮 */
            show_handcardbutton: SelectConfigData,
            /** 显示投降按钮 */
            show_giveup: SelectConfigData,
            /** 显示无懈按钮 */
            show_wuxie: SelectConfigData,
            /** 无懈按钮靠左 */
            wuxie_right: SelectConfigData,
            /** 暂停时显示弃牌堆 */
            show_discardpile: SelectConfigData,
            /** 显示制作扩展 */
            show_extensionmaker: SelectConfigData,
            /** 显示分享扩展 */
            show_extensionshare: SelectConfigData,
            update(config: any, map: any): any;
        }
    },
    /** 音效 */
    audio: {
        name: string,
        config: {
            /** 背景音乐 */
            background_music: SelectConfigData,
            /** 导入音乐 */
            import_music: SelectConfigData,
            /** 游戏音效 */
            background_audio: SelectConfigData,
            /** 人物配音 */
            background_speak: SelectConfigData,
            /** 装备配音 */
            equip_audio: SelectConfigData,
            /** 音效音量 */
            volumn_audio: SelectConfigData,
            /** 音乐音量 */
            volumn_background: SelectConfigData,
            update(config: any, map: any): any;
        }
    },
    /** 技能 */
    skill: {
        name: string,
        config: {
            update(config: any, map: any): any;
        }
    },
    /** 其它 */
    others: {
        name: string,
        config: {
            /** 重置游戏设置 */
            reset_game: SelectConfigData,
            /** 重置隐藏内容 */
            reset_hiddenpack: SelectConfigData,
            /** 重置新手向导 */
            reset_tutorial: SelectConfigData,
            /** 导入游戏设置 */
            import_data: SelectConfigData,
            /** 导入游戏设置按钮 */
            import_data_button: SelectConfigData,
            /** 导出游戏设置 */
            export_data: SelectConfigData,
            /** 重新下载游戏 */
            redownload_game: SelectConfigData,
            update(config: any, map: any): any;
        }
    }
}

/**
 * 游戏内已扩展的数据配置一览
 */
interface LocalExtensionMenuData {
    /** 牌堆补充 */
    cardpile: ExtensionMenuConfigData,
    /** 诸神降临 */
    boss: ExtensionMenuConfigData,
    /** 五行生克 */
    wuxing: ExtensionMenuConfigData,
    /** 富甲天下 */
    coin: ExtensionMenuConfigData,
}

/**
 * 游戏内已扩展玩法模式的数据配置一览
 */
interface LocalModeMenuData {
    /** 身份局 */
    identity: {
        name: string,
        connect: {
            update(config: any, map: any): any;
            /** 游戏模式 */
            connect_identity_mode: SelectConfigData,
            /** 游戏人数 */
            connect_player_number: SelectConfigData,
            /** 明忠卡牌替换 */
            connect_zhong_card: SelectConfigData,
            /** 双内奸 */
            connect_double_nei: SelectConfigData,
            /** 双将模式 */
            connect_double_character: SelectConfigData,
            /** 特殊身份 */
            connect_special_identity: SelectConfigData,
            /** 加强主公 */
            connect_enhance_zhu: SelectConfigData,
        },
        config: {
            update(config: any, map: any): any;
            /** 游戏模式 */
            identity_mode: SelectConfigData,
            /** 游戏人数 */
            player_number: SelectConfigData,
            /** 双内奸 */
            double_nei: SelectConfigData,
            /** 神武将选择势力 */
            choose_group: SelectConfigData,
            /** 双将模式 */
            double_character: SelectConfigData,
            /** 特殊身份 */
            special_identity: SelectConfigData,
            /** 明忠卡牌替换 */
            zhong_card: SelectConfigData,
            /** 双将体力上限 */
            double_hp: SelectConfigData,
            /** 自动显示身份 */
            auto_identity: SelectConfigData,
            /** 自动标记身份 */
            auto_mark_identity: SelectConfigData,
            /** 加强主公 */
            enhance_zhu: SelectConfigData,
            /** 自由选将 */
            free_choose: SelectConfigData,
            /** 自由选择身份和座位 */
            change_identity: SelectConfigData,
            /** 开启换将卡 */
            change_choice: SelectConfigData,
            /** 开启手气卡 */
            change_card: SelectConfigData,
            /** 显示再战 */
            continue_game: SelectConfigData,
            /** 死亡后显示重来 */
            dierestart: SelectConfigData,
            /** 死亡后显示复活 */
            revive: SelectConfigData,
            /** 屏蔽身份 */
            ban_identity: SelectConfigData,
            /** 屏蔽身份2 */
            ban_identity2: SelectConfigData,
            /** 屏蔽身份3 */
            ban_identity3: SelectConfigData,
            /** 内奸策略 */
            ai_strategy: SelectConfigData,
            /** AI对人类态度 */
            difficulty: SelectConfigData,
            /** 主公候选武将数 */
            choice_zhu: SelectConfigData,
            /** 忠臣候选武将数 */
            choice_zhong: SelectConfigData,
            /** 内奸候选武将数 */
            choice_nei: SelectConfigData,
            /** 反贼候选武将数 */
            choice_fan: SelectConfigData,
        }
    },
    /** 国战 */
    guozhan: {
        name: string,
        connect: {
            update(config: any, map: any): any;
            /** 游戏人数 */
            connect_player_number: SelectConfigData,
            /** 首亮奖励 */
            connect_initshow_draw: SelectConfigData,
            /** 鏖战模式 */
            connect_aozhan: SelectConfigData,
            /** 观看下家副将 */
            connect_viewnext: SelectConfigData,
            /** 珠联璧合 */
            connect_zhulian: SelectConfigData,
            /** 使用国战牌堆 */
            connect_guozhanpile: SelectConfigData,
            /** 使用国战武将 */
            connect_onlyguozhan: SelectConfigData,
            /** 替换君主 */
            connect_junzhu: SelectConfigData,
        },
        config: {
            update(config: any, map: any): any;
            /** 游戏模式 */
            guozhan_mode: SelectConfigData,
            /** 游戏人数 */
            player_number: SelectConfigData,
            /** 首亮奖励 */
            initshow_draw: SelectConfigData,
            /** 鏖战模式 */
            aozhan: SelectConfigData,
            /** 观看下家副将 */
            viewnext: SelectConfigData,
            /** 鏖战背景音乐 */
            aozhan_bgm: SelectConfigData,
            /** 珠联璧合 */
            zhulian: SelectConfigData,
            /** 使用国战牌堆 */
            guozhanpile: SelectConfigData,
            /** 使用国战武将 */
            onlyguozhan: SelectConfigData,
            /** 使用国战皮肤 */
            guozhanSkin: SelectConfigData,
            /** 替换君主 */
            junzhu: SelectConfigData,
            /** 双将体力上限 */
            double_hp: SelectConfigData,
            /** 自由选将 */
            free_choose: SelectConfigData,
            /** 默认展开自由选将 */
            onlyguozhanexpand: SelectConfigData,
            /** 自由选择座位 */
            change_identity: SelectConfigData,
            /** 开启换将卡 */
            change_choice: SelectConfigData,
            /** 开启手气卡 */
            change_card: SelectConfigData,
            /** 显示再战 */
            continue_game: SelectConfigData,
            /** 死亡后显示重来 */
            dierestart: SelectConfigData,
            /** 死亡后显示复活 */
            revive: SelectConfigData,
            /** AI对人类态度 */
            difficulty: SelectConfigData,
            /** 候选武将数 */
            choice_num: SelectConfigData,
        }
    },
    /** 对决(分为两份对战) */
    versus: {
        name: string,
        connect: {
            update(config: any, map: any): any;
            /** 游戏模式 */
            connect_versus_mode: SelectConfigData,
            /** 末位可换牌 */
            connect_replace_handcard: SelectConfigData,
            /** 侯选武将数 */
            connect_choice_num: SelectConfigData,
            /** 替补人数 */
            connect_replace_number: SelectConfigData,
        },
        config: {
            update(config: any, map: any): any;
            /** 游戏模式 */
            versus_mode: SelectConfigData,
            /** 天梯模式 */
            ladder: SelectConfigData,
            /** 每月重置天梯 */
            ladder_monthly: SelectConfigData,
            /** 启用全部武将 */
            enable_all: SelectConfigData,
            /** 启用全部卡牌 */
            enable_all_cards_four: SelectConfigData,
            /** 启用全部武将 */
            enable_all_three: SelectConfigData,
            /** 启用全部卡牌 */
            enable_all_cards: SelectConfigData,
            /** 代替队友选将 */
            four_assign: SelectConfigData,
            /** 代替队友行动 */
            four_phaseswap: SelectConfigData,
            /** 代替队友选将 */
            two_assign: SelectConfigData,
            /** 代替队友行动 */
            two_phaseswap: SelectConfigData,
            /** 自由选将 */
            free_choose: SelectConfigData,
            /** 自由选择阵型 */
            fouralign: SelectConfigData,
            /** 自由选择座位 */
            change_identity: SelectConfigData,
            /** 开启换将卡 */
            change_choice: SelectConfigData,
            /** 双将模式 */
            double_character_jiange: SelectConfigData,
            /** 末位可换牌 */
            replace_handcard_two: SelectConfigData,
            /** 替补模式 */
            replace_character_two: SelectConfigData,
            /** 默认展开选将框 */
            expand_dialog: SelectConfigData,
            /** 专属武将出场率 */
            siguo_character: SelectConfigData,
            /** 重置天梯数据 */
            ladder_reset: SelectConfigData,
        }
    },
    /** 联机 */
    connect: {
        name: string,
        config: {
            /** 联机昵称 */
            connect_nickname: SelectConfigData,
            /** 联机头像 */
            connect_avatar: SelectConfigData,
            /** 联机大厅 */
            hall_ip: SelectConfigData,
            /** 联机大厅按钮 */
            hall_button: SelectConfigData,
            /** 创建服务器按钮 */
            room_button: SelectConfigData
        }
    },
    /** 挑战 */
    boss: {
        name: string,
        config: {
            /** 自由选将 */
            free_choose: SelectConfigData,
            /** 开启换将卡 */
            change_choice: SelectConfigData,
            /** 单人控制 */
            single_control: SelectConfigData,
        }
    },
    /** 扩展玩法：斗地主 */
    doudizhu: CommonMenuConfigData,
    /** 扩展玩法：战棋 */
    chess: CommonMenuConfigData,
    /** 扩展玩法：塔防 */
    tafang: CommonMenuConfigData,
    /** 扩展玩法：乱斗 */
    brawl: CommonMenuConfigData,
    /** 扩展玩法：炉石 */
    stone: CommonMenuConfigData
}