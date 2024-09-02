import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './_commonjsHelpers-1a56c7bc.js';
import './framework-delegate-779ab78c.js';

const appSelectSearchCss = "";

const AppSelectSearch = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.label = undefined;
        this.labelAddText = undefined;
        this.lines = undefined;
        this.selectFn = undefined;
        this.selectOptions = undefined;
        this.value = undefined;
        this.placeholder = undefined;
        this.selectValueId = undefined;
        this.selectValueText = undefined;
        this.disabled = false;
        this.updateView = false;
    }
    componentWillLoad() { }
    async openSearchPopover() {
        const popover = await popoverController.create({
            component: "popover-select-search",
            componentProps: {
                label: this.label,
                selectOptions: this.selectOptions,
                selectValueText: this.selectValueText,
                selectValueId: this.selectValueId,
                value: this.value,
                placeholder: this.placeholder,
            },
            event: null,
            translucent: true,
        });
        popover.onDidDismiss().then(async (ev) => {
            if (ev && ev.data) {
                this.value = ev.data[this.selectValueId];
                //execute function and return selected value id - return same ev as ion-select
                this.selectFn({ detail: { value: this.value } });
                this.updateView = !this.updateView;
            }
        });
        popover.present();
    }
    getTextValue() {
        const item = lodash.exports.find(this.selectOptions, (x) => x[this.selectValueId] == this.value);
        let text = this.value;
        if (item) {
            text = lodash.exports.cloneDeep(item);
        }
        let ret = null;
        for (let index = 0; index < this.selectValueText.length; index++) {
            const value = this.selectValueText[index];
            if (lodash.exports.isString(text[value])) {
                ret = (ret ? ret + "-" : "") + text[value];
            }
            else if (lodash.exports.isObject(text[value])) {
                index++;
                //in case of TextMultiLanguage the second text is the language
                ret = (ret ? ret + "-" : "") + text[value][this.selectValueText[index]];
            }
        }
        return ret;
    }
    render() {
        return (h("ion-item", { key: '294d6301416ee2384f494c4277d2503119562652', button: true, lines: this.lines, disabled: this.disabled, onClick: () => this.openSearchPopover() }, h("ion-label", { key: '84554efb25b72adc0bb9453403857c0a2dabdd2e' }, this.value
            ? [
                this.label ? (h("p", { style: {
                        "font-size": "0.75rem",
                        color: "black",
                    } }, h("my-transl", { tag: this.label.tag, text: this.label.text }), this.labelAddText ? this.labelAddText : "")) : undefined,
                h("h2", null, this.getTextValue()),
            ]
            : this.label
                ? [
                    h("my-transl", { tag: this.label.tag, text: this.label.text }),
                    this.labelAddText ? this.labelAddText : "",
                ]
                : undefined), h("ion-icon", { key: 'c73b4077d2f233f2fa3f48dedab5d1288a4452a2', name: "caret-down", slot: "end", size: "small" })));
    }
    get el() { return getElement(this); }
};
AppSelectSearch.style = appSelectSearchCss;

export { AppSelectSearch as app_select_search };

//# sourceMappingURL=app-select-search.entry.js.map