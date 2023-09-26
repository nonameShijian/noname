declare namespace Lib {
	/**
	 * 技能数据中心
	 * （所有扩展的skill都会集中到这里）
	 */
	interface Skill {
		/** 保存的技能信息与玩家之间的关系map,目前在项目内没看出有什么用 */
		globalmap: SMap<Player[]>;
		/** 本地缓存  */
		storage: SMap<any>;
		/**
		 * 不计入距离的计算且不能使用牌且不是牌的合法目标
		 * 
		 * （目前该标记直接标记到技能的group中，拥有该技能就是被隔离出游戏，目前还没见使用到这成员）
		 * 
		 * 目前在项目内没什么用，只有标记到技能的group中使用，用于免除某些阶段结算(只是同名而已，和该属性似乎没有直接关系)
		 */
		undist: SMap<any>;
		//下面4个+上面1个目前似乎都没什么用......
		others: SMap<any>;
		zhu: SMap<any>;
		zhuSkill: SMap<any>;
		land_used: SMap<any>;

		//以下皆为游戏内预设的全局特殊节能
		unequip: ExSkillData;
		subplayer: ExSkillData;
		autoswap: ExSkillData;
		/** 与双将相关 */
		dualside: ExSkillData;
		/** 废除相关 */
		_disableJudge: ExSkillData;
		/** 废除相关 */
		_disableEquip: ExSkillData;
		/**
		 * 特殊技能：封印技能
		 * 
		 * 使指定技能“失效”（即玩家失去了某些技能，可在标记上查看）
		 */
		fengyin: ExSkillData;
		/**
		 * 特殊技能：白板
		 * 
		 * 使玩家失去当前自身的所有技能
		 */
		baiban: ExSkillData;
		/**
		 * 特殊技能：潜行
		 * 常用于：锁定技，你不能成为其他角色的卡牌的目标
		 */
		qianxing: ExSkillData;
		/**
		 * 特殊技能：免疫
		 * 
		 * 触发阶段：damageBefore（玩家收到伤害时）
		 * 
		 * 常用于：锁定技，防止一切伤害
		 * 
		 * 其作用是取消”damage“受到伤害事件的触发（故无法防止失去体力之类的伤害）
		 */
		mianyi: ExSkillData;
		/**
		 * 特殊技能：混乱
		 * 
		 * 标记技能
		 * 
		 * 进入“混乱”状态的情况下，不能操作（自己的面板），player.isMine的结果也是false（不能确定当前玩家是自己）
		 */
		mad: ExSkillData;
		/** 护甲 */
		ghujia: ExSkillData;
		/**
		 * 特殊技能：计算触发次数
		 * 
		 * 触发阶段：phaseAfter（回合结束之后）
		 * 
		 * 当技能存在“usable”每回合使用次数时，在创建技能事件时，添加该技能。
		 * 
		 * 其作用是，在回合结束时，清除player.storage.counttrigger触发技术。
		 */
		counttrigger: ExSkillData;
		/** 防止体力值回复超过上限 */
		_recovercheck: ExSkillData;
		/**
		 * 全局技能：翻面
		 * 
		 * 触发阶段：玩家phaseBefore（玩家回合开始后）
		 * 
		 * 当有玩家处于翻面状态时，到其回合开始后触发该技能。
		 * 
		 * 其作用是，让其翻面回正面，并且跳过该玩家的当前回合。
		 * 
		 * 补充：该全局技能，目前更详细的作用为：
		 * 
		 *    1.根据是否翻面，设置player.phaseSkipped；
		 * 
		 *    2.设置回合轮数开始计数，触发“roundStart”事件，该事件优先度在回合开始前；
		 */
		_turnover: ExSkillData;
		/**
		 * 全局技能：卡牌使用后清除场上的ui
		 * 
		 * 触发阶段：useCardAfter（全场玩家在卡牌使用之后）
		 */
		_usecard: ExSkillData;
		/** 弃置卡牌后清除场上的ui */
		_discard: ExSkillData;
		/**
		 * 全局技能：濒死阶段循环询问求救
		 * 
		 * 触发阶段：濒死阶段触发（玩家频死时，玩家造成其他玩家频死时）
		 */
		_save: ExSkillData;
		_ismin: ExSkillData;
		/**
		 * 全局技能：重铸
		 * 
		 * 触发阶段：phaseUse（出牌阶段中）
		 * 
		 * 可以触发当前自己所拥有的牌是否可以“重铸”
		 */
		_chongzhu: ExSkillData;
		//铁索连环相关
		_lianhuan: ExSkillData;
		_lianhuan2: ExSkillData;
		_lianhuan3: ExSkillData;
		_lianhuan4: ExSkillData;

		/** 展示隐藏武将【1.9.106.4】 */
		_showHiddenCharacter: ExSkillData;
		/** “神”杀 */
		_kamisha: ExSkillData;

		[key: string]: | ExSkillData;
	}
}
