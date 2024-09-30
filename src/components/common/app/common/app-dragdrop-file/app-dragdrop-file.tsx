import {
  Component,
  h,
  Element,
  Event,
  EventEmitter,
  Prop,
  State,
} from "@stencil/core";
import { alertController } from "@ionic/core";
import { TranslationService } from "../../../../../services/common/translations";
import { round } from "lodash";
@Component({
  tag: "app-dragdrop-file",
  styleUrl: "app-dragdrop-file.scss",
})
export class AppDragdropFile {
  @Element() el: HTMLElement;
  form: HTMLFormElement;
  dropArea: any;
  inputElement: HTMLInputElement;
  @Event() fileSelected: EventEmitter<File>;
  @Prop() fileType: string;
  @Prop() fileTypes: string[];
  @Prop() autoOpen = false; //open file box at startup
  @Prop() file: File;
  @State() selectedFile: File;

  componentWillLoad() {
    if (this.file) {
      this.handleFiles([this.file]);
    }
  }
  componentDidLoad() {
    // ************************ Drag and drop ***************** //
    this.dropArea = this.el.querySelector("#drop-area");
    this.inputElement = this.el.querySelector("#fileElem");
    this.autoOpen ? this.inputElement.click() : undefined;
    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.dropArea.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach((eventName) => {
      this.dropArea.addEventListener(
        eventName,
        () => {
          this.dropArea.classList.add("highlight");
        },
        false
      );
    });
    ["dragleave", "drop"].forEach((eventName) => {
      this.dropArea.addEventListener(
        eventName,
        () => {
          this.dropArea.classList.remove("highlight");
        },
        false
      );
    });

    // Handle dropped files
    this.dropArea.addEventListener(
      "drop",
      (e) => {
        const dt = e.dataTransfer;
        this.handleFiles(dt.files);
      },
      false
    );
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  async handleFiles(file) {
    this.selectedFile = null;
    if (file.target) {
      //coming from button click
      this.selectedFile = file.target.files[0];
    } else {
      this.selectedFile = file[0];
    }

    let test = false;

    if (this.fileType) {
      const regex = new RegExp("^" + this.fileType + "\\/\\w+");
      // /^image\/\w+/.test(uploadUrl.type)
      test = regex.test(this.selectedFile.type);
    } else {
      test = this.fileTypes.includes(this.selectedFile.type);
    }

    if (test) {
      this.fileSelected.emit(this.selectedFile);
    } else {
      this.selectedFile = null;
      const alert = await alertController.create({
        header: TranslationService.getTransl("select-file", "Select a File"),
        message:
          TranslationService.getTransl(
            "select-file-message",
            "Please select a file of type: "
          ) + (this.fileType ? this.fileType : this.fileTypes.join(", ")),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              this.inputElement.click();
            },
          },
        ],
      });
      alert.present();
    }
  }

  render() {
    return (
      <div class='drop-area-container'>
        <div id='drop-area'>
          <p>
            {this.selectedFile ? (
              [
                <ion-note>{this.selectedFile.name}</ion-note>,
                <br />,
                <ion-note>
                  {round(this.selectedFile.size / 1024 / 1024, 1)}MB
                </ion-note>,
              ]
            ) : (
              <my-transl
                tag='dragdrop-file'
                text='Upload a file with the file dialog or by dragging and dropping the file onto the dashed region'
              />
            )}
          </p>
        </div>
        <form class='my-form'>
          <input
            type='file'
            id='fileElem'
            accept={
              this.fileType
                ? this.fileType + "/*"
                : this.fileTypes && this.fileTypes.length > 0
                  ? this.fileTypes.join(",")
                  : "*/*"
            }
            onClick={() => {
              return false;
            }}
            onChange={(ev) => this.handleFiles(ev)}
          />
          <label id='labelElem' class='button' htmlFor='fileElem'>
            <my-transl tag='select-file' text='Select a File' />
          </label>
        </form>
      </div>
    );
  }
}
