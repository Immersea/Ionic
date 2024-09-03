import { r as registerInstance, h, j as Host } from './index-d515af00.js';
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

const popoverEditTranslationCss = "popover-edit-translation{}";

const PopoverEditTranslation = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.language = undefined;
        this.originalTranslation = undefined;
        this.translation = undefined;
        this.translationChanged = false;
    }
    componentWillLoad() {
        this.translation = lodash.exports.cloneDeep(this.originalTranslation);
    }
    changeTranslation(ev) {
        this.translation.translated[this.language] = ev.detail.value;
        this.translationChanged = true;
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        this.translation.isTranslated[this.language] = true;
        popoverController.dismiss(this.translation);
    }
    render() {
        return (h(Host, { key: '3a5bda6886f7f9dc681de0bae54935a9f7fa04ec' }, h("ion-content", { key: '63757e63c2bb1448763690819597354e4b25d7df' }, h("ion-grid", { key: '0db63dd7f1b48a7c7f2167683010b7432d3e00b1' }, h("ion-row", { key: '339819bb6f10556be5813124eee23a3ee96f3d76' }, h("ion-col", { key: 'b0ccb23ab5ea6f2c2e8451bb2177933d3f84d960', class: "ion-text-center" }, h("h2", { key: 'e4575692d81b90423ab98e14dc178f90b9d32a05' }, this.translation.input))), h("ion-row", { key: '3b11324ce4bfc0642f985d9052e6ace2049e4c94' }, h("ion-col", { key: '67efdb48dc09d6ae914a74882008d7300d6be4d6', class: "ion-text-center" }, h("ion-icon", { key: '1f0da9148e1a0dd10fe6431b0df493b93b65bb33', name: "arrow-down-outline" }))), h("ion-row", { key: '932484ead8dc1dc3ee880ef1698ecff9d5db9b4b' }, h("ion-col", { key: '1b5c6c086cbbd040f0a90a55d3c077f01911ced5', class: "ion-text-center" }, h("ion-input", { key: 'ddfc7d13d0ce6319750a96b967802d68333a1ebe', value: this.translation.translated[this.language], onIonChange: (ev) => this.changeTranslation(ev) }))))), h("ion-footer", { key: '695b2d27e112ef65abd1e49b971f22f0d923a4d4' }, h("app-modal-footer", { key: 'ac5b31de6f5510822c0f200c055cc2d58fd3e4eb', onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
};
PopoverEditTranslation.style = popoverEditTranslationCss;

export { PopoverEditTranslation as popover_edit_translation };

//# sourceMappingURL=popover-edit-translation.entry.js.map