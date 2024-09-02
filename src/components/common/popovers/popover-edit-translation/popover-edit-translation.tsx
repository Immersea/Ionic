import {Component, h, Host, Prop, State} from "@stencil/core";
import {Translation} from "../../../../interfaces/common/translations/translations";
import {popoverController} from "@ionic/core";
import {cloneDeep} from "lodash";
@Component({
  tag: "popover-edit-translation",
  styleUrl: "popover-edit-translation.scss",
})
export class PopoverEditTranslation {
  @Prop() language: string;
  @Prop() originalTranslation: Translation;
  @State() translation: Translation;
  @State() translationChanged = false;

  componentWillLoad() {
    this.translation = cloneDeep(this.originalTranslation);
  }

  changeTranslation(ev) {
    this.translation.translated[this.language] = ev.detail.value;
    this.translationChanged = true;
  }

  close() {
    popoverController.dismiss();
  }

  save() {
    this.translation.isTranslated[this.language] = true;
    popoverController.dismiss(this.translation);
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-grid>
            <ion-row>
              <ion-col class="ion-text-center">
                <h2>{this.translation.input}</h2>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col class="ion-text-center">
                <ion-icon name="arrow-down-outline"></ion-icon>
              </ion-col>
            </ion-row>
            <ion-row>
              <ion-col class="ion-text-center">
                <ion-input
                  value={this.translation.translated[this.language]}
                  onIonChange={(ev) => this.changeTranslation(ev)}
                ></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
        <ion-footer>
          <app-modal-footer
            onCancelEmit={() => this.close()}
            onSaveEmit={() => this.save()}
          />
        </ion-footer>
      </Host>
    );
  }
}
