import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const rowCss = ":host{display:flex;flex-wrap:wrap}";

const Row = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return (h(Host, { key: '813c9a7f6782d2cf8eb27f30d3ab28e6f3122868', class: getIonMode(this) }, h("slot", { key: '356bec4d4d408ea63d6b431b06465d5b7bcbff71' })));
    }
};
Row.style = rowCss;

export { Row as ion_row };

//# sourceMappingURL=ion-row.entry.js.map