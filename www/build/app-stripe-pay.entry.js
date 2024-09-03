import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { S as StripeAPIService } from './stripe-api-e459d4dd.js';
import './utils-ced1e260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-c3ad5e77.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';

const appStripePayCss = "app-stripe-pay{}app-stripe-pay .sr-root{width:100%;padding:48px;align-content:center;justify-content:center;height:auto;margin:0 auto}app-stripe-pay .sr-main{display:flex;flex-direction:column;justify-content:center;height:100%;align-self:center;padding:75px 50px;background:rgb(247, 250, 252);width:-400px;border-radius:6px;box-shadow:0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07)}app-stripe-pay .sr-field-error{color:rgb(105, 115, 134);text-align:left;font-size:13px;line-height:17px;margin-top:12px}app-stripe-pay .sr-input,app-stripe-pay input[type=text]{border:1px solid grey;border-radius:6px;padding:5px 12px;height:44px;width:100%;transition:box-shadow 0.2s ease;background:white;-moz-appearance:none;-webkit-appearance:none;appearance:none}app-stripe-pay .sr-input:focus,app-stripe-pay input[type=text]:focus,app-stripe-pay button:focus,app-stripe-pay .focused{box-shadow:0 0 0 1px rgba(50, 151, 211, 0.3), 0 1px 1px 0 rgba(0, 0, 0, 0.07), 0 0 0 4px rgba(50, 151, 211, 0.3);outline:none;z-index:9}app-stripe-pay .sr-input::placeholder,app-stripe-pay input[type=text]::placeholder{color:lightgray}app-stripe-pay .sr-result{height:44px;-webkit-transition:height 1s ease;-moz-transition:height 1s ease;-o-transition:height 1s ease;transition:height 1s ease;color:rgb(105, 115, 134)}app-stripe-pay .sr-combo-inputs-row{box-shadow:0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);border-radius:7px}app-stripe-pay button{background:#0a721b;border-radius:6px;color:white;border:0;padding:12px 16px;margin-top:16px;font-weight:600;cursor:pointer;transition:all 0.2s ease;display:block;box-shadow:0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);width:100%}app-stripe-pay button:hover{filter:contrast(115%)}app-stripe-pay button:active{transform:translateY(0px) scale(0.98);filter:brightness(0.9)}app-stripe-pay button:disabled{opacity:0.5;cursor:none}app-stripe-pay a{color:#ffffff;text-decoration:none;transition:all 0.2s ease}app-stripe-pay a:hover{filter:brightness(0.8)}app-stripe-pay a:active{filter:brightness(0.5)}app-stripe-pay code,app-stripe-pay pre{font-family:\"SF Mono\", \"IBM Plex Mono\", \"Menlo\", monospace;font-size:12px}app-stripe-pay .sr-card-element{padding-top:12px}@media (max-width: 720px){app-stripe-pay .sr-root{flex-direction:column;justify-content:flex-start;padding:48px 20px;min-width:320px}app-stripe-pay .sr-header__logo{background-position:center}app-stripe-pay .sr-payment-summary{text-align:center}app-stripe-pay .sr-content{display:none}app-stripe-pay .sr-main{width:100%;height:305px;background:rgb(247, 250, 252);box-shadow:0px 0px 0px 0.5px rgba(50, 50, 93, 0.1), 0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);border-radius:6px}}app-stripe-pay .spinner,app-stripe-pay .spinner:before,app-stripe-pay .spinner:after{border-radius:50%}app-stripe-pay .spinner{color:#ffffff;font-size:22px;text-indent:-99999px;margin:0px auto;position:relative;width:20px;height:20px;box-shadow:inset 0 0 0 2px;-webkit-transform:translateZ(0);-ms-transform:translateZ(0);transform:translateZ(0)}app-stripe-pay .spinner:before,app-stripe-pay .spinner:after{position:absolute;content:\"\"}app-stripe-pay .spinner:before{width:10.4px;height:20.4px;background:#0a721b;border-radius:20.4px 0 0 20.4px;top:-0.2px;left:-0.2px;-webkit-transform-origin:10.4px 10.2px;transform-origin:10.4px 10.2px;-webkit-animation:loading 2s infinite ease 1.5s;animation:loading 2s infinite ease 1.5s}app-stripe-pay .spinner:after{width:10.4px;height:10.2px;background:#0a721b;border-radius:0 10.2px 10.2px 0;top:-0.1px;left:10.2px;-webkit-transform-origin:0px 10.2px;transform-origin:0px 10.2px;-webkit-animation:loading 2s infinite ease;animation:loading 2s infinite ease}@-webkit-keyframes loading{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes loading{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}app-stripe-pay .sr-root{animation:0.4s form-in;animation-fill-mode:both;animation-timing-function:ease}app-stripe-pay .hidden{display:none}@keyframes field-in{0%{opacity:0;transform:translateY(8px) scale(0.95)}100%{opacity:1;transform:translateY(0px) scale(1)}}@keyframes form-in{0%{opacity:0;transform:scale(0.98)}100%{opacity:1;transform:scale(1)}}";

const AppStripePay = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.amount = undefined;
        this.currency = undefined;
        this.connectedAccountID = undefined;
        this.application_fee_amount = undefined;
        this.modal = undefined;
    }
    componentDidLoad() {
        if (this.connectedAccountID) {
            StripeAPIService.makePaymentIntentToConnectedAccount(this.amount, this.currency, this.application_fee_amount, this.connectedAccountID, this.el);
        }
        else {
            StripeAPIService.makePaymentIntent(this.amount, this.currency, this.el);
        }
    }
    closeModal() {
        this.modal.dismiss();
    }
    render() {
        return (h("div", { key: 'e791359cc379fac54f27dd29d112c41cd4e720aa', class: 'sr-root' }, h("div", { key: '318477e0bd4ea64f024523722d1ac11855c1ed93', class: 'sr-main' }, h("div", { key: 'd231043aa81c601cfe95e52e3d9ee1494a8115ea', class: 'sr-result' }, h("p", { key: 'e141b7f2ead4581db10b42bedbf0fb64c80d7bb2' }, "Payment: ", this.amount / 100 + " " + this.currency)), h("form", { key: '63d472a368400eb7641cb9ccfd30495e7013014a', id: 'payment-form', class: 'sr-payment-form' }, h("div", { key: '2495e64f330315111267136e0ec4709cc3eddbcb', class: 'sr-combo-inputs-row' }, h("div", { key: '3247551fa9916cfa89b5bcf18b0b08c7e32868f2', class: 'sr-input sr-card-element', id: 'card-element' })), h("div", { key: 'ec8c77803476434c9337fdeca70ca6208b6410aa', class: 'sr-field-error', id: 'card-errors', role: 'alert' }), h("button", { key: 'd9a5c73748eb3f26d6751a6ed177d3d946987a9f', id: 'submit' }, h("div", { key: '879259ecad0b6c61882e0b5aba8b3452606d297d', class: 'spinner hidden', id: 'spinner' }), h("span", { key: 'c8095f1c585d6a821d16ba2f3102be7ca6680564', id: 'button-text' }, "Pay"), h("span", { key: '86fd9db9e113619ba2ca4e8e3d59eeb5e30d94ca', id: 'order-amount' }))), h("div", { key: '2ba9c1d9de8b4e9e551307492d34b39a297e4d61', class: 'sr-result hidden', id: 'success' }, h("p", { key: '927f237761eb31b25cab5476b759776943427642' }, "Payment completed", h("br", { key: '114ec1b2c1d7d12a54b4110682c9de25a921ecb5' })), h("ion-button", { key: '796c6314e05331ca1f84f6d173f54ee692b5fc32', expand: 'full', onClick: () => this.closeModal() }, "Close")))));
    }
    get el() { return getElement(this); }
};
AppStripePay.style = appStripePayCss;

export { AppStripePay as app_stripe_pay };

//# sourceMappingURL=app-stripe-pay.entry.js.map