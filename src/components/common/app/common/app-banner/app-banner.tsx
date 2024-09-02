import {Component, h, Prop, Host, Watch, State, Element} from "@stencil/core";

@Component({
  tag: "app-banner",
  styleUrl: "app-banner.scss",
})
export class AppBanner {
  @Element() el: HTMLElement;
  @Prop() link: string;
  @Prop() scrollTopValue: number;
  @Prop() widthPerc: number = 100; //%
  @Prop() heightPerc: number = 100; //%
  @Prop() widthPx: number = null; //px
  @Prop() heightPx: number = null; //px
  @Prop() backgroundCover: boolean = true;
  @Prop() backgroundCoverFill: boolean = true;
  @State() moveImage = 0;
  @State() scaleImage = 1;
  @Watch("scrollTopValue")
  updateScrolling() {
    if (this.scrollTopValue > 0) {
      this.moveImage = this.scrollTopValue / 1.6;
      this.scaleImage = 1;
    } else {
      this.moveImage = this.scrollTopValue / 1.6;
      this.scaleImage = -this.scrollTopValue / this.heightPx + 1;
    }
    this.el.style.transform =
      "translate3d(0," +
      this.moveImage +
      "px,0) scale(" +
      this.scaleImage +
      "," +
      this.scaleImage +
      ")";
  }

  componentWillLoad() {
    this.el.style.setProperty(
      "--bannerWidth",
      this.widthPx ? this.widthPx + "px" : this.widthPerc + "%"
    );
    this.el.style.setProperty(
      "--bannerHeight",
      this.heightPx ? this.heightPx + "px" : this.heightPerc + "%"
    );
  }

  render() {
    return (
      <Host>
        <div class="bannerDiv">
          {this.link ? (
            <app-image-cache
              url={this.link}
              backgroundCover={this.backgroundCover}
              backgroundCoverFill={this.backgroundCoverFill}
            />
          ) : undefined}
        </div>
      </Host>
    );
  }
}
