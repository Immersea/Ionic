import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';

const appBannerCss = "app-banner .bannerDiv{width:var(--bannerWidth);height:var(--bannerHeight);background-color:var(--ion-color-tint)}";

const AppBanner = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.link = undefined;
        this.scrollTopValue = undefined;
        this.widthPerc = 100;
        this.heightPerc = 100;
        this.widthPx = null;
        this.heightPx = null;
        this.backgroundCover = true;
        this.backgroundCoverFill = true;
        this.moveImage = 0;
        this.scaleImage = 1;
    }
    updateScrolling() {
        if (this.scrollTopValue > 0) {
            this.moveImage = this.scrollTopValue / 1.6;
            this.scaleImage = 1;
        }
        else {
            this.moveImage = this.scrollTopValue / 1.6;
            this.scaleImage = -this.scrollTopValue / this.heightPx + 1;
        }
        this.el.style.transform =
            "translate3d(0," +
                this.moveImage +
                "px,0) scale(" +
                this.scaleImage +
                "," +
                this.scaleImage +
                ")";
    }
    componentWillLoad() {
        this.el.style.setProperty("--bannerWidth", this.widthPx ? this.widthPx + "px" : this.widthPerc + "%");
        this.el.style.setProperty("--bannerHeight", this.heightPx ? this.heightPx + "px" : this.heightPerc + "%");
    }
    render() {
        return (h(Host, { key: 'de004065fb82de3164036644e698b883b00f1773' }, h("div", { key: 'de855d3e67eeb6547487fc0472dbccf8aede54e9', class: "bannerDiv" }, this.link ? (h("app-image-cache", { url: this.link, backgroundCover: this.backgroundCover, backgroundCoverFill: this.backgroundCoverFill })) : undefined)));
    }
    get el() { return getElement(this); }
    static get watchers() { return {
        "scrollTopValue": ["updateScrolling"]
    }; }
};
AppBanner.style = appBannerCss;

export { AppBanner as app_banner };

//# sourceMappingURL=app-banner.entry.js.map