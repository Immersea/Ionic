import {Component, h, Host, Prop, State, Element} from "@stencil/core";
import {TranslationService} from "../../../../services/common/translations";
import {alertController, modalController} from "@ionic/core";
import {DiveConfiguration} from "../../../../interfaces/udive/planner/dive-configuration";
import {Subscription} from "rxjs";
import {UserService} from "../../../../services/common/user";
import {UserProfile} from "../../../../interfaces/common/user/user-profile";
import {UserSettings} from "../../../../interfaces/udive/user/user-settings";
import {mapHeight} from "../../../../helpers/utils";
import {ImmerseaLocation} from "../../../../interfaces/immersea/immerseaLocation";
import {
  IMMERSEALOCATIONSCOLLECTION,
  ImmerseaLocationsService,
} from "../../../../services/immersea/immerseaLocations";
import {RouterService} from "../../../../services/common/router";
import {Media} from "../../../../interfaces/common/media/media";
import Swiper from "swiper";
import {MapService} from "../../../../services/common/map";
import {cloneDeep, each, isNumber, isString, orderBy, toNumber} from "lodash";
import {Environment} from "../../../../global/env";

@Component({
  tag: "modal-immersea-location-update",
  styleUrl: "modal-immersea-location-update.scss",
})
export class ModalImmerseaLocationUpdate {
  @Element() el: HTMLElement;
  @Prop() locationId: string = undefined;
  @State() immerseaLocation: ImmerseaLocation;
  @State() segment = "information";
  @State() updateView = true;
  @State() validLocation = false;
  @State() mediaArray: {
    video: Media[];
    photo: Media[];
    documents: Media[];
  } = {
    video: [],
    photo: [],
    documents: [],
  };

  segmentTitles: {
    map: string;
    position: string;
    information: string;
    article: string;
    team: string;
    gallery: string;
  };
  @State() slider: Swiper;
  draggableMarkerPosition: any;
  stdConfigurations: DiveConfiguration[] = [];
  userProfile: UserProfile;
  userProfileSub$: Subscription;
  userSettings: UserSettings;
  userSettingsSub$: Subscription;
  mapElement: HTMLAppMapElement;

  mediaToUpload: {[id: string]: {media: Media; file: File}} = {};

  async componentWillLoad() {
    this.userProfileSub$ = UserService.userProfile$.subscribe(
      (userProfile: UserProfile) => {
        this.userProfile = new UserProfile(userProfile);
      }
    );
    this.userSettingsSub$ = UserService.userSettings$.subscribe(
      (userSettings: UserSettings) => {
        this.userSettings = new UserSettings(userSettings);
        this.stdConfigurations = cloneDeep(
          this.userSettings.userConfigurations
        );
      }
    );
    this.segmentTitles = {
      information: TranslationService.getTransl("information", "Information"),
      article: TranslationService.getTransl("article", "Article"),
      gallery: TranslationService.getTransl("gallery", "Gallery"),
      map: TranslationService.getTransl("map", "Map"),
      position: TranslationService.getTransl("position", "Position"),
      team: TranslationService.getTransl("team", "Team"),
    };
    await this.loadImmerseaLocation();
  }

  async loadImmerseaLocation() {
    if (this.locationId) {
      this.immerseaLocation = await ImmerseaLocationsService.getLocation(
        this.locationId
      );
      this.draggableMarkerPosition = {
        lat: this.immerseaLocation.position.geopoint.latitude,
        lon: this.immerseaLocation.position.geopoint.longitude,
      };
    } else {
      this.immerseaLocation = new ImmerseaLocation();
      this.immerseaLocation.users = {
        [UserService.userRoles.uid]: ["owner"],
      };
      this.draggableMarkerPosition = {};
    }
  }

  orderMedia() {
    const documents = [];
    const photo = [];
    const video = [];
    Object.keys(this.immerseaLocation.media).map((id) => {
      const media = this.immerseaLocation.media[id];
      if (media.type.includes("application")) {
        documents.push(media);
      } else if (media.type.includes("video")) {
        video.push(media);
      } else if (media.type.includes("image")) {
        photo.push(media);
      }
    });
    this.mediaArray.documents = orderBy(documents, "order");
    this.mediaArray.video = orderBy(video, "order");
    this.mediaArray.photo = orderBy(photo, "order");
  }

  async componentDidLoad() {
    this.slider = new Swiper(".slider-dive-site", {
      speed: 400,
      spaceBetween: 100,
      allowTouchMove: false,
      autoHeight: true,
      on: {
        slideChange: () => {
          this.slider ? this.slider.updateAutoHeight() : null;
          this.slider.updateSize();
        },
      },
    });
    this.setSelectOptions();
    //reset map height inside slide
    await customElements.whenDefined("app-map");
    this.mapElement = this.el.querySelector("#map") as any;
    const mapContainer = this.el.querySelector("#map-container");
    mapContainer.setAttribute(
      "style",
      "height: " + mapHeight(this.immerseaLocation, true) + "px"
    ); //-cover photo - slider - footer
    this.mapElement["mapLoaded"]().then(() => {
      this.mapElement.triggerMapResize();
    });
    this.mapElement.triggerMapResize();
    this.validateLocation();
  }

  disconnectedCallback() {
    this.userProfileSub$.unsubscribe();
    this.userSettingsSub$.unsubscribe();
  }

  setSelectOptions() {
    const selectSectionsElement: HTMLIonSelectElement =
      this.el.querySelector("#sections-select");
    const customSectionsPopoverOptions = {
      header: TranslationService.getTransl("sections", "Sections"),
    };
    selectSectionsElement.interfaceOptions = customSectionsPopoverOptions;
    selectSectionsElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(ImmerseaLocationsService.getSections(), async (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.tag;
      selectOption.textContent = await TranslationService.getTransl(
        val.tag,
        val.text
      );
      selectSectionsElement.appendChild(selectOption);
    });

    const selectTopicsElement: HTMLIonSelectElement =
      this.el.querySelector("#topics-select");
    const customTopicsPopoverOptions = {
      header: TranslationService.getTransl("topics", "Topics"),
    };
    selectTopicsElement.interfaceOptions = customTopicsPopoverOptions;
    selectTopicsElement.placeholder = TranslationService.getTransl(
      "select",
      "Select"
    );
    each(ImmerseaLocationsService.getTopics(), async (val) => {
      const selectOption = document.createElement("ion-select-option");
      selectOption.value = val.tag;
      selectOption.textContent = await TranslationService.getTransl(
        val.tag,
        val.text
      );
      selectTopicsElement.appendChild(selectOption);
    });
  }

  updateLocation(ev) {
    this.draggableMarkerPosition = {
      lat: toNumber(ev.detail.lat),
      lon: toNumber(ev.detail.lon),
    };
    this.immerseaLocation.position = MapService.getPosition(
      ev.detail.lat,
      ev.detail.lon
    );
    this.validateLocation();
  }

  updateAddress(ev) {
    this.immerseaLocation.setAddress(ev.detail);
  }

  handleChange(ev) {
    this.immerseaLocation[ev.detail.name] = ev.detail.value;
    this.validateLocation();
  }

  updateParam(param, ev) {
    let value = ev.detail.value;
    switch (param) {
      case "sections":
        this.immerseaLocation.sections = value;
        break;
      case "topics":
        this.immerseaLocation.topics = value;
        break;
    }
    this.validateLocation();
  }

  segmentChanged(ev) {
    if (ev.detail.value) {
      this.segment = ev.detail.value;
      this.slider.update();
      switch (this.segment) {
        case "information":
          this.slider.slideTo(0);
          break;
        case "article":
          this.slider.slideTo(1);
          break;
        case "gallery":
          this.slider.slideTo(2);
          break;
        case "map":
          this.slider.slideTo(3);
          this.mapElement.triggerMapResize();
          break;
        case "position":
          this.slider.slideTo(4);
          break;
        case "team":
          this.slider.slideTo(5);
          break;
        default:
          break;
      }
    }
  }

  async slideChanged() {
    const index = this.slider.activeIndex;
    this.slider.update();
    switch (index) {
      case 0:
        this.segment = "information";
        break;
      case 1:
        this.segment = "article";
        break;
      case 2:
        this.segment = "gallery";
        break;
      case 3:
        this.segment = "map";
        this.mapElement.triggerMapResize();
        break;
      case 4:
        this.segment = "position";
        break;
      case 5:
        this.segment = "team";
        break;
      default:
        break;
    }
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.immerseaLocation.photoURL = url;
    } else {
      this.immerseaLocation.coverURL = url;
    }
  }

  async addMedia() {
    if (this.locationId) {
      const popover = await RouterService.openPopover("popover-media-loading");
      popover.onDidDismiss().then((ev) => {
        if (ev && ev.data) {
          this.immerseaLocation.media[ev.data.media.id] = ev.data.media;
          this.mediaToUpload[ev.data.media.id] = ev.data;
        }
      });
    } else {
      const alert = await alertController.create({
        header: TranslationService.getTransl("media", "Media"),
        message: TranslationService.getTransl(
          "media-loader-error",
          "Please save the item to upload new media."
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
          },
        ],
      });
      alert.present();
    }
  }

  async openEditor() {
    const modal = await RouterService.openModal("modal-quill-editor", {
      immerseaLocation: this.immerseaLocation,
    });
    modal.onDidDismiss().then(async (data: any) => {
      if (data && data.data) {
        this.immerseaLocation.article = data.data;
        this.updateView = !this.updateView;
      }
    });
  }

  updatePublic(ev) {
    this.immerseaLocation.public = ev.detail.checked;
    this.validateLocation();
  }

  validateLocation() {
    this.validLocation =
      this.immerseaLocation &&
      this.immerseaLocation.position &&
      isNumber(this.immerseaLocation.position.geopoint.latitude) &&
      isNumber(this.immerseaLocation.position.geopoint.longitude) &&
      this.immerseaLocation.sections.length > 0 &&
      this.immerseaLocation.topics.length > 0 &&
      isString(this.immerseaLocation.region) &&
      isString(this.immerseaLocation.displayName);
  }

  async save() {
    //upload media
    if (Object.keys(this.mediaToUpload).length > 0) {
      const popover = await RouterService.openPopover(
        "popover-media-uploader",
        {
          files: this.mediaToUpload,
          itemId: this.locationId,
          collectionId: IMMERSEALOCATIONSCOLLECTION,
        }
      );
      popover.onDidDismiss().then((ev) => {
        if (ev && ev.data) {
          const urls = ev.data;
          //update urls into media
          Object.keys(urls).forEach((id) => {
            this.immerseaLocation.media[id].url = urls[id];
          });
          //save location
          return this.saveLocation();
        }
      });
    } else {
      return this.saveLocation();
    }
  }

  async saveLocation() {
    await ImmerseaLocationsService.updateLocation(
      this.locationId,
      this.immerseaLocation,
      this.userProfile.uid
    );
    return modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return (
      <Host>
        <ion-header>
          <app-upload-cover
            item={{
              collection: IMMERSEALOCATIONSCOLLECTION,
              id: this.locationId,
              photoURL: this.immerseaLocation.photoURL,
              coverURL: this.immerseaLocation.coverURL,
            }}
            onCoverUploaded={(ev) => this.updateImageUrls(ev)}
          ></app-upload-cover>
        </ion-header>
        <ion-header>
          <ion-toolbar>
            <ion-segment
              mode="md"
              color={Environment.getAppColor()}
              scrollable
              onIonChange={(ev) => this.segmentChanged(ev)}
              value={this.segment}
            >
              <ion-segment-button value="information" layout="icon-start">
                <ion-label>{this.segmentTitles.information}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="article" layout="icon-start">
                <ion-label>{this.segmentTitles.article}</ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="gallery"
                layout="icon-start"
                disabled={!this.locationId}
              >
                <ion-label>{this.segmentTitles.gallery}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="map" layout="icon-start">
                <ion-label>{this.segmentTitles.map}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="position" layout="icon-start">
                <ion-label>{this.segmentTitles.position}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="team" layout="icon-start">
                <ion-label>{this.segmentTitles.team}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </ion-toolbar>
        </ion-header>
        <ion-content class="slides">
          <swiper-container class="slider-dive-site swiper">
            <swiper-wrapper class="swiper-wrapper">
              {/* INFORMATION */}
              <swiper-slide class="swiper-slide">
                <ion-list class="ion-no-padding">
                  <ion-item>
                    <ion-label>
                      <my-transl tag="public" text="Public" />
                    </ion-label>
                    <ion-toggle
                      slot="end"
                      onIonChange={(ev) => this.updatePublic(ev)}
                      checked={this.immerseaLocation.public}
                    ></ion-toggle>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <my-transl tag="sections" text="Sections" />
                      <sup>*</sup>
                    </ion-label>
                    <ion-select
                      id="sections-select"
                      onIonChange={(ev) => this.updateParam("sections", ev)}
                      value={this.immerseaLocation.sections}
                      multiple={true}
                    ></ion-select>
                  </ion-item>
                  <ion-item>
                    <ion-label>
                      <my-transl tag="topics" text="Topics" />
                      <sup>*</sup>
                    </ion-label>
                    <ion-select
                      id="topics-select"
                      onIonChange={(ev) => this.updateParam("topics", ev)}
                      value={this.immerseaLocation.topics}
                      multiple={true}
                    ></ion-select>
                  </ion-item>
                  <app-form-item
                    label-tag="region"
                    label-text="Region"
                    value={this.immerseaLocation.region}
                    placeholder={"Sicilia Tirrenica, Sicilia Ionica, etc..."}
                    name="region"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="area"
                    label-text="Area"
                    value={this.immerseaLocation.area}
                    placeholder={"Capo San Vito, Palermo, etc..."}
                    name="area"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={[]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="name"
                    label-text="Name"
                    value={this.immerseaLocation.displayName}
                    name="displayName"
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                  <app-form-item
                    label-tag="short-description"
                    label-text="Short Description"
                    value={this.immerseaLocation.shortDescription}
                    name="shortDescription"
                    multiLanguage
                    textRows={5}
                    input-type="text"
                    onFormItemChanged={(ev) => this.handleChange(ev)}
                    validator={["required"]}
                  ></app-form-item>
                </ion-list>
              </swiper-slide>
              {/** ARTICLE */}
              <swiper-slide class="swiper-slide">
                <modal-quill-editor
                  immerseaLocation={this.immerseaLocation}
                  updateView={this.updateView}
                  readOnly={true}
                  onEdit={() => this.openEditor()}
                ></modal-quill-editor>
              </swiper-slide>
              {/** GALLERY */}
              <swiper-slide class="swiper-slide">
                <ion-list>
                  <ion-item button onClick={() => this.addMedia()}>
                    <ion-icon slot="start" name="add"></ion-icon>
                    <ion-label>Aggiungi</ion-label>
                  </ion-item>
                  {Object.keys(this.mediaToUpload).length > 0
                    ? [
                        <ion-list-header>File da caricare</ion-list-header>,
                        Object.keys(this.mediaToUpload).map((id) => (
                          <ion-item>
                            <ion-label>
                              {this.mediaToUpload[id].media.title}
                            </ion-label>
                          </ion-item>
                        )),
                      ]
                    : undefined}
                  <ion-list-header>Photo</ion-list-header>
                  {this.mediaArray.photo.length > 0 ? (
                    this.mediaArray.photo.map((photo) => (
                      <ion-item>
                        <ion-label>{photo.title}</ion-label>
                      </ion-item>
                    ))
                  ) : (
                    <ion-item>
                      <ion-label>Nessuna foto caricata</ion-label>
                    </ion-item>
                  )}

                  <ion-list-header>Video</ion-list-header>
                  {this.mediaArray.video.length > 0 ? (
                    this.mediaArray.video.map((video) => (
                      <ion-item>
                        <ion-label>{video.title}</ion-label>
                      </ion-item>
                    ))
                  ) : (
                    <ion-item>
                      <ion-label>Nessun video caricato</ion-label>
                    </ion-item>
                  )}
                  <ion-list-header>Documenti</ion-list-header>
                  {this.mediaArray.documents.length > 0 ? (
                    this.mediaArray.documents.map((document) => (
                      <ion-item>
                        <ion-label>{document.title}</ion-label>
                      </ion-item>
                    ))
                  ) : (
                    <ion-item>
                      <ion-label>Nessun documento caricato</ion-label>
                    </ion-item>
                  )}
                </ion-list>
              </swiper-slide>
              {/** MAP */}
              <swiper-slide class="swiper-slide">
                <div id="map-container">
                  <app-map
                    id="map"
                    pageId="dive-sites"
                    draggableMarkerPosition={this.draggableMarkerPosition}
                    onDragMarkerEnd={(ev) => this.updateLocation(ev)}
                  ></app-map>
                </div>
              </swiper-slide>
              {/** COORDINATES */}
              <swiper-slide class="swiper-slide">
                <app-coordinates
                  coordinates={this.draggableMarkerPosition}
                  onCoordinatesEmit={(ev) => this.updateLocation(ev)}
                  onAddressEmit={(ev) => this.updateAddress(ev)}
                ></app-coordinates>
              </swiper-slide>
              {/** TEAM */}
              <swiper-slide class="swiper-slide">
                <app-users-list
                  item={this.immerseaLocation}
                  editable
                  show={["owner", "editor"]}
                />
              </swiper-slide>
            </swiper-wrapper>
          </swiper-container>
        </ion-content>
        <app-modal-footer
          disableSave={!this.validLocation}
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      </Host>
    );
  }
}
