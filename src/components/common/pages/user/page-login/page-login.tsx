import { Component, h, State } from "@stencil/core";
import { AuthService } from "../../../../../services/common/auth";
import { TranslationService } from "../../../../../services/common/translations";
import { alertController } from "@ionic/core";
import { InputValidator } from "../../../../../interfaces/interfaces";
import { RouterService } from "../../../../../services/common/router";
import { DatabaseService } from "../../../../../services/common/database";
import { Environment } from "../../../../../global/env";
import { SystemService } from "../../../../../services/common/system";
import { toLower } from "lodash";

@Component({
  tag: "page-login",
  styleUrl: "page-login.scss",
})
export class PageLogin {
  @State() email: InputValidator = {
    name: "email",
    valid: false,
    value: "",
  };
  @State() emailpsw: InputValidator = {
    name: "emailpsw",
    valid: false,
    value: "",
  };
  @State() psw: InputValidator = {
    name: "psw",
    valid: false,
    value: "",
  };
  @State() retypepsw: InputValidator = {
    name: "retypepsw",
    valid: true,
    value: "",
  };

  @State() passwordCheck = true;

  @State() trasteelLogin = false;
  @State() disablePswFields = false;
  @State() disableEmailLinkFields = false;
  @State() disableGoogle = false;
  @State() disableFacebook = true;
  @State() disableApple = false;

  @State() network = false;
  @State() scrollTop = 0;

  newUserRegistration = false;

  checkEmailTimer;
  @State() checkingEmail = false;

  componentWillLoad() {
    SystemService.getNetworkStatus().then((networkObservable) => {
      networkObservable.subscribe((status) => {
        this.network = status;
      });
    });
    this.trasteelLogin = Environment.isTrasteel();
  }

  async sendLink() {
    try {
      await AuthService.sendEmailLink(this.email.value.trim());
      this.email.value = "";
      this.showAlert(false);
    } catch (error) {
      this.showAlert(error);
    }
  }

  async googleLogin() {
    try {
      await AuthService.google();
    } catch (error) {
      this.showAlert(error);
    }
  }

  /*async facebookLogin() {
    try {
      await AuthService.facebook();
    } catch (error) {
      this.showAlert(error);
    }
  }*/

  async appleLogin() {
    const alert = await alertController.create({
      header: TranslationService.getTransl("login", "Login"),
      message: TranslationService.getTransl(
        "apple-login-message",
        "In order to login with the same Apple account also with other devices, it is necessary to share your original email address."
      ),
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            try {
              await AuthService.apple();
            } catch (error) {
              this.showAlert(error);
            }
          },
        },
        {
          text: TranslationService.getTransl("cancel", "Cancel"),
        },
      ],
    });
    alert.present();
  }

  async loginWithEmail() {
    try {
      await AuthService.signInWithEmailPsw(
        this.email.valid ? this.email.value.trim() : this.emailpsw.value.trim(),
        this.psw.value
      );
      //check if signedin with link
      const email = await DatabaseService.getLocalDocument("emailForSignIn");
      if (email) {
        this.emailpsw.value = "";
        this.psw.value = "";
        this.showAlert(false);
      } else {
        AuthService.dismissLoading();
      }
    } catch (error) {
      this.showAlert(error);
    }
  }

  forgotPsw() {
    //RouterService.push("/forgotpsw", "forward");
    SystemService.presentLoading("please-wait");
    const email = this.email.value ? this.email.value : this.emailpsw.value;
    AuthService.passwordReset(email)
      .then(() => {
        SystemService.dismissLoading();
        this.showPswResetAlert("pswreset");
      })
      .catch(() => {
        SystemService.dismissLoading();
        this.showPswResetAlert("pswreseterror");
      });
  }

  async showAlert(error) {
    let header = TranslationService.getTransl("login", "Login");
    let message_error = TranslationService.getTransl(
      "login-error",
      "There was an error in the login process. Please try again later."
    );
    let message_ok = TranslationService.getTransl(
      "registration-success-email",
      "The registration/login has been completed! You will now receive a link in your email to complete the login process. If you don't receive the email within 1 minute please check in your spam folder."
    );
    if (error) {
      Environment.log("registration/login error", [error]);
      switch (error.code) {
        case "auth/popup-blocked":
          message_error = TranslationService.getTransl(
            "popup-error",
            "You should allow popup windows in the browser's preferences in order to complete the login process."
          );
          break;
        case "auth/account-exists-with-different-credential":
          if (error.email) {
            this.emailpsw.value = error.email;
            this.checkEmail();
          }
          message_error = TranslationService.getTransl(
            "popup-error-existing-account",
            "You have already logged in with this email using another Sign-In method. Insert your email in the 'Email' field to check your exisiting method."
          );
          break;
        case "auth/missing-or-invalid-nonce":
          if (error.email) {
            this.emailpsw.value = error.email;
            this.checkEmail();
          }
          message_error = TranslationService.getTransl(
            "popup-error-duplicate-credential",
            "Duplicate credential received. Please try again with a new credential."
          );
          break;
        default:
          message_error += error.message ? " (" + error.message + ")" : "";
      }
    }

    const alert = await alertController.create({
      header: header,
      message: error ? message_error : message_ok,
      buttons: [
        {
          text: TranslationService.getTransl("ok", "OK"),
          handler: async () => {
            RouterService.push("/", "root");
          },
        },
      ],
    });
    AuthService.dismissLoading();
    alert.present();
  }

  async showPswResetAlert(message) {
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
        },
      ],
    });
    AuthService.dismissLoading();
    alert.present();
  }

  inputHandler(event) {
    this[event.detail.name] = event.detail;
    if (event.detail.name == "retypepsw") {
      this.checkRetypePassword();
    } else if (
      event.detail.name == "emailpsw" ||
      event.detail.name == "email"
    ) {
      this.psw.value = "";
      this.psw.valid = true;
      this.retypepsw.valid = true;
      this.retypepsw.value = "";
      // Function to validate email using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      //check email address
      const email = toLower(event.detail.value);
      this.email.value = toLower(email);
      this.emailpsw.value = this.email.value;
      if (Environment.isTrasteel() && event.detail.name == "email") {
        if (
          (!this.email.value.includes("@trasteel.com") &&
            !this.email.value.includes("@trasteelnetwork.com") &&
            !this.email.value.includes("@o-range.tech") &&
            !this.email.value.includes("@ipermediastudio.it")) ||
          !emailRegex.test(this.email.value)
        ) {
          this.email.valid = false;
          this.emailpsw.valid = false;
        } else {
          this.email.valid = true;
          this.emailpsw.valid = true;
        }
      } else {
        //check email field
        if (emailRegex.test(this.email.value)) {
          this.email.valid = true;
          this.emailpsw.valid = true;
        } else {
          this.email.valid = false;
          this.emailpsw.valid = false;
        }
      }
      this.checkEmail();
    }
  }

  async checkEmail() {
    if (!this.checkingEmail) {
      this.checkingEmail = true;
      if (this.emailpsw.valid) {
        await SystemService.presentLoading("searching");
        const methods = await AuthService.fetchSignInMethodsForEmail(
          this.emailpsw.value
        );
        this.disablePswFields = false;
        this.disableEmailLinkFields = false;
        this.disableGoogle = false;
        this.disableFacebook = true; //false;
        this.disableApple = false;
        if (methods.length == 0) {
          //new user
          this.newUserRegistration = true;
          //this.retypepsw.valid = false;
        } else {
          this.newUserRegistration = false;
          //this.retypepsw.valid = true;
          //enable password fields for emailLink and Password methods
          this.disablePswFields = !methods.includes("password");
          this.disableEmailLinkFields = !methods.includes("emailLink");
          this.disableFacebook = true; //!methods.includes("facebook.com");
          this.disableApple = !methods.includes("apple.com");
          this.disableGoogle = !methods.includes("google.com");
          /*if (methods.includes("facebook.com")) {
            //remove facebook login and allow google or psw
            this.disablePswFields = true;
            this.disableGoogle = false;
          }
          if (methods.includes("apple.com") && isPlatform("android")) {
            //alert user for Apple
            const alert = await alertController.create({
              header: TranslationService.getTransl("login", "Login"),
              message: TranslationService.getTransl(
                "apple-login-error",
                "You previously logged-in using Apple Login. This service is not available on Android devices."
              ),
              buttons: [
                {
                  text: TranslationService.getTransl("ok", "OK"),
                },
              ],
            });
            alert.present();
          }*/
        }
        await SystemService.dismissLoading();
      } else {
        this.newUserRegistration = false;
        //this.retypepsw.valid = true;
        this.disablePswFields = false;
        this.disableGoogle = false;
        this.disableFacebook = true;
        this.disableApple = false;
      }
      if (this.newUserRegistration) this.checkRetypePassword();
      this.checkingEmail = false;
    }
  }

  checkRetypePassword() {
    this.passwordCheck = this.psw.value == this.retypepsw.value;
  }

  render() {
    return [
      <app-navbar color={Environment.getAppColor()} tag='login' text='Login' />,
      <ion-content
        scrollEvents
        onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
      >
        {Environment.isUdive() || Environment.isDecoplanner() ? (
          <app-banner
            scrollTopValue={this.scrollTop}
            heightPx={250}
            link='./assets/images/friendship2SM.jpg'
          ></app-banner>
        ) : undefined}
        <ion-grid>
          {!this.network ? (
            <ion-row>
              <ion-col>
                <ion-item color='danger'>
                  <ion-icon name='warning' slot='start'></ion-icon>
                  <ion-label>
                    <my-transl tag='no-network' text='Network not available!' />
                  </ion-label>
                </ion-item>
              </ion-col>
            </ion-row>
          ) : undefined}
          <ion-row>
            <ion-col>
              {this.trasteelLogin ? (
                [
                  <app-form-item
                    label-tag='email'
                    label-text='Email'
                    name='email'
                    lines='full'
                    input-type='email'
                    onFormItemChanged={(ev) => this.inputHandler(ev)}
                    disabled={!this.network}
                    debounce={500}
                    validator={["required", "email"]}
                  ></app-form-item>,
                  <ion-text class='ion-padding-start small'>
                    Only emails @trasteel.com or @trasteelnetwork.com are
                    accepted.
                  </ion-text>,
                  !this.disableEmailLinkFields
                    ? [
                        <ion-button
                          margin-top
                          expand='block'
                          disabled={!this.email.valid || !this.network}
                          onClick={() => this.sendLink()}
                        >
                          <my-transl
                            tag='login-email'
                            text={
                              (this.newUserRegistration
                                ? "Register"
                                : "Login") + " with Email Link"
                            }
                          ></my-transl>
                        </ion-button>,
                        !this.disablePswFields
                          ? [
                              <ion-item-divider></ion-item-divider>,
                              <ion-item-divider>
                                <ion-label>
                                  <p class='centered'>- or type password -</p>
                                </ion-label>
                              </ion-item-divider>,
                            ]
                          : undefined,
                      ]
                    : undefined,
                ]
              ) : (
                <app-form-item
                  label-tag='email'
                  label-text='Email'
                  name='emailpsw'
                  lines='full'
                  input-type='email'
                  onFormItemChanged={(ev) => this.inputHandler(ev)}
                  disabled={!this.network}
                  debounce={500}
                  validator={["required", "email"]}
                ></app-form-item>
              )}
              {!this.disablePswFields
                ? [
                    <app-form-item
                      label-tag='password'
                      label-text='Password'
                      name='psw'
                      lines='full'
                      input-type='password'
                      onFormItemChanged={(ev) => this.inputHandler(ev)}
                      disabled={!this.network}
                      validator={["required"]}
                    ></app-form-item>,
                    this.newUserRegistration ? (
                      <app-form-item
                        label-tag='retype-password'
                        label-text='Re-type Password'
                        name='retypepsw'
                        lines='full'
                        input-type='password'
                        onFormItemChanged={(ev) => this.inputHandler(ev)}
                        disabled={!this.network}
                        validator={["required"]}
                      ></app-form-item>
                    ) : undefined,
                    !this.passwordCheck ? (
                      <my-transl
                        class='validation-error'
                        tag='password-error'
                        text='Passwords are not the same'
                      ></my-transl>
                    ) : undefined,
                    <ion-button
                      margin-top
                      expand='block'
                      disabled={
                        !this.emailpsw.valid ||
                        !this.psw.valid ||
                        !this.retypepsw.valid ||
                        !this.network ||
                        !this.passwordCheck
                      }
                      onClick={() => this.loginWithEmail()}
                    >
                      {!this.emailpsw.valid && !this.newUserRegistration
                        ? TranslationService.getTransl(
                            "login-emailpsw",
                            "Login/Register with Email and Password"
                          )
                        : this.newUserRegistration
                          ? TranslationService.getTransl(
                              "register-emailpsw",
                              "Register with Email and Password"
                            )
                          : TranslationService.getTransl(
                              "login-only-emailpsw",
                              "Login with Email and Password"
                            )}
                    </ion-button>,
                  ]
                : undefined}
            </ion-col>
          </ion-row>
          {!this.disablePswFields &&
          !this.newUserRegistration &&
          this.emailpsw.valid ? (
            <ion-row>
              <ion-col class='ion-text-right'>
                <a onClick={() => this.forgotPsw()}>
                  <my-transl
                    tag='forgot-psw'
                    text='Forgot password'
                  ></my-transl>
                </a>
              </ion-col>
            </ion-row>
          ) : undefined}
          {!this.trasteelLogin
            ? [
                <ion-row>
                  <ion-col class='ion-text-center'>
                    {!this.disablePswFields &&
                    !this.disableGoogle &&
                    !this.disableFacebook &&
                    !this.disableApple ? (
                      <p>- or -</p>
                    ) : undefined}
                  </ion-col>
                </ion-row>,

                !this.disableGoogle ? (
                  <ion-row>
                    <ion-col>
                      <ion-button
                        expand='block'
                        onClick={() => this.googleLogin()}
                        disabled={!this.network}
                        class='google'
                      >
                        <ion-icon name='logo-google' slot='start'></ion-icon>
                        {(this.newUserRegistration ? "Register" : "Login") +
                          " with Google"}
                      </ion-button>
                    </ion-col>
                  </ion-row>
                ) : undefined,
                !this.disableApple && !SystemService.isAndroid() ? (
                  <ion-row>
                    <ion-col>
                      <ion-button
                        expand='block'
                        onClick={() => this.appleLogin()}
                        disabled={!this.network}
                        class='apple'
                      >
                        <ion-icon name='logo-apple' slot='start'></ion-icon>
                        {(this.newUserRegistration ? "Register" : "Login") +
                          " with Apple"}
                      </ion-button>
                    </ion-col>
                  </ion-row>
                ) : undefined,
              ]
            : undefined}
        </ion-grid>
      </ion-content>,
    ];
  }
}
