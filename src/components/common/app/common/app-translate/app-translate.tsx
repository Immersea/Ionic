import { Component, State, Prop, h, Watch, Host } from "@stencil/core";
import { TranslationService } from "../../../../../services/common/translations";
import { DocumentData } from "firebase/firestore";

@Component({
  tag: "my-transl",
  styleUrl: "app-translate.css",
  shadow: true,
})
export class AppTranslate {
  @Prop() tag: string;
  @Prop() text: string;
  @Prop() appendText: string;
  @Prop() replace: any;
  @Prop() isLabel: boolean = false;
  @State() translations: DocumentData;
  @State() translation: string;

  @Watch("tag")
  @Watch("appendText")
  @Watch("replace")
  update() {
    this.updateTranslation();
  }

  componentWillLoad() {
    //subscribe to translation service to receive updates on the language or translations
    TranslationService.updatedTranslation.subscribe(() => {
      this.updateTranslation();
    });
    this.updateTranslation();
  }

  updateTranslation() {
    this.translation =
      TranslationService.getTransl(this.tag, this.text, this.replace) +
      (this.appendText ? this.appendText : "");
  }
  render() {
    return this.isLabel ? (
      <Host>
        <ion-label>{this.translation}</ion-label>
      </Host>
    ) : (
      <Host>{this.translation}</Host>
    );
  }
}
