import {Component, h, Host, Element, Prop, State} from "@stencil/core";
import {popoverController} from "@ionic/core";
import {cloneDeep, includes, isObject, isString, toLower} from "lodash";
import {Environment} from "../../../../global/env";
@Component({
  tag: "popover-select-search",
  styleUrl: "popover-select-search.scss",
})
export class PopoverSelectSearch {
  @Element() el: HTMLElement;
  @Prop() selectOptions: any[];
  @Prop() selectValueText: string[];
  @Prop() placeholder: string = "Search";
  @Prop() selectValueId: string;
  @Prop() value: string;
  @State() filteredOptions: any;
  popover: HTMLIonPopoverElement;

  componentWillLoad() {
    this.popover = this.el.closest("ion-popover");
    this.filteredOptions = cloneDeep(this.selectOptions);
  }

  componentDidLoad() {
    const searchbar = this.el.querySelector("ion-searchbar");
    if (searchbar) {
      searchbar.componentOnReady().then(() => {
        setTimeout(() => {
          searchbar.setFocus();
        });
      });
    }
  }

  handleSearch(ev) {
    let searchString = "";
    const target = ev.target as HTMLIonSearchbarElement;
    if (target) searchString = target.value!.toLowerCase();
    this.filteredOptions = [];
    this.selectOptions.forEach((option) => {
      const text = this.getTextValue(option);
      if (includes(toLower(text), searchString)) {
        this.filteredOptions.push(option);
      }
    });
  }

  handleSelect(ev) {
    popoverController.dismiss(ev);
  }

  close() {
    popoverController.dismiss();
  }

  getTextValue(item) {
    let textValue = cloneDeep(item);
    let ret = null;
    for (let index = 0; index < this.selectValueText.length; index++) {
      const value = this.selectValueText[index];
      if (isString(textValue[value])) {
        ret = (ret ? ret + "-" : "") + textValue[value];
      } else if (isObject(textValue[value])) {
        index++;
        //in case of TextMultiLanguage the second text is the language
        ret =
          (ret ? ret + "-" : "") +
          textValue[value][this.selectValueText[index]];
      }
    }
    return ret;
  }

  render() {
    return (
      <Host>
        <ion-header translucent>
          <ion-toolbar>
            <ion-grid class="ion-no-padding">
              <ion-row>
                <ion-col size="10">
                  <ion-searchbar
                    animated={true}
                    debounce={250}
                    placeholder={this.placeholder}
                    onIonInput={(ev) => this.handleSearch(ev)}
                  ></ion-searchbar>
                </ion-col>
                <ion-col size="1">
                  <ion-button
                    color={Environment.getAppColor()}
                    icon-only
                    fill="clear"
                    onClick={this.close}
                  >
                    <ion-icon name="close"></ion-icon>
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            {this.filteredOptions.map((option) => (
              <ion-item
                button
                onClick={() => this.handleSelect(option)}
                class={
                  option[this.selectValueId] == this.value ? "boldText" : ""
                }
              >
                {option[this.selectValueId] == this.value ? (
                  <ion-icon name="checkmark"></ion-icon>
                ) : undefined}
                <ion-label>{this.getTextValue(option)}</ion-label>
              </ion-item>
            ))}
          </ion-list>
        </ion-content>
      </Host>
    );
  }
}
