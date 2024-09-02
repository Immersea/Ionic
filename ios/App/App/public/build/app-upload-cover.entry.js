import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { R as RouterService, C as CUSTOMERSCOLLECTION, a as StorageService, S as SYSTEMCOLLECTION, k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, o as DIVECOMMUNITIESCOLLECTION, p as DiveCommunitiesService, c as DIVECENTERSSCOLLECTION, i as DivingCentersService, e as DIVESITESCOLLECTION, d as DiveSitesService, b as USERPROFILECOLLECTION, U as UserService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appUploadCoverCss = "app-upload-cover{width:100%}app-upload-cover ion-thumbnail{position:relative;margin-top:-100px;margin-left:auto;margin-right:auto;margin-bottom:0;width:100px;height:100px}app-upload-cover ion-thumbnail img{border-radius:50%;padding:0.08em;border:solid 0.25em lightsteelblue;background-color:white}app-upload-cover ion-thumbnail ion-button{top:50%;left:50%;margin-right:-50%;transform:translate(-50%, -50%);position:absolute !important;color:#141414;font-size:24px}app-upload-cover .cover{position:relative;height:var(--coverHeightModal);background-color:lightblue;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);width:100%}app-upload-cover .cover ion-button{bottom:5%;left:10%;margin-right:-50%;transform:translate(-50%, -50%);position:absolute;color:#141414;font-size:24px}app-upload-cover .save-item{top:-150px;text-align:center;position:relative;color:#494848;font-size:20px}";

const AppUploadCover = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.coverUploaded = createEvent(this, "coverUploaded", 7);
        this.uploading = false;
        this.item = undefined;
        this.showPhotoURL = true;
        this.addressText = undefined;
    }
    componentWillLoad() { }
    async updatePhotoURL(type) {
        var options = null;
        if (type == "photo") {
            options = {
                aspectRatio: 1,
                maxDimensions: 300,
                round: true,
            };
        }
        else {
            options = {
                aspectRatio: 16 / 6,
                maxDimensions: 2000,
                round: false,
            };
        }
        const uploadModal = await RouterService.openModal("modal-upload-image", options);
        uploadModal.onDidDismiss().then(async (canvasImg) => {
            if (canvasImg && canvasImg.data) {
                this.uploading = true;
                canvasImg.data.toBlob(async (blob) => {
                    const update = await this.uploadImage(blob, type);
                    if (update !== null) {
                        if (type == "photo") {
                            this.item.photoURL = update;
                        }
                        else {
                            this.item.coverURL = update;
                        }
                    }
                    this.coverUploaded.emit({ type: type, url: update });
                    this.uploading = false;
                }, "image/jpeg", 50 //jpeg quality
                );
            }
        });
        await uploadModal.present();
    }
    async uploadImage(blob, type) {
        switch (this.item.collection) {
            case USERPROFILECOLLECTION:
                return await UserService.updatePhotoURL(type, this.item.id, blob);
            case DIVESITESCOLLECTION:
                return await DiveSitesService.updatePhotoURL(type, this.item.id, blob);
            case DIVECENTERSSCOLLECTION:
                return await DivingCentersService.updatePhotoURL(type, this.item.id, blob);
            case DIVECOMMUNITIESCOLLECTION:
                return await DiveCommunitiesService.updatePhotoURL(type, this.item.id, blob);
            case DIVESCHOOLSSCOLLECTION:
                return await DivingSchoolsService.updatePhotoURL(type, this.item.id, blob);
            case SERVICECENTERSCOLLECTION:
                return await ServiceCentersService.updatePhotoURL(type, this.item.id, blob);
            case SYSTEMCOLLECTION:
                return await StorageService.updatePhotoURL(SYSTEMCOLLECTION, type, this.item.id, blob);
            case CUSTOMERSCOLLECTION:
                return await StorageService.updatePhotoURL(CUSTOMERSCOLLECTION, type, this.item.id, blob);
        }
    }
    render() {
        return [
            this.uploading ? h("ion-progress-bar", { type: "indeterminate" }) : undefined,
            this.item
                ? [
                    h("div", { class: "cover", style: this.item.coverURL
                            ? {
                                backgroundImage: "url(" + this.item.coverURL + ")",
                            }
                            : undefined }, h("ion-button", { fill: "clear", "icon-only": true, onClick: () => this.updatePhotoURL("cover"), disabled: !this.item.id }, h("ion-icon", { name: "camera", color: "light" }))),
                    !this.item.id ? (h("div", { class: "save-item" }, h("my-transl", { tag: "save-item-error", text: "Please save the item to upload pictures", isLabel: true }))) : undefined,
                    this.showPhotoURL ? (h("ion-thumbnail", null, h("img", { src: this.item.photoURL
                            ? this.item.photoURL
                            : "./assets/images/avatar.png" }), h("ion-button", { fill: "clear", "icon-only": true, onClick: () => this.updatePhotoURL("photo"), disabled: !this.item.id }, h("ion-icon", { name: "camera", color: "light" })))) : undefined,
                ]
                : undefined,
        ];
    }
};
AppUploadCover.style = appUploadCoverCss;

export { AppUploadCover as app_upload_cover };

//# sourceMappingURL=app-upload-cover.entry.js.map