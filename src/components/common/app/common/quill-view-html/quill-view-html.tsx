import { h, Component, Prop } from "@stencil/core";
import Quill from "quill/dist/quill.js";

@Component({
  tag: "quill-view-html",
  scoped: true,
  shadow: false,
  styleUrl: "./quill-view-html.css",
})
export class QuillViewHTMLComponent {
  @Prop() content: any;
  @Prop() theme: string = "snow";
  private themeClass: string = "ql-snow";
  @Prop() debug: string = "warn";

  quillEditor: any;
  editorElement: HTMLDivElement | HTMLPreElement;
  htmlContent: string;

  componentDidLoad() {
    let modules = {
      toolbar: false,
    };

    this.quillEditor = new Quill(this.editorElement, {
      debug: this.debug,
      modules: modules,
      readOnly: true,
      theme: this.theme || "snow",
    });

    this.editorElement.classList.add("quill-view");

    if (this.content) {
      this.setEditorContent(this.content);
      this.quillEditor["history"].clear();
    }
  }

  setEditorContent(value: any) {
    try {
      this.quillEditor.setContents(JSON.parse(value), "api");
    } catch (e) {
      this.quillEditor.setText(value, "api");
    }
    this.htmlContent = this.quillEditor.root.innerHTML;
    console.log("this.htmlContent", this.htmlContent);
  }

  render() {
    const classes = `ql-container ${this.themeClass} quill-view-html`;
    return (
      <div class={classes}>
        <div class='ql-editor' innerHTML={this.htmlContent}></div>
      </div>
    );
  }
}
