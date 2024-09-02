import {Component, State, h, Prop, Event, EventEmitter} from "@stencil/core";
import {
  UserService,
  USERPROFILECOLLECTION,
} from "../../../../../services/common/user";
import {
  DiveSitesService,
  DIVESITESCOLLECTION,
} from "../../../../../services/udive/diveSites";
import {
  DivingCentersService,
  DIVECENTERSSCOLLECTION,
} from "../../../../../services/udive/divingCenters";
import {
  DivingSchoolsService,
  DIVESCHOOLSSCOLLECTION,
} from "../../../../../services/udive/divingSchools";
import {
  ServiceCentersService,
  SERVICECENTERSCOLLECTION,
} from "../../../../../services/udive/serviceCenters";
import {RouterService} from "../../../../../services/common/router";
import {SYSTEMCOLLECTION} from "../../../../../services/common/system";
import {StorageService} from "../../../../../services/common/storage";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";

@Component({
  tag: "app-upload-covers",
  styleUrl: "app-upload-covers.scss",
})
export class AppUploadCovers {
  @State() uploading = false;
  @Event() coverUploaded: EventEmitter;

  @Prop() item: {
    collection: string;
    id: string;
    photoURL: string;
    coverURL: string | {[coverId: string]: string};
  };

  @Prop() showPhotoURL = true;

  @State() photoURL: string;
  @State() coverURL: string | {[coverId: string]: string};

  @State() addressText: string;

  componentWillLoad() {
    if (this.item) {
      this.photoURL = this.item.photoURL;
      this.coverURL = this.item.coverURL;
    }
  }

  async updatePhotoURL(type: string) {
    var options = null;
    if (type == "photo") {
      options = {
        aspectRatio: 1,
        maxDimensions: 300,
        round: true,
      };
    } else {
      options = {
        aspectRatio: 16 / 6,
        maxDimensions: 2000,
        round: false,
      };
    }

    const uploadModal = await RouterService.openModal(
      "modal-upload-image",
      options
    );
    uploadModal.onDidDismiss().then(async (canvasImg: any) => {
      if (canvasImg && canvasImg.data) {
        this.uploading = true;
        canvasImg.data.toBlob(
          async (blob) => {
            const update = await this.uploadImage(blob, type);
            if (update) {
              if (type == "photo") {
                this.photoURL = update;
                this.item.photoURL = this.photoURL;
              } else {
                this.coverURL = update;
                this.item.coverURL = this.coverURL;
              }
            }
            this.coverUploaded.emit({type: type, url: update});
            this.uploading = false;
          },
          "image/jpeg",
          50 //jpeg quality
        );
      }
    });
    await uploadModal.present();
  }

  async uploadImage(blob, type) {
    switch (this.item.collection) {
      case USERPROFILECOLLECTION:
        return await UserService.updatePhotoURL(type, this.item.id, blob);
      case DIVESITESCOLLECTION:
        return await DiveSitesService.updatePhotoURL(type, this.item.id, blob);
      case DIVECENTERSSCOLLECTION:
        return await DivingCentersService.updatePhotoURL(
          type,
          this.item.id,
          blob
        );
      case DIVECOMMUNITIESCOLLECTION:
        return await DiveCommunitiesService.updatePhotoURL(
          type,
          this.item.id,
          blob
        );
      case DIVESCHOOLSSCOLLECTION:
        return await DivingSchoolsService.updatePhotoURL(
          type,
          this.item.id,
          blob
        );
      case SERVICECENTERSCOLLECTION:
        return await ServiceCentersService.updatePhotoURL(
          type,
          this.item.id,
          blob
        );
      case SYSTEMCOLLECTION:
        return await StorageService.updatePhotoURL(
          SERVICECENTERSCOLLECTION,
          type,
          this.item.id,
          blob
        );
    }
  }

  render() {
    return [
      this.uploading ? <ion-progress-bar type="indeterminate" /> : undefined,
      this.item
        ? [
            <div
              class="cover"
              style={
                this.item.coverURL
                  ? {
                      backgroundImage: "url(" + this.item.coverURL + ")",
                    }
                  : undefined
              }
            >
              <ion-button
                fill="clear"
                icon-only
                onClick={() => this.updatePhotoURL("cover")}
                disabled={!this.item.id}
              >
                <ion-icon name="camera" color="light" />
              </ion-button>
            </div>,
            !this.item.id ? (
              <div class="save-item">
                <my-transl
                  tag="save-item-error"
                  text="Please save the item to upload pictures"
                  isLabel
                />
              </div>
            ) : undefined,
            this.showPhotoURL ? (
              <ion-thumbnail>
                <img
                  src={
                    this.item.photoURL
                      ? this.item.photoURL
                      : "./assets/images/avatar.png"
                  }
                />
                <ion-button
                  fill="clear"
                  icon-only
                  onClick={() => this.updatePhotoURL("photo")}
                  disabled={!this.item.id}
                >
                  <ion-icon name="camera" color="light" />
                </ion-button>
              </ion-thumbnail>
            ) : undefined,
          ]
        : undefined,
    ];
  }
}
