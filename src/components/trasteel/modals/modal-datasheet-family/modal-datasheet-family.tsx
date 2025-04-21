import { Component, h, Host, State, Element } from "@stencil/core";
import { modalController } from "@ionic/core";
import { cloneDeep, isString } from "lodash";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";
import { DatasheetFamily } from "../../../../interfaces/trasteel/refractories/datasheets";
import { DatasheetsService } from "../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "modal-datasheet-family",
  styleUrl: "modal-datasheet-family.scss",
})
export class ModalDatasheetFamily {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetFamilies: DatasheetFamily[];
  @State() datasheetFamily: DatasheetFamily;
  @State() updateView = true;
  @State() validDatasheetFamily = false;

  async componentWillLoad() {
    await this.loadDatasheetFamilies();
  }

  async loadDatasheetFamilies() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetFamilies = cloneDeep(
      DatasheetsService.getDatasheetFamilies()
    );
    if (this.datasheetFamilies && this.datasheetFamilies.length > 0) {
      this.datasheetFamily = this.datasheetFamilies[0];
    } else {
      //create new and add to list
      this.addDatasheetFamily();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    this.datasheetFamily = this.datasheetFamilies.find(
      (x) => x.familyId == ev.detail.value
    );
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "familyId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetFamily[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetFamily =
      isString(this.datasheetFamily.familyId) &&
      isString(this.datasheetFamily.familyName);
    this.updateView = !this.updateView;
  }

  addDatasheetFamily() {
    this.datasheetFamily = new DatasheetFamily();
    this.datasheetFamilies.push(this.datasheetFamily);
    this.index = this.datasheetFamilies.length - 1;
  }

  duplicateDatasheetFamily() {
    this.datasheetFamily = cloneDeep(this.datasheetFamily);
    this.datasheetFamily.familyId = this.datasheetFamily.familyId + "_rev.";
    this.datasheetFamilies.push(this.datasheetFamily);
    this.index = this.datasheetFamilies.length - 1;
  }

  async deleteDatasheetFamily() {
    try {
      this.datasheetFamilies.splice(this.index, 1);
      this.index = 0;
      this.datasheetFamily = this.datasheetFamilies[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "family",
      this.datasheetFamilies
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
                  color='trasteel'
                  label={{
                    tag: "datasheet_family",
                    text: "Datasheet Family",
                  }}
                  value={
                    this.index
                      ? this.datasheetFamilies[this.index].familyId
                      : this.datasheetFamilies[0].familyId
                  }
                  lines='none'
                  label-placement='floating'
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.datasheetFamilies}
                  selectValueId='familyId'
                  selectValueText={["familyName"]}
                  disabled={!this.validDatasheetFamily}
                ></app-select-search>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validDatasheetFamily}
                  onClick={() => this.addDatasheetFamily()}
                >
                  <ion-icon name='add' slot='start' />
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  disabled={!this.validDatasheetFamily}
                  onClick={() => this.duplicateDatasheetFamily()}
                >
                  <ion-icon slot='start' name='duplicate'></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size='1' class='ion-text-center'>
                <ion-button
                  fill='clear'
                  color='danger'
                  disabled={this.datasheetFamilies.length == 0}
                  onClick={() => this.deleteDatasheetFamily()}
                >
                  <ion-icon slot='start' name='trash'></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text='ID'
            value={this.datasheetFamily.familyId}
            name='familyId'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "familyId",
                  list: DatasheetsService.getDatasheetFamilies(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text='Name'
            value={this.datasheetFamily.familyName}
            name='familyName'
            input-type='string'
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition='fixed'
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetFamily}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
