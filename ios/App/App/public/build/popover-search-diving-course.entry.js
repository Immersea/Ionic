import { r as registerInstance, l as createEvent, h, j as Host, k as getElement } from './index-d515af00.js';
import { B as SystemService, a3 as DiveStandardsService, T as TranslationService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const popoverSearchDivingCourseCss = "popover-search-diving-course{}popover-search-diving-course ion-list{min-height:300px}";

const PopoverSearchDivingCourse = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.certSelected = createEvent(this, "certSelected", 7);
        this.item = undefined;
        this.popover = undefined;
        this.updateView = false;
    }
    async componentWillLoad() {
        this.agencies = await SystemService.getDivingAgencies();
        this.localAgencies = DiveStandardsService.agencies;
        !this.item
            ? (this.item = {
                agencyId: null,
                agencyName: null,
                certificationId: null,
            })
            : undefined;
    }
    componentDidLoad() {
        this.popover = this.el.closest("ion-popover");
        this.setSelectAgency();
        //if (this.item.agencyId) this.setSelectCertification();
    }
    setSelectAgency() {
        const selectElement = this.el.querySelector("#selectAgency");
        const customPopoverOptions = {
            header: TranslationService.getTransl("diving-agency", "Diving Agency"),
        };
        selectElement.interfaceOptions = customPopoverOptions;
        selectElement.placeholder = TranslationService.getTransl("select", "Select");
        lodash.exports.each(this.localAgencies, (val) => {
            let selectOption = document.createElement("ion-select-option");
            selectOption.value = val.ag_name;
            selectOption.textContent = val.ag_name;
            selectElement.appendChild(selectOption);
        });
        this.updateView = !this.updateView;
    }
    /*setSelectCertification() {
      if (this.agencies[this.item.agencyId]) {
        const selectElement: HTMLIonSelectElement = this.el.querySelector(
          "#selectCertification"
        );
        const customPopoverOptions = {
          header: TranslationService.getTransl(
            "diving-certification",
            "Diving Certification"
          ),
        };
  
        selectElement.interfaceOptions = customPopoverOptions;
        selectElement.placeholder = TranslationService.getTransl(
          "select",
          "Select"
        );
        each(this.agencies[this.item.agencyId].certifications, (val, i) => {
          let selectOption = document.createElement("ion-select-option");
          selectOption.value = i;
          selectOption.textContent = val.name;
          selectElement.appendChild(selectOption);
        });
        selectElement.disabled = false;
        this.enableCertificationsField = false;
      } else {
        this.enableCertificationsField = true;
      }
      this.updateView = !this.updateView;
    }*/
    updateAgency(ev) {
        this.item.agencyName = ev.detail.value;
        const agencyId = lodash.exports.findIndex(this.agencies, (x) => x["id"] == this.item.agencyName);
        this.item.agencyId = agencyId > 0 ? ev.detail.value : "";
        //this.setSelectCertification();
    }
    updateCertification(ev) {
        this.item.certificationId = ev.detail.value;
        if (this.popover) {
            this.popover.dismiss(this.item);
        }
        this.certSelected.emit(this.item);
    }
    render() {
        return (h(Host, { key: '143af18cf89472893d0181c06d4c9692100f7ad2' }, this.popover ? (h("ion-toolbar", null, h("ion-title", null, h("my-transl", { tag: 'diving-course', text: 'Diving Course' })))) : undefined, h("ion-item", { key: '1d1ff9cfd4f91848d54adc616c87dba619345421' }, h("ion-select", { key: '670c9a34dbc5487ac2c9b4dd07d291f3e646af7e', label: TranslationService.getTransl("diving-agency", "Diving Agency"), id: 'selectAgency', onIonChange: (ev) => this.updateAgency(ev), value: this.item.agencyName })), h("app-form-item", { key: '813dcbc1fe5947dedce10f69ced032c1bdee1358', "label-tag": 'certification', "label-text": 'Certification', lines: 'inset', value: this.item.certificationId, name: 'certification', "input-type": 'text', onFormItemChanged: (ev) => this.updateCertification(ev), validator: ["required"] })));
    }
    get el() { return getElement(this); }
};
PopoverSearchDivingCourse.style = popoverSearchDivingCourseCss;

export { PopoverSearchDivingCourse as popover_search_diving_course };

//# sourceMappingURL=popover-search-diving-course.entry.js.map