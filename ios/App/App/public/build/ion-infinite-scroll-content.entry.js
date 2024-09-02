import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { E as ENABLE_HTML_CONTENT_DEFAULT, s as sanitizeDOMString } from './config-45217ee2.js';
import { c as config, g as getIonMode } from './ionic-global-c07767bf.js';

const infiniteScrollContentIosCss = "ion-infinite-scroll-content{display:flex;flex-direction:column;justify-content:center;min-height:84px;text-align:center;user-select:none}.infinite-loading{margin-left:0;margin-right:0;margin-top:0;margin-bottom:32px;display:none;width:100%}.infinite-loading-text{-webkit-margin-start:32px;margin-inline-start:32px;-webkit-margin-end:32px;margin-inline-end:32px;margin-top:4px;margin-bottom:0}.infinite-scroll-loading ion-infinite-scroll-content>.infinite-loading{display:block}.infinite-scroll-content-ios .infinite-loading-text{color:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}.infinite-scroll-content-ios .infinite-loading-spinner .spinner-lines-ios line,.infinite-scroll-content-ios .infinite-loading-spinner .spinner-lines-small-ios line,.infinite-scroll-content-ios .infinite-loading-spinner .spinner-crescent circle{stroke:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}.infinite-scroll-content-ios .infinite-loading-spinner .spinner-bubbles circle,.infinite-scroll-content-ios .infinite-loading-spinner .spinner-circles circle,.infinite-scroll-content-ios .infinite-loading-spinner .spinner-dots circle{fill:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}";

const infiniteScrollContentMdCss = "ion-infinite-scroll-content{display:flex;flex-direction:column;justify-content:center;min-height:84px;text-align:center;user-select:none}.infinite-loading{margin-left:0;margin-right:0;margin-top:0;margin-bottom:32px;display:none;width:100%}.infinite-loading-text{-webkit-margin-start:32px;margin-inline-start:32px;-webkit-margin-end:32px;margin-inline-end:32px;margin-top:4px;margin-bottom:0}.infinite-scroll-loading ion-infinite-scroll-content>.infinite-loading{display:block}.infinite-scroll-content-md .infinite-loading-text{color:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}.infinite-scroll-content-md .infinite-loading-spinner .spinner-lines-md line,.infinite-scroll-content-md .infinite-loading-spinner .spinner-lines-small-md line,.infinite-scroll-content-md .infinite-loading-spinner .spinner-crescent circle{stroke:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}.infinite-scroll-content-md .infinite-loading-spinner .spinner-bubbles circle,.infinite-scroll-content-md .infinite-loading-spinner .spinner-circles circle,.infinite-scroll-content-md .infinite-loading-spinner .spinner-dots circle{fill:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666))}";

const InfiniteScrollContent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.customHTMLEnabled = config.get('innerHTMLTemplatesEnabled', ENABLE_HTML_CONTENT_DEFAULT);
        this.loadingSpinner = undefined;
        this.loadingText = undefined;
    }
    componentDidLoad() {
        if (this.loadingSpinner === undefined) {
            const mode = getIonMode(this);
            this.loadingSpinner = config.get('infiniteLoadingSpinner', config.get('spinner', mode === 'ios' ? 'lines' : 'crescent'));
        }
    }
    renderLoadingText() {
        const { customHTMLEnabled, loadingText } = this;
        if (customHTMLEnabled) {
            return h("div", { class: "infinite-loading-text", innerHTML: sanitizeDOMString(loadingText) });
        }
        return h("div", { class: "infinite-loading-text" }, this.loadingText);
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '060278bf9cb0321e182352f9613be4ebbb028259', class: {
                [mode]: true,
                // Used internally for styling
                [`infinite-scroll-content-${mode}`]: true,
            } }, h("div", { key: '07d3cada920145f979ad315bd187fb878e0c3da3', class: "infinite-loading" }, this.loadingSpinner && (h("div", { key: '6254f175d7543d09f3dd47cd0589a2809182cd8c', class: "infinite-loading-spinner" }, h("ion-spinner", { key: 'a6a816d1c65b60b786333b209b63492aa716a283', name: this.loadingSpinner }))), this.loadingText !== undefined && this.renderLoadingText())));
    }
};
InfiniteScrollContent.style = {
    ios: infiniteScrollContentIosCss,
    md: infiniteScrollContentMdCss
};

export { InfiniteScrollContent as ion_infinite_scroll_content };

//# sourceMappingURL=ion-infinite-scroll-content.entry.js.map