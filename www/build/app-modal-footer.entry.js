import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';

const appModalFooterCss = "app-modal-footer{}";

const AppModalFooter = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.cancelEmit = createEvent(this, "cancelEmit", 7);
        this.saveEmit = createEvent(this, "saveEmit", 7);
        this.showSave = true;
        this.disableSave = false;
        this.color = null;
        this.saveTag = {
            tag: "save",
            text: "Save",
        };
        this.cancelTag = {
            tag: "cancel",
            text: "Cancel",
        };
    }
    componentWillLoad() {
        !this.showSave
            ? (this.cancelTag = { tag: "close", text: "Close" })
            : undefined;
    }
    render() {
        return (h("ion-footer", { key: '59ce4089d18ea8ea3575444f21e418014113aa5f', class: "ion-no-border" }, h("ion-toolbar", { key: '71891243b434f3fee3ef620db2b4985050de21bd', color: this.color }, h("ion-grid", { key: 'c01fa462f787b342a49d00e86d00dd6e7084dd2c' }, h("ion-row", { key: '1c67bb0f609dd19f3297ee88e8971c249e3af74a' }, this.showSave ? (h("ion-col", null, h("ion-button", { expand: "block", fill: this.color ? "solid" : "outline", size: "small", color: "success", disabled: this.disableSave, onClick: () => this.saveEmit.emit() }, h("my-transl", { tag: this.saveTag.tag, text: this.saveTag.text })))) : undefined, h("ion-col", { key: '59988f0e109be137d06ed67843c8528721f52890' }, h("ion-button", { key: 'e844d57d1641509913d613607f4ab5eca537a428', expand: "block", fill: this.color ? "solid" : "outline", size: "small", color: "danger", onClick: () => this.cancelEmit.emit() }, h("my-transl", { key: '0a6134443d1176eb074f8918284dd77cbfaaf68e', tag: this.cancelTag.tag, text: this.cancelTag.text }))))))));
    }
};
AppModalFooter.style = appModalFooterCss;

export { AppModalFooter as app_modal_footer };

//# sourceMappingURL=app-modal-footer.entry.js.map