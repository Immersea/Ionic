import {
  Component,
  Prop,
  Event,
  EventEmitter,
  h,
  State,
  Method,
} from "@stencil/core";
import {
  Validator,
  getValidator,
  defaultValidator,
  ValidatorEntry,
} from "../../../../../validators";
import {
  InputValidator,
  TextMultilanguage,
} from "../../../../../interfaces/interfaces";
import {
  TextFieldTypes,
  alertController,
  popoverController,
} from "@ionic/core";
import { Keyboard } from "@capacitor/keyboard";
import { UserService } from "../../../../../services/common/user";
import { SystemService } from "../../../../../services/common/system";
import { TranslationService } from "../../../../../services/common/translations";
import { LocationIQ } from "../../../../../services/common/map";
import { cloneDeep } from "lodash";
import { Environment } from "../../../../../global/env";
import { showDate } from "../../../../../helpers/utils";

@Component({
  tag: "app-form-item",
  styleUrl: "app-form-item.scss",
  shadow: true,
})
export class AppFormItem {
  @Prop({ mutable: true }) value: string | TextMultilanguage | number | boolean;
  @Prop() labelTag?: string;
  @Prop() labelText?: string;
  @Prop() labelReplace?: any;
  @Prop() appendText?: any;
  @Prop() disabled?: boolean = false;
  @Prop() readonly?: boolean = false;
  @Prop() name: string;
  @Prop() textRows?: number;
  @Prop() inputType: TextFieldTypes | "boolean";
  @Prop({ mutable: true }) inputFormMode:
    | "decimal"
    | "email"
    | "none"
    | "numeric"
    | "search"
    | "tel"
    | "text"
    | "url"
    | undefined;
  @Prop() placeholder?: string;
  @Prop() color?: string;
  @Prop() forceInvalid?: boolean = false;
  @Prop() multiLanguage?: boolean = false;
  @Prop() datePresentation?:
    | "date"
    | "date-time"
    | "month"
    | "month-year"
    | "time"
    | "year" = "date";
  @Prop() preferWheel?: boolean = false; //prefer wheel type for dates
  @Prop() showDateTitle?: boolean = true; //show date title for dates
  @Prop() maxDate?: string;
  @Prop() labelPosition?: "fixed" | "stacked" | "floating" = "floating";
  @Prop() lines?: "none" | "full" | "inset" = "none";
  @Prop() inputStep: string = "0.1";
  @Prop() showItem?: boolean = true;
  @Prop() shortItem?: boolean = false;
  @Prop() debounce?: number = 300;
  @Prop() selectOnFocus?: boolean = false;

  isAddess = false;

  @Prop() validator?: Array<string | ValidatorEntry | Validator<string>>;

  @Event() formItemChanged: EventEmitter<InputValidator>;
  @Event() formItemBlur: EventEmitter<InputValidator>;
  @Event() formLocationsFound: EventEmitter<any>;
  @Event() formLocationSelected: EventEmitter<LocationIQ>;
  @Event() isValid: EventEmitter<boolean>;
  @Event() updateSlider: EventEmitter<boolean>;

  @State() selectedLanguage = "en";
  availableLanguages: string[] = [];
  @State() openAccordion = false;
  @State() updateView = false;

  showError = false;
  @State() gotFocus = false;

  previousValue: any;
  inputField = null;

  @Method()
  //used to force reset a value in case of changes of the "value" on the main DOM
  async forceResetValue(value) {
    this.value = value;
    this.previousValue = value;
  }

  _validator: Validator<string> = defaultValidator;

  _valid: boolean;

  componentWillLoad() {
    if (this.validator) this._validator = getValidator<string>(this.validator);
    if (this.validator && this.validator.includes("address")) {
      this.isAddess = true;
    }

    if (this.inputType !== "boolean" && !this.value) {
      if (this.multiLanguage) {
        this.value = { en: "" };
      }
      if (!this.inputFormMode) {
        if (this.inputType == "number") {
          this.inputFormMode = "decimal";
        } else if (this.inputType == "email") {
          this.inputFormMode = "email";
        } else {
          this.inputFormMode = "text";
        }
      }
    }
    if (this.multiLanguage) {
      this.selectedLanguage = UserService.userSettings.getLanguage();
      //check if language is available in the text
      const textLanguages = Object.keys(this.value).sort();
      if (
        textLanguages &&
        textLanguages.length > 0 &&
        !textLanguages.includes(this.selectedLanguage)
      ) {
        this.selectedLanguage = textLanguages[0];
      }
      const availableLanguages = SystemService.getLanguages();
      this.availableLanguages.push(this.selectedLanguage);
      availableLanguages.forEach((language) => {
        if (language.value != this.selectedLanguage) {
          this.availableLanguages.push(language.value);
        }
      });
    }
  }

  componentWillUpdate() {
    if (this.validator) this._validator = getValidator<string>(this.validator);
  }

  handleChange(ev, language?) {
    if (this.inputType == "boolean") {
      if (
        ev.detail &&
        (ev.detail.checked === true || ev.detail.checked === false)
      ) {
        this.showError = false;
        this._valid = true;
        this.isValid.emit(this._valid);
        this.value = ev.detail.checked;
        if (this.value !== this.previousValue) {
          const item = this.emitFormItem();
          this.formItemChanged.emit(item);
          this.previousValue = cloneDeep(this.value);
        }
      }
    } else {
      this.showError = true;
      const text =
        ev.target && ev.target.value
          ? ev.target.value.length > 0
            ? ev.target.value
            : null
          : null;
      this._valid = this.validator ? this._validator.validate(text) : true;
      this.isValid.emit(this._valid);
      this.multiLanguage
        ? (this.value[language ? language : this.selectedLanguage] = text)
        : this.inputType == "number"
          ? (this.value = parseFloat(text))
          : (this.value = text);
      if (this.value !== this.previousValue) {
        const item = this.emitFormItem();
        this.formItemChanged.emit(item);
        this.previousValue = cloneDeep(this.value);
      }
    }
  }

  handleBlur() {
    this.gotFocus = false;
    //this.inputField ? this.inputField.removeAllListeners() : undefined;
    this.formItemBlur.emit(this.emitFormItem());
  }

  emitFormItem() {
    return {
      name: this.name,
      value: this.value,
      valid: this._valid,
    };
  }

  handleFocus(ev) {
    // Get the input field
    this.inputField = ev.target as HTMLElement;

    // Execute a function when the user releases a key on the keyboard
    this.inputField.addEventListener("keyup", (event) => {
      // Number 13 is the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        //close keyboard
        Keyboard.hide();
      }
    });
    this.gotFocus = true;

    //select on focus
    if (this.selectOnFocus) {
      setTimeout(() => {
        const inputElement = this.inputField
          .closest("ion-input")
          .querySelector("input");
        if (inputElement) {
          inputElement.select();
        }
      });
    }
  }

  selectLocation(location: LocationIQ) {
    this.handleBlur();
    this.value = location.display_name;
    this.formLocationSelected.emit(location);
  }

  multiLanguageSelector(lang) {
    return (
      <app-language-picker
        slot='end'
        selectedLangCode={lang}
        picker={false}
        iconOnly={true}
        onLanguageChanged={(ev) => this.changeSelectedLanguage(ev)}
      ></app-language-picker>
    );
  }

  switchMultilangueAccordion() {
    this.openAccordion = !this.openAccordion;
    this.updateSlider.emit(true);
  }

  async makeTranslation() {
    if (!this.value["en"]) {
      SystemService.presentAlertError(
        TranslationService.getTransl(
          "translation-error",
          "Translation require English field to be filled"
        )
      );
    } else {
      const alert = await alertController.create({
        header: TranslationService.getTransl("translate", "Translate"),
        message: TranslationService.getTransl(
          "translate-message",
          "All fields will be replaced with automatic translation."
        ),
        buttons: [
          {
            text: TranslationService.getTransl("ok", "OK"),
            handler: async () => {
              try {
                const translated = await TranslationService.makeTranslation(
                  this.value["en"]
                );
                this.availableLanguages.forEach((language) => {
                  if (language != "en") {
                    this.value[language] = translated[language];
                  }
                });
                this.emitFormItem();
                this.updateView = !this.updateView;
                this.updateSlider.emit();
              } catch (error) {
                SystemService.presentAlertError(error);
              }
            },
          },
          {
            text: TranslationService.getTransl("cancel", "Cancel"),
            handler: async () => {},
          },
        ],
      });
      alert.present();
    }
  }

  changeSelectedLanguage(ev) {
    if (ev.detail) {
      this.selectedLanguage = ev.detail;
      if (!this.value[this.selectedLanguage]) {
        this.value[this.selectedLanguage] = "";
      }
    }
  }

  async openDatePopover() {
    const popover = await popoverController.create({
      component: "popover-select-date",
      componentProps: {
        value: this.value,
        labelTag: this.labelTag,
        labelText: this.labelText,
        labelReplace: this.labelReplace,
        appendText: this.appendText,
        datePresentation: this.datePresentation,
        preferWheel: this.preferWheel,
        showDateTitle: this.showDateTitle,
        maxDate: this.maxDate,
      },
      translucent: false,
    });
    popover.onDidDismiss().then((ev) => {
      if (ev.data) this.handleChange({ target: { value: ev.data } });
    });
    popover.present();
  }

  render() {
    return [
      this.readonly ? (
        <app-item-detail
          showItem={this.showItem}
          lines={this.lines}
          labelTag={this.labelTag}
          labelText={this.labelText}
          detailText={
            this.inputType == "date"
              ? showDate(this.value, this.datePresentation)
              : this.value
          }
        ></app-item-detail>
      ) : (
        [
          this.inputType == "date" ? (
            [
              <ion-item
                button
                lines={this.lines}
                onClick={() => this.openDatePopover()}
              >
                <ion-label>
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
                  {this.validator && this.validator.includes("required") ? (
                    <sup>*</sup>
                  ) : undefined}
                </ion-label>
                <ion-note slot='end'>
                  {showDate(this.value, this.datePresentation)}
                </ion-note>
              </ion-item>,
            ]
          ) : this.inputType == "boolean" ? (
            <ion-item lines={this.lines} color={this.color ? this.color : null}>
              <ion-toggle
                enable-on-off-labels='true'
                color={Environment.getAppColor()}
                checked={this.value ? true : false}
                disabled={this.disabled}
                label-placement={this.labelPosition}
                onIonChange={(ev) => this.handleChange(ev)}
                onIonBlur={() => this.handleBlur()}
                onIonFocus={(ev) => this.handleFocus(ev)}
              >
                {(this.labelTag
                  ? TranslationService.getTransl(
                      this.labelTag,
                      this.labelText,
                      this.labelReplace
                    )
                  : this.labelText
                    ? this.labelText
                    : "") +
                  (this.appendText ? this.appendText : "") +
                  (this.validator && this.validator.includes("required")
                    ? "*"
                    : "")}
              </ion-toggle>
            </ion-item>
          ) : this.multiLanguage ? (
            this.availableLanguages.map((language, index) =>
              index == 0 || (index > 0 && this.openAccordion) ? (
                <ion-item
                  lines={this.lines}
                  color={this.color ? this.color : null}
                >
                  {this.textRows ? (
                    [
                      <ion-textarea
                        class={"valid"}
                        rows={this.textRows}
                        disabled={this.disabled}
                        readonly={this.readonly}
                        label={
                          index == 0
                            ? (this.labelTag
                                ? TranslationService.getTransl(
                                    this.labelTag,
                                    this.labelText,
                                    this.labelReplace
                                  )
                                : this.labelText
                                  ? this.labelText
                                  : "") +
                              (this.appendText ? this.appendText : "") +
                              (this.validator &&
                              this.validator.includes("required")
                                ? "*"
                                : "")
                            : null
                        }
                        label-placement={this.labelPosition}
                        onIonInput={(ev) => this.handleChange(ev, language)}
                        onIonBlur={() => this.handleBlur()}
                        onIonFocus={(ev) => this.handleFocus(ev)}
                        value={this.value[language]}
                      />,
                    ]
                  ) : (
                    <ion-input
                      class={"valid alignStart"}
                      inputmode={this.inputFormMode}
                      disabled={this.disabled}
                      readonly={this.readonly}
                      debounce={this.debounce}
                      label={
                        index == 0
                          ? (this.labelTag
                              ? TranslationService.getTransl(
                                  this.labelTag,
                                  this.labelText,
                                  this.labelReplace
                                )
                              : this.labelText
                                ? this.labelText
                                : "") +
                            (this.appendText ? this.appendText : "") +
                            (this.validator &&
                            this.validator.includes("required")
                              ? "*"
                              : "")
                          : null
                      }
                      label-placement={
                        this.labelTag ? this.labelPosition : null
                      }
                      placeholder={this.placeholder}
                      onIonInput={(ev) => this.handleChange(ev, language)}
                      onIonFocus={(ev) => this.handleFocus(ev)}
                      value={this.value[language]}
                    />
                  )}
                  {this.multiLanguageSelector(language)}
                  {index == 0
                    ? [
                        <ion-button
                          slot='end'
                          fill='clear'
                          color='light'
                          onClick={() => this.makeTranslation()}
                        >
                          <ion-icon name='language-outline'></ion-icon>
                        </ion-button>,
                        <ion-button
                          slot='end'
                          fill='clear'
                          color='light'
                          onClick={() => this.switchMultilangueAccordion()}
                        >
                          <ion-icon
                            name={
                              this.openAccordion
                                ? "chevron-up-outline"
                                : "chevron-down-outline"
                            }
                          ></ion-icon>
                        </ion-button>,
                      ]
                    : undefined}
                </ion-item>
              ) : undefined
            )
          ) : (
            <ion-item
              class={this.shortItem ? "item_short_height" : ""}
              lines={this.lines}
              color={this.color ? this.color : null}
            >
              {this.textRows ? (
                [
                  <ion-textarea
                    class={
                      (this.showError &&
                        this.validator &&
                        !this._validator.validate(this.value.toString())) ||
                      this.forceInvalid
                        ? "invalid"
                        : "valid"
                    }
                    rows={this.textRows}
                    disabled={this.disabled}
                    readonly={this.readonly}
                    label={
                      (this.labelTag
                        ? TranslationService.getTransl(
                            this.labelTag,
                            this.labelText,
                            this.labelReplace
                          )
                        : this.labelText
                          ? this.labelText
                          : "") +
                      (this.appendText ? this.appendText : "") +
                      (this.validator && this.validator.includes("required")
                        ? "*"
                        : "")
                    }
                    label-placement={this.labelPosition}
                    onIonInput={(ev) => this.handleChange(ev)}
                    onIonBlur={() => this.handleBlur()}
                    onIonFocus={(ev) => this.handleFocus(ev)}
                    value={this.value ? this.value.toString() : null}
                  />,
                ]
              ) : (
                <ion-input
                  class={
                    ((this.showError &&
                      this.validator &&
                      !this._validator.validate(this.value.toString())) ||
                    this.forceInvalid
                      ? "invalid"
                      : "valid") +
                    (this.inputType == "number" ? " alignEnd" : "alignStart")
                  }
                  type={this.inputType}
                  inputmode={this.inputFormMode}
                  step={this.inputStep}
                  disabled={this.disabled}
                  readonly={this.readonly}
                  debounce={this.debounce}
                  label={
                    (this.labelTag
                      ? TranslationService.getTransl(
                          this.labelTag,
                          this.labelText,
                          this.labelReplace
                        )
                      : this.labelText
                        ? this.labelText
                        : "") +
                    (this.appendText ? this.appendText : "") +
                    (this.validator && this.validator.includes("required")
                      ? "*"
                      : "")
                  }
                  label-placement={
                    this.labelTag || this.labelText ? this.labelPosition : null
                  }
                  placeholder={this.placeholder}
                  onIonInput={(ev) => this.handleChange(ev)}
                  onIonBlur={() =>
                    !this.isAddess ? this.handleBlur() : undefined
                  }
                  onIonFocus={(ev) => this.handleFocus(ev)}
                  value={
                    this.multiLanguage
                      ? this.value[this.selectedLanguage]
                      : this.value
                  }
                />
              )}
            </ion-item>
          ),
          this.showError &&
          this.validator &&
          !this._validator.validate(
            this.multiLanguage ? this.value[this.selectedLanguage] : this.value
          ) ? (
            <div>
              <my-transl
                class='validation-error'
                tag={this._validator.errorMessage.tag}
                text={this._validator.errorMessage.text}
                replace={this._validator.errorMessage.replace}
              ></my-transl>
            </div>
          ) : null,
          this.isAddess ? (
            <div>
              <app-geocode
                address={this.value ? this.value.toString() : null}
                onLocationSelected={(ev) => this.selectLocation(ev.detail)}
                onLocationsFound={(ev) => this.formLocationsFound.emit(ev)}
                gotFocus={this.gotFocus}
              ></app-geocode>
            </div>
          ) : undefined,
        ]
      ),
    ];
  }
}
