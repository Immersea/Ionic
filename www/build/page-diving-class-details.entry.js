import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { U as UserService, ac as DivingClassesService, T as TranslationService, B as SystemService, m as DIVESCHOOLSSCOLLECTION, n as DivingSchoolsService, R as RouterService, ax as fabButtonTopMarginString } from './utils-cbf49763.js';
import { S as Swiper } from './swiper-a30cd476.js';
import './lodash-68d560b6.js';
import './_commonjsHelpers-1a56c7bc.js';
import './env-9be68260.js';
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
import './map-dae4acde.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';

const pageDivingClassDetailsCss = "page-diving-class-details ion-list{width:100%}page-diving-class-details app-diving-class-schedule{width:100%}page-diving-class-details ion-segment-button{--color-checked:var(--ion-color-divingclass-contrast)}";

const PageDivingClassDetails = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.markers = [];
        this.classid = undefined;
        this.divingClass = undefined;
        this.titles = [{ tag: "details" }, { tag: "schedule" }, { tag: "bookings" }];
        this.slider = undefined;
        this.userId = undefined;
        this.selectedCourse = undefined;
        this.selectedAgency = undefined;
        this.selectedDivingSchool = undefined;
        this.instructors = undefined;
    }
    async componentWillLoad() {
        this.userSub = UserService.userProfile$.subscribe((user) => {
            this.userId = user && user.uid ? user.uid : null;
        });
        this.divingClass = await DivingClassesService.getDivingClass(this.classid);
        this.userId =
            UserService.userProfile && UserService.userProfile.uid
                ? UserService.userProfile.uid
                : null;
        this.statusTitles = {
            active: TranslationService.getTransl("active", "Active"),
            closed: TranslationService.getTransl("closed", "Closed"),
            cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
        };
        const divingCourses = await SystemService.getDivingCoursesForSchool();
        //select diving class course
        if (this.divingClass && this.divingClass.course) {
            this.selectedCourse = divingCourses.find((course) => course.agencyId === this.divingClass.course.agencyId &&
                course.id === this.divingClass.course.certificationId);
        }
        this.selectedAgency = (await SystemService.getDivingAgencies())[this.selectedCourse.agencyId];
        if (this.divingClass.organiser.collectionId === DIVESCHOOLSSCOLLECTION)
            this.selectedDivingSchool = DivingSchoolsService.getDivingSchoolDetails(this.divingClass.organiser.id);
        this.instructors = [];
        for (let userId of Object.keys(this.divingClass.users)) {
            if (this.divingClass.users[userId].includes("instructor")) {
                this.instructors.push(await UserService.getMapDataUserDetails(userId));
            }
        }
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-diving-class", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: true,
            autoHeight: true,
        });
    }
    disconnectedCallback() {
        this.userSub.unsubscribe();
    }
    render() {
        return [
            this.selectedCourse && this.selectedCourse.photoURL ? (h("ion-header", null, h("app-item-cover", { item: this.selectedCourse }))) : undefined,
            h("ion-header", { key: '49a54e6b92af12d45e06de481ef5be534584d09f' }, h("ion-toolbar", { key: '3c3e11012a3b23602b7d0934580c4a83636340dc', color: "divingclass", class: this.selectedCourse && this.selectedCourse.photoURL
                    ? "no-safe-padding"
                    : undefined }, h("ion-buttons", { key: '9d3778fe3d1d645b97de3e63c2bb3248ead85fe4', slot: "start" }, !this.selectedCourse ? (h("ion-button", { onClick: () => RouterService.goBack(), "icon-only": true }, h("ion-icon", { name: "arrow-back" }))) : undefined), h("ion-title", { key: '7b089c1f0c00d7a2a6229940a1269846e94ecf85' }, this.divingClass.name))),
            h("app-header-segment-toolbar", { key: '5e316a40cb665e36d62a0159b410c5fce8b826fd', color: "divingclass", swiper: this.slider, titles: this.titles }),
            h("ion-content", { key: '320877cf70fe87f8c9251b728ab038fe6824a313', class: "slides" }, this.selectedCourse && this.selectedCourse.coverURL ? (h("ion-fab", { vertical: "top", horizontal: "start", slot: "fixed", style: { marginTop: fabButtonTopMarginString(2) } }, h("ion-fab-button", { onClick: () => RouterService.goBack(), class: "fab-icon" }, h("ion-icon", { name: "arrow-back-circle-outline" })))) : undefined, h("swiper-container", { key: 'f03adca7cf9c6bee2e0e79b49a1b65ba9769c05f', class: "slider-diving-class swiper" }, h("swiper-wrapper", { key: 'e89e009aad29e5f01c26368ae126cc179064812c', class: "swiper-wrapper" }, h("swiper-slide", { key: 'a2bea229d55b4d805aed7011f31a1972bf3dd8d3', class: "swiper-slide" }, h("ion-list", { key: '4ff71719bc70927cd50a66ea8e28a92db982174f' }, this.selectedDivingSchool ? (h("ion-item", null, h("ion-avatar", { slot: "start" }, h("img", { src: this.selectedDivingSchool.photoURL })), h("ion-label", null, this.selectedDivingSchool.displayName))) : undefined, this.selectedAgency ? (h("ion-item", null, h("ion-avatar", { slot: "start" }, h("img", { src: this.selectedAgency.photoURL })), h("ion-label", null, this.selectedAgency.name))) : undefined, this.selectedCourse ? (h("ion-item", null, h("ion-avatar", { slot: "start" }, h("img", { src: this.selectedCourse.photoURL })), h("ion-label", null, this.selectedCourse.name))) : undefined, h("ion-item", { key: '4a7010f219df3fa3b94b5d81823941e7bb8a4cb2' }, h("ion-icon", { key: '670a6c8b8ea9124fe5c194e65680c63e7a89a63f', slot: "start", name: "navigate-outline" }), h("ion-label", { key: '373d116c5955d34f624f881913401a6c617f971a' }, this.divingClass.location.display_name)), h("ion-item", { key: 'a7610c02941956d50870ba1376c29566739b5d17' }, h("ion-icon", { key: '361dec93a995c154cc6720fc5c6b50b559f75273', slot: "start", name: "scan-outline" }), h("ion-label", { key: '8768591e663606e1e82f9e06c5d69aa1143ee03c' }, h("my-transl", { key: '7a1b3e95d538b032a3bd681ade4f93e66f06de6a', tag: "status", text: "Status" })), h("ion-note", { key: '4caffe9316fbafb994a4b3ad32e854271951092e', slot: "end" }, this.statusTitles[this.divingClass.status])), h("ion-list-header", { key: 'bfc21be9898f722055e82501212ee793bb8be5ed' }, h("my-transl", { key: 'f851db49bedd4a60ec1ca91ab6e7885dae765884', tag: "instructor", text: "Instructor" })), this.instructors.map((instructor) => (h("ion-item", null, instructor.photoURL ? (h("ion-avatar", { slot: "start" }, h("img", { src: instructor.photoURL }))) : (h("ion-icon", { slot: "start", name: "person" })), h("ion-label", null, instructor.displayName)))), this.divingClass.comments
                ? [
                    h("ion-list-header", null, h("my-transl", { tag: "comments", text: "Comments" })),
                    h("ion-item", null, h("ion-label", { class: "ion-text-wrap" }, this.divingClass.comments)),
                ]
                : undefined)), h("swiper-slide", { key: '3e09c303d7c8890fd37417c30a556f2ce019491e', class: "swiper-slide" }, h("app-diving-class-schedule", { key: '1ec2f1a66c31f88ce51afb8446b169a46b4f809b', divingClass: this.divingClass })), h("swiper-slide", { key: 'ba856ae41a8c1ca11cb7768ff61845fd49cea2ac', class: "swiper-slide" }, h("ion-grid", { key: '12836e5e5e11893791b2048940295c167a6b43d7' }, h("ion-row", { key: '9bf0b8e86b52b569f37be0db440dae798fe8ba2a', class: "ion-text-start" }, !this.userId ? (h("div", { style: {
                    marginTop: "10%",
                    marginLeft: "auto",
                    marginRight: "auto",
                } }, h("ion-card", null, h("ion-card-header", null, h("ion-card-title", null, h("my-transl", { tag: "please-login", text: "Please login to view this page" })))))) : (h("app-dive-class-bookings", { divingClass: this.divingClass, divingClassId: this.classid })))))))),
        ];
    }
    get el() { return getElement(this); }
};
PageDivingClassDetails.style = pageDivingClassDetailsCss;

export { PageDivingClassDetails as page_diving_class_details };

//# sourceMappingURL=page-diving-class-details.entry.js.map