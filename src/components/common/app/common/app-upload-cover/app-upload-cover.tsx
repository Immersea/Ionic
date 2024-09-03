import { Component, State, h, Prop, Event, EventEmitter } from "@stencil/core";
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
import { RouterService } from "../../../../../services/common/router";
import { SYSTEMCOLLECTION } from "../../../../../services/common/system";
import { StorageService } from "../../../../../services/common/storage";
import {
  DIVECOMMUNITIESCOLLECTION,
  DiveCommunitiesService,
} from "../../../../../services/udive/diveCommunities";
import { CUSTOMERSCOLLECTION } from "../../../../../services/trasteel/crm/customers";

@Component({
  tag: "app-upload-cover",
  styleUrl: "app-upload-cover.scss",
})
export class AppUploadCover {
  @State() uploading = false;
  @Event() coverUploaded: EventEmitter;

  @Prop() item: {
    collection: string;
    id: string;
    photoURL: string;
    coverURL: string;
  };

  @Prop() showPhotoURL = true;

  @State() addressText: string;

  componentWillLoad() {}

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
            if (update !== null) {
              if (type == "photo") {
                this.item.photoURL = update;
              } else {
                this.item.coverURL = update;
              }
            }
            this.coverUploaded.emit({ type: type, url: update });
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
          SYSTEMCOLLECTION,
          type,
          this.item.id,
          blob
        );
      case CUSTOMERSCOLLECTION:
        return await StorageService.updatePhotoURL(
          CUSTOMERSCOLLECTION,
          type,
          this.item.id,
          blob
        );
    }
  }

  render() {
    return [
      this.uploading ? <ion-progress-bar type='indeterminate' /> : undefined,
      this.item
        ? [
            <div
              class='cover'
              style={
                this.item.coverURL
                  ? {
                      backgroundImage: "url(" + this.item.coverURL + ")",
                    }
                  : undefined
              }
            >
              <ion-button
                fill='clear'
                icon-only
                onClick={() => this.updatePhotoURL("cover")}
                disabled={!this.item.id}
              >
                <ion-icon name='camera' color='light' />
              </ion-button>
            </div>,
            !this.item.id ? (
              <div class='save-item'>
                <my-transl
                  tag='save-item-error'
                  text='Please save the item to upload pictures'
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
                      : "assets/images/avatar.png"
                  }
                />
                <ion-button
                  fill='clear'
                  icon-only
                  onClick={() => this.updatePhotoURL("photo")}
                  disabled={!this.item.id}
                >
                  <ion-icon name='camera' color='light' />
                </ion-button>
              </ion-thumbnail>
            ) : undefined,
          ]
        : undefined,
    ];
  }
}
