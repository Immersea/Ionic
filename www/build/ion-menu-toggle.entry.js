import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { m as menuController } from './index-f47409f3.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';
import { u as updateVisibility } from './menu-toggle-util-2a4ee8f2.js';
import './index-51ff1772.js';
import './hardware-back-button-da755485.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './animation-a35abe6a.js';

const menuToggleCss = ":host(.menu-toggle-hidden){display:none}";

const MenuToggle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.onClick = () => {
            return menuController.toggle(this.menu);
        };
        this.visible = false;
        this.menu = undefined;
        this.autoHide = true;
    }
    connectedCallback() {
        this.visibilityChanged();
    }
    async visibilityChanged() {
        this.visible = await updateVisibility(this.menu);
    }
    render() {
        const mode = getIonMode(this);
        const hidden = this.autoHide && !this.visible;
        return (h(Host, { key: '90e621f09792383f1badcc1b402b1ac7d08c5f98', onClick: this.onClick, "aria-hidden": hidden ? 'true' : null, class: {
                [mode]: true,
                'menu-toggle-hidden': hidden,
            } }, h("slot", { key: 'c0abdd1d91e9d80ee3704e3e374ebe1f29078460' })));
    }
};
MenuToggle.style = menuToggleCss;

export { MenuToggle as ion_menu_toggle };

//# sourceMappingURL=ion-menu-toggle.entry.js.map