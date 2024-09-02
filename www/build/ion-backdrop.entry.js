import { r as registerInstance, l as createEvent, h, j as Host } from './index-d515af00.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const backdropIosCss = ":host{left:0;right:0;top:0;bottom:0;display:block;position:absolute;transform:translateZ(0);contain:strict;cursor:pointer;opacity:0.01;touch-action:none;z-index:2}:host(.backdrop-hide){background:transparent}:host(.backdrop-no-tappable){cursor:auto}:host{background-color:var(--ion-backdrop-color, #000)}";

const backdropMdCss = ":host{left:0;right:0;top:0;bottom:0;display:block;position:absolute;transform:translateZ(0);contain:strict;cursor:pointer;opacity:0.01;touch-action:none;z-index:2}:host(.backdrop-hide){background:transparent}:host(.backdrop-no-tappable){cursor:auto}:host{background-color:var(--ion-backdrop-color, #000)}";

const Backdrop = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.ionBackdropTap = createEvent(this, "ionBackdropTap", 7);
        this.visible = true;
        this.tappable = true;
        this.stopPropagation = true;
    }
    onMouseDown(ev) {
        this.emitTap(ev);
    }
    emitTap(ev) {
        if (this.stopPropagation) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        if (this.tappable) {
            this.ionBackdropTap.emit();
        }
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: 'c803b4302c8e722064feb03dafe3cb6e190b4f2b', tabindex: "-1", "aria-hidden": "true", class: {
                [mode]: true,
                'backdrop-hide': !this.visible,
                'backdrop-no-tappable': !this.tappable,
            } }));
    }
};
Backdrop.style = {
    ios: backdropIosCss,
    md: backdropMdCss
};

export { Backdrop as ion_backdrop };

//# sourceMappingURL=ion-backdrop.entry.js.map