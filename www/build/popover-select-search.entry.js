import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
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

const popoverSelectSearchCss = "popover-select-search{}popover-select-search .boldText{font-weight:bold}";

const PopoverSelectSearch = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.selectOptions = undefined;
        this.selectValueText = undefined;
        this.placeholder = "Search";
        this.selectValueId = undefined;
        this.value = undefined;
        this.filteredOptions = undefined;
    }
    componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.filteredOptions = lodash.exports.cloneDeep(this.selectOptions);
    }
    componentDidLoad() {
        const searchbar = this.el.querySelector("ion-searchbar");
        if (searchbar) {
            searchbar.componentOnReady().then(() => {
                setTimeout(() => {
                    searchbar.setFocus();
                });
            });
        }
    }
    handleSearch(ev) {
        let searchString = "";
        const target = ev.target;
        if (target)
            searchString = target.value.toLowerCase();
        this.filteredOptions = [];
        this.selectOptions.forEach((option) => {
            const text = this.getTextValue(option);
            if (lodash.exports.includes(lodash.exports.toLower(text), searchString)) {
                this.filteredOptions.push(option);
            }
        });
    }
    handleSelect(ev) {
        popoverController.dismiss(ev);
    }
    close() {
        popoverController.dismiss();
    }
    getTextValue(item) {
        let textValue = lodash.exports.cloneDeep(item);
        let ret = null;
        for (let index = 0; index < this.selectValueText.length; index++) {
            const value = this.selectValueText[index];
            if (lodash.exports.isString(textValue[value])) {
                ret = (ret ? ret + "-" : "") + textValue[value];
            }
            else if (lodash.exports.isObject(textValue[value])) {
                index++;
                //in case of TextMultiLanguage the second text is the language
                ret =
                    (ret ? ret + "-" : "") +
                        textValue[value][this.selectValueText[index]];
            }
        }
        return ret;
    }
    render() {
        return (h(Host, { key: 'e50443894e2d01c6cb7998e8512cbe5f9a805733' }, h("ion-header", { key: '936778b6ea3bfdc166edacd031a6c16c6fa2a544', translucent: true }, h("ion-toolbar", { key: 'e2ae965df9fed2bfc23cd6ba767d9ba6ca9c17f7' }, h("ion-grid", { key: '64174732a2af70fc7d7e7b9451520b5c2f28657d', class: "ion-no-padding" }, h("ion-row", { key: '01591f872ab09a36882bcd0841a02bc2370c7f17' }, h("ion-col", { key: '4ae66bf1c724147ec8c120e7bf126470f01660e7', size: "10" }, h("ion-searchbar", { key: 'f7b806ce5f8a9c32fa81ecdaf8f1f484a804dac0', animated: true, debounce: 250, placeholder: this.placeholder, onIonInput: (ev) => this.handleSearch(ev) })), h("ion-col", { key: '0ffaf755b91ad0e6730cf8ac514bc3fa0e4e2aa9', size: "1" }, h("ion-button", { key: '80660b60888699e53a80182808ce8114ad36644c', color: Environment.getAppColor(), "icon-only": true, fill: "clear", onClick: this.close }, h("ion-icon", { key: '20c3479f5f0a233520d4d1c31fb60834134c0b47', name: "close" }))))))), h("ion-content", { key: '7c936b64226c306599ccb1bc20936eefb6b4f6ce' }, h("ion-list", { key: '3eb47a1f2d65205edbf0eb4c9d8ad91ceb6c5c1f' }, this.filteredOptions.map((option) => (h("ion-item", { button: true, onClick: () => this.handleSelect(option), class: option[this.selectValueId] == this.value ? "boldText" : "" }, option[this.selectValueId] == this.value ? (h("ion-icon", { name: "checkmark" })) : undefined, h("ion-label", null, this.getTextValue(option)))))))));
    }
    get el() { return getElement(this); }
};
PopoverSelectSearch.style = popoverSelectSearchCss;

export { PopoverSelectSearch as popover_select_search };

//# sourceMappingURL=popover-select-search.entry.js.map