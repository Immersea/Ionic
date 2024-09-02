import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { ac as DivingClassesService, n as DivingSchoolsService, U as UserService, i as DivingCentersService, m as DIVESCHOOLSSCOLLECTION, c as DIVECENTERSSCOLLECTION, b as USERPROFILECOLLECTION, T as TranslationService } from './utils-5cd4c7bb.js';
import { l as lodash } from './lodash-68d560b6.js';
import { d as dateFns } from './index-9b61a50b.js';
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
import './_commonjsHelpers-1a56c7bc.js';
import './user-cards-f5f720bb.js';
import './customerLocation-bbe1e349.js';

const appAdminDivingClassesCss = "app-admin-diving-classes{}";

const AppAdminDivingClasses = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userPublicProfilesList = [];
        this.divingCentersList = [];
        this.divingSchoolsList = [];
        this.filterByOrganisierId = undefined;
        this.filterByClasses = undefined;
        this.adminDivingClassesArray = [];
        this.updateView = false;
        this.creatingNewDivingClass = false;
        this.loadingDivingClasses = true;
        this.editingDivingClass = "";
    }
    async componentWillLoad() {
        this.loadingDivingClasses$ =
            DivingClassesService.creatingNewDivingClass$.subscribe((value) => {
                this.creatingNewDivingClass = value;
            });
        this.editingDivingClass$ =
            DivingClassesService.editingDivingClassId$.subscribe((value) => {
                this.editingDivingClass = value;
            });
        //load classes
        //if filterbyorganiserId  ==  loaded school -> load classes from school
        if (this.filterByOrganisierId &&
            this.filterByOrganisierId === DivingSchoolsService.selectedDivingSchoolId) {
            this.userDivingClasses$ =
                DivingSchoolsService.selectedDivingSchoolClasses$.subscribe((sub) => this.loadDivingClasses(sub));
        }
        else {
            this.userDivingClasses$ = UserService.userDivingClasses$.subscribe((sub) => this.loadDivingClasses(sub));
        }
        //load all users list
        this.userPublicProfilesList$ =
            UserService.userPublicProfilesList$.subscribe((collection) => {
                //update dive sites
                this.userPublicProfilesList = collection;
                this.filter();
            });
        //load all diving centers list
        this.divingCentersList$ = DivingCentersService.divingCentersList$.subscribe((collection) => {
            //update dive sites
            this.divingCentersList = collection;
            this.filter();
        });
        //load all diving schools list
        this.divingSchoolsList$ = DivingSchoolsService.divingSchoolsList$.subscribe((collection) => {
            //update dive sites
            this.divingSchoolsList = collection;
            this.filter();
        });
        this.userRoles$ = UserService.userRoles$.subscribe((roles) => {
            this.userRoles = roles;
            this.filter();
        });
    }
    disconnectedCallback() {
        this.userRoles$.unsubscribe();
        this.userDivingClasses$.unsubscribe();
        this.userPublicProfilesList$.unsubscribe();
        this.divingCentersList$.unsubscribe();
        this.divingSchoolsList$.unsubscribe();
        this.editingDivingClass$.unsubscribe();
        this.loadingDivingClasses$.unsubscribe();
    }
    async loadDivingClasses(userDivingClasses) {
        DivingClassesService.resetSkeletons();
        this.loadingDivingClasses = false;
        if (userDivingClasses) {
            let adminDivingClassesArray = [];
            Object.keys(userDivingClasses).forEach((key) => {
                let adminClass = userDivingClasses[key];
                adminClass.id = key;
                if (this.filterByOrganisierId &&
                    adminClass.organiser.id == this.filterByOrganisierId) {
                    adminDivingClassesArray.push(adminClass);
                }
                else if (!this.filterByOrganisierId) {
                    adminDivingClassesArray.push(adminClass);
                }
            });
            adminDivingClassesArray = lodash.exports.orderBy(adminDivingClassesArray, "date", "desc");
            this.adminDivingClassesArray = adminDivingClassesArray;
            this.filter();
        }
    }
    filter() {
        if (this.adminDivingClassesArray.length > 0) {
            //load organiser data
            this.adminDivingClassesArray.map((diveTrip) => {
                const organiser = diveTrip.organiser;
                switch (organiser.collectionId) {
                    case USERPROFILECOLLECTION:
                        organiser.item = this.userPublicProfilesList.find((user) => user.uid === organiser.id);
                        break;
                    case DIVECENTERSSCOLLECTION:
                        organiser.item = this.divingCentersList.find((dc) => dc.id === organiser.id);
                        break;
                    case DIVESCHOOLSSCOLLECTION:
                        organiser.item = this.divingSchoolsList.find((school) => school.id === organiser.id);
                        break;
                }
                if (this.userRoles) {
                    const role = this.userRoles.editorOf[diveTrip.id];
                    diveTrip.editor = role && role.roles && role.roles.length > 0;
                    diveTrip.owner = role && role.roles && role.roles.includes("owner");
                }
            });
            //filter by trips id for clients visualisation
            if (this.filterByClasses) {
                const tripsArray = Object.keys(this.filterByClasses);
                this.adminDivingClassesArray = this.adminDivingClassesArray.filter((trip) => tripsArray.includes(trip.id));
            }
            this.updateView = !this.updateView;
        }
    }
    update(event, id) {
        event.stopPropagation();
        DivingClassesService.presentDivingClassUpdate(null, null, id);
    }
    delete(event, id) {
        event.stopPropagation();
        DivingClassesService.deleteDivingClass(id);
    }
    render() {
        return (h(Host, { key: 'c1637fb323eb28940889bf010017521ce9a835c6' }, this.loadingDivingClasses
            ? [
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
            ]
            : undefined, this.creatingNewDivingClass ? (h("app-skeletons", { skeleton: "diveTrip" })) : undefined, this.adminDivingClassesArray.map((diveClass) => this.editingDivingClass == diveClass.id ? (h("app-skeletons", { skeleton: "diveTrip" })) : (h("ion-item", { button: true, onClick: () => DivingClassesService.pushDivingClass(diveClass.id), detail: true }, diveClass.organiser &&
            diveClass.organiser.item &&
            diveClass.organiser.item.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: diveClass.organiser.item.photoURL }))) : undefined, h("ion-label", null, h("h2", null, diveClass.displayName), h("h4", null, dateFns.format(diveClass.date, "PP")), diveClass.organiser &&
            diveClass.organiser.item &&
            diveClass.organiser.item.displayName ? (h("p", null, h("my-transl", { tag: "organiser", text: "Organiser" }), ": " + diveClass.organiser.item.displayName)) : undefined), diveClass.owner ? (h("ion-button", { fill: "clear", color: "danger", "icon-only": true, slot: "end", onClick: (ev) => this.delete(ev, diveClass.id) }, h("ion-icon", { name: "trash", slot: "end" }))) : undefined, diveClass.editor ? (h("ion-button", { fill: "clear", color: "divingclass", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, diveClass.id) }, h("ion-icon", { name: "create", slot: "end" }))) : undefined))), this.adminDivingClassesArray.length == 0 ? (h("ion-item", null, h("ion-label", null, h("h2", null, TranslationService.getTransl("no-dive-classes", "No diving classes yet. Look for your next class with our diving schools and instructors!"))))) : undefined));
    }
};
AppAdminDivingClasses.style = appAdminDivingClassesCss;

export { AppAdminDivingClasses as app_admin_diving_classes };

//# sourceMappingURL=app-admin-diving-classes.entry.js.map