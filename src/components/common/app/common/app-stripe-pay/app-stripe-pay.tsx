import { Component, h, Element, Prop } from "@stencil/core";
import { StripeAPIService } from "../../../../../services/common/stripe-api";

@Component({
  tag: "app-stripe-pay",
  styleUrl: "app-stripe-pay.scss",
})
export class AppStripePay {
  @Element() el: HTMLElement;
  @Prop() amount: number; //in cent
  @Prop() currency: string;
  @Prop() connectedAccountID: string;
  @Prop() application_fee_amount: string;
  @Prop() modal: any;

  componentDidLoad() {
    if (this.connectedAccountID) {
      StripeAPIService.makePaymentIntentToConnectedAccount(
        this.amount,
        this.currency,
        this.application_fee_amount,
        this.connectedAccountID,
        this.el
      );
    } else {
      StripeAPIService.makePaymentIntent(this.amount, this.currency, this.el);
    }
  }

  closeModal() {
    this.modal.dismiss();
  }

  render() {
    return (
      <div class='sr-root'>
        <div class='sr-main'>
          <div class='sr-result'>
            <p>Payment: {this.amount / 100 + " " + this.currency}</p>
          </div>
          <form id='payment-form' class='sr-payment-form'>
            <div class='sr-combo-inputs-row'>
              <div class='sr-input sr-card-element' id='card-element'></div>
            </div>
            <div class='sr-field-error' id='card-errors' role='alert'></div>
            <button id='submit'>
              <div class='spinner hidden' id='spinner'></div>
              <span id='button-text'>Pay</span>
              <span id='order-amount'></span>
            </button>
          </form>
          <div class='sr-result hidden' id='success'>
            <p>
              Payment completed
              <br />
            </p>
            <ion-button expand='full' onClick={() => this.closeModal()}>
              Close
            </ion-button>
          </div>
        </div>
      </div>
    );
  }
}
