import { popoverController } from "@ionic/core";
import { Component, Element, Prop, State, h } from "@stencil/core";
import { cloneDeep, find, isObject, isString } from "lodash";

@Component({
  tag: "app-select-search",
  styleUrl: "app-select-search.scss",
  shadow: true,
})
export class AppSelectSearch {
  @Element() el: HTMLElement;
  @Prop() label: { tag: string; text: string };
  @Prop() labelAddText: string;
  @Prop() lines: "inset" | "full" | "none";
  @Prop() selectFn: any;
  @Prop() selectOptions: any[];
  @Prop({ mutable: true }) value: string;
  @Prop() placeholder: string;
  @Prop() selectValueId: string;
  @Prop() selectValueText: string[];
  @Prop() disabled = false;
  @State() updateView = false;

  componentWillLoad() {}

  async openSearchPopover() {
    const popover = await popoverController.create({
      component: "popover-select-search",
      componentProps: {
        label: this.label,
        selectOptions: this.selectOptions,
        selectValueText: this.selectValueText,
        selectValueId: this.selectValueId,
        value: this.value,
        placeholder: this.placeholder,
      },
      event: null,
      translucent: true,
    });
    popover.onDidDismiss().then(async (ev) => {
      if (ev && ev.data) {
        this.value = ev.data[this.selectValueId];
        //execute function and return selected value id - return same ev as ion-select
        this.selectFn({ detail: { value: this.value } });
        this.updateView = !this.updateView;
      }
    });
    popover.present();
  }

  getTextValue() {
    const item = find(
      this.selectOptions,
      (x) => x[this.selectValueId] == this.value
    );
    let text = this.value;
    if (item) {
      text = cloneDeep(item);
    }
    let ret = null;
    for (let index = 0; index < this.selectValueText.length; index++) {
      const value = this.selectValueText[index];
      if (isString(text[value])) {
        ret = (ret ? ret + "-" : "") + text[value];
      } else if (isObject(text[value])) {
        index++;
        //in case of TextMultiLanguage the second text is the language
        ret = (ret ? ret + "-" : "") + text[value][this.selectValueText[index]];
      }
    }
    return ret;
  }

  render() {
    return (
      <ion-item
        button
        lines={this.lines}
        disabled={this.disabled}
        onClick={() => this.openSearchPopover()}
      >
        <ion-label>
          {this.value
            ? [
                this.label ? (
                  <p
                    style={{
                      "font-size": "0.75rem",
                      color: "black",
                    }}
                  >
                    <my-transl
                      tag={this.label.tag}
                      text={this.label.text}
                    ></my-transl>
                    {this.labelAddText ? this.labelAddText : ""}
                  </p>
                ) : undefined,
                <h2>{this.getTextValue()}</h2>,
              ]
            : this.label
              ? [
                  <my-transl
                    tag={this.label.tag}
                    text={this.label.text}
                  ></my-transl>,
                  this.labelAddText ? this.labelAddText : "",
                ]
              : undefined}
        </ion-label>
        <ion-icon name='caret-down' slot='end' size='small'></ion-icon>
      </ion-item>
    );
  }
}
