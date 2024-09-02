import { Component, State, h } from "@stencil/core";
import {
  UserService,
  USERPROFILECOLLECTION,
} from "../../../../services/common/user";
import { alertController, modalController } from "@ionic/core";
import { TranslationService } from "../../../../services/common/translations";
import { UserProfile } from "../../../../interfaces/common/user/user-profile";
import { UserSettings } from "../../../../interfaces/udive/user/user-settings";
import { Subscription } from "rxjs";
import { Environment } from "../../../../global/env";
import { AuthService } from "../../../../services/common/auth";
import { SystemService } from "../../../../services/common/system";
import { toLower } from "lodash";

@Component({
  tag: "modal-user-update",
  styleUrl: "modal-user-update.scss",
})
export class ModalUserUpdate {
  @State() uploading = false;
  @State() userProfile: UserProfile;
  @State() userSettings: UserSettings;
  @State() updateView = true;
  @State() addressText: string;
  @State() checkEmailPsw = false;
  userSub: Subscription;
  settingsSub: Subscription;

  componentWillLoad() {
    this.settingsSub = UserService.userSettings$.subscribe((settings) => {
      if (settings) {
        this.userSettings = settings;
        this.userSub = UserService.userProfile$.subscribe((profile) => {
          if (profile) {
            this.userProfile = profile;
            this.addressText = this.userProfile.address
              ? this.userProfile.address.display_name
              : "";
          }
        });
      }
    });
  }

  componentDidLoad() {
    //check if user is loaded or trigger local user
    if (!this.userProfile) {
      UserService.initLocalUser();
    }
    this.checkEmailPswRegistration();
  }

  disconnectedCallback() {
    this.settingsSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  async update() {
    this.userProfile.setDisplayName();
    await UserService.updateUserProfile(this.userProfile);
    await UserService.updateUserSettings(this.userSettings);
    return modalController.dismiss();
  }

  async cancel() {
    return modalController.dismiss();
  }

  changeLanguage(langCode: any) {
    this.userSettings.setLanguage(langCode.detail);
    TranslationService.setLanguage(langCode.detail);
  }

  async changeUnits(ev) {
    this.userSettings.settings.units = ev.detail.value;
    this.userSettings.userConfigurations =
      this.userSettings.userConfigurations.map((conf) => {
        const params = conf.parameters;
        params.setUnits(this.userSettings.settings.units);
        conf.convertUnits(params);
        return conf;
      });
    this.userSettings.localPlans = this.userSettings.localPlans.map((plan) => {
      plan.convertUnits(this.userSettings.settings.units);
      return plan;
    });
  }

  inputHandler(event: any) {
    if (
      event.detail.name == "facebook" ||
      event.detail.name == "instagram" ||
      event.detail.name == "twitter" ||
      event.detail.name == "website" ||
      event.detail.name == "email"
    ) {
      const val = toLower(event.detail.value).split(" ").join("-");
      this.userProfile[event.detail.name] = val;
    } else {
      this.userProfile[event.detail.name] = event.detail.value;
    }
    this.updateView = !this.updateView;
  }

  selectLocation(location) {
    this.userProfile.address = location;
    this.addressText = location.display_name;
  }

  updateImageUrls(ev) {
    const imageType = ev.detail.type;
    const url = ev.detail.url;
    if (imageType == "photo") {
      this.userProfile.photoURL = url;
    } else {
      this.userProfile.coverURL = url;
    }
    this.updateView = !this.updateView;
  }

  async checkEmailPswRegistration() {
    const methods = await AuthService.fetchSignInMethodsForEmail(
      this.userProfile.email
    );
    if (methods.includes("password")) {
      this.checkEmailPsw = true;
    } else {
      this.checkEmailPsw = false;
    }
  }

  sendResetPsw() {
    SystemService.presentLoading("please-wait");
    AuthService.passwordReset(this.userProfile.email)
      .then(() => {
        SystemService.dismissLoading();
        this.showAlert("pswreset");
      })
      .catch(() => {
        SystemService.dismissLoading();
        this.showAlert("pswreseterror");
      });
  }

  async showAlert(message) {
    let header = TranslationService.getTransl("login", "Login");
    let pswreset = TranslationService.getTransl(
      "pswreset",
      "You will receive shortly an email to reset your password. Please follow the instructions and then come back to the login page."
    );
    let pswreseterror = TranslationService.getTransl(
      "pswreseterror",
      "There was an error in the reset process. Please try again later."
    );
    let show_message = "";
    switch (message) {
      case "pswreset":
        show_message = pswreset;
        break;
      case "pswreseterror":
        show_message = pswreseterror;
        break;
    }

    const alert = await alertController.create({
      header: header,
      message: show_message,
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {},
        },
      ],
    });
    AuthService.dismissLoading();
    alert.present();
  }

  render() {
    return [
      this.uploading ? <ion-progress-bar type='indeterminate' /> : undefined,
      this.userProfile && this.userProfile.uid
        ? [
            <ion-header>
              <div class='cover-container'>
                <app-upload-cover
                  item={{
                    collection: USERPROFILECOLLECTION,
                    id: this.userProfile.uid,
                    photoURL: this.userProfile.photoURL,
                    coverURL: this.userProfile.coverURL,
                  }}
                  onCoverUploaded={(ev) => this.updateImageUrls(ev)}
                ></app-upload-cover>
              </div>
            </ion-header>,
            <ion-content>
              <ion-list>
                <app-form-item
                  label-tag='name'
                  label-text='Name'
                  value={this.userProfile.name}
                  name='name'
                  lines='inset'
                  input-type='text'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  validator={["required"]}
                ></app-form-item>
                <app-form-item
                  label-tag='surname'
                  label-text='Surname'
                  lines='inset'
                  value={this.userProfile.surname}
                  name='surname'
                  input-type='text'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  validator={["required"]}
                ></app-form-item>
                {!Environment.isTrasteel()
                  ? [
                      <app-form-item
                        label-tag='address'
                        label-text='Address'
                        value={this.addressText}
                        name='address'
                        lines='inset'
                        input-type='text'
                        onFormItemChanged={(ev) =>
                          (this.addressText = ev.detail.value)
                        }
                        onFormLocationSelected={(ev) =>
                          this.selectLocation(ev.detail)
                        }
                        validator={["address"]}
                      ></app-form-item>,
                      <app-form-item
                        label-tag='biography'
                        label-text='Biography'
                        value={this.userProfile.bio}
                        text-rows={4}
                        name='bio'
                        lines='inset'
                        input-type='text'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      <app-form-item
                        label-tag='phone'
                        label-text='Phone'
                        value={this.userProfile.phoneNumber}
                        name='phoneNumber'
                        input-type='tel'
                        lines='inset'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      <app-form-item
                        label-tag='email'
                        label-text='Email'
                        value={this.userProfile.email}
                        name='email'
                        lines='inset'
                        input-type='email'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={["email"]}
                      ></app-form-item>,
                      <app-form-item
                        label-tag='website'
                        label-text='Website'
                        value={this.userProfile.website}
                        name='website'
                        lines='inset'
                        input-type='url'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      this.userProfile.website ? (
                        <a
                          class='ion-padding-start'
                          href={"http://" + this.userProfile.website}
                          target='_blank'
                        >
                          {"http://" + this.userProfile.website}
                        </a>
                      ) : undefined,
                      <app-form-item
                        label-tag='facebook-id'
                        label-text='Facebook ID'
                        value={this.userProfile.facebook}
                        name='facebook'
                        lines='inset'
                        input-type='url'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      this.userProfile.facebook ? (
                        <a
                          class='ion-padding-start'
                          href={
                            "https://www.facebook.com/" +
                            this.userProfile.facebook
                          }
                          target='_blank'
                        >
                          {"https://www.facebook.com/" +
                            this.userProfile.facebook}
                        </a>
                      ) : undefined,
                      <app-form-item
                        label-tag='instagram-id'
                        label-text='Instagram ID'
                        value={this.userProfile.instagram}
                        name='instagram'
                        lines='inset'
                        input-type='url'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      this.userProfile.instagram ? (
                        <a
                          class='ion-padding-start'
                          href={
                            "https://www.instagram.com/" +
                            this.userProfile.instagram
                          }
                          target='_blank'
                        >
                          {"https://www.instagram.com/" +
                            this.userProfile.instagram}
                        </a>
                      ) : undefined,
                      <app-form-item
                        label-tag='twitter id'
                        label-text='Twitter ID'
                        value={this.userProfile.twitter}
                        name='twitter'
                        lines='inset'
                        input-type='url'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        validator={[]}
                      ></app-form-item>,
                      this.userProfile.twitter ? (
                        <a
                          class='ion-padding-start'
                          href={
                            "https://www.twitter.com/" +
                            this.userProfile.twitter
                          }
                          target='_blank'
                        >
                          {"https://www.twitter.com/" +
                            this.userProfile.twitter}
                        </a>
                      ) : undefined,
                      <ion-item lines='inset'>
                        <ion-select
                          label={TranslationService.getTransl("units", "Units")}
                          onIonChange={(ev) => this.changeUnits(ev)}
                          value={this.userSettings.settings.units}
                          interfaceOptions={{
                            header: TranslationService.getTransl(
                              "units",
                              "Units"
                            ),
                            message: TranslationService.getTransl(
                              "units-chnage-message",
                              "This will change the units for the whole app! Are you sure?"
                            ),
                            buttons: [
                              TranslationService.getTransl("OK", "OK"),
                              TranslationService.getTransl("cancel", "Cancel"),
                            ],
                          }}
                        >
                          <ion-select-option value='Metric'>
                            Metric
                          </ion-select-option>
                          <ion-select-option value='Imperial'>
                            Imperial
                          </ion-select-option>
                        </ion-select>
                      </ion-item>,
                    ]
                  : undefined}

                <app-language-picker
                  picker
                  selectedLangCode={
                    this.userSettings.getLanguage()
                      ? this.userSettings.getLanguage()
                      : undefined
                  }
                  onLanguageChanged={(lang) => this.changeLanguage(lang)}
                />

                {this.checkEmailPsw ? (
                  <ion-button
                    color={Environment.getAppColor()}
                    expand='block'
                    onClick={() => {
                      this.sendResetPsw();
                    }}
                  >
                    <my-transl tag='reset-psw' text='Reset Password' />
                  </ion-button>
                ) : undefined}
              </ion-list>
            </ion-content>,
          ]
        : undefined,
      <app-modal-footer
        onCancelEmit={() => this.cancel()}
        onSaveEmit={() => this.update()}
      />,
    ];
  }
}
