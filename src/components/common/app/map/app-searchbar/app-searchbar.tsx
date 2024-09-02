import {
  Component,
  h,
  Prop,
  Host,
  Event,
  EventEmitter,
  Element,
} from "@stencil/core";
import {TranslationService} from "../../../../../services/common/translations";
import {debounce} from "lodash";

@Component({
  tag: "app-searchbar",
  styleUrl: "app-searchbar.scss",
})
export class AppSearchbar {
  @Element() el: HTMLElement;
  @Prop() floating = false;
  @Event() inputChanged: EventEmitter<string>;
  @Event() inputBlur: EventEmitter<string>;
  inputElement: HTMLInputElement;
  placeholder: string;
  value: string;
  timeoutId = null;

  componentWillLoad() {
    this.placeholder = TranslationService.getTransl("search", "Search");
  }

  componentDidLoad() {
    this.inputElement = this.el.querySelector("#input-search");
  }

  // Create a debounced method using lodash's debounce
  debouncedUpdate = debounce((value: string) => {
    this.value = value;
    this.inputChanged.emit(this.value);
    this.inputElement.blur();
  }, 800); // Delay in milliseconds

  handleChange(event: Event) {
    // Event handler that calls the debounced method
    const value = (event.target as HTMLInputElement).value;
    this.debouncedUpdate(value);
  }

  handleBlur(ev) {
    //change focus
    //this.inputChanged.emit(this.value);
    ev.target.value = "";
  }

  handleKey(key) {
    //blur on Enter key
    if (key.code === "Enter") {
      key.preventDefault();
      this.inputElement.blur();
    }
  }

  render() {
    return (
      <Host>
        {this.floating ? (
          <div class="container">
            <input
              id="input-search"
              type="text"
              value={this.value}
              placeholder={this.placeholder + "..."}
              onInput={(ev) => this.handleChange(ev)}
              onChange={(ev) => this.handleBlur(ev)}
              onKeyUp={(ev) => this.handleKey(ev)}
            />
            <div class="search"></div>
          </div>
        ) : (
          <div></div>
        )}
      </Host>
    );
  }
}
