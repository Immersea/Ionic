import {Component, h, Host, Element, Prop, State} from "@stencil/core";
import {popoverController} from "@ionic/core";
import {TranslationService} from "../../../../services/common/translations";
import {
  DatasheetFamily,
  DatasheetFilter,
  DatasheetMajorFamily,
  DatasheetPropertyName,
} from "../../../../interfaces/trasteel/refractories/datasheets";
import {DatasheetsService} from "../../../../services/trasteel/refractories/datasheets";
import {FirebaseFilterCondition} from "../../../../interfaces/common/system/system";
import {cloneDeep, isNull, isString} from "lodash";

@Component({
  tag: "popover-datasheets-filter",
  styleUrl: "popover-datasheets-filter.scss",
})
export class PopoverDatasheetsFilter {
  @Element() el: HTMLElement;
  @Prop() filter: DatasheetFilter;
  @State() showBaseFilter = true;
  @State() propertyNames: DatasheetPropertyName[] = [];
  @State() newFilterCondition: FirebaseFilterCondition;
  @State() showAddNewProperty = false;
  @State() updateView = false;
  popover: HTMLIonPopoverElement;
  datasheetMajorFamilies: DatasheetMajorFamily[];
  datasheetFamilies: DatasheetFamily[];

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.datasheetMajorFamilies = DatasheetsService.getDatasheetMajorFamilies();
    this.datasheetFamilies = DatasheetsService.getDatasheetFamilies();
    this.propertyNames = DatasheetsService.getDatasheetPropertyNames();
    this.resetNewFilterCondition();
  }

  resetNewFilterCondition() {
    this.newFilterCondition = new FirebaseFilterCondition({
      field: "properties",
      fieldName: "name",
      valueName: "mgo",
      comparisonField: "lower",
    });
    this.validateProperty();
  }

  deleteCondition(index) {
    this.filter.properties.splice(index, 1);
    this.updateView = !this.updateView;
  }

  handleFilter(ev) {
    this.filter[ev.detail.name] = ev.detail.value;
  }

  handleMajorFamilySelect(ev) {
    this.filter.majorFamilyId = ev.detail.value;
  }

  handleFamilySelect(ev) {
    this.filter.familyId = ev.detail.value;
  }

  segmentChanged(ev) {
    if (ev.detail.value == "base") {
      this.showBaseFilter = true;
    } else {
      this.showBaseFilter = false;
    }
  }

  selectPropertyName(ev) {
    this.newFilterCondition.valueName = ev.detail.value;
    this.validateProperty();
  }

  selectOperator(ev) {
    this.newFilterCondition.operator = ev.detail.value;
    this.validateProperty();
  }

  selectValue(ev) {
    this.newFilterCondition.value = ev.detail.value;
    this.validateProperty();
  }

  addNewProperty() {
    this.filter.properties.push(cloneDeep(this.newFilterCondition));
    this.resetNewFilterCondition();
  }

  validateProperty() {
    this.showAddNewProperty =
      isString(this.newFilterCondition.field) &&
      isString(this.newFilterCondition.fieldName) &&
      isString(this.newFilterCondition.operator) &&
      isString(this.newFilterCondition.valueName) &&
      !isNull(this.newFilterCondition.value);
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    popoverController.dismiss(this.filter);
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-title>Filter Datasheets</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-segment
            mode="ios"
            color="trasteel"
            onIonChange={(ev) => this.segmentChanged(ev)}
            value="base"
          >
            <ion-segment-button value="base">
              <ion-label>Base</ion-label>
            </ion-segment-button>
            <ion-segment-button value="advanced">
              <ion-label>Advanced</ion-label>
            </ion-segment-button>
          </ion-segment>
          <ion-list>
            {this.showBaseFilter
              ? [
                  <ion-item>
                    <ion-select
                      color="trasteel"
                      interface="action-sheet"
                      label={TranslationService.getTransl(
                        "majorFamily",
                        "Major Family"
                      )}
                      label-placement="floating"
                      onIonChange={(ev) => this.handleMajorFamilySelect(ev)}
                      value={this.filter.majorFamilyId}
                    >
                      {this.datasheetMajorFamilies.map((type) => (
                        <ion-select-option value={type.majorFamilyId}>
                          {type.majorFamilyName}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-item>,
                  <ion-item>
                    <ion-select
                      color="trasteel"
                      interface="action-sheet"
                      label={TranslationService.getTransl("family", "Family")}
                      label-placement="floating"
                      onIonChange={(ev) => this.handleFamilySelect(ev)}
                      value={this.filter.familyId}
                    >
                      {this.datasheetFamilies.map((type) => (
                        <ion-select-option value={type.familyId}>
                          {type.familyName}
                        </ion-select-option>
                      ))}
                    </ion-select>
                  </ion-item>,
                  <app-form-item
                    label-text="Show Old Products"
                    value={this.filter.oldProduct}
                    name="oldProduct"
                    input-type="boolean"
                    onFormItemChanged={(ev) => this.handleFilter(ev)}
                  ></app-form-item>,
                ]
              : [
                  <ion-grid>
                    <ion-row>
                      <ion-col>
                        <app-select-search
                          color="trasteel"
                          value={this.newFilterCondition.valueName}
                          lines="none"
                          disabled={this.propertyNames.length == 0}
                          selectFn={(ev) => this.selectPropertyName(ev)}
                          selectOptions={this.propertyNames}
                          selectValueId="nameId"
                          selectValueText={["nameName"]}
                        ></app-select-search>
                      </ion-col>
                      <ion-col size="3">
                        <ion-item lines="none">
                          <ion-select
                            color="trasteel"
                            interface="action-sheet"
                            onIonChange={(ev) => this.selectOperator(ev)}
                            value={this.newFilterCondition.operator}
                          >
                            <ion-select-option value={">="}>
                              <ion-label>{">="}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={">"}>
                              <ion-label>{">"}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"="}>
                              <ion-label>{"="}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"<"}>
                              <ion-label>{"<"}</ion-label>
                            </ion-select-option>
                            <ion-select-option value={"<="}>
                              <ion-label>{"<="}</ion-label>
                            </ion-select-option>
                          </ion-select>
                        </ion-item>
                      </ion-col>
                    </ion-row>
                    <ion-row>
                      <ion-col>
                        <app-form-item
                          value={this.newFilterCondition.value}
                          name="typical"
                          input-type="number"
                          onFormItemChanged={(ev) => this.selectValue(ev)}
                        ></app-form-item>
                      </ion-col>

                      <ion-col size="3">
                        <ion-button
                          icon-only
                          fill="outline"
                          onClick={() => this.addNewProperty()}
                          disabled={!this.showAddNewProperty}
                        >
                          <ion-icon name="add" color="primary"></ion-icon>
                        </ion-button>
                      </ion-col>
                    </ion-row>
                  </ion-grid>,
                  <ion-item-divider>
                    <ion-label>Conditions</ion-label>
                  </ion-item-divider>,
                  this.filter.properties.map((property, index) => (
                    <ion-item>
                      <ion-label>
                        {DatasheetsService.getDatasheetPropertyNames(
                          "id",
                          property.valueName
                        )[0].nameName +
                          " " +
                          property.operator +
                          " " +
                          property.value}
                      </ion-label>
                      <ion-button
                        icon-only
                        fill="clear"
                        onClick={() => this.deleteCondition(index)}
                      >
                        <ion-icon name="trash" color="danger"></ion-icon>
                      </ion-button>
                    </ion-item>
                  )),
                ]}
          </ion-list>
        </ion-content>
        <ion-footer>
          <app-modal-footer
            saveTag={{tag: "filter", text: "Filter"}}
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
        </ion-footer>
      </Host>
    );
  }
}
