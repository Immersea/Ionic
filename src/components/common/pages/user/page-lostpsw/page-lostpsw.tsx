import { Component, h, Prop, State } from "@stencil/core";
import { AuthService } from "../../../../../services/common/auth";
import { TranslationService } from "../../../../../services/common/translations";
import { alertController } from "@ionic/core";
import { InputValidator } from "../../../../../interfaces/interfaces";
import { RouterService } from "../../../../../services/common/router";
import { Environment } from "../../../../../global/env";
import { SystemService } from "../../../../../services/common/system";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
@Component({
  tag: "page-lostpsw",
  styleUrl: "page-lostpsw.scss",
})
export class PageLostpsw {
  @Prop() email: string = "";
  @State() emailpsw: InputValidator = {
    name: "emailpsw",
    valid: false,
    value: "",
  };
  @State() scrollTop = 0;

  componentWillLoad() {
    if (this.email) {
      this.emailpsw = {
        name: "emailpsw",
        valid: true,
        value: this.email,
      };
    }
  }

  async showAlert(message) {
    let header = TranslationService.getTransl("login", "Login");
    let newuser = TranslationService.getTransl(
      "new-user",
      "Your email is not registered in our systems. Please register to proceed."
    );
    let google = TranslationService.getTransl(
      "google-registration",
      "You have previously logged-in through Google registration process. Please click on the related button in the login page to proceed."
    );
    let facebook = TranslationService.getTransl(
      "facebook-registration",
      "You have previously logged-in through Facebook registration process. Please click on the related button in the login page to proceed."
    );
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
      case "newuser":
        show_message = newuser;
        break;
      case "google":
        show_message = google;
        break;
      case "facebook":
        show_message = facebook;
        break;
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
          handler: async () => {
            RouterService.push("/login", "root");
          },
        },
      ],
    });
    AuthService.dismissLoading();
    alert.present();
  }

  inputHandler(event) {
    this[event.detail.name] = event.detail;
  }

  async checkEmail() {
    SystemService.presentLoading("please-wait");
    const methods = await AuthService.fetchSignInMethodsForEmail(
      this.emailpsw.value
    );
    SystemService.dismissLoading();
    if (methods.length == 0) {
      //new user
      SystemService.presentAlertError("newuser");
    } else {
      //existing user
      if (
        methods.indexOf(EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD) != -1
      ) {
        this.sendResetPsw();
      } else if (
        methods.indexOf(GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD) != -1
      ) {
        this.showAlert("google");
      } else if (
        methods.indexOf(FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD) != -1
      ) {
        this.showAlert("facebook");
      }
    }
  }

  sendResetPsw() {
    SystemService.presentLoading("please-wait");
    AuthService.passwordReset(this.emailpsw.value)
      .then(() => {
        SystemService.dismissLoading();
        this.showAlert("pswreset");
      })
      .catch(() => {
        SystemService.dismissLoading();
        this.showAlert("pswreseterror");
      });
  }

  render() {
    return [
      <app-navbar
        color={Environment.getAppColor()}
        tag='forgot-psw'
        text='Forgot Password'
        back-button={true}
      ></app-navbar>,
      <ion-content
        scrollEvents
        onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
      >
        {Environment.isUdive() || Environment.isDecoplanner() ? (
          <app-banner
            scrollTopValue={this.scrollTop}
            heightPx={250}
            link='/assets/images/friendship2SM.jpg'
          ></app-banner>
        ) : undefined}
        <ion-grid>
          <ion-row>
            <ion-col>
              <app-form-item
                label-tag='email'
                label-text='Email'
                name='emailpsw'
                input-type='email'
                onFormItemChanged={(ev) => this.inputHandler(ev)}
                validator={["required", "email"]}
              ></app-form-item>
              <ion-button
                margin-top
                expand='block'
                disabled={!this.emailpsw.valid}
                onClick={() => this.checkEmail()}
              >
                <my-transl
                  tag='login-resetpsw'
                  text='Reset my password'
                ></my-transl>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-content>,
    ];
  }
}
