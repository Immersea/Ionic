import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {modalController} from "@ionic/core";
import {isNumber, isString} from "lodash";
import {Subscription} from "rxjs";
import Swiper from "swiper";
import {UserProfile} from "../../../../interfaces/common/user/user-profile";
import {UserService} from "../../../../services/common/user";
import {TranslationService} from "../../../../services/common/translations";
import {
  Shape,
  ShapeType,
} from "../../../../interfaces/trasteel/refractories/shapes";
import {
  SHAPESCOLLECTION,
  ShapesService,
} from "../../../../services/trasteel/refractories/shapes";
import {RouterService} from "../../../../services/common/router";
import {Media} from "../../../../interfaces/common/media/media";
import {Environment} from "../../../../global/env";
import {SystemService} from "../../../../services/common/system";

@Component({
  tag: "modal-shape-update",
  styleUrl: "modal-shape-update.scss",
})
export class ModalShapeUpdate {
  @Element() el: HTMLElement;
  @Prop({mutable: true}) shapeId: string = undefined;
  @Prop() duplicateShape: {id: string; shape: Shape} = undefined;
  @State() shape: Shape;
  @State() updateView = true;
  @State() scrollTop = 0;
  @State() shapeTypes: ShapeType[];

  validShape = false;
  titles = [
    {tag: "information", text: "Information", disabled: false},
    {tag: "drawing", text: "Drawing", disabled: false},
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
    await this.loadShape();
  }

  async loadShape() {
    this.shapeTypes = await ShapesService.getShapeTypes();
    if (this.shapeId) {
      const res = await ShapesService.getShape(this.shapeId);
      this.shape = res;
    } else {
      this.shape = new Shape(
        this.duplicateShape ? this.duplicateShape.shape : null
      );
      if (this.duplicateShape) {
        this.shape.shapeName = "NEW - " + this.duplicateShape.shape.shapeName;
      }
      this.shape.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
    }
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-edit-shape", {
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
    if (this.shape.shapeName) this.validateShape();
    this.updateSlider();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
  }

  handleChange(ev) {
    const n = ev.detail.name;
    const v = ev.detail.value;
    this.shape[n] = v;
    //update volume
    if (
      (n == "A" || n == "B" || n == "H" || n == "L") &&
      this.shape.A > 0 &&
      this.shape.B > 0 &&
      this.shape.H > 0 &&
      this.shape.L > 0
    ) {
      this.shape.volume = this.shape.getVolume();
      this.shape.radius = this.shape.getInternalRadius();
    }
    this.validateShape();
  }

  validateShape() {
    this.validShape =
      isString(this.shape.shapeTypeId) &&
      isString(this.shape.shapeName) &&
      isNumber(this.shape.A) &&
      isNumber(this.shape.B) &&
      isNumber(this.shape.H) &&
      isNumber(this.shape.L) &&
      this.shape.A > 0 &&
      this.shape.B > 0 &&
      this.shape.H > 0 &&
      this.shape.L > 0;
    this.updateSlider();
  }

  async selectType(ev) {
    this.shape.shapeTypeId = ev.detail.value;
    await ShapesService.setDwgForShape(this.shape);
    this.validateShape();
  }

  updateSlider() {
    this.updateView = !this.updateView;
    //wait for view to update and then reset slider height
    setTimeout(() => {
      this.slider ? this.slider.update() : undefined;
    }, 100);
  }

  async editDrawing() {
    if (!this.shape.dwg) {
      this.shape.dwg = new Media();
    }
    this.shape.dwg.id = this.shapeId;
    this.shape.dwg.name = this.shape.shapeName;
    const popover = await RouterService.openPopover("popover-media-loading", {
      media: this.shape.dwg,
    });
    popover.onDidDismiss().then(async (ev) => {
      if (ev && ev.data) {
        const mediaToUpload = {
          [ev.data.media.id]: ev.data,
        };
        const mediaToStore = ev.data.media;
        const popover = await RouterService.openPopover(
          "popover-media-uploader",
          {
            files: mediaToUpload,
            itemId: this.shapeId,
            collectionId: SHAPESCOLLECTION,
          }
        );
        popover.onDidDismiss().then((ev) => {
          if (ev && ev.data) {
            const urls = ev.data;
            //update urls into media
            this.shape.dwg = mediaToStore;
            Object.keys(urls).forEach((id) => {
              this.shape.dwg.url = urls[id];
            });
            this.save(false);
            this.updateSlider();
          }
        });
      }
    });
  }

  async deleteShape() {
    try {
      await ShapesService.deleteShape(this.shapeId);
      modalController.dismiss();
    } catch (error) {
      if (error) SystemService.presentAlertError(error);
    }
  }

  async save(dismiss = true) {
    const doc = await ShapesService.updateShape(
      this.shapeId,
      this.shape,
      this.userProfile.uid
    );
    if (!this.shapeId) {
      this.shapeId = doc.id;
    }
    dismiss ? modalController.dismiss() : undefined;
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
          class="slides"
          onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
        >
          <swiper-container class="slider-edit-shape swiper">
            <swiper-wrapper class="swiper-wrapper">
              <swiper-slide class="swiper-slide">
                <ion-list class="ion-no-padding">
                  {this.shapeTypes ? (
                    <app-select-search
                      color="trasteel"
                      label={{tag: "principal", text: "Principal"}}
                      labelAddText="*"
                      value={
                        this.shape && this.shape.shapeTypeId
                          ? this.shape.shapeTypeId
                          : null
                      }
                      lines="inset"
                      selectFn={(ev) => this.selectType(ev)}
                      selectOptions={this.shapeTypes}
                      selectValueId="typeId"
                      selectValueText={["typeName", "en"]}
                    ></app-select-search>
                  ) : undefined}

                  <app-form-item
                    lines="inset"
                    label-tag="name"
                    label-text="Name"
                    value={this.shape.shapeName}
                    name="shapeName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    lines="inset"
                    label-tag="shortName"
                    label-text="Short Name"
                    value={this.shape.shapeShortName}
                    name="shapeShortName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                  ></app-form-item>
                  <app-form-item
                    label-text="H"
                    value={this.shape.H}
                    appendText={" (mm)"}
                    name="H"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      "required",
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="H1"
                    value={this.shape.H1}
                    appendText={" (mm)"}
                    name="H1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="H2"
                    value={this.shape.H2}
                    appendText={" (mm)"}
                    name="H2"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="L"
                    value={this.shape.L}
                    appendText={" (mm)"}
                    name="L"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      "required",
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="L1"
                    appendText={" (mm)"}
                    value={this.shape.L1}
                    name="L1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="La"
                    appendText={" (mm)"}
                    value={this.shape.La}
                    name="La"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="Lb"
                    appendText={" (mm)"}
                    value={this.shape.Lb}
                    name="Lb"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="A"
                    appendText={" (mm)"}
                    value={this.shape.A}
                    name="A"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      "required",
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="A1"
                    appendText={" (mm)"}
                    value={this.shape.A1}
                    name="A1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="B"
                    appendText={" (mm)"}
                    value={this.shape.B}
                    name="B"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      "required",
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="B1"
                    appendText={" (mm)"}
                    value={this.shape.B1}
                    name="B1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="ANG"
                    appendText={" (°)"}
                    value={this.shape.ANG}
                    name="ANG"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="ANG1"
                    appendText={" (°)"}
                    value={this.shape.ANG1}
                    name="ANG1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="D"
                    appendText={" (mm)"}
                    value={this.shape.D}
                    name="D"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="D1"
                    appendText={" (mm)"}
                    value={this.shape.D1}
                    name="D1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="D2"
                    appendText={" (mm)"}
                    value={this.shape.D2}
                    name="D2"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="D3"
                    appendText={" (mm)"}
                    value={this.shape.D3}
                    name="D3"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="D4"
                    appendText={" (mm)"}
                    value={this.shape.D4}
                    name="D4"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="De"
                    appendText={" (mm)"}
                    value={this.shape.De}
                    name="De"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="Di"
                    appendText={" (mm)"}
                    value={this.shape.Di}
                    name="Di"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="N"
                    appendText={" (mm)"}
                    value={this.shape.N}
                    name="N"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="Decimals"
                    value={this.shape.decimals}
                    name="decimals"
                    inputStep="1"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 0},
                      },
                    ]}
                  ></app-form-item>
                  <app-form-item
                    label-text="Radius"
                    appendText={
                      (this.shape.shapeTypeId == "su-brick" ? " MIN" : "") +
                      " (mm)"
                    }
                    value={this.shape.radius}
                    name="radius"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                  {this.shape.shapeTypeId == "su-brick" ? (
                    <app-form-item
                      label-text="Radius"
                      appendText={" MAX (mm)"}
                      value={this.shape.radius_max}
                      name="radius_max"
                      input-type="number"
                      onFormItemChanged={(ev) => this.handleChange(ev)}
                      labelPosition="fixed"
                      validator={[
                        {
                          name: "minvalue",
                          options: {min: this.shape.radius},
                        },
                      ]}
                    ></app-form-item>
                  ) : undefined}
                  <app-form-item
                    label-text="Volume"
                    appendText={" (dm3)"}
                    value={this.shape.volume}
                    name="volume"
                    input-type="number"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    labelPosition="fixed"
                    validator={[
                      {
                        name: "minvalue",
                        options: {min: 1},
                      },
                    ]}
                  ></app-form-item>
                </ion-list>
                {this.shapeId ? (
                  <ion-footer class="ion-no-border">
                    <ion-toolbar>
                      <ion-button
                        expand="block"
                        fill="outline"
                        color="danger"
                        onClick={() => this.deleteShape()}
                      >
                        <ion-icon slot="start" name="trash"></ion-icon>
                        <my-transl
                          tag="delete"
                          text="Delete"
                          isLabel
                        ></my-transl>
                      </ion-button>
                    </ion-toolbar>
                  </ion-footer>
                ) : undefined}
              </swiper-slide>
              <swiper-slide class="swiper-slide">
                <app-banner
                  scrollTopValue={this.scrollTop}
                  backgroundCoverFill={false}
                  heightPx={500}
                  link={this.shape.dwg ? this.shape.dwg.url : null}
                ></app-banner>
                <ion-footer class="ion-no-border">
                  <ion-toolbar>
                    <ion-button
                      expand="block"
                      fill="outline"
                      color="trasteel"
                      disabled={!this.shapeId}
                      onClick={() => this.editDrawing()}
                    >
                      <ion-icon slot="start" name="create"></ion-icon>
                      <ion-label>
                        {!this.shapeId
                          ? TranslationService.getTransl(
                              "media-loader-error",
                              "Please save the item to upload new media."
                            )
                          : TranslationService.getTransl(
                              "edit_dwg",
                              "Edit Drawing"
                            )}
                      </ion-label>
                    </ion-button>
                  </ion-toolbar>
                </ion-footer>
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          color={Environment.getAppColor()}
          disableSave={!this.validShape}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
