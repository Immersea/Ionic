import {
  Component,
  h,
  Prop,
  State,
  Watch,
  Event,
  EventEmitter,
} from "@stencil/core";
import {Translation} from "../../../../../interfaces/common/translations/translations";
import {RouterService} from "../../../../../services/common/router";
import {groupBy} from "lodash";

@Component({
  tag: "app-admin-translations",
  styleUrl: "app-admin-translations.scss",
})
export class AppAdminTranslations {
  @Prop({mutable: true}) translations: Translation[];
  @Prop({mutable: true}) language: string;
  @State() orderedTranslations: {
    false: Translation[];
    true: Translation[];
  } = {false: [], true: []};
  groups = ["false", "true"];
  @Event() translationChanged: EventEmitter<Translation>;
  @State() updateView = false;

  @Watch("language")
  updateLanguage() {
    this.updateTranslations();
  }

  @Watch("translations")
  updateTranslations() {
    if (this.translations && this.translations.length > 0) {
      const grouped = groupBy(
        this.translations,
        "isTranslated." + this.language
      );
      this.orderedTranslations = {
        false: grouped.false ? grouped.false : [],
        true: grouped.true ? grouped.true : [],
      };
      this.updateView = !this.updateView;
    }
  }

  async updateTranslation(translation: Translation) {
    const popover = await RouterService.openPopover(
      "popover-edit-translation",
      {language: this.language, originalTranslation: translation}
    );
    popover.onDidDismiss().then((res) => {
      if (res && res.data) {
        this.translationChanged.emit(res.data);
      }
    });
  }

  render() {
    return (
      <ion-grid>
        <ion-row>
          <ion-col size="1"></ion-col>
          <ion-col class="ion-text-start">ID</ion-col>
          <ion-col size="1">
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </ion-col>
          <ion-col class="ion-text-start">Original</ion-col>
          <ion-col size="1">
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </ion-col>
          <ion-col class="ion-text-start">Translation</ion-col>
        </ion-row>
        {this.groups.map((isTranslated) => [
          <ion-row>
            <ion-col>
              <ion-list-header lines="full">
                {isTranslated === "true"
                  ? "Already Translated"
                  : "To Be Translated"}
                <span></span>
                <ion-badge>
                  {this.orderedTranslations[isTranslated].length}
                </ion-badge>
              </ion-list-header>
            </ion-col>
          </ion-row>,
          this.orderedTranslations[isTranslated].length > 0
            ? this.orderedTranslations[isTranslated].map((translation) => (
                <ion-row>
                  <ion-col>
                    <ion-item
                      button
                      detail={false}
                      onClick={() => this.updateTranslation(translation)}
                      class="ion-no-padding"
                    >
                      <ion-grid>
                        <ion-row>
                          <ion-col size="1">
                            <ion-icon
                              name={
                                translation.isTranslated[this.language]
                                  ? "checkmark"
                                  : "close"
                              }
                              color={
                                translation.isTranslated[this.language]
                                  ? "success"
                                  : "danger"
                              }
                            ></ion-icon>
                          </ion-col>
                          <ion-col class="ion-text-start">
                            {translation.id}
                          </ion-col>
                          <ion-col size="1">
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                          </ion-col>
                          <ion-col class="ion-text-start">
                            {translation.input}
                          </ion-col>
                          <ion-col size="1">
                            <ion-icon name="arrow-forward-outline"></ion-icon>
                          </ion-col>
                          <ion-col class="ion-text-start">
                            {translation.translated
                              ? translation.translated[this.language]
                              : undefined}
                          </ion-col>
                        </ion-row>
                      </ion-grid>
                    </ion-item>
                  </ion-col>
                </ion-row>
              ))
            : undefined,
        ])}
      </ion-grid>
    );
  }
}
