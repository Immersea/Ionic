import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { R as RouterService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
import './env-c3ad5e77.js';
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
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const appAdminTranslationsCss = "app-admin-translations{}app-admin-translations ion-grid{width:100%}";

const AppAdminTranslations = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.translationChanged = createEvent(this, "translationChanged", 7);
        this.groups = ["false", "true"];
        this.translations = undefined;
        this.language = undefined;
        this.orderedTranslations = { false: [], true: [] };
        this.updateView = false;
    }
    updateLanguage() {
        this.updateTranslations();
    }
    updateTranslations() {
        if (this.translations && this.translations.length > 0) {
            const grouped = lodash.exports.groupBy(this.translations, "isTranslated." + this.language);
            this.orderedTranslations = {
                false: grouped.false ? grouped.false : [],
                true: grouped.true ? grouped.true : [],
            };
            this.updateView = !this.updateView;
        }
    }
    async updateTranslation(translation) {
        const popover = await RouterService.openPopover("popover-edit-translation", { language: this.language, originalTranslation: translation });
        popover.onDidDismiss().then((res) => {
            if (res && res.data) {
                this.translationChanged.emit(res.data);
            }
        });
    }
    render() {
        return (h("ion-grid", { key: 'ead89c7a80cda7ba16b568a11e827dce6bd00c4d' }, h("ion-row", { key: '805a22c16a09f8be5a8a4d62c5d32afe5da90fdd' }, h("ion-col", { key: 'acb01b627ad95f8a3f52bb86f1c4633710b695d3', size: "1" }), h("ion-col", { key: 'b165a94728314a6d858b9371c128a51867170eac', class: "ion-text-start" }, "ID"), h("ion-col", { key: 'fc0b4f031721510a861c12a436139ceaf8837aa9', size: "1" }, h("ion-icon", { key: 'a38d82e5c8d8f50085444f716f995291f34acdd4', name: "arrow-forward-outline" })), h("ion-col", { key: 'bb92dfeb05f73e48d82b4ba5991807e4deae100d', class: "ion-text-start" }, "Original"), h("ion-col", { key: '34e42c22aa49023a7d6813497abed615242b30f7', size: "1" }, h("ion-icon", { key: 'e6d3ca08794dafdc1dac3a89eb6865bac1282427', name: "arrow-forward-outline" })), h("ion-col", { key: '8ad8c363cd568e16d1e66dc953baa12cabcbac42', class: "ion-text-start" }, "Translation")), this.groups.map((isTranslated) => [
            h("ion-row", null, h("ion-col", null, h("ion-list-header", { lines: "full" }, isTranslated === "true"
                ? "Already Translated"
                : "To Be Translated", h("span", null), h("ion-badge", null, this.orderedTranslations[isTranslated].length)))),
            this.orderedTranslations[isTranslated].length > 0
                ? this.orderedTranslations[isTranslated].map((translation) => (h("ion-row", null, h("ion-col", null, h("ion-item", { button: true, detail: false, onClick: () => this.updateTranslation(translation), class: "ion-no-padding" }, h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "1" }, h("ion-icon", { name: translation.isTranslated[this.language]
                        ? "checkmark"
                        : "close", color: translation.isTranslated[this.language]
                        ? "success"
                        : "danger" })), h("ion-col", { class: "ion-text-start" }, translation.id), h("ion-col", { size: "1" }, h("ion-icon", { name: "arrow-forward-outline" })), h("ion-col", { class: "ion-text-start" }, translation.input), h("ion-col", { size: "1" }, h("ion-icon", { name: "arrow-forward-outline" })), h("ion-col", { class: "ion-text-start" }, translation.translated
                    ? translation.translated[this.language]
                    : undefined))))))))
                : undefined,
        ])));
    }
    static get watchers() { return {
        "language": ["updateLanguage"],
        "translations": ["updateTranslations"]
    }; }
};
AppAdminTranslations.style = appAdminTranslationsCss;

export { AppAdminTranslations as app_admin_translations };

//# sourceMappingURL=app-admin-translations.entry.js.map