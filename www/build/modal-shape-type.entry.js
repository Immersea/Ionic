import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { al as ShapesService, R as RouterService, t as SHAPESCOLLECTION, au as ShapeType, B as SystemService, T as TranslationService } from './utils-ced1e260.js';
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

const modalShapeTypeCss = "modal-shape-type ion-list{width:100%}";

const ModalShapeType = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.shapeTypes = undefined;
        this.shapeType = undefined;
        this.updateView = true;
        this.validShapeType = false;
    }
    async componentWillLoad() {
        await this.loadShapeTypes();
    }
    async loadShapeTypes() {
        await ShapesService.downloadShapeSettings();
        this.shapeTypes = lodash.exports.cloneDeep(await ShapesService.getShapeTypes());
        if (this.shapeTypes && this.shapeTypes.length > 0) {
            this.shapeType = this.shapeTypes[0];
        }
        else {
            //create new and add to list
            this.shapeTypes = [];
            this.addShapeType();
        }
        this.validateShape();
    }
    selectType(ev) {
        this.shapeType = this.shapeTypes.find((x) => x.typeId == ev.detail.value);
        this.validateShape();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "typeId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.shapeType[n] = v;
        this.validateShape();
    }
    validateShape() {
        this.validShapeType =
            lodash.exports.isString(this.shapeType.typeId) &&
                lodash.exports.isString(this.shapeType.typeName.en) &&
                lodash.exports.isNumber(this.shapeType.decimals) &&
                this.shapeType.position > 0 &&
                lodash.exports.isString(this.shapeType.dwg.url);
        this.updateView = !this.updateView;
    }
    async editDrawing() {
        this.shapeType.dwg.id = this.shapeType.typeId;
        this.shapeType.dwg.name = this.shapeType.typeName.en;
        this.shapeType.dwg.description = "";
        const popover = await RouterService.openPopover("popover-media-loading", {
            media: this.shapeType.dwg,
        });
        popover.onDidDismiss().then(async (ev) => {
            if (ev && ev.data) {
                const mediaToUpload = {
                    [ev.data.media.id]: ev.data,
                };
                const mediaToStore = ev.data.media;
                const popover = await RouterService.openPopover("popover-media-uploader", {
                    files: mediaToUpload,
                    itemId: this.shapeType.typeId,
                    collectionId: SHAPESCOLLECTION,
                });
                popover.onDidDismiss().then((ev) => {
                    if (ev && ev.data) {
                        const urls = ev.data;
                        //update urls into media
                        this.shapeType.dwg = mediaToStore;
                        Object.keys(urls).forEach((id) => {
                            this.shapeType.dwg.url = urls[id];
                        });
                        this.save(false);
                        this.validateShape();
                    }
                });
            }
        });
    }
    addShapeType() {
        this.shapeType = new ShapeType();
        this.shapeTypes.push(this.shapeType);
        this.index = this.shapeTypes.length - 1;
    }
    duplicateShapeType() {
        this.shapeType = lodash.exports.cloneDeep(this.shapeType);
        this.shapeType.typeId = this.shapeType.typeId + "_rev.";
        this.shapeTypes.push(this.shapeType);
        this.index = this.shapeTypes.length - 1;
    }
    async deleteShapeType() {
        try {
            this.shapeTypes.splice(this.index, 1);
            this.index = 0;
            this.shapeType = this.shapeTypes[0];
            this.validateShape();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await ShapesService.uploadShapeTypes(this.shapeTypes);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'baffc4687fc65d60bed51972c1d00b18bcc0a62a' }, h("ion-content", { key: 'ecec6da24549f56e7ae2214b725cd10655ac06ff' }, h("app-banner", { key: '3e56c42c6e15e2e607c08f15a068e9209b67ea27', heightPx: 500, backgroundCoverFill: false, link: this.shapeType.dwg ? this.shapeType.dwg.url : null }), h("ion-button", { key: '7b27f0bbccd277af773ed53d3e0790531546d920', expand: "block", fill: "outline", color: "trasteel", disabled: !this.shapeType.typeId, onClick: () => this.editDrawing() }, h("ion-icon", { key: '4ea1b5aa744080f430ce6a745627cdbb7b032cb8', slot: "start", name: "create" }), h("ion-label", { key: 'eab97e6baaaca9d19e522f31c8a9818ca760aefc' }, !this.shapeType.typeId
            ? TranslationService.getTransl("media-loader-error", "Please insert the ID to upload new media.")
            : TranslationService.getTransl("edit-drawing", "Edit Drawing"))), h("ion-grid", { key: '5eb8bb913ba84cd88f0220ca8322f1adcedb138b' }, h("ion-row", { key: 'fcd18b6ec75f7a8cfae4b524977e39176d258297' }, h("ion-col", { key: '3d4693769c5d1123dd53ec9537efa90f9710647d' }, h("app-select-search", { key: '54857e8526484cc45b18e643ae6b7d043e7145f4', label: {
                tag: "shape_type",
                text: "Shape Type",
            }, value: this.shapeType.typeId, lines: "inset", selectFn: (ev) => this.selectType(ev), selectOptions: this.shapeTypes, selectValueId: "typeId", selectValueText: ["typeName", "en"], disabled: !this.validShapeType })), h("ion-col", { key: '31f266fd9eecfcca3e256f5ce214241bf2b92600', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'ab7e2bc6a3e5f6441f9da362280d20ce8e4efcb6', fill: "clear", disabled: !this.validShapeType, onClick: () => this.addShapeType() }, h("ion-icon", { key: 'c869a116a07115e00e727ddba7fd3b1b94b279fa', name: "add", slot: "start" }))), h("ion-col", { key: '3e55ae6237fe666c6bbdba2ec32fd0812e236312', size: "1", class: "ion-text-center" }, h("ion-button", { key: '2457da50890d322a6416664218a636af33a1507c', fill: "clear", disabled: !this.validShapeType, onClick: () => this.duplicateShapeType() }, h("ion-icon", { key: '64d12490361197a43e9c0b3d92f96e52322f151d', slot: "start", name: "duplicate" }))), h("ion-col", { key: '70e7fc80e43e3b70117fe4c60818f8e914b9a608', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'feab819d498709412335e8c224b5be1e87a6c509', fill: "clear", color: "danger", disabled: this.shapeTypes.length == 0, onClick: () => this.deleteShapeType() }, h("ion-icon", { key: 'd579cc1101f3b44048cd0e571dc6aef5bed7c47f', slot: "start", name: "trash" }))))), h("app-form-item", { key: '846821c3946c2e1015857deac1bd2df46ca231af', "label-text": "Position", value: this.shapeType.position, name: "position", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "minvalue",
                    options: { min: 1 },
                },
            ] }), h("app-form-item", { key: '3d9e60217c5c3a99adeab6d44e0a6dd376f022c9', "label-text": "ID", value: this.shapeType.typeId, name: "typeId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "typeId",
                        list: this.shapeTypes,
                    },
                },
            ] }), h("app-form-item", { key: '46372af29d696d23ed53a496da1a9b1d5f024869', "label-text": "Name", value: this.shapeType.typeName, name: "typeName", "input-type": "text", multiLanguage: true, "text-rows": "1", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: '1077e496a4b109ca86a8aaf7d18db279042b8d56', "label-text": "Decimals", value: this.shapeType.decimals, name: "decimals", inputStep: "1", "input-type": "number", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] })), h("app-modal-footer", { key: 'efe29928e7498018bebd03e4970f8f2544da868f', color: Environment.getAppColor(), disableSave: !this.validShapeType, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalShapeType.style = modalShapeTypeCss;

export { ModalShapeType as modal_shape_type };

//# sourceMappingURL=modal-shape-type.entry.js.map