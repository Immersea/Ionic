import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { l as lodash } from './lodash-68d560b6.js';
import { g as getEmailValidator } from './email-validator-5dccf846.js';
import { o as DIVECOMMUNITIESCOLLECTION, p as DiveCommunitiesService, c as DIVECENTERSSCOLLECTION, i as DivingCentersService, k as SERVICECENTERSCOLLECTION, l as ServiceCentersService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, U as UserService, B as SystemService, T as TranslationService, aQ as showDate } from './utils-ced1e260.js';
import './index-be90eba5.js';
import { r as registerPlugin, E as Environment } from './env-c3ad5e77.js';
import { a as alertController, p as popoverController } from './overlays-b3ceb97d.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-fe092362.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-d18240cd.js';
import './ionic-global-c07767bf.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './framework-delegate-779ab78c.js';

//export type Validator<A> = (x: A) => boolean;
const defaultValidator = {
    validate: (_x) => true,
};
function combineValidators(v1, v2) {
    let combined;
    combined = {
        validate: (x) => {
            const res1 = v1.validate(x);
            const res2 = v2.validate(x);
            if (!res1) {
                combined.errorMessage = v1.errorMessage;
            }
            else if (!res2) {
                combined.errorMessage = v2.errorMessage;
            }
            return res1 && res2;
        },
    };
    return combined;
}

const FruitValidator = {
    validate: (value) => {
        let fruits = ["banana", "apple", "cherry"];
        return fruits.find(a => a === value) ? true : false;
    },
    errorMessage: { tag: "test", text: "You must enter a valid fruit name" }
};

function getLengthValidator(min, max) {
    return {
        validate: (value) => {
            if (lodash.exports.isString(value)) {
                value = value.toString() || "";
                if (min && max) {
                    //"length" validator
                    return min <= value.length && value.length <= max;
                }
                if (min == -1) {
                    //"required" validator
                    return value.length > 0;
                }
                if (min) {
                    //"length" validator
                    return min <= value.length;
                }
                if (max) {
                    //"length" validator
                    return value.length <= max;
                }
                return true;
            }
            else if (lodash.exports.isNumber(value)) {
                value = value || 0;
                if (min && max) {
                    //"length" validator
                    return min <= value && value <= max;
                }
                if (min == -1) {
                    //"required" validator
                    return lodash.exports.isNumber(value);
                }
                if (min) {
                    //"length" validator
                    return min <= value;
                }
                if (max) {
                    //"length" validator
                    return value <= max;
                }
                return true;
            }
            else {
                return false;
            }
        },
        errorMessage: getErrorMessage$2(min, max),
    };
}
function getErrorMessage$2(min, max) {
    const error = min && max
        ? {
            tag: "validators-minmax",
            text: "You must enter between xxx and yyy characters",
            replace: {
                xxx: min,
                yyy: max,
            },
        }
        : min == -1
            ? {
                tag: "validators-required",
                text: "This field is required",
            }
            : min
                ? {
                    tag: "validators-min",
                    text: "You must enter at least xxx characters",
                    replace: {
                        xxx: min,
                    },
                }
                : max
                    ? {
                        tag: "validators-max",
                        text: "You must enter less than yyy characters",
                        replace: {
                            yyy: max,
                        },
                    }
                    : undefined;
    return error;
}

function getUniqueIdValidator(type, index, list) {
    let uniqueid = true;
    if (type == "list") {
        uniqueid = false;
    }
    return {
        validate: (id) => {
            let valid = false;
            if (type === DIVECOMMUNITIESCOLLECTION) {
                valid =
                    DiveCommunitiesService.diveCommunitiesList.findIndex((x) => x.id === id) == -1;
            }
            else if (type === DIVECENTERSSCOLLECTION) {
                valid =
                    DivingCentersService.divingCentersList.findIndex((x) => x.id === id) == -1;
            }
            else if (type === SERVICECENTERSCOLLECTION) {
                valid =
                    ServiceCentersService.serviceCentersList.findIndex((x) => x.id === id) == -1;
            }
            else if (type === DIVESCHOOLSSCOLLECTION) {
                valid =
                    DivingSchoolsService.divingSchoolsList.findIndex((x) => x.id === id) == -1;
            }
            else if (type === "list") {
                valid = list.findIndex((x) => x[index] === id) == -1;
            }
            else {
                valid = true;
            }
            if (uniqueid) {
                valid = valid && /[a-z0-9-]+/.test(id);
                valid = valid && id.length >= 5 && id.length <= 16;
            }
            return valid;
        },
        errorMessage: {
            tag: "validators-uniqueid",
            text: "This Unique ID is not valid or already taken." +
                (uniqueid
                    ? "It must be between 5 and 16 characters length and include only letters, numbers or dashes."
                    : ""),
        },
    };
}

function getMinMaxValueValidator(min, max) {
    return {
        validate: (string) => {
            let value = parseFloat(string) || 0;
            return value >= min && value <= max;
        },
        errorMessage: getErrorMessage$1(min, max),
    };
}
function getErrorMessage$1(min, max) {
    const error = {
        tag: "validators-minmaxvalue",
        text: "You must enter a value between xxx and yyy",
        replace: {
            xxx: min,
            yyy: max,
        },
    };
    return error;
}

function getMinValueValidator(min) {
    return {
        validate: (value) => {
            if (lodash.exports.isString(value))
                value = parseFloat(value);
            return value >= min;
        },
        errorMessage: getErrorMessage(min),
    };
}
function getErrorMessage(min) {
    const error = {
        tag: "validators-minvalue",
        text: "You must enter a value higher than xxx",
        replace: {
            xxx: min,
        },
    };
    return error;
}

var ValidatorsName;
(function (ValidatorsName) {
    ValidatorsName["fruit"] = "fruit";
    ValidatorsName["email"] = "email";
    ValidatorsName["length"] = "length";
    ValidatorsName["uniqueid"] = "uniqueid";
    ValidatorsName["required"] = "required";
    ValidatorsName["minmaxvalue"] = "minmaxvalue";
    ValidatorsName["minvalue"] = "minvalue";
})(ValidatorsName || (ValidatorsName = {}));
function getValidator(list) {
    return (list || [])
        .map((v) => {
        if (typeof v === "string") {
            return validatorFactory(v, null);
        }
        else if (v && v.name) {
            v = v;
            return validatorFactory(v.name, v.options);
        }
        else {
            return v;
        }
    })
        .reduce(combineValidators, defaultValidator);
}
function validatorFactory(name, options) {
    options = options || {};
    switch (name) {
        case ValidatorsName.fruit:
            return FruitValidator;
        case ValidatorsName.required:
            return getLengthValidator(-1, null);
        case ValidatorsName.length:
            return getLengthValidator(options.min, options.max);
        case ValidatorsName.email:
            return getEmailValidator();
        case ValidatorsName.uniqueid:
            return getUniqueIdValidator(options.type, options.index, options.list);
        case ValidatorsName.minmaxvalue:
            return getMinMaxValueValidator(options.min, options.max);
        case ValidatorsName.minvalue:
            return getMinValueValidator(options.min);
        default:
            return defaultValidator;
    }
}

/// <reference types="@capacitor/cli" />
var KeyboardStyle;
(function (KeyboardStyle) {
    /**
     * Dark keyboard.
     *
     * @since 1.0.0
     */
    KeyboardStyle["Dark"] = "DARK";
    /**
     * Light keyboard.
     *
     * @since 1.0.0
     */
    KeyboardStyle["Light"] = "LIGHT";
    /**
     * On iOS 13 and newer the keyboard style is based on the device appearance.
     * If the device is using Dark mode, the keyboard will be dark.
     * If the device is using Light mode, the keyboard will be light.
     * On iOS 12 the keyboard will be light.
     *
     * @since 1.0.0
     */
    KeyboardStyle["Default"] = "DEFAULT";
})(KeyboardStyle || (KeyboardStyle = {}));
var KeyboardResize;
(function (KeyboardResize) {
    /**
     * Only the `body` HTML element will be resized.
     * Relative units are not affected, because the viewport does not change.
     *
     * @since 1.0.0
     */
    KeyboardResize["Body"] = "body";
    /**
     * Only the `ion-app` HTML element will be resized.
     * Use it only for Ionic Framework apps.
     *
     * @since 1.0.0
     */
    KeyboardResize["Ionic"] = "ionic";
    /**
     * The whole native Web View will be resized when the keyboard shows/hides.
     * This affects the `vh` relative unit.
     *
     * @since 1.0.0
     */
    KeyboardResize["Native"] = "native";
    /**
     * Neither the app nor the Web View are resized.
     *
     * @since 1.0.0
     */
    KeyboardResize["None"] = "none";
})(KeyboardResize || (KeyboardResize = {}));

const Keyboard = registerPlugin('Keyboard');

const appFormItemCss = ":host{width:100%}:host ion-note{font-size:1rem}:host .item_short_height{--min-height:inherit;min-height:var(--min-height)}:host .item_short_height .sc-ion-input-md-h{min-height:calc(var(--min-height) - 8px)}:host .valid{border-bottom:1px solid blue}:host .invalid{color:red;font-weight:bold;border-bottom:1px solid red}:host .validation-error{font-size:0.7rem;color:red;display:flex;justify-content:end;padding:0 20px 0 0}:host .fixedLabel{min-width:50% !important;max-width:50% !important}:host .alignEnd{text-align:end}:host .alignStart{text-align:start}";

const AppFormItem = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.formItemChanged = createEvent(this, "formItemChanged", 7);
        this.formItemBlur = createEvent(this, "formItemBlur", 7);
        this.formLocationsFound = createEvent(this, "formLocationsFound", 7);
        this.formLocationSelected = createEvent(this, "formLocationSelected", 7);
        this.isValid = createEvent(this, "isValid", 7);
        this.updateSlider = createEvent(this, "updateSlider", 7);
        this.isAddess = false;
        this.availableLanguages = [];
        this.showError = false;
        this.inputField = null;
        this._validator = defaultValidator;
        this.value = undefined;
        this.labelTag = undefined;
        this.labelText = undefined;
        this.labelReplace = undefined;
        this.appendText = undefined;
        this.disabled = false;
        this.readonly = false;
        this.name = undefined;
        this.textRows = undefined;
        this.inputType = undefined;
        this.inputFormMode = undefined;
        this.placeholder = undefined;
        this.color = undefined;
        this.forceInvalid = false;
        this.multiLanguage = false;
        this.datePresentation = "date";
        this.preferWheel = false;
        this.showDateTitle = true;
        this.maxDate = undefined;
        this.labelPosition = "floating";
        this.lines = "none";
        this.inputStep = "0.1";
        this.showItem = true;
        this.shortItem = false;
        this.debounce = 300;
        this.selectOnFocus = false;
        this.validator = undefined;
        this.selectedLanguage = "en";
        this.openAccordion = false;
        this.updateView = false;
        this.gotFocus = false;
    }
    //used to force reset a value in case of changes of the "value" on the main DOM
    async forceResetValue(value) {
        this.value = value;
        this.previousValue = value;
    }
    componentWillLoad() {
        if (this.validator)
            this._validator = getValidator(this.validator);
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
                }
                else if (this.inputType == "email") {
                    this.inputFormMode = "email";
                }
                else {
                    this.inputFormMode = "text";
                }
            }
        }
        if (this.multiLanguage) {
            this.selectedLanguage = UserService.userSettings.getLanguage();
            //check if language is available in the text
            const textLanguages = Object.keys(this.value).sort();
            if (textLanguages &&
                textLanguages.length > 0 &&
                !textLanguages.includes(this.selectedLanguage)) {
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
        if (this.validator)
            this._validator = getValidator(this.validator);
    }
    handleChange(ev) {
        if (this.inputType == "boolean") {
            if (ev.detail &&
                (ev.detail.checked === true || ev.detail.checked === false)) {
                this.showError = false;
                this._valid = true;
                this.isValid.emit(this._valid);
                this.value = ev.detail.checked;
                if (this.value !== this.previousValue) {
                    const item = this.emitFormItem();
                    this.formItemChanged.emit(item);
                    this.previousValue = lodash.exports.cloneDeep(this.value);
                }
            }
        }
        else {
            this.showError = true;
            const text = ev.target && ev.target.value
                ? ev.target.value.length > 0
                    ? ev.target.value
                    : null
                : null;
            this._valid = this.validator ? this._validator.validate(text) : true;
            this.isValid.emit(this._valid);
            this.multiLanguage
                ? (this.value[this.selectedLanguage] = text)
                : this.inputType == "number"
                    ? (this.value = parseFloat(text))
                    : (this.value = text);
            if (this.value !== this.previousValue) {
                const item = this.emitFormItem();
                this.formItemChanged.emit(item);
                this.previousValue = lodash.exports.cloneDeep(this.value);
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
        this.inputField = ev.target;
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
    selectLocation(location) {
        this.handleBlur();
        this.value = location.display_name;
        this.formLocationSelected.emit(location);
    }
    multiLanguageSelector(lang) {
        return (h("app-language-picker", { slot: 'end', selectedLangCode: lang, picker: false, iconOnly: true, onLanguageChanged: (ev) => this.changeSelectedLanguage(ev) }));
    }
    switchMultilangueAccordion() {
        this.openAccordion = !this.openAccordion;
        this.updateSlider.emit(true);
    }
    async makeTranslation() {
        if (!this.value["en"]) {
            SystemService.presentAlertError(TranslationService.getTransl("translation-error", "Translation require English field to be filled"));
        }
        else {
            const alert = await alertController.create({
                header: TranslationService.getTransl("translate", "Translate"),
                message: TranslationService.getTransl("translate-message", "All fields will be replaced with automatic translation."),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: async () => {
                            try {
                                const translated = await TranslationService.makeTranslation(this.value["en"]);
                                this.availableLanguages.forEach((language) => {
                                    if (language != "en") {
                                        this.value[language] = translated[language];
                                    }
                                });
                                this.emitFormItem();
                                this.updateView = !this.updateView;
                                this.updateSlider.emit();
                            }
                            catch (error) {
                                SystemService.presentAlertError(error);
                            }
                        },
                    },
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        handler: async () => { },
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
            if (ev.data)
                this.handleChange({ target: { value: ev.data } });
        });
        popover.present();
    }
    render() {
        return [
            this.readonly ? (h("app-item-detail", { showItem: this.showItem, lines: this.lines, labelTag: this.labelTag, labelText: this.labelText, detailText: this.inputType == "date"
                    ? showDate(this.value, this.datePresentation)
                    : this.value })) : ([
                this.inputType == "date" ? ([
                    h("ion-item", { button: true, lines: this.lines, onClick: () => this.openDatePopover() }, h("ion-label", null, this.labelTag ? (h("my-transl", { tag: this.labelTag, text: this.labelText, replace: this.labelReplace })) : this.labelText ? (this.labelText) : undefined, this.appendText ? this.appendText : undefined, this.validator && this.validator.includes("required") ? (h("sup", null, "*")) : undefined), h("ion-note", { slot: 'end' }, showDate(this.value, this.datePresentation))),
                ]) : this.inputType == "boolean" ? (h("ion-item", { lines: this.lines, color: this.color ? this.color : null }, h("ion-toggle", { "enable-on-off-labels": 'true', color: Environment.getAppColor(), checked: this.value ? true : false, disabled: this.disabled, "label-placement": this.labelPosition, onIonChange: (ev) => this.handleChange(ev), onIonBlur: () => this.handleBlur(), onIonFocus: (ev) => this.handleFocus(ev) }, (this.labelTag
                    ? TranslationService.getTransl(this.labelTag, this.labelText, this.labelReplace)
                    : this.labelText
                        ? this.labelText
                        : "") +
                    (this.appendText ? this.appendText : "") +
                    (this.validator && this.validator.includes("required")
                        ? "*"
                        : "")))) : this.multiLanguage ? (this.availableLanguages.map((language, index) => index == 0 || (index > 0 && this.openAccordion) ? (h("ion-item", { lines: this.lines, color: this.color ? this.color : null }, this.textRows ? ([
                    h("ion-textarea", { class: "valid", rows: this.textRows, disabled: this.disabled, readonly: this.readonly, label: index == 0
                            ? (this.labelTag
                                ? TranslationService.getTransl(this.labelTag, this.labelText, this.labelReplace)
                                : this.labelText
                                    ? this.labelText
                                    : "") +
                                (this.appendText ? this.appendText : "") +
                                (this.validator &&
                                    this.validator.includes("required")
                                    ? "*"
                                    : "")
                            : null, "label-placement": this.labelPosition, onIonInput: (ev) => this.handleChange(ev), onIonBlur: () => this.handleBlur(), onIonFocus: (ev) => this.handleFocus(ev), value: this.value[language] }),
                ]) : (h("ion-input", { class: "valid alignStart", inputmode: this.inputFormMode, disabled: this.disabled, readonly: this.readonly, debounce: this.debounce, label: index == 0
                        ? (this.labelTag
                            ? TranslationService.getTransl(this.labelTag, this.labelText, this.labelReplace)
                            : this.labelText
                                ? this.labelText
                                : "") +
                            (this.appendText ? this.appendText : "") +
                            (this.validator &&
                                this.validator.includes("required")
                                ? "*"
                                : "")
                        : null, "label-placement": this.labelTag ? this.labelPosition : null, placeholder: this.placeholder, onIonInput: (ev) => this.handleChange(ev), onIonFocus: (ev) => this.handleFocus(ev), value: this.value[language] })), this.multiLanguageSelector(language), index == 0
                    ? [
                        h("ion-button", { slot: 'end', fill: 'clear', color: 'light', onClick: () => this.makeTranslation() }, h("ion-icon", { name: 'language-outline' })),
                        h("ion-button", { slot: 'end', fill: 'clear', color: 'light', onClick: () => this.switchMultilangueAccordion() }, h("ion-icon", { name: this.openAccordion
                                ? "chevron-up-outline"
                                : "chevron-down-outline" })),
                    ]
                    : undefined)) : undefined)) : (h("ion-item", { class: this.shortItem ? "item_short_height" : "", lines: this.lines, color: this.color ? this.color : null }, this.textRows ? ([
                    h("ion-textarea", { class: (this.showError &&
                            this.validator &&
                            !this._validator.validate(this.value.toString())) ||
                            this.forceInvalid
                            ? "invalid"
                            : "valid", rows: this.textRows, disabled: this.disabled, readonly: this.readonly, label: (this.labelTag
                            ? TranslationService.getTransl(this.labelTag, this.labelText, this.labelReplace)
                            : this.labelText
                                ? this.labelText
                                : "") +
                            (this.appendText ? this.appendText : "") +
                            (this.validator && this.validator.includes("required")
                                ? "*"
                                : ""), "label-placement": this.labelPosition, onIonInput: (ev) => this.handleChange(ev), onIonBlur: () => this.handleBlur(), onIonFocus: (ev) => this.handleFocus(ev), value: this.value ? this.value.toString() : null }),
                ]) : (h("ion-input", { class: ((this.showError &&
                        this.validator &&
                        !this._validator.validate(this.value.toString())) ||
                        this.forceInvalid
                        ? "invalid"
                        : "valid") +
                        (this.inputType == "number" ? " alignEnd" : "alignStart"), type: this.inputType, inputmode: this.inputFormMode, step: this.inputStep, disabled: this.disabled, readonly: this.readonly, debounce: this.debounce, label: (this.labelTag
                        ? TranslationService.getTransl(this.labelTag, this.labelText, this.labelReplace)
                        : this.labelText
                            ? this.labelText
                            : "") +
                        (this.appendText ? this.appendText : "") +
                        (this.validator && this.validator.includes("required")
                            ? "*"
                            : ""), "label-placement": this.labelTag || this.labelText ? this.labelPosition : null, placeholder: this.placeholder, onIonInput: (ev) => this.handleChange(ev), onIonBlur: () => !this.isAddess ? this.handleBlur() : undefined, onIonFocus: (ev) => this.handleFocus(ev), value: this.multiLanguage
                        ? this.value[this.selectedLanguage]
                        : this.value })))),
                this.showError &&
                    this.validator &&
                    !this._validator.validate(this.multiLanguage ? this.value[this.selectedLanguage] : this.value) ? (h("div", null, h("my-transl", { class: 'validation-error', tag: this._validator.errorMessage.tag, text: this._validator.errorMessage.text, replace: this._validator.errorMessage.replace }))) : null,
                this.isAddess ? (h("div", null, h("app-geocode", { address: this.value ? this.value.toString() : null, onLocationSelected: (ev) => this.selectLocation(ev.detail), onLocationsFound: (ev) => this.formLocationsFound.emit(ev), gotFocus: this.gotFocus }))) : undefined,
            ]),
        ];
    }
};
AppFormItem.style = appFormItemCss;

export { AppFormItem as app_form_item };

//# sourceMappingURL=app-form-item.entry.js.map