import { r as registerInstance, h, j as Host } from './index-d515af00.js';
import { a9 as DiveTripsService, n as DivingSchoolsService, i as DivingCentersService, U as UserService, p as DiveCommunitiesService, m as DIVESCHOOLSSCOLLECTION, o as DIVECOMMUNITIESCOLLECTION, c as DIVECENTERSSCOLLECTION, b as USERPROFILECOLLECTION, T as TranslationService } from './utils-5cd4c7bb.js';
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

const appAdminDiveTripsCss = "app-admin-dive-trips{}";

const AppAdminDiveTrips = class {
    constructor(hostRef) {
        registerInstance(this, hostRef);
        this.userPublicProfilesList = [];
        this.divingCentersList = [];
        this.diveCommunitiesList = [];
        this.divingSchoolsList = [];
        this.filterByOrganisierId = undefined;
        this.filterByTrips = undefined;
        this.adminDiveTripsArray = [];
        this.updateView = false;
        this.creatingNewDiveTrip = false;
        this.loadingDiveTrips = true;
        this.editingDiveTrip = "";
    }
    async componentWillLoad() {
        this.loadingDiveTrips$ = DiveTripsService.creatingNewDiveTrip$.subscribe((value) => {
            this.creatingNewDiveTrip = value;
        });
        this.editingDiveTrip$ = DiveTripsService.editingDiveTripId$.subscribe((value) => {
            this.editingDiveTrip = value;
        });
        //load classes
        //if filterbyorganiserId  ==  loaded school/center -> load classes from school or diving center
        if (this.filterByOrganisierId) {
            if (this.filterByOrganisierId ===
                DivingSchoolsService.selectedDivingSchoolId) {
                this.userDiveTrips$ =
                    DivingSchoolsService.selectedDivingSchoolTrips$.subscribe((sub) => this.loadDiveTrips(sub));
            }
            else if (this.filterByOrganisierId ===
                DivingCentersService.selectedDivingCenterId) {
                this.userDiveTrips$ =
                    DivingCentersService.selectedDivingCenterTrips$.subscribe((sub) => this.loadDiveTrips(sub));
            }
        }
        else {
            this.userDiveTrips$ = UserService.userDiveTrips$.subscribe((sub) => this.loadDiveTrips(sub));
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
        //load all dive communities list
        this.diveCommunitiesList$ =
            DiveCommunitiesService.diveCommunitiesList$.subscribe((collection) => {
                //update dive sites
                this.diveCommunitiesList = collection;
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
        this.userDiveTrips$.unsubscribe();
        this.userPublicProfilesList$.unsubscribe();
        this.divingCentersList$.unsubscribe();
        this.diveCommunitiesList$.unsubscribe();
        this.divingSchoolsList$.unsubscribe();
        this.editingDiveTrip$.unsubscribe();
        this.loadingDiveTrips$.unsubscribe();
    }
    loadDiveTrips(userDiveTrips) {
        DiveTripsService.resetSkeletons();
        this.loadingDiveTrips = false;
        if (userDiveTrips) {
            let adminDiveTripsArray = [];
            Object.keys(userDiveTrips).forEach((key) => {
                let trip = userDiveTrips[key];
                trip.id = key;
                if (this.filterByOrganisierId &&
                    trip.organiser.id == this.filterByOrganisierId) {
                    adminDiveTripsArray.push(trip);
                }
                else if (!this.filterByOrganisierId) {
                    adminDiveTripsArray.push(trip);
                }
            });
            adminDiveTripsArray = lodash.exports.orderBy(adminDiveTripsArray, "date", "desc");
            this.adminDiveTripsArray = adminDiveTripsArray;
            this.filter();
        }
    }
    filter() {
        if (this.adminDiveTripsArray.length > 0) {
            //load organiser data
            this.adminDiveTripsArray.map((diveTrip) => {
                const organiser = diveTrip.organiser;
                switch (organiser.collectionId) {
                    case USERPROFILECOLLECTION:
                        organiser.item = this.userPublicProfilesList.find((user) => user.uid === organiser.id);
                        break;
                    case DIVECENTERSSCOLLECTION:
                        organiser.item = this.divingCentersList.find((dc) => dc.id === organiser.id);
                        break;
                    case DIVECOMMUNITIESCOLLECTION:
                        organiser.item = this.diveCommunitiesList.find((dc) => dc.id === organiser.id);
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
            if (this.filterByTrips) {
                const tripsArray = Object.keys(this.filterByTrips);
                this.adminDiveTripsArray = this.adminDiveTripsArray.filter((trip) => tripsArray.includes(trip.id));
            }
            this.updateView = !this.updateView;
        }
    }
    update(event, id) {
        event.stopPropagation();
        DiveTripsService.presentDiveTripUpdate(null, null, id);
    }
    delete(event, id) {
        event.stopPropagation();
        DiveTripsService.deleteDiveTrip(id);
    }
    render() {
        return (h(Host, { key: '2299fd731b41d739476c939b71f59670e09dc502' }, this.loadingDiveTrips
            ? [
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
                h("app-skeletons", { skeleton: "diveTrip" }),
            ]
            : undefined, this.creatingNewDiveTrip ? (h("app-skeletons", { skeleton: "diveTrip" })) : undefined, this.adminDiveTripsArray.map((diveTrip) => this.editingDiveTrip == diveTrip.id ? (h("app-skeletons", { skeleton: "diveTrip" })) : (h("ion-item", { button: true, onClick: () => DiveTripsService.pushDiveTrip(diveTrip.id), detail: true }, diveTrip.organiser &&
            diveTrip.organiser.item &&
            diveTrip.organiser.item.photoURL ? (h("ion-avatar", { slot: "start" }, h("ion-img", { src: diveTrip.organiser.item.photoURL }))) : undefined, h("ion-label", null, h("h2", null, diveTrip.displayName), h("h4", null, dateFns.format(diveTrip.date, "PP")), diveTrip.organiser &&
            diveTrip.organiser.item &&
            diveTrip.organiser.item.displayName ? (h("p", null, h("my-transl", { tag: "organiser", text: "Organiser" }), ": " + diveTrip.organiser.item.displayName)) : undefined), diveTrip.owner ? (h("ion-button", { fill: "clear", color: "danger", "icon-only": true, slot: "end", onClick: (ev) => this.delete(ev, diveTrip.id) }, h("ion-icon", { name: "trash", slot: "end" }))) : undefined, diveTrip.editor ? (h("ion-button", { fill: "clear", color: "divetrip", "icon-only": true, slot: "end", onClick: (ev) => this.update(ev, diveTrip.id) }, h("ion-icon", { name: "create", slot: "end" }))) : undefined))), this.adminDiveTripsArray.length == 0 ? (h("ion-item", null, h("ion-label", null, h("h2", null, TranslationService.getTransl("no-dive-trips", "No dive trips yet. Click on the '+' button to create your first one."))))) : undefined));
    }
};
AppAdminDiveTrips.style = appAdminDiveTripsCss;

export { AppAdminDiveTrips as app_admin_dive_trips };

//# sourceMappingURL=app-admin-dive-trips.entry.js.map