import { Component, h, Prop, Host, State, Element, Watch } from "@stencil/core";
import { TranslationService } from "../../../../../services/common/translations";

@Component({
  tag: "app-header-segment-toolbar",
  styleUrl: "app-header-segment-toolbar.scss",
})
export class AppHeaderSegmentToolbar {
  @Element() el: HTMLElement;
  @Prop() color: string;
  @Prop() noHeader = false;
  @Prop() noToolbar = false;
  @State() segmentTitles: any = {};
  @State() updateView = true;
  @Prop({ mutable: true }) segment: number = 0;
  @Prop({ mutable: true }) swiper: any;
  @Prop() mode: "ios" | "md" = "md";
  @Prop({ mutable: true }) titles: {
    tag: string;
    text?: string;
    appendix?: string;
    disabled?: boolean;
    icon?: string;
    slotIcon?: string;
    badge?: number;
  }[];
  @Prop({ mutable: true }) updateBadge = true;

  @Watch("swiper")
  setSwiper() {
    if (this.swiper) {
      this.swiper.on("slideChange", (ev) => this.slideChanged(ev));
      this.swiper.slideTo(this.segment);
    }
  }

  @Watch("updateBadge")
  update() {
    this.updateView = !this.updateView;
  }

  componentWillLoad() {
    this.titles.forEach((title) => {
      this.segmentTitles[title.tag] = TranslationService.getTransl(
        title.tag,
        title.text
      );
    });
  }

  componentDidLoad() {
    this.updateSwiper();
  }

  async slideChanged(swiper) {
    this.updateSwiper();
    this.segment = swiper.activeIndex;
  }

  segmentChanged(ev) {
    if (ev.detail.value >= 0) {
      this.segment = ev.detail.value;
      if (this.swiper) {
        this.updateSwiper();
        this.swiper.slideTo(this.segment);
      }
    }
  }

  updateSwiper() {
    if (this.swiper) {
      this.swiper.update();
      this.swiper.updateAutoHeight();
      this.swiper.updateSize();
    }
  }

  renderToolbar() {
    const segment = (
      <ion-segment
        mode={this.mode}
        color={this.color}
        scrollable
        onIonChange={(ev) => this.segmentChanged(ev)}
        value={this.segment}
      >
        {this.titles.map((title, index) => (
          <ion-segment-button
            value={index}
            disabled={title.disabled ? true : false}
            layout={
              title.slotIcon && title.slotIcon == "end"
                ? "icon-end"
                : "icon-start"
            }
          >
            <ion-label>{this.segmentTitles[title.tag]}</ion-label>
            {title.icon ? <ion-icon name={title.icon}></ion-icon> : undefined}
            {title.badge > 0 ? (
              <ion-badge color={this.color}>{title.badge}</ion-badge>
            ) : undefined}
          </ion-segment-button>
        ))}
      </ion-segment>
    );
    return this.noToolbar ? (
      segment
    ) : (
      <ion-toolbar class='no-safe-padding'>{segment}</ion-toolbar>
    );
  }

  render() {
    return (
      <Host>
        {!this.noHeader && !this.noToolbar ? (
          <ion-header>{this.renderToolbar()}</ion-header>
        ) : (
          this.renderToolbar()
        )}
      </Host>
    );
  }
}
