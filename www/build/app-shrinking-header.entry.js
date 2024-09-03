import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';

const appShrinkingHeaderCss = "app-shrinking-header{width:100%;padding-left:15%;padding-right:15%;z-index:0;position:fixed;font-size:130%}app-shrinking-header img{display:block;margin-left:auto;margin-right:auto}app-shrinking-header h1{margin-top:0px;font-size:inherit;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}";

const AppShrinkingHeader = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.heightValue = 0;
        this.logoUrl = "";
        this.scrollTopValue = 0;
        this.slogan = null;
    }
    updateScrolling() {
        if (this.el.clientHeight > this.heightValue)
            this.heightValue = this.el.clientHeight;
        const constant = document.documentElement.clientHeight /
            this.heightValue /
            (document.documentElement.clientHeight /
                document.documentElement.clientWidth);
        const newOpacity = Math.max(100 - this.scrollTopValue / constant, 0) / 100;
        let newPadding = 15 + this.scrollTopValue / (constant * 3);
        if (newPadding > 100) {
            newPadding = 100;
        }
        this.el.style.paddingLeft = newPadding.toString() + "%";
        this.el.style.paddingRight = newPadding.toString() + "%";
        this.el.style.opacity = newOpacity.toString();
        this.el.style.fontSize = (newOpacity * 100 + 30).toString() + "%";
    }
    render() {
        return (h(Host, { key: '702043cb348917a6e8beefb6a76a95f543b1e457' }, h("img", { key: '9d991328bc1149d7bd21f24238d01fab44b2f1e8', src: this.logoUrl }), this.slogan ? (h("h1", { class: 'ion-text-center' }, "Immergiti, scopri la Sicilia")) : undefined));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "scrollTopValue": ["updateScrolling"]
    }; }
};
AppShrinkingHeader.style = appShrinkingHeaderCss;

export { AppShrinkingHeader as app_shrinking_header };

//# sourceMappingURL=app-shrinking-header.entry.js.map