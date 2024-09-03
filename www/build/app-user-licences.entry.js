import { r as registerInstance, h } from './index-d515af00.js';
import { U as UserService, y as UserRoles, B as SystemService, T as TranslationService, aw as CallableFunctionsUdiveService } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { B as Browser } from './index-233fe412.js';
import { l as lodash } from './lodash-68d560b6.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './env-c3ad5e77.js';
import './ionic-global-c07767bf.js';
import './map-fe092362.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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
import './framework-delegate-779ab78c.js';

const appUserLicencesCss = "app-user-licences{width:100%}";

const AppUserLicences = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.allowPurchase = true;
        this.userRoles = undefined;
        this.prices = {};
        this.sysPref = undefined;
    }
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
    async showInfo(licence) {
        let info;
        switch (licence) {
            case "trimix":
                info = TranslationService.getTransl("licence-tmx-descr", "This licence adds the possibility to select trimix gases in the dive plans.");
                break;
            case "tables":
                info = TranslationService.getTransl("licence-tables-descr", "This licence shows dive plan tables with the possibility to vary the bottom time and depth.");
                break;
            case "rebreather":
                info = TranslationService.getTransl("licence-reb-descr", "This licence adds the possibility to plan dives with CCR and pSCR rebreathers, including bailout options.");
                break;
            case "configurations":
                info = TranslationService.getTransl("licence-confs-descr", "This licence adds the possibility to edit, add and delete dive configurations.");
                break;
            case "professional":
                info = TranslationService.getTransl("licence-pro-descr", "This licence opens all the features of the app.");
                break;
            case "rec1":
                info = TranslationService.getTransl("licence-rec1-descr", "This licence allows dives in the Rec1 range.");
                break;
            case "rec2":
                info = TranslationService.getTransl("licence-rec2-descr", "This licence allows dives in the Rec2 range.");
                break;
            case "rec3":
                info = TranslationService.getTransl("licence-rec3-descr", "This licence allows dives in the Rec3 range.");
                break;
            case "tech1":
                info = TranslationService.getTransl("licence-tech1-descr", "This licence allows dives in the Tech1 range.");
                break;
            case "tech2":
                info = TranslationService.getTransl("licence-tech2-descr", "This licence allows dives in the Tech2 range.");
                break;
            case "unlimited":
                info = TranslationService.getTransl("licence-unlimited-descr", "This licence allows every kind of dive.");
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
        const days = this.userRoles.licences.trial.duration > 0
            ? this.userRoles.licences.trial.duration
            : 15;
        let prompt = await alertController.create({
            header: TranslationService.getTransl("activate-trial", "Start Trial"),
            message: TranslationService.getTransl("activate-trail-message", "Do you want to start the UNLIMITED trial period of xxx days?", {
                xxx: days,
            }),
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
    async purchase(licence) {
        let url = encodeURI("https://www.gue.com/store/software/decoplanner-4?uid=" +
            UserService.userProfile.uid +
            "&email=" +
            UserService.userProfile.email +
            "&licence=" +
            licence);
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
        return this.userRoles && this.userRoles.uid ? (h("ion-list", null, h("ion-list-header", { onClick: () => this.purchase("unlimited") }, h("my-transl", { tag: "purchase-dp4", text: "Purchase DecoPlanner 4" })), Object.keys(this.prices).map((licence) => (h("ion-item", null, h("ion-label", null, h("my-transl", { tag: licence, text: lodash.exports.upperFirst(licence) })), !this.userRoles.hasLicence(this.prices[licence].licence, false) ? ([
            h("ion-button", { slot: "end", fill: "clear", onClick: () => this.showInfo(licence) }, h("ion-icon", { name: "help-circle" })),
        ]) : (h("ion-button", { slot: "end", fill: "clear" }, h("ion-icon", { color: "secondary", name: "checkmark" })))))), 
        //show only if user does not have unlimited or if he did not buy the trial licence
        !this.userRoles.licences.unlimited &&
            !this.userRoles.licences.hasLicence(this.userRoles.licences.trial.level, false) ? (h("ion-item", null, h("my-transl", { tag: "trial-period", text: "Trial Period", isLabel: true }), this.userRoles.licences.trial.level ? (h("ion-note", { slot: "end" }, " ", this.userRoles.licences.trialDays() > 0 ? (h("span", null, h("my-transl", { tag: this.userRoles.licences.trial.level, text: lodash.exports.upperFirst(this.userRoles.licences.trial.level) }), " ", "- ", this.userRoles.licences.trialDays(), " ", h("my-transl", { tag: "days-remaining", text: "days remaining" }))) : (h("span", null, h("my-transl", { tag: "expired", text: "Expired" }))))) : (h("ion-button", { slot: "end", fill: "outline", onClick: () => this.activateTrial() }, h("ion-label", null, h("my-transl", { tag: "activate-trial", text: "Start Trial" })))))) : undefined)) : undefined;
    }
};
AppUserLicences.style = appUserLicencesCss;

export { AppUserLicences as app_user_licences };

//# sourceMappingURL=app-user-licences.entry.js.map