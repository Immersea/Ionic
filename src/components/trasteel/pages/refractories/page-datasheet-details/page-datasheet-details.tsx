import { Component, Prop, State, h } from "@stencil/core";
import { Datasheet } from "../../../../../interfaces/trasteel/refractories/datasheets";
import { DatasheetsService } from "../../../../../services/trasteel/refractories/datasheets";
import Swiper from "swiper";
import { TranslationService } from "../../../../../services/common/translations";
import { SystemService } from "../../../../../services/common/system";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import { RouterService } from "../../../../../services/common/router";
import { toNumber, toString } from "lodash";
import { Environment } from "../../../../../global/env";

@Component({
  tag: "page-datasheet-details",
  styleUrl: "page-datasheet-details.scss",
})
export class PageDatasheetDetails {
  @Prop() itemId: string;
  @State() datasheet: Datasheet;
  @State() updateView = true;
  titles = [
    { tag: "information", text: "Information" },
    { tag: "properties", text: "Properties" },
    { tag: "reference", text: "Reference" },
    { tag: "comments", text: "Comments" },
    { tag: "files", text: "Files", disabled: true },
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    if (this.itemId) {
      await this.loadDatasheet();
    } else {
      SystemService.dismissLoading();
      SystemService.presentAlertError("No Item Id");
      RouterService.goBack();
    }
  }

  async loadDatasheet() {
    try {
      this.datasheet = await DatasheetsService.getDatasheet(this.itemId);
    } catch (error) {
      SystemService.dismissLoading();
      SystemService.presentAlertError(error);
      RouterService.goBack();
    }
    SystemService.dismissLoading();
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-detail-datasheet", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
    });
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async editDatasheet() {
    const modal = await DatasheetsService.presentDatasheetUpdate(this.itemId);
    //update customer data after modal dismiss
    modal.onDidDismiss().then(() => this.loadDatasheet());
  }

  exportDatasheet() {
    const datasheet = this.datasheet;
    datasheet["datasheetId"] = this.itemId;
    DatasheetsService.exportDatasheets([datasheet]);
  }

  deleteDs() {
    DatasheetsService.deleteDatasheet(this.itemId);
    RouterService.goBack();
  }

  duplicateDatasheet(revision) {
    DatasheetsService.duplicateDatasheet(this.itemId, revision);
    RouterService.goBack();
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          text={this.datasheet.productName}
          color={Environment.getAppColor()}
          backButton={true}
          rightButtonText={
            TrasteelService.isRefraDBAdmin()
              ? {
                  icon: "create",
                  fill: "outline",
                  tag: "edit",
                  text: "Edit",
                }
              : null
          }
          rightButtonFc={() => this.editDatasheet()}
        ></app-navbar>
      </ion-header>,
      <ion-header>
        <ion-toolbar>
          <ion-grid class='ion-no-padding'>
            <ion-row>
              <ion-col>
                <app-header-segment-toolbar
                  color={Environment.getAppColor()}
                  swiper={this.slider}
                  titles={this.titles}
                ></app-header-segment-toolbar>
              </ion-col>
              <ion-col size='1'>
                <ion-button
                  fill='clear'
                  expand='full'
                  color='trasteel'
                  icon-only
                  onClick={() => this.exportDatasheet()}
                >
                  <ion-icon name='download'></ion-icon>
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-toolbar>
      </ion-header>,
      <ion-content class='slides'>
        <swiper-container class='slider-detail-datasheet swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              <ion-list class='ion-no-padding'>
                <app-item-detail
                  lines='none'
                  labelTag='principal'
                  labelText='Principal'
                  detailText={
                    DatasheetsService.getDatasheetMajorFamilies(
                      this.datasheet.majorFamilyId
                    )
                      ? DatasheetsService.getDatasheetMajorFamilies(
                          this.datasheet.majorFamilyId
                        )[0].majorFamilyName
                      : this.datasheet.majorFamilyId
                  }
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelTag='product'
                  labelText='Product'
                  detailText={
                    DatasheetsService.getDatasheetFamilies(
                      this.datasheet.familyId
                    )
                      ? DatasheetsService.getDatasheetFamilies(
                          this.datasheet.familyId
                        )[0].familyName
                      : this.datasheet.familyId
                  }
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelTag='category'
                  labelText='Category'
                  detailText={
                    DatasheetsService.getDatasheetCategories(
                      this.datasheet.categoriesId
                    )
                      ? DatasheetsService.getDatasheetCategories(
                          this.datasheet.categoriesId
                        )[0].categoriesName
                      : this.datasheet.categoriesId
                  }
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='tech-no'
                  label-text='Tech. #'
                  detailText={this.datasheet.techNo}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='revision-no'
                  label-text='Revision #'
                  detailText={toString(this.datasheet.revisionNo)}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='old'
                  label-text='Old'
                  detailText={this.datasheet.oldProduct}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='issued-on-date'
                  label-text='Issued on Date'
                  detailText={new Date(
                    this.datasheet.issuedOnDate
                  ).toLocaleDateString()}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='product-name'
                  label-text='Product Name'
                  detailText={this.datasheet.productName}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='classification'
                  label-text='Classification'
                  detailText={this.datasheet.classification}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='application'
                  label-text='Application'
                  detailText={this.datasheet.application}
                ></app-item-detail>
              </ion-list>
              {TrasteelService.isRefraDBAdmin() ? (
                <ion-grid>
                  <ion-row>
                    <ion-col>
                      <ion-button
                        color='danger'
                        fill='outline'
                        expand='block'
                        onClick={() => this.deleteDs()}
                      >
                        <ion-icon name='trash' slot='start'></ion-icon>
                        <ion-label>
                          {TranslationService.getTransl("delete", "Delete")}
                        </ion-label>
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button
                        color='secondary'
                        fill='outline'
                        expand='block'
                        onClick={() => this.duplicateDatasheet(true)}
                      >
                        <ion-icon name='copy' slot='start'></ion-icon>
                        <ion-label>
                          {TranslationService.getTransl("revision", "Revision")}
                        </ion-label>
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button
                        color='tertiary'
                        fill='outline'
                        expand='block'
                        onClick={() => this.duplicateDatasheet(false)}
                      >
                        <ion-icon name='duplicate' slot='start'></ion-icon>
                        <ion-label>
                          {TranslationService.getTransl("copy", "Copy")}
                        </ion-label>
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
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
                      <small>{TranslationService.getTransl("to", "To")}</small>
                    </ion-col>
                    <ion-col size='1' class='centered'>
                      <small>
                        {TranslationService.getTransl("show", "Show")}
                      </small>
                    </ion-col>
                  </ion-row>
                  {this.datasheet.orderPropertiesForExport().map((property) => (
                    <ion-row>
                      <ion-col size='2'>
                        <app-item-detail
                          lines='none'
                          detailText={
                            DatasheetsService.getDatasheetPropertyTypes(
                              property.type
                            )[0].typeName
                          }
                        ></app-item-detail>
                      </ion-col>
                      <ion-col size='2'>
                        <app-item-detail
                          lines='none'
                          detailText={
                            DatasheetsService.getDatasheetPropertyNames(
                              "id",
                              property.name
                            )[0].nameName
                          }
                        ></app-item-detail>
                      </ion-col>
                      {property.type === "general" ? (
                        <ion-col size='7'>
                          <app-item-detail
                            lines='none'
                            detailText={property.prefix}
                          ></app-item-detail>
                        </ion-col>
                      ) : (
                        [
                          <ion-col size='1' class='centered'>
                            <app-item-detail
                              lines='none'
                              detailText={
                                toNumber(property.typical) != 0
                                  ? toNumber(property.typical).toFixed(
                                      DatasheetsService.getDatasheetPropertyNames(
                                        "id",
                                        property.name
                                      )[0].decimals
                                    )
                                  : null
                              }
                            ></app-item-detail>
                          </ion-col>,
                          <ion-col size='2'>
                            <app-item-detail
                              lines='none'
                              detailText={property.prefix}
                            ></app-item-detail>
                          </ion-col>,
                          <ion-col size='2' class='centered'>
                            <app-item-detail
                              lines='none'
                              detailText={
                                toNumber(property.lower) != 0
                                  ? toNumber(property.lower).toFixed(
                                      DatasheetsService.getDatasheetPropertyNames(
                                        "id",
                                        property.name
                                      )[0].decimals
                                    )
                                  : null
                              }
                            ></app-item-detail>
                          </ion-col>,
                          <ion-col size='2' class='centered'>
                            <app-item-detail
                              lines='none'
                              detailText={
                                toNumber(property.higher) != 0
                                  ? toNumber(property.higher).toFixed(
                                      DatasheetsService.getDatasheetPropertyNames(
                                        "id",
                                        property.name
                                      )[0].decimals
                                    )
                                  : null
                              }
                            ></app-item-detail>
                          </ion-col>,
                        ]
                      )}
                      <ion-col size='1' class='centered showbool'>
                        <app-item-detail
                          lines='none'
                          detailText={property.show}
                        ></app-item-detail>
                      </ion-col>
                    </ion-row>
                  ))}
                </ion-grid>
              </div>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <ion-list>
                <app-item-detail
                  lines='none'
                  label-tag='producer'
                  label-text='Producer'
                  detailText={this.datasheet.producerName}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='producer-ref-quality'
                  label-text='Producer Reference Quality'
                  detailText={this.datasheet.producerReferenceQuality}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='competitor-ref-quality'
                  label-text='Competitor Reference Quality'
                  detailText={this.datasheet.competitorReferenceQuality}
                ></app-item-detail>
              </ion-list>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>
              <ion-list>
                <app-item-detail
                  lines='none'
                  label-tag='comments'
                  label-text='Comments'
                  detailText={this.datasheet.comments}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  label-tag='performance-comments'
                  label-text='Performance Comments'
                  detailText={this.datasheet.performanceComments}
                ></app-item-detail>
              </ion-list>
            </swiper-slide>
            <swiper-slide class='swiper-slide'>FILES - TO BE DONE</swiper-slide>
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
