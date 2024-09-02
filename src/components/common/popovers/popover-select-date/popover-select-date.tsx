import {Component, h, Host, Element, Prop, State} from "@stencil/core";
import {Environment} from "../../../../global/env";
import {toZonedTime} from "date-fns-tz";
import {format, formatISO, isValid, parse} from "date-fns";
import {showDate} from "../../../../helpers/utils";
import {Maskito} from "@maskito/core";
import {
  maskitoDateOptionsGenerator,
  maskitoDateTimeOptionsGenerator,
} from "@maskito/kit";

@Component({
  tag: "popover-select-date",
  styleUrl: "popover-select-date.scss",
})
export class PopoverSelectDate {
  @Element() el: HTMLElement;
  @State() inputValue: string;

  @Prop() value: string;
  @Prop() labelTag?: string;
  @Prop() labelText?: string;
  @Prop() labelReplace?: any;
  @Prop() appendText?: any;
  @Prop() datePresentation?:
    | "date"
    | "date-time"
    | "month"
    | "month-year"
    | "time"
    | "time-date"
    | "year" = "date";
  @Prop() preferWheel?: boolean = false; //prefer wheel type for dates
  @Prop() showDateTitle?: boolean = true; //show date title for dates
  @Prop() maxDate?: string;
  localTime: Date;
  @State() updateView = true;
  targetTimeZone: string;
  popover: HTMLIonPopoverElement;
  maskedInput: Maskito;

  componentWillLoad() {
    // The target timezone, i.e., the user's local timezone
    this.targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Convert the provided date string (in the original timezone) to the user's local time
    this.setLocalTime(this.value);
    this.popover = this.el.closest("ion-popover");
  }
  componentDidLoad() {
    this.initializeMask();
  }

  disconnectedCallback() {
    this.maskedInput.destroy();
  }

  setLocalTime(date) {
    // Parsing as UTC or specified timezone
    this.localTime = toZonedTime(new Date(date), this.targetTimeZone);
    this.inputValue = showDate(
      formatISO(this.localTime),
      this.datePresentation,
      true
    );
    this.updateView = !this.updateView;
  }

  async initializeMask() {
    const optionsDate = maskitoDateOptionsGenerator({
      mode: "dd/mm/yyyy",
      separator: "/",
    });
    const optionsDateTime = maskitoDateTimeOptionsGenerator({
      dateMode: "dd/mm/yyyy",
      timeMode: "HH:MM",
      dateSeparator: "/",
    });
    const ionInput = document.querySelector(
      "#dateInput"
    ) as HTMLIonInputElement;
    const nativeEl = await ionInput.getInputElement();
    this.maskedInput = new Maskito(
      nativeEl,
      this.datePresentation == "date" ? optionsDate : optionsDateTime
    );
  }

  handleChange(ev) {
    this.value = ev.detail.value;
    this.setLocalTime(this.value);
  }

  handleInputChange(ev) {
    const inputDate = ev.target.value;
    const parsedDate = parse(
      inputDate,
      this.datePresentation == "date" ? "dd/MM/yyyy" : "dd/MM/yyyy HH:ss",
      new Date()
    );
    if (isValid(parsedDate)) {
      this.value = formatISO(parsedDate);
      this.setLocalTime(this.value);
    }
  }

  close() {
    this.popover.dismiss();
  }
  save() {
    //save in database in UTC format
    const utcDate = toZonedTime(this.value, "UTC");
    const formatDate = format(utcDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    this.popover.dismiss(formatDate);
  }

  render() {
    return (
      <Host>
        <ion-content>
          <ion-datetime
            color={Environment.getAppColor()}
            presentation={this.datePresentation}
            prefer-wheel={this.preferWheel}
            show-default-title={!this.showDateTitle}
            onIonChange={(ev) => this.handleChange(ev)}
            max={this.maxDate}
            value={formatISO(this.localTime)}
          >
            {this.showDateTitle ? (
              <span slot="title">
                {this.labelTag ? (
                  <my-transl
                    tag={this.labelTag}
                    text={this.labelText}
                    replace={this.labelReplace}
                  ></my-transl>
                ) : this.labelText ? (
                  this.labelText
                ) : undefined}
                {this.appendText ? this.appendText : undefined}
              </span>
            ) : undefined}
          </ion-datetime>
          {this.datePresentation == "date-time" ||
          this.datePresentation == "time-date" ||
          this.datePresentation == "date" ? (
            <ion-item>
              <ion-input
                id="dateInput"
                fill="outline"
                type="text"
                debounce={300}
                inputmode="numeric"
                value={this.inputValue}
                onIonInput={(ev) => this.handleInputChange(ev)}
              ></ion-input>
            </ion-item>
          ) : undefined}
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
