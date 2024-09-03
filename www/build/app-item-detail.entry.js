import { r as registerInstance, h } from './index-d515af00.js';
import { T as TranslationService } from './utils-cbf49763.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-9be68260.js';
import './index-be90eba5.js';
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
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appItemDetailCss = "app-item-detail ion-item{border:1px solid black;background-color:#000000;--padding-end:0px;--padding-start:0px;--inner-padding-bottom:0;--inner-padding-end:0;--inner-padding-start:0;--inner-padding-top:0}";

const AppItemDetail = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.show = false;
        this.labelTag = undefined;
        this.labelText = undefined;
        this.detailTag = undefined;
        this.detailText = undefined;
        this.appendText = undefined;
        this.showItem = true;
        this.lines = "none";
        this.isDate = false;
        this.alignRight = false;
    }
    componentWillLoad() {
        this.show =
            (lodash.exports.isBoolean(this.detailText) ||
                lodash.exports.isString(this.detailText) ||
                lodash.exports.isNumber(this.detailText) ||
                lodash.exports.isObject(this.detailText)) &&
                !lodash.exports.isNull(this.detailText);
    }
    inset() {
        return (h("ion-label", null, this.labelText ? (h("p", { style: lodash.exports.isNumber(this.detailText) || this.detailText == "-"
                ? {
                    "font-size": "0.75rem",
                    color: "black",
                }
                : {
                    "font-size": "0.75rem",
                    color: "black",
                } }, this.labelTag
            ? TranslationService.getTransl(this.labelTag, this.labelText)
            : this.labelText, this.appendText ? this.appendText : undefined)) : undefined, h("h2", { style: this.alignRight
                ? {
                    "text-align": "right",
                }
                : null }, typeof this.detailText === "object" && !lodash.exports.isNull(this.detailText) ? (h("app-multilanguage-text", { text: this.detailText })) : lodash.exports.isBoolean(this.detailText) ? (this.detailText === true ? (TranslationService.getTransl("yes", "Yes")) : (TranslationService.getTransl("no", "No"))) : this.detailTag && lodash.exports.isString(this.detailText) ? (TranslationService.getTransl(this.detailTag, this.detailText)) : this.isDate ? (new Date(this.detailText).toLocaleDateString()) : (this.detailText))));
    }
    render() {
        return [
            this.show ? (this.showItem ? (h("ion-item", { lines: this.lines }, this.inset())) : (h("div", null, this.inset()))) : undefined,
        ];
    }
    static get watchers() { return {
        "detailText": ["inset"]
    }; }
};
AppItemDetail.style = appItemDetailCss;

export { AppItemDetail as app_item_detail };

//# sourceMappingURL=app-item-detail.entry.js.map