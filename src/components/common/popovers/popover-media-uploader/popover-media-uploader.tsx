import {popoverController} from "@ionic/core";
import {Component, h, Listen, Prop, State} from "@stencil/core";
import {Media} from "../../../../interfaces/common/media/media";
import {Environment} from "../../../../global/env";
import {StorageService} from "../../../../services/common/storage";
import {UploadProgressData} from "../../../../interfaces/interfaces";
import {TranslationService} from "../../../../services/common/translations";

@Component({
  tag: "popover-media-uploader",
  styleUrl: "popover-media-uploader.scss",
})
export class PopoverMediaUploader {
  @Prop() files: {
    [id: string]: {
      media: Media;
      file: File;
    };
  };
  @Prop() collectionId: string;
  @Prop() itemId: string;

  inProgress: {
    [id: string]: {
      size: number;
      uploadProgress: number;
    };
  } = {};

  @State() updateView = false;

  urls: {
    [id: string]: string;
  } = {};

  uploadingId: string;

  @Listen("uploadProgress", {target: "window", capture: true})
  uploadProgressHandler(event: CustomEvent<UploadProgressData>) {
    const uploadingProgress: UploadProgressData = event.detail;
    if (uploadingProgress.state === "completed") {
      this.urls[this.uploadingId] = uploadingProgress.url;
      let checkCompleted = true;
      Object.keys(this.inProgress).forEach((id) => {
        checkCompleted =
          checkCompleted && this.inProgress[id].uploadProgress === 100;
      });
      this.updateView = !this.updateView;
      if (checkCompleted) {
        //all files downloaded
        popoverController.dismiss(this.urls);
      } else {
        //download next file
        this.uploadMedia();
      }
    } else if (uploadingProgress.state === "error") {
      popoverController.dismiss(false);
    } else {
      this.inProgress[this.uploadingId].uploadProgress =
        uploadingProgress.progress;
      this.updateView = !this.updateView;
    }
  }

  componentDidLoad() {
    this.inProgress = {};
    Object.keys(this.files).forEach((id) => {
      //set all to false to start download
      this.inProgress[id] = {
        size: this.files[id].file.size,
        uploadProgress: 0,
      };
    });
    this.uploadMedia();
  }
  async cancel() {
    popoverController.dismiss(false);
  }

  uploadMedia() {
    //check media that have not completed download and start download
    let id = null;
    Object.keys(this.inProgress).forEach((progressId) => {
      if (this.inProgress[progressId].uploadProgress == 0) {
        id = progressId;
        return;
      }
    });
    this.uploadingId = id;
    const file = this.files[id].file;
    const media = this.files[id].media;
    StorageService.uploadFile(this.collectionId, this.itemId, media, file);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={Environment.getAppColor()}>
          <ion-title>
            {TranslationService.getTransl("media-uploader", "Media Uploader")}
          </ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list>
          {Object.keys(this.files).map((id) => [
            <ion-item>
              <ion-label>
                <h4>{this.files[id].media.title}</h4>
                {this.inProgress && this.inProgress[id]
                  ? [
                      <h5>
                        {TranslationService.getTransl("file-size", "File Size")}
                        : {this.inProgress[id].size}
                      </h5>,
                      <p>
                        {TranslationService.getTransl("uploaded", "Uploaded")}:{" "}
                        {this.inProgress[id].uploadProgress}%
                      </p>,
                    ]
                  : undefined}
              </ion-label>
            </ion-item>,
            this.inProgress && this.inProgress[id] ? (
              <ion-progress-bar value={this.inProgress[id].uploadProgress} />
            ) : undefined,
          ])}
        </ion-list>
        <ion-button expand="block" fill="outline" onClick={() => this.cancel()}>
          <ion-label>
            {TranslationService.getTransl("cancel", "Cancel")}
          </ion-label>
        </ion-button>
      </ion-content>,
    ];
  }
}
