import { Component, h, Prop, Element, State, Host } from "@stencil/core";
import Cropper from "cropperjs";
import { modalController } from "@ionic/core";

@Component({
  tag: "modal-upload-image",
  styleUrl: "modal-upload-image.scss",
})
export class ModalUploadImage {
  @Element() el: HTMLElement;

  @Prop() aspectRatio: number = 16 / 9;
  @Prop() maxDimensions: number = 2000;
  @Prop() round: boolean = false;

  @State() showDropArea = true;

  imageElement: HTMLImageElement;
  inputElement: HTMLInputElement;

  cropper: any;
  options = {
    aspectRatio: this.aspectRatio,
    /*
    ready: function(e) {
      console.log(e.type);
    },
    cropstart: function(e) {
      console.log(e.type, e.detail.action);
    },
    cropmove: function(e) {
    console.log(e.type, e.detail.action);
    },
    cropend: function(e) {
      console.log(e.type, e.detail.action);
    },
    crop: function(e) {
      var data = e.detail;
      console.log("crop", data, e.type);
    },
    zoom: function(e) {
      console.log(e.type, e.detail.ratio);
    }*/
  };

  async componentDidLoad() {
    this.imageElement = this.el.querySelector("#image");
  }

  getRoundedCanvas(sourceCanvas) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, 0, 0, width, height);
    context.globalCompositeOperation = "destination-in";
    context.beginPath();
    context.arc(
      width / 2,
      height / 2,
      Math.min(width, height) / 2,
      0,
      2 * Math.PI,
      true
    );
    context.fill();
    return canvas;
  }

  async updatePhotoURL(event) {
    this.showDropArea = false;
    const uploadUrl = event.detail;
    this.imageElement.src = URL.createObjectURL(uploadUrl);
    this.cropper = new Cropper(this.imageElement, this.options);
  }

  async close() {
    if (this.cropper) {
      let result = this.cropper.getCroppedCanvas({
        maxWidth: this.maxDimensions,
        maxHeight: this.maxDimensions,
      });
      if (this.round) {
        result = this.getRoundedCanvas(result);
      }
      return modalController.dismiss(result);
    } else {
      return modalController.dismiss();
    }
  }

  render() {
    return (
      <Host style={{ backgroundColor: "darkgrey" }}>
        <ion-fab vertical='top' horizontal='end' slot='fixed'>
          <ion-fab-button
            size='small'
            color='success'
            onClick={() => this.close()}
          >
            <ion-icon name='checkmark'></ion-icon>
          </ion-fab-button>
        </ion-fab>
        <div class={this.round ? "img-container rounded" : "img-container"}>
          <img id='image' src='' />
        </div>
        {this.showDropArea ? (
          <div class='drop-area'>
            <app-dragdrop-file
              fileType='image'
              onFileSelected={(event) => this.updatePhotoURL(event)}
            ></app-dragdrop-file>
          </div>
        ) : undefined}
      </Host>
    );
  }
}
