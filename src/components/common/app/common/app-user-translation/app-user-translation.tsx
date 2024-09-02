import {
  Component,
  h,
  Event,
  EventEmitter,
  Prop,
  Host,
  State,
} from "@stencil/core";
import {actionSheetController} from "@ionic/core";
import {TranslationService} from "../../../../../services/common/translations";
import {SystemService} from "../../../../../services/common/system";
import {
  UserTranslationDoc,
  UserTranslation,
} from "../../../../../interfaces/common/translations/translations";
import {orderBy} from "lodash";

@Component({
  tag: "app-user-translation",
  styleUrl: "app-user-translation.scss",
})
export class AppUserTranslation {
  @Prop() userTranslation: UserTranslationDoc;
  @Prop() edit: boolean = true;
  @State() translations: UserTranslation[] = [];
  @Event() translationEmit: EventEmitter<UserTranslation>;

  componentWillLoad() {
    const translations = [];
    Object.keys(this.userTranslation).forEach((langId) => {
      translations.push(this.userTranslation[langId]);
    });
    this.translations = orderBy(translations, "langId");
  }

  async add() {
    const buttons = [];
    SystemService.getLanguages().forEach((lang) => {
      buttons.push({
        text: lang.label,
        handler: () => {
          this.addTranslation(lang.value);
        },
      });
    });
    const action = await actionSheetController.create({
      header: TranslationService.getTransl("language", "Language"),
      buttons: buttons,
    });
    action.present();
  }

  addTranslation(lang) {
    this.translations.push({
      lang: lang,
      text: "",
    });
  }

  remove(i) {
    this.translations.splice(i, 1);
  }

  render() {
    return (
      <Host>
        {this.translations.map((translation, i) => (
          <ion-item>
            <app-language-picker
              slot="start"
              selectedLangCode={translation.lang}
            ></app-language-picker>
            {this.edit ? (
              [
                <ion-textarea
                  value={translation.text}
                  rows={2}
                  inputmode="text"
                ></ion-textarea>,
                <ion-button
                  slot="end"
                  icon-only
                  fill="clear"
                  onClick={() => this.remove(i)}
                />,
              ]
            ) : (
              <ion-label>{translation.text}</ion-label>
            )}
          </ion-item>
        ))}
        {this.edit ? (
          <ion-item button onClick={() => this.add()}>
            <ion-icon name="add" slot="start" />
            <ion-label>
              <my-transl tag="add" text="Add"></my-transl>
            </ion-label>
          </ion-item>
        ) : undefined}
      </Host>
    );
  }
}
