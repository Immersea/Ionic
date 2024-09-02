import { r as registerInstance, h } from './index-d515af00.js';

const pageDivingClassesCss = "page-diving-classes{}";

const PageDivingClasses = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
    }
    render() {
        return [
            h("app-navbar", { key: '36ced52732eab41364e3cd35152797c3245ac3f0', color: 'divingclass', tag: 'diving-classes', text: 'Diving Classes' }),
            h("ion-content", { key: '4ae51009bbe08116b2e1c48b820acadbf3416f15' }, h("ion-list", { key: '87ef8ea67b763afa538c0da0afc13aef7bdbb4a0' }, h("app-admin-diving-classes", { key: '4f16f2a8ddbcc68d7309194240904345aba3d59b' }))),
        ];
    }
};
PageDivingClasses.style = pageDivingClassesCss;

export { PageDivingClasses as page_diving_classes };

//# sourceMappingURL=page-diving-classes.entry.js.map