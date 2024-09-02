import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { c as createColorClasses } from './theme-6bada181.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const listHeaderIosCss = ":host{--border-style:solid;--border-width:0;--inner-border-width:0;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:40px;border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);color:var(--color);overflow:hidden}:host(.ion-color){background:var(--ion-color-base);color:var(--ion-color-contrast)}.list-header-inner{display:flex;position:relative;flex:1;flex-direction:inherit;align-items:inherit;align-self:stretch;min-height:inherit;border-width:var(--inner-border-width);border-style:var(--border-style);border-color:var(--border-color);overflow:inherit;box-sizing:border-box}::slotted(ion-label){flex:1 1 auto}:host(.list-header-lines-inset),:host(.list-header-lines-none){--border-width:0}:host(.list-header-lines-full),:host(.list-header-lines-none){--inner-border-width:0}:host{--background:transparent;--color:var(--ion-color-step-850, var(--ion-text-color-step-150, #262626));--border-color:var(--ion-item-border-color, var(--ion-border-color, var(--ion-color-step-250, var(--ion-background-color-step-250, #c8c7cc))));padding-right:var(--ion-safe-area-right);padding-left:calc(var(--ion-safe-area-left, 0px) + 16px);position:relative;align-items:flex-end;font-size:min(1.375rem, 56.1px);font-weight:700;letter-spacing:0}:host-context([dir=rtl]){padding-right:calc(var(--ion-safe-area-right, 0px) + 16px);padding-left:var(--ion-safe-area-left)}@supports selector(:dir(rtl)){:host(:dir(rtl)){padding-right:calc(var(--ion-safe-area-right, 0px) + 16px);padding-left:var(--ion-safe-area-left)}}::slotted(ion-button),::slotted(ion-label){margin-top:29px;margin-bottom:6px}::slotted(ion-button){--padding-top:0;--padding-bottom:0;-webkit-margin-start:3px;margin-inline-start:3px;-webkit-margin-end:3px;margin-inline-end:3px;min-height:1.4em}:host(.list-header-lines-full){--border-width:0 0 0.55px 0}:host(.list-header-lines-inset){--inner-border-width:0 0 0.55px 0}";

const listHeaderMdCss = ":host{--border-style:solid;--border-width:0;--inner-border-width:0;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:flex;align-items:center;justify-content:space-between;width:100%;min-height:40px;border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);color:var(--color);overflow:hidden}:host(.ion-color){background:var(--ion-color-base);color:var(--ion-color-contrast)}.list-header-inner{display:flex;position:relative;flex:1;flex-direction:inherit;align-items:inherit;align-self:stretch;min-height:inherit;border-width:var(--inner-border-width);border-style:var(--border-style);border-color:var(--border-color);overflow:inherit;box-sizing:border-box}::slotted(ion-label){flex:1 1 auto}:host(.list-header-lines-inset),:host(.list-header-lines-none){--border-width:0}:host(.list-header-lines-full),:host(.list-header-lines-none){--inner-border-width:0}:host{--background:transparent;--color:var(--ion-text-color, #000);--border-color:var(--ion-item-border-color, var(--ion-border-color, var(--ion-color-step-150, var(--ion-background-color-step-150, rgba(0, 0, 0, 0.13)))));padding-right:var(--ion-safe-area-right);padding-left:calc(var(--ion-safe-area-left, 0px) + 16px);min-height:45px;font-size:0.875rem}:host-context([dir=rtl]){padding-right:calc(var(--ion-safe-area-right, 0px) + 16px);padding-left:var(--ion-safe-area-left)}@supports selector(:dir(rtl)){:host(:dir(rtl)){padding-right:calc(var(--ion-safe-area-right, 0px) + 16px);padding-left:var(--ion-safe-area-left)}}:host(.list-header-lines-full){--border-width:0 0 1px 0}:host(.list-header-lines-inset){--inner-border-width:0 0 1px 0}";

const ListHeader = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.color = undefined;
        this.lines = undefined;
    }
    render() {
        const { lines } = this;
        const mode = getIonMode(this);
        return (h(Host, { key: '7e2e050f13722f2b870a2415d99a9e631e9ca267', class: createColorClasses(this.color, {
                [mode]: true,
                [`list-header-lines-${lines}`]: lines !== undefined,
            }) }, h("div", { key: '6117bebc45800d874e9b75355476fbced5cc8398', class: "list-header-inner" }, h("slot", { key: '9165fb274cd2c45a5a65c271d8b1f30e8a00c890' }))));
    }
};
ListHeader.style = {
    ios: listHeaderIosCss,
    md: listHeaderMdCss
};

export { ListHeader as ion_list_header };

//# sourceMappingURL=ion-list-header.entry.js.map