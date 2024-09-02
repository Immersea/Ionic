import {actionSheetController} from "@ionic/core";
import {
  Component,
  h,
  State,
  Event,
  EventEmitter,
  Prop,
  Host,
  Watch,
} from "@stencil/core";
import {SystemService} from "../../../../../services/common/system";
import {TranslationService} from "../../../../../services/common/translations";

@Component({
  tag: "app-language-picker",
  styleUrl: "app-language-picker.scss",
})
export class AppLanguagePicker {
  @Event() languageChanged: EventEmitter;

  @Prop({mutable: true}) selectedLangCode: string = "en";
  @Prop() picker: boolean = false;
  @Prop() selectOnly: boolean = false;
  @Prop() iconOnly: boolean = false;

  listItems = [];

  @Watch("selectedLangCode")
  update() {
    this.selectLanguage();
  }

  @State() selectedItem: any = {label: "English", value: "en"};
  @State() updateView = false;

  @Event() clickedItem: EventEmitter;

  componentWillLoad() {
    this.listItems = SystemService.getLanguages();
    this.selectLanguage();
  }

  selectLanguage() {
    const item = this.listItems.find((x) => x.value == this.selectedLangCode);
    this.selectedItem = {...item};
    this.updateView = !this.updateView;
  }

  changeLang(ev) {
    this.selectedLangCode = ev.detail.value;
    this.selectLanguage();
    this.languageChanged.emit(ev.detail.value);
    this.updateView = !this.updateView;
  }

  async openLanguagePicker() {
    const buttons = [];
    SystemService.getLanguages().forEach((lang) => {
      buttons.push({
        text: lang.label,
        handler: () => {
          this.changeLang({detail: {value: lang.value}});
        },
      });
    });
    const action = await actionSheetController.create({
      header: TranslationService.getTransl("language", "Language"),
      buttons: buttons,
    });
    action.present();
  }

  render() {
    return (
      <Host>
        {this.picker
          ? this.selectOnly
            ? [
                <ion-button
                  icon-only
                  fill="clear"
                  slot="end"
                  onClick={() => this.openLanguagePicker()}
                >
                  <ion-icon
                    class={
                      "flag-icon flag-icon-" +
                      (this.selectedItem.countryCode == "en"
                        ? "gb"
                        : this.selectedItem.countryCode)
                    }
                  ></ion-icon>
                </ion-button>,
              ]
            : [
                <ion-item>
                  <ion-select
                    label={TranslationService.getTransl("language", "Language")}
                    interface="action-sheet"
                    onIonChange={(ev) => this.changeLang(ev)}
                    value={this.selectedItem.value}
                  >
                    {this.listItems.map((lang) => (
                      <ion-select-option value={lang.value}>
                        {lang.label}
                      </ion-select-option>
                    ))}
                  </ion-select>
                  <ion-icon
                    slot="end"
                    class={
                      "flag-icon flag-icon-" +
                      (this.selectedItem.countryCode == "en"
                        ? "gb"
                        : this.selectedItem.countryCode)
                    }
                  ></ion-icon>
                </ion-item>,
              ]
          : [
              <p>
                <ion-icon
                  class={
                    "flag-icon flag-icon-" +
                    (this.selectedItem.countryCode == "en"
                      ? "gb"
                      : this.selectedItem.countryCode)
                  }
                ></ion-icon>
                {!this.iconOnly ? "   " + this.selectedItem.label : ""}
              </p>,
            ]}
      </Host>
    );
  }
}
