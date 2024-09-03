import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const thumbnailCss = ":host{--size:48px;--border-radius:0;border-radius:var(--border-radius);display:block;width:var(--size);height:var(--size)}::slotted(ion-img),::slotted(img){border-radius:var(--border-radius);width:100%;height:100%;object-fit:cover;overflow:hidden}";

const Thumbnail = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return (h(Host, { key: 'ea55000055f941b0c79561e8934be6242ec8e114', class: getIonMode(this) }, h("slot", { key: 'a4f934f442797f5c66a77e0ef8920fdd07c204f2' })));
    }
};
Thumbnail.style = thumbnailCss;

export { Thumbnail as ion_thumbnail };

//# sourceMappingURL=ion-thumbnail.entry.js.map