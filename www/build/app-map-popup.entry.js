import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { U as UserService, c as DIVECENTERSSCOLLECTION, M as MapDataDivingCenter, d as DiveSitesService, e as DIVESITESCOLLECTION, h as MapDataDiveSite, i as DivingCentersService, C as CUSTOMERSCOLLECTION, j as CustomersService, k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, o as DIVECOMMUNITIESCOLLECTION, p as DiveCommunitiesService, q as USERPUBLICPROFILECOLLECTION } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
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
import './customerLocation-71248eea.js';

const appMapPopupCss = "app-map-popup .margin{margin-bottom:10px}app-map-popup .center{text-align:center}app-map-popup h2{padding-left:5px;padding-right:5px}app-map-popup ion-thumbnail{position:relative;margin-top:-50px;margin-bottom:0;margin-right:auto;margin-left:auto;width:50px;height:50px}app-map-popup ion-thumbnail img{border-radius:50%;padding:0.08em;border:solid 0.25em lightsteelblue;background-color:white}app-map-popup .cover{position:relative;background-color:lightblue;background-size:cover;background-position:center;background-repeat:no-repeat;overflow:hidden;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);width:100%;height:80px}";

const AppMapPopup = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.properties = undefined;
    }
    componentWillLoad() {
        this.propObject = JSON.parse(this.properties);
        this.propObject.item = JSON.parse(this.propObject.item);
        this.mapElement = this.el.closest("app-map");
        this.userRoles = UserService.userRoles;
        this.setLinesForItem();
    }
    disconnectedCallback() {
        this.removeLinesForItem();
    }
    setLinesForItem() {
        if (this.propObject.collection == DIVECENTERSSCOLLECTION &&
            this.propObject.item.diveSites &&
            this.propObject.item.diveSites.length > 0) {
            const diveSites = this.propObject.item.diveSites;
            this.propObject.item = new MapDataDivingCenter(this.propObject.item);
            const pointsArray = [this.propObject.item];
            diveSites.forEach(async (siteId) => {
                const diveSite = DiveSitesService.getDiveSitesDetails(siteId);
                pointsArray.push(diveSite);
                this.mapElement["createLine"](siteId, this.propObject.item, diveSite);
            });
            this.mapElement["fitToBounds"](pointsArray);
        }
        else if (this.propObject.collection == DIVESITESCOLLECTION &&
            this.propObject.item.divingCenters &&
            this.propObject.item.divingCenters.length > 0) {
            const divingCenters = this.propObject.item.divingCenters;
            this.propObject.item = new MapDataDiveSite(this.propObject.item);
            const pointsArray = [this.propObject.item];
            divingCenters.forEach(async (centerId) => {
                const divingCenter = DivingCentersService.getDivingCenterDetails(centerId);
                pointsArray.push(divingCenter);
                this.mapElement["createLine"](centerId, this.propObject.item, divingCenter);
            });
            this.mapElement["fitToBounds"](pointsArray);
        }
    }
    removeLinesForItem() {
        if (this.propObject.collection == DIVECENTERSSCOLLECTION &&
            this.propObject.item.diveSites &&
            this.propObject.item.diveSites.length > 0) {
            const diveSites = this.propObject.item.diveSites;
            diveSites.forEach(async (siteId) => {
                this.mapElement["removeLine"](siteId);
            });
        }
        else if (this.propObject.collection == DIVESITESCOLLECTION &&
            this.propObject.item.divingCenters &&
            this.propObject.item.divingCenters.length > 0) {
            const divingCenters = this.propObject.item.divingCenters;
            divingCenters.forEach(async (centerId) => {
                this.mapElement["removeLine"](centerId);
            });
        }
    }
    async openModal() {
        switch (this.propObject.collection) {
            case USERPUBLICPROFILECOLLECTION:
                UserService.presentUserDetails(this.propObject.id);
                break;
            case DIVESITESCOLLECTION:
                DiveSitesService.presentDiveSiteDetails(this.propObject.id);
                break;
            case DIVECENTERSSCOLLECTION:
                DivingCentersService.presentDivingCenterDetails(this.propObject.id);
                break;
            case DIVECOMMUNITIESCOLLECTION:
                DiveCommunitiesService.presentDiveCommunityDetails(this.propObject.id);
                break;
            case DIVESCHOOLSSCOLLECTION:
                DivingSchoolsService.presentDivingSchoolDetails(this.propObject.id);
                break;
            case SERVICECENTERSCOLLECTION:
                ServiceCentersService.presentServiceCenterDetails(this.propObject.id);
                break;
            //when markers are added as feature
            case "markers-feature":
                if (this.propObject.item.collection == CUSTOMERSCOLLECTION)
                    CustomersService.presentCustomerDetails(this.propObject.item.id);
                break;
        }
        this.mapElement["closePopup"]();
    }
    async planDive() {
        DiveSitesService.presentDiveSiteDetails(this.propObject.id, true);
        this.mapElement["closePopup"]();
    }
    async editModal() {
        switch (this.propObject.collection) {
            case USERPUBLICPROFILECOLLECTION:
                UserService.presentUserDetails(this.propObject.id);
                break;
            case DIVESITESCOLLECTION:
                DiveSitesService.presentDiveSiteUpdate(this.propObject.id);
                break;
            case DIVECENTERSSCOLLECTION:
                DivingCentersService.presentDivingCenterUpdate(this.propObject.id);
                break;
            case DIVECOMMUNITIESCOLLECTION:
                DiveCommunitiesService.presentDiveCommunityUpdate(this.propObject.id);
                break;
            case DIVESCHOOLSSCOLLECTION:
                DivingSchoolsService.presentDivingSchoolUpdate(this.propObject.id);
                break;
            case SERVICECENTERSCOLLECTION:
                ServiceCentersService.presentServiceCenterUpdate(this.propObject.id);
                break;
        }
        this.mapElement["closePopup"]();
    }
    async delete() {
        switch (this.propObject.collection) {
            case "userPublicProfiles":
                //UserService.presentUserDetails(this.propObject.id);
                break;
            case DIVESITESCOLLECTION:
                DiveSitesService.deleteDiveSite(this.propObject.id);
                break;
            case DIVECENTERSSCOLLECTION:
                DivingCentersService.deleteDivingCenter(this.propObject.id);
                break;
            case DIVECOMMUNITIESCOLLECTION:
                DiveCommunitiesService.deleteDiveCommunity(this.propObject.id);
                break;
            case DIVESCHOOLSSCOLLECTION:
                DivingSchoolsService.deleteDivingSchool(this.propObject.id);
                break;
            case SERVICECENTERSCOLLECTION:
                ServiceCentersService.deleteServiceCenter(this.propObject.id);
                break;
        }
        this.mapElement["closePopup"]();
    }
    render() {
        return (h(Host, { key: '8f911fe83e53cd9b1b0a4669f41a9283a2ab30e0' }, this.propObject.item.coverURL ? (h("div", { class: 'cover', style: this.propObject.item.coverURL
                ? {
                    backgroundImage: "url(" + this.propObject.item.coverURL + ")",
                }
                : undefined })) : undefined, this.propObject.item.photoURL ? (h("ion-thumbnail", null, h("img", { src: this.propObject.item.photoURL
                ? this.propObject.item.photoURL
                : "assets/images/avatar.png" }))) : undefined, h("h2", { key: 'e9df1efb8395c047653f95770700a722ced75da0', class: 'center' }, this.propObject.item.displayName), h("div", { key: 'd58951ae82e553eb4c3ceefbd6349bebbe477e32', class: 'center' }, h("ion-button", { key: 'd91ab70865cccd32b29f601991c074e83844dcee', expand: 'full', fill: 'outline', color: 'dark', onClick: () => this.openModal() }, h("my-transl", { key: 'd55a474a9ec2d3c5f900ed4d2ebe48c4cac59f1c', tag: 'details', text: 'Details' }))), this.propObject.collection == DIVESITESCOLLECTION ? (h("div", { class: 'center' }, h("ion-button", { expand: 'full', fill: 'outline', color: 'secondary', onClick: () => this.planDive() }, h("my-transl", { tag: 'plan-dive', text: 'Plan a Dive' })))) : undefined, !Environment.isTrasteel() &&
            this.userRoles &&
            this.userRoles.isSuperAdmin()
            ? [
                h("div", { class: 'center' }, h("ion-button", { expand: 'full', fill: 'outline', color: 'primary', onClick: () => this.editModal() }, h("my-transl", { tag: 'edit', text: 'Edit' }))),
                h("div", { class: 'center' }, h("ion-button", { expand: 'full', fill: 'outline', color: 'danger', onClick: () => this.delete() }, h("my-transl", { tag: 'delete', text: 'Delete' }))),
            ]
            : undefined, h("div", { key: '5cffdd6ea1f898265e443b2e302b195f12af4c2a', class: 'margin' })));
    }
    get el() { return getElement(this); }
};
AppMapPopup.style = appMapPopupCss;

export { AppMapPopup as app_map_popup };

//# sourceMappingURL=app-map-popup.entry.js.map