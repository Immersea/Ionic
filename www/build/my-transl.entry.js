import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { T as TranslationService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appTranslateCss = "app-translate{}";

const AppTranslate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.tag = undefined;
        this.text = undefined;
        this.appendText = undefined;
        this.replace = undefined;
        this.isLabel = false;
        this.translations = undefined;
        this.translation = undefined;
    }
    update() {
        this.updateTranslation();
    }
    componentWillLoad() {
        //subscribe to translation service to receive updates on the language or translations
        TranslationService.updatedTranslation.subscribe(() => {
            this.updateTranslation();
        });
        this.updateTranslation();
    }
    updateTranslation() {
        this.translation =
            TranslationService.getTransl(this.tag, this.text, this.replace) +
                (this.appendText ? this.appendText : "");
    }
    render() {
        return this.isLabel ? (h(Host, null, h("ion-label", null, this.translation))) : (h(Host, null, this.translation));
    }
    static get watchers() { return {
        "tag": ["update"],
        "appendText": ["update"],
        "replace": ["update"]
    }; }
};
AppTranslate.style = appTranslateCss;

export { AppTranslate as my_transl };

//# sourceMappingURL=my-transl.entry.js.map