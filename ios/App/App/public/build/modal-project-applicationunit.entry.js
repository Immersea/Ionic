import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { ag as ProjectsService, ah as ApplicationUnit, B as SystemService, T as TranslationService } from './utils-5cd4c7bb.js';
import { E as Environment } from './env-0a7fccce.js';
import { m as modalController } from './overlays-b3ceb97d.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const modalProjectApplicationunitCss = "modal-project-applicationunit ion-list{width:100%}";

const ModalApplicationUnit = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.index = 0;
        this.applicationUnits = undefined;
        this.applicationUnit = undefined;
        this.updateView = true;
        this.validApplicationUnit = false;
    }
    /*
    initialData = [
      {
        applicationId: "BF",
        Language_Acronim: "ENGLISH",
        applicationName: "Blast Furnace",
        applicationAssociatedGoodsDesc: "BF Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "BF",
        Language_Acronim: "ITALIAN",
        applicationName: "Alto Forno",
        applicationAssociatedGoodsDesc: "Rivestimento Alto Forno",
        applicationPackingDesc: "",
      },
      {
        applicationId: "BF",
        Language_Acronim: "RUSSIAN",
        applicationName: "Доменная Печь",
        applicationAssociatedGoodsDesc: "Изделия для Доменной печи",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "CAP",
        Language_Acronim: "ENGLISH",
        applicationName: "Casting Products",
        applicationAssociatedGoodsDesc: "Casting Products",
        applicationPackingDesc: "",
      },
      {
        applicationId: "CAP",
        Language_Acronim: "ITALIAN",
        applicationName: "Prodotti per pigiata",
        applicationAssociatedGoodsDesc: "Prodotti per pigiata",
        applicationPackingDesc: "",
      },
      {
        applicationId: "CAP",
        Language_Acronim: "RUSSIAN",
        applicationName: "Металлопроводка",
        applicationAssociatedGoodsDesc: "Изделия для разливки",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "COV",
        Language_Acronim: "ENGLISH",
        applicationName: "Converter",
        applicationAssociatedGoodsDesc: "Converter Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "COV",
        Language_Acronim: "ITALIAN",
        applicationName: "Convertitore",
        applicationAssociatedGoodsDesc: "Rivestimento Convertitore",
        applicationPackingDesc: "",
      },
      {
        applicationId: "COV",
        Language_Acronim: "RUSSIAN",
        applicationName: "Конвертер",
        applicationAssociatedGoodsDesc: "Конвертерные изделия",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "DH",
        Language_Acronim: "ENGLISH",
        applicationName: "DH-Degasser",
        applicationAssociatedGoodsDesc: "DH Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "DH",
        Language_Acronim: "ITALIAN",
        applicationName: "DH-Degasser",
        applicationAssociatedGoodsDesc: "Rivestimento DH",
        applicationPackingDesc: "",
      },
      {
        applicationId: "DH",
        Language_Acronim: "RUSSIAN",
        applicationName: "DH Вакууматор",
        applicationAssociatedGoodsDesc: "Вакууматорные изделия",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "EAF",
        Language_Acronim: "ENGLISH",
        applicationName: "Electric Arc Furnace",
        applicationAssociatedGoodsDesc: "Electric Arc Furnace Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EAF",
        Language_Acronim: "ITALIAN",
        applicationName: "Forno Elettrico ad Arco",
        applicationAssociatedGoodsDesc: "Rivestimento Forno Elettrico",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EAF",
        Language_Acronim: "RUSSIAN",
        applicationName: "Электропечь",
        applicationAssociatedGoodsDesc: "Изделия для электропечи",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "EAF-MASSES",
        Language_Acronim: "ENGLISH",
        applicationName: "EAF-Masses",
        applicationAssociatedGoodsDesc: "Masses for electric arc furnace",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EAF-MASSES",
        Language_Acronim: "ITALIAN",
        applicationName: "EAF-Masse",
        applicationAssociatedGoodsDesc: "Masse per Forno Elettrico",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EAF-MASSES",
        Language_Acronim: "RUSSIAN",
        applicationName: "Массы для электропечи",
        applicationAssociatedGoodsDesc: "Массы для электропечи",
        applicationPackingDesc: "Масса в мешках.",
      },
      {
        applicationId: "ELECTRODES",
        Language_Acronim: "ENGLISH",
        applicationName: "Electrodes",
        applicationAssociatedGoodsDesc: "Graphite electrodes",
        applicationPackingDesc: "",
      },
      {
        applicationId: "ELECTRODES",
        Language_Acronim: "ITALIAN",
        applicationName: "Elettrodi",
        applicationAssociatedGoodsDesc: "Elettrodi in Grafite",
        applicationPackingDesc: "",
      },
      {
        applicationId: "ELECTRODES",
        Language_Acronim: "RUSSIAN",
        applicationName: "Электроды",
        applicationAssociatedGoodsDesc: "Графитированные электроды",
        applicationPackingDesc: "Изделия в деревянных ящиках",
      },
      {
        applicationId: "EOF",
        Language_Acronim: "ENGLISH",
        applicationName: "Energy Optimizing Furnace",
        applicationAssociatedGoodsDesc: "Energy Optimizing Furnace Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EOF",
        Language_Acronim: "ITALIAN",
        applicationName: "",
        applicationAssociatedGoodsDesc: "",
        applicationPackingDesc: "",
      },
      {
        applicationId: "EOF",
        Language_Acronim: "RUSSIAN",
        applicationName: "",
        applicationAssociatedGoodsDesc: "",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDL",
        Language_Acronim: "ENGLISH",
        applicationName: "Ladle",
        applicationAssociatedGoodsDesc: "Ladle Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDL",
        Language_Acronim: "ITALIAN",
        applicationName: "Siviera",
        applicationAssociatedGoodsDesc: "Rivestimento Siviera",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDL",
        Language_Acronim: "RUSSIAN",
        applicationName: "Стальковш",
        applicationAssociatedGoodsDesc: "Ковшевые изделия",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "LDL-MASSES",
        Language_Acronim: "ENGLISH",
        applicationName: "Laddle Masses",
        applicationAssociatedGoodsDesc: "Masses for steel ladle",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDL-MASSES",
        Language_Acronim: "ITALIAN",
        applicationName: "Masse per Siviera",
        applicationAssociatedGoodsDesc: "Masse per siviera",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDL-Masses",
        Language_Acronim: "RUSSIAN",
        applicationName: "Ковшевые Массы",
        applicationAssociatedGoodsDesc: "Массы для сталеразливочного ковша",
        applicationPackingDesc: "Масса в мешках.",
      },
      {
        applicationId: "LDLCI",
        Language_Acronim: "ENGLISH",
        applicationName: "Cast Iron Ladle",
        applicationAssociatedGoodsDesc: "Cast Iron Ladle Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDLCI",
        Language_Acronim: "ITALIAN",
        applicationName: "Siviera di travaso",
        applicationAssociatedGoodsDesc: "Siviera di travaso",
        applicationPackingDesc: "",
      },
      {
        applicationId: "LDLCI",
        Language_Acronim: "RUSSIAN",
        applicationName: "Чугунозаливочный ковш",
        applicationAssociatedGoodsDesc: "Изделия для чугунозаливочного ковша",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "OHF",
        Language_Acronim: "ENGLISH",
        applicationName: "Open Hearth",
        applicationAssociatedGoodsDesc: "",
        applicationPackingDesc: "",
      },
      {
        applicationId: "OHF",
        Language_Acronim: "ITALIAN",
        applicationName: "Focolare Aperto ???",
        applicationAssociatedGoodsDesc: "????",
        applicationPackingDesc: "",
      },
      {
        applicationId: "OHF",
        Language_Acronim: "RUSSIAN",
        applicationName: "Мартеновская Печь",
        applicationAssociatedGoodsDesc: "Материал для мартеновской печи",
        applicationPackingDesc: "Масса в мешках.",
      },
      {
        applicationId: "RFY",
        Language_Acronim: "ENGLISH",
        applicationName: "Refinery Converter",
        applicationAssociatedGoodsDesc: "Refinery converter lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RH-MASSES",
        Language_Acronim: "ENGLISH",
        applicationName: "RH Masses",
        applicationAssociatedGoodsDesc: "Masses RH degasser",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RH-MASSES",
        Language_Acronim: "ITALIAN",
        applicationName: "RH Masse",
        applicationAssociatedGoodsDesc: "Masse RH per Degasaggio",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RH-MASSES",
        Language_Acronim: "RUSSIAN",
        applicationName: "Массы для вакууматора",
        applicationAssociatedGoodsDesc: "Массы для RH вакууматора",
        applicationPackingDesc: "Масса в мешках.",
      },
      {
        applicationId: "RHD",
        Language_Acronim: "ENGLISH",
        applicationName: "RH-Degasser",
        applicationAssociatedGoodsDesc: "RH Lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RHD",
        Language_Acronim: "ITALIAN",
        applicationName: "RH-Degasaggio",
        applicationAssociatedGoodsDesc: "RH Rivestimento",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RHD",
        Language_Acronim: "RUSSIAN",
        applicationName: "RH Вакууматор",
        applicationAssociatedGoodsDesc: "Вакууматорные изделия",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "RHF",
        Language_Acronim: "ENGLISH",
        applicationName: "Reheating Furnace",
        applicationAssociatedGoodsDesc: "Reheating Furnace castables and bricks.",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RHF",
        Language_Acronim: "ITALIAN",
        applicationName: "Forno di Riscaldamento",
        applicationAssociatedGoodsDesc:
          "Forno di Riscaldamento per Pigiate e Mattoni",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RHF",
        Language_Acronim: "RUSSIAN",
        applicationName: "Миксер",
        applicationAssociatedGoodsDesc: "Изделия для чугуновозного ковша",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
      {
        applicationId: "RM",
        Language_Acronim: "ENGLISH",
        applicationName: "Raw materials",
        applicationAssociatedGoodsDesc: "Raw materials",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RM",
        Language_Acronim: "ITALIAN",
        applicationName: "Materie Prime",
        applicationAssociatedGoodsDesc: "",
        applicationPackingDesc: "",
      },
      {
        applicationId: "RM",
        Language_Acronim: "RUSSIAN",
        applicationName: "Сырьевые материалы",
        applicationAssociatedGoodsDesc: "Сырьевые материалы",
        applicationPackingDesc: "Сырье в мешках.",
      },
      {
        applicationId: "TND-MASSES",
        Language_Acronim: "ENGLISH",
        applicationName: "Tundish Masses",
        applicationAssociatedGoodsDesc: "Masses for Tundish",
        applicationPackingDesc: "",
      },
      {
        applicationId: "TND-MASSES",
        Language_Acronim: "RUSSIAN",
        applicationName: "Массы для промковша",
        applicationAssociatedGoodsDesc: "Массы и бетоны для промковша",
        applicationPackingDesc: "Масса в мешках.",
      },
      {
        applicationId: "TPD",
        Language_Acronim: "ENGLISH",
        applicationName: "Torpedo Car",
        applicationAssociatedGoodsDesc: "Torpedo car lining",
        applicationPackingDesc: "",
      },
      {
        applicationId: "TPD",
        Language_Acronim: "RUSSIAN",
        applicationName: "Миксер",
        applicationAssociatedGoodsDesc: "Изделия для чугуновозного ковша",
        applicationPackingDesc:
          "Изделия на деревянных поддонах, укреплены деревянными щитами, обернуты металлической лентой. Внутри изделия обтянуты термоусадочной пленкой.",
      },
    ];*/
    async componentWillLoad() {
        await this.loadApplicationUnits();
    }
    async loadApplicationUnits() {
        await ProjectsService.downloadProjectSettings();
        this.applicationUnits = lodash.exports.cloneDeep(ProjectsService.getApplicationUnits());
        /*console.log(
          "this.applicationUnits",
          this.applicationUnits,
          this.initialData
        );
        const list = {};
        this.initialData.forEach((data) => {
          if (!list[data.applicationId]) {
            list[data.applicationId] = new ApplicationUnit();
          }
          list[data.applicationId]["applicationId"] = data.applicationId;
          let language = "en";
          switch (data.Language_Acronim) {
            case "ENGLISH":
              language = "en";
              break;
            case "RUSSIAN":
              language = "ru";
              break;
            case "ITALIAN":
              language = "it";
              break;
          }
          list[data.applicationId]["applicationName"][language] =
            data.applicationName;
          list[data.applicationId]["applicationAssociatedGoodsDesc"][language] =
            data.applicationAssociatedGoodsDesc;
          list[data.applicationId]["applicationPackingDesc"][language] =
            data.applicationPackingDesc;
        });
        const listArray = [];
        Object.keys(list).map((key) => listArray.push(list[key]));*/
        if (this.applicationUnits && this.applicationUnits.length > 0) {
            this.applicationUnit = this.applicationUnits[0];
        }
        else {
            //create new and add to list
            this.addApplicationUnit();
            //this.applicationUnits = listArray;
            //this.applicationUnit = this.applicationUnits[0];
        }
        this.validateProject();
    }
    selectType(ev) {
        this.applicationUnit = this.applicationUnits[ev.detail.value];
        this.validateProject();
    }
    handleChange(ev) {
        const n = ev.detail.name;
        let v = ev.detail.value;
        if (n == "familyId") {
            //remove spaces and lowercase
            v = v.replace(/\s+/g, "-").trim().toLowerCase();
        }
        this.applicationUnit[n] = v;
        this.validateProject();
    }
    validateProject() {
        this.validApplicationUnit =
            lodash.exports.isString(this.applicationUnit.applicationId) &&
                lodash.exports.isString(this.applicationUnit.applicationId);
        this.updateView = !this.updateView;
    }
    addApplicationUnit() {
        this.applicationUnit = new ApplicationUnit();
        this.applicationUnits.push(this.applicationUnit);
        this.index = this.applicationUnits.length - 1;
    }
    duplicateApplicationUnit() {
        this.applicationUnit = lodash.exports.cloneDeep(this.applicationUnit);
        this.applicationUnit.applicationId =
            this.applicationUnit.applicationId + "_rev.";
        this.applicationUnits.push(this.applicationUnit);
        this.index = this.applicationUnits.length - 1;
    }
    async deleteApplicationUnit() {
        try {
            this.applicationUnits.splice(this.index, 1);
            this.index = 0;
            this.applicationUnit = this.applicationUnits[0];
            this.validateProject();
        }
        catch (error) {
            if (error)
                SystemService.presentAlertError(error);
        }
    }
    async save(dismiss = true) {
        await ProjectsService.uploadProjectSettings("applicationUnit", this.applicationUnits);
        return dismiss ? modalController.dismiss() : true;
    }
    async cancel() {
        return modalController.dismiss();
    }
    render() {
        return (h(Host, { key: 'd9e39e32c72367c539fee6dc3f42d6f33bc2e635' }, h("ion-content", { key: 'd5ccce8e41c43e61d7504c26992899b900e94d14' }, h("ion-grid", { key: '7d87eb18024c1265d7075c26c1b508c9ca103592' }, h("ion-row", { key: '7be23179ba8c2096353969e282d88f9d6921997e' }, h("ion-col", { key: '85386a7b45024c96be1e6ffa5c9601cfd3022f9d' }, h("ion-item", { key: '02dc9345d0cbecdd59f3b5972df25a0b3e20594a', lines: "none" }, h("ion-select", { key: 'beaf30c6733f62fd6f1942a98a18436ea3d047bc', color: "trasteel", id: "selectType", interface: "action-sheet", label: TranslationService.getTransl("project_applicationunit", "Project Application Unit"), disabled: !this.validApplicationUnit, "label-placement": "floating", onIonChange: (ev) => this.selectType(ev), value: this.index ? this.index : 0 }, this.applicationUnits.map((applicationUnit, index) => (h("ion-select-option", { value: index }, applicationUnit.applicationId)))))), h("ion-col", { key: '9f88497962721597588a5ee97837ac4880a6b515', size: "1", class: "ion-text-center" }, h("ion-button", { key: '4f9c7565f24e595cfc3bab53cc67748fe40870b7', fill: "clear", disabled: !this.validApplicationUnit, onClick: () => this.addApplicationUnit() }, h("ion-icon", { key: '20b0396216da337fc856cc9fae8a81512890ca30', name: "add", slot: "start" }))), h("ion-col", { key: 'd4636caf272d76b6a567b4fd7e59c011fcfe9621', size: "1", class: "ion-text-center" }, h("ion-button", { key: 'd64ca6f6201105874d910657675f92c05aba6bd3', fill: "clear", disabled: !this.validApplicationUnit, onClick: () => this.duplicateApplicationUnit() }, h("ion-icon", { key: '6d1ae57a5bacc854696edc223e98e6155b755861', slot: "start", name: "duplicate" }))), h("ion-col", { key: '8ea767cf72f8c8969e9a8cbc98694d5cc8b2e283', size: "1", class: "ion-text-center" }, h("ion-button", { key: '884b36102c030ca2825f90ea419540b105fc8d55', fill: "clear", color: "danger", disabled: this.applicationUnits.length == 0, onClick: () => this.deleteApplicationUnit() }, h("ion-icon", { key: 'd855deb79a4f9b1023b982ab42a1981dbc512253', slot: "start", name: "trash" }))))), h("app-form-item", { key: '10c0a2a2d0264c23d6ab7989f445154ddb718441', "label-text": "ID", value: this.applicationUnit.applicationId, name: "applicationId", "input-type": "string", onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: [
                "required",
                {
                    name: "uniqueid",
                    options: {
                        type: "list",
                        index: "applicationId",
                        list: ProjectsService.getApplicationUnits(),
                    },
                },
            ] }), h("app-form-item", { key: '759cf1f8a696028260022a01133d731257b68628', "label-text": "Name", value: this.applicationUnit.applicationName, name: "applicationName", "input-type": "text", multiLanguage: true, onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed", validator: ["required"] }), h("app-form-item", { key: '0e70d12bb03888cbd4a5cc062cfd0614e52b6bcf', "label-text": "Associated Goods Description", value: this.applicationUnit.applicationAssociatedGoodsDesc, name: "applicationAssociatedGoodsDesc", "input-type": "text", multiLanguage: true, onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed" }), h("app-form-item", { key: '0a2dfa9fbbebf70807e0e1dd8d785cbda9d94fd2', "label-text": "Packing Description", value: this.applicationUnit.applicationPackingDesc, name: "applicationPackingDesc", "input-type": "text", multiLanguage: true, onFormItemChanged: (ev) => this.handleChange(ev), labelPosition: "fixed" })), h("app-modal-footer", { key: 'd3cd22d70d70a8a3a44f86d1bf2c83b2e5cc6b92', color: Environment.getAppColor(), disableSave: !this.validApplicationUnit, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalApplicationUnit.style = modalProjectApplicationunitCss;

export { ModalApplicationUnit as modal_project_applicationunit };

//# sourceMappingURL=modal-project-applicationunit.entry.js.map