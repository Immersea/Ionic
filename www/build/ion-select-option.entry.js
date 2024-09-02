import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const selectOptionCss = ":host{display:none}";

const SelectOption = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.inputId = `ion-selopt-${selectOptionIds++}`;
        this.disabled = false;
        this.value = undefined;
    }
    render() {
        return h(Host, { key: 'ba5a9c695c53fe0802af11a49f4305a9b8f71773', role: "option", id: this.inputId, class: getIonMode(this) });
    }
    get el() { return getElement(this); }
};
let selectOptionIds = 0;
SelectOption.style = selectOptionCss;

export { SelectOption as ion_select_option };

//# sourceMappingURL=ion-select-option.entry.js.map