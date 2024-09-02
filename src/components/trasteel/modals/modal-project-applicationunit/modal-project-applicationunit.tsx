import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isString} from "lodash";
import {TranslationService} from "../../../../services/common/translations";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {ApplicationUnit} from "../../../../interfaces/trasteel/refractories/projects";
import {ProjectsService} from "../../../../services/trasteel/refractories/projects";

@Component({
  tag: "modal-project-applicationunit",
  styleUrl: "modal-project-applicationunit.scss",
})
export class ModalApplicationUnit {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() applicationUnits: ApplicationUnit[];
  @State() applicationUnit: ApplicationUnit;
  @State() updateView = true;
  @State() validApplicationUnit = false;
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
    this.applicationUnits = cloneDeep(ProjectsService.getApplicationUnits());
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
    } else {
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
      isString(this.applicationUnit.applicationId) &&
      isString(this.applicationUnit.applicationId);
    this.updateView = !this.updateView;
  }

  addApplicationUnit() {
    this.applicationUnit = new ApplicationUnit();
    this.applicationUnits.push(this.applicationUnit);
    this.index = this.applicationUnits.length - 1;
  }

  duplicateApplicationUnit() {
    this.applicationUnit = cloneDeep(this.applicationUnit);
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
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await ProjectsService.uploadProjectSettings(
      "applicationUnit",
      this.applicationUnits
    );
    return dismiss ? modalController.dismiss() : true;
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-item lines="none">
                  <ion-select
                    color="trasteel"
                    id="selectType"
                    interface="action-sheet"
                    label={TranslationService.getTransl(
                      "project_applicationunit",
                      "Project Application Unit"
                    )}
                    disabled={!this.validApplicationUnit}
                    label-placement="floating"
                    onIonChange={(ev) => this.selectType(ev)}
                    value={this.index ? this.index : 0}
                  >
                    {this.applicationUnits.map((applicationUnit, index) => (
                      <ion-select-option value={index}>
                        {applicationUnit.applicationId}
                      </ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validApplicationUnit}
                  onClick={() => this.addApplicationUnit()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validApplicationUnit}
                  onClick={() => this.duplicateApplicationUnit()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.applicationUnits.length == 0}
                  onClick={() => this.deleteApplicationUnit()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.applicationUnit.applicationId}
            name="applicationId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "applicationId",
                  list: ProjectsService.getApplicationUnits(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.applicationUnit.applicationName}
            name="applicationName"
            input-type="text"
            multiLanguage={true}
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text="Associated Goods Description"
            value={this.applicationUnit.applicationAssociatedGoodsDesc}
            name="applicationAssociatedGoodsDesc"
            input-type="text"
            multiLanguage={true}
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
          ></app-form-item>
          <app-form-item
            label-text="Packing Description"
            value={this.applicationUnit.applicationPackingDesc}
            name="applicationPackingDesc"
            input-type="text"
            multiLanguage={true}
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validApplicationUnit}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
