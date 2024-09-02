import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isString} from "lodash";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {DatasheetMajorFamily} from "../../../../interfaces/trasteel/refractories/datasheets";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "modal-datasheet-majorfamily",
  styleUrl: "modal-datasheet-majorfamily.scss",
})
export class ModalDatasheetMajorfamily {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetMajorFamilies: DatasheetMajorFamily[];
  @State() datasheetMajorFamily: DatasheetMajorFamily;
  @State() updateView = true;
  @State() validDatasheetMajorFamily = false;

  async componentWillLoad() {
    await this.loadDatasheetMajorFamilies();
  }

  async loadDatasheetMajorFamilies() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetMajorFamilies = cloneDeep(
      DatasheetsService.getDatasheetMajorFamilies()
    );
    if (this.datasheetMajorFamilies && this.datasheetMajorFamilies.length > 0) {
      this.datasheetMajorFamily = this.datasheetMajorFamilies[0];
    } else {
      //create new and add to list
      this.addDatasheetMajorFamily();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    this.datasheetMajorFamily = this.datasheetMajorFamilies.find(
      (x) => x.majorFamilyId == ev.detail.value
    );
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "majorFamilyId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetMajorFamily[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetMajorFamily =
      isString(this.datasheetMajorFamily.majorFamilyId) &&
      isString(this.datasheetMajorFamily.majorFamilyName);
    this.updateView = !this.updateView;
  }

  addDatasheetMajorFamily() {
    this.datasheetMajorFamily = new DatasheetMajorFamily();
    this.datasheetMajorFamilies.push(this.datasheetMajorFamily);
    this.index = this.datasheetMajorFamilies.length - 1;
  }

  duplicateDatasheetMajorFamily() {
    this.datasheetMajorFamily = cloneDeep(this.datasheetMajorFamily);
    this.datasheetMajorFamily.majorFamilyId =
      this.datasheetMajorFamily.majorFamilyId + "_rev.";
    this.datasheetMajorFamilies.push(this.datasheetMajorFamily);
    this.index = this.datasheetMajorFamilies.length - 1;
  }

  async deleteDatasheetMajorFamily() {
    try {
      this.datasheetMajorFamilies.splice(this.index, 1);
      this.index = 0;
      this.datasheetMajorFamily = this.datasheetMajorFamilies[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "majorfamily",
      this.datasheetMajorFamilies
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
                      ? this.datasheetMajorFamilies[this.index].majorFamilyId
                      : this.datasheetMajorFamilies[0].majorFamilyId
                  }
                  lines="none"
                  label-placement="floating"
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.datasheetMajorFamilies}
                  selectValueId="majorFamilyId"
                  selectValueText={["majorFamilyName"]}
                  disabled={!this.validDatasheetMajorFamily}
                ></app-select-search>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetMajorFamily}
                  onClick={() => this.addDatasheetMajorFamily()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetMajorFamily}
                  onClick={() => this.duplicateDatasheetMajorFamily()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.datasheetMajorFamilies.length == 0}
                  onClick={() => this.deleteDatasheetMajorFamily()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.datasheetMajorFamily.majorFamilyId}
            name="majorFamilyId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "majorFamilyId",
                  list: DatasheetsService.getDatasheetMajorFamilies(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.datasheetMajorFamily.majorFamilyName}
            name="majorFamilyName"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetMajorFamily}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
