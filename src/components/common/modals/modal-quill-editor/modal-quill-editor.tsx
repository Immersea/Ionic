import {
  Component,
  Event,
  EventEmitter,
  h,
  Prop,
  State,
  Watch,
} from "@stencil/core";
import {ArticleMultilanguage} from "../../../../interfaces/interfaces";
import {SystemService} from "../../../../services/common/system";
import {Environment} from "../../../../global/env";
import {modalController} from "@ionic/core";
import {ImmerseaLocation} from "../../../../interfaces/immersea/immerseaLocation";

@Component({
  tag: "modal-quill-editor",
  styleUrl: "modal-quill-editor.scss",
})
export class ModalQuillEditor {
  @Prop({mutable: true}) languageSelected: string = "en";
  @Prop({mutable: true}) updateView = false;
  @Prop() immerseaLocation: ImmerseaLocation;
  @Prop() readOnly = false;
  languages: any;
  editor: any;
  @State() article: ArticleMultilanguage;
  @State() selectedArticle;
  @Event() edit: EventEmitter<any>;

  @Watch("updateView")
  refresh() {
    this.selectedArticle = this.article[this.languageSelected];
  }

  componentWillLoad() {
    this.article = this.immerseaLocation.article;
    this.languages = SystemService.getLanguages();
    if (!this.article) this.article = {};
    this.languages.map((lang) => {
      //set all languages
      if (!this.article[lang.value]) {
        this.article[lang.value] = {ops: [{insert: ""}]};
      }
    });
    this.selectLanguage();
  }

  initEditor(ev) {
    this.editor = ev.detail;
  }

  selectLanguage(ev?) {
    if (ev && ev.detail.value) {
      this.languageSelected = ev.detail.value;
    }
    this.refresh();
  }

  getContents(ev) {
    if (ev.detail.event == "text-change" && ev.detail.content) {
      this.article[this.languageSelected] = ev.detail.content;
      this.refresh();
    }
  }

  async save() {
    return modalController.dismiss(this.article);
  }

  async cancel() {
    return modalController.dismiss();
  }

  render() {
    return [
      !this.readOnly ? (
        <ion-header>
          <ion-toolbar color={Environment.getAppColor()}>
            <ion-title>Editor</ion-title>
          </ion-toolbar>
        </ion-header>
      ) : undefined,
      <ion-header>
        <ion-toolbar color={Environment.getAppColor()}>
          <ion-segment
            mode="md"
            scrollable
            onIonChange={(ev) => this.selectLanguage(ev)}
            value={this.languageSelected}
          >
            {this.languages.map((lang) => (
              <ion-segment-button value={lang.value} layout="icon-start">
                <ion-icon
                  class={
                    "flag-icon flag-icon-" +
                    (lang.countryCode == "en" ? "gb" : lang.countryCode)
                  }
                ></ion-icon>
                <ion-label>{lang.label}</ion-label>
              </ion-segment-button>
            ))}
          </ion-segment>
          {this.readOnly ? (
            <ion-button slot="end" onClick={() => this.edit.emit(true)}>
              <ion-label>EDIT</ion-label>
            </ion-button>
          ) : undefined}
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        {!this.readOnly ? (
          <quill-editor
            immerseaLocation={this.immerseaLocation}
            content={JSON.stringify(this.selectedArticle)}
            format="json"
            theme="snow"
            onEditorInit={(ev) => this.initEditor(ev)}
            onEditorChange={(ev) => this.getContents(ev)}
          ></quill-editor>
        ) : (
          <quill-view
            content={JSON.stringify(this.selectedArticle)}
            format="json"
            theme="snow"
          ></quill-view>
        )}
      </ion-content>,
      !this.readOnly ? (
        <app-modal-footer
          onCancelEmit={() => this.cancel()}
          onSaveEmit={() => this.save()}
        />
      ) : undefined,
    ];
  }
}
