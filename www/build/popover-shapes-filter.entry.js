import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import './index-be90eba5.js';
import { al as ShapesService, ao as Shape } from './utils-5cd4c7bb.js';
import { p as popoverController } from './overlays-b3ceb97d.js';
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
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './framework-delegate-779ab78c.js';

const popoverShapesFilterCss = "popover-shapes-filter{min-width:var(--popover-width)}";

const PopoverShapesFilter = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.filter = undefined;
        this.shapeTypes = undefined;
        this.dwg = undefined;
    }
    async componentWillLoad() {
        this.popover = this.el.closest("ion-popover");
        this.shapeTypes = await ShapesService.getShapeTypes();
        this.adjustPopoverWidth("900px");
    }
    handleFilter(ev) {
        this.filter[ev.detail.name] = ev.detail.value;
    }
    async handleSelect(ev) {
        this.filter.shapeTypeId = ev.detail.value;
        const shape = new Shape(this.filter);
        await ShapesService.setDwgForShape(shape);
        this.dwg = shape.dwg;
    }
    adjustPopoverWidth(width) {
        this.popover.style.setProperty("--popover-width", width);
    }
    close() {
        popoverController.dismiss();
    }
    save() {
        popoverController.dismiss(this.filter);
    }
    render() {
        return (h(Host, { key: '56ffc4c539f408d67b17c41ff796e6b2ce22244d' }, h("ion-header", { key: '7066b0b2af09d497ae6487a83f4a63eb5157a617', translucent: true }, h("ion-toolbar", { key: '757f90fc4596b06e1eda0ae097492ad25d12980c' }, h("ion-title", { key: '510a4af2f7707ed47d7e06bc101c5b98b452a028' }, "Filter Shapes"))), h("ion-content", { key: '3ba1354595ebc1ef125e8864a6684e02ef338f70' }, h("ion-grid", { key: '4879235149f95ef502d037d12ae72ef2002b11e6' }, h("ion-row", { key: '3c556cd834a41c4575b7b57c14f6abea0a54a367' }, h("ion-col", { key: 'bc382ababd2e2b7d07e76be9119bc29aae95c32d' }, h("ion-list", { key: 'f111d1011df2870d38be2a08af6c7168e9407dbb' }, h("ion-grid", { key: 'c4bf95f6cb72878b76b44a3ccac3583e7640ea37' }, h("ion-row", { key: '122b2efded566b7f7cf484ddd7144ec2b370decc' }, h("ion-col", { key: '54e8500c332ac1be9400f7e56058532d2feb1dab' }, h("app-select-search", { key: '43750c9109dbf8701608956276f351ca015beec8', label: {
                tag: "shape_type",
                text: "Shape Type",
            }, value: this.filter.shapeTypeId, lines: "inset", selectFn: (ev) => this.handleSelect(ev), selectOptions: this.shapeTypes, selectValueId: "typeId", selectValueText: ["typeName", "en"] })))), Object.keys(this.filter).map((key) => !key.includes("operator") && key !== "shapeTypeId" ? (h("ion-row", null, h("ion-col", null, h("app-form-item", { "label-text": key, value: this.filter[key], name: key, "input-type": "number", onFormItemChanged: (ev) => this.handleFilter(ev) })), h("ion-col", { size: "1" }, h("ion-select", { color: "trasteel", interface: "action-sheet", onIonChange: (ev) => (this.filter[key + "_operator"] = ev.detail.value), value: this.filter[key + "_operator"] }, h("ion-select-option", { value: ">=" }, h("ion-label", null, ">=")), h("ion-select-option", { value: ">" }, h("ion-label", null, ">")), h("ion-select-option", { value: "=" }, h("ion-label", null, "=")), h("ion-select-option", { value: "<" }, h("ion-label", null, "<")), h("ion-select-option", { value: "<=" }, h("ion-label", null, "<=")))))) : undefined))), h("ion-col", { key: 'fcbe117ecf79004ebda3081ae4af09f813190b22' }, h("app-banner", { key: '57ad7b986e915495cc07df4dcbccf6d3800eac09', scrollTopValue: 0, heightPx: 300, backgroundCover: false, link: this.dwg ? this.dwg.url : null }))))), h("ion-footer", { key: 'ac1af53e68d75b1831182f96aa49ea042bf01bf9' }, h("app-modal-footer", { key: '7c8ba2005af5140182816179611cae1235b9b11a', saveTag: { tag: "filter", text: "Filter" }, onCancelEmit: () => this.close(), onSaveEmit: () => this.save() }))));
    }
    get el() { return getElement(this); }
};
PopoverShapesFilter.style = popoverShapesFilterCss;

export { PopoverShapesFilter as popover_shapes_filter };

//# sourceMappingURL=popover-shapes-filter.entry.js.map