import { r as registerInstance, h, k as getElement } from './index-d515af00.js';
import { U as UserService, T as TranslationService, ac as DivingClassesService } from './utils-5cd4c7bb.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { E as Environment } from './env-0a7fccce.js';
import { a as alertController } from './overlays-b3ceb97d.js';
import './map-e64442d7.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';
import './ionic-global-c07767bf.js';
import './utils-eff54c0c.js';
import './animation-a35abe6a.js';
import './index-51ff1772.js';
import './index-222db2aa.js';
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
import './framework-delegate-779ab78c.js';

const appDiveClassBookingsCss = "app-dive-class-bookings{width:100%;height:100%}";

const AppDiveClassBookings = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.availableSpots = [];
        this.divingClass = undefined;
        this.divingClassId = undefined;
        this.editable = false;
        this.isEditing = false;
        this.segment = 0;
        this.studentsList = undefined;
        this.waitingRequest = false;
        this.updateView = false;
        this.userBooking = undefined;
    }
    async updateStudentsList() {
        this.studentsList = [];
        this.availableSpots = [];
        this.usersList = [];
        let students = this.divingClass.students;
        for (let student of students) {
            let listItem = Object.assign(Object.assign({}, student), { user: await UserService.getMapDataUserDetails(student.uid) });
            //show all students only to organiser
            if (this.editable) {
                this.studentsList.push(listItem);
            }
            else if (listItem.status == "applied" ||
                listItem.status == "registered") {
                this.studentsList.push(listItem);
            }
            if (this.userId && student.uid === this.userId) {
                this.userBooking = student;
            }
        }
        if (this.divingClass.status == "active") {
            let registeredStudents = 0;
            this.divingClass.students.map((student) => {
                if (student.status == "registered") {
                    registeredStudents++;
                }
            });
            for (let index = 0; index < this.divingClass.numberOfStudents - registeredStudents; index++) {
                this.availableSpots.push(0);
            }
        }
        this.updateView = !this.updateView;
        return true;
    }
    componentWillLoad() {
        this.userId =
            UserService.userProfile && UserService.userProfile.uid
                ? UserService.userProfile.uid
                : null;
        if (this.userId) {
            this.updateStudentsList();
        }
        else {
            this.userSub = UserService.userProfile$.subscribe((user) => {
                this.userId = user && user.uid ? user.uid : null;
                this.updateStudentsList();
            });
        }
        this.segmentTitles = {
            cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
            applied: TranslationService.getTransl("applied", "Applied"),
            registered: TranslationService.getTransl("registered", "Registered"),
            denied: TranslationService.getTransl("denied", "Denied"),
        };
    }
    disconnectedCallback() {
        this.userSub.unsubscribe();
    }
    segmentChanged(ev) {
        if (ev.detail.value) {
            this.segment = lodash.exports.toNumber(ev.detail.value);
        }
    }
    async applyToClass() {
        const alert = await alertController.create({
            header: TranslationService.getTransl("apply-to-class", "Apply to this class"),
            message: TranslationService.getTransl("apply-to-class-message", "Please check first with the instructor eventual preconditions to apply to this class. Are you sure?"),
            buttons: [
                {
                    text: TranslationService.getTransl("ok", "OK"),
                    handler: async () => {
                        this.userBooking = {
                            uid: this.userId,
                            status: "applied",
                            evaluations: [],
                        };
                        this.saveBooking(this.userBooking);
                    },
                },
                {
                    text: TranslationService.getTransl("cancel", "Cancel"),
                    role: "cancel",
                },
            ],
        });
        alert.present();
    }
    async saveBooking(booking) {
        try {
            this.waitingRequest = true;
            const bookings = await DivingClassesService.sendBookingRequest(this.divingClassId, booking.uid, booking.status, booking.evaluations);
            this.waitingRequest = false;
            this.divingClass.students = bookings;
            this.updateStudentsList();
        }
        catch (error) {
            this.waitingRequest = false;
        }
    }
    updateBooking(i, ev) {
        const search = this.studentsList[i];
        const item = this.divingClass.students.find((student) => student.uid === search.uid);
        item.status = ev.detail.value;
    }
    editStudents() {
        this.isEditing = true;
    }
    saveStudents() {
        this.isEditing = false;
        this.updateStudentsList();
    }
    render() {
        return (h("ion-list", { key: 'a1f5505333c708dc5f754e2920c21c05ff728414' }, h("ion-item", { key: 'b40d56ce801d388957bf300141269995d85f4a78', lines: "none" }, h("ion-label", { key: 'fe2624437222be8a2476de32cf1da2ef415fbe0a' }, TranslationService.getTransl("max-participants", "Max xxx participants", { xxx: this.divingClass.numberOfStudents })), this.editable &&
            this.divingClass.students &&
            this.divingClass.students.length > 0 ? (!this.isEditing ? (h("ion-button", { slot: "end", onClick: () => this.editStudents() }, h("my-transl", { tag: "edit", text: "Edit" }))) : ([
            h("ion-button", { slot: "end", onClick: () => this.saveStudents() }, h("my-transl", { tag: "save", text: "Save" })),
        ])) : undefined), !this.editable &&
            !this.waitingRequest &&
            this.divingClass.status == "active" &&
            (!this.userBooking ||
                (this.userBooking && this.userBooking.status == null)) ? (h("ion-button", { expand: "block", onClick: () => this.applyToClass() }, h("my-transl", { tag: "apply-to-class", text: "Apply to this class" }))) : undefined, this.userBooking &&
            (this.userBooking.status == "cancelled" ||
                this.userBooking.status == "denied") ? (h("ion-button", { expand: "block", color: "warning" }, h("my-transl", { tag: this.userBooking.status, text: this.userBooking.status }))) : undefined, this.waitingRequest ? (h("app-skeletons", { skeleton: "diveTripBooking" })) : undefined, this.studentsList.map((student, k) => student.uid == this.userId && this.waitingRequest ? (h("app-skeletons", { skeleton: "diveTripBooking" })) : (h("ion-item", null, !this.isEditing && student.user.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: student.user.photoURL }))) : undefined, h("ion-label", null, student.user.displayName), !this.isEditing ? (h("ion-note", { slot: "end" }, TranslationService.getTransl(student.status, student.status))) : (h("ion-segment", { style: {
                maxWidth: "40%",
                marginLeft: "15%",
            }, slot: "end", mode: "ios", color: Environment.getAppColor(), onIonChange: (ev) => this.updateBooking(k, ev), value: student.status }, h("ion-segment-button", { value: "cancelled" }, h("my-transl", { tag: "cancelled", text: "Cancelled" })), h("ion-segment-button", { value: "applied" }, h("my-transl", { tag: "applied", text: "Applied" })), h("ion-segment-button", { value: "registered" }, h("my-transl", { tag: "registered", text: "Registered" })), h("ion-segment-button", { value: "denied" }, h("my-transl", { tag: "denied", text: "Denied" }))))))), this.availableSpots.map(() => (h("ion-item", null, h("ion-icon", { slot: "start", name: "person-add-outline" }), h("ion-label", null, h("my-transl", { tag: "available", text: "Available" })))))));
    }
    get el() { return getElement(this); }
};
AppDiveClassBookings.style = appDiveClassBookingsCss;

export { AppDiveClassBookings as app_dive_class_bookings };

//# sourceMappingURL=app-dive-class-bookings.entry.js.map