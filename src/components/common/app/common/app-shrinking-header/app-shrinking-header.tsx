import { Component, h, Prop, Watch, Element, Host } from "@stencil/core";

@Component({
  tag: "app-shrinking-header",
  styleUrl: "app-shrinking-header.scss",
})
export class AppShrinkingHeader {
  @Element() el: HTMLElement;
  @Prop() logoUrl = "";
  @Prop() scrollTopValue = 0;
  @Prop() slogan = null;
  heightValue: number = 0;

  @Watch("scrollTopValue")
  updateScrolling() {
    if (this.el.clientHeight > this.heightValue)
      this.heightValue = this.el.clientHeight;

    const constant =
      document.documentElement.clientHeight /
      this.heightValue /
      (document.documentElement.clientHeight /
        document.documentElement.clientWidth);
    const newOpacity = Math.max(100 - this.scrollTopValue / constant, 0) / 100;
    let newPadding = 15 + this.scrollTopValue / (constant * 3);
    if (newPadding > 100) {
      newPadding = 100;
    }
    this.el.style.paddingLeft = newPadding.toString() + "%";
    this.el.style.paddingRight = newPadding.toString() + "%";
    this.el.style.opacity = newOpacity.toString();
    this.el.style.fontSize = (newOpacity * 100 + 30).toString() + "%";
  }
  render() {
    return (
      <Host>
        <img src={this.logoUrl} />
        {this.slogan ? (
          <h1 class='ion-text-center'>Immergiti, scopri la Sicilia</h1>
        ) : undefined}
      </Host>
    );
  }
}
