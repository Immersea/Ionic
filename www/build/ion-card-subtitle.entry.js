import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { c as createColorClasses } from './theme-6bada181.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const cardSubtitleIosCss = ":host{display:block;position:relative;color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-600, var(--ion-text-color-step-400, #666666));margin-left:0;margin-right:0;margin-top:0;margin-bottom:4px;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;font-size:0.75rem;font-weight:700;letter-spacing:0.4px;text-transform:uppercase}";

const cardSubtitleMdCss = ":host{display:block;position:relative;color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}:host{--color:var(--ion-color-step-550, var(--ion-text-color-step-450, #737373));margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;font-size:0.875rem;font-weight:500}";

const CardSubtitle = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.color = undefined;
    }
    render() {
        const mode = getIonMode(this);
        return (h(Host, { key: 'cbcb01bd01cf6de64a0b04fb626e42b07ceb8f53', role: "heading", "aria-level": "3", class: createColorClasses(this.color, {
                'ion-inherit-color': true,
                [mode]: true,
            }) }, h("slot", { key: 'cbcaa73aa5799882c48d6c0aabfb13651bcc91c0' })));
    }
};
CardSubtitle.style = {
    ios: cardSubtitleIosCss,
    md: cardSubtitleMdCss
};

export { CardSubtitle as ion_card_subtitle };

//# sourceMappingURL=ion-card-subtitle.entry.js.map