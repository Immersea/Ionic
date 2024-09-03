import { r as registerInstance, h } from './index-d515af00.js';
import { B as SystemService, R as RouterService, O as DatasheetsService, T as TranslationService } from './utils-ced1e260.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { T as TrasteelService } from './services-7994f696.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-c3ad5e77.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
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
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const pageDatasheetDetailsCss = "page-datasheet-details #properties-grid .centered{display:flex;align-items:center;justify-content:center;text-align:center}page-datasheet-details #properties-grid .showbool{--ion-grid-column-padding:1px}page-datasheet-details #properties-grid ion-grid{--ion-grid-column-padding:2px;border-collapse:collapse;border-style:hidden}page-datasheet-details #properties-grid ion-grid ion-row:first-child{background-color:var(--ion-color-trasteel);font-weight:bold;color:var(--ion-color-trasteel-contrast)}page-datasheet-details #properties-grid ion-grid ion-col{border:1px solid black;border-bottom:0;border-right:0}page-datasheet-details #properties-grid ion-grid ion-col:last-child{border-right:1px solid black}page-datasheet-details #properties-grid ion-grid ion-row:last-child{border-bottom:1px solid black}";

const PageDatasheetDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "information", text: "Information" },
            { tag: "properties", text: "Properties" },
            { tag: "reference", text: "Reference" },
            { tag: "comments", text: "Comments" },
            { tag: "files", text: "Files", disabled: true },
        ];
        this.itemId = undefined;
        this.datasheet = undefined;
        this.updateView = true;
        this.slider = undefined;
    }
    async componentWillLoad() {
        if (this.itemId) {
            await this.loadDatasheet();
        }
        else {
            SystemService.dismissLoading();
            SystemService.presentAlertError("No Item Id");
            RouterService.goBack();
        }
    }
    async loadDatasheet() {
        try {
            this.datasheet = await DatasheetsService.getDatasheet(this.itemId);
        }
        catch (error) {
            SystemService.dismissLoading();
            SystemService.presentAlertError(error);
            RouterService.goBack();
        }
        SystemService.dismissLoading();
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-detail-datasheet", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async editDatasheet() {
        const modal = await DatasheetsService.presentDatasheetUpdate(this.itemId);
        //update customer data after modal dismiss
        modal.onDidDismiss().then(() => this.loadDatasheet());
    }
    exportDatasheet() {
        const datasheet = this.datasheet;
        datasheet["datasheetId"] = this.itemId;
        DatasheetsService.exportDatasheets([datasheet]);
    }
    deleteDs() {
        DatasheetsService.deleteDatasheet(this.itemId);
        RouterService.goBack();
    }
    duplicateDatasheet(revision) {
        DatasheetsService.duplicateDatasheet(this.itemId, revision);
        RouterService.goBack();
    }
    render() {
        return [
            h("ion-header", { key: 'ff6934bee8e03f7a8e9e9e64991d79148bd3a32f' }, h("app-navbar", { key: '1411fb805159d166f7489fbb3f06c22e7a11a6a6', text: this.datasheet.productName, color: Environment.getAppColor(), backButton: true, rightButtonText: TrasteelService.isRefraDBAdmin()
                    ? {
                        icon: "create",
                        fill: "outline",
                        tag: "edit",
                        text: "Edit",
                    }
                    : null, rightButtonFc: () => this.editDatasheet() })),
            h("ion-header", { key: 'bcecca57d8c873dd8f0f3877bf788264d1eb262c' }, h("ion-toolbar", { key: '615402f09cdb1f64ef5ac42b641ea3836d3b5f58' }, h("ion-grid", { key: 'b19e73a7adc013c6bbee50aa0628d84c3e983574', class: "ion-no-padding" }, h("ion-row", { key: 'f90bbd324e2d0e61c17970c5709ee1cbe5b88a81' }, h("ion-col", { key: '3116a4c12d4de579ca77cf09c252821ce36b887e' }, h("app-header-segment-toolbar", { key: '0e75a6bb2267c03271f2075b50339249f19385dc', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, noToolbar: true })), h("ion-col", { key: '8203aa856fd7675e1c64c17e7cd5816bee716408', size: "1" }, h("ion-button", { key: 'de6ab704db0752cc8a74954187d8e4b811180da2', fill: "clear", expand: "full", color: "trasteel", "icon-only": true, onClick: () => this.exportDatasheet() }, h("ion-icon", { key: '21271617081320e06b3d996d0dac924a3026eb31', name: "download" }))))))),
            h("ion-content", { key: '417647582b05ab382e466b20b89c78a54083e0cd', class: "slides" }, h("swiper-container", { key: '79c8aed43103a026ef159ccc0f4fe1a1eb5912a7', class: "slider-detail-datasheet swiper" }, h("swiper-wrapper", { key: '2e0c0cade15f2e76bf482a1e19afde2ad02074ef', class: "swiper-wrapper" }, h("swiper-slide", { key: '43d20bba11818de126cb27ca55d81344d3e9273b', class: "swiper-slide" }, h("ion-list", { key: '8dc1379a1c1b2803f8c2dd1eda450a1aa0db60c2', class: "ion-no-padding" }, h("app-item-detail", { key: 'e0be991042f5debe4b5ddb6566961e538db4799f', lines: "none", labelTag: "principal", labelText: "Principal", detailText: DatasheetsService.getDatasheetMajorFamilies(this.datasheet.majorFamilyId)
                    ? DatasheetsService.getDatasheetMajorFamilies(this.datasheet.majorFamilyId)[0].majorFamilyName
                    : this.datasheet.majorFamilyId }), h("app-item-detail", { key: 'fc453703c8a4c1916c87575af54a1d36004d62a3', lines: "none", labelTag: "product", labelText: "Product", detailText: DatasheetsService.getDatasheetFamilies(this.datasheet.familyId)
                    ? DatasheetsService.getDatasheetFamilies(this.datasheet.familyId)[0].familyName
                    : this.datasheet.familyId }), h("app-item-detail", { key: 'c07439d7d802f1e1961a3f3f88c1ce056ce006a4', lines: "none", labelTag: "category", labelText: "Category", detailText: DatasheetsService.getDatasheetCategories(this.datasheet.categoriesId)
                    ? DatasheetsService.getDatasheetCategories(this.datasheet.categoriesId)[0].categoriesName
                    : this.datasheet.categoriesId }), h("app-item-detail", { key: 'dceb667169ec8706f5c06b6bb7b84d2437494982', lines: "none", "label-tag": "tech-no", "label-text": "Tech. #", detailText: this.datasheet.techNo }), h("app-item-detail", { key: 'f76acb9403cb08e014c90a5566e42d003661ecac', lines: "none", "label-tag": "revision-no", "label-text": "Revision #", detailText: lodash.exports.toString(this.datasheet.revisionNo) }), h("app-item-detail", { key: '093a834ddcdb04122deb89472b36326998278800', lines: "none", "label-tag": "old", "label-text": "Old", detailText: this.datasheet.oldProduct }), h("app-item-detail", { key: 'f5365c801ce8b328ac0b7307a5b02e17f33df004', lines: "none", "label-tag": "issued-on-date", "label-text": "Issued on Date", detailText: new Date(this.datasheet.issuedOnDate).toLocaleDateString() }), h("app-item-detail", { key: 'b17dd0c5c7fab646c3c734cc63333b8a28798f32', lines: "none", "label-tag": "product-name", "label-text": "Product Name", detailText: this.datasheet.productName }), h("app-item-detail", { key: 'aaca21da1eab35645ac5ee44602ce01ac64093eb', lines: "none", "label-tag": "classification", "label-text": "Classification", detailText: this.datasheet.classification }), h("app-item-detail", { key: '80357efd6637a17fb86ca3f90c7c912366b87343', lines: "none", "label-tag": "application", "label-text": "Application", detailText: this.datasheet.application })), TrasteelService.isRefraDBAdmin() ? (h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("ion-button", { color: "danger", fill: "outline", expand: "block", onClick: () => this.deleteDs() }, h("ion-icon", { name: "trash", slot: "start" }), h("ion-label", null, TranslationService.getTransl("delete", "Delete")))), h("ion-col", null, h("ion-button", { color: "secondary", fill: "outline", expand: "block", onClick: () => this.duplicateDatasheet(true) }, h("ion-icon", { name: "copy", slot: "start" }), h("ion-label", null, TranslationService.getTransl("revision", "Revision")))), h("ion-col", null, h("ion-button", { color: "tertiary", fill: "outline", expand: "block", onClick: () => this.duplicateDatasheet(false) }, h("ion-icon", { name: "duplicate", slot: "start" }), h("ion-label", null, TranslationService.getTransl("copy", "Copy"))))))) : undefined), h("swiper-slide", { key: '2c99a3259596047880d7a6547fa8cff49c985ba2', class: "swiper-slide" }, h("div", { key: 'cfe5d5969a6f1e50da6be7e569039e2eec9babc4', id: "properties-grid" }, h("ion-grid", { key: 'a60cef1c4ee5efd362ad6b1863b2e36192924ced' }, h("ion-row", { key: '0e6652070fcc8bb56182fa2e0bd918951df24cb8' }, h("ion-col", { key: 'acc5f123896f9042bfe3f4ca9a16195e128118d1', class: "centered" }, h("small", { key: '29b5577b4e31c67b98452491d07da9bf683695b8' }, TranslationService.getTransl("type", "Type"))), h("ion-col", { key: '89fdabf85b1d0946141ec914891e5d863bebf79e', class: "centered" }, h("small", { key: '04e8eb250bfb89b6196cf76109067ba31fda974a' }, TranslationService.getTransl("name", "Name"))), h("ion-col", { key: 'fcc1ea4fcd0de11b4dd336cca76988bf285e3484', class: "centered" }, h("small", { key: '4fed9498477e2aa451518707e0b32a9e62d3b5de' }, TranslationService.getTransl("typical", "Typical"))), h("ion-col", { key: '21d7c53c8bb8ef768cf5000c9ca900bdd32e1b61', class: "centered" }, h("small", { key: 'c258b2b168a58e754592d8511abd676a387de327' }, TranslationService.getTransl("prefix", "Prefix"))), h("ion-col", { key: '26a3b828a5ec82ff872bf798c42d3da19405fce7', class: "centered" }, h("small", { key: '06a1047486bf098ce78860b205d080864d46327a' }, TranslationService.getTransl("from", "From"))), h("ion-col", { key: '733e385ea63edbcebcf0cb7aaad6dab1bb8018b0', class: "centered" }, h("small", { key: '62ea46accf79ef82be3e2992011e93d2e58b028f' }, TranslationService.getTransl("to", "To"))), h("ion-col", { key: '900b95797b6df4fedc8b41f17bbfdbb5e49cc28b', size: "1", class: "centered" }, h("small", { key: '1e44e9fa906faf835941665ead7de822c5e70e9b' }, TranslationService.getTransl("show", "Show")))), this.datasheet.orderPropertiesForExport().map((property) => (h("ion-row", null, h("ion-col", null, h("app-item-detail", { lines: "none", detailText: DatasheetsService.getDatasheetPropertyTypes(property.type)[0].typeName })), h("ion-col", null, h("app-item-detail", { lines: "none", detailText: DatasheetsService.getDatasheetPropertyNames("id", property.name)[0].nameName })), h("ion-col", { class: "centered" }, h("app-item-detail", { lines: "none", detailText: property.typical })), h("ion-col", { class: "centered" }, h("app-item-detail", { lines: "none", detailText: property.prefix })), h("ion-col", { class: "centered" }, h("app-item-detail", { lines: "none", detailText: property.lower })), h("ion-col", { class: "centered" }, h("app-item-detail", { lines: "none", detailText: property.higher })), h("ion-col", { size: "1", class: "centered showbool" }, h("app-item-detail", { lines: "none", detailText: property.show })))))))), h("swiper-slide", { key: '4b683d882584f6bc73306fe966dee735469d2dcb', class: "swiper-slide" }, h("ion-list", { key: '5b364ef0d707ee086fa89798b186e3a2b12cc3c0' }, h("app-item-detail", { key: 'cef727c27a8d43ac80df09cb76d6fd3dd64d7695', lines: "none", "label-tag": "producer", "label-text": "Producer", detailText: this.datasheet.producerName }), h("app-item-detail", { key: 'e27e1fd1be89127282032dea30514e6e6dbea5f8', lines: "none", "label-tag": "producer-ref-quality", "label-text": "Producer Reference Quality", detailText: this.datasheet.producerReferenceQuality }), h("app-item-detail", { key: '225b299c3c5dc41530e205348b7424435e960472', lines: "none", "label-tag": "competitor-ref-quality", "label-text": "Competitor Reference Quality", detailText: this.datasheet.competitorReferenceQuality }))), h("swiper-slide", { key: '60e6d2d345e1f04421862e673765b4bb62c03564', class: "swiper-slide" }, h("ion-list", { key: 'ddefc3b168b6104817e97f7777b28d041f3a6de1' }, h("app-item-detail", { key: 'aa4414eba71f5c29febe36ab1734b0ec90e3d23f', lines: "none", "label-tag": "comments", "label-text": "Comments", detailText: this.datasheet.comments }), h("app-item-detail", { key: '48d706cded3848d97182c3ed078dc0634261e650', lines: "none", "label-tag": "performance-comments", "label-text": "Performance Comments", detailText: this.datasheet.performanceComments }))), h("swiper-slide", { key: '64277051148f2a3eb7ece0ea93136f2609a29692', class: "swiper-slide" }, "FILES - TO BE DONE")))),
        ];
    }
};
PageDatasheetDetails.style = pageDatasheetDetailsCss;

export { PageDatasheetDetails as page_datasheet_details };

//# sourceMappingURL=page-datasheet-details.entry.js.map