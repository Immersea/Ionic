import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { U as UserService, w as UserProfile, O as DatasheetsService, _ as Datasheet, $ as DatasheetProperty, T as TranslationService, B as SystemService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { m as modalController } from './overlays-b3ceb97d.js';
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
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const modalDatasheetUpdateCss = "modal-datasheet-update #properties-grid .showbool{--ion-grid-column-padding:1px}modal-datasheet-update #properties-grid ion-grid{--ion-grid-column-padding:2px;border-collapse:collapse;border-style:hidden}modal-datasheet-update #properties-grid ion-grid ion-row:first-child{background-color:var(--ion-color-trasteel);font-weight:bold;color:var(--ion-color-trasteel-contrast)}modal-datasheet-update #properties-grid ion-grid ion-col{border:1px solid black;border-bottom:0;border-right:0}modal-datasheet-update #properties-grid ion-grid ion-col:last-child{border-right:1px solid black}modal-datasheet-update #properties-grid ion-grid ion-row:last-child{border-bottom:1px solid black}modal-datasheet-update #properties-grid ion-grid .remove-background{padding:0}modal-datasheet-update #properties-grid ion-grid .remove-background ion-col,modal-datasheet-update #properties-grid ion-grid .remove-background ion-row{border:0px solid black;background-color:white;padding:0}";

const ModalDatasheetUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.validDatasheet = false;
        this.titles = [
            { tag: "information", text: "Information", disabled: false },
            { tag: "properties", text: "Properties", disabled: false },
            { tag: "reference", text: "Reference", disabled: false },
            { tag: "comments", text: "Comments", disabled: false },
            { tag: "files", text: "Files", disabled: true },
        ];
        this.datasheetId = undefined;
        this.duplicateDatasheet = undefined;
        this.revision = undefined;
        this.datasheet = undefined;
        this.updateView = true;
        this.scrollTop = 0;
        this.propertyNames = {};
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        await this.loadDatasheet();
    }
    async loadDatasheet() {
        if (this.datasheetId) {
            const res = await DatasheetsService.getDatasheet(this.datasheetId);
            this.datasheet = res;
        }
        else {
            const datasheet = new Datasheet(this.duplicateDatasheet ? this.duplicateDatasheet.datasheet : null);
            if (this.duplicateDatasheet && this.revision) {
                datasheet.revisionNo = datasheet.revisionNo + 1;
            }
            else {
                datasheet.techNo = DatasheetsService.getMaxDatasheetTechNo();
                datasheet.revisionNo = 0;
            }
            datasheet.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
            this.datasheet = datasheet;
        }
        this.validateDatasheet();
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-edit-datasheet", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        if (this.datasheet.productName) {
            //update properties select and validate
            setTimeout(() => {
                Object.keys(this.datasheet.properties).forEach((index) => {
                    this.selectPropertyNameForIndex(index);
                });
                this.validateDatasheet();
            });
        }
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
    }
    handleChange(ev) {
        this.datasheet[ev.detail.name] = ev.detail.value;
        this.validateDatasheet();
    }
    handlePropertyChange(index, ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        /*
        //Round decimals to the specific item
        if (n == "typical" || n == "lower" || n == "higher") {
          let decimals = 2;
          if (this.datasheet.properties[index].name)
            decimals = DatasheetsService.getDatasheetPropertyNames(
              "id",
              this.datasheet.properties[index].name
            )[0].decimals;
          console.log(
            "decimals",
            DatasheetsService.getDatasheetPropertyNames(
              "id",
              this.datasheet.properties[index].name
            )[0],
            v,
            decimals
          );
          v = roundDecimals(v, decimals);
        }*/
        this.datasheet.properties[index][n] = v;
        this.validateDatasheet();
    }
    deleteProperty(index) {
        this.datasheet.properties.splice(index, 1);
        this.validateDatasheet();
    }
    validateDatasheet() {
        this.validDatasheet =
            lodash.exports.isString(this.datasheet.productName) &&
                lodash.exports.isString(this.datasheet.familyId) &&
                lodash.exports.isString(this.datasheet.majorFamilyId) &&
                lodash.exports.isString(this.datasheet.techNo) &&
                this.datasheet.classification &&
                lodash.exports.isString(this.datasheet.categoriesId) &&
                this.checkParameters();
        this.updateSlider();
    }
    checkParameters() {
        let check = true;
        this.datasheet.properties.forEach((prop) => {
            check =
                check &&
                    DatasheetsService.getDatasheetPropertyNames("id", prop.name) &&
                    (prop.typical > 0 || prop.higher > 0 || prop.lower >= 0);
        });
        return check;
    }
    selectMajorFamily(ev) {
        this.datasheet.majorFamilyId = ev.detail.value;
        this.validateDatasheet();
    }
    selectFamily(ev) {
        this.datasheet.familyId = ev.detail.value;
        this.validateDatasheet();
    }
    selectCategory(ev) {
        this.datasheet.categoriesId = ev.detail.value;
        this.validateDatasheet();
    }
    addProperty() {
        this.datasheet.properties.push(new DatasheetProperty());
        setTimeout(() => {
            this.setPropertyTypeSelect(this.datasheet.properties.length - 1);
        }, 100);
    }
    async setPropertyTypeSelect(index) {
        const selectLocationElement = this.el.querySelector("#selectPropertyType" + index);
        if (selectLocationElement) {
            const customPopoverOptions = {
                header: TranslationService.getTransl("type", "Type"),
            };
            selectLocationElement.interfaceOptions = customPopoverOptions;
            //remove previously defined options
            const selectLocationOptions = Array.from(selectLocationElement.getElementsByTagName("ion-select-option"));
            selectLocationOptions.map((option) => {
                selectLocationElement.removeChild(option);
            });
            selectLocationElement.placeholder = TranslationService.getTransl("select", "Select");
            DatasheetsService.getDatasheetPropertyTypes().map((type) => {
                const selectOption = document.createElement("ion-select-option");
                selectOption.value = type.typeId;
                selectOption.textContent = TranslationService.getTransl(type.typeId, type.typeName);
                selectLocationElement.appendChild(selectOption);
            });
        }
        this.validateDatasheet();
    }
    selectPropertyType(index, ev) {
        this.datasheet.properties[index].type = ev.detail.value;
        this.selectPropertyNameForIndex(index);
        this.validateDatasheet();
    }
    selectPropertyNameForIndex(index) {
        let propertyNames = DatasheetsService
            .getDatasheetPropertyNames();
        if (propertyNames.length == 0)
            propertyNames = DatasheetsService.getDatasheetPropertyNames();
        this.propertyNames[index] = propertyNames;
        this.validateDatasheet();
    }
    selectPropertyName(index, ev) {
        //set id and position
        this.datasheet.properties[index].name = ev.detail.value;
        const nameValue = DatasheetsService.getDatasheetPropertyNames("id", ev.detail.value)[0];
        this.datasheet.properties[index].position = nameValue.position;
        this.validateDatasheet();
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async deleteDatasheet() {
        try {
            await DatasheetsService.deleteDatasheet(this.datasheetId);
            modalController.dismiss();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        //remove empty datasheet lines
        const properties = [];
        this.datasheet.properties.map((property) => {
            if (property.type && property.name) {
                properties.push(property);
            }
        });
        this.datasheet.properties = properties;
        //save doc
        const doc = await DatasheetsService.updateDatasheet(this.datasheetId, this.datasheet, this.userProfile.uid);
        if (!this.datasheetId) {
            this.datasheetId = doc.id;
            //update old datasheet as old
            if (this.duplicateDatasheet && this.revision) {
                this.duplicateDatasheet.datasheet.oldProduct = true;
                await DatasheetsService.updateDatasheet(this.duplicateDatasheet.id, this.duplicateDatasheet.datasheet, this.userProfile.uid);
            }
        }
        dismiss ? modalController.dismiss() : this.updateSlider();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'f282ffa12471d6a857009b8e9f8da66d7504bd2c' }, h("app-header-segment-toolbar", { key: 'fdb2f5c953fd45a3c6b10dab7a9e2d584f96fb6a', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }), h("ion-content", { key: '55e795c99bcad8fe772a1d9690fb56c473a5941e', class: "slides", onIonScroll: (ev) => (this.scrollTop = ev.detail.scrollTop) }, h("swiper-container", { key: '0e14097861f3e5f440a4375e6aede44312845bb3', class: "slider-edit-datasheet swiper" }, h("swiper-wrapper", { key: 'bbbd40cd7e0eae8737d601bac2704d3692242f19', class: "swiper-wrapper" }, h("swiper-slide", { key: '55fa2c880369e0af9912e029a475a70a2c49423f', class: "swiper-slide" }, h("ion-list", { key: 'adfa4d9a7b58cbd421b03caa4fb2ef55cc45497f', class: "ion-no-padding" }, h("app-select-search", { key: '8a37ba76bb10e0eaa9d232c382f37e84ce189ec9', color: "trasteel", label: { tag: "principal", text: "Principal" }, labelAddText: "*", value: this.datasheet && this.datasheet.majorFamilyId
                ? this.datasheet.majorFamilyId
                : null, lines: "inset", selectFn: (ev) => this.selectMajorFamily(ev), selectOptions: DatasheetsService.getDatasheetMajorFamilies(), selectValueId: "majorFamilyId", selectValueText: ["majorFamilyName"] }), h("app-select-search", { key: 'da9a35c1fbc737fc350c1233a7068569d884ae48', color: "trasteel", label: { tag: "product", text: "Product" }, labelAddText: "*", value: this.datasheet && this.datasheet.familyId
                ? this.datasheet.familyId
                : null, lines: "inset", selectFn: (ev) => this.selectFamily(ev), selectOptions: DatasheetsService.getDatasheetFamilies(), selectValueId: "familyId", selectValueText: ["familyName"] }), h("app-select-search", { key: '000c3c325772cca8448db291701fd19bf79fafbe', color: "trasteel", label: { tag: "category", text: "Category" }, labelAddText: "*", value: this.datasheet && this.datasheet.categoriesId
                ? this.datasheet.categoriesId
                : null, lines: "inset", selectFn: (ev) => this.selectCategory(ev), selectOptions: DatasheetsService.getDatasheetCategories(), selectValueId: "categoriesId", selectValueText: ["categoriesName"] }), h("app-form-item", { key: 'c4d2a59fed363e44039558012307f614f47ac0e7', lines: "inset", "label-tag": "tech-no", "label-text": "Tech. #", value: this.datasheet.techNo, name: "techNo", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '8d454b9b741448b2a1644b54e46df6c97ae0b3e0', lines: "inset", "label-tag": "revision-no", "label-text": "Revision #", value: this.datasheet.revisionNo, name: "revisionNo", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: '9484d471c991f44af2fea7cff7e74684ed3ddea6', lines: "inset", "label-tag": "old", "label-text": "Old", value: this.datasheet.oldProduct, name: "oldProduct", "input-type": "boolean", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '10af48d38f7cbfec9798058428519e1627283df2', lines: "inset", "label-tag": "issued-on-date", "label-text": "Issued on Date", value: this.datasheet.issuedOnDate, name: "issuedOnDate", "input-type": "date", "date-presentation": "date", "prefer-wheel": false, onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '513ced35af53274b4f93dc8acd2bfe11b9eec362', lines: "inset", "label-tag": "product-name", "label-text": "Product Name", value: this.datasheet.productName, name: "productName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'e8e97ec4e9052f4b166f28f7366852199cda4d5c', lines: "inset", "label-tag": "classification", "label-text": "Classification", value: this.datasheet.classification, name: "classification", "input-type": "text", multiLanguage: true, "text-rows": "4", onFormItemChanged: (ev) => this.handleChange(ev), onUpdateSlider: () => this.updateSlider(), validator: ["required"] }), h("app-form-item", { key: 'ad9bfc5d323ddb657cde6aee7afffaba3ce07f3c', lines: "inset", "label-tag": "application", "label-text": "Application", value: this.datasheet.application, name: "application", "input-type": "text", multiLanguage: true, "text-rows": "4", onFormItemChanged: (ev) => this.handleChange(ev), onUpdateSlider: () => this.updateSlider(), validator: ["required"] })), this.datasheetId ? (h("ion-footer", { class: "ion-no-border" }, h("ion-toolbar", null, h("ion-button", { expand: "block", fill: "outline", color: "danger", onClick: () => this.deleteDatasheet() }, h("ion-icon", { slot: "start", name: "trash" }), h("my-transl", { tag: "delete", text: "Delete", isLabel: true }))))) : undefined), h("swiper-slide", { key: 'd35193b8d545a2634b02d816ccfaa096fb487f54', class: "swiper-slide" }, h("div", { key: '0e59ce27827c3348e30dc514216b9549208a25f0', id: "properties-grid" }, h("ion-grid", { key: '4d1fd37c1fcca21c4612684cacb622a2a0669cab' }, h("ion-row", { key: '194859454cdb82fe1eb288bfab019382ee6f5635' }, h("ion-col", { key: 'a1bc92c0d8d481b0f1a55f2effe538b539589c28', class: "centered" }, h("small", { key: 'a76b1b8c6943c9ba15ac35ba6fda99c2f43d6bfc' }, TranslationService.getTransl("type", "Type"))), h("ion-col", { key: 'e0f2adbefa4997a2721c40988b011fa0975eb0c7', class: "centered" }, h("small", { key: '49b1368721134731e3bd8c0e6238a9d80dc874ac' }, TranslationService.getTransl("name", "Name"))), h("ion-col", { key: '5aa3fa40b6f14cd10c3122a54d140489fbcf9beb', class: "centered" }, h("small", { key: 'd2dca8d8eb0627a9167c7c0efd7d67a8fa32488c' }, TranslationService.getTransl("typical", "Typical"))), h("ion-col", { key: '43ec0ef079af9f83fa77bf4dc62ce7198705b83b', class: "centered" }, h("small", { key: '015e5e1538daccf7b2cf4b9d89f83b122ce0bc7d' }, TranslationService.getTransl("prefix", "Prefix"))), h("ion-col", { key: '9cda3b35098828428f1a4fcf087b69689ca4166c', class: "centered" }, h("small", { key: '2575d26135610d4544d11fd746636f2ce7c34b3f' }, TranslationService.getTransl("from", "From"))), h("ion-col", { key: '01dbad5c16ad24bf771ea7af748fbc2785e9846c', class: "centered" }, h("small", { key: '30755143f98588b61df9329f5c9c2dc9e53d9d37' }, TranslationService.getTransl("to", "To"))), h("ion-col", { key: '21fd7019a2afe8a6a52ae1f0efbd4eeed6c0ff14', size: "1", class: "centered" }, h("small", { key: '3365a33d3ec6b2f93f69a77c3bb498ba7a415db1' }, TranslationService.getTransl("show", "Show") +
            "/" +
            TranslationService.getTransl("delete", "Delete")))), this.datasheet.properties.map((property, index) => (h("ion-row", null, h("ion-col", null, h("app-select-search", { color: "trasteel", value: property.type ? property.type : null, lines: "none", selectFn: (ev) => this.selectPropertyType(index, ev), selectOptions: DatasheetsService.getDatasheetPropertyTypes(), selectValueId: "typeId", selectValueText: ["typeName"] })), h("ion-col", null, h("app-select-search", { color: "trasteel", value: property.name ? property.name : null, lines: "none", disabled: !this.propertyNames[index], selectFn: (ev) => this.selectPropertyName(index, ev), selectOptions: this.propertyNames[index], selectValueId: "nameId", selectValueText: ["nameName"] })), h("ion-col", { class: "centered" }, h("app-form-item", { value: property.typical, name: "typical", "input-type": "number", onFormItemChanged: (ev) => this.handlePropertyChange(index, ev) })), h("ion-col", { class: "centered" }, h("app-form-item", { value: property.prefix, name: "prefix", "input-type": "text", onFormItemChanged: (ev) => this.handlePropertyChange(index, ev) })), h("ion-col", { class: "centered" }, h("app-form-item", { value: property.lower, name: "lower", "input-type": "number", onFormItemChanged: (ev) => this.handlePropertyChange(index, ev) })), h("ion-col", { class: "centered" }, h("app-form-item", { value: property.higher, name: "higher", "input-type": "number", onFormItemChanged: (ev) => this.handlePropertyChange(index, ev) })), h("ion-col", { size: "1", class: "centered " }, h("ion-grid", { class: "remove-background" }, h("ion-row", null, h("ion-col", { class: "centered" }, h("app-form-item", { class: "ion-no-padding", value: property.show, name: "show", "input-type": "boolean", onFormItemChanged: (ev) => this.handlePropertyChange(index, ev) })), h("ion-col", { class: "centered" }, h("ion-button", { class: "ion-no-padding", "icon-only": true, color: "danger", fill: "clear", onClick: () => this.deleteProperty(index) }, h("ion-icon", { name: "trash" }))))))))))), h("io-item", { key: '8e5565197f61bcdd586796c8a72092b3da5ff048' }, h("ion-button", { key: '53566ecd843807f7f170696e7b85ffd630940b20', expand: "full", shape: "round", color: "trasteel", size: "small", onClick: () => this.addProperty() }, "+"))), h("swiper-slide", { key: '27da98cd0b1a48e84ffd25d05647b0a8213054ca', class: "swiper-slide" }, h("ion-list", { key: '009396d86a7fb558e8eb870da9bea28cc2d4e9d6' }, h("app-form-item", { key: 'e9fa9ce87adaa9c5848e36acd3599dd3d31a737d', lines: "inset", "label-tag": "producer", "label-text": "Producer", value: this.datasheet.producerName, name: "producerName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '4110a3b9ab638a7e3440d5577cfa39406e2ee0a1', lines: "inset", "label-tag": "producer-ref-quality", "label-text": "Producer Reference Quality", value: this.datasheet.producerReferenceQuality, name: "producerReferenceQuality", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '85fd595c637c9e601175912a9853a2ac7dfb5dcd', lines: "inset", "label-tag": "competitor-ref-quality", "label-text": "Competitor Reference Quality", value: this.datasheet.competitorReferenceQuality, name: "competitorReferenceQuality", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }))), h("swiper-slide", { key: '5db89565243268f24972bd108410b9fa1633de51', class: "swiper-slide" }, h("ion-list", { key: 'a84d1541a4033ddd16fffc5f5b6cfc6e502e627c' }, h("app-form-item", { key: '2393f68195b45e69a3e5f17c2cc174b60dbd958f', lines: "inset", "label-tag": "comments", "label-text": "Comments", value: this.datasheet.comments, name: "comments", "input-type": "text", "text-rows": "4", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }), h("app-form-item", { key: '6583583af31af947d21154deb6aa0f52feecc1e6', lines: "inset", "label-tag": "performance-comments", "label-text": "Performance Comments", value: this.datasheet.performanceComments, name: "performanceComments", "input-type": "text", "text-rows": "4", onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }))), h("swiper-slide", { key: '10bdf7441d4ba3556084855b818d0e5a63b7ccee', class: "swiper-slide" }, "FILES - TO BE DONE")))), h("app-modal-footer", { key: 'f9405b116191498b48f29b3cfc0c5ce4d650c4fa', color: Environment.getAppColor(), disableSave: !this.validDatasheet, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDatasheetUpdate.style = modalDatasheetUpdateCss;

export { ModalDatasheetUpdate as modal_datasheet_update };

//# sourceMappingURL=modal-datasheet-update.entry.js.map