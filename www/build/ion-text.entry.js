import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { c as createColorClasses } from './theme-6bada181.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const textCss = ":host(.ion-color){color:var(--ion-color-base)}";

const Text = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.color = undefined;
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: '4b76333b1ea5cab134b9dc1f5670c0d5a253fc32', class: createColorClasses(this.color, {
                [mode]: true,
            }) }, h("slot", { key: '3dee5f16bc58b3d92547d910bd4f441a00ce2039' })));
    }
};
Text.style = textCss;

export { Text as ion_text };

//# sourceMappingURL=ion-text.entry.js.map