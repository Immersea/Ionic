import { Component, h, Element, Event, EventEmitter } from "@stencil/core";
import { StripeAPIService } from "../../../../../services/common/stripe-api";
import { Browser } from "@capacitor/browser";
import { SystemService } from "../../../../../services/common/system";

@Component({
  tag: "app-stripe-connect",
  styleUrl: "app-stripe-connect.scss",
})
export class AppStripeConnect {
  @Element() el: HTMLElement;
  @Event() refreshConnectedId: EventEmitter<string>;

  async connectWithStripe() {
    let elmButton = this.el.querySelector(".stripe-connect");
    elmButton.setAttribute("disabled", "disabled");
    await SystemService.presentLoading("please-wait");
    const res = await StripeAPIService.connectStripeUser();
    await SystemService.dismissLoading();
    if (res.error) {
      await SystemService.presentAlertError(res.error);
    } else {
      this.refreshConnectedId.emit(res.data.id);
      await Browser.open({ url: res.data.url });
    }
  }

  render() {
    return (
      <a onClick={() => this.connectWithStripe()} class='stripe-connect'>
        <span>Connect with</span>
      </a>
    );
  }
}
