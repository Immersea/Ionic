import {Network} from "@capacitor/network";
import {Component, h, State} from "@stencil/core";
import {Environment} from "../../../../../global/env";
import {InputValidator} from "../../../../../interfaces/interfaces";
import {UserService} from "../../../../../services/common/user";

@Component({
  tag: "page-support",
  styleUrl: "page-support.scss",
})
export class PageSupport {
  @State() email: InputValidator = {
    name: "email",
    valid: false,
    value: "",
  };
  @State() subject: InputValidator = {
    name: "subject",
    valid: false,
    value: "",
  };
  @State() body: InputValidator = {
    name: "body",
    valid: false,
    value: "",
  };
  @State() network = false;
  @State() send = false;
  @State() scrollTop = 0;

  emailSubject: string;
  emailBody: string;

  componentWillLoad() {
    Network.getStatus().then((status) => {
      if (status.connected) {
        this.network = true;
      } else {
        this.network = false;
      }
    });
    this.email.value =
      UserService && UserService.userProfile
        ? UserService.userProfile.email
        : "";
    this.email.valid = true;
  }

  inputHandler(event) {
    this[event.detail.name] = event.detail;
  }

  checkFields() {
    if (this.email.valid && this.subject.valid && this.body.valid) {
      this.send = true;
    } else {
      this.send = false;
    }
    this.emailSubject = encodeURI(
      "[Mobile Decoplanner support] " + this.subject.value
    );
    this.emailBody = encodeURI(
      "User:\n" +
        this.email.value +
        (UserService.userProfile && UserService.userProfile.uid
          ? " (id: " + UserService.userProfile.uid + ")"
          : "") +
        "\n\n\nProblem:\n" +
        this.body.value
    );
  }

  messagesent() {
    this.subject.value = "";
    this.subject.valid = false;
    this.body.value = "";
    this.body.valid = false;
    this.checkFields();
  }

  render() {
    return [
      <ion-header>
        <app-navbar
          tag="support"
          text="Support"
          color={Environment.getAppColor()}
        ></app-navbar>
      </ion-header>,

      <ion-content
        scrollEvents
        onIonScroll={(ev) => (this.scrollTop = ev.detail.scrollTop)}
      >
        <app-banner
          scrollTopValue={this.scrollTop}
          heightPx={250}
          link="./assets/images/Jarrod-Stargate.jpg"
        ></app-banner>
        <app-form-item
          label-tag="email"
          label-text="Email"
          name="email"
          lines="full"
          value={this.email.value}
          input-type="email"
          onFormItemChanged={(ev) => this.inputHandler(ev)}
          onIsValid={() => this.checkFields()}
          validator={["required", "email"]}
        ></app-form-item>
        <app-form-item
          label-tag="subject"
          label-text="Subject"
          name="subject"
          lines="full"
          value={this.subject.value}
          input-type="text"
          onFormItemChanged={(ev) => this.inputHandler(ev)}
          onIsValid={() => this.checkFields()}
          validator={[
            "required",
            {
              name: "length",
              options: {min: 5, max: null},
            },
          ]}
        ></app-form-item>
        <app-form-item
          label-tag="text"
          label-text="Text"
          name="body"
          lines="full"
          value={this.body.value}
          input-type="text"
          text-rows="10"
          onFormItemChanged={(ev) => this.inputHandler(ev)}
          onIsValid={() => this.checkFields()}
          validator={[
            "required",
            {
              name: "length",
              options: {min: 10, max: null},
            },
          ]}
        ></app-form-item>
        <ion-button
          expand="block"
          href={
            "mailto:decoplan@gue.com?subject=" +
            this.emailSubject +
            "&body=" +
            this.emailBody
          }
          onClick={() => this.messagesent()}
          disabled={!this.network || !this.send}
        >
          <ion-icon name="send" slot="start"></ion-icon>
          <my-transl tag="send" text="Send"></my-transl>
        </ion-button>
      </ion-content>,
    ];
  }
}
