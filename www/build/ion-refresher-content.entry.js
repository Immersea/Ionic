import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { E as ENABLE_HTML_CONTENT_DEFAULT, s as sanitizeDOMString } from './config-45217ee2.js';
import { f as arrowDown, g as caretBackSharp } from './index-32818e2b.js';
import { c as config, g as getIonMode } from './ionic-global-c07767bf.js';
import { e as supportsRubberBandScrolling } from './refresher.utils-59c2bd7e.js';
import { S as SPINNERS } from './spinner-configs-839148f8.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './helpers-ff3eb5b3.js';

const RefresherContent = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.customHTMLEnabled = config.get('innerHTMLTemplatesEnabled', ENABLE_HTML_CONTENT_DEFAULT);
        this.pullingIcon = undefined;
        this.pullingText = undefined;
        this.refreshingSpinner = undefined;
        this.refreshingText = undefined;
    }
    componentWillLoad() {
        if (this.pullingIcon === undefined) {
            /**
             * The native iOS refresher uses a spinner instead of
             * an icon, so we need to see if this device supports
             * the native iOS refresher.
             */
            const hasRubberBandScrolling = supportsRubberBandScrolling();
            const mode = getIonMode(this);
            const overflowRefresher = hasRubberBandScrolling ? 'lines' : arrowDown;
            this.pullingIcon = config.get('refreshingIcon', mode === 'ios' && hasRubberBandScrolling ? config.get('spinner', overflowRefresher) : 'circular');
        }
        if (this.refreshingSpinner === undefined) {
            const mode = getIonMode(this);
            this.refreshingSpinner = config.get('refreshingSpinner', config.get('spinner', mode === 'ios' ? 'lines' : 'circular'));
        }
    }
    renderPullingText() {
        const { customHTMLEnabled, pullingText } = this;
        if (customHTMLEnabled) {
            return h("div", { class: "refresher-pulling-text", innerHTML: sanitizeDOMString(pullingText) });
        }
        return h("div", { class: "refresher-pulling-text" }, pullingText);
    }
    renderRefreshingText() {
        const { customHTMLEnabled, refreshingText } = this;
        if (customHTMLEnabled) {
            return h("div", { class: "refresher-refreshing-text", innerHTML: sanitizeDOMString(refreshingText) });
        }
        return h("div", { class: "refresher-refreshing-text" }, refreshingText);
    }
    render() {
        const pullingIcon = this.pullingIcon;
        const hasSpinner = pullingIcon != null && SPINNERS[pullingIcon] !== undefined;
        const mode = getIonMode(this);
        return (h(Host, { key: '1bec5b4da221c69d856f3f5ddf40f2e03ebf2a4c', class: mode }, h("div", { key: '4fcc526c4f1881e9368d9cd16bd7030919bd3841', class: "refresher-pulling" }, this.pullingIcon && hasSpinner && (h("div", { key: 'a4e9e2e12c2d7faefc8303ec8c021f999ddf308e', class: "refresher-pulling-icon" }, h("div", { key: '5a2d215feb7fb4b64d540d3a65c0f24b415a2433', class: "spinner-arrow-container" }, h("ion-spinner", { key: 'abef2621d671ac6ff0abac43a702cbd825b7f127', name: this.pullingIcon, paused: true }), mode === 'md' && this.pullingIcon === 'circular' && (h("div", { key: '30087d672c3780672a05874cd93cd099b2855462', class: "arrow-container" }, h("ion-icon", { key: '5e30333dee469aec0d8efc8c4e6dabb619c6f363', icon: caretBackSharp, "aria-hidden": "true" })))))), this.pullingIcon && !hasSpinner && (h("div", { key: '48fe72b5ce8ded633c6ee799cebb520b9c8be528', class: "refresher-pulling-icon" }, h("ion-icon", { key: 'd8dfd5d42056b1c0a436c5006affb255407816c0', icon: this.pullingIcon, lazy: false, "aria-hidden": "true" }))), this.pullingText !== undefined && this.renderPullingText()), h("div", { key: 'c2cbfb94f157c82601ffe7bb815ff82ebc7c0a49', class: "refresher-refreshing" }, this.refreshingSpinner && (h("div", { key: '17f3ebe6a31768d5e389f45a2c12f68600185db9', class: "refresher-refreshing-icon" }, h("ion-spinner", { key: 'e8e61f8d7189c9939bba184201c9509d1d5b0fad', name: this.refreshingSpinner }))), this.refreshingText !== undefined && this.renderRefreshingText())));
    }
    get el() { return getElement(this); }
};

export { RefresherContent as ion_refresher_content };

//# sourceMappingURL=ion-refresher-content.entry.js.map