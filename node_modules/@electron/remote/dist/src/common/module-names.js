"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserModuleNames = exports.commonModuleNames = void 0;
const get_electron_binding_1 = require("./get-electron-binding");
exports.commonModuleNames = [
    'clipboard',
    'nativeImage',
    'shell',
];
exports.browserModuleNames = [
    'app',
    'autoUpdater',
    'BaseWindow',
    'BrowserView',
    'BrowserWindow',
    'contentTracing',
    'crashReporter',
    'dialog',
    'globalShortcut',
    'ipcMain',
    'inAppPurchase',
    'Menu',
    'MenuItem',
    'nativeTheme',
    'net',
    'netLog',
    'MessageChannelMain',
    'Notification',
    'powerMonitor',
    'powerSaveBlocker',
    'protocol',
    'pushNotifications',
    'safeStorage',
    'screen',
    'session',
    'ShareMenu',
    'systemPreferences',
    'TopLevelWindow',
    'TouchBar',
    'Tray',
    'utilityProcess',
    'View',
    'webContents',
    'WebContentsView',
    'webFrameMain',
].concat(exports.commonModuleNames);
const features = get_electron_binding_1.getElectronBinding('features');
if (((_a = features === null || features === void 0 ? void 0 : features.isDesktopCapturerEnabled) === null || _a === void 0 ? void 0 : _a.call(features)) !== false) {
    exports.browserModuleNames.push('desktopCapturer');
}
if (((_b = features === null || features === void 0 ? void 0 : features.isViewApiEnabled) === null || _b === void 0 ? void 0 : _b.call(features)) !== false) {
    exports.browserModuleNames.push('ImageView');
}
