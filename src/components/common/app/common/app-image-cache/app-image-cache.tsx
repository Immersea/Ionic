import { Component, h, Prop, State, Host, Watch } from "@stencil/core";
import { FileSystemService } from "../../../../../services/common/fileSystem";

@Component({
  tag: "app-image-cache",
  styleUrl: "app-image-cache.scss",
})
export class AppImageCache {
  @Prop({ mutable: true }) url: string;
  @Prop() backgroundCover = true;
  @Prop() backgroundCoverFill = true;
  @State() _src: string | Blob = null;
  resetImageCache = false;
  @Watch("url")
  async update() {
    if (this.url)
      this._src = (await FileSystemService.storeAndLoadImage(this.url)).src;
  }
  componentWillLoad() {
    this.update();
  }

  render() {
    return (
      <Host>
        {this.backgroundCover ? (
          this._src ? (
            <div
              class={
                "cover-main cover-dimensions " +
                (this.backgroundCoverFill ? "cover-fill" : "cover-contain")
              }
              style={{ backgroundImage: "url(" + this._src + ")" }}
            ></div>
          ) : (
            <ion-skeleton-text
              class='cover-dimensions'
              animated
            ></ion-skeleton-text>
          )
        ) : this._src ? (
          <img class='cover-main' src={this._src.toString()} />
        ) : (
          <ion-skeleton-text
            animated
            class='cover-dimensions'
          ></ion-skeleton-text>
        )}
      </Host>
    );
  }
}
