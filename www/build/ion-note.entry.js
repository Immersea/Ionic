import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { c as createColorClasses } from './theme-6bada181.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const noteIosCss = ":host{color:var(--color);font-family:var(--ion-font-family, inherit);box-sizing:border-box}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-350, var(--ion-text-color-step-650, #a6a6a6));font-size:max(14px, 1rem)}";

const noteMdCss = ":host{color:var(--color);font-family:var(--ion-font-family, inherit);box-sizing:border-box}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666));font-size:0.875rem}";

const Note = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.color = undefined;
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '90ec2fe8c9487608ed8c0bdc32c2e80a6a0890b3', class: createColorClasses(this.color, {
                [mode]: true,
            }) }, h("slot", { key: '115ee3f79e6c526b0644443aad468e99385d0eda' })));
    }
};
Note.style = {
    ios: noteIosCss,
    md: noteMdCss
};

export { Note as ion_note };

//# sourceMappingURL=ion-note.entry.js.map