import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { B as SystemService, f as firestore, ay as TRANSLATIONSCOLLECTION, a7 as slideHeight, az as CallableFunctionsService, D as DatabaseService, U as UserService, T as TranslationService } from './utils-ced1e260.js';
import { O as onSnapshot, Q as query, R as collection, W as orderBy } from './map-fe092362.js';
import { S as Swiper } from './swiper-a30cd476.js';
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
import './index-9b61a50b.js';
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageAdminTranslationsCss = "page-admin-translations app-admin-translations{width:100%;height:100%}";

const PageAdminTranslations = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.segment = "translations";
        this.slider = undefined;
        this.translations = [];
        this.filteredTranslations = [];
        this.filter = "";
        this.translationsBackup = [];
        this.translationsChanged = {};
        this.updateView = false;
    }
    componentWillLoad() {
        this.languages = SystemService.getLanguages();
        this.selectedLanguage = this.languages[0];
        this.translationsSub = onSnapshot(query(collection(firestore, TRANSLATIONSCOLLECTION), orderBy("input")), (translations) => {
            this.translations = [];
            translations.forEach((doc) => {
                const trans = doc.data();
                trans["id"] = doc.id;
                this.translations.push(trans);
            });
            this.translationsBackup = lodash.exports.cloneDeep(this.translations);
            this.filterTranslations();
        });
    }
    componentDidLoad() {
        this.setSliderHeight();
    }
    setSliderHeight() {
        this.slider = new Swiper(".slider-translations", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                    this.slider.updateSize();
                },
            },
        });
        //reset sliders height inside slider
        const slideContainers = Array.from(this.el.getElementsByClassName("slide-container"));
        slideContainers.map((container) => {
            container.setAttribute("style", "height: " + slideHeight(null, 4) + "px");
        });
        this.slider.updateSize();
        this.updateView = !this.updateView;
    }
    disconnectedCallback() {
        this.translationsSub();
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = ev.detail.value;
            if (ev.detail.value == "admin") {
                this.slider.slideTo(1);
            }
            else if (ev.detail.value == "translations") {
                this.slider.slideTo(0);
            }
            this.updateView = !this.updateView;
        }
    }
    selectLanguage(ev) {
        this.selectedLanguage = ev.target.value;
        this.updateView = !this.updateView;
    }
    async runTranslationsScript() {
        try {
            await CallableFunctionsService.updateTranslations();
            SystemService.presentAlert("Done", "Translations saved!");
        }
        catch (error) {
            console.log("error runTranslationsScript", error);
        }
    }
    translationChanged(ev) {
        if (ev && ev.detail) {
            const updated = ev.detail;
            this.translationsChanged[updated.id] = updated;
            let index = this.translations.findIndex((x) => x.id === updated.id);
            this.translations[index] = updated;
            this.translations = [...this.translations];
            index = this.filteredTranslations.findIndex((x) => x.id === updated.id);
            this.filteredTranslations[index] = updated;
            this.filteredTranslations = [...this.filteredTranslations];
            this.updateView = !this.updateView;
        }
    }
    filterTranslations(ev) {
        if (ev && ev.target.value) {
            this.filter = ev.target.value;
        }
        if (this.filter && this.filter !== "") {
            this.filteredTranslations = this.translations.filter((trans) => trans.input.toLowerCase().includes(this.filter.toLowerCase()));
        }
        else {
            this.filteredTranslations = lodash.exports.cloneDeep(this.translations);
        }
        this.updateView = !this.updateView;
    }
    close() {
        this.translations = lodash.exports.cloneDeep(this.translationsBackup);
        this.filterTranslations();
    }
    async save() {
        const promises = [];
        Object.keys(this.translationsChanged).map((transId) => {
            const translation = this.translationsChanged[transId];
            //remove id written by query
            delete translation.id;
            promises.push(DatabaseService.updateDocument(TRANSLATIONSCOLLECTION, transId, translation));
        });
        //execute writes
        await Promise.all(promises);
        this.translationsChanged = [];
    }
    render() {
        return [
            h("ion-header", { key: '921a9345bb80d372bcd6e2265b3a5125757bac95' }, h("app-navbar", { key: 'a3467532f424f845f2f4097158cfcc5ee162ac3b', color: "udive", tag: "translations", text: "Translations" })),
            UserService.userRoles && UserService.userRoles.isSuperAdmin()
                ? [
                    h("ion-header", null, h("ion-toolbar", { color: "udive", class: "no-safe-padding" }, h("ion-segment", { mode: "md", onIonChange: (ev) => this.segmentChanged(ev), value: this.segment }, h("ion-segment-button", { value: "translations", layout: "icon-start" }, h("ion-label", null, "TRANSLATIONS")), h("ion-segment-button", { value: "admin", layout: "icon-start" }, h("ion-label", null, "ADMIN"))))),
                    this.segment == "translations" ? (h("ion-header", null, h("ion-toolbar", { color: "udive" }, h("ion-searchbar", { animated: true, placeholder: TranslationService.getTransl("search", "Search"), value: this.filter, debounce: 250, onIonInput: (ev) => this.filterTranslations(ev) })), h("ion-toolbar", { color: "udive" }, h("ion-item", null, h("ion-select", { label: TranslationService.getTransl("language", "Language"), labelPlacement: "floating", interface: "action-sheet", value: this.selectedLanguage, onIonChange: (ev) => this.selectLanguage(ev) }, this.languages.map((language) => (h("ion-select-option", { value: language }, language.label)))), h("ion-icon", { slot: "end", class: "flag-icon flag-icon-" +
                            (this.selectedLanguage.countryCode == "en"
                                ? "gb"
                                : this.selectedLanguage.countryCode) }))))) : undefined,
                ]
                : undefined,
            h("ion-content", { key: 'b822d64d30afa3c7bdd7c241c15c70cca202aaf5' }, h("swiper-container", { key: 'f5581d0b0d4751c9df8453a07e12a7695cf7498a', class: "slider-translations swiper" }, h("swiper-wrapper", { key: 'f30110b66e54e00e06d155cf5550880239d230a2', class: "swiper-wrapper" }, h("swiper-slide", { key: '19e3be19dffe3ed0810648c44bba3e86d6d548a6', class: "swiper-slide" }, h("ion-content", { key: 'b30963752c735da0d5a29673fb97218f5839e4c9', class: "slide-container" }, h("ion-grid", { key: '58560d1ded6a6fa509f845e54dc0a573bf383623' }, h("ion-row", { key: 'dc0e1febcf5eadee6596056445ec84e925bd5ee9' }, h("ion-col", { key: '93ee8a205ec7189fcdebbc2a42c3e63c737c7ce2' }, h("app-admin-translations", { key: 'f501f5fa5f435489beaaddebc1fbbb9c699131d0', translations: this.filteredTranslations, language: this.selectedLanguage.value, onTranslationChanged: (ev) => this.translationChanged(ev) })))))), UserService.userRoles && UserService.userRoles.isSuperAdmin() ? (h("swiper-slide", { class: "swiper-slide" }, h("ion-content", { class: "slide-container" }, h("ion-button", { size: "large", onClick: () => this.runTranslationsScript() }, "Run Translations Script")))) : undefined))),
            Object.keys(this.translationsChanged).length > 0 ? (h("app-modal-footer", { onCancelEmit: () => this.close(), onSaveEmit: () => this.save() })) : undefined,
        ];
    }
    get el() { return getElement(this); }
};
PageAdminTranslations.style = pageAdminTranslationsCss;

export { PageAdminTranslations as page_admin_translations };

//# sourceMappingURL=page-admin-translations.entry.js.map