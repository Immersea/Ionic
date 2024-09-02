import {Component, h, State} from "@stencil/core";
import {Subscription} from "rxjs";
import {UserService} from "../../../../../services/common/user";
import {UserRoles} from "../../../../../interfaces/common/user/user-roles";
import {TranslationService} from "../../../../../services/common/translations";
import {alertController} from "@ionic/core";
import {SystemService} from "../../../../../services/common/system";
import {SystemPreference} from "../../../../../interfaces/common/system/system";
import {Browser} from "@capacitor/browser";
import {upperFirst} from "lodash";
import {CallableFunctionsUdiveService} from "../../../../../services/udive/callableFunctions";

@Component({
  tag: "app-user-licences",
  styleUrl: "app-user-licences.scss",
})
export class AppUserLicences {
  @State() userRoles: UserRoles;
  userRolesSub$: Subscription;
  @State() prices = {};
  allowPurchase = true;
  @State() sysPref: SystemPreference;

  async componentWillLoad() {
    this.userRolesSub$ = UserService.userRoles$.subscribe((userRoles) => {
      if (userRoles && userRoles.uid) {
        this.userRoles = new UserRoles(userRoles);
      }
    });
    this.sysPref = await SystemService.getSystemPreferences();
    this.setProductPrices();
  }
  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userRoles) {
      UserService.initLocalUser();
    }
  }

  disconnectedCallback() {
    this.userRolesSub$.unsubscribe();
  }

  /*
   * in app purchase
   */

  setProductPrices() {
    this.prices = {
      /*trimix: {
        licence: "trimix",
        price: this.sysPref.productPrices.trimix,
      },
      tables: {
        licence: "tables",
        price: this.sysPref.productPrices.tables,
      },
      rebreather: {
        licence: "reb",
        price: this.sysPref.productPrices.reb,
      },
      configurations: {
        licence: "configs",
        price: this.sysPref.productPrices.configs,
      },
      professional: {
        licence: "pro",
        price: this.sysPref.productPrices.pro,
      },
*/
      rec1: {
        licence: "rec1",
        price: this.sysPref.productPrices.rec1,
      },
      rec2: {
        licence: "rec2",
        price: this.sysPref.productPrices.rec2,
      },
      rec3: {
        licence: "rec3",
        price: this.sysPref.productPrices.rec3,
      },
      tech1: {
        licence: "tech1",
        price: this.sysPref.productPrices.tech1,
      },
      tech2: {
        licence: "tech2",
        price: this.sysPref.productPrices.tech2,
      },
      unlimited: {
        licence: "unlimited",
        price: this.sysPref.productPrices.unlimited,
      },
    };
    /*let productIds = new Array().concat(values(this.config.purchaseProducts))
    this.iap
    .getProducts(productIds)
    .then((products) => {
        //  [{ productId: 'com.yourapp.prod1', 'title': '...', description: '...', price: '...' }, ...]
      this.products = products;
      products.forEach(product=>{
        switch (product.productId) {
          case this.config.purchaseProducts.trimix:
            this.prices.trimix = product.price;
            break;
          case this.config.purchaseProducts.tables:
            this.prices.tables = product.price;
            break;
          case this.config.purchaseProducts.reb:
            this.prices.reb = product.price;
            break;
          case this.config.purchaseProducts.configs:
            this.prices.configs = product.price;
            break;
          case this.config.purchaseProducts.pro:
            this.prices.pro = product.price;
            break;
        }
      })
    })
    .catch((err) => {
      console.log("products",err);
      this.allowPurchase = false;
    });*/
  }

  async showInfo(licence: string) {
    let info;
    switch (licence) {
      case "trimix":
        info = TranslationService.getTransl(
          "licence-tmx-descr",
          "This licence adds the possibility to select trimix gases in the dive plans."
        );
        break;
      case "tables":
        info = TranslationService.getTransl(
          "licence-tables-descr",
          "This licence shows dive plan tables with the possibility to vary the bottom time and depth."
        );
        break;
      case "rebreather":
        info = TranslationService.getTransl(
          "licence-reb-descr",
          "This licence adds the possibility to plan dives with CCR and pSCR rebreathers, including bailout options."
        );
        break;
      case "configurations":
        info = TranslationService.getTransl(
          "licence-confs-descr",
          "This licence adds the possibility to edit, add and delete dive configurations."
        );
        break;
      case "professional":
        info = TranslationService.getTransl(
          "licence-pro-descr",
          "This licence opens all the features of the app."
        );
        break;
      case "rec1":
        info = TranslationService.getTransl(
          "licence-rec1-descr",
          "This licence allows dives in the Rec1 range."
        );
        break;
      case "rec2":
        info = TranslationService.getTransl(
          "licence-rec2-descr",
          "This licence allows dives in the Rec2 range."
        );
        break;
      case "rec3":
        info = TranslationService.getTransl(
          "licence-rec3-descr",
          "This licence allows dives in the Rec3 range."
        );
        break;
      case "tech1":
        info = TranslationService.getTransl(
          "licence-tech1-descr",
          "This licence allows dives in the Tech1 range."
        );
        break;
      case "tech2":
        info = TranslationService.getTransl(
          "licence-tech2-descr",
          "This licence allows dives in the Tech2 range."
        );
        break;
      case "unlimited":
        info = TranslationService.getTransl(
          "licence-unlimited-descr",
          "This licence allows every kind of dive."
        );
        break;
    }
    let buttons = [];
    buttons.push({
      text: TranslationService.getTransl("purchase", "Purchase"),
      handler: () => {
        this.purchase(licence);
      },
    });
    buttons.push({
      text: TranslationService.getTransl("ok", "OK"),
    });
    let prompt = await alertController.create({
      header: TranslationService.getTransl("licence-info", "Licence info"),
      message: info,
      buttons: buttons,
    });
    prompt.present();
  }

  async activateTrial() {
    const days =
      this.userRoles.licences.trial.duration > 0
        ? this.userRoles.licences.trial.duration
        : 15;
    let prompt = await alertController.create({
      header: TranslationService.getTransl("activate-trial", "Start Trial"),
      message: TranslationService.getTransl(
        "activate-trail-message",
        "Do you want to start the UNLIMITED trial period of xxx days?",
        {
          xxx: days,
        }
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            await CallableFunctionsUdiveService.startUserTrialPeriod();
          },
        },
        {
          role: "cancel",
          text: TranslationService.getTransl("cancel", "Cancel"),
        },
      ],
    });
    prompt.present();
  }

  async purchase(licence: string) {
    let url = encodeURI(
      "https://www.gue.com/store/software/decoplanner-4?uid=" +
        UserService.userProfile.uid +
        "&email=" +
        UserService.userProfile.email +
        "&licence=" +
        licence
    );
    await Browser.open({
      url: url,
    });
    /*let title =
      startCase(licence) +
      " " +
      TranslationService.getTransl("licence-purchase", "licence purchase");
    if (this.allowPurchase) {
      await SystemService.presentLoading("please-wait");
      let productId = this.config.purchaseProducts[licence];
      this.iap
      .buy(productId)
      .then( (data) => {
        this.receipt = data
        this.userRoles.purchaselicence(licence);
        this.dataBase.saveDoc(this.userRoles).then(res=>{
          this.userHasConfigsLicence = this.userRoles.licences.configs || this.userRoles.licences.pro
          loading.dismiss();
          let prompt = this.alertCtrl.create({
            title: title,
            message: TranslationService.getTransl("Thank you for your purchase! Your licence is now active."),
            buttons: [
              {
                text: TranslationService.getTransl("OK")
              }
            ]
          });
          prompt.present();
        })
      })
      .catch( (err) => {
        loading.dismiss();
        let prompt = this.alertCtrl.create({
          title: title,
          message: TranslationService.getTransl("There was a problem in the purchase:")+"<br>"+JSON.stringify(err),
          buttons: [
            {
              text: TranslationService.getTransl("OK")
            }
          ]
        });
        prompt.present();
      });
      SystemService.dismissLoading();
    } else {
      let prompt = await alertController.create({
        header: title,
        message: TranslationService.getTransl(
          "purchase-unavailable",
          "Purchase is not available at the moment. Please try again later!"
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
          },
        ],
      });
      prompt.present();
    }*/
  }

  render() {
    return this.userRoles && this.userRoles.uid ? (
      <ion-list>
        <ion-list-header onClick={() => this.purchase("unlimited")}>
          <my-transl
            tag="purchase-dp4"
            text="Purchase DecoPlanner 4"
          ></my-transl>
        </ion-list-header>
        {Object.keys(this.prices).map((licence) => (
          <ion-item>
            <ion-label>
              <my-transl tag={licence} text={upperFirst(licence)}></my-transl>
            </ion-label>

            {!this.userRoles.hasLicence(this.prices[licence].licence, false) ? (
              [
                <ion-button
                  slot="end"
                  fill="clear"
                  onClick={() => this.showInfo(licence)}
                >
                  <ion-icon name="help-circle"></ion-icon>
                </ion-button>,
              ]
            ) : (
              <ion-button slot="end" fill="clear">
                <ion-icon color="secondary" name="checkmark"></ion-icon>
              </ion-button>
            )}
          </ion-item>
        ))}
        {
          //show only if user does not have unlimited or if he did not buy the trial licence
          !this.userRoles.licences.unlimited &&
          !this.userRoles.licences.hasLicence(
            this.userRoles.licences.trial.level,
            false
          ) ? (
            <ion-item>
              <my-transl tag="trial-period" text="Trial Period" isLabel />

              {this.userRoles.licences.trial.level ? (
                <ion-note slot="end">
                  {" "}
                  {this.userRoles.licences.trialDays() > 0 ? (
                    <span>
                      <my-transl
                        tag={this.userRoles.licences.trial.level}
                        text={upperFirst(this.userRoles.licences.trial.level)}
                      ></my-transl>{" "}
                      - {this.userRoles.licences.trialDays()}{" "}
                      <my-transl tag="days-remaining" text="days remaining" />
                    </span>
                  ) : (
                    <span>
                      <my-transl tag="expired" text="Expired" />
                    </span>
                  )}
                </ion-note>
              ) : (
                <ion-button
                  slot="end"
                  fill="outline"
                  onClick={() => this.activateTrial()}
                >
                  <ion-label>
                    <my-transl
                      tag="activate-trial"
                      text="Start Trial"
                    ></my-transl>
                  </ion-label>
                </ion-button>
              )}
            </ion-item>
          ) : undefined
        }
      </ion-list>
    ) : undefined;
  }
}
