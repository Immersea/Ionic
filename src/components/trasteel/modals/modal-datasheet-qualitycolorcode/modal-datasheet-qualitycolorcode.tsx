import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isString} from "lodash";
import {TranslationService} from "../../../../services/common/translations";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {DatasheetQualityColorCode} from "../../../../interfaces/trasteel/refractories/datasheets";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";

@Component({
  tag: "modal-datasheet-qualitycolorcode",
  styleUrl: "modal-datasheet-qualitycolorcode.scss",
})
export class ModalDatasheetQualityColorCode {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetQualityColorCodes: DatasheetQualityColorCode[];
  @State() datasheetQualityColorCode: DatasheetQualityColorCode;
  @State() updateView = true;
  @State() validDatasheetQualityColorCode = false;

  async componentWillLoad() {
    await this.loadDatasheetQualityColorCodes();
  }

  async loadDatasheetQualityColorCodes() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetQualityColorCodes = cloneDeep(
      DatasheetsService.getDatasheetQualityColorCodes()
    );
    if (
      this.datasheetQualityColorCodes &&
      this.datasheetQualityColorCodes.length > 0
    ) {
      this.datasheetQualityColorCode = this.datasheetQualityColorCodes[0];
    } else {
      //create new and add to list
      this.addDatasheetQualityColorCode();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    this.datasheetQualityColorCode =
      this.datasheetQualityColorCodes[ev.detail.value];
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "qualityColorCodeId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetQualityColorCode[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetQualityColorCode =
      isString(this.datasheetQualityColorCode.qualityColorCodeId) &&
      isString(this.datasheetQualityColorCode.qualityColorCodePicture);
    this.updateView = !this.updateView;
  }

  addDatasheetQualityColorCode() {
    this.datasheetQualityColorCode = new DatasheetQualityColorCode();
    this.datasheetQualityColorCodes.push(this.datasheetQualityColorCode);
    this.index = this.datasheetQualityColorCodes.length - 1;
  }

  duplicateDatasheetQualityColorCode() {
    this.datasheetQualityColorCode = cloneDeep(this.datasheetQualityColorCode);
    this.datasheetQualityColorCode.qualityColorCodeId =
      this.datasheetQualityColorCode.qualityColorCodeId + "_rev.";
    this.datasheetQualityColorCodes.push(this.datasheetQualityColorCode);
    this.index = this.datasheetQualityColorCodes.length - 1;
  }

  async deleteDatasheetQualityColorCode() {
    try {
      this.datasheetQualityColorCodes.splice(this.index, 1);
      this.index = 0;
      this.datasheetQualityColorCode = this.datasheetQualityColorCodes[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "qualityColorCode",
      this.datasheetQualityColorCodes
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
                      "datasheet_qualityColorCode",
                      "Datasheet QualityColorCode"
                    )}
                    disabled={!this.validDatasheetQualityColorCode}
                    label-placement="floating"
                    onIonChange={(ev) => this.selectType(ev)}
                    value={this.index ? this.index : 0}
                  >
                    {this.datasheetQualityColorCodes.map(
                      (datasheetQualityColorCode, index) => (
                        <ion-select-option value={index}>
                          {datasheetQualityColorCode.qualityColorCodeId +
                            " | " +
                            datasheetQualityColorCode.qualityColorCodePicture}
                        </ion-select-option>
                      )
                    )}
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetQualityColorCode}
                  onClick={() => this.addDatasheetQualityColorCode()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetQualityColorCode}
                  onClick={() => this.duplicateDatasheetQualityColorCode()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.datasheetQualityColorCodes.length == 0}
                  onClick={() => this.deleteDatasheetQualityColorCode()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.datasheetQualityColorCode.qualityColorCodeId}
            name="qualityColorCodeId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "qualityColorCodeId",
                  list: DatasheetsService.getDatasheetQualityColorCodes(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.datasheetQualityColorCode.qualityColorCodePicture}
            name="qualityColorCodePicture"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetQualityColorCode}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
