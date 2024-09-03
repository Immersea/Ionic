import { r as registerInstance, h } from './index-d515af00.js';
import { B as SystemService, R as RouterService, al as ShapesService, T as TranslationService } from './utils-cbf49763.js';
import { T as TrasteelService } from './services-2650b7f8.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { E as Environment } from './env-9be68260.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './index-be90eba5.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
import './ionic-global-c07767bf.js';
import './index-93ceac82.js';
import './helpers-ff3eb5b3.js';
import './ios.transition-4bc5d5e6.js';
import './md.transition-b118d52a.js';
import './cubic-bezier-acda64df.js';
import './index-493838d0.js';
import './gesture-controller-a0857859.js';
import './config-45217ee2.js';
import './theme-6bada181.js';
import './index-f47409f3.js';
import './hardware-back-button-da755485.js';
import './overlays-b3ceb97d.js';
import './framework-delegate-779ab78c.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageShapeDetailsCss = "page-shape-details{}";

const PageShapeDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.titles = [
            { tag: "information", text: "Information" },
            { tag: "drawing", text: "Drawing", disabled: false },
        ];
        this.itemId = undefined;
        this.shape = undefined;
        this.shapeTypes = undefined;
        this.updateView = true;
        this.slider = undefined;
    }
    async componentWillLoad() {
        if (this.itemId) {
            await this.loadShape();
        }
        else {
            SystemService.dismissLoading();
            SystemService.presentAlertError("No Item Id");
            RouterService.goBack();
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-detail-shapes", {
            speed: 400,
            spaceBetween: 0,
            allowTouchMove: false,
            autoHeight: true,
            slidesPerView: 1,
            breakpoints: {
                // When window width is >= 768px
                768: {
                    slidesPerView: 1,
                },
                // When window width is >= 992px
                992: {
                    slidesPerView: 2,
                },
            },
        });
    }
    async loadShape() {
        try {
            this.shape = await ShapesService.getShape(this.itemId);
            this.shapeTypes = await ShapesService.getShapeTypes();
            this.checkDwg();
        }
        catch (error) {
            SystemService.dismissLoading();
            SystemService.presentAlertError(error);
            RouterService.goBack();
        }
        SystemService.dismissLoading();
    }
    async checkDwg() {
        if (!this.shape.dwg) {
            //find dwg
            const shapeType = this.shapeTypes.find((x) => x.typeId == this.shape.shapeTypeId);
            if (shapeType) {
                this.shape.dwg = shapeType.dwg;
            }
            if (!this.shape.dwg) {
                this.titles[1].disabled = true;
                this.updateView = !this.updateView;
            }
        }
    }
    updateSlider() {
        this.updateView = !this.updateView;
        //wait for view to update and then reset slider height
        setTimeout(() => {
            this.slider ? this.slider.update() : undefined;
        }, 100);
    }
    async editShape() {
        const modal = await ShapesService.presentShapeUpdate(this.itemId);
        //update customer data after modal dismiss
        modal.onDidDismiss().then(() => this.loadShape());
    }
    deleteShape() {
        ShapesService.deleteShape(this.itemId);
        RouterService.goBack();
    }
    duplicateShape() {
        ShapesService.duplicateShape(this.itemId);
        RouterService.goBack();
    }
    render() {
        return [
            h("ion-header", { key: '6d369f95edf03275d3bac479e4f71e1ca0417f05' }, h("app-navbar", { key: 'bfd72c4eaba98a9e970a66837e72f498c40a2d33', text: this.shape.shapeName, color: "trasteel", backButton: true, rightButtonText: TrasteelService.isRefraDBAdmin()
                    ? {
                        icon: "create",
                        fill: "outline",
                        tag: "edit",
                        text: "Edit",
                    }
                    : null, rightButtonFc: () => this.editShape() })),
            h("app-header-segment-toolbar", { key: '334151cf429933b9df764629f2c398daa0a61293', color: Environment.getAppColor(), swiper: this.slider, titles: this.titles, noToolbar: true }),
            h("ion-content", { key: '2e06714748d3feb76feb8e20106b859105298683', class: "slides" }, h("swiper-container", { key: '84dbfdf60c5c1ec16aa4dd48cbc44052875c2339', class: "slider-detail-shapes swiper" }, h("swiper-wrapper", { key: '9ee90be43e9bcdfde9255566c82d1c557a871121', class: "swiper-wrapper" }, h("swiper-slide", { key: '2e6d175b03729159273798062dbb0a63c0aaee57', class: "swiper-slide" }, h("ion-list", { key: 'f94d3580c34bd9688420c4964367cb1af3e7c160', class: "ion-no-padding" }, h("app-item-detail", { key: 'ed872df7c73c96a57bedfc7e3de065283e0e33e5', lines: "none", labelTag: "shape_type", labelText: "Shape Type", detailText: ShapesService.getShapeTypeName(this.shape.shapeTypeId)["en"] }), h("app-item-detail", { key: '4adac4bf71f73ab290a2ed1084b187e6824d7090', lines: "none", labelTag: "name", labelText: "Name", detailText: this.shape.shapeName }), h("app-item-detail", { key: '4b96de21137eafde8ada56251efa1b3d9db9728a', lines: "none", labelTag: "shortName", labelText: "Short Name", detailText: this.shape.shapeShortName }), h("app-item-detail", { key: 'b2b66395c091ba900ff6c0718be1bd9c8763b812', lines: "none", labelText: "H", detailText: this.shape.H }), h("app-item-detail", { key: 'ac34315f465dc432fc22e71f47bb7263efa24a76', lines: "none", labelText: "H1", detailText: this.shape.H1 }), h("app-item-detail", { key: '37afd44a72ba4a1ee161ed982d2518aef54b1bd4', lines: "none", labelText: "H2", detailText: this.shape.H2 }), h("app-item-detail", { key: '6c26fe4584081dd9eef95cc17e0d6bed997e2f4c', lines: "none", labelText: "L", detailText: this.shape.L }), h("app-item-detail", { key: '01c9551605fdb2fbf8f5d7bd533b81ab5311759c', lines: "none", labelText: "L1", detailText: this.shape.L1 }), h("app-item-detail", { key: 'baff9c8404d3bda30ffcbe8c3d3fd2dcc99f8756', lines: "none", labelText: "La", detailText: this.shape.La }), h("app-item-detail", { key: '570fb79a01cf961c63d7837727756528d8622416', lines: "none", labelText: "Lb", detailText: this.shape.Lb }), h("app-item-detail", { key: '58c4e8ad6adbe61da3446ebac930b40c34f6a760', lines: "none", labelText: "A", detailText: this.shape.A }), h("app-item-detail", { key: '72d16eacd3b4e6f7da1771e251e2d46e689e1a66', lines: "none", labelText: "A1", detailText: this.shape.A1 }), h("app-item-detail", { key: '269da42c1879589b48c44fa5a85ccc023be0fd54', lines: "none", labelText: "B", detailText: this.shape.B }), h("app-item-detail", { key: '26d91d52c0d405e2b0e008e1e1771bd339ca0821', lines: "none", labelText: "B1", detailText: this.shape.B1 }), h("app-item-detail", { key: 'a631b2f369993465ad2170f06b7dacba183d180d', lines: "none", labelText: "ANG", detailText: this.shape.ANG }), h("app-item-detail", { key: '4ba6e6309ce2d528a6aaaf7a161d3634841dd60c', lines: "none", labelText: "ANG1", detailText: this.shape.ANG1 }), h("app-item-detail", { key: '825d5fd5076f21f124b0548f372530e0b459697b', lines: "none", labelText: "D", detailText: this.shape.D }), h("app-item-detail", { key: '901429c0755ca42a8efa6255e9ba54ad378732f9', lines: "none", labelText: "D1", detailText: this.shape.D1 }), h("app-item-detail", { key: '4f8b4ae33f1775886d57f2bf3b76c0d1d552471b', lines: "none", labelText: "D2", detailText: this.shape.D2 }), h("app-item-detail", { key: '29db0fe1d0e091420077b11eedb08e3e28c2b71a', lines: "none", labelText: "D3", detailText: this.shape.D3 }), h("app-item-detail", { key: '8b02a2d888ae299a50bee1c996317eac32efcc43', lines: "none", labelText: "D4", detailText: this.shape.D4 }), h("app-item-detail", { key: 'aa2364b5de32c264eed8a8ea0a5fb852c3c5a0a4', lines: "none", labelText: "De", detailText: this.shape.De }), h("app-item-detail", { key: '4f7c7f87ba11d036a088c297ecc5e92b39af5b61', lines: "none", labelText: "Di", detailText: this.shape.Di }), h("app-item-detail", { key: '208c425634db9dc8d369d8b444895fb5f00d6af5', lines: "none", labelText: "N", detailText: this.shape.N }), h("app-item-detail", { key: '03b39f46c6a97a6b1e7fb3c05c74dc621261a809', lines: "none", labelText: "Radius", appendText: this.shape.radius_max > 0 ? " MIN" : null, detailText: this.shape.radius }), h("app-item-detail", { key: '74607ce3168f989213854966907a75a474363c04', lines: "none", labelText: "Radius", appendText: " MAX", detailText: this.shape.radius_max }), h("app-item-detail", { key: '2f70d5ae3f11db55362fca7e3b855ef50d434f19', lines: "none", labelText: "Volume", detailText: this.shape.volume })), TrasteelService.isRefraDBAdmin() ? (h("ion-grid", null, h("ion-row", null, h("ion-col", null, h("ion-button", { color: "danger", fill: "outline", expand: "block", onClick: () => this.deleteShape() }, h("ion-icon", { name: "trash", slot: "start" }), h("ion-label", null, TranslationService.getTransl("delete", "Delete")))), h("ion-col", null, h("ion-button", { color: "tertiary", fill: "outline", expand: "block", onClick: () => this.duplicateShape() }, h("ion-icon", { name: "duplicate", slot: "start" }), h("ion-label", null, TranslationService.getTransl("copy", "Copy"))))))) : undefined), this.shape.dwg ? (h("swiper-slide", { class: "swiper-slide" }, h("app-banner", { heightPx: 500, backgroundCoverFill: false, link: this.shape.dwg ? this.shape.dwg.url : null }))) : undefined))),
        ];
    }
};
PageShapeDetails.style = pageShapeDetailsCss;

export { PageShapeDetails as page_shape_details };

//# sourceMappingURL=page-shape-details.entry.js.map