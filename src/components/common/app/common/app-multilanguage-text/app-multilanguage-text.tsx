import {Component, h, Host, Prop, State} from "@stencil/core";
import {TextMultilanguage} from "../../../../../interfaces/interfaces";
import {UserService} from "../../../../../services/common/user";

@Component({
  tag: "app-multilanguage-text",
  styleUrl: "app-multilanguage-text.scss",
})
export class AppMultilanguageText {
  @Prop() text: TextMultilanguage;
  @State() selectedLanguage = "en";

  componentWillLoad() {
    this.selectedLanguage = UserService.userSettings.getLanguage();
    const textLanguages = Object.keys(this.text).sort();
    //check if user language is available
    if (
      textLanguages &&
      textLanguages.length > 0 &&
      !textLanguages.includes(this.selectedLanguage)
    ) {
      //not available - check if english is available
      if (textLanguages.includes("en")) {
        this.selectedLanguage = "en";
      } else {
        this.selectedLanguage = textLanguages[0];
      }
    }
  }

  changeSelectedLanguage(ev) {
    if (ev.detail) {
      this.selectedLanguage = ev.detail;
    }
  }

  render() {
    return (
      <Host>
        <ion-grid>
          <ion-row>
            <ion-col>
              {
                //show according to user language
                this.text[this.selectedLanguage]
              }
            </ion-col>
            <ion-col size="1">
              <app-language-picker
                selectedLangCode={this.selectedLanguage}
                picker
                selectOnly
                onLanguageChanged={(ev) => this.changeSelectedLanguage(ev)}
              ></app-language-picker>
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host>
    );
  }
}
