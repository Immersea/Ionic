import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isString} from "lodash";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {DatasheetPropertyType} from "../../../../interfaces/trasteel/refractories/datasheets";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "modal-datasheet-propertytype",
  styleUrl: "modal-datasheet-propertytype.scss",
})
export class ModalDatasheetPropertyType {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetPropertyTypes: DatasheetPropertyType[];
  @State() datasheetPropertyType: DatasheetPropertyType;
  @State() updateView = true;
  @State() validDatasheetPropertyType = false;

  async componentWillLoad() {
    await this.loadDatasheetPropertyTypes();
  }

  async loadDatasheetPropertyTypes() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetPropertyTypes = cloneDeep(
      DatasheetsService.getDatasheetPropertyTypes()
    );
    if (this.datasheetPropertyTypes && this.datasheetPropertyTypes.length > 0) {
      this.datasheetPropertyType = this.datasheetPropertyTypes[0];
    } else {
      //create new and add to list
      this.addDatasheetPropertyType();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    this.datasheetPropertyType = this.datasheetPropertyTypes.find(
      (x) => x.typeId == ev.detail.value
    );
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "typeId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetPropertyType[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetPropertyType =
      isString(this.datasheetPropertyType.typeId) &&
      isString(this.datasheetPropertyType.typeName);
    this.updateView = !this.updateView;
  }

  addDatasheetPropertyType() {
    this.datasheetPropertyType = new DatasheetPropertyType();
    this.datasheetPropertyTypes.push(this.datasheetPropertyType);
    this.index = this.datasheetPropertyTypes.length - 1;
  }

  duplicateDatasheetPropertyType() {
    this.datasheetPropertyType = cloneDeep(this.datasheetPropertyType);
    this.datasheetPropertyType.typeId =
      this.datasheetPropertyType.typeId + "_rev.";
    this.datasheetPropertyTypes.push(this.datasheetPropertyType);
    this.index = this.datasheetPropertyTypes.length - 1;
  }

  async deleteDatasheetPropertyType() {
    try {
      this.datasheetPropertyTypes.splice(this.index, 1);
      this.index = 0;
      this.datasheetPropertyType = this.datasheetPropertyTypes[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "propertyType",
      this.datasheetPropertyTypes
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
                <app-select-search
                  color="trasteel"
                  label={{
                    tag: "datasheet_major_family",
                    text: "Datasheet Major Family",
                  }}
                  value={
                    this.index
                      ? this.datasheetPropertyTypes[this.index].typeId
                      : this.datasheetPropertyTypes[0].typeId
                  }
                  lines="none"
                  label-placement="floating"
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.datasheetPropertyTypes}
                  selectValueId="typeId"
                  selectValueText={["typeName"]}
                  disabled={!this.validDatasheetPropertyType}
                ></app-select-search>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetPropertyType}
                  onClick={() => this.addDatasheetPropertyType()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetPropertyType}
                  onClick={() => this.duplicateDatasheetPropertyType()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.datasheetPropertyTypes.length == 0}
                  onClick={() => this.deleteDatasheetPropertyType()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.datasheetPropertyType.typeId}
            name="typeId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "propertyTypeId",
                  list: DatasheetsService.getDatasheetPropertyTypes(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.datasheetPropertyType.typeName}
            name="typeName"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text="Value Left Description"
            value={this.datasheetPropertyType.typeLeft}
            name="typeLeft"
            input-type="text"
            multiLanguage={true}
            text-rows="1"
            onFormItemChanged={(ev) => this.handleChange(ev)}
          ></app-form-item>
          <app-form-item
            label-text="Value Right Description"
            value={this.datasheetPropertyType.typeRight}
            name="typeRight"
            input-type="text"
            multiLanguage={true}
            text-rows="1"
            onFormItemChanged={(ev) => this.handleChange(ev)}
          ></app-form-item>
          <app-form-item
            label-text="Value Limit Description"
            value={this.datasheetPropertyType.typeLimit}
            name="typeLimit"
            input-type="text"
            multiLanguage={true}
            text-rows="1"
            onFormItemChanged={(ev) => this.handleChange(ev)}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetPropertyType}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
