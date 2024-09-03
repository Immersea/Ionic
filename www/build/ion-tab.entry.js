import { r as registerInstance, f as Build, h, j as Host, k as getElement } from './index-d515af00.js';
import { a as attachComponent } from './framework-delegate-779ab78c.js';
import './helpers-ff3eb5b3.js';

const tabCss = ":host(.tab-hidden){display:none !important}";

const Tab = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.loaded = false;
        this.active = false;
        this.delegate = undefined;
        this.tab = undefined;
        this.component = undefined;
    }
    async componentWillLoad() {
        if (Build.isDev) {
            if (this.component !== undefined && this.el.childElementCount > 0) {
                console.error('You can not use a lazy-loaded component in a tab and inlined content at the same time.' +
                    `- Remove the component attribute in: <ion-tab component="${this.component}">` +
                    ` or` +
                    `- Remove the embedded content inside the ion-tab: <ion-tab></ion-tab>`);
            }
        }
        if (this.active) {
            await this.setActive();
        }
    }
    /** Set the active component for the tab */
    async setActive() {
        await this.prepareLazyLoaded();
        this.active = true;
    }
    changeActive(isActive) {
        if (isActive) {
            this.prepareLazyLoaded();
        }
    }
    prepareLazyLoaded() {
        if (!this.loaded && this.component != null) {
            this.loaded = true;
            try {
                return attachComponent(this.delegate, this.el, this.component, ['ion-page']);
            }
            catch (e) {
                console.error(e);
            }
        }
        return Promise.resolve(undefined);
    }
    render() {
        const { tab, active, component } = this;
        return (h(Host, { key: '46d5498418f5379861c3d7465e8021dec45f1200', role: "tabpanel", "aria-hidden": !active ? 'true' : null, "aria-labelledby": `tab-button-${tab}`, class: {
                'ion-page': component === undefined,
                'tab-hidden': !active,
            } }, h("slot", { key: 'b45045dccb87dfe75e3f5a5a474bb48b6c98e922' })));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "active": ["changeActive"]
    }; }
};
Tab.style = tabCss;

export { Tab as ion_tab };

//# sourceMappingURL=ion-tab.entry.js.map