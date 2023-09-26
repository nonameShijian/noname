declare var lib: Lib;

/**
 * 游戏内的主要信息储存区域，与核心游戏方法对象
 */
interface Lib {
	/**
	 * 武将评级
	 */
	rank: {
		's': string[],
		'ap': string[],
		'a': string[],
		'am': string[],
		'bp': string[],
		'b': string[],
		'bm': string[],
		'c': string[],
		'd': string[],
		'rarity': {
			'legend': string[],
			'epic': string[],
			'rare': string[],
			'junk': string[]
		}
	};
	/** lib.sort.seat中用到 */
	tempSortSeat?: Lib.element.Player;
	/** 当前版本的配置前缀（多用于本地缓存的标签名） */
	configprefix: string;
	/** 当前版本 */
	version: string;
	/** 联机版本 */
	versionOL: number;
	/** 更新地址 */
	updateURL: string;
	/** 更新地址列表 */
	updateURLS: SMap<string>;
	/** 更新的镜像地址 */
	mirrorURL: string;
	/** 联机地址 */
	hallURL: string;
	/** 资源地址(手机端是apk根目录) */
	assetURL: string;
	/** 更新日志 */
	changeLog: string[];
	/**
	 * 记录更新用的方法，在game.run中执行
	 */
	updates: OneParmFun<number, boolean>[];
	canvasUpdates: TwoParmFun<number, any, boolean>[];
	/** 录像信息 */
	video: VideoData[];
	/**
	 * 保存所有武将所拥有的的技能。
	 * 在onload，loadPackage中添加保存。
	 */
	skilllist: string[];
	/** 武将禁用列表 */
	connectBanned: string[];
	/** 武将介绍 */
	characterIntro: SMap<string>;
	/** 武将标题（用于写称号或注释） */
	characterTitle: SMap<string>;
	/** 武将包 */
	characterPack: SMap<SMap<HeroData>>;
	/** 武将的过滤方法（参数为一个mode，用于过滤玩法模式） */
	characterFilter: SMap<OneParmFun<string, boolean>>;
	/** 用于武将分包，就像是神话再临中的风火林山 */
	characterSort: SMap<SMap<string[]>>;
	/** 系列卡包（卡牌的系列集合） */
	cardPack: SMap<string[]>;

	/** 在updatex中，执行一些列onresize重新调整UI大小 */
	onresize: NoneParmFum<void>[];
	/** 在“phaseLoop”事件执行该一系列onphase事件 */
	onphase: NoneParmFum<void>[];
	/** 
	 * 洗牌后挨个执行内容函数
	 * 
	 * 如果函数返回值是'remove',那这个函数就只生效一次
	 */
	onwash: NoneParmFum<void | 'remove'>[];
	/** game.over后执行的一些列结束方法 */
	onover: OneParmFun<string, void>[];

	//记录数据，读取数据库
	ondb: any[];
	ondb2: any[];

	/** 聊天历史 */
	chatHistory: [string, string][];
	onload: NoneParmFum<void>[];
	onload2: NoneParmFum<void>[];
	onprepare: NoneParmFum<void>[];
	/** 主要在lib.init记录场景加载的系列方法，在ui.arena中取出执行 */
	arenaReady: NoneParmFum<void>[];
	/** 保存一些UI处理的方法，在合适时机取出来执行 */
	onfree: NoneParmFum<void>[];
	/** 在牌堆里牌(指不区分数字，花色，伤害属性的牌) */
	inpile: string[];
	inpile_nature: string[];
	/**
	 * 保存loadExtension中，保存读取到的扩展，在onload的proceed2中读取处理
	 */
	extensions?: any[];
	/**
	 * 保存loadExtension读取到的扩展，便于后面“编辑扩展”读取信息
	 */
	extensionPack: SMap<PackageData>;
	/** 卡牌类型的优先级？（用于排序卡牌用） */
	cardType: SMap<number>;

	/** 保存游戏中的触发 */
	hook: {
		/**
		 * 全局触发记录:
		 * 
		 * 结构：
		 * 
		 * 触发名:{ 玩家id:[触发技能列表] }
		 */
		globaltrigger: SMap<SMap<string[]>>;
		/**
		 * 全局触发技能记录：
		 * 
		 * 结构：
		 * 
		 * “触发源(player/source/global/target)_触发名”: [触发技能列表]
		 */
		globalskill: SMap<string[]>;
		/**
		 * 玩家触发
		 * 
		 * 结构：
		 * 
		 * “玩家id_触发源(player/source/global/target)_触发名”: [触发技能列表]
		 * 
		 * 注：实际上的类型是SMap<string[]>，另一个只是为了解决冲突
		 */
		[key: string]: SMap<string[] | SMap<string[]>>;
	};
	/**
	 * 记录当前预定处理游戏中的触发map
	 * 
	 * key为触发名，value为布尔值，一般情况下都是默认true；
	 * 
	 * 如果没有指定的触发名在这里，则执行trigger时，不查找触发技能执行。
	 */
	hookmap: SMap<boolean>;

	/** 已经导入的扩展(当前要执行的导入扩展) */
	imported: {
		[key: string]: ExModeConfigData;
	};
	/** 锁定布局不改变的模式列表 */
	layoutfixed: string[];
	characterDialogGroup: SMap<(name: string, capt: any) => void>;
	listenEnd(node: Node): void;

	/** 菜单配置 */
	configMenu: SMap<CommonMenuConfigData>;
	/** 扩展菜单配置 */
	extensionMenu: SMap<ExtensionMenuConfigData>;
	/** 开始模式选择菜单配置 */
	mode: SMap<CommonMenuConfigData>;

	/** 记录当前运行的设备类型："android","ios",不存在（一般是在指移动设备的类型） */
	device?: string;

	status: {
		running: boolean,
		canvas: boolean,
		time: number,
		reload: number,
		delayed: number,
		frameId: number,
		videoId: number,
		globalId: number,
		date: Date;
		dateDelayed: number;
		dateDelaying: Date;
	};
	/** 
	 * 帮助内容数据中心
	 * 帮助内容将显示在菜单－选项－帮助中
	 * （所有扩展的help都会集中到这里）
	 */
	help: SMap<string>;

	//ui相关
	/** 设置点击/触摸打开信息面板的节点 */
	setIntro(node: any, func?: Function, left?: boolean): void;
	/** 设置弹出的面板节点 */
	setPopped(node: HTMLDivElement | HTMLElement, func: Function, width?: number, height?: number, forceclick?: any, paused2?: any): void;
	/** 弹出会话面板 */
	placePoppedDialog(dialog: Dialog, e: any): void;
	/** 设置节点的hover（鼠标悬停在上方） */
	setHover(node: HTMLElement, func: Function, hoveration: number, width: number): HTMLElement;
	/** 设置触摸的滚动 */
	setScroll(node: HTMLElement): HTMLElement;
	/** 设置鼠标的滚轮 */
	setMousewheel(node: HTMLElement): void;
	/** 设置节点的长按 */
	setLongPress(node: HTMLElement, func: any): HTMLElement;
	updateCanvas(time: any): any;
	run(time: any): any;

	/** 获得该时间的（UTC）时间 */
	getUTC(date: Date): number;
	saveVideo(): any;

	/** 游戏初始化方法与相关工具库 */
	init: Lib.Init;
	/** 游戏作弊 */
	cheat: Lib.Cheat;
	/** 
	 * 游戏的翻译（本地化）
	 * 
	 * '技能描述_append' 会在技能的结尾加一段指定的html文本
	 */
	translate: SMap<string>;

	/**
	 * 动态翻译（本地化）【v1.9.105】
	 * 
	 * 指定lib.dynamicTranslate.xxx为一个函数 即可让技能xxx显示的描述随玩家状态而变化 并实现技能修改等
	 * 
	 * Player:指技能拥有者；
	 */
	dynamicTranslate: SMap<TwoParmFun<Player, string, string>>;

	/** 游戏内核心元素 */
	element: {
		/** 游戏内预定义事件使用的content方法 */
		content: Lib.element.Content;
		/** 玩家 */
		player: Lib.element.Player;
		/** 卡牌 */
		card: Lib.element.Card;
		/** 按钮 */
		button: Lib.element.Button;
		/** 事件 */
		event: Lib.element.Event;
		/** 会话面板 */
		dialog: Lib.element.Dialog;
		control: Lib.element.Control;
		client: Lib.element.Client;
		nodews: Lib.element.Nodews;
		ws: Lib.element.WS;
	},
	/** 
	 * 卡片数据中心 
	 * （所有扩展的card都会集中到这里）
	 */
	card: {
		/** 保存所有的卡牌的基本信息 */
		list: CardBaseData[];
	} & /** 所有卡牌的配置集中在这里 */ SMap<ExCardData>;
	/** 游戏内自定义的过滤方法 */
	filter: Lib.Filter;
	/** 游戏内自定义的sort排序方法 */
	sort: Lib.Sort;
	skill: Lib.Skill & {
		/** 
		 * 保存游戏内所有全局技能
		 * 
		 * 全局技能名命名常用："_","g_"开头
		 * 
		 * 目前看来，用”_“开头，就是指定其为全局技能；
		 * 
		 * 另外还有技能配置的info.global指定的全局技能；
		 * 
		 * 下面那些拥有”_“开头的技能，就是当前游戏中的预定义的全局技能，这些全局技能属于游戏玩法和流程的一部分！
		 */
		global: string[];
	};

	/**
	 * 武将数据中心
	 * （所有扩展的character都会集中到这里）
	 */
	character: {
		[key: string]: HeroData
	};
	/** 珠联璧合武将数据中心 */
	perfectPair: SMap<string[]>;
	/** 卡堆数据中心 */
	cardPile: SMap<CardBaseData[]>;

	/** 【联网】消息中心 */
	message: {
		server: Lib.message.Server;
		client: Lib.message.Client;
	};

	/** 花色的常量列表 */
	suit: string[];
	suits: string[];
	color: SMap<string[]>;
	/** 势力的常量列表 */
	group: HeroGroup[] | string[];
	/** 属性伤害的常量列表 */
	nature: string[]; /*["fire", "thunder", "kami", "ice", "stab", "poison"];*/
	/** “连环”状态能传递的伤害属性列表 */
	linked: string[];
	/** 游戏内的标准阶段名 */
	phaseName: ['phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu'];

	/*
	例：新版本「Key杀」中自定义【键】势力的相关代码
	//设置势力的颜色
	//这个步骤是在样式库中写入需要的势力颜色 rgba里面的四个数字就代表颜色的RGB值和透明度
	var style2=document.createElement('style');
	style2.innerHTML=".player .identity[data-color='key'],";
	style2.innerHTML+="div[data-nature='key'],";
	style2.innerHTML+="span[data-nature='key'] {text-shadow: black 0 0 1px,rgba(203, 177, 255,1) 0 0 2px,rgba(203, 177, 255,1) 0 0 5px,rgba(203, 177, 255,1) 0 0 10px,rgba(203, 177, 255,1) 0 0 10px}";
	style2.innerHTML+="div[data-nature='keym'],";
	style2.innerHTML+="span[data-nature='keym'] {text-shadow: black 0 0 1px,rgba(203, 177, 255,1) 0 0 2px,rgba(203, 177, 255,1) 0 0 5px,rgba(203, 177, 255,1) 0 0 5px,rgba(203, 177, 255,1) 0 0 5px,black 0 0 1px;}";
	style2.innerHTML+="div[data-nature='keymm'],";
	style2.innerHTML+="span[data-nature='keymm'] {text-shadow: black 0 0 1px,rgba(203, 177, 255,1) 0 0 2px,rgba(203, 177, 255,1) 0 0 2px,rgba(203, 177, 255,1) 0 0 2px,rgba(203, 177, 255,1) 0 0 2px,black 0 0 1px;}";
	document.head.appendChild(style2);
	//在lib.groupnature中建立相应的映射
	lib.groupnature.key='key';
	//将势力添加到势力库中 并指定势力的中文名称
	lib.group.push('key');
	lib.translate['key']='键';
	*/

	/** 势力的样式配置（颜色UI） */
	groupnature: SMap<string>;

	/** 
	 * 挂载额外方法的保存节点：联机相关方法，文件操作方法.... 
	 * 
	 * 一般只有主机拥有，客机没有该对象（作为区分的条件之一）
	 */
	node: {
		//网络操作：
		//创建服务器
		/** 
		 * 保存connection接入的client 
		 * 
		 * 经常有用这个判断是否联机
		 */
		clients: BaseClientData[];
		banned: any[];
		observing: any[];

		//联机相关：
		torespond: SMap<Function | string>;
		torespondtimeout: SMap<number>;

		//文件操作：
		//以下对象，大多是nodejs的操作对象
		/** node fs模块 */
		/// @ts-ignore
		fs: typeof import('fs');
		/** node http模块(调用下载函数的时候可能才会被赋值) */
		/// @ts-ignore
		http: typeof import('http');
		/** node https模块(调用下载函数的时候可能才会被赋值) */
		/// @ts-ignore
		https: typeof import('https');

		/** 电脑端开启electron控制台 */
		debug(): void;
	};

	/** 【v1.9.98.3】 特效接口（存放自定义某种名称的卡牌/技能的特效） */
	animate: {
		skill: SMap<SkillAnimateType>;
		card: SMap<CardAnimateType>;
	};

	/**
	 * 用于进行特定模式下的同名武将切换。
	 * 
	 * 例：lib.characterReplace.xuzhu = ['re_xuzhu','xuzhu'];就可以对标界许褚进行同框切换了;
	 * 
	 * 【1.9.106~】
	 */
	characterReplace: SMap<string>;

	/** 界面美化代码重构与事件方法_橙续缘扩展方法（方法扩展） */
	app?: LibApp;

	/** 貌似是所有的那些配置的那些选项的状态都保存在这里了 */
	config: LibConfigData;

	/** 貌似是联机房主的设置 */
	configOL: any;

	/** 数据库 */
	db: IDBDatabase;

	//自己独立增加的：
	/**
	 * 雷神Zero大佬自己独立增加的：
	 * 
	 * 【无名杀扩展定制】自动化卡组生成
	 * 
	 * @param cards 将要用于生成的卡牌列表
	 * @param maxNum 生成的卡组总数
	 * @param configure 用于生成卡牌的规则  详情参考 IBuildConfigure 接口注释；
	 */
	autoBuildCardList(cards: SMap<ExCardData>, maxNum: number, configure?: IBuildConfigure): CardBaseData[];
	/** 
	 * 雷神Zero大佬自己独立增加的：
	 * 
	 * 测试分析 联盟杀 所有构成数据
	 */
	testAnalysisZJSha(): void;

	/** 不知道，可能是监听卡牌属性变化的 */
	cardSelectObserver: any;

	junList?: string[];
	//[key: string]: any;
}

/** 基础客户端链接对象的数据 */
interface BaseClientData extends Lib.element.Client {
	ws: WebSocket;
	id: number;
	closed: boolean;
}

/** 直接复制console的信息，没想到这么多 */
interface LibConfigData {
	extension_sources: SMap<string>;
	extension_source: string,
	addedpile: SMap<any[]>,
	all: {
		cards: string[];
		characters: string[];
		[key: string]: any;
	},
	alteredSkills: any[],
	animation: boolean,
	appearence: boolean,
	asset_font: boolean,
	asset_image: boolean,
	asset_version: string,
	auto_check_update: boolean,
	auto_confirm: boolean,
	auto_popped_config: boolean,
	auto_popped_history: boolean,
	auto_skill: boolean,
	autoborder_count: string,
	autoborder_start: string,
	autoskilllist: any[],
	background_audio: boolean,
	background_music: string,
	background_speak: boolean,
	banned: any[],
	bannedcards: any[],
	bannedpile: SMap<any[]>,
	blur_ui: boolean,
	border_style: string,
	boss_enable_playpackconfig: boolean,
	boss_enableai_playpackconfig: boolean,
	brokenFile: any[],
	button_press: boolean,
	buttoncharacter_style: string,
	card_font: string,
	card_style: string,
	cardback_style: string,
	cardpile_enable_playpackconfig: boolean,
	cardpile_guohe_playpackconfig: string,
	cardpile_huosha_playpackconfig: string,
	cardpile_jiu_playpackconfig: string,
	cardpile_leisha_playpackconfig: string,
	cardpile_nanman_playpackconfig: string,
	cardpile_sha_playpackconfig: string,
	cardpile_shan_playpackconfig: string,
	cardpile_shunshou_playpackconfig: string,
	cardpile_tao_playpackconfig: string,
	cardpile_tiesuo_playpackconfig: string,
	cardpile_wanjian_playpackconfig: string,
	cardpile_wuxie_playpackconfig: string,
	cards: string[],
	cardshape: string,
	cardtext_font: string,
	change_skin: boolean,
	change_skin_auto: string,
	character_dialog_tool: string,
	characters: string[],
	cheat: boolean,
	clear_log: boolean,
	coin: number,
	coin_canvas_playpackconfig: boolean,
	coin_display_playpackconfig: string,
	coin_enable_playpackconfig: boolean,
	compatiblemode: boolean,
	config_menu: boolean,
	confirm_exit: boolean,
	connect_avatar: string,
	connect_cards: any[],
	connect_characters: any[],
	connect_nickname: string,
	control_style: string,
	current_mode: SMap<any>,
	cursor_style: string,
	customBackgroundPack: any[],
	custom_button: boolean,
	custom_button_control_bottom: string,
	custom_button_control_top: string,
	custom_button_system_bottom: string,
	custom_button_system_top: string,
	customcardpile: SMap<any>,
	customforbid: any[],
	damage_shake: boolean,
	defaultcards: string[],
	defaultcharacters: string[],
	dev: boolean,
	dialog_transform: number[],
	die_move: string,
	doubleclick_intro: boolean,
	duration: number,
	enable_drag: boolean,
	enable_dragline: boolean,
	enable_pressure: boolean,
	enable_touchdragline: boolean,
	enable_vibrate: boolean,
	equip_audio: boolean,
	errstop: boolean,
	extensionInfo: SMap<any>
	extension_ZJ联盟杀_enable: boolean,
	extension_ZJ联盟杀_start_wuxing: boolean,
	extension_ZJ联盟杀_start_wuxingSkill: boolean,
	/** 已导入的扩展列表 */
	extensions: string[],
	favouriteCharacter: any[],
	favouriteMode: any[],
	filternode_button: boolean,
	fold_card: boolean,
	fold_mode: boolean,
	forbid: any[][];
	forbidai: string[],
	forbidai_user: any[],
	forbidall: any[],
	forbidboss: string[],
	forbidchess: string[],
	forbiddouble: string[],
	forbidlist: any[],
	forbidstone: string[],
	forbidthreecard: string[],
	fuck_sojson: boolean,
	game: string,
	gameRecord: SMap<any>,
	game_speed: string,
	gameconfig: boolean,
	glass_ui: boolean,
	global_font: string,
	glow_phase: string,
	handcard_scroll: number,
	hiddenBackgroundPack: any[],
	hiddenCardPack: any[],
	hiddenCharacterPack: any[],
	hiddenModePack: any[],
	hiddenPlayPack: any[],
	hide_card_image: boolean,
	hide_card_prompt_basic: boolean,
	hide_card_prompt_equip: boolean,
	hover_all: boolean,
	hover_handcard: boolean,
	hoveration: number,
	hp_style: string,
	identity_font: string,
	image_background: string,
	image_background_blur: boolean,
	image_background_random: boolean,
	image_character: string,
	intro: string,
	jiu_effect: boolean,
	keep_awake: boolean,
	layout: string,
	link_style2: string,
	log_highlight: boolean,
	long_info: boolean,
	longpress_info: boolean,
	low_performance: boolean,
	lucky_star: boolean,
	mark_identity_style: string,
	max_loadtime: string,
	menu_style: string,
	mode: string,
	mode_config: SMap<any>,
	modeconfig: boolean,
	mousewheel: boolean,
	name_font: string,
	new_tutorial: boolean,
	only_fullskin: boolean,
	paused: boolean,
	phonelayout: boolean,
	player_border: string,
	player_height: string,
	player_height_nova: string,
	player_style: string,
	plays: any[],
	pop_logv: boolean,
	popequip: boolean,
	pressure_taptic: boolean,
	radius_size: string,
	recentIP: any[],
	recent_character_number: string,
	remember_dialog: boolean,
	remember_round_button: boolean,
	repeat_audio: boolean,
	right_click: string,
	right_info: boolean,
	right_range: boolean,
	round_menu_func: string,
	seperate_control: boolean,
	show_auto: boolean,
	show_ban_menu: boolean,
	show_card_prompt: boolean,
	show_cardpile: boolean,
	show_cardpile_number: boolean,
	show_charactercard: boolean,
	show_connect: boolean,
	show_discardpile: boolean,
	show_extensionmaker: boolean,
	show_extensionshare: boolean,
	show_favmode: boolean,
	show_favourite: boolean,
	show_favourite_menu: boolean,
	show_giveup: boolean,
	show_handcardbutton: boolean,
	show_history: string,
	show_log: string,
	show_name: boolean,
	show_pause: boolean,
	show_phase_prompt: boolean,
	show_phaseuse_prompt: boolean,
	show_playerids: boolean,
	show_replay: boolean,
	show_round_menu: boolean,
	show_scrollbar: boolean,
	show_sortcard: boolean,
	show_splash: string,
	show_stat: boolean,
	show_statusbar_android: boolean,
	show_statusbar_ios: string,
	show_time: boolean,
	show_time2: boolean,
	show_time3: boolean,
	show_volumn: boolean,
	show_wuxie: boolean,
	show_wuxie_self: boolean,
	skill_animation_type: string,
	skin: SMap<any>,
	skip_shan: boolean,
	sort: string,
	sort_card: Function,
	storageImported: boolean,
	swipe: boolean,
	swipe_down: string,
	swipe_left: string,
	swipe_right: string,
	swipe_up: string,
	sync_speed: boolean,
	tao_enemy: boolean,
	target_shake: string,
	textequip: string,
	theme: string,
	threed_card: boolean,
	title: boolean,
	touchscreen: boolean,
	turned_style: boolean,
	ui_zoom: string,
	update_link: string,
	version: string,
	vertical_scroll: boolean,
	video: string,
	vintageSkills: any[],
	volumn_audio: number,
	volumn_background: number,
	watchface: string,
	wuxie_right: boolean,
	wuxie_self: boolean,
	wuxing_enable_playpackconfig: boolean,
	wuxing_num_playpackconfig: string,

	[key: string]: any;
}

// 雷神Zero大佬自己额外扩展的
interface LibConfigData {
	/** 
	 * 雷神Zero大佬自己额外扩展的
	 * 
	 * 正式扩展加载配置 
	 */
	loadExtensionConfig: string[];

	/** 
	 * 雷神Zero大佬自己额外扩展的
	 * 
	 * 个人扩展加载配置
	  */
	loadSelfExtensionConfig: string[];

	/** 
	 * 雷神Zero大佬自己额外扩展的
	 * 
	 * 仅联盟杀卡牌显示时，能显示的卡包 
	 */
	canShowCardPack: string[];
}

/** 扩展：界面美化代码重构与事件方法_橙续缘 */
interface LibApp {
	/**
	 * 重写方法：
	 * 
	 * 例子：
	 * ```jsx
	 * app.reWriteFunction(lib.element.player, {
		useCard: [null, function(next) {
		  plugin.playeCardAnimate(this, next.card);
		}],
		respond: [null, function(next) {
		  plugin.playeCardAnimate(this, next.card);
		}],
		logSkill: [
		  'popup(get.skillTranslation(name,this))',
		  'popup(get.skillTranslation(name,this), "skill")',
		],
		popup: [null, function(res, name, nature) {
		  if (nature === 'skill') {
			setTimeout(function(player) {
			  player.createSkillAnimate('skill');
			}, 100, this);
		  }
		}],
	  });
	  ```
	 * 
	 * 
	 * 使用说明：
	 * 
	 * 1.当replace，str都存在时，则replace为将要替代部分，str为替代内容；
	 * 
	 * 2.当replace为function时，前置执行该方法，此时，该方法的参数：(整合成一个数组参数列表args,......当前参数列表)；
	 * 
	 *  若有返回值（非false系），则不执行本身函数，即该replace替换原方法，否则则执行原函数部分；
	 * 
	 *  当str为function时，后置执行该方法，其参数为(原操作方法的返回xxx,......当前参数列表)；
	 *  
	 * 注1：根据观察，需要参数时，大多用于，event事件，创建，操作ui操作（例如：ui.create.xxx）......
	 *      即那些会返回自身操作对象的方法，追加在它们后面操作其返回的操作对象；
	 * 
	 * 注2：上面replace为null，str有值，就表示str为原函数的追加模式；
	 * 
	 * 注3：上面replace有值，str为null，就表示该replace为纯原函数替换模式；
	 *   
	 * @param target 方法所在对象
	 * @param name 通常状态下是target的属性key，简化为一个map结构：key为target的属性，value为[replace,str]参数；
	 * @param replace 看上方，一般指替换部分；
	 * @param str 看上方，一般指替换内容；
	 */
	reWriteFunction(target: any, name: string | SMap<[ReWriteFunctionParam, ReWriteFunctionParam]>, replace?: ReWriteFunctionParam, str?: ReWriteFunctionParam): Function;

	/**
	 * 重写方法2：
	 * 
	 * 在reWriteFunction基础上，增加了个操作类型：append，insert，可追加到替换部分后面，或者插入到前面，不填该类型则完成替换掉替换部分；
	 * 并且统一操作参数的方式为数组类型，即map多操作形式，单属性操作将操作用的参数已数组形式进行；
	 * 
	 * 当replace，str都存在时，
	 * 
	 * 若操作类型为“append”，则str追加到replace后面；
	 * 
	 * 若操作类型为“insert”，则str插入到replace前面；
	 * 
	 * 若为其他，或者没有，则str替换replace部分；
	 * 
	 * 为function时的操作，直接参考上面reWriteFunction即可，是一致的；
	 * 
	 * @param target 方法所在对象
	 * @param name 通常状态下是target的属性key，简化为一个map结构：key为target的属性，value为[replace,str,操作类型]参数；
	 * @param replace 整合被替换，替换，操作类型参数；新增：若是个二维数组，则是同一个方法的多处修改，该方式只针对字符串修改替换；
	 */
	reWriteFunctionX(target: any, name: string | SMap<SAAType<ReWriteFunctionParam2>>, replace?: SAAType<ReWriteFunctionParam2>): Function;
}

/** 重写方法的基本参数 */
type ReWriteFunctionParam = string | RegExp | Function;
/** 重写方法的基本参数2 */
type ReWriteFunctionParam2 = [ReWriteFunctionParam, ReWriteFunctionParam] | [ReWriteFunctionParam, ReWriteFunctionParam, string];

/** 【无名杀扩展定制】生成配置控制：用于自动化卡组生成 */
interface IBuildConfigure {
	/** 
	 * 花色比例
	 * 
	 * 标准长度4，默认平均（暂时无用）
	 */
	suit?: number[];
	/** 
	 * 数字比例
	 * 
	 * 标准长度13，默认平均（暂时无用）
	 */
	num?: number[];
	/**
	 * 牌型分配
	 * 
	 * 基本规则：按比例分配，总值为100，卡牌私下分配总量100的值，在计算最大数量分配比例时，出现小数，忽略（少几张分配）;
	 * 默认不填时（没有设置到type），默认所有卡牌的分配比例一致；
	 */
	card?: SMap<number>;
	/**
	 * 基础类型分配
	 * 
	 * 牌的类型分配:CardType（有card应该不需要这个，这个可以强制设置成根据type比例生成）
	 * 目前，用来简洁规则使用，卡牌分配：只会在type，card之间任选一种，目前优先使用type：
	 * type:根据当前配置的卡牌基础类型分配比例，将卡牌按基础类型分配，每张卡牌，再该比例中均分；
	 */
	type?: SMap<number>;
	/** 
	 * 简易花色生成规则
	 * 
	 * 入参：
	 * 第一个参数：当前处理卡牌数据；
	 * 第二个参数：外部缓存数据（后续可能会用上）；
	 * 返回：
	 * [用于参考可生成数字的列表，用于参考可生成花色的列表]
	 */
	colorRule?: TwoParmFun<ExCardData, any, [Array<number>, Array<string>]>;
	/** 
	 * 简易卡牌生成规则
	 * 
	 * 入参：
	 * 第一个参数：当前处理卡牌数据；
	 * 第二个参数：外部缓存数据（后续可能会用上）；
	 * 返回：
	 * [返回用于构建最终卡牌信息的列表：例如：名字，属性，图片......]
	 */
	cardRule?: TwoParmFun<ExCardData, any, any[]>;
}