import { isPlatform } from "@ionic/core";
import { Component, Element, h, Host, Prop, Watch } from "@stencil/core";

@Component({
  tag: "app-sticky-search",
  styleUrl: "app-sticky-search.scss",
})
export class AppStickySearch {
  @Element() el: HTMLElement;
  @Prop() scrollTopValue = 0;
  @Prop() placeholderValue: string;
  top: number = 100;
  @Watch("scrollTopValue")
  isOutsideView() {
    let rect = this.el.getBoundingClientRect();
    this.top = rect.top;
  }

  render() {
    return (
      <Host>
        <div class={"searchbar-div"}>
          <ion-searchbar
            class={
              "searchbar " +
              (this.top < 10
                ? "searchbar-nocircle" +
                  (isPlatform("ios") ? " padding-ios" : " padding-web")
                : "searchbar-circle")
            }
            placeholder={this.placeholderValue}
          ></ion-searchbar>
        </div>
      </Host>
    );
  }
}
