import { Component, h, Host, State, Element } from "@stencil/core";
import { modalController } from "@ionic/core";
import { cloneDeep, isNumber, isString, split } from "lodash";
import { TranslationService } from "../../../../services/common/translations";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";
import { DatasheetPropertyName } from "../../../../interfaces/trasteel/refractories/datasheets";
import { DatasheetsService } from "../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "modal-datasheet-propertyname",
  styleUrl: "modal-datasheet-propertyname.scss",
})
export class ModalDatasheetPropertyName {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetPropertyNames: DatasheetPropertyName[];
  @State() datasheetPropertyName: DatasheetPropertyName;
  @State() updateView = true;
  @State() validDatasheetPropertyName = false;

  async componentWillLoad() {
    await this.loadDatasheetPropertyNames();
  }

  async loadDatasheetPropertyNames() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetPropertyNames = cloneDeep(
      DatasheetsService.getDatasheetPropertyNames()
    );
    if (this.datasheetPropertyNames && this.datasheetPropertyNames.length > 0) {
      this.datasheetPropertyName = this.datasheetPropertyNames[0];
    } else {
      //create new and add to list
      this.addDatasheetPropertyName();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    //find property by id
    const id = ev.detail.value;
    this.datasheetPropertyName = this.datasheetPropertyNames.find(
      (x) => x.nameId == id
    );
    this.validateDatasheet();
  }

  selectPropertyType(ev) {
    this.datasheetPropertyName.nameType = ev.detail.value;
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "nameId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetPropertyName[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetPropertyName =
      isString(this.datasheetPropertyName.nameId) &&
      isString(this.datasheetPropertyName.nameName) &&
      //isString(this.datasheetPropertyName.nameType) &&
      isNumber(this.datasheetPropertyName.position) &&
      isNumber(this.datasheetPropertyName.decimals);
    this.updateView = !this.updateView;
  }

  addDatasheetPropertyName() {
    this.datasheetPropertyName = new DatasheetPropertyName();
    this.datasheetPropertyNames.push(this.datasheetPropertyName);
    this.index = this.datasheetPropertyNames.length - 1;
  }

  duplicateDatasheetPropertyName() {
    this.datasheetPropertyName = cloneDeep(this.datasheetPropertyName);
    this.datasheetPropertyName.nameId =
      this.datasheetPropertyName.nameId + "_rev.";
    this.datasheetPropertyNames.push(this.datasheetPropertyName);
    this.index = this.datasheetPropertyNames.length - 1;
  }

  async deleteDatasheetPropertyName() {
    try {
      this.datasheetPropertyNames.splice(this.index, 1);
      this.index = 0;
      this.datasheetPropertyName = this.datasheetPropertyNames[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "propertyName",
      this.datasheetPropertyNames
    );
    return dismiss ? modalController.dismiss() : true;
  }

  async cancel() {
    return modalController.dismiss();
  }

  checkComments() {
    this.datasheetPropertyNames.map((property) => {
      // Split the input string by the startString
      const startSplit = split(property.nameName, "(");
      // If the startString is not found, return null
      if (startSplit.length < 2) {
        return null;
      }
      // Take the part after the startString
      const afterStart = startSplit[1];
      // Split the remaining string by the endString
      const endSplit = split(afterStart, "°C");
      // If the endString is not found, return null
      if (endSplit.length < 2) {
        return null;
      }
      // The desired substring is the first part before the endString
      if (endSplit[0]) {
      }
    });
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-grid>
            <ion-row>
              <ion-col>
                <app-select-search
                  color='trasteel'
                  label={{
                    tag: "datasheet_propertyName",
                    text: "Datasheet Property Name",
                  }}
                  value={
                    this.index
                      ? this.datasheetPropertyNames[this.index].nameId
                      : this.datasheetPropertyNames[0].nameId
                  }
                  lines='none'
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.datasheetPropertyNames}
                  selectValueId='nameId'
                  selectValueText={["nameName"]}
                  disabled={!this.validDatasheetPropertyName}
                ></app-select-search>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validDatasheetPropertyName}
                  onClick={() => this.addDatasheetPropertyName()}
                >
                  <ion-icon name='add' slot='start' />
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validDatasheetPropertyName}
                  onClick={() => this.duplicateDatasheetPropertyName()}
                >
                  <ion-icon slot='start' name='duplicate'></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  color='danger'
                  disabled={this.datasheetPropertyNames.length == 0}
                  onClick={() => this.deleteDatasheetPropertyName()}
                >
                  <ion-icon slot='start' name='trash'></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-item lines='none'>
            <ion-select
              color='trasteel'
              id='selectType'
              interface='action-sheet'
              label={TranslationService.getTransl(
                "datasheet_propertyType",
                "Datasheet Property Type"
              )}
              label-placement='floating'
              onIonChange={(ev) => this.selectPropertyType(ev)}
            >
              {DatasheetsService.datasheetPropertyTypes.map(
                (datasheetPropertyType) => (
                  <ion-select-option value={datasheetPropertyType.typeId}>
                    {datasheetPropertyType.typeName}
                  </ion-select-option>
                )
              )}
            </ion-select>
          </ion-item>
          <app-form-item
            label-text='Position'
            value={this.datasheetPropertyName.position}
            name='position'
            input-type='number'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text='ID'
            value={this.datasheetPropertyName.nameId}
            name='nameId'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "nameId",
                  list: DatasheetsService.getDatasheetPropertyNames(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text='Name'
            value={this.datasheetPropertyName.nameName}
            name='nameName'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text='Decimals'
            value={this.datasheetPropertyName.decimals}
            name='decimals'
            input-type='number'
            inputStep='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={["required"]}
          ></app-form-item>
          <app-form-item
            label-text='Description Left'
            value={this.datasheetPropertyName.nameDescLeft}
            name='nameDescLeft'
            input-type='text'
            multiLanguage={true}
            text-rows='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='floating'
          ></app-form-item>
          <app-form-item
            label-text='Description Right'
            value={this.datasheetPropertyName.nameDescRight}
            name='nameDescRight'
            input-type='text'
            multiLanguage={true}
            text-rows='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='floating'
          ></app-form-item>
          <app-form-item
            label-text='Comments'
            value={this.datasheetPropertyName.comments}
            name='comments'
            input-type='text'
            multiLanguage={true}
            text-rows='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='floating'
          ></app-form-item>
          <app-form-item
            label-text='Dimension'
            value={this.datasheetPropertyName.dimension}
            name='dimension'
            input-type='text'
            multiLanguage={true}
            text-rows='1'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='floating'
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetPropertyName}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
