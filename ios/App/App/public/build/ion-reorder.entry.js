import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { r as reorderThreeOutline, m as reorderTwoSharp } from './index-32818e2b.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const reorderIosCss = ":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block}::slotted(ion-icon){font-size:dynamic-font(16px)}.reorder-icon{font-size:2.125rem;opacity:0.4}";

const reorderMdCss = ":host([slot]){display:none;line-height:0;z-index:100}.reorder-icon{display:block}::slotted(ion-icon){font-size:dynamic-font(16px)}.reorder-icon{font-size:1.9375rem;opacity:0.3}";

const Reorder = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    onClick(ev) {
        const reorderGroup = this.el.closest('ion-reorder-group');
        ev.preventDefault();
        // Only stop event propagation if the reorder is inside of an enabled
        // reorder group. This allows interaction with clickable children components.
        if (!reorderGroup || !reorderGroup.disabled) {
            ev.stopImmediatePropagation();
        }
    }
    render() {
        const mode = getIonMode(this);
        const reorderIcon = mode === 'ios' ? reorderThreeOutline : reorderTwoSharp;
        return (h(Host, { key: '663d74e231e3af56b6298ee2539fdac9c8465839', class: mode }, h("slot", { key: 'c7c384ab8c9ca8abdc89cd984a39dfde70e342ca' }, h("ion-icon", { key: 'c8b6052db03d4b9e33a90e600c20861c73ee73ce', icon: reorderIcon, lazy: false, class: "reorder-icon", part: "icon", "aria-hidden": "true" }))));
    }
    get el() { return getElement(this); }
};
Reorder.style = {
    ios: reorderIosCss,
    md: reorderMdCss
};

export { Reorder as ion_reorder };

//# sourceMappingURL=ion-reorder.entry.js.map