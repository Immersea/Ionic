import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, w as UserProfile, z as UserSettings, d as DiveSitesService, a8 as DiveSite, a2 as mapHeight, T as TranslationService, R as RouterService, e as DIVESITESCOLLECTION } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { N as MapService } from './map-fe092362.js';
import { E as Environment } from './env-c3ad5e77.js';
import { a as alertController, m as modalController } from './overlays-b3ceb97d.js';
import './index-9b61a50b.js';
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './ionic-global-c07767bf.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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
import './framework-delegate-779ab78c.js';

const modalDiveSiteUpdateCss = "modal-dive-site-update ion-list{width:100%}";

const ModalDiveSiteUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.stdConfigurations = [];
        this.diveSiteId = undefined;
        this.diveSite = undefined;
        this.segment = "map";
        this.updateView = true;
        this.validSite = false;
        this.titles = [
            { tag: "map" },
            { tag: "position" },
            { tag: "information" },
            { tag: "dive-profiles", text: "Dive Profiles" },
            { tag: "team" },
        ];
        this.slider = undefined;
    }
    async componentWillLoad() {
        this.userProfileSub$ = UserService.userProfile$.subscribe((userProfile) => {
            this.userProfile = new UserProfile(userProfile);
        });
        this.userSettingsSub$ = UserService.userSettings$.subscribe((userSettings) => {
            this.userSettings = new UserSettings(userSettings);
            this.stdConfigurations = lodash.exports.cloneDeep(this.userSettings.userConfigurations);
        });
        await this.loadDiveSite();
    }
    async loadDiveSite() {
        if (this.diveSiteId) {
            this.diveSite = await DiveSitesService.getDiveSite(this.diveSiteId);
            this.draggableMarkerPosition = {
                lat: this.diveSite.position.geopoint.latitude,
                lon: this.diveSite.position.geopoint.longitude,
            };
        }
        else {
            this.diveSite = new DiveSite();
            this.diveSite.users = {
                [UserService.userRoles.uid]: ["owner"],
            };
            this.draggableMarkerPosition = {};
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-site", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
        });
        this.setSelectOptions();
        //reset map height inside slide
        await customElements.whenDefined("app-map");
        this.mapElement = this.el.querySelector("#map");
        const mapContainer = this.el.querySelector("#map-container");
        mapContainer.setAttribute("style", "height: " + mapHeight(this.diveSite, true) + "px"); //-cover photo -slider  - footer
        this.mapElement["mapLoaded"]().then(() => {
            this.mapElement.triggerMapResize();
        });
        this.mapElement.triggerMapResize();
        this.validateSite();
    }
    disconnectedCallback() {
        this.userProfileSub$.unsubscribe();
        this.userSettingsSub$.unsubscribe();
    }
    setSelectOptions() {
        const selectSiteTypeElement = this.el.querySelector("#dive-type-select");
        const customSiteTypePopoverOptions = {
            header: TranslationService.getTransl("site-type", "Site Type"),
        };
        selectSiteTypeElement.interfaceOptions = customSiteTypePopoverOptions;
        selectSiteTypeElement.placeholder = TranslationService.getTransl("select", "Select");
        lodash.exports.each(DiveSitesService.getSiteTypes(), (val) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = val.type;
            selectOption.textContent = val.name;
            selectSiteTypeElement.appendChild(selectOption);
        });
        const selectEntryTypeElement = this.el.querySelector("#entry-type-select");
        const customEntryTypePopoverOptions = {
            header: TranslationService.getTransl("entry-type", "Entry Type"),
        };
        selectEntryTypeElement.interfaceOptions = customEntryTypePopoverOptions;
        selectEntryTypeElement.placeholder = TranslationService.getTransl("select", "Select");
        lodash.exports.each(DiveSitesService.getEntryTypes(), (val) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = val.type;
            selectOption.textContent = val.name;
            selectEntryTypeElement.appendChild(selectOption);
        });
        const selectSeabedCompElement = this.el.querySelector("#seabed-comp-select");
        const customSeabedCompPopoverOptions = {
            header: TranslationService.getTransl("seabed-comp", "Seabed Composition"),
        };
        selectSeabedCompElement.interfaceOptions = customSeabedCompPopoverOptions;
        selectSeabedCompElement.placeholder = TranslationService.getTransl("select", "Select");
        lodash.exports.each(DiveSitesService.getSeabedCompositions(), (val) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = val.type;
            selectOption.textContent = val.name;
            selectSeabedCompElement.appendChild(selectOption);
        });
        const selectSeabedCoverElement = this.el.querySelector("#seabed-cover-select");
        const customSeabedCoverPopoverOptions = {
            header: TranslationService.getTransl("seabed-cover", "Seabed Cover"),
        };
        selectSeabedCoverElement.interfaceOptions = customSeabedCoverPopoverOptions;
        selectSeabedCoverElement.placeholder = TranslationService.getTransl("select", "Select");
        lodash.exports.each(DiveSitesService.getSeabedCovers(), (val) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = val.type;
            selectOption.textContent = val.name;
            selectSeabedCoverElement.appendChild(selectOption);
        });
    }
    updateLocation(ev) {
        this.draggableMarkerPosition = {
            lat: lodash.exports.toNumber(ev.detail.lat),
            lon: lodash.exports.toNumber(ev.detail.lon),
        };
        this.diveSite.position = MapService.getPosition(ev.detail.lat, ev.detail.lon);
        this.validateSite();
    }
    updateAddress(ev) {
        this.diveSite.setAddress(ev.detail);
    }
    handleChange(ev) {
        this.diveSite[ev.detail.name] = ev.detail.value;
        this.validateSite();
    }
    handleInformationChange(ev) {
        switch (ev.detail.name) {
            case "minDepth":
                this.diveSite.information.minDepth = lodash.exports.toNumber(ev.detail.value);
                break;
            case "maxDepth":
                this.diveSite.information.maxDepth = lodash.exports.toNumber(ev.detail.value);
                break;
            case "waterTemp.spring":
                this.diveSite.information.waterTemp.spring = ev.detail.value;
                break;
            case "waterTemp.summer":
                this.diveSite.information.waterTemp.summer = ev.detail.value;
                break;
            case "waterTemp.autumn":
                this.diveSite.information.waterTemp.autumn = ev.detail.value;
                break;
            case "waterTemp.winter":
                this.diveSite.information.waterTemp.winter = ev.detail.value;
                break;
            default:
                this.diveSite.information[ev.detail.name] = ev.detail.value;
        }
        this.validateSite();
    }
    updateParam(param, ev) {
        let value = ev.detail.value;
        switch (param) {
            case "type":
                this.diveSite.type = value;
                break;
            case "entryType":
                this.diveSite.information.entryType = value;
                break;
            case "seabedComposition":
                this.diveSite.information.seabedComposition = value;
                break;
            case "seabedCover":
                this.diveSite.information.seabedCover = value;
                break;
        }
        this.validateSite();
    }
    async addDivePlan() {
        let inputs = [];
        lodash.exports.forEach(this.stdConfigurations, (conf, key) => {
            inputs.push({
                type: "radio",
                label: conf.stdName,
                value: key,
                checked: key == 0 ? true : false,
            });
        });
        const alert = await alertController.create({
            header: TranslationService.getTransl("select-standard-configuration", "Select standard configuration"),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: (data) => {
                        this.addDivePlanWithConf(this.stdConfigurations[data]);
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    cssClass: "secondary",
                },
            ],
            inputs: inputs,
        });
        alert.present();
    }
    async addDivePlanWithConf(selectedConfiguration) {
        const openModal = await RouterService.openModal("modal-dive-template", {
            selectedConfiguration: selectedConfiguration,
            stdConfigurations: this.stdConfigurations,
            dive: 0,
            user: this.userProfile,
        });
        openModal.onDidDismiss().then((divePlan) => {
            const dpModal = divePlan.data;
            if (dpModal) {
                dpModal.dives[0].diveSiteId = this.diveSiteId;
                this.diveSite.divePlans.push(dpModal);
                this.updateView = !this.updateView;
            }
        });
    }
    async viewDivePlan(plan, i) {
        this.diveSite.divePlans[i] = plan.detail;
        this.updateView = !this.updateView;
    }
    async removeDivePlan(i) {
        this.diveSite.divePlans.splice(i, 1);
        this.updateView = !this.updateView;
    }
    updateImageUrls(ev) {
        const imageType = ev.detail.type;
        const url = ev.detail.url;
        if (imageType == "photo") {
            this.diveSite.photoURL = url;
        }
        else {
            this.diveSite.coverURL = url;
        }
    }
    validateSite() {
        this.validSite =
            lodash.exports.isNumber(this.diveSite.position.geopoint.latitude) &&
                lodash.exports.isNumber(this.diveSite.position.geopoint.longitude) &&
                lodash.exports.isString(this.diveSite.type) &&
                lodash.exports.isString(this.diveSite.information.entryType) &&
                lodash.exports.isString(this.diveSite.description) &&
                this.diveSite.information.minDepth > 0 &&
                this.diveSite.information.maxDepth > 0;
    }
    async save() {
        await DiveSitesService.updateDiveSite(this.diveSiteId, this.diveSite, this.userProfile.uid);
        return modalController.dismiss();
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: '86eba1f32d5e9c515ee7bfee6289982d9df48257' }, h("ion-header", { key: '0f14a524a2b5f815e8ce2177e6f31954972086f8' }, h("app-upload-cover", { key: '1a1f5593587801f55baca2277b71ebf68329fd97', item: {
                collection: DIVESITESCOLLECTION,
                id: this.diveSiteId,
                photoURL: this.diveSite.photoURL,
                coverURL: this.diveSite.coverURL,
            }, onCoverUploaded: (ev) => this.updateImageUrls(ev) })), h("app-header-segment-toolbar", { key: '4009ed8050419c97d17734ce70979191b39c5d1e', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles }), h("ion-content", { key: '0ea5d8e7e004b2725b5d33e063a783d6321929b2', class: "slides" }, h("swiper-container", { key: '3a7824302bcc6afe50bed05bdfb3be78b2970eae', class: "slider-dive-site swiper" }, h("swiper-wrapper", { key: '89ec2df3d0cbf3d18a10d673f746959cc0bf12a1', class: "swiper-wrapper" }, h("swiper-slide", { key: 'd7da23aa4836b1b5bdd25a443760b8b91ad0021e', class: "swiper-slide" }, h("div", { key: 'b50e0b3807a4de0fb54af626a6b74f25122c2a87', id: "map-container" }, h("app-map", { key: '1b59ee1277fefde0bc9cd94011c10fcbc418dd08', id: "map", pageId: "dive-sites", draggableMarkerPosition: this.draggableMarkerPosition, onDragMarkerEnd: (ev) => this.updateLocation(ev) }))), h("swiper-slide", { key: '8f66a02870a9fac656ee894e079390ffac771eca', class: "swiper-slide" }, h("app-coordinates", { key: 'd6cfe6f1946437882b806999de92790691e7d54d', coordinates: this.draggableMarkerPosition, onCoordinatesEmit: (ev) => this.updateLocation(ev), onAddressEmit: (ev) => this.updateAddress(ev) })), h("swiper-slide", { key: '7070b094d1aca50eaf918d9412a8faace0adad22', class: "swiper-slide" }, h("ion-list", { key: '8d79e61f476c521dab50a84ebfa994bd82538820', class: "ion-no-padding" }, h("ion-list-header", { key: '21ce8dfb9286d46ca67ada7f65c8296fd23f26b5' }, h("my-transl", { key: 'c7e96165ea52896ec029d97eca025f1e789bdf34', tag: "general-information", text: "General Information", isLabel: true })), h("ion-item", { key: 'd1bddc8fed3d293ad6cf36529ca56d307dcbe479' }, h("ion-label", { key: '23d969ad2646993c99fc29320af036911ad4dbfd' }, h("my-transl", { key: '5717c66be7194df1987cbc107e3f6b208a186ac5', tag: "site-type", text: "Site Type" })), h("ion-select", { key: '64fd5dd2f0ba6c70008963d77cbc0964497ffd50', id: "dive-type-select", onIonChange: (ev) => this.updateParam("type", ev), value: this.diveSite.type })), h("ion-item", { key: 'ed959ea4265667128f9e5d3e1b7479659aeaa918' }, h("ion-label", { key: '15e33d53057a46229b354b099680a65d5a639bab' }, h("my-transl", { key: '02642691d5de4472788e8032d6b339b728be57f4', tag: "entry-type", text: "Entry Type" })), h("ion-select", { key: '223adf1d8308b819a943d21843a928ddc4c9ab45', id: "entry-type-select", onIonChange: (ev) => this.updateParam("entryType", ev), value: this.diveSite.information.entryType })), h("app-form-item", { key: '2e290fc3af4df89b8bc6ae10516324d4b3372f2e', "label-tag": "name", "label-text": "Name", value: this.diveSite.displayName, name: "displayName", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("app-form-item", { key: 'df172bc2841cbbf827c9fe28aa5a07360fe60ae2', "label-tag": "description", "label-text": "Description", value: this.diveSite.description, name: "description", textRows: 5, "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("ion-list-header", { key: '0363369784a674ac71f398283c547325bc680c98' }, h("ion-label", { key: '427740fca44df2d89f19b689e93e78fcb903b139' }, h("my-transl", { key: 'c5a707f2ec25d7339bdeacff5d7ed1a5c6539a10', tag: "site-details", text: "Site Details" }))), h("ion-grid", { key: 'c92f681fa34fbc6d93fb786a2cec1cd27889963a', class: "ion-no-padding" }, h("ion-row", { key: 'c007fd20127d1ee9fb1e76d95b0a6fe52333d55c' }, h("ion-col", { key: '86d23e87ae33194a3fc40b37b6b55452555b6dbd' }, h("app-form-item", { key: '0616dae2309b39fce1aede0f86ed4b0abfec04e6', "label-tag": "min-depth", "label-text": "Min. Depth", "append-text": " (m)", value: lodash.exports.toString(this.diveSite.information.minDepth), name: "minDepth", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: ["required"] })), h("ion-col", { key: 'e2e0a29e0f5bff4cf3aaecf9a8a8e2f702c070ce' }, h("app-form-item", { key: '8e27f696170ff6deb175ed3a105965908cd124c2', "label-tag": "max-depth", "label-text": "Max. Depth", "append-text": " (m)", value: lodash.exports.toString(this.diveSite.information.maxDepth), name: "maxDepth", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: ["required"] })))), h("app-form-item", { key: 'a075c3d80c8eaef414f464105c630a91f824f5d5', "label-tag": "avg-vis", "label-text": "Average Visibility", "append-text": " (m)", value: lodash.exports.toString(this.diveSite.information.avgViz), name: "avgViz", "input-type": "text", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: [] }), h("ion-list-header", { key: '4ee9ee0660dd50adae891f39f385efc745cff64e' }, h("my-transl", { key: 'c1f7dcb4fc6ae2ce4bf85306ecbd8d7f150318f7', tag: "water-temp", text: "Water Temperature", "append-text": " (\u00B0C)", isLabel: true })), h("ion-grid", { key: 'df4b502c17b4ba934989cdccfdedfa916712951b', class: "ion-no-padding" }, h("ion-row", { key: '4c0872a42ec57f757c4d871d0e2a4bb325fa15bd' }, h("ion-col", { key: 'de791ede9b1b88bc30731d269655bff2555d1433' }, h("app-form-item", { key: '219489b0e4c68b31ca3dc27003c396820e110d24', "label-tag": "spring", "label-text": "Spring", value: lodash.exports.toString(this.diveSite.information.waterTemp.spring), name: "waterTemp.spring", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: [] })), h("ion-col", { key: '3528da32aa23e6f926b773a689b2cb016f7dc87d' }, h("app-form-item", { key: '47ae2e9c1dbd1f6b598234ac51d7768a37c96ae2', "label-tag": "summer", "label-text": "Summer", value: lodash.exports.toString(this.diveSite.information.waterTemp.summer), name: "waterTemp.summer", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: [] }))), h("ion-row", { key: 'b746e1fc2051f8664060c0d0eed60004a0e02bdc' }, h("ion-col", { key: '7007bfb26baf904894886ee840d03e6f1576f2b8' }, h("app-form-item", { key: '057523e71eb5394fc38574e3dec84161f9ed909e', "label-tag": "autumn", "label-text": "Autumn", value: lodash.exports.toString(this.diveSite.information.waterTemp.autumn), name: "waterTemp.autumn", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: [] })), h("ion-col", { key: '805544bbe1f945f035b4ff3fd93c2f58bc0eb691' }, h("app-form-item", { key: '0457360fe89676cdcf76c0631075de8fbbfac327', "label-tag": "winter", "label-text": "Winter", value: lodash.exports.toString(this.diveSite.information.waterTemp.winter), name: "waterTemp.winter", "input-type": "number", onFormItemChanged: (ev) => this.handleInformationChange(ev), validator: [] })))), h("ion-item", { key: '771cbc166eed8ca9754b05267ec6bc270effe36c' }, h("ion-label", { key: '4b1280d9f0456cc23b1fe1c76bb7b4f0fe7f4bd6' }, h("my-transl", { key: 'eb854a56ff21647956cd638226ddeaba7ef90299', tag: "seabed-comp", text: "Seabed Composition" })), h("ion-select", { key: 'ad5f5fc3a923e17d605bd5edd5620046cccc2223', id: "seabed-comp-select", multiple: true, onIonChange: (ev) => this.updateParam("seabedComposition", ev), value: this.diveSite.information.seabedComposition })), h("ion-item", { key: '2e0630e9ad64e1f537de1bbd121109d74ae9faf6' }, h("ion-label", { key: '40ec2833bbef06386656c0768c2c0463e3fcfe92' }, h("my-transl", { key: '3bcb1242f3ca789ce4fd26eec3f8506ed4e6f3fe', tag: "seabed-cover", text: "Seabed Cover" })), h("ion-select", { key: 'c236aa0b0ca5b78a8b565224f83f9bce8606606e', id: "seabed-cover-select", multiple: true, onIonChange: (ev) => this.updateParam("seabedCover", ev), value: this.diveSite.information.seabedCover })))), h("swiper-slide", { key: '9defd75a2169f1807b450a96d1317bf1c83f5eb3', class: "swiper-slide" }, h("ion-grid", { key: '9ed52355d06c09c6b84bc35206986c577e0364d2' }, h("ion-row", { key: '843533880920be8f55813eeaf46d8ead551992f8', class: "ion-text-start" }, this.diveSite.divePlans.map((plan, i) => (h("ion-col", { "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("app-dive-plan-card", { divePlan: plan, edit: true, onViewEmit: (plan) => this.viewDivePlan(plan, i), onRemoveEmit: () => this.removeDivePlan(i) })))), h("ion-col", { key: '2af93dd4fe9cd963cfe7062d17775c88b16d18ed', "size-sm": "12", "size-md": "6", "size-lg": "4" }, h("ion-card", { key: '82eba782162493166570b953ca27420adf738337', onClick: () => this.addDivePlan() }, h("ion-card-content", { key: '6d7b246878ed737d004091f9a0fc1d246982463a', class: "ion-text-center" }, h("ion-icon", { key: 'eb3b5c8fc72f034b77b0ada40cc3ddea38f72013', name: "add-circle-outline", style: { fontSize: "130px" } }))))))), h("swiper-slide", { key: 'f86443c6c3a5e8f5a3f13ab5cf08e454acc74a32', class: "swiper-slide" }, h("app-users-list", { key: 'e5d664de1944a24307b4cb02cdb0d29e5cc4ad62', item: this.diveSite, editable: true, show: ["owner", "editor"] }))))), h("app-modal-footer", { key: 'e455f02f9c7041a5357224550feb824bcf0f86d8', disableSave: !this.validSite, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDiveSiteUpdate.style = modalDiveSiteUpdateCss;

export { ModalDiveSiteUpdate as modal_dive_site_update };

//# sourceMappingURL=modal-dive-site-update.entry.js.map