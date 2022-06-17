interface fetchOptions {
	/** 超时时间 */
	timeout: number;
}

interface progress extends HTMLDivElement {
	/** 获取标题 */
	getTitle: (title: string) => string;
	/** 更改标题 */
	setTitle: (title: string) => void;
	/** 获取显示的文件名 */
	getFileName: (title: string) => string;
	/** 更改显示的文件名 */
	setFileName: (title: string) => void;
	/** 获取进度*/
	getProgressValue: () => number;
	/** 更改进度*/
	setProgressValue: (value: number) => void;
	/** 获取下载文件总数 */
	getProgressMax: () => number;
	/** 修改下载文件总数 */
	setProgressMax: (max: number) => void;
}

declare interface LibConfigData {
	/**
	 * 更新时是否检查音频文件
	 */
	"extension_在线更新_assetAudio": boolean;
	/**
	 * 更新时是否检查字体文件
	 */
	"extension_在线更新_assetFont": boolean;
	/**
	 * 更新时是否检查图片文件（部分）
	 */
	"extension_在线更新_assetImage": boolean;
	/**
	 * 更新时是否检查图片文件（全部）
	 */
	"extension_在线更新_assetImageFull": boolean;
	/**
	 * 更新时是否检查皮肤文件
	 */
	"extension_在线更新_assetSkin": boolean;
	/**
	 * 储存还未更新完的文件
	 */
	"extension_在线更新_brokenFile": string[];
	/**
	 * 扩展是否开启
	 */
	"extension_在线更新_enable": boolean;
	/**
	 * 是否强制更新所有主要(非素材)文件
	 */
	"extension_在线更新_updateAll": boolean;
	/**
	 * 修改更新地址
	 */
	"extension_在线更新_update_link": string;
	/**
	 * 更新地址说明
	 */
	"extension_在线更新_update_link_explain": string;
}

declare interface Lib {
	updateURLS: {
		coding: "https://nakamurayuri.coding.net/p/noname/d/noname/git/raw",
		fastgit: "https://raw.fastgit.org/libccy/noname",
		github: "https://raw.githubusercontent.com/libccy/noname",
		xuanwu: "https://kuangthree.coding.net/p/nonamexwjh/d/nonamexwjh/git/raw"
	},
}

declare interface Game {
	/**
	 * 请求错误达到5次提示更换更新源
	 */
	updateErrors?: number;
	/**
	 * 正在更新游戏文件
	 */
	Updating?: boolean;
	/**
	 * 游戏文件和素材全部更新完毕
	 */
	allUpdatesCompleted?: boolean;
	/**
	 * 正在更新游戏素材
	 */
	UpdatingForAsset?: boolean;
	/**
	 * 游戏更新完毕
	 */
	unwantedToUpdate?: boolean;
	/**
	 * 素材已是最新
	 */
	unwantedToUpdateAsset?: boolean;
	/**
	 * 获取最快连接到的更新源
	 * @param updateURLS 默认为lib.updateURL
	 * @param translate 默认为{
		coding: 'Coding',
		github: 'GitHub',
		fastgit: 'GitHub镜像',
		xuanwu: '玄武镜像'
	}
	 */
	getFastestUpdateURL: (updateURLS: SMap<string> = lib.updateURLS, translate: SMap<string> = {
		coding: 'Coding',
		github: 'GitHub',
		fastgit: 'GitHub镜像',
		xuanwu: '玄武镜像'
	}) => never | 
		Promise<{ 
			success: Array<{ key: string, finish: number }>;
			failed: Error | Array<{ key: string, err: Error }>;
			fastest?: { key: string, finish: number }; 
		}>;

	/**
	 * 通过@url参数下载文件，并通过onsuccess和onerror回调
	 */
	shijianDownload: (url: string, onsuccess?: VoidFunction, onerror?: (e: Error | number | string, statusText: string) => void, onprogress?: (loaded: number, total: number) => void) => void;

	/**
	 * 将current分别显示在无名杀控制台中，比game.shijianDownload做出了更细致的错误划分
	 * onsuccess中的bool代表当前文件是否下载了（即是否是404）
	 */
	shijianDownloadFile: (current: string, onsuccess: (current: string, bool?: boolean) => void, onerror: (current: string) => void, onprogress?: (current: string, loaded: number, total: number) => void) => void;

	/**
	 * 根据字符串数组下载文件
	 */
	shijianMultiDownload: (list: string[], onsuccess: (current: string, bool?: boolean) => void, onerror: (current: string) => void, onfinish: VoidFunction, onprogress?: (current: string, loaded: number, total: number) => void) => Promise<void>;

	/**
	 * 显示下载进度
	 * @param title 标题
	 * @param max 文件总数
	 * @param [fileName] 当前下载的文件名
	 * @param [value] 当前下载进度
	 */
	shijianCreateProgress: (title: string, max: number, fileName?: string, value?: number) => progress;
}