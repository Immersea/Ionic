import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import { C as Card } from './user-cards-f5f720bb.js';
import { E as Environment } from './env-0a7fccce.js';
import './_commonjsHelpers-1a56c7bc.js';
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

const modalDiveCardCss = "modal-dive-card input{text-align:right}modal-dive-card .fixedLabel{min-width:80% !important;max-width:80% !important}modal-dive-card ion-item .item-inner{box-shadow:none !important;border-bottom:1px solid #dedede !important}modal-dive-card .item-input .label-md,modal-dive-card .item-select .label-md,modal-dive-card .item-datetime .label-md{color:rgb(0, 0, 0)}";

const ModalDiveCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.card = undefined;
        this.updateCard = undefined;
        this.agencies = undefined;
        this.validCard = false;
    }
    componentWillLoad() {
        this.updateViewParams();
    }
    componentDidLoad() {
        this.validateCard();
    }
    async updateViewParams() {
        this.updateCard = new Card(this.card);
        this.validateCard();
    }
    save() {
        this.el.closest("ion-modal").dismiss(this.updateCard);
    }
    close() {
        this.el.closest("ion-modal").dismiss();
    }
    inputHandler(event) {
        this.updateCard[event.detail.name] = event.detail.value;
        this.validateCard();
    }
    updateCourse(ev) {
        this.updateCard.course = ev.detail;
        this.validateCard();
    }
    validateCard() {
        this.validCard =
            lodash.exports.isString(this.updateCard.course.agencyName) &&
                lodash.exports.isString(this.updateCard.course.certificationId) &&
                lodash.exports.isDate(new Date(this.updateCard.certified)) &&
                lodash.exports.isString(this.updateCard.number);
    }
    render() {
        return [
            h("app-navbar", { key: '83aea351ff169e45f6fb7f8b281acae576f5a899', tag: 'dive-card', text: 'Dive Card', color: Environment.getAppColor(), modal: true }),
            h("ion-content", { key: '4a6c2208c0c7a98f484fb4d5fee50040502ab527' }, h("ion-list", { key: '7c2cc82c4ac6304eb8e58213fc05c661f26505d9' }, h("popover-search-diving-course", { key: '5311a791479fd929d792a0c1fd5c01369e6c5eb4', item: this.updateCard.course, onCertSelected: (ev) => this.updateCourse(ev) }), h("app-form-item", { key: '4f3b30221101326d2565b4d11ab5d0543caddd7e', "label-tag": 'number', "label-text": 'Number', lines: 'inset', value: this.updateCard.number, name: 'number', "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"] }), h("app-form-item", { key: 'bcade2f5b18d1609228f897d5dd2e14170413f53', "label-tag": 'certified', "label-text": 'Certified', lines: 'inset', value: this.updateCard.certified, name: 'certified', "input-type": 'date', onFormItemChanged: (ev) => this.inputHandler(ev), validator: ["required"] }), h("app-form-item", { key: '5efa7d2c0b5fef46f78db3f0b6b670b0947210e7', "label-tag": 'expiry', "label-text": 'Expiry', lines: 'inset', value: this.updateCard.expiry, name: 'expiry', "input-type": 'date', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }), h("app-form-item", { key: 'cc78e7a7a673ab6857bbb2ac3a34b23479f59f89', "label-tag": 'instructor', "label-text": 'Instructor', lines: 'inset', value: this.updateCard.instructor, name: 'instructor', "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }), h("app-form-item", { key: '4766794f0c61be7a7e627631b03d268f8a6e1c51', "label-tag": 'comments', "label-text": 'Comments', lines: 'inset', value: this.updateCard.comments, name: 'comments', textRows: 4, "input-type": 'text', onFormItemChanged: (ev) => this.inputHandler(ev), validator: [] }))),
            h("app-modal-footer", { key: '5c9e7cadd4693969f7331bc231038ddfc229fc48', disableSave: !this.validCard, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }),
        ];
    }
    get el() { return getElement(this); }
};
ModalDiveCard.style = modalDiveCardCss;

export { ModalDiveCard as modal_dive_card };

//# sourceMappingURL=modal-dive-card.entry.js.map