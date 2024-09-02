import {Component, h, Host, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";
import {DatasheetCategory} from "../../../../interfaces/trasteel/refractories/datasheets";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";
import {cloneDeep, isString} from "lodash";

@Component({
  tag: "modal-datasheet-category",
  styleUrl: "modal-datasheet-category.scss",
})
export class ModalDatasheetCategory {
  @Element() el: HTMLElement;
  @State() index: number = 0;
  @State() datasheetCategories: DatasheetCategory[];
  @State() datasheetCategory: DatasheetCategory;
  @State() updateView = true;
  @State() validDatasheetCategory = false;

  async componentWillLoad() {
    await this.loadDatasheetCategories();
  }

  async loadDatasheetCategories() {
    await DatasheetsService.downloadDatasheetSettings();
    this.datasheetCategories = cloneDeep(
      DatasheetsService.getDatasheetCategories()
    );
    if (this.datasheetCategories && this.datasheetCategories.length > 0) {
      this.datasheetCategory = this.datasheetCategories[0];
    } else {
      //create new and add to list
      this.addDatasheetCategory();
    }
    this.validateDatasheet();
  }

  selectType(ev) {
    this.datasheetCategory = this.datasheetCategories.find(
      (x) => x.categoriesId == ev.detail.value
    );
    this.validateDatasheet();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    if (n == "categoriesId") {
      //remove spaces and lowercase
      v = v.replace(/\s+/g, "-").trim().toLowerCase();
    }
    this.datasheetCategory[n] = v;
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheetCategory =
      isString(this.datasheetCategory.categoriesId) &&
      isString(this.datasheetCategory.categoriesName);
    this.updateView = !this.updateView;
  }

  addDatasheetCategory() {
    this.datasheetCategory = new DatasheetCategory();
    this.datasheetCategories.push(this.datasheetCategory);
    this.index = this.datasheetCategories.length - 1;
  }

  duplicateDatasheetCategory() {
    this.datasheetCategory = cloneDeep(this.datasheetCategory);
    this.datasheetCategory.categoriesId =
      this.datasheetCategory.categoriesId + "_rev.";
    this.datasheetCategories.push(this.datasheetCategory);
    this.index = this.datasheetCategories.length - 1;
  }

  async deleteDatasheetCategory() {
    try {
      this.datasheetCategories.splice(this.index, 1);
      this.index = 0;
      this.datasheetCategory = this.datasheetCategories[0];
      this.validateDatasheet();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    await DatasheetsService.uploadDatasheetSettings(
      "category",
      this.datasheetCategories
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
                    tag: "datasheet_category",
                    text: "Datasheet Category",
                  }}
                  value={
                    this.index
                      ? this.datasheetCategories[this.index].categoriesId
                      : this.datasheetCategories[0].categoriesId
                  }
                  lines="none"
                  label-placement="floating"
                  selectFn={(ev) => this.selectType(ev)}
                  selectOptions={this.datasheetCategories}
                  selectValueId="categoriesId"
                  selectValueText={["categoriesName"]}
                  disabled={!this.validDatasheetCategory}
                ></app-select-search>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetCategory}
                  onClick={() => this.addDatasheetCategory()}
                >
                  <ion-icon name="add" slot="start" />
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  disabled={!this.validDatasheetCategory}
                  onClick={() => this.duplicateDatasheetCategory()}
                >
                  <ion-icon slot="start" name="duplicate"></ion-icon>
                </ion-button>
              </ion-col>
              <ion-col size="1" class="ion-text-center">
                <ion-button
                  fill="clear"
                  color="danger"
                  disabled={this.datasheetCategories.length == 0}
                  onClick={() => this.deleteDatasheetCategory()}
                >
                  <ion-icon slot="start" name="trash"></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
          <app-form-item
            label-text="ID"
            value={this.datasheetCategory.categoriesId}
            name="categoriesId"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={[
              "required",
              {
                name: "uniqueid",
                options: {
                  type: "list",
                  index: "categoriesId",
                  list: DatasheetsService.getDatasheetCategories(),
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-text="Name"
            value={this.datasheetCategory.categoriesName}
            name="categoriesName"
            input-type="string"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            labelPosition="fixed"
            validator={["required"]}
          ></app-form-item>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheetCategory}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
