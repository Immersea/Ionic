import { r as registerInstance, f as Build, h, j as Host, k as getElement } from './index-d515af00.js';
import { shouldUseCloseWatcher } from './hardware-back-button-da755485.js';
import { p as printIonWarning } from './index-93ceac82.js';
import { a as isPlatform, c as config, g as getIonMode } from './ionic-global-c07767bf.js';
import './index-51ff1772.js';

const appCss = "html.plt-mobile ion-app{user-select:none}html.plt-mobile ion-app [contenteditable]{user-select:text}ion-app.force-statusbar-padding{--ion-safe-area-top:20px}";

const App = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    componentDidLoad() {
        if (Build.isBrowser) {
            rIC(async () => {
                const isHybrid = isPlatform(window, 'hybrid');
                if (!config.getBoolean('_testing')) {
                    import('./index-d180be3d.js').then((module) => module.startTapClick(config));
                }
                if (config.getBoolean('statusTap', isHybrid)) {
                    import('./status-tap-5ca2442e.js').then((module) => module.startStatusTap());
                }
                if (config.getBoolean('inputShims', needInputShims())) {
                    /**
                     * needInputShims() ensures that only iOS and Android
                     * platforms proceed into this block.
                     */
                    const platform = isPlatform(window, 'ios') ? 'ios' : 'android';
                    import('./input-shims-82c73a8f.js').then((module) => module.startInputShims(config, platform));
                }
                const hardwareBackButtonModule = await import('./hardware-back-button-da755485.js');
                const supportsHardwareBackButtonEvents = isHybrid || shouldUseCloseWatcher();
                if (config.getBoolean('hardwareBackButton', supportsHardwareBackButtonEvents)) {
                    hardwareBackButtonModule.startHardwareBackButton();
                }
                else {
                    /**
                     * If an app sets hardwareBackButton: false and experimentalCloseWatcher: true
                     * then the close watcher will not be used.
                     */
                    if (shouldUseCloseWatcher()) {
                        printIonWarning('experimentalCloseWatcher was set to `true`, but hardwareBackButton was set to `false`. Both config options must be `true` for the Close Watcher API to be used.');
                    }
                    hardwareBackButtonModule.blockHardwareBackButton();
                }
                if (typeof window !== 'undefined') {
                    import('./keyboard-e9381f78.js').then((module) => module.startKeyboardAssist(window));
                }
                import('./focus-visible-4037a6a5.js').then((module) => (this.focusVisible = module.startFocusVisible()));
            });
        }
    }
    /**
     * @internal
     * Used to set focus on an element that uses `ion-focusable`.
     * Do not use this if focusing the element as a result of a keyboard
     * event as the focus utility should handle this for us. This method
     * should be used when we want to programmatically focus an element as
     * a result of another user action. (Ex: We focus the first element
     * inside of a popover when the user presents it, but the popover is not always
     * presented as a result of keyboard action.)
     */
    async setFocus(elements) {
        if (this.focusVisible) {
            this.focusVisible.setFocus(elements);
        }
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: 'a562850f242d9d45573e35efdd4bd178254677ef', class: {
                [mode]: true,
                'ion-page': true,
                'force-statusbar-padding': config.getBoolean('_forceStatusbarPadding'),
            } }));
    }
    get el() { return getElement(this); }
};
const needInputShims = () => {
    /**
     * iOS always needs input shims
     */
    const needsShimsIOS = isPlatform(window, 'ios') && isPlatform(window, 'mobile');
    if (needsShimsIOS) {
        return true;
    }
    /**
     * Android only needs input shims when running
     * in the browser and only if the browser is using the
     * new Chrome 108+ resize behavior: https://developer.chrome.com/blog/viewport-resize-behavior/
     */
    const isAndroidMobileWeb = isPlatform(window, 'android') && isPlatform(window, 'mobileweb');
    if (isAndroidMobileWeb) {
        return true;
    }
    return false;
};
const rIC = (callback) => {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
    }
    else {
        setTimeout(callback, 32);
    }
};
App.style = appCss;

export { App as ion_app };

//# sourceMappingURL=ion-app.entry.js.map