import { R as RouterService, G as httpsCallable, H as functions, B as SystemService, D as DatabaseService } from './utils-ced1e260.js';
import { E as Environment } from './env-c3ad5e77.js';
import { l as lodash } from './lodash-68d560b6.js';

/**
 * @module Services
 */
class StripeAPIController {
    constructor() {
        this.shouldBeAsync = true;
        /**
         * Immersea
         */
        this.publishableKeyTest_Immersea = "pk_test_51IyID2DiIthbhXzgcmfDTzMVwJEf8cXgDaMgWdulWi1yjdKdTEYaj9FZXeFiGRWlR9P8IXDpYnkD84OyrGlikLfI00PE5fMGdl";
        this.publishableKeyProd_Immersea = "sk_test_51IyID2DiIthbhXzg0non2BblyCy3l2qF4hiTybt5ZQaFZ3OJLvmGsFK3Z4JI8omJru3sWjTuHxh3ZCnNWqsFLYG300Lnvr5vYV";
        /**
         * O-Range
         */
        this.publishableKeyTest_ORange = "pk_test_51IvOEYEKefFL9WPBfoYdfFjPfbnvO9gK8A5wAD5cnpzbJmtYugrv45nowbB1P50jn2ECZ9xcbk49SWTS6dqDDMgR00dtep8t1v";
        this.publishableKeyProd_ORange = "pk_live_51IvOEYEKefFL9WPBMN1NQ3iqosSXd9X62oF3tI6kWclmEoDUYlbXu7BqBNDTtZUGbMhRr4Z74pNVcjUVvc9kI5DN004WVwJgzv";
        /**
         * DEFINE KEY!!
         */
        this.test = true;
        this.immersea = true; //immersea or orange stripe account as master
        this.publishableKey = this.test
            ? this.immersea
                ? this.publishableKeyTest_Immersea
                : this.publishableKeyTest_ORange
            : this.immersea
                ? this.publishableKeyProd_Immersea
                : this.publishableKeyProd_ORange;
        this.stripe = null;
        /*
      
        async makeStripeSessionPayment() {
          await SystemService.presentLoading("please-wait");
          let data = {
            amount: 110, //in cent
            currency: "eur",
          };
          let response = await functions.httpsCallable("createStripeCheckoutSession",
            {
              method: "POST",
              redirect: "follow",
              body: JSON.stringify(data),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          try {
            let json = await response.json();
            SystemService.dismissLoading();
            if (!json.err) {
              let header = TranslationService.getTransl(
                "stripe-payment-title",
                "Stripe Payment"
              );
              let message = TranslationService.getTransl(
                "stripe-payment-confirmed",
                "The payment was succesfull!"
              );
              const alert = await alertController.create({
                header: header,
                message: message,
                buttons: [
                  {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {},
                  },
                ],
              });
              alert.present();
            } else {
              SystemService.presentAlertError(json.err);
            }
          } catch (error) {
            SystemService.dismissLoading();
            SystemService.presentAlertError(error);
          }
      
          fetch("/createStripeCheckoutSession", {
            method: "POST",
          })
            .then(function (response) {
              return response.json();
            })
            .then(function (session) {
              return this.stripe.redirectToCheckout({ sessionId: session.id });
            })
            .then(function (result) {
              // If `redirectToCheckout` fails due to a browser or network
              // error, you should display the localized error message to your
              // customer using `error.message`.
              if (result.error) {
                alert(result.error.message);
              }
            })
            .catch(function (error) {
              console.error("Error:", error);
            });
        }
      
        setupStripe(form) {
          let elements = this.stripe.elements();
          var style = {
            base: {
              color: "#32325d",
              lineHeight: "24px",
              fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
              fontSmoothing: "antialiased",
              fontSize: "16px",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#fa755a",
              iconColor: "#fa755a",
            },
          };
          var paymentData = {
            type: "card",
            currency: "eur",
            amount: "100",
            usage: "single_use",
            owner: {
              name: "Jenny Rosen",
              address: {
                line1: "Nollendorfstraße 27",
                city: "Berlin",
                postal_code: "10777",
                country: "DE",
              },
              email: "jenny.rosen@example.com",
            },
          };
      
          this.card = elements.create("card", { style: style });
          this.card.mount("#card-element");
      
          this.card.addEventListener("change", (event) => {
            var displayError = document.getElementById("card-errors");
            if (event.error) {
              displayError.textContent = event.error.message;
            } else {
              displayError.textContent = "";
            }
          });
      
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.stripe.createSource(this.card, paymentData).then((source) => {
              console.log("source", source);
              if (source.error) {
                var errorElement = document.getElementById("card-errors");
                errorElement.textContent = source.error.message;
              } else {
                this.makePayment(source.source);
              }
            });
          });
        }
      
        async makePayment(source) {
          await SystemService.presentLoading("please-wait");
          let data = {
            amount: 110, //in cent
            currency: "eur",
            source: source.id,
          };
          let response = await functions.httpsCallable("payWithStripe",
            {
              method: "POST",
              redirect: "follow",
              body: JSON.stringify(data),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          try {
            let json = await response.json();
            SystemService.dismissLoading();
            if (!json.err) {
              let header = TranslationService.getTransl(
                "stripe-payment-title",
                "Stripe Payment"
              );
              let message = TranslationService.getTransl(
                "stripe-payment-confirmed",
                "The payment was succesfull!"
              );
              const alert = await alertController.create({
                header: header,
                message: message,
                buttons: [
                  {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {},
                  },
                ],
              });
              alert.present();
            } else {
              SystemService.presentAlertError(json.err);
            }
          } catch (error) {
            SystemService.dismissLoading();
            SystemService.presentAlertError(error);
          }
        }*/
    }
    initStripe() {
        this.stripe = Stripe(this.publishableKey);
    }
    /**************
     *
     * Open Modal for Stripe payments
     *
     **************/
    async payWithCard(collectionId, id, total, connectedAccountID) {
        this.paymentCollectionID = collectionId;
        this.paymentId = id;
        var options = {
            collectionId: collectionId,
            orderId: id,
            amount: lodash.exports.round(total, 2) * 100, // in cent
            currency: "eur",
            connectedAccountID: connectedAccountID,
            application_fee_amount: 0,
        };
        console.log("options", options);
        RouterService.openModal("app-stripe-pay", options, false);
    }
    /**************
     *
     * Stripe Connect for third party payments
     *
     **************/
    async connectStripeUser() {
        let res;
        try {
            res = await httpsCallable(functions, "stripeConnectStandardUser")({
                link: Environment.getSiteUrl(),
            });
        }
        catch (error) {
            res = {
                error: error,
            };
        }
        if (res && res.error) {
            return { error: res.error };
        }
        else {
            return res;
        }
    }
    /**************
     *
     * Retrieve Stripe Connected Account
     *
     **************/
    async retrieveStripeConnectedAccount(id) {
        let res;
        try {
            res = await httpsCallable(functions, "stripeRetrieveConnectedAccount")({
                accountID: id,
            });
        }
        catch (error) {
            res = {
                error: error,
            };
        }
        if (res && res.error) {
            return { error: res.error };
        }
        else {
            return res;
        }
    }
    /**************
     *
     * Payment Intent for dierct payment to account
     *
     **************/
    async makePaymentIntent(amount, currency, element) {
        if (Stripe) {
            this.stripe = Stripe(this.publishableKey);
            if (element) {
                this.el = element;
            }
            const orderData = {
                amount: lodash.exports.round(amount, 2),
                currency: currency,
            };
            // Disable the button until we have Stripe set up on the page
            this.el.querySelector("button").disabled = false;
            let res;
            try {
                res = await httpsCallable(functions, "createPaymentIntent")(orderData);
            }
            catch (error) {
                res = {
                    error: error,
                };
            }
            if (res && res.error) {
                SystemService.presentAlertError(res.error);
            }
            else {
                const elements = await this.setupElements(res.data);
                this.el.querySelector("button").disabled = false;
                // Handle form submission.
                const form = this.el.querySelector("#payment-form");
                form.addEventListener("submit", (event) => {
                    event.preventDefault();
                    // Initiate payment when the submit button is clicked
                    this.pay(elements.stripe, elements.card, elements.clientSecret);
                });
            }
        }
    }
    /**************
     *
     * Payment Intent for dierct payment to account
     *
     **************/
    async makePaymentIntentToConnectedAccount(amount, currency, application_fee_amount, connectedAccountID, element) {
        if (Stripe) {
            this.stripe = Stripe(this.publishableKey, {
                stripeAccount: connectedAccountID,
            });
            if (element) {
                this.el = element;
            }
            const orderData = {
                amount: lodash.exports.round(amount, 2),
                currency: currency,
                payment_method_types: ["card"],
                application_fee_amount: application_fee_amount,
                connectedStripeAccount: connectedAccountID,
            };
            // Disable the button until we have Stripe set up on the page
            this.el.querySelector("button").disabled = false;
            let res;
            try {
                res = await httpsCallable(functions, "createPaymentIntentForConnectedAccount")(orderData);
            }
            catch (error) {
                res = {
                    error: error,
                };
            }
            if (res && res.error) {
                SystemService.presentAlertError(res.error);
            }
            else {
                const elements = await this.setupElements(res.data);
                this.el.querySelector("button").disabled = false;
                // Handle form submission.
                const form = this.el.querySelector("#payment-form");
                form.addEventListener("submit", (event) => {
                    event.preventDefault();
                    // Initiate payment when the submit button is clicked
                    this.pay(elements.stripe, elements.card, elements.clientSecret);
                });
            }
        }
    }
    // Set up Stripe.js and Elements to use in checkout form
    setupElements(data) {
        var elements = this.stripe.elements();
        var style = {
            base: {
                color: "#32325d",
                fontFamily: "Arial, sans-serif",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d",
                },
            },
            invalid: {
                fontFamily: "Arial, sans-serif",
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        };
        var card = elements.create("card", { style: style });
        card.mount("#card-element");
        card.on("change", (event) => {
            // Disable the Pay button if there are no card details in the Element
            this.el.querySelector("button").disabled = event.empty;
            this.el.querySelector("#card-errors").textContent = event.error
                ? event.error.message
                : "";
        });
        return {
            stripe: this.stripe,
            card: card,
            clientSecret: data.clientSecret,
        };
    }
    /*
     * Calls stripe.confirmCardPayment which creates a pop-up modal to
     * prompt the user to enter extra authentication details without leaving your page
     */
    pay(stripe, card, clientSecret) {
        this.changeLoadingState(true);
        stripe
            .confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
            },
        })
            .then((result) => {
            if (result.error) {
                // Show error to your customer
                this.showError(result.error.message);
            }
            else {
                // The payment has been processed!
                this.orderComplete(clientSecret);
            }
        });
    }
    /* ------- Post-payment helpers ------- */
    /* Shows a success / error message when the payment is complete */
    orderComplete(clientSecret) {
        // Just for the purpose of the sample, show the PaymentIntent response object
        this.stripe.retrievePaymentIntent(clientSecret).then((result) => {
            const paymentIntent = result.paymentIntent;
            this.updatePaymentStatus(paymentIntent.id, paymentIntent.status);
            this.el.querySelector(".sr-payment-form").classList.add("hidden");
            this.el.querySelector("#success").classList.remove("hidden");
            this.changeLoadingState(false);
        });
    }
    async showError(errorMsgText) {
        this.changeLoadingState(false);
        var errorMsg = this.el.querySelector(".sr-field-error");
        errorMsg.textContent = errorMsgText;
        setTimeout(() => {
            errorMsg.textContent = "";
        }, 4000);
        this.updatePaymentStatus(null, "error");
    }
    async updatePaymentStatus(id, status) {
        //update payment in order
        const order = await DatabaseService.getDocument(this.paymentCollectionID, this.paymentId);
        const paymentStatus = {
            id: id,
            status: status,
            payAt: "stripe",
        };
        order.paymentStaus = paymentStatus;
        await DatabaseService.updateDocument(this.paymentCollectionID, this.paymentId, order);
    }
    // Show a spinner on payment submission
    changeLoadingState(isLoading) {
        if (isLoading) {
            this.el.querySelector("button").disabled = true;
            this.el.querySelector("#spinner").classList.remove("hidden");
            this.el.querySelector("#button-text").classList.add("hidden");
        }
        else {
            this.el.querySelector("button").disabled = false;
            this.el.querySelector("#spinner").classList.add("hidden");
            document.querySelector("#button-text").classList.remove("hidden");
        }
    }
}
const StripeAPIService = new StripeAPIController();

export { StripeAPIService as S };

//# sourceMappingURL=stripe-api-e459d4dd.js.map