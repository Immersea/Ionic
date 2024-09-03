import { r as registerInstance, h, j as Host } from './index-d515af00.js';

const appItemCoverCss = "app-item-cover{width:100%;height:20%}app-item-cover ion-thumbnail{position:relative;margin-top:-100px;margin-bottom:0;width:100px;height:100px}app-item-cover ion-thumbnail img{border-radius:50%;padding:0.08em;border:solid 0.25em lightsteelblue;background-color:white}app-item-cover .cover{position:relative;height:var(--coverHeight);background-color:lightblue;background-size:cover;background-position:center;background-repeat:no-repeat;box-shadow:0 4px 8px 0 rgba(0, 0, 0, 0.2);width:100%}app-item-cover .cover ion-button{position:absolute;right:0px}app-item-cover .cover ion-menu-button{position:absolute;left:0px;top:0px;color:black;mix-blend-mode:difference}";

const AppItemCover = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.item = undefined;
        this.tmbPosition = undefined;
    }
    render() {
        return (h(Host, { key: '354ea31d14e34f842134cd01f88a581bda02a9a6' }, this.item
            ? [
                h("div", { class: 'cover', style: this.item.coverURL
                        ? {
                            backgroundImage: "url(" + this.item.coverURL + ")",
                        }
                        : undefined }),
                this.item.photoURL ? (h("ion-thumbnail", { style: {
                        marginLeft: this.tmbPosition == "left" ? "10%" : "auto",
                        marginRight: this.tmbPosition == "right" ? "10%" : "auto",
                    } }, h("img", { src: this.item.photoURL
                        ? this.item.photoURL
                        : "assets/images/avatar.png", alt: this.item.displayName }))) : undefined,
            ]
            : undefined));
    }
};
AppItemCover.style = appItemCoverCss;

export { AppItemCover as app_item_cover };

//# sourceMappingURL=app-item-cover.entry.js.map