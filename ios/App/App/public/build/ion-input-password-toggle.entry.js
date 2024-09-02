import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { p as printIonWarning } from './index-93ceac82.js';
import { c as createColorClasses } from './theme-6bada181.js';
import { e as eye, d as eyeOff } from './index-32818e2b.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const iosInputPasswordToggleCss = "";

const mdInputPasswordToggleCss = "";

const InputPasswordToggle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.togglePasswordVisibility = () => {
            const { inputElRef } = this;
            if (!inputElRef) {
                return;
            }
            inputElRef.type = inputElRef.type === 'text' ? 'password' : 'text';
        };
        this.color = undefined;
        this.showIcon = undefined;
        this.hideIcon = undefined;
        this.type = 'password';
    }
    /**
     * Whenever the input type changes we need to re-run validation to ensure the password
     * toggle is being used with the correct input type. If the application changes the type
     * outside of this component we also need to re-render so the correct icon is shown.
     */
    onTypeChange(newValue) {
        if (newValue !== 'text' && newValue !== 'password') {
            printIonWarning(`ion-input-password-toggle only supports inputs of type "text" or "password". Input of type "${newValue}" is not compatible.`, this.el);
            return;
        }
    }
    connectedCallback() {
        const { el } = this;
        const inputElRef = (this.inputElRef = el.closest('ion-input'));
        if (!inputElRef) {
            printIonWarning('No ancestor ion-input found for ion-input-password-toggle. This component must be slotted inside of an ion-input.', el);
            return;
        }
        /**
         * Important: Set the type in connectedCallback because the default value
         * of this.type may not always be accurate. Usually inputs have the "password" type
         * but it is possible to have the input to initially have the "text" type. In that scenario
         * the wrong icon will show briefly before switching to the correct icon. Setting the
         * type here allows us to avoid that flicker.
         */
        this.type = inputElRef.type;
    }
    disconnectedCallback() {
        this.inputElRef = null;
    }
    render() {
        var _a, _b;
        const { color, type } = this;
        const mode = getIonMode(this);
        const showPasswordIcon = (_a = this.showIcon) !== null && _a !== void 0 ? _a : eye;
        const hidePasswordIcon = (_b = this.hideIcon) !== null && _b !== void 0 ? _b : eyeOff;
        const isPasswordVisible = type === 'text';
        return (h(Host, { key: 'ed1c29726ce0c91548f0e2ada61e3f8b5c813d2d', class: createColorClasses(color, {
                [mode]: true,
            }) }, h("ion-button", { key: '9698eccdaedb86cf12d20acc53660371b3af3c55', mode: mode, color: color, fill: "clear", shape: "round", "aria-checked": isPasswordVisible ? 'true' : 'false', "aria-label": "show password", role: "switch", type: "button", onPointerDown: (ev) => {
                /**
                 * This prevents mobile browsers from
                 * blurring the input when the password toggle
                 * button is activated.
                 */
                ev.preventDefault();
            }, onClick: this.togglePasswordVisibility }, h("ion-icon", { key: '1f2119c30b56c800d9af44e6499445a0ebb466cf', slot: "icon-only", "aria-hidden": "true", icon: isPasswordVisible ? hidePasswordIcon : showPasswordIcon }))));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "type": ["onTypeChange"]
    }; }
};
InputPasswordToggle.style = {
    ios: iosInputPasswordToggleCss,
    md: mdInputPasswordToggleCss
};

export { InputPasswordToggle as ion_input_password_toggle };

//# sourceMappingURL=ion-input-password-toggle.entry.js.map