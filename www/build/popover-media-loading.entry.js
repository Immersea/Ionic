import { r as registerInstance, h } from './index-d515af00.js';
import './index-be90eba5.js';
import { av as Media } from './utils-cbf49763.js';
import { E as Environment } from './env-9be68260.js';
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
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
import './framework-delegate-779ab78c.js';

const popoverMediaLoadingCss = "popover-media-loading ion-note{padding-left:20px}popover-media-loading .drop-area{width:100%}popover-media-loading app-dragdrop-file p{color:black !important}popover-media-loading app-dragdrop-file #drop-area{border:2px dashed black !important;height:100px !important}";

const PopoverMediaLoading = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.media = undefined;
        this.file = undefined;
        this.validMedia = false;
        this.updateView = false;
    }
    componentWillLoad() {
        if (!this.media) {
            this.media = new Media();
        }
        if (this.file) {
            this.updateMedia({ detail: this.file });
        }
        else {
            this.validateMedia();
        }
    }
    async close() {
        popoverController.dismiss();
    }
    async save() {
        popoverController.dismiss({ media: this.media, file: this.file });
    }
    validateMedia() {
        this.validMedia =
            this.media.title &&
                this.media.title.length >= 3 &&
                this.media.size > 0 &&
                this.media.type &&
                this.media.description &&
                this.media.description.length > 5;
        this.updateView = !this.updateView;
    }
    handleChange(ev) {
        if (ev.detail.name == "order") {
            this.media[ev.detail.name] = lodash.exports.toNumber(ev.detail.value);
        }
        else {
            this.media[ev.detail.name] = ev.detail.value;
        }
        this.validateMedia();
    }
    updatePublic(ev) {
        this.media.public = ev.detail.checked;
        this.validateMedia();
    }
    updateMedia(event) {
        this.file = event.detail;
        if (!this.media.title) {
            this.media.title = this.file.name;
        }
        this.media.name = this.file.name;
        this.media.lastModified = this.file.lastModified;
        this.media.size = this.file.size;
        this.media.type = this.file.type;
        this.validateMedia();
    }
    render() {
        return [
            h("ion-header", { key: '4f94f9092a81d9443390759270f581785b4c1fdd' }, h("ion-toolbar", { key: '698cb6456ffa5f0a454a68f96d8ffd9d617748ff', color: Environment.getAppColor() }, h("ion-title", { key: '7555f897ada06cbc9074fa655832c77c28c98d74' }, "Media Loader"))),
            h("ion-content", { key: '51e1d9c999dfa10dd425542242b39a48c87d4577' }, h("ion-list", { key: 'ba621d7695ea11775ba94309d37c456b432144ae' }, h("ion-note", { key: 'dc163db49a49f33ea700f9d607da66ad3f48335a' }, "Id: ", this.media.id), h("app-form-item", { key: '5c12a083751408a399aa2adfc75baa6cfd8354a6', "label-tag": "title", "label-text": "Title", value: this.media.title, name: "title", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [
                    "required",
                    {
                        name: "length",
                        options: {
                            min: 3,
                            max: 20,
                        },
                    },
                ] }), h("app-form-item", { key: '926fddf15f5bad88b75f99bb9a11d7c9eb4156f3', "label-tag": "subtitle", "label-text": "Subtitle", value: this.media.subtitle, name: "subtitle", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [
                    {
                        name: "length",
                        options: {
                            min: 0,
                            max: 30,
                        },
                    },
                ] }), h("app-form-item", { key: 'e9b65d3c4dfee158e83912b92ba496673cab7515', "label-tag": "description", "label-text": "Description", value: this.media.description, name: "description", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: [
                    "required",
                    {
                        name: "length",
                        options: {
                            min: 5,
                            max: 100,
                        },
                    },
                ] }), h("ion-item", { key: '78b1373ce015bc74b47ab435cc2062be510d3f34' }, h("ion-label", { key: '675daa5fad2a2eb73de9fe7c50511e9b874384e0' }, h("my-transl", { key: '16cb7fb0ab4a4a56bd56c6839ad60f16373143fb', tag: "public", text: "Public" })), h("ion-toggle", { key: '7d2b245ada304f050b8a835b61c8325a4730474c', slot: "end", onIonChange: (ev) => this.updatePublic(ev), checked: this.media.public }))), h("div", { key: '9877aa6fc1ed28a3ac4598c7eaab467d6da20861', class: "drop-area" }, h("app-dragdrop-file", { key: 'fdfc159a8d5b843f08f4b10146131bd55c9c6a6f', fileTypes: this.media.getTypes(), file: this.file, onFileSelected: (event) => this.updateMedia(event) }))),
            h("app-modal-footer", { key: '4d5743bd018adb82300a548538421239998054dc', color: Environment.getAppColor(), onCancelEmit: () => this.close(), onSaveEmit: () => this.save(), disableSave: !this.validMedia }),
        ];
    }
};
PopoverMediaLoading.style = popoverMediaLoadingCss;

export { PopoverMediaLoading as popover_media_loading };

//# sourceMappingURL=popover-media-loading.entry.js.map