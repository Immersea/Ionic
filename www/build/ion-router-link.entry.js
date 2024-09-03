import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { o as openURL, c as createColorClasses } from './theme-6bada181.js';
import { g as getIonMode } from './ionic-global-c07767bf.js';

const routerLinkCss = ":host{--background:transparent;--color:var(--ion-color-primary, #0054e9);background:var(--background);color:var(--color)}:host(.ion-color){color:var(--ion-color-base)}a{font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit}";

const RouterLink = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.onClick = (ev) => {
            openURL(this.href, ev, this.routerDirection, this.routerAnimation);
        };
        this.color = undefined;
        this.href = undefined;
        this.rel = undefined;
        this.routerDirection = 'forward';
        this.routerAnimation = undefined;
        this.target = undefined;
    }
    render() {
        const mode = getIonMode(this);
        const attrs = {
            href: this.href,
            rel: this.rel,
            target: this.target,
        };
        return (h(Host, { key: 'f876442cab5b14b7e83c6d6ad2c2d878a9c57439', onClick: this.onClick, class: createColorClasses(this.color, {
                [mode]: true,
                'ion-activatable': true,
            }) }, h("a", Object.assign({ key: 'c44b78ec1fd10a40c23bfe548860ac2b346646a8' }, attrs), h("slot", { key: 'd32180a567613f79f89885135bd0d776ffc1eb8e' }))));
    }
};
RouterLink.style = routerLinkCss;

export { RouterLink as ion_router_link };

//# sourceMappingURL=ion-router-link.entry.js.map