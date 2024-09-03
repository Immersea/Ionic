import { r as registerInstance, l as createEvent, h, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { T as TranslationService } from './utils-ced1e260.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController } from './overlays-b3ceb97d.js';
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
import './env-c3ad5e77.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './framework-delegate-779ab78c.js';

const appDragdropFileCss = "app-dragdrop-file #drop-area{border:2px dashed white;border-radius:20px;width:90%;height:var(--coverHeight);margin:0 auto 0 auto;padding:20px;text-align:center;visibility:visible}app-dragdrop-file #drop-area.highlight{border-color:var(--ion-color-primary) !important;border-style:solid !important;border-width:5px !important}app-dragdrop-file p{margin-top:0;color:white}app-dragdrop-file ion-note{padding:0}app-dragdrop-file .my-form{text-align:center}app-dragdrop-file .button{display:inline-block;margin:20px 0 20px 0;padding:20px;background-color:var(--ion-color-primary);color:var(--ion-color-primary-contrast);cursor:pointer;border-radius:5px}app-dragdrop-file .button:hover{background:var(--ion-color-tertiary);color:var(--ion-color-tertiary-contrast)}app-dragdrop-file #fileElem{display:none}";

const AppDragdropFile = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.fileSelected = createEvent(this, "fileSelected", 7);
        this.fileType = undefined;
        this.fileTypes = undefined;
        this.autoOpen = false;
        this.file = undefined;
        this.selectedFile = undefined;
    }
    componentWillLoad() {
        if (this.file) {
            this.handleFiles([this.file]);
        }
    }
    componentDidLoad() {
        // ************************ Drag and drop ***************** //
        this.dropArea = this.el.querySelector("#drop-area");
        this.inputElement = this.el.querySelector("#fileElem");
        this.autoOpen ? this.inputElement.click() : undefined;
        // Prevent default drag behaviors
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
            this.dropArea.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        // Highlight drop area when item is dragged over it
        ["dragenter", "dragover"].forEach((eventName) => {
            this.dropArea.addEventListener(eventName, () => {
                this.dropArea.classList.add("highlight");
            }, false);
        });
        ["dragleave", "drop"].forEach((eventName) => {
            this.dropArea.addEventListener(eventName, () => {
                this.dropArea.classList.remove("highlight");
            }, false);
        });
        // Handle dropped files
        this.dropArea.addEventListener("drop", (e) => {
            const dt = e.dataTransfer;
            this.handleFiles(dt.files);
        }, false);
    }
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    async handleFiles(file) {
        this.selectedFile = null;
        if (file.target) {
            //coming from button click
            this.selectedFile = file.target.files[0];
        }
        else {
            this.selectedFile = file[0];
        }
        let test = false;
        if (this.fileType) {
            const regex = new RegExp("^" + this.fileType + "\\/\\w+");
            // /^image\/\w+/.test(uploadUrl.type)
            test = regex.test(this.selectedFile.type);
        }
        else {
            test = this.fileTypes.includes(this.selectedFile.type);
        }
        if (test) {
            this.fileSelected.emit(this.selectedFile);
        }
        else {
            this.selectedFile = null;
            const alert = await alertController.create({
                header: TranslationService.getTransl("select-file", "Select a File"),
                message: TranslationService.getTransl("select-file-message", "Please select a file of type: ") + (this.fileType ? this.fileType : this.fileTypes.join(", ")),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async () => {
                            this.inputElement.click();
                        },
                    },
                ],
            });
            alert.present();
        }
    }
    render() {
        return [
            h("div", { key: 'a700de1cae9d63d4d0a8499b0398246f83ee4193', id: "drop-area" }, h("p", { key: 'd76c77ef5c5247a413e7ff20cf12ba4f3c36d30c' }, this.selectedFile ? ([
                h("ion-note", null, this.selectedFile.name),
                h("br", null),
                h("ion-note", null, lodash.exports.round(this.selectedFile.size / 1024 / 1024, 1), "MB"),
            ]) : (h("my-transl", { tag: "dragdrop-file", text: "Upload a file with the file dialog or by dragging and\n            dropping the file onto the dashed region" })))),
            h("form", { key: 'fc0926893d67afd35a91125ce32f00440c9001d6', class: "my-form" }, h("input", { key: '7213b8a87a219c02a3b75feec30a49065b7ac01e', type: "file", id: "fileElem", accept: this.fileType
                    ? this.fileType + "/*"
                    : this.fileTypes && this.fileTypes.length > 0
                        ? this.fileTypes.join(",")
                        : "*/*", onClick: () => {
                    return false;
                }, onChange: (ev) => this.handleFiles(ev) }), h("label", { key: '77a19fe16a29ac4224a71a64319aa6a65780910d', id: "labelElem", class: "button", htmlFor: "fileElem" }, h("my-transl", { key: '218d6f09129c69a4270a6089a2f76cd201f0380f', tag: "select-file", text: "Select a File" }))),
        ];
    }
    get el() { return getElement(this); }
};
AppDragdropFile.style = appDragdropFileCss;

export { AppDragdropFile as app_dragdrop_file };

//# sourceMappingURL=app-dragdrop-file.entry.js.map