import { Component, Prop, State, h } from "@stencil/core";
import {
  Shape,
  ShapeType,
} from "../../../../../interfaces/trasteel/refractories/shapes";
import { ShapesService } from "../../../../../services/trasteel/refractories/shapes";
import { SystemService } from "../../../../../services/common/system";
import { TrasteelService } from "../../../../../services/trasteel/common/services";
import Swiper from "swiper";
import { Environment } from "../../../../../global/env";
import { TranslationService } from "../../../../../services/common/translations";
import { RouterService } from "../../../../../services/common/router";

@Component({
  tag: "page-shape-details",
  styleUrl: "page-shape-details.scss",
})
export class PageShapeDetails {
  @Prop() itemId: string;
  @State() shape: Shape;
  @State() shapeTypes: ShapeType[];
  @State() updateView = true;

  titles = [
    { tag: "information", text: "Information" },
    { tag: "drawing", text: "Drawing", disabled: false },
  ];
  @State() slider: Swiper;

  async componentWillLoad() {
    if (this.itemId) {
      await this.loadShape();
    } else {
      SystemService.dismissLoading();
      SystemService.presentAlertError("No Item Id");
      RouterService.goBack();
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-detail-shapes", {
      speed: 400,
      spaceBetween: 0,
      allowTouchMove: false,
      autoHeight: true,
      slidesPerView: 1,
      breakpoints: {
        // When window width is >= 768px
        768: {
          slidesPerView: 1,
        },
        // When window width is >= 992px
        992: {
          slidesPerView: 2,
        },
      },
    });
  }

  async loadShape() {
    try {
      this.shape = await ShapesService.getShape(this.itemId);
      this.shapeTypes = await ShapesService.getShapeTypes();
      this.checkDwg();
    } catch (error) {
      SystemService.dismissLoading();
      SystemService.presentAlertError(error);
      RouterService.goBack();
    }
    SystemService.dismissLoading();
  }

  async checkDwg() {
    if (!this.shape.dwg) {
      //find dwg
      const shapeType = this.shapeTypes.find(
        (x) => x.typeId == this.shape.shapeTypeId
      );
      if (shapeType) {
        this.shape.dwg = shapeType.dwg;
      }
      if (!this.shape.dwg) {
        this.titles[1].disabled = true;
        this.updateView = !this.updateView;
      }
    }
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async editShape() {
    const modal = await ShapesService.presentShapeUpdate(this.itemId);
    //update customer data after modal dismiss
    modal.onDidDismiss().then(() => this.loadShape());
  }

  deleteShape() {
    ShapesService.deleteShape(this.itemId);
    RouterService.goBack();
  }

  duplicateShape() {
    ShapesService.duplicateShape(this.itemId);
    RouterService.goBack();
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          text={this.shape.shapeName}
          color='trasteel'
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
          rightButtonFc={() => this.editShape()}
        ></app-navbar>
      </ion-header>,
      <app-header-segment-toolbar
        color={Environment.getAppColor()}
        swiper={this.slider}
        titles={this.titles}
      ></app-header-segment-toolbar>,
      <ion-content class='slides'>
        <swiper-container class='slider-detail-shapes swiper'>
          <swiper-wrapper class='swiper-wrapper'>
            <swiper-slide class='swiper-slide'>
              <ion-list class='ion-no-padding'>
                <app-item-detail
                  lines='none'
                  labelTag='shape_type'
                  labelText='Shape Type'
                  detailText={
                    ShapesService.getShapeTypeName(this.shape.shapeTypeId)["en"]
                  }
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelTag='name'
                  labelText='Name'
                  detailText={this.shape.shapeName}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelTag='shortName'
                  labelText='Short Name'
                  detailText={this.shape.shapeShortName}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='H'
                  detailText={this.shape.H}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='H1'
                  detailText={this.shape.H1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='H2'
                  detailText={this.shape.H2}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='L'
                  detailText={this.shape.L}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='L1'
                  detailText={this.shape.L1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='La'
                  detailText={this.shape.La}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='Lb'
                  detailText={this.shape.Lb}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='A'
                  detailText={this.shape.A}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='A1'
                  detailText={this.shape.A1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='B'
                  detailText={this.shape.B}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='B1'
                  detailText={this.shape.B1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='ANG'
                  detailText={this.shape.ANG}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='ANG1'
                  detailText={this.shape.ANG1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='D'
                  detailText={this.shape.D}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='D1'
                  detailText={this.shape.D1}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='D2'
                  detailText={this.shape.D2}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='D3'
                  detailText={this.shape.D3}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='D4'
                  detailText={this.shape.D4}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='De'
                  detailText={this.shape.De}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='Di'
                  detailText={this.shape.Di}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='N'
                  detailText={this.shape.N}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='Radius'
                  appendText={this.shape.radius_max > 0 ? " MIN" : null}
                  detailText={this.shape.radius}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='Radius'
                  appendText=' MAX'
                  detailText={this.shape.radius_max}
                ></app-item-detail>
                <app-item-detail
                  lines='none'
                  labelText='Volume'
                  detailText={this.shape.volume}
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
                        onClick={() => this.deleteShape()}
                      >
                        <ion-icon name='trash' slot='start'></ion-icon>
                        <ion-label>
                          {TranslationService.getTransl("delete", "Delete")}
                        </ion-label>
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button
                        color='tertiary'
                        fill='outline'
                        expand='block'
                        onClick={() => this.duplicateShape()}
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
            {this.shape.dwg ? (
              <swiper-slide class='swiper-slide'>
                <app-banner
                  heightPx={500}
                  backgroundCoverFill={false}
                  link={this.shape.dwg ? this.shape.dwg.url : null}
                ></app-banner>
              </swiper-slide>
            ) : undefined}
          </swiper-wrapper>
        </swiper-container>
      </ion-content>,
    ];
  }
}
