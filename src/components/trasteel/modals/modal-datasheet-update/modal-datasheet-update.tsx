import { Component, h, Host, Prop, State, Element } from "@stencil/core";
import { modalController } from "@ionic/core";
import { isString } from "lodash";
import { Subscription } from "rxjs";
import Swiper from "swiper";
import { UserProfile } from "../../../../interfaces/common/user/user-profile";
import { UserService } from "../../../../services/common/user";
import { TranslationService } from "../../../../services/common/translations";
import {
  Datasheet,
  DatasheetProperty,
} from "../../../../interfaces/trasteel/refractories/datasheets";
import { DatasheetsService } from "../../../../services/trasteel/refractories/datasheets";
import { Environment } from "../../../../global/env";
import { SystemService } from "../../../../services/common/system";

@Component({
  tag: "modal-datasheet-update",
  styleUrl: "modal-datasheet-update.scss",
})
export class ModalDatasheetUpdate {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) datasheetId: string = undefined;
  @Prop() duplicateDatasheet: { id: string; datasheet: Datasheet } = undefined;
  @Prop() revision: boolean;
  @State() datasheet: Datasheet;
  @State() updateView = true;
  @State() scrollTop = 0;
  @State() propertyNames = {};

  validDatasheet = false;
  titles = [
    { tag: "information", text: "Information", disabled: false },
    { tag: "properties", text: "Properties", disabled: false },
    { tag: "reference", text: "Reference", disabled: false },
    { tag: "comments", text: "Comments", disabled: false },
    { tag: "files", text: "Files", disabled: true },
  ];
  @State() slider: Swiper;
  userProfile: UserProfile;
  userProfileSub$: Subscription;

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    await this.loadDatasheet();
  }

  async loadDatasheet() {
    if (this.datasheetId) {
      const res = await DatasheetsService.getDatasheet(this.datasheetId);
      this.datasheet = res;
    } else {
      const datasheet = new Datasheet(
        this.duplicateDatasheet ? this.duplicateDatasheet.datasheet : null
      );
      if (this.duplicateDatasheet && this.revision) {
        datasheet.revisionNo = datasheet.revisionNo + 1;
      } else {
        datasheet.techNo = DatasheetsService.getMaxDatasheetTechNo();
        datasheet.revisionNo = 0;
      }
      datasheet.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.datasheet = datasheet;
    }
    this.validateDatasheet();
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-edit-datasheet", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });

    if (this.datasheet.productName) {
      //update properties select and validate
      setTimeout(() => {
        Object.keys(this.datasheet.properties).forEach((index) => {
          this.selectPropertyNameForIndex(index);
        });
        this.validateDatasheet();
      });
    }
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  handleChange(ev) {
    this.datasheet[ev.detail.name] = ev.detail.value;
    this.validateDatasheet();
  }

  handlePropertyChange(index: number, ev) {
    const n = ev.detail.name;
    let v = ev.detail.value;
    /*
    //Round decimals to the specific item
    if (n == "typical" || n == "lower" || n == "higher") {
      let decimals = 2;
      if (this.datasheet.properties[index].name)
        decimals = DatasheetsService.getDatasheetPropertyNames(
          "id",
          this.datasheet.properties[index].name
        )[0].decimals;
      console.log(
        "decimals",
        DatasheetsService.getDatasheetPropertyNames(
          "id",
          this.datasheet.properties[index].name
        )[0],
        v,
        decimals
      );
      v = roundDecimals(v, decimals);
    }*/
    this.datasheet.properties[index][n] = v;
    this.validateDatasheet();
  }

  deleteProperty(index) {
    this.datasheet.properties.splice(index, 1);
    this.validateDatasheet();
  }

  validateDatasheet() {
    this.validDatasheet =
      isString(this.datasheet.productName) &&
      isString(this.datasheet.familyId) &&
      isString(this.datasheet.majorFamilyId) &&
      isString(this.datasheet.techNo) &&
      this.datasheet.classification &&
      isString(this.datasheet.categoriesId) &&
      this.checkParameters();
    this.updateSlider();
  }

  checkParameters(): boolean {
    let check = true;
    this.datasheet.properties.forEach((prop) => {
      check =
        check &&
        DatasheetsService.getDatasheetPropertyNames("id", prop.name) &&
        (prop.typical > 0 || prop.higher > 0 || prop.lower >= 0);
    });
    return check;
  }

  selectMajorFamily(ev) {
    this.datasheet.majorFamilyId = ev.detail.value;
    this.validateDatasheet();
  }

  selectFamily(ev) {
    this.datasheet.familyId = ev.detail.value;
    this.validateDatasheet();
  }

  selectCategory(ev) {
    this.datasheet.categoriesId = ev.detail.value;
    this.validateDatasheet();
  }

  addProperty() {
    this.datasheet.properties.push(new DatasheetProperty());
    setTimeout(() => {
      this.setPropertyTypeSelect(this.datasheet.properties.length - 1);
    }, 100);
  }

  async setPropertyTypeSelect(index) {
    const selectLocationElement: HTMLIonSelectElement = this.el.querySelector(
      "#selectPropertyType" + index
    );
    if (selectLocationElement) {
      const customPopoverOptions = {
        header: TranslationService.getTransl("type", "Type"),
      };
      selectLocationElement.interfaceOptions = customPopoverOptions;
      //remove previously defined options
      const selectLocationOptions = Array.from(
        selectLocationElement.getElementsByTagName("ion-select-option")
      );
      selectLocationOptions.map((option) => {
        selectLocationElement.removeChild(option);
      });
      selectLocationElement.placeholder = TranslationService.getTransl(
        "select",
        "Select"
      );
      DatasheetsService.getDatasheetPropertyTypes().map((type) => {
        const selectOption = document.createElement("ion-select-option");
        selectOption.value = type.typeId;
        selectOption.textContent = TranslationService.getTransl(
          type.typeId,
          type.typeName
        );
        selectLocationElement.appendChild(selectOption);
      });
    }
    this.validateDatasheet();
  }

  selectPropertyType(index: number, ev) {
    this.datasheet.properties[index].type = ev.detail.value;
    this.selectPropertyNameForIndex(index);
    this.validateDatasheet();
  }

  selectPropertyNameForIndex(index) {
    let propertyNames = DatasheetsService
      .getDatasheetPropertyNames
      //"type",
      //this.datasheet.properties[index].type
      ();
    if (propertyNames.length == 0)
      propertyNames = DatasheetsService.getDatasheetPropertyNames();
    this.propertyNames[index] = propertyNames;
    this.validateDatasheet();
  }

  selectPropertyName(index: number, ev) {
    //set id and position
    this.datasheet.properties[index].name = ev.detail.value;
    const nameValue = DatasheetsService.getDatasheetPropertyNames(
      "id",
      ev.detail.value
    )[0];
    this.datasheet.properties[index].position = nameValue.position;
    this.validateDatasheet();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async deleteDatasheet() {
    try {
      await DatasheetsService.deleteDatasheet(this.datasheetId);
      modalController.dismiss();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    //remove empty datasheet lines
    const properties = [];
    this.datasheet.properties.map((property) => {
      if (property.type && property.name) {
        properties.push(property);
      }
    });
    this.datasheet.properties = properties;
    //save doc
    const doc = await DatasheetsService.updateDatasheet(
      this.datasheetId,
      this.datasheet,
      this.userProfile.uid
    );
    if (!this.datasheetId) {
      this.datasheetId = doc.id;
      //update old datasheet as old
      if (this.duplicateDatasheet && this.revision) {
        this.duplicateDatasheet.datasheet.oldProduct = true;
        await DatasheetsService.updateDatasheet(
          this.duplicateDatasheet.id,
          this.duplicateDatasheet.datasheet,
          this.userProfile.uid
        );
      }
    }
    dismiss ? modalController.dismiss() : this.updateSlider();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <app-header-segment-toolbar
          color={Environment.getAppColor()}
          swiper={this.slider}
          titles={this.titles}
        ></app-header-segment-toolbar>
        <ion-content
          class='slides'
          onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
        >
          <swiper-container class='slider-edit-datasheet swiper'>
            <swiper-wrapper class='swiper-wrapper'>
              <swiper-slide class='swiper-slide'>
                <ion-list class='ion-no-padding'>
                  <app-select-search
                    color='trasteel'
                    label={{ tag: "principal", text: "Principal" }}
                    labelAddText='*'
                    value={
                      this.datasheet && this.datasheet.majorFamilyId
                        ? this.datasheet.majorFamilyId
                        : null
                    }
                    lines='inset'
                    selectFn={(ev) => this.selectMajorFamily(ev)}
                    selectOptions={DatasheetsService.getDatasheetMajorFamilies()}
                    selectValueId='majorFamilyId'
                    selectValueText={["majorFamilyName"]}
                  ></app-select-search>
                  <app-select-search
                    color='trasteel'
                    label={{ tag: "product", text: "Product" }}
                    labelAddText='*'
                    value={
                      this.datasheet && this.datasheet.familyId
                        ? this.datasheet.familyId
                        : null
                    }
                    lines='inset'
                    selectFn={(ev) => this.selectFamily(ev)}
                    selectOptions={DatasheetsService.getDatasheetFamilies()}
                    selectValueId='familyId'
                    selectValueText={["familyName"]}
                  ></app-select-search>
                  <app-select-search
                    color='trasteel'
                    label={{ tag: "category", text: "Category" }}
                    labelAddText='*'
                    value={
                      this.datasheet && this.datasheet.categoriesId
                        ? this.datasheet.categoriesId
                        : null
                    }
                    lines='inset'
                    selectFn={(ev) => this.selectCategory(ev)}
                    selectOptions={DatasheetsService.getDatasheetCategories()}
                    selectValueId='categoriesId'
                    selectValueText={["categoriesName"]}
                  ></app-select-search>
                  <app-form-item
                    lines='inset'
                    label-tag='tech-no'
                    label-text='Tech. #'
                    value={this.datasheet.techNo}
                    name='techNo'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='revision-no'
                    label-text='Revision #'
                    value={this.datasheet.revisionNo}
                    name='revisionNo'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='old'
                    label-text='Old'
                    value={this.datasheet.oldProduct}
                    name='oldProduct'
                    input-type='boolean'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='issued-on-date'
                    label-text='Issued on Date'
                    value={this.datasheet.issuedOnDate}
                    name='issuedOnDate'
                    input-type='date'
                    date-presentation='date'
                    prefer-wheel={false}
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='product-name'
                    label-text='Product Name'
                    value={this.datasheet.productName}
                    name='productName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='classification'
                    label-text='Classification'
                    value={this.datasheet.classification}
                    name='classification'
                    input-type='text'
                    multiLanguage={true}
                    text-rows='4'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    onUpdateSlider={() => this.updateSlider()}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='application'
                    label-text='Application'
                    value={this.datasheet.application}
                    name='application'
                    input-type='text'
                    multiLanguage={true}
                    text-rows='4'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    onUpdateSlider={() => this.updateSlider()}
                    validator={["required"]}
                  ></app-form-item>
                </ion-list>
                {this.datasheetId ? (
                  <ion-footer class='ion-no-border'>
                    <ion-toolbar>
                      <ion-button
                        expand='block'
                        fill='outline'
                        color='danger'
                        onClick={() => this.deleteDatasheet()}
                      >
                        <ion-icon slot='start' name='trash'></ion-icon>
                        <my-transl
                          tag='delete'
                          text='Delete'
                          isLabel
                        ></my-transl>
                      </ion-button>
                    </ion-toolbar>
                  </ion-footer>
                ) : undefined}
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <div id='properties-grid'>
                  <ion-grid>
                    <ion-row>
                      <ion-col size='2' class='centered'>
                        <small>
                          {TranslationService.getTransl("type", "Type")}
                        </small>
                      </ion-col>
                      <ion-col size='2' class='centered'>
                        <small>
                          {TranslationService.getTransl("name", "Name")}
                        </small>
                      </ion-col>
                      <ion-col size='1' class='centered'>
                        <small>
                          {TranslationService.getTransl("typical", "Typical")}
                        </small>
                      </ion-col>
                      <ion-col size='2' class='centered'>
                        <small>
                          {TranslationService.getTransl("prefix", "Prefix")}
                        </small>
                      </ion-col>
                      <ion-col size='2' class='centered'>
                        <small>
                          {TranslationService.getTransl("from", "From")}
                        </small>
                      </ion-col>
                      <ion-col size='2' class='centered'>
                        <small>
                          {TranslationService.getTransl("to", "To")}
                        </small>
                      </ion-col>
                      <ion-col size='1' class='centered'>
                        <small>
                          {TranslationService.getTransl("show", "Show") +
                            "/" +
                            TranslationService.getTransl("delete", "Delete")}
                        </small>
                      </ion-col>
                    </ion-row>
                    {this.datasheet.properties.map((property, index) => (
                      <ion-row>
                        {property.type === "general"
                          ? [
                              <ion-col size='2'>
                                <app-select-search
                                  color='trasteel'
                                  value={property.type ? property.type : null}
                                  lines='none'
                                  selectFn={(ev) =>
                                    this.selectPropertyType(index, ev)
                                  }
                                  selectOptions={DatasheetsService.getDatasheetPropertyTypes()}
                                  selectValueId='typeId'
                                  selectValueText={["typeName"]}
                                ></app-select-search>
                              </ion-col>,
                              <ion-col size='2'>
                                <app-select-search
                                  color='trasteel'
                                  value={property.name ? property.name : null}
                                  lines='none'
                                  disabled={!this.propertyNames[index]}
                                  selectFn={(ev) =>
                                    this.selectPropertyName(index, ev)
                                  }
                                  selectOptions={this.propertyNames[index]}
                                  selectValueId='nameId'
                                  selectValueText={["nameName"]}
                                ></app-select-search>
                              </ion-col>,
                              <ion-col size='7' class='centered'>
                                <app-form-item
                                  value={property.prefix}
                                  name='prefix'
                                  input-type='text'
                                  onFormItemChanged={(ev) =>
                                    this.handlePropertyChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>,
                              <ion-col size='1' class='centered'>
                                <ion-grid class='remove-background'>
                                  <ion-row>
                                    <ion-col class='centered'>
                                      <app-form-item
                                        class='ion-no-padding'
                                        value={property.show}
                                        name='show'
                                        input-type='boolean'
                                        onFormItemChanged={(ev) =>
                                          this.handlePropertyChange(index, ev)
                                        }
                                      ></app-form-item>
                                    </ion-col>
                                    <ion-col class='centered'>
                                      <ion-button
                                        class='ion-no-padding'
                                        icon-only
                                        color='danger'
                                        fill='clear'
                                        onClick={() =>
                                          this.deleteProperty(index)
                                        }
                                      >
                                        <ion-icon name='trash'></ion-icon>
                                      </ion-button>
                                    </ion-col>
                                  </ion-row>
                                </ion-grid>
                              </ion-col>,
                            ]
                          : [
                              <ion-col size='2'>
                                <app-select-search
                                  color='trasteel'
                                  value={property.type ? property.type : null}
                                  lines='none'
                                  selectFn={(ev) =>
                                    this.selectPropertyType(index, ev)
                                  }
                                  selectOptions={DatasheetsService.getDatasheetPropertyTypes()}
                                  selectValueId='typeId'
                                  selectValueText={["typeName"]}
                                ></app-select-search>
                              </ion-col>,
                              <ion-col size='2'>
                                <app-select-search
                                  color='trasteel'
                                  value={property.name ? property.name : null}
                                  lines='none'
                                  disabled={!this.propertyNames[index]}
                                  selectFn={(ev) =>
                                    this.selectPropertyName(index, ev)
                                  }
                                  selectOptions={this.propertyNames[index]}
                                  selectValueId='nameId'
                                  selectValueText={["nameName"]}
                                ></app-select-search>
                              </ion-col>,
                              <ion-col size='1' class='centered'>
                                <app-form-item
                                  value={property.typical}
                                  name='typical'
                                  input-type='number'
                                  onFormItemChanged={(ev) =>
                                    this.handlePropertyChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>,
                              <ion-col size='2' class='centered'>
                                <app-form-item
                                  value={property.prefix}
                                  name='prefix'
                                  input-type='text'
                                  onFormItemChanged={(ev) =>
                                    this.handlePropertyChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>,
                              <ion-col size='2' class='centered'>
                                <app-form-item
                                  value={property.lower}
                                  name='lower'
                                  input-type='number'
                                  onFormItemChanged={(ev) =>
                                    this.handlePropertyChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>,
                              <ion-col size='2' class='centered'>
                                <app-form-item
                                  value={property.higher}
                                  name='higher'
                                  input-type='number'
                                  onFormItemChanged={(ev) =>
                                    this.handlePropertyChange(index, ev)
                                  }
                                ></app-form-item>
                              </ion-col>,
                              <ion-col size='1' class='centered'>
                                <ion-grid class='remove-background'>
                                  <ion-row>
                                    <ion-col class='centered'>
                                      <app-form-item
                                        class='ion-no-padding'
                                        value={property.show}
                                        name='show'
                                        input-type='boolean'
                                        onFormItemChanged={(ev) =>
                                          this.handlePropertyChange(index, ev)
                                        }
                                      ></app-form-item>
                                    </ion-col>
                                    <ion-col class='centered'>
                                      <ion-button
                                        class='ion-no-padding'
                                        icon-only
                                        color='danger'
                                        fill='clear'
                                        onClick={() =>
                                          this.deleteProperty(index)
                                        }
                                      >
                                        <ion-icon name='trash'></ion-icon>
                                      </ion-button>
                                    </ion-col>
                                  </ion-row>
                                </ion-grid>
                              </ion-col>,
                            ]}
                      </ion-row>
                    ))}
                  </ion-grid>
                </div>

                <io-item>
                  <ion-button
                    expand='full'
                    shape='round'
                    color='trasteel'
                    size='small'
                    onClick={() => this.addProperty()}
                  >
                    +
                  </ion-button>
                </io-item>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-list>
                  <app-form-item
                    lines='inset'
                    label-tag='producer'
                    label-text='Producer'
                    value={this.datasheet.producerName}
                    name='producerName'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='producer-ref-quality'
                    label-text='Producer Reference Quality'
                    value={this.datasheet.producerReferenceQuality}
                    name='producerReferenceQuality'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='competitor-ref-quality'
                    label-text='Competitor Reference Quality'
                    value={this.datasheet.competitorReferenceQuality}
                    name='competitorReferenceQuality'
                    input-type='text'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                <ion-list>
                  <app-form-item
                    lines='inset'
                    label-tag='comments'
                    label-text='Comments'
                    value={this.datasheet.comments}
                    name='comments'
                    input-type='text'
                    text-rows='4'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    lines='inset'
                    label-tag='performance-comments'
                    label-text='Performance Comments'
                    value={this.datasheet.performanceComments}
                    name='performanceComments'
                    input-type='text'
                    text-rows='4'
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                </ion-list>
              </swiper-slide>
              <swiper-slide class='swiper-slide'>
                FILES - TO BE DONE
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validDatasheet}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
