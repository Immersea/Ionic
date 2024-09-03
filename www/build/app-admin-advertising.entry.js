import { r as registerInstance, h } from './index-d515af00.js';
import { g as getRandomId, D as DatabaseService, S as SYSTEMCOLLECTION, T as TranslationService, a as StorageService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
import './index-be90eba5.js';
import { B as BehaviorSubject } from './map-fe092362.js';
import { a as alertController, p as popoverController } from './overlays-b3ceb97d.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './index-9b61a50b.js';
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
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

class Advertising {
    constructor(data) {
        this.id = data && data.id ? data.id : getRandomId();
        this.order = data && data.order ? data.order : 0;
        this.title = data && data.title ? data.title : "";
        this.subtitle = data && data.subtitle ? data.subtitle : "";
        this.description = data && data.description ? data.description : "";
        this.coverURL = data && data.coverURL ? data.coverURL : null;
        this.link = data && data.link ? data.link : "";
        this.active = data && data.active ? true : false;
    }
}

const ADVERTISINGDOC = "advertising";
class AdvertisingController {
    constructor() {
        this.advertisingObservable$ = new BehaviorSubject([]);
    }
    async getAdvertisingObservable() {
        const observable = await DatabaseService.getDocumentObservable(SYSTEMCOLLECTION, ADVERTISINGDOC);
        this.advertisingDocSub = observable.subscribe((doc) => {
            this.advertisingDoc = {};
            Object.keys(doc).map((key) => {
                this.advertisingDoc[key] = new Advertising(doc[key]);
            });
            this.advertisingObservable$.next(this.getAdvertisingArray());
        });
    }
    unsubscribeAdvertising() {
        this.advertisingDocSub ? this.advertisingDocSub.unsubscribe() : undefined;
    }
    async getActiveAdvertising() {
        const res = await DatabaseService.getDocument(SYSTEMCOLLECTION, ADVERTISINGDOC);
        this.advertisingDoc = {};
        if (res) {
            Object.keys(res).map((key) => {
                if (res[key].active) {
                    this.advertisingDoc[key] = res[key];
                }
            });
        }
        return this.getAdvertisingArray();
    }
    getAdvertisingArray() {
        const array = [];
        Object.keys(this.advertisingDoc).map((key) => {
            array.push(this.advertisingDoc[key]);
        });
        return lodash.exports.orderBy(array, "order");
    }
    async updateAdvertising(advertising) {
        this.advertisingDoc[advertising.id] = advertising;
        this.reorderAdvertDoc();
        await this.saveAdvertDoc();
    }
    reorderAdvertDoc() {
        //reorder items
        let array = [];
        Object.keys(this.advertisingDoc).map((key) => {
            array.push(this.advertisingDoc[key]);
        });
        array = lodash.exports.orderBy(array, "order");
        let order = 0;
        array.map((item) => {
            item.order = order;
            order++;
            this.advertisingDoc[item.id] = item;
        });
    }
    async saveAdvertDoc() {
        await DatabaseService.updateDocument(SYSTEMCOLLECTION, ADVERTISINGDOC, this.advertisingDoc);
    }
    async removeAdvertising(advertising) {
        const confirm = await alertController.create({
            header: TranslationService.getTransl("delete-advertising-header", "Delete Advertising?"),
            message: TranslationService.getTransl("delete-advertising-message", "This advertising will be deleted! Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                    handler: () => { },
                },
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: () => {
                        delete this.advertisingDoc[advertising.id];
                        StorageService.deletePhotoURLs(ADVERTISINGDOC, advertising.id);
                        this.reorderAdvertDoc();
                        this.saveAdvertDoc();
                    },
                },
            ],
        });
        confirm.present();
    }
    followAdvertisingLink(advertising) {
        window.open("http://" + advertising.link, "_blank");
    }
}
const AdvertisingService = new AdvertisingController();

const appAdminAdvertisingCss = "app-admin-advertising{}";

const AppAdminAdvertising = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.editable = true;
        this.advertisingArray = [];
    }
    async componentWillLoad() {
        this.advertisingSub = AdvertisingService.advertisingObservable$.subscribe((adverts) => {
            this.advertisingArray = adverts;
        });
        AdvertisingService.getAdvertisingObservable();
    }
    async disconnectedCallback() {
        this.advertisingSub.unsubscribe();
        AdvertisingService.unsubscribeAdvertising();
    }
    async editAdvertising(event, advertising) {
        event.stopPropagation();
        const popover = await popoverController.create({
            component: "popover-edit-advertising",
            componentProps: { advertising: advertising },
            event: null,
            translucent: true,
        });
        popover.onDidDismiss().then(async (ev) => {
            if (ev) {
                const advertising = ev.data;
                await AdvertisingService.updateAdvertising(advertising);
            }
        });
        popover.present();
    }
    async removeAdvertising(event, advertising) {
        event.stopPropagation();
        await AdvertisingService.removeAdvertising(advertising);
    }
    render() {
        return (h("ion-content", { key: 'bf82aaa672329900a525b3c743a25e4fa7c1e71e' }, this.editable ? (h("ion-item", { button: true, onClick: (ev) => this.editAdvertising(ev, null), color: 'light' }, h("ion-icon", { name: 'add-circle', slot: 'start', color: 'beach' }), h("ion-label", null, h("my-transl", { tag: 'add', text: 'Add' })))) : undefined, this.advertisingArray.map((advert) => (h("app-advertising-card", { edit: true, advertising: advert, onEditEmit: (ev) => this.editAdvertising(ev, advert) })))));
    }
};
AppAdminAdvertising.style = appAdminAdvertisingCss;

export { AppAdminAdvertising as app_admin_advertising };

//# sourceMappingURL=app-admin-advertising.entry.js.map