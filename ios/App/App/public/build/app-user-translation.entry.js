import { r as registerInstance, l as createEvent, h, j as Host } from './index-d515af00.js';
import './index-be90eba5.js';
import { B as SystemService, T as TranslationService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import { b as actionSheetController } from './overlays-b3ceb97d.js';
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
import './env-0a7fccce.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const appUserTranslationCss = "app-user-translation{}";

const AppUserTranslation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.translationEmit = createEvent(this, "translationEmit", 7);
        this.userTranslation = undefined;
        this.edit = true;
        this.translations = [];
    }
    componentWillLoad() {
        const translations = [];
        Object.keys(this.userTranslation).forEach((langId) => {
            translations.push(this.userTranslation[langId]);
        });
        this.translations = lodash.exports.orderBy(translations, "langId");
    }
    async add() {
        const buttons = [];
        SystemService.getLanguages().forEach((lang) => {
            buttons.push({
                text: lang.label,
                handler: () => {
                    this.addTranslation(lang.value);
                },
            });
        });
        const action = await actionSheetController.create({
            header: TranslationService.getTransl("language", "Language"),
            buttons: buttons,
        });
        action.present();
    }
    addTranslation(lang) {
        this.translations.push({
            lang: lang,
            text: "",
        });
    }
    remove(i) {
        this.translations.splice(i, 1);
    }
    render() {
        return (h(Host, { key: 'e731e5c5acd25c761e0dc60d4ba9389103b277e6' }, this.translations.map((translation, i) => (h("ion-item", null, h("app-language-picker", { slot: "start", selectedLangCode: translation.lang }), this.edit ? ([
            h("ion-textarea", { value: translation.text, rows: 2, inputmode: "text" }),
            h("ion-button", { slot: "end", "icon-only": true, fill: "clear", onClick: () => this.remove(i) }),
        ]) : (h("ion-label", null, translation.text))))), this.edit ? (h("ion-item", { button: true, onClick: () => this.add() }, h("ion-icon", { name: "add", slot: "start" }), h("ion-label", null, h("my-transl", { tag: "add", text: "Add" })))) : undefined));
    }
};
AppUserTranslation.style = appUserTranslationCss;

export { AppUserTranslation as app_user_translation };

//# sourceMappingURL=app-user-translation.entry.js.map