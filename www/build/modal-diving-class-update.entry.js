import { r as registerInstance, h, j as Host, k as getElement } from './index-d515af00.js';
import { T as TranslationService, n as DivingSchoolsService, m as DIVESCHOOLSSCOLLECTION, B as SystemService, ac as DivingClassesService, ad as DivingClass, U as UserService } from './utils-cbf49763.js';
import './index-be90eba5.js';
import { l as lodash } from './lodash-68d560b6.js';
import { S as Swiper } from './swiper-a30cd476.js';
import { a as alertController, m as modalController } from './overlays-b3ceb97d.js';
import './env-9be68260.js';
import './ionic-global-c07767bf.js';
import './map-dae4acde.js';
import './_commonjsHelpers-1a56c7bc.js';
import './index-9b61a50b.js';
import './user-cards-f5f720bb.js';
import './customerLocation-71248eea.js';
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

const modalDivingClassUpdateCss = "modal-diving-class-update ion-list{width:100%}modal-diving-class-update app-diving-class-schedule{width:100%}modal-diving-class-update ion-segment-button{--color-checked:var(--ion-color-divingclass-contrast)}";

const ModalDivingClassUpdate = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.divingClassId = undefined;
        this.collectionId = undefined;
        this.organiserId = undefined;
        this.divingClass = undefined;
        this.updateView = true;
        this.validClass = false;
        this.selectedCourse = undefined;
        this.addressText = undefined;
        this.titles = [
            { tag: "details" },
            { tag: "schedule" },
            { tag: "team" },
            { tag: "students" },
        ];
        this.slider = undefined;
        this.selectGotFocus = false;
    }
    async componentWillLoad() {
        await this.loadDivingClass();
        this.statusTitles = {
            active: TranslationService.getTransl("active", "Active"),
            closed: TranslationService.getTransl("closed", "Closed"),
            cancelled: TranslationService.getTransl("cancelled", "Cancelled"),
        };
        this.placeholder = TranslationService.getTransl("insert-title", "Insert title");
        //load diving school details
        //check if organiser is the loaded diving school
        if (this.organiserId == DivingSchoolsService.selectedDivingSchoolId) {
            this.divingSchool = DivingSchoolsService.selectedDivingSchool;
        }
        else if (this.collectionId == DIVESCHOOLSSCOLLECTION) {
            //load diving school
            this.divingSchool = await DivingSchoolsService.getDivingSchool(this.organiserId);
        }
        this.divingAgencies = SystemService.systemPreferences.divingAgencies;
        this.divingCourses = await SystemService.getDivingCoursesForSchool(this.divingSchool);
        //select diving class course
        if (this.divingClass && this.divingClass.course) {
            this.selectedCourse = this.divingCourses.find((course) => course.agencyId === this.divingClass.course.agencyId &&
                course.id === this.divingClass.course.certificationId);
        }
    }
    async loadDivingClass() {
        if (this.divingClassId) {
            this.divingClass = await DivingClassesService.getDivingClass(this.divingClassId);
            this.collectionId = this.divingClass.organiser.collectionId;
            this.organiserId = this.divingClass.organiser.id;
        }
        else {
            this.divingClass = new DivingClass();
            this.divingClass.organiser = {
                collectionId: this.collectionId,
                id: this.organiserId,
            };
            this.divingClass.users = {
                [UserService.userRoles.uid]: ["owner", "instructor"],
            };
        }
        this.addressText =
            this.divingClass.location && this.divingClass.location.display_name
                ? this.divingClass.location.display_name
                : null;
    }
    async componentDidLoad() {
        this.slider = new Swiper(".slider-dive-class", {
            speed: 400,
            spaceBetween: 100,
            allowTouchMove: false,
            autoHeight: true,
            on: {
                slideChange: () => {
                    this.slider ? this.slider.updateAutoHeight() : null;
                },
            },
        });
        this.appBookings = this.el.getElementsByTagName("app-dive-class-bookings")[0];
        this.appSchedule = this.el.getElementsByTagName("app-diving-class-schedule")[0];
        this.createCourseSelectOptions();
        this.validateClass();
    }
    createCourseSelectOptions() {
        //create select options
        this.selectCourseElement = this.el.querySelector("#dive-course-select");
        const customSiteTypePopoverOptions = {
            header: TranslationService.getTransl("diving-course", "Diving Course"),
        };
        //remove previously defined options
        const selectOptions = Array.from(this.selectCourseElement.getElementsByTagName("ion-select-option"));
        selectOptions.map((option) => {
            this.selectCourseElement.removeChild(option);
        });
        this.selectCourseElement.interfaceOptions = customSiteTypePopoverOptions;
        lodash.exports.each(this.divingCourses, (course) => {
            const selectOption = document.createElement("ion-select-option");
            selectOption.value = course;
            selectOption.textContent =
                this.divingAgencies[course.agencyId].name + " - " + course.name;
            this.selectCourseElement.appendChild(selectOption);
        });
    }
    async changeCourse(course) {
        if (this.selectGotFocus &&
            this.divingClass &&
            this.divingClass.activities &&
            this.divingClass.activities.length > 0) {
            const alert = await alertController.create({
                header: TranslationService.getTransl("diving-course", "Diving Course"),
                message: TranslationService.getTransl("update-class-activities", "This will update all class activities! Are you sure?"),
                buttons: [
                    {
                        text: TranslationService.getTransl("ok", "OK"),
                        handler: () => {
                            this.selectGotFocus = false;
                            this.updateCourseDetails(course);
                        },
                    },
                    {
                        text: TranslationService.getTransl("cancel", "Cancel"),
                        handler: () => {
                            this.selectGotFocus = false;
                            this.createCourseSelectOptions();
                            this.selectedCourse = Object.assign({}, this.selectedCourse);
                        },
                        role: "cancel",
                        cssClass: "secondary",
                    },
                ],
            });
            alert.present();
        }
        else {
            this.updateCourseDetails(course);
        }
    }
    updateCourseDetails(course) {
        this.selectedCourse = course;
        this.divingClass.name =
            this.divingAgencies[this.selectedCourse.agencyId].name +
                " - " +
                this.selectedCourse.name;
        this.divingClass.activities = lodash.exports.cloneDeep(course.activities);
        this.divingClass.numberOfStudents = course.numberOfStudents;
        this.divingClass.course = {
            certificationId: course.id,
            agencyId: course.agencyId,
        };
        this.appBookings.updateStudentsList();
        this.appSchedule.updateClassSchedule();
        this.validateClass();
    }
    selectLocation(location) {
        this.divingClass.location = location;
        this.addressText = location.display_name;
        this.validateClass();
    }
    updateStudents(students) {
        this.divingClass.numberOfStudents = lodash.exports.toNumber(students);
        this.appBookings.updateStudentsList();
        this.validateClass();
    }
    updateStatus(status) {
        this.divingClass.status = status;
        this.validateClass();
    }
    handleChange(ev) {
        this.divingClass[ev.detail.name] = ev.detail.value;
        this.validateClass();
    }
    validateClass() {
        this.validClass =
            lodash.exports.isString(this.divingClass.name) &&
                this.divingClass.numberOfStudents > 0 &&
                this.divingClass.location &&
                lodash.exports.isString(this.divingClass.location.display_name) &&
                lodash.exports.isString(this.divingClass.status) &&
                Object.keys(this.divingClass.schedule).length > 0;
        this.updateView = !this.updateView;
    }
    async save() {
        await DivingClassesService.updateDivingClass(this.divingClassId, this.divingClass);
        return modalController.dismiss(false);
    }
    async cancel() {
        return modalController.dismiss(true);
    }
    render() {
        return (h(Host, { key: '9016f7906d487c98436f129ff678ea79246112ec' }, this.selectedCourse && this.selectedCourse.photoURL ? (h("ion-header", null, h("app-item-cover", { item: this.selectedCourse }))) : undefined, this.selectedCourse ? (h("ion-header", null, h("ion-toolbar", { color: "divingclass" }, h("ion-title", null, this.divingClass.name)))) : undefined, h("app-header-segment-toolbar", { key: 'c6f9cb9d7b612e190af172eababc4e4f2e42b979', color: "divingclass", swiper: this.slider, titles: this.titles }), h("ion-content", { key: '3ce33e68311ad6b12d04359e5ce0c258138b4503', class: "slides" }, h("swiper-container", { key: 'b3a7926b9a9376cc26d026ef083c95d272bc5027', class: "slider-dive-class swiper" }, h("swiper-wrapper", { key: 'b316638b0b1ae23e875815cc012547af12477325', class: "swiper-wrapper" }, h("swiper-slide", { key: '2dc1ed16a8879e35ae15fcbc2e8a1cdb7b21ef68', class: "swiper-slide" }, h("ion-list", { key: 'c2ff426e0c5223e3a9e6d66f2c0aadb429f190a8' }, h("ion-item", { key: 'cdc49cca72595ba50f60c6d8040e2bfd4321fd50' }, h("ion-label", { key: 'e2851127c612ca6b762c98911cac9577f8602a8c' }, h("my-transl", { key: '6569f478f4957c4cd63d05f45f00ad529b15c07e', tag: "diving-course", text: "Diving Course" })), h("ion-select", { key: '2b27ef8032aa4cd6a95b81ab81c6d7344ce8a23b', id: "dive-course-select", interface: "action-sheet", onIonChange: (ev) => this.changeCourse(ev.detail.value), onIonFocus: () => (this.selectGotFocus = true), placeholder: TranslationService.getTransl("select", "Select"), value: this.selectedCourse })), h("app-form-item", { key: 'd7850694431b9d0d9d4d3bb26842e10f1a8e68bf', "label-tag": "name", "label-text": "Name", value: this.divingClass.name, name: "name", "input-type": "text", onFormItemChanged: (ev) => this.handleChange(ev), validator: ["required"] }), h("ion-item", { key: 'f16a3d9a3825d1a917ac78b1e101e7dd9f7bd3b6' }, h("ion-label", { key: 'c73d6c15cb80d2f8c12e2de6fa47f18a1f38016a' }, h("my-transl", { key: '7a217dabbc61a613e3134e2cfb60db19569b7385', tag: "number-of-students", text: "Number of Students" })), h("ion-select", { key: 'a3093efb6cd70fd064d1bd03dcbdee484d1b5a4f', value: this.divingClass.numberOfStudents, onIonChange: (ev) => this.updateStudents(ev.detail.value), interface: "popover" }, h("ion-select-option", { key: 'c9d82a38404a21f6bcd131a7d6ab0d1cbc29ad8f', value: 1 }, "1"), h("ion-select-option", { key: '32d92619248a384f08b16dd75497a0afe2b4c631', value: 2 }, "2"), h("ion-select-option", { key: '690b6f8bb0a863031f3771f43d042624c38693db', value: 3 }, "3"), h("ion-select-option", { key: '9516c529ebc911f989044127d70e0475fda9c29c', value: 4 }, "4"), h("ion-select-option", { key: 'c88f3829d8a8337cf3db250377243043800e486a', value: 5 }, "5"), h("ion-select-option", { key: '0316fce6d7a3c90e21f761386d9920a32b44787b', value: 6 }, "6"), h("ion-select-option", { key: 'ae5f3394809c21f69b8b9f0e2a05f0a061164895', value: 7 }, "7"), h("ion-select-option", { key: '25fd8a4fce7106e5d8844f971986941ff47a637b', value: 8 }, "8"), h("ion-select-option", { key: '52b8edf4f8daf60d83b541da4f4cba742a270fa8', value: 9 }, "9"), h("ion-select-option", { key: '3a2fdc9004264bc46515559c821b46ad871c2295', value: 10 }, "10"), h("ion-select-option", { key: '965974708aeb5981e683b7289a3f89fbcc7be0ed', value: 11 }, "11"), h("ion-select-option", { key: '0e18b5b92cf9f954092e6c9a14de1d2b0252bd98', value: 12 }, "12"), h("ion-select-option", { key: '2a781aeb43754e35bde9922bfb8130691bc0e0ea', value: 13 }, "13"), h("ion-select-option", { key: 'fbd42923600f74a27fdec05225601042f5dd0799', value: 14 }, "14"), h("ion-select-option", { key: 'e6dfcf701b8658fa8a376a51593af6e2094202d5', value: 15 }, "15"))), h("app-form-item", { key: '40377088bbe9a1dc2ef14334303212dba84b86aa', "label-tag": "location", "label-text": "Location", value: this.addressText, name: "location", "input-type": "text", onFormItemChanged: (ev) => (this.addressText = ev.detail.value), onFormLocationSelected: (ev) => this.selectLocation(ev.detail), validator: ["address"] }), h("ion-item", { key: '65fffd729ae6bd30ae0643912f5363d1a57a7864' }, h("ion-label", { key: '1ebdb2520ddb6eba7d2d37831534a7822d9a2807' }, h("my-transl", { key: '154e821ef438ff5ae5e9bdd687355e922dd02742', tag: "status", text: "Status" })), h("ion-select", { key: 'c7ef1699cb9a40b03788ec254214873d897ae81d', value: this.divingClass.status, onIonChange: (ev) => this.updateStatus(ev.detail.value), interface: "popover" }, h("ion-select-option", { key: 'b4aa2f72868b76a371003f6f591e5b521d584b42', value: "active" }, this.statusTitles.active), h("ion-select-option", { key: 'a75f0849d8de19f3abd8f9967bcbcc5ed7024e10', value: "closed" }, this.statusTitles.closed), h("ion-select-option", { key: '4cf5f7ae10d92858e2fa7f79c3dcd1d58a2a17d1', value: "cancelled" }, this.statusTitles.cancelled))), h("app-form-item", { key: '0f4a8fd4243b36154e2525c48cf640ba8ba27a5e', "label-tag": "comments", "label-text": "Comments", value: this.divingClass.comments, name: "comments", "input-type": "text", textRows: 4, onFormItemChanged: (ev) => this.handleChange(ev), validator: [] }))), h("swiper-slide", { key: '162312fbb8d93222410abfa3884e28ded8da9561', class: "swiper-slide" }, h("app-diving-class-schedule", { key: '12b9f207491bf1d855c5e3db63c4a28049fdb770', divingClass: this.divingClass, editable: true, onScheduleEmit: () => this.validateClass() })), h("swiper-slide", { key: 'd6266271a62a39faf2ffa1295c10718f5a4c325a', class: "swiper-slide" }, h("app-users-list", { key: '82942b580a7d2a966d9e76fbb0c96f1c5f6578ce', item: this.divingClass, editable: true, show: ["owner", "divemaster", "instructor"] })), h("swiper-slide", { key: 'c4b09c37be700c229c349139cb2dbb8075cecbe0', class: "swiper-slide" }, h("app-dive-class-bookings", { key: 'f42c3e71f16dbf848479f4e81bef0ef1ea52a4dc', divingClass: this.divingClass, divingClassId: this.divingClassId, editable: true }))))), h("app-modal-footer", { key: 'bc30d82a25cbc5b2bf471ddaa32c1a11a3c8045b', disableSave: !this.validClass, onCancelEmit: () => this.cancel(), onSaveEmit: () => this.save() })));
    }
    get el() { return getElement(this); }
};
ModalDivingClassUpdate.style = modalDivingClassUpdateCss;

export { ModalDivingClassUpdate as modal_diving_class_update };

//# sourceMappingURL=modal-diving-class-update.entry.js.map