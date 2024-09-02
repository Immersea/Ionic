import { r as registerInstance, l as createEvent, h } from './index-d515af00.js';
import { B as SystemService } from './utils-5cd4c7bb.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-0a7fccce.js';
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
import './map-e64442d7.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appDiveCourseCardCss = "app-dive-course-card{width:100%;height:100%}";

const AppDiveCourseCard = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.removeEmit = createEvent(this, "removeEmit", 7);
        this.divingCourse = undefined;
        this.edit = false;
    }
    async componentWillLoad() {
        this.divingAgencies = await SystemService.getDivingAgencies();
        this.agency = this.divingAgencies[this.divingCourse.agencyId];
        this.certification = this.agency.certifications[this.divingCourse.certificationId];
    }
    removeDiveCourse(ev) {
        ev.stopPropagation();
        this.removeEmit.emit(this.divingCourse);
    }
    render() {
        return (h("ion-card", { key: '37c5d43a390840df1a1f468d018ab91160c58a0f' }, this.certification.photoURL ? (h("app-item-cover", { item: this.certification })) : undefined, h("ion-card-header", { key: 'e84786c6dbaffd4993f7724fd11df009e5c8c374' }, h("ion-item", { key: '028d116fd0a27a9b6c32401af57d96355b03b0d8', class: 'ion-no-padding', lines: 'none' }, this.edit ? (h("ion-button", { "icon-only": true, slot: 'end', color: 'danger', fill: 'clear', onClick: (ev) => this.removeDiveCourse(ev) }, h("ion-icon", { name: 'trash-bin-outline' }))) : undefined, h("ion-card-title", { key: 'dc5d4ec1c9778ad22428ac60802a47ce9947bead' }, this.certification.name)), h("ion-card-subtitle", { key: '250ab4d7513be82c179bed9eb2d9982cfbb9054f' }, this.agency.name), h("ion-card-content", { key: '9e4cb48dd7573f1174ac880f47374133fb0cb00c' }, "depth: ", this.certification.maxDepth, " m"))));
    }
};
AppDiveCourseCard.style = appDiveCourseCardCss;

export { AppDiveCourseCard as app_dive_course_card };

//# sourceMappingURL=app-dive-course-card.entry.js.map