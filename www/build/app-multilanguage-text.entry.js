import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { U as UserService } from './utils-cbf49763.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
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
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const appMultilanguageTextCss = "app-multilanguage-text ion-grid{--ion-grid-column-padding:0px;--ion-grid-padding:0px}";

const AppMultilanguageText = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.text = undefined;
        this.selectedLanguage = "en";
    }
    componentWillLoad() {
        this.selectedLanguage = UserService.userSettings.getLanguage();
        const textLanguages = Object.keys(this.text).sort();
        //check if user language is available
        if (textLanguages &&
            textLanguages.length > 0 &&
            !textLanguages.includes(this.selectedLanguage)) {
            //not available - check if english is available
            if (textLanguages.includes("en")) {
                this.selectedLanguage = "en";
            }
            else {
                this.selectedLanguage = textLanguages[0];
            }
        }
    }
    changeSelectedLanguage(ev) {
        if (ev.detail) {
            this.selectedLanguage = ev.detail;
        }
    }
    render() {
        return (h(Host, { key: '2b0ced01be73d15d7c3d9e614e690decd58101b1' }, h("ion-grid", { key: 'd973941f6fed109fb5f65e8b61e7d1aeabc83cba' }, h("ion-row", { key: '15c718870c659101ffbd3fd74f37a87083512730' }, h("ion-col", { key: '6c154fb8ef808b9f1f2c34cc35506acf9d17b9a0' }, 
        //show according to user language
        this.text[this.selectedLanguage]), h("ion-col", { key: '9c8c02db1cb04f6960c0f0586808693a881e38be', size: "1" }, h("app-language-picker", { key: '9d443656cbf471966a707d64f346b22d3c6957f5', selectedLangCode: this.selectedLanguage, picker: true, selectOnly: true, onLanguageChanged: (ev) => this.changeSelectedLanguage(ev) }))))));
    }
};
AppMultilanguageText.style = appMultilanguageTextCss;

export { AppMultilanguageText as app_multilanguage_text };

//# sourceMappingURL=app-multilanguage-text.entry.js.map