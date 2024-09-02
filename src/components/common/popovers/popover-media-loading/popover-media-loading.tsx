import {popoverController} from "@ionic/core";
import {Component, h, Prop, State} from "@stencil/core";
import {Media} from "../../../../interfaces/common/media/media";
import {Environment} from "../../../../global/env";
import {toNumber} from "lodash";

@Component({
  tag: "popover-media-loading",
  styleUrl: "popover-media-loading.scss",
})
export class PopoverMediaLoading {
  @Prop({mutable: true}) media: Media;
  @Prop({mutable: true}) file: File;
  @State() validMedia = false;
  @State() updateView = false;

  componentWillLoad() {
    if (!this.media) {
      this.media = new Media();
    }
    if (this.file) {
      this.updateMedia({detail: this.file});
    } else {
      this.validateMedia();
    }
  }

  async close() {
    popoverController.dismiss();
  }

  async save() {
    popoverController.dismiss({media: this.media, file: this.file});
  }

  validateMedia() {
    this.validMedia =
      this.media.title &&
      this.media.title.length >= 3 &&
      this.media.size > 0 &&
      this.media.type &&
      this.media.description &&
      this.media.description.length > 5;
    this.updateView = !this.updateView;
  }

  handleChange(ev) {
    if (ev.detail.name == "order") {
      this.media[ev.detail.name] = toNumber(ev.detail.value);
    } else {
      this.media[ev.detail.name] = ev.detail.value;
    }
    this.validateMedia();
  }

  updatePublic(ev) {
    this.media.public = ev.detail.checked;
    this.validateMedia();
  }

  updateMedia(event) {
    this.file = event.detail;
    if (!this.media.title) {
      this.media.title = this.file.name;
    }
    this.media.name = this.file.name;
    this.media.lastModified = this.file.lastModified;
    this.media.size = this.file.size;
    this.media.type = this.file.type;
    this.validateMedia();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={Environment.getAppColor()}>
          <ion-title>Media Loader</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <ion-list>
          <ion-note>Id: {this.media.id}</ion-note>
          <app-form-item
            label-tag="title"
            label-text="Title"
            value={this.media.title}
            name="title"
            input-type="text"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            validator={[
              "required",
              {
                name: "length",
                options: {
                  min: 3,
                  max: 20,
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-tag="subtitle"
            label-text="Subtitle"
            value={this.media.subtitle}
            name="subtitle"
            input-type="text"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            validator={[
              {
                name: "length",
                options: {
                  min: 0,
                  max: 30,
                },
              },
            ]}
          ></app-form-item>
          <app-form-item
            label-tag="description"
            label-text="Description"
            value={this.media.description}
            name="description"
            input-type="text"
            onFormItemChanged={(ev) => this.handleChange(ev)}
            validator={[
              "required",
              {
                name: "length",
                options: {
                  min: 5,
                  max: 100,
                },
              },
            ]}
          ></app-form-item>
          <ion-item>
            <ion-label>
              <my-transl tag="public" text="Public" />
            </ion-label>
            <ion-toggle
              slot="end"
              onIonChange={(ev) => this.updatePublic(ev)}
              checked={this.media.public}
            ></ion-toggle>
          </ion-item>
        </ion-list>
        <div class="drop-area">
          <app-dragdrop-file
            fileTypes={this.media.getTypes()}
            file={this.file}
            onFileSelected={(event) => this.updateMedia(event)}
          ></app-dragdrop-file>
        </div>
      </ion-content>,
      <app-modal-footer
        color={Environment.getAppColor()}
        onCancelEmit={() => this.close()}
        onSaveEmit={() => this.save()}
        disableSave={!this.validMedia}
      />,
    ];
  }
}
