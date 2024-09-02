import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {cloneDeep, isString} from "lodash";
import {TranslationService} from "../../../../services/common/translations";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {QuantityUnit} from "../../../../interfaces/trasteel/refractories/projects";
import {ProjectsService} from "../../../../services/trasteel/refractories/projects";

@Component({
  tag: "modal-project-quantityunit",
  styleUrl: "modal-project-quantityunit.scss",
})
export class ModalQuantityUnit {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() quantityUnits: QuantityUnit[];
  @State() quantityUnit: QuantityUnit;
  @State() updateView = true;
  @State() validQuantityUnit = false;

  async componentWillLoad() {
    await this.loadQuantityUnits();
  }

  async loadQuantityUnits() {
    await ProjectsService.downloadProjectSettings();
    this.quantityUnits = cloneDeep(ProjectsService.getQuantityUnits());
    if (this.quantityUnits && this.quantityUnits.length > 0) {
      this.quantityUnit = this.quantityUnits[0];
    } else {
      //create new and add to list
      this.addQuantityUnit();
    }
    this.validateProject();
  }

  selectType(ev) {
    this.quantityUnit = this.quantityUnits[ev.detail.value];
    this.validateProject();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "familyId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.quantityUnit[n] = v;
    this.validateProject();
  }

  validateProject() {
    this.validQuantityUnit =
      isString(this.quantityUnit.quantityUnitId) &&
      isString(this.quantityUnit.quantityUnitId);
    this.updateView = !this.updateView;
  }

  addQuantityUnit() {
    this.quantityUnit = new QuantityUnit();
    this.quantityUnits.push(this.quantityUnit);
    this.index = this.quantityUnits.length - 1;
  }

  duplicateQuantityUnit() {
    this.quantityUnit = cloneDeep(this.quantityUnit);
    this.quantityUnit.quantityUnitId =
      this.quantityUnit.quantityUnitId + "_rev.";
    this.quantityUnits.push(this.quantityUnit);
    this.index = this.quantityUnits.length - 1;
  }

  async deleteQuantityUnit() {
    try {
      this.quantityUnits.splice(this.index, 1);
      this.index = 0;
      this.quantityUnit = this.quantityUnits[0];
      this.validateProject();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await ProjectsService.uploadProjectSettings(
      "quantityUnit",
      this.quantityUnits
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
                      "project_quantityunit",
                      "Project Quantity Unit"
                    )}
                    disabled={!this.validQuantityUnit}
                    label-placement="floating"
                    onIonChange={(ev) => this.selectType(ev)}
                    value={this.index ? this.index : 0}
                  >
                    {this.quantityUnits.map((quantityUnit, index) => (
                      <ion-select-option value={index}>
                        {quantityUnit.quantityUnitId +
                          " | " +
                          quantityUnit.quantityUnitName.en}
                      </ion-select-option>
                    ))}
                  </ion-select>
                </ion-item>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validQuantityUnit}
                  onClick={() => this.addQuantityUnit()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validQuantityUnit}
                  onClick={() => this.duplicateQuantityUnit()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.quantityUnits.length == 0}
                  onClick={() => this.deleteQuantityUnit()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.quantityUnit.quantityUnitId}
            name="quantityUnitId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "quantityUnitId",
                  list: ProjectsService.getQuantityUnits(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.quantityUnit.quantityUnitName}
            name="quantityUnitName"
            input-type="text"
            multiLanguage={true}
            text-rows="1"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validQuantityUnit}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
