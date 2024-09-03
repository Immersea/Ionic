import { r as registerInstance, h } from './index-d515af00.js';
import './index-be90eba5.js';
import { E as Environment } from './env-c3ad5e77.js';
import { a as StorageService, T as TranslationService } from './utils-ced1e260.js';
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
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const popoverMediaUploaderCss = "";

const PopoverMediaUploader = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.inProgress = {};
        this.urls = {};
        this.files = undefined;
        this.collectionId = undefined;
        this.itemId = undefined;
        this.updateView = false;
    }
    uploadProgressHandler(event) {
        const uploadingProgress = event.detail;
        if (uploadingProgress.state === "completed") {
            this.urls[this.uploadingId] = uploadingProgress.url;
            let checkCompleted = true;
            Object.keys(this.inProgress).forEach((id) => {
                checkCompleted =
                    checkCompleted && this.inProgress[id].uploadProgress === 100;
            });
            this.updateView = !this.updateView;
            if (checkCompleted) {
                //all files downloaded
                popoverController.dismiss(this.urls);
            }
            else {
                //download next file
                this.uploadMedia();
            }
        }
        else if (uploadingProgress.state === "error") {
            popoverController.dismiss(false);
        }
        else {
            this.inProgress[this.uploadingId].uploadProgress =
                uploadingProgress.progress;
            this.updateView = !this.updateView;
        }
    }
    componentDidLoad() {
        this.inProgress = {};
        Object.keys(this.files).forEach((id) => {
            //set all to false to start download
            this.inProgress[id] = {
                size: this.files[id].file.size,
                uploadProgress: 0,
            };
        });
        this.uploadMedia();
    }
    async cancel() {
        popoverController.dismiss(false);
    }
    uploadMedia() {
        //check media that have not completed download and start download
        let id = null;
        Object.keys(this.inProgress).forEach((progressId) => {
            if (this.inProgress[progressId].uploadProgress == 0) {
                id = progressId;
                return;
            }
        });
        this.uploadingId = id;
        const file = this.files[id].file;
        const media = this.files[id].media;
        StorageService.uploadFile(this.collectionId, this.itemId, media, file);
    }
    render() {
        return [
            h("ion-header", { key: '556c0ad119bb89ce38f2590708bc4f354562f722' }, h("ion-toolbar", { key: 'c3def15671d32614439a4f59d3e83983463ec077', color: Environment.getAppColor() }, h("ion-title", { key: '1fbbcc93ff5498c9152084f7d0d1bba14b923035' }, TranslationService.getTransl("media-uploader", "Media Uploader")))),
            h("ion-content", { key: 'fbe89d377a42ca9031832f715ca26cdfaf2f69ed' }, h("ion-list", { key: 'c8ab66b5bb22e6857b92d8358f46bc957e759cc2' }, Object.keys(this.files).map((id) => [
                h("ion-item", null, h("ion-label", null, h("h4", null, this.files[id].media.title), this.inProgress && this.inProgress[id]
                    ? [
                        h("h5", null, TranslationService.getTransl("file-size", "File Size"), ": ", this.inProgress[id].size),
                        h("p", null, TranslationService.getTransl("uploaded", "Uploaded"), ":", " ", this.inProgress[id].uploadProgress, "%"),
                    ]
                    : undefined)),
                this.inProgress && this.inProgress[id] ? (h("ion-progress-bar", { value: this.inProgress[id].uploadProgress })) : undefined,
            ])), h("ion-button", { key: 'dadadf4f9c206e4514f300dd098cc1f9c0330e6e', expand: "block", fill: "outline", onClick: () => this.cancel() }, h("ion-label", { key: '9e176d74958a9af797ba87c97e6edc8255db9131' }, TranslationService.getTransl("cancel", "Cancel")))),
        ];
    }
};
PopoverMediaUploader.style = popoverMediaUploaderCss;

export { PopoverMediaUploader as popover_media_uploader };

//# sourceMappingURL=popover-media-uploader.entry.js.map